/** Endpoints PatyIA — token `app` (AppSession) en gateway y puente Azure. */
import { Session, Config } from "../core/platform.ts";
import {
  isLocalMode,
  isPatyiaApiPath,
  patyiaBridgeBase,
  patyiaCapFetchBase,
  PATYIA_BRIDGE_URL,
  PATYIA_ISS_LOCAL,
  PATYIA_BRIDGE_LOCAL,
} from "../core/patyia.ts";
import { isPatyJwtExpired, loadPatyJwt } from "../core/patyia-jwt.ts";
import { convLogFromDetalle, getConversacionLogs, listConversaciones } from "./patyiaChatApi.ts";
import { conversacionesListQueryParams } from "./issListFilter.ts";
import type { PatyJwtRecord } from "../core/patyia-jwt.ts";
import * as SessionApi from "./sessionApi.ts";
import {
  fetchInstruccionesSystemConfig,
  putInstruccionUpsert,
  putInstruccionesPublish,
  type InstruccionUpsertPayload,
} from "./systemConfigApi.ts";

const bridgeHttp = window.ISAFront.createCapFetch({
  Session,
  Config,
  getApiBase: patyiaCapFetchBase,
  localDirect: [
    { test: (p) => isPatyiaApiPath(p) || String(p).startsWith("/patyia"), base: PATYIA_ISS_LOCAL.replace(/\/$/, "") },
  ],
  orchOnline: PATYIA_BRIDGE_URL,
  orchOnlineInLocal: true,
  isLocal: isLocalMode,
});

export const capFetch = bridgeHttp.capFetch;
export const apiUrl = bridgeHttp.apiUrl;
export const rowVal = bridgeHttp.rowVal;

/** Envelope ISS: `{ encabezado, respuesta }` o legacy `{ body }`. */
function unwrapIssEnvelope<T>(raw: unknown): T {
  const d = raw as Record<string, unknown>;
  const enc = d?.encabezado;
  if (enc && typeof enc === "object" && !Array.isArray(enc) && (enc as { resultado?: boolean }).resultado === false) {
    const e = enc as { mensaje?: unknown; imensaje?: unknown };
    const msg = String(e.mensaje ?? e.imensaje ?? "").trim();
    throw new Error(msg || "Error en la respuesta del servidor");
  }
  if (d?.respuesta && typeof d.respuesta === "object" && !Array.isArray(d.respuesta)) {
    return d.respuesta as T;
  }
  if (d?.body && typeof d.body === "object" && !Array.isArray(d.body)) {
    return d.body as T;
  }
  return d as T;
}

/** Rutas ISS AyudasCPIA — sin prefijo /patyia salvo instrucciones. */
function patyiaBridgePath(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return p;
}

export async function fetchInstruccionesPaty(): Promise<{ rows: Record<string, unknown>[]; canEdit: boolean }> {
  const data = await fetchInstruccionesSystemConfig();
  SessionApi.setServerInstruccionesCanEdit(!!data.canEdit);
  return { rows: data.rows as Record<string, unknown>[], canEdit: !!data.canEdit };
}

export function publishInstruccionesPaty(sql: string) {
  if (!SessionApi.canEditInstrucciones()) {
    throw new Error(
      SessionApi.blockReason(SessionApi.INSTRUCCIONES_WRITE_CAP)
      || "Sin permiso para publicar instrucciones",
    );
  }
  return putInstruccionesPublish(sql);
}

export type { InstruccionUpsertPayload };

/** Guarda una sola instrucción (sin publicar el lote completo). */
export async function upsertInstruccionPaty(payload: InstruccionUpsertPayload) {
  if (!SessionApi.canEditInstrucciones()) {
    throw new Error(
      SessionApi.blockReason(SessionApi.INSTRUCCIONES_WRITE_CAP)
      || "Sin permiso para publicar instrucciones",
    );
  }
  return putInstruccionUpsert(payload);
}

function isConvNotFound(err: unknown): boolean {
  const status = err && typeof err === "object" ? Number((err as { status?: number }).status) : 0;
  if (status === 404) return true;
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return /not found|no encontrad|\b404\b/i.test(msg);
}

/** QA LogViewer: ISS /conversacion/logs/{id} con JWT; si falla, bridge MSSQL (sin JWT). */
export async function fetchConvLogForQa(id: string | number) {
  const convId = Number(id);
  if (!Number.isInteger(convId) || convId <= 0) throw new Error("iconversacion inválido");

  const jwt = loadPatyJwt();
  if (jwt?.token && !isPatyJwtExpired(jwt.token)) {
    try {
      const detail = await getConversacionLogs(jwt, convId);
      const log = convLogFromDetalle(detail, convId);
      if (log?.mensajes?.length) return log;
    } catch (e) {
      if (!isConvNotFound(e)) throw e;
    }
  }

  return fetchConvLogById(convId);
}

export async function fetchConvLogById(id: string | number) {
  const convId = Number(id);
  if (!Number.isInteger(convId) || convId <= 0) throw new Error("iconversacion inválido");

  const paths = [
    patyiaBridgePath(`/conversacion/${convId}/log`),
    patyiaBridgePath(`/conversacion/logs/${convId}`),
  ];
  let routeMiss: Error | null = null;

  for (const path of paths) {
    try {
      const data = await capFetch(path, { method: "GET" });
      const log = (data.convLog ?? data.log ?? data.body?.convLog ?? data.body?.log) as Record<string, unknown> | undefined;
      if (!log || !Array.isArray(log.mensajes)) {
        throw new Error(String(data.error || `Log conv-${convId} no encontrado`));
      }
      log.iconversacion = log.iconversacion || convId;
      return log;
    } catch (e) {
      const err = e as Error & { status?: number; data?: { error?: string } };
      const detail = err.data?.error?.trim();
      if (detail) throw new Error(detail);
      // 404 sin JSON = ruta no desplegada en el bridge (p. ej. logs/{id} vs {id}/log)
      if (err.status === 404 && !detail) {
        routeMiss = err;
        continue;
      }
      throw e;
    }
  }
  throw routeMiss ?? new Error(`Log conv-${convId} no encontrado`);
}

