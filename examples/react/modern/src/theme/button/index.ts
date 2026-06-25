import type { Components, Theme } from "@mui/material";
import textVariant from "./text-variant";
import containedVariant from "./contained-variant";
import outlinedVariant from "./outlined-variant";
import softVariant from "./soft-variant";
const button: Components<Theme>["MuiButton"] = {
  styleOverrides: {
    root: ({ theme }) => ({
      textTransform: "none",
      borderRadius: "9999px",
      boxShadow: "none",
      transitionDuration: ".15s",
      transitionProperty:
        "opacity, background-color, transform, box-shadow, border-color",
      transitionTimingFunction: "ease",
      willChange: "transform",
      fontSize: theme.typography.body2.fontSize,
      ":hover": {
        boxShadow: "none",
      },
      ":active": {
        transform: "scale(0.96)",
        boxShadow: "none",
      },
    }),
  },
  variants: [
    {
      props: {
        size: "large",
      },
      style: ({ theme }) => ({
        height: theme.spacing(5),
      }),
    },
    {
      props: {
        size: "medium",
      },
      style: ({ theme }) => ({
        height: theme.spacing(4),
      }),
    },
    {
      props: {
        size: "small",
      },
      style: ({ theme }) => ({
        height: theme.spacing(3.5),
        fontSize: theme.typography.pxToRem(12),
      }),
    },
    {
      props: {
        shape: "square",
      },
      style: ({ theme }) => ({
        borderRadius: theme.spacing(1),
      }),
    },

    ...(textVariant ?? []),
    ...(containedVariant ?? []),
    ...(outlinedVariant ?? []),
    ...(softVariant ?? []),
  ],
};

export default button;
