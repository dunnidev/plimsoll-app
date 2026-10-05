# Security policy

The app and SDK are unaudited and target Stellar testnet.

## Reporting

Report privately via
[Security → Report a vulnerability](https://github.com/plimsoll-protocol/plimsoll-app/security/advisories/new).
Include the affected page or SDK function, the impact, and steps to reproduce.
Do not open public issues for vulnerabilities. We aim to respond within 72 hours.

## Scope

In scope: transaction construction in `@plimsoll/sdk` (wrong arguments, wrong
network, wrong source), anything that could make a user sign something other
than what the page shows, XSS through asset codes, stellar.toml data or
document URLs, and hash-verification logic that can report a false match.

Out of scope: Freighter itself, RPC availability, and the accuracy of reserve
figures posted by reporters.

## Design notes

- The app never handles secret keys. All signing happens in the wallet.
- Document and breakdown hashes are computed in the browser with Web Crypto.
- Data from stellar.toml files is rendered as text, never as HTML.
