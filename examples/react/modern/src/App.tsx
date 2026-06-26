import { useRef, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import { BuilderProvider } from "./context";
import { findNode } from "./lib/tree";
import type { BuilderContextValue } from "./context";
import { ExpressionGroup } from "./components/ExpressionGroup";
import { CommandPalette } from "./components/CommandPalette";
import { JsonPanel } from "./components/JsonPanel";
import { Legend } from "./components/Legend";
import { Kbd } from "./components/Kbd";
import { useFocusManager } from "./hooks/useFocusManager";
import { usePalette } from "./hooks/usePalette";
import { useQueryKeyboard } from "./hooks/useQueryKeyboard";
import { useUndoableQuery } from "./hooks/useUndoableQuery";
import { findParentAndIndex, firstFocusableOf } from "./lib/focus";
import type { Focus } from "./lib/focus";
import { arityOf, initialQuery, STARTER } from "./schema";
import type { GroupNodeT } from "./schema";

export default function App({ embedded = false }: { embedded?: boolean } = {}) {
  const { qb, undo, redo } = useUndoableQuery(initialQuery);

  const [editing, setEditing] = useState<{
    nodeId: string;
    seed: string;
  } | null>(null);
  const pal = usePalette();

  // Raised while a popover (palette / value editor) owns focus, so the focus
  // manager and global keyboard handler both stand down.
  const blocked = pal.palette !== null || editing !== null;
  const suppressRef = useRef(false);
  suppressRef.current = blocked;

  const fm = useFocusManager(qb.query, suppressRef);

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
    } else if (p.part === "combinator") {
      qb.updateGroupOperator(p.nodeId, id as never);
      pal.closePalette();
      fm.focusToken({ nodeId: p.nodeId, part: "combinator" });
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
    undo,
    redo,
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
    removeNode: removeWithFocus,
    addCondition: addConditionTo,
  };

  return (
    <Box
      sx={{
        minHeight: embedded ? "auto" : "100vh",
        bgcolor: embedded ? "transparent" : "background.default",
        py: embedded ? 0 : 6,
        px: embedded ? 0 : 3,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 920 }}>
        {!embedded && (
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            Keyboard-first
          </Typography>
        )}

        <Legend />

        <BuilderProvider value={ctx}>
          <Paper
            variant="outlined"
            tabIndex={0}
            data-qb-shell=""
            onKeyDown={onKeyDown}
            onFocus={(e) => {
              // Tab landed on the shell itself → hand focus to the active token.
              if (e.target === e.currentTarget) fm.restoreFocus();
            }}
            onMouseDown={(e) => {
              // Clicking empty space inside the builder pulls the cursor back in.
              const el = e.target as HTMLElement;
              if (!el.closest("[data-qb-token], input, textarea, button")) {
                e.preventDefault();
                fm.restoreFocus();
              }
            }}
            sx={{
              p: 2.5,
              borderRadius: 3,
              minHeight: 88,
              display: "flex",
              alignItems: "flex-start",
              lineHeight: 2,
              outline: "none",
            }}
          >
            <ExpressionGroup node={qb.query as GroupNodeT} isRoot depth={0} />
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

        {!embedded && <JsonPanel query={qb.query} />}
      </Box>
    </Box>
  );
}
