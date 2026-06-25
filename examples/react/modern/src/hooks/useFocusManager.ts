import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { MutableRefObject } from "react";
import {
  flattenFocusables,
  firstFocusableOf,
  sameFocus,
  tokenKey,
} from "../lib/focus";
import type { Focus } from "../lib/focus";
import type { Node } from "../schema";

type Locator = (root: Node) => Focus | null;

/**
 * Owns the "where is the cursor" concern: a DOM registry of token elements,
 * the current focus (mirrored in a ref so event handlers read fresh values),
 * and a layout effect that imperatively `.focus()`es the active token after
 * every render — including the structural re-renders that follow a mutation.
 *
 * `suppressRef` is raised while a popover owns focus (command palette / value
 * editor) so the manager never steals focus back mid-edit.
 */
export function useFocusManager(
  query: Node,
  suppressRef: MutableRefObject<boolean>,
) {
  const registry = useRef(new Map<string, HTMLElement>());
  const [focus, setFocus] = useState<Focus | null>(() =>
    firstFocusableOf(query),
  );
  const focusRef = useRef<Focus | null>(focus);
  const pendingRef = useRef<Locator | null>(null);

  const focusToken = useCallback((f: Focus | null) => {
    focusRef.current = f;
    setFocus(f);
  }, []);

  const registerToken = useCallback((key: string, el: HTMLElement | null) => {
    if (el) registry.current.set(key, el);
    else registry.current.delete(key);
  }, []);

  /** Defer a focus decision until the node it targets exists in the next tree. */
  const queueFocus = useCallback((locator: Locator) => {
    pendingRef.current = locator;
  }, []);

  const flat = useMemo(() => flattenFocusables(query, true), [query]);

  /** Re-assert DOM focus on the active token — used to pull focus back into the
   * widget after it has wandered off (click on empty space / Tab onto the shell). */
  const restoreFocus = useCallback(() => {
    const target = focusRef.current ?? flat[0] ?? null;
    if (!target) return;
    const el = registry.current.get(tokenKey(target));
    if (el) el.focus();
    else focusToken(target);
  }, [flat, focusToken]);

  /** Move the cursor to the nearest token on the visual line above/below, using
   * element geometry so wrapped expressions navigate naturally. */
  const moveVertical = useCallback(
    (dir: "up" | "down") => {
      const cur = focusRef.current;
      if (!cur) return;
      const curEl = registry.current.get(tokenKey(cur));
      if (!curEl) return;
      const cr = curEl.getBoundingClientRect();
      const cx = cr.left + cr.width / 2;
      const cy = cr.top + cr.height / 2;

      let best: Focus | null = null;
      let bestScore = Infinity;
      for (const f of flat) {
        if (sameFocus(f, cur)) continue;
        const el = registry.current.get(tokenKey(f));
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const x = r.left + r.width / 2;
        const y = r.top + r.height / 2;
        const dy = y - cy;
        if (dir === "down" && dy <= 4) continue;
        if (dir === "up" && dy >= -4) continue;
        const score = Math.abs(dy) * 2 + Math.abs(x - cx);
        if (score < bestScore) {
          bestScore = score;
          best = f;
        }
      }
      if (best) focusToken(best);
    },
    [flat, focusToken],
  );

  useLayoutEffect(() => {
    if (suppressRef.current) return;

    if (pendingRef.current) {
      const next = pendingRef.current(query);
      pendingRef.current = null;
      if (next) {
        focusRef.current = next;
        setFocus(next);
      }
    }

    const target = focusRef.current;
    if (!target) return;

    let el = registry.current.get(tokenKey(target));
    if (!el) {
      // The targeted token no longer exists (e.g. the value chip after switching
      // to `is_set`). Keep keyboard focus inside the widget by snapping to the
      // nearest valid stop.
      const fallback = flat[0];
      if (fallback) {
        focusRef.current = fallback;
        setFocus(fallback);
        el = registry.current.get(tokenKey(fallback));
      }
    }
    el?.focus();
  }, [query, focus, flat, suppressRef]);

  return {
    focus,
    focusRef,
    focusToken,
    registerToken,
    queueFocus,
    restoreFocus,
    moveVertical,
    flat,
  };
}

export type FocusManager = ReturnType<typeof useFocusManager>;
