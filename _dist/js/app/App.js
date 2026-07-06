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
    if (q.get("isa_cdn") === "local") return true;
    return localStorage.getItem("isa-patyia:local-cdn") === "1";
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
    return new URL("../../components/lightbox/cdn/", base).href.replace(/\/?$/, "/");
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
    CDN = isDevHost2 && useLocalMonorepoCdn() ? frontSharedCdnBase() : isDevHost2 ? JSDELIVR_CDN : vendorCdnBase();
    asset = (p) => isDevHost2 ? `${CDN}${p}` : `${CDN}${p}?v=${PIN}`;
    LIGHTBOX_ZOOM_REF = "4dd6595";
    SWAGGER_VIEWER_REF = "859035b";
  }
});

// js/core/patyia.ts
window.ISAFront.migrateLegacyGatewayKeys?.({ "jeff:gateway-local": "", "patyia-apptools:gateway-local": "", "patyia-apptools:lab-local": "" });
var ORCH_ONLINE = "https://main-orchestrator.jeffaporta.workers.dev";
var PATYIA_BRIDGE_URL = "https://ayudascp-ia-staging.azurewebsites.net";
var PATYIA_ISS_LOCAL = "http://127.0.0.1:8802";
var ORCH_LOCAL = "http://localhost:8790";
var SCRUM_LOCAL = "http://localhost:8798";
var TREE_MSGS_LOCAL = "http://localhost:8799";
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
function isDevHost() {
  try {
    return /^(localhost|127\.0\.0\.1|\[::1\])$/i.test(window.location.hostname);
  } catch {
    return false;
  }
}
function ensureIssLocalDefault() {
  try {
    if (localStorage.getItem(PATYIA_ISS_LOCAL_LS_KEY) != null) return;
    localStorage.setItem(PATYIA_ISS_LOCAL_LS_KEY, "0");
  } catch {
  }
}
function resolveIssApiBase() {
  const base = (isLocalMode() ? PATYIA_BRIDGE_LOCAL : PATYIA_BRIDGE_URL).replace(/\/$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
}
function buildUserAvatarUrl(name, size = 72) {
  const label = String(name ?? "").trim() || "Usuario";
  const params = new URLSearchParams({
    name: label,
    size: String(size),
    background: "1e90ff",
    color: "ffffff",
    bold: "true",
    format: "svg"
  });
  return `https://ui-avatars.com/api/?${params.toString()}`;
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

// js/core/platform.ts
var bridge = () => window.ISAFront.createPlatformBridge("ISA");
var UI = {
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
function frontSharedLazy() {
  const api = window.ISAFront;
  return api?.ensureCodeMirrorLoaded ? api : null;
}
var Assets = {
  ensureCodeMirrorLoaded: (opts) => {
    const api = frontSharedLazy();
    return api ? api.ensureCodeMirrorLoaded(opts) : Promise.resolve();
  },
  ensureMarked: () => {
    const api = frontSharedLazy();
    return api ? api.ensureMarked() : Promise.resolve();
  },
  ensureStylesheet: (href) => {
    const api = frontSharedLazy();
    return api ? api.ensureLazyStylesheet(href) : Promise.resolve();
  },
  ensureChatStagingCss: () => {
    const api = frontSharedLazy();
    if (!api) return;
    const prefix = typeof window !== "undefined" && window.__ISA_DIST__ ? "_dist/" : "";
    api.ensureLazyStylesheet(`${prefix}css/chat-staging.css`).catch((err) => {
      console.warn("chat-staging.css:", err);
    });
  },
  ensureTodosCss: () => {
    const api = frontSharedLazy();
    if (!api) return;
    const prefix = typeof window !== "undefined" && window.__ISA_DIST__ ? "_dist/" : "";
    api.ensureLazyStylesheet(`${prefix}css/todos-staging.css`).catch((err) => {
      console.warn("todos-staging.css:", err);
    });
  }
};
function mdToHtml(src) {
  const api = frontSharedLazy();
  if (api?.mdToHtml) return api.mdToHtml(src);
  return String(src ?? "");
}
var Tokens = {
  estimatePrompt: (text) => {
    const fn = window.ISAFront?.estimatePromptTokens;
    if (typeof fn === "function") return fn(text);
    const s = String(text ?? "");
    return s.trim() ? Math.ceil(s.length / 4) : 0;
  }
};
var getReact = () => window.ISAFront.getReact();
var getReactDOM = () => window.ISAFront.getReactDOM();
var getMaterialUI = () => window.ISAFront.getMaterialUI();
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
var Lightbox = {
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
function CodeMirrorPanel(props) {
  const Panel = window.ISAFront?.CodeMirrorPanel;
  if (!Panel) throw new Error("CodeMirrorPanel no cargado \u2014 recargue sin cach\xE9 (Ctrl+Shift+R).");
  return Panel(props);
}
var fb = () => globalThis.ISAFront?.Feedback;
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

// js/core/urlState.ts
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
  return { v: STATE_VERSION, tool: "log", log: {}, prompts: {}, chat: {}, todos: {}, config: {} };
}
function normalizeTool(raw) {
  if (raw === "prompts") return "prompts";
  if (raw === "chat") return "chat";
  if (raw === "todos") return "todos";
  if (raw === "config") return "config";
  return "log";
}
function normalizeChatBag(chat) {
  const bag = chat && typeof chat === "object" ? { ...chat } : {};
  if ((bag.mode == null || String(bag.mode).trim() === "") && bag.jailbreak != null) {
    bag.mode = bag.jailbreak === true ? "libre" : "patyia";
    delete bag.jailbreak;
  } else if (bag.jailbreak != null) {
    delete bag.jailbreak;
  }
  return bag;
}
function normalize(raw, _prev) {
  if (!raw || typeof raw !== "object") return initial();
  const tool = normalizeTool(raw.tool);
  const chat = normalizeChatBag(raw.chat);
  const todos = raw.todos && typeof raw.todos === "object" ? raw.todos : {};
  const config = raw.config && typeof raw.config === "object" ? raw.config : {};
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
function configPermisosBag(snap) {
  const cfg = (snap ?? getSnapshot()).config;
  const permisos = cfg?.permisos;
  return permisos && typeof permisos === "object" ? permisos : void 0;
}
function readPermisosHideEmptyFromUrl() {
  return configPermisosBag()?.hideEmpty === true;
}
function persistPermisosHideEmpty(hide) {
  const prev = configPermisosBag()?.hideEmpty === true;
  if (prev === hide) return getSnapshot();
  return mergePartial({ tool: "config", config: { permisos: { hideEmpty: !!hide } } });
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
    const { Typography: Typography32, Box: Box35 } = getMaterialUI();
    return /* @__PURE__ */ jsx(Box35, { sx: { p: 2, textAlign: "center" }, children: /* @__PURE__ */ jsx(Typography32, { variant: "body2", color: "error", children: "No se pudo cargar el visor de im\xE1genes. Recargue sin cach\xE9 (Ctrl+Shift+R)." }) });
  }
  if (!ready) return null;
  const Comp = Lightbox.ImageLightboxDialog;
  return /* @__PURE__ */ jsx(Comp, { ns: "ISA", ...props, onClose });
}

// js/ui/GlassDialog.jsx
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
  const { DialogActions: DialogActions14, Button: Button25 } = getMaterialUI();
  return /* @__PURE__ */ jsx2(DialogActions14, { sx: glassDialogActionsSx(), children: /* @__PURE__ */ jsx2(Button25, { onClick: onClose, sx: { textTransform: "none", fontWeight: 600, minWidth: 72 }, children: label }) });
}
function GlassDialogHeader({ icon = "mdi:information-outline", title, subtitle, accent = "#1e90ff", onClose }) {
  const { Box: Box35, Typography: Typography32, IconButton: IconButton16, Stack: Stack28 } = getMaterialUI();
  const { Icon: Icon24 } = UI;
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
  return /* @__PURE__ */ jsxs(Box35, { className: "isa-glass-dialog__header", sx: { position: "relative", flexShrink: 0 }, children: [
    /* @__PURE__ */ jsx2(Box35, { sx: bandSx, children: /* @__PURE__ */ jsxs(Stack28, { direction: "row", spacing: 1.25, alignItems: "center", sx: { pr: onClose ? 4 : 0 }, children: [
      /* @__PURE__ */ jsx2(Box35, { sx: iconSx, children: /* @__PURE__ */ jsx2(Icon24, { icon, size: 24 }) }),
      /* @__PURE__ */ jsxs(Box35, { sx: { flex: 1, minWidth: 0 }, children: [
        /* @__PURE__ */ jsx2(Typography32, { variant: "h5", component: "h2", sx: titleSx, children: title }),
        subtitle ? /* @__PURE__ */ jsx2(Typography32, { variant: "caption", color: "text.secondary", display: "block", sx: { mt: 0.35, lineHeight: 1.4 }, children: subtitle }) : null
      ] })
    ] }) }),
    onClose ? /* @__PURE__ */ jsx2(IconButton16, { size: "small", onClick: onClose, "aria-label": "Cerrar", className: "isa-glass-dialog__close", sx: { position: "absolute", top: 10, right: 10 }, children: /* @__PURE__ */ jsx2(Icon24, { icon: "mdi:close", size: 18 }) }) : null
  ] });
}
function GlassDialog({ children, header = null, maxWidth, fullWidth, paperMaxWidth, paperClassName, slotProps, ...dialogProps }) {
  const { Dialog: Dialog10 } = getMaterialUI();
  const props = resolveGlassDialogProps({ maxWidth, fullWidth, paperMaxWidth, paperClassName, slotProps, ...dialogProps });
  return /* @__PURE__ */ jsxs(Dialog10, { ...props, children: [
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
  const { Typography: Typography32, Box: Box35, Stack: Stack28, Chip: Chip23, IconButton: IconButton16, Tooltip: Tooltip18 } = getMaterialUI();
  const { useState: useState36, useMemo: useMemo22 } = getReact();
  const trace = fileSearchFromMeta(meta);
  const archivos = archivosCitadosFromMeta(meta);
  const chunks = useMemo22(() => chunksFromMeta(meta), [meta]);
  const vectorStores = useMemo22(() => vectorStoresFromMeta(meta), [meta]);
  const [openChunk, setOpenChunk] = useState36(null);
  if (!trace?.length && !archivos.length && !chunks.length && !vectorStores.length) return null;
  return /* @__PURE__ */ jsxs2(Box35, { className: "meta-file-search", sx: { mt: 1.5 }, children: [
    vectorStores.length ? /* @__PURE__ */ jsxs2(Box35, { className: "meta-file-search__vector-stores", sx: { mb: 1.5 }, children: [
      /* @__PURE__ */ jsx3(Typography32, { variant: "subtitle2", fontWeight: 700, sx: { mb: 0.75 }, children: "Vector stores consultados" }),
      /* @__PURE__ */ jsxs2(Typography32, { variant: "caption", color: "text.secondary", display: "block", sx: { mb: 0.75 }, children: [
        "\xCDndice = posici\xF3n en ",
        /* @__PURE__ */ jsx3("code", { children: "vector_store_ids" }),
        " enviado al modelo (0 = primero). Usa el ID completo para verificar en OpenAI/BD."
      ] }),
      /* @__PURE__ */ jsx3(Stack28, { spacing: 0.5, children: vectorStores.map((vs) => /* @__PURE__ */ jsxs2(
        Box35,
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
            /* @__PURE__ */ jsx3(Chip23, { size: "small", variant: "outlined", label: `\xEDndice ${vs.index}`, className: "meta-file-search__vs-index" }),
            /* @__PURE__ */ jsx3(Typography32, { component: "code", variant: "body2", sx: { wordBreak: "break-all", fontFamily: "monospace" }, children: vs.id })
          ]
        },
        vs.id
      )) })
    ] }) : null,
    /* @__PURE__ */ jsx3(Typography32, { variant: "subtitle2", fontWeight: 700, sx: { mb: 0.75 }, children: "File Search (archivos citados)" }),
    archivos.length ? /* @__PURE__ */ jsx3(Stack28, { direction: "row", spacing: 0.5, flexWrap: "wrap", useFlexGap: true, sx: { mb: chunks.length ? 1.25 : 0 }, children: archivos.map((name) => /* @__PURE__ */ jsx3(
      Chip23,
      {
        size: "small",
        variant: "outlined",
        icon: /* @__PURE__ */ jsx3("iconify-icon", { icon: "mdi:file-document-outline", width: "14", height: "14" }),
        label: name,
        title: name
      },
      name
    )) }) : null,
    chunks.length ? /* @__PURE__ */ jsx3(Stack28, { spacing: 0.85, className: "meta-file-search__chunk-list", children: chunks.map((c) => {
      const preview = chunkPreview(c.text, 380);
      const vsIdx = c.vectorStoreId ? vectorStoreIndexLabel(vectorStores, c.vectorStoreId) : null;
      return /* @__PURE__ */ jsxs2(Box35, { className: "meta-file-search__chunk", children: [
        /* @__PURE__ */ jsxs2(Stack28, { direction: "row", spacing: 0.75, alignItems: "center", sx: { mb: 0.5 }, children: [
          /* @__PURE__ */ jsx3("iconify-icon", { icon: "mdi:text-box-search-outline", width: "16", height: "16" }),
          /* @__PURE__ */ jsx3(Typography32, { variant: "body2", fontWeight: 600, sx: { flex: 1, minWidth: 0 }, children: c.filename || c.fileId || "fragmento" }),
          vsIdx != null ? /* @__PURE__ */ jsx3(
            Chip23,
            {
              size: "small",
              variant: "outlined",
              label: `VS \xEDndice ${vsIdx}`,
              title: c.vectorStoreId || void 0,
              className: "meta-file-search__vs-chip"
            }
          ) : null,
          c.score != null ? /* @__PURE__ */ jsx3(
            Chip23,
            {
              size: "small",
              variant: "outlined",
              label: `score ${Number(c.score).toFixed(3)}`,
              className: "meta-file-search__score"
            }
          ) : null,
          /* @__PURE__ */ jsx3(Tooltip18, { title: "Ver fragmento en full-page", children: /* @__PURE__ */ jsx3(
            IconButton16,
            {
              size: "small",
              "aria-label": `Ver fragmento de ${c.filename || c.fileId || "fragmento"}`,
              onClick: () => setOpenChunk(c),
              className: "meta-file-search__open",
              children: /* @__PURE__ */ jsx3("iconify-icon", { icon: "mdi:fullscreen", width: "16", height: "16" })
            }
          ) })
        ] }),
        c.queries?.length ? /* @__PURE__ */ jsxs2(Typography32, { variant: "caption", color: "text.secondary", display: "block", sx: { mb: 0.35 }, children: [
          "Queries: ",
          c.queries.join(" \xB7 ")
        ] }) : null,
        /* @__PURE__ */ jsx3(
          Typography32,
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
  const { DialogContent: DialogContent16 } = getMaterialUI();
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
    /* @__PURE__ */ jsx3(DialogContent16, { dividers: true, sx: glassDialogContentSx(), children: /* @__PURE__ */ jsx3(FileSearchMetaSection, { meta }) }),
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
  const { Dialog: Dialog10, DialogTitle: DialogTitle10, DialogContent: DialogContent16, IconButton: IconButton16, Typography: Typography32, Box: Box35 } = getMaterialUI();
  const { Icon: Icon24 } = UI;
  const html = mdToHtml(String(source ?? ""));
  return /* @__PURE__ */ jsxs2(
    Dialog10,
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
          DialogTitle10,
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
                Box35,
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
                  children: /* @__PURE__ */ jsx3(Icon24, { icon, size: 20 })
                }
              ),
              /* @__PURE__ */ jsxs2(Box35, { sx: { flex: 1, minWidth: 0 }, children: [
                /* @__PURE__ */ jsx3(Typography32, { variant: "h6", fontWeight: 700, noWrap: true, children: title }),
                subtitle ? /* @__PURE__ */ jsx3(Typography32, { variant: "caption", color: "text.secondary", noWrap: true, children: subtitle }) : null
              ] }),
              /* @__PURE__ */ jsx3(IconButton16, { onClick: onClose, "aria-label": "Cerrar visor", size: "small", children: /* @__PURE__ */ jsx3("iconify-icon", { icon: "mdi:close", width: "18", height: "18" }) })
            ]
          }
        ),
        /* @__PURE__ */ jsx3(
          DialogContent16,
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

// js/ui/ConvLogWebView.jsx
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
  const { Paper: Paper5, Stack: Stack28, Typography: Typography32, Box: Box35, IconButton: IconButton16, Tooltip: Tooltip18 } = getMaterialUI();
  const { Icon: Icon24 } = UI;
  const color = accent || "#1e90ff";
  const isRight = align === "right";
  const softMuted = muted && !operativa;
  const fullNeon = !compact;
  return /* @__PURE__ */ jsxs3(
    Paper5,
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
          Box35,
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
                Stack28,
                {
                  direction: "row",
                  spacing: 1.25,
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  useFlexGap: true,
                  sx: { flexDirection: isRight ? "row-reverse" : "row" },
                  children: [
                    /* @__PURE__ */ jsxs3(
                      Stack28,
                      {
                        direction: "row",
                        spacing: 1.25,
                        alignItems: "flex-start",
                        sx: { flex: 1, minWidth: 0, flexDirection: isRight ? "row-reverse" : "row" },
                        children: [
                          /* @__PURE__ */ jsx5(
                            Box35,
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
                              children: /* @__PURE__ */ jsx5(Icon24, { icon, size: 18 })
                            }
                          ),
                          /* @__PURE__ */ jsxs3(
                            Box35,
                            {
                              className: isRight ? "conv-msg-card__title conv-msg-card__title--right" : "conv-msg-card__title",
                              sx: {
                                minWidth: 0,
                                flex: 1,
                                ...isRight ? { pr: 1.25, textAlign: "right" } : { pl: 0 }
                              },
                              children: [
                                /* @__PURE__ */ jsx5(
                                  Typography32,
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
                                  Typography32,
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
                    onMeta && /* @__PURE__ */ jsx5(Tooltip18, { title: "Trazabilidad del mensaje", arrow: true, children: /* @__PURE__ */ jsx5(IconButton16, { size: "small", onClick: onMeta, "aria-label": "Ver trazabilidad", sx: { alignSelf: "flex-start", mt: -0.25 }, children: /* @__PURE__ */ jsx5(Icon24, { icon: "mdi:information-outline", size: 20 }) }) })
                  ]
                }
              ),
              metaChips ? /* @__PURE__ */ jsx5(Box35, { className: `conv-msg-card__meta-row${isRight ? " conv-msg-card__meta-row--right" : ""}`, children: metaChips }) : null
            ]
          }
        ),
        /* @__PURE__ */ jsx5(Box35, { sx: { p: compact ? { xs: 1.25, sm: 1.5 } : { xs: 2, sm: 2.5 } }, children }),
        fecha || footerExtra ? /* @__PURE__ */ jsx5(
          Box35,
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
              Stack28,
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
                    Typography32,
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
  const { Stack: Stack28 } = getMaterialUI();
  return /* @__PURE__ */ jsx5(
    Stack28,
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
  const { Typography: Typography32, Box: Box35 } = getMaterialUI();
  const raw = String(text || "");
  const placeholderOnly = /^\((?:imagen adjunta|nota de voz)\)$/i.test(raw.trim());
  const hasText = Boolean(raw.trim()) && !placeholderOnly;
  const html = mdToHtml(raw);
  return /* @__PURE__ */ jsxs3(Fragment2, { children: [
    streaming && !hasText && !audios?.length ? /* @__PURE__ */ jsxs3(Box35, { className: "conv-stream-typing", "aria-label": "PatyIA est\xE1 escribiendo", role: "status", children: [
      /* @__PURE__ */ jsx5("span", {}),
      /* @__PURE__ */ jsx5("span", {}),
      /* @__PURE__ */ jsx5("span", {})
    ] }) : /* @__PURE__ */ jsxs3(Box35, { className: `conv-msg-body-wrap${streaming ? " conv-msg-body-wrap--streaming" : ""}`, children: [
      /* @__PURE__ */ jsx5(
        Typography32,
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
      streaming && hasText ? /* @__PURE__ */ jsx5(Box35, { component: "span", className: "conv-stream-cursor", "aria-hidden": true }) : null
    ] }),
    imagenes?.length > 0 && /* @__PURE__ */ jsx5(ConvMsgImages, { items: imagenes, align, onImageClick }),
    audios?.length > 0 && /* @__PURE__ */ jsx5(ConvMsgAudios, { items: audios, transcriptions: audiosTranscripcion, align })
  ] });
}
function ConvMsgAudios({ items, transcriptions, align = "right" }) {
  const { Box: Box35, Typography: Typography32 } = getMaterialUI();
  const renderable = (items || []).filter((src) => String(src || "").trim().startsWith("data:audio/") || /^https?:\/\//i.test(String(src || "").trim()));
  if (!renderable.length) return null;
  return /* @__PURE__ */ jsx5(
    Box35,
    {
      className: `conv-msg-audios conv-msg-audios--${align}`,
      sx: {
        display: "flex",
        flexDirection: "column",
        gap: 1,
        mt: 1.25,
        alignItems: align === "right" ? "flex-end" : "flex-start"
      },
      children: renderable.map((src, idx) => /* @__PURE__ */ jsxs3(Box35, { className: "conv-msg-audio-item", children: [
        /* @__PURE__ */ jsx5("audio", { controls: true, preload: "metadata", src, "aria-label": `Nota de voz ${idx + 1}` }),
        transcriptions?.[idx] ? /* @__PURE__ */ jsx5(Typography32, { variant: "caption", component: "p", className: "conv-msg-audio-transcript", sx: { mt: 0.5, opacity: 0.85 }, children: transcriptions[idx] }) : null
      ] }, `${idx}-${String(src).slice(0, 32)}`))
    }
  );
}
function ConvMsgImages({ items, align = "right", onImageClick }) {
  const { Box: Box35 } = getMaterialUI();
  const renderable = (items || []).filter((src) => {
    const s = String(src || "").trim();
    if (/^\[file_id:/i.test(s)) return false;
    return s.startsWith("data:image/") || s.startsWith("http://") || s.startsWith("https://");
  });
  if (!renderable.length) return null;
  return /* @__PURE__ */ jsx5(
    Box35,
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
  const { Box: Box35 } = getMaterialUI();
  const ctxItems = buildUsageDialogCtxItems(meta);
  if (!ctxItems.length) return null;
  return /* @__PURE__ */ jsx5(Box35, { className: "conv-usage-dialog__meta conv-usage-dialog__meta--ctx", children: /* @__PURE__ */ jsx5("div", { className: "conv-usage-dialog__ctx-grid", children: ctxItems.map((item) => /* @__PURE__ */ jsxs3(
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
  const { DialogContent: DialogContent16, Typography: Typography32, Box: Box35, Chip: Chip23, Stack: Stack28, Tooltip: Tooltip18, IconButton: IconButton16 } = getMaterialUI();
  const { useMemo: useMemo22, useState: useState36 } = getReact();
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
  const chunks = useMemo22(() => chunksFromMeta(meta), [meta]);
  const archivos = useMemo22(() => archivosCitadosFromMeta(meta), [meta]);
  const [openChunk, setOpenChunk] = useState36(null);
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
          /* @__PURE__ */ jsx5(DialogContent16, { dividers: true, className: "conv-usage-dialog", sx: glassDialogContentSx({ p: { xs: 1.5, sm: 2 } }), children: /* @__PURE__ */ jsxs3(Box35, { className: "conv-usage-dialog__stack", children: [
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
                  /* @__PURE__ */ jsx5(Typography32, { variant: "caption", color: "text.secondary", component: "div", className: "conv-usage-dialog__section-sub", sx: { mb: 1 }, children: archivos.length ? `Chunks extra\xEDdos por file_search (${chunks.length} de ${archivos.length} archivo${archivos.length === 1 ? "" : "s"}).` : `${chunks.length} fragmento${chunks.length === 1 ? "" : "s"} del message.` }),
                  archivos.length ? /* @__PURE__ */ jsx5(Stack28, { direction: "row", spacing: 0.5, flexWrap: "wrap", useFlexGap: true, className: "conv-usage-dialog__files", sx: { mb: 1 }, children: archivos.map((name) => {
                    const clickable = chunks.some((c) => c.filename === name);
                    return /* @__PURE__ */ jsx5(
                      Chip23,
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
                  /* @__PURE__ */ jsx5(Stack28, { spacing: 0.75, className: "conv-usage-dialog__chunks", children: chunks.map((c) => /* @__PURE__ */ jsxs3(
                    Box35,
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
                        /* @__PURE__ */ jsxs3(Stack28, { direction: "row", spacing: 0.75, alignItems: "center", sx: { mb: 0.35 }, children: [
                          /* @__PURE__ */ jsx5("iconify-icon", { icon: "mdi:text-box-search-outline", width: "16", height: "16" }),
                          /* @__PURE__ */ jsx5(Typography32, { variant: "body2", fontWeight: 600, sx: { flex: 1, minWidth: 0 }, children: c.filename || c.fileId || "fragmento" }),
                          c.score != null ? /* @__PURE__ */ jsx5(
                            Chip23,
                            {
                              size: "small",
                              variant: "outlined",
                              label: `score ${Number(c.score).toFixed(3)}`,
                              className: "conv-usage-dialog__chunk-score"
                            }
                          ) : null,
                          /* @__PURE__ */ jsx5(Tooltip18, { title: "Ver fragmento en full-page", children: /* @__PURE__ */ jsx5(IconButton16, { size: "small", "aria-label": "Abrir fragmento", className: "conv-usage-dialog__chunk-open", children: /* @__PURE__ */ jsx5("iconify-icon", { icon: "mdi:fullscreen", width: "16", height: "16" }) }) })
                        ] }),
                        /* @__PURE__ */ jsx5(
                          Typography32,
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
            ) : /* @__PURE__ */ jsxs3(Box35, { className: "conv-usage-dialog__section-card conv-usage-dialog__section-card--chunks", children: [
              /* @__PURE__ */ jsxs3("div", { className: "conv-usage-dialog__section-head", children: [
                /* @__PURE__ */ jsx5(Typography32, { component: "h3", variant: "subtitle2", className: "conv-usage-dialog__section-title", children: "Fragmentos citados" }),
                /* @__PURE__ */ jsx5(Typography32, { variant: "caption", color: "text.secondary", className: "conv-usage-dialog__section-sub", children: archivos.length ? `Chunks extra\xEDdos por file_search (${chunks.length} de ${archivos.length} archivo${archivos.length === 1 ? "" : "s"}).` : `${chunks.length} fragmento${chunks.length === 1 ? "" : "s"} del message.` })
              ] }),
              archivos.length ? /* @__PURE__ */ jsx5(Stack28, { direction: "row", spacing: 0.5, flexWrap: "wrap", useFlexGap: true, className: "conv-usage-dialog__files", children: archivos.map((name) => {
                const clickable = chunks.some((c) => c.filename === name);
                return /* @__PURE__ */ jsx5(
                  Chip23,
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
              /* @__PURE__ */ jsx5(Stack28, { spacing: 0.75, className: "conv-usage-dialog__chunks", children: chunks.map((c) => /* @__PURE__ */ jsxs3(
                Box35,
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
                    /* @__PURE__ */ jsxs3(Stack28, { direction: "row", spacing: 0.75, alignItems: "center", sx: { mb: 0.35 }, children: [
                      /* @__PURE__ */ jsx5("iconify-icon", { icon: "mdi:text-box-search-outline", width: "16", height: "16" }),
                      /* @__PURE__ */ jsx5(Typography32, { variant: "body2", fontWeight: 600, sx: { flex: 1, minWidth: 0 }, children: c.filename || c.fileId || "fragmento" }),
                      c.score != null ? /* @__PURE__ */ jsx5(
                        Chip23,
                        {
                          size: "small",
                          variant: "outlined",
                          label: `score ${Number(c.score).toFixed(3)}`,
                          className: "conv-usage-dialog__chunk-score"
                        }
                      ) : null,
                      /* @__PURE__ */ jsx5(Tooltip18, { title: "Ver fragmento en full-page", children: /* @__PURE__ */ jsx5(IconButton16, { size: "small", "aria-label": "Abrir fragmento", className: "conv-usage-dialog__chunk-open", children: /* @__PURE__ */ jsx5("iconify-icon", { icon: "mdi:fullscreen", width: "16", height: "16" }) }) })
                    ] }),
                    /* @__PURE__ */ jsx5(
                      Typography32,
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
  const { Box: Box35, Typography: Typography32, Stack: Stack28 } = getMaterialUI();
  const { Icon: Icon24 } = UI;
  const cost = section?.cost;
  const tokens = section?.tokens;
  const totalCost = Number(cost?.total ?? 0) || 0;
  const totalTokens = Number(tokens?.total ?? 0) || 0;
  const reasoning = Number(tokens?.reason ?? tokens?.reasoning ?? 0) || 0;
  const totalTokLabel = totalTokens ? totalTokens.toLocaleString("es-CO") : "\u2014";
  const costLabel = totalCost > 0 ? `$${totalCost.toFixed(6)}` : "\u2014";
  const reasonLabel = reasoning > 0 ? `${reasoning.toLocaleString("es-CO")} razon.` : null;
  const body = /* @__PURE__ */ jsxs3(Box35, { className: "conv-usage-dialog__section-body", children: [
    /* @__PURE__ */ jsxs3(
      Stack28,
      {
        direction: { xs: "column", sm: "row" },
        spacing: { xs: 1, sm: 2 },
        alignItems: { xs: "stretch", sm: "center" },
        justifyContent: "space-between",
        className: "conv-usage-dialog__headline",
        children: [
          /* @__PURE__ */ jsxs3(Box35, { className: "conv-usage-dialog__headline-main", children: [
            /* @__PURE__ */ jsx5(Typography32, { variant: "overline", className: "conv-usage-dialog__headline-k", sx: { lineHeight: 1, display: "block", opacity: 0.7 }, children: "Costo" }),
            /* @__PURE__ */ jsx5(
              Typography32,
              {
                variant: "h4",
                component: "span",
                className: `conv-usage-dialog__headline-v conv-usage-dialog__headline-v--${section.key}`,
                sx: { fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.05, fontFamily: '"IBM Plex Mono", ui-monospace, monospace' },
                children: costLabel
              }
            )
          ] }),
          /* @__PURE__ */ jsxs3(Stack28, { direction: "row", spacing: 1, alignItems: "center", className: "conv-usage-dialog__headline-meta", children: [
            /* @__PURE__ */ jsxs3(Box35, { className: "conv-usage-dialog__headline-meta-item", children: [
              /* @__PURE__ */ jsx5(Typography32, { variant: "overline", sx: { lineHeight: 1, display: "block", opacity: 0.7 }, children: "Tokens" }),
              /* @__PURE__ */ jsx5(
                Typography32,
                {
                  variant: "h6",
                  component: "span",
                  className: "conv-usage-dialog__headline-meta-v",
                  sx: { fontWeight: 700, lineHeight: 1.1, fontFamily: '"IBM Plex Mono", ui-monospace, monospace' },
                  children: totalTokLabel
                }
              )
            ] }),
            reasonLabel ? /* @__PURE__ */ jsxs3(Box35, { className: "conv-usage-dialog__headline-meta-item conv-usage-dialog__headline-meta-item--reason", children: [
              /* @__PURE__ */ jsx5(Typography32, { variant: "overline", sx: { lineHeight: 1, display: "block", opacity: 0.7 }, children: "Razonamiento" }),
              /* @__PURE__ */ jsx5(
                Typography32,
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
    /* @__PURE__ */ jsx5(Box35, { className: "conv-usage-dialog__metrics-wrap", children: /* @__PURE__ */ jsx5(
      UsageMetricsGrid,
      {
        className: "conv-usage-dialog__metrics",
        hideRowLabels: true,
        sections: [{ key: section.key, label: section.title, tokens: section.tokens, cost: section.cost }]
      }
    ) })
  ] });
  if (!GlassSection) {
    return /* @__PURE__ */ jsxs3(Box35, { className: `conv-usage-dialog__section-card conv-usage-dialog__section-card--${section.key}`, children: [
      /* @__PURE__ */ jsxs3("div", { className: "conv-usage-dialog__section-head", children: [
        /* @__PURE__ */ jsx5(Typography32, { component: "h3", variant: "subtitle2", className: "conv-usage-dialog__section-title", children: section.title }),
        /* @__PURE__ */ jsx5(Typography32, { variant: "caption", color: "text.secondary", className: "conv-usage-dialog__section-sub", children: section.subtitle })
      ] }),
      body
    ] });
  }
  return /* @__PURE__ */ jsx5(
    GlassSection,
    {
      sectionKey: `conv-usage-${section.key}`,
      className: `conv-usage-dialog__glass-section conv-usage-dialog__glass-section--${section.key}`,
      title: /* @__PURE__ */ jsxs3(Stack28, { direction: "row", spacing: 1, alignItems: "baseline", sx: { minWidth: 0, flex: 1 }, children: [
        /* @__PURE__ */ jsx5(Typography32, { component: "span", variant: "subtitle1", sx: { fontWeight: 700, letterSpacing: -0.2 }, children: section.title }),
        /* @__PURE__ */ jsx5(Typography32, { component: "span", variant: "caption", color: "text.secondary", sx: { flex: 1, minWidth: 0 }, children: section.subtitle })
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
  const { Box: Box35 } = getMaterialUI();
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
      Box35,
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
          showMetaBadges ? /* @__PURE__ */ jsxs3(Box35, { className: `conv-msg-usage-stats__meta conv-msg-usage-stats__meta--${align}`, children: [
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
          groups.length > 0 ? /* @__PURE__ */ jsx5(Box35, { className: `conv-msg-usage-stats__groups conv-msg-usage-stats__groups--${align}`, children: groups.map((group) => /* @__PURE__ */ jsxs3(Box35, { className: `conv-msg-usage-stats__group conv-msg-usage-stats__group--${group.key}`, children: [
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
  const { Stack: Stack28, IconButton: IconButton16, Tooltip: Tooltip18, CircularProgress: CircularProgress22 } = getMaterialUI();
  const { Icon: Icon24 } = UI;
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
  return /* @__PURE__ */ jsxs3(
    Stack28,
    {
      direction: "row",
      spacing: 0.25,
      alignItems: "center",
      justifyContent: align === "right" ? "flex-end" : "flex-start",
      className: `conv-msg-rating conv-msg-rating--${align}`,
      role: "group",
      "aria-label": "Calificaci\xF3n del mensaje",
      children: [
        /* @__PURE__ */ jsx5(Tooltip18, { title: upTooltip, arrow: true, children: /* @__PURE__ */ jsx5("span", { children: /* @__PURE__ */ jsx5(
          IconButton16,
          {
            size: "small",
            className: `conv-msg-rating__btn conv-msg-rating__btn--up${useful ? " conv-msg-rating__btn--active" : ""}`,
            "aria-label": useful ? "Calificado como \xFAtil" : "Marcar como \xFAtil",
            "aria-pressed": useful,
            disabled: disabled || busy || rated,
            onClick: () => onRate(true),
            children: busy && !rated ? /* @__PURE__ */ jsx5(CircularProgress22, { size: 16 }) : /* @__PURE__ */ jsx5(Icon24, { icon: useful ? "mdi:thumb-up" : "mdi:thumb-up-outline", size: 18 })
          }
        ) }) }),
        /* @__PURE__ */ jsx5(Tooltip18, { title: downTooltip, arrow: true, children: /* @__PURE__ */ jsx5("span", { children: /* @__PURE__ */ jsx5(
          IconButton16,
          {
            size: "small",
            className: `conv-msg-rating__btn conv-msg-rating__btn--down${notUseful ? " conv-msg-rating__btn--active" : ""}`,
            "aria-label": notUseful ? "Calificado como no \xFAtil" : "Marcar como no \xFAtil",
            "aria-pressed": notUseful,
            disabled: disabled || busy || rated,
            onClick: () => onRate(false),
            children: /* @__PURE__ */ jsx5(Icon24, { icon: notUseful ? "mdi:thumb-down" : "mdi:thumb-down-outline", size: 18 })
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
  const { Alert: Alert20, Box: Box35 } = getMaterialUI();
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
    Box35,
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
          Box35,
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
                Box35,
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
                        msg.streamFailed && msg.streamError && /* @__PURE__ */ jsx5(Alert20, { severity: "warning", sx: { mb: 1.5, py: 0.25, fontSize: "0.78rem" }, children: msg.streamError }),
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
                Box35,
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
                    ratingRow ? /* @__PURE__ */ jsx5(Box35, { className: "conv-msg-rating-slot", children: ratingRow }) : null
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
  const { Box: Box35, Typography: Typography32 } = getMaterialUI();
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
    return /* @__PURE__ */ jsx5(Typography32, { variant: "body2", color: "text.secondary", sx: { textAlign: "center", py: 6 }, children: emptyHint || "Recupera por ID o pega un log para ver el hilo." });
  }
  return /* @__PURE__ */ jsxs3(Box35, { className: threadClassName || void 0, sx: { width: "100%", maxWidth: "100%" }, children: [
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

// js/api/portalJwtApi.ts
var PATYIA_PORTAL_ID = "soporte-staging";
function authHeaders() {
  const h = { Accept: "application/json" };
  if (Session.isLoggedIn()) {
    Object.assign(h, Session.authHeader(), Session.appHeader());
  }
  return h;
}
function portalUrl(portal, query = "") {
  const q = `portal=${encodeURIComponent(portal)}${query ? `&${query}` : ""}`;
  return Config.apiUrl(`/api/auth/portal-jwt?${q}`);
}
async function fetchPortalJwt(portal = PATYIA_PORTAL_ID) {
  const res = await fetch(portalUrl(portal), { headers: authHeaders() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    throw new Error(data.error || "No se pudo cargar el JWT del portal");
  }
  return data;
}
async function savePortalJwt(token, portal = PATYIA_PORTAL_ID) {
  const res = await fetch(portalUrl(portal), {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ portal, token })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    throw new Error(data.error || "No se pudo guardar el JWT del portal");
  }
  return data;
}

// js/core/patyia-jwt.ts
var PATYIA_JWT_STORAGE_KEY = "isa-patyia:paty-jwt";
var PATYIA_API_BASE = "https://ayudascp-ia-staging.azurewebsites.net/api";
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
async function savePatyJwtAsync(token, savedBy) {
  const saved = await savePortalJwt(token.trim(), PATYIA_PORTAL_ID);
  return cachePatyJwt(buildPatyJwtRecord(token, savedBy, saved.expiresAt));
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
  if (cached && cached.savedBy?.toUpperCase() === u) {
    if (!isFaithfulImpersonation() || !cached.actingAsUsername) return cached;
    clearPatyJwtLocal({ silent: true });
  }
  if (cached && cached.savedBy?.toUpperCase() !== u) clearPatyJwtLocal({ silent: true });
  try {
    const data = await fetchPortalJwt(PATYIA_PORTAL_ID);
    if (!data.token || isPatyJwtExpired(data.token)) {
      clearPatyJwtLocal({ silent: true });
      return null;
    }
    return savePatyJwt(data.token, u, data.expiresAt ?? null);
  } catch {
    return loadPatyJwt();
  }
}
function isFaithfulImpersonation() {
  return Boolean(Session.isViewingAs?.());
}
function canInteractPatyChat(sessionUser, jwt) {
  const u = String(sessionUser || "").trim().toUpperCase();
  if (!u || !jwt?.token) return false;
  if (isFaithfulImpersonation()) {
    return jwt.savedBy?.toUpperCase() === u && !jwt.actingAsUsername;
  }
  if (jwt.savedBy?.toUpperCase() === u) return true;
  if (!Session.can("patyia.chat.interact")) return false;
  if (jwt.actingAsUsername && Session.can("patyia.jwt.admin")) return true;
  return false;
}
function canAdminPortalJwt() {
  if (isFaithfulImpersonation()) return false;
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
  const qs3 = new URLSearchParams();
  qs3.set(ISS_LIST_FILTER_QUERY_PARAM, encodeIssListFilterB64(buildConversacionesListFilter({
    search: input.search,
    limit,
    offset,
    sort: input.sort
  })));
  const itercero = String(input.itercero ?? "").trim();
  const icontacto = String(input.icontacto ?? "").trim();
  if (itercero && icontacto) {
    qs3.set("itercero", itercero);
    qs3.set("icontacto", icontacto);
  }
  return qs3;
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
  const qs3 = conversacionesListQueryParams({
    page: input.page,
    limit: input.limit,
    search: input.search,
    sort: input.sort,
    itercero: input.itercero,
    icontacto: input.icontacto
  });
  return `/conversaciones?${qs3.toString()}`;
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
function ensureBase64DataUrl(src) {
  const s = String(src || "").trim();
  if (!s) return s;
  if (s.startsWith("data:")) return s;
  if (/^[A-Za-z0-9+/=\s]+$/.test(s.replace(/\s/g, ""))) {
    return `data:image/png;base64,${s.replace(/\s/g, "")}`;
  }
  return s;
}
function buildConversacionPostBody(input) {
  const text = String(input.prompt || "").trim();
  const imagenes = (input.imagenes || []).map(ensureBase64DataUrl).filter(Boolean);
  const audios = (input.audios || []).filter(Boolean);
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
  if (!String(body.prompt || "").trim() && hasMedia) {
    body.prompt = imagenes.length ? "(imagen adjunta)" : "(nota de voz)";
  }
  return body;
}
function formatConversacionPostBodyPreview(body, { maxB64 = 72 } = {}) {
  const clone = JSON.parse(JSON.stringify(body));
  if (Array.isArray(clone.imagenes)) {
    clone.imagenes = clone.imagenes.map((img, i) => {
      const s = String(img ?? "");
      if (s.length <= maxB64 + 24) return s;
      const mime = s.startsWith("data:") ? s.slice(5, s.indexOf(";")) || "?" : "?";
      return `${s.slice(0, maxB64)}\u2026 [base64 ${mime}, ${s.length.toLocaleString("es-CO")} chars, img ${i + 1}]`;
    });
  }
  if (Array.isArray(clone.audios)) {
    clone.audios = clone.audios.map((aud, i) => {
      const s = String(aud ?? "");
      if (s.length <= maxB64 + 24) return s;
      const mime = s.startsWith("data:") ? s.slice(5, s.indexOf(";")) || "?" : "?";
      return `${s.slice(0, maxB64)}\u2026 [base64 ${mime}, ${s.length.toLocaleString("es-CO")} chars, audio ${i + 1}]`;
    });
  }
  return JSON.stringify(clone, null, 2);
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

// js/api/systemConfigApi.ts
var OPENAI_DEFAULTS = {
  max_num_results: 8,
  modeloOperativo: "gpt-4.1-nano",
  modeloConversacion: "gpt-5-nano"
};
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
function permEntityKey(entry) {
  return String(entry?.ientity ?? entry?.iusuario ?? "").trim();
}
function normalizePermEntry(entry) {
  const key = permEntityKey(entry);
  return {
    iusuario: key,
    ientity: key || void 0,
    itipo: entry?.itipo === "user" ? "user" : "role",
    permisos: entry?.permisos && typeof entry.permisos === "object" ? entry.permisos : {},
    bactivo: entry?.bactivo !== false
  };
}
function normalizeHierarchyNode(node) {
  const iusuario = permEntityKey(node).toLowerCase();
  return {
    iusuario,
    jerarquia: String(node.jerarquia ?? iusuario ?? "").trim(),
    namedisplay: node.namedisplay != null ? String(node.namedisplay) : null,
    descripcion: node.descripcion != null ? String(node.descripcion) : null
  };
}
function normalizePermissionsPayload(raw) {
  const roles = (Array.isArray(raw?.roles) ? raw.roles : []).map((e) => normalizePermEntry(e));
  const users = (Array.isArray(raw?.users) ? raw.users : []).map((e) => normalizePermEntry(e));
  return { ...raw, roles, users };
}
async function fetchOpenAiSystemConfig() {
  const body = await jsonFetch2("/system/openai", { method: "GET", headers: systemApiHeaders() });
  return { ...OPENAI_DEFAULTS, ...body.config ?? {}, canEdit: !!body.canEdit };
}
async function putOpenAiSystemConfig(config) {
  const { canEdit: _c, ...payload } = config;
  const body = await jsonFetch2("/system/openai", {
    method: "PUT",
    headers: { ...systemApiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const saved = body.config ?? payload;
  window.dispatchEvent(new CustomEvent("isa-patyia:openai-config", { detail: saved }));
  return saved;
}
async function fetchPromptsOperativosConfig() {
  const body = await jsonFetch2("/system/prompts-operativos", { method: "GET", headers: systemApiHeaders() });
  return { config: body.config ?? {}, canEdit: !!body.canEdit };
}
async function putPromptsOperativosConfig(config) {
  const body = await jsonFetch2("/system/prompts-operativos", {
    method: "PUT",
    headers: { ...systemApiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(config)
  });
  return body.config ?? config;
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
function applyPermissionsMeToKanban(data, me) {
  if (!me) return data;
  return {
    ...data,
    canManage: me.capabilities.canManagePermissions,
    canAssignUserRoles: me.capabilities.canAssignUserRoles,
    canEditRoleDescriptions: me.capabilities.canEditRoleDescriptions || me.capabilities.canManagePermissions,
    actorRoles: me.roles,
    _permissionsMe: me
  };
}
async function fetchHierarchy() {
  const raw = await jsonFetch2(`/system/permisos/hierarchy`, {
    method: "GET",
    headers: systemApiHeaders()
  });
  const roles = (Array.isArray(raw?.roles) ? raw.roles : []).map((r) => normalizeHierarchyNode(r)).filter((r) => r.iusuario && r.jerarquia);
  return { roles, count: roles.length || Number(raw?.count ?? 0) || 0 };
}
async function createHierarchyRole(input) {
  return jsonFetch2(`/system/permisos/hierarchy/roles`, {
    method: "POST",
    headers: { ...systemApiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
}
async function updateHierarchyRole(name, input) {
  return jsonFetch2(`/system/permisos/hierarchy/roles/${encodeURIComponent(name)}`, {
    method: "PUT",
    headers: { ...systemApiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
}
async function deleteHierarchyRole(name) {
  await jsonFetch2(`/system/permisos/hierarchy/roles/${encodeURIComponent(name)}`, {
    method: "DELETE",
    headers: systemApiHeaders()
  });
}
async function fetchPermisos(opts) {
  const qs3 = new URLSearchParams();
  const search = String(opts?.search ?? "").trim();
  const role = String(opts?.role ?? "").trim();
  if (search) qs3.set("search", search);
  if (role) qs3.set("role", role);
  const q = qs3.toString();
  const [raw, me] = await Promise.all([
    jsonFetch2(`/system/permisos${q ? `?${q}` : ""}`, { method: "GET", headers: systemApiHeaders() }),
    fetchPermissionsMe().catch(() => null)
  ]);
  return applyPermissionsMeToKanban(normalizePermissionsPayload(raw), me);
}
async function searchPermisosUsers(query = "", opts) {
  const q = String(query ?? "").trim();
  const result = await fetchPermisos({
    ...q ? { search: q } : {},
    ...opts?.role ? { role: opts.role } : {}
  });
  return (result.users ?? []).map((e) => ({
    username: String(e.iusuario ?? "").trim().toUpperCase(),
    displayName: (() => {
      const p = e.permisos;
      const name = p?.nombre ?? p?.namedisplay;
      return name != null && String(name).trim() ? String(name).trim() : null;
    })()
  })).filter((u) => u.username);
}
async function putPermisoRolePath(name, permisos, bactivo) {
  const role = encodeURIComponent(String(name).trim().toLowerCase().replace(/^role:/, ""));
  const body = { permisos };
  if (bactivo !== void 0) body.bactivo = bactivo;
  return jsonFetch2(`/system/permisos/roles/${role}`, {
    method: "PUT",
    headers: { ...systemApiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}
async function patchUsuarioRoles(username, body) {
  const u = encodeURIComponent(String(username).trim().toUpperCase());
  return jsonFetch2(`/system/permisos/usuarios/${u}/roles`, {
    method: "PATCH",
    headers: { ...systemApiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}
async function addUsuarioRole(username, role) {
  const u = encodeURIComponent(String(username).trim().toUpperCase());
  return jsonFetch2(`/system/permisos/usuarios/${u}/roles`, {
    method: "PATCH",
    headers: { ...systemApiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ toRole: String(role).trim().toLowerCase(), mode: "add" })
  });
}
async function removeUsuarioRole(username, role) {
  const u = encodeURIComponent(String(username).trim().toUpperCase());
  return jsonFetch2(`/system/permisos/usuarios/${u}/roles`, {
    method: "PATCH",
    headers: { ...systemApiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ fromRole: String(role).trim().toLowerCase(), mode: "remove" })
  });
}
function requireAppSession(onNeedLogin) {
  if (Session.isLoggedIn()) return true;
  onNeedLogin?.();
  return false;
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
function ancestorsFromPath(jerarquia) {
  const parts = String(jerarquia ?? "").split(".").filter(Boolean);
  const out = [];
  for (let i = parts.length - 1; i >= 0; i--) {
    out.push(parts.slice(0, i + 1).join("."));
  }
  return out;
}
function isSameInheritanceLine(a, b) {
  const x = String(a ?? "").trim();
  const y = String(b ?? "").trim();
  if (!x || !y) return false;
  if (x === y) return true;
  return x.startsWith(`${y}.`) || y.startsWith(`${x}.`);
}
function canManageRole(actorJerarquia, targetJerarquia) {
  const target = String(targetJerarquia ?? "").trim();
  if (!target || target === DEFAULT_FOR_UNKNOWN) return false;
  return isSameInheritanceLine(actorJerarquia, target);
}
function actorCanManageTarget(actorJerarquias, targetJerarquia) {
  for (const j of actorJerarquias ?? []) {
    if (canManageRole(j, targetJerarquia)) return true;
  }
  return false;
}
function actorJerarquiasFromRoles(roles, rolePermisosByName = {}) {
  return (roles ?? []).map((r) => String(r ?? "").trim().toLowerCase()).filter((r) => r && r !== "visitante").map((r) => getRoleJerarquia(r, rolePermisosByName[r]));
}
function actorJerarquiaFromRoles(roles, rolePermisosByName = {}) {
  const jerarquias = actorJerarquiasFromRoles(roles, rolePermisosByName);
  if (!jerarquias.length) return DEFAULT_FOR_UNKNOWN;
  jerarquias.sort((a, b) => {
    const depth = (s) => String(s).split(".").filter(Boolean).length;
    const d = depth(b) - depth(a);
    if (d !== 0) return d;
    return compareHierarchy(a, b);
  });
  return jerarquias[0];
}
function formatJerarquiaLabel(jerarquia) {
  if (jerarquia == null || jerarquia === "") return "";
  return `(${jerarquia})`;
}
function isBranchZero(jerarquia) {
  const j = String(jerarquia ?? "").trim();
  return j === "0" || j.startsWith("0.");
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
function canEditPromptsOperativos() {
  return !!localMeCaps().canEditPromptsOperativos;
}
function canAccessOthers() {
  return !!localMeCaps().canAccessOthers;
}
function instruccionesPublishCap() {
  return canEditInstrucciones() ? INSTRUCCIONES_WRITE_CAP : null;
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
  const { Icon: Icon24 } = UI;
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
        /* @__PURE__ */ jsx7(Icon24, { icon: it.icon, size: 15, style: { opacity: 0.75, flexShrink: 0, marginRight: 6 } }),
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
  parsearPegado,
  limpiar,
  onJsonInputChange
}) {
  const { Icon: Icon24 } = UI;
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
            children: onClose ? /* @__PURE__ */ jsx7(Tooltip, { title: "Cerrar panel", children: /* @__PURE__ */ jsx7(IconButton, { size: "small", onClick: onClose, "aria-label": "Cerrar panel", children: /* @__PURE__ */ jsx7(Icon24, { icon: "mdi:close", size: 18 }) }) }) : null
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
              sx: { p: 1, display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", alignItems: "center", gap: 1, width: "100%", flexWrap: "nowrap" },
              children: [
                /* @__PURE__ */ jsx7(
                  TextField,
                  {
                    className: "conv-log-action-grp__input",
                    size: "small",
                    type: "number",
                    hiddenLabel: true,
                    placeholder: "iconversacion",
                    "aria-label": "iconversacion",
                    value: convId,
                    disabled: loading,
                    onChange: onConvIdChange,
                    onKeyDown: onConvIdKeyDown,
                    slotProps: { htmlInput: { min: 1 } }
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
                  /* @__PURE__ */ jsx7(Tooltip, { title: "Parsear JSON", arrow: true, children: /* @__PURE__ */ jsx7("span", { children: /* @__PURE__ */ jsx7(
                    ButtonIconify,
                    {
                      variant: "primary",
                      icon: "mdi:code-json",
                      title: "Parsear JSON",
                      onClick: parsearPegado,
                      disabled: !jsonInput.trim()
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
                /* @__PURE__ */ jsx7(Icon24, { icon: "mdi:code-json", size: 15 }),
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
  const { Icon: Icon24 } = UI;
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
  const parsearPegado = useCallback(() => {
    setError("");
    try {
      const log = parseLogInput(jsonInput);
      aplicarLog(log);
    } catch (err) {
      setLogInfo(null);
      setMensajes([]);
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      toastError(msg);
    }
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
    parsearPegado,
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
          /* @__PURE__ */ jsx7(Tooltip, { title: "Entrada de log", arrow: true, children: /* @__PURE__ */ jsx7(IconButton, { size: "small", onClick: () => setEntradaOpen(true), "aria-label": "Abrir entrada de log", children: /* @__PURE__ */ jsx7(Icon24, { icon: "mdi:database-import-outline", size: 20 }) }) }),
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
                /* @__PURE__ */ jsx7(Icon24, { icon: "mdi:clipboard-text-clock-outline", size: 16 }),
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
          logInfo?.createdAt && /* @__PURE__ */ jsx7(Typography2, { variant: "caption", color: "text.secondary", children: String(logInfo.createdAt).slice(0, 19).replace("T", " ") })
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
                  children: /* @__PURE__ */ jsx7(Icon24, { icon: "mdi:magnify", size: 20 })
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
                  children: /* @__PURE__ */ jsx7(Icon24, { icon: "mdi:code-braces", size: 20 })
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
            children: /* @__PURE__ */ jsx7(Icon24, { icon: "mdi:database-import-outline", size: 22 })
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
function getInstructionCatalog() {
  return [...INSTRUCTION_META_BY_KEY.values()];
}
function allInstructionKeys(extraKeys = []) {
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  const push = (k) => {
    const key = String(k ?? "").trim().toUpperCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    out.push(key);
  };
  for (const meta of PATY_SYSTEM_INSTRUCTIONS) push(meta.iinstruccion);
  for (const tipo of PATY_PROMPT_TIPOS) push(tipo);
  const extras = [];
  for (const k of extraKeys) {
    const key = String(k ?? "").trim().toUpperCase();
    if (key && !seen.has(key)) extras.push(key);
  }
  extras.sort((a, b) => a.localeCompare(b));
  return [...out, ...extras];
}
function getInstructionMeta(iinstruccion) {
  const key = String(iinstruccion ?? "").trim().toUpperCase();
  if (!key) return null;
  const known = INSTRUCTION_META_BY_KEY.get(key);
  if (known) return known;
  return {
    iinstruccion: key,
    ninstruccion: `PROMPT_${key}`,
    archivo: `PROMPT_${key}.md`,
    descripcion: `Instrucci\xF3n ${key}`,
    defaultModel: DEFAULT_JCONFIG.model,
    kind: PATY_PROMPT_TIPOS.includes(key) ? "tdconsulta" : "unknown"
  };
}
function isTdConsultaInstruction(iinstruccion) {
  return getInstructionMeta(iinstruccion)?.kind === "tdconsulta";
}
function createPromptSlot(iinstruccion, patch = {}) {
  const meta = getInstructionMeta(iinstruccion);
  const model = patch.jconfig?.model || meta.defaultModel || DEFAULT_JCONFIG.model;
  return {
    archivo: patch.archivo || meta.archivo,
    tipo: meta.iinstruccion,
    iinstruccion: meta.iinstruccion,
    ninstruccion: meta.ninstruccion,
    kind: meta.kind,
    body: patch.body ?? "",
    source: patch.source ?? "plantilla",
    dirty: Boolean(patch.dirty),
    configDirty: Boolean(patch.configDirty),
    jconfig: patch.jconfig || { ...DEFAULT_JCONFIG, model },
    jconfigBaseline: patch.jconfigBaseline ?? null
  };
}
var PROMPT_FILE_RE = /^PROMPT_([A-Z0-9_]+)\.(md|txt)$/i;
function fileToTipo(name) {
  const m = String(name).trim().match(PROMPT_FILE_RE);
  if (!m) return null;
  const stem = m[1].toUpperCase();
  if (PATY_PROMPT_TIPOS.includes(stem)) return stem;
  if (INSTRUCTION_META_BY_KEY.has(stem)) return stem;
  return null;
}
function matchFilenameToIinstruccion(fileName) {
  const name = String(fileName ?? "").trim();
  const m = name.match(PROMPT_FILE_RE);
  if (!m) return [];
  const stem = m[1].toUpperCase();
  const matches = [];
  for (const meta of getInstructionCatalog()) {
    if (stem === meta.iinstruccion) matches.push(meta.iinstruccion);
    else if (stem === meta.ninstruccion) matches.push(meta.iinstruccion);
    else if (name.toUpperCase() === String(meta.archivo).toUpperCase()) matches.push(meta.iinstruccion);
  }
  return [...new Set(matches)];
}
function matchContentToIinstrucciones(content) {
  const text = String(content ?? "");
  if (!text.trim()) return [];
  const matches = [];
  for (const meta of getInstructionCatalog()) {
    const key = meta.iinstruccion;
    const ninst = meta.ninstruccion;
    const headerRe = new RegExp(`^#?\\s*iinstruccion\\s*:\\s*${key}\\s*$`, "im");
    const eqRe = new RegExp(`(?:^|\\n)\\s*iinstruccion\\s*=\\s*${key}\\s*(?:\\n|$)`, "i");
    const ninstRe = new RegExp(`^#?\\s*ninstruccion\\s*:\\s*${ninst}\\s*$`, "im");
    if (headerRe.test(text) || eqRe.test(text) || ninstRe.test(text)) matches.push(key);
  }
  return [...new Set(matches)];
}
function prepareFileImportRows(files) {
  return (files || []).map((f) => {
    const nameMatches = matchFilenameToIinstruccion(f.name);
    const contentMatches = matchContentToIinstrucciones(f.content);
    let suggested = "";
    let matchSource = "";
    if (nameMatches.length === 1 && (contentMatches.length === 0 || contentMatches.includes(nameMatches[0]))) {
      suggested = nameMatches[0];
      matchSource = contentMatches.length ? "filename+content" : "filename";
    } else if (nameMatches.length === 0 && contentMatches.length === 1) {
      suggested = contentMatches[0];
      matchSource = "content";
    } else if (nameMatches.length === 1 && contentMatches.length === 1 && nameMatches[0] === contentMatches[0]) {
      suggested = nameMatches[0];
      matchSource = "filename+content";
    }
    return {
      fileName: f.name,
      content: String(f.content ?? ""),
      suggested,
      matchSource,
      nameMatches,
      contentMatches,
      selected: suggested
    };
  });
}
function applyFileImportSelections(rows) {
  const updates = {};
  for (const row of rows || []) {
    const key = String(row.selected ?? "").trim().toUpperCase();
    if (!key) continue;
    updates[key] = {
      archivo: row.fileName,
      tipo: key,
      iinstruccion: key,
      body: String(row.content ?? "").trim(),
      source: "archivo",
      dirty: true
    };
  }
  return updates;
}
function sqlEscapeLiteral(text) {
  return `N'${String(text).replace(/'/g, "''")}'`;
}
function estimatePromptTokens(text) {
  const s = String(text ?? "");
  return s.trim() ? Math.ceil(s.length / 4) : 0;
}
function bodyMetrics(body) {
  const text = String(body ?? "");
  return { chars: text.length, tokens: estimatePromptTokens(text) };
}
function pickJconfigMeta(o) {
  const src = o && typeof o === "object" ? o : {};
  const meta = {};
  if (src.author != null && String(src.author).trim()) meta.author = String(src.author).trim();
  if (src.fmod != null && String(src.fmod).trim()) meta.fmod = String(src.fmod).trim();
  if (src.chars != null && Number.isFinite(Number(src.chars))) meta.chars = Number(src.chars);
  if (src.tokens != null && Number.isFinite(Number(src.tokens))) meta.tokens = Number(src.tokens);
  return meta;
}
var PATY_MODEL_OPTIONS = [
  "gpt-5-nano",
  "gpt-5-mini",
  "gpt-5-codex",
  "gpt-5-chat-latest",
  "gpt-5",
  "gpt-4.1",
  "gpt-4.1-mini",
  "gpt-4.1-nano",
  "gpt-4o",
  "gpt-4o-mini"
];
function mergeModelOptions(...models) {
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  const add = (id) => {
    const m = String(id ?? "").trim();
    if (!m || seen.has(m)) return;
    seen.add(m);
    out.push(m);
  };
  for (const id of PATY_MODEL_OPTIONS) add(id);
  for (const id of models) add(id);
  return out.sort((a, b) => a.localeCompare(b));
}
function parseJconfig(raw, fallbackModel) {
  const fb2 = String(fallbackModel || DEFAULT_JCONFIG.model).trim() || DEFAULT_JCONFIG.model;
  if (raw == null || !String(raw).trim()) {
    return { ...DEFAULT_JCONFIG, model: fb2 };
  }
  try {
    const o = typeof raw === "string" ? JSON.parse(raw) : raw;
    const modelRaw = String(o.model ?? "").trim();
    return {
      provider: String(o.provider || DEFAULT_JCONFIG.provider),
      model: modelRaw || fb2,
      temperature: Number(o.temperature ?? DEFAULT_JCONFIG.temperature),
      top_p: Number(o.top_p ?? DEFAULT_JCONFIG.top_p),
      ...pickJconfigMeta(o)
    };
  } catch {
    return { ...DEFAULT_JCONFIG, model: fb2 };
  }
}
function serializeJconfig(jc) {
  const model = String(jc?.model ?? DEFAULT_JCONFIG.model).trim() || DEFAULT_JCONFIG.model;
  const out = {
    provider: jc?.provider || DEFAULT_JCONFIG.provider,
    model,
    temperature: Number(jc?.temperature ?? DEFAULT_JCONFIG.temperature),
    top_p: Number(jc?.top_p ?? DEFAULT_JCONFIG.top_p),
    ...pickJconfigMeta(jc)
  };
  return JSON.stringify(out);
}
function syncJconfigMetrics(jc, body) {
  const { chars, tokens } = bodyMetrics(body);
  return { ...jc, chars, tokens };
}
function enrichJconfigForSave(jc, { body, author } = {}) {
  const { chars, tokens } = bodyMetrics(body);
  const next = {
    ...jc,
    chars,
    tokens,
    fmod: (/* @__PURE__ */ new Date()).toISOString()
  };
  const who = String(author ?? jc?.author ?? "").trim();
  if (who) next.author = who;
  return next;
}
function mapEntryToInstruccion(entry) {
  const explicit = String(entry.iinstruccion ?? entry.tipo ?? "").trim().toUpperCase();
  const fromName = matchFilenameToIinstruccion(entry.archivo);
  const iinstruccion = explicit || (fromName.length === 1 ? fromName[0] : null) || fileToTipo(entry.archivo);
  const meta = iinstruccion ? getInstructionMeta(iinstruccion) : null;
  const jconfig = entry.jconfig || parseJconfig(entry.jconfigRaw, meta?.defaultModel);
  const known = Boolean(meta && meta.kind !== "unknown");
  return {
    archivo: entry.archivo,
    tipo: iinstruccion,
    iinstruccion,
    ninstruccion: meta?.ninstruccion ?? (iinstruccion ? `PROMPT_${iinstruccion}` : null),
    nitdconsulta: isTdConsultaInstruction(iinstruccion) ? iinstruccion : null,
    chars: (entry.body || "").length,
    known,
    kind: meta?.kind ?? "unknown",
    source: entry.source,
    body: entry.body,
    jconfig,
    status: !iinstruccion ? "sin_mapeo" : known ? "ok" : "tipo_desconocido"
  };
}
function buildTdConsultaLinkSql(iinstruccion) {
  return `
MERGE TDCONSULTAXINSTRUCCION AS t
USING (
	SELECT c.itdconsulta, N'${iinstruccion}' AS iinstruccion, 1 AS orden
	FROM TDCONSULTA c
	WHERE c.itdconsulta = N'${iinstruccion}'
) AS s
ON t.itdconsulta = s.itdconsulta AND t.iinstruccion = s.iinstruccion
WHEN MATCHED THEN UPDATE SET t.orden = s.orden
WHEN NOT MATCHED THEN INSERT (itdconsulta, iinstruccion, orden)
	VALUES (s.itdconsulta, s.iinstruccion, s.orden);`;
}
function buildMergeSql(rows) {
  const valid = rows.filter((r) => r.iinstruccion && r.body);
  if (!valid.length) return { sql: "", rows: valid, error: "No hay instrucciones v\xE1lidas para guardar." };
  const head = `-- =====================================================================
-- Carga de instrucciones PatyIA (generado por isa-patyia)
-- Fuente: PROMPT_* (.md / .txt)
-- =====================================================================
SET NOCOUNT ON;
SET XACT_ABORT ON;
BEGIN TRAN;
`;
  const stmts = valid.map((r) => {
    const key = r.iinstruccion;
    const meta = getInstructionMeta(key);
    const ninst = r.ninstruccion || meta.ninstruccion;
    const desc = meta.descripcion || `Instrucci\xF3n ${key}`;
    const jc = r.jconfig || parseJconfig(null, meta.defaultModel);
    const jconfigJson = sqlEscapeLiteral(serializeJconfig(jc));
    const tdLink = isTdConsultaInstruction(key) ? buildTdConsultaLinkSql(key) : "";
    return `
-- ----- ${key} (${r.archivo}) -----
MERGE INSTRUCCION AS t
USING (VALUES (
	N'${key}',
	N'${ninst}',
	${sqlEscapeLiteral(r.body)},
	N'${desc.replace(/'/g, "''")}',
	N'1.0',
	1,
	${jconfigJson}
)) AS s (iinstruccion, ninstruccion, instruccion, descripcion, version, bactivo, jconfig)
ON t.iinstruccion = s.iinstruccion
WHEN MATCHED THEN UPDATE SET
	t.ninstruccion = s.ninstruccion,
	t.instruccion  = s.instruccion,
	t.descripcion  = s.descripcion,
	t.version      = s.version,
	t.bactivo      = s.bactivo,
	t.jconfig      = s.jconfig
WHEN NOT MATCHED THEN INSERT (iinstruccion, ninstruccion, instruccion, descripcion, version, bactivo, jconfig, fhini)
	VALUES (s.iinstruccion, s.ninstruccion, s.instruccion, s.descripcion, s.version, s.bactivo, s.jconfig, SYSUTCDATETIME());
${tdLink}
`;
  }).join("\n");
  const tail = `
COMMIT;

SELECT i.iinstruccion, i.ninstruccion, i.version, i.jconfig, LEN(i.instruccion) AS len_instruccion
FROM INSTRUCCION i
WHERE i.iinstruccion IN (${valid.map((r) => `N'${r.iinstruccion}'`).join(", ")})
ORDER BY i.iinstruccion;
`;
  return { sql: head + stmts + tail, rows: valid, error: null };
}
function analyzeFromEntries(entries) {
  const mapped = (entries || []).map((e) => mapEntryToInstruccion({
    archivo: e.archivo,
    body: e.body,
    source: e.source || "editor",
    iinstruccion: e.iinstruccion || e.tipo,
    jconfig: e.jconfig,
    jconfigRaw: e.jconfigRaw
  }));
  const mssql = buildMergeSql(mapped);
  return {
    mapped,
    sqlMssql: mssql.sql,
    validRows: mssql.rows,
    error: mssql.error
  };
}
function emptyPromptState() {
  const out = {};
  for (const key of allInstructionKeys()) {
    out[key] = createPromptSlot(key);
  }
  return out;
}

// js/tools/promptsSql/helpers.ts
var { createElement, Fragment: Fragment4 } = getReact();
function isDraftPrompt(p) {
  if (!p) return false;
  return p.dirty || p.source === "url" || p.source === "editor" || p.source === "archivo";
}
function jconfigEqual(a, b) {
  if (!a || !b) return false;
  return a.model === b.model && Number(a.temperature) === Number(b.temperature) && Number(a.top_p) === Number(b.top_p);
}
function isConfigDirty(p) {
  if (!p?.configDirty) return false;
  if (!p.jconfigBaseline) return true;
  return !jconfigEqual(p.jconfig, p.jconfigBaseline);
}
function hasPendingChanges(p) {
  return isDraftPrompt(p) || isConfigDirty(p);
}
function readFilesAsText(fileList) {
  return Promise.all(
    [...fileList].map(async (f) => ({
      name: f.name,
      content: await f.text()
    }))
  );
}
function draftBodiesFromPrompts(prompts) {
  const bodies = {};
  for (const [tipo, p] of Object.entries(prompts)) {
    if (isDraftPrompt(p) && p?.body?.trim()) bodies[tipo] = p.body;
  }
  return bodies;
}
function formatCharsTokens(body) {
  const text = String(body ?? "");
  if (!text.trim()) return "\u2014";
  const chars = text.length;
  const tokens = Tokens.estimatePrompt(text);
  return createElement(
    Fragment4,
    null,
    chars,
    createElement("span", { className: "prompt-mapeo-metric-sep" }, " | "),
    tokens
  );
}
function formatFmod(iso) {
  if (!iso) return "\u2014";
  try {
    return new Date(iso).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "medium" });
  } catch {
    return String(iso);
  }
}
function jconfigView(jc, body) {
  const live = syncJconfigMetrics(jc || parseJconfig(null), body);
  return {
    provider: live.provider,
    model: live.model,
    temperature: live.temperature,
    top_p: live.top_p,
    chars: live.chars,
    tokens: live.tokens,
    author: live.author || null,
    fmod: live.fmod || null
  };
}
function urlDraftTipoSet(bootPrompts) {
  const bodies = bootPrompts?.bodies || {};
  const listed = Array.isArray(bootPrompts?.draftTipos) ? bootPrompts.draftTipos.map((t) => String(t).toUpperCase()).filter(Boolean) : Object.keys(bodies).map((t) => String(t).toUpperCase());
  return new Set(listed);
}
function ensurePublishCap(onNeedLogin) {
  const cap = instruccionesPublishCap();
  if (cap) return true;
  const reason = blockReason(INSTRUCCIONES_WRITE_CAP) || "Sin permiso para publicar instrucciones";
  toastWarning(reason);
  if (!isLoggedIn()) onNeedLogin?.();
  return false;
}
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
    slotProps: {
      htmlInput: {
        step: "0.01",
        min: "0",
        max: "1",
        style: { fontSize: "0.72rem", width: "4.5rem" },
        onKeyDown: handleKeyDown,
        onWheel: handleWheel
      }
    },
    onChange: handleChange
  };
}

// js/core/promptVariables.ts
var PROMPT_VAR_PATTERN = /\{\{\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}\}/g;
var MALFORMED_PROMPT_VAR_PATTERN = /\{\{\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}(?!\})/g;
var INSTRUCCION_TIPO_SLOT_RES = [/\{\{\s*instruccion_tipo\s*\}\}/i, /\{\{\s*instrucion_tipo\s*\}\}/i];
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
function hasInstruccionTipoSlot(text) {
  return INSTRUCCION_TIPO_SLOT_RES.some((re) => re.test(String(text ?? "")));
}
function preparePromptBodyForSave(text) {
  return repairPromptVarBraces(String(text ?? "").trim());
}

// js/tools/promptsSql/cloudRows.ts
function buildInitialPromptState(bootPrompts, urlBodies) {
  const base = emptyPromptState();
  for (const [tipo, body] of Object.entries(urlBodies)) {
    if (!urlDraftTipoSet(bootPrompts).has(String(tipo).toUpperCase())) continue;
    const key = String(tipo).toUpperCase();
    if (!base[key] && !String(body).trim()) continue;
    if (!base[key]) base[key] = createPromptSlot(key);
    if (!String(body).trim()) continue;
    base[key] = { ...base[key], body: String(body), dirty: true, source: "url" };
  }
  return base;
}
function mergeCloudRows(prev, rows, { onlyTipo = null, onlyTipos = null, ignoreUrl = false } = {}, { urlBodies, urlDraftTipos }) {
  const scope = onlyTipos?.length ? new Set(onlyTipos.map((t) => String(t).toUpperCase())) : onlyTipo ? /* @__PURE__ */ new Set([String(onlyTipo).toUpperCase()]) : null;
  const unknownKeys = [];
  const next = { ...prev };
  const touched = /* @__PURE__ */ new Set();
  for (const row of rows) {
    const tipo = String(rowVal(row, "IINSTRUCCION") ?? "").trim().toUpperCase();
    if (!tipo) continue;
    if (!next[tipo]) {
      unknownKeys.push(tipo);
      next[tipo] = createPromptSlot(tipo);
    }
    const rawBody = String(rowVal(row, "INSTRUCCION") ?? rowVal(row, "instruccion") ?? "").trim();
    const body = preparePromptBodyForSave(rawBody);
    const bodyRepaired = Boolean(rawBody && body !== rawBody);
    const rawJconfig = rowVal(row, "JCONFIG") ?? rowVal(row, "jconfig");
    const jconfig = syncJconfigMetrics(
      rawJconfig && typeof rawJconfig === "object" && !Array.isArray(rawJconfig) ? rawJconfig : parseJconfig(rawJconfig),
      body
    );
    if (scope && !scope.has(tipo)) continue;
    touched.add(tipo);
    const urlBody = ignoreUrl ? "" : urlBodies[tipo]?.trim();
    const urlIsDraft = !ignoreUrl && urlDraftTipos.has(tipo) && Boolean(urlBody);
    const basePatch = { jconfig, jconfigBaseline: { ...jconfig }, configDirty: false };
    if (urlIsDraft) {
      if (body && urlBody === body) {
        next[tipo] = { ...next[tipo], ...basePatch, body, dirty: bodyRepaired, source: "bd" };
      } else {
        next[tipo] = { ...next[tipo], ...basePatch, body: urlBody, dirty: true, source: "url" };
      }
    } else {
      next[tipo] = {
        ...next[tipo],
        ...basePatch,
        ...body ? { body, dirty: bodyRepaired, source: "bd" } : {}
      };
    }
  }
  if (ignoreUrl && scope) {
    for (const tipo of scope) {
      if (!next[tipo] || touched.has(tipo)) continue;
      next[tipo] = { ...next[tipo], body: "", dirty: false, source: "bd" };
    }
  }
  return { next, unknownKeys };
}

// js/tools/promptsSql/promptActions.ts
async function discardAllPrompts({
  instruccionKeys,
  prompts,
  applyCloudRows,
  clearUrlBodies,
  setActionBusy,
  setLoadErr
}) {
  const toReset = instruccionKeys.filter((t) => hasPendingChanges(prompts[t]));
  if (!toReset.length) {
    toastInfo("No hay cambios locales que descartar");
    return;
  }
  setActionBusy(true);
  setLoadErr("");
  try {
    const { rows } = await fetchInstruccionesPaty();
    applyCloudRows(rows, { onlyTipos: toReset, ignoreUrl: true });
    clearUrlBodies(toReset);
    toastInfo(`${toReset.length} instrucci\xF3n(es) restaurada(s) desde la base`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    setLoadErr(msg);
    toastError(msg);
  } finally {
    setActionBusy(false);
  }
}
async function saveAllPrompts({
  pendingTipos,
  prompts,
  onNeedLogin,
  applyCloudRows,
  clearUrlBodies,
  setActionBusy,
  setLoadErr
}) {
  if (!pendingTipos.length) {
    toastWarning("No hay cambios pendientes para guardar");
    return;
  }
  if (!ensurePublishCap(onNeedLogin)) return;
  const author = auditAuthor();
  const entries = pendingTipos.map((t) => ({
    archivo: prompts[t].archivo,
    iinstruccion: t,
    tipo: t,
    body: prompts[t].body || "",
    source: prompts[t].source,
    jconfig: enrichJconfigForSave(prompts[t].jconfig, {
      body: prompts[t].body,
      author
    })
  }));
  const { sqlMssql, error } = analyzeFromEntries(entries);
  if (error || !sqlMssql?.trim()) {
    toastError(error || "No se pudo generar SQL");
    return;
  }
  setActionBusy(true);
  setLoadErr("");
  try {
    await publishInstruccionesPaty(sqlMssql);
    const savedTipos = [...pendingTipos];
    clearUrlBodies(savedTipos);
    const { rows } = await fetchInstruccionesPaty();
    applyCloudRows(rows, { onlyTipos: savedTipos, ignoreUrl: true });
    toastSuccess(`${savedTipos.length} instrucci\xF3n(es) guardada(s) en Paty`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    setLoadErr(msg);
    if (e?.code === "FORBIDDEN" || e?.code === "NO_SESSION") {
      handleApiError(e, INSTRUCCIONES_WRITE_CAP);
    } else if (/permiso|autoriz|403|503|verify-access/i.test(msg)) {
      toastWarning(humanPermissionError(e, INSTRUCCIONES_WRITE_CAP));
    } else {
      toastError(msg);
    }
  } finally {
    setActionBusy(false);
  }
}
async function saveOnePrompt({
  tipo,
  body,
  prompts,
  editBlockReason,
  onNeedLogin,
  applyCloudRows,
  clearUrlBodies,
  setActionBusy,
  setLoadErr
}) {
  const key = String(tipo ?? "").trim().toUpperCase();
  const text = preparePromptBodyForSave(body);
  if (!key) throw new Error("Instrucci\xF3n no v\xE1lida");
  if (!text) throw new Error("El contenido no puede estar vac\xEDo");
  if (key === "GENERAL" && !hasInstruccionTipoSlot(text)) {
    throw new Error("El prompt GENERAL debe incluir {{instruccion_tipo}} con ambas llaves de cierre.");
  }
  if (!ensurePublishCap(onNeedLogin)) {
    throw new Error(editBlockReason || "Sin permiso para guardar en Paty");
  }
  const author = auditAuthor();
  const slot = prompts[key];
  const jconfig = enrichJconfigForSave(slot?.jconfig, { body: text, author });
  setActionBusy(true);
  setLoadErr("");
  try {
    await upsertInstruccionPaty({
      iinstruccion: key,
      instruccion: text,
      jconfig,
      author
    });
    clearUrlBodies([key]);
    const { rows } = await fetchInstruccionesPaty();
    applyCloudRows(rows, { onlyTipos: [key], ignoreUrl: true });
    toastSuccess(`${key.replace(/_/g, " ")} guardada en Paty`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    setLoadErr(msg);
    if (e?.code === "FORBIDDEN" || e?.code === "NO_SESSION") {
      handleApiError(e, INSTRUCCIONES_WRITE_CAP);
    } else if (/permiso|autoriz|403|503|verify-access/i.test(msg)) {
      toastWarning(humanPermissionError(e, INSTRUCCIONES_WRITE_CAP));
    } else {
      toastError(msg);
    }
    throw e;
  } finally {
    setActionBusy(false);
  }
}
async function applyPromptFiles(fileList, setImportDlg) {
  const files = await readFilesAsText(fileList);
  if (!files.length) return;
  const rows = prepareFileImportRows(files).filter((r) => /^PROMPT_/i.test(r.fileName));
  if (!rows.length) {
    toastWarning("Ning\xFAn PROMPT_*.md / PROMPT_*.txt reconocido en los archivos");
    return;
  }
  setImportDlg({ open: true, rows });
}
function confirmPromptFileImport(importRows, instruccionKeys, setPrompts, setActiveTab, setImportDlg) {
  const updates = applyFileImportSelections(importRows);
  const keys = Object.keys(updates);
  if (!keys.length) {
    toastWarning("Selecciona al menos una instrucci\xF3n destino");
    return;
  }
  setPrompts((prev) => {
    const next = { ...prev };
    for (const [key, data] of Object.entries(updates)) {
      if (!next[key]) next[key] = createPromptSlot(key);
      next[key] = {
        ...next[key],
        ...data,
        jconfig: syncJconfigMetrics(next[key].jconfig, data.body)
      };
    }
    return next;
  });
  const first = keys[0];
  const idx = instruccionKeys.indexOf(first);
  if (idx >= 0) setActiveTab(idx);
  setImportDlg({ open: false, rows: [] });
  toastSuccess(`${keys.length} instrucci\xF3n(es) importada(s)`);
}
async function confirmResetPromptConfig(tipo, prompts, resetConfigToDefaults) {
  const jc = prompts[tipo]?.jconfig || parseJconfig(null);
  const d = DEFAULT_JCONFIG;
  const ok = await requestConfirm({
    title: "Restablecer configuraci\xF3n",
    message: [
      `\xBFRestablecer modelo, temperatura y top_p de ${tipo.replace(/_/g, " ")}?`,
      "",
      `Modelo: ${jc.model ?? d.model} \u2192 ${d.model}`,
      `Temp: ${jc.temperature ?? d.temperature} \u2192 ${d.temperature}`,
      `Top_p: ${jc.top_p ?? d.top_p} \u2192 ${d.top_p}`
    ].join("\n"),
    confirmLabel: "Restablecer",
    cancelLabel: "Cancelar"
  });
  if (ok) resetConfigToDefaults(tipo);
}
function resetPromptConfigToDefaults(tipo, setPrompts) {
  const defaults = { ...DEFAULT_JCONFIG };
  setPrompts((prev) => {
    const current = prev[tipo];
    if (!current) return prev;
    const nextJconfig = syncJconfigMetrics(
      { ...defaults, author: current.jconfig?.author, fmod: current.jconfig?.fmod },
      current.body
    );
    if (jconfigEqual(current.jconfig, nextJconfig)) return prev;
    const baseline = current.jconfigBaseline;
    return {
      ...prev,
      [tipo]: {
        ...current,
        jconfig: nextJconfig,
        configDirty: baseline ? !jconfigEqual(nextJconfig, baseline) : false
      }
    };
  });
}

// js/tools/promptsSql/usePromptsSqlTool.ts
var { useState: useState5, useEffect: useEffect5, useCallback: useCallback2, useMemo: useMemo4, useRef: useRef2 } = getReact();
var EMPTY_BODIES = Object.freeze({});
function usePromptsSqlTool({ bootPrompts = {}, onNeedLogin }) {
  const [authTick, setAuthTick] = useState5(0);
  const [instruccionesCanEdit, setInstruccionesCanEdit] = useState5(false);
  useEffect5(() => {
    const onAuth = () => setAuthTick((n) => n + 1);
    window.addEventListener("isa-patyia:auth", onAuth);
    window.addEventListener(Session.EVENT, onAuth);
    window.addEventListener("patyia-apptools:caps-changed", onAuth);
    if (Session.isLoggedIn()) {
      void bootMeCaps(true);
      Session.refreshProfile().finally(onAuth);
    }
    return () => {
      window.removeEventListener("isa-patyia:auth", onAuth);
      window.removeEventListener(Session.EVENT, onAuth);
      window.removeEventListener("patyia-apptools:caps-changed", onAuth);
    };
  }, []);
  const canPublish = useMemo4(
    () => instruccionesCanEdit || canEditInstrucciones() || canEditPromptsOperativos(),
    [authTick, instruccionesCanEdit]
  );
  const loggedIn = useMemo4(() => isLoggedIn(), [authTick]);
  const canEdit = canPublish;
  const editBlockReason = useMemo4(() => {
    if (canEdit) return "";
    if (!loggedIn) return "Inicia sesi\xF3n para editar instrucciones";
    return blockReason(INSTRUCCIONES_WRITE_CAP) || "Sin permiso para editar instrucciones";
  }, [authTick, canEdit, loggedIn]);
  const saveTitle = useMemo4(() => {
    if (canPublish) return "Guardar instrucciones y configuraci\xF3n en Paty (MSSQL)";
    return blockReason(INSTRUCCIONES_WRITE_CAP) || "Sin permiso para guardar en Paty";
  }, [authTick, canPublish]);
  const importTitle = useMemo4(() => {
    if (canPublish) return "Importar archivos PROMPT_*.md / .txt";
    if (!loggedIn) return "Inicia sesi\xF3n para importar instrucciones";
    return blockReason(INSTRUCCIONES_WRITE_CAP) || "Sin permiso para importar instrucciones";
  }, [authTick, canPublish, loggedIn]);
  const [extraInstructionKeys, setExtraInstructionKeys] = useState5([]);
  const instruccionKeys = useMemo4(
    () => allInstructionKeys(extraInstructionKeys),
    [extraInstructionKeys]
  );
  const [importDlg, setImportDlg] = useState5({ open: false, rows: [] });
  const urlBodies = bootPrompts.bodies ?? EMPTY_BODIES;
  const urlDraftTipos = useMemo4(() => urlDraftTipoSet(bootPrompts), [bootPrompts]);
  const [prompts, setPrompts] = useState5(() => buildInitialPromptState(bootPrompts, urlBodies));
  const [activeTab, setActiveTab] = useState5(
    Number.isInteger(bootPrompts.activeTab) ? bootPrompts.activeTab : 0
  );
  const [jconfigDlg, setJconfigDlg] = useState5({ open: false, tipo: null });
  const [dragOver, setDragOver] = useState5(false);
  const fileInputRef = useRef2(null);
  const [mapped, setMapped] = useState5([]);
  const [loadBusy, setLoadBusy] = useState5(true);
  const [loadErr, setLoadErr] = useState5("");
  const [actionBusy, setActionBusy] = useState5(false);
  const [envRev, setEnvRev] = useState5(0);
  const urlSyncRef = useRef2(null);
  const applyCloudRows = useCallback2((rows, options = {}) => {
    const unknownKeys = [];
    setPrompts((prev) => {
      const merged = mergeCloudRows(prev, rows, options, { urlBodies, urlDraftTipos });
      unknownKeys.push(...merged.unknownKeys);
      return merged.next;
    });
    if (unknownKeys.length) {
      setExtraInstructionKeys((prev) => {
        const merged = /* @__PURE__ */ new Set([...prev, ...unknownKeys]);
        return [...merged].sort((a, b) => a.localeCompare(b));
      });
    }
  }, [urlBodies, urlDraftTipos]);
  const clearUrlBodies = useCallback2((instruccionKeysToClear) => {
    const snap = getSnapshot();
    const bodies = { ...snap.prompts?.bodies || {} };
    const draftTipos = (snap.prompts?.draftTipos || []).map((t) => String(t).toUpperCase()).filter((t) => !instruccionKeysToClear.map((x) => String(x).toUpperCase()).includes(t));
    for (const t of instruccionKeysToClear) delete bodies[t];
    mergePartial({ prompts: { activeTab, bodies, draftTipos } });
  }, [activeTab]);
  useEffect5(() => {
    const onTarget = () => setEnvRev((n) => n + 1);
    window.addEventListener("jeff:gateway-target", onTarget);
    window.addEventListener("patyia-apptools:lab-target", onTarget);
    return () => {
      window.removeEventListener("jeff:gateway-target", onTarget);
      window.removeEventListener("patyia-apptools:lab-target", onTarget);
    };
  }, []);
  const activeTipo = instruccionKeys[activeTab] || instruccionKeys[0];
  const activePrompt = prompts[activeTipo];
  const recompute = useCallback2((state) => {
    const entries = Object.values(state).filter((p) => p.body?.trim() || isConfigDirty(p));
    const { mapped: m } = analyzeFromEntries(entries);
    setMapped(m);
  }, []);
  useEffect5(() => {
    recompute(prompts);
  }, [prompts, recompute]);
  const applyCloudRowsRef = useRef2(applyCloudRows);
  applyCloudRowsRef.current = applyCloudRows;
  useEffect5(() => {
    let cancelled = false;
    (async () => {
      setLoadBusy(true);
      setLoadErr("");
      try {
        const { rows, canEdit: canEdit2 } = await fetchInstruccionesPaty();
        if (cancelled) return;
        setInstruccionesCanEdit(!!canEdit2);
        applyCloudRowsRef.current(rows);
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : String(e);
          setLoadErr(msg);
          toastWarning(`Carga de instrucciones: ${msg}`);
        }
      } finally {
        if (!cancelled) setLoadBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [envRev]);
  const pendingTipos = useMemo4(
    () => instruccionKeys.filter((t) => {
      const p = prompts[t];
      if (!p?.body?.trim()) return false;
      return isDraftPrompt(p) || isConfigDirty(p);
    }),
    [prompts, instruccionKeys]
  );
  const hasLocalChanges = useMemo4(
    () => instruccionKeys.some((t) => hasPendingChanges(prompts[t])),
    [prompts, instruccionKeys]
  );
  const modelSelectOptions2 = useMemo4(
    () => mergeModelOptions(
      ...instruccionKeys.map((t) => prompts[t]?.jconfig?.model),
      ...instruccionKeys.map((t) => prompts[t]?.jconfigBaseline?.model)
    ),
    [prompts, instruccionKeys]
  );
  const filledCount = useMemo4(
    () => instruccionKeys.filter((k) => prompts[k]?.body?.trim()).length,
    [prompts, instruccionKeys]
  );
  useEffect5(() => {
    mergePartial({ prompts: { activeTab } });
  }, [activeTab]);
  useEffect5(() => {
    if (urlSyncRef.current) clearTimeout(urlSyncRef.current);
    urlSyncRef.current = setTimeout(() => {
      const bodies = draftBodiesFromPrompts(prompts);
      mergePartial({
        prompts: { activeTab, bodies, draftTipos: Object.keys(bodies) }
      });
    }, 500);
    return () => {
      if (urlSyncRef.current) clearTimeout(urlSyncRef.current);
    };
  }, [prompts, activeTab]);
  const discardAll = useCallback2(
    () => discardAllPrompts({
      instruccionKeys,
      prompts,
      applyCloudRows,
      clearUrlBodies,
      setActionBusy,
      setLoadErr
    }),
    [applyCloudRows, clearUrlBodies, prompts, instruccionKeys]
  );
  const saveAll = useCallback2(
    () => saveAllPrompts({
      pendingTipos,
      prompts,
      onNeedLogin,
      applyCloudRows,
      clearUrlBodies,
      setActionBusy,
      setLoadErr
    }),
    [applyCloudRows, clearUrlBodies, pendingTipos, onNeedLogin, prompts]
  );
  const saveOneInstruction = useCallback2(
    (tipo, body) => saveOnePrompt({
      tipo,
      body,
      prompts,
      editBlockReason,
      onNeedLogin,
      applyCloudRows,
      clearUrlBodies,
      setActionBusy,
      setLoadErr
    }),
    [applyCloudRows, clearUrlBodies, editBlockReason, onNeedLogin, prompts]
  );
  const onImportRowChange = useCallback2((idx, selected) => {
    setImportDlg((d) => {
      const rows = d.rows.map((row, i) => i === idx ? { ...row, selected } : row);
      return { ...d, rows };
    });
  }, []);
  const confirmFileImport = useCallback2(
    () => confirmPromptFileImport(importDlg.rows, instruccionKeys, setPrompts, setActiveTab, setImportDlg),
    [importDlg.rows, instruccionKeys]
  );
  const applyFiles = useCallback2(
    (fileList) => {
      if (!ensurePublishCap(onNeedLogin)) return Promise.resolve();
      return applyPromptFiles(fileList, setImportDlg);
    },
    [onNeedLogin]
  );
  const onDrop = useCallback2(async (e) => {
    e.preventDefault();
    setDragOver(false);
    const dt = e.dataTransfer;
    if (!dt?.files?.length) return;
    await applyFiles(dt.files);
  }, [applyFiles]);
  const onDragEnter = useCallback2((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);
  const onDragLeave = useCallback2((e) => {
    const zone = e.currentTarget;
    const next = e.relatedTarget;
    if (!next || !zone.contains(next)) setDragOver(false);
  }, []);
  const onDragOverZone = useCallback2((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);
  const onFileInput = useCallback2(async (e) => {
    if (e.target.files?.length) await applyFiles(e.target.files);
    e.target.value = "";
  }, [applyFiles]);
  const updateBody = useCallback2((tipo, body) => {
    setPrompts((prev) => ({
      ...prev,
      [tipo]: {
        ...prev[tipo],
        body,
        dirty: true,
        source: "editor",
        jconfig: syncJconfigMetrics(prev[tipo].jconfig, body)
      }
    }));
  }, []);
  const updateConfig = useCallback2((tipo, patch) => {
    setPrompts((prev) => ({
      ...prev,
      [tipo]: {
        ...prev[tipo],
        jconfig: { ...prev[tipo].jconfig, ...patch },
        configDirty: true
      }
    }));
  }, []);
  const resetConfigToDefaults = useCallback2(
    (tipo) => resetPromptConfigToDefaults(tipo, setPrompts),
    []
  );
  const confirmResetConfig = useCallback2(
    (tipo) => confirmResetPromptConfig(tipo, prompts, resetConfigToDefaults),
    [prompts, resetConfigToDefaults]
  );
  return {
    canPublish,
    loggedIn,
    canEdit,
    editBlockReason,
    saveTitle,
    importTitle,
    instruccionKeys,
    importDlg,
    setImportDlg,
    onImportRowChange,
    confirmFileImport,
    prompts,
    activeTab,
    setActiveTab,
    jconfigDlg,
    setJconfigDlg,
    dragOver,
    fileInputRef,
    onDragEnter,
    onDragLeave,
    onDragOverZone,
    onDrop,
    onFileInput,
    mapped,
    loadBusy,
    loadErr,
    actionBusy,
    activeTipo,
    activePrompt,
    pendingTipos,
    hasLocalChanges,
    modelSelectOptions: modelSelectOptions2,
    filledCount,
    discardAll,
    saveAll,
    saveOneInstruction,
    updateBody,
    updateConfig,
    confirmResetConfig
  };
}

// js/tools/promptsSql/PromptsSqlActionBar.jsx
import { jsx as jsx8, jsxs as jsxs6 } from "react/jsx-runtime";
var { Typography: Typography3, Stack: Stack3, Chip: Chip3, CircularProgress } = getMaterialUI();
function PromptsSqlActionBar({ filledCount, instruccionKeysLength, loadBusy, actionBusy, hasLocalChanges, pendingTiposLength, canPublish, saveTitle, importTitle, fileInputRef, onFileInput, onImportClick, onDiscardAll, onSaveAll }) {
  return /* @__PURE__ */ jsxs6("div", { className: "panel-head prompts-tool-head", children: [
    /* @__PURE__ */ jsx8(Typography3, { variant: "subtitle1", fontWeight: 600, children: "Instrucciones \xB7 mapeo" }),
    /* @__PURE__ */ jsxs6(Stack3, { direction: "row", spacing: 0.5, alignItems: "center", children: [
      loadBusy && /* @__PURE__ */ jsx8(CircularProgress, { size: 14 }),
      /* @__PURE__ */ jsx8(
        Chip3,
        {
          className: "panel-head-count-chip isa-neon-glass-chip",
          size: "small",
          label: `${filledCount}/${instruccionKeysLength}`,
          color: filledCount ? "primary" : "default",
          variant: "outlined"
        }
      ),
      /* @__PURE__ */ jsx8(
        ButtonIconify,
        {
          icon: "mdi:folder-open-outline",
          title: importTitle,
          onClick: onImportClick,
          disabled: actionBusy || loadBusy || !canPublish
        }
      ),
      /* @__PURE__ */ jsx8(
        "input",
        {
          ref: fileInputRef,
          type: "file",
          accept: ".md,.txt,text/markdown,text/plain",
          multiple: true,
          hidden: true,
          onChange: onFileInput
        }
      ),
      /* @__PURE__ */ jsx8(
        ButtonIconify,
        {
          icon: "mdi:delete-outline",
          title: "Descartar borradores y restaurar desde la base",
          onClick: onDiscardAll,
          disabled: actionBusy || loadBusy || !hasLocalChanges
        }
      ),
      /* @__PURE__ */ jsx8(
        ButtonIconify,
        {
          variant: "primary",
          icon: "mdi:content-save",
          title: actionBusy ? "Guardando\u2026" : saveTitle,
          onClick: onSaveAll,
          disabled: actionBusy || loadBusy || !pendingTiposLength || !canPublish,
          busy: actionBusy
        }
      )
    ] })
  ] });
}

// js/tools/promptsSql/constants.ts
var ICON_BY_TIPO = {
  SALUDO_OTRO: "mdi:hand-wave",
  FUERA_DE_ALCANCE_TECNICO: "mdi:alert-circle-outline",
  SOLICITUD_NO_PERMITIDA: "mdi:cancel",
  REQUIERE_CONTEXTO: "mdi:help-circle-outline",
  PASO_A_PASO: "mdi:format-list-numbered",
  INTERPRETACION_RESULTADO: "mdi:chart-box-outline",
  CONSULTA_NORMATIVA_NEGOCIO: "mdi:gavel",
  ASESORIA_PERSONALIZADA: "mdi:account-tie",
  ERROR_TECNICO: "mdi:bug-outline",
  ERROR_CONFIGURACION: "mdi:cog-outline",
  ERROR_ACCESO: "mdi:lock-alert-outline",
  ERROR_DIAN: "mdi:file-document-alert-outline",
  COMERCIAL: "mdi:cash-multiple",
  GENERAL: "mdi:robot-outline",
  TDCONSULTA: "mdi:tag-multiple-outline",
  EXTRACTOR_CONSULTAS: "mdi:filter-outline",
  CLASIFICADOR_MODULO: "mdi:view-module-outline"
};

// js/tools/promptsSql/PromptInstructionDot.jsx
import { jsx as jsx9 } from "react/jsx-runtime";
function PromptInstructionDot({ tipo, prompts, row, showWhenEmpty = "dot" }) {
  const p = prompts[tipo];
  const has = Boolean(p?.body?.trim());
  const dirty = hasPendingChanges(p) || row?.status === "tipo_desconocido";
  if (!has) {
    if (showWhenEmpty === "none") return null;
    return /* @__PURE__ */ jsx9(
      "span",
      {
        className: "tab-dot tab-dot--empty",
        title: "Sin contenido",
        "aria-hidden": true
      }
    );
  }
  let title = "Sincronizado";
  if (row?.status === "tipo_desconocido") title = "Tipo no catalogado";
  else if (hasPendingChanges(p)) title = "Cambios pendientes de guardar";
  return /* @__PURE__ */ jsx9(
    "span",
    {
      className: `tab-dot${dirty ? " tab-dot--dirty" : ""}`,
      title,
      "aria-hidden": true
    }
  );
}
function MapeoRowDot(props) {
  return /* @__PURE__ */ jsx9(PromptInstructionDot, { ...props, showWhenEmpty: "dot" });
}

// js/tools/promptsSql/PromptsSqlTree.jsx
import { jsx as jsx10, jsxs as jsxs7 } from "react/jsx-runtime";
var { Tabs: Tabs2, Tab: Tab2 } = getMaterialUI();
function PromptsSqlTree({ instruccionKeys, prompts, activeTab, onActiveTabChange, dragOver, onDragEnter, onDragLeave, onDragOverZone, onDrop, children }) {
  return /* @__PURE__ */ jsxs7(
    "div",
    {
      className: `prompt-tabs-layout${dragOver ? " prompt-tabs-layout--drop-active" : ""}`,
      onDragEnter,
      onDragLeave,
      onDragOver: onDragOverZone,
      onDrop,
      children: [
        dragOver && /* @__PURE__ */ jsxs7("div", { className: "prompt-drop-overlay", "aria-hidden": true, children: [
          /* @__PURE__ */ jsx10("iconify-icon", { icon: "mdi:file-upload-outline", width: "1.6em", height: "1.6em" }),
          /* @__PURE__ */ jsxs7("span", { children: [
            "Suelta ",
            /* @__PURE__ */ jsx10("code", { children: "PROMPT_*.md" }),
            " o ",
            /* @__PURE__ */ jsx10("code", { children: "PROMPT_*.txt" }),
            " aqu\xED"
          ] })
        ] }),
        /* @__PURE__ */ jsx10(
          Tabs2,
          {
            value: activeTab,
            onChange: (_, v) => onActiveTabChange(v),
            orientation: "vertical",
            variant: "scrollable",
            scrollButtons: "auto",
            className: "prompt-tabs prompt-tabs--vertical",
            sx: {
              flex: "0 0 12.5rem",
              width: "12.5rem",
              minWidth: "11rem",
              maxWidth: "14rem",
              flexShrink: 0,
              alignSelf: "stretch"
            },
            slotProps: {
              list: {
                sx: {
                  flexDirection: "column",
                  alignItems: "stretch"
                }
              },
              scrollButtons: {
                sx: { width: "100%", minHeight: 0, height: 20, maxHeight: 20, p: 0, px: 0, flex: "0 0 auto" }
              }
            },
            children: instruccionKeys.map((tipo) => /* @__PURE__ */ jsx10(
              Tab2,
              {
                label: /* @__PURE__ */ jsxs7("span", { className: "tab-label", children: [
                  /* @__PURE__ */ jsx10("iconify-icon", { icon: ICON_BY_TIPO[tipo] || "mdi:file-document-outline", width: "0.9em", height: "0.9em" }),
                  /* @__PURE__ */ jsx10("span", { children: tipo.replace(/_/g, " ") }),
                  /* @__PURE__ */ jsx10(PromptInstructionDot, { tipo, prompts, showWhenEmpty: "none" })
                ] })
              },
              tipo
            ))
          }
        ),
        children
      ]
    }
  );
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
import { Fragment as Fragment5, jsx as jsx11, jsxs as jsxs8 } from "react/jsx-runtime";
var { useState: useState6, useEffect: useEffect6, useLayoutEffect, useRef: useRef3, useCallback: useCallback3, useMemo: useMemo5 } = getReact();
var {
  Box: Box4,
  Stack: Stack4,
  Typography: Typography4,
  Dialog: Dialog2,
  DialogTitle: DialogTitle2,
  DialogContent: DialogContent3,
  DialogActions: DialogActions2,
  Button: Button2,
  TextField: TextField2,
  Alert: Alert3,
  Divider: Divider2,
  Chip: Chip4,
  Switch,
  FormControlLabel,
  CircularProgress: CircularProgress2
} = getMaterialUI();
var MAX_UNDO = 80;
function useEditorUndo(initial2) {
  const [value, setValue] = useState6(initial2);
  const [hist, setHist] = useState6({ past: 0, future: 0 });
  const pastRef = useRef3([]);
  const futureRef = useRef3([]);
  const skipSync = useRef3(false);
  const syncHist = useCallback3(() => {
    setHist({ past: pastRef.current.length, future: futureRef.current.length });
  }, []);
  useEffect6(() => {
    if (skipSync.current) {
      skipSync.current = false;
      return;
    }
    setValue(initial2);
    pastRef.current = [];
    futureRef.current = [];
    setHist({ past: 0, future: 0 });
  }, [initial2]);
  const commit = useCallback3((next) => {
    const v = String(next ?? "");
    setValue((prev) => {
      if (v === prev) return prev;
      pastRef.current = [...pastRef.current.slice(-MAX_UNDO + 1), prev];
      futureRef.current = [];
      return v;
    });
    syncHist();
  }, [syncHist]);
  const undo = useCallback3(() => {
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
  const redo = useCallback3(() => {
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
  const reset = useCallback3((next) => {
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
  const [draft, setDraft] = useState6(name || "");
  const [err, setErr] = useState6("");
  useEffect6(() => {
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
  return /* @__PURE__ */ jsxs8(Dialog2, { open, onClose, maxWidth: "xs", fullWidth: true, children: [
    /* @__PURE__ */ jsx11(DialogTitle2, { children: "Renombrar variable" }),
    /* @__PURE__ */ jsxs8(DialogContent3, { children: [
      /* @__PURE__ */ jsxs8(Typography4, { variant: "body2", color: "text.secondary", sx: { mb: 1.5 }, children: [
        "Se actualizar\xE1n todas las ocurrencias de ",
        /* @__PURE__ */ jsx11("code", { children: `{{${name}}}` }),
        " en el documento."
      ] }),
      err ? /* @__PURE__ */ jsx11(Alert3, { severity: "error", sx: { mb: 1 }, children: err }) : null,
      /* @__PURE__ */ jsx11(
        TextField2,
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
    /* @__PURE__ */ jsxs8(DialogActions2, { children: [
      /* @__PURE__ */ jsx11(Button2, { onClick: onClose, children: "Cancelar" }),
      /* @__PURE__ */ jsx11(Button2, { variant: "contained", onClick: submit, children: "Renombrar" })
    ] })
  ] });
}
function PromptEditorDialog({ open, onClose, title, body, canEdit, onSave, onDraft, tipo }) {
  const surfaceRef = useRef3(null);
  const plainTextRef = useRef3(null);
  const dialogContentRef = useRef3(null);
  const pendingScrollAnchorRef = useRef3(null);
  const syncLock = useRef3(false);
  const pendingSurfaceValue = useRef3(null);
  const surfaceOrigin = useRef3(false);
  const prevOpen = useRef3(false);
  const { value, commit, undo, redo, canUndo, canRedo, reset } = useEditorUndo(body);
  const [renameDlg, setRenameDlg] = useState6({ open: false, name: "" });
  const [saving, setSaving] = useState6(false);
  const [plainText, setPlainText] = useState6(false);
  const savedRangeRef = useRef3(null);
  const savedCaretRef = useRef3(null);
  const pushSuppressRef = useRef3(false);
  const variables = useMemo5(() => extractPromptVariables(value), [value]);
  const captureEditorSelection = useCallback3(() => {
    const el = surfaceRef.current;
    const sel = window.getSelection();
    if (!el || !sel?.rangeCount) return;
    const range = sel.getRangeAt(0);
    if (!el.contains(range.commonAncestorContainer)) return;
    savedRangeRef.current = range.cloneRange();
    savedCaretRef.current = saveSurfaceCaret(el);
  }, []);
  const restoreEditorRange = useCallback3(() => {
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
  const syncSurfaceFromValue = useCallback3((text, opts = {}) => {
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
  const readSurface = useCallback3(() => {
    const el = surfaceRef.current;
    if (!el) return value;
    return editorHtmlToBody(el);
  }, [value]);
  const restoreScrollAfterModeSwitch = useCallback3(() => {
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
  const attachSurfaceRef = useCallback3((node) => {
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
  const getEditorText = useCallback3(() => plainText ? value : readSurface(), [plainText, value, readSurface]);
  const togglePlainText = useCallback3((on) => {
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
  const pushChange = useCallback3(() => {
    if (syncLock.current || pushSuppressRef.current) return;
    const next = readSurface();
    surfaceOrigin.current = true;
    commit(next);
    if (surfaceHasRawVarTokens(surfaceRef.current)) {
      requestAnimationFrame(() => syncSurfaceFromValue(next, { preserveCaret: true }));
    }
  }, [readSurface, commit, syncSurfaceFromValue]);
  const handleUndo = useCallback3(() => {
    surfaceOrigin.current = false;
    pushSuppressRef.current = true;
    undo();
    requestAnimationFrame(() => {
      pushSuppressRef.current = false;
    });
  }, [undo]);
  const handleRedo = useCallback3(() => {
    surfaceOrigin.current = false;
    pushSuppressRef.current = true;
    redo();
    requestAnimationFrame(() => {
      pushSuppressRef.current = false;
    });
  }, [redo]);
  const keepToolbarFocus = useCallback3((e) => {
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
  return /* @__PURE__ */ jsxs8(
    Dialog2,
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
        /* @__PURE__ */ jsxs8(DialogTitle2, { sx: { display: "flex", alignItems: "center", gap: 1, py: 1.5, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ jsx11("iconify-icon", { icon: "mdi:pencil-outline", width: "1.25em", height: "1.25em" }),
          /* @__PURE__ */ jsx11(Box4, { component: "span", sx: { fontWeight: 600 }, children: title }),
          /* @__PURE__ */ jsx11(
            FormControlLabel,
            {
              control: /* @__PURE__ */ jsx11(
                Switch,
                {
                  size: "small",
                  checked: plainText,
                  onChange: (e) => togglePlainText(e.target.checked),
                  disabled: !canEdit
                }
              ),
              label: /* @__PURE__ */ jsx11(Typography4, { variant: "body2", color: "text.secondary", component: "span", children: "Texto plano" }),
              sx: { ml: 0.5, mr: 0 }
            }
          ),
          /* @__PURE__ */ jsx11(Box4, { sx: { flex: 1 } }),
          !plainText && /* @__PURE__ */ jsxs8(Stack4, { direction: "row", spacing: 0.5, alignItems: "center", flexWrap: "wrap", useFlexGap: true, children: [
            /* @__PURE__ */ jsx11(ButtonIconify, { icon: "mdi:undo", title: "Deshacer (Ctrl+Z)", onMouseDown: keepToolbarFocus, onClick: handleUndo, disabled: !canUndo }),
            /* @__PURE__ */ jsx11(ButtonIconify, { icon: "mdi:redo", title: "Rehacer (Ctrl+Y)", onMouseDown: keepToolbarFocus, onClick: handleRedo, disabled: !canRedo }),
            /* @__PURE__ */ jsx11(Divider2, { orientation: "vertical", flexItem: true, sx: { mx: 0.5 } }),
            /* @__PURE__ */ jsx11(ButtonIconify, { icon: "mdi:format-bold", title: "Negrita", onMouseDown: keepToolbarFocus, onClick: () => execFmt("bold"), disabled: !canEdit }),
            /* @__PURE__ */ jsx11(ButtonIconify, { icon: "mdi:format-italic", title: "Cursiva", onMouseDown: keepToolbarFocus, onClick: () => execFmt("italic"), disabled: !canEdit }),
            /* @__PURE__ */ jsx11(ButtonIconify, { icon: "mdi:format-header-1", title: "T\xEDtulo 1", onMouseDown: keepToolbarFocus, onClick: () => execFmt("formatBlock", "h1"), disabled: !canEdit }),
            /* @__PURE__ */ jsx11(ButtonIconify, { icon: "mdi:format-header-2", title: "T\xEDtulo 2", onMouseDown: keepToolbarFocus, onClick: () => execFmt("formatBlock", "h2"), disabled: !canEdit }),
            /* @__PURE__ */ jsx11(ButtonIconify, { icon: "mdi:format-list-bulleted", title: "Lista", onMouseDown: keepToolbarFocus, onClick: () => execFmt("insertUnorderedList"), disabled: !canEdit })
          ] }),
          plainText && /* @__PURE__ */ jsxs8(Stack4, { direction: "row", spacing: 0.5, alignItems: "center", children: [
            /* @__PURE__ */ jsx11(ButtonIconify, { icon: "mdi:undo", title: "Deshacer (Ctrl+Z)", onClick: handleUndo, disabled: !canUndo }),
            /* @__PURE__ */ jsx11(ButtonIconify, { icon: "mdi:redo", title: "Rehacer (Ctrl+Y)", onClick: handleRedo, disabled: !canRedo })
          ] })
        ] }),
        /* @__PURE__ */ jsxs8(DialogContent3, { ref: dialogContentRef, dividers: true, className: "prompt-md-dialog custom-scrollbar", children: [
          variables.length > 0 && /* @__PURE__ */ jsxs8(Stack4, { direction: "row", spacing: 0.5, flexWrap: "wrap", useFlexGap: true, sx: { mb: 1.5, width: "100%", justifyContent: "flex-start", px: "1.5rem", pt: 1.25 }, children: [
            /* @__PURE__ */ jsxs8(Typography4, { variant: "caption", color: "text.secondary", sx: { alignSelf: "center", mr: 0.5 }, children: [
              "Variables (escribe ",
              "{{nombre}}",
              " en el texto):"
            ] }),
            variables.map((v) => /* @__PURE__ */ jsx11(
              Chip4,
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
          plainText ? /* @__PURE__ */ jsx11(
            TextField2,
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
          ) : /* @__PURE__ */ jsx11(
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
        /* @__PURE__ */ jsxs8(DialogActions2, { sx: { px: 2, py: 1 }, children: [
          /* @__PURE__ */ jsx11(Button2, { onClick: handleDismiss, disabled: saving, sx: { color: "text.secondary" }, children: "Cerrar" }),
          /* @__PURE__ */ jsx11(Button2, { onClick: handleDiscard, disabled: saving, children: "Descartar" }),
          /* @__PURE__ */ jsx11(Button2, { variant: "contained", onClick: handleSave, disabled: !canEdit || saving, children: saving ? "Guardando\u2026" : "Guardar cambios" })
        ] }),
        /* @__PURE__ */ jsx11(
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
  const [editorOpen, setEditorOpen] = useState6(false);
  const previewRef = useRef3(null);
  const previewHtml = useMemo5(() => {
    if (Array.isArray(bodyLines) && bodyLines.length) return bodyPreviewHtmlFromLines(bodyLines);
    const text = String(body || "").trim();
    if (!text) return "";
    return bodyPreviewHtml(body);
  }, [body, bodyLines]);
  useEffect6(() => {
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
  return /* @__PURE__ */ jsxs8(Fragment5, { children: [
    /* @__PURE__ */ jsx11(
      Box4,
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
        children: loading ? /* @__PURE__ */ jsx11(Box4, { className: "prompt-body-preview__loading", "aria-hidden": true, children: /* @__PURE__ */ jsx11(CircularProgress2, { size: 28 }) }) : previewHtml ? /* @__PURE__ */ jsx11(
          "div",
          {
            ref: previewRef,
            className: "prompt-md-preview msg-body",
            dangerouslySetInnerHTML: { __html: previewHtml }
          }
        ) : /* @__PURE__ */ jsx11(Typography4, { variant: "body2", color: "text.secondary", className: "prompt-body-preview__empty", children: placeholder || "Sin contenido. Doble clic para editar\u2026" })
      }
    ),
    /* @__PURE__ */ jsx11(
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

// js/tools/promptsSql/PromptsSqlEditorPane.jsx
import { jsx as jsx12, jsxs as jsxs9 } from "react/jsx-runtime";
var {
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField: TextField3,
  Stack: Stack5,
  FormControl,
  Select,
  MenuItem
} = getMaterialUI();
function PromptsSqlBodyEditor({
  activeTipo,
  activePrompt,
  canEdit,
  editBlockReason,
  loadBusy,
  onBodyChange,
  onPersist,
  editorOpenSignal
}) {
  return /* @__PURE__ */ jsx12("div", { className: "tab-editor", children: /* @__PURE__ */ jsx12(
    PromptBodyEditor,
    {
      body: activePrompt?.body || "",
      canEdit,
      editBlockReason,
      onChange: onBodyChange,
      onPersist,
      placeholder: `Contenido de ${activePrompt?.archivo || `PROMPT_${activeTipo}.md`}\u2026`,
      tipo: activeTipo,
      title: activeTipo.replace(/_/g, " "),
      loading: loadBusy,
      editorOpenSignal
    }
  ) });
}
function PromptsSqlMapeoTable({
  activeTipo,
  instruccionKeys,
  prompts,
  mapped,
  canEdit,
  loggedIn,
  loadBusy,
  modelSelectOptions: modelSelectOptions2,
  onSelectTipo,
  onRowDoubleClick,
  onUpdateConfig,
  onOpenJconfig,
  onConfirmResetConfig
}) {
  return /* @__PURE__ */ jsx12("div", { className: "prompt-mapeo-block", children: /* @__PURE__ */ jsx12(TableContainer, { className: "prompt-mapeo-scroll custom-scrollbar", children: /* @__PURE__ */ jsxs9(Table, { size: "small", stickyHeader: true, children: [
    /* @__PURE__ */ jsx12(TableHead, { children: /* @__PURE__ */ jsxs9(TableRow, { children: [
      /* @__PURE__ */ jsx12(TableCell, { children: "Instrucci\xF3n" }),
      /* @__PURE__ */ jsx12(TableCell, { children: "Chars | Tokens" }),
      /* @__PURE__ */ jsx12(TableCell, { children: "Modelo" }),
      /* @__PURE__ */ jsx12(TableCell, { children: "temperature" }),
      /* @__PURE__ */ jsx12(TableCell, { children: "top_p" }),
      /* @__PURE__ */ jsx12(TableCell, { align: "center", children: "Actions" })
    ] }) }),
    /* @__PURE__ */ jsx12(TableBody, { children: instruccionKeys.map((tipo) => {
      const p = prompts[tipo];
      const jc = p?.jconfig || parseJconfig(null);
      const modelValue = String(jc.model ?? "").trim() || DEFAULT_JCONFIG.model;
      const row = mapped.find((r) => r.tipo === tipo) || {
        tipo,
        archivo: `PROMPT_${tipo}.md`,
        chars: (p?.body || "").length,
        status: p?.body?.trim() ? "ok" : "sin_mapeo"
      };
      const stopRowEvent = (e) => e.stopPropagation();
      const atDefaultConfig = jconfigEqual(jc, DEFAULT_JCONFIG);
      return /* @__PURE__ */ jsxs9(
        TableRow,
        {
          hover: true,
          selected: tipo === activeTipo,
          onClick: () => onSelectTipo(tipo),
          onDoubleClick: () => {
            if (!canEdit || loadBusy) return;
            onSelectTipo(tipo);
            onRowDoubleClick?.(tipo);
          },
          sx: { cursor: "pointer" },
          title: canEdit && !loadBusy ? "Doble clic para editar" : void 0,
          children: [
            /* @__PURE__ */ jsx12(TableCell, { children: /* @__PURE__ */ jsxs9("span", { className: "prompt-mapeo-tipo", children: [
              /* @__PURE__ */ jsx12(MapeoRowDot, { tipo, prompts, row }),
              /* @__PURE__ */ jsx12("code", { children: tipo })
            ] }) }),
            /* @__PURE__ */ jsx12(TableCell, { className: "prompt-mapeo-metric", children: formatCharsTokens(p?.body) }),
            /* @__PURE__ */ jsx12(TableCell, { onClick: stopRowEvent, onDoubleClick: stopRowEvent, children: /* @__PURE__ */ jsx12(FormControl, { size: "small", sx: { minWidth: 148 }, onClick: stopRowEvent, disabled: !canEdit, children: /* @__PURE__ */ jsx12(
              Select,
              {
                value: modelValue,
                onChange: (e) => onUpdateConfig(tipo, { model: e.target.value }),
                disabled: !canEdit,
                MenuProps: { disableScrollLock: true },
                sx: { fontSize: "0.72rem", "& .MuiSelect-select": { py: 0.35, px: 0.6 } },
                children: modelSelectOptions2.map((id) => /* @__PURE__ */ jsx12(MenuItem, { value: id, sx: { fontSize: "0.72rem" }, children: id }, id))
              }
            ) }) }),
            /* @__PURE__ */ jsx12(TableCell, { onClick: stopRowEvent, onDoubleClick: stopRowEvent, children: /* @__PURE__ */ jsx12(
              TextField3,
              {
                ...unitIntervalFieldProps(
                  jc.temperature,
                  DEFAULT_JCONFIG.temperature,
                  (v) => onUpdateConfig(tipo, { temperature: v })
                ),
                disabled: !canEdit
              }
            ) }),
            /* @__PURE__ */ jsx12(TableCell, { onClick: stopRowEvent, onDoubleClick: stopRowEvent, children: /* @__PURE__ */ jsx12(
              TextField3,
              {
                ...unitIntervalFieldProps(
                  jc.top_p,
                  DEFAULT_JCONFIG.top_p,
                  (v) => onUpdateConfig(tipo, { top_p: v })
                ),
                disabled: !canEdit
              }
            ) }),
            /* @__PURE__ */ jsx12(TableCell, { align: "center", className: "prompt-mapeo-actions", onClick: stopRowEvent, onDoubleClick: stopRowEvent, children: /* @__PURE__ */ jsxs9(Stack5, { direction: "row", spacing: 0.25, justifyContent: "center", useFlexGap: true, children: [
              /* @__PURE__ */ jsx12(
                ButtonIconify,
                {
                  icon: "mdi:code-json",
                  title: "Ver JCONFIG (author, fmod, chars, tokens\u2026)",
                  onClick: () => onOpenJconfig(tipo)
                }
              ),
              loggedIn && /* @__PURE__ */ jsx12(
                ButtonIconify,
                {
                  icon: "mdi:backup-restore",
                  title: `Restablecer modelo (${DEFAULT_JCONFIG.model}), temp (${DEFAULT_JCONFIG.temperature}) y top_p (${DEFAULT_JCONFIG.top_p})`,
                  onClick: () => onConfirmResetConfig(tipo),
                  disabled: !canEdit || atDefaultConfig
                }
              )
            ] }) })
          ]
        },
        tipo
      );
    }) })
  ] }) }) });
}

// js/tools/promptsSql/FileImportMapDialog.jsx
import { jsx as jsx13, jsxs as jsxs10 } from "react/jsx-runtime";
var {
  Dialog: Dialog3,
  DialogTitle: DialogTitle3,
  DialogContent: DialogContent4,
  DialogActions: DialogActions3,
  Button: Button3,
  Typography: Typography5,
  Stack: Stack6,
  Alert: Alert4,
  Chip: Chip5,
  FormControl: FormControl2,
  Select: Select2,
  MenuItem: MenuItem2
} = getMaterialUI();
function FileImportMapDialog({ open, onClose, rows, instructionKeys, onChangeRow, onConfirm }) {
  return /* @__PURE__ */ jsxs10(Dialog3, { open, onClose, maxWidth: "md", fullWidth: true, scroll: "paper", children: [
    /* @__PURE__ */ jsxs10(DialogTitle3, { sx: { display: "flex", alignItems: "center", gap: 1, py: 1.5 }, children: [
      /* @__PURE__ */ jsx13("iconify-icon", { icon: "mdi:file-link-outline", width: "1.25em", height: "1.25em" }),
      "Confirmar importaci\xF3n"
    ] }),
    /* @__PURE__ */ jsxs10(DialogContent4, { dividers: true, className: "custom-scrollbar", children: [
      /* @__PURE__ */ jsxs10(Typography5, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: [
        "Relaciona cada archivo con la instrucci\xF3n destino. La coincidencia autom\xE1tica usa el nombre",
        " ",
        "(",
        /* @__PURE__ */ jsx13("code", { children: "PROMPT_*.md" }),
        " / ",
        /* @__PURE__ */ jsx13("code", { children: ".txt" }),
        ") o una l\xEDnea exacta",
        " ",
        /* @__PURE__ */ jsx13("code", { children: "iinstruccion: CLAVE" }),
        " en el contenido."
      ] }),
      rows.map((row, idx) => {
        const ambiguous = row.nameMatches.length > 1 || row.contentMatches.length > 1 || row.nameMatches.length === 1 && row.contentMatches.length === 1 && row.nameMatches[0] !== row.contentMatches[0];
        return /* @__PURE__ */ jsxs10(
          Stack6,
          {
            spacing: 1,
            sx: { mb: 2, pb: 2, borderBottom: "1px solid", borderColor: "divider" },
            children: [
              /* @__PURE__ */ jsx13(Typography5, { variant: "subtitle2", component: "div", children: /* @__PURE__ */ jsx13("code", { children: row.fileName }) }),
              row.suggested && !ambiguous && /* @__PURE__ */ jsx13(
                Chip5,
                {
                  size: "small",
                  variant: "outlined",
                  color: "primary",
                  label: `Sugerido: ${row.suggested}${row.matchSource ? ` (${row.matchSource})` : ""}`
                }
              ),
              ambiguous && /* @__PURE__ */ jsx13(Alert4, { severity: "warning", sx: { py: 0.5 }, children: "Coincidencias m\xFAltiples o contradictorias \u2014 elige la instrucci\xF3n manualmente." }),
              !row.suggested && !ambiguous && /* @__PURE__ */ jsx13(Alert4, { severity: "info", sx: { py: 0.5 }, children: "Sin coincidencia exacta \u2014 selecciona la instrucci\xF3n destino." }),
              /* @__PURE__ */ jsx13(FormControl2, { size: "small", fullWidth: true, children: /* @__PURE__ */ jsxs10(
                Select2,
                {
                  value: row.selected || "",
                  displayEmpty: true,
                  onChange: (e) => onChangeRow(idx, e.target.value),
                  MenuProps: { disableScrollLock: true },
                  children: [
                    /* @__PURE__ */ jsx13(MenuItem2, { value: "", children: /* @__PURE__ */ jsx13("em", { children: "No importar este archivo" }) }),
                    instructionKeys.map((k) => {
                      const meta = getInstructionMeta(k);
                      return /* @__PURE__ */ jsxs10(MenuItem2, { value: k, children: [
                        k,
                        " \xB7 ",
                        meta.ninstruccion
                      ] }, k);
                    })
                  ]
                }
              ) })
            ]
          },
          row.fileName
        );
      })
    ] }),
    /* @__PURE__ */ jsxs10(DialogActions3, { sx: { px: 2, py: 1.5 }, children: [
      /* @__PURE__ */ jsx13(Button3, { onClick: onClose, children: "Cancelar" }),
      /* @__PURE__ */ jsx13(Button3, { variant: "contained", onClick: onConfirm, children: "Importar selecci\xF3n" })
    ] })
  ] });
}

// js/tools/promptsSql/JconfigDetailDialog.jsx
import { jsx as jsx14, jsxs as jsxs11 } from "react/jsx-runtime";
var { useMemo: useMemo6 } = getReact();
var { Dialog: Dialog4, DialogTitle: DialogTitle4, DialogContent: DialogContent5, Typography: Typography6, Box: Box5 } = getMaterialUI();
function JconfigDetailDialog({ open, onClose, tipo, jc, body }) {
  const view = useMemo6(() => jconfigView(jc, body), [jc, body]);
  const json = useMemo6(() => JSON.stringify(view, null, 2), [view]);
  return /* @__PURE__ */ jsxs11(Dialog4, { open, onClose, maxWidth: "sm", fullWidth: true, scroll: "paper", children: [
    /* @__PURE__ */ jsxs11(DialogTitle4, { sx: { display: "flex", alignItems: "center", gap: 1, py: 1.5 }, children: [
      /* @__PURE__ */ jsx14("iconify-icon", { icon: "mdi:code-json", width: "1.25em", height: "1.25em" }),
      /* @__PURE__ */ jsxs11(Box5, { component: "span", sx: { fontWeight: 600 }, children: [
        "JCONFIG \xB7 ",
        tipo
      ] }),
      /* @__PURE__ */ jsx14(Box5, { sx: { flex: 1 } }),
      /* @__PURE__ */ jsx14(ButtonIconify, { icon: "mdi:close", title: "Cerrar", onClick: onClose })
    ] }),
    /* @__PURE__ */ jsxs11(DialogContent5, { dividers: true, className: "custom-scrollbar", children: [
      /* @__PURE__ */ jsxs11("div", { className: "meta-grid", children: [
        /* @__PURE__ */ jsxs11("div", { className: "meta-row", children: [
          /* @__PURE__ */ jsx14("span", { className: "meta-k", children: "Author" }),
          /* @__PURE__ */ jsx14("span", { className: "meta-v", children: view.author || "\u2014" })
        ] }),
        /* @__PURE__ */ jsxs11("div", { className: "meta-row", children: [
          /* @__PURE__ */ jsx14("span", { className: "meta-k", children: "Fmod" }),
          /* @__PURE__ */ jsx14("span", { className: "meta-v", children: formatFmod(view.fmod) })
        ] }),
        /* @__PURE__ */ jsxs11("div", { className: "meta-row", children: [
          /* @__PURE__ */ jsx14("span", { className: "meta-k", children: "Chars" }),
          /* @__PURE__ */ jsx14("span", { className: "meta-v", children: view.chars ?? "\u2014" })
        ] }),
        /* @__PURE__ */ jsxs11("div", { className: "meta-row", children: [
          /* @__PURE__ */ jsx14("span", { className: "meta-k", children: "Tokens" }),
          /* @__PURE__ */ jsx14("span", { className: "meta-v", children: view.tokens ?? "\u2014" })
        ] }),
        /* @__PURE__ */ jsxs11("div", { className: "meta-row", children: [
          /* @__PURE__ */ jsx14("span", { className: "meta-k", children: "Modelo" }),
          /* @__PURE__ */ jsx14("span", { className: "meta-v", children: /* @__PURE__ */ jsx14("code", { children: view.model }) })
        ] }),
        /* @__PURE__ */ jsxs11("div", { className: "meta-row", children: [
          /* @__PURE__ */ jsx14("span", { className: "meta-k", children: "temperature" }),
          /* @__PURE__ */ jsx14("span", { className: "meta-v", children: view.temperature })
        ] }),
        /* @__PURE__ */ jsxs11("div", { className: "meta-row", children: [
          /* @__PURE__ */ jsx14("span", { className: "meta-k", children: "top_p" }),
          /* @__PURE__ */ jsx14("span", { className: "meta-v", children: view.top_p })
        ] }),
        /* @__PURE__ */ jsxs11("div", { className: "meta-row", children: [
          /* @__PURE__ */ jsx14("span", { className: "meta-k", children: "Provider" }),
          /* @__PURE__ */ jsx14("span", { className: "meta-v", children: /* @__PURE__ */ jsx14("code", { children: view.provider }) })
        ] })
      ] }),
      /* @__PURE__ */ jsx14(Typography6, { variant: "caption", color: "text.secondary", sx: { display: "block", mt: 2, mb: 0.5 }, children: "JSON persistido en BD" }),
      /* @__PURE__ */ jsx14(
        CodeMirrorPanel,
        {
          value: json,
          readOnly: true,
          json: true,
          minHeight: "10rem",
          maxHeight: "16rem",
          copyTitle: "Copiar JCONFIG"
        },
        open ? `jconfig-${tipo}` : "jconfig-closed"
      )
    ] })
  ] });
}

// js/tools/PromptsSqlTool.jsx
import { jsx as jsx15, jsxs as jsxs12 } from "react/jsx-runtime";
var { Paper, Alert: Alert5 } = getMaterialUI();
var { useState: useState7, useCallback: useCallback4 } = getReact();
function PromptsSqlTool({ bootPrompts = {}, onNeedLogin }) {
  const tool = usePromptsSqlTool({ bootPrompts, onNeedLogin });
  const [editorOpenSignal, setEditorOpenSignal] = useState7(0);
  const handleMapeoRowDoubleClick = useCallback4(() => {
    if (tool.canEdit && !tool.loadBusy) {
      setEditorOpenSignal((n) => n + 1);
    }
  }, [tool.canEdit, tool.loadBusy]);
  return /* @__PURE__ */ jsxs12("div", { className: "tool-grid tool-grid-prompts tool-grid-prompts--solo isa-tool-surface", children: [
    /* @__PURE__ */ jsxs12(Paper, { className: "tool-panel scroll-panel config-tool-panel prompts-tool-panel", elevation: 0, children: [
      /* @__PURE__ */ jsx15(
        PromptsSqlActionBar,
        {
          filledCount: tool.filledCount,
          instruccionKeysLength: tool.instruccionKeys.length,
          loadBusy: tool.loadBusy,
          actionBusy: tool.actionBusy,
          hasLocalChanges: tool.hasLocalChanges,
          pendingTiposLength: tool.pendingTipos.length,
          canPublish: tool.canPublish,
          saveTitle: tool.saveTitle,
          importTitle: tool.importTitle,
          fileInputRef: tool.fileInputRef,
          onFileInput: tool.onFileInput,
          onImportClick: () => tool.fileInputRef.current?.click(),
          onDiscardAll: tool.discardAll,
          onSaveAll: tool.saveAll
        }
      ),
      /* @__PURE__ */ jsxs12("div", { className: "panel-body panel-body-tabs custom-scrollbar", children: [
        tool.loadErr && /* @__PURE__ */ jsx15(Alert5, { severity: "warning", sx: { mb: 1 }, children: tool.loadErr }),
        /* @__PURE__ */ jsx15("div", { className: "prompt-instrucciones-zone", children: /* @__PURE__ */ jsx15(
          PromptsSqlTree,
          {
            instruccionKeys: tool.instruccionKeys,
            prompts: tool.prompts,
            activeTab: tool.activeTab,
            onActiveTabChange: tool.setActiveTab,
            dragOver: tool.dragOver,
            onDragEnter: tool.onDragEnter,
            onDragLeave: tool.onDragLeave,
            onDragOverZone: tool.onDragOverZone,
            onDrop: tool.onDrop,
            children: /* @__PURE__ */ jsx15(
              PromptsSqlBodyEditor,
              {
                activeTipo: tool.activeTipo,
                activePrompt: tool.activePrompt,
                canEdit: tool.canEdit,
                editBlockReason: tool.editBlockReason,
                loadBusy: tool.loadBusy,
                editorOpenSignal,
                onBodyChange: (body) => tool.updateBody(tool.activeTipo, body),
                onPersist: (body) => tool.saveOneInstruction(tool.activeTipo, body)
              }
            )
          }
        ) }),
        /* @__PURE__ */ jsx15(
          PromptsSqlMapeoTable,
          {
            activeTipo: tool.activeTipo,
            instruccionKeys: tool.instruccionKeys,
            prompts: tool.prompts,
            mapped: tool.mapped,
            canEdit: tool.canEdit,
            loggedIn: tool.loggedIn,
            loadBusy: tool.loadBusy,
            modelSelectOptions: tool.modelSelectOptions,
            onSelectTipo: (tipo) => tool.setActiveTab(tool.instruccionKeys.indexOf(tipo)),
            onRowDoubleClick: handleMapeoRowDoubleClick,
            onUpdateConfig: tool.updateConfig,
            onOpenJconfig: (tipo) => tool.setJconfigDlg({ open: true, tipo }),
            onConfirmResetConfig: tool.confirmResetConfig
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx15(
      FileImportMapDialog,
      {
        open: tool.importDlg.open,
        onClose: () => tool.setImportDlg({ open: false, rows: [] }),
        rows: tool.importDlg.rows,
        instructionKeys: tool.instruccionKeys,
        onChangeRow: tool.onImportRowChange,
        onConfirm: tool.confirmFileImport
      }
    ),
    /* @__PURE__ */ jsx15(
      JconfigDetailDialog,
      {
        open: tool.jconfigDlg.open,
        onClose: () => tool.setJconfigDlg({ open: false, tipo: null }),
        tipo: tool.jconfigDlg.tipo,
        jc: tool.jconfigDlg.tipo ? tool.prompts[tool.jconfigDlg.tipo]?.jconfig : null,
        body: tool.jconfigDlg.tipo ? tool.prompts[tool.jconfigDlg.tipo]?.body : ""
      }
    )
  ] });
}

// js/tools/chat/constants.ts
var CHAT_SIDEBAR_W = 320;
var MAX_CHAT_IMAGES = 10;
var MAX_CHAT_AUDIOS = 5;
var TERCEROS_AUDIT_PAGE_SIZE = 15;
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
var { useEffect: useEffect7, useLayoutEffect: useLayoutEffect2, useCallback: useCallback5, useRef: useRef4, useMemo: useMemo7 } = getReact();
var THREAD_SCROLL_NEAR_BOTTOM = 72;
function useThreadScrollAnchor(scrollRef, mensajes, { sending = false } = {}) {
  const snapshotRef = useRef4(null);
  const mensajesKey = useMemo7(
    () => (mensajes || []).map((m) => m.idMsg === "stream-live" ? `${m.idMsg}:${String(m.contenido || "").length}` : m.idMsg).join("|"),
    [mensajes]
  );
  const captureSnapshot = useCallback5(() => {
    const el = scrollRef.current;
    if (!el) return;
    snapshotRef.current = {
      scrollHeight: el.scrollHeight,
      scrollTop: el.scrollTop,
      clientHeight: el.clientHeight
    };
  }, [scrollRef]);
  const applyScrollAnchor = useCallback5(() => {
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
  const onThreadScroll = useCallback5(() => {
    captureSnapshot();
  }, [captureSnapshot]);
  useLayoutEffect2(() => {
    applyScrollAnchor();
  }, [mensajesKey, sending, applyScrollAnchor]);
  useEffect7(() => {
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
function auditScopeKey(scope) {
  if (!scope) return "";
  return `${scope.itercero}|${scope.icontacto}`;
}
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
function resolveOwnerNickname(jwt, sessionUser) {
  const acting = String(jwt?.actingAsUsername ?? "").trim().toUpperCase();
  if (acting) return acting;
  const saved = String(jwt?.savedBy ?? "").trim().toUpperCase();
  if (saved) return saved;
  return String(sessionUser ?? "").trim().toUpperCase();
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
function formatAuditTs(v) {
  if (!v) return "\u2014";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v).slice(0, 16) : d.toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
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
var BACKEND_IMAGE_MIMES = /* @__PURE__ */ new Set(["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"]);
function isBackendSupportedImageDataUrl(dataUrl) {
  const m = String(dataUrl || "").match(/^data:([^;]+);base64,/i);
  const mime = (m?.[1] || "").toLowerCase();
  return BACKEND_IMAGE_MIMES.has(mime);
}
function normalizeImageDataUrl(dataUrl, file) {
  const raw = String(dataUrl || "").trim();
  if (!raw.startsWith("data:")) return raw;
  const mimeMatch = raw.match(/^data:([^;]+);base64,/i);
  const mime = (mimeMatch?.[1] || "").toLowerCase();
  if (mime.startsWith("image/") && mime !== "image/heic" && mime !== "image/heif") return raw;
  const fallbackMime = mimeFromFileName(file.name || "") || (file.type?.startsWith("image/") ? file.type : "image/jpeg");
  const i = raw.indexOf("base64,");
  if (i < 0) return raw;
  return `data:${fallbackMime};base64,${raw.slice(i + 7)}`;
}
function isHeicLikeFile(file) {
  const name = (file.name || "").toLowerCase();
  const mime = (file.type || "").toLowerCase();
  return mime === "image/heic" || mime === "image/heif" || /\.heic$/i.test(name) || /\.heif$/i.test(name);
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
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ""));
    r.onerror = () => reject(new Error("No se pudo leer la imagen"));
    r.readAsDataURL(file);
  });
}
async function filesToImageEntries(files) {
  const added = [];
  for (const file of files || []) {
    if (!isChatImageFile(file)) continue;
    if (isHeicLikeFile(file)) continue;
    const dataUrl = normalizeImageDataUrl(await fileToDataUrl(file), file);
    if (!isBackendSupportedImageDataUrl(dataUrl)) continue;
    added.push({ name: file.name || "imagen", dataUrl });
  }
  return added;
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
function isBackendSupportedAudioDataUrl(dataUrl) {
  const m = String(dataUrl || "").match(/^data:([^;]+);base64,/i);
  const mime = (m?.[1] || "").toLowerCase();
  return BACKEND_AUDIO_MIMES.has(mime);
}
function isChatAudioFile(file) {
  if (!file) return false;
  if (file.type?.startsWith("audio/")) return true;
  return AUDIO_EXT_RE.test(file.name || "");
}
function fileToDataUrl2(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ""));
    r.onerror = () => reject(new Error("No se pudo leer el audio"));
    r.readAsDataURL(file);
  });
}
function normalizeAudioDataUrl(dataUrl, file) {
  const raw = String(dataUrl || "").trim();
  if (!raw.startsWith("data:")) return raw;
  if (isBackendSupportedAudioDataUrl(raw)) return raw;
  const fallbackMime = mimeFromFileName2(file.name || "") || (file.type?.startsWith("audio/") ? file.type : "audio/webm");
  const i = raw.indexOf("base64,");
  if (i < 0) return raw;
  return `data:${fallbackMime};base64,${raw.slice(i + 7)}`;
}
async function filesToAudioEntries(files) {
  const added = [];
  for (const file of files || []) {
    if (!isChatAudioFile(file)) continue;
    const dataUrl = normalizeAudioDataUrl(await fileToDataUrl2(file), file);
    if (!isBackendSupportedAudioDataUrl(dataUrl)) continue;
    added.push({ name: file.name || "audio", dataUrl });
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
          const dataUrl = await fileToDataUrl2(blob);
          resolve({
            name: `nota-voz-${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}.webm`,
            dataUrl
          });
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
var { useState: useState8, useEffect: useEffect8, useCallback: useCallback6, useRef: useRef5, useMemo: useMemo8 } = getReact();
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
  const [jwt, setJwt] = useState8(() => loadPatyJwt());
  const [jwtOpen, setJwtOpen] = useState8(false);
  const [jwtLoading, setJwtLoading] = useState8(false);
  const [authTick, setAuthTick] = useState8(0);
  const [rows, setRows] = useState8([]);
  const [selectedId, setSelectedId] = useState8(() => readBootConvId(bootChat));
  const [detail, setDetail] = useState8(null);
  const [loadingList, setLoadingList] = useState8(false);
  const [sending, setSending] = useState8(false);
  const [draft, setDraft] = useState8("");
  const [images, setImages] = useState8([]);
  const [audios, setAudios] = useState8([]);
  const [isRecording, setIsRecording] = useState8(false);
  const [streamText, setStreamText] = useState8("");
  const [logMensajes, setLogMensajes] = useState8([]);
  const [ratingMsgId, setRatingMsgId] = useState8(null);
  const [loadingThread, setLoadingThread] = useState8(false);
  const [logError, setLogError] = useState8("");
  const [metaOpen, setMetaOpen] = useState8(false);
  const [metaMsg, setMetaMsg] = useState8(null);
  const [payloadPreviewOpen, setPayloadPreviewOpen] = useState8(false);
  const [auditDialogOpen, setAuditDialogOpen] = useState8(false);
  const [auditScope, setAuditScope] = useState8(null);
  const [sessionBrowseScope, setSessionBrowseScope] = useState8(null);
  const [sessionScopeLoading, setSessionScopeLoading] = useState8(false);
  const [convListPage, setConvListPage] = useState8(1);
  const [convListPageSize, setConvListPageSize] = useState8(() => readConvListPageSize());
  const [convListSearch, setConvListSearch] = useState8("");
  const [convListMeta, setConvListMeta] = useState8(null);
  const [messageSource, setMessageSource] = useState8(() => readChatMessageSource(bootChat));
  const [chatMode, setChatMode] = useState8(() => readChatMode(bootChat));
  const inputRef = useRef5(null);
  const attachInputRef = useRef5(null);
  const voiceRecorderRef = useRef5(createVoiceRecorder());
  const threadScrollRef = useRef5(null);
  const lastLogApiCountRef = useRef5(0);
  const skipThreadReloadRef = useRef5(null);
  const lastOpenedConvRef = useRef5(null);
  const openConvRef = useRef5(async () => {
  });
  const pendingListConvRef = useRef5(null);
  const loggedIn = Session.isLoggedIn();
  const sessionUser = Session.username();
  const impersonating = isFaithfulImpersonation();
  const canAdminJwt = canAdminPortalJwt();
  const canAuditChat = useMemo8(
    () => canAccessOthers() || Session.can("patyia.chat.audit"),
    [authTick]
  );
  const canInteract = canInteractPatyChat(sessionUser, jwt);
  const listScope = auditScope ?? activeConvOwnerScope(null, jwt?.claims) ?? sessionBrowseScope;
  const selectedConvRow = selectedId ? rows.find((r) => convIdsEqual(r.iconversacion, selectedId)) : null;
  const selectedConvOwned = convBelongsToJwtResolved(
    detail,
    selectedConvRow,
    activeConvOwnerScope(listScope, jwt?.claims),
    jwt?.claims,
    impersonating
  );
  const canSend = canInteract && auditScopeIsOwnJwt(auditScope, jwt?.claims) && selectedConvOwned;
  const viewingAuditOther = Boolean(
    auditScope && (jwt?.claims ? !auditScopeIsOwnJwt(auditScope, jwt.claims) : sessionBrowseScope && browseScopeKey(auditScope) !== browseScopeKey(sessionBrowseScope)) || impersonating && Boolean(selectedId) && !selectedConvOwned
  );
  const viewOnly = loggedIn && !canSend;
  const needsJwt = loggedIn && !jwt?.token && !jwtLoading;
  const displayScope = activeConvOwnerScope(listScope, jwt?.claims);
  useEffect8(() => {
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
  const prevSessionUserRef = useRef5(null);
  useEffect8(() => {
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
  useEffect8(() => {
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
  useEffect8(() => {
    if (!loggedIn || !sessionUser) {
      setSessionBrowseScope(null);
      setSessionScopeLoading(false);
      return void 0;
    }
    if (jwt?.token && !impersonating) {
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
  }, [loggedIn, sessionUser, jwt?.token, impersonating]);
  const reloadList = useCallback6(async () => {
    if (!loggedIn || jwtLoading || sessionScopeLoading) return;
    setLoadingList(true);
    try {
      const page = convListPage;
      const limit = convListPageSize;
      const search = convListSearch.trim() || void 0;
      const listSort = CONVERSACIONES_LIST_SORT_DEFAULT;
      const auditOther = Boolean(
        auditScope?.itercero && auditScope?.icontacto && !auditScopeIsOwnJwt(auditScope, jwt?.claims)
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
  }, [loggedIn, jwtLoading, sessionScopeLoading, jwt?.token, jwt?.claims, auditScope?.itercero, auditScope?.icontacto, convListPage, convListPageSize, convListSearch]);
  const handleConvListSearchChange = useCallback6((text) => {
    setConvListSearch((prev) => {
      if (prev === text) return prev;
      setConvListPage(1);
      return text;
    });
  }, []);
  const handleSelectAuditScope = useCallback6((row) => {
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
  const applyThreadFromDetail = useCallback6((d, log, name, { openAiDirect = false, stripMeta = false } = {}) => {
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
  const patchThreadAfterSend = useCallback6(async (id, { minLogMensajes = 0, ownerLabel } = {}) => {
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
  const openConv = useCallback6(async (id, { silent = false, keepStream = false, freshLog = false, minLogMensajes = 0, sourceOverride } = {}) => {
    if (!loggedIn || !id) return;
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
    try {
      if (prodMode) {
        const d = await getConversacion(jwt, id);
        setDetail(d);
        applyThreadFromDetail(d, null, ownerLabel, { openAiDirect: true, stripMeta: true });
        return;
      }
      if (logsApiMode) {
        const { d, log, openAiDirect } = await fetchLogsModeDetail(jwt, id, { freshLog, minMensajes });
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
  }, [loggedIn, jwt, sessionUser, viewingAuditOther, listScope, rows, messageSource, applyThreadFromDetail]);
  openConvRef.current = openConv;
  const onMessageSourceChange = useCallback6((next) => {
    if (next === messageSource) return;
    persistChatMessageSource(next);
    setMessageSource(next);
    if (selectedId) {
      void openConv(selectedId, { silent: false, sourceOverride: next });
    }
  }, [messageSource, selectedId, openConv]);
  const onChatModeChange = useCallback6(async (next) => {
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
  const onConvListPageSizeChange = useCallback6((next) => {
    const size = parseConvListPageSize(next);
    if (size === convListPageSize) return;
    persistConvListPageSize(size);
    setConvListPageSize(size);
    setConvListPage(1);
  }, [convListPageSize]);
  useEffect8(() => subscribe((snap) => {
    const chat = snap.chat;
    const urlId = Number(chat?.convId) || null;
    setSelectedId((prev) => prev === urlId ? prev : urlId);
    const urlSource = messageSourceFromUrl(chat);
    if (urlSource) setMessageSource((prev) => prev === urlSource ? prev : urlSource);
    const urlMode = chatModeFromUrl(chat);
    if (urlMode !== null) setChatMode((prev) => prev === urlMode ? prev : urlMode);
  }), []);
  useEffect8(() => {
    if (jwtLoading) return;
    reloadList();
  }, [reloadList, authTick, jwtLoading]);
  useEffect8(() => {
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
  useEffect8(() => {
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
  async function onSend() {
    if (!canSend || !jwt) return;
    const text = draft.trim();
    if (!text && !images.length && !audios.length) return;
    if (selectedId && !convBelongsToJwtResolved(
      detail,
      rows.find((r) => convIdsEqual(r.iconversacion, selectedId)),
      displayScope,
      jwt.claims,
      impersonating
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
      userName
    ));
    try {
      const result = await sendConversacionStream(
        jwt,
        { prompt: text, iconversacion: selectedId || void 0, imagenes, audios: audioUrls, mode: chatMode },
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
        void reloadList();
        void patchThreadAfterSend(newId, {
          minLogMensajes: logCountBefore + 2,
          ownerLabel: userName
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
  const onMeta = useCallback6((msg) => {
    setMetaMsg(msg);
    setMetaOpen(true);
  }, []);
  const onRateMessage = useCallback6(async (msg, butil) => {
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
  const chatUserDisplayName = useMemo8(
    () => resolveOwnerDisplayName(jwt, displayScope),
    [displayScope, jwt]
  );
  const chatUserNick = useMemo8(
    () => resolveOwnerNickname(jwt, sessionUser),
    [jwt, sessionUser]
  );
  const displayMensajes = useMemo8(
    () => appendStreamMsg(logMensajes, streamText, sending),
    [logMensajes, sending, streamText]
  );
  const showThread = Boolean(
    sending || selectedId && (loadingThread || detail || logMensajes.length > 0)
  );
  const onThreadScroll = useThreadScrollAnchor(threadScrollRef, displayMensajes, { sending });
  const postBodyPreview = useMemo8(
    () => buildConversacionPostBody({
      prompt: draft,
      iconversacion: selectedId || void 0,
      imagenes: images.map((i) => i.dataUrl),
      audios: audios.map((a) => a.dataUrl),
      mode: chatMode
    }),
    [draft, selectedId, images, audios, chatMode]
  );
  const clearAuditFilter = useCallback6(() => {
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
  const convListOwnerLabel = useMemo8(
    () => resolveConvListOwnerLabel(listScope, jwt, sessionUser),
    [listScope, jwt, sessionUser]
  );
  const convListHeader = useMemo8(
    () => resolveConvListHeader(listScope, jwt, sessionUser),
    [listScope, jwt, sessionUser]
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
    convListPageSize,
    convListMeta,
    convListSearch,
    messageSource,
    chatMode,
    chatUserDisplayName,
    chatUserNick,
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
    handleConvListSearchChange,
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
    onChatModeChange,
    onConvListPageSizeChange,
    setDraft,
    setImages,
    setAudios
  };
}

// js/tools/chat/ChatLoggedOutShell.jsx
import { jsx as jsx16, jsxs as jsxs13 } from "react/jsx-runtime";
var {
  Box: Box6,
  Typography: Typography7,
  Button: Button4,
  Stack: Stack7,
  Divider: Divider3,
  Alert: Alert6
} = getMaterialUI();
var { Icon } = UI;
function ChatLoggedOutShell({ onNeedLogin }) {
  return /* @__PURE__ */ jsxs13(
    Box6,
    {
      className: "conv-log-shell paty-chat-shell paty-chat-shell--logged-out",
      sx: { display: "flex", height: "100%", minHeight: 0, flexDirection: { xs: "column", md: "row" } },
      children: [
        /* @__PURE__ */ jsxs13(
          Box6,
          {
            className: "conv-log-sidebar paty-chat-sidebar",
            sx: {
              width: { xs: "100%", md: CHAT_SIDEBAR_W },
              flexShrink: 0,
              borderBottom: { xs: 1, md: 0 },
              borderColor: "divider",
              bgcolor: "background.paper",
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              maxHeight: { xs: "42vh", md: "none" },
              opacity: 0.55,
              pointerEvents: "none"
            },
            "aria-hidden": "true",
            children: [
              /* @__PURE__ */ jsx16(Stack7, { direction: "row", spacing: 1, alignItems: "center", className: "conv-log-sidebar-block", sx: { py: 1, borderBottom: 1, borderColor: "divider" }, children: /* @__PURE__ */ jsx16(Icon, { icon: "mdi:chat-outline", size: 20 }) }),
              /* @__PURE__ */ jsx16(Box6, { className: "conv-log-sidebar-block paty-chat-sidebar-meta", sx: { pt: 0.75, pb: 0.75 }, children: /* @__PURE__ */ jsxs13(Box6, { className: "paty-chat-session paty-chat-session--skeleton", children: [
                /* @__PURE__ */ jsx16(Box6, { className: "paty-chat-session__avatar", children: /* @__PURE__ */ jsx16(Icon, { icon: "mdi:account-outline", size: 20 }) }),
                /* @__PURE__ */ jsxs13(Box6, { className: "paty-chat-session__body", children: [
                  /* @__PURE__ */ jsx16("span", { className: "paty-chat-skeleton-line paty-chat-skeleton-line--md" }),
                  /* @__PURE__ */ jsx16("span", { className: "paty-chat-skeleton-line paty-chat-skeleton-line--sm" })
                ] })
              ] }) }),
              /* @__PURE__ */ jsx16(Box6, { className: "conv-log-sidebar-block", sx: { pt: 1 }, children: /* @__PURE__ */ jsx16(Button4, { fullWidth: true, variant: "contained", size: "small", disabled: true, startIcon: /* @__PURE__ */ jsx16(Icon, { icon: "mdi:plus", size: 16 }), children: "Nueva conversaci\xF3n" }) }),
              /* @__PURE__ */ jsx16(Divider3, { sx: { my: 1 } }),
              /* @__PURE__ */ jsxs13(Box6, { className: "conv-log-sidebar-block", sx: { flex: 1, pb: 1.5 }, children: [
                /* @__PURE__ */ jsx16(Typography7, { variant: "caption", color: "text.secondary", sx: { mb: 1, display: "block" }, children: "Conversaciones" }),
                [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxs13(Box6, { className: "paty-chat-skeleton-conv", children: [
                  /* @__PURE__ */ jsx16("span", { className: "paty-chat-skeleton-line paty-chat-skeleton-line--xs" }),
                  /* @__PURE__ */ jsx16("span", { className: "paty-chat-skeleton-line paty-chat-skeleton-line--lg" })
                ] }, i))
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxs13(Box6, { sx: { flex: 1, minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column", position: "relative" }, children: [
          /* @__PURE__ */ jsx16(Box6, { sx: convLogSurfaceSx({ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0, opacity: 0.45, pointerEvents: "none" }), "aria-hidden": "true", children: /* @__PURE__ */ jsx16(Box6, { sx: { textAlign: "center", maxWidth: 420, p: 2, borderRadius: 2, border: 1, borderColor: "divider", borderStyle: "dashed" }, children: /* @__PURE__ */ jsx16(Typography7, { variant: "body2", color: "text.secondary", children: "\xC1rea de conversaci\xF3n" }) }) }),
          /* @__PURE__ */ jsx16(Box6, { className: "paty-chat-gate paty-chat-gate--overlay", children: /* @__PURE__ */ jsxs13(
            Box6,
            {
              className: "paty-chat-gate__inner isa-glass-card",
              sx: { p: { xs: 2.5, sm: 3 }, display: "flex", flexDirection: "column", gap: 2, alignItems: "stretch", boxSizing: "border-box", maxWidth: 520, width: "100%" },
              children: [
                /* @__PURE__ */ jsxs13(Stack7, { direction: "row", spacing: 1, alignItems: "center", justifyContent: "center", children: [
                  /* @__PURE__ */ jsx16(Icon, { icon: "mdi:login", width: "1.35em", height: "1.35em", style: { opacity: 0.85, flexShrink: 0 } }),
                  /* @__PURE__ */ jsx16(Typography7, { variant: "h6", sx: { fontWeight: 700 }, children: "Chat" })
                ] }),
                /* @__PURE__ */ jsx16(Alert6, { severity: "info", sx: { textAlign: "left", py: 0.75, px: 1.25 }, children: "Inicia sesi\xF3n para ver conversaciones." }),
                /* @__PURE__ */ jsx16(Button4, { variant: "contained", sx: { alignSelf: "center", px: 3, py: 1.15, minHeight: 44 }, onClick: () => onNeedLogin?.(), children: "Iniciar sesi\xF3n" })
              ]
            }
          ) })
        ] })
      ]
    }
  );
}

// js/tools/chat/ChatSessionPanel.jsx
import { jsx as jsx17, jsxs as jsxs14 } from "react/jsx-runtime";
var { useState: useState9, useEffect: useEffect9, useMemo: useMemo9 } = getReact();
var { Box: Box7, Typography: Typography8, CircularProgress: CircularProgress3, Chip: Chip6 } = getMaterialUI();
var { Icon: Icon2 } = UI;
var SESSION_MODE_CHIP_SX = {
  live: {
    pl: 0.35,
    color: "#86efac",
    bgcolor: "rgba(34, 197, 94, 0.12)",
    border: "1px solid rgba(74, 222, 128, 0.35)",
    "& .MuiChip-icon": { color: "#4ade80 !important", ml: 0.55 },
    "& .MuiChip-label": { fontWeight: 700, letterSpacing: "0.03em", pl: 0.55 }
  },
  readonly: {
    pl: 0.35,
    color: "#fde68a",
    bgcolor: "rgba(251, 191, 36, 0.1)",
    border: "1px solid rgba(251, 191, 36, 0.35)",
    "& .MuiChip-icon": { color: "#facc15 !important", ml: 0.55 },
    "& .MuiChip-label": { fontWeight: 700, letterSpacing: "0.03em", pl: 0.55 }
  },
  loading: {
    pl: 0.35,
    color: "#94a3b8",
    bgcolor: "rgba(148, 163, 184, 0.1)",
    border: "1px solid rgba(148, 163, 184, 0.28)",
    "& .MuiChip-icon": { ml: 0.55 },
    "& .MuiChip-label": { pl: 0.55 }
  }
};
function SessionModeChip({ canSend, jwtLoading }) {
  if (canSend) {
    return /* @__PURE__ */ jsx17(
      Chip6,
      {
        size: "small",
        variant: "outlined",
        label: "Interactivo",
        icon: /* @__PURE__ */ jsx17(Icon2, { icon: "mdi:chat-processing-outline", size: 14, "aria-hidden": true }),
        className: "paty-chat-session__badge paty-chat-session__badge--live",
        sx: SESSION_MODE_CHIP_SX.live
      }
    );
  }
  if (jwtLoading) {
    return /* @__PURE__ */ jsx17(
      Chip6,
      {
        size: "small",
        variant: "outlined",
        label: "Token\u2026",
        icon: /* @__PURE__ */ jsx17(CircularProgress3, { size: 10, color: "inherit" }),
        className: "paty-chat-session__badge paty-chat-session__badge--loading",
        sx: SESSION_MODE_CHIP_SX.loading
      }
    );
  }
  return /* @__PURE__ */ jsx17(
    Chip6,
    {
      size: "small",
      variant: "outlined",
      label: "Solo lectura",
      icon: /* @__PURE__ */ jsx17(Icon2, { icon: "mdi:eye-outline", size: 14, "aria-hidden": true }),
      className: "paty-chat-session__badge paty-chat-session__badge--readonly",
      sx: SESSION_MODE_CHIP_SX.readonly
    }
  );
}
function ChatSessionPanel({ claims, displayScope, sessionUser: _sessionUser, ownerDisplayName, canSend, jwtLoading, onOpenAudit }) {
  const tercero = claims?.itercero ?? displayScope?.itercero;
  const contacto = claims?.icontacto ?? displayScope?.icontacto;
  const codes = [tercero, contacto].filter(Boolean).join(" \xB7 ");
  const scopeName = String(displayScope?.nombre ?? "").trim();
  const claimsName = jwtUserDisplayName(claims) || jwtUserShortName(claims);
  const primaryLabel = String(ownerDisplayName ?? "").trim() || scopeName || claimsName || codes || "ISA PatyIA";
  const avatarUrl = useMemo9(() => buildUserAvatarUrl(primaryLabel, 72), [primaryLabel]);
  const [avatarOk, setAvatarOk] = useState9(true);
  useEffect9(() => {
    setAvatarOk(true);
  }, [avatarUrl]);
  return /* @__PURE__ */ jsxs14(
    Box7,
    {
      className: "paty-chat-session paty-chat-session--clickable",
      role: "button",
      tabIndex: 0,
      sx: { cursor: "pointer" },
      title: "Filtrar conversaciones por usuario",
      "aria-label": "Filtrar conversaciones por usuario",
      onClick: () => onOpenAudit?.(),
      onKeyDown: (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenAudit?.();
        }
      },
      children: [
        /* @__PURE__ */ jsx17(
          Box7,
          {
            className: "paty-chat-session__action",
            "aria-hidden": true,
            sx: {
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 1,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none"
            },
            children: /* @__PURE__ */ jsx17(Icon2, { icon: "mdi:account-filter-outline", size: 17 })
          }
        ),
        /* @__PURE__ */ jsx17(Box7, { className: "paty-chat-session__avatar", "aria-hidden": true, children: avatarOk ? /* @__PURE__ */ jsx17(
          "img",
          {
            className: "paty-chat-session__avatar-img",
            src: avatarUrl,
            alt: "",
            width: 36,
            height: 36,
            loading: "lazy",
            decoding: "async",
            onError: () => setAvatarOk(false)
          }
        ) : /* @__PURE__ */ jsx17(Icon2, { icon: "mdi:account-circle", size: 28 }) }),
        /* @__PURE__ */ jsxs14(Box7, { className: "paty-chat-session__body", children: [
          /* @__PURE__ */ jsx17(Typography8, { className: "paty-chat-session__name", title: primaryLabel, children: primaryLabel }),
          /* @__PURE__ */ jsx17(Box7, { className: "paty-chat-session__flags", sx: { flexWrap: "wrap", gap: 0.5 }, children: /* @__PURE__ */ jsx17(SessionModeChip, { canSend, jwtLoading }) })
        ] })
      ]
    }
  );
}

// js/tools/chat/ConvSearchAutocomplete.jsx
import { Fragment as Fragment6, jsx as jsx18, jsxs as jsxs15 } from "react/jsx-runtime";
import { createElement as createElement2 } from "react";
var { useState: useState10, useEffect: useEffect10, useRef: useRef6, useCallback: useCallback7, useMemo: useMemo10 } = getReact();
var { Autocomplete, TextField: TextField4, Typography: Typography9, Box: Box8, IconButton: IconButton2, InputAdornment } = getMaterialUI();
var { Icon: Icon3 } = UI;
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
  const [inputValue, setInputValue] = useState10(search ?? "");
  const debounceRef = useRef6(null);
  useEffect10(() => {
    setInputValue(search ?? "");
  }, [search]);
  const selected = useMemo10(() => {
    if (!selectedId) return null;
    return rows.find((r) => Number(r.iconversacion) === Number(selectedId)) ?? null;
  }, [rows, selectedId]);
  const scheduleSearch = useCallback7((text) => {
    const filter = convSearchFilter(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSearchChange?.(filter), DEBOUNCE_MS);
  }, [onSearchChange]);
  const applySearchNow = useCallback7((text) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const filter = convSearchFilter(text);
    onSearchChange?.(filter);
    return filter;
  }, [onSearchChange]);
  const clearSearch = useCallback7(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setInputValue("");
    onSearchChange?.("");
  }, [onSearchChange]);
  useEffect10(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);
  const showClear = Boolean(inputValue?.trim());
  const [menuOpen, setMenuOpen] = useState10(false);
  const fusedOpen = menuOpen ? " paty-chat-conv-search--open" : "";
  return /* @__PURE__ */ jsx18(
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
      renderOption: (props, row) => /* @__PURE__ */ createElement2(
        Box8,
        {
          component: "li",
          ...props,
          key: row.iconversacion,
          className: "paty-chat-conv-search__option",
          sx: { display: "flex", alignItems: "center", justifyContent: "flex-start", py: 0.75 }
        },
        /* @__PURE__ */ jsxs15(Typography9, { variant: "body2", className: "paty-chat-conv-search__option-label", sx: { fontWeight: 600 }, noWrap: true, children: [
          /* @__PURE__ */ jsx18(Box8, { component: "span", className: "paty-chat-conv-search__option-id", children: row.iconversacion }),
          /* @__PURE__ */ jsx18(Box8, { component: "span", className: "paty-chat-conv-search__option-title", children: String(row.titulo ?? "").trim() || "Sin t\xEDtulo" })
        ] })
      ),
      renderInput: (params) => {
        const inputSlot = params.slotProps?.input ?? {};
        return /* @__PURE__ */ jsx18(
          TextField4,
          {
            ...params,
            placeholder,
            slotProps: {
              ...params.slotProps,
              input: {
                ...inputSlot,
                endAdornment: /* @__PURE__ */ jsxs15(Fragment6, { children: [
                  showClear ? /* @__PURE__ */ jsx18(InputAdornment, { position: "end", children: /* @__PURE__ */ jsx18(IconButton2, { size: "small", "aria-label": "Limpiar b\xFAsqueda", className: "paty-chat-conv-search__clear", onMouseDown: (e) => e.preventDefault(), onClick: clearSearch, children: /* @__PURE__ */ jsx18(Icon3, { icon: "mdi:close", size: 16 }) }) }) : null,
                  inputSlot.endAdornment
                ] })
              }
            }
          }
        );
      }
    }
  );
}

// js/tools/chat/ChatThreadSidebar.jsx
import { Fragment as Fragment7, jsx as jsx19, jsxs as jsxs16 } from "react/jsx-runtime";
var {
  Box: Box9,
  Typography: Typography10,
  Button: Button5,
  IconButton: IconButton3,
  List: List2,
  ListItemButton: ListItemButton2,
  ListItemText: ListItemText2,
  CircularProgress: CircularProgress4,
  Tooltip: Tooltip2,
  Stack: Stack8,
  Divider: Divider4,
  Chip: Chip7,
  Select: Select3,
  MenuItem: MenuItem3,
  FormControl: FormControl3
} = getMaterialUI();
var { Icon: Icon4 } = UI;
function MessageSourceSwitch({ messageSource, onChange }) {
  const isProd = messageSource === "prod";
  const title = isProd ? "Modo producci\xF3n (sin meta)" : "Modo logs (con meta)";
  const hint = isProd ? "Clic para ver logs" : "Clic para ver producci\xF3n";
  const icon = isProd ? "mdi:earth" : "mdi:code-json";
  return /* @__PURE__ */ jsx19(Tooltip2, { title: `${title} \xB7 ${hint}`, children: /* @__PURE__ */ jsx19(IconButton3, { color: "inherit", size: "small", onClick: () => onChange?.(isProd ? "logs" : "prod"), "aria-label": title, "aria-pressed": !isProd, children: /* @__PURE__ */ jsx19(Icon4, { icon, size: 18 }) }) });
}
function ChatModeSwitch({ mode, onChange }) {
  const isLibre = isLibreChatMode(mode);
  const title = isLibre ? "Libre" : "Patyia";
  const icon = isLibre ? "game-icons:freedom-dove" : "game-icons:bird-cage";
  return /* @__PURE__ */ jsx19(Tooltip2, { title, children: /* @__PURE__ */ jsx19(
    IconButton3,
    {
      color: "inherit",
      size: "small",
      className: `paty-chat-mode-btn${isLibre ? " paty-chat-mode-btn--libre" : ""}`,
      onClick: () => onChange?.(isLibre ? CHAT_MODE_PATYIA : CHAT_MODE_LIBRE),
      "aria-label": title,
      "aria-pressed": isLibre,
      children: /* @__PURE__ */ jsx19(Icon4, { icon, size: 18 })
    }
  ) });
}
function ChatSidebarHeaderActions({
  onClose,
  messageSource = "logs",
  mode = CHAT_MODE_PATYIA,
  onMessageSourceChange,
  onChatModeChange
}) {
  return /* @__PURE__ */ jsxs16(
    Stack8,
    {
      direction: "row",
      spacing: 0.35,
      alignItems: "center",
      className: "paty-chat-sidebar-head-actions",
      onClick: (e) => e.stopPropagation(),
      onKeyDown: (e) => e.stopPropagation(),
      children: [
        onClose ? /* @__PURE__ */ jsx19(Tooltip2, { title: "Cerrar panel", children: /* @__PURE__ */ jsx19(IconButton3, { size: "small", onClick: onClose, "aria-label": "Cerrar panel", children: /* @__PURE__ */ jsx19(Icon4, { icon: "mdi:close", size: 18 }) }) }) : null,
        onMessageSourceChange ? /* @__PURE__ */ jsx19(MessageSourceSwitch, { messageSource, onChange: onMessageSourceChange }) : null,
        onChatModeChange ? /* @__PURE__ */ jsx19(ChatModeSwitch, { mode, onChange: onChatModeChange }) : null
      ]
    }
  );
}
function ChatNewConversationButton({ canSend, onNewChat, onClose, compact = false }) {
  const handleClick = () => {
    onNewChat?.();
    onClose?.();
  };
  return /* @__PURE__ */ jsx19(Tooltip2, { title: "Nueva conversaci\xF3n", children: /* @__PURE__ */ jsx19("span", { children: compact ? /* @__PURE__ */ jsx19(IconButton3, { size: "small", color: "primary", disabled: !canSend, onClick: handleClick, "aria-label": "Nueva conversaci\xF3n", children: /* @__PURE__ */ jsx19(Icon4, { icon: "mdi:plus", size: 20 }) }) : /* @__PURE__ */ jsx19(Button5, { variant: "contained", size: "small", disabled: !canSend, startIcon: /* @__PURE__ */ jsx19(Icon4, { icon: "mdi:plus", size: 16 }), onClick: handleClick, children: "Nueva" }) }) });
}
function ChatSidebarBody({
  jwt,
  displayScope,
  sessionUser,
  canSend,
  jwtLoading,
  needsJwt,
  listScope,
  sessionScopeLoading,
  viewingAuditOther,
  convListOwnerLabel,
  convListHeader,
  showJwtBadge,
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
  return /* @__PURE__ */ jsxs16(Fragment7, { children: [
    /* @__PURE__ */ jsx19(Box9, { className: "conv-log-sidebar-block paty-chat-sidebar-meta", sx: { pt: 0.75, pb: 0.75, flexShrink: 0 }, children: /* @__PURE__ */ jsx19(
      ChatSessionPanel,
      {
        claims: jwt?.claims ?? null,
        displayScope,
        sessionUser,
        ownerDisplayName: resolveOwnerDisplayName(jwt, displayScope),
        canSend,
        jwtLoading,
        onOpenAudit
      }
    ) }),
    /* @__PURE__ */ jsx19(Divider4, { sx: { my: 1 } }),
    /* @__PURE__ */ jsxs16(Box9, { className: "conv-log-sidebar-block paty-chat-sidebar-list-head", sx: { flexShrink: 0, pb: 0.5 }, children: [
      /* @__PURE__ */ jsxs16(Typography10, { variant: "caption", color: "text.secondary", sx: { display: "block", fontWeight: 600, mb: 0.5 }, children: [
        "Conversaciones",
        (jwt?.token || listScope) && (convListHeader || convListOwnerLabel) ? /* @__PURE__ */ jsxs16(
          Stack8,
          {
            direction: "row",
            spacing: 0.5,
            alignItems: "center",
            useFlexGap: true,
            flexWrap: "wrap",
            sx: { mt: 0.25 },
            children: [
              /* @__PURE__ */ jsx19(Typography10, { variant: "caption", sx: { fontWeight: 500, color: "text.primary" }, children: convListHeader || convListOwnerLabel }),
              showJwtBadge ? /* @__PURE__ */ jsx19(
                Chip7,
                {
                  size: "small",
                  label: "JWT",
                  sx: {
                    height: 18,
                    fontSize: "0.62rem",
                    fontWeight: 700,
                    bgcolor: "rgba(124,58,237,0.14)",
                    color: "#6d28d9",
                    border: "1px solid rgba(124,58,237,0.35)",
                    "& .MuiChip-label": { px: 0.6, py: 0 }
                  }
                }
              ) : null
            ]
          }
        ) : null,
        needsJwt ? /* @__PURE__ */ jsx19(Typography10, { component: "span", variant: "caption", sx: { display: "block", color: "info.main", mt: 0.25 }, children: listScope?.nombre ? `${listScope.nombre} \xB7 modo lectura` : sessionScopeLoading ? "Buscando tus conversaciones\u2026" : "Sin contacto identificado \xB7 filtra por usuario" }) : null
      ] }),
      /* @__PURE__ */ jsx19(
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
    /* @__PURE__ */ jsxs16(
      Box9,
      {
        className: "conv-log-sidebar-block paty-chat-sidebar-list-scroll",
        sx: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" },
        children: [
          /* @__PURE__ */ jsx19(Box9, { className: "paty-chat-sidebar-list-inner", sx: { flex: 1, minHeight: 0, overflow: "auto" }, children: /* @__PURE__ */ jsxs16(List2, { dense: true, disablePadding: true, children: [
            loadingList && !rows.length && /* @__PURE__ */ jsx19(Box9, { sx: { py: 2, textAlign: "center" }, children: /* @__PURE__ */ jsx19(CircularProgress4, { size: 22 }) }),
            rows.map((r) => {
              const convTitle = r.titulo || "Sin t\xEDtulo";
              const convTip = `${r.iconversacion} \xB7 ${convTitle}`;
              return /* @__PURE__ */ jsxs16(
                ListItemButton2,
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
                    /* @__PURE__ */ jsx19(
                      ListItemText2,
                      {
                        sx: { flex: 1, minWidth: 0, m: 0 },
                        primary: /* @__PURE__ */ jsxs16(Stack8, { direction: "row", spacing: 0.5, alignItems: "center", className: "paty-chat-conv-item__title", sx: { minWidth: 0, pointerEvents: "none" }, children: [
                          /* @__PURE__ */ jsx19("span", { className: "paty-chat-conv-id-badge", children: r.iconversacion }),
                          /* @__PURE__ */ jsx19(Typography10, { component: "span", variant: "body2", noWrap: true, sx: { fontWeight: 600, minWidth: 0, flex: 1 }, children: convTitle })
                        ] }),
                        secondary: /* @__PURE__ */ jsx19(
                          Typography10,
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
                    canSend && convBelongsToJwt(r, jwt.claims) ? /* @__PURE__ */ jsx19(IconButton3, { size: "small", color: "error", "aria-label": "Eliminar", className: "paty-chat-conv-item__delete", onClick: (e) => {
                      e.stopPropagation();
                      onDelete(r.iconversacion);
                    }, sx: { flexShrink: 0, mr: 0 }, children: /* @__PURE__ */ jsx19(Icon4, { icon: "mdi:delete-outline", size: 16 }) }) : null
                  ]
                },
                r.iconversacion
              );
            })
          ] }) }),
          convListMeta ? /* @__PURE__ */ jsx19(Box9, { className: "conv-log-sidebar-block paty-chat-sidebar-list-foot paty-chat-sidebar-list-foot--sticky", sx: { flexShrink: 0, pt: 0.5, pb: 0.5, px: 0 }, children: /* @__PURE__ */ jsxs16(Box9, { className: "paty-chat-conv-pager", role: "navigation", "aria-label": "Paginaci\xF3n de conversaciones", children: [
            /* @__PURE__ */ jsxs16(
              Typography10,
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
            /* @__PURE__ */ jsxs16(Stack8, { direction: "row", spacing: 0.35, alignItems: "center", className: "paty-chat-conv-pager__controls", children: [
              onConvListPageSizeChange ? /* @__PURE__ */ jsx19(
                Tooltip2,
                {
                  title: "Conversaciones por p\xE1gina",
                  slotProps: { popper: { sx: { pointerEvents: "none" } } },
                  children: /* @__PURE__ */ jsx19(FormControl3, { className: "paty-chat-conv-pager__size", sx: { m: 0, minWidth: 44 }, children: /* @__PURE__ */ jsx19(
                    Select3,
                    {
                      size: "small",
                      value: convListPageSize,
                      onChange: (e) => onConvListPageSizeChange(Number(e.target.value)),
                      "aria-label": "Conversaciones por p\xE1gina",
                      disabled: loadingList,
                      variant: "outlined",
                      MenuProps: { PaperProps: { sx: { "& .MuiMenuItem-root": { minHeight: 24, py: 0.2, fontSize: "0.68rem" } } } },
                      children: CONV_LIST_PAGE_SIZE_OPTIONS.map((n) => /* @__PURE__ */ jsx19(MenuItem3, { value: n, children: n }, n))
                    }
                  ) })
                }
              ) : null,
              convListMeta.pages > 1 ? /* @__PURE__ */ jsxs16(Stack8, { direction: "row", spacing: 0.5, className: "paty-chat-conv-pager__nav", children: [
                /* @__PURE__ */ jsx19(Tooltip2, { title: "P\xE1gina anterior", children: /* @__PURE__ */ jsx19("span", { children: /* @__PURE__ */ jsx19(
                  IconButton3,
                  {
                    size: "small",
                    className: "paty-chat-conv-pager__btn",
                    "aria-label": "P\xE1gina anterior",
                    disabled: loadingList || convListPage <= 1,
                    onClick: () => onConvListPageChange((p) => Math.max(1, p - 1)),
                    children: /* @__PURE__ */ jsx19(Icon4, { icon: "mdi:chevron-left", size: 16 })
                  }
                ) }) }),
                /* @__PURE__ */ jsx19(Tooltip2, { title: "P\xE1gina siguiente", children: /* @__PURE__ */ jsx19("span", { children: /* @__PURE__ */ jsx19(
                  IconButton3,
                  {
                    size: "small",
                    className: "paty-chat-conv-pager__btn",
                    "aria-label": "P\xE1gina siguiente",
                    disabled: loadingList || convListPage >= convListMeta.pages,
                    onClick: () => onConvListPageChange((p) => p + 1),
                    children: /* @__PURE__ */ jsx19(Icon4, { icon: "mdi:chevron-right", size: 16 })
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
  needsJwt,
  listScope,
  sessionScopeLoading,
  viewingAuditOther,
  auditScope,
  convListOwnerLabel,
  convListHeader,
  showJwtBadge,
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
  onMessageSourceChange,
  onChatModeChange,
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
    jwtLoading,
    needsJwt,
    listScope,
    sessionScopeLoading,
    viewingAuditOther,
    convListOwnerLabel,
    convListHeader,
    showJwtBadge,
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
    return /* @__PURE__ */ jsx19(
      Box9,
      {
        className: "paty-chat-sidebar-inner",
        sx: { display: "flex", flexDirection: "column", minHeight: 0, height: "100%", overflow: "hidden" },
        children: /* @__PURE__ */ jsx19(ChatSidebarBody, { ...bodyProps })
      }
    );
  }
  return /* @__PURE__ */ jsxs16(
    Box9,
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
        /* @__PURE__ */ jsxs16(
          Stack8,
          {
            direction: "row",
            spacing: 1,
            alignItems: "center",
            className: "conv-log-sidebar-block",
            sx: { py: 1, borderBottom: 1, borderColor: "divider", flexShrink: 0 },
            children: [
              /* @__PURE__ */ jsx19(Icon4, { icon: "mdi:chat-outline", size: 20 }),
              /* @__PURE__ */ jsx19(Box9, { sx: { flex: 1 } }),
              /* @__PURE__ */ jsx19(ChatNewConversationButton, { canSend, onNewChat, onClose }),
              /* @__PURE__ */ jsx19(
                ChatSidebarHeaderActions,
                {
                  onClose,
                  messageSource,
                  mode,
                  onMessageSourceChange,
                  onChatModeChange
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsx19(ChatSidebarBody, { ...bodyProps })
      ]
    }
  );
}

// js/tools/chat/ChatPayloadPreview.jsx
import { jsx as jsx20, jsxs as jsxs17 } from "react/jsx-runtime";
var { useMemo: useMemo11 } = getReact();
var { Icon: Icon5 } = UI;
function ChatPayloadPreview({ open, body, endpoint, onClose }) {
  const { Box: Box35, Typography: Typography32, Paper: Paper5, IconButton: IconButton16, Tooltip: Tooltip18 } = getMaterialUI();
  const previewJson = useMemo11(
    () => formatConversacionPostBodyPreview(body),
    [body]
  );
  const imageCount = Array.isArray(body.imagenes) ? body.imagenes.length : 0;
  const audioCount = Array.isArray(body.audios) ? body.audios.length : 0;
  if (!open) return null;
  return /* @__PURE__ */ jsxs17(
    Paper5,
    {
      className: "paty-chat-payload-preview",
      elevation: 8,
      role: "region",
      "aria-label": "Vista previa del body POST",
      children: [
        /* @__PURE__ */ jsxs17(Box35, { className: "paty-chat-payload-preview__head", children: [
          /* @__PURE__ */ jsxs17(Box35, { className: "paty-chat-payload-preview__head-main", children: [
            /* @__PURE__ */ jsx20(Typography32, { variant: "caption", className: "paty-chat-payload-preview__method", children: "POST" }),
            /* @__PURE__ */ jsx20(Typography32, { variant: "caption", component: "code", className: "paty-chat-payload-preview__path", children: endpoint }),
            imageCount > 0 ? /* @__PURE__ */ jsxs17(Typography32, { variant: "caption", className: "paty-chat-payload-preview__meta", children: [
              imageCount,
              " imagen",
              imageCount !== 1 ? "es" : "",
              " \xB7 base64"
            ] }) : null,
            audioCount > 0 ? /* @__PURE__ */ jsxs17(Typography32, { variant: "caption", className: "paty-chat-payload-preview__meta", children: [
              audioCount,
              " audio",
              audioCount !== 1 ? "s" : "",
              " \xB7 base64"
            ] }) : null
          ] }),
          /* @__PURE__ */ jsx20(Tooltip18, { title: "Cerrar vista previa", children: /* @__PURE__ */ jsx20(
            IconButton16,
            {
              size: "small",
              className: "paty-chat-payload-preview__close",
              "aria-label": "Cerrar vista previa del body POST",
              onClick: onClose,
              children: /* @__PURE__ */ jsx20(Icon5, { icon: "mdi:close", size: 18 })
            }
          ) })
        ] }),
        /* @__PURE__ */ jsx20(Box35, { className: "paty-chat-payload-preview__body", children: /* @__PURE__ */ jsx20(
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
        /* @__PURE__ */ jsxs17(Typography32, { variant: "caption", className: "paty-chat-payload-preview__foot", children: [
          "Vista previa en vivo \u2014 el env\xEDo incluye base64 completo en ",
          /* @__PURE__ */ jsx20("code", { children: "imagenes[]" }),
          " y ",
          /* @__PURE__ */ jsx20("code", { children: "audios[]" }),
          ".",
          " ",
          "ISS acepta im\xE1genes ",
          /* @__PURE__ */ jsx20("code", { children: "data:image/(png|jpeg|webp|gif);base64,\u2026" }),
          " (m\xE1x. 10) y audios ",
          /* @__PURE__ */ jsx20("code", { children: "data:audio/*;base64,\u2026" }),
          " (m\xE1x. 5, transcritos con Whisper)."
        ] })
      ]
    }
  );
}

// js/tools/chat/ChatComposer.jsx
import { jsx as jsx21, jsxs as jsxs18 } from "react/jsx-runtime";
var { useState: useState11 } = getReact();
var {
  Box: Box10,
  Button: Button6,
  IconButton: IconButton4,
  TextField: TextField5,
  CircularProgress: CircularProgress5,
  Tooltip: Tooltip3
} = getMaterialUI();
var { Icon: Icon6 } = UI;
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
  const [lightboxSrc, setLightboxSrc] = useState11(null);
  const canRecord = isVoiceRecordingSupported();
  const hasContent = Boolean(draft.trim() || images.length || audios.length);
  if (!canSend) return null;
  return /* @__PURE__ */ jsxs18(Box10, { className: "paty-chat-compose", children: [
    /* @__PURE__ */ jsx21(
      ChatPayloadPreview,
      {
        open: payloadPreviewOpen,
        body: postBodyPreview,
        endpoint: `${PATYIA_API_BASE}/conversacion`,
        onClose: onTogglePayloadPreview
      }
    ),
    images.length > 0 && /* @__PURE__ */ jsx21(Box10, { className: "paty-chat-image-previews", children: images.map((img, idx) => /* @__PURE__ */ jsxs18("figure", { children: [
      /* @__PURE__ */ jsx21(
        "button",
        {
          type: "button",
          className: "paty-chat-image-previews__thumb-btn",
          "aria-label": `Ver ${img.name || "adjunto"} en tama\xF1o completo`,
          onClick: () => setLightboxSrc(img.dataUrl),
          children: /* @__PURE__ */ jsx21(
            "img",
            {
              src: img.dataUrl,
              alt: img.name || "adjunto",
              onError: (e) => {
                e.currentTarget.classList.add("paty-chat-image-previews__img--broken");
                e.currentTarget.removeAttribute("src");
              }
            }
          )
        }
      ),
      /* @__PURE__ */ jsx21("button", { type: "button", className: "paty-chat-image-previews__remove", "aria-label": "Quitar", onClick: () => onRemoveImage(idx), children: "\xD7" })
    ] }, idx)) }),
    audios.length > 0 && /* @__PURE__ */ jsx21(Box10, { className: "paty-chat-audio-previews", children: audios.map((aud, idx) => /* @__PURE__ */ jsxs18("figure", { children: [
      /* @__PURE__ */ jsx21("audio", { controls: true, preload: "metadata", src: aud.dataUrl, "aria-label": aud.name || `Nota de voz ${idx + 1}` }),
      /* @__PURE__ */ jsx21("figcaption", { children: aud.name || `Nota ${idx + 1}` }),
      /* @__PURE__ */ jsx21("button", { type: "button", className: "paty-chat-audio-previews__remove", "aria-label": "Quitar audio", onClick: () => onRemoveAudio(idx), children: "\xD7" })
    ] }, idx)) }),
    /* @__PURE__ */ jsxs18(Box10, { className: "paty-chat-input-wrap", children: [
      /* @__PURE__ */ jsx21(
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
      /* @__PURE__ */ jsx21(Tooltip3, { title: payloadPreviewOpen ? "Ocultar body POST" : "Ver body POST (JSON en vivo)", children: /* @__PURE__ */ jsx21("span", { children: /* @__PURE__ */ jsx21(IconButton4, { color: "inherit", className: `paty-chat-payload-btn${payloadPreviewOpen ? " paty-chat-payload-btn--active" : ""}`, "aria-label": payloadPreviewOpen ? "Ocultar vista previa JSON" : "Ver vista previa JSON del POST", "aria-pressed": payloadPreviewOpen, disabled: sending, onClick: onTogglePayloadPreview, size: "small", children: /* @__PURE__ */ jsx21(Icon6, { icon: "mdi:code-json", size: 22 }) }) }) }),
      /* @__PURE__ */ jsx21(Tooltip3, { title: "Adjuntar imagen o audio", children: /* @__PURE__ */ jsx21("span", { children: /* @__PURE__ */ jsx21(
        IconButton4,
        {
          color: "inherit",
          className: "paty-chat-attach-btn",
          "aria-label": "Adjuntar imagen o audio",
          disabled: sending || images.length >= MAX_CHAT_IMAGES && audios.length >= MAX_CHAT_AUDIOS,
          onClick: onAttachClick,
          size: "small",
          children: /* @__PURE__ */ jsx21(Icon6, { icon: "mdi:paperclip", size: 22 })
        }
      ) }) }),
      /* @__PURE__ */ jsx21(Tooltip3, { title: canRecord ? isRecording ? "Detener grabaci\xF3n" : "Grabar nota de voz" : "Grabaci\xF3n no disponible en este navegador", children: /* @__PURE__ */ jsx21("span", { children: /* @__PURE__ */ jsx21(
        IconButton4,
        {
          color: isRecording ? "error" : "inherit",
          className: `paty-chat-mic-btn${isRecording ? " paty-chat-mic-btn--recording" : ""}`,
          "aria-label": isRecording ? "Detener grabaci\xF3n" : "Grabar nota de voz",
          "aria-pressed": isRecording,
          disabled: sending || !canRecord || audios.length >= MAX_CHAT_AUDIOS,
          onClick: onToggleVoiceRecord,
          size: "small",
          children: /* @__PURE__ */ jsx21(Icon6, { icon: isRecording ? "mdi:stop-circle-outline" : "mdi:microphone-outline", size: 22 })
        }
      ) }) }),
      /* @__PURE__ */ jsx21(
        TextField5,
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
      /* @__PURE__ */ jsx21(Button6, { variant: "contained", disabled: sending || isRecording || !hasContent, onClick: onSend, children: sending ? /* @__PURE__ */ jsx21(CircularProgress5, { size: 20, color: "inherit" }) : "Enviar" })
    ] }),
    /* @__PURE__ */ jsx21(ImageLightboxDialog, { open: Boolean(lightboxSrc), src: lightboxSrc, onClose: () => setLightboxSrc(null) })
  ] });
}

// js/tools/chat/ChatMainPanel.jsx
import { jsx as jsx22, jsxs as jsxs19 } from "react/jsx-runtime";
var {
  Box: Box11,
  Typography: Typography11,
  Button: Button7,
  IconButton: IconButton5,
  Tooltip: Tooltip4,
  Alert: Alert7,
  Stack: Stack9
} = getMaterialUI();
var { Icon: Icon7 } = UI;
function ChatMainPanel({ jwt, needsJwt, viewingAuditOther, selectedId, detail, canSend, loadingThread, refreshingThread = false, sending, showThread, logError, displayMensajes, chatUserDisplayName, chatUserNick, ratingMsgId, threadScrollRef, onThreadScroll, onOpenJwt, onClearAuditFilter, onRefreshConv, draft, images, audios, isRecording, payloadPreviewOpen, postBodyPreview, inputRef, attachInputRef, onDraftChange, onPaste, onSend, onTogglePayloadPreview, onAttachClick, onAttachChange, onToggleVoiceRecord, onRemoveImage, onRemoveAudio, onMeta, onRateMessage, onOpenSidebar, messageSource = "logs", mode, onMessageSourceChange, onChatModeChange }) {
  const isProdView = messageSource === "prod";
  return /* @__PURE__ */ jsxs19(Box11, { sx: { flex: 1, minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column" }, children: [
    onOpenSidebar ? /* @__PURE__ */ jsxs19(
      Stack9,
      {
        direction: "row",
        spacing: 1,
        alignItems: "center",
        className: "paty-chat-main-toolbar",
        sx: { px: 1, py: 0.5, minHeight: 40, flexShrink: 0 },
        children: [
          /* @__PURE__ */ jsx22(Tooltip4, { title: "Conversaciones", arrow: true, children: /* @__PURE__ */ jsx22(IconButton5, { size: "small", onClick: onOpenSidebar, "aria-label": "Abrir conversaciones", children: /* @__PURE__ */ jsx22(Icon7, { icon: "mdi:menu-open", size: 20 }) }) }),
          /* @__PURE__ */ jsx22(Typography11, { variant: "subtitle2", sx: { fontWeight: 700, flex: 1, minWidth: 0 }, noWrap: true, children: "Conversaciones" }),
          /* @__PURE__ */ jsx22(
            ChatSidebarHeaderActions,
            {
              messageSource,
              mode,
              onMessageSourceChange,
              onChatModeChange
            }
          ),
          selectedId || detail ? /* @__PURE__ */ jsx22(Tooltip4, { title: "Actualizar conversaci\xF3n", arrow: true, children: /* @__PURE__ */ jsx22("span", { children: /* @__PURE__ */ jsx22(
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
    ) : selectedId || detail ? /* @__PURE__ */ jsxs19(
      Stack9,
      {
        direction: "row",
        spacing: 1,
        alignItems: "center",
        className: "paty-chat-main-toolbar paty-chat-main-toolbar--desktop",
        sx: { px: 2, py: 0.75, flexShrink: 0 },
        children: [
          /* @__PURE__ */ jsx22(Box11, { sx: { flex: 1 } }),
          /* @__PURE__ */ jsx22(
            ChatSidebarHeaderActions,
            {
              messageSource,
              mode,
              onMessageSourceChange,
              onChatModeChange
            }
          ),
          /* @__PURE__ */ jsx22(Tooltip4, { title: "Actualizar conversaci\xF3n", arrow: true, children: /* @__PURE__ */ jsx22("span", { children: /* @__PURE__ */ jsx22(
            ButtonIconify,
            {
              icon: "mdi:refresh",
              title: "Actualizar",
              onClick: onRefreshConv,
              disabled: refreshingThread,
              busy: refreshingThread
            }
          ) }) })
        ]
      }
    ) : null,
    needsJwt && /* @__PURE__ */ jsxs19(
      Alert7,
      {
        severity: "info",
        sx: { mx: 2, mt: 1, flexShrink: 0 },
        action: /* @__PURE__ */ jsx22(Button7, { color: "inherit", size: "small", onClick: onOpenJwt, children: "Configurar JWT" }),
        children: [
          "Modo lectura \u2014 puedes explorar conversaciones. Configura el JWT de",
          " ",
          /* @__PURE__ */ jsx22(Typography11, { component: "a", href: "https://www.contapyme.com/soporte-staging/", target: "_blank", rel: "noreferrer", variant: "inherit", children: "soporte-staging" }),
          " ",
          "para enviar mensajes."
        ]
      }
    ),
    viewingAuditOther && /* @__PURE__ */ jsx22(Alert7, { severity: "info", sx: { mx: 2, mt: 1, flexShrink: 0 }, action: /* @__PURE__ */ jsx22(
      IconButton5,
      {
        color: "inherit",
        size: "small",
        "aria-label": jwt?.claims?.itercero ? "Volver a mi JWT" : "Ver recientes",
        onClick: onClearAuditFilter,
        children: /* @__PURE__ */ jsx22(Icon7, { icon: "mdi:close", size: 18 })
      }
    ), children: "Viendo conversaciones de otro usuario \u2014 lectura." }),
    !showThread ? /* @__PURE__ */ jsx22(
      Box11,
      {
        className: "paty-chat-thread-surface",
        sx: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0, ...convLogSurfaceSx({ flex: 1 }) },
        children: /* @__PURE__ */ jsx22(Box11, { sx: { textAlign: "center", maxWidth: 420, p: 2, borderRadius: 2, border: 1, borderColor: "divider", borderStyle: "dashed" }, children: /* @__PURE__ */ jsx22(Typography11, { variant: "body1", children: canSend ? "Escribe un mensaje abajo para iniciar una conversaci\xF3n." : needsJwt ? "Selecciona una conversaci\xF3n del listado o configura JWT para chatear." : "Selecciona una conversaci\xF3n o crea una nueva." }) })
      }
    ) : /* @__PURE__ */ jsx22(
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
        error: logError
      }
    ),
    /* @__PURE__ */ jsx22(
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

// js/tools/chat/JwtModal.jsx
import { jsx as jsx23, jsxs as jsxs20 } from "react/jsx-runtime";
var { useState: useState12, useEffect: useEffect11 } = getReact();
var { Button: Button8, TextField: TextField6, DialogContent: DialogContent6, DialogActions: DialogActions4, CircularProgress: CircularProgress6 } = getMaterialUI();
function JwtModal({ open, onClose, initialToken, onSave }) {
  const [value, setValue] = useState12(initialToken || "");
  const [saving, setSaving] = useState12(false);
  useEffect11(() => {
    if (open) setValue(initialToken || "");
  }, [open, initialToken]);
  async function submit() {
    try {
      const user = Session.username();
      if (!user) throw new Error("Inicia sesi\xF3n en ISA PatyIA");
      setSaving(true);
      const rec = await savePatyJwtAsync(value, user);
      onSave(rec);
      toastSuccess("Token JWT guardado en tu cuenta");
      onClose();
    } catch (e) {
      toastError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }
  return /* @__PURE__ */ jsxs20(
    GlassDialog,
    {
      open,
      onClose: saving ? void 0 : onClose,
      maxWidth: "sm",
      fullWidth: true,
      paperClassName: "paty-chat-jwt-dialog",
      header: /* @__PURE__ */ jsx23(
        GlassDialogHeader,
        {
          icon: "mdi:key-chain",
          title: "Token JWT PatyIA",
          subtitle: "Pega el token de sesi\xF3n para el chat staging",
          accent: "#6366f1",
          onClose: saving ? void 0 : onClose
        }
      ),
      children: [
        /* @__PURE__ */ jsx23(DialogContent6, { sx: glassDialogContentSx({ px: { xs: 2, sm: 2.5 }, pt: 2, pb: 1 }), children: /* @__PURE__ */ jsx23(
          TextField6,
          {
            fullWidth: true,
            multiline: true,
            minRows: 4,
            value,
            onChange: (e) => setValue(e.target.value),
            placeholder: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            inputProps: { spellCheck: false }
          }
        ) }),
        /* @__PURE__ */ jsxs20(DialogActions4, { sx: glassDialogActionsSx(), children: [
          /* @__PURE__ */ jsx23(Button8, { onClick: onClose, disabled: saving, children: "Cancelar" }),
          /* @__PURE__ */ jsx23(Button8, { variant: "contained", onClick: submit, disabled: saving, children: saving ? /* @__PURE__ */ jsx23(CircularProgress6, { size: 20, color: "inherit" }) : "Guardar" })
        ] })
      ]
    }
  );
}

// js/tools/chat/TercerosAuditDialog.jsx
import { jsx as jsx24, jsxs as jsxs21 } from "react/jsx-runtime";
var { useState: useState13, useEffect: useEffect12 } = getReact();
var {
  Box: Box12,
  Typography: Typography12,
  Button: Button9,
  TextField: TextField7,
  Dialog: Dialog5,
  DialogTitle: DialogTitle5,
  DialogContent: DialogContent7,
  DialogActions: DialogActions5,
  CircularProgress: CircularProgress7,
  Alert: Alert8,
  Stack: Stack10,
  Table: Table2,
  TableBody: TableBody2,
  TableCell: TableCell2,
  TableContainer: TableContainer2,
  TableHead: TableHead2,
  TableRow: TableRow2,
  Chip: Chip8
} = getMaterialUI();
var { Icon: Icon8 } = UI;
function TercerosAuditDialog({ open, onClose, jwt, sessionUser, onSelect, currentScope }) {
  const [q, setQ] = useState13("");
  const [qDebounced, setQDebounced] = useState13("");
  const [page, setPage] = useState13(1);
  const [loading, setLoading] = useState13(false);
  const [error, setError] = useState13("");
  const [data, setData] = useState13(null);
  useEffect12(() => {
    if (!open) return void 0;
    const t = setTimeout(() => setQDebounced(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q, open]);
  useEffect12(() => {
    if (!open) return;
    setPage(1);
  }, [qDebounced, open]);
  useEffect12(() => {
    if (!open) return void 0;
    const claims = jwt?.token ? jwt.claims?.itercero ? jwt.claims : parseJwtClaims(jwt.token) || {} : {};
    let cancelled = false;
    setLoading(true);
    setError("");
    fetchTercerosAudit({
      page,
      limit: TERCEROS_AUDIT_PAGE_SIZE,
      q: qDebounced,
      jwtToken: jwt?.token,
      jwtTercero: claims.itercero,
      jwtContacto: claims.icontacto,
      jwtNombre: jwt?.token ? jwtUserDisplayName(claims) : void 0,
      appUser: sessionUser || void 0
    }).then((res) => {
      if (!cancelled) setData(res);
    }).catch((err) => {
      if (!cancelled) {
        setData(null);
        setError(err instanceof Error ? err.message : String(err));
      }
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [open, page, qDebounced, jwt?.token, jwt?.claims?.itercero, jwt?.claims?.icontacto, sessionUser]);
  const currentKey = auditScopeKey(currentScope);
  const rows = data?.rows ?? [];
  return /* @__PURE__ */ jsxs21(Dialog5, { open, onClose, maxWidth: "md", fullWidth: true, scroll: "paper", className: "paty-chat-terceros-dialog", children: [
    /* @__PURE__ */ jsx24(DialogTitle5, { sx: { pb: 1.25 }, children: "Filtrar por usuario" }),
    /* @__PURE__ */ jsxs21(DialogContent7, { dividers: true, sx: { pt: 1.5 }, children: [
      /* @__PURE__ */ jsx24(
        TextField7,
        {
          size: "small",
          fullWidth: true,
          placeholder: "Buscar tercero o contacto\u2026",
          value: q,
          onChange: (e) => setQ(e.target.value),
          sx: { mb: 1.5 },
          InputProps: {
            startAdornment: /* @__PURE__ */ jsx24(Icon8, { icon: "mdi:magnify", size: 18, style: { marginRight: 6, opacity: 0.6 } })
          }
        }
      ),
      error ? /* @__PURE__ */ jsx24(Alert8, { severity: "error", sx: { mb: 1.5 }, children: error }) : null,
      loading ? /* @__PURE__ */ jsx24(Box12, { sx: { py: 4, textAlign: "center" }, children: /* @__PURE__ */ jsx24(CircularProgress7, { size: 28 }) }) : /* @__PURE__ */ jsx24(TableContainer2, { className: "paty-chat-terceros-table", children: /* @__PURE__ */ jsxs21(Table2, { size: "small", stickyHeader: true, children: [
        /* @__PURE__ */ jsx24(TableHead2, { children: /* @__PURE__ */ jsxs21(TableRow2, { children: [
          /* @__PURE__ */ jsx24(TableCell2, { children: "Nombre / tercero" }),
          /* @__PURE__ */ jsx24(TableCell2, { children: "Contacto" }),
          /* @__PURE__ */ jsx24(TableCell2, { align: "right", children: "Convs" }),
          /* @__PURE__ */ jsx24(TableCell2, { align: "right", children: "Msgs" }),
          /* @__PURE__ */ jsx24(TableCell2, { children: "\xDAltima act." }),
          /* @__PURE__ */ jsx24(TableCell2, { align: "center", children: "Ver" })
        ] }) }),
        /* @__PURE__ */ jsxs21(TableBody2, { children: [
          rows.map((row) => {
            const key = `${row.itercero}|${row.icontacto}`;
            const selected = currentKey === key;
            return /* @__PURE__ */ jsxs21(
              TableRow2,
              {
                hover: true,
                selected,
                className: row.es_jwt ? "paty-chat-terceros-row--jwt" : void 0,
                children: [
                  /* @__PURE__ */ jsx24(TableCell2, { children: /* @__PURE__ */ jsxs21(Stack10, { direction: "row", spacing: 0.5, alignItems: "center", flexWrap: "wrap", useFlexGap: true, children: [
                    /* @__PURE__ */ jsx24(Box12, { sx: { minWidth: 0 }, children: row.nombre ? /* @__PURE__ */ jsxs21(Typography12, { variant: "body2", sx: { fontWeight: 600, lineHeight: 1.35 }, children: [
                      shortDisplayName(row.nombre),
                      " ",
                      /* @__PURE__ */ jsx24(
                        Typography12,
                        {
                          component: "span",
                          variant: "caption",
                          color: "text.secondary",
                          sx: {
                            fontWeight: 400,
                            fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                            letterSpacing: "0.02em"
                          },
                          children: row.itercero
                        }
                      )
                    ] }) : /* @__PURE__ */ jsx24(
                      Typography12,
                      {
                        variant: "body2",
                        component: "span",
                        sx: { fontFamily: '"IBM Plex Mono", ui-monospace, monospace', letterSpacing: "0.02em" },
                        children: row.itercero
                      }
                    ) }),
                    row.es_jwt ? /* @__PURE__ */ jsx24(Chip8, { size: "small", label: "JWT", color: "primary", sx: { height: 20 } }) : null,
                    row.es_sesion ? /* @__PURE__ */ jsx24(Chip8, { size: "small", label: "Sesi\xF3n", color: "success", sx: { height: 20 } }) : null
                  ] }) }),
                  /* @__PURE__ */ jsx24(TableCell2, { children: row.icontacto }),
                  /* @__PURE__ */ jsx24(TableCell2, { align: "right", children: row.total_conversaciones.toLocaleString("es-CO") }),
                  /* @__PURE__ */ jsx24(TableCell2, { align: "right", children: row.total_mensajes.toLocaleString("es-CO") }),
                  /* @__PURE__ */ jsx24(TableCell2, { children: formatAuditTs(row.ultima_actividad) }),
                  /* @__PURE__ */ jsx24(TableCell2, { align: "center", children: /* @__PURE__ */ jsx24(
                    Button9,
                    {
                      size: "small",
                      variant: selected ? "contained" : "outlined",
                      onClick: () => onSelect({
                        itercero: row.itercero,
                        icontacto: row.icontacto,
                        esJwt: row.es_jwt,
                        esSesion: row.es_sesion,
                        nombre: row.nombre ? shortDisplayName(row.nombre) : null
                      }),
                      children: selected ? "Activo" : row.es_sesion ? "Mis convs" : "Ver"
                    }
                  ) })
                ]
              },
              key
            );
          }),
          !loading && !rows.length ? /* @__PURE__ */ jsx24(TableRow2, { children: /* @__PURE__ */ jsxs21(TableCell2, { colSpan: 6, align: "center", sx: { py: 3, color: "text.secondary" }, children: [
            "Sin resultados",
            qDebounced ? ` para \u201C${qDebounced}\u201D` : "",
            "."
          ] }) }) : null
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs21(DialogActions5, { sx: { justifyContent: "space-between", px: 2, py: 1.25 }, children: [
      /* @__PURE__ */ jsx24(Typography12, { variant: "caption", color: "text.secondary", children: data ? `${data.total.toLocaleString("es-CO")} contactos \xB7 p\xE1g. ${data.page}/${Math.max(data.pages, 1)}` : "\u2014" }),
      /* @__PURE__ */ jsxs21(Stack10, { direction: "row", spacing: 1, alignItems: "center", children: [
        /* @__PURE__ */ jsx24(
          Button9,
          {
            size: "small",
            disabled: loading || !data || page <= 1,
            onClick: () => setPage((p) => Math.max(1, p - 1)),
            startIcon: /* @__PURE__ */ jsx24(Icon8, { icon: "mdi:chevron-left", size: 18 }),
            children: "Anterior"
          }
        ),
        /* @__PURE__ */ jsx24(
          Button9,
          {
            size: "small",
            disabled: loading || !data || page >= (data.pages || 1),
            onClick: () => setPage((p) => p + 1),
            endIcon: /* @__PURE__ */ jsx24(Icon8, { icon: "mdi:chevron-right", size: 18 }),
            children: "Siguiente"
          }
        ),
        /* @__PURE__ */ jsx24(Button9, { onClick: onClose, children: "Cerrar" })
      ] })
    ] })
  ] });
}

// js/tools/ChatTool.jsx
import { Fragment as Fragment8, jsx as jsx25, jsxs as jsxs22 } from "react/jsx-runtime";
var { Box: Box13, Drawer: Drawer2, Fab: Fab2, IconButton: IconButton6, Tooltip: Tooltip5, useTheme: useTheme2, useMediaQuery: useMediaQuery2 } = getMaterialUI();
var { useState: useState14 } = getReact();
var { Icon: Icon9 } = UI;
function ChatTool({ bootChat, onNeedLogin }) {
  const chat = useChatTool({ bootChat });
  const theme2 = useTheme2();
  const isMobile = useMediaQuery2(theme2.breakpoints.down("md"));
  const [sidebarOpen, setSidebarOpen] = useState14(false);
  const [refreshingThread, setRefreshingThread] = useState14(false);
  if (!chat.loggedIn) {
    return /* @__PURE__ */ jsx25(ChatLoggedOutShell, { onNeedLogin });
  }
  const IsaSplitView = getIsaSplitView();
  const sidebarProps = {
    jwt: chat.jwt,
    displayScope: chat.displayScope,
    sessionUser: chat.sessionUser,
    canInteract: chat.canInteract,
    viewOnly: chat.viewOnly,
    jwtLoading: chat.jwtLoading,
    convListOwnerLabel: chat.convListOwnerLabel,
    convListHeader: chat.convListHeader,
    showJwtBadge: chat.showJwtBadge,
    canSend: chat.canSend,
    needsJwt: chat.needsJwt,
    listScope: chat.listScope,
    sessionScopeLoading: chat.sessionScopeLoading,
    viewingAuditOther: chat.viewingAuditOther,
    auditScope: chat.auditScope,
    loadingList: chat.loadingList,
    rows: chat.rows,
    selectedId: chat.selectedId,
    convListMeta: chat.convListMeta,
    convListPage: chat.convListPage,
    convListPageSize: chat.convListPageSize,
    convListSearch: chat.convListSearch,
    onConvListSearchChange: chat.handleConvListSearchChange,
    messageSource: chat.messageSource,
    onMessageSourceChange: chat.onMessageSourceChange,
    mode: chat.chatMode,
    onChatModeChange: chat.onChatModeChange,
    onOpenJwt: () => chat.setJwtOpen(true),
    onOpenAudit: () => chat.setAuditDialogOpen(true),
    onNewChat: chat.onNewChat,
    onOpenConv: chat.openConv,
    onDelete: chat.onDelete,
    onConvListPageChange: chat.setConvListPage,
    onConvListPageSizeChange: chat.onConvListPageSizeChange
  };
  const mainPanel = /* @__PURE__ */ jsx25(
    ChatMainPanel,
    {
      jwt: chat.jwt,
      needsJwt: chat.needsJwt,
      viewingAuditOther: chat.viewingAuditOther,
      selectedId: chat.selectedId,
      detail: chat.detail,
      canSend: chat.canSend,
      loadingThread: chat.loadingThread,
      refreshingThread,
      sending: chat.sending,
      showThread: chat.showThread,
      logError: chat.logError,
      displayMensajes: chat.displayMensajes,
      chatUserDisplayName: chat.chatUserDisplayName,
      chatUserNick: chat.chatUserNick,
      ratingMsgId: chat.ratingMsgId,
      threadScrollRef: chat.threadScrollRef,
      onThreadScroll: chat.onThreadScroll,
      onOpenJwt: () => chat.setJwtOpen(true),
      onClearAuditFilter: chat.clearAuditFilter,
      onRefreshConv: async () => {
        if (!chat.selectedId || refreshingThread) return;
        setRefreshingThread(true);
        try {
          await chat.openConv(chat.selectedId, { freshLog: true, silent: true, keepStream: true });
        } finally {
          setRefreshingThread(false);
        }
      },
      draft: chat.draft,
      images: chat.images,
      audios: chat.audios,
      isRecording: chat.isRecording,
      payloadPreviewOpen: chat.payloadPreviewOpen,
      postBodyPreview: chat.postBodyPreview,
      inputRef: chat.inputRef,
      attachInputRef: chat.attachInputRef,
      onDraftChange: (e) => chat.setDraft(e.target.value),
      onPaste: chat.onPaste,
      onSend: chat.onSend,
      onTogglePayloadPreview: () => chat.setPayloadPreviewOpen((v) => !v),
      onAttachClick: chat.onAttachClick,
      onAttachChange: chat.onAttachChange,
      onToggleVoiceRecord: chat.onToggleVoiceRecord,
      onRemoveImage: (idx) => chat.setImages((p) => p.filter((_, j) => j !== idx)),
      onRemoveAudio: (idx) => chat.setAudios((p) => p.filter((_, j) => j !== idx)),
      onMeta: chat.onMeta,
      onRateMessage: chat.onRateMessage,
      messageSource: chat.messageSource,
      mode: chat.chatMode,
      onMessageSourceChange: chat.onMessageSourceChange,
      onChatModeChange: chat.onChatModeChange,
      onOpenSidebar: isMobile ? () => setSidebarOpen(true) : void 0
    }
  );
  return /* @__PURE__ */ jsxs22(
    Box13,
    {
      className: "conv-log-shell paty-chat-shell",
      sx: { display: "flex", height: "100%", minHeight: 0, flexDirection: "column", position: "relative" },
      children: [
        isMobile ? /* @__PURE__ */ jsxs22(Fragment8, { children: [
          /* @__PURE__ */ jsx25(
            Drawer2,
            {
              anchor: "left",
              open: sidebarOpen,
              onClose: () => setSidebarOpen(false),
              ModalProps: { keepMounted: true },
              PaperProps: mobileDrawerPaperProps("paty-mobile-sidebar-drawer"),
              children: /* @__PURE__ */ jsx25(
                ChatThreadSidebar,
                {
                  ...sidebarProps,
                  drawerMode: true,
                  onClose: () => setSidebarOpen(false)
                }
              )
            }
          ),
          mainPanel
        ] }) : /* @__PURE__ */ jsx25(
          IsaSplitView,
          {
            className: "conv-log-shell-split paty-chat-shell-split",
            sx: { flex: 1, minHeight: 0 },
            panelClassName: "conv-log-sidebar paty-chat-sidebar",
            storageKey: "isa-patyia:chat-sidebar-width",
            defaultWidth: CHAT_SIDEBAR_W,
            maxWidth: 520,
            panelTitle: "Conversaciones",
            panelIcon: "mdi:chat-outline",
            UI,
            panelHeaderEnd: /* @__PURE__ */ jsx25(ChatNewConversationButton, { canSend: chat.canSend, onNewChat: chat.onNewChat }),
            collapsedRail: ({ expand }) => /* @__PURE__ */ jsxs22(Box13, { className: "conv-log-collapsed-rail paty-chat-collapsed-rail", children: [
              /* @__PURE__ */ jsx25(Tooltip5, { title: "Nueva conversaci\xF3n", placement: "right", children: /* @__PURE__ */ jsx25(
                IconButton6,
                {
                  size: "small",
                  className: "isa-neon-rail-btn isa-neon-rail-btn--new",
                  "aria-label": "Nueva conversaci\xF3n",
                  disabled: !chat.canSend,
                  onClick: () => {
                    chat.onNewChat();
                    expand();
                  },
                  children: /* @__PURE__ */ jsx25(Icon9, { icon: "mdi:plus", size: 20 })
                }
              ) }),
              /* @__PURE__ */ jsx25(Tooltip5, { title: "Cambiar token JWT", placement: "right", children: /* @__PURE__ */ jsx25(
                IconButton6,
                {
                  size: "small",
                  className: "isa-neon-rail-btn isa-neon-rail-btn--jwt",
                  "aria-label": "JWT",
                  onClick: () => {
                    chat.setJwtOpen(true);
                    expand();
                  },
                  children: /* @__PURE__ */ jsx25(Icon9, { icon: "mdi:key-variant", size: 20 })
                }
              ) })
            ] }),
            panel: /* @__PURE__ */ jsx25(ChatThreadSidebar, { ...sidebarProps, splitMode: true }),
            children: mainPanel
          }
        ),
        isMobile ? /* @__PURE__ */ jsx25(
          Fab2,
          {
            color: "primary",
            size: "medium",
            className: "paty-mobile-sidebar-fab paty-mobile-sidebar-fab--chat",
            "aria-label": "Abrir conversaciones",
            onClick: () => setSidebarOpen(true),
            sx: {
              position: "absolute",
              left: 12,
              zIndex: 6,
              display: sidebarOpen ? "none" : "flex"
            },
            children: /* @__PURE__ */ jsx25(Icon9, { icon: "mdi:forum-outline", size: 22 })
          }
        ) : null,
        /* @__PURE__ */ jsx25(
          JwtModal,
          {
            open: chat.jwtOpen,
            onClose: () => chat.setJwtOpen(false),
            initialToken: chat.jwt?.token || "",
            onSave: chat.setJwt
          }
        ),
        /* @__PURE__ */ jsx25(
          MetaDialog,
          {
            open: chat.metaOpen,
            onClose: () => chat.setMetaOpen(false),
            meta: chat.metaMsg?.meta,
            usageStats: chat.metaMsg?.usageStats ?? null,
            title: chat.metaMsg ? `Trazabilidad \xB7 ${chat.metaMsg.rol}` : "",
            isUserMessage: Boolean(chat.metaMsg?.esUsuario),
            userContent: chat.metaMsg?.contenido ?? "",
            imagenes: chat.metaMsg?.imagenes ?? null
          }
        ),
        /* @__PURE__ */ jsx25(
          TercerosAuditDialog,
          {
            open: chat.auditDialogOpen,
            onClose: () => chat.setAuditDialogOpen(false),
            jwt: chat.jwt,
            sessionUser: chat.sessionUser,
            currentScope: chat.auditCurrentScope,
            onSelect: chat.handleSelectAuditScope
          }
        )
      ]
    }
  );
}

// js/api/todosApi.ts
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

// js/tools/todos/todosBoardState.js
function patchTaskInBoard(board, taskId, patch) {
  if (!board) return board;
  return {
    ...board,
    tasks: board.tasks.map((t) => t.id === taskId ? { ...t, ...patch } : t)
  };
}
function replaceTaskInBoard(board, taskId, next) {
  if (!board) return board;
  return {
    ...board,
    tasks: board.tasks.map((t) => t.id === taskId ? next : t)
  };
}
function appendTaskToBoard(board, task) {
  if (!board) return board;
  return { ...board, tasks: [...board.tasks, task] };
}
function buildOptimisticTask(opts) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  return {
    id: `optimistic-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    boardId: opts.boardId,
    columnId: opts.columnId,
    parentTaskId: null,
    title: opts.title,
    descriptionDoc: "",
    sortOrder: 9999,
    assignedTo: null,
    createdBy: opts.createdBy,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
    subtasks: [],
    milestones: [],
    events: []
  };
}

// js/tools/todos/boardsHomeState.js
var LS_KEY = "isa-patyia:todos-boards-expand";
function readBoardExpandState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}
function writeBoardExpandState(state) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
  }
}
function sortBoardsByRecent(boards) {
  return [...boards].sort((a, b) => {
    const ta = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
    const tb = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
    return tb - ta;
  });
}
function canEditBoard(board) {
  if (board?.canEdit != null) return !!board.canEdit;
  return !!board?.isAdmin || board?.myRole === "editor";
}
function canDeleteBoard(board) {
  if (board?.canDelete != null) return !!board.canDelete;
  return !!board?.isAdmin;
}
function boardRoleChips(board) {
  const chips = [];
  if (board?.myRole === "editor") {
    chips.push({ id: "editor", label: "Editor", icon: "mdi:pencil-outline", variant: "role" });
  }
  if (board?.myRole === "readonly") {
    chips.push({ id: "readonly", label: "Solo lectura", icon: "mdi:eye-outline", variant: "role" });
  }
  return chips;
}

// js/tools/todos/todosKanbanShared.js
var MAX_COLUMN_TASKS = 4;
var IN_PROGRESS_COLUMN_KEY = "in_progress";
function normalizeTodoBoardData(boardData) {
  if (!boardData?.columns?.length) return boardData ?? null;
  const inProgress = boardData.columns.find((c) => c.columnKey === IN_PROGRESS_COLUMN_KEY);
  if (!inProgress) return boardData;
  const pending = boardData.columns.find((c) => c.columnKey === "pending");
  const fallbackColumnId = pending?.id ?? boardData.columns.find((c) => c.columnKey !== IN_PROGRESS_COLUMN_KEY)?.id;
  const columns = boardData.columns.filter((c) => c.columnKey !== IN_PROGRESS_COLUMN_KEY);
  const tasks = fallbackColumnId ? boardData.tasks.map((t) => t.columnId === inProgress.id ? { ...t, columnId: fallbackColumnId } : t) : boardData.tasks;
  return { ...boardData, columns, tasks };
}
function sortTasksByRecent(tasks) {
  return [...tasks].sort((a, b) => {
    const ta = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
    const tb = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
    return tb - ta;
  });
}
function formatTaskDate(iso) {
  if (!iso) return "\u2014";
  try {
    return new Date(iso).toLocaleDateString("es-CO", { dateStyle: "short" });
  } catch {
    return String(iso);
  }
}
function groupTasksByColumn(boardData) {
  if (!boardData) return /* @__PURE__ */ new Map();
  const map = /* @__PURE__ */ new Map();
  for (const col of boardData.columns) map.set(col.id, []);
  for (const task of boardData.tasks) {
    const list = map.get(task.columnId);
    if (list) list.push(task);
  }
  for (const [colId, list] of map) {
    map.set(colId, sortTasksByRecent(list));
  }
  return map;
}
function taskModDate(task) {
  return task.updatedAt ?? task.createdAt ?? null;
}
var ASSIGNEE_PALETTE = [
  { fg: "#38bdf8", bg: "rgba(56, 189, 248, 0.2)" },
  { fg: "#f472b6", bg: "rgba(244, 114, 182, 0.2)" },
  { fg: "#a78bfa", bg: "rgba(167, 139, 250, 0.2)" },
  { fg: "#fbbf24", bg: "rgba(251, 191, 36, 0.22)" },
  { fg: "#34d399", bg: "rgba(52, 211, 153, 0.2)" },
  { fg: "#fb923c", bg: "rgba(251, 146, 60, 0.2)" },
  { fg: "#22d3ee", bg: "rgba(34, 211, 238, 0.2)" },
  { fg: "#e879f9", bg: "rgba(232, 121, 249, 0.2)" }
];
var UNASSIGNED_THEME = {
  label: "Sin asignar",
  fg: "#94a3b8",
  bg: "rgba(148, 163, 184, 0.1)"
};
function hashUsername(value) {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = h * 31 + value.charCodeAt(i) >>> 0;
  }
  return h;
}
function normalizeAssigneeUsername(assignedTo) {
  const username = String(assignedTo ?? "").trim().toUpperCase();
  if (username === "KEVIN") return "KGOMEZ";
  return username;
}
function assigneeTheme(assignedTo) {
  const username = normalizeAssigneeUsername(assignedTo);
  if (!username) return UNASSIGNED_THEME;
  const palette = ASSIGNEE_PALETTE[hashUsername(username) % ASSIGNEE_PALETTE.length];
  return { label: username, ...palette };
}

// js/tools/todos/useTodosTool.ts
var { useState: useState15, useEffect: useEffect13, useCallback: useCallback8, useRef: useRef7 } = getReact();
function useTodosTool({ bootTodos }) {
  const [loggedIn, setLoggedIn] = useState15(Session.isLoggedIn());
  const [boards, setBoards] = useState15([]);
  const [boardPreviews, setBoardPreviews] = useState15({});
  const [loadingPreviews, setLoadingPreviews] = useState15(false);
  const [boardId, setBoardId] = useState15(String(bootTodos?.boardId ?? ""));
  const [boardData, setBoardData] = useState15(null);
  const [loadingBoards, setLoadingBoards] = useState15(false);
  const [loadingBoard, setLoadingBoard] = useState15(false);
  const [error, setError] = useState15("");
  const [selectedTask, setSelectedTask] = useState15(null);
  const [taskLoading, setTaskLoading] = useState15(false);
  const [newBoardOpen, setNewBoardOpen] = useState15(false);
  const dragTaskId = useRef7(null);
  const previewDragRef = useRef7(null);
  const boardDataRef = useRef7(null);
  useEffect13(() => {
    boardDataRef.current = boardData;
  }, [boardData]);
  useEffect13(() => {
    function onAuth() {
      setLoggedIn(Session.isLoggedIn());
    }
    window.addEventListener(Session.EVENT, onAuth);
    return () => window.removeEventListener(Session.EVENT, onAuth);
  }, []);
  useEffect13(() => subscribe((snap) => {
    const urlBoardId = String(snap.todos?.boardId ?? "").trim();
    setBoardId((prev) => prev === urlBoardId ? prev : urlBoardId);
    if (!urlBoardId) {
      setBoardData(null);
      setSelectedTask(null);
    }
  }), []);
  const loadBoardPreviews = useCallback8(async (list) => {
    if (!list.length) {
      setBoardPreviews({});
      return;
    }
    setLoadingPreviews(true);
    try {
      const entries = await Promise.all(
        list.map(async (board) => {
          try {
            const data = await fetchTodoBoard(board.id);
            return [
              board.id,
              normalizeTodoBoardData({ board: data.board, columns: data.columns, tasks: data.tasks })
            ];
          } catch {
            return [board.id, null];
          }
        })
      );
      setBoardPreviews(Object.fromEntries(entries));
    } finally {
      setLoadingPreviews(false);
    }
  }, []);
  const loadBoards = useCallback8(async () => {
    if (!Session.isLoggedIn()) return;
    setLoadingBoards(true);
    setError("");
    try {
      const list = sortBoardsByRecent(await fetchTodoBoards("scrum"));
      setBoards(list);
      void loadBoardPreviews(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingBoards(false);
    }
  }, [loadBoardPreviews]);
  const loadBoard = useCallback8(async (id, opts) => {
    if (!id || !Session.isLoggedIn()) return;
    if (!opts?.silent) setLoadingBoard(true);
    if (!opts?.silent) setError("");
    try {
      const data = await fetchTodoBoard(id);
      setBoardData(normalizeTodoBoardData({ board: data.board, columns: data.columns, tasks: data.tasks }));
    } catch (e) {
      if (!opts?.silent) {
        setError(e instanceof Error ? e.message : String(e));
        setBoardData(null);
      }
    } finally {
      if (!opts?.silent) setLoadingBoard(false);
    }
  }, []);
  useEffect13(() => {
    if (!loggedIn) return;
    loadBoards();
  }, [loggedIn, loadBoards]);
  useEffect13(() => {
    if (!loggedIn || !boardId) return;
    loadBoard(boardId);
  }, [loggedIn, boardId, loadBoard]);
  function selectBoard(id) {
    setBoardId(id);
    mergePartial({ todos: { boardId: id } });
  }
  function goHome() {
    setBoardId("");
    setBoardData(null);
    setSelectedTask(null);
    mergePartial({ todos: { boardId: "" } });
  }
  async function onCreateBoard(payload) {
    const data = await createTodoBoard({
      title: payload.title,
      description: payload.description || void 0,
      visibility: payload.visibility,
      members: payload.members
    });
    await loadBoards();
    if (data.board?.id) selectBoard(data.board.id);
    toastSuccess("Tablero creado");
    setNewBoardOpen(false);
  }
  async function onUpdateBoard(boardIdToUpdate, patch) {
    const data = await updateTodoBoard(boardIdToUpdate, patch);
    setBoards((prev) => sortBoardsByRecent(
      prev.map((b) => b.id === boardIdToUpdate ? { ...b, ...data.board } : b)
    ));
    setBoardPreviews((prev) => {
      if (!prev[boardIdToUpdate]) return prev;
      return {
        ...prev,
        [boardIdToUpdate]: normalizeTodoBoardData({
          board: data.board,
          columns: data.columns,
          tasks: data.tasks
        })
      };
    });
    if (boardId === boardIdToUpdate) {
      setBoardData(normalizeTodoBoardData({
        board: data.board,
        columns: data.columns,
        tasks: data.tasks
      }));
    }
    toastSuccess("Tablero actualizado");
  }
  async function onDeleteBoard(boardIdToDelete) {
    await deleteTodoBoard(boardIdToDelete);
    setBoards((prev) => prev.filter((b) => b.id !== boardIdToDelete));
    setBoardPreviews((prev) => {
      const next = { ...prev };
      delete next[boardIdToDelete];
      return next;
    });
    if (boardId === boardIdToDelete) goHome();
    toastSuccess("Tablero eliminado");
  }
  async function onQuickAddTask(columnId, title) {
    if (!boardId || !title.trim()) return;
    const trimmed = title.trim();
    const snapshot = boardDataRef.current;
    const optimistic = buildOptimisticTask({
      boardId,
      columnId,
      title: trimmed,
      createdBy: Session.username() || "unknown"
    });
    setBoardData((prev) => appendTaskToBoard(prev, optimistic));
    try {
      const created = await createTodoTask(boardId, { columnId, title: trimmed });
      setBoardData((prev) => replaceTaskInBoard(prev, optimistic.id, created));
    } catch (e) {
      setBoardData(snapshot);
      toastError(e instanceof Error ? e.message : String(e));
      throw e;
    }
  }
  async function openTask(taskId) {
    const cached = boardDataRef.current?.tasks.find((t) => t.id === taskId);
    if (cached) setSelectedTask(cached);
    setTaskLoading(!cached);
    try {
      const task = await fetchTodoTask(taskId);
      setSelectedTask(task);
    } catch (e) {
      if (!cached) setSelectedTask(null);
      toastError(e instanceof Error ? e.message : String(e));
    } finally {
      setTaskLoading(false);
    }
  }
  async function openTaskFromPreview(boardId2, taskId) {
    const preview = boardPreviews[boardId2];
    const cached = preview?.tasks.find((t) => t.id === taskId);
    if (cached) setSelectedTask(cached);
    setTaskLoading(!cached);
    if (!boardDataRef.current || boardDataRef.current.board?.id !== boardId2) {
      try {
        const raw = preview ?? await fetchTodoBoard(boardId2);
        setBoardData(normalizeTodoBoardData({
          board: raw.board,
          columns: raw.columns,
          tasks: raw.tasks
        }));
      } catch {
      }
    }
    try {
      const task = await fetchTodoTask(taskId);
      setSelectedTask(task);
    } catch (e) {
      if (!cached) setSelectedTask(null);
      toastError(e instanceof Error ? e.message : String(e));
    } finally {
      setTaskLoading(false);
    }
  }
  async function saveTask(patch) {
    if (!selectedTask) return;
    const taskId = selectedTask.id;
    const snapshot = boardDataRef.current;
    const prevTask = selectedTask;
    const nextTask = { ...selectedTask, ...patch };
    setSelectedTask(nextTask);
    setBoardData((prev) => patchTaskInBoard(prev, taskId, patch));
    try {
      const updated = await updateTodoTask(taskId, patch);
      setSelectedTask(updated);
      setBoardData((prev) => replaceTaskInBoard(prev, taskId, updated));
    } catch (e) {
      setSelectedTask(prevTask);
      setBoardData(snapshot);
      toastError(e instanceof Error ? e.message : String(e));
      throw e;
    }
    toastSuccess("Tarea actualizada");
  }
  async function saveSubtask(subtaskId, patch) {
    if (!selectedTask) return;
    await updateTodoTask(subtaskId, patch);
    const refreshed = await fetchTodoTask(selectedTask.id);
    setSelectedTask(refreshed);
    toastSuccess("Subtarea actualizada");
  }
  async function deleteSubtask(subtaskId) {
    if (!selectedTask) return;
    await deleteTodoTask(subtaskId);
    const refreshed = await fetchTodoTask(selectedTask.id);
    setSelectedTask(refreshed);
    toastSuccess("Subtarea eliminada");
  }
  async function saveMilestone(milestoneId, patch) {
    if (!selectedTask) return;
    await updateTodoMilestone(milestoneId, patch);
    const refreshed = await fetchTodoTask(selectedTask.id);
    setSelectedTask(refreshed);
    toastSuccess("Hito actualizado");
  }
  async function deleteMilestone(milestoneId) {
    if (!selectedTask) return;
    await deleteTodoMilestone(milestoneId);
    const refreshed = await fetchTodoTask(selectedTask.id);
    setSelectedTask(refreshed);
    toastSuccess("Hito eliminado");
  }
  async function addSubtask(title) {
    if (!selectedTask || !boardId || !title.trim()) return;
    const trimmed = title.trim();
    try {
      await createTodoTask(boardId, {
        columnId: selectedTask.columnId,
        title: trimmed,
        parentTaskId: selectedTask.id
      });
      const refreshed = await fetchTodoTask(selectedTask.id);
      setSelectedTask(refreshed);
    } catch (e) {
      toastError(e instanceof Error ? e.message : String(e));
      throw e;
    }
    toastSuccess("Subtarea creada");
  }
  async function addMilestone(title, dueDate) {
    if (!selectedTask || !title.trim()) return;
    try {
      await createTodoMilestone(selectedTask.id, { title: title.trim(), dueDate });
      const refreshed = await fetchTodoTask(selectedTask.id);
      setSelectedTask(refreshed);
      toastSuccess("Hito a\xF1adido");
    } catch (e) {
      toastError(e instanceof Error ? e.message : String(e));
      throw e;
    }
  }
  async function toggleMilestone(milestoneId, completed) {
    if (!selectedTask) return;
    const snapshot = selectedTask;
    const nextMilestones = (selectedTask.milestones ?? []).map(
      (m) => m.id === milestoneId ? { ...m, completedAt: completed ? (/* @__PURE__ */ new Date()).toISOString() : null } : m
    );
    setSelectedTask({ ...selectedTask, milestones: nextMilestones });
    try {
      await updateTodoMilestone(milestoneId, { completed });
      const refreshed = await fetchTodoTask(selectedTask.id);
      setSelectedTask(refreshed);
    } catch (e) {
      setSelectedTask(snapshot);
      toastError(e instanceof Error ? e.message : String(e));
    }
  }
  async function postComment(body) {
    if (!selectedTask || !body.trim()) return;
    try {
      await addTodoComment(selectedTask.id, body.trim());
      const refreshed = await fetchTodoTask(selectedTask.id);
      setSelectedTask(refreshed);
      toastSuccess("Comentario registrado");
    } catch (e) {
      toastError(e instanceof Error ? e.message : String(e));
      throw e;
    }
  }
  async function moveTask(taskId, columnId) {
    if (!boardId) return;
    const snapshot = boardDataRef.current;
    const task = snapshot?.tasks.find((t) => t.id === taskId);
    if (!task || task.columnId === columnId) return;
    const doneCol = snapshot?.columns.find((c) => c.columnKey === "done");
    const completedAt = doneCol && columnId === doneCol.id ? (/* @__PURE__ */ new Date()).toISOString() : null;
    setBoardData((prev) => patchTaskInBoard(prev, taskId, { columnId, completedAt }));
    try {
      const updated = await updateTodoTask(taskId, { columnId });
      setBoardData((prev) => replaceTaskInBoard(prev, taskId, updated));
    } catch (e) {
      setBoardData(snapshot);
      toastError(e instanceof Error ? e.message : String(e));
    }
  }
  async function moveTaskInPreview(previewBoardId, taskId, columnId) {
    const snapshot = boardPreviews[previewBoardId];
    if (!snapshot) return;
    const task = snapshot.tasks.find((t) => t.id === taskId);
    if (!task || task.columnId === columnId) return;
    const doneCol = snapshot.columns.find((c) => c.columnKey === "done");
    const completedAt = doneCol && columnId === doneCol.id ? (/* @__PURE__ */ new Date()).toISOString() : null;
    setBoardPreviews((prev) => {
      const current = prev[previewBoardId];
      if (!current) return prev;
      return {
        ...prev,
        [previewBoardId]: patchTaskInBoard(current, taskId, { columnId, completedAt })
      };
    });
    if (boardDataRef.current?.board?.id === previewBoardId) {
      setBoardData((prev) => patchTaskInBoard(prev, taskId, { columnId, completedAt }));
    }
    try {
      const updated = await updateTodoTask(taskId, { columnId });
      setBoardPreviews((prev) => {
        const current = prev[previewBoardId];
        if (!current) return prev;
        return { ...prev, [previewBoardId]: replaceTaskInBoard(current, taskId, updated) };
      });
      if (boardDataRef.current?.board?.id === previewBoardId) {
        setBoardData((prev) => replaceTaskInBoard(prev, taskId, updated));
      }
    } catch (e) {
      setBoardPreviews((prev) => ({ ...prev, [previewBoardId]: snapshot }));
      if (boardDataRef.current?.board?.id === previewBoardId) {
        setBoardData(snapshot);
      }
      toastError(e instanceof Error ? e.message : String(e));
    }
  }
  function onDragStart(taskId) {
    dragTaskId.current = taskId;
  }
  function onPreviewDragStart(previewBoardId, taskId) {
    previewDragRef.current = { boardId: previewBoardId, taskId };
  }
  function onDropColumn(columnId) {
    const taskId = dragTaskId.current;
    dragTaskId.current = null;
    if (!taskId) return;
    void moveTask(taskId, columnId);
  }
  function onPreviewDropColumn(previewBoardId, columnId) {
    const drag = previewDragRef.current;
    previewDragRef.current = null;
    if (!drag || drag.boardId !== previewBoardId) return;
    void moveTaskInPreview(previewBoardId, drag.taskId, columnId);
  }
  function syncBoardMembers(members) {
    setBoardData((prev) => prev ? { ...prev, members } : prev);
  }
  const canEdit = !!boardData?.board && (boardData.board.canEdit ?? (boardData.board.isAdmin || boardData.board.myRole === "editor"));
  const inBoardView = !!boardId;
  return {
    loggedIn,
    boards,
    boardPreviews,
    loadingPreviews,
    boardId,
    inBoardView,
    boardData,
    canEdit,
    loadingBoards,
    loadingBoard,
    error,
    selectedTask,
    taskLoading,
    newBoardOpen,
    setNewBoardOpen,
    selectBoard,
    goHome,
    reloadBoards: loadBoards,
    onCreateBoard,
    onUpdateBoard,
    onDeleteBoard,
    onQuickAddTask,
    openTask,
    openTaskFromPreview,
    closeTask: () => setSelectedTask(null),
    saveTask,
    saveSubtask,
    deleteSubtask,
    saveMilestone,
    deleteMilestone,
    addSubtask,
    addMilestone,
    toggleMilestone,
    postComment,
    onDragStart,
    onDropColumn,
    onPreviewDragStart,
    onPreviewDropColumn,
    reload: () => boardId && loadBoard(boardId),
    syncBoardMembers
  };
}

// js/tools/todos/TaskAssigneeLabel.jsx
import { jsx as jsx26 } from "react/jsx-runtime";
var { Typography: Typography13 } = getMaterialUI();
function TaskAssigneeLabel({ assignedTo }) {
  const theme2 = assigneeTheme(assignedTo);
  const empty = !String(assignedTo ?? "").trim();
  return /* @__PURE__ */ jsx26(
    Typography13,
    {
      className: `paty-todos-card__assignee${empty ? " paty-todos-card__assignee--empty" : ""}`,
      component: "div",
      variant: "caption",
      style: {
        "--assignee-fg": theme2.fg,
        "--assignee-bg": theme2.bg
      },
      children: theme2.label
    }
  );
}

// js/tools/todos/TodosKanban.jsx
import { Fragment as Fragment9, jsx as jsx27, jsxs as jsxs23 } from "react/jsx-runtime";
var { useState: useState16, useMemo: useMemo12, useRef: useRef8, useEffect: useEffect14, memo: memo2 } = getReact();
var { Box: Box14, Paper: Paper2, Typography: Typography14, TextField: TextField8, Button: Button10, Stack: Stack11, Chip: Chip9 } = getMaterialUI();
var { Icon: Icon10 } = UI;
var DRAG_THRESHOLD_PX = 6;
var COLUMN_THEME = {
  pending: {
    className: "paty-todos-column--pending",
    accent: "#1e90ff",
    icon: "mdi:clock-outline"
  },
  done: {
    className: "paty-todos-column--done",
    accent: "#10b981",
    icon: "mdi:check-circle-outline"
  }
};
function themeForColumn(columnKey) {
  return COLUMN_THEME[columnKey] ?? {
    className: "paty-todos-column--default",
    accent: "#94a3b8",
    icon: "mdi:view-column"
  };
}
function columnAtPoint(columnIds, listRefs, clientX, clientY) {
  for (const colId of columnIds) {
    const el = listRefs.current[colId];
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
      return colId;
    }
  }
  return null;
}
function TaskCardBody({ task }) {
  const modDate = formatTaskDate(taskModDate(task));
  return /* @__PURE__ */ jsxs23(Fragment9, { children: [
    /* @__PURE__ */ jsx27(Typography14, { className: "paty-todos-card__title", component: "div", variant: "body2", children: task.title }),
    /* @__PURE__ */ jsx27(TaskAssigneeLabel, { assignedTo: task.assignedTo }),
    /* @__PURE__ */ jsx27(Typography14, { className: "paty-todos-card__date paty-todos-card__date--bottom", component: "div", variant: "caption", color: "text.secondary", children: modDate })
  ] });
}
function DragGhost({ task, x, y, width }) {
  if (!task) return null;
  return /* @__PURE__ */ jsx27(
    Paper2,
    {
      className: "paty-todos-card paty-todos-card--ghost isa-glass-card",
      elevation: 8,
      style: {
        position: "fixed",
        left: x,
        top: y,
        width,
        zIndex: 1e4,
        pointerEvents: "none"
      },
      "aria-hidden": true,
      children: /* @__PURE__ */ jsx27(TaskCardBody, { task })
    }
  );
}
var TaskCard = memo2(function TaskCard2({
  task,
  columnId,
  readOnly,
  isOptimistic,
  isDragSource,
  onOpen,
  onPointerDragStart,
  suppressClickRef
}) {
  const canDrag = !readOnly && !isOptimistic;
  return /* @__PURE__ */ jsx27(
    Paper2,
    {
      className: `paty-todos-card isa-glass-card${isOptimistic ? " paty-todos-card--optimistic" : ""}${canDrag ? " paty-todos-card--draggable" : ""}${isDragSource ? " paty-todos-card--drag-source" : ""}`,
      elevation: 0,
      onPointerDown: (e) => {
        if (!canDrag) return;
        if (e.button !== 0 && e.pointerType !== "touch") return;
        onPointerDragStart(task.id, columnId, e);
      },
      onClick: () => {
        if (suppressClickRef.current) {
          suppressClickRef.current = false;
          return;
        }
        onOpen(task.id);
      },
      role: "button",
      tabIndex: 0,
      onKeyDown: (e) => {
        if (e.key === "Enter") onOpen(task.id);
      },
      children: /* @__PURE__ */ jsx27(TaskCardBody, { task })
    }
  );
});
function ColumnAddForm({ onAdd }) {
  const [open, setOpen] = useState16(false);
  const [title, setTitle] = useState16("");
  if (!open) {
    return /* @__PURE__ */ jsx27(
      Button10,
      {
        fullWidth: true,
        size: "small",
        className: "paty-todos-add-card",
        startIcon: /* @__PURE__ */ jsx27(Icon10, { icon: "mdi:plus", size: 16 }),
        onClick: () => setOpen(true),
        sx: { justifyContent: "flex-start", color: "text.secondary" },
        children: "A\xF1adir tarjeta"
      }
    );
  }
  return /* @__PURE__ */ jsxs23(Box14, { className: "paty-todos-add-card", children: [
    /* @__PURE__ */ jsx27(
      TextField8,
      {
        autoFocus: true,
        fullWidth: true,
        size: "small",
        multiline: true,
        minRows: 2,
        placeholder: "T\xEDtulo de la tarea\u2026",
        value: title,
        onChange: (e) => setTitle(e.target.value),
        onKeyDown: (e) => {
          if (e.key === "Enter" && !e.shiftKey && title.trim()) {
            e.preventDefault();
            onAdd(title.trim());
            setTitle("");
            setOpen(false);
          }
          if (e.key === "Escape") setOpen(false);
        }
      }
    ),
    /* @__PURE__ */ jsxs23(Stack11, { direction: "row", spacing: 1, sx: { mt: 1 }, children: [
      /* @__PURE__ */ jsx27(
        Button10,
        {
          variant: "contained",
          size: "small",
          disabled: !title.trim(),
          onClick: () => {
            onAdd(title.trim());
            setTitle("");
            setOpen(false);
          },
          children: "A\xF1adir"
        }
      ),
      /* @__PURE__ */ jsx27(Button10, { size: "small", onClick: () => {
        setOpen(false);
        setTitle("");
      }, children: "Cancelar" })
    ] })
  ] });
}
function TodosKanban({ boardData, readOnly = false, preview = false, onOpenTask, onQuickAdd, onDragStart, onDropColumn }) {
  const [dragOverCol, setDragOverCol] = useState16(null);
  const [draggingTaskId, setDraggingTaskId] = useState16(null);
  const [dragGhost, setDragGhost] = useState16(null);
  const [expandedCols, setExpandedCols] = useState16(() => /* @__PURE__ */ new Set());
  const listRefs = useRef8({});
  const dragRef = useRef8(null);
  const cardElRef = useRef8(null);
  const suppressClickRef = useRef8(false);
  const tasksByColumn = useMemo12(() => groupTasksByColumn(boardData), [boardData]);
  const ghostTask = useMemo12(() => {
    if (!dragGhost?.taskId) return null;
    return boardData?.tasks?.find((t) => t.id === dragGhost.taskId) ?? null;
  }, [dragGhost, boardData?.tasks]);
  const columnIds = useMemo12(
    () => (boardData?.columns ?? []).map((c) => c.id),
    [boardData?.columns]
  );
  function finishDrag(clientX, clientY) {
    const state = dragRef.current;
    dragRef.current = null;
    setDraggingTaskId(null);
    setDragOverCol(null);
    setDragGhost(null);
    cardElRef.current = null;
    if (!state?.moved) return;
    suppressClickRef.current = true;
    const targetCol = columnAtPoint(columnIds, listRefs, clientX, clientY);
    if (targetCol && targetCol !== state.sourceColumnId) {
      onDropColumn(targetCol);
    }
  }
  function handlePointerDragStart(taskId, sourceColumnId, e) {
    if (readOnly) return;
    onDragStart(taskId);
    dragRef.current = {
      taskId,
      sourceColumnId,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
      pointerId: e.pointerId
    };
    cardElRef.current = e.currentTarget;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
    }
  }
  useEffect14(() => {
    if (readOnly) return void 0;
    function onPointerMove(e) {
      const state = dragRef.current;
      if (!state || e.pointerId !== state.pointerId) return;
      const dx = Math.abs(e.clientX - state.startX);
      const dy = Math.abs(e.clientY - state.startY);
      if (!state.moved && dx + dy < DRAG_THRESHOLD_PX) return;
      if (!state.moved) {
        state.moved = true;
        setDraggingTaskId(state.taskId);
        const rect = cardElRef.current?.getBoundingClientRect();
        if (rect) {
          state.offsetX = e.clientX - rect.left;
          state.offsetY = e.clientY - rect.top;
          state.ghostWidth = rect.width;
          setDragGhost({
            taskId: state.taskId,
            x: rect.left,
            y: rect.top,
            width: rect.width
          });
        }
      }
      e.preventDefault();
      if (state.ghostWidth != null) {
        setDragGhost({
          taskId: state.taskId,
          x: e.clientX - state.offsetX,
          y: e.clientY - state.offsetY,
          width: state.ghostWidth
        });
      }
      const colId = columnAtPoint(columnIds, listRefs, e.clientX, e.clientY);
      setDragOverCol(colId);
    }
    function onPointerUp(e) {
      const state = dragRef.current;
      if (!state || e.pointerId !== state.pointerId) return;
      finishDrag(e.clientX, e.clientY);
    }
    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [readOnly, columnIds, onDropColumn]);
  if (!boardData) return null;
  const { columns } = boardData;
  const fullBoard = !preview;
  return /* @__PURE__ */ jsxs23(
    Box14,
    {
      className: `paty-todos-kanban-wrap${readOnly && !preview ? " paty-todos-kanban-wrap--readonly" : ""}`,
      sx: fullBoard ? { flex: 1, minHeight: 0, height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", p: 0 } : void 0,
      children: [
        readOnly && !preview ? /* @__PURE__ */ jsx27(
          Chip9,
          {
            size: "small",
            className: "paty-todos-kanban__readonly-chip",
            label: "Solo lectura",
            icon: /* @__PURE__ */ jsx27(Icon10, { icon: "mdi:eye-outline", size: 14 }),
            sx: { alignSelf: "flex-start", width: "auto", flex: "0 0 auto", ml: "18px", mt: 1.5 }
          }
        ) : null,
        /* @__PURE__ */ jsxs23(
          Box14,
          {
            className: `paty-todos-kanban${preview ? " paty-todos-kanban--preview" : ""}${draggingTaskId ? " paty-todos-kanban--dragging" : ""}`,
            sx: fullBoard ? { flex: 1, minHeight: 0, height: "100%", display: "flex", alignItems: "stretch", alignSelf: "stretch" } : void 0,
            children: [
              dragGhost ? /* @__PURE__ */ jsx27(DragGhost, { task: ghostTask, x: dragGhost.x, y: dragGhost.y, width: dragGhost.width }) : null,
              columns.map((col) => {
                const colTasks = tasksByColumn.get(col.id) ?? [];
                const isExpanded = expandedCols.has(col.id);
                const hasMore = colTasks.length > MAX_COLUMN_TASKS;
                const visibleTasks = isExpanded || !hasMore ? colTasks : colTasks.slice(0, MAX_COLUMN_TASKS);
                const hiddenCount = hasMore && !isExpanded ? colTasks.length - MAX_COLUMN_TASKS : 0;
                const isOver = dragOverCol === col.id;
                const theme2 = themeForColumn(col.columnKey);
                return /* @__PURE__ */ jsxs23(
                  Box14,
                  {
                    className: `paty-todos-column ${theme2.className}`,
                    style: { "--col-accent": theme2.accent },
                    children: [
                      /* @__PURE__ */ jsxs23(
                        Stack11,
                        {
                          direction: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          spacing: 1,
                          className: "paty-todos-column__head",
                          sx: { flexShrink: 0, px: 1.75, py: 1.25, pb: 1 },
                          children: [
                            /* @__PURE__ */ jsxs23(Stack11, { direction: "row", alignItems: "center", spacing: 0.75, className: "paty-todos-column__title", sx: { minWidth: 0, flex: 1 }, children: [
                              /* @__PURE__ */ jsx27(Icon10, { icon: theme2.icon, size: 16 }),
                              /* @__PURE__ */ jsx27(Box14, { component: "span", sx: { display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 700 }, title: col.title, children: col.title })
                            ] }),
                            /* @__PURE__ */ jsx27(
                              Box14,
                              {
                                component: "span",
                                className: "paty-todos-column__count",
                                sx: { display: "inline-flex", alignItems: "center", justifyContent: "center", lineHeight: 1, height: 22, minWidth: 22, px: 1, boxSizing: "border-box", flexShrink: 0 },
                                children: colTasks.length
                              }
                            )
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxs23(
                        Stack11,
                        {
                          ref: (el) => {
                            listRefs.current[col.id] = el;
                          },
                          "data-column-id": col.id,
                          spacing: fullBoard ? 0.75 : 1.25,
                          className: `paty-todos-column__list${isOver ? " paty-todos-column__list--drag-over" : ""}`,
                          sx: {
                            flex: 1,
                            minHeight: fullBoard ? 0 : 56,
                            overflowY: "auto",
                            overflowX: "hidden",
                            p: 1.25,
                            px: 1.5,
                            boxSizing: "border-box"
                          },
                          children: [
                            visibleTasks.map((task) => /* @__PURE__ */ jsx27(
                              TaskCard,
                              {
                                task,
                                columnId: col.id,
                                readOnly,
                                isOptimistic: String(task.id).startsWith("optimistic-"),
                                isDragSource: draggingTaskId === task.id,
                                onOpen: onOpenTask,
                                onPointerDragStart: handlePointerDragStart,
                                suppressClickRef
                              },
                              task.id
                            )),
                            hiddenCount > 0 ? /* @__PURE__ */ jsxs23(
                              Button10,
                              {
                                fullWidth: true,
                                size: "small",
                                className: "paty-todos-column__show-all",
                                onClick: () => setExpandedCols((prev) => new Set(prev).add(col.id)),
                                children: [
                                  "Ver todo (",
                                  colTasks.length,
                                  ")"
                                ]
                              }
                            ) : null,
                            isExpanded && hasMore ? /* @__PURE__ */ jsx27(
                              Button10,
                              {
                                fullWidth: true,
                                size: "small",
                                className: "paty-todos-column__show-all",
                                onClick: () => setExpandedCols((prev) => {
                                  const next = new Set(prev);
                                  next.delete(col.id);
                                  return next;
                                }),
                                children: "Ver menos"
                              }
                            ) : null
                          ]
                        }
                      ),
                      !readOnly && !preview && col.columnKey === "pending" ? /* @__PURE__ */ jsx27(ColumnAddForm, { onAdd: (title) => onQuickAdd(col.id, title) }) : null
                    ]
                  },
                  col.id
                );
              })
            ]
          }
        )
      ]
    }
  );
}

// js/tools/todos/UserAssignAutocomplete.jsx
import { jsx as jsx28 } from "react/jsx-runtime";
import { createElement as createElement3 } from "react";
var { useState: useState17, useEffect: useEffect15, useRef: useRef9, useCallback: useCallback9 } = getReact();
var { Autocomplete: Autocomplete2, TextField: TextField9, Typography: Typography15, Box: Box15 } = getMaterialUI();
var DEBOUNCE_MS2 = 300;
function optionLabel(row) {
  if (!row) return "";
  return row.displayName ? `${row.displayName} (${row.username})` : row.username;
}
function UserAssignAutocomplete({ value, onChange, disabled = false, label = "Asignado a", compact = false }) {
  const username = value ? normalizeAssigneeUsername(value) : null;
  const [inputValue, setInputValue] = useState17("");
  const [options, setOptions] = useState17([]);
  const [loading, setLoading] = useState17(false);
  const [invalidHint, setInvalidHint] = useState17("");
  const debounceRef = useRef9(null);
  const requestIdRef = useRef9(0);
  const resolveAttemptRef = useRef9("");
  const selected = username ? options.find((o) => o.username === username) ?? null : null;
  const runSearch = useCallback9(async (query) => {
    const id = ++requestIdRef.current;
    setLoading(true);
    try {
      const users = await searchScrumAppUsers(query, 12);
      if (id !== requestIdRef.current) return;
      setOptions(users);
      return users;
    } catch {
      if (id === requestIdRef.current) setOptions([]);
      return [];
    } finally {
      if (id === requestIdRef.current) setLoading(false);
    }
  }, []);
  const scheduleSearch = useCallback9((query) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runSearch(query);
    }, DEBOUNCE_MS2);
  }, [runSearch]);
  useEffect15(() => {
    if (!username) {
      resolveAttemptRef.current = "";
      setInputValue("");
      setInvalidHint("");
      return;
    }
    if (value && username !== value) {
      onChange(username);
      return;
    }
    const match = options.find((o) => o.username === username);
    if (match) {
      setInputValue(optionLabel(match));
      setInvalidHint("");
      return;
    }
    if (resolveAttemptRef.current === username) return;
    resolveAttemptRef.current = username;
    let cancelled = false;
    runSearch(username).then((users) => {
      if (cancelled) return;
      const resolved = users?.find((u) => u.username === username);
      if (resolved) {
        setOptions((prev) => prev.some((o) => o.username === resolved.username) ? prev : [...prev, resolved]);
        setInputValue(optionLabel(resolved));
        setInvalidHint("");
      } else {
        setInputValue("");
        setInvalidHint(`"${username}" no est\xE1 registrado en isa-patyia`);
        onChange(null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [value, username, options, runSearch, onChange]);
  useEffect15(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);
  useEffect15(() => {
    if (disabled) return;
    runSearch("");
  }, [disabled, runSearch]);
  if (disabled) {
    return /* @__PURE__ */ jsx28(
      TextField9,
      {
        label,
        fullWidth: true,
        size: "small",
        value: username || "",
        disabled: true,
        placeholder: "Sin asignar"
      }
    );
  }
  return /* @__PURE__ */ jsx28(
    Autocomplete2,
    {
      fullWidth: true,
      size: "small",
      openOnFocus: true,
      autoHighlight: true,
      clearOnBlur: false,
      freeSolo: false,
      selectOnFocus: true,
      handleHomeEndKeys: true,
      loading,
      options,
      value: selected,
      inputValue,
      filterOptions: (x) => x,
      getOptionLabel: optionLabel,
      isOptionEqualToValue: (a, b) => String(a?.username) === String(b?.username),
      noOptionsText: loading ? "Buscando\u2026" : "Sin usuarios registrados",
      loadingText: "Buscando\u2026",
      onOpen: () => {
        if (!options.length) runSearch(inputValue);
      },
      onInputChange: (_e, text, reason) => {
        if (reason === "reset") return;
        setInputValue(text);
        setInvalidHint("");
        scheduleSearch(text);
      },
      onChange: (_e, row) => {
        onChange(row?.username ?? null);
        setInputValue(row ? optionLabel(row) : "");
        setInvalidHint("");
      },
      renderOption: (props, row) => /* @__PURE__ */ createElement3(Box15, { component: "li", ...props, key: row.username, sx: { display: "flex", flexDirection: "column", py: 0.75 } }, /* @__PURE__ */ jsx28(Typography15, { variant: "body2", sx: { fontWeight: 600 }, children: row.displayName || row.username }), row.displayName ? /* @__PURE__ */ jsx28(Typography15, { variant: "caption", color: "text.secondary", children: row.username }) : null),
      renderInput: (params) => /* @__PURE__ */ jsx28(
        TextField9,
        {
          ...params,
          label,
          placeholder: "Buscar integrante\u2026",
          error: !!invalidHint,
          helperText: invalidHint || (compact ? void 0 : "Solo usuarios registrados en isa-patyia")
        }
      )
    }
  );
}

// js/api/treeMsgsApi.ts
var treeHttp = window.ISAFront.createCapFetch({
  Session,
  Config,
  getApiBase: () => ORCH_ONLINE.replace(/\/$/, ""),
  localDirect: [
    {
      test: (p) => {
        const n = p.startsWith("/") ? p : `/${p}`;
        return n.startsWith("/tree-msgs") || n.startsWith("/api/tree-msgs");
      },
      base: TREE_MSGS_LOCAL
    }
  ],
  orchOnlineInLocal: false,
  isLocal: isLocalMode,
  handleApiError,
  clearSession
});
function qs2(app, extra = {}) {
  return `?${new URLSearchParams({ app, ...extra }).toString()}`;
}
async function listTreeMessages(app, contextKey) {
  const data = await treeHttp.capFetch(
    `/tree-msgs${qs2(app, { context: contextKey })}`,
    { method: "GET" }
  );
  return data.messages ?? [];
}
async function postTreeMessage(app, payload) {
  const data = await treeHttp.capFetch(`/tree-msgs${qs2(app)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return data.message;
}
async function deleteTreeMessage(app, contextKey, treePath) {
  const data = await treeHttp.capFetch(
    `/tree-msgs/${encodeURIComponent(treePath)}${qs2(app, { context: contextKey })}`,
    { method: "DELETE" }
  );
  return data.message;
}
function scrumTaskContext(taskId) {
  return `scrum-task:${taskId}`;
}

// js/tools/todos/treePathUtils.js
function pathDepth(path) {
  return String(path || "").split(".").filter(Boolean).length;
}

// js/tools/todos/TaskConvoThread.jsx
import { jsx as jsx29, jsxs as jsxs24 } from "react/jsx-runtime";
var { useState: useState18, useEffect: useEffect16, useCallback: useCallback10 } = getReact();
var {
  Box: Box16,
  Stack: Stack12,
  Typography: Typography16,
  Button: Button11,
  IconButton: IconButton7,
  Tooltip: Tooltip6,
  CircularProgress: CircularProgress8,
  Alert: Alert9
} = getMaterialUI();
var { Icon: Icon11 } = UI;
function formatMsgDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return String(iso);
  }
}
function quotedSnippet(messages, quotePath) {
  if (!quotePath) return "";
  const found = messages.find((m) => m.treePath === quotePath);
  if (!found?.body) return "";
  const t = found.body.trim();
  return t.length > 120 ? `${t.slice(0, 120)}\u2026` : t;
}
function MessageBubble({ msg, messages, readOnly, busy, onReply, onQuote, onDelete }) {
  const depth = Math.max(0, pathDepth(msg.treePath) - 1);
  const author = msg.jlog?.author || "\u2014";
  const quote = msg.jlog?.quotePath ? quotedSnippet(messages, msg.jlog.quotePath) : "";
  return /* @__PURE__ */ jsxs24(
    Box16,
    {
      className: `paty-task-msg paty-task-msg--${msg.jlog?.kind || "message"}`,
      sx: { ml: depth * 2.5, pl: 1.5, borderLeft: depth ? 2 : 0, borderColor: "divider" },
      children: [
        /* @__PURE__ */ jsxs24(Stack12, { direction: "row", spacing: 1, alignItems: "center", sx: { mb: 0.5 }, children: [
          /* @__PURE__ */ jsx29(Typography16, { variant: "caption", sx: { fontWeight: 700 }, children: author }),
          /* @__PURE__ */ jsx29(Typography16, { variant: "caption", color: "text.secondary", children: formatMsgDate(msg.updatedAt || msg.createdAt) }),
          msg.jlog?.kind === "reply" && msg.jlog?.replyToPath ? /* @__PURE__ */ jsxs24(Typography16, { variant: "caption", color: "text.secondary", children: [
            "\u21A9 ",
            msg.jlog.replyToPath
          ] }) : null
        ] }),
        quote ? /* @__PURE__ */ jsxs24(Box16, { className: "paty-task-msg__quote", children: [
          /* @__PURE__ */ jsxs24(Typography16, { variant: "caption", color: "text.secondary", sx: { display: "block", mb: 0.5 }, children: [
            "Cita ",
            msg.jlog.quotePath
          ] }),
          /* @__PURE__ */ jsx29(Typography16, { variant: "body2", color: "text.secondary", sx: { fontStyle: "italic" }, children: quote })
        ] }) : null,
        msg.body.trim() ? /* @__PURE__ */ jsx29(
          Box16,
          {
            className: "paty-task-msg__body prompt-md-preview msg-body",
            dangerouslySetInnerHTML: { __html: mdToHtml(msg.body) }
          }
        ) : /* @__PURE__ */ jsx29(Typography16, { variant: "body2", color: "text.secondary", children: "(sin texto)" }),
        !readOnly ? /* @__PURE__ */ jsxs24(Stack12, { direction: "row", spacing: 0.5, sx: { mt: 0.75 }, children: [
          /* @__PURE__ */ jsx29(Tooltip6, { title: "Responder", children: /* @__PURE__ */ jsx29(IconButton7, { size: "small", disabled: busy, onClick: () => onReply(msg), "aria-label": "Responder", children: /* @__PURE__ */ jsx29(Icon11, { icon: "mdi:reply-outline", size: 16 }) }) }),
          /* @__PURE__ */ jsx29(Tooltip6, { title: "Citar", children: /* @__PURE__ */ jsx29(IconButton7, { size: "small", disabled: busy, onClick: () => onQuote(msg), "aria-label": "Citar", children: /* @__PURE__ */ jsx29(Icon11, { icon: "mdi:format-quote-close-outline", size: 16 }) }) }),
          /* @__PURE__ */ jsx29(Tooltip6, { title: "Eliminar (soft)", children: /* @__PURE__ */ jsx29(IconButton7, { size: "small", color: "error", disabled: busy, onClick: () => onDelete(msg), "aria-label": "Eliminar", children: /* @__PURE__ */ jsx29(Icon11, { icon: "mdi:delete-outline", size: 16 }) }) })
        ] }) : null
      ]
    }
  );
}
function TaskConvoThread({ contextKey, readOnly = false, appId = SCRUM_APP_ID }) {
  const [messages, setMessages] = useState18([]);
  const [loading, setLoading] = useState18(true);
  const [busy, setBusy] = useState18(false);
  const [error, setError] = useState18("");
  const [draft, setDraft] = useState18("");
  const [replyTo, setReplyTo] = useState18(null);
  const [quotePath, setQuotePath] = useState18(null);
  const reload = useCallback10(async () => {
    if (!contextKey) return;
    setLoading(true);
    setError("");
    try {
      const list = await listTreeMessages(appId, contextKey);
      setMessages(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [appId, contextKey]);
  useEffect16(() => {
    reload();
  }, [reload]);
  async function run(fn) {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  }
  async function handlePost() {
    const text = draft.trim();
    if (!text || !contextKey) return;
    await run(async () => {
      await postTreeMessage(appId, {
        context: contextKey,
        body: text,
        parentPath: replyTo?.treePath ?? null,
        replyToPath: replyTo?.treePath ?? null,
        quotePath
      });
      setDraft("");
      setReplyTo(null);
      setQuotePath(null);
      await reload();
    });
  }
  if (!contextKey) return null;
  return /* @__PURE__ */ jsxs24(Box16, { className: "paty-task-convo", children: [
    /* @__PURE__ */ jsx29(Typography16, { variant: "caption", color: "text.secondary", sx: { mb: 0.75, display: "block", flexShrink: 0 }, children: "Conversaci\xF3n" }),
    error ? /* @__PURE__ */ jsxs24(Alert9, { severity: "warning", sx: { mb: 1, flexShrink: 0 }, children: [
      "No se pudo cargar el hilo: ",
      error
    ] }) : null,
    /* @__PURE__ */ jsxs24(Box16, { className: "paty-task-convo__thread custom-scrollbar", children: [
      loading ? /* @__PURE__ */ jsx29(Box16, { sx: { display: "flex", justifyContent: "center", py: 3 }, children: /* @__PURE__ */ jsx29(CircularProgress8, { size: 24 }) }) : null,
      !loading && !messages.length && !error ? /* @__PURE__ */ jsx29(Typography16, { variant: "body2", color: "text.secondary", sx: { py: 2 }, children: "Sin mensajes publicados." }) : null,
      !loading && messages.length ? /* @__PURE__ */ jsx29(Stack12, { spacing: 1.5, sx: { py: 0.5 }, children: messages.map((msg) => /* @__PURE__ */ jsx29(
        MessageBubble,
        {
          msg,
          messages,
          readOnly,
          busy,
          onReply: (m) => {
            setReplyTo(m);
            setQuotePath(null);
          },
          onQuote: (m) => {
            setQuotePath(m.treePath);
            setReplyTo(m);
          },
          onDelete: (m) => run(async () => {
            await deleteTreeMessage(appId, contextKey, m.treePath);
            await reload();
          })
        },
        msg.treePath
      )) }) : null
    ] }),
    !readOnly ? /* @__PURE__ */ jsxs24(Box16, { className: "paty-task-convo__composer", children: [
      replyTo ? /* @__PURE__ */ jsxs24(Stack12, { direction: "row", spacing: 1, alignItems: "center", sx: { mb: 1 }, children: [
        /* @__PURE__ */ jsxs24(Typography16, { variant: "caption", color: "text.secondary", children: [
          "Respondiendo a ",
          replyTo.jlog?.author || replyTo.treePath,
          quotePath ? ` \xB7 citando ${quotePath}` : ""
        ] }),
        /* @__PURE__ */ jsx29(Button11, { size: "small", onClick: () => {
          setReplyTo(null);
          setQuotePath(null);
        }, children: "Cancelar" })
      ] }) : null,
      /* @__PURE__ */ jsx29(Box16, { className: "paty-task-convo__editor paty-task-convo__editor--reply", children: /* @__PURE__ */ jsx29(
        PromptBodyEditor,
        {
          body: draft,
          canEdit: !busy,
          editBlockReason: readOnly ? "Solo lectura" : "No disponible",
          onChange: setDraft,
          placeholder: "Nuevo mensaje en Markdown\u2026 (doble clic para editar)",
          title: "Nuevo mensaje",
          loading: false
        }
      ) }),
      /* @__PURE__ */ jsxs24(Stack12, { direction: "row", spacing: 1, alignItems: "center", justifyContent: "flex-end", sx: { mt: 1 }, children: [
        /* @__PURE__ */ jsxs24(Typography16, { variant: "caption", color: "text.secondary", sx: { mr: "auto" }, children: [
          "Autor: ",
          Session.username() || "\u2014"
        ] }),
        /* @__PURE__ */ jsx29(Button11, { variant: "contained", disabled: busy || !draft.trim(), onClick: handlePost, children: "Publicar" })
      ] })
    ] }) : null
  ] });
}

// js/tools/todos/TaskDetailDialog.jsx
import { jsx as jsx30, jsxs as jsxs25 } from "react/jsx-runtime";
var { useState: useState19, useEffect: useEffect17, useRef: useRef10 } = getReact();
var {
  Dialog: Dialog6,
  DialogTitle: DialogTitle6,
  DialogContent: DialogContent8,
  DialogActions: DialogActions6,
  Button: Button12,
  TextField: TextField10,
  Stack: Stack13,
  Typography: Typography17,
  Tabs: Tabs3,
  Tab: Tab3,
  Box: Box17,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel: FormControlLabel2,
  CircularProgress: CircularProgress9,
  Chip: Chip10,
  Divider: Divider5,
  IconButton: IconButton8,
  Tooltip: Tooltip7
} = getMaterialUI();
var { Icon: Icon12 } = UI;
function formatShortId(id) {
  const s = String(id ?? "");
  if (s.length <= 5) return s;
  return `\u2026${s.slice(-5)}`;
}
function formatDt(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return String(iso);
  }
}
function toDateInputValue(value) {
  if (!value) return "";
  const s = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  try {
    return new Date(s).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}
function SubtaskEditor({ subtask, readOnly, busy, onSave, onDelete }) {
  const [title, setTitle] = useState19(subtask.title);
  const [doc, setDoc] = useState19(subtask.descriptionDoc || "");
  useEffect17(() => {
    setTitle(subtask.title);
    setDoc(subtask.descriptionDoc || "");
  }, [subtask.id, subtask.title, subtask.descriptionDoc]);
  return /* @__PURE__ */ jsxs25(Accordion, { className: "paty-todos-subtask-acc", disableGutters: true, children: [
    /* @__PURE__ */ jsx30(AccordionSummary, { expandIcon: /* @__PURE__ */ jsx30(Icon12, { icon: "mdi:chevron-down", size: 18 }), children: readOnly ? /* @__PURE__ */ jsx30(Typography17, { variant: "body2", sx: { fontWeight: 600 }, children: subtask.title }) : /* @__PURE__ */ jsx30(
      TextField10,
      {
        size: "small",
        fullWidth: true,
        value: title,
        onChange: (e) => setTitle(e.target.value),
        onClick: (e) => e.stopPropagation(),
        onKeyDown: (e) => e.stopPropagation(),
        placeholder: "T\xEDtulo subtarea"
      }
    ) }),
    /* @__PURE__ */ jsx30(AccordionDetails, { children: /* @__PURE__ */ jsxs25(Stack13, { spacing: 1.5, children: [
      /* @__PURE__ */ jsx30(
        TextField10,
        {
          label: "Documentaci\xF3n (Markdown)",
          fullWidth: true,
          size: "small",
          multiline: true,
          minRows: 3,
          value: doc,
          onChange: (e) => setDoc(e.target.value),
          disabled: readOnly,
          placeholder: "Opcional\u2026"
        }
      ),
      !readOnly ? /* @__PURE__ */ jsxs25(Stack13, { direction: "row", spacing: 1, justifyContent: "flex-end", children: [
        /* @__PURE__ */ jsx30(
          Button12,
          {
            size: "small",
            variant: "contained",
            disabled: busy || !title.trim(),
            onClick: () => onSave(subtask.id, { title: title.trim(), descriptionDoc: doc }),
            children: "Guardar"
          }
        ),
        /* @__PURE__ */ jsx30(Tooltip7, { title: "Eliminar subtarea", children: /* @__PURE__ */ jsx30(
          IconButton8,
          {
            size: "small",
            color: "error",
            disabled: busy,
            onClick: () => onDelete(subtask.id),
            "aria-label": "Eliminar subtarea",
            children: /* @__PURE__ */ jsx30(Icon12, { icon: "mdi:delete-outline", size: 18 })
          }
        ) })
      ] }) : null
    ] }) })
  ] });
}
function MilestoneEditor({ milestone, readOnly, busy, onSave, onDelete, onToggle }) {
  const [title, setTitle] = useState19(milestone.title);
  const [dueDate, setDueDate] = useState19(toDateInputValue(milestone.dueDate));
  useEffect17(() => {
    setTitle(milestone.title);
    setDueDate(toDateInputValue(milestone.dueDate));
  }, [milestone.id, milestone.title, milestone.dueDate]);
  if (readOnly) {
    return /* @__PURE__ */ jsxs25(Stack13, { direction: "row", alignItems: "center", spacing: 1, className: "paty-todos-ms-row", children: [
      /* @__PURE__ */ jsx30(Checkbox, { checked: !!milestone.completedAt, disabled: true }),
      /* @__PURE__ */ jsxs25(Box17, { sx: { flex: 1 }, children: [
        /* @__PURE__ */ jsx30(Typography17, { variant: "body2", sx: { fontWeight: 600, textDecoration: milestone.completedAt ? "line-through" : "none" }, children: milestone.title }),
        milestone.dueDate ? /* @__PURE__ */ jsxs25(Typography17, { variant: "caption", color: "text.secondary", children: [
          "Vence: ",
          toDateInputValue(milestone.dueDate)
        ] }) : null
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs25(Stack13, { direction: { xs: "column", sm: "row" }, spacing: 1, alignItems: { sm: "center" }, className: "paty-todos-ms-row", children: [
    /* @__PURE__ */ jsx30(
      FormControlLabel2,
      {
        control: /* @__PURE__ */ jsx30(
          Checkbox,
          {
            checked: !!milestone.completedAt,
            onChange: (e) => onToggle(milestone.id, e.target.checked)
          }
        ),
        label: "",
        sx: { mr: 0 }
      }
    ),
    /* @__PURE__ */ jsx30(
      TextField10,
      {
        size: "small",
        label: "Hito",
        value: title,
        onChange: (e) => setTitle(e.target.value),
        sx: { flex: 1 }
      }
    ),
    /* @__PURE__ */ jsx30(
      TextField10,
      {
        size: "small",
        type: "date",
        label: "Fecha",
        InputLabelProps: { shrink: true },
        value: dueDate,
        onChange: (e) => setDueDate(e.target.value),
        sx: { minWidth: 160 }
      }
    ),
    /* @__PURE__ */ jsxs25(Stack13, { direction: "row", spacing: 0.5, sx: { flexShrink: 0 }, children: [
      /* @__PURE__ */ jsx30(
        Button12,
        {
          size: "small",
          variant: "outlined",
          disabled: busy || !title.trim(),
          onClick: () => onSave(milestone.id, { title: title.trim(), dueDate: dueDate || null }),
          children: "Guardar"
        }
      ),
      /* @__PURE__ */ jsx30(Tooltip7, { title: "Eliminar hito", children: /* @__PURE__ */ jsx30(
        IconButton8,
        {
          size: "small",
          color: "error",
          disabled: busy,
          onClick: () => onDelete(milestone.id),
          "aria-label": "Eliminar hito",
          children: /* @__PURE__ */ jsx30(Icon12, { icon: "mdi:delete-outline", size: 18 })
        }
      ) })
    ] })
  ] });
}
function TaskDetailDialog({ open, task, loading, readOnly = false, onClose, onSave, onSaveSubtask, onDeleteSubtask, onAddSubtask, onSaveMilestone, onDeleteMilestone, onAddMilestone, onToggleMilestone, onComment }) {
  const [tab, setTab] = useState19(0);
  const [title, setTitle] = useState19("");
  const [doc, setDoc] = useState19("");
  const [assignedTo, setAssignedTo] = useState19(null);
  const [subtaskTitle, setSubtaskTitle] = useState19("");
  const [msTitle, setMsTitle] = useState19("");
  const [msDate, setMsDate] = useState19("");
  const [comment, setComment] = useState19("");
  const [busy, setBusy] = useState19(false);
  const prevId = useRef10(null);
  useEffect17(() => {
    if (!task || task.id === prevId.current) return;
    prevId.current = task.id;
    setTitle(task.title);
    setDoc(task.descriptionDoc || "");
    setAssignedTo(normalizeAssigneeUsername(task.assignedTo) || null);
    setTab(0);
  }, [task]);
  async function run(fn) {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  }
  if (!open) return null;
  return /* @__PURE__ */ jsxs25(
    Dialog6,
    {
      open,
      onClose,
      fullScreen: true,
      scroll: "paper",
      className: "paty-todos-task-dialog",
      children: [
        /* @__PURE__ */ jsxs25(DialogTitle6, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
          /* @__PURE__ */ jsx30(Icon12, { icon: "mdi:card-text-outline", size: 22 }),
          /* @__PURE__ */ jsx30(Typography17, { component: "span", variant: "h6", sx: { flex: 1, fontWeight: 700, lineHeight: 1.3 }, children: loading ? "Cargando\u2026" : task?.title || "Tarea" }),
          task?.id ? /* @__PURE__ */ jsx30(
            Typography17,
            {
              component: "span",
              variant: "caption",
              color: "text.secondary",
              sx: { fontFamily: "monospace", letterSpacing: "0.02em", flexShrink: 0 },
              title: task.id,
              children: formatShortId(task.id)
            }
          ) : null,
          loading ? /* @__PURE__ */ jsx30(CircularProgress9, { size: 20 }) : null
        ] }),
        /* @__PURE__ */ jsx30(DialogContent8, { dividers: true, className: "paty-todos-task-dialog__content", children: task ? /* @__PURE__ */ jsxs25(Box17, { className: "paty-todos-task-dialog__inner", children: [
          /* @__PURE__ */ jsxs25(Tabs3, { value: tab, onChange: (_, v) => setTab(v), sx: { mb: 2, flexShrink: 0 }, children: [
            /* @__PURE__ */ jsx30(Tab3, { label: "Detalle" }),
            /* @__PURE__ */ jsx30(Tab3, { label: `Subtareas (${task.subtasks?.length ?? 0})` }),
            /* @__PURE__ */ jsx30(Tab3, { label: `Hitos (${task.milestones?.length ?? 0})` }),
            /* @__PURE__ */ jsx30(Tab3, { label: "Trazabilidad" })
          ] }),
          tab === 0 ? /* @__PURE__ */ jsxs25(Stack13, { spacing: 2, className: "paty-todos-task-dialog__detail", children: [
            /* @__PURE__ */ jsxs25(Stack13, { direction: { xs: "column", sm: "row" }, spacing: 2, alignItems: "flex-start", sx: { flexShrink: 0 }, children: [
              /* @__PURE__ */ jsx30(
                TextField10,
                {
                  label: "T\xEDtulo",
                  fullWidth: true,
                  size: "small",
                  value: title,
                  onChange: (e) => setTitle(e.target.value),
                  disabled: readOnly,
                  InputLabelProps: { shrink: true },
                  sx: { flex: 1, minWidth: 0 }
                }
              ),
              /* @__PURE__ */ jsx30(Box17, { sx: { flex: 1, minWidth: 0, width: "100%" }, children: /* @__PURE__ */ jsx30(
                UserAssignAutocomplete,
                {
                  label: "Asignado a",
                  value: assignedTo,
                  disabled: readOnly,
                  compact: true,
                  onChange: setAssignedTo
                }
              ) })
            ] }),
            /* @__PURE__ */ jsxs25(Box17, { className: "paty-todos-task-objective", children: [
              /* @__PURE__ */ jsx30(Typography17, { variant: "caption", color: "text.secondary", sx: { mb: 0.75, display: "block" }, children: "Objetivo" }),
              /* @__PURE__ */ jsx30(Box17, { className: "paty-todos-task-objective__editor", children: /* @__PURE__ */ jsx30(
                PromptBodyEditor,
                {
                  body: doc,
                  canEdit: !readOnly && !busy,
                  editBlockReason: "Solo lectura",
                  onChange: setDoc,
                  onPersist: async (next) => {
                    const trimmed = String(next ?? "");
                    setDoc(trimmed);
                    if (!readOnly) {
                      await run(async () => {
                        await onSave({ descriptionDoc: trimmed });
                      });
                    }
                  },
                  placeholder: "Objetivo de la tarea en Markdown\u2026 (doble clic para editar)",
                  title: "Objetivo",
                  loading
                }
              ) })
            ] }),
            /* @__PURE__ */ jsx30(Box17, { className: "paty-todos-task-dialog__convo", children: /* @__PURE__ */ jsx30(
              TaskConvoThread,
              {
                contextKey: scrumTaskContext(task.id),
                readOnly
              }
            ) }),
            /* @__PURE__ */ jsxs25(Stack13, { direction: "row", spacing: 1, flexWrap: "wrap", sx: { flexShrink: 0 }, children: [
              /* @__PURE__ */ jsx30(Chip10, { size: "small", label: `Creada por ${task.createdBy}` }),
              task.completedAt ? /* @__PURE__ */ jsx30(Chip10, { size: "small", color: "success", label: "Finalizada" }) : null
            ] })
          ] }) : null,
          tab === 1 ? /* @__PURE__ */ jsx30(Box17, { className: "paty-todos-task-dialog__scroll", children: /* @__PURE__ */ jsxs25(Stack13, { spacing: 1, children: [
            (task.subtasks ?? []).map((st) => /* @__PURE__ */ jsx30(
              SubtaskEditor,
              {
                subtask: st,
                readOnly,
                busy,
                onSave: (id, patch) => run(() => onSaveSubtask(id, patch)),
                onDelete: (id) => run(() => onDeleteSubtask(id))
              },
              st.id
            )),
            /* @__PURE__ */ jsx30(Divider5, { sx: { my: 1 } }),
            !readOnly ? /* @__PURE__ */ jsxs25(Stack13, { direction: "row", spacing: 1, children: [
              /* @__PURE__ */ jsx30(
                TextField10,
                {
                  size: "small",
                  fullWidth: true,
                  placeholder: "Nueva subtarea\u2026",
                  value: subtaskTitle,
                  onChange: (e) => setSubtaskTitle(e.target.value),
                  onKeyDown: (e) => {
                    if (e.key === "Enter" && subtaskTitle.trim()) {
                      run(async () => {
                        await onAddSubtask(subtaskTitle);
                        setSubtaskTitle("");
                      });
                    }
                  }
                }
              ),
              /* @__PURE__ */ jsx30(
                Button12,
                {
                  variant: "contained",
                  size: "small",
                  disabled: busy || !subtaskTitle.trim(),
                  onClick: () => run(async () => {
                    await onAddSubtask(subtaskTitle);
                    setSubtaskTitle("");
                  }),
                  children: "A\xF1adir"
                }
              )
            ] }) : null
          ] }) }) : null,
          tab === 2 ? /* @__PURE__ */ jsx30(Box17, { className: "paty-todos-task-dialog__scroll", children: /* @__PURE__ */ jsxs25(Stack13, { spacing: 1.5, children: [
            (task.milestones ?? []).map((ms) => /* @__PURE__ */ jsx30(
              MilestoneEditor,
              {
                milestone: ms,
                readOnly,
                busy,
                onSave: (id, patch) => run(() => onSaveMilestone(id, patch)),
                onDelete: (id) => run(() => onDeleteMilestone(id)),
                onToggle: (id, completed) => run(() => onToggleMilestone(id, completed))
              },
              ms.id
            )),
            /* @__PURE__ */ jsx30(Divider5, { sx: { my: 1 } }),
            !readOnly ? /* @__PURE__ */ jsxs25(Stack13, { direction: { xs: "column", sm: "row" }, spacing: 1, children: [
              /* @__PURE__ */ jsx30(TextField10, { size: "small", fullWidth: true, label: "Hito", value: msTitle, onChange: (e) => setMsTitle(e.target.value) }),
              /* @__PURE__ */ jsx30(
                TextField10,
                {
                  size: "small",
                  type: "date",
                  label: "Fecha",
                  InputLabelProps: { shrink: true },
                  value: msDate,
                  onChange: (e) => setMsDate(e.target.value),
                  sx: { minWidth: 160 }
                }
              ),
              /* @__PURE__ */ jsx30(
                Button12,
                {
                  variant: "contained",
                  size: "small",
                  disabled: busy || !msTitle.trim(),
                  onClick: () => run(async () => {
                    await onAddMilestone(msTitle, msDate || null);
                    setMsTitle("");
                    setMsDate("");
                  }),
                  children: "A\xF1adir"
                }
              )
            ] }) : null
          ] }) }) : null,
          tab === 3 ? /* @__PURE__ */ jsx30(Box17, { className: "paty-todos-task-dialog__scroll", children: /* @__PURE__ */ jsxs25(Stack13, { spacing: 0, children: [
            !readOnly ? /* @__PURE__ */ jsxs25(Stack13, { direction: "row", spacing: 1, sx: { mb: 2 }, children: [
              /* @__PURE__ */ jsx30(
                TextField10,
                {
                  size: "small",
                  fullWidth: true,
                  multiline: true,
                  minRows: 2,
                  placeholder: "Comentario / nota de trazabilidad\u2026",
                  value: comment,
                  onChange: (e) => setComment(e.target.value)
                }
              ),
              /* @__PURE__ */ jsx30(
                Button12,
                {
                  variant: "outlined",
                  size: "small",
                  disabled: busy || !comment.trim(),
                  sx: { alignSelf: "flex-end" },
                  onClick: () => run(async () => {
                    await onComment(comment);
                    setComment("");
                  }),
                  children: "Registrar"
                }
              )
            ] }) : null,
            (task.events ?? []).map((ev) => /* @__PURE__ */ jsxs25(Box17, { className: "paty-todos-event", children: [
              /* @__PURE__ */ jsxs25("div", { className: "paty-todos-event__meta", children: [
                /* @__PURE__ */ jsx30("strong", { children: ev.author }),
                " \xB7 ",
                ev.eventType,
                " \xB7 ",
                formatDt(ev.createdAt)
              ] }),
              /* @__PURE__ */ jsx30("div", { children: ev.body || "\u2014" })
            ] }, ev.id)),
            !(task.events ?? []).length ? /* @__PURE__ */ jsx30(Typography17, { variant: "body2", color: "text.secondary", children: "Sin eventos a\xFAn." }) : null
          ] }) }) : null
        ] }) : /* @__PURE__ */ jsx30(Typography17, { color: "text.secondary", children: "Selecciona una tarea." }) }),
        /* @__PURE__ */ jsxs25(DialogActions6, { children: [
          /* @__PURE__ */ jsx30(Button12, { onClick: onClose, children: "Cerrar" }),
          tab === 0 && task && !readOnly ? /* @__PURE__ */ jsx30(
            Button12,
            {
              variant: "contained",
              disabled: busy || !title.trim(),
              onClick: () => run(async () => {
                await onSave({
                  title: title.trim(),
                  assignedTo: normalizeAssigneeUsername(assignedTo) || null,
                  descriptionDoc: doc
                });
              }),
              children: "Guardar"
            }
          ) : null
        ] })
      ]
    }
  );
}

// js/tools/todos/NewBoardDialog.jsx
import { jsx as jsx31, jsxs as jsxs26 } from "react/jsx-runtime";
var { useState: useState20 } = getReact();
var {
  Dialog: Dialog7,
  DialogTitle: DialogTitle7,
  DialogContent: DialogContent9,
  DialogActions: DialogActions7,
  Button: Button13,
  TextField: TextField11,
  Stack: Stack14,
  FormControl: FormControl4,
  InputLabel,
  Select: Select4,
  MenuItem: MenuItem4,
  FormHelperText,
  Chip: Chip11,
  Box: Box18
} = getMaterialUI();
var { Icon: Icon13 } = UI;
function parseMembers(raw) {
  return raw.split(/[,;\n]+/).map((s) => s.trim().toUpperCase()).filter(Boolean);
}
function NewBoardDialog({ open, onClose, onCreate, busy }) {
  const [title, setTitle] = useState20("");
  const [description, setDescription] = useState20("");
  const [visibility, setVisibility] = useState20("private");
  const [membersRaw, setMembersRaw] = useState20("");
  function reset() {
    setTitle("");
    setDescription("");
    setVisibility("private");
    setMembersRaw("");
  }
  function handleClose() {
    reset();
    onClose();
  }
  return /* @__PURE__ */ jsxs26(Dialog7, { open, onClose: handleClose, maxWidth: "sm", fullWidth: true, children: [
    /* @__PURE__ */ jsxs26(DialogTitle7, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
      /* @__PURE__ */ jsx31(Icon13, { icon: "mdi:view-column", size: 22 }),
      "Nuevo tablero SCRUM"
    ] }),
    /* @__PURE__ */ jsx31(DialogContent9, { children: /* @__PURE__ */ jsxs26(Stack14, { spacing: 2, sx: { pt: 1 }, children: [
      /* @__PURE__ */ jsx31(
        TextField11,
        {
          autoFocus: true,
          label: "T\xEDtulo",
          fullWidth: true,
          size: "small",
          value: title,
          onChange: (e) => setTitle(e.target.value)
        }
      ),
      /* @__PURE__ */ jsx31(
        TextField11,
        {
          label: "Descripci\xF3n",
          fullWidth: true,
          size: "small",
          multiline: true,
          minRows: 2,
          value: description,
          onChange: (e) => setDescription(e.target.value)
        }
      ),
      /* @__PURE__ */ jsxs26(FormControl4, { size: "small", fullWidth: true, children: [
        /* @__PURE__ */ jsx31(InputLabel, { id: "paty-board-vis-label", children: "Visibilidad" }),
        /* @__PURE__ */ jsxs26(
          Select4,
          {
            labelId: "paty-board-vis-label",
            label: "Visibilidad",
            value: visibility,
            onChange: (e) => setVisibility(e.target.value),
            children: [
              /* @__PURE__ */ jsx31(MenuItem4, { value: "private", children: "Privado \u2014 solo integrantes" }),
              /* @__PURE__ */ jsx31(MenuItem4, { value: "public", children: "P\xFAblico \u2014 equipo ISA puede editar" })
            ]
          }
        ),
        /* @__PURE__ */ jsx31(FormHelperText, { children: visibility === "public" ? "Cualquier usuario con acceso a isa-patyia puede ver y editar. El enlace p\xFAblico sigue siendo solo lectura." : "Solo integrantes y administradores ven el tablero." })
      ] }),
      /* @__PURE__ */ jsx31(
        TextField11,
        {
          label: "Integrantes adicionales",
          fullWidth: true,
          size: "small",
          multiline: true,
          minRows: 2,
          placeholder: "VIVIANA, KEVIN (separados por coma)",
          value: membersRaw,
          onChange: (e) => setMembersRaw(e.target.value),
          helperText: "T\xFA quedas como editor. Indica usuarios BD_AUTH y rol por defecto editor."
        }
      ),
      membersRaw.trim() ? /* @__PURE__ */ jsx31(Box18, { sx: { display: "flex", flexWrap: "wrap", gap: 0.5 }, children: parseMembers(membersRaw).map((u) => /* @__PURE__ */ jsx31(Chip11, { size: "small", label: u, icon: /* @__PURE__ */ jsx31(Icon13, { icon: "mdi:account", size: 14 }) }, u)) }) : null
    ] }) }),
    /* @__PURE__ */ jsxs26(DialogActions7, { children: [
      /* @__PURE__ */ jsx31(Button13, { onClick: handleClose, children: "Cancelar" }),
      /* @__PURE__ */ jsx31(
        Button13,
        {
          variant: "contained",
          disabled: busy || !title.trim(),
          onClick: async () => {
            const members = parseMembers(membersRaw).map((username) => ({
              username,
              boardRole: "editor"
            }));
            await onCreate({
              title: title.trim(),
              description: description.trim(),
              visibility,
              members
            });
            reset();
          },
          children: "Crear"
        }
      )
    ] })
  ] });
}

// js/tools/todos/PublicScrumBoard.jsx
import { jsx as jsx32, jsxs as jsxs27 } from "react/jsx-runtime";
var { useState: useState21, useEffect: useEffect18 } = getReact();
var { Box: Box19, Alert: Alert10, CircularProgress: CircularProgress10 } = getMaterialUI();
var { Icon: Icon14 } = UI;
function PublicScrumBoard({ publicSlug }) {
  const [boardData, setBoardData] = useState21(null);
  const [loading, setLoading] = useState21(true);
  const [error, setError] = useState21("");
  useEffect18(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchPublicTodoBoard(publicSlug);
        if (!cancelled) {
          setBoardData(normalizeTodoBoardData({
            board: data.board,
            columns: data.columns,
            tasks: data.tasks
          }));
        }
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : String(e);
          if (!/authorization bearer requerido/i.test(msg)) setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [publicSlug]);
  return /* @__PURE__ */ jsxs27(Box19, { className: "paty-todos-shell", children: [
    /* @__PURE__ */ jsxs27(Box19, { className: "paty-todos-toolbar", children: [
      /* @__PURE__ */ jsx32(Icon14, { icon: "mdi:view-column", size: 22 }),
      /* @__PURE__ */ jsx32("span", { className: "paty-todos-board-title", children: boardData?.board?.title || "Tablero SCRUM" })
    ] }),
    error ? /* @__PURE__ */ jsx32(Alert10, { severity: "error", sx: { m: 2 }, children: error }) : null,
    loading ? /* @__PURE__ */ jsx32(Box19, { sx: { display: "flex", justifyContent: "center", p: 4 }, children: /* @__PURE__ */ jsx32(CircularProgress10, {}) }) : /* @__PURE__ */ jsx32(
      TodosKanban,
      {
        boardData,
        readOnly: true,
        onOpenTask: () => {
        },
        onQuickAdd: () => {
        },
        onDragStart: () => {
        },
        onDropColumn: () => {
        }
      }
    )
  ] });
}

// js/tools/todos/BoardsHome.jsx
import { jsx as jsx33, jsxs as jsxs28 } from "react/jsx-runtime";
var { useState: useState22, useEffect: useEffect19, useMemo: useMemo13 } = getReact();
var { Box: Box20, Typography: Typography18, Button: Button14, Stack: Stack15, Chip: Chip12, CircularProgress: CircularProgress11, Skeleton, Accordion: Accordion2, AccordionSummary: AccordionSummary2, AccordionDetails: AccordionDetails2, IconButton: IconButton9, Tooltip: Tooltip8 } = getMaterialUI();
var { Icon: Icon15 } = UI;
function formatBoardDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("es-CO", { dateStyle: "short" });
  } catch {
    return String(iso);
  }
}
function BoardPreviewSkeleton() {
  return /* @__PURE__ */ jsx33(Box20, { className: "paty-todos-kanban paty-todos-kanban--preview paty-todos-kanban--preview-loading", children: [0, 1].map((i) => /* @__PURE__ */ jsxs28(Box20, { className: "paty-todos-column paty-todos-column--pending", children: [
    /* @__PURE__ */ jsx33(Skeleton, { variant: "rounded", height: 24, className: "paty-todos-column__head-skeleton" }),
    /* @__PURE__ */ jsxs28(Stack15, { spacing: 1, className: "paty-todos-column__list paty-todos-column__list--skeleton", children: [
      /* @__PURE__ */ jsx33(Skeleton, { variant: "rounded", height: 88 }),
      /* @__PURE__ */ jsx33(Skeleton, { variant: "rounded", height: 88 })
    ] })
  ] }, i)) });
}
function BoardAccordionRow({ board, preview, previewReady, loadingPreviews, expanded, onToggleExpand, onOpenBoard, onOpenTask, onPreviewDragStart, onPreviewDropColumn, onDeleteBoard, deleting }) {
  const deletable = canDeleteBoard(board);
  const roleChips = boardRoleChips(board);
  const canEdit = preview?.board ? canEditBoard(preview.board) : canEditBoard(board);
  function stopBubble(e) {
    e.stopPropagation();
  }
  async function handleDelete(e) {
    stopBubble(e);
    const ok = await requestConfirm({
      title: "Eliminar tablero",
      message: `\xBFEliminar el tablero "${board.title}"? Esta acci\xF3n no se puede deshacer.`,
      confirmLabel: "Eliminar",
      cancelLabel: "Cancelar"
    });
    if (!ok) return;
    await onDeleteBoard(board.id);
  }
  return /* @__PURE__ */ jsxs28(Accordion2, { expanded, onChange: (_, next) => onToggleExpand(board.id, next), className: "paty-todos-board-acc", disableGutters: true, elevation: 0, children: [
    /* @__PURE__ */ jsx33(AccordionSummary2, { expandIcon: /* @__PURE__ */ jsx33(Icon15, { icon: "mdi:chevron-down", size: 18 }), className: "paty-todos-board-acc__summary", children: /* @__PURE__ */ jsxs28(Box20, { className: "paty-todos-board-row__header paty-todos-board-row__header--acc", children: [
      /* @__PURE__ */ jsxs28(Box20, { className: "paty-todos-board-row__title-wrap", children: [
        /* @__PURE__ */ jsx33(Icon15, { icon: "mdi:view-column", size: 15 }),
        /* @__PURE__ */ jsx33(
          "span",
          {
            className: "paty-todos-board-row__title paty-todos-board-row__title--link",
            role: "link",
            tabIndex: 0,
            title: board.description ? `${board.title} \u2014 ${board.description}` : `Abrir ${board.title}`,
            onClick: (e) => {
              stopBubble(e);
              onOpenBoard(board.id);
            },
            onKeyDown: (e) => {
              if (e.key === "Enter" || e.key === " ") {
                stopBubble(e);
                onOpenBoard(board.id);
              }
            },
            children: board.title
          }
        )
      ] }),
      /* @__PURE__ */ jsxs28(Stack15, { direction: "row", spacing: 0.35, flexWrap: "nowrap", useFlexGap: true, className: "paty-todos-board-row__chips", onClick: stopBubble, children: [
        board.visibility === "public" ? /* @__PURE__ */ jsx33(
          Chip12,
          {
            size: "small",
            className: "paty-todos-board-card__chip paty-todos-board-card__chip--visibility paty-todos-board-card__chip--public",
            label: "P\xFAblico",
            icon: /* @__PURE__ */ jsx33(Icon15, { icon: "mdi:earth", size: 11 })
          }
        ) : /* @__PURE__ */ jsx33(
          Chip12,
          {
            size: "small",
            className: "paty-todos-board-card__chip paty-todos-board-card__chip--visibility",
            label: "Privado",
            icon: /* @__PURE__ */ jsx33(Icon15, { icon: "mdi:lock-outline", size: 11 })
          }
        ),
        roleChips.map((chip) => /* @__PURE__ */ jsx33(
          Chip12,
          {
            size: "small",
            className: `paty-todos-board-card__chip paty-todos-board-card__chip--${chip.variant}`,
            label: chip.label,
            variant: chip.variant === "role" ? "outlined" : "filled",
            icon: /* @__PURE__ */ jsx33(Icon15, { icon: chip.icon, size: 11 })
          },
          chip.id
        ))
      ] }),
      /* @__PURE__ */ jsxs28(Box20, { className: "paty-todos-board-row__tail", onClick: stopBubble, children: [
        /* @__PURE__ */ jsx33(Typography18, { className: "paty-todos-board-row__meta", component: "span", variant: "caption", children: formatBoardDate(board.updatedAt) }),
        deletable ? /* @__PURE__ */ jsx33(Tooltip8, { title: "Eliminar tablero (solo admin global)", children: /* @__PURE__ */ jsx33("span", { children: /* @__PURE__ */ jsx33(IconButton9, { size: "small", className: "paty-todos-board-row__delete", "aria-label": "Eliminar tablero", disabled: deleting, onClick: handleDelete, children: /* @__PURE__ */ jsx33(Icon15, { icon: "mdi:delete-outline", size: 16 }) }) }) }) : null
      ] })
    ] }) }),
    /* @__PURE__ */ jsx33(AccordionDetails2, { className: "paty-todos-board-acc__details", children: /* @__PURE__ */ jsx33(Box20, { className: "paty-todos-board-row__preview", children: !previewReady && loadingPreviews ? /* @__PURE__ */ jsx33(BoardPreviewSkeleton, {}) : preview ? /* @__PURE__ */ jsx33(
      TodosKanban,
      {
        preview: true,
        boardData: preview,
        readOnly: !canEdit,
        onOpenTask: (taskId) => onOpenTask(board.id, taskId),
        onQuickAdd: () => {
        },
        onDragStart: (taskId) => onPreviewDragStart(board.id, taskId),
        onDropColumn: (columnId) => onPreviewDropColumn(board.id, columnId)
      }
    ) : previewReady ? /* @__PURE__ */ jsx33(Typography18, { variant: "body2", color: "text.secondary", sx: { py: 2, px: 1 }, children: "No se pudo cargar la vista previa del tablero." }) : /* @__PURE__ */ jsx33(BoardPreviewSkeleton, {}) }) })
  ] });
}
function BoardsHomeToolbar({ loading, onNewBoard, onRefresh }) {
  return /* @__PURE__ */ jsxs28(Box20, { className: "paty-todos-toolbar", children: [
    /* @__PURE__ */ jsx33(Icon15, { icon: "mdi:view-dashboard-outline", size: 22 }),
    /* @__PURE__ */ jsx33("span", { className: "paty-todos-board-title", children: "Mis tableros SCRUM" }),
    /* @__PURE__ */ jsx33(Box20, { sx: { flex: 1 } }),
    /* @__PURE__ */ jsx33(Button14, { size: "small", variant: "outlined", startIcon: /* @__PURE__ */ jsx33(Icon15, { icon: "mdi:plus", size: 16 }), onClick: onNewBoard, children: "Nuevo" }),
    /* @__PURE__ */ jsx33(Button14, { size: "small", variant: "text", onClick: onRefresh, disabled: loading, startIcon: loading ? /* @__PURE__ */ jsx33(CircularProgress11, { size: 14 }) : /* @__PURE__ */ jsx33(Icon15, { icon: "mdi:refresh", size: 16 }), children: "Actualizar" })
  ] });
}
function BoardsHome({ boards, boardPreviews = {}, loadingPreviews = false, loading, onOpenBoard, onOpenTask, onPreviewDragStart, onPreviewDropColumn, onNewBoard, onDeleteBoard }) {
  const sortedBoards = useMemo13(() => sortBoardsByRecent(boards), [boards]);
  const [expandState, setExpandState] = useState22(() => readBoardExpandState());
  const [deletingId, setDeletingId] = useState22("");
  useEffect19(() => {
    writeBoardExpandState(expandState);
  }, [expandState]);
  function isExpanded(boardId) {
    if (Object.prototype.hasOwnProperty.call(expandState, boardId)) {
      return !!expandState[boardId];
    }
    return true;
  }
  function handleToggleExpand(boardId, next) {
    setExpandState((prev) => ({ ...prev, [boardId]: next }));
  }
  async function handleDeleteBoard(boardId) {
    setDeletingId(boardId);
    try {
      await onDeleteBoard(boardId);
      setExpandState((prev) => {
        const next = { ...prev };
        delete next[boardId];
        return next;
      });
    } finally {
      setDeletingId("");
    }
  }
  if (loading && !boards.length) {
    return /* @__PURE__ */ jsx33(Box20, { className: "paty-todos-boards-home paty-todos-boards-home--loading", children: /* @__PURE__ */ jsx33(CircularProgress11, {}) });
  }
  if (!boards.length) {
    return /* @__PURE__ */ jsx33(Box20, { className: "paty-todos-gate", children: /* @__PURE__ */ jsxs28(Stack15, { spacing: 2, alignItems: "center", sx: { maxWidth: 420, p: 2 }, children: [
      /* @__PURE__ */ jsx33(Icon15, { icon: "mdi:view-column", width: "2.5em", height: "2.5em", style: { opacity: 0.7 } }),
      /* @__PURE__ */ jsx33(Typography18, { variant: "body1", color: "text.secondary", textAlign: "center", children: "No hay tableros SCRUM. Crea el primero para empezar." }),
      /* @__PURE__ */ jsx33(Button14, { variant: "contained", startIcon: /* @__PURE__ */ jsx33(Icon15, { icon: "mdi:plus", size: 18 }), onClick: onNewBoard, children: "Crear tablero" })
    ] }) });
  }
  return /* @__PURE__ */ jsx33(Box20, { className: "paty-todos-boards-home", children: /* @__PURE__ */ jsx33(Box20, { className: "paty-todos-boards-list", children: sortedBoards.map((board) => /* @__PURE__ */ jsx33(BoardAccordionRow, { board, preview: boardPreviews[board.id], previewReady: Object.prototype.hasOwnProperty.call(boardPreviews, board.id), loadingPreviews, expanded: isExpanded(board.id), onToggleExpand: handleToggleExpand, onOpenBoard, onOpenTask, onPreviewDragStart, onPreviewDropColumn, onDeleteBoard: handleDeleteBoard, deleting: deletingId === board.id }, board.id)) }) });
}

// js/tools/todos/BoardSettingsDialog.jsx
import { Fragment as Fragment10, jsx as jsx34, jsxs as jsxs29 } from "react/jsx-runtime";
var { useState: useState23, useEffect: useEffect20 } = getReact();
var {
  Dialog: Dialog8,
  DialogTitle: DialogTitle8,
  DialogContent: DialogContent10,
  DialogActions: DialogActions8,
  Button: Button15,
  Stack: Stack16,
  TextField: TextField12,
  Box: Box21,
  FormControl: FormControl5,
  InputLabel: InputLabel2,
  Select: Select5,
  MenuItem: MenuItem5,
  Typography: Typography19,
  Chip: Chip13,
  IconButton: IconButton10,
  Tooltip: Tooltip9,
  CircularProgress: CircularProgress12
} = getMaterialUI();
var { Icon: Icon16 } = UI;
function roleLabel2(boardRole) {
  return boardRole === "readonly" ? "Solo lectura" : "Editor";
}
function BoardMembersSection({
  boardId,
  open,
  readOnly,
  saving,
  onMembersChange
}) {
  const [members, setMembers] = useState23([]);
  const [loading, setLoading] = useState23(false);
  const [membersSaving, setMembersSaving] = useState23(false);
  const [addKey, setAddKey] = useState23(0);
  useEffect20(() => {
    if (!open || !boardId) return;
    let cancelled = false;
    setLoading(true);
    fetchTodoBoardMembers(boardId).then((list) => {
      if (!cancelled) setMembers(list);
    }).catch(() => {
      if (!cancelled) setMembers([]);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [open, boardId]);
  const disabled = readOnly || saving || membersSaving || loading;
  const usernames = new Set(members.map((m) => m.username));
  async function persist(next) {
    setMembers(next);
    if (readOnly || !boardId) return;
    setMembersSaving(true);
    try {
      const updated = await saveTodoBoardMembers(boardId, next);
      setMembers(updated);
      onMembersChange?.(updated);
      toastSuccess("Integrantes actualizados");
    } catch (e) {
      const list = await fetchTodoBoardMembers(boardId);
      setMembers(list);
      toastError(e instanceof Error ? e.message : "No se pudieron guardar los integrantes");
    } finally {
      setMembersSaving(false);
    }
  }
  function updateRole(username, boardRole) {
    void persist(members.map((m) => m.username === username ? { ...m, boardRole } : m));
  }
  function removeMember(username) {
    void persist(members.filter((m) => m.username !== username));
  }
  function addMember(username) {
    const user = String(username ?? "").trim().toUpperCase();
    if (!user || usernames.has(user)) return;
    void persist([...members, { username: user, boardRole: "editor" }]);
    setAddKey((n) => n + 1);
  }
  return /* @__PURE__ */ jsxs29(Box21, { className: "paty-todos-board-members", children: [
    /* @__PURE__ */ jsx34(Typography19, { variant: "caption", color: "text.secondary", sx: { mb: 0.75, display: "block" }, children: "Integrantes" }),
    loading ? /* @__PURE__ */ jsx34(Box21, { sx: { display: "flex", justifyContent: "center", py: 1.5 }, children: /* @__PURE__ */ jsx34(CircularProgress12, { size: 22 }) }) : members.length === 0 ? /* @__PURE__ */ jsx34(Typography19, { variant: "body2", color: "text.secondary", sx: { mb: 1 }, children: "Sin integrantes registrados." }) : /* @__PURE__ */ jsx34(Stack16, { spacing: 0.75, className: "paty-todos-board-members__list", sx: { mb: 1 }, children: members.map((m) => /* @__PURE__ */ jsxs29(
      Stack16,
      {
        direction: "row",
        spacing: 1,
        alignItems: "center",
        className: "paty-todos-board-members__row",
        children: [
          /* @__PURE__ */ jsx34(
            Chip13,
            {
              size: "small",
              label: m.username,
              icon: /* @__PURE__ */ jsx34(
                Icon16,
                {
                  icon: m.boardRole === "readonly" ? "mdi:eye-outline" : "mdi:pencil-outline",
                  size: 14
                }
              ),
              sx: { flex: 1, minWidth: 0, justifyContent: "flex-start" }
            }
          ),
          readOnly ? /* @__PURE__ */ jsx34(Typography19, { variant: "caption", color: "text.secondary", sx: { flexShrink: 0 }, children: roleLabel2(m.boardRole) }) : /* @__PURE__ */ jsxs29(Fragment10, { children: [
            /* @__PURE__ */ jsx34(FormControl5, { size: "small", disabled, className: "paty-todos-board-members__role", children: /* @__PURE__ */ jsxs29(
              Select5,
              {
                value: m.boardRole,
                onChange: (e) => updateRole(m.username, e.target.value),
                "aria-label": `Rol de ${m.username}`,
                children: [
                  /* @__PURE__ */ jsx34(MenuItem5, { value: "editor", children: "Editor" }),
                  /* @__PURE__ */ jsx34(MenuItem5, { value: "readonly", children: "Solo lectura" })
                ]
              }
            ) }),
            /* @__PURE__ */ jsx34(Tooltip9, { title: "Quitar integrante", children: /* @__PURE__ */ jsx34("span", { children: /* @__PURE__ */ jsx34(
              IconButton10,
              {
                size: "small",
                disabled,
                "aria-label": `Quitar ${m.username}`,
                onClick: () => removeMember(m.username),
                children: /* @__PURE__ */ jsx34(Icon16, { icon: "mdi:account-remove-outline", size: 18 })
              }
            ) }) })
          ] })
        ]
      },
      m.username
    )) }),
    !readOnly ? /* @__PURE__ */ jsx34(Box21, { className: "paty-todos-board-members__add", children: /* @__PURE__ */ jsx34(
      UserAssignAutocomplete,
      {
        value: null,
        onChange: addMember,
        disabled,
        label: "A\xF1adir integrante",
        compact: true
      },
      addKey
    ) }) : null,
    membersSaving ? /* @__PURE__ */ jsx34(Typography19, { variant: "caption", color: "text.secondary", sx: { mt: 0.5, display: "block" }, children: "Guardando integrantes\u2026" }) : null
  ] });
}
function BoardSettingsDialog({
  open,
  onClose,
  boardId,
  board,
  readOnly,
  saving,
  onSave,
  onMembersChange
}) {
  const [title, setTitle] = useState23(board?.title ?? "");
  const [description, setDescription] = useState23(board?.description ?? "");
  const [visibility, setVisibility] = useState23(board?.visibility ?? "private");
  useEffect20(() => {
    if (!open) return;
    setTitle(board?.title ?? "");
    setDescription(board?.description ?? "");
    setVisibility(board?.visibility ?? "private");
  }, [open, board?.title, board?.description, board?.visibility]);
  if (!board) return null;
  async function saveField(patch) {
    if (readOnly) return;
    await onSave(patch);
  }
  return /* @__PURE__ */ jsxs29(Dialog8, { open, onClose, maxWidth: "sm", fullWidth: true, className: "paty-todos-board-settings-dialog", children: [
    /* @__PURE__ */ jsxs29(DialogTitle8, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
      /* @__PURE__ */ jsx34(Icon16, { icon: "mdi:cog-outline", size: 22 }),
      "Detalles del tablero"
    ] }),
    /* @__PURE__ */ jsx34(DialogContent10, { className: "paty-todos-board-settings-dialog__content", children: readOnly ? /* @__PURE__ */ jsxs29(Stack16, { spacing: 1.5, sx: { pt: 0.5 }, children: [
      /* @__PURE__ */ jsxs29(
        Stack16,
        {
          direction: "row",
          spacing: 2,
          alignItems: "baseline",
          flexWrap: "wrap",
          className: "paty-todos-board-settings-head",
          children: [
            /* @__PURE__ */ jsxs29(Typography19, { variant: "body2", sx: { flex: 1, minWidth: 0 }, children: [
              /* @__PURE__ */ jsx34("strong", { children: "T\xEDtulo:" }),
              " ",
              board.title
            ] }),
            /* @__PURE__ */ jsxs29(Typography19, { variant: "body2", color: "text.secondary", children: [
              /* @__PURE__ */ jsx34("strong", { children: "Visibilidad:" }),
              " ",
              board.visibility === "public" ? "P\xFAblico" : "Privado"
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxs29(Box21, { className: "paty-todos-board-desc-field", children: [
        /* @__PURE__ */ jsx34(Typography19, { variant: "caption", color: "text.secondary", sx: { mb: 0.5, display: "block" }, children: "Descripci\xF3n" }),
        /* @__PURE__ */ jsx34(Box21, { className: "paty-todos-board-desc-editor", children: /* @__PURE__ */ jsx34(
          PromptBodyEditor,
          {
            body: board.description ?? "",
            canEdit: false,
            editBlockReason: "",
            placeholder: "Sin descripci\xF3n",
            title: "Descripci\xF3n del tablero"
          }
        ) })
      ] }),
      /* @__PURE__ */ jsx34(
        BoardMembersSection,
        {
          boardId,
          open,
          readOnly: true,
          saving,
          onMembersChange
        }
      )
    ] }) : /* @__PURE__ */ jsxs29(Stack16, { spacing: 1.5, className: "paty-todos-board-row__edit", sx: { pt: 0.5 }, children: [
      /* @__PURE__ */ jsxs29(
        Stack16,
        {
          direction: "row",
          spacing: 1.5,
          alignItems: "flex-start",
          className: "paty-todos-board-settings-head",
          children: [
            /* @__PURE__ */ jsx34(
              TextField12,
              {
                label: "T\xEDtulo",
                size: "small",
                fullWidth: true,
                value: title,
                disabled: saving,
                onChange: (e) => setTitle(e.target.value),
                onBlur: () => {
                  const trimmed = title.trim();
                  if (trimmed && trimmed !== board.title) void saveField({ title: trimmed });
                },
                onKeyDown: (e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                },
                InputLabelProps: { shrink: true },
                sx: { flex: 1, minWidth: 0 }
              }
            ),
            /* @__PURE__ */ jsxs29(FormControl5, { size: "small", disabled: saving, className: "paty-todos-board-settings-vis", children: [
              /* @__PURE__ */ jsx34(InputLabel2, { id: "paty-board-settings-vis", shrink: true, children: "Visibilidad" }),
              /* @__PURE__ */ jsxs29(
                Select5,
                {
                  labelId: "paty-board-settings-vis",
                  label: "Visibilidad",
                  value: visibility,
                  onChange: (e) => {
                    const next = e.target.value;
                    setVisibility(next);
                    if (next !== board.visibility) void saveField({ visibility: next });
                  },
                  children: [
                    /* @__PURE__ */ jsx34(MenuItem5, { value: "private", children: "Privado" }),
                    /* @__PURE__ */ jsx34(MenuItem5, { value: "public", children: "P\xFAblico" })
                  ]
                }
              )
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxs29(Box21, { className: "paty-todos-board-desc-field", children: [
        /* @__PURE__ */ jsx34(Typography19, { variant: "caption", color: "text.secondary", sx: { mb: 0.5, display: "block" }, children: "Descripci\xF3n" }),
        /* @__PURE__ */ jsx34(Box21, { className: "paty-todos-board-desc-editor", children: /* @__PURE__ */ jsx34(
          PromptBodyEditor,
          {
            body: description,
            canEdit: !saving,
            editBlockReason: "No disponible",
            onChange: setDescription,
            onPersist: async (next) => {
              const trimmed = String(next ?? "").trim();
              setDescription(trimmed);
              const prev = (board.description ?? "").trim();
              if (trimmed !== prev) await saveField({ description: trimmed || null });
            },
            placeholder: "Markdown\u2026 (doble clic para editar)",
            title: "Descripci\xF3n del tablero",
            loading: saving
          }
        ) })
      ] }),
      /* @__PURE__ */ jsx34(
        BoardMembersSection,
        {
          boardId,
          open,
          readOnly,
          saving,
          onMembersChange
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx34(DialogActions8, { children: /* @__PURE__ */ jsx34(Button15, { onClick: onClose, children: "Cerrar" }) })
  ] });
}

// js/tools/todos/TodosShellParts.jsx
import { jsx as jsx35, jsxs as jsxs30 } from "react/jsx-runtime";
var { Box: Box22, Typography: Typography20, Button: Button16, Stack: Stack17, Alert: Alert11, CircularProgress: CircularProgress13, Tooltip: Tooltip10, IconButton: IconButton11 } = getMaterialUI();
var { Icon: Icon17 } = UI;
function TodosBoardToolbar({
  boardTitle,
  boardMeta,
  onHome,
  onNewBoard,
  onRefresh,
  onOpenSettings,
  loadingBoard
}) {
  const publicSlug = boardMeta?.publicSlug;
  function copyPublicLink() {
    if (!publicSlug) return;
    const url = buildPublicScrumUrl(publicSlug);
    navigator.clipboard.writeText(url);
    toastSuccess("Enlace p\xFAblico copiado");
  }
  return /* @__PURE__ */ jsxs30(Box22, { className: "paty-todos-toolbar", children: [
    /* @__PURE__ */ jsx35(Tooltip10, { title: "Volver a mis tableros", children: /* @__PURE__ */ jsx35(
      IconButton11,
      {
        size: "small",
        onClick: onHome,
        className: "paty-todos-back-btn",
        "aria-label": "Volver a mis tableros",
        children: /* @__PURE__ */ jsx35(Icon17, { icon: "mdi:arrow-left", size: 22 })
      }
    ) }),
    /* @__PURE__ */ jsx35(Icon17, { icon: "mdi:view-column", size: 22 }),
    /* @__PURE__ */ jsx35("span", { className: "paty-todos-board-title", children: boardTitle || "Tablero SCRUM" }),
    /* @__PURE__ */ jsx35(Tooltip10, { title: "Detalles del tablero", children: /* @__PURE__ */ jsx35(
      IconButton11,
      {
        size: "small",
        onClick: onOpenSettings,
        "aria-label": "Detalles del tablero",
        className: "paty-todos-settings-btn",
        children: /* @__PURE__ */ jsx35(Icon17, { icon: "mdi:cog-outline", size: 20 })
      }
    ) }),
    /* @__PURE__ */ jsx35(Box22, { sx: { flex: 1 } }),
    /* @__PURE__ */ jsx35(Button16, { size: "small", variant: "outlined", startIcon: /* @__PURE__ */ jsx35(Icon17, { icon: "mdi:plus", size: 16 }), onClick: onNewBoard, children: "Nuevo" }),
    publicSlug ? /* @__PURE__ */ jsx35(Tooltip10, { title: "Copiar enlace p\xFAblico (solo lectura)", children: /* @__PURE__ */ jsx35(IconButton11, { size: "small", onClick: copyPublicLink, "aria-label": "Copiar enlace p\xFAblico", children: /* @__PURE__ */ jsx35(Icon17, { icon: "mdi:link-variant", size: 20 }) }) }) : null,
    /* @__PURE__ */ jsx35(
      Button16,
      {
        size: "small",
        variant: "text",
        onClick: onRefresh,
        disabled: loadingBoard,
        startIcon: loadingBoard ? /* @__PURE__ */ jsx35(CircularProgress13, { size: 14 }) : /* @__PURE__ */ jsx35(Icon17, { icon: "mdi:refresh", size: 16 }),
        children: "Actualizar"
      }
    )
  ] });
}

// js/tools/todos/TodosPublicHome.jsx
import { jsx as jsx36, jsxs as jsxs31 } from "react/jsx-runtime";
var { useState: useState24, useEffect: useEffect21 } = getReact();
var { Box: Box23, Typography: Typography21, Button: Button17, Stack: Stack18, Alert: Alert12, CircularProgress: CircularProgress14, Chip: Chip14 } = getMaterialUI();
var { Icon: Icon18 } = UI;
var PUBLIC_CARD_ACCENTS = () => {
  const { NEON_COLORS } = getGlass();
  return [NEON_COLORS.blue, NEON_COLORS.cyan, NEON_COLORS.magenta, NEON_COLORS.green, NEON_COLORS.amber];
};
function TodosPublicHome() {
  const { GlassCard } = getGlass();
  const accentColors = PUBLIC_CARD_ACCENTS();
  const [boards, setBoards] = useState24([]);
  const [loading, setLoading] = useState24(true);
  const [error, setError] = useState24("");
  const [selectedSlug, setSelectedSlug] = useState24("");
  useEffect21(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const list = await fetchPublicTodoBoards("scrum");
        if (!cancelled) setBoards(list);
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : String(e);
          if (!/authorization bearer requerido/i.test(msg)) setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  if (selectedSlug) {
    return /* @__PURE__ */ jsxs31(Box23, { className: "paty-todos-shell", children: [
      /* @__PURE__ */ jsx36(Box23, { className: "paty-todos-toolbar", children: /* @__PURE__ */ jsx36(
        Button17,
        {
          size: "small",
          variant: "text",
          startIcon: /* @__PURE__ */ jsx36(Icon18, { icon: "mdi:arrow-left", size: 16 }),
          onClick: () => setSelectedSlug(""),
          children: "Volver"
        }
      ) }),
      /* @__PURE__ */ jsx36(PublicScrumBoard, { publicSlug: selectedSlug })
    ] });
  }
  return /* @__PURE__ */ jsxs31(Box23, { className: "paty-todos-shell", children: [
    /* @__PURE__ */ jsxs31(Box23, { className: "paty-todos-toolbar", children: [
      /* @__PURE__ */ jsx36(Icon18, { icon: "mdi:view-column", size: 22 }),
      /* @__PURE__ */ jsx36("span", { className: "paty-todos-board-title", children: "DevFlow" })
    ] }),
    error ? /* @__PURE__ */ jsx36(Alert12, { severity: "error", sx: { mx: 2, mb: 2, mt: 2 }, children: error }) : null,
    loading ? /* @__PURE__ */ jsx36(Box23, { sx: { display: "flex", justifyContent: "center", p: 4 }, children: /* @__PURE__ */ jsx36(CircularProgress14, {}) }) : boards.length ? /* @__PURE__ */ jsx36(Box23, { className: "paty-todos-public-list", component: "ul", sx: { listStyle: "none", m: 0, p: 0 }, children: boards.map((board, index) => {
      const accent = accentColors[index % accentColors.length];
      return /* @__PURE__ */ jsxs31(
        GlassCard,
        {
          component: "li",
          accent,
          className: "paty-todos-public-card isa-neon-accent-stripe",
          onClick: () => setSelectedSlug(board.publicSlug),
          sx: {
            "--stripe-accent": accent,
            "--card-accent": accent,
            width: "100%",
            cursor: "pointer",
            listStyle: "none"
          },
          children: [
            /* @__PURE__ */ jsx36(Box23, { className: "paty-todos-public-card__icon-wrap", "aria-hidden": true, children: /* @__PURE__ */ jsx36(Icon18, { icon: "mdi:view-column", size: 22 }) }),
            /* @__PURE__ */ jsxs31(Box23, { className: "paty-todos-public-card__body", children: [
              /* @__PURE__ */ jsx36(Typography21, { className: "paty-todos-public-card__title", component: "div", variant: "subtitle1", children: board.title }),
              /* @__PURE__ */ jsx36(Typography21, { className: "paty-todos-public-card__desc", component: "div", variant: "body2", color: "text.secondary", children: board.description || "Tablero SCRUM" }),
              /* @__PURE__ */ jsx36(
                Chip14,
                {
                  size: "small",
                  className: "paty-todos-public-card__chip",
                  label: "P\xFAblico",
                  icon: /* @__PURE__ */ jsx36(Icon18, { icon: "mdi:earth", size: 12 })
                }
              )
            ] }),
            /* @__PURE__ */ jsx36(Box23, { className: "paty-todos-public-card__arrow", "aria-hidden": true, children: /* @__PURE__ */ jsx36(Icon18, { icon: "mdi:chevron-right", size: 22 }) })
          ]
        },
        board.id
      );
    }) }) : /* @__PURE__ */ jsxs31(Stack18, { spacing: 1, alignItems: "center", sx: { p: 4, opacity: 0.85 }, children: [
      /* @__PURE__ */ jsx36(Icon18, { icon: "mdi:view-column-outline", width: "2.5em", height: "2.5em" }),
      /* @__PURE__ */ jsx36(Typography21, { variant: "body2", color: "text.secondary", align: "center", children: "No hay tableros publicados todav\xEDa." })
    ] })
  ] });
}

// js/tools/TodosTool.jsx
import { Fragment as Fragment11, jsx as jsx37, jsxs as jsxs32 } from "react/jsx-runtime";
var { useState: useState25 } = getReact();
var { Box: Box24, Alert: Alert13 } = getMaterialUI();
function TodosTool({ bootTodos, onNeedLogin }) {
  if (bootTodos?.publicSlug) {
    return /* @__PURE__ */ jsx37(PublicScrumBoard, { publicSlug: String(bootTodos.publicSlug) });
  }
  const todos = useTodosTool({ bootTodos });
  const [boardSettingsOpen, setBoardSettingsOpen] = useState25(false);
  if (!todos.loggedIn) {
    return /* @__PURE__ */ jsx37(TodosPublicHome, {});
  }
  const boardTitle = todos.boardData?.board?.title ?? "";
  return /* @__PURE__ */ jsxs32(Box24, { className: "paty-todos-shell", children: [
    todos.inBoardView ? /* @__PURE__ */ jsx37(
      TodosBoardToolbar,
      {
        boardTitle,
        boardMeta: todos.boardData?.board,
        loadingBoard: todos.loadingBoard,
        onHome: todos.goHome,
        onNewBoard: () => todos.setNewBoardOpen(true),
        onRefresh: () => todos.reload(),
        onOpenSettings: () => setBoardSettingsOpen(true)
      }
    ) : /* @__PURE__ */ jsx37(
      BoardsHomeToolbar,
      {
        loading: todos.loadingBoards,
        onNewBoard: () => todos.setNewBoardOpen(true),
        onRefresh: () => todos.reloadBoards()
      }
    ),
    todos.error ? /* @__PURE__ */ jsx37(Alert13, { severity: "error", sx: { m: 2 }, onClose: () => {
    }, children: todos.error }) : null,
    todos.inBoardView ? /* @__PURE__ */ jsx37(Fragment11, { children: /* @__PURE__ */ jsx37(
      TodosKanban,
      {
        boardData: todos.boardData,
        readOnly: !todos.canEdit,
        onOpenTask: todos.openTask,
        onQuickAdd: (colId, title) => {
          todos.onQuickAddTask(colId, title).catch((e) => {
            toastError(e instanceof Error ? e.message : String(e));
          });
        },
        onDragStart: todos.onDragStart,
        onDropColumn: todos.onDropColumn
      }
    ) }) : /* @__PURE__ */ jsx37(
      BoardsHome,
      {
        boards: todos.boards,
        boardPreviews: todos.boardPreviews,
        loadingPreviews: todos.loadingPreviews,
        loading: todos.loadingBoards,
        onOpenBoard: todos.selectBoard,
        onOpenTask: todos.openTaskFromPreview,
        onPreviewDragStart: todos.onPreviewDragStart,
        onPreviewDropColumn: todos.onPreviewDropColumn,
        onNewBoard: () => todos.setNewBoardOpen(true),
        onDeleteBoard: async (id) => {
          try {
            await todos.onDeleteBoard(id);
          } catch (e) {
            toastError(e instanceof Error ? e.message : String(e));
          }
        }
      }
    ),
    /* @__PURE__ */ jsx37(
      BoardSettingsDialog,
      {
        open: boardSettingsOpen,
        onClose: () => setBoardSettingsOpen(false),
        boardId: todos.boardId,
        board: todos.boardData?.board,
        readOnly: !todos.canEdit,
        saving: todos.loadingBoard,
        onSave: async (patch) => {
          if (!todos.boardId) return;
          try {
            await todos.onUpdateBoard(todos.boardId, patch);
          } catch (e) {
            toastError(e instanceof Error ? e.message : String(e));
          }
        },
        onMembersChange: todos.syncBoardMembers
      }
    ),
    /* @__PURE__ */ jsx37(
      NewBoardDialog,
      {
        open: todos.newBoardOpen,
        onClose: () => todos.setNewBoardOpen(false),
        busy: false,
        onCreate: async (payload) => {
          try {
            await todos.onCreateBoard(payload);
          } catch (e) {
            toastError(e instanceof Error ? e.message : String(e));
          }
        }
      }
    ),
    /* @__PURE__ */ jsx37(
      TaskDetailDialog,
      {
        open: !!todos.selectedTask || todos.taskLoading,
        task: todos.selectedTask,
        loading: todos.taskLoading,
        readOnly: !todos.canEdit,
        onClose: todos.closeTask,
        onSave: async (patch) => {
          try {
            await todos.saveTask(patch);
          } catch (e) {
            toastError(e instanceof Error ? e.message : String(e));
          }
        },
        onSaveSubtask: async (id, patch) => {
          try {
            await todos.saveSubtask(id, patch);
          } catch (e) {
            toastError(e instanceof Error ? e.message : String(e));
          }
        },
        onDeleteSubtask: async (id) => {
          try {
            await todos.deleteSubtask(id);
          } catch (e) {
            toastError(e instanceof Error ? e.message : String(e));
          }
        },
        onAddSubtask: async (title) => {
          try {
            await todos.addSubtask(title);
          } catch (e) {
            toastError(e instanceof Error ? e.message : String(e));
          }
        },
        onSaveMilestone: async (id, patch) => {
          try {
            await todos.saveMilestone(id, patch);
          } catch (e) {
            toastError(e instanceof Error ? e.message : String(e));
          }
        },
        onDeleteMilestone: async (id) => {
          try {
            await todos.deleteMilestone(id);
          } catch (e) {
            toastError(e instanceof Error ? e.message : String(e));
          }
        },
        onAddMilestone: async (title, dueDate) => {
          try {
            await todos.addMilestone(title, dueDate);
          } catch (e) {
            toastError(e instanceof Error ? e.message : String(e));
          }
        },
        onToggleMilestone: async (id, completed) => {
          try {
            await todos.toggleMilestone(id, completed);
          } catch (e) {
            toastError(e instanceof Error ? e.message : String(e));
          }
        },
        onComment: async (body) => {
          try {
            await todos.postComment(body);
          } catch (e) {
            toastError(e instanceof Error ? e.message : String(e));
          }
        }
      }
    )
  ] });
}

// js/tools/permFixFilter.js
var SESSION_OWNER_FIX_FILTER = {
  itercero: "{{itercero}}",
  icontacto: "{{icontacto}}"
};
var FIX_FILTER_VAR_HINT = "itercero, icontacto, iusuario, nombres";
function formatFixFilter(fixFilter) {
  if (!fixFilter || typeof fixFilter !== "object" || Array.isArray(fixFilter)) return "";
  return Object.entries(fixFilter).map(([k, v]) => `${k}: ${String(v)}`).join(" \xB7 ");
}
function fixFilterFromRestriction(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const ff = value.fixFilter;
  if (!ff || typeof ff !== "object" || Array.isArray(ff)) return void 0;
  return { ...ff };
}
function withSessionOwnerFixFilter(restriction) {
  if (restriction === true) return { fixFilter: { ...SESSION_OWNER_FIX_FILTER } };
  if (!restriction || typeof restriction !== "object") return restriction;
  return { ...restriction, fixFilter: { ...SESSION_OWNER_FIX_FILTER } };
}

// js/tools/permisosForm.js
var PERM_META = /* @__PURE__ */ new Set(["descripcion", "namedisplay", "roles"]);
var FLAG_DEFS = [
  { key: "*", label: "Acceso total", hint: "Wildcard \u2014 anula el resto de restricciones de ruta." },
  { key: "impersonate", label: "Suplantar chat", hint: "Actuar como otro usuario en conversaciones." },
  { key: "manage_permissions", label: "Gestionar permisos", hint: "CRUD de dbo.SYS_USR_PERMISSIONS (dev_lead)." }
];
var ACCESS_MODES = [
  { value: "off", label: "Sin acceso" },
  { value: "allow", label: "Permitido" },
  { value: "filtered", label: "Filtrado (fixFilter)" }
];
var FLAG_KEYS = new Set(FLAG_DEFS.map((f) => f.key));
function roleDescripcion(permisos) {
  const d = permisos?.descripcion;
  return d != null && String(d).trim() ? String(d).trim() : "";
}
function roleNamedisplay(permisos) {
  const d = permisos?.namedisplay;
  return d != null && String(d).trim() ? String(d).trim() : "";
}
function userRoles(permisos) {
  const r = permisos?.roles;
  return Array.isArray(r) ? r.map((x) => String(x).trim().toLowerCase()).filter(Boolean) : [];
}
function restrictionToMode(value) {
  if (value === true) return "allow";
  if (value && typeof value === "object") {
    const ff = value.fixFilter;
    if (ff && typeof ff === "object" && !Array.isArray(ff) && Object.keys(ff).length) return "filtered";
    return "allow";
  }
  return "off";
}
function modeToRestriction(mode, fixFilter) {
  if (mode === "allow") return true;
  if (mode === "filtered") {
    const ff = fixFilterFromRestriction({ fixFilter });
    return ff ? { fixFilter: ff } : true;
  }
  return null;
}
function splitRolePermisos(permisos) {
  const flags = Object.fromEntries(FLAG_DEFS.map((f) => [f.key, false]));
  const routes = [];
  for (const [key, value] of Object.entries(permisos ?? {})) {
    if (PERM_META.has(key)) continue;
    if (FLAG_KEYS.has(key)) {
      flags[key] = value === true;
      continue;
    }
    const mode = restrictionToMode(value);
    if (mode !== "off") {
      const fixFilter = fixFilterFromRestriction(value);
      routes.push(fixFilter ? { key, mode, fixFilter } : { key, mode });
    }
  }
  routes.sort((a, b) => a.key.localeCompare(b.key));
  return { flags, routes };
}
function buildRolePermisos(desc, namedisplay, flags, routes) {
  const out = {};
  if (String(desc ?? "").trim()) out.descripcion = String(desc).trim();
  if (String(namedisplay ?? "").trim()) out.namedisplay = String(namedisplay).trim();
  for (const def of FLAG_DEFS) {
    if (flags[def.key]) out[def.key] = true;
  }
  for (const row of routes) {
    if (!row.key || row.mode === "off") continue;
    const restr = modeToRestriction(row.mode, row.fixFilter);
    if (restr != null) out[row.key] = restr;
  }
  return out;
}
function countActiveRoutes(routes) {
  return (routes || []).filter((r) => r.mode && r.mode !== "off").length;
}

// js/tools/permisosKanbanShared.js
var VISITANTE = "visitante";
var ROLE_ACCENTS = ["#1e90ff", "#10b981", "#a855f7", "#f59e0b", "#ec4899", "#06b6d4", "#8b5cf6"];
var ROLE_ICONS = ["mdi:shield-account", "mdi:file-document-edit-outline", "mdi:code-braces", "mdi:robot-outline", "mdi:eye-outline", "mdi:account-group-outline"];
function permEntryKey(entry) {
  return String(entry?.iusuario ?? entry?.ientity ?? "").trim();
}
function roleNameFromEntry(entry) {
  return permEntryKey(entry).toLowerCase().replace(/^role:/i, "");
}
function formatRoleTitle2(roleName) {
  return String(roleName ?? "").split("_").map((part) => {
    const p = part.toLowerCase();
    if (p === "iss" || p === "isw") return p.toUpperCase();
    if (!p) return "";
    return p.charAt(0).toUpperCase() + p.slice(1);
  }).filter(Boolean).join(" ");
}
function roleTitleFromEntry(entry) {
  const roleName = roleNameFromEntry(entry);
  const canon = canonicalRoleMeta(roleName);
  if (canon?.namedisplay) return canon.namedisplay;
  const namedisplay = roleNamedisplay(entry?.permisos);
  const formatted = formatRoleTitle2(roleName);
  if (!namedisplay) return formatted;
  if (formatted.length > namedisplay.length) return formatted;
  return namedisplay;
}
function roleDescripcionFromEntry(entry) {
  const roleName = roleNameFromEntry(entry);
  const canon = canonicalRoleMeta(roleName);
  if (canon?.descripcion) return canon.descripcion;
  return roleDescripcion(entry?.permisos);
}
function themeForRole(roleName, index = 0, permisos = null) {
  const accent = permisos?.accent ?? permisos?.color;
  const icon = permisos?.icon;
  if (accent && icon) return { accent: String(accent), icon: String(icon) };
  const i = index % ROLE_ACCENTS.length;
  return { accent: ROLE_ACCENTS[i], icon: ROLE_ICONS[i % ROLE_ICONS.length] };
}
function userCardLabels(username, displayName) {
  const user = String(username ?? "").trim().toUpperCase();
  const name = String(displayName ?? "").trim();
  if (name) return { primary: name, secondary: user };
  return { primary: user, secondary: null };
}
function matchesUserFilter(username, displayName, query) {
  const q = String(query ?? "").trim().toUpperCase();
  if (!q) return true;
  const u = String(username ?? "").trim().toUpperCase();
  const n = String(displayName ?? "").trim().toUpperCase();
  return u.includes(q) || n && n.includes(q);
}
function displayNameFromUserEntry(entry) {
  const fromMeta = entry?.permisos?.nombre ?? entry?.permisos?.namedisplay;
  return fromMeta != null && String(fromMeta).trim() ? String(fromMeta).trim() : null;
}
function normalizePermisosUsername(raw) {
  const s = String(raw ?? "").trim().toUpperCase();
  return s || null;
}
function buildUserDirectoryFromPermisos(users) {
  const map = {};
  for (const e of users ?? []) {
    const key = normalizePermisosUsername(permEntryKey(e));
    if (!key) continue;
    const name = displayNameFromUserEntry(e);
    if (name) map[key] = name;
  }
  return map;
}
function resolveDisplayName(username, userEntry, userDirectory) {
  const fromMeta = displayNameFromUserEntry(userEntry);
  if (fromMeta) return fromMeta;
  const key = normalizePermisosUsername(username);
  const fromDir = key ? userDirectory?.[key] : null;
  if (fromDir != null && String(fromDir).trim()) return String(fromDir).trim();
  return null;
}
function sortPermisosColumnsByMembers(columns) {
  return [...columns].sort((a, b) => {
    const byCount = b.users.length - a.users.length;
    if (byCount !== 0) return byCount;
    return a.sortIndex - b.sortIndex;
  });
}
function buildPermisosBoard(data, filters = {}) {
  const roles = data?.roles ?? [];
  const users = data?.users ?? [];
  const userQuery = filters.userSearch ?? "";
  const roleFiltersRaw = filters.roleFilters ?? filters.roleFilter ?? [];
  const roleFilters = (Array.isArray(roleFiltersRaw) ? roleFiltersRaw : [roleFiltersRaw]).map((r) => String(r ?? "").trim().toLowerCase()).filter(Boolean);
  const roleFilterSet = roleFilters.length ? new Set(roleFilters) : null;
  const userDirectory = filters.userDirectory ?? null;
  const filterActive = Boolean(String(userQuery ?? "").trim()) || Boolean(roleFilterSet?.size);
  const activeRoles2 = roles.filter((entry) => entry?.itipo !== "user" && entry?.bactivo !== false && roleNameFromEntry(entry));
  const columns = activeRoles2.map((entry, index) => {
    const roleName = roleNameFromEntry(entry);
    const theme2 = themeForRole(roleName, index, entry.permisos);
    const jerarquia = getRoleJerarquia(roleName, entry.permisos);
    return {
      id: roleName,
      roleName,
      title: roleTitleFromEntry(entry),
      jerarquia,
      jerarquiaLabel: formatJerarquiaLabel(jerarquia),
      descripcion: roleDescripcionFromEntry(entry),
      entry,
      accent: theme2.accent,
      icon: theme2.icon,
      sortIndex: index,
      users: [],
      roleFilteredOut: !!(roleFilterSet && !roleFilterSet.has(roleName))
    };
  }).filter((c) => {
    if (!c.id || c.id === VISITANTE) return false;
    return true;
  });
  const colById = new Map(columns.map((c) => [c.id, c]));
  for (const userEntry of users) {
    const username = permEntryKey(userEntry).toUpperCase();
    const displayName = resolveDisplayName(username, userEntry, userDirectory);
    if (!matchesUserFilter(username, displayName, userQuery)) continue;
    for (const role of userRoles(userEntry.permisos)) {
      const col = colById.get(role);
      if (!col) continue;
      if (roleFilterSet && !roleFilterSet.has(role)) continue;
      if (col.users.some((u) => u.username === username)) continue;
      const labels = userCardLabels(username, displayName);
      col.users.push({ id: `${username}@${role}`, username, displayName, labels, userEntry });
    }
  }
  for (const col of columns) {
    col.users.sort((a, b) => a.labels.primary.localeCompare(b.labels.primary, "es"));
  }
  const sorted = sortPermisosColumnsByMembers(columns);
  const hideEmpty = !!filters.hideEmptyColumns;
  const visible = hideEmpty ? sorted.filter((c) => c.users.length > 0 || roleFilterSet?.has(c.id)) : sorted;
  const noUsersVisible = filterActive && !columns.some((c) => c.users.length > 0);
  return { columns: visible, filterActive, noUsersVisible, hideEmptyColumns: hideEmpty };
}
function columnAtPoint2(columnIds, listRefs, clientX, clientY) {
  for (const colId of columnIds) {
    const el = listRefs.current[colId];
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) return colId;
  }
  return null;
}
function buildRolePermisosIndex(roles) {
  const out = {};
  for (const r of roles ?? []) {
    const key = roleNameFromEntry(r);
    if (key) out[key] = r.permisos ?? {};
  }
  return out;
}
function canActorManageColumn(actorJerarquias, targetColumn) {
  if (!targetColumn) return false;
  const actors = Array.isArray(actorJerarquias) ? actorJerarquias : [actorJerarquias];
  const filtered = actors.map((j) => String(j ?? "").trim()).filter(Boolean);
  if (!filtered.length) return false;
  return actorCanManageTarget(filtered, targetColumn.jerarquia ?? "999");
}
function canActorTransferUser(actorJerarquias, fromColumn, toColumn) {
  return canActorManageColumn(actorJerarquias, fromColumn) && canActorManageColumn(actorJerarquias, toColumn);
}
function pointInRef(ref, clientX, clientY) {
  const el = ref?.current;
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
}

// js/tools/permisosRouteCatalog.js
var ROUTE_GROUPS = [
  {
    id: "conversaciones",
    title: "Conversaciones",
    routes: [
      { key: "GET:/api/conversaciones", label: "Listar conversaciones", scoped: true },
      { key: "GET:/api/conversacion/*", label: "Ver conversaci\xF3n", scoped: true },
      { key: "GET:/api/conversacion/logs/*", label: "Logs de conversaci\xF3n" },
      { key: "POST:/api/conversacion", label: "Crear conversaci\xF3n", scoped: true },
      { key: "POST:/api/mensaje", label: "Enviar mensaje", scoped: true },
      { key: "DELETE:/api/conversacion/*", label: "Eliminar conversaci\xF3n", scoped: true }
    ]
  },
  {
    id: "sistema",
    title: "Sistema",
    routes: [
      { key: "GET:/api/system/openai", label: "Leer config OpenAI" },
      { key: "PUT:/api/system/openai", label: "Guardar config OpenAI" },
      { key: "GET:/api/system/prompts-operativos", label: "Leer prompts operativos" },
      { key: "PUT:/api/system/prompts-operativos", label: "Guardar prompts operativos" },
      { key: "GET:/api/system/instrucciones", label: "Leer instrucciones PatyIA" },
      { key: "PUT:/api/system/instrucciones", label: "Guardar instrucciones PatyIA" },
      { key: "GET:/api/system/permisos", label: "Leer permisos" },
      { key: "PUT:/api/system/permisos", label: "Actualizar permisos" },
      { key: "PUT:/api/system/permisos/roles/*", label: "Editar rol" },
      { key: "PUT:/api/system/permisos/usuarios/*", label: "Editar usuario" },
      { key: "PATCH:/api/system/permisos/usuarios/*/roles", label: "Asignar roles a usuario" },
      { key: "POST:/api/system/*", label: "POST sistema (wildcard)" },
      { key: "PUT:/api/system/*", label: "PUT sistema (wildcard)" }
    ]
  },
  {
    id: "patyia",
    title: "PatyIA / instrucciones",
    routes: [
      { key: "POST:/api/patyia/instrucciones/publish", label: "Publicar instrucciones" },
      { key: "POST:/api/patyia/instrucciones/upsert", label: "Upsert instrucciones" },
      { key: "POST:/api/patyia/prompts/upsert-sql", label: "Upsert SQL prompts" },
      { key: "POST:/api/instrucciones/*", label: "POST instrucciones (wildcard)" }
    ]
  },
  {
    id: "documentacion",
    title: "Documentaci\xF3n",
    routes: [
      { key: "PUT:/api/swagger.json", label: "Swagger declarativo" }
    ]
  }
];
var CATALOG_KEYS = new Set(ROUTE_GROUPS.flatMap((g) => g.routes.map((r) => r.key)));
function isWildcardRole(permisos) {
  return permisos?.["*"] === true;
}
function routesForRoleEditor(permisos, { includeInactive = false } = {}) {
  const wildcard = isWildcardRole(permisos);
  const modeByKey = /* @__PURE__ */ new Map();
  const fixByKey = /* @__PURE__ */ new Map();
  for (const [key, value] of Object.entries(permisos ?? {})) {
    if (key === "*" || key === "descripcion" || key === "namedisplay" || key === "roles" || key === "impersonate" || key === "manage_permissions") continue;
    const hasFix = !!(value && typeof value === "object" && value.fixFilter && typeof value.fixFilter === "object" && !Array.isArray(value.fixFilter) && Object.keys(value.fixFilter).length);
    const mode = value === true ? "allow" : hasFix ? "filtered" : value && typeof value === "object" ? "allow" : "off";
    if (mode !== "off") modeByKey.set(key, mode);
    const ff = fixFilterFromRestriction(value);
    if (ff) fixByKey.set(key, ff);
  }
  const groups = ROUTE_GROUPS.map((g) => ({
    id: g.id,
    title: g.title,
    routes: g.routes.map((def) => {
      let mode = "off";
      if (wildcard) mode = def.scoped ? "filtered" : "allow";
      else if (modeByKey.has(def.key)) mode = modeByKey.get(def.key);
      return { ...def, mode, fixFilter: fixByKey.get(def.key), active: mode !== "off" };
    }).filter((r) => includeInactive || r.active)
  })).filter((g) => g.routes.length > 0);
  const extras = [...modeByKey.entries()].filter(([key]) => !CATALOG_KEYS.has(key)).map(([key, mode]) => ({
    key,
    label: key,
    mode,
    fixFilter: fixByKey.get(key),
    active: true,
    scoped: mode === "filtered"
  })).sort((a, b) => a.key.localeCompare(b.key));
  return { groups, extras, wildcard, activeCount: [...modeByKey.keys()].length + (wildcard ? 1 : 0) };
}
function routesArrayFromPermisos(permisos, includeInactive) {
  const { groups, extras } = routesForRoleEditor(permisos, { includeInactive });
  const rows = [];
  for (const g of groups) {
    for (const r of g.routes) rows.push({ key: r.key, mode: r.mode, ...r.fixFilter ? { fixFilter: r.fixFilter } : {} });
  }
  for (const r of extras) rows.push({ key: r.key, mode: r.mode, ...r.fixFilter ? { fixFilter: r.fixFilter } : {} });
  return rows;
}
function groupsFromRouteRows(routes, flags, { includeInactive = false } = {}) {
  const permisos = {};
  if (flags?.["*"]) permisos["*"] = true;
  for (const r of routes ?? []) {
    if (!r?.key || r.mode === "off") continue;
    if (r.mode === "allow") permisos[r.key] = true;
    else if (r.mode === "filtered") permisos[r.key] = r.fixFilter ? { fixFilter: r.fixFilter } : true;
  }
  return routesForRoleEditor(permisos, { includeInactive });
}

// js/tools/permisosRoleTransfer.js
function isTopDevLeadRole(roleName, jerarquia) {
  const key = String(roleName ?? "").trim().toLowerCase();
  if (key === "dev_lead") return true;
  return String(jerarquia ?? "").trim() === "0.0.0";
}
function isSamePermisosUser(a, b) {
  const x = String(a ?? "").trim().toUpperCase();
  const y = String(b ?? "").trim().toUpperCase();
  return !!x && x === y;
}
function moveRoleImpactBullets({ username, fromRoleTitle, toRoleTitle, isSelf, leavesDevLead }) {
  const user = String(username ?? "").trim().toUpperCase();
  const from = fromRoleTitle || "origen";
  const to = toRoleTitle || "destino";
  const bullets = [
    `${isSelf ? "Dejar\xE1s" : `${user} dejar\xE1`} de tener el rol **${from}** (solo quedar\xE1 en **${to}**).`,
    `${isSelf ? "Perder\xE1s" : "Perder\xE1"} permisos, rutas y privilegios asociados solo a **${from}**.`,
    `${isSelf ? "Desaparecer\xE1s" : "Desaparecer\xE1"} de la columna **${from}** en este tablero.`,
    "Los dem\xE1s roles que ya tenga el usuario no se modifican."
  ];
  if (leavesDevLead) {
    bullets.push(
      isSelf ? "Al salir de **dev_lead** (m\xE1ximo privilegio) perder\xE1s gesti\xF3n de permisos hasta que otro dev_lead te reasigne o un administrador ajuste la BD." : `Al salir de **dev_lead**, ${user} necesitar\xE1 que otro dev_lead lo reasigne o un ajuste manual en BD para recuperar el rol.`
    );
  }
  return bullets;
}
function removeRoleImpactBullets({ username, roleTitle: roleTitle2, isSelf, isDevLead }) {
  const user = String(username ?? "").trim().toUpperCase();
  const role = roleTitle2 || "rol";
  const bullets = [
    `${isSelf ? "Perder\xE1s" : "Perder\xE1"} permisos, rutas y privilegios de **${role}**.`,
    `${isSelf ? "Dejar\xE1s" : "Dejar\xE1"} de aparecer en la columna **${role}** del tablero.`,
    "Los otros roles asignados no cambian."
  ];
  if (isDevLead) {
    bullets.push(
      isSelf ? "Si te quitas **dev_lead**, otro dev_lead deber\xE1 reasignarte o habr\xE1 que corregirlo en BD." : `Para restaurar **dev_lead** en ${user}, otro dev_lead deber\xE1 volver a asignar el rol.`
    );
  } else {
    bullets.push("Para restaurar el acceso, un dev_lead puede volver a asignar el rol.");
  }
  return bullets;
}
function userJerarquiasFromBoard(username, columns) {
  const u = String(username ?? "").trim().toUpperCase();
  if (!u) return [];
  const out = [];
  for (const col of columns ?? []) {
    if (col.users?.some((x) => String(x.username ?? "").trim().toUpperCase() === u)) {
      out.push(col.jerarquia);
    }
  }
  return out;
}
function canCopyUserRole({ fromJerarquia, toJerarquia, userJerarquiasOnBoard = [] }) {
  if (isSameInheritanceLine(fromJerarquia, toJerarquia)) {
    return {
      ok: false,
      reason: "No se puede copiar dentro de la misma rama jer\xE1rquica. Use mover para cambiar de rol en esa l\xEDnea."
    };
  }
  for (const jer of userJerarquiasOnBoard) {
    if (isSameInheritanceLine(jer, toJerarquia)) {
      return {
        ok: false,
        reason: "El usuario ya tiene un rol en la misma rama que el destino. Copiar est\xE1 prohibido; use mover o quite el rol existente."
      };
    }
  }
  return { ok: true };
}
function canAddUserToRole({ toJerarquia, userJerarquiasOnBoard = [] }) {
  for (const jer of userJerarquiasOnBoard) {
    if (isSameInheritanceLine(jer, toJerarquia)) {
      return {
        ok: false,
        reason: "El usuario ya tiene un rol en la misma rama jer\xE1rquica. No puede duplicarse; use mover entre columnas."
      };
    }
  }
  return { ok: true };
}

// js/tools/PermisosUserAutocomplete.jsx
import { jsx as jsx38 } from "react/jsx-runtime";
import { createElement as createElement4 } from "react";
var { useState: useState26, useEffect: useEffect22, useRef: useRef11, useCallback: useCallback11 } = getReact();
var { Autocomplete: Autocomplete3, TextField: TextField13, Typography: Typography22, Box: Box25 } = getMaterialUI();
var DEBOUNCE_MS3 = 300;
function optionLabel2(row) {
  if (!row) return "";
  return row.displayName ? `${row.displayName} (${row.username})` : row.username;
}
function usernameFromInput(text) {
  const raw = String(text ?? "").trim();
  if (!raw) return null;
  const paren = raw.match(/\(([A-Z0-9_.$-]+)\)\s*$/i);
  if (paren) return normalizePermisosUsername(paren[1]);
  return normalizePermisosUsername(raw.split(/\s+/)[0]);
}
function PermisosUserAutocomplete({ value, onChange, disabled = false, label = "Usuario", roleFilter = null, allowNew = true }) {
  const username = value ? normalizePermisosUsername(value) : null;
  const [inputValue, setInputValue] = useState26("");
  const [options, setOptions] = useState26([]);
  const [loading, setLoading] = useState26(false);
  const debounceRef = useRef11(null);
  const requestIdRef = useRef11(0);
  const selected = username ? options.find((o) => o.username === username) ?? (username ? { username, displayName: null } : null) : null;
  const runSearch = useCallback11(async (query) => {
    const id = ++requestIdRef.current;
    setLoading(true);
    try {
      const users = await searchPermisosUsers(query, roleFilter ? { role: roleFilter } : void 0);
      if (id !== requestIdRef.current) return users;
      setOptions(users);
      return users;
    } catch {
      if (id === requestIdRef.current) setOptions([]);
      return [];
    } finally {
      if (id === requestIdRef.current) setLoading(false);
    }
  }, [roleFilter]);
  const scheduleSearch = useCallback11((query) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runSearch(query);
    }, DEBOUNCE_MS3);
  }, [runSearch]);
  useEffect22(() => {
    if (!username) {
      setInputValue("");
      return;
    }
    if (value && username !== normalizePermisosUsername(value)) {
      onChange(username);
      return;
    }
    const match = options.find((o) => o.username === username);
    setInputValue(match ? optionLabel2(match) : username);
  }, [value, username, options, onChange]);
  useEffect22(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);
  useEffect22(() => {
    if (disabled) return;
    runSearch("");
  }, [disabled, runSearch]);
  if (disabled) {
    return /* @__PURE__ */ jsx38(TextField13, { label, fullWidth: true, size: "small", value: username || "", disabled: true, placeholder: "Sin usuario" });
  }
  return /* @__PURE__ */ jsx38(
    Autocomplete3,
    {
      fullWidth: true,
      size: "small",
      openOnFocus: true,
      autoHighlight: true,
      clearOnBlur: false,
      selectOnFocus: true,
      handleHomeEndKeys: true,
      freeSolo: allowNew,
      loading,
      options,
      value: selected,
      inputValue,
      filterOptions: (x) => x,
      getOptionLabel: optionLabel2,
      isOptionEqualToValue: (a, b) => String(a?.username) === String(b?.username),
      noOptionsText: loading ? "Buscando\u2026" : "Sin coincidencias \u2014 escriba login",
      loadingText: "Buscando\u2026",
      onOpen: () => {
        if (!options.length) runSearch(inputValue);
      },
      onInputChange: (_e, text, reason) => {
        if (reason === "reset") return;
        setInputValue(text);
        scheduleSearch(text);
        if (allowNew) {
          const u = usernameFromInput(text);
          if (u && !text.includes("(")) onChange(u);
        }
      },
      onChange: (_e, row) => {
        if (typeof row === "string") {
          const u = usernameFromInput(row);
          onChange(u);
          setInputValue(u ?? "");
          return;
        }
        onChange(row?.username ?? null);
        setInputValue(row ? optionLabel2(row) : "");
      },
      renderOption: (props, row) => /* @__PURE__ */ createElement4(Box25, { component: "li", ...props, key: row.username, sx: { display: "flex", flexDirection: "column", py: 0.75 } }, /* @__PURE__ */ jsx38(Typography22, { variant: "body2", sx: { fontWeight: 600 }, children: row.displayName || row.username }), row.displayName ? /* @__PURE__ */ jsx38(Typography22, { variant: "caption", color: "text.secondary", children: row.username }) : null),
      renderInput: (params) => /* @__PURE__ */ jsx38(
        TextField13,
        {
          ...params,
          label,
          placeholder: "Buscar login ISS\u2026",
          helperText: allowNew ? "Usuarios en permisos ISS o login nuevo" : "Usuarios registrados en permisos ISS"
        }
      )
    }
  );
}

// js/tools/permisosVisitante.js
var VISITANTE_ROLE = "visitante";
var VISITANTE_DEFAULT_PERMISOS = {
  namedisplay: "Visitante",
  descripcion: "Visitante \u2014 solo sus propias conversaciones; logs abiertos; resto lectura",
  "GET:/api/conversaciones": { fixFilter: { ...SESSION_OWNER_FIX_FILTER } },
  "GET:/api/conversacion/*": { fixFilter: { ...SESSION_OWNER_FIX_FILTER } },
  "GET:/api/conversacion/logs/*": true,
  "POST:/api/conversacion": { fixFilter: { ...SESSION_OWNER_FIX_FILTER } },
  "POST:/api/mensaje": { fixFilter: { ...SESSION_OWNER_FIX_FILTER } },
  "DELETE:/api/conversacion/*": { fixFilter: { ...SESSION_OWNER_FIX_FILTER } }
};
var VISITANTE_LOCKED_OWN_KEYS = /* @__PURE__ */ new Set([
  "GET:/api/conversaciones",
  "GET:/api/conversacion/*",
  "POST:/api/conversacion",
  "POST:/api/mensaje",
  "DELETE:/api/conversacion/*"
]);
var VISITANTE_REQUIRED_OWN_KEYS = /* @__PURE__ */ new Set([
  "GET:/api/conversaciones",
  "GET:/api/conversacion/*"
]);
function isVisitanteRole(roleName) {
  return String(roleName ?? "").trim().toLowerCase() === VISITANTE_ROLE;
}
function enforceVisitantePermisos(permisos) {
  const out = { ...permisos ?? {} };
  delete out["*"];
  delete out.impersonate;
  delete out.manage_permissions;
  for (const key of VISITANTE_REQUIRED_OWN_KEYS) {
    out[key] = withSessionOwnerFixFilter({ fixFilter: { ...SESSION_OWNER_FIX_FILTER } });
  }
  for (const key of VISITANTE_LOCKED_OWN_KEYS) {
    const v = out[key];
    if (v == null || v === false) continue;
    if (v === true) out[key] = withSessionOwnerFixFilter(v);
    else if (typeof v === "object") out[key] = withSessionOwnerFixFilter(v);
  }
  return out;
}
function visitanteRouteLocked(key) {
  return VISITANTE_LOCKED_OWN_KEYS.has(key);
}
function getVisitanteRoleEntry(data) {
  const hit = (data?.roles ?? []).find((r) => roleNameFromEntry(r) === VISITANTE_ROLE);
  if (hit) return hit;
  return {
    iusuario: VISITANTE_ROLE,
    itipo: "role",
    permisos: { ...VISITANTE_DEFAULT_PERMISOS },
    bactivo: true
  };
}

// js/tools/permisosRoleConfig.jsx
import { Fragment as Fragment12, jsx as jsx39, jsxs as jsxs33 } from "react/jsx-runtime";
var { useState: useState27, useEffect: useEffect23, useMemo: useMemo14 } = getReact();
var {
  Typography: Typography23,
  TextField: TextField14,
  Stack: Stack19,
  Alert: Alert14,
  Chip: Chip15,
  Box: Box26,
  Checkbox: Checkbox2,
  FormControlLabel: FormControlLabel3,
  Divider: Divider6,
  Select: Select6,
  MenuItem: MenuItem6,
  FormControl: FormControl6,
  InputLabel: InputLabel3,
  Table: Table3,
  TableBody: TableBody3,
  TableCell: TableCell3,
  TableHead: TableHead3,
  TableRow: TableRow3,
  DialogContent: DialogContent11,
  DialogActions: DialogActions9,
  Button: Button18,
  Tooltip: Tooltip11,
  CircularProgress: CircularProgress15
} = getMaterialUI();
var { Icon: Icon19 } = UI;
function renderImpactLine(text) {
  const parts = String(text ?? "").split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) => i % 2 === 1 ? /* @__PURE__ */ jsx39("strong", { children: part }, i) : part);
}
var MODE_LABEL = Object.fromEntries(ACCESS_MODES.map((m) => [m.value, m.label]));
function AccessModeSelect({ value, onChange, disabled, scoped }) {
  const modes = scoped ? ACCESS_MODES : ACCESS_MODES.filter((m) => m.value === "off" || m.value === "allow");
  return /* @__PURE__ */ jsxs33(FormControl6, { size: "small", fullWidth: true, disabled, children: [
    /* @__PURE__ */ jsx39(InputLabel3, { id: "perm-route-access-label", shrink: true, children: "Acceso" }),
    /* @__PURE__ */ jsx39(Select6, { labelId: "perm-route-access-label", label: "Acceso", value: value || "off", onChange: (e) => onChange(e.target.value), children: modes.map((m) => /* @__PURE__ */ jsx39(MenuItem6, { value: m.value, children: m.label }, m.value)) })
  ] });
}
function ModeChip({ mode }) {
  const color = mode === "off" ? "default" : mode === "filtered" ? "info" : "success";
  return /* @__PURE__ */ jsx39(Chip15, { size: "small", variant: mode === "off" ? "outlined" : "filled", color, label: MODE_LABEL[mode] || mode });
}
function RouteGroupSection({ title, routes, canEdit, wildcard, onRouteMode, isVisitante }) {
  if (!routes.length) return null;
  return /* @__PURE__ */ jsxs33(Box26, { className: "permisos-route-group", children: [
    /* @__PURE__ */ jsx39(Typography23, { variant: "subtitle2", fontWeight: 700, className: "permisos-route-group__title", children: title }),
    /* @__PURE__ */ jsxs33(Table3, { size: "small", className: "permisos-route-table__grid permisos-route-group__table", children: [
      /* @__PURE__ */ jsx39(TableHead3, { children: /* @__PURE__ */ jsxs33(TableRow3, { children: [
        /* @__PURE__ */ jsx39(TableCell3, { children: "Ruta" }),
        /* @__PURE__ */ jsx39(TableCell3, { sx: { width: "38%" }, children: "Clave" }),
        /* @__PURE__ */ jsx39(TableCell3, { sx: { minWidth: 140 }, children: /* @__PURE__ */ jsx39(Tooltip11, { title: `fixFilter \u2014 filtra por el usuario de la sesi\xF3n (${FIX_FILTER_VAR_HINT})`, children: /* @__PURE__ */ jsx39("span", { children: "Filtro de sesi\xF3n" }) }) }),
        /* @__PURE__ */ jsx39(TableCell3, { sx: { width: 168 }, children: "Acceso" })
      ] }) }),
      /* @__PURE__ */ jsx39(TableBody3, { children: routes.map((row) => {
        const active = row.mode !== "off";
        return /* @__PURE__ */ jsxs33(TableRow3, { className: active ? "permisos-route-row--active" : "permisos-route-row--inactive", children: [
          /* @__PURE__ */ jsx39(TableCell3, { children: /* @__PURE__ */ jsx39(Typography23, { variant: "body2", fontWeight: active ? 600 : 400, children: row.label }) }),
          /* @__PURE__ */ jsx39(TableCell3, { children: /* @__PURE__ */ jsx39(Typography23, { component: "code", variant: "caption", sx: { wordBreak: "break-all" }, children: row.key }) }),
          /* @__PURE__ */ jsx39(TableCell3, { children: row.fixFilter ? /* @__PURE__ */ jsx39(Tooltip11, { title: `Plantillas {{var}} \u2014 ${FIX_FILTER_VAR_HINT}`, children: /* @__PURE__ */ jsx39(Typography23, { variant: "caption", color: "text.secondary", sx: { wordBreak: "break-all" }, children: formatFixFilter(row.fixFilter) }) }) : /* @__PURE__ */ jsx39(Typography23, { variant: "caption", color: "text.disabled", children: "\u2014" }) }),
          /* @__PURE__ */ jsx39(TableCell3, { children: canEdit && !isVisitante && !visitanteRouteLocked(row.key) ? /* @__PURE__ */ jsx39(
            AccessModeSelect,
            {
              value: row.mode,
              scoped: !!row.scoped,
              disabled: wildcard,
              onChange: (mode) => onRouteMode(row.key, mode)
            }
          ) : isVisitante && visitanteRouteLocked(row.key) ? /* @__PURE__ */ jsx39(
            Chip15,
            {
              size: "small",
              color: "info",
              variant: "outlined",
              icon: /* @__PURE__ */ jsx39(Icon19, { icon: "mdi:lock", size: 14 }),
              label: "Alcance: propio (fijo)"
            }
          ) : /* @__PURE__ */ jsx39(ModeChip, { mode: row.mode }) })
        ] }, row.key);
      }) })
    ] })
  ] });
}
function RoutePermCatalog({ routes, flags, permisos, canEdit, onRoutesChange, isVisitante }) {
  const [newKey, setNewKey] = useState27("");
  const wildcard = flags?.["*"] || isWildcardRole(permisos);
  const view = useMemo14(() => {
    if (canEdit) return groupsFromRouteRows(routes, flags, { includeInactive: true });
    return routesForRoleEditor(permisos, { includeInactive: false });
  }, [canEdit, routes, flags, permisos]);
  const activeCount = canEdit ? countActiveRoutes(routes) : view.groups.reduce((n, g) => n + g.routes.length, 0) + view.extras.length;
  function onRouteMode(key, mode) {
    if (!canEdit || visitanteRouteLocked(key)) return;
    const hit = routes.find((r) => r.key === key);
    const next = hit ? routes.map((r) => {
      if (r.key !== key) return r;
      const row = { ...r, mode };
      if (mode === "allow" || mode === "off") delete row.fixFilter;
      return row;
    }) : [...routes, { key, mode }].sort((a, b) => a.key.localeCompare(b.key));
    onRoutesChange?.(next);
  }
  function addRow() {
    const key = String(newKey ?? "").trim();
    if (!key || routes.some((r) => r.key === key)) return;
    onRoutesChange?.([...routes, { key, mode: "allow" }].sort((a, b) => a.key.localeCompare(b.key)));
    setNewKey("");
  }
  return /* @__PURE__ */ jsxs33(Box26, { className: "permisos-route-catalog", children: [
    /* @__PURE__ */ jsxs33(Stack19, { direction: "row", alignItems: "center", justifyContent: "space-between", sx: { mb: 1 }, children: [
      /* @__PURE__ */ jsx39(Typography23, { variant: "subtitle2", fontWeight: 700, children: "Rutas API" }),
      /* @__PURE__ */ jsx39(Chip15, { size: "small", variant: "outlined", label: `${activeCount} activas` })
    ] }),
    isVisitante ? /* @__PURE__ */ jsxs33(Alert14, { severity: "info", sx: { mb: 1.5 }, icon: /* @__PURE__ */ jsx39(Icon19, { icon: "mdi:account-lock-outline", size: 18 }), children: [
      "Alcance fijo por ",
      /* @__PURE__ */ jsx39("code", { children: "fixFilter" }),
      " de sesi\xF3n (",
      /* @__PURE__ */ jsx39("code", { children: "itercero" }),
      ", ",
      /* @__PURE__ */ jsx39("code", { children: "icontacto" }),
      "). El ISS fusiona ese filtro con la petici\xF3n y siempre gana sobre query o ",
      /* @__PURE__ */ jsx39("code", { children: "f.eq" }),
      "."
    ] }) : null,
    wildcard ? /* @__PURE__ */ jsxs33(Alert14, { severity: "info", sx: { mb: 1.5 }, icon: /* @__PURE__ */ jsx39(Icon19, { icon: "mdi:asterisk", size: 18 }), children: [
      "Acceso total (",
      /* @__PURE__ */ jsx39("code", { children: "*" }),
      ") \u2014 todas las rutas quedan cubiertas por el wildcard."
    ] }) : null,
    !view.groups.length && !view.extras.length ? /* @__PURE__ */ jsx39(Typography23, { variant: "body2", color: "text.secondary", children: "Sin rutas activas para este rol." }) : /* @__PURE__ */ jsxs33(Stack19, { spacing: 2, className: "permisos-route-catalog__groups", children: [
      view.groups.map((g) => /* @__PURE__ */ jsx39(RouteGroupSection, { title: g.title, routes: g.routes, canEdit, wildcard, onRouteMode, isVisitante }, g.id)),
      view.extras.length ? /* @__PURE__ */ jsx39(RouteGroupSection, { title: "Otras claves", routes: view.extras, canEdit, wildcard, onRouteMode, isVisitante }) : null
    ] }),
    canEdit && !wildcard && !isVisitante ? /* @__PURE__ */ jsxs33(Stack19, { direction: { xs: "column", sm: "row" }, spacing: 1, sx: { mt: 1.5 }, children: [
      /* @__PURE__ */ jsx39(
        TextField14,
        {
          size: "small",
          fullWidth: true,
          label: "Clave adicional",
          placeholder: "GET:/api/conversaciones",
          value: newKey,
          onChange: (e) => setNewKey(e.target.value),
          onKeyDown: (e) => e.key === "Enter" && addRow()
        }
      ),
      /* @__PURE__ */ jsx39(ButtonIconify, { icon: "mdi:plus", title: "Agregar", label: "Agregar", onClick: addRow, disabled: !newKey.trim() })
    ] }) : null
  ] });
}
function RoleConfigEditor({ entry, roleName, canManage, canEditRoleDescriptions, onChange }) {
  const canEditPermisos = !!canManage;
  const canEditMeta = canManage || canEditRoleDescriptions;
  const resolvedRole = roleName ?? String(entry?.iusuario ?? "").trim().toLowerCase().replace(/^role:/i, "");
  const isVisitante = isVisitanteRole(resolvedRole);
  const [namedisplay, setNamedisplay] = useState27(roleNamedisplay(entry?.permisos));
  const [desc, setDesc] = useState27(roleDescripcion(entry?.permisos));
  const [flags, setFlags] = useState27(() => splitRolePermisos(entry?.permisos).flags);
  const [routes, setRoutes] = useState27(() => routesArrayFromPermisos(entry?.permisos, canEditPermisos));
  const entryDesc = roleDescripcion(entry?.permisos);
  const entryNamedisplay = roleNamedisplay(entry?.permisos);
  useEffect23(() => {
    setNamedisplay(roleNamedisplay(entry?.permisos));
    setDesc(roleDescripcion(entry?.permisos));
    const split = splitRolePermisos(entry?.permisos);
    setFlags(split.flags);
    setRoutes(routesArrayFromPermisos(entry?.permisos, canEditPermisos));
  }, [entry?.permisos, entry?.iusuario, canEditPermisos]);
  function emit(nextNamedisplay = namedisplay, nextDesc = desc, nextFlags = flags, nextRoutes = routes) {
    if (!onChange) return;
    if (canManage) {
      let permisos = buildRolePermisos(
        canEditMeta ? nextDesc : entryDesc,
        canEditMeta ? nextNamedisplay : entryNamedisplay,
        nextFlags,
        nextRoutes
      );
      if (isVisitante) permisos = enforceVisitantePermisos(permisos);
      onChange(permisos);
    } else if (canEditRoleDescriptions) {
      onChange({
        ...entry?.permisos ?? {},
        descripcion: String(nextDesc).trim() || void 0,
        namedisplay: String(nextNamedisplay).trim() || void 0
      });
    }
  }
  return /* @__PURE__ */ jsxs33(Stack19, { spacing: 3, className: "permisos-role-config-editor", children: [
    canEditMeta ? /* @__PURE__ */ jsxs33(Box26, { component: "section", className: "permisos-role-config-editor__meta", children: [
      /* @__PURE__ */ jsx39(Typography23, { variant: "subtitle2", fontWeight: 700, sx: { mb: 1.25 }, children: "Metadatos del rol" }),
      /* @__PURE__ */ jsxs33(Stack19, { spacing: 1.5, children: [
        /* @__PURE__ */ jsx39(
          TextField14,
          {
            label: "Nombre a mostrar",
            size: "small",
            fullWidth: true,
            value: namedisplay,
            disabled: !canEditMeta,
            onChange: (e) => {
              const v = e.target.value;
              setNamedisplay(v);
              emit(v, desc, flags, routes);
            }
          }
        ),
        /* @__PURE__ */ jsx39(
          TextField14,
          {
            label: "Descripci\xF3n",
            size: "small",
            fullWidth: true,
            value: desc,
            disabled: !canEditMeta,
            onChange: (e) => {
              const v = e.target.value;
              setDesc(v);
              emit(namedisplay, v, flags, routes);
            }
          }
        )
      ] })
    ] }) : /* @__PURE__ */ jsxs33(Box26, { component: "section", className: "permisos-role-config-editor__meta permisos-role-config-editor__meta--readonly", children: [
      /* @__PURE__ */ jsx39(Typography23, { variant: "subtitle2", fontWeight: 700, sx: { mb: 0.75 }, children: roleNamedisplay(entry?.permisos) || roleTitleFromEntry(entry) }),
      roleDescripcion(entry?.permisos) ? /* @__PURE__ */ jsx39(Typography23, { variant: "body2", color: "text.secondary", children: roleDescripcion(entry?.permisos) }) : null
    ] }),
    /* @__PURE__ */ jsx39(Divider6, { className: "permisos-role-config-divider" }),
    /* @__PURE__ */ jsxs33(Box26, { component: "section", className: "permisos-role-config-editor__flags", children: [
      /* @__PURE__ */ jsx39(Typography23, { variant: "subtitle2", fontWeight: 700, sx: { mb: 0.75 }, children: "Privilegios globales" }),
      isVisitante ? /* @__PURE__ */ jsx39(Typography23, { variant: "body2", color: "text.secondary", children: "El rol visitante no usa privilegios globales ni acceso total." }) : /* @__PURE__ */ jsx39(Stack19, { spacing: 0.25, children: FLAG_DEFS.map((f) => /* @__PURE__ */ jsx39(Tooltip11, { title: f.hint, placement: "right", children: /* @__PURE__ */ jsx39(
        FormControlLabel3,
        {
          control: /* @__PURE__ */ jsx39(
            Checkbox2,
            {
              size: "small",
              checked: !!flags[f.key],
              disabled: !canEditPermisos,
              onChange: (e) => {
                if (!canEditPermisos) return;
                const nf = { ...flags, [f.key]: e.target.checked };
                setFlags(nf);
                emit(namedisplay, desc, nf, routes);
              }
            }
          ),
          label: /* @__PURE__ */ jsx39(Typography23, { variant: "body2", fontWeight: flags[f.key] ? 600 : 400, children: f.label })
        }
      ) }, f.key)) })
    ] }),
    /* @__PURE__ */ jsx39(Divider6, { className: "permisos-role-config-divider" }),
    /* @__PURE__ */ jsx39(Box26, { component: "section", className: "permisos-role-config-editor__routes", children: /* @__PURE__ */ jsx39(
      RoutePermCatalog,
      {
        routes,
        flags,
        permisos: entry?.permisos,
        canEdit: canEditPermisos,
        isVisitante,
        onRoutesChange: (nr) => {
          setRoutes(nr);
          emit(namedisplay, desc, flags, nr);
        }
      }
    ) })
  ] });
}
function RoleDragDialog({ open, pending, busy, sessionUsername, onClose, onConfirm }) {
  const [moveStep, setMoveStep] = useState27(false);
  useEffect23(() => {
    if (!open) setMoveStep(false);
  }, [open]);
  if (!pending) return null;
  const { username, fromRole, toRole, fromRoleTitle, toRoleTitle, fromJerarquia, toJerarquia, copyBlocked, copyBlockReason } = pending;
  const fromLabel = fromRoleTitle || fromRole;
  const toLabel = toRoleTitle || toRole;
  const isSelf = isSamePermisosUser(username, sessionUsername);
  const leavesDevLead = isTopDevLeadRole(fromRole, fromJerarquia);
  const copyDenied = !!copyBlocked;
  const copyDeniedReason = copyBlockReason || "En la misma rama jer\xE1rquica solo puede moverse el rol, no copiarse.";
  function confirm2(mode) {
    if (busy) return;
    if (mode === "copy" && copyDenied) return;
    onConfirm(mode);
  }
  function handleCopy() {
    if (copyDenied) return;
    confirm2("copy");
  }
  const moveBullets = moveRoleImpactBullets({ username, fromRoleTitle: fromLabel, toRoleTitle: toLabel, isSelf, leavesDevLead });
  return /* @__PURE__ */ jsx39(
    GlassDialog,
    {
      open,
      onClose: busy ? void 0 : onClose,
      maxWidth: "sm",
      fullWidth: true,
      disableEscapeKeyDown: busy,
      header: /* @__PURE__ */ jsx39(
        GlassDialogHeader,
        {
          icon: moveStep ? "mdi:alert-outline" : "mdi:account-switch",
          title: moveStep ? "Confirmar movimiento" : "Asignar rol",
          subtitle: `${username}: ${fromLabel} \u2192 ${toLabel}`,
          accent: moveStep ? "#f59e0b" : "#1e90ff",
          onClose: busy ? void 0 : onClose
        }
      ),
      children: !moveStep ? /* @__PURE__ */ jsxs33(Fragment12, { children: [
        /* @__PURE__ */ jsxs33(DialogContent11, { sx: glassDialogContentSx({ p: 2.5 }), children: [
          /* @__PURE__ */ jsxs33(Typography23, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: [
            "\xBFC\xF3mo asignar a ",
            /* @__PURE__ */ jsx39("strong", { children: username }),
            " el rol ",
            /* @__PURE__ */ jsx39("strong", { children: toLabel }),
            "?"
          ] }),
          copyDenied ? /* @__PURE__ */ jsx39(Alert14, { severity: "info", sx: { mb: 2 }, children: copyDeniedReason || "En la misma rama jer\xE1rquica solo puede moverse el rol, no copiarse." }) : null,
          /* @__PURE__ */ jsxs33(Stack19, { spacing: 1.25, children: [
            /* @__PURE__ */ jsx39(
              Button18,
              {
                variant: "outlined",
                fullWidth: true,
                disabled: busy || copyDenied,
                sx: { textTransform: "none", justifyContent: "flex-start", py: 1.25 },
                onClick: handleCopy,
                startIcon: busy ? /* @__PURE__ */ jsx39(CircularProgress15, { size: 16, color: "inherit" }) : /* @__PURE__ */ jsx39(Icon19, { icon: "mdi:content-copy", size: 18 }),
                children: busy ? "Procesando\u2026" : copyDenied ? "Copiar no disponible (misma rama)" : `Copiar (mantener tambi\xE9n en ${fromLabel})`
              }
            ),
            !copyDenied ? /* @__PURE__ */ jsx39(Typography23, { variant: "caption", color: "text.secondary", sx: { px: 0.5 }, children: "Copiar no quita el rol origen; no hay cambio de privilegios neto salvo sumar los del destino." }) : null,
            /* @__PURE__ */ jsx39(
              Button18,
              {
                variant: "contained",
                fullWidth: true,
                disabled: busy,
                sx: { textTransform: "none", justifyContent: "flex-start", py: 1.25 },
                onClick: () => setMoveStep(true),
                startIcon: /* @__PURE__ */ jsx39(Icon19, { icon: "mdi:arrow-right-bold", size: 18 }),
                children: copyDenied ? `Mover a ${toLabel} (quitar de ${fromLabel})\u2026` : `Mover (quitar de ${fromLabel})\u2026`
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx39(DialogActions9, { sx: glassDialogActionsSx(), children: /* @__PURE__ */ jsx39(Button18, { onClick: onClose, disabled: busy, sx: { textTransform: "none" }, children: "Cancelar" }) })
      ] }) : /* @__PURE__ */ jsxs33(Fragment12, { children: [
        /* @__PURE__ */ jsxs33(DialogContent11, { sx: glassDialogContentSx({ p: 2.5 }), children: [
          /* @__PURE__ */ jsxs33(Alert14, { severity: "warning", sx: { mb: 2 }, children: [
            "Mover implica ",
            /* @__PURE__ */ jsx39("strong", { children: "quitar" }),
            " a ",
            isSelf ? "ti" : username,
            " de ",
            /* @__PURE__ */ jsx39("strong", { children: fromLabel }),
            ". Revisa el impacto antes de confirmar."
          ] }),
          /* @__PURE__ */ jsxs33(Typography23, { variant: "body2", color: "text.secondary", sx: { mb: 1.5 }, children: [
            username,
            " pasar\xE1 de ",
            /* @__PURE__ */ jsx39("strong", { children: fromLabel }),
            " a ",
            /* @__PURE__ */ jsx39("strong", { children: toLabel }),
            " (sin duplicar el origen)."
          ] }),
          /* @__PURE__ */ jsx39(Box26, { component: "ul", sx: { m: 0, pl: 2.25, color: "text.secondary", fontSize: "0.875rem", "& li": { mb: 0.75 } }, children: moveBullets.map((line) => /* @__PURE__ */ jsx39("li", { children: renderImpactLine(line) }, line)) })
        ] }),
        /* @__PURE__ */ jsxs33(DialogActions9, { sx: glassDialogActionsSx(), children: [
          /* @__PURE__ */ jsx39(Button18, { onClick: () => setMoveStep(false), disabled: busy, sx: { textTransform: "none" }, children: "Atr\xE1s" }),
          /* @__PURE__ */ jsx39(
            Button18,
            {
              variant: "contained",
              color: "warning",
              disabled: busy,
              onClick: () => confirm2("move"),
              sx: { textTransform: "none", minWidth: 140 },
              startIcon: busy ? /* @__PURE__ */ jsx39(CircularProgress15, { size: 16, color: "inherit" }) : /* @__PURE__ */ jsx39(Icon19, { icon: "mdi:arrow-right-bold", size: 18 }),
              children: busy ? "Moviendo\u2026" : "Confirmar movimiento"
            }
          )
        ] })
      ] })
    }
  );
}
function RoleAddDialog({ open, pending, busy, onClose, onConfirm }) {
  const [username, setUsername] = useState27(null);
  useEffect23(() => {
    if (open) setUsername(null);
  }, [open]);
  if (!pending) return null;
  const { roleTitle: roleTitle2, role, existingUsernames, toJerarquia, columns } = pending;
  const roleLabel3 = roleTitle2 || role;
  const alreadyInRole = username && existingUsernames?.has(String(username).trim().toUpperCase());
  const userJerarquias = username ? userJerarquiasFromBoard(username, columns) : [];
  const addCheck = username && !alreadyInRole ? canAddUserToRole({ toJerarquia, userJerarquiasOnBoard: userJerarquias }) : { ok: true };
  const inheritanceBlocked = username && !alreadyInRole && !addCheck.ok;
  return /* @__PURE__ */ jsxs33(
    GlassDialog,
    {
      open,
      onClose: busy ? void 0 : onClose,
      maxWidth: "sm",
      fullWidth: true,
      header: /* @__PURE__ */ jsx39(GlassDialogHeader, { icon: "mdi:account-plus-outline", title: "Agregar al rol", subtitle: roleLabel3, accent: "#10b981", onClose: busy ? void 0 : onClose }),
      children: [
        /* @__PURE__ */ jsxs33(DialogContent11, { sx: glassDialogContentSx({ p: 2.5 }), children: [
          /* @__PURE__ */ jsxs33(Typography23, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: [
            "Busque un usuario en permisos ISS o escriba un login nuevo para asignarlo al rol ",
            /* @__PURE__ */ jsx39("strong", { children: roleLabel3 }),
            "."
          ] }),
          /* @__PURE__ */ jsx39(PermisosUserAutocomplete, { value: username, onChange: setUsername, disabled: busy, label: "Usuario" }),
          alreadyInRole ? /* @__PURE__ */ jsx39(Alert14, { severity: "warning", sx: { mt: 1.5 }, children: "Este usuario ya est\xE1 en el rol." }) : null,
          inheritanceBlocked ? /* @__PURE__ */ jsx39(Alert14, { severity: "warning", sx: { mt: 1.5 }, children: addCheck.reason }) : null
        ] }),
        /* @__PURE__ */ jsxs33(DialogActions9, { sx: glassDialogActionsSx(), children: [
          /* @__PURE__ */ jsx39(Button18, { onClick: onClose, disabled: busy, sx: { textTransform: "none" }, children: "Cancelar" }),
          /* @__PURE__ */ jsx39(
            Button18,
            {
              variant: "contained",
              disabled: busy || !username || alreadyInRole || inheritanceBlocked,
              onClick: () => onConfirm(username),
              sx: { textTransform: "none", minWidth: 120 },
              startIcon: busy ? /* @__PURE__ */ jsx39(CircularProgress15, { size: 16, color: "inherit" }) : /* @__PURE__ */ jsx39(Icon19, { icon: "mdi:account-plus-outline", size: 18 }),
              children: busy ? "Agregando\u2026" : "Agregar"
            }
          )
        ] })
      ]
    }
  );
}
function RoleRemoveDialog({ open, pending, busy, sessionUsername, onClose, onConfirm }) {
  if (!pending) return null;
  const { username, roleTitle: roleTitle2, role, fromJerarquia } = pending;
  const roleLabel3 = roleTitle2 || role;
  const isSelf = isSamePermisosUser(username, sessionUsername);
  const isDevLead = isTopDevLeadRole(role, fromJerarquia);
  const bullets = removeRoleImpactBullets({ username, roleTitle: roleLabel3, isSelf, isDevLead });
  return /* @__PURE__ */ jsxs33(
    GlassDialog,
    {
      open,
      onClose: busy ? void 0 : onClose,
      maxWidth: "sm",
      fullWidth: true,
      disableEscapeKeyDown: busy,
      header: /* @__PURE__ */ jsx39(GlassDialogHeader, { icon: "mdi:account-remove-outline", title: "Quitar del rol", subtitle: `${username} \xB7 ${roleLabel3}`, accent: "#f59e0b", onClose: busy ? void 0 : onClose }),
      children: [
        /* @__PURE__ */ jsxs33(DialogContent11, { sx: glassDialogContentSx({ p: 2.5 }), children: [
          /* @__PURE__ */ jsx39(Alert14, { severity: "warning", sx: { mb: 2 }, children: isSelf && isDevLead ? "Te quitar\xE1s dev_lead (m\xE1ximo privilegio). Otro dev_lead o un ajuste en BD ser\xE1 necesario para recuperarlo." : "Esta acci\xF3n revoca permisos de forma inmediata. Revise las consecuencias antes de confirmar." }),
          /* @__PURE__ */ jsxs33(Typography23, { variant: "body2", color: "text.secondary", sx: { mb: 1.5 }, children: [
            "\xBFQuitar a ",
            /* @__PURE__ */ jsx39("strong", { children: username }),
            " del rol ",
            /* @__PURE__ */ jsx39("strong", { children: roleLabel3 }),
            "?"
          ] }),
          /* @__PURE__ */ jsx39(Box26, { component: "ul", sx: { m: 0, pl: 2.25, color: "text.secondary", fontSize: "0.875rem", "& li": { mb: 0.75 } }, children: bullets.map((line) => /* @__PURE__ */ jsx39("li", { children: renderImpactLine(line) }, line)) })
        ] }),
        /* @__PURE__ */ jsxs33(DialogActions9, { sx: glassDialogActionsSx(), children: [
          /* @__PURE__ */ jsx39(Button18, { onClick: onClose, disabled: busy, sx: { textTransform: "none" }, children: "Cancelar" }),
          /* @__PURE__ */ jsx39(
            Button18,
            {
              variant: "contained",
              color: "warning",
              disabled: busy,
              onClick: onConfirm,
              sx: { textTransform: "none", minWidth: 120 },
              startIcon: busy ? /* @__PURE__ */ jsx39(CircularProgress15, { size: 16, color: "inherit" }) : /* @__PURE__ */ jsx39(Icon19, { icon: "mdi:account-remove-outline", size: 18 }),
              children: busy ? "Quitando\u2026" : "Confirmar"
            }
          )
        ] })
      ]
    }
  );
}

// js/tools/PermisosKanban.jsx
import { Fragment as Fragment13, jsx as jsx40, jsxs as jsxs34 } from "react/jsx-runtime";
var { useState: useState28, useMemo: useMemo15, useRef: useRef12, useEffect: useEffect24, memo: memo3 } = getReact();
var { createPortal } = getReactDOM();
var { Box: Box27, Paper: Paper3, Typography: Typography24, Stack: Stack20, Chip: Chip16, IconButton: IconButton12, Tooltip: Tooltip12, CircularProgress: CircularProgress16 } = getMaterialUI();
var { Icon: Icon20 } = UI;
var DRAG_THRESHOLD_PX2 = 6;
var UserCard = memo3(function UserCard2({ card, columnId, columnTitle, columnJerarquia, canDragUser, isDragSource, userBusy, isSelected, isDimmed, onPointerDragStart, onRoleRemoveRequest, onUserSelect, onUserSummary, suppressClickRef }) {
  const canDragRole = !!canDragUser && !userBusy;
  const labels = card.labels ?? userCardLabels(card.username, card.displayName);
  const cardClass = [
    "paty-todos-card",
    "paty-permisos-user-card",
    "isa-glass-card",
    canDragRole ? "paty-todos-card--draggable" : "",
    isDragSource ? "paty-todos-card--drag-source" : "",
    userBusy ? "paty-permisos-user-card--user-busy" : "",
    isSelected ? "paty-permisos-user-card--selected" : "",
    isDimmed ? "paty-permisos-user-card--dimmed" : ""
  ].filter(Boolean).join(" ");
  return /* @__PURE__ */ jsx40(
    Paper3,
    {
      className: cardClass,
      elevation: 0,
      "aria-busy": userBusy || void 0,
      onPointerDown: canDragRole ? (e) => {
        if (e.button !== 0 && e.pointerType !== "touch") return;
        if (e.target.closest(".paty-permisos-user-card__remove, .paty-permisos-user-card__busy")) return;
        onPointerDragStart(card.id, columnId, card.username, e);
      } : void 0,
      onClick: (e) => {
        if (suppressClickRef.current) {
          suppressClickRef.current = false;
          return;
        }
        if (userBusy || e.target.closest(".paty-permisos-user-card__remove, .paty-permisos-user-card__busy")) return;
        e.stopPropagation();
        onUserSelect?.(card.username);
      },
      onDoubleClick: (e) => {
        if (userBusy || e.target.closest(".paty-permisos-user-card__remove, .paty-permisos-user-card__busy")) return;
        e.stopPropagation();
        onUserSummary?.(card.username);
      },
      children: /* @__PURE__ */ jsxs34(Stack20, { direction: "row", alignItems: "center", spacing: 0.25, className: "paty-permisos-user-card__row", sx: { minWidth: 0 }, children: [
        /* @__PURE__ */ jsxs34(Box27, { className: "paty-permisos-user-card__body", sx: { minWidth: 0, flex: 1 }, children: [
          /* @__PURE__ */ jsx40(Typography24, { className: "paty-todos-card__title", component: "div", variant: "body2", fontWeight: 700, noWrap: true, title: labels.primary, children: labels.primary }),
          labels.secondary ? /* @__PURE__ */ jsx40(Typography24, { className: "paty-todos-card__caption", component: "div", variant: "caption", color: "text.secondary", noWrap: true, title: labels.secondary, children: labels.secondary }) : null
        ] }),
        userBusy ? /* @__PURE__ */ jsx40(Tooltip12, { title: "Procesando\u2026", children: /* @__PURE__ */ jsx40("span", { className: "paty-permisos-user-card__busy", "aria-label": "Procesando", children: /* @__PURE__ */ jsx40(CircularProgress16, { size: 14, thickness: 5, color: "inherit" }) }) }) : canDragRole ? /* @__PURE__ */ jsx40(Tooltip12, { title: `Quitar de ${columnTitle || columnId}`, children: /* @__PURE__ */ jsx40("span", { className: "paty-permisos-user-card__remove-wrap", children: /* @__PURE__ */ jsx40(
          IconButton12,
          {
            size: "small",
            type: "button",
            className: "paty-permisos-user-card__remove",
            "aria-label": `Quitar de ${columnTitle || columnId}`,
            onPointerDown: (e) => {
              e.stopPropagation();
            },
            onClick: (e) => {
              e.stopPropagation();
              e.preventDefault();
              onRoleRemoveRequest?.({ cardId: card.id, username: card.username, role: columnId, roleTitle: columnTitle, fromJerarquia: columnJerarquia });
            },
            children: /* @__PURE__ */ jsx40(Icon20, { icon: "mdi:close", size: 14 })
          }
        ) }) }) : null
      ] })
    }
  );
});
function DragGhost2({ card, column, x, y, width }) {
  if (column) {
    const node2 = /* @__PURE__ */ jsx40(
      Paper3,
      {
        className: "paty-todos-card paty-permisos-column-ghost paty-todos-card--ghost isa-glass-card",
        elevation: 8,
        style: { position: "fixed", left: x, top: y, width, zIndex: 1e4, pointerEvents: "none", margin: 0 },
        "aria-hidden": true,
        children: /* @__PURE__ */ jsxs34(Stack20, { direction: "row", alignItems: "center", spacing: 0.75, sx: { minWidth: 0 }, children: [
          /* @__PURE__ */ jsx40(Icon20, { icon: column.icon, size: 16 }),
          /* @__PURE__ */ jsx40(Typography24, { className: "paty-todos-card__title", variant: "body2", fontWeight: 700, noWrap: true, children: column.title })
        ] })
      }
    );
    return typeof document !== "undefined" ? createPortal(node2, document.body) : node2;
  }
  if (!card) return null;
  const labels = card.labels ?? userCardLabels(card.username, card.displayName);
  const node = /* @__PURE__ */ jsxs34(
    Paper3,
    {
      className: "paty-todos-card paty-permisos-user-card paty-permisos-drag-ghost paty-todos-card--ghost isa-glass-card",
      elevation: 8,
      style: { position: "fixed", left: x, top: y, width, zIndex: 1e4, pointerEvents: "none", margin: 0 },
      "aria-hidden": true,
      children: [
        /* @__PURE__ */ jsx40(Typography24, { className: "paty-todos-card__title", variant: "body2", fontWeight: 700, noWrap: true, children: labels.primary }),
        labels.secondary ? /* @__PURE__ */ jsx40(Typography24, { className: "paty-todos-card__caption", variant: "caption", color: "text.secondary", noWrap: true, children: labels.secondary }) : null
      ]
    }
  );
  return typeof document !== "undefined" ? createPortal(node, document.body) : node;
}
function PermisosKanban({ boardData, loggedIn, canAssignRoles, readOnly, canManage, canEditRoleDescriptions, busy, actorJerarquia, actorJerarquias, sessionUsername, filterToolbarRef, onUserFilterDrop, onRoleFilterDrop, onDragOverFilterChange, onRoleSave, onRoleDrag, onRoleRemove, onRoleAdd, onJerarquiaToast, onOpenRoleHierarchy, onUserSummary }) {
  const [dragOverCol, setDragOverCol] = useState28(null);
  const [draggingId, setDraggingId] = useState28(null);
  const [dragGhost, setDragGhost] = useState28(null);
  const [configCol] = useState28(null);
  const [dragPending, setDragPending] = useState28(null);
  const [removePending, setRemovePending] = useState28(null);
  const [addPending, setAddPending] = useState28(null);
  const [addingRoleId, setAddingRoleId] = useState28(null);
  const [processingUsername, setProcessingUsername] = useState28(null);
  const [selectedUsername, setSelectedUsername] = useState28(null);
  const [dragSourceCol, setDragSourceCol] = useState28(null);
  const effectiveActorJerarquias = useMemo15(() => {
    if (Array.isArray(actorJerarquias) && actorJerarquias.length) return actorJerarquias;
    if (actorJerarquia != null && String(actorJerarquia).trim()) return [String(actorJerarquia).trim()];
    return [];
  }, [actorJerarquias, actorJerarquia]);
  const kanbanWrapRef = useRef12(null);
  const listRefs = useRef12({});
  const columnRefs = useRef12({});
  const dragRef = useRef12(null);
  const cardElRef = useRef12(null);
  const suppressClickRef = useRef12(false);
  const processingUserRef = useRef12(null);
  const dragPendingRef = useRef12(null);
  const columns = boardData?.columns ?? [];
  const filterActive = !!boardData?.filterActive;
  const assignEnabled = !!loggedIn && !!canAssignRoles;
  const filterDragEnabled = !!loggedIn && !canAssignRoles;
  const noUsersVisible = !!boardData?.noUsersVisible;
  const columnIds = useMemo15(() => columns.map((c) => c.id), [columns]);
  const ghostColumn = useMemo15(() => {
    if (!dragGhost?.columnId) return null;
    return columns.find((c) => c.id === dragGhost.columnId) ?? null;
  }, [dragGhost, columns]);
  const ghostCard = useMemo15(() => {
    if (!dragGhost?.cardId) return null;
    for (const col of columns) {
      const hit = col.users.find((u) => u.id === dragGhost.cardId);
      if (hit) return hit;
    }
    return null;
  }, [dragGhost, columns]);
  const selectedUserKey = selectedUsername ? String(selectedUsername).trim().toUpperCase() : null;
  const processingUserKey = processingUsername ? String(processingUsername).trim().toUpperCase() : null;
  useEffect24(() => {
    dragPendingRef.current = dragPending;
  }, [dragPending]);
  function userKey(username) {
    return String(username ?? "").trim().toUpperCase();
  }
  function beginUserProcessing(username) {
    const key = userKey(username);
    if (!key || processingUserRef.current) return null;
    processingUserRef.current = key;
    setProcessingUsername(key);
    return key;
  }
  function endUserProcessing() {
    processingUserRef.current = null;
    setProcessingUsername(null);
  }
  useEffect24(() => {
    function onDocPointerDown(e) {
      if (e.target.closest(".paty-permisos-user-card")) return;
      if (e.target.closest(".MuiDialog-root, .isa-glass-dialog")) return;
      setSelectedUsername(null);
    }
    document.addEventListener("pointerdown", onDocPointerDown, true);
    return () => document.removeEventListener("pointerdown", onDocPointerDown, true);
  }, []);
  function handleUserSelect(username) {
    const key = String(username ?? "").trim().toUpperCase();
    if (!key || processingUserKey === key) return;
    setSelectedUsername((prev) => prev && String(prev).trim().toUpperCase() === key ? null : key);
  }
  async function handleRemoveConfirm() {
    if (!removePending || !onRoleRemove || processingUserRef.current) return;
    if (!beginUserProcessing(removePending.username)) return;
    try {
      await onRoleRemove(removePending);
      setRemovePending(null);
    } catch {
    } finally {
      endUserProcessing();
    }
  }
  async function handleDragConfirm(mode) {
    const pending = dragPendingRef.current;
    if (!pending || !onRoleDrag || processingUserRef.current) return;
    if (!beginUserProcessing(pending.username)) return;
    if (mode === "copy" && pending.copyBlocked) return;
    setDragPending(null);
    try {
      await onRoleDrag({ ...pending, mode });
    } catch {
    } finally {
      endUserProcessing();
    }
  }
  async function handleAddConfirm(username) {
    if (!addPending || !onRoleAdd || addingRoleId || !username) return;
    setAddingRoleId(addPending.role);
    try {
      await onRoleAdd({ username, role: addPending.role, roleTitle: addPending.roleTitle });
      setAddPending(null);
    } catch {
    } finally {
      setAddingRoleId(null);
    }
  }
  function finishDrag(clientX, clientY) {
    const state = dragRef.current;
    dragRef.current = null;
    setDraggingId(null);
    setDragOverCol(null);
    setDragSourceCol(null);
    setDragGhost(null);
    cardElRef.current = null;
    if (!state?.moved) return;
    suppressClickRef.current = true;
    if (filterToolbarRef && pointInRef(filterToolbarRef, clientX, clientY)) {
      if (state.kind === "column") onRoleFilterDrop?.(state.columnId);
      else if (state.username && filterDragEnabled) onUserFilterDrop?.(state.username);
      return;
    }
    if (state.kind === "column") return;
    if (!assignEnabled) return;
    if (processingUserRef.current) return;
    const targetCol = columnAtPoint2(columnIds, columnRefs, clientX, clientY);
    if (!targetCol || targetCol === state.sourceColumnId) return;
    const username = state.username;
    if (processingUserRef.current && userKey(username) === processingUserRef.current) return;
    const fromRole = state.sourceColumnId;
    const toRole = targetCol;
    const sourceColData = columns.find((c) => c.id === fromRole);
    const targetColData = columns.find((c) => c.id === toRole);
    if (targetColData?.users?.some((u) => u.username === username)) return;
    if (!canActorTransferUser(effectiveActorJerarquias, sourceColData, targetColData)) {
      onJerarquiaToast?.({
        type: "info",
        message: `Tu jerarqu\xEDa (${effectiveActorJerarquias.join(", ") || "?"}) no puede mover usuarios entre ${sourceColData?.title ?? fromRole} (${sourceColData?.jerarquia ?? "?"}) y ${targetColData?.title ?? toRole} (${targetColData?.jerarquia ?? "?"})`,
        actorJerarquia: effectiveActorJerarquias.join("|"),
        targetJerarquia: targetColData?.jerarquia,
        targetRole: toRole
      });
      return;
    }
    const userJerarquiasOnBoard = userJerarquiasFromBoard(username, columns);
    const copyCheck = canCopyUserRole({
      fromJerarquia: sourceColData?.jerarquia,
      toJerarquia: targetColData?.jerarquia,
      userJerarquiasOnBoard
    });
    setDragPending({
      username: userKey(username),
      fromRole,
      toRole,
      fromRoleTitle: sourceColData?.title ?? fromRole,
      toRoleTitle: targetColData?.title ?? toRole,
      fromJerarquia: sourceColData?.jerarquia,
      toJerarquia: targetColData?.jerarquia,
      userJerarquiasOnBoard,
      copyBlocked: !copyCheck.ok,
      copyBlockReason: copyCheck.reason
    });
  }
  function handleColumnHeadDragStart(col, e) {
    if (!filterDragEnabled) return;
    if (e.target.closest("button, .MuiIconButton-root")) return;
    if (processingUserRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    dragRef.current = {
      kind: "column",
      columnId: col.id,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      ghostWidth: rect.width,
      moved: false,
      pointerId: e.pointerId
    };
    cardElRef.current = e.currentTarget;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
    }
  }
  function handlePointerDragStart(cardId, sourceColumnId, username, e) {
    const key = userKey(username);
    if (processingUserRef.current && key === processingUserRef.current) return;
    if (!assignEnabled) return;
    const sourceColData = columns.find((c) => c.id === sourceColumnId);
    if (!canActorManageColumn(effectiveActorJerarquias, sourceColData)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    dragRef.current = {
      kind: "user",
      cardId,
      sourceColumnId,
      username,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      ghostWidth: rect.width,
      moved: false,
      pointerId: e.pointerId
    };
    cardElRef.current = e.currentTarget;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
    }
  }
  useEffect24(() => {
    function onPointerMove(e) {
      const state = dragRef.current;
      if (!state || e.pointerId !== state.pointerId) return;
      const dx = Math.abs(e.clientX - state.startX);
      const dy = Math.abs(e.clientY - state.startY);
      if (!state.moved && dx + dy < DRAG_THRESHOLD_PX2) return;
      if (!state.moved) {
        state.moved = true;
        if (state.kind === "column") setDraggingId(`col:${state.columnId}`);
        else setDraggingId(state.cardId);
        setDragSourceCol(state.sourceColumnId ?? null);
        if (state.ghostWidth != null) {
          setDragGhost({
            cardId: state.cardId,
            columnId: state.columnId,
            x: e.clientX - state.offsetX,
            y: e.clientY - state.offsetY,
            width: state.ghostWidth
          });
        }
      }
      e.preventDefault();
      if (state.ghostWidth != null) {
        setDragGhost({ cardId: state.cardId, columnId: state.columnId, x: e.clientX - state.offsetX, y: e.clientY - state.offsetY, width: state.ghostWidth });
      }
      const overFilter = filterToolbarRef && pointInRef(filterToolbarRef, e.clientX, e.clientY);
      onDragOverFilterChange?.(!!overFilter);
      if (overFilter || state.kind === "column") setDragOverCol(null);
      else setDragOverCol(assignEnabled ? columnAtPoint2(columnIds, columnRefs, e.clientX, e.clientY) : null);
    }
    function onPointerUp(e) {
      const state = dragRef.current;
      if (!state || e.pointerId !== state.pointerId) return;
      onDragOverFilterChange?.(false);
      finishDrag(e.clientX, e.clientY);
    }
    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [assignEnabled, columnIds, columns, processingUserKey, filterToolbarRef, onDragOverFilterChange, effectiveActorJerarquias, loggedIn, canAssignRoles]);
  if (!boardData) return null;
  const transferBusy = !!processingUserKey;
  const removeBusy = transferBusy && !!removePending;
  const addBusy = !!addingRoleId;
  return /* @__PURE__ */ jsxs34(Box27, { ref: kanbanWrapRef, className: "paty-todos-kanban-wrap paty-permisos-kanban-wrap", sx: { flex: 1, minHeight: 0, height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", p: 0 }, children: [
    /* @__PURE__ */ jsxs34(Box27, { className: `paty-todos-kanban paty-permisos-kanban${!assignEnabled ? " paty-permisos-kanban--no-assign" : ""}${draggingId ? " paty-todos-kanban--dragging" : ""}${selectedUserKey ? " paty-permisos-kanban--user-selected" : ""}${processingUserKey ? " paty-permisos-kanban--user-busy" : ""}`, sx: { flex: 1, minHeight: 0, maxHeight: "100%", display: "flex", alignItems: "stretch", alignSelf: "stretch", position: "relative" }, children: [
      dragGhost ? /* @__PURE__ */ jsx40(DragGhost2, { card: ghostCard, column: ghostColumn, x: dragGhost.x, y: dragGhost.y, width: dragGhost.width }) : null,
      noUsersVisible ? /* @__PURE__ */ jsx40(Box27, { sx: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", p: 3, pointerEvents: "none", zIndex: 2 }, children: /* @__PURE__ */ jsx40(Typography24, { variant: "body2", color: "text.secondary", children: "Ning\xFAn usuario coincide con los filtros." }) }) : null,
      columns.length === 0 ? /* @__PURE__ */ jsx40(Box27, { sx: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", p: 3 }, children: /* @__PURE__ */ jsx40(Typography24, { variant: "body2", color: "text.secondary", children: boardData?.hideEmptyColumns ? "No hay columnas visibles (activa roles o desactiva \xABOcultar vac\xEDos\xBB)." : "No hay roles configurados." }) }) : null,
      columns.map((col) => {
        const canManageCol = assignEnabled && canActorManageColumn(effectiveActorJerarquias, col);
        const canDropOnCol = canManageCol;
        const isOver = draggingId && !String(draggingId).startsWith("col:") && dragOverCol === col.id;
        const isOverAllowed = isOver && canDropOnCol;
        const isOverBlocked = isOver && !canDropOnCol;
        const isSource = draggingId && !String(draggingId).startsWith("col:") && dragSourceCol === col.id;
        const colClass = [
          "paty-todos-column",
          "paty-permisos-column",
          col.roleFilteredOut ? "paty-permisos-column--role-filtered" : "",
          isOverAllowed ? "paty-permisos-column--drag-over" : "",
          isOverBlocked ? "paty-permisos-column--drop-blocked" : "",
          isSource && !isOver ? "paty-permisos-column--drag-source" : "",
          draggingId && !String(draggingId).startsWith("col:") && !isOver && assignEnabled && !canDropOnCol ? "paty-permisos-column--drop-forbidden" : "",
          draggingId && !String(draggingId).startsWith("col:") && !isOver ? "paty-permisos-column--drag-idle" : ""
        ].filter(Boolean).join(" ");
        return /* @__PURE__ */ jsxs34(
          Box27,
          {
            ref: (el) => {
              columnRefs.current[col.id] = el;
            },
            className: colClass,
            style: { "--col-accent": col.accent },
            sx: { display: "flex", flexDirection: "column", minHeight: 0, height: "100%", alignSelf: "stretch" },
            children: [
              /* @__PURE__ */ jsxs34(
                Stack20,
                {
                  direction: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  spacing: 1,
                  className: `paty-todos-column__head${filterDragEnabled ? " paty-permisos-column__head--filter-draggable" : ""}`,
                  sx: { flexShrink: 0, px: 1.75, py: 1.25, pb: 1, cursor: filterDragEnabled ? "grab" : "default" },
                  onPointerDown: (e) => handleColumnHeadDragStart(col, e),
                  children: [
                    /* @__PURE__ */ jsxs34(Stack20, { direction: "row", alignItems: "center", spacing: 0.75, className: "paty-todos-column__title", sx: { minWidth: 0, flex: 1 }, children: [
                      /* @__PURE__ */ jsx40(Icon20, { icon: col.icon, size: 16 }),
                      /* @__PURE__ */ jsxs34(Box27, { sx: { minWidth: 0 }, children: [
                        /* @__PURE__ */ jsx40(Stack20, { direction: "row", alignItems: "baseline", spacing: 0.75, sx: { minWidth: 0 }, children: /* @__PURE__ */ jsx40(Box27, { component: "span", sx: { display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 700 }, title: col.jerarquia ? `${col.title} \xB7 Jerarqu\xEDa ${col.jerarquia}${col.roleName && col.title !== col.roleName ? ` (${col.roleName})` : ""}` : col.roleName && col.title !== col.roleName ? `${col.title} (${col.roleName})` : col.title, children: col.title }) }),
                        col.descripcion ? /* @__PURE__ */ jsx40(Typography24, { variant: "caption", color: "text.secondary", sx: { display: "block", lineHeight: 1.3, mt: 0.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, title: col.descripcion, children: col.descripcion }) : null
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs34(Stack20, { direction: "row", alignItems: "center", spacing: 0.5, sx: { flexShrink: 0 }, children: [
                      onOpenRoleHierarchy ? /* @__PURE__ */ jsx40(Tooltip12, { title: `Ver/editar ${col.title || col.id} en jerarqu\xEDa`, children: /* @__PURE__ */ jsx40(
                        IconButton12,
                        {
                          size: "small",
                          className: "paty-permisos-column__hierarchy",
                          "aria-label": `Jerarqu\xEDa ${col.title || col.id}`,
                          onPointerDown: (e) => e.stopPropagation(),
                          onClick: (e) => {
                            e.stopPropagation();
                            onOpenRoleHierarchy(col.roleName ?? col.id);
                          },
                          children: /* @__PURE__ */ jsx40(Icon20, { icon: "mdi:family-tree", size: 16 })
                        }
                      ) }) : null,
                      canManageCol ? /* @__PURE__ */ jsx40(Tooltip12, { title: addBusy && addingRoleId === col.id ? "Agregando\u2026" : "Agregar usuario", children: /* @__PURE__ */ jsx40("span", { className: "paty-permisos-column__add-wrap", children: /* @__PURE__ */ jsx40(
                        IconButton12,
                        {
                          size: "small",
                          className: "paty-permisos-column__add",
                          disabled: addBusy,
                          "aria-label": `Agregar usuario a ${col.title || col.id}`,
                          onClick: () => {
                            if (addBusy) return;
                            setAddPending({
                              role: col.id,
                              roleTitle: col.title,
                              toJerarquia: col.jerarquia,
                              columns,
                              existingUsernames: new Set(col.users.map((u) => u.username))
                            });
                          },
                          children: addBusy && addingRoleId === col.id ? /* @__PURE__ */ jsx40(CircularProgress16, { size: 14, thickness: 5 }) : /* @__PURE__ */ jsx40(Icon20, { icon: "mdi:plus", size: 16 })
                        }
                      ) }) }) : null
                    ] })
                  ]
                }
              ),
              /* @__PURE__ */ jsxs34(
                Box27,
                {
                  ref: (el) => {
                    listRefs.current[col.id] = el;
                  },
                  "data-column-id": col.id,
                  className: `paty-todos-column__list paty-permisos-column__list${isOverAllowed ? " paty-todos-column__list--drag-over" : ""}${isOverBlocked ? " paty-todos-column__list--drop-blocked" : ""}`,
                  sx: { flex: 1, minHeight: 0, overflowY: "auto", p: 1.25, px: 1.5, boxSizing: "border-box" },
                  children: [
                    col.users.map((card) => {
                      const cardUserKey = userKey(card.username);
                      const userBusy = !!processingUserKey && processingUserKey === cardUserKey;
                      const isSelected = selectedUserKey === cardUserKey;
                      const isDimmed = !!selectedUserKey && !isSelected;
                      const canDragUser = canManageCol;
                      return /* @__PURE__ */ jsx40(
                        UserCard,
                        {
                          card,
                          columnId: col.id,
                          columnTitle: col.title,
                          columnJerarquia: col.jerarquia,
                          canDragUser,
                          isDragSource: draggingId === card.id,
                          userBusy,
                          isSelected,
                          isDimmed,
                          onPointerDragStart: handlePointerDragStart,
                          onRoleRemoveRequest: setRemovePending,
                          onUserSelect: handleUserSelect,
                          onUserSummary,
                          suppressClickRef
                        },
                        card.id
                      );
                    }),
                    !col.users.length ? /* @__PURE__ */ jsx40(Typography24, { variant: "caption", color: "text.secondary", sx: { px: 0.5, py: 1 }, children: "Sin usuarios" }) : null
                  ]
                }
              )
            ]
          },
          col.id
        );
      })
    ] }),
    typeof document !== "undefined" ? createPortal(/* @__PURE__ */ jsxs34(Fragment13, { children: [
      /* @__PURE__ */ jsx40(
        RoleDragDialog,
        {
          open: !!dragPending,
          pending: dragPending,
          busy: transferBusy,
          sessionUsername,
          onClose: () => {
            if (!transferBusy) setDragPending(null);
          },
          onConfirm: handleDragConfirm
        }
      ),
      /* @__PURE__ */ jsx40(
        RoleRemoveDialog,
        {
          open: !!removePending,
          pending: removePending,
          busy: removeBusy,
          sessionUsername,
          onClose: () => {
            if (!removeBusy) setRemovePending(null);
          },
          onConfirm: handleRemoveConfirm
        }
      ),
      /* @__PURE__ */ jsx40(
        RoleAddDialog,
        {
          open: !!addPending,
          pending: addPending,
          busy: addBusy,
          onClose: () => {
            if (!addBusy) setAddPending(null);
          },
          onConfirm: handleAddConfirm
        }
      )
    ] }), document.body) : null
  ] });
}

// js/tools/PermisosRoleFilterAutocomplete.jsx
import { jsx as jsx41 } from "react/jsx-runtime";
var { Autocomplete: Autocomplete4, TextField: TextField15, Chip: Chip17 } = getMaterialUI();
function PermisosRoleFilterAutocomplete({ options, value, onChange, disabled = false }) {
  const selected = options.filter((o) => value.includes(o.id));
  return /* @__PURE__ */ jsx41(
    Autocomplete4,
    {
      multiple: true,
      size: "small",
      disabled,
      className: "config-permisos-toolbar__field config-permisos-toolbar__field--role",
      options,
      value: selected,
      onChange: (_, next) => onChange(next.map((o) => o.id)),
      getOptionLabel: (o) => o.label,
      isOptionEqualToValue: (a, b) => a.id === b.id,
      disableCloseOnSelect: true,
      limitTags: 2,
      renderTags: (tagValue, getTagProps) => tagValue.map((option, index) => {
        const { key, ...chipProps } = getTagProps({ index });
        return /* @__PURE__ */ jsx41(Chip17, { ...chipProps, label: option.label, size: "small", className: "isa-neon-glass-chip" }, key);
      }),
      renderInput: (params) => /* @__PURE__ */ jsx41(TextField15, { ...params, label: "Roles", placeholder: selected.length ? "" : "Todos" })
    }
  );
}

// js/tools/roleHierarchyTree/RoleHierarchyView.tsx
import * as React2 from "react";

// js/ui/treeView/TreeRowItem.tsx
import * as React from "react";

// js/ui/treeView/treeDrag.ts
function resolveDragZone(clientY, rectTop, rectHeight, isGrouper) {
  if (isGrouper) {
    const y = clientY - rectTop;
    const topBand = rectHeight * 0.25;
    const bottomBand = rectHeight * 0.75;
    if (y < topBand) return "before";
    if (y > bottomBand) return "after";
    return "into";
  }
  const midY = rectTop + rectHeight / 2;
  return clientY < midY ? "before" : "after";
}
function summaryDragClass(dragOver, forbidden) {
  if (!dragOver) return "";
  if (forbidden) {
    if (dragOver === "before") return "trvwr-itm-sum--drg-forbidden-bf";
    if (dragOver === "after") return "trvwr-itm-sum--drg-forbidden-aftr";
    return "trvwr-itm-sum--drg-forbidden-into";
  }
  if (dragOver === "before") return "trvwr-itm-sum--drg-bf";
  if (dragOver === "after") return "trvwr-itm-sum--drg-aftr";
  return "trvwr-itm-sum--drg-into";
}

// js/ui/treeView/TreeRowItem.tsx
import { Fragment as Fragment14, jsx as jsx42, jsxs as jsxs35 } from "react/jsx-runtime";
var { IconButton: IconButton13, Tooltip: Tooltip13 } = getMaterialUI();
function TreeRow({ node, ...ctx }) {
  const {
    items,
    manifest,
    customs,
    collapsed,
    selectedPath,
    highlightedPath,
    canMutate,
    drag,
    onToggleCollapse,
    onSelect,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDragEnd,
    onDrop
  } = ctx;
  const features = manifest.features ?? {};
  const icons = manifest.icons ?? {};
  const path = node.flatPath;
  const isOpen = !collapsed.has(path);
  const isGrouper = customs.isGrouper ? customs.isGrouper(node) : node.hasChildren;
  const isSelected = selectedPath === path;
  const isHighlighted = highlightedPath === path;
  const isDragging = drag.sourcePath === path;
  const isDragTarget = drag.overPath === path;
  const dragZone = isDragTarget ? drag.overZone : null;
  const dragForbidden = isDragTarget && drag.forbidden;
  const childCount = node.childrens.length;
  const rowCtx = { node, isOpen, isSelected, isGrouper, childCount };
  const iconCtx = { ...rowCtx, isExpanded: isOpen };
  const label = customs.getLabel?.(node) ?? path;
  const helper = features.showHelper !== false ? customs.getHelper?.(node) ?? null : null;
  const pathLabel = features.showPathLabel !== false ? customs.getPathLabel?.(node) ?? path : null;
  const grouperIcons = customs.getGrouperIcons?.(iconCtx) ?? {
    open: icons.grouperOpen ?? "mdi:folder-open",
    closed: icons.grouperClosed ?? "mdi:folder",
    color: icons.grouperColor ?? "#FFA000"
  };
  const leafIcon = customs.getLeafIcon?.(iconCtx) ?? icons.leaf ?? "mdi:circle-small";
  const rowActions = features.rowActions !== false && canMutate ? customs.rowActions?.(node) ?? [] : [];
  const detailsRef = React.useRef(null);
  const dragEnterCount = React.useRef(0);
  const cachedRect = React.useRef(null);
  const summaryClass = [
    "trvwr-itm-sum",
    isHighlighted ? "trvwr-itm-sum--focused" : "",
    summaryDragClass(dragZone, dragForbidden),
    !canMutate ? "trvwr-itm-sum--disabled" : ""
  ].filter(Boolean).join(" ");
  const detailsClass = [
    "trvwr-itm",
    isHighlighted ? "highlight" : "",
    isDragging ? "trvwr-itm--dragging" : "",
    isSelected && isGrouper ? "trvwr-itm--folder-selected" : "",
    isSelected ? "trvwr-itm--active" : ""
  ].filter(Boolean).join(" ");
  const handleToggle = (e) => {
    if (!canMutate || features.collapse === false) {
      e.preventDefault();
      if (detailsRef.current) detailsRef.current.open = isOpen;
      return;
    }
    const open = e.currentTarget.open;
    if (open !== isOpen) {
      onToggleCollapse(path, open);
      customs.onExpand?.(node, open);
    }
  };
  const handleSummaryClick = (e) => {
    const target = e.target;
    if (target.closest(".trvwr-drag-handle")) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (!canMutate || features.collapse === false) {
      e.preventDefault();
      if (detailsRef.current) detailsRef.current.open = isOpen;
    } else {
      const clickedSymbol = target.closest(".trvwr-itm-symb");
      if (isGrouper && clickedSymbol) {
        e.preventDefault();
        onToggleCollapse(path, !isOpen);
        customs.onExpand?.(node, !isOpen);
      }
    }
    onSelect(path);
    customs.onSelect?.(node);
  };
  const dragEnabled = canMutate && features.drag !== false;
  const handleDragStart = (e) => {
    if (!dragEnabled) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", path);
    const summary = e.currentTarget.closest("summary") ?? e.currentTarget;
    const h = Math.max(24, Math.round(summary.getBoundingClientRect().height));
    e.dataTransfer.setData("application/x-trvwr-row-height", String(h));
    onDragStart(path, h);
  };
  const handleDragOver = (e) => {
    if (!dragEnabled || !drag.sourcePath) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (drag.sourcePath === path) return;
    if (!cachedRect.current) {
      const r = e.currentTarget.getBoundingClientRect();
      cachedRect.current = { top: r.top, height: r.height };
    }
    const rect = cachedRect.current;
    const zone = resolveDragZone(e.clientY, rect.top, rect.height, isGrouper);
    const canDropFn = customs.canDrop ?? (() => true);
    const forbidden = !canDropFn(drag.sourcePath, path, zone, items);
    onDragOver(path, zone, forbidden);
  };
  const handleDragEnter = () => {
    dragEnterCount.current++;
    cachedRect.current = null;
  };
  const handleDragLeave = () => {
    dragEnterCount.current--;
    if (dragEnterCount.current <= 0) {
      dragEnterCount.current = 0;
      cachedRect.current = null;
      onDragLeave(path);
    }
  };
  const handleDrop = (e) => {
    e.preventDefault();
    dragEnterCount.current = 0;
    cachedRect.current = null;
    const sourcePath = e.dataTransfer.getData("text/plain") || drag.sourcePath;
    const zone = drag.overPath === path ? drag.overZone : null;
    if (!sourcePath || !zone || drag.forbidden || sourcePath === path) {
      onDragEnd();
      return;
    }
    onDrop(sourcePath, path, zone);
  };
  const handleDragEnd = () => {
    dragEnterCount.current = 0;
    cachedRect.current = null;
    onDragEnd();
  };
  return /* @__PURE__ */ jsx42("div", { className: "trvwr-row-host", "data-flatpath": path, children: /* @__PURE__ */ jsxs35("details", { ref: detailsRef, className: detailsClass, open: isOpen, onToggle: handleToggle, "aria-disabled": !canMutate || void 0, children: [
    /* @__PURE__ */ jsx42(
      "summary",
      {
        className: summaryClass,
        role: "treeitem",
        "aria-selected": isSelected,
        "aria-expanded": isGrouper ? isOpen : void 0,
        draggable: dragEnabled,
        onClick: handleSummaryClick,
        onDragStart: handleDragStart,
        onDragEnd: handleDragEnd,
        onDragEnter: handleDragEnter,
        onDragOver: handleDragOver,
        onDragLeave: handleDragLeave,
        onDrop: handleDrop,
        children: /* @__PURE__ */ jsxs35("div", { className: "trvwr-sum-row", children: [
          dragEnabled ? /* @__PURE__ */ jsx42("span", { className: "trvwr-drag-handle", title: "Arrastrar para reordenar", draggable: true, onDragStart: handleDragStart, onDragEnd: handleDragEnd, children: /* @__PURE__ */ jsx42("iconify-icon", { icon: icons.dragHandle ?? "mdi:dots-grid", style: { fontSize: "1rem", opacity: 0.45 } }) }) : null,
          isGrouper ? /* @__PURE__ */ jsxs35("span", { className: "trvwr-itm-symb", children: [
            /* @__PURE__ */ jsx42("span", { className: `trvwr-chevron${isOpen ? "" : " trvwr-chevron--closed"}`, children: /* @__PURE__ */ jsx42("iconify-icon", { icon: icons.chevron ?? "mdi:chevron-down", style: { fontSize: "1rem" } }) }),
            /* @__PURE__ */ jsx42("iconify-icon", { icon: isOpen ? grouperIcons.open : grouperIcons.closed, style: { fontSize: "1rem", color: grouperIcons.color } })
          ] }) : /* @__PURE__ */ jsx42("span", { className: "trvwr-itm-symb", children: /* @__PURE__ */ jsx42("iconify-icon", { icon: leafIcon, style: { fontSize: "1rem", opacity: 0.75 } }) }),
          /* @__PURE__ */ jsxs35("div", { className: "trvwr-itm-content", children: [
            /* @__PURE__ */ jsxs35("span", { className: "trvwr-itm-label", title: label, children: [
              label,
              pathLabel ? /* @__PURE__ */ jsx42("span", { className: "trvwr-itm-path", children: pathLabel }) : null
            ] }),
            helper ? /* @__PURE__ */ jsx42("span", { className: "trvwr-itm-helper", children: /* @__PURE__ */ jsx42("small", { children: helper }) }) : null
          ] }),
          rowActions.length ? /* @__PURE__ */ jsx42("div", { className: "trvwr-float-card", role: "presentation", onClick: (e) => e.stopPropagation(), children: rowActions.map((act) => /* @__PURE__ */ jsx42(Tooltip13, { title: act.title, children: /* @__PURE__ */ jsx42(IconButton13, { size: "small", "aria-label": act.title, disabled: act.disabled, onClick: act.onClick, children: /* @__PURE__ */ jsx42("iconify-icon", { icon: act.icon, width: "16", height: "16" }) }) }, act.id)) }) : null,
          customs.renderRowExtra?.(node)
        ] })
      }
    ),
    isGrouper && isOpen ? /* @__PURE__ */ jsx42("div", { className: "trvwr-itm-childrens-wrap", children: /* @__PURE__ */ jsx42("div", { className: "trvwr-itm-childrens", role: "group", children: /* @__PURE__ */ jsx42(TreeRowItem, { nodes: node.childrens, ...ctx }) }) }) : null
  ] }) });
}
function TreeRowItem(props) {
  const { nodes, ...ctx } = props;
  if (!nodes?.length) return null;
  return /* @__PURE__ */ jsx42(Fragment14, { children: nodes.map((node) => /* @__PURE__ */ jsx42(TreeRow, { node, nodes, ...ctx }, node.pathInit)) });
}

// js/ui/treeView/treeData.ts
function dedupeItems(items, keyFn) {
  const seen = /* @__PURE__ */ new Map();
  for (const item of items) {
    const key = keyFn(item);
    if (key && !seen.has(key)) seen.set(key, item);
  }
  return Array.from(seen.values());
}
function defaultSort(a, b) {
  return a.flatPath.localeCompare(b.flatPath, void 0, { numeric: true });
}
function buildTreeFromFlatList(items, config) {
  const keyFn = config.dedupeKey ?? config.getFlatPath;
  const unique = dedupeItems(items, keyFn);
  const byPath = /* @__PURE__ */ new Map();
  for (const item of unique) {
    const flatPath = String(config.getFlatPath(item) ?? "").trim();
    if (!flatPath) continue;
    byPath.set(flatPath, {
      flatPath,
      pathInit: flatPath,
      hasChildren: false,
      depth: 0,
      childrens: [],
      data: item
    });
  }
  const childrenOf = /* @__PURE__ */ new Map();
  for (const [flatPath, node] of byPath) {
    const parentPath = config.getParentPath(flatPath, node.data);
    if (!parentPath || !byPath.has(parentPath)) continue;
    if (!childrenOf.has(parentPath)) childrenOf.set(parentPath, []);
    if (!childrenOf.get(parentPath).includes(flatPath)) childrenOf.get(parentPath).push(flatPath);
  }
  const visited = /* @__PURE__ */ new Set();
  const computeDepth = (path, depth) => {
    if (visited.has(path)) return;
    visited.add(path);
    const node = byPath.get(path);
    if (!node) return;
    node.depth = depth;
    const kids = childrenOf.get(path) ?? [];
    node.hasChildren = kids.length > 0;
    for (const kid of kids) computeDepth(kid, depth + 1);
  };
  for (const item of unique) {
    const fp = String(config.getFlatPath(item) ?? "").trim();
    if (fp && !visited.has(fp)) computeDepth(fp, 0);
  }
  const hasKnownParent = (path) => {
    const node = byPath.get(path);
    if (!node) return false;
    const parent = config.getParentPath(path, node.data);
    return !!parent && byPath.has(parent);
  };
  const roots = [];
  for (const node of byPath.values()) {
    const parentPath = config.getParentPath(node.flatPath, node.data);
    const parent = parentPath ? byPath.get(parentPath) : void 0;
    if (parent) {
      parent.childrens.push(node);
      parent.hasChildren = true;
    } else if (!hasKnownParent(node.flatPath)) {
      roots.push(node);
    }
  }
  const sortRec = (list) => {
    const cmp = config.sortSiblings ?? defaultSort;
    list.sort(cmp);
    for (const n of list) sortRec(n.childrens);
  };
  sortRec(roots);
  return roots;
}
function findTreeNodeByPath(roots, path) {
  const walk = (nodes) => {
    for (const n of nodes) {
      if (n.flatPath === path) return n;
      const hit = walk(n.childrens);
      if (hit) return hit;
    }
    return void 0;
  };
  return walk(roots);
}
function collectPathsWithChildren(roots) {
  const out = [];
  const walk = (nodes) => {
    for (const n of nodes) {
      if (n.hasChildren) out.push(n.flatPath);
      walk(n.childrens);
    }
  };
  walk(roots);
  return out;
}

// js/ui/treeView/TreeView.tsx
import { Fragment as Fragment15, jsx as jsx43, jsxs as jsxs36 } from "react/jsx-runtime";
var { useState: useState29, useMemo: useMemo16, useCallback: useCallback12 } = getReact();
var { Box: Box28, Stack: Stack21, Typography: Typography25, Chip: Chip18, IconButton: IconButton14, Tooltip: Tooltip14, Button: Button19, CircularProgress: CircularProgress17 } = getMaterialUI();
var EMPTY_DRAG = { sourcePath: null, overPath: null, overZone: null, forbidden: false };
function TreeView(props) {
  const {
    items,
    manifest,
    customs,
    readonly = false,
    busy = false,
    selectedPath: selectedPathProp,
    onSelectedPathChange,
    className = "",
    toolbarTitle,
    toolbarExtra,
    showToolbar = true
  } = props;
  const features = manifest.features ?? {};
  const [collapsed, setCollapsed] = useState29(/* @__PURE__ */ new Set());
  const [selectedPathInternal, setSelectedPathInternal] = useState29(null);
  const [drag, setDrag] = useState29(EMPTY_DRAG);
  const selectedPath = selectedPathProp !== void 0 ? selectedPathProp : selectedPathInternal;
  const setSelectedPath = useCallback12((path) => {
    if (onSelectedPathChange) onSelectedPathChange(path);
    else setSelectedPathInternal(path);
  }, [onSelectedPathChange]);
  const rootNodes = useMemo16(() => buildTreeFromFlatList(items, customs.build), [items, customs.build]);
  const canMutate = !readonly && !busy;
  const runtime = useMemo16(() => ({
    rootNodes,
    items,
    selectedPath,
    collapsed,
    readonly,
    busy,
    collapseAll: () => setCollapsed(new Set(collectPathsWithChildren(rootNodes))),
    expandAll: () => setCollapsed(/* @__PURE__ */ new Set()),
    select: setSelectedPath,
    findByPath: (path) => findTreeNodeByPath(rootNodes, path)
  }), [rootNodes, items, selectedPath, collapsed, readonly, busy, setSelectedPath]);
  const setCollapsedFor = useCallback12((path, open) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (open) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);
  const handleDragStart = useCallback12((path) => {
    setDrag({ sourcePath: path, overPath: null, overZone: null, forbidden: false });
  }, []);
  const handleDragOver = useCallback12((path, zone, forbidden) => {
    setDrag((prev) => {
      if (prev.overPath === path && prev.overZone === zone && prev.forbidden === forbidden) return prev;
      return { ...prev, overPath: path, overZone: zone, forbidden };
    });
  }, []);
  const handleDragLeave = useCallback12((path) => {
    setDrag((prev) => prev.overPath === path ? { ...prev, overPath: null, overZone: null, forbidden: false } : prev);
  }, []);
  const handleDragEnd = useCallback12(() => setDrag(EMPTY_DRAG), []);
  const handleDrop = useCallback12(async (sourcePath, targetPath, zone) => {
    setDrag(EMPTY_DRAG);
    await customs.onDrop?.(sourcePath, targetPath, zone, items);
  }, [customs, items]);
  const toolbarActions = useMemo16(
    () => (customs.toolbarActions?.(runtime) ?? []).filter((a) => !a.hidden),
    [customs, runtime]
  );
  const countLabel = manifest.countLabel ?? `${items.length} ${manifest.entrie ?? "elemento"}${items.length !== 1 ? "s" : ""}`;
  const ariaLabel = manifest.ariaLabel ?? manifest.entries ?? `\xC1rbol de ${manifest.entrie ?? "elementos"}`;
  return /* @__PURE__ */ jsxs36(Box28, { className: `isp-tree-host isp-tree ${className}`.trim(), sx: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }, children: [
    showToolbar ? /* @__PURE__ */ jsxs36(Stack21, { direction: "row", alignItems: "center", spacing: 1, className: "isp-tree-toolbar", sx: { p: 1, borderBottom: 1, borderColor: "divider", flexShrink: 0 }, children: [
      toolbarTitle ? /* @__PURE__ */ jsx43(Typography25, { variant: "subtitle1", sx: { flex: 1 }, children: toolbarTitle }) : /* @__PURE__ */ jsx43(Box28, { sx: { flex: 1 } }),
      /* @__PURE__ */ jsx43(Chip18, { size: "small", label: countLabel }),
      features.toolbarExpandCollapse !== false ? /* @__PURE__ */ jsxs36(Fragment15, { children: [
        /* @__PURE__ */ jsx43(Tooltip14, { title: "Expandir todo", children: /* @__PURE__ */ jsx43(IconButton14, { size: "small", onClick: runtime.expandAll, disabled: busy, children: /* @__PURE__ */ jsx43("iconify-icon", { icon: "mdi:unfold-more-horizontal", width: "18", height: "18" }) }) }),
        /* @__PURE__ */ jsx43(Tooltip14, { title: "Colapsar todo", children: /* @__PURE__ */ jsx43(IconButton14, { size: "small", onClick: runtime.collapseAll, disabled: busy, children: /* @__PURE__ */ jsx43("iconify-icon", { icon: "mdi:unfold-less-horizontal", width: "18", height: "18" }) }) })
      ] }) : null,
      toolbarActions.map((act) => act.variant === "button" ? /* @__PURE__ */ jsx43(
        Button19,
        {
          size: "small",
          variant: "contained",
          disabled: act.disabled || busy,
          startIcon: /* @__PURE__ */ jsx43("iconify-icon", { icon: act.icon, width: "16", height: "16" }),
          onClick: act.onClick,
          children: act.label ?? act.title
        },
        act.id
      ) : /* @__PURE__ */ jsx43(Tooltip14, { title: act.title, children: /* @__PURE__ */ jsx43("span", { children: /* @__PURE__ */ jsx43(IconButton14, { size: "small", disabled: act.disabled || busy, onClick: act.onClick, "aria-label": act.title, children: /* @__PURE__ */ jsx43("iconify-icon", { icon: act.icon, width: "18", height: "18" }) }) }) }, act.id)),
      toolbarExtra
    ] }) : null,
    busy ? /* @__PURE__ */ jsx43(Box28, { sx: { display: "flex", alignItems: "center", justifyContent: "center", p: 2, flex: 1, minHeight: 0 }, children: /* @__PURE__ */ jsx43(CircularProgress17, { size: 20 }) }) : /* @__PURE__ */ jsx43(Box28, { className: "isp-tree isp-tree-body custom-scrollbar", role: "tree", "aria-label": ariaLabel, sx: { flex: 1, minHeight: 0, overflow: "auto" }, children: rootNodes.length === 0 ? /* @__PURE__ */ jsx43(Typography25, { variant: "body2", color: "text.secondary", sx: { p: 2 }, children: manifest.emptyMessage ?? "Sin elementos." }) : /* @__PURE__ */ jsx43(
      TreeRowItem,
      {
        nodes: rootNodes,
        items,
        manifest,
        customs,
        collapsed,
        selectedPath,
        highlightedPath: selectedPath,
        canMutate,
        drag,
        onToggleCollapse: setCollapsedFor,
        onSelect: setSelectedPath,
        onDragStart: handleDragStart,
        onDragOver: handleDragOver,
        onDragLeave: handleDragLeave,
        onDragEnd: handleDragEnd,
        onDrop: handleDrop
      }
    ) })
  ] });
}

// js/tools/roleHierarchyTree/treeLogic.ts
function immediateParentJer(jer) {
  const ancestors = ancestorsFromPath(jer);
  return ancestors.length > 1 ? ancestors[1] : null;
}
function isDescendant(targetJer, ancestorJer) {
  if (targetJer === ancestorJer) return true;
  return ancestorsFromPath(targetJer).includes(ancestorJer);
}
function canDrop(sourceJer, targetJer, position, _nodes) {
  if (!position || !sourceJer || !targetJer || sourceJer === targetJer) return false;
  if (isDescendant(targetJer, sourceJer)) return false;
  return true;
}
function nextChildJer(parentJer, existing) {
  const prefix = `${parentJer}.`;
  let max = -1;
  for (const j of existing) {
    if (!j.startsWith(prefix)) continue;
    const seg = j.slice(prefix.length).split(".")[0];
    const n = Number(seg);
    if (!Number.isNaN(n)) max = Math.max(max, n);
  }
  return `${parentJer}.${max + 1}`;
}
function computeDropJerarquia(sourceJer, targetJer, position, nodes) {
  if (!canDrop(sourceJer, targetJer, position, nodes)) return null;
  const existing = new Set(nodes.map((n) => n.jerarquia).filter((j) => j !== sourceJer));
  if (position === "into") return nextChildJer(targetJer, existing);
  const targetParent = immediateParentJer(targetJer);
  const siblings = nodes.filter((n) => n.jerarquia !== sourceJer).filter((n) => immediateParentJer(n.jerarquia) === targetParent).map((n) => n.jerarquia).sort((a, b) => compareHierarchy(a, b));
  const tgtIdx = siblings.indexOf(targetJer);
  if (tgtIdx === -1) return null;
  const insertIdx = position === "before" ? tgtIdx : tgtIdx + 1;
  const parentPrefix = targetParent ? `${targetParent}.` : "";
  const reindexed = [...siblings];
  reindexed.splice(insertIdx, 0, "__moving__");
  const myIdx = reindexed.indexOf("__moving__");
  const seg = myIdx;
  if (targetParent) return `${targetParent}.${seg}`;
  return String(seg);
}

// js/tools/roleHierarchyTree/roleHierarchyTreeConfig.ts
var ROLE_HIERARCHY_MANIFEST = {
  ariaLabel: "\xC1rbol de roles",
  entrie: "rol",
  entries: "roles",
  emptyMessage: "Sin roles.",
  countLabel: void 0,
  icons: {
    grouperOpen: "mdi:folder-account",
    grouperClosed: "mdi:folder-account-outline",
    grouperColor: "#1976d2",
    leaf: "mdi:account",
    chevron: "mdi:chevron-down",
    dragHandle: "mdi:dots-grid"
  },
  features: {
    drag: true,
    collapse: true,
    toolbarExpandCollapse: true,
    rowActions: true,
    showPathLabel: true,
    showHelper: true
  }
};
function immediateParentJer2(jer) {
  const ancestors = ancestorsFromPath(jer);
  return ancestors.length > 1 ? ancestors[1] : null;
}
function createRoleHierarchyCustoms(handlers) {
  const { items, canMutate, onSave, onDelete, onEdit, onCreateClick } = handlers;
  return {
    build: {
      getFlatPath: (item) => String(item.jerarquia ?? "").trim(),
      getParentPath: (flatPath) => immediateParentJer2(flatPath),
      dedupeKey: (item) => String(item.jerarquia ?? "").trim(),
      sortSiblings: (a, b) => compareHierarchy(a.flatPath, b.flatPath)
    },
    getLabel: (node) => node.data.namedisplay?.trim() || node.data.iusuario,
    getHelper: (node) => node.data.descripcion?.trim() || null,
    getPathLabel: (node) => formatJerarquiaLabel(node.flatPath),
    canDrop: (sourcePath, targetPath, zone) => canDrop(sourcePath, targetPath, zone, items),
    onDrop: async (sourcePath, targetPath, zone) => {
      const source = items.find((n) => n.jerarquia === sourcePath);
      if (!source) return;
      const newJer = computeDropJerarquia(sourcePath, targetPath, zone, items);
      if (!newJer) {
        toastInfo?.("No se puede mover: operaci\xF3n no permitida");
        return;
      }
      try {
        await onSave(source.iusuario, newJer);
      } catch (err) {
        toastError?.(`Error al reparentar: ${err?.message ?? err}`);
      }
    },
    rowActions: (node) => {
      if (!canMutate) return [];
      const data = node.data;
      return [
        {
          id: "edit",
          icon: "mdi:pencil",
          title: "Editar jerarqu\xEDa",
          onClick: () => onEdit(data)
        },
        {
          id: "delete",
          icon: "mdi:delete",
          title: "Eliminar rol",
          onClick: () => {
            if (confirm(`\xBFEliminar rol "${data.iusuario}"?`)) {
              onDelete(data.iusuario).catch((e) => toastError?.(String(e)));
            }
          }
        }
      ];
    },
    toolbarActions: (runtime) => {
      if (!canMutate) return [];
      return [
        {
          id: "new-role",
          icon: "mdi:plus",
          title: "Nuevo rol",
          label: "Nuevo rol",
          variant: "button",
          onClick: onCreateClick
        }
      ];
    }
  };
}

// js/tools/roleHierarchyTree/RoleHierarchyView.tsx
import { jsx as jsx44, jsxs as jsxs37 } from "react/jsx-runtime";
var { useState: useState30, useMemo: useMemo17, useCallback: useCallback13, useEffect: useEffect26 } = getReact();
var { Box: Box29, Typography: Typography26, Button: Button20, Dialog: Dialog9, DialogTitle: DialogTitle9, DialogContent: DialogContent12, DialogActions: DialogActions10, TextField: TextField16, Alert: Alert15, CircularProgress: CircularProgress18, Stack: Stack22, Chip: Chip19 } = getMaterialUI();
var EMPTY_PERMISOS = Object.freeze({});
function RoleHierarchyView(props) {
  const { nodes, roleEntries, canManagePermisos, canEditRoleDescriptions, initialSelectedRole, onSaveRolePermisos, canMutate, busy, onSave, onSaveLocalPerm, onPromote, onCreate, onDelete } = props;
  const [selectedJer, setSelectedJer] = useState30(null);
  const [editTarget, setEditTarget] = useState30(null);
  const [visitanteDraft, setVisitanteDraft] = useState30(null);
  const [visitanteSaving, setVisitanteSaving] = useState30(false);
  const [roleDraft, setRoleDraft] = useState30(null);
  const [roleSaving, setRoleSaving] = useState30(false);
  const currentEditNode = useMemo17(
    () => selectedJer ? nodes.find((n) => n.jerarquia === selectedJer) ?? null : null,
    [selectedJer, nodes]
  );
  const visitanteEntry = useMemo17(() => getVisitanteRoleEntry({ roles: roleEntries ?? [] }), [roleEntries]);
  const currentRoleEntry = useMemo17(() => {
    if (!currentEditNode) return null;
    const key = String(currentEditNode.iusuario ?? "").trim().toLowerCase();
    return (roleEntries ?? []).find((e) => roleNameFromEntry(e) === key) ?? { iusuario: key, permisos: EMPTY_PERMISOS, bactivo: true };
  }, [currentEditNode, roleEntries]);
  const visitantePermisosSig = useMemo17(
    () => JSON.stringify(visitanteEntry.permisos ?? EMPTY_PERMISOS),
    [visitanteEntry.permisos]
  );
  const rolePermisosSig = useMemo17(
    () => currentRoleEntry ? JSON.stringify(currentRoleEntry.permisos ?? EMPTY_PERMISOS) : "",
    [currentRoleEntry?.iusuario, currentRoleEntry?.permisos]
  );
  const roleEditorEntry = useMemo17(() => {
    if (!currentRoleEntry) return null;
    const permisos = roleDraft ?? currentRoleEntry.permisos ?? EMPTY_PERMISOS;
    return { ...currentRoleEntry, permisos };
  }, [currentRoleEntry, roleDraft]);
  useEffect26(() => {
    if (!initialSelectedRole || !nodes.length) return;
    const key = String(initialSelectedRole).trim().toLowerCase();
    const node = nodes.find((n) => String(n.iusuario ?? "").trim().toLowerCase() === key);
    if (node?.jerarquia) setSelectedJer((prev) => prev === node.jerarquia ? prev : node.jerarquia);
  }, [initialSelectedRole, nodes]);
  useEffect26(() => {
    if (!selectedJer) {
      setVisitanteDraft(null);
      setRoleDraft(null);
      return;
    }
    const node = nodes.find((n) => n.jerarquia === selectedJer);
    if (!node) return;
    if (isVisitanteRole(node.iusuario)) {
      setRoleDraft(null);
      const next2 = enforceVisitantePermisos(visitanteEntry.permisos ?? EMPTY_PERMISOS);
      setVisitanteDraft((prev) => prev && JSON.stringify(prev) === JSON.stringify(next2) ? prev : next2);
      return;
    }
    setVisitanteDraft(null);
    const key = String(node.iusuario ?? "").trim().toLowerCase();
    const entry = (roleEntries ?? []).find((e) => roleNameFromEntry(e) === key);
    const next = { ...entry?.permisos ?? EMPTY_PERMISOS };
    setRoleDraft((prev) => prev && JSON.stringify(prev) === JSON.stringify(next) ? prev : next);
  }, [selectedJer, visitantePermisosSig, rolePermisosSig, nodes, roleEntries, visitanteEntry]);
  const openCreateDialog = useCallback13(() => {
    setEditTarget({
      isNew: true,
      node: { iusuario: "", jerarquia: "", namedisplay: null, descripcion: null }
    });
  }, []);
  const customs = useMemo17(
    () => createRoleHierarchyCustoms({
      items: nodes,
      canMutate,
      onSave,
      onDelete,
      onEdit: (node) => setEditTarget({ node, isNew: false }),
      onCreateClick: openCreateDialog
    }),
    [nodes, canMutate, onSave, onDelete, openCreateDialog]
  );
  const typedNodes = nodes;
  const countLabel = `${nodes.length} rol${nodes.length !== 1 ? "es" : ""}`;
  const manifest = useMemo17(() => ({ ...ROLE_HIERARCHY_MANIFEST, countLabel }), [countLabel]);
  const IsaSplitView = getIsaSplitView();
  const treePanel = /* @__PURE__ */ jsx44(
    TreeView,
    {
      items: typedNodes,
      manifest,
      customs,
      readonly: !canMutate,
      busy,
      selectedPath: selectedJer,
      onSelectedPathChange: setSelectedJer,
      toolbarTitle: "Jerarqu\xEDa de roles",
      className: "role-hierarchy-tree-panel",
      showToolbar: true
    }
  );
  const editorPanel = currentEditNode ? isVisitanteRole(currentEditNode.iusuario) ? /* @__PURE__ */ jsxs37(Box29, { className: "role-hierarchy-visitante-editor", sx: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "auto" }, children: [
    /* @__PURE__ */ jsxs37(Stack22, { direction: "row", alignItems: "center", spacing: 1, sx: { px: 2, pt: 2, pb: 1, flexShrink: 0 }, children: [
      /* @__PURE__ */ jsx44(Typography26, { variant: "h6", sx: { flex: 1 }, children: currentEditNode.namedisplay ?? "Visitante" }),
      /* @__PURE__ */ jsx44(Chip19, { size: "small", label: currentEditNode.jerarquia })
    ] }),
    /* @__PURE__ */ jsx44(Box29, { sx: { flex: 1, minHeight: 0, overflow: "auto", px: 2, pb: 2 }, children: /* @__PURE__ */ jsx44(
      RoleConfigEditor,
      {
        entry: visitanteDraft ? { ...visitanteEntry, permisos: visitanteDraft } : visitanteEntry,
        roleName: "visitante",
        canManage: !!canManagePermisos,
        canEditRoleDescriptions: !!canEditRoleDescriptions,
        onChange: (permisos) => setVisitanteDraft(enforceVisitantePermisos(permisos))
      },
      `visitante-${visitantePermisosSig}`
    ) }),
    (canManagePermisos || canEditRoleDescriptions) && onSaveRolePermisos ? /* @__PURE__ */ jsx44(Stack22, { direction: "row", justifyContent: "flex-end", spacing: 1, sx: { px: 2, py: 1.5, flexShrink: 0, borderTop: 1, borderColor: "divider" }, children: /* @__PURE__ */ jsx44(
      Button20,
      {
        variant: "contained",
        disabled: busy || visitanteSaving || !visitanteDraft,
        onClick: async () => {
          if (!visitanteDraft) return;
          setVisitanteSaving(true);
          try {
            await onSaveRolePermisos("visitante", visitanteDraft, visitanteEntry.bactivo !== false);
          } finally {
            setVisitanteSaving(false);
          }
        },
        sx: { textTransform: "none", fontWeight: 600 },
        children: visitanteSaving ? /* @__PURE__ */ jsx44(CircularProgress18, { size: 18, color: "inherit" }) : "Guardar visitante"
      }
    ) }) : null
  ] }) : /* @__PURE__ */ jsxs37(Box29, { className: "role-hierarchy-role-editor", sx: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "auto" }, children: [
    /* @__PURE__ */ jsxs37(Stack22, { direction: "row", alignItems: "center", spacing: 1, sx: { px: 2, pt: 2, pb: 1, flexShrink: 0 }, children: [
      /* @__PURE__ */ jsx44(Typography26, { variant: "h6", sx: { flex: 1 }, children: currentEditNode.namedisplay ?? currentEditNode.iusuario }),
      /* @__PURE__ */ jsx44(Chip19, { size: "small", label: currentEditNode.jerarquia })
    ] }),
    /* @__PURE__ */ jsx44(Box29, { sx: { flex: 1, minHeight: 0, overflow: "auto", px: 2, pb: 2 }, children: /* @__PURE__ */ jsx44(
      RoleConfigEditor,
      {
        entry: roleEditorEntry ?? { iusuario: currentEditNode.iusuario, permisos: EMPTY_PERMISOS, bactivo: true },
        roleName: currentEditNode.iusuario,
        canManage: !!canManagePermisos,
        canEditRoleDescriptions: !!canEditRoleDescriptions,
        onChange: (permisos) => setRoleDraft(permisos)
      },
      `${currentEditNode.iusuario}-${rolePermisosSig}`
    ) }),
    (canManagePermisos || canEditRoleDescriptions) && onSaveRolePermisos ? /* @__PURE__ */ jsx44(Stack22, { direction: "row", justifyContent: "flex-end", spacing: 1, sx: { px: 2, py: 1.5, flexShrink: 0, borderTop: 1, borderColor: "divider" }, children: /* @__PURE__ */ jsx44(
      Button20,
      {
        variant: "contained",
        disabled: busy || roleSaving || !roleDraft,
        onClick: async () => {
          if (!roleDraft) return;
          setRoleSaving(true);
          try {
            await onSaveRolePermisos(currentEditNode.iusuario, roleDraft, currentRoleEntry?.bactivo !== false);
          } finally {
            setRoleSaving(false);
          }
        },
        sx: { textTransform: "none", fontWeight: 600 },
        children: roleSaving ? /* @__PURE__ */ jsx44(CircularProgress18, { size: 18, color: "inherit" }) : "Guardar rol"
      }
    ) }) : null
  ] }) : /* @__PURE__ */ jsxs37(Box29, { sx: { p: 4, textAlign: "center", color: "text.secondary", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }, children: [
    /* @__PURE__ */ jsx44("iconify-icon", { icon: "mdi:family-tree", width: "48", height: "48" }),
    /* @__PURE__ */ jsx44(Typography26, { variant: "body1", sx: { mt: 2 }, children: "Selecciona un rol del \xE1rbol \u2014 visitante incluye editor de permisos completo." }),
    !canMutate ? /* @__PURE__ */ jsx44(Typography26, { variant: "caption", color: "text.secondary", sx: { display: "block", mt: 1 }, children: "(Solo roles de branch 0 pueden editar la jerarqu\xEDa.)" }) : null
  ] });
  return /* @__PURE__ */ jsxs37(Box29, { className: "role-hierarchy-tree isp-tree-host", sx: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }, children: [
    /* @__PURE__ */ jsx44(
      IsaSplitView,
      {
        className: "role-hierarchy-split",
        sx: { flex: 1, minHeight: 0 },
        panelClassName: "role-hierarchy-tree-panel",
        storageKey: "isa-patyia:role-hierarchy-tree-w",
        defaultWidth: 360,
        minWidth: 260,
        maxWidth: 560,
        panelTitle: "Jerarqu\xEDa de roles",
        panelIcon: "mdi:family-tree",
        UI,
        panel: treePanel,
        children: /* @__PURE__ */ jsx44(Box29, { className: "role-hierarchy-editor-panel", sx: { flex: 1, minWidth: 0, minHeight: 0, overflow: "auto", height: "100%" }, children: editorPanel })
      }
    ),
    /* @__PURE__ */ jsx44(
      HierarchyEditDialog,
      {
        target: editTarget,
        busy,
        onClose: () => setEditTarget(null),
        onSave: async (name, jer) => {
          if (editTarget?.isNew) await onCreate(name, jer);
          else if (editTarget) await onSave(editTarget.node.iusuario, jer);
          setEditTarget(null);
        }
      }
    )
  ] });
}
function HierarchyEditDialog({ target, busy, onClose, onSave }) {
  const isNew = target?.isNew ?? false;
  const [name, setName] = useState30(target?.node.iusuario ?? "");
  const [jerarquia, setJerarquia] = useState30(isNew ? "" : target?.node.jerarquia ?? "");
  const [err, setErr] = useState30("");
  React2.useEffect(() => {
    setName(target?.node.iusuario ?? "");
    setJerarquia(isNew ? "" : target?.node.jerarquia ?? "");
    setErr("");
  }, [target, isNew]);
  if (!target) return null;
  const handleSubmit = async () => {
    setErr("");
    const trimmedName = String(name ?? "").trim();
    const trimmedJer = String(jerarquia ?? "").trim();
    if (!trimmedName) {
      setErr("nombre requerido");
      return;
    }
    if (!trimmedJer) {
      setErr("jerarqu\xEDa requerida");
      return;
    }
    if (!/^[0-9]+(\.[0-9]+)*$/.test(trimmedJer)) {
      setErr("jerarqu\xEDa inv\xE1lida (formato: 0, 0.0, 0.1.1)");
      return;
    }
    try {
      await onSave(trimmedName, trimmedJer);
    } catch (e) {
      setErr(e?.message ?? String(e));
    }
  };
  return /* @__PURE__ */ jsxs37(Dialog9, { open: true, onClose, maxWidth: "sm", fullWidth: true, children: [
    /* @__PURE__ */ jsx44(DialogTitle9, { children: isNew ? "Nuevo rol" : `Mover ${target.node.iusuario}` }),
    /* @__PURE__ */ jsx44(DialogContent12, { dividers: true, children: /* @__PURE__ */ jsxs37(Stack22, { spacing: 2, children: [
      err ? /* @__PURE__ */ jsx44(Alert15, { severity: "error", children: err }) : null,
      /* @__PURE__ */ jsx44(TextField16, { label: "Nombre", value: name, onChange: (e) => setName(e.target.value), disabled: !isNew, helperText: "min\xFAsculas, sin espacios (ej. dev_lead)" }),
      /* @__PURE__ */ jsx44(TextField16, { label: "Nueva jerarqu\xEDa", value: jerarquia, onChange: (e) => setJerarquia(e.target.value), helperText: "dot-notation: 0, 0.0, 0.1.1, ..." }),
      /* @__PURE__ */ jsx44(Alert15, { severity: "info", children: "Los ancestros se derivan del path. Arrastra un rol sobre otro (antes / dentro / despu\xE9s) para reubicarlo." })
    ] }) }),
    /* @__PURE__ */ jsxs37(DialogActions10, { children: [
      /* @__PURE__ */ jsx44(Button20, { onClick: onClose, disabled: busy, children: "Cancelar" }),
      /* @__PURE__ */ jsx44(Button20, { variant: "contained", onClick: handleSubmit, disabled: busy, children: busy ? /* @__PURE__ */ jsx44(CircularProgress18, { size: 16 }) : "Guardar" })
    ] })
  ] });
}

// js/tools/roleHierarchyTree/RolePermissionsEditor.tsx
import { Fragment as Fragment16, jsx as jsx45, jsxs as jsxs38 } from "react/jsx-runtime";
var { useState: useState31, useMemo: useMemo18, useCallback: useCallback14, useEffect: useEffect27 } = getReact();
var { Box: Box30, Stack: Stack23, Typography: Typography27, Breadcrumbs, Link, Chip: Chip20, IconButton: IconButton15, Tooltip: Tooltip15, Button: Button21, TextField: TextField17, Alert: Alert16, CircularProgress: CircularProgress19 } = getMaterialUI();
var { Icon: Icon21 } = UI;

// js/tools/roleHierarchyTree/hierarchyFromRoles.ts
function hierarchyNodesFromRoleEntries(roleEntries) {
  const out = [];
  for (const e of roleEntries ?? []) {
    const iusuario = roleNameFromEntry(e);
    if (!iusuario) continue;
    const permisos = e.permisos && typeof e.permisos === "object" ? e.permisos : {};
    const jerarquia = getRoleJerarquia(iusuario, permisos);
    if (!jerarquia) continue;
    out.push({
      iusuario,
      jerarquia,
      namedisplay: roleTitleFromEntry(e) || null,
      descripcion: roleDescripcionFromEntry(e) || null,
      bactivo: e.bactivo !== false
    });
  }
  return out;
}

// js/tools/UserPermissionsSummaryDialog.jsx
import { Fragment as Fragment17, jsx as jsx46, jsxs as jsxs39 } from "react/jsx-runtime";
var { Typography: Typography28, Stack: Stack24, Box: Box31, Chip: Chip21, Divider: Divider7, CircularProgress: CircularProgress20 } = getMaterialUI();
var { useMemo: useMemo19 } = getReact();
var ROLE_KEYS_OMIT = /* @__PURE__ */ new Set(["descripcion", "namedisplay", "roles", "jerarquia", "accent", "color", "icon"]);
function getRoleEntry(roles, roleName) {
  const key = String(roleName ?? "").trim().toLowerCase();
  return (roles ?? []).find((r) => String(r?.iusuario ?? "").trim().toLowerCase().replace(/^role:/i, "") === key) ?? null;
}
function activeRoles(roles) {
  return (roles ?? []).filter((r) => r?.itipo !== "user" && r?.bactivo !== false);
}
function chainForRole(roles, roleName) {
  const entry = getRoleEntry(roles, roleName);
  if (!entry) return { name: roleName, jerarquia: null, ancestors: [] };
  const jerarquia = getRoleJerarquia(roleName, entry.permisos);
  const ancestorPaths = ancestorsFromPath(jerarquia).slice(1);
  const ancestors = ancestorPaths.map((p) => ({ jerarquia: p, entry: getRoleEntry(roles, p) })).filter((a) => a.entry && a.entry.bactivo !== false);
  return { name: roleName, jerarquia, ancestors };
}
function permissionValue(v) {
  if (v === true) return "allow";
  if (v && typeof v === "object") {
    if (Array.isArray(v.fixFilter)) {
      return { kind: "fixFilter", value: v.fixFilter };
    }
    if (v.fixFilter && typeof v.fixFilter === "object") {
      return { kind: "fixFilter", value: v.fixFilter };
    }
    return { kind: "object", value: v };
  }
  return { kind: "other", value: v };
}
function summarizePerms(perms) {
  const allows = [];
  const fixFilters = [];
  const others = [];
  for (const [k, v] of Object.entries(perms ?? {})) {
    if (ROLE_KEYS_OMIT.has(k)) continue;
    if (k.startsWith("__") || k === "*") {
      if (k === "*" && v === true) allows.unshift("*");
      continue;
    }
    const pv = permissionValue(v);
    if (pv === "allow") allows.push(k);
    else if (pv.kind === "fixFilter") fixFilters.push({ key: k, filter: pv.value });
    else others.push({ key: k, value: pv.value });
  }
  return { allows, fixFilters, others };
}
function ChipChain({ chain, roles }) {
  return /* @__PURE__ */ jsxs39(Stack24, { direction: "row", spacing: 0.5, alignItems: "center", flexWrap: "wrap", useFlexGap: true, children: [
    chain.ancestors.map((anc) => /* @__PURE__ */ jsxs39(Box31, { sx: { display: "inline-flex", alignItems: "center" }, children: [
      /* @__PURE__ */ jsx46(Chip21, { size: "small", variant: "outlined", label: roleTitleFromEntry(anc.entry) || anc.entry.iusuario, sx: { fontFamily: "monospace", fontSize: 11 }, title: `Jerarqu\xEDa ${anc.jerarquia}` }),
      /* @__PURE__ */ jsx46(Box31, { component: "span", sx: { mx: 0.5, opacity: 0.6 }, children: "\u203A" })
    ] }, anc.jerarquia)),
    /* @__PURE__ */ jsx46(
      Chip21,
      {
        size: "small",
        color: "primary",
        label: roleTitleFromEntry(getRoleEntry(roles, chain.name)) || chain.name,
        sx: { fontFamily: "monospace", fontSize: 11, fontWeight: 700 },
        title: `Jerarqu\xEDa ${chain.jerarquia}`
      }
    )
  ] });
}
function RoleCard({ chain, roles }) {
  return /* @__PURE__ */ jsx46(Box31, { className: "isa-glass-card paty-permisos-summary__role", sx: { p: 1.25, borderRadius: 1.5 }, children: /* @__PURE__ */ jsxs39(Stack24, { spacing: 0.75, children: [
    /* @__PURE__ */ jsxs39(Stack24, { direction: "row", alignItems: "center", spacing: 0.75, children: [
      /* @__PURE__ */ jsx46(Typography28, { variant: "subtitle2", fontWeight: 700, title: `${chain.name} \xB7 jerarqu\xEDa ${chain.jerarquia}`, children: chain.name }),
      /* @__PURE__ */ jsx46(Typography28, { variant: "caption", color: "text.secondary", sx: { fontFamily: "monospace" }, children: chain.jerarquia })
    ] }),
    /* @__PURE__ */ jsx46(ChipChain, { chain, roles })
  ] }) });
}
function PermList({ title, items, kind }) {
  if (!items.length) return null;
  return /* @__PURE__ */ jsxs39(Box31, { sx: { mt: 1 }, children: [
    /* @__PURE__ */ jsxs39(Typography28, { variant: "overline", color: "text.secondary", sx: { letterSpacing: 1 }, children: [
      title,
      " (",
      items.length,
      ")"
    ] }),
    /* @__PURE__ */ jsxs39(Box31, { sx: { display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }, children: [
      items.slice(0, kind === "fixFilter" ? 50 : 100).map((it, i) => {
        if (kind === "fixFilter") {
          const ffSummary = Object.entries(it.filter ?? {}).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(", ");
          return /* @__PURE__ */ jsx46(
            Chip21,
            {
              size: "small",
              variant: "outlined",
              color: "warning",
              label: `${it.key} \xB7 ${ffSummary}`,
              title: `${it.key} \u2014 restringido a: ${ffSummary}`,
              sx: { fontFamily: "monospace", fontSize: 11 }
            },
            `${it.key}-${i}`
          );
        }
        if (kind === "allow") {
          return /* @__PURE__ */ jsx46(
            Chip21,
            {
              size: "small",
              color: "success",
              variant: "outlined",
              label: it,
              title: it,
              sx: { fontFamily: "monospace", fontSize: 11 }
            },
            it
          );
        }
        return /* @__PURE__ */ jsx46(
          Chip21,
          {
            size: "small",
            variant: "outlined",
            label: `${it.key} \u2192 ${JSON.stringify(it.value)}`,
            title: it.key,
            sx: { fontFamily: "monospace", fontSize: 11 }
          },
          `${it.key}-${i}`
        );
      }),
      items.length > (kind === "fixFilter" ? 50 : 100) ? /* @__PURE__ */ jsx46(Chip21, { size: "small", label: `+${items.length - (kind === "fixFilter" ? 50 : 100)} m\xE1s`, sx: { fontFamily: "monospace", fontSize: 11 } }) : null
    ] })
  ] });
}
function UserPermissionsSummaryDialog({ open, onClose, username, users, roles }) {
  const data = useMemo19(() => {
    if (!open || !username) return null;
    const targetUser = (users ?? []).find((u) => String(u?.iusuario ?? "").trim().toUpperCase() === username.toUpperCase());
    if (!targetUser) return null;
    const active = activeRoles(roles);
    const directRoles = userRoles(targetUser.permisos);
    const chains = directRoles.map((rn) => chainForRole(active, rn));
    const { allows, fixFilters, others } = summarizePerms(targetUser.permisos);
    return { targetUser, chains, activeRoles: active, allows, fixFilters, others };
  }, [open, username, users, roles]);
  return /* @__PURE__ */ jsxs39(
    GlassDialog,
    {
      open,
      onClose,
      maxWidth: "md",
      fullWidth: true,
      paperClassName: "permisos-user-summary-dialog",
      header: /* @__PURE__ */ jsx46(
        GlassDialogHeader,
        {
          icon: "mdi:shield-account-outline",
          title: `Resumen de permisos \u2014 ${username || ""}`,
          subtitle: "Solo lectura \xB7 composici\xF3n en cliente \xB7 incluye cadena de roles y permisos efectivos",
          accent: "#1e90ff",
          onClose
        }
      ),
      children: [
        /* @__PURE__ */ jsx46(Box31, { sx: { ...glassDialogContentSx(), minHeight: 360 }, children: !username ? /* @__PURE__ */ jsx46(Typography28, { color: "text.secondary", children: "Sin usuario seleccionado." }) : !data ? /* @__PURE__ */ jsxs39(Stack24, { direction: "row", spacing: 1.5, alignItems: "center", children: [
          /* @__PURE__ */ jsx46(CircularProgress20, { size: 20 }),
          /* @__PURE__ */ jsx46(Typography28, { color: "text.secondary", children: "Usuario no encontrado en los datos cargados." })
        ] }) : /* @__PURE__ */ jsxs39(Fragment17, { children: [
          /* @__PURE__ */ jsxs39(Box31, { children: [
            /* @__PURE__ */ jsx46(Typography28, { variant: "overline", color: "text.secondary", children: "Usuario" }),
            /* @__PURE__ */ jsx46(Typography28, { variant: "h6", fontWeight: 700, children: data.targetUser.iusuario }),
            data.targetUser.permisos?.nombre || data.targetUser.permisos?.namedisplay ? /* @__PURE__ */ jsx46(Typography28, { variant: "body2", color: "text.secondary", children: data.targetUser.permisos.nombre || data.targetUser.permisos.namedisplay }) : null
          ] }),
          /* @__PURE__ */ jsx46(Divider7, { sx: { my: 1.5 } }),
          /* @__PURE__ */ jsxs39(Typography28, { variant: "overline", color: "text.secondary", children: [
            "Cadena de roles ",
            data.chains.length ? `(${data.chains.length})` : ""
          ] }),
          data.chains.length === 0 ? /* @__PURE__ */ jsx46(Typography28, { variant: "body2", color: "text.secondary", sx: { mt: 0.5 }, children: "El usuario no tiene roles asignados. Permisos efectivos = visitante por defecto." }) : /* @__PURE__ */ jsx46(Stack24, { spacing: 1, sx: { mt: 1 }, children: data.chains.map((c) => /* @__PURE__ */ jsx46(RoleCard, { chain: c, roles: data.activeRoles }, c.name)) }),
          /* @__PURE__ */ jsx46(Divider7, { sx: { my: 1.5 } }),
          /* @__PURE__ */ jsx46(Typography28, { variant: "overline", color: "text.secondary", children: "Permisos efectivos del usuario" }),
          /* @__PURE__ */ jsx46(Typography28, { variant: "caption", color: "text.secondary", sx: { display: "block", mt: 0.25 }, children: "Calculados a partir de sus roles directos m\xE1s la herencia por path jer\xE1rquico, replicando el merge del backend." }),
          data.allows.length === 0 && data.fixFilters.length === 0 && data.others.length === 0 ? /* @__PURE__ */ jsx46(Typography28, { variant: "body2", color: "text.secondary", sx: { mt: 1 }, children: "Sin permisos materializados m\xE1s all\xE1 del visitante por defecto." }) : /* @__PURE__ */ jsxs39(Fragment17, { children: [
            /* @__PURE__ */ jsx46(PermList, { title: "Permitidos", items: data.allows, kind: "allow" }),
            /* @__PURE__ */ jsx46(PermList, { title: "Con filtro fijo", items: data.fixFilters, kind: "fixFilter" }),
            /* @__PURE__ */ jsx46(PermList, { title: "Otros", items: data.others, kind: "other" })
          ] }),
          /* @__PURE__ */ jsx46(Divider7, { sx: { my: 1.5 } }),
          /* @__PURE__ */ jsx46(Typography28, { variant: "caption", color: "text.secondary", children: "Los detalles completos por rol se obtienen al abrir cada columna en la jerarqu\xEDa. Este resumen es de solo lectura y se actualiza al recargar el panel." })
        ] }) }),
        /* @__PURE__ */ jsx46(Box31, { sx: glassDialogActionsSx(), children: /* @__PURE__ */ jsx46(
          "button",
          {
            type: "button",
            className: "MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-textPrimary MuiButton-sizeMedium MuiButton-colorPrimary",
            onClick: onClose,
            children: "Cerrar"
          }
        ) })
      ]
    }
  );
}

// js/tools/PermisosPanel.jsx
import { jsx as jsx47, jsxs as jsxs40 } from "react/jsx-runtime";
var { useState: useState32, useEffect: useEffect28, useCallback: useCallback15, useMemo: useMemo20, useRef: useRef14 } = getReact();
var { Typography: Typography29, TextField: TextField18, Stack: Stack25, Alert: Alert17, CircularProgress: CircularProgress21, Box: Box32, Chip: Chip22, DialogContent: DialogContent13, DialogActions: DialogActions11, Button: Button22, FormControlLabel: FormControlLabel4, Switch: Switch2 } = getMaterialUI();
function PermisosPanel({ onNeedLogin }) {
  const [loading, setLoading] = useState32(true);
  const [busy, setBusy] = useState32(false);
  const [canManage, setCanManage] = useState32(false);
  const [canAssignUserRoles, setCanAssignUserRoles] = useState32(false);
  const [canEditRoleDescriptions, setCanEditRoleDescriptions] = useState32(false);
  const [authTick, setAuthTick] = useState32(0);
  const loggedIn = useMemo20(() => !!Session?.isLoggedIn?.(), [authTick]);
  const sessionUsername = useMemo20(() => String(Session.username?.() ?? "").trim().toUpperCase(), [authTick]);
  const [err, setErr] = useState32("");
  const [data, setData] = useState32({ roles: [], users: [] });
  const [userSearch, setUserSearch] = useState32("");
  const [roleFilters, setRoleFilters] = useState32([]);
  const [hideEmptyStacks, setHideEmptyStacks] = useState32(readPermisosHideEmptyFromUrl);
  const [filterBusy, setFilterBusy] = useState32(false);
  const [dragOverFilter, setDragOverFilter] = useState32(false);
  const [actorJerarquia, setActorJerarquia] = useState32(null);
  const [actorJerarquias, setActorJerarquias] = useState32([]);
  const [hierarchyOpen, setHierarchyOpen] = useState32(false);
  const [hierarchyFocusRole, setHierarchyFocusRole] = useState32(null);
  const [hierarchyNodes, setHierarchyNodes] = useState32([]);
  const [hierarchyBusy, setHierarchyBusy] = useState32(false);
  const [summaryUsername, setSummaryUsername] = useState32(null);
  const filterToolbarRef = useRef14(null);
  const filterFetchSkipRef = useRef14(true);
  const filterDropFetchRef = useRef14(false);
  const rolesRef = useRef14(data.roles);
  const usersRef = useRef14(data.users);
  const hierarchyLoadRef = useRef14(null);
  rolesRef.current = data.roles;
  usersRef.current = data.users;
  const usersPaginated = !!data.usersTruncated;
  const applyFlags = useCallback15((result) => {
    setCanManage(!!result.canManage);
    setCanAssignUserRoles(!!result.canAssignUserRoles);
    setCanEditRoleDescriptions(!!result.canEditRoleDescriptions);
    const actorRoles = Array.isArray(result.actorRoles) ? result.actorRoles : Array.isArray(Session?.roles) ? Session.roles : [];
    const rolePermisosIdx = buildRolePermisosIndex(Array.isArray(result.roles) ? result.roles : []);
    setActorJerarquias(actorJerarquiasFromRoles(actorRoles, rolePermisosIdx));
    setActorJerarquia(actorJerarquiaFromRoles(actorRoles, rolePermisosIdx));
  }, []);
  const load = useCallback15(async () => {
    setLoading(true);
    setErr("");
    try {
      const result = await fetchPermisos();
      if (!Array.isArray(result.roles) || result.roles.length === 0) {
        throw new Error("ISS no devolvi\xF3 roles activos. Verifique modo Local (ISS :8802) o recargue tras iniciar func start.");
      }
      setData(result);
      applyFlags(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  }, [applyFlags]);
  const refreshPermisos = useCallback15(async () => {
    const result = await fetchPermisos();
    if (!Array.isArray(result.roles) || result.roles.length === 0) {
      throw new Error("ISS no devolvi\xF3 roles activos. Verifique modo Local (ISS :8802) o recargue tras iniciar func start.");
    }
    setData(result);
    applyFlags(result);
    return result;
  }, [applyFlags]);
  const loadHierarchy = useCallback15(async (fallbackRoles = rolesRef.current) => {
    if (hierarchyLoadRef.current) return hierarchyLoadRef.current;
    setHierarchyBusy(true);
    const task = (async () => {
      try {
        const r = await fetchHierarchy();
        let nodes = Array.isArray(r.roles) ? r.roles : [];
        if (!nodes.length) nodes = hierarchyNodesFromRoleEntries(fallbackRoles);
        if (nodes.length) setHierarchyNodes(nodes);
      } catch (e) {
        const nodes = hierarchyNodesFromRoleEntries(fallbackRoles);
        if (nodes.length) setHierarchyNodes(nodes);
        if (!nodes.length) {
          toastError?.((e instanceof Error ? e.message : String(e)) ?? "Error cargando jerarqu\xEDa");
        }
      } finally {
        setHierarchyBusy(false);
        hierarchyLoadRef.current = null;
      }
    })();
    hierarchyLoadRef.current = task;
    return task;
  }, []);
  const openHierarchyDialog = useCallback15(() => {
    hierarchyLoadRef.current = null;
    setHierarchyFocusRole(null);
    const roles = rolesRef.current;
    if (Array.isArray(roles) && roles.length) {
      setHierarchyNodes(hierarchyNodesFromRoleEntries(roles));
    }
    setHierarchyOpen(true);
  }, []);
  const openHierarchyForRole = useCallback15((roleName) => {
    const id = String(roleName ?? "").trim().toLowerCase();
    if (!id) return;
    hierarchyLoadRef.current = null;
    const roles = rolesRef.current;
    if (Array.isArray(roles) && roles.length) {
      setHierarchyNodes(hierarchyNodesFromRoleEntries(roles));
    }
    setHierarchyFocusRole(id);
    setHierarchyOpen(true);
  }, []);
  useEffect28(() => {
    if (!hierarchyOpen) return void 0;
    const roles = rolesRef.current;
    if (!Array.isArray(roles) || !roles.length) return void 0;
    void loadHierarchy(roles);
    return void 0;
  }, [hierarchyOpen, data.roles, loadHierarchy]);
  const handleHierarchySave = useCallback15(async (name, jerarquia) => {
    setHierarchyBusy(true);
    try {
      await updateHierarchyRole(name, { jerarquia });
      await loadHierarchy(rolesRef.current);
      await refreshPermisos();
      toastSuccess?.(`Rol ${name} actualizado`);
    } finally {
      setHierarchyBusy(false);
    }
  }, [loadHierarchy, refreshPermisos]);
  const handleHierarchyCreate = useCallback15(async (name, jerarquia) => {
    setHierarchyBusy(true);
    try {
      await createHierarchyRole({ name, jerarquia });
      await loadHierarchy(rolesRef.current);
      await refreshPermisos();
      toastSuccess?.(`Rol ${name} creado`);
    } finally {
      setHierarchyBusy(false);
    }
  }, [loadHierarchy, refreshPermisos]);
  const handleHierarchyPromote = useCallback15(async (key, value, fromJer, toJer) => {
    setHierarchyBusy(true);
    try {
      throw new Error(`Promover permisos entre roles a\xFAn no soportado en backend (${fromJer} \u2192 ${toJer})`);
    } finally {
      setHierarchyBusy(false);
    }
  }, []);
  const handleHierarchyLocalPerm = useCallback15(async (nodeJer, key, value) => {
    setHierarchyBusy(true);
    try {
      throw new Error(`Edici\xF3n de permisos individuales a\xFAn no soportada en backend (${nodeJer}: ${key})`);
    } finally {
      setHierarchyBusy(false);
    }
  }, []);
  const handleHierarchyDelete = useCallback15(async (name) => {
    setHierarchyBusy(true);
    try {
      await deleteHierarchyRole(name);
      await loadHierarchy(rolesRef.current);
      await refreshPermisos();
      toastSuccess?.(`Rol ${name} eliminado`);
    } finally {
      setHierarchyBusy(false);
    }
  }, [loadHierarchy, refreshPermisos]);
  const loadRef = useRef14(load);
  loadRef.current = load;
  useEffect28(() => {
    loadRef.current();
  }, []);
  useEffect28(() => subscribe((snap) => {
    const permisos = snap.config?.permisos;
    const hide = permisos && typeof permisos === "object" && permisos.hideEmpty === true;
    setHideEmptyStacks((prev) => prev === hide ? prev : hide);
  }), []);
  const setHideEmptyStacksPersist = useCallback15((hide) => {
    setHideEmptyStacks(hide);
    persistPermisosHideEmpty(hide);
  }, []);
  const userDirectory = useMemo20(() => buildUserDirectoryFromPermisos(data.users), [data.users]);
  useEffect28(() => {
    Assets.ensureTodosCss();
    const onAuth = () => {
      setAuthTick((t) => t + 1);
      loadRef.current();
    };
    window.addEventListener(Session.EVENT, onAuth);
    window.addEventListener("isa-patyia:auth", onAuth);
    return () => {
      window.removeEventListener(Session.EVENT, onAuth);
      window.removeEventListener("isa-patyia:auth", onAuth);
    };
  }, []);
  async function run(fn, okMsg) {
    if (!requireAppSession(onNeedLogin)) return;
    setBusy(true);
    setErr("");
    try {
      const result = await fn();
      setData(result);
      applyFlags(result);
      if (okMsg) toastSuccess(okMsg);
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      toastError(msg);
      throw e;
    } finally {
      setBusy(false);
    }
  }
  const handleRoleRemove = useCallback15(async ({ username, role, roleTitle: roleTitle2 }) => {
    if (!requireAppSession(onNeedLogin)) throw new Error("Sesi\xF3n requerida");
    if (!canAssignUserRoles) throw new Error("Sin permiso para mover usuarios entre roles");
    setErr("");
    try {
      const result = await removeUsuarioRole(username, role);
      setData(result);
      applyFlags(result);
      toastSuccess(`${username} quit\xF3 ${roleTitle2 || role}`);
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      toastError(msg);
      throw e;
    }
  }, [onNeedLogin, applyFlags, canAssignUserRoles]);
  const handleRoleAdd = useCallback15(async ({ username, role, roleTitle: roleTitle2 }) => {
    if (!requireAppSession(onNeedLogin)) throw new Error("Sesi\xF3n requerida");
    if (!canAssignUserRoles) throw new Error("Sin permiso para mover usuarios entre roles");
    setErr("");
    try {
      const result = await addUsuarioRole(username, role);
      setData(result);
      applyFlags(result);
      toastSuccess(`${username} \u2192 ${roleTitle2 || role}`);
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      toastError(msg);
      throw e;
    }
  }, [onNeedLogin, applyFlags, canAssignUserRoles]);
  const handleRoleDrag = useCallback15(async ({ username, fromRole, toRole, mode }) => {
    if (!requireAppSession(onNeedLogin)) throw new Error("Sesi\xF3n requerida");
    if (!canAssignUserRoles) throw new Error("Sin permiso para mover usuarios entre roles");
    setErr("");
    try {
      const result = await patchUsuarioRoles(username, { fromRole, toRole, mode });
      setData(result);
      applyFlags(result);
      toastSuccess(`${username} \u2192 ${toRole}`);
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      toastError(msg);
      throw e;
    }
  }, [onNeedLogin, applyFlags, canAssignUserRoles]);
  const fetchPermisosWithSearch = useCallback15(async (search) => {
    const q = String(search ?? "").trim();
    return fetchPermisos(q ? { search: q } : void 0);
  }, []);
  const handleUserFilterDrop = useCallback15(async (username) => {
    const q = String(username ?? "").trim();
    if (!q) return;
    setUserSearch(q);
    if (!usersPaginated) return;
    filterDropFetchRef.current = true;
    setFilterBusy(true);
    setErr("");
    try {
      const result = await fetchPermisosWithSearch(q);
      setData(result);
      applyFlags(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      toastError(msg);
    } finally {
      setFilterBusy(false);
    }
  }, [usersPaginated, fetchPermisosWithSearch, applyFlags]);
  const handleRoleFilterDrop = useCallback15((roleId) => {
    const id = String(roleId ?? "").trim().toLowerCase();
    if (!id) return;
    setRoleFilters((prev) => prev.includes(id) ? prev : [...prev, id]);
  }, []);
  const clearFilters = useCallback15(async () => {
    setUserSearch("");
    setRoleFilters([]);
    if (!usersPaginated) return;
    setFilterBusy(true);
    setErr("");
    try {
      const result = await fetchPermisos();
      setData(result);
      applyFlags(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      toastError(msg);
    } finally {
      setFilterBusy(false);
    }
  }, [usersPaginated, applyFlags]);
  useEffect28(() => {
    if (!usersPaginated) return void 0;
    if (filterFetchSkipRef.current) {
      filterFetchSkipRef.current = false;
      return void 0;
    }
    if (filterDropFetchRef.current) {
      filterDropFetchRef.current = false;
      return void 0;
    }
    const t = window.setTimeout(async () => {
      setFilterBusy(true);
      setErr("");
      try {
        const result = await fetchPermisosWithSearch(userSearch);
        setData(result);
        applyFlags(result);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setErr(msg);
        toastError(msg);
      } finally {
        setFilterBusy(false);
      }
    }, 320);
    return () => window.clearTimeout(t);
  }, [userSearch, usersPaginated, fetchPermisosWithSearch]);
  const roleOptions = useMemo20(
    () => (data.roles || []).map((r) => ({ id: roleNameFromEntry(r), label: roleTitleFromEntry(r) })).filter((r) => r.id && r.id !== VISITANTE),
    [data.roles]
  );
  const boardData = useMemo20(
    () => buildPermisosBoard(data, { userSearch, roleFilters, userDirectory, hideEmptyColumns: hideEmptyStacks }),
    [data, userSearch, roleFilters, userDirectory, hideEmptyStacks]
  );
  const readOnly = !canAssignUserRoles;
  const managePermisos = canManage;
  const editRoleMeta = canEditRoleDescriptions || canManage;
  const filtersActive = !!(userSearch.trim() || roleFilters.length);
  const { GlassToolbar } = getGlass();
  const handleSaveRolePermisos = useCallback15(async (name, permisos, bactivo) => {
    if (!editRoleMeta || !requireAppSession(onNeedLogin)) return;
    setBusy(true);
    setErr("");
    try {
      const result = await putPermisoRolePath(name, permisos, managePermisos ? bactivo : void 0);
      await loadHierarchy(rolesRef.current);
      setData(result);
      applyFlags(result);
      toastSuccess(`Rol ${name} guardado`);
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      toastError(msg);
      throw e;
    } finally {
      setBusy(false);
    }
  }, [editRoleMeta, onNeedLogin, managePermisos, applyFlags, loadHierarchy]);
  if (loading && !hierarchyOpen) {
    return /* @__PURE__ */ jsx47(Box32, { className: "config-permisos-loading", children: /* @__PURE__ */ jsx47(CircularProgress21, { size: 26 }) });
  }
  return /* @__PURE__ */ jsxs40(Box32, { className: "paty-permisos-shell", sx: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }, children: [
    /* @__PURE__ */ jsx47(Box32, { ref: filterToolbarRef, className: "config-permisos-toolbar-wrap", sx: { flexShrink: 0 }, children: /* @__PURE__ */ jsxs40(GlassToolbar, { className: `config-permisos-toolbar${dragOverFilter ? " config-permisos-toolbar--filter-drop" : ""}`, sx: { borderRadius: 0, mb: 0, flexShrink: 0, gap: 1, px: { xs: 1.5, sm: 2 }, py: 1 }, children: [
      /* @__PURE__ */ jsx47(
        TextField18,
        {
          size: "small",
          label: "Buscar usuario",
          placeholder: "Usuario",
          value: userSearch,
          onChange: (e) => setUserSearch(e.target.value),
          disabled: filterBusy,
          className: "config-permisos-toolbar__field config-permisos-toolbar__field--search"
        }
      ),
      /* @__PURE__ */ jsx47(PermisosRoleFilterAutocomplete, { options: roleOptions, value: roleFilters, onChange: setRoleFilters, disabled: filterBusy }),
      filtersActive ? /* @__PURE__ */ jsx47(
        Chip22,
        {
          size: "small",
          variant: "outlined",
          className: "isa-neon-glass-chip",
          label: "Filtros",
          onDelete: clearFilters,
          disabled: filterBusy
        }
      ) : null,
      /* @__PURE__ */ jsx47(
        FormControlLabel4,
        {
          className: "config-permisos-toolbar__hide-empty",
          control: /* @__PURE__ */ jsx47(Switch2, { size: "small", checked: hideEmptyStacks, onChange: (e) => setHideEmptyStacksPersist(e.target.checked), disabled: filterBusy }),
          label: "Ocultar vac\xEDos",
          sx: { mr: 0, ml: 0.5, flexShrink: 0, "& .MuiFormControlLabel-label": { fontSize: "0.8rem", whiteSpace: "nowrap" } }
        }
      ),
      /* @__PURE__ */ jsx47(Box32, { sx: { flex: 1, minWidth: 8 } }),
      /* @__PURE__ */ jsxs40(Stack25, { direction: "row", spacing: 0.5, alignItems: "center", className: "config-form-section__actions config-permisos-toolbar__actions", children: [
        /* @__PURE__ */ jsx47(ButtonIconify, { icon: "mdi:family-tree", title: "Jerarqu\xEDa y rol visitante", onClick: openHierarchyDialog, disabled: busy || filterBusy }),
        /* @__PURE__ */ jsx47(ButtonIconify, { icon: "mdi:refresh", title: "Recargar", onClick: load, disabled: busy || filterBusy })
      ] })
    ] }) }),
    err ? /* @__PURE__ */ jsx47(Alert17, { severity: "warning", className: "config-form-alert config-permisos-alert", children: err }) : null,
    /* @__PURE__ */ jsx47(
      PermisosKanban,
      {
        boardData,
        loggedIn,
        sessionUsername,
        canAssignRoles: canAssignUserRoles,
        readOnly,
        canManage: managePermisos,
        canEditRoleDescriptions: editRoleMeta,
        busy: busy || filterBusy,
        actorJerarquia,
        actorJerarquias,
        onJerarquiaToast: (t) => toastInfo?.(t.message) ?? alert(t.message),
        onOpenRoleHierarchy: openHierarchyForRole,
        onUserSummary: (username) => setSummaryUsername(username),
        filterToolbarRef,
        onUserFilterDrop: handleUserFilterDrop,
        onRoleFilterDrop: handleRoleFilterDrop,
        onDragOverFilterChange: setDragOverFilter,
        onRoleSave: ({ name, permisos, bactivo }) => run(() => putPermisoRolePath(name, permisos, bactivo), `Rol ${name} guardado`),
        onRoleDrag: handleRoleDrag,
        onRoleRemove: handleRoleRemove,
        onRoleAdd: handleRoleAdd
      }
    ),
    /* @__PURE__ */ jsxs40(
      GlassDialog,
      {
        open: hierarchyOpen,
        onClose: () => {
          setHierarchyOpen(false);
          setHierarchyFocusRole(null);
        },
        fullScreen: true,
        fullWidth: true,
        maxWidth: false,
        paperClassName: "isa-glass-dialog--fullscreen permisos-hierarchy-dialog",
        header: /* @__PURE__ */ jsx47(GlassDialogHeader, { icon: "mdi:family-tree", title: "Jerarqu\xEDa de roles", subtitle: "Visitante y permisos \u2014 solo branch 0 edita la jerarqu\xEDa", accent: "#10b981", onClose: () => {
          setHierarchyOpen(false);
          setHierarchyFocusRole(null);
        } }),
        children: [
          /* @__PURE__ */ jsx47(DialogContent13, { dividers: true, sx: Object.assign({}, glassDialogContentSx({ p: 0, flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }), { height: "100%" }), children: /* @__PURE__ */ jsx47(
            RoleHierarchyView,
            {
              nodes: hierarchyNodes,
              roleEntries: data.roles,
              initialSelectedRole: hierarchyFocusRole,
              canManagePermisos: managePermisos,
              canEditRoleDescriptions: editRoleMeta,
              onSaveRolePermisos: editRoleMeta ? handleSaveRolePermisos : void 0,
              canMutate: isBranchZero(actorJerarquia ?? ""),
              busy: hierarchyBusy,
              onSave: handleHierarchySave,
              onCreate: handleHierarchyCreate,
              onDelete: handleHierarchyDelete,
              onSaveLocalPerm: handleHierarchyLocalPerm,
              onPromote: handleHierarchyPromote
            }
          ) }),
          /* @__PURE__ */ jsx47(DialogActions11, { sx: glassDialogActionsSx(), children: /* @__PURE__ */ jsx47(Button22, { onClick: () => setHierarchyOpen(false), sx: { textTransform: "none", fontWeight: 600 }, children: "Cerrar" }) })
        ]
      }
    ),
    /* @__PURE__ */ jsx47(
      UserPermissionsSummaryDialog,
      {
        open: !!summaryUsername,
        onClose: () => setSummaryUsername(null),
        username: summaryUsername,
        users: data?.users ?? [],
        roles: data?.roles ?? []
      }
    )
  ] });
}

// js/tools/configOpenAi.ts
var DEFAULT_MAX_NUM_RESULTS = 8;
var MIN_MAX_NUM_RESULTS = 3;
var MAX_MAX_NUM_RESULTS = 50;
var DEFAULT_MODELO_OPERATIVO = "gpt-4.1-nano";
var DEFAULT_MODELO_CONVERSACION = "gpt-5-nano";
function modelSelectOptions(...extra) {
  return mergeModelOptions(...extra);
}
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
function parseModel(v, fallback) {
  return String(v ?? "").trim() || fallback;
}
function parseMaxNum(v) {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n) || n < MIN_MAX_NUM_RESULTS || n > MAX_MAX_NUM_RESULTS) return null;
  return n;
}
function validateOpenAiConfig(config, opts = {}) {
  const errors = [];
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    return { ok: false, errors: ["La configuraci\xF3n debe ser un objeto"], normalized: buildDefaults() };
  }
  const src = config;
  const modelOptions = opts.modelOptions ?? modelSelectOptions(src.modeloOperativo, src.modeloConversacion);
  const maxNum = parseMaxNum(src.max_num_results);
  if (maxNum == null) errors.push(`Fragmentos: use un valor entre ${MIN_MAX_NUM_RESULTS} y ${MAX_MAX_NUM_RESULTS}`);
  const modeloOperativo = parseModel(src.modeloOperativo, DEFAULT_MODELO_OPERATIVO);
  const modeloConversacion = parseModel(src.modeloConversacion, DEFAULT_MODELO_CONVERSACION);
  if (!modelOptions.includes(modeloOperativo)) errors.push(`Modelo operativo "${modeloOperativo}" no est\xE1 en el cat\xE1logo`);
  if (!modelOptions.includes(modeloConversacion)) errors.push(`Modelo conversaci\xF3n "${modeloConversacion}" no est\xE1 en el cat\xE1logo`);
  return {
    ok: errors.length === 0,
    errors,
    normalized: { max_num_results: maxNum ?? DEFAULT_MAX_NUM_RESULTS, modeloOperativo, modeloConversacion }
  };
}
function buildDefaults() {
  return {
    max_num_results: DEFAULT_MAX_NUM_RESULTS,
    modeloOperativo: DEFAULT_MODELO_OPERATIVO,
    modeloConversacion: DEFAULT_MODELO_CONVERSACION
  };
}
function prettyJson2(obj) {
  try {
    return JSON.stringify(obj ?? {}, null, 2);
  } catch {
    return "{}";
  }
}
function toOpenAiJsonPayload(cfg) {
  return { max_num_results: cfg.max_num_results, modeloOperativo: cfg.modeloOperativo, modeloConversacion: cfg.modeloConversacion };
}
function parseAndValidateJsonText(text, opts = {}) {
  let parsed;
  try {
    parsed = JSON.parse(String(text ?? ""));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, errors: [`JSON inv\xE1lido: ${msg}`], normalized: buildDefaults() };
  }
  const result = validateOpenAiConfig(parsed, opts);
  return { ...result, parsed: result.normalized };
}

// js/tools/configPromptsOperativos.ts
var REASONING_EFFORT_OPTIONS = ["low", "medium", "high"];
var MESSAGE_ROLES = ["system", "user", "assistant"];
var LEGACY_META_KEYS = ["modeloOperativo", "modeloConversacion", "temperaturaConversacion"];
function prettyJson3(obj) {
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
function parseAndValidateJsonText2(text, opts = {}) {
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
var { useRef: useRef15, useState: useState33 } = getReact();
function useConfigFieldPersist() {
  const saveGenRef = useRef15(0);
  const [fieldBusy, setFieldBusy] = useState33({});
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
import { Fragment as Fragment18, jsx as jsx48, jsxs as jsxs41 } from "react/jsx-runtime";
var { useState: useState34, useEffect: useEffect29, useCallback: useCallback16, useRef: useRef16 } = getReact();
var {
  Typography: Typography30,
  TextField: TextField19,
  Stack: Stack26,
  Alert: Alert18,
  Box: Box33,
  Skeleton: Skeleton2,
  FormControl: FormControl7,
  InputLabel: InputLabel4,
  Select: Select7,
  MenuItem: MenuItem7,
  Accordion: Accordion3,
  AccordionSummary: AccordionSummary3,
  AccordionDetails: AccordionDetails3,
  DialogContent: DialogContent14,
  DialogActions: DialogActions12,
  Button: Button23,
  Tooltip: Tooltip16
} = getMaterialUI();
var { Icon: Icon22 } = UI;
var PROMPT_LABELS = {
  generarTitulo: "Generar t\xEDtulo",
  generarResumenTicket: "Resumen ticket"
};
var PROMPT_DEF_FIELD_SX = { width: 200, minWidth: 200, flex: "0 0 auto" };
function promptLabel(key) {
  return PROMPT_LABELS[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}
var SKELETON_TITLE_WIDTHS = ["42%", "52%", "38%", "48%"];
function ConfigPromptsSkeleton({ count, expandState }) {
  const expandedKey = Object.keys(expandState ?? {}).find((k) => expandState[k]);
  return /* @__PURE__ */ jsx48(Stack26, { spacing: 1, className: "config-prompt-accordions config-prompt-accordions--skeleton", "aria-busy": "true", "aria-label": "Cargando prompts operativos", children: Array.from({ length: count }, (_, i) => {
    const expanded = expandedKey ? i === 0 : false;
    return /* @__PURE__ */ jsxs41(Accordion3, { expanded, className: "config-prompt-accordion", disableGutters: true, elevation: 0, children: [
      /* @__PURE__ */ jsx48(AccordionSummary3, { expandIcon: /* @__PURE__ */ jsx48(Icon22, { icon: "mdi:chevron-down", size: 20 }), children: /* @__PURE__ */ jsx48(Skeleton2, { variant: "text", width: SKELETON_TITLE_WIDTHS[i % SKELETON_TITLE_WIDTHS.length], height: 22 }) }),
      expanded ? /* @__PURE__ */ jsx48(AccordionDetails3, { children: /* @__PURE__ */ jsxs41(Stack26, { spacing: 2, className: "config-prompt-def", children: [
        /* @__PURE__ */ jsxs41(Stack26, { direction: "row", spacing: 2, className: "config-prompt-def-fields", children: [
          /* @__PURE__ */ jsx48(Skeleton2, { variant: "rounded", height: 40, sx: { width: 200, flex: "0 0 auto" } }),
          /* @__PURE__ */ jsx48(Skeleton2, { variant: "rounded", height: 40, sx: { width: 200, flex: "0 0 auto" } }),
          /* @__PURE__ */ jsx48(Skeleton2, { variant: "rounded", height: 40, sx: { width: 200, flex: "0 0 auto" } })
        ] }),
        /* @__PURE__ */ jsx48(Skeleton2, { variant: "rounded", height: 140 }),
        /* @__PURE__ */ jsx48(Skeleton2, { variant: "rounded", height: 140 })
      ] }) }) : null
    ] }, i);
  }) });
}
function OperativosJsonModal({ open, initial: initial2, readOnly, operativeModel, onClose, onApply }) {
  const [json, setJson] = useState34(initial2);
  const [errors, setErrors] = useState34([]);
  useEffect29(() => {
    if (open) {
      setJson(initial2);
      setErrors([]);
    }
  }, [open, initial2]);
  function validateNow(text) {
    const r = parseAndValidateJsonText2(text, { operativeModel });
    setErrors(r.errors);
    return r;
  }
  function apply() {
    const r = validateNow(json);
    if (!r.ok) return;
    onApply?.(r.normalized);
    onClose();
  }
  const canApply = parseAndValidateJsonText2(json, { operativeModel }).ok;
  return /* @__PURE__ */ jsxs41(
    GlassDialog,
    {
      open,
      onClose,
      maxWidth: "md",
      fullWidth: true,
      paperMaxWidth: 960,
      header: /* @__PURE__ */ jsx48(GlassDialogHeader, { icon: "mdi:code-json", title: "JSON", accent: "#6366f1", onClose }),
      children: [
        /* @__PURE__ */ jsxs41(DialogContent14, { dividers: true, sx: glassDialogContentSx({ p: 0, minHeight: 380 }), children: [
          errors.length ? /* @__PURE__ */ jsx48(Alert18, { severity: "warning", sx: { m: 1.5, mb: 0 }, children: /* @__PURE__ */ jsx48(Stack26, { component: "ul", spacing: 0.25, sx: { m: 0, pl: 2 }, children: errors.map((e) => /* @__PURE__ */ jsx48("li", { children: /* @__PURE__ */ jsx48(Typography30, { variant: "body2", children: e }) }, e)) }) }) : null,
          /* @__PURE__ */ jsx48(Box33, { className: "permisos-json-modal-editor config-prompts-json-modal", sx: { minHeight: 340, p: 1 }, children: /* @__PURE__ */ jsx48(JsonCodeEditor, { value: json, onChange: readOnly ? void 0 : (v) => {
            setJson(v);
            validateNow(v);
          }, readOnly, placeholder: "{}", fullPageTitle: "prompts_operativos" }) })
        ] }),
        /* @__PURE__ */ jsxs41(DialogActions12, { sx: glassDialogActionsSx(), children: [
          /* @__PURE__ */ jsx48(Button23, { onClick: onClose, sx: { textTransform: "none", fontWeight: 600 }, children: readOnly ? "Cerrar" : "Cancelar" }),
          !readOnly && onApply ? /* @__PURE__ */ jsx48(Button23, { variant: "contained", onClick: apply, disabled: !canApply, sx: { textTransform: "none", fontWeight: 600 }, children: "Aplicar JSON" }) : null
        ] })
      ]
    }
  );
}
function MessageCard({ role, body, bodyLines, canEdit, promptKey, onChange }) {
  const icon = role === "system" ? "mdi:cog-outline" : role === "user" ? "mdi:account-outline" : "mdi:robot-outline";
  const title = role === "system" ? "Sistema" : role === "user" ? "Usuario" : "Asistente";
  return /* @__PURE__ */ jsxs41(Box33, { className: `config-prompt-msg config-prompt-msg--${role} isa-neon-accent-stripe`, children: [
    /* @__PURE__ */ jsxs41(Stack26, { direction: "row", spacing: 1, alignItems: "center", className: "config-prompt-msg__head", children: [
      /* @__PURE__ */ jsx48(Icon22, { icon, size: 16 }),
      /* @__PURE__ */ jsx48(Typography30, { variant: "subtitle2", fontWeight: 700, children: title })
    ] }),
    /* @__PURE__ */ jsx48(Box33, { className: "config-prompt-msg__editor", children: /* @__PURE__ */ jsx48(
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
  ] });
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
  return /* @__PURE__ */ jsxs41(Stack26, { spacing: 2, className: "config-prompt-def", children: [
    /* @__PURE__ */ jsxs41(Stack26, { direction: { xs: "column", md: "row" }, spacing: 2, useFlexGap: true, flexWrap: "wrap", alignItems: "flex-end", className: "config-prompt-def-fields", children: [
      /* @__PURE__ */ jsxs41(FormControl7, { size: "small", sx: PROMPT_DEF_FIELD_SX, disabled: !canEdit, children: [
        /* @__PURE__ */ jsx48(InputLabel4, { id: `prompt-reasoning-${promptKey}-label`, shrink: true, children: "Razonamiento" }),
        /* @__PURE__ */ jsx48(Select7, { labelId: `prompt-reasoning-${promptKey}-label`, label: "Razonamiento", value: def?.reasoning_effort || "low", onChange: (e) => patchDef({ reasoning_effort: e.target.value }), children: REASONING_EFFORT_OPTIONS.map((o) => /* @__PURE__ */ jsx48(MenuItem7, { value: o, children: o }, o)) })
      ] }),
      /* @__PURE__ */ jsx48(
        TextField19,
        {
          size: "small",
          label: "M\xE1x. tokens",
          type: "number",
          disabled: !canEdit,
          fullWidth: true,
          value: def?.max_completion_tokens ?? "",
          sx: PROMPT_DEF_FIELD_SX,
          onChange: (e) => patchDef({ max_completion_tokens: e.target.value === "" ? void 0 : Number(e.target.value) }),
          slotProps: { htmlInput: { min: 1, max: 128e3, step: 1 } }
        }
      ),
      /* @__PURE__ */ jsx48(Tooltip16, { title: tempAllowed ? void 0 : "No aplica a este modelo", placement: "top", children: /* @__PURE__ */ jsx48(Box33, { component: "span", sx: PROMPT_DEF_FIELD_SX, children: /* @__PURE__ */ jsx48(
        TextField19,
        {
          size: "small",
          fullWidth: true,
          label: "Temperatura",
          disabled: !canEdit || !tempAllowed,
          ...unitIntervalFieldProps(def?.temperatura, 0.4, (v) => patchDef({ temperatura: v }))
        }
      ) }) })
    ] }),
    /* @__PURE__ */ jsx48(
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
    /* @__PURE__ */ jsx48(
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
  ] });
}
function ConfigPromptsOperativosPanel({ onNeedLogin, ConfigFormSection: ConfigFormSection2, operativeModel, conversationModel: _conversationModel }) {
  const [loading, setLoading] = useState34(true);
  const [canEdit, setCanEdit] = useState34(false);
  const [config, setConfig] = useState34({});
  const [saved, setSaved] = useState34({});
  const savedRef = useRef16(saved);
  savedRef.current = saved;
  const { saveGenRef, beginSave, endSave, fieldDisabled } = useConfigFieldPersist();
  const [jsonOpen, setJsonOpen] = useState34(false);
  const [expandState, setExpandState] = useState34(() => readPromptAccordionExpandState());
  const [skeletonCount, setSkeletonCount] = useState34(() => readPromptSkeletonCount());
  const opModel = String(operativeModel ?? DEFAULT_MODELO_OPERATIVO).trim() || DEFAULT_MODELO_OPERATIVO;
  const promptKeys = listPromptKeys(config);
  useEffect29(() => {
    writePromptAccordionExpandState(expandState);
  }, [expandState]);
  function isExpanded(key) {
    if (Object.prototype.hasOwnProperty.call(expandState, key)) return !!expandState[key];
    return false;
  }
  function handleToggleExpand(key, on) {
    setExpandState((prev) => ({ ...prev, [key]: on }));
  }
  const load = useCallback16(async () => {
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
  useEffect29(() => {
    load();
  }, [load]);
  useEffect29(() => {
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
  return /* @__PURE__ */ jsxs41(
    ConfigFormSection2,
    {
      className: "config-form-section--prompts",
      icon: /* @__PURE__ */ jsx48(Icon22, { icon: "mdi:robot-outline", size: 20 }),
      title: "Prompts operativos",
      description: "Tareas autom\xE1ticas: t\xEDtulo, resumen de ticket y similares.",
      actions: /* @__PURE__ */ jsxs41(Fragment18, { children: [
        /* @__PURE__ */ jsx48(ButtonIconify, { icon: "mdi:code-json", title: "JSON", onClick: () => setJsonOpen(true) }),
        /* @__PURE__ */ jsx48(ButtonIconify, { icon: "mdi:refresh", title: "Recargar", onClick: load, busy: loading })
      ] }),
      children: [
        loading ? /* @__PURE__ */ jsx48(ConfigPromptsSkeleton, { count: skeletonCount, expandState }) : /* @__PURE__ */ jsx48(Stack26, { spacing: 1, className: "config-prompt-accordions", children: promptKeys.map((key) => /* @__PURE__ */ jsxs41(
          Accordion3,
          {
            expanded: isExpanded(key),
            onChange: (_e, on) => handleToggleExpand(key, on),
            className: "config-prompt-accordion",
            disableGutters: true,
            elevation: 0,
            children: [
              /* @__PURE__ */ jsx48(AccordionSummary3, { expandIcon: /* @__PURE__ */ jsx48(Icon22, { icon: "mdi:chevron-down", size: 20 }), children: /* @__PURE__ */ jsx48(Typography30, { fontWeight: 600, children: promptLabel(key) }) }),
              /* @__PURE__ */ jsx48(AccordionDetails3, { children: /* @__PURE__ */ jsx48(
                PromptDefEditor,
                {
                  promptKey: key,
                  def: config[key],
                  canEdit: !fieldDisabled(canEdit, key),
                  operativeModel: opModel,
                  onChange: (def) => updatePrompt(key, def)
                }
              ) })
            ]
          },
          key
        )) }),
        /* @__PURE__ */ jsx48(
          OperativosJsonModal,
          {
            open: jsonOpen,
            initial: prettyJson3(config),
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

// js/tools/configToolState.ts
var LS_KEY2 = "isa-patyia:config-tab";
var DEFAULT_TAB = "sistema";
var VALID_TABS = /* @__PURE__ */ new Set(["sistema", "permisos"]);
function readConfigToolTab() {
  try {
    const v = localStorage.getItem(LS_KEY2);
    return v && VALID_TABS.has(v) ? v : DEFAULT_TAB;
  } catch {
    return DEFAULT_TAB;
  }
}
function writeConfigToolTab(tab) {
  try {
    if (VALID_TABS.has(tab)) localStorage.setItem(LS_KEY2, tab);
  } catch {
  }
}

// js/tools/ConfigTool.jsx
import { Fragment as Fragment19, jsx as jsx49, jsxs as jsxs42 } from "react/jsx-runtime";
var { useState: useState35, useEffect: useEffect30, useCallback: useCallback17, useMemo: useMemo21, useRef: useRef17 } = getReact();
var { Paper: Paper4, Typography: Typography31, TextField: TextField20, Stack: Stack27, Alert: Alert19, Tabs: Tabs4, Tab: Tab4, Box: Box34, FormControl: FormControl8, InputLabel: InputLabel5, Select: Select8, MenuItem: MenuItem8, Tooltip: Tooltip17, DialogContent: DialogContent15, DialogActions: DialogActions13, Button: Button24, Divider: Divider8 } = getMaterialUI();
var { Icon: Icon23 } = UI;
function ConfigFormSection({ icon, title, description, chips, actions, footer, children, className, accent }) {
  const { useGlassColors, glassCardSx, glassHeaderSx, glassInnerSx, NEON_COLORS } = getGlass();
  const c = useGlassColors();
  const sectionAccent = accent ?? (className?.includes("openai") ? NEON_COLORS.purple : className?.includes("prompts") ? NEON_COLORS.cyan : NEON_COLORS.blue);
  return /* @__PURE__ */ jsxs42(
    Paper4,
    {
      variant: "outlined",
      elevation: 0,
      className: ["isa-glass-section", "config-form-section", className].filter(Boolean).join(" "),
      sx: glassCardSx(c, { tone: "default", accent: sectionAccent, hover: true, mb: 0, width: "100%" }),
      children: [
        title ? /* @__PURE__ */ jsx49(
          Box34,
          {
            className: "isa-glass-section__head config-form-section__head",
            sx: {
              px: { xs: 2, sm: 2.5 },
              py: 1.5,
              ...glassHeaderSx(c, sectionAccent),
              ...glassInnerSx(c, "blue")
            },
            children: /* @__PURE__ */ jsxs42(Stack27, { direction: "row", alignItems: "center", justifyContent: "space-between", spacing: 1.25, sx: { width: "100%" }, children: [
              /* @__PURE__ */ jsxs42(Stack27, { direction: "row", spacing: 1.25, alignItems: "center", sx: { minWidth: 0, flex: "1 1 auto" }, children: [
                icon ? /* @__PURE__ */ jsx49(
                  Box34,
                  {
                    className: "isa-glass-section__icon",
                    sx: {
                      width: 32,
                      height: 32,
                      borderRadius: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      background: `linear-gradient(135deg, ${sectionAccent}, ${sectionAccent}99)`,
                      color: "#fff",
                      boxShadow: c.dark ? `0 4px 12px ${sectionAccent}44` : "none"
                    },
                    children: icon
                  }
                ) : null,
                /* @__PURE__ */ jsx49(Typography31, { variant: "subtitle1", component: "h3", className: "config-form-section__title", sx: { fontWeight: 700, letterSpacing: -0.2, color: c.text }, children: title })
              ] }),
              actions ? /* @__PURE__ */ jsx49(Stack27, { direction: "row", spacing: 0.5, alignItems: "center", flexShrink: 0, className: "config-form-section__actions", sx: { ml: "auto" }, children: actions }) : null
            ] })
          }
        ) : null,
        /* @__PURE__ */ jsxs42(Box34, { className: "isa-glass-section__body config-form-section__content", sx: { pt: 1.75, pb: 2.25, px: { xs: 2, sm: 2.5 }, color: c.text }, children: [
          description ? /* @__PURE__ */ jsx49(Typography31, { variant: "body2", color: "text.secondary", className: "config-form-section__desc", children: description }) : null,
          chips?.length ? /* @__PURE__ */ jsx49(Stack27, { direction: "row", spacing: 1, flexWrap: "wrap", useFlexGap: true, className: "config-form-section__chips", sx: { mb: 1.15 }, children: chips }) : null,
          /* @__PURE__ */ jsx49(Box34, { className: "config-form-section__body", children }),
          footer
        ] })
      ]
    }
  );
}
function OpenAiJsonModal({ open, initial: initial2, readOnly, modelOptions, onClose, onApply }) {
  const [json, setJson] = useState35(initial2);
  const [errors, setErrors] = useState35([]);
  useEffect30(() => {
    if (open) {
      setJson(initial2);
      setErrors([]);
    }
  }, [open, initial2]);
  function validateNow(text) {
    const r = parseAndValidateJsonText(text, { modelOptions });
    setErrors(r.errors);
    return r;
  }
  function apply() {
    const r = validateNow(json);
    if (!r.ok) return;
    onApply?.(r.normalized);
    onClose();
  }
  const canApply = parseAndValidateJsonText(json, { modelOptions }).ok;
  return /* @__PURE__ */ jsxs42(
    GlassDialog,
    {
      open,
      onClose,
      maxWidth: "md",
      fullWidth: true,
      paperMaxWidth: 720,
      header: /* @__PURE__ */ jsx49(GlassDialogHeader, { icon: "mdi:code-json", title: "OpenAI \u2014 JSON", accent: "#6366f1", onClose }),
      children: [
        /* @__PURE__ */ jsxs42(DialogContent15, { dividers: true, sx: glassDialogContentSx({ p: 0, minHeight: 320 }), children: [
          errors.length ? /* @__PURE__ */ jsx49(Alert19, { severity: "warning", sx: { m: 1.5, mb: 0 }, children: /* @__PURE__ */ jsx49(Stack27, { component: "ul", spacing: 0.25, sx: { m: 0, pl: 2 }, children: errors.map((e) => /* @__PURE__ */ jsx49("li", { children: /* @__PURE__ */ jsx49(Typography31, { variant: "body2", children: e }) }, e)) }) }) : null,
          /* @__PURE__ */ jsx49(Box34, { className: "permisos-json-modal-editor config-openai-json-modal", sx: { minHeight: 280, p: 1 }, children: /* @__PURE__ */ jsx49(JsonCodeEditor, { value: json, onChange: readOnly ? void 0 : (v) => {
            setJson(v);
            validateNow(v);
          }, readOnly, placeholder: "{}", fullPageTitle: "openai" }) })
        ] }),
        /* @__PURE__ */ jsxs42(DialogActions13, { sx: glassDialogActionsSx(), children: [
          /* @__PURE__ */ jsx49(Button24, { onClick: onClose, sx: { textTransform: "none", fontWeight: 600 }, children: readOnly ? "Cerrar" : "Cancelar" }),
          !readOnly && onApply ? /* @__PURE__ */ jsx49(Button24, { variant: "contained", onClick: apply, disabled: !canApply, sx: { textTransform: "none", fontWeight: 600 }, children: "Aplicar JSON" }) : null
        ] })
      ]
    }
  );
}
function ConfigTool({ onNeedLogin }) {
  const [tab, setTab] = useState35(() => readConfigToolTab());
  useEffect30(() => {
    writeConfigToolTab(tab);
  }, [tab]);
  return /* @__PURE__ */ jsx49("div", { className: "tool-grid tool-grid-config isa-tool-surface", children: /* @__PURE__ */ jsxs42(Paper4, { className: "tool-panel scroll-panel config-tool-panel", elevation: 0, children: [
    /* @__PURE__ */ jsx49("div", { className: "panel-head config-tool-head", children: /* @__PURE__ */ jsxs42(Tabs4, { value: tab, onChange: (_e, v) => setTab(v), variant: "scrollable", scrollButtons: "auto", className: "config-tool-tabs", children: [
      /* @__PURE__ */ jsx49(Tab4, { value: "sistema", label: "Sistema", icon: /* @__PURE__ */ jsx49(Icon23, { icon: "mdi:tune-vertical", size: 14 }), iconPosition: "start" }),
      /* @__PURE__ */ jsx49(Tab4, { value: "permisos", label: "Permisos", icon: /* @__PURE__ */ jsx49(Icon23, { icon: "mdi:shield-key-outline", size: 14 }), iconPosition: "start" })
    ] }) }),
    tab === "permisos" ? /* @__PURE__ */ jsx49("div", { className: "panel-body config-panel-body config-panel-body--permisos custom-scrollbar", children: /* @__PURE__ */ jsx49(PermisosPanel, { onNeedLogin }) }) : /* @__PURE__ */ jsx49(SistemaConfigBody, { onNeedLogin })
  ] }) });
}
function SistemaConfigBody({ onNeedLogin }) {
  const [openAiModels, setOpenAiModels] = useState35(() => ({ modeloOperativo: buildDefaults().modeloOperativo, modeloConversacion: buildDefaults().modeloConversacion }));
  return /* @__PURE__ */ jsx49("div", { className: "panel-body config-panel-body custom-scrollbar", children: /* @__PURE__ */ jsxs42(Box34, { className: "config-panel-inner config-panel-inner--form config-sections-stack", children: [
    /* @__PURE__ */ jsx49(OpenAiSection, { onNeedLogin, onModelsChange: setOpenAiModels }),
    /* @__PURE__ */ jsx49(Divider8, { className: "config-form-divider", role: "separator", "aria-hidden": "true" }),
    /* @__PURE__ */ jsx49(
      ConfigPromptsOperativosPanel,
      {
        onNeedLogin,
        ConfigFormSection,
        operativeModel: openAiModels.modeloOperativo,
        conversationModel: openAiModels.modeloConversacion
      }
    )
  ] }) });
}
function OpenAiSection({ onNeedLogin, onModelsChange }) {
  const [loading, setLoading] = useState35(true);
  const [canEdit, setCanEdit] = useState35(false);
  const [jsonOpen, setJsonOpen] = useState35(false);
  const [config, setConfig] = useState35(buildDefaults);
  const [saved, setSaved] = useState35(buildDefaults);
  const savedRef = useRef17(saved);
  savedRef.current = saved;
  const { saveGenRef, beginSave, endSave, fieldDisabled } = useConfigFieldPersist();
  const modelOptions = useMemo21(() => modelSelectOptions(config.modeloOperativo, config.modeloConversacion), [config]);
  const load = useCallback17(async () => {
    setLoading(true);
    try {
      const cfg = await fetchOpenAiSystemConfig();
      const next = { ...buildDefaults(), ...cfg };
      setConfig(next);
      setSaved(next);
      setCanEdit(!!cfg.canEdit);
      onModelsChange?.({ modeloOperativo: next.modeloOperativo, modeloConversacion: next.modeloConversacion });
    } catch (e) {
      toastError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [onModelsChange]);
  useEffect30(() => {
    load();
  }, [load]);
  useEffect30(() => {
    const onAuth = () => {
      load();
    };
    window.addEventListener(Session.EVENT, onAuth);
    return () => window.removeEventListener(Session.EVENT, onAuth);
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
    const opts = modelSelectOptions(cfg.modeloOperativo, cfg.modeloConversacion);
    const v = validateOpenAiConfig(cfg, { modelOptions: opts });
    if (!v.ok) {
      toastError(v.errors.join(" \xB7 "));
      endSave(gen);
      return;
    }
    try {
      await putOpenAiSystemConfig(v.normalized);
      if (gen !== saveGenRef.current) return;
      const next = { ...v.normalized, canEdit };
      savedRef.current = next;
      setSaved(next);
      setConfig(next);
      onModelsChange?.({ modeloOperativo: next.modeloOperativo, modeloConversacion: next.modeloConversacion });
      toastSuccess("Guardado");
    } catch (e) {
      if (gen !== saveGenRef.current) return;
      const prev = savedRef.current;
      setConfig(prev);
      onModelsChange?.({ modeloOperativo: prev.modeloOperativo, modeloConversacion: prev.modeloConversacion });
      toastError(e instanceof Error ? e.message : String(e));
    } finally {
      endSave(gen);
    }
  }
  function patch(p) {
    const fields = Object.keys(p);
    const next = { ...config, ...p };
    setConfig(next);
    onModelsChange?.({ modeloOperativo: next.modeloOperativo, modeloConversacion: next.modeloConversacion });
    void persist(next, beginSave(fields), fields);
  }
  return /* @__PURE__ */ jsxs42(
    ConfigFormSection,
    {
      className: "config-form-section--openai",
      icon: /* @__PURE__ */ jsx49(Icon23, { icon: "mdi:brain", size: 20 }),
      title: "OpenAI",
      description: "Modelos por defecto y fragmentos de b\xFAsqueda en archivos.",
      actions: /* @__PURE__ */ jsxs42(Fragment19, { children: [
        /* @__PURE__ */ jsx49(ButtonIconify, { icon: "mdi:code-json", title: "JSON", onClick: () => setJsonOpen(true) }),
        /* @__PURE__ */ jsx49(ButtonIconify, { icon: "mdi:refresh", title: "Recargar", onClick: load, busy: loading })
      ] }),
      children: [
        /* @__PURE__ */ jsxs42(Box34, { className: "config-openai-fields-row", sx: { display: "grid", gridTemplateColumns: "minmax(160px, 1.2fr) minmax(160px, 1.2fr) 108px", gap: "1rem 1.25rem", alignItems: "start", width: "100%", maxWidth: 640, mt: 0.5 }, children: [
          /* @__PURE__ */ jsxs42(FormControl8, { size: "small", className: "config-openai-fields-row__cell", disabled: fieldDisabled(canEdit, "modeloOperativo"), children: [
            /* @__PURE__ */ jsx49(InputLabel5, { id: "config-openai-operativo-label", shrink: true, children: "Operativo" }),
            /* @__PURE__ */ jsx49(Select8, { labelId: "config-openai-operativo-label", label: "Operativo", value: config.modeloOperativo, onChange: (e) => patch({ modeloOperativo: e.target.value }), children: modelOptions.map((id) => /* @__PURE__ */ jsx49(MenuItem8, { value: id, children: id }, id)) })
          ] }),
          /* @__PURE__ */ jsxs42(FormControl8, { size: "small", className: "config-openai-fields-row__cell", disabled: fieldDisabled(canEdit, "modeloConversacion"), children: [
            /* @__PURE__ */ jsx49(InputLabel5, { id: "config-openai-conversacion-label", shrink: true, children: "Conversaci\xF3n" }),
            /* @__PURE__ */ jsx49(Select8, { labelId: "config-openai-conversacion-label", label: "Conversaci\xF3n", value: config.modeloConversacion, onChange: (e) => patch({ modeloConversacion: e.target.value }), children: modelOptions.map((id) => /* @__PURE__ */ jsx49(MenuItem8, { value: id, children: id }, id)) })
          ] }),
          /* @__PURE__ */ jsx49(Box34, { className: "config-openai-fields-row__cell config-openai-fields-row__fragments", children: /* @__PURE__ */ jsx49(Tooltip17, { title: "Fragmentos de documentaci\xF3n usados por consulta (3\u201350)", placement: "top", children: /* @__PURE__ */ jsx49(
            TextField20,
            {
              label: "Fragmentos",
              type: "number",
              size: "small",
              fullWidth: true,
              value: config.max_num_results,
              disabled: fieldDisabled(canEdit, "max_num_results"),
              onChange: (e) => patch({ max_num_results: Math.round(Number(e.target.value)) || buildDefaults().max_num_results }),
              slotProps: { htmlInput: { min: 3, max: 50, step: 1 } }
            }
          ) }) })
        ] }),
        /* @__PURE__ */ jsx49(
          OpenAiJsonModal,
          {
            open: jsonOpen,
            initial: prettyJson2(toOpenAiJsonPayload(config)),
            readOnly: !canEdit,
            modelOptions,
            onClose: () => setJsonOpen(false),
            onApply: (parsed) => {
              patch(parsed);
              setJsonOpen(false);
            }
          }
        )
      ]
    }
  );
}

// js/app/App.jsx
import { Fragment as Fragment20, jsx as jsx50, jsxs as jsxs43 } from "react/jsx-runtime";
var BRAND_HOME_EVENT = "isa:brand-home";
var DEVFLOW_NAV_ENABLED = false;
var ALL_TOOLS = [
  { id: "log", label: "Logs", icon: "mdi:clipboard-text-clock-outline", cap: "canViewLogs" },
  { id: "prompts", label: "Prompts", icon: "mdi:database-export", cap: "canViewPrompts" },
  { id: "chat", label: "Chat", icon: "mdi:chat-outline", cap: "canViewChat" },
  { id: "todos", label: "DevFlow", icon: "mdi:view-column", cap: null, devflow: true },
  { id: "config", label: "Config", icon: "mdi:cog-outline", cap: "canViewConfig" }
];
var PUBLIC_SCRUM_TOOLS = [
  { id: "todos", label: "DevFlow", icon: "mdi:view-column" }
];
function isPublicScrumBoot(todos) {
  return !!String(todos?.publicSlug ?? "").trim();
}
function App() {
  const { useState: useState36, useEffect: useEffect31 } = getReact();
  const { LoginButton } = UI;
  const boot = bootState;
  const [appBoot, setAppBoot] = useState36(boot);
  const [tool, setTool] = useState36(() => boot.tool || "log");
  const [authOpen, setAuthOpen] = useState36(false);
  const [authTick, setAuthTick] = useState36(0);
  const [homeTick, setHomeTick] = useState36(0);
  const publicScrumView = isPublicScrumBoot(appBoot.todos);
  useEffect31(() => {
    Assets.ensureMarked().catch(() => {
    });
  }, []);
  useEffect31(() => {
    return subscribe(() => {
      const t = getSnapshot().tool || "log";
      setTool(t);
    });
  }, []);
  useEffect31(() => {
    if (tool === "chat" || tool === "log") Assets.ensureChatStagingCss();
    if (tool === "todos" || publicScrumView) Assets.ensureTodosCss();
  }, [tool, publicScrumView]);
  useEffect31(() => {
    if (publicScrumView) {
      document.documentElement.classList.add("paty-public-scrum");
    } else {
      document.documentElement.classList.remove("paty-public-scrum");
    }
    return () => document.documentElement.classList.remove("paty-public-scrum");
  }, [publicScrumView]);
  useEffect31(() => {
    if (publicScrumView && tool !== "todos") {
      setTool("todos");
    }
  }, [publicScrumView, tool]);
  const visibleToolTabs = ALL_TOOLS.filter((t) => {
    if (t.devflow) return DEVFLOW_NAV_ENABLED;
    if (publicScrumView) return false;
    return true;
  });
  useEffect31(() => {
    if (publicScrumView) return;
    if (!DEVFLOW_NAV_ENABLED && tool === "todos") {
      const fallback = visibleToolTabs[0]?.id || "log";
      setTool(fallback);
      mergePartial({ tool: fallback });
    }
  }, [publicScrumView, tool, authTick]);
  useEffect31(() => {
    if (publicScrumView) return;
    if (!visibleToolTabs.length) return;
    const stillVisible = visibleToolTabs.some((t) => t.id === tool);
    if (!stillVisible) {
      const fallback = visibleToolTabs[0].id;
      setTool(fallback);
      mergePartial({ tool: fallback });
    }
  }, [publicScrumView, tool, authTick]);
  useEffect31(() => {
    let alive = true;
    function onAuth() {
      if (!alive) return;
      setAuthTick((n) => n + 1);
      void bootMeCaps();
    }
    window.addEventListener(Session.EVENT, onAuth);
    window.addEventListener("isa-patyia:auth", onAuth);
    window.addEventListener("patyia-apptools:caps-changed", onAuth);
    if (Session.isLoggedIn()) void bootMeCaps();
    return () => {
      alive = false;
      window.removeEventListener(Session.EVENT, onAuth);
      window.removeEventListener("isa-patyia:auth", onAuth);
      window.removeEventListener("patyia-apptools:caps-changed", onAuth);
    };
  }, []);
  useEffect31(() => {
    function onBrandHome() {
      setAppBoot(getSnapshot());
      setTool("log");
      setHomeTick((n) => n + 1);
    }
    window.addEventListener(BRAND_HOME_EVENT, onBrandHome);
    return () => window.removeEventListener(BRAND_HOME_EVENT, onBrandHome);
  }, []);
  function selectTool(id) {
    setTool(id);
    mergePartial({ tool: id });
  }
  const Shell = window.ISAFront?.Layout?.AppShell;
  if (!Shell) throw new Error("AppShell no cargado \u2014 revisar loader.mjs");
  const toolbarTools = publicScrumView ? null : /* @__PURE__ */ jsx50(
    LoginButton,
    {
      loginOpen: authOpen,
      onLoginOpenChange: setAuthOpen,
      onLoggedIn: () => {
        setAuthTick((n) => n + 1);
        window.dispatchEvent(new Event("isa-patyia:auth"));
      }
    }
  );
  return /* @__PURE__ */ jsx50(
    Shell,
    {
      ns: "ISA",
      title: "PatyIA",
      showTarget: false,
      mobileBreakpoint: "xs",
      chromeless: publicScrumView,
      toolbarExtra: toolbarTools,
      navRows: publicScrumView ? [
        { id: "tool", tier: "primary", value: tool, onChange: selectTool, tabs: PUBLIC_SCRUM_TOOLS, tabHref: (id) => hrefFor({ tool: id }) }
      ] : [
        { id: "tool", tier: "primary", value: tool, onChange: selectTool, tabs: visibleToolTabs, tabHref: (id) => hrefFor({ tool: id }) }
      ],
      children: publicScrumView ? /* @__PURE__ */ jsx50(TodosTool, { bootTodos: appBoot.todos || {}, onNeedLogin: () => setAuthOpen(true) }, homeTick) : /* @__PURE__ */ jsxs43(Fragment20, { children: [
        tool === "log" && /* @__PURE__ */ jsx50(LogViewer, { bootLog: appBoot.log || {} }, homeTick),
        tool === "prompts" && /* @__PURE__ */ jsx50(PromptsSqlTool, { bootPrompts: appBoot.prompts || {}, onNeedLogin: () => setAuthOpen(true) }, homeTick),
        tool === "chat" && /* @__PURE__ */ jsx50(ChatTool, { bootChat: getSnapshot().chat || {}, onNeedLogin: () => setAuthOpen(true) }, homeTick),
        tool === "todos" && DEVFLOW_NAV_ENABLED && /* @__PURE__ */ jsx50(TodosTool, { bootTodos: appBoot.todos || {}, onNeedLogin: () => setAuthOpen(true) }, `${homeTick}-${authTick}`),
        tool === "config" && /* @__PURE__ */ jsx50(ConfigTool, { onNeedLogin: () => setAuthOpen(true) }, homeTick)
      ] })
    }
  );
}
function mountApp() {
  const { createRoot } = getReactDOM();
  const rootEl = document.getElementById("root");
  if (!rootEl) throw new Error("No se encontr\xF3 #root");
  createRoot(rootEl).render(getReact().createElement(App));
}
export {
  App,
  mountApp
};
