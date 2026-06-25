import type { Components, Theme } from "@mui/material";

// Size token table — mirrors the CSS [data-size=*] blocks.
// All values come from the CSS `--control-*` scale.
const SIZE_TOKENS = {
  "3xs": {
    height: 22, // --control-size-3xs: 1.375rem
    fontSize: 12, // --control-font-size-sm: --font-text-xs (0.75rem)
    radius: 4, // --control-radius-sm
    gutter: 8, // --control-gutter-xs
    gap: 4, // --input-gap-xs
    adornmentOffset: -1,
  },
  "2xs": {
    height: 24,
    fontSize: 12,
    radius: 4,
    gutter: 8,
    gap: 4,
    adornmentOffset: -1,
  },
  xs: {
    height: 26,
    fontSize: 14,
    radius: 4,
    gutter: 8,
    gap: 6,
    adornmentOffset: -1,
  },
  sm: {
    height: 28,
    fontSize: 14,
    radius: 6,
    gutter: 10,
    gap: 8,
    adornmentOffset: -1,
  },
  // MUI's built-in "small" maps here
  small: {
    height: 28,
    fontSize: 14,
    radius: 6,
    gutter: 10,
    gap: 8,
    adornmentOffset: -1,
  },
  md: {
    height: 32,
    fontSize: 14,
    radius: 6,
    gutter: 12,
    gap: 8,
    adornmentOffset: -2,
  },
  // MUI's built-in "medium" maps here
  medium: {
    height: 32,
    fontSize: 14,
    radius: 6,
    gutter: 12,
    gap: 8,
    adornmentOffset: -2,
  },
  lg: {
    height: 36,
    fontSize: 14,
    radius: 6,
    gutter: 14,
    gap: 8,
    adornmentOffset: -2,
  },
  xl: {
    height: 40,
    fontSize: 16,
    radius: 8,
    gutter: 16,
    gap: 10,
    adornmentOffset: -2,
  },
  "2xl": {
    height: 44,
    fontSize: 16,
    radius: 12,
    gutter: 16,
    gap: 10,
    adornmentOffset: -4,
  },
  "3xl": {
    height: 48,
    fontSize: 16,
    radius: 12,
    gutter: 16,
    gap: 10,
    adornmentOffset: -4,
  },
} as const;

const PILL_GUTTER_SCALING = 1.33; // --control-gutter-pill-scaling

const outlinedInput: Components<Theme>["MuiOutlinedInput"] = {
  styleOverrides: {
    root: ({ theme, ownerState }) => {
      const sizeKey = (ownerState.size ?? "medium") as keyof typeof SIZE_TOKENS;
      const tokens = SIZE_TOKENS[sizeKey] ?? SIZE_TOKENS.medium;

      const isPill = ownerState.shape === "rounded";
      const radius = isPill ? 9999 : tokens.radius;

      // Outline colors — equivalent of --input-outline-border-color* in the CSS
      const borderColor = theme.palette.colors.alpha.alpha12;
      const borderColorFocus = theme.palette.colors.alpha.alpha50;
      const borderColorInvalid = theme.palette.error.main;

      const startPadding =
        ownerState.startAdornment && isPill
          ? tokens.gutter * PILL_GUTTER_SCALING
          : tokens.gutter;
      const endPadding =
        ownerState.endAdornment && isPill
          ? tokens.gutter * PILL_GUTTER_SCALING
          : tokens.gutter;

      // Vertical padding for multiline — derived so a single row matches
      // the non-multiline height. Roughly (height - line-height) / 2.
      const lineHeight = Math.round(tokens.fontSize * 1.5);
      const verticalPadding = Math.max(
        0,
        Math.round((tokens.height - lineHeight) / 2),
      );

      return {
        display: "inline-flex",
        alignItems: ownerState.multiline ? "flex-start" : "center",
        position: "relative",
        width: "100%",
        ...(ownerState.multiline
          ? {
              height: "auto",
              minHeight: tokens.height,
              paddingTop: verticalPadding,
              paddingBottom: verticalPadding,
            }
          : { height: tokens.height }),
        fontSize: tokens.fontSize,
        borderRadius: radius,
        gap: tokens.gap,
        paddingLeft: startPadding,
        paddingRight: endPadding,
        color: theme.palette.text.primary,
        backgroundColor: "transparent",
        boxShadow: `0 0 0 1px ${borderColor} inset`,
        transition: "box-shadow .15s ease",
        cursor: "text",

        // Kill MUI's notched outline — we render the border via boxShadow
        "& .MuiOutlinedInput-notchedOutline": {
          border: "none",
        },

        // Focus (outline variant)
        "&.Mui-focused:not(.Mui-disabled)": {
          boxShadow: `0 0 0 1px ${borderColorFocus} inset`,
          "& .MuiOutlinedInput-notchedOutline": { border: "none" },
        },

        // Invalid / error
        "&.Mui-error:not(.Mui-disabled)": {
          boxShadow: `0 0 0 1px ${borderColorInvalid} inset`,
          "& .MuiOutlinedInput-notchedOutline": { border: "none" },
          "& ::selection": {
            backgroundColor: theme.palette.colors.red.a50,
          },
          "& ::-moz-selection": {
            backgroundColor: theme.palette.colors.red.a50,
          },
        },

        // Disabled
        "&.Mui-disabled": {
          cursor: "not-allowed",
          opacity: 0.5,
        },

        // Adornment offset — mirrors `> :first-child:not(input)` / `:last-child:not(input)`
        "& > :first-of-type:not(input):not(textarea)": {
          marginLeft: tokens.adornmentOffset,
        },
        "& > :last-of-type:not(input):not(textarea)": {
          marginRight: tokens.adornmentOffset,
        },

        // Placeholder
        "& input::placeholder, & textarea::placeholder": {
          color: theme.palette.text.secondary,
          opacity: 1,
        },
      };
    },

    input: ({ ownerState }) => ({
      padding: 0,
      ...(ownerState.multiline ? { height: "auto" } : { height: "100%" }),
      fontSize: "inherit",
      lineHeight: 1.5,
      color: "inherit",
      background: "transparent",
      resize: "none",
      "&::placeholder": {
        opacity: 1,
      },
    }),

    notchedOutline: {
      border: "none",
    },
  },
};

export default outlinedInput;
