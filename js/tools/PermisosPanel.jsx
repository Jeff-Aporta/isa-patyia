import { getMaterialUI, getReact, Session, toastError, toastInfo, toastSuccess, Assets, getGlass } from "../core/platform.ts";
import { ButtonIconify } from "../ui/shared.jsx";
import {
  fetchPermisos, putPermisoRolePath, patchUsuarioRoles, removeUsuarioRole, addUsuarioRole, requireAppSession,
  fetchHierarchy, createHierarchyRole, updateHierarchyRole, deleteHierarchyRole,
} from "../api/systemConfigApi.ts";
import { buildPermisosBoard, roleNameFromEntry, roleTitleFromEntry, VISITANTE, actorJerarquiaFromRoles, buildRolePermisosIndex, buildUserDirectoryFromPermisos } from "./permisosKanbanShared.js";
import { actorJerarquiaFromRoles as actorJerarquiaPure } from "./roleHierarchy.js";
import { isBranchZero } from "./roleHierarchy.js";
import { PermisosKanban } from "./PermisosKanban.jsx";
import { PermisosRoleFilterAutocomplete } from "./PermisosRoleFilterAutocomplete.jsx";
import { RoleHierarchyView } from "./roleHierarchyTree/index.ts";
import { hierarchyNodesFromRoleEntries } from "./roleHierarchyTree/hierarchyFromRoles.ts";
import { GlassDialog, GlassDialogHeader, glassDialogContentSx, glassDialogActionsSx } from "../ui/GlassDialog.jsx";
import { readPermisosHideEmptyFromUrl, persistPermisosHideEmpty, subscribe } from "../core/urlState.ts";

const { useState, useEffect, useCallback, useMemo, useRef } = getReact();
const { Typography, TextField, Stack, Alert, CircularProgress, Box, Chip, DialogContent, DialogActions, Button, FormControlLabel, Switch } = getMaterialUI();

