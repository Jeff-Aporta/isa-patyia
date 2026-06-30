// ../Personal/apps/isa-patyia/frontend/js/tools/roleHierarchy.js
function ancestorsFromPath(jerarquia) {
  const parts = String(jerarquia ?? "").split(".").filter(Boolean);
  const out = [];
  for (let i = parts.length - 1; i >= 0; i--) {
    out.push(parts.slice(0, i + 1).join("."));
  }
  return out;
}

// ../Personal/apps/isa-patyia/frontend/js/tools/roleHierarchyTree/treeLogic.ts
function buildTreeRows(nodes) {
  const byJerarquia = /* @__PURE__ */ new Map();
  const childrenOf = /* @__PURE__ */ new Map();
  for (const n of nodes) {
    byJerarquia.set(n.jerarquia, {
      ...n,
      flatPath: n.jerarquia,
      pathInit: n.jerarquia,
      hasChildren: false,
      isCollapsed: false,
      depth: 0,
      isSelected: false
    });
  }
  for (const [jer] of byJerarquia) {
    const ancestors = ancestorsFromPath(jer);
    for (let i = 1; i < ancestors.length; i++) {
      const parentJer = ancestors[i];
      if (!byJerarquia.has(parentJer)) continue;
      if (!childrenOf.has(parentJer)) childrenOf.set(parentJer, []);
      if (!childrenOf.get(parentJer).includes(jer)) {
        childrenOf.get(parentJer).push(jer);
      }
    }
  }
  const visited = /* @__PURE__ */ new Set();
  const computeDepth = (jer, depth) => {
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
  for (const n of nodes) {
    if (!visited.has(n.jerarquia)) {
      computeDepth(n.jerarquia, 0);
    }
  }
  return Array.from(byJerarquia.values());
}
function flattenForRender(rows, collapsed) {
  const out = [];
  const byJerarquia = new Map(rows.map((r) => [r.jerarquia, r]));
  const childrenOf = /* @__PURE__ */ new Map();
  for (const jer of byJerarquia.keys()) {
    const ancestors = ancestorsFromPath(jer);
    for (let i = 1; i < ancestors.length; i++) {
      const parentJer = ancestors[i];
      if (!childrenOf.has(parentJer)) childrenOf.set(parentJer, []);
      if (!childrenOf.get(parentJer).includes(jer)) {
        childrenOf.get(parentJer).push(jer);
      }
    }
  }
  const walk = (jer) => {
    const row = byJerarquia.get(jer);
    if (!row) return;
    out.push(row);
    if (collapsed.has(jer)) return;
    const kids = (childrenOf.get(jer) ?? []).slice().sort();
    for (const kid of kids) walk(kid);
  };
  const hasParent = (jer) => {
    const ancestors = ancestorsFromPath(jer);
    return ancestors.length > 1 && byJerarquia.has(ancestors[1]);
  };
  const roots = rows.filter((r) => !hasParent(r.jerarquia)).map((r) => r.jerarquia).sort();
  for (const r of roots) walk(r);
  return out;
}
function wouldCycle(jer, newParentJer, allNodes) {
  if (jer === newParentJer) return true;
  const byJer = new Map(allNodes.map((n) => [n.jerarquia, n]));
  const visited = /* @__PURE__ */ new Set();
  const walk = (j) => {
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
function addRow(rows, node) {
  if (rows.some((r) => r.jerarquia === node.jerarquia)) return rows;
  return [...rows, {
    ...node,
    flatPath: node.jerarquia,
    pathInit: node.jerarquia,
    hasChildren: false,
    isCollapsed: false,
    depth: 0,
    isSelected: false
  }];
}
function removeRow(rows, jer) {
  return rows.filter((r) => r.jerarquia !== jer);
}
export {
  addRow,
  buildTreeRows,
  flattenForRender,
  removeRow,
  wouldCycle
};
