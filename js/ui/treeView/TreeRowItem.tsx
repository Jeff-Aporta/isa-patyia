/**
 * Fila recursiva del TreeView — espejo _asRow/_rowItem.svelte.
 */

import * as React from "react";
import type { DragEvent as ReactDragEvent, MouseEvent as ReactMouseEvent } from "react";
import { getMaterialUI } from "../../core/platform.ts";
import { resolveDragZone, summaryDragClass } from "./treeDrag.js";
import type { DragOverZone, TreeINode, TreeRowDragState, TreeViewCustoms, TreeViewManifest } from "./contracts.js";

const { IconButton, Tooltip } = getMaterialUI();

export interface TreeRowItemProps<T extends Record<string, unknown>> {
  nodes: TreeINode<T>[];
  items: T[];
  manifest: TreeViewManifest;
  customs: TreeViewCustoms<T>;
  collapsed: Set<string>;
  selectedPath: string | null;
  highlightedPath: string | null;
  canMutate: boolean;
  drag: TreeRowDragState;
  onToggleCollapse: (path: string, open: boolean) => void;
  onSelect: (path: string) => void;
  onDragStart: (path: string, rowHeight: number) => void;
  onDragOver: (path: string, zone: DragOverZone, forbidden: boolean) => void;
  onDragLeave: (path: string) => void;
  onDragEnd: () => void;
  onDrop: (sourcePath: string, targetPath: string, zone: DragOverZone) => void;
}

interface RowProps<T extends Record<string, unknown>> extends Omit<TreeRowItemProps<T>, "nodes"> {
  node: TreeINode<T>;
}

