import { useRef, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useQueryBuilder } from "@grnrb/react-query-builder";

import { BuilderProvider } from "./context";
import { findNode } from "./lib/tree";
import type { BuilderContextValue } from "./context";
import { ExpressionGroup } from "./components/ExpressionGroup";
import { CommandPalette } from "./components/CommandPalette";
import { JsonPanel } from "./components/JsonPanel";
import { Legend } from "./components/Legend";
import { useFocusManager } from "./hooks/useFocusManager";
import { usePalette } from "./hooks/usePalette";
import { useDragState } from "./hooks/useDragState";
import { useQueryKeyboard } from "./hooks/useQueryKeyboard";
import { findParentAndIndex, firstFocusableOf } from "./lib/focus";
import type { Focus } from "./lib/focus";
import {
  arityOf,
  initialQuery,
  nextGroupOp,
  schema,
  STARTER,
} from "./schema";
import type { GroupNodeT } from "./schema";

export default function App() {
  const qb = useQueryBuilder(schema, { initialQuery });

  const [editing, setEditing] = useState<{ nodeId: string; seed: string } | null>(
    null,
  );
  const pal = usePalette();

  // Raised while a popover (palette / value editor) owns focus, so the focus
  // manager and global keyboard handler both stand down.
  const blocked = pal.palette !== null || editing !== null;
  const suppressRef = useRef(false);
  suppressRef.current = blocked;

  const fm = useFocusManager(qb.query, suppressRef);
  const drag = useDragState(qb.query, qb.moveNode, fm.queueFocus);

  // ── High-level actions shared by clicks and the keyboard handler ───────────

  const beginValueEdit = (nodeId: string, seed: string) =>
    setEditing({ nodeId, seed });

  const commitValue = (nodeId: string, value: string) => {
    qb.updateCondition(nodeId, { value: value as never });
    setEditing(null);
    fm.focusToken({ nodeId, part: "value" });
  };

  const cancelValueEdit = () => {
    const id = editing?.nodeId;
    setEditing(null);
    if (id) fm.focusToken({ nodeId: id, part: "value" });
  };

  const toggleCombinator = (groupId: string) => {
    const g = findNode(qb.query, groupId);
    if (g?.type === "group")
      qb.updateGroupOperator(groupId, nextGroupOp(g.operator));
  };

  const removeWithFocus = (nodeId: string) => {
    const loc = findParentAndIndex(qb.query, nodeId);
    if (!loc) return;
    const parent = findNode(qb.query, loc.parentId) as GroupNodeT;
    const prev = parent.children[loc.index - 1];
    const next = parent.children[loc.index + 1];
    const target: Focus = prev
      ? firstFocusableOf(prev)
      : next
        ? firstFocusableOf(next)
        : { nodeId: loc.parentId, part: "combinator" };
    qb.removeNode(nodeId);
    fm.queueFocus(() => target);
  };

  const addConditionTo = (groupId: string) => {
    qb.addCondition(groupId, { ...STARTER });
    fm.queueFocus((r) => {
      const g = findNode(r, groupId);
      return g && g.type === "group" && g.children.length
        ? firstFocusableOf(g.children[g.children.length - 1])
        : null;
    });
  };

  // ── Command-palette commit / close ─────────────────────────────────────────

  const fieldOf = (nodeId: string) => {
    const n = findNode(qb.query, nodeId);
    return n?.type === "condition" ? n.field : "name";
  };

  const onPick = (id: string) => {
    const p = pal.palette;
    if (!p) return;
    if (p.part === "field") {
      qb.updateCondition(p.nodeId, { field: id as never });
      pal.closePalette();
      fm.focusToken({ nodeId: p.nodeId, part: "operator" });
    } else {
      qb.updateCondition(p.nodeId, { operator: id as never });
      pal.closePalette();
      fm.queueFocus((r) => {
        const n = findNode(r, p.nodeId);
        return n?.type === "condition" && arityOf(n.operator) !== "none"
          ? { nodeId: p.nodeId, part: "value" }
          : { nodeId: p.nodeId, part: "operator" };
      });
    }
  };

  const closePaletteAndReturn = () => {
    const p = pal.palette;
    pal.closePalette();
    if (p) fm.focusToken({ nodeId: p.nodeId, part: p.part });
  };

  const onKeyDown = useQueryKeyboard({
    qb,
    fm,
    openPalette: pal.openPalette,
    beginValueEdit,
    blockedRef: suppressRef,
  });

  const ctx: BuilderContextValue = {
    query: qb.query,
    focus: fm.focus,
    registerToken: fm.registerToken,
    focusToken: fm.focusToken,
    openPalette: pal.openPalette,
    beginValueEdit,
    editingValueId: editing?.nodeId ?? null,
    editSeed: editing?.seed ?? "",
    commitValue,
    cancelValueEdit,
    toggleCombinator,
    removeNode: removeWithFocus,
    addCondition: addConditionTo,
    drag,
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        py: 6,
        px: 3,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 920 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          Query Builder — keyboard-first
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
          An inline, bracketed expression driven almost entirely from the
          keyboard. Focus any token and start typing; press{" "}
          <Box component="kbd" sx={{ fontFamily: "monospace", fontWeight: 700 }}>
            [
          </Box>{" "}
          to nest a group.
        </Typography>

        <Legend />

        <BuilderProvider value={ctx}>
          <Paper
            variant="outlined"
            tabIndex={0}
            onKeyDown={onKeyDown}
            onFocus={(e) => {
              // Tab landed on the shell itself → hand focus to the active token.
              if (e.target === e.currentTarget) fm.restoreFocus();
            }}
            onMouseDown={(e) => {
              // Clicking empty space inside the builder pulls the cursor back in.
              const el = e.target as HTMLElement;
              if (!el.closest('[data-qb-token], input, textarea, button')) {
                e.preventDefault();
                fm.restoreFocus();
              }
            }}
            sx={{
              p: 2.5,
              borderRadius: 3,
              minHeight: 88,
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              lineHeight: 2,
              outline: "none",
            }}
          >
            <ExpressionGroup
              node={qb.query as GroupNodeT}
              isRoot
              depth={0}
            />
          </Paper>

          {pal.palette && (
            <CommandPalette
              palette={pal.palette}
              fieldOf={fieldOf}
              onPick={onPick}
              onClose={closePaletteAndReturn}
            />
          )}
        </BuilderProvider>

        <JsonPanel query={qb.query} />
      </Box>
    </Box>
  );
}
