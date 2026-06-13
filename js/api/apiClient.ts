/** Endpoints PatyIA — HTTP compartido vía ISAFront.createCapFetch. */
import { Session, Config } from "../core/platform.ts";
import { ORCH_ONLINE, isLocalMode } from "../core/config.ts";
import * as SessionApi from "./sessionApi.ts";

const LOCAL_DIRECT = [
  { test: (p: string) => p.startsWith("/tk/"), base: "http://127.0.0.1:8786" },
];

const http = window.ISAFront.createCapFetch({
  Session,
  Config,
  localDirect: LOCAL_DIRECT,
  orchOnline: ORCH_ONLINE,
  isLocal: isLocalMode,
  serviceAuthHeaders: SessionApi.serviceAuthHeaders,
  handleApiError: SessionApi.handleApiError,
  clearSession: SessionApi.clearSession,
});

export const capFetch = http.capFetch;
export const apiUrl = http.apiUrl;
export const encodeSqlQueryParam = http.encodeSqlQueryParam;
export const rowVal = http.rowVal;

const SQL_INSTRUCCIONES = `SELECT [IINSTRUCCION],[NINSTRUCCION],[INSTRUCCION],[DESCRIPCION],[BACTIVO],[JCONFIG]
FROM [dbo].[INSTRUCCION]
WHERE [BACTIVO] = 1
ORDER BY [IINSTRUCCION]`;

export async function mssqlQuery(sql: string) {
  const trimmed = String(sql ?? "").trim();
  if (!trimmed) throw new Error("SQL vacío");
  const q = encodeSqlQueryParam(trimmed);
  const data = await capFetch(`/mssql/paty/query?q=${encodeURIComponent(q)}`, { method: "GET" });
  const rows = data.rows ?? data.recordset ?? data.recordsets?.[0] ?? [];
  return { ...data, rows };
}

export async function mssqlExec(sql: string) {
  const cap = SessionApi.mssqlExecCap();
  if (!cap) throw new Error(SessionApi.blockReason("sql.exec.mssql.paty.instrucciones") || SessionApi.blockReason("sql.exec.mssql.paty") || "Sin permiso MSSQL");
  return capFetch("/mssql/paty/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sql }),
  }, cap);
}

export async function fetchInstruccionesPaty() {
  const data = await mssqlQuery(SQL_INSTRUCCIONES);
  return data.rows ?? [];
}

export async function fetchConvLogById(id: string | number) {
  const convId = Number(id);
  if (!Number.isInteger(convId) || convId <= 0) throw new Error("iconversacion inválido");
  const data = await capFetch(`/patyia/conversacion/${convId}/log`, { method: "GET" });
  const log = (data.log ?? data.body?.log) as Record<string, unknown> | undefined;
  if (!log || !Array.isArray(log.mensajes)) {
    throw new Error(String(data.error || `Log conv-${convId} no encontrado`));
  }
  log.iconversacion = log.iconversacion || convId;
  return log;
}
