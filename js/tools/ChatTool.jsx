import { getReact, getMaterialUI } from "../core/runtime.ts";
import { Session } from "../core/platform.ts";
import { UI } from "../core/platform.ts";
import {
  loadPatyJwt,
  savePatyJwtAsync,
  hydratePatyJwtFromServer,
  canInteractPatyChat,
  convBelongsToJwt,
  jwtUserDisplayName,
  jwtUserShortName,
  shortDisplayName,
  parseJwtClaims,
  PATYIA_API_BASE,
} from "../core/patyia-jwt.ts";
import {
  listConversaciones,
  getConversacion,
  deleteConversacion,
  sendConversacionStream,
  buildConversacionPostBody,
  formatConversacionPostBodyPreview,
  postMensajeCalificado,
} from "../api/patyiaChatApi.ts";
import { fetchConvLogById, fetchTercerosAudit, fetchConversacionesBridge } from "../api/apiClient.ts";
import { logToMensajesVista, resolveOpenAiMensajeText } from "../core/convLog.ts";
import { ConvLogWebView } from "../ui/ConvLogWebView.jsx";
import { convLogSurfaceSx } from "../ui/convLogSurface.ts";
import { MetaDialog } from "../ui/shared.jsx";
import { ButtonIconify } from "../ui/iconify.jsx";
import { toastError, toastSuccess, toastWarning, toastInfo, requestConfirm } from "../ui/notifications.jsx";
import { mergePartial } from "../core/urlState.ts";
import { CodeMirrorPanel } from "../core/codeMirror.ts";
import { buildUserAvatarUrl } from "../core/userAvatar.ts";
import { resolveSessionBrowseScope, browseScopeKey } from "../core/sessionBrowseScope.ts";

const { useState, useEffect, useLayoutEffect, useCallback, useRef, useMemo } = getReact();

const THREAD_SCROLL_NEAR_BOTTOM = 72;

/** Conserva distancia al fondo al insertar mensajes (p. ej. operativas) arriba del viewport. */
function useThreadScrollAnchor(scrollRef, mensajes, { sending = false } = {}) {
  const snapshotRef = useRef(null);

  const mensajesKey = useMemo(
    () => (mensajes || []).map((m) => (
      m.idMsg === "stream-live"
        ? `${m.idMsg}:${String(m.contenido || "").length}`
        : m.idMsg
    )).join("|"),
    [mensajes],
  );

  const captureSnapshot = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    snapshotRef.current = {
      scrollHeight: el.scrollHeight,
      scrollTop: el.scrollTop,
      clientHeight: el.clientHeight,
    };
  }, [scrollRef]);

  const applyScrollAnchor = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const snap = snapshotRef.current;
    const distBottom = snap
      ? snap.scrollHeight - snap.scrollTop - snap.clientHeight
      : 0;
    const pinBottom = sending || !snap || distBottom <= THREAD_SCROLL_NEAR_BOTTOM;

    if (pinBottom) {
      el.scrollTop = el.scrollHeight;
    } else {
      el.scrollTop = Math.max(0, el.scrollHeight - distBottom - el.clientHeight);
    }
    captureSnapshot();
  }, [scrollRef, sending, captureSnapshot]);

  const onThreadScroll = useCallback(() => {
    captureSnapshot();
  }, [captureSnapshot]);

  useLayoutEffect(() => {
    applyScrollAnchor();
  }, [mensajesKey, sending, applyScrollAnchor]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;

    const ro = new ResizeObserver(() => {
      applyScrollAnchor();
    });
    for (const child of el.children) ro.observe(child);
    return () => ro.disconnect();
  }, [mensajesKey, applyScrollAnchor, scrollRef]);

  return onThreadScroll;
}
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

