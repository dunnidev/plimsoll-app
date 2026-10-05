"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { config, explorer } from "@/lib/config";
import { PlimsollMark } from "./ui";

const NAV = [
  { href: "/", label: "Assets" },
  { href: "/report/", label: "Post a report" },
  { href: "/list/", label: "List an asset" },
  { href: "/integrate/", label: "Integrate" },
  { href: "/about/", label: "How it works" },
];

export function Header() {
  const path = usePathname();
  return (
    <header className="site-header">
      <div className="wrap">
        <Link href="/" className="brand">
          <PlimsollMark />
          Plimsoll
        </Link>
        <span className="net-pill">{config.networkName}</span>
        <nav className="nav" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={path === item.href || (item.href !== "/" && path?.startsWith(item.href)) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <span>Plimsoll — reserve coverage for Stellar-issued assets. Unaudited software on {config.networkName}.</span>
        <span className="row">
          <a href={explorer.contract(config.network.coverageLedgerId)} target="_blank" rel="noreferrer">
            Coverage ledger
          </a>
          <a href="https://github.com/plimsoll-protocol/plimsoll-contracts" target="_blank" rel="noreferrer">
            Contracts
          </a>
          <a href="https://github.com/plimsoll-protocol/plimsoll-app" target="_blank" rel="noreferrer">
            App
          </a>
          <a href="https://github.com/plimsoll-protocol/plimsoll-indexer" target="_blank" rel="noreferrer">
            Indexer
          </a>
        </span>
      </div>
    </footer>
  );
}
