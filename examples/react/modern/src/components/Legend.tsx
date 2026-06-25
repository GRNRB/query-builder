import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const SHORTCUTS: { keys: string; label: string }[] = [
  { keys: "[", label: "new group" },
  { keys: "⇧[", label: "group at end" },
  { keys: "c", label: "new condition" },
  { keys: "Enter", label: "edit / open field" },
  { keys: "type", label: "search field / op" },
  { keys: "Space", label: "edit value" },
  { keys: "t", label: "toggle AND / OR" },
  { keys: "]", label: "jump out of group" },
  { keys: "← →", label: "move cursor" },
  { keys: "↑ ↓", label: "move by line" },
  { keys: "⌥← →", label: "reorder" },
  { keys: "⌫", label: "delete" },
];

function Key({ children }: { children: React.ReactNode }) {
  return (
    <Box
      component="kbd"
      sx={{
        justifySelf: "start",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 11,
        fontWeight: 600,
        px: 0.75,
        py: 0.25,
        borderRadius: 1,
        background: (theme) => theme.palette.colors.alpha.alpha08,
        boxShadow: (theme) =>
          `0 0 0 1px ${theme.palette.colors.alpha.alpha12} inset`,
        color: "text.primary",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </Box>
  );
}

/** Keyboard cheat-sheet laid out as an aligned key / description grid. */
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
        <Box key={s.keys} sx={{ display: "contents" }}>
          <Key>{s.keys}</Key>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {s.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
