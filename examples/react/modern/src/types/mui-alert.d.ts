import "@mui/material";

declare module "@mui/material/Alert" {
  interface AlertPropsVariantOverrides {
    soft: true;
    solid: true;
    outline: true;
  }

  interface AlertPropsColorOverrides {
    primary: true;
    caution: true;
    discovery: true;
    danger: true;
  }

  interface AlertOwnProps {
    actionsPlacement?: "side" | "bottom";
  }
}
