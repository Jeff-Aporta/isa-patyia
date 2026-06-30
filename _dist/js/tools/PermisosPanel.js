// ../Personal/apps/isa-patyia/frontend/js/core/patyia.ts
window.ISAFront.migrateLegacyGatewayKeys?.({ "jeff:gateway-local": "", "patyia-apptools:gateway-local": "", "patyia-apptools:lab-local": "" });
var ORCH_ONLINE = "https://main-orchestrator.jeffaporta.workers.dev";
var PATYIA_BRIDGE_URL = "https://rag-lab-bsczhqfgchgegabr.canadacentral-01.azurewebsites.net";
var PATYIA_ISS_LOCAL = "http://127.0.0.1:8802";
var ORCH_LOCAL = "http://localhost:8790";
var SCRUM_LOCAL = "http://localhost:8798";
var PATYIA_BRIDGE_LOCAL = `${PATYIA_ISS_LOCAL}/api`;
var PATYIA_ISS_LOCAL_LS_KEY = "patyia-apptools:iss-local";
function isLocalMode() {
  try {
    return localStorage.getItem(PATYIA_ISS_LOCAL_LS_KEY) === "1";
  } catch {
    return false;
  }
}
function isDevHost() {
  try {
    return /^(localhost|127\.0\.0\.1|\[::1\])$/i.test(window.location.hostname);
  } catch {
    return false;
  }
}
function resolveIssApiBase() {
  const base = (isLocalMode() ? PATYIA_BRIDGE_LOCAL : PATYIA_BRIDGE_URL).replace(/\/$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
}

// ../Personal/apps/isa-patyia/frontend/js/core/platform.ts
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
var Session = {
  current: () => bridge().Session.current(),
  isLoggedIn: () => bridge().Session.isLoggedIn(),
  username: () => bridge().Session.username(),
  realUsername: () => bridge().Session.realUsername?.() ?? bridge().Session.username(),
  viewAsUsername: () => bridge().Session.viewAsUsername?.() ?? null,
  isViewingAs: () => bridge().Session.isViewingAs?.() ?? false,
  auditAuthor: () => bridge().Session.auditAuthor?.() ?? String(bridge().Session.username() || "").trim().toUpperCase(),
  authHeader: () => bridge().Session.authHeader(),
  appHeader: () => bridge().Session.appHeader(),
  appId: () => bridge().Session.appId(),
  login: (u, p, opts) => bridge().Session.login(u, p, opts),
  logout: () => bridge().Session.logout(),
  refreshProfile: () => bridge().Session.refreshProfile(),
  fetchViewAsCatalog: () => bridge().Session.fetchViewAsCatalog?.(),
  searchSuplantacionUsers: (q, limit) => bridge().Session.searchSuplantacionUsers?.(q, limit),
  setViewAs: (u) => bridge().Session.setViewAs?.(u),
  clearViewAs: () => bridge().Session.clearViewAs?.(),
  capabilities: () => bridge().Session.capabilities(),
  adminCapabilities: () => bridge().Session.adminCapabilities?.() ?? bridge().Session.capabilities(),
  capabilityCatalog: () => bridge().Session.capabilityCatalog?.() ?? [],
  can: (cap) => bridge().Session.can(cap),
  blockReason: (cap) => bridge().Session.blockReason(cap),
  get EVENT() {
    return bridge().Session.EVENT;
  }
};
var Config = {
  base: () => bridge().Config.base(),
  apiUrl: (path) => bridge().Config.apiUrl(path),
  isLocal: () => bridge().Config.isLocal(),
  setLocal: (on) => bridge().Config.setLocal(on),
  get EVENT() {
    return bridge().Config.EVENT;
  }
};
function frontSharedLazy() {
  const api = window.ISAFront;
  return api?.ensureCodeMirrorLoaded ? api : null;
}
var Assets = {
  ensureCodeMirrorLoaded: (opts) => {
    const api = frontSharedLazy();
    return api ? api.ensureCodeMirrorLoaded(opts) : Promise.resolve();
  },
  ensureMarked: () => {
    const api = frontSharedLazy();
    return api ? api.ensureMarked() : Promise.resolve();
  },
  ensureStylesheet: (href) => {
    const api = frontSharedLazy();
    return api ? api.ensureLazyStylesheet(href) : Promise.resolve();
  },
  ensureChatStagingCss: () => {
    const api = frontSharedLazy();
    if (!api) return;
    const prefix = typeof window !== "undefined" && window.__ISA_DIST__ ? "_dist/" : "";
    api.ensureLazyStylesheet(`${prefix}css/chat-staging.css`).catch((err) => {
      console.warn("chat-staging.css:", err);
    });
  },
  ensureTodosCss: () => {
    const api = frontSharedLazy();
    if (!api) return;
    const prefix = typeof window !== "undefined" && window.__ISA_DIST__ ? "_dist/" : "";
    api.ensureLazyStylesheet(`${prefix}css/todos-staging.css`).catch((err) => {
      console.warn("todos-staging.css:", err);
    });
  }
};
var getReact = () => window.ISAFront.getReact();
var getReactDOM = () => window.ISAFront.getReactDOM();
var getMaterialUI = () => window.ISAFront.getMaterialUI();
function getGlass() {
  const g = window.ISAFront?.Glass;
  if (!g?.GlassCard) {
    throw new Error("ISAFront.Glass no cargado \u2014 recargue sin cach\xE9 (Ctrl+Shift+R).");
  }
  return g;
}
function CodeMirrorPanel(props) {
  const Panel = window.ISAFront?.CodeMirrorPanel;
  if (!Panel) throw new Error("CodeMirrorPanel no cargado \u2014 recargue sin cach\xE9 (Ctrl+Shift+R).");
  return Panel(props);
}
var fb = () => globalThis.ISAFront?.Feedback;
function toastError(text, timeout) {
  fb()?.toast?.error?.(text, timeout);
}
function toastSuccess(text, timeout) {
  fb()?.toast?.success?.(text, timeout);
}
function toastInfo(text, timeout) {
  fb()?.toast?.info?.(text, timeout);
}
function toastWarning(text, timeout) {
  fb()?.toast?.warning?.(text, timeout);
}

// ../Personal/apps/isa-patyia/frontend/js/ui/ImageLightboxDialog.jsx
import { jsx } from "react/jsx-runtime";
var { useEffect, useState } = getReact();

// ../Personal/apps/isa-patyia/frontend/js/ui/GlassDialog.jsx
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
function GlassDialogHeader({ icon = "mdi:information-outline", title, subtitle, accent = "#1e90ff", onClose }) {
  const { Box: Box9, Typography: Typography9, IconButton: IconButton5, Stack: Stack7 } = getMaterialUI();
  const { Icon: Icon6 } = UI;
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
  return /* @__PURE__ */ jsxs(Box9, { className: "isa-glass-dialog__header", sx: { position: "relative", flexShrink: 0 }, children: [
    /* @__PURE__ */ jsx2(Box9, { sx: bandSx, children: /* @__PURE__ */ jsxs(Stack7, { direction: "row", spacing: 1.25, alignItems: "center", sx: { pr: onClose ? 4 : 0 }, children: [
      /* @__PURE__ */ jsx2(Box9, { sx: iconSx, children: /* @__PURE__ */ jsx2(Icon6, { icon, size: 24 }) }),
      /* @__PURE__ */ jsxs(Box9, { sx: { flex: 1, minWidth: 0 }, children: [
        /* @__PURE__ */ jsx2(Typography9, { variant: "h5", component: "h2", sx: titleSx, children: title }),
        subtitle ? /* @__PURE__ */ jsx2(Typography9, { variant: "caption", color: "text.secondary", display: "block", sx: { mt: 0.35, lineHeight: 1.4 }, children: subtitle }) : null
      ] })
    ] }) }),
    onClose ? /* @__PURE__ */ jsx2(IconButton5, { size: "small", onClick: onClose, "aria-label": "Cerrar", className: "isa-glass-dialog__close", sx: { position: "absolute", top: 10, right: 10 }, children: /* @__PURE__ */ jsx2(Icon6, { icon: "mdi:close", size: 18 }) }) : null
  ] });
}
function GlassDialog({ children, header = null, maxWidth, fullWidth, paperMaxWidth, paperClassName, slotProps, ...dialogProps }) {
  const { Dialog: Dialog2 } = getMaterialUI();
  const props = resolveGlassDialogProps({ maxWidth, fullWidth, paperMaxWidth, paperClassName, slotProps, ...dialogProps });
  return /* @__PURE__ */ jsxs(Dialog2, { ...props, children: [
    header,
    children
  ] });
}

// ../Personal/apps/isa-patyia/frontend/js/ui/shared.jsx
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
var { createTheme, Tabs, Tab, Box, Typography, DialogContent } = getMaterialUI();
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

// ../Personal/apps/isa-patyia/frontend/js/api/systemConfigApi.ts
function systemApiBase() {
  return resolveIssApiBase();
}
function systemApiHeaders(extra = {}) {
  const h = {
    Accept: "application/json",
    "X-Patyia-Auth-Mode": "w",
    ...extra
  };
  if (Session.isLoggedIn()) Object.assign(h, Session.authHeader(), Session.appHeader());
  return h;
}
function unwrapBody(data) {
  const d = data;
  if (d?.respuesta && typeof d.respuesta === "object") return d.respuesta;
  if (d?.body && typeof d.body === "object") return d.body;
  return d;
}
async function jsonFetch(path, init) {
  const res = await fetch(`${systemApiBase()}${path}`, init);
  const ct = res.headers.get("content-type") || "";
  if (!res.ok) {
    let msg = res.statusText;
    if (ct.includes("json")) {
      try {
        const j = await res.json();
        const inner = j.respuesta || j.body || j;
        msg = String(inner?.error || j.error || j.message || msg);
      } catch {
      }
    }
    throw new Error(msg || `HTTP ${res.status}`);
  }
  if (!ct.includes("json")) return {};
  const raw = await res.json();
  return unwrapBody(raw);
}
async function fetchHierarchy() {
  return jsonFetch(`/system/permisos/hierarchy`, {
    method: "GET",
    headers: systemApiHeaders()
  });
}
async function createHierarchyRole(input) {
  return jsonFetch(`/system/permisos/hierarchy/roles`, {
    method: "POST",
    headers: { ...systemApiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
}
async function updateHierarchyRole(name, input) {
  return jsonFetch(`/system/permisos/hierarchy/roles/${encodeURIComponent(name)}`, {
    method: "PUT",
    headers: { ...systemApiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
}
async function deleteHierarchyRole(name) {
  await jsonFetch(`/system/permisos/hierarchy/roles/${encodeURIComponent(name)}`, {
    method: "DELETE",
    headers: systemApiHeaders()
  });
}
async function fetchPermisos(opts) {
  const qs = new URLSearchParams();
  const search = String(opts?.search ?? "").trim();
  const role = String(opts?.role ?? "").trim();
  if (search) qs.set("search", search);
  if (role) qs.set("role", role);
  const q = qs.toString();
  return jsonFetch(`/system/permisos${q ? `?${q}` : ""}`, { method: "GET", headers: systemApiHeaders() });
}
async function putPermisoRolePath(name, permisos, bactivo) {
  const role = encodeURIComponent(String(name).trim().toLowerCase().replace(/^role:/, ""));
  const body = { permisos };
  if (bactivo !== void 0) body.bactivo = bactivo;
  return jsonFetch(`/system/permisos/roles/${role}`, {
    method: "PUT",
    headers: { ...systemApiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}
async function patchUsuarioRoles(username, body) {
  const u = encodeURIComponent(String(username).trim().toUpperCase());
  return jsonFetch(`/system/permisos/usuarios/${u}/roles`, {
    method: "PATCH",
    headers: { ...systemApiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}
async function addUsuarioRole(username, role) {
  const u = encodeURIComponent(String(username).trim().toUpperCase());
  return jsonFetch(`/system/permisos/usuarios/${u}/roles`, {
    method: "PATCH",
    headers: { ...systemApiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ toRole: String(role).trim().toLowerCase(), mode: "add" })
  });
}
async function removeUsuarioRole(username, role) {
  const u = encodeURIComponent(String(username).trim().toUpperCase());
  return jsonFetch(`/system/permisos/usuarios/${u}/roles`, {
    method: "PATCH",
    headers: { ...systemApiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ fromRole: String(role).trim().toLowerCase(), mode: "remove" })
  });
}
function requireAppSession(onNeedLogin) {
  if (Session.isLoggedIn()) return true;
  onNeedLogin?.();
  return false;
}

// ../Personal/apps/isa-patyia/frontend/js/api/sessionApi.ts
function notifyAuth() {
  window.dispatchEvent(new Event(Session.EVENT));
  window.dispatchEvent(new Event("patyia-apptools:auth"));
  window.dispatchEvent(new Event("isa-patyia:auth"));
}
var isLoggedIn = () => Session.isLoggedIn();
var can = (cap) => Session.can(cap);
var blockReason = (cap) => Session.blockReason(cap);
async function login(user, pass, opts) {
  const session = await Session.login(user, pass, opts);
  notifyAuth();
  return session;
}
function logout() {
  Session.logout();
  notifyAuth();
}
var clearSession = logout;
function handleApiError(err, cap) {
  window.ISAFront.handleApiError(err, cap, { blockReason, clearSession, toastWarning, toastError });
}
(window.ISA = window.ISA || {}).AppSession = {
  current: () => Session.current(),
  isLoggedIn,
  username: () => Session.username(),
  capabilities: () => Session.capabilities(),
  can,
  blockReason,
  login,
  logout,
  refreshProfile: () => Session.refreshProfile(),
  clearSession
};

// ../Personal/apps/isa-patyia/frontend/js/api/todosApi.ts
var scrumHttp = window.ISAFront.createCapFetch({
  Session,
  Config,
  getApiBase: () => ORCH_ONLINE.replace(/\/$/, ""),
  localDirect: [
    {
      test: (p) => {
        const n = p.startsWith("/") ? p : `/${p}`;
        return n.startsWith("/scrum") || n.startsWith("/api/scrum");
      },
      base: SCRUM_LOCAL
    }
  ],
  orchOnlineInLocal: false,
  isLocal: isLocalMode,
  handleApiError,
  clearSession
});
var SCRUM_APP_ID = "isa-patyia";
async function searchScrumAppUsers(query = "", limit = 12) {
  if (!Session.isLoggedIn()) return [];
  const params = new URLSearchParams({ app: SCRUM_APP_ID, limit: String(limit) });
  if (query.trim()) params.set("q", query.trim());
  const headers = { Accept: "application/json" };
  Object.assign(headers, Session.authHeader(), Session.appHeader());
  const apiPath = `/api/scrum/users/search?${params}`;
  const bases = [];
  if (isDevHost() && isLocalMode()) {
    bases.push(SCRUM_LOCAL.replace(/\/$/, ""), ORCH_LOCAL.replace(/\/$/, ""));
  } else {
    bases.push(ORCH_ONLINE.replace(/\/$/, ""));
  }
  for (const base of bases) {
    try {
      const res = await fetch(`${base}${apiPath}`, { method: "GET", headers });
      if (!res.ok) continue;
      const data = await res.json().catch(() => ({}));
      if (data.ok === false) continue;
      return data.users ?? [];
    } catch {
    }
  }
  return [];
}

// ../Personal/apps/isa-patyia/frontend/js/tools/permFixFilter.js
var SESSION_OWNER_FIX_FILTER = {
  itercero: "{{itercero}}",
  icontacto: "{{icontacto}}"
};
var FIX_FILTER_VAR_HINT = "itercero, icontacto, iusuario, nombres";
function formatFixFilter(fixFilter) {
  if (!fixFilter || typeof fixFilter !== "object" || Array.isArray(fixFilter)) return "";
  return Object.entries(fixFilter).map(([k, v]) => `${k}: ${String(v)}`).join(" \xB7 ");
}
function fixFilterFromRestriction(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const ff = value.fixFilter;
  if (!ff || typeof ff !== "object" || Array.isArray(ff)) return void 0;
  return { ...ff };
}
function withSessionOwnerFixFilter(restriction) {
  if (restriction === true) return { fixFilter: { ...SESSION_OWNER_FIX_FILTER } };
  if (!restriction || typeof restriction !== "object") return restriction;
  return { ...restriction, fixFilter: { ...SESSION_OWNER_FIX_FILTER } };
}

// ../Personal/apps/isa-patyia/frontend/js/tools/permisosForm.js
var PERM_META = /* @__PURE__ */ new Set(["descripcion", "namedisplay", "roles"]);
var FLAG_DEFS = [
  { key: "*", label: "Acceso total", hint: "Wildcard \u2014 anula el resto de restricciones de ruta." },
  { key: "impersonate", label: "Suplantar chat", hint: "Actuar como otro usuario en conversaciones." },
  { key: "manage_permissions", label: "Gestionar permisos", hint: "CRUD de dbo.SYS_USR_PERMISSIONS (dev_lead)." }
];
var ACCESS_MODES = [
  { value: "off", label: "Sin acceso" },
  { value: "allow", label: "Permitido" },
  { value: "filtered", label: "Filtrado (fixFilter)" }
];
var FLAG_KEYS = new Set(FLAG_DEFS.map((f) => f.key));
function prettyJson(obj) {
  try {
    return JSON.stringify(obj ?? {}, null, 2);
  } catch {
    return "{}";
  }
}
function roleDescripcion(permisos) {
  const d = permisos?.descripcion;
  return d != null && String(d).trim() ? String(d).trim() : "";
}
function roleNamedisplay(permisos) {
  const d = permisos?.namedisplay;
  return d != null && String(d).trim() ? String(d).trim() : "";
}
function userRoles(permisos) {
  const r = permisos?.roles;
  return Array.isArray(r) ? r.map((x) => String(x).trim().toLowerCase()).filter(Boolean) : [];
}
function restrictionToMode(value) {
  if (value === true) return "allow";
  if (value && typeof value === "object") {
    const ff = value.fixFilter;
    if (ff && typeof ff === "object" && !Array.isArray(ff) && Object.keys(ff).length) return "filtered";
    return "allow";
  }
  return "off";
}
function modeToRestriction(mode, fixFilter) {
  if (mode === "allow") return true;
  if (mode === "filtered") {
    const ff = fixFilterFromRestriction({ fixFilter });
    return ff ? { fixFilter: ff } : true;
  }
  return null;
}
function splitRolePermisos(permisos) {
  const flags = Object.fromEntries(FLAG_DEFS.map((f) => [f.key, false]));
  const routes = [];
  for (const [key, value] of Object.entries(permisos ?? {})) {
    if (PERM_META.has(key)) continue;
    if (FLAG_KEYS.has(key)) {
      flags[key] = value === true;
      continue;
    }
    const mode = restrictionToMode(value);
    if (mode !== "off") {
      const fixFilter = fixFilterFromRestriction(value);
      routes.push(fixFilter ? { key, mode, fixFilter } : { key, mode });
    }
  }
  routes.sort((a, b) => a.key.localeCompare(b.key));
  return { flags, routes };
}
function buildRolePermisos(desc, namedisplay, flags, routes) {
  const out = {};
  if (String(desc ?? "").trim()) out.descripcion = String(desc).trim();
  if (String(namedisplay ?? "").trim()) out.namedisplay = String(namedisplay).trim();
  for (const def of FLAG_DEFS) {
    if (flags[def.key]) out[def.key] = true;
  }
  for (const row of routes) {
    if (!row.key || row.mode === "off") continue;
    const restr = modeToRestriction(row.mode, row.fixFilter);
    if (restr != null) out[row.key] = restr;
  }
  return out;
}
function countActiveRoutes(routes) {
  return (routes || []).filter((r) => r.mode && r.mode !== "off").length;
}
function summarizePermisos(permisos) {
  const { flags, routes } = splitRolePermisos(permisos);
  const flagCount = FLAG_DEFS.filter((f) => flags[f.key]).length;
  const routeCount = countActiveRoutes(routes);
  return { flagCount, routeCount };
}

// ../Personal/apps/isa-patyia/frontend/js/tools/roleHierarchy.js
var DEFAULT_ROLE_JERARQUIA = {
  dev_lead: "0",
  dev_iss: "0.1",
  admn_isapatyia: "1",
  auditador: "2",
  visitante: "999"
};
var DEFAULT_FOR_UNKNOWN = "999";
function compareHierarchy(a, b) {
  const aParts = String(a ?? "").split(".").map((n) => Number(n) || 0);
  const bParts = String(b ?? "").split(".").map((n) => Number(n) || 0);
  const len = Math.max(aParts.length, bParts.length);
  for (let i = 0; i < len; i++) {
    const av = aParts[i] ?? 0;
    const bv = bParts[i] ?? 0;
    if (av !== bv) return av - bv;
  }
  return 0;
}
function getRoleJerarquia(roleName, permisos) {
  if (permisos && typeof permisos === "object") {
    const j = permisos.jerarquia;
    if (typeof j === "string" && j.trim()) return j.trim();
  }
  const key = String(roleName ?? "").trim().toLowerCase();
  return DEFAULT_ROLE_JERARQUIA[key] ?? DEFAULT_FOR_UNKNOWN;
}
function ancestorsFromPath(jerarquia) {
  const parts = String(jerarquia ?? "").split(".").filter(Boolean);
  const out = [];
  for (let i = parts.length - 1; i >= 0; i--) {
    out.push(parts.slice(0, i + 1).join("."));
  }
  return out;
}
function canManageRole(actorJerarquia, targetJerarquia) {
  return compareHierarchy(actorJerarquia, targetJerarquia) < 0;
}
function actorJerarquiaFromRoles(roles, rolePermisosByName = {}) {
  const keys = (roles ?? []).map((r) => String(r ?? "").trim().toLowerCase()).filter(Boolean);
  if (!keys.length) return "999";
  const jerarquias = keys.map((r) => getRoleJerarquia(r, rolePermisosByName[r]));
  jerarquias.sort(compareHierarchy);
  return jerarquias[0];
}
function formatJerarquiaLabel(jerarquia) {
  if (jerarquia == null || jerarquia === "") return "";
  return `(${jerarquia})`;
}
function isBranchZero(jerarquia) {
  const j = String(jerarquia ?? "").trim();
  return j === "0" || j.startsWith("0.");
}

// ../Personal/apps/isa-patyia/frontend/js/tools/permisosKanbanShared.js
var VISITANTE = "visitante";
var ROLE_ACCENTS = ["#1e90ff", "#10b981", "#a855f7", "#f59e0b", "#ec4899", "#06b6d4", "#8b5cf6"];
var ROLE_ICONS = ["mdi:shield-account", "mdi:file-document-edit-outline", "mdi:code-braces", "mdi:robot-outline", "mdi:eye-outline", "mdi:account-group-outline"];
function roleNameFromEntry(entry) {
  return String(entry?.iusuario ?? "").trim().toLowerCase().replace(/^role:/i, "");
}
function formatRoleTitle(roleName) {
  return String(roleName ?? "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function roleTitleFromEntry(entry) {
  const namedisplay = roleNamedisplay(entry?.permisos);
  if (namedisplay) return namedisplay;
  return formatRoleTitle(roleNameFromEntry(entry));
}
function themeForRole(roleName, index = 0, permisos = null) {
  const accent = permisos?.accent ?? permisos?.color;
  const icon = permisos?.icon;
  if (accent && icon) return { accent: String(accent), icon: String(icon) };
  const i = index % ROLE_ACCENTS.length;
  return { accent: ROLE_ACCENTS[i], icon: ROLE_ICONS[i % ROLE_ICONS.length] };
}
function userCardLabels(username, displayName) {
  const user = String(username ?? "").trim().toUpperCase();
  const name = String(displayName ?? "").trim();
  if (name) return { primary: name, secondary: user };
  return { primary: user, secondary: null };
}
function matchesUserFilter(username, displayName, query) {
  const q = String(query ?? "").trim().toUpperCase();
  if (!q) return true;
  const u = String(username ?? "").trim().toUpperCase();
  const n = String(displayName ?? "").trim().toUpperCase();
  return u.includes(q) || n && n.includes(q);
}
function resolveDisplayName(username, userEntry, userDirectory) {
  const key = String(username ?? "").trim().toUpperCase();
  const fromDir = userDirectory?.[key];
  if (fromDir != null && String(fromDir).trim()) return String(fromDir).trim();
  const fromMeta = userEntry?.permisos?.nombre ?? userEntry?.permisos?.namedisplay;
  if (fromMeta != null && String(fromMeta).trim()) return String(fromMeta).trim();
  return null;
}
function sortPermisosColumnsByMembers(columns) {
  return [...columns].sort((a, b) => {
    const byCount = b.users.length - a.users.length;
    if (byCount !== 0) return byCount;
    return a.sortIndex - b.sortIndex;
  });
}
function buildPermisosBoard(data, filters = {}) {
  const roles = data?.roles ?? [];
  const users = data?.users ?? [];
  const userQuery = filters.userSearch ?? "";
  const roleFiltersRaw = filters.roleFilters ?? filters.roleFilter ?? [];
  const roleFilters = (Array.isArray(roleFiltersRaw) ? roleFiltersRaw : [roleFiltersRaw]).map((r) => String(r ?? "").trim().toLowerCase()).filter(Boolean);
  const roleFilterSet = roleFilters.length ? new Set(roleFilters) : null;
  const userDirectory = filters.userDirectory ?? null;
  const filterActive = Boolean(String(userQuery ?? "").trim()) || Boolean(roleFilterSet?.size);
  const columns = roles.map((entry, index) => {
    const roleName = roleNameFromEntry(entry);
    const theme2 = themeForRole(roleName, index, entry.permisos);
    const jerarquia = getRoleJerarquia(roleName, entry.permisos);
    return {
      id: roleName,
      roleName,
      title: roleTitleFromEntry(entry),
      jerarquia,
      jerarquiaLabel: formatJerarquiaLabel(jerarquia),
      descripcion: roleDescripcion(entry.permisos),
      entry,
      accent: theme2.accent,
      icon: theme2.icon,
      sortIndex: index,
      users: [],
      roleFilteredOut: !!(roleFilterSet && !roleFilterSet.has(roleName))
    };
  }).filter((c) => {
    if (!c.id || c.id === VISITANTE) return false;
    return true;
  });
  const colById = new Map(columns.map((c) => [c.id, c]));
  for (const userEntry of users) {
    const username = String(userEntry.iusuario ?? "").trim().toUpperCase();
    const displayName = resolveDisplayName(username, userEntry, userDirectory);
    if (!matchesUserFilter(username, displayName, userQuery)) continue;
    for (const role of userRoles(userEntry.permisos)) {
      const col = colById.get(role);
      if (!col) continue;
      if (roleFilterSet && !roleFilterSet.has(role)) continue;
      if (col.users.some((u) => u.username === username)) continue;
      const labels = userCardLabels(username, displayName);
      col.users.push({ id: `${username}@${role}`, username, displayName, labels, userEntry });
    }
  }
  for (const col of columns) {
    col.users.sort((a, b) => a.labels.primary.localeCompare(b.labels.primary, "es"));
  }
  const visibleColumns = columns.filter((c) => c.users.length > 0);
  const sorted = sortPermisosColumnsByMembers(visibleColumns);
  const noUsersVisible = filterActive && sorted.every((c) => !c.users.length);
  return { columns: sorted, filterActive, noUsersVisible };
}
function columnAtPoint(columnIds, listRefs, clientX, clientY) {
  for (const colId of columnIds) {
    const el = listRefs.current[colId];
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) return colId;
  }
  return null;
}
function buildRolePermisosIndex(roles) {
  const out = {};
  for (const r of roles ?? []) {
    const key = roleNameFromEntry(r);
    if (key) out[key] = r.permisos ?? {};
  }
  return out;
}
function canActorManageColumn(actorJerarquia, targetColumn) {
  if (!targetColumn) return false;
  return canManageRole(actorJerarquia, targetColumn.jerarquia ?? "999");
}
function pointInRef(ref, clientX, clientY) {
  const el = ref?.current;
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
}

// ../Personal/apps/isa-patyia/frontend/js/editors/jsonEditor.jsx
import { jsx as jsx4 } from "react/jsx-runtime";
function JsonCodeEditor({ value = "", onChange, placeholder = "", toolbarExtra = null, readOnly = false }) {
  return /* @__PURE__ */ jsx4(
    CodeMirrorPanel,
    {
      value,
      onChange,
      json: true,
      readOnly,
      fill: true,
      enableFullPage: true,
      fullPageTitle: "Log JSON",
      placeholder,
      lineWrapping: false,
      toolbarExtra
    }
  );
}

// ../Personal/apps/isa-patyia/frontend/js/tools/permisosRouteCatalog.js
var ROUTE_GROUPS = [
  {
    id: "conversaciones",
    title: "Conversaciones",
    routes: [
      { key: "GET:/api/conversaciones", label: "Listar conversaciones", scoped: true },
      { key: "GET:/api/conversacion/*", label: "Ver conversaci\xF3n", scoped: true },
      { key: "GET:/api/conversacion/logs/*", label: "Logs de conversaci\xF3n" },
      { key: "POST:/api/conversacion", label: "Crear conversaci\xF3n", scoped: true },
      { key: "POST:/api/mensaje", label: "Enviar mensaje", scoped: true },
      { key: "DELETE:/api/conversacion/*", label: "Eliminar conversaci\xF3n", scoped: true }
    ]
  },
  {
    id: "sistema",
    title: "Sistema",
    routes: [
      { key: "GET:/api/system/openai", label: "Leer config OpenAI" },
      { key: "PUT:/api/system/openai", label: "Guardar config OpenAI" },
      { key: "GET:/api/system/prompts-operativos", label: "Leer prompts operativos" },
      { key: "PUT:/api/system/prompts-operativos", label: "Guardar prompts operativos" },
      { key: "GET:/api/system/permisos", label: "Leer permisos" },
      { key: "PUT:/api/system/permisos", label: "Actualizar permisos" },
      { key: "PUT:/api/system/permisos/roles/*", label: "Editar rol" },
      { key: "PUT:/api/system/permisos/usuarios/*", label: "Editar usuario" },
      { key: "PATCH:/api/system/permisos/usuarios/*/roles", label: "Asignar roles a usuario" },
      { key: "POST:/api/system/*", label: "POST sistema (wildcard)" },
      { key: "PUT:/api/system/*", label: "PUT sistema (wildcard)" }
    ]
  },
  {
    id: "patyia",
    title: "PatyIA / instrucciones",
    routes: [
      { key: "POST:/api/patyia/instrucciones/publish", label: "Publicar instrucciones" },
      { key: "POST:/api/patyia/instrucciones/upsert", label: "Upsert instrucciones" },
      { key: "POST:/api/patyia/prompts/upsert-sql", label: "Upsert SQL prompts" },
      { key: "POST:/api/instrucciones/*", label: "POST instrucciones (wildcard)" }
    ]
  },
  {
    id: "documentacion",
    title: "Documentaci\xF3n",
    routes: [
      { key: "PUT:/api/swagger.json", label: "Swagger declarativo" }
    ]
  }
];
var CATALOG_KEYS = new Set(ROUTE_GROUPS.flatMap((g) => g.routes.map((r) => r.key)));
function isWildcardRole(permisos) {
  return permisos?.["*"] === true;
}
function routesForRoleEditor(permisos, { includeInactive = false } = {}) {
  const wildcard = isWildcardRole(permisos);
  const modeByKey = /* @__PURE__ */ new Map();
  const fixByKey = /* @__PURE__ */ new Map();
  for (const [key, value] of Object.entries(permisos ?? {})) {
    if (key === "*" || key === "descripcion" || key === "namedisplay" || key === "roles" || key === "impersonate" || key === "manage_permissions") continue;
    const hasFix = !!(value && typeof value === "object" && value.fixFilter && typeof value.fixFilter === "object" && !Array.isArray(value.fixFilter) && Object.keys(value.fixFilter).length);
    const mode = value === true ? "allow" : hasFix ? "filtered" : value && typeof value === "object" ? "allow" : "off";
    if (mode !== "off") modeByKey.set(key, mode);
    const ff = fixFilterFromRestriction(value);
    if (ff) fixByKey.set(key, ff);
  }
  const groups = ROUTE_GROUPS.map((g) => ({
    id: g.id,
    title: g.title,
    routes: g.routes.map((def) => {
      let mode = "off";
      if (wildcard) mode = def.scoped ? "filtered" : "allow";
      else if (modeByKey.has(def.key)) mode = modeByKey.get(def.key);
      return { ...def, mode, fixFilter: fixByKey.get(def.key), active: mode !== "off" };
    }).filter((r) => includeInactive || r.active)
  })).filter((g) => g.routes.length > 0);
  const extras = [...modeByKey.entries()].filter(([key]) => !CATALOG_KEYS.has(key)).map(([key, mode]) => ({
    key,
    label: key,
    mode,
    fixFilter: fixByKey.get(key),
    active: true,
    scoped: mode === "filtered"
  })).sort((a, b) => a.key.localeCompare(b.key));
  return { groups, extras, wildcard, activeCount: [...modeByKey.keys()].length + (wildcard ? 1 : 0) };
}
function routesArrayFromPermisos(permisos, includeInactive) {
  const { groups, extras } = routesForRoleEditor(permisos, { includeInactive });
  const rows = [];
  for (const g of groups) {
    for (const r of g.routes) rows.push({ key: r.key, mode: r.mode, ...r.fixFilter ? { fixFilter: r.fixFilter } : {} });
  }
  for (const r of extras) rows.push({ key: r.key, mode: r.mode, ...r.fixFilter ? { fixFilter: r.fixFilter } : {} });
  return rows;
}
function groupsFromRouteRows(routes, flags, { includeInactive = false } = {}) {
  const permisos = {};
  if (flags?.["*"]) permisos["*"] = true;
  for (const r of routes ?? []) {
    if (!r?.key || r.mode === "off") continue;
    if (r.mode === "allow") permisos[r.key] = true;
    else if (r.mode === "filtered") permisos[r.key] = r.fixFilter ? { fixFilter: r.fixFilter } : true;
  }
  return routesForRoleEditor(permisos, { includeInactive });
}

// ../Personal/apps/isa-patyia/frontend/js/tools/todos/todosKanbanShared.js
function normalizeAssigneeUsername(assignedTo) {
  const username = String(assignedTo ?? "").trim().toUpperCase();
  if (username === "KEVIN") return "KGOMEZ";
  return username;
}

// ../Personal/apps/isa-patyia/frontend/js/tools/todos/UserAssignAutocomplete.jsx
import { jsx as jsx5 } from "react/jsx-runtime";
import { createElement } from "react";
var { useState: useState3, useEffect: useEffect3, useRef, useCallback } = getReact();
var { Autocomplete, TextField, Typography: Typography2, Box: Box2 } = getMaterialUI();
var DEBOUNCE_MS = 300;
function optionLabel(row) {
  if (!row) return "";
  return row.displayName ? `${row.displayName} (${row.username})` : row.username;
}
function UserAssignAutocomplete({ value, onChange, disabled = false, label = "Asignado a", compact = false }) {
  const username = value ? normalizeAssigneeUsername(value) : null;
  const [inputValue, setInputValue] = useState3("");
  const [options, setOptions] = useState3([]);
  const [loading, setLoading] = useState3(false);
  const [invalidHint, setInvalidHint] = useState3("");
  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);
  const resolveAttemptRef = useRef("");
  const selected = username ? options.find((o) => o.username === username) ?? null : null;
  const runSearch = useCallback(async (query) => {
    const id = ++requestIdRef.current;
    setLoading(true);
    try {
      const users = await searchScrumAppUsers(query, 12);
      if (id !== requestIdRef.current) return;
      setOptions(users);
      return users;
    } catch {
      if (id === requestIdRef.current) setOptions([]);
      return [];
    } finally {
      if (id === requestIdRef.current) setLoading(false);
    }
  }, []);
  const scheduleSearch = useCallback((query) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runSearch(query);
    }, DEBOUNCE_MS);
  }, [runSearch]);
  useEffect3(() => {
    if (!username) {
      resolveAttemptRef.current = "";
      setInputValue("");
      setInvalidHint("");
      return;
    }
    if (value && username !== value) {
      onChange(username);
      return;
    }
    const match = options.find((o) => o.username === username);
    if (match) {
      setInputValue(optionLabel(match));
      setInvalidHint("");
      return;
    }
    if (resolveAttemptRef.current === username) return;
    resolveAttemptRef.current = username;
    let cancelled = false;
    runSearch(username).then((users) => {
      if (cancelled) return;
      const resolved = users?.find((u) => u.username === username);
      if (resolved) {
        setOptions((prev) => prev.some((o) => o.username === resolved.username) ? prev : [...prev, resolved]);
        setInputValue(optionLabel(resolved));
        setInvalidHint("");
      } else {
        setInputValue("");
        setInvalidHint(`"${username}" no est\xE1 registrado en isa-patyia`);
        onChange(null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [value, username, options, runSearch, onChange]);
  useEffect3(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);
  useEffect3(() => {
    if (disabled) return;
    runSearch("");
  }, [disabled, runSearch]);
  if (disabled) {
    return /* @__PURE__ */ jsx5(
      TextField,
      {
        label,
        fullWidth: true,
        size: "small",
        value: username || "",
        disabled: true,
        placeholder: "Sin asignar"
      }
    );
  }
  return /* @__PURE__ */ jsx5(
    Autocomplete,
    {
      fullWidth: true,
      size: "small",
      openOnFocus: true,
      autoHighlight: true,
      clearOnBlur: false,
      freeSolo: false,
      selectOnFocus: true,
      handleHomeEndKeys: true,
      loading,
      options,
      value: selected,
      inputValue,
      filterOptions: (x) => x,
      getOptionLabel: optionLabel,
      isOptionEqualToValue: (a, b) => String(a?.username) === String(b?.username),
      noOptionsText: loading ? "Buscando\u2026" : "Sin usuarios registrados",
      loadingText: "Buscando\u2026",
      onOpen: () => {
        if (!options.length) runSearch(inputValue);
      },
      onInputChange: (_e, text, reason) => {
        if (reason === "reset") return;
        setInputValue(text);
        setInvalidHint("");
        scheduleSearch(text);
      },
      onChange: (_e, row) => {
        onChange(row?.username ?? null);
        setInputValue(row ? optionLabel(row) : "");
        setInvalidHint("");
      },
      renderOption: (props, row) => /* @__PURE__ */ createElement(Box2, { component: "li", ...props, key: row.username, sx: { display: "flex", flexDirection: "column", py: 0.75 } }, /* @__PURE__ */ jsx5(Typography2, { variant: "body2", sx: { fontWeight: 600 }, children: row.displayName || row.username }), row.displayName ? /* @__PURE__ */ jsx5(Typography2, { variant: "caption", color: "text.secondary", children: row.username }) : null),
      renderInput: (params) => /* @__PURE__ */ jsx5(
        TextField,
        {
          ...params,
          label,
          placeholder: "Buscar integrante\u2026",
          error: !!invalidHint,
          helperText: invalidHint || (compact ? void 0 : "Solo usuarios registrados en isa-patyia")
        }
      )
    }
  );
}

// ../Personal/apps/isa-patyia/frontend/js/tools/permisosVisitante.js
var VISITANTE_ROLE = "visitante";
var VISITANTE_DEFAULT_PERMISOS = {
  namedisplay: "Visitante",
  descripcion: "Visitante \u2014 solo sus propias conversaciones; logs abiertos; resto lectura",
  "GET:/api/conversaciones": { fixFilter: { ...SESSION_OWNER_FIX_FILTER } },
  "GET:/api/conversacion/*": { fixFilter: { ...SESSION_OWNER_FIX_FILTER } },
  "GET:/api/conversacion/logs/*": true,
  "POST:/api/conversacion": { fixFilter: { ...SESSION_OWNER_FIX_FILTER } },
  "POST:/api/mensaje": { fixFilter: { ...SESSION_OWNER_FIX_FILTER } },
  "DELETE:/api/conversacion/*": { fixFilter: { ...SESSION_OWNER_FIX_FILTER } }
};
var VISITANTE_LOCKED_OWN_KEYS = /* @__PURE__ */ new Set([
  "GET:/api/conversaciones",
  "GET:/api/conversacion/*",
  "POST:/api/conversacion",
  "POST:/api/mensaje",
  "DELETE:/api/conversacion/*"
]);
var VISITANTE_REQUIRED_OWN_KEYS = /* @__PURE__ */ new Set([
  "GET:/api/conversaciones",
  "GET:/api/conversacion/*"
]);
function isVisitanteRole(roleName) {
  return String(roleName ?? "").trim().toLowerCase() === VISITANTE_ROLE;
}
function enforceVisitantePermisos(permisos) {
  const out = { ...permisos ?? {} };
  delete out["*"];
  delete out.impersonate;
  delete out.manage_permissions;
  for (const key of VISITANTE_REQUIRED_OWN_KEYS) {
    out[key] = withSessionOwnerFixFilter({ fixFilter: { ...SESSION_OWNER_FIX_FILTER } });
  }
  for (const key of VISITANTE_LOCKED_OWN_KEYS) {
    const v = out[key];
    if (v == null || v === false) continue;
    if (v === true) out[key] = withSessionOwnerFixFilter(v);
    else if (typeof v === "object") out[key] = withSessionOwnerFixFilter(v);
  }
  return out;
}
function visitanteRouteLocked(key) {
  return VISITANTE_LOCKED_OWN_KEYS.has(key);
}
function getVisitanteRoleEntry(data) {
  const hit = (data?.roles ?? []).find((r) => roleNameFromEntry(r) === VISITANTE_ROLE);
  if (hit) return hit;
  return {
    iusuario: VISITANTE_ROLE,
    itipo: "role",
    permisos: { ...VISITANTE_DEFAULT_PERMISOS },
    bactivo: true
  };
}
function buildVisitanteConfigColumn(data) {
  const entry = getVisitanteRoleEntry(data);
  return {
    id: VISITANTE_ROLE,
    roleName: VISITANTE_ROLE,
    title: roleTitleFromEntry(entry),
    descripcion: roleDescripcion(entry.permisos),
    entry,
    accent: "#64748b",
    icon: "mdi:account-outline",
    users: []
  };
}

// ../Personal/apps/isa-patyia/frontend/js/tools/permisosRoleConfig.jsx
import { Fragment as Fragment2, jsx as jsx6, jsxs as jsxs3 } from "react/jsx-runtime";
var { useState: useState4, useEffect: useEffect4, useMemo: useMemo2 } = getReact();
var {
  Typography: Typography3,
  TextField: TextField2,
  Stack,
  Alert,
  Chip,
  Box: Box3,
  Checkbox,
  FormControlLabel,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  DialogContent: DialogContent2,
  DialogActions,
  Button,
  Tooltip,
  CircularProgress
} = getMaterialUI();
var { Icon } = UI;
var MODE_LABEL = Object.fromEntries(ACCESS_MODES.map((m) => [m.value, m.label]));
function PermJsonModal({ open, title, subtitle, initial, readOnly, onClose, onApply }) {
  const [json, setJson] = useState4(initial);
  const [err, setErr] = useState4("");
  useEffect4(() => {
    if (open) {
      setJson(initial);
      setErr("");
    }
  }, [open, initial]);
  function apply() {
    try {
      onApply?.(JSON.parse(json));
      onClose();
    } catch (e) {
      setErr("JSON inv\xE1lido: " + (e?.message || e));
    }
  }
  return /* @__PURE__ */ jsxs3(
    GlassDialog,
    {
      open,
      onClose,
      maxWidth: "md",
      fullWidth: true,
      paperMaxWidth: 920,
      header: /* @__PURE__ */ jsx6(GlassDialogHeader, { icon: "mdi:code-json", title, subtitle, accent: "#6366f1", onClose }),
      children: [
        /* @__PURE__ */ jsxs3(DialogContent2, { dividers: true, sx: glassDialogContentSx({ p: 0, minHeight: 360 }), children: [
          err ? /* @__PURE__ */ jsx6(Alert, { severity: "warning", sx: { m: 1.5, mb: 0 }, children: err }) : null,
          /* @__PURE__ */ jsx6(Box3, { className: "permisos-json-modal-editor", sx: { minHeight: 320, p: 1 }, children: /* @__PURE__ */ jsx6(JsonCodeEditor, { value: json, onChange: readOnly ? void 0 : setJson, readOnly, placeholder: "{}", fullPageTitle: title }) })
        ] }),
        /* @__PURE__ */ jsxs3(DialogActions, { sx: glassDialogActionsSx(), children: [
          /* @__PURE__ */ jsx6(Button, { onClick: onClose, sx: { textTransform: "none", fontWeight: 600 }, children: readOnly ? "Cerrar" : "Cancelar" }),
          !readOnly && onApply ? /* @__PURE__ */ jsx6(Button, { variant: "contained", onClick: apply, sx: { textTransform: "none", fontWeight: 600 }, children: "Aplicar JSON" }) : null
        ] })
      ]
    }
  );
}
function AccessModeSelect({ value, onChange, disabled, scoped }) {
  const modes = scoped ? ACCESS_MODES : ACCESS_MODES.filter((m) => m.value === "off" || m.value === "allow");
  return /* @__PURE__ */ jsxs3(FormControl, { size: "small", fullWidth: true, disabled, children: [
    /* @__PURE__ */ jsx6(InputLabel, { id: "perm-route-access-label", shrink: true, children: "Acceso" }),
    /* @__PURE__ */ jsx6(Select, { labelId: "perm-route-access-label", label: "Acceso", value: value || "off", onChange: (e) => onChange(e.target.value), children: modes.map((m) => /* @__PURE__ */ jsx6(MenuItem, { value: m.value, children: m.label }, m.value)) })
  ] });
}
function ModeChip({ mode }) {
  const color = mode === "off" ? "default" : mode === "filtered" ? "info" : "success";
  return /* @__PURE__ */ jsx6(Chip, { size: "small", variant: mode === "off" ? "outlined" : "filled", color, label: MODE_LABEL[mode] || mode });
}
function RouteGroupSection({ title, routes, canEdit, wildcard, onRouteMode, isVisitante }) {
  if (!routes.length) return null;
  return /* @__PURE__ */ jsxs3(Box3, { className: "permisos-route-group", children: [
    /* @__PURE__ */ jsx6(Typography3, { variant: "subtitle2", fontWeight: 700, className: "permisos-route-group__title", children: title }),
    /* @__PURE__ */ jsxs3(Table, { size: "small", className: "permisos-route-table__grid permisos-route-group__table", children: [
      /* @__PURE__ */ jsx6(TableHead, { children: /* @__PURE__ */ jsxs3(TableRow, { children: [
        /* @__PURE__ */ jsx6(TableCell, { children: "Ruta" }),
        /* @__PURE__ */ jsx6(TableCell, { sx: { width: "38%" }, children: "Clave" }),
        /* @__PURE__ */ jsx6(TableCell, { sx: { minWidth: 140 }, children: /* @__PURE__ */ jsx6(Tooltip, { title: `fixFilter \u2014 filtra por el usuario de la sesi\xF3n (${FIX_FILTER_VAR_HINT})`, children: /* @__PURE__ */ jsx6("span", { children: "Filtro de sesi\xF3n" }) }) }),
        /* @__PURE__ */ jsx6(TableCell, { sx: { width: 168 }, children: "Acceso" })
      ] }) }),
      /* @__PURE__ */ jsx6(TableBody, { children: routes.map((row) => {
        const active = row.mode !== "off";
        return /* @__PURE__ */ jsxs3(TableRow, { className: active ? "permisos-route-row--active" : "permisos-route-row--inactive", children: [
          /* @__PURE__ */ jsx6(TableCell, { children: /* @__PURE__ */ jsx6(Typography3, { variant: "body2", fontWeight: active ? 600 : 400, children: row.label }) }),
          /* @__PURE__ */ jsx6(TableCell, { children: /* @__PURE__ */ jsx6(Typography3, { component: "code", variant: "caption", sx: { wordBreak: "break-all" }, children: row.key }) }),
          /* @__PURE__ */ jsx6(TableCell, { children: row.fixFilter ? /* @__PURE__ */ jsx6(Tooltip, { title: `Plantillas {{var}} \u2014 ${FIX_FILTER_VAR_HINT}`, children: /* @__PURE__ */ jsx6(Typography3, { variant: "caption", color: "text.secondary", sx: { wordBreak: "break-all" }, children: formatFixFilter(row.fixFilter) }) }) : /* @__PURE__ */ jsx6(Typography3, { variant: "caption", color: "text.disabled", children: "\u2014" }) }),
          /* @__PURE__ */ jsx6(TableCell, { children: canEdit && !isVisitante && !visitanteRouteLocked(row.key) ? /* @__PURE__ */ jsx6(
            AccessModeSelect,
            {
              value: row.mode,
              scoped: !!row.scoped,
              disabled: wildcard,
              onChange: (mode) => onRouteMode(row.key, mode)
            }
          ) : isVisitante && visitanteRouteLocked(row.key) ? /* @__PURE__ */ jsx6(
            Chip,
            {
              size: "small",
              color: "info",
              variant: "outlined",
              icon: /* @__PURE__ */ jsx6(Icon, { icon: "mdi:lock", size: 14 }),
              label: "Alcance: propio (fijo)"
            }
          ) : /* @__PURE__ */ jsx6(ModeChip, { mode: row.mode }) })
        ] }, row.key);
      }) })
    ] })
  ] });
}
function RoutePermCatalog({ routes, flags, permisos, canEdit, onRoutesChange, isVisitante }) {
  const [newKey, setNewKey] = useState4("");
  const wildcard = flags?.["*"] || isWildcardRole(permisos);
  const view = useMemo2(() => {
    if (canEdit) return groupsFromRouteRows(routes, flags, { includeInactive: true });
    return routesForRoleEditor(permisos, { includeInactive: false });
  }, [canEdit, routes, flags, permisos]);
  const activeCount = canEdit ? countActiveRoutes(routes) : view.groups.reduce((n, g) => n + g.routes.length, 0) + view.extras.length;
  function onRouteMode(key, mode) {
    if (!canEdit || visitanteRouteLocked(key)) return;
    const hit = routes.find((r) => r.key === key);
    const next = hit ? routes.map((r) => {
      if (r.key !== key) return r;
      const row = { ...r, mode };
      if (mode === "allow" || mode === "off") delete row.fixFilter;
      return row;
    }) : [...routes, { key, mode }].sort((a, b) => a.key.localeCompare(b.key));
    onRoutesChange?.(next);
  }
  function addRow() {
    const key = String(newKey ?? "").trim();
    if (!key || routes.some((r) => r.key === key)) return;
    onRoutesChange?.([...routes, { key, mode: "allow" }].sort((a, b) => a.key.localeCompare(b.key)));
    setNewKey("");
  }
  return /* @__PURE__ */ jsxs3(Box3, { className: "permisos-route-catalog", children: [
    /* @__PURE__ */ jsxs3(Stack, { direction: "row", alignItems: "center", justifyContent: "space-between", sx: { mb: 1 }, children: [
      /* @__PURE__ */ jsx6(Typography3, { variant: "subtitle2", fontWeight: 700, children: "Rutas API" }),
      /* @__PURE__ */ jsx6(Chip, { size: "small", variant: "outlined", label: `${activeCount} activas` })
    ] }),
    isVisitante ? /* @__PURE__ */ jsxs3(Alert, { severity: "info", sx: { mb: 1.5 }, icon: /* @__PURE__ */ jsx6(Icon, { icon: "mdi:account-lock-outline", size: 18 }), children: [
      "Alcance fijo por ",
      /* @__PURE__ */ jsx6("code", { children: "fixFilter" }),
      " de sesi\xF3n (",
      /* @__PURE__ */ jsx6("code", { children: "itercero" }),
      ", ",
      /* @__PURE__ */ jsx6("code", { children: "icontacto" }),
      "). El ISS fusiona ese filtro con la petici\xF3n y siempre gana sobre query o ",
      /* @__PURE__ */ jsx6("code", { children: "f.eq" }),
      "."
    ] }) : null,
    wildcard ? /* @__PURE__ */ jsxs3(Alert, { severity: "info", sx: { mb: 1.5 }, icon: /* @__PURE__ */ jsx6(Icon, { icon: "mdi:asterisk", size: 18 }), children: [
      "Acceso total (",
      /* @__PURE__ */ jsx6("code", { children: "*" }),
      ") \u2014 todas las rutas quedan cubiertas por el wildcard."
    ] }) : null,
    !view.groups.length && !view.extras.length ? /* @__PURE__ */ jsx6(Typography3, { variant: "body2", color: "text.secondary", children: "Sin rutas activas para este rol." }) : /* @__PURE__ */ jsxs3(Stack, { spacing: 2, className: "permisos-route-catalog__groups", children: [
      view.groups.map((g) => /* @__PURE__ */ jsx6(RouteGroupSection, { title: g.title, routes: g.routes, canEdit, wildcard, onRouteMode, isVisitante }, g.id)),
      view.extras.length ? /* @__PURE__ */ jsx6(RouteGroupSection, { title: "Otras claves", routes: view.extras, canEdit, wildcard, onRouteMode, isVisitante }) : null
    ] }),
    canEdit && !wildcard && !isVisitante ? /* @__PURE__ */ jsxs3(Stack, { direction: { xs: "column", sm: "row" }, spacing: 1, sx: { mt: 1.5 }, children: [
      /* @__PURE__ */ jsx6(
        TextField2,
        {
          size: "small",
          fullWidth: true,
          label: "Clave adicional",
          placeholder: "GET:/api/conversaciones",
          value: newKey,
          onChange: (e) => setNewKey(e.target.value),
          onKeyDown: (e) => e.key === "Enter" && addRow()
        }
      ),
      /* @__PURE__ */ jsx6(ButtonIconify, { icon: "mdi:plus", title: "Agregar", label: "Agregar", onClick: addRow, disabled: !newKey.trim() })
    ] }) : null
  ] });
}
function RoleConfigEditor({ entry, roleName, canManage, canEditRoleDescriptions, onChange }) {
  const canEditPermisos = !!canManage;
  const canEditMeta = canManage || canEditRoleDescriptions;
  const resolvedRole = roleName ?? String(entry?.iusuario ?? "").trim().toLowerCase().replace(/^role:/i, "");
  const isVisitante = isVisitanteRole(resolvedRole);
  const [namedisplay, setNamedisplay] = useState4(roleNamedisplay(entry?.permisos));
  const [desc, setDesc] = useState4(roleDescripcion(entry?.permisos));
  const [flags, setFlags] = useState4(() => splitRolePermisos(entry?.permisos).flags);
  const [routes, setRoutes] = useState4(() => routesArrayFromPermisos(entry?.permisos, canEditPermisos));
  const entryDesc = roleDescripcion(entry?.permisos);
  const entryNamedisplay = roleNamedisplay(entry?.permisos);
  useEffect4(() => {
    setNamedisplay(roleNamedisplay(entry?.permisos));
    setDesc(roleDescripcion(entry?.permisos));
    const split = splitRolePermisos(entry?.permisos);
    setFlags(split.flags);
    setRoutes(routesArrayFromPermisos(entry?.permisos, canEditPermisos));
  }, [entry?.permisos, entry?.iusuario, canEditPermisos]);
  function emit(nextNamedisplay = namedisplay, nextDesc = desc, nextFlags = flags, nextRoutes = routes) {
    if (!onChange) return;
    if (canManage) {
      let permisos = buildRolePermisos(
        canEditMeta ? nextDesc : entryDesc,
        canEditMeta ? nextNamedisplay : entryNamedisplay,
        nextFlags,
        nextRoutes
      );
      if (isVisitante) permisos = enforceVisitantePermisos(permisos);
      onChange(permisos);
    } else if (canEditRoleDescriptions) {
      onChange({
        ...entry?.permisos ?? {},
        descripcion: String(nextDesc).trim() || void 0,
        namedisplay: String(nextNamedisplay).trim() || void 0
      });
    }
  }
  return /* @__PURE__ */ jsxs3(Stack, { spacing: 3, className: "permisos-role-config-editor", children: [
    canEditMeta ? /* @__PURE__ */ jsxs3(Box3, { component: "section", className: "permisos-role-config-editor__meta", children: [
      /* @__PURE__ */ jsx6(Typography3, { variant: "subtitle2", fontWeight: 700, sx: { mb: 1.25 }, children: "Metadatos del rol" }),
      /* @__PURE__ */ jsxs3(Stack, { spacing: 1.5, children: [
        /* @__PURE__ */ jsx6(
          TextField2,
          {
            label: "Nombre a mostrar",
            size: "small",
            fullWidth: true,
            value: namedisplay,
            disabled: !canEditRoleDescriptions,
            onChange: (e) => {
              const v = e.target.value;
              setNamedisplay(v);
              emit(v, desc, flags, routes);
            }
          }
        ),
        /* @__PURE__ */ jsx6(
          TextField2,
          {
            label: "Descripci\xF3n",
            size: "small",
            fullWidth: true,
            value: desc,
            disabled: !canEditRoleDescriptions,
            onChange: (e) => {
              const v = e.target.value;
              setDesc(v);
              emit(namedisplay, v, flags, routes);
            }
          }
        )
      ] })
    ] }) : /* @__PURE__ */ jsxs3(Box3, { component: "section", className: "permisos-role-config-editor__meta permisos-role-config-editor__meta--readonly", children: [
      /* @__PURE__ */ jsx6(Typography3, { variant: "subtitle2", fontWeight: 700, sx: { mb: 0.75 }, children: roleNamedisplay(entry?.permisos) || roleTitleFromEntry(entry) }),
      roleDescripcion(entry?.permisos) ? /* @__PURE__ */ jsx6(Typography3, { variant: "body2", color: "text.secondary", children: roleDescripcion(entry?.permisos) }) : null
    ] }),
    /* @__PURE__ */ jsx6(Divider, { className: "permisos-role-config-divider" }),
    /* @__PURE__ */ jsxs3(Box3, { component: "section", className: "permisos-role-config-editor__flags", children: [
      /* @__PURE__ */ jsx6(Typography3, { variant: "subtitle2", fontWeight: 700, sx: { mb: 0.75 }, children: "Privilegios globales" }),
      isVisitante ? /* @__PURE__ */ jsx6(Typography3, { variant: "body2", color: "text.secondary", children: "El rol visitante no usa privilegios globales ni acceso total." }) : /* @__PURE__ */ jsx6(Stack, { spacing: 0.25, children: FLAG_DEFS.map((f) => /* @__PURE__ */ jsx6(Tooltip, { title: f.hint, placement: "right", children: /* @__PURE__ */ jsx6(
        FormControlLabel,
        {
          control: /* @__PURE__ */ jsx6(
            Checkbox,
            {
              size: "small",
              checked: !!flags[f.key],
              disabled: !canEditPermisos,
              onChange: (e) => {
                if (!canEditPermisos) return;
                const nf = { ...flags, [f.key]: e.target.checked };
                setFlags(nf);
                emit(namedisplay, desc, nf, routes);
              }
            }
          ),
          label: /* @__PURE__ */ jsx6(Typography3, { variant: "body2", fontWeight: flags[f.key] ? 600 : 400, children: f.label })
        }
      ) }, f.key)) })
    ] }),
    /* @__PURE__ */ jsx6(Divider, { className: "permisos-role-config-divider" }),
    /* @__PURE__ */ jsx6(Box3, { component: "section", className: "permisos-role-config-editor__routes", children: /* @__PURE__ */ jsx6(
      RoutePermCatalog,
      {
        routes,
        flags,
        permisos: entry?.permisos,
        canEdit: canEditPermisos,
        isVisitante,
        onRoutesChange: (nr) => {
          setRoutes(nr);
          emit(namedisplay, desc, flags, nr);
        }
      }
    ) })
  ] });
}
function RoleConfigFullscreenDialog({ open, column, canManage, canEditRoleDescriptions, busy, onClose, onSave }) {
  const roleName = column?.roleName ?? "";
  const roleTitle = column?.title ?? roleTitleFromEntry(column?.entry) ?? roleName;
  const canSave = canManage || canEditRoleDescriptions;
  const [draft, setDraft] = useState4(column?.entry?.permisos ?? {});
  const [bactivo, setBactivo] = useState4(column?.entry?.bactivo !== false);
  const [jsonOpen, setJsonOpen] = useState4(false);
  const [err, setErr] = useState4("");
  useEffect4(() => {
    if (open && column?.entry) {
      const raw = column.entry.permisos ?? {};
      setDraft(isVisitanteRole(roleName) ? enforceVisitantePermisos(raw) : raw);
      setBactivo(column.entry.bactivo !== false);
    }
  }, [open, column?.entry?.iusuario, column?.entry?.permisos, column?.entry?.bactivo, roleName]);
  const jsonPreview = useMemo2(() => draft, [draft]);
  const summary = summarizePermisos(column?.entry?.permisos ?? {});
  function save() {
    setErr("");
    const permisos = isVisitanteRole(roleName) ? enforceVisitantePermisos(draft) : draft;
    onSave?.({ name: roleName, permisos, bactivo: canManage ? bactivo : void 0 });
  }
  function applyJson(parsed) {
    if (!canManage) return;
    setDraft(isVisitanteRole(roleName) ? enforceVisitantePermisos(parsed) : parsed);
  }
  if (!column) return null;
  const roleIcon = isVisitanteRole(roleName) ? "mdi:account-lock-outline" : "mdi:shield-key-outline";
  const roleAccent = isVisitanteRole(roleName) ? "#64748b" : "#1e90ff";
  return /* @__PURE__ */ jsxs3(Fragment2, { children: [
    /* @__PURE__ */ jsx6(
      GlassDialog,
      {
        open,
        onClose,
        fullScreen: true,
        fullWidth: true,
        maxWidth: false,
        paperClassName: "isa-glass-dialog--fullscreen permisos-role-config-dialog",
        header: /* @__PURE__ */ jsxs3(Box3, { sx: { position: "relative", flexShrink: 0 }, children: [
          /* @__PURE__ */ jsx6(
            GlassDialogHeader,
            {
              icon: roleIcon,
              title: roleTitle,
              subtitle: `${roleName} \xB7 ${summary.flagCount} privilegios \xB7 ${summary.routeCount} rutas`,
              accent: roleAccent,
              onClose
            }
          ),
          /* @__PURE__ */ jsxs3(Stack, { direction: "row", spacing: 0.75, alignItems: "center", className: "permisos-role-config-dialog__toolbar", children: [
            /* @__PURE__ */ jsx6(ButtonIconify, { icon: "mdi:code-json", title: "Ver JSON", onClick: () => setJsonOpen(true) }),
            canSave ? /* @__PURE__ */ jsx6(
              ButtonIconify,
              {
                variant: "primary",
                icon: "mdi:content-save-outline",
                title: "Guardar",
                label: "Guardar",
                onClick: save,
                disabled: busy,
                busy
              }
            ) : null
          ] })
        ] }),
        children: /* @__PURE__ */ jsxs3(
          DialogContent2,
          {
            className: "permisos-role-config-dialog__body custom-scrollbar",
            sx: glassDialogContentSx({ flex: 1, minHeight: 0, px: 0, py: 0 }),
            children: [
              err ? /* @__PURE__ */ jsx6(Alert, { severity: "warning", sx: { mb: 2 }, children: err }) : null,
              !canManage && !canEditRoleDescriptions ? /* @__PURE__ */ jsxs3(Alert, { severity: "info", sx: { mb: 2 }, icon: /* @__PURE__ */ jsx6(Icon, { icon: "mdi:eye-outline", size: 18 }), children: [
                "Vista de solo lectura. Solo ",
                /* @__PURE__ */ jsx6("strong", { children: "dev_lead" }),
                " puede modificar privilegios y rutas."
              ] }) : null,
              canManage && !isVisitanteRole(roleName) ? /* @__PURE__ */ jsx6(
                FormControlLabel,
                {
                  sx: { mb: 1.5, ml: 0 },
                  control: /* @__PURE__ */ jsx6(Checkbox, { checked: bactivo, onChange: (e) => setBactivo(e.target.checked), disabled: busy }),
                  label: "Rol activo (visible en kanban y asignable a usuarios)"
                }
              ) : null,
              /* @__PURE__ */ jsx6(RoleConfigEditor, { entry: { ...column.entry, permisos: draft }, roleName, canManage, canEditRoleDescriptions, onChange: setDraft })
            ]
          }
        )
      }
    ),
    /* @__PURE__ */ jsx6(
      PermJsonModal,
      {
        open: jsonOpen,
        title: `Rol ${roleTitle}`,
        initial: prettyJson(jsonPreview),
        readOnly: !canManage,
        onClose: () => setJsonOpen(false),
        onApply: canManage ? applyJson : void 0
      }
    )
  ] });
}
function RoleDragDialog({ open, pending, busy, onClose, onConfirm }) {
  if (!pending) return null;
  const { username, fromRole, toRole } = pending;
  function confirm2(mode) {
    if (busy) return;
    onConfirm(mode);
  }
  return /* @__PURE__ */ jsxs3(
    GlassDialog,
    {
      open,
      onClose: busy ? void 0 : onClose,
      maxWidth: "sm",
      fullWidth: true,
      disableEscapeKeyDown: busy,
      header: /* @__PURE__ */ jsx6(GlassDialogHeader, { icon: "mdi:account-switch", title: "Asignar rol", subtitle: `${username}: ${fromRole} \u2192 ${toRole}`, accent: "#1e90ff", onClose: busy ? void 0 : onClose }),
      children: [
        /* @__PURE__ */ jsxs3(DialogContent2, { sx: glassDialogContentSx({ p: 2.5 }), children: [
          /* @__PURE__ */ jsxs3(Typography3, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: [
            "\xBFAsignar ",
            /* @__PURE__ */ jsx6("strong", { children: username }),
            " al rol ",
            /* @__PURE__ */ jsx6("strong", { children: toRole }),
            "?"
          ] }),
          /* @__PURE__ */ jsxs3(Stack, { spacing: 1.25, children: [
            /* @__PURE__ */ jsx6(
              Button,
              {
                variant: "contained",
                fullWidth: true,
                disabled: busy,
                sx: { textTransform: "none", justifyContent: "flex-start", py: 1.25 },
                onClick: () => confirm2("move"),
                startIcon: busy ? /* @__PURE__ */ jsx6(CircularProgress, { size: 16, color: "inherit" }) : /* @__PURE__ */ jsx6(Icon, { icon: "mdi:arrow-right-bold", size: 18 }),
                children: busy ? "Procesando\u2026" : `Mover (quitar de ${fromRole})`
              }
            ),
            /* @__PURE__ */ jsx6(
              Button,
              {
                variant: "outlined",
                fullWidth: true,
                disabled: busy,
                sx: { textTransform: "none", justifyContent: "flex-start", py: 1.25 },
                onClick: () => confirm2("copy"),
                startIcon: busy ? /* @__PURE__ */ jsx6(CircularProgress, { size: 16, color: "inherit" }) : /* @__PURE__ */ jsx6(Icon, { icon: "mdi:content-copy", size: 18 }),
                children: busy ? "Procesando\u2026" : `Copiar (mantener en ${fromRole})`
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx6(DialogActions, { sx: glassDialogActionsSx(), children: /* @__PURE__ */ jsx6(Button, { onClick: onClose, disabled: busy, sx: { textTransform: "none" }, children: "Cancelar" }) })
      ]
    }
  );
}
function RoleAddDialog({ open, pending, busy, onClose, onConfirm }) {
  const [username, setUsername] = useState4(null);
  useEffect4(() => {
    if (open) setUsername(null);
  }, [open]);
  if (!pending) return null;
  const { roleTitle, role, existingUsernames } = pending;
  const roleLabel = roleTitle || role;
  const alreadyInRole = username && existingUsernames?.has(String(username).trim().toUpperCase());
  return /* @__PURE__ */ jsxs3(
    GlassDialog,
    {
      open,
      onClose: busy ? void 0 : onClose,
      maxWidth: "sm",
      fullWidth: true,
      header: /* @__PURE__ */ jsx6(GlassDialogHeader, { icon: "mdi:account-plus-outline", title: "Agregar al rol", subtitle: roleLabel, accent: "#10b981", onClose: busy ? void 0 : onClose }),
      children: [
        /* @__PURE__ */ jsxs3(DialogContent2, { sx: glassDialogContentSx({ p: 2.5 }), children: [
          /* @__PURE__ */ jsxs3(Typography3, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: [
            "Busque un usuario registrado en isa-patyia para asignarlo al rol ",
            /* @__PURE__ */ jsx6("strong", { children: roleLabel }),
            "."
          ] }),
          /* @__PURE__ */ jsx6(UserAssignAutocomplete, { value: username, onChange: setUsername, disabled: busy, label: "Usuario" }),
          alreadyInRole ? /* @__PURE__ */ jsx6(Alert, { severity: "warning", sx: { mt: 1.5 }, children: "Este usuario ya est\xE1 en el rol." }) : null
        ] }),
        /* @__PURE__ */ jsxs3(DialogActions, { sx: glassDialogActionsSx(), children: [
          /* @__PURE__ */ jsx6(Button, { onClick: onClose, disabled: busy, sx: { textTransform: "none" }, children: "Cancelar" }),
          /* @__PURE__ */ jsx6(
            Button,
            {
              variant: "contained",
              disabled: busy || !username || alreadyInRole,
              onClick: () => onConfirm(username),
              sx: { textTransform: "none", minWidth: 120 },
              startIcon: busy ? /* @__PURE__ */ jsx6(CircularProgress, { size: 16, color: "inherit" }) : /* @__PURE__ */ jsx6(Icon, { icon: "mdi:account-plus-outline", size: 18 }),
              children: busy ? "Agregando\u2026" : "Agregar"
            }
          )
        ] })
      ]
    }
  );
}
function RoleRemoveDialog({ open, pending, busy, onClose, onConfirm }) {
  if (!pending) return null;
  const { username, roleTitle, role } = pending;
  const roleLabel = roleTitle || role;
  return /* @__PURE__ */ jsxs3(
    GlassDialog,
    {
      open,
      onClose: busy ? void 0 : onClose,
      maxWidth: "sm",
      fullWidth: true,
      disableEscapeKeyDown: busy,
      header: /* @__PURE__ */ jsx6(GlassDialogHeader, { icon: "mdi:account-remove-outline", title: "Quitar del rol", subtitle: `${username} \xB7 ${roleLabel}`, accent: "#f59e0b", onClose: busy ? void 0 : onClose }),
      children: [
        /* @__PURE__ */ jsxs3(DialogContent2, { sx: glassDialogContentSx({ p: 2.5 }), children: [
          /* @__PURE__ */ jsx6(Alert, { severity: "warning", sx: { mb: 2 }, children: "Esta acci\xF3n revoca permisos de forma inmediata. Revise las consecuencias antes de confirmar." }),
          /* @__PURE__ */ jsxs3(Typography3, { variant: "body2", color: "text.secondary", sx: { mb: 1.5 }, children: [
            "\xBFQuitar a ",
            /* @__PURE__ */ jsx6("strong", { children: username }),
            " del rol ",
            /* @__PURE__ */ jsx6("strong", { children: roleLabel }),
            "?"
          ] }),
          /* @__PURE__ */ jsxs3(Box3, { component: "ul", sx: { m: 0, pl: 2.25, color: "text.secondary", fontSize: "0.875rem", "& li": { mb: 0.75 } }, children: [
            /* @__PURE__ */ jsxs3("li", { children: [
              "Perder\xE1 los permisos, rutas y privilegios asociados a ",
              /* @__PURE__ */ jsx6("strong", { children: roleLabel }),
              "."
            ] }),
            /* @__PURE__ */ jsx6("li", { children: "Dejar\xE1 de aparecer en la columna de ese rol en el tablero." }),
            /* @__PURE__ */ jsx6("li", { children: "Sus otros roles asignados no se modifican." }),
            /* @__PURE__ */ jsx6("li", { children: "Para restaurar el acceso, un dev_lead deber\xE1 volver a asignar el rol." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs3(DialogActions, { sx: glassDialogActionsSx(), children: [
          /* @__PURE__ */ jsx6(Button, { onClick: onClose, disabled: busy, sx: { textTransform: "none" }, children: "Cancelar" }),
          /* @__PURE__ */ jsx6(
            Button,
            {
              variant: "contained",
              color: "warning",
              disabled: busy,
              onClick: onConfirm,
              sx: { textTransform: "none", minWidth: 120 },
              startIcon: busy ? /* @__PURE__ */ jsx6(CircularProgress, { size: 16, color: "inherit" }) : /* @__PURE__ */ jsx6(Icon, { icon: "mdi:account-remove-outline", size: 18 }),
              children: busy ? "Quitando\u2026" : "Confirmar"
            }
          )
        ] })
      ]
    }
  );
}

// ../Personal/apps/isa-patyia/frontend/js/tools/PermisosKanban.jsx
import { Fragment as Fragment3, jsx as jsx7, jsxs as jsxs4 } from "react/jsx-runtime";
var { useState: useState5, useMemo: useMemo3, useRef: useRef2, useEffect: useEffect5, memo } = getReact();
var { createPortal } = getReactDOM();
var { Box: Box4, Paper, Typography: Typography4, Stack: Stack2, Chip: Chip2, IconButton, Tooltip: Tooltip2, CircularProgress: CircularProgress2 } = getMaterialUI();
var { Icon: Icon2 } = UI;
var DRAG_THRESHOLD_PX = 6;
var UserCard = memo(function UserCard2({ card, columnId, columnTitle, readOnly, isDragSource, userBusy, isSelected, isDimmed, onPointerDragStart, onRoleRemoveRequest, onUserSelect, suppressClickRef }) {
  const canDragRole = !readOnly && !userBusy;
  const canStartDrag = !userBusy;
  const labels = card.labels ?? userCardLabels(card.username, card.displayName);
  const cardClass = [
    "paty-todos-card",
    "paty-permisos-user-card",
    "isa-glass-card",
    canDragRole ? "paty-todos-card--draggable" : "",
    readOnly && canStartDrag ? "paty-permisos-user-card--filter-draggable" : "",
    isDragSource ? "paty-todos-card--drag-source" : "",
    userBusy ? "paty-permisos-user-card--user-busy" : "",
    isSelected ? "paty-permisos-user-card--selected" : "",
    isDimmed ? "paty-permisos-user-card--dimmed" : ""
  ].filter(Boolean).join(" ");
  return /* @__PURE__ */ jsx7(
    Paper,
    {
      className: cardClass,
      elevation: 0,
      "aria-busy": userBusy || void 0,
      onPointerDown: (e) => {
        if (!canStartDrag || e.button !== 0 && e.pointerType !== "touch") return;
        if (e.target.closest(".paty-permisos-user-card__remove, .paty-permisos-user-card__busy")) return;
        onPointerDragStart(card.id, columnId, card.username, e);
      },
      onClick: (e) => {
        if (suppressClickRef.current) {
          suppressClickRef.current = false;
          return;
        }
        if (userBusy || e.target.closest(".paty-permisos-user-card__remove, .paty-permisos-user-card__busy")) return;
        e.stopPropagation();
        onUserSelect?.(card.username);
      },
      children: /* @__PURE__ */ jsxs4(Stack2, { direction: "row", alignItems: "center", spacing: 0.25, className: "paty-permisos-user-card__row", sx: { minWidth: 0 }, children: [
        /* @__PURE__ */ jsxs4(Box4, { className: "paty-permisos-user-card__body", sx: { minWidth: 0, flex: 1 }, children: [
          /* @__PURE__ */ jsx7(Typography4, { className: "paty-todos-card__title", component: "div", variant: "body2", fontWeight: 700, noWrap: true, title: labels.primary, children: labels.primary }),
          labels.secondary ? /* @__PURE__ */ jsx7(Typography4, { className: "paty-todos-card__caption", component: "div", variant: "caption", color: "text.secondary", noWrap: true, title: labels.secondary, children: labels.secondary }) : null
        ] }),
        userBusy ? /* @__PURE__ */ jsx7(Tooltip2, { title: "Procesando\u2026", children: /* @__PURE__ */ jsx7("span", { className: "paty-permisos-user-card__busy", "aria-label": "Procesando", children: /* @__PURE__ */ jsx7(CircularProgress2, { size: 14, thickness: 5, color: "inherit" }) }) }) : canDragRole ? /* @__PURE__ */ jsx7(Tooltip2, { title: `Quitar de ${columnTitle || columnId}`, children: /* @__PURE__ */ jsx7("span", { className: "paty-permisos-user-card__remove-wrap", children: /* @__PURE__ */ jsx7(
          IconButton,
          {
            size: "small",
            type: "button",
            className: "paty-permisos-user-card__remove",
            "aria-label": `Quitar de ${columnTitle || columnId}`,
            onPointerDown: (e) => {
              e.stopPropagation();
            },
            onClick: (e) => {
              e.stopPropagation();
              e.preventDefault();
              onRoleRemoveRequest?.({ cardId: card.id, username: card.username, role: columnId, roleTitle: columnTitle });
            },
            children: /* @__PURE__ */ jsx7(Icon2, { icon: "mdi:close", size: 14 })
          }
        ) }) }) : null
      ] })
    }
  );
});
function DragGhost({ card, column, x, y, width }) {
  if (column) {
    const node2 = /* @__PURE__ */ jsx7(
      Paper,
      {
        className: "paty-todos-card paty-permisos-column-ghost paty-todos-card--ghost isa-glass-card",
        elevation: 8,
        style: { position: "fixed", left: x, top: y, width, zIndex: 1e4, pointerEvents: "none", margin: 0 },
        "aria-hidden": true,
        children: /* @__PURE__ */ jsxs4(Stack2, { direction: "row", alignItems: "center", spacing: 0.75, sx: { minWidth: 0 }, children: [
          /* @__PURE__ */ jsx7(Icon2, { icon: column.icon, size: 16 }),
          /* @__PURE__ */ jsx7(Typography4, { className: "paty-todos-card__title", variant: "body2", fontWeight: 700, noWrap: true, children: column.title })
        ] })
      }
    );
    return typeof document !== "undefined" ? createPortal(node2, document.body) : node2;
  }
  if (!card) return null;
  const labels = card.labels ?? userCardLabels(card.username, card.displayName);
  const node = /* @__PURE__ */ jsxs4(
    Paper,
    {
      className: "paty-todos-card paty-permisos-user-card paty-permisos-drag-ghost paty-todos-card--ghost isa-glass-card",
      elevation: 8,
      style: { position: "fixed", left: x, top: y, width, zIndex: 1e4, pointerEvents: "none", margin: 0 },
      "aria-hidden": true,
      children: [
        /* @__PURE__ */ jsx7(Typography4, { className: "paty-todos-card__title", variant: "body2", fontWeight: 700, noWrap: true, children: labels.primary }),
        labels.secondary ? /* @__PURE__ */ jsx7(Typography4, { className: "paty-todos-card__caption", variant: "caption", color: "text.secondary", noWrap: true, children: labels.secondary }) : null
      ]
    }
  );
  return typeof document !== "undefined" ? createPortal(node, document.body) : node;
}
function PermisosKanban({ boardData, readOnly, canManage, canEditRoleDescriptions, busy, actorJerarquia, filterToolbarRef, onUserFilterDrop, onRoleFilterDrop, onDragOverFilterChange, onRoleSave, onRoleDrag, onRoleRemove, onRoleAdd, onJerarquiaToast }) {
  const [dragOverCol, setDragOverCol] = useState5(null);
  const [draggingId, setDraggingId] = useState5(null);
  const [dragGhost, setDragGhost] = useState5(null);
  const [configCol] = useState5(null);
  const [dragPending, setDragPending] = useState5(null);
  const [removePending, setRemovePending] = useState5(null);
  const [addPending, setAddPending] = useState5(null);
  const [addingRoleId, setAddingRoleId] = useState5(null);
  const [processingUsername, setProcessingUsername] = useState5(null);
  const [selectedUsername, setSelectedUsername] = useState5(null);
  const [dragSourceCol, setDragSourceCol] = useState5(null);
  const kanbanWrapRef = useRef2(null);
  const listRefs = useRef2({});
  const columnRefs = useRef2({});
  const dragRef = useRef2(null);
  const cardElRef = useRef2(null);
  const suppressClickRef = useRef2(false);
  const processingUserRef = useRef2(null);
  const dragPendingRef = useRef2(null);
  const columns = boardData?.columns ?? [];
  const filterActive = !!boardData?.filterActive;
  const noUsersVisible = !!boardData?.noUsersVisible;
  const columnIds = useMemo3(() => columns.map((c) => c.id), [columns]);
  const ghostColumn = useMemo3(() => {
    if (!dragGhost?.columnId) return null;
    return columns.find((c) => c.id === dragGhost.columnId) ?? null;
  }, [dragGhost, columns]);
  const ghostCard = useMemo3(() => {
    if (!dragGhost?.cardId) return null;
    for (const col of columns) {
      const hit = col.users.find((u) => u.id === dragGhost.cardId);
      if (hit) return hit;
    }
    return null;
  }, [dragGhost, columns]);
  const selectedUserKey = selectedUsername ? String(selectedUsername).trim().toUpperCase() : null;
  const processingUserKey = processingUsername ? String(processingUsername).trim().toUpperCase() : null;
  useEffect5(() => {
    dragPendingRef.current = dragPending;
  }, [dragPending]);
  function userKey(username) {
    return String(username ?? "").trim().toUpperCase();
  }
  function beginUserProcessing(username) {
    const key = userKey(username);
    if (!key || processingUserRef.current) return null;
    processingUserRef.current = key;
    setProcessingUsername(key);
    return key;
  }
  function endUserProcessing() {
    processingUserRef.current = null;
    setProcessingUsername(null);
  }
  useEffect5(() => {
    function onDocPointerDown(e) {
      if (e.target.closest(".paty-permisos-user-card")) return;
      if (e.target.closest(".MuiDialog-root, .isa-glass-dialog")) return;
      setSelectedUsername(null);
    }
    document.addEventListener("pointerdown", onDocPointerDown, true);
    return () => document.removeEventListener("pointerdown", onDocPointerDown, true);
  }, []);
  function handleUserSelect(username) {
    const key = String(username ?? "").trim().toUpperCase();
    if (!key || processingUserKey === key) return;
    setSelectedUsername((prev) => prev && String(prev).trim().toUpperCase() === key ? null : key);
  }
  async function handleRemoveConfirm() {
    if (!removePending || !onRoleRemove || processingUserRef.current) return;
    if (!beginUserProcessing(removePending.username)) return;
    try {
      await onRoleRemove(removePending);
      setRemovePending(null);
    } catch {
    } finally {
      endUserProcessing();
    }
  }
  async function handleDragConfirm(mode) {
    const pending = dragPendingRef.current;
    if (!pending || !onRoleDrag || processingUserRef.current) return;
    if (!beginUserProcessing(pending.username)) return;
    setDragPending(null);
    try {
      await onRoleDrag({ ...pending, mode });
    } catch {
    } finally {
      endUserProcessing();
    }
  }
  async function handleAddConfirm(username) {
    if (!addPending || !onRoleAdd || addingRoleId || !username) return;
    setAddingRoleId(addPending.role);
    try {
      await onRoleAdd({ username, role: addPending.role, roleTitle: addPending.roleTitle });
      setAddPending(null);
    } catch {
    } finally {
      setAddingRoleId(null);
    }
  }
  function finishDrag(clientX, clientY) {
    const state = dragRef.current;
    dragRef.current = null;
    setDraggingId(null);
    setDragOverCol(null);
    setDragSourceCol(null);
    setDragGhost(null);
    cardElRef.current = null;
    if (!state?.moved) return;
    suppressClickRef.current = true;
    if (filterToolbarRef && pointInRef(filterToolbarRef, clientX, clientY)) {
      if (state.kind === "column") onRoleFilterDrop?.(state.columnId);
      else if (state.username) onUserFilterDrop?.(state.username);
      return;
    }
    if (state.kind === "column") return;
    if (readOnly) return;
    if (processingUserRef.current) return;
    const targetCol = columnAtPoint(columnIds, columnRefs, clientX, clientY);
    if (!targetCol || targetCol === state.sourceColumnId) return;
    const username = state.username;
    if (processingUserRef.current && userKey(username) === processingUserRef.current) return;
    const fromRole = state.sourceColumnId;
    const toRole = targetCol;
    const targetColData = columns.find((c) => c.id === toRole);
    if (targetColData?.users?.some((u) => u.username === username)) return;
    if (actorJerarquia != null && !canActorManageColumn(actorJerarquia, targetColData)) {
      onJerarquiaToast?.({
        type: "info",
        message: `Tu rol actual (jerarqu\xEDa ${actorJerarquia}) no puede asignar a ${targetColData?.title ?? toRole} (jerarqu\xEDa ${targetColData?.jerarquia ?? "?"})`,
        actorJerarquia,
        targetJerarquia: targetColData?.jerarquia,
        targetRole: toRole
      });
      return;
    }
    setDragPending({ username: userKey(username), fromRole, toRole });
  }
  function handleColumnHeadDragStart(col, e) {
    if (e.target.closest("button, .MuiIconButton-root")) return;
    if (processingUserRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    dragRef.current = {
      kind: "column",
      columnId: col.id,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      ghostWidth: rect.width,
      moved: false,
      pointerId: e.pointerId
    };
    cardElRef.current = e.currentTarget;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
    }
  }
  function handlePointerDragStart(cardId, sourceColumnId, username, e) {
    const key = userKey(username);
    if (processingUserRef.current && key === processingUserRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    dragRef.current = {
      kind: "user",
      cardId,
      sourceColumnId,
      username,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      ghostWidth: rect.width,
      moved: false,
      pointerId: e.pointerId
    };
    cardElRef.current = e.currentTarget;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
    }
  }
  useEffect5(() => {
    function onPointerMove(e) {
      const state = dragRef.current;
      if (!state || e.pointerId !== state.pointerId) return;
      const dx = Math.abs(e.clientX - state.startX);
      const dy = Math.abs(e.clientY - state.startY);
      if (!state.moved && dx + dy < DRAG_THRESHOLD_PX) return;
      if (!state.moved) {
        state.moved = true;
        if (state.kind === "column") setDraggingId(`col:${state.columnId}`);
        else setDraggingId(state.cardId);
        setDragSourceCol(state.sourceColumnId ?? null);
        if (state.ghostWidth != null) {
          setDragGhost({
            cardId: state.cardId,
            columnId: state.columnId,
            x: e.clientX - state.offsetX,
            y: e.clientY - state.offsetY,
            width: state.ghostWidth
          });
        }
      }
      e.preventDefault();
      if (state.ghostWidth != null) {
        setDragGhost({ cardId: state.cardId, columnId: state.columnId, x: e.clientX - state.offsetX, y: e.clientY - state.offsetY, width: state.ghostWidth });
      }
      const overFilter = filterToolbarRef && pointInRef(filterToolbarRef, e.clientX, e.clientY);
      onDragOverFilterChange?.(!!overFilter);
      if (overFilter || state.kind === "column") setDragOverCol(null);
      else setDragOverCol(readOnly ? null : columnAtPoint(columnIds, columnRefs, e.clientX, e.clientY));
    }
    function onPointerUp(e) {
      const state = dragRef.current;
      if (!state || e.pointerId !== state.pointerId) return;
      onDragOverFilterChange?.(false);
      finishDrag(e.clientX, e.clientY);
    }
    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [readOnly, columnIds, columns, processingUserKey, filterToolbarRef, onDragOverFilterChange]);
  if (!boardData) return null;
  const transferBusy = !!processingUserKey;
  const removeBusy = transferBusy && !!removePending;
  const addBusy = !!addingRoleId;
  return /* @__PURE__ */ jsxs4(Box4, { ref: kanbanWrapRef, className: "paty-todos-kanban-wrap paty-permisos-kanban-wrap", sx: { flex: 1, minHeight: 0, height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", p: 0 }, children: [
    /* @__PURE__ */ jsxs4(Box4, { className: `paty-todos-kanban paty-permisos-kanban${draggingId ? " paty-todos-kanban--dragging" : ""}${selectedUserKey ? " paty-permisos-kanban--user-selected" : ""}${processingUserKey ? " paty-permisos-kanban--user-busy" : ""}`, sx: { flex: 1, minHeight: 0, height: "100%", display: "flex", alignItems: "stretch", alignSelf: "stretch", position: "relative" }, children: [
      dragGhost ? /* @__PURE__ */ jsx7(DragGhost, { card: ghostCard, column: ghostColumn, x: dragGhost.x, y: dragGhost.y, width: dragGhost.width }) : null,
      noUsersVisible ? /* @__PURE__ */ jsx7(Box4, { sx: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", p: 3, pointerEvents: "none", zIndex: 2 }, children: /* @__PURE__ */ jsx7(Typography4, { variant: "body2", color: "text.secondary", children: "Ning\xFAn usuario coincide con los filtros." }) }) : null,
      columns.map((col) => {
        const isOver = draggingId && !String(draggingId).startsWith("col:") && dragOverCol === col.id;
        const isSource = draggingId && !String(draggingId).startsWith("col:") && dragSourceCol === col.id;
        const colClass = [
          "paty-todos-column",
          "paty-permisos-column",
          col.roleFilteredOut ? "paty-permisos-column--role-filtered" : "",
          isOver ? "paty-permisos-column--drag-over" : "",
          isSource && !isOver ? "paty-permisos-column--drag-source" : "",
          draggingId && !String(draggingId).startsWith("col:") && !isOver ? "paty-permisos-column--drag-idle" : ""
        ].filter(Boolean).join(" ");
        return /* @__PURE__ */ jsxs4(Box4, { ref: (el) => {
          columnRefs.current[col.id] = el;
        }, className: colClass, style: { "--col-accent": col.accent }, children: [
          /* @__PURE__ */ jsxs4(
            Stack2,
            {
              direction: "row",
              alignItems: "center",
              justifyContent: "space-between",
              spacing: 1,
              className: "paty-todos-column__head paty-permisos-column__head--filter-draggable",
              sx: { flexShrink: 0, px: 1.75, py: 1.25, pb: 1, cursor: "grab" },
              onPointerDown: (e) => handleColumnHeadDragStart(col, e),
              children: [
                /* @__PURE__ */ jsxs4(Stack2, { direction: "row", alignItems: "center", spacing: 0.75, className: "paty-todos-column__title", sx: { minWidth: 0, flex: 1 }, children: [
                  /* @__PURE__ */ jsx7(Icon2, { icon: col.icon, size: 16 }),
                  /* @__PURE__ */ jsxs4(Box4, { sx: { minWidth: 0 }, children: [
                    /* @__PURE__ */ jsxs4(Stack2, { direction: "row", alignItems: "baseline", spacing: 0.75, sx: { minWidth: 0 }, children: [
                      /* @__PURE__ */ jsx7(Box4, { component: "span", sx: { display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 700 }, title: col.title, children: col.title }),
                      col.jerarquiaLabel ? /* @__PURE__ */ jsx7(Typography4, { component: "span", variant: "caption", color: "text.secondary", sx: { fontFamily: "monospace", flexShrink: 0 }, title: `Jerarqu\xEDa ${col.jerarquia}`, children: col.jerarquiaLabel }) : null
                    ] }),
                    col.descripcion ? /* @__PURE__ */ jsx7(Typography4, { variant: "caption", color: "text.secondary", sx: { display: "block", lineHeight: 1.3, mt: 0.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, title: col.descripcion, children: col.descripcion }) : null
                  ] })
                ] }),
                /* @__PURE__ */ jsxs4(Stack2, { direction: "row", alignItems: "center", spacing: 0.5, sx: { flexShrink: 0 }, children: [
                  canManage ? /* @__PURE__ */ jsx7(Tooltip2, { title: addBusy && addingRoleId === col.id ? "Agregando\u2026" : "Agregar usuario", children: /* @__PURE__ */ jsx7("span", { className: "paty-permisos-column__add-wrap", children: /* @__PURE__ */ jsx7(
                    IconButton,
                    {
                      size: "small",
                      className: "paty-permisos-column__add",
                      disabled: addBusy,
                      "aria-label": `Agregar usuario a ${col.title || col.id}`,
                      onClick: () => {
                        if (addBusy) return;
                        setAddPending({
                          role: col.id,
                          roleTitle: col.title,
                          existingUsernames: new Set(col.users.map((u) => u.username))
                        });
                      },
                      children: addBusy && addingRoleId === col.id ? /* @__PURE__ */ jsx7(CircularProgress2, { size: 14, thickness: 5 }) : /* @__PURE__ */ jsx7(Icon2, { icon: "mdi:plus", size: 16 })
                    }
                  ) }) }) : /* @__PURE__ */ jsx7(Box4, { component: "span", className: "paty-todos-column__count", sx: { display: "inline-flex", alignItems: "center", justifyContent: "center", lineHeight: 1, height: 22, minWidth: 22, px: 1, boxSizing: "border-box" }, children: col.users.length }),
                  canManage ? /* @__PURE__ */ jsx7(Box4, { component: "span", className: "paty-todos-column__count", sx: { display: "inline-flex", alignItems: "center", justifyContent: "center", lineHeight: 1, height: 22, minWidth: 22, px: 1, boxSizing: "border-box" }, title: `${col.users.length} usuario${col.users.length === 1 ? "" : "s"}`, children: col.users.length }) : null
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxs4(
            Stack2,
            {
              ref: (el) => {
                listRefs.current[col.id] = el;
              },
              "data-column-id": col.id,
              spacing: 0.75,
              className: `paty-todos-column__list${isOver ? " paty-todos-column__list--drag-over" : ""}`,
              sx: { flex: 1, minHeight: 0, overflowY: "auto", p: 1.25, px: 1.5, boxSizing: "border-box" },
              children: [
                col.users.map((card) => {
                  const cardUserKey = userKey(card.username);
                  const userBusy = !!processingUserKey && processingUserKey === cardUserKey;
                  const isSelected = selectedUserKey === cardUserKey;
                  const isDimmed = !!selectedUserKey && !isSelected;
                  return /* @__PURE__ */ jsx7(
                    UserCard,
                    {
                      card,
                      columnId: col.id,
                      columnTitle: col.title,
                      readOnly,
                      isDragSource: draggingId === card.id,
                      userBusy,
                      isSelected,
                      isDimmed,
                      onPointerDragStart: handlePointerDragStart,
                      onRoleRemoveRequest: setRemovePending,
                      onUserSelect: handleUserSelect,
                      suppressClickRef
                    },
                    card.id
                  );
                }),
                !col.users.length ? /* @__PURE__ */ jsx7(Typography4, { variant: "caption", color: "text.secondary", sx: { px: 0.5, py: 1 }, children: "Sin usuarios" }) : null
              ]
            }
          )
        ] }, col.id);
      })
    ] }),
    typeof document !== "undefined" ? createPortal(/* @__PURE__ */ jsxs4(Fragment3, { children: [
      /* @__PURE__ */ jsx7(
        RoleDragDialog,
        {
          open: !!dragPending,
          pending: dragPending,
          busy: transferBusy,
          onClose: () => {
            if (!transferBusy) setDragPending(null);
          },
          onConfirm: handleDragConfirm
        }
      ),
      /* @__PURE__ */ jsx7(
        RoleRemoveDialog,
        {
          open: !!removePending,
          pending: removePending,
          busy: removeBusy,
          onClose: () => {
            if (!removeBusy) setRemovePending(null);
          },
          onConfirm: handleRemoveConfirm
        }
      ),
      /* @__PURE__ */ jsx7(
        RoleAddDialog,
        {
          open: !!addPending,
          pending: addPending,
          busy: addBusy,
          onClose: () => {
            if (!addBusy) setAddPending(null);
          },
          onConfirm: handleAddConfirm
        }
      )
    ] }), document.body) : null
  ] });
}

// ../Personal/apps/isa-patyia/frontend/js/tools/PermisosRoleFilterAutocomplete.jsx
import { jsx as jsx8 } from "react/jsx-runtime";
var { Autocomplete: Autocomplete2, TextField: TextField3, Chip: Chip3 } = getMaterialUI();
function PermisosRoleFilterAutocomplete({ options, value, onChange, disabled = false }) {
  const selected = options.filter((o) => value.includes(o.id));
  return /* @__PURE__ */ jsx8(
    Autocomplete2,
    {
      multiple: true,
      size: "small",
      disabled,
      className: "config-permisos-toolbar__field config-permisos-toolbar__field--role",
      options,
      value: selected,
      onChange: (_, next) => onChange(next.map((o) => o.id)),
      getOptionLabel: (o) => o.label,
      isOptionEqualToValue: (a, b) => a.id === b.id,
      disableCloseOnSelect: true,
      limitTags: 2,
      renderTags: (tagValue, getTagProps) => tagValue.map((option, index) => {
        const { key, ...chipProps } = getTagProps({ index });
        return /* @__PURE__ */ jsx8(Chip3, { ...chipProps, label: option.label, size: "small", className: "isa-neon-glass-chip" }, key);
      }),
      renderInput: (params) => /* @__PURE__ */ jsx8(TextField3, { ...params, label: "Roles", placeholder: selected.length ? "" : "Todos" })
    }
  );
}

// ../Personal/apps/isa-patyia/frontend/js/tools/roleHierarchyTree/treeRow.tsx
import { jsx as jsx9, jsxs as jsxs5 } from "react/jsx-runtime";
var { Icon: Icon3 } = UI;
var { Box: Box5, Stack: Stack3, Typography: Typography5, IconButton: IconButton2, Tooltip: Tooltip3 } = getMaterialUI();
function TreeRowView(props) {
  const {
    row,
    isCollapsed,
    isDragOver,
    isDragSource,
    canMutate,
    isSelected,
    childCount,
    onToggleCollapse,
    onSelect,
    onEdit,
    onDelete,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    onDrillDown
  } = props;
  const accent = row.jerarquia.startsWith("0.") || row.jerarquia === "0" ? "#10b981" : "#a855f7";
  const indent = row.depth * 18;
  const className = [
    "role-tree-row",
    isDragOver ? "role-tree-row--drag-over" : "",
    isDragSource ? "role-tree-row--drag-source" : "",
    isSelected ? "role-tree-row--selected" : ""
  ].filter(Boolean).join(" ");
  const handlePointerDown = (e) => {
    onDragStart(e);
  };
  const handlePointerOver = (e) => {
    onDragOver(e);
  };
  const handlePointerUp = (e) => {
    onDrop(e);
  };
  const handlePointerLeave = (e) => {
    onDragEnd(e);
  };
  return /* @__PURE__ */ jsxs5(
    Box5,
    {
      role: "treeitem",
      "aria-level": row.depth + 1,
      "aria-expanded": row.hasChildren ? !isCollapsed : void 0,
      "data-jerarquia": row.jerarquia,
      draggable: canMutate,
      onPointerDown: handlePointerDown,
      onPointerOver: handlePointerOver,
      onPointerUp: handlePointerUp,
      onPointerLeave: handlePointerLeave,
      className,
      sx: {
        display: "flex",
        alignItems: "center",
        gap: 1,
        pl: `${indent + 8}px`,
        pr: 1,
        py: 0.5,
        borderLeft: `3px solid ${accent}`,
        backgroundColor: isDragOver ? "action.hover" : isSelected ? "action.selected" : "transparent",
        cursor: canMutate ? "grab" : "default",
        userSelect: "none"
      },
      onClick: onSelect,
      children: [
        /* @__PURE__ */ jsx9(Tooltip3, { title: row.hasChildren ? isCollapsed ? "Expandir" : "Colapsar" : "", children: /* @__PURE__ */ jsx9("span", { children: /* @__PURE__ */ jsx9(
          IconButton2,
          {
            size: "small",
            onClick: (e) => {
              e.stopPropagation();
              onToggleCollapse();
            },
            disabled: !row.hasChildren,
            "aria-label": isCollapsed ? "Expandir" : "Colapsar",
            children: /* @__PURE__ */ jsx9("iconify-icon", { icon: row.hasChildren ? isCollapsed ? "mdi:chevron-right" : "mdi:chevron-down" : "mdi:circle-small", width: "16", height: "16" })
          }
        ) }) }),
        /* @__PURE__ */ jsxs5(Stack3, { direction: "row", alignItems: "center", spacing: 1, sx: { flex: 1, minWidth: 0 }, children: [
          /* @__PURE__ */ jsx9("iconify-icon", { icon: "mdi:shield-account-outline", width: "16", height: "16" }),
          /* @__PURE__ */ jsxs5(Box5, { sx: { minWidth: 0 }, children: [
            /* @__PURE__ */ jsx9(Typography5, { variant: "body2", fontWeight: 600, noWrap: true, title: row.namedisplay ?? row.iusuario, children: row.namedisplay ?? row.iusuario }),
            /* @__PURE__ */ jsx9(Typography5, { variant: "caption", color: "text.secondary", sx: { display: "block", fontFamily: "monospace" }, title: `Jerarqu\xEDa ${row.jerarquia}`, children: row.jerarquia })
          ] })
        ] }),
        row.hasChildren ? /* @__PURE__ */ jsxs5(Typography5, { variant: "caption", color: "text.secondary", sx: { flexShrink: 0 }, children: [
          childCount,
          " hijo",
          childCount !== 1 ? "s" : ""
        ] }) : null,
        canMutate ? /* @__PURE__ */ jsxs5(Stack3, { direction: "row", spacing: 0.5, sx: { flexShrink: 0 }, children: [
          onDrillDown ? /* @__PURE__ */ jsx9(Tooltip3, { title: "Editar permisos de este nodo", children: /* @__PURE__ */ jsx9(IconButton2, { size: "small", "aria-label": "Editar permisos", onClick: (e) => {
            e.stopPropagation();
            onDrillDown();
          }, children: /* @__PURE__ */ jsx9("iconify-icon", { icon: "mdi:pencil-box-outline", width: "16", height: "16" }) }) }) : null,
          /* @__PURE__ */ jsx9(Tooltip3, { title: "Mover de jerarqu\xEDa", children: /* @__PURE__ */ jsx9(IconButton2, { size: "small", "aria-label": "Mover", onClick: (e) => {
            e.stopPropagation();
            onEdit();
          }, children: /* @__PURE__ */ jsx9("iconify-icon", { icon: "mdi:arrow-up-down-bold", width: "16", height: "16" }) }) }),
          /* @__PURE__ */ jsx9(Tooltip3, { title: "Eliminar rol", children: /* @__PURE__ */ jsx9(IconButton2, { size: "small", "aria-label": "Eliminar", onClick: (e) => {
            e.stopPropagation();
            onDelete();
          }, children: /* @__PURE__ */ jsx9("iconify-icon", { icon: "mdi:trash-can-outline", width: "16", height: "16" }) }) })
        ] }) : null
      ]
    }
  );
}

// ../Personal/apps/isa-patyia/frontend/js/tools/roleHierarchyTree/treeLogic.ts
function buildTreeRows(nodes) {
  const byJerarquia = /* @__PURE__ */ new Map();
  const childrenOf = /* @__PURE__ */ new Map();
  for (const n of nodes) {
    byJerarquia.set(n.jerarquia, {
      ...n,
      flatPath: n.jerarquia,
      pathInit: n.jerarquia,
      hasChildren: false,
      isCollapsed: false,
      depth: 0,
      isSelected: false
    });
  }
  for (const [jer] of byJerarquia) {
    const ancestors = ancestorsFromPath(jer);
    for (let i = 1; i < ancestors.length; i++) {
      const parentJer = ancestors[i];
      if (!byJerarquia.has(parentJer)) continue;
      if (!childrenOf.has(parentJer)) childrenOf.set(parentJer, []);
      if (!childrenOf.get(parentJer).includes(jer)) {
        childrenOf.get(parentJer).push(jer);
      }
    }
  }
  const visited = /* @__PURE__ */ new Set();
  const computeDepth = (jer, depth) => {
    if (visited.has(jer)) return;
    visited.add(jer);
    const row = byJerarquia.get(jer);
    if (!row) return;
    row.depth = depth;
    const kids = childrenOf.get(jer) ?? [];
    row.hasChildren = kids.length > 0;
    for (const kid of kids) {
      computeDepth(kid, depth + 1);
    }
  };
  for (const n of nodes) {
    if (!visited.has(n.jerarquia)) {
      computeDepth(n.jerarquia, 0);
    }
  }
  return Array.from(byJerarquia.values());
}
function flattenForRender(rows, collapsed) {
  const out = [];
  const byJerarquia = new Map(rows.map((r) => [r.jerarquia, r]));
  const childrenOf = /* @__PURE__ */ new Map();
  for (const jer of byJerarquia.keys()) {
    const ancestors = ancestorsFromPath(jer);
    for (let i = 1; i < ancestors.length; i++) {
      const parentJer = ancestors[i];
      if (!childrenOf.has(parentJer)) childrenOf.set(parentJer, []);
      if (!childrenOf.get(parentJer).includes(jer)) {
        childrenOf.get(parentJer).push(jer);
      }
    }
  }
  const walk = (jer) => {
    const row = byJerarquia.get(jer);
    if (!row) return;
    out.push(row);
    if (collapsed.has(jer)) return;
    const kids = (childrenOf.get(jer) ?? []).slice().sort();
    for (const kid of kids) walk(kid);
  };
  const hasParent = (jer) => {
    const ancestors = ancestorsFromPath(jer);
    return ancestors.length > 1 && byJerarquia.has(ancestors[1]);
  };
  const roots = rows.filter((r) => !hasParent(r.jerarquia)).map((r) => r.jerarquia).sort();
  for (const r of roots) walk(r);
  return out;
}
function wouldCycle(jer, newParentJer, allNodes) {
  if (jer === newParentJer) return true;
  const byJer = new Map(allNodes.map((n) => [n.jerarquia, n]));
  const visited = /* @__PURE__ */ new Set();
  const walk = (j) => {
    if (visited.has(j)) return false;
    visited.add(j);
    const node = byJer.get(j);
    if (!node) return false;
    for (const childJer of ancestorsFromPath(j).slice(1)) {
      if (childJer === jer) return true;
      if (walk(childJer)) return true;
    }
    return false;
  };
  return walk(newParentJer);
}

// ../Personal/apps/isa-patyia/frontend/js/tools/roleHierarchyTree/RolePermissionsEditor.tsx
import { Fragment as Fragment4, jsx as jsx10, jsxs as jsxs6 } from "react/jsx-runtime";
var { useState: useState6, useMemo: useMemo4, useCallback: useCallback2, useEffect: useEffect6 } = getReact();
var { Box: Box6, Stack: Stack4, Typography: Typography6, Breadcrumbs, Link, Chip: Chip4, IconButton: IconButton3, Tooltip: Tooltip4, Button: Button2, TextField: TextField4, Alert: Alert2, CircularProgress: CircularProgress3 } = getMaterialUI();
var { Icon: Icon4 } = UI;
function RolePermissionsEditor(props) {
  const { currentNode, allNodes, busy, onSaveLocal, onPromote, onClose } = props;
  const byJer = useMemo4(
    () => new Map(allNodes.map((n) => [n.jerarquia, n])),
    [allNodes]
  );
  const pathAncestors = useMemo4(
    () => ancestorsFromPath(currentNode.jerarquia).slice(1),
    [currentNode.jerarquia]
  );
  const [resolved, setResolved] = useState6([]);
  const [loading, setLoading] = useState6(true);
  const [editingKey, setEditingKey] = useState6(null);
  const [editingValue, setEditingValue] = useState6("");
  useEffect6(() => {
    let cancelled = false;
    (() => {
      setLoading(true);
      const merged = {};
      const orderedJers = [...pathAncestors].reverse().concat([currentNode.jerarquia]);
      for (const ancJer of orderedJers) {
        const node = byJer.get(ancJer);
        if (!node) continue;
        for (const [k, v] of Object.entries(node.permisos ?? {})) {
          if (k.startsWith(":")) continue;
          if (k === "*" || k === "impersonate" || k === "manage_permissions" || k === "manage_sampling") {
            if (v === true) merged[k] = { value: true, owner: ancJer };
            continue;
          }
          merged[k] = { value: v, owner: ancJer };
        }
      }
      if (cancelled) return;
      const out = Object.entries(merged).map(([k, { value, owner }]) => ({
        key: k,
        value,
        ownerJerarquia: owner,
        isLocal: owner === currentNode.jerarquia,
        isInherited: owner !== currentNode.jerarquia
      }));
      out.sort((a, b) => {
        if (a.isInherited !== b.isInherited) return a.isInherited ? -1 : 1;
        return a.key.localeCompare(b.key);
      });
      setResolved(out);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [currentNode.jerarquia, pathAncestors, byJer]);
  const handlePromote = useCallback2(async (perm, targetJer) => {
    try {
      await onPromote(perm.key, perm.value, perm.ownerJerarquia, targetJer);
      toastSuccess?.(`${perm.key} promovido a ${targetJer}`);
    } catch (e) {
      toastError?.(String(e));
    }
  }, [onPromote]);
  const startEdit = useCallback2((perm) => {
    setEditingKey(perm.key);
    setEditingValue(typeof perm.value === "string" ? perm.value : JSON.stringify(perm.value));
  }, []);
  const saveEdit = useCallback2(async () => {
    if (!editingKey) return;
    let value = editingValue;
    if (typeof value === "string" && (value.trim().startsWith("{") || value.trim().startsWith("["))) {
      try {
        value = JSON.parse(value);
      } catch {
      }
    }
    try {
      await onSaveLocal(editingKey, value);
      setEditingKey(null);
      toastSuccess?.(`${editingKey} guardado`);
    } catch (e) {
      toastError?.(String(e));
    }
  }, [editingKey, editingValue, onSaveLocal]);
  return /* @__PURE__ */ jsxs6(Box6, { className: "role-permissions-editor", sx: { display: "flex", flexDirection: "column", gap: 1.5, p: 2 }, children: [
    /* @__PURE__ */ jsxs6(Breadcrumbs, { separator: "\u203A", sx: { fontSize: 13 }, children: [
      /* @__PURE__ */ jsx10(Link, { underline: "hover", color: "inherit", children: pathAncestors[0] ?? "?" }),
      pathAncestors.slice(1).map((j, i) => /* @__PURE__ */ jsx10(Link, { underline: "hover", color: "inherit", children: j }, j)),
      /* @__PURE__ */ jsx10(Typography6, { color: "text.primary", fontWeight: 700, children: currentNode.jerarquia })
    ] }),
    /* @__PURE__ */ jsxs6(Stack4, { direction: "row", alignItems: "center", spacing: 1, children: [
      /* @__PURE__ */ jsx10(Typography6, { variant: "h6", sx: { flex: 1 }, children: currentNode.namedisplay ?? currentNode.iusuario }),
      /* @__PURE__ */ jsx10(Chip4, { size: "small", label: currentNode.jerarquia }),
      /* @__PURE__ */ jsx10(Button2, { onClick: onClose, size: "small", sx: { textTransform: "none" }, children: "Cerrar" })
    ] }),
    currentNode.descripcion ? /* @__PURE__ */ jsx10(Typography6, { variant: "body2", color: "text.secondary", children: currentNode.descripcion }) : null,
    /* @__PURE__ */ jsx10(Typography6, { variant: "subtitle2", children: "Permisos efectivos" }),
    loading ? /* @__PURE__ */ jsx10(CircularProgress3, { size: 20 }) : /* @__PURE__ */ jsxs6(Stack4, { spacing: 0.5, children: [
      resolved.length === 0 ? /* @__PURE__ */ jsx10(Typography6, { variant: "body2", color: "text.secondary", sx: { p: 1 }, children: "Sin permisos." }) : null,
      resolved.map((perm) => /* @__PURE__ */ jsxs6(Box6, { sx: {
        p: 1,
        border: 1,
        borderColor: perm.isInherited ? "warning.light" : "divider",
        borderRadius: 1,
        backgroundColor: perm.isInherited ? "warning.50" : "transparent",
        opacity: perm.isInherited ? 0.85 : 1
      }, children: [
        /* @__PURE__ */ jsxs6(Stack4, { direction: "row", alignItems: "center", spacing: 1, children: [
          /* @__PURE__ */ jsxs6(Box6, { sx: { flex: 1, minWidth: 0 }, children: [
            /* @__PURE__ */ jsx10(Typography6, { variant: "body2", fontFamily: "monospace", noWrap: true, title: perm.key, children: perm.key }),
            /* @__PURE__ */ jsx10(Typography6, { variant: "caption", color: "text.secondary", sx: { display: "block" }, title: JSON.stringify(perm.value), children: JSON.stringify(perm.value).slice(0, 100) })
          ] }),
          perm.isInherited ? /* @__PURE__ */ jsxs6(Stack4, { direction: "row", alignItems: "center", spacing: 0.5, children: [
            /* @__PURE__ */ jsx10(Tooltip4, { title: `Viene de ${perm.ownerJerarquia} (no editable aqu\xED)`, children: /* @__PURE__ */ jsx10(Chip4, { size: "small", color: "warning", label: `\u{1F512} ${perm.ownerJerarquia}` }) }),
            /* @__PURE__ */ jsx10(Tooltip4, { title: `Promover a ${perm.ownerJerarquia} para poder editarlo all\xED`, children: /* @__PURE__ */ jsx10(
              Button2,
              {
                size: "small",
                startIcon: /* @__PURE__ */ jsx10("iconify-icon", { icon: "mdi:arrow-up-bold", width: "14", height: "14" }),
                onClick: () => handlePromote(perm, perm.ownerJerarquia),
                disabled: busy,
                sx: { textTransform: "none" },
                children: "Subir a la herencia"
              }
            ) })
          ] }) : /* @__PURE__ */ jsxs6(Stack4, { direction: "row", alignItems: "center", spacing: 0.5, children: [
            /* @__PURE__ */ jsx10(Chip4, { size: "small", color: "primary", label: "local" }),
            editingKey === perm.key ? /* @__PURE__ */ jsxs6(Fragment4, { children: [
              /* @__PURE__ */ jsx10(Button2, { size: "small", onClick: saveEdit, disabled: busy, children: "Guardar" }),
              /* @__PURE__ */ jsx10(Button2, { size: "small", onClick: () => setEditingKey(null), children: "Cancelar" })
            ] }) : /* @__PURE__ */ jsx10(Tooltip4, { title: "Editar valor", children: /* @__PURE__ */ jsx10(IconButton3, { size: "small", onClick: () => startEdit(perm), disabled: busy, "aria-label": "Editar", children: /* @__PURE__ */ jsx10("iconify-icon", { icon: "mdi:pencil", width: "16", height: "16" }) }) })
          ] })
        ] }),
        editingKey === perm.key ? /* @__PURE__ */ jsx10(
          TextField4,
          {
            fullWidth: true,
            multiline: true,
            minRows: 2,
            value: editingValue,
            onChange: (e) => setEditingValue(e.target.value),
            sx: { mt: 1 },
            size: "small"
          }
        ) : null,
        perm.isInherited ? /* @__PURE__ */ jsxs6(Alert2, { severity: "warning", sx: { mt: 0.5, py: 0 }, icon: /* @__PURE__ */ jsx10("iconify-icon", { icon: "mdi:lock-outline", width: "16", height: "16" }), children: [
          "Setear en la herencia: ",
          perm.ownerJerarquia
        ] }) : null
      ] }, perm.key))
    ] })
  ] });
}

// ../Personal/apps/isa-patyia/frontend/js/tools/roleHierarchyTree/RoleHierarchyView.tsx
import { jsx as jsx11, jsxs as jsxs7 } from "react/jsx-runtime";
var { useState: useState7, useMemo: useMemo5, useCallback: useCallback3 } = getReact();
var { Box: Box7, Stack: Stack5, Typography: Typography7, IconButton: IconButton4, Tooltip: Tooltip5, Button: Button3, Dialog, DialogTitle, DialogContent: DialogContent3, DialogActions: DialogActions2, TextField: TextField5, Alert: Alert3, CircularProgress: CircularProgress4, Chip: Chip5 } = getMaterialUI();
var { Icon: Icon5 } = UI;
function RoleHierarchyView(props) {
  const { nodes, canMutate, busy, onSave, onSaveLocalPerm, onPromote, onCreate, onDelete } = props;
  const [collapsed, setCollapsed] = useState7(/* @__PURE__ */ new Set());
  const [selectedJer, setSelectedJer] = useState7(null);
  const [editTarget, setEditTarget] = useState7(null);
  const [dragOverJer, setDragOverJer] = useState7(null);
  const [dragSourceJer, setDragSourceJer] = useState7(null);
  const [breadcrumb, setBreadcrumb] = useState7([]);
  const rows = useMemo5(() => buildTreeRows(nodes), [nodes]);
  const visibleRows = useMemo5(() => flattenForRender(rows, collapsed), [rows, collapsed]);
  const currentEditJer = breadcrumb.length > 0 ? breadcrumb[breadcrumb.length - 1] : selectedJer;
  const currentEditNode = useMemo5(
    () => currentEditJer ? nodes.find((n) => n.jerarquia === currentEditJer) ?? null : null,
    [currentEditJer, nodes]
  );
  const byJer = useMemo5(
    () => new Map(nodes.map((n) => [n.jerarquia, n])),
    [nodes]
  );
  const childCountOf = useMemo5(() => {
    const map = /* @__PURE__ */ new Map();
    for (const r of rows) {
      const ancestors = ancestorsFromPath(r.jerarquia).slice(1);
      for (const p of ancestors) {
        if (byJer.has(p)) map.set(p, (map.get(p) ?? 0) + 1);
      }
    }
    return map;
  }, [rows, byJer]);
  const toggleCollapse = useCallback3((jer) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(jer)) next.delete(jer);
      else next.add(jer);
      return next;
    });
  }, []);
  const collapseAll = useCallback3(() => {
    setCollapsed(new Set(rows.filter((r) => r.hasChildren).map((r) => r.jerarquia)));
  }, [rows]);
  const expandAll = useCallback3(() => setCollapsed(/* @__PURE__ */ new Set()), []);
  const handleDragStart = useCallback3((row) => (e) => {
    if (!canMutate) return;
    setDragSourceJer(row.jerarquia);
    const target = e.currentTarget;
    if (target.setPointerCapture && e.pointerId !== void 0) {
      try {
        target.setPointerCapture(e.pointerId);
      } catch {
      }
    }
  }, [canMutate]);
  const handleDragOver = useCallback3((row) => (e) => {
    if (!canMutate || !dragSourceJer) return;
    if (row.jerarquia === dragSourceJer) return;
    e.preventDefault();
    setDragOverJer(row.jerarquia);
  }, [canMutate, dragSourceJer]);
  const handleDrop = useCallback3((targetRow) => async (e) => {
    e.preventDefault();
    if (!canMutate || !dragSourceJer || dragSourceJer === targetRow.jerarquia) {
      setDragSourceJer(null);
      setDragOverJer(null);
      return;
    }
    if (wouldCycle(dragSourceJer, targetRow.jerarquia, nodes)) {
      toastInfo?.(`No se puede mover: crear\xEDa un ciclo en la cadena de padres`);
      setDragSourceJer(null);
      setDragOverJer(null);
      return;
    }
    try {
      const sourceRow = rows.find((r) => r.jerarquia === dragSourceJer);
      if (!sourceRow) return;
      let suffix = 1;
      while (byJer.has(`${targetRow.jerarquia}.${suffix}`)) suffix++;
      const finalJer = `${targetRow.jerarquia}.${suffix}`;
      await onSave(sourceRow.iusuario, finalJer);
    } catch (err) {
      toastError?.(`Error al reparentar: ${err?.message ?? err}`);
    } finally {
      setDragSourceJer(null);
      setDragOverJer(null);
    }
  }, [canMutate, dragSourceJer, nodes, onSave, byJer, rows]);
  const handleDragEnd = useCallback3(() => {
    setDragSourceJer(null);
    setDragOverJer(null);
  }, []);
  const navigateTo = useCallback3((jer) => {
    setSelectedJer(jer);
    setBreadcrumb([]);
  }, []);
  const drillDown = useCallback3((jer) => {
    setBreadcrumb((prev) => [...prev, jer]);
  }, []);
  const drillUp = useCallback3(() => {
    setBreadcrumb((prev) => prev.slice(0, -1));
  }, []);
  const onDeleteRow = useCallback3(async (name) => {
    if (confirm(`\xBFEliminar rol "${name}"?`)) {
      try {
        await onDelete(name);
      } catch (e) {
        toastError?.(String(e));
      }
    }
  }, [onDelete]);
  const openCreateDialog = useCallback3(() => {
    setEditTarget({
      jerarquia: "__new__",
      iusuario: "",
      namedisplay: null,
      descripcion: null,
      flatPath: "__new__",
      pathInit: "__new__",
      hasChildren: false,
      isCollapsed: false,
      depth: 0,
      isSelected: false
    });
  }, []);
  const renderRow = (row) => {
    const isOver = !!dragOverJer && dragOverJer === row.jerarquia;
    const isSource = !!dragSourceJer && dragSourceJer === row.jerarquia;
    const rowProps = {
      row,
      isCollapsed: collapsed.has(row.jerarquia),
      isDragOver: isOver,
      isDragSource: isSource,
      canMutate: canMutate && !busy,
      isSelected: selectedJer === row.jerarquia,
      childCount: childCountOf.get(row.jerarquia) ?? 0,
      onToggleCollapse: () => toggleCollapse(row.jerarquia),
      onSelect: () => navigateTo(row.jerarquia),
      onEdit: () => setEditTarget(row),
      onDelete: () => onDeleteRow(row.iusuario),
      onDragStart: handleDragStart(row),
      onDragOver: handleDragOver(row),
      onDrop: handleDrop(row),
      onDragEnd: handleDragEnd,
      onDrillDown: row.hasChildren ? () => drillDown(row.jerarquia) : void 0
    };
    return /* @__PURE__ */ jsx11(TreeRowView, { ...rowProps }, row.jerarquia);
  };
  return /* @__PURE__ */ jsxs7(Box7, { className: "role-hierarchy-tree", sx: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }, children: [
    /* @__PURE__ */ jsxs7(Stack5, { direction: "row", alignItems: "center", spacing: 1, sx: { p: 1, borderBottom: 1, borderColor: "divider" }, children: [
      /* @__PURE__ */ jsx11(Typography7, { variant: "subtitle1", sx: { flex: 1 }, children: "Jerarqu\xEDa de roles" }),
      /* @__PURE__ */ jsx11(Chip5, { size: "small", label: `${rows.length} roles` }),
      /* @__PURE__ */ jsx11(Tooltip5, { title: "Expandir todo", children: /* @__PURE__ */ jsx11(IconButton4, { size: "small", onClick: expandAll, disabled: busy, children: /* @__PURE__ */ jsx11("iconify-icon", { icon: "mdi:unfold-more-horizontal", width: "18", height: "18" }) }) }),
      /* @__PURE__ */ jsx11(Tooltip5, { title: "Colapsar todo", children: /* @__PURE__ */ jsx11(IconButton4, { size: "small", onClick: collapseAll, disabled: busy, children: /* @__PURE__ */ jsx11("iconify-icon", { icon: "mdi:unfold-less-horizontal", width: "18", height: "18" }) }) }),
      canMutate ? /* @__PURE__ */ jsx11(
        Button3,
        {
          size: "small",
          variant: "contained",
          startIcon: /* @__PURE__ */ jsx11("iconify-icon", { icon: "mdi:plus", width: "16", height: "16" }),
          onClick: openCreateDialog,
          disabled: busy,
          children: "Nuevo rol"
        }
      ) : null
    ] }),
    busy ? /* @__PURE__ */ jsx11(Box7, { sx: { display: "flex", alignItems: "center", justifyContent: "center", p: 2 }, children: /* @__PURE__ */ jsx11(CircularProgress4, { size: 20 }) }) : null,
    /* @__PURE__ */ jsxs7(Box7, { sx: { flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }, children: [
      /* @__PURE__ */ jsx11(Box7, { role: "tree", sx: { width: 360, flexShrink: 0, overflowY: "auto", p: 1, borderRight: 1, borderColor: "divider" }, children: visibleRows.length === 0 ? /* @__PURE__ */ jsx11(Typography7, { variant: "body2", color: "text.secondary", sx: { p: 2 }, children: "Sin roles." }) : visibleRows.map(renderRow) }),
      /* @__PURE__ */ jsx11(Box7, { sx: { flex: 1, minWidth: 0, overflow: "auto" }, children: currentEditNode ? /* @__PURE__ */ jsx11(
        RolePermissionsEditor,
        {
          currentNode: currentEditNode,
          allNodes: nodes,
          busy,
          onSaveLocal: async (key, value) => onSaveLocalPerm(currentEditNode.jerarquia, key, value),
          onPromote,
          onClose: () => {
            setSelectedJer(null);
            setBreadcrumb([]);
          }
        }
      ) : /* @__PURE__ */ jsxs7(Box7, { sx: { p: 4, textAlign: "center", color: "text.secondary" }, children: [
        /* @__PURE__ */ jsx11("iconify-icon", { icon: "mdi:family-tree", width: "48", height: "48" }),
        /* @__PURE__ */ jsx11(Typography7, { variant: "body1", sx: { mt: 2 }, children: "Selecciona un rol del \xE1rbol para ver y editar sus permisos." }),
        !canMutate ? /* @__PURE__ */ jsx11(Typography7, { variant: "caption", color: "text.secondary", sx: { display: "block", mt: 1 }, children: "(Solo roles de branch 0 pueden editar la jerarqu\xEDa.)" }) : null
      ] }) })
    ] }),
    /* @__PURE__ */ jsx11(
      HierarchyEditDialog,
      {
        target: editTarget,
        existingNodes: nodes,
        busy,
        onClose: () => setEditTarget(null),
        onSave: async (name, jer) => {
          if (editTarget?.jerarquia === "__new__") {
            await onCreate(name, jer);
          } else if (editTarget) {
            await onSave(editTarget.iusuario, jer);
          }
          setEditTarget(null);
        }
      }
    )
  ] });
}
function HierarchyEditDialog({ target, existingNodes, busy, onClose, onSave }) {
  const isNew = target?.jerarquia === "__new__";
  const [name, setName] = useState7(target?.iusuario ?? "");
  const [jerarquia, setJerarquia] = useState7(target?.jerarquia === "__new__" ? "" : target?.jerarquia ?? "");
  const [err, setErr] = useState7("");
  if (!target) return null;
  const handleSubmit = async () => {
    setErr("");
    const trimmedName = String(name ?? "").trim();
    const trimmedJer = String(jerarquia ?? "").trim();
    if (!trimmedName) {
      setErr("nombre requerido");
      return;
    }
    if (!trimmedJer) {
      setErr("jerarqu\xEDa requerida");
      return;
    }
    if (!/^[0-9]+(\.[0-9]+)*$/.test(trimmedJer)) {
      setErr("jerarqu\xEDa inv\xE1lida (formato: 0, 0.0, 0.1.1)");
      return;
    }
    try {
      await onSave(trimmedName, trimmedJer);
    } catch (e) {
      setErr(e?.message ?? String(e));
    }
  };
  return /* @__PURE__ */ jsxs7(Dialog, { open: true, onClose, maxWidth: "sm", fullWidth: true, children: [
    /* @__PURE__ */ jsx11(DialogTitle, { children: isNew ? "Nuevo rol" : `Mover ${target.iusuario}` }),
    /* @__PURE__ */ jsx11(DialogContent3, { dividers: true, children: /* @__PURE__ */ jsxs7(Stack5, { spacing: 2, children: [
      err ? /* @__PURE__ */ jsx11(Alert3, { severity: "error", children: err }) : null,
      /* @__PURE__ */ jsx11(TextField5, { label: "Nombre", value: name, onChange: (e) => setName(e.target.value), disabled: !isNew, helperText: "min\xFAsculas, sin espacios (ej. dev_lead)" }),
      /* @__PURE__ */ jsx11(TextField5, { label: "Nueva jerarqu\xEDa", value: jerarquia, onChange: (e) => setJerarquia(e.target.value), helperText: "dot-notation: 0, 0.0, 0.1.1, ..." }),
      /* @__PURE__ */ jsx11(Alert3, { severity: "info", children: "Los ancestros se derivan autom\xE1ticamente del path. Arrastra un rol sobre otro en el \xE1rbol para reubicarlo." })
    ] }) }),
    /* @__PURE__ */ jsxs7(DialogActions2, { children: [
      /* @__PURE__ */ jsx11(Button3, { onClick: onClose, disabled: busy, children: "Cancelar" }),
      /* @__PURE__ */ jsx11(Button3, { variant: "contained", onClick: handleSubmit, disabled: busy, children: busy ? /* @__PURE__ */ jsx11(CircularProgress4, { size: 16 }) : "Guardar" })
    ] })
  ] });
}

// ../Personal/apps/isa-patyia/frontend/js/tools/PermisosPanel.jsx
import { jsx as jsx12, jsxs as jsxs8 } from "react/jsx-runtime";
var { useState: useState8, useEffect: useEffect7, useCallback: useCallback4, useMemo: useMemo6, useRef: useRef3 } = getReact();
var { Typography: Typography8, TextField: TextField6, Stack: Stack6, Alert: Alert4, CircularProgress: CircularProgress5, Box: Box8, Chip: Chip6, DialogContent: DialogContent4, DialogActions: DialogActions3, Button: Button4 } = getMaterialUI();
function PermisosPanel({ onNeedLogin }) {
  const [loading, setLoading] = useState8(true);
  const [busy, setBusy] = useState8(false);
  const [canManage, setCanManage] = useState8(false);
  const [err, setErr] = useState8("");
  const [data, setData] = useState8({ roles: [], users: [] });
  const [userSearch, setUserSearch] = useState8("");
  const [roleFilters, setRoleFilters] = useState8([]);
  const [visitanteOpen, setVisitanteOpen] = useState8(false);
  const [filterBusy, setFilterBusy] = useState8(false);
  const [dragOverFilter, setDragOverFilter] = useState8(false);
  const [userDirectory, setUserDirectory] = useState8(null);
  const [actorJerarquia, setActorJerarquia] = useState8(null);
  const [hierarchyOpen, setHierarchyOpen] = useState8(false);
  const [hierarchyNodes, setHierarchyNodes] = useState8([]);
  const [hierarchyBusy, setHierarchyBusy] = useState8(false);
  const filterToolbarRef = useRef3(null);
  const filterFetchSkipRef = useRef3(true);
  const filterDropFetchRef = useRef3(false);
  const usersPaginated = !!data.usersTruncated;
  const applyFlags = useCallback4((result) => {
    setCanManage(!!result.canManage);
    const userRoles2 = Array.isArray(result.roles) ? result.roles : Array.isArray(Session?.roles) ? Session.roles : [];
    const rolePermisosIdx = buildRolePermisosIndex(data.roles);
    setActorJerarquia(actorJerarquiaFromRoles(userRoles2, rolePermisosIdx));
  }, [data]);
  const load = useCallback4(async () => {
    setLoading(true);
    setErr("");
    try {
      const result = await fetchPermisos();
      setData(result);
      applyFlags(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  }, [applyFlags]);
  const loadHierarchy = useCallback4(async () => {
    setHierarchyBusy(true);
    try {
      const r = await fetchHierarchy();
      setHierarchyNodes(r.roles ?? []);
    } catch (e) {
      toastError?.((e instanceof Error ? e.message : String(e)) ?? "Error cargando jerarqu\xEDa");
    } finally {
      setHierarchyBusy(false);
    }
  }, []);
  const openHierarchyDialog = useCallback4(() => {
    setHierarchyOpen(true);
    if (!hierarchyNodes.length) loadHierarchy();
  }, [hierarchyNodes.length, loadHierarchy]);
  const handleHierarchySave = useCallback4(async (name, jerarquia) => {
    setHierarchyBusy(true);
    try {
      await updateHierarchyRole(name, { jerarquia });
      await loadHierarchy();
      await load();
      toastSuccess?.(`Rol ${name} actualizado`);
    } finally {
      setHierarchyBusy(false);
    }
  }, [load]);
  const handleHierarchyCreate = useCallback4(async (name, jerarquia) => {
    setHierarchyBusy(true);
    try {
      await createHierarchyRole({ name, jerarquia });
      await loadHierarchy();
      await load();
      toastSuccess?.(`Rol ${name} creado`);
    } finally {
      setHierarchyBusy(false);
    }
  }, [load]);
  const handleHierarchyPromote = useCallback4(async (key, value, fromJer, toJer) => {
    setHierarchyBusy(true);
    try {
      throw new Error(`Promover permisos entre roles a\xFAn no soportado en backend (${fromJer} \u2192 ${toJer})`);
    } finally {
      setHierarchyBusy(false);
    }
  }, []);
  const handleHierarchyLocalPerm = useCallback4(async (nodeJer, key, value) => {
    setHierarchyBusy(true);
    try {
      throw new Error(`Edici\xF3n de permisos individuales a\xFAn no soportada en backend (${nodeJer}: ${key})`);
    } finally {
      setHierarchyBusy(false);
    }
  }, []);
  const handleHierarchyDelete = useCallback4(async (name) => {
    setHierarchyBusy(true);
    try {
      await deleteHierarchyRole(name);
      await loadHierarchy();
      await load();
      toastSuccess?.(`Rol ${name} eliminado`);
    } finally {
      setHierarchyBusy(false);
    }
  }, [load]);
  useEffect7(() => {
    load();
  }, [load]);
  const loadRef = useRef3(load);
  loadRef.current = load;
  const refreshUserDirectory = useCallback4(() => {
    if (!Session.isLoggedIn()) {
      setUserDirectory({});
      return;
    }
    searchScrumAppUsers("", 300).then((users) => {
      const map = {};
      for (const u of users) {
        const key = String(u.username ?? "").trim().toUpperCase();
        if (key) map[key] = u.displayName;
      }
      setUserDirectory(map);
    }).catch(() => setUserDirectory({}));
  }, []);
  useEffect7(() => {
    Assets.ensureTodosCss();
    refreshUserDirectory();
    const onAuth = () => {
      loadRef.current();
      refreshUserDirectory();
    };
    window.addEventListener(Session.EVENT, onAuth);
    window.addEventListener("isa-patyia:auth", onAuth);
    return () => {
      window.removeEventListener(Session.EVENT, onAuth);
      window.removeEventListener("isa-patyia:auth", onAuth);
    };
  }, [refreshUserDirectory]);
  async function run(fn, okMsg) {
    if (!requireAppSession(onNeedLogin)) return;
    setBusy(true);
    setErr("");
    try {
      const result = await fn();
      setData(result);
      applyFlags(result);
      if (okMsg) toastSuccess(okMsg);
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      toastError(msg);
      throw e;
    } finally {
      setBusy(false);
    }
  }
  const handleRoleRemove = useCallback4(async ({ username, role, roleTitle }) => {
    if (!requireAppSession(onNeedLogin)) throw new Error("Sesi\xF3n requerida");
    setErr("");
    try {
      const result = await removeUsuarioRole(username, role);
      setData(result);
      applyFlags(result);
      toastSuccess(`${username} quit\xF3 ${roleTitle || role}`);
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      toastError(msg);
      throw e;
    }
  }, [onNeedLogin, applyFlags]);
  const handleRoleAdd = useCallback4(async ({ username, role, roleTitle }) => {
    if (!requireAppSession(onNeedLogin)) throw new Error("Sesi\xF3n requerida");
    setErr("");
    try {
      const result = await addUsuarioRole(username, role);
      setData(result);
      applyFlags(result);
      toastSuccess(`${username} \u2192 ${roleTitle || role}`);
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      toastError(msg);
      throw e;
    }
  }, [onNeedLogin, applyFlags]);
  const handleRoleDrag = useCallback4(async ({ username, fromRole, toRole, mode }) => {
    if (!requireAppSession(onNeedLogin)) throw new Error("Sesi\xF3n requerida");
    setErr("");
    try {
      const result = await patchUsuarioRoles(username, { fromRole, toRole, mode });
      setData(result);
      applyFlags(result);
      toastSuccess(`${username} \u2192 ${toRole}`);
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      toastError(msg);
      throw e;
    }
  }, [onNeedLogin, applyFlags]);
  const fetchPermisosWithSearch = useCallback4(async (search) => {
    const q = String(search ?? "").trim();
    return fetchPermisos(q ? { search: q } : void 0);
  }, []);
  const handleUserFilterDrop = useCallback4(async (username) => {
    const q = String(username ?? "").trim();
    if (!q) return;
    setUserSearch(q);
    if (!usersPaginated) return;
    filterDropFetchRef.current = true;
    setFilterBusy(true);
    setErr("");
    try {
      const result = await fetchPermisosWithSearch(q);
      setData(result);
      applyFlags(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      toastError(msg);
    } finally {
      setFilterBusy(false);
    }
  }, [usersPaginated, fetchPermisosWithSearch, applyFlags]);
  const handleRoleFilterDrop = useCallback4((roleId) => {
    const id = String(roleId ?? "").trim().toLowerCase();
    if (!id) return;
    setRoleFilters((prev) => prev.includes(id) ? prev : [...prev, id]);
  }, []);
  const clearFilters = useCallback4(async () => {
    setUserSearch("");
    setRoleFilters([]);
    if (!usersPaginated) return;
    setFilterBusy(true);
    setErr("");
    try {
      const result = await fetchPermisos();
      setData(result);
      applyFlags(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      toastError(msg);
    } finally {
      setFilterBusy(false);
    }
  }, [usersPaginated, applyFlags]);
  useEffect7(() => {
    if (!usersPaginated) return void 0;
    if (filterFetchSkipRef.current) {
      filterFetchSkipRef.current = false;
      return void 0;
    }
    if (filterDropFetchRef.current) {
      filterDropFetchRef.current = false;
      return void 0;
    }
    const t = window.setTimeout(async () => {
      setFilterBusy(true);
      setErr("");
      try {
        const result = await fetchPermisosWithSearch(userSearch);
        setData(result);
        applyFlags(result);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setErr(msg);
        toastError(msg);
      } finally {
        setFilterBusy(false);
      }
    }, 320);
    return () => window.clearTimeout(t);
  }, [userSearch, usersPaginated, fetchPermisosWithSearch, applyFlags]);
  const roleOptions = useMemo6(
    () => (data.roles || []).map((r) => ({ id: roleNameFromEntry(r), label: roleTitleFromEntry(r) })).filter((r) => r.id && r.id !== VISITANTE),
    [data.roles]
  );
  const boardData = useMemo6(
    () => buildPermisosBoard(data, { userSearch, roleFilters, userDirectory }),
    [data, userSearch, roleFilters, userDirectory]
  );
  const visitanteColumn = useMemo6(() => buildVisitanteConfigColumn(data), [data]);
  const readOnly = !canManage;
  const managePermisos = canManage;
  const filtersActive = !!(userSearch.trim() || roleFilters.length);
  const { GlassToolbar } = getGlass();
  if (loading) {
    return /* @__PURE__ */ jsx12(Box8, { className: "config-permisos-loading", children: /* @__PURE__ */ jsx12(CircularProgress5, { size: 26 }) });
  }
  return /* @__PURE__ */ jsxs8(Box8, { className: "paty-permisos-shell", sx: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }, children: [
    /* @__PURE__ */ jsx12(Box8, { ref: filterToolbarRef, className: "config-permisos-toolbar-wrap", sx: { flexShrink: 0 }, children: /* @__PURE__ */ jsxs8(GlassToolbar, { className: `config-permisos-toolbar${dragOverFilter ? " config-permisos-toolbar--filter-drop" : ""}`, sx: { borderRadius: 0, mb: 0, flexShrink: 0, gap: 1, px: { xs: 1.5, sm: 2 }, py: 1 }, children: [
      /* @__PURE__ */ jsx12(
        TextField6,
        {
          size: "small",
          label: "Buscar usuario",
          placeholder: "Usuario",
          value: userSearch,
          onChange: (e) => setUserSearch(e.target.value),
          disabled: filterBusy,
          className: "config-permisos-toolbar__field config-permisos-toolbar__field--search"
        }
      ),
      /* @__PURE__ */ jsx12(PermisosRoleFilterAutocomplete, { options: roleOptions, value: roleFilters, onChange: setRoleFilters, disabled: filterBusy }),
      filtersActive ? /* @__PURE__ */ jsx12(
        Chip6,
        {
          size: "small",
          variant: "outlined",
          className: "isa-neon-glass-chip",
          label: "Filtros",
          onDelete: clearFilters,
          disabled: filterBusy
        }
      ) : null,
      /* @__PURE__ */ jsx12(Box8, { sx: { flex: 1, minWidth: 8 } }),
      /* @__PURE__ */ jsxs8(Stack6, { direction: "row", spacing: 0.5, alignItems: "center", className: "config-form-section__actions config-permisos-toolbar__actions", children: [
        /* @__PURE__ */ jsx12(ButtonIconify, { icon: "mdi:family-tree", title: "Editar jerarqu\xEDa de roles", onClick: openHierarchyDialog, disabled: busy || filterBusy }),
        managePermisos ? /* @__PURE__ */ jsx12(
          ButtonIconify,
          {
            icon: "mdi:account-outline",
            className: "config-permisos-visitante-btn",
            title: "Configurar rol visitante",
            onClick: () => setVisitanteOpen(true)
          }
        ) : null,
        /* @__PURE__ */ jsx12(ButtonIconify, { icon: "mdi:refresh", title: "Recargar", onClick: load, disabled: busy || filterBusy })
      ] })
    ] }) }),
    err ? /* @__PURE__ */ jsx12(Alert4, { severity: "warning", className: "config-form-alert config-permisos-alert", children: err }) : null,
    /* @__PURE__ */ jsx12(
      PermisosKanban,
      {
        boardData,
        readOnly,
        canManage: managePermisos,
        canEditRoleDescriptions: managePermisos,
        busy: busy || filterBusy,
        actorJerarquia,
        onJerarquiaToast: (t) => toastInfo?.(t.message) ?? alert(t.message),
        filterToolbarRef,
        onUserFilterDrop: handleUserFilterDrop,
        onRoleFilterDrop: handleRoleFilterDrop,
        onDragOverFilterChange: setDragOverFilter,
        onRoleSave: ({ name, permisos, bactivo }) => run(() => putPermisoRolePath(name, permisos, bactivo), `Rol ${name} guardado`),
        onRoleDrag: handleRoleDrag,
        onRoleRemove: handleRoleRemove,
        onRoleAdd: handleRoleAdd
      }
    ),
    managePermisos ? /* @__PURE__ */ jsx12(
      RoleConfigFullscreenDialog,
      {
        open: visitanteOpen,
        column: visitanteColumn,
        canManage: managePermisos,
        canEditRoleDescriptions: managePermisos,
        busy,
        onClose: () => setVisitanteOpen(false),
        onSave: ({ name, permisos, bactivo }) => run(() => putPermisoRolePath(name, permisos, bactivo), "Rol visitante guardado").then(() => setVisitanteOpen(false))
      }
    ) : null,
    /* @__PURE__ */ jsxs8(
      GlassDialog,
      {
        open: hierarchyOpen,
        onClose: () => setHierarchyOpen(false),
        maxWidth: "md",
        fullWidth: true,
        paperMaxWidth: 920,
        header: /* @__PURE__ */ jsx12(GlassDialogHeader, { icon: "mdi:family-tree", title: "Jerarqu\xEDa de roles", subtitle: "Solo roles de branch 0 pueden editar", accent: "#10b981", onClose: () => setHierarchyOpen(false) }),
        children: [
          /* @__PURE__ */ jsx12(DialogContent4, { dividers: true, sx: Object.assign({}, glassDialogContentSx({ p: 0 }), { height: "70vh" }), children: /* @__PURE__ */ jsx12(
            RoleHierarchyView,
            {
              nodes: hierarchyNodes,
              canMutate: isBranchZero(actorJerarquia ?? ""),
              busy: hierarchyBusy,
              onSave: handleHierarchySave,
              onCreate: handleHierarchyCreate,
              onDelete: handleHierarchyDelete,
              onSaveLocalPerm: handleHierarchyLocalPerm,
              onPromote: handleHierarchyPromote
            }
          ) }),
          /* @__PURE__ */ jsx12(DialogActions3, { sx: glassDialogActionsSx(), children: /* @__PURE__ */ jsx12(Button4, { onClick: () => setHierarchyOpen(false), sx: { textTransform: "none", fontWeight: 600 }, children: "Cerrar" }) })
        ]
      }
    )
  ] });
}
export {
  PermisosPanel
};
