import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "How it works" };

export default function AboutPage() {
  return (
    <article style={{ maxWidth: 760 }}>
      <div className="eyebrow">How it works</div>
      <h1>A load line for issued assets</h1>
      <p>
        A Plimsoll line is the mark painted on a ship&apos;s hull. If the water rises above it,
        the ship is carrying more than it safely can, and anyone standing on the dock can see it.
        Plimsoll does the same for assets issued on Stellar: the liabilities go on one side, the
        reserves on the other, and the line is at 100%.
      </p>

      <h2>The problem</h2>
      <p>
        Stablecoins and tokenized deposits on Stellar are claims on an issuer. Their backing is
        reported in monthly PDFs on the issuer&apos;s website, if at all. A wallet, a lending pool
        or a payment router has no way to read that PDF, so it treats every issued asset as if it
        were fully backed, until it is not.
      </p>

      <h2>Two halves, two sources</h2>
      <p>
        <strong>Supply</strong> is public. Every Stellar-issued asset&apos;s holdings are on the
        ledger: trustlines, claimable balances, liquidity-pool reserves and balances held by
        contracts. The Plimsoll indexer adds them up and posts the total to the coverage ledger
        with a hash of the breakdown. Anyone can recompute it from Horizon and compare.
      </p>
      <p>
        <strong>Reserves</strong> are not on-chain, so someone has to sign for them. Who signs
        decides how much weight the figure carries:
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Tier</th><th>Signed by</th><th>How it is checked</th></tr>
          </thead>
          <tbody>
            <tr><td>Auditor-signed</td><td>A registered independent auditor</td><td>Address registered in the reporter registry with the Auditor role</td></tr>
            <tr><td>Issuer-signed</td><td>The asset&apos;s own issuer account</td><td>The issuer G-account authorises the call; nobody else can sign as it</td></tr>
            <tr><td>Transcribed</td><td>A registered volunteer</td><td>Copied from a published report; lowest weight</td></tr>
          </tbody>
        </table>
      </div>
      <p className="mt">
        Every report records the SHA-256 of its source document. If the document changes after
        the fact, the hash no longer matches, and the asset page shows it.
      </p>

      <h2>What makes this specific to Stellar</h2>
      <ul>
        <li>Issued assets are a protocol feature with a known issuer account, so supply can be computed for any asset without the issuer&apos;s help.</li>
        <li>The issuer&apos;s classic account can authorise a Soroban call directly, which is what makes the Issuer-signed tier unforgeable.</li>
        <li>Each asset has a built-in Stellar Asset Contract whose name is <code>CODE:ISSUER</code>. Listing reads it, so look-alike tokens cannot be listed under a real issuer.</li>
        <li>SEP-1 already defines an <code>attestation_of_reserve</code> field in <code>stellar.toml</code>; Plimsoll reads it and shows it next to the on-chain figure.</li>
      </ul>

      <h2>What Plimsoll does not do</h2>
      <ul>
        <li>It does not audit anyone. A figure is only as good as its signer, which is why the tier is always shown.</li>
        <li>It does not cover Soroban-native tokens yet: they have no standard total-supply function.</li>
        <li>The contracts are unaudited and run on testnet.</li>
      </ul>

      <p className="mt">
        <Link href="/integrate/">Integration guide</Link> ·{" "}
        <a href="https://github.com/plimsoll-protocol/plimsoll-contracts/blob/main/docs/SPEC.md">Contract specification</a>
      </p>
    </article>
  );
}
