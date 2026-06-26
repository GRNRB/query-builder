import type {
  ConditionNodeInput,
  QueryNode,
  QuerySchema,
  ValidateFieldDefaults,
} from "./type";

/**
 * Reconciles a condition patch against the schema: when the patch switches to a `field`
 * that doesn't support the current operator, it resets the operator to that field's default
 * and clears the value. Package-internal — the reducer applies this on every `UPDATE_NODE`,
 * so consumers never call it directly.
 */
export function reconcileConditionPatch<TSchema extends QuerySchema>(
  schema: TSchema,
  current: QueryNode<TSchema>,
  patch: Partial<ConditionNodeInput<TSchema>>,
): Partial<ConditionNodeInput<TSchema>> {
  if (
    !("field" in patch) ||
    patch.field === undefined ||
    current.type !== "condition"
  )
    return patch;

  const conditionNode = current;
  const currentOp = conditionNode.operator;
  const newField = schema.fields.find((f) => f.id === patch.field);

  if (!newField || newField.supportedOperators.includes(currentOp))
    return patch;

  return {
    ...patch,
    operator: newField.defaultOperator ?? newField.supportedOperators[0],
    value: undefined,
  };
}

export function defineSchema<const TSchema extends QuerySchema>(
  schema: TSchema &
    QuerySchema<
      TSchema["fields"][number]["id"],
      TSchema["conditionOperators"][number],
      NonNullable<TSchema["groupOperators"]>[number]
    > & { readonly fields: ValidateFieldDefaults<TSchema["fields"]> },
): TSchema {
  if (process.env.NODE_ENV !== "production") {
    const fieldIds = schema.fields.map((f) => f.id);
    const dupField = fieldIds.find((id, i) => fieldIds.indexOf(id) !== i);
    if (dupField) {
      console.warn(`[defineSchema] Duplicate field id: "${dupField}"`);
    }

    const opIds = schema.conditionOperators.map((o) => o.id);
    const dupOp = opIds.find((id, i) => opIds.indexOf(id) !== i);
    if (dupOp) {
      console.warn(`[defineSchema] Duplicate conditionOperator id: "${dupOp}"`);
    }

    for (const field of schema.fields) {
      if (
        field.defaultOperator !== undefined &&
        !field.supportedOperators.includes(field.defaultOperator)
      ) {
        console.warn(
          `[defineSchema] Field "${field.id}" has defaultOperator "${field.defaultOperator}" which is not in supportedOperators.`,
        );
      }
    }
  }
  return schema;
}
