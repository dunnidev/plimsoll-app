# reporter-registry

Decides who may post to the coverage ledger, and in which role. Holds no money.

## Functions

| Function | Parameters | Returns | Who can call | Triggered by |
| --- | --- | --- | --- | --- |
| `__constructor` | `admin: Address` | — | deployer | deployment |
| `admin` | — | `Address` | anyone | reads |
| `set_reporter` | `reporter: Address, role: Role, name: String` | — | admin | onboarding an auditor, transcriber or poster; also changes an existing role or name |
| `revoke` | `reporter: Address` | — | admin | removing a reporter |
| `role_of` | `reporter: Address` | `Option<Role>` | anyone | the ledger, on every post |
| `get_reporter` | `reporter: Address` | `Option<ReporterInfo>` | anyone | the app's "which tier will I get?" check |
| `transfer_admin` | `new_admin: Address` | — | admin **and** new admin | handover |
| `upgrade` | `wasm_hash: BytesN<32>` | — | admin | contract upgrade |

`ReporterInfo` is `{ role, name, added_at }`. Changing a reporter's role keeps
its original `added_at`.

## Errors

| Code | Name | When |
| --- | --- | --- |
| 1 | `ReporterNotFound` | `revoke` on an address that is not registered |
| 2 | `InvalidName` | `name` is empty or longer than 64 bytes |

## Events

| Event | Topics | Data |
| --- | --- | --- |
| `reporter_set` | `reporter` | `role`, `name` |
| `reporter_revoked` | `reporter` | — |
| `admin_transferred` | `new_admin` | — |

## Example

```bash
stellar contract invoke --network testnet --source plimsoll-admin \
  --id CCZCBR7MGSW5LGIEUQR5TU5Z7JQWBDEESB3RGPTRPMCBUMOISRPY7GOB -- \
  set_reporter --reporter G... --role 1 --name "Acme Audit LLP"
```
