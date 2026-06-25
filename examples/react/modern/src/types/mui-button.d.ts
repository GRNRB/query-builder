import "@mui/material";

declare module "@mui/material/Button" {
  interface ButtonOwnProps {
    shape?: "rounded" | "square";
  }

  interface ButtonPropsColorOverrides {
    caution: true;
    discovery: true;
  }
  interface ButtonPropsVariantOverrides {
    soft: true;
  }
}
