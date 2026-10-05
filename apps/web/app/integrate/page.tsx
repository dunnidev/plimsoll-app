import type { Metadata } from "next";
import { TESTNET } from "@plimsoll/sdk";

export const metadata: Metadata = { title: "Integrate" };

const rust = `// Cargo.toml: soroban-sdk = "28"
use soroban_sdk::{contractclient, contracttype, Address, Env};

#[contracttype]
#[derive(Clone, Copy)]
#[repr(u32)]
pub enum Tier { Transcribed = 1, IssuerSigned = 2, AuditorSigned = 3 }

#[contractclient(name = "CoverageLedgerClient")]
pub trait CoverageLedger {
    fn is_covered(env: Env, sac: Address, min_bps: u32, max_age: u64, min_tier: Tier) -> bool;
}

// In your deposit / borrow / route function:
let ok = CoverageLedgerClient::new(&env, &coverage_ledger).is_covered(
    &asset,              // the asset's Stellar Asset Contract
    &10_000,             // at least 100% backed
    &(7 * 24 * 60 * 60), // supply and report both under 7 days old
    &Tier::IssuerSigned, // ignore transcribed-only figures
);
if !ok {
    panic_with_error!(&env, MyError::AssetNotCovered);
}`;

const ts = `import { PlimsollContracts, TESTNET, Tier, bpsToPercent } from "@plimsoll/sdk";

const plimsoll = new PlimsollContracts(TESTNET);
const sac = TESTNET.assets.PUSD.sac;

const cov = await plimsoll.coverage(sac, Tier.Transcribed);
console.log(bpsToPercent(cov!.bps));          // "102.00%"

const ok = await plimsoll.isCovered(sac, 10_000, 7 * 86_400, Tier.IssuerSigned);`;

const curl = `stellar contract invoke --network testnet --send=no \\
  --id ${TESTNET.coverageLedgerId} -- \\
  is_covered --sac ${TESTNET.assets.PUSD?.sac} \\
  --min_bps 10000 --max_age 604800 --min_tier 2`;

export default function IntegratePage() {
  return (
    <>
      <div className="eyebrow">For protocol developers</div>
      <h1>Refuse under-backed assets in one call</h1>
      <p className="sub" style={{ maxWidth: 720 }}>
        Lending pools, vaults, routers and payment contracts can ask the coverage ledger whether an
        asset is backed before accepting it. The answer is computed on-chain from the latest
        supply snapshot and the freshest reserve report at or above the tier you require.
      </p>

      <h2>Parameters</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Argument</th><th>Type</th><th>Meaning</th></tr>
          </thead>
          <tbody>
            <tr><td><code>sac</code></td><td><code>Address</code></td><td>The asset&apos;s Stellar Asset Contract.</td></tr>
            <tr><td><code>min_bps</code></td><td><code>u32</code></td><td>Minimum reserves ÷ supply in basis points. 10,000 = 100%.</td></tr>
            <tr><td><code>max_age</code></td><td><code>u64</code></td><td>Seconds. Both the supply snapshot and the report must be at most this old.</td></tr>
            <tr><td><code>min_tier</code></td><td><code>Tier</code></td><td>1 Transcribed, 2 Issuer-signed, 3 Auditor-signed. Weaker reports are ignored.</td></tr>
          </tbody>
        </table>
      </div>

      <h2>From a Soroban contract</h2>
      <pre><code>{rust}</code></pre>
      <p className="sub">
        A working example is the <a href="https://github.com/plimsoll-protocol/plimsoll-contracts/tree/main/contracts/covered-vault">covered-vault</a> contract:
        deposits are refused while the asset is not covered; withdrawals never are.
      </p>

      <h2>From TypeScript</h2>
      <pre><code>{ts}</code></pre>

      <h2>From the command line</h2>
      <pre><code>{curl}</code></pre>

      <h2>Testnet addresses</h2>
      <div className="table-wrap">
        <table>
          <tbody>
            <tr><td>Coverage ledger</td><td className="mono break">{TESTNET.coverageLedgerId}</td></tr>
            <tr><td>Reporter registry</td><td className="mono break">{TESTNET.reporterRegistryId}</td></tr>
            <tr><td>Covered vault (example)</td><td className="mono break">{TESTNET.coveredVaultId}</td></tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