/** Reintenta mientras el log no alcance minMensajes (p. ej. tras POST /conversacion). */
export async function fetchConvLogByIdWithRetry(
  id: string | number,
  { minMensajes = 0, attempts = 8, delayMs = 300, qa = false }: {
    minMensajes?: number;
    attempts?: number;
    delayMs?: number;
    /** true = LogViewer (ISS + bridge); false = chat bridge sin JWT forzado */
    qa?: boolean;
  } = {},
) {
  const load = qa ? fetchConvLogForQa : fetchConvLogById;
  let last: Awaited<ReturnType<typeof fetchConvLogById>> | null = null;
  for (let i = 0; i < attempts; i++) {
    try {
      const log = await load(id);
      last = log;
      const n = Array.isArray(log.mensajes) ? log.mensajes.length : 0;
      if (!minMensajes || n >= minMensajes) return log;
    } catch (e) {
      if (i === attempts - 1 && !last) throw e;
    }
    if (i < attempts - 1) {
      await new Promise((resolve) => { setTimeout(resolve, delayMs); });
    }
  }
  return last;
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
  jwtToken?: string;
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
  let raw: unknown;
  try {
    raw = await capFetch(`${patyiaBridgePath("/auditoria/terceros")}?${params.toString()}`, { method: "GET" });
  } catch (err) {
    if (isLocalMode() && input.jwtToken) return fetchTercerosAuditFromLocalConversaciones(input as Parameters<typeof fetchTercerosAuditFromLocalConversaciones>[0]);
    throw err;
  }
  const data = unwrapIssEnvelope<TercerosAuditResponse>(raw);
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

async function fetchTercerosAuditFromLocalConversaciones(input: {
  page?: number;
  limit?: number;
  q?: string;
  jwtToken: string;
  jwtTercero?: string;
  jwtContacto?: string;
}): Promise<TercerosAuditResponse> {
  const limit = input.limit ?? 20;
  const groups = new Map<string, TerceroAuditRow>();
  for (let page = 1; page <= 5; page += 1) {
    const params = conversacionesListQueryParams({ page, limit: 100, sort: "-iconversacion" });
    const res = await fetch(`${PATYIA_BRIDGE_LOCAL.replace(/\/$/, "")}/conversaciones?${params.toString()}`, {
      headers: { Authorization: `Bearer ${input.jwtToken}` },
    });
    if (!res.ok) throw new Error(`No se pudo cargar auditoría local (${res.status})`);
    const raw = await res.json();
    const body = raw?.respuesta ?? raw?.body ?? raw;
    const conversaciones = Array.isArray(body?.conversaciones) ? body.conversaciones as ConversacionBridgeRow[] : [];
    for (const conv of conversaciones) {
      const itercero = String(conv.itercero ?? "").trim();
      const icontacto = String(conv.icontacto ?? "").trim();
      if (!itercero || !icontacto) continue;
      const key = `${itercero}|${icontacto}`;
      const prev = groups.get(key);
      const fh = String(conv.fhultact ?? conv.fhcre ?? "");
      const nombre = String(conv.nick_propietario ?? "").trim() || null;
      if (!prev) {
        groups.set(key, {
          itercero,
          icontacto,
          nombre,
          total_conversaciones: 1,
          total_mensajes: Number(conv.qmensajes ?? 0) || 0,
          ultima_actividad: fh || null,
          es_jwt: itercero === String(input.jwtTercero ?? "") && icontacto === String(input.jwtContacto ?? ""),
          es_sesion: false,
        });
      } else {
        prev.total_conversaciones += 1;
        prev.total_mensajes += Number(conv.qmensajes ?? 0) || 0;
        if (fh && (!prev.ultima_actividad || new Date(fh) > new Date(prev.ultima_actividad))) prev.ultima_actividad = fh;
        if (!prev.nombre && nombre) prev.nombre = nombre;
      }
    }
    if (conversaciones.length < 100) break;
  }
  const q = String(input.q ?? "").trim().toLowerCase();
  const rows = [...groups.values()]
    .filter((r) => !q || [r.nombre, r.itercero, r.icontacto].some((v) => String(v ?? "").toLowerCase().includes(q)))
    .sort((a, b) => String(b.ultima_actividad ?? "").localeCompare(String(a.ultima_actividad ?? "")));
  const page = Math.max(1, Number(input.page ?? 1) || 1);
  const offset = (page - 1) * limit;
  return { ok: true, rows: rows.slice(offset, offset + limit), total: rows.length, page, limit, pages: Math.max(1, Math.ceil(rows.length / limit)) };
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
  nick_propietario?: string | null;
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
  itercero?: string;
  icontacto?: string;
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
}, jwt?: PatyJwtRecord | null): Promise<ConversacionesBridgeResponse> {
  const tokenJwt = jwt ?? loadPatyJwt();
  if (!tokenJwt?.token) {
    throw new Error("Configura el JWT de soporte-staging para listar conversaciones");
  }
  const res = await listConversaciones(tokenJwt, {
    page: input.page,
    limit: input.limit,
    search: input.search,
    sort: input.sort,
    itercero: input.itercero,
    icontacto: input.icontacto,
  });
  return {
    ok: true,
    conversaciones: res.conversaciones,
    total: res.total,
    page: res.page,
    limit: res.limit,
    pages: res.pages,
  };
}
