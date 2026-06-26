# @grnrb/query-builder-core

Framework-agnostic core for building structured query/filter trees: a typed schema,
an immutable query tree, and a reducer. Ships dual ESM/CJS builds with full TypeScript types.

For React, use [`@grnrb/react-query-builder`](https://www.npmjs.com/package/@grnrb/react-query-builder),
which wraps this package in a `useQueryBuilder` hook.

📖 **[Full documentation →](https://grnrb.github.io/query-builder/)**

## Install

```sh
npm install @grnrb/query-builder-core
# or: pnpm add @grnrb/query-builder-core
```

## Usage

```ts
import { createReducer, defineSchema, normalizeQuery } from "@grnrb/query-builder-core";

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

// Normalize an input tree (assigns ids), then drive it with the reducer + actions.
let tree = normalizeQuery({
  type: "group",
  operator: "and",
  children: [{ type: "condition", field: "name", operator: "eq", value: "Alice" }],
});

// createReducer(schema) returns a pure reducer(state, action) — actions are SCREAMING_SNAKE_CASE.
// New nodes need ids, so normalize them before APPEND_NODE / INSERT_NODE.
const reducer = createReducer(schema);
tree = reducer(tree, {
  type: "APPEND_NODE",
  groupId: tree.id,
  node: normalizeQuery({ type: "condition", field: "age", operator: "gt", value: 18 }),
});
```

## API

See the [documentation](https://grnrb.github.io/query-builder/) for the full reference:
[`defineSchema`](https://grnrb.github.io/query-builder/docs/core#defineschema),
the [`reducer` and actions](https://grnrb.github.io/query-builder/docs/core#reducer-and-actions),
[utilities](https://grnrb.github.io/query-builder/docs/core#utilities), and the
[types](https://grnrb.github.io/query-builder/docs/core#types).

## License

MIT
