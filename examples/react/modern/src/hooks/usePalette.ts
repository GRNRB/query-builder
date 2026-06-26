import { useCallback, useState } from "react";

export type PalettePart = "field" | "operator" | "combinator";

export interface PaletteState {
  nodeId: string;
  part: PalettePart;
  anchorEl: HTMLElement;
  /** Character that opened the palette, pre-filling the search box. */
  seed: string;
}

/** Open/close state for the type-to-search field/operator picker. */
export function usePalette() {
  const [palette, setPalette] = useState<PaletteState | null>(null);

  const openPalette = useCallback(
    (nodeId: string, part: PalettePart, anchorEl: HTMLElement, seed: string) => {
      setPalette({ nodeId, part, anchorEl, seed });
    },
    [],
  );

  const closePalette = useCallback(() => setPalette(null), []);

  return { palette, openPalette, closePalette };
}
