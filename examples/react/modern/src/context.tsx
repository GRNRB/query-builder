import { createContext, useCallback, useContext } from "react";
import { sameFocus, tokenKey } from "./lib/focus";
import type { Focus } from "./lib/focus";
import type { PalettePart } from "./hooks/usePalette";
import type { Node } from "./schema";

/** Everything the token components reach for, threaded through the recursive tree. */
export interface BuilderContextValue {
  query: Node;
  focus: Focus | null;
  registerToken: (key: string, el: HTMLElement | null) => void;
  focusToken: (f: Focus) => void;

  openPalette: (
    nodeId: string,
    part: PalettePart,
    anchorEl: HTMLElement,
    seed: string,
  ) => void;

  beginValueEdit: (nodeId: string, seed: string) => void;
  editingValueId: string | null;
  editSeed: string;
  commitValue: (nodeId: string, value: string) => void;
  cancelValueEdit: () => void;

  removeNode: (nodeId: string) => void;
  addCondition: (groupId: string) => void;
}

const BuilderContext = createContext<BuilderContextValue | null>(null);

export const BuilderProvider = BuilderContext.Provider;

export function useBuilder(): BuilderContextValue {
  const ctx = useContext(BuilderContext);
  if (!ctx) throw new Error("useBuilder must be used within <BuilderProvider>");
  return ctx;
}

/**
 * Wires a single token (a chip, bracket, or combinator) into the roving-tabindex
 * focus model: registers its DOM element, reports whether it is the active stop,
 * and exposes a `focusSelf` for click-to-focus.
 */
export function useToken(focus: Focus, register = true) {
  const builder = useBuilder();
  const isFocused = sameFocus(builder.focus, focus);

  const ref = useCallback(
    (el: HTMLElement | null) => {
      if (register) builder.registerToken(tokenKey(focus), el);
    },
    [register, builder, focus],
  );

  return {
    ref,
    isFocused,
    tabIndex: isFocused ? 0 : -1,
    focusSelf: () => builder.focusToken(focus),
  };
}
