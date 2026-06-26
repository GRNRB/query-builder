import type {
  QueryNode,
  QueryNodeInput,
  QuerySchema,
} from "./type";

export const defaultGenerateId = (): string => crypto.randomUUID();

/** Recursively assigns ids to any node in the query that is missing one. */
export function normalizeQuery<TSchema extends QuerySchema>(
  node: QueryNodeInput<TSchema>,
  generateId: () => string = defaultGenerateId,
): QueryNode<TSchema> {
  const id = node.id ?? generateId();
  if (node.type === "group") {
    return {
      ...node,
      id,
      children: node.children.map((child) => normalizeQuery(child, generateId)),
    };
  }
  return { ...node, id };
}

/** Returns the first node matching `id` via depth-first search, or `undefined` if not found. */
export function findNode<TSchema extends QuerySchema>(
  root: QueryNode<TSchema>,
  id: string,
): QueryNode<TSchema> | undefined {
  if (root.id === id) return root;
  if (root.type !== "group") return undefined;
  for (const child of root.children) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return undefined;
}
