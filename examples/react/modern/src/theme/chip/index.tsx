import type { Components, Theme } from "@mui/material";

// Size tokens — mirror the CSS [data-size=*] blocks for badge
const SIZE_TOKENS = {
  sm: {
    height: 20, // --badge-size-sm = --control-size-3xs (22) - 2px
    gutter: 5, // --badge-gutter-sm = --control-gutter-2xs (6) - 1px
    fontSize: 12, // --badge-font-size-sm = --font-text-xs
    fontWeight: 600, // semibold
    tracking: "0em", // tracking-wide
    radius: 4, // --badge-radius-sm = --radius-xs
    iconFontSize: 12,
  },
  md: {
    height: 22, // --badge-size-md = --control-size-3xs
    gutter: 6, // --badge-gutter-md = --control-gutter-2xs
    fontSize: 14, // --badge-font-size-md = --font-text-sm
    fontWeight: 600,
    tracking: "-0.01em", // tracking-normal
    radius: 4,
    iconFontSize: 16,
  },
  lg: {
    height: 24, // --badge-size-lg = --control-size-2xs
    gutter: 8, // --badge-gutter-lg = --control-gutter-xs
    fontSize: 14,
    fontWeight: 600,
    tracking: "-0.01em",
    radius: 6, // --badge-radius-lg = --radius-sm
    iconFontSize: 16,
  },
} as const;

// MUI built-in sizes alias to badge sizes
const SIZE_ALIAS: Record<string, keyof typeof SIZE_TOKENS> = {
  small: "sm",
  medium: "md",
};

const PILL_GUTTER_SCALING = 1.33;

// Per-color tokens. Keys match Chip's `color` prop (after augmentation).
const colorTokens = (theme: Theme) => ({
  default: {
    softBg: theme.palette.colors.alpha.alpha08,
    softText: theme.palette.text.primary,
    solidBg: theme.palette.colors.gray[750],
    solidText: theme.palette.colors.white,
    outlineBorder: theme.palette.colors.alpha.alpha20,
    outlineText: theme.palette.text.primary,
  },
  primary: {
    softBg: theme.palette.colors.alpha.alpha08,
    softText: theme.palette.colors.gray[1000],
    solidBg: theme.palette.colors.gray[900],
    solidText: theme.palette.colors.white,
    outlineBorder: theme.palette.colors.alpha.alpha20,
    outlineText: theme.palette.colors.gray[1000],
  },
  secondary: {
    softBg: theme.palette.colors.alpha.alpha08,
    softText: theme.palette.text.primary,
    solidBg: theme.palette.colors.gray[750],
    solidText: theme.palette.colors.white,
    outlineBorder: theme.palette.colors.alpha.alpha20,
    outlineText: theme.palette.text.primary,
  },
  success: {
    softBg: theme.palette.colors.green.a50,
    softText: theme.palette.colors.green[700],
    solidBg: theme.palette.colors.green[500],
    solidText: theme.palette.colors.white,
    outlineBorder: theme.palette.colors.green[500],
    outlineText: theme.palette.colors.green[500],
  },
  warning: {
    softBg: theme.palette.colors.orange.a50,
    softText: theme.palette.colors.orange[700],
    solidBg: theme.palette.colors.orange[500],
    solidText: theme.palette.colors.white,
    outlineBorder: theme.palette.colors.orange[500],
    outlineText: theme.palette.colors.orange[500],
  },
  // CSS uses `danger`; MUI's stock equivalent is `error`. Both work via augmentation.
  error: {
    softBg: theme.palette.colors.red.a50,
    softText: theme.palette.colors.red[700],
    solidBg: theme.palette.colors.red[500],
    solidText: theme.palette.colors.white,
    outlineBorder: theme.palette.colors.red[500],
    outlineText: theme.palette.colors.red[500],
  },
  danger: {
    softBg: theme.palette.colors.red.a50,
    softText: theme.palette.colors.red[700],
    solidBg: theme.palette.colors.red[500],
    solidText: theme.palette.colors.white,
    outlineBorder: theme.palette.colors.red[500],
    outlineText: theme.palette.colors.red[500],
  },
  info: {
    softBg: theme.palette.colors.blue.a50,
    softText: theme.palette.colors.blue[600],
    solidBg: theme.palette.colors.blue[400],
    solidText: theme.palette.colors.white,
    outlineBorder: theme.palette.colors.blue[500],
    outlineText: theme.palette.colors.blue[500],
  },
  caution: {
    softBg: theme.palette.colors.yellow.a50,
    softText: theme.palette.colors.yellow[800],
    solidBg: theme.palette.colors.yellow[600],
    solidText: theme.palette.colors.white,
    outlineBorder: theme.palette.colors.yellow[700],
    outlineText: theme.palette.colors.yellow[700],
  },
  discovery: {
    softBg: theme.palette.colors.purple.a50,
    softText: theme.palette.colors.purple[700],
    solidBg: theme.palette.colors.purple[400],
    solidText: theme.palette.colors.white,
    outlineBorder: theme.palette.colors.purple[500],
    outlineText: theme.palette.colors.purple[500],
  },
});

