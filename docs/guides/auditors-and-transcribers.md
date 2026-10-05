# For auditors and transcribers

## Getting registered

Both roles are granted by the registry admin. Open an issue in
[plimsoll-contracts](https://github.com/plimsoll-protocol/plimsoll-contracts/issues)
with:

* the Stellar account you will sign with,
* the display name to show (max 64 characters),
* for auditors: your firm and a public page that confirms the engagement.

The admin calls `set_reporter`. You can confirm with:

```bash
stellar contract invoke --network testnet --send=no \
  --id CCZCBR7MGSW5LGIEUQR5TU5Z7JQWBDEESB3RGPTRPMCBUMOISRPY7GOB -- \
  get_reporter --reporter <YOUR_G_ADDRESS>
```

## Auditors

Your reports carry the strongest tier. Integrators that require
`min_tier = AuditorSigned` see only your figures.

Post the figure from your attestation, with **As of** set to the attestation
date, and the URL and hash of the signed document. Use the app's
[Post a report](https://plimsoll-protocol.github.io/plimsoll-app/report/) page; it
shows **Will post as Auditor-signed** once you connect.

## Transcribers

You copy figures from reports that issuers or auditors have already
published, for assets whose issuers are not posting themselves. Your reports
are the lowest tier and are labelled *Transcribed* everywhere.

Rules:

1. Copy the figure exactly as published. Do not adjust or convert it.
2. **As of** is the date in the document, not today.
3. Link the issuer's own URL for the document, and hash the exact file.
4. One report per published document. The contract rejects a report that is
   not newer than your last one for the same asset.

## Mistakes

A report cannot be edited or deleted. If you post a wrong figure, post a
corrected one with a later `as_of` and explain it in an issue. If you think
another reporter's figure is wrong, open an issue with the evidence.
