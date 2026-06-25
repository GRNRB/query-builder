import type { Components, Theme } from "@mui/material";

export const dialogContent: Components<Theme>["MuiDialogContent"] = {
  styleOverrides: {
    root: ({ theme }) => ({
      padding: theme.spacing(2, 2.5),
    }),
  },
};

export default dialogContent;
