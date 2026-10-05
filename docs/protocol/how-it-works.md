# How it works

A Plimsoll line is the mark on a ship's hull. If the water is above it, the
ship is overloaded, and anyone on the dock can see it. Plimsoll draws that line
for issued assets: liabilities on one side, reserves on the other, the line at
100%.

## Three parts

| Part | Where it runs | Job |
| --- | --- | --- |
| Contracts | Soroban | Store listings, supply snapshots and reserve reports; compute coverage |
| Indexer | A server (Go) | Count supply from Horizon and post it; copy events into Postgres; read issuers' `stellar.toml` |
| App and SDK | Browser | Show coverage; let issuers and auditors post reports; let anyone list an asset |

```
            Horizon ──supply──▶ Indexer ──post_supply──▶ ┌──────────────────┐
                                                         │  coverage-ledger │◀── is_covered ── your contract
 Issuer / auditor ──(wallet)── App ──post_reserve──────▶ │                  │
                                                         └────────┬─────────┘
                                                                  │ role_of
                                                         ┌────────▼─────────┐
                                                         │ reporter-registry│
                                                         └──────────────────┘
```

## Two halves, two sources

**Supply is public.** Every holding of a classic Stellar asset is on the
ledger. The indexer adds six buckets: trustlines in each of the three
authorisation states, claimable balances, liquidity-pool reserves, and
balances held by contracts. It posts the total with the SHA-256 of the
breakdown. The breakdown itself is served by the indexer byte for byte, so
anyone can hash it and compare.

**Reserves are off-chain, so someone must sign.** The signer decides the tier:

| Tier | Signer | Why it is trusted |
| --- | --- | --- |
| Auditor-signed (3) | Registered auditor | Independent; registered by the admin |
| Issuer-signed (2) | The asset's issuer account | Only the issuer can produce this signature |
| Transcribed (1) | Registered transcriber | Copied from a published report; lowest weight |

Each report stores the SHA-256 and URL of its source document. If the
document is changed later, the hash no longer matches.

## Why this needs Stellar

* **Issued assets are part of the protocol.** Supply can be counted for any
  asset without the issuer's cooperation.
* **The issuer's classic account can authorise a Soroban call.** That is what
  makes the Issuer-signed tier unforgeable.
* **Every asset has a built-in Stellar Asset Contract (SAC)** whose `name()`
  is `CODE:ISSUER`. Listing accepts only genuine SACs and reads the code and
  issuer from that name, so a look-alike token cannot be listed under a real
  issuer.
* **SEP-1 already has an `attestation_of_reserve` field** in `stellar.toml`.
  The indexer reads it and shows it next to the on-chain figure.
