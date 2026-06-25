import { useState } from "react";
import OutlinedInput from "@mui/material/OutlinedInput";
import { useBuilder } from "../context";
import type { ConditionNodeT } from "../schema";

/**
 * Inline text editor for an arity-`one` value. Commits on Enter/blur, cancels on
 * Escape. It stops key propagation so the global keyboard handler stays dormant
 * while typing.
 */
export function ValueEditor({ node }: { node: ConditionNodeT }) {
  const { commitValue, cancelValueEdit, editSeed } = useBuilder();
  const current = String((node as { value?: unknown }).value ?? "");
  const [val, setVal] = useState(() => (editSeed ? editSeed : current));

  return (
    <OutlinedInput
      autoFocus
      size="small"
      value={val}
      placeholder="value…"
      onChange={(e) => setVal(e.target.value)}
      onFocus={(e) => e.currentTarget.select()}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Enter") {
          e.preventDefault();
          commitValue(node.id, val);
        } else if (e.key === "Escape") {
          e.preventDefault();
          cancelValueEdit();
        }
      }}
      onBlur={() => commitValue(node.id, val)}
      sx={{
        height: 22,
        fontSize: 12,
        width: `${Math.max(7, val.length + 4)}ch`,
        minWidth: 70,
      }}
    />
  );
}
