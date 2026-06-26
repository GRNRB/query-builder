import { createMDX } from 'fumadocs-mdx/next';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getBasePath } from './src/lib/base-path.mjs';

const withMDX = createMDX();

// Pin the workspace root so Next doesn't guess it from stray lockfiles higher up the tree.
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const basePath = getBasePath();

/** @type {import('next').NextConfig} */
const config = {
  serverExternalPackages: ['@takumi-rs/image-response'],
  // The `modern` example ships raw TSX source (no build step); Next transpiles it here.
  transpilePackages: ['modern'],
  output: 'export',
  reactStrictMode: true,
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: { root: repoRoot },
};

export default withMDX(config);
