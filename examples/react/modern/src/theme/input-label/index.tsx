import type { Components, Theme } from "@mui/material";

const inputLabel: Components<Theme>["MuiInputLabel"] = {
  defaultProps: {
    shrink: true,
  },
  styleOverrides: {
    root: ({ theme }) => ({
      position: "static",
      transform: "none",
      marginBottom: theme.spacing(0.5),
      ...theme.typography.body2,
      color: theme.palette.text.secondary,
      "&.Mui-focused": {
        color: theme.palette.text.secondary,
      },
      "&.Mui-focused.Mui-error": {
        color: theme.palette.error.main,
      },
    }),
  },
};

export default inputLabel;
