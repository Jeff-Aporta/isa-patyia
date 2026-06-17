import { getReact, Session } from "../../core/platform.ts";
import {
  loadPatyJwt,
  hydratePatyJwtFromServer,
  canInteractPatyChat,
  convBelongsToJwt,
  jwtUserShortName,
  resolveSessionBrowseScope,
  browseScopeKey,
} from "../../core/patyia-jwt.ts";
import {
  listConversaciones,
  getConversacion,
  deleteConversacion,
  sendConversacionStream,
  buildConversacionPostBody,
  postMensajeCalificado,
} from "../../api/patyiaChatApi.ts";
import { fetchConvLogById, fetchConvLogByIdWithRetry, fetchConversacionesBridge } from "../../api/apiClient.ts";
import { logToMensajesVista } from "../../core/convLog.ts";
import { toastError, toastSuccess, toastWarning, toastInfo, requestConfirm } from "../../core/platform.ts";
import { mergePartial } from "../../core/urlState.ts";
import { CONV_LIST_PAGE_SIZE, MAX_CHAT_IMAGES } from "./constants.ts";
import { useThreadScrollAnchor } from "./threadScroll.ts";
import {
  auditScopeIsOwnJwt,
  convOwnerDisplayLabel,
  activeConvOwnerScope,
} from "./auditScope.ts";
import {
  enrichLogVista,
  attachCalificacionesToVista,
  attachCalificacionesOnly,
  countLogAssistants,
  countOpenAiAssistants,
  openAiFallbackVista,
  mergeMensajesVista,
  vistaFromLogAndDetail,
  finalizeStreamInLog,
  appendStreamMsg,
  buildOptimisticUserMsg,
  fechaHoraToEpochSeconds,
} from "./mensajesModel.ts";
import { readImagesFromClipboard, filesToImageEntries } from "./images.ts";

const { useState, useEffect, useCallback, useRef, useMemo } = getReact();

