import { getReact, getMaterialUI } from "../core/platform.ts";
import {
  tokensFromUsage,
  formatUsageUsd,
  formatUsageBreakdownParts,
  formatTokensWithUsd,
  usageHasData,
} from "../core/convLog.ts";
import { CodeMirrorPanel } from "../core/platform.ts";
import { mdToHtml } from "../core/platform.ts";
import { ImageLightboxDialog } from "./ImageLightboxDialog.jsx";

export { mdToHtml } from "../core/platform.ts";

/** Botón con icono Iconify (mismo patrón que ISP ButtonIconify). */
export function ButtonIconify({ icon, title = "", label = "", onClick, disabled = false, busy = false, color = "", variant = "", className = "", type = "button" }) {
  const shown = busy ? "mdi:loading" : icon;
  const variantCls = variant ? `btn-iconify--${variant}` : "";
  const colorCls = color ? `btn-iconify--${color}` : "";
  const labeledCls = label ? "btn-iconify--labeled" : "";
  const aria = label || title || undefined;
  return (
    <button
      type={type}
      className={`btn-iconify ${variantCls} ${colorCls} ${labeledCls} ${className}`.trim()}
      title={title || label || undefined}
      aria-label={aria}
      onClick={onClick}
      disabled={disabled || busy}
    >
      <iconify-icon icon={shown} width="1.15em" height="1.15em" />
      {label ? <span className="btn-iconify__lbl">{label}</span> : null}
    </button>
  );
}

const { useState, useEffect, useMemo } = getReact();
const { createTheme, Dialog, DialogTitle, DialogContent, Tabs, Tab, Box, Typography } = getMaterialUI();

function isOpenAiPmptId(id) {
  return /^pmpt_/i.test(String(id ?? "").trim());
}

function bdInstructionKey(meta) {
  const id = String(meta?.prompt_id ?? "").trim();
  return id && !isOpenAiPmptId(id) ? id : "";
}

export function instructionKeyFromMeta(meta) {
  return bdInstructionKey(meta) || String(meta?.extra?.operativa_key ?? "").trim();
}

const USAGE_METRIC_COLS = [
  { key: "in", label: "in" },
  { key: "cache", label: "cache" },
  { key: "out", label: "out" },
  { key: "total", label: "total" },
  { key: "reason", label: "reason" },
];

function buildUsageRowMetrics(tokens, cost) {
  const tk = tokens || {};
  const parts = formatUsageBreakdownParts(tokens, cost);
  const byKey = Object.fromEntries(parts.map((p) => [p.key, p]));
  const reasonTok = Number(tk.reasoning ?? 0) || 0;

  return USAGE_METRIC_COLS.map((col) => {
    if (col.key === "reason") {
      return { key: col.key, tok: reasonTok, usd: 0, hasData: reasonTok > 0 };
    }
    const p = byKey[col.key];
    const tok = Number(p?.tok ?? 0) || 0;
    const usd = Number(p?.usd ?? 0) || 0;
    return { key: col.key, tok, usd, hasData: tok > 0 || usd > 0 };
  });
}

