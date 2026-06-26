import type { Action, QueryNode, QuerySchema } from "./type";
import {
  appendToGroup,
  insertIntoGroup,
  moveNode,
  removeNode,
  updateNode,
} from "./query";
import { reconcileConditionPatch } from "./schema";

/**
 * Builds a reducer bound to `schema`. The reducer is a pure `(state, action) => state` — it does
 * no id generation, so the same action always produces the same tree (deterministic and
 * replayable). The schema is used only for the pure `UPDATE_NODE` reconciliation: when a patch
 * changes a condition's field to one that doesn't support the current operator, the operator and
 * value are reset. `APPEND_NODE`/`INSERT_NODE` expect a node that already has ids — normalize the
 * input with {@link normalizeQuery} before dispatching.
 */
export function createReducer<TSchema extends QuerySchema>(schema: TSchema) {
  return function reducer(
    state: QueryNode<TSchema>,
    action: Action<TSchema>,
  ): QueryNode<TSchema> {
    switch (action.type) {
      case "APPEND_NODE":
        return appendToGroup(state, action.groupId, action.node);

      case "INSERT_NODE":
        return insertIntoGroup(
          state,
          action.groupId,
          action.index,
          action.node,
        );

      case "MOVE_NODE":
        return moveNode(
          state,
          action.nodeId,
          action.targetGroupId,
          action.index,
        );

      case "REMOVE_NODE":
        return removeNode(state, action.nodeId);

      case "UPDATE_NODE":
        return updateNode(state, action.nodeId, (node) =>
          node.type === "condition"
            ? { ...node, ...reconcileConditionPatch(schema, node, action.patch) }
            : node,
        );

      case "UPDATE_GROUP_OPERATOR":
        return updateNode(state, action.groupId, (node) =>
          node.type === "group"
            ? { ...node, operator: action.operator }
            : node,
        );
    }
  };
}
