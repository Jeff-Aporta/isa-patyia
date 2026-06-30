/**
 * Contratos del TreeView React — espejo de capacitacion/_comps/TreeView/contracts.ts.
 * Datos planos + manifest JSON + customs (callbacks) por caso de uso.
 */

import type * as React from "react";

export type DragOverZone = "before" | "after" | "into";

/** Nodo en árbol con hijos (espejo INode del Svelte). */
export interface TreeINode<T = Record<string, unknown>> {
  flatPath: string;
  pathInit: string;
  hasChildren: boolean;
  depth: number;
  childrens: TreeINode<T>[];
  data: T;
}

export interface TreeRowAction {
  id: string;
  icon: string;
  title: string;
  disabled?: boolean;
  onClick: () => void;
}

export interface TreeToolbarAction {
  id: string;
  icon: string;
  title: string;
  disabled?: boolean;
  hidden?: boolean;
  label?: string;
  variant?: "icon" | "button";
  onClick: () => void;
}

/** Manifest JSON — serializable, sin lógica de dominio. */
export interface TreeViewManifest {
  ariaLabel?: string;
  entrie?: string;
  entries?: string;
  emptyMessage?: string;
  countLabel?: string;
  icons?: {
    grouperOpen?: string;
    grouperClosed?: string;
    grouperColor?: string;
    leaf?: string;
    chevron?: string;
    dragHandle?: string;
  };
  features?: {
    drag?: boolean;
    collapse?: boolean;
    toolbarExpandCollapse?: boolean;
    rowActions?: boolean;
    showPathLabel?: boolean;
    showHelper?: boolean;
  };
}

export interface TreeRowRenderCtx<T> {
  node: TreeINode<T>;
  isOpen: boolean;
  isSelected: boolean;
  isGrouper: boolean;
  childCount: number;
}

export interface TreeIconCtx<T> extends TreeRowRenderCtx<T> {
  isExpanded: boolean;
}

export interface TreeBuildConfig<T> {
  getFlatPath: (item: T) => string;
  getParentPath: (flatPath: string, item: T) => string | null;
  dedupeKey?: (item: T) => string;
  sortSiblings?: (a: TreeINode<T>, b: TreeINode<T>) => number;
}

export interface TreeRuntime<T> {
  rootNodes: TreeINode<T>[];
  items: T[];
  selectedPath: string | null;
  collapsed: Set<string>;
  readonly: boolean;
  busy: boolean;
  collapseAll: () => void;
  expandAll: () => void;
  select: (path: string | null) => void;
  findByPath: (path: string) => TreeINode<T> | undefined;
}

export interface TreeViewCustoms<T> {
  build: TreeBuildConfig<T>;

  getLabel?: (node: TreeINode<T>) => string;
  getHelper?: (node: TreeINode<T>) => string | null;
  getPathLabel?: (node: TreeINode<T>) => string | null;

  getGrouperIcons?: (ctx: TreeIconCtx<T>) => { open: string; closed: string; color?: string };
  getLeafIcon?: (ctx: TreeIconCtx<T>) => string;

  isGrouper?: (node: TreeINode<T>) => boolean;

  canDrop?: (sourcePath: string, targetPath: string, zone: DragOverZone, items: T[]) => boolean;
  onDrop?: (sourcePath: string, targetPath: string, zone: DragOverZone, items: T[]) => void | Promise<void>;

  onSelect?: (node: TreeINode<T>) => void;
  onExpand?: (node: TreeINode<T>, open: boolean) => void;

  rowActions?: (node: TreeINode<T>) => TreeRowAction[];
  toolbarActions?: (runtime: TreeRuntime<T>) => TreeToolbarAction[];

  renderRowExtra?: (node: TreeINode<T>) => React.ReactNode;
}

export interface TreeViewProps<T extends Record<string, unknown>> {
  items: T[];
  manifest: TreeViewManifest;
  customs: TreeViewCustoms<T>;
  readonly?: boolean;
  busy?: boolean;
  selectedPath?: string | null;
  onSelectedPathChange?: (path: string | null) => void;
  className?: string;
  toolbarTitle?: string;
  toolbarExtra?: React.ReactNode;
  showToolbar?: boolean;
}

export interface TreeRowDragState {
  sourcePath: string | null;
  overPath: string | null;
  overZone: DragOverZone | null;
  forbidden: boolean;
}
