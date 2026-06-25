import type { Components, Theme } from "@mui/material";

const menu: Components<Theme>["MuiMenu"] = {
  styleOverrides: {
    paper: ({ theme }) => ({
      boxShadow:
        "0 10px 15px -3px #0000001a, 0 4px 6px -4px #0000001a, 0 0 0 .5px #0000001a",
      borderRadius: theme.spacing(1.5),
    }),
    list: ({ theme }) => ({
      padding: theme.spacing(0.75),

      li: {
        padding: theme.spacing(0.75, 1),
        lineHeight: "unset",
        borderRadius: theme.spacing(0.75),
        "&.Mui-selected": {
          background: theme.palette.colors.alpha.alpha08,
          fontWeight: theme.typography.fontWeightBold,
          ":hover": {
            background: theme.palette.colors.gray[100],
          },
        },
        ":not(:last-child)": {
          marginBottom: theme.spacing(0.5),
        },
        ":hover": {
          background: theme.palette.colors.gray[100],
        },
        ".MuiListItemIcon-root": {
          minWidth: theme.spacing(2),
          fontSize: theme.spacing(2),
          marginRight: theme.spacing(0.5),
          color: "unset",
          ".MuiSvgIcon-root": {
            fontSize: "inherit",
          },
        },
      },
      ".MuiDivider-root": {
        position: "relative",
        right: theme.spacing(0.75),
        width: `calc(100% + ${theme.spacing(1.5)})`,
      },
      ".MuiButtonBase-root": {
        ...theme.typography.body2,
      },
      ".MuiListSubheader-root": {
        fontSize: theme.typography.pxToRem(11),
        textTransform: "uppercase",
        fontWeight: theme.typography.fontWeightBold,
      },
    }),
  },
};

export default menu;
