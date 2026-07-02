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
function CodeMirrorPanel(props) {
  const Panel = window.ISAFront?.CodeMirrorPanel;
  if (!Panel) throw new Error("CodeMirrorPanel no cargado \u2014 recargue sin cach\xE9 (Ctrl+Shift+R).");
  return Panel(props);
}

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
function usageHasData(tokens, cost) {
  return (Number(tokens?.total ?? 0) || 0) > 0 || (Number(cost?.total_usd ?? 0) || 0) > 0;
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
function glassDialogTabsSx(extra = {}) {
  return {
    px: { xs: 1.5, sm: 2 },
    minHeight: 44,
    borderBottom: 1,
    borderColor: (t) => t.palette.mode === "dark" ? "rgba(99,102,241,0.28)" : "divider",
    bgcolor: (t) => t.palette.mode === "dark" ? "rgba(15,23,42,0.38)" : "rgba(248,250,252,0.92)",
    "& .MuiTab-root": { minHeight: 44, textTransform: "none", fontWeight: 600, fontSize: "0.88rem", opacity: 0.82 },
    "& .MuiTab-root.Mui-selected": { opacity: 1, color: "#1e90ff !important" },
    "& .MuiTabs-indicator": {
      height: 3,
      borderRadius: "3px 3px 0 0",
      background: "linear-gradient(90deg, #1e90ff, #00e5ff)",
      boxShadow: "0 0 14px rgba(0,229,255,0.42)"
    },
    ...extra
  };
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

// js/ui/shared.jsx
import { Fragment, jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
function ButtonIconify({ icon, title = "", label = "", onClick, disabled = false, busy = false, color = "", variant = "", className = "", type = "button" }) {
  const shown = busy ? "mdi:loading" : icon;
  const variantCls = variant ? `btn-iconify--${variant}` : "";
  const colorCls = color ? `btn-iconify--${color}` : "";
  const labeledCls = label ? "btn-iconify--labeled" : "";
  const aria = label || title || void 0;
  return /* @__PURE__ */ jsxs2(
    "button",
    {
      type,
      className: `btn-iconify ${variantCls} ${colorCls} ${labeledCls} ${className}`.trim(),
      title: title || label || void 0,
      "aria-label": aria,
      onClick,
      disabled: disabled || busy,
      children: [
        /* @__PURE__ */ jsx3("iconify-icon", { icon: shown, width: "1.15em", height: "1.15em" }),
        label ? /* @__PURE__ */ jsx3("span", { className: "btn-iconify__lbl", children: label }) : null
      ]
    }
  );
}
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
function MetaDialogImages({ items, onImageClick, topGap = 0 }) {
  const renderable = filterDisplayableImages(items);
  if (!renderable.length) return null;
  return /* @__PURE__ */ jsx3(
    Box,
    {
      className: "conv-msg-images conv-msg-images--left meta-dialog-images",
      sx: { display: "flex", flexWrap: "wrap", gap: 1, mt: topGap },
      children: renderable.map((src, idx) => /* @__PURE__ */ jsx3(
        "button",
        {
          type: "button",
          className: "conv-msg-image-lightbox-btn",
          "aria-label": `Ver imagen adjunta ${idx + 1} en tama\xF1o completo`,
          onClick: () => onImageClick?.(src),
          children: /* @__PURE__ */ jsx3("img", { src, alt: `Adjunto ${idx + 1}`, loading: "lazy" })
        },
        `${idx}-${src.slice(0, 32)}`
      ))
    }
  );
}
function PromptSummaryCard({ meta, tokens, usageStats, isUserMessage = false }) {
  const promptChars = meta.prompt_chars ?? String(meta.prompt_markdown ?? "").length;
  const responseChars = meta.response_chars;
  const imageCount = filterDisplayableImages(meta.imagenes).length;
  const charStats = [
    ...promptChars ? [{
      key: "prompt-ch",
      label: isUserMessage ? "Caracteres consulta" : "Caracteres prompt",
      value: Number(promptChars).toLocaleString("es-CO"),
      tone: "accent"
    }] : [],
    ...imageCount ? [{ key: "img-n", label: "Im\xE1genes adjuntas", value: String(imageCount), tone: "neutral" }] : [],
    ...typeof responseChars === "number" ? [{ key: "resp-ch", label: "Caracteres respuesta", value: responseChars.toLocaleString("es-CO"), tone: "neutral" }] : []
  ];
  const currentTokens = usageStats?.tokens ?? tokens;
  const currentCost = usageStats?.cost ?? meta?.cost;
  const usageSections = usageStats ? [
    { key: "msg", label: "Mensaje", tokens: usageStats.tokens, cost: usageStats.cost, show: true },
    {
      key: "cum",
      label: "Acumulado",
      tokens: usageStats.cumulativeTokens,
      cost: usageStats.cumulativeCost,
      show: usageHasData(usageStats.cumulativeTokens, usageStats.cumulativeCost)
    }
  ].filter((s) => s.show) : [{ key: "msg", label: "Mensaje", tokens: currentTokens, cost: currentCost, show: usageHasData(currentTokens, currentCost) }];
  const hasUsage = usageSections.some((s) => usageHasData(s.tokens, s.cost));
  const hasCharStats = charStats.length > 0;
  return /* @__PURE__ */ jsxs2(Box, { className: "meta-prompt-summary", children: [
    hasCharStats || hasUsage ? /* @__PURE__ */ jsxs2(Stack, { direction: "row", alignItems: "center", spacing: 0.75, className: "meta-prompt-summary__head", children: [
      /* @__PURE__ */ jsx3(
        "iconify-icon",
        {
          icon: isUserMessage ? "mdi:message-text-outline" : "mdi:file-document-edit-outline",
          width: "18",
          height: "18"
        }
      ),
      /* @__PURE__ */ jsx3(Typography, { variant: "subtitle2", className: "meta-prompt-summary__title", sx: { flex: 1, fontWeight: 700 }, children: isUserMessage ? "Resumen de la consulta" : "Resumen del prompt" }),
      hasUsage ? /* @__PURE__ */ jsx3(
        Chip,
        {
          size: "small",
          className: "meta-prompt-summary__badge",
          label: isUserMessage ? "tokens + costo" : "tokens + costo",
          icon: /* @__PURE__ */ jsx3("iconify-icon", { icon: "mdi:finance", width: "13", height: "13" })
        }
      ) : null
    ] }) : null,
    /* @__PURE__ */ jsxs2("div", { className: "meta-prompt-summary__grid", children: [
      charStats.map((s) => /* @__PURE__ */ jsxs2("div", { className: `meta-prompt-stat meta-prompt-stat--${s.tone || "neutral"}`, children: [
        /* @__PURE__ */ jsx3("span", { className: "meta-prompt-stat__k", children: s.label }),
        /* @__PURE__ */ jsx3("span", { className: "meta-prompt-stat__v", children: s.value })
      ] }, s.key)),
      hasUsage ? /* @__PURE__ */ jsxs2("div", { className: "meta-prompt-stat meta-prompt-stat--usage", children: [
        /* @__PURE__ */ jsx3("span", { className: "meta-prompt-stat__k", children: "Tokens y costo" }),
        /* @__PURE__ */ jsx3("div", { className: "meta-prompt-stat__usage-body", children: /* @__PURE__ */ jsx3(MetaUsageGrid, { sections: usageSections }) })
      ] }) : null
    ] })
  ] });
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
  const { useState: useState3, useMemo: useMemo2 } = getReact();
  const trace = fileSearchFromMeta(meta);
  const archivos = archivosCitadosFromMeta(meta);
  const chunks = useMemo2(() => chunksFromMeta(meta), [meta]);
  const vectorStores = useMemo2(() => vectorStoresFromMeta(meta), [meta]);
  const [openChunk, setOpenChunk] = useState3(null);
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
function MetaDialog({
  open,
  onClose,
  meta,
  title,
  isUserMessage = false,
  usageStats = null,
  userContent = "",
  imagenes = null
}) {
  const [tab, setTab] = useState2(0);
  const [lightboxSrc, setLightboxSrc] = useState2(null);
  const resolvedMeta = useMemo(() => {
    if (!meta) return null;
    if (!isUserMessage) return meta;
    const text = String(meta.prompt_markdown || userContent || "").trim();
    const imgs = filterDisplayableImages(
      Array.isArray(meta.imagenes) && meta.imagenes.length ? meta.imagenes : imagenes
    );
    return {
      ...meta,
      ...text ? { prompt_markdown: text, prompt_chars: meta.prompt_chars ?? text.length } : {},
      ...imgs.length ? { imagenes: imgs } : {}
    };
  }, [meta, isUserMessage, userContent, imagenes]);
  const promptMarkdown = String(resolvedMeta?.prompt_markdown ?? "").trim();
  const userImagenes = filterDisplayableImages(resolvedMeta?.imagenes);
  const iinstruccion = bdInstructionKey(resolvedMeta) || String(resolvedMeta?.extra?.operativa_key ?? "").trim();
  const hasPrompt = Boolean(promptMarkdown) || Boolean(iinstruccion) || userImagenes.length > 0;
  const promptTabLabel = isUserMessage ? "Consulta" : "Prompt";
  useEffect2(() => {
    if (open) setTab(0);
  }, [open, resolvedMeta?.ts, resolvedMeta?.prompt_id, promptMarkdown, userImagenes.length]);
  useEffect2(() => {
    if (!open) setLightboxSrc(null);
  }, [open]);
  if (!resolvedMeta) return null;
  const tk = resolvedMeta.tokens?.total ? resolvedMeta.tokens : tokensFromUsage(resolvedMeta.usage);
  function renderMetaGrid() {
    return /* @__PURE__ */ jsxs2("div", { className: "meta-grid meta-dialog-panel", children: [
      resolvedMeta.nombre_usuario && /* @__PURE__ */ jsxs2("div", { className: "meta-row", children: [
        /* @__PURE__ */ jsx3("span", { className: "meta-k", children: "nombre" }),
        /* @__PURE__ */ jsx3("span", { className: "meta-v", children: /* @__PURE__ */ jsx3("strong", { children: resolvedMeta.nombre_usuario }) })
      ] }),
      resolvedMeta.itdconsulta && /* @__PURE__ */ jsxs2("div", { className: "meta-row", children: [
        /* @__PURE__ */ jsx3("span", { className: "meta-k", children: "itdconsulta" }),
        /* @__PURE__ */ jsx3("span", { className: "meta-v", children: /* @__PURE__ */ jsx3("span", { className: "badge badge-itd", children: resolvedMeta.itdconsulta }) })
      ] }),
      !isUserMessage && iinstruccion && /* @__PURE__ */ jsxs2("div", { className: "meta-row", children: [
        /* @__PURE__ */ jsx3("span", { className: "meta-k", children: "iinstruccion" }),
        /* @__PURE__ */ jsx3("span", { className: "meta-v", children: /* @__PURE__ */ jsx3("code", { children: iinstruccion }) })
      ] }),
      resolvedMeta.premisas?.length ? /* @__PURE__ */ jsxs2("div", { className: "meta-row", children: [
        /* @__PURE__ */ jsx3("span", { className: "meta-k", children: "premisas" }),
        /* @__PURE__ */ jsx3("span", { className: "meta-v", children: resolvedMeta.premisas.join(", ") })
      ] }) : null,
      resolvedMeta.usage && /* @__PURE__ */ jsxs2("div", { className: "meta-row meta-row--block", children: [
        /* @__PURE__ */ jsx3("span", { className: "meta-k", children: "usage" }),
        /* @__PURE__ */ jsx3("span", { className: "meta-v meta-v--full", children: /* @__PURE__ */ jsx3(
          CodeMirrorPanel,
          {
            value: JSON.stringify(resolvedMeta.usage, null, 2),
            readOnly: true,
            json: true,
            minHeight: "5rem",
            maxHeight: "18rem",
            lineWrapping: true
          }
        ) })
      ] }),
      /* @__PURE__ */ jsx3(FileSearchMetaSection, { meta: resolvedMeta })
    ] });
  }
  const headerMeta = resolveMetaDialogHeader(title, isUserMessage);
  return /* @__PURE__ */ jsxs2(Fragment, { children: [
    /* @__PURE__ */ jsxs2(
      GlassDialog,
      {
        open,
        onClose,
        maxWidth: "md",
        fullWidth: true,
        header: /* @__PURE__ */ jsx3(
          GlassDialogHeader,
          {
            icon: headerMeta.icon,
            title: headerMeta.title,
            subtitle: headerMeta.subtitle,
            accent: headerMeta.accent,
            onClose
          }
        ),
        children: [
          hasPrompt && /* @__PURE__ */ jsxs2(Tabs, { value: tab, onChange: (_, next) => setTab(next), sx: glassDialogTabsSx(), children: [
            /* @__PURE__ */ jsx3(Tab, { label: "Trazabilidad" }),
            /* @__PURE__ */ jsx3(Tab, { label: promptTabLabel })
          ] }),
          /* @__PURE__ */ jsxs2(DialogContent, { dividers: true, sx: glassDialogContentSx(), children: [
            /* @__PURE__ */ jsx3(Box, { sx: { display: tab === 0 || !hasPrompt ? "block" : "none", minHeight: 0 }, children: renderMetaGrid() }),
            hasPrompt && /* @__PURE__ */ jsx3(Box, { sx: { display: tab === 1 ? "block" : "none", minHeight: 0, flex: 1 }, children: /* @__PURE__ */ jsx3(
              PromptPanelBody,
              {
                resolvedMeta,
                tk,
                usageStats,
                isUserMessage,
                promptMarkdown,
                userImagenes,
                setLightboxSrc,
                iinstruccion,
                dialogTitle: title
              }
            ) })
          ] }),
          /* @__PURE__ */ jsx3(GlassDialogCloseActions, { onClose })
        ]
      }
    ),
    /* @__PURE__ */ jsx3(ImageLightboxDialog, { open: Boolean(lightboxSrc), src: lightboxSrc, onClose: () => setLightboxSrc(null) })
  ] });
}
function PromptPanelBody({
  resolvedMeta,
  tk,
  usageStats,
  isUserMessage,
  promptMarkdown,
  userImagenes,
  setLightboxSrc,
  iinstruccion,
  dialogTitle
}) {
  const [fullPage, setFullPage] = useState2(false);
  return /* @__PURE__ */ jsxs2("div", { className: "meta-prompt-panel custom-scrollbar", children: [
    /* @__PURE__ */ jsx3(PromptSummaryCard, { meta: resolvedMeta, tokens: tk, usageStats, isUserMessage }),
    promptMarkdown ? /* @__PURE__ */ jsxs2(Box, { className: "meta-prompt-exact-wrap", children: [
      /* @__PURE__ */ jsxs2(Stack, { direction: "row", alignItems: "center", spacing: 0.75, sx: { mb: 0.75 }, children: [
        /* @__PURE__ */ jsx3("iconify-icon", { icon: "mdi:file-document-outline", width: "18", height: "18" }),
        /* @__PURE__ */ jsx3(Typography, { variant: "subtitle1", sx: { flex: 1, fontWeight: 700 }, children: isUserMessage ? "Consulta \xB7 texto exacto" : "Prompt \xB7 texto exacto" }),
        /* @__PURE__ */ jsx3(
          Chip,
          {
            size: "small",
            clickable: true,
            onClick: () => setFullPage(true),
            className: "meta-prompt-exact-preview__open",
            label: "Ver full-page",
            icon: /* @__PURE__ */ jsx3("iconify-icon", { icon: "mdi:fullscreen", width: "14", height: "14" })
          }
        ),
        /* @__PURE__ */ jsx3(
          Chip,
          {
            size: "small",
            clickable: true,
            onClick: () => {
              try {
                if (navigator.clipboard?.writeText) navigator.clipboard.writeText(promptMarkdown);
              } catch {
              }
            },
            className: "meta-prompt-exact-preview__copy",
            label: "Copiar",
            icon: /* @__PURE__ */ jsx3("iconify-icon", { icon: "mdi:content-copy", width: "14", height: "14" })
          }
        )
      ] }),
      /* @__PURE__ */ jsx3(Box, { className: "meta-prompt-exact-preview__body isa-md-content", children: /* @__PURE__ */ jsx3(MdRenderer, { source: promptMarkdown }) }),
      /* @__PURE__ */ jsx3(
        MdFullPageDialog,
        {
          open: fullPage,
          onClose: () => setFullPage(false),
          source: promptMarkdown,
          title: isUserMessage ? "Consulta \xB7 texto exacto" : "Prompt \xB7 texto exacto",
          subtitle: dialogTitle || (isUserMessage ? "Vista consulta full-page" : "Vista prompt full-page"),
          icon: isUserMessage ? "mdi:message-text-outline" : "mdi:file-document-outline",
          accent: isUserMessage ? "#1e90ff" : "#22c55e"
        }
      )
    ] }) : null,
    userImagenes.length ? /* @__PURE__ */ jsx3(MetaDialogImages, { items: userImagenes, onImageClick: setLightboxSrc, topGap: promptMarkdown ? 1.25 : 0 }) : null,
    !promptMarkdown && !userImagenes.length ? /* @__PURE__ */ jsx3(Typography, { variant: "body2", color: "text.secondary", children: isUserMessage ? "Sin texto ni im\xE1genes en el log de este mensaje." : "Sin texto de instrucciones en el log de este turno." }) : null
  ] });
}
function MdRenderer({ source, className = "" }) {
  const html = mdToHtml(String(source ?? ""));
  return /* @__PURE__ */ jsx3(
    "div",
    {
      className: `md-renderer isa-md-content ${className}`.trim(),
      dangerouslySetInnerHTML: { __html: html }
    }
  );
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
export {
  ButtonIconify,
  FileSearchDialog,
  MdFullPageDialog,
  MdRenderer,
  MetaDialog,
  UsageMetricsGrid,
  instructionKeyFromMeta,
  mdToHtml,
  metaWorthDialog,
  shortId,
  theme
};
