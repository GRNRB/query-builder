import type { Components, Theme } from "@mui/material";

const dialog: Components<Theme>["MuiDialog"] = {
  styleOverrides: {
    paper: ({ theme }) => ({
      borderRadius: theme.spacing(1.5),
    }),
    root: ({ theme }) => ({
      ".MuiBackdrop-root": {
        backgroundColor: theme.palette.colors.alpha.alpha30,
      },
    }),
  },
};

export default dialog;
