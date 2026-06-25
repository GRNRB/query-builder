// Depth-cycling accent colors for nested brackets, so each nesting level reads
// as a distinct pair of brackets.
const BRACKET_COLORS = ["#6366f1", "#a855f7", "#16a34a", "#ea580c"];

export const bracketColor = (depth: number): string =>
  BRACKET_COLORS[depth % BRACKET_COLORS.length];
