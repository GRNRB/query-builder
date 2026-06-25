import Box from "@mui/material/Box";
import { useBuilder } from "../context";
import { Token } from "./Token";
import { ValueEditor } from "./ValueEditor";
import { arityOf, fieldDef, opDef } from "../schema";
import type { ConditionNodeT } from "../schema";

/** Renders one condition as field / operator / value chips plus a remove button. */
export function ConditionTokens({ node }: { node: ConditionNodeT }) {
  const { openPalette, beginValueEdit, editingValueId, removeNode, drag } =
    useBuilder();

  const field = fieldDef(node.field);
  const op = opDef(node.operator);
  const showValue = arityOf(node.operator) !== "none";
  const valueStr = String((node as { value?: unknown }).value ?? "");
  const isDragging = drag.draggingId === node.id;
  const isEditing = editingValueId === node.id;

  return (
    <Box
      component="span"
      draggable={!isEditing}
      onDragStart={(e) => {
        e.stopPropagation();
        drag.onDragStart(node.id);
      }}
      onDragEnd={drag.onDragEnd}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        px: 0.5,
        py: 0.25,
        borderRadius: 1.5,
        cursor: "grab",
        userSelect: "none",
        opacity: isDragging ? 0.4 : 1,
        transition: "opacity .12s",
      }}
    >
      <Token
        focus={{ nodeId: node.id, part: "field" }}
        label={field?.label ?? node.field}
        variant="soft"
        color="discovery"
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

      {showValue ? (
        isEditing ? (
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
        )
      ) : (
        <Box
          component="span"
          sx={{ fontSize: 12, fontStyle: "italic", color: "text.secondary" }}
        >
          —
        </Box>
      )}

      <Box
        component="button"
        aria-label="Remove condition"
        title="Remove (Backspace)"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={() => removeNode(node.id)}
        sx={{
          border: "none",
          background: "transparent",
          color: "text.secondary",
          cursor: "pointer",
          fontSize: 13,
          lineHeight: 1,
          px: 0.25,
          borderRadius: 1,
          "&:hover": { color: "error.main" },
        }}
      >
        ✕
      </Box>
    </Box>
  );
}
