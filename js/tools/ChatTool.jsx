import { getReact, getMaterialUI } from "../core/runtime.ts";
import { Session } from "../core/platform.ts";
import { UI } from "../core/platform.ts";
import {
  loadPatyJwt,
  savePatyJwtAsync,
  clearPatyJwtAsync,
  hydratePatyJwtFromServer,
  canInteractPatyChat,
  convBelongsToJwt,
  jwtUserDisplayName,
  jwtUserShortName,
  shortDisplayName,
  parseJwtClaims,
  PATYIA_MCP_URL,
  PATYIA_API_BASE,
} from "../core/patyia-jwt.ts";
import {
  listConversaciones,
  getConversacion,
  deleteConversacion,
  sendConversacionStream,
  buildConversacionPostBody,
  formatConversacionPostBodyPreview,
} from "../api/patyiaChatApi.ts";
import { fetchConvLogById, fetchTercerosAudit, fetchConversacionesBridge } from "../api/apiClient.ts";
import { logToMensajesVista } from "../core/convLog.ts";
import { ConvLogWebView } from "../ui/ConvLogWebView.jsx";
import { convLogSurfaceSx } from "../ui/convLogSurface.ts";
import { MetaDialog } from "../ui/shared.jsx";
import { ButtonIconify } from "../ui/iconify.jsx";
import { toastError, toastSuccess, toastWarning, toastInfo, requestConfirm } from "../ui/notifications.jsx";
import { mergePartial } from "../core/urlState.ts";
import { CodeMirrorPanel } from "../core/codeMirror.ts";

const { useState, useEffect, useCallback, useRef, useMemo } = getReact();
const {
  Box, Typography, Button, IconButton, TextField, List, ListItemButton, ListItemText,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Tooltip, Alert,
  Stack, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
} = getMaterialUI();
const { Icon } = UI;

const CHAT_SIDEBAR_W = 320;
const MAX_CHAT_IMAGES = 10;
const TERCEROS_AUDIT_PAGE_SIZE = 15;
const CONV_LIST_PAGE_SIZE = 100;

function auditScopeKey(scope) {
  if (!scope) return "";
  return `${scope.itercero}|${scope.icontacto}`;
}

function auditScopeIsOwnJwt(scope, claims) {
  if (!claims?.itercero) return !scope;
  if (!scope) return true;
  return convBelongsToJwt(scope, claims);
}

/** Etiqueta del dueño del hilo: nombre si existe; si no, códigos tercero/contacto. */
function convOwnerDisplayLabel(scope) {
  const { itercero, icontacto, nombre } = scope ?? {};
  const name = String(nombre ?? "").trim();
  if (name) return name;
  const t = String(itercero ?? "").trim();
  const c = String(icontacto ?? "").trim();
  if (t && c) return `${t} / ${c}`;
  if (t) return t;
  if (c) return c;
  return "Usuario";
}

function activeConvOwnerScope(auditScope, claims) {
  if (auditScope?.itercero && auditScope?.icontacto) return auditScope;
  if (claims?.itercero) {
    return {
      itercero: claims.itercero,
      icontacto: claims.icontacto,
      nombre: jwtUserShortName(claims) || null,
    };
  }
  return null;
}

function formatAuditTs(v) {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v).slice(0, 16) : d.toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
}

