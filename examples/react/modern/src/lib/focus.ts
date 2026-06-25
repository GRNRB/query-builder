import { arityOf } from "../schema";
import type { Node } from "../schema";

// A "focusable" is one keyboard stop in the inline expression: a single chip
// (field / operator / value), a bracket, or a group's AND/OR combinator.

export type FocusPart =
  | "field"
  | "operator"
  | "value"
  | "combinator"
  | "bracket-open"
  | "bracket-close";

export interface Focus {
  nodeId: string;
  part: FocusPart;
}

/** Stable DOM-registry key for a token. */
export const tokenKey = (f: Focus): string => `${f.nodeId}:${f.part}`;

export const sameFocus = (a: Focus | null, b: Focus | null): boolean =>
  a != null && b != null && a.nodeId === b.nodeId && a.part === b.part;

/**
 * Flattens the tree into the left-to-right reading order of keyboard stops, so
 * ArrowLeft/ArrowRight (and Tab) move linearly, descending into and out of
 * nested groups. A group exposes a single focusable combinator (the first gap);
 * an empty group exposes a combinator placeholder so it can still be acted on.
 */
export function flattenFocusables(
  node: Node,
  isRoot: boolean,
  out: Focus[] = [],
): Focus[] {
  if (node.type === "condition") {
    out.push({ nodeId: node.id, part: "field" });
    out.push({ nodeId: node.id, part: "operator" });
    if (arityOf(node.operator) !== "none")
      out.push({ nodeId: node.id, part: "value" });
    return out;
  }

  out.push({ nodeId: node.id, part: "bracket-open" });

  if (node.children.length === 0) {
    out.push({ nodeId: node.id, part: "combinator" });
  } else {
    node.children.forEach((child, i) => {
      if (i === 1) out.push({ nodeId: node.id, part: "combinator" });
      flattenFocusables(child, false, out);
    });
  }

  out.push({ nodeId: node.id, part: "bracket-close" });
  return out;
}

/** Where focus should land when we "enter" a freshly created/moved node. */
export function firstFocusableOf(node: Node): Focus {
  if (node.type === "condition") return { nodeId: node.id, part: "field" };
  if (node.children.length > 0) return firstFocusableOf(node.children[0]);
  return { nodeId: node.id, part: "combinator" };
}

/** Parent group id + child index of a node (null for the root). */
export function findParentAndIndex(
  node: Node,
  childId: string,
): { parentId: string; index: number } | null {
  if (node.type !== "group") return null;
  for (let i = 0; i < node.children.length; i++) {
    if (node.children[i].id === childId) return { parentId: node.id, index: i };
    const found = findParentAndIndex(node.children[i], childId);
    if (found) return found;
  }
  return null;
}

/** Chain of nodes from the root down to (and including) the target. */
export function pathTo(node: Node, id: string, acc: Node[] = []): Node[] | null {
  const next = [...acc, node];
  if (node.id === id) return next;
  if (node.type === "group") {
    for (const child of node.children) {
      const found = pathTo(child, id, next);
      if (found) return found;
    }
  }
  return null;
}
