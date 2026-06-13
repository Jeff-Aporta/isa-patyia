/** CAP isa-patyia — delega tokens de servicio en ISAFront.createServiceSession. */
import { Session, Config } from "../core/platform.ts";
import { toastError, toastWarning } from "../ui/notifications.jsx";

const CAP_ENDPOINTS: Record<string, { method: string; path: string }> = {
  "langlab.guardar": { method: "POST", path: "/api/patyia/prompts/upsert-sql" },
  "sql.exec.mssql.paty": { method: "POST", path: "/api/mssql/paty/exec" },
  "sql.exec.mssql.paty.instrucciones": { method: "POST", path: "/api/mssql/paty/exec" },
  signalr: { method: "POST", path: "/api/signalr/negotiate" },
};

function notifyAuth() {
  window.dispatchEvent(new Event(Session.EVENT));
  window.dispatchEvent(new Event("patyia-apptools:auth"));
  window.dispatchEvent(new Event("isa-patyia:auth"));
}

const svc = window.ISAFront.createServiceSession({
  Session,
  Config,
  capEndpoints: CAP_ENDPOINTS,
  notifyAuth,
});

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

export const isLoggedIn = () => Session.isLoggedIn();
export const can = (cap: string) => Session.can(cap);
export const blockReason = (cap: string) => Session.blockReason(cap);

export function mssqlExecCap() {
  if (can("sql.exec.mssql.paty")) return "sql.exec.mssql.paty";
  if (can("sql.exec.mssql.paty.instrucciones")) return "sql.exec.mssql.paty.instrucciones";
  return null;
}

export const serviceAuthHeaders = svc.serviceAuthHeaders;
export const clearSession = svc.clearSession;
export const login = svc.login;
export const logout = clearSession;

export function humanPermissionError(err: unknown, cap: string) {
  return window.ISAFront.humanPermissionError(err, cap, blockReason);
}

export function handleApiError(err: Error & { code?: string }, cap: string) {
  window.ISAFront.handleApiError(err, cap, { blockReason, clearSession, toastWarning, toastError });
}

export const AppSession = {
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

(window.ISA = window.ISA || ({} as IsaNs)).AppSession = AppSession;
