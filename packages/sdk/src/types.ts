/** Weight of a reserve report. Higher is stronger. Mirrors plimsoll_types::Tier. */
export enum Tier {
  Transcribed = 1,
  IssuerSigned = 2,
  AuditorSigned = 3,
}

/** What a registered address may post. Mirrors plimsoll_types::Role. */
export enum Role {
  Auditor = 1,
  Transcriber = 2,
  SupplyPoster = 3,
}

export interface NetworkConfig {
  rpcUrl: string;
  networkPassphrase: string;
  coverageLedgerId: string;
  reporterRegistryId: string;
  horizonUrl?: string;
}

export interface AssetRecord {
  sac: string;
  code: string;
  issuer: string;
  listedAt: number;
}

export interface SupplySnapshot {
  /** Smallest units (7 decimals for classic assets). */
  amount: bigint;
  ledger: number;
  timestamp: number;
  breakdownHash: string;
  poster: string;
}

export interface ReserveReport {
  amount: bigint;
  asOf: number;
  postedAt: number;
  tier: Tier;
  reporter: string;
  docHash: string;
  docUri: string;
}

export interface Coverage {
  /** 10_000 = 100%. 4_294_967_295 means nothing is owed. */
  bps: number;
  supply: bigint;
  reserves: bigint;
  tier: Tier;
  supplyLedger: number;
  supplyTimestamp: number;
  reportAsOf: number;
}

export interface ReporterInfo {
  role: Role;
  name: string;
  addedAt: number;
}

/** bps value the contract returns when supply is zero. */
export const NOTHING_OWED_BPS = 4_294_967_295;
