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
var getReact = () => window.ISAFront.getReact();
var getReactDOM = () => window.ISAFront.getReactDOM();
var getMaterialUI = () => window.ISAFront.getMaterialUI();

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
  const { Box: Box5, Typography: Typography5, IconButton: IconButton2, Stack: Stack4 } = getMaterialUI();
  const { Icon: Icon3 } = UI;
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
  return /* @__PURE__ */ jsxs(Box5, { className: "isa-glass-dialog__header", sx: { position: "relative", flexShrink: 0 }, children: [
    /* @__PURE__ */ jsx2(Box5, { sx: bandSx, children: /* @__PURE__ */ jsxs(Stack4, { direction: "row", spacing: 1.25, alignItems: "center", sx: { pr: onClose ? 4 : 0 }, children: [
      /* @__PURE__ */ jsx2(Box5, { sx: iconSx, children: /* @__PURE__ */ jsx2(Icon3, { icon, size: 24 }) }),
      /* @__PURE__ */ jsxs(Box5, { sx: { flex: 1, minWidth: 0 }, children: [
        /* @__PURE__ */ jsx2(Typography5, { variant: "h5", component: "h2", sx: titleSx, children: title }),
        subtitle ? /* @__PURE__ */ jsx2(Typography5, { variant: "caption", color: "text.secondary", display: "block", sx: { mt: 0.35, lineHeight: 1.4 }, children: subtitle }) : null
      ] })
    ] }) }),
    onClose ? /* @__PURE__ */ jsx2(IconButton2, { size: "small", onClick: onClose, "aria-label": "Cerrar", className: "isa-glass-dialog__close", sx: { position: "absolute", top: 10, right: 10 }, children: /* @__PURE__ */ jsx2(Icon3, { icon: "mdi:close", size: 18 }) }) : null
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

// ../../Personal/apps/isa-patyia/frontend/js/ui/shared.jsx
import { Fragment, jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
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

// ../../Personal/apps/isa-patyia/frontend/js/tools/permFixFilter.js
var SESSION_OWNER_FIX_FILTER = {
  itercero: "{{itercero}}",
  icontacto: "{{icontacto}}"
};

// ../../Personal/apps/isa-patyia/frontend/js/tools/permisosForm.js
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

// ../../Personal/apps/isa-patyia/frontend/js/tools/roleHierarchy.js
var DEFAULT_FOR_UNKNOWN = "999";
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

// ../../Personal/apps/isa-patyia/frontend/js/tools/permisosKanbanShared.js
function userCardLabels(username, displayName) {
  const user = String(username ?? "").trim().toUpperCase();
  const name = String(displayName ?? "").trim();
  if (name) return { primary: name, secondary: user };
  return { primary: user, secondary: null };
}
function normalizePermisosUsername(raw) {
  const s = String(raw ?? "").trim().toUpperCase();
  return s || null;
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
  function confirm(mode) {
    if (busy) return;
    if (mode === "copy" && copyDenied) return;
    onConfirm(mode);
  }
  function handleCopy() {
    if (copyDenied) return;
    confirm("copy");
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
              onClick: () => confirm("move"),
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
export {
  PermisosKanban
};