const chip: Components<Theme>["MuiChip"] = {
  styleOverrides: {
    root: ({ theme, ownerState }) => {
      const sizeKey =
        SIZE_ALIAS[(ownerState.size ?? "medium") as string] ??
        ((ownerState.size as keyof typeof SIZE_TOKENS) || "md");
      const tokens = SIZE_TOKENS[sizeKey] ?? SIZE_TOKENS.md;

      const isPill = ownerState.shape === "rounded";
      const radius = isPill ? 9999 : tokens.radius;
      const horizontalPadding = isPill
        ? tokens.gutter * PILL_GUTTER_SCALING
        : tokens.gutter;

      const colors = colorTokens(theme);
      const colorKey = (ownerState.color ?? "default") as keyof ReturnType<
        typeof colorTokens
      >;
      const palette = colors[colorKey] || colors.default;

      // Variant: "soft" custom, "solid" custom, MUI's "outlined" stays outline,
      // MUI's "filled" maps to solid
      const variant = ownerState.variant;
      const isSoft = variant === "soft";
      const isOutline = variant === "outlined";
      const isSolid = variant === "solid" || variant === "filled";

      let background: string | undefined = "transparent";
      let textColor: string | undefined = palette.softText;
      let boxShadow: string | undefined;

      if (isSoft) {
        background = palette.softBg;
        textColor = palette.softText;
      } else if (isSolid) {
        background = palette.solidBg;
        textColor = palette.solidText;
      } else if (isOutline) {
        background = "transparent";
        textColor = palette.outlineText;
        boxShadow = `0 0 0 1px ${palette.outlineBorder} inset`;
      }

      return {
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        height: tokens.height,
        padding: `0 ${horizontalPadding}px`,
        borderRadius: radius,
        fontSize: tokens.fontSize,
        fontWeight: tokens.fontWeight,
        letterSpacing: tokens.tracking,
        whiteSpace: "nowrap",
        backgroundColor: background,
        color: textColor,
        border: "none",
        ...(boxShadow ? { boxShadow } : {}),

        // Icons (start/end). MUI's slots: .MuiChip-icon (start), .MuiChip-deleteIcon (end)
        "& .MuiChip-icon, & .MuiChip-deleteIcon": {
          fontSize: tokens.iconFontSize,
          color: "inherit",
          margin: 0,
        },
        "& .MuiChip-icon": {
          marginLeft: -1, // mirrors --badge-icon-offset
        },
        "& .MuiChip-deleteIcon": {
          marginRight: -1,
          "&:hover": {
            color: "inherit",
            opacity: 0.7,
          },
        },
      };
    },

    label: {
      padding: 0,
      overflow: "visible",
    },
  },
};

export default chip;