function MetaUsageGrid({ sections }) {
  const rows = (sections || []).map((s) => ({
    ...s,
    metrics: buildUsageRowMetrics(s.tokens, s.cost),
  }));

  const visibleCols = USAGE_METRIC_COLS.filter((col) =>
    rows.some((r) => r.metrics.find((m) => m.key === col.key)?.hasData),
  );

  if (!visibleCols.length) return null;

  const gridTemplateColumns = `5.5rem repeat(${visibleCols.length}, minmax(6.25rem, 1fr))`;

  return (
    <div className="meta-prompt-stat__usage-grid" style={{ gridTemplateColumns }}>
      <div className="meta-prompt-stat__usage-grid-head">
        <span className="meta-prompt-stat__usage-grid-corner" aria-hidden="true" />
        {visibleCols.map((col) => (
          <span key={col.key} className="meta-prompt-stat__usage-grid-col-h">
            {col.label}
          </span>
        ))}
      </div>
      {rows.map((row) => (
        <div key={row.key} className={`meta-prompt-stat__usage-grid-row meta-prompt-stat__usage-grid-row--${row.key}`}>
          <span className={`meta-prompt-stat__usage-group-label meta-prompt-stat__usage-group-label--${row.key}`}>
            {row.label}
          </span>
          {visibleCols.map((col) => {
            const metric = row.metrics.find((m) => m.key === col.key);
            const usd = col.key === "reason" ? 0 : (metric?.usd ?? 0);
            return (
              <span key={col.key} className="meta-prompt-stat__usage-grid-cell">
                {formatTokensWithUsd(metric?.tok ?? 0, usd)}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function filterDisplayableImages(list) {
  return (list || []).filter((src) => {
    const s = String(src || "").trim();
    if (!s || /^\[file_id:/i.test(s)) return false;
    return s.startsWith("data:image/") || /^https?:\/\//i.test(s);
  });
}

function MetaDialogImages({ items, onImageClick, topGap = 0 }) {
  const renderable = filterDisplayableImages(items);
  if (!renderable.length) return null;
  return (
    <Box
      className="conv-msg-images conv-msg-images--left meta-dialog-images"
      sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: topGap }}
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

function PromptSummaryCard({ meta, tokens, usageStats, isUserMessage = false }) {
  const promptChars = meta.prompt_chars ?? String(meta.prompt_markdown ?? "").length;
  const responseChars = meta.response_chars;
  const imageCount = filterDisplayableImages(meta.imagenes).length;

  const charStats = [
    ...(promptChars
      ? [{
        key: "prompt-ch",
        label: isUserMessage ? "Caracteres consulta" : "Caracteres prompt",
        value: Number(promptChars).toLocaleString("es-CO"),
      }]
      : []),
    ...(imageCount
      ? [{ key: "img-n", label: "Imágenes adjuntas", value: String(imageCount) }]
      : []),
    ...(typeof responseChars === "number"
      ? [{ key: "resp-ch", label: "Caracteres respuesta", value: responseChars.toLocaleString("es-CO") }]
      : []),
  ];

  const currentTokens = usageStats?.tokens ?? tokens;
  const currentCost = usageStats?.cost ?? meta?.cost;
  const usageSections = usageStats
    ? [
        { key: "msg", label: "Mensaje", tokens: usageStats.tokens, cost: usageStats.cost, show: true },
        {
          key: "cum",
          label: "Acumulado",
          tokens: usageStats.cumulativeTokens,
          cost: usageStats.cumulativeCost,
          show: usageHasData(usageStats.cumulativeTokens, usageStats.cumulativeCost),
        },
      ].filter((s) => s.show)
    : [{ key: "msg", label: "Mensaje", tokens: currentTokens, cost: currentCost, show: usageHasData(currentTokens, currentCost) }];

  const hasUsage = usageSections.some((s) => usageHasData(s.tokens, s.cost));

  const hasCharStats = charStats.length > 0;

  return (
    <Box className="meta-prompt-summary">
      {hasCharStats || hasUsage ? (
        <Typography variant="subtitle2" className="meta-prompt-summary__title">
          {isUserMessage ? "Resumen de la consulta" : "Resumen del prompt"}
        </Typography>
      ) : null}
      <div className="meta-prompt-summary__grid">
        {charStats.map((s) => (
          <div key={s.key} className="meta-prompt-stat">
            <span className="meta-prompt-stat__k">{s.label}</span>
            <span className="meta-prompt-stat__v">{s.value}</span>
          </div>
        ))}
        {hasUsage ? (
          <div className="meta-prompt-stat meta-prompt-stat--usage">
            <span className="meta-prompt-stat__k">Tokens y costo</span>
            <div className="meta-prompt-stat__usage-body">
              <MetaUsageGrid sections={usageSections} />
            </div>
          </div>
        ) : null}
      </div>
    </Box>
  );
}

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#3b82f6" },
    secondary: { main: "#14b8a6" },
    background: { default: "#0f172a", paper: "#1e293b" },
  },
  typography: { fontFamily: '"IBM Plex Sans", system-ui, sans-serif' },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: "none" } } },
    MuiTab: { styleOverrides: { root: { textTransform: "none" } } },
    MuiToggleButton: { styleOverrides: { root: { textTransform: "none" } } },
  },
});

export function shortId(s, head = 10, tail = 4) {
  if (!s) return "";
  return s.length <= head + tail + 1 ? s : `${s.slice(0, head)}…${s.slice(-tail)}`;
}

export function metaWorthDialog(meta, isUser) {
  if (!meta) return false;
  if (!isUser) return true;
  if (String(meta.prompt_markdown ?? "").trim()) return true;
  if (filterDisplayableImages(meta.imagenes).length) return true;
  const tk = meta.tokens?.total ? meta.tokens : tokensFromUsage(meta.usage);
  if (tk?.total > 0 || meta.usage) return true;
  if (meta.latency_ms != null && meta.latency_ms > 0) return true;
  if (meta.itdconsulta || meta.model || meta.premisas?.length) return true;
  if (bdInstructionKey(meta)) return true;
  if (meta.stream_ok === false) return true;
  if (meta.extra?.operativa_key) return true;
  const pv = meta.prompt_variables;
  if (pv && typeof pv === "object") {
    if (Object.keys(pv).some((k) => k !== "nombre_usuario")) return true;
  }
  return false;
}

export function MetaDialog({
  open,
  onClose,
  meta,
  title,
  isUserMessage = false,
  usageStats = null,
  userContent = "",
  imagenes = null,
}) {
  const [tab, setTab] = useState(0);
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const resolvedMeta = useMemo(() => {
    if (!meta) return null;
    if (!isUserMessage) return meta;
    const text = String(meta.prompt_markdown || userContent || "").trim();
    const imgs = filterDisplayableImages(
      (Array.isArray(meta.imagenes) && meta.imagenes.length) ? meta.imagenes : imagenes,
    );
    return {
      ...meta,
      ...(text ? { prompt_markdown: text, prompt_chars: meta.prompt_chars ?? text.length } : {}),
      ...(imgs.length ? { imagenes: imgs } : {}),
    };
  }, [meta, isUserMessage, userContent, imagenes]);

  const promptMarkdown = String(resolvedMeta?.prompt_markdown ?? "").trim();
  const userImagenes = filterDisplayableImages(resolvedMeta?.imagenes);
  const iinstruccion = bdInstructionKey(resolvedMeta) || String(resolvedMeta?.extra?.operativa_key ?? "").trim();
  const hasPrompt = Boolean(promptMarkdown) || Boolean(iinstruccion) || userImagenes.length > 0;
  const promptTabLabel = isUserMessage ? "Consulta" : "Prompt";

  useEffect(() => {
    if (open) setTab(0);
  }, [open, resolvedMeta?.ts, resolvedMeta?.prompt_id, promptMarkdown, userImagenes.length]);

  useEffect(() => {
    if (!open) setLightboxSrc(null);
  }, [open]);

  if (!resolvedMeta) return null;
  const tk = resolvedMeta.tokens?.total ? resolvedMeta.tokens : tokensFromUsage(resolvedMeta.usage);

  function renderMetaGrid() {
    return (
      <div className="meta-grid meta-dialog-panel">
        {resolvedMeta.nombre_usuario && (
          <div className="meta-row"><span className="meta-k">nombre</span><span className="meta-v"><strong>{resolvedMeta.nombre_usuario}</strong></span></div>
        )}
        {resolvedMeta.itdconsulta && (
          <div className="meta-row"><span className="meta-k">itdconsulta</span><span className="meta-v"><span className="badge badge-itd">{resolvedMeta.itdconsulta}</span></span></div>
        )}
        {!isUserMessage && iinstruccion && (
          <div className="meta-row"><span className="meta-k">iinstruccion</span><span className="meta-v"><code>{iinstruccion}</code></span></div>
        )}
        {resolvedMeta.premisas?.length ? (
          <div className="meta-row"><span className="meta-k">premisas</span><span className="meta-v">{resolvedMeta.premisas.join(", ")}</span></div>
        ) : null}
        {resolvedMeta.usage && (
          <div className="meta-row meta-row--block">
            <span className="meta-k">usage</span>
            <span className="meta-v meta-v--full">
              <CodeMirrorPanel
                value={JSON.stringify(resolvedMeta.usage, null, 2)}
                readOnly
                json
                minHeight="5rem"
                maxHeight="18rem"
                lineWrapping
              />
            </span>
          </div>
        )}
      </div>
    );
  }

  function renderPromptPanel() {
    return (
      <div className="meta-prompt-panel custom-scrollbar">
        <PromptSummaryCard meta={resolvedMeta} tokens={tk} usageStats={usageStats} isUserMessage={isUserMessage} />
        {promptMarkdown ? (
          <div
            className="prompt-md-preview msg-body meta-prompt-md"
            dangerouslySetInnerHTML={{ __html: mdToHtml(promptMarkdown) }}
          />
        ) : null}
        {userImagenes.length ? (
          <MetaDialogImages items={userImagenes} onImageClick={setLightboxSrc} topGap={promptMarkdown ? 1.25 : 0} />
        ) : null}
        {!promptMarkdown && !userImagenes.length ? (
          <Typography variant="body2" color="text.secondary">
            {isUserMessage
              ? "Sin texto ni imágenes en el log de este mensaje."
              : "Sin texto de instrucciones en el log de este turno."}
          </Typography>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
        <DialogTitle sx={{ pb: hasPrompt ? 0 : undefined }}>{title}</DialogTitle>
        {hasPrompt && (
          <Tabs
            value={tab}
            onChange={(_, next) => setTab(next)}
            sx={{ px: 2, minHeight: 42, borderBottom: 1, borderColor: "divider" }}
          >
            <Tab label="Trazabilidad" />
            <Tab label={promptTabLabel} />
          </Tabs>
        )}
        <DialogContent dividers sx={{ p: 0, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <Box sx={{ display: tab === 0 || !hasPrompt ? "block" : "none", minHeight: 0 }}>
            {renderMetaGrid()}
          </Box>
          {hasPrompt && (
            <Box sx={{ display: tab === 1 ? "block" : "none", minHeight: 0, flex: 1 }}>
              {renderPromptPanel()}
            </Box>
          )}
        </DialogContent>
      </Dialog>
      <ImageLightboxDialog open={Boolean(lightboxSrc)} src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </>
  );
}