function TercerosAuditDialog({ open, onClose, jwt, onSelect, currentScope }) {
  const [q, setQ] = useState("");
  const [qDebounced, setQDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!open) return undefined;
    const t = setTimeout(() => setQDebounced(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q, open]);

  useEffect(() => {
    if (!open) return;
    setPage(1);
  }, [qDebounced, open]);

  useEffect(() => {
    if (!open) return undefined;
    if (!jwt?.token) {
      setData(null);
      setError("Configura un JWT válido para listar terceros.");
      setLoading(false);
      return undefined;
    }
    const claims = jwt.claims?.itercero ? jwt.claims : (parseJwtClaims(jwt.token) || {});
    let cancelled = false;
    setLoading(true);
    setError("");
    fetchTercerosAudit({
      page,
      limit: TERCEROS_AUDIT_PAGE_SIZE,
      q: qDebounced,
      jwtTercero: claims.itercero,
      jwtContacto: claims.icontacto,
      jwtNombre: jwtUserDisplayName(claims),
    })
      .then((res) => { if (!cancelled) setData(res); })
      .catch((err) => {
        if (!cancelled) {
          setData(null);
          setError(err instanceof Error ? err.message : String(err));
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open, page, qDebounced, jwt?.token, jwt?.claims?.itercero, jwt?.claims?.icontacto]);

  const currentKey = auditScopeKey(currentScope);
  const rows = data?.rows ?? [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper" className="paty-chat-terceros-dialog">
      <DialogTitle sx={{ pb: 1.25 }}>
        Auditoría · terceros / contactos
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 1.5 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Buscar tercero o contacto…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          sx={{ mb: 1.5 }}
          InputProps={{
            startAdornment: <Icon icon="mdi:magnify" size={18} style={{ marginRight: 6, opacity: 0.6 }} />,
          }}
        />
        {error ? <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert> : null}
        {loading ? (
          <Box sx={{ py: 4, textAlign: "center" }}><CircularProgress size={28} /></Box>
        ) : (
          <TableContainer className="paty-chat-terceros-table">
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre / tercero</TableCell>
                  <TableCell>Contacto</TableCell>
                  <TableCell align="right">Convs</TableCell>
                  <TableCell align="right">Msgs</TableCell>
                  <TableCell>Última act.</TableCell>
                  <TableCell align="center">Ver</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => {
                  const key = `${row.itercero}|${row.icontacto}`;
                  const selected = currentKey === key;
                  return (
                    <TableRow
                      key={key}
                      hover
                      selected={selected}
                      className={row.es_jwt ? "paty-chat-terceros-row--jwt" : undefined}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
                          <Box sx={{ minWidth: 0 }}>
                            {row.nombre ? (
                              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.35 }}>
                                {shortDisplayName(row.nombre)}
                                {" "}
                                <Typography
                                  component="span"
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    fontWeight: 400,
                                    fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                                    letterSpacing: "0.02em",
                                  }}
                                >
                                  {row.itercero}
                                </Typography>
                              </Typography>
                            ) : (
                              <Typography
                                variant="body2"
                                component="span"
                                sx={{ fontFamily: '"IBM Plex Mono", ui-monospace, monospace', letterSpacing: "0.02em" }}
                              >
                                {row.itercero}
                              </Typography>
                            )}
                          </Box>
                          {row.es_jwt ? <Chip size="small" label="JWT" color="primary" sx={{ height: 20 }} /> : null}
                        </Stack>
                      </TableCell>
                      <TableCell>{row.icontacto}</TableCell>
                      <TableCell align="right">{row.total_conversaciones.toLocaleString("es-CO")}</TableCell>
                      <TableCell align="right">{row.total_mensajes.toLocaleString("es-CO")}</TableCell>
                      <TableCell>{formatAuditTs(row.ultima_actividad)}</TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant={selected ? "contained" : "outlined"}
                          onClick={() => onSelect({
                            itercero: row.itercero,
                            icontacto: row.icontacto,
                            esJwt: row.es_jwt,
                            nombre: row.nombre ? shortDisplayName(row.nombre) : null,
                          })}
                        >
                          {selected ? "Activo" : "Auditar"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!loading && !rows.length ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3, color: "text.secondary" }}>
                      Sin resultados{qDebounced ? ` para “${qDebounced}”` : ""}.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", px: 2, py: 1.25 }}>
        <Typography variant="caption" color="text.secondary">
          {data ? `${data.total.toLocaleString("es-CO")} contactos · pág. ${data.page}/${Math.max(data.pages, 1)}` : "—"}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            size="small"
            disabled={loading || !data || page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            startIcon={<Icon icon="mdi:chevron-left" size={18} />}
          >
            Anterior
          </Button>
          <Button
            size="small"
            disabled={loading || !data || page >= (data.pages || 1)}
            onClick={() => setPage((p) => p + 1)}
            endIcon={<Icon icon="mdi:chevron-right" size={18} />}
          >
            Siguiente
          </Button>
          <Button onClick={onClose}>Cerrar</Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

function formatTs(v) {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v).slice(0, 16) : d.toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
}

function resolveUserName(msg, fallbackUserName) {
  const meta = msg?.meta;
  return (
    meta?.nombre_usuario
    || meta?.prompt_variables?.nombre_usuario
    || fallbackUserName
    || ""
  );
}

function openAiFallbackVista(mensajes, fallbackUserName) {
  return (mensajes || []).map((m, i) => {
    const isUser = String(m.autor || "").toLowerCase().includes("usuario");
    const nombreUsuario = isUser ? resolveUserName(m, fallbackUserName) : "";
    let meta = m.meta && typeof m.meta === "object" ? { ...m.meta } : null;
    if (isUser && nombreUsuario) {
      meta = meta ? { ...meta, nombre_usuario: meta.nombre_usuario || nombreUsuario } : { nombre_usuario: nombreUsuario };
    }
    return {
      idMsg: `openai-${i}`,
      rol: isUser ? "user" : "assistant",
      contenido: String(m.mensaje || ""),
      fecha: formatTs(m.fecha_hora),
      esUsuario: isUser,
      esOperativa: false,
      meta,
      nombreUsuario: nombreUsuario || undefined,
    };
  });
}

function enrichLogVista(mensajes, fallbackUserName) {
  return (mensajes || []).map((m) => {
    if (!m.esUsuario) return m;
    const name = m.nombreUsuario || m.meta?.nombre_usuario || m.meta?.prompt_variables?.nombre_usuario || fallbackUserName;
    if (!name) return m;
    return {
      ...m,
      nombreUsuario: name,
      meta: m.meta ? { ...m.meta, nombre_usuario: m.meta.nombre_usuario || name } : { nombre_usuario: name },
    };
  });
}

function appendStreamMsg(mensajes, streamText) {
  if (!streamText) return mensajes;
  return [
    ...mensajes,
    {
      idMsg: "stream-live",
      rol: "assistant",
      contenido: streamText,
      fecha: "",
      esUsuario: false,
      esOperativa: false,
      meta: null,
    },
  ];
}

function ChatSessionPanel({ claims, canInteract, viewOnly, onOpenAudit }) {
  const fullName = jwtUserDisplayName(claims);
  const name = jwtUserShortName(claims) || "Usuario JWT";
  const tercero = claims?.itercero;
  const contacto = claims?.icontacto;

  return (
    <Box
      className="paty-chat-session paty-chat-session--clickable"
      role="button"
      tabIndex={0}
      title="Ver terceros para auditoría"
      aria-label="Abrir auditoría de terceros y contactos"
      onClick={() => onOpenAudit?.()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenAudit?.();
        }
      }}
    >
      <Box className="paty-chat-session__avatar" aria-hidden>
        <Icon icon="mdi:account-circle" size={28} />
      </Box>
      <Box className="paty-chat-session__body">
        <Typography className="paty-chat-session__name" title={fullName || name}>
          {name}
        </Typography>
        {(tercero || contacto) && (
          <Typography className="paty-chat-session__ids" variant="caption">
            {tercero || ""}
            {tercero && contacto ? " · " : ""}
            {contacto || ""}
          </Typography>
        )}
        <Box className="paty-chat-session__flags">
          {canInteract && (
            <span className="paty-chat-session__flag paty-chat-session__flag--live">
              <span className="status-dot status-dot--inline status-dot--green" aria-hidden />
              Interactivo
            </span>
          )}
          {viewOnly && (
            <span className="paty-chat-session__flag paty-chat-session__flag--readonly">
              <span className="status-dot status-dot--inline status-dot--orange" aria-hidden />
              Solo lectura
            </span>
          )}
          <Tooltip title={PATYIA_MCP_URL} arrow placement="top">
            <span className="paty-chat-session__flag paty-chat-session__flag--mcp">
              <Icon icon="mdi:lan-connect" size={12} />
              MCP staging
            </span>
          </Tooltip>
          <span className="paty-chat-session__flag paty-chat-session__flag--audit">
            <Icon icon="mdi:account-search-outline" size={12} />
            Auditoría
          </span>
        </Box>
      </Box>
    </Box>
  );
}

function JwtModal({ open, onClose, initialToken, onSave }) {
  const [value, setValue] = useState(initialToken || "");
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) setValue(initialToken || ""); }, [open, initialToken]);

  async function submit() {
    try {
      const user = Session.username();
      if (!user) throw new Error("Inicia sesión en AppTools");
      setSaving(true);
      const rec = await savePatyJwtAsync(value, user);
      onSave(rec);
      toastSuccess("Token JWT guardado en tu cuenta");
      onClose();
    } catch (e) {
      toastError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    try {
      setSaving(true);
      await clearPatyJwtAsync();
      onSave(null);
      onClose();
      toastInfo("Token eliminado");
    } catch (e) {
      toastError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth className="paty-chat-jwt-dialog">
      <DialogTitle>Token JWT · AyudasCP staging</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Pega el Bearer de InSoft (portal soporte-staging). Solo quien guardó el token puede enviar mensajes.
          MCP de prueba:{" "}
          <Typography component="a" href={PATYIA_MCP_URL} target="_blank" rel="noreferrer" variant="caption">
            {PATYIA_MCP_URL}
          </Typography>
        </Typography>
        <TextField
          fullWidth
          multiline
          minRows={4}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          inputProps={{ spellCheck: false }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onDelete} color="inherit" disabled={saving}>Borrar</Button>
        <Button onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button variant="contained" onClick={submit} disabled={saving}>
          {saving ? <CircularProgress size={20} color="inherit" /> : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function readImagesFromClipboard(items) {
  const out = [];
  for (const item of items || []) {
    if (item.type.startsWith("image/")) {
      const f = item.getAsFile();
      if (f) out.push(f);
    }
  }
  return out;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ""));
    r.onerror = () => reject(new Error("No se pudo leer la imagen"));
    r.readAsDataURL(file);
  });
}

