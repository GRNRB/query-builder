'use client';

// Shared, presentation-only playground widget.
//
// Both docs demos render this exact UI; they differ only in *how a mutation is applied* —
// the React demo drives it through the `useQueryBuilder` hook, the Vanilla demo through the
// core `reducer`. That difference is captured by the `PlaygroundController` interface below,
// so this file owns everything visual (schema, styles, drag, rows/groups, JSON panel) once.
//
// Adapters: src/components/playground.tsx (hook) and src/components/vanilla-playground.tsx
// (reducer). The standalone, fuller version of this widget lives at examples/basic/src/App.tsx.

import { useState, useSyncExternalStore } from 'react';
import { defineSchema } from '@grnrb/query-builder-core';
import type {
  ConditionNodeInput,
  GroupOperatorId,
  QueryNode,
} from '@grnrb/query-builder-core';

// ─── Schema ──────────────────────────────────────────────────────────────────

export const schema = defineSchema({
  fields: [
    { id: 'name', label: 'Name', supportedOperators: ['eq', 'contains'] },
    { id: 'age', label: 'Age', supportedOperators: ['eq', 'gt', 'lt'] },
    { id: 'status', label: 'Status', supportedOperators: ['eq', 'contains'] },
    { id: 'active', label: 'Active', supportedOperators: ['is_set'] },
  ],
  conditionOperators: [
    { id: 'eq', arity: 'one', label: 'equals' },
    { id: 'contains', arity: 'one', label: 'contains' },
    { id: 'gt', arity: 'one', label: 'greater than' },
    { id: 'lt', arity: 'one', label: 'less than' },
    { id: 'is_set', arity: 'none', label: 'is set' },
  ],
  groupOperators: [
    { id: 'and', arity: 'many', label: 'AND' },
    { id: 'or', arity: 'many', label: 'OR' },
  ],
});

export type S = typeof schema;
export type Node = QueryNode<S>;
type GroupNodeT = Extract<Node, { type: 'group' }>;
type ConditionNodeT = Extract<Node, { type: 'condition' }>;

export const initialQuery = {
  type: 'group' as const,
  operator: 'and' as const,
  children: [
    {
      type: 'condition' as const,
      field: 'name' as const,
      operator: 'eq' as const,
      value: 'Alice',
    },
    {
      type: 'condition' as const,
      field: 'age' as const,
      operator: 'gt' as const,
      value: '18',
    },
  ],
};

// ─── Controller ────────────────────────────────────────────────────────────────

/**
 * The whole mutable surface the widget needs. Each adapter supplies the current `query`
 * plus these six operations — the React adapter forwards them to the hook ~1:1, the Vanilla
 * adapter maps each to a `reducer` dispatch.
 */
export type PlaygroundController = {
  query: Node;
  updateCondition(nodeId: string, patch: Partial<ConditionNodeInput<S>>): void;
  removeNode(nodeId: string): void;
  addCondition(groupId: string, input: ConditionNodeInput<S>): void;
  addGroup(groupId: string, operator: GroupOperatorId<S>): void;
  moveNode(nodeId: string, targetGroupId: string, index: number): void;
  updateGroupOperator(groupId: string, operator: string): void;
};

// ─── Tokens & styles ────────────────────────────────────────────────────────────

const colors = {
  accent: '#6366f1',
  accentSoft: '#a5b4fc',
  border: '#e5e7eb',
  borderInput: '#d1d5db',
  muted: '#9ca3af',
  text: '#111',
  textStrong: '#111827',
  textSubtle: '#374151',
  surface: 'white',
  surfaceAlt: '#f9fafb',
  danger: '#ef4444',
  success: '#22c55e',
  jsonBg: '#1e1e2e',
  jsonFg: '#cdd6f4',
};

const GROUP_COLORS = ['#eff6ff', '#fdf4ff', '#f0fdf4', '#fff7ed'];

