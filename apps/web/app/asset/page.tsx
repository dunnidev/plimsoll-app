"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import {
  Tier,
  ago,
  bpsToPercent,
  formatUnits,
  matchesHash,
  parseBreakdown,
  sha256Hex,
  shortAddress,
  tierLabel,
  type SupplyBreakdown,
} from "@plimsoll/sdk";
import { Gauge, Skeleton, Stat, StatusPill, TierPill, nowSecs, ratioText, statusOf } from "@/components/ui";
import { config, explorer } from "@/lib/config";
import { contracts, indexer, loadAsset, type AssetView, type ReportView } from "@/lib/data";

export default function AssetPage() {
  return (
    <Suspense fallback={<Skeleton height={40} width="40%" />}>
      <AssetDetail />
    </Suspense>
  );
}

function AssetDetail() {
  const sac = useSearchParams().get("sac") ?? "";
  const [asset, setAsset] = useState<AssetView | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(nowSecs());

  useEffect(() => {
    if (!sac) return;
    loadAsset(sac)
      .then((a) => {
        setAsset(a);
        setNow(nowSecs());
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, [sac]);

  if (!sac) {
    return <p className="notice notice-info">No asset selected. <Link href="/">Back to all assets</Link>.</p>;
  }
  if (error) return <p className="notice notice-bad" role="alert">Could not load this asset: {error}</p>;
  if (asset === undefined) {
    return (
      <div style={{ display: "grid", gap: 14 }}>
        <Skeleton height={40} width="30%" />
        <Skeleton height={60} width="45%" />
        <Skeleton height={14} />
      </div>
    );
  }
  if (asset === null) {
    return (
      <p className="notice notice-info">
        This asset is not listed on the coverage ledger. <Link href="/list/">List it</Link>.
      </p>
    );
  }

  const c = asset.coverage;
  const status = statusOf(c?.bps, c?.reportAsOf, now);
  const tiers = [Tier.AuditorSigned, Tier.IssuerSigned, Tier.Transcribed];

  return (
    <>
      <p className="sub">
        <Link href="/">All assets</Link> / {asset.code}
      </p>
      <div className="spread">
        <div>
          <h1 style={{ marginBottom: 4 }}>{asset.code}</h1>
          <div className="sub">
            Issuer{" "}
            <a className="mono" href={explorer.account(asset.issuer)} target="_blank" rel="noreferrer">
              {shortAddress(asset.issuer, 6)}
            </a>
            {asset.toml?.home_domain ? <> · {asset.toml.home_domain}</> : null}
            {asset.toml?.org_name ? <> · {asset.toml.org_name}</> : null}
          </div>
        </div>
        <div className="row">
          <StatusPill status={status} />
          {c ? <TierPill tier={c.tier} /> : null}
        </div>
      </div>

      <section className="card mt" aria-labelledby="coverage-h">
        <h2 id="coverage-h" className="sr-only">Coverage</h2>
        <div className="spread">
          <div>
            <div className="ratio" style={{ fontSize: "2.6rem" }}>{ratioText(c?.bps)}</div>
            <div className="sub">
              {c
                ? `${formatUnits(c.reserves)} in reserves against ${formatUnits(c.supply)} circulating`
                : "Needs both a supply snapshot and a reserve report."}
            </div>
          </div>
          <LiveCheck sac={asset.sac} />
        </div>
        <div className="mt">
          <Gauge bps={c?.bps} status={status} />
        </div>
      </section>

      <div className="stats mt">
        <Stat
          label="Circulating supply"
          value={asset.supply ? formatUnits(asset.supply.amount) : "—"}
          sub={asset.supply ? `at ledger ${asset.supply.ledger.toLocaleString()}` : "not posted yet"}
        />
        <Stat
          label="Supply posted"
          value={asset.supply ? ago(now - asset.supply.postedAt) : "—"}
          sub={
            asset.supply?.txHash ? (
              <a href={explorer.tx(asset.supply.txHash)} target="_blank" rel="noreferrer">transaction</a>
            ) : undefined
          }
        />
        <Stat
          label="Report as of"
          value={c ? new Date(c.reportAsOf * 1000).toISOString().slice(0, 10) : "—"}
          sub={c ? ago(now - c.reportAsOf) : undefined}
        />
        <Stat label="Asset contract" value={<span className="mono">{shortAddress(asset.sac, 6)}</span>} sub={
          <a href={explorer.contract(asset.sac)} target="_blank" rel="noreferrer">explorer</a>
        } />
      </div>

      <h2>Reserve reports</h2>
      <p className="sub">
        Latest report per signer tier. Coverage uses the freshest one. Each report carries the
        SHA-256 of its source document, so you can check the file has not changed.
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Tier</th>
              <th>Reserves</th>
              <th>Covers</th>
              <th>As of</th>
              <th>Signed by</th>
              <th>Document</th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((tier) => {
              const r = asset.reports[tier];
              return r ? (
                <ReportRow key={tier} report={r} supply={asset.supply?.amount} issuer={asset.issuer} now={now} />
              ) : (
                <tr key={tier}>
                  <td>{tierLabel(tier)}</td>
                  <td colSpan={5} className="sub">No report at this tier.</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {asset.supply ? <SupplySection hash={asset.supply.breakdownHash} poster={asset.supply.poster} /> : null}

      <h2>What the issuer publishes</h2>
      {asset.toml ? (
        <div className="card">
          <p>
            From <code>https://{asset.toml.home_domain}/.well-known/stellar.toml</code> (SEP-1).
          </p>
          {asset.toml.currency ? (
            <ul>
              {asset.toml.currency.name ? <li>Name: {asset.toml.currency.name}</li> : null}
              <li>
                Anchored: {asset.toml.currency.is_asset_anchored ? `yes, to ${asset.toml.currency.anchor_asset ?? "an off-chain asset"}` : "not stated"}
              </li>
              <li>
                Reserve attestation link:{" "}
                {asset.toml.currency.attestation_of_reserve ? (
                  <a href={asset.toml.currency.attestation_of_reserve} target="_blank" rel="noreferrer">
                    {asset.toml.currency.attestation_of_reserve}
                  </a>
                ) : (
                  "not published"
                )}
              </li>
            </ul>
          ) : (
            <p className="sub">The stellar.toml does not list this asset under [[CURRENCIES]].</p>
          )}
        </div>
      ) : (
        <p className="sub">
          {asset.source === "chain"
            ? "stellar.toml data comes from the indexer, which this deployment is not using."
            : "The issuer has no home_domain set, or its stellar.toml could not be read."}
        </p>
      )}
    </>
  );
}

function ReportRow({ report, supply, issuer, now }: { report: ReportView; supply: bigint | undefined; issuer: string; now: number }) {
  const covers = supply && supply > 0n ? bpsToPercent(Number((report.amount * 10_000n) / supply)) : "—";
  return (
    <tr>
      <td><TierPill tier={report.tier} /></td>
      <td className="num">{formatUnits(report.amount)}</td>
      <td className="num">{covers}</td>
      <td className="num">
        {new Date(report.asOf * 1000).toISOString().slice(0, 10)}
        <div className="sub">{ago(now - report.asOf)}</div>
      </td>
      <td>
        <a className="mono" href={explorer.account(report.reporter)} target="_blank" rel="noreferrer">
          {shortAddress(report.reporter)}
        </a>
        {report.reporter === issuer ? <div className="sub">issuer account</div> : null}
        {report.txHash ? (
          <div className="sub"><a href={explorer.tx(report.txHash)} target="_blank" rel="noreferrer">transaction</a></div>
        ) : null}
      </td>
      <td>
        <a href={report.docUri} target="_blank" rel="noreferrer">Open</a>
        <DocCheck uri={report.docUri} hash={report.docHash} />
      </td>
    </tr>
  );
}

type CheckState = { kind: "idle" } | { kind: "busy" } | { kind: "ok" } | { kind: "bad"; msg: string };

function DocCheck({ uri, hash }: { uri: string; hash: string }) {
  const [state, setState] = useState<CheckState>({ kind: "idle" });
  const run = useCallback(async () => {
    setState({ kind: "busy" });
    try {
      const res = await fetch(uri);
      if (!res.ok) throw new Error(`download failed (${res.status})`);
      const ok = await matchesHash(new Uint8Array(await res.arrayBuffer()), hash);
      setState(ok ? { kind: "ok" } : { kind: "bad", msg: "hash does not match" });
    } catch (e) {
      setState({ kind: "bad", msg: e instanceof Error ? e.message : "could not fetch (CORS?)" });
    }
  }, [uri, hash]);
  return (
    <div className="sub" aria-live="polite">
      {state.kind === "idle" ? (
        <button type="button" className="secondary" style={{ padding: "2px 8px", fontSize: "0.8rem", marginTop: 4 }} onClick={run}>
          Verify hash
        </button>
      ) : state.kind === "busy" ? (
        "Checking…"
      ) : state.kind === "ok" ? (
        <span style={{ color: "var(--ok)" }}>Hash matches</span>
      ) : (
        <span style={{ color: "var(--bad)" }}>{state.msg}</span>
      )}
    </div>
  );
}

function LiveCheck({ sac }: { sac: string }) {
  const [state, setState] = useState<{ kind: "idle" | "busy" } | { kind: "done"; text: string } | { kind: "err"; text: string }>({ kind: "idle" });
  const run = async () => {
    setState({ kind: "busy" });
    try {
      const [cov, ok] = await Promise.all([
        contracts.coverage(sac, Tier.Transcribed),
        contracts.isCovered(sac, 10_000, 31 * 86_400, Tier.Transcribed),
      ]);
      setState({
        kind: "done",
        text: cov
          ? `On-chain: ${bpsToPercent(cov.bps) ?? "no supply"} · is_covered(100%, 31 days) = ${ok}`
          : "On-chain: no coverage yet",
      });
    } catch (e) {
      setState({ kind: "err", text: e instanceof Error ? e.message : String(e) });
    }
  };
  return (
    <div style={{ textAlign: "right" }} aria-live="polite">
      <button type="button" className="secondary" onClick={run} disabled={state.kind === "busy"}>
        {state.kind === "busy" ? "Reading contract…" : "Check on-chain now"}
      </button>
      {"text" in state ? <div className="sub" style={{ marginTop: 6 }}>{state.text}</div> : null}
    </div>
  );
}

function SupplySection({ hash, poster }: { hash: string; poster: string }) {
  const [breakdown, setBreakdown] = useState<SupplyBreakdown | null>(null);
  const [verified, setVerified] = useState<boolean | null>(null);
  useEffect(() => {
    if (!indexer) return;
    indexer
      .breakdown(hash)
      .then(async (bytes) => {
        setBreakdown(parseBreakdown(bytes));
        setVerified((await sha256Hex(bytes)) === hash);
      })
      .catch(() => setBreakdown(null));
  }, [hash]);

  const rows: [string, keyof SupplyBreakdown][] = [
    ["Trustlines, authorised", "authorized"],
    ["Trustlines, maintain liabilities only", "authorized_to_maintain_liabilities"],
    ["Trustlines, unauthorised", "unauthorized"],
    ["Claimable balances", "claimable_balances"],
    ["Liquidity pools", "liquidity_pools"],
    ["Held by contracts", "contracts"],
  ];
  return (
    <>
      <h2>How supply was counted</h2>
      <p className="sub">
        Posted by <a className="mono" href={explorer.account(poster)} target="_blank" rel="noreferrer">{shortAddress(poster)}</a>.
        Breakdown hash <code className="break">{hash}</code>
      </p>
      {breakdown ? (
        <div className="table-wrap">
          <table>
            <tbody>
              {rows.map(([label, key]) => (
                <tr key={key}>
                  <td>{label}</td>
                  <td className="num">{formatUnits(BigInt(breakdown[key] as string))}</td>
                </tr>
              ))}
              <tr>
                <td><strong>Total</strong></td>
                <td className="num"><strong>{formatUnits(BigInt(breakdown.total))}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p className="sub">
          {config.indexerUrl ? "Breakdown not available from the indexer." : "The per-bucket breakdown is served by the indexer, which this deployment is not using."}
        </p>
      )}
      {verified !== null ? (
        <p className={`notice mt ${verified ? "notice-ok" : "notice-bad"}`}>
          {verified ? "The breakdown hashes to the value recorded on-chain." : "The breakdown does NOT match the on-chain hash."}
        </p>
      ) : null}
    </>
  );
}
