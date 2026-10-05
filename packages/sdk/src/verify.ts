/** Hex sha256 using Web Crypto (browsers and Node 20+). */
export async function sha256Hex(data: Uint8Array | ArrayBuffer): Promise<string> {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes as BufferSource);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** True when sha256(body) equals the hash recorded on-chain. */
export async function matchesHash(body: Uint8Array, expectedHex: string): Promise<boolean> {
  return (await sha256Hex(body)) === expectedHex.toLowerCase();
}

export interface SupplyBreakdown {
  asset: string;
  ledger: number;
  authorized: string;
  authorized_to_maintain_liabilities: string;
  unauthorized: string;
  claimable_balances: string;
  liquidity_pools: string;
  contracts: string;
  total: string;
}

export function parseBreakdown(body: Uint8Array): SupplyBreakdown {
  return JSON.parse(new TextDecoder().decode(body)) as SupplyBreakdown;
}
