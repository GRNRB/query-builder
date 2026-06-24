import type { Action, QueryNode, QuerySchema } from "./type";
import {
  appendToGroup,
  insertIntoGroup,
  moveNode,
  removeNode,
  updateNode,
} from "./tree";

export function reducer<TSchema extends QuerySchema>(
  state: QueryNode<TSchema>,
  action: Action<TSchema>,
): QueryNode<TSchema> {
  switch (action.type) {
    case "APPEND_NODE":
      return appendToGroup(state, action.groupId, action.node);

    case "INSERT_NODE":
      return insertIntoGroup(state, action.groupId, action.index, action.node);

    case "MOVE_NODE":
      return moveNode(state, action.nodeId, action.targetGroupId, action.index);

    case "REMOVE_NODE":
      return removeNode(state, action.nodeId);

    case "UPDATE_NODE":
      return updateNode(state, action.nodeId, (node) =>
        node.type === "condition" ? { ...node, ...action.patch } : node,
      );

    case "UPDATE_GROUP_OPERATOR":
      return updateNode(state, action.groupId, (node) =>
        node.type === "group" ? { ...node, operator: action.operator } : node,
      );
  }
}
