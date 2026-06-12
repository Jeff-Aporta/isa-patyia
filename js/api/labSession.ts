/**
 * Sesión lab por usuario + rol (BD_LANGLAB). Sin JWT en la UI.
 * Mutaciones usan token técnico INTEGRACIONES vía POST /auth/service-token.
 */
import { getApiBase, getLabBase } from "../core/config.ts";
import { wrapPassword } from "../core/caesar.ts";
import { toastError, toastWarning } from "../ui/notifications.jsx";

try {
  localStorage.removeItem("patyia-apptools:lab-jwt");
  localStorage.removeItem("patyia-apptools:lab-jwt-exp");
} catch (_) { /* migración desde JWT en localStorage */ }

const APP_ID = "isa-patyia";
const SS_KEY = "patyia-apptools:lab-session";

/** Capacidades por rol (espejo de lab-permissions.json). */
export const ROLE_CAPS = {
  admin: ["guardar_langlab", "ejecutar_mssql", "signalr"],
  instrucciones_editor: ["guardar_langlab"],
};

/** Excepciones por usuario (espejo de lab-permissions.json → user_exceptions). */
export const USER_CAPS = {
  VRESTREPO: ["guardar_langlab"],
};

export const CAP_LABELS = {
  guardar_langlab: "guardar instrucciones en langlab",
  ejecutar_mssql: "ejecutar SQL en PatyIA staging",
  ejecutar_mssql_instrucciones: "actualizar INSTRUCCION en PatyIA staging",
  signalr: "conectar SignalR",
};

const CAP_ENDPOINTS = {
  guardar_langlab: { method: "POST", path: "/patyia/prompts/upsert-sql" },
  ejecutar_mssql: { method: "POST", path: "/mssql/paty/exec" },
  ejecutar_mssql_instrucciones: { method: "POST", path: "/mssql/paty/exec" },
  signalr: { method: "POST", path: "/signalr/negotiate" },
};

let serviceToken: string | null = null;
let serviceExpMs = 0;

function readSession() {
  try {
    const raw = sessionStorage.getItem(SS_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s?.username || !s?.sessionToken) return null;
    if (s.app && s.app !== APP_ID) return null;
    if (s.expiresAt && Date.now() >= new Date(s.expiresAt).getTime()) return null;
    return s;
  } catch (_) {
    return null;
  }
}

function writeSession(s: Record<string, unknown>) {
  try {
    sessionStorage.setItem(SS_KEY, JSON.stringify(s));
  } catch (_) { /* ignore */ }
  window.dispatchEvent(new Event("patyia-apptools:auth"));
}

export function clearSession() {
  try {
    sessionStorage.removeItem(SS_KEY);
  } catch (_) { /* ignore */ }
  serviceToken = null;
  serviceExpMs = 0;
  window.dispatchEvent(new Event("patyia-apptools:auth"));
}

function capsForRole(role: string) {
  return ROLE_CAPS[String(role || "").trim() as keyof typeof ROLE_CAPS] || [];
}

function capsForUser(username: string) {
  return USER_CAPS[String(username || "").trim().toUpperCase() as keyof typeof USER_CAPS] || [];
}

export function can(cap: string) {
  const s = readSession();
  if (!s) return false;
  if (capsForRole(s.role).includes(cap)) return true;
  return capsForUser(s.username).includes(cap);
}

export function mssqlExecCap() {
  if (can("ejecutar_mssql")) return "ejecutar_mssql";
  if (can("ejecutar_mssql_instrucciones")) return "ejecutar_mssql_instrucciones";
  return null;
}

export function blockReason(cap: string) {
  const label = CAP_LABELS[cap as keyof typeof CAP_LABELS] || cap;
  const s = readSession();
  if (!s) return `Inicia sesión para ${label}`;
  if (!can(cap)) {
    return `Sin permiso para ${label}${s.role ? ` (rol: ${s.role})` : ""}`;
  }
  return "";
}

function sessionHeaders() {
  const s = readSession();
  if (!s?.sessionToken) return {};
  return { Authorization: `Bearer ${s.sessionToken}`, "X-App-Id": APP_ID };
}

function apiUrl(path: string) {
  const base = (getApiBase?.() || getLabBase()).replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}/api${p}`;
}

async function fetchServiceToken(cap: string) {
  const ep = CAP_ENDPOINTS[cap as keyof typeof CAP_ENDPOINTS];
  if (!ep) throw new Error(`Capacidad desconocida: ${cap}`);
  if (serviceToken && serviceExpMs > Date.now() + 60_000) {
    return serviceToken;
  }
  const res = await fetch(apiUrl("/auth/service-token"), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...sessionHeaders() },
    body: JSON.stringify({ method: ep.method, path: ep.path }),
  });
  const text = await res.text();
  let data: Record<string, unknown> = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (_) {
    throw new Error(text || res.statusText);
  }
  if (res.status === 403) {
    const err = new Error(String(data.error ?? "Permiso denegado")) as Error & { code?: string; detail?: unknown };
    err.code = "FORBIDDEN";
    err.detail = data;
    throw err;
  }
  if (res.status === 404) {
    throw new Error(
      "El servidor no expone guardado (orquestador + system-login o lab-langgraph desplegado).",
    );
  }
  if (!res.ok || !data.token) {
    throw new Error(String(data.error ?? data.hint ?? res.statusText ?? "Token de servicio no disponible"));
  }
  serviceToken = String(data.token);
  serviceExpMs = data.expiresAt ? new Date(String(data.expiresAt)).getTime() : Date.now() + 3_600_000;
  return serviceToken;
}

export async function serviceAuthHeaders(cap: string) {
  const token = await fetchServiceToken(cap);
  return { Authorization: `Bearer ${token}` };
}

export async function login(username: string, password: string) {
  const transportPass = wrapPassword(password);
  const res = await fetch(apiUrl("/auth/token"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password: transportPass, app: APP_ID }),
  });
  const text = await res.text();
  let data: Record<string, unknown> = { ok: false };
  try {
    data = text ? JSON.parse(text) : { ok: false };
  } catch (_) {
    data = { ok: false, error: text || res.statusText };
  }
  if (!res.ok || !data.token) {
    const parts = [data.error, data.hint, data.detail].filter(Boolean);
    throw new Error(parts.join(" · ") || res.statusText || "Inicio de sesión fallido");
  }
  serviceToken = null;
  serviceExpMs = 0;
  const session: Record<string, unknown> = {
    username: data.username || username.trim().toUpperCase(),
    role: data.role || null,
    expiresAt: data.expiresAt || null,
    sessionToken: data.token,
    app: APP_ID,
  };
  if (data.app && data.app !== APP_ID) {
    throw new Error("Token emitido para otra aplicación");
  }
  if (!session.role) {
    try {
      const meRes = await fetch(apiUrl("/auth/me"), {
        headers: { Authorization: `Bearer ${data.token}`, "X-App-Id": APP_ID },
      });
      const me = await meRes.json();
      if (me.ok) session.role = me.role;
    } catch (_) { /* ignore */ }
  }
  writeSession(session);
  return session;
}

export function logout() {
  clearSession();
}

export function isLoggedIn() {
  return Boolean(readSession());
}

export function getSession() {
  return readSession();
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
