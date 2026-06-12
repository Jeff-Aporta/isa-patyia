/** Puente al runtime ISAFront (window.ISA). */
function isa() {
  const bag = window.ISA;
  if (!bag?.UI) throw new Error("ISA no registrado — ejecutar isa-setup.ts antes que platform");
  return bag;
}

export const UI = {
  get Icon() { return isa().UI.Icon; },
  get TargetSwitch() { return isa().UI.TargetSwitch; },
  get ThemeSwitch() { return isa().UI.ThemeSwitch; },
  get Loading() { return isa().UI.Loading; },
  get ErrorBox() { return isa().UI.ErrorBox; },
  get LoginGate() { return isa().UI.LoginGate; },
};

export const Session = {
  current: () => isa().Session.current(),
  isLoggedIn: () => isa().Session.isLoggedIn(),
  username: () => isa().Session.username(),
  authHeader: () => isa().Session.authHeader(),
  appHeader: () => isa().Session.appHeader(),
  appId: () => isa().Session.appId(),
  login: (u: string, p: string) => isa().Session.login(u, p),
  logout: () => isa().Session.logout(),
  refreshProfile: () => isa().Session.refreshProfile(),
  capabilities: () => isa().Session.capabilities(),
  can: (cap: string) => isa().Session.can(cap),
  blockReason: (cap: string) => isa().Session.blockReason(cap),
  get EVENT() { return isa().Session.EVENT; },
};

export const Toast = {
  show: (opts: { message: string; severity?: string; durationMs?: number }) => isa().Toast?.show?.(opts),
};

export const Config = {
  base: () => isa().Config.base(),
  apiUrl: (path: string) => isa().Config.apiUrl(path),
  isLocal: () => isa().Config.isLocal(),
  setLocal: (on: boolean) => isa().Config.setLocal(on),
  get EVENT() { return isa().Config.EVENT; },
};
