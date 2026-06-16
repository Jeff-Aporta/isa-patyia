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
  authHeader: () => bridge().Session.authHeader(),
  appHeader: () => bridge().Session.appHeader(),
  appId: () => bridge().Session.appId(),
  login: (u: string, p: string) => bridge().Session.login(u, p),
  logout: () => bridge().Session.logout(),
  refreshProfile: () => bridge().Session.refreshProfile(),
  capabilities: () => bridge().Session.capabilities(),
  capabilityCatalog: () => bridge().Session.capabilityCatalog(),
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
