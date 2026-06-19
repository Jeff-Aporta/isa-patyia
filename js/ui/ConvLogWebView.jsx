/**
 * Presentación web del hilo CONVERSACION_LOG — estilo driver JSX de tickets (SectionCard, gradientes MUI).
 */
import { getReact, getMaterialUI } from "../core/platform.ts";
import { UI } from "../core/platform.ts";
import { mdToHtml, shortId, metaWorthDialog, instructionKeyFromMeta } from "./shared.jsx";
import { ImageLightboxDialog } from "./ImageLightboxDialog.jsx";
import { tokensFromUsage, attachUsageStats, threadHasUsageStats, sideLogPanelWorthShowing, formatUsageBreakdownParts, formatUsageSummary, formatLatencySeconds, formatTokensWithUsd, usageHasData } from "../core/convLog.ts";

const { useMemo, useState, useRef, useEffect, memo } = getReact();

function useOperativaEnterIds(mensajes, threadKey, { enabled = true } = {}) {
  const seenIdsRef = useRef(new Set());
  const primedKeyRef = useRef(null);
  const [enterIds, setEnterIds] = useState(() => new Set());

  useEffect(() => {
    if (primedKeyRef.current === threadKey) return;
    primedKeyRef.current = threadKey;
    seenIdsRef.current = new Set();
    setEnterIds(new Set());
  }, [threadKey]);

  useEffect(() => {
    if (!enabled) return;
    const msgs = mensajes || [];
    if (primedKeyRef.current !== threadKey) return;

    if (!seenIdsRef.current.size && msgs.length) {
      for (const m of msgs) seenIdsRef.current.add(m.idMsg);
      return;
    }

    const nextEnter = new Set();
    const newlySeen = [];
    for (const m of msgs) {
      if (seenIdsRef.current.has(m.idMsg)) continue;
      seenIdsRef.current.add(m.idMsg);
      newlySeen.push(m);
      if (m.esOperativa) nextEnter.add(m.idMsg);
    }
    // Varias piezas nuevas a la vez (p. ej. log completo tras stream): sin animación de entrada.
    if (nextEnter.size && newlySeen.length === 1) {
      setEnterIds((prev) => new Set([...prev, ...nextEnter]));
    }
  }, [mensajes, threadKey, enabled]);

  return enterIds;
}

const ROLE_META = {
  user: { icon: "mdi:account-outline", title: "Usuario", accent: "#1e90ff" },
  assistant: { icon: "mdi:robot-outline", title: "PatyIA", accent: "#10b981" },
  operativa: { icon: "mdi:cog-outline", title: "Operativa", accent: "#f59e0b" },
};

const ROLE_META_CHAT = {
  ...ROLE_META,
  operativa: { icon: "mdi:cog-sync-outline", title: "Operativa", accent: "#f59e0b" },
};

function roleMetaFor(msg, compactMeta) {
  const rk = roleKey(msg);
  const table = compactMeta ? ROLE_META_CHAT : ROLE_META;
  return table[rk] || ROLE_META.assistant;
}

function roleKey(msg) {
  if (msg.esOperativa) return "operativa";
  if (msg.esUsuario) return "user";
  return "assistant";
}

function roleTitle(msg, chatUserName) {
  if (msg.esOperativa) return msg.rol || "Operativa";
  if (msg.esUsuario) {
    const fromMsg = msg.nombreUsuario
      || msg.meta?.nombre_usuario
      || msg.meta?.prompt_variables?.nombre_usuario;
    if (fromMsg) return fromMsg;
    if (chatUserName) return chatUserName;
    return "Usuario";
  }
  return "PatyIA";
}

