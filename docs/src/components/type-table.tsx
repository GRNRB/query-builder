import { createGenerator } from 'fumadocs-typescript';
import { AutoTypeTable as BaseAutoTypeTable } from 'fumadocs-typescript/ui';
import type { ComponentProps } from 'react';

// One generator instance for the whole build. It reads the actual library TypeScript
// source (see content/docs/**/*.mdx `<AutoTypeTable path="..." />`) so the rendered
// prop/field tables — and their JSDoc — always track the real types.
const generator = createGenerator();

export function AutoTypeTable(
  props: Omit<ComponentProps<typeof BaseAutoTypeTable>, 'generator'>,
) {
  return <BaseAutoTypeTable generator={generator} {...props} />;
}
