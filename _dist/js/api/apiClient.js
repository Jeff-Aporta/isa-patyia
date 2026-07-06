// js/core/patyia.ts
window.ISAFront.migrateLegacyGatewayKeys?.({ "jeff:gateway-local": "", "patyia-apptools:gateway-local": "", "patyia-apptools:lab-local": "" });
var PATYIA_BRIDGE_URL = "https://ayudascp-ia-staging.azurewebsites.net";
var PATYIA_ISS_LOCAL = "http://127.0.0.1:8802";
var PATYIA_BRIDGE_LOCAL = `${PATYIA_ISS_LOCAL}/api`;
var PATYIA_ISS_LOCAL_LS_KEY = "patyia-apptools:iss-local";
function isPatyiaApiPath(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return p.startsWith("/patyia") || p.startsWith("/api/patyia");
}
function patyiaCapFetchBase() {
  return (isLocalMode() ? PATYIA_ISS_LOCAL : PATYIA_BRIDGE_URL).replace(/\/$/, "");
}
function isLocalMode() {
  try {
    return localStorage.getItem(PATYIA_ISS_LOCAL_LS_KEY) === "1";
  } catch {
    return false;
  }
}
function resolveIssApiBase() {
  const base = (isLocalMode() ? PATYIA_BRIDGE_LOCAL : PATYIA_BRIDGE_URL).replace(/\/$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
}

// js/core/platform.ts
var bridge = () => window.ISAFront.createPlatformBridge("ISA");
var Session = {
  current: () => bridge().Session.current(),
  isLoggedIn: () => bridge().Session.isLoggedIn(),
  username: () => bridge().Session.username(),
  realUsername: () => bridge().Session.realUsername?.() ?? bridge().Session.username(),
  viewAsUsername: () => bridge().Session.viewAsUsername?.() ?? null,
  isViewingAs: () => bridge().Session.isViewingAs?.() ?? false,
  auditAuthor: () => bridge().Session.auditAuthor?.() ?? String(bridge().Session.username() || "").trim().toUpperCase(),
  authHeader: () => bridge().Session.authHeader(),
  appHeader: () => bridge().Session.appHeader(),
  appId: () => bridge().Session.appId(),
  login: (u, p, opts) => bridge().Session.login(u, p, opts),
  logout: () => bridge().Session.logout(),
  refreshProfile: () => bridge().Session.refreshProfile(),
  fetchViewAsCatalog: () => bridge().Session.fetchViewAsCatalog?.(),
  searchSuplantacionUsers: (q, limit) => bridge().Session.searchSuplantacionUsers?.(q, limit),
  setViewAs: (u) => bridge().Session.setViewAs?.(u),
  clearViewAs: () => bridge().Session.clearViewAs?.(),
  capabilities: () => bridge().Session.capabilities(),
  adminCapabilities: () => bridge().Session.adminCapabilities?.() ?? bridge().Session.capabilities(),
  capabilityCatalog: () => bridge().Session.capabilityCatalog?.() ?? [],
  can: (cap) => bridge().Session.can(cap),
  blockReason: (cap) => bridge().Session.blockReason(cap),
  get EVENT() {
    return bridge().Session.EVENT;
  }
};
var Config = {
  base: () => bridge().Config.base(),
  apiUrl: (path) => bridge().Config.apiUrl(path),
  isLocal: () => bridge().Config.isLocal(),
  setLocal: (on) => bridge().Config.setLocal(on),
  get EVENT() {
    return bridge().Config.EVENT;
  }
};

// js/core/patyia-jwt.ts
var PATYIA_JWT_STORAGE_KEY = "isa-patyia:paty-jwt";
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

// js/api/issListFilter.ts
var ISS_LIST_FILTER_QUERY_PARAM = "f";
var CONVERSACIONES_LIST_SORT_DEFAULT = "-iconversacion";
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

// js/api/patyiaTokens.ts
function patyAuthHeaders(jwt, extra = {}) {
  return {
    Authorization: `Bearer ${jwt.token}`,
    Accept: "application/json",
    ...extra
  };
}

// js/api/patyiaChatApi.ts
function authHeaders(jwt, extra = {}) {
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
      ...authHeaders(jwt),
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
        const inner = j.respuesta || j.body || j;
        msg = String(inner?.error || j.error || j.message || msg);
      } catch {
      }
    }
    throw new Error(msg || `HTTP ${res.status}`);
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
async function getConversacionLogs(jwt, id) {
  return jsonFetch(`/conversacion/logs/${id}`, jwt);
}
function convLogFromDetalle(detail, id) {
  const raw = detail?.convLog;
  if (!raw || !Array.isArray(raw.mensajes) || !raw.mensajes.length) return null;
  const convId = Number(raw.iconversacion ?? detail?.iconversacion ?? id ?? 0);
  return { ...raw, iconversacion: convId > 0 ? convId : raw.iconversacion };
}