function TreeRow<T extends Record<string, unknown>>({ node, ...ctx }: RowProps<T>): React.ReactElement {
  const {
    items, manifest, customs, collapsed, selectedPath, highlightedPath, canMutate, drag,
    onToggleCollapse, onSelect, onDragStart, onDragOver, onDragLeave, onDragEnd, onDrop,
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
  const helper = features.showHelper !== false ? (customs.getHelper?.(node) ?? null) : null;
  const pathLabel = features.showPathLabel !== false ? (customs.getPathLabel?.(node) ?? path) : null;
  const grouperIcons = customs.getGrouperIcons?.(iconCtx) ?? {
    open: icons.grouperOpen ?? "mdi:folder-open",
    closed: icons.grouperClosed ?? "mdi:folder",
    color: icons.grouperColor ?? "#FFA000",
  };
  const leafIcon = customs.getLeafIcon?.(iconCtx) ?? icons.leaf ?? "mdi:circle-small";
  const rowActions = features.rowActions !== false && canMutate ? (customs.rowActions?.(node) ?? []) : [];

  const detailsRef = React.useRef<HTMLDetailsElement>(null);
  const dragEnterCount = React.useRef(0);
  const cachedRect = React.useRef<{ top: number; height: number } | null>(null);

  const summaryClass = [
    "trvwr-itm-sum",
    isHighlighted ? "trvwr-itm-sum--focused" : "",
    summaryDragClass(dragZone, dragForbidden),
    !canMutate ? "trvwr-itm-sum--disabled" : "",
  ].filter(Boolean).join(" ");

  const detailsClass = [
    "trvwr-itm",
    isHighlighted ? "highlight" : "",
    isDragging ? "trvwr-itm--dragging" : "",
    isSelected && isGrouper ? "trvwr-itm--folder-selected" : "",
    isSelected ? "trvwr-itm--active" : "",
  ].filter(Boolean).join(" ");

  const handleToggle = (e: React.SyntheticEvent<HTMLDetailsElement>) => {
    if (!canMutate || features.collapse === false) {
      e.preventDefault();
      if (detailsRef.current) detailsRef.current.open = isOpen;
      return;
    }
    const open = (e.currentTarget as HTMLDetailsElement).open;
    if (open !== isOpen) {
      onToggleCollapse(path, open);
      customs.onExpand?.(node, open);
    }
  };

  const handleSummaryClick = (e: ReactMouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
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

  const handleDragStart = (e: ReactDragEvent<HTMLElement>) => {
    if (!dragEnabled) { e.preventDefault(); return; }
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", path);
    const summary = (e.currentTarget as HTMLElement).closest("summary") ?? e.currentTarget;
    const h = Math.max(24, Math.round(summary.getBoundingClientRect().height));
    e.dataTransfer.setData("application/x-trvwr-row-height", String(h));
    onDragStart(path, h);
  };

  const handleDragOver = (e: ReactDragEvent<HTMLElement>) => {
    if (!dragEnabled || !drag.sourcePath) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (drag.sourcePath === path) return;
    if (!cachedRect.current) {
      const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
      cachedRect.current = { top: r.top, height: r.height };
    }
    const rect = cachedRect.current;
    const zone = resolveDragZone(e.clientY, rect.top, rect.height, isGrouper);
    const canDropFn = customs.canDrop ?? (() => true);
    const forbidden = !canDropFn(drag.sourcePath, path, zone, items);
    onDragOver(path, zone, forbidden);
  };

  const handleDragEnter = () => { dragEnterCount.current++; cachedRect.current = null; };
  const handleDragLeave = () => {
    dragEnterCount.current--;
    if (dragEnterCount.current <= 0) {
      dragEnterCount.current = 0;
      cachedRect.current = null;
      onDragLeave(path);
    }
  };

  const handleDrop = (e: ReactDragEvent<HTMLElement>) => {
    e.preventDefault();
    dragEnterCount.current = 0;
    cachedRect.current = null;
    const sourcePath = e.dataTransfer.getData("text/plain") || drag.sourcePath;
    const zone = drag.overPath === path ? drag.overZone : null;
    if (!sourcePath || !zone || drag.forbidden || sourcePath === path) { onDragEnd(); return; }
    onDrop(sourcePath, path, zone);
  };

  const handleDragEnd = () => {
    dragEnterCount.current = 0;
    cachedRect.current = null;
    onDragEnd();
  };

  return (
    <div className="trvwr-row-host" data-flatpath={path}>
      <details ref={detailsRef} className={detailsClass} open={isOpen} onToggle={handleToggle} aria-disabled={!canMutate || undefined}>
        <summary
          className={summaryClass}
          role="treeitem"
          aria-selected={isSelected}
          aria-expanded={isGrouper ? isOpen : undefined}
          draggable={dragEnabled}
          onClick={handleSummaryClick}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="trvwr-sum-row">
            {dragEnabled ? (
              <span className="trvwr-drag-handle" title="Arrastrar para reordenar" draggable onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <iconify-icon icon={icons.dragHandle ?? "mdi:dots-grid"} style={{ fontSize: "1rem", opacity: 0.45 }} />
              </span>
            ) : null}

            {isGrouper ? (
              <span className="trvwr-itm-symb">
                <span className={`trvwr-chevron${isOpen ? "" : " trvwr-chevron--closed"}`}>
                  <iconify-icon icon={icons.chevron ?? "mdi:chevron-down"} style={{ fontSize: "1rem" }} />
                </span>
                <iconify-icon icon={isOpen ? grouperIcons.open : grouperIcons.closed} style={{ fontSize: "1rem", color: grouperIcons.color }} />
              </span>
            ) : (
              <span className="trvwr-itm-symb">
                <iconify-icon icon={leafIcon} style={{ fontSize: "1rem", opacity: 0.75 }} />
              </span>
            )}

            <div className="trvwr-itm-content">
              <span className="trvwr-itm-label" title={label}>
                {label}
                {pathLabel ? <span className="trvwr-itm-path">{pathLabel}</span> : null}
              </span>
              {helper ? <span className="trvwr-itm-helper"><small>{helper}</small></span> : null}
            </div>

            {rowActions.length ? (
              <div className="trvwr-float-card" role="presentation" onClick={(e) => e.stopPropagation()}>
                {rowActions.map((act) => (
                  <Tooltip key={act.id} title={act.title}>
                    <IconButton size="small" aria-label={act.title} disabled={act.disabled} onClick={act.onClick}>
                      <iconify-icon icon={act.icon} width="16" height="16" />
                    </IconButton>
                  </Tooltip>
                ))}
              </div>
            ) : null}

            {customs.renderRowExtra?.(node)}
          </div>
        </summary>

        {isGrouper && isOpen ? (
          <div className="trvwr-itm-childrens-wrap">
            <div className="trvwr-itm-childrens" role="group">
              <TreeRowItem nodes={node.childrens} {...ctx} />
            </div>
          </div>
        ) : null}
      </details>
    </div>
  );
}

export function TreeRowItem<T extends Record<string, unknown>>(props: TreeRowItemProps<T>): React.ReactElement | null {
  const { nodes, ...ctx } = props;
  if (!nodes?.length) return null;
  return (
    <>
      {nodes.map((node) => (
        <TreeRow key={node.pathInit} node={node} nodes={nodes} {...ctx} />
      ))}
    </>
  );
}
