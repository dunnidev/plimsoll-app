"use client";

import {
  getNetworkDetails,
  isConnected,
  requestAccess,
  signTransaction,
} from "@stellar/freighter-api";
import { config } from "./config";

export class WalletError extends Error {}

/** Ask Freighter for the user's address. */
export async function connectWallet(): Promise<string> {
  const conn = await isConnected();
  if (!conn.isConnected) {
    throw new WalletError("Freighter is not installed. Get it at freighter.app, then reload.");
  }
  const access = await requestAccess();
  if (access.error || !access.address) {
    throw new WalletError(access.error?.message ?? "Wallet access was refused.");
  }
  const net = await getNetworkDetails();
  if (!net.error && net.networkPassphrase !== config.network.networkPassphrase) {
    throw new WalletError(`Switch Freighter to ${config.networkName} and try again.`);
  }
  return access.address;
}

export async function signXdr(xdr: string, address: string): Promise<string> {
  const res = await signTransaction(xdr, {
    networkPassphrase: config.network.networkPassphrase,
    address,
  });
  if (res.error || !res.signedTxXdr) {
    throw new WalletError(res.error?.message ?? "Signing was cancelled.");
  }
  return res.signedTxXdr;
}
