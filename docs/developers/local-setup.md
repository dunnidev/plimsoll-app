# Local setup

You can run all three parts on one machine. Every default points at the
testnet deployment, so nothing needs deploying first.

## Requirements

| Tool | Version | For |
| --- | --- | --- |
| Rust | stable, with `wasm32v1-none` | contracts |
| Stellar CLI | 28.1 or later | building and deploying contracts |
| Go | 1.27 or later | indexer |
| Node.js | 22.12 or later | app and SDK |

No Docker or Postgres install is needed: the indexer ships an embedded
Postgres for development.

## Contracts

```bash
git clone https://github.com/dunnidev/plimsoll-contracts && cd plimsoll-contracts
rustup target add wasm32v1-none
cargo test               # 53 tests
stellar contract build   # soroban-sdk 28 requires building through the Stellar CLI
```

`cargo build --target wasm32v1-none` fails on purpose with soroban-sdk 28:
"soroban-sdk requires stellar-cli v25.2.0+ to build a contract". Use
`stellar contract build`.

## Indexer

```bash
git clone https://github.com/dunnidev/plimsoll-indexer && cd plimsoll-indexer
go run ./cmd/devdb &               # Postgres on localhost:54329
cp .env.example .env
set -a; . ./.env; set +a
go run ./cmd/plimsoll-indexer      # API on :8080
curl localhost:8080/v1/assets
```

Quote `STELLAR_NETWORK_PASSPHRASE` in `.env`: it contains spaces and a `;`.

## App

```bash
git clone https://github.com/dunnidev/plimsoll-app && cd plimsoll-app
npm install
echo "NEXT_PUBLIC_INDEXER_URL=http://localhost:8080" > apps/web/.env.local   # optional
npm run dev                         # http://localhost:3000
```

Without `NEXT_PUBLIC_INDEXER_URL` the app reads straight from the contracts.

## Signing transactions

Install [Freighter](https://www.freighter.app/), switch it to **Testnet**, and
fund the account with Friendbot:

```bash
curl "https://friendbot.stellar.org/?addr=<YOUR_G_ADDRESS>"
```
