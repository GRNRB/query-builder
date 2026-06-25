# @grnrb/react-query-builder

React hook (`useQueryBuilder`) for building structured query/filter trees on top of
[`@grnrb/query-builder-core`](https://www.npmjs.com/package/@grnrb/query-builder-core).
Supports controlled and uncontrolled usage, with full TypeScript inference from your schema.
Ships dual ESM/CJS builds.

📖 **[Full documentation →](https://grnrb.github.io/query-builder/)** ·
🕹️ **[Live playground →](https://grnrb.github.io/query-builder/docs/getting-started/playground)**

## Install

```sh
npm install @grnrb/react-query-builder
# or: pnpm add @grnrb/react-query-builder
```

`react` (>= 18) is a peer dependency. `@grnrb/query-builder-core` is re-exported, so you
don't need to install it separately.

## Usage

```tsx
import { defineSchema, useQueryBuilder } from "@grnrb/react-query-builder";

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

function Filters() {
  const qb = useQueryBuilder(schema, {
    initialQuery: {
      type: "group",
      operator: "and",
      children: [{ type: "condition", field: "name", operator: "eq", value: "Alice" }],
    },
  });

  // qb.query is the normalized tree; mutate it via the helpers:
  //   addCondition / addGroup / insertCondition / insertGroup /
  //   removeNode / moveNode / updateCondition / updateGroupOperator
  return <pre>{JSON.stringify(qb.query, null, 2)}</pre>;
}
```

See [Controlled vs uncontrolled](https://grnrb.github.io/query-builder/docs/react/controlled-vs-uncontrolled)
and the [`useQueryBuilder` reference](https://grnrb.github.io/query-builder/docs/react/use-query-builder)
for the full API, and [`examples/react/basic`](https://github.com/GRNRB/query-builder/tree/main/examples/react/basic)
for a full drag-and-drop playground.

## License

MIT
