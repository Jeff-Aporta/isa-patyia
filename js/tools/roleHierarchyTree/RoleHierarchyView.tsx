/** Vista principal del árbol de jerarquía de roles. */

import * as React from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { getMaterialUI, getReact, UI, toastError, toastInfo } from "../../core/platform.ts";

const { useState, useMemo, useCallback } = getReact();
const { Box, Stack, Typography, IconButton, Tooltip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, CircularProgress, Chip } = getMaterialUI();
const { Icon } = UI;

import { TreeRowView } from "./treeRow.js";
import type { TreeRowViewProps } from "./treeRow.js";
import { buildTreeRows, flattenForRender, wouldCycle } from "./treeLogic.js";
import { RolePermissionsEditor } from "./RolePermissionsEditor.js";
import { ancestorsFromPath } from "../roleHierarchy.js";
import type { HierarchyNode, TreeRow } from "./types.js";

export interface RoleHierarchyViewProps {
  nodes: HierarchyNode[];
  canMutate: boolean;
  busy: boolean;
  onSave: (name: string, jerarquia: string) => Promise<void>;
  onSaveLocalPerm: (nodeJer: string, key: string, value: unknown) => Promise<void>;
  onPromote: (key: string, value: unknown, fromJer: string, toJer: string) => Promise<void>;
  onCreate: (name: string, jerarquia: string) => Promise<void>;
  onDelete: (name: string) => Promise<void>;
}