const s = {
  btn: (bg: string, fg = 'white'): React.CSSProperties => ({
    padding: '5px 12px',
    background: bg,
    color: fg,
    border: 'none',
    borderRadius: 5,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    lineHeight: '20px',
  }),
  select: {
    padding: '4px 8px',
    borderRadius: 4,
    border: `1px solid ${colors.borderInput}`,
    background: colors.surface,
    fontSize: 13,
    color: colors.text,
  } as React.CSSProperties,
  input: {
    padding: '4px 8px',
    borderRadius: 4,
    border: `1px solid ${colors.borderInput}`,
    fontSize: 13,
    minWidth: 130,
    color: colors.text,
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
        padding: '8px 0',
        margin: '-8px 0',
        position: 'relative',
        zIndex: 5,
        cursor: 'copy',
      }}
    >
      <div
        style={{
          height: isActive ? 3 : 1,
          background: isActive ? colors.accent : colors.border,
          borderRadius: 2,
          transition: 'all 0.1s',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

// ─── Condition Row ────────────────────────────────────────────────────────────

function ConditionRow({
  node,
  controller,
  drag,
}: {
  node: ConditionNodeT;
  controller: PlaygroundController;
  drag: DragProps;
}) {
  const field = schema.fields.find((f) => f.id === node.field)!;
  const supportedOps = schema.conditionOperators.filter((o) =>
    field.supportedOperators.some((id) => id === o.id),
  );
  const opDef = schema.conditionOperators.find((o) => o.id === node.operator);
  const isDragging = drag.draggingId === node.id;

  const update = (patch: Partial<ConditionNodeInput<S>>) =>
    controller.updateCondition(node.id, patch);

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.stopPropagation();
        drag.onDragStart(node.id);
      }}
      onDragEnd={drag.onDragEnd}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 10px',
        background: colors.surface,
        border: `1px solid ${isDragging ? colors.accent : colors.border}`,
        borderRadius: 6,
        cursor: 'grab',
        opacity: isDragging ? 0.45 : 1,
        transition: 'opacity 0.12s, border-color 0.12s',
        userSelect: 'none',
      }}
    >
      <span style={{ color: colors.muted, fontSize: 15, letterSpacing: '-1px' }}>
        ⠿
      </span>

      <select
        value={node.field}
        onChange={(e) => update({ field: e.target.value as never })}
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
        onChange={(e) => update({ operator: e.target.value as never })}
        style={s.select}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {supportedOps.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>

      {opDef?.arity === 'one' ? (
        <input
          value={String((node as { value?: unknown }).value ?? '')}
          onChange={(e) => update({ value: e.target.value as never })}
          placeholder="value…"
          style={s.input}
          onMouseDown={(e) => e.stopPropagation()}
        />
      ) : (
        <span style={{ color: colors.muted, fontSize: 12, fontStyle: 'italic' }}>
          (no value)
        </span>
      )}

      <button
        onClick={() => controller.removeNode(node.id)}
        style={{ ...s.btn(colors.danger), marginLeft: 'auto', padding: '3px 9px' }}
        title="Remove condition"
        onMouseDown={(e) => e.stopPropagation()}
      >
        ✕
      </button>
    </div>
  );
}

// ─── Group Block ──────────────────────────────────────────────────────────────

