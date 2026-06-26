import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { AutoTypeTable } from '@/components/type-table';
import { Playground } from '@/components/playground';
import { ModernPlayground } from '@/components/modern-playground';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    // `<AutoTypeTable name="..." />` renders a prop/field table from the real TS source.
    // `<Playground />` embeds the live React-hook demo; `<ModernPlayground />` the keyboard-first one.
    AutoTypeTable,
    Playground,
    ModernPlayground,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
