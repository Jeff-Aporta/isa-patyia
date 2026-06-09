const { useState, useEffect, useRef } = React;
const {
  Paper, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Stack,
} = MaterialUI;
const { ButtonIconify } = PatyIconify;

const PROGRESS_STEPS = [
  { at: 0, msg: "Enviando SQL al servidor…" },
  { at: 1500, msg: "Conectando con SQL Server…" },
  { at: 4000, msg: "Compilando y ejecutando consulta…" },
  { at: 10000, msg: "Ejecutando (puede tardar con muchas filas)…" },
  { at: 25000, msg: "Aún en ejecución, procesando datos…" },
  { at: 60000, msg: "Operación pesada en curso, no cierres la pestaña…" },
];

function fmtElapsed(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}m ${r.toString().padStart(2, "0")}s` : `${r}s`;
}

/** Candado + play (réplica RunButton.svelte). */
function RunButton({
  unlocked,
  onToggle,
  onRun,
  busy = false,
  disabled = false,
  runTitle = "Ejecutar",
  lockTitle = "Desbloquear ejecución",
  unlockTitle = "Bloquear ejecución",
}) {
  return (
    <div className="run-group">
      <ButtonIconify
        icon={unlocked ? "mdi:lock-open-variant-outline" : "mdi:lock-outline"}
        title={unlocked ? unlockTitle : lockTitle}
        onClick={() => onToggle(!unlocked)}
      />
      <ButtonIconify
        color="success"
        icon={busy ? "mdi:loading" : "mdi:play"}
        title={runTitle}
        disabled={!unlocked || busy || disabled}
        onClick={() => {
          if (unlocked && !busy && !disabled) onRun?.();
        }}
      />
    </div>
  );
}

function SqlViewer({ value, height = "240px" }) {
  return (
    <pre className="sql-viewer custom-scrollbar" style={{ maxHeight: height, minHeight: height }}>
      {value || "-- SQL vacío"}
    </pre>
  );
}

/**
 * Tarjeta SQL como SqlExecCard.svelte: candado, copiar, ver, ejecutar.
 */
function SqlExecCard({
  title,
  sql,
  desc = "",
  height = "240px",
  confirmMessage = "",
  confirmKind = "warning",
  executeSql,
  disabled = false,
}) {
  const [approved, setApproved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  const tickRef = useRef(null);
  const t0Ref = useRef(0);

  useEffect(() => () => {
    if (tickRef.current) clearInterval(tickRef.current);
  }, []);

  function startTicker() {
    t0Ref.current = Date.now();
    setElapsedMs(0);
    setProgressMsg(PROGRESS_STEPS[0].msg);
    tickRef.current = setInterval(() => {
      const ms = Date.now() - t0Ref.current;
      setElapsedMs(ms);
      let cur = PROGRESS_STEPS[0].msg;
      for (const step of PROGRESS_STEPS) if (ms >= step.at) cur = step.msg;
      setProgressMsg(cur);
    }, 250);
  }

  function stopTicker() {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }

  async function doRun() {
    if (!executeSql || !sql?.trim()) return;
    setBusy(true);
    setErr("");
    setMsg("");
    startTicker();
    try {
      const res = await executeSql(sql);
      if (res.ok) {
        const aff = res.rowsAffected ?? res.rowsAffectedPerStmt?.reduce?.((a, b) => a + b, 0);
        const detail = aff != null
          ? ` · ${aff} fila${aff === 1 ? "" : "s"} afectada${aff === 1 ? "" : "s"}`
          : (res.output ? ` · ${res.output}` : "");
        const okMsg = `${title}${detail} (${fmtElapsed(elapsedMs)})`;
        setMsg(okMsg);
        PatyNotify.toastSuccess(okMsg);
      } else {
        const errMsg = res.error ?? res.output ?? "Error desconocido";
        setErr(errMsg);
        PatyNotify.toastError(errMsg);
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      setErr(errMsg);
      PatyNotify.toastError(errMsg);
    } finally {
      stopTicker();
      setBusy(false);
      setConfirmOpen(false);
    }
  }

  function onRunClick() {
    if (!approved) {
      setErr("Desbloquea con el candado antes de ejecutar");
      return;
    }
    if (!executeSql) {
      setErr("Ejecutor SQL no disponible");
      return;
    }
    setConfirmOpen(true);
  }

  async function copySql() {
    try {
      await navigator.clipboard.writeText(sql);
      setMsg("SQL copiado");
      PatyNotify.toastInfo("SQL copiado al portapapeles");
      setTimeout(() => setMsg(""), 1600);
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      setErr(errMsg);
      PatyNotify.toastError(errMsg);
    }
  }

  return (
    <Paper className="sql-exec-card" elevation={0}>
      <div className="sql-exec-head">
        <Typography variant="subtitle2" fontWeight={600}>{title}</Typography>
        <Stack direction="row" spacing={0.25} alignItems="center">
          <ButtonIconify icon="mdi:content-copy" title="Copiar SQL" onClick={copySql} disabled={!sql} />
          <ButtonIconify icon="mdi:eye-outline" title="Abrir SQL" onClick={() => setModalOpen(true)} disabled={!sql} />
          <RunButton
            unlocked={approved}
            onToggle={setApproved}
            onRun={onRunClick}
            busy={busy}
            disabled={disabled || !sql?.trim()}
          />
        </Stack>
      </div>
      {desc && <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>{desc}</Typography>}
      {busy && (
        <div className="exec-progress">
          <span className="dot" />
          <span className="msg">{progressMsg}</span>
          <span className="elapsed">{fmtElapsed(elapsedMs)}</span>
        </div>
      )}
      {msg && !busy && <Typography variant="caption" color="success.main">{msg}</Typography>}
      {err && <Typography variant="caption" color="error.main" display="block">{err}</Typography>}
      <SqlViewer value={sql} height={height} />

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent dividers>
          <SqlViewer value={sql} height="60vh" />
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onClose={() => !busy && setConfirmOpen(false)}>
        <DialogTitle>Confirmar ejecución</DialogTitle>
        <DialogContent>
          <p>{confirmMessage || `Vas a ejecutar:\n\n${title}\n\n¿Continuar?`}</p>
        </DialogContent>
        <DialogActions sx={{ gap: 1, px: 2, pb: 2 }}>
          <ButtonIconify
            icon="mdi:close"
            label="Cancelar"
            title="Cancelar"
            onClick={() => setConfirmOpen(false)}
            disabled={busy}
          />
          <ButtonIconify
            variant="primary"
            icon="mdi:play"
            label={busy ? "Ejecutando…" : "Ejecutar"}
            title="Ejecutar"
            onClick={doRun}
            disabled={busy}
            busy={busy}
          />
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

window.PatySqlExec = { RunButton, SqlExecCard, SqlViewer };