function SectionCard({ icon, title, accent, children, id, onMeta, metaChips, align = "left", muted = false, operativa = false, fecha, streaming = false, footerExtra = null, compact = false }) {
  const { Paper, Stack, Typography, Box, IconButton, Tooltip } = getMaterialUI();
  const { Icon } = UI;
  const color = accent || "#1e90ff";
  const isRight = align === "right";
  const softMuted = muted && !operativa;
  const fullNeon = !compact;

  return (
    <Paper
      id={id}
      className={[
        "conv-msg-card",
        streaming ? "conv-msg-card--streaming" : "",
        compact ? "conv-msg-card--compact" : "conv-msg-card--full",
        operativa ? "conv-msg-card--operativa" : "conv-msg-card--neon",
      ].filter(Boolean).join(" ")}
      elevation={0}
      sx={(theme) => {
        const isLight = theme.palette.mode === "light";
        const base = {
          borderRadius: fullNeon ? "0.75rem" : "0.5rem",
          overflow: "hidden",
          border: 1,
          scrollMarginTop: 12,
          width: fullNeon ? "fit-content" : "100%",
          maxWidth: "100%",
        };
        if (softMuted) {
          return {
            ...base,
            borderColor: theme.palette.action.disabled,
            bgcolor: theme.palette.action.hover,
            boxShadow: "none",
            transition: "none",
          };
        }
        if (isLight) {
          return {
            ...base,
            borderColor: `${color}52`,
            bgcolor: operativa ? "#fffbeb" : "#ffffff",
            boxShadow: "none",
            transition: "none",
          };
        }
        return {
          ...base,
          borderColor: `${color}40`,
          bgcolor: "background.paper",
          boxShadow: fullNeon
            ? `0 4px 24px rgba(0, 0, 0, 0.28), 0 0 0 1px ${color}28`
            : operativa
              ? `0 4px 20px ${color}18`
              : `0 4px 24px rgba(0, 0, 0, 0.22), 0 0 0 1px ${color}22`,
          transition: fullNeon ? "transform 0.2s ease, box-shadow 0.2s ease" : "none",
          ...(fullNeon ? {
            "&:hover": {
              transform: { sm: "translateY(-2px)" },
              boxShadow: `0 8px 32px rgba(0, 0, 0, 0.35), 0 0 24px ${color}22`,
            },
          } : {}),
        };
      }}
    >
      <Box
        className="conv-msg-card__header"
        sx={(theme) => {
          const isLight = theme.palette.mode === "light";
          const base = {
            px: compact ? { xs: 1.25, sm: 1.5 } : { xs: 2, sm: 2.5 },
            py: compact ? 1 : 1.5,
            borderBottom: 1,
            borderColor: "divider",
          };
          if (fullNeon) {
            if (isLight) {
              return {
                ...base,
                bgcolor: `${color}12`,
                ...(isRight
                  ? { borderRight: 4, borderRightColor: color }
                  : { borderLeft: 4, borderLeftColor: color }),
              };
            }
            return {
              ...base,
              background: isRight
                ? `linear-gradient(270deg, ${color}28, transparent 72%)`
                : `linear-gradient(90deg, ${color}28, transparent 72%)`,
              ...(isRight
                ? { borderRight: 4, borderRightColor: color }
                : { borderLeft: 4, borderLeftColor: color }),
            };
          }
          if (operativa) {
            return {
              ...base,
              bgcolor: isLight ? `${color}14` : undefined,
              background: isLight
                ? undefined
                : `linear-gradient(90deg, ${color}30, transparent 72%)`,
            };
          }
          if (isLight) {
            return {
              ...base,
              bgcolor: `${color}10`,
            };
          }
          return {
            ...base,
            background: isRight
              ? `linear-gradient(270deg, ${color}24, transparent 72%)`
              : `linear-gradient(90deg, ${color}24, transparent 72%)`,
          };
        }}
      >
        <Stack
          direction="row"
          spacing={1.25}
          alignItems="flex-start"
          flexWrap="wrap"
          useFlexGap
          sx={{ flexDirection: isRight ? "row-reverse" : "row" }}
        >
          <Stack
            direction="row"
            spacing={1.25}
            alignItems="flex-start"
            sx={{ flex: 1, minWidth: 0, flexDirection: isRight ? "row-reverse" : "row" }}
          >
            <Box
              className="conv-msg-card__icon"
              sx={(theme) => {
                const isLight = theme.palette.mode === "light";
                return {
                  width: compact ? 28 : 32,
                  height: compact ? 28 : 32,
                  borderRadius: fullNeon ? "0.5rem" : "0.375rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: operativa || !softMuted
                    ? `linear-gradient(135deg, ${color}, ${color}99)`
                    : `${color}88`,
                  color: "#fff",
                  boxShadow: isLight
                    ? "none"
                    : fullNeon
                      ? `0 4px 16px ${color}55`
                      : operativa || !softMuted ? `0 4px 14px ${color}44` : "none",
                  flexShrink: 0,
                  mt: 0.1,
                };
              }}
            >
              <Icon icon={icon} size={18} />
            </Box>
            <Box
              className={isRight ? "conv-msg-card__title conv-msg-card__title--right" : "conv-msg-card__title"}
              sx={{
                minWidth: 0,
                flex: 1,
                ...(isRight ? { pr: 1.25, textAlign: "right" } : { pl: 0 }),
              }}
            >
              <Typography
                variant={compact ? "body2" : "subtitle1"}
                sx={{
                  fontWeight: 700,
                  letterSpacing: -0.2,
                  lineHeight: 1.25,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  ...(isRight ? { pr: 0.5 } : {}),
                }}
              >
                {title}
              </Typography>
            </Box>
          </Stack>
          {onMeta && (
            <Tooltip title="Trazabilidad del mensaje" arrow>
              <IconButton size="small" onClick={onMeta} aria-label="Ver trazabilidad" sx={{ alignSelf: "flex-start", mt: -0.25 }}>
                <Icon icon="mdi:information-outline" size={20} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
        {metaChips ? (
          <Box className={`conv-msg-card__meta-row${isRight ? " conv-msg-card__meta-row--right" : ""}`}>
            {metaChips}
          </Box>
        ) : null}
      </Box>
      <Box sx={{ p: compact ? { xs: 1.25, sm: 1.5 } : { xs: 2, sm: 2.5 } }}>{children}</Box>
      {(fecha || footerExtra) ? (
        <Box
          className="conv-msg-card__footer"
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: 0.65,
            borderTop: 1,
            borderColor: "divider",
            bgcolor: softMuted ? "action.hover" : "transparent",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            useFlexGap
            gap={0.75}
            sx={{ flexDirection: align === "right" ? "row-reverse" : "row" }}
          >
            {footerExtra}
            {fecha ? (
              <Typography
                component="time"
                variant="caption"
                color="text.secondary"
                sx={{
                  fontSize: "0.68rem",
                  letterSpacing: "0.02em",
                  opacity: 0.85,
                  ml: align === "right" ? 0 : "auto",
                  mr: align === "right" ? "auto" : 0,
                  textAlign: align === "right" ? "right" : "left",
                }}
              >
                {fecha}
              </Typography>
            ) : null}
          </Stack>
        </Box>
      ) : null}
    </Paper>
  );
}

function modelBadgeLabel(raw, maxLen = 28) {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  return s.length > maxLen ? shortId(s, 16, 10) : s;
}

function visionAutoswitchBadge(meta) {
  if (!meta?.modelo_autoswitch_vision) return null;
  const configured = String(meta.modelo_configurado ?? "").trim();
  const used = String(meta.model ?? "").trim();
  if (!configured) {
    return {
      tag: "Visión",
      label: "autoswitch",
      title: used
        ? `Autoswitch visión activo · modelo usado: ${used}`
        : "Autoswitch visión por imágenes adjuntas",
    };
  }
  const label = modelBadgeLabel(configured);
  return {
    tag: "Config",
    label,
    title: used && configured !== used
      ? `Autoswitch visión: ${configured} → ${used}`
      : `Modelo configurado (${configured}); autoswitch visión por imágenes adjuntas`,
  };
}

function buildUsageDialogCtxItems(meta) {
  const latency = formatLatencySeconds(meta?.latency_ms);
  const items = [];
  if (meta?.ts) {
    items.push({ key: "ts", label: "ts", value: meta.ts, mono: true });
  }

  if (meta?.modelo_autoswitch_vision) {
    const from = String(meta.modelo_configurado ?? "").trim();
    const to = String(meta.model ?? "").trim();
    if (from && to) {
      items.push({
        key: "vision_sw",
        label: "autoswitch visión",
        value: from === to ? `${from} (sin cambio de modelo)` : `${from} → ${to}`,
        mono: true,
        wide: true,
        vision: true,
      });
    } else {
      if (from) {
        items.push({ key: "model_from", label: "modelo configurado", value: from, mono: true, vision: true });
      }
      if (to) {
        items.push({ key: "model_to", label: "modelo usado", value: to, mono: true, vision: true });
      }
      if (!from && !to) {
        items.push({
          key: "vision_sw",
          label: "autoswitch visión",
          value: "activo (imágenes adjuntas)",
          mono: false,
          wide: true,
          vision: true,
        });
      }
    }
  } else if (meta?.model) {
    items.push({ key: "model", label: "model", value: meta.model, mono: true });
  }

  if (latency) {
    items.push({ key: "latency", label: "latency", value: latency, mono: true });
  }
  if (meta?.itdconsulta) {
    items.push({ key: "itd", label: "itdconsulta", value: meta.itdconsulta, mono: true });
  }
  return items;
}

function compactMetaLabel(value, maxLen = 14) {
  const v = String(value ?? "").trim();
  if (!v) return v;
  if (v.length <= maxLen) return v;
  return `${v.slice(0, maxLen - 1)}…`;
}

const META_CHIP_TONE_CLASS = {
  context: "conv-msg-meta-chip--context",
  premisa: "conv-msg-meta-chip--premisa",
  operativa: "conv-msg-meta-chip--operativa",
  model: "conv-msg-meta-chip--model",
  metric: "conv-msg-meta-chip--metric",
  error: "conv-msg-meta-chip--error",
  vision: "conv-msg-meta-chip--vision",
  neutral: "",
};

function MetaBadge({ tag, label, tone = "neutral", title }) {
  const toneClass = META_CHIP_TONE_CLASS[tone] || "";
  return (
    <UsageSummaryChip
      tag={tag}
      label={compactMetaLabel(label)}
      title={title || label}
      className={`conv-msg-usage-chip conv-msg-meta-chip ${toneClass}`.trim()}
    />
  );
}

function MetaChipRow({ meta, isUser = false, hideUsageMetrics = false, align = "left" }) {
  if (!meta) return null;
  const tk = meta.tokens?.total ? meta.tokens : tokensFromUsage(meta.usage);
  const chips = [];

  if (meta.premisas?.length) {
    for (const p of meta.premisas) {
      chips.push({ key: `p-${p}`, label: p, tone: "premisa", title: `Premisa: ${p}` });
    }
  }
  if (meta.extra?.operativa_key) {
    chips.push({
      key: "op",
      label: meta.extra.operativa_key,
      tone: "operativa",
      title: `Consulta operativa: ${meta.extra.operativa_key}`,
    });
  }
  const instrKey = !isUser ? instructionKeyFromMeta(meta) : null;
  if (meta.itdconsulta) {
    chips.push({
      key: "itd",
      label: meta.itdconsulta,
      tone: "context",
      title: `itdconsulta: ${meta.itdconsulta}`,
    });
  }
  if (instrKey && instrKey !== meta.extra?.operativa_key && instrKey !== meta.itdconsulta) {
    chips.push({ key: "pmpt", label: instrKey, tone: "context", title: `Instrucción: ${instrKey}` });
  }
  if (!hideUsageMetrics && meta.model) {
    chips.push({
      key: "model",
      label: meta.model,
      tone: "model",
      title: meta.modelo_autoswitch_vision ? "Modelo usado (autoswitch visión)" : "Modelo LLM",
    });
  }
  if (!hideUsageMetrics && meta.modelo_autoswitch_vision) {
    const sw = visionAutoswitchBadge(meta);
    if (sw) {
      chips.push({ key: "vision-sw", label: sw.label, tone: "vision", title: sw.title });
    }
  }
  if (!hideUsageMetrics && meta.latency_ms != null && meta.latency_ms > 0) {
    chips.push({ key: "lat", label: `${meta.latency_ms}ms`, tone: "metric", title: "Latencia" });
  }
  if (!hideUsageMetrics && tk?.total > 0) {
    chips.push({ key: "tok", label: tk.total.toLocaleString("es-CO"), tone: "metric", title: `Tokens: ${tk.total}` });
  }
  if (meta.stream_ok === false) {
    chips.push({ key: "stream", label: "err", tone: "error", title: meta.stream_error || "Stream falló" });
  }

  if (!chips.length) return null;

  const { Stack } = getMaterialUI();
  return (
    <Stack
      direction="row"
      spacing={0.25}
      flexWrap="wrap"
      useFlexGap
      className="conv-msg-meta-chips"
      sx={{ justifyContent: align === "right" ? "flex-end" : "flex-start" }}
    >
      {chips.map((c) => (
        <MetaBadge key={c.key} tag={c.tag} label={c.label} tone={c.tone} title={c.title} />
      ))}
    </Stack>
  );
}

function MsgBody({ text, imagenes, audios, audiosTranscripcion, align = "left", onImageClick, streaming = false }) {
  const { Typography, Box } = getMaterialUI();
  const raw = String(text || "");
  const placeholderOnly = /^\((?:imagen adjunta|nota de voz)\)$/i.test(raw.trim());
  const hasText = Boolean(raw.trim()) && !placeholderOnly;
  const html = mdToHtml(raw);
  return (
    <>
      {streaming && !hasText && !audios?.length ? (
        <Box className="conv-stream-typing" aria-label="PatyIA está escribiendo" role="status">
          <span /><span /><span />
        </Box>
      ) : (
        <Box className={`conv-msg-body-wrap${streaming ? " conv-msg-body-wrap--streaming" : ""}`}>
          <Typography
            component="div"
            variant="body1"
            className={`conv-msg-body${streaming ? " conv-msg-body--streaming" : ""}`}
            sx={{
              lineHeight: 1.65,
              color: "text.primary",
              "& p": { m: 0, mb: 1.25 },
              "& p:last-child": { mb: 0 },
              "& a": { color: "primary.main", wordBreak: "break-word" },
              "& img": { maxWidth: "100%", borderRadius: "0.5rem", my: 1 },
              "& pre, & code": { fontFamily: '"IBM Plex Mono", monospace', fontSize: "0.85em" },
            }}
            dangerouslySetInnerHTML={{ __html: html }}
            onClick={(e) => {
              const img = e.target?.closest?.("img");
              if (img?.src && onImageClick) {
                e.preventDefault();
                onImageClick(img.src);
              }
            }}
          />
          {streaming && hasText ? <Box component="span" className="conv-stream-cursor" aria-hidden /> : null}
        </Box>
      )}
      {imagenes?.length > 0 && (
        <ConvMsgImages items={imagenes} align={align} onImageClick={onImageClick} />
      )}
      {audios?.length > 0 && (
        <ConvMsgAudios items={audios} transcriptions={audiosTranscripcion} align={align} />
      )}
    </>
  );
}

function ConvMsgAudios({ items, transcriptions, align = "right" }) {
  const { Box, Typography } = getMaterialUI();
  const renderable = (items || []).filter((src) => String(src || "").trim().startsWith("data:audio/") || /^https?:\/\//i.test(String(src || "").trim()));
  if (!renderable.length) return null;
  return (
    <Box
      className={`conv-msg-audios conv-msg-audios--${align}`}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        mt: 1.25,
        alignItems: align === "right" ? "flex-end" : "flex-start",
      }}
    >
      {renderable.map((src, idx) => (
        <Box key={`${idx}-${String(src).slice(0, 32)}`} className="conv-msg-audio-item">
          <audio controls preload="metadata" src={src} aria-label={`Nota de voz ${idx + 1}`} />
          {transcriptions?.[idx] ? (
            <Typography variant="caption" component="p" className="conv-msg-audio-transcript" sx={{ mt: 0.5, opacity: 0.85 }}>
              {transcriptions[idx]}
            </Typography>
          ) : null}
        </Box>
      ))}
    </Box>
  );
}

function ConvMsgImages({ items, align = "right", onImageClick }) {
  const { Box } = getMaterialUI();
  const renderable = (items || []).filter((src) => {
    const s = String(src || "").trim();
    if (/^\[file_id:/i.test(s)) return false;
    return s.startsWith("data:image/") || s.startsWith("http://") || s.startsWith("https://");
  });
  if (!renderable.length) return null;
  return (
    <Box
      className={`conv-msg-images conv-msg-images--${align}`}
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 1,
        mt: 1.25,
        justifyContent: align === "right" ? "flex-end" : "flex-start",
      }}
    >
      {renderable.map((src, idx) => (
        <button
          key={`${idx}-${src.slice(0, 32)}`}
          type="button"
          className="conv-msg-image-lightbox-btn"
          aria-label={`Ver imagen adjunta ${idx + 1} en tamaño completo`}
          onClick={() => onImageClick?.(src)}
        >
          <img src={src} alt={`Adjunto ${idx + 1}`} loading="lazy" />
        </button>
      ))}
    </Box>
  );
}