async function filesToImageEntries(files) {
  const added = [];
  for (const file of files || []) {
    if (!file?.type?.startsWith("image/")) continue;
    const dataUrl = await fileToDataUrl(file);
    if (!String(dataUrl).startsWith("data:")) continue;
    added.push({ name: file.name || "imagen", dataUrl });
  }
  return added;
}

function ChatPayloadPreview({ open, body, endpoint }) {
  const { Box, Typography, Paper } = getMaterialUI();
  const previewJson = useMemo(
    () => formatConversacionPostBodyPreview(body),
    [body],
  );
  const imageCount = Array.isArray(body.imagenes) ? body.imagenes.length : 0;

  if (!open) return null;

  return (
    <Paper
      className="paty-chat-payload-preview"
      elevation={8}
      role="region"
      aria-label="Vista previa del body POST"
    >
      <Box className="paty-chat-payload-preview__head">
        <Typography variant="caption" className="paty-chat-payload-preview__method">
          POST
        </Typography>
        <Typography variant="caption" component="code" className="paty-chat-payload-preview__path">
          {endpoint}
        </Typography>
        {imageCount > 0 ? (
          <Typography variant="caption" className="paty-chat-payload-preview__meta">
            {imageCount} imagen{imageCount !== 1 ? "es" : ""} · base64
          </Typography>
        ) : null}
      </Box>
      <Box className="paty-chat-payload-preview__body">
        <CodeMirrorPanel
          value={previewJson}
          json
          readOnly
          lineWrapping
          maxHeight="min(36vh, 280px)"
          minHeight="7rem"
          copyTitle="Copiar JSON del POST"
          enableFullPage
          fullPageTitle="Body POST · /conversacion"
          className="paty-chat-payload-preview__cm"
        />
      </Box>
      <Typography variant="caption" className="paty-chat-payload-preview__foot">
        Vista previa en vivo — el envío incluye base64 completo en <code>imagenes[]</code>.
        {" "}ISS acepta <code>data:image/(png|jpeg|webp|gif);base64,…</code> (máx. 10 imgs, ~5&nbsp;MB c/u).
      </Typography>
    </Paper>
  );
}

