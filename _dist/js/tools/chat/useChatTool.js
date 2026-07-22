var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};

// js/core/patyia.ts
function isPatyiaApiPath(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return p.startsWith("/patyia") || p.startsWith("/api/patyia");
}
function patyiaIssBase() {
  const t = getIssTarget();
  if (t === "local") return PATYIA_ISS_LOCAL.replace(/\/$/, "");
  if (t === "production") return PATYIA_ISS_PROD_URL.replace(/\/$/, "");
  return PATYIA_ISS_URL.replace(/\/$/, "");
}
function patyiaIssCapFetchBase() {
  return patyiaIssBase();
}
function resolveIssApiBase() {
  const base = patyiaIssBase();
  return base.endsWith("/api") ? base : `${base}/api`;
}
function getIssTarget() {
  try {
    const raw = localStorage.getItem(PATYIA_ISS_TARGET_LS_KEY);
    if (raw === "production" || raw === "staging" || raw === "local") return raw;
  } catch {
  }
  return isDevHost() ? "local" : "staging";
}
function isDevHost() {
  try {
    return /^(localhost|127\.0\.0\.1|\[::1\])$/i.test(window.location.hostname);
  } catch {
    return false;
  }
}
function ensureIssLocalDefault() {
  try {
    if (localStorage.getItem(PATYIA_ISS_TARGET_LS_KEY) != null) return;
    const def = isDevHost() ? "local" : "staging";
    localStorage.setItem(PATYIA_ISS_TARGET_LS_KEY, def);
  } catch {
  }
}
function isLocalMode() {
  return getIssTarget() === "local";
}
function avatarBgFromName(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = h * 31 + name.charCodeAt(i) >>> 0;
  return AVATAR_BG_PALETTE[h % AVATAR_BG_PALETTE.length];
}
function buildUserAvatarUrl(name, size = 72) {
  const label = String(name ?? "").trim() || "Usuario";
  const initials = label.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "U";
  const bg = avatarBgFromName(label.toLowerCase());
  const half = size / 2;
  const fontSize = Math.round(size * 0.42);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${half}" cy="${half}" r="${half}" fill="#${bg}"/><text x="50%" y="50%" dy=".35em" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="${fontSize}" font-weight="bold" fill="#ffffff">${initials}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
async function readPatyiaSseStream(response, onEvent) {
  if (!response.ok) {
    let msg = response.statusText;
    try {
      const j = await response.json();
      msg = String(j?.error || j?.message || msg);
    } catch {
    }
    throw new Error(msg || `HTTP ${response.status}`);
  }
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Stream no disponible");
  const dec = new TextDecoder();
  let buf = "";
  let lastPayload = {};
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const blocks = buf.split("\n\n");
    buf = blocks.pop() || "";
    for (const block of blocks) {
      const lines = block.split("\n");
      let event = "message";
      let dataLine = "";
      for (const line of lines) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) dataLine += line.slice(5).trim();
      }
      if (!dataLine) continue;
      try {
        const data = JSON.parse(dataLine);
        lastPayload = data;
        onEvent({ event, data });
      } catch {
      }
    }
  }
  return lastPayload;
}
var ORCH_ONLINE, PATYIA_ISS_URL, PATYIA_ISS_PROD_URL, PATYIA_ISS_LOCAL, PATYIA_ISS_LOCAL_API, PATYIA_ISS_PROD_API, PATYIA_ISS_STAGING_API, PATYIA_ISS_TARGET_LS_KEY, AVATAR_BG_PALETTE;
var init_patyia = __esm({
  "js/core/patyia.ts"() {
    window.ISAFront.migrateLegacyGatewayKeys?.({ "jeff:gateway-local": "", "patyia-apptools:gateway-local": "", "patyia-apptools:lab-local": "" });
    ORCH_ONLINE = "https://main-orchestrator.jeffaporta.workers.dev";
    PATYIA_ISS_URL = "https://ayudascp-ia-staging.azurewebsites.net";
    PATYIA_ISS_PROD_URL = "https://ayudascp-ia.azurewebsites.net";
    PATYIA_ISS_LOCAL = "http://127.0.0.1:8802";
    PATYIA_ISS_LOCAL_API = `${PATYIA_ISS_LOCAL}/api`;
    PATYIA_ISS_PROD_API = `${PATYIA_ISS_PROD_URL}/api`;
    PATYIA_ISS_STAGING_API = `${PATYIA_ISS_URL}/api`;
    PATYIA_ISS_TARGET_LS_KEY = "patyia-apptools:iss-target";
    AVATAR_BG_PALETTE = [
      "1e90ff",
      "0ea5e9",
      "14b8a6",
      "22c55e",
      "84cc16",
      "eab308",
      "f97316",
      "ef4444",
      "ec4899",
      "a855f7",
      "6366f1",
      "64748b"
    ];
    try {
      window.ISAFront.buildUserAvatarUrl = buildUserAvatarUrl;
    } catch {
    }
  }
});

// js/core/platform.ts
function toastError(text, timeout) {
  fb()?.toast?.error?.(text, timeout);
}
function toastSuccess(text, timeout) {
  fb()?.toast?.success?.(text, timeout);
}
function toastInfo(text, timeout) {
  fb()?.toast?.info?.(text, timeout);
}
function toastWarning(text, timeout) {
  fb()?.toast?.warning?.(text, timeout);
}
function requestConfirm(opts) {
  return fb()?.confirm?.(opts) ?? Promise.resolve(false);
}
var bridge, Session, Config, getReact, fb;
var init_platform = __esm({
  "js/core/platform.ts"() {
    init_patyia();
    bridge = () => window.ISAFront.createPlatformBridge("ISA");
    Session = {
      current: () => bridge().Session.current(),
      isLoggedIn: () => bridge().Session.isLoggedIn(),
      username: () => bridge().Session.username(),
      realUsername: () => bridge().Session.realUsername?.() ?? bridge().Session.username(),
      auditAuthor: () => bridge().Session.auditAuthor?.() ?? String(bridge().Session.username() || "").trim().toUpperCase(),
      authHeader: () => bridge().Session.authHeader(),
      appHeader: () => bridge().Session.appHeader(),
      appId: () => bridge().Session.appId(),
      login: (u, p, opts) => bridge().Session.login(u, p, opts),
      logout: () => bridge().Session.logout(),
      refreshProfile: () => bridge().Session.refreshProfile(),
      capabilities: () => bridge().Session.capabilities(),
      adminCapabilities: () => bridge().Session.adminCapabilities?.() ?? bridge().Session.capabilities(),
      capabilityCatalog: () => bridge().Session.capabilityCatalog?.() ?? [],
      can: (cap) => bridge().Session.can(cap),
      blockReason: (cap) => bridge().Session.blockReason(cap),
      get EVENT() {
        return bridge().Session.EVENT;
      }
    };
    Config = {
      base: () => bridge().Config.base(),
      apiUrl: (path) => bridge().Config.apiUrl(path),
      isLocal: () => bridge().Config.isLocal(),
      setLocal: (on) => bridge().Config.setLocal(on),
      get EVENT() {
        return bridge().Config.EVENT;
      }
    };
    getReact = () => window.ISAFront.getReact();
    fb = () => globalThis.ISAFront?.Feedback;
  }
});

