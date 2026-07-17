var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};

// js/core/patyia.ts
function avatarBgFromName(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = h * 31 + name.charCodeAt(i) >>> 0;
  return AVATAR_BG_PALETTE[h % AVATAR_BG_PALETTE.length];
}
function buildUserAvatarUrl(name, size = 72) {
  const label = String(name ?? "").trim() || "Usuario";
  const params = new URLSearchParams({
    name: label,
    size: String(size),
    background: avatarBgFromName(label.toLowerCase()),
    color: "ffffff",
    bold: "true",
    rounded: "true",
    format: "svg"
  });
  return `https://ui-avatars.com/api/?${params.toString()}`;
}
var PATYIA_ISS_URL, PATYIA_ISS_PROD_URL, PATYIA_ISS_LOCAL, PATYIA_ISS_LOCAL_API, PATYIA_ISS_PROD_API, PATYIA_ISS_STAGING_API, AVATAR_BG_PALETTE;
var init_patyia = __esm({
  "js/core/patyia.ts"() {
    window.ISAFront.migrateLegacyGatewayKeys?.({ "jeff:gateway-local": "", "patyia-apptools:gateway-local": "", "patyia-apptools:lab-local": "" });
    PATYIA_ISS_URL = "https://ayudascp-ia-staging.azurewebsites.net";
    PATYIA_ISS_PROD_URL = "https://ayudascp-ia.azurewebsites.net";
    PATYIA_ISS_LOCAL = "http://127.0.0.1:8802";
    PATYIA_ISS_LOCAL_API = `${PATYIA_ISS_LOCAL}/api`;
    PATYIA_ISS_PROD_API = `${PATYIA_ISS_PROD_URL}/api`;
    PATYIA_ISS_STAGING_API = `${PATYIA_ISS_URL}/api`;
    AVATAR_BG_PALETTE = [
      "1e90ff",
      "0ea5e9",
      "14b8a6",
      "22c55e",
      "84cc16",
      "eab308",
      "f97316",
      "ef4444",
      "ec4899",
      "a855f7",
      "6366f1",
      "64748b"
    ];
    try {
      window.ISAFront.buildUserAvatarUrl = buildUserAvatarUrl;
    } catch {
    }
  }
});

// js/core/platform.ts
var getReact, getMaterialUI;
var init_platform = __esm({
  "js/core/platform.ts"() {
    init_patyia();
    getReact = () => window.ISAFront.getReact();
    getMaterialUI = () => window.ISAFront.getMaterialUI();
  }
});

// js/tools/roleHierarchy.js
function getRoleJerarquia(roleName, permisos) {
  if (permisos && typeof permisos === "object") {
    const j = permisos.jerarquia;
    if (typeof j === "string" && j.trim()) return j.trim();
  }
  const key = String(roleName ?? "").trim().toLowerCase();
  return DEFAULT_ROLE_JERARQUIA[key] ?? DEFAULT_FOR_UNKNOWN;
}
function formatJerarquiaLabel(jerarquia) {
  if (jerarquia == null || jerarquia === "") return "";
  return `(${jerarquia})`;
}
var DEFAULT_ROLE_JERARQUIA, DEFAULT_FOR_UNKNOWN;
var init_roleHierarchy = __esm({
  "js/tools/roleHierarchy.js"() {
    DEFAULT_ROLE_JERARQUIA = {
      visitante: "0",
      dev: "0.0",
      dev_lead: "0.0.0",
      dev_iss: "0.0.1",
      admn: "0.1",
      auditador: "0.1.0",
      admn_isapatyia: "0.1.0.0"
    };
    DEFAULT_FOR_UNKNOWN = "999";
  }
});

