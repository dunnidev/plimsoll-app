# Contributing

Plimsoll takes part in the [Drips Stellar Wave](https://www.drips.network/wave/stellar).
Issues across the three repos carry complexity labels and are scoped so one
contributor can finish one in a Wave.

## Where the work is

| Repo | Open issues |
| --- | --- |
| Contracts | [plimsoll-contracts/issues](https://github.com/dunnidev/plimsoll-contracts/issues) |
| App and SDK | [plimsoll-app/issues](https://github.com/dunnidev/plimsoll-app/issues) |
| Indexer | [plimsoll-indexer/issues](https://github.com/dunnidev/plimsoll-indexer/issues) |

Start with `good first issue` if you are new to the codebase.

## How to contribute

1. Comment on the issue to be assigned. Wait for assignment.
2. Fork, branch, and make one change per pull request.
3. Run the repo's checks locally. CI runs the same job (`test`) and it must pass.
4. Use Conventional Commits: `feat(ledger): …`, `fix(web): …`.
5. Link the issue in the pull request (`Closes #12`).

Each repo's `CONTRIBUTING.md` lists its exact checks and coding standards.

## Rules that span repos

* Contract events are an interface. Changing one needs an issue in both
  `plimsoll-contracts` and `plimsoll-indexer`, cross-referenced with
  "Depends on".
* A frontend feature that needs a new contract function waits until that
  function is deployed to testnet.
* Amounts are integers in smallest units everywhere. No floats for money.

## Security

Report vulnerabilities privately through each repo's **Security** tab.
