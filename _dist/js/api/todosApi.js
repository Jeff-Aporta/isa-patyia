// ../../Personal/apps/isa-patyia/frontend/js/core/patyia.ts
window.ISAFront.migrateLegacyGatewayKeys?.({ "jeff:gateway-local": "", "patyia-apptools:gateway-local": "", "patyia-apptools:lab-local": "" });
var ORCH_ONLINE = "https://main-orchestrator.jeffaporta.workers.dev";
var PATYIA_BRIDGE_URL = "https://ayudascp-ia-staging.azurewebsites.net";
var PATYIA_ISS_LOCAL = "http://127.0.0.1:8802";
var ORCH_LOCAL = "http://localhost:8790";
var SCRUM_LOCAL = "http://localhost:8798";
var PATYIA_BRIDGE_LOCAL = `${PATYIA_ISS_LOCAL}/api`;
var PATYIA_ISS_LOCAL_LS_KEY = "patyia-apptools:iss-local";
function isLocalMode() {
  try {
    return localStorage.getItem(PATYIA_ISS_LOCAL_LS_KEY) === "1";
  } catch {
    return false;
  }
}
function isDevHost() {
  try {
    return /^(localhost|127\.0\.0\.1|\[::1\])$/i.test(window.location.hostname);
  } catch {
    return false;
  }
}
function resolveIssApiBase() {
  const base = (isLocalMode() ? PATYIA_BRIDGE_LOCAL : PATYIA_BRIDGE_URL).replace(/\/$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
}

// ../../Personal/apps/isa-patyia/frontend/js/core/platform.ts
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
var fb = () => globalThis.ISAFront?.Feedback;
function toastError(text, timeout) {
  fb()?.toast?.error?.(text, timeout);
}
function toastWarning(text, timeout) {
  fb()?.toast?.warning?.(text, timeout);
}

// ../../Personal/apps/isa-patyia/frontend/js/api/systemConfigApi.ts
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
function unwrapBody(data) {
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
var PERMISSIONS_ME_CACHE = { value: null, iat: 0, ttlMs: 0, key: "" };
async function fetchPermissionsMe(opts) {
  if (!Session.isLoggedIn()) return null;
  const sessionKey = Session?.currentSession?.()?.token ?? "anon";
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
  const data = unwrapBody(await res.json());
  if (!data || data.kind !== "insoft.permissions-me") return PERMISSIONS_ME_CACHE.value;
  PERMISSIONS_ME_CACHE.value = data;
  PERMISSIONS_ME_CACHE.iat = data.iat || Date.now();
  PERMISSIONS_ME_CACHE.ttlMs = data.ttlMs || 6e4;
  PERMISSIONS_ME_CACHE.key = sessionKey;
  return data;
}

// ../../Personal/apps/isa-patyia/frontend/js/api/sessionApi.ts
var ME_CAPS = {};
var ME_CAPS_KEY = "";
var ME_CAPS_BOOTSTRAP_TS = 0;
var ME_CAPS_INFLIGHT = null;
var ME_CAPS_RETRY_TIMER = null;
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
        ME_CAPS_KEY = Session?.current?.()?.token ?? "";
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
  ME_CAPS_BOOTSTRAP_TS = 0;
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
var isLoggedIn = () => Session.isLoggedIn();
var can = (cap) => Session.can(cap);
var blockReason = (cap) => Session.blockReason(cap);
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
var clearSession = logout;
function handleApiError(err, cap) {
  window.ISAFront.handleApiError(err, cap, { blockReason, clearSession, toastWarning, toastError });
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
  clearSession
};

// ../../Personal/apps/isa-patyia/frontend/js/api/todosApi.ts
var scrumHttp = window.ISAFront.createCapFetch({
  Session,
  Config,
  getApiBase: () => ORCH_ONLINE.replace(/\/$/, ""),
  localDirect: [
    {
      test: (p) => {
        const n = p.startsWith("/") ? p : `/${p}`;
        return n.startsWith("/scrum") || n.startsWith("/api/scrum");
      },
      base: SCRUM_LOCAL
    }
  ],
  orchOnlineInLocal: false,
  isLocal: isLocalMode,
  handleApiError,
  clearSession
});
var SCRUM_APP_ID = "isa-patyia";
function qs(extra) {
  const params = new URLSearchParams({ app: SCRUM_APP_ID, ...extra });
  return `?${params.toString()}`;
}
async function searchScrumAppUsers(query = "", limit = 12) {
  if (!Session.isLoggedIn()) return [];
  const params = new URLSearchParams({ app: SCRUM_APP_ID, limit: String(limit) });
  if (query.trim()) params.set("q", query.trim());
  const rel = `/api/scrum/users/search?${params}`;
  const headers = { Accept: "application/json" };
  Object.assign(headers, Session.authHeader(), Session.appHeader());
  const tryBase = async (base) => {
    try {
      const res = await fetch(`${String(base).replace(/\/$/, "")}${rel}`, { method: "GET", headers });
      if (!res.ok) return null;
      const data = await res.json().catch(() => ({}));
      if (data.ok === false) return null;
      return data.users ?? [];
    } catch {
      return null;
    }
  };
  const bases = isDevHost() && isLocalMode() ? [SCRUM_LOCAL, ORCH_LOCAL] : [ORCH_ONLINE.replace(/\/$/, "")];
  for (const base of bases) {
    const users = await tryBase(base);
    if (users !== null) return users;
  }
  return [];
}
async function fetchTodoBoards(boardType = "scrum") {
  const data = await scrumHttp.capFetch(`/scrum/boards${qs({ boardType })}`, { method: "GET" });
  return data.boards ?? [];
}
async function createTodoBoard(payload) {
  const data = await scrumHttp.capFetch(`/scrum/boards${qs()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ boardType: "scrum", ...payload })
  });
  return data;
}
async function updateTodoBoard(boardId, patch) {
  const data = await scrumHttp.capFetch(`/scrum/boards/${boardId}${qs()}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch)
  });
  return data;
}
async function deleteTodoBoard(boardId) {
  const data = await scrumHttp.capFetch(`/scrum/boards/${boardId}${qs()}`, { method: "DELETE" });
  return data;
}
async function fetchTodoBoardMembers(boardId) {
  const data = await scrumHttp.capFetch(`/scrum/boards/${boardId}/members${qs()}`, { method: "GET" });
  return data.members ?? [];
}
async function saveTodoBoardMembers(boardId, members) {
  const data = await scrumHttp.capFetch(`/scrum/boards/${boardId}/members${qs()}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ members })
  });
  return data.members ?? [];
}
async function fetchPublicTodoBoards(boardType = "scrum") {
  const base = ORCH_ONLINE.replace(/\/$/, "");
  const params = new URLSearchParams({ app: SCRUM_APP_ID, boardType });
  const res = await fetch(`${base}/api/scrum/public?${params}`, {
    method: "GET",
    headers: { Accept: "application/json" }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return data.boards ?? [];
}
async function fetchPublicTodoBoard(slug) {
  const base = ORCH_ONLINE.replace(/\/$/, "");
  const params = new URLSearchParams({ app: SCRUM_APP_ID });
  const res = await fetch(`${base}/api/scrum/public/${encodeURIComponent(slug)}?${params}`, {
    method: "GET",
    headers: { Accept: "application/json" }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return data;
}
function buildPublicScrumUrl(publicSlug) {
  const origin = typeof location !== "undefined" ? location.origin + location.pathname : "";
  const snap = { v: 1, tool: "todos", local: false, log: {}, prompts: {}, chat: {}, todos: { publicSlug } };
  const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(snap))));
  return `${origin}?s=${encodeURIComponent(b64)}`;
}
async function fetchTodoBoard(boardId) {
  const data = await scrumHttp.capFetch(`/scrum/boards/${boardId}${qs()}`, { method: "GET" });
  return data;
}
async function createTodoTask(boardId, payload) {
  const data = await scrumHttp.capFetch(`/scrum/boards/${boardId}/tasks${qs()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return data.task;
}
async function fetchTodoTask(taskId) {
  const data = await scrumHttp.capFetch(`/scrum/tasks/${taskId}${qs()}`, { method: "GET" });
  return data.task;
}
async function updateTodoTask(taskId, patch) {
  const data = await scrumHttp.capFetch(`/scrum/tasks/${taskId}${qs()}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch)
  });
  return data.task;
}
async function createTodoMilestone(taskId, payload) {
  const data = await scrumHttp.capFetch(`/scrum/tasks/${taskId}/milestones${qs()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return data.milestone;
}
async function updateTodoMilestone(milestoneId, patch) {
  const data = await scrumHttp.capFetch(`/scrum/milestones/${milestoneId}${qs()}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch)
  });
  return data.milestone;
}
async function deleteTodoTask(taskId) {
  await scrumHttp.capFetch(`/scrum/tasks/${taskId}${qs()}`, { method: "DELETE" });
}
async function deleteTodoMilestone(milestoneId) {
  await scrumHttp.capFetch(`/scrum/milestones/${milestoneId}${qs()}`, { method: "DELETE" });
}
async function addTodoComment(taskId, body) {
  const data = await scrumHttp.capFetch(`/scrum/tasks/${taskId}/comments${qs()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body })
  });
  return data.event;
}
export {
  SCRUM_APP_ID,
  addTodoComment,
  buildPublicScrumUrl,
  createTodoBoard,
  createTodoMilestone,
  createTodoTask,
  deleteTodoBoard,
  deleteTodoMilestone,
  deleteTodoTask,
  fetchPublicTodoBoard,
  fetchPublicTodoBoards,
  fetchTodoBoard,
  fetchTodoBoardMembers,
  fetchTodoBoards,
  fetchTodoTask,
  saveTodoBoardMembers,
  searchScrumAppUsers,
  updateTodoBoard,
  updateTodoMilestone,
  updateTodoTask
};
