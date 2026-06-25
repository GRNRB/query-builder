import "@mui/material/styles";

declare module "@mui/material/styles" {
  interface AppColor {
    25?: string;
    50?: string;
    75?: string;
    100?: string;
    150?: string;
    200?: string;
    250?: string;
    300?: string;
    350?: string;
    400?: string;
    450?: string;
    500?: string;
    550?: string;
    600?: string;
    650?: string;
    700?: string;
    750?: string;
    800?: string;
    850?: string;
    900?: string;
    925?: string;
    950?: string;
    975?: string;
    1000?: string;
    A100?: string;
    A200?: string;
    A400?: string;
    A700?: string;
    a25?: string;
    a50?: string;
    a75?: string;
    a100?: string;
    a200?: string;
    a300?: string;
  }

  interface Palette {
    colors: {
      gray: AppColor;
      green: AppColor;
      red: AppColor;
      pink: AppColor;
      orange: AppColor;
      yellow: AppColor;
      purple: AppColor;
      blue: AppColor;
      white: string;
      black: string;
      alpha: {
        alpha0: string;
        alpha02: string;
        alpha04: string;
        alpha05: string;
        alpha06: string;
        alpha08: string;
        alpha10: string;
        alpha12: string;
        alpha15: string;
        alpha16: string;
        alpha20: string;
        alpha25: string;
        alpha30: string;
        alpha35: string;
        alpha40: string;
        alpha50: string;
        alpha60: string;
        alpha70: string;
      };
    };
  }

  interface PaletteOptions {
    colors?: Partial<Palette["colors"]>;
    caution?: PaletteColorOptions;
    discovery?: PaletteColorOptions;
  }

  interface Palette {
    caution: PaletteColor;
    discovery: PaletteColor;
  }
}
