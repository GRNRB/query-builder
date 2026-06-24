import { createMDX } from 'fumadocs-mdx/next';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const withMDX = createMDX();

// Pin the workspace root so Next doesn't guess it from stray lockfiles higher up the tree.
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Deployed to GitHub Pages as a project site at https://grnrb.github.io/query-builder/,
// so production builds are served from the `/query-builder` sub-path. `next dev` stays at
// the root for a clean local DX. Keep this in sync with `basePath` in src/lib/shared.ts
// (the search client needs the same value). Override with NEXT_PUBLIC_BASE_PATH (e.g. set
// it to '' for a custom domain / user page served from the root).
const isProd = process.env.NODE_ENV === 'production';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? (isProd ? '/query-builder' : '');

/** @type {import('next').NextConfig} */
const config = {
  serverExternalPackages: ['@takumi-rs/image-response'],
  output: 'export',
  reactStrictMode: true,
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: { root: repoRoot },
};

export default withMDX(config);
