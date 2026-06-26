import { describe, it, expect, vi } from "vitest";
import {
  normalizeQuery,
  findNode,
  defineSchema,
  createReducer,
} from "../index";
import {
  updateNode,
  removeNode,
  appendToGroup,
  insertIntoGroup,
  moveNode,
} from "../query";

const schema = defineSchema({
  fields: [
    { id: "name", label: "Name", supportedOperators: ["eq", "contains"] },
    { id: "age", label: "Age", supportedOperators: ["eq", "gt"] },
  ],
  conditionOperators: [
    { id: "eq", arity: "one", label: "Equals" },
    { id: "contains", arity: "one", label: "Contains" },
    { id: "gt", arity: "one", label: "Greater than" },
  ],
  groupOperators: [
    { id: "and", arity: "many", label: "AND" },
    { id: "or", arity: "many", label: "OR" },
  ],
});

type S = typeof schema;

const baseInput = {
  type: "group" as const,
  operator: "and" as const,
  children: [
    {
      type: "condition" as const,
      field: "name" as const,
      operator: "eq" as const,
      value: "Alice",
    },
    {
      type: "condition" as const,
      field: "age" as const,
      operator: "gt" as const,
      value: 30,
    },
  ],
};

describe("normalizeQuery", () => {
  it("fills missing ids", () => {
    const result = normalizeQuery<S>(baseInput);
    expect(result.id).toBeTruthy();
    if (result.type === "group") {
      result.children.forEach((child) => expect(child.id).toBeTruthy());
    }
  });

  it("preserves existing ids", () => {
    const input = { ...baseInput, id: "my-root" };
    const result = normalizeQuery<S>(input);
    expect(result.id).toBe("my-root");
  });

  it("calls custom generateId", () => {
    let counter = 0;
    const generateId = vi.fn(() => `id-${++counter}`);
    normalizeQuery<S>(baseInput, generateId);
    expect(generateId).toHaveBeenCalledTimes(3); // root + 2 children
  });
});

describe("updateNode", () => {
  it("updates matching node", () => {
    const tree = normalizeQuery<S>({ ...baseInput, id: "root" });
    const updated = updateNode(
      tree,
      "root",
      (n) =>
        ({
          ...n,
          operator: "or",
        }) as typeof n,
    );
    expect((updated as { operator: string }).operator).toBe("or");
  });

  it("returns same reference if id not found", () => {
    const tree = normalizeQuery<S>({ ...baseInput, id: "root" });
    const updated = updateNode(tree, "nonexistent", (n) => n);
    expect(updated).toBe(tree);
  });
});

describe("removeNode", () => {
  it("removes a child condition", () => {
    const tree = normalizeQuery<S>({ ...baseInput, id: "root" });
    if (tree.type !== "group") throw new Error("expected group");
    const firstId = tree.children[0].id;
    const result = removeNode(tree, firstId);
    if (result.type !== "group") throw new Error("expected group");
    expect(result.children).toHaveLength(1);
    expect(result.children[0].id).not.toBe(firstId);
  });

  it("is a no-op for unknown id", () => {
    const tree = normalizeQuery<S>({ ...baseInput, id: "root" });
    const result = removeNode(tree, "ghost");
    if (result.type !== "group") throw new Error("expected group");
    expect(result.children).toHaveLength(2);
  });

  it("is a no-op when called with the root id", () => {
    const tree = normalizeQuery<S>({ ...baseInput, id: "root" });
    const result = removeNode(tree, "root");
    expect(result).toBe(tree);
  });
});

describe("appendToGroup", () => {
  it("appends a node to the matching group", () => {
    const tree = normalizeQuery<S>({ ...baseInput, id: "root" });
    const newCondition = normalizeQuery<S>({
      type: "condition",
      field: "name",
      operator: "contains",
      value: "li",
    });
    const result = appendToGroup(tree, "root", newCondition);
    if (result.type !== "group") throw new Error("expected group");
    expect(result.children).toHaveLength(3);
    expect(result.children[2].id).toBe(newCondition.id);
  });

  it("is a no-op for unknown group id", () => {
    const tree = normalizeQuery<S>({ ...baseInput, id: "root" });
    const extra = normalizeQuery<S>({
      type: "condition",
      field: "age",
      operator: "gt",
      value: 5,
    });
    const result = appendToGroup(tree, "ghost", extra);
    if (result.type !== "group") throw new Error("expected group");
    expect(result.children).toHaveLength(2);
  });
});

