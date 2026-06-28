import { getMaterialUI, getReact, Session, toastError, toastSuccess, Assets, getGlass } from "../core/platform.ts";
import { ButtonIconify } from "../ui/shared.jsx";
import { fetchPermisos, putPermisoRolePath, patchUsuarioRoles, removeUsuarioRole, addUsuarioRole, requireAppSession,
} from "../api/systemConfigApi.ts";
import { searchScrumAppUsers } from "../api/todosApi.ts";
import { buildPermisosBoard, roleNameFromEntry, roleTitleFromEntry, VISITANTE } from "./permisosKanbanShared.js";
import { PermisosKanban } from "./PermisosKanban.jsx";
import { RoleConfigFullscreenDialog } from "./permisosRoleConfig.jsx";
import { buildVisitanteConfigColumn } from "./permisosVisitante.js";
import { PermisosRoleFilterAutocomplete } from "./PermisosRoleFilterAutocomplete.jsx";

const { useState, useEffect, useCallback, useMemo, useRef } = getReact();
const { Typography, TextField, Stack, Alert, CircularProgress, Box, Chip } = getMaterialUI();

export function PermisosPanel({ onNeedLogin }) {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState({ roles: [], users: [] });
  const [userSearch, setUserSearch] = useState("");
  const [roleFilters, setRoleFilters] = useState([]);
  const [visitanteOpen, setVisitanteOpen] = useState(false);
  const [filterBusy, setFilterBusy] = useState(false);
  const [dragOverFilter, setDragOverFilter] = useState(false);

  const [userDirectory, setUserDirectory] = useState(null);
  const filterToolbarRef = useRef(null);
  const filterFetchSkipRef = useRef(true);
  const filterDropFetchRef = useRef(false);
  const usersPaginated = !!data.usersTruncated;

  const applyFlags = useCallback((result) => {
    setCanManage(!!result.canManage);
  }, []);

  const load = useCallback(async () => {
    setLoading(true); setErr("");
    try {
      const result = await fetchPermisos();
      setData(result);
      applyFlags(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      toastError(msg);
    } finally { setLoading(false); }
  }, [applyFlags]);

  useEffect(() => { load(); }, [load]);

  const refreshUserDirectory = useCallback(() => {
    if (!Session.isLoggedIn()) { setUserDirectory({}); return; }
    searchScrumAppUsers("", 300).then((users) => {
      const map = {};
      for (const u of users) {
        const key = String(u.username ?? "").trim().toUpperCase();
        if (key) map[key] = u.displayName;
      }
      setUserDirectory(map);
    }).catch(() => setUserDirectory({}));
  }, []);

  useEffect(() => {
    Assets.ensureTodosCss();
    refreshUserDirectory();
    const onAuth = () => { load(); refreshUserDirectory(); };
    window.addEventListener(Session.EVENT, onAuth);
    window.addEventListener("isa-patyia:auth", onAuth);
    return () => {
      window.removeEventListener(Session.EVENT, onAuth);
      window.removeEventListener("isa-patyia:auth", onAuth);
    };
  }, [load, refreshUserDirectory]);

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
  }, [userSearch, usersPaginated, fetchPermisosWithSearch, applyFlags]);

  const roleOptions = useMemo(
    () => (data.roles || [])
      .map((r) => ({ id: roleNameFromEntry(r), label: roleTitleFromEntry(r) }))
      .filter((r) => r.id && r.id !== VISITANTE),
    [data.roles],
  );
  const boardData = useMemo(
    () => buildPermisosBoard(data, { userSearch, roleFilters, userDirectory }),
    [data, userSearch, roleFilters, userDirectory],
  );
  const visitanteColumn = useMemo(() => buildVisitanteConfigColumn(data), [data]);
  const readOnly = !canManage;
  const managePermisos = canManage;
  const filtersActive = !!(userSearch.trim() || roleFilters.length);
  const { GlassToolbar } = getGlass();

  if (loading) {
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
        <Box sx={{ flex: 1, minWidth: 8 }} />
        <Stack direction="row" spacing={0.5} alignItems="center" className="config-form-section__actions config-permisos-toolbar__actions">
          {managePermisos ? (
            <ButtonIconify icon="mdi:account-outline" className="config-permisos-visitante-btn" title="Configurar rol visitante"
              onClick={() => setVisitanteOpen(true)} />
          ) : null}
          <ButtonIconify icon="mdi:refresh" title="Recargar" onClick={load} disabled={busy || filterBusy} />
        </Stack>
      </GlassToolbar>
      </Box>

      {err ? <Alert severity="warning" className="config-form-alert config-permisos-alert">{err}</Alert> : null}

      <PermisosKanban boardData={boardData} readOnly={readOnly} canManage={managePermisos} canEditRoleDescriptions={managePermisos} busy={busy || filterBusy}
        filterToolbarRef={filterToolbarRef} onUserFilterDrop={handleUserFilterDrop} onRoleFilterDrop={handleRoleFilterDrop} onDragOverFilterChange={setDragOverFilter}
        onRoleSave={({ name, permisos, bactivo }) => run(() => putPermisoRolePath(name, permisos, bactivo), `Rol ${name} guardado`)}
        onRoleDrag={handleRoleDrag} onRoleRemove={handleRoleRemove} onRoleAdd={handleRoleAdd} />

      {managePermisos ? (
        <RoleConfigFullscreenDialog open={visitanteOpen} column={visitanteColumn} canManage={managePermisos}
          canEditRoleDescriptions={managePermisos} busy={busy} onClose={() => setVisitanteOpen(false)}
          onSave={({ name, permisos, bactivo }) => run(() => putPermisoRolePath(name, permisos, bactivo), "Rol visitante guardado").then(() => setVisitanteOpen(false))} />
      ) : null}
    </Box>
  );
}