function GroupBlock({
  node,
  controller,
  isRoot,
  depth,
  drag,
}: {
  node: GroupNodeT;
  controller: PlaygroundController;
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
        transition: 'opacity 0.12s',
        marginBottom: 8,
      }}
    >
      <div
        style={{
          border: `2px solid ${depth === 0 ? colors.accent : colors.borderInput}`,
          borderRadius: 8,
          padding: 12,
          background: bg,
        }}
      >
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
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 10,
            cursor: !isRoot ? 'grab' : 'default',
            userSelect: 'none',
          }}
        >
          {!isRoot && (
            <span
              style={{ color: colors.muted, fontSize: 15, letterSpacing: '-1px' }}
            >
              ⠿
            </span>
          )}

          <select
            value={node.operator}
            onChange={(e) =>
              controller.updateGroupOperator(node.id, e.target.value)
            }
            style={{
              ...s.select,
              fontWeight: 'bold',
              color: colors.accent,
              borderColor: colors.accentSoft,
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
                color: colors.muted,
                padding: '2px 6px',
                border: `1px solid ${colors.border}`,
                borderRadius: 4,
              }}
            >
              root
            </span>
          )}

          {!isRoot && (
            <button
              onClick={() => controller.removeNode(node.id)}
              style={{ ...s.btn(colors.danger), marginLeft: 'auto' }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              Remove group
            </button>
          )}
        </div>

        <div style={{ paddingLeft: 8 }}>
          {node.children.length === 0 && !drag.draggingId && (
            <div
              style={{
                color: colors.muted,
                fontSize: 13,
                fontStyle: 'italic',
                padding: '6px 0',
              }}
            >
              No conditions yet — add one below.
            </div>
          )}

          <DropZone groupId={node.id} index={0} drag={drag} />

          {node.children.map((child, i) => (
            <div key={child.id}>
              {child.type === 'group' ? (
                <GroupBlock
                  node={child}
                  controller={controller}
                  isRoot={false}
                  depth={depth + 1}
                  drag={drag}
                />
              ) : (
                <ConditionRow node={child} controller={controller} drag={drag} />
              )}
              <DropZone groupId={node.id} index={i + 1} drag={drag} />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button
            onClick={() =>
              controller.addCondition(node.id, {
                type: 'condition',
                field: 'name',
                operator: 'eq',
                value: '',
              })
            }
            style={s.btn(colors.success)}
          >
            + Condition
          </button>
          <button
            onClick={() => controller.addGroup(node.id, 'and')}
            style={s.btn(colors.accent)}
          >
            + Sub-group
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Drag helpers ─────────────────────────────────────────────────────────────

function findParentAndIndex(
  node: Node,
  childId: string,
): { parentId: string; index: number } | null {
  if (node.type !== 'group') return null;
  for (let i = 0; i < node.children.length; i++) {
    if (node.children[i].id === childId) return { parentId: node.id, index: i };
    const found = findParentAndIndex(node.children[i], childId);
    if (found) return found;
  }
  return null;
}

function useDragState(controller: PlaygroundController): DragProps {
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
        const source = findParentAndIndex(controller.query, draggingId);
        const insertIndex =
          source && source.parentId === groupId && source.index < dropIndex
            ? dropIndex - 1
            : dropIndex;
        controller.moveNode(draggingId, groupId, insertIndex);
      }
      setDraggingId(null);
      setDropTarget(null);
    },
  };
}

// ─── JSON Panel ───────────────────────────────────────────────────────────────

function JsonPanel({ query }: { query: Node }) {
  return (
    <div style={{ marginTop: 16 }}>
      <p
        style={{
          margin: '0 0 6px',
          fontWeight: 600,
          fontSize: 13,
          color: colors.textSubtle,
        }}
      >
        Query tree (JSON)
      </p>
      <pre
        style={{
          background: colors.jsonBg,
          color: colors.jsonFg,
          padding: 16,
          borderRadius: 8,
          overflow: 'auto',
          fontSize: 12.5,
          lineHeight: 1.6,
          margin: 0,
          maxHeight: 360,
        }}
      >
        {JSON.stringify(query, null, 2)}
      </pre>
    </div>
  );
}

// ─── Widget shell ─────────────────────────────────────────────────────────────

/**
 * Renders the demo from a `controller`. The two adapters build their controller (hook vs.
 * reducer) and pass it here; `useDragState` lives in this shell because it's pure UI state.
 */
export function PlaygroundWidget({
  controller,
  showJson,
}: {
  controller: PlaygroundController;
  showJson: boolean;
}) {
  const root = controller.query as GroupNodeT;
  const drag = useDragState(controller);

  return (
    <div
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        background: colors.surfaceAlt,
        border: `1px solid ${colors.border}`,
        borderRadius: 12,
        padding: 16,
        color: colors.textStrong,
      }}
    >
      <GroupBlock node={root} controller={controller} isRoot depth={0} drag={drag} />
      {showJson && <JsonPanel query={controller.query} />}
    </div>
  );
}

// `false` on the server / first render, `true` once hydrated — the idiomatic
// no-effect hydration check (see https://react.dev/reference/react/useSyncExternalStore).
const subscribe = () => () => {};
function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

/**
 * Client-only mount gate shared by both adapters. The initial tree is normalized with
 * `crypto.randomUUID()` (non-deterministic), which would otherwise cause a hydration mismatch
 * against the statically pre-rendered HTML. The placeholder keeps layout stable until mount.
 */
export function PlaygroundMount({ children }: { children: React.ReactNode }) {
  if (!useHydrated()) {
    return (
      <div
        style={{
          border: `1px solid ${colors.border}`,
          borderRadius: 12,
          padding: 16,
          minHeight: 220,
          background: colors.surfaceAlt,
          color: colors.muted,
          fontSize: 13,
        }}
      >
        Loading playground…
      </div>
    );
  }

  return <>{children}</>;
}
