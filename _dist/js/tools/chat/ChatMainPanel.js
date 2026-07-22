var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
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
function lightboxApi() {
  const api = window.ISAComponents?.LightboxZoom;
  if (!api?.LightboxZoomDialog) {
    throw new Error("ISAComponents.LightboxZoom no cargado \u2014 recargue sin cach\xE9 (Ctrl+Shift+R).");
  }
  return api;
}
function CodeMirrorPanel(props) {
  const Panel = window.ISAFront?.CodeMirrorPanel;
  if (!Panel) throw new Error("CodeMirrorPanel no cargado \u2014 recargue sin cach\xE9 (Ctrl+Shift+R).");
  return Panel(props);
}
var bridge, UI, Session, Config, getReact, getMaterialUI, Lightbox;
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
    Lightbox = {
      get ImageLightboxDialog() {
        return lightboxApi().LightboxZoomDialog;
      },
      get LightboxImage() {
        return lightboxApi().LightboxZoomImage;
      },
      get useImageLightboxZoom() {
        return lightboxApi().useLightboxZoom;
      }
    };
  }
});

// js/boot/cdn.mjs
var cdn_exports = {};
__export(cdn_exports, {
  CDN: () => CDN,
  LIGHTBOX_ZOOM_REF: () => LIGHTBOX_ZOOM_REF,
  PIN: () => PIN,
  SWAGGER_VIEWER_REF: () => SWAGGER_VIEWER_REF,
  asset: () => asset,
  ensureLightboxZoom: () => ensureLightboxZoom,
  ensureSwaggerViewer: () => ensureSwaggerViewer,
  ensureSwaggerViewerCss: () => ensureSwaggerViewerCss,
  lightboxZoomBase: () => lightboxZoomBase,
  swaggerViewerBase: () => swaggerViewerBase
});
function useLocalMonorepoCdn() {
  if (!isDevHost2) return false;
  try {
    const q = new URLSearchParams(location.search);
    if (q.get("isa_cdn") === "remote") return false;
    if (q.get("isa_cdn") === "local" || q.get("isa_cdn") === "monorepo") return true;
    try {
      if (localStorage.getItem("isa-patyia:local-cdn") === "1") {
        localStorage.removeItem("isa-patyia:local-cdn");
      }
    } catch {
    }
    return false;
  } catch {
    return false;
  }
}
function frontSharedCdnBase() {
  const base = document.querySelector("base")?.href || location.href;
  return new URL("../../components/front-shared/cdn/", base).href.replace(/\/?$/, "/");
}
function vendorCdnBase() {
  const base = document.querySelector("base")?.href || location.href;
  return new URL("vendor/front-shared/", base).href.replace(/\/?$/, "/");
}
function lightboxZoomBase() {
  const base = document.querySelector("base")?.href || location.href;
  if (isDevHost2) {
    const q = new URLSearchParams(location.search);
    if (q.get("isa_cdn") === "remote") {
      return `https://cdn.jsdelivr.net/gh/Jeff-Aporta/lightbox-zoom@${LIGHTBOX_ZOOM_REF}/cdn/`;
    }
    if (q.get("isa_cdn") === "monorepo" || q.get("isa_cdn") === "local") {
      return new URL("../../components/lightbox/cdn/", base).href.replace(/\/?$/, "/");
    }
    const sameOrigin = new URL("vendor/lightbox/cdn/", base).href.replace(/\/?$/, "/");
    return sameOrigin;
  }
  return `https://cdn.jsdelivr.net/gh/Jeff-Aporta/lightbox-zoom@${LIGHTBOX_ZOOM_REF}/cdn/`;
}
function ensureLightboxStylesheet(href) {
  if (document.querySelector("[data-isa-lb-zoom-css]")) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute("data-isa-lb-zoom-css", "1");
    link.onload = () => resolve();
    link.onerror = () => reject(new Error("No se pudo cargar " + href));
    document.head.appendChild(link);
  });
}
function ensureLightboxScript(src) {
  if (globalThis.ISAComponents?.LightboxZoom?.LightboxZoomDialog) {
    return Promise.resolve();
  }
  const stale = document.querySelector("script[data-isa-lb-zoom-js]");
  if (stale) stale.remove();
  return new Promise((resolve, reject) => {
    const el = document.createElement("script");
    el.src = src;
    el.setAttribute("data-isa-lb-zoom-js", "1");
    el.onload = () => {
      if (!globalThis.ISAComponents?.LightboxZoom?.LightboxZoomDialog) {
        reject(new Error("LightboxZoom no registr\xF3 ISAComponents.LightboxZoom"));
        return;
      }
      resolve();
    };
    el.onerror = () => reject(new Error("No se pudo cargar " + src));
    document.head.appendChild(el);
  });
}
async function ensureLightboxZoom(base = lightboxZoomBase()) {
  const b = base.endsWith("/") ? base : base + "/";
  await ensureLightboxStylesheet(b + "lightbox-zoom.min.css");
  await ensureLightboxScript(b + "lightbox-zoom.min.js");
  return globalThis.ISAComponents.LightboxZoom;
}
function swaggerViewerBase() {
  const base = document.querySelector("base")?.href || location.href;
  if (isDevHost2) {
    const q = new URLSearchParams(location.search);
    if (q.get("isa_cdn") === "remote") {
      return `${location.origin}/api/swagger/cdn/`;
    }
    if (q.get("isa_cdn") === "monorepo" || q.get("isa_cdn") === "local") {
      return new URL("../../components/swagger/cdn/", base).href.replace(/\/?$/, "/");
    }
    return new URL("../../components/swagger/cdn/", base).href.replace(/\/?$/, "/");
  }
  return `${location.origin}/api/swagger/cdn/`;
}
function ensureSwaggerStylesheet(href) {
  if (document.querySelector("[data-isa-sw-css]")) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute("data-isa-sw-css", "1");
    link.onload = () => resolve();
    link.onerror = () => reject(new Error("No se pudo cargar " + href));
    document.head.appendChild(link);
  });
}
async function ensureSwaggerViewerCss(base = swaggerViewerBase()) {
  const b = base.endsWith("/") ? base : base + "/";
  await ensureSwaggerStylesheet(b + "swagger-viewer.min.css");
  return b;
}
async function ensureSwaggerViewer(base = swaggerViewerBase()) {
  const b = await ensureSwaggerViewerCss(base);
  if (!globalThis.ISAComponents?.Swagger?.bootSwaggerApp) {
    await import(b + "swagger-viewer.min.js");
  }
  if (!globalThis.ISAComponents?.Swagger?.bootSwaggerApp) {
    throw new Error("Swagger no registr\xF3 ISAComponents.Swagger");
  }
  return globalThis.ISAComponents.Swagger;
}
var PIN, isDevHost2, JSDELIVR_CDN, CDN, asset, LIGHTBOX_ZOOM_REF, SWAGGER_VIEWER_REF;
var init_cdn = __esm({
  "js/boot/cdn.mjs"() {
    PIN = "a13fc29";
    isDevHost2 = typeof location !== "undefined" && /localhost|127\.0\.0\.1|\[::1\]/.test(location.hostname);
    JSDELIVR_CDN = `https://cdn.jsdelivr.net/gh/Jeff-Aporta/front-shared@${PIN}/cdn/`;
    CDN = !isDevHost2 ? vendorCdnBase() : useLocalMonorepoCdn() ? frontSharedCdnBase() : typeof location !== "undefined" && new URLSearchParams(location.search).get("isa_cdn") === "remote" ? JSDELIVR_CDN : vendorCdnBase();
    asset = (p) => isDevHost2 ? `${CDN}${p}` : `${CDN}${p}?v=${PIN}`;
    LIGHTBOX_ZOOM_REF = "4dd6595";
    SWAGGER_VIEWER_REF = "859035b";
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
function formatConversacionPostBodyPreview(body, { maxUrl = 80 } = {}) {
  const clone = JSON.parse(JSON.stringify(body));
  const summarize = (u, label, i) => {
    const s = String(u ?? "");
    if (s.length <= maxUrl + 24) return s;
    if (s.startsWith("data:") || s.startsWith("http")) {
      const mime = s.startsWith("data:") ? s.slice(5, s.indexOf(";")) || "?" : "url";
      return `${s.slice(0, maxUrl)}\u2026 [${mime}, ${s.length.toLocaleString("es-CO")} chars, ${label} ${i + 1}]`;
    }
    return `${s.slice(0, maxUrl)}\u2026`;
  };
  if (Array.isArray(clone.imagenes)) clone.imagenes = clone.imagenes.map((img, i) => summarize(img, "img", i));
  if (Array.isArray(clone.audios)) clone.audios = clone.audios.map((a, i) => summarize(a, "audio", i));
  return JSON.stringify(clone, null, 2);
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
function roleKey2(name) {
  return String(name ?? "").trim().toUpperCase();
}
function isDevBranchRole(roleName) {
  return roleKey2(roleName) === "DEVISS";
}
function readViewAsRole() {
  try {
    const v = roleKey2(localStorage.getItem(VIEW_AS_ROLE_LS_KEY));
    if (!v || v === "DEVISS") return "";
    if (!ROLE_CAPS_PRESETS[v]) return "";
    return v;
  } catch {
    return "";
  }
}
function writeViewAsRole(roleName) {
  const key = roleKey2(roleName);
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
var PATYIA_JWT_STORAGE_KEY, PATYIA_API_BASE;
var init_patyia_jwt = __esm({
  "js/core/patyia-jwt.ts"() {
    init_portalJwtApi();
    init_apiClient();
    init_platform();
    PATYIA_JWT_STORAGE_KEY = "isa-patyia:paty-jwt";
    PATYIA_API_BASE = "https://ayudascp-ia-staging.azurewebsites.net/api";
  }
});

// js/tools/chat/ChatMainPanel.jsx
init_platform();

// js/core/convLog.ts
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
function formatUsageTokens(n) {
  if (n == null || !Number.isFinite(n) || n <= 0) return "\u2014";
  return n.toLocaleString("es-CO");
}
function formatUsageUsd(n) {
  if (n == null || !Number.isFinite(n) || n <= 0) return "\u2014";
  if (n >= 0.01) return `$${n.toFixed(4)}`;
  if (n >= 1e-4) return `$${n.toFixed(6)}`;
  return `$${n.toFixed(8)}`;
}
function formatMoneyWithTokens(usd, tokenCount) {
  const m = formatUsageUsd(usd);
  const t = Number(tokenCount ?? 0) || 0;
  if (m === "\u2014" && t <= 0) return "\u2014";
  if (m === "\u2014") return `(${t.toLocaleString("es-CO")}t)`;
  if (t <= 0) return m;
  return `${m} (${t.toLocaleString("es-CO")}t)`;
}
function formatUsageBreakdownParts(tokens, cost) {
  const tk = tokens || {};
  const c = cost || {};
  const labelFull = { in: "Input", cache: "Cache", out: "Output", total: "Total" };
  const parts = [
    { key: "in", label: "in", usd: Number(c.input_usd ?? 0) || 0, tok: Number(tk.input ?? 0) || 0 },
    { key: "cache", label: "cache", usd: Number(c.cached_usd ?? 0) || 0, tok: Number(tk.cached ?? 0) || 0 },
    { key: "out", label: "out", usd: Number(c.output_usd ?? 0) || 0, tok: Number(tk.output ?? 0) || 0 }
  ];
  const totalUsd = Number(c.total_usd ?? 0) || parts.reduce((s, p) => s + p.usd, 0);
  const totalTok = Number(tk.total ?? 0) || 0;
  parts.push({ key: "total", label: "\u03A3", usd: totalUsd, tok: totalTok });
  return parts.map((p) => ({
    key: p.key,
    label: p.label,
    labelFull: labelFull[p.key] || p.label,
    usd: p.usd,
    tok: p.tok,
    usdText: formatUsageUsd(p.usd),
    tokText: p.tok > 0 ? `${formatUsageTokens(p.tok)} t` : "\u2014",
    display: formatMoneyWithTokens(p.usd, p.tok),
    hasData: p.usd > 0 || p.tok > 0
  }));
}
function formatUsageSummary(tokens, cost) {
  const tk = tokens || {};
  const c = cost || {};
  const totalTok = Number(tk.total ?? 0) || 0;
  const totalUsd = Number(c.total_usd ?? 0) || Number(c.input_usd ?? 0) + Number(c.cached_usd ?? 0) + Number(c.output_usd ?? 0) || 0;
  return { tokens: totalTok, usd: totalUsd, tokensText: totalTok > 0 ? `${formatUsageTokens(totalTok)} t` : "\u2014", usdText: formatUsageUsd(totalUsd), hasData: totalTok > 0 || totalUsd > 0 };
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
function threadHasUsageStats(mensajes) {
  return (mensajes || []).some((m) => sideLogPanelWorthShowing(m));
}
function sideLogPanelWorthShowing(msg) {
  if (!msg) return false;
  const meta = msg.meta;
  if (meta) {
    if (String(meta.itdconsulta ?? "").trim()) return true;
    if (Array.isArray(meta.premisas) && meta.premisas.length) return true;
    if (String(meta.extra?.operativa_key ?? "").trim()) return true;
    const tk = meta.tokens?.total ? meta.tokens : tokensFromUsage(meta.usage);
    if ((Number(tk?.total ?? 0) || 0) > 0) return true;
    if (Number(meta.latency_ms ?? 0) > 0) return true;
    if (String(meta.model ?? "").trim()) return true;
    if (meta.modelo_autoswitch_vision) return true;
    if (Array.isArray(meta.archivos_citados) && meta.archivos_citados.length) return true;
    if (Array.isArray(meta.file_search) && meta.file_search.length) return true;
  }
  const s = msg.usageStats;
  if (!s) return false;
  return usageHasData(s.tokens, s.cost) || !msg.esUsuario && usageHasData(s.previousTokens, s.previousCost);
}
function formatLatencySeconds(latencyMs) {
  const ms = Number(latencyMs);
  if (!Number.isFinite(ms) || ms <= 0) return "";
  return `${(ms / 1e3).toFixed(2)} s`;
}
var CONV_LOG_PAD = { p: { xs: 1.25, sm: 2, md: 3 } };
function convLogSurfaceSx(extra = {}) {
  return { flex: 1, minHeight: 0, overflow: "auto", bgcolor: "transparent", ...CONV_LOG_PAD, ...extra };
}

// js/ui/ConvLogThread.jsx
init_platform();

// js/ui/ConvLogWebView.jsx
init_platform();
init_platform();

// js/ui/shared.jsx
init_platform();
init_platform();

// js/ui/ImageLightboxDialog.jsx
init_platform();
init_platform();

// js/core/lightboxBoot.ts
function isLightboxZoomReady() {
  return Boolean(globalThis.ISAComponents?.LightboxZoom?.LightboxZoomDialog);
}
var loadPromise = null;
function ensureLightboxReady() {
  if (isLightboxZoomReady()) {
    return Promise.resolve(globalThis.ISAComponents.LightboxZoom);
  }
  if (!loadPromise) {
    loadPromise = Promise.resolve().then(() => (init_cdn(), cdn_exports)).then((m) => m.ensureLightboxZoom()).catch((err) => {
      loadPromise = null;
      throw err;
    });
  }
  return loadPromise;
}

// js/ui/ImageLightboxDialog.jsx
import { jsx } from "react/jsx-runtime";
var { useEffect, useState } = getReact();
function ImageLightboxDialog(props) {
  const { open, onClose } = props;
  const [ready, setReady] = useState(() => isLightboxZoomReady());
  const [loadError, setLoadError] = useState(null);
  useEffect(() => {
    if (!open || ready) return void 0;
    let cancelled = false;
    ensureLightboxReady().then(() => {
      if (!cancelled) setReady(true);
    }).catch((err) => {
      if (!cancelled) setLoadError(err);
    });
    return () => {
      cancelled = true;
    };
  }, [open, ready]);
  if (!open) return null;
  if (loadError) {
    const { Typography: Typography6, Box: Box8 } = getMaterialUI();
    return /* @__PURE__ */ jsx(Box8, { sx: { p: 2, textAlign: "center" }, children: /* @__PURE__ */ jsx(Typography6, { variant: "body2", color: "error", children: "No se pudo cargar el visor de im\xE1genes. Recargue sin cach\xE9 (Ctrl+Shift+R)." }) });
  }
  if (!ready) return null;
  const Comp = Lightbox.ImageLightboxDialog;
  return /* @__PURE__ */ jsx(Comp, { ns: "ISA", ...props, onClose });
}

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
  fullScreen = false,
  paperMaxWidth,
  paperSx,
  paperClassName = "",
  slotProps,
  ...rest
} = {}) {
  const { loginDialogProps } = isaLoginSurface();
  const paper = glassPaperProps(maxWidth, paperClassName);
  if (paperMaxWidth) paper.sx = { ...paper.sx, maxWidth: paperMaxWidth };
  if (paperSx) paper.sx = { ...paper.sx, ...paperSx };
  if (fullScreen) {
    paper.sx = {
      ...paper.sx,
      m: 0,
      margin: 0,
      maxWidth: "100%",
      width: "100%",
      height: "100%",
      maxHeight: "100dvh",
      borderRadius: 0,
      border: "none",
      boxShadow: "none"
    };
  }
  const shared = {
    open,
    onClose,
    maxWidth: fullScreen ? false : maxWidth,
    fullWidth,
    fullScreen,
    scroll: "paper",
    className: `isa-login-dialog isa-glass-dialog${fullScreen ? " isa-glass-dialog--fullscreen" : ""}`,
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
function GlassDialogCloseActions({ onClose, label = "Cerrar" }) {
  const { DialogActions, Button: Button4 } = getMaterialUI();
  return /* @__PURE__ */ jsx2(DialogActions, { sx: glassDialogActionsSx(), children: /* @__PURE__ */ jsx2(Button4, { onClick: onClose, sx: { textTransform: "none", fontWeight: 600, minWidth: 72 }, children: label }) });
}
function GlassDialogHeader({ icon = "mdi:information-outline", title, subtitle, accent = "#1e90ff", onClose }) {
  const { Box: Box8, Typography: Typography6, IconButton: IconButton5, Stack: Stack4 } = getMaterialUI();
  const { Icon: Icon7 } = UI;
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
  return /* @__PURE__ */ jsxs(Box8, { className: "isa-glass-dialog__header", sx: { position: "relative", flexShrink: 0 }, children: [
    /* @__PURE__ */ jsx2(Box8, { sx: bandSx, children: /* @__PURE__ */ jsxs(Stack4, { direction: "row", spacing: 1.25, alignItems: "center", sx: { pr: onClose ? 4 : 0 }, children: [
      /* @__PURE__ */ jsx2(Box8, { sx: iconSx, children: /* @__PURE__ */ jsx2(Icon7, { icon, size: 24 }) }),
      /* @__PURE__ */ jsxs(Box8, { sx: { flex: 1, minWidth: 0 }, children: [
        /* @__PURE__ */ jsx2(Typography6, { variant: "h5", component: "h2", sx: titleSx, children: title }),
        subtitle ? /* @__PURE__ */ jsx2(Typography6, { variant: "caption", color: "text.secondary", display: "block", sx: { mt: 0.35, lineHeight: 1.4 }, children: subtitle }) : null
      ] })
    ] }) }),
    onClose ? /* @__PURE__ */ jsx2(IconButton5, { size: "small", onClick: onClose, "aria-label": "Cerrar", className: "isa-glass-dialog__close", sx: { position: "absolute", top: 10, right: 10 }, children: /* @__PURE__ */ jsx2(Icon7, { icon: "mdi:close", size: 18 }) }) : null
  ] });
}
function GlassDialog({ children, header = null, maxWidth, fullWidth, fullScreen, paperMaxWidth, paperSx, paperClassName, slotProps, ...dialogProps }) {
  const { Dialog } = getMaterialUI();
  const props = resolveGlassDialogProps({ maxWidth, fullWidth, fullScreen, paperMaxWidth, paperSx, paperClassName, slotProps, ...dialogProps });
  return /* @__PURE__ */ jsxs(Dialog, { ...props, children: [
    header,
    children
  ] });
}
function resolveUsageDialogHeader(msgLabel, fecha, opKey) {
  const label = String(msgLabel || "Mensaje").trim();
  const isOp = /^OP\s*·/i.test(label) || Boolean(opKey);
  return {
    title: `Uso \xB7 ${label}`,
    subtitle: [fecha, opKey].filter(Boolean).join(" \xB7 ") || void 0,
    icon: isOp ? "mdi:cog-transfer-outline" : "mdi:chart-box-outline",
    accent: isOp ? "#f59e0b" : "#34d399"
  };
}
function isGenericMetaRole(rol) {
  const r = String(rol || "").trim().toLowerCase();
  return !r || r === "user" || r === "usuario" || r === "assistant" || r === "asistente";
}
function resolveMetaDialogHeader(title, isUserMessage = false) {
  const rol = String(title || "").replace(/^Trazabilidad\s*·\s*/i, "").trim();
  if (isUserMessage || /^user$/i.test(rol) || /^usuario$/i.test(rol)) {
    return { title: "Trazabilidad", subtitle: void 0, icon: "mdi:account-outline", accent: "#60a5fa" };
  }
  if (/^OP\s*·/i.test(rol) || /operativa/i.test(rol)) {
    return { title: "Trazabilidad", subtitle: rol, icon: "mdi:cog-transfer-outline", accent: "#f59e0b" };
  }
  if (isGenericMetaRole(rol)) {
    return { title: "Trazabilidad", subtitle: void 0, icon: "mdi:robot-outline", accent: "#1e90ff" };
  }
  return { title: "Trazabilidad", subtitle: rol, icon: "mdi:robot-outline", accent: "#1e90ff" };
}

// js/core/fileSearchTrace.js
function archivosCitadosFromTrace(trace) {
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const call of trace ?? []) {
    for (const fr of call?.results ?? []) {
      const name = String(fr?.filename ?? "").trim();
      if (!name || seen.has(name)) continue;
      seen.add(name);
      out.push(name);
    }
  }
  return out;
}
function fileSearchTraceCalls(meta) {
  const fs = meta?.file_search ?? meta?.others?.file_search;
  return Array.isArray(fs) && fs.length ? fs : [];
}
function fileSearchSummary(meta) {
  const fs = meta?.file_search ?? meta?.others?.file_search;
  if (!fs || Array.isArray(fs) || typeof fs !== "object") return null;
  return fs;
}
function vectorStoresFromMeta(meta) {
  const ids = [];
  const pushId = (id) => {
    const s = String(id ?? "").trim();
    if (!s || ids.includes(s)) return;
    ids.push(s);
  };
  const direct = meta?.vector_store_ids ?? meta?.vectorStoreIds;
  if (Array.isArray(direct)) direct.forEach(pushId);
  const summary = fileSearchSummary(meta);
  if (Array.isArray(summary?.vector_store_ids)) summary.vector_store_ids.forEach(pushId);
  for (const call of fileSearchTraceCalls(meta)) {
    for (const id of call?.vector_store_ids ?? []) pushId(id);
  }
  if (Array.isArray(meta?.clasificador_vector_usado)) meta.clasificador_vector_usado.forEach(pushId);
  for (const c of compactChunksFromMeta(meta)) {
    if (c.vectorStoreId) pushId(c.vectorStoreId);
  }
  return ids.map((id, index) => ({ index, id }));
}
function vectorStoreIndexLabel(vectorStores, vsId) {
  const id = String(vsId ?? "").trim();
  if (!id || !vectorStores?.length) return null;
  const hit = vectorStores.find((v) => v.id === id);
  return hit != null ? hit.index : null;
}
function archivosCitadosFromMeta(meta) {
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  const push = (name) => {
    const n = String(name ?? "").trim();
    if (!n || seen.has(n)) return;
    seen.add(n);
    out.push(n);
  };
  for (const x of meta?.archivos_citados ?? []) push(x);
  const summary = fileSearchSummary(meta);
  if (Array.isArray(summary?.archivos_citados)) {
    for (const x of summary.archivos_citados) push(x);
  }
  for (const name of archivosCitadosFromTrace(fileSearchTraceCalls(meta))) push(name);
  for (const c of compactChunksFromMeta(meta)) {
    if (c.filename) push(c.filename);
  }
  return out;
}
function fileSearchFromMeta(meta) {
  return fileSearchTraceCalls(meta);
}
function metaHasFileSearch(meta) {
  return archivosCitadosFromMeta(meta).length > 0 || vectorStoresFromMeta(meta).length > 0 || chunksFromMeta(meta).length > 0 || Boolean(fileSearchTraceCalls(meta).length);
}
function readCompactChunkList(meta) {
  const summary = fileSearchSummary(meta);
  const fromMeta = Array.isArray(meta?.chunks) ? meta.chunks : [];
  const fromSummary = Array.isArray(summary?.chunks) ? summary.chunks : [];
  return fromMeta.length ? fromMeta : fromSummary;
}
function compactChunksFromMeta(meta) {
  const list = readCompactChunkList(meta);
  const out = [];
  for (let i = 0; i < list.length; i += 1) {
    const c = list[i] || {};
    const text = String(c.text ?? c.snippet ?? "").trim();
    const filename = String(c.filename ?? "").trim();
    const fileId = String(c.file_id ?? "").trim();
    const vectorStoreId = String(c.vector_store_id ?? "").trim();
    if (!text && !filename && !fileId) continue;
    out.push({
      key: `compact-${fileId || filename || i}`,
      filename,
      fileId,
      score: typeof c.score === "number" ? c.score : null,
      text,
      vectorStoreId: vectorStoreId || void 0,
      queries: [],
      callIndex: 0,
      callId: ""
    });
  }
  return out;
}
function chunksFromMeta(meta) {
  const trace = fileSearchTraceCalls(meta);
  const out = [];
  if (trace.length) {
    for (let ci = 0; ci < trace.length; ci += 1) {
      const call = trace[ci] || {};
      const results = Array.isArray(call?.results) ? call.results : [];
      const queries = Array.isArray(call?.queries) ? call.queries : [];
      const callId = String(call?.id ?? "").trim();
      for (let ri = 0; ri < results.length; ri += 1) {
        const fr = results[ri] || {};
        const text = String(fr?.text ?? "").trim();
        if (!text) continue;
        const filename = String(fr?.filename ?? "").trim();
        const fileId = String(fr?.file_id ?? "").trim();
        const score = typeof fr?.score === "number" ? fr.score : null;
        const vectorStoreId = String(fr?.vector_store_id ?? "").trim() || void 0;
        out.push({
          key: `${callId || ci}-${fileId || filename || ri}`,
          callIndex: ci,
          callId,
          filename,
          fileId,
          score,
          text,
          queries,
          vectorStoreId
        });
      }
    }
  }
  if (!out.length) return compactChunksFromMeta(meta);
  return out;
}
function chunkPreview(text, max = 360) {
  const t = String(text ?? "").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trimEnd()}\u2026`;
}
function compactFileChipLabel(filename, maxLen = 28) {
  const full = String(filename ?? "").trim();
  if (!full) return "";
  const base = full.split(/[/\\]/).pop() || full;
  if (base.length <= maxLen) return base;
  const dot = base.lastIndexOf(".");
  const ext = dot > 0 ? base.slice(dot) : "";
  const stemMax = maxLen - ext.length - 1;
  if (stemMax > 4) return `${base.slice(0, stemMax)}\u2026${ext}`;
  return `${base.slice(0, maxLen - 1)}\u2026`;
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
function isOpenAiPmptId(id) {
  return /^pmpt_/i.test(String(id ?? "").trim());
}
function bdInstructionKey(meta) {
  const id = String(meta?.prompt_id ?? "").trim();
  return id && !isOpenAiPmptId(id) ? id : "";
}
function instructionKeyFromMeta(meta) {
  return bdInstructionKey(meta) || String(meta?.extra?.operativa_key ?? "").trim();
}
var USAGE_METRIC_COLS = [
  { key: "in", label: "Entrada" },
  { key: "cache", label: "Cach\xE9" },
  { key: "out", label: "Salida" },
  { key: "total", label: "Total" },
  { key: "reason", label: "Razon." }
];
function buildUsageRowMetrics(tokens, cost) {
  const tk = tokens || {};
  const parts = formatUsageBreakdownParts(tokens, cost);
  const byKey = Object.fromEntries(parts.map((p) => [p.key, p]));
  const reasonTok = Number(tk.reasoning ?? 0) || 0;
  return USAGE_METRIC_COLS.map((col) => {
    if (col.key === "reason") {
      return { key: col.key, tok: reasonTok, usd: 0, hasData: reasonTok > 0 };
    }
    const p = byKey[col.key];
    const tok = Number(p?.tok ?? 0) || 0;
    const usd = Number(p?.usd ?? 0) || 0;
    return { key: col.key, tok, usd, hasData: tok > 0 || usd > 0 };
  });
}
function UsageMetricCell({ tok, usd, showUsd = true }) {
  const tokLabel = formatUsageTokens(tok);
  const usdLabel = showUsd ? formatUsageUsd(usd) : null;
  const empty = tokLabel === "\u2014" && (!showUsd || usdLabel === "\u2014");
  return /* @__PURE__ */ jsxs2("span", { className: `meta-prompt-stat__usage-grid-cell${empty ? " meta-prompt-stat__usage-grid-cell--empty" : ""}`, children: [
    /* @__PURE__ */ jsx3("span", { className: "meta-prompt-stat__usage-tok", children: tokLabel }),
    showUsd ? /* @__PURE__ */ jsx3("span", { className: "meta-prompt-stat__usage-usd", children: usdLabel }) : null
  ] });
}
function MetaUsageGrid({ sections, hideRowLabels = false, className = "" }) {
  const rows = (sections || []).map((s) => ({
    ...s,
    metrics: buildUsageRowMetrics(s.tokens, s.cost)
  }));
  const visibleCols = USAGE_METRIC_COLS.filter(
    (col) => rows.some((r) => r.metrics.find((m) => m.key === col.key)?.hasData)
  );
  if (!visibleCols.length) return null;
  const gridTemplateColumns = hideRowLabels ? `repeat(${visibleCols.length}, minmax(5.5rem, 1fr))` : `5.75rem repeat(${visibleCols.length}, minmax(5.5rem, 1fr))`;
  const gridStyle = { display: "grid", gridTemplateColumns };
  return /* @__PURE__ */ jsxs2("div", { className: `meta-prompt-stat__usage-grid ${className}`.trim(), children: [
    /* @__PURE__ */ jsxs2("div", { className: "meta-prompt-stat__usage-grid-head", style: gridStyle, children: [
      !hideRowLabels ? /* @__PURE__ */ jsx3("span", { className: "meta-prompt-stat__usage-grid-corner", "aria-hidden": "true" }) : null,
      visibleCols.map((col) => /* @__PURE__ */ jsx3("span", { className: "meta-prompt-stat__usage-grid-col-h", children: col.label }, col.key))
    ] }),
    rows.map((row) => /* @__PURE__ */ jsxs2("div", { className: `meta-prompt-stat__usage-grid-row meta-prompt-stat__usage-grid-row--${row.key}`, style: gridStyle, children: [
      !hideRowLabels ? /* @__PURE__ */ jsx3("span", { className: `meta-prompt-stat__usage-group-label meta-prompt-stat__usage-group-label--${row.key}`, children: row.label }) : null,
      visibleCols.map((col) => {
        const metric = row.metrics.find((m) => m.key === col.key);
        const usd = col.key === "reason" ? 0 : metric?.usd ?? 0;
        return /* @__PURE__ */ jsx3(
          UsageMetricCell,
          {
            tok: metric?.tok ?? 0,
            usd,
            showUsd: col.key !== "reason"
          },
          col.key
        );
      })
    ] }, row.key))
  ] });
}
function UsageMetricsGrid(props) {
  return MetaUsageGrid(props);
}
function filterDisplayableImages(list) {
  return (list || []).filter((src) => {
    const s = String(src || "").trim();
    if (!s || /^\[file_id:/i.test(s)) return false;
    return s.startsWith("data:image/") || /^https?:\/\//i.test(s);
  });
}
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
function shortId(s, head = 10, tail = 4) {
  if (!s) return "";
  return s.length <= head + tail + 1 ? s : `${s.slice(0, head)}\u2026${s.slice(-tail)}`;
}
function metaWorthDialog(meta, isUser) {
  if (!meta) return false;
  if (!isUser) return true;
  if (String(meta.prompt_markdown ?? "").trim()) return true;
  if (filterDisplayableImages(meta.imagenes).length) return true;
  const tk = meta.tokens?.total ? meta.tokens : tokensFromUsage(meta.usage);
  if (tk?.total > 0 || meta.usage) return true;
  if (meta.latency_ms != null && meta.latency_ms > 0) return true;
  if (meta.itdconsulta || meta.model || meta.premisas?.length) return true;
  if (bdInstructionKey(meta)) return true;
  if (meta.stream_ok === false) return true;
  if (meta.extra?.operativa_key) return true;
  if (Array.isArray(meta.archivos_citados) && meta.archivos_citados.length) return true;
  if (Array.isArray(meta.file_search) && meta.file_search.length) return true;
  if (meta.file_search && typeof meta.file_search === "object" && !Array.isArray(meta.file_search)) return true;
  if (Array.isArray(meta.vector_store_ids) && meta.vector_store_ids.length) return true;
  const pv = meta.prompt_variables;
  if (pv && typeof pv === "object") {
    if (Object.keys(pv).some((k) => k !== "nombre_usuario")) return true;
  }
  return false;
}
function FileSearchMetaSection({ meta }) {
  const { Typography: Typography6, Box: Box8, Stack: Stack4, Chip: Chip3, IconButton: IconButton5, Tooltip: Tooltip4 } = getMaterialUI();
  const { useState: useState7, useMemo: useMemo7 } = getReact();
  const trace = fileSearchFromMeta(meta);
  const archivos = archivosCitadosFromMeta(meta);
  const chunks = useMemo7(() => chunksFromMeta(meta), [meta]);
  const vectorStores = useMemo7(() => vectorStoresFromMeta(meta), [meta]);
  const [expandedKey, setExpandedKey] = useState7(null);
  const [openChunk, setOpenChunk] = useState7(null);
  if (!trace?.length && !archivos.length && !chunks.length && !vectorStores.length) return null;
  function toggleChunk(key) {
    setExpandedKey((prev) => prev === key ? null : key);
  }
  return /* @__PURE__ */ jsxs2(Box8, { className: "meta-file-search", sx: { mt: 1.5 }, children: [
    vectorStores.length ? /* @__PURE__ */ jsxs2(Box8, { className: "meta-file-search__vector-stores", sx: { mb: 1.5 }, children: [
      /* @__PURE__ */ jsx3(Typography6, { variant: "subtitle2", fontWeight: 700, sx: { mb: 0.75 }, children: "Vector stores consultados" }),
      /* @__PURE__ */ jsxs2(Typography6, { variant: "caption", color: "text.secondary", display: "block", sx: { mb: 0.75 }, children: [
        "\xCDndice = posici\xF3n en ",
        /* @__PURE__ */ jsx3("code", { children: "vector_store_ids" }),
        " enviado al modelo (0 = primero). Usa el ID completo para verificar en OpenAI/BD."
      ] }),
      /* @__PURE__ */ jsx3(Stack4, { spacing: 0.5, children: vectorStores.map((vs) => /* @__PURE__ */ jsxs2(
        Box8,
        {
          className: "meta-file-search__vs-row",
          sx: {
            display: "flex",
            flexWrap: "wrap",
            alignItems: "baseline",
            gap: 0.75,
            fontSize: "0.82rem"
          },
          children: [
            /* @__PURE__ */ jsx3(Chip3, { size: "small", variant: "outlined", label: `\xEDndice ${vs.index}`, className: "meta-file-search__vs-index" }),
            /* @__PURE__ */ jsx3(Typography6, { component: "code", variant: "body2", sx: { wordBreak: "break-all", fontFamily: "monospace" }, children: vs.id })
          ]
        },
        vs.id
      )) })
    ] }) : null,
    /* @__PURE__ */ jsx3(Typography6, { variant: "subtitle2", fontWeight: 700, sx: { mb: 0.75 }, children: "File Search (archivos citados)" }),
    archivos.length ? /* @__PURE__ */ jsx3(Stack4, { direction: "row", spacing: 0.5, flexWrap: "wrap", useFlexGap: true, sx: { mb: chunks.length ? 1 : 0 }, children: archivos.map((name) => /* @__PURE__ */ jsx3(
      Chip3,
      {
        size: "small",
        variant: "outlined",
        icon: /* @__PURE__ */ jsx3("iconify-icon", { icon: "mdi:file-document-outline", width: "14", height: "14" }),
        label: name,
        title: name
      },
      name
    )) }) : null,
    chunks.length ? /* @__PURE__ */ jsx3(Stack4, { spacing: 0.5, className: "meta-file-search__chunk-list", children: chunks.map((c) => {
      const expanded = expandedKey === c.key;
      const vsIdx = c.vectorStoreId ? vectorStoreIndexLabel(vectorStores, c.vectorStoreId) : null;
      const label = c.filename || c.fileId || "fragmento";
      return /* @__PURE__ */ jsxs2(
        Box8,
        {
          className: `meta-file-search__chunk${expanded ? " meta-file-search__chunk--expanded" : ""}`,
          children: [
            /* @__PURE__ */ jsxs2(
              Box8,
              {
                className: "meta-file-search__chunk-summary",
                role: "button",
                tabIndex: 0,
                "aria-expanded": expanded,
                title: label,
                onClick: () => toggleChunk(c.key),
                onKeyDown: (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleChunk(c.key);
                  }
                },
                children: [
                  /* @__PURE__ */ jsx3("iconify-icon", { icon: "mdi:text-box-search-outline", width: "15", height: "15", "aria-hidden": true }),
                  /* @__PURE__ */ jsx3(Typography6, { variant: "body2", fontWeight: 600, noWrap: true, className: "meta-file-search__chunk-title", children: label }),
                  vsIdx != null ? /* @__PURE__ */ jsx3(
                    Chip3,
                    {
                      size: "small",
                      variant: "outlined",
                      label: `VS ${vsIdx}`,
                      title: c.vectorStoreId || void 0,
                      className: "meta-file-search__vs-chip"
                    }
                  ) : null,
                  c.score != null ? /* @__PURE__ */ jsx3(
                    Chip3,
                    {
                      size: "small",
                      variant: "outlined",
                      label: Number(c.score).toFixed(3),
                      className: "meta-file-search__score"
                    }
                  ) : null,
                  /* @__PURE__ */ jsx3(Tooltip4, { title: "Ver en pantalla completa", children: /* @__PURE__ */ jsx3(
                    IconButton5,
                    {
                      size: "small",
                      "aria-label": `Ver fragmento de ${label}`,
                      className: "meta-file-search__open",
                      onClick: (e) => {
                        e.stopPropagation();
                        setOpenChunk(c);
                      },
                      children: /* @__PURE__ */ jsx3("iconify-icon", { icon: "mdi:fullscreen", width: "15", height: "15" })
                    }
                  ) }),
                  /* @__PURE__ */ jsx3(
                    "iconify-icon",
                    {
                      icon: "mdi:chevron-down",
                      width: "18",
                      height: "18",
                      className: `meta-file-search__chevron${expanded ? " meta-file-search__chevron--open" : ""}`,
                      "aria-hidden": true
                    }
                  )
                ]
              }
            ),
            expanded ? /* @__PURE__ */ jsxs2(Box8, { className: "meta-file-search__chunk-body", children: [
              c.queries?.length ? /* @__PURE__ */ jsxs2(Typography6, { variant: "caption", color: "text.secondary", display: "block", className: "meta-file-search__queries", children: [
                "Queries: ",
                c.queries.join(" \xB7 ")
              ] }) : null,
              /* @__PURE__ */ jsx3(MdRenderer, { source: c.text || "", className: "meta-file-search__md" })
            ] }) : null
          ]
        },
        c.key
      );
    }) }) : null,
    /* @__PURE__ */ jsx3(
      MdFullPageDialog,
      {
        open: Boolean(openChunk),
        onClose: () => setOpenChunk(null),
        source: openChunk?.text || "",
        title: openChunk ? `Fragmento \xB7 ${openChunk.filename || openChunk.fileId || "texto exacto"}` : "Fragmento",
        subtitle: openChunk ? [
          openChunk.vectorStoreId ? `VS \xEDndice ${vectorStoreIndexLabel(vectorStores, openChunk.vectorStoreId) ?? "?"} \xB7 ${openChunk.vectorStoreId}` : "",
          openChunk.score != null ? `score ${Number(openChunk.score).toFixed(3)}` : "",
          openChunk.queries?.length ? `Queries: ${openChunk.queries.join(" \xB7 ")}` : ""
        ].filter(Boolean).join("  \xB7  ") : "",
        accent: "#7c3aed",
        icon: "mdi:text-box-search-outline"
      }
    )
  ] });
}
function FileSearchDialog({ open, onClose, meta, title = "File Search", subtitle = "" }) {
  const { DialogContent: DialogContent2 } = getMaterialUI();
  if (!meta || !metaHasFileSearch(meta)) return null;
  const headerMeta = resolveMetaDialogHeader(title, false);
  return /* @__PURE__ */ jsxs2(GlassDialog, { open, onClose, maxWidth: "md", fullWidth: true, children: [
    /* @__PURE__ */ jsx3(
      GlassDialogHeader,
      {
        icon: headerMeta.icon,
        title: headerMeta.title,
        subtitle: subtitle || "Archivos citados y fragmentos consultados",
        accent: headerMeta.accent,
        onClose
      }
    ),
    /* @__PURE__ */ jsx3(DialogContent2, { dividers: true, sx: glassDialogContentSx(), children: /* @__PURE__ */ jsx3(FileSearchMetaSection, { meta }) }),
    /* @__PURE__ */ jsx3(GlassDialogCloseActions, { onClose })
  ] });
}
function MdRenderer({ source, className = "" }) {
  const html = mdToHtml(String(source ?? ""));
  return /* @__PURE__ */ jsx3(
    "div",
    {
      className: `md-renderer isa-md-content ${className}`.trim(),
      dangerouslySetInnerHTML: { __html: html }
    }
  );
}
function MdFullPageDialog({
  open,
  onClose,
  source,
  title = "Visor full-page",
  subtitle = "",
  accent = "#1e90ff",
  icon = "mdi:file-document-outline"
}) {
  const { Dialog, DialogTitle, DialogContent: DialogContent2, IconButton: IconButton5, Typography: Typography6, Box: Box8 } = getMaterialUI();
  const { Icon: Icon7 } = UI;
  const html = mdToHtml(String(source ?? ""));
  return /* @__PURE__ */ jsxs2(
    Dialog,
    {
      open: Boolean(open),
      onClose,
      fullScreen: true,
      scroll: "paper",
      className: "md-full-page-dialog",
      PaperProps: {
        sx: {
          backgroundImage: (theme2) => `linear-gradient(160deg, ${theme2.palette.mode === "light" ? "#f8fbff" : "#0b1220"} 0%, ${theme2.palette.mode === "light" ? "#e8f1ff" : "#0f1a30"} 100%)`
        }
      },
      children: [
        /* @__PURE__ */ jsxs2(
          DialogTitle,
          {
            className: "md-full-page-dialog__head",
            sx: {
              display: "flex",
              alignItems: "center",
              gap: 1,
              borderBottom: 1,
              borderColor: "divider",
              py: 0.75,
              px: { xs: 1.5, sm: 2 },
              minHeight: 0
            },
            children: [
              /* @__PURE__ */ jsx3(
                Box8,
                {
                  sx: {
                    width: 28,
                    height: 28,
                    borderRadius: "0.4rem",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: `linear-gradient(135deg, ${accent}, ${accent}99)`,
                    color: "#fff",
                    flexShrink: 0,
                    boxShadow: `0 2px 8px ${accent}44`
                  },
                  children: /* @__PURE__ */ jsx3(Icon7, { icon, size: 16 })
                }
              ),
              /* @__PURE__ */ jsxs2(Box8, { sx: { flex: 1, minWidth: 0, lineHeight: 1.2 }, children: [
                /* @__PURE__ */ jsx3(Typography6, { variant: "subtitle1", fontWeight: 700, noWrap: true, sx: { lineHeight: 1.25, fontSize: "0.95rem" }, children: title }),
                subtitle ? /* @__PURE__ */ jsx3(Typography6, { variant: "caption", color: "text.secondary", noWrap: true, sx: { display: "block", lineHeight: 1.3, mt: 0.15, fontSize: "0.72rem" }, children: subtitle }) : null
              ] }),
              /* @__PURE__ */ jsx3(IconButton5, { onClick: onClose, "aria-label": "Cerrar visor", size: "small", sx: { p: 0.5 }, children: /* @__PURE__ */ jsx3("iconify-icon", { icon: "mdi:close", width: "16", height: "16" }) })
            ]
          }
        ),
        /* @__PURE__ */ jsx3(
          DialogContent2,
          {
            dividers: true,
            sx: {
              px: { xs: 2, sm: 3, md: 4, lg: 5 },
              py: { xs: 2, sm: 2.5, md: 3 },
              width: "100%",
              maxWidth: "100%",
              boxSizing: "border-box"
            },
            children: /* @__PURE__ */ jsx3(
              "div",
              {
                className: "md-full-page-dialog__body isa-md-content",
                dangerouslySetInnerHTML: { __html: html }
              }
            )
          }
        )
      ]
    }
  );
}

// js/ui/ConvLogWebView.jsx
init_platform();
import { Fragment as Fragment2, jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";
var { useMemo: useMemo2, useState: useState3, useRef, useEffect: useEffect3, memo } = getReact();
function useOperativaEnterIds(mensajes, threadKey, { enabled = true } = {}) {
  const seenIdsRef = useRef(/* @__PURE__ */ new Set());
  const primedKeyRef = useRef(null);
  const [enterIds, setEnterIds] = useState3(() => /* @__PURE__ */ new Set());
  useEffect3(() => {
    if (primedKeyRef.current === threadKey) return;
    primedKeyRef.current = threadKey;
    seenIdsRef.current = /* @__PURE__ */ new Set();
    setEnterIds(/* @__PURE__ */ new Set());
  }, [threadKey]);
  useEffect3(() => {
    if (!enabled) return;
    const msgs = mensajes || [];
    if (primedKeyRef.current !== threadKey) return;
    if (!seenIdsRef.current.size && msgs.length) {
      for (const m of msgs) seenIdsRef.current.add(m.idMsg);
      return;
    }
    const nextEnter = /* @__PURE__ */ new Set();
    const newlySeen = [];
    for (const m of msgs) {
      if (seenIdsRef.current.has(m.idMsg)) continue;
      seenIdsRef.current.add(m.idMsg);
      newlySeen.push(m);
      if (m.esOperativa) nextEnter.add(m.idMsg);
    }
    if (nextEnter.size && newlySeen.length === 1) {
      setEnterIds((prev) => /* @__PURE__ */ new Set([...prev, ...nextEnter]));
    }
  }, [mensajes, threadKey, enabled]);
  return enterIds;
}
var ROLE_META = {
  user: { icon: "mdi:account-outline", title: "Usuario", accent: "#1e90ff" },
  assistant: { icon: "mdi:robot-outline", title: "PatyIA", accent: "#10b981" },
  operativa: { icon: "mdi:cog-outline", title: "Operativa", accent: "#f59e0b" }
};
var ROLE_META_CHAT = {
  ...ROLE_META,
  operativa: { icon: "mdi:cog-sync-outline", title: "Operativa", accent: "#f59e0b" }
};
function roleMetaFor(msg, compactMeta) {
  const rk = roleKey(msg);
  const table = compactMeta ? ROLE_META_CHAT : ROLE_META;
  return table[rk] || ROLE_META.assistant;
}
function roleKey(msg) {
  if (msg.esOperativa) return "operativa";
  if (msg.esUsuario) return "user";
  return "assistant";
}
function msgStoredUserName(msg) {
  return msg.nombreUsuario || msg.meta?.nombre_usuario || msg.meta?.prompt_variables?.nombre_usuario || "";
}
function looksLikeUsername(name, nick) {
  const n = String(name ?? "").trim().toUpperCase();
  const k = String(nick ?? "").trim().toUpperCase();
  return Boolean(n && k && (n === k || n.split("@")[0] === k.split("@")[0]));
}
function roleTitle(msg, chatUserDisplayName, chatUserNick) {
  if (msg.esOperativa) return msg.rol || "Operativa";
  if (msg.esUsuario) {
    const fromMsg = String(msgStoredUserName(msg)).trim();
    if (fromMsg && !looksLikeUsername(fromMsg, chatUserNick) && /\s/.test(fromMsg)) return fromMsg;
    if (chatUserDisplayName) return chatUserDisplayName;
    if (fromMsg && !looksLikeUsername(fromMsg, chatUserNick)) return fromMsg;
    return "Usuario";
  }
  return "PatyIA";
}
function roleUserCaption(msg, chatUserNick) {
  if (!msg.esUsuario) return "";
  const nick = String(chatUserNick ?? "").trim();
  if (nick) return nick;
  const fromMsg = String(msgStoredUserName(msg)).trim().split("@")[0];
  return fromMsg && !/\s/.test(fromMsg) ? fromMsg : "";
}
function SectionCard({ icon, title, titleCaption, accent, children, id, onMeta, metaChips, align = "left", muted = false, operativa = false, fecha, fechaIso, streaming = false, footerExtra = null, compact = false }) {
  const { Paper, Stack: Stack4, Typography: Typography6, Box: Box8, IconButton: IconButton5, Tooltip: Tooltip4 } = getMaterialUI();
  const { Icon: Icon7 } = UI;
  const color = accent || "#1e90ff";
  const isRight = align === "right";
  const softMuted = muted && !operativa;
  const fullNeon = !compact;
  return /* @__PURE__ */ jsxs3(
    Paper,
    {
      id,
      className: [
        "conv-msg-card",
        streaming ? "conv-msg-card--streaming" : "",
        compact ? "conv-msg-card--compact" : "conv-msg-card--full",
        operativa ? "conv-msg-card--operativa" : "conv-msg-card--neon"
      ].filter(Boolean).join(" "),
      elevation: 0,
      sx: (theme2) => {
        const isLight = theme2.palette.mode === "light";
        const base = {
          borderRadius: fullNeon ? "0.75rem" : "0.5rem",
          overflow: "hidden",
          border: 1,
          scrollMarginTop: 12,
          width: fullNeon ? "fit-content" : "100%",
          maxWidth: "100%"
        };
        if (softMuted) {
          return {
            ...base,
            borderColor: theme2.palette.action.disabled,
            bgcolor: theme2.palette.action.hover,
            boxShadow: "none",
            transition: "none"
          };
        }
        if (isLight) {
          return {
            ...base,
            borderColor: `${color}52`,
            bgcolor: operativa ? "#fffbeb" : "#ffffff",
            boxShadow: "none",
            transition: "none"
          };
        }
        return {
          ...base,
          borderColor: `${color}40`,
          bgcolor: "background.paper",
          boxShadow: fullNeon ? `0 4px 24px rgba(0, 0, 0, 0.28), 0 0 0 1px ${color}28` : operativa ? `0 4px 20px ${color}18` : `0 4px 24px rgba(0, 0, 0, 0.22), 0 0 0 1px ${color}22`,
          transition: fullNeon ? "transform 0.2s ease, box-shadow 0.2s ease" : "none",
          ...fullNeon ? {
            "&:hover": {
              transform: { sm: "translateY(-2px)" },
              boxShadow: `0 8px 32px rgba(0, 0, 0, 0.35), 0 0 24px ${color}22`
            }
          } : {}
        };
      },
      children: [
        /* @__PURE__ */ jsxs3(
          Box8,
          {
            className: "conv-msg-card__header",
            sx: (theme2) => {
              const isLight = theme2.palette.mode === "light";
              const base = {
                px: compact ? { xs: 1.25, sm: 1.5 } : { xs: 2, sm: 2.5 },
                py: compact ? 1 : 1.5,
                borderBottom: 1,
                borderColor: "divider"
              };
              if (fullNeon) {
                if (isLight) {
                  return {
                    ...base,
                    bgcolor: `${color}12`,
                    ...isRight ? { borderRight: 4, borderRightColor: color } : { borderLeft: 4, borderLeftColor: color }
                  };
                }
                return {
                  ...base,
                  background: isRight ? `linear-gradient(270deg, ${color}28, transparent 72%)` : `linear-gradient(90deg, ${color}28, transparent 72%)`,
                  ...isRight ? { borderRight: 4, borderRightColor: color } : { borderLeft: 4, borderLeftColor: color }
                };
              }
              if (operativa) {
                return {
                  ...base,
                  bgcolor: isLight ? `${color}14` : void 0,
                  background: isLight ? void 0 : `linear-gradient(90deg, ${color}30, transparent 72%)`
                };
              }
              if (isLight) {
                return {
                  ...base,
                  bgcolor: `${color}10`
                };
              }
              return {
                ...base,
                background: isRight ? `linear-gradient(270deg, ${color}24, transparent 72%)` : `linear-gradient(90deg, ${color}24, transparent 72%)`
              };
            },
            children: [
              /* @__PURE__ */ jsxs3(
                Stack4,
                {
                  direction: "row",
                  spacing: 1.25,
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  useFlexGap: true,
                  sx: { flexDirection: isRight ? "row-reverse" : "row" },
                  children: [
                    /* @__PURE__ */ jsxs3(
                      Stack4,
                      {
                        direction: "row",
                        spacing: 1.25,
                        alignItems: "flex-start",
                        sx: { flex: 1, minWidth: 0, flexDirection: isRight ? "row-reverse" : "row" },
                        children: [
                          /* @__PURE__ */ jsx4(
                            Box8,
                            {
                              className: "conv-msg-card__icon",
                              sx: (theme2) => {
                                const isLight = theme2.palette.mode === "light";
                                return {
                                  width: compact ? 28 : 32,
                                  height: compact ? 28 : 32,
                                  borderRadius: fullNeon ? "0.5rem" : "0.375rem",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  background: operativa || !softMuted ? `linear-gradient(135deg, ${color}, ${color}99)` : `${color}88`,
                                  color: "#fff",
                                  boxShadow: isLight ? "none" : fullNeon ? `0 4px 16px ${color}55` : operativa || !softMuted ? `0 4px 14px ${color}44` : "none",
                                  flexShrink: 0,
                                  mt: 0.1
                                };
                              },
                              children: /* @__PURE__ */ jsx4(Icon7, { icon, size: 18 })
                            }
                          ),
                          /* @__PURE__ */ jsxs3(
                            Box8,
                            {
                              className: isRight ? "conv-msg-card__title conv-msg-card__title--right" : "conv-msg-card__title",
                              sx: {
                                minWidth: 0,
                                flex: 1,
                                ...isRight ? { pr: 1.25, textAlign: "right" } : { pl: 0 }
                              },
                              children: [
                                /* @__PURE__ */ jsx4(
                                  Typography6,
                                  {
                                    variant: compact ? "body2" : "subtitle1",
                                    sx: {
                                      fontWeight: 700,
                                      letterSpacing: -0.2,
                                      lineHeight: 1.25,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      ...isRight ? { pr: 0.5 } : {}
                                    },
                                    children: title
                                  }
                                ),
                                titleCaption ? /* @__PURE__ */ jsx4(
                                  Typography6,
                                  {
                                    variant: "caption",
                                    color: "text.secondary",
                                    sx: {
                                      display: "block",
                                      mt: 0.15,
                                      lineHeight: 1.2,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      fontWeight: 500,
                                      letterSpacing: "0.02em"
                                    },
                                    children: titleCaption
                                  }
                                ) : null
                              ]
                            }
                          )
                        ]
                      }
                    ),
                    onMeta && /* @__PURE__ */ jsx4(Tooltip4, { title: "Trazabilidad del mensaje", arrow: true, children: /* @__PURE__ */ jsx4(IconButton5, { size: "small", onClick: onMeta, "aria-label": "Ver trazabilidad", sx: { alignSelf: "flex-start", mt: -0.25 }, children: /* @__PURE__ */ jsx4(Icon7, { icon: "mdi:information-outline", size: 20 }) }) })
                  ]
                }
              ),
              metaChips ? /* @__PURE__ */ jsx4(Box8, { className: `conv-msg-card__meta-row${isRight ? " conv-msg-card__meta-row--right" : ""}`, children: metaChips }) : null
            ]
          }
        ),
        /* @__PURE__ */ jsx4(Box8, { sx: { p: compact ? { xs: 1.25, sm: 1.5 } : { xs: 2, sm: 2.5 } }, children }),
        fecha || footerExtra ? /* @__PURE__ */ jsx4(
          Box8,
          {
            className: "conv-msg-card__footer",
            sx: {
              px: { xs: 2, sm: 2.5 },
              py: 0.65,
              borderTop: 1,
              borderColor: "divider",
              bgcolor: softMuted ? "action.hover" : "transparent"
            },
            children: /* @__PURE__ */ jsxs3(
              Stack4,
              {
                direction: "row",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                useFlexGap: true,
                gap: 0.75,
                sx: { flexDirection: align === "right" ? "row-reverse" : "row" },
                children: [
                  footerExtra,
                  fecha ? /* @__PURE__ */ jsx4(
                    Typography6,
                    {
                      component: "time",
                      dateTime: fechaIso || void 0,
                      variant: "caption",
                      color: "text.secondary",
                      sx: {
                        fontSize: "0.68rem",
                        letterSpacing: "0.02em",
                        opacity: 0.85,
                        ml: align === "right" ? 0 : "auto",
                        mr: align === "right" ? "auto" : 0,
                        textAlign: align === "right" ? "right" : "left"
                      },
                      children: /* @__PURE__ */ jsx4("span", { className: "conv-msg-card__fecha", children: fecha })
                    }
                  ) : null
                ]
              }
            )
          }
        ) : null
      ]
    }
  );
}
function modelBadgeLabel(raw, maxLen = 28) {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  return s.length > maxLen ? shortId(s, 16, 10) : s;
}
function visionAutoswitchBadge(meta) {
  if (!meta?.modelo_autoswitch_vision) return null;
  const configured = String(meta.modelo_configurado ?? "").trim();
  const used = String(meta.model ?? "").trim();
  if (!configured) {
    return {
      tag: "Visi\xF3n",
      label: "autoswitch",
      title: used ? `Autoswitch visi\xF3n activo \xB7 modelo usado: ${used}` : "Autoswitch visi\xF3n por im\xE1genes adjuntas"
    };
  }
  const label = modelBadgeLabel(configured);
  return {
    tag: "Config",
    label,
    title: used && configured !== used ? `Autoswitch visi\xF3n: ${configured} \u2192 ${used}` : `Modelo configurado (${configured}); autoswitch visi\xF3n por im\xE1genes adjuntas`
  };
}
function formatUsageTs(ts) {
  const raw = String(ts || "").trim();
  if (!raw) return "";
  try {
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return raw;
    return d.toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "medium" });
  } catch {
    return raw;
  }
}
function friendlyItdconsulta(value) {
  const s = String(value || "").trim();
  if (!s) return s;
  if (/^DATOS_CONTAPYME_MCP$/i.test(s)) return "ContaPyme MCP \xB7 datos vivos";
  if (/^REQUIERE_CONTEXTO$/i.test(s)) return "Requiere contexto";
  return s.replace(/_/g, " ");
}
function buildUsageDialogCtxItems(meta) {
  const latency = formatLatencySeconds(meta?.latency_ms);
  const items = [];
  if (meta?.ts) {
    items.push({
      key: "ts",
      label: "Momento",
      value: formatUsageTs(meta.ts),
      icon: "mdi:clock-outline",
      mono: false
    });
  }
  if (meta?.modelo_autoswitch_vision) {
    const from = String(meta.modelo_configurado ?? "").trim();
    const to = String(meta.model ?? "").trim();
    if (from && to) {
      items.push({
        key: "vision_sw",
        label: "Autoswitch visi\xF3n",
        value: from === to ? `${from} (sin cambio)` : `${from} \u2192 ${to}`,
        icon: "mdi:eye-plus-outline",
        mono: true,
        wide: true,
        vision: true
      });
    } else {
      if (from) {
        items.push({ key: "model_from", label: "Modelo config.", value: from, icon: "mdi:cog-outline", mono: true, vision: true });
      }
      if (to) {
        items.push({ key: "model_to", label: "Modelo usado", value: to, icon: "mdi:robot-outline", mono: true, vision: true });
      }
      if (!from && !to) {
        items.push({
          key: "vision_sw",
          label: "Autoswitch visi\xF3n",
          value: "Activo (im\xE1genes adjuntas)",
          icon: "mdi:eye-plus-outline",
          mono: false,
          wide: true,
          vision: true
        });
      }
    }
  } else if (meta?.model) {
    items.push({ key: "model", label: "Modelo", value: meta.model, icon: "mdi:robot-outline", mono: true });
  }
  if (latency) {
    items.push({ key: "latency", label: "Latencia", value: latency, icon: "mdi:timer-outline", mono: true });
  }
  if (meta?.itdconsulta) {
    items.push({
      key: "itd",
      label: "Tipo",
      value: friendlyItdconsulta(meta.itdconsulta),
      icon: "mdi:tag-outline",
      mono: false,
      wide: /CONTAPYME|MCP/i.test(String(meta.itdconsulta))
    });
  } else {
    const opKey = String(meta?.extra?.operativa_key || "").trim();
    if (/^contapymeMcpSession$/i.test(opKey)) {
      items.push({
        key: "op",
        label: "Tipo",
        value: "ContaPyme MCP \xB7 sesi\xF3n / datos vivos",
        icon: "mdi:api",
        wide: true
      });
    } else if (/^contapymeMcpLogin$/i.test(opKey)) {
      items.push({
        key: "op",
        label: "Tipo",
        value: "ContaPyme MCP \xB7 login ASW",
        icon: "mdi:login-variant",
        wide: true
      });
    }
  }
  return items;
}
function compactMetaLabel(value, maxLen = 14) {
  const v = String(value ?? "").trim();
  if (!v) return v;
  if (v.length <= maxLen) return v;
  return `${v.slice(0, maxLen - 1)}\u2026`;
}
function chipRedundantWithTitle(label, cardTitle) {
  const chip = String(label ?? "").trim();
  const title = String(cardTitle ?? "").trim();
  if (!chip || !title) return false;
  if (chip === title) return true;
  const titleKey = title.replace(/^OP\s*·\s*/i, "").trim();
  return chip === titleKey;
}
var META_CHIP_TONE_CLASS = {
  context: "conv-msg-meta-chip--context",
  premisa: "conv-msg-meta-chip--premisa",
  operativa: "conv-msg-meta-chip--operativa",
  model: "conv-msg-meta-chip--model",
  metric: "conv-msg-meta-chip--metric",
  error: "conv-msg-meta-chip--error",
  vision: "conv-msg-meta-chip--vision",
  files: "conv-msg-meta-chip--context",
  neutral: ""
};
function MetaBadge({ tag, label, tone = "neutral", title, onClick }) {
  const toneClass = META_CHIP_TONE_CLASS[tone] || "";
  const clickable = typeof onClick === "function";
  const chipLabel = tone === "files" ? compactFileChipLabel(label) : compactMetaLabel(label);
  return /* @__PURE__ */ jsx4(
    UsageSummaryChip,
    {
      tag,
      label: chipLabel,
      title: title || label,
      className: `conv-msg-usage-chip conv-msg-meta-chip ${toneClass}${clickable ? " conv-msg-meta-chip--clickable" : ""}`.trim(),
      onClick,
      role: clickable ? "button" : void 0,
      tabIndex: clickable ? 0 : void 0
    }
  );
}
function buildMetaClassificationChips(meta, cardTitle = "", { isUser = false } = {}) {
  if (!meta) return [];
  const chips = [];
  if (meta.premisas?.length) {
    for (const p of meta.premisas) {
      if (chipRedundantWithTitle(p, cardTitle)) continue;
      chips.push({ key: `p-${p}`, label: p, tone: "premisa", title: `Premisa: ${p}` });
    }
  }
  if (meta.extra?.operativa_key && !chipRedundantWithTitle(meta.extra.operativa_key, cardTitle)) {
    chips.push({
      key: "op",
      label: meta.extra.operativa_key,
      tone: "operativa",
      title: `Consulta operativa: ${meta.extra.operativa_key}`
    });
  }
  if (meta.itdconsulta && !chipRedundantWithTitle(meta.itdconsulta, cardTitle)) {
    chips.push({
      key: "itd",
      label: meta.itdconsulta,
      tone: "context",
      title: `itdconsulta: ${meta.itdconsulta}`
    });
  }
  const instrKey = !isUser ? instructionKeyFromMeta(meta) : null;
  if (instrKey && instrKey !== meta.extra?.operativa_key && instrKey !== meta.itdconsulta && !chipRedundantWithTitle(instrKey, cardTitle)) {
    chips.push({ key: "pmpt", label: instrKey, tone: "context", title: `Instrucci\xF3n: ${instrKey}` });
  }
  return chips;
}
function MetaChipRow({ meta, isUser = false, hideUsageMetrics = false, hideClassificationChips = false, align = "left", cardTitle = "", onFileSearch }) {
  if (!meta) return null;
  const hideUsage = hideUsageMetrics || isUser;
  const tk = meta.tokens?.total ? meta.tokens : tokensFromUsage(meta.usage);
  const chips = hideClassificationChips ? [] : buildMetaClassificationChips(meta, cardTitle, { isUser });
  if (!hideUsage && meta.model) {
    chips.push({
      key: "model",
      label: meta.model,
      tone: "model",
      title: meta.modelo_autoswitch_vision ? "Modelo usado (autoswitch visi\xF3n)" : "Modelo LLM"
    });
  }
  if (!hideUsage && meta.modelo_autoswitch_vision) {
    const sw = visionAutoswitchBadge(meta);
    if (sw) {
      chips.push({ key: "vision-sw", label: sw.label, tone: "vision", title: sw.title });
    }
  }
  if (!hideUsage && meta.latency_ms != null && meta.latency_ms > 0) {
    chips.push({ key: "lat", label: `${meta.latency_ms}ms`, tone: "metric", title: "Latencia" });
  }
  if (!hideUsage && tk?.total > 0) {
    chips.push({ key: "tok", label: tk.total.toLocaleString("es-CO"), tone: "metric", title: `Tokens: ${tk.total}` });
  }
  if (meta.stream_ok === false) {
    chips.push({ key: "stream", label: "err", tone: "error", title: meta.stream_error || "Stream fall\xF3" });
  }
  if (!isUser) {
    const archivos = archivosCitadosFromMeta(meta);
    const openFileSearch = typeof onFileSearch === "function" ? () => onFileSearch(meta) : void 0;
    for (const name of archivos) {
      chips.push({
        key: `file-${name}`,
        label: name,
        tone: "files",
        title: openFileSearch ? `Ver fragmento consultado: ${name}` : name,
        onClick: openFileSearch
      });
    }
  }
  if (!chips.length) return null;
  const { Stack: Stack4 } = getMaterialUI();
  return /* @__PURE__ */ jsx4(
    Stack4,
    {
      direction: "row",
      spacing: 0.25,
      flexWrap: "wrap",
      useFlexGap: true,
      className: "conv-msg-meta-chips",
      sx: { justifyContent: align === "right" ? "flex-end" : "flex-start" },
      children: chips.map((c) => /* @__PURE__ */ jsx4(MetaBadge, { tag: c.tag, label: c.label, tone: c.tone, title: c.title, onClick: c.onClick }, c.key))
    }
  );
}
function extractContapymeLoginUrl(text, metaUrl) {
  const fromMeta = String(metaUrl || "").trim();
  if (/^https:\/\/ia\.contapyme\.com\/api\/login\/asw\?/i.test(fromMeta)) return fromMeta;
  const m = String(text || "").match(/https:\/\/ia\.contapyme\.com\/api\/login\/asw\?[^\s<>"'`]+/i);
  return m?.[0] ? m[0].replace(/[),.;]+$/, "") : null;
}
function scrubContapymeLoginFromText(text) {
  return String(text || "").replace(/https:\/\/ia\.contapyme\.com\/api\/login\/asw\?[^\s<>"'`]+/gi, "").replace(/^login_url:\s*.*$/gim, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}
function forceIframeWindowRelayout(iframe) {
  if (!iframe) return;
  const w = iframe.clientWidth || iframe.offsetWidth;
  const h = iframe.clientHeight || iframe.offsetHeight;
  if (w < 2 || h < 2) return;
  const prevW = iframe.style.width;
  const prevH = iframe.style.height;
  iframe.style.width = `${Math.max(2, w - 2)}px`;
  iframe.style.height = `${Math.max(2, h - 2)}px`;
  void iframe.offsetWidth;
  iframe.style.width = prevW || "100%";
  iframe.style.height = prevH || "100%";
  try {
    window.dispatchEvent(new Event("resize"));
  } catch {
  }
  try {
    iframe.contentWindow?.dispatchEvent?.(new Event("resize"));
  } catch {
  }
}
function scheduleIframeRelayout(iframe, delaysMs = [0, 50, 120, 250, 500, 900, 1600]) {
  if (!iframe) return () => {
  };
  const timers = delaysMs.map((ms) => window.setTimeout(() => forceIframeWindowRelayout(iframe), ms));
  return () => timers.forEach((id) => window.clearTimeout(id));
}
function ContapymeLoginEmbed({ url, onLoginDone }) {
  const { Box: Box8, Stack: Stack4, Button: Button4, DialogContent: DialogContent2 } = getMaterialUI();
  const { Icon: Icon7 } = UI;
  const [open, setOpen] = useState3(false);
  const [iframeSrc, setIframeSrc] = useState3(null);
  const iframeRef = useRef(null);
  const contentRef = useRef(null);
  const tabOpenedRef = useRef(false);
  const doneOnceRef = useRef(false);
  const cancelRelayoutRef = useRef(null);
  const signalDone = () => {
    if (doneOnceRef.current) return;
    doneOnceRef.current = true;
    onLoginDone?.();
  };
  const close = () => {
    cancelRelayoutRef.current?.();
    cancelRelayoutRef.current = null;
    setOpen(false);
    setIframeSrc(null);
    signalDone();
  };
  const mountIframeWhenSized = () => {
    let tries = 0;
    const tick = () => {
      const el = contentRef.current;
      const w = el?.clientWidth || 0;
      const h = el?.clientHeight || 0;
      if (w >= 80 && h >= 80) {
        setIframeSrc(url);
        return;
      }
      tries += 1;
      if (tries < 40) requestAnimationFrame(tick);
      else setIframeSrc(url);
    };
    requestAnimationFrame(() => requestAnimationFrame(tick));
  };
  useEffect3(() => {
    if (!open || !iframeSrc) return void 0;
    const iframe = iframeRef.current;
    const host = contentRef.current;
    cancelRelayoutRef.current?.();
    cancelRelayoutRef.current = scheduleIframeRelayout(iframe);
    let ro;
    if (host && typeof ResizeObserver !== "undefined") {
      let last = "";
      ro = new ResizeObserver(() => {
        const key = `${host.clientWidth}x${host.clientHeight}`;
        if (key === last) return;
        last = key;
        forceIframeWindowRelayout(iframeRef.current);
      });
      ro.observe(host);
    }
    return () => {
      cancelRelayoutRef.current?.();
      cancelRelayoutRef.current = null;
      ro?.disconnect();
    };
  }, [open, iframeSrc]);
  useEffect3(() => {
    if (!tabOpenedRef.current) return void 0;
    const onVis = () => {
      if (document.visibilityState === "visible") signalDone();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [url]);
  if (!url) return null;
  return /* @__PURE__ */ jsxs3(Fragment2, { children: [
    /* @__PURE__ */ jsxs3(
      Stack4,
      {
        className: "contapyme-login-embed",
        direction: { xs: "column", sm: "row" },
        spacing: 1,
        useFlexGap: true,
        sx: { mt: 1.5, alignItems: { xs: "stretch", sm: "center" } },
        children: [
          /* @__PURE__ */ jsx4(
            Button4,
            {
              variant: "contained",
              size: "medium",
              onClick: () => {
                doneOnceRef.current = false;
                setOpen(true);
              },
              startIcon: /* @__PURE__ */ jsx4(Icon7, { icon: "mdi:login-variant", size: 18 }),
              sx: { textTransform: "none", fontWeight: 700, alignSelf: { sm: "flex-start" } },
              children: "Iniciar sesi\xF3n ContaPyme\xAE"
            }
          ),
          /* @__PURE__ */ jsx4(
            Button4,
            {
              href: url,
              target: "_blank",
              rel: "noopener noreferrer",
              size: "small",
              variant: "text",
              onClick: () => {
                tabOpenedRef.current = true;
              },
              sx: { textTransform: "none", fontWeight: 600, alignSelf: { sm: "flex-start" } },
              children: "Abrir en pesta\xF1a"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx4(
      GlassDialog,
      {
        open,
        onClose: close,
        maxWidth: false,
        transitionDuration: 0,
        TransitionProps: {
          onEntered: mountIframeWhenSized
        },
        paperMaxWidth: "95vw",
        paperSx: {
          width: "95vw",
          height: "95vh",
          maxHeight: "95vh",
          m: "2.5vh auto",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        },
        header: /* @__PURE__ */ jsx4(
          GlassDialogHeader,
          {
            title: "Conectar ContaPyme\xAE",
            subtitle: "Sesi\xF3n ASW \xB7 inicia sesi\xF3n y cierra cuando veas \xABEn l\xEDnea\xBB",
            icon: "mdi:domain",
            accent: "#1e90ff",
            onClose: close
          }
        ),
        children: /* @__PURE__ */ jsx4(
          DialogContent2,
          {
            ref: contentRef,
            dividers: true,
            sx: {
              ...glassDialogContentSx({ p: 0 }),
              flex: "1 1 auto",
              minHeight: 0,
              height: "100%",
              position: "relative",
              overflow: "hidden",
              bgcolor: "#fff"
            },
            children: iframeSrc ? /* @__PURE__ */ jsx4(
              Box8,
              {
                component: "iframe",
                ref: iframeRef,
                src: iframeSrc,
                title: "Iniciar sesi\xF3n en ContaPyme",
                loading: "eager",
                referrerPolicy: "no-referrer-when-downgrade",
                sandbox: "allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-downloads",
                onLoad: () => {
                  cancelRelayoutRef.current?.();
                  cancelRelayoutRef.current = scheduleIframeRelayout(iframeRef.current);
                },
                sx: {
                  position: "absolute",
                  inset: 0,
                  border: 0,
                  width: "100%",
                  height: "100%",
                  display: "block"
                }
              },
              iframeSrc
            ) : null
          }
        )
      }
    )
  ] });
}
function MsgBody({ text, imagenes, audios, audiosTranscripcion, align = "left", onImageClick, streaming = false, loginUrl: loginUrlProp, disableLoginEmbed = false, onContapymeLoginDone }) {
  const { Typography: Typography6, Box: Box8 } = getMaterialUI();
  const raw = String(text || "");
  const placeholderOnly = /^\((?:imagen adjunta|nota de voz)\)$/i.test(raw.trim());
  const hasText = Boolean(raw.trim()) && !placeholderOnly;
  const loginUrl = disableLoginEmbed ? null : extractContapymeLoginUrl(raw, loginUrlProp);
  const displayRaw = disableLoginEmbed ? scrubContapymeLoginFromText(raw) : loginUrl ? raw.replace(loginUrl, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim() : raw;
  const html = mdToHtml(displayRaw || (loginUrl ? "Inicia sesi\xF3n en ContaPyme\xAE con el bot\xF3n de abajo." : ""));
  return /* @__PURE__ */ jsxs3(Fragment2, { children: [
    streaming && !hasText && !audios?.length ? /* @__PURE__ */ jsxs3(Box8, { className: "conv-stream-typing", "aria-label": "PatyIA est\xE1 escribiendo", role: "status", children: [
      /* @__PURE__ */ jsx4("span", {}),
      /* @__PURE__ */ jsx4("span", {}),
      /* @__PURE__ */ jsx4("span", {})
    ] }) : /* @__PURE__ */ jsxs3(Box8, { className: `conv-msg-body-wrap${streaming ? " conv-msg-body-wrap--streaming" : ""}`, children: [
      displayRaw || !loginUrl ? /* @__PURE__ */ jsx4(
        Typography6,
        {
          component: "div",
          variant: "body1",
          className: `conv-msg-body${streaming ? " conv-msg-body--streaming" : ""}`,
          sx: {
            lineHeight: 1.65,
            color: "text.primary",
            "& p": { m: 0, mb: 1.25 },
            "& p:last-child": { mb: 0 },
            "& a": { color: "primary.main", wordBreak: "break-word" },
            "& img": {
              width: 100,
              height: 100,
              maxWidth: 100,
              maxHeight: 100,
              objectFit: "cover",
              objectPosition: "center",
              borderRadius: "0.5rem",
              my: 1,
              cursor: "zoom-in",
              display: "inline-block",
              verticalAlign: "middle"
            },
            "& pre, & code": { fontFamily: '"IBM Plex Mono", monospace', fontSize: "0.85em" }
          },
          dangerouslySetInnerHTML: { __html: html },
          onClick: (e) => {
            const img = e.target?.closest?.("img");
            if (img?.src && onImageClick) {
              e.preventDefault();
              onImageClick(img.src);
            }
          }
        }
      ) : null,
      streaming && hasText ? /* @__PURE__ */ jsx4(Box8, { component: "span", className: "conv-stream-cursor", "aria-hidden": true }) : null,
      loginUrl ? /* @__PURE__ */ jsx4(ContapymeLoginEmbed, { url: loginUrl, onLoginDone: streaming ? void 0 : onContapymeLoginDone }) : null
    ] }),
    imagenes?.length > 0 && /* @__PURE__ */ jsx4(ConvMsgImages, { items: imagenes, align, onImageClick }),
    audios?.length > 0 && /* @__PURE__ */ jsx4(ConvMsgAudios, { items: audios, transcriptions: audiosTranscripcion, align })
  ] });
}
function ConvMsgAudios({ items, transcriptions, align = "right" }) {
  const { Box: Box8, Typography: Typography6 } = getMaterialUI();
  const renderable = (items || []).filter((src) => String(src || "").trim().startsWith("data:audio/") || /^https?:\/\//i.test(String(src || "").trim()));
  if (!renderable.length) return null;
  return /* @__PURE__ */ jsx4(
    Box8,
    {
      className: `conv-msg-audios conv-msg-audios--${align}`,
      sx: {
        display: "flex",
        flexDirection: "column",
        gap: 1,
        mt: 1.25,
        alignItems: align === "right" ? "flex-end" : "flex-start"
      },
      children: renderable.map((src, idx) => /* @__PURE__ */ jsxs3(Box8, { className: "conv-msg-audio-item", children: [
        /* @__PURE__ */ jsx4("audio", { controls: true, preload: "metadata", src, "aria-label": `Nota de voz ${idx + 1}` }),
        transcriptions?.[idx] ? /* @__PURE__ */ jsx4(Typography6, { variant: "caption", component: "p", className: "conv-msg-audio-transcript", sx: { mt: 0.5, opacity: 0.85 }, children: transcriptions[idx] }) : null
      ] }, `${idx}-${String(src).slice(0, 32)}`))
    }
  );
}
function ConvMsgImages({ items, align = "right", onImageClick }) {
  const { Box: Box8 } = getMaterialUI();
  const renderable = (items || []).filter((src) => {
    const s = String(src || "").trim();
    if (/^\[file_id:/i.test(s)) return false;
    return s.startsWith("data:image/") || s.startsWith("http://") || s.startsWith("https://");
  });
  if (!renderable.length) return null;
  return /* @__PURE__ */ jsx4(
    Box8,
    {
      className: `conv-msg-images conv-msg-images--${align}`,
      sx: {
        display: "flex",
        flexWrap: "wrap",
        gap: 1,
        mt: 1.25,
        justifyContent: align === "right" ? "flex-end" : "flex-start"
      },
      children: renderable.map((src, idx) => /* @__PURE__ */ jsx4(
        "button",
        {
          type: "button",
          className: "conv-msg-image-lightbox-btn",
          "aria-label": `Ver imagen adjunta ${idx + 1} en tama\xF1o completo`,
          onClick: () => onImageClick?.(src),
          children: /* @__PURE__ */ jsx4("img", { src, alt: `Adjunto ${idx + 1}`, loading: "lazy" })
        },
        `${idx}-${src.slice(0, 32)}`
      ))
    }
  );
}
function UsageSummaryChip({ label, className = "", title, tag, onClick, role, tabIndex }) {
  const showVal = label != null && String(label).trim() !== "";
  const clickable = typeof onClick === "function";
  const handleKeyDown = clickable ? (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick(e);
    }
  } : void 0;
  return /* @__PURE__ */ jsx4(
    "span",
    {
      className: className || "conv-msg-usage-chip",
      title: title || (showVal ? label : tag),
      onClick,
      onKeyDown: handleKeyDown,
      role,
      tabIndex,
      children: /* @__PURE__ */ jsxs3("span", { className: "conv-msg-usage-chip__inner", children: [
        tag ? /* @__PURE__ */ jsx4("span", { className: "conv-msg-usage-chip__key", children: tag }) : null,
        showVal ? /* @__PURE__ */ jsx4("span", { className: "conv-msg-usage-chip__val", children: label }) : null
      ] })
    }
  );
}
function isContapymeMcpMeta(meta) {
  const hay = [
    meta?.itdconsulta,
    meta?.engine,
    meta?.extra?.operativa_key,
    meta?.extra?.operativa
  ].filter(Boolean).join(" ");
  return /CONTAPYME|MCP|contapymeMcp/i.test(hay);
}
function UsageDialogMetaPanel({ meta }) {
  const { Box: Box8 } = getMaterialUI();
  const { Icon: Icon7 } = UI;
  const ctxItems = buildUsageDialogCtxItems(meta);
  if (!ctxItems.length) return null;
  const isMcp = isContapymeMcpMeta(meta);
  return /* @__PURE__ */ jsxs3(Box8, { className: "conv-usage-dialog__meta conv-usage-dialog__meta--ctx", children: [
    /* @__PURE__ */ jsxs3("div", { className: "conv-usage-dialog__meta-head", children: [
      /* @__PURE__ */ jsx4("span", { className: "conv-usage-dialog__meta-eyebrow", children: "Contexto del turno" }),
      isMcp ? /* @__PURE__ */ jsxs3("span", { className: "conv-usage-dialog__meta-badge conv-usage-dialog__meta-badge--mcp", children: [
        /* @__PURE__ */ jsx4(Icon7, { icon: "mdi:api", size: 14 }),
        "Sin costo LLM"
      ] }) : null
    ] }),
    /* @__PURE__ */ jsx4("div", { className: "conv-usage-dialog__ctx-grid", children: ctxItems.map((item) => /* @__PURE__ */ jsxs3(
      "div",
      {
        className: [
          "conv-usage-dialog__ctx-item",
          item.wide ? "conv-usage-dialog__ctx-item--wide" : "",
          item.vision ? "conv-usage-dialog__ctx-item--vision" : ""
        ].filter(Boolean).join(" ") || void 0,
        children: [
          /* @__PURE__ */ jsx4("span", { className: "conv-usage-dialog__ctx-icon", "aria-hidden": true, children: /* @__PURE__ */ jsx4(Icon7, { icon: item.icon || "mdi:information-outline", size: 16 }) }),
          /* @__PURE__ */ jsxs3("span", { className: "conv-usage-dialog__ctx-copy", children: [
            /* @__PURE__ */ jsx4("span", { className: "conv-usage-dialog__ctx-k", children: item.label }),
            /* @__PURE__ */ jsx4("span", { className: `conv-usage-dialog__ctx-v${item.mono ? " conv-usage-dialog__mono" : ""}`, children: item.value })
          ] })
        ]
      },
      item.key
    )) })
  ] });
}
function UsageStatsDialog({ open, onClose, stats, msgLabel, fecha, meta }) {
  const { DialogContent: DialogContent2, Typography: Typography6, Box: Box8, Chip: Chip3, Stack: Stack4, Tooltip: Tooltip4, IconButton: IconButton5 } = getMaterialUI();
  const { useMemo: useMemo7, useState: useState7 } = getReact();
  let glass = null;
  try {
    glass = getGlass();
  } catch (_) {
    glass = null;
  }
  const { GlassSection, GlassInner } = glass || {};
  if (!stats) return null;
  const sections = [
    {
      key: "msg",
      title: "Mensaje",
      subtitle: "Costo y tokens de este turno",
      tokens: stats.tokens,
      cost: stats.cost,
      accent: "#34d399",
      tone: "success",
      icon: /* @__PURE__ */ jsx4(UI.Icon, { icon: "mdi:message-text-outline", size: 18 }),
      show: true
    },
    {
      key: "prev",
      title: "Acumulado anterior",
      subtitle: "Suma del hilo antes de este mensaje",
      tokens: stats.previousTokens,
      cost: stats.previousCost,
      accent: "#60a5fa",
      tone: "blue",
      icon: /* @__PURE__ */ jsx4(UI.Icon, { icon: "mdi:history", size: 18 }),
      show: usageHasData(stats.previousTokens, stats.previousCost)
    },
    {
      key: "cum",
      title: "Total acumulado",
      subtitle: "Suma del hilo incluyendo este mensaje",
      tokens: stats.cumulativeTokens,
      cost: stats.cumulativeCost,
      accent: "#f59e0b",
      tone: "warn",
      icon: /* @__PURE__ */ jsx4(UI.Icon, { icon: "mdi:sigma", size: 18 }),
      show: usageHasData(stats.cumulativeTokens, stats.cumulativeCost)
    }
  ].filter((s) => s.show);
  const chunks = useMemo7(() => chunksFromMeta(meta), [meta]);
  const archivos = useMemo7(() => archivosCitadosFromMeta(meta), [meta]);
  const [openChunk, setOpenChunk] = useState7(null);
  const opKey = meta?.extra?.operativa_key;
  const header = resolveUsageDialogHeader(msgLabel, fecha, opKey);
  const showMetaPanel = Boolean(
    meta?.ts || meta?.model || meta?.modelo_autoswitch_vision || formatLatencySeconds(meta?.latency_ms) || meta?.itdconsulta
  );
  return /* @__PURE__ */ jsxs3(Fragment2, { children: [
    /* @__PURE__ */ jsxs3(
      GlassDialog,
      {
        open,
        onClose,
        maxWidth: "md",
        fullWidth: true,
        paperMaxWidth: "42rem",
        paperClassName: "conv-usage-dialog-paper",
        header: /* @__PURE__ */ jsx4(
          GlassDialogHeader,
          {
            icon: header.icon,
            title: header.title,
            subtitle: header.subtitle,
            accent: header.accent,
            onClose
          }
        ),
        children: [
          /* @__PURE__ */ jsx4(
            DialogContent2,
            {
              dividers: true,
              className: "conv-usage-dialog",
              sx: glassDialogContentSx({
                p: { xs: 1.75, sm: 2.25 },
                maxHeight: "min(72dvh, 40rem)",
                overflow: "auto"
              }),
              children: /* @__PURE__ */ jsxs3(Box8, { className: "conv-usage-dialog__stack", children: [
                showMetaPanel ? /* @__PURE__ */ jsx4(UsageDialogMetaPanel, { meta }) : null,
                sections.map((section) => /* @__PURE__ */ jsx4(
                  UsageDialogSection,
                  {
                    section,
                    GlassSection,
                    GlassInner
                  },
                  section.key
                )),
                chunks.length || archivos.length ? GlassSection ? /* @__PURE__ */ jsxs3(
                  GlassSection,
                  {
                    sectionKey: "conv-usage-chunks",
                    className: "conv-usage-dialog__chunks-section",
                    title: "Fragmentos citados",
                    accent: "#7c3aed",
                    tone: "purple",
                    headerSx: { borderRadius: "0.75rem 0.75rem 0 0" },
                    bodySx: { pt: { xs: 1.25, sm: 1.5 } },
                    children: [
                      /* @__PURE__ */ jsx4(Typography6, { variant: "caption", color: "text.secondary", component: "div", className: "conv-usage-dialog__section-sub", sx: { mb: 1 }, children: archivos.length ? `Chunks extra\xEDdos por file_search (${chunks.length} de ${archivos.length} archivo${archivos.length === 1 ? "" : "s"}).` : `${chunks.length} fragmento${chunks.length === 1 ? "" : "s"} del message.` }),
                      archivos.length ? /* @__PURE__ */ jsx4(Stack4, { direction: "row", spacing: 0.5, flexWrap: "wrap", useFlexGap: true, className: "conv-usage-dialog__files", sx: { mb: 1 }, children: archivos.map((name) => {
                        const clickable = chunks.some((c) => c.filename === name);
                        return /* @__PURE__ */ jsx4(
                          Chip3,
                          {
                            size: "small",
                            variant: "outlined",
                            clickable,
                            onClick: clickable ? () => {
                              const first = chunks.find((c) => c.filename === name);
                              if (first) setOpenChunk(first);
                            } : void 0,
                            icon: /* @__PURE__ */ jsx4("iconify-icon", { icon: "mdi:file-document-outline", width: "14", height: "14" }),
                            label: name,
                            title: clickable ? `Ver fragmentos de ${name}` : name,
                            className: "conv-usage-dialog__file-chip"
                          },
                          name
                        );
                      }) }) : null,
                      /* @__PURE__ */ jsx4(Stack4, { spacing: 0.75, className: "conv-usage-dialog__chunks", children: chunks.map((c) => /* @__PURE__ */ jsxs3(
                        Box8,
                        {
                          className: "conv-usage-dialog__chunk",
                          onClick: () => setOpenChunk(c),
                          role: "button",
                          tabIndex: 0,
                          onKeyDown: (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setOpenChunk(c);
                            }
                          },
                          "aria-label": `Ver fragmento de ${c.filename || c.fileId || "texto"}`,
                          children: [
                            /* @__PURE__ */ jsxs3(Stack4, { direction: "row", spacing: 0.75, alignItems: "center", sx: { mb: 0.35 }, children: [
                              /* @__PURE__ */ jsx4("iconify-icon", { icon: "mdi:text-box-search-outline", width: "16", height: "16" }),
                              /* @__PURE__ */ jsx4(Typography6, { variant: "body2", fontWeight: 600, sx: { flex: 1, minWidth: 0 }, children: c.filename || c.fileId || "fragmento" }),
                              c.score != null ? /* @__PURE__ */ jsx4(
                                Chip3,
                                {
                                  size: "small",
                                  variant: "outlined",
                                  label: `score ${Number(c.score).toFixed(3)}`,
                                  className: "conv-usage-dialog__chunk-score"
                                }
                              ) : null,
                              /* @__PURE__ */ jsx4(Tooltip4, { title: "Ver fragmento en full-page", children: /* @__PURE__ */ jsx4(IconButton5, { size: "small", "aria-label": "Abrir fragmento", className: "conv-usage-dialog__chunk-open", children: /* @__PURE__ */ jsx4("iconify-icon", { icon: "mdi:fullscreen", width: "16", height: "16" }) }) })
                            ] }),
                            /* @__PURE__ */ jsx4(
                              Typography6,
                              {
                                variant: "caption",
                                component: "pre",
                                className: "conv-usage-dialog__chunk-preview",
                                sx: { whiteSpace: "pre-wrap", wordBreak: "break-word", m: 0, fontFamily: "inherit" },
                                children: chunkPreview(c.text, 280)
                              }
                            )
                          ]
                        },
                        c.key
                      )) })
                    ]
                  }
                ) : /* @__PURE__ */ jsxs3(Box8, { className: "conv-usage-dialog__section-card conv-usage-dialog__section-card--chunks", children: [
                  /* @__PURE__ */ jsxs3("div", { className: "conv-usage-dialog__section-head", children: [
                    /* @__PURE__ */ jsx4(Typography6, { component: "h3", variant: "subtitle2", className: "conv-usage-dialog__section-title", children: "Fragmentos citados" }),
                    /* @__PURE__ */ jsx4(Typography6, { variant: "caption", color: "text.secondary", className: "conv-usage-dialog__section-sub", children: archivos.length ? `Chunks extra\xEDdos por file_search (${chunks.length} de ${archivos.length} archivo${archivos.length === 1 ? "" : "s"}).` : `${chunks.length} fragmento${chunks.length === 1 ? "" : "s"} del message.` })
                  ] }),
                  archivos.length ? /* @__PURE__ */ jsx4(Stack4, { direction: "row", spacing: 0.5, flexWrap: "wrap", useFlexGap: true, className: "conv-usage-dialog__files", children: archivos.map((name) => {
                    const clickable = chunks.some((c) => c.filename === name);
                    return /* @__PURE__ */ jsx4(
                      Chip3,
                      {
                        size: "small",
                        variant: "outlined",
                        clickable,
                        onClick: clickable ? () => {
                          const first = chunks.find((c) => c.filename === name);
                          if (first) setOpenChunk(first);
                        } : void 0,
                        icon: /* @__PURE__ */ jsx4("iconify-icon", { icon: "mdi:file-document-outline", width: "14", height: "14" }),
                        label: name,
                        title: clickable ? `Ver fragmentos de ${name}` : name,
                        className: "conv-usage-dialog__file-chip"
                      },
                      name
                    );
                  }) }) : null,
                  /* @__PURE__ */ jsx4(Stack4, { spacing: 0.75, className: "conv-usage-dialog__chunks", children: chunks.map((c) => /* @__PURE__ */ jsxs3(
                    Box8,
                    {
                      className: "conv-usage-dialog__chunk",
                      onClick: () => setOpenChunk(c),
                      role: "button",
                      tabIndex: 0,
                      onKeyDown: (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setOpenChunk(c);
                        }
                      },
                      "aria-label": `Ver fragmento de ${c.filename || c.fileId || "texto"}`,
                      children: [
                        /* @__PURE__ */ jsxs3(Stack4, { direction: "row", spacing: 0.75, alignItems: "center", sx: { mb: 0.35 }, children: [
                          /* @__PURE__ */ jsx4("iconify-icon", { icon: "mdi:text-box-search-outline", width: "16", height: "16" }),
                          /* @__PURE__ */ jsx4(Typography6, { variant: "body2", fontWeight: 600, sx: { flex: 1, minWidth: 0 }, children: c.filename || c.fileId || "fragmento" }),
                          c.score != null ? /* @__PURE__ */ jsx4(
                            Chip3,
                            {
                              size: "small",
                              variant: "outlined",
                              label: `score ${Number(c.score).toFixed(3)}`,
                              className: "conv-usage-dialog__chunk-score"
                            }
                          ) : null,
                          /* @__PURE__ */ jsx4(Tooltip4, { title: "Ver fragmento en full-page", children: /* @__PURE__ */ jsx4(IconButton5, { size: "small", "aria-label": "Abrir fragmento", className: "conv-usage-dialog__chunk-open", children: /* @__PURE__ */ jsx4("iconify-icon", { icon: "mdi:fullscreen", width: "16", height: "16" }) }) })
                        ] }),
                        /* @__PURE__ */ jsx4(
                          Typography6,
                          {
                            variant: "caption",
                            component: "pre",
                            className: "conv-usage-dialog__chunk-preview",
                            sx: { whiteSpace: "pre-wrap", wordBreak: "break-word", m: 0, fontFamily: "inherit" },
                            children: chunkPreview(c.text, 280)
                          }
                        )
                      ]
                    },
                    c.key
                  )) })
                ] }) : null
              ] })
            }
          ),
          /* @__PURE__ */ jsx4(GlassDialogCloseActions, { onClose })
        ]
      }
    ),
    /* @__PURE__ */ jsx4(
      MdFullPageDialog,
      {
        open: Boolean(openChunk),
        onClose: () => setOpenChunk(null),
        source: openChunk?.text || "",
        title: openChunk ? `Fragmento \xB7 ${openChunk.filename || openChunk.fileId || "texto exacto"}` : "Fragmento",
        subtitle: openChunk ? [
          openChunk.score != null ? `score ${Number(openChunk.score).toFixed(3)}` : "",
          openChunk.queries?.length ? `Queries: ${openChunk.queries.join(" \xB7 ")}` : ""
        ].filter(Boolean).join("  \xB7  ") : "",
        accent: "#7c3aed",
        icon: "mdi:text-box-search-outline"
      }
    )
  ] });
}
function UsageDialogSection({ section, GlassSection, GlassInner }) {
  const { Box: Box8, Typography: Typography6, Stack: Stack4 } = getMaterialUI();
  const { Icon: Icon7 } = UI;
  const cost = section?.cost;
  const tokens = section?.tokens;
  const totalCost = Number(cost?.total ?? 0) || 0;
  const totalTokens = Number(tokens?.total ?? 0) || 0;
  const reasoning = Number(tokens?.reason ?? tokens?.reasoning ?? 0) || 0;
  const totalTokLabel = totalTokens ? totalTokens.toLocaleString("es-CO") : "\u2014";
  const costLabel = totalCost > 0 ? `$${totalCost.toFixed(6)}` : "\u2014";
  const reasonLabel = reasoning > 0 ? `${reasoning.toLocaleString("es-CO")} razon.` : null;
  const empty = totalCost <= 0 && totalTokens <= 0;
  const body = /* @__PURE__ */ jsxs3(Box8, { className: "conv-usage-dialog__section-body", children: [
    empty ? /* @__PURE__ */ jsxs3(Box8, { className: "conv-usage-dialog__empty", role: "status", children: [
      /* @__PURE__ */ jsx4("span", { className: "conv-usage-dialog__empty-icon", "aria-hidden": true, children: /* @__PURE__ */ jsx4(Icon7, { icon: "mdi:currency-usd-off", size: 18 }) }),
      /* @__PURE__ */ jsxs3(Box8, { className: "conv-usage-dialog__empty-copy", children: [
        /* @__PURE__ */ jsx4(Typography6, { component: "p", className: "conv-usage-dialog__empty-title", children: "Sin costo ni tokens LLM" }),
        /* @__PURE__ */ jsx4(Typography6, { component: "p", className: "conv-usage-dialog__empty-sub", children: "Este turno no pas\xF3 por OpenAI (p. ej. ContaPyme MCP u operativa local)." })
      ] })
    ] }) : /* @__PURE__ */ jsxs3(
      Stack4,
      {
        direction: { xs: "column", sm: "row" },
        spacing: { xs: 1.25, sm: 2 },
        alignItems: { xs: "stretch", sm: "center" },
        justifyContent: "space-between",
        className: "conv-usage-dialog__headline",
        children: [
          /* @__PURE__ */ jsxs3(Box8, { className: "conv-usage-dialog__headline-main", children: [
            /* @__PURE__ */ jsx4(Typography6, { variant: "overline", className: "conv-usage-dialog__headline-k", sx: { lineHeight: 1, display: "block", opacity: 0.7 }, children: "Costo" }),
            /* @__PURE__ */ jsx4(
              Typography6,
              {
                variant: "h4",
                component: "span",
                className: `conv-usage-dialog__headline-v conv-usage-dialog__headline-v--${section.key}`,
                sx: { fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.05, fontFamily: '"IBM Plex Mono", ui-monospace, monospace' },
                children: costLabel
              }
            )
          ] }),
          /* @__PURE__ */ jsxs3(Stack4, { direction: "row", spacing: 1, alignItems: "center", className: "conv-usage-dialog__headline-meta", children: [
            /* @__PURE__ */ jsxs3(Box8, { className: "conv-usage-dialog__headline-meta-item", children: [
              /* @__PURE__ */ jsx4(Typography6, { variant: "overline", sx: { lineHeight: 1, display: "block", opacity: 0.7 }, children: "Tokens" }),
              /* @__PURE__ */ jsx4(
                Typography6,
                {
                  variant: "h6",
                  component: "span",
                  className: "conv-usage-dialog__headline-meta-v",
                  sx: { fontWeight: 700, lineHeight: 1.1, fontFamily: '"IBM Plex Mono", ui-monospace, monospace' },
                  children: totalTokLabel
                }
              )
            ] }),
            reasonLabel ? /* @__PURE__ */ jsxs3(Box8, { className: "conv-usage-dialog__headline-meta-item conv-usage-dialog__headline-meta-item--reason", children: [
              /* @__PURE__ */ jsx4(Typography6, { variant: "overline", sx: { lineHeight: 1, display: "block", opacity: 0.7 }, children: "Razonamiento" }),
              /* @__PURE__ */ jsx4(
                Typography6,
                {
                  variant: "body1",
                  component: "span",
                  sx: { fontWeight: 600, lineHeight: 1.1, fontFamily: '"IBM Plex Mono", ui-monospace, monospace' },
                  children: reasonLabel
                }
              )
            ] }) : null
          ] })
        ]
      }
    ),
    !empty ? /* @__PURE__ */ jsxs3(Box8, { className: "conv-usage-dialog__metrics-wrap", children: [
      /* @__PURE__ */ jsx4(Typography6, { component: "p", variant: "caption", className: "conv-usage-dialog__metrics-caption", children: "Desglose por etapa" }),
      /* @__PURE__ */ jsx4(
        UsageMetricsGrid,
        {
          className: "conv-usage-dialog__metrics",
          hideRowLabels: true,
          sections: [{ key: section.key, label: section.title, tokens: section.tokens, cost: section.cost }]
        }
      )
    ] }) : null
  ] });
  if (!GlassSection) {
    return /* @__PURE__ */ jsxs3(Box8, { className: `conv-usage-dialog__section-card conv-usage-dialog__section-card--${section.key}`, children: [
      /* @__PURE__ */ jsxs3("div", { className: "conv-usage-dialog__section-head", children: [
        /* @__PURE__ */ jsx4(Typography6, { component: "h3", variant: "subtitle2", className: "conv-usage-dialog__section-title", children: section.title }),
        /* @__PURE__ */ jsx4(Typography6, { variant: "caption", color: "text.secondary", className: "conv-usage-dialog__section-sub", children: section.subtitle })
      ] }),
      body
    ] });
  }
  return /* @__PURE__ */ jsx4(
    GlassSection,
    {
      sectionKey: `conv-usage-${section.key}`,
      className: `conv-usage-dialog__glass-section conv-usage-dialog__glass-section--${section.key}`,
      title: /* @__PURE__ */ jsxs3(Stack4, { direction: "row", spacing: 1, alignItems: "baseline", sx: { minWidth: 0, flex: 1 }, children: [
        /* @__PURE__ */ jsx4(Typography6, { component: "span", variant: "subtitle1", sx: { fontWeight: 700, letterSpacing: -0.2 }, children: section.title }),
        /* @__PURE__ */ jsx4(Typography6, { component: "span", variant: "caption", color: "text.secondary", sx: { flex: 1, minWidth: 0 }, children: section.subtitle })
      ] }),
      icon: section.icon,
      accent: section.accent,
      tone: section.tone,
      headerSx: { borderRadius: "0.75rem 0.75rem 0 0" },
      bodySx: { pt: 1.25, pb: { xs: 1.25, sm: 1.5 } },
      children: body
    }
  );
}
function UsageStatsColumn({ stats, align = "right", msgLabel, fecha, meta, isUser = false }) {
  const { Box: Box8 } = getMaterialUI();
  const [open, setOpen] = useState3(false);
  const modelRaw = String(meta?.model ?? "").trim();
  const modelLabel = modelRaw ? modelBadgeLabel(modelRaw) : "";
  const latencyLabel = formatLatencySeconds(meta?.latency_ms);
  const autoswitchBadge = visionAutoswitchBadge(meta);
  const metaTk = meta?.tokens?.total ? meta.tokens : tokensFromUsage(meta?.usage);
  const metaTokTotal = Number(metaTk?.total ?? 0) || 0;
  const metaTokLabel = metaTokTotal > 0 ? metaTokTotal.toLocaleString("es-CO") : "";
  const contextChips = buildMetaClassificationChips(meta, msgLabel, { isUser });
  const showMetaBadges = Boolean(modelLabel || latencyLabel || autoswitchBadge || metaTokLabel || contextChips.length);
  const hasUsage = Boolean(
    stats && (usageHasData(stats.tokens, stats.cost) || usageHasData(stats.previousTokens, stats.previousCost))
  );
  if (!showMetaBadges && !hasUsage) return null;
  const msgSummary = hasUsage ? formatUsageSummary(stats.tokens, stats.cost) : null;
  const cumSummary = hasUsage ? formatUsageSummary(stats.cumulativeTokens, stats.cumulativeCost) : null;
  const showCum = hasUsage && !isUser && usageHasData(stats.cumulativeTokens, stats.cumulativeCost);
  const groups = hasUsage ? [
    { key: "msg", label: "Mensaje", summary: msgSummary },
    ...showCum ? [{ key: "cum", label: "Acumulado", summary: cumSummary }] : []
  ] : [];
  const openDialog = (e) => {
    if (!hasUsage) return;
    e?.stopPropagation?.();
    setOpen(true);
  };
  return /* @__PURE__ */ jsxs3(Fragment2, { children: [
    /* @__PURE__ */ jsxs3(
      Box8,
      {
        className: [
          "conv-msg-usage-stats",
          `conv-msg-usage-stats--${align}`,
          hasUsage ? "conv-msg-usage-stats--clickable" : ""
        ].filter(Boolean).join(" "),
        role: hasUsage ? "button" : void 0,
        tabIndex: hasUsage ? 0 : void 0,
        title: hasUsage ? "Clic para ver desglose completo" : void 0,
        "aria-label": hasUsage ? "Ver detalle de uso: costo USD y tokens" : void 0,
        onClick: hasUsage ? openDialog : void 0,
        onKeyDown: hasUsage ? (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            openDialog();
          }
        } : void 0,
        sx: {
          flexShrink: 0,
          width: "fit-content",
          maxWidth: { xs: "min(100%, 18rem)", sm: groups.length > 1 ? "22rem" : "18rem" },
          pt: 0.25,
          alignSelf: "flex-start",
          cursor: hasUsage ? "pointer" : void 0,
          ...hasUsage ? {
            transition: "border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease, transform 0.16s ease",
            "&:hover": {
              borderColor: "rgba(0, 229, 255, 0.72)",
              background: "linear-gradient(165deg, rgba(14, 26, 48, 0.98), rgba(20, 32, 58, 0.92))",
              boxShadow: "0 0 0 1px rgba(0, 229, 255, 0.35), 0 12px 36px rgba(30, 144, 255, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
              transform: "translateY(-2px)"
            },
            "&:active": {
              transform: "translateY(0)",
              boxShadow: "0 0 0 1px rgba(0, 229, 255, 0.22), 0 4px 16px rgba(30, 144, 255, 0.18)"
            },
            'html[data-mui-color-scheme="light"] &:hover': {
              borderColor: "rgba(30, 144, 255, 0.48)",
              background: "linear-gradient(165deg, #f0f9ff, #eef2ff)",
              boxShadow: "0 0 0 1px rgba(30, 144, 255, 0.16), 0 8px 24px rgba(30, 144, 255, 0.14)"
            },
            'html[data-mui-color-scheme="light"] &:active': {
              background: "#e0f2fe"
            }
          } : {}
        },
        children: [
          showMetaBadges ? /* @__PURE__ */ jsxs3(Box8, { className: `conv-msg-usage-stats__meta conv-msg-usage-stats__meta--${align}`, children: [
            contextChips.map((c) => /* @__PURE__ */ jsx4(MetaBadge, { label: c.label, tone: c.tone, title: c.title }, c.key)),
            modelLabel ? /* @__PURE__ */ jsx4(
              UsageSummaryChip,
              {
                tag: "MODELO",
                label: modelLabel,
                className: "conv-msg-usage-chip conv-msg-usage-chip--model",
                title: meta?.modelo_autoswitch_vision ? modelRaw && modelRaw !== modelLabel ? `Modelo usado (autoswitch visi\xF3n): ${modelRaw}` : "Modelo usado tras autoswitch visi\xF3n" : modelRaw && modelRaw !== modelLabel ? `Modelo: ${modelRaw}` : "Modelo LLM"
              }
            ) : null,
            autoswitchBadge ? /* @__PURE__ */ jsx4(
              UsageSummaryChip,
              {
                tag: autoswitchBadge.tag,
                label: autoswitchBadge.label,
                className: "conv-msg-usage-chip conv-msg-usage-chip--vision",
                title: autoswitchBadge.title
              }
            ) : null,
            latencyLabel ? /* @__PURE__ */ jsx4(
              UsageSummaryChip,
              {
                tag: "LAT",
                label: latencyLabel,
                className: "conv-msg-usage-chip conv-msg-usage-chip--latency",
                title: "Tiempo de respuesta"
              }
            ) : null,
            metaTokLabel && !hasUsage ? /* @__PURE__ */ jsx4(
              UsageSummaryChip,
              {
                tag: "TOK",
                label: metaTokLabel,
                className: "conv-msg-usage-chip conv-msg-usage-chip--tokens",
                title: `Tokens: ${metaTokLabel}`
              }
            ) : null
          ] }) : null,
          groups.length > 0 ? /* @__PURE__ */ jsx4(Box8, { className: `conv-msg-usage-stats__groups conv-msg-usage-stats__groups--${align}`, children: groups.map((group) => /* @__PURE__ */ jsxs3(Box8, { className: `conv-msg-usage-stats__group conv-msg-usage-stats__group--${group.key}`, children: [
            /* @__PURE__ */ jsx4(
              UsageSummaryChip,
              {
                tag: group.key === "msg" ? "MSG" : "ACUM",
                className: [
                  "conv-msg-usage-chip",
                  "conv-msg-usage-chip--scope",
                  group.key === "msg" ? "conv-msg-usage-chip--scope-msg" : "conv-msg-usage-chip--scope-prev"
                ].join(" "),
                title: group.label
              }
            ),
            /* @__PURE__ */ jsx4(
              UsageSummaryChip,
              {
                tag: "USD",
                label: group.summary.usdText,
                className: "conv-msg-usage-chip conv-msg-usage-chip--usd",
                title: "Costo USD"
              }
            ),
            /* @__PURE__ */ jsx4(
              UsageSummaryChip,
              {
                tag: "TOK",
                label: group.summary.tokensText,
                className: "conv-msg-usage-chip conv-msg-usage-chip--tokens",
                title: group.key === "msg" ? "Tokens de este mensaje" : "Tokens acumulados del hilo (incluye este mensaje)"
              }
            )
          ] }, group.key)) }) : null
        ]
      }
    ),
    /* @__PURE__ */ jsx4(
      UsageStatsDialog,
      {
        open: open && hasUsage,
        onClose: () => setOpen(false),
        stats,
        msgLabel,
        fecha,
        meta
      }
    )
  ] });
}
function MsgRatingRow({ calificacion, onRate, disabled = false, busy = false, align = "right" }) {
  const { Stack: Stack4, IconButton: IconButton5, Tooltip: Tooltip4, CircularProgress: CircularProgress4 } = getMaterialUI();
  const { Icon: Icon7 } = UI;
  const rated = calificacion !== void 0 && calificacion !== null;
  const useful = calificacion === 1;
  const notUseful = calificacion === 0;
  const readOnly = disabled && !rated && !busy;
  const upTooltip = (() => {
    if (busy && !rated) return "Guardando calificaci\xF3n\u2026";
    if (useful) return "Calificado como \xFAtil";
    if (rated && notUseful) return "Calificado como no \xFAtil \xB7 no se puede cambiar";
    if (readOnly) return "Calificaci\xF3n no disponible (modo lectura)";
    return "Marcar como \xFAtil";
  })();
  const downTooltip = (() => {
    if (busy && !rated) return "Guardando calificaci\xF3n\u2026";
    if (notUseful) return "Calificado como no \xFAtil";
    if (rated && useful) return "Calificado como \xFAtil \xB7 no se puede cambiar";
    if (readOnly) return "Calificaci\xF3n no disponible (modo lectura)";
    return "Marcar como no \xFAtil";
  })();
  const upRatedSx = useful ? { color: "#16a34a !important" } : void 0;
  const downRatedSx = notUseful ? { color: "#ef4444 !important" } : void 0;
  return /* @__PURE__ */ jsxs3(
    Stack4,
    {
      direction: "row",
      spacing: 0.25,
      alignItems: "center",
      justifyContent: align === "right" ? "flex-end" : "flex-start",
      className: `conv-msg-rating conv-msg-rating--${align}${rated ? " conv-msg-rating--rated" : ""}`,
      role: "group",
      "aria-label": "Calificaci\xF3n del mensaje",
      children: [
        /* @__PURE__ */ jsx4(Tooltip4, { title: upTooltip, arrow: true, children: /* @__PURE__ */ jsx4("span", { children: /* @__PURE__ */ jsx4(
          IconButton5,
          {
            size: "small",
            className: `conv-msg-rating__btn conv-msg-rating__btn--up${useful ? " conv-msg-rating__btn--active" : ""}`,
            "aria-label": useful ? "Calificado como \xFAtil" : "Marcar como \xFAtil",
            "aria-pressed": useful,
            disabled: disabled || busy || rated,
            onClick: () => onRate(true),
            sx: upRatedSx,
            children: busy && !rated ? /* @__PURE__ */ jsx4(CircularProgress4, { size: 16 }) : /* @__PURE__ */ jsx4(
              Icon7,
              {
                icon: useful ? "mdi:thumb-up" : "mdi:thumb-up-outline",
                size: 18,
                style: useful ? { color: "#16a34a" } : void 0
              }
            )
          }
        ) }) }),
        /* @__PURE__ */ jsx4(Tooltip4, { title: downTooltip, arrow: true, children: /* @__PURE__ */ jsx4("span", { children: /* @__PURE__ */ jsx4(
          IconButton5,
          {
            size: "small",
            className: `conv-msg-rating__btn conv-msg-rating__btn--down${notUseful ? " conv-msg-rating__btn--active" : ""}`,
            "aria-label": notUseful ? "Calificado como no \xFAtil" : "Marcar como no \xFAtil",
            "aria-pressed": notUseful,
            disabled: disabled || busy || rated,
            onClick: () => onRate(false),
            sx: downRatedSx,
            children: /* @__PURE__ */ jsx4(
              Icon7,
              {
                icon: notUseful ? "mdi:thumb-down" : "mdi:thumb-down-outline",
                size: 18,
                style: notUseful ? { color: "#ef4444" } : void 0
              }
            )
          }
        ) }) })
      ]
    }
  );
}
function resolveMsgImensaje(msg) {
  const imensaje = Number(msg?.imensaje);
  return imensaje > 0 ? imensaje : void 0;
}
var MensajeSection = memo(function MensajeSection2({ msg, onMeta, compactMeta = false, chatUserDisplayName, chatUserNick, showUsageStats = false, onImageClick, streamingMsgId = null, onRateMessage = null, canRate = false, ratingMsgId = null, operativaEnter = false, onContapymeLoginDone = null }) {
  const { Alert: Alert3, Box: Box8 } = getMaterialUI();
  const [fileSearchOpen, setFileSearchOpen] = useState3(false);
  const meta = roleMetaFor(msg, compactMeta);
  const title = roleTitle(msg, chatUserDisplayName, chatUserNick);
  const titleCaption = roleUserCaption(msg, chatUserNick);
  const fecha = msg.fecha ? String(msg.fecha) : "";
  const fechaIso = msg.fechaIso ? String(msg.fechaIso) : "";
  const isUser = msg.esUsuario;
  const isOperativa = msg.esOperativa;
  const isStreaming = Boolean(msg.isStreaming || streamingMsgId && msg.idMsg === streamingMsgId);
  const showMetaBtn = Boolean(onMeta && msg.meta && metaWorthDialog(msg.meta, isUser));
  const showFileSearchChips = Boolean(!compactMeta && !isUser && msg.meta && metaHasFileSearch(msg.meta));
  const showMetaChips = Boolean(!compactMeta && (onMeta || showFileSearchChips));
  const statsSide = isUser ? "left" : "right";
  const msgImensaje = resolveMsgImensaje(msg);
  const showRating = Boolean(
    onRateMessage && !isUser && !isOperativa && !isStreaming && msgImensaje && (canRate || msg.calificacion !== void 0)
  );
  const ratingRow = showRating ? /* @__PURE__ */ jsx4(
    MsgRatingRow,
    {
      calificacion: msg.calificacion,
      disabled: !canRate,
      busy: ratingMsgId === msg.idMsg,
      align: "left",
      onRate: (butil) => onRateMessage({ ...msg, imensaje: msgImensaje }, butil)
    }
  ) : null;
  const showMetricsColumn = Boolean(showUsageStats && sideLogPanelWorthShowing(msg));
  const showSideColumn = Boolean(showMetricsColumn || ratingRow);
  const hideUsageInChips = showMetricsColumn;
  const fullLayout = !compactMeta;
  const rowMaxWidth = showMetricsColumn ? "100%" : fullLayout ? isOperativa ? "min(96%, 52rem)" : isUser ? "min(96%, 44rem)" : "min(96%, 48rem)" : isOperativa ? "92%" : "min(96%, 42rem)";
  const cardMaxWidth = showMetricsColumn ? isOperativa ? "72%" : { xs: "100%", sm: "min(48rem, calc(100% - 11.5rem))" } : "100%";
  const roleClass = isOperativa ? `conv-msg--operativa${operativaEnter ? " conv-msg--operativa-enter" : ""}` : "";
  return /* @__PURE__ */ jsxs3(
    Box8,
    {
      className: [compactMeta ? "conv-msg--compact" : "", roleClass].filter(Boolean).join(" ") || void 0,
      sx: {
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        width: "100%",
        mb: isOperativa ? compactMeta ? 1 : 1.75 : compactMeta ? 2.5 : 2
      },
      children: [
        /* @__PURE__ */ jsxs3(
          Box8,
          {
            className: [
              "conv-msg-row",
              compactMeta ? "conv-msg-row--compact" : "",
              showMetricsColumn ? "conv-msg-row--logs" : "",
              isUser ? "conv-msg-row--user" : "conv-msg-row--assistant"
            ].filter(Boolean).join(" "),
            sx: {
              display: "flex",
              flexDirection: isUser ? "row-reverse" : "row",
              alignItems: showSideColumn ? "flex-start" : "flex-start",
              gap: { xs: 0.75, sm: 1.25 },
              width: showMetricsColumn ? "100%" : "fit-content",
              maxWidth: showMetricsColumn ? "100%" : rowMaxWidth,
              minWidth: 0,
              opacity: 1
            },
            children: [
              /* @__PURE__ */ jsx4(
                Box8,
                {
                  className: "conv-msg-card-wrap",
                  sx: {
                    flex: "0 1 auto",
                    width: "fit-content",
                    maxWidth: cardMaxWidth,
                    minWidth: 0
                  },
                  children: /* @__PURE__ */ jsxs3(
                    SectionCard,
                    {
                      id: `conv-msg-${msg.idMsg}`,
                      icon: meta.icon,
                      title,
                      titleCaption: titleCaption || void 0,
                      fecha: fecha || void 0,
                      fechaIso: fechaIso || void 0,
                      accent: meta.accent,
                      align: isUser ? "right" : "left",
                      operativa: isOperativa,
                      compact: compactMeta,
                      streaming: isStreaming,
                      onMeta: showMetaBtn ? () => onMeta(msg) : void 0,
                      metaChips: showMetaChips ? /* @__PURE__ */ jsx4(
                        MetaChipRow,
                        {
                          meta: msg.meta,
                          isUser,
                          hideUsageMetrics: hideUsageInChips || isUser,
                          hideClassificationChips: showUsageStats,
                          align: isUser ? "right" : "left",
                          cardTitle: title,
                          onFileSearch: showFileSearchChips ? () => setFileSearchOpen(true) : void 0
                        }
                      ) : null,
                      children: [
                        msg.streamFailed && msg.streamError && /* @__PURE__ */ jsx4(Alert3, { severity: "warning", sx: { mb: 1.5, py: 0.25, fontSize: "0.78rem" }, children: msg.streamError }),
                        msg.contenido?.trim() || msg.imagenes?.length || msg.audios?.length || isStreaming ? /* @__PURE__ */ jsx4(
                          MsgBody,
                          {
                            text: msg.contenido,
                            imagenes: msg.imagenes,
                            audios: msg.audios,
                            audiosTranscripcion: msg.audiosTranscripcion,
                            align: isUser ? "right" : "left",
                            onImageClick,
                            streaming: isStreaming,
                            disableLoginEmbed: isOperativa,
                            loginUrl: isOperativa ? void 0 : msg.meta?.login_url || msg.meta?.extra?.login_url,
                            onContapymeLoginDone: isOperativa || isUser ? void 0 : onContapymeLoginDone
                          }
                        ) : null
                      ]
                    }
                  )
                }
              ),
              showSideColumn && /* @__PURE__ */ jsxs3(
                Box8,
                {
                  className: `conv-msg-side-column conv-msg-side-column--${statsSide}`,
                  sx: {
                    flexShrink: 0,
                    maxWidth: { xs: "min(100%, 16rem)", sm: "18rem" },
                    pt: 0.25,
                    pb: 0.25,
                    alignSelf: "stretch"
                  },
                  children: [
                    showMetricsColumn ? /* @__PURE__ */ jsx4(
                      UsageStatsColumn,
                      {
                        stats: msg.usageStats,
                        align: statsSide,
                        msgLabel: title,
                        fecha,
                        meta: msg.meta,
                        isUser
                      }
                    ) : null,
                    ratingRow ? /* @__PURE__ */ jsx4(Box8, { className: "conv-msg-rating-slot", children: ratingRow }) : null
                  ]
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsx4(
          FileSearchDialog,
          {
            open: fileSearchOpen,
            onClose: () => setFileSearchOpen(false),
            meta: msg.meta,
            title: `File Search \xB7 ${title}`
          }
        )
      ]
    }
  );
}, (prev, next) => prev.msg === next.msg && prev.streamingMsgId === next.streamingMsgId && prev.compactMeta === next.compactMeta && prev.chatUserDisplayName === next.chatUserDisplayName && prev.chatUserNick === next.chatUserNick && prev.showUsageStats === next.showUsageStats && prev.ratingMsgId === next.ratingMsgId && prev.canRate === next.canRate && prev.operativaEnter === next.operativaEnter);
function ConvLogWebView({ mensajes, onMeta, compactMeta = false, emptyHint, chatUserDisplayName, chatUserNick, showUsageStats = true, streamingMsgId = null, onRateMessage = null, canRate = false, ratingMsgId = null, threadKey = null, threadClassName = "", onContapymeLoginDone = null }) {
  const { Box: Box8, Typography: Typography6 } = getMaterialUI();
  const [lightboxSrc, setLightboxSrc] = useState3(null);
  const operativaEnterIds = useOperativaEnterIds(mensajes, threadKey, { enabled: !compactMeta });
  const mensajesConStats = useMemo2(
    () => attachUsageStats(mensajes || []),
    [mensajes]
  );
  const hasUsageStats = showUsageStats && threadHasUsageStats(mensajesConStats);
  const onImageClick = useMemo2(() => (src) => setLightboxSrc(src), []);
  if (!mensajes?.length) {
    if (emptyHint === null) return null;
    return /* @__PURE__ */ jsx4(Typography6, { variant: "body2", color: "text.secondary", sx: { textAlign: "center", py: 6 }, children: emptyHint || "Recupera por ID o pega un log para ver el hilo." });
  }
  return /* @__PURE__ */ jsxs3(Box8, { className: threadClassName || void 0, sx: { width: "100%", maxWidth: "100%" }, children: [
    mensajesConStats.map((m) => /* @__PURE__ */ jsx4(
      MensajeSection,
      {
        msg: m,
        onMeta,
        compactMeta,
        chatUserDisplayName,
        chatUserNick,
        showUsageStats: hasUsageStats,
        onImageClick,
        streamingMsgId,
        onRateMessage,
        canRate,
        ratingMsgId,
        operativaEnter: operativaEnterIds.has(m.idMsg),
        onContapymeLoginDone
      },
      m.idMsg
    )),
    /* @__PURE__ */ jsx4(ImageLightboxDialog, { open: Boolean(lightboxSrc), src: lightboxSrc, onClose: () => setLightboxSrc(null) })
  ] });
}

// js/ui/ConvLogThread.jsx
import { jsx as jsx5, jsxs as jsxs4 } from "react/jsx-runtime";
var { Box: Box2, Alert } = getMaterialUI();
function ThreadLoading({ label = "Cargando conversaci\xF3n\u2026" }) {
  return /* @__PURE__ */ jsx5(Box2, { className: "isa-app-boot isa-app-boot--inline", sx: { position: "absolute", inset: 0, zIndex: 2, minHeight: 0, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", pointerEvents: "none" }, children: /* @__PURE__ */ jsxs4("div", { className: "isa-app-boot__card isa-app-boot__card--compact", role: "status", "aria-live": "polite", style: { background: "rgba(8, 16, 32, 0.72)" }, children: [
    /* @__PURE__ */ jsx5("div", { className: "isa-app-boot__icon-wrap isa-app-boot__icon-wrap--sm", children: /* @__PURE__ */ jsx5("iconify-icon", { icon: "mdi:loading", class: "isa-spin", width: "1.375em", height: "1.375em" }) }),
    /* @__PURE__ */ jsx5("p", { className: "isa-app-boot__label", children: label }),
    /* @__PURE__ */ jsx5("div", { className: "isa-app-boot__bar", "aria-hidden": "true", children: /* @__PURE__ */ jsx5("span", { className: "isa-app-boot__bar-fill" }) })
  ] }) });
}
function ConvLogThread({
  mensajes,
  onMeta,
  compactMeta = false,
  showUsageStats = true,
  chatUserDisplayName,
  chatUserNick,
  threadKey = null,
  streamingMsgId = null,
  onRateMessage = null,
  canRate = false,
  ratingMsgId = null,
  emptyHint,
  loading = false,
  loadingOnlyWhenEmpty = true,
  error = null,
  scrollRef = null,
  onScroll = null,
  surfaceClassName = "",
  sx = {},
  onContapymeLoginDone = null
}) {
  const threadClassName = compactMeta ? "paty-chat-thread--compact" : "paty-chat-log-thread";
  const showSpinner = loading && (loadingOnlyWhenEmpty ? !mensajes?.length : true);
  return /* @__PURE__ */ jsxs4(
    Box2,
    {
      ref: scrollRef,
      onScroll,
      className: [
        "conv-log-thread-surface",
        compactMeta ? "conv-log-thread-surface--compact" : "",
        surfaceClassName
      ].filter(Boolean).join(" "),
      sx: { ...convLogSurfaceSx(), flex: 1, minHeight: 0, ...sx },
      children: [
        showSpinner ? /* @__PURE__ */ jsx5(ThreadLoading, {}) : null,
        error ? /* @__PURE__ */ jsx5(Alert, { severity: "warning", sx: { mb: 2 }, children: error }) : null,
        /* @__PURE__ */ jsx5(
          ConvLogWebView,
          {
            mensajes,
            onMeta,
            compactMeta,
            showUsageStats,
            threadClassName,
            chatUserDisplayName,
            chatUserNick,
            streamingMsgId,
            emptyHint: showSpinner ? null : emptyHint,
            canRate,
            onRateMessage,
            ratingMsgId,
            threadKey,
            onContapymeLoginDone
          }
        )
      ]
    }
  );
}

// js/tools/chat/ChatComposer.jsx
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
var MAX_CHAT_IMAGES = 10;
var MAX_CHAT_AUDIOS = 5;
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

// js/tools/chat/ChatPayloadPreview.jsx
init_platform();
init_patyiaChatApi();
import { jsx as jsx6, jsxs as jsxs5 } from "react/jsx-runtime";
var { useMemo: useMemo3 } = getReact();
var { Icon } = UI;
function ChatPayloadPreview({ open, body, endpoint, onClose }) {
  const { Box: Box8, Typography: Typography6, Paper, IconButton: IconButton5, Tooltip: Tooltip4 } = getMaterialUI();
  const previewJson = useMemo3(
    () => formatConversacionPostBodyPreview(body),
    [body]
  );
  const imageCount = Array.isArray(body.imagenes) ? body.imagenes.length : 0;
  const audioCount = Array.isArray(body.audios) ? body.audios.length : 0;
  if (!open) return null;
  return /* @__PURE__ */ jsxs5(
    Paper,
    {
      className: "paty-chat-payload-preview",
      elevation: 8,
      role: "region",
      "aria-label": "Vista previa del body POST",
      children: [
        /* @__PURE__ */ jsxs5(Box8, { className: "paty-chat-payload-preview__head", children: [
          /* @__PURE__ */ jsxs5(Box8, { className: "paty-chat-payload-preview__head-main", children: [
            /* @__PURE__ */ jsx6(Typography6, { variant: "caption", className: "paty-chat-payload-preview__method", children: "POST" }),
            /* @__PURE__ */ jsx6(Typography6, { variant: "caption", component: "code", className: "paty-chat-payload-preview__path", children: endpoint }),
            imageCount > 0 ? /* @__PURE__ */ jsxs5(Typography6, { variant: "caption", className: "paty-chat-payload-preview__meta", children: [
              imageCount,
              " imagen",
              imageCount !== 1 ? "es" : "",
              " \xB7 base64"
            ] }) : null,
            audioCount > 0 ? /* @__PURE__ */ jsxs5(Typography6, { variant: "caption", className: "paty-chat-payload-preview__meta", children: [
              audioCount,
              " audio",
              audioCount !== 1 ? "s" : "",
              " \xB7 base64"
            ] }) : null
          ] }),
          /* @__PURE__ */ jsx6(Tooltip4, { title: "Cerrar vista previa", children: /* @__PURE__ */ jsx6(
            IconButton5,
            {
              size: "small",
              className: "paty-chat-payload-preview__close",
              "aria-label": "Cerrar vista previa del body POST",
              onClick: onClose,
              children: /* @__PURE__ */ jsx6(Icon, { icon: "mdi:close", size: 18 })
            }
          ) })
        ] }),
        /* @__PURE__ */ jsx6(Box8, { className: "paty-chat-payload-preview__body", children: /* @__PURE__ */ jsx6(
          CodeMirrorPanel,
          {
            value: previewJson,
            json: true,
            readOnly: true,
            lineWrapping: true,
            maxHeight: "min(36vh, 280px)",
            minHeight: "7rem",
            copyTitle: "Copiar JSON del POST",
            enableFullPage: true,
            fullPageTitle: "Body POST \xB7 /conversacion",
            className: "paty-chat-payload-preview__cm"
          }
        ) }),
        /* @__PURE__ */ jsxs5(Typography6, { variant: "caption", className: "paty-chat-payload-preview__foot", children: [
          "Vista previa en vivo \u2014 el env\xEDo incluye base64 completo en ",
          /* @__PURE__ */ jsx6("code", { children: "imagenes[]" }),
          " y ",
          /* @__PURE__ */ jsx6("code", { children: "audios[]" }),
          ".",
          " ",
          "ISS acepta im\xE1genes ",
          /* @__PURE__ */ jsx6("code", { children: "data:image/(png|jpeg|webp|gif);base64,\u2026" }),
          " (m\xE1x. 10) y audios ",
          /* @__PURE__ */ jsx6("code", { children: "data:audio/*;base64,\u2026" }),
          " (m\xE1x. 5, transcritos con Whisper)."
        ] })
      ]
    }
  );
}

// js/tools/chat/audio.ts
function blobToPreviewUrl(blob) {
  try {
    return URL.createObjectURL(blob);
  } catch {
    return "";
  }
}
function isVoiceRecordingSupported() {
  return typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia) && typeof MediaRecorder !== "undefined";
}

// js/tools/chat/images.ts
function blobToPreviewUrl2(blob) {
  try {
    return URL.createObjectURL(blob);
  } catch {
    return "";
  }
}

// js/tools/chat/ChatComposer.jsx
import { jsx as jsx7, jsxs as jsxs6 } from "react/jsx-runtime";
var { useState: useState4, useMemo: useMemo4, useEffect: useEffect4 } = getReact();
var {
  Box: Box3,
  Button,
  IconButton,
  TextField,
  CircularProgress,
  Tooltip
} = getMaterialUI();
var { Icon: Icon2 } = UI;
function ChatComposer({
  canSend,
  sending,
  draft,
  images,
  audios,
  isRecording,
  payloadPreviewOpen,
  postBodyPreview,
  inputRef,
  attachInputRef,
  onDraftChange,
  onPaste,
  onSend,
  onTogglePayloadPreview,
  onAttachClick,
  onAttachChange,
  onToggleVoiceRecord,
  onRemoveImage,
  onRemoveAudio
}) {
  const [lightboxSrc, setLightboxSrc] = useState4(null);
  const canRecord = isVoiceRecordingSupported();
  const hasContent = Boolean(draft.trim() || images.length || audios.length);
  const imagePreviewUrls = useMemo4(
    () => images.map((img) => blobToPreviewUrl2(img.blob)),
    [images]
  );
  const audioPreviewUrls = useMemo4(
    () => audios.map((aud) => blobToPreviewUrl(aud.blob)),
    [audios]
  );
  useEffect4(() => () => {
    [...imagePreviewUrls, ...audioPreviewUrls].forEach((u) => {
      if (u) URL.revokeObjectURL(u);
    });
  }, [imagePreviewUrls, audioPreviewUrls]);
  if (!canSend) return null;
  return /* @__PURE__ */ jsxs6(Box3, { className: "paty-chat-compose", children: [
    /* @__PURE__ */ jsx7(
      ChatPayloadPreview,
      {
        open: payloadPreviewOpen,
        body: postBodyPreview,
        endpoint: `${PATYIA_API_BASE}/conversacion`,
        onClose: onTogglePayloadPreview
      }
    ),
    images.length > 0 && /* @__PURE__ */ jsx7(Box3, { className: "paty-chat-image-previews", children: images.map((img, idx) => {
      const previewSrc = img.uploadedUrl || imagePreviewUrls[idx] || "";
      return /* @__PURE__ */ jsxs6("figure", { children: [
        /* @__PURE__ */ jsx7(
          "button",
          {
            type: "button",
            className: "paty-chat-image-previews__thumb-btn",
            "aria-label": `Ver ${img.name || "adjunto"} en tama\xF1o completo`,
            onClick: () => previewSrc && setLightboxSrc(previewSrc),
            children: /* @__PURE__ */ jsx7(
              "img",
              {
                src: previewSrc,
                alt: img.name || "adjunto",
                onError: (e) => {
                  e.currentTarget.classList.add("paty-chat-image-previews__img--broken");
                  e.currentTarget.removeAttribute("src");
                }
              }
            )
          }
        ),
        /* @__PURE__ */ jsx7("button", { type: "button", className: "paty-chat-image-previews__remove", "aria-label": "Quitar", onClick: () => onRemoveImage(idx), children: "\xD7" })
      ] }, idx);
    }) }),
    audios.length > 0 && /* @__PURE__ */ jsx7(Box3, { className: "paty-chat-audio-previews", children: audios.map((aud, idx) => {
      const previewSrc = aud.uploadedUrl || audioPreviewUrls[idx] || "";
      return /* @__PURE__ */ jsxs6("figure", { children: [
        /* @__PURE__ */ jsx7("audio", { controls: true, preload: "metadata", src: previewSrc, "aria-label": aud.name || `Nota de voz ${idx + 1}` }),
        /* @__PURE__ */ jsx7("figcaption", { children: aud.name || `Nota ${idx + 1}` }),
        /* @__PURE__ */ jsx7("button", { type: "button", className: "paty-chat-audio-previews__remove", "aria-label": "Quitar audio", onClick: () => onRemoveAudio(idx), children: "\xD7" })
      ] }, idx);
    }) }),
    /* @__PURE__ */ jsxs6(Box3, { className: "paty-chat-input-wrap", children: [
      /* @__PURE__ */ jsx7(
        "input",
        {
          ref: attachInputRef,
          type: "file",
          accept: "image/png,image/jpeg,image/jpg,image/webp,image/gif,audio/webm,audio/mp4,audio/mpeg,audio/wav,audio/ogg,.webm,.mp3,.m4a,.wav,.ogg",
          multiple: true,
          hidden: true,
          "aria-hidden": true,
          tabIndex: -1,
          onChange: onAttachChange
        }
      ),
      /* @__PURE__ */ jsx7(Tooltip, { title: payloadPreviewOpen ? "Ocultar body POST" : "Ver body POST (JSON en vivo)", children: /* @__PURE__ */ jsx7("span", { children: /* @__PURE__ */ jsx7(IconButton, { color: "inherit", className: `paty-chat-payload-btn${payloadPreviewOpen ? " paty-chat-payload-btn--active" : ""}`, "aria-label": payloadPreviewOpen ? "Ocultar vista previa JSON" : "Ver vista previa JSON del POST", "aria-pressed": payloadPreviewOpen, disabled: sending, onClick: onTogglePayloadPreview, size: "small", children: /* @__PURE__ */ jsx7(Icon2, { icon: "mdi:code-json", size: 22 }) }) }) }),
      /* @__PURE__ */ jsx7(Tooltip, { title: "Adjuntar imagen o audio", children: /* @__PURE__ */ jsx7("span", { children: /* @__PURE__ */ jsx7(
        IconButton,
        {
          color: "inherit",
          className: "paty-chat-attach-btn",
          "aria-label": "Adjuntar imagen o audio",
          disabled: sending || images.length >= MAX_CHAT_IMAGES && audios.length >= MAX_CHAT_AUDIOS,
          onClick: onAttachClick,
          size: "small",
          children: /* @__PURE__ */ jsx7(Icon2, { icon: "mdi:paperclip", size: 22 })
        }
      ) }) }),
      /* @__PURE__ */ jsx7(Tooltip, { title: canRecord ? isRecording ? "Detener grabaci\xF3n" : "Grabar nota de voz" : "Grabaci\xF3n no disponible en este navegador", children: /* @__PURE__ */ jsx7("span", { children: /* @__PURE__ */ jsx7(
        IconButton,
        {
          color: isRecording ? "error" : "inherit",
          className: `paty-chat-mic-btn${isRecording ? " paty-chat-mic-btn--recording" : ""}`,
          "aria-label": isRecording ? "Detener grabaci\xF3n" : "Grabar nota de voz",
          "aria-pressed": isRecording,
          disabled: sending || !canRecord || audios.length >= MAX_CHAT_AUDIOS,
          onClick: onToggleVoiceRecord,
          size: "small",
          children: /* @__PURE__ */ jsx7(Icon2, { icon: isRecording ? "mdi:stop-circle-outline" : "mdi:microphone-outline", size: 22 })
        }
      ) }) }),
      /* @__PURE__ */ jsx7(
        TextField,
        {
          inputRef,
          fullWidth: true,
          multiline: true,
          maxRows: 6,
          size: "small",
          placeholder: isRecording ? "Grabando nota de voz\u2026" : "Escribe tu consulta\u2026 (Ctrl+V, imagen o nota de voz)",
          value: draft,
          onChange: onDraftChange,
          onPaste,
          onKeyDown: (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          },
          disabled: sending || isRecording
        }
      ),
      /* @__PURE__ */ jsx7(Button, { variant: "contained", disabled: sending || isRecording || !hasContent, onClick: onSend, children: sending ? /* @__PURE__ */ jsx7(CircularProgress, { size: 20, color: "inherit" }) : "Enviar" })
    ] }),
    /* @__PURE__ */ jsx7(ImageLightboxDialog, { open: Boolean(lightboxSrc), src: lightboxSrc, onClose: () => setLightboxSrc(null) })
  ] });
}

// js/tools/chat/ChatThreadSidebar.jsx
init_platform();
init_patyia_jwt();

// js/tools/chat/ChatSessionPanel.jsx
init_platform();
init_patyia();
init_patyia_jwt();
import { jsx as jsx8, jsxs as jsxs7 } from "react/jsx-runtime";
var { useState: useState5, useEffect: useEffect5, useMemo: useMemo5 } = getReact();
var { Box: Box4, Typography: Typography2, CircularProgress: CircularProgress2, Chip: Chip2 } = getMaterialUI();
var { Icon: Icon3 } = UI;

// js/tools/chat/ConvSearchAutocomplete.jsx
init_platform();
import { Fragment as Fragment3, jsx as jsx9, jsxs as jsxs8 } from "react/jsx-runtime";
import { createElement } from "react";
var { useState: useState6, useEffect: useEffect6, useRef: useRef2, useCallback, useMemo: useMemo6 } = getReact();
var { Autocomplete, TextField: TextField2, Typography: Typography3, Box: Box5, IconButton: IconButton2, InputAdornment } = getMaterialUI();
var { Icon: Icon4 } = UI;

// js/tools/chat/auditScope.ts
init_patyia_jwt();

// js/tools/chat/ChatThreadSidebar.jsx
import { Fragment as Fragment4, jsx as jsx10, jsxs as jsxs9 } from "react/jsx-runtime";
var {
  Box: Box6,
  Typography: Typography4,
  Button: Button2,
  IconButton: IconButton3,
  List,
  ListItemButton,
  ListItemText,
  CircularProgress: CircularProgress3,
  Tooltip: Tooltip2,
  Stack: Stack2,
  Divider,
  Select,
  MenuItem,
  FormControl
} = getMaterialUI();
var { Icon: Icon5 } = UI;
function MessageSourceSwitch({ messageSource, onChange }) {
  const isProd = messageSource === "prod";
  const title = isProd ? "Modo producci\xF3n (sin meta)" : "Modo logs (con meta)";
  const hint = isProd ? "Clic para ver logs" : "Clic para ver producci\xF3n";
  const icon = isProd ? "mdi:earth" : "mdi:code-json";
  return /* @__PURE__ */ jsx10(Tooltip2, { title: `${title} \xB7 ${hint}`, children: /* @__PURE__ */ jsx10(IconButton3, { color: "inherit", size: "small", onClick: () => onChange?.(isProd ? "logs" : "prod"), "aria-label": title, "aria-pressed": !isProd, children: /* @__PURE__ */ jsx10(Icon5, { icon, size: 18 }) }) });
}
function ChatModeSwitch({ mode, onChange }) {
  const isLibre = isLibreChatMode(mode);
  const title = isLibre ? "Libre" : "Patyia";
  const icon = isLibre ? "game-icons:freedom-dove" : "game-icons:bird-cage";
  return /* @__PURE__ */ jsx10(Tooltip2, { title, children: /* @__PURE__ */ jsx10(
    IconButton3,
    {
      color: "inherit",
      size: "small",
      className: `paty-chat-mode-btn${isLibre ? " paty-chat-mode-btn--libre" : ""}`,
      onClick: () => onChange?.(isLibre ? CHAT_MODE_PATYIA : CHAT_MODE_LIBRE),
      "aria-label": title,
      "aria-pressed": isLibre,
      children: /* @__PURE__ */ jsx10(Icon5, { icon, size: 18 })
    }
  ) });
}
function LlmProviderSwitch({ provider, onChange }) {
  const isMm = isMinimaxChatProvider(provider);
  const title = isMm ? "MiniMax M3" : "OpenAI";
  const hint = isMm ? "Clic \u2192 OpenAI (default)" : "Clic \u2192 MiniMax M3 (experimental)";
  const icon = isMm ? "mdi:creation" : "simple-icons:openai";
  return /* @__PURE__ */ jsx10(Tooltip2, { title: `${title} \xB7 ${hint}`, children: /* @__PURE__ */ jsx10(
    IconButton3,
    {
      color: isMm ? "secondary" : "inherit",
      size: "small",
      className: `paty-chat-provider-btn${isMm ? " paty-chat-provider-btn--minimax" : ""}`,
      onClick: () => onChange?.(isMm ? CHAT_PROVIDER_OPENAI : CHAT_PROVIDER_MINIMAX),
      "aria-label": title,
      "aria-pressed": isMm,
      children: /* @__PURE__ */ jsx10(Icon5, { icon, size: 18 })
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
  return /* @__PURE__ */ jsxs9(
    Stack2,
    {
      direction: "row",
      spacing: 0.35,
      alignItems: "center",
      className: "paty-chat-sidebar-head-actions",
      onClick: (e) => e.stopPropagation(),
      onKeyDown: (e) => e.stopPropagation(),
      children: [
        onClose ? /* @__PURE__ */ jsx10(Tooltip2, { title: "Cerrar panel", children: /* @__PURE__ */ jsx10(IconButton3, { size: "small", onClick: onClose, "aria-label": "Cerrar panel", children: /* @__PURE__ */ jsx10(Icon5, { icon: "mdi:close", size: 18 }) }) }) : null,
        onMessageSourceChange ? /* @__PURE__ */ jsx10(MessageSourceSwitch, { messageSource, onChange: onMessageSourceChange }) : null,
        onChatModeChange ? /* @__PURE__ */ jsx10(ChatModeSwitch, { mode, onChange: onChatModeChange }) : null,
        onLlmProviderChange ? /* @__PURE__ */ jsx10(LlmProviderSwitch, { provider: llmProvider, onChange: onLlmProviderChange }) : null
      ]
    }
  );
}

// js/tools/chat/ChatMainPanel.jsx
import { jsx as jsx11, jsxs as jsxs10 } from "react/jsx-runtime";
var {
  Box: Box7,
  Typography: Typography5,
  Button: Button3,
  IconButton: IconButton4,
  Tooltip: Tooltip3,
  Alert: Alert2,
  Stack: Stack3
} = getMaterialUI();
var { Icon: Icon6 } = UI;
function ChatMainPanel({ jwt, needsJwt, viewingAuditOther, selectedId, detail, canSend, loadingThread, refreshingThread = false, sending, showThread, logError, displayMensajes, chatUserDisplayName, chatUserNick, ratingMsgId, threadScrollRef, onThreadScroll, onOpenJwt, onClearAuditFilter, onRefreshConv, draft, images, audios, isRecording, payloadPreviewOpen, postBodyPreview, inputRef, attachInputRef, onDraftChange, onPaste, onSend, onTogglePayloadPreview, onAttachClick, onAttachChange, onToggleVoiceRecord, onRemoveImage, onRemoveAudio, onMeta, onRateMessage, onOpenSidebar, messageSource = "logs", mode, llmProvider = "openai", onMessageSourceChange, onChatModeChange, onLlmProviderChange, onContapymeLoginDone = null }) {
  const isProdView = messageSource === "prod";
  const hasThread = Boolean(selectedId || detail);
  const headerActions = /* @__PURE__ */ jsx11(
    ChatSidebarHeaderActions,
    {
      messageSource,
      mode,
      llmProvider,
      onMessageSourceChange,
      onChatModeChange,
      onLlmProviderChange
    }
  );
  return /* @__PURE__ */ jsxs10(Box7, { sx: { flex: 1, minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column" }, children: [
    onOpenSidebar ? /* @__PURE__ */ jsxs10(
      Stack3,
      {
        direction: "row",
        spacing: 1,
        alignItems: "center",
        className: "paty-chat-main-toolbar",
        sx: { px: 1, py: 0.5, minHeight: 40, flexShrink: 0 },
        children: [
          /* @__PURE__ */ jsx11(Tooltip3, { title: "Conversaciones", arrow: true, children: /* @__PURE__ */ jsx11(IconButton4, { size: "small", onClick: onOpenSidebar, "aria-label": "Abrir conversaciones", children: /* @__PURE__ */ jsx11(Icon6, { icon: "mdi:menu-open", size: 20 }) }) }),
          /* @__PURE__ */ jsx11(Typography5, { variant: "subtitle2", sx: { fontWeight: 700, flex: 1, minWidth: 0 }, noWrap: true, children: "Conversaciones" }),
          headerActions,
          hasThread ? /* @__PURE__ */ jsx11(Tooltip3, { title: "Actualizar conversaci\xF3n", arrow: true, children: /* @__PURE__ */ jsx11("span", { children: /* @__PURE__ */ jsx11(
            ButtonIconify,
            {
              icon: "mdi:refresh",
              title: "Actualizar",
              onClick: onRefreshConv,
              disabled: refreshingThread,
              busy: refreshingThread
            }
          ) }) }) : null
        ]
      }
    ) : /* @__PURE__ */ jsxs10(
      Stack3,
      {
        direction: "row",
        spacing: 1,
        alignItems: "center",
        className: "paty-chat-main-toolbar paty-chat-main-toolbar--desktop",
        sx: { px: 2, py: 0.75, flexShrink: 0 },
        children: [
          /* @__PURE__ */ jsx11(Box7, { sx: { flex: 1 } }),
          headerActions,
          hasThread ? /* @__PURE__ */ jsx11(Tooltip3, { title: "Actualizar conversaci\xF3n", arrow: true, children: /* @__PURE__ */ jsx11("span", { children: /* @__PURE__ */ jsx11(
            ButtonIconify,
            {
              icon: "mdi:refresh",
              title: "Actualizar",
              onClick: onRefreshConv,
              disabled: refreshingThread,
              busy: refreshingThread
            }
          ) }) }) : null
        ]
      }
    ),
    needsJwt && /* @__PURE__ */ jsxs10(
      Alert2,
      {
        severity: "info",
        sx: { mx: 2, mt: 1, flexShrink: 0 },
        action: /* @__PURE__ */ jsx11(Button3, { color: "inherit", size: "small", onClick: onOpenJwt, children: "Configurar JWT" }),
        children: [
          "Modo lectura \u2014 puedes explorar conversaciones. Configura el JWT de",
          " ",
          /* @__PURE__ */ jsx11(Typography5, { component: "a", href: "https://www.contapyme.com/soporte-staging/", target: "_blank", rel: "noreferrer", variant: "inherit", children: "soporte-staging" }),
          " ",
          "para enviar mensajes."
        ]
      }
    ),
    viewingAuditOther && /* @__PURE__ */ jsx11(Alert2, { severity: "info", sx: { mx: 2, mt: 1, flexShrink: 0 }, action: /* @__PURE__ */ jsx11(
      IconButton4,
      {
        color: "inherit",
        size: "small",
        "aria-label": jwt?.claims?.itercero ? "Volver a mi JWT" : "Ver recientes",
        onClick: onClearAuditFilter,
        children: /* @__PURE__ */ jsx11(Icon6, { icon: "mdi:close", size: 18 })
      }
    ), children: "Viendo conversaciones de otro usuario \u2014 lectura." }),
    !showThread ? /* @__PURE__ */ jsx11(
      Box7,
      {
        className: "paty-chat-thread-surface",
        sx: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0, ...convLogSurfaceSx({ flex: 1 }) },
        children: /* @__PURE__ */ jsx11(Box7, { sx: { textAlign: "center", maxWidth: 420, p: 2, borderRadius: 2, border: 1, borderColor: "divider", borderStyle: "dashed" }, children: /* @__PURE__ */ jsx11(Typography5, { variant: "body1", children: canSend ? "Escribe un mensaje abajo para iniciar una conversaci\xF3n." : needsJwt ? "Selecciona una conversaci\xF3n del listado o configura JWT para chatear." : "Selecciona una conversaci\xF3n o crea una nueva." }) })
      }
    ) : /* @__PURE__ */ jsx11(
      ConvLogThread,
      {
        scrollRef: threadScrollRef,
        onScroll: onThreadScroll,
        mensajes: displayMensajes,
        onMeta: isProdView ? void 0 : onMeta,
        compactMeta: false,
        showUsageStats: !isProdView,
        chatUserDisplayName,
        chatUserNick,
        surfaceClassName: "paty-chat-thread-surface",
        streamingMsgId: sending ? "stream-live" : null,
        emptyHint: "Sin mensajes en esta conversaci\xF3n.",
        canRate: canSend && Boolean(jwt?.token),
        onRateMessage,
        ratingMsgId,
        threadKey: selectedId ?? "draft",
        loading: loadingThread,
        loadingOnlyWhenEmpty: !sending,
        error: logError,
        onContapymeLoginDone
      }
    ),
    /* @__PURE__ */ jsx11(
      ChatComposer,
      {
        canSend,
        sending,
        draft,
        images,
        audios,
        isRecording,
        payloadPreviewOpen,
        postBodyPreview,
        inputRef,
        attachInputRef,
        onDraftChange,
        onPaste,
        onSend,
        onTogglePayloadPreview,
        onAttachClick,
        onAttachChange,
        onToggleVoiceRecord,
        onRemoveImage,
        onRemoveAudio
      }
    )
  ] });
}
export {
  ChatMainPanel
};
