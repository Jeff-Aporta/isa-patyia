/** Puente al runtime ISAFront (window.ISA). */
import { ensureIssLocalDefault, migrateIssLocalFromGatewayFlag, isLocalMode, isDevHost, getIssTarget, setIssTarget, patyiaIssBase, ORCH_ONLINE, GATEWAY_LS_KEY, PATYIA_ISS_LOCAL, PATYIA_ISS_PROD_URL, PATYIA_ISS_URL } from "./patyia.ts";

const bridge = () => window.ISAFront.createPlatformBridge("ISA");

export const UI = {
  get Icon() { return bridge().UI.Icon; },
  get TargetSwitch() { return bridge().UI.TargetSwitch; },
  get ThemeSwitch() { return bridge().UI.ThemeSwitch; },
  get useRealtimeStatus() { return bridge().UI.useRealtimeStatus; },
  get RealtimeStatusDot() { return bridge().UI.RealtimeStatusDot; },
  get Loading() { return bridge().UI.Loading; },
  get ErrorBox() { return bridge().UI.ErrorBox; },
  get LoginGate() { return bridge().UI.LoginGate; },
  get LoginButton() { return bridge().UI.LoginButton; },
};

export const Session = {
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
  login: (u: string, p: string, opts?: Record<string, unknown>) => bridge().Session.login(u, p, opts),
  logout: () => bridge().Session.logout(),
  refreshProfile: () => bridge().Session.refreshProfile(),
  fetchViewAsCatalog: () => bridge().Session.fetchViewAsCatalog?.(),
  searchSuplantacionUsers: (q: string, limit?: number) => bridge().Session.searchSuplantacionUsers?.(q, limit),
  setViewAs: (u: string) => bridge().Session.setViewAs?.(u),
  clearViewAs: () => bridge().Session.clearViewAs?.(),
  capabilities: () => bridge().Session.capabilities(),
  adminCapabilities: () => bridge().Session.adminCapabilities?.() ?? bridge().Session.capabilities(),
  capabilityCatalog: () => bridge().Session.capabilityCatalog?.() ?? [],
  can: (cap: string) => bridge().Session.can(cap),
  blockReason: (cap: string) => bridge().Session.blockReason(cap),
  get EVENT() { return bridge().Session.EVENT; },
};

export const Toast = {
  show: (opts: { message: string; severity?: string; durationMs?: number }) => bridge().Toast.show(opts),
};

export const Config = {
  base: () => bridge().Config.base(),
  apiUrl: (path: string) => bridge().Config.apiUrl(path),
  isLocal: () => bridge().Config.isLocal(),
  setLocal: (on: boolean) => bridge().Config.setLocal(on),
  get EVENT() { return bridge().Config.EVENT; },
};

function frontShared(): IsaFrontApi {
  const api = window.ISAFront;
  if (!api?.ensureCodeMirrorLoaded) {
    throw new Error("ISAFront lazy-assets no cargado — recargue sin caché (Ctrl+Shift+R).");
  }
  return api;
}

function frontSharedLazy() {
  const api = window.ISAFront;
  return api?.ensureCodeMirrorLoaded ? api : null;
}

/** Carga lazy de scripts/CSS y markdown (front-shared). */
export const Assets = {
  ensureCodeMirrorLoaded: (opts?: { sql?: boolean }) => {
    const api = frontSharedLazy();
    return api ? api.ensureCodeMirrorLoaded!(opts) : Promise.resolve();
  },
  ensureMarked: () => {
    const api = frontSharedLazy();
    return api ? api.ensureMarked!() : Promise.resolve();
  },
  ensureStylesheet: (href: string) => {
    const api = frontSharedLazy();
    return api ? api.ensureLazyStylesheet!(href) : Promise.resolve();
  },
  ensureChatStagingCss: () => {
    const api = frontSharedLazy();
    if (!api) return;
    const prefix = typeof window !== "undefined" && (window as Window & { __ISA_DIST__?: boolean }).__ISA_DIST__ ? "_dist/" : "";
    api.ensureLazyStylesheet!(`${prefix}css/chat-staging.css`).catch((err) => {
      console.warn("chat-staging.css:", err);
    });
  },
  ensureTodosCss: () => {
    const api = frontSharedLazy();
    if (!api) return;
    const prefix = typeof window !== "undefined" && (window as Window & { __ISA_DIST__?: boolean }).__ISA_DIST__ ? "_dist/" : "";
    api.ensureLazyStylesheet!(`${prefix}css/todos-staging.css`).catch((err) => {
      console.warn("todos-staging.css:", err);
    });
  },
};

export function mdToHtml(src: string): string {
  const api = frontSharedLazy();
  if (api?.mdToHtml) return api.mdToHtml(src);
  return String(src ?? "");
}

/** Estimación de tokens de prompt (ISAFront o fallback chars/4). */
export const Tokens = {
  estimatePrompt: (text: unknown): number => {
    const fn = window.ISAFront?.estimatePromptTokens;
    if (typeof fn === "function") return fn(text);
    const s = String(text ?? "");
    return s.trim() ? Math.ceil(s.length / 4) : 0;
  },
};

