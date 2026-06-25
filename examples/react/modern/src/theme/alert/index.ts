import type { Components, Theme } from "@mui/material";

const colorTokens = (theme: Theme) => ({
  primary: {
    softBg: theme.palette.colors.alpha.alpha05,
    softBorder: theme.palette.colors.alpha.alpha05,
    softText: theme.palette.text.primary,
    solidBg: theme.palette.colors.gray[900],
    solidText: theme.palette.colors.white,
    outlineBorder: theme.palette.colors.alpha.alpha10,
    outlineText: theme.palette.text.primary,
  },
  success: {
    softBg: theme.palette.colors.green.a25,
    softBorder: theme.palette.colors.green.a25,
    softText: theme.palette.colors.green[600],
    solidBg: theme.palette.colors.green[500],
    solidText: theme.palette.colors.white,
    outlineBorder: theme.palette.colors.green[500],
    outlineText: theme.palette.colors.green[500],
  },
  warning: {
    softBg: theme.palette.colors.orange.a25,
    softBorder: theme.palette.colors.orange.a25,
    softText: theme.palette.colors.orange[700],
    solidBg: theme.palette.colors.orange[500],
    solidText: theme.palette.colors.white,
    outlineBorder: theme.palette.colors.orange[500],
    outlineText: theme.palette.colors.orange[500],
  },
  caution: {
    softBg: theme.palette.colors.yellow.a25,
    softBorder: theme.palette.colors.yellow.a25,
    softText: theme.palette.colors.yellow[800],
    solidBg: theme.palette.colors.yellow[600],
    solidText: theme.palette.colors.white,
    outlineBorder: theme.palette.colors.yellow[700],
    outlineText: theme.palette.colors.yellow[700],
  },
  danger: {
    softBg: theme.palette.colors.red.a25,
    softBorder: theme.palette.colors.red.a25,
    softText: theme.palette.colors.red[600],
    solidBg: theme.palette.colors.red[500],
    solidText: theme.palette.colors.white,
    outlineBorder: theme.palette.colors.red[500],
    outlineText: theme.palette.colors.red[500],
  },
  info: {
    softBg: theme.palette.colors.blue.a25,
    softBorder: theme.palette.colors.blue.a25,
    softText: theme.palette.colors.blue[600],
    solidBg: theme.palette.colors.blue[400],
    solidText: theme.palette.colors.white,
    outlineBorder: theme.palette.colors.blue[500],
    outlineText: theme.palette.colors.blue[500],
  },
  discovery: {
    softBg: theme.palette.colors.purple.a25,
    softBorder: theme.palette.colors.purple.a25,
    softText: theme.palette.colors.purple[600],
    solidBg: theme.palette.colors.purple[400],
    solidText: theme.palette.colors.white,
    outlineBorder: theme.palette.colors.purple[500],
    outlineText: theme.palette.colors.purple[500],
  },
});

const alert: Components<Theme>["MuiAlert"] = {
  styleOverrides: {
    root: ({ theme, ownerState }) => {
      const colors = colorTokens(theme);
      const requestedColor = (
        (ownerState.color ?? ownerState.severity ?? "primary") as string
      ).toLowerCase();
      const normalizedColor =
        requestedColor === "error" ? "danger" : requestedColor;
      const colorKey = (
        normalizedColor in colors ? normalizedColor : "primary"
      ) as keyof ReturnType<typeof colorTokens>;
      const palette = colors[colorKey];

      const variant = ownerState.variant;
      const isSoft = variant === "soft" || variant === "standard";
      const isSolid = variant === "solid" || variant === "filled";
      const isOutline = variant === "outline" || variant === "outlined";

      let background: string | undefined = "transparent";
      let textColor: string | undefined = palette.softText;
      let boxShadow: string | undefined;

      if (isSoft) {
        background = palette.softBg;
        textColor = palette.softText;
        boxShadow = `0 0 0 1px ${palette.softBorder} inset`;
      } else if (isSolid) {
        background = palette.solidBg;
        textColor = palette.solidText;
      } else if (isOutline) {
        background = "transparent";
        textColor = palette.outlineText;
        boxShadow = `0 0 0 1px ${palette.outlineBorder} inset`;
      }

      const isBottomActions = ownerState.actionsPlacement === "bottom";

      return {
        display: "flex",
        alignItems: isBottomActions ? "flex-start" : "center",
        gap: theme.spacing(1),
        width: "100%",
        padding: theme.spacing(1.25, 1.5),
        borderRadius: theme.spacing(1),
        fontSize: theme.typography.body2.fontSize,
        lineHeight: theme.typography.body2.lineHeight,
        backgroundColor: background,
        color: textColor,
        border: "none",
        ...(boxShadow ? { boxShadow } : {}),

        "& .MuiAlert-icon": {
          margin: 0,
          padding: 0,
          color: "inherit",
          display: "inline-flex",
          alignItems: "center",
        },
        "& .MuiAlert-message": {
          padding: 0,
          minWidth: 0,
          flex: 1,
        },
        "& .MuiAlert-action": {
          margin: 0,
          padding: 0,
          color: "inherit",
          display: "inline-flex",
          alignItems: "center",
          ...(isBottomActions
            ? {
                marginTop: theme.spacing(1),
                width: "100%",
                justifyContent: "flex-start",
              }
            : {
                marginLeft: "auto",
              }),
        },
        ...(isBottomActions
          ? {
              flexWrap: "wrap",
            }
          : {}),
      };
    },
  },
};

export default alert;
