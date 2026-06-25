import { useState } from "react";
import {
  findParentAndIndex,
  firstFocusableOf,
} from "../lib/focus";
import { findNode } from "../lib/tree";
import type { Focus } from "../lib/focus";
import type { Node } from "../schema";

export interface DropTarget {
  groupId: string;
  index: number;
}

export interface DragProps {
  draggingId: string | null;
  dropTarget: DropTarget | null;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  setDropTarget: (t: DropTarget | null) => void;
  onDrop: (groupId: string, index: number) => void;
}

/**
 * Mouse drag-and-drop reordering. Lifted from the docs playground widget — the
 * key subtlety is the index decrement when moving an item *downward within the
 * same group*, because `moveNode` inserts into the post-removal array.
 */
export function useDragState(
  query: Node,
  moveNode: (nodeId: string, targetGroupId: string, index: number) => void,
  queueFocus: (locator: (root: Node) => Focus | null) => void,
): DragProps {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);

  return {
    draggingId,
    dropTarget,
    onDragStart: (id) => setDraggingId(id),
    onDragEnd: () => {
      setDraggingId(null);
      setDropTarget(null);
    },
    setDropTarget,
    onDrop: (groupId, dropIndex) => {
      if (draggingId) {
        const source = findParentAndIndex(query, draggingId);
        const insertIndex =
          source && source.parentId === groupId && source.index < dropIndex
            ? dropIndex - 1
            : dropIndex;
        moveNode(draggingId, groupId, insertIndex);
        queueFocus((root) => {
          const moved = findNode(root, draggingId);
          return moved ? firstFocusableOf(moved) : null;
        });
      }
      setDraggingId(null);
      setDropTarget(null);
    },
  };
}
