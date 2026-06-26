import { useCallback, useState } from "react";
import {
  defaultGenerateId,
  normalizeTree,
  useQueryBuilder,
} from "@grnrb/react-query-builder";
import type { QueryNode, QueryNodeInput } from "@grnrb/react-query-builder";
import { schema } from "../schema";
import type { S } from "../schema";

interface History {
  past: QueryNode<S>[];
  present: QueryNode<S>;
  future: QueryNode<S>[];
}

/**
 * Wraps `useQueryBuilder` in controlled mode with an undo/redo history stack.
 * Every mutation flows through `onChange`, which pushes the prior tree onto
 * `past`; undo/redo shuttle whole-tree snapshots between the three stacks.
 */
export function useUndoableQuery(initial: QueryNodeInput<S>) {
  const [history, setHistory] = useState<History>(() => ({
    past: [],
    present: normalizeTree(initial, defaultGenerateId),
    future: [],
  }));

  const onChange = useCallback((next: QueryNode<S>) => {
    setHistory((h) =>
      next === h.present
        ? h
        : { past: [...h.past, h.present], present: next, future: [] },
    );
  }, []);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.past.length === 0) return h;
      const present = h.past[h.past.length - 1];
      return {
        past: h.past.slice(0, -1),
        present,
        future: [h.present, ...h.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((h) => {
      if (h.future.length === 0) return h;
      const [present, ...future] = h.future;
      return { past: [...h.past, h.present], present, future };
    });
  }, []);

  const qb = useQueryBuilder(schema, { query: history.present, onChange });

  return {
    qb,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
}
