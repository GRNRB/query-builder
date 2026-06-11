import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { defineSchema, useQueryBuilder } from "../index";

const schema = defineSchema({
  fields: [
    { id: "name", label: "Name", supportedOperators: ["eq", "contains"] },
    { id: "age", label: "Age", supportedOperators: ["eq", "gt"] },
    { id: "active", label: "Active", supportedOperators: ["is_set"] },
  ],
  conditionOperators: [
    { id: "eq", arity: "one", label: "Equals" },
    { id: "contains", arity: "one", label: "Contains" },
    { id: "gt", arity: "one", label: "Greater than" },
    { id: "is_set", arity: "none", label: "Is set" },
  ],
  groupOperators: [
    { id: "and", arity: "many", label: "AND" },
    { id: "or", arity: "many", label: "OR" },
  ],
});

const initialQuery = {
  type: "group" as const,
  operator: "and" as const,
  children: [
    {
      type: "condition" as const,
      field: "name" as const,
      operator: "eq" as const,
      value: "Alice",
    },
  ],
};

describe("useQueryBuilder — uncontrolled", () => {
  it("normalizes initial query and exposes it", () => {
    const { result } = renderHook(() =>
      useQueryBuilder(schema, { initialQuery }),
    );
    expect(result.current.query.id).toBeTruthy();
    expect(result.current.query.type).toBe("group");
  });

  it("uses custom generateId", () => {
    let n = 0;
    const generateId = vi.fn(() => `custom-${++n}`);
    const { result } = renderHook(() =>
      useQueryBuilder(schema, { initialQuery, generateId }),
    );
    expect(result.current.query.id).toBe("custom-1");
    expect(generateId).toHaveBeenCalled();
  });

  it("addCondition appends to a group", () => {
    const { result } = renderHook(() =>
      useQueryBuilder(schema, { initialQuery }),
    );
    const rootId = result.current.query.id;
    act(() => {
      result.current.addCondition(rootId, {
        type: "condition",
        field: "age",
        operator: "gt",
        value: 25,
      });
    });
    if (result.current.query.type !== "group")
      throw new Error("expected group");
    expect(result.current.query.children).toHaveLength(2);
  });

  it("addGroup appends a nested group", () => {
    const { result } = renderHook(() =>
      useQueryBuilder(schema, { initialQuery }),
    );
    const rootId = result.current.query.id;
    act(() => {
      result.current.addGroup(rootId, "or");
    });
    if (result.current.query.type !== "group")
      throw new Error("expected group");
    expect(result.current.query.children).toHaveLength(2);
    expect(result.current.query.children[1].type).toBe("group");
  });

  it("addGroup with initial children normalizes and includes them", () => {
    const { result } = renderHook(() =>
      useQueryBuilder(schema, { initialQuery }),
    );
    const rootId = result.current.query.id;
    act(() => {
      result.current.addGroup(rootId, "or", [
        { type: "condition", field: "age", operator: "gt", value: 10 },
      ]);
    });
    if (result.current.query.type !== "group")
      throw new Error("expected group");
    const newGroup = result.current.query.children[1];
    if (newGroup.type !== "group") throw new Error("expected group");
    expect(newGroup.children).toHaveLength(1);
    expect(newGroup.children[0].id).toBeTruthy();
  });

  it("removeNode removes the target node", () => {
    const { result } = renderHook(() =>
      useQueryBuilder(schema, { initialQuery }),
    );
    if (result.current.query.type !== "group")
      throw new Error("expected group");
    const firstId = result.current.query.children[0].id;
    act(() => {
      result.current.removeNode(firstId);
    });
    if (result.current.query.type !== "group")
      throw new Error("expected group");
    expect(result.current.query.children).toHaveLength(0);
  });

  it("removeNode root guard — root stays unchanged", () => {
    const { result } = renderHook(() =>
      useQueryBuilder(schema, { initialQuery }),
    );
    const rootId = result.current.query.id;
    const before = result.current.query;
    act(() => {
      result.current.removeNode(rootId);
    });
    expect(result.current.query).toBe(before);
  });

  it("updateGroupOperator changes the operator", () => {
    const { result } = renderHook(() =>
      useQueryBuilder(schema, { initialQuery }),
    );
    const rootId = result.current.query.id;
    act(() => {
      result.current.updateGroupOperator(rootId, "or");
    });
    if (result.current.query.type !== "group")
      throw new Error("expected group");
    expect(result.current.query.operator).toBe("or");
  });

  it("updateCondition updates value", () => {
    const { result } = renderHook(() =>
      useQueryBuilder(schema, { initialQuery }),
    );
    if (result.current.query.type !== "group")
      throw new Error("expected group");
    const condId = result.current.query.children[0].id;
    act(() => {
      result.current.updateCondition(condId, { value: "Bob" });
    });
    if (result.current.query.type !== "group")
      throw new Error("expected group");
    const updated = result.current.query.children[0] as { value: unknown };
    expect(updated.value).toBe("Bob");
  });

  it("updateCondition field change resets operator when incompatible", () => {
    const { result } = renderHook(() =>
      useQueryBuilder(schema, {
        initialQuery: {
          type: "group",
          operator: "and",
          children: [
            {
              type: "condition",
              field: "name",
              operator: "contains",
              value: "x",
            },
          ],
        },
      }),
    );
    if (result.current.query.type !== "group")
      throw new Error("expected group");
    const condId = result.current.query.children[0].id;
    act(() => {
      // "contains" is not in age's supportedOperators, so operator should reset
      result.current.updateCondition(condId, { field: "age" });
    });
    if (result.current.query.type !== "group")
      throw new Error("expected group");
    const updated = result.current.query.children[0] as {
      operator: string;
      value: unknown;
    };
    expect(["eq", "gt"]).toContain(updated.operator);
    expect(updated.value).toBeUndefined();
  });

  it("updateCondition field change preserves operator when still valid", () => {
    const { result } = renderHook(() =>
      useQueryBuilder(schema, {
        initialQuery: {
          type: "group",
          operator: "and",
          children: [
            {
              type: "condition",
              field: "name",
              operator: "eq",
              value: "Alice",
            },
          ],
        },
      }),
    );
    if (result.current.query.type !== "group")
      throw new Error("expected group");
    const condId = result.current.query.children[0].id;
    act(() => {
      // "eq" is also valid for "age"
      result.current.updateCondition(condId, { field: "age" });
    });
    if (result.current.query.type !== "group")
      throw new Error("expected group");
    const updated = result.current.query.children[0] as { operator: string };
    expect(updated.operator).toBe("eq");
  });

  it("insertCondition inserts at index 0", () => {
    const { result } = renderHook(() =>
      useQueryBuilder(schema, { initialQuery }),
    );
    const rootId = result.current.query.id;
    act(() => {
      result.current.insertCondition(rootId, 0, {
        type: "condition",
        field: "age",
        operator: "gt",
        value: 5,
      });
    });
    if (result.current.query.type !== "group")
      throw new Error("expected group");
    expect(result.current.query.children).toHaveLength(2);
    const first = result.current.query.children[0] as { field: string };
    expect(first.field).toBe("age");
  });

  it("insertCondition inserts at mid-list index", () => {
    const multiQuery = {
      type: "group" as const,
      operator: "and" as const,
      children: [
        {
          type: "condition" as const,
          field: "name" as const,
          operator: "eq" as const,
          value: "A",
        },
        {
          type: "condition" as const,
          field: "age" as const,
          operator: "gt" as const,
          value: 1,
        },
      ],
    };
    const { result } = renderHook(() =>
      useQueryBuilder(schema, { initialQuery: multiQuery }),
    );
    const rootId = result.current.query.id;
    act(() => {
      result.current.insertCondition(rootId, 1, {
        type: "condition",
        field: "name",
        operator: "contains",
        value: "M",
      });
    });
    if (result.current.query.type !== "group")
      throw new Error("expected group");
    expect(result.current.query.children).toHaveLength(3);
    const mid = result.current.query.children[1] as { field: string };
    expect(mid.field).toBe("name");
  });

  it("moveNode moves a condition between groups", () => {
    const twoGroupQuery = {
      type: "group" as const,
      id: "root",
      operator: "and" as const,
      children: [
        {
          id: "cond1",
          type: "condition" as const,
          field: "name" as const,
          operator: "eq" as const,
          value: "A",
        },
        {
          id: "inner",
          type: "group" as const,
          operator: "or" as const,
          children: [] as readonly never[],
        },
      ],
    };
    const { result } = renderHook(() =>
      useQueryBuilder(schema, { initialQuery: twoGroupQuery }),
    );
    act(() => {
      result.current.moveNode("cond1", "inner");
    });
    if (result.current.query.type !== "group")
      throw new Error("expected group");
    expect(result.current.query.children).toHaveLength(1);
    const inner = result.current.query.children[0];
    if (inner.type !== "group") throw new Error("expected group");
    expect(inner.children).toHaveLength(1);
    expect(inner.children[0].id).toBe("cond1");
  });

  it("nested group — addCondition into inner group", () => {
    const nested = {
      id: "root",
      type: "group" as const,
      operator: "and" as const,
      children: [
        {
          id: "inner",
          type: "group" as const,
          operator: "or" as const,
          children: [] as readonly never[],
        },
      ],
    };
    const { result } = renderHook(() =>
      useQueryBuilder(schema, { initialQuery: nested }),
    );
    act(() => {
      result.current.addCondition("inner", {
        type: "condition",
        field: "name",
        operator: "eq",
        value: "x",
      });
    });
    if (result.current.query.type !== "group")
      throw new Error("expected group");
    const inner = result.current.query.children[0];
    if (inner.type !== "group") throw new Error("expected group");
    expect(inner.children).toHaveLength(1);
  });

  it("nested group — removeNode from inner group", () => {
    const nested = {
      id: "root",
      type: "group" as const,
      operator: "and" as const,
      children: [
        {
          id: "inner",
          type: "group" as const,
          operator: "or" as const,
          children: [
            {
              id: "leaf",
              type: "condition" as const,
              field: "name" as const,
              operator: "eq" as const,
              value: "y",
            },
          ],
        },
      ],
    };
    const { result } = renderHook(() =>
      useQueryBuilder(schema, { initialQuery: nested }),
    );
    act(() => {
      result.current.removeNode("leaf");
    });
    if (result.current.query.type !== "group")
      throw new Error("expected group");
    const inner = result.current.query.children[0];
    if (inner.type !== "group") throw new Error("expected group");
    expect(inner.children).toHaveLength(0);
  });

  describe("arity edge cases", () => {
    it("none-arity condition has no value property", () => {
      const { result } = renderHook(() =>
        useQueryBuilder(schema, {
          initialQuery: {
            type: "group",
            operator: "and",
            children: [
              { type: "condition", field: "active", operator: "is_set" },
            ],
          },
        }),
      );
      if (result.current.query.type !== "group")
        throw new Error("expected group");
      const cond = result.current.query.children[0] as { value?: unknown };
      expect(cond.value).toBeUndefined();
    });
  });
});