export function useChatTool({ bootChat }) {
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
  const lastLogApiCountRef = useRef(0);
  const skipThreadReloadRef = useRef(null);

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
    const logAssistants = countLogAssistants(log);
    const openAiAssistants = countOpenAiAssistants(d);
    const logComplete = log?.mensajes?.length && logAssistants >= openAiAssistants;

    if (log?.mensajes?.length) {
      lastLogApiCountRef.current = log.mensajes.length;
    }

    if (logComplete) {
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

    if (d?.mensajesOpenAI?.length) {
      const vista = attachCalificacionesToVista(
        enrichLogVista(openAiFallbackVista(d.mensajesOpenAI, name), name),
        d.mensajesOpenAI,
        rated,
      );
      setLogMensajes(vista);
      setLogError("");
      return;
    }

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

    setLogMensajes([]);
    if (log === null) {
      setLogError("");
    }
  }, []);

  const patchThreadAfterSend = useCallback(async (id, { minLogMensajes = 0, ownerLabel } = {}) => {
    if (!loggedIn || !id) return;
    const name = ownerLabel || convOwnerDisplayLabel(activeConvOwnerScope(listScope, jwt?.claims));
    const useLogOnly = !jwt?.token || viewingAuditOther;
    try {
      const logResult = await fetchConvLogByIdWithRetry(id, { minMensajes: minLogMensajes }).catch(() => null);
      let d = null;
      if (!useLogOnly) {
        d = await getConversacion(jwt, id).catch(() => null);
        if (d) setDetail(d);
      }
      if (logResult?.mensajes?.length) {
        lastLogApiCountRef.current = logResult.mensajes.length;
        const vista = vistaFromLogAndDetail(d, logResult, name);
        if (vista?.length) {
          setLogMensajes((prev) => mergeMensajesVista(prev, vista));
          setLogError("");
        }
      }
    } catch {
      /* enriquecimiento en segundo plano; el hilo local ya muestra la respuesta */
    }
  }, [loggedIn, jwt, viewingAuditOther, listScope]);

  const openConv = useCallback(async (id, { silent = false, keepStream = false, freshLog = false, minLogMensajes = 0 } = {}) => {
    if (!loggedIn || !id) return;
    setSelectedId(id);
    mergePartial({ chat: { convId: id } });
    if (!silent) setLoadingThread(true);
    if (!keepStream) setStreamText("");
    setLogError("");
    const ownerLabel = convOwnerDisplayLabel(activeConvOwnerScope(listScope, jwt?.claims));
    const useLogOnly = !jwt?.token || viewingAuditOther;
    const minMensajes = freshLog
      ? Math.max(minLogMensajes, lastLogApiCountRef.current + 2)
      : 0;
    try {
      if (useLogOnly) {
        const logResult = freshLog
          ? await fetchConvLogByIdWithRetry(id, { minMensajes }).catch(() => null)
          : await fetchConvLogById(id).catch(() => null);
        const row = rows.find((r) => r.iconversacion === id);
        setDetail(row || { iconversacion: id, titulo: `Conv #${id}` });
        applyThreadFromDetail(null, logResult, ownerLabel);
        return;
      }
      const detailPromise = getConversacion(jwt, id);
      const logPromise = freshLog
        ? fetchConvLogByIdWithRetry(id, { minMensajes }).catch(() => null)
        : fetchConvLogById(id).catch(() => null);
      const [d, logResult] = await Promise.all([detailPromise, logPromise]);
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
    if (!selectedId || jwtLoading) return;
    if (skipThreadReloadRef.current === selectedId) {
      skipThreadReloadRef.current = null;
      return;
    }
    openConv(selectedId);
  }, [selectedId, jwtLoading, jwt?.token, openConv]);

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
    const logCountBefore = lastLogApiCountRef.current;
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
      const finalText = String(result.respuesta || "").trim();
      if (finalText) setStreamText(finalText);
      const newId = Number(result.iconversacion) || convIdBefore;
      setDraft("");
      setImages([]);
      setLogMensajes((prev) => enrichLogVista(
        finalizeStreamInLog(prev, finalText),
        userName,
      ));
      setSending(false);
      setStreamText("");
      if (newId) {
        if (newId !== convIdBefore) {
          skipThreadReloadRef.current = newId;
          setSelectedId(newId);
          mergePartial({ chat: { convId: newId } });
        }
        void reloadList();
        void patchThreadAfterSend(newId, {
          minLogMensajes: logCountBefore + 2,
          ownerLabel: userName,
        });
      } else if (result?.mensajesOpenAI?.length) {
        applyThreadFromDetail(result, null, userName);
      }
    } catch (e) {
      toastError(e instanceof Error ? e.message : String(e));
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

  const clearAuditFilter = useCallback(() => {
    if (jwt?.claims?.itercero) {
      handleSelectAuditScope({ esJwt: true, itercero: jwt.claims.itercero, icontacto: jwt.claims.icontacto });
    } else {
      setAuditScope(null);
      setConvListPage(1);
      setSelectedId(null);
      setDetail(null);
      setLogMensajes([]);
    }
  }, [jwt?.claims?.itercero, jwt?.claims?.icontacto, handleSelectAuditScope]);

  const auditCurrentScope = listScope ?? (jwt?.claims?.itercero
    ? { itercero: jwt.claims.itercero, icontacto: jwt.claims.icontacto, nombre: jwtUserShortName(jwt.claims) }
    : null);

  return {
    loggedIn,
    jwt,
    jwtOpen,
    jwtLoading,
    sessionUser,
    canInteract,
    canSend,
    viewOnly,
    needsJwt,
    displayScope,
    listScope,
    sessionScopeLoading,
    viewingAuditOther,
    auditScope,
    rows,
    selectedId,
    detail,
    loadingList,
    loadingThread,
    sending,
    draft,
    images,
    logError,
    metaOpen,
    metaMsg,
    payloadPreviewOpen,
    auditDialogOpen,
    convListPage,
    convListMeta,
    chatUserName,
    displayMensajes,
    showThread,
    ratingMsgId,
    threadScrollRef,
    inputRef,
    fileInputRef,
    postBodyPreview,
    auditCurrentScope,
    onThreadScroll,
    setJwt,
    setJwtOpen,
    setAuditDialogOpen,
    setPayloadPreviewOpen,
    setMetaOpen,
    setConvListPage,
    handleSelectAuditScope,
    clearAuditFilter,
    openConv,
    onNewChat,
    onDelete,
    onSend,
    onPaste,
    onAttachImagesClick,
    onAttachImagesChange,
    onMeta,
    onRateMessage,
    setDraft,
    setImages,
  };
}
