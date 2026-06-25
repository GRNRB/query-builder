import type { Components, Theme } from "@mui/material";

const tableCell: Components<Theme>["MuiTableCell"] = {
  styleOverrides: {
    head: ({ theme }) => ({
      fontWeight: 600,
      lineHeight: theme.spacing(2),
      fontSize: theme.spacing(1.5),
      textTransform: "uppercase",
    }),
  },
};

export default tableCell;
