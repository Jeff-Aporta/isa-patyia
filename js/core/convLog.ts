/**
 * Parser de conv-*.json / CONVERSACION_LOG — portado de ISA-DOC readConvLog + convLogContent.
 * Uso offline en GH Pages; sin llamadas a PatyIA.
 */
function pushImage(images: string[], ref: unknown) {
    const n = String(ref ?? "").trim();
    if (n && !isOmittedVisionRef(n)) images.push(n);
  }

  function isOmittedVisionRef(ref) {
    return /^\[(?:image_url omitido del log|base64 omitido)/i.test(String(ref ?? "").trim());
  }

  function isDisplayableImageRef(ref) {
    const n = String(ref ?? "").trim();
    if (!n || isOmittedVisionRef(n)) return false;
    return n.startsWith("data:") || /^https?:\/\//i.test(n);
  }

  function stripOmittedVisionFromText(texto) {
    return String(texto ?? "")
      .split("\n")
      .filter((line) => {
        const t = line.trim();
        if (!t) return true;
        if (isOmittedVisionRef(t)) return false;
        if (/^>\s*📎\s*\[(?:image_url omitido|base64 omitido)/i.test(t)) return false;
        return true;
      })
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function mergeUserImagenes(send, others, fallbackText) {
    const fb = typeof send?.text === "string" ? send.text : fallbackText;
    const { text, images } = extractUserVisionFromSendInput(send?.input ?? send?.text, fb);
    const adj = Array.isArray(others?.imagenes_adjuntas)
      ? others.imagenes_adjuntas.filter(isDisplayableImageRef)
      : [];
    const fromSend = images.filter(isDisplayableImageRef);
    const seen = new Set();
    const imagenes = [];
    for (const u of [...adj, ...fromSend]) {
      const n = String(u).trim();
      if (n && !seen.has(n)) {
        seen.add(n);
        imagenes.push(n);
      }
    }
    return { text: stripOmittedVisionFromText(text), imagenes };
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
      else if (part.image_url && typeof part.image_url === "object" && typeof part.image_url.url === "string") {
        pushImage(images, part.image_url.url);
      }
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
    const usable = (imagenes || []).filter(isDisplayableImageRef);
    if (!usable.length) return texto;
    const imgs = usable.map((src, i) => `![Adjunto ${i + 1}](${src})`).join("\n\n");
    return texto ? `${texto}\n\n${imgs}` : imgs;
  }

  function userContenidoFromConvLogSend(send, fallbackText) {
    if (!send) return String(fallbackText ?? "");
    const rawInput = send.input ?? send.text;
    const fb = typeof send.text === "string" ? send.text : fallbackText;
    const { text, images } = extractUserVisionFromSendInput(rawInput, fb);
    return formatContenidoConImagenes(text, images);
  }

  function dedupeAssistantText(text) {
    const t = String(text || "").trim();
    if (!t) return t;
    const len = t.length;
    if (len >= 2 && len % 2 === 0 && t.slice(0, len / 2) === t.slice(len / 2)) return t.slice(0, len / 2);
    return t;
  }

  function textFromOpenAIReceive(rec) {
    if (!rec) return "";
    const direct = dedupeAssistantText(rec.output_text);
    if (direct) return direct;
    const output = rec.output;
    if (Array.isArray(output)) {
      const messages = output.filter((o) => o && typeof o === "object" && o.type === "message");
      if (!messages.length) return "";
      const last = messages[messages.length - 1];
      const content = last.content;
      if (!Array.isArray(content)) return "";
      const text = content
        .filter((c) => c && typeof c === "object" && c.type === "output_text")
        .map((c) => String(c.text ?? ""))
        .join("");
      return dedupeAssistantText(text);
    }
    const choices = rec.choices;
    if (Array.isArray(choices)) {
      return choices.map((c) => String(c.message?.content ?? "")).join("");
    }
    return typeof rec.text === "string" ? rec.text : "";
  }

  function normalizePromptText(text) {
    if (text == null) return "";
    if (Array.isArray(text)) return text.map((part) => String(part ?? "")).join("\n").replace(/\r\n/g, "\n");
    return String(text).replace(/\r\n/g, "\n");
  }

  function extractInputText(input) {
    if (typeof input === "string") return normalizePromptText(input);
    if (!Array.isArray(input)) return "";
    return input.map((turn) => {
      if (typeof turn === "string") return normalizePromptText(turn);
      if (!turn || typeof turn !== "object") return "";
      if (typeof turn.content === "string") return normalizePromptText(turn.content);
      if (Array.isArray(turn.content)) {
        return turn.content.map((part) => {
          if (typeof part === "string") return part;
          if (part && typeof part === "object") {
            if (part.type === "input_text" || part.type === "output_text") return String(part.text ?? "");
            if ("text" in part) return String(part.text ?? "");
          }
          return "";
        }).filter(Boolean).join("\n");
      }
      return "";
    }).filter(Boolean).join("\n\n");
  }

  /** Separador legacy cuando el template no tiene {{instruccion_tipo}} (UlPrompts.ts). */
  const INSTRUCTION_CONCAT_SEP = /\n\n---\n\n/;

  function extractUserTextFromConvSend(send) {
    if (!send || typeof send !== "object") return "";
    const input = send.input;
    if (typeof input === "string") return input.trim();
    if (!Array.isArray(input)) return "";
    return input.flatMap((turn) => {
      if (!turn || typeof turn !== "object" || turn.role !== "user") return [];
      const content = turn.content;
      if (typeof content === "string") return [content];
      if (!Array.isArray(content)) return [];
      return content.map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && "text" in part) return String(part.text ?? "");
        return "";
      }).filter(Boolean);
    }).join("\n").trim();
  }

  function extractAssistantTextFromConvReceive(receive) {
    if (!receive || typeof receive !== "object") return "";
    const direct = String(receive.output_text ?? "").trim();
    if (direct) return direct;
    const output = receive.output;
    if (!Array.isArray(output)) return "";
    const messages = output.filter((o) => o && typeof o === "object" && o.type === "message");
    if (!messages.length) return "";
    const last = messages[messages.length - 1];
    const content = last.content;
    if (!Array.isArray(content)) return "";
    return content
      .filter((c) => c && typeof c === "object" && c.type === "output_text")
      .map((c) => String(c.text ?? ""))
      .join("")
      .trim();
  }

  /** Resuelve texto visible de un ítem mensajesOpenAI (API PatyIA). */
  function resolveOpenAiMensajeText(m) {
    const direct = String(m?.mensaje ?? "").trim();
    if (direct) return direct;
    const meta = m?.meta && typeof m.meta === "object" ? m.meta : null;
    if (!meta) return "";
    const isUser = String(m?.autor ?? "").toLowerCase().includes("usuario") || meta.role === "user";
    if (isUser) {
      const fromSend = extractUserTextFromConvSend(meta.send);
      if (fromSend) return fromSend;
      const input = meta.send?.input;
      if (typeof input === "string" && input.trim()) return input.trim();
      return String(meta.text ?? meta.prompt_text ?? "").trim();
    }
    const fromReceive = extractAssistantTextFromConvReceive(meta.receive);
    if (fromReceive) return fromReceive;
    const others = meta.others && typeof meta.others === "object" ? meta.others : null;
    const fromOthers = String(others?.response_text ?? "").trim();
    if (fromOthers) return fromOthers;
    return String(meta.response_text ?? meta.text ?? "").trim();
  }

  function instructionsUseInlineTipoSlot(text) {
    const body = String(text ?? "").trim();
    return Boolean(body && !INSTRUCTION_CONCAT_SEP.test(body));
  }

  function extractPromptSections(send) {
    if (!send || typeof send !== "object") return [];
    const sections = [];
    const seen = new Set();
    const instrRaw = typeof send.instructions === "string" ? normalizePromptText(send.instructions).trim() : "";
    const inlineTipoSlot = instructionsUseInlineTipoSlot(instrRaw);

    function push(key, label, text) {
      const normalized = normalizePromptText(text).trim();
      if (!normalized || seen.has(normalized)) return;
      seen.add(normalized);
      sections.push({ key, label, text: normalized });
    }

    if (instrRaw) {
      push("instructions", "Instructions", send.instructions);
    }

    const prompt = send.prompt;
    if (prompt && typeof prompt === "object") {
      const vars = prompt.variables;
      if (vars && typeof vars === "object") {
        if (typeof vars.instrucion_tipo === "string" && vars.instrucion_tipo.trim()) {
          const tipoText = vars.instrucion_tipo.trim();
          const embedded = instrRaw && instrRaw.includes(tipoText);
          if (!inlineTipoSlot && !embedded) {
            push("instrucion_tipo", "Instrucción tipo", tipoText);
          }
        }
        const generalParts = [];
        if (typeof vars.nombre_usuario === "string" && vars.nombre_usuario.trim()) {
          generalParts.push(`nombre_usuario: ${vars.nombre_usuario.trim()}`);
        }
        if (generalParts.length) {
          push("prompt-variables", "Variables prompt", generalParts.join("\n"));
        }
      }
      if (typeof prompt.id === "string" && /^pmpt_/i.test(prompt.id.trim())) {
        push("prompt-template-legacy", "Template OpenAI (legacy)", prompt.id.trim());
      }
    }

    if (Array.isArray(send.messages)) {
      send.messages.forEach((msg, i) => {
        if (!msg || typeof msg !== "object") return;
        const role = String(msg.role || "message");
        push(`message-${i}-${role}`, role, msg.content);
      });
    }

    const inputText = extractInputText(send.input);
    if (inputText.trim()) push("input", "Input", inputText);

    if (typeof send.content === "string") {
      push("content", "Content", send.content);
    }

    return sections;
  }

  function splitInstructionParts(text, meta) {
    const body = String(text ?? "").trim();
    if (!body) return [];

    const chunks = body.split(INSTRUCTION_CONCAT_SEP).map((c) => c.trim()).filter(Boolean);
    const tipoName = String(meta?.itdconsulta ?? "").trim() || "Instrucción tipo";

    if (chunks.length <= 1) {
      return [{ key: "general", name: "GENERAL", kind: "general", text: body }];
    }

    return chunks.map((chunk, index) => ({
      key: index === 0 ? "general" : `tipo-${index}`,
      name: index === 0 ? "GENERAL" : (index === 1 ? tipoName : `${tipoName} #${index}`),
      kind: index === 0 ? "general" : "tipo",
      text: chunk,
    }));
  }

  function resolvePromptSectionsForDisplay(sections, meta) {
    const list = sections || [];
    const instrSection = list.find((s) => {
      const key = String(s?.key ?? "");
      const label = String(s?.label ?? "").toLowerCase();
      return key === "instructions" || label === "instructions";
    });
    const instrText = String(instrSection?.text ?? "");
    const useInlineTipoSlot = instructionsUseInlineTipoSlot(instrText);
    const hasInstructions = Boolean(instrSection);
    const out = [];

    for (const section of list) {
      const key = String(section?.key ?? "");
      const labelLower = String(section?.label ?? "").toLowerCase();

      if (key === "instructions" || labelLower === "instructions") {
        if (useInlineTipoSlot) {
          out.push({
            ...section,
            isInstructionPart: false,
            suppressLabel: true,
          });
        } else {
          for (const part of splitInstructionParts(section.text, meta)) {
            out.push({
              key: `instruction-${part.key}`,
              label: part.name,
              instructionName: part.name,
              instructionKind: part.kind,
              text: part.text,
              isInstructionPart: true,
            });
          }
        }
        continue;
      }

      if (key === "instrucion_tipo" || labelLower === "instrucción tipo") {
        if (useInlineTipoSlot) continue;
        const tipoText = String(section.text ?? "").trim();
        if (hasInstructions) {
          if (tipoText && instrText.includes(tipoText)) continue;
        }
        out.push({
          key: section.key,
          label: meta?.itdconsulta || section.label || "Instrucción tipo",
          instructionName: String(meta?.itdconsulta ?? "").trim() || String(section.label ?? "Instrucción tipo"),
          instructionKind: "tipo",
          text: section.text,
          isInstructionPart: true,
        });
        continue;
      }

      out.push({ ...section, isInstructionPart: false });
    }

    return out;
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
      cost: m.cost,
      usage: r?.usage,
      latency_ms: m.latency_ms,
      send: s,
      receive: r,
      others: m.others,
    };

    if (m.role === "user") {
      const { text, images } = extractUserVisionFromSendInput(s?.input, typeof s?.text === "string" ? s.text : "");
      if (text) {
        flat.text = stripOmittedVisionFromText(text);
        flat.prompt_text = flat.text;
      }
      const adj = Array.isArray(o.imagenes_adjuntas) ? o.imagenes_adjuntas.filter(isDisplayableImageRef) : [];
      const merged = [...adj, ...images.filter(isDisplayableImageRef)];
      const seen = new Set();
      const imagenes = [];
      for (const u of merged) {
        const n = String(u).trim();
        if (n && !seen.has(n)) {
          seen.add(n);
          imagenes.push(n);
        }
      }
      if (imagenes.length) flat.imagenes = imagenes;
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
    if (typeof o.prompt_chars === "number") flat.prompt_chars = o.prompt_chars;
    if (typeof o.response_chars === "number") flat.response_chars = o.response_chars;
    return flat;
  }

  function normalizeCost(cost) {
    if (!cost || typeof cost !== "object") return undefined;
    const input_usd = Number(cost.input_usd ?? 0) || 0;
    const cached_usd = Number(cost.cached_usd ?? 0) || 0;
    const output_usd = Number(cost.output_usd ?? 0) || 0;
    const total_usd = Number(cost.total_usd ?? 0) || input_usd + cached_usd + output_usd;
    return { input_usd, cached_usd, output_usd, total_usd };
  }

  const ZERO_TOKENS = { input: 0, cached: 0, output: 0, reasoning: 0, total: 0 };
  const ZERO_COST = { input_usd: 0, cached_usd: 0, output_usd: 0, total_usd: 0 };

  function readMessageTokens(msg) {
    const meta = msg?.meta;
    if (!meta) return { ...ZERO_TOKENS };
    const tk = meta.tokens?.total != null ? meta.tokens : tokensFromUsage(meta.usage);
    if (!tk) return { ...ZERO_TOKENS };
    return {
      input: Number(tk.input ?? 0) || 0,
      cached: Number(tk.cached ?? 0) || 0,
      output: Number(tk.output ?? 0) || 0,
      reasoning: Number(tk.reasoning ?? 0) || 0,
      total: Number(tk.total ?? 0) || 0,
    };
  }

  function readMessageCost(msg) {
    return normalizeCost(msg?.meta?.cost) ?? { ...ZERO_COST };
  }

  function accumulateTokens(acc, tk) {
    return {
      input: acc.input + tk.input,
      cached: acc.cached + tk.cached,
      output: acc.output + tk.output,
      reasoning: acc.reasoning + tk.reasoning,
      total: acc.total + tk.total,
    };
  }

  function accumulateCost(acc, cost) {
    return {
      input_usd: acc.input_usd + cost.input_usd,
      cached_usd: acc.cached_usd + cost.cached_usd,
      output_usd: acc.output_usd + cost.output_usd,
      total_usd: acc.total_usd + cost.total_usd,
    };
  }

  function formatMoneyWithTokens(usd, tokenCount) {
    const m = formatUsageUsd(usd);
    const t = Number(tokenCount ?? 0) || 0;
    if (m === "—" && t <= 0) return "—";
    if (m === "—") return `(${t.toLocaleString("es-CO")}t)`;
    if (t <= 0) return m;
    return `${m} (${t.toLocaleString("es-CO")}t)`;
  }

  function formatUsageBreakdownParts(tokens, cost) {
    const tk = tokens || {};
    const c = cost || {};
    const labelFull = { in: "Input", cache: "Cache", out: "Output", total: "Total" };
    const parts = [
      { key: "in", label: "in", usd: Number(c.input_usd ?? 0) || 0, tok: Number(tk.input ?? 0) || 0 },
      { key: "cache", label: "cache", usd: Number(c.cached_usd ?? 0) || 0, tok: Number(tk.cached ?? 0) || 0 },
      { key: "out", label: "out", usd: Number(c.output_usd ?? 0) || 0, tok: Number(tk.output ?? 0) || 0 },
    ];
    const totalUsd = Number(c.total_usd ?? 0) || parts.reduce((s, p) => s + p.usd, 0);
    const totalTok = Number(tk.total ?? 0) || 0;
    parts.push({ key: "total", label: "Σ", usd: totalUsd, tok: totalTok });
    return parts.map((p) => ({
      key: p.key,
      label: p.label,
      labelFull: labelFull[p.key] || p.label,
      usd: p.usd,
      tok: p.tok,
      usdText: formatUsageUsd(p.usd),
      tokText: p.tok > 0 ? `${formatUsageTokens(p.tok)} t` : "—",
      display: formatMoneyWithTokens(p.usd, p.tok),
      hasData: p.usd > 0 || p.tok > 0,
    }));
  }

  function formatUsageSummary(tokens, cost) {
    const tk = tokens || {};
    const c = cost || {};
    const totalTok = Number(tk.total ?? 0) || 0;
    const totalUsd = Number(c.total_usd ?? 0)
      || (Number(c.input_usd ?? 0) + Number(c.cached_usd ?? 0) + Number(c.output_usd ?? 0))
      || 0;
    return {
      tokens: totalTok,
      usd: totalUsd,
      tokensText: totalTok > 0 ? `${formatUsageTokens(totalTok)} t` : "—",
      usdText: formatUsageUsd(totalUsd),
      hasData: totalTok > 0 || totalUsd > 0,
    };
  }

  function formatUsageBreakdownLine(tokens, cost) {
    const parts = formatUsageBreakdownParts(tokens, cost);
    if (parts.every((p) => !p.hasData && p.display === "—")) return "—";
    return parts.map((p) => `${p.label} ${p.display}`).join(" · ");
  }

  function usageHasData(tokens, cost) {
    return (Number(tokens?.total ?? 0) || 0) > 0 || (Number(cost?.total_usd ?? 0) || 0) > 0;
  }

  function attachUsageStats(mensajes) {
    let cumulativeTokens = { ...ZERO_TOKENS };
    let cumulativeCost = { ...ZERO_COST };

    return (mensajes || []).map((m) => {
      const tokens = readMessageTokens(m);
      const cost = readMessageCost(m);
      const previousTokens = { ...cumulativeTokens };
      const previousCost = { ...cumulativeCost };
      cumulativeTokens = accumulateTokens(cumulativeTokens, tokens);
      cumulativeCost = accumulateCost(cumulativeCost, cost);

      return {
        ...m,
        usageStats: {
          tokens,
          cost,
          previousTokens,
          previousCost,
          cumulativeTokens: { ...cumulativeTokens },
          cumulativeCost: { ...cumulativeCost },
        },
      };
    });
  }

  function threadHasUsageStats(mensajes) {
    return (mensajes || []).some((m) => {
      const s = m.usageStats;
      if (!s) return false;
      return s.tokens.total > 0 || s.cost.total_usd > 0 || s.cumulativeTokens.total > 0 || s.cumulativeCost.total_usd > 0;
    });
  }

  function formatUsageTokens(n) {
    if (n == null || !Number.isFinite(n) || n <= 0) return "—";
    return n.toLocaleString("es-CO");
  }

  function formatUsageUsd(n) {
    if (n == null || !Number.isFinite(n) || n <= 0) return "—";
    if (n >= 0.01) return `$${n.toFixed(4)}`;
    if (n >= 0.0001) return `$${n.toFixed(6)}`;
    return `$${n.toFixed(8)}`;
  }

  function formatTokensWithUsd(tok, usd) {
    const t = Number(tok ?? 0) || 0;
    const u = Number(usd ?? 0) || 0;
    const tokStr = t.toLocaleString("es-CO");
    const usdStr = formatUsageUsd(u);
    return `${tokStr} (${usdStr})`;
  }

  function formatLatencySeconds(latencyMs) {
    const ms = Number(latencyMs);
    if (!Number.isFinite(ms) || ms <= 0) return "";
    return `${(ms / 1000).toFixed(2)} s`;
  }

  function normalizeMeta(raw, options = {}) {
    if (!raw || typeof raw !== "object") return null;
    const isUser = options.isUser === true;
    const tokensRaw = raw.tokens;
    const tokens = tokensRaw?.total ? tokensRaw : tokensFromUsage(raw.usage) ?? tokensRaw;
    const cost = normalizeCost(raw.cost);
    return {
      ts: typeof raw.ts === "string" ? raw.ts : undefined,
      nombre_usuario: typeof raw.nombre_usuario === "string" ? raw.nombre_usuario : undefined,
      nombre_usado_en_respuesta: typeof raw.nombre_usado_en_respuesta === "boolean" ? raw.nombre_usado_en_respuesta : undefined,
      itdconsulta: typeof raw.itdconsulta === "string" ? raw.itdconsulta : undefined,
      model: typeof raw.model === "string" ? raw.model : undefined,
      modelo_configurado: typeof raw.modelo_configurado === "string" ? raw.modelo_configurado : undefined,
      prompt_id: isUser ? undefined : (typeof raw.prompt_id === "string" ? raw.prompt_id : undefined),
      premisas: Array.isArray(raw.premisas) ? raw.premisas.map(String) : undefined,
      tokens,
      cost,
      usage: raw.usage,
      response_id: typeof raw.response_id === "string" ? raw.response_id : undefined,
      prompt_variables: raw.prompt_variables,
      latency_ms: typeof raw.latency_ms === "number" ? raw.latency_ms : undefined,
      prompt_chars: isUser ? undefined : (typeof raw.prompt_chars === "number" ? raw.prompt_chars : undefined),
      response_chars: typeof raw.response_chars === "number" ? raw.response_chars : undefined,
      stream_ok: raw.stream_ok,
      stream_error: typeof raw.stream_error === "string" ? raw.stream_error : undefined,
      extra: raw.operativa_key
        ? {
            operativa_key: String(raw.operativa_key),
            operativa_engine: raw.operativa_engine != null ? String(raw.operativa_engine) : undefined,
          }
        : undefined,
      prompt_sections: isUser ? [] : extractPromptSections(raw.send),
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

  function convLogToMsgVista(m, i, userSendForTurn) {
    const role = String(m.role ?? "assistant");
    const esOperativa = role === "operativa";
    const esUsuario = role === "user";
    const send = m.send;
    const receive = m.receive;
    const others = m.others ?? {};

    let contenido = "";
    let imagenes = [];
    if (role === "user") {
      const merged = mergeUserImagenes(send, others, String(send?.text ?? m.text ?? others.prompt_text ?? ""));
      contenido = merged.text;
      imagenes = merged.imagenes;
    } else {
      contenido = dedupeAssistantText(String(others.response_text ?? textFromOpenAIReceive(receive) ?? m.text ?? ""));
    }

    const opKey = others.operativa_key ?? send?.key ?? m.operativa_key;
    const flat = m.send != null || m.receive != null ? flattenConvLogMensaje(m) : m;
    if (!esUsuario && !esOperativa && userSendForTurn && !flat.send) {
      flat.send = userSendForTurn;
    }
    const meta = normalizeMeta(flat, { isUser: esUsuario });
    const logImensaje = (() => {
      const turno = Number(m.turno);
      const seq = Number(m.seq);
      if (!Number.isFinite(turno) || turno <= 0 || !Number.isFinite(seq) || seq <= 0) return undefined;
      return turno * 1000 + seq;
    })();
    const logIreferencia = (() => {
      if (!m.ts) return undefined;
      const d = Date.parse(String(m.ts).trim());
      if (Number.isNaN(d)) return undefined;
      return Math.floor(d / 1000);
    })();

    return {
      idMsg: logImensaje ? `msg-${logImensaje}` : `${role}-${String(m.seq ?? i)}-${String(m.turno ?? 0)}`,
      rol: esOperativa ? `OP · ${String(opKey ?? "operativa")}` : esUsuario ? "user" : "assistant",
      contenido: contenido || (esUsuario && !imagenes.length ? "(mensaje usuario sin texto en log)" : contenido),
      imagenes: imagenes.length ? imagenes : undefined,
      fecha: formatearFecha(String(m.ts ?? "")),
      esUsuario,
      esOperativa,
      meta,
      streamFailed: others.stream_ok === false,
      streamError: others.stream_error,
      ...(logImensaje ? { imensaje: logImensaje } : {}),
      ...(!esUsuario && !esOperativa && logIreferencia ? { ireferencia: logIreferencia } : {}),
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
    const sendByTurno = new Map();
    for (const m of ordenados) {
      if (String(m.role) === "user" && m.send && m.turno != null) {
        sendByTurno.set(m.turno, m.send);
      }
    }
    let lastUserSend = null;
    return attachUsageStats(ordenados.map((m, i) => {
      if (String(m.role) === "user" && m.send) lastUserSend = m.send;
      const userSend = m.turno != null ? (sendByTurno.get(m.turno) ?? lastUserSend) : lastUserSend;
      return convLogToMsgVista(m, i, userSend);
    }));
  }

export {
  resolveOpenAiMensajeText,
  parseLogInput,
  logToMensajesVista,
  ordenarMensajesConvLog,
  convLogToMsgVista,
  tokensFromUsage,
  normalizeMeta,
  extractPromptSections,
  splitInstructionParts,
  resolvePromptSectionsForDisplay,
  attachUsageStats,
  threadHasUsageStats,
  formatUsageTokens,
  formatUsageUsd,
  formatTokensWithUsd,
  formatUsageBreakdownLine,
  formatUsageBreakdownParts,
  formatUsageSummary,
  formatLatencySeconds,
  usageHasData,
};
