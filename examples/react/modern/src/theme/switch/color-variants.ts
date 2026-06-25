import type { Theme } from "@mui/material";
import type { ComponentsVariants } from "@mui/material/styles";

const colorVariants: ComponentsVariants<Theme>["MuiSwitch"] = [
  {
    props: { color: "primary" },
    style: ({ theme }) => ({
      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
        backgroundColor: theme.palette.colors.gray[1000],
      },
    }),
  },
  {
    props: { color: "secondary" },
    style: ({ theme }) => ({
      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
        backgroundColor: theme.palette.text.secondary,
      },
    }),
  },
  {
    props: { color: "error" },
    style: ({ theme }) => ({
      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
        backgroundColor: theme.palette.error.main,
      },
    }),
  },
  {
    props: { color: "success" },
    style: ({ theme }) => ({
      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
        backgroundColor: theme.palette.success.main,
      },
    }),
  },
  {
    props: { color: "warning" },
    style: ({ theme }) => ({
      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
        backgroundColor: theme.palette.warning.main,
      },
    }),
  },
  {
    props: { color: "info" },
    style: ({ theme }) => ({
      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
        backgroundColor: theme.palette.info.main,
      },
    }),
  },
];

export default colorVariants;
