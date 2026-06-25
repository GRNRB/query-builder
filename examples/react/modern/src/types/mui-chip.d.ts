import "@mui/material";

declare module "@mui/material/Chip" {
  interface ChipPropsVariantOverrides {
    soft: true;
    solid: true;
  }

  interface ChipPropsSizeOverrides {
    sm: true;
    md: true;
    lg: true;
  }

  interface ChipPropsColorOverrides {
    caution: true;
    discovery: true;
    danger: true;
  }

  interface ChipOwnProps {
    shape?: "rounded" | "square";
  }
}
