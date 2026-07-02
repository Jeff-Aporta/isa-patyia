var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// js/boot/cdn.mjs
var cdn_exports = {};
__export(cdn_exports, {
  CDN: () => CDN,
  LIGHTBOX_ZOOM_REF: () => LIGHTBOX_ZOOM_REF,
  PIN: () => PIN,
  SWAGGER_VIEWER_REF: () => SWAGGER_VIEWER_REF,
  asset: () => asset,
  ensureLightboxZoom: () => ensureLightboxZoom,
  ensureSwaggerViewer: () => ensureSwaggerViewer,
  ensureSwaggerViewerCss: () => ensureSwaggerViewerCss,
  lightboxZoomBase: () => lightboxZoomBase,
  swaggerViewerBase: () => swaggerViewerBase
});
function useLocalMonorepoCdn() {
  if (!isDevHost) return false;
  try {
    const q = new URLSearchParams(location.search);
    if (q.get("isa_cdn") === "remote") return false;
    if (q.get("isa_cdn") === "local") return true;
    return localStorage.getItem("isa-patyia:local-cdn") === "1";
  } catch {
    return false;
  }
}
function frontSharedCdnBase() {
  const base = document.querySelector("base")?.href || location.href;
  return new URL("../../components/front-shared/cdn/", base).href.replace(/\/?$/, "/");
}
function vendorCdnBase() {
  const base = document.querySelector("base")?.href || location.href;
  return new URL("vendor/front-shared/", base).href.replace(/\/?$/, "/");
}
function lightboxZoomBase() {
  const base = document.querySelector("base")?.href || location.href;
  if (isDevHost) {
    return new URL("../../components/lightbox/cdn/", base).href.replace(/\/?$/, "/");
  }
  return `https://cdn.jsdelivr.net/gh/Jeff-Aporta/lightbox-zoom@${LIGHTBOX_ZOOM_REF}/cdn/`;
}
function ensureLightboxStylesheet(href) {
  if (document.querySelector("[data-isa-lb-zoom-css]")) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute("data-isa-lb-zoom-css", "1");
    link.onload = () => resolve();
    link.onerror = () => reject(new Error("No se pudo cargar " + href));
    document.head.appendChild(link);
  });
}
function ensureLightboxScript(src) {
  if (globalThis.ISAComponents?.LightboxZoom?.LightboxZoomDialog) {
    return Promise.resolve();
  }
  const stale = document.querySelector("script[data-isa-lb-zoom-js]");
  if (stale) stale.remove();
  return new Promise((resolve, reject) => {
    const el = document.createElement("script");
    el.src = src;
    el.setAttribute("data-isa-lb-zoom-js", "1");
    el.onload = () => {
      if (!globalThis.ISAComponents?.LightboxZoom?.LightboxZoomDialog) {
        reject(new Error("LightboxZoom no registr\xF3 ISAComponents.LightboxZoom"));
        return;
      }
      resolve();
    };
    el.onerror = () => reject(new Error("No se pudo cargar " + src));
    document.head.appendChild(el);
  });
}
async function ensureLightboxZoom(base = lightboxZoomBase()) {
  const b = base.endsWith("/") ? base : base + "/";
  await ensureLightboxStylesheet(b + "lightbox-zoom.min.css");
  await ensureLightboxScript(b + "lightbox-zoom.min.js");
  return globalThis.ISAComponents.LightboxZoom;
}
function swaggerViewerBase() {
  const base = document.querySelector("base")?.href || location.href;
  if (isDevHost) {
    return new URL("../../components/swagger/cdn/", base).href.replace(/\/?$/, "/");
  }
  return `${location.origin}/api/swagger/cdn/`;
}
function ensureSwaggerStylesheet(href) {
  if (document.querySelector("[data-isa-sw-css]")) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute("data-isa-sw-css", "1");
    link.onload = () => resolve();
    link.onerror = () => reject(new Error("No se pudo cargar " + href));
    document.head.appendChild(link);
  });
}
async function ensureSwaggerViewerCss(base = swaggerViewerBase()) {
  const b = base.endsWith("/") ? base : base + "/";
  await ensureSwaggerStylesheet(b + "swagger-viewer.min.css");
  return b;
}
async function ensureSwaggerViewer(base = swaggerViewerBase()) {
  const b = await ensureSwaggerViewerCss(base);
  if (!globalThis.ISAComponents?.Swagger?.bootSwaggerApp) {
    await import(b + "swagger-viewer.min.js");
  }
  if (!globalThis.ISAComponents?.Swagger?.bootSwaggerApp) {
    throw new Error("Swagger no registr\xF3 ISAComponents.Swagger");
  }
  return globalThis.ISAComponents.Swagger;
}
var PIN, isDevHost, JSDELIVR_CDN, CDN, asset, LIGHTBOX_ZOOM_REF, SWAGGER_VIEWER_REF;
var init_cdn = __esm({
  "js/boot/cdn.mjs"() {
    PIN = "a13fc29";
    isDevHost = typeof location !== "undefined" && /localhost|127\.0\.0\.1|\[::1\]/.test(location.hostname);
    JSDELIVR_CDN = `https://cdn.jsdelivr.net/gh/Jeff-Aporta/front-shared@${PIN}/cdn/`;
    CDN = isDevHost && useLocalMonorepoCdn() ? frontSharedCdnBase() : isDevHost ? JSDELIVR_CDN : vendorCdnBase();
    asset = (p) => isDevHost ? `${CDN}${p}` : `${CDN}${p}?v=${PIN}`;
    LIGHTBOX_ZOOM_REF = "4dd6595";
    SWAGGER_VIEWER_REF = "859035b";
  }
});

// js/core/patyia.ts
window.ISAFront.migrateLegacyGatewayKeys?.({ "jeff:gateway-local": "", "patyia-apptools:gateway-local": "", "patyia-apptools:lab-local": "" });
var PATYIA_ISS_LOCAL = "http://127.0.0.1:8802";
var PATYIA_BRIDGE_LOCAL = `${PATYIA_ISS_LOCAL}/api`;

// js/core/platform.ts
var bridge = () => window.ISAFront.createPlatformBridge("ISA");
var UI = {
  get Icon() {
    return bridge().UI.Icon;
  },
  get TargetSwitch() {
    return bridge().UI.TargetSwitch;
  },
  get ThemeSwitch() {
    return bridge().UI.ThemeSwitch;
  },
  get useRealtimeStatus() {
    return bridge().UI.useRealtimeStatus;
  },
  get RealtimeStatusDot() {
    return bridge().UI.RealtimeStatusDot;
  },
  get Loading() {
    return bridge().UI.Loading;
  },
  get ErrorBox() {
    return bridge().UI.ErrorBox;
  },
  get LoginGate() {
    return bridge().UI.LoginGate;
  },
  get LoginButton() {
    return bridge().UI.LoginButton;
  }
};
function frontSharedLazy() {
  const api = window.ISAFront;
  return api?.ensureCodeMirrorLoaded ? api : null;
}
function mdToHtml(src) {
  const api = frontSharedLazy();
  if (api?.mdToHtml) return api.mdToHtml(src);
  return String(src ?? "");
}
var getReact = () => window.ISAFront.getReact();
var getMaterialUI = () => window.ISAFront.getMaterialUI();
function getGlass() {
  const g = window.ISAFront?.Glass;
  if (!g?.GlassCard) {
    throw new Error("ISAFront.Glass no cargado \u2014 recargue sin cach\xE9 (Ctrl+Shift+R).");
  }
  return g;
}
function lightboxApi() {
  const api = window.ISAComponents?.LightboxZoom;
  if (!api?.LightboxZoomDialog) {
    throw new Error("ISAComponents.LightboxZoom no cargado \u2014 recargue sin cach\xE9 (Ctrl+Shift+R).");
  }
  return api;
}
var Lightbox = {
  get ImageLightboxDialog() {
    return lightboxApi().LightboxZoomDialog;
  },
  get LightboxImage() {
    return lightboxApi().LightboxZoomImage;
  },
  get useImageLightboxZoom() {
    return lightboxApi().useLightboxZoom;
  }
};

// js/core/convLog.ts
function tokensFromUsage(usage) {
  if (!usage || typeof usage !== "object") return void 0;
  const input = Number(usage.input_tokens ?? usage.prompt_tokens ?? 0) || 0;
  const cached = Number(
    usage.input_tokens_details?.cached_tokens ?? usage.prompt_tokens_details?.cached_tokens ?? 0
  ) || 0;
  const output = Number(usage.output_tokens ?? usage.completion_tokens ?? 0) || 0;
  const reasoning = Number(
    usage.output_tokens_details?.reasoning_tokens ?? usage.completion_tokens_details?.reasoning_tokens ?? 0
  ) || 0;
  const total = Number(usage.total_tokens ?? 0) || input + output;
  if (!total && !input && !output) return void 0;
  return { input, cached, output, reasoning, total };
}
function normalizeCost(cost) {
  if (!cost || typeof cost !== "object") return void 0;
  const input_usd = Number(cost.input_usd ?? 0) || 0;
  const cached_usd = Number(cost.cached_usd ?? 0) || 0;
  const output_usd = Number(cost.output_usd ?? 0) || 0;
  const total_usd = Number(cost.total_usd ?? 0) || input_usd + cached_usd + output_usd;
  return { input_usd, cached_usd, output_usd, total_usd };
}
var ZERO_TOKENS = { input: 0, cached: 0, output: 0, reasoning: 0, total: 0 };
var ZERO_COST = { input_usd: 0, cached_usd: 0, output_usd: 0, total_usd: 0 };
function readRawMessageTokens(msg) {
  const meta = msg?.meta;
  if (!meta) return { ...ZERO_TOKENS };
  const tk = meta.tokens?.total != null ? meta.tokens : tokensFromUsage(meta.usage);
  if (!tk) return { ...ZERO_TOKENS };
  return { input: Number(tk.input ?? 0) || 0, cached: Number(tk.cached ?? 0) || 0, output: Number(tk.output ?? 0) || 0, reasoning: Number(tk.reasoning ?? 0) || 0, total: Number(tk.total ?? 0) || 0 };
}
function readMessageCost(msg) {
  return normalizeCost(msg?.meta?.cost) ?? { ...ZERO_COST };
}
function accumulateTokens(acc, tk) {
  return { input: acc.input + tk.input, cached: acc.cached + tk.cached, output: acc.output + tk.output, reasoning: acc.reasoning + tk.reasoning, total: acc.total + tk.total };
}
function accumulateCost(acc, cost) {
  return { input_usd: acc.input_usd + cost.input_usd, cached_usd: acc.cached_usd + cost.cached_usd, output_usd: acc.output_usd + cost.output_usd, total_usd: acc.total_usd + cost.total_usd };
}
function formatUsageTokens(n) {
  if (n == null || !Number.isFinite(n) || n <= 0) return "\u2014";
  return n.toLocaleString("es-CO");
}
function formatUsageUsd(n) {
  if (n == null || !Number.isFinite(n) || n <= 0) return "\u2014";
  if (n >= 0.01) return `$${n.toFixed(4)}`;
  if (n >= 1e-4) return `$${n.toFixed(6)}`;
  return `$${n.toFixed(8)}`;
}
function formatMoneyWithTokens(usd, tokenCount) {
  const m = formatUsageUsd(usd);
  const t = Number(tokenCount ?? 0) || 0;
  if (m === "\u2014" && t <= 0) return "\u2014";
  if (m === "\u2014") return `(${t.toLocaleString("es-CO")}t)`;
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
    { key: "out", label: "out", usd: Number(c.output_usd ?? 0) || 0, tok: Number(tk.output ?? 0) || 0 }
  ];
  const totalUsd = Number(c.total_usd ?? 0) || parts.reduce((s, p) => s + p.usd, 0);
  const totalTok = Number(tk.total ?? 0) || 0;
  parts.push({ key: "total", label: "\u03A3", usd: totalUsd, tok: totalTok });
  return parts.map((p) => ({
    key: p.key,
    label: p.label,
    labelFull: labelFull[p.key] || p.label,
    usd: p.usd,
    tok: p.tok,
    usdText: formatUsageUsd(p.usd),
    tokText: p.tok > 0 ? `${formatUsageTokens(p.tok)} t` : "\u2014",
    display: formatMoneyWithTokens(p.usd, p.tok),
    hasData: p.usd > 0 || p.tok > 0
  }));
}
function formatUsageSummary(tokens, cost) {
  const tk = tokens || {};
  const c = cost || {};
  const totalTok = Number(tk.total ?? 0) || 0;
  const totalUsd = Number(c.total_usd ?? 0) || Number(c.input_usd ?? 0) + Number(c.cached_usd ?? 0) + Number(c.output_usd ?? 0) || 0;
  return { tokens: totalTok, usd: totalUsd, tokensText: totalTok > 0 ? `${formatUsageTokens(totalTok)} t` : "\u2014", usdText: formatUsageUsd(totalUsd), hasData: totalTok > 0 || totalUsd > 0 };
}
function usageHasData(tokens, cost) {
  return (Number(tokens?.total ?? 0) || 0) > 0 || (Number(cost?.total_usd ?? 0) || 0) > 0;
}
function turnoFromVistaMsg(msg) {
  const im = Number(msg?.imensaje);
  if (Number.isFinite(im) && im > 0) return Math.floor(im / 1e3);
  const m = String(msg?.idMsg ?? "").match(/^msg-(\d+)$/);
  if (m) {
    const n = Number(m[1]);
    if (Number.isFinite(n) && n > 0) return Math.floor(n / 1e3);
  }
  return void 0;
}
function attachUsageStats(mensajes) {
  const list = mensajes || [];
  const userInputByTurno = /* @__PURE__ */ new Map();
  for (const m of list) {
    if (!m.esUsuario) continue;
    const turno = turnoFromVistaMsg(m);
    if (turno == null) continue;
    const tk = readRawMessageTokens(m);
    if (usageHasData(tk, null)) userInputByTurno.set(turno, tk);
  }
  let cumulativeTokens = { ...ZERO_TOKENS };
  let cumulativeCost = { ...ZERO_COST };
  let flushedTurno;
  return list.map((m) => {
    if (m.esUsuario) {
      const tokens2 = readRawMessageTokens(m);
      const cost2 = readMessageCost(m);
      if (!usageHasData(tokens2, cost2)) return { ...m, usageStats: void 0 };
      return {
        ...m,
        usageStats: {
          tokens: tokens2,
          cost: cost2,
          previousTokens: { ...ZERO_TOKENS },
          previousCost: { ...ZERO_COST },
          cumulativeTokens: { ...tokens2 },
          cumulativeCost: { ...cost2 }
        }
      };
    }
    const turno = turnoFromVistaMsg(m);
    if (turno != null && turno !== flushedTurno) {
      const userInput = userInputByTurno.get(turno);
      if (userInput && usageHasData(userInput, null)) {
        cumulativeTokens = accumulateTokens(cumulativeTokens, userInput);
      }
      flushedTurno = turno;
    }
    const previousTokens = { ...cumulativeTokens };
    const previousCost = { ...cumulativeCost };
    const tokens = readRawMessageTokens(m);
    const cost = readMessageCost(m);
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
        cumulativeCost: { ...cumulativeCost }
      }
    };
  });
}
function threadHasUsageStats(mensajes) {
  return (mensajes || []).some((m) => sideLogPanelWorthShowing(m));
}
function sideLogPanelWorthShowing(msg) {
  if (!msg) return false;
  const meta = msg.meta;
  if (meta) {
    if (String(meta.itdconsulta ?? "").trim()) return true;
    if (Array.isArray(meta.premisas) && meta.premisas.length) return true;
    if (String(meta.extra?.operativa_key ?? "").trim()) return true;
    const tk = meta.tokens?.total ? meta.tokens : tokensFromUsage(meta.usage);
    if ((Number(tk?.total ?? 0) || 0) > 0) return true;
    if (Number(meta.latency_ms ?? 0) > 0) return true;
    if (String(meta.model ?? "").trim()) return true;
    if (meta.modelo_autoswitch_vision) return true;
    if (Array.isArray(meta.archivos_citados) && meta.archivos_citados.length) return true;
    if (Array.isArray(meta.file_search) && meta.file_search.length) return true;
  }
  const s = msg.usageStats;
  if (!s) return false;
  return usageHasData(s.tokens, s.cost) || !msg.esUsuario && usageHasData(s.previousTokens, s.previousCost);
}
function formatLatencySeconds(latencyMs) {
  const ms = Number(latencyMs);
  if (!Number.isFinite(ms) || ms <= 0) return "";
  return `${(ms / 1e3).toFixed(2)} s`;
}

