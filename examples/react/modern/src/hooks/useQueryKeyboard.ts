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
import { STARTER, nextGroupOp } from "../schema";
import type { GroupNodeT, Node, S } from "../schema";
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
}

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

/** The group new siblings/children should be added to for the current cursor. */
function groupContextId(root: Node, f: Focus): string {
  const node = findNode(root, f.nodeId);
  if (node?.type === "group") {
    if (f.part === "bracket-close") {
      const loc = findParentAndIndex(root, node.id);
      return loc ? loc.parentId : node.id;
    }
    return node.id;
  }
  const loc = findParentAndIndex(root, f.nodeId);
  return loc ? loc.parentId : root.id;
}

export function useQueryKeyboard({
  qb,
  fm,
  openPalette,
  beginValueEdit,
  blockedRef,
}: KeyboardDeps) {
  const { focusRef, focusToken, queueFocus, moveVertical } = fm;

  return function onKeyDown(e: ReactKeyboardEvent) {
    if (blockedRef.current) return;
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

      case "[": {
        e.preventDefault();
        if (e.shiftKey) {
          // Append a group at the end of the cursor's group.
          const gid = groupContextId(root, f);
          qb.addGroup(gid, "and", [{ ...STARTER }]);
          queueFocus((r) => {
            const g = findNode(r, gid);
            return g && g.type === "group" && g.children.length
              ? firstFocusableOf(g.children[g.children.length - 1])
              : null;
          });
          return;
        }
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
        const path = pathTo(root, f.nodeId) ?? [];
        const groups = path.filter(
          (n): n is GroupNodeT => n.type === "group" && n.id !== root.id,
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
              // Populated group: Enter toggles the AND/OR operator.
              qb.updateGroupOperator(node.id, nextGroupOp(node.operator));
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
          e.preventDefault();
          qb.updateGroupOperator(node.id, nextGroupOp(node.operator));
        }
        return;
      }

      case "t":
      case "T": {
        // Reserved command: toggle the combinator (no-op elsewhere, never types).
        e.preventDefault();
        if (
          f.part === "combinator" &&
          node.type === "group" &&
          node.children.length > 0
        ) {
          qb.updateGroupOperator(node.id, nextGroupOp(node.operator));
        }
        return;
      }
    }

    // ── Printable character → open palette / start value edit ────────────────
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (f.part === "field" || f.part === "operator") {
        e.preventDefault();
        openPalette(f.nodeId, f.part, e.target as HTMLElement, e.key);
      } else if (f.part === "value") {
        e.preventDefault();
        beginValueEdit(f.nodeId, e.key);
      }
    }
  };
}
