// ../../Personal/apps/isa-patyia/frontend/js/ui/treeView/TreeRowItem.tsx
import * as React from "react";

// ../../Personal/apps/isa-patyia/frontend/js/core/patyia.ts
window.ISAFront.migrateLegacyGatewayKeys?.({ "jeff:gateway-local": "", "patyia-apptools:gateway-local": "", "patyia-apptools:lab-local": "" });
var PATYIA_ISS_LOCAL = "http://127.0.0.1:8802";
var PATYIA_BRIDGE_LOCAL = `${PATYIA_ISS_LOCAL}/api`;

// ../../Personal/apps/isa-patyia/frontend/js/core/platform.ts
var getMaterialUI = () => window.ISAFront.getMaterialUI();

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
export {
  TreeRowItem
};
