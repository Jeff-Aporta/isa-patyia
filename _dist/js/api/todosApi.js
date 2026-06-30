// ../Personal/apps/isa-patyia/frontend/js/core/patyia.ts
window.ISAFront.migrateLegacyGatewayKeys?.({ "jeff:gateway-local": "", "patyia-apptools:gateway-local": "", "patyia-apptools:lab-local": "" });
var ORCH_ONLINE = "https://main-orchestrator.jeffaporta.workers.dev";
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

// ../Personal/apps/isa-patyia/frontend/js/core/platform.ts
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

// ../Personal/apps/isa-patyia/frontend/js/api/sessionApi.ts
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
  return session;
}
function logout() {
  Session.logout();
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

// ../Personal/apps/isa-patyia/frontend/js/api/todosApi.ts
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
  const headers = { Accept: "application/json" };
  Object.assign(headers, Session.authHeader(), Session.appHeader());
  const apiPath = `/api/scrum/users/search?${params}`;
  const bases = [];
  if (isDevHost() && isLocalMode()) {
    bases.push(SCRUM_LOCAL.replace(/\/$/, ""), ORCH_LOCAL.replace(/\/$/, ""));
  } else {
    bases.push(ORCH_ONLINE.replace(/\/$/, ""));
  }
  for (const base of bases) {
    try {
      const res = await fetch(`${base}${apiPath}`, { method: "GET", headers });
      if (!res.ok) continue;
      const data = await res.json().catch(() => ({}));
      if (data.ok === false) continue;
      return data.users ?? [];
    } catch {
    }
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
