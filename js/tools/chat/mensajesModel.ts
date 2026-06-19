import { logToMensajesVista, resolveOpenAiMensajeText } from "../../core/convLog.ts";
import type {
  ChatMensajeVista,
  ConvLogPayload,
  PatyConversacionDetalle,
  PatyMensaje,
  PatyMensajeCalificado,
} from "./types.ts";

export function formatTs(v: string | number | Date | null | undefined): string {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v).slice(0, 16) : d.toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
}

export function resolveUserName(msg: PatyMensaje | ChatMensajeVista | null | undefined, fallbackUserName?: string): string {
  const meta = msg?.meta as Record<string, unknown> | null | undefined;
  const promptVars = meta?.prompt_variables as Record<string, unknown> | undefined;
  return (
    String(meta?.nombre_usuario ?? "")
    || String(promptVars?.nombre_usuario ?? "")
    || fallbackUserName
    || ""
  );
}

export function fechaHoraToEpochSeconds(fh: string | number | null | undefined): number | undefined {
  if (fh == null || fh === "") return undefined;
  if (typeof fh === "number" && Number.isFinite(fh)) {
    const n = fh > 1e12 ? Math.floor(fh / 1000) : Math.floor(fh);
    return n > 0 ? n : undefined;
  }
  const d = Date.parse(String(fh).trim());
  if (Number.isNaN(d)) return undefined;
  return Math.floor(d / 1000);
}

function butilToCalificacion(butil: boolean | number | string | null | undefined): number | undefined {
  if (butil === undefined || butil === null) return undefined;
  return butil === true || butil === 1 || butil === "1" ? 1 : 0;
}

/** Imágenes del mensaje OpenAI: campo top-level; meta solo respaldo legacy. */
export function resolveMensajeImagenes(m: PatyMensaje | null | undefined): string[] | undefined {
  if (Array.isArray(m?.imagenes) && m.imagenes.length) {
    return m.imagenes.filter(Boolean);
  }
  const meta = m?.meta;
  if (!meta || typeof meta !== "object") return undefined;
  const others = meta.others as Record<string, unknown> | undefined;
  if (others && Array.isArray(others.imagenes_adjuntas) && others.imagenes_adjuntas.length) {
    return others.imagenes_adjuntas.filter(Boolean) as string[];
  }
  return undefined;
}

type CalificadoLite = {
  imensaje: number;
  butil: boolean | number | string | null | undefined;
  contenido: string;
};

function findCalificadoForMsg(
  calificados: PatyMensajeCalificado[] | null | undefined,
  { imensaje, contenido }: { imensaje?: number; contenido?: string },
): CalificadoLite | null {
  const rated: CalificadoLite[] = (calificados || []).map((c) => ({
    imensaje: Number(c.imensaje) || 0,
    butil: c.butil,
    contenido: String(c.contenido ?? "").trim(),
  })).filter((c) => c.imensaje > 0);
  if (!rated.length) return null;

  if (imensaje) {
    const match = rated.find((r) => r.imensaje === imensaje);
    if (match) return match;
  }
  const text = String(contenido ?? "").trim();
  if (text) {
    return rated.find((r) => {
      const c = r.contenido;
      return c === text || (text.length >= 24 && c.startsWith(text.slice(0, 24)));
    }) || null;
  }
  return null;
}

export function attachCalificacionesToVista(
  vista: ChatMensajeVista[] | null | undefined,
  openAiMsgs: PatyMensaje[] | null | undefined,
  calificados: PatyMensajeCalificado[] | null | undefined,
): ChatMensajeVista[] {
  let oi = 0;
  return (vista || []).map((v) => {
    if (v.esUsuario || v.esOperativa) return v;
    const msgs = openAiMsgs || [];
    let raw: PatyMensaje | undefined;
    if (msgs.length) {
      while (oi < msgs.length && String(msgs[oi]?.autor || "").toLowerCase().includes("usuario")) oi += 1;
      raw = msgs[oi];
      oi += 1;
    }
    const imensaje = Number(v.imensaje) || Number(raw?.imensaje) || undefined;
    const match = findCalificadoForMsg(calificados, { imensaje, contenido: v.contenido });
    return {
      ...v,
      ...(match?.imensaje || imensaje ? { imensaje: match?.imensaje || imensaje } : {}),
      ...(match ? { calificacion: butilToCalificacion(match.butil) } : {}),
    };
  });
}

