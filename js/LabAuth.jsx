const { useState, useEffect, useCallback } = React;
const {
  Dialog, DialogTitle, DialogContent, TextField, Stack, Tooltip, Typography,
} = MaterialUI;
const { ButtonIconify } = PatyIconify;

function LabAuthModal({ open, onClose, onLoggedIn }) {
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
      const session = await PatyLabSession.login(username.trim(), password);
      setPassword("");
      PatyNotify.toastSuccess(
        `Sesión iniciada · ${session.username}${session.role ? ` (${session.role})` : ""}`,
      );
      onLoggedIn?.(session);
      onClose?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      PatyNotify.toastError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <iconify-icon icon="mdi:account-key-outline" width="1.1em" height="1.1em" />
          <span>Sesión lab</span>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <form onSubmit={submit}>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} fullWidth autoFocus />
            <TextField label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth />
            {error && <p className="error-text">{error}</p>}
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <ButtonIconify
                icon="mdi:close"
                label="Cancelar"
                title="Cancelar"
                onClick={onClose}
                disabled={loading}
              />
              <ButtonIconify
                variant="primary"
                icon="mdi:login"
                label={loading ? "Entrando…" : "Iniciar sesión"}
                title="Iniciar sesión"
                type="submit"
                busy={loading}
              />
            </Stack>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SessionActions({ onLoginClick }) {
  const { useSignalRLab, SignalRStatusDot } = PatySignalRLab;
  const { tip, tone, connect } = useSignalRLab();
  const [session, setSession] = useState(() => PatyLabSession.getSession());

  const refresh = useCallback(() => setSession(PatyLabSession.getSession()), []);

  useEffect(() => {
    refresh();
    const onAuth = () => refresh();
    window.addEventListener("isa-patyia:auth", onAuth);
    return () => window.removeEventListener("isa-patyia:auth", onAuth);
  }, [refresh]);

  function logout() {
    PatyLabSession.logout();
    refresh();
    PatyNotify.toastInfo("Sesión cerrada");
  }

  if (!session) {
    return (
      <button
        type="button"
        className="btn-iconify btn-iconify--primary btn-iconify--labeled header-session-btn"
        title="Iniciar sesión lab"
        aria-label="Iniciar sesión lab"
        onClick={() => onLoginClick?.()}
      >
        <SignalRStatusDot tone={tone} tip={tip} onReconnect={connect} />
        <iconify-icon icon="mdi:login" width="1.15em" height="1.15em" />
        <span className="btn-iconify__lbl">Iniciar sesión</span>
      </button>
    );
  }

  const roleTip = session.role ? ` · rol ${session.role}` : "";

  return (
    <Stack direction="row" spacing={0.5} alignItems="center" className="header-session">
      <Tooltip title={`${session.username}${roleTip}`} arrow>
        <div className="btn-iconify btn-iconify--labeled header-session-btn header-session-badge">
          <SignalRStatusDot tone={tone} tip={tip} onReconnect={connect} />
          <Typography component="span" variant="caption" className="btn-iconify__lbl header-session-user">
            {session.username}
          </Typography>
        </div>
      </Tooltip>
      <ButtonIconify
        icon="mdi:logout"
        label="Cerrar sesión"
        title="Cerrar sesión"
        onClick={logout}
        className="btn-iconify--sm"
      />
    </Stack>
  );
}

window.PatyLabAuth = { LabAuthModal, SessionActions };