// js/core/lightboxBoot.ts
function isLightboxZoomReady() {
  return Boolean(globalThis.ISAComponents?.LightboxZoom?.LightboxZoomDialog);
}
var loadPromise = null;
function ensureLightboxReady() {
  if (isLightboxZoomReady()) {
    return Promise.resolve(globalThis.ISAComponents.LightboxZoom);
  }
  if (!loadPromise) {
    loadPromise = Promise.resolve().then(() => (init_cdn(), cdn_exports)).then((m) => m.ensureLightboxZoom()).catch((err) => {
      loadPromise = null;
      throw err;
    });
  }
  return loadPromise;
}

// js/ui/ImageLightboxDialog.jsx
import { jsx } from "react/jsx-runtime";
var { useEffect, useState } = getReact();
function ImageLightboxDialog(props) {
  const { open, onClose } = props;
  const [ready, setReady] = useState(() => isLightboxZoomReady());
  const [loadError, setLoadError] = useState(null);
  useEffect(() => {
    if (!open || ready) return void 0;
    let cancelled = false;
    ensureLightboxReady().then(() => {
      if (!cancelled) setReady(true);
    }).catch((err) => {
      if (!cancelled) setLoadError(err);
    });
    return () => {
      cancelled = true;
    };
  }, [open, ready]);
  if (!open) return null;
  if (loadError) {
    const { Typography: Typography2, Box: Box2 } = getMaterialUI();
    return /* @__PURE__ */ jsx(Box2, { sx: { p: 2, textAlign: "center" }, children: /* @__PURE__ */ jsx(Typography2, { variant: "body2", color: "error", children: "No se pudo cargar el visor de im\xE1genes. Recargue sin cach\xE9 (Ctrl+Shift+R)." }) });
  }
  if (!ready) return null;
  const Comp = Lightbox.ImageLightboxDialog;
  return /* @__PURE__ */ jsx(Comp, { ns: "ISA", ...props, onClose });
}

// js/ui/GlassDialog.jsx
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
function isaLoginSurface() {
  const fs = globalThis.ISAFront || {};
  return {
    loginDialogProps: fs.loginDialogProps,
    loginDialogBackdropSx: fs.loginDialogBackdropSx,
    loginCardSx: fs.loginCardSx,
    glassCardSx: fs.glassCardSx,
    loginHeaderBandSx: fs.loginHeaderBandSx,
    loginIconBoxSx: fs.loginIconBoxSx,
    loginHeaderTitleSx: fs.loginHeaderTitleSx,
    GLASS_CARD_CLASS: fs.GLASS_CARD_CLASS || "isa-glass-card"
  };
}
var PAPER_MAX = { xs: 440, sm: 560, md: 920, lg: 1080 };
function glassBackdropSx() {
  const fn = isaLoginSurface().loginDialogBackdropSx;
  return fn?.() ?? {
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    backgroundColor: "rgba(11,18,32,0.55)"
  };
}
function glassPaperProps(maxWidth, paperClassName = "") {
  const { loginCardSx, glassCardSx, GLASS_CARD_CLASS } = isaLoginSurface();
  const maxPx = PAPER_MAX[maxWidth] ?? PAPER_MAX.md;
  return {
    elevation: 0,
    className: `isa-login-card ${GLASS_CARD_CLASS} isa-glass-dialog__paper ${paperClassName}`.trim(),
    sx: loginCardSx?.({ maxWidth: maxPx, m: { xs: 1, sm: 1.5 } }) ?? glassCardSx?.({ maxWidth: maxPx, m: { xs: 1, sm: 1.5 } }) ?? { maxWidth: maxPx, m: { xs: 1, sm: 1.5 } }
  };
}
function resolveGlassDialogProps({
  open,
  onClose,
  maxWidth = "md",
  fullWidth = true,
  paperMaxWidth,
  paperClassName = "",
  slotProps,
  ...rest
} = {}) {
  const { loginDialogProps } = isaLoginSurface();
  const paper = glassPaperProps(maxWidth, paperClassName);
  if (paperMaxWidth) paper.sx = { ...paper.sx, maxWidth: paperMaxWidth };
  const shared = {
    open,
    onClose,
    maxWidth,
    fullWidth,
    scroll: "paper",
    className: "isa-login-dialog isa-glass-dialog",
    slotProps: { backdrop: { sx: glassBackdropSx() }, ...slotProps || {} },
    PaperProps: paper,
    ...rest
  };
  if (!loginDialogProps) return shared;
  return loginDialogProps(shared);
}
function glassDialogContentSx(extra = {}) {
  return {
    p: 0,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    position: "relative",
    borderTop: 0,
    ...extra
  };
}
function glassDialogActionsSx(extra = {}) {
  return {
    px: { xs: 2, sm: 2.5 },
    py: 1.5,
    borderTop: 1,
    borderColor: (t) => t.palette.mode === "dark" ? "rgba(99,102,241,0.22)" : "divider",
    bgcolor: (t) => t.palette.mode === "dark" ? "rgba(15,23,42,0.32)" : "rgba(248,250,252,0.85)",
    justifyContent: "flex-end",
    ...extra
  };
}
function GlassDialogCloseActions({ onClose, label = "Cerrar" }) {
  const { DialogActions, Button } = getMaterialUI();
  return /* @__PURE__ */ jsx2(DialogActions, { sx: glassDialogActionsSx(), children: /* @__PURE__ */ jsx2(Button, { onClick: onClose, sx: { textTransform: "none", fontWeight: 600, minWidth: 72 }, children: label }) });
}
function GlassDialogHeader({ icon = "mdi:information-outline", title, subtitle, accent = "#1e90ff", onClose }) {
  const { Box: Box2, Typography: Typography2, IconButton, Stack: Stack2 } = getMaterialUI();
  const { Icon } = UI;
  const { loginHeaderBandSx, loginIconBoxSx, loginHeaderTitleSx } = isaLoginSurface();
  const bandSx = loginHeaderBandSx?.(accent) ?? {
    px: { xs: 2, sm: 2.5 },
    py: 2,
    borderBottom: 1,
    borderColor: "rgba(99,102,241,0.25)",
    background: `linear-gradient(90deg, ${accent}44, rgba(99,102,241,0.12) 45%, transparent 75%)`,
    borderLeft: 4,
    borderLeftColor: accent
  };
  const iconSx = loginIconBoxSx?.(accent) ?? {
    width: 42,
    height: 42,
    borderRadius: 1.75,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: `linear-gradient(135deg, ${accent}, ${accent}99)`,
    color: "#fff"
  };
  const titleSx = loginHeaderTitleSx?.() ?? { fontWeight: 700, fontSize: "1.35rem", lineHeight: 1.15 };
  return /* @__PURE__ */ jsxs(Box2, { className: "isa-glass-dialog__header", sx: { position: "relative", flexShrink: 0 }, children: [
    /* @__PURE__ */ jsx2(Box2, { sx: bandSx, children: /* @__PURE__ */ jsxs(Stack2, { direction: "row", spacing: 1.25, alignItems: "center", sx: { pr: onClose ? 4 : 0 }, children: [
      /* @__PURE__ */ jsx2(Box2, { sx: iconSx, children: /* @__PURE__ */ jsx2(Icon, { icon, size: 24 }) }),
      /* @__PURE__ */ jsxs(Box2, { sx: { flex: 1, minWidth: 0 }, children: [
        /* @__PURE__ */ jsx2(Typography2, { variant: "h5", component: "h2", sx: titleSx, children: title }),
        subtitle ? /* @__PURE__ */ jsx2(Typography2, { variant: "caption", color: "text.secondary", display: "block", sx: { mt: 0.35, lineHeight: 1.4 }, children: subtitle }) : null
      ] })
    ] }) }),
    onClose ? /* @__PURE__ */ jsx2(IconButton, { size: "small", onClick: onClose, "aria-label": "Cerrar", className: "isa-glass-dialog__close", sx: { position: "absolute", top: 10, right: 10 }, children: /* @__PURE__ */ jsx2(Icon, { icon: "mdi:close", size: 18 }) }) : null
  ] });
}
function GlassDialog({ children, header = null, maxWidth, fullWidth, paperMaxWidth, paperClassName, slotProps, ...dialogProps }) {
  const { Dialog } = getMaterialUI();
  const props = resolveGlassDialogProps({ maxWidth, fullWidth, paperMaxWidth, paperClassName, slotProps, ...dialogProps });
  return /* @__PURE__ */ jsxs(Dialog, { ...props, children: [
    header,
    children
  ] });
}
function resolveUsageDialogHeader(msgLabel, fecha, opKey) {
  const label = String(msgLabel || "Mensaje").trim();
  const isOp = /^OP\s*·/i.test(label) || Boolean(opKey);
  return {
    title: `Uso \xB7 ${label}`,
    subtitle: [fecha, opKey].filter(Boolean).join(" \xB7 ") || void 0,
    icon: isOp ? "mdi:cog-transfer-outline" : "mdi:chart-box-outline",
    accent: isOp ? "#f59e0b" : "#34d399"
  };
}
function isGenericMetaRole(rol) {
  const r = String(rol || "").trim().toLowerCase();
  return !r || r === "user" || r === "usuario" || r === "assistant" || r === "asistente";
}
function resolveMetaDialogHeader(title, isUserMessage = false) {
  const rol = String(title || "").replace(/^Trazabilidad\s*·\s*/i, "").trim();
  if (isUserMessage || /^user$/i.test(rol) || /^usuario$/i.test(rol)) {
    return { title: "Trazabilidad", subtitle: void 0, icon: "mdi:account-outline", accent: "#60a5fa" };
  }
  if (/^OP\s*·/i.test(rol) || /operativa/i.test(rol)) {
    return { title: "Trazabilidad", subtitle: rol, icon: "mdi:cog-transfer-outline", accent: "#f59e0b" };
  }
  if (isGenericMetaRole(rol)) {
    return { title: "Trazabilidad", subtitle: void 0, icon: "mdi:robot-outline", accent: "#1e90ff" };
  }
  return { title: "Trazabilidad", subtitle: rol, icon: "mdi:robot-outline", accent: "#1e90ff" };
}

