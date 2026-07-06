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
function formatJerarquiaLabel(jerarquia) {
  if (jerarquia == null || jerarquia === "") return "";
  return `(${jerarquia})`;
}

// js/tools/roleHierarchyTree/treeLogic.ts
function immediateParentJer(jer) {
  const ancestors = ancestorsFromPath(jer);
  return ancestors.length > 1 ? ancestors[1] : null;
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

// js/core/patyia.ts
window.ISAFront.migrateLegacyGatewayKeys?.({ "jeff:gateway-local": "", "patyia-apptools:gateway-local": "", "patyia-apptools:lab-local": "" });
var PATYIA_ISS_LOCAL = "http://127.0.0.1:8802";
var PATYIA_BRIDGE_LOCAL = `${PATYIA_ISS_LOCAL}/api`;

// js/core/platform.ts
var fb = () => globalThis.ISAFront?.Feedback;
function toastError(text, timeout) {
  fb()?.toast?.error?.(text, timeout);
}
function toastInfo(text, timeout) {
  fb()?.toast?.info?.(text, timeout);
}

// js/tools/roleHierarchyTree/roleHierarchyTreeConfig.ts
var ROLE_HIERARCHY_MANIFEST = {
  ariaLabel: "\xC1rbol de roles",
  entrie: "rol",
  entries: "roles",
  emptyMessage: "Sin roles.",
  countLabel: void 0,
  icons: {
    grouperOpen: "mdi:folder-account",
    grouperClosed: "mdi:folder-account-outline",
    grouperColor: "#1976d2",
    leaf: "mdi:account",
    chevron: "mdi:chevron-down",
    dragHandle: "mdi:dots-grid"
  },
  features: {
    drag: true,
    collapse: true,
    toolbarExpandCollapse: true,
    rowActions: true,
    showPathLabel: true,
    showHelper: true
  }
};
function immediateParentJer2(jer) {
  const ancestors = ancestorsFromPath(jer);
  return ancestors.length > 1 ? ancestors[1] : null;
}
function createRoleHierarchyCustoms(handlers) {
  const { items, canMutate, onSave, onDelete, onEdit, onCreateClick } = handlers;
  return {
    build: {
      getFlatPath: (item) => String(item.jerarquia ?? "").trim(),
      getParentPath: (flatPath) => immediateParentJer2(flatPath),
      dedupeKey: (item) => String(item.jerarquia ?? "").trim(),
      sortSiblings: (a, b) => compareHierarchy(a.flatPath, b.flatPath)
    },
    getLabel: (node) => node.data.namedisplay?.trim() || node.data.iusuario,
    getHelper: (node) => node.data.descripcion?.trim() || null,
    getPathLabel: (node) => formatJerarquiaLabel(node.flatPath),
    canDrop: (sourcePath, targetPath, zone) => canDrop(sourcePath, targetPath, zone, items),
    onDrop: async (sourcePath, targetPath, zone) => {
      const source = items.find((n) => n.jerarquia === sourcePath);
      if (!source) return;
      const newJer = computeDropJerarquia(sourcePath, targetPath, zone, items);
      if (!newJer) {
        toastInfo?.("No se puede mover: operaci\xF3n no permitida");
        return;
      }
      try {
        await onSave(source.iusuario, newJer);
      } catch (err) {
        toastError?.(`Error al reparentar: ${err?.message ?? err}`);
      }
    },
    rowActions: (node) => {
      if (!canMutate) return [];
      const data = node.data;
      return [
        {
          id: "edit",
          icon: "mdi:pencil",
          title: "Editar jerarqu\xEDa",
          onClick: () => onEdit(data)
        },
        {
          id: "delete",
          icon: "mdi:delete",
          title: "Eliminar rol",
          onClick: () => {
            if (confirm(`\xBFEliminar rol "${data.iusuario}"?`)) {
              onDelete(data.iusuario).catch((e) => toastError?.(String(e)));
            }
          }
        }
      ];
    },
    toolbarActions: (runtime) => {
      if (!canMutate) return [];
      return [
        {
          id: "new-role",
          icon: "mdi:plus",
          title: "Nuevo rol",
          label: "Nuevo rol",
          variant: "button",
          onClick: onCreateClick
        }
      ];
    }
  };
}
export {
  ROLE_HIERARCHY_MANIFEST,
  createRoleHierarchyCustoms
};
