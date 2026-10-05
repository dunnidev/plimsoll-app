# Mainnet watch

The [Mainnet watch](https://plimsoll-protocol.github.io/plimsoll-app/mainnet/)
page runs the supply half of Plimsoll against real assets on Stellar mainnet,
live, in your browser. It needs no contracts and no indexer: it reads mainnet
Horizon directly and counts supply with the same rule the indexer posts
on-chain (both implementations are tested against the same fixture).

## What it shows for each asset

| Field | Source |
| --- | --- |
| Circulating supply and holders | Horizon `/assets` for the exact code and issuer |
| Where the supply sits | The same six buckets: trustlines (3 auth states), liquidity pools, Soroban contracts, claimable balances |
| Issuer controls | Issuer account flags: clawback, revocable, auth required, immutable |
| stellar.toml | Fetched from the issuer's `home_domain`; "Confirms this issuer" only if it lists this exact code and issuer |
| Reserve attestation link | SEP-1 `attestation_of_reserve`, when the issuer publishes one |
| On-chain reserve report | None yet: the coverage ledger runs on testnet |

## What it found (5 October 2026)

| Asset | Issuer | Circulating | In Soroban contracts | stellar.toml |
| --- | --- | --- | --- | --- |
| USDC | Circle | 353.6M | 21.5% | home domain `circle.com` returns 404 for `/.well-known/stellar.toml` |
| EURC | Circle | 4.2M | 16.7% | same as USDC |
| PYUSD | Paxos | 12.4M | 70.9% | served, but blocks automated and some regional requests |
| USDGLO | Glo Dollar | 253K | 88.9% | confirms the issuer; links an attestation at brale.xyz |
| BENJI | Franklin Templeton | 522.7M | 0% | served, but blocks automated and some regional requests |

Two things stand out:

* **Reserve evidence is not machine-readable.** Of five major issued assets,
  one publishes an `attestation_of_reserve` link in its stellar.toml, and none
  has a signed figure a contract can read.
* **A lot of supply now sits in contracts.** Between 17% and 89% of four of
  these assets is held by Soroban contracts, which is exactly where an
  `is_covered` check is useful.

## Why some issuers are listed and others are not

Many asset codes on Stellar have look-alike tokens from other issuers. On 5 October 2026 a
"USDC" from an unrelated account claimed about 169 trillion units and a
look-alike "PYUSD" about 15 billion.
The page lists each asset by the issuer account that holds nearly all real
holders, and checks that issuer's own stellar.toml live. It is the same
problem the coverage ledger's `list_asset` solves on-chain by reading
`CODE:ISSUER` from the Stellar Asset Contract.

## Reading the numbers yourself

```ts
import { fetchAssetRecord, supplyFromRecord, formatUnits } from "@plimsoll/sdk";

const r = await fetchAssetRecord(
  "https://horizon.stellar.org",
  "USDC",
  "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
);
console.log(formatUnits(supplyFromRecord(r!).total, 7, 0)); // e.g. "353,623,052"
```
