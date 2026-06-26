import { useCallback, useMemo, useReducer } from "react";
import type {
  QueryNode,
  QuerySchema,
  Action,
} from "@grnrb/query-builder-core";
import {
  createReducer,
  defaultGenerateId,
  normalizeQuery,
} from "@grnrb/query-builder-core";
import type {
  AddCondition,
  AddGroup,
  InsertCondition,
  InsertGroup,
  MoveNode,
  RemoveNode,
  UpdateCondition,
  UpdateGroupOperator,
  UseQueryBuilderOptions,
  UseQueryBuilderReturn,
} from "./types";

export function useQueryBuilder<const TSchema extends QuerySchema>(
  schema: TSchema,
  options: UseQueryBuilderOptions<TSchema>,
): UseQueryBuilderReturn<TSchema> {
  const generateId = options.generateId ?? defaultGenerateId;
  const controlledQuery = "query" in options ? options.query : undefined;
  const controlledOnChange = "query" in options ? options.onChange : undefined;

  const reducer = useMemo(() => createReducer(schema), [schema]);

  const [uncontrolledQuery, dispatch] = useReducer(
    reducer,
    options,
    (opts): QueryNode<TSchema> =>
      "query" in opts
        ? opts.query
        : normalizeQuery(opts.initialQuery, generateId),
  );

  const query = controlledQuery ?? uncontrolledQuery;

  const mutate = useCallback(
    (action: Action<TSchema>) => {
      if (controlledOnChange && controlledQuery !== undefined) {
        controlledOnChange(reducer(controlledQuery, action));
      } else {
        dispatch(action);
      }
    },
    [controlledOnChange, controlledQuery, dispatch, reducer],
  );

  // Ids are assigned here, before dispatch, so the reducer stays pure.
  const addCondition: AddCondition<TSchema> = useCallback(
    (groupId, node) => {
      mutate({
        type: "APPEND_NODE",
        groupId,
        node: normalizeQuery(node, generateId),
      });
    },
    [mutate, generateId],
  );

  const addGroup: AddGroup<TSchema> = useCallback(
    (groupId, operator, children = []) => {
      mutate({
        type: "APPEND_NODE",
        groupId,
        node: normalizeQuery({ type: "group", operator, children }, generateId),
      });
    },
    [mutate, generateId],
  );

  const insertCondition: InsertCondition<TSchema> = useCallback(
    (groupId, index, node) => {
      mutate({
        type: "INSERT_NODE",
        groupId,
        index,
        node: normalizeQuery(node, generateId),
      });
    },
    [mutate, generateId],
  );

  const insertGroup: InsertGroup<TSchema> = useCallback(
    (groupId, index, operator, children = []) => {
      mutate({
        type: "INSERT_NODE",
        groupId,
        index,
        node: normalizeQuery({ type: "group", operator, children }, generateId),
      });
    },
    [mutate, generateId],
  );

  const removeNode: RemoveNode = useCallback(
    (nodeId) => {
      mutate({ type: "REMOVE_NODE", nodeId });
    },
    [mutate],
  );

  const moveNode: MoveNode = useCallback(
    (nodeId, targetGroupId, index) => {
      mutate({ type: "MOVE_NODE", nodeId, targetGroupId, index });
    },
    [mutate],
  );

  const updateCondition: UpdateCondition<TSchema> = useCallback(
    (nodeId, patch) => {
      // The reducer reconciles operator/value against the schema when the field changes,
      // so the hook just forwards the patch.
      mutate({ type: "UPDATE_NODE", nodeId, patch });
    },
    [mutate],
  );

  const updateGroupOperator: UpdateGroupOperator<TSchema> = useCallback(
    (groupId, operator) => {
      mutate({ type: "UPDATE_GROUP_OPERATOR", groupId, operator });
    },
    [mutate],
  );

  return {
    query,
    addCondition,
    addGroup,
    insertCondition,
    insertGroup,
    removeNode,
    moveNode,
    updateCondition,
    updateGroupOperator,
  };
}
