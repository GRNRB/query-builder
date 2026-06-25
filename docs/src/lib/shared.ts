import { getBasePath } from "./base-path.mjs";

export const appName = "Query Builder";
export const docsRoute = "/docs";
export const docsImageRoute = "/og/docs";
export const docsContentRoute = "/llms.mdx/docs";

// Shared with next.config.mjs. The static search client uses it to fetch the pre-built index
// from the correct sub-path on GitHub Pages (see src/components/search.tsx).
export const basePath = getBasePath();

export const gitConfig = {
  user: "GRNRB",
  repo: "query-builder",
  branch: "main",
};
