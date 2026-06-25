import type { Theme } from "@mui/material";
import type { ComponentsVariants } from "@mui/material/styles";

const sizeVariants: ComponentsVariants<Theme>["MuiSwitch"] = [
  {
    props: { size: "small" },
    style: {
      width: 32,
      height: 17,
      "& .MuiSwitch-switchBase": {
        padding: 2,
        "&.Mui-checked": {
          transform: "translateX(15px)",
        },
      },
      "& .MuiSwitch-thumb": {
        width: 13,
        height: 13,
      },
      "& .MuiSwitch-track": {
        borderRadius: 17 / 2,
      },
    },
  },
  {
    props: { size: "medium" },
    style: {
      width: 40,
      height: 20,
      "& .MuiSwitch-switchBase": {
        padding: 2,
        "&.Mui-checked": {
          transform: "translateX(20px)",
        },
      },
      "& .MuiSwitch-thumb": {
        width: 16,
        height: 16,
      },
      "& .MuiSwitch-track": {
        borderRadius: 10,
      },
    },
  },
];

export default sizeVariants;
