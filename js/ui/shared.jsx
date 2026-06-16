import { getReact, getMaterialUI } from "../core/runtime.ts";
import {
  tokensFromUsage,
  formatUsageUsd,
  formatUsageBreakdownParts,
  formatTokensWithUsd,
  usageHasData,
  resolvePromptSectionsForDisplay,
} from "../core/convLog.ts";
import { ButtonIconify } from "./iconify.jsx";
import { CodeMirrorPanel } from "./codeMirrorPanel.jsx";
import { formatPromptSectionHtml, formatSectionLabel, isLegacyChatPayload } from "./promptFormat.ts";
import { mdToHtml } from "./markdown.ts";

export { mdToHtml } from "./markdown.ts";

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
  return bdInstructionKey(meta);
}

function promptSectionCharCount(sections) {
  return (sections || []).reduce((n, s) => n + String(s.text || "").length, 0);
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

function PromptSummaryCard({ meta, promptSections, tokens, usageStats }) {
  const sectionChars = promptSectionCharCount(promptSections);
  const promptChars = meta.prompt_chars ?? sectionChars;
  const responseChars = meta.response_chars;

  const charStats = [
    { key: "prompt-ch", label: "Caracteres prompt", value: promptChars.toLocaleString("es-CO") },
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

  return (
    <Box className="meta-prompt-summary">
      <Typography variant="subtitle2" className="meta-prompt-summary__title">
        Resumen del prompt
      </Typography>
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

export function MetaBadges({ meta, onInfo }) {
  if (!meta) return null;
  const tk = meta.tokens?.total ? meta.tokens : tokensFromUsage(meta.usage);
  return (
    <span className="msg-badges">
      {meta.extra?.operativa_key && (
        <span className="badge badge-operativa" title="consulta operativa">{meta.extra.operativa_key}</span>
      )}
      {meta.nombre_usuario && (
        <span className="badge badge-nombre" title="nombre_usuario">@{meta.nombre_usuario}</span>
      )}
      {meta.nombre_usuario && meta.nombre_usado_en_respuesta === false && (
        <span className="badge badge-warn" title="Nombre enviado pero no usado">sin nombre</span>
      )}
      {meta.nombre_usado_en_respuesta === true && (
        <span className="badge badge-ok" title="Nombre usado">✓ nombre</span>
      )}
      {meta.itdconsulta && (
        <span className="badge badge-itd" title="itdconsulta">{meta.itdconsulta}</span>
      )}
      {bdInstructionKey(meta) && (
        <span className="badge badge-pmpt" title={`iinstruccion: ${bdInstructionKey(meta)}`}>
          {bdInstructionKey(meta)}
        </span>
      )}
      {meta.model && (
        <span className="badge badge-model" title={`model: ${meta.model}`}>{meta.model}</span>
      )}
      {meta.latency_ms != null && meta.latency_ms > 0 && (
        <span className="badge badge-latency" title="latency_ms">{meta.latency_ms}ms</span>
      )}
      {tk?.total > 0 && (
        <span className="badge badge-tokens" title={`tokens total ${tk.total}`}>{tk.total}t</span>
      )}
      {meta.premisas?.map((p) => (
        <span key={p} className="badge badge-premisa" title={`premisa: ${p}`}>{p}</span>
      ))}
      {meta.stream_ok === false && (
        <span className="badge badge-warn" title={meta.stream_error || "stream_ok: false"}>error stream</span>
      )}
      <ButtonIconify icon="mdi:information-outline" title="Ver trazabilidad" onClick={onInfo} className="btn-iconify--sm" />
    </span>
  );
}

export function metaWorthDialog(meta, isUser) {
  if (!meta) return false;
  if (!isUser) return true;
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

function InstructionPartBox({ name, kind, section, userName }) {
  return (
    <section className={`meta-instruction-part meta-instruction-part--${kind || "other"}`}>
      <div className="meta-instruction-part__head">
        <span className="meta-instruction-part__badge" title={`Instrucción: ${name}`}>
          {name}
        </span>
      </div>
      <div className="meta-instruction-part__content">
        <PromptSectionBody section={section} userName={userName} />
      </div>
    </section>
  );
}

function shouldRenderPromptAsMarkdown(section) {
  if (section?.isInstructionPart) return true;
  const label = String(section?.label ?? "").toLowerCase();
  const key = String(section?.key ?? "").toLowerCase();
  return (
    key === "instructions"
    || label === "instructions"
    || label === "instrucciones"
    || key === "system"
    || label === "system"
    || label === "sistema"
  );
}

function PromptSectionBody({ section, userName }) {
  const text = String(section?.text ?? "");

  if (shouldRenderPromptAsMarkdown(section)) {
    return (
      <div
        className="prompt-md-preview msg-body meta-prompt-md"
        dangerouslySetInnerHTML={{ __html: mdToHtml(text) }}
      />
    );
  }

  if (isLegacyChatPayload(text)) {
    return (
      <div
        className="prompt-md-preview msg-body meta-prompt-md"
        dangerouslySetInnerHTML={{ __html: formatPromptSectionHtml(text, { userName }) }}
      />
    );
  }

  return (
    <Typography
      component="pre"
      className="meta-prompt-exact"
      sx={{ m: 0 }}
    >
      {text}
    </Typography>
  );
}

export function MetaDialog({ open, onClose, meta, title, isUserMessage = false, usageStats = null }) {
  const [tab, setTab] = useState(0);
  const promptSections = isUserMessage ? [] : (meta?.prompt_sections ?? []);
  const displayPromptSections = useMemo(
    () => resolvePromptSectionsForDisplay(promptSections, meta),
    [promptSections, meta],
  );
  const iinstruccion = bdInstructionKey(meta);
  const hasPrompt = !isUserMessage && (promptSections.length > 0 || Boolean(iinstruccion));

  useEffect(() => {
    if (open) setTab(0);
  }, [open, meta?.ts, meta?.prompt_id, promptSections.length]);

  if (!meta) return null;
  const tk = meta.tokens?.total ? meta.tokens : tokensFromUsage(meta.usage);

  function renderMetaGrid() {
    return (
      <div className="meta-grid meta-dialog-panel">
        {meta.nombre_usuario && (
          <div className="meta-row"><span className="meta-k">nombre</span><span className="meta-v"><strong>{meta.nombre_usuario}</strong></span></div>
        )}
        {meta.itdconsulta && (
          <div className="meta-row"><span className="meta-k">itdconsulta</span><span className="meta-v"><span className="badge badge-itd">{meta.itdconsulta}</span></span></div>
        )}
        {!isUserMessage && iinstruccion && (
          <div className="meta-row"><span className="meta-k">iinstruccion</span><span className="meta-v"><code>{iinstruccion}</code></span></div>
        )}
        {meta.usage && (
          <div className="meta-row meta-row--block">
            <span className="meta-k">usage</span>
            <span className="meta-v meta-v--full">
              <CodeMirrorPanel
                value={JSON.stringify(meta.usage, null, 2)}
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
        <PromptSummaryCard meta={meta} promptSections={promptSections} tokens={tk} usageStats={usageStats} />
        {iinstruccion ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.25 }}>
            iinstruccion · <code>{iinstruccion}</code>
            {meta.itdconsulta ? ` · tipo ${meta.itdconsulta}` : ""}
          </Typography>
        ) : null}
        {displayPromptSections.length > 0 ? displayPromptSections.map((section) => (
          section.isInstructionPart ? (
            <InstructionPartBox
              key={section.key}
              name={section.instructionName}
              kind={section.instructionKind}
              section={section}
              userName={meta.nombre_usuario}
            />
          ) : (
            <section key={section.key} className="meta-prompt-section">
              {!section.suppressLabel ? (
                <Typography variant="overline" sx={{ display: "block", mb: 0.75, opacity: 0.8, letterSpacing: 0.6 }}>
                  {formatSectionLabel(section.label, meta.nombre_usuario)}
                </Typography>
              ) : null}
              <PromptSectionBody section={section} userName={meta.nombre_usuario} />
            </section>
          )
        )) : (
          <Typography variant="body2" color="text.secondary">
            Sin texto de instrucciones en el log de este turno.
          </Typography>
        )}
      </div>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle sx={{ pb: hasPrompt ? 0 : undefined }}>{title}</DialogTitle>
      {hasPrompt && (
        <Tabs
          value={tab}
          onChange={(_, next) => setTab(next)}
          sx={{ px: 2, minHeight: 42, borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Trazabilidad" />
          <Tab label="Prompt" />
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
  );
}
