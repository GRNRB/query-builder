import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { Node } from "../schema";

/** Live, read-only view of the query tree the hook is managing. */
export function JsonPanel({ query }: { query: Node }) {
  return (
    <Box sx={{ mt: 3 }}>
      <Typography
        variant="caption"
        sx={{
          display: "block",
          mb: 0.75,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "text.secondary",
        }}
      >
        Query tree (JSON)
      </Typography>
      <Box
        component="pre"
        sx={{
          m: 0,
          p: 2,
          borderRadius: 2,
          background: "#1e1e2e",
          color: "#cdd6f4",
          fontSize: 12.5,
          lineHeight: 1.6,
          overflow: "auto",
          maxHeight: 360,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        }}
      >
        {JSON.stringify(query, null, 2)}
      </Box>
    </Box>
  );
}