export function attachCalificacionesOnly(
  vista: ChatMensajeVista[] | null | undefined,
  calificados: PatyMensajeCalificado[] | null | undefined,
): ChatMensajeVista[] {
  return (vista || []).map((v) => {
    if (v.esUsuario || v.esOperativa) return v;
    const imensaje = Number(v.imensaje) || undefined;
    const match = findCalificadoForMsg(calificados, { imensaje, contenido: v.contenido });
    if (!match) return v;
    return {
      ...v,
      ...(match.imensaje ? { imensaje: match.imensaje } : {}),
      calificacion: butilToCalificacion(match.butil),
    };
  });
}

export function countLogAssistants(log: ConvLogPayload | null | undefined): number {
  return (log?.mensajes || []).filter((m) => String(m.role) === "assistant").length;
}

export function logHasOperativas(log: ConvLogPayload | null | undefined): boolean {
  return Boolean((log?.mensajes || []).some((m) => String(m.role) === "operativa"));
}

export function countOpenAiAssistants(detail: PatyConversacionDetalle | null | undefined): number {
  return (detail?.mensajesOpenAI || []).filter(
    (m) => String(m.autor || "").toLowerCase().includes("asistente"),
  ).length;
}

export function openAiFallbackVista(
  mensajes: PatyMensaje[] | null | undefined,
  fallbackUserName?: string,
): ChatMensajeVista[] {
  return (mensajes || []).map((m, i) => {
    const isUser = String(m.autor || "").toLowerCase().includes("usuario");
    const nombreUsuario = isUser ? resolveUserName(m, fallbackUserName) : "";
    let meta = m.meta && typeof m.meta === "object" ? { ...m.meta } : null;
    if (isUser && nombreUsuario) {
      meta = meta ? { ...meta, nombre_usuario: meta.nombre_usuario || nombreUsuario } : { nombre_usuario: nombreUsuario };
    }
    const contenido = resolveOpenAiMensajeText(m);
    const metaRecord = meta as Record<string, unknown> | null;
    const fechaRaw = m.fecha_hora || metaRecord?.ts || "";
    const imensaje = Number(m.imensaje) || undefined;
    const imagenes = resolveMensajeImagenes(m);
    return {
      idMsg: imensaje ? `msg-${imensaje}` : `openai-${i}`,
      rol: isUser ? "user" : "assistant",
      contenido,
      fecha: formatTs(fechaRaw as string | number | Date),
      esUsuario: isUser,
      esOperativa: false,
      meta,
      nombreUsuario: nombreUsuario || undefined,
      ...(imensaje ? { imensaje } : {}),
      ...(imagenes?.length ? { imagenes } : {}),
    };
  });
}

/** Vista prod: sin meta ni usageStats (alineado con stripMetaFromMensajesOpenAI del backend). */
export function stripMetaFromVista(mensajes: ChatMensajeVista[] | null | undefined): ChatMensajeVista[] {
  return (mensajes || []).map(({ meta: _meta, usageStats: _usageStats, ...rest }) => ({
    ...rest,
    meta: null,
  }));
}

export function enrichLogVista(
  mensajes: ChatMensajeVista[] | null | undefined,
  fallbackUserName?: string,
): ChatMensajeVista[] {
  return (mensajes || []).map((m) => {
    if (!m.esUsuario) return m;
    const meta = m.meta as Record<string, unknown> | null | undefined;
    const promptVars = meta?.prompt_variables as Record<string, unknown> | undefined;
    const name = m.nombreUsuario
      || String(meta?.nombre_usuario ?? "")
      || String(promptVars?.nombre_usuario ?? "")
      || fallbackUserName;
    if (!name) return m;
    return {
      ...m,
      nombreUsuario: name,
      meta: m.meta ? { ...meta, nombre_usuario: meta?.nombre_usuario || name } : { nombre_usuario: name },
    };
  });
}

export function isEphemeralMsgId(idMsg: string | null | undefined): boolean {
  if (!idMsg || idMsg === "stream-live") return true;
  const id = String(idMsg);
  return id.startsWith("pending-user-") || id.startsWith("assistant-final-");
}

export function mensajeVistaStableEqual(a: ChatMensajeVista | null | undefined, b: ChatMensajeVista | null | undefined): boolean {
  if (!a || !b) return false;
  return a.contenido === b.contenido
    && a.fecha === b.fecha
    && a.rol === b.rol
    && a.calificacion === b.calificacion
    && a.esUsuario === b.esUsuario
    && a.esOperativa === b.esOperativa
    && !a.isStreaming
    && !b.isStreaming
    && JSON.stringify(a.usageStats ?? null) === JSON.stringify(b.usageStats ?? null)
    && JSON.stringify(a.imagenes ?? null) === JSON.stringify(b.imagenes ?? null);
}

