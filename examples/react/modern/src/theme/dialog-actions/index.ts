import type { Components, Theme } from "@mui/material";

export const dialogActions: Components<Theme>["MuiDialogActions"] = {
  styleOverrides: {
    root: ({ theme }) => ({
      padding: theme.spacing(2, 2.5),
    }),
  },
};

export default dialogActions;