/** Puente al stack React/MUI (front-shared). */
export const getReact = () => window.ISAFront.getReact();
export const getReactDOM = () => window.ISAFront.getReactDOM();
export const getMaterialUI = (): MaterialUIApi => window.ISAFront.getMaterialUI();

/** Layout panel izquierdo redimensionable + contenido (ISAFront.Layout.IsaSplitView). */
export function getIsaSplitView() {
  const C = window.ISAFront?.Layout?.IsaSplitView;
  if (!C) {
    throw new Error("IsaSplitView no cargado — recargue sin caché (Ctrl+Shift+R).");
  }
  return C;
}

/** Kit neon-glass — GlassCard, GlassSection, tokens (ISAFront.Glass). */
export function getGlass() {
  const g = window.ISAFront?.Glass;
  if (!g?.GlassCard) {
    throw new Error("ISAFront.Glass no cargado — recargue sin caché (Ctrl+Shift+R).");
  }
  return g;
}

function lightboxApi() {
  const api = window.ISAComponents?.LightboxZoom;
  if (!api?.LightboxZoomDialog) {
    throw new Error("ISAComponents.LightboxZoom no cargado — recargue sin caché (Ctrl+Shift+R).");
  }
  return api;
}

/** Visor lightbox-zoom (@isa-components/lightbox). */
export const LightboxZoom = {
  get LightboxZoomDialog() { return lightboxApi().LightboxZoomDialog; },
  get LightboxZoomImage() { return lightboxApi().LightboxZoomImage; },
  get useLightboxZoom() { return lightboxApi().useLightboxZoom; },
  get ZOOM_MIN() { return lightboxApi().ZOOM_MIN; },
  get ZOOM_MAX() { return lightboxApi().ZOOM_MAX; },
  get PAN_STEP() { return lightboxApi().PAN_STEP; },
};

/** Alias legacy (migración desde ISAFront.Lightbox). */
export const Lightbox = {
  get ImageLightboxDialog() { return lightboxApi().LightboxZoomDialog; },
  get LightboxImage() { return lightboxApi().LightboxZoomImage; },
  get useImageLightboxZoom() { return lightboxApi().useLightboxZoom; },
};

/** Puente a ISAFront.CodeMirrorPanel (front-shared). */
export function CodeMirrorPanel(props: Record<string, unknown>) {
  const Panel = window.ISAFront?.CodeMirrorPanel;
  if (!Panel) throw new Error("CodeMirrorPanel no cargado — recargue sin caché (Ctrl+Shift+R).");
  return Panel(props);
}

/** Puente isa-patyia → ISAFront.Feedback (toasts y confirm). */
const fb = () => globalThis.ISAFront?.Feedback;

export function toastError(text: string, timeout?: number) { fb()?.toast?.error?.(text, timeout); }
export function toastSuccess(text: string, timeout?: number) { fb()?.toast?.success?.(text, timeout); }
export function toastInfo(text: string, timeout?: number) { fb()?.toast?.info?.(text, timeout); }
export function toastWarning(text: string, timeout?: number) { fb()?.toast?.warning?.(text, timeout); }
export function requestConfirm(opts: Record<string, unknown>) { return fb()?.confirm?.(opts) ?? Promise.resolve(false); }

function patchIsaPatyiaAuthEvents(): void {
  const Session = window.ISA?.Session;
  if (!Session?.login || !Session?.logout) return;
  const origLogin = Session.login.bind(Session);
  const origLogout = Session.logout.bind(Session);
  const wrapLogin = async (u: string, p: string, opts?: Record<string, unknown>) => {
    const session = await origLogin(u, p, opts);
    window.dispatchEvent(new Event("isa-patyia:auth"));
    return session;
  };
  Session.login = wrapLogin;
  if (window.ISA?.Auth?.login) window.ISA.Auth.login = wrapLogin;
  Session.logout = () => {
    origLogout();
    window.dispatchEvent(new Event("isa-patyia:auth"));
  };
}

/** Patches post-registro: mantiene `Config.base/apiUrl/isLocal/setLocal` reflejando el target 3-way.
 *  Antes bloqueaba el switch; ahora respeta `getIssTarget()` y dispara el evento correcto. */
function patchIssOnlyLocalConfig(): void {
  ensureIssLocalDefault();
  migrateIssLocalFromGatewayFlag();
  try { localStorage.setItem(GATEWAY_LS_KEY, "0"); } catch { /* auth/orquestador siempre prod */ }
  const cfg = window.ISA?.Config;
  if (!cfg) return;
  const online = String(cfg.ONLINE || ORCH_ONLINE).replace(/\/$/, "");
  const recompute = () => {
    const t = getIssTarget();
    cfg.isLocal = () => t === "local";
    cfg.setLocal = (on: boolean) => { setIssTarget(on ? "local" : (isDevHost() ? "local" : "staging")); return true; };
    const base = t === "local" ? PATYIA_ISS_LOCAL.replace(/\/$/, "") : t === "production" ? PATYIA_ISS_PROD_URL.replace(/\/$/, "") : PATYIA_ISS_URL.replace(/\/$/, "");
    cfg.base = () => base;
    cfg.apiUrl = (path: string) => base + (path.charAt(0) === "/" ? path : `/${path}`);
    cfg.label = () => t === "local" ? "Local" : t === "production" ? "Producción" : "Staging";
    cfg.connectionHint = () => "";
  };
  recompute();
  cfg.EVENT = "patyia-apptools:iss-target-changed";
  try { window.addEventListener("patyia-apptools:iss-target-changed", recompute); } catch { /* ignore */ }
}

