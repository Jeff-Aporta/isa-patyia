/**
 * Editor de permisos con breadcrumb (miga de pan) y soporte para promover valores.
 *
 * - Breadcrumb muestra la ruta de ancestros desde visitante hasta el nodo actual.
 * - Permisos del nodo actual se muestran editables.
 * - Permisos heredados de ancestros aparecen como "bloqueados" con mensaje y
 *   botón "Subir a la herencia" para mover el valor al ancestro correspondiente.
 */

import * as React from "react";
import { getMaterialUI, getReact, UI, toastError, toastSuccess } from "../../core/platform.ts";

const { useState, useMemo, useCallback, useEffect } = getReact();
const { Box, Stack, Typography, Breadcrumbs, Link, Chip, IconButton, Tooltip, Button, TextField, Alert, CircularProgress } = getMaterialUI();
const { Icon } = UI;

import { ancestorsFromPath } from "../roleHierarchy.js";
import type { HierarchyNode } from "./types.js";

export type ResolvedPerm = {
  key: string;
  value: unknown;
  ownerJerarquia: string;
  isLocal: boolean;
  isInherited: boolean;
};

const META_KEYS = new Set(["descripcion", "namedisplay", "jerarquia"]);

function isMetaKey(k: string): boolean {
  return META_KEYS.has(k) || k === "*" || k === "impersonate" || k === "manage_permissions" || k === "manage_sampling";
}

function flattenPerms(permisos: Record<string, unknown>, jerarquia: string, isLocal: boolean): ResolvedPerm[] {
  const out: ResolvedPerm[] = [];
  for (const [k, v] of Object.entries(permisos ?? {})) {
    if (k.startsWith(":")) continue;
    out.push({ key: k, value: v, ownerJerarquia: jerarquia, isLocal, isInherited: !isLocal });
  }
  return out;
}

export interface RolePermissionsEditorProps {
  currentNode: HierarchyNode;
  allNodes: HierarchyNode[];
  busy: boolean;
  onSaveLocal: (key: string, value: unknown) => Promise<void>;
  onPromote: (key: string, value: unknown, fromJer: string, toJer: string) => Promise<void>;
  onClose: () => void;
}