function UsageSummaryChip({ label, className = "", title, tag }) {
  const showVal = label != null && String(label).trim() !== "";
  return (
    <span className={className || "conv-msg-usage-chip"} title={title || (showVal ? label : tag)}>
      <span className="conv-msg-usage-chip__inner">
        {tag ? <span className="conv-msg-usage-chip__key">{tag}</span> : null}
        {showVal ? <span className="conv-msg-usage-chip__val">{label}</span> : null}
      </span>
    </span>
  );
}

function UsageBreakdownTable({ parts }) {
  const { Box, Typography } = getMaterialUI();
  return (
    <Box className="conv-usage-dialog__table" component="table">
      <Box component="thead">
        <Box component="tr">
          <Box component="th">Concepto</Box>
          <Box component="th">Tokens (USD)</Box>
        </Box>
      </Box>
      <Box component="tbody">
        {parts.map((part) => (
          <Box
            component="tr"
            key={part.key}
            className={part.hasData ? "" : "conv-usage-dialog__row--empty"}
          >
            <Box component="td">
              <Typography component="span" className="conv-usage-dialog__concept">
                {part.labelFull}
              </Typography>
              {part.key !== "total" && (
                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.75 }}>
                  ({part.label})
                </Typography>
              )}
            </Box>
            <Box component="td" className="conv-usage-dialog__mono conv-usage-dialog__val">
              {formatTokensWithUsd(part.tok, part.usd)}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function UsageDialogMetaPanel({ meta, tokens }) {
  const { Box } = getMaterialUI();
  const tk = tokens || {};
  const ctxItems = buildUsageDialogCtxItems(meta);

  const tokItems = [
    { key: "in", label: "in", value: Number(tk.input ?? 0) || 0 },
    { key: "cached", label: "cached", value: Number(tk.cached ?? 0) || 0 },
    { key: "out", label: "out", value: Number(tk.output ?? 0) || 0 },
    { key: "reason", label: "reason", value: Number(tk.reasoning ?? 0) || 0 },
    { key: "total", label: "total", value: Number(tk.total ?? 0) || 0 },
  ].filter((item) => item.key === "total" || item.key === "in" || item.key === "out" || item.value > 0);

  if (!ctxItems.length && !tokItems.length) return null;

  return (
    <Box className="conv-usage-dialog__meta">
      {ctxItems.length > 0 ? (
        <div className="conv-usage-dialog__ctx-grid">
          {ctxItems.map((item) => (
            <div
              key={item.key}
              className={[
                "conv-usage-dialog__ctx-item",
                item.wide ? "conv-usage-dialog__ctx-item--wide" : "",
                item.vision ? "conv-usage-dialog__ctx-item--vision" : "",
              ].filter(Boolean).join(" ") || undefined}
            >
              <span className="conv-usage-dialog__ctx-k">{item.label}</span>
              <span className={`conv-usage-dialog__ctx-v${item.mono ? " conv-usage-dialog__mono" : ""}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      ) : null}
      {tokItems.length > 0 ? (
        <div className="conv-usage-dialog__tok-grid">
          {tokItems.map((item) => (
            <div key={item.key} className="conv-usage-dialog__tok-item">
              <span className="conv-usage-dialog__tok-k">{item.label}</span>
              <span className="conv-usage-dialog__tok-v conv-usage-dialog__mono">{item.value.toLocaleString("es-CO")}</span>
            </div>
          ))}
        </div>
      ) : null}
    </Box>
  );
}

function UsageStatsDialog({ open, onClose, stats, msgLabel, fecha, meta }) {
  const { Dialog, DialogTitle, DialogContent, Typography, Box, Divider, Stack } = getMaterialUI();
  if (!stats) return null;

  const sections = [
    {
      key: "msg",
      title: "Mensaje",
      subtitle: "Costo y tokens de este turno",
      tokens: stats.tokens,
      cost: stats.cost,
      show: true,
    },
    {
      key: "prev",
      title: "Acumulado anterior",
      subtitle: "Suma del hilo antes de este mensaje",
      tokens: stats.previousTokens,
      cost: stats.previousCost,
      show: usageHasData(stats.previousTokens, stats.previousCost),
    },
    {
      key: "cum",
      title: "Total acumulado",
      subtitle: "Suma del hilo incluyendo este mensaje",
      tokens: stats.cumulativeTokens,
      cost: stats.cumulativeCost,
      show: usageHasData(stats.cumulativeTokens, stats.cumulativeCost),
    },
  ].filter((s) => s.show);

  const opKey = meta?.extra?.operativa_key;
  const showMetaPanel = Boolean(
    meta?.ts
    || meta?.model
    || meta?.modelo_autoswitch_vision
    || formatLatencySeconds(meta?.latency_ms)
    || meta?.itdconsulta
    || (Number(stats.tokens?.total ?? 0) > 0)
    || (Number(stats.tokens?.output ?? 0) > 0),
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" component="div" sx={{ fontSize: "1.05rem", fontWeight: 700 }}>
          Uso · {msgLabel || "Mensaje"}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 0.75 }}>
          {fecha ? (
            <Typography variant="caption" color="text.secondary">{fecha}</Typography>
          ) : null}
          {opKey ? (
            <Typography variant="caption" color="text.secondary">{fecha ? " · " : ""}{opKey}</Typography>
          ) : null}
        </Stack>
      </DialogTitle>
      <DialogContent dividers className="conv-usage-dialog">
        {showMetaPanel ? <UsageDialogMetaPanel meta={meta} tokens={stats.tokens} /> : null}
        {showMetaPanel && sections.length > 0 ? <Divider sx={{ my: 2 }} /> : null}
        {sections.map((section, idx) => (
          <Box key={section.key} sx={{ mb: idx < sections.length - 1 ? 2.5 : 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>
              {section.title}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.25 }}>
              {section.subtitle}
            </Typography>
            <UsageBreakdownTable parts={formatUsageBreakdownParts(section.tokens, section.cost)} />
            {idx < sections.length - 1 ? <Divider sx={{ mt: 2.5 }} /> : null}
          </Box>
        ))}
      </DialogContent>
    </Dialog>
  );
}

function UsageStatsColumn({ stats, align = "right", msgLabel, fecha, meta }) {
  const { Box } = getMaterialUI();
  const [open, setOpen] = useState(false);

  const modelRaw = String(meta?.model ?? "").trim();
  const modelLabel = modelRaw ? modelBadgeLabel(modelRaw) : "";
  const latencyLabel = formatLatencySeconds(meta?.latency_ms);
  const autoswitchBadge = visionAutoswitchBadge(meta);
  const metaTk = meta?.tokens?.total ? meta.tokens : tokensFromUsage(meta?.usage);
  const metaTokTotal = Number(metaTk?.total ?? 0) || 0;
  const metaTokLabel = metaTokTotal > 0 ? metaTokTotal.toLocaleString("es-CO") : "";
  const showMetaBadges = Boolean(modelLabel || latencyLabel || autoswitchBadge || metaTokLabel);

  const hasUsage = Boolean(
    stats
    && (usageHasData(stats.tokens, stats.cost) || usageHasData(stats.previousTokens, stats.previousCost)),
  );
  if (!showMetaBadges && !hasUsage) return null;

  const msgSummary = hasUsage ? formatUsageSummary(stats.tokens, stats.cost) : null;
  const prevSummary = hasUsage ? formatUsageSummary(stats.previousTokens, stats.previousCost) : null;
  const showPrev = hasUsage && usageHasData(stats.previousTokens, stats.previousCost);

  const groups = hasUsage
    ? [
      { key: "msg", label: "Mensaje", summary: msgSummary },
      ...(showPrev ? [{ key: "prev", label: "Acumulado", summary: prevSummary }] : []),
    ]
    : [];

  const openDialog = (e) => {
    if (!hasUsage) return;
    e?.stopPropagation?.();
    setOpen(true);
  };

  return (
    <>
      <Box
        className={[
          "conv-msg-usage-stats",
          `conv-msg-usage-stats--${align}`,
          hasUsage ? "conv-msg-usage-stats--clickable" : "",
        ].filter(Boolean).join(" ")}
        role={hasUsage ? "button" : undefined}
        tabIndex={hasUsage ? 0 : undefined}
        title={hasUsage ? "Clic para ver desglose completo" : undefined}
        aria-label={hasUsage ? "Ver detalle de uso: costo USD y tokens" : undefined}
        onClick={hasUsage ? openDialog : undefined}
        onKeyDown={hasUsage ? (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            openDialog();
          }
        } : undefined}
        sx={{
          flexShrink: 0,
          width: "fit-content",
          maxWidth: { xs: "min(100%, 18rem)", sm: groups.length > 1 ? "22rem" : "18rem" },
          pt: 0.25,
          alignSelf: "flex-start",
          cursor: hasUsage ? "pointer" : undefined,
        }}
      >
        {showMetaBadges ? (
          <Box className={`conv-msg-usage-stats__meta conv-msg-usage-stats__meta--${align}`}>
            {modelLabel ? (
              <UsageSummaryChip
                tag="MODELO"
                label={modelLabel}
                className="conv-msg-usage-chip conv-msg-usage-chip--model"
                title={meta?.modelo_autoswitch_vision
                  ? (modelRaw && modelRaw !== modelLabel
                    ? `Modelo usado (autoswitch visión): ${modelRaw}`
                    : "Modelo usado tras autoswitch visión")
                  : (modelRaw && modelRaw !== modelLabel ? `Modelo: ${modelRaw}` : "Modelo LLM")}
              />
            ) : null}
            {autoswitchBadge ? (
              <UsageSummaryChip
                tag={autoswitchBadge.tag}
                label={autoswitchBadge.label}
                className="conv-msg-usage-chip conv-msg-usage-chip--vision"
                title={autoswitchBadge.title}
              />
            ) : null}
            {latencyLabel ? (
              <UsageSummaryChip
                tag="LAT"
                label={latencyLabel}
                className="conv-msg-usage-chip conv-msg-usage-chip--latency"
                title="Tiempo de respuesta"
              />
            ) : null}
            {metaTokLabel && !hasUsage ? (
              <UsageSummaryChip
                tag="TOK"
                label={metaTokLabel}
                className="conv-msg-usage-chip conv-msg-usage-chip--tokens"
                title={`Tokens: ${metaTokLabel}`}
              />
            ) : null}
          </Box>
        ) : null}
        {groups.length > 0 ? (
          <Box className={`conv-msg-usage-stats__groups conv-msg-usage-stats__groups--${align}`}>
            {groups.map((group) => (
              <Box key={group.key} className={`conv-msg-usage-stats__group conv-msg-usage-stats__group--${group.key}`}>
                <UsageSummaryChip
                  tag={group.key === "prev" ? "ACUM" : "MSG"}
                  className={[
                    "conv-msg-usage-chip",
                    "conv-msg-usage-chip--scope",
                    group.key === "msg" ? "conv-msg-usage-chip--scope-msg" : "conv-msg-usage-chip--scope-prev",
                  ].join(" ")}
                  title={group.label}
                />
                <UsageSummaryChip
                  tag="USD"
                  label={group.summary.usdText}
                  className="conv-msg-usage-chip conv-msg-usage-chip--usd"
                  title="Costo USD"
                />
                <UsageSummaryChip
                  tag="TOK"
                  label={group.summary.tokensText}
                  className="conv-msg-usage-chip conv-msg-usage-chip--tokens"
                  title={group.key === "msg" ? "Tokens de este mensaje" : "Tokens acumulados antes de este mensaje"}
                />
              </Box>
            ))}
          </Box>
        ) : null}
      </Box>
      <UsageStatsDialog
        open={open && hasUsage}
        onClose={() => setOpen(false)}
        stats={stats}
        msgLabel={msgLabel}
        fecha={fecha}
        meta={meta}
      />
    </>
  );
}

function MsgRatingRow({ calificacion, onRate, disabled = false, busy = false, align = "right" }) {
  const { Stack, IconButton, Tooltip, CircularProgress } = getMaterialUI();
  const { Icon } = UI;
  const rated = calificacion !== undefined && calificacion !== null;
  const useful = calificacion === 1;
  const notUseful = calificacion === 0;
  const readOnly = disabled && !rated && !busy;

  const upTooltip = (() => {
    if (busy && !rated) return "Guardando calificación…";
    if (useful) return "Calificado como útil";
    if (rated && notUseful) return "Calificado como no útil · no se puede cambiar";
    if (readOnly) return "Calificación no disponible (modo lectura)";
    return "Marcar como útil";
  })();

  const downTooltip = (() => {
    if (busy && !rated) return "Guardando calificación…";
    if (notUseful) return "Calificado como no útil";
    if (rated && useful) return "Calificado como útil · no se puede cambiar";
    if (readOnly) return "Calificación no disponible (modo lectura)";
    return "Marcar como no útil";
  })();

  return (
    <Stack
      direction="row"
      spacing={0.25}
      alignItems="center"
      justifyContent={align === "right" ? "flex-end" : "flex-start"}
      className={`conv-msg-rating conv-msg-rating--${align}`}
      role="group"
      aria-label="Calificación del mensaje"
    >
      <Tooltip title={upTooltip} arrow>
        <span>
          <IconButton
            size="small"
            className={`conv-msg-rating__btn conv-msg-rating__btn--up${useful ? " conv-msg-rating__btn--active" : ""}`}
            aria-label={useful ? "Calificado como útil" : "Marcar como útil"}
            aria-pressed={useful}
            disabled={disabled || busy || rated}
            onClick={() => onRate(true)}
          >
            {busy && !rated ? <CircularProgress size={16} /> : <Icon icon={useful ? "mdi:thumb-up" : "mdi:thumb-up-outline"} size={18} />}
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={downTooltip} arrow>
        <span>
          <IconButton
            size="small"
            className={`conv-msg-rating__btn conv-msg-rating__btn--down${notUseful ? " conv-msg-rating__btn--active" : ""}`}
            aria-label={notUseful ? "Calificado como no útil" : "Marcar como no útil"}
            aria-pressed={notUseful}
            disabled={disabled || busy || rated}
            onClick={() => onRate(false)}
          >
            <Icon icon={notUseful ? "mdi:thumb-down" : "mdi:thumb-down-outline"} size={18} />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
}

function resolveMsgImensaje(msg) {
  const imensaje = Number(msg?.imensaje);
  return imensaje > 0 ? imensaje : undefined;
}

const MensajeSection = memo(function MensajeSection({ msg, onMeta, compactMeta = false, chatUserName, showUsageStats = false, onImageClick, streamingMsgId = null, onRateMessage = null, canRate = false, ratingMsgId = null, operativaEnter = false }) {
  const { Alert, Box } = getMaterialUI();
  const meta = roleMetaFor(msg, compactMeta);
  const title = roleTitle(msg, chatUserName);
  const fecha = msg.fecha ? String(msg.fecha) : "";
  const isUser = msg.esUsuario;
  const isOperativa = msg.esOperativa;
  const isStreaming = Boolean(msg.isStreaming || (streamingMsgId && msg.idMsg === streamingMsgId));
  const showMetaBtn = Boolean(onMeta && msg.meta && metaWorthDialog(msg.meta, isUser));
  const statsSide = isUser ? "left" : "right";
  const msgImensaje = resolveMsgImensaje(msg);
  const showRating = Boolean(
    onRateMessage
    && !isUser
    && !isOperativa
    && !isStreaming
    && msgImensaje
    && (canRate || msg.calificacion !== undefined),
  );
  const ratingRow = showRating ? (
    <MsgRatingRow
      calificacion={msg.calificacion}
      disabled={!canRate}
      busy={ratingMsgId === msg.idMsg}
      align="left"
      onRate={(butil) => onRateMessage({ ...msg, imensaje: msgImensaje }, butil)}
    />
  ) : null;
  const showMetricsColumn = Boolean(showUsageStats && sideLogPanelWorthShowing(msg));
  const showSideColumn = Boolean(showMetricsColumn || ratingRow);
  const hideUsageInChips = showMetricsColumn;
  const fullLayout = !compactMeta;
  const rowMaxWidth = showMetricsColumn
    ? "100%"
    : fullLayout
      ? (isOperativa ? "min(96%, 52rem)" : isUser ? "min(96%, 44rem)" : "min(96%, 48rem)")
      : isOperativa
        ? "92%"
        : "min(96%, 42rem)";
  const cardMaxWidth = showMetricsColumn
    ? (isOperativa ? "72%" : { xs: "100%", sm: "min(48rem, calc(100% - 11.5rem))" })
    : "100%";
  const roleClass = isOperativa
    ? `conv-msg--operativa${operativaEnter ? " conv-msg--operativa-enter" : ""}`
    : "";

  return (
      <Box
        className={[compactMeta ? "conv-msg--compact" : "", roleClass].filter(Boolean).join(" ") || undefined}
        sx={{
          display: "flex",
          justifyContent: isUser ? "flex-end" : "flex-start",
          width: "100%",
          mb: isOperativa ? (compactMeta ? 1 : 1.75) : compactMeta ? 2.5 : 2,
        }}
      >
      <Box
        className={[
          "conv-msg-row",
          compactMeta ? "conv-msg-row--compact" : "",
          showMetricsColumn ? "conv-msg-row--logs" : "",
          isUser ? "conv-msg-row--user" : "conv-msg-row--assistant",
        ].filter(Boolean).join(" ")}
        sx={{
          display: "flex",
          flexDirection: isUser ? "row-reverse" : "row",
          alignItems: showSideColumn ? "flex-start" : "flex-start",
          gap: { xs: 0.75, sm: 1.25 },
          width: showMetricsColumn ? "100%" : "fit-content",
          maxWidth: showMetricsColumn ? "100%" : rowMaxWidth,
          minWidth: 0,
          opacity: 1,
        }}
      >
        <Box
          className="conv-msg-card-wrap"
          sx={{
            flex: "0 1 auto",
            width: "fit-content",
            maxWidth: cardMaxWidth,
            minWidth: 0,
          }}
        >
          <SectionCard
            id={`conv-msg-${msg.idMsg}`}
            icon={meta.icon}
            title={title}
            fecha={fecha || undefined}
            accent={meta.accent}
            align={isUser ? "right" : "left"}
            operativa={isOperativa}
            compact={compactMeta}
            streaming={isStreaming}
            onMeta={showMetaBtn ? () => onMeta(msg) : undefined}
            metaChips={!compactMeta && onMeta ? (
              <MetaChipRow meta={msg.meta} isUser={isUser} hideUsageMetrics={hideUsageInChips} align={isUser ? "right" : "left"} />
            ) : null}
          >
            {msg.streamFailed && msg.streamError && (
              <Alert severity="warning" sx={{ mb: 1.5, py: 0.25, fontSize: "0.78rem" }}>
                {msg.streamError}
              </Alert>
            )}
            {(msg.contenido?.trim() || msg.imagenes?.length || msg.audios?.length || isStreaming) ? (
            <MsgBody
              text={msg.contenido}
              imagenes={msg.imagenes}
              audios={msg.audios}
              audiosTranscripcion={msg.audiosTranscripcion}
              align={isUser ? "right" : "left"}
              onImageClick={onImageClick}
              streaming={isStreaming}
            />
            ) : null}
          </SectionCard>
        </Box>
        {showSideColumn && (
          <Box
            className={`conv-msg-side-column conv-msg-side-column--${statsSide}`}
            sx={{
              flexShrink: 0,
              maxWidth: { xs: "min(100%, 16rem)", sm: "18rem" },
              pt: 0.25,
              pb: 0.25,
              alignSelf: "stretch",
            }}
          >
            {showMetricsColumn ? (
              <UsageStatsColumn
                stats={msg.usageStats}
                align={statsSide}
                msgLabel={title}
                fecha={fecha}
                meta={msg.meta}
              />
            ) : null}
            {ratingRow ? (
              <Box className="conv-msg-rating-slot">
                {ratingRow}
              </Box>
            ) : null}
          </Box>
        )}
      </Box>
    </Box>
  );
}, (prev, next) => (
  prev.msg === next.msg
  && prev.streamingMsgId === next.streamingMsgId
  && prev.compactMeta === next.compactMeta
  && prev.chatUserName === next.chatUserName
  && prev.showUsageStats === next.showUsageStats
  && prev.ratingMsgId === next.ratingMsgId
  && prev.canRate === next.canRate
  && prev.operativaEnter === next.operativaEnter
));

export function ConvLogWebView({ mensajes, onMeta, compactMeta = false, emptyHint, chatUserName, showUsageStats = true, streamingMsgId = null, onRateMessage = null, canRate = false, ratingMsgId = null, threadKey = null, threadClassName = "" }) {
  const { Box, Typography } = getMaterialUI();
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const operativaEnterIds = useOperativaEnterIds(mensajes, threadKey, { enabled: !compactMeta });

  const mensajesConStats = useMemo(
    () => attachUsageStats(mensajes || []),
    [mensajes],
  );
  const hasUsageStats = showUsageStats && threadHasUsageStats(mensajesConStats);
  const onImageClick = useMemo(() => (src) => setLightboxSrc(src), []);

  if (!mensajes?.length) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 6 }}>
        {emptyHint || "Recupera por ID o pega un log para ver el hilo."}
      </Typography>
    );
  }

  return (
    <Box className={threadClassName || undefined} sx={{ width: "100%", maxWidth: "100%" }}>
      {mensajesConStats.map((m) => (
        <MensajeSection
          key={m.idMsg}
          msg={m}
          onMeta={onMeta}
          compactMeta={compactMeta}
          chatUserName={chatUserName}
          showUsageStats={hasUsageStats}
          onImageClick={onImageClick}
          streamingMsgId={streamingMsgId}
          onRateMessage={onRateMessage}
          canRate={canRate}
          ratingMsgId={ratingMsgId}
          operativaEnter={operativaEnterIds.has(m.idMsg)}
        />
      ))}
      <ImageLightboxDialog open={Boolean(lightboxSrc)} src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </Box>
  );
}

/** Ítems para navegador lateral (estilo lista de tickets). */
export function convLogNavItems(mensajes) {
  return (mensajes || []).map((m, i) => {
    const rk = roleKey(m);
    const meta = ROLE_META[rk] || ROLE_META.assistant;
    const preview = String(m.contenido || "").replace(/\s+/g, " ").trim().slice(0, 48);
    return {
      id: m.idMsg,
      label: `#${i + 1} · ${roleTitle(m)}`,
      secondary: preview || "(sin texto)",
      accent: meta.accent,
      icon: meta.icon,
    };
  });
}
