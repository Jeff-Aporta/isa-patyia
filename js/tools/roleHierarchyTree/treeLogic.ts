/**
 * Lógica pura del árbol de jerarquía — sin React, sin DOM.
 * Adaptado del Svelte _treeAdapter.
 */

import { ancestorsFromPath, compareHierarchy } from "../roleHierarchy.js";
import type { HierarchyNode, TreeINode, TreeRow, DragOverZone } from "./types.js";

export type { TreeRow };

/** Construye filas planas del árbol a partir de una lista de nodos. */
export function buildTreeRows(nodes: HierarchyNode[]): TreeRow[] {
  const unique = dedupeNodes(nodes);
  const byJerarquia = new Map<string, TreeRow>();
  const childrenOf = new Map<string, string[]>();

  for (const n of unique) {
    byJerarquia.set(n.jerarquia, {
      ...n,
      flatPath: n.jerarquia,
      pathInit: n.jerarquia,
      hasChildren: false,
      isCollapsed: false,
      depth: 0,
      isSelected: false,
    });
  }

  for (const [jer] of byJerarquia) {
    const parentJer = immediateParentJer(jer);
    if (!parentJer || !byJerarquia.has(parentJer)) continue;
    if (!childrenOf.has(parentJer)) childrenOf.set(parentJer, []);
    if (!childrenOf.get(parentJer)!.includes(jer)) childrenOf.get(parentJer)!.push(jer);
  }

  const visited = new Set<string>();
  const computeDepth = (jer: string, depth: number): void => {
    if (visited.has(jer)) return;
    visited.add(jer);
    const row = byJerarquia.get(jer);
    if (!row) return;
    row.depth = depth;
    const kids = childrenOf.get(jer) ?? [];
    row.hasChildren = kids.length > 0;
    for (const kid of kids) computeDepth(kid, depth + 1);
  };

  for (const n of unique) {
    if (!visited.has(n.jerarquia)) computeDepth(n.jerarquia, 0);
  }

  return Array.from(byJerarquia.values());
}

function immediateParentJer(jer: string): string | null {
  const ancestors = ancestorsFromPath(jer);
  return ancestors.length > 1 ? ancestors[1] : null;
}

function dedupeNodes(nodes: HierarchyNode[]): HierarchyNode[] {
  const seen = new Map<string, HierarchyNode>();
  for (const n of nodes) {
    const j = String(n.jerarquia ?? "").trim();
    if (j && !seen.has(j)) seen.set(j, n);
  }
  return Array.from(seen.values());
}

function hasKnownParent(jer: string, byJer: Map<string, TreeINode>): boolean {
  const parent = immediateParentJer(jer);
  return !!parent && byJer.has(parent);
}

/** Construye árbol jerárquico con childrens[] (espejo objRootsToNodes). */
export function buildTreeNodes(nodes: HierarchyNode[]): TreeINode[] {
  const rows = buildTreeRows(dedupeNodes(nodes));
  const byJer = new Map<string, TreeINode>(
    rows.map((r) => [r.jerarquia, { ...r, childrens: [] as TreeINode[] }]),
  );

  const roots: TreeINode[] = [];
  for (const row of rows) {
    const node = byJer.get(row.jerarquia)!;
    const parentJer = immediateParentJer(row.jerarquia);
    const parent = parentJer ? byJer.get(parentJer) : undefined;
    if (parent) {
      parent.childrens.push(node);
      parent.hasChildren = true;
    } else if (!hasKnownParent(row.jerarquia, byJer)) {
      roots.push(node);
    }
  }

  const sortRec = (list: TreeINode[]): void => {
    list.sort((a, b) => compareHierarchy(a.jerarquia, b.jerarquia));
    for (const n of list) sortRec(n.childrens);
  };
  sortRec(roots);
  return roots;
}

/** ¿targetJer es descendiente de ancestorJer? */
export function isDescendant(targetJer: string, ancestorJer: string): boolean {
  if (targetJer === ancestorJer) return true;
  return ancestorsFromPath(targetJer).includes(ancestorJer);
}

export function canDrop(sourceJer: string, targetJer: string, position: DragOverZone | null, _nodes: HierarchyNode[]): boolean {
  if (!position || !sourceJer || !targetJer || sourceJer === targetJer) return false;
  if (isDescendant(targetJer, sourceJer)) return false;
  return true;
}

function nextChildJer(parentJer: string, existing: Set<string>): string {
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

/** Calcula la nueva jerarquía tras soltar source sobre target. */
export function computeDropJerarquia(
  sourceJer: string,
  targetJer: string,
  position: DragOverZone,
  nodes: HierarchyNode[],
): string | null {
  if (!canDrop(sourceJer, targetJer, position, nodes)) return null;
  const existing = new Set(nodes.map((n) => n.jerarquia).filter((j) => j !== sourceJer));

  if (position === "into") return nextChildJer(targetJer, existing);

  const targetParent = immediateParentJer(targetJer);
  const siblings = nodes
    .filter((n) => n.jerarquia !== sourceJer)
    .filter((n) => immediateParentJer(n.jerarquia) === targetParent)
    .map((n) => n.jerarquia)
    .sort((a, b) => compareHierarchy(a, b));

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

/** Detecta si mover `jer` bajo `newParentJer` crearía un ciclo. */
export function wouldCycle(jer: string, newParentJer: string, allNodes: HierarchyNode[]): boolean {
  return isDescendant(newParentJer, jer);
}

/** Zona de drop según posición del puntero (espejo TRADrag.onsummarydragover). */
export function resolveDragZone(clientY: number, rectTop: number, rectHeight: number, isGrouper: boolean): DragOverZone {
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

export function summaryDragClass(dragOver: DragOverZone | null, forbidden: boolean): string {
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

export function countDescendants(node: TreeINode): number {
  return node.childrens.length;
}

/** @deprecated Usar buildTreeNodes + TreeRowItem recursivo. */
export function flattenForRender(rows: TreeRow[], collapsed: Set<string>): TreeRow[] {
  const out: TreeRow[] = [];
  const byJerarquia = new Map(rows.map((r) => [r.jerarquia, r] as const));
  const childrenOf = new Map<string, string[]>();

  for (const jer of byJerarquia.keys()) {
    const ancestors = ancestorsFromPath(jer);
    for (let i = 1; i < ancestors.length; i++) {
      const parentJer = ancestors[i];
      if (!childrenOf.has(parentJer)) childrenOf.set(parentJer, []);
      if (!childrenOf.get(parentJer)!.includes(jer)) childrenOf.get(parentJer)!.push(jer);
    }
  }

  const walk = (jer: string): void => {
    const row = byJerarquia.get(jer);
    if (!row) return;
    out.push(row);
    if (collapsed.has(jer)) return;
    const kids = (childrenOf.get(jer) ?? []).slice().sort();
    for (const kid of kids) walk(kid);
  };

  const roots = rows.filter((r) => !hasKnownParent(r.jerarquia, new Map(rows.map((r) => [r.jerarquia, { ...r, childrens: [] }])))).map((r) => r.jerarquia).sort();
  for (const r of roots) walk(r);
  return out;
}

export function addRow(rows: TreeRow[], node: HierarchyNode): TreeRow[] {
  if (rows.some((r) => r.jerarquia === node.jerarquia)) return rows;
  return [...rows, {
    ...node,
    flatPath: node.jerarquia,
    pathInit: node.jerarquia,
    hasChildren: false,
    isCollapsed: false,
    depth: 0,
    isSelected: false,
  }];
}

export function removeRow(rows: TreeRow[], jer: string): TreeRow[] {
  return rows.filter((r) => r.jerarquia !== jer);
}