// js/api/systemConfigApi.ts
function systemApiBase() {
  return resolveIssApiBase();
}
function systemApiHeaders(extra = {}) {
  const h = {
    Accept: "application/json",
    "X-Patyia-Auth-Mode": "w",
    ...extra
  };
  if (Session.isLoggedIn()) Object.assign(h, Session.authHeader(), Session.appHeader());
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
async function jsonFetch2(path, init) {
  const res = await fetch(`${systemApiBase()}${path}`, init);
  const ct = res.headers.get("content-type") || "";
  if (!res.ok) {
    let msg = res.statusText;
    if (ct.includes("json")) {
      try {
        const j = await res.json();
        const enc = j.encabezado;
        if (enc?.resultado === false && enc.mensaje) msg = String(enc.mensaje);
        else {
          const inner = j.respuesta || j.body || j;
          msg = String(inner?.message || inner?.error || j.message || j.error || msg);
        }
      } catch {
      }
    }
    throw new Error(msg || `HTTP ${res.status}`);
  }
  if (!ct.includes("json")) {
    throw new Error(`Respuesta no JSON (${res.status}) desde ${systemApiBase()}${path}`);
  }
  const raw = await res.json();
  return unwrapBody2(raw);
}
async function fetchInstruccionesSystemConfig() {
  const body = await jsonFetch2("/system/instrucciones", { method: "GET", headers: systemApiHeaders() });
  const rows = Array.isArray(body.rows) ? body.rows : [];
  return {
    rows,
    canEdit: !!body.canEdit,
    storage: body.storage,
    schema: body.schema,
    rowCount: Number(body.rowCount ?? rows.length) || rows.length
  };
}
async function putInstruccionUpsert(payload) {
  return jsonFetch2("/system/instrucciones", {
    method: "PUT",
    headers: { ...systemApiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}
async function putInstruccionesPublish(sql) {
  return jsonFetch2("/system/instrucciones", {
    method: "PUT",
    headers: { ...systemApiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ sql })
  });
}
var PERMISSIONS_ME_CACHE = { value: null, iat: 0, ttlMs: 0, key: "" };
function permissionsMeSessionKey() {
  if (!Session.isLoggedIn()) return "anon";
  const tok = Session?.current?.()?.token;
  const user = Session.username?.() || Session?.current?.()?.username;
  return String(tok || user || "anon").trim();
}
async function fetchPermissionsMe(opts) {
  if (!Session.isLoggedIn()) return null;
  const sessionKey = permissionsMeSessionKey();
  if (!opts?.force && PERMISSIONS_ME_CACHE.value && PERMISSIONS_ME_CACHE.key === sessionKey && Date.now() - PERMISSIONS_ME_CACHE.iat < PERMISSIONS_ME_CACHE.ttlMs) {
    return PERMISSIONS_ME_CACHE.value;
  }
  const f = opts?.fetchImpl ?? fetch;
  const res = await f(`${systemApiBase()}/permissions/me`, {
    method: "GET",
    headers: { ...systemApiHeaders(), Accept: "application/json" },
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
  PERMISSIONS_ME_CACHE.ttlMs = data.ttlMs || 6e4;
  PERMISSIONS_ME_CACHE.key = sessionKey;
  return data;
}

// js/tools/roleHierarchy.js
var DEFAULT_ROLE_JERARQUIA = {
  visitante: "0",
  dev: "0.0",
  dev_lead: "0.0.0",
  dev_iss: "0.0.1",
  admn: "0.1",
  auditador: "0.1.0",
  admn_isapatyia: "0.1.0.0"
};
var DEFAULT_FOR_UNKNOWN = "999";
function compareHierarchy(a, b) {
  const aParts = String(a ?? "").split(".").map((n) => Number(n) || 0);
  const bParts = String(b ?? "").split(".").map((n) => Number(n) || 0);
  const len = Math.max(aParts.length, bParts.length);
  for (let i = 0; i < len; i++) {
    const av = aParts[i] ?? 0;
    const bv = bParts[i] ?? 0;
    if (av !== bv) return av - bv;
  }
  return 0;
}
function getRoleJerarquia(roleName, permisos) {
  if (permisos && typeof permisos === "object") {
    const j = permisos.jerarquia;
    if (typeof j === "string" && j.trim()) return j.trim();
  }
  const key = String(roleName ?? "").trim().toLowerCase();
  return DEFAULT_ROLE_JERARQUIA[key] ?? DEFAULT_FOR_UNKNOWN;
}

// js/tools/roleCanonicalMeta.js
var CANONICAL_ROLE_META = {
  dev: {
    namedisplay: "Desarrollador b\xE1sico",
    descripcion: "Desarrollador b\xE1sico \u2014 rama desarrollo (hereda visitante)"
  },
  admn: {
    namedisplay: "Admn b\xE1sico",
    descripcion: "Admn b\xE1sico \u2014 permisos administrativos globales (hereda visitante)"
  },
  admn_isapatyia: {
    namedisplay: "Admn ISA-Paty",
    descripcion: "Admn ISA-Paty \u2014 permisos administrativos sobre PatyIA (hereda auditador, admn y visitante)"
  }
};
function canonicalRoleMeta(roleName) {
  const key = String(roleName ?? "").trim().toLowerCase();
  return CANONICAL_ROLE_META[key] ?? null;
}

// js/api/sessionApi.ts
function formatRoleTitle(roleName) {
  return String(roleName ?? "").split("_").map((part) => {
    const p = part.toLowerCase();
    if (p === "iss" || p === "isw") return p.toUpperCase();
    if (!p) return "";
    return p.charAt(0).toUpperCase() + p.slice(1);
  }).filter(Boolean).join(" ");
}
function roleLabel(roleName) {
  const key = String(roleName ?? "").trim().toLowerCase();
  if (!key) return "";
  const canon = canonicalRoleMeta(key);
  if (canon?.namedisplay) return canon.namedisplay;
  return formatRoleTitle(key);
}
function pickPrimaryIssRole(roles) {
  const list = (roles ?? []).map((r) => String(r ?? "").trim().toLowerCase()).filter(Boolean);
  if (!list.length) return "";
  list.sort((a, b) => compareHierarchy(getRoleJerarquia(a), getRoleJerarquia(b)));
  const elevated = list.filter((r) => r !== "visitante");
  return elevated[0] ?? list[0];
}
var INSTRUCCIONES_WRITE_CAP = "patyia.instrucciones.publish";
var ME_CAPS = {};
var ME_CAPS_KEY = "";
var ME_ISS_ROLES = [];
var ME_LOGIN_ROLE = "";
var ME_CAPS_BOOTSTRAP_TS = 0;
var ME_CAPS_INFLIGHT = null;
var ME_CAPS_RETRY_TIMER = null;
var ME_SERVER_INSTRUCCIONES_EDIT = null;
function sessionCacheKey() {
  if (!Session.isLoggedIn()) return "";
  const tok = Session?.current?.()?.token;
  const user = Session.username?.() || Session?.current?.()?.username;
  return String(tok || user || "").trim();
}
function localMeCaps() {
  if (!Session.isLoggedIn()) return {};
  const key = sessionCacheKey();
  if (key !== ME_CAPS_KEY) return {};
  return ME_CAPS;
}
var ME_CAPS_FETCH_GUARD_MS = 5e3;
var ME_CAPS_REENTRY_GUARD_MS = 1500;
async function primeMeCaps(force = false) {
  if (!Session.isLoggedIn()) return;
  if (ME_CAPS_INFLIGHT) return ME_CAPS_INFLIGHT;
  const now = Date.now();
  if (now - ME_CAPS_BOOTSTRAP_TS < ME_CAPS_REENTRY_GUARD_MS) return;
  if (!force && now - ME_CAPS_BOOTSTRAP_TS < ME_CAPS_FETCH_GUARD_MS) return;
  ME_CAPS_INFLIGHT = (async () => {
    let ok = false;
    try {
      const me = await fetchPermissionsMe({ force });
      if (me?.capabilities) {
        ME_CAPS_KEY = sessionCacheKey();
        ME_ISS_ROLES = Array.isArray(me.roles) ? me.roles.map((r) => String(r ?? "").trim()).filter(Boolean) : [];
        ME_LOGIN_ROLE = String(me.loginRole ?? "").trim();
        ME_CAPS = {
          canEditInstrucciones: !!me.capabilities.canEditInstrucciones,
          canEditOpenAiConfig: !!me.capabilities.canEditOpenAiConfig,
          canEditPromptsOperativos: !!me.capabilities.canEditPromptsOperativos,
          canEditConversacionConfig: !!me.capabilities.canEditConversacionConfig,
          canEditSwagger: !!me.capabilities.canEditSwagger,
          canOverrideSampling: !!me.capabilities.canOverrideSampling,
          canManagePermissions: !!me.capabilities.canManagePermissions,
          canImpersonate: !!me.capabilities.canImpersonate,
          canAssignUserRoles: !!me.capabilities.canAssignUserRoles,
          canAccessOthers: !!me.capabilities.canAccessOthers,
          canViewKanban: !!me.capabilities.canViewKanban,
          canEditKanbanCards: !!me.capabilities.canEditKanbanCards,
          canViewLogs: !!me.capabilities.canViewLogs,
          canViewPrompts: !!me.capabilities.canViewPrompts,
          canViewChat: !!me.capabilities.canViewChat,
          canViewConfig: !!me.capabilities.canViewConfig,
          canSendChat: !!me.capabilities.canSendChat
        };
        ME_CAPS_BOOTSTRAP_TS = Date.now();
        ok = true;
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
function setServerInstruccionesCanEdit(v) {
  ME_SERVER_INSTRUCCIONES_EDIT = v;
  window.dispatchEvent(new Event("patyia-apptools:caps-changed"));
}
function notifyAuth() {
  window.dispatchEvent(new Event(Session.EVENT));
  window.dispatchEvent(new Event("patyia-apptools:auth"));
  window.dispatchEvent(new Event("isa-patyia:auth"));
}
var isLoggedIn = () => Session.isLoggedIn();
var can = (cap) => Session.can(cap);
var blockReason = (cap) => Session.blockReason(cap);
function canEditInstrucciones() {
  return !!localMeCaps().canEditInstrucciones || ME_SERVER_INSTRUCCIONES_EDIT === true;
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
  notifyAuth();
}
function resolveDisplayRole() {
  if (!Session.isLoggedIn()) return "";
  const key = sessionCacheKey();
  if (key === ME_CAPS_KEY && ME_ISS_ROLES.length) {
    return roleLabel(pickPrimaryIssRole(ME_ISS_ROLES));
  }
  if (key === ME_CAPS_KEY && ME_LOGIN_ROLE) return roleLabel(ME_LOGIN_ROLE);
  const sl = Session.current()?.role;
  return sl ? roleLabel(sl) : "";
}
var clearSession = logout;
function getSession() {
  const s = Session.current();
  if (!s) return null;
  return {
    username: Session.username(),
    realUsername: Session.realUsername(),
    viewAsUsername: Session.viewAsUsername(),
    role: resolveDisplayRole(),
    expiresAt: s.expiresAt,
    sessionToken: s.token,
    app: Session.appId(),
    capabilities: Session.capabilities()
  };
}
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
  resolveDisplayRole
};

// js/api/apiClient.ts
var bridgeHttp = window.ISAFront.createCapFetch({
  Session,
  Config,
  getApiBase: patyiaCapFetchBase,
  localDirect: [
    { test: (p) => isPatyiaApiPath(p) || String(p).startsWith("/patyia"), base: PATYIA_ISS_LOCAL.replace(/\/$/, "") }
  ],
  orchOnline: PATYIA_BRIDGE_URL,
  orchOnlineInLocal: true,
  isLocal: isLocalMode
});
var capFetch = bridgeHttp.capFetch;
var apiUrl = bridgeHttp.apiUrl;
var rowVal = bridgeHttp.rowVal;
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
function patyiaBridgePath(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return p;
}
async function fetchInstruccionesPaty() {
  const data = await fetchInstruccionesSystemConfig();
  setServerInstruccionesCanEdit(!!data.canEdit);
  return { rows: data.rows, canEdit: !!data.canEdit };
}
function publishInstruccionesPaty(sql) {
  if (!canEditInstrucciones()) {
    throw new Error(
      blockReason(INSTRUCCIONES_WRITE_CAP) || "Sin permiso para publicar instrucciones"
    );
  }
  return putInstruccionesPublish(sql);
}
async function upsertInstruccionPaty(payload) {
  if (!canEditInstrucciones()) {
    throw new Error(
      blockReason(INSTRUCCIONES_WRITE_CAP) || "Sin permiso para publicar instrucciones"
    );
  }
  return putInstruccionUpsert(payload);
}
function isConvNotFound(err) {
  const status = err && typeof err === "object" ? Number(err.status) : 0;
  if (status === 404) return true;
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return /not found|no encontrad|\b404\b/i.test(msg);
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
    } catch (e) {
      if (!isConvNotFound(e)) throw e;
    }
  }
  return fetchConvLogById(convId);
}
async function fetchConvLogById(id) {
  const convId = Number(id);
  if (!Number.isInteger(convId) || convId <= 0) throw new Error("iconversacion inv\xE1lido");
  const paths = [
    patyiaBridgePath(`/conversacion/${convId}/log`),
    patyiaBridgePath(`/conversacion/logs/${convId}`)
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
    raw = await capFetch(`${patyiaBridgePath("/auditoria/terceros")}?${params.toString()}`, { method: "GET" });
  } catch (err) {
    if (isLocalMode() && input.jwtToken) return fetchTercerosAuditFromLocalConversaciones(input);
    throw err;
  }
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
}
async function fetchTercerosAuditFromLocalConversaciones(input) {
  const limit = input.limit ?? 20;
  const groups = /* @__PURE__ */ new Map();
  for (let page2 = 1; page2 <= 5; page2 += 1) {
    const params = conversacionesListQueryParams({ page: page2, limit: 100, sort: "-iconversacion" });
    const res = await fetch(`${PATYIA_BRIDGE_LOCAL.replace(/\/$/, "")}/conversaciones?${params.toString()}`, {
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
async function fetchConversacionesBridge(input, jwt) {
  const tokenJwt = jwt ?? loadPatyJwt();
  if (!tokenJwt?.token) {
    throw new Error("Configura el JWT de soporte-staging para listar conversaciones");
  }
  const res = await listConversaciones(tokenJwt, {
    page: input.page,
    limit: input.limit,
    search: input.search,
    sort: input.sort,
    itercero: input.itercero,
    icontacto: input.icontacto
  });
  return {
    ok: true,
    conversaciones: res.conversaciones,
    total: res.total,
    page: res.page,
    limit: res.limit,
    pages: res.pages
  };
}
export {
  apiUrl,
  capFetch,
  fetchConvLogById,
  fetchConvLogByIdWithRetry,
  fetchConvLogForQa,
  fetchConversacionesBridge,
  fetchInstruccionesPaty,
  fetchTercerosAudit,
  publishInstruccionesPaty,
  rowVal,
  upsertInstruccionPaty
};
