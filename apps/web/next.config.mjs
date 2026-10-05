// Static export: the app is plain files and runs on any static host
// (GitHub Pages, Vercel, Netlify). All data is fetched in the browser from
// Soroban RPC and, when configured, the Plimsoll indexer.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  transpilePackages: ["@plimsoll/sdk"],
};

export default nextConfig;