export function RoleHierarchyView(props: RoleHierarchyViewProps): React.ReactElement {
  const { nodes, canMutate, busy, onSave, onSaveLocalPerm, onPromote, onCreate, onDelete } = props;

  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [selectedJer, setSelectedJer] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<TreeRow | null>(null);
  const [dragOverJer, setDragOverJer] = useState<string | null>(null);
  const [dragSourceJer, setDragSourceJer] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<string[]>([]);

  const rows = useMemo<TreeRow[]>(() => buildTreeRows(nodes), [nodes]);
  const visibleRows = useMemo<TreeRow[]>(() => flattenForRender(rows, collapsed), [rows, collapsed]);

  const currentEditJer: string | null = breadcrumb.length > 0 ? breadcrumb[breadcrumb.length - 1] : selectedJer;
  const currentEditNode: HierarchyNode | null = useMemo<HierarchyNode | null>(
    () => (currentEditJer ? nodes.find((n: HierarchyNode) => n.jerarquia === currentEditJer) ?? null : null),
    [currentEditJer, nodes],
  );

  const byJer: Map<string, HierarchyNode> = useMemo(
    () => new Map(nodes.map((n: HierarchyNode) => [n.jerarquia, n])),
    [nodes],
  );

  const childCountOf = useMemo<Map<string, number>>(() => {
    const map = new Map<string, number>();
    for (const r of rows) {
      const ancestors = ancestorsFromPath(r.jerarquia).slice(1);
      for (const p of ancestors) {
        if (byJer.has(p)) map.set(p, (map.get(p) ?? 0) + 1);
      }
    }
    return map;
  }, [rows, byJer]);

  const toggleCollapse = useCallback((jer: string) => {
    setCollapsed((prev: Set<string>) => {
      const next = new Set(prev);
      if (next.has(jer)) next.delete(jer);
      else next.add(jer);
      return next;
    });
  }, []);

  const collapseAll = useCallback(() => {
    setCollapsed(new Set(rows.filter((r) => r.hasChildren).map((r) => r.jerarquia)));
  }, [rows]);

  const expandAll = useCallback(() => setCollapsed(new Set()), []);

  const handleDragStart = useCallback((row: TreeRow) => (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!canMutate) return;
    setDragSourceJer(row.jerarquia);
    const target = e.currentTarget as HTMLElement;
    if (target.setPointerCapture && e.pointerId !== undefined) {
      try { target.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    }
  }, [canMutate]);

  const handleDragOver = useCallback((row: TreeRow) => (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!canMutate || !dragSourceJer) return;
    if (row.jerarquia === dragSourceJer) return;
    e.preventDefault();
    setDragOverJer(row.jerarquia);
  }, [canMutate, dragSourceJer]);

  const handleDrop = useCallback((targetRow: TreeRow) => async (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!canMutate || !dragSourceJer || dragSourceJer === targetRow.jerarquia) {
      setDragSourceJer(null);
      setDragOverJer(null);
      return;
    }
    if (wouldCycle(dragSourceJer, targetRow.jerarquia, nodes)) {
      toastInfo?.(`No se puede mover: crearía un ciclo en la cadena de padres`);
      setDragSourceJer(null);
      setDragOverJer(null);
      return;
    }
    try {
      const sourceRow = rows.find((r) => r.jerarquia === dragSourceJer);
      if (!sourceRow) return;
      // Encontrar el siguiente sufijo ".x" disponible
      let suffix = 1;
      while (byJer.has(`${targetRow.jerarquia}.${suffix}`)) suffix++;
      const finalJer = `${targetRow.jerarquia}.${suffix}`;
      await onSave(sourceRow.iusuario, finalJer);
    } catch (err) {
      toastError?.(`Error al reparentar: ${(err as Error)?.message ?? err}`);
    } finally {
      setDragSourceJer(null);
      setDragOverJer(null);
    }
  }, [canMutate, dragSourceJer, nodes, onSave, byJer, rows]);

  const handleDragEnd = useCallback(() => {
    setDragSourceJer(null);
    setDragOverJer(null);
  }, []);

  const navigateTo = useCallback((jer: string) => {
    setSelectedJer(jer);
    setBreadcrumb([]);
  }, []);

  const drillDown = useCallback((jer: string) => {
    setBreadcrumb((prev: string[]) => [...prev, jer]);
  }, []);

  const drillUp = useCallback(() => {
    setBreadcrumb((prev: string[]) => prev.slice(0, -1));
  }, []);

  const onDeleteRow = useCallback(async (name: string) => {
    if (confirm(`¿Eliminar rol "${name}"?`)) {
      try { await onDelete(name); } catch (e) { toastError?.(String(e)); }
    }
  }, [onDelete]);

  // Handler para abrir el dialog de creación de rol
  const openCreateDialog = useCallback(() => {
    setEditTarget({
      jerarquia: "__new__",
      iusuario: "",
      namedisplay: null,
      descripcion: null,
      flatPath: "__new__",
      pathInit: "__new__",
      hasChildren: false,
      isCollapsed: false,
      depth: 0,
      isSelected: false,
    });
  }, []);

  const renderRow = (row: TreeRow): React.ReactElement => {
    const isOver = !!dragOverJer && dragOverJer === row.jerarquia;
    const isSource = !!dragSourceJer && dragSourceJer === row.jerarquia;
    const rowProps: TreeRowViewProps = {
      row,
      isCollapsed: collapsed.has(row.jerarquia),
      isDragOver: isOver,
      isDragSource: isSource,
      canMutate: canMutate && !busy,
      isSelected: selectedJer === row.jerarquia,
      childCount: childCountOf.get(row.jerarquia) ?? 0,
      onToggleCollapse: () => toggleCollapse(row.jerarquia),
      onSelect: () => navigateTo(row.jerarquia),
      onEdit: () => setEditTarget(row),
      onDelete: () => onDeleteRow(row.iusuario),
      onDragStart: handleDragStart(row),
      onDragOver: handleDragOver(row),
      onDrop: handleDrop(row),
      onDragEnd: handleDragEnd,
      onDrillDown: row.hasChildren ? () => drillDown(row.jerarquia) : undefined,
    };
    return <TreeRowView key={row.jerarquia} {...rowProps} />;
  };

  return (
    <Box className="role-hierarchy-tree" sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 1, borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="subtitle1" sx={{ flex: 1 }}>Jerarquía de roles</Typography>
        <Chip size="small" label={`${rows.length} roles`} />
        <Tooltip title="Expandir todo">
          <IconButton size="small" onClick={expandAll} disabled={busy}>
            <iconify-icon icon="mdi:unfold-more-horizontal" width="18" height="18" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Colapsar todo">
          <IconButton size="small" onClick={collapseAll} disabled={busy}>
            <iconify-icon icon="mdi:unfold-less-horizontal" width="18" height="18" />
          </IconButton>
        </Tooltip>
        {canMutate ? (
          <Button
            size="small"
            variant="contained"
            startIcon={<iconify-icon icon="mdi:plus" width="16" height="16" />}
            onClick={openCreateDialog}
            disabled={busy}
          >
            Nuevo rol
          </Button>
        ) : null}
      </Stack>

      {busy ? (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
          <CircularProgress size={20} />
        </Box>
      ) : null}

      <Box sx={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
        <Box role="tree" sx={{ width: 360, flexShrink: 0, overflowY: "auto", p: 1, borderRight: 1, borderColor: "divider" }}>
          {visibleRows.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>Sin roles.</Typography>
          ) : (
            visibleRows.map(renderRow)
          )}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0, overflow: "auto" }}>
          {currentEditNode ? (
            <RolePermissionsEditor
              currentNode={currentEditNode}
              allNodes={nodes}
              busy={busy}
              onSaveLocal={async (key: string, value: unknown) => onSaveLocalPerm(currentEditNode.jerarquia, key, value)}
              onPromote={onPromote}
              onClose={() => { setSelectedJer(null); setBreadcrumb([]); }}
            />
          ) : (
            <Box sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
              <iconify-icon icon="mdi:family-tree" width="48" height="48" />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Selecciona un rol del árbol para ver y editar sus permisos.
              </Typography>
              {!canMutate ? (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                  (Solo roles de branch 0 pueden editar la jerarquía.)
                </Typography>
              ) : null}
            </Box>
          )}
        </Box>
      </Box>

      <HierarchyEditDialog
        target={editTarget}
        existingNodes={nodes}
        busy={busy}
        onClose={() => setEditTarget(null)}
        onSave={async (name: string, jer: string) => {
          if (editTarget?.jerarquia === "__new__") {
            await onCreate(name, jer);
          } else if (editTarget) {
            await onSave(editTarget.iusuario, jer);
          }
          setEditTarget(null);
        }}
      />
    </Box>
  );
}

