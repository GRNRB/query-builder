import { useState } from "react";
import { defineSchema, useQueryBuilder } from "@grnrb/react-query-builder";
import type { QueryNode } from "@grnrb/react-query-builder";

// ─── Schema ──────────────────────────────────────────────────────────────────

const schema = defineSchema({
  fields: [
    { id: "name", label: "Name", supportedOperators: ["eq", "contains"] },
    { id: "age", label: "Age", supportedOperators: ["eq", "gt", "lt"] },
    { id: "status", label: "Status", supportedOperators: ["eq", "contains"] },
    { id: "active", label: "Active", supportedOperators: ["is_set"] },
  ],
  conditionOperators: [
    { id: "eq", arity: "one", label: "equals" },
    { id: "contains", arity: "one", label: "contains" },
    { id: "gt", arity: "one", label: "greater than" },
    { id: "lt", arity: "one", label: "less than" },
    { id: "is_set", arity: "none", label: "is set" },
  ],
  groupOperators: [
    { id: "and", arity: "many", label: "AND" },
    { id: "or", arity: "many", label: "OR" },
  ],
});

type S = typeof schema;
type QB = ReturnType<typeof useQueryBuilder<S>>;

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = {
  btn: (bg: string, fg = "white"): React.CSSProperties => ({
    padding: "5px 12px",
    background: bg,
    color: fg,
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    lineHeight: "20px",
  }),
  select: {
    padding: "4px 8px",
    borderRadius: 4,
    border: "1px solid #d1d5db",
    background: "white",
    fontSize: 13,
    color: "#111",
  } as React.CSSProperties,
  input: {
    padding: "4px 8px",
    borderRadius: 4,
    border: "1px solid #d1d5db",
    fontSize: 13,
    minWidth: 130,
    color: "#111",
  } as React.CSSProperties,
};

// ─── Drag State ───────────────────────────────────────────────────────────────

type DropTarget = { groupId: string; index: number };

type DragProps = {
  draggingId: string | null;
  dropTarget: DropTarget | null;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  setDropTarget: (t: DropTarget | null) => void;
  onDrop: (groupId: string, index: number) => void;
};

// ─── Drop Zone ────────────────────────────────────────────────────────────────

function DropZone({
  groupId,
  index,
  drag,
}: {
  groupId: string;
  index: number;
  drag: DragProps;
}) {
  if (!drag.draggingId) return null;

  const isActive =
    drag.dropTarget?.groupId === groupId && drag.dropTarget?.index === index;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        drag.setDropTarget({ groupId, index });
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        drag.onDrop(groupId, index);
      }}
      style={{
        // Large padding gives a 20px hit area while looking like a thin line
        padding: "8px 0",
        margin: "-8px 0",
        position: "relative",
        zIndex: 5,
        cursor: "copy",
      }}
    >
      <div
        style={{
          height: isActive ? 3 : 1,
          background: isActive ? "#6366f1" : "#e5e7eb",
          borderRadius: 2,
          transition: "all 0.1s",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

// ─── Condition Row ────────────────────────────────────────────────────────────

function ConditionRow({
  node,
  qb,
  drag,
}: {
  node: QB["query"] & { type: "condition" };
  qb: QB;
  drag: DragProps;
}) {
  const field = schema.fields.find((f) => f.id === node.field)!;
  const supportedOps = schema.conditionOperators.filter((o) =>
    field.supportedOperators.some((id) => id === o.id),
  );
  const opDef = schema.conditionOperators.find((o) => o.id === node.operator);
  const isDragging = drag.draggingId === node.id;

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.stopPropagation();
        drag.onDragStart(node.id);
      }}
      onDragEnd={drag.onDragEnd}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 10px",
        background: "white",
        border: `1px solid ${isDragging ? "#6366f1" : "#e5e7eb"}`,
        borderRadius: 6,
        cursor: "grab",
        opacity: isDragging ? 0.45 : 1,
        transition: "opacity 0.12s, border-color 0.12s",
        userSelect: "none",
      }}
    >
      <span style={{ color: "#9ca3af", fontSize: 15, letterSpacing: "-1px" }}>
        ⠿
      </span>

      <select
        value={node.field}
        onChange={(e) =>
          qb.updateCondition(node.id, { field: e.target.value as never })
        }
        style={s.select}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {schema.fields.map((f) => (
          <option key={f.id} value={f.id}>
            {f.label}
          </option>
        ))}
      </select>

      <select
        value={node.operator}
        onChange={(e) =>
          qb.updateCondition(node.id, { operator: e.target.value as never })
        }
        style={s.select}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {supportedOps.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>

      {opDef?.arity === "one" ? (
        <input
          value={String((node as { value?: unknown }).value ?? "")}
          onChange={(e) =>
            qb.updateCondition(node.id, { value: e.target.value as never })
          }
          placeholder="value…"
          style={s.input}
          onMouseDown={(e) => e.stopPropagation()}
        />
      ) : (
        <span style={{ color: "#9ca3af", fontSize: 12, fontStyle: "italic" }}>
          (no value)
        </span>
      )}

      <button
        onClick={() => qb.removeNode(node.id)}
        style={{ ...s.btn("#ef4444"), marginLeft: "auto", padding: "3px 9px" }}
        title="Remove condition"
        onMouseDown={(e) => e.stopPropagation()}
      >
        ✕
      </button>
    </div>
  );
}

