/** Vista jerarquía de roles: org-chart ECharts a pantalla completa (estructura + CRUD básico). */

import * as React from "react";
import { getMaterialUI, getReact } from "../../core/platform.ts";
import { HierarchyOrgChart, nextChildJerarquia } from "./HierarchyOrgChart.jsx";
import type { HierarchyNode } from "./types.js";

const { useState, useCallback, useEffect } = getReact();
const {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, CircularProgress, Stack,
} = getMaterialUI();

export interface RoleHierarchyViewProps {
  nodes: HierarchyNode[];
  roleEntries?: Array<{ iusuario: string; itipo?: string; permisos?: Record<string, unknown>; bactivo?: boolean }>;
  canManagePermisos?: boolean;
  canEditRoleDescriptions?: boolean;
  initialSelectedRole?: string | null;
  onSaveRolePermisos?: (name: string, permisos: Record<string, unknown>, bactivo?: boolean) => Promise<void>;
  canMutate: boolean;
  /** Solo Dev Lead puede crear roles hijos (por ahora). */
  canCreateRoles?: boolean;
  busy: boolean;
  onSave: (name: string, jerarquia: string) => Promise<void>;
  onSaveLocalPerm?: (nodeJer: string, key: string, value: unknown) => Promise<void>;
  onPromote?: (key: string, value: unknown, fromJer: string, toJer: string) => Promise<void>;
  onCreate: (name: string, jerarquia: string) => Promise<void>;
  onDelete: (name: string) => Promise<void>;
}

type EditTarget = { node: HierarchyNode; isNew: boolean } | null;

export function RoleHierarchyView(props: RoleHierarchyViewProps): React.ReactElement {
  const {
    nodes, initialSelectedRole, canMutate, canCreateRoles = false, busy, onSave, onCreate, onDelete,
  } = props;

  const [selectedJer, setSelectedJer] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<EditTarget>(null);

  useEffect(() => {
    if (!initialSelectedRole || !nodes.length) return;
    const key = String(initialSelectedRole).trim().toLowerCase();
    const node = nodes.find((n) => String(n.iusuario ?? "").trim().toLowerCase() === key);
    if (node?.jerarquia) setSelectedJer((prev) => (prev === node.jerarquia ? prev : node.jerarquia));
  }, [initialSelectedRole, nodes]);

  const openAddChild = useCallback((parent: HierarchyNode) => {
    const jer = nextChildJerarquia(parent.jerarquia, nodes);
    setSelectedJer(parent.jerarquia);
    setEditTarget({
      isNew: true,
      node: { iusuario: "", jerarquia: jer, namedisplay: null, descripcion: null },
    });
  }, [nodes]);

  return (
    <Box className="role-hierarchy-tree" sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <HierarchyOrgChart
        nodes={nodes}
        selectedJer={selectedJer}
        onSelect={setSelectedJer}
        canMutate={canMutate}
        canCreateRoles={canCreateRoles}
        busy={busy}
        onAddChildClick={openAddChild}
        onEditClick={(node) => setEditTarget({ node, isNew: false })}
        onDeleteClick={(node) => { void onDelete(node.iusuario); }}
      />

      <HierarchyEditDialog
        target={editTarget}
        busy={busy}
        onClose={() => setEditTarget(null)}
        onSave={async (name: string, jer: string) => {
          if (editTarget?.isNew) await onCreate(name, jer);
          else if (editTarget) await onSave(editTarget.node.iusuario, jer);
          setEditTarget(null);
        }}
      />
    </Box>
  );
}

interface HierarchyEditDialogProps {
  target: EditTarget;
  busy: boolean;
  onClose: () => void;
  onSave: (name: string, jerarquia: string) => Promise<void>;
}

function HierarchyEditDialog({ target, busy, onClose, onSave }: HierarchyEditDialogProps): React.ReactElement | null {
  const isNew = target?.isNew ?? false;
  const [name, setName] = useState<string>(target?.node.iusuario ?? "");
  const [jerarquia, setJerarquia] = useState<string>(target?.node.jerarquia ?? "");
  const [err, setErr] = useState<string>("");

  React.useEffect(() => {
    setName(target?.node.iusuario ?? "");
    setJerarquia(target?.node.jerarquia ?? "");
    setErr("");
  }, [target]);

  if (!target) return null;

  const handleSubmit = async (): Promise<void> => {
    setErr("");
    const trimmedName = String(name ?? "").trim();
    const trimmedJer = String(jerarquia ?? "").trim();
    if (!trimmedName) { setErr("nombre requerido"); return; }
    if (!trimmedJer) { setErr("jerarquía requerida"); return; }
    if (!/^[0-9]+(\.[0-9]+)*$/.test(trimmedJer)) { setErr("jerarquía inválida (formato: 0, 0.0, 0.1.1)"); return; }
    try { await onSave(trimmedName, trimmedJer); }
    catch (e) { setErr((e as Error)?.message ?? String(e)); }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isNew ? "Nuevo rol hijo" : `Editar ${target.node.iusuario}`}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {err ? <Alert severity="error">{err}</Alert> : null}
          <TextField label="Nombre" value={name} onChange={(e) => setName(e.target.value)} disabled={!isNew} helperText="minúsculas, sin espacios (ej. dev_lead)" />
          <TextField label="Jerarquía" value={jerarquia} onChange={(e) => setJerarquia(e.target.value)} helperText="dot-notation: 0, 0.0, 0.1.1, ..." />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={busy}>{busy ? <CircularProgress size={16} /> : "Guardar"}</Button>
      </DialogActions>
    </Dialog>
  );
}
