// ../../Personal/apps/isa-patyia/frontend/js/core/patyia.ts
window.ISAFront.migrateLegacyGatewayKeys?.({ "jeff:gateway-local": "", "patyia-apptools:gateway-local": "", "patyia-apptools:lab-local": "" });
var PATYIA_BRIDGE_URL = "https://ayudascp-ia-staging.azurewebsites.net";
var PATYIA_ISS_LOCAL = "http://127.0.0.1:8802";
var PATYIA_BRIDGE_LOCAL = `${PATYIA_ISS_LOCAL}/api`;
var PATYIA_ISS_LOCAL_LS_KEY = "patyia-apptools:iss-local";
function isLocalMode() {
  try {
    return localStorage.getItem(PATYIA_ISS_LOCAL_LS_KEY) === "1";
  } catch {
    return false;
  }
}
function ensureIssLocalDefault() {
  try {
    if (localStorage.getItem(PATYIA_ISS_LOCAL_LS_KEY) != null) return;
    localStorage.setItem(PATYIA_ISS_LOCAL_LS_KEY, "0");
  } catch {
  }
}
function resolveIssApiBase() {
  const base = (isLocalMode() ? PATYIA_BRIDGE_LOCAL : PATYIA_BRIDGE_URL).replace(/\/$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
}

// ../../Personal/apps/isa-patyia/frontend/js/core/platform.ts
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
function getIsaSplitView() {
  const C = window.ISAFront?.Layout?.IsaSplitView;
  if (!C) {
    throw new Error("IsaSplitView no cargado \u2014 recargue sin cach\xE9 (Ctrl+Shift+R).");
  }
  return C;
}
function getGlass() {
  const g = window.ISAFront?.Glass;
  if (!g?.GlassCard) {
    throw new Error("ISAFront.Glass no cargado \u2014 recargue sin cach\xE9 (Ctrl+Shift+R).");
  }
  return g;
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

// ../../Personal/apps/isa-patyia/frontend/js/ui/ImageLightboxDialog.jsx
import { jsx } from "react/jsx-runtime";
var { useEffect, useState } = getReact();

// ../../Personal/apps/isa-patyia/frontend/js/ui/GlassDialog.jsx
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
  const { Box: Box10, Typography: Typography10, IconButton: IconButton5, Stack: Stack9 } = getMaterialUI();
  const { Icon: Icon4 } = UI;
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
  return /* @__PURE__ */ jsxs(Box10, { className: "isa-glass-dialog__header", sx: { position: "relative", flexShrink: 0 }, children: [
    /* @__PURE__ */ jsx2(Box10, { sx: bandSx, children: /* @__PURE__ */ jsxs(Stack9, { direction: "row", spacing: 1.25, alignItems: "center", sx: { pr: onClose ? 4 : 0 }, children: [
      /* @__PURE__ */ jsx2(Box10, { sx: iconSx, children: /* @__PURE__ */ jsx2(Icon4, { icon, size: 24 }) }),
      /* @__PURE__ */ jsxs(Box10, { sx: { flex: 1, minWidth: 0 }, children: [
        /* @__PURE__ */ jsx2(Typography10, { variant: "h5", component: "h2", sx: titleSx, children: title }),
        subtitle ? /* @__PURE__ */ jsx2(Typography10, { variant: "caption", color: "text.secondary", display: "block", sx: { mt: 0.35, lineHeight: 1.4 }, children: subtitle }) : null
      ] })
    ] }) }),
    onClose ? /* @__PURE__ */ jsx2(IconButton5, { size: "small", onClick: onClose, "aria-label": "Cerrar", className: "isa-glass-dialog__close", sx: { position: "absolute", top: 10, right: 10 }, children: /* @__PURE__ */ jsx2(Icon4, { icon: "mdi:close", size: 18 }) }) : null
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

// ../../Personal/apps/isa-patyia/frontend/js/ui/shared.jsx
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

// ../../Personal/apps/isa-patyia/frontend/js/api/systemConfigApi.ts
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
  const enc = d?.encabezado;
  if (enc && typeof enc === "object" && !Array.isArray(enc) && enc.resultado === false) {
    const e = enc;
    const msg = String(e.mensaje ?? e.imensaje ?? "").trim();
    throw new Error(msg || "Error en la respuesta del servidor");
  }
  let inner = d;
  if (d?.respuesta && typeof d.respuesta === "object" && !Array.isArray(d.respuesta)) {
    inner = d.respuesta;
  } else if (d?.body && typeof d.body === "object" && !Array.isArray(d.body)) {
    inner = d.body;
  }
  const nested = inner;
  if (nested?.respuesta && typeof nested.respuesta === "object" && !Array.isArray(nested.respuesta)) {
    inner = nested.respuesta;
  }
  return inner;
}
async function jsonFetch(path, init) {
  const res = await fetch(`${systemApiBase()}${path}`, init);
  const ct = res.headers.get("content-type") || "";
  if (!res.ok) {
    let msg = res.statusText;
    if (ct.includes("json")) {
      try {
        const j = await res.json();
        const enc = j.encabezado;
        if (enc?.resultado === false && enc.mensaje) msg = String(enc.mensaje);
        else {
          const inner = j.respuesta || j.body || j;
          msg = String(inner?.message || inner?.error || j.message || j.error || msg);
        }
      } catch {
      }
    }
    throw new Error(msg || `HTTP ${res.status}`);
  }
  if (!ct.includes("json")) {
    throw new Error(`Respuesta no JSON (${res.status}) desde ${systemApiBase()}${path}`);
  }
  const raw = await res.json();
  return unwrapBody(raw);
}
function permEntityKey(entry) {
  return String(entry?.ientity ?? entry?.iusuario ?? "").trim();
}
function normalizePermEntry(entry) {
  const key = permEntityKey(entry);
  return {
    iusuario: key,
    ientity: key || void 0,
    itipo: entry?.itipo === "user" ? "user" : "role",
    permisos: entry?.permisos && typeof entry.permisos === "object" ? entry.permisos : {},
    bactivo: entry?.bactivo !== false
  };
}
function normalizeHierarchyNode(node) {
  const iusuario = permEntityKey(node).toLowerCase();
  return {
    iusuario,
    jerarquia: String(node.jerarquia ?? iusuario ?? "").trim(),
    namedisplay: node.namedisplay != null ? String(node.namedisplay) : null,
    descripcion: node.descripcion != null ? String(node.descripcion) : null
  };
}
function normalizePermissionsPayload(raw) {
  const roles = (Array.isArray(raw?.roles) ? raw.roles : []).map((e) => normalizePermEntry(e));
  const users = (Array.isArray(raw?.users) ? raw.users : []).map((e) => normalizePermEntry(e));
  return { ...raw, roles, users };
}
var PERMISSIONS_ME_CACHE = { value: null, iat: 0, ttlMs: 0, key: "" };
async function fetchPermissionsMe(opts) {
  if (!Session.isLoggedIn()) return null;
  const sessionKey = Session?.currentSession?.()?.token ?? "anon";
  if (!opts?.force && PERMISSIONS_ME_CACHE.value && PERMISSIONS_ME_CACHE.key === sessionKey && Date.now() - PERMISSIONS_ME_CACHE.iat < PERMISSIONS_ME_CACHE.ttlMs) {
    return PERMISSIONS_ME_CACHE.value;
  }
  const f = opts?.fetchImpl ?? fetch;
  const res = await f(`${systemApiBase()}/permissions/me`, {
    method: "GET",
    headers: { ...systemApiHeaders(), Accept: "application/json" },
    credentials: "omit"
  });
  if (res.status === 401) {
    PERMISSIONS_ME_CACHE.value = null;
    return null;
  }
  if (!res.ok) return PERMISSIONS_ME_CACHE.value;
  const data = unwrapBody(await res.json());
  if (!data || data.kind !== "insoft.permissions-me") return PERMISSIONS_ME_CACHE.value;
  PERMISSIONS_ME_CACHE.value = data;
  PERMISSIONS_ME_CACHE.iat = data.iat || Date.now();
  PERMISSIONS_ME_CACHE.ttlMs = data.ttlMs || 6e4;
  PERMISSIONS_ME_CACHE.key = sessionKey;
  return data;
}
function applyPermissionsMeToKanban(data, me) {
  if (!me) return data;
  return {
    ...data,
    canManage: me.capabilities.canManagePermissions,
    canAssignUserRoles: me.capabilities.canAssignUserRoles,
    canEditRoleDescriptions: me.capabilities.canEditRoleDescriptions || me.capabilities.canManagePermissions,
    actorRoles: me.roles,
    _permissionsMe: me
  };
}
async function fetchHierarchy() {
  const raw = await jsonFetch(`/system/permisos/hierarchy`, {
    method: "GET",
    headers: systemApiHeaders()
  });
  const roles = (Array.isArray(raw?.roles) ? raw.roles : []).map((r) => normalizeHierarchyNode(r)).filter((r) => r.iusuario && r.jerarquia);
  return { roles, count: roles.length || Number(raw?.count ?? 0) || 0 };
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
  const [raw, me] = await Promise.all([
    jsonFetch(`/system/permisos${q ? `?${q}` : ""}`, { method: "GET", headers: systemApiHeaders() }),
    fetchPermissionsMe().catch(() => null)
  ]);
  return applyPermissionsMeToKanban(normalizePermissionsPayload(raw), me);
}
async function searchPermisosUsers(query = "", opts) {
  const q = String(query ?? "").trim();
  const result = await fetchPermisos({
    ...q ? { search: q } : {},
    ...opts?.role ? { role: opts.role } : {}
  });
  return (result.users ?? []).map((e) => ({
    username: String(e.iusuario ?? "").trim().toUpperCase(),
    displayName: (() => {
      const p = e.permisos;
      const name = p?.nombre ?? p?.namedisplay;
      return name != null && String(name).trim() ? String(name).trim() : null;
    })()
  })).filter((u) => u.username);
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

// ../../Personal/apps/isa-patyia/frontend/js/tools/permFixFilter.js
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

// ../../Personal/apps/isa-patyia/frontend/js/tools/permisosForm.js
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

// ../../Personal/apps/isa-patyia/frontend/js/tools/roleHierarchy.js
var DEFAULT_ROLE_JERARQUIA = {
  visitante: "0",
  dev: "0.0",
  dev_lead: "0.0.0",
  dev_iss: "0.0.1",
  admn: "0.1",
  auditador: "0.1.0",
  admn_isapatyia: "0.1.0.0"
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
function isSameInheritanceLine(a, b) {
  const x = String(a ?? "").trim();
  const y = String(b ?? "").trim();
  if (!x || !y) return false;
  if (x === y) return true;
  return x.startsWith(`${y}.`) || y.startsWith(`${x}.`);
}
function canManageRole(actorJerarquia, targetJerarquia) {
  const target = String(targetJerarquia ?? "").trim();
  if (!target || target === DEFAULT_FOR_UNKNOWN) return false;
  return isSameInheritanceLine(actorJerarquia, target);
}
function actorCanManageTarget(actorJerarquias, targetJerarquia) {
  for (const j of actorJerarquias ?? []) {
    if (canManageRole(j, targetJerarquia)) return true;
  }
  return false;
}
function actorJerarquiasFromRoles(roles, rolePermisosByName = {}) {
  return (roles ?? []).map((r) => String(r ?? "").trim().toLowerCase()).filter((r) => r && r !== "visitante").map((r) => getRoleJerarquia(r, rolePermisosByName[r]));
}
function actorJerarquiaFromRoles(roles, rolePermisosByName = {}) {
  const jerarquias = actorJerarquiasFromRoles(roles, rolePermisosByName);
  if (!jerarquias.length) return DEFAULT_FOR_UNKNOWN;
  jerarquias.sort((a, b) => {
    const depth = (s) => String(s).split(".").filter(Boolean).length;
    const d = depth(b) - depth(a);
    if (d !== 0) return d;
    return compareHierarchy(a, b);
  });
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

// ../../Personal/apps/isa-patyia/frontend/js/tools/roleCanonicalMeta.js
var CANONICAL_ROLE_META = {
  dev: {
    namedisplay: "Desarrollador b\xE1sico",
    descripcion: "Desarrollador b\xE1sico \u2014 rama desarrollo (hereda visitante)"
  },
  admn: {
    namedisplay: "Admn b\xE1sico",
    descripcion: "Admn b\xE1sico \u2014 permisos administrativos globales (hereda visitante)"
  },
  admn_isapatyia: {
    namedisplay: "Admn ISA-Paty",
    descripcion: "Admn ISA-Paty \u2014 permisos administrativos sobre PatyIA (hereda auditador, admn y visitante)"
  }
};
function canonicalRoleMeta(roleName) {
  const key = String(roleName ?? "").trim().toLowerCase();
  return CANONICAL_ROLE_META[key] ?? null;
}

// ../../Personal/apps/isa-patyia/frontend/js/tools/permisosKanbanShared.js
var VISITANTE = "visitante";
var ROLE_ACCENTS = ["#1e90ff", "#10b981", "#a855f7", "#f59e0b", "#ec4899", "#06b6d4", "#8b5cf6"];
var ROLE_ICONS = ["mdi:shield-account", "mdi:file-document-edit-outline", "mdi:code-braces", "mdi:robot-outline", "mdi:eye-outline", "mdi:account-group-outline"];
function permEntryKey(entry) {
  return String(entry?.iusuario ?? entry?.ientity ?? "").trim();
}
function roleNameFromEntry(entry) {
  return permEntryKey(entry).toLowerCase().replace(/^role:/i, "");
}
function formatRoleTitle(roleName) {
  return String(roleName ?? "").split("_").map((part) => {
    const p = part.toLowerCase();
    if (p === "iss" || p === "isw") return p.toUpperCase();
    if (!p) return "";
    return p.charAt(0).toUpperCase() + p.slice(1);
  }).filter(Boolean).join(" ");
}
function roleTitleFromEntry(entry) {
  const roleName = roleNameFromEntry(entry);
  const canon = canonicalRoleMeta(roleName);
  if (canon?.namedisplay) return canon.namedisplay;
  const namedisplay = roleNamedisplay(entry?.permisos);
  const formatted = formatRoleTitle(roleName);
  if (!namedisplay) return formatted;
  if (formatted.length > namedisplay.length) return formatted;
  return namedisplay;
}
function roleDescripcionFromEntry(entry) {
  const roleName = roleNameFromEntry(entry);
  const canon = canonicalRoleMeta(roleName);
  if (canon?.descripcion) return canon.descripcion;
  return roleDescripcion(entry?.permisos);
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
function displayNameFromUserEntry(entry) {
  const fromMeta = entry?.permisos?.nombre ?? entry?.permisos?.namedisplay;
  return fromMeta != null && String(fromMeta).trim() ? String(fromMeta).trim() : null;
}
function normalizePermisosUsername(raw) {
  const s = String(raw ?? "").trim().toUpperCase();
  return s || null;
}
function buildUserDirectoryFromPermisos(users) {
  const map = {};
  for (const e of users ?? []) {
    const key = normalizePermisosUsername(permEntryKey(e));
    if (!key) continue;
    const name = displayNameFromUserEntry(e);
    if (name) map[key] = name;
  }
  return map;
}
function resolveDisplayName(username, userEntry, userDirectory) {
  const fromMeta = displayNameFromUserEntry(userEntry);
  if (fromMeta) return fromMeta;
  const key = normalizePermisosUsername(username);
  const fromDir = key ? userDirectory?.[key] : null;
  if (fromDir != null && String(fromDir).trim()) return String(fromDir).trim();
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
  const activeRoles2 = roles.filter((entry) => entry?.itipo !== "user" && entry?.bactivo !== false && roleNameFromEntry(entry));
  const columns = activeRoles2.map((entry, index) => {
    const roleName = roleNameFromEntry(entry);
    const theme2 = themeForRole(roleName, index, entry.permisos);
    const jerarquia = getRoleJerarquia(roleName, entry.permisos);
    return {
      id: roleName,
      roleName,
      title: roleTitleFromEntry(entry),
      jerarquia,
      jerarquiaLabel: formatJerarquiaLabel(jerarquia),
      descripcion: roleDescripcionFromEntry(entry),
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
    const username = permEntryKey(userEntry).toUpperCase();
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
  const sorted = sortPermisosColumnsByMembers(columns);
  const hideEmpty = !!filters.hideEmptyColumns;
  const visible = hideEmpty ? sorted.filter((c) => c.users.length > 0 || roleFilterSet?.has(c.id)) : sorted;
  const noUsersVisible = filterActive && !columns.some((c) => c.users.length > 0);
  return { columns: visible, filterActive, noUsersVisible, hideEmptyColumns: hideEmpty };
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
function canActorManageColumn(actorJerarquias, targetColumn) {
  if (!targetColumn) return false;
  const actors = Array.isArray(actorJerarquias) ? actorJerarquias : [actorJerarquias];
  const filtered = actors.map((j) => String(j ?? "").trim()).filter(Boolean);
  if (!filtered.length) return false;
  return actorCanManageTarget(filtered, targetColumn.jerarquia ?? "999");
}
function canActorTransferUser(actorJerarquias, fromColumn, toColumn) {
  return canActorManageColumn(actorJerarquias, fromColumn) && canActorManageColumn(actorJerarquias, toColumn);
}
function pointInRef(ref, clientX, clientY) {
  const el = ref?.current;
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
}

// ../../Personal/apps/isa-patyia/frontend/js/editors/jsonEditor.jsx
import { jsx as jsx4 } from "react/jsx-runtime";

// ../../Personal/apps/isa-patyia/frontend/js/tools/permisosRouteCatalog.js
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
      { key: "GET:/api/system/instrucciones", label: "Leer instrucciones PatyIA" },
      { key: "PUT:/api/system/instrucciones", label: "Guardar instrucciones PatyIA" },
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

// ../../Personal/apps/isa-patyia/frontend/js/tools/permisosRoleTransfer.js
function isTopDevLeadRole(roleName, jerarquia) {
  const key = String(roleName ?? "").trim().toLowerCase();
  if (key === "dev_lead") return true;
  return String(jerarquia ?? "").trim() === "0.0.0";
}
function isSamePermisosUser(a, b) {
  const x = String(a ?? "").trim().toUpperCase();
  const y = String(b ?? "").trim().toUpperCase();
  return !!x && x === y;
}
function moveRoleImpactBullets({ username, fromRoleTitle, toRoleTitle, isSelf, leavesDevLead }) {
  const user = String(username ?? "").trim().toUpperCase();
  const from = fromRoleTitle || "origen";
  const to = toRoleTitle || "destino";
  const bullets = [
    `${isSelf ? "Dejar\xE1s" : `${user} dejar\xE1`} de tener el rol **${from}** (solo quedar\xE1 en **${to}**).`,
    `${isSelf ? "Perder\xE1s" : "Perder\xE1"} permisos, rutas y privilegios asociados solo a **${from}**.`,
    `${isSelf ? "Desaparecer\xE1s" : "Desaparecer\xE1"} de la columna **${from}** en este tablero.`,
    "Los dem\xE1s roles que ya tenga el usuario no se modifican."
  ];
  if (leavesDevLead) {
    bullets.push(
      isSelf ? "Al salir de **dev_lead** (m\xE1ximo privilegio) perder\xE1s gesti\xF3n de permisos hasta que otro dev_lead te reasigne o un administrador ajuste la BD." : `Al salir de **dev_lead**, ${user} necesitar\xE1 que otro dev_lead lo reasigne o un ajuste manual en BD para recuperar el rol.`
    );
  }
  return bullets;
}
function removeRoleImpactBullets({ username, roleTitle, isSelf, isDevLead }) {
  const user = String(username ?? "").trim().toUpperCase();
  const role = roleTitle || "rol";
  const bullets = [
    `${isSelf ? "Perder\xE1s" : "Perder\xE1"} permisos, rutas y privilegios de **${role}**.`,
    `${isSelf ? "Dejar\xE1s" : "Dejar\xE1"} de aparecer en la columna **${role}** del tablero.`,
    "Los otros roles asignados no cambian."
  ];
  if (isDevLead) {
    bullets.push(
      isSelf ? "Si te quitas **dev_lead**, otro dev_lead deber\xE1 reasignarte o habr\xE1 que corregirlo en BD." : `Para restaurar **dev_lead** en ${user}, otro dev_lead deber\xE1 volver a asignar el rol.`
    );
  } else {
    bullets.push("Para restaurar el acceso, un dev_lead puede volver a asignar el rol.");
  }
  return bullets;
}
function userJerarquiasFromBoard(username, columns) {
  const u = String(username ?? "").trim().toUpperCase();
  if (!u) return [];
  const out = [];
  for (const col of columns ?? []) {
    if (col.users?.some((x) => String(x.username ?? "").trim().toUpperCase() === u)) {
      out.push(col.jerarquia);
    }
  }
  return out;
}
function canCopyUserRole({ fromJerarquia, toJerarquia, userJerarquiasOnBoard = [] }) {
  if (isSameInheritanceLine(fromJerarquia, toJerarquia)) {
    return {
      ok: false,
      reason: "No se puede copiar dentro de la misma rama jer\xE1rquica. Use mover para cambiar de rol en esa l\xEDnea."
    };
  }
  for (const jer of userJerarquiasOnBoard) {
    if (isSameInheritanceLine(jer, toJerarquia)) {
      return {
        ok: false,
        reason: "El usuario ya tiene un rol en la misma rama que el destino. Copiar est\xE1 prohibido; use mover o quite el rol existente."
      };
    }
  }
  return { ok: true };
}
function canAddUserToRole({ toJerarquia, userJerarquiasOnBoard = [] }) {
  for (const jer of userJerarquiasOnBoard) {
    if (isSameInheritanceLine(jer, toJerarquia)) {
      return {
        ok: false,
        reason: "El usuario ya tiene un rol en la misma rama jer\xE1rquica. No puede duplicarse; use mover entre columnas."
      };
    }
  }
  return { ok: true };
}

// ../../Personal/apps/isa-patyia/frontend/js/tools/PermisosUserAutocomplete.jsx
import { jsx as jsx5 } from "react/jsx-runtime";
import { createElement } from "react";
var { useState: useState3, useEffect: useEffect3, useRef, useCallback } = getReact();
var { Autocomplete, TextField, Typography: Typography2, Box: Box2 } = getMaterialUI();
var DEBOUNCE_MS = 300;
function optionLabel(row) {
  if (!row) return "";
  return row.displayName ? `${row.displayName} (${row.username})` : row.username;
}
function usernameFromInput(text) {
  const raw = String(text ?? "").trim();
  if (!raw) return null;
  const paren = raw.match(/\(([A-Z0-9_.$-]+)\)\s*$/i);
  if (paren) return normalizePermisosUsername(paren[1]);
  return normalizePermisosUsername(raw.split(/\s+/)[0]);
}
function PermisosUserAutocomplete({ value, onChange, disabled = false, label = "Usuario", roleFilter = null, allowNew = true }) {
  const username = value ? normalizePermisosUsername(value) : null;
  const [inputValue, setInputValue] = useState3("");
  const [options, setOptions] = useState3([]);
  const [loading, setLoading] = useState3(false);
  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);
  const selected = username ? options.find((o) => o.username === username) ?? (username ? { username, displayName: null } : null) : null;
  const runSearch = useCallback(async (query) => {
    const id = ++requestIdRef.current;
    setLoading(true);
    try {
      const users = await searchPermisosUsers(query, roleFilter ? { role: roleFilter } : void 0);
      if (id !== requestIdRef.current) return users;
      setOptions(users);
      return users;
    } catch {
      if (id === requestIdRef.current) setOptions([]);
      return [];
    } finally {
      if (id === requestIdRef.current) setLoading(false);
    }
  }, [roleFilter]);
  const scheduleSearch = useCallback((query) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runSearch(query);
    }, DEBOUNCE_MS);
  }, [runSearch]);
  useEffect3(() => {
    if (!username) {
      setInputValue("");
      return;
    }
    if (value && username !== normalizePermisosUsername(value)) {
      onChange(username);
      return;
    }
    const match = options.find((o) => o.username === username);
    setInputValue(match ? optionLabel(match) : username);
  }, [value, username, options, onChange]);
  useEffect3(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);
  useEffect3(() => {
    if (disabled) return;
    runSearch("");
  }, [disabled, runSearch]);
  if (disabled) {
    return /* @__PURE__ */ jsx5(TextField, { label, fullWidth: true, size: "small", value: username || "", disabled: true, placeholder: "Sin usuario" });
  }
  return /* @__PURE__ */ jsx5(
    Autocomplete,
    {
      fullWidth: true,
      size: "small",
      openOnFocus: true,
      autoHighlight: true,
      clearOnBlur: false,
      selectOnFocus: true,
      handleHomeEndKeys: true,
      freeSolo: allowNew,
      loading,
      options,
      value: selected,
      inputValue,
      filterOptions: (x) => x,
      getOptionLabel: optionLabel,
      isOptionEqualToValue: (a, b) => String(a?.username) === String(b?.username),
      noOptionsText: loading ? "Buscando\u2026" : "Sin coincidencias \u2014 escriba login",
      loadingText: "Buscando\u2026",
      onOpen: () => {
        if (!options.length) runSearch(inputValue);
      },
      onInputChange: (_e, text, reason) => {
        if (reason === "reset") return;
        setInputValue(text);
        scheduleSearch(text);
        if (allowNew) {
          const u = usernameFromInput(text);
          if (u && !text.includes("(")) onChange(u);
        }
      },
      onChange: (_e, row) => {
        if (typeof row === "string") {
          const u = usernameFromInput(row);
          onChange(u);
          setInputValue(u ?? "");
          return;
        }
        onChange(row?.username ?? null);
        setInputValue(row ? optionLabel(row) : "");
      },
      renderOption: (props, row) => /* @__PURE__ */ createElement(Box2, { component: "li", ...props, key: row.username, sx: { display: "flex", flexDirection: "column", py: 0.75 } }, /* @__PURE__ */ jsx5(Typography2, { variant: "body2", sx: { fontWeight: 600 }, children: row.displayName || row.username }), row.displayName ? /* @__PURE__ */ jsx5(Typography2, { variant: "caption", color: "text.secondary", children: row.username }) : null),
      renderInput: (params) => /* @__PURE__ */ jsx5(
        TextField,
        {
          ...params,
          label,
          placeholder: "Buscar login ISS\u2026",
          helperText: allowNew ? "Usuarios en permisos ISS o login nuevo" : "Usuarios registrados en permisos ISS"
        }
      )
    }
  );
}

// ../../Personal/apps/isa-patyia/frontend/js/tools/permisosVisitante.js
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

// ../../Personal/apps/isa-patyia/frontend/js/tools/permisosRoleConfig.jsx
import { Fragment as Fragment2, jsx as jsx6, jsxs as jsxs3 } from "react/jsx-runtime";
var { useState: useState4, useEffect: useEffect4, useMemo: useMemo2 } = getReact();
var {
  Typography: Typography3,
  TextField: TextField2,
  Stack: Stack2,
  Alert,
  Chip: Chip2,
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
function renderImpactLine(text) {
  const parts = String(text ?? "").split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) => i % 2 === 1 ? /* @__PURE__ */ jsx6("strong", { children: part }, i) : part);
}
var MODE_LABEL = Object.fromEntries(ACCESS_MODES.map((m) => [m.value, m.label]));
function AccessModeSelect({ value, onChange, disabled, scoped }) {
  const modes = scoped ? ACCESS_MODES : ACCESS_MODES.filter((m) => m.value === "off" || m.value === "allow");
  return /* @__PURE__ */ jsxs3(FormControl, { size: "small", fullWidth: true, disabled, children: [
    /* @__PURE__ */ jsx6(InputLabel, { id: "perm-route-access-label", shrink: true, children: "Acceso" }),
    /* @__PURE__ */ jsx6(Select, { labelId: "perm-route-access-label", label: "Acceso", value: value || "off", onChange: (e) => onChange(e.target.value), children: modes.map((m) => /* @__PURE__ */ jsx6(MenuItem, { value: m.value, children: m.label }, m.value)) })
  ] });
}
function ModeChip({ mode }) {
  const color = mode === "off" ? "default" : mode === "filtered" ? "info" : "success";
  return /* @__PURE__ */ jsx6(Chip2, { size: "small", variant: mode === "off" ? "outlined" : "filled", color, label: MODE_LABEL[mode] || mode });
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
            Chip2,
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
    /* @__PURE__ */ jsxs3(Stack2, { direction: "row", alignItems: "center", justifyContent: "space-between", sx: { mb: 1 }, children: [
      /* @__PURE__ */ jsx6(Typography3, { variant: "subtitle2", fontWeight: 700, children: "Rutas API" }),
      /* @__PURE__ */ jsx6(Chip2, { size: "small", variant: "outlined", label: `${activeCount} activas` })
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
    !view.groups.length && !view.extras.length ? /* @__PURE__ */ jsx6(Typography3, { variant: "body2", color: "text.secondary", children: "Sin rutas activas para este rol." }) : /* @__PURE__ */ jsxs3(Stack2, { spacing: 2, className: "permisos-route-catalog__groups", children: [
      view.groups.map((g) => /* @__PURE__ */ jsx6(RouteGroupSection, { title: g.title, routes: g.routes, canEdit, wildcard, onRouteMode, isVisitante }, g.id)),
      view.extras.length ? /* @__PURE__ */ jsx6(RouteGroupSection, { title: "Otras claves", routes: view.extras, canEdit, wildcard, onRouteMode, isVisitante }) : null
    ] }),
    canEdit && !wildcard && !isVisitante ? /* @__PURE__ */ jsxs3(Stack2, { direction: { xs: "column", sm: "row" }, spacing: 1, sx: { mt: 1.5 }, children: [
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
  return /* @__PURE__ */ jsxs3(Stack2, { spacing: 3, className: "permisos-role-config-editor", children: [
    canEditMeta ? /* @__PURE__ */ jsxs3(Box3, { component: "section", className: "permisos-role-config-editor__meta", children: [
      /* @__PURE__ */ jsx6(Typography3, { variant: "subtitle2", fontWeight: 700, sx: { mb: 1.25 }, children: "Metadatos del rol" }),
      /* @__PURE__ */ jsxs3(Stack2, { spacing: 1.5, children: [
        /* @__PURE__ */ jsx6(
          TextField2,
          {
            label: "Nombre a mostrar",
            size: "small",
            fullWidth: true,
            value: namedisplay,
            disabled: !canEditMeta,
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
            disabled: !canEditMeta,
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
      isVisitante ? /* @__PURE__ */ jsx6(Typography3, { variant: "body2", color: "text.secondary", children: "El rol visitante no usa privilegios globales ni acceso total." }) : /* @__PURE__ */ jsx6(Stack2, { spacing: 0.25, children: FLAG_DEFS.map((f) => /* @__PURE__ */ jsx6(Tooltip, { title: f.hint, placement: "right", children: /* @__PURE__ */ jsx6(
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
function RoleDragDialog({ open, pending, busy, sessionUsername, onClose, onConfirm }) {
  const [moveStep, setMoveStep] = useState4(false);
  useEffect4(() => {
    if (!open) setMoveStep(false);
  }, [open]);
  if (!pending) return null;
  const { username, fromRole, toRole, fromRoleTitle, toRoleTitle, fromJerarquia, toJerarquia, copyBlocked, copyBlockReason } = pending;
  const fromLabel = fromRoleTitle || fromRole;
  const toLabel = toRoleTitle || toRole;
  const isSelf = isSamePermisosUser(username, sessionUsername);
  const leavesDevLead = isTopDevLeadRole(fromRole, fromJerarquia);
  const copyDenied = !!copyBlocked;
  const copyDeniedReason = copyBlockReason || "En la misma rama jer\xE1rquica solo puede moverse el rol, no copiarse.";
  function confirm2(mode) {
    if (busy) return;
    if (mode === "copy" && copyDenied) return;
    onConfirm(mode);
  }
  function handleCopy() {
    if (copyDenied) return;
    confirm2("copy");
  }
  const moveBullets = moveRoleImpactBullets({ username, fromRoleTitle: fromLabel, toRoleTitle: toLabel, isSelf, leavesDevLead });
  return /* @__PURE__ */ jsx6(
    GlassDialog,
    {
      open,
      onClose: busy ? void 0 : onClose,
      maxWidth: "sm",
      fullWidth: true,
      disableEscapeKeyDown: busy,
      header: /* @__PURE__ */ jsx6(
        GlassDialogHeader,
        {
          icon: moveStep ? "mdi:alert-outline" : "mdi:account-switch",
          title: moveStep ? "Confirmar movimiento" : "Asignar rol",
          subtitle: `${username}: ${fromLabel} \u2192 ${toLabel}`,
          accent: moveStep ? "#f59e0b" : "#1e90ff",
          onClose: busy ? void 0 : onClose
        }
      ),
      children: !moveStep ? /* @__PURE__ */ jsxs3(Fragment2, { children: [
        /* @__PURE__ */ jsxs3(DialogContent2, { sx: glassDialogContentSx({ p: 2.5 }), children: [
          /* @__PURE__ */ jsxs3(Typography3, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: [
            "\xBFC\xF3mo asignar a ",
            /* @__PURE__ */ jsx6("strong", { children: username }),
            " el rol ",
            /* @__PURE__ */ jsx6("strong", { children: toLabel }),
            "?"
          ] }),
          copyDenied ? /* @__PURE__ */ jsx6(Alert, { severity: "info", sx: { mb: 2 }, children: copyDeniedReason || "En la misma rama jer\xE1rquica solo puede moverse el rol, no copiarse." }) : null,
          /* @__PURE__ */ jsxs3(Stack2, { spacing: 1.25, children: [
            /* @__PURE__ */ jsx6(
              Button,
              {
                variant: "outlined",
                fullWidth: true,
                disabled: busy || copyDenied,
                sx: { textTransform: "none", justifyContent: "flex-start", py: 1.25 },
                onClick: handleCopy,
                startIcon: busy ? /* @__PURE__ */ jsx6(CircularProgress, { size: 16, color: "inherit" }) : /* @__PURE__ */ jsx6(Icon, { icon: "mdi:content-copy", size: 18 }),
                children: busy ? "Procesando\u2026" : copyDenied ? "Copiar no disponible (misma rama)" : `Copiar (mantener tambi\xE9n en ${fromLabel})`
              }
            ),
            !copyDenied ? /* @__PURE__ */ jsx6(Typography3, { variant: "caption", color: "text.secondary", sx: { px: 0.5 }, children: "Copiar no quita el rol origen; no hay cambio de privilegios neto salvo sumar los del destino." }) : null,
            /* @__PURE__ */ jsx6(
              Button,
              {
                variant: "contained",
                fullWidth: true,
                disabled: busy,
                sx: { textTransform: "none", justifyContent: "flex-start", py: 1.25 },
                onClick: () => setMoveStep(true),
                startIcon: /* @__PURE__ */ jsx6(Icon, { icon: "mdi:arrow-right-bold", size: 18 }),
                children: copyDenied ? `Mover a ${toLabel} (quitar de ${fromLabel})\u2026` : `Mover (quitar de ${fromLabel})\u2026`
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx6(DialogActions, { sx: glassDialogActionsSx(), children: /* @__PURE__ */ jsx6(Button, { onClick: onClose, disabled: busy, sx: { textTransform: "none" }, children: "Cancelar" }) })
      ] }) : /* @__PURE__ */ jsxs3(Fragment2, { children: [
        /* @__PURE__ */ jsxs3(DialogContent2, { sx: glassDialogContentSx({ p: 2.5 }), children: [
          /* @__PURE__ */ jsxs3(Alert, { severity: "warning", sx: { mb: 2 }, children: [
            "Mover implica ",
            /* @__PURE__ */ jsx6("strong", { children: "quitar" }),
            " a ",
            isSelf ? "ti" : username,
            " de ",
            /* @__PURE__ */ jsx6("strong", { children: fromLabel }),
            ". Revisa el impacto antes de confirmar."
          ] }),
          /* @__PURE__ */ jsxs3(Typography3, { variant: "body2", color: "text.secondary", sx: { mb: 1.5 }, children: [
            username,
            " pasar\xE1 de ",
            /* @__PURE__ */ jsx6("strong", { children: fromLabel }),
            " a ",
            /* @__PURE__ */ jsx6("strong", { children: toLabel }),
            " (sin duplicar el origen)."
          ] }),
          /* @__PURE__ */ jsx6(Box3, { component: "ul", sx: { m: 0, pl: 2.25, color: "text.secondary", fontSize: "0.875rem", "& li": { mb: 0.75 } }, children: moveBullets.map((line) => /* @__PURE__ */ jsx6("li", { children: renderImpactLine(line) }, line)) })
        ] }),
        /* @__PURE__ */ jsxs3(DialogActions, { sx: glassDialogActionsSx(), children: [
          /* @__PURE__ */ jsx6(Button, { onClick: () => setMoveStep(false), disabled: busy, sx: { textTransform: "none" }, children: "Atr\xE1s" }),
          /* @__PURE__ */ jsx6(
            Button,
            {
              variant: "contained",
              color: "warning",
              disabled: busy,
              onClick: () => confirm2("move"),
              sx: { textTransform: "none", minWidth: 140 },
              startIcon: busy ? /* @__PURE__ */ jsx6(CircularProgress, { size: 16, color: "inherit" }) : /* @__PURE__ */ jsx6(Icon, { icon: "mdi:arrow-right-bold", size: 18 }),
              children: busy ? "Moviendo\u2026" : "Confirmar movimiento"
            }
          )
        ] })
      ] })
    }
  );
}
function RoleAddDialog({ open, pending, busy, onClose, onConfirm }) {
  const [username, setUsername] = useState4(null);
  useEffect4(() => {
    if (open) setUsername(null);
  }, [open]);
  if (!pending) return null;
  const { roleTitle, role, existingUsernames, toJerarquia, columns } = pending;
  const roleLabel = roleTitle || role;
  const alreadyInRole = username && existingUsernames?.has(String(username).trim().toUpperCase());
  const userJerarquias = username ? userJerarquiasFromBoard(username, columns) : [];
  const addCheck = username && !alreadyInRole ? canAddUserToRole({ toJerarquia, userJerarquiasOnBoard: userJerarquias }) : { ok: true };
  const inheritanceBlocked = username && !alreadyInRole && !addCheck.ok;
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
            "Busque un usuario en permisos ISS o escriba un login nuevo para asignarlo al rol ",
            /* @__PURE__ */ jsx6("strong", { children: roleLabel }),
            "."
          ] }),
          /* @__PURE__ */ jsx6(PermisosUserAutocomplete, { value: username, onChange: setUsername, disabled: busy, label: "Usuario" }),
          alreadyInRole ? /* @__PURE__ */ jsx6(Alert, { severity: "warning", sx: { mt: 1.5 }, children: "Este usuario ya est\xE1 en el rol." }) : null,
          inheritanceBlocked ? /* @__PURE__ */ jsx6(Alert, { severity: "warning", sx: { mt: 1.5 }, children: addCheck.reason }) : null
        ] }),
        /* @__PURE__ */ jsxs3(DialogActions, { sx: glassDialogActionsSx(), children: [
          /* @__PURE__ */ jsx6(Button, { onClick: onClose, disabled: busy, sx: { textTransform: "none" }, children: "Cancelar" }),
          /* @__PURE__ */ jsx6(
            Button,
            {
              variant: "contained",
              disabled: busy || !username || alreadyInRole || inheritanceBlocked,
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
function RoleRemoveDialog({ open, pending, busy, sessionUsername, onClose, onConfirm }) {
  if (!pending) return null;
  const { username, roleTitle, role, fromJerarquia } = pending;
  const roleLabel = roleTitle || role;
  const isSelf = isSamePermisosUser(username, sessionUsername);
  const isDevLead = isTopDevLeadRole(role, fromJerarquia);
  const bullets = removeRoleImpactBullets({ username, roleTitle: roleLabel, isSelf, isDevLead });
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
          /* @__PURE__ */ jsx6(Alert, { severity: "warning", sx: { mb: 2 }, children: isSelf && isDevLead ? "Te quitar\xE1s dev_lead (m\xE1ximo privilegio). Otro dev_lead o un ajuste en BD ser\xE1 necesario para recuperarlo." : "Esta acci\xF3n revoca permisos de forma inmediata. Revise las consecuencias antes de confirmar." }),
          /* @__PURE__ */ jsxs3(Typography3, { variant: "body2", color: "text.secondary", sx: { mb: 1.5 }, children: [
            "\xBFQuitar a ",
            /* @__PURE__ */ jsx6("strong", { children: username }),
            " del rol ",
            /* @__PURE__ */ jsx6("strong", { children: roleLabel }),
            "?"
          ] }),
          /* @__PURE__ */ jsx6(Box3, { component: "ul", sx: { m: 0, pl: 2.25, color: "text.secondary", fontSize: "0.875rem", "& li": { mb: 0.75 } }, children: bullets.map((line) => /* @__PURE__ */ jsx6("li", { children: renderImpactLine(line) }, line)) })
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

// ../../Personal/apps/isa-patyia/frontend/js/tools/PermisosKanban.jsx
import { Fragment as Fragment3, jsx as jsx7, jsxs as jsxs4 } from "react/jsx-runtime";
var { useState: useState5, useMemo: useMemo3, useRef: useRef2, useEffect: useEffect5, memo } = getReact();
var { createPortal } = getReactDOM();
var { Box: Box4, Paper, Typography: Typography4, Stack: Stack3, Chip: Chip3, IconButton, Tooltip: Tooltip2, CircularProgress: CircularProgress2 } = getMaterialUI();
var { Icon: Icon2 } = UI;
var DRAG_THRESHOLD_PX = 6;
var UserCard = memo(function UserCard2({ card, columnId, columnTitle, columnJerarquia, canDragUser, isDragSource, userBusy, isSelected, isDimmed, onPointerDragStart, onRoleRemoveRequest, onUserSelect, onUserSummary, suppressClickRef }) {
  const canDragRole = !!canDragUser && !userBusy;
  const labels = card.labels ?? userCardLabels(card.username, card.displayName);
  const cardClass = [
    "paty-todos-card",
    "paty-permisos-user-card",
    "isa-glass-card",
    canDragRole ? "paty-todos-card--draggable" : "",
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
      onPointerDown: canDragRole ? (e) => {
        if (e.button !== 0 && e.pointerType !== "touch") return;
        if (e.target.closest(".paty-permisos-user-card__remove, .paty-permisos-user-card__busy")) return;
        onPointerDragStart(card.id, columnId, card.username, e);
      } : void 0,
      onClick: (e) => {
        if (suppressClickRef.current) {
          suppressClickRef.current = false;
          return;
        }
        if (userBusy || e.target.closest(".paty-permisos-user-card__remove, .paty-permisos-user-card__busy")) return;
        e.stopPropagation();
        onUserSelect?.(card.username);
      },
      onDoubleClick: (e) => {
        if (userBusy || e.target.closest(".paty-permisos-user-card__remove, .paty-permisos-user-card__busy")) return;
        e.stopPropagation();
        onUserSummary?.(card.username);
      },
      children: /* @__PURE__ */ jsxs4(Stack3, { direction: "row", alignItems: "center", spacing: 0.25, className: "paty-permisos-user-card__row", sx: { minWidth: 0 }, children: [
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
              onRoleRemoveRequest?.({ cardId: card.id, username: card.username, role: columnId, roleTitle: columnTitle, fromJerarquia: columnJerarquia });
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
        children: /* @__PURE__ */ jsxs4(Stack3, { direction: "row", alignItems: "center", spacing: 0.75, sx: { minWidth: 0 }, children: [
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
function PermisosKanban({ boardData, loggedIn, canAssignRoles, readOnly, canManage, canEditRoleDescriptions, busy, actorJerarquia, actorJerarquias, sessionUsername, filterToolbarRef, onUserFilterDrop, onRoleFilterDrop, onDragOverFilterChange, onRoleSave, onRoleDrag, onRoleRemove, onRoleAdd, onJerarquiaToast, onOpenRoleHierarchy, onUserSummary }) {
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
  const effectiveActorJerarquias = useMemo3(() => {
    if (Array.isArray(actorJerarquias) && actorJerarquias.length) return actorJerarquias;
    if (actorJerarquia != null && String(actorJerarquia).trim()) return [String(actorJerarquia).trim()];
    return [];
  }, [actorJerarquias, actorJerarquia]);
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
  const assignEnabled = !!loggedIn && !!canAssignRoles;
  const filterDragEnabled = !!loggedIn && !canAssignRoles;
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
    if (mode === "copy" && pending.copyBlocked) return;
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
      else if (state.username && filterDragEnabled) onUserFilterDrop?.(state.username);
      return;
    }
    if (state.kind === "column") return;
    if (!assignEnabled) return;
    if (processingUserRef.current) return;
    const targetCol = columnAtPoint(columnIds, columnRefs, clientX, clientY);
    if (!targetCol || targetCol === state.sourceColumnId) return;
    const username = state.username;
    if (processingUserRef.current && userKey(username) === processingUserRef.current) return;
    const fromRole = state.sourceColumnId;
    const toRole = targetCol;
    const sourceColData = columns.find((c) => c.id === fromRole);
    const targetColData = columns.find((c) => c.id === toRole);
    if (targetColData?.users?.some((u) => u.username === username)) return;
    if (!canActorTransferUser(effectiveActorJerarquias, sourceColData, targetColData)) {
      onJerarquiaToast?.({
        type: "info",
        message: `Tu jerarqu\xEDa (${effectiveActorJerarquias.join(", ") || "?"}) no puede mover usuarios entre ${sourceColData?.title ?? fromRole} (${sourceColData?.jerarquia ?? "?"}) y ${targetColData?.title ?? toRole} (${targetColData?.jerarquia ?? "?"})`,
        actorJerarquia: effectiveActorJerarquias.join("|"),
        targetJerarquia: targetColData?.jerarquia,
        targetRole: toRole
      });
      return;
    }
    const userJerarquiasOnBoard = userJerarquiasFromBoard(username, columns);
    const copyCheck = canCopyUserRole({
      fromJerarquia: sourceColData?.jerarquia,
      toJerarquia: targetColData?.jerarquia,
      userJerarquiasOnBoard
    });
    setDragPending({
      username: userKey(username),
      fromRole,
      toRole,
      fromRoleTitle: sourceColData?.title ?? fromRole,
      toRoleTitle: targetColData?.title ?? toRole,
      fromJerarquia: sourceColData?.jerarquia,
      toJerarquia: targetColData?.jerarquia,
      userJerarquiasOnBoard,
      copyBlocked: !copyCheck.ok,
      copyBlockReason: copyCheck.reason
    });
  }
  function handleColumnHeadDragStart(col, e) {
    if (!filterDragEnabled) return;
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
    if (!assignEnabled) return;
    const sourceColData = columns.find((c) => c.id === sourceColumnId);
    if (!canActorManageColumn(effectiveActorJerarquias, sourceColData)) return;
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
      else setDragOverCol(assignEnabled ? columnAtPoint(columnIds, columnRefs, e.clientX, e.clientY) : null);
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
  }, [assignEnabled, columnIds, columns, processingUserKey, filterToolbarRef, onDragOverFilterChange, effectiveActorJerarquias, loggedIn, canAssignRoles]);
  if (!boardData) return null;
  const transferBusy = !!processingUserKey;
  const removeBusy = transferBusy && !!removePending;
  const addBusy = !!addingRoleId;
  return /* @__PURE__ */ jsxs4(Box4, { ref: kanbanWrapRef, className: "paty-todos-kanban-wrap paty-permisos-kanban-wrap", sx: { flex: 1, minHeight: 0, height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", p: 0 }, children: [
    /* @__PURE__ */ jsxs4(Box4, { className: `paty-todos-kanban paty-permisos-kanban${!assignEnabled ? " paty-permisos-kanban--no-assign" : ""}${draggingId ? " paty-todos-kanban--dragging" : ""}${selectedUserKey ? " paty-permisos-kanban--user-selected" : ""}${processingUserKey ? " paty-permisos-kanban--user-busy" : ""}`, sx: { flex: 1, minHeight: 0, maxHeight: "100%", display: "flex", alignItems: "stretch", alignSelf: "stretch", position: "relative" }, children: [
      dragGhost ? /* @__PURE__ */ jsx7(DragGhost, { card: ghostCard, column: ghostColumn, x: dragGhost.x, y: dragGhost.y, width: dragGhost.width }) : null,
      noUsersVisible ? /* @__PURE__ */ jsx7(Box4, { sx: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", p: 3, pointerEvents: "none", zIndex: 2 }, children: /* @__PURE__ */ jsx7(Typography4, { variant: "body2", color: "text.secondary", children: "Ning\xFAn usuario coincide con los filtros." }) }) : null,
      columns.length === 0 ? /* @__PURE__ */ jsx7(Box4, { sx: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", p: 3 }, children: /* @__PURE__ */ jsx7(Typography4, { variant: "body2", color: "text.secondary", children: boardData?.hideEmptyColumns ? "No hay columnas visibles (activa roles o desactiva \xABOcultar vac\xEDos\xBB)." : "No hay roles configurados." }) }) : null,
      columns.map((col) => {
        const canManageCol = assignEnabled && canActorManageColumn(effectiveActorJerarquias, col);
        const canDropOnCol = canManageCol;
        const isOver = draggingId && !String(draggingId).startsWith("col:") && dragOverCol === col.id;
        const isOverAllowed = isOver && canDropOnCol;
        const isOverBlocked = isOver && !canDropOnCol;
        const isSource = draggingId && !String(draggingId).startsWith("col:") && dragSourceCol === col.id;
        const colClass = [
          "paty-todos-column",
          "paty-permisos-column",
          col.roleFilteredOut ? "paty-permisos-column--role-filtered" : "",
          isOverAllowed ? "paty-permisos-column--drag-over" : "",
          isOverBlocked ? "paty-permisos-column--drop-blocked" : "",
          isSource && !isOver ? "paty-permisos-column--drag-source" : "",
          draggingId && !String(draggingId).startsWith("col:") && !isOver && assignEnabled && !canDropOnCol ? "paty-permisos-column--drop-forbidden" : "",
          draggingId && !String(draggingId).startsWith("col:") && !isOver ? "paty-permisos-column--drag-idle" : ""
        ].filter(Boolean).join(" ");
        return /* @__PURE__ */ jsxs4(
          Box4,
          {
            ref: (el) => {
              columnRefs.current[col.id] = el;
            },
            className: colClass,
            style: { "--col-accent": col.accent },
            sx: { display: "flex", flexDirection: "column", minHeight: 0, height: "100%", alignSelf: "stretch" },
            children: [
              /* @__PURE__ */ jsxs4(
                Stack3,
                {
                  direction: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  spacing: 1,
                  className: `paty-todos-column__head${filterDragEnabled ? " paty-permisos-column__head--filter-draggable" : ""}`,
                  sx: { flexShrink: 0, px: 1.75, py: 1.25, pb: 1, cursor: filterDragEnabled ? "grab" : "default" },
                  onPointerDown: (e) => handleColumnHeadDragStart(col, e),
                  children: [
                    /* @__PURE__ */ jsxs4(Stack3, { direction: "row", alignItems: "center", spacing: 0.75, className: "paty-todos-column__title", sx: { minWidth: 0, flex: 1 }, children: [
                      /* @__PURE__ */ jsx7(Icon2, { icon: col.icon, size: 16 }),
                      /* @__PURE__ */ jsxs4(Box4, { sx: { minWidth: 0 }, children: [
                        /* @__PURE__ */ jsx7(Stack3, { direction: "row", alignItems: "baseline", spacing: 0.75, sx: { minWidth: 0 }, children: /* @__PURE__ */ jsx7(Box4, { component: "span", sx: { display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 700 }, title: col.jerarquia ? `${col.title} \xB7 Jerarqu\xEDa ${col.jerarquia}${col.roleName && col.title !== col.roleName ? ` (${col.roleName})` : ""}` : col.roleName && col.title !== col.roleName ? `${col.title} (${col.roleName})` : col.title, children: col.title }) }),
                        col.descripcion ? /* @__PURE__ */ jsx7(Typography4, { variant: "caption", color: "text.secondary", sx: { display: "block", lineHeight: 1.3, mt: 0.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, title: col.descripcion, children: col.descripcion }) : null
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs4(Stack3, { direction: "row", alignItems: "center", spacing: 0.5, sx: { flexShrink: 0 }, children: [
                      onOpenRoleHierarchy ? /* @__PURE__ */ jsx7(Tooltip2, { title: `Ver/editar ${col.title || col.id} en jerarqu\xEDa`, children: /* @__PURE__ */ jsx7(
                        IconButton,
                        {
                          size: "small",
                          className: "paty-permisos-column__hierarchy",
                          "aria-label": `Jerarqu\xEDa ${col.title || col.id}`,
                          onPointerDown: (e) => e.stopPropagation(),
                          onClick: (e) => {
                            e.stopPropagation();
                            onOpenRoleHierarchy(col.roleName ?? col.id);
                          },
                          children: /* @__PURE__ */ jsx7(Icon2, { icon: "mdi:family-tree", size: 16 })
                        }
                      ) }) : null,
                      canManageCol ? /* @__PURE__ */ jsx7(Tooltip2, { title: addBusy && addingRoleId === col.id ? "Agregando\u2026" : "Agregar usuario", children: /* @__PURE__ */ jsx7("span", { className: "paty-permisos-column__add-wrap", children: /* @__PURE__ */ jsx7(
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
                              toJerarquia: col.jerarquia,
                              columns,
                              existingUsernames: new Set(col.users.map((u) => u.username))
                            });
                          },
                          children: addBusy && addingRoleId === col.id ? /* @__PURE__ */ jsx7(CircularProgress2, { size: 14, thickness: 5 }) : /* @__PURE__ */ jsx7(Icon2, { icon: "mdi:plus", size: 16 })
                        }
                      ) }) }) : null
                    ] })
                  ]
                }
              ),
              /* @__PURE__ */ jsxs4(
                Box4,
                {
                  ref: (el) => {
                    listRefs.current[col.id] = el;
                  },
                  "data-column-id": col.id,
                  className: `paty-todos-column__list paty-permisos-column__list${isOverAllowed ? " paty-todos-column__list--drag-over" : ""}${isOverBlocked ? " paty-todos-column__list--drop-blocked" : ""}`,
                  sx: { flex: 1, minHeight: 0, overflowY: "auto", p: 1.25, px: 1.5, boxSizing: "border-box" },
                  children: [
                    col.users.map((card) => {
                      const cardUserKey = userKey(card.username);
                      const userBusy = !!processingUserKey && processingUserKey === cardUserKey;
                      const isSelected = selectedUserKey === cardUserKey;
                      const isDimmed = !!selectedUserKey && !isSelected;
                      const canDragUser = canManageCol;
                      return /* @__PURE__ */ jsx7(
                        UserCard,
                        {
                          card,
                          columnId: col.id,
                          columnTitle: col.title,
                          columnJerarquia: col.jerarquia,
                          canDragUser,
                          isDragSource: draggingId === card.id,
                          userBusy,
                          isSelected,
                          isDimmed,
                          onPointerDragStart: handlePointerDragStart,
                          onRoleRemoveRequest: setRemovePending,
                          onUserSelect: handleUserSelect,
                          onUserSummary,
                          suppressClickRef
                        },
                        card.id
                      );
                    }),
                    !col.users.length ? /* @__PURE__ */ jsx7(Typography4, { variant: "caption", color: "text.secondary", sx: { px: 0.5, py: 1 }, children: "Sin usuarios" }) : null
                  ]
                }
              )
            ]
          },
          col.id
        );
      })
    ] }),
    typeof document !== "undefined" ? createPortal(/* @__PURE__ */ jsxs4(Fragment3, { children: [
      /* @__PURE__ */ jsx7(
        RoleDragDialog,
        {
          open: !!dragPending,
          pending: dragPending,
          busy: transferBusy,
          sessionUsername,
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
          sessionUsername,
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

// ../../Personal/apps/isa-patyia/frontend/js/tools/PermisosRoleFilterAutocomplete.jsx
import { jsx as jsx8 } from "react/jsx-runtime";
var { Autocomplete: Autocomplete2, TextField: TextField3, Chip: Chip4 } = getMaterialUI();
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
        return /* @__PURE__ */ jsx8(Chip4, { ...chipProps, label: option.label, size: "small", className: "isa-neon-glass-chip" }, key);
      }),
      renderInput: (params) => /* @__PURE__ */ jsx8(TextField3, { ...params, label: "Roles", placeholder: selected.length ? "" : "Todos" })
    }
  );
}

// ../../Personal/apps/isa-patyia/frontend/js/tools/roleHierarchyTree/RoleHierarchyView.tsx
import * as React2 from "react";

// ../../Personal/apps/isa-patyia/frontend/js/ui/treeView/TreeRowItem.tsx
import * as React from "react";

// ../../Personal/apps/isa-patyia/frontend/js/ui/treeView/treeDrag.ts
function resolveDragZone(clientY, rectTop, rectHeight, isGrouper) {
  if (isGrouper) {
    const y = clientY - rectTop;
    const topBand = rectHeight * 0.25;
    const bottomBand = rectHeight * 0.75;
    if (y < topBand) return "before";
    if (y > bottomBand) return "after";
    return "into";
  }
  const midY = rectTop + rectHeight / 2;
  return clientY < midY ? "before" : "after";
}
function summaryDragClass(dragOver, forbidden) {
  if (!dragOver) return "";
  if (forbidden) {
    if (dragOver === "before") return "trvwr-itm-sum--drg-forbidden-bf";
    if (dragOver === "after") return "trvwr-itm-sum--drg-forbidden-aftr";
    return "trvwr-itm-sum--drg-forbidden-into";
  }
  if (dragOver === "before") return "trvwr-itm-sum--drg-bf";
  if (dragOver === "after") return "trvwr-itm-sum--drg-aftr";
  return "trvwr-itm-sum--drg-into";
}

// ../../Personal/apps/isa-patyia/frontend/js/ui/treeView/TreeRowItem.tsx
import { Fragment as Fragment4, jsx as jsx9, jsxs as jsxs5 } from "react/jsx-runtime";
var { IconButton: IconButton2, Tooltip: Tooltip3 } = getMaterialUI();
function TreeRow({ node, ...ctx }) {
  const {
    items,
    manifest,
    customs,
    collapsed,
    selectedPath,
    highlightedPath,
    canMutate,
    drag,
    onToggleCollapse,
    onSelect,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDragEnd,
    onDrop
  } = ctx;
  const features = manifest.features ?? {};
  const icons = manifest.icons ?? {};
  const path = node.flatPath;
  const isOpen = !collapsed.has(path);
  const isGrouper = customs.isGrouper ? customs.isGrouper(node) : node.hasChildren;
  const isSelected = selectedPath === path;
  const isHighlighted = highlightedPath === path;
  const isDragging = drag.sourcePath === path;
  const isDragTarget = drag.overPath === path;
  const dragZone = isDragTarget ? drag.overZone : null;
  const dragForbidden = isDragTarget && drag.forbidden;
  const childCount = node.childrens.length;
  const rowCtx = { node, isOpen, isSelected, isGrouper, childCount };
  const iconCtx = { ...rowCtx, isExpanded: isOpen };
  const label = customs.getLabel?.(node) ?? path;
  const helper = features.showHelper !== false ? customs.getHelper?.(node) ?? null : null;
  const pathLabel = features.showPathLabel !== false ? customs.getPathLabel?.(node) ?? path : null;
  const grouperIcons = customs.getGrouperIcons?.(iconCtx) ?? {
    open: icons.grouperOpen ?? "mdi:folder-open",
    closed: icons.grouperClosed ?? "mdi:folder",
    color: icons.grouperColor ?? "#FFA000"
  };
  const leafIcon = customs.getLeafIcon?.(iconCtx) ?? icons.leaf ?? "mdi:circle-small";
  const rowActions = features.rowActions !== false && canMutate ? customs.rowActions?.(node) ?? [] : [];
  const detailsRef = React.useRef(null);
  const dragEnterCount = React.useRef(0);
  const cachedRect = React.useRef(null);
  const summaryClass = [
    "trvwr-itm-sum",
    isHighlighted ? "trvwr-itm-sum--focused" : "",
    summaryDragClass(dragZone, dragForbidden),
    !canMutate ? "trvwr-itm-sum--disabled" : ""
  ].filter(Boolean).join(" ");
  const detailsClass = [
    "trvwr-itm",
    isHighlighted ? "highlight" : "",
    isDragging ? "trvwr-itm--dragging" : "",
    isSelected && isGrouper ? "trvwr-itm--folder-selected" : "",
    isSelected ? "trvwr-itm--active" : ""
  ].filter(Boolean).join(" ");
  const handleToggle = (e) => {
    if (!canMutate || features.collapse === false) {
      e.preventDefault();
      if (detailsRef.current) detailsRef.current.open = isOpen;
      return;
    }
    const open = e.currentTarget.open;
    if (open !== isOpen) {
      onToggleCollapse(path, open);
      customs.onExpand?.(node, open);
    }
  };
  const handleSummaryClick = (e) => {
    const target = e.target;
    if (target.closest(".trvwr-drag-handle")) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    const clickedSymbol = target.closest(".trvwr-itm-symb");
    if (isGrouper && clickedSymbol && canMutate && features.collapse !== false) {
      e.preventDefault();
      onToggleCollapse(path, !isOpen);
      customs.onExpand?.(node, !isOpen);
    }
    onSelect(path);
    customs.onSelect?.(node);
  };
  const dragEnabled = canMutate && features.drag !== false;
  const handleDragStart = (e) => {
    if (!dragEnabled) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", path);
    const summary = e.currentTarget.closest("summary") ?? e.currentTarget;
    const h = Math.max(24, Math.round(summary.getBoundingClientRect().height));
    e.dataTransfer.setData("application/x-trvwr-row-height", String(h));
    onDragStart(path, h);
  };
  const handleDragOver = (e) => {
    if (!dragEnabled || !drag.sourcePath) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (drag.sourcePath === path) return;
    if (!cachedRect.current) {
      const r = e.currentTarget.getBoundingClientRect();
      cachedRect.current = { top: r.top, height: r.height };
    }
    const rect = cachedRect.current;
    const zone = resolveDragZone(e.clientY, rect.top, rect.height, isGrouper);
    const canDropFn = customs.canDrop ?? (() => true);
    const forbidden = !canDropFn(drag.sourcePath, path, zone, items);
    onDragOver(path, zone, forbidden);
  };
  const handleDragEnter = () => {
    dragEnterCount.current++;
    cachedRect.current = null;
  };
  const handleDragLeave = () => {
    dragEnterCount.current--;
    if (dragEnterCount.current <= 0) {
      dragEnterCount.current = 0;
      cachedRect.current = null;
      onDragLeave(path);
    }
  };
  const handleDrop = (e) => {
    e.preventDefault();
    dragEnterCount.current = 0;
    cachedRect.current = null;
    const sourcePath = e.dataTransfer.getData("text/plain") || drag.sourcePath;
    const zone = drag.overPath === path ? drag.overZone : null;
    if (!sourcePath || !zone || drag.forbidden || sourcePath === path) {
      onDragEnd();
      return;
    }
    onDrop(sourcePath, path, zone);
  };
  const handleDragEnd = () => {
    dragEnterCount.current = 0;
    cachedRect.current = null;
    onDragEnd();
  };
  return /* @__PURE__ */ jsx9("div", { className: "trvwr-row-host", "data-flatpath": path, children: /* @__PURE__ */ jsxs5("details", { ref: detailsRef, className: detailsClass, open: isOpen, onToggle: handleToggle, "aria-disabled": !canMutate || void 0, children: [
    /* @__PURE__ */ jsx9(
      "summary",
      {
        className: summaryClass,
        role: "treeitem",
        "aria-selected": isSelected,
        "aria-expanded": isGrouper ? isOpen : void 0,
        draggable: dragEnabled,
        onClick: handleSummaryClick,
        onDragStart: handleDragStart,
        onDragEnd: handleDragEnd,
        onDragEnter: handleDragEnter,
        onDragOver: handleDragOver,
        onDragLeave: handleDragLeave,
        onDrop: handleDrop,
        children: /* @__PURE__ */ jsxs5("div", { className: "trvwr-sum-row", children: [
          dragEnabled ? /* @__PURE__ */ jsx9("span", { className: "trvwr-drag-handle", title: "Arrastrar para reordenar", draggable: true, onDragStart: handleDragStart, onDragEnd: handleDragEnd, children: /* @__PURE__ */ jsx9("iconify-icon", { icon: icons.dragHandle ?? "mdi:dots-grid", style: { fontSize: "1rem", opacity: 0.45 } }) }) : null,
          isGrouper ? /* @__PURE__ */ jsxs5("span", { className: "trvwr-itm-symb", children: [
            /* @__PURE__ */ jsx9("span", { className: `trvwr-chevron${isOpen ? "" : " trvwr-chevron--closed"}`, children: /* @__PURE__ */ jsx9("iconify-icon", { icon: icons.chevron ?? "mdi:chevron-down", style: { fontSize: "1rem" } }) }),
            /* @__PURE__ */ jsx9("iconify-icon", { icon: isOpen ? grouperIcons.open : grouperIcons.closed, style: { fontSize: "1rem", color: grouperIcons.color } })
          ] }) : /* @__PURE__ */ jsx9("span", { className: "trvwr-itm-symb", children: /* @__PURE__ */ jsx9("iconify-icon", { icon: leafIcon, style: { fontSize: "1rem", opacity: 0.75 } }) }),
          /* @__PURE__ */ jsxs5("div", { className: "trvwr-itm-content", children: [
            /* @__PURE__ */ jsxs5("span", { className: "trvwr-itm-label", title: label, children: [
              label,
              pathLabel ? /* @__PURE__ */ jsx9("span", { className: "trvwr-itm-path", children: pathLabel }) : null
            ] }),
            helper ? /* @__PURE__ */ jsx9("span", { className: "trvwr-itm-helper", children: /* @__PURE__ */ jsx9("small", { children: helper }) }) : null
          ] }),
          rowActions.length ? /* @__PURE__ */ jsx9("div", { className: "trvwr-float-card", role: "presentation", onClick: (e) => e.stopPropagation(), children: rowActions.map((act) => /* @__PURE__ */ jsx9(Tooltip3, { title: act.title, children: /* @__PURE__ */ jsx9(IconButton2, { size: "small", "aria-label": act.title, disabled: act.disabled, onClick: act.onClick, children: /* @__PURE__ */ jsx9("iconify-icon", { icon: act.icon, width: "16", height: "16" }) }) }, act.id)) }) : null,
          customs.renderRowExtra?.(node)
        ] })
      }
    ),
    isGrouper && isOpen ? /* @__PURE__ */ jsx9("div", { className: "trvwr-itm-childrens-wrap", children: /* @__PURE__ */ jsx9("div", { className: "trvwr-itm-childrens", role: "group", children: /* @__PURE__ */ jsx9(TreeRowItem, { nodes: node.childrens, ...ctx }) }) }) : null
  ] }) });
}
function TreeRowItem(props) {
  const { nodes, ...ctx } = props;
  if (!nodes?.length) return null;
  return /* @__PURE__ */ jsx9(Fragment4, { children: nodes.map((node) => /* @__PURE__ */ jsx9(TreeRow, { node, nodes, ...ctx }, node.pathInit)) });
}

// ../../Personal/apps/isa-patyia/frontend/js/ui/treeView/treeData.ts
function dedupeItems(items, keyFn) {
  const seen = /* @__PURE__ */ new Map();
  for (const item of items) {
    const key = keyFn(item);
    if (key && !seen.has(key)) seen.set(key, item);
  }
  return Array.from(seen.values());
}
function defaultSort(a, b) {
  return a.flatPath.localeCompare(b.flatPath, void 0, { numeric: true });
}
function buildTreeFromFlatList(items, config) {
  const keyFn = config.dedupeKey ?? config.getFlatPath;
  const unique = dedupeItems(items, keyFn);
  const byPath = /* @__PURE__ */ new Map();
  for (const item of unique) {
    const flatPath = String(config.getFlatPath(item) ?? "").trim();
    if (!flatPath) continue;
    byPath.set(flatPath, {
      flatPath,
      pathInit: flatPath,
      hasChildren: false,
      depth: 0,
      childrens: [],
      data: item
    });
  }
  const childrenOf = /* @__PURE__ */ new Map();
  for (const [flatPath, node] of byPath) {
    const parentPath = config.getParentPath(flatPath, node.data);
    if (!parentPath || !byPath.has(parentPath)) continue;
    if (!childrenOf.has(parentPath)) childrenOf.set(parentPath, []);
    if (!childrenOf.get(parentPath).includes(flatPath)) childrenOf.get(parentPath).push(flatPath);
  }
  const visited = /* @__PURE__ */ new Set();
  const computeDepth = (path, depth) => {
    if (visited.has(path)) return;
    visited.add(path);
    const node = byPath.get(path);
    if (!node) return;
    node.depth = depth;
    const kids = childrenOf.get(path) ?? [];
    node.hasChildren = kids.length > 0;
    for (const kid of kids) computeDepth(kid, depth + 1);
  };
  for (const item of unique) {
    const fp = String(config.getFlatPath(item) ?? "").trim();
    if (fp && !visited.has(fp)) computeDepth(fp, 0);
  }
  const hasKnownParent = (path) => {
    const node = byPath.get(path);
    if (!node) return false;
    const parent = config.getParentPath(path, node.data);
    return !!parent && byPath.has(parent);
  };
  const roots = [];
  for (const node of byPath.values()) {
    const parentPath = config.getParentPath(node.flatPath, node.data);
    const parent = parentPath ? byPath.get(parentPath) : void 0;
    if (parent) {
      parent.childrens.push(node);
      parent.hasChildren = true;
    } else if (!hasKnownParent(node.flatPath)) {
      roots.push(node);
    }
  }
  const sortRec = (list) => {
    const cmp = config.sortSiblings ?? defaultSort;
    list.sort(cmp);
    for (const n of list) sortRec(n.childrens);
  };
  sortRec(roots);
  return roots;
}
function findTreeNodeByPath(roots, path) {
  const walk = (nodes) => {
    for (const n of nodes) {
      if (n.flatPath === path) return n;
      const hit = walk(n.childrens);
      if (hit) return hit;
    }
    return void 0;
  };
  return walk(roots);
}
function collectPathsWithChildren(roots) {
  const out = [];
  const walk = (nodes) => {
    for (const n of nodes) {
      if (n.hasChildren) out.push(n.flatPath);
      walk(n.childrens);
    }
  };
  walk(roots);
  return out;
}

// ../../Personal/apps/isa-patyia/frontend/js/ui/treeView/TreeView.tsx
import { Fragment as Fragment5, jsx as jsx10, jsxs as jsxs6 } from "react/jsx-runtime";
var { useState: useState6, useMemo: useMemo4, useCallback: useCallback2 } = getReact();
var { Box: Box5, Stack: Stack4, Typography: Typography5, Chip: Chip5, IconButton: IconButton3, Tooltip: Tooltip4, Button: Button2, CircularProgress: CircularProgress3 } = getMaterialUI();
var EMPTY_DRAG = { sourcePath: null, overPath: null, overZone: null, forbidden: false };
function TreeView(props) {
  const {
    items,
    manifest,
    customs,
    readonly = false,
    busy = false,
    selectedPath: selectedPathProp,
    onSelectedPathChange,
    className = "",
    toolbarTitle,
    toolbarExtra,
    showToolbar = true
  } = props;
  const features = manifest.features ?? {};
  const [collapsed, setCollapsed] = useState6(/* @__PURE__ */ new Set());
  const [selectedPathInternal, setSelectedPathInternal] = useState6(null);
  const [drag, setDrag] = useState6(EMPTY_DRAG);
  const selectedPath = selectedPathProp !== void 0 ? selectedPathProp : selectedPathInternal;
  const setSelectedPath = useCallback2((path) => {
    if (onSelectedPathChange) onSelectedPathChange(path);
    else setSelectedPathInternal(path);
  }, [onSelectedPathChange]);
  const rootNodes = useMemo4(() => buildTreeFromFlatList(items, customs.build), [items, customs.build]);
  const canMutate = !readonly && !busy;
  const runtime = useMemo4(() => ({
    rootNodes,
    items,
    selectedPath,
    collapsed,
    readonly,
    busy,
    collapseAll: () => setCollapsed(new Set(collectPathsWithChildren(rootNodes))),
    expandAll: () => setCollapsed(/* @__PURE__ */ new Set()),
    select: setSelectedPath,
    findByPath: (path) => findTreeNodeByPath(rootNodes, path)
  }), [rootNodes, items, selectedPath, collapsed, readonly, busy, setSelectedPath]);
  const setCollapsedFor = useCallback2((path, open) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (open) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);
  const handleDragStart = useCallback2((path) => {
    setDrag({ sourcePath: path, overPath: null, overZone: null, forbidden: false });
  }, []);
  const handleDragOver = useCallback2((path, zone, forbidden) => {
    setDrag((prev) => {
      if (prev.overPath === path && prev.overZone === zone && prev.forbidden === forbidden) return prev;
      return { ...prev, overPath: path, overZone: zone, forbidden };
    });
  }, []);
  const handleDragLeave = useCallback2((path) => {
    setDrag((prev) => prev.overPath === path ? { ...prev, overPath: null, overZone: null, forbidden: false } : prev);
  }, []);
  const handleDragEnd = useCallback2(() => setDrag(EMPTY_DRAG), []);
  const handleDrop = useCallback2(async (sourcePath, targetPath, zone) => {
    setDrag(EMPTY_DRAG);
    await customs.onDrop?.(sourcePath, targetPath, zone, items);
  }, [customs, items]);
  const toolbarActions = useMemo4(
    () => (customs.toolbarActions?.(runtime) ?? []).filter((a) => !a.hidden),
    [customs, runtime]
  );
  const countLabel = manifest.countLabel ?? `${items.length} ${manifest.entrie ?? "elemento"}${items.length !== 1 ? "s" : ""}`;
  const ariaLabel = manifest.ariaLabel ?? manifest.entries ?? `\xC1rbol de ${manifest.entrie ?? "elementos"}`;
  return /* @__PURE__ */ jsxs6(Box5, { className: `isp-tree-host isp-tree ${className}`.trim(), sx: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }, children: [
    showToolbar ? /* @__PURE__ */ jsxs6(Stack4, { direction: "row", alignItems: "center", spacing: 1, className: "isp-tree-toolbar", sx: { p: 1, borderBottom: 1, borderColor: "divider", flexShrink: 0 }, children: [
      toolbarTitle ? /* @__PURE__ */ jsx10(Typography5, { variant: "subtitle1", sx: { flex: 1 }, children: toolbarTitle }) : /* @__PURE__ */ jsx10(Box5, { sx: { flex: 1 } }),
      /* @__PURE__ */ jsx10(Chip5, { size: "small", label: countLabel }),
      features.toolbarExpandCollapse !== false ? /* @__PURE__ */ jsxs6(Fragment5, { children: [
        /* @__PURE__ */ jsx10(Tooltip4, { title: "Expandir todo", children: /* @__PURE__ */ jsx10(IconButton3, { size: "small", onClick: runtime.expandAll, disabled: busy, children: /* @__PURE__ */ jsx10("iconify-icon", { icon: "mdi:unfold-more-horizontal", width: "18", height: "18" }) }) }),
        /* @__PURE__ */ jsx10(Tooltip4, { title: "Colapsar todo", children: /* @__PURE__ */ jsx10(IconButton3, { size: "small", onClick: runtime.collapseAll, disabled: busy, children: /* @__PURE__ */ jsx10("iconify-icon", { icon: "mdi:unfold-less-horizontal", width: "18", height: "18" }) }) })
      ] }) : null,
      toolbarActions.map((act) => act.variant === "button" ? /* @__PURE__ */ jsx10(
        Button2,
        {
          size: "small",
          variant: "contained",
          disabled: act.disabled || busy,
          startIcon: /* @__PURE__ */ jsx10("iconify-icon", { icon: act.icon, width: "16", height: "16" }),
          onClick: act.onClick,
          children: act.label ?? act.title
        },
        act.id
      ) : /* @__PURE__ */ jsx10(Tooltip4, { title: act.title, children: /* @__PURE__ */ jsx10("span", { children: /* @__PURE__ */ jsx10(IconButton3, { size: "small", disabled: act.disabled || busy, onClick: act.onClick, "aria-label": act.title, children: /* @__PURE__ */ jsx10("iconify-icon", { icon: act.icon, width: "18", height: "18" }) }) }) }, act.id)),
      toolbarExtra
    ] }) : null,
    busy ? /* @__PURE__ */ jsx10(Box5, { sx: { display: "flex", alignItems: "center", justifyContent: "center", p: 2, flex: 1, minHeight: 0 }, children: /* @__PURE__ */ jsx10(CircularProgress3, { size: 20 }) }) : /* @__PURE__ */ jsx10(Box5, { className: "isp-tree isp-tree-body custom-scrollbar", role: "tree", "aria-label": ariaLabel, sx: { flex: 1, minHeight: 0, overflow: "auto" }, children: rootNodes.length === 0 ? /* @__PURE__ */ jsx10(Typography5, { variant: "body2", color: "text.secondary", sx: { p: 2 }, children: manifest.emptyMessage ?? "Sin elementos." }) : /* @__PURE__ */ jsx10(
      TreeRowItem,
      {
        nodes: rootNodes,
        items,
        manifest,
        customs,
        collapsed,
        selectedPath,
        highlightedPath: selectedPath,
        canMutate,
        drag,
        onToggleCollapse: setCollapsedFor,
        onSelect: setSelectedPath,
        onDragStart: handleDragStart,
        onDragOver: handleDragOver,
        onDragLeave: handleDragLeave,
        onDragEnd: handleDragEnd,
        onDrop: handleDrop
      }
    ) })
  ] });
}

// ../../Personal/apps/isa-patyia/frontend/js/tools/roleHierarchyTree/treeLogic.ts
function immediateParentJer(jer) {
  const ancestors = ancestorsFromPath(jer);
  return ancestors.length > 1 ? ancestors[1] : null;
}
function isDescendant(targetJer, ancestorJer) {
  if (targetJer === ancestorJer) return true;
  return ancestorsFromPath(targetJer).includes(ancestorJer);
}
function canDrop(sourceJer, targetJer, position, _nodes) {
  if (!position || !sourceJer || !targetJer || sourceJer === targetJer) return false;
  if (isDescendant(targetJer, sourceJer)) return false;
  return true;
}
function nextChildJer(parentJer, existing) {
  const prefix = `${parentJer}.`;
  let max = -1;
  for (const j of existing) {
    if (!j.startsWith(prefix)) continue;
    const seg = j.slice(prefix.length).split(".")[0];
    const n = Number(seg);
    if (!Number.isNaN(n)) max = Math.max(max, n);
  }
  return `${parentJer}.${max + 1}`;
}
function computeDropJerarquia(sourceJer, targetJer, position, nodes) {
  if (!canDrop(sourceJer, targetJer, position, nodes)) return null;
  const existing = new Set(nodes.map((n) => n.jerarquia).filter((j) => j !== sourceJer));
  if (position === "into") return nextChildJer(targetJer, existing);
  const targetParent = immediateParentJer(targetJer);
  const siblings = nodes.filter((n) => n.jerarquia !== sourceJer).filter((n) => immediateParentJer(n.jerarquia) === targetParent).map((n) => n.jerarquia).sort((a, b) => compareHierarchy(a, b));
  const tgtIdx = siblings.indexOf(targetJer);
  if (tgtIdx === -1) return null;
  const insertIdx = position === "before" ? tgtIdx : tgtIdx + 1;
  const parentPrefix = targetParent ? `${targetParent}.` : "";
  const reindexed = [...siblings];
  reindexed.splice(insertIdx, 0, "__moving__");
  const myIdx = reindexed.indexOf("__moving__");
  const seg = myIdx;
  if (targetParent) return `${targetParent}.${seg}`;
  return String(seg);
}

// ../../Personal/apps/isa-patyia/frontend/js/tools/roleHierarchyTree/roleHierarchyTreeConfig.ts
var ROLE_HIERARCHY_MANIFEST = {
  ariaLabel: "\xC1rbol de roles",
  entrie: "rol",
  entries: "roles",
  emptyMessage: "Sin roles.",
  countLabel: void 0,
  icons: {
    grouperOpen: "mdi:folder-account",
    grouperClosed: "mdi:folder-account-outline",
    grouperColor: "#1976d2",
    leaf: "mdi:account",
    chevron: "mdi:chevron-down",
    dragHandle: "mdi:dots-grid"
  },
  features: {
    drag: true,
    collapse: true,
    toolbarExpandCollapse: true,
    rowActions: true,
    showPathLabel: true,
    showHelper: true
  }
};
function immediateParentJer2(jer) {
  const ancestors = ancestorsFromPath(jer);
  return ancestors.length > 1 ? ancestors[1] : null;
}
function createRoleHierarchyCustoms(handlers) {
  const { items, canMutate, onSave, onDelete, onEdit, onCreateClick } = handlers;
  return {
    build: {
      getFlatPath: (item) => String(item.jerarquia ?? "").trim(),
      getParentPath: (flatPath) => immediateParentJer2(flatPath),
      dedupeKey: (item) => String(item.jerarquia ?? "").trim(),
      sortSiblings: (a, b) => compareHierarchy(a.flatPath, b.flatPath)
    },
    getLabel: (node) => node.data.namedisplay?.trim() || node.data.iusuario,
    getHelper: (node) => node.data.descripcion?.trim() || null,
    getPathLabel: (node) => formatJerarquiaLabel(node.flatPath),
    canDrop: (sourcePath, targetPath, zone) => canDrop(sourcePath, targetPath, zone, items),
    onDrop: async (sourcePath, targetPath, zone) => {
      const source = items.find((n) => n.jerarquia === sourcePath);
      if (!source) return;
      const newJer = computeDropJerarquia(sourcePath, targetPath, zone, items);
      if (!newJer) {
        toastInfo?.("No se puede mover: operaci\xF3n no permitida");
        return;
      }
      try {
        await onSave(source.iusuario, newJer);
      } catch (err) {
        toastError?.(`Error al reparentar: ${err?.message ?? err}`);
      }
    },
    rowActions: (node) => {
      if (!canMutate) return [];
      const data = node.data;
      return [
        {
          id: "edit",
          icon: "mdi:pencil",
          title: "Editar jerarqu\xEDa",
          onClick: () => onEdit(data)
        },
        {
          id: "delete",
          icon: "mdi:delete",
          title: "Eliminar rol",
          onClick: () => {
            if (confirm(`\xBFEliminar rol "${data.iusuario}"?`)) {
              onDelete(data.iusuario).catch((e) => toastError?.(String(e)));
            }
          }
        }
      ];
    },
    toolbarActions: (runtime) => {
      if (!canMutate) return [];
      return [
        {
          id: "new-role",
          icon: "mdi:plus",
          title: "Nuevo rol",
          label: "Nuevo rol",
          variant: "button",
          onClick: onCreateClick
        }
      ];
    }
  };
}

// ../../Personal/apps/isa-patyia/frontend/js/tools/roleHierarchyTree/RoleHierarchyView.tsx
import { jsx as jsx11, jsxs as jsxs7 } from "react/jsx-runtime";
var { useState: useState7, useMemo: useMemo5, useCallback: useCallback3, useEffect: useEffect7 } = getReact();
var { Box: Box6, Typography: Typography6, Button: Button3, Dialog, DialogTitle, DialogContent: DialogContent3, DialogActions: DialogActions2, TextField: TextField4, Alert: Alert2, CircularProgress: CircularProgress4, Stack: Stack5, Chip: Chip6 } = getMaterialUI();
var EMPTY_PERMISOS = Object.freeze({});
function RoleHierarchyView(props) {
  const { nodes, roleEntries, canManagePermisos, canEditRoleDescriptions, initialSelectedRole, onSaveRolePermisos, canMutate, busy, onSave, onSaveLocalPerm, onPromote, onCreate, onDelete } = props;
  const [selectedJer, setSelectedJer] = useState7(null);
  const [editTarget, setEditTarget] = useState7(null);
  const [visitanteDraft, setVisitanteDraft] = useState7(null);
  const [visitanteSaving, setVisitanteSaving] = useState7(false);
  const [roleDraft, setRoleDraft] = useState7(null);
  const [roleSaving, setRoleSaving] = useState7(false);
  const currentEditNode = useMemo5(
    () => selectedJer ? nodes.find((n) => n.jerarquia === selectedJer) ?? null : null,
    [selectedJer, nodes]
  );
  const visitanteEntry = useMemo5(() => getVisitanteRoleEntry({ roles: roleEntries ?? [] }), [roleEntries]);
  const currentRoleEntry = useMemo5(() => {
    if (!currentEditNode) return null;
    const key = String(currentEditNode.iusuario ?? "").trim().toLowerCase();
    return (roleEntries ?? []).find((e) => roleNameFromEntry(e) === key) ?? { iusuario: key, permisos: EMPTY_PERMISOS, bactivo: true };
  }, [currentEditNode, roleEntries]);
  const visitantePermisosSig = useMemo5(
    () => JSON.stringify(visitanteEntry.permisos ?? EMPTY_PERMISOS),
    [visitanteEntry.permisos]
  );
  const rolePermisosSig = useMemo5(
    () => currentRoleEntry ? JSON.stringify(currentRoleEntry.permisos ?? EMPTY_PERMISOS) : "",
    [currentRoleEntry]
  );
  const roleEditorEntry = useMemo5(() => {
    if (!currentRoleEntry) return null;
    const permisos = roleDraft ?? currentRoleEntry.permisos ?? EMPTY_PERMISOS;
    return { ...currentRoleEntry, permisos };
  }, [currentRoleEntry, roleDraft]);
  useEffect7(() => {
    if (!initialSelectedRole || !nodes.length) return;
    const key = String(initialSelectedRole).trim().toLowerCase();
    const node = nodes.find((n) => String(n.iusuario ?? "").trim().toLowerCase() === key);
    if (node?.jerarquia) setSelectedJer((prev) => prev === node.jerarquia ? prev : node.jerarquia);
  }, [initialSelectedRole, nodes]);
  useEffect7(() => {
    if (!currentEditNode || !isVisitanteRole(currentEditNode.iusuario)) {
      setVisitanteDraft(null);
      return;
    }
    setVisitanteDraft(enforceVisitantePermisos(visitanteEntry.permisos ?? EMPTY_PERMISOS));
  }, [currentEditNode?.iusuario, currentEditNode?.jerarquia, visitantePermisosSig]);
  useEffect7(() => {
    if (!currentEditNode || isVisitanteRole(currentEditNode.iusuario)) {
      setRoleDraft(null);
      return;
    }
    setRoleDraft({ ...currentRoleEntry?.permisos ?? EMPTY_PERMISOS });
  }, [currentEditNode?.iusuario, currentEditNode?.jerarquia, rolePermisosSig, currentRoleEntry]);
  const openCreateDialog = useCallback3(() => {
    setEditTarget({
      isNew: true,
      node: { iusuario: "", jerarquia: "", namedisplay: null, descripcion: null }
    });
  }, []);
  const customs = useMemo5(
    () => createRoleHierarchyCustoms({
      items: nodes,
      canMutate,
      onSave,
      onDelete,
      onEdit: (node) => setEditTarget({ node, isNew: false }),
      onCreateClick: openCreateDialog
    }),
    [nodes, canMutate, onSave, onDelete, openCreateDialog]
  );
  const typedNodes = nodes;
  const countLabel = `${nodes.length} rol${nodes.length !== 1 ? "es" : ""}`;
  const manifest = useMemo5(() => ({ ...ROLE_HIERARCHY_MANIFEST, countLabel }), [countLabel]);
  const IsaSplitView = getIsaSplitView();
  const treePanel = /* @__PURE__ */ jsx11(
    TreeView,
    {
      items: typedNodes,
      manifest,
      customs,
      readonly: !canMutate,
      busy,
      selectedPath: selectedJer,
      onSelectedPathChange: setSelectedJer,
      toolbarTitle: "Jerarqu\xEDa de roles",
      className: "role-hierarchy-tree-panel",
      showToolbar: true
    }
  );
  const editorPanel = currentEditNode ? isVisitanteRole(currentEditNode.iusuario) ? /* @__PURE__ */ jsxs7(Box6, { className: "role-hierarchy-visitante-editor", sx: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "auto" }, children: [
    /* @__PURE__ */ jsxs7(Stack5, { direction: "row", alignItems: "center", spacing: 1, sx: { px: 2, pt: 2, pb: 1, flexShrink: 0 }, children: [
      /* @__PURE__ */ jsx11(Typography6, { variant: "h6", sx: { flex: 1 }, children: currentEditNode.namedisplay ?? "Visitante" }),
      /* @__PURE__ */ jsx11(Chip6, { size: "small", label: currentEditNode.jerarquia })
    ] }),
    /* @__PURE__ */ jsx11(Box6, { sx: { flex: 1, minHeight: 0, overflow: "auto", px: 2, pb: 2 }, children: /* @__PURE__ */ jsx11(
      RoleConfigEditor,
      {
        entry: visitanteEntry,
        roleName: "visitante",
        canManage: !!canManagePermisos,
        canEditRoleDescriptions: !!canEditRoleDescriptions,
        onChange: (permisos) => setVisitanteDraft(enforceVisitantePermisos(permisos))
      }
    ) }),
    (canManagePermisos || canEditRoleDescriptions) && onSaveRolePermisos ? /* @__PURE__ */ jsx11(Stack5, { direction: "row", justifyContent: "flex-end", spacing: 1, sx: { px: 2, py: 1.5, flexShrink: 0, borderTop: 1, borderColor: "divider" }, children: /* @__PURE__ */ jsx11(
      Button3,
      {
        variant: "contained",
        disabled: busy || visitanteSaving || !visitanteDraft,
        onClick: async () => {
          if (!visitanteDraft) return;
          setVisitanteSaving(true);
          try {
            await onSaveRolePermisos("visitante", visitanteDraft, visitanteEntry.bactivo !== false);
          } finally {
            setVisitanteSaving(false);
          }
        },
        sx: { textTransform: "none", fontWeight: 600 },
        children: visitanteSaving ? /* @__PURE__ */ jsx11(CircularProgress4, { size: 18, color: "inherit" }) : "Guardar visitante"
      }
    ) }) : null
  ] }) : /* @__PURE__ */ jsxs7(Box6, { className: "role-hierarchy-role-editor", sx: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "auto" }, children: [
    /* @__PURE__ */ jsxs7(Stack5, { direction: "row", alignItems: "center", spacing: 1, sx: { px: 2, pt: 2, pb: 1, flexShrink: 0 }, children: [
      /* @__PURE__ */ jsx11(Typography6, { variant: "h6", sx: { flex: 1 }, children: currentEditNode.namedisplay ?? currentEditNode.iusuario }),
      /* @__PURE__ */ jsx11(Chip6, { size: "small", label: currentEditNode.jerarquia })
    ] }),
    /* @__PURE__ */ jsx11(Box6, { sx: { flex: 1, minHeight: 0, overflow: "auto", px: 2, pb: 2 }, children: /* @__PURE__ */ jsx11(
      RoleConfigEditor,
      {
        entry: roleEditorEntry ?? { iusuario: currentEditNode.iusuario, permisos: EMPTY_PERMISOS, bactivo: true },
        roleName: currentEditNode.iusuario,
        canManage: !!canManagePermisos,
        canEditRoleDescriptions: !!canEditRoleDescriptions,
        onChange: (permisos) => setRoleDraft(permisos)
      }
    ) }),
    (canManagePermisos || canEditRoleDescriptions) && onSaveRolePermisos ? /* @__PURE__ */ jsx11(Stack5, { direction: "row", justifyContent: "flex-end", spacing: 1, sx: { px: 2, py: 1.5, flexShrink: 0, borderTop: 1, borderColor: "divider" }, children: /* @__PURE__ */ jsx11(
      Button3,
      {
        variant: "contained",
        disabled: busy || roleSaving || !roleDraft,
        onClick: async () => {
          if (!roleDraft) return;
          setRoleSaving(true);
          try {
            await onSaveRolePermisos(currentEditNode.iusuario, roleDraft, currentRoleEntry?.bactivo !== false);
          } finally {
            setRoleSaving(false);
          }
        },
        sx: { textTransform: "none", fontWeight: 600 },
        children: roleSaving ? /* @__PURE__ */ jsx11(CircularProgress4, { size: 18, color: "inherit" }) : "Guardar rol"
      }
    ) }) : null
  ] }) : /* @__PURE__ */ jsxs7(Box6, { sx: { p: 4, textAlign: "center", color: "text.secondary", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }, children: [
    /* @__PURE__ */ jsx11("iconify-icon", { icon: "mdi:family-tree", width: "48", height: "48" }),
    /* @__PURE__ */ jsx11(Typography6, { variant: "body1", sx: { mt: 2 }, children: "Selecciona un rol del \xE1rbol \u2014 visitante incluye editor de permisos completo." }),
    !canMutate ? /* @__PURE__ */ jsx11(Typography6, { variant: "caption", color: "text.secondary", sx: { display: "block", mt: 1 }, children: "(Solo roles de branch 0 pueden editar la jerarqu\xEDa.)" }) : null
  ] });
  return /* @__PURE__ */ jsxs7(Box6, { className: "role-hierarchy-tree isp-tree-host", sx: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }, children: [
    /* @__PURE__ */ jsx11(
      IsaSplitView,
      {
        className: "role-hierarchy-split",
        sx: { flex: 1, minHeight: 0 },
        panelClassName: "role-hierarchy-tree-panel",
        storageKey: "isa-patyia:role-hierarchy-tree-w",
        defaultWidth: 360,
        minWidth: 260,
        maxWidth: 560,
        panelTitle: "Jerarqu\xEDa de roles",
        panelIcon: "mdi:family-tree",
        UI,
        panel: treePanel,
        children: /* @__PURE__ */ jsx11(Box6, { className: "role-hierarchy-editor-panel", sx: { flex: 1, minWidth: 0, minHeight: 0, overflow: "auto", height: "100%" }, children: editorPanel })
      }
    ),
    /* @__PURE__ */ jsx11(
      HierarchyEditDialog,
      {
        target: editTarget,
        busy,
        onClose: () => setEditTarget(null),
        onSave: async (name, jer) => {
          if (editTarget?.isNew) await onCreate(name, jer);
          else if (editTarget) await onSave(editTarget.node.iusuario, jer);
          setEditTarget(null);
        }
      }
    )
  ] });
}
function HierarchyEditDialog({ target, busy, onClose, onSave }) {
  const isNew = target?.isNew ?? false;
  const [name, setName] = useState7(target?.node.iusuario ?? "");
  const [jerarquia, setJerarquia] = useState7(isNew ? "" : target?.node.jerarquia ?? "");
  const [err, setErr] = useState7("");
  React2.useEffect(() => {
    setName(target?.node.iusuario ?? "");
    setJerarquia(isNew ? "" : target?.node.jerarquia ?? "");
    setErr("");
  }, [target, isNew]);
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
    /* @__PURE__ */ jsx11(DialogTitle, { children: isNew ? "Nuevo rol" : `Mover ${target.node.iusuario}` }),
    /* @__PURE__ */ jsx11(DialogContent3, { dividers: true, children: /* @__PURE__ */ jsxs7(Stack5, { spacing: 2, children: [
      err ? /* @__PURE__ */ jsx11(Alert2, { severity: "error", children: err }) : null,
      /* @__PURE__ */ jsx11(TextField4, { label: "Nombre", value: name, onChange: (e) => setName(e.target.value), disabled: !isNew, helperText: "min\xFAsculas, sin espacios (ej. dev_lead)" }),
      /* @__PURE__ */ jsx11(TextField4, { label: "Nueva jerarqu\xEDa", value: jerarquia, onChange: (e) => setJerarquia(e.target.value), helperText: "dot-notation: 0, 0.0, 0.1.1, ..." }),
      /* @__PURE__ */ jsx11(Alert2, { severity: "info", children: "Los ancestros se derivan del path. Arrastra un rol sobre otro (antes / dentro / despu\xE9s) para reubicarlo." })
    ] }) }),
    /* @__PURE__ */ jsxs7(DialogActions2, { children: [
      /* @__PURE__ */ jsx11(Button3, { onClick: onClose, disabled: busy, children: "Cancelar" }),
      /* @__PURE__ */ jsx11(Button3, { variant: "contained", onClick: handleSubmit, disabled: busy, children: busy ? /* @__PURE__ */ jsx11(CircularProgress4, { size: 16 }) : "Guardar" })
    ] })
  ] });
}

// ../../Personal/apps/isa-patyia/frontend/js/tools/roleHierarchyTree/RolePermissionsEditor.tsx
import { Fragment as Fragment6, jsx as jsx12, jsxs as jsxs8 } from "react/jsx-runtime";
var { useState: useState8, useMemo: useMemo6, useCallback: useCallback4, useEffect: useEffect8 } = getReact();
var { Box: Box7, Stack: Stack6, Typography: Typography7, Breadcrumbs, Link, Chip: Chip7, IconButton: IconButton4, Tooltip: Tooltip5, Button: Button4, TextField: TextField5, Alert: Alert3, CircularProgress: CircularProgress5 } = getMaterialUI();
var { Icon: Icon3 } = UI;

// ../../Personal/apps/isa-patyia/frontend/js/tools/roleHierarchyTree/hierarchyFromRoles.ts
function hierarchyNodesFromRoleEntries(roleEntries) {
  const out = [];
  for (const e of roleEntries ?? []) {
    const iusuario = roleNameFromEntry(e);
    if (!iusuario) continue;
    const permisos = e.permisos && typeof e.permisos === "object" ? e.permisos : {};
    const jerarquia = getRoleJerarquia(iusuario, permisos);
    if (!jerarquia) continue;
    out.push({
      iusuario,
      jerarquia,
      namedisplay: roleTitleFromEntry(e) || null,
      descripcion: roleDescripcionFromEntry(e) || null,
      bactivo: e.bactivo !== false
    });
  }
  return out;
}

// ../../Personal/apps/isa-patyia/frontend/js/tools/UserPermissionsSummaryDialog.jsx
import { Fragment as Fragment7, jsx as jsx13, jsxs as jsxs9 } from "react/jsx-runtime";
var { Typography: Typography8, Stack: Stack7, Box: Box8, Chip: Chip8, Divider: Divider2, CircularProgress: CircularProgress6 } = getMaterialUI();
var { useMemo: useMemo7 } = getReact();
var ROLE_KEYS_OMIT = /* @__PURE__ */ new Set(["descripcion", "namedisplay", "roles", "jerarquia", "accent", "color", "icon"]);
function getRoleEntry(roles, roleName) {
  const key = String(roleName ?? "").trim().toLowerCase();
  return (roles ?? []).find((r) => String(r?.iusuario ?? "").trim().toLowerCase().replace(/^role:/i, "") === key) ?? null;
}
function activeRoles(roles) {
  return (roles ?? []).filter((r) => r?.itipo !== "user" && r?.bactivo !== false);
}
function chainForRole(roles, roleName) {
  const entry = getRoleEntry(roles, roleName);
  if (!entry) return { name: roleName, jerarquia: null, ancestors: [] };
  const jerarquia = getRoleJerarquia(roleName, entry.permisos);
  const ancestorPaths = ancestorsFromPath(jerarquia).slice(1);
  const ancestors = ancestorPaths.map((p) => ({ jerarquia: p, entry: getRoleEntry(roles, p) })).filter((a) => a.entry && a.entry.bactivo !== false);
  return { name: roleName, jerarquia, ancestors };
}
function permissionValue(v) {
  if (v === true) return "allow";
  if (v && typeof v === "object") {
    if (Array.isArray(v.fixFilter)) {
      return { kind: "fixFilter", value: v.fixFilter };
    }
    if (v.fixFilter && typeof v.fixFilter === "object") {
      return { kind: "fixFilter", value: v.fixFilter };
    }
    return { kind: "object", value: v };
  }
  return { kind: "other", value: v };
}
function summarizePerms(perms) {
  const allows = [];
  const fixFilters = [];
  const others = [];
  for (const [k, v] of Object.entries(perms ?? {})) {
    if (ROLE_KEYS_OMIT.has(k)) continue;
    if (k.startsWith("__") || k === "*") {
      if (k === "*" && v === true) allows.unshift("*");
      continue;
    }
    const pv = permissionValue(v);
    if (pv === "allow") allows.push(k);
    else if (pv.kind === "fixFilter") fixFilters.push({ key: k, filter: pv.value });
    else others.push({ key: k, value: pv.value });
  }
  return { allows, fixFilters, others };
}
function ChipChain({ chain, roles }) {
  return /* @__PURE__ */ jsxs9(Stack7, { direction: "row", spacing: 0.5, alignItems: "center", flexWrap: "wrap", useFlexGap: true, children: [
    chain.ancestors.map((anc) => /* @__PURE__ */ jsxs9(Box8, { sx: { display: "inline-flex", alignItems: "center" }, children: [
      /* @__PURE__ */ jsx13(Chip8, { size: "small", variant: "outlined", label: roleTitleFromEntry(anc.entry) || anc.entry.iusuario, sx: { fontFamily: "monospace", fontSize: 11 }, title: `Jerarqu\xEDa ${anc.jerarquia}` }),
      /* @__PURE__ */ jsx13(Box8, { component: "span", sx: { mx: 0.5, opacity: 0.6 }, children: "\u203A" })
    ] }, anc.jerarquia)),
    /* @__PURE__ */ jsx13(
      Chip8,
      {
        size: "small",
        color: "primary",
        label: roleTitleFromEntry(getRoleEntry(roles, chain.name)) || chain.name,
        sx: { fontFamily: "monospace", fontSize: 11, fontWeight: 700 },
        title: `Jerarqu\xEDa ${chain.jerarquia}`
      }
    )
  ] });
}
function RoleCard({ chain, roles }) {
  return /* @__PURE__ */ jsx13(Box8, { className: "isa-glass-card paty-permisos-summary__role", sx: { p: 1.25, borderRadius: 1.5 }, children: /* @__PURE__ */ jsxs9(Stack7, { spacing: 0.75, children: [
    /* @__PURE__ */ jsxs9(Stack7, { direction: "row", alignItems: "center", spacing: 0.75, children: [
      /* @__PURE__ */ jsx13(Typography8, { variant: "subtitle2", fontWeight: 700, title: `${chain.name} \xB7 jerarqu\xEDa ${chain.jerarquia}`, children: chain.name }),
      /* @__PURE__ */ jsx13(Typography8, { variant: "caption", color: "text.secondary", sx: { fontFamily: "monospace" }, children: chain.jerarquia })
    ] }),
    /* @__PURE__ */ jsx13(ChipChain, { chain, roles })
  ] }) });
}
function PermList({ title, items, kind }) {
  if (!items.length) return null;
  return /* @__PURE__ */ jsxs9(Box8, { sx: { mt: 1 }, children: [
    /* @__PURE__ */ jsxs9(Typography8, { variant: "overline", color: "text.secondary", sx: { letterSpacing: 1 }, children: [
      title,
      " (",
      items.length,
      ")"
    ] }),
    /* @__PURE__ */ jsxs9(Box8, { sx: { display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }, children: [
      items.slice(0, kind === "fixFilter" ? 50 : 100).map((it, i) => {
        if (kind === "fixFilter") {
          const ffSummary = Object.entries(it.filter ?? {}).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(", ");
          return /* @__PURE__ */ jsx13(
            Chip8,
            {
              size: "small",
              variant: "outlined",
              color: "warning",
              label: `${it.key} \xB7 ${ffSummary}`,
              title: `${it.key} \u2014 restringido a: ${ffSummary}`,
              sx: { fontFamily: "monospace", fontSize: 11 }
            },
            `${it.key}-${i}`
          );
        }
        if (kind === "allow") {
          return /* @__PURE__ */ jsx13(
            Chip8,
            {
              size: "small",
              color: "success",
              variant: "outlined",
              label: it,
              title: it,
              sx: { fontFamily: "monospace", fontSize: 11 }
            },
            it
          );
        }
        return /* @__PURE__ */ jsx13(
          Chip8,
          {
            size: "small",
            variant: "outlined",
            label: `${it.key} \u2192 ${JSON.stringify(it.value)}`,
            title: it.key,
            sx: { fontFamily: "monospace", fontSize: 11 }
          },
          `${it.key}-${i}`
        );
      }),
      items.length > (kind === "fixFilter" ? 50 : 100) ? /* @__PURE__ */ jsx13(Chip8, { size: "small", label: `+${items.length - (kind === "fixFilter" ? 50 : 100)} m\xE1s`, sx: { fontFamily: "monospace", fontSize: 11 } }) : null
    ] })
  ] });
}
function UserPermissionsSummaryDialog({ open, onClose, username, users, roles }) {
  const data = useMemo7(() => {
    if (!open || !username) return null;
    const targetUser = (users ?? []).find((u) => String(u?.iusuario ?? "").trim().toUpperCase() === username.toUpperCase());
    if (!targetUser) return null;
    const active = activeRoles(roles);
    const directRoles = userRoles(targetUser.permisos);
    const chains = directRoles.map((rn) => chainForRole(active, rn));
    const { allows, fixFilters, others } = summarizePerms(targetUser.permisos);
    return { targetUser, chains, activeRoles: active, allows, fixFilters, others };
  }, [open, username, users, roles]);
  return /* @__PURE__ */ jsxs9(
    GlassDialog,
    {
      open,
      onClose,
      maxWidth: "md",
      fullWidth: true,
      paperClassName: "permisos-user-summary-dialog",
      header: /* @__PURE__ */ jsx13(
        GlassDialogHeader,
        {
          icon: "mdi:shield-account-outline",
          title: `Resumen de permisos \u2014 ${username || ""}`,
          subtitle: "Solo lectura \xB7 composici\xF3n en cliente \xB7 incluye cadena de roles y permisos efectivos",
          accent: "#1e90ff",
          onClose
        }
      ),
      children: [
        /* @__PURE__ */ jsx13(Box8, { sx: { ...glassDialogContentSx(), minHeight: 360 }, children: !username ? /* @__PURE__ */ jsx13(Typography8, { color: "text.secondary", children: "Sin usuario seleccionado." }) : !data ? /* @__PURE__ */ jsxs9(Stack7, { direction: "row", spacing: 1.5, alignItems: "center", children: [
          /* @__PURE__ */ jsx13(CircularProgress6, { size: 20 }),
          /* @__PURE__ */ jsx13(Typography8, { color: "text.secondary", children: "Usuario no encontrado en los datos cargados." })
        ] }) : /* @__PURE__ */ jsxs9(Fragment7, { children: [
          /* @__PURE__ */ jsxs9(Box8, { children: [
            /* @__PURE__ */ jsx13(Typography8, { variant: "overline", color: "text.secondary", children: "Usuario" }),
            /* @__PURE__ */ jsx13(Typography8, { variant: "h6", fontWeight: 700, children: data.targetUser.iusuario }),
            data.targetUser.permisos?.nombre || data.targetUser.permisos?.namedisplay ? /* @__PURE__ */ jsx13(Typography8, { variant: "body2", color: "text.secondary", children: data.targetUser.permisos.nombre || data.targetUser.permisos.namedisplay }) : null
          ] }),
          /* @__PURE__ */ jsx13(Divider2, { sx: { my: 1.5 } }),
          /* @__PURE__ */ jsxs9(Typography8, { variant: "overline", color: "text.secondary", children: [
            "Cadena de roles ",
            data.chains.length ? `(${data.chains.length})` : ""
          ] }),
          data.chains.length === 0 ? /* @__PURE__ */ jsx13(Typography8, { variant: "body2", color: "text.secondary", sx: { mt: 0.5 }, children: "El usuario no tiene roles asignados. Permisos efectivos = visitante por defecto." }) : /* @__PURE__ */ jsx13(Stack7, { spacing: 1, sx: { mt: 1 }, children: data.chains.map((c) => /* @__PURE__ */ jsx13(RoleCard, { chain: c, roles: data.activeRoles }, c.name)) }),
          /* @__PURE__ */ jsx13(Divider2, { sx: { my: 1.5 } }),
          /* @__PURE__ */ jsx13(Typography8, { variant: "overline", color: "text.secondary", children: "Permisos efectivos del usuario" }),
          /* @__PURE__ */ jsx13(Typography8, { variant: "caption", color: "text.secondary", sx: { display: "block", mt: 0.25 }, children: "Calculados a partir de sus roles directos m\xE1s la herencia por path jer\xE1rquico, replicando el merge del backend." }),
          data.allows.length === 0 && data.fixFilters.length === 0 && data.others.length === 0 ? /* @__PURE__ */ jsx13(Typography8, { variant: "body2", color: "text.secondary", sx: { mt: 1 }, children: "Sin permisos materializados m\xE1s all\xE1 del visitante por defecto." }) : /* @__PURE__ */ jsxs9(Fragment7, { children: [
            /* @__PURE__ */ jsx13(PermList, { title: "Permitidos", items: data.allows, kind: "allow" }),
            /* @__PURE__ */ jsx13(PermList, { title: "Con filtro fijo", items: data.fixFilters, kind: "fixFilter" }),
            /* @__PURE__ */ jsx13(PermList, { title: "Otros", items: data.others, kind: "other" })
          ] }),
          /* @__PURE__ */ jsx13(Divider2, { sx: { my: 1.5 } }),
          /* @__PURE__ */ jsx13(Typography8, { variant: "caption", color: "text.secondary", children: "Los detalles completos por rol se obtienen al abrir cada columna en la jerarqu\xEDa. Este resumen es de solo lectura y se actualiza al recargar el panel." })
        ] }) }),
        /* @__PURE__ */ jsx13(Box8, { sx: glassDialogActionsSx(), children: /* @__PURE__ */ jsx13(
          "button",
          {
            type: "button",
            className: "MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-textPrimary MuiButton-sizeMedium MuiButton-colorPrimary",
            onClick: onClose,
            children: "Cerrar"
          }
        ) })
      ]
    }
  );
}

// ../../Personal/apps/isa-patyia/frontend/js/core/urlState.ts
var STATE_VERSION = 1;
function normalizeLog(raw) {
  if (!raw || typeof raw !== "object") return {};
  const o = { ...raw };
  const w = Number(o.sidebarW);
  if (Number.isFinite(w) && w > 0) o.sidebarW = Math.round(w);
  else delete o.sidebarW;
  return o;
}
function initial() {
  return { v: STATE_VERSION, tool: "log", log: {}, prompts: {}, chat: {}, todos: {}, config: {} };
}
function normalizeTool(raw) {
  if (raw === "prompts") return "prompts";
  if (raw === "chat") return "chat";
  if (raw === "todos") return "todos";
  if (raw === "config") return "config";
  return "log";
}
function normalizeChatBag(chat) {
  const bag = chat && typeof chat === "object" ? { ...chat } : {};
  if ((bag.mode == null || String(bag.mode).trim() === "") && bag.jailbreak != null) {
    bag.mode = bag.jailbreak === true ? "libre" : "patyia";
    delete bag.jailbreak;
  } else if (bag.jailbreak != null) {
    delete bag.jailbreak;
  }
  return bag;
}
function normalize(raw, _prev) {
  if (!raw || typeof raw !== "object") return initial();
  const tool = normalizeTool(raw.tool);
  const chat = normalizeChatBag(raw.chat);
  const todos = raw.todos && typeof raw.todos === "object" ? raw.todos : {};
  const config = raw.config && typeof raw.config === "object" ? raw.config : {};
  return {
    v: raw.v ?? STATE_VERSION,
    tool,
    log: normalizeLog(raw.log),
    prompts: raw.prompts && typeof raw.prompts === "object" ? raw.prompts : {},
    chat,
    todos,
    config
  };
}
function slimForUrl(src) {
  const slim = { ...src };
  const log = slim.log;
  if (log) {
    const nextLog = { ...log };
    if (nextLog.jsonInput && String(nextLog.jsonInput).length > 4e3) {
      slim.log = {
        convId: nextLog.convId || "",
        ...nextLog.sidebarW != null ? { sidebarW: nextLog.sidebarW } : {}
      };
    } else {
      slim.log = nextLog;
    }
  }
  const prompts = slim.prompts;
  if (prompts?.bodies) {
    const bodies = {};
    let total = 0;
    for (const [k, v] of Object.entries(prompts.bodies)) {
      const t = String(v ?? "");
      if (total + t.length > 6e3) break;
      bodies[k] = t;
      total += t.length;
    }
    slim.prompts = { ...prompts, bodies };
  }
  return slim;
}
function mergeConfig(state, partial) {
  const prev = state.config && typeof state.config === "object" ? { ...state.config } : {};
  const next = partial && typeof partial === "object" ? partial : {};
  const prevPermisos = prev.permisos && typeof prev.permisos === "object" ? { ...prev.permisos } : {};
  const nextPermisos = next.permisos && typeof next.permisos === "object" ? next.permisos : null;
  return {
    ...prev,
    ...next,
    ...nextPermisos ? { permisos: { ...prevPermisos, ...nextPermisos } } : {}
  };
}
function merge(state, partial) {
  const nextLog = { ...state.log, ...partial.log || {} };
  if ("jsonInput" in nextLog) delete nextLog.jsonInput;
  return {
    ...state,
    ...partial,
    log: nextLog,
    prompts: {
      ...state.prompts,
      ...partial.prompts || {}
    },
    chat: {
      ...state.chat,
      ...partial.chat || {}
    },
    todos: {
      ...state.todos,
      ...partial.todos || {}
    },
    config: mergeConfig(state, partial.config)
  };
}
var URL_STATE_PARAM = "s";
function stripUrlStateParam() {
  try {
    const url = new URL(location.href);
    if (!url.searchParams.has(URL_STATE_PARAM)) return;
    url.searchParams.delete(URL_STATE_PARAM);
    history.replaceState(null, "", url);
  } catch {
  }
}
function migrateLegacyFlatQuery() {
  if (typeof window === "undefined" || !window.ISAFront?.b64urlEncode) return;
  try {
    const url = new URL(location.href);
    if (url.searchParams.has(URL_STATE_PARAM)) return;
    const tool = url.searchParams.get("tool");
    const legacyKeys = [...url.searchParams.keys()].filter(
      (k) => k === "tool" || k === "local" || k.includes(".")
    );
    if (!legacyKeys.length) return;
    const next = {
      v: STATE_VERSION,
      tool: normalizeTool(tool),
      log: {},
      prompts: {},
      chat: {},
      todos: {},
      config: {}
    };
    for (const [key, raw] of url.searchParams.entries()) {
      if (key === "tool" || key === "local") continue;
      const dot = key.indexOf(".");
      if (dot < 0) continue;
      const section = key.slice(0, dot);
      const field = key.slice(dot + 1);
      if (section !== "log" && section !== "prompts" && section !== "chat" && section !== "todos") continue;
      const bag = next[section] || {};
      if (field === "convId" && (section === "chat" || section === "log")) {
        const n = Number(raw);
        bag.convId = Number.isFinite(n) && n > 0 ? n : String(raw ?? "").trim();
      } else if (field === "mode") {
        bag.mode = String(raw ?? "").trim().toLowerCase() || "patyia";
      } else if (field === "jailbreak") {
        bag.mode = raw === "1" || raw === "true" ? "libre" : "patyia";
      } else if (field === "boardId" || field === "milestoneId" || field === "taskId") {
        const n = Number(raw);
        if (Number.isFinite(n) && n > 0) bag[field] = n;
      } else {
        bag[field] = raw;
      }
      next[section] = bag;
    }
    legacyKeys.forEach((k) => url.searchParams.delete(k));
    const slim = slimForUrl(next);
    const json = JSON.stringify(slim);
    if (json !== "{}") url.searchParams.set(URL_STATE_PARAM, window.ISAFront.b64urlEncode(json));
    history.replaceState(null, "", url);
  } catch {
  }
}
migrateLegacyFlatQuery();
var urlState = window.ISAFront.createUrlState({
  param: URL_STATE_PARAM,
  debounceMs: 350,
  maxB64Len: 12e3,
  historyKey: "patyAppState",
  initial,
  normalize,
  slimForUrl,
  merge,
  onInit() {
    ensureIssLocalDefault();
  },
  brandHomeReset(api) {
    const snap = api.reset();
    stripUrlStateParam();
    return snap;
  }
});
var bootState = urlState.boot;
var getSnapshot = urlState.getSnapshot;
var mergePartial = urlState.mergePartial;
var hrefFor = urlState.hrefFor;
var subscribe = urlState.subscribe;
var PARAM = urlState.PARAM;
function configPermisosBag(snap) {
  const cfg = (snap ?? getSnapshot()).config;
  const permisos = cfg?.permisos;
  return permisos && typeof permisos === "object" ? permisos : void 0;
}
function readPermisosHideEmptyFromUrl() {
  return configPermisosBag()?.hideEmpty === true;
}
function persistPermisosHideEmpty(hide) {
  const prev = configPermisosBag()?.hideEmpty === true;
  if (prev === hide) return getSnapshot();
  return mergePartial({ tool: "config", config: { permisos: { hideEmpty: !!hide } } });
}

// ../../Personal/apps/isa-patyia/frontend/js/tools/PermisosPanel.jsx
import { jsx as jsx14, jsxs as jsxs10 } from "react/jsx-runtime";
var { useState: useState9, useEffect: useEffect9, useCallback: useCallback5, useMemo: useMemo8, useRef: useRef4 } = getReact();
var { Typography: Typography9, TextField: TextField6, Stack: Stack8, Alert: Alert4, CircularProgress: CircularProgress7, Box: Box9, Chip: Chip9, DialogContent: DialogContent4, DialogActions: DialogActions3, Button: Button5, FormControlLabel: FormControlLabel2, Switch } = getMaterialUI();
function PermisosPanel({ onNeedLogin }) {
  const [loading, setLoading] = useState9(true);
  const [busy, setBusy] = useState9(false);
  const [canManage, setCanManage] = useState9(false);
  const [canAssignUserRoles, setCanAssignUserRoles] = useState9(false);
  const [canEditRoleDescriptions, setCanEditRoleDescriptions] = useState9(false);
  const [authTick, setAuthTick] = useState9(0);
  const loggedIn = useMemo8(() => !!Session?.isLoggedIn?.(), [authTick]);
  const sessionUsername = useMemo8(() => String(Session.username?.() ?? "").trim().toUpperCase(), [authTick]);
  const [err, setErr] = useState9("");
  const [data, setData] = useState9({ roles: [], users: [] });
  const [userSearch, setUserSearch] = useState9("");
  const [roleFilters, setRoleFilters] = useState9([]);
  const [hideEmptyStacks, setHideEmptyStacks] = useState9(readPermisosHideEmptyFromUrl);
  const [filterBusy, setFilterBusy] = useState9(false);
  const [dragOverFilter, setDragOverFilter] = useState9(false);
  const [actorJerarquia, setActorJerarquia] = useState9(null);
  const [actorJerarquias, setActorJerarquias] = useState9([]);
  const [hierarchyOpen, setHierarchyOpen] = useState9(false);
  const [hierarchyFocusRole, setHierarchyFocusRole] = useState9(null);
  const [hierarchyNodes, setHierarchyNodes] = useState9([]);
  const [hierarchyBusy, setHierarchyBusy] = useState9(false);
  const [summaryUsername, setSummaryUsername] = useState9(null);
  const filterToolbarRef = useRef4(null);
  const filterFetchSkipRef = useRef4(true);
  const filterDropFetchRef = useRef4(false);
  const rolesRef = useRef4(data.roles);
  const usersRef = useRef4(data.users);
  const hierarchyLoadRef = useRef4(null);
  rolesRef.current = data.roles;
  usersRef.current = data.users;
  const usersPaginated = !!data.usersTruncated;
  const applyFlags = useCallback5((result) => {
    setCanManage(!!result.canManage);
    setCanAssignUserRoles(!!result.canAssignUserRoles);
    setCanEditRoleDescriptions(!!result.canEditRoleDescriptions);
    const actorRoles = Array.isArray(result.actorRoles) ? result.actorRoles : Array.isArray(Session?.roles) ? Session.roles : [];
    const rolePermisosIdx = buildRolePermisosIndex(Array.isArray(result.roles) ? result.roles : []);
    setActorJerarquias(actorJerarquiasFromRoles(actorRoles, rolePermisosIdx));
    setActorJerarquia(actorJerarquiaFromRoles(actorRoles, rolePermisosIdx));
  }, []);
  const load = useCallback5(async () => {
    setLoading(true);
    setErr("");
    try {
      const result = await fetchPermisos();
      if (!Array.isArray(result.roles) || result.roles.length === 0) {
        throw new Error("ISS no devolvi\xF3 roles activos. Verifique modo Local (ISS :8802) o recargue tras iniciar func start.");
      }
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
  const refreshPermisos = useCallback5(async () => {
    const result = await fetchPermisos();
    if (!Array.isArray(result.roles) || result.roles.length === 0) {
      throw new Error("ISS no devolvi\xF3 roles activos. Verifique modo Local (ISS :8802) o recargue tras iniciar func start.");
    }
    setData(result);
    applyFlags(result);
    return result;
  }, [applyFlags]);
  const loadHierarchy = useCallback5(async (fallbackRoles = rolesRef.current) => {
    if (hierarchyLoadRef.current) return hierarchyLoadRef.current;
    setHierarchyBusy(true);
    const task = (async () => {
      try {
        const r = await fetchHierarchy();
        let nodes = Array.isArray(r.roles) ? r.roles : [];
        if (!nodes.length) nodes = hierarchyNodesFromRoleEntries(fallbackRoles);
        setHierarchyNodes(nodes);
      } catch (e) {
        const nodes = hierarchyNodesFromRoleEntries(fallbackRoles);
        setHierarchyNodes(nodes);
        if (!nodes.length) {
          toastError?.((e instanceof Error ? e.message : String(e)) ?? "Error cargando jerarqu\xEDa");
        }
      } finally {
        setHierarchyBusy(false);
        hierarchyLoadRef.current = null;
      }
    })();
    hierarchyLoadRef.current = task;
    return task;
  }, []);
  const openHierarchyDialog = useCallback5(() => {
    setHierarchyFocusRole(null);
    setHierarchyOpen(true);
  }, []);
  const openHierarchyForRole = useCallback5((roleName) => {
    const id = String(roleName ?? "").trim().toLowerCase();
    if (!id) return;
    setHierarchyFocusRole(id);
    setHierarchyOpen(true);
  }, []);
  useEffect9(() => {
    if (!hierarchyOpen) return void 0;
    void loadHierarchy(rolesRef.current);
    return void 0;
  }, [hierarchyOpen, loadHierarchy]);
  const handleHierarchySave = useCallback5(async (name, jerarquia) => {
    setHierarchyBusy(true);
    try {
      await updateHierarchyRole(name, { jerarquia });
      await loadHierarchy(rolesRef.current);
      await refreshPermisos();
      toastSuccess?.(`Rol ${name} actualizado`);
    } finally {
      setHierarchyBusy(false);
    }
  }, [loadHierarchy, refreshPermisos]);
  const handleHierarchyCreate = useCallback5(async (name, jerarquia) => {
    setHierarchyBusy(true);
    try {
      await createHierarchyRole({ name, jerarquia });
      await loadHierarchy(rolesRef.current);
      await refreshPermisos();
      toastSuccess?.(`Rol ${name} creado`);
    } finally {
      setHierarchyBusy(false);
    }
  }, [loadHierarchy, refreshPermisos]);
  const handleHierarchyPromote = useCallback5(async (key, value, fromJer, toJer) => {
    setHierarchyBusy(true);
    try {
      throw new Error(`Promover permisos entre roles a\xFAn no soportado en backend (${fromJer} \u2192 ${toJer})`);
    } finally {
      setHierarchyBusy(false);
    }
  }, []);
  const handleHierarchyLocalPerm = useCallback5(async (nodeJer, key, value) => {
    setHierarchyBusy(true);
    try {
      throw new Error(`Edici\xF3n de permisos individuales a\xFAn no soportada en backend (${nodeJer}: ${key})`);
    } finally {
      setHierarchyBusy(false);
    }
  }, []);
  const handleHierarchyDelete = useCallback5(async (name) => {
    setHierarchyBusy(true);
    try {
      await deleteHierarchyRole(name);
      await loadHierarchy(rolesRef.current);
      await refreshPermisos();
      toastSuccess?.(`Rol ${name} eliminado`);
    } finally {
      setHierarchyBusy(false);
    }
  }, [loadHierarchy, refreshPermisos]);
  const loadRef = useRef4(load);
  loadRef.current = load;
  useEffect9(() => {
    loadRef.current();
  }, []);
  useEffect9(() => subscribe((snap) => {
    const permisos = snap.config?.permisos;
    const hide = permisos && typeof permisos === "object" && permisos.hideEmpty === true;
    setHideEmptyStacks((prev) => prev === hide ? prev : hide);
  }), []);
  const setHideEmptyStacksPersist = useCallback5((hide) => {
    setHideEmptyStacks(hide);
    persistPermisosHideEmpty(hide);
  }, []);
  const userDirectory = useMemo8(() => buildUserDirectoryFromPermisos(data.users), [data.users]);
  useEffect9(() => {
    Assets.ensureTodosCss();
    const onAuth = () => {
      setAuthTick((t) => t + 1);
      loadRef.current();
    };
    window.addEventListener(Session.EVENT, onAuth);
    window.addEventListener("isa-patyia:auth", onAuth);
    return () => {
      window.removeEventListener(Session.EVENT, onAuth);
      window.removeEventListener("isa-patyia:auth", onAuth);
    };
  }, []);
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
  const handleRoleRemove = useCallback5(async ({ username, role, roleTitle }) => {
    if (!requireAppSession(onNeedLogin)) throw new Error("Sesi\xF3n requerida");
    if (!canAssignUserRoles) throw new Error("Sin permiso para mover usuarios entre roles");
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
  }, [onNeedLogin, applyFlags, canAssignUserRoles]);
  const handleRoleAdd = useCallback5(async ({ username, role, roleTitle }) => {
    if (!requireAppSession(onNeedLogin)) throw new Error("Sesi\xF3n requerida");
    if (!canAssignUserRoles) throw new Error("Sin permiso para mover usuarios entre roles");
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
  }, [onNeedLogin, applyFlags, canAssignUserRoles]);
  const handleRoleDrag = useCallback5(async ({ username, fromRole, toRole, mode }) => {
    if (!requireAppSession(onNeedLogin)) throw new Error("Sesi\xF3n requerida");
    if (!canAssignUserRoles) throw new Error("Sin permiso para mover usuarios entre roles");
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
  }, [onNeedLogin, applyFlags, canAssignUserRoles]);
  const fetchPermisosWithSearch = useCallback5(async (search) => {
    const q = String(search ?? "").trim();
    return fetchPermisos(q ? { search: q } : void 0);
  }, []);
  const handleUserFilterDrop = useCallback5(async (username) => {
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
  const handleRoleFilterDrop = useCallback5((roleId) => {
    const id = String(roleId ?? "").trim().toLowerCase();
    if (!id) return;
    setRoleFilters((prev) => prev.includes(id) ? prev : [...prev, id]);
  }, []);
  const clearFilters = useCallback5(async () => {
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
  useEffect9(() => {
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
  }, [userSearch, usersPaginated, fetchPermisosWithSearch]);
  const roleOptions = useMemo8(
    () => (data.roles || []).map((r) => ({ id: roleNameFromEntry(r), label: roleTitleFromEntry(r) })).filter((r) => r.id && r.id !== VISITANTE),
    [data.roles]
  );
  const boardData = useMemo8(
    () => buildPermisosBoard(data, { userSearch, roleFilters, userDirectory, hideEmptyColumns: hideEmptyStacks }),
    [data, userSearch, roleFilters, userDirectory, hideEmptyStacks]
  );
  const readOnly = !canAssignUserRoles;
  const managePermisos = canManage;
  const editRoleMeta = canEditRoleDescriptions || canManage;
  const filtersActive = !!(userSearch.trim() || roleFilters.length);
  const { GlassToolbar } = getGlass();
  const handleSaveRolePermisos = useCallback5(async (name, permisos, bactivo) => {
    if (!editRoleMeta || !requireAppSession(onNeedLogin)) return;
    setBusy(true);
    setErr("");
    try {
      const result = await putPermisoRolePath(name, permisos, managePermisos ? bactivo : void 0);
      await loadHierarchy(rolesRef.current);
      setData(result);
      applyFlags(result);
      toastSuccess(`Rol ${name} guardado`);
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      toastError(msg);
      throw e;
    } finally {
      setBusy(false);
    }
  }, [editRoleMeta, onNeedLogin, managePermisos, applyFlags, loadHierarchy]);
  if (loading && !hierarchyOpen) {
    return /* @__PURE__ */ jsx14(Box9, { className: "config-permisos-loading", children: /* @__PURE__ */ jsx14(CircularProgress7, { size: 26 }) });
  }
  return /* @__PURE__ */ jsxs10(Box9, { className: "paty-permisos-shell", sx: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }, children: [
    /* @__PURE__ */ jsx14(Box9, { ref: filterToolbarRef, className: "config-permisos-toolbar-wrap", sx: { flexShrink: 0 }, children: /* @__PURE__ */ jsxs10(GlassToolbar, { className: `config-permisos-toolbar${dragOverFilter ? " config-permisos-toolbar--filter-drop" : ""}`, sx: { borderRadius: 0, mb: 0, flexShrink: 0, gap: 1, px: { xs: 1.5, sm: 2 }, py: 1 }, children: [
      /* @__PURE__ */ jsx14(
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
      /* @__PURE__ */ jsx14(PermisosRoleFilterAutocomplete, { options: roleOptions, value: roleFilters, onChange: setRoleFilters, disabled: filterBusy }),
      filtersActive ? /* @__PURE__ */ jsx14(
        Chip9,
        {
          size: "small",
          variant: "outlined",
          className: "isa-neon-glass-chip",
          label: "Filtros",
          onDelete: clearFilters,
          disabled: filterBusy
        }
      ) : null,
      /* @__PURE__ */ jsx14(
        FormControlLabel2,
        {
          className: "config-permisos-toolbar__hide-empty",
          control: /* @__PURE__ */ jsx14(Switch, { size: "small", checked: hideEmptyStacks, onChange: (e) => setHideEmptyStacksPersist(e.target.checked), disabled: filterBusy }),
          label: "Ocultar vac\xEDos",
          sx: { mr: 0, ml: 0.5, flexShrink: 0, "& .MuiFormControlLabel-label": { fontSize: "0.8rem", whiteSpace: "nowrap" } }
        }
      ),
      /* @__PURE__ */ jsx14(Box9, { sx: { flex: 1, minWidth: 8 } }),
      /* @__PURE__ */ jsxs10(Stack8, { direction: "row", spacing: 0.5, alignItems: "center", className: "config-form-section__actions config-permisos-toolbar__actions", children: [
        /* @__PURE__ */ jsx14(ButtonIconify, { icon: "mdi:family-tree", title: "Jerarqu\xEDa y rol visitante", onClick: openHierarchyDialog, disabled: busy || filterBusy }),
        /* @__PURE__ */ jsx14(ButtonIconify, { icon: "mdi:refresh", title: "Recargar", onClick: load, disabled: busy || filterBusy })
      ] })
    ] }) }),
    err ? /* @__PURE__ */ jsx14(Alert4, { severity: "warning", className: "config-form-alert config-permisos-alert", children: err }) : null,
    /* @__PURE__ */ jsx14(
      PermisosKanban,
      {
        boardData,
        loggedIn,
        sessionUsername,
        canAssignRoles: canAssignUserRoles,
        readOnly,
        canManage: managePermisos,
        canEditRoleDescriptions: editRoleMeta,
        busy: busy || filterBusy,
        actorJerarquia,
        actorJerarquias,
        onJerarquiaToast: (t) => toastInfo?.(t.message) ?? alert(t.message),
        onOpenRoleHierarchy: openHierarchyForRole,
        onUserSummary: (username) => setSummaryUsername(username),
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
    /* @__PURE__ */ jsxs10(
      GlassDialog,
      {
        open: hierarchyOpen,
        onClose: () => {
          setHierarchyOpen(false);
          setHierarchyFocusRole(null);
        },
        fullScreen: true,
        fullWidth: true,
        maxWidth: false,
        paperClassName: "isa-glass-dialog--fullscreen permisos-hierarchy-dialog",
        header: /* @__PURE__ */ jsx14(GlassDialogHeader, { icon: "mdi:family-tree", title: "Jerarqu\xEDa de roles", subtitle: "Visitante y permisos \u2014 solo branch 0 edita la jerarqu\xEDa", accent: "#10b981", onClose: () => {
          setHierarchyOpen(false);
          setHierarchyFocusRole(null);
        } }),
        children: [
          /* @__PURE__ */ jsx14(DialogContent4, { dividers: true, sx: Object.assign({}, glassDialogContentSx({ p: 0, flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }), { height: "100%" }), children: /* @__PURE__ */ jsx14(
            RoleHierarchyView,
            {
              nodes: hierarchyNodes,
              roleEntries: data.roles,
              initialSelectedRole: hierarchyFocusRole,
              canManagePermisos: managePermisos,
              canEditRoleDescriptions: editRoleMeta,
              onSaveRolePermisos: editRoleMeta ? handleSaveRolePermisos : void 0,
              canMutate: isBranchZero(actorJerarquia ?? ""),
              busy: hierarchyBusy,
              onSave: handleHierarchySave,
              onCreate: handleHierarchyCreate,
              onDelete: handleHierarchyDelete,
              onSaveLocalPerm: handleHierarchyLocalPerm,
              onPromote: handleHierarchyPromote
            }
          ) }),
          /* @__PURE__ */ jsx14(DialogActions3, { sx: glassDialogActionsSx(), children: /* @__PURE__ */ jsx14(Button5, { onClick: () => setHierarchyOpen(false), sx: { textTransform: "none", fontWeight: 600 }, children: "Cerrar" }) })
        ]
      }
    ),
    /* @__PURE__ */ jsx14(
      UserPermissionsSummaryDialog,
      {
        open: !!summaryUsername,
        onClose: () => setSummaryUsername(null),
        username: summaryUsername,
        users: data?.users ?? [],
        roles: data?.roles ?? []
      }
    )
  ] });
}
export {
  PermisosPanel
};
