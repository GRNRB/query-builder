# @grnrb/query-builder-core

Framework-agnostic core for building structured query/filter trees: types, tree
helpers, schema definition, and a reducer. Ships dual ESM/CJS builds with full
TypeScript types.

For React, use [`@grnrb/react-query-builder`](https://www.npmjs.com/package/@grnrb/react-query-builder),
which wraps this package in a `useQueryBuilder` hook.

## Install

```sh
npm install @grnrb/query-builder-core
# or: pnpm add @grnrb/query-builder-core
```

## Usage

```ts
import { defineSchema, reducer, normalizeTree } from "@grnrb/query-builder-core";

const schema = defineSchema({
  fields: [
    { id: "name", label: "Name", supportedOperators: ["eq", "contains"] },
    { id: "age", label: "Age", supportedOperators: ["eq", "gt", "lt"] },
  ],
  conditionOperators: [
    { id: "eq", arity: "one", label: "equals" },
    { id: "contains", arity: "one", label: "contains" },
    { id: "gt", arity: "one", label: "greater than" },
    { id: "lt", arity: "one", label: "less than" },
  ],
  groupOperators: [
    { id: "and", arity: "many", label: "AND" },
    { id: "or", arity: "many", label: "OR" },
  ],
});

// Normalize a tree (assigns ids), then drive it with the reducer + actions.
let tree = normalizeTree({
  type: "group",
  operator: "and",
  children: [{ type: "condition", field: "name", operator: "eq", value: "Alice" }],
});

tree = reducer(schema, tree, {
  type: "addCondition",
  groupId: tree.id,
  node: { type: "condition", field: "age", operator: "gt", value: "18" },
});
```

## API

- **Schema:** `defineSchema`, `buildConditionPatch`
- **Tree helpers:** `normalizeTree`, `updateNode`, `removeNode`, `appendToGroup`,
  `insertIntoGroup`, `moveNode`, `findNode`, `defaultGenerateId`
- **State:** `reducer`
- **Types:** `QuerySchema`, `QueryNode`, `ConditionNode`, `GroupNode`, `Action`,
  `FieldDefinition`, `OperatorDefinition`, and their `*Input` variants

## License

MIT
