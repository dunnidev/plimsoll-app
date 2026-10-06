# Introduction

Plimsoll shows how much of a Stellar-issued asset is backed by reserves, who
signed for those reserves, and how old the figure is. It records both sides on
Soroban and lets any contract refuse an asset that falls below the line.

* **Live app (testnet):** [plimsoll-app-gths-amber.vercel.app](https://plimsoll-app-gths-amber.vercel.app/)
* **Code:** [contracts](https://github.com/plimsoll-protocol/plimsoll-contracts) · [app and SDK](https://github.com/plimsoll-protocol/plimsoll-app) · [indexer](https://github.com/plimsoll-protocol/plimsoll-indexer)

## The problem

Stablecoins are claims on an issuer. Across all chains they total about
**$305 billion** ([DefiLlama, 14 September 2026](https://techflowpost.com/en-US/newsletter/136066)).
On Stellar alone, Circle's USDC had **350,513,613 units** in circulation on
5 October 2026, counting trustlines, claimable balances, liquidity pools and
contract balances (Horizon `/assets`, read by the Plimsoll indexer).

The backing for those claims is published as documents. In the United States
the GENIUS Act now requires payment-stablecoin issuers to publish their reserve
composition every month, examined by a registered public accounting firm and
certified by the CEO and CFO ([The Block](https://www.theblock.co/post/406286/what-is-the-genius-act)).

Those reports are PDFs on a website. A wallet, a lending pool or a payment
router cannot read a PDF, so in practice they treat every issued asset as fully
backed. When one is not, nothing on-chain notices.

## What Plimsoll does

1. **Counts supply from the ledger.** The indexer sums every holding of the
   asset and posts the total on-chain with a hash of the breakdown.
2. **Records signed reserve figures.** The asset's issuer account, a registered
   auditor, or a registered transcriber posts the reserve amount with a hash of
   the source document. Who signs sets the report's tier.
3. **Answers one question for any contract:**
   `is_covered(asset, min_bps, max_age, min_tier) -> bool`.

On testnet today, the demo asset PUSD shows **102.00%**: 1,020,000 in
issuer-signed reserves against 1,000,000 circulating. The example vault
contract accepts deposits of it because `is_covered(PUSD, 10000, 7 days,
Issuer-signed)` returns `true`.

## Who it is for

| You are | You use Plimsoll to |
| --- | --- |
| A holder or wallet | See whether an asset is backed before you accept it |
| An issuer | Publish reserves where contracts can read them, signed by your issuer account |
| An auditor | Put your attestation on-chain, at the strongest tier |
| A protocol developer | Refuse under-backed or stale assets in one call |

## Status

Version 0.1 runs on Stellar testnet. The contracts are **not audited**.
