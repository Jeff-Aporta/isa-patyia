/**
 * Construcción de árbol jerárquico desde lista plana — sin React.
 */

import type { TreeBuildConfig, TreeINode } from "./contracts.js";

function dedupeItems<T>(items: T[], keyFn: (item: T) => string): T[] {
  const seen = new Map<string, T>();
  for (const item of items) {
    const key = keyFn(item);
    if (key && !seen.has(key)) seen.set(key, item);
  }
  return Array.from(seen.values());
}

function defaultSort<T>(a: TreeINode<T>, b: TreeINode<T>): number {
  return a.flatPath.localeCompare(b.flatPath, undefined, { numeric: true });
}

/** Construye árbol con childrens[] a partir de items planos (espejo objRootsToNodes). */
export function buildTreeFromFlatList<T extends Record<string, unknown>>(
  items: T[],
  config: TreeBuildConfig<T>,
): TreeINode<T>[] {
  const keyFn = config.dedupeKey ?? config.getFlatPath;
  const unique = dedupeItems(items, keyFn);
  const byPath = new Map<string, TreeINode<T>>();

  for (const item of unique) {
    const flatPath = String(config.getFlatPath(item) ?? "").trim();
    if (!flatPath) continue;
    byPath.set(flatPath, {
      flatPath,
      pathInit: flatPath,
      hasChildren: false,
      depth: 0,
      childrens: [],
      data: item,
    });
  }

  const childrenOf = new Map<string, string[]>();
  for (const [flatPath, node] of byPath) {
    const parentPath = config.getParentPath(flatPath, node.data);
    if (!parentPath || !byPath.has(parentPath)) continue;
    if (!childrenOf.has(parentPath)) childrenOf.set(parentPath, []);
    if (!childrenOf.get(parentPath)!.includes(flatPath)) childrenOf.get(parentPath)!.push(flatPath);
  }

  const visited = new Set<string>();
  const computeDepth = (path: string, depth: number): void => {
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

  const hasKnownParent = (path: string): boolean => {
    const node = byPath.get(path);
    if (!node) return false;
    const parent = config.getParentPath(path, node.data);
    return !!parent && byPath.has(parent);
  };

  const roots: TreeINode<T>[] = [];
  for (const node of byPath.values()) {
    const parentPath = config.getParentPath(node.flatPath, node.data);
    const parent = parentPath ? byPath.get(parentPath) : undefined;
    if (parent) {
      parent.childrens.push(node);
      parent.hasChildren = true;
    } else if (!hasKnownParent(node.flatPath)) {
      roots.push(node);
    }
  }

  const sortRec = (list: TreeINode<T>[]): void => {
    const cmp = config.sortSiblings ?? defaultSort;
    list.sort(cmp);
    for (const n of list) sortRec(n.childrens);
  };
  sortRec(roots);
  return roots;
}

export function findTreeNodeByPath<T>(roots: TreeINode<T>[], path: string): TreeINode<T> | undefined {
  const walk = (nodes: TreeINode<T>[]): TreeINode<T> | undefined => {
    for (const n of nodes) {
      if (n.flatPath === path) return n;
      const hit = walk(n.childrens);
      if (hit) return hit;
    }
    return undefined;
  };
  return walk(roots);
}

export function collectPathsWithChildren<T>(roots: TreeINode<T>[]): string[] {
  const out: string[] = [];
  const walk = (nodes: TreeINode<T>[]) => {
    for (const n of nodes) {
      if (n.hasChildren) out.push(n.flatPath);
      walk(n.childrens);
    }
  };
  walk(roots);
  return out;
}
