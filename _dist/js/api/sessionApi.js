// ../../Personal/apps/isa-patyia/frontend/js/core/patyia.ts
window.ISAFront.migrateLegacyGatewayKeys?.({ "jeff:gateway-local": "", "patyia-apptools:gateway-local": "", "patyia-apptools:lab-local": "" });
var PATYIA_BRIDGE_URL = "https://ayudascp-ia-staging.azurewebsites.net";
var PATYIA_ISS_LOCAL = "http://127.0.0.1:8802";
var PATYIA_BRIDGE_LOCAL = `${PATYIA_ISS_LOCAL}/api`;
var PATYIA_ISS_LOCAL_LS_KEY = "patyia-apptools:iss-local";
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
var INSTRUCCIONES_WRITE_CAP = "patyia.instrucciones.publish";
var TARGET_SWITCH_CAP = "infra.target.switch";
var ME_CAPS = {};
var ME_CAPS_KEY = "";
var ME_CAPS_BOOTSTRAP_TS = 0;
var ME_CAPS_INFLIGHT = null;
var ME_CAPS_RETRY_TIMER = null;
function localMeCaps() {
  if (!Session.isLoggedIn()) return {};
  const key = Session?.current?.()?.token ?? "";
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
function canViewLogs() {
  return !!localMeCaps().canViewLogs;
}
function canViewPrompts() {
  return !!localMeCaps().canViewPrompts;
}
function canViewChat() {
  return !!localMeCaps().canViewChat;
}
function canViewConfig() {
  return !!localMeCaps().canViewConfig;
}
function canViewKanban() {
  return !!localMeCaps().canViewKanban;
}
function canEditInstrucciones() {
  return !!localMeCaps().canEditInstrucciones;
}
function canEditOpenAiConfig() {
  return !!localMeCaps().canEditOpenAiConfig;
}
function canEditPromptsOperativos() {
  return !!localMeCaps().canEditPromptsOperativos;
}
function canEditConversacionConfig() {
  return !!localMeCaps().canEditConversacionConfig;
}
function canEditSwagger() {
  return !!localMeCaps().canEditSwagger;
}
function canOverrideSampling() {
  return !!localMeCaps().canOverrideSampling;
}
function canManagePermissions() {
  return !!localMeCaps().canManagePermissions;
}
function canImpersonate() {
  return !!localMeCaps().canImpersonate;
}
function canAssignUserRoles() {
  return !!localMeCaps().canAssignUserRoles;
}
function canAccessOthers() {
  return !!localMeCaps().canAccessOthers;
}
function canEditKanbanCards() {
  return !!localMeCaps().canEditKanbanCards;
}
function canSendChat() {
  return !!localMeCaps().canSendChat;
}
function canSwitchTarget() {
  return Session.can(TARGET_SWITCH_CAP);
}
function canAdminPortalJwt() {
  return Session.can("patyia.jwt.admin");
}
function canViewAsUser() {
  return Session.can("session.view_as");
}
function instruccionesPublishCap() {
  return canEditInstrucciones() ? INSTRUCCIONES_WRITE_CAP : null;
}
function patyChatInteractCap() {
  return canViewChat() && (Session.can("patyia.chat.interact") || Session.can("patyia.jwt.admin")) ? "patyia.chat.interact" : null;
}
function patyChatAuditCap() {
  return Session.can("patyia.chat.audit") ? "patyia.chat.audit" : null;
}
function patyJwtAdminCap() {
  return Session.can("patyia.jwt.admin") ? "patyia.jwt.admin" : null;
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
async function bootMeCaps() {
  return primeMeCaps(true);
}
var clearSession = logout;
function getSession() {
  const s = Session.current();
  if (!s) return null;
  return {
    username: Session.username(),
    realUsername: Session.realUsername(),
    viewAsUsername: Session.viewAsUsername(),
    role: s.role,
    expiresAt: s.expiresAt,
    sessionToken: s.token,
    app: Session.appId(),
    capabilities: Session.capabilities()
  };
}
function auditAuthor() {
  const real = String(Session.realUsername() || Session.username() || "").trim().toUpperCase();
  const viewAs = String(Session.viewAsUsername() || "").trim().toUpperCase();
  if (viewAs && real && viewAs !== real) return `${real} -> ${viewAs}`;
  return real || viewAs || "";
}
function humanPermissionError(err, cap) {
  return window.ISAFront.humanPermissionError(err, cap, blockReason);
}
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
export {
  INSTRUCCIONES_WRITE_CAP,
  TARGET_SWITCH_CAP,
  auditAuthor,
  blockReason,
  bootMeCaps,
  can,
  canAccessOthers,
  canAdminPortalJwt,
  canAssignUserRoles,
  canEditConversacionConfig,
  canEditInstrucciones,
  canEditKanbanCards,
  canEditOpenAiConfig,
  canEditPromptsOperativos,
  canEditSwagger,
  canImpersonate,
  canManagePermissions,
  canOverrideSampling,
  canSendChat,
  canSwitchTarget,
  canViewAsUser,
  canViewChat,
  canViewConfig,
  canViewKanban,
  canViewLogs,
  canViewPrompts,
  clearSession,
  getSession,
  handleApiError,
  humanPermissionError,
  instruccionesPublishCap,
  isLoggedIn,
  login,
  logout,
  patyChatAuditCap,
  patyChatInteractCap,
  patyJwtAdminCap
};