export function PermisosPanel({ onNeedLogin }) {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [canEditRoleDescriptions, setCanEditRoleDescriptions] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState({ roles: [], users: [] });
  const [userSearch, setUserSearch] = useState("");
  const [roleFilters, setRoleFilters] = useState([]);
  const [hideEmptyStacks, setHideEmptyStacks] = useState(readPermisosHideEmptyFromUrl);
  const [filterBusy, setFilterBusy] = useState(false);
  const [dragOverFilter, setDragOverFilter] = useState(false);

  const [actorJerarquia, setActorJerarquia] = useState(null);
  const [hierarchyOpen, setHierarchyOpen] = useState(false);
  const [hierarchyFocusRole, setHierarchyFocusRole] = useState(null);
  const [hierarchyNodes, setHierarchyNodes] = useState([]);
  const [hierarchyBusy, setHierarchyBusy] = useState(false);
  const filterToolbarRef = useRef(null);
  const filterFetchSkipRef = useRef(true);
  const filterDropFetchRef = useRef(false);
  const rolesRef = useRef(data.roles);
  const usersRef = useRef(data.users);
  const hierarchyLoadRef = useRef(null);
  rolesRef.current = data.roles;
  usersRef.current = data.users;
  const usersPaginated = !!data.usersTruncated;

  const applyFlags = useCallback((result) => {
    setCanManage(!!result.canManage);
    setCanEditRoleDescriptions(!!result.canEditRoleDescriptions);
    const actorRoles = Array.isArray(result.actorRoles)
      ? result.actorRoles
      : (Array.isArray(Session?.roles) ? Session.roles : []);
    const rolePermisosIdx = buildRolePermisosIndex(Array.isArray(result.roles) ? result.roles : []);
    setActorJerarquia(actorJerarquiaPure(actorRoles, rolePermisosIdx));
  }, []);

  const load = useCallback(async () => {
    setLoading(true); setErr("");
    try {
      const result = await fetchPermisos();
      if (!Array.isArray(result.roles) || result.roles.length === 0) {
        throw new Error("ISS no devolvió roles activos. Verifique modo Local (ISS :8802) o recargue tras iniciar func start.");
      }
      setData(result);
      applyFlags(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      toastError(msg);
    } finally { setLoading(false); }
  }, [applyFlags]);

  const refreshPermisos = useCallback(async () => {
    const result = await fetchPermisos();
    if (!Array.isArray(result.roles) || result.roles.length === 0) {
      throw new Error("ISS no devolvió roles activos. Verifique modo Local (ISS :8802) o recargue tras iniciar func start.");
    }
    setData(result);
    applyFlags(result);
    return result;
  }, [applyFlags]);

  const loadHierarchy = useCallback(async (fallbackRoles = rolesRef.current) => {
    if (hierarchyLoadRef.current) return hierarchyLoadRef.current;
    setHierarchyBusy(true);
    const task = (async () => {
      try {
        const r = await fetchHierarchy();
        let nodes = Array.isArray(r.roles) ? r.roles : [];
        if (!nodes.length) nodes = hierarchyNodesFromRoleEntries(fallbackRoles);
        setHierarchyNodes(nodes);
      } catch (e) {
        const nodes = hierarchyNodesFromRoleEntries(fallbackRoles);
        setHierarchyNodes(nodes);
        if (!nodes.length) {
          toastError?.((e instanceof Error ? e.message : String(e)) ?? "Error cargando jerarquía");
        }
      } finally {
        setHierarchyBusy(false);
        hierarchyLoadRef.current = null;
      }
    })();
    hierarchyLoadRef.current = task;
    return task;
  }, []);

  const openHierarchyDialog = useCallback(() => {
    setHierarchyFocusRole(null);
    setHierarchyOpen(true);
  }, []);

  const openHierarchyForRole = useCallback((roleName) => {
    const id = String(roleName ?? "").trim().toLowerCase();
    if (!id) return;
    setHierarchyFocusRole(id);
    setHierarchyOpen(true);
  }, []);

  useEffect(() => {
    if (!hierarchyOpen) return undefined;
    void loadHierarchy(rolesRef.current);
    return undefined;
  }, [hierarchyOpen, loadHierarchy]);

  const handleHierarchySave = useCallback(async (name, jerarquia) => {
    setHierarchyBusy(true);
    try {
      await updateHierarchyRole(name, { jerarquia });
      await loadHierarchy(rolesRef.current);
      await refreshPermisos();
      toastSuccess?.(`Rol ${name} actualizado`);
    } finally {
      setHierarchyBusy(false);
    }
  }, [loadHierarchy, refreshPermisos]);

  const handleHierarchyCreate = useCallback(async (name, jerarquia) => {
    setHierarchyBusy(true);
    try {
      await createHierarchyRole({ name, jerarquia });
      await loadHierarchy(rolesRef.current);
      await refreshPermisos();
      toastSuccess?.(`Rol ${name} creado`);
    } finally {
      setHierarchyBusy(false);
    }
  }, [loadHierarchy, refreshPermisos]);

  // Promover un permiso de su ownerJer actual al ancestro targetJer:
  // eliminamos el permiso del owner y lo añadimos al target.
  const handleHierarchyPromote = useCallback(async (key, value, fromJer, toJer) => {
    setHierarchyBusy(true);
    try {
      // Aquí necesitaríamos un endpoint de update per-perm. Como hoy no existe,
      // mostramos error claro al usuario (el endpoint se diseñará en iteración futura).
      throw new Error(`Promover permisos entre roles aún no soportado en backend (${fromJer} → ${toJer})`);
    } finally {
      setHierarchyBusy(false);
    }
  }, []);

  // Editar permiso local del nodo actual
  const handleHierarchyLocalPerm = useCallback(async (nodeJer, key, value) => {
    setHierarchyBusy(true);
    try {
      // El backend actual no expone edit-per-perm por rol. Marcamos como pendiente.
      throw new Error(`Edición de permisos individuales aún no soportada en backend (${nodeJer}: ${key})`);
    } finally {
      setHierarchyBusy(false);
    }
  }, []);

  const handleHierarchyDelete = useCallback(async (name) => {
    setHierarchyBusy(true);
    try {
      await deleteHierarchyRole(name);
      await loadHierarchy(rolesRef.current);
      await refreshPermisos();
      toastSuccess?.(`Rol ${name} eliminado`);
    } finally {
      setHierarchyBusy(false);
    }
  }, [loadHierarchy, refreshPermisos]);

  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => { loadRef.current(); }, []);

  useEffect(() => subscribe((snap) => {
    const permisos = snap.config?.permisos;
    const hide = permisos && typeof permisos === "object" && permisos.hideEmpty === true;
    setHideEmptyStacks((prev) => (prev === hide ? prev : hide));
  }), []);

  const setHideEmptyStacksPersist = useCallback((hide) => {
    setHideEmptyStacks(hide);
    persistPermisosHideEmpty(hide);
  }, []);

  const userDirectory = useMemo(() => buildUserDirectoryFromPermisos(data.users), [data.users]);

  useEffect(() => {
    Assets.ensureTodosCss();
    const onAuth = () => { loadRef.current(); };
    window.addEventListener(Session.EVENT, onAuth);
    window.addEventListener("isa-patyia:auth", onAuth);
    return () => {
      window.removeEventListener(Session.EVENT, onAuth);
      window.removeEventListener("isa-patyia:auth", onAuth);
    };
  }, []);

  async function run(fn, okMsg) {
    if (!requireAppSession(onNeedLogin)) return;
    setBusy(true); setErr("");
    try {
      const result = await fn();
      setData(result);
      applyFlags(result);
      if (okMsg) toastSuccess(okMsg);
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg); toastError(msg);
      throw e;
    } finally { setBusy(false); }
  }

  const handleRoleRemove = useCallback(async ({ username, role, roleTitle }) => {
    if (!requireAppSession(onNeedLogin)) throw new Error("Sesión requerida");
    setErr("");
    try {
      const result = await removeUsuarioRole(username, role);
      setData(result);
      applyFlags(result);
      toastSuccess(`${username} quitó ${roleTitle || role}`);
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg); toastError(msg);
      throw e;
    }
  }, [onNeedLogin, applyFlags]);

  const handleRoleAdd = useCallback(async ({ username, role, roleTitle }) => {
    if (!requireAppSession(onNeedLogin)) throw new Error("Sesión requerida");
    setErr("");
    try {
      const result = await addUsuarioRole(username, role);
      setData(result);
      applyFlags(result);
      toastSuccess(`${username} → ${roleTitle || role}`);
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg); toastError(msg);
      throw e;
    }
  }, [onNeedLogin, applyFlags]);

  const handleRoleDrag = useCallback(async ({ username, fromRole, toRole, mode }) => {
    if (!requireAppSession(onNeedLogin)) throw new Error("Sesión requerida");
    setErr("");
    try {
      const result = await patchUsuarioRoles(username, { fromRole, toRole, mode });
      setData(result);
      applyFlags(result);
      toastSuccess(`${username} → ${toRole}`);
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg); toastError(msg);
      throw e;
    }
  }, [onNeedLogin, applyFlags]);

  const fetchPermisosWithSearch = useCallback(async (search) => {
    const q = String(search ?? "").trim();
    return fetchPermisos(q ? { search: q } : undefined);
  }, []);

  const handleUserFilterDrop = useCallback(async (username) => {
    const q = String(username ?? "").trim();
    if (!q) return;
    setUserSearch(q);
    if (!usersPaginated) return;
    filterDropFetchRef.current = true;
    setFilterBusy(true); setErr("");
    try {
      const result = await fetchPermisosWithSearch(q);
      setData(result);
      applyFlags(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg); toastError(msg);
    } finally { setFilterBusy(false); }
  }, [usersPaginated, fetchPermisosWithSearch, applyFlags]);

  const handleRoleFilterDrop = useCallback((roleId) => {
    const id = String(roleId ?? "").trim().toLowerCase();
    if (!id) return;
    setRoleFilters((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const clearFilters = useCallback(async () => {
    setUserSearch("");
    setRoleFilters([]);
    if (!usersPaginated) return;
    setFilterBusy(true); setErr("");
    try {
      const result = await fetchPermisos();
      setData(result);
      applyFlags(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg); toastError(msg);
    } finally { setFilterBusy(false); }
  }, [usersPaginated, applyFlags]);

  useEffect(() => {
    if (!usersPaginated) return undefined;
    if (filterFetchSkipRef.current) { filterFetchSkipRef.current = false; return undefined; }
    if (filterDropFetchRef.current) { filterDropFetchRef.current = false; return undefined; }
    const t = window.setTimeout(async () => {
      setFilterBusy(true); setErr("");
      try {
        const result = await fetchPermisosWithSearch(userSearch);
        setData(result);
        applyFlags(result);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setErr(msg); toastError(msg);
      } finally { setFilterBusy(false); }
    }, 320);
    return () => window.clearTimeout(t);
  }, [userSearch, usersPaginated, fetchPermisosWithSearch]);

  const roleOptions = useMemo(
    () => (data.roles || [])
      .map((r) => ({ id: roleNameFromEntry(r), label: roleTitleFromEntry(r) }))
      .filter((r) => r.id && r.id !== VISITANTE),
    [data.roles],
  );
  const boardData = useMemo(
    () => buildPermisosBoard(data, { userSearch, roleFilters, userDirectory, hideEmptyColumns: hideEmptyStacks }),
    [data, userSearch, roleFilters, userDirectory, hideEmptyStacks],
  );
  const readOnly = !canManage;
  const managePermisos = canManage;
  const editRoleMeta = canEditRoleDescriptions || canManage;
  const filtersActive = !!(userSearch.trim() || roleFilters.length);
  const { GlassToolbar } = getGlass();

  const handleSaveRolePermisos = useCallback(async (name, permisos, bactivo) => {
    if (!editRoleMeta || !requireAppSession(onNeedLogin)) return;
    setBusy(true); setErr("");
    try {
      const result = await putPermisoRolePath(name, permisos, managePermisos ? bactivo : undefined);
      await loadHierarchy(rolesRef.current);
      setData(result);
      applyFlags(result);
      toastSuccess(`Rol ${name} guardado`);
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg); toastError(msg);
      throw e;
    } finally { setBusy(false); }
  }, [editRoleMeta, onNeedLogin, managePermisos, applyFlags, loadHierarchy]);

  if (loading && !hierarchyOpen) {
    return (
      <Box className="config-permisos-loading">
        <CircularProgress size={26} />
      </Box>
    );
  }

  return (
    <Box className="paty-permisos-shell" sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <Box ref={filterToolbarRef} className="config-permisos-toolbar-wrap" sx={{ flexShrink: 0 }}>
      <GlassToolbar className={`config-permisos-toolbar${dragOverFilter ? " config-permisos-toolbar--filter-drop" : ""}`} sx={{ borderRadius: 0, mb: 0, flexShrink: 0, gap: 1, px: { xs: 1.5, sm: 2 }, py: 1 }}>
        <TextField size="small" label="Buscar usuario" placeholder="Usuario" value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)} disabled={filterBusy}
          className="config-permisos-toolbar__field config-permisos-toolbar__field--search" />
        <PermisosRoleFilterAutocomplete options={roleOptions} value={roleFilters} onChange={setRoleFilters} disabled={filterBusy} />
        {filtersActive ? (
          <Chip size="small" variant="outlined" className="isa-neon-glass-chip" label="Filtros"
            onDelete={clearFilters} disabled={filterBusy} />
        ) : null}
        <FormControlLabel
          className="config-permisos-toolbar__hide-empty"
          control={<Switch size="small" checked={hideEmptyStacks} onChange={(e) => setHideEmptyStacksPersist(e.target.checked)} disabled={filterBusy} />}
          label="Ocultar vacíos"
          sx={{ mr: 0, ml: 0.5, flexShrink: 0, "& .MuiFormControlLabel-label": { fontSize: "0.8rem", whiteSpace: "nowrap" } }}
        />
        <Box sx={{ flex: 1, minWidth: 8 }} />
        <Stack direction="row" spacing={0.5} alignItems="center" className="config-form-section__actions config-permisos-toolbar__actions">
          <ButtonIconify icon="mdi:family-tree" title="Jerarquía y rol visitante" onClick={openHierarchyDialog} disabled={busy || filterBusy} />
          <ButtonIconify icon="mdi:refresh" title="Recargar" onClick={load} disabled={busy || filterBusy} />
        </Stack>
      </GlassToolbar>
      </Box>

      {err ? <Alert severity="warning" className="config-form-alert config-permisos-alert">{err}</Alert> : null}

      <PermisosKanban boardData={boardData} readOnly={readOnly} canManage={managePermisos} canEditRoleDescriptions={editRoleMeta} busy={busy || filterBusy}
        actorJerarquia={actorJerarquia}
        onJerarquiaToast={(t) => toastInfo?.(t.message) ?? alert(t.message)}
        onOpenRoleHierarchy={openHierarchyForRole}
        filterToolbarRef={filterToolbarRef} onUserFilterDrop={handleUserFilterDrop} onRoleFilterDrop={handleRoleFilterDrop} onDragOverFilterChange={setDragOverFilter}
        onRoleSave={({ name, permisos, bactivo }) => run(() => putPermisoRolePath(name, permisos, bactivo), `Rol ${name} guardado`)}
        onRoleDrag={handleRoleDrag} onRoleRemove={handleRoleRemove} onRoleAdd={handleRoleAdd} />

      <GlassDialog open={hierarchyOpen} onClose={() => { setHierarchyOpen(false); setHierarchyFocusRole(null); }} fullScreen fullWidth maxWidth={false}
        paperClassName="isa-glass-dialog--fullscreen permisos-hierarchy-dialog"
        header={<GlassDialogHeader icon="mdi:family-tree" title="Jerarquía de roles" subtitle="Visitante y permisos — solo branch 0 edita la jerarquía" accent="#10b981" onClose={() => { setHierarchyOpen(false); setHierarchyFocusRole(null); }} />}>
        <DialogContent dividers sx={Object.assign({}, glassDialogContentSx({ p: 0, flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }), { height: "100%" })}>
          <RoleHierarchyView
            nodes={hierarchyNodes}
            roleEntries={data.roles}
            initialSelectedRole={hierarchyFocusRole}
            canManagePermisos={managePermisos}
            canEditRoleDescriptions={editRoleMeta}
            onSaveRolePermisos={editRoleMeta ? handleSaveRolePermisos : undefined}
            canMutate={isBranchZero(actorJerarquia ?? "")}
            busy={hierarchyBusy}
            onSave={handleHierarchySave}
            onCreate={handleHierarchyCreate}
            onDelete={handleHierarchyDelete}
            onSaveLocalPerm={handleHierarchyLocalPerm}
            onPromote={handleHierarchyPromote}
          />
        </DialogContent>
        <DialogActions sx={glassDialogActionsSx()}>
          <Button onClick={() => setHierarchyOpen(false)} sx={{ textTransform: "none", fontWeight: 600 }}>Cerrar</Button>
        </DialogActions>
      </GlassDialog>
    </Box>
  );
}
