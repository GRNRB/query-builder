import { findNode as coreFindNode } from "@grnrb/react-query-builder";
import type { Node, S } from "../schema";

// `findNode`'s schema generic can't be inferred from a `QueryNode<S>` argument
// (it falls back to the base schema), so we pin it to our schema once here and
// reuse the typed version everywhere.
export const findNode = (root: Node, id: string): Node | undefined =>
  coreFindNode<S>(root, id);
