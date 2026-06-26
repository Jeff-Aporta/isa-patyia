import { getMaterialUI, getReact, toastError, toastSuccess } from "../core/platform.ts";
import { ButtonIconify } from "../ui/shared.jsx";
import { fetchPermisos, putPermisoRole, putPermisoUser, deletePermiso, requirePatyJwt } from "../api/systemConfigApi.ts";

const { useState, useEffect, useCallback } = getReact();
const { Paper, Typography, TextField, Stack, Alert, CircularProgress, Divider, Chip, Box } = getMaterialUI();

function prettyJson(obj) {
  try { return JSON.stringify(obj ?? {}, null, 2); } catch { return "{}"; }
}

function RoleCard({ entry, onSave, busy }) {
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

function UserRow({ entry, roleNames, onSave, onDelete, busy }) {
  const [roles, setRoles] = useState((entry.roles || []).join(", "));
  const [desc, setDesc] = useState(entry.descripcion || "");
  function save() {
    const arr = roles.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    onSave({ username: entry.iusuario, roles: arr, descripcion: desc });
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

export function PermisosPanel({ onNeedLogin }) {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState({ roles: [], users: [] });
  const [newRole, setNewRole] = useState("");
  const [newUser, setNewUser] = useState("");
  const [newUserRoles, setNewUserRoles] = useState("");

  const load = useCallback(async () => {
    const jwt = requirePatyJwt(onNeedLogin);
    if (!jwt) { setLoading(false); setErr("Inicia sesión para gestionar permisos."); return; }
    setLoading(true); setErr("");
    try {
      setData(await fetchPermisos(jwt));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally { setLoading(false); }
  }, [onNeedLogin]);

  useEffect(() => { load(); }, [load]);

  async function run(fn, okMsg) {
    const jwt = requirePatyJwt(onNeedLogin);
    if (!jwt) return;
    setBusy(true); setErr("");
    try {
      setData(await fn(jwt));
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
        Permisos por aplicación en <code>dbo.USR_PERMISSIONS</code>. Los mapas usan claves <code>METHOD:/api/path</code> con
        <code>true</code> o <code>{"{ scope: 'own'|'all' }"}</code>. Solo <code>dev_lead</code> puede editar.{" "}
        <strong>visitante</strong> es el rol por defecto: los usuarios sin fila lo heredan automáticamente (no se listan aquí).
      </Typography>

      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Roles</Typography>
      {(data.roles || []).map((r) => (
        <RoleCard key={r.iusuario} entry={r} busy={busy}
          onSave={({ name, permisos, descripcion }) => run((jwt) => putPermisoRole(name, permisos, descripcion, jwt), `Rol ${name} guardado`)} />
      ))}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <TextField label="nuevo rol" size="small" value={newRole} onChange={(e) => setNewRole(e.target.value)} />
        <ButtonIconify icon="mdi:plus" title="Crear rol" label="Crear rol" disabled={busy || !newRole.trim()}
          onClick={() => run((jwt) => putPermisoRole(newRole.trim(), {}, `Rol ${newRole.trim()}`, jwt), "Rol creado").then(() => setNewRole(""))} />
      </Stack>

      <Divider sx={{ my: 1.5 }} />
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Usuarios</Typography>
      {(data.users || []).map((u) => (
        <UserRow key={u.iusuario} entry={u} roleNames={roleNames} busy={busy}
          onSave={({ username, roles, descripcion }) => run((jwt) => putPermisoUser(username, roles, descripcion, jwt), `Usuario ${username} guardado`)}
          onDelete={(iusuario) => run((jwt) => deletePermiso(iusuario, jwt), `Eliminado ${iusuario}`)} />
      ))}
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mt: 1 }}>
        <TextField label="nuevo usuario" size="small" value={newUser} onChange={(e) => setNewUser(e.target.value)} />
        <TextField label="roles (coma)" size="small" value={newUserRoles} onChange={(e) => setNewUserRoles(e.target.value)}
          helperText={`disponibles: ${roleNames.join(", ")}`} sx={{ minWidth: 220 }} />
        <ButtonIconify icon="mdi:account-plus-outline" title="Crear usuario" label="Crear usuario" disabled={busy || !newUser.trim()}
          onClick={() => run((jwt) => putPermisoUser(newUser.trim(), newUserRoles.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean), `Usuario ${newUser.trim().toUpperCase()}`, jwt), "Usuario creado").then(() => { setNewUser(""); setNewUserRoles(""); })} />
        <ButtonIconify icon="mdi:refresh" title="Recargar" onClick={load} disabled={busy} />
      </Stack>
    </div>
  );
}
