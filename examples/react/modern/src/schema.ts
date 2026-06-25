import { defineSchema } from "@grnrb/react-query-builder";
import type {
  Arity,
  ConditionNodeInput,
  GroupOperatorId,
  QueryNode,
  QueryNodeInput,
} from "@grnrb/react-query-builder";

// ─── Schema ──────────────────────────────────────────────────────────────────
// Same shape the other demos use, so behaviour is directly comparable.

export const schema = defineSchema({
  fields: [
    { id: "name", label: "Name", supportedOperators: ["eq", "contains"] },
    { id: "age", label: "Age", supportedOperators: ["eq", "gt", "lt"] },
    { id: "status", label: "Status", supportedOperators: ["eq", "contains"] },
    { id: "active", label: "Active", supportedOperators: ["is_set"] },
  ],
  conditionOperators: [
    { id: "eq", arity: "one", label: "=" },
    { id: "contains", arity: "one", label: "contains" },
    { id: "gt", arity: "one", label: ">" },
    { id: "lt", arity: "one", label: "<" },
    { id: "is_set", arity: "none", label: "is set" },
  ],
  groupOperators: [
    { id: "and", arity: "many", label: "AND" },
    { id: "or", arity: "many", label: "OR" },
  ],
});

export type S = typeof schema;
export type Node = QueryNode<S>;
export type GroupNodeT = Extract<Node, { type: "group" }>;
export type ConditionNodeT = Extract<Node, { type: "condition" }>;
export type GroupOp = GroupOperatorId<S>;

// A fresh condition used whenever the keyboard inserts a new row.
export const STARTER: ConditionNodeInput<S> = {
  type: "condition",
  field: "name",
  operator: "eq",
  value: "",
};

// Group seeded with one starter condition — what `[` creates.
export const starterGroup = (): QueryNodeInput<S> => ({
  type: "group",
  operator: "and",
  children: [{ ...STARTER }],
});

export const initialQuery = {
  type: "group" as const,
  operator: "and" as const,
  children: [
    {
      type: "condition" as const,
      field: "name" as const,
      operator: "contains" as const,
      value: "Ada",
    },
    {
      type: "group" as const,
      operator: "or" as const,
      children: [
        {
          type: "condition" as const,
          field: "age" as const,
          operator: "gt" as const,
          value: "21",
        },
        {
          type: "condition" as const,
          field: "active" as const,
          operator: "is_set" as const,
        },
      ],
    },
  ],
};

// ─── Lookups ─────────────────────────────────────────────────────────────────

export const fieldDef = (id: string) => schema.fields.find((f) => f.id === id);
export const opDef = (id: string) =>
  schema.conditionOperators.find((o) => o.id === id);

export const arityOf = (opId: string): Arity => opDef(opId)?.arity ?? "one";

/** Operators a given field is allowed to use, in schema order. */
export const supportedOps = (fieldId: string) => {
  const f = fieldDef(fieldId);
  return schema.conditionOperators.filter((o) =>
    f?.supportedOperators.some((id) => id === o.id),
  );
};

export const nextGroupOp = (op: string): GroupOp => (op === "and" ? "or" : "and");