export function ChatTool({ bootChat, onNeedLogin }) {
  const [jwt, setJwt] = useState(() => loadPatyJwt());
  const [jwtOpen, setJwtOpen] = useState(false);
  const [jwtLoading, setJwtLoading] = useState(false);
  const [authTick, setAuthTick] = useState(0);
  const [rows, setRows] = useState([]);
  const [selectedId, setSelectedId] = useState(() => Number(bootChat?.convId) || null);
  const [detail, setDetail] = useState(null);
  const [loadingList, setLoadingList] = useState(false);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const [images, setImages] = useState([]);
  const [streamText, setStreamText] = useState("");
  const [logMensajes, setLogMensajes] = useState([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [logError, setLogError] = useState("");
  const [metaOpen, setMetaOpen] = useState(false);
  const [metaMsg, setMetaMsg] = useState(null);
  const [payloadPreviewOpen, setPayloadPreviewOpen] = useState(false);
  const [auditDialogOpen, setAuditDialogOpen] = useState(false);
  /** null = contacto del JWT activo; otro valor = auditoría de ese tercero/contacto */
  const [auditScope, setAuditScope] = useState(null);
  const [convListPage, setConvListPage] = useState(1);
  const [convListMeta, setConvListMeta] = useState(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const loggedIn = Session.isLoggedIn();
  const sessionUser = Session.username();
  const canInteract = canInteractPatyChat(sessionUser, jwt);
  const canSend = canInteract && auditScopeIsOwnJwt(auditScope, jwt?.claims);
  const viewingAuditOther = Boolean(auditScope && !auditScopeIsOwnJwt(auditScope, jwt?.claims));
  const viewOnly = loggedIn && !canInteract;

  useEffect(() => {
    function refresh() { setAuthTick((n) => n + 1); setJwt(loadPatyJwt()); }
    window.addEventListener("isa-patyia:paty-jwt", refresh);
    window.addEventListener(Session.EVENT, refresh);
    window.addEventListener("isa-patyia:auth", refresh);
    return () => {
      window.removeEventListener("isa-patyia:paty-jwt", refresh);
      window.removeEventListener(Session.EVENT, refresh);
      window.removeEventListener("isa-patyia:auth", refresh);
    };
  }, []);

  useEffect(() => {
    if (!loggedIn || !sessionUser) {
      setJwt(null);
      return;
    }
    let cancelled = false;
    setJwtLoading(true);
    hydratePatyJwtFromServer(sessionUser)
      .then((rec) => { if (!cancelled) setJwt(rec); })
      .finally(() => { if (!cancelled) setJwtLoading(false); });
    return () => { cancelled = true; };
  }, [loggedIn, sessionUser, authTick]);

  const reloadList = useCallback(async () => {
    if (!jwt?.token) return;
    setLoadingList(true);
    try {
      if (auditScope?.itercero && auditScope?.icontacto) {
        const res = await fetchConversacionesBridge({
          itercero: auditScope.itercero,
          icontacto: auditScope.icontacto,
          page: convListPage,
          limit: CONV_LIST_PAGE_SIZE,
        });
        setRows(res.conversaciones);
        setConvListMeta({ total: res.total, page: res.page, pages: res.pages });
      } else {
        const list = await listConversaciones(jwt);
        setRows(list);
        setConvListMeta(null);
      }
    } catch (e) {
      toastError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingList(false);
    }
  }, [jwt, auditScope?.itercero, auditScope?.icontacto, convListPage]);

  const handleSelectAuditScope = useCallback((row) => {
    const next = row.esJwt
      ? null
      : { itercero: row.itercero, icontacto: row.icontacto, nombre: row.nombre || null };
    setAuditScope(next);
    setConvListPage(1);
    setConvListMeta(null);
    setRows([]);
    setSelectedId(null);
    setDetail(null);
    setLogMensajes([]);
    setStreamText("");
    setLogError("");
    mergePartial({ chat: { convId: null } });
    setAuditDialogOpen(false);
    if (row.esJwt) {
      toastInfo("Conversaciones de tu JWT");
    } else {
      toastInfo(`Auditoría · contacto ${row.icontacto}`);
    }
  }, []);

  const applyThreadFromDetail = useCallback((d, log, name) => {
    if (log?.mensajes?.length) {
      setLogMensajes(enrichLogVista(logToMensajesVista(log), name));
      setLogError("");
      return;
    }
    setLogMensajes(enrichLogVista(openAiFallbackVista(d?.mensajesOpenAI || [], name), name));
    if (log === null) {
      setLogError("");
    }
  }, []);

  const openConv = useCallback(async (id, { silent = false, keepStream = false } = {}) => {
    if (!jwt?.token || !id) return;
    setSelectedId(id);
    mergePartial({ chat: { convId: id } });
    if (!silent) setLoadingThread(true);
    if (!keepStream) setStreamText("");
    setLogError("");
    const ownerLabel = convOwnerDisplayLabel(activeConvOwnerScope(auditScope, jwt.claims));
    try {
      if (viewingAuditOther) {
        const logResult = await fetchConvLogById(id).catch(() => null);
        const row = rows.find((r) => r.iconversacion === id);
        setDetail(row || { iconversacion: id, titulo: `Conv #${id}` });
        applyThreadFromDetail(null, logResult, ownerLabel);
        return;
      }
      const [d, logResult] = await Promise.all([
        getConversacion(jwt, id),
        fetchConvLogById(id).catch(() => null),
      ]);
      if (!convBelongsToJwt(d, jwt.claims) && sessionUser !== "JAGUDELOE") {
        toastWarning("Esta conversación no pertenece al token activo");
      }
      setDetail(d);
      applyThreadFromDetail(d, logResult, ownerLabel);
    } catch (e) {
      toastError(e instanceof Error ? e.message : String(e));
      setDetail(null);
      setLogMensajes([]);
    } finally {
      if (!silent) setLoadingThread(false);
    }
  }, [jwt, sessionUser, viewingAuditOther, auditScope, rows, applyThreadFromDetail]);

  useEffect(() => { reloadList(); }, [reloadList, authTick]);

  useEffect(() => {
    if (selectedId && jwt?.token) openConv(selectedId);
  }, [jwt?.token]);

  async function onNewChat() {
    if (!canSend) { toastWarning("Modo lectura."); return; }
    setSelectedId(null);
    setDetail(null);
    setStreamText("");
    setLogMensajes([]);
    setLogError("");
    mergePartial({ chat: { convId: null } });
    inputRef.current?.focus();
  }

  async function onDelete(id) {
    if (!canSend) return;
    const conv = rows.find((r) => r.iconversacion === id);
    if (conv && !convBelongsToJwt(conv, jwt?.claims)) {
      toastError("No puedes eliminar conversaciones de otro contacto");
      return;
    }
    const ok = await requestConfirm({ title: "Eliminar conversación", message: `¿Eliminar conv #${id}?` });
    if (!ok) return;
    try {
      await deleteConversacion(jwt, id);
      toastSuccess("Conversación eliminada");
      if (selectedId === id) { setSelectedId(null); setDetail(null); setLogMensajes([]); }
      reloadList();
    } catch (e) {
      toastError(e instanceof Error ? e.message : String(e));
    }
  }

  async function onSend() {
    if (!canSend || !jwt) return;
    const text = draft.trim();
    if (!text && !images.length) return;
    if (selectedId && detail && !convBelongsToJwt(detail, jwt.claims)) {
      toastError("No puedes enviar mensajes en conversaciones de otro contacto");
      return;
    }
    setSending(true);
    setStreamText("");
    const imagenes = images.map((i) => i.dataUrl);
    const convIdBefore = selectedId;
    try {
      const result = await sendConversacionStream(
        jwt,
        { prompt: draft.trim(), iconversacion: selectedId || undefined, imagenes },
        (partial) => setStreamText(partial),
      );
      const newId = Number(result.iconversacion) || convIdBefore;
      setDraft("");
      setImages([]);
      const finalText = String(result.respuesta || "").trim();
      if (finalText) setStreamText(finalText);
      if (newId) {
        setSelectedId(newId);
        mergePartial({ chat: { convId: newId } });
        void reloadList();
        await openConv(newId, { silent: true, keepStream: Boolean(finalText) });
      }
    } catch (e) {
      toastError(e instanceof Error ? e.message : String(e));
    } finally {
      setSending(false);
      setStreamText("");
    }
  }

  async function appendImagesFromFiles(files) {
    if (!files?.length) return;
    try {
      const added = await filesToImageEntries(Array.from(files));
      if (!added.length) {
        toastWarning("Solo se admiten imágenes (PNG, JPEG, WebP, GIF)");
        return;
      }
      setImages((prev) => {
        const merged = [...prev, ...added];
        if (merged.length > MAX_CHAT_IMAGES) {
          toastWarning(`Máximo ${MAX_CHAT_IMAGES} imágenes por mensaje`);
        }
        return merged.slice(0, MAX_CHAT_IMAGES);
      });
    } catch (err) {
      toastError(err instanceof Error ? err.message : String(err));
    }
  }

  async function onPaste(e) {
    if (!canSend) return;
    const files = readImagesFromClipboard(e.clipboardData?.items);
    if (!files.length) return;
    e.preventDefault();
    await appendImagesFromFiles(files);
  }

  function onAttachImagesClick() {
    fileInputRef.current?.click();
  }

  async function onAttachImagesChange(e) {
    await appendImagesFromFiles(e.target.files);
    e.target.value = "";
  }

  const onMeta = useCallback((msg) => {
    setMetaMsg(msg);
    setMetaOpen(true);
  }, []);

  const showStream = sending && streamText;
  const chatUserName = useMemo(
    () => convOwnerDisplayLabel(activeConvOwnerScope(auditScope, jwt?.claims)),
    [auditScope, jwt?.claims],
  );
  const displayMensajes = useMemo(
    () => appendStreamMsg(logMensajes, showStream ? streamText : ""),
    [logMensajes, showStream, streamText],
  );

  const postBodyPreview = useMemo(
    () => buildConversacionPostBody({
      prompt: draft,
      iconversacion: selectedId || undefined,
      imagenes: images.map((i) => i.dataUrl),
    }),
    [draft, selectedId, images],
  );

  if (!loggedIn) {
    return (
      <Box className="paty-chat-gate">
        <Box className="paty-chat-gate__inner">
          <Alert severity="info" sx={{ mb: 2 }}>Inicia sesión para abrir el chat de pruebas Paty IA (staging).</Alert>
          <Button variant="contained" onClick={() => onNeedLogin?.()}>Iniciar sesión</Button>
        </Box>
      </Box>
    );
  }

  if (!jwt?.token) {
    return (
      <Box className="paty-chat-gate">
        <Box className="paty-chat-gate__inner">
          {jwtLoading ? (
            <CircularProgress size={28} />
          ) : (
            <>
              <Alert severity="warning" sx={{ mb: 2, textAlign: "left" }}>
                Configura el token JWT del portal{" "}
                <Typography component="a" href="https://www.contapyme.com/soporte-staging/" target="_blank" rel="noreferrer">
                  soporte-staging
                </Typography>
                . Se guarda en tu cuenta y solo se vuelve a pedir cuando expire.
              </Alert>
              <Button variant="contained" startIcon={<Icon icon="mdi:key-variant" />} onClick={() => setJwtOpen(true)}>
                Configurar JWT
              </Button>
              <JwtModal open={jwtOpen} onClose={() => setJwtOpen(false)} initialToken="" onSave={setJwt} />
            </>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box className="conv-log-shell paty-chat-shell" sx={{ display: "flex", height: "100%", minHeight: 0, flexDirection: { xs: "column", md: "row" } }}>
      <Box
        className="conv-log-sidebar paty-chat-sidebar"
        sx={{
          position: "relative",
          width: { xs: "100%", md: CHAT_SIDEBAR_W },
          flexShrink: 0,
          borderRight: { md: 0 },
          borderBottom: { xs: 1, md: 0 },
          borderColor: "divider",
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          maxHeight: { xs: "42vh", md: "none" },
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          className="conv-log-sidebar-block"
          sx={{ py: 1, borderBottom: 1, borderColor: "divider", flexShrink: 0 }}
        >
          <Icon icon="mdi:chat-outline" size={20} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, flex: 1 }}>
            Paty IA · staging
          </Typography>
          <Tooltip title="Cambiar token JWT">
            <IconButton size="small" onClick={() => setJwtOpen(true)} aria-label="JWT">
              <Icon icon="mdi:key-variant" size={18} />
            </IconButton>
          </Tooltip>
        </Stack>

        <Box className="conv-log-sidebar-block paty-chat-sidebar-meta" sx={{ pt: 0.75, pb: 0.75, flexShrink: 0 }}>
          <ChatSessionPanel
            claims={jwt.claims}
            canInteract={canInteract}
            viewOnly={viewOnly}
            onOpenAudit={() => setAuditDialogOpen(true)}
          />
        </Box>

        <Box className="conv-log-sidebar-block" sx={{ pt: 1, flexShrink: 0 }}>
          <Button
            fullWidth
            variant="contained"
            size="small"
            disabled={!canSend}
            startIcon={<Icon icon="mdi:plus" size={16} />}
            onClick={onNewChat}
          >
            Nueva conversación
          </Button>
        </Box>

        <Divider sx={{ my: 1 }} />

        <Box className="conv-log-sidebar-block" sx={{ flex: 1, minHeight: 0, overflow: "auto", pb: 1.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
            Conversaciones
            {viewingAuditOther ? (
              <Typography component="span" variant="caption" sx={{ display: "block", color: "warning.main", mt: 0.25 }}>
                Auditoría · {auditScope.itercero} / {auditScope.icontacto}
              </Typography>
            ) : null}
          </Typography>
          <List dense disablePadding>
            {loadingList && !rows.length && (
              <Box sx={{ py: 2, textAlign: "center" }}><CircularProgress size={22} /></Box>
            )}
            {rows.map((r) => {
              const convTitle = r.titulo || "Sin título";
              const convTip = `${r.iconversacion} · ${convTitle}`;
              return (
              <ListItemButton
                key={r.iconversacion}
                selected={selectedId === r.iconversacion}
                onClick={() => openConv(r.iconversacion)}
                title={convTip}
                aria-label={convTip}
                sx={{ py: 0.5, pl: 1.5, pr: 1, minHeight: 36, "&.Mui-selected": { bgcolor: "action.selected" } }}
              >
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={0.5} alignItems="center" className="paty-chat-conv-item__title" sx={{ minWidth: 0, pointerEvents: "none" }}>
                      <span className="paty-chat-conv-id-badge">
                        {r.iconversacion}
                      </span>
                      <Typography component="span" variant="body2" noWrap sx={{ fontWeight: 600, minWidth: 0 }}>
                        {convTitle}
                      </Typography>
                    </Stack>
                  }
                  secondary={`${formatTs(r.fhultact)} · ${r.qmensajes ?? 0} msgs`}
                  primaryTypographyProps={{ sx: { pointerEvents: "none" } }}
                  secondaryTypographyProps={{ variant: "caption", noWrap: true, sx: { pointerEvents: "none" } }}
                />
                {canSend && convBelongsToJwt(r, jwt.claims) && (
                  <IconButton
                    size="small"
                    edge="end"
                    aria-label="Eliminar"
                    onClick={(e) => { e.stopPropagation(); onDelete(r.iconversacion); }}
                  >
                    <Icon icon="mdi:delete-outline" size={16} />
                  </IconButton>
                )}
              </ListItemButton>
            );})}
          </List>
          {convListMeta && convListMeta.pages > 1 ? (
            <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="space-between" sx={{ mt: 1, px: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {convListMeta.total.toLocaleString("es-CO")} · pág. {convListMeta.page}/{convListMeta.pages}
              </Typography>
              <Stack direction="row" spacing={0.25}>
                <IconButton
                  size="small"
                  aria-label="Página anterior"
                  disabled={loadingList || convListPage <= 1}
                  onClick={() => setConvListPage((p) => Math.max(1, p - 1))}
                >
                  <Icon icon="mdi:chevron-left" size={18} />
                </IconButton>
                <IconButton
                  size="small"
                  aria-label="Página siguiente"
                  disabled={loadingList || convListPage >= convListMeta.pages}
                  onClick={() => setConvListPage((p) => p + 1)}
                >
                  <Icon icon="mdi:chevron-right" size={18} />
                </IconButton>
              </Stack>
            </Stack>
          ) : null}
        </Box>
      </Box>

      <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column" }}>
        {viewingAuditOther && (
          <Alert severity="info" sx={{ mx: 2, mt: 1, flexShrink: 0 }} action={(
            <IconButton
              color="inherit"
              size="small"
              aria-label="Volver a mi JWT"
              onClick={() => handleSelectAuditScope({ esJwt: true, itercero: jwt.claims.itercero, icontacto: jwt.claims.icontacto })}
            >
              <Icon icon="mdi:close" size={18} />
            </IconButton>
          )}>
            Modo auditoría — lectura.
          </Alert>
        )}
        {(selectedId || detail) && (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ px: 2, py: 0.75, borderBottom: 1, borderColor: "divider", flexShrink: 0, bgcolor: "background.paper" }}
          >
            <Box sx={{ flex: 1 }} />
            <Tooltip title="Actualizar conversación" arrow>
              <span>
                <ButtonIconify
                  icon="mdi:refresh"
                  title="Actualizar"
                  onClick={() => openConv(selectedId)}
                  disabled={loadingThread}
                  busy={loadingThread}
                />
              </span>
            </Tooltip>
          </Stack>
        )}

        {!selectedId && !detail ? (
          <Box sx={convLogSurfaceSx({ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0 })}>
            <Box sx={{ textAlign: "center", maxWidth: 420, p: 2, borderRadius: 2, border: 1, borderColor: "divider", borderStyle: "dashed" }}>
              <Typography variant="body1">
                {canSend
                  ? "Escribe un mensaje abajo para iniciar una conversación."
                  : "Selecciona una conversación o crea una nueva."}
              </Typography>
            </Box>
          </Box>
        ) : (
          <>
            <Box sx={{ ...convLogSurfaceSx(), flex: 1, minHeight: 0 }}>
              {loadingThread && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress size={28} />
                </Box>
              )}
              {!loadingThread && logError && (
                <Alert severity="warning" sx={{ mb: 2 }}>{logError}</Alert>
              )}
              {!loadingThread && (
                <ConvLogWebView
                  mensajes={displayMensajes}
                  onMeta={onMeta}
                  compactMeta
                  chatUserName={chatUserName}
                  emptyHint="Sin mensajes en esta conversación."
                />
              )}
            </Box>
          </>
        )}

        {canSend && (
          <Box className="paty-chat-compose">
            <ChatPayloadPreview
              open={payloadPreviewOpen}
              body={postBodyPreview}
              endpoint={`${PATYIA_API_BASE}/conversacion`}
            />
            {images.length > 0 && (
              <Box className="paty-chat-image-previews">
                {images.map((img, idx) => (
                  <figure key={idx}>
                    <img src={img.dataUrl} alt={img.name || "adjunto"} />
                    <button type="button" aria-label="Quitar" onClick={() => setImages((p) => p.filter((_, j) => j !== idx))}>×</button>
                  </figure>
                ))}
              </Box>
            )}
            <Box className="paty-chat-input-wrap">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                multiple
                hidden
                aria-hidden
                tabIndex={-1}
                onChange={onAttachImagesChange}
              />
              <Tooltip title={payloadPreviewOpen ? "Ocultar body POST" : "Ver body POST (JSON en vivo)"}>
                <span>
                  <IconButton
                    className={`paty-chat-payload-btn${payloadPreviewOpen ? " paty-chat-payload-btn--active" : ""}`}
                    aria-label={payloadPreviewOpen ? "Ocultar vista previa JSON" : "Ver vista previa JSON del POST"}
                    aria-pressed={payloadPreviewOpen}
                    disabled={sending}
                    onClick={() => setPayloadPreviewOpen((v) => !v)}
                    size="small"
                  >
                    <Icon icon="mdi:code-json" size={22} />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Adjuntar imagen (se envía en base64)">
                <span>
                  <IconButton
                    className="paty-chat-attach-btn"
                    aria-label="Adjuntar imagen"
                    disabled={sending || images.length >= MAX_CHAT_IMAGES}
                    onClick={onAttachImagesClick}
                    size="small"
                  >
                    <Icon icon="mdi:image-plus-outline" size={22} />
                  </IconButton>
                </span>
              </Tooltip>
              <TextField
                inputRef={inputRef}
                fullWidth
                multiline
                maxRows={6}
                size="small"
                placeholder="Escribe tu consulta… (Ctrl+V o adjuntar imagen)"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onPaste={onPaste}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); }
                }}
                disabled={sending}
              />
              <Button variant="contained" disabled={sending || (!draft.trim() && !images.length)} onClick={onSend}>
                {sending ? <CircularProgress size={20} color="inherit" /> : "Enviar"}
              </Button>
            </Box>
          </Box>
        )}

        {!canSend && (selectedId || detail) && (
          <Box className="paty-chat-compose-readonly">
            Modo lectura.
          </Box>
        )}
      </Box>

      <JwtModal
        open={jwtOpen}
        onClose={() => setJwtOpen(false)}
        initialToken={jwt?.token || ""}
        onSave={setJwt}
      />
      <MetaDialog
        open={metaOpen}
        onClose={() => setMetaOpen(false)}
        meta={metaMsg?.meta}
        usageStats={metaMsg?.usageStats ?? null}
        title={metaMsg ? `Trazabilidad · ${metaMsg.rol}` : ""}
        isUserMessage={Boolean(metaMsg?.esUsuario)}
      />
      <TercerosAuditDialog
        open={auditDialogOpen}
        onClose={() => setAuditDialogOpen(false)}
        jwt={jwt}
        currentScope={auditScope ?? (jwt?.claims?.itercero ? { itercero: jwt.claims.itercero, icontacto: jwt.claims.icontacto } : null)}
        onSelect={handleSelectAuditScope}
      />
    </Box>
  );
}
