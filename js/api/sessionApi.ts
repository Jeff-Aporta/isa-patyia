/** CAP isa-patyia — tokens de servicio vía ISAFront.createServiceSession. */
import { Session, Config } from "../core/platform.ts";
import { toastError, toastWarning } from "../ui/notifications.jsx";

/** Capacidad canónica para guardar instrucciones en Paty (MSSQL publish). */
export const INSTRUCCIONES_WRITE_CAP = "patyia.instrucciones.publish";

/** Overrides por app; el catálogo de system-login completa el resto. */
const CAP_ENDPOINTS: Record<string, { method: string; path: string }> = {
  [INSTRUCCIONES_WRITE_CAP]: { method: "POST", path: "/api/patyia/instrucciones/publish" },
};

function notifyAuth() {
  window.dispatchEvent(new Event(Session.EVENT));
  window.dispatchEvent(new Event("patyia-apptools:auth"));
  window.dispatchEvent(new Event("isa-patyia:auth"));
}

const svc = window.ISAFront.createServiceSession({ Session, Config, capEndpoints: CAP_ENDPOINTS, notifyAuth });

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

export const serviceAuthHeaders = svc.serviceAuthHeaders;
export const resolveCapEndpoint = svc.resolveCapEndpoint;
export const clearSession = svc.clearSession;
export const login = svc.login;
export const logout = clearSession;

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
  serviceAuthHeaders,
  clearSession,
};
