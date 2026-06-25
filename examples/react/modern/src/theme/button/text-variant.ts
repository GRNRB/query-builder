import type { Theme } from "@mui/material";
import type { ComponentsVariants } from "@mui/material/styles";

const textVariant: ComponentsVariants<Theme>["MuiButton"] = [
  {
    props: { variant: "text", color: "primary" },
    style: ({ theme }) => ({
      color: theme.palette.colors.gray[1000],
      ":hover": {
        backgroundColor: theme.palette.colors.alpha.alpha08,
        color: theme.palette.colors.gray[1000],
      },
      ":active": {
        backgroundColor: theme.palette.colors.alpha.alpha12,
      },
    }),
  },
  {
    props: { variant: "text", color: "secondary" },
    style: ({ theme }) => ({
      color: theme.palette.text.secondary,
      ":hover": {
        backgroundColor: theme.palette.colors.alpha.alpha08,
        color: theme.palette.text.primary,
      },
      ":active": {
        backgroundColor: theme.palette.colors.alpha.alpha12,
      },
    }),
  },
  {
    props: { variant: "text", color: "error" },
    style: ({ theme }) => ({
      color: theme.palette.error.main,
      ":hover": {
        backgroundColor: theme.palette.colors.red.a50,
        color: theme.palette.error.main,
      },
      ":active": {
        backgroundColor: theme.palette.colors.red.a50,
      },
    }),
  },
  {
    props: { variant: "text", color: "success" },
    style: ({ theme }) => ({
      color: theme.palette.success.main,
      ":hover": {
        backgroundColor: theme.palette.colors.green.a50,
        color: theme.palette.success.main,
      },
      ":active": {
        backgroundColor: theme.palette.colors.green.a50,
      },
    }),
  },
  {
    props: { variant: "text", color: "warning" },
    style: ({ theme }) => ({
      color: theme.palette.warning.main,
      ":hover": {
        backgroundColor: theme.palette.colors.orange.a50,
        color: theme.palette.warning.main,
      },
      ":active": {
        backgroundColor: theme.palette.colors.orange.a50,
      },
    }),
  },
  {
    props: { variant: "text", color: "caution" },
    style: ({ theme }) => ({
      color: theme.palette.caution.main,
      ":hover": {
        backgroundColor: theme.palette.colors.yellow.a50,
        color: theme.palette.caution.main,
      },
      ":active": {
        backgroundColor: theme.palette.colors.yellow.a50,
      },
    }),
  },
  {
    props: { variant: "text", color: "info" },
    style: ({ theme }) => ({
      color: theme.palette.info.main,
      ":hover": {
        backgroundColor: theme.palette.colors.blue.a50,
        color: theme.palette.info.main,
      },
      ":active": {
        backgroundColor: theme.palette.colors.blue.a50,
      },
    }),
  },
  {
    props: { variant: "text", color: "discovery" },
    style: ({ theme }) => ({
      color: theme.palette.discovery.main,
      ":hover": {
        backgroundColor: theme.palette.colors.purple.a50,
        color: theme.palette.discovery.main,
      },
      ":active": {
        backgroundColor: theme.palette.colors.purple.a50,
      },
    }),
  },
];
export default textVariant;
