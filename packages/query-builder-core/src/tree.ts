import type {
  QueryNode,
  QueryNodeInput,
  QuerySchema,
} from "./type";

export const defaultGenerateId = (): string => crypto.randomUUID();

/** Recursively assigns ids to any node in the tree that is missing one. */
export function normalizeTree<TSchema extends QuerySchema>(
  node: QueryNodeInput<TSchema>,
  generateId: () => string = defaultGenerateId,
): QueryNode<TSchema> {
  const id = node.id ?? generateId();
  if (node.type === "group") {
    return {
      ...node,
      id,
      children: node.children.map((child) => normalizeTree(child, generateId)),
    };
  }
  return { ...node, id };
}

/** Applies `updater` to the node matching `id`, leaving all other nodes unchanged. */
export function updateNode<TSchema extends QuerySchema>(
  root: QueryNode<TSchema>,
  id: string,
  updater: (node: QueryNode<TSchema>) => QueryNode<TSchema>,
): QueryNode<TSchema> {
  if (root.id === id) return updater(root);
  if (root.type !== "group") return root;

  const children = root.children;
  const nextChildren = children.map((child) => updateNode(child, id, updater));

  if (nextChildren.every((c, i) => c === children[i])) return root;
  return { ...root, children: nextChildren };
}

/** Removes the node with the given `id` from the tree, returning the updated root. */
export function removeNode<TSchema extends QuerySchema>(
  root: QueryNode<TSchema>,
  id: string,
): QueryNode<TSchema> {
  if (root.id === id) {
    if (process.env.NODE_ENV !== "production")
      console.warn("[removeNode] Cannot remove the root node.");
    return root;
  }
  if (root.type !== "group") return root;

  const children = root.children;
  const filteredChildren = children.filter((child) => child.id !== id);

  if (filteredChildren.length < children.length) {
    return { ...root, children: filteredChildren };
  }

  const nextChildren = children.map((child) => removeNode(child, id));
  if (nextChildren.every((c, i) => c === children[i])) return root;
  return { ...root, children: nextChildren };
}

/** Appends `node` as the last child of the group matching `groupId`. */
export function appendToGroup<TSchema extends QuerySchema>(
  root: QueryNode<TSchema>,
  groupId: string,
  node: QueryNode<TSchema>,
): QueryNode<TSchema> {
  if (root.type !== "group") return root;

  if (root.id === groupId) {
    return {
      ...root,
      children: [...root.children, node],
    };
  }

  const nextChildren = root.children.map((child) =>
    appendToGroup(child, groupId, node),
  );

  if (nextChildren.every((c, i) => c === root.children[i])) return root;
  return { ...root, children: nextChildren };
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

/** Inserts `node` at `index` inside the group matching `groupId` (clamped to array length). */
export function insertIntoGroup<TSchema extends QuerySchema>(
  root: QueryNode<TSchema>,
  groupId: string,
  index: number,
  node: QueryNode<TSchema>,
): QueryNode<TSchema> {
  if (root.type !== "group") return root;

  if (root.id === groupId) {
    const children = [...root.children];
    children.splice(Math.max(0, Math.min(index, children.length)), 0, node);
    return { ...root, children };
  }

  const nextChildren = root.children.map((child) =>
    insertIntoGroup(child, groupId, index, node),
  );

  if (nextChildren.every((c, i) => c === root.children[i])) return root;
  return { ...root, children: nextChildren };
}

/**
 * Moves the node matching `nodeId` to `targetGroupId` at `index` (appends if omitted).
 * Returns the root unchanged when `nodeId` is not found, when `targetGroupId` does not
 * exist, or when `targetGroupId` is `nodeId` itself or one of its descendants (which would
 * orphan the moved subtree).
 */
export function moveNode<TSchema extends QuerySchema>(
  root: QueryNode<TSchema>,
  nodeId: string,
  targetGroupId: string,
  index?: number,
): QueryNode<TSchema> {
  const nodeToMove = findNode(root, nodeId);
  if (!nodeToMove) return root;

  // Reject moving a node into itself or one of its own descendants: removing the node
  // first would take the target out of the tree, dropping the moved subtree entirely.
  if (findNode(nodeToMove, targetGroupId) !== undefined) return root;

  const withoutNode = removeNode(root, nodeId);

  // Guard against a stale/unknown target. Without this, the node has already been removed
  // and the failed insert would silently drop it from the tree.
  if (findNode(withoutNode, targetGroupId) === undefined) return root;

  return insertIntoGroup(
    withoutNode,
    targetGroupId,
    index ?? Infinity,
    nodeToMove,
  );
}
