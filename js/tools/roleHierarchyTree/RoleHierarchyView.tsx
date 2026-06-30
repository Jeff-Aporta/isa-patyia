/** Vista principal del árbol de jerarquía de roles — consume TreeView genérico. */



import * as React from "react";

import { getMaterialUI, getReact, getIsaSplitView, UI } from "../../core/platform.ts";



const { useState, useMemo, useCallback, useEffect } = getReact();

const { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, CircularProgress, Stack, Chip } = getMaterialUI();



import { TreeView } from "../../ui/treeView/index.ts";

import { RoleConfigEditor } from "../permisosRoleConfig.jsx";
import { enforceVisitantePermisos, getVisitanteRoleEntry, isVisitanteRole } from "../permisosVisitante.js";
import { roleNameFromEntry } from "../permisosKanbanShared.js";
import { ROLE_HIERARCHY_MANIFEST, createRoleHierarchyCustoms } from "./roleHierarchyTreeConfig.js";

import type { HierarchyNode } from "./types.js";

const EMPTY_PERMISOS: Record<string, unknown> = Object.freeze({});

export interface RoleHierarchyViewProps {

  nodes: HierarchyNode[];

  roleEntries?: Array<{ iusuario: string; itipo?: string; permisos?: Record<string, unknown>; bactivo?: boolean }>;

  canManagePermisos?: boolean;

  canEditRoleDescriptions?: boolean;

  initialSelectedRole?: string | null;

  onSaveRolePermisos?: (name: string, permisos: Record<string, unknown>, bactivo?: boolean) => Promise<void>;

  canMutate: boolean;

  busy: boolean;

  onSave: (name: string, jerarquia: string) => Promise<void>;

  onSaveLocalPerm: (nodeJer: string, key: string, value: unknown) => Promise<void>;

  onPromote: (key: string, value: unknown, fromJer: string, toJer: string) => Promise<void>;

  onCreate: (name: string, jerarquia: string) => Promise<void>;

  onDelete: (name: string) => Promise<void>;

}



type EditTarget = { node: HierarchyNode; isNew: boolean } | null;



