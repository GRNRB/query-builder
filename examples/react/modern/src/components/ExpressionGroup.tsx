import { Fragment } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { useBuilder } from "../context";
import { Token } from "./Token";
import { BracketChip } from "./BracketChip";
import { ConditionTokens } from "./ConditionTokens";
import { bracketColor } from "../lib/colors";
import type { GroupNodeT } from "../schema";

// ─── Drop zone (vertical insertion caret between inline tokens) ───────────────

function DropZone({ groupId, index }: { groupId: string; index: number }) {
  const { drag } = useBuilder();
  if (!drag.draggingId) return null;
  const active =
    drag.dropTarget?.groupId === groupId && drag.dropTarget?.index === index;

  return (
    <Box
      component="span"
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        drag.setDropTarget({ groupId, index });
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        drag.onDrop(groupId, index);
      }}
      sx={{
        alignSelf: "stretch",
        width: active ? 8 : 4,
        minHeight: 24,
        mx: 0.25,
        borderRadius: 1,
        cursor: "copy",
        background: (theme) =>
          active ? theme.palette.primary.main : "transparent",
        border: (theme) =>
          `1px dashed ${
            active ? theme.palette.primary.main : theme.palette.colors.alpha.alpha20
          }`,
        transition: "all .1s",
      }}
    />
  );
}

// ─── Combinator (AND / OR between children) ──────────────────────────────────

function Combinator({
  node,
  focusable,
}: {
  node: GroupNodeT;
  focusable: boolean;
}) {
  const { toggleCombinator } = useBuilder();
  const label = node.operator.toUpperCase();

  if (focusable) {
    return (
      <Token
        focus={{ nodeId: node.id, part: "combinator" }}
        label={label}
        variant="solid"
        color="primary"
        title="Toggle AND / OR (t)"
        onActivate={() => toggleCombinator(node.id)}
      />
    );
  }

  return (
    <Chip
      label={label}
      size="small"
      variant="solid"
      color="primary"
      clickable
      onClick={() => toggleCombinator(node.id)}
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
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 0.75,
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
      {/* The root brackets are drawn too, but cannot be dragged or removed. */}
      <BracketChip node={node} side="open" depth={depth} draggable={!isRoot} />

      <DropZone groupId={node.id} index={0} />

      {node.children.length === 0 && <EmptyGroupSlot node={node} />}

      {node.children.map((child, i) => (
        <Fragment key={child.id}>
          {i > 0 && <Combinator node={node} focusable={i === 1} />}
          {child.type === "group" ? (
            <ExpressionGroup node={child} isRoot={false} depth={depth + 1} />
          ) : (
            <ConditionTokens node={child} />
          )}
          <DropZone groupId={node.id} index={i + 1} />
        </Fragment>
      ))}

      <BracketChip node={node} side="close" depth={depth} draggable={!isRoot} />
    </Box>
  );
}
