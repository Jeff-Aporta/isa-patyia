import { getReact, Session } from "../../core/platform.ts";
import {
  loadPatyJwt,
  hydratePatyJwtFromServer,
  clearPatyJwtLocal,
  canInteractPatyChat,
  canAdminPortalJwt,
  isFaithfulImpersonation,
  convBelongsToJwt,
  jwtUserShortName,
  resolveSessionBrowseScope,
  browseScopeKey,
} from "../../core/patyia-jwt.ts";
import {
  listConversaciones,
  getConversacion,
  getConversacionLogs,
  deleteConversacion,
  sendConversacionStream,
  buildConversacionPostBody,
  postMensajeCalificado,
} from "../../api/patyiaChatApi.ts";
import { fetchConvLogById, fetchConvLogByIdWithRetry, fetchConversacionesBridge } from "../../api/apiClient.ts";
import { logToMensajesVista, formatStreamError } from "../../core/convLog.ts";
import { toastError, toastSuccess, toastWarning, toastInfo, requestConfirm } from "../../core/platform.ts";
import { persistChatConvId, persistChatMessageSource, getSnapshot, subscribe } from "../../core/urlState.ts";
import { CONV_LIST_PAGE_SIZE, MAX_CHAT_IMAGES, MAX_CHAT_AUDIOS, readChatMessageSource, messageSourceFromUrl, type ChatMessageSource } from "./constants.ts";
import { useThreadScrollAnchor } from "./threadScroll.ts";
import {
  auditScopeIsOwnJwt,
  convBelongsToJwtResolved,
  convOwnerDisplayLabel,
  activeConvOwnerScope,
  resolveConvListOwnerLabel,
  resolveConvListHeader,
} from "./auditScope.ts";
import {
  enrichLogVista,
  attachCalificacionesToVista,
  attachUserImagenesFromOpenAi,
  attachAssistantTextFromOpenAi,
  attachCalificacionesOnly,
  countLogAssistants,
  countOpenAiAssistants,
  logHasOperativas,
  openAiFallbackVista,
  stripMetaFromVista,
  mergeMensajesVista,
  vistaFromLogAndDetail,
  finalizeStreamInLog,
  appendStreamMsg,
  buildOptimisticUserMsg,
  isEphemeralMsgId,
} from "./mensajesModel.ts";
import type {
  AuditScopeRow,
  BrowseScope,
  ChatImageEntry,
  ChatAudioEntry,
  ChatMensajeVista,
  ConvListMeta,
  ConvLogPayload,
  OpenConvOptions,
  PatchThreadOptions,
  PatyConversacionDetalle,
  PatyConversacionRow,
  PatyJwtRecord,
  ThreadApplyOptions,
  UseChatToolBoot,
  ClipboardPasteEvent,
  FileInputChangeEvent,
} from "./types.ts";
import { readImagesFromClipboard, filesToImageEntries, hasHeicLikeFiles, isChatImageFile } from "./images.ts";
import { createVoiceRecorder, filesToAudioEntries, isVoiceRecordingSupported, isChatAudioFile } from "./audio.ts";

const { useState, useEffect, useCallback, useRef, useMemo } = getReact();

function readBootConvId(bootChat?: UseChatToolBoot): number | null {
  const fromBoot = Number(bootChat?.convId);
  if (fromBoot > 0) return fromBoot;
  const fromUrl = Number((getSnapshot().chat as Record<string, unknown>)?.convId);
  return fromUrl > 0 ? fromUrl : null;
}

function convIdsEqual(a: number | null | undefined, b: number | null | undefined): boolean {
  return Number(a) > 0 && Number(a) === Number(b);
}

function urlChatConvId(): number | null {
  return readBootConvId();
}

function isNotFoundError(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e ?? "");
  return /not found|\b404\b/i.test(msg);
}

type LogsModeFetch = {
  d: PatyConversacionDetalle | null;
  log: ConvLogPayload | null;
  openAiDirect: boolean;
};

