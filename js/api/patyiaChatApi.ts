import {
  PATYIA_API_BASE,
  type PatyJwtRecord,
  type PatyJwtClaims,
} from "../core/patyia-jwt.ts";
import { conversacionesListQueryParams } from "./issListFilter.ts";
import { patyAuthHeaders } from "./patyiaTokens.ts";
import { readPatyiaSseStream } from "../core/patyia.ts";

function authHeaders(jwt: PatyJwtRecord, extra: Record<string, string> = {}): HeadersInit {
  return patyAuthHeaders(jwt, extra);
}

function unwrapBody<T>(data: unknown): T {
  const d = data as Record<string, unknown>;
  if (d?.respuesta && typeof d.respuesta === "object") return d.respuesta as T;
  if (d?.body && typeof d.body === "object") return d.body as T;
  return d as T;
}

async function jsonFetch<T>(path: string, jwt: PatyJwtRecord, init?: RequestInit): Promise<T> {
  const res = await fetch(`${PATYIA_API_BASE}${path}`, {
    ...init,
    headers: {
      ...authHeaders(jwt),
      ...(init?.method && init.method !== "GET" ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers || {}),
    },
  });
  const ct = res.headers.get("content-type") || "";
  if (!res.ok) {
    let msg = res.statusText;
    if (ct.includes("json")) {
      try {
        const j = await res.json() as Record<string, unknown>;
        const inner = j.respuesta || j.body || j;
        msg = String((inner as Record<string, unknown>)?.error || j.error || j.message || msg);
      } catch { /* ignore */ }
    }
    throw new Error(msg || `HTTP ${res.status}`);
  }
  if (ct.includes("json")) {
    const raw = await res.json();
    return unwrapBody<T>(raw);
  }
  return {} as T;
}

export type PatyConversacionRow = {
  iconversacion: number;
  titulo?: string;
  fhcre?: string;
  fhultact?: string;
  qmensajes?: number;
  itercero?: string;
  icontacto?: string;
  itdestado?: number;
  prompt?: string;
};

export type PatyMensaje = {
  imensaje?: number;
  autor?: string;
  mensaje?: string;
  fecha_hora?: string | number;
  imagenes?: string[];
  meta?: {
    nombre_usuario?: string;
    prompt_variables?: { nombre_usuario?: string };
    [key: string]: unknown;
  };
};

export type PatyMensajeCalificado = {
  imensaje?: number;
  butil?: boolean | number;
  contenido?: string;
  iconversacion?: number;
};

