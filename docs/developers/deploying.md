# Deploying

```
Browser ──▶ static app (GitHub Pages / Vercel)
   │  └──────────────▶ indexer API (Render web service) ──▶ Postgres (Render, same region)
   │                          │
   └── reads/writes ──▶ Soroban RPC ◀── post_supply ──┘
                              ▲
                     Horizon ─┘ (supply source)
```

The browser talks to RPC directly for contract reads and for submitting
signed transactions. The indexer is optional for the app and required for
history, breakdowns and stellar.toml data.

## 1. Contracts

```bash
cd plimsoll-contracts
./scripts/deploy-testnet.sh
```

It deploys in dependency order, registers the poster and a demo auditor,
issues a demo asset, lists assets, deploys the example vault, and prints:

```
REPORTER_REGISTRY_ID=C…
COVERAGE_LEDGER_ID=C…
COVERED_VAULT_ID=C…
```

## 2. Indexer on Render

1. In Render, **New → Blueprint**, and pick the `plimsoll-indexer` repo. It
   reads `render.yaml`: one Go web service and one Postgres database in the
   same region, connected by the internal URL.
2. When prompted, set `SUPPLY_POSTER_SECRET` to the poster's secret
   (`stellar keys show plimsoll-poster`). Leave it empty for read-only.
3. Deploy, then open `https://<service>.onrender.com/healthz`.

Build command: `go build -tags netgo -ldflags "-s -w" -o bin/plimsoll-indexer ./cmd/plimsoll-indexer`.
Start command: `./bin/plimsoll-indexer`.

Free Render services sleep when idle, and the poster stops while asleep.
Use a paid instance for a reliable poster.

## 3. App

**GitHub Pages** (current): the `pages.yml` workflow builds on every push to
`main` with `NEXT_PUBLIC_BASE_PATH=/plimsoll-app`, deploys, and then fetches
every page from the live URL. To connect the indexer, set a repository
variable `NEXT_PUBLIC_INDEXER_URL` (Settings → Secrets and variables →
Actions → Variables) and re-run the workflow.

**Vercel**: import the repo with root directory `apps/web`, install command
`cd ../.. && npm ci`, build command `cd ../.. && npm run build`, output
directory `out`. Set `NEXT_PUBLIC_*` variables in the project settings before
deploying.

## If the app still calls localhost in production

`NEXT_PUBLIC_*` values are compiled into the static files. If you set
`NEXT_PUBLIC_INDEXER_URL` after the build, the old value is still in the
files. Set it in the platform's build environment and rebuild.
