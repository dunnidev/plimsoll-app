import {
  IndexerClient,
  PlimsollContracts,
  Tier,
  tierFromName,
  type IndexerAsset,
  type IndexerToml,
} from "@plimsoll/sdk";
import { config } from "./config";

/** One report, normalised from either source. Times are unix seconds. */
export interface ReportView {
  tier: Tier;
  amount: bigint;
  asOf: number;
  postedAt: number;
  reporter: string;
  docHash: string;
  docUri: string;
  txHash?: string;
}

export interface SupplyView {
  amount: bigint;
  ledger: number;
  postedAt: number;
  breakdownHash: string;
  poster: string;
  txHash?: string;
}

export interface CoverageView {
  bps: number;
  tier: Tier;
  supply: bigint;
  reserves: bigint;
  supplyPostedAt: number;
  reportAsOf: number;
}

export interface AssetView {
  sac: string;
  code: string;
  issuer: string;
  supply: SupplyView | null;
  reports: Partial<Record<Tier, ReportView>>;
  coverage: CoverageView | null;
  toml: IndexerToml | null;
  source: "indexer" | "chain";
}

export const contracts = new PlimsollContracts(config.network);
export const indexer = config.indexerUrl ? new IndexerClient(config.indexerUrl) : null;

const secs = (iso: string) => Math.floor(new Date(iso).getTime() / 1000);

function fromIndexer(a: IndexerAsset): AssetView {
  const reports: AssetView["reports"] = {};
  for (const r of Object.values(a.reports)) {
    if (!r) continue;
    const tier = tierFromName(r.tier);
    if (tier === undefined) continue;
    reports[tier] = {
      tier,
      amount: BigInt(r.amount),
      asOf: secs(r.as_of),
      postedAt: secs(r.posted_at),
      reporter: r.reporter,
      docHash: r.doc_hash,
      docUri: r.doc_uri,
      txHash: r.tx_hash,
    };
  }
  const c = a.coverage;
  return {
    sac: a.sac,
    code: a.code,
    issuer: a.issuer,
    supply: a.supply && {
      amount: BigInt(a.supply.amount),
      ledger: a.supply.ledger,
      postedAt: secs(a.supply.posted_at),
      breakdownHash: a.supply.breakdown_hash,
      poster: a.supply.poster,
      txHash: a.supply.tx_hash,
    },
    reports,
    coverage: c && {
      bps: c.bps ?? 4_294_967_295,
      tier: tierFromName(c.tier) ?? Tier.Transcribed,
      supply: BigInt(c.supply),
      reserves: BigInt(c.reserves),
      supplyPostedAt: secs(c.supply_posted_at),
      reportAsOf: secs(c.report_as_of),
    },
    toml: a.toml,
    source: "indexer",
  };
}

/** Read one asset straight from the contracts. */
export async function loadFromChain(sac: string): Promise<AssetView | null> {
  const asset = await contracts.getAsset(sac);
  if (!asset) return null;
  const tiers = [Tier.Transcribed, Tier.IssuerSigned, Tier.AuditorSigned];
  const [supply, coverage, ...reportList] = await Promise.all([
    contracts.getSupply(sac),
    contracts.coverage(sac, Tier.Transcribed),
    ...tiers.map((t) => contracts.getReport(sac, t)),
  ]);
  const reports: AssetView["reports"] = {};
  for (const r of reportList) if (r) reports[r.tier] = r;
  return {
    sac,
    code: asset.code,
    issuer: asset.issuer,
    supply: supply && {
      amount: supply.amount,
      ledger: supply.ledger,
      postedAt: supply.timestamp,
      breakdownHash: supply.breakdownHash,
      poster: supply.poster,
    },
    reports,
    coverage: coverage && {
      bps: coverage.bps,
      tier: coverage.tier,
      supply: coverage.supply,
      reserves: coverage.reserves,
      supplyPostedAt: coverage.supplyTimestamp,
      reportAsOf: coverage.reportAsOf,
    },
    toml: null,
    source: "chain",
  };
}

/** All assets: from the indexer when configured, otherwise from the chain. */
export async function loadAssets(): Promise<AssetView[]> {
  if (indexer) {
    try {
      return (await indexer.listAssets()).map(fromIndexer);
    } catch (err) {
      console.warn("Indexer unavailable, reading from chain", err);
    }
  }
  const all = await Promise.all(config.chainAssets.map((sac) => loadFromChain(sac).catch(() => null)));
  return all.filter((a): a is AssetView => a !== null);
}

export async function loadAsset(sac: string): Promise<AssetView | null> {
  if (indexer) {
    try {
      return fromIndexer(await indexer.getAsset(sac));
    } catch (err) {
      console.warn("Indexer unavailable, reading from chain", err);
    }
  }
  return loadFromChain(sac);
}