interface HierarchyEditDialogProps {
  target: TreeRow | null;
  existingNodes: HierarchyNode[];
  busy: boolean;
  onClose: () => void;
  onSave: (name: string, jerarquia: string) => Promise<void>;
}

function HierarchyEditDialog({ target, existingNodes, busy, onClose, onSave }: HierarchyEditDialogProps): React.ReactElement | null {
  const isNew = target?.jerarquia === "__new__";
  const [name, setName] = useState<string>(target?.iusuario ?? "");
  const [jerarquia, setJerarquia] = useState<string>(target?.jerarquia === "__new__" ? "" : target?.jerarquia ?? "");
  const [err, setErr] = useState<string>("");

  if (!target) return null;

  const handleSubmit = async (): Promise<void> => {
    setErr("");
    const trimmedName = String(name ?? "").trim();
    const trimmedJer = String(jerarquia ?? "").trim();
    if (!trimmedName) { setErr("nombre requerido"); return; }
    if (!trimmedJer) { setErr("jerarquía requerida"); return; }
    if (!/^[0-9]+(\.[0-9]+)*$/.test(trimmedJer)) { setErr("jerarquía inválida (formato: 0, 0.0, 0.1.1)"); return; }
    try {
      await onSave(trimmedName, trimmedJer);
    } catch (e) {
      setErr((e as Error)?.message ?? String(e));
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isNew ? "Nuevo rol" : `Mover ${target.iusuario}`}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {err ? <Alert severity="error">{err}</Alert> : null}
          <TextField label="Nombre" value={name} onChange={(e) => setName(e.target.value)} disabled={!isNew} helperText="minúsculas, sin espacios (ej. dev_lead)" />
          <TextField label="Nueva jerarquía" value={jerarquia} onChange={(e) => setJerarquia(e.target.value)} helperText="dot-notation: 0, 0.0, 0.1.1, ..." />
          <Alert severity="info">
            Los ancestros se derivan automáticamente del path. Arrastra un rol sobre otro en el árbol para reubicarlo.
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={busy}>
          {busy ? <CircularProgress size={16} /> : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}