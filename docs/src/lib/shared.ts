export const appName = 'query-builder';
export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

// Must match `basePath` in next.config.mjs. The static search client uses it to fetch the
// pre-built index from the correct sub-path on GitHub Pages (see src/components/search.tsx).
const isProd = process.env.NODE_ENV === 'production';
export const basePath =
  process.env.NEXT_PUBLIC_BASE_PATH ?? (isProd ? '/query-builder' : '');

export const gitConfig = {
  user: 'GRNRB',
  repo: 'query-builder',
  branch: 'main',
};

export const npmPackages = {
  core: 'https://www.npmjs.com/package/@grnrb/query-builder-core',
  react: 'https://www.npmjs.com/package/@grnrb/react-query-builder',
};
