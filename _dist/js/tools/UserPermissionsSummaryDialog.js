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
var getReact = () => window.ISAFront.getReact();
var getMaterialUI = () => window.ISAFront.getMaterialUI();

// js/tools/permisosForm.js
var FLAG_DEFS = [
  { key: "*", label: "Acceso total", hint: "Wildcard \u2014 anula el resto de restricciones de ruta." },
  { key: "impersonate", label: "Suplantar chat", hint: "Actuar como otro usuario en conversaciones." },
  { key: "manage_permissions", label: "Gestionar permisos", hint: "CRUD de dbo.SYS_USR_PERMISSIONS (dev_lead)." }
];
var FLAG_KEYS = new Set(FLAG_DEFS.map((f) => f.key));
function roleNamedisplay(permisos) {
  const d = permisos?.namedisplay;
  return d != null && String(d).trim() ? String(d).trim() : "";
}
function userRoles(permisos) {
  const r = permisos?.roles;
  return Array.isArray(r) ? r.map((x) => String(x).trim().toLowerCase()).filter(Boolean) : [];
}

// js/tools/roleHierarchy.js
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

// js/tools/roleCanonicalMeta.js
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

// js/tools/permisosKanbanShared.js
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

// js/ui/GlassDialog.jsx
import { jsx, jsxs } from "react/jsx-runtime";
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
    /* @__PURE__ */ jsx(Box2, { sx: bandSx, children: /* @__PURE__ */ jsxs(Stack2, { direction: "row", spacing: 1.25, alignItems: "center", sx: { pr: onClose ? 4 : 0 }, children: [
      /* @__PURE__ */ jsx(Box2, { sx: iconSx, children: /* @__PURE__ */ jsx(Icon, { icon, size: 24 }) }),
      /* @__PURE__ */ jsxs(Box2, { sx: { flex: 1, minWidth: 0 }, children: [
        /* @__PURE__ */ jsx(Typography2, { variant: "h5", component: "h2", sx: titleSx, children: title }),
        subtitle ? /* @__PURE__ */ jsx(Typography2, { variant: "caption", color: "text.secondary", display: "block", sx: { mt: 0.35, lineHeight: 1.4 }, children: subtitle }) : null
      ] })
    ] }) }),
    onClose ? /* @__PURE__ */ jsx(IconButton, { size: "small", onClick: onClose, "aria-label": "Cerrar", className: "isa-glass-dialog__close", sx: { position: "absolute", top: 10, right: 10 }, children: /* @__PURE__ */ jsx(Icon, { icon: "mdi:close", size: 18 }) }) : null
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