export function RoleHierarchyView(props: RoleHierarchyViewProps): React.ReactElement {

  const { nodes, roleEntries, canManagePermisos, canEditRoleDescriptions, initialSelectedRole, onSaveRolePermisos, canMutate, busy, onSave, onSaveLocalPerm, onPromote, onCreate, onDelete } = props;



  const [selectedJer, setSelectedJer] = useState<string | null>(null);

  const [editTarget, setEditTarget] = useState<EditTarget>(null);

  const [visitanteDraft, setVisitanteDraft] = useState<Record<string, unknown> | null>(null);

  const [visitanteSaving, setVisitanteSaving] = useState(false);

  const [roleDraft, setRoleDraft] = useState<Record<string, unknown> | null>(null);

  const [roleSaving, setRoleSaving] = useState(false);



  const currentEditNode: HierarchyNode | null = useMemo(

    () => (selectedJer ? nodes.find((n) => n.jerarquia === selectedJer) ?? null : null),

    [selectedJer, nodes],

  );

  const visitanteEntry = useMemo(() => getVisitanteRoleEntry({ roles: roleEntries ?? [] }), [roleEntries]);

  const currentRoleEntry = useMemo(() => {
    if (!currentEditNode) return null;
    const key = String(currentEditNode.iusuario ?? "").trim().toLowerCase();
    return (roleEntries ?? []).find((e) => roleNameFromEntry(e) === key) ?? { iusuario: key, permisos: EMPTY_PERMISOS, bactivo: true };
  }, [currentEditNode, roleEntries]);

  const visitantePermisosSig = useMemo(
    () => JSON.stringify(visitanteEntry.permisos ?? EMPTY_PERMISOS),
    [visitanteEntry.permisos],
  );

  const rolePermisosSig = useMemo(
    () => (currentRoleEntry ? JSON.stringify(currentRoleEntry.permisos ?? EMPTY_PERMISOS) : ""),
    [currentRoleEntry],
  );

  const roleEditorEntry = useMemo(() => {
    if (!currentRoleEntry) return null;
    const permisos = roleDraft ?? currentRoleEntry.permisos ?? EMPTY_PERMISOS;
    return { ...currentRoleEntry, permisos };
  }, [currentRoleEntry, roleDraft]);

  useEffect(() => {
    if (!initialSelectedRole || !nodes.length) return;
    const key = String(initialSelectedRole).trim().toLowerCase();
    const node = nodes.find((n) => String(n.iusuario ?? "").trim().toLowerCase() === key);
    if (node?.jerarquia) setSelectedJer((prev) => (prev === node.jerarquia ? prev : node.jerarquia));
  }, [initialSelectedRole, nodes]);

  useEffect(() => {
    if (!currentEditNode || !isVisitanteRole(currentEditNode.iusuario)) {
      setVisitanteDraft(null);
      return;
    }
    setVisitanteDraft(enforceVisitantePermisos(visitanteEntry.permisos ?? EMPTY_PERMISOS));
  }, [currentEditNode?.iusuario, currentEditNode?.jerarquia, visitantePermisosSig]);

  useEffect(() => {
    if (!currentEditNode || isVisitanteRole(currentEditNode.iusuario)) {
      setRoleDraft(null);
      return;
    }
    setRoleDraft({ ...(currentRoleEntry?.permisos ?? EMPTY_PERMISOS) });
  }, [currentEditNode?.iusuario, currentEditNode?.jerarquia, rolePermisosSig, currentRoleEntry]);



  const openCreateDialog = useCallback(() => {

    setEditTarget({

      isNew: true,

      node: { iusuario: "", jerarquia: "", namedisplay: null, descripcion: null },

    });

  }, []);



  const customs = useMemo(

    () => createRoleHierarchyCustoms({

      items: nodes,

      canMutate,

      onSave,

      onDelete,

      onEdit: (node) => setEditTarget({ node, isNew: false }),

      onCreateClick: openCreateDialog,

    }),

    [nodes, canMutate, onSave, onDelete, openCreateDialog],

  );



  const typedNodes = nodes as (HierarchyNode & Record<string, unknown>)[];

  const countLabel = `${nodes.length} rol${nodes.length !== 1 ? "es" : ""}`;

  const manifest = useMemo(() => ({ ...ROLE_HIERARCHY_MANIFEST, countLabel }), [countLabel]);



  const IsaSplitView = getIsaSplitView();



  const treePanel = (

    <TreeView

      items={typedNodes}

      manifest={manifest}

      customs={customs}

      readonly={!canMutate}

      busy={busy}

      selectedPath={selectedJer}

      onSelectedPathChange={setSelectedJer}

      toolbarTitle="Jerarquía de roles"

      className="role-hierarchy-tree-panel"

      showToolbar

    />

  );



  const editorPanel = currentEditNode ? (
    isVisitanteRole(currentEditNode.iusuario) ? (
      <Box className="role-hierarchy-visitante-editor" sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "auto" }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2, pt: 2, pb: 1, flexShrink: 0 }}>
          <Typography variant="h6" sx={{ flex: 1 }}>{currentEditNode.namedisplay ?? "Visitante"}</Typography>
          <Chip size="small" label={currentEditNode.jerarquia} />
        </Stack>
        <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", px: 2, pb: 2 }}>
          <RoleConfigEditor
            entry={visitanteEntry}
            roleName="visitante"
            canManage={!!canManagePermisos}
            canEditRoleDescriptions={!!canEditRoleDescriptions}
            onChange={(permisos) => setVisitanteDraft(enforceVisitantePermisos(permisos))}
          />
        </Box>
        {(canManagePermisos || canEditRoleDescriptions) && onSaveRolePermisos ? (
          <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ px: 2, py: 1.5, flexShrink: 0, borderTop: 1, borderColor: "divider" }}>
            <Button
              variant="contained"
              disabled={busy || visitanteSaving || !visitanteDraft}
              onClick={async () => {
                if (!visitanteDraft) return;
                setVisitanteSaving(true);
                try {
                  await onSaveRolePermisos("visitante", visitanteDraft, visitanteEntry.bactivo !== false);
                } finally {
                  setVisitanteSaving(false);
                }
              }}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              {visitanteSaving ? <CircularProgress size={18} color="inherit" /> : "Guardar visitante"}
            </Button>
          </Stack>
        ) : null}
      </Box>
    ) : (
    <Box className="role-hierarchy-role-editor" sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "auto" }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2, pt: 2, pb: 1, flexShrink: 0 }}>
        <Typography variant="h6" sx={{ flex: 1 }}>{currentEditNode.namedisplay ?? currentEditNode.iusuario}</Typography>
        <Chip size="small" label={currentEditNode.jerarquia} />
      </Stack>
      <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", px: 2, pb: 2 }}>
        <RoleConfigEditor
          entry={roleEditorEntry ?? { iusuario: currentEditNode.iusuario, permisos: EMPTY_PERMISOS, bactivo: true }}
          roleName={currentEditNode.iusuario}
          canManage={!!canManagePermisos}
          canEditRoleDescriptions={!!canEditRoleDescriptions}
          onChange={(permisos) => setRoleDraft(permisos)}
        />
      </Box>
      {(canManagePermisos || canEditRoleDescriptions) && onSaveRolePermisos ? (
        <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ px: 2, py: 1.5, flexShrink: 0, borderTop: 1, borderColor: "divider" }}>
          <Button
            variant="contained"
            disabled={busy || roleSaving || !roleDraft}
            onClick={async () => {
              if (!roleDraft) return;
              setRoleSaving(true);
              try {
                await onSaveRolePermisos(currentEditNode.iusuario, roleDraft, currentRoleEntry?.bactivo !== false);
              } finally {
                setRoleSaving(false);
              }
            }}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            {roleSaving ? <CircularProgress size={18} color="inherit" /> : "Guardar rol"}
          </Button>
        </Stack>
      ) : null}
    </Box>
    )
  ) : (

    <Box sx={{ p: 4, textAlign: "center", color: "text.secondary", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>

      <iconify-icon icon="mdi:family-tree" width="48" height="48" />

      <Typography variant="body1" sx={{ mt: 2 }}>Selecciona un rol del árbol — visitante incluye editor de permisos completo.</Typography>

      {!canMutate ? (

        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>

          (Solo roles de branch 0 pueden editar la jerarquía.)

        </Typography>

      ) : null}

    </Box>

  );



  return (

    <Box className="role-hierarchy-tree isp-tree-host" sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>

      <IsaSplitView

        className="role-hierarchy-split"

        sx={{ flex: 1, minHeight: 0 }}

        panelClassName="role-hierarchy-tree-panel"

        storageKey="isa-patyia:role-hierarchy-tree-w"

        defaultWidth={360}

        minWidth={260}

        maxWidth={560}

        panelTitle="Jerarquía de roles"

        panelIcon="mdi:family-tree"

        UI={UI}

        panel={treePanel}

      >

        <Box className="role-hierarchy-editor-panel" sx={{ flex: 1, minWidth: 0, minHeight: 0, overflow: "auto", height: "100%" }}>

          {editorPanel}

        </Box>

      </IsaSplitView>



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

  const [jerarquia, setJerarquia] = useState<string>(isNew ? "" : target?.node.jerarquia ?? "");

  const [err, setErr] = useState<string>("");



  React.useEffect(() => {

    setName(target?.node.iusuario ?? "");

    setJerarquia(isNew ? "" : target?.node.jerarquia ?? "");

    setErr("");

  }, [target, isNew]);



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

      <DialogTitle>{isNew ? "Nuevo rol" : `Mover ${target.node.iusuario}`}</DialogTitle>

      <DialogContent dividers>

        <Stack spacing={2}>

          {err ? <Alert severity="error">{err}</Alert> : null}

          <TextField label="Nombre" value={name} onChange={(e) => setName(e.target.value)} disabled={!isNew} helperText="minúsculas, sin espacios (ej. dev_lead)" />

          <TextField label="Nueva jerarquía" value={jerarquia} onChange={(e) => setJerarquia(e.target.value)} helperText="dot-notation: 0, 0.0, 0.1.1, ..." />

          <Alert severity="info">Los ancestros se derivan del path. Arrastra un rol sobre otro (antes / dentro / después) para reubicarlo.</Alert>

        </Stack>

      </DialogContent>

      <DialogActions>

        <Button onClick={onClose} disabled={busy}>Cancelar</Button>

        <Button variant="contained" onClick={handleSubmit} disabled={busy}>{busy ? <CircularProgress size={16} /> : "Guardar"}</Button>

      </DialogActions>

    </Dialog>

  );

}

