import { getMaterialUI, getReact, Session, toastError, toastSuccess, Assets } from "../core/platform.ts";
import { ButtonIconify } from "../ui/shared.jsx";
import { fetchPermisos, putPermisoRolePath, patchUsuarioRoles, createPermisoRole, requireAppSession,
} from "../api/systemConfigApi.ts";
import { searchScrumAppUsers } from "../api/todosApi.ts";
import { buildPermisosBoard, roleNameFromEntry, roleTitleFromEntry, VISITANTE } from "./permisosKanbanShared.js";
import { PermisosKanban } from "./PermisosKanban.jsx";
import { RoleConfigFullscreenDialog } from "./permisosRoleConfig.jsx";
import { buildVisitanteConfigColumn } from "./permisosVisitante.js";

const { useState, useEffect, useCallback, useMemo } = getReact();
const { Typography, TextField, Stack, Alert, CircularProgress, Box, Chip, FormControl, InputLabel, Select, MenuItem } = getMaterialUI();

export function PermisosPanel({ onNeedLogin }) {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [canEditRoleDescriptions, setCanEditRoleDescriptions] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState({ roles: [], users: [] });
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [newRole, setNewRole] = useState("");
  const [visitanteOpen, setVisitanteOpen] = useState(false);

  const [userDirectory, setUserDirectory] = useState(null);

  const applyFlags = useCallback((result) => {
    setCanManage(!!result.canManage);
    setCanEditRoleDescriptions(!!result.canEditRoleDescriptions);
  }, []);

  const load = useCallback(async () => {
    setLoading(true); setErr("");
    try {
      const result = await fetchPermisos();
      setData(result);
      applyFlags(result);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally { setLoading(false); }
  }, [applyFlags]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    let cancelled = false;
    searchScrumAppUsers("", 300).then((users) => {
      if (cancelled) return;
      const map = {};
      for (const u of users) {
        const key = String(u.username ?? "").trim().toUpperCase();
        if (key) map[key] = u.displayName;
      }
      setUserDirectory(map);
    }).catch(() => { if (!cancelled) setUserDirectory({}); });
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    Assets.ensureTodosCss();
    const onAuth = () => { load(); };
    window.addEventListener(Session.EVENT, onAuth);
    return () => window.removeEventListener(Session.EVENT, onAuth);
  }, [load]);

  async function run(fn, okMsg) {
    if (!requireAppSession(onNeedLogin)) return;
    setBusy(true); setErr("");
    try {
      const result = await fn();
      setData(result);
      applyFlags(result);
      if (okMsg) toastSuccess(okMsg);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg); toastError(msg);
    } finally { setBusy(false); }
  }

  const roleOptions = useMemo(
    () => (data.roles || [])
      .map((r) => ({ id: roleNameFromEntry(r), label: roleTitleFromEntry(r) }))
      .filter((r) => r.id && r.id !== VISITANTE),
    [data.roles],
  );
  const boardData = useMemo(
    () => buildPermisosBoard(data, { userSearch, roleFilter, userDirectory }),
    [data, userSearch, roleFilter, userDirectory],
  );
  const visitanteColumn = useMemo(() => buildVisitanteConfigColumn(data), [data]);
  const readOnly = !canManage;

  if (loading) return <Box className="config-permisos-loading"><CircularProgress size={26} /></Box>;

  return (
    <Box className="paty-todos-shell paty-permisos-shell custom-scrollbar" sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <Stack className="config-permisos-toolbar" direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
        <TextField size="small" label="Buscar usuario" placeholder="Usuario" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="config-permisos-toolbar__field config-permisos-toolbar__field--search" />
        <FormControl size="small" className="config-permisos-toolbar__field config-permisos-toolbar__field--role">
          <InputLabel id="permisos-role-filter-label" shrink>Rol</InputLabel>
          <Select labelId="permisos-role-filter-label" label="Rol" value={roleFilter} displayEmpty
            onChange={(e) => setRoleFilter(e.target.value)}
            renderValue={(v) => (v ? v : "Todos")}>
            <MenuItem value="">Todos</MenuItem>
            {roleOptions.map((r) => <MenuItem key={r.id} value={r.id}>{r.label}</MenuItem>)}
          </Select>
        </FormControl>
        {(userSearch || roleFilter) ? <Chip size="small" variant="outlined" label="Filtros" onDelete={() => { setUserSearch(""); setRoleFilter(""); }} /> : null}
        <Box sx={{ flex: 1, minWidth: 8 }} />
        <ButtonIconify icon="mdi:account-outline" className="config-permisos-visitante-btn" title="Configurar rol visitante"
          label="Visitante" onClick={() => setVisitanteOpen(true)} />
        <Stack direction="row" spacing={0.5} alignItems="center" className="config-form-section__actions">
          <ButtonIconify icon="mdi:refresh" title="Recargar" onClick={load} disabled={busy} />
          {canManage ? (
            <>
              <TextField size="small" label="Nuevo rol" value={newRole} onChange={(e) => setNewRole(e.target.value)} sx={{ width: 132 }} />
              <ButtonIconify icon="mdi:plus" title="Crear rol" label="Crear" disabled={busy || !newRole.trim()}
                onClick={() => run(() => createPermisoRole(newRole.trim()), `Rol ${newRole.trim()} creado`).then(() => setNewRole(""))} />
            </>
          ) : null}
        </Stack>
      </Stack>

      {err ? <Alert severity="warning" className="config-form-alert config-permisos-alert">{err}</Alert> : null}

      <Box className="paty-permisos-kanban-wrap-outer" sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        <PermisosKanban boardData={boardData} readOnly={readOnly} canManage={canManage} canEditRoleDescriptions={canEditRoleDescriptions} busy={busy}
          onRoleSave={({ name, permisos }) => run(() => putPermisoRolePath(name, permisos), `Rol ${name} guardado`)}
          onRoleDrag={({ username, fromRole, toRole, mode }) => run(() => patchUsuarioRoles(username, { fromRole, toRole, mode }), `${username} → ${toRole}`)} />
      </Box>

      <RoleConfigFullscreenDialog open={visitanteOpen} column={visitanteColumn} canManage={canManage}
        canEditRoleDescriptions={canEditRoleDescriptions} busy={busy} onClose={() => setVisitanteOpen(false)}
        onSave={({ name, permisos }) => run(() => putPermisoRolePath(name, permisos), "Rol visitante guardado").then(() => setVisitanteOpen(false))} />
    </Box>
  );
}
