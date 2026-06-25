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
        ...(t.isFocused && {
          // Uniform focus treatment across every token: a tinted background plus
          // a primary-colored ring.
          backgroundColor: (theme) => theme.palette.colors.alpha.alpha12,
          boxShadow: (theme) =>
            `0 0 0 2px ${theme.palette.background.default}, 0 0 0 4px ${theme.palette.primary.main}`,
        }),
      }}
    />
  );
}
