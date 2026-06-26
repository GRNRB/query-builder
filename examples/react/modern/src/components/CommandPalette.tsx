import { useMemo, useState } from "react";
import Popper from "@mui/material/Popper";
import Paper from "@mui/material/Paper";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import { schema, supportedOps } from "../schema";
import type { PaletteState } from "../hooks/usePalette";

interface Option {
  id: string;
  label: string;
}

interface CommandPaletteProps {
  palette: PaletteState;
  /** Resolves a node's current field id (needed to list valid operators). */
  fieldOf: (nodeId: string) => string;
  onPick: (id: string) => void;
  onClose: () => void;
}

/**
 * Type-to-search picker for a field or operator. A custom Popper + MenuList
 * (rather than MUI Autocomplete) so it never fights the widget's global key
 * handler for arrow/enter. Rendered only while open, so the input auto-focuses
 * on each appearance and seeds from the keystroke that triggered it.
 */
export function CommandPalette({
  palette,
  fieldOf,
  onPick,
  onClose,
}: CommandPaletteProps) {
  const [search, setSearch] = useState(palette.seed);
  const [highlight, setHighlight] = useState(0);

  const options = useMemo<Option[]>(() => {
    if (palette.part === "field")
      return schema.fields.map((f) => ({ id: f.id, label: f.label }));
    if (palette.part === "combinator")
      return schema.groupOperators.map((o) => ({ id: o.id, label: o.label }));
    return supportedOps(fieldOf(palette.nodeId)).map((o) => ({
      id: o.id,
      label: o.label,
    }));
  }, [palette.part, palette.nodeId, fieldOf]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.id.includes(q),
    );
  }, [options, search]);

  const commit = (id: string) => onPick(id);

  return (
    <Popper
      open
      anchorEl={palette.anchorEl}
      placement="bottom-start"
      style={{ zIndex: 1300 }}
      modifiers={[{ name: "offset", options: { offset: [0, 6] } }]}
    >
      <ClickAwayListener onClickAway={onClose}>
        <Paper
          elevation={8}
          sx={{
            p: 0.75,
            minWidth: 220,
            borderRadius: 2,
            boxShadow:
              "0 10px 15px -3px #0000001a, 0 4px 6px -4px #0000001a, 0 0 0 .5px #0000001a",
          }}
        >
          <OutlinedInput
            autoFocus
            fullWidth
            size="small"
            value={search}
            placeholder={palette.part === "field" ? "Field…" : "Operator…"}
            // (field → "Field…"; operator & group combinator → "Operator…")
            onChange={(e) => {
              setSearch(e.target.value);
              setHighlight(0);
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setHighlight((h) => Math.min(filtered.length - 1, h + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlight((h) => Math.max(0, h - 1));
              } else if (e.key === "Enter") {
                e.preventDefault();
                const opt = filtered[highlight];
                if (opt) commit(opt.id);
              } else if (e.key === "Escape") {
                e.preventDefault();
                onClose();
              }
            }}
            sx={{ height: 30, fontSize: 13 }}
          />

          <MenuList dense sx={{ mt: 0.5, maxHeight: 240, overflow: "auto", py: 0 }}>
            {filtered.length === 0 && (
              <MenuItem disabled dense>
                No matches
              </MenuItem>
            )}
            {filtered.map((o, i) => (
              <MenuItem
                key={o.id}
                dense
                selected={i === highlight}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => commit(o.id)}
              >
                {o.label}
              </MenuItem>
            ))}
          </MenuList>
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
}
