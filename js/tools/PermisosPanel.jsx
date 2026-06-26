import { getMaterialUI, getReact, toastError, toastSuccess } from "../core/platform.ts";
import { ButtonIconify } from "../ui/shared.jsx";
import { fetchPermisos, putPermisoRole, putPermisoUser, deletePermiso } from "../api/systemConfigApi.ts";
import { loadPatyJwt } from "../core/patyia-jwt.ts";

const { useState, useEffect, useCallback } = getReact();
const { Paper, Typography, TextField, Stack, Alert, CircularProgress, Divider, Chip, Box } = getMaterialUI();

function prettyJson(obj) {
  try { return JSON.stringify(obj ?? {}, null, 2); } catch { return "{}"; }
}

function RoleCard({ entry, onSave, busy, readOnly }) {
  const name = String(entry.iusuario || "").replace(/^role:/, "");
  const [json, setJson] = useState(prettyJson(entry.permisos));
  const [desc, setDesc] = useState(entry.descripcion || "");
  const [error, setError] = useState("");
  function save() {
    let parsed;
    try { parsed = JSON.parse(json); } catch (e) { setError("JSON inválido: " + (e?.message || e)); return; }
    setError("");
    onSave({ name, permisos: parsed, descripcion: desc });
  }
  if (readOnly) {
    return (
      <Paper variant="outlined" sx={{ p: 1.5, mb: 1.5 }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: entry.descripcion ? 0.75 : 0 }}>
          <Chip label={`role:${name}`} size="small" color="primary" />
          {entry.descripcion ? <Typography variant="body2" color="text.secondary">{entry.descripcion}</Typography> : null}
        </Stack>
        <Box component="pre" sx={{ m: 0, mt: 0.75, p: 1, fontSize: 12, fontFamily: "monospace", overflow: "auto", bgcolor: "action.hover", borderRadius: 1, maxHeight: 280 }}>
          {prettyJson(entry.permisos)}
        </Box>
      </Paper>
    );
  }
  return (
    <Paper variant="outlined" sx={{ p: 1.5, mb: 1.5 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Chip label={`role:${name}`} size="small" color="primary" />
        <TextField label="descripción" size="small" value={desc} onChange={(e) => setDesc(e.target.value)} sx={{ flex: 1 }} />
        <ButtonIconify icon="mdi:content-save-outline" title="Guardar rol" label="Guardar" onClick={save} disabled={busy} busy={busy} />
      </Stack>
      {error ? <Alert severity="warning" sx={{ mb: 1 }}>{error}</Alert> : null}
      <TextField label="permisos (mapa JSON METHOD:/path → restricción)" multiline minRows={4} maxRows={18} fullWidth value={json}
        onChange={(e) => setJson(e.target.value)} InputProps={{ sx: { fontFamily: "monospace", fontSize: 12 } }} />
    </Paper>
  );
}

function UserRow({ entry, roleNames, onSave, onDelete, busy, readOnly }) {
  const [roles, setRoles] = useState((entry.roles || []).join(", "));
  const [desc, setDesc] = useState(entry.descripcion || "");
  function save() {
    const arr = roles.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    onSave({ username: entry.iusuario, roles: arr, descripcion: desc });
  }
  if (readOnly) {
    return (
      <Paper variant="outlined" sx={{ p: 1.5, mb: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Chip label={entry.iusuario} size="small" />
          {(entry.roles || []).map((r) => <Chip key={r} label={r} size="small" variant="outlined" />)}
          {entry.descripcion ? <Typography variant="body2" color="text.secondary">{entry.descripcion}</Typography> : null}
        </Stack>
      </Paper>
    );
  }
  return (
    <Paper variant="outlined" sx={{ p: 1.5, mb: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        <Chip label={entry.iusuario} size="small" />
        <TextField label="roles (coma)" size="small" value={roles} onChange={(e) => setRoles(e.target.value)} sx={{ minWidth: 220, flex: 1 }}
          helperText={`disponibles: ${roleNames.join(", ")}`} />
        <TextField label="descripción" size="small" value={desc} onChange={(e) => setDesc(e.target.value)} sx={{ minWidth: 160 }} />
        <ButtonIconify icon="mdi:content-save-outline" title="Guardar usuario" onClick={save} disabled={busy} busy={busy} />
        <ButtonIconify icon="mdi:trash-can-outline" title="Eliminar" onClick={() => onDelete(entry.iusuario)} disabled={busy} />
      </Stack>
    </Paper>
  );
}

export function PermisosPanel() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState({ roles: [], users: [] });
  const [newRole, setNewRole] = useState("");
  const [newUser, setNewUser] = useState("");
  const [newUserRoles, setNewUserRoles] = useState("");
  const readOnly = !canManage;

  const load = useCallback(async () => {
    setLoading(true); setErr("");
    try {
      const result = await fetchPermisos(loadPatyJwt());
      setData(result);
      setCanManage(!!result.canManage);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const onJwt = () => { load(); };
    window.addEventListener("isa-patyia:paty-jwt", onJwt);
    return () => window.removeEventListener("isa-patyia:paty-jwt", onJwt);
  }, [load]);

  async function run(fn, okMsg) {
    const jwt = loadPatyJwt();
    if (!jwt?.token) { toastError("JWT de portal requerido para guardar"); return; }
    setBusy(true); setErr("");
    try {
      const result = await fn(jwt);
      setData(result);
      setCanManage(!!result.canManage);
      toastSuccess(okMsg);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg); toastError(msg);
    } finally { setBusy(false); }
  }

  const roleNames = (data.roles || []).map((r) => String(r.iusuario).replace(/^role:/, ""));

  if (loading) return <Box sx={{ p: 2 }}><CircularProgress size={22} /></Box>;

  return (
    <div className="custom-scrollbar" style={{ padding: "1rem", overflow: "auto" }}>
      {err ? <Alert severity="warning" sx={{ mb: 1.5 }}>{err}</Alert> : null}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Permisos en <code>dbo.USR_PERMISSIONS</code>. Claves <code>METHOD:/api/path</code> con
        <code>true</code> o <code>{"{ scope: 'own'|'all' }"}</code>.{" "}
        {readOnly ? <>Vista de solo lectura — solo <code>dev_lead</code> puede editar.</> : <>Modo edición (<code>dev_lead</code>).</>}{" "}
        <strong>visitante</strong> es el rol por defecto (usuarios sin fila no se listan).
      </Typography>

      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ flex: 1 }}>Roles</Typography>
        <ButtonIconify icon="mdi:refresh" title="Recargar" onClick={load} disabled={busy} />
      </Stack>
      {(data.roles || []).map((r) => (
        <RoleCard key={r.iusuario} entry={r} busy={busy} readOnly={readOnly}
          onSave={({ name, permisos, descripcion }) => run((jwt) => putPermisoRole(name, permisos, descripcion, jwt), `Rol ${name} guardado`)} />
      ))}
      {!readOnly ? (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <TextField label="nuevo rol" size="small" value={newRole} onChange={(e) => setNewRole(e.target.value)} />
          <ButtonIconify icon="mdi:plus" title="Crear rol" label="Crear rol" disabled={busy || !newRole.trim()}
            onClick={() => run((jwt) => putPermisoRole(newRole.trim(), {}, `Rol ${newRole.trim()}`, jwt), "Rol creado").then(() => setNewRole(""))} />
        </Stack>
      ) : null}

      <Divider sx={{ my: 1.5 }} />
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Usuarios</Typography>
      {(data.users || []).map((u) => (
        <UserRow key={u.iusuario} entry={u} roleNames={roleNames} busy={busy} readOnly={readOnly}
          onSave={({ username, roles, descripcion }) => run((jwt) => putPermisoUser(username, roles, descripcion, jwt), `Usuario ${username} guardado`)}
          onDelete={(iusuario) => run((jwt) => deletePermiso(iusuario, jwt), `Eliminado ${iusuario}`)} />
      ))}
      {!readOnly ? (
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mt: 1 }}>
          <TextField label="nuevo usuario" size="small" value={newUser} onChange={(e) => setNewUser(e.target.value)} />
          <TextField label="roles (coma)" size="small" value={newUserRoles} onChange={(e) => setNewUserRoles(e.target.value)}
            helperText={`disponibles: ${roleNames.join(", ")}`} sx={{ minWidth: 220 }} />
          <ButtonIconify icon="mdi:account-plus-outline" title="Crear usuario" label="Crear usuario" disabled={busy || !newUser.trim()}
            onClick={() => run((jwt) => putPermisoUser(newUser.trim(), newUserRoles.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean), `Usuario ${newUser.trim().toUpperCase()}`, jwt), "Usuario creado").then(() => { setNewUser(""); setNewUserRoles(""); })} />
        </Stack>
      ) : null}
    </div>
  );
}
