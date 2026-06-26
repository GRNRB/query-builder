# @grnrb/react-query-builder

## 0.2.0

### Minor Changes

- a80a28b: The reducer is now a pure, schema-bound function and condition reconciliation is built in.

  - `reducer` is replaced by `createReducer(schema)`, which returns a pure `(state, action) => state` reducer — no id generation inside, so the same action always yields the same tree (deterministic and replayable).
  - `UPDATE_NODE` reconciles a condition's operator/value against the schema automatically when the field changes; the previously-exported `buildConditionPatch` helper is now internal.
  - `APPEND_NODE` / `INSERT_NODE` still take a node with ids — normalize new input with `normalizeQuery` before dispatch (the React hook's `addCondition` / `addGroup` / `insertCondition` / `insertGroup` do this for you).

  Migration: replace `reducer(state, action)` with `const reducer = createReducer(schema)`; remove any direct `buildConditionPatch` usage (it now runs inside the reducer). Hook consumers are unaffected.

### Patch Changes

- Updated dependencies [a80a28b]
  - @grnrb/query-builder-core@0.2.0
