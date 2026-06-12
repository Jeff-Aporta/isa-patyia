/**
 * Sesión isa-patyia — delega en ISAFront.Session + tokens de servicio por capacidad.
 */
import { Session, Config } from "../core/platform.ts";
import { toastError, toastWarning } from "../ui/notifications.jsx";

const CAP_ENDPOINTS: Record<string, { method: string; path: string }> = {
  "langlab.guardar": { method: "POST", path: "/api/patyia/prompts/upsert-sql" },
  "sql.exec.mssql.paty": { method: "POST", path: "/api/mssql/paty/exec" },
  "sql.exec.mssql.paty.instrucciones": { method: "POST", path: "/api/mssql/paty/exec" },
  signalr: { method: "POST", path: "/api/signalr/negotiate" },
};

let serviceToken: string | null = null;
let serviceExpMs = 0;

function notifyAuth() {
  window.dispatchEvent(new Event(Session.EVENT));
  window.dispatchEvent(new Event("patyia-apptools:auth"));
  window.dispatchEvent(new Event("isa-patyia:auth"));
}

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

export function clearSession() {
  serviceToken = null;
  serviceExpMs = 0;
  Session.logout();
  notifyAuth();
}

export function can(cap: string) {
  return Session.can(cap);
}

export function mssqlExecCap() {
  if (can("sql.exec.mssql.paty")) return "sql.exec.mssql.paty";
  if (can("sql.exec.mssql.paty.instrucciones")) return "sql.exec.mssql.paty.instrucciones";
  return null;
}

export function blockReason(cap: string) {
  return Session.blockReason(cap);
}

export async function serviceAuthHeaders(cap: string) {
  const ep = CAP_ENDPOINTS[cap];
  if (!ep) throw new Error(`Capacidad desconocida: ${cap}`);
  if (serviceToken && serviceExpMs > Date.now() + 60_000) {
    return { Authorization: `Bearer ${serviceToken}` };
  }
  const res = await fetch(Config.apiUrl("/api/auth/service-token"), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...Session.authHeader(), ...Session.appHeader() },
    body: JSON.stringify({ method: ep.method, path: ep.path }),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 403) {
    const err = new Error(String(data.error ?? "Permiso denegado")) as Error & { code?: string };
    err.code = "FORBIDDEN";
    throw err;
  }
  if (!res.ok || !data.token) {
    throw new Error(String(data.error ?? data.hint ?? res.statusText ?? "Token de servicio no disponible"));
  }
  serviceToken = String(data.token);
  serviceExpMs = data.expiresAt ? new Date(String(data.expiresAt)).getTime() : Date.now() + 3_600_000;
  return { Authorization: `Bearer ${serviceToken}` };
}

export async function login(username: string, password: string) {
  serviceToken = null;
  serviceExpMs = 0;
  const session = await Session.login(username, password);
  notifyAuth();
  return getSession() || session;
}

export function logout() {
  clearSession();
}

export function isLoggedIn() {
  return Session.isLoggedIn();
}

export function handleApiError(err: Error & { code?: string }, cap: string) {
  if (err?.code === "FORBIDDEN" || /permiso|denegad/i.test(String(err?.message))) {
    toastWarning(blockReason(cap) || String(err.message));
    return;
  }
  if (/401|sesión|expirad|no autorizado/i.test(String(err?.message))) {
    clearSession();
    toastWarning("Sesión expirada. Vuelve a iniciar sesión.");
    return;
  }
  toastError(err instanceof Error ? err.message : String(err));
}
