// js/core/patyia.ts
window.ISAFront.migrateLegacyGatewayKeys?.({ "jeff:gateway-local": "", "patyia-apptools:gateway-local": "", "patyia-apptools:lab-local": "" });
var PATYIA_ISS_LOCAL = "http://127.0.0.1:8802";
var PATYIA_BRIDGE_LOCAL = `${PATYIA_ISS_LOCAL}/api`;

// js/core/platform.ts
var getReact = () => window.ISAFront.getReact();
var getMaterialUI = () => window.ISAFront.getMaterialUI();

// js/ui/treeView/TreeRowItem.tsx
import * as React from "react";

// js/ui/treeView/treeDrag.ts
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
function defaultCanDrop(sourcePath, targetPath, zone, isDescendant) {
  if (!zone || !sourcePath || !targetPath || sourcePath === targetPath) return false;
  return !isDescendant(targetPath, sourcePath);
}

// js/ui/treeView/TreeRowItem.tsx
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

// js/ui/treeView/treeData.ts
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

// js/ui/treeView/TreeView.tsx
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
export {
  TreeRowItem,
  TreeView,
  buildTreeFromFlatList,
  collectPathsWithChildren,
  defaultCanDrop,
  findTreeNodeByPath,
  resolveDragZone,
  summaryDragClass
};
