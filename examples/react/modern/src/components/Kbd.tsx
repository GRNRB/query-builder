import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

/** Merge a base sx object with optional caller overrides (object or array). */
const merge = (base: SxProps<Theme>, sx?: SxProps<Theme>): SxProps<Theme> =>
  [base, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])];

/**
 * A single keycap, an MUI port of shadcn/ui's `<Kbd>`. Renders a `<kbd>` so it
 * stays semantic for assistive tech.
 */
export function Kbd({
  children,
  sx,
}: {
  children: ReactNode;
  sx?: SxProps<Theme>;
}) {
  return (
    <Box
      component="kbd"
      sx={merge(
        {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 18,
          height: 18,
          px: 0.5,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 11,
          fontWeight: 600,
          lineHeight: 1,
          borderRadius: 0.75,
          background: (theme) => theme.palette.colors.alpha.alpha08,
          boxShadow: (theme) =>
            `0 0 0 1px ${theme.palette.colors.alpha.alpha12} inset`,
          color: "text.primary",
          whiteSpace: "nowrap",
        },
        sx,
      )}
    >
      {children}
    </Box>
  );
}

/**
 * Groups related keycaps so a chord (e.g. `Ctrl` `Shift` `Z`) reads as one
 * shortcut. An MUI port of shadcn/ui's `<KbdGroup>`.
 */
export function KbdGroup({
  children,
  sx,
}: {
  children: ReactNode;
  sx?: SxProps<Theme>;
}) {
  return (
    <Box
      sx={merge(
        { display: "inline-flex", alignItems: "center", gap: 0.5 },
        sx,
      )}
    >
      {children}
    </Box>
  );
}
