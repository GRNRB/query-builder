import Box from "@mui/material/Box";
import { useBuilder } from "../context";
import { Token } from "./Token";
import { ValueEditor } from "./ValueEditor";
import { arityOf, fieldDef, opDef } from "../schema";
import type { ConditionNodeT } from "../schema";

/** Candidate chip colors for field tokens. */
const FIELD_COLORS = [
  "primary",
  "secondary",
  "success",
  "warning",
  "error",
  "info",
  "caution",
  "discovery",
] as const;

/** Stable pseudo-random chip color for a field token, derived from its key so
 * it stays put across re-renders instead of flickering on every paint. */
function fieldColor(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i++)
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  return FIELD_COLORS[Math.abs(hash) % FIELD_COLORS.length];
}

/** Renders one condition as field / operator / value chips. */
export function ConditionTokens({ node }: { node: ConditionNodeT }) {
  const { openPalette, beginValueEdit, editingValueId } = useBuilder();

  const field = fieldDef(node.field);
  const op = opDef(node.operator);
  const showValue = arityOf(node.operator) !== "none";
  const valueStr = String((node as { value?: unknown }).value ?? "");
  const isEditing = editingValueId === node.id;

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        px: 0.5,
        py: 0.25,
        borderRadius: 1.5,
        userSelect: "none",
      }}
    >
      <Token
        focus={{ nodeId: node.id, part: "field" }}
        label={field?.label ?? node.field}
        variant="soft"
        color={fieldColor(node.id)}
        title="Change field — type to search"
        onActivate={(el) => openPalette(node.id, "field", el, "")}
      />
      <Token
        focus={{ nodeId: node.id, part: "operator" }}
        label={op?.label ?? node.operator}
        variant="soft"
        color="default"
        title="Change operator — type to search"
        onActivate={(el) => openPalette(node.id, "operator", el, "")}
      />

      {showValue &&
        (isEditing ? (
          <ValueEditor node={node} />
        ) : (
          <Token
            focus={{ nodeId: node.id, part: "value" }}
            label={valueStr || "value…"}
            variant="outlined"
            italic={!valueStr}
            title="Edit value — type to replace"
            onActivate={() => beginValueEdit(node.id, "")}
          />
        ))}
    </Box>
  );
}
