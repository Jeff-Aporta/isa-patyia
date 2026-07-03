// ../../Personal/apps/isa-patyia/frontend/js/tools/roleHierarchyTree/RoleHierarchyView.tsx
import * as React2 from "react";

// ../../Personal/apps/isa-patyia/frontend/js/core/patyia.ts
window.ISAFront.migrateLegacyGatewayKeys?.({ "jeff:gateway-local": "", "patyia-apptools:gateway-local": "", "patyia-apptools:lab-local": "" });
var PATYIA_ISS_LOCAL = "http://127.0.0.1:8802";
var PATYIA_BRIDGE_LOCAL = `${PATYIA_ISS_LOCAL}/api`;

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
var getReact = () => window.ISAFront.getReact();
var getMaterialUI = () => window.ISAFront.getMaterialUI();
function getIsaSplitView() {
  const C = window.ISAFront?.Layout?.IsaSplitView;
  if (!C) {
    throw new Error("IsaSplitView no cargado \u2014 recargue sin cach\xE9 (Ctrl+Shift+R).");
  }
  return C;
}
var fb = () => globalThis.ISAFront?.Feedback;
function toastError(text, timeout) {
  fb()?.toast?.error?.(text, timeout);
}
function toastInfo(text, timeout) {
  fb()?.toast?.info?.(text, timeout);
}

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
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
var { IconButton, Tooltip } = getMaterialUI();
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
    if (!canMutate || features.collapse === false) {
      e.preventDefault();
      if (detailsRef.current) detailsRef.current.open = isOpen;
    } else {
      const clickedSymbol = target.closest(".trvwr-itm-symb");
      if (isGrouper && clickedSymbol) {
        e.preventDefault();
        onToggleCollapse(path, !isOpen);
        customs.onExpand?.(node, !isOpen);
      }
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
  return /* @__PURE__ */ jsx("div", { className: "trvwr-row-host", "data-flatpath": path, children: /* @__PURE__ */ jsxs("details", { ref: detailsRef, className: detailsClass, open: isOpen, onToggle: handleToggle, "aria-disabled": !canMutate || void 0, children: [
    /* @__PURE__ */ jsx(
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
        children: /* @__PURE__ */ jsxs("div", { className: "trvwr-sum-row", children: [
          dragEnabled ? /* @__PURE__ */ jsx("span", { className: "trvwr-drag-handle", title: "Arrastrar para reordenar", draggable: true, onDragStart: handleDragStart, onDragEnd: handleDragEnd, children: /* @__PURE__ */ jsx("iconify-icon", { icon: icons.dragHandle ?? "mdi:dots-grid", style: { fontSize: "1rem", opacity: 0.45 } }) }) : null,
          isGrouper ? /* @__PURE__ */ jsxs("span", { className: "trvwr-itm-symb", children: [
            /* @__PURE__ */ jsx("span", { className: `trvwr-chevron${isOpen ? "" : " trvwr-chevron--closed"}`, children: /* @__PURE__ */ jsx("iconify-icon", { icon: icons.chevron ?? "mdi:chevron-down", style: { fontSize: "1rem" } }) }),
            /* @__PURE__ */ jsx("iconify-icon", { icon: isOpen ? grouperIcons.open : grouperIcons.closed, style: { fontSize: "1rem", color: grouperIcons.color } })
          ] }) : /* @__PURE__ */ jsx("span", { className: "trvwr-itm-symb", children: /* @__PURE__ */ jsx("iconify-icon", { icon: leafIcon, style: { fontSize: "1rem", opacity: 0.75 } }) }),
          /* @__PURE__ */ jsxs("div", { className: "trvwr-itm-content", children: [
            /* @__PURE__ */ jsxs("span", { className: "trvwr-itm-label", title: label, children: [
              label,
              pathLabel ? /* @__PURE__ */ jsx("span", { className: "trvwr-itm-path", children: pathLabel }) : null
            ] }),
            helper ? /* @__PURE__ */ jsx("span", { className: "trvwr-itm-helper", children: /* @__PURE__ */ jsx("small", { children: helper }) }) : null
          ] }),
          rowActions.length ? /* @__PURE__ */ jsx("div", { className: "trvwr-float-card", role: "presentation", onClick: (e) => e.stopPropagation(), children: rowActions.map((act) => /* @__PURE__ */ jsx(Tooltip, { title: act.title, children: /* @__PURE__ */ jsx(IconButton, { size: "small", "aria-label": act.title, disabled: act.disabled, onClick: act.onClick, children: /* @__PURE__ */ jsx("iconify-icon", { icon: act.icon, width: "16", height: "16" }) }) }, act.id)) }) : null,
          customs.renderRowExtra?.(node)
        ] })
      }
    ),
    isGrouper && isOpen ? /* @__PURE__ */ jsx("div", { className: "trvwr-itm-childrens-wrap", children: /* @__PURE__ */ jsx("div", { className: "trvwr-itm-childrens", role: "group", children: /* @__PURE__ */ jsx(TreeRowItem, { nodes: node.childrens, ...ctx }) }) }) : null
  ] }) });
}
function TreeRowItem(props) {
  const { nodes, ...ctx } = props;
  if (!nodes?.length) return null;
  return /* @__PURE__ */ jsx(Fragment, { children: nodes.map((node) => /* @__PURE__ */ jsx(TreeRow, { node, nodes, ...ctx }, node.pathInit)) });
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
import { Fragment as Fragment2, jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var { useState, useMemo, useCallback } = getReact();
var { Box, Stack, Typography, Chip, IconButton: IconButton2, Tooltip: Tooltip2, Button, CircularProgress } = getMaterialUI();
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
  const [collapsed, setCollapsed] = useState(/* @__PURE__ */ new Set());
  const [selectedPathInternal, setSelectedPathInternal] = useState(null);
  const [drag, setDrag] = useState(EMPTY_DRAG);
  const selectedPath = selectedPathProp !== void 0 ? selectedPathProp : selectedPathInternal;
  const setSelectedPath = useCallback((path) => {
    if (onSelectedPathChange) onSelectedPathChange(path);
    else setSelectedPathInternal(path);
  }, [onSelectedPathChange]);
  const rootNodes = useMemo(() => buildTreeFromFlatList(items, customs.build), [items, customs.build]);
  const canMutate = !readonly && !busy;
  const runtime = useMemo(() => ({
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
  const setCollapsedFor = useCallback((path, open) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (open) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);
  const handleDragStart = useCallback((path) => {
    setDrag({ sourcePath: path, overPath: null, overZone: null, forbidden: false });
  }, []);
  const handleDragOver = useCallback((path, zone, forbidden) => {
    setDrag((prev) => {
      if (prev.overPath === path && prev.overZone === zone && prev.forbidden === forbidden) return prev;
      return { ...prev, overPath: path, overZone: zone, forbidden };
    });
  }, []);
  const handleDragLeave = useCallback((path) => {
    setDrag((prev) => prev.overPath === path ? { ...prev, overPath: null, overZone: null, forbidden: false } : prev);
  }, []);
  const handleDragEnd = useCallback(() => setDrag(EMPTY_DRAG), []);
  const handleDrop = useCallback(async (sourcePath, targetPath, zone) => {
    setDrag(EMPTY_DRAG);
    await customs.onDrop?.(sourcePath, targetPath, zone, items);
  }, [customs, items]);
  const toolbarActions = useMemo(
    () => (customs.toolbarActions?.(runtime) ?? []).filter((a) => !a.hidden),
    [customs, runtime]
  );
  const countLabel = manifest.countLabel ?? `${items.length} ${manifest.entrie ?? "elemento"}${items.length !== 1 ? "s" : ""}`;
  const ariaLabel = manifest.ariaLabel ?? manifest.entries ?? `\xC1rbol de ${manifest.entrie ?? "elementos"}`;
  return /* @__PURE__ */ jsxs2(Box, { className: `isp-tree-host isp-tree ${className}`.trim(), sx: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }, children: [
    showToolbar ? /* @__PURE__ */ jsxs2(Stack, { direction: "row", alignItems: "center", spacing: 1, className: "isp-tree-toolbar", sx: { p: 1, borderBottom: 1, borderColor: "divider", flexShrink: 0 }, children: [
      toolbarTitle ? /* @__PURE__ */ jsx2(Typography, { variant: "subtitle1", sx: { flex: 1 }, children: toolbarTitle }) : /* @__PURE__ */ jsx2(Box, { sx: { flex: 1 } }),
      /* @__PURE__ */ jsx2(Chip, { size: "small", label: countLabel }),
      features.toolbarExpandCollapse !== false ? /* @__PURE__ */ jsxs2(Fragment2, { children: [
        /* @__PURE__ */ jsx2(Tooltip2, { title: "Expandir todo", children: /* @__PURE__ */ jsx2(IconButton2, { size: "small", onClick: runtime.expandAll, disabled: busy, children: /* @__PURE__ */ jsx2("iconify-icon", { icon: "mdi:unfold-more-horizontal", width: "18", height: "18" }) }) }),
        /* @__PURE__ */ jsx2(Tooltip2, { title: "Colapsar todo", children: /* @__PURE__ */ jsx2(IconButton2, { size: "small", onClick: runtime.collapseAll, disabled: busy, children: /* @__PURE__ */ jsx2("iconify-icon", { icon: "mdi:unfold-less-horizontal", width: "18", height: "18" }) }) })
      ] }) : null,
      toolbarActions.map((act) => act.variant === "button" ? /* @__PURE__ */ jsx2(
        Button,
        {
          size: "small",
          variant: "contained",
          disabled: act.disabled || busy,
          startIcon: /* @__PURE__ */ jsx2("iconify-icon", { icon: act.icon, width: "16", height: "16" }),
          onClick: act.onClick,
          children: act.label ?? act.title
        },
        act.id
      ) : /* @__PURE__ */ jsx2(Tooltip2, { title: act.title, children: /* @__PURE__ */ jsx2("span", { children: /* @__PURE__ */ jsx2(IconButton2, { size: "small", disabled: act.disabled || busy, onClick: act.onClick, "aria-label": act.title, children: /* @__PURE__ */ jsx2("iconify-icon", { icon: act.icon, width: "18", height: "18" }) }) }) }, act.id)),
      toolbarExtra
    ] }) : null,
    busy ? /* @__PURE__ */ jsx2(Box, { sx: { display: "flex", alignItems: "center", justifyContent: "center", p: 2, flex: 1, minHeight: 0 }, children: /* @__PURE__ */ jsx2(CircularProgress, { size: 20 }) }) : /* @__PURE__ */ jsx2(Box, { className: "isp-tree isp-tree-body custom-scrollbar", role: "tree", "aria-label": ariaLabel, sx: { flex: 1, minHeight: 0, overflow: "auto" }, children: rootNodes.length === 0 ? /* @__PURE__ */ jsx2(Typography, { variant: "body2", color: "text.secondary", sx: { p: 2 }, children: manifest.emptyMessage ?? "Sin elementos." }) : /* @__PURE__ */ jsx2(
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

// ../../Personal/apps/isa-patyia/frontend/js/ui/ImageLightboxDialog.jsx
import { jsx as jsx3 } from "react/jsx-runtime";
var { useEffect, useState: useState2 } = getReact();

// ../../Personal/apps/isa-patyia/frontend/js/ui/GlassDialog.jsx
import { jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";

// ../../Personal/apps/isa-patyia/frontend/js/ui/shared.jsx
import { Fragment as Fragment3, jsx as jsx5, jsxs as jsxs4 } from "react/jsx-runtime";
function ButtonIconify({ icon, title = "", label = "", onClick, disabled = false, busy = false, color = "", variant = "", className = "", type = "button" }) {
  const shown = busy ? "mdi:loading" : icon;
  const variantCls = variant ? `btn-iconify--${variant}` : "";
  const colorCls = color ? `btn-iconify--${color}` : "";
  const labeledCls = label ? "btn-iconify--labeled" : "";
  const aria = label || title || void 0;
  return /* @__PURE__ */ jsxs4(
    "button",
    {
      type,
      className: `btn-iconify ${variantCls} ${colorCls} ${labeledCls} ${className}`.trim(),
      title: title || label || void 0,
      "aria-label": aria,
      onClick,
      disabled: disabled || busy,
      children: [
        /* @__PURE__ */ jsx5("iconify-icon", { icon: shown, width: "1.15em", height: "1.15em" }),
        label ? /* @__PURE__ */ jsx5("span", { className: "btn-iconify__lbl", children: label }) : null
      ]
    }
  );
}
var { useState: useState3, useEffect: useEffect2, useMemo: useMemo2 } = getReact();
var { createTheme, Tabs, Tab, Box: Box2, Typography: Typography2, DialogContent, Stack: Stack2, Chip: Chip2 } = getMaterialUI();
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

// ../../Personal/apps/isa-patyia/frontend/js/editors/jsonEditor.jsx
import { jsx as jsx6 } from "react/jsx-runtime";

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

// ../../Personal/apps/isa-patyia/frontend/js/tools/roleHierarchy.js
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
function ancestorsFromPath(jerarquia) {
  const parts = String(jerarquia ?? "").split(".").filter(Boolean);
  const out = [];
  for (let i = parts.length - 1; i >= 0; i--) {
    out.push(parts.slice(0, i + 1).join("."));
  }
  return out;
}
function formatJerarquiaLabel(jerarquia) {
  if (jerarquia == null || jerarquia === "") return "";
  return `(${jerarquia})`;
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

// ../../Personal/apps/isa-patyia/frontend/js/tools/PermisosUserAutocomplete.jsx
import { jsx as jsx7 } from "react/jsx-runtime";
import { createElement } from "react";
var { useState: useState4, useEffect: useEffect3, useRef: useRef2, useCallback: useCallback2 } = getReact();
var { Autocomplete, TextField, Typography: Typography3, Box: Box3 } = getMaterialUI();

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
import { Fragment as Fragment4, jsx as jsx8, jsxs as jsxs5 } from "react/jsx-runtime";
var { useState: useState5, useEffect: useEffect4, useMemo: useMemo3 } = getReact();
var {
  Typography: Typography4,
  TextField: TextField2,
  Stack: Stack3,
  Alert,
  Chip: Chip3,
  Box: Box4,
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
  Button: Button2,
  Tooltip: Tooltip3,
  CircularProgress: CircularProgress2
} = getMaterialUI();
var { Icon } = UI;
var MODE_LABEL = Object.fromEntries(ACCESS_MODES.map((m) => [m.value, m.label]));
function AccessModeSelect({ value, onChange, disabled, scoped }) {
  const modes = scoped ? ACCESS_MODES : ACCESS_MODES.filter((m) => m.value === "off" || m.value === "allow");
  return /* @__PURE__ */ jsxs5(FormControl, { size: "small", fullWidth: true, disabled, children: [
    /* @__PURE__ */ jsx8(InputLabel, { id: "perm-route-access-label", shrink: true, children: "Acceso" }),
    /* @__PURE__ */ jsx8(Select, { labelId: "perm-route-access-label", label: "Acceso", value: value || "off", onChange: (e) => onChange(e.target.value), children: modes.map((m) => /* @__PURE__ */ jsx8(MenuItem, { value: m.value, children: m.label }, m.value)) })
  ] });
}
function ModeChip({ mode }) {
  const color = mode === "off" ? "default" : mode === "filtered" ? "info" : "success";
  return /* @__PURE__ */ jsx8(Chip3, { size: "small", variant: mode === "off" ? "outlined" : "filled", color, label: MODE_LABEL[mode] || mode });
}
function RouteGroupSection({ title, routes, canEdit, wildcard, onRouteMode, isVisitante }) {
  if (!routes.length) return null;
  return /* @__PURE__ */ jsxs5(Box4, { className: "permisos-route-group", children: [
    /* @__PURE__ */ jsx8(Typography4, { variant: "subtitle2", fontWeight: 700, className: "permisos-route-group__title", children: title }),
    /* @__PURE__ */ jsxs5(Table, { size: "small", className: "permisos-route-table__grid permisos-route-group__table", children: [
      /* @__PURE__ */ jsx8(TableHead, { children: /* @__PURE__ */ jsxs5(TableRow, { children: [
        /* @__PURE__ */ jsx8(TableCell, { children: "Ruta" }),
        /* @__PURE__ */ jsx8(TableCell, { sx: { width: "38%" }, children: "Clave" }),
        /* @__PURE__ */ jsx8(TableCell, { sx: { minWidth: 140 }, children: /* @__PURE__ */ jsx8(Tooltip3, { title: `fixFilter \u2014 filtra por el usuario de la sesi\xF3n (${FIX_FILTER_VAR_HINT})`, children: /* @__PURE__ */ jsx8("span", { children: "Filtro de sesi\xF3n" }) }) }),
        /* @__PURE__ */ jsx8(TableCell, { sx: { width: 168 }, children: "Acceso" })
      ] }) }),
      /* @__PURE__ */ jsx8(TableBody, { children: routes.map((row) => {
        const active = row.mode !== "off";
        return /* @__PURE__ */ jsxs5(TableRow, { className: active ? "permisos-route-row--active" : "permisos-route-row--inactive", children: [
          /* @__PURE__ */ jsx8(TableCell, { children: /* @__PURE__ */ jsx8(Typography4, { variant: "body2", fontWeight: active ? 600 : 400, children: row.label }) }),
          /* @__PURE__ */ jsx8(TableCell, { children: /* @__PURE__ */ jsx8(Typography4, { component: "code", variant: "caption", sx: { wordBreak: "break-all" }, children: row.key }) }),
          /* @__PURE__ */ jsx8(TableCell, { children: row.fixFilter ? /* @__PURE__ */ jsx8(Tooltip3, { title: `Plantillas {{var}} \u2014 ${FIX_FILTER_VAR_HINT}`, children: /* @__PURE__ */ jsx8(Typography4, { variant: "caption", color: "text.secondary", sx: { wordBreak: "break-all" }, children: formatFixFilter(row.fixFilter) }) }) : /* @__PURE__ */ jsx8(Typography4, { variant: "caption", color: "text.disabled", children: "\u2014" }) }),
          /* @__PURE__ */ jsx8(TableCell, { children: canEdit && !isVisitante && !visitanteRouteLocked(row.key) ? /* @__PURE__ */ jsx8(
            AccessModeSelect,
            {
              value: row.mode,
              scoped: !!row.scoped,
              disabled: wildcard,
              onChange: (mode) => onRouteMode(row.key, mode)
            }
          ) : isVisitante && visitanteRouteLocked(row.key) ? /* @__PURE__ */ jsx8(
            Chip3,
            {
              size: "small",
              color: "info",
              variant: "outlined",
              icon: /* @__PURE__ */ jsx8(Icon, { icon: "mdi:lock", size: 14 }),
              label: "Alcance: propio (fijo)"
            }
          ) : /* @__PURE__ */ jsx8(ModeChip, { mode: row.mode }) })
        ] }, row.key);
      }) })
    ] })
  ] });
}
function RoutePermCatalog({ routes, flags, permisos, canEdit, onRoutesChange, isVisitante }) {
  const [newKey, setNewKey] = useState5("");
  const wildcard = flags?.["*"] || isWildcardRole(permisos);
  const view = useMemo3(() => {
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
  return /* @__PURE__ */ jsxs5(Box4, { className: "permisos-route-catalog", children: [
    /* @__PURE__ */ jsxs5(Stack3, { direction: "row", alignItems: "center", justifyContent: "space-between", sx: { mb: 1 }, children: [
      /* @__PURE__ */ jsx8(Typography4, { variant: "subtitle2", fontWeight: 700, children: "Rutas API" }),
      /* @__PURE__ */ jsx8(Chip3, { size: "small", variant: "outlined", label: `${activeCount} activas` })
    ] }),
    isVisitante ? /* @__PURE__ */ jsxs5(Alert, { severity: "info", sx: { mb: 1.5 }, icon: /* @__PURE__ */ jsx8(Icon, { icon: "mdi:account-lock-outline", size: 18 }), children: [
      "Alcance fijo por ",
      /* @__PURE__ */ jsx8("code", { children: "fixFilter" }),
      " de sesi\xF3n (",
      /* @__PURE__ */ jsx8("code", { children: "itercero" }),
      ", ",
      /* @__PURE__ */ jsx8("code", { children: "icontacto" }),
      "). El ISS fusiona ese filtro con la petici\xF3n y siempre gana sobre query o ",
      /* @__PURE__ */ jsx8("code", { children: "f.eq" }),
      "."
    ] }) : null,
    wildcard ? /* @__PURE__ */ jsxs5(Alert, { severity: "info", sx: { mb: 1.5 }, icon: /* @__PURE__ */ jsx8(Icon, { icon: "mdi:asterisk", size: 18 }), children: [
      "Acceso total (",
      /* @__PURE__ */ jsx8("code", { children: "*" }),
      ") \u2014 todas las rutas quedan cubiertas por el wildcard."
    ] }) : null,
    !view.groups.length && !view.extras.length ? /* @__PURE__ */ jsx8(Typography4, { variant: "body2", color: "text.secondary", children: "Sin rutas activas para este rol." }) : /* @__PURE__ */ jsxs5(Stack3, { spacing: 2, className: "permisos-route-catalog__groups", children: [
      view.groups.map((g) => /* @__PURE__ */ jsx8(RouteGroupSection, { title: g.title, routes: g.routes, canEdit, wildcard, onRouteMode, isVisitante }, g.id)),
      view.extras.length ? /* @__PURE__ */ jsx8(RouteGroupSection, { title: "Otras claves", routes: view.extras, canEdit, wildcard, onRouteMode, isVisitante }) : null
    ] }),
    canEdit && !wildcard && !isVisitante ? /* @__PURE__ */ jsxs5(Stack3, { direction: { xs: "column", sm: "row" }, spacing: 1, sx: { mt: 1.5 }, children: [
      /* @__PURE__ */ jsx8(
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
      /* @__PURE__ */ jsx8(ButtonIconify, { icon: "mdi:plus", title: "Agregar", label: "Agregar", onClick: addRow, disabled: !newKey.trim() })
    ] }) : null
  ] });
}
function RoleConfigEditor({ entry, roleName, canManage, canEditRoleDescriptions, onChange }) {
  const canEditPermisos = !!canManage;
  const canEditMeta = canManage || canEditRoleDescriptions;
  const resolvedRole = roleName ?? String(entry?.iusuario ?? "").trim().toLowerCase().replace(/^role:/i, "");
  const isVisitante = isVisitanteRole(resolvedRole);
  const [namedisplay, setNamedisplay] = useState5(roleNamedisplay(entry?.permisos));
  const [desc, setDesc] = useState5(roleDescripcion(entry?.permisos));
  const [flags, setFlags] = useState5(() => splitRolePermisos(entry?.permisos).flags);
  const [routes, setRoutes] = useState5(() => routesArrayFromPermisos(entry?.permisos, canEditPermisos));
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
  return /* @__PURE__ */ jsxs5(Stack3, { spacing: 3, className: "permisos-role-config-editor", children: [
    canEditMeta ? /* @__PURE__ */ jsxs5(Box4, { component: "section", className: "permisos-role-config-editor__meta", children: [
      /* @__PURE__ */ jsx8(Typography4, { variant: "subtitle2", fontWeight: 700, sx: { mb: 1.25 }, children: "Metadatos del rol" }),
      /* @__PURE__ */ jsxs5(Stack3, { spacing: 1.5, children: [
        /* @__PURE__ */ jsx8(
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
        /* @__PURE__ */ jsx8(
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
    ] }) : /* @__PURE__ */ jsxs5(Box4, { component: "section", className: "permisos-role-config-editor__meta permisos-role-config-editor__meta--readonly", children: [
      /* @__PURE__ */ jsx8(Typography4, { variant: "subtitle2", fontWeight: 700, sx: { mb: 0.75 }, children: roleNamedisplay(entry?.permisos) || roleTitleFromEntry(entry) }),
      roleDescripcion(entry?.permisos) ? /* @__PURE__ */ jsx8(Typography4, { variant: "body2", color: "text.secondary", children: roleDescripcion(entry?.permisos) }) : null
    ] }),
    /* @__PURE__ */ jsx8(Divider, { className: "permisos-role-config-divider" }),
    /* @__PURE__ */ jsxs5(Box4, { component: "section", className: "permisos-role-config-editor__flags", children: [
      /* @__PURE__ */ jsx8(Typography4, { variant: "subtitle2", fontWeight: 700, sx: { mb: 0.75 }, children: "Privilegios globales" }),
      isVisitante ? /* @__PURE__ */ jsx8(Typography4, { variant: "body2", color: "text.secondary", children: "El rol visitante no usa privilegios globales ni acceso total." }) : /* @__PURE__ */ jsx8(Stack3, { spacing: 0.25, children: FLAG_DEFS.map((f) => /* @__PURE__ */ jsx8(Tooltip3, { title: f.hint, placement: "right", children: /* @__PURE__ */ jsx8(
        FormControlLabel,
        {
          control: /* @__PURE__ */ jsx8(
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
          label: /* @__PURE__ */ jsx8(Typography4, { variant: "body2", fontWeight: flags[f.key] ? 600 : 400, children: f.label })
        }
      ) }, f.key)) })
    ] }),
    /* @__PURE__ */ jsx8(Divider, { className: "permisos-role-config-divider" }),
    /* @__PURE__ */ jsx8(Box4, { component: "section", className: "permisos-role-config-editor__routes", children: /* @__PURE__ */ jsx8(
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
import { jsx as jsx9, jsxs as jsxs6 } from "react/jsx-runtime";
var { useState: useState6, useMemo: useMemo4, useCallback: useCallback3, useEffect: useEffect6 } = getReact();
var { Box: Box5, Typography: Typography5, Button: Button3, Dialog, DialogTitle, DialogContent: DialogContent3, DialogActions: DialogActions2, TextField: TextField3, Alert: Alert2, CircularProgress: CircularProgress3, Stack: Stack4, Chip: Chip4 } = getMaterialUI();
var EMPTY_PERMISOS = Object.freeze({});
function RoleHierarchyView(props) {
  const { nodes, roleEntries, canManagePermisos, canEditRoleDescriptions, initialSelectedRole, onSaveRolePermisos, canMutate, busy, onSave, onSaveLocalPerm, onPromote, onCreate, onDelete } = props;
  const [selectedJer, setSelectedJer] = useState6(null);
  const [editTarget, setEditTarget] = useState6(null);
  const [visitanteDraft, setVisitanteDraft] = useState6(null);
  const [visitanteSaving, setVisitanteSaving] = useState6(false);
  const [roleDraft, setRoleDraft] = useState6(null);
  const [roleSaving, setRoleSaving] = useState6(false);
  const currentEditNode = useMemo4(
    () => selectedJer ? nodes.find((n) => n.jerarquia === selectedJer) ?? null : null,
    [selectedJer, nodes]
  );
  const visitanteEntry = useMemo4(() => getVisitanteRoleEntry({ roles: roleEntries ?? [] }), [roleEntries]);
  const currentRoleEntry = useMemo4(() => {
    if (!currentEditNode) return null;
    const key = String(currentEditNode.iusuario ?? "").trim().toLowerCase();
    return (roleEntries ?? []).find((e) => roleNameFromEntry(e) === key) ?? { iusuario: key, permisos: EMPTY_PERMISOS, bactivo: true };
  }, [currentEditNode, roleEntries]);
  const visitantePermisosSig = useMemo4(
    () => JSON.stringify(visitanteEntry.permisos ?? EMPTY_PERMISOS),
    [visitanteEntry.permisos]
  );
  const rolePermisosSig = useMemo4(
    () => currentRoleEntry ? JSON.stringify(currentRoleEntry.permisos ?? EMPTY_PERMISOS) : "",
    [currentRoleEntry?.iusuario, currentRoleEntry?.permisos]
  );
  const roleEditorEntry = useMemo4(() => {
    if (!currentRoleEntry) return null;
    const permisos = roleDraft ?? currentRoleEntry.permisos ?? EMPTY_PERMISOS;
    return { ...currentRoleEntry, permisos };
  }, [currentRoleEntry, roleDraft]);
  useEffect6(() => {
    if (!initialSelectedRole || !nodes.length) return;
    const key = String(initialSelectedRole).trim().toLowerCase();
    const node = nodes.find((n) => String(n.iusuario ?? "").trim().toLowerCase() === key);
    if (node?.jerarquia) setSelectedJer((prev) => prev === node.jerarquia ? prev : node.jerarquia);
  }, [initialSelectedRole, nodes]);
  useEffect6(() => {
    if (!selectedJer) {
      setVisitanteDraft(null);
      setRoleDraft(null);
      return;
    }
    const node = nodes.find((n) => n.jerarquia === selectedJer);
    if (!node) return;
    if (isVisitanteRole(node.iusuario)) {
      setRoleDraft(null);
      const next2 = enforceVisitantePermisos(visitanteEntry.permisos ?? EMPTY_PERMISOS);
      setVisitanteDraft((prev) => prev && JSON.stringify(prev) === JSON.stringify(next2) ? prev : next2);
      return;
    }
    setVisitanteDraft(null);
    const key = String(node.iusuario ?? "").trim().toLowerCase();
    const entry = (roleEntries ?? []).find((e) => roleNameFromEntry(e) === key);
    const next = { ...entry?.permisos ?? EMPTY_PERMISOS };
    setRoleDraft((prev) => prev && JSON.stringify(prev) === JSON.stringify(next) ? prev : next);
  }, [selectedJer, visitantePermisosSig, rolePermisosSig, nodes, roleEntries, visitanteEntry]);
  const openCreateDialog = useCallback3(() => {
    setEditTarget({
      isNew: true,
      node: { iusuario: "", jerarquia: "", namedisplay: null, descripcion: null }
    });
  }, []);
  const customs = useMemo4(
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
  const manifest = useMemo4(() => ({ ...ROLE_HIERARCHY_MANIFEST, countLabel }), [countLabel]);
  const IsaSplitView = getIsaSplitView();
  const treePanel = /* @__PURE__ */ jsx9(
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
  const editorPanel = currentEditNode ? isVisitanteRole(currentEditNode.iusuario) ? /* @__PURE__ */ jsxs6(Box5, { className: "role-hierarchy-visitante-editor", sx: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "auto" }, children: [
    /* @__PURE__ */ jsxs6(Stack4, { direction: "row", alignItems: "center", spacing: 1, sx: { px: 2, pt: 2, pb: 1, flexShrink: 0 }, children: [
      /* @__PURE__ */ jsx9(Typography5, { variant: "h6", sx: { flex: 1 }, children: currentEditNode.namedisplay ?? "Visitante" }),
      /* @__PURE__ */ jsx9(Chip4, { size: "small", label: currentEditNode.jerarquia })
    ] }),
    /* @__PURE__ */ jsx9(Box5, { sx: { flex: 1, minHeight: 0, overflow: "auto", px: 2, pb: 2 }, children: /* @__PURE__ */ jsx9(
      RoleConfigEditor,
      {
        entry: visitanteDraft ? { ...visitanteEntry, permisos: visitanteDraft } : visitanteEntry,
        roleName: "visitante",
        canManage: !!canManagePermisos,
        canEditRoleDescriptions: !!canEditRoleDescriptions,
        onChange: (permisos) => setVisitanteDraft(enforceVisitantePermisos(permisos))
      },
      `visitante-${visitantePermisosSig}`
    ) }),
    (canManagePermisos || canEditRoleDescriptions) && onSaveRolePermisos ? /* @__PURE__ */ jsx9(Stack4, { direction: "row", justifyContent: "flex-end", spacing: 1, sx: { px: 2, py: 1.5, flexShrink: 0, borderTop: 1, borderColor: "divider" }, children: /* @__PURE__ */ jsx9(
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
        children: visitanteSaving ? /* @__PURE__ */ jsx9(CircularProgress3, { size: 18, color: "inherit" }) : "Guardar visitante"
      }
    ) }) : null
  ] }) : /* @__PURE__ */ jsxs6(Box5, { className: "role-hierarchy-role-editor", sx: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "auto" }, children: [
    /* @__PURE__ */ jsxs6(Stack4, { direction: "row", alignItems: "center", spacing: 1, sx: { px: 2, pt: 2, pb: 1, flexShrink: 0 }, children: [
      /* @__PURE__ */ jsx9(Typography5, { variant: "h6", sx: { flex: 1 }, children: currentEditNode.namedisplay ?? currentEditNode.iusuario }),
      /* @__PURE__ */ jsx9(Chip4, { size: "small", label: currentEditNode.jerarquia })
    ] }),
    /* @__PURE__ */ jsx9(Box5, { sx: { flex: 1, minHeight: 0, overflow: "auto", px: 2, pb: 2 }, children: /* @__PURE__ */ jsx9(
      RoleConfigEditor,
      {
        entry: roleEditorEntry ?? { iusuario: currentEditNode.iusuario, permisos: EMPTY_PERMISOS, bactivo: true },
        roleName: currentEditNode.iusuario,
        canManage: !!canManagePermisos,
        canEditRoleDescriptions: !!canEditRoleDescriptions,
        onChange: (permisos) => setRoleDraft(permisos)
      },
      `${currentEditNode.iusuario}-${rolePermisosSig}`
    ) }),
    (canManagePermisos || canEditRoleDescriptions) && onSaveRolePermisos ? /* @__PURE__ */ jsx9(Stack4, { direction: "row", justifyContent: "flex-end", spacing: 1, sx: { px: 2, py: 1.5, flexShrink: 0, borderTop: 1, borderColor: "divider" }, children: /* @__PURE__ */ jsx9(
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
        children: roleSaving ? /* @__PURE__ */ jsx9(CircularProgress3, { size: 18, color: "inherit" }) : "Guardar rol"
      }
    ) }) : null
  ] }) : /* @__PURE__ */ jsxs6(Box5, { sx: { p: 4, textAlign: "center", color: "text.secondary", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }, children: [
    /* @__PURE__ */ jsx9("iconify-icon", { icon: "mdi:family-tree", width: "48", height: "48" }),
    /* @__PURE__ */ jsx9(Typography5, { variant: "body1", sx: { mt: 2 }, children: "Selecciona un rol del \xE1rbol \u2014 visitante incluye editor de permisos completo." }),
    !canMutate ? /* @__PURE__ */ jsx9(Typography5, { variant: "caption", color: "text.secondary", sx: { display: "block", mt: 1 }, children: "(Solo roles de branch 0 pueden editar la jerarqu\xEDa.)" }) : null
  ] });
  return /* @__PURE__ */ jsxs6(Box5, { className: "role-hierarchy-tree isp-tree-host", sx: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }, children: [
    /* @__PURE__ */ jsx9(
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
        children: /* @__PURE__ */ jsx9(Box5, { className: "role-hierarchy-editor-panel", sx: { flex: 1, minWidth: 0, minHeight: 0, overflow: "auto", height: "100%" }, children: editorPanel })
      }
    ),
    /* @__PURE__ */ jsx9(
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
  const [name, setName] = useState6(target?.node.iusuario ?? "");
  const [jerarquia, setJerarquia] = useState6(isNew ? "" : target?.node.jerarquia ?? "");
  const [err, setErr] = useState6("");
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
  return /* @__PURE__ */ jsxs6(Dialog, { open: true, onClose, maxWidth: "sm", fullWidth: true, children: [
    /* @__PURE__ */ jsx9(DialogTitle, { children: isNew ? "Nuevo rol" : `Mover ${target.node.iusuario}` }),
    /* @__PURE__ */ jsx9(DialogContent3, { dividers: true, children: /* @__PURE__ */ jsxs6(Stack4, { spacing: 2, children: [
      err ? /* @__PURE__ */ jsx9(Alert2, { severity: "error", children: err }) : null,
      /* @__PURE__ */ jsx9(TextField3, { label: "Nombre", value: name, onChange: (e) => setName(e.target.value), disabled: !isNew, helperText: "min\xFAsculas, sin espacios (ej. dev_lead)" }),
      /* @__PURE__ */ jsx9(TextField3, { label: "Nueva jerarqu\xEDa", value: jerarquia, onChange: (e) => setJerarquia(e.target.value), helperText: "dot-notation: 0, 0.0, 0.1.1, ..." }),
      /* @__PURE__ */ jsx9(Alert2, { severity: "info", children: "Los ancestros se derivan del path. Arrastra un rol sobre otro (antes / dentro / despu\xE9s) para reubicarlo." })
    ] }) }),
    /* @__PURE__ */ jsxs6(DialogActions2, { children: [
      /* @__PURE__ */ jsx9(Button3, { onClick: onClose, disabled: busy, children: "Cancelar" }),
      /* @__PURE__ */ jsx9(Button3, { variant: "contained", onClick: handleSubmit, disabled: busy, children: busy ? /* @__PURE__ */ jsx9(CircularProgress3, { size: 16 }) : "Guardar" })
    ] })
  ] });
}
export {
  RoleHierarchyView
};
