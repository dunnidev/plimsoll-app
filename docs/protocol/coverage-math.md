# Coverage math, worked

All amounts are integers in the asset's smallest unit. Classic Stellar assets
have 7 decimals, so one unit is `10,000,000`. There are no floats anywhere.

## The formula

```
bps = floor(reserves × 10,000 ÷ supply)
```

`10,000 bps = 100%`. The result saturates at `4,294,967,295` (`u32::MAX`). If
supply is zero, `bps = u32::MAX`: nothing is owed, so nothing is uncovered.

## Example 1: the testnet PUSD reading

| Input | Value (units) | Value (stored) |
| --- | --- | --- |
| Supply at ledger 5,034,657 | 1,000,000 | `10,000,000,000,000` |
| Issuer-signed reserves, as of 2026-10-05 | 1,020,000 | `10,200,000,000,000` |
| Auditor-signed reserves, as of 2026-10-04 | 1,015,000 | `10,150,000,000,000` |

`coverage(PUSD, Transcribed)`: both reports qualify. The issuer report is
newer (5 Oct beats 4 Oct), so it is used.

```
10,200,000,000,000 × 10,000 ÷ 10,000,000,000,000 = 10,200 bps = 102.00%
```

`coverage(PUSD, AuditorSigned)`: only the auditor report qualifies.

```
10,150,000,000,000 × 10,000 ÷ 10,000,000,000,000 = 10,150 bps = 101.50%
```

## Example 2: rounding always goes down

Supply 3 units, reserves 1 unit:

```
10,000,000 × 10,000 ÷ 30,000,000 = 3,333.33… → 3,333 bps (33.33%)
```

Rounding down means a ratio is never reported higher than it is. An asset at
99.999% is reported as 9,999 bps and fails a `min_bps = 10,000` check.

## Example 3: freshness

A lending pool calls `is_covered(PUSD, 10000, 604800, IssuerSigned)` (100%,
7 days). It is true only if all three hold:

| Check | PUSD on 5 Oct 2026 |
| --- | --- |
| Supply snapshot ≤ 7 days old | posted 5 Oct ✔ |
| Chosen report ≤ 7 days old | as of 5 Oct ✔ |
| bps ≥ 10,000 | 10,200 ✔ |

On 13 October, with no new report, the report is 8 days old and the call
returns `false`, even though the ratio has not changed. Withdrawals from the
example vault still work; only new deposits stop.

## Example 4: an under-backed asset

Supply 1,000,000, reserves 999,000:

```
9,990,000,000,000 × 10,000 ÷ 10,000,000,000,000 = 9,990 bps = 99.90%
```

The app shows **Under-backed**. `is_covered(…, 10000, …)` is `false`. A
consumer that accepts a small shortfall can pass `min_bps = 9,900` instead.

## Cost of a reading

Each `post_supply` and `post_reserve` is one Soroban transaction. Measured fees
for the testnet demo (Horizon `fee_charged`):

| Transaction | Fee |
| --- | --- |
| First `post_supply` for PUSD | 0.2292094 XLM |
| First issuer `post_reserve` for PUSD | 0.3276146 XLM |
| `covered-vault.deposit` (includes the `is_covered` call) | 0.1468325 XLM |

First writes pay rent for new storage entries plus 90 days of TTL, so later
updates to the same entry cost less. With the default settings (repost every
6 hours, or sooner when supply changes) the poster sends at least 4
transactions a day per asset. Reads
(`coverage`, `is_covered`) are free when simulated off-chain.
