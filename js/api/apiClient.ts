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
export const rowVal = http.rowVal;

export async function fetchInstruccionesPaty() {
  const data = await capFetch("/patyia/instrucciones", { method: "GET" });
  return (data.rows ?? []) as Record<string, unknown>[];
}

export async function publishInstruccionesPaty(sql: string) {
  const cap = SessionApi.instruccionesPublishCap();
  if (!cap) {
    throw new Error(
      SessionApi.blockReason("patyia.instrucciones.publish")
      || "Sin permiso para publicar instrucciones",
    );
  }
  return capFetch(
    "/patyia/instrucciones/publish",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sql }),
    },
    cap,
  );
}

export async function fetchConvLogById(id: string | number) {
  const convId = Number(id);
  if (!Number.isInteger(convId) || convId <= 0) throw new Error("iconversacion inválido");
  try {
    const data = await capFetch(`/patyia/conversacion/${convId}/log`, { method: "GET" });
    const log = (data.log ?? data.body?.log) as Record<string, unknown> | undefined;
    if (!log || !Array.isArray(log.mensajes)) {
      throw new Error(String(data.error || `Log conv-${convId} no encontrado`));
    }
    log.iconversacion = log.iconversacion || convId;
    return log;
  } catch (e) {
    const err = e as Error & { status?: number; data?: { error?: string } };
    const detail = err.data?.error?.trim();
    if (detail) throw new Error(detail);
    throw e;
  }
}
