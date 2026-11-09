import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Shared workspace packages are shipped as TypeScript source.
  transpilePackages: ["@craft/db", "@craft/shared"],
  serverExternalPackages: ["mongoose"],
  turbopack: {
    root: path.join(__dirname, ".."),
  },
  images: {
    loader: "custom",
    loaderFile: "./lib/cloudinary-loader.ts",
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  poweredByHeader: false,
};

export default nextConfig;
