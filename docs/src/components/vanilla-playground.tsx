'use client';

// Vanilla (no-hook) adapter for the shared playground widget.
//
// The tree lives in a single `useState`; every mutation goes through `@grnrb/query-builder-core`
// directly — `reducer` applies an action, `normalizeTree` mints ids for new nodes, and
// `buildConditionPatch` resets a condition when its field changes. This adapter maps the
// `PlaygroundController` surface onto those reducer dispatches; the identical UI lives in
// ./playground/widget.tsx. The exact same calls would run in Node, a worker, or a test.

import { useState } from 'react';
import {
  buildConditionPatch,
  findNode,
  normalizeTree,
  reducer,
} from '@grnrb/query-builder-core';
import type { Action } from '@grnrb/query-builder-core';
import {
  PlaygroundMount,
  PlaygroundWidget,
  initialQuery,
  schema,
  type Node,
  type PlaygroundController,
  type S,
} from './playground/widget';

function Demo() {
  // The whole "vanilla" model: one piece of state + `reducer`. No hook.
  const [tree, setTree] = useState<Node>(() => normalizeTree<S>(initialQuery));
  const dispatch = (action: Action<S>) =>
    setTree((t) => reducer<S>(t, action));

  const controller: PlaygroundController = {
    query: tree,
    updateCondition: (nodeId, raw) => {
      // Route the edit through `buildConditionPatch` — exactly what you'd do without a
      // framework: a value/operator edit passes through, a field edit resets the
      // operator/value when the new field can't keep the current operator.
      const current = findNode<S>(tree, nodeId);
      if (!current) return;
      const patch = buildConditionPatch<S>(schema, current, raw);
      dispatch({ type: 'UPDATE_NODE', nodeId, patch });
    },
    removeNode: (nodeId) => dispatch({ type: 'REMOVE_NODE', nodeId }),
    addCondition: (groupId, input) =>
      dispatch({ type: 'APPEND_NODE', groupId, node: normalizeTree<S>(input) }),
    addGroup: (groupId, operator) =>
      dispatch({
        type: 'APPEND_NODE',
        groupId,
        node: normalizeTree<S>({ type: 'group', operator, children: [] }),
      }),
    moveNode: (nodeId, targetGroupId, index) =>
      dispatch({ type: 'MOVE_NODE', nodeId, targetGroupId, index }),
    updateGroupOperator: (groupId, operator) =>
      dispatch({
        type: 'UPDATE_GROUP_OPERATOR',
        groupId: groupId as never,
        operator,
      }),
  };

  return <PlaygroundWidget controller={controller} showJson />;
}

/** Embeddable live demo for the core (no-hook) API. */
export function VanillaPlayground() {
  return (
    <PlaygroundMount>
      <Demo />
    </PlaygroundMount>
  );
}

export default VanillaPlayground;
