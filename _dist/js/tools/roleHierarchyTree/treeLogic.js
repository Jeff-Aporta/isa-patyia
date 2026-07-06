// js/tools/roleHierarchy.js
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

// js/tools/roleHierarchyTree/treeLogic.ts
function buildTreeRows(nodes) {
  const unique = dedupeNodes(nodes);
  const byJerarquia = /* @__PURE__ */ new Map();
  const childrenOf = /* @__PURE__ */ new Map();
  for (const n of unique) {
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
    const parentJer = immediateParentJer(jer);
    if (!parentJer || !byJerarquia.has(parentJer)) continue;
    if (!childrenOf.has(parentJer)) childrenOf.set(parentJer, []);
    if (!childrenOf.get(parentJer).includes(jer)) childrenOf.get(parentJer).push(jer);
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
    for (const kid of kids) computeDepth(kid, depth + 1);
  };
  for (const n of unique) {
    if (!visited.has(n.jerarquia)) computeDepth(n.jerarquia, 0);
  }
  return Array.from(byJerarquia.values());
}
function immediateParentJer(jer) {
  const ancestors = ancestorsFromPath(jer);
  return ancestors.length > 1 ? ancestors[1] : null;
}
function dedupeNodes(nodes) {
  const seen = /* @__PURE__ */ new Map();
  for (const n of nodes) {
    const j = String(n.jerarquia ?? "").trim();
    if (j && !seen.has(j)) seen.set(j, n);
  }
  return Array.from(seen.values());
}
function hasKnownParent(jer, byJer) {
  const parent = immediateParentJer(jer);
  return !!parent && byJer.has(parent);
}
function buildTreeNodes(nodes) {
  const rows = buildTreeRows(dedupeNodes(nodes));
  const byJer = new Map(
    rows.map((r) => [r.jerarquia, { ...r, childrens: [] }])
  );
  const roots = [];
  for (const row of rows) {
    const node = byJer.get(row.jerarquia);
    const parentJer = immediateParentJer(row.jerarquia);
    const parent = parentJer ? byJer.get(parentJer) : void 0;
    if (parent) {
      parent.childrens.push(node);
      parent.hasChildren = true;
    } else if (!hasKnownParent(row.jerarquia, byJer)) {
      roots.push(node);
    }
  }
  const sortRec = (list) => {
    list.sort((a, b) => compareHierarchy(a.jerarquia, b.jerarquia));
    for (const n of list) sortRec(n.childrens);
  };
  sortRec(roots);
  return roots;
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
function wouldCycle(jer, newParentJer, allNodes) {
  return isDescendant(newParentJer, jer);
}
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
function countDescendants(node) {
  return node.childrens.length;
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
      if (!childrenOf.get(parentJer).includes(jer)) childrenOf.get(parentJer).push(jer);
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
  const roots = rows.filter((r) => !hasKnownParent(r.jerarquia, new Map(rows.map((r2) => [r2.jerarquia, { ...r2, childrens: [] }])))).map((r) => r.jerarquia).sort();
  for (const r of roots) walk(r);
  return out;
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
  buildTreeNodes,
  buildTreeRows,
  canDrop,
  computeDropJerarquia,
  countDescendants,
  flattenForRender,
  isDescendant,
  removeRow,
  resolveDragZone,
  summaryDragClass,
  wouldCycle
};
