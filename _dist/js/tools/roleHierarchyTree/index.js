// ../Personal/apps/isa-patyia/frontend/js/core/patyia.ts
window.ISAFront.migrateLegacyGatewayKeys?.({ "jeff:gateway-local": "", "patyia-apptools:gateway-local": "", "patyia-apptools:lab-local": "" });
var PATYIA_ISS_LOCAL = "http://127.0.0.1:8802";
var PATYIA_BRIDGE_LOCAL = `${PATYIA_ISS_LOCAL}/api`;

// ../Personal/apps/isa-patyia/frontend/js/core/platform.ts
var bridge = () => window.ISAFront.createPlatformBridge("ISA");
var UI = {
  get Icon() {
    return bridge().UI.Icon;
  },
  get TargetSwitch() {
    return bridge().UI.TargetSwitch;
  },
  get ThemeSwitch() {
    return bridge().UI.ThemeSwitch;
  },
  get useRealtimeStatus() {
    return bridge().UI.useRealtimeStatus;
  },
  get RealtimeStatusDot() {
    return bridge().UI.RealtimeStatusDot;
  },
  get Loading() {
    return bridge().UI.Loading;
  },
  get ErrorBox() {
    return bridge().UI.ErrorBox;
  },
  get LoginGate() {
    return bridge().UI.LoginGate;
  },
  get LoginButton() {
    return bridge().UI.LoginButton;
  }
};
var getReact = () => window.ISAFront.getReact();
var getMaterialUI = () => window.ISAFront.getMaterialUI();
var fb = () => globalThis.ISAFront?.Feedback;
function toastError(text, timeout) {
  fb()?.toast?.error?.(text, timeout);
}
function toastSuccess(text, timeout) {
  fb()?.toast?.success?.(text, timeout);
}
function toastInfo(text, timeout) {
  fb()?.toast?.info?.(text, timeout);
}

