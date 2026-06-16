/** Endpoints PatyIA — lecturas al puente Azure; publish vía main-orchestrator (gateway). */
import { Session, Config } from "../core/platform.ts";
import {
  ORCH_ONLINE,
  isLocalMode,
  isPatyiaApiPath,
  patyiaBridgeBase,
  PATYIA_BRIDGE_URL,
} from "../core/config.ts";
import * as SessionApi from "./sessionApi.ts";

const bridgeHttp = window.ISAFront.createCapFetch({
  Session,
  Config,
  getApiBase: patyiaBridgeBase,
  localDirect: [
    { test: isPatyiaApiPath, base: "http://127.0.0.1:4500" },
  ],
  orchOnline: PATYIA_BRIDGE_URL,
  orchOnlineInLocal: true,
  isLocal: isLocalMode,
});

const orchHttp = window.ISAFront.createCapFetch({
  Session,
  Config,
  getApiBase: () => ORCH_ONLINE.replace(/\/$/, ""),
  orchOnlineInLocal: false,
  isLocal: isLocalMode,
  serviceAuthHeaders: SessionApi.serviceAuthHeaders,
  handleApiError: SessionApi.handleApiError,
  clearSession: SessionApi.clearSession,
});

export const capFetch = bridgeHttp.capFetch;
export const apiUrl = bridgeHttp.apiUrl;
export const rowVal = bridgeHttp.rowVal;

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
  return orchHttp.capFetch(
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

export type TerceroAuditRow = {
  itercero: string;
  icontacto: string;
  nombre?: string | null;
  total_conversaciones: number;
  total_mensajes: number;
  ultima_actividad: string | null;
  es_jwt: boolean;
  es_sesion?: boolean;
};

export type TercerosAuditResponse = {
  ok: boolean;
  rows: TerceroAuditRow[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  error?: string;
};

export async function fetchTercerosAudit(input: {
  page?: number;
  limit?: number;
  q?: string;
  jwtTercero?: string;
  jwtContacto?: string;
  jwtNombre?: string;
  appUser?: string;
} = {}): Promise<TercerosAuditResponse> {
  const params = new URLSearchParams();
  params.set("page", String(input.page ?? 1));
  params.set("limit", String(input.limit ?? 20));
  if (input.q?.trim()) params.set("q", input.q.trim());
  if (input.jwtTercero?.trim()) params.set("jwtTercero", input.jwtTercero.trim());
  if (input.jwtContacto?.trim()) params.set("jwtContacto", input.jwtContacto.trim());
  if (input.jwtNombre?.trim()) params.set("jwtNombre", input.jwtNombre.trim());
  if (input.appUser?.trim()) params.set("appUser", input.appUser.trim());
  const raw = await capFetch(`/patyia/auditoria/terceros?${params.toString()}`, { method: "GET" });
  const data = (raw && typeof raw === "object" && raw.body && typeof raw.body === "object")
    ? raw.body as TercerosAuditResponse
    : raw as TercerosAuditResponse;
  if (data.ok === false) throw new Error(String(data.error || "No se pudo cargar terceros"));
  return {
    ok: true,
    rows: Array.isArray(data.rows) ? data.rows : [],
    total: Number(data.total ?? 0) || 0,
    page: Number(data.page ?? input.page ?? 1) || 1,
    limit: Number(data.limit ?? input.limit ?? 20) || 20,
    pages: Number(data.pages ?? 0) || 0,
  };
}

export type ConversacionBridgeRow = {
  iconversacion: number;
  itercero?: string;
  icontacto?: string;
  titulo?: string;
  fhcre?: string | null;
  fhultact?: string | null;
  qmensajes?: number;
  itdestado?: number;
};

export type ConversacionesBridgeResponse = {
  ok: boolean;
  conversaciones: ConversacionBridgeRow[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  error?: string;
};

export async function fetchConversacionesBridge(input: {
  itercero: string;
  icontacto: string;
  page?: number;
  limit?: number;
}): Promise<ConversacionesBridgeResponse> {
  const params = new URLSearchParams();
  params.set("itercero", String(input.itercero).trim());
  params.set("icontacto", String(input.icontacto).trim());
  params.set("page", String(input.page ?? 1));
  params.set("limit", String(input.limit ?? 100));
  const raw = await capFetch(`/patyia/conversaciones?${params.toString()}`, { method: "GET" });
  const data = (raw && typeof raw === "object" && raw.body && typeof raw.body === "object")
    ? raw.body as ConversacionesBridgeResponse
    : raw as ConversacionesBridgeResponse;
  if (data.ok === false) throw new Error(String(data.error || "No se pudo cargar conversaciones"));
  return {
    ok: true,
    conversaciones: Array.isArray(data.conversaciones) ? data.conversaciones : [],
    total: Number(data.total ?? 0) || 0,
    page: Number(data.page ?? input.page ?? 1) || 1,
    limit: Number(data.limit ?? input.limit ?? 100) || 100,
    pages: Number(data.pages ?? 0) || 0,
  };
}
