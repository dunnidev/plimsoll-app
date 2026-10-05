# Overview and addresses

| Contract | Responsibility | Depends on |
| --- | --- | --- |
| `reporter-registry` | Who may post, and in what role | — |
| `coverage-ledger` | Listings, supply snapshots, reserve reports, coverage queries | registry, Stellar Asset Contracts |
| `covered-vault` | Example consumer that gates deposits on `is_covered` | coverage-ledger, the asset's SAC |

Deploy order follows the dependencies: registry, then ledger, then any
consumer.

## Testnet (v0.1)

| Contract | Address |
| --- | --- |
| reporter-registry | [`CCZCBR7MGSW5LGIEUQR5TU5Z7JQWBDEESB3RGPTRPMCBUMOISRPY7GOB`](https://stellar.expert/explorer/testnet/contract/CCZCBR7MGSW5LGIEUQR5TU5Z7JQWBDEESB3RGPTRPMCBUMOISRPY7GOB) |
| coverage-ledger | [`CC2QQ7R4FLPHZP7KA5AO4IASXXICTG6N4GQXCXITTEBNYQEYTYXKMN4D`](https://stellar.expert/explorer/testnet/contract/CC2QQ7R4FLPHZP7KA5AO4IASXXICTG6N4GQXCXITTEBNYQEYTYXKMN4D) |
| covered-vault | [`CC3SUECAJSAC4PBV4QLUII7X5Y4WNVL5YGTBAQ4CHCAH6R3QLRYJUZHQ`](https://stellar.expert/explorer/testnet/contract/CC3SUECAJSAC4PBV4QLUII7X5Y4WNVL5YGTBAQ4CHCAH6R3QLRYJUZHQ) |

Listed assets:

| Asset | Issuer | SAC |
| --- | --- | --- |
| PUSD (demo) | `GBIE3ANCRVCBWETUZXWYKRMP27LQVJHX757XXAQUT3LYHVTNFPPPXEY4` | `CCHPT4TEJDPZQDSUVW3NP6A35ROGV4WEFZKT45SKWYCFZSUB7R5HIM7S` |
| USDC (Circle testnet) | `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5` | `CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA` |

## Shared types

| Type | Values / fields |
| --- | --- |
| `Role` (u32) | `Auditor = 1`, `Transcriber = 2`, `SupplyPoster = 3` |
| `Tier` (u32) | `Transcribed = 1`, `IssuerSigned = 2`, `AuditorSigned = 3` |
| `AssetRecord` | `sac`, `code`, `issuer`, `listed_at` |
| `SupplySnapshot` | `amount: i128`, `ledger: u32`, `timestamp: u64`, `breakdown_hash: BytesN<32>`, `poster` |
| `ReserveReport` | `amount: i128`, `as_of: u64`, `posted_at: u64`, `tier`, `reporter`, `doc_hash: BytesN<32>`, `doc_uri: String` |
| `Coverage` | `bps: u32`, `supply`, `reserves`, `tier`, `supply_ledger`, `supply_timestamp`, `report_as_of` |

## Storage and TTL

Admin and configuration live in instance storage. Everything else is
persistent. Every write, and every read of an existing entry, extends the
entry to 90 days once it has fewer than 30 days left.

The authoritative specification is
[docs/SPEC.md](https://github.com/plimsoll-protocol/plimsoll-contracts/blob/main/docs/SPEC.md)
in the contracts repo.
