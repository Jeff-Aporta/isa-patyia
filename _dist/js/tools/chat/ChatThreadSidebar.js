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
var PATYIA_ISS_URL, PATYIA_ISS_PROD_URL, PATYIA_ISS_LOCAL, PATYIA_ISS_LOCAL_API, PATYIA_ISS_PROD_API, PATYIA_ISS_STAGING_API, PATYIA_ISS_TARGET_LS_KEY, AVATAR_BG_PALETTE;
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
var bridge, UI, Session, Config, getReact, getMaterialUI;
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
    getMaterialUI = () => window.ISAFront.getMaterialUI();
  }
});

// js/api/portalJwtApi.ts
var init_portalJwtApi = __esm({
  "js/api/portalJwtApi.ts"() {
    init_platform();
    init_patyia();
  }
});

// js/api/issListFilter.ts
var init_issListFilter = __esm({
  "js/api/issListFilter.ts"() {
  }
});

// js/api/patyiaTokens.ts
var init_patyiaTokens = __esm({
  "js/api/patyiaTokens.ts"() {
    init_platform();
  }
});

// js/api/patyiaChatApi.ts
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
    const data = unwrapBody(await res.json());
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
function realRolesAllowViewAs(roles) {
  return (roles ?? []).some((r) => isDevBranchRole(r));
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
function convBelongsToJwt(conv, claims) {
  if (!claims?.itercero) return false;
  return String(conv.itercero ?? "") === String(claims.itercero) && String(conv.icontacto ?? "") === String(claims.icontacto ?? "");
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

// js/tools/chat/ChatThreadSidebar.jsx
init_platform();
init_patyia_jwt();

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

// js/tools/chat/constants.ts
var CHAT_SIDEBAR_W = 320;
var CONV_LIST_PAGE_SIZE_OPTIONS = [30, 15, 50];
var CONV_LIST_PAGE_SIZE_DEFAULT = 30;
var CHAT_MODE_PATYIA = "patyia";
var CHAT_MODE_LIBRE = "libre";
var CHAT_PROVIDER_OPENAI = "openai";
var CHAT_PROVIDER_MINIMAX = "minimax";
function parseChatLlmProvider(raw) {
  const t = String(raw ?? "").trim().toLowerCase();
  if (t === CHAT_PROVIDER_MINIMAX || t === "mini-max" || t === "mm") return CHAT_PROVIDER_MINIMAX;
  return CHAT_PROVIDER_OPENAI;
}
function isMinimaxChatProvider(provider) {
  return parseChatLlmProvider(provider) === CHAT_PROVIDER_MINIMAX;
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
function formatTs(v) {
  return formatMsgFecha(v).label;
}

// js/tools/chat/ChatSessionPanel.jsx
init_platform();
init_patyia();
init_patyia_jwt();
import { jsx, jsxs } from "react/jsx-runtime";
var { useState, useEffect, useMemo } = getReact();
var { Box, Typography, CircularProgress, Chip } = getMaterialUI();
var { Icon } = UI;
var CHIP_SX = {
  live: { height: 18, "& .MuiChip-label": { px: 0.5, fontSize: "0.6rem", fontWeight: 600 } },
  readonly: { height: 18, "& .MuiChip-label": { px: 0.5, fontSize: "0.6rem", fontWeight: 600 } },
  loading: { height: 18, "& .MuiChip-label": { px: 0.5, fontSize: "0.6rem", fontWeight: 600 } }
};
function SessionModeChip({ canSend, jwtLoading }) {
  if (canSend) {
    return /* @__PURE__ */ jsx(
      Chip,
      {
        size: "small",
        variant: "outlined",
        label: "Interactivo",
        icon: /* @__PURE__ */ jsx(Icon, { icon: "mdi:chat-processing-outline", size: 12, "aria-hidden": true }),
        className: "paty-chat-session__badge paty-chat-session__badge--live",
        sx: CHIP_SX.live
      }
    );
  }
  if (jwtLoading) {
    return /* @__PURE__ */ jsx(
      Chip,
      {
        size: "small",
        variant: "outlined",
        label: "Token\u2026",
        icon: /* @__PURE__ */ jsx(CircularProgress, { size: 9, color: "inherit" }),
        className: "paty-chat-session__badge paty-chat-session__badge--loading",
        sx: CHIP_SX.loading
      }
    );
  }
  return /* @__PURE__ */ jsx(
    Chip,
    {
      size: "small",
      variant: "outlined",
      label: "Solo lectura",
      icon: /* @__PURE__ */ jsx(Icon, { icon: "mdi:eye-outline", size: 12, "aria-hidden": true }),
      className: "paty-chat-session__badge paty-chat-session__badge--readonly",
      sx: CHIP_SX.readonly
    }
  );
}
function ChatSessionPanel({ claims, displayScope, sessionUser: _sessionUser, ownerDisplayName, canSend, jwtLoading, canAudit = false, onOpenAudit }) {
  const tercero = claims?.itercero ?? displayScope?.itercero;
  const contacto = claims?.icontacto ?? displayScope?.icontacto;
  const codes = [tercero, contacto].filter(Boolean).join(" \xB7 ");
  const scopeName = String(displayScope?.nombre ?? "").trim();
  const claimsName = jwtUserDisplayName(claims) || jwtUserShortName(claims);
  const primaryLabel = String(ownerDisplayName ?? "").trim() || scopeName || claimsName || codes || "ISA PatyIA";
  const avatarUrl = useMemo(() => buildUserAvatarUrl(primaryLabel, 72), [primaryLabel]);
  const [avatarOk, setAvatarOk] = useState(true);
  useEffect(() => {
    setAvatarOk(true);
  }, [avatarUrl]);
  const interactive = !!canAudit && typeof onOpenAudit === "function";
  return /* @__PURE__ */ jsxs(
    Box,
    {
      className: `paty-chat-session${interactive ? " paty-chat-session--clickable" : ""}`,
      role: interactive ? "button" : void 0,
      tabIndex: interactive ? 0 : void 0,
      title: interactive ? "Filtrar conversaciones por usuario" : void 0,
      "aria-label": interactive ? `Filtrar por ${primaryLabel}` : void 0,
      onClick: interactive ? () => onOpenAudit?.() : void 0,
      onKeyDown: interactive ? (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenAudit?.();
        }
      } : void 0,
      children: [
        /* @__PURE__ */ jsx(Box, { className: "paty-chat-session__avatar", "aria-hidden": true, children: avatarOk ? /* @__PURE__ */ jsx("img", { className: "paty-chat-session__avatar-img", src: avatarUrl, alt: "", width: 36, height: 36, loading: "lazy", decoding: "async", onError: () => setAvatarOk(false) }) : /* @__PURE__ */ jsx(Icon, { icon: "mdi:account-circle", size: 28 }) }),
        /* @__PURE__ */ jsxs(Box, { className: "paty-chat-session__body", children: [
          /* @__PURE__ */ jsx(Typography, { className: "paty-chat-session__name", noWrap: true, title: primaryLabel, children: primaryLabel }),
          /* @__PURE__ */ jsxs(Box, { className: "paty-chat-session__meta", children: [
            /* @__PURE__ */ jsx(SessionModeChip, { canSend, jwtLoading }),
            codes ? /* @__PURE__ */ jsx(
              Typography,
              {
                className: "paty-chat-session__ids",
                variant: "caption",
                component: "span",
                title: codes,
                sx: { fontSize: "0.58rem", lineHeight: 1.15, color: "rgba(148, 163, 184, 0.72)", fontWeight: 400 },
                children: codes
              }
            ) : null
          ] })
        ] }),
        /* @__PURE__ */ jsx(Box, { className: "paty-chat-session__action", "aria-hidden": true, children: /* @__PURE__ */ jsx(Icon, { icon: "mdi:filter-variant", size: 14 }) })
      ]
    }
  );
}

// js/tools/chat/ConvSearchAutocomplete.jsx
init_platform();
import { Fragment, jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
import { createElement } from "react";
var { useState: useState2, useEffect: useEffect2, useRef, useCallback, useMemo: useMemo2 } = getReact();
var { Autocomplete, TextField, Typography: Typography2, Box: Box2, IconButton, InputAdornment } = getMaterialUI();
var { Icon: Icon2 } = UI;
var DEBOUNCE_MS = 300;
function convSearchFilter(text) {
  const raw = String(text ?? "").trim();
  if (!raw) return "";
  const head = raw.split("\xB7")[0].trim();
  const digits = head.replace(/\D/g, "");
  return digits || "";
}
function convOptionLabel(row) {
  if (!row) return "";
  const title = String(row.titulo ?? "").trim() || "Sin t\xEDtulo";
  return `${row.iconversacion} \xB7 ${title}`;
}
function convSelectedLabel(row) {
  if (!row?.iconversacion) return "";
  return String(row.iconversacion);
}
function ConvSearchAutocomplete({
  rows = [],
  loading = false,
  search = "",
  onSearchChange,
  selectedId,
  onSelectConv,
  disabled = false,
  placeholder = "Buscar por # conversaci\xF3n\u2026"
}) {
  const [inputValue, setInputValue] = useState2(search ?? "");
  const debounceRef = useRef(null);
  useEffect2(() => {
    setInputValue(search ?? "");
  }, [search]);
  const selected = useMemo2(() => {
    if (!selectedId) return null;
    return rows.find((r) => Number(r.iconversacion) === Number(selectedId)) ?? null;
  }, [rows, selectedId]);
  const scheduleSearch = useCallback((text) => {
    const filter = convSearchFilter(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSearchChange?.(filter), DEBOUNCE_MS);
  }, [onSearchChange]);
  const applySearchNow = useCallback((text) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const filter = convSearchFilter(text);
    onSearchChange?.(filter);
    return filter;
  }, [onSearchChange]);
  const clearSearch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setInputValue("");
    onSearchChange?.("");
  }, [onSearchChange]);
  useEffect2(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);
  const showClear = Boolean(inputValue?.trim());
  const [menuOpen, setMenuOpen] = useState2(false);
  const fusedOpen = menuOpen ? " paty-chat-conv-search--open" : "";
  return /* @__PURE__ */ jsx2(
    Autocomplete,
    {
      fullWidth: true,
      size: "small",
      className: `paty-chat-conv-search${fusedOpen}`,
      open: menuOpen,
      onOpen: () => setMenuOpen(true),
      onClose: () => setMenuOpen(false),
      openOnFocus: true,
      autoHighlight: true,
      clearOnBlur: false,
      disableClearable: true,
      disabled,
      loading,
      options: rows,
      value: selected,
      inputValue,
      filterOptions: (x) => x,
      getOptionLabel: convOptionLabel,
      isOptionEqualToValue: (a, b) => Number(a?.iconversacion) === Number(b?.iconversacion),
      noOptionsText: loading ? "Buscando\u2026" : "Sin conversaciones",
      loadingText: "Buscando\u2026",
      slotProps: {
        paper: { className: menuOpen ? "paty-chat-conv-search__paper paty-chat-conv-search__paper--open" : "paty-chat-conv-search__paper" },
        popper: {
          className: menuOpen ? "paty-chat-conv-search__popper paty-chat-conv-search__popper--open" : "paty-chat-conv-search__popper",
          modifiers: [{ name: "offset", options: { offset: [0, 0] } }]
        }
      },
      onInputChange: (_e, text, reason) => {
        if (reason === "reset") {
          const id = selected ? convSelectedLabel(selected) : convSearchFilter(text);
          setInputValue(id);
          return;
        }
        setInputValue(text);
        scheduleSearch(text);
      },
      onChange: (_e, row) => {
        if (row?.iconversacion) {
          const id = convSelectedLabel(row);
          applySearchNow(id);
          setInputValue(id);
          onSelectConv?.(row.iconversacion);
        }
      },
      renderOption: (props, row) => /* @__PURE__ */ createElement(
        Box2,
        {
          component: "li",
          ...props,
          key: row.iconversacion,
          className: "paty-chat-conv-search__option",
          sx: { display: "flex", alignItems: "center", justifyContent: "flex-start", py: 0.75 }
        },
        /* @__PURE__ */ jsxs2(Typography2, { variant: "body2", className: "paty-chat-conv-search__option-label", sx: { fontWeight: 600 }, noWrap: true, children: [
          /* @__PURE__ */ jsx2(Box2, { component: "span", className: "paty-chat-conv-search__option-id", children: row.iconversacion }),
          /* @__PURE__ */ jsx2(Box2, { component: "span", className: "paty-chat-conv-search__option-title", children: String(row.titulo ?? "").trim() || "Sin t\xEDtulo" })
        ] })
      ),
      renderInput: (params) => {
        const inputProps = params.InputProps ?? params.slotProps?.input ?? {};
        return /* @__PURE__ */ jsx2(
          TextField,
          {
            ...params,
            size: "small",
            placeholder,
            InputProps: {
              ...inputProps,
              endAdornment: /* @__PURE__ */ jsxs2(Fragment, { children: [
                showClear ? /* @__PURE__ */ jsx2(InputAdornment, { position: "end", children: /* @__PURE__ */ jsx2(IconButton, { size: "small", "aria-label": "Limpiar b\xFAsqueda", className: "paty-chat-conv-search__clear", onMouseDown: (e) => e.preventDefault(), onClick: clearSearch, children: /* @__PURE__ */ jsx2(Icon2, { icon: "mdi:close", size: 16 }) }) }) : null,
                inputProps.endAdornment
              ] })
            }
          }
        );
      }
    }
  );
}

