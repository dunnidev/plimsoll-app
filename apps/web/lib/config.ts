import { TESTNET, type NetworkConfig } from "@plimsoll/sdk";

/**
 * Runtime configuration, baked in at build time from NEXT_PUBLIC_* variables.
 * Every value defaults to the v0.1 testnet deployment, so a plain `npm run
 * dev` works with no .env file.
 */
export interface AppConfig {
  network: NetworkConfig;
  networkName: string;
  /** Plimsoll indexer base URL. Empty means read everything from the chain. */
  indexerUrl: string;
  /** SAC addresses shown when reading straight from the chain. */
  chainAssets: string[];
  explorerUrl: string;
  basePath: string;
}

const env = (v: string | undefined, fallback: string) => (v && v.trim() ? v.trim() : fallback);

export const config: AppConfig = {
  network: {
    rpcUrl: env(process.env.NEXT_PUBLIC_STELLAR_RPC_URL, TESTNET.rpcUrl),
    horizonUrl: env(process.env.NEXT_PUBLIC_HORIZON_URL, TESTNET.horizonUrl ?? ""),
    networkPassphrase: env(process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE, TESTNET.networkPassphrase),
    coverageLedgerId: env(process.env.NEXT_PUBLIC_COVERAGE_LEDGER_ID, TESTNET.coverageLedgerId),
    reporterRegistryId: env(process.env.NEXT_PUBLIC_REPORTER_REGISTRY_ID, TESTNET.reporterRegistryId),
  },
  networkName: env(process.env.NEXT_PUBLIC_NETWORK_NAME, "testnet"),
  indexerUrl: ((url) => (url === "none" ? "" : url))(
    env(process.env.NEXT_PUBLIC_INDEXER_URL, "https://plimsoll-indexer.onrender.com"),
  ),
  chainAssets: env(
    process.env.NEXT_PUBLIC_CHAIN_ASSETS,
    Object.values(TESTNET.assets)
      .map((a) => a.sac)
      .join(","),
  )
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  explorerUrl: env(
    process.env.NEXT_PUBLIC_EXPLORER_URL,
    "https://stellar.expert/explorer/testnet",
  ),
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
};

export const explorer = {
  tx: (hash: string) => `${config.explorerUrl}/tx/${hash}`,
  contract: (id: string) => `${config.explorerUrl}/contract/${id}`,
  account: (id: string) => `${config.explorerUrl}/account/${id}`,
};
