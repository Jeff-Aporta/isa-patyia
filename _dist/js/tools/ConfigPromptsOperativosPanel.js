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
function patyiaIssBase() {
  const t = getIssTarget();
  if (t === "local") return PATYIA_ISS_LOCAL.replace(/\/$/, "");
  if (t === "production") return PATYIA_ISS_PROD_URL.replace(/\/$/, "");
  return PATYIA_ISS_URL.replace(/\/$/, "");
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
var PATYIA_ISS_URL, PATYIA_ISS_PROD_URL, PATYIA_ISS_LOCAL, PATYIA_ISS_LOCAL_API, PATYIA_ISS_PROD_API, PATYIA_ISS_STAGING_API, PATYIA_ISS_TARGET_LS_KEY;
var init_patyia = __esm({
  "js/core/patyia.ts"() {
    window.ISAFront.migrateLegacyGatewayKeys?.({ "jeff:gateway-local": "", "patyia-apptools:gateway-local": "", "patyia-apptools:lab-local": "" });
    PATYIA_ISS_URL = "https://ayudascp-ia-staging.azurewebsites.net";
    PATYIA_ISS_PROD_URL = "https://ayudascp-ia.azurewebsites.net";
    PATYIA_ISS_LOCAL = "http://127.0.0.1:8802";
    PATYIA_ISS_LOCAL_API = `${PATYIA_ISS_LOCAL}/api`;
    PATYIA_ISS_PROD_API = `${PATYIA_ISS_PROD_URL}/api`;
    PATYIA_ISS_STAGING_API = `${PATYIA_ISS_URL}/api`;
    PATYIA_ISS_TARGET_LS_KEY = "patyia-apptools:iss-target";
  }
});

// js/core/platform.ts
function frontSharedLazy() {
  const api = window.ISAFront;
  return api?.ensureCodeMirrorLoaded ? api : null;
}
function mdToHtml(src) {
  const api = frontSharedLazy();
  if (api?.mdToHtml) return api.mdToHtml(src);
  return String(src ?? "");
}
function getGlass() {
  const g = window.ISAFront?.Glass;
  if (!g?.GlassCard) {
    throw new Error("ISAFront.Glass no cargado \u2014 recargue sin cach\xE9 (Ctrl+Shift+R).");
  }
  return g;
}
function CodeMirrorPanel(props) {
  const Panel = window.ISAFront?.CodeMirrorPanel;
  if (!Panel) throw new Error("CodeMirrorPanel no cargado \u2014 recargue sin cach\xE9 (Ctrl+Shift+R).");
  return Panel(props);
}
function toastError(text, timeout) {
  fb()?.toast?.error?.(text, timeout);
}
function toastSuccess(text, timeout) {
  fb()?.toast?.success?.(text, timeout);
}
var bridge, UI, Session, getReact, getMaterialUI, fb;
var init_platform = __esm({
  "js/core/platform.ts"() {
    init_patyia();
    bridge = () => window.ISAFront.createPlatformBridge("ISA");
    UI = {
      get Icon() {
        return bridge().UI.Icon;
      },
      get TargetSwitch() {
        return bridge().UI.TargetSwitch;
      },
      get ThemeSwitch() {
        return bridge().UI.ThemeSwitch;
      },
      get useRealtimeStatus() {
        return bridge().UI.useRealtimeStatus;
      },
      get RealtimeStatusDot() {
        return bridge().UI.RealtimeStatusDot;
      },
      get Loading() {
        return bridge().UI.Loading;
      },
      get ErrorBox() {
        return bridge().UI.ErrorBox;
      },
      get LoginGate() {
        return bridge().UI.LoginGate;
      },
      get LoginButton() {
        return bridge().UI.LoginButton;
      }
    };
    Session = {
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
    getReact = () => window.ISAFront.getReact();
    getMaterialUI = () => window.ISAFront.getMaterialUI();
    fb = () => globalThis.ISAFront?.Feedback;
  }
});

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
async function jsonFetch(path, init) {
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
  return unwrapBody(raw);
}
async function fetchPromptsOperativosConfig() {
  const body = await jsonFetch("/system/prompts-operativos", { method: "GET", headers: systemApiHeaders() });
  return { config: body.config ?? {}, canEdit: !!body.canEdit };
}
async function putPromptsOperativosConfig(config) {
  const body = await jsonFetch("/system/prompts-operativos", {
    method: "PUT",
    headers: { ...systemApiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(config)
  });
  return body.config ?? config;
}
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
  const data = unwrapBody(await res.json());
  if (!data || data.kind !== "insoft.permissions-me") return PERMISSIONS_ME_CACHE.value;
  PERMISSIONS_ME_CACHE.value = data;
  PERMISSIONS_ME_CACHE.iat = data.iat || Date.now();
  PERMISSIONS_ME_CACHE.ttlMs = data.ttlMs || 6e4;
  PERMISSIONS_ME_CACHE.key = sessionKey;
  return data;
}
function requireAppSession(onNeedLogin) {
  if (Session.isLoggedIn()) return true;
  onNeedLogin?.();
  return false;
}
var PERMISSIONS_ME_CACHE;
var init_systemConfigApi = __esm({
  "js/api/systemConfigApi.ts"() {
    init_platform();
    init_patyia();
    PERMISSIONS_ME_CACHE = { value: null, iat: 0, ttlMs: 0, key: "" };
  }
});

// js/tools/roleHierarchy.js
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
var DEFAULT_ROLE_JERARQUIA, DEFAULT_FOR_UNKNOWN;
var init_roleHierarchy = __esm({
  "js/tools/roleHierarchy.js"() {
    DEFAULT_ROLE_JERARQUIA = {
      visitante: "0",
      dev: "0.0",
      dev_lead: "0.0.0",
      dev_iss: "0.0.1",
      admn: "0.1",
      auditador: "0.1.0",
      admn_isapatyia: "0.1.0.0"
    };
    DEFAULT_FOR_UNKNOWN = "999";
  }
});

// js/tools/roleCanonicalMeta.js
function canonicalRoleMeta(roleName) {
  const key = String(roleName ?? "").trim().toLowerCase();
  return CANONICAL_ROLE_META[key] ?? null;
}
var CANONICAL_ROLE_META;
var init_roleCanonicalMeta = __esm({
  "js/tools/roleCanonicalMeta.js"() {
    CANONICAL_ROLE_META = {
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
  }
});

// js/core/viewAsRole.ts
function roleKey(name) {
  return String(name ?? "").trim().toLowerCase();
}
function formatViewAsRoleLabel(roleName) {
  const key = roleKey(roleName);
  if (!key) return "";
  const opt = VIEW_AS_ROLE_OPTIONS.find((o) => o.id === key);
  if (opt) return opt.label;
  const canon = canonicalRoleMeta(key);
  if (canon?.namedisplay) return canon.namedisplay;
  return key.split("_").map((p) => p === "iss" ? "ISS" : p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}
function readViewAsRole() {
  try {
    const v = roleKey(localStorage.getItem(VIEW_AS_ROLE_LS_KEY));
    if (!v || v === "dev_lead") return "";
    if (!ROLE_CAPS_PRESETS[v]) return "";
    return v;
  } catch {
    return "";
  }
}
function writeViewAsRole(roleName) {
  const key = roleKey(roleName);
  try {
    if (!key || key === "dev_lead" || !ROLE_CAPS_PRESETS[key]) {
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
function realRolesAllowViewAs(roles) {
  return (roles ?? []).some((r) => roleKey(r) === "dev_lead");
}
var VIEW_AS_ROLE_LS_KEY, VIEW_AS_ROLE_EVENT, VIEW_AS_ROLE_OPTIONS, NONE, ROLE_CAPS_PRESETS;
var init_viewAsRole = __esm({
  "js/core/viewAsRole.ts"() {
    init_roleCanonicalMeta();
    VIEW_AS_ROLE_LS_KEY = "isa-patyia:view-as-role";
    VIEW_AS_ROLE_EVENT = "patyia-apptools:view-as-role";
    VIEW_AS_ROLE_OPTIONS = [
      { id: "visitante", label: "Visitante" },
      { id: "dev", label: "Desarrollador" },
      { id: "dev_iss", label: "Dev ISS" },
      { id: "auditador", label: "Auditor" },
      { id: "admn", label: "Admn b\xE1sico" },
      { id: "admn_isapatyia", label: "Admn ISA-Paty" }
    ];
    NONE = Object.freeze({
      canEditInstrucciones: false,
      canEditOpenAiConfig: false,
      canEditPromptsOperativos: false,
      canEditConversacionConfig: false,
      canEditSwagger: false,
      canOverrideSampling: false,
      canManagePermissions: false,
      canImpersonate: false,
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
      visitante: { ...NONE },
      dev: {
        ...NONE,
        canViewPrompts: true,
        canViewConfig: true,
        canViewKanban: true
      },
      dev_iss: {
        ...NONE,
        canViewPrompts: true,
        canViewConfig: true,
        canEditInstrucciones: true,
        canEditPromptsOperativos: true,
        canOverrideSampling: true,
        canViewKanban: true,
        canEditKanbanCards: true,
        canAccessOthers: true
      },
      auditador: {
        ...NONE,
        canViewPrompts: true,
        canViewConfig: true,
        canAccessOthers: true,
        canViewKanban: true
      },
      admn: {
        ...NONE,
        canViewPrompts: true,
        canViewConfig: true,
        canViewKanban: true,
        canEditKanbanCards: true
      },
      admn_isapatyia: {
        ...NONE,
        canViewPrompts: true,
        canViewConfig: true,
        canEditOpenAiConfig: true,
        canEditConversacionConfig: true,
        canEditInstrucciones: true,
        canAssignUserRoles: true,
        canViewKanban: true,
        canEditKanbanCards: true
      },
      /** Referencia: Dev Lead real (no se ofrece como simulación). */
      dev_lead: {
        canEditInstrucciones: true,
        canEditOpenAiConfig: true,
        canEditPromptsOperativos: true,
        canEditConversacionConfig: true,
        canEditSwagger: true,
        canOverrideSampling: true,
        canManagePermissions: true,
        canImpersonate: true,
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
function sessionCacheKey() {
  if (!Session.isLoggedIn()) return "";
  const tok = Session?.current?.()?.token;
  const user = Session.username?.() || Session?.current?.()?.username;
  return String(tok || user || "").trim();
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
function notifyAuth() {
  window.dispatchEvent(new Event(Session.EVENT));
  window.dispatchEvent(new Event("patyia-apptools:auth"));
  window.dispatchEvent(new Event("isa-patyia:auth"));
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
  clearViewAsRole();
  notifyAuth();
}
function canViewAsRole() {
  if (!Session.isLoggedIn()) return false;
  const key = sessionCacheKey();
  if (key !== ME_CAPS_KEY) return false;
  return realRolesAllowViewAs(ME_ISS_ROLES);
}
function getViewAsRole() {
  if (!canViewAsRole() && !readViewAsRole()) return "";
  return readViewAsRole();
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
  let real = "";
  if (key === ME_CAPS_KEY && ME_ISS_ROLES.length) {
    real = roleLabel(pickPrimaryIssRole(ME_ISS_ROLES));
  } else if (key === ME_CAPS_KEY && ME_LOGIN_ROLE) {
    real = roleLabel(ME_LOGIN_ROLE);
  } else {
    const sl = Session.current()?.role;
    real = sl ? roleLabel(sl) : "";
  }
  const viewAs = readViewAsRole();
  if (viewAs && realRolesAllowViewAs(ME_ISS_ROLES)) {
    return `${real || "Dev Lead"} \u2192 ${formatViewAsRoleLabel(viewAs)}`;
  }
  return real;
}
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
var ME_CAPS, ME_CAPS_KEY, ME_ISS_ROLES, ME_LOGIN_ROLE, ME_CAPS_BOOTSTRAP_TS, ME_CAPS_INFLIGHT, ME_CAPS_RETRY_TIMER, ME_SERVER_INSTRUCCIONES_EDIT, ME_CAPS_FETCH_GUARD_MS, ME_CAPS_REENTRY_GUARD_MS, isLoggedIn, can, blockReason, clearSession;
var init_sessionApi = __esm({
  "js/api/sessionApi.ts"() {
    init_platform();
    init_platform();
    init_systemConfigApi();
    init_roleHierarchy();
    init_roleCanonicalMeta();
    init_viewAsRole();
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
      setViewAsRole,
      stopViewAsRole
    };
  }
});

// js/tools/ConfigPromptsOperativosPanel.jsx
init_platform();

// js/ui/shared.jsx
init_platform();
init_platform();

// js/ui/ImageLightboxDialog.jsx
init_platform();
init_platform();
import { jsx } from "react/jsx-runtime";
var { useEffect, useState } = getReact();

// js/ui/GlassDialog.jsx
init_platform();
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
function isaLoginSurface() {
  const fs = globalThis.ISAFront || {};
  return {
    loginDialogProps: fs.loginDialogProps,
    loginDialogBackdropSx: fs.loginDialogBackdropSx,
    loginCardSx: fs.loginCardSx,
    glassCardSx: fs.glassCardSx,
    loginHeaderBandSx: fs.loginHeaderBandSx,
    loginIconBoxSx: fs.loginIconBoxSx,
    loginHeaderTitleSx: fs.loginHeaderTitleSx,
    GLASS_CARD_CLASS: fs.GLASS_CARD_CLASS || "isa-glass-card"
  };
}
var PAPER_MAX = { xs: 440, sm: 560, md: 920, lg: 1080 };
function glassBackdropSx() {
  const fn = isaLoginSurface().loginDialogBackdropSx;
  return fn?.() ?? {
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    backgroundColor: "rgba(11,18,32,0.55)"
  };
}
function glassPaperProps(maxWidth, paperClassName = "") {
  const { loginCardSx, glassCardSx, GLASS_CARD_CLASS } = isaLoginSurface();
  const maxPx = PAPER_MAX[maxWidth] ?? PAPER_MAX.md;
  return {
    elevation: 0,
    className: `isa-login-card ${GLASS_CARD_CLASS} isa-glass-dialog__paper ${paperClassName}`.trim(),
    sx: loginCardSx?.({ maxWidth: maxPx, m: { xs: 1, sm: 1.5 } }) ?? glassCardSx?.({ maxWidth: maxPx, m: { xs: 1, sm: 1.5 } }) ?? { maxWidth: maxPx, m: { xs: 1, sm: 1.5 } }
  };
}
function resolveGlassDialogProps({
  open,
  onClose,
  maxWidth = "md",
  fullWidth = true,
  paperMaxWidth,
  paperClassName = "",
  slotProps,
  ...rest
} = {}) {
  const { loginDialogProps } = isaLoginSurface();
  const paper = glassPaperProps(maxWidth, paperClassName);
  if (paperMaxWidth) paper.sx = { ...paper.sx, maxWidth: paperMaxWidth };
  const shared = {
    open,
    onClose,
    maxWidth,
    fullWidth,
    scroll: "paper",
    className: "isa-login-dialog isa-glass-dialog",
    slotProps: { backdrop: { sx: glassBackdropSx() }, ...slotProps || {} },
    PaperProps: paper,
    ...rest
  };
  if (!loginDialogProps) return shared;
  return loginDialogProps(shared);
}
function glassDialogContentSx(extra = {}) {
  return {
    p: 0,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    position: "relative",
    borderTop: 0,
    ...extra
  };
}
function glassDialogActionsSx(extra = {}) {
  return {
    px: { xs: 2, sm: 2.5 },
    py: 1.5,
    borderTop: 1,
    borderColor: (t) => t.palette.mode === "dark" ? "rgba(99,102,241,0.22)" : "divider",
    bgcolor: (t) => t.palette.mode === "dark" ? "rgba(15,23,42,0.32)" : "rgba(248,250,252,0.85)",
    justifyContent: "flex-end",
    ...extra
  };
}
function GlassDialogHeader({ icon = "mdi:information-outline", title, subtitle, accent = "#1e90ff", onClose }) {
  const { Box: Box4, Typography: Typography4, IconButton, Stack: Stack4 } = getMaterialUI();
  const { Icon: Icon2 } = UI;
  const { loginHeaderBandSx, loginIconBoxSx, loginHeaderTitleSx } = isaLoginSurface();
  const bandSx = loginHeaderBandSx?.(accent) ?? {
    px: { xs: 2, sm: 2.5 },
    py: 2,
    borderBottom: 1,
    borderColor: "rgba(99,102,241,0.25)",
    background: `linear-gradient(90deg, ${accent}44, rgba(99,102,241,0.12) 45%, transparent 75%)`,
    borderLeft: 4,
    borderLeftColor: accent
  };
  const iconSx = loginIconBoxSx?.(accent) ?? {
    width: 42,
    height: 42,
    borderRadius: 1.75,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: `linear-gradient(135deg, ${accent}, ${accent}99)`,
    color: "#fff"
  };
  const titleSx = loginHeaderTitleSx?.() ?? { fontWeight: 700, fontSize: "1.35rem", lineHeight: 1.15 };
  return /* @__PURE__ */ jsxs(Box4, { className: "isa-glass-dialog__header", sx: { position: "relative", flexShrink: 0 }, children: [
    /* @__PURE__ */ jsx2(Box4, { sx: bandSx, children: /* @__PURE__ */ jsxs(Stack4, { direction: "row", spacing: 1.25, alignItems: "center", sx: { pr: onClose ? 4 : 0 }, children: [
      /* @__PURE__ */ jsx2(Box4, { sx: iconSx, children: /* @__PURE__ */ jsx2(Icon2, { icon, size: 24 }) }),
      /* @__PURE__ */ jsxs(Box4, { sx: { flex: 1, minWidth: 0 }, children: [
        /* @__PURE__ */ jsx2(Typography4, { variant: "h5", component: "h2", sx: titleSx, children: title }),
        subtitle ? /* @__PURE__ */ jsx2(Typography4, { variant: "caption", color: "text.secondary", display: "block", sx: { mt: 0.35, lineHeight: 1.4 }, children: subtitle }) : null
      ] })
    ] }) }),
    onClose ? /* @__PURE__ */ jsx2(IconButton, { size: "small", onClick: onClose, "aria-label": "Cerrar", className: "isa-glass-dialog__close", sx: { position: "absolute", top: 10, right: 10 }, children: /* @__PURE__ */ jsx2(Icon2, { icon: "mdi:close", size: 18 }) }) : null
  ] });
}
function GlassDialog({ children, header = null, maxWidth, fullWidth, paperMaxWidth, paperClassName, slotProps, ...dialogProps }) {
  const { Dialog: Dialog2 } = getMaterialUI();
  const props = resolveGlassDialogProps({ maxWidth, fullWidth, paperMaxWidth, paperClassName, slotProps, ...dialogProps });
  return /* @__PURE__ */ jsxs(Dialog2, { ...props, children: [
    header,
    children
  ] });
}

// js/ui/shared.jsx
import { Fragment, jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
function ButtonIconify({ icon, title = "", label = "", onClick, disabled = false, busy = false, color = "", variant = "", className = "", type = "button" }) {
  const shown = busy ? "mdi:loading" : icon;
  const variantCls = variant ? `btn-iconify--${variant}` : "";
  const colorCls = color ? `btn-iconify--${color}` : "";
  const labeledCls = label ? "btn-iconify--labeled" : "";
  const aria = label || title || void 0;
  return /* @__PURE__ */ jsxs2(
    "button",
    {
      type,
      className: `btn-iconify ${variantCls} ${colorCls} ${labeledCls} ${className}`.trim(),
      title: title || label || void 0,
      "aria-label": aria,
      onClick,
      disabled: disabled || busy,
      children: [
        /* @__PURE__ */ jsx3("iconify-icon", { icon: shown, width: "1.15em", height: "1.15em" }),
        label ? /* @__PURE__ */ jsx3("span", { className: "btn-iconify__lbl", children: label }) : null
      ]
    }
  );
}
var { useState: useState2, useEffect: useEffect2, useMemo } = getReact();
var { createTheme, Tabs, Tab, Box, Typography, DialogContent, Stack, Chip } = getMaterialUI();
var theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#3b82f6" },
    secondary: { main: "#14b8a6" },
    background: { default: "#0f172a", paper: "#1e293b" }
  },
  typography: { fontFamily: '"IBM Plex Sans", system-ui, sans-serif' },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: "none" } } },
    MuiTab: { styleOverrides: { root: { textTransform: "none" } } },
    MuiToggleButton: { styleOverrides: { root: { textTransform: "none" } } },
    MuiTooltip: {
      defaultProps: { disableInteractive: true },
      styleOverrides: {
        popper: { pointerEvents: "none" },
        tooltip: { pointerEvents: "none" }
      }
    }
  }
});

// js/ui/PromptBodyEditor.jsx
init_platform();

// js/ui/promptMdEditorHtml.ts
init_platform();

// js/core/promptVariables.ts
var PROMPT_VAR_PATTERN = /\{\{\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}\}/g;
var MALFORMED_PROMPT_VAR_PATTERN = /\{\{\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}(?!\})/g;
function isValidVarName(name) {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(String(name || "").trim());
}
function splitBodyWithVars(text) {
  const src = String(text ?? "");
  if (!src) return [];
  const out = [];
  const re = new RegExp(PROMPT_VAR_PATTERN.source, "g");
  let last = 0;
  let m;
  while (m = re.exec(src)) {
    if (m.index > last) out.push({ type: "text", value: src.slice(last, m.index) });
    out.push({ type: "var", name: m[1] });
    last = m.index + m[0].length;
  }
  if (last < src.length) out.push({ type: "text", value: src.slice(last) });
  return out;
}
function extractPromptVariables(text) {
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const seg of splitBodyWithVars(text)) {
    if (seg.type !== "var" || seen.has(seg.name)) continue;
    seen.add(seg.name);
    out.push(seg.name);
  }
  return out;
}
function varNameToHue(name) {
  let h = 2166136261;
  const s = String(name ?? "").trim().toLowerCase();
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
    h ^= Math.imul(i + 1, 2654435761);
  }
  return (Math.imul(h >>> 0, 137) >>> 0) % 360;
}
function varToneStyleAttr(name) {
  return `--var-tone-h:${varNameToHue(name)}`;
}
function varToneSx(name) {
  const hue = varNameToHue(name);
  return { "--var-tone-h": hue, backgroundColor: `hsl(${hue} 52% 42% / 0.22)`, borderColor: `hsl(${hue} 48% 58%)`, color: `hsl(${hue} 62% 72%)` };
}
function varReplaceRe(name) {
  return new RegExp(`\\{\\{\\s*${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\}\\}`, "gi");
}
function renamePromptVariable(text, oldName, newName) {
  const next = String(newName || "").trim();
  if (!isValidVarName(next)) return text;
  return String(text ?? "").replace(varReplaceRe(oldName), `{{${next}}}`);
}
function repairPromptVarBraces(text) {
  return String(text ?? "").replace(MALFORMED_PROMPT_VAR_PATTERN, (_m, name) => `{{${name}}}`);
}
function preparePromptBodyForSave(text) {
  return repairPromptVarBraces(String(text ?? "").trim());
}

// js/ui/promptMdEditorHtml.ts
function escAttr(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
var MD_BLOCK_TAGS = /* @__PURE__ */ new Set(["h1", "h2", "h3", "h4", "h5", "h6", "p", "ul", "ol", "li", "pre", "blockquote", "hr"]);
var MD_INLINE_TAGS = /* @__PURE__ */ new Set(["strong", "b", "em", "i", "code", "a", "br", "img"]);
function preserveHtml(el) {
  return el.outerHTML;
}
function varChipHtml(name, _opts = {}) {
  return `<span class="prompt-var-chip" contenteditable="false" data-var="${escAttr(name)}" style="${varToneStyleAttr(name)}" title="${escAttr(name)}"><span class="prompt-var-chip__label">{{${escAttr(name)}}}</span></span>`;
}
function mdPreserveSingleLineBreaks(src) {
  if (!src.includes("\n")) return src;
  return src.replace(/(?<!\n)\n(?!\n)/g, "  \n");
}
function renderBodyWithVarChips(body, opts = {}) {
  const src = repairPromptVarBraces(String(body ?? ""));
  if (!src) return "";
  const placeholders = [];
  let idx = 0;
  const mdSrc = src.replace(PROMPT_VAR_PATTERN, (_m, name) => {
    const token = `\uE000PV${idx++}\uE001`;
    placeholders.push({ token, name });
    return token;
  });
  let html = mdToHtml(mdPreserveSingleLineBreaks(mdSrc));
  for (const { token, name } of placeholders) {
    html = html.split(token).join(varChipHtml(name, opts));
  }
  return html;
}
function bodyPreviewHtml(body) {
  const src = String(body ?? "");
  if (!src) return "";
  if (!src.includes("\n")) return renderBodyWithVarChips(src, { editable: false });
  return bodyPreviewHtmlFromLines(src.split("\n"));
}
function bodyPreviewHtmlFromLines(lines) {
  if (!Array.isArray(lines) || !lines.length) return "";
  return lines.map((line) => {
    const inner = renderBodyWithVarChips(String(line ?? ""), { editable: false });
    return inner ? `<div class="prompt-content-line">${inner}</div>` : `<div class="prompt-content-line prompt-content-line--empty"><br aria-hidden="true" /></div>`;
  }).join("");
}
function bodyToEditorHtml(body) {
  const html = renderBodyWithVarChips(body, { editable: true });
  return html || "<p><br></p>";
}
function varChipSource(el) {
  return el.dataset.var ? `{{${el.dataset.var}}}` : "";
}
function tableCellSource(td) {
  if (td.classList?.contains("prompt-var-chip")) {
    return varChipSource(td);
  }
  return [...td.childNodes].map((n) => n.nodeType === Node.ELEMENT_NODE ? inlineMd(n) : inlineMd(n)).join("").trim();
}
function tableHtmlToGfm(table) {
  const rowEls = [...table.querySelectorAll("tr")];
  if (!rowEls.length) return preserveHtml(table);
  const lines = [];
  const firstCells = [...rowEls[0].querySelectorAll("th,td")].map(tableCellSource);
  lines.push(`| ${firstCells.join(" | ")} |`);
  lines.push(`| ${firstCells.map(() => "---").join(" | ")} |`);
  for (let i = 1; i < rowEls.length; i += 1) {
    const cells = [...rowEls[i].querySelectorAll("th,td")].map(tableCellSource);
    lines.push(`| ${cells.join(" | ")} |`);
  }
  return lines.join("\n");
}
function inlineMd(node) {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent || "";
  if (node.nodeType !== Node.ELEMENT_NODE) return "";
  const el = node;
  if (el.classList?.contains("prompt-var-chip")) return varChipSource(el);
  const tag = el.tagName.toLowerCase();
  const inner = () => [...el.childNodes].map(inlineMd).join("");
  if (!MD_INLINE_TAGS.has(tag)) return preserveHtml(el);
  switch (tag) {
    case "strong":
    case "b":
      return `**${inner()}**`;
    case "em":
    case "i":
      return `*${inner()}*`;
    case "code":
      return `\`${inner()}\``;
    case "a": {
      const href = el.getAttribute("href") || "";
      const text = inner();
      return href ? `[${text || href}](${href})` : text;
    }
    case "img": {
      const alt = el.getAttribute("alt") || "imagen";
      const src = el.getAttribute("src") || "";
      return src ? `![${alt}](${src})` : "";
    }
    case "br":
      return "\n";
    default:
      return preserveHtml(el);
  }
}
function blockMd(el) {
  const tag = el.tagName.toLowerCase();
  const inner = () => [...el.childNodes].map((n) => n.nodeType === Node.ELEMENT_NODE ? inlineMd(n) : inlineMd(n)).join("");
  if (el.classList?.contains("prompt-var-chip")) {
    return varChipSource(el);
  }
  if (!MD_BLOCK_TAGS.has(tag)) {
    if (tag === "div" && el.classList.contains("md-table-wrap")) {
      const table = el.querySelector(":scope > table");
      if (table) return `${tableHtmlToGfm(table)}

`;
    }
    if (tag === "table") return `${tableHtmlToGfm(el)}

`;
    return `${preserveHtml(el)}

`;
  }
  switch (tag) {
    case "h1":
      return `# ${inner().trim()}

`;
    case "h2":
      return `## ${inner().trim()}

`;
    case "h3":
      return `### ${inner().trim()}

`;
    case "h4":
      return `#### ${inner().trim()}

`;
    case "h5":
      return `##### ${inner().trim()}

`;
    case "h6":
      return `###### ${inner().trim()}

`;
    case "p":
      return `${inner()}

`;
    case "li": {
      const parent = el.parentElement?.tagName.toLowerCase();
      const bullet = parent === "ol" ? "1." : "-";
      return `${bullet} ${inner().trimStart()}
`;
    }
    case "ul":
    case "ol":
      return [...el.children].map((c) => blockMd(c)).join("") + "\n";
    case "pre": {
      const code = el.querySelector("code");
      const text = code?.textContent ?? el.textContent ?? "";
      return `\`\`\`
${text}
\`\`\`

`;
    }
    case "blockquote":
      return inner().split("\n").filter(Boolean).map((l) => `> ${l}`).join("\n") + "\n\n";
    case "hr":
      return "---\n\n";
    case "div": {
      const children = [...el.children];
      if (el.attributes.length > 0 || el.classList.length > 0 || children.some((c) => !MD_BLOCK_TAGS.has(c.tagName.toLowerCase()))) {
        return `${preserveHtml(el)}

`;
      }
      return children.map((c) => blockMd(c)).join("");
    }
    default:
      return `${preserveHtml(el)}

`;
  }
}
function editorHtmlToBody(root) {
  let out = "";
  for (const node of root.childNodes) {
    if (node.nodeType === Node.ELEMENT_NODE) out += blockMd(node);
    else if (node.nodeType === Node.TEXT_NODE) out += node.textContent || "";
  }
  return out.replace(/\n{3,}/g, "\n\n").trimEnd();
}
var RAW_VAR_IN_TEXT = /\{\{\s*[A-Za-z_]\w*\s*\}\}/;
function surfaceHasRawVarTokens(root) {
  if (!root) return false;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node;
  while (node = walker.nextNode()) {
    if (node.parentElement?.closest(".prompt-var-chip")) continue;
    if (RAW_VAR_IN_TEXT.test(node.textContent ?? "")) return true;
  }
  return false;
}

// js/ui/mdImagePaste.ts
function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("No se pudo leer la imagen"));
    reader.readAsDataURL(file);
  });
}
async function clipboardImageDataUrl(e) {
  const items = e.clipboardData?.items;
  if (!items?.length) return null;
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    if (!item.type.startsWith("image/")) continue;
    const file = item.getAsFile();
    if (!file) continue;
    return readFileAsDataUrl(file);
  }
  return null;
}
function markdownImage(alt, dataUrl) {
  const safeAlt = String(alt || "imagen").replace(/[\[\]]/g, "");
  return `![${safeAlt}](${dataUrl})`;
}
function insertTextAtTextarea(ta, insert) {
  const start = ta.selectionStart ?? ta.value.length;
  const end = ta.selectionEnd ?? start;
  const before = ta.value.slice(0, start);
  const after = ta.value.slice(end);
  const next = `${before}${insert}${after}`;
  return { next, pos: start + insert.length };
}
function insertImageNodeAtSelection(dataUrl, alt = "imagen") {
  const img = document.createElement("img");
  img.src = dataUrl;
  img.alt = alt;
  img.className = "prompt-md-img";
  img.setAttribute("contenteditable", "false");
  const sel = window.getSelection();
  if (!sel?.rangeCount) return;
  const range = sel.getRangeAt(0);
  range.deleteContents();
  range.insertNode(img);
  range.setStartAfter(img);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}

// js/ui/PromptBodyEditor.jsx
import { Fragment as Fragment2, jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";
var { useState: useState3, useEffect: useEffect3, useLayoutEffect, useRef, useCallback, useMemo: useMemo2 } = getReact();
var {
  Box: Box2,
  Stack: Stack2,
  Typography: Typography2,
  Dialog,
  DialogTitle,
  DialogContent: DialogContent2,
  DialogActions,
  Button,
  TextField,
  Alert,
  Divider,
  Chip: Chip2,
  Switch,
  FormControlLabel,
  CircularProgress
} = getMaterialUI();
var MAX_UNDO = 80;
function useEditorUndo(initial) {
  const [value, setValue] = useState3(initial);
  const [hist, setHist] = useState3({ past: 0, future: 0 });
  const pastRef = useRef([]);
  const futureRef = useRef([]);
  const skipSync = useRef(false);
  const syncHist = useCallback(() => {
    setHist({ past: pastRef.current.length, future: futureRef.current.length });
  }, []);
  useEffect3(() => {
    if (skipSync.current) {
      skipSync.current = false;
      return;
    }
    setValue(initial);
    pastRef.current = [];
    futureRef.current = [];
    setHist({ past: 0, future: 0 });
  }, [initial]);
  const commit = useCallback((next) => {
    const v = String(next ?? "");
    setValue((prev) => {
      if (v === prev) return prev;
      pastRef.current = [...pastRef.current.slice(-MAX_UNDO + 1), prev];
      futureRef.current = [];
      return v;
    });
    syncHist();
  }, [syncHist]);
  const undo = useCallback(() => {
    setValue((prev) => {
      const stack = pastRef.current;
      if (!stack.length) return prev;
      const prior = stack[stack.length - 1];
      pastRef.current = stack.slice(0, -1);
      futureRef.current = [prev, ...futureRef.current];
      skipSync.current = true;
      return prior;
    });
    syncHist();
  }, [syncHist]);
  const redo = useCallback(() => {
    setValue((prev) => {
      const stack = futureRef.current;
      if (!stack.length) return prev;
      const next = stack[0];
      futureRef.current = stack.slice(1);
      pastRef.current = [...pastRef.current, prev];
      skipSync.current = true;
      return next;
    });
    syncHist();
  }, [syncHist]);
  const reset = useCallback((next) => {
    skipSync.current = true;
    pastRef.current = [];
    futureRef.current = [];
    setValue(String(next ?? ""));
    setHist({ past: 0, future: 0 });
  }, []);
  return {
    value,
    commit,
    undo,
    redo,
    canUndo: hist.past > 0,
    canRedo: hist.future > 0,
    reset
  };
}
function getCaretOffset(root, targetNode, targetOffset) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let offset = 0;
  let node = walker.nextNode();
  while (node) {
    if (node === targetNode) return offset + targetOffset;
    offset += node.textContent?.length ?? 0;
    node = walker.nextNode();
  }
  return offset;
}
function setCaretOffset(root, offset) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let remain = Math.max(0, offset);
  let node = walker.nextNode();
  while (node) {
    const len = node.textContent?.length ?? 0;
    if (remain <= len) {
      const range2 = document.createRange();
      range2.setStart(node, remain);
      range2.collapse(true);
      const sel2 = window.getSelection();
      sel2?.removeAllRanges();
      sel2?.addRange(range2);
      return;
    }
    remain -= len;
    node = walker.nextNode();
  }
  const range = document.createRange();
  range.selectNodeContents(root);
  range.collapse(false);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
}
function saveSurfaceCaret(root) {
  const sel = window.getSelection();
  if (!sel?.rangeCount || !root) return null;
  const range = sel.getRangeAt(0);
  if (!root.contains(range.startContainer)) return null;
  return getCaretOffset(root, range.startContainer, range.startOffset);
}
function restoreSurfaceCaret(root, offset) {
  if (offset == null || !root) return;
  requestAnimationFrame(() => setCaretOffset(root, offset));
}
function isVarChip(node) {
  return node?.nodeType === Node.ELEMENT_NODE && node.classList?.contains("prompt-var-chip");
}
function previousMeaningfulSibling(node) {
  let prev = node?.previousSibling ?? null;
  while (prev) {
    if (prev.nodeType === Node.TEXT_NODE && !prev.textContent) {
      prev = prev.previousSibling;
      continue;
    }
    return prev;
  }
  return null;
}
function nextMeaningfulSibling(node) {
  let next = node?.nextSibling ?? null;
  while (next) {
    if (next.nodeType === Node.TEXT_NODE && !next.textContent) {
      next = next.nextSibling;
      continue;
    }
    return next;
  }
  return null;
}
function findVarChipBefore(range) {
  const { startContainer, startOffset } = range;
  if (startContainer.nodeType === Node.TEXT_NODE) {
    if (startOffset > 0) return null;
    const prev = previousMeaningfulSibling(startContainer);
    return isVarChip(prev) ? prev : null;
  }
  if (startContainer.nodeType === Node.ELEMENT_NODE && startOffset > 0) {
    const prev = startContainer.childNodes[startOffset - 1];
    return isVarChip(prev) ? prev : null;
  }
  return null;
}
function findVarChipAfter(range) {
  const { startContainer, startOffset } = range;
  if (startContainer.nodeType === Node.TEXT_NODE) {
    if (startOffset < (startContainer.textContent?.length ?? 0)) return null;
    const next = nextMeaningfulSibling(startContainer);
    return isVarChip(next) ? next : null;
  }
  if (startContainer.nodeType === Node.ELEMENT_NODE) {
    const next = startContainer.childNodes[startOffset];
    return isVarChip(next) ? next : null;
  }
  return null;
}
function findVarChipInSelection(range) {
  if (range.collapsed) return null;
  const root = range.commonAncestorContainer;
  const host = root.nodeType === Node.ELEMENT_NODE ? root : root.parentElement;
  if (isVarChip(host)) return host;
  const chip = host?.querySelector?.(".prompt-var-chip");
  if (chip && range.intersectsNode?.(chip)) return chip;
  return null;
}
function findVarChipAtCaret(sel) {
  const node = sel.anchorNode;
  if (!node) return null;
  if (isVarChip(node)) return node;
  return node.parentElement?.closest?.(".prompt-var-chip") ?? null;
}
function getScrollContainer(el) {
  let node = el;
  while (node) {
    const { overflowY } = window.getComputedStyle(node);
    if ((overflowY === "auto" || overflowY === "scroll") && node.scrollHeight > node.clientHeight) {
      return node;
    }
    node = node.parentElement;
  }
  return el;
}
function viewportLead(scrollEl) {
  return Math.min(120, Math.max(48, scrollEl.clientHeight * 0.12));
}
function caretRangeFromClientPoint(x, y) {
  if (document.caretRangeFromPoint) return document.caretRangeFromPoint(x, y);
  const pos = document.caretPositionFromPoint?.(x, y);
  if (!pos) return null;
  const range = document.createRange();
  range.setStart(pos.offsetNode, pos.offset);
  range.collapse(true);
  return range;
}
function plainOffsetFromScroll(textarea, scrollTop, lead) {
  const style = window.getComputedStyle(textarea);
  const lineHeight = parseFloat(style.lineHeight) || 22;
  const padTop = parseFloat(style.paddingTop) || 0;
  const targetLine = Math.max(0, Math.floor((scrollTop + lead - padTop) / lineHeight));
  const text = textarea.value;
  let line = 0;
  let pos = 0;
  while (pos < text.length && line < targetLine) {
    const nl = text.indexOf("\n", pos);
    if (nl < 0) return text.length;
    pos = nl + 1;
    line += 1;
  }
  return pos;
}
function captureScrollAnchor(scrollEl, { plainText, surfaceEl, plainTextEl }) {
  if (!scrollEl) return null;
  const lead = viewportLead(scrollEl);
  const maxScroll = Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight);
  const ratio = maxScroll > 0 ? scrollEl.scrollTop / maxScroll : 0;
  const rect = scrollEl.getBoundingClientRect();
  const x = rect.left + 96;
  const y = rect.top + lead;
  let charOffset = 0;
  if (plainText) {
    if (plainTextEl) charOffset = plainOffsetFromScroll(plainTextEl, scrollEl.scrollTop, lead);
  } else if (surfaceEl) {
    const range = caretRangeFromClientPoint(x, y);
    if (range && surfaceEl.contains(range.startContainer)) {
      charOffset = getCaretOffset(surfaceEl, range.startContainer, range.startOffset);
    } else {
      charOffset = saveSurfaceCaret(surfaceEl) ?? 0;
    }
  }
  return { charOffset, lead, ratio };
}
function restoreScrollAnchor(scrollEl, anchor, { plainText, surfaceEl, plainTextEl }) {
  if (!scrollEl || !anchor) return;
  const { charOffset, lead, ratio } = anchor;
  if (plainText && plainTextEl) {
    plainTextEl.setSelectionRange(charOffset, charOffset);
    const style = window.getComputedStyle(plainTextEl);
    const lineHeight = parseFloat(style.lineHeight) || 22;
    const padTop = parseFloat(style.paddingTop) || 0;
    const line = plainTextEl.value.slice(0, charOffset).split("\n").length - 1;
    scrollEl.scrollTop = Math.max(0, line * lineHeight + padTop - lead);
    return;
  }
  if (surfaceEl) {
    setCaretOffset(surfaceEl, charOffset);
    const sel = window.getSelection();
    if (sel?.rangeCount) {
      const caretRect = sel.getRangeAt(0).getBoundingClientRect();
      const scrollRect = scrollEl.getBoundingClientRect();
      scrollEl.scrollTop += caretRect.top - scrollRect.top - lead;
      return;
    }
  }
  const maxScroll = Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight);
  scrollEl.scrollTop = ratio * maxScroll;
}
function RenameVarDialog({ open, name, existing, onClose, onConfirm }) {
  const [draft, setDraft] = useState3(name || "");
  const [err, setErr] = useState3("");
  useEffect3(() => {
    if (open) {
      setDraft(name || "");
      setErr("");
    }
  }, [open, name]);
  function submit() {
    const next = draft.trim();
    if (!isValidVarName(next)) {
      setErr("Nombre inv\xE1lido (use letras, n\xFAmeros y _)");
      return;
    }
    if (next !== name && existing.includes(next)) {
      setErr("Ya existe otra variable con ese nombre");
      return;
    }
    onConfirm(next);
  }
  return /* @__PURE__ */ jsxs3(Dialog, { open, onClose, maxWidth: "xs", fullWidth: true, children: [
    /* @__PURE__ */ jsx4(DialogTitle, { children: "Renombrar variable" }),
    /* @__PURE__ */ jsxs3(DialogContent2, { children: [
      /* @__PURE__ */ jsxs3(Typography2, { variant: "body2", color: "text.secondary", sx: { mb: 1.5 }, children: [
        "Se actualizar\xE1n todas las ocurrencias de ",
        /* @__PURE__ */ jsx4("code", { children: `{{${name}}}` }),
        " en el documento."
      ] }),
      err ? /* @__PURE__ */ jsx4(Alert, { severity: "error", sx: { mb: 1 }, children: err }) : null,
      /* @__PURE__ */ jsx4(
        TextField,
        {
          autoFocus: true,
          fullWidth: true,
          size: "small",
          label: "Nombre",
          value: draft,
          onChange: (e) => setDraft(e.target.value.replace(/[^\w]/g, "")),
          onKeyDown: (e) => {
            if (e.key === "Enter") submit();
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsxs3(DialogActions, { children: [
      /* @__PURE__ */ jsx4(Button, { onClick: onClose, children: "Cancelar" }),
      /* @__PURE__ */ jsx4(Button, { variant: "contained", onClick: submit, children: "Renombrar" })
    ] })
  ] });
}
function PromptEditorDialog({ open, onClose, title, body, canEdit, onSave, onDraft, tipo }) {
  const surfaceRef = useRef(null);
  const plainTextRef = useRef(null);
  const dialogContentRef = useRef(null);
  const pendingScrollAnchorRef = useRef(null);
  const syncLock = useRef(false);
  const pendingSurfaceValue = useRef(null);
  const surfaceOrigin = useRef(false);
  const prevOpen = useRef(false);
  const { value, commit, undo, redo, canUndo, canRedo, reset } = useEditorUndo(body);
  const [renameDlg, setRenameDlg] = useState3({ open: false, name: "" });
  const [saving, setSaving] = useState3(false);
  const [plainText, setPlainText] = useState3(false);
  const savedRangeRef = useRef(null);
  const savedCaretRef = useRef(null);
  const pushSuppressRef = useRef(false);
  const variables = useMemo2(() => extractPromptVariables(value), [value]);
  const captureEditorSelection = useCallback(() => {
    const el = surfaceRef.current;
    const sel = window.getSelection();
    if (!el || !sel?.rangeCount) return;
    const range = sel.getRangeAt(0);
    if (!el.contains(range.commonAncestorContainer)) return;
    savedRangeRef.current = range.cloneRange();
    savedCaretRef.current = saveSurfaceCaret(el);
  }, []);
  const restoreEditorRange = useCallback(() => {
    const el = surfaceRef.current;
    const sel = window.getSelection();
    if (!el || !sel) return null;
    if (savedRangeRef.current && el.contains(savedRangeRef.current.commonAncestorContainer)) {
      const range = savedRangeRef.current;
      sel.removeAllRanges();
      sel.addRange(range);
      return range;
    }
    if (savedCaretRef.current != null) {
      setCaretOffset(el, savedCaretRef.current);
      if (sel.rangeCount && el.contains(sel.getRangeAt(0).commonAncestorContainer)) {
        return sel.getRangeAt(0);
      }
    }
    if (sel.rangeCount && el.contains(sel.getRangeAt(0).commonAncestorContainer)) {
      return sel.getRangeAt(0);
    }
    return null;
  }, []);
  const syncSurfaceFromValue = useCallback((text, opts = {}) => {
    const el = surfaceRef.current;
    if (!el) return false;
    const caret = opts.preserveCaret ? saveSurfaceCaret(el) : null;
    syncLock.current = true;
    el.innerHTML = bodyToEditorHtml(text);
    syncLock.current = false;
    if (caret != null) restoreSurfaceCaret(el, caret);
    return true;
  }, []);
  useLayoutEffect(() => {
    if (!open) {
      pendingSurfaceValue.current = null;
      pendingScrollAnchorRef.current = null;
      prevOpen.current = false;
      setPlainText(false);
      return;
    }
    const justOpened = !prevOpen.current;
    prevOpen.current = true;
    if (justOpened) {
      setPlainText(false);
      reset(body);
      pendingSurfaceValue.current = body;
      syncSurfaceFromValue(body);
      surfaceOrigin.current = true;
      return;
    }
    if (plainText) {
      pendingSurfaceValue.current = value;
      return;
    }
    if (surfaceOrigin.current) {
      surfaceOrigin.current = false;
      pendingSurfaceValue.current = value;
      return;
    }
    pendingSurfaceValue.current = value;
    syncSurfaceFromValue(value);
  }, [open, value, body, reset, syncSurfaceFromValue, plainText]);
  const readSurface = useCallback(() => {
    const el = surfaceRef.current;
    if (!el) return value;
    return editorHtmlToBody(el);
  }, [value]);
  const restoreScrollAfterModeSwitch = useCallback(() => {
    const anchor = pendingScrollAnchorRef.current;
    if (!anchor) return;
    const scrollEl = getScrollContainer(dialogContentRef.current);
    if (!scrollEl) return;
    const editorReady = plainText ? plainTextRef.current : surfaceRef.current;
    if (!editorReady) return;
    pendingScrollAnchorRef.current = null;
    restoreScrollAnchor(scrollEl, anchor, {
      plainText,
      surfaceEl: surfaceRef.current,
      plainTextEl: plainTextRef.current
    });
  }, [plainText]);
  const attachSurfaceRef = useCallback((node) => {
    surfaceRef.current = node;
    if (node && open && pendingSurfaceValue.current != null) {
      syncSurfaceFromValue(pendingSurfaceValue.current);
      if (pendingScrollAnchorRef.current) {
        requestAnimationFrame(() => {
          restoreScrollAfterModeSwitch();
          requestAnimationFrame(() => restoreScrollAfterModeSwitch());
        });
      }
    }
  }, [open, syncSurfaceFromValue, restoreScrollAfterModeSwitch]);
  useLayoutEffect(() => {
    if (!open || !pendingScrollAnchorRef.current) return;
    restoreScrollAfterModeSwitch();
    requestAnimationFrame(() => restoreScrollAfterModeSwitch());
  }, [plainText, open, restoreScrollAfterModeSwitch]);
  const getEditorText = useCallback(() => plainText ? value : readSurface(), [plainText, value, readSurface]);
  const togglePlainText = useCallback((on) => {
    const scrollEl = getScrollContainer(dialogContentRef.current);
    pendingScrollAnchorRef.current = captureScrollAnchor(scrollEl, {
      plainText,
      surfaceEl: surfaceRef.current,
      plainTextEl: plainTextRef.current
    });
    if (on && !plainText) {
      const text = readSurface();
      surfaceOrigin.current = true;
      commit(text);
    } else if (!on && plainText) {
      pendingSurfaceValue.current = value;
    }
    setPlainText(on);
  }, [plainText, readSurface, commit, value]);
  const pushChange = useCallback(() => {
    if (syncLock.current || pushSuppressRef.current) return;
    const next = readSurface();
    surfaceOrigin.current = true;
    commit(next);
    if (surfaceHasRawVarTokens(surfaceRef.current)) {
      requestAnimationFrame(() => syncSurfaceFromValue(next, { preserveCaret: true }));
    }
  }, [readSurface, commit, syncSurfaceFromValue]);
  const handleUndo = useCallback(() => {
    surfaceOrigin.current = false;
    pushSuppressRef.current = true;
    undo();
    requestAnimationFrame(() => {
      pushSuppressRef.current = false;
    });
  }, [undo]);
  const handleRedo = useCallback(() => {
    surfaceOrigin.current = false;
    pushSuppressRef.current = true;
    redo();
    requestAnimationFrame(() => {
      pushSuppressRef.current = false;
    });
  }, [redo]);
  const keepToolbarFocus = useCallback((e) => {
    e.preventDefault();
  }, []);
  function onEditorBlur(e) {
    const target = e.relatedTarget;
    if (target?.closest?.(
      ".MuiDialogTitle, .MuiDialogActions, .btn-iconify, .MuiMenu-root, .MuiPopover-root, .MuiModal-root"
    )) return;
    pushChange();
  }
  function handleDismiss() {
    if (canEdit && onDraft) onDraft(getEditorText());
    onClose();
  }
  function handleDiscard() {
    onClose();
  }
  async function handleSave() {
    const next = getEditorText();
    setSaving(true);
    try {
      await onSave(next);
      onClose();
    } catch {
    } finally {
      setSaving(false);
    }
  }
  function onChipRename(oldName, newName) {
    const next = renamePromptVariable(value, oldName, newName);
    surfaceOrigin.current = true;
    commit(next);
    if (!plainText) {
      pendingSurfaceValue.current = next;
      requestAnimationFrame(() => syncSurfaceFromValue(next, { preserveCaret: true }));
    }
    setRenameDlg({ open: false, name: "" });
  }
  function onEditorClick(e) {
    const chip = e.target.closest?.(".prompt-var-chip");
    if (chip && e.detail >= 2 && canEdit) {
      e.preventDefault();
      setRenameDlg({ open: true, name: chip.dataset.var || "" });
    }
  }
  function onEditorCopy(e) {
    const md = readSurface();
    if (!md) return;
    e.preventDefault();
    e.clipboardData.setData("text/plain", md);
  }
  async function onEditorPaste(e) {
    if (!canEdit) return;
    const dataUrl = await clipboardImageDataUrl(e);
    if (!dataUrl) return;
    e.preventDefault();
    captureEditorSelection();
    surfaceRef.current?.focus();
    restoreEditorRange();
    insertImageNodeAtSelection(dataUrl);
    pushChange();
  }
  async function onPlainTextPaste(e) {
    if (!canEdit) return;
    const dataUrl = await clipboardImageDataUrl(e);
    if (!dataUrl) return;
    e.preventDefault();
    const ta = plainTextRef.current;
    if (!ta) return;
    const snippet = `${markdownImage("imagen", dataUrl)}

`;
    const { next, pos } = insertTextAtTextarea(ta, snippet);
    surfaceOrigin.current = true;
    commit(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(pos, pos);
    });
  }
  function onPlainTextKeyDown(e) {
    if (!canEdit) return;
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key === "z" && !e.shiftKey) {
      e.preventDefault();
      handleUndo();
    } else if (mod && (e.key === "y" || e.key === "z" && e.shiftKey)) {
      e.preventDefault();
      handleRedo();
    }
  }
  function tryRemoveVarChipOnKey(e) {
    if (e.key !== "Backspace" && e.key !== "Delete") return false;
    const surface = surfaceRef.current;
    const sel = window.getSelection();
    if (!surface || !sel?.rangeCount) return false;
    const range = sel.getRangeAt(0);
    if (!surface.contains(range.commonAncestorContainer)) return false;
    let chip = findVarChipAtCaret(sel);
    if (!chip && !range.collapsed) chip = findVarChipInSelection(range);
    if (!chip) {
      chip = e.key === "Backspace" ? findVarChipBefore(range) : findVarChipAfter(range);
    }
    if (!chip) return false;
    e.preventDefault();
    chip.remove();
    const next = readSurface();
    surfaceOrigin.current = true;
    commit(next);
    if (surfaceHasRawVarTokens(surfaceRef.current)) {
      requestAnimationFrame(() => syncSurfaceFromValue(next, { preserveCaret: true }));
    }
    return true;
  }
  function onKeyDown(e) {
    if (!canEdit) return;
    if (tryRemoveVarChipOnKey(e)) return;
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key.toLowerCase() === "a" && surfaceRef.current) {
      e.preventDefault();
      const range = document.createRange();
      range.selectNodeContents(surfaceRef.current);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      captureEditorSelection();
      return;
    }
    if (mod && e.key === "z" && !e.shiftKey) {
      e.preventDefault();
      handleUndo();
    } else if (mod && (e.key === "y" || e.key === "z" && e.shiftKey)) {
      e.preventDefault();
      handleRedo();
    }
  }
  function execFmt(cmd, arg) {
    captureEditorSelection();
    surfaceRef.current?.focus();
    restoreEditorRange();
    document.execCommand(cmd, false, arg ?? null);
    captureEditorSelection();
    pushChange();
  }
  return /* @__PURE__ */ jsxs3(
    Dialog,
    {
      open,
      onClose: handleDismiss,
      fullScreen: true,
      scroll: "paper",
      TransitionProps: {
        onEntered: () => {
          if (!plainText && pendingSurfaceValue.current != null) {
            syncSurfaceFromValue(pendingSurfaceValue.current);
          }
        }
      },
      children: [
        /* @__PURE__ */ jsxs3(DialogTitle, { sx: { display: "flex", alignItems: "center", gap: 1, py: 1.5, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ jsx4("iconify-icon", { icon: "mdi:pencil-outline", width: "1.25em", height: "1.25em" }),
          /* @__PURE__ */ jsx4(Box2, { component: "span", sx: { fontWeight: 600 }, children: title }),
          /* @__PURE__ */ jsx4(
            FormControlLabel,
            {
              control: /* @__PURE__ */ jsx4(
                Switch,
                {
                  size: "small",
                  checked: plainText,
                  onChange: (e) => togglePlainText(e.target.checked),
                  disabled: !canEdit
                }
              ),
              label: /* @__PURE__ */ jsx4(Typography2, { variant: "body2", color: "text.secondary", component: "span", children: "Texto plano" }),
              sx: { ml: 0.5, mr: 0 }
            }
          ),
          /* @__PURE__ */ jsx4(Box2, { sx: { flex: 1 } }),
          !plainText && /* @__PURE__ */ jsxs3(Stack2, { direction: "row", spacing: 0.5, alignItems: "center", flexWrap: "wrap", useFlexGap: true, children: [
            /* @__PURE__ */ jsx4(ButtonIconify, { icon: "mdi:undo", title: "Deshacer (Ctrl+Z)", onMouseDown: keepToolbarFocus, onClick: handleUndo, disabled: !canUndo }),
            /* @__PURE__ */ jsx4(ButtonIconify, { icon: "mdi:redo", title: "Rehacer (Ctrl+Y)", onMouseDown: keepToolbarFocus, onClick: handleRedo, disabled: !canRedo }),
            /* @__PURE__ */ jsx4(Divider, { orientation: "vertical", flexItem: true, sx: { mx: 0.5 } }),
            /* @__PURE__ */ jsx4(ButtonIconify, { icon: "mdi:format-bold", title: "Negrita", onMouseDown: keepToolbarFocus, onClick: () => execFmt("bold"), disabled: !canEdit }),
            /* @__PURE__ */ jsx4(ButtonIconify, { icon: "mdi:format-italic", title: "Cursiva", onMouseDown: keepToolbarFocus, onClick: () => execFmt("italic"), disabled: !canEdit }),
            /* @__PURE__ */ jsx4(ButtonIconify, { icon: "mdi:format-header-1", title: "T\xEDtulo 1", onMouseDown: keepToolbarFocus, onClick: () => execFmt("formatBlock", "h1"), disabled: !canEdit }),
            /* @__PURE__ */ jsx4(ButtonIconify, { icon: "mdi:format-header-2", title: "T\xEDtulo 2", onMouseDown: keepToolbarFocus, onClick: () => execFmt("formatBlock", "h2"), disabled: !canEdit }),
            /* @__PURE__ */ jsx4(ButtonIconify, { icon: "mdi:format-list-bulleted", title: "Lista", onMouseDown: keepToolbarFocus, onClick: () => execFmt("insertUnorderedList"), disabled: !canEdit })
          ] }),
          plainText && /* @__PURE__ */ jsxs3(Stack2, { direction: "row", spacing: 0.5, alignItems: "center", children: [
            /* @__PURE__ */ jsx4(ButtonIconify, { icon: "mdi:undo", title: "Deshacer (Ctrl+Z)", onClick: handleUndo, disabled: !canUndo }),
            /* @__PURE__ */ jsx4(ButtonIconify, { icon: "mdi:redo", title: "Rehacer (Ctrl+Y)", onClick: handleRedo, disabled: !canRedo })
          ] })
        ] }),
        /* @__PURE__ */ jsxs3(DialogContent2, { ref: dialogContentRef, dividers: true, className: "prompt-md-dialog custom-scrollbar", children: [
          variables.length > 0 && /* @__PURE__ */ jsxs3(Stack2, { direction: "row", spacing: 0.5, flexWrap: "wrap", useFlexGap: true, sx: { mb: 1.5, width: "100%", justifyContent: "flex-start", px: "1.5rem", pt: 1.25 }, children: [
            /* @__PURE__ */ jsxs3(Typography2, { variant: "caption", color: "text.secondary", sx: { alignSelf: "center", mr: 0.5 }, children: [
              "Variables (escribe ",
              "{{nombre}}",
              " en el texto):"
            ] }),
            variables.map((v) => /* @__PURE__ */ jsx4(
              Chip2,
              {
                size: "small",
                variant: "outlined",
                className: "prompt-var-chip prompt-var-chip--static",
                label: `{{${v}}}`,
                sx: varToneSx(v),
                onDoubleClick: canEdit ? () => setRenameDlg({ open: true, name: v }) : void 0
              },
              v
            ))
          ] }),
          plainText ? /* @__PURE__ */ jsx4(
            TextField,
            {
              multiline: true,
              fullWidth: true,
              className: "prompt-md-plain-editor",
              value,
              onChange: (e) => {
                surfaceOrigin.current = true;
                commit(e.target.value);
              },
              onKeyDown: onPlainTextKeyDown,
              onPaste: onPlainTextPaste,
              disabled: !canEdit,
              spellCheck: false,
              placeholder: "Markdown y {{variables}} en texto plano\u2026",
              minRows: 24,
              inputRef: plainTextRef,
              slotProps: { input: { "aria-label": "Editor de instrucci\xF3n (texto plano)" } }
            }
          ) : /* @__PURE__ */ jsx4(
            "div",
            {
              ref: attachSurfaceRef,
              className: `prompt-md-editor-surface prompt-md-preview${canEdit ? "" : " prompt-md-editor-surface--readonly"}`,
              contentEditable: canEdit,
              spellCheck: false,
              suppressContentEditableWarning: true,
              role: "textbox",
              "aria-multiline": "true",
              "aria-label": "Editor de instrucci\xF3n",
              onInput: pushChange,
              onBlur: onEditorBlur,
              onMouseUp: captureEditorSelection,
              onKeyUp: captureEditorSelection,
              onCopy: onEditorCopy,
              onPaste: onEditorPaste,
              onClick: onEditorClick,
              onKeyDown
            }
          )
        ] }),
        /* @__PURE__ */ jsxs3(DialogActions, { sx: { px: 2, py: 1 }, children: [
          /* @__PURE__ */ jsx4(Button, { onClick: handleDismiss, disabled: saving, sx: { color: "text.secondary" }, children: "Cerrar" }),
          /* @__PURE__ */ jsx4(Button, { onClick: handleDiscard, disabled: saving, children: "Descartar" }),
          /* @__PURE__ */ jsx4(Button, { variant: "contained", onClick: handleSave, disabled: !canEdit || saving, children: saving ? "Guardando\u2026" : "Guardar cambios" })
        ] }),
        /* @__PURE__ */ jsx4(
          RenameVarDialog,
          {
            open: renameDlg.open,
            name: renameDlg.name,
            existing: variables,
            onClose: () => setRenameDlg({ open: false, name: "" }),
            onConfirm: (newName) => onChipRename(renameDlg.name, newName)
          }
        )
      ]
    }
  );
}
function PromptBodyEditor({
  body,
  bodyLines,
  canEdit,
  editBlockReason,
  onChange,
  onPersist,
  placeholder,
  tipo,
  title,
  loading = false,
  editorOpenSignal = 0
}) {
  const [editorOpen, setEditorOpen] = useState3(false);
  const previewRef = useRef(null);
  const previewHtml = useMemo2(() => {
    if (Array.isArray(bodyLines) && bodyLines.length) return bodyPreviewHtmlFromLines(bodyLines);
    const text = String(body || "").trim();
    if (!text) return "";
    return bodyPreviewHtml(body);
  }, [body, bodyLines]);
  useEffect3(() => {
    if (!editorOpenSignal || !canEdit || loading) return;
    setEditorOpen(true);
  }, [editorOpenSignal, canEdit, loading]);
  function openEditor() {
    if (!canEdit) return;
    setEditorOpen(true);
  }
  function handlePreviewCopy(e) {
    const md = String(body ?? "");
    if (!md) return;
    e.preventDefault();
    e.clipboardData.setData("text/plain", md);
  }
  function handlePreviewKeyDown(e) {
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key.toLowerCase() === "a" && previewRef.current) {
      e.preventDefault();
      e.stopPropagation();
      const range = document.createRange();
      range.selectNodeContents(previewRef.current);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      return;
    }
    if (canEdit && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      openEditor();
    }
  }
  return /* @__PURE__ */ jsxs3(Fragment2, { children: [
    /* @__PURE__ */ jsx4(
      Box2,
      {
        className: `prompt-body-preview custom-scrollbar${canEdit ? " prompt-body-preview--editable" : ""}`,
        sx: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column" },
        onDoubleClick: loading ? void 0 : openEditor,
        onCopy: handlePreviewCopy,
        onKeyDown: loading ? void 0 : handlePreviewKeyDown,
        title: loading ? void 0 : canEdit ? "Doble clic para editar" : editBlockReason,
        role: loading ? void 0 : canEdit ? "button" : void 0,
        tabIndex: loading ? void 0 : canEdit ? 0 : void 0,
        "aria-busy": loading || void 0,
        children: loading ? /* @__PURE__ */ jsx4(Box2, { className: "prompt-body-preview__loading", "aria-hidden": true, children: /* @__PURE__ */ jsx4(CircularProgress, { size: 28 }) }) : previewHtml ? /* @__PURE__ */ jsx4(
          "div",
          {
            ref: previewRef,
            className: "prompt-md-preview msg-body",
            dangerouslySetInnerHTML: { __html: previewHtml }
          }
        ) : /* @__PURE__ */ jsx4(Typography2, { variant: "body2", color: "text.secondary", className: "prompt-body-preview__empty", children: placeholder || "Sin contenido. Doble clic para editar\u2026" })
      }
    ),
    /* @__PURE__ */ jsx4(
      PromptEditorDialog,
      {
        open: editorOpen,
        onClose: () => setEditorOpen(false),
        title: title || tipo || "Instrucci\xF3n",
        body: body || "",
        canEdit,
        tipo,
        onDraft: onChange,
        onSave: onPersist ?? onChange
      }
    )
  ] });
}

// js/editors/jsonEditor.jsx
init_platform();
import { jsx as jsx5 } from "react/jsx-runtime";
function JsonCodeEditor({ value = "", onChange, placeholder = "", toolbarExtra = null, readOnly = false }) {
  return /* @__PURE__ */ jsx5(
    CodeMirrorPanel,
    {
      value,
      onChange,
      json: true,
      readOnly,
      fill: true,
      enableFullPage: true,
      fullPageTitle: "Log JSON",
      placeholder,
      lineWrapping: false,
      toolbarExtra
    }
  );
}

// js/tools/ConfigPromptsOperativosPanel.jsx
init_systemConfigApi();
init_platform();

// js/tools/promptsSql/helpers.ts
init_platform();

// js/api/promptsSql.ts
var PATY_PROMPT_TIPOS = [
  "SALUDO_OTRO",
  "FUERA_DE_ALCANCE_TECNICO",
  "SOLICITUD_NO_PERMITIDA",
  "REQUIERE_CONTEXTO",
  "PASO_A_PASO",
  "INTERPRETACION_RESULTADO",
  "CONSULTA_NORMATIVA_NEGOCIO",
  "ASESORIA_PERSONALIZADA",
  "ERROR_TECNICO",
  "ERROR_CONFIGURACION",
  "ERROR_ACCESO",
  "ERROR_DIAN",
  "COMERCIAL"
];
var PATY_SYSTEM_INSTRUCTIONS = [
  {
    iinstruccion: "GENERAL",
    ninstruccion: "PROMPT_GENERAL",
    archivo: "PROMPT_GENERAL.txt",
    descripcion: "Prompt general de conversaci\xF3n Paty (PR_GENERAL)",
    defaultModel: "gpt-5-nano",
    kind: "system"
  },
  {
    iinstruccion: "TDCONSULTA",
    ninstruccion: "PROMPT_TDCONSULTA",
    archivo: "PROMPT_TDCONSULTA.txt",
    descripcion: "Clasificador tipo de consulta (PR_TIPO_CONSULTAS)",
    defaultModel: "gpt-4.1-nano",
    kind: "system"
  },
  {
    iinstruccion: "EXTRACTOR_CONSULTAS",
    ninstruccion: "PROMPT_EXTRACTOR_CONSULTAS",
    archivo: "PROMPT_EXTRACTOR_CONSULTAS.txt",
    descripcion: "Extractor de consultas \xFAtiles del usuario (PR_EXTRACTOR_CONSULTAS)",
    defaultModel: "gpt-4.1-nano",
    kind: "system"
  },
  {
    iinstruccion: "CLASIFICADOR_MODULO",
    ninstruccion: "PROMPT_CLASIFICADOR_MODULO",
    archivo: "PROMPT_CLASIFICADOR_MODULO.txt",
    descripcion: "Clasificador de m\xF3dulo ContaPyme (PR_CLASIFICADOR_MODULO)",
    defaultModel: "gpt-4.1-nano",
    kind: "system"
  }
];
var DEFAULT_JCONFIG = {
  provider: "openai",
  model: "gpt-5-nano",
  temperature: 0,
  top_p: 0.85
};
var INSTRUCTION_META_BY_KEY = (() => {
  const map = /* @__PURE__ */ new Map();
  for (const meta of PATY_SYSTEM_INSTRUCTIONS) {
    map.set(meta.iinstruccion, { ...meta, kind: "system" });
  }
  for (const tipo of PATY_PROMPT_TIPOS) {
    map.set(tipo, {
      iinstruccion: tipo,
      ninstruccion: `PROMPT_${tipo}`,
      archivo: `PROMPT_${tipo}.md`,
      descripcion: `Prompt espec\xEDfico para tipo de consulta ${tipo}`,
      defaultModel: DEFAULT_JCONFIG.model,
      kind: "tdconsulta"
    });
  }
  return map;
})();

// js/tools/promptsSql/helpers.ts
init_platform();
init_sessionApi();
var { createElement, Fragment: Fragment3 } = getReact();
var UNIT_STEP = 0.01;
function clampUnitInterval(raw, fallback) {
  if (raw === "" || raw == null) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(1, Math.max(0, n));
}
function bumpUnitInterval(current, delta, fallback) {
  const base = clampUnitInterval(current, fallback);
  const next = Math.round((base + delta) * 100) / 100;
  return clampUnitInterval(next, fallback);
}
function unitIntervalFieldProps(value, fallback, onValue) {
  const handleKeyDown = (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      onValue(bumpUnitInterval(value, UNIT_STEP, fallback));
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      onValue(bumpUnitInterval(value, -UNIT_STEP, fallback));
    }
  };
  const handleWheel = (e) => {
    e.preventDefault();
    onValue(bumpUnitInterval(value, e.deltaY < 0 ? UNIT_STEP : -UNIT_STEP, fallback));
  };
  const handleChange = (e) => {
    const prev = clampUnitInterval(value, fallback);
    const next = clampUnitInterval(e.target.value, fallback);
    const diff = Math.round((next - prev) * 100) / 100;
    const inputType = e.nativeEvent?.inputType;
    if (!inputType && Math.abs(Math.abs(diff) - 1) < 1e-3) {
      onValue(bumpUnitInterval(value, diff > 0 ? UNIT_STEP : -UNIT_STEP, fallback));
      return;
    }
    onValue(next);
  };
  return {
    size: "small",
    variant: "outlined",
    type: "number",
    value: value ?? fallback,
    inputProps: {
      step: "0.01",
      min: "0",
      max: "1",
      style: { fontSize: "0.72rem", width: "4.5rem" },
      onKeyDown: handleKeyDown,
      onWheel: handleWheel
    },
    sx: {
      "& .MuiInputBase-root": { minHeight: 28 },
      "& .MuiInputBase-input": { py: "3px", px: "6px", fontSize: "0.72rem" }
    },
    onChange: handleChange
  };
}

// js/tools/configOpenAi.ts
var DEFAULT_MODELO_OPERATIVO = "gpt-4.1-nano";
function modelAllowsSampling(model) {
  const m = String(model ?? "").trim().toLowerCase();
  if (!m) return true;
  const blocked = /* @__PURE__ */ new Set([
    "gpt-5",
    "gpt-5-mini",
    "gpt-5-nano",
    "gpt-5-pro",
    "gpt-5-codex",
    "gpt-5-chat-latest",
    "gpt-5.5",
    "gpt-5.5-pro",
    "gpt-5.4-pro",
    "gpt-5.3-codex",
    "gpt-5.2-pro",
    "gpt-5.2-codex",
    "gpt-5.1-codex",
    "gpt-5.1-codex-max",
    "gpt-5.1-codex-mini",
    "o1",
    "o1-preview",
    "o1-mini",
    "o1-pro",
    "o3",
    "o3-mini",
    "o4-mini"
  ]);
  if (blocked.has(m)) return false;
  const base = m.replace(/-\d{4}-\d{2}-\d{2}$/, "");
  if (blocked.has(base)) return false;
  for (const b of blocked) {
    if (m === b || m.startsWith(`${b}-`)) return false;
  }
  return true;
}
function modelAllowsReasoningEffort(model) {
  const m = String(model ?? "").trim().toLowerCase();
  if (!m) return false;
  if (!modelAllowsSampling(m)) return true;
  return /^gpt-5|^o[134]/.test(m);
}

// js/tools/configPromptsOperativos.ts
var REASONING_EFFORT_OPTIONS = ["low", "medium", "high"];
var MESSAGE_ROLES = ["system", "user", "assistant"];
var LEGACY_META_KEYS = ["modeloOperativo", "modeloConversacion", "temperaturaConversacion"];
function prettyJson(obj) {
  try {
    return JSON.stringify(obj ?? {}, null, 2);
  } catch {
    return "{}";
  }
}
function isPromptDef(v) {
  return !!v && typeof v === "object" && !Array.isArray(v) && Array.isArray(v.messages);
}
function listPromptKeys(config) {
  return Object.keys(config ?? {}).filter((k) => !LEGACY_META_KEYS.includes(k) && isPromptDef(config[k]));
}
function stripLegacyMetaKeys(config) {
  const out = {};
  for (const [k, v] of Object.entries(config ?? {})) {
    if (!LEGACY_META_KEYS.includes(k)) out[k] = v;
  }
  return out;
}
function contentLinesToText(lines) {
  if (!Array.isArray(lines)) return "";
  return lines.map((l) => String(l ?? "")).join("\n");
}
function textToContentLines(text) {
  const src = preparePromptBodyForSave(text);
  if (!src) return [];
  return src.split("\n");
}
function isReasoningEffort(v) {
  return REASONING_EFFORT_OPTIONS.includes(v);
}
function isMessageRole(v) {
  return MESSAGE_ROLES.includes(v);
}
function validateTemperatureField(label, v, model, errors, opts = {}) {
  if (v === void 0 || v === null || v === "") return void 0;
  const n = Number(v);
  if (!Number.isFinite(n)) {
    errors.push(`${label}: debe ser num\xE9rico`);
    return void 0;
  }
  if (n < 0 || n > 2) {
    errors.push(`${label}: debe estar entre 0 y 2`);
    return void 0;
  }
  if (!modelAllowsSampling(model)) {
    if (opts.strict) errors.push(`${label}: el modelo (${model}) no admite temperatura`);
    return void 0;
  }
  return n;
}
function validateMaxTokens(label, v, errors) {
  if (v === void 0 || v === null || v === "") return void 0;
  const n = Math.floor(Number(v));
  if (!Number.isFinite(n) || n < 1) {
    errors.push(`${label}: debe ser un entero \u2265 1`);
    return void 0;
  }
  if (n > 128e3) errors.push(`${label}: m\xE1ximo 128000`);
  return n;
}
function normalizePromptDef(raw, key, operativeModel, errors, strict) {
  if (!isPromptDef(raw)) {
    errors.push(`${key}: debe ser un objeto con messages[]`);
    return { messages: [] };
  }
  const out = { messages: [] };
  const src = raw;
  if (src.reasoning_effort != null && src.reasoning_effort !== "") {
    if (!isReasoningEffort(src.reasoning_effort)) errors.push(`${key}.reasoning_effort: use low, medium o high`);
    else out.reasoning_effort = src.reasoning_effort;
  }
  const maxTok = validateMaxTokens(`${key}.max_completion_tokens`, src.max_completion_tokens, errors);
  if (maxTok != null) {
    out.max_completion_tokens = maxTok;
    const effort = out.reasoning_effort;
    if (effort && modelAllowsReasoningEffort(operativeModel) && maxTok > 64 && maxTok < 128) {
      errors.push(`${key}.max_completion_tokens: con modelo ${operativeModel} y reasoning_effort=${effort} use al menos 128 (el razonamiento consume el budget)`);
    }
  }
  const temp = validateTemperatureField(`${key}.temperatura`, src.temperatura, operativeModel, errors, { strict });
  if (temp != null) out.temperatura = temp;
  if (src.response_format && typeof src.response_format === "object" && !Array.isArray(src.response_format))
    out.response_format = src.response_format;
  if (!Array.isArray(src.messages) || !src.messages.length) {
    errors.push(`${key}.messages: al menos un mensaje`);
    return out;
  }
  out.messages = src.messages.map((m, idx) => {
    const role = m?.role;
    if (!isMessageRole(role)) errors.push(`${key}.messages[${idx}].role: system, user o assistant`);
    const content = Array.isArray(m?.content) ? m.content.map((line) => String(line ?? "")) : (() => {
      errors.push(`${key}.messages[${idx}].content: debe ser string[]`);
      return [];
    })();
    return { role: isMessageRole(role) ? role : "system", content };
  });
  for (const k of Object.keys(src)) {
    if (["reasoning_effort", "temperatura", "max_completion_tokens", "response_format", "messages"].includes(k)) continue;
    out[k] = src[k];
  }
  return out;
}
function validatePromptsOperativosConfig(config, opts = {}) {
  const strict = opts.strict === true;
  const errors = [];
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    return { ok: false, errors: ["La configuraci\xF3n debe ser un objeto JSON"], normalized: {} };
  }
  const src = stripLegacyMetaKeys(config);
  const operativeModel = String(opts.operativeModel ?? DEFAULT_MODELO_OPERATIVO).trim() || DEFAULT_MODELO_OPERATIVO;
  const normalized = {};
  for (const [key, val] of Object.entries(src)) {
    if (!isPromptDef(val)) {
      if (val != null && typeof val === "object") errors.push(`${key}: objeto sin messages[] no permitido`);
      else errors.push(`${key}: clave desconocida o tipo inv\xE1lido`);
      continue;
    }
    normalized[key] = normalizePromptDef(val, key, operativeModel, errors, strict);
  }
  if (!listPromptKeys(normalized).length) errors.push("Debe existir al menos un prompt operativo (p. ej. generarTitulo)");
  return { ok: errors.length === 0, errors, normalized };
}
function parseAndValidateJsonText(text, opts = {}) {
  let parsed;
  try {
    parsed = JSON.parse(String(text ?? ""));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, errors: [`JSON inv\xE1lido: ${msg}`], normalized: {} };
  }
  const result = validatePromptsOperativosConfig(parsed, { ...opts, strict: true });
  return { ...result, parsed: result.normalized };
}
var PROMPT_ACCORDION_LS_KEY = "isa-patyia:config-prompts-expand";
function readPromptAccordionExpandState() {
  try {
    const raw = localStorage.getItem(PROMPT_ACCORDION_LS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}
function writePromptAccordionExpandState(state) {
  try {
    localStorage.setItem(PROMPT_ACCORDION_LS_KEY, JSON.stringify(state));
  } catch {
  }
}
var PROMPT_SKELETON_COUNT_LS_KEY = "isa-patyia:config-prompts-skeleton-count";
var DEFAULT_PROMPT_SKELETON_COUNT = 2;
function readPromptSkeletonCount() {
  try {
    const n = Number(localStorage.getItem(PROMPT_SKELETON_COUNT_LS_KEY));
    if (Number.isFinite(n) && n >= 1 && n <= 32) return Math.floor(n);
  } catch {
  }
  return DEFAULT_PROMPT_SKELETON_COUNT;
}
function writePromptSkeletonCount(count) {
  try {
    const n = Math.floor(Number(count));
    if (n >= 1 && n <= 32) localStorage.setItem(PROMPT_SKELETON_COUNT_LS_KEY, String(n));
  } catch {
  }
}

// js/tools/configFieldPersist.ts
init_platform();
var { useRef: useRef2, useState: useState4 } = getReact();
function useConfigFieldPersist() {
  const saveGenRef = useRef2(0);
  const [fieldBusy, setFieldBusy] = useState4({});
  function beginSave(fields) {
    const gen = ++saveGenRef.current;
    if (fields.length) {
      setFieldBusy((prev) => ({ ...prev, ...Object.fromEntries(fields.map((f) => [f, true])) }));
    }
    return gen;
  }
  function endSave(gen) {
    if (gen === saveGenRef.current) setFieldBusy({});
  }
  function fieldDisabled(canEdit, field) {
    return !canEdit || !!fieldBusy[field];
  }
  return { saveGenRef, beginSave, endSave, fieldDisabled };
}

// js/tools/ConfigPromptsOperativosPanel.jsx
import { Fragment as Fragment4, jsx as jsx6, jsxs as jsxs4 } from "react/jsx-runtime";
var { useState: useState5, useEffect: useEffect4, useCallback: useCallback2, useRef: useRef3 } = getReact();
var {
  Typography: Typography3,
  TextField: TextField2,
  Stack: Stack3,
  Alert: Alert2,
  Box: Box3,
  Skeleton,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DialogContent: DialogContent3,
  DialogActions: DialogActions2,
  Button: Button2,
  Tooltip
} = getMaterialUI();
var { Icon } = UI;
var PROMPT_LABELS = {
  generarTitulo: "Generar t\xEDtulo",
  generarResumenTicket: "Resumen ticket"
};
var PROMPT_ICONS = {
  generarTitulo: "mdi:format-title",
  generarResumenTicket: "mdi:ticket-confirmation-outline"
};
var PROMPT_DEF_FIELD_SX = {
  width: 118,
  minWidth: 108,
  flex: "0 0 auto",
  "& .MuiInputBase-root": { minHeight: 34, height: 34 },
  "& .MuiOutlinedInput-input, & .MuiSelect-select": {
    py: "6px !important",
    fontSize: "0.8125rem",
    fontWeight: 600
  },
  "& .MuiInputLabel-root": { fontSize: "0.72rem" },
  "& .MuiInputLabel-shrink": { transform: "translate(14px, -7px) scale(0.85)" },
  "& .MuiFormHelperText-root": { display: "none" }
};
function promptLabel(key) {
  return PROMPT_LABELS[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}
function promptIcon(key) {
  return PROMPT_ICONS[key] || "mdi:robot-outline";
}
function GlassPromptAccordion({ title, icon, expanded, onToggle, accent, children, skeleton = false }) {
  const { useGlassColors, glassCardSx, glassHeaderSx, glassInnerSx, NEON_COLORS } = getGlass();
  const c = useGlassColors();
  const accentColor = accent || NEON_COLORS.cyan;
  function handleKey(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle?.();
    }
  }
  return /* @__PURE__ */ jsxs4(
    Paper,
    {
      variant: "outlined",
      elevation: 0,
      className: [
        "isa-glass-section",
        "config-prompt-accordion",
        expanded ? "config-prompt-accordion--expanded" : "",
        skeleton ? "config-prompt-accordion--skeleton" : ""
      ].filter(Boolean).join(" "),
      sx: glassCardSx(c, {
        tone: expanded ? "purple" : "default",
        accent: accentColor,
        hover: !expanded,
        mb: 0,
        radius: "14px"
      }),
      children: [
        /* @__PURE__ */ jsx6(
          Box3,
          {
            className: "isa-glass-section__head config-prompt-accordion__summary",
            role: "button",
            tabIndex: 0,
            "aria-expanded": expanded,
            onClick: onToggle,
            onKeyDown: handleKey,
            sx: {
              px: { xs: 1.5, sm: 2 },
              py: 1,
              cursor: "pointer",
              userSelect: "none",
              ...glassHeaderSx(c, accentColor),
              ...glassInnerSx(c, "blue")
            },
            children: /* @__PURE__ */ jsxs4(Stack3, { direction: "row", spacing: 1.25, alignItems: "center", sx: { width: "100%" }, children: [
              /* @__PURE__ */ jsx6(
                Box3,
                {
                  className: "isa-glass-section__icon config-prompt-accordion__icon",
                  sx: {
                    width: 28,
                    height: 28,
                    borderRadius: 1.25,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    background: `linear-gradient(135deg, ${accentColor}, ${accentColor}99)`,
                    color: "#fff",
                    boxShadow: c.dark ? `0 4px 12px ${accentColor}44` : "none"
                  },
                  children: /* @__PURE__ */ jsx6(Icon, { icon: icon || "mdi:robot-outline", size: 16 })
                }
              ),
              skeleton ? /* @__PURE__ */ jsx6(Skeleton, { variant: "text", width: "46%", height: 22, sx: { flex: 1 } }) : /* @__PURE__ */ jsx6(
                Typography3,
                {
                  variant: "subtitle2",
                  className: "config-prompt-accordion__title",
                  sx: { fontWeight: 700, letterSpacing: -0.15, color: c.text, flex: 1, minWidth: 0 },
                  children: title
                }
              ),
              /* @__PURE__ */ jsx6(
                Box3,
                {
                  className: "config-prompt-accordion__chevron",
                  sx: {
                    display: "flex",
                    color: c.muted,
                    transition: "transform 0.2s ease",
                    transform: expanded ? "rotate(180deg)" : "none"
                  },
                  "aria-hidden": true,
                  children: /* @__PURE__ */ jsx6(Icon, { icon: "mdi:chevron-down", size: 20 })
                }
              )
            ] })
          }
        ),
        expanded ? /* @__PURE__ */ jsx6(
          Box3,
          {
            className: "isa-glass-section__body config-prompt-accordion__details",
            sx: { px: { xs: 1.5, sm: 2 }, pt: 1.5, pb: 2, color: c.text },
            children
          }
        ) : null
      ]
    }
  );
}
function ConfigPromptsSkeleton({ count, expandState }) {
  const { NEON_COLORS } = getGlass();
  const expandedKey = Object.keys(expandState ?? {}).find((k) => expandState[k]);
  return /* @__PURE__ */ jsx6(Stack3, { spacing: 1.25, className: "config-prompt-accordions config-prompt-accordions--skeleton", "aria-busy": "true", "aria-label": "Cargando prompts operativos", children: Array.from({ length: count }, (_, i) => {
    const expanded = expandedKey ? i === 0 : false;
    return /* @__PURE__ */ jsx6(
      GlassPromptAccordion,
      {
        title: "",
        icon: "mdi:robot-outline",
        expanded,
        skeleton: true,
        accent: i % 2 ? NEON_COLORS.purple : NEON_COLORS.cyan,
        onToggle: () => {
        },
        children: expanded ? /* @__PURE__ */ jsxs4(Stack3, { spacing: 2, className: "config-prompt-def", children: [
          /* @__PURE__ */ jsxs4(Stack3, { direction: "row", spacing: 2, className: "config-prompt-def-fields", children: [
            /* @__PURE__ */ jsx6(Skeleton, { variant: "rounded", height: 40, sx: { width: 200, flex: "0 0 auto" } }),
            /* @__PURE__ */ jsx6(Skeleton, { variant: "rounded", height: 40, sx: { width: 200, flex: "0 0 auto" } }),
            /* @__PURE__ */ jsx6(Skeleton, { variant: "rounded", height: 40, sx: { width: 200, flex: "0 0 auto" } })
          ] }),
          /* @__PURE__ */ jsx6(Skeleton, { variant: "rounded", height: 140 }),
          /* @__PURE__ */ jsx6(Skeleton, { variant: "rounded", height: 140 })
        ] }) : null
      },
      i
    );
  }) });
}
function OperativosJsonModal({ open, initial, readOnly, operativeModel, onClose, onApply }) {
  const [json, setJson] = useState5(initial);
  const [errors, setErrors] = useState5([]);
  useEffect4(() => {
    if (open) {
      setJson(initial);
      setErrors([]);
    }
  }, [open, initial]);
  function validateNow(text) {
    const r = parseAndValidateJsonText(text, { operativeModel });
    setErrors(r.errors);
    return r;
  }
  function apply() {
    const r = validateNow(json);
    if (!r.ok) return;
    onApply?.(r.normalized);
    onClose();
  }
  const canApply = parseAndValidateJsonText(json, { operativeModel }).ok;
  return /* @__PURE__ */ jsxs4(
    GlassDialog,
    {
      open,
      onClose,
      maxWidth: "md",
      fullWidth: true,
      paperMaxWidth: 960,
      header: /* @__PURE__ */ jsx6(GlassDialogHeader, { icon: "mdi:code-json", title: "JSON", accent: "#6366f1", onClose }),
      children: [
        /* @__PURE__ */ jsxs4(DialogContent3, { dividers: true, sx: glassDialogContentSx({ p: 0, minHeight: 380 }), children: [
          errors.length ? /* @__PURE__ */ jsx6(Alert2, { severity: "warning", sx: { m: 1.5, mb: 0 }, children: /* @__PURE__ */ jsx6(Stack3, { component: "ul", spacing: 0.25, sx: { m: 0, pl: 2 }, children: errors.map((e) => /* @__PURE__ */ jsx6("li", { children: /* @__PURE__ */ jsx6(Typography3, { variant: "body2", children: e }) }, e)) }) }) : null,
          /* @__PURE__ */ jsx6(Box3, { className: "permisos-json-modal-editor config-prompts-json-modal", sx: { minHeight: 340, p: 1 }, children: /* @__PURE__ */ jsx6(JsonCodeEditor, { value: json, onChange: readOnly ? void 0 : (v) => {
            setJson(v);
            validateNow(v);
          }, readOnly, placeholder: "{}", fullPageTitle: "prompts_operativos" }) })
        ] }),
        /* @__PURE__ */ jsxs4(DialogActions2, { sx: glassDialogActionsSx(), children: [
          /* @__PURE__ */ jsx6(Button2, { onClick: onClose, sx: { textTransform: "none", fontWeight: 600 }, children: readOnly ? "Cerrar" : "Cancelar" }),
          !readOnly && onApply ? /* @__PURE__ */ jsx6(Button2, { variant: "contained", onClick: apply, disabled: !canApply, sx: { textTransform: "none", fontWeight: 600 }, children: "Aplicar JSON" }) : null
        ] })
      ]
    }
  );
}
function MessageCard({ role, body, bodyLines, canEdit, promptKey, onChange }) {
  const { NEON_COLORS } = getGlass();
  const icon = role === "system" ? "mdi:cog-outline" : role === "user" ? "mdi:account-outline" : "mdi:robot-outline";
  const title = role === "system" ? "Sistema" : role === "user" ? "Usuario" : "Asistente";
  const accent = role === "system" ? NEON_COLORS.purple : NEON_COLORS.cyan;
  const isUser = role === "user";
  const avatar = /* @__PURE__ */ jsx6(
    Box3,
    {
      className: "config-prompt-msg__avatar",
      sx: {
        width: 28,
        height: 28,
        borderRadius: "50%",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${accent}, ${accent}88)`,
        color: "#fff",
        boxShadow: `0 0 12px ${accent}44`
      },
      "aria-hidden": true,
      children: /* @__PURE__ */ jsx6(Icon, { icon, size: 15 })
    }
  );
  return /* @__PURE__ */ jsx6(
    Box3,
    {
      className: `config-prompt-msg config-prompt-msg--chat config-prompt-msg--${role}`,
      style: { ["--stripe-accent"]: accent },
      children: /* @__PURE__ */ jsxs4(
        Stack3,
        {
          direction: "row",
          spacing: 1,
          alignItems: "flex-end",
          justifyContent: isUser ? "flex-end" : "flex-start",
          className: "config-prompt-msg__row",
          children: [
            !isUser ? avatar : null,
            /* @__PURE__ */ jsxs4(Box3, { className: "config-prompt-msg__bubble", children: [
              /* @__PURE__ */ jsx6(Typography3, { component: "div", className: "config-prompt-msg__role", variant: "caption", children: title }),
              /* @__PURE__ */ jsx6(Box3, { className: "config-prompt-msg__editor", children: /* @__PURE__ */ jsx6(
                PromptBodyEditor,
                {
                  body,
                  bodyLines,
                  canEdit,
                  onChange,
                  tipo: `${promptKey}_${role}`,
                  title: `${promptLabel(promptKey)} \xB7 ${title}`,
                  placeholder: "Escriba el prompt\u2026"
                }
              ) })
            ] }),
            isUser ? avatar : null
          ]
        }
      )
    }
  );
}
function PromptDefEditor({ promptKey, def, canEdit, operativeModel, onChange }) {
  const msgs = Array.isArray(def?.messages) ? def.messages : [];
  const systemIdx = msgs.findIndex((m) => m.role === "system");
  const userIdx = msgs.findIndex((m) => m.role === "user");
  const systemMsg = systemIdx >= 0 ? msgs[systemIdx] : { role: "system", content: [] };
  const userMsg = userIdx >= 0 ? msgs[userIdx] : { role: "user", content: [] };
  const tempAllowed = modelAllowsSampling(operativeModel);
  function patchDef(patch) {
    onChange({ ...def, ...patch });
  }
  function patchMessage(role, idx, text) {
    const next = msgs.map((m, i) => i === idx ? { ...m, content: textToContentLines(text) } : m);
    if (idx < 0) next.push({ role, content: textToContentLines(text) });
    onChange({ ...def, messages: next });
  }
  return /* @__PURE__ */ jsxs4(Stack3, { spacing: 1.5, className: "config-prompt-def", children: [
    /* @__PURE__ */ jsxs4(Stack3, { direction: "row", spacing: 1, useFlexGap: true, flexWrap: "nowrap", alignItems: "center", className: "config-prompt-def-fields", children: [
      /* @__PURE__ */ jsxs4(FormControl, { size: "small", sx: PROMPT_DEF_FIELD_SX, disabled: !canEdit, children: [
        /* @__PURE__ */ jsx6(InputLabel, { id: `prompt-reasoning-${promptKey}-label`, shrink: true, children: "Razonamiento" }),
        /* @__PURE__ */ jsx6(Select, { labelId: `prompt-reasoning-${promptKey}-label`, label: "Razonamiento", value: def?.reasoning_effort || "low", onChange: (e) => patchDef({ reasoning_effort: e.target.value }), children: REASONING_EFFORT_OPTIONS.map((o) => /* @__PURE__ */ jsx6(MenuItem, { value: o, dense: true, children: o }, o)) })
      ] }),
      /* @__PURE__ */ jsx6(
        TextField2,
        {
          size: "small",
          label: "M\xE1x. tokens",
          type: "number",
          disabled: !canEdit,
          value: def?.max_completion_tokens ?? "",
          sx: PROMPT_DEF_FIELD_SX,
          onChange: (e) => patchDef({ max_completion_tokens: e.target.value === "" ? void 0 : Number(e.target.value) }),
          slotProps: { htmlInput: { min: 1, max: 128e3, step: 1 } }
        }
      ),
      /* @__PURE__ */ jsx6(Tooltip, { title: tempAllowed ? void 0 : "No aplica a este modelo", placement: "top", children: /* @__PURE__ */ jsx6(Box3, { component: "span", sx: PROMPT_DEF_FIELD_SX, children: /* @__PURE__ */ jsx6(
        TextField2,
        {
          size: "small",
          fullWidth: true,
          label: "Temperatura",
          disabled: !canEdit || !tempAllowed,
          ...unitIntervalFieldProps(def?.temperatura, 0.4, (v) => patchDef({ temperatura: v }))
        }
      ) }) })
    ] }),
    /* @__PURE__ */ jsxs4(Box3, { className: "config-prompt-thread", children: [
      /* @__PURE__ */ jsx6(
        MessageCard,
        {
          role: "system",
          promptKey,
          canEdit,
          body: contentLinesToText(systemMsg.content),
          bodyLines: systemMsg.content,
          onChange: (text) => patchMessage("system", systemIdx, text)
        }
      ),
      /* @__PURE__ */ jsx6(
        MessageCard,
        {
          role: "user",
          promptKey,
          canEdit,
          body: contentLinesToText(userMsg.content),
          bodyLines: userMsg.content,
          onChange: (text) => patchMessage("user", userIdx, text)
        }
      )
    ] })
  ] });
}
function ConfigPromptsOperativosPanel({ onNeedLogin, ConfigFormSection, operativeModel, conversationModel: _conversationModel }) {
  const [loading, setLoading] = useState5(true);
  const [canEdit, setCanEdit] = useState5(false);
  const [config, setConfig] = useState5({});
  const [saved, setSaved] = useState5({});
  const savedRef = useRef3(saved);
  savedRef.current = saved;
  const { saveGenRef, beginSave, endSave, fieldDisabled } = useConfigFieldPersist();
  const [jsonOpen, setJsonOpen] = useState5(false);
  const [expandState, setExpandState] = useState5(() => readPromptAccordionExpandState());
  const [skeletonCount, setSkeletonCount] = useState5(() => readPromptSkeletonCount());
  const opModel = String(operativeModel ?? DEFAULT_MODELO_OPERATIVO).trim() || DEFAULT_MODELO_OPERATIVO;
  const promptKeys = listPromptKeys(config);
  const { NEON_COLORS } = getGlass();
  useEffect4(() => {
    writePromptAccordionExpandState(expandState);
  }, [expandState]);
  function isExpanded(key) {
    if (Object.prototype.hasOwnProperty.call(expandState, key)) return !!expandState[key];
    return false;
  }
  function handleToggleExpand(key, on) {
    setExpandState((prev) => ({ ...prev, [key]: on }));
  }
  const load = useCallback2(async () => {
    setLoading(true);
    try {
      const { config: cfg, canEdit: ce } = await fetchPromptsOperativosConfig();
      const data = stripLegacyMetaKeys(cfg ?? {});
      const keys = listPromptKeys(data);
      writePromptSkeletonCount(keys.length);
      setSkeletonCount(keys.length);
      setConfig(data);
      setSaved(data);
      setCanEdit(!!ce);
    } catch (e) {
      toastError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect4(() => {
    load();
  }, [load]);
  useEffect4(() => {
    const onAuth = () => {
      load();
    };
    const onOpenAi = () => {
      load();
    };
    window.addEventListener(Session.EVENT, onAuth);
    window.addEventListener("isa-patyia:openai-config", onOpenAi);
    return () => {
      window.removeEventListener(Session.EVENT, onAuth);
      window.removeEventListener("isa-patyia:openai-config", onOpenAi);
    };
  }, [load]);
  async function persist(snapshot, gen, fields) {
    if (!requireAppSession(onNeedLogin)) {
      endSave(gen);
      return;
    }
    if (!canEdit) {
      endSave(gen);
      return;
    }
    const cfg = snapshot ?? config;
    const v = validatePromptsOperativosConfig(cfg, { operativeModel: opModel, strict: false });
    if (!v.ok) {
      toastError(v.errors.join(" \xB7 "));
      endSave(gen);
      return;
    }
    try {
      const res = await putPromptsOperativosConfig(v.normalized);
      if (gen !== saveGenRef.current) return;
      const next = validatePromptsOperativosConfig(stripLegacyMetaKeys(res), { operativeModel: opModel, strict: false }).normalized;
      savedRef.current = next;
      setSaved(next);
      setConfig(next);
      toastSuccess("Guardado");
      const keys = listPromptKeys(next);
      writePromptSkeletonCount(keys.length);
      setSkeletonCount(keys.length);
    } catch (e) {
      if (gen !== saveGenRef.current) return;
      setConfig(savedRef.current);
      toastError(e instanceof Error ? e.message : String(e));
    } finally {
      endSave(gen);
    }
  }
  function updatePrompt(key, def) {
    const next = { ...config, [key]: def };
    setConfig(next);
    void persist(next, beginSave([key]), [key]);
  }
  return /* @__PURE__ */ jsxs4(
    ConfigFormSection,
    {
      className: "config-form-section--prompts",
      icon: /* @__PURE__ */ jsx6(Icon, { icon: "mdi:robot-outline", size: 20 }),
      title: "Prompts operativos",
      description: "Tareas autom\xE1ticas: t\xEDtulo, resumen de ticket y similares.",
      actions: /* @__PURE__ */ jsxs4(Fragment4, { children: [
        /* @__PURE__ */ jsx6(ButtonIconify, { icon: "mdi:code-json", title: "JSON", onClick: () => setJsonOpen(true) }),
        /* @__PURE__ */ jsx6(ButtonIconify, { icon: "mdi:refresh", title: "Recargar", onClick: load, busy: loading })
      ] }),
      children: [
        loading ? /* @__PURE__ */ jsx6(ConfigPromptsSkeleton, { count: skeletonCount, expandState }) : /* @__PURE__ */ jsx6(Stack3, { spacing: 1.25, className: "config-prompt-accordions", children: promptKeys.map((key, idx) => {
          const accent = idx % 2 ? NEON_COLORS.purple : NEON_COLORS.cyan;
          return /* @__PURE__ */ jsx6(
            GlassPromptAccordion,
            {
              title: promptLabel(key),
              icon: promptIcon(key),
              accent,
              expanded: isExpanded(key),
              onToggle: () => handleToggleExpand(key, !isExpanded(key)),
              children: /* @__PURE__ */ jsx6(
                PromptDefEditor,
                {
                  promptKey: key,
                  def: config[key],
                  canEdit: !fieldDisabled(canEdit, key),
                  operativeModel: opModel,
                  onChange: (def) => updatePrompt(key, def)
                }
              )
            },
            key
          );
        }) }),
        /* @__PURE__ */ jsx6(
          OperativosJsonModal,
          {
            open: jsonOpen,
            initial: prettyJson(config),
            readOnly: !canEdit,
            operativeModel: opModel,
            onClose: () => setJsonOpen(false),
            onApply: (parsed) => {
              const fields = Object.keys(parsed);
              setConfig(parsed);
              setJsonOpen(false);
              void persist(parsed, beginSave(fields), fields);
            }
          }
        )
      ]
    }
  );
}
export {
  ConfigPromptsOperativosPanel
};
