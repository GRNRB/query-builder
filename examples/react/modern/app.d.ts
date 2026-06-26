// Public type boundary for `modern/app`. Consumers (e.g. the docs site) import this
// stub via the package's `exports.types` condition, so their typecheck never pulls the
// example's MUI-augmented source into its program. The runtime resolves to src/App.tsx.
import type { ComponentType } from "react";

declare const App: ComponentType<{ embedded?: boolean }>;
export default App;