// js/tools/roleCanonicalMeta.js
function canonicalRoleMeta(roleName) {
  const key = String(roleName ?? "").trim().toLowerCase();
  return CANONICAL_ROLE_META[key] ?? null;
}
var CANONICAL_ROLE_META;
var init_roleCanonicalMeta = __esm({
  "js/tools/roleCanonicalMeta.js"() {
    CANONICAL_ROLE_META = {
      dev: {
        namedisplay: "Desarrollador b\xE1sico",
        descripcion: "Desarrollador b\xE1sico \u2014 rama desarrollo (hereda visitante)"
      },
      admn: {
        namedisplay: "Admn b\xE1sico",
        descripcion: "Admn b\xE1sico \u2014 permisos administrativos globales (hereda visitante)"
      },
      admn_isapatyia: {
        namedisplay: "Admn ISA-Paty",
        descripcion: "Admn ISA-Paty \u2014 permisos administrativos sobre PatyIA (hereda auditador, admn y visitante)"
      }
    };
  }
});

// js/tools/roleHierarchyTree/RoleHierarchyView.tsx
init_platform();
import * as React from "react";

// js/tools/roleHierarchyTree/HierarchyOrgChart.jsx
init_platform();
init_roleHierarchy();
import { jsx, jsxs } from "react/jsx-runtime";
var { useEffect, useMemo, useRef, useCallback, useState } = getReact();
var { Box, Stack, Typography, Chip, IconButton, Tooltip, CircularProgress } = getMaterialUI();
var ECHARTS_CDN = "https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.esm.min.js";
var NODE_W = 140;
var NODE_H = 40;
var NODE_GAP_Y = 18;
var LAYER_GAP_X = 56;
var echartsPromise = null;
function loadEcharts() {
  if (!echartsPromise) echartsPromise = import(
    /* @vite-ignore */
    ECHARTS_CDN
  );
  return echartsPromise;
}
function immediateParentJer(jer) {
  const parts = String(jer ?? "").split(".").filter(Boolean);
  if (parts.length <= 1) return null;
  return parts.slice(0, -1).join(".");
}
function nextChildJerarquia(parentJer, nodes) {
  const parent = String(parentJer ?? "").trim();
  if (!parent) return "0";
  const prefix = `${parent}.`;
  let max = -1;
  for (const n of nodes ?? []) {
    const j = String(n.jerarquia ?? "").trim();
    if (!j.startsWith(prefix)) continue;
    const rest = j.slice(prefix.length);
    if (!rest || rest.includes(".")) continue;
    const idx = Number(rest);
    if (Number.isFinite(idx) && idx > max) max = idx;
  }
  return `${parent}.${max + 1}`;
}
function isDarkScheme() {
  return document.documentElement.getAttribute("data-mui-color-scheme") !== "light";
}
function treeBreadth(node) {
  if (!node) return 0;
  const kids = node.children || [];
  if (!kids.length) return 1;
  return kids.reduce((sum, c) => sum + treeBreadth(c), 0);
}
function treeDepth(node, d = 1) {
  if (!node) return 0;
  const kids = node.children || [];
  if (!kids.length) return d;
  return Math.max(...kids.map((c) => treeDepth(c, d + 1)));
}
function applySelection(node, selectedJer, dark) {
  const sel = !!selectedJer && node.jerarquia === selectedJer;
  return {
    ...node,
    itemStyle: {
      color: sel ? dark ? "rgba(8,47,73,0.95)" : "rgba(224,242,254,0.98)" : dark ? "rgba(15,23,42,0.92)" : "rgba(255,255,255,0.95)",
      borderColor: sel ? "#22d3ee" : dark ? "rgba(56,189,248,0.55)" : "rgba(30,144,255,0.45)",
      borderWidth: sel ? 2.5 : 1.5,
      borderRadius: 0,
      shadowBlur: dark ? 8 : 2,
      shadowColor: dark ? "rgba(56,189,248,0.25)" : "rgba(15,23,42,0.08)"
    },
    children: (node.children || []).map((c) => applySelection(c, selectedJer, dark))
  };
}
function buildOrgTreeData(nodes) {
  const byJer = /* @__PURE__ */ new Map();
  for (const n of nodes ?? []) {
    const jer = String(n.jerarquia ?? "").trim();
    if (!jer) continue;
    byJer.set(jer, {
      name: n.namedisplay?.trim() || n.iusuario,
      value: jer,
      jerarquia: jer,
      iusuario: n.iusuario,
      namedisplay: n.namedisplay,
      descripcion: n.descripcion,
      children: []
    });
  }
  const roots = [];
  for (const [jer, node] of byJer) {
    const parent = immediateParentJer(jer);
    if (parent && byJer.has(parent)) byJer.get(parent).children.push(node);
    else roots.push(node);
  }
  const sortRec = (list) => {
    list.sort((a, b) => String(a.jerarquia).localeCompare(String(b.jerarquia), void 0, { numeric: true }));
    for (const n of list) sortRec(n.children);
  };
  sortRec(roots);
  if (roots.length === 1) return roots[0];
  if (!roots.length) return { name: "Sin roles", value: "", children: [] };
  return { name: "Roles", value: "", children: roots };
}
function nodePixelCenter(chart, data) {
  if (!chart || !data) return null;
  try {
    const px = chart.convertToPixel({ seriesIndex: 0 }, data);
    if (Array.isArray(px) && Number.isFinite(px[0]) && Number.isFinite(px[1])) {
      return { x: px[0], y: px[1] };
    }
  } catch {
  }
  if (Number.isFinite(data.x) && Number.isFinite(data.y)) {
    try {
      const px = chart.convertToPixel({ seriesIndex: 0 }, [data.x, data.y]);
      if (Array.isArray(px) && Number.isFinite(px[0]) && Number.isFinite(px[1])) {
        return { x: px[0], y: px[1] };
      }
    } catch {
    }
  }
  return null;
}
function HierarchyOrgChart({
  nodes,
  selectedJer,
  onSelect,
  canMutate = false,
  canCreateRoles = false,
  busy = false,
  onEditClick,
  onDeleteClick,
  onAddChildClick
}) {
  const treeData = useMemo(() => buildOrgTreeData(nodes), [nodes]);
  const hostRef = useRef(null);
  const wrapRef = useRef(null);
  const chartRef = useRef(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const onEditRef = useRef(onEditClick);
  onEditRef.current = onEditClick;
  const treeDataRef = useRef(treeData);
  treeDataRef.current = treeData;
  const selectedJerRef = useRef(selectedJer);
  selectedJerRef.current = selectedJer;
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;
  const canMutateRef = useRef(canMutate);
  canMutateRef.current = canMutate;
  const canCreateRef = useRef(canCreateRoles);
  canCreateRef.current = canCreateRoles;
  const [hover, setHover] = useState(null);
  const hoverHideTimer = useRef(null);
  const countLabel = `${nodes?.length ?? 0} rol${(nodes?.length ?? 0) !== 1 ? "es" : ""}`;
  const showNodeActions = canMutate || canCreateRoles;
  const layoutSize = useMemo(() => {
    const breadth = Math.max(1, treeBreadth(treeData));
    const depth = Math.max(1, treeDepth(treeData));
    const h = Math.max(420, breadth * (NODE_H + NODE_GAP_Y) + 80);
    const w = Math.max(640, depth * (NODE_W + LAYER_GAP_X) + 120);
    return { w, h, breadth, depth };
  }, [treeData]);
  const clearHoverSoon = useCallback(() => {
    if (hoverHideTimer.current) clearTimeout(hoverHideTimer.current);
    hoverHideTimer.current = setTimeout(() => setHover(null), 180);
  }, []);
  const keepHover = useCallback(() => {
    if (hoverHideTimer.current) clearTimeout(hoverHideTimer.current);
  }, []);
  const showHoverFor = useCallback((chart, data) => {
    if (!canMutateRef.current && !canCreateRef.current || !data?.jerarquia) {
      setHover(null);
      return;
    }
    const pt = nodePixelCenter(chart, data);
    if (!pt) return;
    keepHover();
    setHover({
      jerarquia: data.jerarquia,
      iusuario: data.iusuario,
      x: pt.x,
      y: pt.y
    });
  }, [keepHover]);
  const applyChartOption = useCallback((chart, data, sel) => {
    if (!chart) return;
    chart.setOption(buildOption(data, sel, isDarkScheme(), layoutSize), { notMerge: true });
    chart.resize();
  }, [layoutSize]);
  useEffect(() => {
    let disposed = false;
    let chart;
    let onResize;
    let ro;
    (async () => {
      const echarts = await loadEcharts();
      if (disposed || !hostRef.current) return;
      chart = echarts.init(hostRef.current, null, { renderer: "canvas" });
      chartRef.current = chart;
      chart.on("click", (params) => {
        const jer = params?.data?.jerarquia;
        if (jer) onSelectRef.current?.(jer);
      });
      chart.on("dblclick", (params) => {
        const jer = params?.data?.jerarquia;
        if (!jer || !canMutateRef.current) return;
        const node = (nodesRef.current ?? []).find((n) => n.jerarquia === jer);
        if (node) onEditRef.current?.(node);
      });
      chart.on("mouseover", (params) => {
        if (params?.dataType && params.dataType !== "node") return;
        showHoverFor(chart, params?.data);
      });
      chart.on("mouseout", () => clearHoverSoon());
      chart.on("globalout", () => clearHoverSoon());
      onResize = () => {
        chart?.resize();
        setHover(null);
      };
      window.addEventListener("resize", onResize);
      if (typeof ResizeObserver !== "undefined" && hostRef.current) {
        ro = new ResizeObserver(() => {
          chart?.resize();
          setHover(null);
        });
        ro.observe(hostRef.current);
      }
      applyChartOption(chart, treeDataRef.current, selectedJerRef.current);
    })();
    return () => {
      disposed = true;
      if (hoverHideTimer.current) clearTimeout(hoverHideTimer.current);
      if (onResize) window.removeEventListener("resize", onResize);
      ro?.disconnect();
      chart?.dispose();
      chartRef.current = null;
    };
  }, [applyChartOption, clearHoverSoon, showHoverFor]);
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    applyChartOption(chart, treeData, selectedJer);
    setHover(null);
  }, [treeData, selectedJer, applyChartOption]);
  const zoomBy = useCallback((factor) => {
    const chart = chartRef.current;
    if (!chart) return;
    const opt = chart.getOption();
    const series = Array.isArray(opt?.series) ? opt.series[0] : null;
    const cur = Number(series?.zoom) || 1;
    const next = Math.max(0.35, Math.min(3.5, cur * factor));
    chart.setOption({ series: [{ zoom: next }] });
    setHover(null);
  }, []);
  const resetView = useCallback(() => {
    const chart = chartRef.current;
    if (!chart) return;
    applyChartOption(chart, treeDataRef.current, selectedJerRef.current);
    setHover(null);
  }, [applyChartOption]);
  const hoverNode = hover ? (nodes ?? []).find((n) => n.jerarquia === hover.jerarquia) : null;
  return /* @__PURE__ */ jsxs(Box, { className: "role-hierarchy-orgchart", sx: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }, children: [
    /* @__PURE__ */ jsxs(Stack, { direction: "row", alignItems: "center", spacing: 0.5, sx: { px: 1, py: 0.4, borderBottom: 1, borderColor: "divider", flexShrink: 0, minHeight: 36 }, children: [
      /* @__PURE__ */ jsx(Chip, { size: "small", label: countLabel, sx: { height: 22, "& .MuiChip-label": { px: 0.75, fontSize: "0.72rem" } } }),
      /* @__PURE__ */ jsx(Box, { sx: { flex: 1, minWidth: 8 } }),
      /* @__PURE__ */ jsx(Tooltip, { title: "Acercar", children: /* @__PURE__ */ jsx(IconButton, { size: "small", onClick: () => zoomBy(1.2), "aria-label": "Zoom in", children: /* @__PURE__ */ jsx("iconify-icon", { icon: "mdi:magnify-plus-outline", width: "18", height: "18" }) }) }),
      /* @__PURE__ */ jsx(Tooltip, { title: "Alejar", children: /* @__PURE__ */ jsx(IconButton, { size: "small", onClick: () => zoomBy(1 / 1.2), "aria-label": "Zoom out", children: /* @__PURE__ */ jsx("iconify-icon", { icon: "mdi:magnify-minus-outline", width: "18", height: "18" }) }) }),
      /* @__PURE__ */ jsx(Tooltip, { title: "Restablecer vista", children: /* @__PURE__ */ jsx(IconButton, { size: "small", onClick: resetView, "aria-label": "Reset view", children: /* @__PURE__ */ jsx("iconify-icon", { icon: "mdi:fit-to-screen-outline", width: "18", height: "18" }) }) }),
      /* @__PURE__ */ jsx(Typography, { variant: "caption", color: "text.secondary", sx: { display: { xs: "none", md: "block" }, mr: 0.5 }, children: "Doble clic edita \xB7 hover \xB1" }),
      busy ? /* @__PURE__ */ jsx(CircularProgress, { size: 14 }) : null
    ] }),
    /* @__PURE__ */ jsxs(
      Box,
      {
        ref: wrapRef,
        sx: {
          flex: 1,
          minHeight: 0,
          width: "100%",
          overflow: "auto",
          position: "relative"
        },
        children: [
          /* @__PURE__ */ jsx(
            Box,
            {
              ref: hostRef,
              sx: {
                width: "100%",
                minWidth: layoutSize.w,
                minHeight: layoutSize.h,
                height: "100%"
              }
            }
          ),
          showNodeActions && hover && hoverNode ? /* @__PURE__ */ jsxs(
            Stack,
            {
              direction: "row",
              spacing: 0.25,
              className: "role-hierarchy-node-actions",
              onMouseEnter: keepHover,
              onMouseLeave: clearHoverSoon,
              sx: {
                position: "absolute",
                left: hover.x,
                top: hover.y - NODE_H / 2 - 14,
                transform: "translateX(-50%)",
                zIndex: 5,
                bgcolor: "background.paper",
                border: 1,
                borderColor: "divider",
                borderRadius: 0.75,
                boxShadow: 2,
                p: 0.15
              },
              children: [
                canCreateRoles ? /* @__PURE__ */ jsx(Tooltip, { title: "Agregar hijo", children: /* @__PURE__ */ jsx(
                  IconButton,
                  {
                    size: "small",
                    color: "primary",
                    disabled: busy,
                    "aria-label": "Agregar hijo",
                    onClick: () => onAddChildClick?.(hoverNode),
                    sx: { p: 0.35 },
                    children: /* @__PURE__ */ jsx("iconify-icon", { icon: "mdi:plus", width: "16", height: "16" })
                  }
                ) }) : null,
                canMutate ? /* @__PURE__ */ jsx(Tooltip, { title: "Eliminar rol", children: /* @__PURE__ */ jsx(
                  IconButton,
                  {
                    size: "small",
                    color: "error",
                    disabled: busy,
                    "aria-label": "Eliminar",
                    onClick: () => {
                      if (confirm(`\xBFEliminar rol "${hoverNode.iusuario}"?`)) onDeleteClick?.(hoverNode);
                    },
                    sx: { p: 0.35 },
                    children: /* @__PURE__ */ jsx("iconify-icon", { icon: "mdi:delete-outline", width: "16", height: "16" })
                  }
                ) }) : null
              ]
            }
          ) : null
        ]
      }
    )
  ] });
}
function buildOption(treeData, selectedJer, dark, layoutSize) {
  const data = applySelection(JSON.parse(JSON.stringify(treeData)), selectedJer, dark);
  const breadth = layoutSize?.breadth ?? 1;
  const topPct = breadth > 8 ? "2%" : "4%";
  const bottomPct = breadth > 8 ? "2%" : "4%";
  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      formatter: (p) => {
        const d = p?.data;
        if (!d?.jerarquia) return d?.name ?? "";
        const desc = d.descripcion ? `<br/><span style="opacity:.75">${d.descripcion}</span>` : "";
        return `<b>${d.name}</b><br/>${d.iusuario} ${formatJerarquiaLabel(d.jerarquia)}${desc}`;
      }
    },
    series: [{
      type: "tree",
      data: [data],
      top: topPct,
      left: "3%",
      bottom: bottomPct,
      right: "8%",
      symbol: "rect",
      symbolSize: [NODE_W, NODE_H],
      orient: "LR",
      layout: "orthogonal",
      edgeShape: "polyline",
      edgeForkPosition: "63%",
      expandAndCollapse: false,
      initialTreeDepth: -1,
      roam: true,
      scaleLimit: { min: 0.35, max: 3.5 },
      animationDuration: 280,
      animationDurationUpdate: 200,
      label: {
        position: "inside",
        verticalAlign: "middle",
        align: "center",
        fontSize: 11,
        fontWeight: 600,
        lineHeight: 14,
        color: dark ? "#e2e8f0" : "#0f172a",
        formatter: (p) => {
          const d = p.data;
          if (!d?.jerarquia) return d?.name ?? "";
          return `${d.name}
${formatJerarquiaLabel(d.jerarquia)}`;
        }
      },
      leaves: { label: { position: "inside", align: "center" } },
      lineStyle: {
        color: dark ? "rgba(56,189,248,0.45)" : "rgba(30,144,255,0.4)",
        width: 1.5,
        curveness: 0
      },
      emphasis: { focus: "descendant" }
    }]
  };
}

