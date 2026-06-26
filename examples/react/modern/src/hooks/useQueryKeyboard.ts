import type { KeyboardEvent as ReactKeyboardEvent, MutableRefObject } from "react";
import type { UseQueryBuilderReturn } from "@grnrb/react-query-builder";
import {
  findParentAndIndex,
  firstFocusableOf,
  flattenFocusables,
  pathTo,
  sameFocus,
} from "../lib/focus";
import { findNode } from "../lib/tree";
import type { Focus } from "../lib/focus";
import { STARTER } from "../schema";
import type { GroupNodeT, S } from "../schema";
import type { FocusManager } from "./useFocusManager";
import type { PalettePart } from "./usePalette";

interface KeyboardDeps {
  qb: UseQueryBuilderReturn<S>;
  fm: FocusManager;
  openPalette: (
    nodeId: string,
    part: PalettePart,
    anchorEl: HTMLElement,
    seed: string,
  ) => void;
  beginValueEdit: (nodeId: string, seed: string) => void;
  /** True while the palette or value editor owns focus — keyboard is paused. */
  blockedRef: MutableRefObject<boolean>;
  undo: () => void;
  redo: () => void;
}

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

export function useQueryKeyboard({
  qb,
  fm,
  openPalette,
  beginValueEdit,
  blockedRef,
  undo,
  redo,
}: KeyboardDeps) {
  const { focusRef, focusToken, queueFocus, moveVertical } = fm;

  return function onKeyDown(e: ReactKeyboardEvent) {
    if (blockedRef.current) return;

    // ── Undo / redo (Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z, Ctrl/Cmd+Y) ───────────────
    if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z")) {
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
      // The restored tree carries different node ids; keep the cursor valid.
      queueFocus((r) => {
        const cur = focusRef.current;
        return cur && findNode(r, cur.nodeId) ? cur : firstFocusableOf(r);
      });
      return;
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === "y" || e.key === "Y")) {
      e.preventDefault();
      redo();
      queueFocus((r) => firstFocusableOf(r));
      return;
    }

    const f = focusRef.current;
    if (!f) return;

    const root = qb.query;
    const node = findNode(root, f.nodeId);
    if (!node) return;

    const flat = flattenFocusables(root, true);
    const idx = flat.findIndex((x) => sameFocus(x, f));
    const moveFocus = (delta: number) => {
      if (idx < 0) return;
      focusToken(flat[clamp(idx + delta, 0, flat.length - 1)]);
    };

    // ── Reorder (Alt+Arrow) — checked before plain arrow navigation ──────────
    if (e.altKey && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
      e.preventDefault();
      const loc = findParentAndIndex(root, f.nodeId);
      if (!loc) return;
      const parent = findNode(root, loc.parentId) as GroupNodeT | undefined;
      if (!parent) return;
      const next = clamp(
        loc.index + (e.key === "ArrowRight" ? 1 : -1),
        0,
        parent.children.length - 1,
      );
      if (next === loc.index) return;
      qb.moveNode(f.nodeId, loc.parentId, next);
      queueFocus((r) => {
        const n = findNode(r, f.nodeId);
        return n ? { nodeId: n.id, part: f.part } : null;
      });
      return;
    }

    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        moveFocus(1);
        return;
      case "ArrowLeft":
        e.preventDefault();
        moveFocus(-1);
        return;
      case "ArrowDown":
        e.preventDefault();
        moveVertical("down");
        return;
      case "ArrowUp":
        e.preventDefault();
        moveVertical("up");
        return;
      case "Tab":
        e.preventDefault();
        moveFocus(e.shiftKey ? -1 : 1);
        return;
      case "Home":
        e.preventDefault();
        if (flat[0]) focusToken(flat[0]);
        return;
      case "End":
        e.preventDefault();
        if (flat.length) focusToken(flat[flat.length - 1]);
        return;

      case "g":
      case "G": {
        // `g` is the dedicated "new group" command (reserved from type-to-search).
        e.preventDefault();
        if (
          node.type === "group" &&
          (f.part === "bracket-open" || f.part === "combinator")
        ) {
          // Nest a new group at the front of this group.
          qb.insertGroup(node.id, 0, "and", [{ ...STARTER }]);
          queueFocus((r) => {
            const g = findNode(r, node.id);
            return g && g.type === "group" && g.children[0]
              ? firstFocusableOf(g.children[0])
              : null;
          });
          return;
        }
        // Insert a sibling group right after the focused node.
        const loc = findParentAndIndex(root, f.nodeId);
        if (!loc) return;
        qb.insertGroup(loc.parentId, loc.index + 1, "and", [{ ...STARTER }]);
        queueFocus((r) => {
          const p = findNode(r, loc.parentId);
          const child =
            p && p.type === "group" ? p.children[loc.index + 1] : undefined;
          return child ? firstFocusableOf(child) : null;
        });
        return;
      }

      case "]": {
        e.preventDefault();
        // Enclosing groups, innermost last — the root counts so `]` can reach
        // the outermost close bracket from a direct child of the root.
        const path = pathTo(root, f.nodeId) ?? [];
        const groups = path.filter(
          (n): n is GroupNodeT => n.type === "group",
        );
        const target =
          f.part === "bracket-close"
            ? groups[groups.length - 2]
            : groups[groups.length - 1];
        if (target) focusToken({ nodeId: target.id, part: "bracket-close" });
        return;
      }

      case "Enter": {
        // Enter acts on the focused token; it never creates a condition (that's `c`).
        e.preventDefault();
        if (node.type === "group") {
          if (f.part === "combinator") {
            if (node.children.length === 0) {
              // Empty group: Enter seeds the first condition so the group is usable.
              qb.addCondition(node.id, { ...STARTER });
              queueFocus((r) => {
                const g = findNode(r, node.id);
                return g && g.type === "group" && g.children.length
                  ? firstFocusableOf(g.children[g.children.length - 1])
                  : null;
              });
            } else {
              // Populated group: open the picker to choose the group operator.
              openPalette(node.id, "combinator", e.target as HTMLElement, "");
            }
          }
          // Brackets: Enter does nothing (use `c` to add a condition).
          return;
        }
        if (f.part === "field" || f.part === "operator") {
          openPalette(f.nodeId, f.part, e.target as HTMLElement, "");
        } else if (f.part === "value") {
          beginValueEdit(f.nodeId, "");
        }
        return;
      }

      case "c":
      case "C": {
        // `c` is the dedicated "new condition" command (reserved from type-to-search).
        e.preventDefault();
        if (node.type === "group") {
          qb.addCondition(node.id, { ...STARTER });
          queueFocus((r) => {
            const g = findNode(r, node.id);
            return g && g.type === "group" && g.children.length
              ? firstFocusableOf(g.children[g.children.length - 1])
              : null;
          });
          return;
        }
        const loc = findParentAndIndex(root, f.nodeId);
        if (!loc) return;
        qb.insertCondition(loc.parentId, loc.index + 1, { ...STARTER });
        queueFocus((r) => {
          const p = findNode(r, loc.parentId);
          const child =
            p && p.type === "group" ? p.children[loc.index + 1] : undefined;
          return child ? firstFocusableOf(child) : null;
        });
        return;
      }

      case "Backspace":
      case "Delete": {
        e.preventDefault();
        const loc = findParentAndIndex(root, f.nodeId);
        if (!loc) return; // never remove the root
        const parent = findNode(root, loc.parentId) as GroupNodeT;
        const prev = parent.children[loc.index - 1];
        const next = parent.children[loc.index + 1];
        const target: Focus = prev
          ? firstFocusableOf(prev)
          : next
            ? firstFocusableOf(next)
            : { nodeId: loc.parentId, part: "combinator" };
        qb.removeNode(f.nodeId);
        queueFocus(() => target);
        return;
      }

      case " ": {
        if (f.part === "field" || f.part === "operator") {
          e.preventDefault();
          openPalette(f.nodeId, f.part, e.target as HTMLElement, "");
        } else if (f.part === "value") {
          e.preventDefault();
          beginValueEdit(f.nodeId, "");
        } else if (
          f.part === "combinator" &&
          node.type === "group" &&
          node.children.length > 0
        ) {
          // Group operator: Space opens the picker (same as Enter).
          e.preventDefault();
          openPalette(f.nodeId, "combinator", e.target as HTMLElement, "");
        }
        return;
      }
    }

    // ── Printable character → open palette / start value edit ────────────────
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (f.part === "field" || f.part === "operator") {
        e.preventDefault();
        openPalette(f.nodeId, f.part, e.target as HTMLElement, e.key);
      } else if (
        f.part === "combinator" &&
        node.type === "group" &&
        node.children.length > 0
      ) {
        e.preventDefault();
        openPalette(f.nodeId, "combinator", e.target as HTMLElement, e.key);
      } else if (f.part === "value") {
        e.preventDefault();
        beginValueEdit(f.nodeId, e.key);
      }
    }
  };
}
