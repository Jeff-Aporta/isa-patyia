import { getReact, getMaterialUI } from "../core/runtime.ts";
import { mdToHtml, MetaBadges, MetaDialog } from "../ui/shared.jsx";
import { ButtonIconify } from "../ui/iconify.jsx";
import { JsonCodeEditor } from "../editors/jsonEditor.jsx";
import { logToMensajesVista, parseLogInput } from "../core/convLog.ts";
import * as LabApi from "../api/labApi.ts";
import { mergePartial } from "../core/urlState.ts";
import { toastWarning, toastSuccess, toastError } from "../ui/notifications.jsx";

const { useState, useCallback, useMemo, useEffect } = getReact();
const {
  Paper, Typography, TextField, Stack, Alert, Chip, Divider, Tooltip,
} = getMaterialUI();

function MensajeCard({ msg, onMeta }) {
  const rowClass = msg.esOperativa ? "operativa" : msg.esUsuario ? "user" : "assistant";
  const cardClass = ["msg-card", rowClass, msg.streamFailed ? "stream-error" : ""].filter(Boolean).join(" ");
  return (
    <div className={`msg-row ${rowClass}`}>
      <div className={cardClass}>
        <div className={`msg-head ${msg.esOperativa ? "operativa" : ""}`}>
          <span>#{msg.idMsg} · {msg.rol}{msg.fecha ? ` · ${msg.fecha}` : ""}</span>
          <MetaBadges meta={msg.meta} onInfo={() => onMeta(msg)} />
        </div>
        {msg.streamFailed && msg.streamError && (
          <Alert severity="warning" sx={{ mb: 1, py: 0.25, fontSize: "0.78rem" }}>{msg.streamError}</Alert>
        )}
        <div className={`msg-body ${msg.esOperativa ? "operativa" : ""}`} dangerouslySetInnerHTML={{ __html: mdToHtml(msg.contenido) }} />
      </div>
    </div>
  );
}

