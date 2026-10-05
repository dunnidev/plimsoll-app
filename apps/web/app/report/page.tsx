"use client";

import { useEffect, useState } from "react";
import { Role, Tier, parseUnits, sha256Hex, tierLabel } from "@plimsoll/sdk";
import { explorer } from "@/lib/config";
import { contracts, loadAssets, type AssetView } from "@/lib/data";
import { WalletError, connectWallet, signXdr } from "@/lib/wallet";

type Status = { kind: "idle" } | { kind: "busy"; msg: string } | { kind: "ok"; hash: string; tier: Tier } | { kind: "err"; msg: string };

export default function ReportPage() {
  const [assets, setAssets] = useState<AssetView[]>([]);
  const [address, setAddress] = useState<string | null>(null);
  const [sac, setSac] = useState("");
  const [amount, setAmount] = useState("");
  const [asOf, setAsOf] = useState(new Date().toISOString().slice(0, 10));
  const [docUri, setDocUri] = useState("");
  const [docHash, setDocHash] = useState("");
  const [tier, setTier] = useState<Tier | null | undefined>(undefined);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  useEffect(() => {
    loadAssets()
      .then((list) => {
        setAssets(list);
        if (list[0]) setSac(list[0].sac);
      })
      .catch(() => setAssets([]));
  }, []);

  // Which tier will this address's report get?
  useEffect(() => {
    if (!address || !sac) return;
    const asset = assets.find((a) => a.sac === sac);
    if (asset?.issuer === address) {
      setTier(Tier.IssuerSigned);
      return;
    }
    setTier(undefined);
    contracts
      .getReporter(address)
      .then((info) => {
        if (info?.role === Role.Auditor) setTier(Tier.AuditorSigned);
        else if (info?.role === Role.Transcriber) setTier(Tier.Transcribed);
        else setTier(null);
      })
      .catch(() => setTier(null));
  }, [address, sac, assets]);

  const connect = async () => {
    try {
      setAddress(await connectWallet());
      setStatus({ kind: "idle" });
    } catch (e) {
      setStatus({ kind: "err", msg: e instanceof Error ? e.message : String(e) });
    }
  };

  const hashFile = async (file: File | undefined) => {
    if (!file) return;
    setDocHash(await sha256Hex(await file.arrayBuffer()));
  };

  const hashUrl = async () => {
    try {
      const res = await fetch(docUri);
      if (!res.ok) throw new Error(`status ${res.status}`);
      setDocHash(await sha256Hex(await res.arrayBuffer()));
    } catch (e) {
      setStatus({
        kind: "err",
        msg: `Could not download the document to hash it (${e instanceof Error ? e.message : e}). Upload the file instead.`,
      });
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !tier) return;
    try {
      const units = parseUnits(amount);
      const asOfSecs = Math.floor(new Date(`${asOf}T00:00:00Z`).getTime() / 1000);
      setStatus({ kind: "busy", msg: "Simulating…" });
      const xdr = await contracts.preparePostReserve({
        reporter: address,
        sac,
        amount: units,
        asOf: asOfSecs,
        docHash,
        docUri,
      });
      setStatus({ kind: "busy", msg: "Waiting for your signature in Freighter…" });
      const signed = await signXdr(xdr, address);
      setStatus({ kind: "busy", msg: "Submitting…" });
      const hash = await contracts.submit(signed);
      setStatus({ kind: "ok", hash, tier });
    } catch (err) {
      const msg = err instanceof WalletError || err instanceof Error ? err.message : String(err);
      setStatus({ kind: "err", msg: friendly(msg) });
    }
  };

  const ready = address && tier && sac && amount && docUri && /^[0-9a-f]{64}$/.test(docHash) && status.kind !== "busy";

  return (
    <>
      <div className="eyebrow">For issuers, auditors and transcribers</div>
      <h1>Post a reserve report</h1>
      <p className="sub" style={{ maxWidth: 680 }}>
        Your account decides the weight of the report. The asset&apos;s issuer account posts at
        the Issuer-signed tier. Registered auditors post at Auditor-signed, registered
        transcribers at Transcribed. Anyone else is refused by the contract.
      </p>

      <div className="card mt" style={{ maxWidth: 680 }}>
        {address ? (
          <div className="spread">
            <span>
              Connected as <code className="break">{address}</code>
            </span>
            <span>
              {tier === undefined ? "Checking role…" : tier === null ? (
                <span className="pill pill-under">Not allowed to report</span>
              ) : (
                <span className="pill pill-tier">Will post as {tierLabel(tier)}</span>
              )}
            </span>
          </div>
        ) : (
          <button type="button" onClick={connect}>Connect Freighter</button>
        )}
      </div>

      <form className="stack mt" onSubmit={submit}>
        <label>
          Asset
          <select value={sac} onChange={(e) => setSac(e.target.value)} required>
            {assets.map((a) => (
              <option key={a.sac} value={a.sac}>
                {a.code} — {a.issuer.slice(0, 6)}…{a.issuer.slice(-4)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Reserves held
          <span className="hint">In units of the asset, up to 7 decimals. Example: 1,020,000</span>
          <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1,020,000" required />
        </label>
        <label>
          As of (UTC date)
          <span className="hint">The date the reserve figure describes. Cannot be in the future.</span>
          <input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} required />
        </label>
        <label>
          Source document URL
          <span className="hint">A stable link to the attestation or statement (PDF, page, file).</span>
          <input type="url" value={docUri} onChange={(e) => setDocUri(e.target.value)} placeholder="https://…" required maxLength={256} />
        </label>
        <div>
          <label>
            Document SHA-256
            <span className="hint">Upload the file or fetch it from the URL; the hash is computed in your browser.</span>
            <input className="mono" value={docHash} onChange={(e) => setDocHash(e.target.value.trim().toLowerCase())} placeholder="64 hex characters" required />
          </label>
          <div className="row" style={{ marginTop: 8 }}>
            <input type="file" aria-label="Upload document to hash" onChange={(e) => hashFile(e.target.files?.[0])} style={{ maxWidth: 320 }} />
            <button type="button" className="secondary" onClick={hashUrl} disabled={!docUri}>
              Hash from URL
            </button>
          </div>
        </div>
        <div>
          <button type="submit" disabled={!ready}>Sign and post</button>
        </div>
      </form>

      <div aria-live="polite" className="mt" style={{ maxWidth: 680 }}>
        {status.kind === "busy" ? <p className="notice notice-info">{status.msg}</p> : null}
        {status.kind === "err" ? <p className="notice notice-bad">{status.msg}</p> : null}
        {status.kind === "ok" ? (
          <p className="notice notice-ok">
            Posted as {tierLabel(status.tier)}.{" "}
            <a href={explorer.tx(status.hash)} target="_blank" rel="noreferrer">View transaction</a>.
            The dashboard updates once the indexer picks up the event.
          </p>
        ) : null}
      </div>
    </>
  );
}

const ERRORS: Record<string, string> = {
  "#5": "This account is not the issuer and is not a registered auditor or transcriber.",
  "#9": "The as-of date is in the future.",
  "#10": "There is already a report at this tier with the same or a later as-of date.",
  "#11": "The document URL is empty or longer than 256 characters.",
  "#3": "This asset is not listed on the coverage ledger.",
  "#6": "Reserves cannot be negative.",
};

function friendly(msg: string): string {
  const m = msg.match(/Error\(Contract, (#\d+)\)/);
  return (m && m[1] && ERRORS[m[1]]) || msg;
}
