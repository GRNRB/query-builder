import type { Theme } from "@mui/material";
import type { ComponentsVariants } from "@mui/material/styles";

const containedVariant: ComponentsVariants<Theme>["MuiButton"] = [
  {
    props: {
      variant: "contained",
      color: "primary",
    },
    style: ({ theme }) => ({
      backgroundColor: theme.palette.colors.gray[900],
      color: theme.palette.colors.white,
      ":hover": {
        backgroundColor: theme.palette.colors.gray[700],
      },
      ":active": {
        backgroundColor: theme.palette.colors.gray[600],
      },
    }),
  },
  {
    props: {
      variant: "contained",
      color: "secondary",
    },
    style: ({ theme }) => ({
      backgroundColor: theme.palette.colors.gray[500],
      color: theme.palette.colors.white,
      ":hover": {
        backgroundColor: theme.palette.colors.gray[600],
      },
      ":active": {
        backgroundColor: theme.palette.colors.gray[700],
      },
    }),
  },
  {
    props: {
      variant: "contained",
      color: "error",
    },
    style: ({ theme }) => ({
      backgroundColor: theme.palette.error.main,
      color: theme.palette.colors.white,
      ":hover": {
        backgroundColor: theme.palette.error.dark,
      },
      ":active": {
        backgroundColor: theme.palette.error.dark,
      },
    }),
  },
  {
    props: {
      variant: "contained",
      color: "success",
    },
    style: ({ theme }) => ({
      backgroundColor: theme.palette.success.main,
      color: theme.palette.colors.white,
      ":hover": {
        backgroundColor: theme.palette.success.main,
      },
      ":active": {
        backgroundColor: theme.palette.success.main,
      },
    }),
  },
  {
    props: {
      variant: "contained",
      color: "warning",
    },
    style: ({ theme }) => ({
      backgroundColor: theme.palette.warning.main,
      color: theme.palette.colors.white,
      ":hover": {
        backgroundColor: theme.palette.warning.dark,
      },
      ":active": {
        backgroundColor: theme.palette.warning.dark,
      },
    }),
  },
  {
    props: {
      variant: "contained",
      color: "caution",
    },
    style: ({ theme }) => ({
      backgroundColor: theme.palette.caution.light,
      color: theme.palette.colors.white,
      ":hover": {
        backgroundColor: theme.palette.caution.main,
      },
      ":active": {
        backgroundColor: theme.palette.caution.main,
      },
    }),
  },
  {
    props: {
      variant: "contained",
      color: "info",
    },
    style: ({ theme }) => ({
      backgroundColor: theme.palette.info.light,
      color: theme.palette.colors.white,
      ":hover": {
        backgroundColor: theme.palette.info.main,
      },
      ":active": {
        backgroundColor: theme.palette.info.main,
      },
    }),
  },
  {
    props: {
      variant: "contained",
      color: "discovery",
    },
    style: ({ theme }) => ({
      backgroundColor: theme.palette.discovery.light,
      color: theme.palette.colors.white,
      ":hover": {
        backgroundColor: theme.palette.discovery.main,
      },
      ":active": {
        backgroundColor: theme.palette.discovery.main,
      },
    }),
  },
];
export default containedVariant;
