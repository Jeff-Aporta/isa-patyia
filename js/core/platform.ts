/** Puente al runtime ISAFront (window.ISA). */
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
  authHeader: () => bridge().Session.authHeader(),
  appHeader: () => bridge().Session.appHeader(),
  appId: () => bridge().Session.appId(),
  login: (u: string, p: string) => bridge().Session.login(u, p),
  logout: () => bridge().Session.logout(),
  refreshProfile: () => bridge().Session.refreshProfile(),
  fetchViewAsCatalog: () => bridge().Session.fetchViewAsCatalog?.(),
  searchSuplantacionUsers: (q: string, limit?: number) =>
    bridge().Session.searchSuplantacionUsers?.(q, limit),
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
export function requestConfirm(opts: Record<string, unknown>) {
  return fb()?.confirm?.(opts) ?? Promise.resolve(false);
}

/** Registra ISA PatyIA en ISAFront — invocado desde isa-setup.ts al arranque. */
export function bootstrapIsaPatyia(): void {
  window.ISAFront.registerApp({
    ns: "ISA", app: "isa-patyia", theme: true, widgets: { targetStyle: "chip" },
    session: true, auth: false, realtime: { enabled: () => false, autoStart: false }, toast: true,
  });

  if (window.ISAFront?.registerCodeMirror && window.React && window.MaterialUI) {
    window.ISAFront.registerCodeMirror(window.React, window.MaterialUI);
  }

  if (!window.ISA?.Session) {
    throw new Error("No se pudo iniciar la aplicación. Recargue sin caché (Ctrl+Shift+R).");
  }
}
