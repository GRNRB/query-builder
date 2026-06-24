import type {
  Action,
  ConditionNodeInput,
  QueryNode,
  QueryNodeInput,
  QuerySchema,
  ValidateFieldDefaults,
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

/** Resolves the final patch for a condition update, resetting operator/value when the new field doesn't support the current operator. */
export function buildConditionPatch<TSchema extends QuerySchema>(
  schema: TSchema,
  current: QueryNode<TSchema>,
  patch: Partial<ConditionNodeInput<TSchema>>,
): Partial<ConditionNodeInput<TSchema>> {
  if (
    !("field" in patch) ||
    patch.field === undefined ||
    current.type !== "condition"
  )
    return patch;

  const conditionNode = current;
  const currentOp = conditionNode.operator;
  const newField = schema.fields.find((f) => f.id === patch.field);

  if (!newField || newField.supportedOperators.includes(currentOp))
    return patch;

  return {
    ...patch,
    operator: newField.defaultOperator ?? newField.supportedOperators[0],
    value: undefined,
  };
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

export function defineSchema<const TSchema extends QuerySchema>(
  schema: TSchema &
    QuerySchema<
      TSchema["fields"][number]["id"],
      TSchema["conditionOperators"][number],
      NonNullable<TSchema["groupOperators"]>[number]
    > & { readonly fields: ValidateFieldDefaults<TSchema["fields"]> },
): TSchema {
  if (process.env.NODE_ENV !== "production") {
    const fieldIds = schema.fields.map((f) => f.id);
    const dupField = fieldIds.find((id, i) => fieldIds.indexOf(id) !== i);
    if (dupField) {
      console.warn(`[defineSchema] Duplicate field id: "${dupField}"`);
    }

    const opIds = schema.conditionOperators.map((o) => o.id);
    const dupOp = opIds.find((id, i) => opIds.indexOf(id) !== i);
    if (dupOp) {
      console.warn(`[defineSchema] Duplicate conditionOperator id: "${dupOp}"`);
    }

    for (const field of schema.fields) {
      if (
        field.defaultOperator !== undefined &&
        !field.supportedOperators.includes(field.defaultOperator)
      ) {
        console.warn(
          `[defineSchema] Field "${field.id}" has defaultOperator "${field.defaultOperator}" which is not in supportedOperators.`,
        );
      }
    }
  }
  return schema;
}

export function reducer<TSchema extends QuerySchema>(
  state: QueryNode<TSchema>,
  action: Action<TSchema>,
): QueryNode<TSchema> {
  switch (action.type) {
    case "APPEND_NODE":
      return appendToGroup(state, action.groupId, action.node);

    case "INSERT_NODE":
      return insertIntoGroup(state, action.groupId, action.index, action.node);

    case "MOVE_NODE":
      return moveNode(state, action.nodeId, action.targetGroupId, action.index);

    case "REMOVE_NODE":
      return removeNode(state, action.nodeId);

    case "UPDATE_NODE":
      return updateNode(state, action.nodeId, (node) =>
        node.type === "condition" ? { ...node, ...action.patch } : node,
      );

    case "UPDATE_GROUP_OPERATOR":
      return updateNode(state, action.groupId, (node) =>
        node.type === "group" ? { ...node, operator: action.operator } : node,
      );
  }
}
