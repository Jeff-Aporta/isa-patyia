/**
 * Parser de conv-*.json / CONVERSACION_LOG — portado de ISA-DOC readConvLog + convLogContent.
 * Uso offline en GH Pages; sin llamadas a PatyIA.
 */
(function (global) {
  "use strict";

  function pushImage(images, ref) {
    const n = String(ref ?? "").trim();
    if (n) images.push(n);
  }

  function collectContentPart(part, texts, images) {
    if (!part || typeof part !== "object") return;
    const type = String(part.type ?? "");
    if (type === "input_text") {
      const t = String(part.text ?? "").trim();
      if (t) texts.push(t);
      return;
    }
    if (type === "input_image") {
      if (typeof part.image_url === "string") pushImage(images, part.image_url);
      else if (typeof part.url === "string") pushImage(images, part.url);
      else if (typeof part.file_id === "string") {
        pushImage(images, `[file_id:${part.file_id}]`);
      }
    }
  }

  function collectUserTurn(turn, texts, images) {
    if (!turn || typeof turn !== "object") return;
    if (Array.isArray(turn.content)) {
      for (const part of turn.content) collectContentPart(part, texts, images);
    }
  }

  function extractUserVisionFromSendInput(input, fallbackText) {
    const fb = String(fallbackText ?? "").trim();
    if (typeof input === "string") {
      return { text: input.trim() || fb, images: [] };
    }
    const texts = [];
    const images = [];
    if (Array.isArray(input)) {
      for (const item of input) {
        if (typeof item === "string") {
          const t = item.trim();
          if (t) texts.push(t);
        } else {
          collectUserTurn(item, texts, images);
        }
      }
    } else {
      collectUserTurn(input, texts, images);
    }
    return { text: texts.join("\n\n").trim() || fb, images };
  }

  function formatContenidoConImagenes(texto, imagenes) {
    if (!imagenes.length) return texto;
    const imgs = imagenes.map((src, i) => {
      if (src.startsWith("data:") || /^https?:\/\//i.test(src)) {
        return `![Adjunto ${i + 1}](${src})`;
      }
      return `> 📎 ${src}`;
    }).join("\n\n");
    return texto ? `${texto}\n\n${imgs}` : imgs;
  }

  function userContenidoFromConvLogSend(send, fallbackText) {
    if (!send) return String(fallbackText ?? "");
    const rawInput = send.input ?? send.text;
    const fb = typeof send.text === "string" ? send.text : fallbackText;
    const { text, images } = extractUserVisionFromSendInput(rawInput, fb);
    return formatContenidoConImagenes(text, images);
  }

  function textFromOpenAIReceive(rec) {
    if (!rec) return "";
    const output = rec.output;
    if (Array.isArray(output)) {
      return output
        .filter((o) => o && typeof o === "object" && o.type === "message")
        .flatMap((o) => {
          const content = o.content;
          if (!Array.isArray(content)) return [];
          return content
            .filter((c) => c && typeof c === "object" && c.type === "output_text")
            .map((c) => String(c.text ?? ""));
        })
        .join("");
    }
    const choices = rec.choices;
    if (Array.isArray(choices)) {
      return choices.map((c) => String(c.message?.content ?? "")).join("");
    }
    return typeof rec.text === "string" ? rec.text : "";
  }

  function tokensFromUsage(usage) {
    if (!usage || typeof usage !== "object") return undefined;
    const input = Number(usage.input_tokens ?? usage.prompt_tokens ?? 0) || 0;
    const cached = Number(
      usage.input_tokens_details?.cached_tokens
      ?? usage.prompt_tokens_details?.cached_tokens
      ?? 0,
    ) || 0;
    const output = Number(usage.output_tokens ?? usage.completion_tokens ?? 0) || 0;
    const reasoning = Number(
      usage.output_tokens_details?.reasoning_tokens
      ?? usage.completion_tokens_details?.reasoning_tokens
      ?? 0,
    ) || 0;
    const total = Number(usage.total_tokens ?? 0) || input + output;
    if (!total && !input && !output) return undefined;
    return { input, cached, output, reasoning, total };
  }

  function ordenarMensajesConvLog(mensajes) {
    if (!mensajes.length) return [];
    const byTurno = new Map();
    const sinTurno = [];

    for (const m of mensajes) {
      const t = m.turno;
      if (t == null || t <= 0) {
        sinTurno.push(m);
        continue;
      }
      if (!byTurno.has(t)) byTurno.set(t, []);
      byTurno.get(t).push(m);
    }

    const out = [];
    for (const t of [...byTurno.keys()].sort((a, b) => a - b)) {
      const g = byTurno.get(t);
      const users = g.filter((m) => m.role === "user");
      const ops = g.filter((m) => m.role === "operativa").sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0));
      const assistants = g.filter((m) => m.role === "assistant");
      out.push(...users, ...ops, ...assistants);
    }

    if (sinTurno.length) {
      sinTurno.sort((a, b) => String(a.ts ?? "").localeCompare(String(b.ts ?? "")));
      out.push(...sinTurno);
    }
    return out;
  }

  function flattenConvLogMensaje(m) {
    const s = m.send;
    const r = m.receive;
    const o = m.others ?? {};
    const flat = {
      ts: m.ts,
      tokens: m.tokens,
      usage: r?.usage,
      latency_ms: m.latency_ms,
      send: s,
      receive: r,
      others: m.others,
    };

    if (m.role === "user") {
      const { text, images } = extractUserVisionFromSendInput(s?.input, typeof s?.text === "string" ? s.text : "");
      if (text) {
        flat.text = text;
        flat.prompt_text = text;
      }
      if (images.length) flat.imagenes = images;
      const prompt = s?.prompt;
      if (prompt?.id) flat.prompt_id = prompt.id;
      if (prompt?.variables) flat.prompt_variables = prompt.variables;
      if (o.vector_store_ids) flat.vectorStoreIds = o.vector_store_ids;
    } else if (m.role === "operativa") {
      if (o.operativa_key) flat.operativa_key = o.operativa_key;
      if (o.operativa_engine) flat.operativa_engine = o.operativa_engine;
      const txt = textFromOpenAIReceive(r);
      if (txt) flat.text = txt;
      if (typeof r?.model === "string") flat.model = r.model;
    } else if (m.role === "assistant") {
      const txt = o.response_text ?? textFromOpenAIReceive(r);
      if (txt) {
        flat.text = txt;
        flat.response_text = txt;
      }
      if (typeof r?.model === "string") flat.model = r.model;
      if (typeof r?.id === "string") flat.response_id = r.id;
      if (o.engine) flat.engine = o.engine;
    }

    if (o.itdconsulta) flat.itdconsulta = o.itdconsulta;
    if (o.nombre_usuario) flat.nombre_usuario = o.nombre_usuario;
    if (o.stream_ok === false) flat.stream_ok = false;
    if (o.stream_error) flat.stream_error = o.stream_error;
    if (o.nombre_usado_en_respuesta !== undefined) flat.nombre_usado_en_respuesta = o.nombre_usado_en_respuesta;
    if (o.modelo_configurado) flat.modelo_configurado = o.modelo_configurado;
    if (o.prompt_id && !flat.prompt_id) flat.prompt_id = o.prompt_id;
    if (o.premisas) flat.premisas = o.premisas;
    return flat;
  }

  function normalizeMeta(raw) {
    if (!raw || typeof raw !== "object") return null;
    const tokensRaw = raw.tokens;
    const tokens = tokensRaw?.total ? tokensRaw : tokensFromUsage(raw.usage) ?? tokensRaw;
    return {
      ts: typeof raw.ts === "string" ? raw.ts : undefined,
      nombre_usuario: typeof raw.nombre_usuario === "string" ? raw.nombre_usuario : undefined,
      nombre_usado_en_respuesta: typeof raw.nombre_usado_en_respuesta === "boolean" ? raw.nombre_usado_en_respuesta : undefined,
      itdconsulta: typeof raw.itdconsulta === "string" ? raw.itdconsulta : undefined,
      model: typeof raw.model === "string" ? raw.model : undefined,
      modelo_configurado: typeof raw.modelo_configurado === "string" ? raw.modelo_configurado : undefined,
      prompt_id: typeof raw.prompt_id === "string" ? raw.prompt_id : undefined,
      premisas: Array.isArray(raw.premisas) ? raw.premisas.map(String) : undefined,
      tokens,
      usage: raw.usage,
      response_id: typeof raw.response_id === "string" ? raw.response_id : undefined,
      prompt_variables: raw.prompt_variables,
      latency_ms: typeof raw.latency_ms === "number" ? raw.latency_ms : undefined,
      stream_ok: raw.stream_ok,
      stream_error: typeof raw.stream_error === "string" ? raw.stream_error : undefined,
      extra: raw.operativa_key
        ? {
            operativa_key: String(raw.operativa_key),
            operativa_engine: raw.operativa_engine != null ? String(raw.operativa_engine) : undefined,
          }
        : undefined,
    };
  }

  function formatearFecha(raw) {
    if (!raw) return "";
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(raw)) {
      const d = new Date(raw);
      if (!Number.isNaN(d.getTime())) {
        return d.toLocaleString("es-CO", { dateStyle: "short", timeStyle: "medium" });
      }
    }
    return raw;
  }

  function convLogToMsgVista(m, i) {
    const role = String(m.role ?? "assistant");
    const esOperativa = role === "operativa";
    const esUsuario = role === "user";
    const send = m.send;
    const receive = m.receive;
    const others = m.others ?? {};

    let contenido = "";
    if (role === "user") {
      contenido = userContenidoFromConvLogSend(send, String(send?.text ?? m.text ?? others.prompt_text ?? ""));
    } else {
      contenido = String(others.response_text ?? textFromOpenAIReceive(receive) ?? m.text ?? "");
    }

    const opKey = others.operativa_key ?? send?.key ?? m.operativa_key;
    const flat = m.send != null || m.receive != null ? flattenConvLogMensaje(m) : m;
    const meta = normalizeMeta(flat);

    return {
      idMsg: `${role}-${String(m.seq ?? i)}-${String(m.turno ?? 0)}`,
      rol: esOperativa ? `OP · ${String(opKey ?? "operativa")}` : esUsuario ? "user" : "assistant",
      contenido: contenido || (esUsuario ? "(mensaje usuario sin texto en log)" : ""),
      fecha: formatearFecha(String(m.ts ?? "")),
      esUsuario,
      esOperativa,
      meta,
      streamFailed: others.stream_ok === false,
      streamError: others.stream_error,
    };
  }

  function parseLogInput(raw) {
    const trimmed = String(raw ?? "").trim();
    if (!trimmed) throw new Error("Pega el contenido de conv-*.json o la respuesta del API /log.");
    const parsed = JSON.parse(trimmed);
    if (parsed.log && Array.isArray(parsed.log.mensajes)) {
      return {
        iconversacion: parsed.log.iconversacion ?? parsed.iconversacion,
        mensajes: parsed.log.mensajes,
        resumen: parsed.log.resumen,
      };
    }
    if (Array.isArray(parsed.mensajes)) {
      return {
        iconversacion: parsed.iconversacion,
        mensajes: parsed.mensajes,
        resumen: parsed.resumen,
      };
    }
    throw new Error("JSON inválido: se espera conv-*.json o { ok, log: { mensajes } }.");
  }

  function logToMensajesVista(log) {
    const ordenados = ordenarMensajesConvLog(log.mensajes ?? []);
    return ordenados.map(convLogToMsgVista);
  }

  global.PatyConvLog = {
    parseLogInput,
    logToMensajesVista,
    ordenarMensajesConvLog,
    convLogToMsgVista,
    tokensFromUsage,
    normalizeMeta,
  };
})(window);
