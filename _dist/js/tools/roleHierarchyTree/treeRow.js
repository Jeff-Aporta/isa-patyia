// ../Personal/apps/isa-patyia/frontend/js/core/patyia.ts
window.ISAFront.migrateLegacyGatewayKeys?.({ "jeff:gateway-local": "", "patyia-apptools:gateway-local": "", "patyia-apptools:lab-local": "" });
var PATYIA_ISS_LOCAL = "http://127.0.0.1:8802";
var PATYIA_BRIDGE_LOCAL = `${PATYIA_ISS_LOCAL}/api`;

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
var getMaterialUI = () => window.ISAFront.getMaterialUI();

// ../Personal/apps/isa-patyia/frontend/js/tools/roleHierarchyTree/treeRow.tsx
import { jsx, jsxs } from "react/jsx-runtime";
var { Icon } = UI;
var { Box, Stack, Typography, IconButton, Tooltip } = getMaterialUI();
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
  return /* @__PURE__ */ jsxs(
    Box,
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
        /* @__PURE__ */ jsx(Tooltip, { title: row.hasChildren ? isCollapsed ? "Expandir" : "Colapsar" : "", children: /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(
          IconButton,
          {
            size: "small",
            onClick: (e) => {
              e.stopPropagation();
              onToggleCollapse();
            },
            disabled: !row.hasChildren,
            "aria-label": isCollapsed ? "Expandir" : "Colapsar",
            children: /* @__PURE__ */ jsx("iconify-icon", { icon: row.hasChildren ? isCollapsed ? "mdi:chevron-right" : "mdi:chevron-down" : "mdi:circle-small", width: "16", height: "16" })
          }
        ) }) }),
        /* @__PURE__ */ jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, sx: { flex: 1, minWidth: 0 }, children: [
          /* @__PURE__ */ jsx("iconify-icon", { icon: "mdi:shield-account-outline", width: "16", height: "16" }),
          /* @__PURE__ */ jsxs(Box, { sx: { minWidth: 0 }, children: [
            /* @__PURE__ */ jsx(Typography, { variant: "body2", fontWeight: 600, noWrap: true, title: row.namedisplay ?? row.iusuario, children: row.namedisplay ?? row.iusuario }),
            /* @__PURE__ */ jsx(Typography, { variant: "caption", color: "text.secondary", sx: { display: "block", fontFamily: "monospace" }, title: `Jerarqu\xEDa ${row.jerarquia}`, children: row.jerarquia })
          ] })
        ] }),
        row.hasChildren ? /* @__PURE__ */ jsxs(Typography, { variant: "caption", color: "text.secondary", sx: { flexShrink: 0 }, children: [
          childCount,
          " hijo",
          childCount !== 1 ? "s" : ""
        ] }) : null,
        canMutate ? /* @__PURE__ */ jsxs(Stack, { direction: "row", spacing: 0.5, sx: { flexShrink: 0 }, children: [
          onDrillDown ? /* @__PURE__ */ jsx(Tooltip, { title: "Editar permisos de este nodo", children: /* @__PURE__ */ jsx(IconButton, { size: "small", "aria-label": "Editar permisos", onClick: (e) => {
            e.stopPropagation();
            onDrillDown();
          }, children: /* @__PURE__ */ jsx("iconify-icon", { icon: "mdi:pencil-box-outline", width: "16", height: "16" }) }) }) : null,
          /* @__PURE__ */ jsx(Tooltip, { title: "Mover de jerarqu\xEDa", children: /* @__PURE__ */ jsx(IconButton, { size: "small", "aria-label": "Mover", onClick: (e) => {
            e.stopPropagation();
            onEdit();
          }, children: /* @__PURE__ */ jsx("iconify-icon", { icon: "mdi:arrow-up-down-bold", width: "16", height: "16" }) }) }),
          /* @__PURE__ */ jsx(Tooltip, { title: "Eliminar rol", children: /* @__PURE__ */ jsx(IconButton, { size: "small", "aria-label": "Eliminar", onClick: (e) => {
            e.stopPropagation();
            onDelete();
          }, children: /* @__PURE__ */ jsx("iconify-icon", { icon: "mdi:trash-can-outline", width: "16", height: "16" }) }) })
        ] }) : null
      ]
    }
  );
}
export {
  TreeRowView
};
