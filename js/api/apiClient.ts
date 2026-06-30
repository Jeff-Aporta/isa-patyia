/** Endpoints PatyIA — token `app` (AppSession) en gateway y puente Azure. */
import { Session, Config } from "../core/platform.ts";
import {
  ORCH_ONLINE,
  isLocalMode,
  isPatyiaApiPath,
  patyiaBridgeBase,
  patyiaCapFetchBase,
  PATYIA_BRIDGE_URL,
  PATYIA_BRIDGE_LOCAL,
  PATYIA_BRIDGE_DEV,
} from "../core/patyia.ts";
import { isPatyJwtExpired, loadPatyJwt } from "../core/patyia-jwt.ts";
import { convLogFromDetalle, getConversacionLogs } from "./patyiaChatApi.ts";
import { conversacionesListQueryParams } from "./issListFilter.ts";
import * as SessionApi from "./sessionApi.ts";

const bridgeHttp = window.ISAFront.createCapFetch({
  Session,
  Config,
  getApiBase: patyiaCapFetchBase,
  localDirect: [
    { test: (p) => isPatyiaApiPath(p) || String(p).startsWith("/patyia"), base: PATYIA_BRIDGE_DEV.replace(/\/$/, "") },
  ],
  orchOnline: PATYIA_BRIDGE_URL,
  orchOnlineInLocal: true,
  isLocal: isLocalMode,
});

/** Publish y mutaciones gateway: solo AppSession (verify-access en orquestador). */
const orchHttp = window.ISAFront.createCapFetch({
  Session,
  Config,
  getApiBase: () => ORCH_ONLINE.replace(/\/$/, ""),
  orchOnlineInLocal: false,
  isLocal: () => false,
  handleApiError: SessionApi.handleApiError,
  clearSession: SessionApi.clearSession,
});

export const capFetch = bridgeHttp.capFetch;
export const apiUrl = bridgeHttp.apiUrl;
export const rowVal = bridgeHttp.rowVal;

/** Rutas puente MSSQL (/patyia/*). ISS local usa rutas planas (/conversaciones). */
function patyiaBridgePath(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (isLocalMode()) return p.startsWith("/patyia") ? p : p;
  return p.startsWith("/patyia") ? p : `/patyia${p}`;
}

function bridgePatyiaPath(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return p.startsWith("/patyia") ? p : `/patyia${p}`;
}

export async function fetchInstruccionesPaty() {
  if (isLocalMode()) {
    const url = `${PATYIA_BRIDGE_DEV.replace(/\/$/, "")}/api/patyia/instrucciones`;
    const headers: Record<string, string> = { Accept: "application/json" };
    if (Session.isLoggedIn()) Object.assign(headers, Session.authHeader(), Session.appHeader());
    let res: Response;
    try {
      res = await fetch(url, { method: "GET", headers });
    } catch {
      throw new Error(`No se pudo conectar con el puente PatyIA local (${PATYIA_BRIDGE_DEV}). Ejecuta: cd apps/isa-patyia/backend && npm run dev`);
    }
    const ct = res.headers.get("content-type") || "";
    if (!res.ok) {
      let msg = res.statusText;
      if (ct.includes("json")) {
        try {
          const j = await res.json() as Record<string, unknown>;
          msg = String(j.error || j.message || msg);
        } catch { /* ignore */ }
      }
      throw new Error(msg || `HTTP ${res.status}`);
    }
    const data = await res.json() as { rows?: Record<string, unknown>[] };
    return (data.rows ?? []) as Record<string, unknown>[];
  }
  const data = await capFetch(bridgePatyiaPath("/instrucciones"), { method: "GET" });
  return (data.rows ?? []) as Record<string, unknown>[];
}

export async function publishInstruccionesPaty(sql: string) {
  if (!SessionApi.instruccionesPublishCap()) {
    throw new Error(
      SessionApi.blockReason(SessionApi.INSTRUCCIONES_WRITE_CAP)
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
    null,
  );
}

export type InstruccionUpsertPayload = {
  iinstruccion: string;
  instruccion: string;
  jconfig?: Record<string, unknown>;
  author?: string;
};

/** Guarda una sola instrucción (sin publicar el lote completo). */
export async function upsertInstruccionPaty(payload: InstruccionUpsertPayload) {
  if (!SessionApi.instruccionesPublishCap()) {
    throw new Error(
      SessionApi.blockReason(SessionApi.INSTRUCCIONES_WRITE_CAP)
      || "Sin permiso para publicar instrucciones",
    );
  }
  return orchHttp.capFetch(
    "/patyia/instrucciones/upsert",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    null,
  );
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
}): Promise<ConversacionesBridgeResponse> {
  const params = conversacionesListQueryParams({
    page: input.page,
    limit: input.limit,
    search: input.search,
    sort: input.sort,
    itercero: input.itercero,
    icontacto: input.icontacto,
  });
  const raw = await capFetch(`${patyiaBridgePath("/conversaciones")}?${params.toString()}`, { method: "GET" });
  const data = (raw && typeof raw === "object" && raw.body && typeof raw.body === "object")
    ? raw.body as ConversacionesBridgeResponse
    : raw as ConversacionesBridgeResponse;
  if (data.ok === false) throw new Error(String(data.error || "No se pudo cargar conversaciones"));
  return {
    ok: true,
    conversaciones: Array.isArray(data.conversaciones) ? data.conversaciones : [],
    total: Number(data.total ?? 0) || 0,
    page: Number(data.page ?? input.page ?? 1) || 1,
    limit: Number(data.limit ?? input.limit ?? 10) || 10,
    pages: Number(data.pages ?? 0) || 0,
  };
}
