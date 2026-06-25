import type { Components, Theme } from "@mui/material";
import sizeVariants from "./size-variants";
import colorVariants from "./color-variants";

const switchComponent: Components<Theme>["MuiSwitch"] = {
  defaultProps: {
    disableRipple: true,
  },
  styleOverrides: {
    root: ({ theme }) => ({
      width: 32,
      height: 20,
      padding: 0,
      flexShrink: 0,
      display: "inline-flex",
      overflow: "visible",
      "& .MuiSwitch-switchBase": {
        padding: 2,
        top: 0,
        left: 0,
        transitionDuration: "200ms",
        transitionTimingFunction: "ease",
        "&.Mui-checked": {
          transform: "translateX(12px)",
          color: "#fff",
          "& + .MuiSwitch-track": {
            opacity: 1,
            border: 0,
          },
        },
        "&.Mui-disabled": {
          "& + .MuiSwitch-track": { opacity: 0.5 },
          "& .MuiSwitch-thumb": { opacity: 0.7 },
        },
      },
      "& .MuiSwitch-thumb": {
        boxSizing: "border-box",
        width: 16,
        height: 16,
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
      },
      "& .MuiSwitch-track": {
        width: "100%",
        height: "100%",
        borderRadius: 10,
        backgroundColor: theme.palette.colors.gray[300],
        opacity: 1,
        boxSizing: "border-box",
        transition: theme.transitions.create(["background-color"], {
          duration: 200,
        }),
      },
    }),
  },
  variants: [...(sizeVariants ?? []), ...(colorVariants ?? [])],
};

export default switchComponent;