export function RolePermissionsEditor(props: RolePermissionsEditorProps): React.ReactElement {
  const { currentNode, allNodes, busy, onSaveLocal, onPromote, onClose } = props;

  const byJer: Map<string, HierarchyNode> = useMemo(
    () => new Map(allNodes.map((n: HierarchyNode) => [n.jerarquia, n])),
    [allNodes],
  );
  const pathAncestors: string[] = useMemo(
    () => [...ancestorsFromPath(currentNode.jerarquia)].reverse(),
    [currentNode.jerarquia],
  );

  const [resolved, setResolved] = useState<ResolvedPerm[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    (() => {
      setLoading(true);
      const merged: Record<string, { value: unknown; owner: string }> = {};
      // Ordenar ancestros de más lejano a más cercano, terminando con el nodo actual.
      const orderedJers: string[] = pathAncestors;
      for (const ancJer of orderedJers) {
        const node = byJer.get(ancJer);
        if (!node) continue;
        for (const [k, v] of Object.entries((node as HierarchyNode & { permisos?: Record<string, unknown> }).permisos ?? {})) {
          if (k.startsWith(":")) continue;
          if (k === "*" || k === "impersonate" || k === "manage_permissions" || k === "manage_sampling") {
            if (v === true) merged[k] = { value: true, owner: ancJer };
            continue;
          }
          merged[k] = { value: v, owner: ancJer };
        }
      }
      if (cancelled) return;
      const out: ResolvedPerm[] = Object.entries(merged).map(([k, { value, owner }]) => ({
        key: k,
        value,
        ownerJerarquia: owner,
        isLocal: owner === currentNode.jerarquia,
        isInherited: owner !== currentNode.jerarquia,
      }));
      out.sort((a, b) => {
        if (a.isInherited !== b.isInherited) return a.isInherited ? -1 : 1;
        return a.key.localeCompare(b.key);
      });
      setResolved(out);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [currentNode.jerarquia, pathAncestors, byJer]);

  const handlePromote = useCallback(async (perm: ResolvedPerm, targetJer: string) => {
    try {
      await onPromote(perm.key, perm.value, perm.ownerJerarquia, targetJer);
      toastSuccess?.(`${perm.key} promovido a ${targetJer}`);
    } catch (e) {
      toastError?.(String(e));
    }
  }, [onPromote]);

  const startEdit = useCallback((perm: ResolvedPerm) => {
    setEditingKey(perm.key);
    setEditingValue(typeof perm.value === "string" ? perm.value : JSON.stringify(perm.value));
  }, []);

  const saveEdit = useCallback(async () => {
    if (!editingKey) return;
    let value: unknown = editingValue;
    if (typeof value === "string" && (value.trim().startsWith("{") || value.trim().startsWith("["))) {
      try { value = JSON.parse(value); } catch { /* mantener como string */ }
    }
    try {
      await onSaveLocal(editingKey, value);
      setEditingKey(null);
      toastSuccess?.(`${editingKey} guardado`);
    } catch (e) {
      toastError?.(String(e));
    }
  }, [editingKey, editingValue, onSaveLocal]);

  return (
    <Box className="role-permissions-editor" sx={{ display: "flex", flexDirection: "column", gap: 1.5, p: 2 }}>
      <Breadcrumbs separator="›" sx={{ fontSize: 13 }}>
        {pathAncestors.slice(0, -1).map((j) => (
          <Link key={j} underline="hover" color="inherit">{j}</Link>
        ))}
        <Typography color="text.primary" fontWeight={700}>{currentNode.jerarquia}</Typography>
      </Breadcrumbs>

      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="h6" sx={{ flex: 1 }}>
          {currentNode.namedisplay ?? currentNode.iusuario}
        </Typography>
        <Chip size="small" label={currentNode.jerarquia} />
        <Button onClick={onClose} size="small" sx={{ textTransform: "none" }}>Cerrar</Button>
      </Stack>

      {currentNode.descripcion ? (
        <Typography variant="body2" color="text.secondary">{currentNode.descripcion}</Typography>
      ) : null}

      <Typography variant="subtitle2">Permisos efectivos</Typography>
      {loading ? <CircularProgress size={20} /> : (
        <Stack spacing={0.5}>
          {resolved.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>Sin permisos.</Typography>
          ) : null}
          {resolved.map((perm) => (
            <Box key={perm.key} sx={{
              p: 1,
              border: 1,
              borderColor: perm.isInherited ? "warning.light" : "divider",
              borderRadius: 1,
              backgroundColor: perm.isInherited ? "warning.50" : "transparent",
              opacity: perm.isInherited ? 0.85 : 1,
            }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontFamily="monospace" noWrap title={perm.key}>{perm.key}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }} title={JSON.stringify(perm.value)}>
                    {JSON.stringify(perm.value).slice(0, 100)}
                  </Typography>
                </Box>
                {perm.isInherited ? (
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Tooltip title={`Viene de ${perm.ownerJerarquia} (no editable aquí)`}>
                      <Chip size="small" color="warning" label={`🔒 ${perm.ownerJerarquia}`} />
                    </Tooltip>
                    <Tooltip title={`Promover a ${perm.ownerJerarquia} para poder editarlo allí`}>
                      <Button
                        size="small"
                        startIcon={<iconify-icon icon="mdi:arrow-up-bold" width="14" height="14" />}
                        onClick={() => handlePromote(perm, perm.ownerJerarquia)}
                        disabled={busy}
                        sx={{ textTransform: "none" }}
                      >
                        Subir a la herencia
                      </Button>
                    </Tooltip>
                  </Stack>
                ) : (
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Chip size="small" color="primary" label="local" />
                    {editingKey === perm.key ? (
                      <>
                        <Button size="small" onClick={saveEdit} disabled={busy}>Guardar</Button>
                        <Button size="small" onClick={() => setEditingKey(null)}>Cancelar</Button>
                      </>
                    ) : (
                      <Tooltip title="Editar valor">
                        <IconButton size="small" onClick={() => startEdit(perm)} disabled={busy} aria-label="Editar">
                          <iconify-icon icon="mdi:pencil" width="16" height="16" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                )}
              </Stack>
              {editingKey === perm.key ? (
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  sx={{ mt: 1 }}
                  size="small"
                />
              ) : null}
              {perm.isInherited ? (
                <Alert severity="warning" sx={{ mt: 0.5, py: 0 }} icon={<iconify-icon icon="mdi:lock-outline" width="16" height="16" />}>
                  Setear en la herencia: {perm.ownerJerarquia}
                </Alert>
              ) : null}
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}