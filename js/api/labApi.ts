/**
 * Cliente HTTP — local vía main-orchestrator; en línea legacy lab Azure.
 * Tickets JAGUDELOE-TKS: GET /api/tk/{space}/tickets[/{iticket}]
 */
import { Config, Session } from "../core/platform.ts";
import { isLocalMode, ORCH_ONLINE } from "../core/config.ts";
import * as LabSession from "./labSession.ts";
import { toastWarning } from "../ui/notifications.jsx";

export const TK_SPACE_DEFAULT = "patyia";

const LOCAL_DIRECT = [
  { test: (p: string) => p.startsWith("/tk/"), base: "http://127.0.0.1:8786" },
];

function isDevHost() {
  const h = location.hostname;
  return h === "localhost" || h === "127.0.0.1" || h === "[::1]";
}

function directBaseFor(path: string) {
  if (!isDevHost() || !isLocalMode()) return null;
  for (const entry of LOCAL_DIRECT) {
    if (entry.test(path)) return entry.base.replace(/\/$/, "");
  }
  return null;
}

export function requireBase() {
  return Config.base();
}

export function apiUrl(path: string, baseOverride?: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  const full = p.startsWith("/api") ? p : `/api${p}`;
  if (baseOverride) return baseOverride.replace(/\/$/, "") + full;
  return Config.apiUrl(full);
}

function gatewayHint() {
  if (!isLocalMode()) return "";
  return " Comprueba que el entorno local esté activo.";
}

const TECHNICAL_ERR =
  /main-orchestrator|workers\.dev|localhost:\d+|878\d|azure|orquestador|gateway|negotiate|accesstoken|cf-ai\.|system-login\./i;

function sanitizeApiError(raw: unknown, fallback = "No se pudo completar la operación") {
  const msg = String(raw ?? "").trim();
  if (!msg) return fallback;
  if (TECHNICAL_ERR.test(msg)) return fallback;
  if (/^HTTP \d{3}$/.test(msg)) return fallback;
  if (/verificaci[oó]n de permisos fallida|verify-access|servicio de auth no disponible/i.test(msg)) {
    return fallback;
  }
  return msg.length > 200 ? msg.slice(0, 197) + "…" : msg;
}

function wrapFetchError(err: unknown) {
  if (err instanceof TypeError && /failed to fetch/i.test(String((err as Error).message))) {
    return new Error(
      "No se pudo conectar con el servidor." + gatewayHint() + " Revisa el entorno (Local/Producción).",
    );
  }
  return err instanceof Error ? err : new Error(String(err));
}

async function labFetchRaw(url: string, init: RequestInit = {}) {
  try {
    return await fetch(url, init);
  } catch (err) {
    throw wrapFetchError(err);
  }
}

async function parseJsonResponse(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch (_) {
    throw new Error(sanitizeApiError(text || res.statusText, "Respuesta no válida del servidor"));
  }
}

function basesFor(path: string): string[] {
  const bases = [requireBase()];
  const direct = directBaseFor(path);
  if (direct && bases.indexOf(direct) < 0) bases.push(direct);
  if (isDevHost() && isLocalMode()) {
    const prod = ORCH_ONLINE.replace(/\/$/, "");
    if (bases.indexOf(prod) < 0) bases.push(prod);
  }
  return bases;
}

export async function labFetch(path: string, init: RequestInit = {}, cap: string | null = null) {
  const bases = basesFor(path);

  let lastErr: Error | null = null;

  for (let bi = 0; bi < bases.length; bi++) {
    const url = apiUrl(path, bases[bi]);
    const headers = { "Content-Type": "application/json", ...(init.headers || {}) };
    const res = await labFetchRaw(url, { ...init, headers });
    const data = await parseJsonResponse(res);

    if (res.status === 403) {
      const err = new Error(sanitizeApiError(data.error, "Permiso denegado")) as Error & { code?: string };
      err.code = "FORBIDDEN";
      if (cap) LabSession.handleApiError(err, cap);
      throw err;
    }
    if (res.status === 401) {
      LabSession.clearSession();
      const err = new Error(sanitizeApiError(data.error ?? data.hint, "Sesión no válida"));
      if (cap) toastWarning("Sesión expirada. Vuelve a iniciar sesión.");
      throw err;
    }
    if (res.status === 404) {
      const serverErr = String(data?.error ?? "").trim();
      if (/not found|verify-access|autorizaci|verificaci/i.test(serverErr)) {
        lastErr = new Error("No se pudo autorizar la escritura. Vuelve a iniciar sesión o comprueba permisos MSSQL.");
      } else {
        lastErr = new Error(`Recurso no encontrado.${gatewayHint()}`);
      }
      if (bi < bases.length - 1) continue;
      throw lastErr;
    }
    if (!res.ok || data.ok === false) {
      lastErr = new Error(sanitizeApiError(data.error ?? data.output ?? res.statusText, `Error HTTP ${res.status}`));
      if (bi < bases.length - 1 && (res.status === 404 || res.status === 502 || res.status === 503)) continue;
      throw lastErr;
    }
    return data;
  }

  throw lastErr || new Error("No se pudo conectar con el servidor." + gatewayHint());
}

