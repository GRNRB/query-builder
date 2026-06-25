import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { AutoTypeTable } from '@/components/type-table';
import { Playground } from '@/components/playground';
import { VanillaPlayground } from '@/components/vanilla-playground';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    // `<AutoTypeTable name="..." />` renders a prop/field table from the real TS source.
    // `<Playground />` embeds the live React-hook demo; `<VanillaPlayground />` the core one.
    AutoTypeTable,
    Playground,
    VanillaPlayground,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