// js/tools/roleHierarchyTree/RoleHierarchyView.tsx
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var { useState: useState2, useCallback: useCallback2, useEffect: useEffect3 } = getReact();
var {
  Box: Box2,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress: CircularProgress2,
  Stack: Stack2
} = getMaterialUI();
function RoleHierarchyView(props) {
  const {
    nodes,
    initialSelectedRole,
    canMutate,
    canCreateRoles = false,
    busy,
    onSave,
    onCreate,
    onDelete
  } = props;
  const [selectedJer, setSelectedJer] = useState2(null);
  const [editTarget, setEditTarget] = useState2(null);
  useEffect3(() => {
    if (!initialSelectedRole || !nodes.length) return;
    const key = String(initialSelectedRole).trim().toLowerCase();
    const node = nodes.find((n) => String(n.iusuario ?? "").trim().toLowerCase() === key);
    if (node?.jerarquia) setSelectedJer((prev) => prev === node.jerarquia ? prev : node.jerarquia);
  }, [initialSelectedRole, nodes]);
  const openAddChild = useCallback2((parent) => {
    const jer = nextChildJerarquia(parent.jerarquia, nodes);
    setSelectedJer(parent.jerarquia);
    setEditTarget({
      isNew: true,
      node: { iusuario: "", jerarquia: jer, namedisplay: null, descripcion: null }
    });
  }, [nodes]);
  return /* @__PURE__ */ jsxs2(Box2, { className: "role-hierarchy-tree", sx: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }, children: [
    /* @__PURE__ */ jsx2(
      HierarchyOrgChart,
      {
        nodes,
        selectedJer,
        onSelect: setSelectedJer,
        canMutate,
        canCreateRoles,
        busy,
        onAddChildClick: openAddChild,
        onEditClick: (node) => setEditTarget({ node, isNew: false }),
        onDeleteClick: (node) => {
          void onDelete(node.iusuario);
        }
      }
    ),
    /* @__PURE__ */ jsx2(
      HierarchyEditDialog,
      {
        target: editTarget,
        busy,
        onClose: () => setEditTarget(null),
        onSave: async (name, jer) => {
          if (editTarget?.isNew) await onCreate(name, jer);
          else if (editTarget) await onSave(editTarget.node.iusuario, jer);
          setEditTarget(null);
        }
      }
    )
  ] });
}
function HierarchyEditDialog({ target, busy, onClose, onSave }) {
  const isNew = target?.isNew ?? false;
  const [name, setName] = useState2(target?.node.iusuario ?? "");
  const [jerarquia, setJerarquia] = useState2(target?.node.jerarquia ?? "");
  const [err, setErr] = useState2("");
  React.useEffect(() => {
    setName(target?.node.iusuario ?? "");
    setJerarquia(target?.node.jerarquia ?? "");
    setErr("");
  }, [target]);
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
  return /* @__PURE__ */ jsxs2(Dialog, { open: true, onClose, maxWidth: "sm", fullWidth: true, children: [
    /* @__PURE__ */ jsx2(DialogTitle, { children: isNew ? "Nuevo rol hijo" : `Editar ${target.node.iusuario}` }),
    /* @__PURE__ */ jsx2(DialogContent, { dividers: true, children: /* @__PURE__ */ jsxs2(Stack2, { spacing: 2, children: [
      err ? /* @__PURE__ */ jsx2(Alert, { severity: "error", children: err }) : null,
      /* @__PURE__ */ jsx2(TextField, { label: "Nombre", value: name, onChange: (e) => setName(e.target.value), disabled: !isNew, helperText: "min\xFAsculas, sin espacios (ej. dev_lead)" }),
      /* @__PURE__ */ jsx2(TextField, { label: "Jerarqu\xEDa", value: jerarquia, onChange: (e) => setJerarquia(e.target.value), helperText: "dot-notation: 0, 0.0, 0.1.1, ..." })
    ] }) }),
    /* @__PURE__ */ jsxs2(DialogActions, { children: [
      /* @__PURE__ */ jsx2(Button, { onClick: onClose, disabled: busy, children: "Cancelar" }),
      /* @__PURE__ */ jsx2(Button, { variant: "contained", onClick: handleSubmit, disabled: busy, children: busy ? /* @__PURE__ */ jsx2(CircularProgress2, { size: 16 }) : "Guardar" })
    ] })
  ] });
}

