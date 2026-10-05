# Instructions for coding agents — plimsoll-app

You are working on the Plimsoll web app and TypeScript SDK. Write complete,
typed, tested code. No placeholders.

## Stack

| Item | Version |
| --- | --- |
| Node | 22.12+ |
| TypeScript | 5.9.3, `strict`, `noUncheckedIndexedAccess` |
| Next.js | 16.3.8, App Router, `output: "export"` |
| React | 19.3.0 |
| @stellar/stellar-sdk | 17.2.1 |
| @stellar/freighter-api | 6.0.1 |
| Tests | vitest 5 |

## Layout

```
packages/sdk/src/      types.ts, format.ts, contract.ts, indexer.ts, verify.ts, networks.ts
packages/sdk/test/     sdk.test.ts (PLIMSOLL_LIVE=1 enables live testnet reads)
apps/web/app/          routes: / asset/ report/ list/ integrate/ about/
apps/web/components/   ui.tsx, SiteChrome.tsx, AssetCard.tsx
apps/web/lib/          config.ts (NEXT_PUBLIC_*), data.ts (indexer → chain fallback), wallet.ts
docs/                  GitBook content (SUMMARY.md is the table of contents)
```

## Contract interface (from plimsoll-contracts/docs/SPEC.md)

Reads, through `PlimsollContracts`: `get_asset(sac)`, `get_supply(sac)`,
`get_report(sac, tier)`, `coverage(sac, min_tier)`,
`is_covered(sac, min_bps, max_age, min_tier)`, registry `get_reporter(addr)`.
Writes, as prepared XDR: `list_asset(sac)`, `post_reserve(reporter, sac,
amount i128, as_of u64, doc_hash BytesN<32>, doc_uri String)`.
Tiers: 1 Transcribed, 2 IssuerSigned, 3 AuditorSigned. Roles: 1 Auditor,
2 Transcriber, 3 SupplyPoster.

## RPC pattern

- Reads: build a transaction from a throwaway source `Account(..., "0")`,
  `simulateTransaction`, `scValToNative(sim.result.retval)`, then decode with
  the `decode*` functions in `contract.ts`.
- Writes: `server.getAccount(source)` → build → `prepareTransaction` → return
  XDR → wallet signs → `submit()` sends and polls.
- stellar-sdk 17 `ScVal`s are plain objects. Do not call `.switch()` or arm
  accessors; use `scValToNative` / `nativeToScVal`.

## Standards

- Money is `bigint` in smallest units until display (`formatUnits`).
- The site is static: no server components that fetch, no API routes.
- Every data page has loading, empty and error states, works at 360px wide,
  and is keyboard accessible.
- Colours come from CSS variables in `globals.css`; dark mode must work.

## Before every commit

```bash
npm run build -w @plimsoll/sdk
npm run typecheck
npm test
npm run build
```

## Git rules

Stage named files only (never `git add .`), one logical unit per commit,
Conventional Commits with scopes `sdk`, `web`, `docs`, `ci`, push after each.

## Do not

- [ ] handle secret keys anywhere in the app
- [ ] render stellar.toml or document content as HTML
- [ ] use floats for amounts or ratios in logic
- [ ] ship a feature that needs a contract function not yet deployed to testnet
