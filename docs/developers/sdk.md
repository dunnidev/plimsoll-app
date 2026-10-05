# TypeScript SDK

`@plimsoll/sdk` lives in `packages/sdk` of the app repo. It reads the
contracts through RPC simulation, builds prepared transactions for writes, and
wraps the indexer API. It never holds keys.

## Read coverage

```ts
import { PlimsollContracts, TESTNET, Tier, bpsToPercent, formatUnits } from "@plimsoll/sdk";

const plimsoll = new PlimsollContracts(TESTNET);
const sac = TESTNET.assets.PUSD.sac;

const cov = await plimsoll.coverage(sac, Tier.Transcribed);
// { bps: 10200, supply: 10000000000000n, reserves: 10200000000000n,
//   tier: 2, supplyLedger: 5034657, supplyTimestamp: 1791196882, reportAsOf: 1791158400 }

bpsToPercent(cov!.bps);        // "102.00%"
formatUnits(cov!.reserves);    // "1,020,000"
```

## Reference

### `PlimsollContracts`

| Method | Returns |
| --- | --- |
| `getAsset(sac)` | `AssetRecord \| null` |
| `getSupply(sac)` | `SupplySnapshot \| null` |
| `getReport(sac, tier)` | `ReserveReport \| null` |
| `coverage(sac, minTier)` | `Coverage \| null` |
| `isCovered(sac, minBps, maxAgeSeconds, minTier)` | `boolean` |
| `getReporter(address)` | `ReporterInfo \| null` |
| `prepareListAsset(source, sac)` | unsigned XDR |
| `prepareDeploySac(source, code, issuer)` | unsigned XDR |
| `preparePostReserve({ reporter, sac, amount, asOf, docHash, docUri })` | unsigned XDR |
| `submit(signedXdr)` | transaction hash, after it succeeds |

A failed simulation throws `ContractCallError`, whose message contains the
contract error, e.g. `Error(Contract, #5)` for `NotReporter`.

### Posting a report

```ts
import { parseUnits, sha256Hex } from "@plimsoll/sdk";
import { signTransaction } from "@stellar/freighter-api";

const xdr = await plimsoll.preparePostReserve({
  reporter: issuer,
  sac,
  amount: parseUnits("1,020,000"),
  asOf: Date.UTC(2026, 9, 5) / 1000,
  docHash: await sha256Hex(await file.arrayBuffer()),
  docUri: "https://example.com/reserves/2026-10.pdf",
});
const { signedTxXdr } = await signTransaction(xdr, {
  networkPassphrase: TESTNET.networkPassphrase,
  address: issuer,
});
const hash = await plimsoll.submit(signedTxXdr);
```

### `IndexerClient`

| Method | Endpoint |
| --- | --- |
| `listAssets(minTier?)` | `GET /v1/assets` |
| `getAsset(sac, minTier?)` | `GET /v1/assets/{sac}` |
| `supplyHistory(sac, limit?)` | `GET /v1/assets/{sac}/supply` |
| `reportHistory(sac, limit?)` | `GET /v1/assets/{sac}/reports` |
| `reporters()` | `GET /v1/reporters` |
| `network()` | `GET /v1/network` |
| `breakdown(hash)` | `GET /v1/breakdowns/{hash}` (raw bytes) |

### Helpers

| Function | Example |
| --- | --- |
| `formatUnits(10200000000000n)` | `"1,020,000"` |
| `parseUnits("1.5")` | `15000000n` |
| `bpsToPercent(9990)` | `"99.90%"` |
| `coverageStatus(bps, ageSeconds)` | `"covered" \| "under" \| "stale" \| "unknown"` |
| `sacAddress(code, issuer, passphrase)` | the asset's SAC address |
| `sha256Hex(bytes)` / `matchesHash(bytes, hex)` | document checks |

## Tests

```bash
npm test                      # unit tests
PLIMSOLL_LIVE=1 npm test      # plus reads against the live testnet contracts
```
