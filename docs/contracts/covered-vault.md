# covered-vault

A reference consumer. It holds one asset and refuses **deposits** while the
asset is not covered. **Withdrawals are never blocked**, so a coverage lapse
cannot trap users' funds. Copy the pattern into your own contract.

## Functions

| Function | Parameters | Returns | Who can call |
| --- | --- | --- | --- |
| `__constructor` | `ledger, asset, min_bps: u32, max_age: u64, min_tier: Tier` | — | deployer |
| `deposit` | `from: Address, amount: i128` | new balance | `from` |
| `withdraw` | `to: Address, amount: i128` | new balance | `to` |
| `balance` | `of: Address` | `i128` | anyone |
| `config` | — | `VaultConfig` | anyone |

## Errors

| Code | Name | When |
| --- | --- | --- |
| 1 | `InvalidAmount` | amount ≤ 0 |
| 2 | `NotCovered` | `is_covered` returned false at deposit time |
| 3 | `InsufficientBalance` | withdrawing more than deposited |

## The testnet instance

Configured with `min_bps = 10000` (100%), `max_age = 604800` (7 days),
`min_tier = IssuerSigned`, for PUSD. A 100 PUSD deposit on 5 October 2026
succeeded
([transaction](https://stellar.expert/explorer/testnet/tx/f86eecaa2eb6252bd4e79708966fc510573b8a9878771641b8f8b514d2804b5b)).

## The integration, in full

```rust
let cfg = config(&env);
let covered = CoverageLedgerClient::new(&env, &cfg.ledger).is_covered(
    &cfg.asset, &cfg.min_bps, &cfg.max_age, &cfg.min_tier,
);
if !covered {
    panic_with_error!(&env, VaultError::NotCovered);
}
```
