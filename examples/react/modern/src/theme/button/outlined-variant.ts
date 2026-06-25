import type { Theme } from "@mui/material";
import type { ComponentsVariants } from "@mui/material/styles";

const outlinedVariant: ComponentsVariants<Theme>["MuiButton"] = [
  {
    props: {
      variant: "outlined",
      color: "primary",
    },
    style: ({ theme }) => ({
      borderColor: theme.palette.colors.alpha.alpha16,
      color: theme.palette.colors.gray[1000],
      ":hover": {
        backgroundColor: theme.palette.colors.alpha.alpha02,
        borderColor: theme.palette.colors.alpha.alpha20,
        color: theme.palette.colors.gray[1000],
      },
      ":active": {
        backgroundColor: theme.palette.colors.alpha.alpha04,
        borderColor: theme.palette.colors.alpha.alpha20,
        color: theme.palette.colors.gray[1000],
      },
    }),
  },
  {
    props: {
      variant: "outlined",
      color: "secondary",
    },
    style: ({ theme }) => ({
      borderColor: theme.palette.colors.alpha.alpha16,
      color: theme.palette.text.secondary,
      ":hover": {
        backgroundColor: theme.palette.colors.alpha.alpha02,
        borderColor: theme.palette.colors.alpha.alpha20,
        color: theme.palette.text.primary,
      },
      ":active": {
        backgroundColor: theme.palette.colors.alpha.alpha04,
        borderColor: theme.palette.colors.alpha.alpha20,
        color: theme.palette.text.primary,
      },
    }),
  },
  {
    props: {
      variant: "outlined",
      color: "error",
    },
    style: ({ theme }) => ({
      borderColor: theme.palette.error.main,
      color: theme.palette.error.main,
      ":hover": {
        backgroundColor: theme.palette.colors.red.a25,
        borderColor: theme.palette.error.main,
        color: theme.palette.error.main,
      },
      ":active": {
        backgroundColor: theme.palette.colors.red.a25,
        borderColor: theme.palette.error.main,
      },
    }),
  },
  {
    props: {
      variant: "outlined",
      color: "success",
    },
    style: ({ theme }) => ({
      borderColor: theme.palette.success.main,
      color: theme.palette.success.main,
      ":hover": {
        backgroundColor: theme.palette.colors.green.a25,
        borderColor: theme.palette.success.main,
        color: theme.palette.success.main,
      },
      ":active": {
        backgroundColor: theme.palette.colors.green.a25,
        borderColor: theme.palette.success.main,
        color: theme.palette.success.main,
      },
    }),
  },
  {
    props: {
      variant: "outlined",
      color: "warning",
    },
    style: ({ theme }) => ({
      borderColor: theme.palette.warning.main,
      color: theme.palette.warning.main,
      ":hover": {
        backgroundColor: theme.palette.colors.orange.a25,
        borderColor: theme.palette.warning.main,
        color: theme.palette.warning.main,
      },
      ":active": {
        backgroundColor: theme.palette.colors.orange.a25,
        borderColor: theme.palette.warning.main,
      },
    }),
  },
  {
    props: {
      variant: "outlined",
      color: "info",
    },
    style: ({ theme }) => ({
      borderColor: theme.palette.info.main,
      color: theme.palette.info.main,
      ":hover": {
        backgroundColor: theme.palette.colors.blue.a25,
        borderColor: theme.palette.info.main,
        color: theme.palette.info.main,
      },
      ":active": {
        backgroundColor: theme.palette.colors.blue.a25,
        borderColor: theme.palette.info.main,
      },
    }),
  },
  {
    props: {
      variant: "outlined",
      color: "caution",
    },
    style: ({ theme }) => ({
      borderColor: theme.palette.caution.main,
      color: theme.palette.caution.main,
      ":hover": {
        backgroundColor: theme.palette.colors.yellow.a25,
        borderColor: theme.palette.caution.main,
        color: theme.palette.caution.main,
      },
      ":active": {
        backgroundColor: theme.palette.colors.yellow.a25,
        borderColor: theme.palette.caution.main,
      },
    }),
  },
  {
    props: {
      variant: "outlined",
      color: "discovery",
    },
    style: ({ theme }) => ({
      borderColor: theme.palette.discovery.main,
      color: theme.palette.discovery.main,
      ":hover": {
        backgroundColor: theme.palette.colors.purple.a25,
        borderColor: theme.palette.discovery.main,
        color: theme.palette.discovery.main,
      },
      ":active": {
        backgroundColor: theme.palette.colors.purple.a25,
        borderColor: theme.palette.discovery.main,
      },
    }),
  },
];
export default outlinedVariant;
