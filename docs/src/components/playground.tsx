'use client';

// React-hook adapter for the shared playground widget.
//
// The hook already exposes exactly the `PlaygroundController` surface, so this file is just
// wiring: `useQueryBuilder` → controller → `<PlaygroundWidget>`. All UI lives in
// ./playground/widget.tsx. The fuller standalone version is examples/react/basic/src/App.tsx.

import { useQueryBuilder } from '@grnrb/react-query-builder';
import {
  PlaygroundMount,
  PlaygroundWidget,
  initialQuery,
  schema,
  type PlaygroundController,
} from './playground/widget';

function Demo({ showJson }: { showJson: boolean }) {
  const qb = useQueryBuilder(schema, { initialQuery });

  const controller: PlaygroundController = {
    query: qb.query,
    updateCondition: qb.updateCondition,
    removeNode: qb.removeNode,
    addCondition: qb.addCondition,
    addGroup: qb.addGroup,
    moveNode: qb.moveNode,
    updateGroupOperator: (groupId, operator) =>
      qb.updateGroupOperator(groupId, operator as never),
  };

  return <PlaygroundWidget controller={controller} showJson={showJson} />;
}

/**
 * Embeddable live demo driven by `useQueryBuilder`. `showJson` (default `true`) toggles the
 * JSON tree panel — the home page hero hides it.
 */
export function Playground({ showJson = true }: { showJson?: boolean } = {}) {
  return (
    <PlaygroundMount>
      <Demo showJson={showJson} />
    </PlaygroundMount>
  );
}

export default Playground;
