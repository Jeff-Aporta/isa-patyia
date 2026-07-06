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
var fb = () => globalThis.ISAFront?.Feedback;
function toastError(text, timeout) {
  fb()?.toast?.error?.(text, timeout);
}
function toastSuccess(text, timeout) {
  fb()?.toast?.success?.(text, timeout);
}

// js/tools/roleHierarchy.js
function ancestorsFromPath(jerarquia) {
  const parts = String(jerarquia ?? "").split(".").filter(Boolean);
  const out = [];
  for (let i = parts.length - 1; i >= 0; i--) {
    out.push(parts.slice(0, i + 1).join("."));
  }
  return out;
}

// js/tools/roleHierarchyTree/RolePermissionsEditor.tsx
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
var { useState, useMemo, useCallback, useEffect } = getReact();
var { Box, Stack, Typography, Breadcrumbs, Link, Chip, IconButton, Tooltip, Button, TextField, Alert, CircularProgress } = getMaterialUI();
var { Icon } = UI;
function RolePermissionsEditor(props) {
  const { currentNode, allNodes, busy, onSaveLocal, onPromote, onClose } = props;
  const byJer = useMemo(
    () => new Map(allNodes.map((n) => [n.jerarquia, n])),
    [allNodes]
  );
  const pathAncestors = useMemo(
    () => [...ancestorsFromPath(currentNode.jerarquia)].reverse(),
    [currentNode.jerarquia]
  );
  const [resolved, setResolved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  useEffect(() => {
    let cancelled = false;
    (() => {
      setLoading(true);
      const merged = {};
      const orderedJers = pathAncestors;
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
  const handlePromote = useCallback(async (perm, targetJer) => {
    try {
      await onPromote(perm.key, perm.value, perm.ownerJerarquia, targetJer);
      toastSuccess?.(`${perm.key} promovido a ${targetJer}`);
    } catch (e) {
      toastError?.(String(e));
    }
  }, [onPromote]);
  const startEdit = useCallback((perm) => {
    setEditingKey(perm.key);
    setEditingValue(typeof perm.value === "string" ? perm.value : JSON.stringify(perm.value));
  }, []);
  const saveEdit = useCallback(async () => {
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
  return /* @__PURE__ */ jsxs(Box, { className: "role-permissions-editor", sx: { display: "flex", flexDirection: "column", gap: 1.5, p: 2 }, children: [
    /* @__PURE__ */ jsxs(Breadcrumbs, { separator: "\u203A", sx: { fontSize: 13 }, children: [
      pathAncestors.slice(0, -1).map((j) => /* @__PURE__ */ jsx(Link, { underline: "hover", color: "inherit", children: j }, j)),
      /* @__PURE__ */ jsx(Typography, { color: "text.primary", fontWeight: 700, children: currentNode.jerarquia })
    ] }),
    /* @__PURE__ */ jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [
      /* @__PURE__ */ jsx(Typography, { variant: "h6", sx: { flex: 1 }, children: currentNode.namedisplay ?? currentNode.iusuario }),
      /* @__PURE__ */ jsx(Chip, { size: "small", label: currentNode.jerarquia }),
      /* @__PURE__ */ jsx(Button, { onClick: onClose, size: "small", sx: { textTransform: "none" }, children: "Cerrar" })
    ] }),
    currentNode.descripcion ? /* @__PURE__ */ jsx(Typography, { variant: "body2", color: "text.secondary", children: currentNode.descripcion }) : null,
    /* @__PURE__ */ jsx(Typography, { variant: "subtitle2", children: "Permisos efectivos" }),
    loading ? /* @__PURE__ */ jsx(CircularProgress, { size: 20 }) : /* @__PURE__ */ jsxs(Stack, { spacing: 0.5, children: [
      resolved.length === 0 ? /* @__PURE__ */ jsx(Typography, { variant: "body2", color: "text.secondary", sx: { p: 1 }, children: "Sin permisos." }) : null,
      resolved.map((perm) => /* @__PURE__ */ jsxs(Box, { sx: {
        p: 1,
        border: 1,
        borderColor: perm.isInherited ? "warning.light" : "divider",
        borderRadius: 1,
        backgroundColor: perm.isInherited ? "warning.50" : "transparent",
        opacity: perm.isInherited ? 0.85 : 1
      }, children: [
        /* @__PURE__ */ jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [
          /* @__PURE__ */ jsxs(Box, { sx: { flex: 1, minWidth: 0 }, children: [
            /* @__PURE__ */ jsx(Typography, { variant: "body2", fontFamily: "monospace", noWrap: true, title: perm.key, children: perm.key }),
            /* @__PURE__ */ jsx(Typography, { variant: "caption", color: "text.secondary", sx: { display: "block" }, title: JSON.stringify(perm.value), children: JSON.stringify(perm.value).slice(0, 100) })
          ] }),
          perm.isInherited ? /* @__PURE__ */ jsxs(Stack, { direction: "row", alignItems: "center", spacing: 0.5, children: [
            /* @__PURE__ */ jsx(Tooltip, { title: `Viene de ${perm.ownerJerarquia} (no editable aqu\xED)`, children: /* @__PURE__ */ jsx(Chip, { size: "small", color: "warning", label: `\u{1F512} ${perm.ownerJerarquia}` }) }),
            /* @__PURE__ */ jsx(Tooltip, { title: `Promover a ${perm.ownerJerarquia} para poder editarlo all\xED`, children: /* @__PURE__ */ jsx(
              Button,
              {
                size: "small",
                startIcon: /* @__PURE__ */ jsx("iconify-icon", { icon: "mdi:arrow-up-bold", width: "14", height: "14" }),
                onClick: () => handlePromote(perm, perm.ownerJerarquia),
                disabled: busy,
                sx: { textTransform: "none" },
                children: "Subir a la herencia"
              }
            ) })
          ] }) : /* @__PURE__ */ jsxs(Stack, { direction: "row", alignItems: "center", spacing: 0.5, children: [
            /* @__PURE__ */ jsx(Chip, { size: "small", color: "primary", label: "local" }),
            editingKey === perm.key ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Button, { size: "small", onClick: saveEdit, disabled: busy, children: "Guardar" }),
              /* @__PURE__ */ jsx(Button, { size: "small", onClick: () => setEditingKey(null), children: "Cancelar" })
            ] }) : /* @__PURE__ */ jsx(Tooltip, { title: "Editar valor", children: /* @__PURE__ */ jsx(IconButton, { size: "small", onClick: () => startEdit(perm), disabled: busy, "aria-label": "Editar", children: /* @__PURE__ */ jsx("iconify-icon", { icon: "mdi:pencil", width: "16", height: "16" }) }) })
          ] })
        ] }),
        editingKey === perm.key ? /* @__PURE__ */ jsx(
          TextField,
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
        perm.isInherited ? /* @__PURE__ */ jsxs(Alert, { severity: "warning", sx: { mt: 0.5, py: 0 }, icon: /* @__PURE__ */ jsx("iconify-icon", { icon: "mdi:lock-outline", width: "16", height: "16" }), children: [
          "Setear en la herencia: ",
          perm.ownerJerarquia
        ] }) : null
      ] }, perm.key))
    ] })
  ] });
}
export {
  RolePermissionsEditor
};
