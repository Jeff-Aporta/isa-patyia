/**
 * Presentación web del hilo CONVERSACION_LOG — estilo driver JSX de tickets (SectionCard, gradientes MUI).
 */
import { getReact, getMaterialUI } from "../core/platform.ts";
import { UI } from "../core/platform.ts";
import { mdToHtml, shortId, metaWorthDialog, instructionKeyFromMeta } from "./shared.jsx";
import { tokensFromUsage, attachUsageStats, threadHasUsageStats, formatUsageBreakdownParts, formatUsageSummary, formatLatencySeconds, formatTokensWithUsd, usageHasData } from "../core/convLog.ts";

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
  operativa: { icon: "mdi:cog-sync-outline", title: "Operativa", accent: "#64748b" },
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

function SectionCard({ icon, title, accent, children, id, onMeta, metaChips, align = "left", muted = false, fecha, streaming = false, footerExtra = null }) {
  const { Paper, Stack, Typography, Box, IconButton, Tooltip } = getMaterialUI();
  const { Icon } = UI;
  const color = accent || "#1e90ff";
  const isRight = align === "right";

  return (
    <Paper
      id={id}
      className={`conv-msg-card${streaming ? " conv-msg-card--streaming" : ""}`}
      elevation={0}
      sx={{
        borderRadius: "0.5rem",
        overflow: "hidden",
        border: 1,
        borderColor: muted ? "action.disabled" : "divider",
        bgcolor: muted ? "action.hover" : "background.paper",
        boxShadow: muted
          ? "none"
          : (t) =>
            t.palette.mode === "dark"
              ? "0 4px 24px rgba(0,0,0,0.25)"
              : "0 8px 32px rgba(15,23,42,0.07)",
        scrollMarginTop: 12,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": muted ? {} : {
          transform: { sm: "translateY(-2px)" },
          boxShadow: (t) =>
            t.palette.mode === "dark"
              ? "0 8px 32px rgba(0,0,0,0.35)"
              : "0 16px 48px rgba(15,23,42,0.1)",
        },
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 1.5,
          borderBottom: 1,
          borderColor: "divider",
          background: (t) => {
            if (muted) {
              return t.palette.mode === "dark"
                ? "linear-gradient(90deg, rgba(100,116,139,0.12), transparent 70%)"
                : "linear-gradient(90deg, rgba(100,116,139,0.08), transparent 70%)";
            }
            return t.palette.mode === "dark"
              ? isRight
                ? `linear-gradient(270deg, ${color}22, transparent 70%)`
                : `linear-gradient(90deg, ${color}22, transparent 70%)`
              : isRight
                ? `linear-gradient(270deg, ${color}14, transparent 70%)`
                : `linear-gradient(90deg, ${color}14, transparent 70%)`;
          },
          ...(isRight
            ? { borderRight: 4, borderRightColor: color }
            : { borderLeft: 4, borderLeftColor: color }),
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
              sx={{
                width: 32,
                height: 32,
                borderRadius: "0.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: muted
                  ? `linear-gradient(135deg, ${color}88, ${color}55)`
                  : `linear-gradient(135deg, ${color}, ${color}99)`,
                color: "#fff",
                boxShadow: muted ? "none" : `0 4px 12px ${color}44`,
                flexShrink: 0,
                mt: 0.1,
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
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  letterSpacing: -0.2,
                  lineHeight: 1.2,
                  ...(isRight ? { pr: 0.5 } : {}),
                }}
              >
                {title}
              </Typography>
              {metaChips}
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
      </Box>
      <Box sx={{ p: { xs: 2, sm: 2.5 } }}>{children}</Box>
      {(fecha || footerExtra) ? (
        <Box
          className="conv-msg-card__footer"
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: 0.65,
            borderTop: 1,
            borderColor: "divider",
            bgcolor: muted ? "action.hover" : "transparent",
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

function MetaChipRow({ meta, isUser = false }) {
  const { Stack, Chip } = getMaterialUI();
  if (!meta) return null;
  const tk = meta.tokens?.total ? meta.tokens : tokensFromUsage(meta.usage);
  const chips = [];

  if (meta.extra?.operativa_key) {
    chips.push({ key: "op", label: meta.extra.operativa_key, color: "warning", title: "consulta operativa" });
  }
  if (!isUser && meta.nombre_usuario) {
    chips.push({ key: "user", label: `@${meta.nombre_usuario}`, variant: "outlined", title: "nombre_usuario" });
  }
  if (!isUser && meta.nombre_usuario && meta.nombre_usado_en_respuesta === false) {
    chips.push({ key: "noname", label: "sin nombre", color: "warning", title: "Nombre enviado pero no usado" });
  }
  if (!isUser && meta.nombre_usado_en_respuesta === true) {
    chips.push({ key: "named", label: "✓ nombre", color: "success", title: "Nombre usado" });
  }
  if (meta.itdconsulta) {
    chips.push({ key: "itd", label: meta.itdconsulta, variant: "outlined", title: "itdconsulta" });
  }
  if (!isUser && instructionKeyFromMeta(meta)) {
    const key = instructionKeyFromMeta(meta);
    chips.push({ key: "pmpt", label: key, variant: "outlined", title: `iinstruccion: ${key}` });
  }
  if (meta.model) {
    chips.push({ key: "model", label: meta.model, variant: "outlined", title: "model" });
  }
  if (meta.latency_ms != null && meta.latency_ms > 0) {
    chips.push({ key: "lat", label: `${meta.latency_ms}ms`, variant: "outlined", title: "latency_ms" });
  }
  if (tk?.total > 0) {
    chips.push({ key: "tok", label: `${tk.total}t`, color: "secondary", title: `tokens total ${tk.total}` });
  }
  if (meta.premisas?.length) {
    for (const p of meta.premisas) {
      chips.push({ key: `p-${p}`, label: p, variant: "outlined", title: `premisa: ${p}` });
    }
  }
  if (meta.stream_ok === false) {
    chips.push({ key: "stream", label: "stream ✗", color: "error", title: meta.stream_error || "stream falló" });
  }

  if (!chips.length) return null;

  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
      {chips.map((c) => (
        <Chip
          key={c.key}
          size="small"
          label={c.label}
          color={c.color}
          variant={c.variant || "filled"}
          title={c.title}
          sx={{ height: 22, "& .MuiChip-label": { px: 0.75, fontSize: "0.68rem" } }}
        />
      ))}
    </Stack>
  );
}

function MsgBody({ text, imagenes, align = "left", onImageClick, streaming = false }) {
  const { Typography, Box } = getMaterialUI();
  const raw = String(text || "");
  const hasText = Boolean(raw.trim());
  const html = mdToHtml(raw);
  return (
    <>
      {streaming && !hasText ? (
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
    </>
  );
}

function ConvMsgImages({ items, align = "right", onImageClick }) {
  const { Box } = getMaterialUI();
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
      {items.map((src, idx) => (
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

function ImageLightboxDialog({ open, src, onClose }) {
  const { Dialog, DialogContent, IconButton, Box } = getMaterialUI();
  const { Icon } = UI;
  if (!src) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      className="conv-image-lightbox"
      PaperProps={{
        sx: {
          bgcolor: "transparent",
          boxShadow: "none",
          overflow: "visible",
          m: 1,
          maxWidth: "min(96vw, 1200px)",
        },
      }}
    >
      <DialogContent sx={{ p: 0, position: "relative", overflow: "hidden" }}>
        <IconButton
          aria-label="Cerrar imagen"
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 2,
            bgcolor: "rgba(0,0,0,0.45)",
            color: "#fff",
            "&:hover": { bgcolor: "rgba(0,0,0,0.65)" },
          }}
        >
          <Icon icon="mdi:close" size={22} />
        </IconButton>
        <Box
          component="img"
          src={src}
          alt="Imagen adjunta"
          sx={{
            display: "block",
            maxWidth: "min(96vw, 1200px)",
            maxHeight: "90vh",
            width: "auto",
            height: "auto",
            borderRadius: "0.5rem",
            mx: "auto",
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function UsageSummaryChip({ label, className, title }) {
  const { Chip } = getMaterialUI();
  return (
    <Chip
      size="small"
      variant="outlined"
      title={title}
      label={label}
      className={className}
      sx={{
        height: 22,
        "& .MuiChip-label": { px: 0.65, fontSize: "0.62rem", fontWeight: 600 },
      }}
    />
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
  const latency = formatLatencySeconds(meta?.latency_ms);
  const ctxItems = [
    meta?.ts ? { key: "ts", label: "ts", value: meta.ts, mono: true } : null,
    meta?.model ? { key: "model", label: "model", value: meta.model, mono: true } : null,
    latency ? { key: "latency", label: "latency", value: latency, mono: true } : null,
    meta?.itdconsulta ? { key: "itd", label: "itdconsulta", value: meta.itdconsulta, mono: true } : null,
  ].filter(Boolean);

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
            <div key={item.key} className="conv-usage-dialog__ctx-item">
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
  const { Box, Chip } = getMaterialUI();
  const [open, setOpen] = useState(false);
  if (!stats) return null;

  const msgSummary = formatUsageSummary(stats.tokens, stats.cost);
  const prevSummary = formatUsageSummary(stats.previousTokens, stats.previousCost);
  const showPrev = usageHasData(stats.previousTokens, stats.previousCost);

  const modelRaw = String(meta?.model ?? "").trim();
  const modelLabel = modelRaw ? (modelRaw.length > 28 ? shortId(modelRaw, 16, 10) : modelRaw) : "";
  const latencyLabel = formatLatencySeconds(meta?.latency_ms);
  const showMetaBadges = Boolean(modelLabel || latencyLabel);

  const groups = [
    { key: "msg", label: "Mensaje", summary: msgSummary },
    ...(showPrev ? [{ key: "prev", label: "Acumulado", summary: prevSummary }] : []),
  ];

  const openDialog = (e) => {
    e?.stopPropagation?.();
    setOpen(true);
  };

  return (
    <>
      <Box
        className={`conv-msg-usage-stats conv-msg-usage-stats--${align} conv-msg-usage-stats--clickable`}
        role="button"
        tabIndex={0}
        title="Clic para ver desglose completo"
        aria-label="Ver detalle de uso: costo USD y tokens"
        onClick={openDialog}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            openDialog();
          }
        }}
        sx={{
          flexShrink: 0,
          maxWidth: { xs: "min(100%, 16rem)", sm: "18rem" },
          pt: 0.25,
          alignSelf: "flex-start",
        }}
      >
        {showMetaBadges ? (
          <Box className={`conv-msg-usage-stats__meta conv-msg-usage-stats__meta--${align}`}>
            {modelLabel ? (
              <UsageSummaryChip
                label={modelLabel}
                className="conv-msg-usage-chip conv-msg-usage-chip--model"
                title={modelRaw && modelRaw !== modelLabel ? `Modelo: ${modelRaw}` : "Modelo"}
              />
            ) : null}
            {latencyLabel ? (
              <UsageSummaryChip
                label={latencyLabel}
                className="conv-msg-usage-chip conv-msg-usage-chip--latency"
                title="Tiempo de respuesta"
              />
            ) : null}
          </Box>
        ) : null}
        {groups.map((group) => (
          <Box key={group.key} className="conv-msg-usage-stats__group">
            <Chip
              size="small"
              label={group.label}
              className={`conv-msg-usage-stats__group-label conv-msg-usage-stats__group-label--${group.key}`}
              sx={{
                height: 22,
                fontWeight: 700,
                pointerEvents: "none",
                "& .MuiChip-label": { px: 0.75, fontSize: "0.62rem", letterSpacing: "0.02em" },
              }}
            />
            <UsageSummaryChip
              label={group.summary.usdText}
              className="conv-msg-usage-chip conv-msg-usage-chip--usd"
              title="Costo USD total"
            />
            <UsageSummaryChip
              label={group.summary.tokensText}
              className="conv-msg-usage-chip conv-msg-usage-chip--tokens"
              title="Tokens total"
            />
          </Box>
        ))}
      </Box>
      <UsageStatsDialog
        open={open}
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

function resolveMsgIreferencia(msg) {
  if (Number(msg?.ireferencia)) return Number(msg.ireferencia);
  const ts = msg?.meta?.ts;
  if (!ts) return undefined;
  const d = Date.parse(String(ts).trim());
  if (Number.isNaN(d)) return undefined;
  return Math.floor(d / 1000);
}

const MensajeSection = memo(function MensajeSection({ msg, onMeta, compactMeta = false, chatUserName, showUsageStats = false, onImageClick, streamingMsgId = null, onRateMessage = null, canRate = false, ratingMsgId = null, operativaEnter = false }) {
  const { Alert, Box } = getMaterialUI();
  const meta = roleMetaFor(msg, compactMeta);
  const title = roleTitle(msg, compactMeta ? chatUserName : undefined);
  const fecha = msg.fecha ? String(msg.fecha) : "";
  const isUser = msg.esUsuario;
  const isOperativa = msg.esOperativa;
  const isStreaming = Boolean(msg.isStreaming || (streamingMsgId && msg.idMsg === streamingMsgId));
  const showMetaBtn = Boolean(onMeta && msg.meta && metaWorthDialog(msg.meta, isUser));
  const statsSide = isUser ? "left" : "right";
  const msgIreferencia = resolveMsgIreferencia(msg);
  const showRating = Boolean(
    onRateMessage
    && !isUser
    && !isOperativa
    && !isStreaming
    && msgIreferencia
    && (canRate || msg.calificacion !== undefined),
  );
  const ratingRow = showRating ? (
    <MsgRatingRow
      calificacion={msg.calificacion}
      disabled={!canRate}
      busy={ratingMsgId === msg.idMsg}
      align="left"
      onRate={(butil) => onRateMessage({ ...msg, ireferencia: msgIreferencia }, butil)}
    />
  ) : null;
  const showMetricsColumn = Boolean(showUsageStats && msg.usageStats);
  const showSideColumn = Boolean(showMetricsColumn || ratingRow);

  return (
    <Box
      className={
        isOperativa && compactMeta
          ? `conv-msg--operativa${operativaEnter ? " conv-msg--operativa-enter" : ""}`
          : undefined
      }
      sx={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        width: "100%",
        mb: isOperativa && compactMeta ? 1 : 2.5,
      }}
    >
      <Box sx={{
        display: "flex",
        flexDirection: isUser ? "row-reverse" : "row",
        alignItems: showSideColumn && ratingRow ? "stretch" : "flex-start",
        gap: { xs: 1, sm: 1.25 },
        maxWidth: isOperativa && compactMeta ? "88%" : "95%",
        minWidth: 0,
        opacity: 1,
      }}>
        <Box sx={{
          flex: 1,
          minWidth: 0,
          maxWidth: isOperativa && compactMeta ? "78%" : "90%",
        }}>
          <SectionCard
            id={`conv-msg-${msg.idMsg}`}
            icon={meta.icon}
            title={title}
            fecha={fecha || undefined}
            accent={meta.accent}
            align={isUser ? "right" : "left"}
            muted={isOperativa && compactMeta}
            streaming={isStreaming}
            onMeta={showMetaBtn ? () => onMeta(msg) : undefined}
            metaChips={compactMeta ? null : <MetaChipRow meta={msg.meta} isUser={isUser} />}
          >
            {msg.streamFailed && msg.streamError && (
              <Alert severity="warning" sx={{ mb: 1.5, py: 0.25, fontSize: "0.78rem" }}>
                {msg.streamError}
              </Alert>
            )}
            <MsgBody
              text={msg.contenido}
              imagenes={msg.imagenes}
              align={isUser ? "right" : "left"}
              onImageClick={onImageClick}
              streaming={isStreaming}
            />
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

export function ConvLogWebView({ mensajes, onMeta, compactMeta = false, emptyHint, chatUserName, showUsageStats = true, streamingMsgId = null, onRateMessage = null, canRate = false, ratingMsgId = null, threadKey = null }) {
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
    <Box sx={{ width: "100%", maxWidth: "100%" }}>
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
