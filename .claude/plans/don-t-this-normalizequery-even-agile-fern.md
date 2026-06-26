# Plan: Strictly-pure reducer + `appendNode`/`insertNode` action creators

## Context

The previous step (already applied in the working tree) moved id assignment **into** the reducer:
`createReducer(schema, { generateId })` ran `normalizeQuery` inside `APPEND_NODE`/`INSERT_NODE`. That
makes the reducer **impure** (it mints ids via `crypto.randomUUID()`), which is a hard no for the
user: a strictly-pure, deterministic, replayable reducer is non-negotiable.

So we invert: the reducer goes back to a pure `(state, action) => state`, and id generation moves to
the **dispatch boundary** via two exported action creators, `appendNode` / `insertNode`. This is the
Redux-idiomatic placement of non-determinism and still honors the earlier ergonomics goal (no
per-callsite `normalizeQuery`) — the creator encapsulates that one line. The `UPDATE_NODE`
schema-reconciliation (`reconcileConditionPatch`) is already pure and stays in the reducer.

This **reverts the Option-A reducer/type edits** from the prior step and **adds** the creators.

## Changes

### Core — `packages/query-builder-core`

- **`src/reducer.ts`** — Revert to a pure reducer: `createReducer<TSchema>(schema)` (drop the
  `options`/`generateId` param and the `ReducerOptions` interface; drop the `./utils` import).
  `APPEND_NODE` → `appendToGroup(state, action.groupId, action.node)`; `INSERT_NODE` →
  `insertIntoGroup(state, action.groupId, action.index, action.node)` (no normalize). Keep
  `UPDATE_NODE`'s `reconcileConditionPatch` (pure). Update JSDoc to state the reducer is pure and
  does no id generation.
- **`src/type.ts`** — Revert `APPEND_NODE.node` and `INSERT_NODE.node` from `QueryNodeInput<TSchema>`
  back to `QueryNode<TSchema>` (ids **required**) — hand-built action objects must carry ids; the
  creators (or `normalizeQuery`) produce them.
- **`src/actions.ts`** (new) — two creators, the only id-minting step:
  ```ts
  export interface CreateNodeOptions { generateId?: () => string }
  export function appendNode<TSchema extends QuerySchema>(
    groupId: string, node: QueryNodeInput<TSchema>, options?: CreateNodeOptions,
  ): Action<TSchema> {
    return { type: "APPEND_NODE", groupId, node: normalizeQuery(node, options?.generateId) };
  }
  export function insertNode<TSchema extends QuerySchema>(
    groupId: string, index: number, node: QueryNodeInput<TSchema>, options?: CreateNodeOptions,
  ): Action<TSchema> {
    return { type: "INSERT_NODE", groupId, index, node: normalizeQuery(node, options?.generateId) };
  }
  ```
  (`normalizeQuery`'s default `generateId` covers `options?.generateId === undefined`.)
- **`src/index.ts`** — add `export { appendNode, insertNode } from "./actions";` (and
  `CreateNodeOptions` type).

### React — `packages/react-query-builder`

- **`src/use-query-builder.ts`** — `createReducer(schema)` memoized on `[schema]` (drop `generateId`).
  Import `appendNode`/`insertNode`; rewrite the four helpers to use them, passing `<TSchema>`
  explicitly (inference through `QueryNodeInput<TSchema>` is unreliable) and `{ generateId }`:
  `addCondition` → `mutate(appendNode<TSchema>(groupId, node, { generateId }))`; `addGroup` →
  `mutate(appendNode<TSchema>(groupId, { type: "group", operator, children }, { generateId }))`;
  `insertCondition`/`insertGroup` analogous with `insertNode`. Deps `[mutate, generateId]`. Keep the
  init `normalizeQuery(opts.initialQuery, generateId)`.
- **`src/index.ts`** — re-export `appendNode`/`insertNode` from core.
- **`src/types.ts`** — unchanged (helper signatures already take id-optional input).

### Tests

- **`packages/query-builder-core/src/__tests__/core.test.ts`** — the 4 reducer tests added last step
  assumed the reducer mints ids; rewrite them against the creators + pure reducer: (a) `appendNode`
  produces an action whose node has an id, reducer applies it; (b) caller-supplied id preserved;
  (c) `insertNode` normalizes a group input recursively; (d) custom `generateId` via
  `appendNode(..., { generateId })` (replaces the removed `createReducer(schema, {generateId})` test);
  (e) **purity**: one `appendNode(...)` action fed to the reducer twice yields deep-equal trees with
  identical ids. Import `appendNode`/`insertNode` from `../index`.
- **`packages/react-query-builder/src/__tests__/useQueryBuilder.test.tsx`** — unchanged (drives hook
  helpers). Optional: a StrictMode-wrapped add with a counter `generateId` asserting a deterministic
  id (now possible since minting happens once, in the creator).

### Docs / README

- **`docs/content/docs/core.mdx`** — reframe the reducer as **pure/deterministic**; `APPEND_NODE`/
  `INSERT_NODE` examples use `appendNode`/`insertNode`; rewrite the "New nodes don't need ids"
  callout around the creators; `createReducer` signature back to `createReducer(schema)` (drop the
  `generateId` paragraph and the StrictMode "called more than once" caveat); add a short **Action
  creators** subsection for `appendNode`/`insertNode`; keep `normalizeQuery` as seed/deserialize.
- **`docs/content/docs/index.mdx`** — Quick start uses `appendNode`.
- **`docs/content/docs/guides/custom-ids.mdx`** — pass `generateId` to `appendNode`/`insertNode`
  (and `normalizeQuery` for the root); remove the StrictMode "may be called more than once" sentence
  (minting is single-call again, fully deterministic).
- **`packages/query-builder-core/README.md`** — `APPEND_NODE` example uses `appendNode`.

### Changeset

- **`.changeset/reducer-owns-invariants.md`** — rewrite (and rename to e.g.
  `pure-reducer-action-creators.md`): keep both packages at `minor`; describe the pure reducer,
  `createReducer(schema)`, the `appendNode`/`insertNode` creators, `buildConditionPatch` now internal,
  and `normalizeQuery` scoped to seeding/deserialization. **Do not** hand-edit `package.json` versions
  (Changesets owns the bump — both already reverted to `0.1.0`).

## Reuse / key references

- `normalizeQuery` ([utils.ts](packages/query-builder-core/src/utils.ts)) — id-filling; reused by the
  creators and for root seeding. Its default `generateId` handles the no-option case.
- `reconcileConditionPatch` in `UPDATE_NODE` ([reducer.ts](packages/query-builder-core/src/reducer.ts))
  — pure; stays in the reducer (purity unaffected).
- Pure tree helpers `appendToGroup`/`insertIntoGroup` ([query.ts](packages/query-builder-core/src/query.ts))
  — unchanged; the reducer hands them the already-normalized `action.node`.
- Input types `QueryNodeInput`/`ConditionNodeInput`/`GroupNodeInput`
  ([type.ts](packages/query-builder-core/src/type.ts)) — the creator input types.

## Verification

1. `cd packages/query-builder-core && npm run build && npm run typecheck && npm test` — green,
   including the new creator + **purity** tests.
2. `cd packages/react-query-builder && npm run typecheck && npx vitest run --pool=threads` — hook
   tests pass (forks pool times out on this box; threads works).
3. Determinism sanity: build one action `const a = appendNode(tree.id, { type:"condition", ... })`,
   then assert `reducer(tree, a)` deep-equals a second `reducer(tree, a)` (same ids) — proves the
   reducer is pure.
4. `npx changeset status` — confirms `core` + `react` bump `minor`, no manual `package.json` edits.
