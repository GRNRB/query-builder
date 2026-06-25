import "@mui/material";

declare module "@mui/material/OutlinedInput" {
  interface OutlinedInputProps {
    shape?: "rounded" | "square";
  }
}

declare module "@mui/material/InputBase" {
  interface InputBasePropsSizeOverrides {
    "3xs": true;
    "2xs": true;
    xs: true;
    sm: true;
    lg: true;
    xl: true;
    "2xl": true;
    "3xl": true;
  }
}