// js/tools/roleHierarchyTree/hierarchyFromRoles.ts
init_roleHierarchy();

// js/tools/permisosForm.js
var FLAG_DEFS = [
  { key: "*", label: "Acceso total", hint: "Wildcard \u2014 anula el resto de restricciones de ruta." },
  { key: "impersonate", label: "Suplantar chat", hint: "Actuar como otro usuario en conversaciones." },
  { key: "manage_permissions", label: "Gestionar permisos", hint: "CRUD de dbo.SYS_USR_PERMISSIONS (dev_lead)." }
];
var FLAG_KEYS = new Set(FLAG_DEFS.map((f) => f.key));
function roleDescripcion(permisos) {
  const d = permisos?.descripcion;
  return d != null && String(d).trim() ? String(d).trim() : "";
}
function roleNamedisplay(permisos) {
  const d = permisos?.namedisplay;
  return d != null && String(d).trim() ? String(d).trim() : "";
}

// js/tools/permisosKanbanShared.js
init_roleHierarchy();
init_roleCanonicalMeta();
function permEntryKey(entry) {
  return String(entry?.iusuario ?? entry?.ientity ?? "").trim();
}
function roleNameFromEntry(entry) {
  return permEntryKey(entry).toLowerCase().replace(/^role:/i, "");
}
function formatRoleTitle(roleName) {
  return String(roleName ?? "").split("_").map((part) => {
    const p = part.toLowerCase();
    if (p === "iss" || p === "isw") return p.toUpperCase();
    if (!p) return "";
    return p.charAt(0).toUpperCase() + p.slice(1);
  }).filter(Boolean).join(" ");
}
function roleTitleFromEntry(entry) {
  const roleName = roleNameFromEntry(entry);
  const canon = canonicalRoleMeta(roleName);
  if (canon?.namedisplay) return canon.namedisplay;
  const namedisplay = roleNamedisplay(entry?.permisos);
  const formatted = formatRoleTitle(roleName);
  if (!namedisplay) return formatted;
  if (formatted.length > namedisplay.length) return formatted;
  return namedisplay;
}
function roleDescripcionFromEntry(entry) {
  const roleName = roleNameFromEntry(entry);
  const canon = canonicalRoleMeta(roleName);
  if (canon?.descripcion) return canon.descripcion;
  return roleDescripcion(entry?.permisos);
}

// js/tools/roleHierarchyTree/hierarchyFromRoles.ts
function hierarchyNodesFromRoleEntries(roleEntries) {
  const out = [];
  for (const e of roleEntries ?? []) {
    const iusuario = roleNameFromEntry(e);
    if (!iusuario) continue;
    const permisos = e.permisos && typeof e.permisos === "object" ? e.permisos : {};
    const jerarquia = getRoleJerarquia(iusuario, permisos);
    if (!jerarquia) continue;
    out.push({
      iusuario,
      jerarquia,
      namedisplay: roleTitleFromEntry(e) || null,
      descripcion: roleDescripcionFromEntry(e) || null,
      bactivo: e.bactivo !== false
    });
  }
  return out;
}
export {
  HierarchyOrgChart,
  RoleHierarchyView,
  buildOrgTreeData,
  hierarchyNodesFromRoleEntries,
  nextChildJerarquia
};
