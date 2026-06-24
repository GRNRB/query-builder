import type {
  ConditionNodeInput,
  GroupOperatorId,
  QueryNode,
  QueryNodeInput,
  QuerySchema,
} from "@grnrb/query-builder-core";

// ── Hook options ──────────────────────────────────────────────────────────────

type UseQueryBuilderOptionsBase = {
  generateId?: () => string;
};

/** Options for `useQueryBuilder` — either uncontrolled (initialQuery) or controlled (query + onChange). */
export type UseQueryBuilderOptions<TSchema extends QuerySchema> =
  UseQueryBuilderOptionsBase &
    (
      | { initialQuery: QueryNodeInput<TSchema> }
      | {
          query: QueryNode<TSchema>;
          onChange: (query: QueryNode<TSchema>) => void;
        }
    );

// ── Mutation function types ───────────────────────────────────────────────────

export type AddCondition<TSchema extends QuerySchema> = (
  groupId: string,
  node: ConditionNodeInput<TSchema>,
) => void;

export type AddGroup<TSchema extends QuerySchema> = (
  groupId: string,
  operator: GroupOperatorId<TSchema>,
  children?: readonly QueryNodeInput<TSchema>[],
) => void;

export type InsertCondition<TSchema extends QuerySchema> = (
  groupId: string,
  index: number,
  node: ConditionNodeInput<TSchema>,
) => void;

export type InsertGroup<TSchema extends QuerySchema> = (
  groupId: string,
  index: number,
  operator: GroupOperatorId<TSchema>,
  children?: readonly QueryNodeInput<TSchema>[],
) => void;

export type RemoveNode = (nodeId: string) => void;

export type MoveNode = (
  nodeId: string,
  targetGroupId: string,
  index?: number,
) => void;

export type UpdateCondition<TSchema extends QuerySchema> = (
  nodeId: string,
  patch: Partial<ConditionNodeInput<TSchema>>,
) => void;

export type UpdateGroupOperator<TSchema extends QuerySchema> = (
  groupId: string,
  operator: GroupOperatorId<TSchema>,
) => void;

// ── Return type ───────────────────────────────────────────────────────────────

/** Return value of `useQueryBuilder`. */
export interface UseQueryBuilderReturn<TSchema extends QuerySchema> {
  query: QueryNode<TSchema>;
  addCondition: AddCondition<TSchema>;
  addGroup: AddGroup<TSchema>;
  insertCondition: InsertCondition<TSchema>;
  insertGroup: InsertGroup<TSchema>;
  removeNode: RemoveNode;
  moveNode: MoveNode;
  updateCondition: UpdateCondition<TSchema>;
  updateGroupOperator: UpdateGroupOperator<TSchema>;
}