describe("useQueryBuilder — controlled", () => {
  it("calls onChange after mutation", () => {
    const onChange = vi.fn();
    let controlledQuery = {
      id: "root",
      type: "group" as const,
      operator: "and" as const,
      children: [] as readonly never[],
    };

    const { result } = renderHook(() =>
      useQueryBuilder(schema, { query: controlledQuery, onChange }),
    );

    act(() => {
      result.current.addCondition(controlledQuery.id, {
        type: "condition",
        field: "name",
        operator: "eq",
        value: "Bob",
      });
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    const updated = onChange.mock.calls[0][0];
    expect(updated.type).toBe("group");
    if (updated.type === "group") {
      expect(updated.children).toHaveLength(1);
    }
  });

  it("syncs when controlled query prop changes externally", () => {
    const onChange = vi.fn();
    const queryV1 = {
      id: "root",
      type: "group" as const,
      operator: "and" as const,
      children: [] as readonly never[],
    };
    const queryV2 = {
      id: "root",
      type: "group" as const,
      operator: "or" as const,
      children: [] as readonly never[],
    };

    let externalQuery: typeof queryV1 | typeof queryV2 = queryV1;
    const { result, rerender } = renderHook(() =>
      useQueryBuilder(schema, { query: externalQuery, onChange }),
    );

    expect((result.current.query as { operator: string }).operator).toBe("and");

    externalQuery = queryV2;
    rerender();

    expect((result.current.query as { operator: string }).operator).toBe("or");
  });
});