// js/tools/chat/auditScope.ts
init_patyia_jwt();
function resolveOwnerDisplayName(jwt, displayScope) {
  const scopeName = String(displayScope?.nombre ?? "").trim();
  if (scopeName) return scopeName;
  const actingName = String(jwt?.actingAsDisplayName ?? "").trim();
  if (actingName) return actingName;
  return jwtUserDisplayName(jwt?.claims) || jwtUserShortName(jwt?.claims) || "";
}

// js/tools/chat/ChatThreadSidebar.jsx
import { Fragment as Fragment2, jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
var {
  Box: Box3,
  Typography: Typography3,
  Button,
  IconButton: IconButton2,
  List,
  ListItemButton,
  ListItemText,
  CircularProgress: CircularProgress2,
  Tooltip,
  Stack,
  Divider,
  Select,
  MenuItem,
  FormControl
} = getMaterialUI();
var { Icon: Icon3 } = UI;
function MessageSourceSwitch({ messageSource, onChange }) {
  const isProd = messageSource === "prod";
  const title = isProd ? "Modo producci\xF3n (sin meta)" : "Modo logs (con meta)";
  const hint = isProd ? "Clic para ver logs" : "Clic para ver producci\xF3n";
  const icon = isProd ? "mdi:earth" : "mdi:code-json";
  return /* @__PURE__ */ jsx3(Tooltip, { title: `${title} \xB7 ${hint}`, children: /* @__PURE__ */ jsx3(IconButton2, { color: "inherit", size: "small", onClick: () => onChange?.(isProd ? "logs" : "prod"), "aria-label": title, "aria-pressed": !isProd, children: /* @__PURE__ */ jsx3(Icon3, { icon, size: 18 }) }) });
}
function ChatModeSwitch({ mode, onChange }) {
  const isLibre = isLibreChatMode(mode);
  const title = isLibre ? "Libre" : "Patyia";
  const icon = isLibre ? "game-icons:freedom-dove" : "game-icons:bird-cage";
  return /* @__PURE__ */ jsx3(Tooltip, { title, children: /* @__PURE__ */ jsx3(
    IconButton2,
    {
      color: "inherit",
      size: "small",
      className: `paty-chat-mode-btn${isLibre ? " paty-chat-mode-btn--libre" : ""}`,
      onClick: () => onChange?.(isLibre ? CHAT_MODE_PATYIA : CHAT_MODE_LIBRE),
      "aria-label": title,
      "aria-pressed": isLibre,
      children: /* @__PURE__ */ jsx3(Icon3, { icon, size: 18 })
    }
  ) });
}
function LlmProviderSwitch({ provider, onChange }) {
  const isMm = isMinimaxChatProvider(provider);
  const title = isMm ? "MiniMax M3" : "OpenAI";
  const hint = isMm ? "Clic \u2192 OpenAI (default)" : "Clic \u2192 MiniMax M3 (experimental)";
  const icon = isMm ? "mdi:creation" : "simple-icons:openai";
  return /* @__PURE__ */ jsx3(Tooltip, { title: `${title} \xB7 ${hint}`, children: /* @__PURE__ */ jsx3(
    IconButton2,
    {
      color: isMm ? "secondary" : "inherit",
      size: "small",
      className: `paty-chat-provider-btn${isMm ? " paty-chat-provider-btn--minimax" : ""}`,
      onClick: () => onChange?.(isMm ? CHAT_PROVIDER_OPENAI : CHAT_PROVIDER_MINIMAX),
      "aria-label": title,
      "aria-pressed": isMm,
      children: /* @__PURE__ */ jsx3(Icon3, { icon, size: 18 })
    }
  ) });
}
function ChatSidebarHeaderActions({
  onClose,
  messageSource = "logs",
  mode = CHAT_MODE_PATYIA,
  llmProvider = CHAT_PROVIDER_OPENAI,
  onMessageSourceChange,
  onChatModeChange,
  onLlmProviderChange
}) {
  return /* @__PURE__ */ jsxs3(
    Stack,
    {
      direction: "row",
      spacing: 0.35,
      alignItems: "center",
      className: "paty-chat-sidebar-head-actions",
      onClick: (e) => e.stopPropagation(),
      onKeyDown: (e) => e.stopPropagation(),
      children: [
        onClose ? /* @__PURE__ */ jsx3(Tooltip, { title: "Cerrar panel", children: /* @__PURE__ */ jsx3(IconButton2, { size: "small", onClick: onClose, "aria-label": "Cerrar panel", children: /* @__PURE__ */ jsx3(Icon3, { icon: "mdi:close", size: 18 }) }) }) : null,
        onMessageSourceChange ? /* @__PURE__ */ jsx3(MessageSourceSwitch, { messageSource, onChange: onMessageSourceChange }) : null,
        onChatModeChange ? /* @__PURE__ */ jsx3(ChatModeSwitch, { mode, onChange: onChatModeChange }) : null,
        onLlmProviderChange ? /* @__PURE__ */ jsx3(LlmProviderSwitch, { provider: llmProvider, onChange: onLlmProviderChange }) : null
      ]
    }
  );
}
function ChatNewConversationButton({ canSend, onNewChat, onClose, compact = false }) {
  const handleClick = () => {
    onNewChat?.();
    onClose?.();
  };
  return /* @__PURE__ */ jsx3(Tooltip, { title: "Nueva conversaci\xF3n", children: /* @__PURE__ */ jsx3("span", { children: compact ? /* @__PURE__ */ jsx3(IconButton2, { size: "small", color: "primary", disabled: !canSend, onClick: handleClick, "aria-label": "Nueva conversaci\xF3n", children: /* @__PURE__ */ jsx3(Icon3, { icon: "mdi:plus", size: 20 }) }) : /* @__PURE__ */ jsx3(Button, { variant: "contained", size: "small", disabled: !canSend, startIcon: /* @__PURE__ */ jsx3(Icon3, { icon: "mdi:plus", size: 16 }), onClick: handleClick, children: "Nueva" }) }) });
}
function ChatSidebarBody({
  jwt,
  displayScope,
  sessionUser,
  canSend,
  canAuditChat = false,
  jwtLoading,
  needsJwt,
  listScope,
  sessionScopeLoading,
  viewingAuditOther,
  convListOwnerLabel,
  convListHeader,
  loadingList,
  rows,
  selectedId,
  convListMeta,
  convListPage,
  convListPageSize,
  convListSearch,
  onConvListSearchChange,
  onOpenAudit,
  onNewChat,
  onOpenConv,
  onDelete,
  onConvListPageChange,
  onConvListPageSizeChange,
  onClose
}) {
  const handleOpenConv = (id) => {
    onOpenConv(id);
    onClose?.();
  };
  return /* @__PURE__ */ jsxs3(Fragment2, { children: [
    /* @__PURE__ */ jsx3(Box3, { className: "conv-log-sidebar-block paty-chat-sidebar-meta", sx: { pt: 0.75, pb: 0.75, flexShrink: 0 }, children: /* @__PURE__ */ jsx3(
      ChatSessionPanel,
      {
        claims: jwt?.claims ?? null,
        displayScope,
        sessionUser,
        ownerDisplayName: resolveOwnerDisplayName(jwt, displayScope),
        canSend,
        jwtLoading,
        canAudit: canAuditChat,
        onOpenAudit
      }
    ) }),
    /* @__PURE__ */ jsx3(Divider, { sx: { my: 1 } }),
    /* @__PURE__ */ jsxs3(Box3, { className: "conv-log-sidebar-block paty-chat-sidebar-list-head", sx: { flexShrink: 0, pb: 0.5 }, children: [
      /* @__PURE__ */ jsxs3(Stack, { direction: "row", alignItems: "flex-start", spacing: 0.75, sx: { mb: 0.5, minWidth: 0 }, children: [
        /* @__PURE__ */ jsxs3(Typography3, { variant: "caption", color: "text.secondary", sx: { flex: 1, minWidth: 0, fontWeight: 600 }, children: [
          "Conversaciones",
          (jwt?.token || listScope) && (convListHeader || convListOwnerLabel) ? /* @__PURE__ */ jsx3(Stack, { direction: "row", spacing: 0.5, alignItems: "center", useFlexGap: true, flexWrap: "wrap", sx: { mt: 0.25 }, children: /* @__PURE__ */ jsx3(Typography3, { variant: "caption", sx: { fontWeight: 500, color: "text.primary" }, children: convListHeader || convListOwnerLabel }) }) : null,
          needsJwt ? /* @__PURE__ */ jsx3(Typography3, { component: "span", variant: "caption", sx: { display: "block", color: "info.main", mt: 0.25 }, children: listScope?.nombre ? `${listScope.nombre} \xB7 modo lectura` : sessionScopeLoading ? "Buscando tus conversaciones\u2026" : "Sin contacto identificado \xB7 filtra por usuario" }) : null
        ] }),
        /* @__PURE__ */ jsx3(Box3, { sx: { flexShrink: 0, pt: 0.1 }, children: /* @__PURE__ */ jsx3(ChatNewConversationButton, { canSend, onNewChat, onClose }) })
      ] }),
      /* @__PURE__ */ jsx3(
        ConvSearchAutocomplete,
        {
          rows,
          loading: loadingList,
          search: convListSearch,
          onSearchChange: onConvListSearchChange,
          selectedId,
          onSelectConv: handleOpenConv,
          disabled: needsJwt && !listScope?.icontacto
        }
      )
    ] }),
    /* @__PURE__ */ jsxs3(
      Box3,
      {
        className: "conv-log-sidebar-block paty-chat-sidebar-list-scroll",
        sx: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" },
        children: [
          /* @__PURE__ */ jsx3(Box3, { className: "paty-chat-sidebar-list-inner", sx: { flex: 1, minHeight: 0, overflow: "auto" }, children: /* @__PURE__ */ jsxs3(List, { dense: true, disablePadding: true, children: [
            loadingList && !rows.length && /* @__PURE__ */ jsx3(Box3, { sx: { py: 2, textAlign: "center" }, children: /* @__PURE__ */ jsx3(CircularProgress2, { size: 22 }) }),
            rows.map((r) => {
              const convTitle = r.titulo || "Sin t\xEDtulo";
              const convTip = `${r.iconversacion} \xB7 ${convTitle}`;
              return /* @__PURE__ */ jsxs3(
                ListItemButton,
                {
                  className: "paty-chat-conv-item",
                  selected: Number(selectedId) > 0 && Number(selectedId) === Number(r.iconversacion),
                  onClick: () => handleOpenConv(r.iconversacion),
                  title: convTip,
                  "aria-label": convTip,
                  sx: {
                    py: 0.5,
                    px: 0,
                    minHeight: 36,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 0.5
                  },
                  children: [
                    /* @__PURE__ */ jsx3(
                      ListItemText,
                      {
                        sx: { flex: 1, minWidth: 0, m: 0 },
                        primary: /* @__PURE__ */ jsxs3(Stack, { direction: "row", spacing: 0.5, alignItems: "center", className: "paty-chat-conv-item__title", sx: { minWidth: 0, pointerEvents: "none" }, children: [
                          /* @__PURE__ */ jsx3("span", { className: "paty-chat-conv-id-badge", children: r.iconversacion }),
                          /* @__PURE__ */ jsx3(Typography3, { component: "span", variant: "body2", noWrap: true, sx: { fontWeight: 600, minWidth: 0, flex: 1 }, children: convTitle })
                        ] }),
                        secondary: /* @__PURE__ */ jsx3(
                          Typography3,
                          {
                            component: "span",
                            variant: "caption",
                            color: "text.secondary",
                            noWrap: true,
                            className: "paty-chat-conv-item__meta",
                            sx: { pointerEvents: "none", display: "block", lineHeight: 1.3, opacity: 0.5 },
                            children: `${formatTs(r.fhultact)} \xB7 ${r.qmensajes ?? 0} msgs`
                          }
                        ),
                        slotProps: {
                          primary: { sx: { pointerEvents: "none", mb: 0.2 } },
                          secondary: { sx: { pointerEvents: "none", m: 0, opacity: 0.5 } }
                        }
                      }
                    ),
                    canSend && convBelongsToJwt(r, jwt.claims) ? /* @__PURE__ */ jsx3(IconButton2, { size: "small", color: "error", "aria-label": "Eliminar", className: "paty-chat-conv-item__delete", onClick: (e) => {
                      e.stopPropagation();
                      onDelete(r.iconversacion);
                    }, sx: { flexShrink: 0, mr: 0 }, children: /* @__PURE__ */ jsx3(Icon3, { icon: "mdi:delete-outline", size: 16 }) }) : null
                  ]
                },
                r.iconversacion
              );
            })
          ] }) }),
          convListMeta ? /* @__PURE__ */ jsx3(Box3, { className: "conv-log-sidebar-block paty-chat-sidebar-list-foot paty-chat-sidebar-list-foot--sticky", sx: { flexShrink: 0, pt: 0.5, pb: 0.5, px: 0 }, children: /* @__PURE__ */ jsxs3(Box3, { className: "paty-chat-conv-pager", role: "navigation", "aria-label": "Paginaci\xF3n de conversaciones", children: [
            /* @__PURE__ */ jsxs3(
              Typography3,
              {
                component: "span",
                variant: "caption",
                className: "paty-chat-conv-pager__meta",
                "aria-label": `P\xE1gina ${convListMeta.page} de ${Math.max(convListMeta.pages, 1)}`,
                children: [
                  convListMeta.page,
                  "/",
                  Math.max(convListMeta.pages, 1)
                ]
              }
            ),
            /* @__PURE__ */ jsxs3(Stack, { direction: "row", spacing: 0.35, alignItems: "center", className: "paty-chat-conv-pager__controls", children: [
              onConvListPageSizeChange ? /* @__PURE__ */ jsx3(
                Tooltip,
                {
                  title: "Conversaciones por p\xE1gina",
                  slotProps: { popper: { sx: { pointerEvents: "none" } } },
                  children: /* @__PURE__ */ jsx3(FormControl, { className: "paty-chat-conv-pager__size", sx: { m: 0, minWidth: 44 }, children: /* @__PURE__ */ jsx3(
                    Select,
                    {
                      size: "small",
                      value: convListPageSize,
                      onChange: (e) => onConvListPageSizeChange(Number(e.target.value)),
                      "aria-label": "Conversaciones por p\xE1gina",
                      disabled: loadingList,
                      variant: "outlined",
                      MenuProps: { PaperProps: { sx: { "& .MuiMenuItem-root": { minHeight: 24, py: 0.2, fontSize: "0.68rem" } } } },
                      children: CONV_LIST_PAGE_SIZE_OPTIONS.map((n) => /* @__PURE__ */ jsx3(MenuItem, { value: n, children: n }, n))
                    }
                  ) })
                }
              ) : null,
              convListMeta.pages > 1 ? /* @__PURE__ */ jsxs3(Stack, { direction: "row", spacing: 0.5, className: "paty-chat-conv-pager__nav", children: [
                /* @__PURE__ */ jsx3(Tooltip, { title: "P\xE1gina anterior", children: /* @__PURE__ */ jsx3("span", { children: /* @__PURE__ */ jsx3(
                  IconButton2,
                  {
                    size: "small",
                    className: "paty-chat-conv-pager__btn",
                    "aria-label": "P\xE1gina anterior",
                    disabled: loadingList || convListPage <= 1,
                    onClick: () => onConvListPageChange((p) => Math.max(1, p - 1)),
                    children: /* @__PURE__ */ jsx3(Icon3, { icon: "mdi:chevron-left", size: 16 })
                  }
                ) }) }),
                /* @__PURE__ */ jsx3(Tooltip, { title: "P\xE1gina siguiente", children: /* @__PURE__ */ jsx3("span", { children: /* @__PURE__ */ jsx3(
                  IconButton2,
                  {
                    size: "small",
                    className: "paty-chat-conv-pager__btn",
                    "aria-label": "P\xE1gina siguiente",
                    disabled: loadingList || convListPage >= convListMeta.pages,
                    onClick: () => onConvListPageChange((p) => p + 1),
                    children: /* @__PURE__ */ jsx3(Icon3, { icon: "mdi:chevron-right", size: 16 })
                  }
                ) }) })
              ] }) : null
            ] })
          ] }) }) : null
        ]
      }
    )
  ] });
}
function ChatThreadSidebar({
  jwt,
  displayScope,
  sessionUser,
  canInteract,
  viewOnly,
  jwtLoading,
  canSend,
  canAuditChat = false,
  needsJwt,
  listScope,
  sessionScopeLoading,
  viewingAuditOther,
  auditScope,
  convListOwnerLabel,
  convListHeader,
  loadingList,
  rows,
  selectedId,
  convListMeta,
  convListPage,
  convListPageSize = CONV_LIST_PAGE_SIZE_DEFAULT,
  convListSearch = "",
  onConvListSearchChange,
  messageSource = "logs",
  mode = CHAT_MODE_PATYIA,
  llmProvider = CHAT_PROVIDER_OPENAI,
  onMessageSourceChange,
  onChatModeChange,
  onLlmProviderChange,
  onOpenJwt,
  onOpenAudit,
  onNewChat,
  onOpenConv,
  onDelete,
  onConvListPageChange,
  onConvListPageSizeChange,
  drawerMode = false,
  splitMode = false,
  onClose
}) {
  const bodyProps = {
    jwt,
    displayScope,
    sessionUser,
    canSend,
    canAuditChat,
    jwtLoading,
    needsJwt,
    listScope,
    sessionScopeLoading,
    viewingAuditOther,
    convListOwnerLabel,
    convListHeader,
    loadingList,
    rows,
    selectedId,
    convListMeta,
    convListPage,
    convListPageSize,
    convListSearch,
    onConvListSearchChange,
    onOpenAudit,
    onNewChat,
    onOpenConv,
    onDelete,
    onConvListPageChange,
    onConvListPageSizeChange,
    onClose
  };
  if (splitMode) {
    return /* @__PURE__ */ jsx3(
      Box3,
      {
        className: "paty-chat-sidebar-inner",
        sx: { display: "flex", flexDirection: "column", minHeight: 0, height: "100%", overflow: "hidden" },
        children: /* @__PURE__ */ jsx3(ChatSidebarBody, { ...bodyProps })
      }
    );
  }
  return /* @__PURE__ */ jsxs3(
    Box3,
    {
      className: "conv-log-sidebar paty-chat-sidebar",
      sx: {
        position: "relative",
        width: drawerMode ? "100%" : { xs: "100%", md: CHAT_SIDEBAR_W },
        flexShrink: 0,
        borderRight: drawerMode ? 0 : { md: 0 },
        borderBottom: drawerMode ? 0 : { xs: 1, md: 0 },
        borderColor: "divider",
        bgcolor: "background.paper",
        display: drawerMode ? "flex" : { xs: "none", md: "flex" },
        flexDirection: "column",
        minHeight: 0,
        height: drawerMode ? "100%" : "auto",
        maxHeight: drawerMode ? "100%" : { xs: "42vh", md: "none" },
        overflow: drawerMode ? "hidden" : "visible",
        boxSizing: "border-box"
      },
      children: [
        onClose || onMessageSourceChange || onChatModeChange || onLlmProviderChange ? /* @__PURE__ */ jsx3(
          Stack,
          {
            direction: "row",
            spacing: 1,
            alignItems: "center",
            justifyContent: "flex-end",
            className: "conv-log-sidebar-block",
            sx: { py: 0.5, borderBottom: 1, borderColor: "divider", flexShrink: 0 },
            children: /* @__PURE__ */ jsx3(
              ChatSidebarHeaderActions,
              {
                onClose,
                messageSource,
                mode,
                llmProvider,
                onMessageSourceChange,
                onChatModeChange,
                onLlmProviderChange
              }
            )
          }
        ) : null,
        /* @__PURE__ */ jsx3(ChatSidebarBody, { ...bodyProps })
      ]
    }
  );
}
export {
  ChatNewConversationButton,
  ChatSidebarHeaderActions,
  ChatThreadSidebar
};
