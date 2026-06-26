'use client';

// Docs adapter for the standalone `modern` example (examples/react/modern).
//
// That example is a full-page MUI/emotion Vite app; here we render its `App` in `embedded`
// mode inside the example's own theme. We reuse the shared `PlaygroundMount` client-only gate
// so the MUI/emotion tree (and the builder's non-deterministic `crypto.randomUUID()` ids) only
// mount after hydration — no emotion SSR cache or hydration-mismatch handling needed for the
// static export. `ScopedCssBaseline` keeps MUI's baseline from restyling the rest of the page.

import { ThemeProvider } from '@mui/material/styles';
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline';
import App from 'modern/app';
import theme from 'modern/theme';
import { PlaygroundMount } from './playground/widget';

export function ModernPlayground() {
  return (
    <PlaygroundMount>
      <ThemeProvider theme={theme}>
        <ScopedCssBaseline sx={{ bgcolor: 'transparent' }}>
          <App embedded />
        </ScopedCssBaseline>
      </ThemeProvider>
    </PlaygroundMount>
  );
}

export default ModernPlayground;