/** Reemplaza el `TargetSwitch*` global con uno 3-way / 2-way según host. */
function patchIsaPatyiaTargetSwitchReadOnly(): void {
  const bag = window.ISA;
  if (!bag?.UI) return;
  // Lazy: el componente se importa de forma dinámica para evitar dependencia circular con App.jsx.
  import("../components/IssTargetSwitch.jsx").then((mod) => {
    if (mod?.IssTargetChip) bag.UI.TargetSwitch = mod.IssTargetChip;
    // IssTargetMenuWithAdmin incluye el botón "Copiar sys_values a producción" (admin patyia + staging).
    if (mod?.IssTargetMenuWithAdmin) bag.UI.TargetSwitchMenu = mod.IssTargetMenuWithAdmin;
    else if (mod?.IssTargetMenu) bag.UI.TargetSwitchMenu = mod.IssTargetMenu;
  }).catch((e) => console.warn("IssTargetSwitch load:", e));
  // ViewAsRoleMenu lo registra App.jsx (mismo bundle que sessionApi/bootMeCaps).
}

function patyiaIssBaseForLogin(): string {
  return patyiaIssBase();
}

/** MUI medium = 56px de alto. Forzar size=small en el Theme de AppShell.
 *  Light: sin glow neón en containedPrimary (se ve mal sobre fondos claros). */
function patchCompactFormThemeDefaults(): void {
  const Theme = window.ISA?.Theme;
  const MUI = window.MaterialUI;
  if (!Theme?.useThemeMode || !MUI?.createTheme) return;

  const lightContained = {
    boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
    "&:hover": { boxShadow: "0 2px 6px rgba(15,23,42,0.12)" },
  };
  const darkContained = {
    boxShadow: "0 0 20px rgba(30,144,255,0.35)",
    "&:hover": { boxShadow: "0 0 28px rgba(30,144,255,0.55)" },
  };
  const buttonPatch = (mode: string) => ({
    MuiButton: {
      styleOverrides: {
        containedPrimary: mode === "light" ? lightContained : darkContained,
      },
    },
  });
  const formDefaults = {
    MuiTextField: { defaultProps: { size: "small", margin: "dense" } },
    MuiFormControl: { defaultProps: { size: "small", margin: "dense" } },
    MuiAutocomplete: { defaultProps: { size: "small" } },
    MuiSelect: { defaultProps: { size: "small" } },
    MuiInputBase: { defaultProps: { size: "small" } },
  };

  const orig = Theme.useThemeMode.bind(Theme);
  Theme.useThemeMode = () => {
    const tm = orig();
    const mode = String(tm?.mode ?? tm?.theme?.palette?.mode ?? "dark");
    const theme = MUI.createTheme(tm.theme, {
      components: { ...formDefaults, ...buttonPatch(mode) },
    });
    return { ...tm, theme };
  };
  if (typeof Theme.makeTheme === "function") {
    const origMake = Theme.makeTheme.bind(Theme);
    Theme.makeTheme = (mode: string) =>
      MUI.createTheme(origMake(mode), {
        components: { ...formDefaults, ...buttonPatch(mode) },
      });
  }
}

/** Registra ISA PatyIA en ISAFront — invocado desde isa-setup.ts al arranque. */
export function bootstrapIsaPatyia(): void {
  ensureIssLocalDefault();
  window.ISAFront.registerApp({
    ns: "ISA",
    app: "isa-patyia",
    theme: true,
    widgets: { targetStyle: "chip", targetReadOnlyLocal: false },
    session: true,
    auth: false,
    toast: true,
    loginButton: {
      showTarget: false,
      runUnitTestUrl: () => `${patyiaIssBaseForLogin()}/api/run-unit-test`,
      getAuthHeaders: () => {
        const tok = window.ISA?.Session?.current?.()?.token;
        return tok ? window.ISA!.Session.authHeader() : {};
      },
      unitTestTitle: "Test unitario — ISS-AyudasCPIA",
    },
  });

  patchIssOnlyLocalConfig();
  patchIsaPatyiaTargetSwitchReadOnly();
  patchIsaPatyiaAuthEvents();
  patchCompactFormThemeDefaults();

  if (window.ISAFront?.registerCodeMirror && window.React && window.MaterialUI) {
    window.ISAFront.registerCodeMirror(window.React, window.MaterialUI);
  }

  if (!window.ISA?.Session) {
    throw new Error("No se pudo iniciar la aplicación. Recargue sin caché (Ctrl+Shift+R).");
  }
}