/** GET /conversacion/{id}/logs + bridge CONVERSACION_LOG (operativas solo están en el log). */
async function fetchLogsModeDetail(
  jwt: PatyJwtRecord,
  id: number,
  { freshLog = false, minMensajes = 0 }: { freshLog?: boolean; minMensajes?: number } = {},
): Promise<LogsModeFetch> {
  const loadLog = () => (freshLog
    ? fetchConvLogByIdWithRetry(id, { minMensajes }).catch(() => null)
    : fetchConvLogById(id).catch(() => null));

  try {
    const d = await getConversacionLogs(jwt, id);
    const log = await loadLog();
    const assistantsInLog = countLogAssistants(log);
    const assistantsInApi = countOpenAiAssistants(d);
    const logComplete = Boolean(log?.mensajes?.length && assistantsInLog >= assistantsInApi);
    const useLog = Boolean(log?.mensajes?.length && (logHasOperativas(log) || logComplete));
    return { d, log: useLog ? log : null, openAiDirect: !useLog };
  } catch (e) {
    if (!isNotFoundError(e)) throw e;
  }
  const log = await loadLog();
  const d = await getConversacion(jwt, id).catch(() => null);
  return { d, log, openAiDirect: false };
}

export function useChatTool({ bootChat }: { bootChat?: UseChatToolBoot }) {
  const [jwt, setJwt] = useState<PatyJwtRecord | null>(() => loadPatyJwt());
  const [jwtOpen, setJwtOpen] = useState(false);
  const [jwtLoading, setJwtLoading] = useState(false);
  const [authTick, setAuthTick] = useState(0);
  const [rows, setRows] = useState<PatyConversacionRow[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(() => readBootConvId(bootChat));
  const [detail, setDetail] = useState<PatyConversacionDetalle | PatyConversacionRow | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const [images, setImages] = useState<ChatImageEntry[]>([]);
  const [audios, setAudios] = useState<ChatAudioEntry[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [logMensajes, setLogMensajes] = useState<ChatMensajeVista[]>([]);
  const [ratingMsgId, setRatingMsgId] = useState<string | null>(null);
  const [loadingThread, setLoadingThread] = useState(false);
  const [logError, setLogError] = useState("");
  const [metaOpen, setMetaOpen] = useState(false);
  const [metaMsg, setMetaMsg] = useState<ChatMensajeVista | null>(null);
  const [payloadPreviewOpen, setPayloadPreviewOpen] = useState(false);
  const [auditDialogOpen, setAuditDialogOpen] = useState(false);
  /** null = contacto del JWT activo; otro valor = auditoría de ese tercero/contacto */
  const [auditScope, setAuditScope] = useState<BrowseScope | null>(null);
  /** Contacto resuelto del usuario ISA PatyIA (sin JWT). */
  const [sessionBrowseScope, setSessionBrowseScope] = useState<BrowseScope | null>(null);
  const [sessionScopeLoading, setSessionScopeLoading] = useState(false);
  const [convListPage, setConvListPage] = useState(1);
  const [convListMeta, setConvListMeta] = useState<ConvListMeta | null>(null);
  const [messageSource, setMessageSource] = useState<ChatMessageSource>(() => readChatMessageSource(bootChat));
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const attachInputRef = useRef<HTMLInputElement | null>(null);
  const voiceRecorderRef = useRef(createVoiceRecorder());
  const threadScrollRef = useRef<HTMLDivElement | null>(null);
  const lastLogApiCountRef = useRef(0);
  const skipThreadReloadRef = useRef<number | null>(null);
  /** Conv recién creada al enviar — esperar a que aparezca en la lista antes de reconciliar. */
  const pendingListConvRef = useRef<number | null>(null);

  const loggedIn = Session.isLoggedIn();
  const sessionUser = Session.username();
  const impersonating = isFaithfulImpersonation();
  const canAdminJwt = canAdminPortalJwt();
  const canInteract = canInteractPatyChat(sessionUser, jwt);
  const listScope = auditScope ?? (!jwt?.token ? sessionBrowseScope : null);
  const selectedConvRow = selectedId
    ? rows.find((r) => convIdsEqual(r.iconversacion, selectedId))
    : null;
  const selectedConvOwned = convBelongsToJwtResolved(
    detail,
    selectedConvRow,
    activeConvOwnerScope(listScope, jwt?.claims),
    jwt?.claims,
    impersonating,
  );
  const canSend = canInteract
    && auditScopeIsOwnJwt(auditScope, jwt?.claims)
    && selectedConvOwned;
  const viewingAuditOther = Boolean(
    (auditScope && (
      jwt?.claims
        ? !auditScopeIsOwnJwt(auditScope, jwt.claims)
        : sessionBrowseScope && browseScopeKey(auditScope) !== browseScopeKey(sessionBrowseScope)
    ))
    || (impersonating && Boolean(selectedId) && !selectedConvOwned),
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

  const prevSessionUserRef = useRef<string | null>(null);

  useEffect(() => {
    const prev = prevSessionUserRef.current;
    if (prev && prev !== sessionUser) {
      setAuditScope(null);
      setConvListPage(1);
      setConvListMeta(null);
      setSelectedId(null);
      setDetail(null);
      setLogMensajes([]);
      setStreamText("");
      setLogError("");
      setDraft("");
      setImages([]);
      setAudios([]);
      voiceRecorderRef.current.cancel();
      setIsRecording(false);
      persistChatConvId(null);
    }
    prevSessionUserRef.current = sessionUser;
  }, [sessionUser]);

  useEffect(() => {
    if (!loggedIn || !sessionUser) {
      setJwt(null);
      setJwtLoading(false);
      return;
    }
    let cancelled = false;
    const u = sessionUser.trim().toUpperCase();
    const cached = loadPatyJwt();
    if (cached?.token && cached.savedBy?.toUpperCase() === u) {
      setJwt(cached);
      setJwtLoading(false);
    } else {
      setJwt(null);
      setJwtLoading(true);
    }
    hydratePatyJwtFromServer(sessionUser)
      .then((rec) => { if (!cancelled) setJwt(rec); })
      .finally(() => { if (!cancelled) setJwtLoading(false); });
    return () => { cancelled = true; };
  }, [loggedIn, sessionUser]);

  useEffect(() => {
    if (!loggedIn || !sessionUser) {
      setSessionBrowseScope(null);
      setSessionScopeLoading(false);
      return undefined;
    }
    if (jwt?.token && !impersonating) {
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
  }, [loggedIn, sessionUser, jwt?.token, impersonating]);

  const reloadList = useCallback(async () => {
    if (!loggedIn) return;
    setLoadingList(true);
    try {
      const page = convListPage;
      const limit = CONV_LIST_PAGE_SIZE;
      const scope = listScope?.itercero && listScope?.icontacto
        ? { itercero: listScope.itercero, icontacto: listScope.icontacto }
        : null;

      if (jwt?.token) {
        const res = await listConversaciones(jwt, { page, limit, ...(scope || {}) });
        setRows(res.conversaciones);
        setConvListMeta({ total: res.total, page: res.page, pages: res.pages });
      } else if (scope) {
        const res = await fetchConversacionesBridge({ ...scope, page, limit });
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

  const handleSelectAuditScope = useCallback((row: AuditScopeRow) => {
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
      persistChatConvId(null);
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
      persistChatConvId(null);
      setAuditDialogOpen(false);
      toastInfo(`Conversaciones · ${row.nombre || sessionUser || "sesión"}`);
      return;
    }
    const next: BrowseScope = {
      itercero: String(row.itercero ?? ""),
      icontacto: String(row.icontacto ?? ""),
      nombre: row.nombre || null,
    };
    setAuditScope(next);
    setConvListPage(1);
    setConvListMeta(null);
    setRows([]);
    setSelectedId(null);
    setDetail(null);
    setLogMensajes([]);
    setStreamText("");
    setLogError("");
    persistChatConvId(null);
    setAuditDialogOpen(false);
    toastInfo(`Filtro · ${row.nombre || row.icontacto}`);
  }, [jwt?.claims?.itercero, jwt?.claims?.icontacto]);

  const applyThreadFromDetail = useCallback((
    d: PatyConversacionDetalle | null,
    log: ConvLogPayload | null,
    name: string,
    { openAiDirect = false, stripMeta = false }: ThreadApplyOptions = {},
  ) => {
    const rated = d?.mensajesCalificados || [];
    const logAssistants = countLogAssistants(log);
    const openAiAssistants = countOpenAiAssistants(d);
    const logComplete = Boolean(log?.mensajes?.length && logAssistants >= openAiAssistants);
    const buildFromLog = Boolean(log?.mensajes?.length && (logHasOperativas(log) || logComplete));
    const finalizeVista = (vista: ChatMensajeVista[]) => (
      stripMeta ? stripMetaFromVista(vista) : vista
    );

    if (log?.mensajes?.length) {
      lastLogApiCountRef.current = log.mensajes.length;
    }

    if (buildFromLog) {
      let vista = enrichLogVista(logToMensajesVista(log) as ChatMensajeVista[], name);
      if (d?.mensajesOpenAI?.length) {
        vista = attachCalificacionesToVista(vista, d.mensajesOpenAI, rated);
        vista = attachAssistantTextFromOpenAi(vista, d.mensajesOpenAI);
        vista = attachUserImagenesFromOpenAi(vista, d.mensajesOpenAI);
      } else if (rated.length) {
        vista = attachCalificacionesOnly(vista, rated);
      }
      setLogMensajes(finalizeVista(vista));
      setLogError("");
      return;
    }

    if (openAiDirect && d?.mensajesOpenAI?.length) {
      const vista = finalizeVista(attachUserImagenesFromOpenAi(
        attachCalificacionesToVista(
          enrichLogVista(openAiFallbackVista(d.mensajesOpenAI, name), name),
          d.mensajesOpenAI,
          rated,
        ),
        d.mensajesOpenAI,
      ));
      setLogMensajes(vista);
      setLogError("");
      return;
    }

    if (d?.mensajesOpenAI?.length) {
      const vista = finalizeVista(attachUserImagenesFromOpenAi(
        attachCalificacionesToVista(
          enrichLogVista(openAiFallbackVista(d.mensajesOpenAI, name), name),
          d.mensajesOpenAI,
          rated,
        ),
        d.mensajesOpenAI,
      ));
      setLogMensajes(vista);
      setLogError("");
      return;
    }

    if (log?.mensajes?.length) {
      let vista = enrichLogVista(logToMensajesVista(log), name);
      if (d?.mensajesOpenAI?.length) {
        vista = attachCalificacionesToVista(vista, d.mensajesOpenAI, rated);
        vista = attachAssistantTextFromOpenAi(vista, d.mensajesOpenAI);
        vista = attachUserImagenesFromOpenAi(vista, d.mensajesOpenAI);
      } else if (rated.length) {
        vista = attachCalificacionesOnly(vista, rated);
      }
      setLogMensajes(finalizeVista(vista));
      setLogError("");
      return;
    }

    setLogMensajes([]);
    if (log === null) {
      setLogError("");
    }
  }, []);

  const patchThreadAfterSend = useCallback(async (id: number, { minLogMensajes = 0, ownerLabel }: PatchThreadOptions = {}) => {
    if (!loggedIn || !id) return;
    const name = ownerLabel || convOwnerDisplayLabel(activeConvOwnerScope(listScope, jwt?.claims), jwt, sessionUser);
    const useLogBridge = !jwt?.token || viewingAuditOther;
    const prodMode = messageSource === "prod" && Boolean(jwt?.token) && !viewingAuditOther;
    const logsApiMode = messageSource === "logs" && Boolean(jwt?.token) && !viewingAuditOther;
    try {
      if (prodMode) {
        const d = await getConversacion(jwt!, id).catch(() => null);
        if (d) {
          setDetail(d);
          applyThreadFromDetail(d, null, name, { openAiDirect: true, stripMeta: true });
        }
        return;
      }
      if (logsApiMode) {
        try {
          const { d, log, openAiDirect } = await fetchLogsModeDetail(jwt!, id, { freshLog: true, minMensajes: minLogMensajes });
          if (d) {
            const row = rows.find((r) => convIdsEqual(r.iconversacion, id));
            setDetail({
              ...row,
              ...d,
              itercero: d.itercero ?? row?.itercero,
              icontacto: d.icontacto ?? row?.icontacto,
            });
            applyThreadFromDetail(d, log, name, { openAiDirect });
          } else if (log?.mensajes?.length) {
            applyThreadFromDetail(null, log, name);
          }
        } catch { /* enriquecimiento en segundo plano */ }
        return;
      }
      const logResult = await fetchConvLogByIdWithRetry(id, { minMensajes: minLogMensajes }).catch(() => null);
      let d = null;
      if (!useLogBridge) {
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
  }, [loggedIn, jwt, viewingAuditOther, listScope, messageSource, applyThreadFromDetail, rows, sessionUser]);

  const openConv = useCallback(async (id: number, { silent = false, keepStream = false, freshLog = false, minLogMensajes = 0, sourceOverride }: OpenConvOptions = {}) => {
    if (!loggedIn || !id) return;
    skipThreadReloadRef.current = id;
    setSelectedId(id);
    persistChatConvId(id);
    if (!silent) setLoadingThread(true);
    if (!keepStream) {
      setStreamText("");
      setLogMensajes([]);
    }
    setLogError("");
    const ownerLabel = convOwnerDisplayLabel(activeConvOwnerScope(listScope, jwt?.claims), jwt, sessionUser);
    const useLogBridge = !jwt?.token || viewingAuditOther;
    const activeSource = sourceOverride ?? messageSource;
    const prodMode = activeSource === "prod" && Boolean(jwt?.token) && !viewingAuditOther;
    const logsApiMode = activeSource === "logs" && Boolean(jwt?.token) && !viewingAuditOther;
    const minMensajes = freshLog
      ? Math.max(minLogMensajes, lastLogApiCountRef.current + 2)
      : 0;
    try {
      if (prodMode) {
        const d = await getConversacion(jwt!, id);
        setDetail(d);
        applyThreadFromDetail(d, null, ownerLabel, { openAiDirect: true, stripMeta: true });
        return;
      }
      if (logsApiMode) {
        const { d, log, openAiDirect } = await fetchLogsModeDetail(jwt!, id, { freshLog, minMensajes });
        if (d) {
          const row = rows.find((r) => convIdsEqual(r.iconversacion, id));
          setDetail({
            ...row,
            ...d,
            itercero: d.itercero ?? row?.itercero,
            icontacto: d.icontacto ?? row?.icontacto,
          });
        }
        else {
          const row = rows.find((r) => r.iconversacion === id);
          setDetail(row || { iconversacion: id, titulo: `Conv #${id}` });
        }
        applyThreadFromDetail(d, log, ownerLabel, { openAiDirect });
        return;
      }
      if (useLogBridge) {
        const logResult = freshLog
          ? await fetchConvLogByIdWithRetry(id, { minMensajes }).catch(() => null)
          : await fetchConvLogById(id).catch(() => null);
        const row = rows.find((r) => r.iconversacion === id);
        setDetail(row || { iconversacion: id, titulo: `Conv #${id}` });
        applyThreadFromDetail(null, logResult, ownerLabel);
        return;
      }
    } catch (e) {
      toastError(e instanceof Error ? e.message : String(e));
      setDetail(null);
      setLogMensajes([]);
    } finally {
      if (!silent) setLoadingThread(false);
    }
  }, [loggedIn, jwt, sessionUser, viewingAuditOther, listScope, rows, messageSource, applyThreadFromDetail]);

  const onMessageSourceChange = useCallback((next: ChatMessageSource) => {
    if (next === messageSource) return;
    persistChatMessageSource(next);
    setMessageSource(next);
    if (selectedId) {
      void openConv(selectedId, { silent: false, sourceOverride: next });
    }
  }, [messageSource, selectedId, openConv]);

  useEffect(() => subscribe((snap) => {
    const chat = snap.chat as Record<string, unknown> | undefined;
    const urlId = Number(chat?.convId) || null;
    setSelectedId((prev) => (prev === urlId ? prev : urlId));
    const urlSource = messageSourceFromUrl(chat);
    if (urlSource) setMessageSource((prev) => (prev === urlSource ? prev : urlSource));
  }), []);

  useEffect(() => {
    if (jwtLoading) return;
    reloadList();
  }, [reloadList, authTick, jwtLoading]);

  /** Si la conv abierta no está en el sidebar aún, mantener selección URL (F5 / carga async). */
  useEffect(() => {
    if (loadingList || jwtLoading || sending) return;
    if (!selectedId) return;

    if (pendingListConvRef.current === selectedId) {
      if (rows.some((r) => convIdsEqual(r.iconversacion, selectedId))) {
        pendingListConvRef.current = null;
      }
      return;
    }

    if (rows.length === 0) return;
    if (rows.some((r) => convIdsEqual(r.iconversacion, selectedId))) return;
    if (convIdsEqual(urlChatConvId(), selectedId)) return;
  }, [rows, loadingList, jwtLoading, sending, selectedId]);

  useEffect(() => {
    if (!selectedId || loadingList) return;
    if (jwtLoading && !jwt?.token) return;
    if (skipThreadReloadRef.current === selectedId) {
      skipThreadReloadRef.current = null;
      return;
    }
    if (pendingListConvRef.current === selectedId) return;
    const inList = rows.some((r) => convIdsEqual(r.iconversacion, selectedId));
    if (!inList && rows.length > 0 && !convIdsEqual(urlChatConvId(), selectedId)) return;
    openConv(selectedId);
  }, [selectedId, jwtLoading, jwt?.token, openConv, rows, loadingList]);

  async function onNewChat() {
    if (!canSend) { toastWarning("Modo lectura."); return; }
    setSelectedId(null);
    setDetail(null);
    setStreamText("");
    setLogMensajes([]);
    setLogError("");
    persistChatConvId(null);
    inputRef.current?.focus();
  }

  async function onDelete(id: number) {
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
    if (!text && !images.length && !audios.length) return;
    if (selectedId && !convBelongsToJwtResolved(
      detail,
      rows.find((r) => convIdsEqual(r.iconversacion, selectedId)),
      displayScope,
      jwt.claims,
      impersonating,
    )) {
      toastError("No puedes enviar mensajes en conversaciones de otro contacto");
      return;
    }
    setSending(true);
    setStreamText("");
    const imagenes = images.map((i) => i.dataUrl);
    const audioUrls = audios.map((a) => a.dataUrl);
    const convIdBefore = selectedId;
    const userName = convOwnerDisplayLabel(displayScope, jwt, sessionUser);
    const logCountBefore = lastLogApiCountRef.current;
    setDraft("");
    setImages([]);
    setAudios([]);
    if (attachInputRef.current) attachInputRef.current.value = "";
    setLogMensajes((prev) => enrichLogVista(
      [...prev, buildOptimisticUserMsg({ text, imagenes, audios: audioUrls, userName })],
      userName,
    ));
    try {
      const result = await sendConversacionStream(
        jwt,
        { prompt: text, iconversacion: selectedId || undefined, imagenes, audios: audioUrls },
        (partial) => setStreamText(partial),
      );
      const finalText = String(result.respuesta || "").trim();
      if (finalText) setStreamText(finalText);
      const streamMeta = (result as { meta?: { stream_ok?: boolean; stream_error?: string } }).meta;
      const streamFailed = streamMeta?.stream_ok === false;
      const streamError = formatStreamError(streamMeta?.stream_error);
      const newId = Number(result.iconversacion) || convIdBefore;
      const tituloStream = String(result.titulo || "").trim();
      setLogMensajes((prev) => enrichLogVista(
        finalizeStreamInLog(prev, finalText, streamFailed ? { failed: true, error: streamError } : undefined),
        userName,
      ));
      if (streamFailed) {
        toastWarning(streamError || "La respuesta no se completó correctamente.");
      }
      setSending(false);
      setStreamText("");
      if (newId) {
        if (tituloStream) {
          setRows((prev) => prev.map((r) => (
            convIdsEqual(r.iconversacion, newId) ? { ...r, titulo: tituloStream } : r
          )));
          setDetail((d) => (
            d && convIdsEqual(d.iconversacion, newId) ? { ...d, titulo: tituloStream } : d
          ));
        }
        if (newId !== convIdBefore) {
          pendingListConvRef.current = newId;
          skipThreadReloadRef.current = newId;
          setSelectedId(newId);
          persistChatConvId(newId);
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
      if (text) setDraft(text);
      if (imagenes.length) {
        setImages(imagenes.map((dataUrl, i) => ({ name: `imagen-${i + 1}`, dataUrl })));
      }
      if (audioUrls.length) {
        setAudios(audioUrls.map((dataUrl, i) => ({ name: `audio-${i + 1}`, dataUrl })));
      }
      setLogMensajes((prev) => {
        const copy = [...prev];
        for (let i = copy.length - 1; i >= 0; i -= 1) {
          if (isEphemeralMsgId(copy[i].idMsg) && copy[i].esUsuario) {
            copy.splice(i, 1);
            break;
          }
        }
        return copy;
      });
      setSending(false);
      setStreamText("");
    }
  }

  async function appendImagesFromFiles(files: FileList | File[] | null | undefined) {
    if (!files?.length) return;
    try {
      const list = Array.from(files);
      if (hasHeicLikeFiles(list)) {
        toastWarning("HEIC/HEIF no se admite; usa PNG, JPEG, WebP o GIF");
      }
      const added = await filesToImageEntries(list);
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

  async function appendAudiosFromFiles(files: FileList | File[] | null | undefined) {
    if (!files?.length) return;
    try {
      const added = await filesToAudioEntries(files);
      if (!added.length) {
        toastWarning("Solo se admiten audios (WebM, MP3, M4A, WAV, OGG)");
        return;
      }
      setAudios((prev) => {
        const merged = [...prev, ...added];
        if (merged.length > MAX_CHAT_AUDIOS) {
          toastWarning(`Máximo ${MAX_CHAT_AUDIOS} audios por mensaje`);
        }
        return merged.slice(0, MAX_CHAT_AUDIOS);
      });
    } catch (err) {
      toastError(err instanceof Error ? err.message : String(err));
    }
  }

  async function onToggleVoiceRecord() {
    if (!canSend || sending) return;
    const recorder = voiceRecorderRef.current;
    if (recorder.isActive()) {
      setIsRecording(false);
      try {
        const entry = await recorder.stop();
        if (!entry) {
          toastWarning("La grabación quedó vacía");
          return;
        }
        setAudios((prev) => {
          const merged = [...prev, entry];
          if (merged.length > MAX_CHAT_AUDIOS) {
            toastWarning(`Máximo ${MAX_CHAT_AUDIOS} audios por mensaje`);
          }
          return merged.slice(0, MAX_CHAT_AUDIOS);
        });
      } catch (err) {
        toastError(err instanceof Error ? err.message : String(err));
      }
      return;
    }
    if (!isVoiceRecordingSupported()) {
      toastWarning("Tu navegador no admite grabación de voz");
      return;
    }
    if (audios.length >= MAX_CHAT_AUDIOS) {
      toastWarning(`Máximo ${MAX_CHAT_AUDIOS} audios por mensaje`);
      return;
    }
    try {
      await recorder.start();
      setIsRecording(true);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "No se pudo acceder al micrófono");
    }
  }

  function onAttachClick() {
    attachInputRef.current?.click();
  }

  async function onAttachChange(e: FileInputChangeEvent) {
    const files = e.target.files;
    if (!files?.length) return;
    const list = Array.from(files);
    const imageFiles = list.filter(isChatImageFile);
    const audioFiles = list.filter(isChatAudioFile);
    const unsupported = list.filter((f) => !isChatImageFile(f) && !isChatAudioFile(f));
    if (unsupported.length) {
      toastWarning("Solo se admiten imágenes y audios");
    }
    if (imageFiles.length) await appendImagesFromFiles(imageFiles);
    if (audioFiles.length) await appendAudiosFromFiles(audioFiles);
    e.target.value = "";
  }

  async function onPaste(e: ClipboardPasteEvent) {
    if (!canSend) return;
    const files = readImagesFromClipboard(e.clipboardData?.items);
    if (!files.length) return;
    e.preventDefault();
    await appendImagesFromFiles(files);
  }

  const onMeta = useCallback((msg: ChatMensajeVista) => {
    setMetaMsg(msg);
    setMetaOpen(true);
  }, []);

  const onRateMessage = useCallback(async (msg: ChatMensajeVista, butil: boolean) => {
    if (!canSend || !jwt?.token || !selectedId) return;
    if (msg.calificacion !== undefined) return;
    const imensaje = Number(msg.imensaje);
    if (!imensaje) {
      toastWarning("No se puede calificar este mensaje (sin identificador de mensaje).");
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
        imensaje,
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
    () => convOwnerDisplayLabel(displayScope, jwt, sessionUser),
    [displayScope, jwt, sessionUser],
  );
  const displayMensajes = useMemo(
    () => appendStreamMsg(logMensajes, streamText, sending),
    [logMensajes, sending, streamText],
  );
  const showThread = Boolean(
    sending
    || (selectedId && (loadingThread || detail || logMensajes.length > 0)),
  );

  const onThreadScroll = useThreadScrollAnchor(threadScrollRef, displayMensajes, { sending });

  const postBodyPreview = useMemo(
    () => buildConversacionPostBody({
      prompt: draft,
      iconversacion: selectedId || undefined,
      imagenes: images.map((i) => i.dataUrl),
      audios: audios.map((a) => a.dataUrl),
    }),
    [draft, selectedId, images, audios],
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

  const convListOwnerLabel = useMemo(
    () => resolveConvListOwnerLabel(listScope, jwt, sessionUser),
    [listScope, jwt, sessionUser],
  );

  const convListHeader = useMemo(
    () => resolveConvListHeader(listScope, jwt, sessionUser),
    [listScope, jwt, sessionUser],
  );

  const sessionHasJwtAccess = Session.can("patyia.chat.interact") || canAdminJwt;
  const showJwtBadge = Boolean(jwt?.token) && sessionHasJwtAccess;

  return {
    loggedIn,
    jwt,
    jwtOpen,
    jwtLoading,
    sessionUser,
    canAdminJwt,
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
    audios,
    isRecording,
    logError,
    metaOpen,
    metaMsg,
    payloadPreviewOpen,
    auditDialogOpen,
    convListPage,
    convListMeta,
    messageSource,
    chatUserName,
    convListOwnerLabel,
    convListHeader,
    showJwtBadge,
    displayMensajes,
    showThread,
    ratingMsgId,
    threadScrollRef,
    inputRef,
    attachInputRef,
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
    onAttachClick,
    onAttachChange,
    onToggleVoiceRecord,
    onMeta,
    onRateMessage,
    onMessageSourceChange,
    setDraft,
    setImages,
    setAudios,
  };
}
