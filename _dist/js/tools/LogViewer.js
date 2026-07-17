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
function getIsaSplitView() {
  const C = window.ISAFront?.Layout?.IsaSplitView;
  if (!C) {
    throw new Error("IsaSplitView no cargado \u2014 recargue sin cach\xE9 (Ctrl+Shift+R).");
  }
  return C;
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
function toastError(text, timeout) {
  fb()?.toast?.error?.(text, timeout);
}
function toastSuccess(text, timeout) {
  fb()?.toast?.success?.(text, timeout);
}
function toastWarning(text, timeout) {
  fb()?.toast?.warning?.(text, timeout);
}
var bridge, UI, Session, Config, getReact, getMaterialUI, Lightbox, fb;
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
    fb = () => globalThis.ISAFront?.Feedback;
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
var PATYIA_JWT_STORAGE_KEY;
var init_patyia_jwt = __esm({
  "js/core/patyia-jwt.ts"() {
    init_portalJwtApi();
    init_apiClient();
    init_platform();
    PATYIA_JWT_STORAGE_KEY = "isa-patyia:paty-jwt";
  }
});

// js/api/issListFilter.ts
var init_issListFilter = __esm({
  "js/api/issListFilter.ts"() {
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
async function getConversacionLogs(jwt, id) {
  return jsonFetch(`/conversacion/logs/${id}`, jwt);
}
function convLogFromDetalle(detail, id) {
  const raw = detail?.convLog;
  if (!raw || !Array.isArray(raw.mensajes) || !raw.mensajes.length) return null;
  const convId = Number(raw.iconversacion ?? detail?.iconversacion ?? id ?? 0);
  return { ...raw, iconversacion: convId > 0 ? convId : raw.iconversacion };
}
var init_patyiaChatApi = __esm({
  "js/api/patyiaChatApi.ts"() {
    init_issListFilter();
    init_patyiaTokens();
    init_patyia();
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
function roleKey2(name) {
  return String(name ?? "").trim().toLowerCase();
}
function formatViewAsRoleLabel(roleName) {
  const key = roleKey2(roleName);
  if (!key) return "";
  const opt = VIEW_AS_ROLE_OPTIONS.find((o) => o.id === key);
  if (opt) return opt.label;
  const canon = canonicalRoleMeta(key);
  if (canon?.namedisplay) return canon.namedisplay;
  return key.split("_").map((p) => p === "iss" ? "ISS" : p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}
function readViewAsRole() {
  try {
    const v = roleKey2(localStorage.getItem(VIEW_AS_ROLE_LS_KEY));
    if (!v || v === "dev_lead") return "";
    if (!ROLE_CAPS_PRESETS[v]) return "";
    return v;
  } catch {
    return "";
  }
}
function writeViewAsRole(roleName) {
  const key = roleKey2(roleName);
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
  return (roles ?? []).some((r) => roleKey2(r) === "dev_lead");
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

// js/api/apiClient.ts
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

// js/tools/LogViewer.jsx
init_platform();
init_platform();

// js/ui/shared.jsx
init_platform();

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
    const txt = textFromOpenAIReceive(r);
    if (txt) flat.text = txt;
    if (typeof r?.model === "string") flat.model = r.model;
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
    clasificador_vector_usado: Array.isArray(raw.clasificador_vector_usado) && raw.clasificador_vector_usado.length ? raw.clasificador_vector_usado.map(String) : void 0
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
function parseLogInput(raw) {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) throw new Error("Pega el contenido de conv-*.json o la respuesta del API /conversacion/logs/{id}.");
  const parsed = JSON.parse(trimmed);
  if (parsed.log && Array.isArray(parsed.log.mensajes)) {
    return {
      iconversacion: parsed.log.iconversacion ?? parsed.iconversacion,
      mensajes: parsed.log.mensajes,
      resumen: parsed.log.resumen
    };
  }
  if (Array.isArray(parsed.mensajes)) {
    return {
      iconversacion: parsed.iconversacion,
      mensajes: parsed.mensajes,
      resumen: parsed.resumen
    };
  }
  throw new Error("JSON inv\xE1lido: se espera conv-*.json o { ok, log: { mensajes } }.");
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
var CONV_LOG_PAD = { p: { xs: 1.25, sm: 2, md: 3 } };
function convLogSurfaceSx(extra = {}) {
  return { flex: 1, minHeight: 0, overflow: "auto", bgcolor: "transparent", ...CONV_LOG_PAD, ...extra };
}

// js/ui/shared.jsx
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
    const { Typography: Typography3, Box: Box4 } = getMaterialUI();
    return /* @__PURE__ */ jsx(Box4, { sx: { p: 2, textAlign: "center" }, children: /* @__PURE__ */ jsx(Typography3, { variant: "body2", color: "error", children: "No se pudo cargar el visor de im\xE1genes. Recargue sin cach\xE9 (Ctrl+Shift+R)." }) });
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
function glassDialogTabsSx(extra = {}) {
  return {
    px: { xs: 1.5, sm: 2 },
    minHeight: 44,
    borderBottom: 1,
    borderColor: (t) => t.palette.mode === "dark" ? "rgba(99,102,241,0.28)" : "divider",
    bgcolor: (t) => t.palette.mode === "dark" ? "rgba(15,23,42,0.38)" : "rgba(248,250,252,0.92)",
    "& .MuiTab-root": { minHeight: 44, textTransform: "none", fontWeight: 600, fontSize: "0.88rem", opacity: 0.82 },
    "& .MuiTab-root.Mui-selected": { opacity: 1, color: "#1e90ff !important" },
    "& .MuiTabs-indicator": {
      height: 3,
      borderRadius: "3px 3px 0 0",
      background: "linear-gradient(90deg, #1e90ff, #00e5ff)",
      boxShadow: "0 0 14px rgba(0,229,255,0.42)"
    },
    ...extra
  };
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
  const { DialogActions: DialogActions2, Button: Button2 } = getMaterialUI();
  return /* @__PURE__ */ jsx2(DialogActions2, { sx: glassDialogActionsSx(), children: /* @__PURE__ */ jsx2(Button2, { onClick: onClose, sx: { textTransform: "none", fontWeight: 600, minWidth: 72 }, children: label }) });
}
function GlassDialogHeader({ icon = "mdi:information-outline", title, subtitle, accent = "#1e90ff", onClose }) {
  const { Box: Box4, Typography: Typography3, IconButton: IconButton2, Stack: Stack3 } = getMaterialUI();
  const { Icon } = UI;
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
    /* @__PURE__ */ jsx2(Box4, { sx: bandSx, children: /* @__PURE__ */ jsxs(Stack3, { direction: "row", spacing: 1.25, alignItems: "center", sx: { pr: onClose ? 4 : 0 }, children: [
      /* @__PURE__ */ jsx2(Box4, { sx: iconSx, children: /* @__PURE__ */ jsx2(Icon, { icon, size: 24 }) }),
      /* @__PURE__ */ jsxs(Box4, { sx: { flex: 1, minWidth: 0 }, children: [
        /* @__PURE__ */ jsx2(Typography3, { variant: "h5", component: "h2", sx: titleSx, children: title }),
        subtitle ? /* @__PURE__ */ jsx2(Typography3, { variant: "caption", color: "text.secondary", display: "block", sx: { mt: 0.35, lineHeight: 1.4 }, children: subtitle }) : null
      ] })
    ] }) }),
    onClose ? /* @__PURE__ */ jsx2(IconButton2, { size: "small", onClick: onClose, "aria-label": "Cerrar", className: "isa-glass-dialog__close", sx: { position: "absolute", top: 10, right: 10 }, children: /* @__PURE__ */ jsx2(Icon, { icon: "mdi:close", size: 18 }) }) : null
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
  { key: "in", label: "in" },
  { key: "cache", label: "cache" },
  { key: "out", label: "out" },
  { key: "total", label: "total" },
  { key: "reason", label: "reason" }
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
  const gridStyle = { gridTemplateColumns };
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
function MetaDialogImages({ items, onImageClick, topGap = 0 }) {
  const renderable = filterDisplayableImages(items);
  if (!renderable.length) return null;
  return /* @__PURE__ */ jsx3(
    Box,
    {
      className: "conv-msg-images conv-msg-images--left meta-dialog-images",
      sx: { display: "flex", flexWrap: "wrap", gap: 1, mt: topGap },
      children: renderable.map((src, idx) => /* @__PURE__ */ jsx3(
        "button",
        {
          type: "button",
          className: "conv-msg-image-lightbox-btn",
          "aria-label": `Ver imagen adjunta ${idx + 1} en tama\xF1o completo`,
          onClick: () => onImageClick?.(src),
          children: /* @__PURE__ */ jsx3("img", { src, alt: `Adjunto ${idx + 1}`, loading: "lazy" })
        },
        `${idx}-${src.slice(0, 32)}`
      ))
    }
  );
}
function PromptSummaryCard({ meta, tokens, usageStats, isUserMessage = false }) {
  const promptChars = meta.prompt_chars ?? String(meta.prompt_markdown ?? "").length;
  const responseChars = meta.response_chars;
  const imageCount = filterDisplayableImages(meta.imagenes).length;
  const charStats = [
    ...promptChars ? [{
      key: "prompt-ch",
      label: isUserMessage ? "Caracteres consulta" : "Caracteres prompt",
      value: Number(promptChars).toLocaleString("es-CO"),
      tone: "accent"
    }] : [],
    ...imageCount ? [{ key: "img-n", label: "Im\xE1genes adjuntas", value: String(imageCount), tone: "neutral" }] : [],
    ...typeof responseChars === "number" ? [{ key: "resp-ch", label: "Caracteres respuesta", value: responseChars.toLocaleString("es-CO"), tone: "neutral" }] : []
  ];
  const currentTokens = usageStats?.tokens ?? tokens;
  const currentCost = usageStats?.cost ?? meta?.cost;
  const usageSections = usageStats ? [
    { key: "msg", label: "Mensaje", tokens: usageStats.tokens, cost: usageStats.cost, show: true },
    {
      key: "cum",
      label: "Acumulado",
      tokens: usageStats.cumulativeTokens,
      cost: usageStats.cumulativeCost,
      show: usageHasData(usageStats.cumulativeTokens, usageStats.cumulativeCost)
    }
  ].filter((s) => s.show) : [{ key: "msg", label: "Mensaje", tokens: currentTokens, cost: currentCost, show: usageHasData(currentTokens, currentCost) }];
  const hasUsage = usageSections.some((s) => usageHasData(s.tokens, s.cost));
  const hasCharStats = charStats.length > 0;
  return /* @__PURE__ */ jsxs2(Box, { className: "meta-prompt-summary", children: [
    hasCharStats || hasUsage ? /* @__PURE__ */ jsxs2(Stack, { direction: "row", alignItems: "center", spacing: 0.75, className: "meta-prompt-summary__head", children: [
      /* @__PURE__ */ jsx3(
        "iconify-icon",
        {
          icon: isUserMessage ? "mdi:message-text-outline" : "mdi:file-document-edit-outline",
          width: "18",
          height: "18"
        }
      ),
      /* @__PURE__ */ jsx3(Typography, { variant: "subtitle2", className: "meta-prompt-summary__title", sx: { flex: 1, fontWeight: 700 }, children: isUserMessage ? "Resumen de la consulta" : "Resumen del prompt" }),
      hasUsage ? /* @__PURE__ */ jsx3(
        Chip,
        {
          size: "small",
          className: "meta-prompt-summary__badge",
          label: isUserMessage ? "tokens + costo" : "tokens + costo",
          icon: /* @__PURE__ */ jsx3("iconify-icon", { icon: "mdi:finance", width: "13", height: "13" })
        }
      ) : null
    ] }) : null,
    /* @__PURE__ */ jsxs2("div", { className: "meta-prompt-summary__grid", children: [
      charStats.map((s) => /* @__PURE__ */ jsxs2("div", { className: `meta-prompt-stat meta-prompt-stat--${s.tone || "neutral"}`, children: [
        /* @__PURE__ */ jsx3("span", { className: "meta-prompt-stat__k", children: s.label }),
        /* @__PURE__ */ jsx3("span", { className: "meta-prompt-stat__v", children: s.value })
      ] }, s.key)),
      hasUsage ? /* @__PURE__ */ jsxs2("div", { className: "meta-prompt-stat meta-prompt-stat--usage", children: [
        /* @__PURE__ */ jsx3("span", { className: "meta-prompt-stat__k", children: "Tokens y costo" }),
        /* @__PURE__ */ jsx3("div", { className: "meta-prompt-stat__usage-body", children: /* @__PURE__ */ jsx3(MetaUsageGrid, { sections: usageSections }) })
      ] }) : null
    ] })
  ] });
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
  const { Typography: Typography3, Box: Box4, Stack: Stack3, Chip: Chip3, IconButton: IconButton2, Tooltip: Tooltip2 } = getMaterialUI();
  const { useState: useState5, useMemo: useMemo4 } = getReact();
  const trace = fileSearchFromMeta(meta);
  const archivos = archivosCitadosFromMeta(meta);
  const chunks = useMemo4(() => chunksFromMeta(meta), [meta]);
  const vectorStores = useMemo4(() => vectorStoresFromMeta(meta), [meta]);
  const [openChunk, setOpenChunk] = useState5(null);
  if (!trace?.length && !archivos.length && !chunks.length && !vectorStores.length) return null;
  return /* @__PURE__ */ jsxs2(Box4, { className: "meta-file-search", sx: { mt: 1.5 }, children: [
    vectorStores.length ? /* @__PURE__ */ jsxs2(Box4, { className: "meta-file-search__vector-stores", sx: { mb: 1.5 }, children: [
      /* @__PURE__ */ jsx3(Typography3, { variant: "subtitle2", fontWeight: 700, sx: { mb: 0.75 }, children: "Vector stores consultados" }),
      /* @__PURE__ */ jsxs2(Typography3, { variant: "caption", color: "text.secondary", display: "block", sx: { mb: 0.75 }, children: [
        "\xCDndice = posici\xF3n en ",
        /* @__PURE__ */ jsx3("code", { children: "vector_store_ids" }),
        " enviado al modelo (0 = primero). Usa el ID completo para verificar en OpenAI/BD."
      ] }),
      /* @__PURE__ */ jsx3(Stack3, { spacing: 0.5, children: vectorStores.map((vs) => /* @__PURE__ */ jsxs2(
        Box4,
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
            /* @__PURE__ */ jsx3(Typography3, { component: "code", variant: "body2", sx: { wordBreak: "break-all", fontFamily: "monospace" }, children: vs.id })
          ]
        },
        vs.id
      )) })
    ] }) : null,
    /* @__PURE__ */ jsx3(Typography3, { variant: "subtitle2", fontWeight: 700, sx: { mb: 0.75 }, children: "File Search (archivos citados)" }),
    archivos.length ? /* @__PURE__ */ jsx3(Stack3, { direction: "row", spacing: 0.5, flexWrap: "wrap", useFlexGap: true, sx: { mb: chunks.length ? 1.25 : 0 }, children: archivos.map((name) => /* @__PURE__ */ jsx3(
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
    chunks.length ? /* @__PURE__ */ jsx3(Stack3, { spacing: 0.85, className: "meta-file-search__chunk-list", children: chunks.map((c) => {
      const preview = chunkPreview(c.text, 380);
      const vsIdx = c.vectorStoreId ? vectorStoreIndexLabel(vectorStores, c.vectorStoreId) : null;
      return /* @__PURE__ */ jsxs2(Box4, { className: "meta-file-search__chunk", children: [
        /* @__PURE__ */ jsxs2(Stack3, { direction: "row", spacing: 0.75, alignItems: "center", sx: { mb: 0.5 }, children: [
          /* @__PURE__ */ jsx3("iconify-icon", { icon: "mdi:text-box-search-outline", width: "16", height: "16" }),
          /* @__PURE__ */ jsx3(Typography3, { variant: "body2", fontWeight: 600, sx: { flex: 1, minWidth: 0 }, children: c.filename || c.fileId || "fragmento" }),
          vsIdx != null ? /* @__PURE__ */ jsx3(
            Chip3,
            {
              size: "small",
              variant: "outlined",
              label: `VS \xEDndice ${vsIdx}`,
              title: c.vectorStoreId || void 0,
              className: "meta-file-search__vs-chip"
            }
          ) : null,
          c.score != null ? /* @__PURE__ */ jsx3(
            Chip3,
            {
              size: "small",
              variant: "outlined",
              label: `score ${Number(c.score).toFixed(3)}`,
              className: "meta-file-search__score"
            }
          ) : null,
          /* @__PURE__ */ jsx3(Tooltip2, { title: "Ver fragmento en full-page", children: /* @__PURE__ */ jsx3(
            IconButton2,
            {
              size: "small",
              "aria-label": `Ver fragmento de ${c.filename || c.fileId || "fragmento"}`,
              onClick: () => setOpenChunk(c),
              className: "meta-file-search__open",
              children: /* @__PURE__ */ jsx3("iconify-icon", { icon: "mdi:fullscreen", width: "16", height: "16" })
            }
          ) })
        ] }),
        c.queries?.length ? /* @__PURE__ */ jsxs2(Typography3, { variant: "caption", color: "text.secondary", display: "block", sx: { mb: 0.35 }, children: [
          "Queries: ",
          c.queries.join(" \xB7 ")
        ] }) : null,
        /* @__PURE__ */ jsx3(
          Typography3,
          {
            variant: "caption",
            component: "pre",
            className: "meta-file-search__preview",
            sx: {
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              m: 0,
              fontFamily: "inherit"
            },
            children: preview
          }
        )
      ] }, c.key);
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
  const { DialogContent: DialogContent3 } = getMaterialUI();
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
    /* @__PURE__ */ jsx3(DialogContent3, { dividers: true, sx: glassDialogContentSx(), children: /* @__PURE__ */ jsx3(FileSearchMetaSection, { meta }) }),
    /* @__PURE__ */ jsx3(GlassDialogCloseActions, { onClose })
  ] });
}
function MetaDialog({
  open,
  onClose,
  meta,
  title,
  isUserMessage = false,
  usageStats = null,
  userContent = "",
  imagenes = null
}) {
  const [tab, setTab] = useState2(0);
  const [lightboxSrc, setLightboxSrc] = useState2(null);
  const resolvedMeta = useMemo(() => {
    if (!meta) return null;
    if (!isUserMessage) return meta;
    const text = String(meta.prompt_markdown || userContent || "").trim();
    const imgs = filterDisplayableImages(
      Array.isArray(meta.imagenes) && meta.imagenes.length ? meta.imagenes : imagenes
    );
    return {
      ...meta,
      ...text ? { prompt_markdown: text, prompt_chars: meta.prompt_chars ?? text.length } : {},
      ...imgs.length ? { imagenes: imgs } : {}
    };
  }, [meta, isUserMessage, userContent, imagenes]);
  const promptMarkdown = String(resolvedMeta?.prompt_markdown ?? "").trim();
  const userImagenes = filterDisplayableImages(resolvedMeta?.imagenes);
  const iinstruccion = bdInstructionKey(resolvedMeta) || String(resolvedMeta?.extra?.operativa_key ?? "").trim();
  const hasPrompt = Boolean(promptMarkdown) || Boolean(iinstruccion) || userImagenes.length > 0;
  const promptTabLabel = isUserMessage ? "Consulta" : "Prompt";
  useEffect2(() => {
    if (open) setTab(0);
  }, [open, resolvedMeta?.ts, resolvedMeta?.prompt_id, promptMarkdown, userImagenes.length]);
  useEffect2(() => {
    if (!open) setLightboxSrc(null);
  }, [open]);
  if (!resolvedMeta) return null;
  const tk = resolvedMeta.tokens?.total ? resolvedMeta.tokens : tokensFromUsage(resolvedMeta.usage);
  function renderMetaGrid() {
    return /* @__PURE__ */ jsxs2("div", { className: "meta-grid meta-dialog-panel", children: [
      resolvedMeta.nombre_usuario && /* @__PURE__ */ jsxs2("div", { className: "meta-row", children: [
        /* @__PURE__ */ jsx3("span", { className: "meta-k", children: "nombre" }),
        /* @__PURE__ */ jsx3("span", { className: "meta-v", children: /* @__PURE__ */ jsx3("strong", { children: resolvedMeta.nombre_usuario }) })
      ] }),
      resolvedMeta.itdconsulta && /* @__PURE__ */ jsxs2("div", { className: "meta-row", children: [
        /* @__PURE__ */ jsx3("span", { className: "meta-k", children: "itdconsulta" }),
        /* @__PURE__ */ jsx3("span", { className: "meta-v", children: /* @__PURE__ */ jsx3("span", { className: "badge badge-itd", children: resolvedMeta.itdconsulta }) })
      ] }),
      !isUserMessage && iinstruccion && /* @__PURE__ */ jsxs2("div", { className: "meta-row", children: [
        /* @__PURE__ */ jsx3("span", { className: "meta-k", children: "iinstruccion" }),
        /* @__PURE__ */ jsx3("span", { className: "meta-v", children: /* @__PURE__ */ jsx3("code", { children: iinstruccion }) })
      ] }),
      resolvedMeta.premisas?.length ? /* @__PURE__ */ jsxs2("div", { className: "meta-row", children: [
        /* @__PURE__ */ jsx3("span", { className: "meta-k", children: "premisas" }),
        /* @__PURE__ */ jsx3("span", { className: "meta-v", children: resolvedMeta.premisas.join(", ") })
      ] }) : null,
      resolvedMeta.usage && /* @__PURE__ */ jsxs2("div", { className: "meta-row meta-row--block", children: [
        /* @__PURE__ */ jsx3("span", { className: "meta-k", children: "usage" }),
        /* @__PURE__ */ jsx3("span", { className: "meta-v meta-v--full", children: /* @__PURE__ */ jsx3(
          CodeMirrorPanel,
          {
            value: JSON.stringify(resolvedMeta.usage, null, 2),
            readOnly: true,
            json: true,
            minHeight: "5rem",
            maxHeight: "18rem",
            lineWrapping: true
          }
        ) })
      ] }),
      /* @__PURE__ */ jsx3(FileSearchMetaSection, { meta: resolvedMeta })
    ] });
  }
  const headerMeta = resolveMetaDialogHeader(title, isUserMessage);
  return /* @__PURE__ */ jsxs2(Fragment, { children: [
    /* @__PURE__ */ jsxs2(
      GlassDialog,
      {
        open,
        onClose,
        maxWidth: "md",
        fullWidth: true,
        header: /* @__PURE__ */ jsx3(
          GlassDialogHeader,
          {
            icon: headerMeta.icon,
            title: headerMeta.title,
            subtitle: headerMeta.subtitle,
            accent: headerMeta.accent,
            onClose
          }
        ),
        children: [
          hasPrompt && /* @__PURE__ */ jsxs2(Tabs, { value: tab, onChange: (_, next) => setTab(next), sx: glassDialogTabsSx(), children: [
            /* @__PURE__ */ jsx3(Tab, { label: "Trazabilidad" }),
            /* @__PURE__ */ jsx3(Tab, { label: promptTabLabel })
          ] }),
          /* @__PURE__ */ jsxs2(DialogContent, { dividers: true, sx: glassDialogContentSx(), children: [
            /* @__PURE__ */ jsx3(Box, { sx: { display: tab === 0 || !hasPrompt ? "block" : "none", minHeight: 0 }, children: renderMetaGrid() }),
            hasPrompt && /* @__PURE__ */ jsx3(Box, { sx: { display: tab === 1 ? "block" : "none", minHeight: 0, flex: 1 }, children: /* @__PURE__ */ jsx3(
              PromptPanelBody,
              {
                resolvedMeta,
                tk,
                usageStats,
                isUserMessage,
                promptMarkdown,
                userImagenes,
                setLightboxSrc,
                iinstruccion,
                dialogTitle: title
              }
            ) })
          ] }),
          /* @__PURE__ */ jsx3(GlassDialogCloseActions, { onClose })
        ]
      }
    ),
    /* @__PURE__ */ jsx3(ImageLightboxDialog, { open: Boolean(lightboxSrc), src: lightboxSrc, onClose: () => setLightboxSrc(null) })
  ] });
}
function PromptPanelBody({
  resolvedMeta,
  tk,
  usageStats,
  isUserMessage,
  promptMarkdown,
  userImagenes,
  setLightboxSrc,
  iinstruccion,
  dialogTitle
}) {
  const [fullPage, setFullPage] = useState2(false);
  return /* @__PURE__ */ jsxs2("div", { className: "meta-prompt-panel custom-scrollbar", children: [
    /* @__PURE__ */ jsx3(PromptSummaryCard, { meta: resolvedMeta, tokens: tk, usageStats, isUserMessage }),
    promptMarkdown ? /* @__PURE__ */ jsxs2(Box, { className: "meta-prompt-exact-wrap", children: [
      /* @__PURE__ */ jsxs2(Stack, { direction: "row", alignItems: "center", spacing: 0.75, sx: { mb: 0.75 }, children: [
        /* @__PURE__ */ jsx3("iconify-icon", { icon: "mdi:file-document-outline", width: "18", height: "18" }),
        /* @__PURE__ */ jsx3(Typography, { variant: "subtitle1", sx: { flex: 1, fontWeight: 700 }, children: isUserMessage ? "Consulta \xB7 texto exacto" : "Prompt \xB7 texto exacto" }),
        /* @__PURE__ */ jsx3(
          Chip,
          {
            size: "small",
            clickable: true,
            onClick: () => setFullPage(true),
            className: "meta-prompt-exact-preview__open",
            label: "Ver full-page",
            icon: /* @__PURE__ */ jsx3("iconify-icon", { icon: "mdi:fullscreen", width: "14", height: "14" })
          }
        ),
        /* @__PURE__ */ jsx3(
          Chip,
          {
            size: "small",
            clickable: true,
            onClick: () => {
              try {
                if (navigator.clipboard?.writeText) navigator.clipboard.writeText(promptMarkdown);
              } catch {
              }
            },
            className: "meta-prompt-exact-preview__copy",
            label: "Copiar",
            icon: /* @__PURE__ */ jsx3("iconify-icon", { icon: "mdi:content-copy", width: "14", height: "14" })
          }
        )
      ] }),
      /* @__PURE__ */ jsx3(Box, { className: "meta-prompt-exact-preview__body isa-md-content", children: /* @__PURE__ */ jsx3(MdRenderer, { source: promptMarkdown }) }),
      /* @__PURE__ */ jsx3(
        MdFullPageDialog,
        {
          open: fullPage,
          onClose: () => setFullPage(false),
          source: promptMarkdown,
          title: isUserMessage ? "Consulta \xB7 texto exacto" : "Prompt \xB7 texto exacto",
          subtitle: dialogTitle || (isUserMessage ? "Vista consulta full-page" : "Vista prompt full-page"),
          icon: isUserMessage ? "mdi:message-text-outline" : "mdi:file-document-outline",
          accent: isUserMessage ? "#1e90ff" : "#22c55e"
        }
      )
    ] }) : null,
    userImagenes.length ? /* @__PURE__ */ jsx3(MetaDialogImages, { items: userImagenes, onImageClick: setLightboxSrc, topGap: promptMarkdown ? 1.25 : 0 }) : null,
    !promptMarkdown && !userImagenes.length ? /* @__PURE__ */ jsx3(Typography, { variant: "body2", color: "text.secondary", children: isUserMessage ? "Sin texto ni im\xE1genes en el log de este mensaje." : "Sin texto de instrucciones en el log de este turno." }) : null
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
  const { Dialog: Dialog2, DialogTitle: DialogTitle2, DialogContent: DialogContent3, IconButton: IconButton2, Typography: Typography3, Box: Box4 } = getMaterialUI();
  const { Icon } = UI;
  const html = mdToHtml(String(source ?? ""));
  return /* @__PURE__ */ jsxs2(
    Dialog2,
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
          DialogTitle2,
          {
            sx: {
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              borderBottom: 1,
              borderColor: "divider",
              py: 1.25,
              px: { xs: 2, sm: 3 }
            },
            children: [
              /* @__PURE__ */ jsx3(
                Box4,
                {
                  sx: {
                    width: 36,
                    height: 36,
                    borderRadius: "0.5rem",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: `linear-gradient(135deg, ${accent}, ${accent}99)`,
                    color: "#fff",
                    flexShrink: 0,
                    boxShadow: `0 4px 16px ${accent}55`
                  },
                  children: /* @__PURE__ */ jsx3(Icon, { icon, size: 20 })
                }
              ),
              /* @__PURE__ */ jsxs2(Box4, { sx: { flex: 1, minWidth: 0 }, children: [
                /* @__PURE__ */ jsx3(Typography3, { variant: "h6", fontWeight: 700, noWrap: true, children: title }),
                subtitle ? /* @__PURE__ */ jsx3(Typography3, { variant: "caption", color: "text.secondary", noWrap: true, children: subtitle }) : null
              ] }),
              /* @__PURE__ */ jsx3(IconButton2, { onClick: onClose, "aria-label": "Cerrar visor", size: "small", children: /* @__PURE__ */ jsx3("iconify-icon", { icon: "mdi:close", width: "18", height: "18" }) })
            ]
          }
        ),
        /* @__PURE__ */ jsx3(
          DialogContent3,
          {
            dividers: true,
            sx: {
              p: { xs: 2, sm: 3, md: 4 },
              maxWidth: 920,
              mx: "auto",
              width: "100%"
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

// js/editors/jsonEditor.jsx
init_platform();
import { jsx as jsx4 } from "react/jsx-runtime";
function JsonCodeEditor({ value = "", onChange, placeholder = "", toolbarExtra = null, readOnly = false }) {
  return /* @__PURE__ */ jsx4(
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

// js/ui/ConvLogThread.jsx
init_platform();

// js/ui/ConvLogWebView.jsx
init_platform();
init_platform();
init_platform();
import { Fragment as Fragment2, jsx as jsx5, jsxs as jsxs3 } from "react/jsx-runtime";
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
  const n = String(name ?? "").trim();
  const k = String(nick ?? "").trim();
  return n && k && n.toUpperCase() === k.toUpperCase();
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
  const fromMsg = String(msgStoredUserName(msg)).trim();
  return fromMsg && !/\s/.test(fromMsg) ? fromMsg : "";
}
function SectionCard({ icon, title, titleCaption, accent, children, id, onMeta, metaChips, align = "left", muted = false, operativa = false, fecha, fechaIso, streaming = false, footerExtra = null, compact = false }) {
  const { Paper, Stack: Stack3, Typography: Typography3, Box: Box4, IconButton: IconButton2, Tooltip: Tooltip2 } = getMaterialUI();
  const { Icon } = UI;
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
          Box4,
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
                Stack3,
                {
                  direction: "row",
                  spacing: 1.25,
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  useFlexGap: true,
                  sx: { flexDirection: isRight ? "row-reverse" : "row" },
                  children: [
                    /* @__PURE__ */ jsxs3(
                      Stack3,
                      {
                        direction: "row",
                        spacing: 1.25,
                        alignItems: "flex-start",
                        sx: { flex: 1, minWidth: 0, flexDirection: isRight ? "row-reverse" : "row" },
                        children: [
                          /* @__PURE__ */ jsx5(
                            Box4,
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
                              children: /* @__PURE__ */ jsx5(Icon, { icon, size: 18 })
                            }
                          ),
                          /* @__PURE__ */ jsxs3(
                            Box4,
                            {
                              className: isRight ? "conv-msg-card__title conv-msg-card__title--right" : "conv-msg-card__title",
                              sx: {
                                minWidth: 0,
                                flex: 1,
                                ...isRight ? { pr: 1.25, textAlign: "right" } : { pl: 0 }
                              },
                              children: [
                                /* @__PURE__ */ jsx5(
                                  Typography3,
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
                                titleCaption ? /* @__PURE__ */ jsx5(
                                  Typography3,
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
                    onMeta && /* @__PURE__ */ jsx5(Tooltip2, { title: "Trazabilidad del mensaje", arrow: true, children: /* @__PURE__ */ jsx5(IconButton2, { size: "small", onClick: onMeta, "aria-label": "Ver trazabilidad", sx: { alignSelf: "flex-start", mt: -0.25 }, children: /* @__PURE__ */ jsx5(Icon, { icon: "mdi:information-outline", size: 20 }) }) })
                  ]
                }
              ),
              metaChips ? /* @__PURE__ */ jsx5(Box4, { className: `conv-msg-card__meta-row${isRight ? " conv-msg-card__meta-row--right" : ""}`, children: metaChips }) : null
            ]
          }
        ),
        /* @__PURE__ */ jsx5(Box4, { sx: { p: compact ? { xs: 1.25, sm: 1.5 } : { xs: 2, sm: 2.5 } }, children }),
        fecha || footerExtra ? /* @__PURE__ */ jsx5(
          Box4,
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
              Stack3,
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
                  fecha ? /* @__PURE__ */ jsx5(
                    Typography3,
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
                      children: /* @__PURE__ */ jsx5("span", { className: "conv-msg-card__fecha", children: fecha })
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
function buildUsageDialogCtxItems(meta) {
  const latency = formatLatencySeconds(meta?.latency_ms);
  const items = [];
  if (meta?.ts) {
    items.push({ key: "ts", label: "ts", value: meta.ts, mono: true });
  }
  if (meta?.modelo_autoswitch_vision) {
    const from = String(meta.modelo_configurado ?? "").trim();
    const to = String(meta.model ?? "").trim();
    if (from && to) {
      items.push({
        key: "vision_sw",
        label: "autoswitch visi\xF3n",
        value: from === to ? `${from} (sin cambio de modelo)` : `${from} \u2192 ${to}`,
        mono: true,
        wide: true,
        vision: true
      });
    } else {
      if (from) {
        items.push({ key: "model_from", label: "modelo configurado", value: from, mono: true, vision: true });
      }
      if (to) {
        items.push({ key: "model_to", label: "modelo usado", value: to, mono: true, vision: true });
      }
      if (!from && !to) {
        items.push({
          key: "vision_sw",
          label: "autoswitch visi\xF3n",
          value: "activo (im\xE1genes adjuntas)",
          mono: false,
          wide: true,
          vision: true
        });
      }
    }
  } else if (meta?.model) {
    items.push({ key: "model", label: "model", value: meta.model, mono: true });
  }
  if (latency) {
    items.push({ key: "latency", label: "latency", value: latency, mono: true });
  }
  if (meta?.itdconsulta) {
    items.push({ key: "itd", label: "itdconsulta", value: meta.itdconsulta, mono: true });
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
  return /* @__PURE__ */ jsx5(
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
  const { Stack: Stack3 } = getMaterialUI();
  return /* @__PURE__ */ jsx5(
    Stack3,
    {
      direction: "row",
      spacing: 0.25,
      flexWrap: "wrap",
      useFlexGap: true,
      className: "conv-msg-meta-chips",
      sx: { justifyContent: align === "right" ? "flex-end" : "flex-start" },
      children: chips.map((c) => /* @__PURE__ */ jsx5(MetaBadge, { tag: c.tag, label: c.label, tone: c.tone, title: c.title, onClick: c.onClick }, c.key))
    }
  );
}
function MsgBody({ text, imagenes, audios, audiosTranscripcion, align = "left", onImageClick, streaming = false }) {
  const { Typography: Typography3, Box: Box4 } = getMaterialUI();
  const raw = String(text || "");
  const placeholderOnly = /^\((?:imagen adjunta|nota de voz)\)$/i.test(raw.trim());
  const hasText = Boolean(raw.trim()) && !placeholderOnly;
  const html = mdToHtml(raw);
  return /* @__PURE__ */ jsxs3(Fragment2, { children: [
    streaming && !hasText && !audios?.length ? /* @__PURE__ */ jsxs3(Box4, { className: "conv-stream-typing", "aria-label": "PatyIA est\xE1 escribiendo", role: "status", children: [
      /* @__PURE__ */ jsx5("span", {}),
      /* @__PURE__ */ jsx5("span", {}),
      /* @__PURE__ */ jsx5("span", {})
    ] }) : /* @__PURE__ */ jsxs3(Box4, { className: `conv-msg-body-wrap${streaming ? " conv-msg-body-wrap--streaming" : ""}`, children: [
      /* @__PURE__ */ jsx5(
        Typography3,
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
      ),
      streaming && hasText ? /* @__PURE__ */ jsx5(Box4, { component: "span", className: "conv-stream-cursor", "aria-hidden": true }) : null
    ] }),
    imagenes?.length > 0 && /* @__PURE__ */ jsx5(ConvMsgImages, { items: imagenes, align, onImageClick }),
    audios?.length > 0 && /* @__PURE__ */ jsx5(ConvMsgAudios, { items: audios, transcriptions: audiosTranscripcion, align })
  ] });
}
function ConvMsgAudios({ items, transcriptions, align = "right" }) {
  const { Box: Box4, Typography: Typography3 } = getMaterialUI();
  const renderable = (items || []).filter((src) => String(src || "").trim().startsWith("data:audio/") || /^https?:\/\//i.test(String(src || "").trim()));
  if (!renderable.length) return null;
  return /* @__PURE__ */ jsx5(
    Box4,
    {
      className: `conv-msg-audios conv-msg-audios--${align}`,
      sx: {
        display: "flex",
        flexDirection: "column",
        gap: 1,
        mt: 1.25,
        alignItems: align === "right" ? "flex-end" : "flex-start"
      },
      children: renderable.map((src, idx) => /* @__PURE__ */ jsxs3(Box4, { className: "conv-msg-audio-item", children: [
        /* @__PURE__ */ jsx5("audio", { controls: true, preload: "metadata", src, "aria-label": `Nota de voz ${idx + 1}` }),
        transcriptions?.[idx] ? /* @__PURE__ */ jsx5(Typography3, { variant: "caption", component: "p", className: "conv-msg-audio-transcript", sx: { mt: 0.5, opacity: 0.85 }, children: transcriptions[idx] }) : null
      ] }, `${idx}-${String(src).slice(0, 32)}`))
    }
  );
}
function ConvMsgImages({ items, align = "right", onImageClick }) {
  const { Box: Box4 } = getMaterialUI();
  const renderable = (items || []).filter((src) => {
    const s = String(src || "").trim();
    if (/^\[file_id:/i.test(s)) return false;
    return s.startsWith("data:image/") || s.startsWith("http://") || s.startsWith("https://");
  });
  if (!renderable.length) return null;
  return /* @__PURE__ */ jsx5(
    Box4,
    {
      className: `conv-msg-images conv-msg-images--${align}`,
      sx: {
        display: "flex",
        flexWrap: "wrap",
        gap: 1,
        mt: 1.25,
        justifyContent: align === "right" ? "flex-end" : "flex-start"
      },
      children: renderable.map((src, idx) => /* @__PURE__ */ jsx5(
        "button",
        {
          type: "button",
          className: "conv-msg-image-lightbox-btn",
          "aria-label": `Ver imagen adjunta ${idx + 1} en tama\xF1o completo`,
          onClick: () => onImageClick?.(src),
          children: /* @__PURE__ */ jsx5("img", { src, alt: `Adjunto ${idx + 1}`, loading: "lazy" })
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
  return /* @__PURE__ */ jsx5(
    "span",
    {
      className: className || "conv-msg-usage-chip",
      title: title || (showVal ? label : tag),
      onClick,
      onKeyDown: handleKeyDown,
      role,
      tabIndex,
      children: /* @__PURE__ */ jsxs3("span", { className: "conv-msg-usage-chip__inner", children: [
        tag ? /* @__PURE__ */ jsx5("span", { className: "conv-msg-usage-chip__key", children: tag }) : null,
        showVal ? /* @__PURE__ */ jsx5("span", { className: "conv-msg-usage-chip__val", children: label }) : null
      ] })
    }
  );
}
function UsageDialogMetaPanel({ meta }) {
  const { Box: Box4 } = getMaterialUI();
  const ctxItems = buildUsageDialogCtxItems(meta);
  if (!ctxItems.length) return null;
  return /* @__PURE__ */ jsx5(Box4, { className: "conv-usage-dialog__meta conv-usage-dialog__meta--ctx", children: /* @__PURE__ */ jsx5("div", { className: "conv-usage-dialog__ctx-grid", children: ctxItems.map((item) => /* @__PURE__ */ jsxs3(
    "div",
    {
      className: [
        "conv-usage-dialog__ctx-item",
        item.wide ? "conv-usage-dialog__ctx-item--wide" : "",
        item.vision ? "conv-usage-dialog__ctx-item--vision" : ""
      ].filter(Boolean).join(" ") || void 0,
      children: [
        /* @__PURE__ */ jsx5("span", { className: "conv-usage-dialog__ctx-k", children: item.label }),
        /* @__PURE__ */ jsx5("span", { className: `conv-usage-dialog__ctx-v${item.mono ? " conv-usage-dialog__mono" : ""}`, children: item.value })
      ]
    },
    item.key
  )) }) });
}
function UsageStatsDialog({ open, onClose, stats, msgLabel, fecha, meta }) {
  const { DialogContent: DialogContent3, Typography: Typography3, Box: Box4, Chip: Chip3, Stack: Stack3, Tooltip: Tooltip2, IconButton: IconButton2 } = getMaterialUI();
  const { useMemo: useMemo4, useState: useState5 } = getReact();
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
      icon: /* @__PURE__ */ jsx5(UI.Icon, { icon: "mdi:message-text-outline", size: 18 }),
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
      icon: /* @__PURE__ */ jsx5(UI.Icon, { icon: "mdi:history", size: 18 }),
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
      icon: /* @__PURE__ */ jsx5(UI.Icon, { icon: "mdi:sigma", size: 18 }),
      show: usageHasData(stats.cumulativeTokens, stats.cumulativeCost)
    }
  ].filter((s) => s.show);
  const chunks = useMemo4(() => chunksFromMeta(meta), [meta]);
  const archivos = useMemo4(() => archivosCitadosFromMeta(meta), [meta]);
  const [openChunk, setOpenChunk] = useState5(null);
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
        maxWidth: "sm",
        fullWidth: true,
        header: /* @__PURE__ */ jsx5(
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
          /* @__PURE__ */ jsx5(DialogContent3, { dividers: true, className: "conv-usage-dialog", sx: glassDialogContentSx({ p: { xs: 1.5, sm: 2 } }), children: /* @__PURE__ */ jsxs3(Box4, { className: "conv-usage-dialog__stack", children: [
            showMetaPanel ? /* @__PURE__ */ jsx5(UsageDialogMetaPanel, { meta }) : null,
            sections.map((section) => /* @__PURE__ */ jsx5(
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
                  /* @__PURE__ */ jsx5(Typography3, { variant: "caption", color: "text.secondary", component: "div", className: "conv-usage-dialog__section-sub", sx: { mb: 1 }, children: archivos.length ? `Chunks extra\xEDdos por file_search (${chunks.length} de ${archivos.length} archivo${archivos.length === 1 ? "" : "s"}).` : `${chunks.length} fragmento${chunks.length === 1 ? "" : "s"} del message.` }),
                  archivos.length ? /* @__PURE__ */ jsx5(Stack3, { direction: "row", spacing: 0.5, flexWrap: "wrap", useFlexGap: true, className: "conv-usage-dialog__files", sx: { mb: 1 }, children: archivos.map((name) => {
                    const clickable = chunks.some((c) => c.filename === name);
                    return /* @__PURE__ */ jsx5(
                      Chip3,
                      {
                        size: "small",
                        variant: "outlined",
                        clickable,
                        onClick: clickable ? () => {
                          const first = chunks.find((c) => c.filename === name);
                          if (first) setOpenChunk(first);
                        } : void 0,
                        icon: /* @__PURE__ */ jsx5("iconify-icon", { icon: "mdi:file-document-outline", width: "14", height: "14" }),
                        label: name,
                        title: clickable ? `Ver fragmentos de ${name}` : name,
                        className: "conv-usage-dialog__file-chip"
                      },
                      name
                    );
                  }) }) : null,
                  /* @__PURE__ */ jsx5(Stack3, { spacing: 0.75, className: "conv-usage-dialog__chunks", children: chunks.map((c) => /* @__PURE__ */ jsxs3(
                    Box4,
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
                        /* @__PURE__ */ jsxs3(Stack3, { direction: "row", spacing: 0.75, alignItems: "center", sx: { mb: 0.35 }, children: [
                          /* @__PURE__ */ jsx5("iconify-icon", { icon: "mdi:text-box-search-outline", width: "16", height: "16" }),
                          /* @__PURE__ */ jsx5(Typography3, { variant: "body2", fontWeight: 600, sx: { flex: 1, minWidth: 0 }, children: c.filename || c.fileId || "fragmento" }),
                          c.score != null ? /* @__PURE__ */ jsx5(
                            Chip3,
                            {
                              size: "small",
                              variant: "outlined",
                              label: `score ${Number(c.score).toFixed(3)}`,
                              className: "conv-usage-dialog__chunk-score"
                            }
                          ) : null,
                          /* @__PURE__ */ jsx5(Tooltip2, { title: "Ver fragmento en full-page", children: /* @__PURE__ */ jsx5(IconButton2, { size: "small", "aria-label": "Abrir fragmento", className: "conv-usage-dialog__chunk-open", children: /* @__PURE__ */ jsx5("iconify-icon", { icon: "mdi:fullscreen", width: "16", height: "16" }) }) })
                        ] }),
                        /* @__PURE__ */ jsx5(
                          Typography3,
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
            ) : /* @__PURE__ */ jsxs3(Box4, { className: "conv-usage-dialog__section-card conv-usage-dialog__section-card--chunks", children: [
              /* @__PURE__ */ jsxs3("div", { className: "conv-usage-dialog__section-head", children: [
                /* @__PURE__ */ jsx5(Typography3, { component: "h3", variant: "subtitle2", className: "conv-usage-dialog__section-title", children: "Fragmentos citados" }),
                /* @__PURE__ */ jsx5(Typography3, { variant: "caption", color: "text.secondary", className: "conv-usage-dialog__section-sub", children: archivos.length ? `Chunks extra\xEDdos por file_search (${chunks.length} de ${archivos.length} archivo${archivos.length === 1 ? "" : "s"}).` : `${chunks.length} fragmento${chunks.length === 1 ? "" : "s"} del message.` })
              ] }),
              archivos.length ? /* @__PURE__ */ jsx5(Stack3, { direction: "row", spacing: 0.5, flexWrap: "wrap", useFlexGap: true, className: "conv-usage-dialog__files", children: archivos.map((name) => {
                const clickable = chunks.some((c) => c.filename === name);
                return /* @__PURE__ */ jsx5(
                  Chip3,
                  {
                    size: "small",
                    variant: "outlined",
                    clickable,
                    onClick: clickable ? () => {
                      const first = chunks.find((c) => c.filename === name);
                      if (first) setOpenChunk(first);
                    } : void 0,
                    icon: /* @__PURE__ */ jsx5("iconify-icon", { icon: "mdi:file-document-outline", width: "14", height: "14" }),
                    label: name,
                    title: clickable ? `Ver fragmentos de ${name}` : name,
                    className: "conv-usage-dialog__file-chip"
                  },
                  name
                );
              }) }) : null,
              /* @__PURE__ */ jsx5(Stack3, { spacing: 0.75, className: "conv-usage-dialog__chunks", children: chunks.map((c) => /* @__PURE__ */ jsxs3(
                Box4,
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
                    /* @__PURE__ */ jsxs3(Stack3, { direction: "row", spacing: 0.75, alignItems: "center", sx: { mb: 0.35 }, children: [
                      /* @__PURE__ */ jsx5("iconify-icon", { icon: "mdi:text-box-search-outline", width: "16", height: "16" }),
                      /* @__PURE__ */ jsx5(Typography3, { variant: "body2", fontWeight: 600, sx: { flex: 1, minWidth: 0 }, children: c.filename || c.fileId || "fragmento" }),
                      c.score != null ? /* @__PURE__ */ jsx5(
                        Chip3,
                        {
                          size: "small",
                          variant: "outlined",
                          label: `score ${Number(c.score).toFixed(3)}`,
                          className: "conv-usage-dialog__chunk-score"
                        }
                      ) : null,
                      /* @__PURE__ */ jsx5(Tooltip2, { title: "Ver fragmento en full-page", children: /* @__PURE__ */ jsx5(IconButton2, { size: "small", "aria-label": "Abrir fragmento", className: "conv-usage-dialog__chunk-open", children: /* @__PURE__ */ jsx5("iconify-icon", { icon: "mdi:fullscreen", width: "16", height: "16" }) }) })
                    ] }),
                    /* @__PURE__ */ jsx5(
                      Typography3,
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
          ] }) }),
          /* @__PURE__ */ jsx5(GlassDialogCloseActions, { onClose })
        ]
      }
    ),
    /* @__PURE__ */ jsx5(
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
  const { Box: Box4, Typography: Typography3, Stack: Stack3 } = getMaterialUI();
  const { Icon } = UI;
  const cost = section?.cost;
  const tokens = section?.tokens;
  const totalCost = Number(cost?.total ?? 0) || 0;
  const totalTokens = Number(tokens?.total ?? 0) || 0;
  const reasoning = Number(tokens?.reason ?? tokens?.reasoning ?? 0) || 0;
  const totalTokLabel = totalTokens ? totalTokens.toLocaleString("es-CO") : "\u2014";
  const costLabel = totalCost > 0 ? `$${totalCost.toFixed(6)}` : "\u2014";
  const reasonLabel = reasoning > 0 ? `${reasoning.toLocaleString("es-CO")} razon.` : null;
  const body = /* @__PURE__ */ jsxs3(Box4, { className: "conv-usage-dialog__section-body", children: [
    /* @__PURE__ */ jsxs3(
      Stack3,
      {
        direction: { xs: "column", sm: "row" },
        spacing: { xs: 1, sm: 2 },
        alignItems: { xs: "stretch", sm: "center" },
        justifyContent: "space-between",
        className: "conv-usage-dialog__headline",
        children: [
          /* @__PURE__ */ jsxs3(Box4, { className: "conv-usage-dialog__headline-main", children: [
            /* @__PURE__ */ jsx5(Typography3, { variant: "overline", className: "conv-usage-dialog__headline-k", sx: { lineHeight: 1, display: "block", opacity: 0.7 }, children: "Costo" }),
            /* @__PURE__ */ jsx5(
              Typography3,
              {
                variant: "h4",
                component: "span",
                className: `conv-usage-dialog__headline-v conv-usage-dialog__headline-v--${section.key}`,
                sx: { fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.05, fontFamily: '"IBM Plex Mono", ui-monospace, monospace' },
                children: costLabel
              }
            )
          ] }),
          /* @__PURE__ */ jsxs3(Stack3, { direction: "row", spacing: 1, alignItems: "center", className: "conv-usage-dialog__headline-meta", children: [
            /* @__PURE__ */ jsxs3(Box4, { className: "conv-usage-dialog__headline-meta-item", children: [
              /* @__PURE__ */ jsx5(Typography3, { variant: "overline", sx: { lineHeight: 1, display: "block", opacity: 0.7 }, children: "Tokens" }),
              /* @__PURE__ */ jsx5(
                Typography3,
                {
                  variant: "h6",
                  component: "span",
                  className: "conv-usage-dialog__headline-meta-v",
                  sx: { fontWeight: 700, lineHeight: 1.1, fontFamily: '"IBM Plex Mono", ui-monospace, monospace' },
                  children: totalTokLabel
                }
              )
            ] }),
            reasonLabel ? /* @__PURE__ */ jsxs3(Box4, { className: "conv-usage-dialog__headline-meta-item conv-usage-dialog__headline-meta-item--reason", children: [
              /* @__PURE__ */ jsx5(Typography3, { variant: "overline", sx: { lineHeight: 1, display: "block", opacity: 0.7 }, children: "Razonamiento" }),
              /* @__PURE__ */ jsx5(
                Typography3,
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
    /* @__PURE__ */ jsx5(Box4, { className: "conv-usage-dialog__metrics-wrap", children: /* @__PURE__ */ jsx5(
      UsageMetricsGrid,
      {
        className: "conv-usage-dialog__metrics",
        hideRowLabels: true,
        sections: [{ key: section.key, label: section.title, tokens: section.tokens, cost: section.cost }]
      }
    ) })
  ] });
  if (!GlassSection) {
    return /* @__PURE__ */ jsxs3(Box4, { className: `conv-usage-dialog__section-card conv-usage-dialog__section-card--${section.key}`, children: [
      /* @__PURE__ */ jsxs3("div", { className: "conv-usage-dialog__section-head", children: [
        /* @__PURE__ */ jsx5(Typography3, { component: "h3", variant: "subtitle2", className: "conv-usage-dialog__section-title", children: section.title }),
        /* @__PURE__ */ jsx5(Typography3, { variant: "caption", color: "text.secondary", className: "conv-usage-dialog__section-sub", children: section.subtitle })
      ] }),
      body
    ] });
  }
  return /* @__PURE__ */ jsx5(
    GlassSection,
    {
      sectionKey: `conv-usage-${section.key}`,
      className: `conv-usage-dialog__glass-section conv-usage-dialog__glass-section--${section.key}`,
      title: /* @__PURE__ */ jsxs3(Stack3, { direction: "row", spacing: 1, alignItems: "baseline", sx: { minWidth: 0, flex: 1 }, children: [
        /* @__PURE__ */ jsx5(Typography3, { component: "span", variant: "subtitle1", sx: { fontWeight: 700, letterSpacing: -0.2 }, children: section.title }),
        /* @__PURE__ */ jsx5(Typography3, { component: "span", variant: "caption", color: "text.secondary", sx: { flex: 1, minWidth: 0 }, children: section.subtitle })
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
  const { Box: Box4 } = getMaterialUI();
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
      Box4,
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
          showMetaBadges ? /* @__PURE__ */ jsxs3(Box4, { className: `conv-msg-usage-stats__meta conv-msg-usage-stats__meta--${align}`, children: [
            contextChips.map((c) => /* @__PURE__ */ jsx5(MetaBadge, { label: c.label, tone: c.tone, title: c.title }, c.key)),
            modelLabel ? /* @__PURE__ */ jsx5(
              UsageSummaryChip,
              {
                tag: "MODELO",
                label: modelLabel,
                className: "conv-msg-usage-chip conv-msg-usage-chip--model",
                title: meta?.modelo_autoswitch_vision ? modelRaw && modelRaw !== modelLabel ? `Modelo usado (autoswitch visi\xF3n): ${modelRaw}` : "Modelo usado tras autoswitch visi\xF3n" : modelRaw && modelRaw !== modelLabel ? `Modelo: ${modelRaw}` : "Modelo LLM"
              }
            ) : null,
            autoswitchBadge ? /* @__PURE__ */ jsx5(
              UsageSummaryChip,
              {
                tag: autoswitchBadge.tag,
                label: autoswitchBadge.label,
                className: "conv-msg-usage-chip conv-msg-usage-chip--vision",
                title: autoswitchBadge.title
              }
            ) : null,
            latencyLabel ? /* @__PURE__ */ jsx5(
              UsageSummaryChip,
              {
                tag: "LAT",
                label: latencyLabel,
                className: "conv-msg-usage-chip conv-msg-usage-chip--latency",
                title: "Tiempo de respuesta"
              }
            ) : null,
            metaTokLabel && !hasUsage ? /* @__PURE__ */ jsx5(
              UsageSummaryChip,
              {
                tag: "TOK",
                label: metaTokLabel,
                className: "conv-msg-usage-chip conv-msg-usage-chip--tokens",
                title: `Tokens: ${metaTokLabel}`
              }
            ) : null
          ] }) : null,
          groups.length > 0 ? /* @__PURE__ */ jsx5(Box4, { className: `conv-msg-usage-stats__groups conv-msg-usage-stats__groups--${align}`, children: groups.map((group) => /* @__PURE__ */ jsxs3(Box4, { className: `conv-msg-usage-stats__group conv-msg-usage-stats__group--${group.key}`, children: [
            /* @__PURE__ */ jsx5(
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
            /* @__PURE__ */ jsx5(
              UsageSummaryChip,
              {
                tag: "USD",
                label: group.summary.usdText,
                className: "conv-msg-usage-chip conv-msg-usage-chip--usd",
                title: "Costo USD"
              }
            ),
            /* @__PURE__ */ jsx5(
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
    /* @__PURE__ */ jsx5(
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
  const { Stack: Stack3, IconButton: IconButton2, Tooltip: Tooltip2, CircularProgress } = getMaterialUI();
  const { Icon } = UI;
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
    Stack3,
    {
      direction: "row",
      spacing: 0.25,
      alignItems: "center",
      justifyContent: align === "right" ? "flex-end" : "flex-start",
      className: `conv-msg-rating conv-msg-rating--${align}${rated ? " conv-msg-rating--rated" : ""}`,
      role: "group",
      "aria-label": "Calificaci\xF3n del mensaje",
      children: [
        /* @__PURE__ */ jsx5(Tooltip2, { title: upTooltip, arrow: true, children: /* @__PURE__ */ jsx5("span", { children: /* @__PURE__ */ jsx5(
          IconButton2,
          {
            size: "small",
            className: `conv-msg-rating__btn conv-msg-rating__btn--up${useful ? " conv-msg-rating__btn--active" : ""}`,
            "aria-label": useful ? "Calificado como \xFAtil" : "Marcar como \xFAtil",
            "aria-pressed": useful,
            disabled: disabled || busy || rated,
            onClick: () => onRate(true),
            sx: upRatedSx,
            children: busy && !rated ? /* @__PURE__ */ jsx5(CircularProgress, { size: 16 }) : /* @__PURE__ */ jsx5(
              Icon,
              {
                icon: useful ? "mdi:thumb-up" : "mdi:thumb-up-outline",
                size: 18,
                style: useful ? { color: "#16a34a" } : void 0
              }
            )
          }
        ) }) }),
        /* @__PURE__ */ jsx5(Tooltip2, { title: downTooltip, arrow: true, children: /* @__PURE__ */ jsx5("span", { children: /* @__PURE__ */ jsx5(
          IconButton2,
          {
            size: "small",
            className: `conv-msg-rating__btn conv-msg-rating__btn--down${notUseful ? " conv-msg-rating__btn--active" : ""}`,
            "aria-label": notUseful ? "Calificado como no \xFAtil" : "Marcar como no \xFAtil",
            "aria-pressed": notUseful,
            disabled: disabled || busy || rated,
            onClick: () => onRate(false),
            sx: downRatedSx,
            children: /* @__PURE__ */ jsx5(
              Icon,
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
var MensajeSection = memo(function MensajeSection2({ msg, onMeta, compactMeta = false, chatUserDisplayName, chatUserNick, showUsageStats = false, onImageClick, streamingMsgId = null, onRateMessage = null, canRate = false, ratingMsgId = null, operativaEnter = false }) {
  const { Alert: Alert3, Box: Box4 } = getMaterialUI();
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
  const ratingRow = showRating ? /* @__PURE__ */ jsx5(
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
    Box4,
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
          Box4,
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
              /* @__PURE__ */ jsx5(
                Box4,
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
                      metaChips: showMetaChips ? /* @__PURE__ */ jsx5(
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
                        msg.streamFailed && msg.streamError && /* @__PURE__ */ jsx5(Alert3, { severity: "warning", sx: { mb: 1.5, py: 0.25, fontSize: "0.78rem" }, children: msg.streamError }),
                        msg.contenido?.trim() || msg.imagenes?.length || msg.audios?.length || isStreaming ? /* @__PURE__ */ jsx5(
                          MsgBody,
                          {
                            text: msg.contenido,
                            imagenes: msg.imagenes,
                            audios: msg.audios,
                            audiosTranscripcion: msg.audiosTranscripcion,
                            align: isUser ? "right" : "left",
                            onImageClick,
                            streaming: isStreaming
                          }
                        ) : null
                      ]
                    }
                  )
                }
              ),
              showSideColumn && /* @__PURE__ */ jsxs3(
                Box4,
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
                    showMetricsColumn ? /* @__PURE__ */ jsx5(
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
                    ratingRow ? /* @__PURE__ */ jsx5(Box4, { className: "conv-msg-rating-slot", children: ratingRow }) : null
                  ]
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsx5(
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
function ConvLogWebView({ mensajes, onMeta, compactMeta = false, emptyHint, chatUserDisplayName, chatUserNick, showUsageStats = true, streamingMsgId = null, onRateMessage = null, canRate = false, ratingMsgId = null, threadKey = null, threadClassName = "" }) {
  const { Box: Box4, Typography: Typography3 } = getMaterialUI();
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
    return /* @__PURE__ */ jsx5(Typography3, { variant: "body2", color: "text.secondary", sx: { textAlign: "center", py: 6 }, children: emptyHint || "Recupera por ID o pega un log para ver el hilo." });
  }
  return /* @__PURE__ */ jsxs3(Box4, { className: threadClassName || void 0, sx: { width: "100%", maxWidth: "100%" }, children: [
    mensajesConStats.map((m) => /* @__PURE__ */ jsx5(
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
        operativaEnter: operativaEnterIds.has(m.idMsg)
      },
      m.idMsg
    )),
    /* @__PURE__ */ jsx5(ImageLightboxDialog, { open: Boolean(lightboxSrc), src: lightboxSrc, onClose: () => setLightboxSrc(null) })
  ] });
}
function convLogNavItems(mensajes) {
  return (mensajes || []).map((m, i) => {
    const rk = roleKey(m);
    const meta = ROLE_META[rk] || ROLE_META.assistant;
    const preview = String(m.contenido || "").replace(/\s+/g, " ").trim().slice(0, 48);
    return {
      id: m.idMsg,
      label: `#${i + 1} \xB7 ${roleTitle(m)}`,
      secondary: preview || "(sin texto)",
      accent: meta.accent,
      icon: meta.icon
    };
  });
}

// js/ui/ConvLogThread.jsx
import { jsx as jsx6, jsxs as jsxs4 } from "react/jsx-runtime";
var { Box: Box2, Alert } = getMaterialUI();
function ThreadLoading({ label = "Cargando conversaci\xF3n\u2026" }) {
  return /* @__PURE__ */ jsx6(Box2, { className: "isa-app-boot isa-app-boot--inline", sx: { position: "absolute", inset: 0, zIndex: 2, minHeight: 0, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", pointerEvents: "none" }, children: /* @__PURE__ */ jsxs4("div", { className: "isa-app-boot__card isa-app-boot__card--compact", role: "status", "aria-live": "polite", style: { background: "rgba(8, 16, 32, 0.72)" }, children: [
    /* @__PURE__ */ jsx6("div", { className: "isa-app-boot__icon-wrap isa-app-boot__icon-wrap--sm", children: /* @__PURE__ */ jsx6("iconify-icon", { icon: "mdi:loading", class: "isa-spin", width: "1.375em", height: "1.375em" }) }),
    /* @__PURE__ */ jsx6("p", { className: "isa-app-boot__label", children: label }),
    /* @__PURE__ */ jsx6("div", { className: "isa-app-boot__bar", "aria-hidden": "true", children: /* @__PURE__ */ jsx6("span", { className: "isa-app-boot__bar-fill" }) })
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
  sx = {}
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
        showSpinner ? /* @__PURE__ */ jsx6(ThreadLoading, {}) : null,
        error ? /* @__PURE__ */ jsx6(Alert, { severity: "warning", sx: { mb: 2 }, children: error }) : null,
        /* @__PURE__ */ jsx6(
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
            threadKey
          }
        )
      ]
    }
  );
}

// js/tools/LogViewer.jsx
init_apiClient();

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
function persistLogSidebarWidth(width) {
  const n = Math.round(Number(width));
  if (!Number.isFinite(n) || n <= 0) return getSnapshot();
  const snap = getSnapshot();
  const prev = Number(snap.log?.sidebarW);
  if (prev === n) return snap;
  return mergePartial({ log: { sidebarW: n } });
}
function persistLogMeta(convId) {
  const snap = getSnapshot();
  const id = convId || "";
  if (String(snap.log?.convId ?? "") === id) return snap;
  return mergePartial({ log: { convId: id } });
}

// js/tools/LogViewer.jsx
init_platform();

// js/ui/mobileDrawer.ts
var MOBILE_DRAWER_PAPER_SX = {
  width: "min(300px, calc(100vw - 12px))",
  maxWidth: "100%",
  height: "100%",
  maxHeight: "100%",
  boxSizing: "border-box",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column"
};
function mobileDrawerPaperProps(className) {
  return {
    className,
    sx: MOBILE_DRAWER_PAPER_SX
  };
}

// js/tools/LogViewer.jsx
import { Fragment as Fragment3, jsx as jsx7, jsxs as jsxs5 } from "react/jsx-runtime";
var LOG_SIDEBAR_DEFAULT_W = 400;
function readLogSidebarWidthFromUrl() {
  const w = Number(getSnapshot().log?.sidebarW);
  return Number.isFinite(w) && w > 0 ? w : null;
}
var { useState: useState4, useCallback, useMemo: useMemo3, useEffect: useEffect4 } = getReact();
var {
  Box: Box3,
  Typography: Typography2,
  TextField,
  Stack: Stack2,
  Alert: Alert2,
  Chip: Chip2,
  Divider,
  Tooltip,
  List,
  ListItemButton,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent: DialogContent2,
  DialogActions,
  Button,
  Drawer,
  Fab,
  IconButton,
  useTheme,
  useMediaQuery
} = getMaterialUI();
function MsgNavList({ items, selectedId, onSelect }) {
  const { Icon } = UI;
  if (!items.length) {
    return /* @__PURE__ */ jsx7(Typography2, { variant: "caption", color: "text.secondary", sx: { py: 1, display: "block" }, children: "Sin mensajes en el hilo." });
  }
  return /* @__PURE__ */ jsx7(List, { dense: true, disablePadding: true, sx: { py: 0.5 }, children: items.map((it) => /* @__PURE__ */ jsx7(Tooltip, { title: it.secondary, placement: "right", enterDelay: 400, children: /* @__PURE__ */ jsxs5(
    ListItemButton,
    {
      selected: selectedId === it.id,
      onClick: () => onSelect(it.id),
      sx: {
        py: 0.5,
        pl: 1.5,
        pr: 1,
        minHeight: 36,
        "&.Mui-selected": { bgcolor: "action.selected" }
      },
      children: [
        /* @__PURE__ */ jsx7(
          Box3,
          {
            sx: {
              width: 8,
              height: 8,
              borderRadius: "50%",
              flexShrink: 0,
              mr: 1,
              bgcolor: it.accent,
              boxShadow: `0 0 0 2px ${it.accent}33`
            }
          }
        ),
        /* @__PURE__ */ jsx7(Icon, { icon: it.icon, size: 15, style: { opacity: 0.75, flexShrink: 0, marginRight: 6 } }),
        /* @__PURE__ */ jsx7(
          ListItemText,
          {
            primary: it.label,
            secondary: it.secondary,
            primaryTypographyProps: { variant: "body2", noWrap: true, sx: { fontWeight: 600 } },
            secondaryTypographyProps: { variant: "caption", noWrap: true }
          }
        )
      ]
    }
  ) }, it.id)) });
}
function ResumenDialog({ open, onClose, logInfo, navItems, selectedId, onSelectMsg }) {
  const resumen = logInfo?.resumen;
  const tk = resumen?.tokens;
  return /* @__PURE__ */ jsxs5(Dialog, { open, onClose, maxWidth: "sm", fullWidth: true, children: [
    /* @__PURE__ */ jsxs5(DialogTitle, { sx: { pb: 1 }, children: [
      "Resumen",
      logInfo?.iconversacion ? ` \xB7 conv #${logInfo.iconversacion}` : ""
    ] }),
    /* @__PURE__ */ jsxs5(DialogContent2, { dividers: true, sx: { pt: 1.5 }, children: [
      resumen && /* @__PURE__ */ jsxs5(Box3, { sx: { mb: 2 }, children: [
        /* @__PURE__ */ jsx7(Typography2, { variant: "overline", color: "text.secondary", sx: { display: "block", mb: 1 }, children: "M\xE9tricas" }),
        /* @__PURE__ */ jsxs5(Stack2, { direction: "row", flexWrap: "wrap", useFlexGap: true, spacing: 1, sx: { mb: 1.5 }, children: [
          resumen.totalMensajes != null && /* @__PURE__ */ jsx7(Chip2, { size: "small", variant: "outlined", label: `${resumen.totalMensajes} mensajes` }),
          resumen.totalTurnos != null && /* @__PURE__ */ jsx7(Chip2, { size: "small", variant: "outlined", label: `${resumen.totalTurnos} turnos` }),
          resumen.totalOperativas != null && /* @__PURE__ */ jsx7(Chip2, { size: "small", variant: "outlined", label: `${resumen.totalOperativas} operativas` }),
          tk?.total != null && /* @__PURE__ */ jsx7(Chip2, { size: "small", variant: "outlined", color: "secondary", label: `${tk.total} tokens` })
        ] }),
        (resumen.ultimoModelo || resumen.ultimoPromptId || resumen.ultimaItdconsulta || resumen.ultimoNombreUsuario) && /* @__PURE__ */ jsxs5(Stack2, { spacing: 0.75, sx: { typography: "body2", color: "text.secondary" }, children: [
          resumen.ultimoNombreUsuario && /* @__PURE__ */ jsxs5(Typography2, { variant: "body2", children: [
            /* @__PURE__ */ jsx7("strong", { children: "Usuario:" }),
            " ",
            resumen.ultimoNombreUsuario
          ] }),
          resumen.ultimaItdconsulta && /* @__PURE__ */ jsxs5(Typography2, { variant: "body2", children: [
            /* @__PURE__ */ jsx7("strong", { children: "itdconsulta:" }),
            " ",
            resumen.ultimaItdconsulta
          ] }),
          resumen.ultimoModelo && /* @__PURE__ */ jsxs5(Typography2, { variant: "body2", children: [
            /* @__PURE__ */ jsx7("strong", { children: "Modelo:" }),
            " ",
            resumen.ultimoModelo
          ] }),
          resumen.ultimoPromptId && /* @__PURE__ */ jsxs5(Typography2, { variant: "body2", noWrap: true, title: resumen.ultimoPromptId, children: [
            /* @__PURE__ */ jsx7("strong", { children: "Prompt:" }),
            " ",
            resumen.ultimoPromptId
          ] })
        ] })
      ] }),
      !resumen && logInfo?.iconversacion && /* @__PURE__ */ jsx7(Typography2, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Sin bloque resumen en el log; usa el \xEDndice para saltar a un mensaje." }),
      /* @__PURE__ */ jsx7(Divider, { sx: { my: 1.5 } }),
      /* @__PURE__ */ jsxs5(Typography2, { variant: "overline", color: "text.secondary", sx: { display: "block", mb: 0.5 }, children: [
        "\xCDndice (",
        navItems.length,
        ")"
      ] }),
      /* @__PURE__ */ jsx7(Typography2, { variant: "caption", color: "text.secondary", sx: { display: "block", mb: 1 }, children: "Vista compacta; el detalle completo est\xE1 en el panel derecho." }),
      /* @__PURE__ */ jsx7(
        MsgNavList,
        {
          items: navItems,
          selectedId,
          onSelect: (id) => {
            onSelectMsg(id);
            onClose();
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsx7(DialogActions, { sx: { px: 2, py: 1.25 }, children: /* @__PURE__ */ jsx7(Button, { onClick: onClose, sx: { textTransform: "none", fontWeight: 600 }, children: "Cerrar" }) })
  ] });
}
function LogEntradaPanel({
  drawerMode = false,
  onClose,
  convId,
  loading,
  jsonInput,
  error,
  canClear,
  focusTarget = null,
  onFocusApplied,
  onConvIdChange,
  onConvIdKeyDown,
  recuperarPorId,
  limpiar,
  onJsonInputChange
}) {
  const { Icon } = UI;
  const { GlassPanel, NEON_COLORS } = getGlass();
  useEffect4(() => {
    if (!focusTarget) return void 0;
    const timer = window.setTimeout(() => {
      if (focusTarget === "convId") {
        const input = document.querySelector(".conv-log-entrada .conv-log-action-grp__input input");
        input?.focus();
        input?.select?.();
      } else if (focusTarget === "json") {
        const cmEl = document.querySelector(".conv-log-entrada .log-json-editor-wrap .CodeMirror");
        if (cmEl?.CodeMirror) cmEl.CodeMirror.focus();
        else cmEl?.querySelector("textarea")?.focus();
      }
      onFocusApplied?.();
    }, 150);
    return () => window.clearTimeout(timer);
  }, [focusTarget, onFocusApplied]);
  return /* @__PURE__ */ jsxs5(
    Box3,
    {
      className: "conv-log-entrada",
      sx: {
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        height: drawerMode ? "100%" : "auto",
        flex: drawerMode ? 1 : void 0,
        overflow: "hidden",
        boxSizing: "border-box"
      },
      children: [
        drawerMode ? /* @__PURE__ */ jsx7(
          Stack2,
          {
            direction: "row",
            spacing: 1,
            alignItems: "center",
            justifyContent: "flex-end",
            className: "conv-log-sidebar-block conv-log-entrada-drawer-head",
            sx: { flexShrink: 0 },
            children: onClose ? /* @__PURE__ */ jsx7(Tooltip, { title: "Cerrar panel", children: /* @__PURE__ */ jsx7(IconButton, { size: "small", onClick: onClose, "aria-label": "Cerrar panel", children: /* @__PURE__ */ jsx7(Icon, { icon: "mdi:close", size: 18 }) }) }) : null
          }
        ) : null,
        /* @__PURE__ */ jsxs5(Box3, { className: "conv-log-sidebar-block conv-log-entrada-actions", sx: { flexShrink: 0 }, children: [
          /* @__PURE__ */ jsxs5(
            GlassPanel,
            {
              tone: "blue",
              className: "conv-log-action-grp",
              role: "group",
              "aria-label": "Acciones de entrada de log",
              sx: { p: 0.65, display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", alignItems: "center", gap: 0.75, width: "100%", flexWrap: "nowrap" },
              children: [
                /* @__PURE__ */ jsx7(
                  TextField,
                  {
                    className: "conv-log-action-grp__input",
                    size: "small",
                    margin: "none",
                    type: "number",
                    hiddenLabel: true,
                    placeholder: "iconversacion",
                    "aria-label": "iconversacion",
                    value: convId,
                    disabled: loading,
                    onChange: onConvIdChange,
                    onKeyDown: onConvIdKeyDown,
                    slotProps: { htmlInput: { min: 1 } },
                    sx: { m: 0, "& .MuiOutlinedInput-root": { height: 32 } }
                  }
                ),
                /* @__PURE__ */ jsxs5(Box3, { className: "conv-log-action-grp__actions", children: [
                  /* @__PURE__ */ jsx7(Tooltip, { title: "Recuperar por ID (Enter)", arrow: true, children: /* @__PURE__ */ jsx7("span", { children: /* @__PURE__ */ jsx7(
                    ButtonIconify,
                    {
                      variant: "primary",
                      icon: "mdi:cloud-download-outline",
                      title: "Recuperar por ID",
                      onClick: recuperarPorId,
                      disabled: !String(convId ?? "").trim(),
                      busy: loading
                    }
                  ) }) }),
                  /* @__PURE__ */ jsx7(Tooltip, { title: "Limpiar", arrow: true, children: /* @__PURE__ */ jsx7("span", { children: /* @__PURE__ */ jsx7(
                    ButtonIconify,
                    {
                      icon: "mdi:delete-outline",
                      title: "Limpiar",
                      onClick: limpiar,
                      disabled: !canClear
                    }
                  ) }) })
                ] })
              ]
            }
          ),
          error ? /* @__PURE__ */ jsx7(Alert2, { severity: "error", className: "conv-log-entrada-error", children: error }) : null
        ] }),
        /* @__PURE__ */ jsxs5(
          Box3,
          {
            className: "conv-log-sidebar-block conv-log-json-block",
            sx: { flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" },
            children: [
              /* @__PURE__ */ jsxs5(Box3, { className: "conv-log-json-head isa-neon-section-label", "aria-hidden": true, children: [
                /* @__PURE__ */ jsx7(Icon, { icon: "mdi:code-json", size: 15 }),
                /* @__PURE__ */ jsx7(Typography2, { component: "span", variant: "caption", className: "conv-log-json-head__label", children: "JSON del log" })
              ] }),
              /* @__PURE__ */ jsx7(
                GlassPanel,
                {
                  tone: "purple",
                  accent: NEON_COLORS.purple,
                  className: "log-json-editor-wrap",
                  sx: { flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column", p: 0 },
                  children: /* @__PURE__ */ jsx7(
                    JsonCodeEditor,
                    {
                      value: jsonInput,
                      onChange: onJsonInputChange,
                      placeholder: '{ "iconversacion": 1234, "mensajes": [ ... ] }'
                    }
                  )
                }
              )
            ]
          }
        )
      ]
    }
  );
}
function LogViewer({ bootLog = {} }) {
  const IsaSplitView = getIsaSplitView();
  const { Icon } = UI;
  const theme2 = useTheme();
  const isMobile = useMediaQuery(theme2.breakpoints.down("md"));
  const [entradaOpen, setEntradaOpen] = useState4(false);
  const [jsonInput, setJsonInput] = useState4(bootLog.jsonInput || "");
  const [convId, setConvId] = useState4(bootLog.convId || "");
  const [error, setError] = useState4("");
  const [loading, setLoading] = useState4(false);
  const [logInfo, setLogInfo] = useState4(null);
  const [mensajes, setMensajes] = useState4([]);
  const [metaOpen, setMetaOpen] = useState4(false);
  const [metaMsg, setMetaMsg] = useState4(null);
  const [resumenOpen, setResumenOpen] = useState4(false);
  const [selectedMsgId, setSelectedMsgId] = useState4(null);
  const [entradaFocus, setEntradaFocus] = useState4(null);
  const navItems = useMemo3(() => convLogNavItems(mensajes), [mensajes]);
  const aplicarLog = useCallback((log, { silent = false } = {}) => {
    const vista = logToMensajesVista(log);
    setLogInfo(log);
    setMensajes(vista);
    setSelectedMsgId(vista[0]?.idMsg ?? null);
    if (!vista.length) {
      const msg = "El log no tiene mensajes.";
      setError(msg);
      if (!silent) toastWarning(msg);
    } else {
      setError("");
      if (!silent) {
        toastSuccess(`${vista.length} mensaje(s) cargado(s)`);
        setEntradaOpen(false);
      }
    }
  }, []);
  useEffect4(() => {
    if (!bootLog.jsonInput?.trim()) return;
    try {
      aplicarLog(parseLogInput(bootLog.jsonInput), { silent: true });
    } catch (_) {
    }
  }, []);
  useEffect4(() => {
    const t = setTimeout(() => persistLogMeta(convId), 800);
    return () => clearTimeout(t);
  }, [convId]);
  const resumenChips = useMemo3(() => {
    if (!logInfo) return [];
    const chips = [];
    if (logInfo.iconversacion) chips.push({ label: `conv #${logInfo.iconversacion}`, color: "primary" });
    if (logInfo.resumen?.totalMensajes != null) chips.push({ label: `${logInfo.resumen.totalMensajes} mensajes`, color: "default" });
    if (logInfo.resumen?.tokens?.total) chips.push({ label: `${logInfo.resumen.tokens.total} tokens`, color: "secondary" });
    if (mensajes.length) chips.push({ label: `${mensajes.length} en hilo`, color: "info" });
    return chips;
  }, [logInfo, mensajes.length]);
  const canClear = useMemo3(
    () => Boolean(
      String(convId ?? "").trim() || jsonInput.trim() || logInfo || mensajes.length || error
    ),
    [convId, jsonInput, logInfo, mensajes.length, error]
  );
  useEffect4(() => {
    if (!jsonInput.trim()) return void 0;
    const t = window.setTimeout(() => {
      try {
        aplicarLog(parseLogInput(jsonInput), { silent: true });
      } catch (err) {
        setLogInfo(null);
        setMensajes([]);
        setSelectedMsgId(null);
        setError(err instanceof Error ? err.message : String(err));
      }
    }, 2e3);
    return () => window.clearTimeout(t);
  }, [jsonInput, aplicarLog]);
  const recuperarPorId = useCallback(async ({ silent = false } = {}) => {
    if (!String(convId ?? "").trim()) return;
    setError("");
    setLoading(true);
    try {
      const log = await fetchConvLogForQa(convId);
      setJsonInput(JSON.stringify(log, null, 2));
      aplicarLog(log, { silent });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  }, [convId, aplicarLog]);
  useEffect4(() => {
    if (bootLog.jsonInput?.trim()) return;
    const id = String(bootLog.convId ?? "").trim();
    if (!id) return;
    recuperarPorId({ silent: true });
  }, []);
  const onConvIdKeyDown = useCallback((e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (!String(convId ?? "").trim() || loading) return;
    recuperarPorId();
  }, [convId, loading, recuperarPorId]);
  const limpiar = useCallback(() => {
    setJsonInput("");
    setConvId("");
    setLogInfo(null);
    setMensajes([]);
    setSelectedMsgId(null);
    setError("");
  }, []);
  const scrollToMsg = useCallback((id) => {
    setSelectedMsgId(id);
    const el = document.getElementById(`conv-msg-${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
  const onMeta = useCallback((msg) => {
    setMetaMsg(msg);
    setMetaOpen(true);
  }, []);
  const entradaProps = {
    convId,
    loading,
    jsonInput,
    error,
    canClear,
    focusTarget: entradaFocus,
    onFocusApplied: () => setEntradaFocus(null),
    onConvIdChange: (e) => setConvId(e.target.value),
    onConvIdKeyDown,
    recuperarPorId,
    limpiar,
    onJsonInputChange: setJsonInput
  };
  const mainPanel = /* @__PURE__ */ jsxs5(Box3, { sx: { flex: 1, minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column" }, children: [
    isMobile ? /* @__PURE__ */ jsxs5(
      Stack2,
      {
        direction: "row",
        spacing: 1,
        alignItems: "center",
        sx: {
          px: 1,
          py: 0.5,
          borderBottom: 1,
          borderColor: "divider",
          flexShrink: 0,
          bgcolor: "background.paper"
        },
        children: [
          /* @__PURE__ */ jsx7(Tooltip, { title: "Entrada de log", arrow: true, children: /* @__PURE__ */ jsx7(IconButton, { size: "small", onClick: () => setEntradaOpen(true), "aria-label": "Abrir entrada de log", children: /* @__PURE__ */ jsx7(Icon, { icon: "mdi:database-import-outline", size: 20 }) }) }),
          /* @__PURE__ */ jsx7(Typography2, { variant: "subtitle2", sx: { fontWeight: 700, flex: 1 }, noWrap: true, children: "Hilo recuperado" })
        ]
      }
    ) : null,
    /* @__PURE__ */ jsxs5(
      Stack2,
      {
        direction: "row",
        spacing: 1,
        alignItems: "center",
        flexWrap: "wrap",
        useFlexGap: true,
        className: "conv-log-thread-head",
        sx: { px: { xs: 1, md: 2 }, py: 1, flexShrink: 0 },
        children: [
          /* @__PURE__ */ jsx7(
            Chip2,
            {
              className: "conv-log-thread-title-chip isa-neon-glass-chip",
              size: "small",
              label: /* @__PURE__ */ jsxs5(Box3, { component: "span", sx: { display: "inline-flex", alignItems: "center", gap: 0.75 }, children: [
                /* @__PURE__ */ jsx7(Icon, { icon: "mdi:clipboard-text-clock-outline", size: 16 }),
                "Hilo recuperado"
              ] })
            }
          ),
          resumenChips.map((c) => /* @__PURE__ */ jsx7(Chip2, { size: "small", label: c.label, color: c.color, variant: "outlined" }, c.label)),
          mensajes.length > 0 && /* @__PURE__ */ jsx7(Tooltip, { title: "Resumen e \xEDndice compacto de mensajes", arrow: true, children: /* @__PURE__ */ jsx7("span", { children: /* @__PURE__ */ jsx7(
            ButtonIconify,
            {
              variant: "primary",
              icon: "mdi:text-box-outline",
              title: "Ver resumen",
              onClick: () => setResumenOpen(true)
            }
          ) }) }),
          /* @__PURE__ */ jsx7(Box3, { sx: { flex: 1 } }),
          logInfo?.createdAt && /* @__PURE__ */ jsx7(Typography2, { variant: "caption", color: "text.secondary", title: String(logInfo.createdAt), children: formatTs(logInfo.createdAt) })
        ]
      }
    ),
    /* @__PURE__ */ jsx7(
      ConvLogThread,
      {
        mensajes,
        onMeta,
        showUsageStats: true,
        threadKey: convId || "log-paste",
        emptyHint: "Recupera por ID o pega un log para ver el hilo."
      }
    )
  ] });
  return /* @__PURE__ */ jsxs5(
    Box3,
    {
      className: "conv-log-shell",
      sx: { display: "flex", height: "100%", minHeight: 0, flexDirection: "column", position: "relative" },
      children: [
        isMobile ? /* @__PURE__ */ jsxs5(Fragment3, { children: [
          /* @__PURE__ */ jsx7(
            Drawer,
            {
              anchor: "left",
              open: entradaOpen,
              onClose: () => setEntradaOpen(false),
              ModalProps: { keepMounted: true },
              PaperProps: mobileDrawerPaperProps("paty-mobile-sidebar-drawer"),
              children: /* @__PURE__ */ jsx7(LogEntradaPanel, { ...entradaProps, drawerMode: true, onClose: () => setEntradaOpen(false) })
            }
          ),
          mainPanel
        ] }) : /* @__PURE__ */ jsx7(
          IsaSplitView,
          {
            className: "conv-log-shell-split",
            sx: { flex: 1, minHeight: 0 },
            panelClassName: "conv-log-sidebar",
            defaultWidth: LOG_SIDEBAR_DEFAULT_W,
            maxWidth: 560,
            readPersistedWidth: readLogSidebarWidthFromUrl,
            writePersistedWidth: persistLogSidebarWidth,
            panelTitle: "Entrada",
            panelIcon: "mdi:database-import-outline",
            UI,
            collapsedRail: ({ expand }) => /* @__PURE__ */ jsxs5(Box3, { className: "conv-log-collapsed-rail", children: [
              /* @__PURE__ */ jsx7(Tooltip, { title: "Buscar por iconversacion", placement: "right", children: /* @__PURE__ */ jsx7(
                IconButton,
                {
                  size: "small",
                  className: "isa-neon-rail-btn isa-neon-rail-btn--search",
                  "aria-label": "Buscar por iconversacion",
                  onClick: () => {
                    setEntradaFocus("convId");
                    expand();
                  },
                  children: /* @__PURE__ */ jsx7(Icon, { icon: "mdi:magnify", size: 20 })
                }
              ) }),
              /* @__PURE__ */ jsx7(Tooltip, { title: "Ver o editar JSON del log", placement: "right", children: /* @__PURE__ */ jsx7(
                IconButton,
                {
                  size: "small",
                  className: "isa-neon-rail-btn isa-neon-rail-btn--json",
                  "aria-label": "Ver o editar JSON del log",
                  onClick: () => {
                    setEntradaFocus("json");
                    expand();
                  },
                  children: /* @__PURE__ */ jsx7(Icon, { icon: "mdi:code-braces", size: 20 })
                }
              ) })
            ] }),
            panel: /* @__PURE__ */ jsx7(LogEntradaPanel, { ...entradaProps }),
            children: mainPanel
          }
        ),
        isMobile ? /* @__PURE__ */ jsx7(
          Fab,
          {
            color: "primary",
            size: "medium",
            className: "paty-mobile-sidebar-fab paty-mobile-sidebar-fab--log",
            "aria-label": "Abrir entrada de log",
            onClick: () => setEntradaOpen(true),
            sx: {
              position: "absolute",
              left: 12,
              zIndex: 6,
              display: entradaOpen ? "none" : "flex"
            },
            children: /* @__PURE__ */ jsx7(Icon, { icon: "mdi:database-import-outline", size: 22 })
          }
        ) : null,
        /* @__PURE__ */ jsx7(
          MetaDialog,
          {
            open: metaOpen,
            onClose: () => setMetaOpen(false),
            meta: metaMsg?.meta,
            usageStats: metaMsg?.usageStats ?? null,
            title: metaMsg ? `Trazabilidad \xB7 ${metaMsg.rol}` : "",
            isUserMessage: Boolean(metaMsg?.esUsuario),
            userContent: metaMsg?.contenido ?? "",
            imagenes: metaMsg?.imagenes ?? null
          }
        ),
        /* @__PURE__ */ jsx7(
          ResumenDialog,
          {
            open: resumenOpen,
            onClose: () => setResumenOpen(false),
            logInfo,
            navItems,
            selectedId: selectedMsgId,
            onSelectMsg: scrollToMsg
          }
        )
      ]
    }
  );
}
export {
  LogViewer
};
