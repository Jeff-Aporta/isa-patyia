/** CAP isa-patyia — tokens de servicio vía ISAFront.createServiceSession. */
import { Session, Config } from "../core/platform.ts";
import { toastError, toastWarning } from "../ui/notifications.jsx";

const CAP_ENDPOINTS = { "patyia.instrucciones.publish": { method: "POST", path: "/api/patyia/instrucciones/publish" } };

function notifyAuth() {
  window.dispatchEvent(new Event(Session.EVENT));
  window.dispatchEvent(new Event("patyia-apptools:auth"));
  window.dispatchEvent(new Event("isa-patyia:auth"));
}

const svc = window.ISAFront.createServiceSession({ Session, Config, capEndpoints: CAP_ENDPOINTS, notifyAuth });

export const isLoggedIn = () => Session.isLoggedIn();
export const can = (cap: string) => Session.can(cap);
export const blockReason = (cap: string) => Session.blockReason(cap);

export function instruccionesPublishCap(): string | null {
  if (can("patyia.instrucciones.publish")) return "patyia.instrucciones.publish";
  if (can("langlab.guardar")) return "langlab.guardar";
  return null;
}

export function patyChatInteractCap(): string | null {
  return can("patyia.chat.interact") ? "patyia.chat.interact" : null;
}

export function patyChatAuditCap(): string | null {
  return can("patyia.chat.audit") ? "patyia.chat.audit" : null;
}

export const serviceAuthHeaders = svc.serviceAuthHeaders;
export const clearSession = svc.clearSession;
export const login = svc.login;
export const logout = clearSession;

export function getSession() {
  const s = Session.current();
  if (!s) return null;
  return { username: s.username, role: s.role, expiresAt: s.expiresAt, sessionToken: s.token, app: Session.appId(), capabilities: Session.capabilities() };
}

export function humanPermissionError(err: unknown, cap: string) {
  return window.ISAFront.humanPermissionError(err, cap, blockReason);
}

export function handleApiError(err: Error & { code?: string }, cap: string) {
  window.ISAFront.handleApiError(err, cap, { blockReason, clearSession, toastWarning, toastError });
}

(window.ISA = window.ISA || ({} as IsaNs)).AppSession = {
  current: () => Session.current(), isLoggedIn, username: () => Session.username(),
  capabilities: () => Session.capabilities(), can, blockReason, login, logout,
  refreshProfile: () => Session.refreshProfile(), serviceAuthHeaders, clearSession,
};