// js/core/fileSearchTrace.js
function archivosCitadosFromTrace(trace) {
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const call of trace ?? []) {
    for (const fr of call?.results ?? []) {
      const name = String(fr?.filename ?? "").trim();
      if (!name || seen.has(name)) continue;
      seen.add(name);
      out.push(name);
    }
  }
  return out;
}
function fileSearchTraceCalls(meta) {
  const fs = meta?.file_search ?? meta?.others?.file_search;
  return Array.isArray(fs) && fs.length ? fs : [];
}
function fileSearchSummary(meta) {
  const fs = meta?.file_search ?? meta?.others?.file_search;
  if (!fs || Array.isArray(fs) || typeof fs !== "object") return null;
  return fs;
}
function vectorStoresFromMeta(meta) {
  const ids = [];
  const pushId = (id) => {
    const s = String(id ?? "").trim();
    if (!s || ids.includes(s)) return;
    ids.push(s);
  };
  const direct = meta?.vector_store_ids ?? meta?.vectorStoreIds;
  if (Array.isArray(direct)) direct.forEach(pushId);
  const summary = fileSearchSummary(meta);
  if (Array.isArray(summary?.vector_store_ids)) summary.vector_store_ids.forEach(pushId);
  for (const call of fileSearchTraceCalls(meta)) {
    for (const id of call?.vector_store_ids ?? []) pushId(id);
  }
  if (Array.isArray(meta?.clasificador_vector_usado)) meta.clasificador_vector_usado.forEach(pushId);
  for (const c of compactChunksFromMeta(meta)) {
    if (c.vectorStoreId) pushId(c.vectorStoreId);
  }
  return ids.map((id, index) => ({ index, id }));
}
function vectorStoreIndexLabel(vectorStores, vsId) {
  const id = String(vsId ?? "").trim();
  if (!id || !vectorStores?.length) return null;
  const hit = vectorStores.find((v) => v.id === id);
  return hit != null ? hit.index : null;
}
function archivosCitadosFromMeta(meta) {
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  const push = (name) => {
    const n = String(name ?? "").trim();
    if (!n || seen.has(n)) return;
    seen.add(n);
    out.push(n);
  };
  for (const x of meta?.archivos_citados ?? []) push(x);
  const summary = fileSearchSummary(meta);
  if (Array.isArray(summary?.archivos_citados)) {
    for (const x of summary.archivos_citados) push(x);
  }
  for (const name of archivosCitadosFromTrace(fileSearchTraceCalls(meta))) push(name);
  for (const c of compactChunksFromMeta(meta)) {
    if (c.filename) push(c.filename);
  }
  return out;
}
function fileSearchFromMeta(meta) {
  return fileSearchTraceCalls(meta);
}
function metaHasFileSearch(meta) {
  return archivosCitadosFromMeta(meta).length > 0 || vectorStoresFromMeta(meta).length > 0 || chunksFromMeta(meta).length > 0 || Boolean(fileSearchTraceCalls(meta).length);
}
function readCompactChunkList(meta) {
  const summary = fileSearchSummary(meta);
  const fromMeta = Array.isArray(meta?.chunks) ? meta.chunks : [];
  const fromSummary = Array.isArray(summary?.chunks) ? summary.chunks : [];
  return fromMeta.length ? fromMeta : fromSummary;
}
function compactChunksFromMeta(meta) {
  const list = readCompactChunkList(meta);
  const out = [];
  for (let i = 0; i < list.length; i += 1) {
    const c = list[i] || {};
    const text = String(c.text ?? c.snippet ?? "").trim();
    const filename = String(c.filename ?? "").trim();
    const fileId = String(c.file_id ?? "").trim();
    const vectorStoreId = String(c.vector_store_id ?? "").trim();
    if (!text && !filename && !fileId) continue;
    out.push({
      key: `compact-${fileId || filename || i}`,
      filename,
      fileId,
      score: typeof c.score === "number" ? c.score : null,
      text,
      vectorStoreId: vectorStoreId || void 0,
      queries: [],
      callIndex: 0,
      callId: ""
    });
  }
  return out;
}
function chunksFromMeta(meta) {
  const trace = fileSearchTraceCalls(meta);
  const out = [];
  if (trace.length) {
    for (let ci = 0; ci < trace.length; ci += 1) {
      const call = trace[ci] || {};
      const results = Array.isArray(call?.results) ? call.results : [];
      const queries = Array.isArray(call?.queries) ? call.queries : [];
      const callId = String(call?.id ?? "").trim();
      for (let ri = 0; ri < results.length; ri += 1) {
        const fr = results[ri] || {};
        const text = String(fr?.text ?? "").trim();
        if (!text) continue;
        const filename = String(fr?.filename ?? "").trim();
        const fileId = String(fr?.file_id ?? "").trim();
        const score = typeof fr?.score === "number" ? fr.score : null;
        const vectorStoreId = String(fr?.vector_store_id ?? "").trim() || void 0;
        out.push({
          key: `${callId || ci}-${fileId || filename || ri}`,
          callIndex: ci,
          callId,
          filename,
          fileId,
          score,
          text,
          queries,
          vectorStoreId
        });
      }
    }
  }
  if (!out.length) return compactChunksFromMeta(meta);
  return out;
}
function chunkPreview(text, max = 360) {
  const t = String(text ?? "").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trimEnd()}\u2026`;
}
function compactFileChipLabel(filename, maxLen = 28) {
  const full = String(filename ?? "").trim();
  if (!full) return "";
  const base = full.split(/[/\\]/).pop() || full;
  if (base.length <= maxLen) return base;
  const dot = base.lastIndexOf(".");
  const ext = dot > 0 ? base.slice(dot) : "";
  const stemMax = maxLen - ext.length - 1;
  if (stemMax > 4) return `${base.slice(0, stemMax)}\u2026${ext}`;
  return `${base.slice(0, maxLen - 1)}\u2026`;
}

// js/ui/shared.jsx
import { Fragment, jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
var { useState: useState2, useEffect: useEffect2, useMemo } = getReact();
var { createTheme, Tabs, Tab, Box, Typography, DialogContent, Stack, Chip } = getMaterialUI();
function isOpenAiPmptId(id) {
  return /^pmpt_/i.test(String(id ?? "").trim());
}
function bdInstructionKey(meta) {
  const id = String(meta?.prompt_id ?? "").trim();
  return id && !isOpenAiPmptId(id) ? id : "";
}
function instructionKeyFromMeta(meta) {
  return bdInstructionKey(meta) || String(meta?.extra?.operativa_key ?? "").trim();
}
var USAGE_METRIC_COLS = [
  { key: "in", label: "in" },
  { key: "cache", label: "cache" },
  { key: "out", label: "out" },
  { key: "total", label: "total" },
  { key: "reason", label: "reason" }
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
function UsageMetricCell({ tok, usd, showUsd = true }) {
  const tokLabel = formatUsageTokens(tok);
  const usdLabel = showUsd ? formatUsageUsd(usd) : null;
  const empty = tokLabel === "\u2014" && (!showUsd || usdLabel === "\u2014");
  return /* @__PURE__ */ jsxs2("span", { className: `meta-prompt-stat__usage-grid-cell${empty ? " meta-prompt-stat__usage-grid-cell--empty" : ""}`, children: [
    /* @__PURE__ */ jsx3("span", { className: "meta-prompt-stat__usage-tok", children: tokLabel }),
    showUsd ? /* @__PURE__ */ jsx3("span", { className: "meta-prompt-stat__usage-usd", children: usdLabel }) : null
  ] });
}
function MetaUsageGrid({ sections, hideRowLabels = false, className = "" }) {
  const rows = (sections || []).map((s) => ({
    ...s,
    metrics: buildUsageRowMetrics(s.tokens, s.cost)
  }));
  const visibleCols = USAGE_METRIC_COLS.filter(
    (col) => rows.some((r) => r.metrics.find((m) => m.key === col.key)?.hasData)
  );
  if (!visibleCols.length) return null;
  const gridTemplateColumns = hideRowLabels ? `repeat(${visibleCols.length}, minmax(5.5rem, 1fr))` : `5.75rem repeat(${visibleCols.length}, minmax(5.5rem, 1fr))`;
  const gridStyle = { gridTemplateColumns };
  return /* @__PURE__ */ jsxs2("div", { className: `meta-prompt-stat__usage-grid ${className}`.trim(), children: [
    /* @__PURE__ */ jsxs2("div", { className: "meta-prompt-stat__usage-grid-head", style: gridStyle, children: [
      !hideRowLabels ? /* @__PURE__ */ jsx3("span", { className: "meta-prompt-stat__usage-grid-corner", "aria-hidden": "true" }) : null,
      visibleCols.map((col) => /* @__PURE__ */ jsx3("span", { className: "meta-prompt-stat__usage-grid-col-h", children: col.label }, col.key))
    ] }),
    rows.map((row) => /* @__PURE__ */ jsxs2("div", { className: `meta-prompt-stat__usage-grid-row meta-prompt-stat__usage-grid-row--${row.key}`, style: gridStyle, children: [
      !hideRowLabels ? /* @__PURE__ */ jsx3("span", { className: `meta-prompt-stat__usage-group-label meta-prompt-stat__usage-group-label--${row.key}`, children: row.label }) : null,
      visibleCols.map((col) => {
        const metric = row.metrics.find((m) => m.key === col.key);
        const usd = col.key === "reason" ? 0 : metric?.usd ?? 0;
        return /* @__PURE__ */ jsx3(
          UsageMetricCell,
          {
            tok: metric?.tok ?? 0,
            usd,
            showUsd: col.key !== "reason"
          },
          col.key
        );
      })
    ] }, row.key))
  ] });
}
function UsageMetricsGrid(props) {
  return MetaUsageGrid(props);
}
function filterDisplayableImages(list) {
  return (list || []).filter((src) => {
    const s = String(src || "").trim();
    if (!s || /^\[file_id:/i.test(s)) return false;
    return s.startsWith("data:image/") || /^https?:\/\//i.test(s);
  });
}
var theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#3b82f6" },
    secondary: { main: "#14b8a6" },
    background: { default: "#0f172a", paper: "#1e293b" }
  },
  typography: { fontFamily: '"IBM Plex Sans", system-ui, sans-serif' },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: "none" } } },
    MuiTab: { styleOverrides: { root: { textTransform: "none" } } },
    MuiToggleButton: { styleOverrides: { root: { textTransform: "none" } } },
    MuiTooltip: {
      defaultProps: { disableInteractive: true },
      styleOverrides: {
        popper: { pointerEvents: "none" },
        tooltip: { pointerEvents: "none" }
      }
    }
  }
});
function shortId(s, head = 10, tail = 4) {
  if (!s) return "";
  return s.length <= head + tail + 1 ? s : `${s.slice(0, head)}\u2026${s.slice(-tail)}`;
}
function metaWorthDialog(meta, isUser) {
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
  if (Array.isArray(meta.archivos_citados) && meta.archivos_citados.length) return true;
  if (Array.isArray(meta.file_search) && meta.file_search.length) return true;
  if (meta.file_search && typeof meta.file_search === "object" && !Array.isArray(meta.file_search)) return true;
  if (Array.isArray(meta.vector_store_ids) && meta.vector_store_ids.length) return true;
  const pv = meta.prompt_variables;
  if (pv && typeof pv === "object") {
    if (Object.keys(pv).some((k) => k !== "nombre_usuario")) return true;
  }
  return false;
}
function FileSearchMetaSection({ meta }) {
  const { Typography: Typography2, Box: Box2, Stack: Stack2, Chip: Chip2, IconButton, Tooltip } = getMaterialUI();
  const { useState: useState4, useMemo: useMemo3 } = getReact();
  const trace = fileSearchFromMeta(meta);
  const archivos = archivosCitadosFromMeta(meta);
  const chunks = useMemo3(() => chunksFromMeta(meta), [meta]);
  const vectorStores = useMemo3(() => vectorStoresFromMeta(meta), [meta]);
  const [openChunk, setOpenChunk] = useState4(null);
  if (!trace?.length && !archivos.length && !chunks.length && !vectorStores.length) return null;
  return /* @__PURE__ */ jsxs2(Box2, { className: "meta-file-search", sx: { mt: 1.5 }, children: [
    vectorStores.length ? /* @__PURE__ */ jsxs2(Box2, { className: "meta-file-search__vector-stores", sx: { mb: 1.5 }, children: [
      /* @__PURE__ */ jsx3(Typography2, { variant: "subtitle2", fontWeight: 700, sx: { mb: 0.75 }, children: "Vector stores consultados" }),
      /* @__PURE__ */ jsxs2(Typography2, { variant: "caption", color: "text.secondary", display: "block", sx: { mb: 0.75 }, children: [
        "\xCDndice = posici\xF3n en ",
        /* @__PURE__ */ jsx3("code", { children: "vector_store_ids" }),
        " enviado al modelo (0 = primero). Usa el ID completo para verificar en OpenAI/BD."
      ] }),
      /* @__PURE__ */ jsx3(Stack2, { spacing: 0.5, children: vectorStores.map((vs) => /* @__PURE__ */ jsxs2(
        Box2,
        {
          className: "meta-file-search__vs-row",
          sx: {
            display: "flex",
            flexWrap: "wrap",
            alignItems: "baseline",
            gap: 0.75,
            fontSize: "0.82rem"
          },
          children: [
            /* @__PURE__ */ jsx3(Chip2, { size: "small", variant: "outlined", label: `\xEDndice ${vs.index}`, className: "meta-file-search__vs-index" }),
            /* @__PURE__ */ jsx3(Typography2, { component: "code", variant: "body2", sx: { wordBreak: "break-all", fontFamily: "monospace" }, children: vs.id })
          ]
        },
        vs.id
      )) })
    ] }) : null,
    /* @__PURE__ */ jsx3(Typography2, { variant: "subtitle2", fontWeight: 700, sx: { mb: 0.75 }, children: "File Search (archivos citados)" }),
    archivos.length ? /* @__PURE__ */ jsx3(Stack2, { direction: "row", spacing: 0.5, flexWrap: "wrap", useFlexGap: true, sx: { mb: chunks.length ? 1.25 : 0 }, children: archivos.map((name) => /* @__PURE__ */ jsx3(
      Chip2,
      {
        size: "small",
        variant: "outlined",
        icon: /* @__PURE__ */ jsx3("iconify-icon", { icon: "mdi:file-document-outline", width: "14", height: "14" }),
        label: name,
        title: name
      },
      name
    )) }) : null,
    chunks.length ? /* @__PURE__ */ jsx3(Stack2, { spacing: 0.85, className: "meta-file-search__chunk-list", children: chunks.map((c) => {
      const preview = chunkPreview(c.text, 380);
      const vsIdx = c.vectorStoreId ? vectorStoreIndexLabel(vectorStores, c.vectorStoreId) : null;
      return /* @__PURE__ */ jsxs2(Box2, { className: "meta-file-search__chunk", children: [
        /* @__PURE__ */ jsxs2(Stack2, { direction: "row", spacing: 0.75, alignItems: "center", sx: { mb: 0.5 }, children: [
          /* @__PURE__ */ jsx3("iconify-icon", { icon: "mdi:text-box-search-outline", width: "16", height: "16" }),
          /* @__PURE__ */ jsx3(Typography2, { variant: "body2", fontWeight: 600, sx: { flex: 1, minWidth: 0 }, children: c.filename || c.fileId || "fragmento" }),
          vsIdx != null ? /* @__PURE__ */ jsx3(
            Chip2,
            {
              size: "small",
              variant: "outlined",
              label: `VS \xEDndice ${vsIdx}`,
              title: c.vectorStoreId || void 0,
              className: "meta-file-search__vs-chip"
            }
          ) : null,
          c.score != null ? /* @__PURE__ */ jsx3(
            Chip2,
            {
              size: "small",
              variant: "outlined",
              label: `score ${Number(c.score).toFixed(3)}`,
              className: "meta-file-search__score"
            }
          ) : null,
          /* @__PURE__ */ jsx3(Tooltip, { title: "Ver fragmento en full-page", children: /* @__PURE__ */ jsx3(
            IconButton,
            {
              size: "small",
              "aria-label": `Ver fragmento de ${c.filename || c.fileId || "fragmento"}`,
              onClick: () => setOpenChunk(c),
              className: "meta-file-search__open",
              children: /* @__PURE__ */ jsx3("iconify-icon", { icon: "mdi:fullscreen", width: "16", height: "16" })
            }
          ) })
        ] }),
        c.queries?.length ? /* @__PURE__ */ jsxs2(Typography2, { variant: "caption", color: "text.secondary", display: "block", sx: { mb: 0.35 }, children: [
          "Queries: ",
          c.queries.join(" \xB7 ")
        ] }) : null,
        /* @__PURE__ */ jsx3(
          Typography2,
          {
            variant: "caption",
            component: "pre",
            className: "meta-file-search__preview",
            sx: {
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              m: 0,
              fontFamily: "inherit"
            },
            children: preview
          }
        )
      ] }, c.key);
    }) }) : null,
    /* @__PURE__ */ jsx3(
      MdFullPageDialog,
      {
        open: Boolean(openChunk),
        onClose: () => setOpenChunk(null),
        source: openChunk?.text || "",
        title: openChunk ? `Fragmento \xB7 ${openChunk.filename || openChunk.fileId || "texto exacto"}` : "Fragmento",
        subtitle: openChunk ? [
          openChunk.vectorStoreId ? `VS \xEDndice ${vectorStoreIndexLabel(vectorStores, openChunk.vectorStoreId) ?? "?"} \xB7 ${openChunk.vectorStoreId}` : "",
          openChunk.score != null ? `score ${Number(openChunk.score).toFixed(3)}` : "",
          openChunk.queries?.length ? `Queries: ${openChunk.queries.join(" \xB7 ")}` : ""
        ].filter(Boolean).join("  \xB7  ") : "",
        accent: "#7c3aed",
        icon: "mdi:text-box-search-outline"
      }
    )
  ] });
}
function FileSearchDialog({ open, onClose, meta, title = "File Search", subtitle = "" }) {
  const { DialogContent: DialogContent2 } = getMaterialUI();
  if (!meta || !metaHasFileSearch(meta)) return null;
  const headerMeta = resolveMetaDialogHeader(title, false);
  return /* @__PURE__ */ jsxs2(GlassDialog, { open, onClose, maxWidth: "md", fullWidth: true, children: [
    /* @__PURE__ */ jsx3(
      GlassDialogHeader,
      {
        icon: headerMeta.icon,
        title: headerMeta.title,
        subtitle: subtitle || "Archivos citados y fragmentos consultados",
        accent: headerMeta.accent,
        onClose
      }
    ),
    /* @__PURE__ */ jsx3(DialogContent2, { dividers: true, sx: glassDialogContentSx(), children: /* @__PURE__ */ jsx3(FileSearchMetaSection, { meta }) }),
    /* @__PURE__ */ jsx3(GlassDialogCloseActions, { onClose })
  ] });
}
function MdFullPageDialog({
  open,
  onClose,
  source,
  title = "Visor full-page",
  subtitle = "",
  accent = "#1e90ff",
  icon = "mdi:file-document-outline"
}) {
  const { Dialog, DialogTitle, DialogContent: DialogContent2, IconButton, Typography: Typography2, Box: Box2 } = getMaterialUI();
  const { Icon } = UI;
  const html = mdToHtml(String(source ?? ""));
  return /* @__PURE__ */ jsxs2(
    Dialog,
    {
      open: Boolean(open),
      onClose,
      fullScreen: true,
      scroll: "paper",
      className: "md-full-page-dialog",
      PaperProps: {
        sx: {
          backgroundImage: (theme2) => `linear-gradient(160deg, ${theme2.palette.mode === "light" ? "#f8fbff" : "#0b1220"} 0%, ${theme2.palette.mode === "light" ? "#e8f1ff" : "#0f1a30"} 100%)`
        }
      },
      children: [
        /* @__PURE__ */ jsxs2(
          DialogTitle,
          {
            sx: {
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              borderBottom: 1,
              borderColor: "divider",
              py: 1.25,
              px: { xs: 2, sm: 3 }
            },
            children: [
              /* @__PURE__ */ jsx3(
                Box2,
                {
                  sx: {
                    width: 36,
                    height: 36,
                    borderRadius: "0.5rem",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: `linear-gradient(135deg, ${accent}, ${accent}99)`,
                    color: "#fff",
                    flexShrink: 0,
                    boxShadow: `0 4px 16px ${accent}55`
                  },
                  children: /* @__PURE__ */ jsx3(Icon, { icon, size: 20 })
                }
              ),
              /* @__PURE__ */ jsxs2(Box2, { sx: { flex: 1, minWidth: 0 }, children: [
                /* @__PURE__ */ jsx3(Typography2, { variant: "h6", fontWeight: 700, noWrap: true, children: title }),
                subtitle ? /* @__PURE__ */ jsx3(Typography2, { variant: "caption", color: "text.secondary", noWrap: true, children: subtitle }) : null
              ] }),
              /* @__PURE__ */ jsx3(IconButton, { onClick: onClose, "aria-label": "Cerrar visor", size: "small", children: /* @__PURE__ */ jsx3("iconify-icon", { icon: "mdi:close", width: "18", height: "18" }) })
            ]
          }
        ),
        /* @__PURE__ */ jsx3(
          DialogContent2,
          {
            dividers: true,
            sx: {
              p: { xs: 2, sm: 3, md: 4 },
              maxWidth: 920,
              mx: "auto",
              width: "100%"
            },
            children: /* @__PURE__ */ jsx3(
              "div",
              {
                className: "md-full-page-dialog__body isa-md-content",
                dangerouslySetInnerHTML: { __html: html }
              }
            )
          }
        )
      ]
    }
  );
}

// js/ui/ConvLogWebView.jsx
import { Fragment as Fragment2, jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";
var { useMemo: useMemo2, useState: useState3, useRef, useEffect: useEffect3, memo } = getReact();
function useOperativaEnterIds(mensajes, threadKey, { enabled = true } = {}) {
  const seenIdsRef = useRef(/* @__PURE__ */ new Set());
  const primedKeyRef = useRef(null);
  const [enterIds, setEnterIds] = useState3(() => /* @__PURE__ */ new Set());
  useEffect3(() => {
    if (primedKeyRef.current === threadKey) return;
    primedKeyRef.current = threadKey;
    seenIdsRef.current = /* @__PURE__ */ new Set();
    setEnterIds(/* @__PURE__ */ new Set());
  }, [threadKey]);
  useEffect3(() => {
    if (!enabled) return;
    const msgs = mensajes || [];
    if (primedKeyRef.current !== threadKey) return;
    if (!seenIdsRef.current.size && msgs.length) {
      for (const m of msgs) seenIdsRef.current.add(m.idMsg);
      return;
    }
    const nextEnter = /* @__PURE__ */ new Set();
    const newlySeen = [];
    for (const m of msgs) {
      if (seenIdsRef.current.has(m.idMsg)) continue;
      seenIdsRef.current.add(m.idMsg);
      newlySeen.push(m);
      if (m.esOperativa) nextEnter.add(m.idMsg);
    }
    if (nextEnter.size && newlySeen.length === 1) {
      setEnterIds((prev) => /* @__PURE__ */ new Set([...prev, ...nextEnter]));
    }
  }, [mensajes, threadKey, enabled]);
  return enterIds;
}
var ROLE_META = {
  user: { icon: "mdi:account-outline", title: "Usuario", accent: "#1e90ff" },
  assistant: { icon: "mdi:robot-outline", title: "PatyIA", accent: "#10b981" },
  operativa: { icon: "mdi:cog-outline", title: "Operativa", accent: "#f59e0b" }
};
var ROLE_META_CHAT = {
  ...ROLE_META,
  operativa: { icon: "mdi:cog-sync-outline", title: "Operativa", accent: "#f59e0b" }
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
function msgStoredUserName(msg) {
  return msg.nombreUsuario || msg.meta?.nombre_usuario || msg.meta?.prompt_variables?.nombre_usuario || "";
}
function looksLikeUsername(name, nick) {
  const n = String(name ?? "").trim();
  const k = String(nick ?? "").trim();
  return n && k && n.toUpperCase() === k.toUpperCase();
}
function roleTitle(msg, chatUserDisplayName, chatUserNick) {
  if (msg.esOperativa) return msg.rol || "Operativa";
  if (msg.esUsuario) {
    const fromMsg = String(msgStoredUserName(msg)).trim();
    if (fromMsg && !looksLikeUsername(fromMsg, chatUserNick) && /\s/.test(fromMsg)) return fromMsg;
    if (chatUserDisplayName) return chatUserDisplayName;
    if (fromMsg && !looksLikeUsername(fromMsg, chatUserNick)) return fromMsg;
    return "Usuario";
  }
  return "PatyIA";
}
function roleUserCaption(msg, chatUserNick) {
  if (!msg.esUsuario) return "";
  const nick = String(chatUserNick ?? "").trim();
  if (nick) return nick;
  const fromMsg = String(msgStoredUserName(msg)).trim();
  return fromMsg && !/\s/.test(fromMsg) ? fromMsg : "";
}
function SectionCard({ icon, title, titleCaption, accent, children, id, onMeta, metaChips, align = "left", muted = false, operativa = false, fecha, fechaIso, streaming = false, footerExtra = null, compact = false }) {
  const { Paper, Stack: Stack2, Typography: Typography2, Box: Box2, IconButton, Tooltip } = getMaterialUI();
  const { Icon } = UI;
  const color = accent || "#1e90ff";
  const isRight = align === "right";
  const softMuted = muted && !operativa;
  const fullNeon = !compact;
  return /* @__PURE__ */ jsxs3(
    Paper,
    {
      id,
      className: [
        "conv-msg-card",
        streaming ? "conv-msg-card--streaming" : "",
        compact ? "conv-msg-card--compact" : "conv-msg-card--full",
        operativa ? "conv-msg-card--operativa" : "conv-msg-card--neon"
      ].filter(Boolean).join(" "),
      elevation: 0,
      sx: (theme2) => {
        const isLight = theme2.palette.mode === "light";
        const base = {
          borderRadius: fullNeon ? "0.75rem" : "0.5rem",
          overflow: "hidden",
          border: 1,
          scrollMarginTop: 12,
          width: fullNeon ? "fit-content" : "100%",
          maxWidth: "100%"
        };
        if (softMuted) {
          return {
            ...base,
            borderColor: theme2.palette.action.disabled,
            bgcolor: theme2.palette.action.hover,
            boxShadow: "none",
            transition: "none"
          };
        }
        if (isLight) {
          return {
            ...base,
            borderColor: `${color}52`,
            bgcolor: operativa ? "#fffbeb" : "#ffffff",
            boxShadow: "none",
            transition: "none"
          };
        }
        return {
          ...base,
          borderColor: `${color}40`,
          bgcolor: "background.paper",
          boxShadow: fullNeon ? `0 4px 24px rgba(0, 0, 0, 0.28), 0 0 0 1px ${color}28` : operativa ? `0 4px 20px ${color}18` : `0 4px 24px rgba(0, 0, 0, 0.22), 0 0 0 1px ${color}22`,
          transition: fullNeon ? "transform 0.2s ease, box-shadow 0.2s ease" : "none",
          ...fullNeon ? {
            "&:hover": {
              transform: { sm: "translateY(-2px)" },
              boxShadow: `0 8px 32px rgba(0, 0, 0, 0.35), 0 0 24px ${color}22`
            }
          } : {}
        };
      },
      children: [
        /* @__PURE__ */ jsxs3(
          Box2,
          {
            className: "conv-msg-card__header",
            sx: (theme2) => {
              const isLight = theme2.palette.mode === "light";
              const base = {
                px: compact ? { xs: 1.25, sm: 1.5 } : { xs: 2, sm: 2.5 },
                py: compact ? 1 : 1.5,
                borderBottom: 1,
                borderColor: "divider"
              };
              if (fullNeon) {
                if (isLight) {
                  return {
                    ...base,
                    bgcolor: `${color}12`,
                    ...isRight ? { borderRight: 4, borderRightColor: color } : { borderLeft: 4, borderLeftColor: color }
                  };
                }
                return {
                  ...base,
                  background: isRight ? `linear-gradient(270deg, ${color}28, transparent 72%)` : `linear-gradient(90deg, ${color}28, transparent 72%)`,
                  ...isRight ? { borderRight: 4, borderRightColor: color } : { borderLeft: 4, borderLeftColor: color }
                };
              }
              if (operativa) {
                return {
                  ...base,
                  bgcolor: isLight ? `${color}14` : void 0,
                  background: isLight ? void 0 : `linear-gradient(90deg, ${color}30, transparent 72%)`
                };
              }
              if (isLight) {
                return {
                  ...base,
                  bgcolor: `${color}10`
                };
              }
              return {
                ...base,
                background: isRight ? `linear-gradient(270deg, ${color}24, transparent 72%)` : `linear-gradient(90deg, ${color}24, transparent 72%)`
              };
            },
            children: [
              /* @__PURE__ */ jsxs3(
                Stack2,
                {
                  direction: "row",
                  spacing: 1.25,
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  useFlexGap: true,
                  sx: { flexDirection: isRight ? "row-reverse" : "row" },
                  children: [
                    /* @__PURE__ */ jsxs3(
                      Stack2,
                      {
                        direction: "row",
                        spacing: 1.25,
                        alignItems: "flex-start",
                        sx: { flex: 1, minWidth: 0, flexDirection: isRight ? "row-reverse" : "row" },
                        children: [
                          /* @__PURE__ */ jsx4(
                            Box2,
                            {
                              className: "conv-msg-card__icon",
                              sx: (theme2) => {
                                const isLight = theme2.palette.mode === "light";
                                return {
                                  width: compact ? 28 : 32,
                                  height: compact ? 28 : 32,
                                  borderRadius: fullNeon ? "0.5rem" : "0.375rem",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  background: operativa || !softMuted ? `linear-gradient(135deg, ${color}, ${color}99)` : `${color}88`,
                                  color: "#fff",
                                  boxShadow: isLight ? "none" : fullNeon ? `0 4px 16px ${color}55` : operativa || !softMuted ? `0 4px 14px ${color}44` : "none",
                                  flexShrink: 0,
                                  mt: 0.1
                                };
                              },
                              children: /* @__PURE__ */ jsx4(Icon, { icon, size: 18 })
                            }
                          ),
                          /* @__PURE__ */ jsxs3(
                            Box2,
                            {
                              className: isRight ? "conv-msg-card__title conv-msg-card__title--right" : "conv-msg-card__title",
                              sx: {
                                minWidth: 0,
                                flex: 1,
                                ...isRight ? { pr: 1.25, textAlign: "right" } : { pl: 0 }
                              },
                              children: [
                                /* @__PURE__ */ jsx4(
                                  Typography2,
                                  {
                                    variant: compact ? "body2" : "subtitle1",
                                    sx: {
                                      fontWeight: 700,
                                      letterSpacing: -0.2,
                                      lineHeight: 1.25,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      ...isRight ? { pr: 0.5 } : {}
                                    },
                                    children: title
                                  }
                                ),
                                titleCaption ? /* @__PURE__ */ jsx4(
                                  Typography2,
                                  {
                                    variant: "caption",
                                    color: "text.secondary",
                                    sx: {
                                      display: "block",
                                      mt: 0.15,
                                      lineHeight: 1.2,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      fontWeight: 500,
                                      letterSpacing: "0.02em"
                                    },
                                    children: titleCaption
                                  }
                                ) : null
                              ]
                            }
                          )
                        ]
                      }
                    ),
                    onMeta && /* @__PURE__ */ jsx4(Tooltip, { title: "Trazabilidad del mensaje", arrow: true, children: /* @__PURE__ */ jsx4(IconButton, { size: "small", onClick: onMeta, "aria-label": "Ver trazabilidad", sx: { alignSelf: "flex-start", mt: -0.25 }, children: /* @__PURE__ */ jsx4(Icon, { icon: "mdi:information-outline", size: 20 }) }) })
                  ]
                }
              ),
              metaChips ? /* @__PURE__ */ jsx4(Box2, { className: `conv-msg-card__meta-row${isRight ? " conv-msg-card__meta-row--right" : ""}`, children: metaChips }) : null
            ]
          }
        ),
        /* @__PURE__ */ jsx4(Box2, { sx: { p: compact ? { xs: 1.25, sm: 1.5 } : { xs: 2, sm: 2.5 } }, children }),
        fecha || footerExtra ? /* @__PURE__ */ jsx4(
          Box2,
          {
            className: "conv-msg-card__footer",
            sx: {
              px: { xs: 2, sm: 2.5 },
              py: 0.65,
              borderTop: 1,
              borderColor: "divider",
              bgcolor: softMuted ? "action.hover" : "transparent"
            },
            children: /* @__PURE__ */ jsxs3(
              Stack2,
              {
                direction: "row",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                useFlexGap: true,
                gap: 0.75,
                sx: { flexDirection: align === "right" ? "row-reverse" : "row" },
                children: [
                  footerExtra,
                  fecha ? /* @__PURE__ */ jsx4(
                    Typography2,
                    {
                      component: "time",
                      dateTime: fechaIso || void 0,
                      variant: "caption",
                      color: "text.secondary",
                      sx: {
                        fontSize: "0.68rem",
                        letterSpacing: "0.02em",
                        opacity: 0.85,
                        ml: align === "right" ? 0 : "auto",
                        mr: align === "right" ? "auto" : 0,
                        textAlign: align === "right" ? "right" : "left"
                      },
                      children: /* @__PURE__ */ jsx4("span", { className: "conv-msg-card__fecha", children: fecha })
                    }
                  ) : null
                ]
              }
            )
          }
        ) : null
      ]
    }
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
      tag: "Visi\xF3n",
      label: "autoswitch",
      title: used ? `Autoswitch visi\xF3n activo \xB7 modelo usado: ${used}` : "Autoswitch visi\xF3n por im\xE1genes adjuntas"
    };
  }
  const label = modelBadgeLabel(configured);
  return {
    tag: "Config",
    label,
    title: used && configured !== used ? `Autoswitch visi\xF3n: ${configured} \u2192 ${used}` : `Modelo configurado (${configured}); autoswitch visi\xF3n por im\xE1genes adjuntas`
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
        label: "autoswitch visi\xF3n",
        value: from === to ? `${from} (sin cambio de modelo)` : `${from} \u2192 ${to}`,
        mono: true,
        wide: true,
        vision: true
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
          label: "autoswitch visi\xF3n",
          value: "activo (im\xE1genes adjuntas)",
          mono: false,
          wide: true,
          vision: true
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
  return `${v.slice(0, maxLen - 1)}\u2026`;
}
function chipRedundantWithTitle(label, cardTitle) {
  const chip = String(label ?? "").trim();
  const title = String(cardTitle ?? "").trim();
  if (!chip || !title) return false;
  if (chip === title) return true;
  const titleKey = title.replace(/^OP\s*·\s*/i, "").trim();
  return chip === titleKey;
}
var META_CHIP_TONE_CLASS = {
  context: "conv-msg-meta-chip--context",
  premisa: "conv-msg-meta-chip--premisa",
  operativa: "conv-msg-meta-chip--operativa",
  model: "conv-msg-meta-chip--model",
  metric: "conv-msg-meta-chip--metric",
  error: "conv-msg-meta-chip--error",
  vision: "conv-msg-meta-chip--vision",
  files: "conv-msg-meta-chip--context",
  neutral: ""
};
function MetaBadge({ tag, label, tone = "neutral", title, onClick }) {
  const toneClass = META_CHIP_TONE_CLASS[tone] || "";
  const clickable = typeof onClick === "function";
  const chipLabel = tone === "files" ? compactFileChipLabel(label) : compactMetaLabel(label);
  return /* @__PURE__ */ jsx4(
    UsageSummaryChip,
    {
      tag,
      label: chipLabel,
      title: title || label,
      className: `conv-msg-usage-chip conv-msg-meta-chip ${toneClass}${clickable ? " conv-msg-meta-chip--clickable" : ""}`.trim(),
      onClick,
      role: clickable ? "button" : void 0,
      tabIndex: clickable ? 0 : void 0
    }
  );
}
function buildMetaClassificationChips(meta, cardTitle = "", { isUser = false } = {}) {
  if (!meta) return [];
  const chips = [];
  if (meta.premisas?.length) {
    for (const p of meta.premisas) {
      if (chipRedundantWithTitle(p, cardTitle)) continue;
      chips.push({ key: `p-${p}`, label: p, tone: "premisa", title: `Premisa: ${p}` });
    }
  }
  if (meta.extra?.operativa_key && !chipRedundantWithTitle(meta.extra.operativa_key, cardTitle)) {
    chips.push({
      key: "op",
      label: meta.extra.operativa_key,
      tone: "operativa",
      title: `Consulta operativa: ${meta.extra.operativa_key}`
    });
  }
  if (meta.itdconsulta && !chipRedundantWithTitle(meta.itdconsulta, cardTitle)) {
    chips.push({
      key: "itd",
      label: meta.itdconsulta,
      tone: "context",
      title: `itdconsulta: ${meta.itdconsulta}`
    });
  }
  const instrKey = !isUser ? instructionKeyFromMeta(meta) : null;
  if (instrKey && instrKey !== meta.extra?.operativa_key && instrKey !== meta.itdconsulta && !chipRedundantWithTitle(instrKey, cardTitle)) {
    chips.push({ key: "pmpt", label: instrKey, tone: "context", title: `Instrucci\xF3n: ${instrKey}` });
  }
  return chips;
}
function MetaChipRow({ meta, isUser = false, hideUsageMetrics = false, hideClassificationChips = false, align = "left", cardTitle = "", onFileSearch }) {
  if (!meta) return null;
  const hideUsage = hideUsageMetrics || isUser;
  const tk = meta.tokens?.total ? meta.tokens : tokensFromUsage(meta.usage);
  const chips = hideClassificationChips ? [] : buildMetaClassificationChips(meta, cardTitle, { isUser });
  if (!hideUsage && meta.model) {
    chips.push({
      key: "model",
      label: meta.model,
      tone: "model",
      title: meta.modelo_autoswitch_vision ? "Modelo usado (autoswitch visi\xF3n)" : "Modelo LLM"
    });
  }
  if (!hideUsage && meta.modelo_autoswitch_vision) {
    const sw = visionAutoswitchBadge(meta);
    if (sw) {
      chips.push({ key: "vision-sw", label: sw.label, tone: "vision", title: sw.title });
    }
  }
  if (!hideUsage && meta.latency_ms != null && meta.latency_ms > 0) {
    chips.push({ key: "lat", label: `${meta.latency_ms}ms`, tone: "metric", title: "Latencia" });
  }
  if (!hideUsage && tk?.total > 0) {
    chips.push({ key: "tok", label: tk.total.toLocaleString("es-CO"), tone: "metric", title: `Tokens: ${tk.total}` });
  }
  if (meta.stream_ok === false) {
    chips.push({ key: "stream", label: "err", tone: "error", title: meta.stream_error || "Stream fall\xF3" });
  }
  if (!isUser) {
    const archivos = archivosCitadosFromMeta(meta);
    const openFileSearch = typeof onFileSearch === "function" ? () => onFileSearch(meta) : void 0;
    for (const name of archivos) {
      chips.push({
        key: `file-${name}`,
        label: name,
        tone: "files",
        title: openFileSearch ? `Ver fragmento consultado: ${name}` : name,
        onClick: openFileSearch
      });
    }
  }
  if (!chips.length) return null;
  const { Stack: Stack2 } = getMaterialUI();
  return /* @__PURE__ */ jsx4(
    Stack2,
    {
      direction: "row",
      spacing: 0.25,
      flexWrap: "wrap",
      useFlexGap: true,
      className: "conv-msg-meta-chips",
      sx: { justifyContent: align === "right" ? "flex-end" : "flex-start" },
      children: chips.map((c) => /* @__PURE__ */ jsx4(MetaBadge, { tag: c.tag, label: c.label, tone: c.tone, title: c.title, onClick: c.onClick }, c.key))
    }
  );
}
function MsgBody({ text, imagenes, audios, audiosTranscripcion, align = "left", onImageClick, streaming = false }) {
  const { Typography: Typography2, Box: Box2 } = getMaterialUI();
  const raw = String(text || "");
  const placeholderOnly = /^\((?:imagen adjunta|nota de voz)\)$/i.test(raw.trim());
  const hasText = Boolean(raw.trim()) && !placeholderOnly;
  const html = mdToHtml(raw);
  return /* @__PURE__ */ jsxs3(Fragment2, { children: [
    streaming && !hasText && !audios?.length ? /* @__PURE__ */ jsxs3(Box2, { className: "conv-stream-typing", "aria-label": "PatyIA est\xE1 escribiendo", role: "status", children: [
      /* @__PURE__ */ jsx4("span", {}),
      /* @__PURE__ */ jsx4("span", {}),
      /* @__PURE__ */ jsx4("span", {})
    ] }) : /* @__PURE__ */ jsxs3(Box2, { className: `conv-msg-body-wrap${streaming ? " conv-msg-body-wrap--streaming" : ""}`, children: [
      /* @__PURE__ */ jsx4(
        Typography2,
        {
          component: "div",
          variant: "body1",
          className: `conv-msg-body${streaming ? " conv-msg-body--streaming" : ""}`,
          sx: {
            lineHeight: 1.65,
            color: "text.primary",
            "& p": { m: 0, mb: 1.25 },
            "& p:last-child": { mb: 0 },
            "& a": { color: "primary.main", wordBreak: "break-word" },
            "& img": {
              width: 100,
              height: 100,
              maxWidth: 100,
              maxHeight: 100,
              objectFit: "cover",
              objectPosition: "center",
              borderRadius: "0.5rem",
              my: 1,
              cursor: "zoom-in",
              display: "inline-block",
              verticalAlign: "middle"
            },
            "& pre, & code": { fontFamily: '"IBM Plex Mono", monospace', fontSize: "0.85em" }
          },
          dangerouslySetInnerHTML: { __html: html },
          onClick: (e) => {
            const img = e.target?.closest?.("img");
            if (img?.src && onImageClick) {
              e.preventDefault();
              onImageClick(img.src);
            }
          }
        }
      ),
      streaming && hasText ? /* @__PURE__ */ jsx4(Box2, { component: "span", className: "conv-stream-cursor", "aria-hidden": true }) : null
    ] }),
    imagenes?.length > 0 && /* @__PURE__ */ jsx4(ConvMsgImages, { items: imagenes, align, onImageClick }),
    audios?.length > 0 && /* @__PURE__ */ jsx4(ConvMsgAudios, { items: audios, transcriptions: audiosTranscripcion, align })
  ] });
}
function ConvMsgAudios({ items, transcriptions, align = "right" }) {
  const { Box: Box2, Typography: Typography2 } = getMaterialUI();
  const renderable = (items || []).filter((src) => String(src || "").trim().startsWith("data:audio/") || /^https?:\/\//i.test(String(src || "").trim()));
  if (!renderable.length) return null;
  return /* @__PURE__ */ jsx4(
    Box2,
    {
      className: `conv-msg-audios conv-msg-audios--${align}`,
      sx: {
        display: "flex",
        flexDirection: "column",
        gap: 1,
        mt: 1.25,
        alignItems: align === "right" ? "flex-end" : "flex-start"
      },
      children: renderable.map((src, idx) => /* @__PURE__ */ jsxs3(Box2, { className: "conv-msg-audio-item", children: [
        /* @__PURE__ */ jsx4("audio", { controls: true, preload: "metadata", src, "aria-label": `Nota de voz ${idx + 1}` }),
        transcriptions?.[idx] ? /* @__PURE__ */ jsx4(Typography2, { variant: "caption", component: "p", className: "conv-msg-audio-transcript", sx: { mt: 0.5, opacity: 0.85 }, children: transcriptions[idx] }) : null
      ] }, `${idx}-${String(src).slice(0, 32)}`))
    }
  );
}
function ConvMsgImages({ items, align = "right", onImageClick }) {
  const { Box: Box2 } = getMaterialUI();
  const renderable = (items || []).filter((src) => {
    const s = String(src || "").trim();
    if (/^\[file_id:/i.test(s)) return false;
    return s.startsWith("data:image/") || s.startsWith("http://") || s.startsWith("https://");
  });
  if (!renderable.length) return null;
  return /* @__PURE__ */ jsx4(
    Box2,
    {
      className: `conv-msg-images conv-msg-images--${align}`,
      sx: {
        display: "flex",
        flexWrap: "wrap",
        gap: 1,
        mt: 1.25,
        justifyContent: align === "right" ? "flex-end" : "flex-start"
      },
      children: renderable.map((src, idx) => /* @__PURE__ */ jsx4(
        "button",
        {
          type: "button",
          className: "conv-msg-image-lightbox-btn",
          "aria-label": `Ver imagen adjunta ${idx + 1} en tama\xF1o completo`,
          onClick: () => onImageClick?.(src),
          children: /* @__PURE__ */ jsx4("img", { src, alt: `Adjunto ${idx + 1}`, loading: "lazy" })
        },
        `${idx}-${src.slice(0, 32)}`
      ))
    }
  );
}
function UsageSummaryChip({ label, className = "", title, tag, onClick, role, tabIndex }) {
  const showVal = label != null && String(label).trim() !== "";
  const clickable = typeof onClick === "function";
  const handleKeyDown = clickable ? (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick(e);
    }
  } : void 0;
  return /* @__PURE__ */ jsx4(
    "span",
    {
      className: className || "conv-msg-usage-chip",
      title: title || (showVal ? label : tag),
      onClick,
      onKeyDown: handleKeyDown,
      role,
      tabIndex,
      children: /* @__PURE__ */ jsxs3("span", { className: "conv-msg-usage-chip__inner", children: [
        tag ? /* @__PURE__ */ jsx4("span", { className: "conv-msg-usage-chip__key", children: tag }) : null,
        showVal ? /* @__PURE__ */ jsx4("span", { className: "conv-msg-usage-chip__val", children: label }) : null
      ] })
    }
  );
}
function UsageDialogMetaPanel({ meta }) {
  const { Box: Box2 } = getMaterialUI();
  const ctxItems = buildUsageDialogCtxItems(meta);
  if (!ctxItems.length) return null;
  return /* @__PURE__ */ jsx4(Box2, { className: "conv-usage-dialog__meta conv-usage-dialog__meta--ctx", children: /* @__PURE__ */ jsx4("div", { className: "conv-usage-dialog__ctx-grid", children: ctxItems.map((item) => /* @__PURE__ */ jsxs3(
    "div",
    {
      className: [
        "conv-usage-dialog__ctx-item",
        item.wide ? "conv-usage-dialog__ctx-item--wide" : "",
        item.vision ? "conv-usage-dialog__ctx-item--vision" : ""
      ].filter(Boolean).join(" ") || void 0,
      children: [
        /* @__PURE__ */ jsx4("span", { className: "conv-usage-dialog__ctx-k", children: item.label }),
        /* @__PURE__ */ jsx4("span", { className: `conv-usage-dialog__ctx-v${item.mono ? " conv-usage-dialog__mono" : ""}`, children: item.value })
      ]
    },
    item.key
  )) }) });
}
function UsageStatsDialog({ open, onClose, stats, msgLabel, fecha, meta }) {
  const { DialogContent: DialogContent2, Typography: Typography2, Box: Box2, Chip: Chip2, Stack: Stack2, Tooltip, IconButton } = getMaterialUI();
  const { useMemo: useMemo3, useState: useState4 } = getReact();
  let glass = null;
  try {
    glass = getGlass();
  } catch (_) {
    glass = null;
  }
  const { GlassSection, GlassInner } = glass || {};
  if (!stats) return null;
  const sections = [
    {
      key: "msg",
      title: "Mensaje",
      subtitle: "Costo y tokens de este turno",
      tokens: stats.tokens,
      cost: stats.cost,
      accent: "#34d399",
      tone: "success",
      icon: /* @__PURE__ */ jsx4(UI.Icon, { icon: "mdi:message-text-outline", size: 18 }),
      show: true
    },
    {
      key: "prev",
      title: "Acumulado anterior",
      subtitle: "Suma del hilo antes de este mensaje",
      tokens: stats.previousTokens,
      cost: stats.previousCost,
      accent: "#60a5fa",
      tone: "blue",
      icon: /* @__PURE__ */ jsx4(UI.Icon, { icon: "mdi:history", size: 18 }),
      show: usageHasData(stats.previousTokens, stats.previousCost)
    },
    {
      key: "cum",
      title: "Total acumulado",
      subtitle: "Suma del hilo incluyendo este mensaje",
      tokens: stats.cumulativeTokens,
      cost: stats.cumulativeCost,
      accent: "#f59e0b",
      tone: "warn",
      icon: /* @__PURE__ */ jsx4(UI.Icon, { icon: "mdi:sigma", size: 18 }),
      show: usageHasData(stats.cumulativeTokens, stats.cumulativeCost)
    }
  ].filter((s) => s.show);
  const chunks = useMemo3(() => chunksFromMeta(meta), [meta]);
  const archivos = useMemo3(() => archivosCitadosFromMeta(meta), [meta]);
  const [openChunk, setOpenChunk] = useState4(null);
  const opKey = meta?.extra?.operativa_key;
  const header = resolveUsageDialogHeader(msgLabel, fecha, opKey);
  const showMetaPanel = Boolean(
    meta?.ts || meta?.model || meta?.modelo_autoswitch_vision || formatLatencySeconds(meta?.latency_ms) || meta?.itdconsulta
  );
  return /* @__PURE__ */ jsxs3(Fragment2, { children: [
    /* @__PURE__ */ jsxs3(
      GlassDialog,
      {
        open,
        onClose,
        maxWidth: "sm",
        fullWidth: true,
        header: /* @__PURE__ */ jsx4(
          GlassDialogHeader,
          {
            icon: header.icon,
            title: header.title,
            subtitle: header.subtitle,
            accent: header.accent,
            onClose
          }
        ),
        children: [
          /* @__PURE__ */ jsx4(DialogContent2, { dividers: true, className: "conv-usage-dialog", sx: glassDialogContentSx({ p: { xs: 1.5, sm: 2 } }), children: /* @__PURE__ */ jsxs3(Box2, { className: "conv-usage-dialog__stack", children: [
            showMetaPanel ? /* @__PURE__ */ jsx4(UsageDialogMetaPanel, { meta }) : null,
            sections.map((section) => /* @__PURE__ */ jsx4(
              UsageDialogSection,
              {
                section,
                GlassSection,
                GlassInner
              },
              section.key
            )),
            chunks.length || archivos.length ? GlassSection ? /* @__PURE__ */ jsxs3(
              GlassSection,
              {
                sectionKey: "conv-usage-chunks",
                className: "conv-usage-dialog__chunks-section",
                title: "Fragmentos citados",
                accent: "#7c3aed",
                tone: "purple",
                headerSx: { borderRadius: "0.75rem 0.75rem 0 0" },
                bodySx: { pt: { xs: 1.25, sm: 1.5 } },
                children: [
                  /* @__PURE__ */ jsx4(Typography2, { variant: "caption", color: "text.secondary", component: "div", className: "conv-usage-dialog__section-sub", sx: { mb: 1 }, children: archivos.length ? `Chunks extra\xEDdos por file_search (${chunks.length} de ${archivos.length} archivo${archivos.length === 1 ? "" : "s"}).` : `${chunks.length} fragmento${chunks.length === 1 ? "" : "s"} del message.` }),
                  archivos.length ? /* @__PURE__ */ jsx4(Stack2, { direction: "row", spacing: 0.5, flexWrap: "wrap", useFlexGap: true, className: "conv-usage-dialog__files", sx: { mb: 1 }, children: archivos.map((name) => {
                    const clickable = chunks.some((c) => c.filename === name);
                    return /* @__PURE__ */ jsx4(
                      Chip2,
                      {
                        size: "small",
                        variant: "outlined",
                        clickable,
                        onClick: clickable ? () => {
                          const first = chunks.find((c) => c.filename === name);
                          if (first) setOpenChunk(first);
                        } : void 0,
                        icon: /* @__PURE__ */ jsx4("iconify-icon", { icon: "mdi:file-document-outline", width: "14", height: "14" }),
                        label: name,
                        title: clickable ? `Ver fragmentos de ${name}` : name,
                        className: "conv-usage-dialog__file-chip"
                      },
                      name
                    );
                  }) }) : null,
                  /* @__PURE__ */ jsx4(Stack2, { spacing: 0.75, className: "conv-usage-dialog__chunks", children: chunks.map((c) => /* @__PURE__ */ jsxs3(
                    Box2,
                    {
                      className: "conv-usage-dialog__chunk",
                      onClick: () => setOpenChunk(c),
                      role: "button",
                      tabIndex: 0,
                      onKeyDown: (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setOpenChunk(c);
                        }
                      },
                      "aria-label": `Ver fragmento de ${c.filename || c.fileId || "texto"}`,
                      children: [
                        /* @__PURE__ */ jsxs3(Stack2, { direction: "row", spacing: 0.75, alignItems: "center", sx: { mb: 0.35 }, children: [
                          /* @__PURE__ */ jsx4("iconify-icon", { icon: "mdi:text-box-search-outline", width: "16", height: "16" }),
                          /* @__PURE__ */ jsx4(Typography2, { variant: "body2", fontWeight: 600, sx: { flex: 1, minWidth: 0 }, children: c.filename || c.fileId || "fragmento" }),
                          c.score != null ? /* @__PURE__ */ jsx4(
                            Chip2,
                            {
                              size: "small",
                              variant: "outlined",
                              label: `score ${Number(c.score).toFixed(3)}`,
                              className: "conv-usage-dialog__chunk-score"
                            }
                          ) : null,
                          /* @__PURE__ */ jsx4(Tooltip, { title: "Ver fragmento en full-page", children: /* @__PURE__ */ jsx4(IconButton, { size: "small", "aria-label": "Abrir fragmento", className: "conv-usage-dialog__chunk-open", children: /* @__PURE__ */ jsx4("iconify-icon", { icon: "mdi:fullscreen", width: "16", height: "16" }) }) })
                        ] }),
                        /* @__PURE__ */ jsx4(
                          Typography2,
                          {
                            variant: "caption",
                            component: "pre",
                            className: "conv-usage-dialog__chunk-preview",
                            sx: { whiteSpace: "pre-wrap", wordBreak: "break-word", m: 0, fontFamily: "inherit" },
                            children: chunkPreview(c.text, 280)
                          }
                        )
                      ]
                    },
                    c.key
                  )) })
                ]
              }
            ) : /* @__PURE__ */ jsxs3(Box2, { className: "conv-usage-dialog__section-card conv-usage-dialog__section-card--chunks", children: [
              /* @__PURE__ */ jsxs3("div", { className: "conv-usage-dialog__section-head", children: [
                /* @__PURE__ */ jsx4(Typography2, { component: "h3", variant: "subtitle2", className: "conv-usage-dialog__section-title", children: "Fragmentos citados" }),
                /* @__PURE__ */ jsx4(Typography2, { variant: "caption", color: "text.secondary", className: "conv-usage-dialog__section-sub", children: archivos.length ? `Chunks extra\xEDdos por file_search (${chunks.length} de ${archivos.length} archivo${archivos.length === 1 ? "" : "s"}).` : `${chunks.length} fragmento${chunks.length === 1 ? "" : "s"} del message.` })
              ] }),
              archivos.length ? /* @__PURE__ */ jsx4(Stack2, { direction: "row", spacing: 0.5, flexWrap: "wrap", useFlexGap: true, className: "conv-usage-dialog__files", children: archivos.map((name) => {
                const clickable = chunks.some((c) => c.filename === name);
                return /* @__PURE__ */ jsx4(
                  Chip2,
                  {
                    size: "small",
                    variant: "outlined",
                    clickable,
                    onClick: clickable ? () => {
                      const first = chunks.find((c) => c.filename === name);
                      if (first) setOpenChunk(first);
                    } : void 0,
                    icon: /* @__PURE__ */ jsx4("iconify-icon", { icon: "mdi:file-document-outline", width: "14", height: "14" }),
                    label: name,
                    title: clickable ? `Ver fragmentos de ${name}` : name,
                    className: "conv-usage-dialog__file-chip"
                  },
                  name
                );
              }) }) : null,
              /* @__PURE__ */ jsx4(Stack2, { spacing: 0.75, className: "conv-usage-dialog__chunks", children: chunks.map((c) => /* @__PURE__ */ jsxs3(
                Box2,
                {
                  className: "conv-usage-dialog__chunk",
                  onClick: () => setOpenChunk(c),
                  role: "button",
                  tabIndex: 0,
                  onKeyDown: (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setOpenChunk(c);
                    }
                  },
                  "aria-label": `Ver fragmento de ${c.filename || c.fileId || "texto"}`,
                  children: [
                    /* @__PURE__ */ jsxs3(Stack2, { direction: "row", spacing: 0.75, alignItems: "center", sx: { mb: 0.35 }, children: [
                      /* @__PURE__ */ jsx4("iconify-icon", { icon: "mdi:text-box-search-outline", width: "16", height: "16" }),
                      /* @__PURE__ */ jsx4(Typography2, { variant: "body2", fontWeight: 600, sx: { flex: 1, minWidth: 0 }, children: c.filename || c.fileId || "fragmento" }),
                      c.score != null ? /* @__PURE__ */ jsx4(
                        Chip2,
                        {
                          size: "small",
                          variant: "outlined",
                          label: `score ${Number(c.score).toFixed(3)}`,
                          className: "conv-usage-dialog__chunk-score"
                        }
                      ) : null,
                      /* @__PURE__ */ jsx4(Tooltip, { title: "Ver fragmento en full-page", children: /* @__PURE__ */ jsx4(IconButton, { size: "small", "aria-label": "Abrir fragmento", className: "conv-usage-dialog__chunk-open", children: /* @__PURE__ */ jsx4("iconify-icon", { icon: "mdi:fullscreen", width: "16", height: "16" }) }) })
                    ] }),
                    /* @__PURE__ */ jsx4(
                      Typography2,
                      {
                        variant: "caption",
                        component: "pre",
                        className: "conv-usage-dialog__chunk-preview",
                        sx: { whiteSpace: "pre-wrap", wordBreak: "break-word", m: 0, fontFamily: "inherit" },
                        children: chunkPreview(c.text, 280)
                      }
                    )
                  ]
                },
                c.key
              )) })
            ] }) : null
          ] }) }),
          /* @__PURE__ */ jsx4(GlassDialogCloseActions, { onClose })
        ]
      }
    ),
    /* @__PURE__ */ jsx4(
      MdFullPageDialog,
      {
        open: Boolean(openChunk),
        onClose: () => setOpenChunk(null),
        source: openChunk?.text || "",
        title: openChunk ? `Fragmento \xB7 ${openChunk.filename || openChunk.fileId || "texto exacto"}` : "Fragmento",
        subtitle: openChunk ? [
          openChunk.score != null ? `score ${Number(openChunk.score).toFixed(3)}` : "",
          openChunk.queries?.length ? `Queries: ${openChunk.queries.join(" \xB7 ")}` : ""
        ].filter(Boolean).join("  \xB7  ") : "",
        accent: "#7c3aed",
        icon: "mdi:text-box-search-outline"
      }
    )
  ] });
}
function UsageDialogSection({ section, GlassSection, GlassInner }) {
  const { Box: Box2, Typography: Typography2, Stack: Stack2 } = getMaterialUI();
  const { Icon } = UI;
  const cost = section?.cost;
  const tokens = section?.tokens;
  const totalCost = Number(cost?.total ?? 0) || 0;
  const totalTokens = Number(tokens?.total ?? 0) || 0;
  const reasoning = Number(tokens?.reason ?? tokens?.reasoning ?? 0) || 0;
  const totalTokLabel = totalTokens ? totalTokens.toLocaleString("es-CO") : "\u2014";
  const costLabel = totalCost > 0 ? `$${totalCost.toFixed(6)}` : "\u2014";
  const reasonLabel = reasoning > 0 ? `${reasoning.toLocaleString("es-CO")} razon.` : null;
  const body = /* @__PURE__ */ jsxs3(Box2, { className: "conv-usage-dialog__section-body", children: [
    /* @__PURE__ */ jsxs3(
      Stack2,
      {
        direction: { xs: "column", sm: "row" },
        spacing: { xs: 1, sm: 2 },
        alignItems: { xs: "stretch", sm: "center" },
        justifyContent: "space-between",
        className: "conv-usage-dialog__headline",
        children: [
          /* @__PURE__ */ jsxs3(Box2, { className: "conv-usage-dialog__headline-main", children: [
            /* @__PURE__ */ jsx4(Typography2, { variant: "overline", className: "conv-usage-dialog__headline-k", sx: { lineHeight: 1, display: "block", opacity: 0.7 }, children: "Costo" }),
            /* @__PURE__ */ jsx4(
              Typography2,
              {
                variant: "h4",
                component: "span",
                className: `conv-usage-dialog__headline-v conv-usage-dialog__headline-v--${section.key}`,
                sx: { fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.05, fontFamily: '"IBM Plex Mono", ui-monospace, monospace' },
                children: costLabel
              }
            )
          ] }),
          /* @__PURE__ */ jsxs3(Stack2, { direction: "row", spacing: 1, alignItems: "center", className: "conv-usage-dialog__headline-meta", children: [
            /* @__PURE__ */ jsxs3(Box2, { className: "conv-usage-dialog__headline-meta-item", children: [
              /* @__PURE__ */ jsx4(Typography2, { variant: "overline", sx: { lineHeight: 1, display: "block", opacity: 0.7 }, children: "Tokens" }),
              /* @__PURE__ */ jsx4(
                Typography2,
                {
                  variant: "h6",
                  component: "span",
                  className: "conv-usage-dialog__headline-meta-v",
                  sx: { fontWeight: 700, lineHeight: 1.1, fontFamily: '"IBM Plex Mono", ui-monospace, monospace' },
                  children: totalTokLabel
                }
              )
            ] }),
            reasonLabel ? /* @__PURE__ */ jsxs3(Box2, { className: "conv-usage-dialog__headline-meta-item conv-usage-dialog__headline-meta-item--reason", children: [
              /* @__PURE__ */ jsx4(Typography2, { variant: "overline", sx: { lineHeight: 1, display: "block", opacity: 0.7 }, children: "Razonamiento" }),
              /* @__PURE__ */ jsx4(
                Typography2,
                {
                  variant: "body1",
                  component: "span",
                  sx: { fontWeight: 600, lineHeight: 1.1, fontFamily: '"IBM Plex Mono", ui-monospace, monospace' },
                  children: reasonLabel
                }
              )
            ] }) : null
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx4(Box2, { className: "conv-usage-dialog__metrics-wrap", children: /* @__PURE__ */ jsx4(
      UsageMetricsGrid,
      {
        className: "conv-usage-dialog__metrics",
        hideRowLabels: true,
        sections: [{ key: section.key, label: section.title, tokens: section.tokens, cost: section.cost }]
      }
    ) })
  ] });
  if (!GlassSection) {
    return /* @__PURE__ */ jsxs3(Box2, { className: `conv-usage-dialog__section-card conv-usage-dialog__section-card--${section.key}`, children: [
      /* @__PURE__ */ jsxs3("div", { className: "conv-usage-dialog__section-head", children: [
        /* @__PURE__ */ jsx4(Typography2, { component: "h3", variant: "subtitle2", className: "conv-usage-dialog__section-title", children: section.title }),
        /* @__PURE__ */ jsx4(Typography2, { variant: "caption", color: "text.secondary", className: "conv-usage-dialog__section-sub", children: section.subtitle })
      ] }),
      body
    ] });
  }
  return /* @__PURE__ */ jsx4(
    GlassSection,
    {
      sectionKey: `conv-usage-${section.key}`,
      className: `conv-usage-dialog__glass-section conv-usage-dialog__glass-section--${section.key}`,
      title: /* @__PURE__ */ jsxs3(Stack2, { direction: "row", spacing: 1, alignItems: "baseline", sx: { minWidth: 0, flex: 1 }, children: [
        /* @__PURE__ */ jsx4(Typography2, { component: "span", variant: "subtitle1", sx: { fontWeight: 700, letterSpacing: -0.2 }, children: section.title }),
        /* @__PURE__ */ jsx4(Typography2, { component: "span", variant: "caption", color: "text.secondary", sx: { flex: 1, minWidth: 0 }, children: section.subtitle })
      ] }),
      icon: section.icon,
      accent: section.accent,
      tone: section.tone,
      headerSx: { borderRadius: "0.75rem 0.75rem 0 0" },
      bodySx: { pt: 1.25, pb: { xs: 1.25, sm: 1.5 } },
      children: body
    }
  );
}
function UsageStatsColumn({ stats, align = "right", msgLabel, fecha, meta, isUser = false }) {
  const { Box: Box2 } = getMaterialUI();
  const [open, setOpen] = useState3(false);
  const modelRaw = String(meta?.model ?? "").trim();
  const modelLabel = modelRaw ? modelBadgeLabel(modelRaw) : "";
  const latencyLabel = formatLatencySeconds(meta?.latency_ms);
  const autoswitchBadge = visionAutoswitchBadge(meta);
  const metaTk = meta?.tokens?.total ? meta.tokens : tokensFromUsage(meta?.usage);
  const metaTokTotal = Number(metaTk?.total ?? 0) || 0;
  const metaTokLabel = metaTokTotal > 0 ? metaTokTotal.toLocaleString("es-CO") : "";
  const contextChips = buildMetaClassificationChips(meta, msgLabel, { isUser });
  const showMetaBadges = Boolean(modelLabel || latencyLabel || autoswitchBadge || metaTokLabel || contextChips.length);
  const hasUsage = Boolean(
    stats && (usageHasData(stats.tokens, stats.cost) || usageHasData(stats.previousTokens, stats.previousCost))
  );
  if (!showMetaBadges && !hasUsage) return null;
  const msgSummary = hasUsage ? formatUsageSummary(stats.tokens, stats.cost) : null;
  const cumSummary = hasUsage ? formatUsageSummary(stats.cumulativeTokens, stats.cumulativeCost) : null;
  const showCum = hasUsage && !isUser && usageHasData(stats.cumulativeTokens, stats.cumulativeCost);
  const groups = hasUsage ? [
    { key: "msg", label: "Mensaje", summary: msgSummary },
    ...showCum ? [{ key: "cum", label: "Acumulado", summary: cumSummary }] : []
  ] : [];
  const openDialog = (e) => {
    if (!hasUsage) return;
    e?.stopPropagation?.();
    setOpen(true);
  };
  return /* @__PURE__ */ jsxs3(Fragment2, { children: [
    /* @__PURE__ */ jsxs3(
      Box2,
      {
        className: [
          "conv-msg-usage-stats",
          `conv-msg-usage-stats--${align}`,
          hasUsage ? "conv-msg-usage-stats--clickable" : ""
        ].filter(Boolean).join(" "),
        role: hasUsage ? "button" : void 0,
        tabIndex: hasUsage ? 0 : void 0,
        title: hasUsage ? "Clic para ver desglose completo" : void 0,
        "aria-label": hasUsage ? "Ver detalle de uso: costo USD y tokens" : void 0,
        onClick: hasUsage ? openDialog : void 0,
        onKeyDown: hasUsage ? (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            openDialog();
          }
        } : void 0,
        sx: {
          flexShrink: 0,
          width: "fit-content",
          maxWidth: { xs: "min(100%, 18rem)", sm: groups.length > 1 ? "22rem" : "18rem" },
          pt: 0.25,
          alignSelf: "flex-start",
          cursor: hasUsage ? "pointer" : void 0,
          ...hasUsage ? {
            transition: "border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease, transform 0.16s ease",
            "&:hover": {
              borderColor: "rgba(0, 229, 255, 0.72)",
              background: "linear-gradient(165deg, rgba(14, 26, 48, 0.98), rgba(20, 32, 58, 0.92))",
              boxShadow: "0 0 0 1px rgba(0, 229, 255, 0.35), 0 12px 36px rgba(30, 144, 255, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
              transform: "translateY(-2px)"
            },
            "&:active": {
              transform: "translateY(0)",
              boxShadow: "0 0 0 1px rgba(0, 229, 255, 0.22), 0 4px 16px rgba(30, 144, 255, 0.18)"
            },
            'html[data-mui-color-scheme="light"] &:hover': {
              borderColor: "rgba(30, 144, 255, 0.48)",
              background: "linear-gradient(165deg, #f0f9ff, #eef2ff)",
              boxShadow: "0 0 0 1px rgba(30, 144, 255, 0.16), 0 8px 24px rgba(30, 144, 255, 0.14)"
            },
            'html[data-mui-color-scheme="light"] &:active': {
              background: "#e0f2fe"
            }
          } : {}
        },
        children: [
          showMetaBadges ? /* @__PURE__ */ jsxs3(Box2, { className: `conv-msg-usage-stats__meta conv-msg-usage-stats__meta--${align}`, children: [
            contextChips.map((c) => /* @__PURE__ */ jsx4(MetaBadge, { label: c.label, tone: c.tone, title: c.title }, c.key)),
            modelLabel ? /* @__PURE__ */ jsx4(
              UsageSummaryChip,
              {
                tag: "MODELO",
                label: modelLabel,
                className: "conv-msg-usage-chip conv-msg-usage-chip--model",
                title: meta?.modelo_autoswitch_vision ? modelRaw && modelRaw !== modelLabel ? `Modelo usado (autoswitch visi\xF3n): ${modelRaw}` : "Modelo usado tras autoswitch visi\xF3n" : modelRaw && modelRaw !== modelLabel ? `Modelo: ${modelRaw}` : "Modelo LLM"
              }
            ) : null,
            autoswitchBadge ? /* @__PURE__ */ jsx4(
              UsageSummaryChip,
              {
                tag: autoswitchBadge.tag,
                label: autoswitchBadge.label,
                className: "conv-msg-usage-chip conv-msg-usage-chip--vision",
                title: autoswitchBadge.title
              }
            ) : null,
            latencyLabel ? /* @__PURE__ */ jsx4(
              UsageSummaryChip,
              {
                tag: "LAT",
                label: latencyLabel,
                className: "conv-msg-usage-chip conv-msg-usage-chip--latency",
                title: "Tiempo de respuesta"
              }
            ) : null,
            metaTokLabel && !hasUsage ? /* @__PURE__ */ jsx4(
              UsageSummaryChip,
              {
                tag: "TOK",
                label: metaTokLabel,
                className: "conv-msg-usage-chip conv-msg-usage-chip--tokens",
                title: `Tokens: ${metaTokLabel}`
              }
            ) : null
          ] }) : null,
          groups.length > 0 ? /* @__PURE__ */ jsx4(Box2, { className: `conv-msg-usage-stats__groups conv-msg-usage-stats__groups--${align}`, children: groups.map((group) => /* @__PURE__ */ jsxs3(Box2, { className: `conv-msg-usage-stats__group conv-msg-usage-stats__group--${group.key}`, children: [
            /* @__PURE__ */ jsx4(
              UsageSummaryChip,
              {
                tag: group.key === "msg" ? "MSG" : "ACUM",
                className: [
                  "conv-msg-usage-chip",
                  "conv-msg-usage-chip--scope",
                  group.key === "msg" ? "conv-msg-usage-chip--scope-msg" : "conv-msg-usage-chip--scope-prev"
                ].join(" "),
                title: group.label
              }
            ),
            /* @__PURE__ */ jsx4(
              UsageSummaryChip,
              {
                tag: "USD",
                label: group.summary.usdText,
                className: "conv-msg-usage-chip conv-msg-usage-chip--usd",
                title: "Costo USD"
              }
            ),
            /* @__PURE__ */ jsx4(
              UsageSummaryChip,
              {
                tag: "TOK",
                label: group.summary.tokensText,
                className: "conv-msg-usage-chip conv-msg-usage-chip--tokens",
                title: group.key === "msg" ? "Tokens de este mensaje" : "Tokens acumulados del hilo (incluye este mensaje)"
              }
            )
          ] }, group.key)) }) : null
        ]
      }
    ),
    /* @__PURE__ */ jsx4(
      UsageStatsDialog,
      {
        open: open && hasUsage,
        onClose: () => setOpen(false),
        stats,
        msgLabel,
        fecha,
        meta
      }
    )
  ] });
}
function MsgRatingRow({ calificacion, onRate, disabled = false, busy = false, align = "right" }) {
  const { Stack: Stack2, IconButton, Tooltip, CircularProgress } = getMaterialUI();
  const { Icon } = UI;
  const rated = calificacion !== void 0 && calificacion !== null;
  const useful = calificacion === 1;
  const notUseful = calificacion === 0;
  const readOnly = disabled && !rated && !busy;
  const upTooltip = (() => {
    if (busy && !rated) return "Guardando calificaci\xF3n\u2026";
    if (useful) return "Calificado como \xFAtil";
    if (rated && notUseful) return "Calificado como no \xFAtil \xB7 no se puede cambiar";
    if (readOnly) return "Calificaci\xF3n no disponible (modo lectura)";
    return "Marcar como \xFAtil";
  })();
  const downTooltip = (() => {
    if (busy && !rated) return "Guardando calificaci\xF3n\u2026";
    if (notUseful) return "Calificado como no \xFAtil";
    if (rated && useful) return "Calificado como \xFAtil \xB7 no se puede cambiar";
    if (readOnly) return "Calificaci\xF3n no disponible (modo lectura)";
    return "Marcar como no \xFAtil";
  })();
  return /* @__PURE__ */ jsxs3(
    Stack2,
    {
      direction: "row",
      spacing: 0.25,
      alignItems: "center",
      justifyContent: align === "right" ? "flex-end" : "flex-start",
      className: `conv-msg-rating conv-msg-rating--${align}`,
      role: "group",
      "aria-label": "Calificaci\xF3n del mensaje",
      children: [
        /* @__PURE__ */ jsx4(Tooltip, { title: upTooltip, arrow: true, children: /* @__PURE__ */ jsx4("span", { children: /* @__PURE__ */ jsx4(
          IconButton,
          {
            size: "small",
            className: `conv-msg-rating__btn conv-msg-rating__btn--up${useful ? " conv-msg-rating__btn--active" : ""}`,
            "aria-label": useful ? "Calificado como \xFAtil" : "Marcar como \xFAtil",
            "aria-pressed": useful,
            disabled: disabled || busy || rated,
            onClick: () => onRate(true),
            children: busy && !rated ? /* @__PURE__ */ jsx4(CircularProgress, { size: 16 }) : /* @__PURE__ */ jsx4(Icon, { icon: useful ? "mdi:thumb-up" : "mdi:thumb-up-outline", size: 18 })
          }
        ) }) }),
        /* @__PURE__ */ jsx4(Tooltip, { title: downTooltip, arrow: true, children: /* @__PURE__ */ jsx4("span", { children: /* @__PURE__ */ jsx4(
          IconButton,
          {
            size: "small",
            className: `conv-msg-rating__btn conv-msg-rating__btn--down${notUseful ? " conv-msg-rating__btn--active" : ""}`,
            "aria-label": notUseful ? "Calificado como no \xFAtil" : "Marcar como no \xFAtil",
            "aria-pressed": notUseful,
            disabled: disabled || busy || rated,
            onClick: () => onRate(false),
            children: /* @__PURE__ */ jsx4(Icon, { icon: notUseful ? "mdi:thumb-down" : "mdi:thumb-down-outline", size: 18 })
          }
        ) }) })
      ]
    }
  );
}
function resolveMsgImensaje(msg) {
  const imensaje = Number(msg?.imensaje);
  return imensaje > 0 ? imensaje : void 0;
}
var MensajeSection = memo(function MensajeSection2({ msg, onMeta, compactMeta = false, chatUserDisplayName, chatUserNick, showUsageStats = false, onImageClick, streamingMsgId = null, onRateMessage = null, canRate = false, ratingMsgId = null, operativaEnter = false }) {
  const { Alert, Box: Box2 } = getMaterialUI();
  const [fileSearchOpen, setFileSearchOpen] = useState3(false);
  const meta = roleMetaFor(msg, compactMeta);
  const title = roleTitle(msg, chatUserDisplayName, chatUserNick);
  const titleCaption = roleUserCaption(msg, chatUserNick);
  const fecha = msg.fecha ? String(msg.fecha) : "";
  const fechaIso = msg.fechaIso ? String(msg.fechaIso) : "";
  const isUser = msg.esUsuario;
  const isOperativa = msg.esOperativa;
  const isStreaming = Boolean(msg.isStreaming || streamingMsgId && msg.idMsg === streamingMsgId);
  const showMetaBtn = Boolean(onMeta && msg.meta && metaWorthDialog(msg.meta, isUser));
  const showFileSearchChips = Boolean(!compactMeta && !isUser && msg.meta && metaHasFileSearch(msg.meta));
  const showMetaChips = Boolean(!compactMeta && (onMeta || showFileSearchChips));
  const statsSide = isUser ? "left" : "right";
  const msgImensaje = resolveMsgImensaje(msg);
  const showRating = Boolean(
    onRateMessage && !isUser && !isOperativa && !isStreaming && msgImensaje && (canRate || msg.calificacion !== void 0)
  );
  const ratingRow = showRating ? /* @__PURE__ */ jsx4(
    MsgRatingRow,
    {
      calificacion: msg.calificacion,
      disabled: !canRate,
      busy: ratingMsgId === msg.idMsg,
      align: "left",
      onRate: (butil) => onRateMessage({ ...msg, imensaje: msgImensaje }, butil)
    }
  ) : null;
  const showMetricsColumn = Boolean(showUsageStats && sideLogPanelWorthShowing(msg));
  const showSideColumn = Boolean(showMetricsColumn || ratingRow);
  const hideUsageInChips = showMetricsColumn;
  const fullLayout = !compactMeta;
  const rowMaxWidth = showMetricsColumn ? "100%" : fullLayout ? isOperativa ? "min(96%, 52rem)" : isUser ? "min(96%, 44rem)" : "min(96%, 48rem)" : isOperativa ? "92%" : "min(96%, 42rem)";
  const cardMaxWidth = showMetricsColumn ? isOperativa ? "72%" : { xs: "100%", sm: "min(48rem, calc(100% - 11.5rem))" } : "100%";
  const roleClass = isOperativa ? `conv-msg--operativa${operativaEnter ? " conv-msg--operativa-enter" : ""}` : "";
  return /* @__PURE__ */ jsxs3(
    Box2,
    {
      className: [compactMeta ? "conv-msg--compact" : "", roleClass].filter(Boolean).join(" ") || void 0,
      sx: {
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        width: "100%",
        mb: isOperativa ? compactMeta ? 1 : 1.75 : compactMeta ? 2.5 : 2
      },
      children: [
        /* @__PURE__ */ jsxs3(
          Box2,
          {
            className: [
              "conv-msg-row",
              compactMeta ? "conv-msg-row--compact" : "",
              showMetricsColumn ? "conv-msg-row--logs" : "",
              isUser ? "conv-msg-row--user" : "conv-msg-row--assistant"
            ].filter(Boolean).join(" "),
            sx: {
              display: "flex",
              flexDirection: isUser ? "row-reverse" : "row",
              alignItems: showSideColumn ? "flex-start" : "flex-start",
              gap: { xs: 0.75, sm: 1.25 },
              width: showMetricsColumn ? "100%" : "fit-content",
              maxWidth: showMetricsColumn ? "100%" : rowMaxWidth,
              minWidth: 0,
              opacity: 1
            },
            children: [
              /* @__PURE__ */ jsx4(
                Box2,
                {
                  className: "conv-msg-card-wrap",
                  sx: {
                    flex: "0 1 auto",
                    width: "fit-content",
                    maxWidth: cardMaxWidth,
                    minWidth: 0
                  },
                  children: /* @__PURE__ */ jsxs3(
                    SectionCard,
                    {
                      id: `conv-msg-${msg.idMsg}`,
                      icon: meta.icon,
                      title,
                      titleCaption: titleCaption || void 0,
                      fecha: fecha || void 0,
                      fechaIso: fechaIso || void 0,
                      accent: meta.accent,
                      align: isUser ? "right" : "left",
                      operativa: isOperativa,
                      compact: compactMeta,
                      streaming: isStreaming,
                      onMeta: showMetaBtn ? () => onMeta(msg) : void 0,
                      metaChips: showMetaChips ? /* @__PURE__ */ jsx4(
                        MetaChipRow,
                        {
                          meta: msg.meta,
                          isUser,
                          hideUsageMetrics: hideUsageInChips || isUser,
                          hideClassificationChips: showUsageStats,
                          align: isUser ? "right" : "left",
                          cardTitle: title,
                          onFileSearch: showFileSearchChips ? () => setFileSearchOpen(true) : void 0
                        }
                      ) : null,
                      children: [
                        msg.streamFailed && msg.streamError && /* @__PURE__ */ jsx4(Alert, { severity: "warning", sx: { mb: 1.5, py: 0.25, fontSize: "0.78rem" }, children: msg.streamError }),
                        msg.contenido?.trim() || msg.imagenes?.length || msg.audios?.length || isStreaming ? /* @__PURE__ */ jsx4(
                          MsgBody,
                          {
                            text: msg.contenido,
                            imagenes: msg.imagenes,
                            audios: msg.audios,
                            audiosTranscripcion: msg.audiosTranscripcion,
                            align: isUser ? "right" : "left",
                            onImageClick,
                            streaming: isStreaming
                          }
                        ) : null
                      ]
                    }
                  )
                }
              ),
              showSideColumn && /* @__PURE__ */ jsxs3(
                Box2,
                {
                  className: `conv-msg-side-column conv-msg-side-column--${statsSide}`,
                  sx: {
                    flexShrink: 0,
                    maxWidth: { xs: "min(100%, 16rem)", sm: "18rem" },
                    pt: 0.25,
                    pb: 0.25,
                    alignSelf: "stretch"
                  },
                  children: [
                    showMetricsColumn ? /* @__PURE__ */ jsx4(
                      UsageStatsColumn,
                      {
                        stats: msg.usageStats,
                        align: statsSide,
                        msgLabel: title,
                        fecha,
                        meta: msg.meta,
                        isUser
                      }
                    ) : null,
                    ratingRow ? /* @__PURE__ */ jsx4(Box2, { className: "conv-msg-rating-slot", children: ratingRow }) : null
                  ]
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsx4(
          FileSearchDialog,
          {
            open: fileSearchOpen,
            onClose: () => setFileSearchOpen(false),
            meta: msg.meta,
            title: `File Search \xB7 ${title}`
          }
        )
      ]
    }
  );
}, (prev, next) => prev.msg === next.msg && prev.streamingMsgId === next.streamingMsgId && prev.compactMeta === next.compactMeta && prev.chatUserDisplayName === next.chatUserDisplayName && prev.chatUserNick === next.chatUserNick && prev.showUsageStats === next.showUsageStats && prev.ratingMsgId === next.ratingMsgId && prev.canRate === next.canRate && prev.operativaEnter === next.operativaEnter);
function ConvLogWebView({ mensajes, onMeta, compactMeta = false, emptyHint, chatUserDisplayName, chatUserNick, showUsageStats = true, streamingMsgId = null, onRateMessage = null, canRate = false, ratingMsgId = null, threadKey = null, threadClassName = "" }) {
  const { Box: Box2, Typography: Typography2 } = getMaterialUI();
  const [lightboxSrc, setLightboxSrc] = useState3(null);
  const operativaEnterIds = useOperativaEnterIds(mensajes, threadKey, { enabled: !compactMeta });
  const mensajesConStats = useMemo2(
    () => attachUsageStats(mensajes || []),
    [mensajes]
  );
  const hasUsageStats = showUsageStats && threadHasUsageStats(mensajesConStats);
  const onImageClick = useMemo2(() => (src) => setLightboxSrc(src), []);
  if (!mensajes?.length) {
    if (emptyHint === null) return null;
    return /* @__PURE__ */ jsx4(Typography2, { variant: "body2", color: "text.secondary", sx: { textAlign: "center", py: 6 }, children: emptyHint || "Recupera por ID o pega un log para ver el hilo." });
  }
  return /* @__PURE__ */ jsxs3(Box2, { className: threadClassName || void 0, sx: { width: "100%", maxWidth: "100%" }, children: [
    mensajesConStats.map((m) => /* @__PURE__ */ jsx4(
      MensajeSection,
      {
        msg: m,
        onMeta,
        compactMeta,
        chatUserDisplayName,
        chatUserNick,
        showUsageStats: hasUsageStats,
        onImageClick,
        streamingMsgId,
        onRateMessage,
        canRate,
        ratingMsgId,
        operativaEnter: operativaEnterIds.has(m.idMsg)
      },
      m.idMsg
    )),
    /* @__PURE__ */ jsx4(ImageLightboxDialog, { open: Boolean(lightboxSrc), src: lightboxSrc, onClose: () => setLightboxSrc(null) })
  ] });
}
function convLogNavItems(mensajes) {
  return (mensajes || []).map((m, i) => {
    const rk = roleKey(m);
    const meta = ROLE_META[rk] || ROLE_META.assistant;
    const preview = String(m.contenido || "").replace(/\s+/g, " ").trim().slice(0, 48);
    return {
      id: m.idMsg,
      label: `#${i + 1} \xB7 ${roleTitle(m)}`,
      secondary: preview || "(sin texto)",
      accent: meta.accent,
      icon: meta.icon
    };
  });
}
export {
  ConvLogWebView,
  convLogNavItems
};