// js/api/portalJwtApi.ts
function orchBase() {
  return ORCH_ONLINE.replace(/\/$/, "");
}
function authHeaders() {
  const h = { Accept: "application/json" };
  if (Session.isLoggedIn()) {
    Object.assign(h, Session.authHeader(), Session.appHeader());
  }
  return h;
}
function portalUrl(portal, query = "") {
  const q = `portal=${encodeURIComponent(portal)}${query ? `&${query}` : ""}`;
  return `${orchBase()}/api/auth/portal-jwt?${q}`;
}
async function fetchPortalJwt(portal = PATYIA_PORTAL_ID) {
  const res = await fetch(portalUrl(portal), { headers: authHeaders() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    throw new Error(data.error || "No se pudo cargar el JWT del portal");
  }
  return data;
}
var PATYIA_PORTAL_ID;
var init_portalJwtApi = __esm({
  "js/api/portalJwtApi.ts"() {
    init_platform();
    init_patyia();
    PATYIA_PORTAL_ID = "soporte-staging";
  }
});

// js/api/issListFilter.ts
function encodeIssListFilterB64(filter) {
  const json = JSON.stringify(filter);
  return btoa(unescape(encodeURIComponent(json)));
}
function buildConversacionesListFilter(input = {}) {
  const limit = Math.min(100, Math.max(1, Math.floor(Number(input.limit) || 10)));
  const offset = Math.max(0, Math.floor(Number(input.offset) || 0));
  const sort = String(input.sort || CONVERSACIONES_LIST_SORT_DEFAULT).trim() || CONVERSACIONES_LIST_SORT_DEFAULT;
  const search = String(input.search ?? "").trim().slice(0, 200);
  return {
    limit,
    offset,
    sort,
    ...search ? { search } : {}
  };
}
function conversacionesListQueryParams(input = {}) {
  const limit = Math.min(100, Math.max(1, Math.floor(Number(input.limit) || 10)));
  const page = Math.max(1, Math.floor(Number(input.page) || 1));
  const offset = (page - 1) * limit;
  const qs = new URLSearchParams();
  qs.set(ISS_LIST_FILTER_QUERY_PARAM, encodeIssListFilterB64(buildConversacionesListFilter({
    search: input.search,
    limit,
    offset,
    sort: input.sort
  })));
  const itercero = String(input.itercero ?? "").trim();
  const icontacto = String(input.icontacto ?? "").trim();
  if (itercero && icontacto) {
    qs.set("itercero", itercero);
    qs.set("icontacto", icontacto);
  }
  return qs;
}
var ISS_LIST_FILTER_QUERY_PARAM, CONVERSACIONES_LIST_SORT_DEFAULT;
var init_issListFilter = __esm({
  "js/api/issListFilter.ts"() {
    ISS_LIST_FILTER_QUERY_PARAM = "f";
    CONVERSACIONES_LIST_SORT_DEFAULT = "-iconversacion";
  }
});

// js/api/patyiaTokens.ts
function patyAuthHeaders(jwt, extra = {}) {
  return {
    Authorization: `Bearer ${jwt.token}`,
    Accept: "application/json",
    ...extra
  };
}
var init_patyiaTokens = __esm({
  "js/api/patyiaTokens.ts"() {
    init_platform();
  }
});

// js/api/patyiaChatApi.ts
function authHeaders2(jwt, extra = {}) {
  return patyAuthHeaders(jwt, extra);
}
function unwrapBody(data) {
  const d = data;
  if (d?.respuesta && typeof d.respuesta === "object") return d.respuesta;
  if (d?.body && typeof d.body === "object") return d.body;
  return d;
}
async function jsonFetch(path, jwt, init) {
  const base = resolveIssApiBase();
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      ...authHeaders2(jwt),
      ...init?.method && init.method !== "GET" ? { "Content-Type": "application/json" } : {},
      ...init?.headers || {}
    }
  });
  const ct = res.headers.get("content-type") || "";
  if (!res.ok) {
    let msg = res.statusText;
    if (ct.includes("json")) {
      try {
        const j = await res.json();
        const enc = j.encabezado;
        if (enc?.mensaje) msg = String(enc.mensaje);
        else {
          const inner = j.respuesta || j.body || j;
          msg = String(inner?.error || inner?.mensaje || j.error || j.message || msg);
        }
      } catch {
      }
    }
    const err = new Error(msg || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  if (ct.includes("json")) {
    const raw = await res.json();
    return unwrapBody(raw);
  }
  return {};
}
function buildConversacionesListPath(input = {}) {
  const qs = conversacionesListQueryParams({
    page: input.page,
    limit: input.limit,
    search: input.search,
    sort: input.sort,
    itercero: input.itercero,
    icontacto: input.icontacto
  });
  return `/conversaciones?${qs.toString()}`;
}
async function listConversaciones(jwt, input = {}) {
  const page = Math.max(1, Math.floor(Number(input.page) || 1));
  const limit = Math.min(100, Math.max(1, Math.floor(Number(input.limit) || 10)));
  const body = await jsonFetch(buildConversacionesListPath(input), jwt);
  const conversaciones = Array.isArray(body.conversaciones) ? body.conversaciones : [];
  const total = Number(body.total ?? 0) || 0;
  const resLimit = Number(body.limit ?? limit) || limit;
  const resPage = Number(body.page ?? page) || page;
  const pages = Number(body.pages ?? 0) || (total > 0 ? Math.ceil(total / resLimit) : 0);
  return { conversaciones, total, page: resPage, limit: resLimit, pages };
}
async function getConversacion(jwt, id) {
  return jsonFetch(`/conversacion/${id}`, jwt);
}
async function getConversacionLogs(jwt, id) {
  return jsonFetch(`/conversacion/logs/${id}`, jwt);
}
function convLogFromDetalle(detail, id) {
  const raw = detail?.convLog;
  if (!raw || !Array.isArray(raw.mensajes) || !raw.mensajes.length) return null;
  const convId = Number(raw.iconversacion ?? detail?.iconversacion ?? id ?? 0);
  return { ...raw, iconversacion: convId > 0 ? convId : raw.iconversacion };
}
async function getConversacionLogsWithRetry(jwt, id, { minMensajes = 0, attempts = 8, delayMs = 300 } = {}) {
  let last = null;
  for (let i = 0; i < attempts; i++) {
    try {
      const detail = await getConversacionLogs(jwt, id);
      last = detail;
      const n = convLogFromDetalle(detail, id)?.mensajes?.length ?? 0;
      if (!minMensajes || n >= minMensajes) return detail;
    } catch (e) {
      if (i === attempts - 1 && !last) throw e;
    }
    if (i < attempts - 1) {
      await new Promise((resolve) => {
        setTimeout(resolve, delayMs);
      });
    }
  }
  if (!last) throw new Error(`Log conv-${id} no encontrado`);
  return last;
}
async function deleteConversacion(jwt, id) {
  await jsonFetch(`/conversacion/${id}`, jwt, { method: "DELETE" });
}
async function postMensajeCalificado(jwt, input) {
  return jsonFetch("/mensaje", jwt, {
    method: "POST",
    body: JSON.stringify(input)
  });
}
function isHttpUrl(s) {
  return /^https?:\/\//i.test(String(s || "").trim());
}
function isLegacyDataUrl(s) {
  const v = String(s || "").trim();
  return v.startsWith("data:audio/") || v.startsWith("data:image/");
}
function buildConversacionPostBody(input) {
  const text = String(input.prompt || "").trim();
  const imagenes = (input.imagenes || []).map((s) => String(s || "").trim()).filter((s) => isHttpUrl(s) || isLegacyDataUrl(s));
  const audios = (input.audios || []).map((s) => String(s || "").trim()).filter((s) => isHttpUrl(s) || isLegacyDataUrl(s));
  const hasMedia = imagenes.length > 0 || audios.length > 0;
  const body = {
    prompt: text || (imagenes.length ? "(imagen adjunta)" : audios.length ? "(nota de voz)" : "")
  };
  if (input.iconversacion) body.iconversacion = input.iconversacion;
  if (imagenes.length) body.imagenes = imagenes;
  if (audios.length) body.audios = audios;
  if (input.mode && String(input.mode).trim().toLowerCase() !== "patyia") {
    body.mode = String(input.mode).trim().toLowerCase();
  }
  const provider = String(input.provider || "").trim().toLowerCase();
  if (provider && provider !== "openai") {
    body.provider = provider;
  }
  if (!String(body.prompt || "").trim() && hasMedia) {
    body.prompt = imagenes.length ? "(imagen adjunta)" : "(nota de voz)";
  }
  return body;
}
async function sendConversacionStream(jwt, input, onDelta) {
  const body = buildConversacionPostBody(input);
  const base = resolveIssApiBase();
  const res = await fetch(`${base}/conversacion`, {
    method: "POST",
    headers: authHeaders2(jwt, {
      "Content-Type": "application/json",
      Accept: "text/event-stream"
    }),
    body: JSON.stringify(body)
  });
  let streamingText = "";
  const finalPayload = await readPatyiaSseStream(res, (ev) => {
    if (ev.event === "begin") {
      onDelta("", ev.data);
      return;
    }
    if ((ev.event === "message" || ev.event === "end") && typeof ev.data.respuesta === "string") {
      streamingText = ev.data.respuesta;
      onDelta(streamingText, ev.data);
    }
    if (ev.event === "error") {
      throw new Error(String(ev.data.respuesta || ev.data.error || "Error en stream"));
    }
  });
  return {
    ...finalPayload,
    respuesta: streamingText || String(finalPayload.respuesta || "")
  };
}
var init_patyiaChatApi = __esm({
  "js/api/patyiaChatApi.ts"() {
    init_issListFilter();
    init_patyiaTokens();
    init_patyia();
  }
});

// js/tools/permAccessFromMap.js
function normalizePath(path) {
  let p = String(path ?? "").trim();
  try {
    if (/^https?:\/\//i.test(p)) p = new URL(p).pathname;
  } catch {
  }
  if (!p.startsWith("/")) p = `/${p}`;
  return p.replace(/\/+$/, "") || "/";
}
function patternMatch(pattern, key) {
  if (pattern === key) return true;
  if (!pattern.includes("{") && !pattern.includes("*")) return false;
  const escLit = (s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  const reBody = pattern.split(/(\{[^}]+\})/).map((seg) => /^\{[^}]+\}$/.test(seg) ? ".+" : seg.split("*").map(escLit).join("[^/]+")).join("");
  return new RegExp(`^${reBody}$`).test(key);
}
function resolveAccess(perms, method, path) {
  const map = perms && typeof perms === "object" ? perms : {};
  const key = `${String(method ?? "GET").toUpperCase()}:${normalizePath(path)}`;
  if (key in map) return map[key];
  let bestPat = "";
  let best = null;
  for (const [pat, restr] of Object.entries(map)) {
    if (!String(pat).includes(":")) continue;
    if (!patternMatch(pat, key)) continue;
    if (pat.length >= bestPat.length) {
      bestPat = pat;
      best = restr;
    }
  }
  return best;
}
function hasAccess(perms, method, path) {
  return resolveAccess(perms, method, path) != null && resolveAccess(perms, method, path) !== false;
}
function canAccessOthers(perms, method, path) {
  const r = resolveAccess(perms, method, path);
  if (r == null || r === false) return false;
  if (r === true) return true;
  if (typeof r === "object") {
    const f = r.filter;
    return !(f && typeof f === "object" && !Array.isArray(f) && Object.keys(f).length);
  }
  return false;
}
function capsFromPermisosEfectivos(perms) {
  const p = perms ?? {};
  const manage = hasAccess(p, "PUT", API_PERMISOS) || hasAccess(p, "DELETE", API_PERMISOS);
  const assign = hasAccess(p, "PUT", API_ROLES);
  return {
    canEditOpenAiConfig: hasAccess(p, "PUT", "/api/system/openai"),
    canEditSwagger: hasAccess(p, "PUT", "/api/system/swagger.json"),
    canEditInstrucciones: hasAccess(p, "PUT", "/api/system/instrucciones") || hasAccess(p, "POST", "/api/patyia/instrucciones/publish"),
    canEditPromptsOperativos: hasAccess(p, "PUT", "/api/system/prompts-operativos"),
    canEditConversacionConfig: hasAccess(p, "PUT", "/api/system/config/conversacion"),
    canOverrideSampling: canAccessOthers(p, "POST", "/api/conversacion"),
    canManagePermissions: manage,
    canAssignUserRoles: assign,
    canEditRoleDescriptions: manage,
    canAccessOthers: canAccessOthers(p, "GET", "/api/conversaciones"),
    canViewKanban: hasAccess(p, "GET", "/api/permisos/usuarios") || hasAccess(p, "GET", API_PERMISOS),
    canEditKanbanCards: assign || hasAccess(p, "POST", "/api/system/permisos/usuarios"),
    canViewLogs: hasAccess(p, "GET", "/api/conversacion/logs/{id}") || hasAccess(p, "GET", "/api/conversacion/logs/*"),
    canViewPrompts: hasAccess(p, "GET", "/api/system/instrucciones"),
    canViewChat: hasAccess(p, "POST", "/api/conversacion") || hasAccess(p, "POST", "/api/mensaje") || hasAccess(p, "GET", "/api/conversaciones"),
    canViewConfig: hasAccess(p, "GET", "/api/system/openai") || hasAccess(p, "GET", "/api/system/prompts-operativos") || hasAccess(p, "GET", "/api/system/instrucciones") || hasAccess(p, "GET", "/api/system/config/conversacion") || hasAccess(p, "GET", "/api/system/swagger.json") || hasAccess(p, "GET", API_PERMISOS),
    canSendChat: hasAccess(p, "POST", "/api/conversacion") && hasAccess(p, "POST", "/api/mensaje")
  };
}
var API_PERMISOS, API_ROLES;
var init_permAccessFromMap = __esm({
  "js/tools/permAccessFromMap.js"() {
    API_PERMISOS = "/api/system/permisos";
    API_ROLES = "/api/system/permisos/usuarios/*/roles";
  }
});

// js/api/systemConfigApi.ts
function systemApiBase() {
  return resolveIssApiBase();
}
function resolveIssAuthMode() {
  const base = systemApiBase();
  if (/127\.0\.0\.1|localhost|:8802/i.test(base)) return "is";
  return "w";
}
function systemApiHeaders(extra = {}) {
  const mode = resolveIssAuthMode();
  const h = {
    Accept: "application/json",
    "X-Patyia-Auth-Mode": mode,
    ...extra
  };
  if (mode === "is") {
    const paty = loadPatyJwt();
    if (paty?.token && !isPatyJwtExpired(paty.token)) {
      h.Authorization = `Bearer ${paty.token}`;
      if (Session.isLoggedIn()) {
        const app = { ...Session.appHeader() };
        for (const k of Object.keys(app)) {
          if (/^authorization$/i.test(k)) delete app[k];
        }
        Object.assign(h, app);
      }
    } else if (Session.isLoggedIn()) {
      Object.assign(h, Session.authHeader(), Session.appHeader());
    }
  } else if (Session.isLoggedIn()) {
    Object.assign(h, Session.authHeader(), Session.appHeader());
  }
  return h;
}
function unwrapBody2(data) {
  const d = data;
  const enc = d?.encabezado;
  if (enc && typeof enc === "object" && !Array.isArray(enc) && enc.resultado === false) {
    const e = enc;
    const msg = String(e.mensaje ?? e.imensaje ?? "").trim();
    throw new Error(msg || "Error en la respuesta del servidor");
  }
  let inner = d;
  if (d?.respuesta && typeof d.respuesta === "object" && !Array.isArray(d.respuesta)) {
    inner = d.respuesta;
  } else if (d?.body && typeof d.body === "object" && !Array.isArray(d.body)) {
    inner = d.body;
  }
  const nested = inner;
  if (nested?.respuesta && typeof nested.respuesta === "object" && !Array.isArray(nested.respuesta)) {
    inner = nested.respuesta;
  }
  return inner;
}
function permissionsMeSessionKey() {
  if (!Session.isLoggedIn()) return "anon";
  const tok = Session?.current?.()?.token;
  const user = Session.username?.() || Session?.current?.()?.username;
  return String(tok || user || "anon").trim();
}
async function fetchPermissionsMe(opts) {
  if (!Session.isLoggedIn() && !loadPatyJwt()?.token) return null;
  const headers = systemApiHeaders();
  if (!headers.Authorization && !headers.authorization) {
    return null;
  }
  const sessionKey = permissionsMeSessionKey();
  if (!opts?.force && PERMISSIONS_ME_CACHE.value && PERMISSIONS_ME_CACHE.key === sessionKey && Date.now() - PERMISSIONS_ME_CACHE.iat < PERMISSIONS_ME_CACHE.ttlMs) {
    return PERMISSIONS_ME_CACHE.value;
  }
  if (!opts?.force && PERMISSIONS_ME_INFLIGHT) return PERMISSIONS_ME_INFLIGHT;
  const f = opts?.fetchImpl ?? fetch;
  const req = (async () => {
    const res = await f(`${systemApiBase()}/permissions/me`, {
      method: "GET",
      headers: { ...headers, Accept: "application/json" },
      credentials: "omit"
    });
    if (res.status === 401) {
      PERMISSIONS_ME_CACHE.value = null;
      return null;
    }
    if (!res.ok) return PERMISSIONS_ME_CACHE.value;
    const data = unwrapBody2(await res.json());
    if (!data || data.kind !== "insoft.permissions-me") return PERMISSIONS_ME_CACHE.value;
    PERMISSIONS_ME_CACHE.value = data;
    PERMISSIONS_ME_CACHE.iat = data.iat || Date.now();
    PERMISSIONS_ME_CACHE.ttlMs = data.ttlMs || 8 * 60 * 60 * 1e3;
    PERMISSIONS_ME_CACHE.key = sessionKey;
    return data;
  })().finally(() => {
    if (PERMISSIONS_ME_INFLIGHT === req) PERMISSIONS_ME_INFLIGHT = null;
  });
  PERMISSIONS_ME_INFLIGHT = req;
  return req;
}
function clearPermissionsMeCache() {
  PERMISSIONS_ME_CACHE.value = null;
  PERMISSIONS_ME_CACHE.iat = 0;
  PERMISSIONS_ME_CACHE.ttlMs = 0;
  PERMISSIONS_ME_CACHE.key = "";
}
function invalidatePermisosCache() {
  PERMISOS_LIST_CACHE.clear();
  PERMISOS_LIST_INFLIGHT.clear();
  clearPermissionsMeCache();
}
var PERMISSIONS_ME_CACHE, PERMISSIONS_ME_INFLIGHT, PERMISOS_LIST_CACHE, PERMISOS_LIST_INFLIGHT;
var init_systemConfigApi = __esm({
  "js/api/systemConfigApi.ts"() {
    init_platform();
    init_patyia();
    init_patyia_jwt();
    init_permAccessFromMap();
    PERMISSIONS_ME_CACHE = { value: null, iat: 0, ttlMs: 0, key: "" };
    PERMISSIONS_ME_INFLIGHT = null;
    PERMISOS_LIST_CACHE = /* @__PURE__ */ new Map();
    PERMISOS_LIST_INFLIGHT = /* @__PURE__ */ new Map();
  }
});

// js/tools/roleCanonicalMeta.js
function canonicalRoleMeta(roleName) {
  const key = String(roleName ?? "").trim().toUpperCase();
  return CANONICAL_ROLE_META[key] ?? null;
}
var CANONICAL_ROLE_META;
var init_roleCanonicalMeta = __esm({
  "js/tools/roleCanonicalMeta.js"() {
    CANONICAL_ROLE_META = {
      AUDITOR: {
        namedisplay: "Auditor",
        descripcion: "Ve conversaciones de todos; chatea solo en las propias"
      },
      ADMN: {
        namedisplay: "Admn ISA-Paty",
        descripcion: "Administraci\xF3n PatyIA \u2014 sin acceso total de desarrollo"
      },
      DEVISS: {
        namedisplay: "Dev Lead ISS",
        descripcion: "L\xEDder de desarrollo \u2014 acceso total"
      },
      USR: {
        namedisplay: "Usuario",
        descripcion: "Acceso b\xE1sico de sesi\xF3n"
      }
    };
  }
});

// js/core/viewAsRole.ts
function roleKey(name) {
  return String(name ?? "").trim().toUpperCase();
}
function isDevBranchRole(roleName) {
  return roleKey(roleName) === "DEVISS";
}
function readViewAsRole() {
  try {
    const v = roleKey(localStorage.getItem(VIEW_AS_ROLE_LS_KEY));
    if (!v || v === "DEVISS") return "";
    if (!ROLE_CAPS_PRESETS[v]) return "";
    return v;
  } catch {
    return "";
  }
}
function writeViewAsRole(roleName) {
  const key = roleKey(roleName);
  try {
    if (!key || key === "DEVISS" || !ROLE_CAPS_PRESETS[key]) {
      localStorage.removeItem(VIEW_AS_ROLE_LS_KEY);
    } else {
      localStorage.setItem(VIEW_AS_ROLE_LS_KEY, key);
    }
  } catch {
  }
  try {
    window.dispatchEvent(new CustomEvent(VIEW_AS_ROLE_EVENT, { detail: { role: readViewAsRole() } }));
    window.dispatchEvent(new Event("patyia-apptools:caps-changed"));
  } catch {
  }
}
function clearViewAsRole() {
  writeViewAsRole("");
}
function capsForViewAsRole(roleName) {
  const key = roleKey(roleName);
  const preset = ROLE_CAPS_PRESETS[key];
  return preset ? { ...preset } : null;
}
function realRolesAllowViewAs(roles) {
  return (roles ?? []).some((r) => isDevBranchRole(r));
}
function clampViewAsCapsToReal(preset, realCaps) {
  const out = {};
  const real = realCaps && typeof realCaps === "object" ? realCaps : {};
  for (const [k, v] of Object.entries(preset ?? {})) {
    if (typeof v !== "boolean") continue;
    out[k] = v === true && real[k] === true;
  }
  return out;
}
var VIEW_AS_ROLE_LS_KEY, VIEW_AS_ROLE_EVENT, NONE, ROLE_CAPS_PRESETS;
var init_viewAsRole = __esm({
  "js/core/viewAsRole.ts"() {
    init_roleCanonicalMeta();
    VIEW_AS_ROLE_LS_KEY = "isa-patyia:view-as-role";
    VIEW_AS_ROLE_EVENT = "patyia-apptools:view-as-role";
    NONE = Object.freeze({
      canEditInstrucciones: false,
      canEditOpenAiConfig: false,
      canEditPromptsOperativos: false,
      canEditConversacionConfig: false,
      canEditSwagger: false,
      canOverrideSampling: false,
      canManagePermissions: false,
      canAssignUserRoles: false,
      canAccessOthers: false,
      canViewKanban: false,
      canEditKanbanCards: false,
      canViewLogs: true,
      canViewPrompts: false,
      canViewChat: true,
      canViewConfig: false,
      canSendChat: true
    });
    ROLE_CAPS_PRESETS = Object.freeze({
      USR: { ...NONE },
      AUDITOR: {
        ...NONE,
        canViewPrompts: true,
        canViewConfig: true,
        canAccessOthers: true,
        canViewKanban: true
      },
      ADMN: {
        ...NONE,
        canViewPrompts: true,
        canViewConfig: true,
        canEditOpenAiConfig: true,
        canEditConversacionConfig: true,
        canEditInstrucciones: true,
        canAssignUserRoles: true,
        canAccessOthers: true,
        canViewKanban: true,
        canEditKanbanCards: true
      },
      DEVISS: {
        canEditInstrucciones: true,
        canEditOpenAiConfig: true,
        canEditPromptsOperativos: true,
        canEditConversacionConfig: true,
        canEditSwagger: true,
        canOverrideSampling: true,
        canManagePermissions: true,
        canAssignUserRoles: true,
        canAccessOthers: true,
        canViewKanban: true,
        canEditKanbanCards: true,
        canViewLogs: true,
        canViewPrompts: true,
        canViewChat: true,
        canViewConfig: true,
        canSendChat: true
      }
    });
  }
});

// js/api/sessionApi.ts
function formatRoleTitle(roleName) {
  const key = String(roleName ?? "").trim().toUpperCase();
  if (!key) return "";
  if (key === "USR") return "Usuario";
  if (key === "ADMN") return "Admn";
  if (key === "DEVISS") return "Dev ISS";
  if (key === "AUDITOR") return "Auditor";
  return key;
}
function roleLabel(roleName) {
  const key = String(roleName ?? "").trim().toUpperCase();
  if (!key) return "";
  const canon = canonicalRoleMeta(key);
  if (canon?.namedisplay) return canon.namedisplay;
  return formatRoleTitle(key);
}
function pickPrimaryIssRole(roles) {
  const list = (roles ?? []).map((r) => String(r ?? "").trim().toUpperCase()).filter(Boolean);
  if (!list.length) return "";
  const elevated = list.filter((r) => r !== "USR");
  const pool = elevated.length ? elevated : list;
  pool.sort((a, b) => {
    const ia = ROLE_PRIORITY.indexOf(a);
    const ib = ROLE_PRIORITY.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  return pool[0];
}
function resolvePrimaryIssRoleId() {
  if (!Session.isLoggedIn()) return "";
  const key = sessionCacheKey();
  if (key === ME_CAPS_KEY && ME_ISS_ROLES.length) return pickPrimaryIssRole(ME_ISS_ROLES);
  if (key === ME_CAPS_KEY && ME_LOGIN_ROLE) return String(ME_LOGIN_ROLE).trim().toUpperCase();
  const sl = Session.current()?.role;
  return sl ? String(sl).trim().toUpperCase() : "";
}
function sessionCacheKey() {
  if (!Session.isLoggedIn()) return "";
  const tok = Session?.current?.()?.token;
  const user = Session.username?.() || Session?.current?.()?.username;
  return String(tok || user || "").trim();
}
function localMeCaps() {
  if (!Session.isLoggedIn()) return {};
  const key = sessionCacheKey();
  const real = key === ME_CAPS_KEY ? ME_CAPS : {};
  const viewAs = readViewAsRole();
  if (viewAs && canViewAsRole()) {
    const preset = capsForViewAsRole(viewAs);
    if (preset) {
      if (Object.keys(real).length) return clampViewAsCapsToReal(preset, real);
      return clampViewAsCapsToReal(preset, {});
    }
  }
  return real;
}
async function primeMeCaps(force = false) {
  if (!Session.isLoggedIn()) return;
  if (ME_CAPS_INFLIGHT) return ME_CAPS_INFLIGHT;
  const now = Date.now();
  if (now - ME_CAPS_BOOTSTRAP_TS < ME_CAPS_REENTRY_GUARD_MS) return;
  if (!force && now - ME_CAPS_BOOTSTRAP_TS < ME_CAPS_FETCH_GUARD_MS) return;
  ME_CAPS_INFLIGHT = (async () => {
    let ok = false;
    try {
      const me = await fetchPermissionsMe();
      if (me?.permisosEfectivos) {
        ME_CAPS_KEY = sessionCacheKey();
        ME_ISS_ROLES = Array.isArray(me.roles) ? me.roles.map((r) => String(r ?? "").trim()).filter(Boolean) : [];
        ME_LOGIN_ROLE = String(me.loginRole ?? "").trim();
        const caps = capsFromPermisosEfectivos(me.permisosEfectivos);
        ME_CAPS = {
          canEditInstrucciones: !!caps.canEditInstrucciones,
          canEditOpenAiConfig: !!caps.canEditOpenAiConfig,
          canEditPromptsOperativos: !!caps.canEditPromptsOperativos,
          canEditConversacionConfig: !!caps.canEditConversacionConfig,
          canEditSwagger: !!caps.canEditSwagger,
          canOverrideSampling: !!caps.canOverrideSampling,
          canManagePermissions: !!caps.canManagePermissions,
          canAssignUserRoles: !!caps.canAssignUserRoles,
          canAccessOthers: !!caps.canAccessOthers,
          canViewKanban: !!caps.canViewKanban,
          canEditKanbanCards: !!caps.canEditKanbanCards,
          canViewLogs: !!caps.canViewLogs,
          canViewPrompts: !!caps.canViewPrompts,
          canViewChat: !!caps.canViewChat,
          canViewConfig: !!caps.canViewConfig,
          canSendChat: !!caps.canSendChat
        };
        ME_CAPS_BOOTSTRAP_TS = Date.now();
        ok = true;
        if (readViewAsRole() && !realRolesAllowViewAs(ME_ISS_ROLES)) clearViewAsRole();
        window.dispatchEvent(new Event("patyia-apptools:caps-changed"));
      }
    } catch {
    }
    if (!ok && !ME_CAPS_RETRY_TIMER && Session.isLoggedIn()) {
      ME_CAPS_RETRY_TIMER = setTimeout(() => {
        ME_CAPS_RETRY_TIMER = null;
        void primeMeCaps(true);
      }, 4e3);
    }
  })().finally(() => {
    ME_CAPS_INFLIGHT = null;
  });
  return ME_CAPS_INFLIGHT;
}
function clearMeCaps() {
  ME_CAPS = {};
  ME_CAPS_KEY = "";
  ME_ISS_ROLES = [];
  ME_LOGIN_ROLE = "";
  ME_CAPS_BOOTSTRAP_TS = 0;
  ME_SERVER_INSTRUCCIONES_EDIT = null;
  if (ME_CAPS_RETRY_TIMER) {
    clearTimeout(ME_CAPS_RETRY_TIMER);
    ME_CAPS_RETRY_TIMER = null;
  }
}
function notifyAuth() {
  window.dispatchEvent(new Event(Session.EVENT));
  window.dispatchEvent(new Event("patyia-apptools:auth"));
  window.dispatchEvent(new Event("isa-patyia:auth"));
}
function canAccessOthers2() {
  if (localMeCaps().canAccessOthers) return true;
  if (roleLooksLikeDevBranch(Session.current?.()?.role)) return true;
  try {
    if (roleLooksLikeDevBranch(window.ISA?.AppSession?.resolveDisplayRole?.())) return true;
  } catch {
  }
  if (ME_ISS_ROLES.some((r) => roleLooksLikeDevBranch(r))) return true;
  return false;
}
async function login(user, pass, opts) {
  const session = await Session.login(user, pass, opts);
  notifyAuth();
  void primeMeCaps(true);
  return session;
}
function logout() {
  Session.logout();
  clearMeCaps();
  invalidatePermisosCache();
  clearViewAsRole();
  notifyAuth();
}
function roleLooksLikeDevBranch(raw) {
  const s = String(raw ?? "").trim().toUpperCase();
  if (!s) return false;
  if (isDevBranchRole(s)) return true;
  return s === "DEVISS" || /\bDEV\s*ISS\b/.test(s) || /\bDEV\s*LEAD\b/.test(s);
}
function canViewAsRole() {
  if (!Session.isLoggedIn()) return false;
  const key = sessionCacheKey();
  if (key === ME_CAPS_KEY && realRolesAllowViewAs(ME_ISS_ROLES)) return true;
  if (ME_ISS_ROLES.length && realRolesAllowViewAs(ME_ISS_ROLES)) return true;
  if (roleLooksLikeDevBranch(Session.current?.()?.role)) return true;
  try {
    if (roleLooksLikeDevBranch(window.ISA?.AppSession?.resolveDisplayRole?.())) return true;
  } catch {
  }
  return false;
}
function getViewAsRole() {
  if (!canViewAsRole() && !readViewAsRole()) return "";
  return readViewAsRole();
}
function isViewingAsRole() {
  return !!(readViewAsRole() && canViewAsRole());
}
function setViewAsRole(roleName) {
  if (!roleName) {
    clearViewAsRole();
    return;
  }
  if (!canViewAsRole()) return;
  writeViewAsRole(roleName);
}
function stopViewAsRole() {
  clearViewAsRole();
}
function resolveDisplayRole() {
  if (!Session.isLoggedIn()) return "";
  const key = sessionCacheKey();
  if (key === ME_CAPS_KEY && ME_ISS_ROLES.length) {
    return roleLabel(pickPrimaryIssRole(ME_ISS_ROLES));
  }
  if (key === ME_CAPS_KEY && ME_LOGIN_ROLE) {
    return roleLabel(ME_LOGIN_ROLE);
  }
  const sl = Session.current()?.role;
  return sl ? roleLabel(sl) : "";
}
function getSession() {
  const s = Session.current();
  if (!s) return null;
  return {
    username: Session.username(),
    realUsername: Session.realUsername(),
    role: resolveDisplayRole(),
    expiresAt: s.expiresAt,
    sessionToken: s.token,
    app: Session.appId(),
    capabilities: Session.capabilities()
  };
}
var ROLE_PRIORITY, ME_CAPS, ME_CAPS_KEY, ME_ISS_ROLES, ME_LOGIN_ROLE, ME_CAPS_BOOTSTRAP_TS, ME_CAPS_INFLIGHT, ME_CAPS_RETRY_TIMER, ME_SERVER_INSTRUCCIONES_EDIT, ME_CAPS_FETCH_GUARD_MS, ME_CAPS_REENTRY_GUARD_MS, isLoggedIn, can, blockReason, clearSession;
var init_sessionApi = __esm({
  "js/api/sessionApi.ts"() {
    init_platform();
    init_platform();
    init_systemConfigApi();
    init_permAccessFromMap();
    init_roleCanonicalMeta();
    init_viewAsRole();
    ROLE_PRIORITY = ["DEVISS", "ADMN", "AUDITOR", "USR"];
    ME_CAPS = {};
    ME_CAPS_KEY = "";
    ME_ISS_ROLES = [];
    ME_LOGIN_ROLE = "";
    ME_CAPS_BOOTSTRAP_TS = 0;
    ME_CAPS_INFLIGHT = null;
    ME_CAPS_RETRY_TIMER = null;
    ME_SERVER_INSTRUCCIONES_EDIT = null;
    ME_CAPS_FETCH_GUARD_MS = 5e3;
    ME_CAPS_REENTRY_GUARD_MS = 1500;
    isLoggedIn = () => Session.isLoggedIn();
    can = (cap) => Session.can(cap);
    blockReason = (cap) => Session.blockReason(cap);
    clearSession = logout;
    (window.ISA = window.ISA || {}).AppSession = {
      current: () => Session.current(),
      isLoggedIn,
      username: () => Session.username(),
      capabilities: () => Session.capabilities(),
      can,
      blockReason,
      login,
      logout,
      refreshProfile: () => Session.refreshProfile(),
      clearSession,
      getSession,
      resolveDisplayRole,
      canViewAsRole,
      getViewAsRole,
      isViewingAsRole,
      setViewAsRole,
      stopViewAsRole,
      resolvePrimaryIssRoleId
    };
  }
});

// js/api/apiClient.ts
function unwrapIssEnvelope(raw) {
  const d = raw;
  const enc = d?.encabezado;
  if (enc && typeof enc === "object" && !Array.isArray(enc) && enc.resultado === false) {
    const e = enc;
    const msg = String(e.mensaje ?? e.imensaje ?? "").trim();
    throw new Error(msg || "Error en la respuesta del servidor");
  }
  if (d?.respuesta && typeof d.respuesta === "object" && !Array.isArray(d.respuesta)) {
    return d.respuesta;
  }
  if (d?.body && typeof d.body === "object" && !Array.isArray(d.body)) {
    return d.body;
  }
  return d;
}
function patyiaIssPath(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return p;
}
function isConvNotFound(err) {
  const status = err && typeof err === "object" ? Number(err.status) : 0;
  if (status === 404) return true;
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return /not found|no encontrad|\b404\b/i.test(msg);
}
function isConvForbidden(err) {
  const status = err && typeof err === "object" ? Number(err.status) : 0;
  if (status === 401 || status === 403) return true;
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return /sin permiso|no tienes permiso|no autorizad|forbidden|\b403\b|\b401\b/i.test(msg);
}
async function fetchConvLogForQa(id) {
  const convId = Number(id);
  if (!Number.isInteger(convId) || convId <= 0) throw new Error("iconversacion inv\xE1lido");
  const jwt = loadPatyJwt();
  if (jwt?.token && !isPatyJwtExpired(jwt.token)) {
    try {
      const detail = await getConversacionLogs(jwt, convId);
      const log = convLogFromDetalle(detail, convId);
      if (log?.mensajes?.length) return log;
      throw new Error(`Log conv-${convId} sin mensajes`);
    } catch (e) {
      if (isConvForbidden(e) || !isConvNotFound(e)) throw e;
    }
  }
  return fetchConvLogById(convId);
}
async function fetchConvLogById(id) {
  const convId = Number(id);
  if (!Number.isInteger(convId) || convId <= 0) throw new Error("iconversacion inv\xE1lido");
  const paths = [
    patyiaIssPath(`/conversacion/${convId}/log`),
    patyiaIssPath(`/conversacion/logs/${convId}`)
  ];
  let routeMiss = null;
  for (const path of paths) {
    try {
      const data = await capFetch(path, { method: "GET" });
      const log = data.convLog ?? data.log ?? data.body?.convLog ?? data.body?.log;
      if (!log || !Array.isArray(log.mensajes)) {
        throw new Error(String(data.error || `Log conv-${convId} no encontrado`));
      }
      log.iconversacion = log.iconversacion || convId;
      return log;
    } catch (e) {
      const err = e;
      const detail = err.data?.error?.trim();
      if (detail) throw new Error(detail);
      if (err.status === 404 && !detail) {
        routeMiss = err;
        continue;
      }
      throw e;
    }
  }
  throw routeMiss ?? new Error(`Log conv-${convId} no encontrado`);
}
async function fetchConvLogByIdWithRetry(id, { minMensajes = 0, attempts = 8, delayMs = 300, qa = false } = {}) {
  const load = qa ? fetchConvLogForQa : fetchConvLogById;
  let last = null;
  for (let i = 0; i < attempts; i++) {
    try {
      const log = await load(id);
      last = log;
      const n = Array.isArray(log.mensajes) ? log.mensajes.length : 0;
      if (!minMensajes || n >= minMensajes) return log;
    } catch (e) {
      if (i === attempts - 1 && !last) throw e;
    }
    if (i < attempts - 1) {
      await new Promise((resolve) => {
        setTimeout(resolve, delayMs);
      });
    }
  }
  return last;
}
function formatIssClientError(err, fallback = "Error del servidor") {
  const data = err && typeof err === "object" ? err.data : void 0;
  const enc = data && typeof data === "object" && !Array.isArray(data) ? data.encabezado : void 0;
  const envelopeMsg = enc && typeof enc === "object" ? String(enc.mensaje ?? enc.imensaje ?? "").trim() : "";
  const raw = envelopeMsg || (err instanceof Error ? err.message : String(err ?? ""));
  const msg = raw.trim();
  if (!msg) return fallback;
  if (/failed to fetch|networkerror|load failed|econnrefused|network request failed/i.test(msg)) {
    return "Sin conexi\xF3n con el ISS. Si usas Local, arranca el servidor en :8802.";
  }
  if (/invalid signature|jwt malformed|jwt expired|token.*expir/i.test(msg)) {
    return `Auth ISS: ${msg}. En Local el front usa system-login (modo w); revisa PATYIA_AUTH_MODE=w o vuelve a iniciar sesi\xF3n.`;
  }
  if (/^internal server error$/i.test(msg) || /\b500\b/.test(msg) && /internal server error/i.test(msg)) {
    return "Error interno del ISS (HTTP 500). Revisa logs del Functions host o el detalle del envelope.";
  }
  if (/^unauthorized$/i.test(msg) || /\b401\b/.test(msg)) {
    return "Sesi\xF3n no autorizada (401). Vuelve a iniciar sesi\xF3n.";
  }
  if (/^forbidden$/i.test(msg) || /\b403\b/.test(msg)) {
    return "Sin permiso para auditar terceros (403).";
  }
  if (/^not found$/i.test(msg) || /\b404\b/.test(msg)) {
    return "Endpoint no encontrado (404). \xBFISS desactualizado o ruta incorrecta?";
  }
  return msg;
}
async function fetchTercerosAudit(input = {}) {
  const params = new URLSearchParams();
  params.set("page", String(input.page ?? 1));
  params.set("limit", String(input.limit ?? 20));
  if (input.q?.trim()) params.set("q", input.q.trim());
  if (input.jwtTercero?.trim()) params.set("jwtTercero", input.jwtTercero.trim());
  if (input.jwtContacto?.trim()) params.set("jwtContacto", input.jwtContacto.trim());
  if (input.jwtNombre?.trim()) params.set("jwtNombre", input.jwtNombre.trim());
  if (input.appUser?.trim()) params.set("appUser", input.appUser.trim());
  let raw;
  try {
    raw = await capFetch(`${patyiaIssPath("/auditoria/terceros")}?${params.toString()}`, { method: "GET" });
  } catch (err) {
    if (isLocalMode() && input.jwtToken) {
      try {
        return await fetchTercerosAuditFromLocalConversaciones(input);
      } catch (fallbackErr) {
        throw new Error(formatIssClientError(fallbackErr, formatIssClientError(err)));
      }
    }
    throw new Error(formatIssClientError(err));
  }
  try {
    const data = unwrapIssEnvelope(raw);
    if (data.ok === false) throw new Error(String(data.error || "No se pudo cargar terceros"));
    return {
      ok: true,
      rows: Array.isArray(data.rows) ? data.rows : [],
      total: Number(data.total ?? 0) || 0,
      page: Number(data.page ?? input.page ?? 1) || 1,
      limit: Number(data.limit ?? input.limit ?? 20) || 20,
      pages: Number(data.pages ?? 0) || 0
    };
  } catch (err) {
    throw new Error(formatIssClientError(err));
  }
}
async function fetchTercerosAuditFromLocalConversaciones(input) {
  const limit = input.limit ?? 20;
  const groups = /* @__PURE__ */ new Map();
  for (let page2 = 1; page2 <= 5; page2 += 1) {
    const params = conversacionesListQueryParams({ page: page2, limit: 100, sort: "-iconversacion" });
    const res = await fetch(`${PATYIA_ISS_LOCAL_API.replace(/\/$/, "")}/conversaciones?${params.toString()}`, {
      headers: { Authorization: `Bearer ${input.jwtToken}` }
    });
    if (!res.ok) throw new Error(`No se pudo cargar auditor\xEDa local (${res.status})`);
    const raw = await res.json();
    const body = raw?.respuesta ?? raw?.body ?? raw;
    const conversaciones = Array.isArray(body?.conversaciones) ? body.conversaciones : [];
    for (const conv of conversaciones) {
      const itercero = String(conv.itercero ?? "").trim();
      const icontacto = String(conv.icontacto ?? "").trim();
      if (!itercero || !icontacto) continue;
      const key = `${itercero}|${icontacto}`;
      const prev = groups.get(key);
      const fh = String(conv.fhultact ?? conv.fhcre ?? "");
      const nombre = String(conv.nick_propietario ?? "").trim() || null;
      if (!prev) {
        groups.set(key, {
          itercero,
          icontacto,
          nombre,
          total_conversaciones: 1,
          total_mensajes: Number(conv.qmensajes ?? 0) || 0,
          ultima_actividad: fh || null,
          es_jwt: itercero === String(input.jwtTercero ?? "") && icontacto === String(input.jwtContacto ?? ""),
          es_sesion: false
        });
      } else {
        prev.total_conversaciones += 1;
        prev.total_mensajes += Number(conv.qmensajes ?? 0) || 0;
        if (fh && (!prev.ultima_actividad || new Date(fh) > new Date(prev.ultima_actividad))) prev.ultima_actividad = fh;
        if (!prev.nombre && nombre) prev.nombre = nombre;
      }
    }
    if (conversaciones.length < 100) break;
  }
  const q = String(input.q ?? "").trim().toLowerCase();
  const rows = [...groups.values()].filter((r) => !q || [r.nombre, r.itercero, r.icontacto].some((v) => String(v ?? "").toLowerCase().includes(q))).sort((a, b) => String(b.ultima_actividad ?? "").localeCompare(String(a.ultima_actividad ?? "")));
  const page = Math.max(1, Number(input.page ?? 1) || 1);
  const offset = (page - 1) * limit;
  return { ok: true, rows: rows.slice(offset, offset + limit), total: rows.length, page, limit, pages: Math.max(1, Math.ceil(rows.length / limit)) };
}
var bridgeHttp, capFetch, apiUrl, rowVal;
var init_apiClient = __esm({
  "js/api/apiClient.ts"() {
    init_platform();
    init_patyia();
    init_patyia_jwt();
    init_patyiaChatApi();
    init_issListFilter();
    init_sessionApi();
    init_systemConfigApi();
    bridgeHttp = window.ISAFront.createCapFetch({
      Session,
      Config,
      getApiBase: patyiaIssCapFetchBase,
      localDirect: [
        { test: (p) => isPatyiaApiPath(p) || String(p).startsWith("/patyia"), base: PATYIA_ISS_LOCAL.replace(/\/$/, "") }
      ],
      orchOnline: PATYIA_ISS_URL,
      orchOnlineInLocal: true,
      isLocal: isLocalMode
    });
    capFetch = bridgeHttp.capFetch;
    apiUrl = bridgeHttp.apiUrl;
    rowVal = bridgeHttp.rowVal;
  }
});

// js/core/patyia-jwt.ts
function parseJwtExp(token) {
  try {
    const part = String(token || "").trim().split(".")[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    const raw = JSON.parse(json);
    return typeof raw.exp === "number" ? raw.exp : null;
  } catch {
    return null;
  }
}
function isPatyJwtExpired(token, skewSec = 60) {
  const exp = parseJwtExp(token);
  if (!exp) return false;
  return Date.now() / 1e3 >= exp - skewSec;
}
function parseJwtClaims(token) {
  try {
    const part = String(token || "").trim().split(".")[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    const raw = JSON.parse(json);
    return { itercero: raw.itercero != null ? String(raw.itercero) : void 0, icontacto: raw.icontacto != null ? String(raw.icontacto) : void 0, nombres: raw.nombres != null ? String(raw.nombres) : void 0, apellidos: raw.apellidos != null ? String(raw.apellidos) : void 0, controlkey: raw.controlkey != null ? String(raw.controlkey) : void 0, iapp: typeof raw.iapp === "number" ? raw.iapp : void 0, idmaquina: raw.idmaquina != null ? String(raw.idmaquina) : void 0 };
  } catch {
    return null;
  }
}
function jwtUserDisplayName(claims) {
  if (!claims) return "";
  return [claims.nombres, claims.apellidos].filter(Boolean).join(" ").trim();
}
function shortDisplayName(full) {
  const parts = String(full ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} ${parts[1]}`;
  return `${parts[0]} ${parts[2]}`;
}
function jwtUserShortName(claims) {
  if (!claims) return "";
  const n = String(claims.nombres ?? "").trim().split(/\s+/).filter(Boolean)[0];
  const a = String(claims.apellidos ?? "").trim().split(/\s+/).filter(Boolean)[0];
  if (n && a) return `${n} ${a}`;
  if (n) return n;
  if (a) return a;
  return shortDisplayName(jwtUserDisplayName(claims));
}
function cachePatyJwt(rec) {
  const prevRaw = sessionStorage.getItem(PATYIA_JWT_STORAGE_KEY);
  let prev = null;
  try {
    prev = prevRaw ? JSON.parse(prevRaw) : null;
  } catch {
    prev = null;
  }
  sessionStorage.setItem(PATYIA_JWT_STORAGE_KEY, JSON.stringify(rec));
  const changed = !prev || prev.token !== rec.token || String(prev.savedBy ?? "").toUpperCase() !== String(rec.savedBy ?? "").toUpperCase();
  if (changed) window.dispatchEvent(new Event("isa-patyia:paty-jwt"));
  return rec;
}
function loadPatyJwt() {
  try {
    const raw = sessionStorage.getItem(PATYIA_JWT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.token || typeof parsed.token !== "string") return null;
    if (isPatyJwtExpired(parsed.token)) {
      sessionStorage.removeItem(PATYIA_JWT_STORAGE_KEY);
      return null;
    }
    parsed.claims = parseJwtClaims(parsed.token) || parsed.claims || {};
    return parsed;
  } catch {
    return null;
  }
}
function buildPatyJwtRecord(token, savedBy, expiresAt) {
  const claims = parseJwtClaims(token);
  if (!claims?.itercero) throw new Error("Token JWT inv\xE1lido o sin itercero");
  const exp = parseJwtExp(token);
  return { token: token.trim(), savedBy: String(savedBy || "").trim().toUpperCase(), savedAt: (/* @__PURE__ */ new Date()).toISOString(), expiresAt: expiresAt ?? (exp ? new Date(exp * 1e3).toISOString() : null), claims };
}
function savePatyJwt(token, savedBy, expiresAt) {
  return cachePatyJwt(buildPatyJwtRecord(token, savedBy, expiresAt));
}
function clearPatyJwtLocal(options) {
  const had = sessionStorage.getItem(PATYIA_JWT_STORAGE_KEY);
  sessionStorage.removeItem(PATYIA_JWT_STORAGE_KEY);
  if (!options?.silent && had) window.dispatchEvent(new Event("isa-patyia:paty-jwt"));
}
async function hydratePatyJwtFromServer(username) {
  const u = String(username || "").trim().toUpperCase();
  if (!u) {
    clearPatyJwtLocal({ silent: true });
    return null;
  }
  const cached = loadPatyJwt();
  if (cached && cached.savedBy?.toUpperCase() === u) return cached;
  if (cached && cached.savedBy?.toUpperCase() !== u) clearPatyJwtLocal({ silent: true });
  try {
    const data = await fetchPortalJwt(PATYIA_PORTAL_ID);
    if (!data.token || isPatyJwtExpired(data.token)) {
      clearPatyJwtLocal({ silent: true });
      return null;
    }
    return savePatyJwt(data.token, u, data.expiresAt ?? null);
  } catch (err) {
    console.warn("[paty-jwt] hydrate fall\xF3:", err instanceof Error ? err.message : err);
    return loadPatyJwt();
  }
}
function canInteractPatyChat(sessionUser, jwt) {
  const u = String(sessionUser || "").trim().toUpperCase();
  if (!u || !jwt?.token) return false;
  if (jwt.savedBy?.toUpperCase() === u) return true;
  if (!Session.can("patyia.chat.interact")) return false;
  if (jwt.actingAsUsername && Session.can("patyia.jwt.admin")) return true;
  return false;
}
function canAdminPortalJwt() {
  return Session.can("patyia.jwt.admin");
}
function convBelongsToJwt(conv, claims) {
  if (!claims?.itercero) return false;
  return String(conv.itercero ?? "") === String(claims.itercero) && String(conv.icontacto ?? "") === String(claims.icontacto ?? "");
}
function findAuditRowForSessionUser(rows, _sessionUser) {
  return rows.find((r) => r.es_sesion) ?? null;
}
function auditRowToBrowseScope(row) {
  return { itercero: row.itercero, icontacto: row.icontacto, nombre: row.nombre ? shortDisplayName(row.nombre) : null };
}
async function resolveSessionBrowseScope(sessionUser) {
  const u = String(sessionUser ?? "").trim();
  if (!u) return null;
  let page = 1;
  const limit = 100;
  while (page <= 5) {
    const audit = await fetchTercerosAudit({ page, limit, appUser: u });
    const match = findAuditRowForSessionUser(audit.rows, u);
    if (match) return auditRowToBrowseScope(match);
    if (page >= (audit.pages || 1)) break;
    page += 1;
  }
  return null;
}
function browseScopeKey(scope) {
  if (!scope?.itercero || !scope?.icontacto) return "";
  return `${scope.itercero}|${scope.icontacto}`;
}
var PATYIA_JWT_STORAGE_KEY;
var init_patyia_jwt = __esm({
  "js/core/patyia-jwt.ts"() {
    init_portalJwtApi();
    init_apiClient();
    init_platform();
    PATYIA_JWT_STORAGE_KEY = "isa-patyia:paty-jwt";
  }
});

// js/tools/chat/useChatTool.ts
init_platform();
init_patyia_jwt();
init_patyiaChatApi();

// js/api/adjuntosApi.ts
init_patyia();
init_patyiaTokens();
var DEFAULT_CONCURRENCY = 3;
async function uploadFilesMultipart(path, jwt, input) {
  const { files, concurrency = DEFAULT_CONCURRENCY, onProgress, signal } = input;
  if (!files?.length) return [];
  const base = resolveIssApiBase();
  const headers = {};
  if (jwt) Object.assign(headers, patyAuthHeaders(jwt));
  const results = new Array(files.length);
  let cursor = 0;
  const totalBytes = files.reduce((s, f) => s + (f?.size || 0), 0);
  let loadedBytes = 0;
  const worker = async () => {
    while (true) {
      const i = cursor++;
      if (i >= files.length) return;
      const f = files[i];
      const prevBytes = loadedBytes;
      try {
        const fd = new FormData();
        fd.append("files", f, f.name || `adjunto-${i + 1}`);
        const res = await fetch(`${base}${path}`, {
          method: "POST",
          headers,
          body: fd,
          signal
        });
        const ct = res.headers.get("content-type") || "";
        const json = ct.includes("json") ? await res.json().catch(() => ({})) : {};
        if (!res.ok) {
          const err = json && typeof json === "object" && (json.error || json.message) || `HTTP ${res.status}`;
          throw new Error(typeof err === "string" ? err : JSON.stringify(err));
        }
        const itemsRaw = json && typeof json === "object" && Array.isArray(json.items) ? json.items : [];
        const uploaded = itemsRaw[i] ?? itemsRaw[0];
        if (!uploaded?.url) {
          throw new Error("ISS devolvi\xF3 items sin url");
        }
        results[i] = { ...uploaded, filename: f.name };
        loadedBytes = prevBytes + f.size;
        onProgress?.({ loaded: loadedBytes, total: totalBytes, fileIndex: i });
      } catch (err) {
        if (err?.name === "AbortError") {
          throw err;
        }
        throw new Error(`Subida fall\xF3 (${f.name || i}): ${err?.message || err}`);
      }
    }
  };
  const lanes = Array.from({ length: Math.min(concurrency, files.length) }, () => worker());
  await Promise.all(lanes);
  return results;
}
async function uploadAudios(jwt, files, onProgress, signal) {
  return uploadFilesMultipart("/adjuntos/audios", jwt, { files, onProgress, signal });
}
async function uploadImagenes(jwt, files, onProgress, signal) {
  return uploadFilesMultipart("/adjuntos/imagenes", jwt, { files, onProgress, signal });
}

// js/tools/chat/useChatTool.ts
init_issListFilter();
init_apiClient();
init_sessionApi();

// js/core/msgDateFormat.ts
function parseMsgDate(v) {
  if (v == null || v === "") return null;
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v;
  if (typeof v === "number" && Number.isFinite(v)) {
    const ms = Math.abs(v) > 1e12 ? v : v * 1e3;
    const d2 = new Date(ms);
    return Number.isNaN(d2.getTime()) ? null : d2;
  }
  const s = String(v).trim();
  if (!s) return null;
  if (/^\d+$/.test(s)) {
    const n = Number(s);
    const ms = s.length >= 13 || n > 1e12 ? n : n * 1e3;
    const d2 = new Date(ms);
    return Number.isNaN(d2.getTime()) ? null : d2;
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}
function formatMsgFecha(v) {
  const d = parseMsgDate(v);
  if (!d) {
    const raw = String(v ?? "").trim();
    return { label: raw ? raw.slice(0, 40) : "", iso: "" };
  }
  const label = d.toLocaleString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
  return { label, iso: d.toISOString() };
}

// js/core/convLog.ts
var STREAM_ERROR_LABELS = {
  stream_incomplete_or_error: "La respuesta del modelo no se complet\xF3. Vuelve a intentar o reduce el tama\xF1o de las im\xE1genes.",
  stream_failed: "El stream de respuesta fall\xF3. Vuelve a intentar.",
  stream_empty_no_response: "El modelo no devolvi\xF3 texto. Revisa la consulta o int\xE9ntalo de nuevo."
};
function formatStreamError(code) {
  const raw = String(code ?? "").trim();
  if (!raw) return void 0;
  if (STREAM_ERROR_LABELS[raw]) return STREAM_ERROR_LABELS[raw];
  if (/^[a-z0-9_]+$/i.test(raw) && raw.includes("_")) {
    return "No se pudo completar la respuesta del asistente. Vuelve a intentar.";
  }
  return raw;
}
function isStreamErrorCode(text) {
  const raw = String(text ?? "").trim();
  if (!raw) return false;
  if (raw in STREAM_ERROR_LABELS) return true;
  return /^stream_[a-z0-9_]+$/i.test(raw);
}
function isStreamErrorDisplay(text) {
  const raw = String(text ?? "").trim();
  if (!raw) return false;
  if (isStreamErrorCode(raw)) return true;
  return Object.values(STREAM_ERROR_LABELS).includes(raw);
}
function resolveAssistantLogContenido(others, receive, fallbackText) {
  const fromReceive = dedupeAssistantText(textFromOpenAIReceive(receive));
  if (fromReceive && !isStreamErrorDisplay(fromReceive)) return fromReceive;
  const fromOthers = dedupeAssistantText(String(others?.response_text ?? ""));
  if (fromOthers && !isStreamErrorDisplay(fromOthers)) return fromOthers;
  const fromFallback = dedupeAssistantText(String(fallbackText ?? ""));
  if (fromFallback && !isStreamErrorDisplay(fromFallback)) return fromFallback;
  return "";
}
function pushImage(images, ref) {
  const n = String(ref ?? "").trim();
  if (n && !isOmittedVisionRef(n)) images.push(n);
}
function isOmittedVisionRef(ref) {
  return /^\[(?:image_url omitido del log|base64 omitido)/i.test(String(ref ?? "").trim());
}
function isDisplayableImageRef(ref) {
  const n = String(ref ?? "").trim();
  if (!n || isOmittedVisionRef(n)) return false;
  return n.startsWith("data:") || /^https?:\/\//i.test(n);
}
function isDisplayableAudioRef(ref) {
  const n = String(ref ?? "").trim();
  if (!n) return false;
  return n.startsWith("data:audio/") || /^https?:\/\/.+\.(webm|mp3|m4a|wav|ogg)/i.test(n);
}
function stripOmittedVisionFromText(texto) {
  return String(texto ?? "").split("\n").filter((line) => {
    const t = line.trim();
    if (!t) return true;
    if (isOmittedVisionRef(t)) return false;
    if (/^>\s*📎\s*\[(?:image_url omitido|base64 omitido)/i.test(t)) return false;
    return true;
  }).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
function mergeUserImagenes(send, others, fallbackText) {
  const fb2 = typeof send?.text === "string" ? send.text : fallbackText;
  const { text, images } = extractUserVisionFromSendInput(send?.input ?? send?.text, fb2);
  const seen = /* @__PURE__ */ new Set();
  const imagenes = [];
  const push = (ref) => {
    const n = String(ref ?? "").trim();
    if (!isDisplayableImageRef(n) || seen.has(n)) return;
    seen.add(n);
    imagenes.push(n);
  };
  if (Array.isArray(others?.imagenes_adjuntas)) {
    for (const u of others.imagenes_adjuntas) push(u);
  }
  for (const u of images) push(u);
  return { text: stripOmittedVisionFromText(text), imagenes };
}
function collectContentPart(part, texts, images) {
  if (!part || typeof part !== "object") return;
  const type = String(part.type ?? "");
  if (type === "input_text") {
    const t = String(part.text ?? "").trim();
    if (t) texts.push(t);
    return;
  }
  if (type === "input_image") {
    if (typeof part.image_url === "string") pushImage(images, part.image_url);
    else if (part.image_url && typeof part.image_url === "object" && typeof part.image_url.url === "string") {
      pushImage(images, part.image_url.url);
    } else if (typeof part.url === "string") pushImage(images, part.url);
  }
}
function collectUserTurn(turn, texts, images) {
  if (!turn || typeof turn !== "object") return;
  if (Array.isArray(turn.content)) {
    for (const part of turn.content) collectContentPart(part, texts, images);
  }
}
function extractUserVisionFromSendInput(input, fallbackText) {
  const fb2 = String(fallbackText ?? "").trim();
  if (typeof input === "string") {
    return { text: input.trim() || fb2, images: [] };
  }
  const texts = [];
  const images = [];
  if (Array.isArray(input)) {
    for (const item of input) {
      if (typeof item === "string") {
        const t = item.trim();
        if (t) texts.push(t);
      } else {
        collectUserTurn(item, texts, images);
      }
    }
  } else {
    collectUserTurn(input, texts, images);
  }
  return { text: texts.join("\n\n").trim() || fb2, images };
}
function dedupeAssistantText(text) {
  const t = String(text || "").trim();
  if (!t) return t;
  const len = t.length;
  if (len >= 2 && len % 2 === 0 && t.slice(0, len / 2) === t.slice(len / 2)) return t.slice(0, len / 2);
  return t;
}
function textFromOpenAIReceive(rec) {
  if (!rec) return "";
  const direct = dedupeAssistantText(rec.output_text);
  if (direct) return direct;
  const output = rec.output;
  if (Array.isArray(output)) {
    const messages = output.filter((o) => o && typeof o === "object" && o.type === "message");
    if (!messages.length) return "";
    const last = messages[messages.length - 1];
    const content = last.content;
    if (!Array.isArray(content)) return "";
    const text = content.filter((c) => c && typeof c === "object" && c.type === "output_text").map((c) => String(c.text ?? "")).join("");
    return dedupeAssistantText(text);
  }
  const choices = rec.choices;
  if (Array.isArray(choices)) {
    return choices.map((c) => String(c.message?.content ?? "")).join("");
  }
  return typeof rec.text === "string" ? rec.text : "";
}
function normalizePromptText(text) {
  if (text == null) return "";
  if (Array.isArray(text)) return text.map((part) => String(part ?? "")).join("\n").replace(/\r\n/g, "\n");
  return String(text).replace(/\r\n/g, "\n");
}
function extractInstructionsMarkdown(send) {
  if (!send || typeof send !== "object") return "";
  const raw = typeof send.instructions === "string" ? send.instructions : "";
  return normalizePromptText(raw).trim();
}
function normalizeOpenAiMessageContent(content) {
  if (content == null) return "";
  if (typeof content === "string") return normalizePromptText(content).trim();
  if (Array.isArray(content)) {
    return content.map((part) => {
      if (typeof part === "string") return part;
      if (part && typeof part === "object" && "text" in part) return String(part.text ?? "");
      return String(part ?? "");
    }).filter(Boolean).join("\n").trim();
  }
  if (typeof content === "object" && content !== null && "text" in content) {
    return String(content.text ?? "").trim();
  }
  return String(content).trim();
}
function formatOpenAiMessagesMarkdown(messages) {
  if (!Array.isArray(messages) || !messages.length) return "";
  return messages.map((m) => {
    if (!m || typeof m !== "object") return "";
    const role = String(m.role ?? "message").toUpperCase();
    const body = normalizeOpenAiMessageContent(m.content);
    return body ? `**${role}**

${body}` : "";
  }).filter(Boolean).join("\n\n---\n\n");
}
function extractOperativaPromptMarkdown(send) {
  if (!send || typeof send !== "object") return "";
  const rec = send;
  const fromMessages = formatOpenAiMessagesMarkdown(rec.messages);
  if (fromMessages) return fromMessages;
  const input = rec.input;
  if (Array.isArray(input) && input.length) {
    return formatOpenAiMessagesMarkdown(input);
  }
  return "";
}
function extractUserTextFromConvSend(send) {
  if (!send || typeof send !== "object") return "";
  const input = send.input;
  if (typeof input === "string") return input.trim();
  if (!Array.isArray(input)) return "";
  return input.flatMap((turn) => {
    if (!turn || typeof turn !== "object" || turn.role !== "user") return [];
    const content = turn.content;
    if (typeof content === "string") return [content];
    if (!Array.isArray(content)) return [];
    return content.map((part) => {
      if (typeof part === "string") return part;
      if (part && typeof part === "object" && "text" in part) return String(part.text ?? "");
      return "";
    }).filter(Boolean);
  }).join("\n").trim();
}
function extractAssistantTextFromConvReceive(receive) {
  if (!receive || typeof receive !== "object") return "";
  const direct = String(receive.output_text ?? "").trim();
  if (direct) return direct;
  const output = receive.output;
  if (!Array.isArray(output)) return "";
  const messages = output.filter((o) => o && typeof o === "object" && o.type === "message");
  if (!messages.length) return "";
  const last = messages[messages.length - 1];
  const content = last.content;
  if (!Array.isArray(content)) return "";
  return content.filter((c) => c && typeof c === "object" && c.type === "output_text").map((c) => String(c.text ?? "")).join("").trim();
}
function resolveOpenAiMensajeText(m) {
  const direct = String(m?.mensaje ?? "").trim();
  if (direct && !isStreamErrorDisplay(direct)) return direct;
  const meta = m?.meta && typeof m.meta === "object" ? m.meta : null;
  if (!meta) return "";
  const isUser = String(m?.autor ?? "").toLowerCase().includes("usuario") || meta.role === "user";
  if (isUser) {
    const fromSend = extractUserTextFromConvSend(meta.send);
    if (fromSend) return fromSend;
    const input = meta.send?.input;
    if (typeof input === "string" && input.trim()) return input.trim();
    return String(meta.text ?? meta.prompt_text ?? "").trim();
  }
  const fromReceive = extractAssistantTextFromConvReceive(meta.receive);
  if (fromReceive) return fromReceive;
  const others = meta.others && typeof meta.others === "object" ? meta.others : null;
  const fromOthers = String(others?.response_text ?? "").trim();
  if (fromOthers && !isStreamErrorCode(fromOthers)) return fromOthers;
  const tail = String(meta.response_text ?? meta.text ?? "").trim();
  return isStreamErrorCode(tail) ? "" : tail;
}
function tokensFromUsage(usage) {
  if (!usage || typeof usage !== "object") return void 0;
  const input = Number(usage.input_tokens ?? usage.prompt_tokens ?? 0) || 0;
  const cached = Number(
    usage.input_tokens_details?.cached_tokens ?? usage.prompt_tokens_details?.cached_tokens ?? 0
  ) || 0;
  const output = Number(usage.output_tokens ?? usage.completion_tokens ?? 0) || 0;
  const reasoning = Number(
    usage.output_tokens_details?.reasoning_tokens ?? usage.completion_tokens_details?.reasoning_tokens ?? 0
  ) || 0;
  const total = Number(usage.total_tokens ?? 0) || input + output;
  if (!total && !input && !output) return void 0;
  return { input, cached, output, reasoning, total };
}
function ordenarMensajesConvLog(mensajes) {
  if (!mensajes.length) return [];
  const byTurno = /* @__PURE__ */ new Map();
  const sinTurno = [];
  for (const m of mensajes) {
    const t = m.turno;
    if (t == null || t <= 0) {
      sinTurno.push(m);
      continue;
    }
    if (!byTurno.has(t)) byTurno.set(t, []);
    byTurno.get(t).push(m);
  }
  const out = [];
  for (const t of [...byTurno.keys()].sort((a, b) => a - b)) {
    const g = byTurno.get(t);
    const users = g.filter((m) => m.role === "user");
    const ops = g.filter((m) => m.role === "operativa").sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0));
    const assistants = g.filter((m) => m.role === "assistant");
    out.push(...users, ...ops, ...assistants);
  }
  if (sinTurno.length) {
    sinTurno.sort((a, b) => String(a.ts ?? "").localeCompare(String(b.ts ?? "")));
    out.push(...sinTurno);
  }
  return out;
}
function flattenConvLogMensaje(m) {
  const s = m.send;
  const r = m.receive;
  const o = m.others ?? {};
  const flat = { ts: m.ts, tokens: m.tokens, cost: m.cost, usage: r?.usage, latency_ms: m.latency_ms, send: s, receive: r, others: m.others };
  if (m.role === "user") {
    const { text } = extractUserVisionFromSendInput(s?.input, typeof s?.text === "string" ? s.text : "");
    if (text) {
      flat.text = stripOmittedVisionFromText(text);
      flat.prompt_text = flat.text;
    }
    const imagenes = Array.isArray(o.imagenes_adjuntas) ? o.imagenes_adjuntas.filter(isDisplayableImageRef) : [];
    if (imagenes.length) flat.imagenes = imagenes;
    const audios = Array.isArray(o.audios_adjuntas) ? o.audios_adjuntas.filter(isDisplayableAudioRef) : [];
    if (audios.length) flat.audios = audios;
    const audiosTranscripcion = Array.isArray(o.audios_transcripcion) ? o.audios_transcripcion.map((t) => String(t ?? "").trim()).filter(Boolean) : [];
    if (audiosTranscripcion.length) flat.audios_transcripcion = audiosTranscripcion;
    const prompt = s?.prompt;
    if (prompt?.id) flat.prompt_id = prompt.id;
    if (prompt?.variables) flat.prompt_variables = prompt.variables;
  } else if (m.role === "operativa") {
    if (o.operativa_key) {
      flat.operativa_key = o.operativa_key;
      flat.prompt_id = String(o.operativa_key);
    }
    if (o.operativa_engine) flat.operativa_engine = o.operativa_engine;
    const txt = textFromOpenAIReceive(r) || String(o.response_text ?? "").trim();
    if (txt) flat.text = txt;
    if (typeof r?.model === "string") flat.model = r.model;
    const loginUrl = typeof r?.login_url === "string" ? r.login_url : typeof s?.login_url === "string" ? s.login_url : void 0;
    if (loginUrl) flat.login_url = loginUrl;
  } else if (m.role === "assistant") {
    const txt = resolveAssistantLogContenido(o, r);
    if (txt) {
      flat.text = txt;
      flat.response_text = txt;
    }
    if (typeof r?.model === "string") flat.model = r.model;
    if (typeof r?.id === "string") flat.response_id = r.id;
    if (o.engine) flat.engine = o.engine;
  }
  if (o.itdconsulta) flat.itdconsulta = o.itdconsulta;
  if (o.nombre_usuario) flat.nombre_usuario = o.nombre_usuario;
  if (o.stream_ok === false) flat.stream_ok = false;
  if (o.stream_error) flat.stream_error = o.stream_error;
  if (o.nombre_usado_en_respuesta !== void 0) flat.nombre_usado_en_respuesta = o.nombre_usado_en_respuesta;
  if (o.modelo_configurado) flat.modelo_configurado = o.modelo_configurado;
  if (o.modelo_autoswitch_vision) flat.modelo_autoswitch_vision = true;
  if (o.prompt_id && !flat.prompt_id) flat.prompt_id = o.prompt_id;
  if (o.premisas) flat.premisas = o.premisas;
  if (typeof o.prompt_chars === "number") flat.prompt_chars = o.prompt_chars;
  if (typeof o.response_chars === "number") flat.response_chars = o.response_chars;
  if (Array.isArray(o.file_search) && o.file_search.length) flat.file_search = o.file_search;
  if (Array.isArray(o.archivos_citados) && o.archivos_citados.length) flat.archivos_citados = o.archivos_citados;
  if (Array.isArray(o.chunks) && o.chunks.length) flat.chunks = o.chunks;
  if (typeof o.chunks_total === "number") flat.chunks_total = o.chunks_total;
  if (o.vector_store_ids) flat.vector_store_ids = o.vector_store_ids;
  if (Array.isArray(o.clasificador_vector_usado) && o.clasificador_vector_usado.length) {
    flat.clasificador_vector_usado = o.clasificador_vector_usado.map(String);
  }
  if (Array.isArray(o.instrucciones) && o.instrucciones.length) flat.instrucciones = o.instrucciones;
  return flat;
}
function normalizeCost(cost) {
  if (!cost || typeof cost !== "object") return void 0;
  const input_usd = Number(cost.input_usd ?? 0) || 0;
  const cached_usd = Number(cost.cached_usd ?? 0) || 0;
  const output_usd = Number(cost.output_usd ?? 0) || 0;
  const total_usd = Number(cost.total_usd ?? 0) || input_usd + cached_usd + output_usd;
  return { input_usd, cached_usd, output_usd, total_usd };
}
var ZERO_TOKENS = { input: 0, cached: 0, output: 0, reasoning: 0, total: 0 };
var ZERO_COST = { input_usd: 0, cached_usd: 0, output_usd: 0, total_usd: 0 };
function readRawMessageTokens(msg) {
  const meta = msg?.meta;
  if (!meta) return { ...ZERO_TOKENS };
  const tk = meta.tokens?.total != null ? meta.tokens : tokensFromUsage(meta.usage);
  if (!tk) return { ...ZERO_TOKENS };
  return { input: Number(tk.input ?? 0) || 0, cached: Number(tk.cached ?? 0) || 0, output: Number(tk.output ?? 0) || 0, reasoning: Number(tk.reasoning ?? 0) || 0, total: Number(tk.total ?? 0) || 0 };
}
function readMessageCost(msg) {
  return normalizeCost(msg?.meta?.cost) ?? { ...ZERO_COST };
}
function accumulateTokens(acc, tk) {
  return { input: acc.input + tk.input, cached: acc.cached + tk.cached, output: acc.output + tk.output, reasoning: acc.reasoning + tk.reasoning, total: acc.total + tk.total };
}
function accumulateCost(acc, cost) {
  return { input_usd: acc.input_usd + cost.input_usd, cached_usd: acc.cached_usd + cost.cached_usd, output_usd: acc.output_usd + cost.output_usd, total_usd: acc.total_usd + cost.total_usd };
}
function usageHasData(tokens, cost) {
  return (Number(tokens?.total ?? 0) || 0) > 0 || (Number(cost?.total_usd ?? 0) || 0) > 0;
}
function turnoFromVistaMsg(msg) {
  const im = Number(msg?.imensaje);
  if (Number.isFinite(im) && im > 0) return Math.floor(im / 1e3);
  const m = String(msg?.idMsg ?? "").match(/^msg-(\d+)$/);
  if (m) {
    const n = Number(m[1]);
    if (Number.isFinite(n) && n > 0) return Math.floor(n / 1e3);
  }
  return void 0;
}
function attachUsageStats(mensajes) {
  const list = mensajes || [];
  const userInputByTurno = /* @__PURE__ */ new Map();
  for (const m of list) {
    if (!m.esUsuario) continue;
    const turno = turnoFromVistaMsg(m);
    if (turno == null) continue;
    const tk = readRawMessageTokens(m);
    if (usageHasData(tk, null)) userInputByTurno.set(turno, tk);
  }
  let cumulativeTokens = { ...ZERO_TOKENS };
  let cumulativeCost = { ...ZERO_COST };
  let flushedTurno;
  return list.map((m) => {
    if (m.esUsuario) {
      const tokens2 = readRawMessageTokens(m);
      const cost2 = readMessageCost(m);
      if (!usageHasData(tokens2, cost2)) return { ...m, usageStats: void 0 };
      return {
        ...m,
        usageStats: {
          tokens: tokens2,
          cost: cost2,
          previousTokens: { ...ZERO_TOKENS },
          previousCost: { ...ZERO_COST },
          cumulativeTokens: { ...tokens2 },
          cumulativeCost: { ...cost2 }
        }
      };
    }
    const turno = turnoFromVistaMsg(m);
    if (turno != null && turno !== flushedTurno) {
      const userInput = userInputByTurno.get(turno);
      if (userInput && usageHasData(userInput, null)) {
        cumulativeTokens = accumulateTokens(cumulativeTokens, userInput);
      }
      flushedTurno = turno;
    }
    const previousTokens = { ...cumulativeTokens };
    const previousCost = { ...cumulativeCost };
    const tokens = readRawMessageTokens(m);
    const cost = readMessageCost(m);
    cumulativeTokens = accumulateTokens(cumulativeTokens, tokens);
    cumulativeCost = accumulateCost(cumulativeCost, cost);
    return {
      ...m,
      usageStats: {
        tokens,
        cost,
        previousTokens,
        previousCost,
        cumulativeTokens: { ...cumulativeTokens },
        cumulativeCost: { ...cumulativeCost }
      }
    };
  });
}
function normalizeMeta(raw, options = {}) {
  if (!raw || typeof raw !== "object") return null;
  const isUser = options.isUser === true;
  const operativaKey = typeof raw.operativa_key === "string" ? raw.operativa_key.trim() : "";
  const userPromptText = isUser ? String(raw.prompt_text ?? raw.text ?? extractUserTextFromConvSend(raw.send) ?? "").trim() : "";
  const assistantPromptMarkdown = !isUser ? (extractInstructionsMarkdown(raw.send) || extractOperativaPromptMarkdown(raw.send)).trim() : "";
  const promptMarkdown = isUser ? userPromptText : assistantPromptMarkdown;
  const userImagenes = isUser && Array.isArray(raw.imagenes) ? raw.imagenes.filter(isDisplayableImageRef) : [];
  const userAudios = isUser && Array.isArray(raw.audios) ? raw.audios.filter(isDisplayableAudioRef) : [];
  const userAudiosTranscripcion = isUser && Array.isArray(raw.audios_transcripcion) ? raw.audios_transcripcion.map((t) => String(t ?? "").trim()).filter(Boolean) : [];
  const promptId = !isUser ? typeof raw.prompt_id === "string" && raw.prompt_id.trim() ? raw.prompt_id.trim() : operativaKey || void 0 : void 0;
  const tokensRaw = raw.tokens;
  const tokens = tokensRaw?.total ? tokensRaw : tokensFromUsage(raw.usage) ?? tokensRaw;
  const cost = normalizeCost(raw.cost);
  return {
    ts: typeof raw.ts === "string" ? raw.ts : void 0,
    nombre_usuario: typeof raw.nombre_usuario === "string" ? raw.nombre_usuario : void 0,
    nombre_usado_en_respuesta: typeof raw.nombre_usado_en_respuesta === "boolean" ? raw.nombre_usado_en_respuesta : void 0,
    itdconsulta: typeof raw.itdconsulta === "string" ? raw.itdconsulta : void 0,
    model: typeof raw.model === "string" ? raw.model : void 0,
    modelo_configurado: typeof raw.modelo_configurado === "string" ? raw.modelo_configurado : void 0,
    modelo_autoswitch_vision: raw.modelo_autoswitch_vision === true ? true : void 0,
    prompt_id: promptId,
    premisas: Array.isArray(raw.premisas) ? raw.premisas.map(String) : void 0,
    tokens,
    cost,
    usage: raw.usage,
    response_id: typeof raw.response_id === "string" ? raw.response_id : void 0,
    prompt_variables: raw.prompt_variables,
    latency_ms: typeof raw.latency_ms === "number" ? raw.latency_ms : void 0,
    prompt_chars: typeof raw.prompt_chars === "number" ? raw.prompt_chars : promptMarkdown ? promptMarkdown.length : void 0,
    response_chars: typeof raw.response_chars === "number" ? raw.response_chars : void 0,
    stream_ok: raw.stream_ok,
    stream_error: formatStreamError(typeof raw.stream_error === "string" ? raw.stream_error : void 0),
    extra: raw.operativa_key ? {
      operativa_key: String(raw.operativa_key),
      operativa_engine: raw.operativa_engine != null ? String(raw.operativa_engine) : void 0
    } : void 0,
    prompt_markdown: promptMarkdown || void 0,
    imagenes: userImagenes.length ? userImagenes : void 0,
    audios: userAudios.length ? userAudios : void 0,
    audiosTranscripcion: userAudiosTranscripcion.length ? userAudiosTranscripcion : void 0,
    file_search: Array.isArray(raw.file_search) && raw.file_search.length ? raw.file_search : void 0,
    archivos_citados: Array.isArray(raw.archivos_citados) && raw.archivos_citados.length ? raw.archivos_citados.map(String) : void 0,
    vector_store_ids: (() => {
      const ids = raw.vector_store_ids ?? raw.vectorStoreIds;
      return Array.isArray(ids) && ids.length ? ids.map(String) : void 0;
    })(),
    chunks: Array.isArray(raw.chunks) && raw.chunks.length ? raw.chunks : void 0,
    chunks_total: typeof raw.chunks_total === "number" ? raw.chunks_total : void 0,
    clasificador_vector_usado: Array.isArray(raw.clasificador_vector_usado) && raw.clasificador_vector_usado.length ? raw.clasificador_vector_usado.map(String) : void 0,
    login_url: typeof raw.login_url === "string" && raw.login_url.trim() ? raw.login_url.trim() : void 0
  };
}
function convLogToMsgVista(m, i, userSendForTurn, userVectorStoreIds) {
  const role = String(m.role ?? "assistant");
  const esOperativa = role === "operativa";
  const esUsuario = role === "user";
  const send = m.send;
  const receive = m.receive;
  const others = m.others ?? {};
  let contenido = "";
  let imagenes = [];
  let audios = [];
  let audiosTranscripcion = [];
  if (role === "user") {
    const merged = mergeUserImagenes(send, others, String(send?.text ?? m.text ?? others.prompt_text ?? ""));
    contenido = merged.text;
    imagenes = merged.imagenes;
    audios = Array.isArray(others.audios_adjuntas) ? others.audios_adjuntas.filter(isDisplayableAudioRef) : [];
    audiosTranscripcion = Array.isArray(others.audios_transcripcion) ? others.audios_transcripcion.map((t) => String(t ?? "").trim()).filter(Boolean) : [];
  } else {
    contenido = resolveAssistantLogContenido(others, receive, m.text);
    if (esOperativa && !contenido.trim() && receive && typeof receive === "object") {
      const finish = receive.choices?.[0]?.finish_reason;
      if (finish === "length") {
        contenido = "(sin texto visible: max_completion_tokens agotado en razonamiento interno del modelo)";
      }
    }
  }
  const streamErrorRaw = typeof others.stream_error === "string" ? others.stream_error : isStreamErrorCode(others.response_text) ? String(others.response_text) : void 0;
  const streamFailed = others.stream_ok === false || Boolean(streamErrorRaw);
  const streamError = formatStreamError(streamErrorRaw);
  const opKey = others.operativa_key ?? send?.key ?? m.operativa_key;
  const flat = m.send != null || m.receive != null ? flattenConvLogMensaje(m) : m;
  if (!esUsuario && !esOperativa && userSendForTurn && !flat.send) {
    flat.send = userSendForTurn;
  }
  let meta = normalizeMeta(flat, { isUser: esUsuario });
  if (!esUsuario && userVectorStoreIds?.length && !meta?.vector_store_ids?.length) {
    meta = { ...meta, vector_store_ids: userVectorStoreIds.map(String) };
  }
  const logImensaje = (() => {
    const turno = Number(m.turno);
    const seq = Number(m.seq);
    if (!Number.isFinite(turno) || turno <= 0 || !Number.isFinite(seq) || seq <= 0) return void 0;
    return turno * 1e3 + seq;
  })();
  return {
    idMsg: logImensaje ? `msg-${logImensaje}` : `${role}-${String(m.seq ?? i)}-${String(m.turno ?? 0)}`,
    rol: esOperativa ? `OP \xB7 ${String(opKey ?? "operativa")}` : esUsuario ? "user" : "assistant",
    contenido: contenido || (esUsuario && !imagenes.length && !audios.length ? "(mensaje usuario sin texto en log)" : contenido),
    imagenes: imagenes.length ? imagenes : void 0,
    audios: audios.length ? audios : void 0,
    audiosTranscripcion: audiosTranscripcion.length ? audiosTranscripcion : void 0,
    ...(() => {
      const f = formatMsgFecha(m.ts ?? "");
      return { fecha: f.label, fechaIso: f.iso || void 0 };
    })(),
    esUsuario,
    esOperativa,
    meta,
    streamFailed,
    streamError,
    ...logImensaje ? { imensaje: logImensaje } : {}
  };
}
function logToMensajesVista(log) {
  const ordenados = ordenarMensajesConvLog(log.mensajes ?? []);
  const sendByTurno = /* @__PURE__ */ new Map();
  const vectorStoreIdsByTurno = /* @__PURE__ */ new Map();
  for (const m of ordenados) {
    if (String(m.role) === "user" && m.turno != null) {
      if (m.send) sendByTurno.set(m.turno, m.send);
      const vsIds = m.others?.vector_store_ids;
      if (Array.isArray(vsIds) && vsIds.length) vectorStoreIdsByTurno.set(m.turno, vsIds.map(String));
    }
  }
  let lastUserSend = null;
  return attachUsageStats(ordenados.map((m, i) => {
    if (String(m.role) === "user" && m.send) lastUserSend = m.send;
    const userSend = m.turno != null ? sendByTurno.get(m.turno) ?? lastUserSend : lastUserSend;
    const userVsIds = m.turno != null ? vectorStoreIdsByTurno.get(m.turno) : void 0;
    return convLogToMsgVista(m, i, userSend, userVsIds);
  }));
}

// js/tools/chat/useChatTool.ts
init_platform();

// js/core/urlState.ts
init_patyia();
var STATE_VERSION = 1;
function normalizeLog(raw) {
  if (!raw || typeof raw !== "object") return {};
  const o = { ...raw };
  const w = Number(o.sidebarW);
  if (Number.isFinite(w) && w > 0) o.sidebarW = Math.round(w);
  else delete o.sidebarW;
  return o;
}
function initial() {
  return { v: STATE_VERSION, tool: "chat", log: {}, prompts: {}, chat: { pane: "conv" }, todos: {}, config: { pane: "sistema" } };
}
function normalizeChatPane(raw) {
  return raw === "logs" ? "logs" : "conv";
}
function normalizeConfigPane(raw) {
  if (raw === "permisos") return "permisos";
  if (raw === "prompts") return "prompts";
  return "sistema";
}
function legacyConfigPaneFromLs() {
  try {
    const v = localStorage.getItem("isa-patyia:config-tab");
    if (v === "permisos" || v === "prompts") return v;
    return "sistema";
  } catch {
    return "sistema";
  }
}
function normalizeTool(raw) {
  if (raw === "log") return "chat";
  if (raw === "prompts") return "config";
  if (raw === "chat") return "chat";
  if (raw === "todos") return "todos";
  if (raw === "config") return "config";
  return "chat";
}
function normalizeChatBag(chat, legacyTool) {
  const bag = chat && typeof chat === "object" ? { ...chat } : {};
  if ((bag.mode == null || String(bag.mode).trim() === "") && bag.jailbreak != null) {
    bag.mode = bag.jailbreak === true ? "libre" : "patyia";
    delete bag.jailbreak;
  } else if (bag.jailbreak != null) {
    delete bag.jailbreak;
  }
  if (legacyTool === "log") {
    bag.pane = "logs";
  } else {
    bag.pane = normalizeChatPane(bag.pane);
  }
  return bag;
}
function normalizeConfigBag(config, legacyTool) {
  const bag = config && typeof config === "object" ? { ...config } : {};
  if (legacyTool === "prompts") {
    bag.pane = "prompts";
  } else if (bag.pane !== "sistema" && bag.pane !== "permisos" && bag.pane !== "prompts") {
    bag.pane = legacyConfigPaneFromLs();
  } else {
    bag.pane = normalizeConfigPane(bag.pane);
  }
  return bag;
}
function normalize(raw, _prev) {
  if (!raw || typeof raw !== "object") return initial();
  const legacyTool = raw.tool;
  const tool = normalizeTool(legacyTool);
  const chat = normalizeChatBag(raw.chat, legacyTool);
  const todos = raw.todos && typeof raw.todos === "object" ? raw.todos : {};
  const config = normalizeConfigBag(raw.config, legacyTool);
  return {
    v: raw.v ?? STATE_VERSION,
    tool,
    log: normalizeLog(raw.log),
    prompts: raw.prompts && typeof raw.prompts === "object" ? raw.prompts : {},
    chat,
    todos,
    config
  };
}
function slimForUrl(src) {
  const slim = { ...src };
  const log = slim.log;
  if (log) {
    const nextLog = { ...log };
    if (nextLog.jsonInput && String(nextLog.jsonInput).length > 4e3) {
      slim.log = {
        convId: nextLog.convId || "",
        ...nextLog.sidebarW != null ? { sidebarW: nextLog.sidebarW } : {}
      };
    } else {
      slim.log = nextLog;
    }
  }
  const prompts = slim.prompts;
  if (prompts?.bodies) {
    const bodies = {};
    let total = 0;
    for (const [k, v] of Object.entries(prompts.bodies)) {
      const t = String(v ?? "");
      if (total + t.length > 6e3) break;
      bodies[k] = t;
      total += t.length;
    }
    slim.prompts = { ...prompts, bodies };
  }
  return slim;
}
function mergeConfig(state, partial) {
  const prev = state.config && typeof state.config === "object" ? { ...state.config } : {};
  const next = partial && typeof partial === "object" ? partial : {};
  const prevPermisos = prev.permisos && typeof prev.permisos === "object" ? { ...prev.permisos } : {};
  const nextPermisos = next.permisos && typeof next.permisos === "object" ? next.permisos : null;
  return {
    ...prev,
    ...next,
    ...nextPermisos ? { permisos: { ...prevPermisos, ...nextPermisos } } : {}
  };
}
function merge(state, partial) {
  const nextLog = { ...state.log, ...partial.log || {} };
  if ("jsonInput" in nextLog) delete nextLog.jsonInput;
  return {
    ...state,
    ...partial,
    log: nextLog,
    prompts: {
      ...state.prompts,
      ...partial.prompts || {}
    },
    chat: {
      ...state.chat,
      ...partial.chat || {}
    },
    todos: {
      ...state.todos,
      ...partial.todos || {}
    },
    config: mergeConfig(state, partial.config)
  };
}
var URL_STATE_PARAM = "s";
function stripUrlStateParam() {
  try {
    const url = new URL(location.href);
    if (!url.searchParams.has(URL_STATE_PARAM)) return;
    url.searchParams.delete(URL_STATE_PARAM);
    history.replaceState(null, "", url);
  } catch {
  }
}
function migrateLegacyFlatQuery() {
  if (typeof window === "undefined" || !window.ISAFront?.b64urlEncode) return;
  try {
    const url = new URL(location.href);
    if (url.searchParams.has(URL_STATE_PARAM)) return;
    const tool = url.searchParams.get("tool");
    const legacyKeys = [...url.searchParams.keys()].filter(
      (k) => k === "tool" || k === "local" || k.includes(".")
    );
    if (!legacyKeys.length) return;
    const next = {
      v: STATE_VERSION,
      tool: normalizeTool(tool),
      log: {},
      prompts: {},
      chat: {},
      todos: {},
      config: {}
    };
    for (const [key, raw] of url.searchParams.entries()) {
      if (key === "tool" || key === "local") continue;
      const dot = key.indexOf(".");
      if (dot < 0) continue;
      const section = key.slice(0, dot);
      const field = key.slice(dot + 1);
      if (section !== "log" && section !== "prompts" && section !== "chat" && section !== "todos") continue;
      const bag = next[section] || {};
      if (field === "convId" && (section === "chat" || section === "log")) {
        const n = Number(raw);
        bag.convId = Number.isFinite(n) && n > 0 ? n : String(raw ?? "").trim();
      } else if (field === "mode") {
        bag.mode = String(raw ?? "").trim().toLowerCase() || "patyia";
      } else if (field === "jailbreak") {
        bag.mode = raw === "1" || raw === "true" ? "libre" : "patyia";
      } else if (field === "boardId" || field === "milestoneId" || field === "taskId") {
        const n = Number(raw);
        if (Number.isFinite(n) && n > 0) bag[field] = n;
      } else {
        bag[field] = raw;
      }
      next[section] = bag;
    }
    legacyKeys.forEach((k) => url.searchParams.delete(k));
    const slim = slimForUrl(next);
    const json = JSON.stringify(slim);
    if (json !== "{}") url.searchParams.set(URL_STATE_PARAM, window.ISAFront.b64urlEncode(json));
    history.replaceState(null, "", url);
  } catch {
  }
}
migrateLegacyFlatQuery();
var urlState = window.ISAFront.createUrlState({
  param: URL_STATE_PARAM,
  debounceMs: 350,
  maxB64Len: 12e3,
  historyKey: "patyAppState",
  initial,
  normalize,
  slimForUrl,
  merge,
  onInit() {
    ensureIssLocalDefault();
  },
  brandHomeReset(api) {
    const snap = api.reset();
    stripUrlStateParam();
    return snap;
  }
});
var bootState = urlState.boot;
var getSnapshot = urlState.getSnapshot;
var mergePartial = urlState.mergePartial;
var hrefFor = urlState.hrefFor;
var subscribe = urlState.subscribe;
var PARAM = urlState.PARAM;
function persistChatConvId(convId) {
  const snap = getSnapshot();
  const id = convId != null && Number(convId) > 0 ? Number(convId) : null;
  const prev = Number(snap.chat?.convId) || null;
  if (prev === id) return snap;
  return mergePartial({ tool: "chat", chat: { convId: id } });
}
function persistChatMessageSource(source) {
  const snap = getSnapshot();
  const prev = snap.chat?.messageSource;
  if (prev === source) return snap;
  return mergePartial({ tool: "chat", chat: { messageSource: source } });
}
function persistChatMode(mode) {
  const normalized = String(mode || "patyia").trim().toLowerCase() || "patyia";
  const snap = getSnapshot();
  const prev = String(snap.chat?.mode || "patyia");
  if (prev === normalized) return snap;
  return mergePartial({ tool: "chat", chat: { mode: normalized } });
}
function persistChatLlmProvider(provider) {
  const normalized = String(provider || "openai").trim().toLowerCase() || "openai";
  const snap = getSnapshot();
  const prev = String(snap.chat?.provider || "openai").toLowerCase();
  if (prev === normalized) return snap;
  if (normalized === "openai") {
    return mergePartial({ tool: "chat", chat: { provider: void 0 } });
  }
  return mergePartial({ tool: "chat", chat: { provider: normalized } });
}

// js/tools/chat/constants.ts
var MAX_CHAT_IMAGES = 10;
var MAX_CHAT_AUDIOS = 5;
var CONV_LIST_PAGE_SIZE_OPTIONS = [30, 15, 50];
var CONV_LIST_PAGE_SIZE_LS_KEY = "patyia:chat:conv-list-page-size:v2";
var CONV_LIST_PAGE_SIZE_LS_KEY_LEGACY = "patyia:chat:conv-list-page-size";
var CONV_LIST_PAGE_SIZE_DEFAULT = 30;
function parseConvListPageSize(raw) {
  if (raw == null || raw === "") return CONV_LIST_PAGE_SIZE_DEFAULT;
  const n = Number(raw);
  return CONV_LIST_PAGE_SIZE_OPTIONS.includes(n) ? n : CONV_LIST_PAGE_SIZE_DEFAULT;
}
function readConvListPageSize() {
  try {
    const stored = localStorage.getItem(CONV_LIST_PAGE_SIZE_LS_KEY);
    if (stored != null && stored !== "") return parseConvListPageSize(stored);
    const legacy = localStorage.getItem(CONV_LIST_PAGE_SIZE_LS_KEY_LEGACY);
    if (legacy === "50") {
      persistConvListPageSize(50);
      return 50;
    }
    return CONV_LIST_PAGE_SIZE_DEFAULT;
  } catch {
    return CONV_LIST_PAGE_SIZE_DEFAULT;
  }
}
function persistConvListPageSize(size) {
  try {
    localStorage.setItem(CONV_LIST_PAGE_SIZE_LS_KEY, String(size));
  } catch {
  }
}
var CHAT_MODE_PATYIA = "patyia";
var CHAT_MODE_LIBRE = "libre";
var CHAT_PROVIDER_OPENAI = "openai";
var CHAT_PROVIDER_MINIMAX = "minimax";
function parseChatLlmProvider(raw) {
  const t = String(raw ?? "").trim().toLowerCase();
  if (t === CHAT_PROVIDER_MINIMAX || t === "mini-max" || t === "mm") return CHAT_PROVIDER_MINIMAX;
  return CHAT_PROVIDER_OPENAI;
}
function readChatLlmProvider(bootChat) {
  if (bootChat?.provider != null && String(bootChat.provider).trim() !== "") {
    return parseChatLlmProvider(bootChat.provider);
  }
  const chat = getSnapshot().chat;
  return parseChatLlmProvider(chat?.provider);
}
function chatLlmProviderFromUrl(chat) {
  if (!chat || chat.provider == null || String(chat.provider).trim() === "") return null;
  return parseChatLlmProvider(chat.provider);
}
function parseChatMode(raw) {
  if (typeof raw === "string") {
    const m = raw.trim().toLowerCase();
    if (m === CHAT_MODE_LIBRE || m === "free") return CHAT_MODE_LIBRE;
    if (m === CHAT_MODE_PATYIA) return CHAT_MODE_PATYIA;
    if (m) return m;
  }
  if (raw === true || raw === 1 || String(raw ?? "").toLowerCase() === "true") return CHAT_MODE_LIBRE;
  if (raw === false || raw === 0 || String(raw ?? "").toLowerCase() === "false") return CHAT_MODE_PATYIA;
  return CHAT_MODE_PATYIA;
}
function isLibreChatMode(mode) {
  return parseChatMode(mode) === CHAT_MODE_LIBRE;
}
function chatBagMode(chat) {
  if (!chat) return null;
  if (chat.mode != null && String(chat.mode).trim() !== "") return parseChatMode(chat.mode);
  if (chat.jailbreak === true) return CHAT_MODE_LIBRE;
  if (chat.jailbreak === false) return CHAT_MODE_PATYIA;
  return null;
}
function readChatMode(bootChat) {
  if (bootChat) {
    if (bootChat.mode != null && String(bootChat.mode).trim() !== "") return parseChatMode(bootChat.mode);
    if (bootChat.jailbreak === true) return CHAT_MODE_LIBRE;
    if (bootChat.jailbreak === false) return CHAT_MODE_PATYIA;
  }
  const chat = getSnapshot().chat;
  return chatBagMode(chat) ?? CHAT_MODE_PATYIA;
}
function chatModeFromUrl(chat) {
  return chatBagMode(chat);
}
function readChatMessageSource(bootChat) {
  if (bootChat?.messageSource === "prod" || bootChat?.messageSource === "logs") return bootChat.messageSource;
  const chat = getSnapshot().chat;
  if (chat?.messageSource === "prod" || chat?.messageSource === "logs") return chat.messageSource;
  return "logs";
}
function messageSourceFromUrl(chat) {
  if (chat?.messageSource === "prod" || chat?.messageSource === "logs") return chat.messageSource;
  return null;
}

// js/tools/chat/threadScroll.ts
init_platform();
var { useEffect, useLayoutEffect, useCallback, useRef, useMemo } = getReact();
var THREAD_SCROLL_NEAR_BOTTOM = 72;
function useThreadScrollAnchor(scrollRef, mensajes, { sending = false } = {}) {
  const snapshotRef = useRef(null);
  const mensajesKey = useMemo(
    () => (mensajes || []).map((m) => m.idMsg === "stream-live" ? `${m.idMsg}:${String(m.contenido || "").length}` : m.idMsg).join("|"),
    [mensajes]
  );
  const captureSnapshot = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    snapshotRef.current = {
      scrollHeight: el.scrollHeight,
      scrollTop: el.scrollTop,
      clientHeight: el.clientHeight
    };
  }, [scrollRef]);
  const applyScrollAnchor = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const snap = snapshotRef.current;
    const distBottom = snap ? snap.scrollHeight - snap.scrollTop - snap.clientHeight : 0;
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
    if (!el || typeof ResizeObserver === "undefined") return void 0;
    const ro = new ResizeObserver(() => {
      applyScrollAnchor();
    });
    for (const child of el.children) ro.observe(child);
    return () => ro.disconnect();
  }, [mensajesKey, applyScrollAnchor, scrollRef]);
  return onThreadScroll;
}

// js/tools/chat/auditScope.ts
init_patyia_jwt();
function auditScopeIsOwnJwt(scope, claims) {
  if (!claims?.itercero) return !scope;
  if (!scope) return true;
  return convBelongsToJwt(scope, claims);
}
function mergeConvOwnerFields(conv, row, scope) {
  return {
    itercero: conv?.itercero ?? row?.itercero ?? scope?.itercero,
    icontacto: conv?.icontacto ?? row?.icontacto ?? scope?.icontacto
  };
}
function convBelongsToJwtResolved(conv, row, scope, claims, strictOwner = false) {
  const owner = mergeConvOwnerFields(conv, row, scope);
  const t = String(owner.itercero ?? "").trim();
  if (!t) return strictOwner ? false : true;
  return convBelongsToJwt(owner, claims);
}
function resolveOwnerDisplayName(jwt, displayScope) {
  const scopeName = String(displayScope?.nombre ?? "").trim();
  if (scopeName) return scopeName;
  const actingName = String(jwt?.actingAsDisplayName ?? "").trim();
  if (actingName) return actingName;
  return jwtUserDisplayName(jwt?.claims) || jwtUserShortName(jwt?.claims) || "";
}
function displayNick(value) {
  return String(value ?? "").trim().toUpperCase().split("@")[0];
}
function resolveOwnerNickname(jwt, sessionUser) {
  const acting = displayNick(jwt?.actingAsUsername);
  if (acting) return acting;
  const saved = displayNick(jwt?.savedBy);
  if (saved) return saved;
  return displayNick(sessionUser);
}
function convOwnerCodesLabel(scope) {
  const t = String(scope?.itercero ?? "").trim();
  const c = String(scope?.icontacto ?? "").trim();
  if (t && c) return `${t} \xB7 ${c}`;
  return t || c || "";
}
function convOwnerDisplayLabel(scope, jwt, sessionUser) {
  const nick = resolveOwnerNickname(jwt, sessionUser);
  if (nick) return nick;
  const codes = convOwnerCodesLabel(scope);
  return codes || "Usuario";
}
function activeConvOwnerScope(auditScope, claims) {
  if (auditScope?.itercero && auditScope?.icontacto) return auditScope;
  if (claims?.itercero) {
    return {
      itercero: claims.itercero,
      icontacto: claims.icontacto ?? "",
      nombre: jwtUserDisplayName(claims) || jwtUserShortName(claims) || null
    };
  }
  return null;
}
function resolveConvListOwnerLabel(listScope, jwt, sessionUser) {
  return convOwnerDisplayLabel(activeConvOwnerScope(listScope, jwt?.claims), jwt, sessionUser);
}
function resolveConvListHeader(listScope, jwt, sessionUser) {
  const scopeName = String(listScope?.nombre ?? "").trim();
  if (scopeName && !auditScopeIsOwnJwt(listScope, jwt?.claims)) return scopeName;
  return resolveConvListOwnerLabel(listScope, jwt, sessionUser);
}

// js/tools/chat/mensajesModel.ts
function vistaFechas(raw) {
  const { label, iso } = formatMsgFecha(raw);
  return { fecha: label, fechaIso: iso || void 0 };
}
function resolveUserName(msg, fallbackUserName) {
  const meta = msg?.meta;
  const promptVars = meta?.prompt_variables;
  return String(meta?.nombre_usuario ?? "") || String(promptVars?.nombre_usuario ?? "") || fallbackUserName || "";
}
function butilToCalificacion(butil) {
  if (butil === void 0 || butil === null) return void 0;
  return butil === true || butil === 1 || butil === "1" ? 1 : 0;
}
var FILE_ID_REF_RE = /^\[file_id:/i;
function filterDisplayableImagenes(list) {
  return (list || []).filter((src) => {
    const s = String(src || "").trim();
    if (!s || FILE_ID_REF_RE.test(s)) return false;
    return s.startsWith("data:image/") || /^https?:\/\//i.test(s);
  });
}
function mergeDisplayableImagenes(...lists) {
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const list of lists) {
    for (const src of filterDisplayableImagenes(list)) {
      if (!seen.has(src)) {
        seen.add(src);
        out.push(src);
      }
    }
  }
  return out.length ? out : void 0;
}
function resolveMensajeImagenes(m) {
  let raw;
  if (Array.isArray(m?.imagenes) && m.imagenes.length) {
    raw = m.imagenes.filter(Boolean);
  } else {
    const meta = m?.meta;
    const others = meta && typeof meta === "object" ? meta.others : void 0;
    if (others && Array.isArray(others.imagenes_adjuntas) && others.imagenes_adjuntas.length) {
      raw = others.imagenes_adjuntas.filter(Boolean);
    }
  }
  return mergeDisplayableImagenes(raw);
}
function findCalificadoForMsg(calificados, { imensaje, contenido }) {
  const rated = (calificados || []).map((c) => ({
    imensaje: Number(c.imensaje) || 0,
    butil: c.butil,
    contenido: String(c.contenido ?? "").trim()
  })).filter((c) => c.imensaje > 0);
  if (!rated.length) return null;
  if (imensaje) {
    const match = rated.find((r) => r.imensaje === imensaje);
    if (match) return match;
  }
  const text = String(contenido ?? "").trim();
  if (text) {
    return rated.find((r) => {
      const c = r.contenido;
      return c === text || text.length >= 24 && c.startsWith(text.slice(0, 24));
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
    const imensaje = Number(v.imensaje) || Number(raw?.imensaje) || void 0;
    const match = findCalificadoForMsg(calificados, { imensaje, contenido: v.contenido });
    return {
      ...v,
      ...match?.imensaje || imensaje ? { imensaje: match?.imensaje || imensaje } : {},
      ...match ? { calificacion: butilToCalificacion(match.butil) } : {}
    };
  });
}
function attachCalificacionesOnly(vista, calificados) {
  return (vista || []).map((v) => {
    if (v.esUsuario || v.esOperativa) return v;
    const imensaje = Number(v.imensaje) || void 0;
    const match = findCalificadoForMsg(calificados, { imensaje, contenido: v.contenido });
    if (!match) return v;
    return {
      ...v,
      ...match.imensaje ? { imensaje: match.imensaje } : {},
      calificacion: butilToCalificacion(match.butil)
    };
  });
}
function attachUserImagenesFromOpenAi(vista, openAiMsgs) {
  let oi = 0;
  return (vista || []).map((v) => {
    if (!v.esUsuario) return v;
    const msgs = openAiMsgs || [];
    while (oi < msgs.length && !String(msgs[oi]?.autor || "").toLowerCase().includes("usuario")) oi += 1;
    const raw = msgs[oi];
    oi += 1;
    const imagenes = mergeDisplayableImagenes(v.imagenes, resolveMensajeImagenes(raw));
    if (!imagenes?.length) return v;
    if (v.imagenes?.length === imagenes.length && v.imagenes.every((u, i) => u === imagenes[i])) return v;
    return { ...v, imagenes };
  });
}
function attachAssistantTextFromOpenAi(vista, openAiMsgs) {
  const openAiByImensaje = /* @__PURE__ */ new Map();
  let seqAssistant = 0;
  for (const raw of openAiMsgs || []) {
    if (!String(raw?.autor || "").toLowerCase().includes("asistente")) continue;
    const text = String(resolveOpenAiMensajeText(raw) ?? "").trim();
    if (!text || isStreamErrorDisplay(text)) continue;
    const im = Number(raw.imensaje);
    if (im > 0) openAiByImensaje.set(im, text);
    else openAiByImensaje.set(-++seqAssistant, text);
  }
  let seqFallback = 0;
  return (vista || []).map((v) => {
    if (v.esUsuario || v.esOperativa) return v;
    const im = Number(v.imensaje);
    const openAiText = (im > 0 ? openAiByImensaje.get(im) : void 0) ?? openAiByImensaje.get(-++seqFallback) ?? "";
    const logText = String(v.contenido ?? "").trim();
    const logBad = !logText || isStreamErrorDisplay(logText);
    if (openAiText && logBad) {
      return { ...v, contenido: openAiText };
    }
    if (isStreamErrorDisplay(logText)) {
      return {
        ...v,
        contenido: "",
        streamFailed: v.streamFailed ?? true,
        streamError: v.streamError ?? formatStreamError(logText)
      };
    }
    return v;
  });
}
function countLogAssistants(log) {
  return (log?.mensajes || []).filter((m) => String(m.role) === "assistant").length;
}
function logHasOperativas(log) {
  return Boolean((log?.mensajes || []).some((m) => String(m.role) === "operativa"));
}
function countOpenAiAssistants(detail) {
  return (detail?.mensajesOpenAI || []).filter(
    (m) => String(m.autor || "").toLowerCase().includes("asistente")
  ).length;
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
    const metaRecord = meta;
    const fechaRaw = m.fecha_hora || metaRecord?.ts || "";
    const { fecha, fechaIso } = vistaFechas(fechaRaw);
    const imensaje = Number(m.imensaje) || void 0;
    const imagenes = resolveMensajeImagenes(m);
    return {
      idMsg: imensaje ? `msg-${imensaje}` : `openai-${i}`,
      rol: isUser ? "user" : "assistant",
      contenido,
      fecha,
      fechaIso,
      esUsuario: isUser,
      esOperativa: false,
      meta,
      nombreUsuario: nombreUsuario || void 0,
      ...imensaje ? { imensaje } : {},
      ...imagenes?.length ? { imagenes } : {}
    };
  });
}
function stripMetaFromVista(mensajes) {
  return (mensajes || []).map(({ meta: _meta, usageStats: _usageStats, ...rest }) => ({
    ...rest,
    meta: null
  }));
}
function enrichLogVista(mensajes, fallbackUserName) {
  return (mensajes || []).map((m) => {
    if (!m.esUsuario) return m;
    const meta = m.meta;
    const promptVars = meta?.prompt_variables;
    const name = m.nombreUsuario || String(meta?.nombre_usuario ?? "") || String(promptVars?.nombre_usuario ?? "") || fallbackUserName;
    if (!name) return m;
    return {
      ...m,
      nombreUsuario: name,
      meta: m.meta ? { ...meta, nombre_usuario: meta?.nombre_usuario || name } : { nombre_usuario: name }
    };
  });
}
function isEphemeralMsgId(idMsg) {
  if (!idMsg || idMsg === "stream-live") return true;
  const id = String(idMsg);
  return id.startsWith("pending-user-") || id.startsWith("assistant-final-");
}
function mensajeVistaStableEqual(a, b) {
  if (!a || !b) return false;
  return a.contenido === b.contenido && a.fecha === b.fecha && a.rol === b.rol && a.calificacion === b.calificacion && a.esUsuario === b.esUsuario && a.esOperativa === b.esOperativa && !a.isStreaming && !b.isStreaming && JSON.stringify(a.usageStats ?? null) === JSON.stringify(b.usageStats ?? null) && JSON.stringify(a.imagenes ?? null) === JSON.stringify(b.imagenes ?? null);
}
function mergeMensajesVista(prev, next) {
  if (!next?.length) return prev || [];
  const prevById = /* @__PURE__ */ new Map();
  for (const m of prev || []) {
    if (isEphemeralMsgId(m.idMsg) || m.isStreaming) continue;
    prevById.set(m.idMsg, m);
  }
  const merged = next.map((m) => {
    const old = prevById.get(m.idMsg);
    return old && mensajeVistaStableEqual(old, m) ? old : m;
  });
  for (const m of prev || []) {
    if (!isEphemeralMsgId(m.idMsg) || m.isStreaming) continue;
    if (!m.esUsuario) continue;
    const already = merged.some((n) => n.esUsuario && mensajeVistaStableEqual(m, n));
    if (!already) merged.push(m);
  }
  return merged;
}
function vistaFromLogAndDetail(d, log, name) {
  if (!log?.mensajes?.length) return null;
  const rated = d?.mensajesCalificados || [];
  let vista = enrichLogVista(logToMensajesVista(log), name);
  if (d?.mensajesOpenAI?.length) {
    vista = attachCalificacionesToVista(vista, d.mensajesOpenAI, rated);
    vista = attachAssistantTextFromOpenAi(vista, d.mensajesOpenAI);
    vista = attachUserImagenesFromOpenAi(vista, d.mensajesOpenAI);
  } else if (rated.length) {
    vista = attachCalificacionesOnly(vista, rated);
  }
  return vista;
}
function finalizeStreamInLog(mensajes, finalText, stream) {
  const safeFinal = isStreamErrorDisplay(finalText) ? "" : String(finalText ?? "").trim();
  return appendStreamMsg(mensajes, safeFinal, true).map((m) => {
    if (m.idMsg !== "stream-live" && !m.isStreaming) return m;
    const prev = isStreamErrorDisplay(m.contenido) ? "" : String(m.contenido ?? "").trim();
    const now = vistaFechas(/* @__PURE__ */ new Date());
    return {
      ...m,
      idMsg: m.idMsg === "stream-live" ? `assistant-final-${Date.now()}` : m.idMsg,
      contenido: safeFinal || prev,
      isStreaming: false,
      fecha: m.fecha || now.fecha,
      fechaIso: m.fechaIso || now.fechaIso,
      ...stream?.failed ? { streamFailed: true, streamError: stream.error } : {}
    };
  });
}
function appendStreamMsg(mensajes, streamText, active) {
  if (!active) return mensajes || [];
  const list = [...mensajes || []];
  const liveText = String(streamText ?? "");
  let lastUserIdx = -1;
  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i].esUsuario) {
      lastUserIdx = i;
      break;
    }
  }
  let lastAsstIdx = -1;
  for (let i = list.length - 1; i > lastUserIdx; i--) {
    const m = list[i];
    if (!m.esUsuario && !m.esOperativa) {
      lastAsstIdx = i;
      break;
    }
  }
  if (lastAsstIdx >= 0) {
    const cur = list[lastAsstIdx];
    const logText = String(cur.contenido ?? "");
    const contenido = liveText.length >= logText.length ? liveText : logText;
    list[lastAsstIdx] = { ...cur, contenido, isStreaming: true };
    return list;
  }
  return [
    ...list,
    {
      idMsg: "stream-live",
      rol: "assistant",
      contenido: liveText,
      fecha: "",
      esUsuario: false,
      esOperativa: false,
      meta: null,
      isStreaming: true
    }
  ];
}
function buildOptimisticUserMsg({
  text,
  imagenes,
  audios,
  userName
}) {
  const imgs = (imagenes || []).filter(Boolean);
  const audioUrls = (audios || []).filter(Boolean);
  const { fecha, fechaIso } = vistaFechas(/* @__PURE__ */ new Date());
  return {
    idMsg: `pending-user-${Date.now()}`,
    rol: "user",
    contenido: text || (imgs.length ? "(imagen adjunta)" : audioUrls.length ? "(nota de voz)" : ""),
    fecha,
    fechaIso,
    esUsuario: true,
    esOperativa: false,
    meta: userName ? { nombre_usuario: userName } : null,
    nombreUsuario: userName || void 0,
    imagenes: imgs.length ? imgs : void 0,
    audios: audioUrls.length ? audioUrls : void 0
  };
}

// js/tools/chat/images.ts
var IMAGE_EXT_RE = /\.(png|jpe?g|webp|gif|bmp|heic|heif)$/i;
var BACKEND_IMAGE_MIMES = /* @__PURE__ */ new Set(["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"]);
function mimeFromFileName(name) {
  const lower = name.trim().toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (/\.jpe?g$/i.test(lower)) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (/\.heic$/i.test(lower)) return "image/heic";
  if (/\.heif$/i.test(lower)) return "image/heif";
  if (lower.endsWith(".bmp")) return "image/bmp";
  return void 0;
}
function isChatImageFile(file) {
  if (!file) return false;
  if (file.type?.startsWith("image/")) return true;
  return IMAGE_EXT_RE.test(file.name || "");
}
function isHeicLikeFile(file) {
  const name = (file.name || "").toLowerCase();
  const mime = (file.type || "").toLowerCase();
  return mime === "image/heic" || mime === "image/heif" || /\.heic$/i.test(name) || /\.heif$/i.test(name);
}
function isBackendSupportedMime(mime) {
  if (!mime) return false;
  return BACKEND_IMAGE_MIMES.has(mime.toLowerCase());
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
async function filesToImageEntries(files) {
  const added = [];
  for (const file of files || []) {
    if (!isChatImageFile(file)) continue;
    if (isHeicLikeFile(file)) continue;
    const mime = (file.type || mimeFromFileName(file.name || "") || "image/png").toLowerCase();
    if (!isBackendSupportedMime(mime)) continue;
    const dims = await fileImageDimensions(file).catch(() => void 0);
    added.push({
      name: file.name || "imagen",
      blob: file,
      mime,
      ...dims?.width ? { width: dims.width } : {},
      ...dims?.height ? { height: dims.height } : {}
    });
  }
  return added;
}
function fileImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e instanceof Error ? e : new Error("decode"));
    };
    img.src = url;
  });
}
function hasHeicLikeFiles(files) {
  for (const file of files || []) {
    if (isHeicLikeFile(file)) return true;
  }
  return false;
}

// js/tools/chat/audio.ts
var AUDIO_EXT_RE = /\.(webm|mp3|m4a|wav|ogg|aac|mp4)$/i;
var BACKEND_AUDIO_MIMES = /* @__PURE__ */ new Set([
  "audio/webm",
  "audio/mp4",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/x-m4a",
  "audio/aac"
]);
function mimeFromFileName2(name) {
  const lower = name.trim().toLowerCase();
  if (lower.endsWith(".webm")) return "audio/webm";
  if (lower.endsWith(".mp3")) return "audio/mpeg";
  if (lower.endsWith(".m4a") || lower.endsWith(".mp4")) return "audio/mp4";
  if (lower.endsWith(".wav")) return "audio/wav";
  if (lower.endsWith(".ogg")) return "audio/ogg";
  return void 0;
}
function isBackendSupportedAudioMime(mime) {
  const m = String(mime || "").toLowerCase();
  if (m && BACKEND_AUDIO_MIMES.has(m)) return true;
  if (m.startsWith("audio/webm")) return true;
  if (m.startsWith("audio/mp4") || m.startsWith("audio/m4a")) return true;
  if (m.startsWith("audio/mpeg")) return true;
  return false;
}
function isChatAudioFile(file) {
  if (!file) return false;
  if (file.type?.startsWith("audio/")) return true;
  return AUDIO_EXT_RE.test(file.name || "");
}
async function filesToAudioEntries(files) {
  const added = [];
  for (const file of files || []) {
    if (!isChatAudioFile(file)) continue;
    const mime = (file.type || mimeFromFileName2(file.name || "") || "audio/webm").toLowerCase().split(";")[0];
    if (!isBackendSupportedAudioMime(mime)) continue;
    added.push({ name: file.name || "audio", blob: file, mime });
  }
  return added;
}
function createVoiceRecorder() {
  let mediaRecorder = null;
  let chunks = [];
  let stream = null;
  const stopStream = () => {
    stream?.getTracks().forEach((t) => t.stop());
    stream = null;
  };
  const chooseExt = (recMime) => {
    if (recMime.includes("webm")) return "webm";
    if (recMime.includes("mp4") || recMime.includes("m4a")) return "m4a";
    if (recMime.includes("mpeg") || recMime.includes("mp3")) return "mp3";
    if (recMime.includes("wav")) return "wav";
    if (recMime.includes("ogg")) return "ogg";
    return "webm";
  };
  return {
    async start() {
      if (mediaRecorder?.state === "recording") return;
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
      mediaRecorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      mediaRecorder.start();
    },
    stop() {
      return new Promise((resolve) => {
        if (!mediaRecorder || mediaRecorder.state === "inactive") {
          stopStream();
          resolve(null);
          return;
        }
        const recorder = mediaRecorder;
        recorder.onstop = async () => {
          const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
          stopStream();
          mediaRecorder = null;
          chunks = [];
          if (!blob.size) {
            resolve(null);
            return;
          }
          const mime = (recorder.mimeType || "audio/webm").toLowerCase().split(";")[0];
          const fileName = `nota-voz-${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}.${chooseExt(mime)}`;
          const file = new File([blob], fileName, { type: mime });
          resolve({ name: fileName, blob: file, mime });
        };
        recorder.stop();
      });
    },
    cancel() {
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.onstop = null;
        mediaRecorder.stop();
      }
      mediaRecorder = null;
      chunks = [];
      stopStream();
    },
    isActive() {
      return mediaRecorder?.state === "recording";
    }
  };
}
function isVoiceRecordingSupported() {
  return typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia) && typeof MediaRecorder !== "undefined";
}

// js/tools/chat/useChatTool.ts
var { useState, useEffect: useEffect2, useCallback: useCallback2, useRef: useRef2, useMemo: useMemo2 } = getReact();
function readBootConvId(bootChat) {
  const fromBoot = Number(bootChat?.convId);
  if (fromBoot > 0) return fromBoot;
  const fromUrl = Number(getSnapshot().chat?.convId);
  return fromUrl > 0 ? fromUrl : null;
}
function convIdsEqual(a, b) {
  return Number(a) > 0 && Number(a) === Number(b);
}
function urlChatConvId() {
  return readBootConvId();
}
function isNotFoundError(e) {
  const msg = e instanceof Error ? e.message : String(e ?? "");
  return /not found|\b404\b/i.test(msg);
}
async function fetchLogsModeDetail(jwt, id, { freshLog = false, minMensajes = 0 } = {}) {
  const loadDetail = () => freshLog ? getConversacionLogsWithRetry(jwt, id, { minMensajes }).catch(() => null) : getConversacionLogs(jwt, id).catch(() => null);
  try {
    const d2 = await loadDetail();
    if (!d2) {
      const fallback = await getConversacion(jwt, id).catch(() => null);
      if (!fallback) return { d: null, log: null, openAiDirect: false };
      const log2 = convLogFromDetalle(fallback, id);
      const assistantsInLog2 = countLogAssistants(log2);
      const assistantsInApi2 = countOpenAiAssistants(fallback);
      const logComplete2 = Boolean(log2?.mensajes?.length && assistantsInLog2 >= assistantsInApi2);
      const preferLogMeta2 = Boolean(log2?.mensajes?.length && (logHasOperativas(log2) || logComplete2));
      const openAiDirect2 = Boolean(fallback?.mensajesOpenAI?.length) && !preferLogMeta2;
      return { d: fallback, log: log2, openAiDirect: openAiDirect2 };
    }
    const log = convLogFromDetalle(d2, id);
    const assistantsInLog = countLogAssistants(log);
    const assistantsInApi = countOpenAiAssistants(d2);
    const logComplete = Boolean(log?.mensajes?.length && assistantsInLog >= assistantsInApi);
    const preferLogMeta = Boolean(log?.mensajes?.length && (logHasOperativas(log) || logComplete));
    const openAiDirect = Boolean(d2?.mensajesOpenAI?.length) && !preferLogMeta;
    return { d: d2, log, openAiDirect };
  } catch (e) {
    if (!isNotFoundError(e)) throw e;
  }
  const d = await getConversacion(jwt, id).catch(() => null);
  return { d, log: null, openAiDirect: false };
}
function useChatTool({ bootChat }) {
  const [jwt, setJwt] = useState(() => loadPatyJwt());
  const [jwtOpen, setJwtOpen] = useState(false);
  const [jwtLoading, setJwtLoading] = useState(false);
  const [authTick, setAuthTick] = useState(0);
  const [rows, setRows] = useState([]);
  const [selectedId, setSelectedId] = useState(() => readBootConvId(bootChat));
  const [detail, setDetail] = useState(null);
  const [loadingList, setLoadingList] = useState(false);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const [images, setImages] = useState([]);
  const [audios, setAudios] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [logMensajes, setLogMensajes] = useState([]);
  const [ratingMsgId, setRatingMsgId] = useState(null);
  const [loadingThread, setLoadingThread] = useState(false);
  const [logError, setLogError] = useState("");
  const [metaOpen, setMetaOpen] = useState(false);
  const [metaMsg, setMetaMsg] = useState(null);
  const [payloadPreviewOpen, setPayloadPreviewOpen] = useState(false);
  const [auditDialogOpen, setAuditDialogOpen] = useState(false);
  const [auditScope, setAuditScope] = useState(null);
  const [sessionBrowseScope, setSessionBrowseScope] = useState(null);
  const [sessionScopeLoading, setSessionScopeLoading] = useState(false);
  const [convListPage, setConvListPage] = useState(1);
  const [convListPageSize, setConvListPageSize] = useState(() => readConvListPageSize());
  const [convListSearch, setConvListSearch] = useState("");
  const [convListMeta, setConvListMeta] = useState(null);
  const [messageSource, setMessageSource] = useState(() => readChatMessageSource(bootChat));
  const [chatMode, setChatMode] = useState(() => readChatMode(bootChat));
  const [llmProvider, setLlmProvider] = useState(() => readChatLlmProvider(bootChat));
  const inputRef = useRef2(null);
  const attachInputRef = useRef2(null);
  const voiceRecorderRef = useRef2(createVoiceRecorder());
  const threadScrollRef = useRef2(null);
  const lastLogApiCountRef = useRef2(0);
  const skipThreadReloadRef = useRef2(null);
  const lastOpenedConvRef = useRef2(null);
  const openConvRef = useRef2(async () => {
  });
  const pendingListConvRef = useRef2(null);
  const contapymeResumeLockRef = useRef2(false);
  const sendingRef = useRef2(false);
  const logMensajesRef = useRef2(logMensajes);
  logMensajesRef.current = logMensajes;
  sendingRef.current = sending;
  const loggedIn = Session.isLoggedIn();
  const sessionUser = Session.username();
  const canAdminJwt = canAdminPortalJwt();
  const canAuditChat = useMemo2(
    () => canAccessOthers2(),
    [authTick]
  );
  const canInteract = canInteractPatyChat(sessionUser, jwt);
  const listScope = useMemo2(() => {
    const own = activeConvOwnerScope(null, jwt?.claims) ?? sessionBrowseScope;
    if (!canAuditChat) return own;
    return auditScope ?? own;
  }, [canAuditChat, auditScope, jwt?.claims, sessionBrowseScope]);
  const selectedConvRow = selectedId ? rows.find((r) => convIdsEqual(r.iconversacion, selectedId)) : null;
  const selectedConvOwned = convBelongsToJwtResolved(
    detail,
    selectedConvRow,
    activeConvOwnerScope(listScope, jwt?.claims),
    jwt?.claims
  );
  const canSend = canInteract && auditScopeIsOwnJwt(auditScope, jwt?.claims) && selectedConvOwned;
  const viewingAuditOther = Boolean(
    auditScope && (jwt?.claims ? !auditScopeIsOwnJwt(auditScope, jwt.claims) : sessionBrowseScope && browseScopeKey(auditScope) !== browseScopeKey(sessionBrowseScope))
  );
  const viewOnly = loggedIn && !canSend;
  const needsJwt = loggedIn && !jwt?.token && !jwtLoading;
  const displayScope = activeConvOwnerScope(listScope, jwt?.claims);
  useEffect2(() => {
    function onSessionAuth() {
      setAuthTick((n) => n + 1);
    }
    function onPatyJwt() {
      setJwt(loadPatyJwt());
    }
    window.addEventListener("isa-patyia:paty-jwt", onPatyJwt);
    window.addEventListener(Session.EVENT, onSessionAuth);
    window.addEventListener("isa-patyia:auth", onSessionAuth);
    window.addEventListener("patyia-apptools:caps-changed", onSessionAuth);
    return () => {
      window.removeEventListener("isa-patyia:paty-jwt", onPatyJwt);
      window.removeEventListener(Session.EVENT, onSessionAuth);
      window.removeEventListener("isa-patyia:auth", onSessionAuth);
      window.removeEventListener("patyia-apptools:caps-changed", onSessionAuth);
    };
  }, []);
  useEffect2(() => {
    if (canAuditChat) return;
    if (auditScope) {
      setAuditScope(null);
      setConvListPage(1);
      setConvListSearch("");
      setSelectedId(null);
      setDetail(null);
      setLogMensajes([]);
      setStreamText("");
      setLogError("");
      persistChatConvId(null);
    }
    if (auditDialogOpen) setAuditDialogOpen(false);
  }, [canAuditChat, auditScope, auditDialogOpen]);
  const prevSessionUserRef = useRef2(null);
  useEffect2(() => {
    const prev = prevSessionUserRef.current;
    if (prev && prev !== sessionUser) {
      setAuditScope(null);
      setConvListPage(1);
      setConvListSearch("");
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
  useEffect2(() => {
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
    hydratePatyJwtFromServer(sessionUser).then((rec) => {
      if (!cancelled) setJwt(rec);
    }).finally(() => {
      if (!cancelled) setJwtLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [loggedIn, sessionUser]);
  useEffect2(() => {
    if (!loggedIn || !sessionUser) {
      setSessionBrowseScope(null);
      setSessionScopeLoading(false);
      return void 0;
    }
    if (jwt?.token) {
      setSessionBrowseScope(null);
      setSessionScopeLoading(false);
      return void 0;
    }
    let cancelled = false;
    setSessionScopeLoading(true);
    resolveSessionBrowseScope(sessionUser).then((scope) => {
      if (!cancelled) setSessionBrowseScope(scope);
    }).finally(() => {
      if (!cancelled) setSessionScopeLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [loggedIn, sessionUser, jwt?.token]);
  const reloadList = useCallback2(async () => {
    if (!loggedIn || jwtLoading || sessionScopeLoading) return;
    setLoadingList(true);
    try {
      const page = convListPage;
      const limit = convListPageSize;
      const search = convListSearch.trim() || void 0;
      const listSort = CONVERSACIONES_LIST_SORT_DEFAULT;
      const auditOther = Boolean(
        canAuditChat && auditScope?.itercero && auditScope?.icontacto && !auditScopeIsOwnJwt(auditScope, jwt?.claims)
      );
      const listInput = {
        page,
        limit,
        search,
        sort: listSort,
        ...auditOther ? { itercero: auditScope.itercero, icontacto: auditScope.icontacto } : {}
      };
      if (jwt?.token) {
        const res = await listConversaciones(jwt, listInput);
        setRows(
          [...res.conversaciones].sort(
            (a, b) => Number(b.iconversacion) - Number(a.iconversacion)
          )
        );
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
  }, [loggedIn, jwtLoading, sessionScopeLoading, jwt?.token, jwt?.claims, canAuditChat, auditScope?.itercero, auditScope?.icontacto, convListPage, convListPageSize, convListSearch]);
  const handleConvListSearchChange = useCallback2((text) => {
    setConvListSearch((prev) => {
      if (prev === text) return prev;
      setConvListPage(1);
      return text;
    });
  }, []);
  const handleSelectAuditScope = useCallback2((row) => {
    if (!canAccessOthers2()) {
      setAuditDialogOpen(false);
      toastInfo("Tu rol solo puede ver tus propias conversaciones");
      setAuditScope(null);
      return;
    }
    if (row.esJwt) {
      if (!jwt?.claims?.itercero) {
        setAuditDialogOpen(false);
        toastInfo("Configura JWT para filtrar por tu contacto");
        return;
      }
      setAuditScope(null);
      setConvListPage(1);
      setConvListSearch("");
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
      const sessionScope = row.itercero && row.icontacto ? {
        itercero: String(row.itercero),
        icontacto: String(row.icontacto),
        nombre: row.nombre || sessionUser || null
      } : sessionBrowseScope;
      const sameAsJwt = Boolean(
        sessionScope && jwt?.claims?.itercero && convBelongsToJwt(sessionScope, jwt.claims)
      );
      setAuditScope(sameAsJwt ? null : sessionScope);
      setConvListPage(1);
      setConvListSearch("");
      setConvListMeta(null);
      setRows([]);
      setSelectedId(null);
      setDetail(null);
      setLogMensajes([]);
      setStreamText("");
      setLogError("");
      persistChatConvId(null);
      setAuditDialogOpen(false);
      toastInfo(`Conversaciones \xB7 ${row.nombre || sessionUser || "sesi\xF3n"}`);
      return;
    }
    const next = {
      itercero: String(row.itercero ?? ""),
      icontacto: String(row.icontacto ?? ""),
      nombre: row.nombre || null
    };
    setAuditScope(next);
    setConvListPage(1);
    setConvListSearch("");
    setConvListMeta(null);
    setRows([]);
    setSelectedId(null);
    setDetail(null);
    setLogMensajes([]);
    setStreamText("");
    setLogError("");
    persistChatConvId(null);
    setAuditDialogOpen(false);
    toastInfo(`Filtro \xB7 ${row.nombre || row.icontacto}`);
  }, [jwt?.claims?.itercero, jwt?.claims?.icontacto, sessionBrowseScope, sessionUser]);
  const applyThreadFromDetail = useCallback2((d, log, name, { openAiDirect = false, stripMeta = false } = {}) => {
    const rated = d?.mensajesCalificados || [];
    const logAssistants = countLogAssistants(log);
    const openAiAssistants = countOpenAiAssistants(d);
    const logComplete = Boolean(log?.mensajes?.length && logAssistants >= openAiAssistants);
    const buildFromLog = Boolean(log?.mensajes?.length && (logHasOperativas(log) || logComplete));
    const finalizeVista = (vista) => stripMeta ? stripMetaFromVista(vista) : vista;
    if (log?.mensajes?.length) {
      lastLogApiCountRef.current = log.mensajes.length;
    }
    if (buildFromLog) {
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
    if (openAiDirect && d?.mensajesOpenAI?.length) {
      const vista = finalizeVista(attachUserImagenesFromOpenAi(
        attachCalificacionesToVista(
          enrichLogVista(openAiFallbackVista(d.mensajesOpenAI, name), name),
          d.mensajesOpenAI,
          rated
        ),
        d.mensajesOpenAI
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
          rated
        ),
        d.mensajesOpenAI
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
  const patchThreadAfterSend = useCallback2(async (id, { minLogMensajes = 0, ownerLabel } = {}) => {
    if (!loggedIn || !id) return;
    const name = ownerLabel || convOwnerDisplayLabel(activeConvOwnerScope(listScope, jwt?.claims), jwt, sessionUser);
    const useLogBridge = !jwt?.token;
    const prodMode = messageSource === "prod" && Boolean(jwt?.token);
    const logsApiMode = messageSource === "logs" && Boolean(jwt?.token);
    try {
      if (prodMode) {
        const d2 = await getConversacion(jwt, id).catch(() => null);
        if (d2) {
          setDetail(d2);
          applyThreadFromDetail(d2, null, name, { openAiDirect: true, stripMeta: true });
        }
        return;
      }
      if (logsApiMode) {
        try {
          const { d: d2, log, openAiDirect } = await fetchLogsModeDetail(jwt, id, { freshLog: true, minMensajes: minLogMensajes });
          if (d2) {
            const row = rows.find((r) => convIdsEqual(r.iconversacion, id));
            setDetail({
              ...row,
              ...d2,
              itercero: d2.itercero ?? row?.itercero,
              icontacto: d2.icontacto ?? row?.icontacto
            });
            applyThreadFromDetail(d2, log, name, { openAiDirect });
          } else if (log?.mensajes?.length) {
            applyThreadFromDetail(null, log, name);
          }
        } catch {
        }
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
    }
  }, [loggedIn, jwt, viewingAuditOther, listScope, messageSource, applyThreadFromDetail, rows, sessionUser]);
  const openConv = useCallback2(async (id, { silent = false, keepStream = false, freshLog = false, minLogMensajes = 0, sourceOverride } = {}) => {
    if (!loggedIn || !id) return;
    if (!canAuditChat && jwt?.claims?.itercero) {
      const row = rows.find((r) => convIdsEqual(r.iconversacion, id));
      if (row && !convBelongsToJwt(row, jwt.claims)) {
        toastError("Tu rol solo puede abrir tus propias conversaciones");
        return;
      }
    }
    if (freshLog || sourceOverride !== void 0) lastOpenedConvRef.current = null;
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
    const useLogBridge = !jwt?.token;
    const activeSource = sourceOverride ?? messageSource;
    const prodMode = activeSource === "prod" && Boolean(jwt?.token);
    const logsApiMode = activeSource === "logs" && Boolean(jwt?.token);
    const minMensajes = freshLog ? Math.max(minLogMensajes, lastLogApiCountRef.current + 2) : 0;
    const assertOwnDetail = (d) => {
      if (!canAuditChat && d && jwt?.claims?.itercero && !convBelongsToJwt(d, jwt.claims)) {
        toastError("Tu rol solo puede abrir tus propias conversaciones");
        setSelectedId(null);
        setDetail(null);
        setLogMensajes([]);
        persistChatConvId(null);
        return false;
      }
      return true;
    };
    try {
      if (prodMode) {
        const d = await getConversacion(jwt, id);
        if (!assertOwnDetail(d)) return;
        setDetail(d);
        applyThreadFromDetail(d, null, ownerLabel, { openAiDirect: true, stripMeta: true });
        return;
      }
      if (logsApiMode) {
        const { d, log, openAiDirect } = await fetchLogsModeDetail(jwt, id, { freshLog, minMensajes });
        if (d && !assertOwnDetail(d)) return;
        if (d) {
          const row = rows.find((r) => convIdsEqual(r.iconversacion, id));
          setDetail({
            ...row,
            ...d,
            itercero: d.itercero ?? row?.itercero,
            icontacto: d.icontacto ?? row?.icontacto
          });
        } else {
          const row = rows.find((r) => r.iconversacion === id);
          setDetail(row || { iconversacion: id, titulo: `Conv #${id}` });
        }
        applyThreadFromDetail(d, log, ownerLabel, { openAiDirect });
        return;
      }
      if (useLogBridge) {
        const logResult = freshLog ? await fetchConvLogByIdWithRetry(id, { minMensajes }).catch(() => null) : await fetchConvLogById(id).catch(() => null);
        const row = rows.find((r) => r.iconversacion === id);
        if (row && !assertOwnDetail(row)) return;
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
      lastOpenedConvRef.current = id;
    }
  }, [loggedIn, jwt, sessionUser, canAuditChat, viewingAuditOther, listScope, rows, messageSource, applyThreadFromDetail]);
  openConvRef.current = openConv;
  const onMessageSourceChange = useCallback2((next) => {
    if (next === messageSource) return;
    persistChatMessageSource(next);
    setMessageSource(next);
    if (selectedId) {
      void openConv(selectedId, { silent: false, sourceOverride: next });
    }
  }, [messageSource, selectedId, openConv]);
  const onChatModeChange = useCallback2(async (next) => {
    const mode = String(next || "patyia").trim().toLowerCase() || "patyia";
    if (mode === chatMode) return;
    if (isLibreChatMode(mode)) {
      const ok = await requestConfirm({
        title: "Modo Libre",
        message: [
          "Al activar Libre, PatyIA deja de aplicar las instrucciones de producto, la clasificaci\xF3n de consultas y la b\xFAsqueda en documentaci\xF3n.",
          "",
          "Las respuestas pueden no alinearse con soporte ContaPyme\xAE ni con las pol\xEDticas de asesor\xEDa. El uso queda registrado en el log (mode: libre).",
          "",
          "Usa este modo solo para pruebas en staging. \xBFActivar Libre?"
        ].join("\n"),
        confirmLabel: "Activar Libre",
        cancelLabel: "Cancelar"
      });
      if (!ok) return;
    }
    persistChatMode(mode);
    setChatMode(mode);
  }, [chatMode]);
  const onLlmProviderChange = useCallback2(async (next) => {
    const provider = String(next || "openai").trim().toLowerCase() === CHAT_PROVIDER_MINIMAX ? CHAT_PROVIDER_MINIMAX : "openai";
    if (provider === llmProvider) return;
    if (provider === CHAT_PROVIDER_MINIMAX) {
      const ok = await requestConfirm({
        title: "MiniMax M3",
        message: [
          "Al elegir MiniMax, el servidor usa el mismo flujo Responses que OpenAI,",
          "con endpoint https://api.minimax.io/v1 y modelo MiniMax-M3.",
          "",
          "La API-KEY se lee del sheet p\xFAblico MiniMax. \xBFActivar MiniMax?"
        ].join("\n"),
        confirmLabel: "Usar MiniMax",
        cancelLabel: "Cancelar"
      });
      if (!ok) return;
    }
    persistChatLlmProvider(provider);
    setLlmProvider(provider);
  }, [llmProvider]);
  const onConvListPageSizeChange = useCallback2((next) => {
    const size = parseConvListPageSize(next);
    if (size === convListPageSize) return;
    persistConvListPageSize(size);
    setConvListPageSize(size);
    setConvListPage(1);
  }, [convListPageSize]);
  useEffect2(() => subscribe((snap) => {
    const chat = snap.chat;
    const urlId = Number(chat?.convId) || null;
    setSelectedId((prev) => prev === urlId ? prev : urlId);
    const urlSource = messageSourceFromUrl(chat);
    if (urlSource) setMessageSource((prev) => prev === urlSource ? prev : urlSource);
    const urlMode = chatModeFromUrl(chat);
    if (urlMode !== null) setChatMode((prev) => prev === urlMode ? prev : urlMode);
    const urlProvider = chatLlmProviderFromUrl(chat);
    if (urlProvider !== null) setLlmProvider((prev) => prev === urlProvider ? prev : urlProvider);
  }), []);
  useEffect2(() => {
    if (jwtLoading) return;
    reloadList();
  }, [reloadList, authTick, jwtLoading]);
  useEffect2(() => {
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
  useEffect2(() => {
    if (!selectedId) {
      lastOpenedConvRef.current = null;
      return;
    }
    if (loadingList) return;
    if (jwtLoading && !jwt?.token) return;
    if (skipThreadReloadRef.current === selectedId) {
      skipThreadReloadRef.current = null;
      lastOpenedConvRef.current = selectedId;
      return;
    }
    if (pendingListConvRef.current === selectedId) return;
    const inList = rows.some((r) => convIdsEqual(r.iconversacion, selectedId));
    if (!inList && rows.length > 0 && !convIdsEqual(urlChatConvId(), selectedId)) return;
    if (lastOpenedConvRef.current === selectedId) return;
    void openConvRef.current(selectedId);
  }, [selectedId, jwtLoading, jwt?.token, rows, loadingList]);
  async function onNewChat() {
    if (!canSend) {
      toastWarning("Modo lectura.");
      return;
    }
    setSelectedId(null);
    setDetail(null);
    setStreamText("");
    setLogMensajes([]);
    setLogError("");
    persistChatConvId(null);
    inputRef.current?.focus();
  }
  async function onDelete(id) {
    if (!canSend) return;
    const conv = rows.find((r) => r.iconversacion === id);
    if (conv && !convBelongsToJwt(conv, jwt?.claims)) {
      toastError("No puedes eliminar conversaciones de otro contacto");
      return;
    }
    const ok = await requestConfirm({ title: "Eliminar conversaci\xF3n", message: `\xBFEliminar conv #${id}?` });
    if (!ok) return;
    try {
      await deleteConversacion(jwt, id);
      toastSuccess("Conversaci\xF3n eliminada");
      if (selectedId === id) {
        setSelectedId(null);
        setDetail(null);
        setLogMensajes([]);
      }
      reloadList();
    } catch (e) {
      toastError(e instanceof Error ? e.message : String(e));
    }
  }
  async function onSend(overrideText) {
    if (!canSend || !jwt) return;
    const text = String(overrideText ?? draft).trim();
    if (!text && !images.length && !audios.length) return;
    if (selectedId && !convBelongsToJwtResolved(
      detail,
      rows.find((r) => convIdsEqual(r.iconversacion, selectedId)),
      displayScope,
      jwt.claims
    )) {
      toastError("No puedes enviar mensajes en conversaciones de otro contacto");
      return;
    }
    setSending(true);
    setStreamText("");
    const imageEntries = [...images];
    const audioEntries = [...audios];
    const imagenesPlaceholder = imageEntries.map((_, i) => `__img_pending_${i}__`);
    const audioUrlsPlaceholder = audioEntries.map((_, i) => `__aud_pending_${i}__`);
    const convIdBefore = selectedId;
    const userName = convOwnerDisplayLabel(displayScope, jwt, sessionUser);
    const logCountBefore = lastLogApiCountRef.current;
    setDraft("");
    setImages([]);
    setAudios([]);
    if (attachInputRef.current) attachInputRef.current.value = "";
    setLogMensajes((prev) => enrichLogVista(
      [...prev, buildOptimisticUserMsg({ text, imagenes: imagenesPlaceholder, audios: audioUrlsPlaceholder, userName })],
      userName
    ));
    let uploadedImages = [];
    let uploadedAudios = [];
    try {
      if (imageEntries.length) {
        uploadedImages = await uploadImagenes(
          jwt,
          imageEntries.map((i) => i.blob),
          void 0
        );
      }
      if (audioEntries.length) {
        uploadedAudios = await uploadAudios(
          jwt,
          audioEntries.map((a) => a.blob),
          void 0
        );
      }
      const imagenesUrls = uploadedImages.map((u) => u.url);
      const audiosUrls = uploadedAudios.map((u) => u.url);
      const result = await sendConversacionStream(
        jwt,
        { prompt: text, iconversacion: selectedId || void 0, imagenes: imagenesUrls, audios: audiosUrls, mode: chatMode, provider: llmProvider },
        (partial) => setStreamText(partial)
      );
      const finalText = String(result.respuesta || "").trim();
      if (finalText) setStreamText(finalText);
      const streamMeta = result.meta;
      const streamFailed = streamMeta?.stream_ok === false;
      const streamError = formatStreamError(streamMeta?.stream_error);
      const newId = Number(result.iconversacion) || convIdBefore;
      const tituloStream = String(result.titulo || "").trim();
      setLogMensajes((prev) => enrichLogVista(
        finalizeStreamInLog(prev, finalText, streamFailed ? { failed: true, error: streamError } : void 0),
        userName
      ));
      if (streamFailed) {
        toastWarning(streamError || "La respuesta no se complet\xF3 correctamente.");
      }
      setSending(false);
      setStreamText("");
      if (newId) {
        const rowPatch = {
          iconversacion: newId,
          ...tituloStream ? { titulo: tituloStream } : {},
          ...result.qmensajes != null ? { qmensajes: result.qmensajes } : {},
          ...result.fhcre ? { fhcre: result.fhcre } : {},
          ...result.fhultact ? { fhultact: result.fhultact } : {},
          ...result.itercero ? { itercero: result.itercero } : {},
          ...result.icontacto ? { icontacto: result.icontacto } : {}
        };
        setRows((prev) => {
          const exists = prev.some((r) => convIdsEqual(r.iconversacion, newId));
          if (exists) return prev.map((r) => convIdsEqual(r.iconversacion, newId) ? { ...r, ...rowPatch } : r);
          return [rowPatch, ...prev];
        });
        setDetail((d) => d && convIdsEqual(d.iconversacion, newId) ? { ...d, ...rowPatch } : d);
        if (newId !== convIdBefore) {
          pendingListConvRef.current = newId;
          skipThreadReloadRef.current = newId;
          setSelectedId(newId);
          persistChatConvId(newId);
        }
        void reloadList().then(() => {
          setRows((prev) => {
            const exists = prev.some((r) => convIdsEqual(r.iconversacion, newId));
            if (exists) return prev.map((r) => convIdsEqual(r.iconversacion, newId) ? { ...r, ...rowPatch } : r);
            return [rowPatch, ...prev];
          });
        });
        void patchThreadAfterSend(newId, {
          minLogMensajes: logCountBefore + 2,
          ownerLabel: userName
        }).then(() => {
          if (!tituloStream) return;
          setDetail((d) => d && convIdsEqual(d.iconversacion, newId) && d.titulo !== tituloStream ? { ...d, titulo: tituloStream } : d);
          setRows((prev) => prev.map((r) => convIdsEqual(r.iconversacion, newId) && r.titulo !== tituloStream ? { ...r, titulo: tituloStream } : r));
        });
      } else if (result?.mensajesOpenAI?.length) {
        applyThreadFromDetail(result, null, userName);
      }
    } catch (e) {
      toastError(e instanceof Error ? e.message : String(e));
      if (text) setDraft(text);
      if (imageEntries.length) {
        setImages(imageEntries);
      }
      if (audioEntries.length) {
        setAudios(audioEntries);
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
  async function appendImagesFromFiles(files) {
    if (!files?.length) return;
    try {
      const list = Array.from(files);
      if (hasHeicLikeFiles(list)) {
        toastWarning("HEIC/HEIF no se admite; usa PNG, JPEG, WebP o GIF");
      }
      const added = await filesToImageEntries(list);
      if (!added.length) {
        toastWarning("Solo se admiten im\xE1genes (PNG, JPEG, WebP, GIF)");
        return;
      }
      setImages((prev) => {
        const merged = [...prev, ...added];
        if (merged.length > MAX_CHAT_IMAGES) {
          toastWarning(`M\xE1ximo ${MAX_CHAT_IMAGES} im\xE1genes por mensaje`);
        }
        return merged.slice(0, MAX_CHAT_IMAGES);
      });
    } catch (err) {
      toastError(err instanceof Error ? err.message : String(err));
    }
  }
  async function appendAudiosFromFiles(files) {
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
          toastWarning(`M\xE1ximo ${MAX_CHAT_AUDIOS} audios por mensaje`);
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
          toastWarning("La grabaci\xF3n qued\xF3 vac\xEDa");
          return;
        }
        setAudios((prev) => {
          const merged = [...prev, entry];
          if (merged.length > MAX_CHAT_AUDIOS) {
            toastWarning(`M\xE1ximo ${MAX_CHAT_AUDIOS} audios por mensaje`);
          }
          return merged.slice(0, MAX_CHAT_AUDIOS);
        });
      } catch (err) {
        toastError(err instanceof Error ? err.message : String(err));
      }
      return;
    }
    if (!isVoiceRecordingSupported()) {
      toastWarning("Tu navegador no admite grabaci\xF3n de voz");
      return;
    }
    if (audios.length >= MAX_CHAT_AUDIOS) {
      toastWarning(`M\xE1ximo ${MAX_CHAT_AUDIOS} audios por mensaje`);
      return;
    }
    try {
      await recorder.start();
      setIsRecording(true);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "No se pudo acceder al micr\xF3fono");
    }
  }
  function onAttachClick() {
    attachInputRef.current?.click();
  }
  async function onAttachChange(e) {
    const files = e.target.files;
    if (!files?.length) return;
    const list = Array.from(files);
    const imageFiles = list.filter(isChatImageFile);
    const audioFiles = list.filter(isChatAudioFile);
    const unsupported = list.filter((f) => !isChatImageFile(f) && !isChatAudioFile(f));
    if (unsupported.length) {
      toastWarning("Solo se admiten im\xE1genes y audios");
    }
    if (imageFiles.length) await appendImagesFromFiles(imageFiles);
    if (audioFiles.length) await appendAudiosFromFiles(audioFiles);
    e.target.value = "";
  }
  async function onPaste(e) {
    if (!canSend) return;
    const files = readImagesFromClipboard(e.clipboardData?.items);
    if (!files.length) return;
    e.preventDefault();
    await appendImagesFromFiles(files);
  }
  const onMeta = useCallback2((msg) => {
    setMetaMsg(msg);
    setMetaOpen(true);
  }, []);
  const onSendRef = useRef2(onSend);
  onSendRef.current = onSend;
  const onContapymeLoginDone = useCallback2(() => {
    if (sendingRef.current || contapymeResumeLockRef.current || !canSend || !jwt) return;
    const msgs = logMensajesRef.current || [];
    let pending = false;
    for (let i = msgs.length - 1; i >= 0; i--) {
      const m = msgs[i];
      if (m.esUsuario || m.esOperativa) continue;
      const t = String(m.contenido || "");
      if (/Sesión ContaPyme® activa/i.test(t)) break;
      if (/ia\.contapyme\.com\/api\/login\/asw/i.test(t) || Boolean(m.meta?.login_url || m.meta?.extra?.login_url || m.meta?.contapyme_mcp_login)) {
        pending = true;
      }
      break;
    }
    if (!pending) return;
    contapymeResumeLockRef.current = true;
    void Promise.resolve(onSendRef.current("ya inici\xE9 sesi\xF3n")).finally(() => {
      window.setTimeout(() => {
        contapymeResumeLockRef.current = false;
      }, 8e3);
    });
  }, [canSend, jwt]);
  const onRateMessage = useCallback2(async (msg, butil) => {
    if (!canSend || !jwt?.token || !selectedId) return;
    if (msg.calificacion !== void 0) return;
    const imensaje = Number(msg.imensaje);
    if (!imensaje) {
      toastWarning("No se puede calificar este mensaje (sin identificador de mensaje).");
      return;
    }
    const contenido = String(msg.contenido || "").trim();
    if (!contenido) {
      toastWarning("No se puede calificar un mensaje vac\xEDo.");
      return;
    }
    setRatingMsgId(msg.idMsg);
    try {
      const saved = await postMensajeCalificado(jwt, {
        iconversacion: selectedId,
        contenido,
        imensaje,
        butil
      });
      const calificacion = butil ? 1 : 0;
      const imensajeDb = Number(saved?.imensaje) || msg.imensaje;
      setLogMensajes((prev) => prev.map((m) => m.idMsg === msg.idMsg ? { ...m, calificacion, imensaje: imensajeDb, idMsg: imensajeDb ? `msg-${imensajeDb}` : m.idMsg } : m));
      toastSuccess(butil ? "Marcado como \xFAtil" : "Marcado como no \xFAtil");
    } catch (e) {
      toastError(e instanceof Error ? e.message : String(e));
    } finally {
      setRatingMsgId(null);
    }
  }, [canSend, jwt, selectedId]);
  const chatUserDisplayName = useMemo2(
    () => resolveOwnerDisplayName(jwt, displayScope),
    [displayScope, jwt]
  );
  const chatUserNick = useMemo2(
    () => resolveOwnerNickname(jwt, sessionUser),
    [jwt, sessionUser]
  );
  const displayMensajes = useMemo2(
    () => appendStreamMsg(logMensajes, streamText, sending),
    [logMensajes, sending, streamText]
  );
  const showThread = Boolean(
    sending || selectedId && (loadingThread || detail || logMensajes.length > 0)
  );
  const onThreadScroll = useThreadScrollAnchor(threadScrollRef, displayMensajes, { sending });
  const postBodyPreview = useMemo2(
    () => buildConversacionPostBody({
      prompt: draft,
      iconversacion: selectedId || void 0,
      // preview sin URLs (se generan tras subir); muestra placeholders.
      imagenes: images.map((i) => i.uploadedUrl ?? `[local image: ${i.name} \xB7 ${i.mime} \xB7 ${i.blob.size}B]`),
      audios: audios.map((a) => a.uploadedUrl ?? `[local audio: ${a.name} \xB7 ${a.mime} \xB7 ${a.blob.size}B]`),
      mode: chatMode,
      provider: llmProvider
    }),
    [draft, selectedId, images, audios, chatMode, llmProvider]
  );
  const clearAuditFilter = useCallback2(() => {
    if (jwt?.claims?.itercero) {
      handleSelectAuditScope({ esJwt: true, itercero: jwt.claims.itercero, icontacto: jwt.claims.icontacto });
    } else {
      setAuditScope(null);
      setConvListPage(1);
      setConvListSearch("");
      setSelectedId(null);
      setDetail(null);
      setLogMensajes([]);
    }
  }, [jwt?.claims?.itercero, jwt?.claims?.icontacto, handleSelectAuditScope]);
  const auditCurrentScope = listScope;
  const convListOwnerLabel = useMemo2(
    () => resolveConvListOwnerLabel(listScope, jwt, sessionUser),
    [listScope, jwt, sessionUser]
  );
  const convListHeader = useMemo2(
    () => resolveConvListHeader(listScope, jwt, sessionUser),
    [listScope, jwt, sessionUser]
  );
  return {
    loggedIn,
    jwt,
    jwtOpen,
    jwtLoading,
    sessionUser,
    canAdminJwt,
    canAuditChat,
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
    convListPageSize,
    convListMeta,
    convListSearch,
    messageSource,
    chatMode,
    llmProvider,
    chatUserDisplayName,
    chatUserNick,
    convListOwnerLabel,
    convListHeader,
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
    handleConvListSearchChange,
    handleSelectAuditScope,
    clearAuditFilter,
    openConv,
    onNewChat,
    onDelete,
    onSend,
    onContapymeLoginDone,
    onPaste,
    onAttachClick,
    onAttachChange,
    onToggleVoiceRecord,
    onMeta,
    onRateMessage,
    onMessageSourceChange,
    onChatModeChange,
    onLlmProviderChange,
    onConvListPageSizeChange,
    setDraft,
    setImages,
    setAudios
  };
}
export {
  useChatTool
};