// ../Personal/apps/isa-patyia/frontend/js/tools/roleHierarchyTree/treeRow.tsx
import { jsx, jsxs } from "react/jsx-runtime";
var { Icon } = UI;
var { Box, Stack, Typography, IconButton, Tooltip } = getMaterialUI();
function TreeRowView(props) {
  const {
    row,
    isCollapsed,
    isDragOver,
    isDragSource,
    canMutate,
    isSelected,
    childCount,
    onToggleCollapse,
    onSelect,
    onEdit,
    onDelete,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    onDrillDown
  } = props;
  const accent = row.jerarquia.startsWith("0.") || row.jerarquia === "0" ? "#10b981" : "#a855f7";
  const indent = row.depth * 18;
  const className = [
    "role-tree-row",
    isDragOver ? "role-tree-row--drag-over" : "",
    isDragSource ? "role-tree-row--drag-source" : "",
    isSelected ? "role-tree-row--selected" : ""
  ].filter(Boolean).join(" ");
  const handlePointerDown = (e) => {
    onDragStart(e);
  };
  const handlePointerOver = (e) => {
    onDragOver(e);
  };
  const handlePointerUp = (e) => {
    onDrop(e);
  };
  const handlePointerLeave = (e) => {
    onDragEnd(e);
  };
  return /* @__PURE__ */ jsxs(
    Box,
    {
      role: "treeitem",
      "aria-level": row.depth + 1,
      "aria-expanded": row.hasChildren ? !isCollapsed : void 0,
      "data-jerarquia": row.jerarquia,
      draggable: canMutate,
      onPointerDown: handlePointerDown,
      onPointerOver: handlePointerOver,
      onPointerUp: handlePointerUp,
      onPointerLeave: handlePointerLeave,
      className,
      sx: {
        display: "flex",
        alignItems: "center",
        gap: 1,
        pl: `${indent + 8}px`,
        pr: 1,
        py: 0.5,
        borderLeft: `3px solid ${accent}`,
        backgroundColor: isDragOver ? "action.hover" : isSelected ? "action.selected" : "transparent",
        cursor: canMutate ? "grab" : "default",
        userSelect: "none"
      },
      onClick: onSelect,
      children: [
        /* @__PURE__ */ jsx(Tooltip, { title: row.hasChildren ? isCollapsed ? "Expandir" : "Colapsar" : "", children: /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(
          IconButton,
          {
            size: "small",
            onClick: (e) => {
              e.stopPropagation();
              onToggleCollapse();
            },
            disabled: !row.hasChildren,
            "aria-label": isCollapsed ? "Expandir" : "Colapsar",
            children: /* @__PURE__ */ jsx("iconify-icon", { icon: row.hasChildren ? isCollapsed ? "mdi:chevron-right" : "mdi:chevron-down" : "mdi:circle-small", width: "16", height: "16" })
          }
        ) }) }),
        /* @__PURE__ */ jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, sx: { flex: 1, minWidth: 0 }, children: [
          /* @__PURE__ */ jsx("iconify-icon", { icon: "mdi:shield-account-outline", width: "16", height: "16" }),
          /* @__PURE__ */ jsxs(Box, { sx: { minWidth: 0 }, children: [
            /* @__PURE__ */ jsx(Typography, { variant: "body2", fontWeight: 600, noWrap: true, title: row.namedisplay ?? row.iusuario, children: row.namedisplay ?? row.iusuario }),
            /* @__PURE__ */ jsx(Typography, { variant: "caption", color: "text.secondary", sx: { display: "block", fontFamily: "monospace" }, title: `Jerarqu\xEDa ${row.jerarquia}`, children: row.jerarquia })
          ] })
        ] }),
        row.hasChildren ? /* @__PURE__ */ jsxs(Typography, { variant: "caption", color: "text.secondary", sx: { flexShrink: 0 }, children: [
          childCount,
          " hijo",
          childCount !== 1 ? "s" : ""
        ] }) : null,
        canMutate ? /* @__PURE__ */ jsxs(Stack, { direction: "row", spacing: 0.5, sx: { flexShrink: 0 }, children: [
          onDrillDown ? /* @__PURE__ */ jsx(Tooltip, { title: "Editar permisos de este nodo", children: /* @__PURE__ */ jsx(IconButton, { size: "small", "aria-label": "Editar permisos", onClick: (e) => {
            e.stopPropagation();
            onDrillDown();
          }, children: /* @__PURE__ */ jsx("iconify-icon", { icon: "mdi:pencil-box-outline", width: "16", height: "16" }) }) }) : null,
          /* @__PURE__ */ jsx(Tooltip, { title: "Mover de jerarqu\xEDa", children: /* @__PURE__ */ jsx(IconButton, { size: "small", "aria-label": "Mover", onClick: (e) => {
            e.stopPropagation();
            onEdit();
          }, children: /* @__PURE__ */ jsx("iconify-icon", { icon: "mdi:arrow-up-down-bold", width: "16", height: "16" }) }) }),
          /* @__PURE__ */ jsx(Tooltip, { title: "Eliminar rol", children: /* @__PURE__ */ jsx(IconButton, { size: "small", "aria-label": "Eliminar", onClick: (e) => {
            e.stopPropagation();
            onDelete();
          }, children: /* @__PURE__ */ jsx("iconify-icon", { icon: "mdi:trash-can-outline", width: "16", height: "16" }) }) })
        ] }) : null
      ]
    }
  );
}

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