async function labFetchWithCap(cap: string, path: string, init: RequestInit = {}) {
  if (!LabSession.can(cap)) {
    const msg = LabSession.blockReason(cap);
    toastWarning(msg);
    const err = new Error(msg) as Error & { code?: string };
    err.code = "NO_SESSION";
    throw err;
  }
  const auth = await LabSession.serviceAuthHeaders(cap);
  return labFetch(path, {
    ...init,
    headers: { ...Session.appHeader(), ...auth, ...(init.headers || {}) },
  }, cap);
}

function encodeSqlQueryParam(sql: string) {
  const trimmed = String(sql ?? "").trim();
  const bytes = new TextEncoder().encode(trimmed);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export async function mssqlQuery(sql: string) {
  const trimmed = String(sql ?? "").trim();
  if (!trimmed) throw new Error("SQL vacío");
  const q = encodeSqlQueryParam(trimmed);
  const data = await labFetch(`/mssql/paty/query?q=${encodeURIComponent(q)}`, {
    method: "GET",
  });
  const rows = data.rows ?? data.recordset ?? data.recordsets?.[0] ?? [];
  return { ...data, rows };
}

export async function mssqlExec(sql: string) {
  const cap = LabSession.mssqlExecCap();
  if (!cap) {
    const msg = LabSession.blockReason("sql.exec.mssql.paty.instrucciones")
      || LabSession.blockReason("sql.exec.mssql.paty");
    toastWarning(msg);
    const err = new Error(msg) as Error & { code?: string };
    err.code = "NO_SESSION";
    throw err;
  }
  return labFetchWithCap(cap, "/mssql/paty/exec", {
    method: "POST",
    body: JSON.stringify({ sql }),
  });
}

export async function pingLab() {
  return labFetch("/health", { method: "GET" });
}

async function pgLanglabExec(sql: string) {
  return labFetchWithCap("langlab.guardar", "/patyia/prompts/upsert-sql", {
    method: "POST",
    body: JSON.stringify({ sql, target: "langlab" }),
  });
}

export async function savePromptsToLanglab(sql: string) {
  return pgLanglabExec(sql);
}

export async function getTickets(space = TK_SPACE_DEFAULT, opts: { activo?: boolean; estado?: string } = {}) {
  let qs = "";
  if (opts.activo === false) qs = "?activo=false";
  else if (opts.activo === true) qs = "?activo=true";
  else if (opts.estado === "inactivo") qs = "?activo=false";
  else if (opts.estado === "activo") qs = "?activo=true";
  return labFetch(`/tk/${encodeURIComponent(space)}/tickets${qs}`);
}

export async function getTicket(space: string, iticket: string) {
  const id = String(iticket || "").trim();
  if (!id) throw new Error("iticket requerido");
  const norm = id.toUpperCase().startsWith("TK-") ? id.toUpperCase() : `TK-${id.toUpperCase()}`;
  return labFetch(`/tk/${encodeURIComponent(space || TK_SPACE_DEFAULT)}/tickets/${encodeURIComponent(norm)}`);
}

export function rowVal(row: Record<string, unknown>, key: string) {
  if (!row || !key) return null;
  if (row[key] != null) return row[key];
  const lower = key.toLowerCase();
  if (row[lower] != null) return row[lower];
  const upper = key.toUpperCase();
  if (row[upper] != null) return row[upper];
  return null;
}

const SQL_INSTRUCCIONES = `SELECT [IINSTRUCCION],[NINSTRUCCION],[INSTRUCCION],[DESCRIPCION],[BACTIVO],[JCONFIG]
FROM [dbo].[INSTRUCCION]
WHERE [BACTIVO] = 1
ORDER BY [IINSTRUCCION]`;

export async function fetchInstruccionesPaty() {
  const { rows } = await mssqlQuery(SQL_INSTRUCCIONES);
  return rows ?? [];
}

export async function fetchConvLogById(iconversacion: string | number) {
  const id = Number(iconversacion);
  if (!Number.isInteger(id) || id <= 0) throw new Error("iconversacion inválido");
  const sql = `SELECT CONTENT FROM dbo.CONVERSACION_LOG WHERE ICONVERSACION = ${id}`;
  const { rows } = await mssqlQuery(sql);
  const row = rows[0];
  const raw = row?.CONTENT ?? row?.content;
  if (!raw || typeof raw !== "string") {
    throw new Error(`Log conv-${id} no encontrado en CONVERSACION_LOG`);
  }
  const parsed = JSON.parse(raw.trim());
  if (!parsed || !Array.isArray(parsed.mensajes)) {
    throw new Error("CONTENT no es un log de conversación válido");
  }
  parsed.iconversacion = parsed.iconversacion || id;
  return parsed;
}