export function LogViewer({ bootLog = {} }) {
  const [jsonInput, setJsonInput] = useState(bootLog.jsonInput || "");
  const [convId, setConvId] = useState(bootLog.convId || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [logInfo, setLogInfo] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [metaOpen, setMetaOpen] = useState(false);
  const [metaMsg, setMetaMsg] = useState(null);

  const aplicarLog = useCallback((log, { silent = false } = {}) => {
    const vista = logToMensajesVista(log);
    setLogInfo(log);
    setMensajes(vista);
    if (!vista.length) {
      const msg = "El log no tiene mensajes.";
      setError(msg);
      if (!silent) toastWarning(msg);
    } else {
      setError("");
      if (!silent) toastSuccess(`${vista.length} mensaje(s) cargado(s)`);
    }
  }, []);

  useEffect(() => {
    if (!bootLog.jsonInput?.trim()) return;
    try {
      aplicarLog(parseLogInput(bootLog.jsonInput), { silent: true });
    } catch (_) { /* ignore restore errors */ }
  }, []);

  useEffect(() => {
    mergePartial({ log: { convId, jsonInput } });
  }, [convId, jsonInput]);

  const resumenChips = useMemo(() => {
    if (!logInfo) return [];
    const chips = [];
    if (logInfo.iconversacion) chips.push({ label: `conv #${logInfo.iconversacion}`, color: "primary" });
    if (logInfo.resumen?.totalMensajes != null) chips.push({ label: `${logInfo.resumen.totalMensajes} mensajes`, color: "default" });
    if (logInfo.resumen?.tokens?.total) chips.push({ label: `${logInfo.resumen.tokens.total} tokens`, color: "secondary" });
    return chips;
  }, [logInfo]);

  const parsearPegado = useCallback(() => {
    setError("");
    try {
      const log = parseLogInput(jsonInput);
      aplicarLog(log);
    } catch (err) {
      setLogInfo(null);
      setMensajes([]);
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      toastError(msg);
    }
  }, [jsonInput, aplicarLog]);

  const recuperarPorId = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const log = await LabApi.fetchConvLogById(convId);
      setJsonInput(JSON.stringify(log, null, 2));
      aplicarLog(log);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  }, [convId, aplicarLog]);

  const cargarEjemplo = useCallback(() => {
    const sample = {
      iconversacion: 1961,
      mensajes: [
        { ts: "2026-06-09T12:40:31.908Z", role: "user", turno: 1, seq: 1, others: { nombre_usuario: "Integraciones" }, send: { input: "Hola" } },
        {
          ts: "2026-06-09T12:40:30.282Z", role: "operativa", turno: 1, seq: 2, latency_ms: 614,
          receive: { choices: [{ message: { content: "Consulta General" } }], usage: { prompt_tokens: 45, completion_tokens: 2, total_tokens: 47 } },
          others: { operativa_key: "generarTitulo", operativa_engine: "chat_completions" },
        },
        {
          ts: "2026-06-09T12:40:31.908Z", role: "assistant", turno: 1, seq: 3, latency_ms: 940,
          others: { response_text: "Hola, ¿en qué puedo ayudarte?", stream_ok: true, nombre_usuario: "Integraciones" },
        },
      ],
    };
    setConvId("1961");
    setJsonInput(JSON.stringify(sample, null, 2));
    aplicarLog(sample);
  }, [aplicarLog]);

  const limpiar = useCallback(() => {
    setJsonInput("");
    setConvId("");
    setLogInfo(null);
    setMensajes([]);
    setError("");
  }, []);

  return (
    <div className="tool-grid tool-grid-2">
      <Paper className="tool-panel scroll-panel" elevation={0}>
        <div className="panel-head">
          <Typography variant="subtitle1" fontWeight={600}>Entrada</Typography>
        </div>
        <div className="panel-body panel-body-log-input">
          <div className="log-input-toolbar">
            <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
              <TextField
                size="small"
                label="iconversacion"
                type="number"
                value={convId}
                onChange={(e) => setConvId(e.target.value)}
                sx={{ width: 140 }}
              />
              <Tooltip title="Recuperar por ID (CONVERSACION_LOG)" arrow>
                <span>
                  <ButtonIconify
                    variant="primary"
                    icon="mdi:cloud-download-outline"
                    title="Recuperar por ID"
                    onClick={recuperarPorId}
                    disabled={!convId}
                    busy={loading}
                  />
                </span>
              </Tooltip>
            </Stack>
            <Divider sx={{ mt: 1 }} />
          </div>

          <div className="log-json-editor-wrap">
            <JsonCodeEditor
              value={jsonInput}
              onChange={setJsonInput}
              placeholder='{ "iconversacion": 1234, "mensajes": [ ... ] }'
            />
          </div>

          <div className="log-input-footer">
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap alignItems="center">
              <Tooltip title="Parsear JSON" arrow>
                <span>
                  <ButtonIconify
                    variant="primary"
                    icon="mdi:code-json"
                    title="Parsear JSON"
                    onClick={parsearPegado}
                    disabled={!jsonInput.trim()}
                  />
                </span>
              </Tooltip>
              <ButtonIconify icon="mdi:delete-outline" title="Limpiar" onClick={limpiar} />
              <ButtonIconify icon="mdi:flask-outline" title="Cargar ejemplo" onClick={cargarEjemplo} />
            </Stack>
            {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
          </div>
        </div>
      </Paper>

      <Paper className="tool-panel scroll-panel" elevation={0}>
        <div className="panel-head">
          <Typography variant="subtitle1" fontWeight={600}>Hilo recuperado</Typography>
          {resumenChips.length > 0 && (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {resumenChips.map((c) => <Chip key={c.label} size="small" label={c.label} color={c.color} variant="outlined" />)}
            </Stack>
          )}
        </div>
        <div className="panel-body chat-historial">
          {mensajes.length === 0 ? (
            <div className="empty-state">Recupera por ID o pega un log para ver el hilo.</div>
          ) : (
            mensajes.map((m) => <MensajeCard key={m.idMsg} msg={m} onMeta={(msg) => { setMetaMsg(msg); setMetaOpen(true); }} />)
          )}
        </div>
      </Paper>

      <MetaDialog open={metaOpen} onClose={() => setMetaOpen(false)} meta={metaMsg?.meta} title={metaMsg ? `Trazabilidad · #${metaMsg.idMsg}` : ""} />
    </div>
  );
}
