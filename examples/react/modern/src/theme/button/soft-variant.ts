import type { Theme } from "@mui/material";
import type { ComponentsVariants } from "@mui/material/styles";

const textVariant: ComponentsVariants<Theme>["MuiButton"] = [
  {
    props: { variant: "soft", color: "primary" },
    style: ({ theme }) => ({
      color: theme.palette.colors.gray[1000],
      backgroundColor: theme.palette.colors.alpha.alpha08,

      ":hover": {
        backgroundColor: theme.palette.colors.alpha.alpha08,
        color: theme.palette.colors.gray[1000],
      },
      ":active": {
        backgroundColor: theme.palette.colors.alpha.alpha16,
      },
    }),
  },
  {
    props: { variant: "soft", color: "secondary" },
    style: ({ theme }) => ({
      color: theme.palette.colors.gray[1000],
      backgroundColor: theme.palette.colors.alpha.alpha08,

      ":hover": {
        backgroundColor: theme.palette.colors.alpha.alpha12,
        color: theme.palette.colors.gray[1000],
      },
      ":active": {
        backgroundColor: theme.palette.colors.alpha.alpha16,
      },
    }),
  },
  {
    props: { variant: "soft", color: "error" },
    style: ({ theme }) => ({
      color: theme.palette.error.main,
      backgroundColor: theme.palette.colors.red.a50,
      ":hover": {
        backgroundColor: theme.palette.colors.red.a75,
        color: theme.palette.error.main,
      },
      ":active": {
        backgroundColor: theme.palette.colors.red.a75,
      },
    }),
  },
  {
    props: { variant: "soft", color: "success" },
    style: ({ theme }) => ({
      color: theme.palette.success.main,
      backgroundColor: theme.palette.colors.green.a50,
      ":hover": {
        backgroundColor: theme.palette.colors.green.a75,
        color: theme.palette.success.main,
      },
      ":active": {
        backgroundColor: theme.palette.colors.green.a75,
      },
    }),
  },
  {
    props: { variant: "soft", color: "warning" },
    style: ({ theme }) => ({
      color: theme.palette.warning.main,
      backgroundColor: theme.palette.colors.orange.a50,
      ":hover": {
        backgroundColor: theme.palette.colors.orange.a75,
        color: theme.palette.warning.main,
      },
      ":active": {
        backgroundColor: theme.palette.colors.orange.a75,
      },
    }),
  },
  {
    props: { variant: "soft", color: "caution" },
    style: ({ theme }) => ({
      color: theme.palette.caution.main,
      backgroundColor: theme.palette.colors.yellow.a50,
      ":hover": {
        backgroundColor: theme.palette.colors.yellow.a75,
        color: theme.palette.caution.main,
      },
      ":active": {
        backgroundColor: theme.palette.colors.yellow.a75,
      },
    }),
  },
  {
    props: { variant: "soft", color: "info" },
    style: ({ theme }) => ({
      color: theme.palette.info.main,
      backgroundColor: theme.palette.colors.blue.a50,
      ":hover": {
        backgroundColor: theme.palette.colors.blue.a75,
        color: theme.palette.info.main,
      },
      ":active": {
        backgroundColor: theme.palette.colors.blue.a75,
      },
    }),
  },
  {
    props: { variant: "soft", color: "discovery" },
    style: ({ theme }) => ({
      color: theme.palette.discovery.main,
      backgroundColor: theme.palette.colors.purple.a50,
      ":hover": {
        backgroundColor: theme.palette.colors.purple.a75,
        color: theme.palette.discovery.main,
      },
      ":active": {
        backgroundColor: theme.palette.colors.purple.a75,
      },
    }),
  },
];
export default textVariant;
