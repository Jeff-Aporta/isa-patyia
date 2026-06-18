import { logToMensajesVista, resolveOpenAiMensajeText } from "../../core/convLog.ts";

export function formatTs(v) {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v).slice(0, 16) : d.toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
}

export function resolveUserName(msg, fallbackUserName) {
  const meta = msg?.meta;
  return (
    meta?.nombre_usuario
    || meta?.prompt_variables?.nombre_usuario
    || fallbackUserName
    || ""
  );
}

export function fechaHoraToEpochSeconds(fh) {
  if (fh == null || fh === "") return undefined;
  if (typeof fh === "number" && Number.isFinite(fh)) {
    const n = fh > 1e12 ? Math.floor(fh / 1000) : Math.floor(fh);
    return n > 0 ? n : undefined;
  }
  const d = Date.parse(String(fh).trim());
  if (Number.isNaN(d)) return undefined;
  return Math.floor(d / 1000);
}

function butilToCalificacion(butil) {
  if (butil === undefined || butil === null) return undefined;
  return butil === true || butil === 1 || butil === "1" ? 1 : 0;
}

/** Imágenes del mensaje OpenAI: campo top-level; meta solo respaldo legacy. */
export function resolveMensajeImagenes(m) {
  if (Array.isArray(m?.imagenes) && m.imagenes.length) {
    return m.imagenes.filter(Boolean);
  }
  const meta = m?.meta;
  if (!meta || typeof meta !== "object") return undefined;
  const others = meta.others;
  if (others && typeof others === "object" && Array.isArray(others.imagenes_adjuntas) && others.imagenes_adjuntas.length) {
    return others.imagenes_adjuntas.filter(Boolean);
  }
  return undefined;
}

function findCalificadoForMsg(calificados, { imensaje, contenido }) {
  const rated = (calificados || []).map((c) => ({
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

export function attachCalificacionesToVista(vista, openAiMsgs, calificados) {
  let oi = 0;
  return (vista || []).map((v) => {
    if (v.esUsuario || v.esOperativa) return v;
    const msgs = openAiMsgs || [];
    let raw;
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

export function attachCalificacionesOnly(vista, calificados) {
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

export function countLogAssistants(log) {
  return (log?.mensajes || []).filter((m) => String(m.role) === "assistant").length;
}

export function countOpenAiAssistants(detail) {
  return (detail?.mensajesOpenAI || []).filter(
    (m) => String(m.autor || "").toLowerCase().includes("asistente"),
  ).length;
}

export function openAiFallbackVista(mensajes, fallbackUserName) {
  return (mensajes || []).map((m, i) => {
    const isUser = String(m.autor || "").toLowerCase().includes("usuario");
    const nombreUsuario = isUser ? resolveUserName(m, fallbackUserName) : "";
    let meta = m.meta && typeof m.meta === "object" ? { ...m.meta } : null;
    if (isUser && nombreUsuario) {
      meta = meta ? { ...meta, nombre_usuario: meta.nombre_usuario || nombreUsuario } : { nombre_usuario: nombreUsuario };
    }
    const contenido = resolveOpenAiMensajeText(m);
    const fechaRaw = m.fecha_hora || meta?.ts || "";
    const imensaje = Number(m.imensaje) || undefined;
    const imagenes = resolveMensajeImagenes(m);
    return {
      idMsg: imensaje ? `msg-${imensaje}` : `openai-${i}`,
      rol: isUser ? "user" : "assistant",
      contenido,
      fecha: formatTs(fechaRaw),
      esUsuario: isUser,
      esOperativa: false,
      meta,
      nombreUsuario: nombreUsuario || undefined,
      ...(imensaje ? { imensaje } : {}),
      ...(imagenes?.length ? { imagenes } : {}),
    };
  });
}

export function enrichLogVista(mensajes, fallbackUserName) {
  return (mensajes || []).map((m) => {
    if (!m.esUsuario) return m;
    const name = m.nombreUsuario || m.meta?.nombre_usuario || m.meta?.prompt_variables?.nombre_usuario || fallbackUserName;
    if (!name) return m;
    return {
      ...m,
      nombreUsuario: name,
      meta: m.meta ? { ...m.meta, nombre_usuario: m.meta.nombre_usuario || name } : { nombre_usuario: name },
    };
  });
}

export function isEphemeralMsgId(idMsg) {
  if (!idMsg || idMsg === "stream-live") return true;
  const id = String(idMsg);
  return id.startsWith("pending-user-") || id.startsWith("assistant-final-");
}

export function mensajeVistaStableEqual(a, b) {
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
export function mergeMensajesVista(prev, next) {
  if (!next?.length) return prev || [];
  const prevById = new Map();
  for (const m of prev || []) {
    if (isEphemeralMsgId(m.idMsg) || m.isStreaming) continue;
    prevById.set(m.idMsg, m);
  }
  return next.map((m) => {
    const old = prevById.get(m.idMsg);
    return old && mensajeVistaStableEqual(old, m) ? old : m;
  });
}

export function vistaFromLogAndDetail(d, log, name) {
  if (!log?.mensajes?.length) return null;
  const rated = d?.mensajesCalificados || [];
  let vista = enrichLogVista(logToMensajesVista(log), name);
  if (d?.mensajesOpenAI?.length) {
    vista = attachCalificacionesToVista(vista, d.mensajesOpenAI, rated);
  } else if (rated.length) {
    vista = attachCalificacionesOnly(vista, rated);
  }
  return vista;
}

export function finalizeStreamInLog(mensajes, finalText) {
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

export function appendStreamMsg(mensajes, streamText, active) {
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

export function buildOptimisticUserMsg({ text, imagenes, userName }) {
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