// ─── Group Block ──────────────────────────────────────────────────────────────

const GROUP_COLORS = ["#eff6ff", "#fdf4ff", "#f0fdf4", "#fff7ed"];

function GroupBlock({
  node,
  qb,
  isRoot,
  depth,
  drag,
}: {
  node: QB["query"] & { type: "group" };
  qb: QB;
  isRoot: boolean;
  depth: number;
  drag: DragProps;
}) {
  const bg = GROUP_COLORS[depth % GROUP_COLORS.length];
  const isDragging = drag.draggingId === node.id;

  return (
    <div
      style={{
        opacity: isDragging ? 0.45 : 1,
        transition: "opacity 0.12s",
        marginBottom: 8,
      }}
    >
      <div
        style={{
          border: `2px solid ${depth === 0 ? "#6366f1" : "#d1d5db"}`,
          borderRadius: 8,
          padding: 12,
          background: bg,
        }}
      >
        {/* Header */}
        <div
          draggable={!isRoot}
          onDragStart={
            !isRoot
              ? (e) => {
                  e.stopPropagation();
                  drag.onDragStart(node.id);
                }
              : undefined
          }
          onDragEnd={!isRoot ? drag.onDragEnd : undefined}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 10,
            cursor: !isRoot ? "grab" : "default",
            userSelect: "none",
          }}
        >
          {!isRoot && (
            <span
              style={{ color: "#9ca3af", fontSize: 15, letterSpacing: "-1px" }}
            >
              ⠿
            </span>
          )}

          <select
            value={node.operator}
            onChange={(e) =>
              qb.updateGroupOperator(node.id, e.target.value as never)
            }
            style={{
              ...s.select,
              fontWeight: "bold",
              color: "#6366f1",
              borderColor: "#a5b4fc",
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {schema.groupOperators?.map((go) => (
              <option key={go.id} value={go.id}>
                {go.label}
              </option>
            ))}
          </select>

          {isRoot && (
            <span
              style={{
                fontSize: 11,
                color: "#9ca3af",
                padding: "2px 6px",
                border: "1px solid #e5e7eb",
                borderRadius: 4,
              }}
            >
              root
            </span>
          )}

          {!isRoot && (
            <button
              onClick={() => qb.removeNode(node.id)}
              style={{ ...s.btn("#ef4444"), marginLeft: "auto" }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              Remove group
            </button>
          )}
        </div>

        {/* Children */}
        <div style={{ paddingLeft: 8 }}>
          {node.children.length === 0 && !drag.draggingId && (
            <div
              style={{
                color: "#9ca3af",
                fontSize: 13,
                fontStyle: "italic",
                padding: "6px 0",
              }}
            >
              No conditions yet — add one below.
            </div>
          )}

          <DropZone groupId={node.id} index={0} drag={drag} />

          {node.children.map((child, i) => (
            <div key={child.id}>
              {child.type === "group" ? (
                <GroupBlock
                  node={child}
                  qb={qb}
                  isRoot={false}
                  depth={depth + 1}
                  drag={drag}
                />
              ) : (
                <ConditionRow node={child} qb={qb} drag={drag} />
              )}
              <DropZone groupId={node.id} index={i + 1} drag={drag} />
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button
            onClick={() =>
              qb.addCondition(node.id, {
                type: "condition",
                field: "name",
                operator: "eq",
                value: "",
              })
            }
            style={s.btn("#22c55e")}
          >
            + Condition
          </button>
          <button
            onClick={() => qb.addGroup(node.id, "and")}
            style={s.btn("#6366f1")}
          >
            + Sub-group
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Demos ────────────────────────────────────────────────────────────────────

const initialQuery = {
  type: "group" as const,
  operator: "and" as const,
  children: [
    {
      type: "condition" as const,
      field: "name" as const,
      operator: "eq" as const,
      value: "Alice",
    },
    {
      type: "condition" as const,
      field: "age" as const,
      operator: "gt" as const,
      value: "18",
    },
  ],
};

function findParentAndIndex(
  node: QueryNode<S>,
  childId: string,
): { parentId: string; index: number } | null {
  if (node.type !== "group") return null;
  for (let i = 0; i < node.children.length; i++) {
    if (node.children[i].id === childId) return { parentId: node.id, index: i };
    const found = findParentAndIndex(node.children[i], childId);
    if (found) return found;
  }
  return null;
}

function useDragState(qb: QB): DragProps {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);

  return {
    draggingId,
    dropTarget,
    onDragStart: (id) => setDraggingId(id),
    onDragEnd: () => {
      setDraggingId(null);
      setDropTarget(null);
    },
    setDropTarget,
    onDrop: (groupId, dropIndex) => {
      if (draggingId) {
        // moveNode inserts into the post-removal array, so when moving an item
        // downward within the same group the index must be decremented by 1.
        const source = findParentAndIndex(qb.query, draggingId);
        const insertIndex =
          source && source.parentId === groupId && source.index < dropIndex
            ? dropIndex - 1
            : dropIndex;
        qb.moveNode(draggingId, groupId, insertIndex);
      }
      setDraggingId(null);
      setDropTarget(null);
    },
  };
}

function UncontrolledDemo() {
  const qb = useQueryBuilder(schema, { initialQuery });
  const root = qb.query as QB["query"] & { type: "group" };
  const drag = useDragState(qb);

  return (
    <>
      <GroupBlock node={root} qb={qb} isRoot depth={0} drag={drag} />
      <JsonPanel query={qb.query} />
    </>
  );
}

function ControlledDemo() {
  const [query, setQuery] = useState<QueryNode<S>>(() => ({
    id: "root",
    type: "group",
    operator: "and",
    children: [],
  }));

  const qb = useQueryBuilder(schema, { query, onChange: setQuery });
  const root = qb.query as QB["query"] & { type: "group" };
  const drag = useDragState(qb);

  return (
    <>
      <div
        style={{
          marginBottom: 12,
          padding: "8px 12px",
          background: "#fffbeb",
          border: "1px solid #fbbf24",
          borderRadius: 6,
          fontSize: 13,
          color: "#92400e",
        }}
      >
        Controlled mode — query state lives in parent <code>useState</code>;{" "}
        <code>onChange</code> propagates every mutation.
      </div>
      <GroupBlock node={root} qb={qb} isRoot depth={0} drag={drag} />
      <JsonPanel query={qb.query} />
    </>
  );
}

function JsonPanel({ query }: { query: QueryNode<S> }) {
  return (
    <div style={{ marginTop: 24 }}>
      <p
        style={{
          margin: "0 0 6px",
          fontWeight: 600,
          fontSize: 13,
          color: "#374151",
        }}
      >
        Query tree (JSON)
      </p>
      <pre
        style={{
          background: "#1e1e2e",
          color: "#cdd6f4",
          padding: 16,
          borderRadius: 8,
          overflow: "auto",
          fontSize: 12.5,
          lineHeight: 1.6,
          margin: 0,
          maxHeight: 400,
        }}
      >
        {JSON.stringify(query, null, 2)}
      </pre>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [mode, setMode] = useState<"uncontrolled" | "controlled">(
    "uncontrolled",
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        background: "#f9fafb",
        padding: "32px 24px",
      }}
    >
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 24, color: "#111827" }}>
          useQueryBuilder
        </h1>
        <p style={{ margin: "0 0 28px", color: "#6b7280", fontSize: 14 }}>
          Interactive playground — add conditions, nest groups, drag to reorder.
        </p>

        {/* Mode tabs */}
        <div
          style={{
            display: "inline-flex",
            background: "#e5e7eb",
            borderRadius: 8,
            padding: 3,
            marginBottom: 24,
            gap: 3,
          }}
        >
          {(["uncontrolled", "controlled"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                padding: "6px 18px",
                borderRadius: 6,
                border: "none",
                background: mode === m ? "white" : "transparent",
                color: mode === m ? "#111827" : "#6b7280",
                cursor: "pointer",
                fontWeight: mode === m ? 600 : 400,
                fontSize: 14,
                boxShadow: mode === m ? "0 1px 3px rgba(0,0,0,.1)" : "none",
              }}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        {mode === "uncontrolled" ? <UncontrolledDemo /> : <ControlledDemo />}
      </div>
    </div>
  );
}
