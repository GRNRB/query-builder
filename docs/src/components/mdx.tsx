import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { AutoTypeTable } from '@/components/type-table';
import { Playground } from '@/components/playground';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    // `<AutoTypeTable name="..." />` renders a prop/field table from the real TS source
    // (see content/docs/core/types.mdx). `<Playground />` embeds the live interactive demo.
    AutoTypeTable,
    Playground,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
