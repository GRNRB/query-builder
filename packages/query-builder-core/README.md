# @grnrb/query-builder-core

Framework-agnostic core for building structured query/filter trees: a typed schema,
immutable tree helpers, and a reducer. Ships dual ESM/CJS builds with full TypeScript types.

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
import { defineSchema, normalizeTree, reducer } from "@grnrb/query-builder-core";

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
let tree = normalizeTree({
  type: "group",
  operator: "and",
  children: [{ type: "condition", field: "name", operator: "eq", value: "Alice" }],
});

// reducer(state, action) — actions are SCREAMING_SNAKE_CASE.
tree = reducer(tree, {
  type: "APPEND_NODE",
  groupId: tree.id,
  node: normalizeTree({ type: "condition", field: "age", operator: "gt", value: 18 }),
});
```

## API

See the [documentation](https://grnrb.github.io/query-builder/) for the full reference:
[`defineSchema`](https://grnrb.github.io/query-builder/docs/core/define-schema),
[tree helpers](https://grnrb.github.io/query-builder/docs/core/tree-helpers),
the [`reducer`](https://grnrb.github.io/query-builder/docs/core/reducer), and the
[types](https://grnrb.github.io/query-builder/docs/core/types).

## License

MIT
