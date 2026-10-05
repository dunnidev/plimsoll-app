"use client";

import Link from "next/link";
import { useState } from "react";
import { StrKey } from "@stellar/stellar-sdk";
import { sacAddress } from "@plimsoll/sdk";
import { config, explorer } from "@/lib/config";
import { contracts } from "@/lib/data";
import { connectWallet, signXdr } from "@/lib/wallet";

type Step =
  | { kind: "idle" }
  | { kind: "busy"; msg: string }
  | { kind: "listed"; sac: string; already: boolean; hash?: string }
  | { kind: "needs-sac"; sac: string }
  | { kind: "err"; msg: string };

export default function ListPage() {
  const [code, setCode] = useState("");
  const [issuer, setIssuer] = useState("");
  const [step, setStep] = useState<Step>({ kind: "idle" });

  const valid = /^[a-zA-Z0-9]{1,12}$/.test(code) && StrKey.isValidEd25519PublicKey(issuer);
  const sac = valid ? sacAddress(code, issuer, config.network.networkPassphrase) : "";

  const signAndSend = async (prepare: (source: string) => Promise<string>, label: string) => {
    const source = await connectWallet();
    setStep({ kind: "busy", msg: `Preparing ${label}…` });
    const xdr = await prepare(source);
    setStep({ kind: "busy", msg: "Waiting for your signature in Freighter…" });
    const signed = await signXdr(xdr, source);
    setStep({ kind: "busy", msg: "Submitting…" });
    return contracts.submit(signed);
  };

  const list = async () => {
    try {
      setStep({ kind: "busy", msg: "Checking the coverage ledger…" });
      const existing = await contracts.getAsset(sac);
      if (existing) {
        setStep({ kind: "listed", sac, already: true });
        return;
      }
      const hash = await signAndSend((src) => contracts.prepareListAsset(src, sac), "listing");
      setStep({ kind: "listed", sac, already: false, hash });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      // No SAC deployed yet for this asset: the call fails before reaching our contract.
      if (/MissingValue|non-existent|contract.*not found|Error\(Storage/i.test(msg)) {
        setStep({ kind: "needs-sac", sac });
      } else {
        setStep({ kind: "err", msg: /#1\b/.test(msg) ? "That address is not a Stellar Asset Contract." : msg });
      }
    }
  };

  const deploySac = async () => {
    try {
      await signAndSend((src) => contracts.prepareDeploySac(src, code, issuer), "asset contract deployment");
      await list();
    } catch (e) {
      setStep({ kind: "err", msg: e instanceof Error ? e.message : String(e) });
    }
  };

  return (
    <>
      <div className="eyebrow">Permissionless</div>
      <h1>List an asset</h1>
      <p className="sub" style={{ maxWidth: 680 }}>
        Any classic Stellar asset can be listed by anyone. The contract reads the code and issuer
        from the asset&apos;s built-in Stellar Asset Contract, so a look-alike token cannot be
        listed under a real issuer&apos;s name. Once listed, the indexer starts posting supply.
      </p>

      <form
        className="stack mt"
        onSubmit={(e) => {
          e.preventDefault();
          void list();
        }}
      >
        <label>
          Asset code
          <input value={code} onChange={(e) => setCode(e.target.value.trim())} placeholder="USDC" maxLength={12} required />
        </label>
        <label>
          Issuer account
          <input className="mono" value={issuer} onChange={(e) => setIssuer(e.target.value.trim())} placeholder="G…" required />
        </label>
        {valid ? (
          <p className="sub">
            Asset contract on {config.networkName}: <code className="break">{sac}</code>
          </p>
        ) : null}
        <div>
          <button type="submit" disabled={!valid || step.kind === "busy"}>List asset</button>
        </div>
      </form>

      <div aria-live="polite" className="mt" style={{ maxWidth: 680 }}>
        {step.kind === "busy" ? <p className="notice notice-info">{step.msg}</p> : null}
        {step.kind === "err" ? <p className="notice notice-bad">{step.msg}</p> : null}
        {step.kind === "listed" ? (
          <p className="notice notice-ok">
            {step.already ? "Already listed. " : "Listed. "}
            <Link href={`/asset/?sac=${step.sac}`}>Open the asset page</Link>
            {step.hash ? (
              <>
                {" · "}
                <a href={explorer.tx(step.hash)} target="_blank" rel="noreferrer">transaction</a>
              </>
            ) : null}
          </p>
        ) : null}
        {step.kind === "needs-sac" ? (
          <div className="notice notice-info">
            <p>
              This asset has no Stellar Asset Contract on {config.networkName} yet. Deploying it is a
              one-time, permissionless step that does not change the asset.
            </p>
            <button type="button" onClick={deploySac}>Deploy asset contract, then list</button>
          </div>
        ) : null}
      </div>
    </>
  );
}