function TercerosAuditDialog({ open, onClose, jwt, sessionUser, onSelect, currentScope }) {
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
    const claims = jwt?.token
      ? (jwt.claims?.itercero ? jwt.claims : (parseJwtClaims(jwt.token) || {}))
      : {};
    let cancelled = false;
    setLoading(true);
    setError("");
    fetchTercerosAudit({
      page,
      limit: TERCEROS_AUDIT_PAGE_SIZE,
      q: qDebounced,
      jwtTercero: claims.itercero,
      jwtContacto: claims.icontacto,
      jwtNombre: jwt?.token ? jwtUserDisplayName(claims) : undefined,
      appUser: sessionUser || undefined,
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
  }, [open, page, qDebounced, jwt?.token, jwt?.claims?.itercero, jwt?.claims?.icontacto, sessionUser]);

  const currentKey = auditScopeKey(currentScope);
  const rows = data?.rows ?? [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper" className="paty-chat-terceros-dialog">
      <DialogTitle sx={{ pb: 1.25 }}>
        Filtrar por usuario
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
                          {row.es_sesion ? <Chip size="small" label="Sesión" color="success" sx={{ height: 20 }} /> : null}
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
                            esSesion: row.es_sesion,
                            nombre: row.nombre ? shortDisplayName(row.nombre) : null,
                          })}
                        >
                          {selected ? "Activo" : (row.es_sesion ? "Mis convs" : "Ver")}
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

function fechaHoraToEpochSeconds(fh) {
  if (fh == null || fh === "") return undefined;
  if (typeof fh === "number" && Number.isFinite(fh)) {
    const n = fh > 1e12 ? Math.floor(fh / 1000) : Math.floor(fh);
    return n > 0 ? n : undefined;
  }
  const d = Date.parse(String(fh).trim());
  if (Number.isNaN(d)) return undefined;
  return Math.floor(d / 1000);
}

function butilToCalificacion(butil) {
  if (butil === undefined || butil === null) return undefined;
  return butil === true || butil === 1 || butil === "1" ? 1 : 0;
}

function findCalificadoForMsg(calificados, { ireferencia, imensaje, contenido }) {
  const rated = (calificados || []).map((c) => ({
    imensaje: Number(c.imensaje) || 0,
    ireferencia: Number(c.ireferencia) || 0,
    butil: c.butil,
    contenido: String(c.contenido ?? "").trim(),
  })).filter((c) => c.imensaje > 0);
  if (!rated.length) return null;

  if (ireferencia) {
    let match = rated.find((r) => r.ireferencia === ireferencia);
    if (!match) match = rated.find((r) => r.ireferencia && Math.abs(r.ireferencia - ireferencia) <= 2);
    if (match) return match;
  }
  if (imensaje) {
    const match = rated.find((r) => r.imensaje === imensaje);
    if (match) return match;
  }
  const text = String(contenido ?? "").trim();
  if (text) {
    return rated.find((r) => {
      const c = r.contenido;
      return c === text || (text.length >= 24 && c.startsWith(text.slice(0, 24)));
    }) || null;
  }
  return null;
}

function attachCalificacionesToVista(vista, openAiMsgs, calificados) {
  let oi = 0;
  return (vista || []).map((v) => {
    if (v.esUsuario || v.esOperativa) return v;
    const msgs = openAiMsgs || [];
    let raw;
    if (msgs.length) {
      while (oi < msgs.length && String(msgs[oi]?.autor || "").toLowerCase().includes("usuario")) oi += 1;
      raw = msgs[oi];
      oi += 1;
    }
    const ireferencia = v.ireferencia
      ?? Number(raw?.ireferencia)
      ?? fechaHoraToEpochSeconds(raw?.fecha_hora)
      ?? fechaHoraToEpochSeconds(v.meta?.ts);
    const imensaje = Number(v.imensaje) || Number(raw?.imensaje) || undefined;
    const match = findCalificadoForMsg(calificados, { ireferencia, imensaje, contenido: v.contenido });
    return {
      ...v,
      ...(ireferencia ? { ireferencia } : {}),
      ...(match?.imensaje || imensaje ? { imensaje: match?.imensaje || imensaje } : {}),
      ...(match ? { calificacion: butilToCalificacion(match.butil) } : {}),
    };
  });
}

function attachCalificacionesOnly(vista, calificados) {
  return (vista || []).map((v) => {
    if (v.esUsuario || v.esOperativa) return v;
    const ireferencia = v.ireferencia ?? fechaHoraToEpochSeconds(v.meta?.ts);
    const imensaje = Number(v.imensaje) || undefined;
    const match = findCalificadoForMsg(calificados, { ireferencia, imensaje, contenido: v.contenido });
    if (!match) return { ...v, ...(ireferencia ? { ireferencia } : {}) };
    return {
      ...v,
      ...(ireferencia ? { ireferencia } : {}),
      ...(match.imensaje ? { imensaje: match.imensaje } : {}),
      calificacion: butilToCalificacion(match.butil),
    };
  });
}

