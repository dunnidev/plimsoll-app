# For issuers

You issue an asset on Stellar and publish reserve statements. Plimsoll puts
your figure where contracts can read it, signed by your issuer account, so
nobody else can post at your tier.

## Before you start

* Your asset is listed. If not, use the [List page](https://plimsoll-protocol.github.io/plimsoll-app/list/); anyone can list.
* You can sign with your **issuer account** in Freighter. If the issuer key is
  in cold storage, sign the prepared transaction offline instead (see below).
* Your statement is published at a stable URL.

## Post a report from the app

1. Open **Post a report** and connect Freighter with the issuer account. The
   page shows **Will post as Issuer-signed**.
2. Pick the asset.
3. Enter **Reserves held** in units of the asset. For a dollar stablecoin with
   $1,020,000 in reserves, enter `1,020,000`.
4. Enter **As of**: the date the statement describes.
5. Paste the statement URL, then **Upload** the same file (or **Hash from
   URL**). The SHA-256 is computed in your browser.
6. **Sign and post.** The page links to the transaction.

## Post without the app

```bash
stellar contract invoke --network testnet --source <issuer-identity> \
  --id CC2QQ7R4FLPHZP7KA5AO4IASXXICTG6N4GQXCXITTEBNYQEYTYXKMN4D -- \
  post_reserve \
  --reporter <ISSUER_G_ADDRESS> \
  --sac <ASSET_SAC> \
  --amount 10200000000000 \
  --as_of 1791158400 \
  --doc_hash $(sha256sum statement.pdf | cut -d' ' -f1) \
  --doc_uri https://example.com/reserves/2026-10.pdf
```

`--amount` is in 7-decimal units: 1,020,000 × 10,000,000 = 10,200,000,000,000.

## Point your stellar.toml at it

SEP-1 lets you publish an `attestation_of_reserve` URL per currency. The
indexer reads it and shows it next to the on-chain figure.

```toml
[[CURRENCIES]]
code = "USDX"
issuer = "G..."
is_asset_anchored = true
anchor_asset = "USD"
attestation_of_reserve = "https://example.com/reserves/latest.pdf"
```

A working example is the testnet demo issuer's file at
[plimsoll-protocol.github.io/.well-known/stellar.toml](https://plimsoll-protocol.github.io/.well-known/stellar.toml).
Its issuer account's `home_domain` is set to `plimsoll-protocol.github.io`
([transaction](https://stellar.expert/explorer/testnet/tx/99b286676f578c6e2e87bb61c428808ea791b55e121efafaad1934717801cba4)),
and the PUSD asset page reads it live.

Two details that break this for many issuers:

* The file must be served with `Access-Control-Allow-Origin: *`, or browsers
  cannot read it.
* It must be at the exact `home_domain` set on the issuer account. Redirecting
  to another host (for example `example.com` → `www.example.com`) often drops
  the CORS header.

## Cadence

Post each time you publish a statement. Integrators typically require a report
younger than 7–31 days, so a monthly cadence keeps you inside most limits;
weekly is safer.
