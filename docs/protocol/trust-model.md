# Trust model

Plimsoll does not remove trust. It makes each trusted party visible and
checkable.

| Party | What you trust them for | How you can check |
| --- | --- | --- |
| Registry admin | Choosing auditors, transcribers and supply posters | Every change is a `reporter_set` / `reporter_revoked` event |
| Supply poster | Counting supply correctly | The breakdown hash is on-chain; recompute it from Horizon |
| Issuer | Its own reserve figure | The document hash is on-chain; the tier says it is self-reported |
| Auditor | An independent figure | Registered identity; document hash on-chain |
| Transcriber | Copying a published figure correctly | Document hash on-chain; lowest tier |

## What the contracts guarantee

* Only the issuer's account can post at the Issuer-signed tier.
* Only registered addresses can post at the Auditor-signed and Transcribed tiers.
* Only genuine Stellar Asset Contracts can be listed, with their real code and issuer.
* Supply snapshots and reports per tier only move forward in time.
* `coverage` and `is_covered` apply the same rule for everyone.

## What they do not guarantee

* That a reserve figure is true. A signer can lie; the tier tells you who did.
* That supply is counted correctly. The poster can be wrong; the hash lets
  anyone prove it.
* Availability. If nobody posts, readings age and `is_covered` starts
  returning `false`, which is the safe direction.

## Known gaps in v0.1

These are tracked as issues:

* No on-chain dispute of a supply snapshot.
* Admin transfer is one step, not propose-and-accept.
* Soroban-native (SEP-41) tokens are not supported.
* The contracts are unaudited.
