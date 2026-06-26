import { Fragment } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { useBuilder } from "../context";
import { Token } from "./Token";
import { BracketChip } from "./BracketChip";
import { ConditionTokens } from "./ConditionTokens";
import { bracketColor } from "../lib/colors";
import { arityOf, fieldDef, opDef } from "../schema";
import type { GroupNodeT, Node } from "../schema";

// ─── Combinator (AND / OR between children) ──────────────────────────────────

function Combinator({
  node,
  focusable,
}: {
  node: GroupNodeT;
  focusable: boolean;
}) {
  const { openPalette } = useBuilder();
  const label = node.operator.toUpperCase();

  if (focusable) {
    return (
      <Token
        focus={{ nodeId: node.id, part: "combinator" }}
        label={label}
        variant="solid"
        color="primary"
        title="Change operator — type to search"
        onActivate={(el) => openPalette(node.id, "combinator", el, "")}
      />
    );
  }

  // Repeated combinators are decorative duplicates of the same group operator;
  // clicking any of them opens the picker for the whole group.
  return (
    <Chip
      label={label}
      size="small"
      variant="solid"
      color="primary"
      clickable
      onClick={(e) => openPalette(node.id, "combinator", e.currentTarget, "")}
      sx={{ cursor: "pointer", opacity: 0.85 }}
    />
  );
}

// ─── Empty-group placeholder ─────────────────────────────────────────────────

function EmptyGroupSlot({ node }: { node: GroupNodeT }) {
  const { addCondition } = useBuilder();
  return (
    <Token
      focus={{ nodeId: node.id, part: "combinator" }}
      label="empty — press c"
      variant="outlined"
      italic
      title="Press c (or Enter) to add the first condition"
      onActivate={() => addCondition(node.id)}
    />
  );
}

// ─── Layout heuristic — inline when small, indented column when large ─────────

/** Estimated inline width (≈ characters) above which a group breaks to lines. */
const INLINE_MAX = 42;

/** Approximate width of a node rendered inline; drives the inline-vs-break choice. */
function flatWidth(node: Node): number {
  if (node.type === "condition") {
    const field = fieldDef(node.field)?.label ?? node.field;
    const op = opDef(node.operator)?.label ?? node.operator;
    const value =
      arityOf(node.operator) === "none"
        ? ""
        : String((node as { value?: unknown }).value ?? "") || "value…";
    return field.length + op.length + value.length + 2;
  }
  const inner = node.children.reduce((sum, c) => sum + flatWidth(c), 0);
  const combinators =
    node.children.length > 1
      ? (node.children.length - 1) * (node.operator.length + 2)
      : 0;
  return inner + combinators + 4; // "[ " … " ]"
}

// ─── Recursive group renderer ────────────────────────────────────────────────

export function ExpressionGroup({
  node,
  isRoot,
  depth,
}: {
  node: GroupNodeT;
  isRoot: boolean;
  depth: number;
}) {
  // Small groups stay inline; large ones break onto indented lines. A broken
  // child always makes its parent break too (its width is part of the parent's).
  const broken = flatWidth(node) > INLINE_MAX;

  const body = (
    <>
      {node.children.length === 0 && <EmptyGroupSlot node={node} />}

      {node.children.map((child, i) => (
        <Fragment key={child.id}>
          {i > 0 && <Combinator node={node} focusable={i === 1} />}
          {child.type === "group" ? (
            <ExpressionGroup node={child} isRoot={false} depth={depth + 1} />
          ) : (
            <ConditionTokens node={child} />
          )}
        </Fragment>
      ))}
    </>
  );

  return (
    <Box
      sx={{
        ...(broken
          ? {
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 0.5,
            }
          : {
              display: "inline-flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 0.75,
            }),
        ...(isRoot
          ? {}
          : {
              px: 0.75,
              py: 0.5,
              borderRadius: 2,
              background: `${bracketColor(depth)}0d`, // ~5% tint
            }),
      }}
    >
      {/* The root brackets are drawn too, but cannot be removed. */}
      <BracketChip node={node} side="open" depth={depth} />

      {broken ? (
        // Indented body — each child and combinator sits on its own line.
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            alignSelf: "stretch",
            gap: 0.5,
            pl: 2.5,
          }}
        >
          {body}
        </Box>
      ) : (
        body
      )}

      <BracketChip node={node} side="close" depth={depth} />
    </Box>
  );
}