// js/tools/UserPermissionsSummaryDialog.jsx
import { Fragment, jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var { Typography, Stack, Box, Chip, Divider, CircularProgress } = getMaterialUI();
var { useMemo } = getReact();
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
  return /* @__PURE__ */ jsxs2(Stack, { direction: "row", spacing: 0.5, alignItems: "center", flexWrap: "wrap", useFlexGap: true, children: [
    chain.ancestors.map((anc) => /* @__PURE__ */ jsxs2(Box, { sx: { display: "inline-flex", alignItems: "center" }, children: [
      /* @__PURE__ */ jsx2(Chip, { size: "small", variant: "outlined", label: roleTitleFromEntry(anc.entry) || anc.entry.iusuario, sx: { fontFamily: "monospace", fontSize: 11 }, title: `Jerarqu\xEDa ${anc.jerarquia}` }),
      /* @__PURE__ */ jsx2(Box, { component: "span", sx: { mx: 0.5, opacity: 0.6 }, children: "\u203A" })
    ] }, anc.jerarquia)),
    /* @__PURE__ */ jsx2(
      Chip,
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
  return /* @__PURE__ */ jsx2(Box, { className: "isa-glass-card paty-permisos-summary__role", sx: { p: 1.25, borderRadius: 1.5 }, children: /* @__PURE__ */ jsxs2(Stack, { spacing: 0.75, children: [
    /* @__PURE__ */ jsxs2(Stack, { direction: "row", alignItems: "center", spacing: 0.75, children: [
      /* @__PURE__ */ jsx2(Typography, { variant: "subtitle2", fontWeight: 700, title: `${chain.name} \xB7 jerarqu\xEDa ${chain.jerarquia}`, children: chain.name }),
      /* @__PURE__ */ jsx2(Typography, { variant: "caption", color: "text.secondary", sx: { fontFamily: "monospace" }, children: chain.jerarquia })
    ] }),
    /* @__PURE__ */ jsx2(ChipChain, { chain, roles })
  ] }) });
}
function PermList({ title, items, kind }) {
  if (!items.length) return null;
  return /* @__PURE__ */ jsxs2(Box, { sx: { mt: 1 }, children: [
    /* @__PURE__ */ jsxs2(Typography, { variant: "overline", color: "text.secondary", sx: { letterSpacing: 1 }, children: [
      title,
      " (",
      items.length,
      ")"
    ] }),
    /* @__PURE__ */ jsxs2(Box, { sx: { display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }, children: [
      items.slice(0, kind === "fixFilter" ? 50 : 100).map((it, i) => {
        if (kind === "fixFilter") {
          const ffSummary = Object.entries(it.filter ?? {}).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(", ");
          return /* @__PURE__ */ jsx2(
            Chip,
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
          return /* @__PURE__ */ jsx2(
            Chip,
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
        return /* @__PURE__ */ jsx2(
          Chip,
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
      items.length > (kind === "fixFilter" ? 50 : 100) ? /* @__PURE__ */ jsx2(Chip, { size: "small", label: `+${items.length - (kind === "fixFilter" ? 50 : 100)} m\xE1s`, sx: { fontFamily: "monospace", fontSize: 11 } }) : null
    ] })
  ] });
}
function UserPermissionsSummaryDialog({ open, onClose, username, users, roles }) {
  const data = useMemo(() => {
    if (!open || !username) return null;
    const targetUser = (users ?? []).find((u) => String(u?.iusuario ?? "").trim().toUpperCase() === username.toUpperCase());
    if (!targetUser) return null;
    const active = activeRoles(roles);
    const directRoles = userRoles(targetUser.permisos);
    const chains = directRoles.map((rn) => chainForRole(active, rn));
    const { allows, fixFilters, others } = summarizePerms(targetUser.permisos);
    return { targetUser, chains, activeRoles: active, allows, fixFilters, others };
  }, [open, username, users, roles]);
  return /* @__PURE__ */ jsxs2(
    GlassDialog,
    {
      open,
      onClose,
      maxWidth: "md",
      fullWidth: true,
      paperClassName: "permisos-user-summary-dialog",
      header: /* @__PURE__ */ jsx2(
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
        /* @__PURE__ */ jsx2(Box, { sx: { ...glassDialogContentSx(), minHeight: 360 }, children: !username ? /* @__PURE__ */ jsx2(Typography, { color: "text.secondary", children: "Sin usuario seleccionado." }) : !data ? /* @__PURE__ */ jsxs2(Stack, { direction: "row", spacing: 1.5, alignItems: "center", children: [
          /* @__PURE__ */ jsx2(CircularProgress, { size: 20 }),
          /* @__PURE__ */ jsx2(Typography, { color: "text.secondary", children: "Usuario no encontrado en los datos cargados." })
        ] }) : /* @__PURE__ */ jsxs2(Fragment, { children: [
          /* @__PURE__ */ jsxs2(Box, { children: [
            /* @__PURE__ */ jsx2(Typography, { variant: "overline", color: "text.secondary", children: "Usuario" }),
            /* @__PURE__ */ jsx2(Typography, { variant: "h6", fontWeight: 700, children: data.targetUser.iusuario }),
            data.targetUser.permisos?.nombre || data.targetUser.permisos?.namedisplay ? /* @__PURE__ */ jsx2(Typography, { variant: "body2", color: "text.secondary", children: data.targetUser.permisos.nombre || data.targetUser.permisos.namedisplay }) : null
          ] }),
          /* @__PURE__ */ jsx2(Divider, { sx: { my: 1.5 } }),
          /* @__PURE__ */ jsxs2(Typography, { variant: "overline", color: "text.secondary", children: [
            "Cadena de roles ",
            data.chains.length ? `(${data.chains.length})` : ""
          ] }),
          data.chains.length === 0 ? /* @__PURE__ */ jsx2(Typography, { variant: "body2", color: "text.secondary", sx: { mt: 0.5 }, children: "El usuario no tiene roles asignados. Permisos efectivos = visitante por defecto." }) : /* @__PURE__ */ jsx2(Stack, { spacing: 1, sx: { mt: 1 }, children: data.chains.map((c) => /* @__PURE__ */ jsx2(RoleCard, { chain: c, roles: data.activeRoles }, c.name)) }),
          /* @__PURE__ */ jsx2(Divider, { sx: { my: 1.5 } }),
          /* @__PURE__ */ jsx2(Typography, { variant: "overline", color: "text.secondary", children: "Permisos efectivos del usuario" }),
          /* @__PURE__ */ jsx2(Typography, { variant: "caption", color: "text.secondary", sx: { display: "block", mt: 0.25 }, children: "Calculados a partir de sus roles directos m\xE1s la herencia por path jer\xE1rquico, replicando el merge del backend." }),
          data.allows.length === 0 && data.fixFilters.length === 0 && data.others.length === 0 ? /* @__PURE__ */ jsx2(Typography, { variant: "body2", color: "text.secondary", sx: { mt: 1 }, children: "Sin permisos materializados m\xE1s all\xE1 del visitante por defecto." }) : /* @__PURE__ */ jsxs2(Fragment, { children: [
            /* @__PURE__ */ jsx2(PermList, { title: "Permitidos", items: data.allows, kind: "allow" }),
            /* @__PURE__ */ jsx2(PermList, { title: "Con filtro fijo", items: data.fixFilters, kind: "fixFilter" }),
            /* @__PURE__ */ jsx2(PermList, { title: "Otros", items: data.others, kind: "other" })
          ] }),
          /* @__PURE__ */ jsx2(Divider, { sx: { my: 1.5 } }),
          /* @__PURE__ */ jsx2(Typography, { variant: "caption", color: "text.secondary", children: "Los detalles completos por rol se obtienen al abrir cada columna en la jerarqu\xEDa. Este resumen es de solo lectura y se actualiza al recargar el panel." })
        ] }) }),
        /* @__PURE__ */ jsx2(Box, { sx: glassDialogActionsSx(), children: /* @__PURE__ */ jsx2(
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
export {
  UserPermissionsSummaryDialog
};
