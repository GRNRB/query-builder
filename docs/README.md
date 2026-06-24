# @grnrb/docs

Documentation site for **query-builder**, built with [Fumadocs](https://fumadocs.dev)
(Next.js App Router, **static export**) and deployed to **GitHub Pages** at
<https://grnrb.github.io/query-builder/>.

## Develop

```sh
# from the repo root — build the libraries the docs import first
pnpm --filter './packages/*' run build
pnpm --filter @grnrb/docs dev            # http://localhost:3000
```

## Build (static export)

```sh
pnpm --filter @grnrb/docs build          # outputs docs/out
pnpm --filter @grnrb/docs start          # serve docs/out locally
```

Production builds are served from the `/query-builder` sub-path (`basePath` in
[next.config.mjs](./next.config.mjs)); `next dev` stays at `/`. Override with
`NEXT_PUBLIC_BASE_PATH`.

## Deploy

Pushed automatically by [`.github/workflows/deploy-docs.yml`](../.github/workflows/deploy-docs.yml)
on every push to `main` that touches `docs/**` or `packages/**`. Requires the repo's
**Settings → Pages → Source** to be set to **GitHub Actions** (one-time).

## Layout

- **`content/docs/*.mdx`** — the documentation pages and `meta.json` navigation.
- **`src/components/playground.tsx`** — the live demo (a trimmed port of
  `examples/basic/src/App.tsx`); embedded in MDX as `<Playground />`.
- **`src/components/type-table.tsx`** — wires `fumadocs-typescript`; `<AutoTypeTable />`
  generates API tables straight from the library's TypeScript source.
- Static **search** (`src/app/api/search/route.ts` + `src/components/search.tsx`) and
  **OG images** (`src/app/og/...`) are prerendered at build time.
