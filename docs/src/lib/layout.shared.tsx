import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName, gitConfig, npmPackages } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: appName,
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
    links: [
      {
        text: 'Docs',
        url: '/docs',
        active: 'nested-url',
      },
      {
        text: 'core (npm)',
        url: npmPackages.core,
        external: true,
      },
      {
        text: 'react (npm)',
        url: npmPackages.react,
        external: true,
      },
    ],
  };
}
