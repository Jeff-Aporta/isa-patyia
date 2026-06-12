import { getReact, getMaterialUI } from "../core/runtime.ts";
import { UI, Session } from "../core/platform.ts";
import * as LabSession from "../api/labSession.ts";
import { toastSuccess, toastError, toastInfo } from "../ui/notifications.jsx";
import { useSignalRLab, SignalRStatusDot } from "../realtime/signalrLab.jsx";

const { useState, useEffect } = getReact();
const {
  Stack, Tooltip, Chip, IconButton, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, Typography, Alert, TextField,
} = getMaterialUI();

function sanitizeLoginError(raw) {
  const msg = String(raw || "").trim();
  if (!msg) return "No se pudo iniciar sesión";
  if (/main-orchestrator|workers\.dev|localhost:\d+|878\d|azure|orquestador|gateway/i.test(msg)) {
    return "No se pudo iniciar sesión";
  }
  if (/^Login falló \(\d+\)$/.test(msg)) return "Usuario o contraseña incorrectos";
  return msg;
}

/** Botón de sesión + modal login (MUI, homogéneo con jagudeloe). */
export function LoginButton({ onLoggedIn, loginOpen, onLoginOpenChange }) {
  const { Icon } = UI;
  const [openInternal, setOpenInternal] = useState(false);
  const open = loginOpen != null ? loginOpen : openInternal;
  const setOpen = onLoginOpenChange || setOpenInternal;
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [, tick] = useState(0);
  const { tip, tone, connect } = useSignalRLab();

  useEffect(() => {
    const onAuth = () => tick((n) => n + 1);
    window.addEventListener("isa-patyia:auth", onAuth);
    window.addEventListener(Session.EVENT, onAuth);
    return () => {
      window.removeEventListener("isa-patyia:auth", onAuth);
      window.removeEventListener(Session.EVENT, onAuth);
    };
  }, []);

  async function submit() {
    if (!user.trim() || !pass) {
      setErr("Usuario y contraseña requeridos");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const session = await LabSession.login(user.trim(), pass);
      setPass("");
      setOpen(false);
      toastSuccess(`Sesión iniciada · ${session.username}${session.role ? ` (${session.role})` : ""}`);
      onLoggedIn?.(session);
    } catch (e) {
      const msg = sanitizeLoginError(e instanceof Error ? e.message : String(e));
      setErr(msg);
      toastError(msg);
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    LabSession.logout();
    tick((n) => n + 1);
    toastInfo("Sesión cerrada");
  }

  const session = LabSession.getSession();
  const signalDot = <SignalRStatusDot tone={tone} tip={tip} onReconnect={connect} />;

  if (session) {
    const roleTip = session.role ? ` · rol ${session.role}` : "";
    return (
      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ flexShrink: 0 }}>
        {signalDot}
        <Tooltip title={`${session.username}${roleTip}`} arrow>
          <Chip
            size="small"
            color="success"
            variant="outlined"
            icon={<Icon icon="mdi:account-check" size={16} />}
            label={session.username}
          />
        </Tooltip>
        <Tooltip title="Cerrar sesión" arrow>
          <IconButton size="small" color="inherit" onClick={logout} aria-label="Cerrar sesión">
            <Icon icon="mdi:logout" />
          </IconButton>
        </Tooltip>
      </Stack>
    );
  }

  return (
    <>
      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ flexShrink: 0 }}>
        {signalDot}
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={<Icon icon="mdi:login" size={18} />}
          onClick={() => setOpen(true)}
        >
          Iniciar sesión
        </Button>
      </Stack>
      <Dialog open={open} onClose={busy ? undefined : () => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, py: 1.5 }}>
          <Icon icon="mdi:account-key-outline" size={20} />
          <span>Iniciar sesión</span>
        </DialogTitle>
        <DialogContent>
          {err ? <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert> : null}
          <Stack spacing={2}>
            <TextField label="Usuario" value={user} onChange={(e) => setUser(e.target.value)} fullWidth autoFocus size="small" />
            <TextField
              label="Contraseña"
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              fullWidth
              size="small"
              onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={busy}>Cancelar</Button>
          <Button variant="contained" disabled={busy || !user.trim()} onClick={submit}>
            {busy ? "Entrando…" : "Entrar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

/** @deprecated usar LoginButton */
export function SessionActions({ onLoginClick }) {
  return <LoginButton onLoggedIn={onLoginClick} />;
}

/** @deprecated modal integrado en LoginButton */
export function LabAuthModal({ open, onClose, onLoggedIn }) {
  const { Icon } = UI;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e?.preventDefault?.();
    if (!username.trim() || !password) {
      setError("Usuario y contraseña requeridos");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const session = await LabSession.login(username.trim(), password);
      setPassword("");
      toastSuccess(`Sesión iniciada · ${session.username}${session.role ? ` (${session.role})` : ""}`);
      onLoggedIn?.(session);
      onClose?.();
    } catch (err) {
      const msg = sanitizeLoginError(err instanceof Error ? err.message : String(err));
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, py: 1.5 }}>
        <Icon icon="mdi:account-key-outline" size={20} />
        <span>Iniciar sesión</span>
      </DialogTitle>
      <DialogContent>
        <form onSubmit={submit}>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} fullWidth autoFocus />
            <TextField label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth />
            {error && <Alert severity="error">{error}</Alert>}
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button onClick={onClose} disabled={loading}>Cancelar</Button>
              <Button type="submit" variant="contained" disabled={loading}>{loading ? "Entrando…" : "Entrar"}</Button>
            </Stack>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
}
