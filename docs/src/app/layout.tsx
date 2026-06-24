import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Provider } from '@/components/provider';
import { appName, basePath } from '@/lib/shared';
import './global.css';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  // Resolves relative Open Graph / Twitter image URLs. In production the site is served
  // from the GitHub Pages sub-path; locally it falls back to localhost.
  metadataBase: new URL(
    process.env.NODE_ENV === 'production'
      ? `https://grnrb.github.io${basePath}`
      : 'http://localhost:3000',
  ),
  title: {
    default: appName,
    template: `%s · ${appName}`,
  },
  description:
    'Framework-agnostic core and React hook for building structured, fully-typed query and filter trees.',
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
