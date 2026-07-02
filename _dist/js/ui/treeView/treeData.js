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
export {
  buildTreeFromFlatList,
  collectPathsWithChildren,
  findTreeNodeByPath
};
