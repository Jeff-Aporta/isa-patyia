/**
 * Lógica pura del árbol de jerarquía — sin React, sin DOM.
 * Adaptado del Svelte _treeAdapter.
 *
 * Los ancestros se derivan del path jerárquico (split por "."):
 *   "0.1.1.1" → ["0.1.1.1", "0.1.1", "0.1", "0"]
 */

import { ancestorsFromPath } from "../roleHierarchy.js";
import type { HierarchyNode, RowOf } from "./types.js";

export type TreeRow = RowOf<HierarchyNode>;

/** Construye filas del árbol a partir de una lista plana de nodos. */
export function buildTreeRows(nodes: HierarchyNode[]): TreeRow[] {
  const byJerarquia = new Map<string, TreeRow>();
  const childrenOf = new Map<string, string[]>();

  for (const n of nodes) {
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

  // Construir relación parent → children a partir del path de cada jerarquía.
  for (const [jer] of byJerarquia) {
    const ancestors = ancestorsFromPath(jer);
    for (let i = 1; i < ancestors.length; i++) {
      const parentJer = ancestors[i];
      if (!byJerarquia.has(parentJer)) continue;
      if (!childrenOf.has(parentJer)) childrenOf.set(parentJer, []);
      if (!childrenOf.get(parentJer)!.includes(jer)) {
        childrenOf.get(parentJer)!.push(jer);
      }
    }
  }

  // Asignar depth y hasChildren recursivamente desde raíces.
  const visited = new Set<string>();
  const computeDepth = (jer: string, depth: number): void => {
    if (visited.has(jer)) return;
    visited.add(jer);
    const row = byJerarquia.get(jer);
    if (!row) return;
    row.depth = depth;
    const kids = childrenOf.get(jer) ?? [];
    row.hasChildren = kids.length > 0;
    for (const kid of kids) {
      computeDepth(kid, depth + 1);
    }
  };

  // Raíces = nodos cuyo path-ancestro inmediato no existe en el grafo.
  for (const n of nodes) {
    if (!visited.has(n.jerarquia)) {
      computeDepth(n.jerarquia, 0);
    }
  }

  return Array.from(byJerarquia.values());
}

/** Devuelve las filas ordenadas para renderizar (DFS, colapsadas respetadas). */
export function flattenForRender(rows: TreeRow[], collapsed: Set<string>): TreeRow[] {
  const out: TreeRow[] = [];
  const byJerarquia = new Map(rows.map((r) => [r.jerarquia, r] as const));
  const childrenOf = new Map<string, string[]>();

  for (const jer of byJerarquia.keys()) {
    const ancestors = ancestorsFromPath(jer);
    for (let i = 1; i < ancestors.length; i++) {
      const parentJer = ancestors[i];
      if (!childrenOf.has(parentJer)) childrenOf.set(parentJer, []);
      if (!childrenOf.get(parentJer)!.includes(jer)) {
        childrenOf.get(parentJer)!.push(jer);
      }
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

  // Raíces = nodos sin ancestro inmediato conocido en el grafo.
  const hasParent = (jer: string) => {
    const ancestors = ancestorsFromPath(jer);
    return ancestors.length > 1 && byJerarquia.has(ancestors[1]);
  };
  const roots = rows.filter((r) => !hasParent(r.jerarquia)).map((r) => r.jerarquia).sort();
  for (const r of roots) walk(r);

  return out;
}

/** Detecta si mover `jer` bajo `newParentJer` crearía un ciclo. */
export function wouldCycle(jer: string, newParentJer: string, allNodes: HierarchyNode[]): boolean {
  if (jer === newParentJer) return true;
  // ¿newParentJer es descendiente de jer?
  const byJer = new Map(allNodes.map((n) => [n.jerarquia, n]));
  const visited = new Set<string>();
  const walk = (j: string): boolean => {
    if (visited.has(j)) return false;
    visited.add(j);
    const node = byJer.get(j);
    if (!node) return false;
    for (const childJer of ancestorsFromPath(j).slice(1)) {
      if (childJer === jer) return true;
      if (walk(childJer)) return true;
    }
    return false;
  };
  return walk(newParentJer);
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