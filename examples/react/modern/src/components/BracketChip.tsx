import Box from "@mui/material/Box";
import { useToken } from "../context";
import { bracketColor } from "../lib/colors";
import type { GroupNodeT } from "../schema";

/**
 * A focusable `[` / `]`. Both brackets participate in keyboard navigation and
 * the `]` jump-out shortcut.
 */
export function BracketChip({
  node,
  side,
  depth,
}: {
  node: GroupNodeT;
  side: "open" | "close";
  depth: number;
}) {
  const t = useToken({
    nodeId: node.id,
    part: side === "open" ? "bracket-open" : "bracket-close",
  });

  return (
    <Box
      component="span"
      ref={t.ref}
      data-qb-token=""
      tabIndex={t.tabIndex}
      onClick={() => t.focusSelf()}
      sx={{
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontWeight: 800,
        fontSize: 20,
        lineHeight: 1,
        color: bracketColor(depth),
        cursor: "default",
        px: 0.5,
        py: 0.25,
        borderRadius: 1,
        outline: "none",
        userSelect: "none",
        transition: "background .1s",
        // Blinking text-caret (I-beam) shown only while focused.
        "@keyframes qb-caret-blink": {
          "0%, 49%": { opacity: 1 },
          "50%, 100%": { opacity: 0 },
        },
        ...(t.isFocused && {
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            right: 3,
            top: "50%",
            transform: "translateY(-50%)",
            width: "1.5px",
            height: "1.05em",
            backgroundColor: "currentColor",
            animation: "qb-caret-blink 1.06s step-end infinite",
            pointerEvents: "none",
          },
        }),
      }}
    >
      {side === "open" ? "[" : "]"}
    </Box>
  );
}
