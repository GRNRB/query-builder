import Box from "@mui/material/Box";
import type { DragEvent } from "react";
import { useBuilder, useToken } from "../context";
import { bracketColor } from "../lib/colors";
import type { GroupNodeT } from "../schema";

/**
 * A focusable `[` / `]`. The opening bracket doubles as the drag handle for the
 * whole group; both brackets participate in keyboard navigation and `]` jump-out.
 */
export function BracketChip({
  node,
  side,
  depth,
  draggable = true,
}: {
  node: GroupNodeT;
  side: "open" | "close";
  depth: number;
  /** Root brackets pass false — they are not a drag handle. */
  draggable?: boolean;
}) {
  const { drag } = useBuilder();
  const t = useToken({
    nodeId: node.id,
    part: side === "open" ? "bracket-open" : "bracket-close",
  });

  const isHandle = side === "open" && draggable;
  const dragProps = isHandle
    ? {
        draggable: true,
        onDragStart: (e: DragEvent) => {
          e.stopPropagation();
          drag.onDragStart(node.id);
        },
        onDragEnd: drag.onDragEnd,
      }
    : {};

  return (
    <Box
      component="span"
      ref={t.ref}
      data-qb-token=""
      tabIndex={t.tabIndex}
      onClick={() => t.focusSelf()}
      {...dragProps}
      sx={{
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontWeight: 800,
        fontSize: 20,
        lineHeight: 1,
        color: bracketColor(depth),
        cursor: isHandle ? "grab" : "default",
        px: 0.5,
        py: 0.25,
        borderRadius: 1,
        outline: "none",
        userSelect: "none",
        transition: "background .1s",
        ...(t.isFocused && {
          background: (theme) => theme.palette.colors.alpha.alpha08,
          boxShadow: (theme) =>
            `0 0 0 2px ${theme.palette.background.default}, 0 0 0 4px ${theme.palette.primary.main}`,
        }),
      }}
    >
      {side === "open" ? "[" : "]"}
    </Box>
  );
}