describe("findNode", () => {
  it("finds the root node", () => {
    const tree = normalizeQuery<S>({ ...baseInput, id: "root" });
    expect(findNode(tree, "root")).toBe(tree);
  });

  it("finds a child node", () => {
    const tree = normalizeQuery<S>({ ...baseInput, id: "root" });
    if (tree.type !== "group") throw new Error("expected group");
    const childId = tree.children[0].id;
    expect(findNode(tree, childId)).toBe(tree.children[0]);
  });

  it("finds a deeply nested node", () => {
    const nested = normalizeQuery<S>({
      id: "root",
      type: "group",
      operator: "and",
      children: [
        {
          id: "inner",
          type: "group",
          operator: "or",
          children: [
            {
              id: "leaf",
              type: "condition",
              field: "name",
              operator: "eq",
              value: "x",
            },
          ],
        },
      ],
    });
    const leaf = findNode(nested, "leaf");
    expect(leaf?.id).toBe("leaf");
  });

  it("returns undefined for unknown id", () => {
    const tree = normalizeQuery<S>({ ...baseInput, id: "root" });
    expect(findNode(tree, "ghost")).toBeUndefined();
  });
});

describe("insertIntoGroup", () => {
  it("inserts at index 0 (prepend)", () => {
    const tree = normalizeQuery<S>({ ...baseInput, id: "root" });
    const newNode = normalizeQuery<S>({
      type: "condition",
      field: "name",
      operator: "eq",
      value: "Z",
    });
    const result = insertIntoGroup(tree, "root", 0, newNode);
    if (result.type !== "group") throw new Error("expected group");
    expect(result.children[0].id).toBe(newNode.id);
    expect(result.children).toHaveLength(3);
  });

  it("inserts at a middle index", () => {
    const tree = normalizeQuery<S>({ ...baseInput, id: "root" });
    const newNode = normalizeQuery<S>({
      type: "condition",
      field: "name",
      operator: "eq",
      value: "M",
    });
    const result = insertIntoGroup(tree, "root", 1, newNode);
    if (result.type !== "group") throw new Error("expected group");
    expect(result.children[1].id).toBe(newNode.id);
  });

  it("clamps index beyond length to end", () => {
    const tree = normalizeQuery<S>({ ...baseInput, id: "root" });
    const newNode = normalizeQuery<S>({
      type: "condition",
      field: "age",
      operator: "gt",
      value: 99,
    });
    const result = insertIntoGroup(tree, "root", 100, newNode);
    if (result.type !== "group") throw new Error("expected group");
    expect(result.children[result.children.length - 1].id).toBe(newNode.id);
  });

  it("is a no-op for unknown group id and returns same reference", () => {
    const tree = normalizeQuery<S>({ ...baseInput, id: "root" });
    const newNode = normalizeQuery<S>({
      type: "condition",
      field: "age",
      operator: "eq",
      value: 0,
    });
    const result = insertIntoGroup(tree, "ghost", 0, newNode);
    expect(result).toBe(tree);
  });
});

describe("moveNode (tree utility)", () => {
  it("moves a node to a different group", () => {
    const innerGroup = {
      id: "inner",
      type: "group" as const,
      operator: "or" as const,
      children: [] as readonly never[],
    };
    const tree = normalizeQuery<S>({
      id: "root",
      type: "group",
      operator: "and",
      children: [
        {
          id: "cond1",
          type: "condition",
          field: "name",
          operator: "eq",
          value: "A",
        },
        innerGroup,
      ],
    });

    const result = moveNode(tree, "cond1", "inner");
    if (result.type !== "group") throw new Error("expected group");
    expect(result.children).toHaveLength(1); // cond1 removed from root
    const movedInner = result.children[0];
    if (movedInner.type !== "group") throw new Error("expected group");
    expect(movedInner.children).toHaveLength(1);
    expect(movedInner.children[0].id).toBe("cond1");
  });

  it("moves a node within the same group", () => {
    const tree = normalizeQuery<S>({ ...baseInput, id: "root" });
    if (tree.type !== "group") throw new Error("expected group");
    const [first, second] = tree.children;
    const result = moveNode(tree, first.id, "root", 2);
    if (result.type !== "group") throw new Error("expected group");
    expect(result.children[0].id).toBe(second.id);
    expect(result.children[1].id).toBe(first.id);
  });

  it("is a no-op for unknown nodeId and returns same reference", () => {
    const tree = normalizeQuery<S>({ ...baseInput, id: "root" });
    const result = moveNode(tree, "ghost", "root");
    expect(result).toBe(tree);
  });

  it("is a no-op for an unknown targetGroupId (no data loss)", () => {
    const tree = normalizeQuery<S>({ ...baseInput, id: "root" });
    if (tree.type !== "group") throw new Error("expected group");
    const movedId = tree.children[0].id;
    const result = moveNode(tree, movedId, "ghost-group");
    // the node must NOT be removed when the target does not exist
    expect(result).toBe(tree);
    expect(findNode(result, movedId)).toBeDefined();
  });

  it("is a no-op when moving a group into its own descendant (no data loss)", () => {
    const tree = normalizeQuery<S>({
      id: "root",
      type: "group",
      operator: "and",
      children: [
        {
          id: "outer",
          type: "group",
          operator: "and",
          children: [
            {
              id: "inner",
              type: "group",
              operator: "or",
              children: [],
            },
          ],
        },
      ],
    });
    const result = moveNode(tree, "outer", "inner");
    expect(result).toBe(tree);
    expect(findNode(result, "outer")).toBeDefined();
    expect(findNode(result, "inner")).toBeDefined();
  });

  it("is a no-op when moving a node into itself", () => {
    const tree = normalizeQuery<S>({ ...baseInput, id: "root" });
    const result = moveNode(tree, "root", "root");
    expect(result).toBe(tree);
  });
});

