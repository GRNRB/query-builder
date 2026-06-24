export type Arity = "none" | "one" | "two" | "many";

/** Defines a single filter operator (e.g. "equals", "contains"). */
export interface OperatorDefinition<TId extends string = string> {
  id: TId;
  arity: Arity;
  label: string;
}

/** Describes a filterable field and which operators it supports. */
export interface FieldDefinition<
  TFieldId extends string = string,
  TOperatorId extends string = string,
> {
  id: TFieldId;
  label: string;
  supportedOperators: readonly TOperatorId[];
  defaultOperator?: TOperatorId;
}

/** Full schema describing fields, condition operators, and group operators. */
export interface QuerySchema<
  TFieldId extends string = string,
  TOperator extends OperatorDefinition = OperatorDefinition,
  TGroupOperator extends OperatorDefinition = OperatorDefinition,
> {
  fields: readonly FieldDefinition<TFieldId, TOperator["id"]>[];
  conditionOperators: readonly TOperator[];
  groupOperators?: readonly TGroupOperator[];
}

/** Maps an arity to the expected value shape for that arity. */
export type ValueForArity<
  TArity extends Arity,
  TValue = unknown,
> = TArity extends "none"
  ? undefined
  : TArity extends "one"
    ? TValue
    : TArity extends "two"
      ? readonly [TValue, TValue]
      : readonly TValue[];

type ConditionNodeData<
  TFieldDefinition extends FieldDefinition,
  TOperator extends OperatorDefinition,
> = {
  [F in TFieldDefinition as F["id"]]: {
    [O in Extract<
      TOperator,
      { id: F["supportedOperators"][number] }
    > as O["id"]]: {
      field: F["id"];
      operator: O["id"];
    } & (O["arity"] extends "none"
      ? { value?: undefined }
      : { value: ValueForArity<O["arity"]> });
  }[Extract<TOperator, { id: F["supportedOperators"][number] }>["id"]];
}[TFieldDefinition["id"]];

/** A leaf node representing a single filter condition. */
export type ConditionNode<
  TFieldDefinition extends FieldDefinition = FieldDefinition,
  TOperator extends OperatorDefinition = OperatorDefinition,
> = {
  id: string;
  type: "condition";
  field: TFieldDefinition["id"];
  operator: TOperator["id"];
} & ConditionNodeData<TFieldDefinition, TOperator>;

/** A node that groups conditions or other groups with a logical operator. */
export interface GroupNode<
  TFieldDefinition extends FieldDefinition = FieldDefinition,
  TOperator extends OperatorDefinition = OperatorDefinition,
  TGroupOperatorId extends string = string,
> {
  id: string;
  type: "group";
  operator: TGroupOperatorId;
  readonly children: readonly (
    | ConditionNode<TFieldDefinition, TOperator>
    | GroupNode<TFieldDefinition, TOperator, TGroupOperatorId>
  )[];
}

/** Union of all possible nodes in a query tree. */
export type QueryNode<TSchema extends QuerySchema = QuerySchema> =
  | ConditionNode<
      TSchema["fields"][number],
      TSchema["conditionOperators"][number]
    >
  | GroupNode<
      TSchema["fields"][number],
      TSchema["conditionOperators"][number],
      NonNullable<TSchema["groupOperators"]>[number]["id"]
    >;

// ── Helper aliases ────────────────────────────────────────────────────────────

/** Extracts the union of valid group operator id strings from a schema. */
export type GroupOperatorId<TSchema extends QuerySchema> = NonNullable<
  TSchema["groupOperators"]
>[number]["id"];

// ── Input variants (id optional) ──────────────────────────────────────────────

// Distributive helper — preserves the discriminated union structure when making id optional
type WithOptionalId<T> = T extends { id: string }
  ? Omit<T, "id"> & { id?: string }
  : never;

/** `ConditionNode` with `id` made optional for use as input to mutations. */
export type ConditionNodeInput<TSchema extends QuerySchema> = WithOptionalId<
  ConditionNode<
    TSchema["fields"][number],
    TSchema["conditionOperators"][number]
  >
>;

/** `GroupNode` with `id` made optional for use as input to mutations. */
export type GroupNodeInput<TSchema extends QuerySchema> = {
  id?: string;
  type: "group";
  operator: GroupOperatorId<TSchema>;
  children: readonly QueryNodeInput<TSchema>[];
};

/** Union input type accepted by tree-building helpers. */
export type QueryNodeInput<TSchema extends QuerySchema> =
  | ConditionNodeInput<TSchema>
  | GroupNodeInput<TSchema>;

export type ValidateFieldDefaults<TFields extends readonly FieldDefinition[]> =
  {
    readonly [K in keyof TFields]: TFields[K] extends FieldDefinition
      ? FieldDefinition<
          TFields[K]["id"],
          TFields[K]["supportedOperators"][number]
        >
      : never;
  };

export type Action<TSchema extends QuerySchema> =
  | { type: "APPEND_NODE"; groupId: string; node: QueryNode<TSchema> }
  | {
      type: "INSERT_NODE";
      groupId: string;
      index: number;
      node: QueryNode<TSchema>;
    }
  | { type: "MOVE_NODE"; nodeId: string; targetGroupId: string; index?: number }
  | { type: "REMOVE_NODE"; nodeId: string }
  | {
      type: "UPDATE_NODE";
      nodeId: string;
      patch: Partial<ConditionNodeInput<TSchema>>;
    }
  | {
      type: "UPDATE_GROUP_OPERATOR";
      groupId: GroupOperatorId<TSchema>;
      operator: string;
    };
