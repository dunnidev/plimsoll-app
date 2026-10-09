import type { NetworkConfig } from "./types";

/** The v0.1 testnet deployment (plimsoll-contracts/deployments/testnet.json). */
export const TESTNET: NetworkConfig & {
  assets: Record<string, { code: string; issuer: string; sac: string }>;
  coveredVaultId: string;
  /** Example vault for the under-backed QUSD demo asset; deposits are refused. */
  coveredVaultQusdId: string;
} = {
  rpcUrl: "https://soroban-testnet.stellar.org",
  horizonUrl: "https://horizon-testnet.stellar.org",
  networkPassphrase: "Test SDF Network ; September 2015",
  coverageLedgerId: "CC2QQ7R4FLPHZP7KA5AO4IASXXICTG6N4GQXCXITTEBNYQEYTYXKMN4D",
  reporterRegistryId: "CCZCBR7MGSW5LGIEUQR5TU5Z7JQWBDEESB3RGPTRPMCBUMOISRPY7GOB",
  coveredVaultId: "CC3SUECAJSAC4PBV4QLUII7X5Y4WNVL5YGTBAQ4CHCAH6R3QLRYJUZHQ",
  coveredVaultQusdId: "CBURLBHWLWOTKJ5NVF574NAYFM7Y25JB366ZDO7WGJXCVC4C72UVKTO5",
  assets: {
    PUSD: {
      code: "PUSD",
      issuer: "GBIE3ANCRVCBWETUZXWYKRMP27LQVJHX757XXAQUT3LYHVTNFPPPXEY4",
      sac: "CCHPT4TEJDPZQDSUVW3NP6A35ROGV4WEFZKT45SKWYCFZSUB7R5HIM7S",
    },
    USDC: {
      code: "USDC",
      issuer: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
      sac: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
    },
    // Deliberately under-backed (96%, transcribed) to show a refusal.
    QUSD: {
      code: "QUSD",
      issuer: "GCCMGQ3UGITN2HUUSQKTDMBFZ34QQTKMODR56NT26JMPH2MHVYWZMXNE",
      sac: "CBSQEFG73RMUVEZ56EFEBCJ23WZNF6FFYXEAJKYG6SZCLKDZ5B2YXGHS",
    },
  },
};
