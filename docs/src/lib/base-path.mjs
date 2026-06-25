// Single source of truth for the deployment base path, imported by both next.config.mjs
// (build/runtime routing) and src/lib/shared.ts (the static search client's fetch path).
//
// Deployed to GitHub Pages as a project site at https://grnrb.github.io/query-builder/, so
// production builds are served from the `/query-builder` sub-path; `next dev` stays at the
// root for a clean local DX. Override with NEXT_PUBLIC_BASE_PATH (e.g. '' for a custom domain
// / user page served from the root).
export function getBasePath() {
  const isProd = process.env.NODE_ENV === 'production';
  return process.env.NEXT_PUBLIC_BASE_PATH ?? (isProd ? '/query-builder' : '');
}