/** Conserva referencias de mensajes sin cambios para no remontar todo el hilo. */
export function mergeMensajesVista(
  prev: ChatMensajeVista[] | null | undefined,
  next: ChatMensajeVista[] | null | undefined,
): ChatMensajeVista[] {
  if (!next?.length) return prev || [];
  const prevById = new Map<string, ChatMensajeVista>();
  for (const m of prev || []) {
    if (isEphemeralMsgId(m.idMsg) || m.isStreaming) continue;
    prevById.set(m.idMsg, m);
  }
  const merged = next.map((m) => {
    const old = prevById.get(m.idMsg);
    return old && mensajeVistaStableEqual(old, m) ? old : m;
  });
  for (const m of prev || []) {
    if (!isEphemeralMsgId(m.idMsg) || m.isStreaming) continue;
    if (!m.esUsuario) continue;
    const already = merged.some((n) => n.esUsuario && mensajeVistaStableEqual(m, n));
    if (!already) merged.push(m);
  }
  return merged;
}

export function vistaFromLogAndDetail(
  d: PatyConversacionDetalle | null | undefined,
  log: ConvLogPayload | null | undefined,
  name?: string,
): ChatMensajeVista[] | null {
  if (!log?.mensajes?.length) return null;
  const rated = d?.mensajesCalificados || [];
  let vista = enrichLogVista(logToMensajesVista(log) as ChatMensajeVista[], name);
  if (d?.mensajesOpenAI?.length) {
    vista = attachCalificacionesToVista(vista, d.mensajesOpenAI, rated);
  } else if (rated.length) {
    vista = attachCalificacionesOnly(vista, rated);
  }
  return vista;
}

export function finalizeStreamInLog(mensajes: ChatMensajeVista[] | null | undefined, finalText: string): ChatMensajeVista[] {
  return appendStreamMsg(mensajes, finalText, true).map((m) => {
    if (m.idMsg !== "stream-live" && !m.isStreaming) return m;
    return {
      ...m,
      idMsg: m.idMsg === "stream-live" ? `assistant-final-${Date.now()}` : m.idMsg,
      contenido: finalText || m.contenido,
      isStreaming: false,
      fecha: m.fecha || formatTs(new Date()),
    };
  });
}

export function appendStreamMsg(
  mensajes: ChatMensajeVista[] | null | undefined,
  streamText: string | null | undefined,
  active?: boolean,
): ChatMensajeVista[] {
  if (!active) return mensajes || [];
  const list = [...(mensajes || [])];
  const liveText = String(streamText ?? "");

  let lastUserIdx = -1;
  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i].esUsuario) {
      lastUserIdx = i;
      break;
    }
  }

  let lastAsstIdx = -1;
  for (let i = list.length - 1; i > lastUserIdx; i--) {
    const m = list[i];
    if (!m.esUsuario && !m.esOperativa) {
      lastAsstIdx = i;
      break;
    }
  }

  if (lastAsstIdx >= 0) {
    const cur = list[lastAsstIdx];
    const logText = String(cur.contenido ?? "");
    const contenido = liveText.length >= logText.length ? liveText : logText;
    list[lastAsstIdx] = { ...cur, contenido, isStreaming: true };
    return list;
  }

  return [
    ...list,
    {
      idMsg: "stream-live",
      rol: "assistant",
      contenido: liveText,
      fecha: "",
      esUsuario: false,
      esOperativa: false,
      meta: null,
      isStreaming: true,
    },
  ];
}

export function buildOptimisticUserMsg({
  text,
  imagenes,
  userName,
}: {
  text?: string;
  imagenes?: string[];
  userName?: string;
}): ChatMensajeVista {
  const imgs = (imagenes || []).filter(Boolean);
  return {
    idMsg: `pending-user-${Date.now()}`,
    rol: "user",
    contenido: text || (imgs.length ? "(imagen adjunta)" : ""),
    fecha: formatTs(new Date()),
    esUsuario: true,
    esOperativa: false,
    meta: userName ? { nombre_usuario: userName } : null,
    nombreUsuario: userName || undefined,
    imagenes: imgs.length ? imgs : undefined,
  };
}
