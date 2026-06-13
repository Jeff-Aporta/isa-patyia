/**
 * Sesión isa-patyia — delega en ISAFront.Session + tokens de servicio por capacidad.
 */
import { Session, Config } from "../core/platform.ts";
import { toastError, toastWarning } from "../ui/notifications.jsx";

const CAP_ENDPOINTS: Record<string, { method: string; path: string }> = {
  "langlab.guardar": { method: "POST", path: "/api/patyia/prompts/upsert-sql" },
  "sql.exec.mssql.paty": { method: "POST", path: "/api/mssql/paty/exec" },
  "sql.exec.mssql.paty.instrucciones": { method: "POST", path: "/api/mssql/paty/exec" },
};

let serviceTokens = new Map<string, { token: string; expMs: number }>();

function clearServiceTokens() {
  serviceTokens = new Map();
}

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
  clearServiceTokens();
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
  const cached = serviceTokens.get(cap);
  if (cached && cached.expMs > Date.now() + 60_000) {
    return { Authorization: `Bearer ${cached.token}` };
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
    throw new Error(sanitizeApiError(data.error ?? data.hint, "Token de servicio no disponible"));
  }
  const token = String(data.token);
  const expMs = data.expiresAt ? new Date(String(data.expiresAt)).getTime() : Date.now() + 3_600_000;
  serviceTokens.set(cap, { token, expMs });
  return { Authorization: `Bearer ${token}` };
}

export async function login(username: string, password: string) {
  clearServiceTokens();
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
  if (err?.code === "FORBIDDEN" || /permiso|denegad|verificaci[oó]n de permisos/i.test(String(err?.message))) {
    toastWarning(humanPermissionError(err, cap));
    return;
  }
  if (/401|sesión|expirad|no autorizado/i.test(String(err?.message))) {
    clearSession();
    toastWarning("Sesión expirada. Vuelve a iniciar sesión.");
    return;
  }
  toastError(sanitizeApiError(err instanceof Error ? err.message : String(err)));
}

function sanitizeApiError(raw: unknown, fallback = "No se pudo completar la operación") {
  const msg = String(raw ?? "").trim();
  if (!msg) return fallback;
  if (/main-orchestrator|workers\.dev|localhost:\d+|878\d|azure|orquestador|gateway|negotiate|accesstoken/i.test(msg)) {
    return fallback;
  }
  if (/^HTTP \d{3}$/.test(msg)) return fallback;
  if (/verificaci[oó]n de permisos fallida|verify-access|servicio de auth no disponible|servicio de autorizaci/i.test(msg)) {
    return fallback;
  }
  return msg.length > 200 ? msg.slice(0, 197) + "…" : msg;
}

/** Mensaje legible para fallos de permiso/capacidad (UI). */
export function humanPermissionError(err: unknown, cap: string) {
  const raw = err instanceof Error ? err.message : String(err ?? "");
  const msg = sanitizeApiError(raw, "");
  if (!msg || /verificaci[oó]n de permisos|verify-access|servicio de auth/i.test(raw)) {
    return blockReason(cap) || "No se pudo verificar el permiso para esta operación";
  }
  if (/permiso|denegad|forbidden|sin permiso/i.test(msg)) {
    return blockReason(cap) || msg;
  }
  return msg || blockReason(cap) || "No se pudo completar la operación";
}
