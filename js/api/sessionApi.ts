/** Sesión ISA PatyIA — permisos vía system-login (token `app`). */
import { Session } from "../core/platform.ts";
import { toastError, toastWarning } from "../ui/notifications.jsx";

/** Capacidad canónica para guardar instrucciones en Paty (MSSQL publish). */
export const INSTRUCCIONES_WRITE_CAP = "patyia.instrucciones.publish";

function notifyAuth() {
  window.dispatchEvent(new Event(Session.EVENT));
  window.dispatchEvent(new Event("patyia-apptools:auth"));
  window.dispatchEvent(new Event("isa-patyia:auth"));
}

export const isLoggedIn = () => Session.isLoggedIn();
export const can = (cap: string) => Session.can(cap);
export const blockReason = (cap: string) => Session.blockReason(cap);

export function canEditInstrucciones(): boolean {
  return can(INSTRUCCIONES_WRITE_CAP);
}

export function instruccionesPublishCap(): string | null {
  return canEditInstrucciones() ? INSTRUCCIONES_WRITE_CAP : null;
}

export function patyChatInteractCap(): string | null {
  return can("patyia.chat.interact") ? "patyia.chat.interact" : null;
}

export function patyChatAuditCap(): string | null {
  return can("patyia.chat.audit") ? "patyia.chat.audit" : null;
}

export async function login(user: string, pass: string) {
  const session = await Session.login(user, pass);
  notifyAuth();
  return session;
}

export function logout() {
  Session.logout();
  notifyAuth();
}

export const clearSession = logout;

export function getSession() {
  const s = Session.current();
  if (!s) return null;
  return {
    username: s.username,
    role: s.role,
    expiresAt: s.expiresAt,
    sessionToken: s.token,
    app: Session.appId(),
    capabilities: Session.capabilities(),
  };
}

export function humanPermissionError(err: unknown, cap: string) {
  return window.ISAFront.humanPermissionError(err, cap, blockReason);
}

export function handleApiError(err: Error & { code?: string }, cap: string) {
  window.ISAFront.handleApiError(err, cap, { blockReason, clearSession, toastWarning, toastError });
}

(window.ISA = window.ISA || ({} as IsaNs)).AppSession = {
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
};
