import { describe, it, expect, vi } from "vitest";
import {
  normalizeTree,
  updateNode,
  removeNode,
  appendToGroup,
  findNode,
  insertIntoGroup,
  moveNode,
  defineSchema,
} from "../index";

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

describe("normalizeTree", () => {
  it("fills missing ids", () => {
    const result = normalizeTree<S>(baseInput);
    expect(result.id).toBeTruthy();
    if (result.type === "group") {
      result.children.forEach((child) => expect(child.id).toBeTruthy());
    }
  });

  it("preserves existing ids", () => {
    const input = { ...baseInput, id: "my-root" };
    const result = normalizeTree<S>(input);
    expect(result.id).toBe("my-root");
  });

  it("calls custom generateId", () => {
    let counter = 0;
    const generateId = vi.fn(() => `id-${++counter}`);
    normalizeTree<S>(baseInput, generateId);
    expect(generateId).toHaveBeenCalledTimes(3); // root + 2 children
  });
});

describe("updateNode", () => {
  it("updates matching node", () => {
    const tree = normalizeTree<S>({ ...baseInput, id: "root" });
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
    const tree = normalizeTree<S>({ ...baseInput, id: "root" });
    const updated = updateNode(tree, "nonexistent", (n) => n);
    expect(updated).toBe(tree);
  });
});

describe("removeNode", () => {
  it("removes a child condition", () => {
    const tree = normalizeTree<S>({ ...baseInput, id: "root" });
    if (tree.type !== "group") throw new Error("expected group");
    const firstId = tree.children[0].id;
    const result = removeNode(tree, firstId);
    if (result.type !== "group") throw new Error("expected group");
    expect(result.children).toHaveLength(1);
    expect(result.children[0].id).not.toBe(firstId);
  });

  it("is a no-op for unknown id", () => {
    const tree = normalizeTree<S>({ ...baseInput, id: "root" });
    const result = removeNode(tree, "ghost");
    if (result.type !== "group") throw new Error("expected group");
    expect(result.children).toHaveLength(2);
  });

  it("is a no-op when called with the root id", () => {
    const tree = normalizeTree<S>({ ...baseInput, id: "root" });
    const result = removeNode(tree, "root");
    expect(result).toBe(tree);
  });
});

describe("appendToGroup", () => {
  it("appends a node to the matching group", () => {
    const tree = normalizeTree<S>({ ...baseInput, id: "root" });
    const newCondition = normalizeTree<S>({
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
    const tree = normalizeTree<S>({ ...baseInput, id: "root" });
    const extra = normalizeTree<S>({
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
    const tree = normalizeTree<S>({ ...baseInput, id: "root" });
    expect(findNode(tree, "root")).toBe(tree);
  });

  it("finds a child node", () => {
    const tree = normalizeTree<S>({ ...baseInput, id: "root" });
    if (tree.type !== "group") throw new Error("expected group");
    const childId = tree.children[0].id;
    expect(findNode(tree, childId)).toBe(tree.children[0]);
  });

  it("finds a deeply nested node", () => {
    const nested = normalizeTree<S>({
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
    const tree = normalizeTree<S>({ ...baseInput, id: "root" });
    expect(findNode(tree, "ghost")).toBeUndefined();
  });
});

describe("insertIntoGroup", () => {
  it("inserts at index 0 (prepend)", () => {
    const tree = normalizeTree<S>({ ...baseInput, id: "root" });
    const newNode = normalizeTree<S>({
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
    const tree = normalizeTree<S>({ ...baseInput, id: "root" });
    const newNode = normalizeTree<S>({
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
    const tree = normalizeTree<S>({ ...baseInput, id: "root" });
    const newNode = normalizeTree<S>({
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
    const tree = normalizeTree<S>({ ...baseInput, id: "root" });
    const newNode = normalizeTree<S>({
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
    const tree = normalizeTree<S>({
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
    const tree = normalizeTree<S>({ ...baseInput, id: "root" });
    if (tree.type !== "group") throw new Error("expected group");
    const [first, second] = tree.children;
    const result = moveNode(tree, first.id, "root", 2);
    if (result.type !== "group") throw new Error("expected group");
    expect(result.children[0].id).toBe(second.id);
    expect(result.children[1].id).toBe(first.id);
  });

  it("is a no-op for unknown nodeId and returns same reference", () => {
    const tree = normalizeTree<S>({ ...baseInput, id: "root" });
    const result = moveNode(tree, "ghost", "root");
    expect(result).toBe(tree);
  });
});
