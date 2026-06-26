import Chip from "@mui/material/Chip";
import type { ChipProps } from "@mui/material/Chip";
import type { ReactNode } from "react";
import { useToken } from "../context";
import type { Focus } from "../lib/focus";

interface TokenProps {
  focus: Focus;
  label: ReactNode;
  color?: ChipProps["color"];
  variant?: ChipProps["variant"];
  /** Click (or keyboard activate) handler; receives the chip element as anchor. */
  onActivate?: (anchorEl: HTMLElement) => void;
  title?: string;
  /** Register as a roving-tabindex stop. Decorative duplicates pass false. */
  register?: boolean;
  italic?: boolean;
}

/**
 * A single focusable chip in the expression. The focus ring is driven by our
 * own focus state (not `:focus-visible`) because focus is moved imperatively.
 */
export function Token({
  focus,
  label,
  color = "default",
  variant = "soft",
  onActivate,
  title,
  register = true,
  italic = false,
}: TokenProps) {
  const t = useToken(focus, register);

  return (
    <Chip
      ref={t.ref}
      data-qb-token=""
      tabIndex={t.tabIndex}
      label={label}
      size="small"
      color={color}
      variant={variant}
      clickable
      title={title}
      onClick={(e) => {
        t.focusSelf();
        onActivate?.(e.currentTarget as HTMLElement);
      }}
      sx={{
        cursor: onActivate ? "pointer" : "default",
        outline: "none",
        fontStyle: italic ? "italic" : "normal",
        transition: "box-shadow .1s, background-color .1s",
        // Blinking text-caret (I-beam) shown only while focused.
        "@keyframes qb-caret-blink": {
          "0%, 49%": { opacity: 1 },
          "50%, 100%": { opacity: 0 },
        },
        ...(t.isFocused && {
          position: "relative",
          // Caret is shown only while the builder shell itself holds focus, so
          // it vanishes when focus leaves the Paper (click-away, palette, etc.).
          "[data-qb-shell]:focus-within &::after": {
            content: '""',
            position: "absolute",
            right: 3,
            top: "50%",
            transform: "translateY(-50%)",
            width: "1.5px",
            height: "1.05em",
            backgroundColor: "currentColor",
            animation: "qb-caret-blink 1.06s step-end infinite",
            pointerEvents: "none",
          },
        }),
      }}
    />
  );
}