// ../Personal/apps/isa-patyia/frontend/js/tools/roleHierarchyTree/RolePermissionsEditor.tsx
import { Fragment, jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var { useState, useMemo, useCallback, useEffect } = getReact();
var { Box: Box2, Stack: Stack2, Typography: Typography2, Breadcrumbs, Link, Chip, IconButton: IconButton2, Tooltip: Tooltip2, Button, TextField, Alert, CircularProgress } = getMaterialUI();
var { Icon: Icon2 } = UI;
function RolePermissionsEditor(props) {
  const { currentNode, allNodes, busy, onSaveLocal, onPromote, onClose } = props;
  const byJer = useMemo(
    () => new Map(allNodes.map((n) => [n.jerarquia, n])),
    [allNodes]
  );
  const pathAncestors = useMemo(
    () => ancestorsFromPath(currentNode.jerarquia).slice(1),
    [currentNode.jerarquia]
  );
  const [resolved, setResolved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  useEffect(() => {
    let cancelled = false;
    (() => {
      setLoading(true);
      const merged = {};
      const orderedJers = [...pathAncestors].reverse().concat([currentNode.jerarquia]);
      for (const ancJer of orderedJers) {
        const node = byJer.get(ancJer);
        if (!node) continue;
        for (const [k, v] of Object.entries(node.permisos ?? {})) {
          if (k.startsWith(":")) continue;
          if (k === "*" || k === "impersonate" || k === "manage_permissions" || k === "manage_sampling") {
            if (v === true) merged[k] = { value: true, owner: ancJer };
            continue;
          }
          merged[k] = { value: v, owner: ancJer };
        }
      }
      if (cancelled) return;
      const out = Object.entries(merged).map(([k, { value, owner }]) => ({
        key: k,
        value,
        ownerJerarquia: owner,
        isLocal: owner === currentNode.jerarquia,
        isInherited: owner !== currentNode.jerarquia
      }));
      out.sort((a, b) => {
        if (a.isInherited !== b.isInherited) return a.isInherited ? -1 : 1;
        return a.key.localeCompare(b.key);
      });
      setResolved(out);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [currentNode.jerarquia, pathAncestors, byJer]);
  const handlePromote = useCallback(async (perm, targetJer) => {
    try {
      await onPromote(perm.key, perm.value, perm.ownerJerarquia, targetJer);
      toastSuccess?.(`${perm.key} promovido a ${targetJer}`);
    } catch (e) {
      toastError?.(String(e));
    }
  }, [onPromote]);
  const startEdit = useCallback((perm) => {
    setEditingKey(perm.key);
    setEditingValue(typeof perm.value === "string" ? perm.value : JSON.stringify(perm.value));
  }, []);
  const saveEdit = useCallback(async () => {
    if (!editingKey) return;
    let value = editingValue;
    if (typeof value === "string" && (value.trim().startsWith("{") || value.trim().startsWith("["))) {
      try {
        value = JSON.parse(value);
      } catch {
      }
    }
    try {
      await onSaveLocal(editingKey, value);
      setEditingKey(null);
      toastSuccess?.(`${editingKey} guardado`);
    } catch (e) {
      toastError?.(String(e));
    }
  }, [editingKey, editingValue, onSaveLocal]);
  return /* @__PURE__ */ jsxs2(Box2, { className: "role-permissions-editor", sx: { display: "flex", flexDirection: "column", gap: 1.5, p: 2 }, children: [
    /* @__PURE__ */ jsxs2(Breadcrumbs, { separator: "\u203A", sx: { fontSize: 13 }, children: [
      /* @__PURE__ */ jsx2(Link, { underline: "hover", color: "inherit", children: pathAncestors[0] ?? "?" }),
      pathAncestors.slice(1).map((j, i) => /* @__PURE__ */ jsx2(Link, { underline: "hover", color: "inherit", children: j }, j)),
      /* @__PURE__ */ jsx2(Typography2, { color: "text.primary", fontWeight: 700, children: currentNode.jerarquia })
    ] }),
    /* @__PURE__ */ jsxs2(Stack2, { direction: "row", alignItems: "center", spacing: 1, children: [
      /* @__PURE__ */ jsx2(Typography2, { variant: "h6", sx: { flex: 1 }, children: currentNode.namedisplay ?? currentNode.iusuario }),
      /* @__PURE__ */ jsx2(Chip, { size: "small", label: currentNode.jerarquia }),
      /* @__PURE__ */ jsx2(Button, { onClick: onClose, size: "small", sx: { textTransform: "none" }, children: "Cerrar" })
    ] }),
    currentNode.descripcion ? /* @__PURE__ */ jsx2(Typography2, { variant: "body2", color: "text.secondary", children: currentNode.descripcion }) : null,
    /* @__PURE__ */ jsx2(Typography2, { variant: "subtitle2", children: "Permisos efectivos" }),
    loading ? /* @__PURE__ */ jsx2(CircularProgress, { size: 20 }) : /* @__PURE__ */ jsxs2(Stack2, { spacing: 0.5, children: [
      resolved.length === 0 ? /* @__PURE__ */ jsx2(Typography2, { variant: "body2", color: "text.secondary", sx: { p: 1 }, children: "Sin permisos." }) : null,
      resolved.map((perm) => /* @__PURE__ */ jsxs2(Box2, { sx: {
        p: 1,
        border: 1,
        borderColor: perm.isInherited ? "warning.light" : "divider",
        borderRadius: 1,
        backgroundColor: perm.isInherited ? "warning.50" : "transparent",
        opacity: perm.isInherited ? 0.85 : 1
      }, children: [
        /* @__PURE__ */ jsxs2(Stack2, { direction: "row", alignItems: "center", spacing: 1, children: [
          /* @__PURE__ */ jsxs2(Box2, { sx: { flex: 1, minWidth: 0 }, children: [
            /* @__PURE__ */ jsx2(Typography2, { variant: "body2", fontFamily: "monospace", noWrap: true, title: perm.key, children: perm.key }),
            /* @__PURE__ */ jsx2(Typography2, { variant: "caption", color: "text.secondary", sx: { display: "block" }, title: JSON.stringify(perm.value), children: JSON.stringify(perm.value).slice(0, 100) })
          ] }),
          perm.isInherited ? /* @__PURE__ */ jsxs2(Stack2, { direction: "row", alignItems: "center", spacing: 0.5, children: [
            /* @__PURE__ */ jsx2(Tooltip2, { title: `Viene de ${perm.ownerJerarquia} (no editable aqu\xED)`, children: /* @__PURE__ */ jsx2(Chip, { size: "small", color: "warning", label: `\u{1F512} ${perm.ownerJerarquia}` }) }),
            /* @__PURE__ */ jsx2(Tooltip2, { title: `Promover a ${perm.ownerJerarquia} para poder editarlo all\xED`, children: /* @__PURE__ */ jsx2(
              Button,
              {
                size: "small",
                startIcon: /* @__PURE__ */ jsx2("iconify-icon", { icon: "mdi:arrow-up-bold", width: "14", height: "14" }),
                onClick: () => handlePromote(perm, perm.ownerJerarquia),
                disabled: busy,
                sx: { textTransform: "none" },
                children: "Subir a la herencia"
              }
            ) })
          ] }) : /* @__PURE__ */ jsxs2(Stack2, { direction: "row", alignItems: "center", spacing: 0.5, children: [
            /* @__PURE__ */ jsx2(Chip, { size: "small", color: "primary", label: "local" }),
            editingKey === perm.key ? /* @__PURE__ */ jsxs2(Fragment, { children: [
              /* @__PURE__ */ jsx2(Button, { size: "small", onClick: saveEdit, disabled: busy, children: "Guardar" }),
              /* @__PURE__ */ jsx2(Button, { size: "small", onClick: () => setEditingKey(null), children: "Cancelar" })
            ] }) : /* @__PURE__ */ jsx2(Tooltip2, { title: "Editar valor", children: /* @__PURE__ */ jsx2(IconButton2, { size: "small", onClick: () => startEdit(perm), disabled: busy, "aria-label": "Editar", children: /* @__PURE__ */ jsx2("iconify-icon", { icon: "mdi:pencil", width: "16", height: "16" }) }) })
          ] })
        ] }),
        editingKey === perm.key ? /* @__PURE__ */ jsx2(
          TextField,
          {
            fullWidth: true,
            multiline: true,
            minRows: 2,
            value: editingValue,
            onChange: (e) => setEditingValue(e.target.value),
            sx: { mt: 1 },
            size: "small"
          }
        ) : null,
        perm.isInherited ? /* @__PURE__ */ jsxs2(Alert, { severity: "warning", sx: { mt: 0.5, py: 0 }, icon: /* @__PURE__ */ jsx2("iconify-icon", { icon: "mdi:lock-outline", width: "16", height: "16" }), children: [
          "Setear en la herencia: ",
          perm.ownerJerarquia
        ] }) : null
      ] }, perm.key))
    ] })
  ] });
}

// ../Personal/apps/isa-patyia/frontend/js/tools/roleHierarchyTree/RoleHierarchyView.tsx
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
var { useState: useState2, useMemo: useMemo2, useCallback: useCallback2 } = getReact();
var { Box: Box3, Stack: Stack3, Typography: Typography3, IconButton: IconButton3, Tooltip: Tooltip3, Button: Button2, Dialog, DialogTitle, DialogContent, DialogActions, TextField: TextField2, Alert: Alert2, CircularProgress: CircularProgress2, Chip: Chip2 } = getMaterialUI();
var { Icon: Icon3 } = UI;
function RoleHierarchyView(props) {
  const { nodes, canMutate, busy, onSave, onSaveLocalPerm, onPromote, onCreate, onDelete } = props;
  const [collapsed, setCollapsed] = useState2(/* @__PURE__ */ new Set());
  const [selectedJer, setSelectedJer] = useState2(null);
  const [editTarget, setEditTarget] = useState2(null);
  const [dragOverJer, setDragOverJer] = useState2(null);
  const [dragSourceJer, setDragSourceJer] = useState2(null);
  const [breadcrumb, setBreadcrumb] = useState2([]);
  const rows = useMemo2(() => buildTreeRows(nodes), [nodes]);
  const visibleRows = useMemo2(() => flattenForRender(rows, collapsed), [rows, collapsed]);
  const currentEditJer = breadcrumb.length > 0 ? breadcrumb[breadcrumb.length - 1] : selectedJer;
  const currentEditNode = useMemo2(
    () => currentEditJer ? nodes.find((n) => n.jerarquia === currentEditJer) ?? null : null,
    [currentEditJer, nodes]
  );
  const byJer = useMemo2(
    () => new Map(nodes.map((n) => [n.jerarquia, n])),
    [nodes]
  );
  const childCountOf = useMemo2(() => {
    const map = /* @__PURE__ */ new Map();
    for (const r of rows) {
      const ancestors = ancestorsFromPath(r.jerarquia).slice(1);
      for (const p of ancestors) {
        if (byJer.has(p)) map.set(p, (map.get(p) ?? 0) + 1);
      }
    }
    return map;
  }, [rows, byJer]);
  const toggleCollapse = useCallback2((jer) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(jer)) next.delete(jer);
      else next.add(jer);
      return next;
    });
  }, []);
  const collapseAll = useCallback2(() => {
    setCollapsed(new Set(rows.filter((r) => r.hasChildren).map((r) => r.jerarquia)));
  }, [rows]);
  const expandAll = useCallback2(() => setCollapsed(/* @__PURE__ */ new Set()), []);
  const handleDragStart = useCallback2((row) => (e) => {
    if (!canMutate) return;
    setDragSourceJer(row.jerarquia);
    const target = e.currentTarget;
    if (target.setPointerCapture && e.pointerId !== void 0) {
      try {
        target.setPointerCapture(e.pointerId);
      } catch {
      }
    }
  }, [canMutate]);
  const handleDragOver = useCallback2((row) => (e) => {
    if (!canMutate || !dragSourceJer) return;
    if (row.jerarquia === dragSourceJer) return;
    e.preventDefault();
    setDragOverJer(row.jerarquia);
  }, [canMutate, dragSourceJer]);
  const handleDrop = useCallback2((targetRow) => async (e) => {
    e.preventDefault();
    if (!canMutate || !dragSourceJer || dragSourceJer === targetRow.jerarquia) {
      setDragSourceJer(null);
      setDragOverJer(null);
      return;
    }
    if (wouldCycle(dragSourceJer, targetRow.jerarquia, nodes)) {
      toastInfo?.(`No se puede mover: crear\xEDa un ciclo en la cadena de padres`);
      setDragSourceJer(null);
      setDragOverJer(null);
      return;
    }
    try {
      const sourceRow = rows.find((r) => r.jerarquia === dragSourceJer);
      if (!sourceRow) return;
      let suffix = 1;
      while (byJer.has(`${targetRow.jerarquia}.${suffix}`)) suffix++;
      const finalJer = `${targetRow.jerarquia}.${suffix}`;
      await onSave(sourceRow.iusuario, finalJer);
    } catch (err) {
      toastError?.(`Error al reparentar: ${err?.message ?? err}`);
    } finally {
      setDragSourceJer(null);
      setDragOverJer(null);
    }
  }, [canMutate, dragSourceJer, nodes, onSave, byJer, rows]);
  const handleDragEnd = useCallback2(() => {
    setDragSourceJer(null);
    setDragOverJer(null);
  }, []);
  const navigateTo = useCallback2((jer) => {
    setSelectedJer(jer);
    setBreadcrumb([]);
  }, []);
  const drillDown = useCallback2((jer) => {
    setBreadcrumb((prev) => [...prev, jer]);
  }, []);
  const drillUp = useCallback2(() => {
    setBreadcrumb((prev) => prev.slice(0, -1));
  }, []);
  const onDeleteRow = useCallback2(async (name) => {
    if (confirm(`\xBFEliminar rol "${name}"?`)) {
      try {
        await onDelete(name);
      } catch (e) {
        toastError?.(String(e));
      }
    }
  }, [onDelete]);
  const openCreateDialog = useCallback2(() => {
    setEditTarget({
      jerarquia: "__new__",
      iusuario: "",
      namedisplay: null,
      descripcion: null,
      flatPath: "__new__",
      pathInit: "__new__",
      hasChildren: false,
      isCollapsed: false,
      depth: 0,
      isSelected: false
    });
  }, []);
  const renderRow = (row) => {
    const isOver = !!dragOverJer && dragOverJer === row.jerarquia;
    const isSource = !!dragSourceJer && dragSourceJer === row.jerarquia;
    const rowProps = {
      row,
      isCollapsed: collapsed.has(row.jerarquia),
      isDragOver: isOver,
      isDragSource: isSource,
      canMutate: canMutate && !busy,
      isSelected: selectedJer === row.jerarquia,
      childCount: childCountOf.get(row.jerarquia) ?? 0,
      onToggleCollapse: () => toggleCollapse(row.jerarquia),
      onSelect: () => navigateTo(row.jerarquia),
      onEdit: () => setEditTarget(row),
      onDelete: () => onDeleteRow(row.iusuario),
      onDragStart: handleDragStart(row),
      onDragOver: handleDragOver(row),
      onDrop: handleDrop(row),
      onDragEnd: handleDragEnd,
      onDrillDown: row.hasChildren ? () => drillDown(row.jerarquia) : void 0
    };
    return /* @__PURE__ */ jsx3(TreeRowView, { ...rowProps }, row.jerarquia);
  };
  return /* @__PURE__ */ jsxs3(Box3, { className: "role-hierarchy-tree", sx: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }, children: [
    /* @__PURE__ */ jsxs3(Stack3, { direction: "row", alignItems: "center", spacing: 1, sx: { p: 1, borderBottom: 1, borderColor: "divider" }, children: [
      /* @__PURE__ */ jsx3(Typography3, { variant: "subtitle1", sx: { flex: 1 }, children: "Jerarqu\xEDa de roles" }),
      /* @__PURE__ */ jsx3(Chip2, { size: "small", label: `${rows.length} roles` }),
      /* @__PURE__ */ jsx3(Tooltip3, { title: "Expandir todo", children: /* @__PURE__ */ jsx3(IconButton3, { size: "small", onClick: expandAll, disabled: busy, children: /* @__PURE__ */ jsx3("iconify-icon", { icon: "mdi:unfold-more-horizontal", width: "18", height: "18" }) }) }),
      /* @__PURE__ */ jsx3(Tooltip3, { title: "Colapsar todo", children: /* @__PURE__ */ jsx3(IconButton3, { size: "small", onClick: collapseAll, disabled: busy, children: /* @__PURE__ */ jsx3("iconify-icon", { icon: "mdi:unfold-less-horizontal", width: "18", height: "18" }) }) }),
      canMutate ? /* @__PURE__ */ jsx3(
        Button2,
        {
          size: "small",
          variant: "contained",
          startIcon: /* @__PURE__ */ jsx3("iconify-icon", { icon: "mdi:plus", width: "16", height: "16" }),
          onClick: openCreateDialog,
          disabled: busy,
          children: "Nuevo rol"
        }
      ) : null
    ] }),
    busy ? /* @__PURE__ */ jsx3(Box3, { sx: { display: "flex", alignItems: "center", justifyContent: "center", p: 2 }, children: /* @__PURE__ */ jsx3(CircularProgress2, { size: 20 }) }) : null,
    /* @__PURE__ */ jsxs3(Box3, { sx: { flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }, children: [
      /* @__PURE__ */ jsx3(Box3, { role: "tree", sx: { width: 360, flexShrink: 0, overflowY: "auto", p: 1, borderRight: 1, borderColor: "divider" }, children: visibleRows.length === 0 ? /* @__PURE__ */ jsx3(Typography3, { variant: "body2", color: "text.secondary", sx: { p: 2 }, children: "Sin roles." }) : visibleRows.map(renderRow) }),
      /* @__PURE__ */ jsx3(Box3, { sx: { flex: 1, minWidth: 0, overflow: "auto" }, children: currentEditNode ? /* @__PURE__ */ jsx3(
        RolePermissionsEditor,
        {
          currentNode: currentEditNode,
          allNodes: nodes,
          busy,
          onSaveLocal: async (key, value) => onSaveLocalPerm(currentEditNode.jerarquia, key, value),
          onPromote,
          onClose: () => {
            setSelectedJer(null);
            setBreadcrumb([]);
          }
        }
      ) : /* @__PURE__ */ jsxs3(Box3, { sx: { p: 4, textAlign: "center", color: "text.secondary" }, children: [
        /* @__PURE__ */ jsx3("iconify-icon", { icon: "mdi:family-tree", width: "48", height: "48" }),
        /* @__PURE__ */ jsx3(Typography3, { variant: "body1", sx: { mt: 2 }, children: "Selecciona un rol del \xE1rbol para ver y editar sus permisos." }),
        !canMutate ? /* @__PURE__ */ jsx3(Typography3, { variant: "caption", color: "text.secondary", sx: { display: "block", mt: 1 }, children: "(Solo roles de branch 0 pueden editar la jerarqu\xEDa.)" }) : null
      ] }) })
    ] }),
    /* @__PURE__ */ jsx3(
      HierarchyEditDialog,
      {
        target: editTarget,
        existingNodes: nodes,
        busy,
        onClose: () => setEditTarget(null),
        onSave: async (name, jer) => {
          if (editTarget?.jerarquia === "__new__") {
            await onCreate(name, jer);
          } else if (editTarget) {
            await onSave(editTarget.iusuario, jer);
          }
          setEditTarget(null);
        }
      }
    )
  ] });
}
function HierarchyEditDialog({ target, existingNodes, busy, onClose, onSave }) {
  const isNew = target?.jerarquia === "__new__";
  const [name, setName] = useState2(target?.iusuario ?? "");
  const [jerarquia, setJerarquia] = useState2(target?.jerarquia === "__new__" ? "" : target?.jerarquia ?? "");
  const [err, setErr] = useState2("");
  if (!target) return null;
  const handleSubmit = async () => {
    setErr("");
    const trimmedName = String(name ?? "").trim();
    const trimmedJer = String(jerarquia ?? "").trim();
    if (!trimmedName) {
      setErr("nombre requerido");
      return;
    }
    if (!trimmedJer) {
      setErr("jerarqu\xEDa requerida");
      return;
    }
    if (!/^[0-9]+(\.[0-9]+)*$/.test(trimmedJer)) {
      setErr("jerarqu\xEDa inv\xE1lida (formato: 0, 0.0, 0.1.1)");
      return;
    }
    try {
      await onSave(trimmedName, trimmedJer);
    } catch (e) {
      setErr(e?.message ?? String(e));
    }
  };
  return /* @__PURE__ */ jsxs3(Dialog, { open: true, onClose, maxWidth: "sm", fullWidth: true, children: [
    /* @__PURE__ */ jsx3(DialogTitle, { children: isNew ? "Nuevo rol" : `Mover ${target.iusuario}` }),
    /* @__PURE__ */ jsx3(DialogContent, { dividers: true, children: /* @__PURE__ */ jsxs3(Stack3, { spacing: 2, children: [
      err ? /* @__PURE__ */ jsx3(Alert2, { severity: "error", children: err }) : null,
      /* @__PURE__ */ jsx3(TextField2, { label: "Nombre", value: name, onChange: (e) => setName(e.target.value), disabled: !isNew, helperText: "min\xFAsculas, sin espacios (ej. dev_lead)" }),
      /* @__PURE__ */ jsx3(TextField2, { label: "Nueva jerarqu\xEDa", value: jerarquia, onChange: (e) => setJerarquia(e.target.value), helperText: "dot-notation: 0, 0.0, 0.1.1, ..." }),
      /* @__PURE__ */ jsx3(Alert2, { severity: "info", children: "Los ancestros se derivan autom\xE1ticamente del path. Arrastra un rol sobre otro en el \xE1rbol para reubicarlo." })
    ] }) }),
    /* @__PURE__ */ jsxs3(DialogActions, { children: [
      /* @__PURE__ */ jsx3(Button2, { onClick: onClose, disabled: busy, children: "Cancelar" }),
      /* @__PURE__ */ jsx3(Button2, { variant: "contained", onClick: handleSubmit, disabled: busy, children: busy ? /* @__PURE__ */ jsx3(CircularProgress2, { size: 16 }) : "Guardar" })
    ] })
  ] });
}
export {
  RoleHierarchyView,
  RolePermissionsEditor,
  buildTreeRows,
  flattenForRender,
  wouldCycle
};
