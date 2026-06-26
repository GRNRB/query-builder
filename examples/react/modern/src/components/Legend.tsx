import { Fragment } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Kbd, KbdGroup } from "./Kbd";

/** True on macOS / iOS, where modifiers are drawn as glyphs (⌘ ⌥ ⇧ ⌫). */
const isMac = (() => {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & {
    userAgentData?: { platform?: string };
  };
  const platform =
    nav.userAgentData?.platform || nav.platform || nav.userAgent || "";
  return /mac|iphone|ipad|ipod/i.test(platform);
})();

// Platform-specific modifier captions: glyphs on macOS, words on Windows/Linux.
const MOD = isMac ? "⌘" : "Ctrl";
const ALT = isMac ? "⌥" : "Alt";
const SHIFT = isMac ? "⇧" : "Shift";
const DEL = isMac ? "⌫" : "Back";

/** Each shortcut is a list of keycaps shown as a single chord. */
const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ["G"], label: "new group" },
  { keys: ["C"], label: "new condition" },
  { keys: ["Enter"], label: "edit / open field" },
  { keys: ["A–Z"], label: "search field / op" },
  { keys: ["Space"], label: "edit value" },
  { keys: ["]"], label: "jump out of group" },
  { keys: ["←", "↑", "↓", "→"], label: "move cursor" },
  { keys: [ALT, "←", "→"], label: "reorder" },
  { keys: [DEL], label: "delete" },
  { keys: [MOD, "Z"], label: "undo" },
  { keys: [MOD, SHIFT, "Z"], label: "redo" },
];

/** Keyboard cheat-sheet laid out as an aligned chord / description grid. */
export function Legend() {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "max-content 1fr",
          sm: "max-content 1fr max-content 1fr",
        },
        columnGap: 1.5,
        rowGap: 1,
        alignItems: "center",
        mb: 2,
        p: 1.5,
        borderRadius: 2,
        background: (theme) => theme.palette.colors.alpha.alpha04,
      }}
    >
      {SHORTCUTS.map((s) => (
        <Fragment key={s.label}>
          <KbdGroup sx={{ justifySelf: "start" }}>
            {s.keys.map((k, i) => (
              <Kbd key={i}>{k}</Kbd>
            ))}
          </KbdGroup>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {s.label}
          </Typography>
        </Fragment>
      ))}
    </Box>
  );
}
