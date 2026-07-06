// js/core/patyia.ts
window.ISAFront.migrateLegacyGatewayKeys?.({ "jeff:gateway-local": "", "patyia-apptools:gateway-local": "", "patyia-apptools:lab-local": "" });
var ORCH_ONLINE = "https://main-orchestrator.jeffaporta.workers.dev";
var PATYIA_ISS_LOCAL = "http://127.0.0.1:8802";
var PATYIA_BRIDGE_LOCAL = `${PATYIA_ISS_LOCAL}/api`;
var PATYIA_ISS_LOCAL_LS_KEY = "patyia-apptools:iss-local";
var GATEWAY_LS_KEY = "jeff:gateway-local";
function isLocalMode() {
  try {
    return localStorage.getItem(PATYIA_ISS_LOCAL_LS_KEY) === "1";
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
function setLocalMode(on) {
  const next = on ? "1" : "0";
  let prev = "";
  try {
    prev = localStorage.getItem(PATYIA_ISS_LOCAL_LS_KEY) ?? "";
  } catch {
  }
  if (prev === next) return on;
  try {
    localStorage.setItem(PATYIA_ISS_LOCAL_LS_KEY, next);
  } catch {
  }
  window.location.reload();
  return on;
}
function migrateIssLocalFromGatewayFlag() {
  try {
    if (localStorage.getItem(GATEWAY_LS_KEY) === "1") {
      if (localStorage.getItem(PATYIA_ISS_LOCAL_LS_KEY) == null) {
        localStorage.setItem(PATYIA_ISS_LOCAL_LS_KEY, "1");
      }
      localStorage.setItem(GATEWAY_LS_KEY, "0");
    }
  } catch {
  }
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
var Toast = {
  show: (opts) => bridge().Toast.show(opts)
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
var LightboxZoom = {
  get LightboxZoomDialog() {
    return lightboxApi().LightboxZoomDialog;
  },
  get LightboxZoomImage() {
    return lightboxApi().LightboxZoomImage;
  },
  get useLightboxZoom() {
    return lightboxApi().useLightboxZoom;
  },
  get ZOOM_MIN() {
    return lightboxApi().ZOOM_MIN;
  },
  get ZOOM_MAX() {
    return lightboxApi().ZOOM_MAX;
  },
  get PAN_STEP() {
    return lightboxApi().PAN_STEP;
  }
};
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
function patchIsaPatyiaAuthEvents() {
  const Session2 = window.ISA?.Session;
  if (!Session2?.login || !Session2?.logout) return;
  const origLogin = Session2.login.bind(Session2);
  const origLogout = Session2.logout.bind(Session2);
  const wrapLogin = async (u, p, opts) => {
    const session = await origLogin(u, p, opts);
    window.dispatchEvent(new Event("isa-patyia:auth"));
    return session;
  };
  Session2.login = wrapLogin;
  if (window.ISA?.Auth?.login) window.ISA.Auth.login = wrapLogin;
  Session2.logout = () => {
    origLogout();
    window.dispatchEvent(new Event("isa-patyia:auth"));
  };
}
function patchIssOnlyLocalConfig() {
  ensureIssLocalDefault();
  migrateIssLocalFromGatewayFlag();
  try {
    localStorage.setItem(GATEWAY_LS_KEY, "0");
  } catch {
  }
  const cfg = window.ISA?.Config;
  if (!cfg) return;
  const online = String(cfg.ONLINE || ORCH_ONLINE).replace(/\/$/, "");
  cfg.isLocal = isLocalMode;
  cfg.setLocal = (on) => {
    setLocalMode(on);
  };
  cfg.base = () => online;
  cfg.apiUrl = (path) => online + (path.charAt(0) === "/" ? path : `/${path}`);
  cfg.connectionHint = () => "";
  cfg.label = () => isLocalMode() ? "Local" : "Producci\xF3n";
  cfg.EVENT = "patyia-apptools:lab-target";
}
function patyiaBridgeBaseForLogin() {
  const base = isLocalMode() ? PATYIA_ISS_LOCAL : "https://ayudascp-ia-staging.azurewebsites.net";
  return base.replace(/\/$/, "");
}
function bootstrapIsaPatyia() {
  ensureIssLocalDefault();
  window.ISAFront.registerApp({
    ns: "ISA",
    app: "isa-patyia",
    theme: true,
    widgets: { targetStyle: "chip" },
    session: true,
    auth: false,
    toast: true,
    loginButton: {
      runUnitTestUrl: () => `${patyiaBridgeBaseForLogin()}/api/run-unit-test`,
      getAuthHeaders: () => {
        const tok = window.ISA?.Session?.current?.()?.token;
        return tok ? window.ISA.Session.authHeader() : {};
      },
      unitTestTitle: "Test unitario \u2014 ISS-AyudasCPIA"
    }
  });
  patchIssOnlyLocalConfig();
  patchIsaPatyiaAuthEvents();
  if (window.ISAFront?.registerCodeMirror && window.React && window.MaterialUI) {
    window.ISAFront.registerCodeMirror(window.React, window.MaterialUI);
  }
  if (!window.ISA?.Session) {
    throw new Error("No se pudo iniciar la aplicaci\xF3n. Recargue sin cach\xE9 (Ctrl+Shift+R).");
  }
}
export {
  Assets,
  CodeMirrorPanel,
  Config,
  Lightbox,
  LightboxZoom,
  Session,
  Toast,
  Tokens,
  UI,
  bootstrapIsaPatyia,
  getGlass,
  getIsaSplitView,
  getMaterialUI,
  getReact,
  getReactDOM,
  mdToHtml,
  requestConfirm,
  toastError,
  toastInfo,
  toastSuccess,
  toastWarning
};