function openAiFallbackVista(mensajes, fallbackUserName) {
  return (mensajes || []).map((m, i) => {
    const isUser = String(m.autor || "").toLowerCase().includes("usuario");
    const nombreUsuario = isUser ? resolveUserName(m, fallbackUserName) : "";
    let meta = m.meta && typeof m.meta === "object" ? { ...m.meta } : null;
    if (isUser && nombreUsuario) {
      meta = meta ? { ...meta, nombre_usuario: meta.nombre_usuario || nombreUsuario } : { nombre_usuario: nombreUsuario };
    }
    const contenido = resolveOpenAiMensajeText(m);
    const fechaRaw = m.fecha_hora || meta?.ts || "";
    const imensaje = Number(m.imensaje) || undefined;
    const ireferencia = Number(m.ireferencia) || fechaHoraToEpochSeconds(fechaRaw) || undefined;
    return {
      idMsg: imensaje ? `msg-${imensaje}` : `openai-${i}`,
      rol: isUser ? "user" : "assistant",
      contenido,
      fecha: formatTs(fechaRaw),
      esUsuario: isUser,
      esOperativa: false,
      meta,
      nombreUsuario: nombreUsuario || undefined,
      ...(imensaje ? { imensaje } : {}),
      ...(ireferencia ? { ireferencia } : {}),
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

function appendStreamMsg(mensajes, streamText, active) {
  if (!active) return mensajes;
  return [
    ...mensajes,
    {
      idMsg: "stream-live",
      rol: "assistant",
      contenido: streamText || "",
      fecha: "",
      esUsuario: false,
      esOperativa: false,
      meta: null,
      isStreaming: true,
    },
  ];
}

function buildOptimisticUserMsg({ text, imagenes, userName }) {
  const imgs = (imagenes || []).filter(Boolean);
  return {
    idMsg: `pending-user-${Date.now()}`,
    rol: "user",
    contenido: text || (imgs.length ? "(imagen adjunta)" : ""),
    fecha: formatTs(new Date()),
    esUsuario: true,
    esOperativa: false,
    meta: userName ? { nombre_usuario: userName } : null,
    nombreUsuario: userName || undefined,
    imagenes: imgs.length ? imgs : undefined,
  };
}

function ChatSessionPanel({ claims, displayScope, sessionUser, canInteract, viewOnly, jwtLoading, onOpenAudit }) {
  const fullName = claims ? jwtUserDisplayName(claims) : String(displayScope?.nombre ?? "").trim();
  const name = claims
    ? (jwtUserShortName(claims) || "Usuario JWT")
    : (displayScope?.nombre || sessionUser || "ISA PatyIA");
  const tercero = claims?.itercero ?? displayScope?.itercero;
  const contacto = claims?.icontacto ?? displayScope?.icontacto;
  const avatarLabel = fullName || name;
  const avatarUrl = useMemo(() => buildUserAvatarUrl(avatarLabel, 72), [avatarLabel]);
  const [avatarOk, setAvatarOk] = useState(true);
  useEffect(() => { setAvatarOk(true); }, [avatarUrl]);

  return (
    <Box
      className="paty-chat-session paty-chat-session--clickable"
      role="button"
      tabIndex={0}
      title="Filtrar conversaciones por usuario"
      aria-label="Filtrar conversaciones por usuario"
      onClick={() => onOpenAudit?.()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenAudit?.();
        }
      }}
    >
      <Box className="paty-chat-session__avatar" aria-hidden>
        {avatarOk ? (
          <img
            className="paty-chat-session__avatar-img"
            src={avatarUrl}
            alt=""
            width={36}
            height={36}
            loading="lazy"
            decoding="async"
            onError={() => setAvatarOk(false)}
          />
        ) : (
          <Icon icon="mdi:account-circle" size={28} />
        )}
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
          {jwtLoading && (
            <span className="paty-chat-session__flag">
              <CircularProgress size={10} sx={{ mr: 0.5 }} />
              Token…
            </span>
          )}
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
      if (!user) throw new Error("Inicia sesión en ISA PatyIA");
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth className="paty-chat-jwt-dialog">
      <DialogTitle>PatyIA</DialogTitle>
      <DialogContent>
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

function ChatLoggedOutShell({ onNeedLogin }) {
  return (
    <Box
      className="conv-log-shell paty-chat-shell paty-chat-shell--logged-out"
      sx={{ display: "flex", height: "100%", minHeight: 0, flexDirection: { xs: "column", md: "row" } }}
    >
      <Box
        className="conv-log-sidebar paty-chat-sidebar"
        sx={{
          width: { xs: "100%", md: CHAT_SIDEBAR_W },
          flexShrink: 0,
          borderBottom: { xs: 1, md: 0 },
          borderColor: "divider",
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          maxHeight: { xs: "42vh", md: "none" },
          opacity: 0.55,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        <Stack direction="row" spacing={1} alignItems="center" className="conv-log-sidebar-block" sx={{ py: 1, borderBottom: 1, borderColor: "divider" }}>
          <Icon icon="mdi:chat-outline" size={20} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, flex: 1 }}>Paty IA · staging</Typography>
        </Stack>
        <Box className="conv-log-sidebar-block paty-chat-sidebar-meta" sx={{ pt: 0.75, pb: 0.75 }}>
          <Box className="paty-chat-session paty-chat-session--skeleton">
            <Box className="paty-chat-session__avatar"><Icon icon="mdi:account-outline" size={20} /></Box>
            <Box className="paty-chat-session__body">
              <span className="paty-chat-skeleton-line paty-chat-skeleton-line--md" />
              <span className="paty-chat-skeleton-line paty-chat-skeleton-line--sm" />
            </Box>
          </Box>
        </Box>
        <Box className="conv-log-sidebar-block" sx={{ pt: 1 }}>
          <Button fullWidth variant="contained" size="small" disabled startIcon={<Icon icon="mdi:plus" size={16} />}>
            Nueva conversación
          </Button>
        </Box>
        <Divider sx={{ my: 1 }} />
        <Box className="conv-log-sidebar-block" sx={{ flex: 1, pb: 1.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>Conversaciones</Typography>
          {[1, 2, 3, 4].map((i) => (
            <Box key={i} className="paty-chat-skeleton-conv">
              <span className="paty-chat-skeleton-line paty-chat-skeleton-line--xs" />
              <span className="paty-chat-skeleton-line paty-chat-skeleton-line--lg" />
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column", position: "relative" }}>
        <Box sx={convLogSurfaceSx({ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0, opacity: 0.45, pointerEvents: "none" })} aria-hidden="true">
          <Box sx={{ textAlign: "center", maxWidth: 420, p: 2, borderRadius: 2, border: 1, borderColor: "divider", borderStyle: "dashed" }}>
            <Typography variant="body2" color="text.secondary">Área de conversación</Typography>
          </Box>
        </Box>
        <Box className="paty-chat-gate paty-chat-gate--overlay">
          <Box className="paty-chat-gate__inner">
            <Icon icon="mdi:login" width="2em" height="2em" style={{ marginBottom: 12, opacity: 0.85 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Chat Paty IA staging</Typography>
            <Alert severity="info" sx={{ mb: 2, textAlign: "left" }}>
              Inicia sesión para ver conversaciones, consultar terceros y chatear con Paty en staging.
            </Alert>
            <Button variant="contained" onClick={() => onNeedLogin?.()}>Iniciar sesión</Button>
          </Box>
        </Box>
      </Box>
    </Box>
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
  const [ratingMsgId, setRatingMsgId] = useState(null);
  const [loadingThread, setLoadingThread] = useState(false);
  const [logError, setLogError] = useState("");
  const [metaOpen, setMetaOpen] = useState(false);
  const [metaMsg, setMetaMsg] = useState(null);
  const [payloadPreviewOpen, setPayloadPreviewOpen] = useState(false);
  const [auditDialogOpen, setAuditDialogOpen] = useState(false);
  /** null = contacto del JWT activo; otro valor = auditoría de ese tercero/contacto */
  const [auditScope, setAuditScope] = useState(null);
  /** Contacto resuelto del usuario ISA PatyIA (sin JWT). */
  const [sessionBrowseScope, setSessionBrowseScope] = useState(null);
  const [sessionScopeLoading, setSessionScopeLoading] = useState(false);
  const [convListPage, setConvListPage] = useState(1);
  const [convListMeta, setConvListMeta] = useState(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const threadScrollRef = useRef(null);

  const loggedIn = Session.isLoggedIn();
  const sessionUser = Session.username();
  const canInteract = canInteractPatyChat(sessionUser, jwt);
  const listScope = auditScope ?? (!jwt?.token ? sessionBrowseScope : null);
  const canSend = canInteract && auditScopeIsOwnJwt(auditScope, jwt?.claims);
  const viewingAuditOther = Boolean(
    auditScope && (
      jwt?.claims
        ? !auditScopeIsOwnJwt(auditScope, jwt.claims)
        : sessionBrowseScope && browseScopeKey(auditScope) !== browseScopeKey(sessionBrowseScope)
    ),
  );
  const viewOnly = loggedIn && !canSend;
  const needsJwt = loggedIn && !jwt?.token && !jwtLoading;
  const displayScope = activeConvOwnerScope(listScope, jwt?.claims);

  useEffect(() => {
    function onSessionAuth() { setAuthTick((n) => n + 1); }
    function onPatyJwt() { setJwt(loadPatyJwt()); }
    window.addEventListener("isa-patyia:paty-jwt", onPatyJwt);
    window.addEventListener(Session.EVENT, onSessionAuth);
    window.addEventListener("isa-patyia:auth", onSessionAuth);
    return () => {
      window.removeEventListener("isa-patyia:paty-jwt", onPatyJwt);
      window.removeEventListener(Session.EVENT, onSessionAuth);
      window.removeEventListener("isa-patyia:auth", onSessionAuth);
    };
  }, []);

  useEffect(() => {
    if (!loggedIn || !sessionUser) {
      setJwt(null);
      setJwtLoading(false);
      return;
    }
    let cancelled = false;
    setJwtLoading(true);
    hydratePatyJwtFromServer(sessionUser)
      .then((rec) => { if (!cancelled) setJwt(rec); })
      .finally(() => { if (!cancelled) setJwtLoading(false); });
    return () => { cancelled = true; };
  }, [loggedIn, sessionUser]);

  useEffect(() => {
    if (!loggedIn || !sessionUser || jwt?.token) {
      setSessionBrowseScope(null);
      setSessionScopeLoading(false);
      return undefined;
    }
    let cancelled = false;
    setSessionScopeLoading(true);
    resolveSessionBrowseScope(sessionUser)
      .then((scope) => { if (!cancelled) setSessionBrowseScope(scope); })
      .finally(() => { if (!cancelled) setSessionScopeLoading(false); });
    return () => { cancelled = true; };
  }, [loggedIn, sessionUser, jwt?.token]);

  const reloadList = useCallback(async () => {
    if (!loggedIn) return;
    setLoadingList(true);
    try {
      if (jwt?.token) {
        if (listScope?.itercero && listScope?.icontacto) {
          const res = await fetchConversacionesBridge({
            itercero: listScope.itercero,
            icontacto: listScope.icontacto,
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
      } else if (listScope?.itercero && listScope?.icontacto) {
        const res = await fetchConversacionesBridge({
          itercero: listScope.itercero,
          icontacto: listScope.icontacto,
          page: convListPage,
          limit: CONV_LIST_PAGE_SIZE,
        });
        setRows(res.conversaciones);
        setConvListMeta({ total: res.total, page: res.page, pages: res.pages });
      } else {
        setRows([]);
        setConvListMeta(null);
      }
    } catch (e) {
      toastError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingList(false);
    }
  }, [loggedIn, jwt, listScope?.itercero, listScope?.icontacto, convListPage, sessionScopeLoading]);

  const handleSelectAuditScope = useCallback((row) => {
    if (row.esJwt) {
      if (!jwt?.claims?.itercero) {
        setAuditDialogOpen(false);
        toastInfo("Configura JWT para filtrar por tu contacto");
        return;
      }
      setAuditScope(null);
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
      toastInfo("Conversaciones de tu JWT");
      return;
    }
    if (row.esSesion) {
      setAuditScope(null);
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
      toastInfo(`Conversaciones · ${row.nombre || sessionUser || "sesión"}`);
      return;
    }
    const next = { itercero: row.itercero, icontacto: row.icontacto, nombre: row.nombre || null };
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
    toastInfo(`Filtro · ${row.nombre || row.icontacto}`);
  }, [jwt?.claims?.itercero, jwt?.claims?.icontacto, sessionUser]);

  const applyThreadFromDetail = useCallback((d, log, name) => {
    const rated = d?.mensajesCalificados || [];
    if (log?.mensajes?.length) {
      let vista = enrichLogVista(logToMensajesVista(log), name);
      if (d?.mensajesOpenAI?.length) {
        vista = attachCalificacionesToVista(vista, d.mensajesOpenAI, rated);
      } else if (rated.length) {
        vista = attachCalificacionesOnly(vista, rated);
      }
      setLogMensajes(vista);
      setLogError("");
      return;
    }
    const vista = attachCalificacionesToVista(
      enrichLogVista(openAiFallbackVista(d?.mensajesOpenAI || [], name), name),
      d?.mensajesOpenAI,
      rated,
    );
    setLogMensajes(vista);
    if (log === null) {
      setLogError("");
    }
  }, []);

  const openConv = useCallback(async (id, { silent = false, keepStream = false } = {}) => {
    if (!loggedIn || !id) return;
    setSelectedId(id);
    mergePartial({ chat: { convId: id } });
    if (!silent) setLoadingThread(true);
    if (!keepStream) setStreamText("");
    setLogError("");
    const ownerLabel = convOwnerDisplayLabel(activeConvOwnerScope(listScope, jwt?.claims));
    const useLogOnly = !jwt?.token || viewingAuditOther;
    try {
      if (useLogOnly) {
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
      if (!convBelongsToJwt(d, jwt.claims) && !Session.can("patyia.chat.audit")) {
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
  }, [loggedIn, jwt, sessionUser, viewingAuditOther, listScope, rows, applyThreadFromDetail]);

  useEffect(() => { reloadList(); }, [reloadList, authTick]);

  useEffect(() => {
    if (selectedId && !jwtLoading) openConv(selectedId);
  }, [selectedId, jwtLoading, jwt?.token]);

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
    const userName = convOwnerDisplayLabel(displayScope);
    setLogMensajes((prev) => enrichLogVista(
      [...prev, buildOptimisticUserMsg({ text, imagenes, userName })],
      userName,
    ));
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

  const onRateMessage = useCallback(async (msg, butil) => {
    if (!canSend || !jwt?.token || !selectedId) return;
    if (msg.calificacion !== undefined) return;
    const ireferencia = Number(msg.ireferencia) || fechaHoraToEpochSeconds(msg.meta?.ts);
    if (!ireferencia) {
      toastWarning("No se puede calificar este mensaje (sin referencia temporal).");
      return;
    }
    const contenido = String(msg.contenido || "").trim();
    if (!contenido) {
      toastWarning("No se puede calificar un mensaje vacío.");
      return;
    }
    setRatingMsgId(msg.idMsg);
    try {
      const saved = await postMensajeCalificado(jwt, {
        iconversacion: selectedId,
        contenido,
        ireferencia,
        butil,
      });
      const calificacion = butil ? 1 : 0;
      const imensajeDb = Number(saved?.imensaje) || msg.imensaje;
      setLogMensajes((prev) => prev.map((m) => (
        m.idMsg === msg.idMsg
          ? { ...m, calificacion, imensaje: imensajeDb, idMsg: imensajeDb ? `msg-${imensajeDb}` : m.idMsg }
          : m
      )));
      toastSuccess(butil ? "Marcado como útil" : "Marcado como no útil");
    } catch (e) {
      toastError(e instanceof Error ? e.message : String(e));
    } finally {
      setRatingMsgId(null);
    }
  }, [canSend, jwt, selectedId]);

  const chatUserName = useMemo(
    () => convOwnerDisplayLabel(displayScope),
    [displayScope],
  );
  const displayMensajes = useMemo(
    () => appendStreamMsg(logMensajes, streamText, sending),
    [logMensajes, sending, streamText],
  );
  const showThread = Boolean(selectedId || detail || sending || logMensajes.length);

  const onThreadScroll = useThreadScrollAnchor(threadScrollRef, displayMensajes, { sending });

  const postBodyPreview = useMemo(
    () => buildConversacionPostBody({
      prompt: draft,
      iconversacion: selectedId || undefined,
      imagenes: images.map((i) => i.dataUrl),
    }),
    [draft, selectedId, images],
  );

  if (!loggedIn) {
    return <ChatLoggedOutShell onNeedLogin={onNeedLogin} />;
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
            claims={jwt?.claims ?? null}
            displayScope={displayScope}
            sessionUser={sessionUser}
            canInteract={canInteract}
            viewOnly={viewOnly}
            jwtLoading={jwtLoading}
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
            {needsJwt ? (
              <Typography component="span" variant="caption" sx={{ display: "block", color: "info.main", mt: 0.25 }}>
                {listScope?.nombre
                  ? `${listScope.nombre} · modo lectura`
                  : sessionScopeLoading
                    ? "Buscando tus conversaciones…"
                    : "Sin contacto identificado · filtra por usuario"}
              </Typography>
            ) : null}
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
        {needsJwt && (
          <Alert
            severity="info"
            sx={{ mx: 2, mt: 1, flexShrink: 0 }}
            action={(
              <Button color="inherit" size="small" onClick={() => setJwtOpen(true)}>
                Configurar JWT
              </Button>
            )}
          >
            Modo lectura — puedes explorar conversaciones. Configura el JWT de{" "}
            <Typography component="a" href="https://www.contapyme.com/soporte-staging/" target="_blank" rel="noreferrer" variant="inherit">
              soporte-staging
            </Typography>
            {" "}para enviar mensajes.
          </Alert>
        )}
        {viewingAuditOther && (
          <Alert severity="info" sx={{ mx: 2, mt: 1, flexShrink: 0 }} action={(
            <IconButton
              color="inherit"
              size="small"
              aria-label={jwt?.claims?.itercero ? "Volver a mi JWT" : "Ver recientes"}
              onClick={() => {
                if (jwt?.claims?.itercero) {
                  handleSelectAuditScope({ esJwt: true, itercero: jwt.claims.itercero, icontacto: jwt.claims.icontacto });
                } else {
                  setAuditScope(null);
                  setConvListPage(1);
                  setSelectedId(null);
                  setDetail(null);
                  setLogMensajes([]);
                }
              }}
            >
              <Icon icon="mdi:close" size={18} />
            </IconButton>
          )}>
            Viendo conversaciones de otro usuario — lectura.
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

        {!showThread ? (
          <Box sx={convLogSurfaceSx({ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0 })}>
            <Box sx={{ textAlign: "center", maxWidth: 420, p: 2, borderRadius: 2, border: 1, borderColor: "divider", borderStyle: "dashed" }}>
              <Typography variant="body1">
                {canSend
                  ? "Escribe un mensaje abajo para iniciar una conversación."
                  : needsJwt
                    ? "Selecciona una conversación del listado o configura JWT para chatear."
                    : "Selecciona una conversación o crea una nueva."}
              </Typography>
            </Box>
          </Box>
        ) : (
          <>
            <Box
              ref={threadScrollRef}
              onScroll={onThreadScroll}
              sx={{ ...convLogSurfaceSx(), flex: 1, minHeight: 0 }}
            >
              {loadingThread && !sending && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress size={28} />
                </Box>
              )}
              {!loadingThread && logError && (
                <Alert severity="warning" sx={{ mb: 2 }}>{logError}</Alert>
              )}
              {(!loadingThread || sending) && (
                <ConvLogWebView
                  mensajes={displayMensajes}
                  onMeta={onMeta}
                  compactMeta
                  chatUserName={chatUserName}
                  streamingMsgId={sending ? "stream-live" : null}
                  emptyHint="Sin mensajes en esta conversación."
                  canRate={canSend && Boolean(jwt?.token)}
                  onRateMessage={onRateMessage}
                  ratingMsgId={ratingMsgId}
                  threadKey={selectedId ?? "draft"}
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
        sessionUser={sessionUser}
        currentScope={listScope ?? (jwt?.claims?.itercero ? { itercero: jwt.claims.itercero, icontacto: jwt.claims.icontacto, nombre: jwtUserShortName(jwt.claims) } : null)}
        onSelect={handleSelectAuditScope}
      />
    </Box>
  );
}
