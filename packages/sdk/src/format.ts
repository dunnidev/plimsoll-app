import { NOTHING_OWED_BPS, Role, Tier } from "./types.js";

export const CLASSIC_DECIMALS = 7;

/**
 * Format an integer amount of smallest units as a decimal string with
 * thousands separators. Rounds down to `maxFractionDigits`.
 */
export function formatUnits(
  amount: bigint,
  decimals = CLASSIC_DECIMALS,
  maxFractionDigits = 2,
): string {
  const negative = amount < 0n;
  const abs = negative ? -amount : amount;
  const base = 10n ** BigInt(decimals);
  const whole = abs / base;
  const frac = abs % base;
  const wholeStr = whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  let fracStr = frac.toString().padStart(decimals, "0").slice(0, maxFractionDigits);
  fracStr = fracStr.replace(/0+$/, "");
  const sign = negative ? "-" : "";
  return fracStr ? `${sign}${wholeStr}.${fracStr}` : `${sign}${wholeStr}`;
}

/** Parse a decimal string ("1,020,000.5") into smallest units. */
export function parseUnits(value: string, decimals = CLASSIC_DECIMALS): bigint {
  const clean = value.replace(/[,\s_]/g, "");
  if (!/^\d+(\.\d+)?$/.test(clean)) {
    throw new Error(`Not a non-negative decimal number: "${value}"`);
  }
  const [whole = "0", frac = ""] = clean.split(".");
  if (frac.length > decimals) {
    throw new Error(`At most ${decimals} decimal places`);
  }
  return BigInt(whole) * 10n ** BigInt(decimals) + BigInt(frac.padEnd(decimals, "0") || "0");
}

/** 10200 → "102.00%". Returns null when nothing is owed. */
export function bpsToPercent(bps: number): string | null {
  if (bps === NOTHING_OWED_BPS) return null;
  return `${(bps / 100).toFixed(2)}%`;
}

export type CoverageStatus = "covered" | "under" | "stale" | "unknown";

/** Classify a coverage reading for display. */
export function coverageStatus(
  bps: number | null | undefined,
  ageSeconds: number | null | undefined,
  maxAgeSeconds = 31 * 24 * 3600,
): CoverageStatus {
  if (bps == null || ageSeconds == null) return "unknown";
  if (ageSeconds > maxAgeSeconds) return "stale";
  return bps >= 10_000 ? "covered" : "under";
}

export function tierLabel(tier: Tier): string {
  switch (tier) {
    case Tier.AuditorSigned:
      return "Auditor-signed";
    case Tier.IssuerSigned:
      return "Issuer-signed";
    case Tier.Transcribed:
      return "Transcribed";
    default:
      return "Unknown";
  }
}

/** Indexer tier names → enum. */
export function tierFromName(name: string): Tier | undefined {
  switch (name) {
    case "auditor_signed":
      return Tier.AuditorSigned;
    case "issuer_signed":
      return Tier.IssuerSigned;
    case "transcribed":
      return Tier.Transcribed;
    default:
      return undefined;
  }
}

export function roleLabel(role: Role): string {
  switch (role) {
    case Role.Auditor:
      return "Auditor";
    case Role.Transcriber:
      return "Transcriber";
    case Role.SupplyPoster:
      return "Supply poster";
    default:
      return "Unknown";
  }
}

/** "GABC…WXYZ" */
export function shortAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 1) return address;
  return `${address.slice(0, chars)}…${address.slice(-chars)}`;
}

/** "3 hours ago", "2 days ago". */
export function ago(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const units: [number, string][] = [
    [86_400, "day"],
    [3_600, "hour"],
    [60, "minute"],
  ];
  for (const [size, name] of units) {
    if (s >= size) {
      const n = Math.floor(s / size);
      return `${n} ${name}${n === 1 ? "" : "s"} ago`;
    }
  }
  return "just now";
}
