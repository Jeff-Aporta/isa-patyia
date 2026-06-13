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
  const sql = `SELECT CONTENT FROM dbo.CONVERSACION_LOG WHERE ICONVERSACION = ${convId}`;
  const { rows } = await mssqlQuery(sql);
  const row = rows[0] as Record<string, unknown> | undefined;
  const raw = rowVal(row, "CONTENT");
  if (!raw || typeof raw !== "string") {
    throw new Error(`Log conv-${convId} no encontrado en CONVERSACION_LOG`);
  }
  const parsed = JSON.parse(raw.trim()) as Record<string, unknown>;
  if (!parsed || !Array.isArray(parsed.mensajes)) {
    throw new Error("CONTENT no es un log de conversación válido");
  }
  parsed.iconversacion = parsed.iconversacion || convId;
  return parsed;
}