describe("reducer", () => {
  const reducer = createReducer(schema);

  it("APPEND_NODE appends the (already-normalized) node to the group", () => {
    const tree = normalizeQuery<S>({ ...baseInput, id: "root" });
    if (tree.type !== "group") throw new Error("expected group");
    const before = tree.children.length;
    const node = normalizeQuery<S>({
      type: "condition",
      field: "age",
      operator: "gt",
      value: 40,
    });
    const result = reducer(tree, { type: "APPEND_NODE", groupId: "root", node });
    if (result.type !== "group") throw new Error("expected group");
    expect(result.children.length).toBe(before + 1);
    // The reducer inserts the node as-is — it never generates ids or copies the node.
    expect(result.children[before]).toBe(node);
  });

  it("INSERT_NODE inserts the node at the given index", () => {
    const tree = normalizeQuery<S>({ ...baseInput, id: "root" });
    const node = normalizeQuery<S>({
      type: "condition",
      field: "name",
      operator: "eq",
      value: "Z",
    });
    const result = reducer(tree, {
      type: "INSERT_NODE",
      groupId: "root",
      index: 0,
      node,
    });
    if (result.type !== "group") throw new Error("expected group");
    expect(result.children[0]).toBe(node);
  });

  it("is pure — the same action produces deeply-equal trees with identical ids", () => {
    const tree = normalizeQuery<S>({ ...baseInput, id: "root" });
    const action = {
      type: "APPEND_NODE" as const,
      groupId: "root",
      node: normalizeQuery<S>({
        type: "condition",
        field: "age",
        operator: "gt",
        value: 40,
      }),
    };
    const a = reducer(tree, action);
    const b = reducer(tree, action);
    // No id generation inside the reducer → deterministic, replayable output.
    expect(a).toEqual(b);
  });

  it("UPDATE_NODE patches a matching condition node", () => {
    const tree = normalizeQuery<S>({ ...baseInput, id: "root" });
    if (tree.type !== "group") throw new Error("expected group");
    const condId = tree.children[0].id;
    const result = reducer(tree, {
      type: "UPDATE_NODE",
      nodeId: condId,
      patch: { value: "Bob" },
    });
    const updated = findNode(result, condId);
    expect(updated).toMatchObject({ field: "name", value: "Bob" });
  });

  it("UPDATE_NODE resets operator/value when the new field drops the current operator", () => {
    const tree = normalizeQuery<S>({ ...baseInput, id: "root" });
    if (tree.type !== "group") throw new Error("expected group");
    // The "name" condition uses "contains"; "age" only supports ["eq", "gt"],
    // so switching field must reset the operator to age's default and clear the value.
    const condId = tree.children[0].id;
    const named = reducer(tree, {
      type: "UPDATE_NODE",
      nodeId: condId,
      patch: { operator: "contains", value: "Al" },
    });
    const result = reducer(named, {
      type: "UPDATE_NODE",
      nodeId: condId,
      patch: { field: "age" },
    });
    expect(findNode(result, condId)).toMatchObject({
      field: "age",
      operator: "eq",
      value: undefined,
    });
  });

  it("UPDATE_NODE keeps the operator when the new field still supports it", () => {
    const tree = normalizeQuery<S>({ ...baseInput, id: "root" });
    if (tree.type !== "group") throw new Error("expected group");
    // "name" and "age" both support "eq", so a field switch leaves the operator intact.
    const condId = tree.children[0].id;
    const result = reducer(tree, {
      type: "UPDATE_NODE",
      nodeId: condId,
      patch: { field: "age", value: 30 },
    });
    expect(findNode(result, condId)).toMatchObject({
      field: "age",
      operator: "eq",
      value: 30,
    });
  });

  it("UPDATE_NODE leaves a group node untouched", () => {
    const tree = normalizeQuery<S>({ ...baseInput, id: "root" });
    // Targeting a group with a condition patch must not corrupt the group.
    const result = reducer(tree, {
      type: "UPDATE_NODE",
      nodeId: "root",
      patch: { field: "age", operator: "eq", value: 1 },
    });
    expect(result).toBe(tree);
    const root = findNode(result, "root");
    expect(root).toMatchObject({ type: "group", operator: "and" });
    expect(root).not.toHaveProperty("field");
  });
});