export type PatyConvLogPayload = {
  iconversacion?: number;
  mensajes?: unknown[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

export type PatyConversacionDetalle = PatyConversacionRow & {
  mensajesOpenAI?: PatyMensaje[];
  mensajesCalificados?: PatyMensajeCalificado[];
  convLog?: PatyConvLogPayload | null;
  hilo?: string;
  respuesta?: string;
};

export type PostMensajeCalificadoInput = {
  iconversacion: number;
  contenido: string;
  imensaje: number;
  butil: boolean;
};

export type ListConversacionesInput = {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  itercero?: string;
  icontacto?: string;
};

export type ListConversacionesResult = {
  conversaciones: PatyConversacionRow[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

function buildConversacionesListPath(input: ListConversacionesInput = {}): string {
  const qs = conversacionesListQueryParams({
    page: input.page,
    limit: input.limit,
    search: input.search,
    sort: input.sort,
    itercero: input.itercero,
    icontacto: input.icontacto,
  });
  return `/conversaciones?${qs.toString()}`;
}

export async function listConversaciones(
  jwt: PatyJwtRecord,
  input: ListConversacionesInput = {},
): Promise<ListConversacionesResult> {
  const page = Math.max(1, Math.floor(Number(input.page) || 1));
  const limit = Math.min(100, Math.max(1, Math.floor(Number(input.limit) || 10)));
  const body = await jsonFetch<{
    conversaciones?: PatyConversacionRow[];
    total?: number;
    page?: number;
    limit?: number;
    pages?: number;
  }>(buildConversacionesListPath(input), jwt);
  const conversaciones = Array.isArray(body.conversaciones) ? body.conversaciones : [];
  const total = Number(body.total ?? 0) || 0;
  const resLimit = Number(body.limit ?? limit) || limit;
  const resPage = Number(body.page ?? page) || page;
  const pages = Number(body.pages ?? 0) || (total > 0 ? Math.ceil(total / resLimit) : 0);
  return { conversaciones, total, page: resPage, limit: resLimit, pages };
}

export async function getConversacion(jwt: PatyJwtRecord, id: number): Promise<PatyConversacionDetalle> {
  return jsonFetch<PatyConversacionDetalle>(`/conversacion/${id}`, jwt);
}

/** Mensajes con meta + convLog (GET /conversacion/logs/{id}) — visor ISA PatyIA. */
export async function getConversacionLogs(jwt: PatyJwtRecord, id: number): Promise<PatyConversacionDetalle> {
  return jsonFetch<PatyConversacionDetalle>(`/conversacion/logs/${id}`, jwt);
}

export function convLogFromDetalle(detail: PatyConversacionDetalle | null | undefined, id?: number): PatyConvLogPayload | null {
  const raw = detail?.convLog;
  if (!raw || !Array.isArray(raw.mensajes) || !raw.mensajes.length) return null;
  const convId = Number(raw.iconversacion ?? detail?.iconversacion ?? id ?? 0);
  return { ...raw, iconversacion: convId > 0 ? convId : raw.iconversacion };
}

/** Reintenta hasta que convLog tenga minMensajes (p. ej. tras POST /conversacion). */
export async function getConversacionLogsWithRetry(
  jwt: PatyJwtRecord,
  id: number,
  { minMensajes = 0, attempts = 8, delayMs = 300 }: { minMensajes?: number; attempts?: number; delayMs?: number } = {},
): Promise<PatyConversacionDetalle> {
  let last: PatyConversacionDetalle | null = null;
  for (let i = 0; i < attempts; i++) {
    try {
      const detail = await getConversacionLogs(jwt, id);
      last = detail;
      const n = convLogFromDetalle(detail, id)?.mensajes?.length ?? 0;
      if (!minMensajes || n >= minMensajes) return detail;
    } catch (e) {
      if (i === attempts - 1 && !last) throw e;
    }
    if (i < attempts - 1) {
      await new Promise((resolve) => { setTimeout(resolve, delayMs); });
    }
  }
  if (!last) throw new Error(`Log conv-${id} no encontrado`);
  return last;
}

export async function deleteConversacion(jwt: PatyJwtRecord, id: number): Promise<void> {
  await jsonFetch(`/conversacion/${id}`, jwt, { method: "DELETE" });
}

export async function postMensajeCalificado(
  jwt: PatyJwtRecord,
  input: PostMensajeCalificadoInput,
): Promise<PatyMensajeCalificado> {
  return jsonFetch<PatyMensajeCalificado>("/mensaje", jwt, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export type SendMessageInput = {
  prompt: string;
  iconversacion?: number;
  imagenes?: string[];
  audios?: string[];
  mode?: string;
};

/** Normaliza a data URL base64 (formato esperado por POST /conversacion). */
export function ensureBase64DataUrl(src: string): string {
  const s = String(src || "").trim();
  if (!s) return s;
  if (s.startsWith("data:")) return s;
  if (/^[A-Za-z0-9+/=\s]+$/.test(s.replace(/\s/g, ""))) {
    return `data:image/png;base64,${s.replace(/\s/g, "")}`;
  }
  return s;
}

/** Cuerpo JSON del POST /conversacion (misma forma que envía el chat). */
export function buildConversacionPostBody(input: SendMessageInput): Record<string, unknown> {
  const text = String(input.prompt || "").trim();
  const imagenes = (input.imagenes || [])
    .map(ensureBase64DataUrl)
    .filter(Boolean);
  const audios = (input.audios || []).filter(Boolean);
  const hasMedia = imagenes.length > 0 || audios.length > 0;
  const body: Record<string, unknown> = {
    prompt: text || (imagenes.length ? "(imagen adjunta)" : audios.length ? "(nota de voz)" : ""),
  };
  if (input.iconversacion) body.iconversacion = input.iconversacion;
  if (imagenes.length) body.imagenes = imagenes;
  if (audios.length) body.audios = audios;
  if (input.mode && String(input.mode).trim().toLowerCase() !== "patyia") {
    body.mode = String(input.mode).trim().toLowerCase();
  }
  if (!String(body.prompt || "").trim() && hasMedia) {
    body.prompt = imagenes.length ? "(imagen adjunta)" : "(nota de voz)";
  }
  return body;
}

/** JSON legible para vista previa; trunca base64 largo manteniendo la estructura. */
export function formatConversacionPostBodyPreview(
  body: Record<string, unknown>,
  { maxB64 = 72 }: { maxB64?: number } = {},
): string {
  const clone = JSON.parse(JSON.stringify(body)) as Record<string, unknown>;
  if (Array.isArray(clone.imagenes)) {
    clone.imagenes = clone.imagenes.map((img, i) => {
      const s = String(img ?? "");
      if (s.length <= maxB64 + 24) return s;
      const mime = s.startsWith("data:") ? s.slice(5, s.indexOf(";")) || "?" : "?";
      return `${s.slice(0, maxB64)}… [base64 ${mime}, ${s.length.toLocaleString("es-CO")} chars, img ${i + 1}]`;
    });
  }
  if (Array.isArray(clone.audios)) {
    clone.audios = clone.audios.map((aud, i) => {
      const s = String(aud ?? "");
      if (s.length <= maxB64 + 24) return s;
      const mime = s.startsWith("data:") ? s.slice(5, s.indexOf(";")) || "?" : "?";
      return `${s.slice(0, maxB64)}… [base64 ${mime}, ${s.length.toLocaleString("es-CO")} chars, audio ${i + 1}]`;
    });
  }
  return JSON.stringify(clone, null, 2);
}

export async function sendConversacionStream(
  jwt: PatyJwtRecord,
  input: SendMessageInput,
  onDelta: (text: string, payload: Record<string, unknown>) => void,
): Promise<PatyConversacionDetalle> {
  const body = buildConversacionPostBody(input);

  const res = await fetch(`${PATYIA_API_BASE}/conversacion`, {
    method: "POST",
    headers: authHeaders(jwt, {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    }),
    body: JSON.stringify(body),
  });

  let streamingText = "";
  const finalPayload = await readPatyiaSseStream(res, (ev) => {
    if (ev.event === "begin") {
      onDelta("", ev.data);
      return;
    }
    if ((ev.event === "message" || ev.event === "end") && typeof ev.data.respuesta === "string") {
      streamingText = ev.data.respuesta;
      onDelta(streamingText, ev.data);
    }
    if (ev.event === "error") {
      throw new Error(String(ev.data.respuesta || ev.data.error || "Error en stream"));
    }
  });

  return {
    ...(finalPayload as PatyConversacionDetalle),
    respuesta: streamingText || String(finalPayload.respuesta || ""),
  };
}
