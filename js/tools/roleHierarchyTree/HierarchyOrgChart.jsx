/**
 * Árbol de jerarquía de roles con ECharts (CDN).
 * Zoom/pan; mutación vía hover (+ hijo / delete) y doble clic (editar).
 */
import { getMaterialUI, getReact } from "../../core/platform.ts";
import { formatJerarquiaLabel } from "../roleHierarchy.js";

const { useEffect, useMemo, useRef, useCallback, useState } = getReact();
const { Box, Stack, Typography, Chip, IconButton, Tooltip, CircularProgress } = getMaterialUI();

const ECHARTS_CDN = "https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.esm.min.js";
const NODE_W = 140;
const NODE_H = 40;
const NODE_GAP_Y = 18;
const LAYER_GAP_X = 56;

let echartsPromise = null;
function loadEcharts() {
  if (!echartsPromise) echartsPromise = import(/* @vite-ignore */ ECHARTS_CDN);
  return echartsPromise;
}

function immediateParentJer(jer) {
  const parts = String(jer ?? "").split(".").filter(Boolean);
  if (parts.length <= 1) return null;
  return parts.slice(0, -1).join(".");
}

/** Siguiente jerarquía hija directa (0.1 → 0.1.0, 0.1.1, …). */
export function nextChildJerarquia(parentJer, nodes) {
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
      color: sel
        ? (dark ? "rgba(8,47,73,0.95)" : "rgba(224,242,254,0.98)")
        : (dark ? "rgba(15,23,42,0.92)" : "rgba(255,255,255,0.95)"),
      borderColor: sel
        ? "#22d3ee"
        : (dark ? "rgba(56,189,248,0.55)" : "rgba(30,144,255,0.45)"),
      borderWidth: sel ? 2.5 : 1.5,
      borderRadius: 0,
      shadowBlur: dark ? 8 : 2,
      shadowColor: dark ? "rgba(56,189,248,0.25)" : "rgba(15,23,42,0.08)",
    },
    children: (node.children || []).map((c) => applySelection(c, selectedJer, dark)),
  };
}

/** Convierte nodos planos (jerarquia dot-notation) → árbol ECharts. */
export function buildOrgTreeData(nodes) {
  const byJer = new Map();
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
      children: [],
    });
  }
  const roots = [];
  for (const [jer, node] of byJer) {
    const parent = immediateParentJer(jer);
    if (parent && byJer.has(parent)) byJer.get(parent).children.push(node);
    else roots.push(node);
  }
  const sortRec = (list) => {
    list.sort((a, b) => String(a.jerarquia).localeCompare(String(b.jerarquia), undefined, { numeric: true }));
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
  } catch { /* ignore */ }
  if (Number.isFinite(data.x) && Number.isFinite(data.y)) {
    try {
      const px = chart.convertToPixel({ seriesIndex: 0 }, [data.x, data.y]);
      if (Array.isArray(px) && Number.isFinite(px[0]) && Number.isFinite(px[1])) {
        return { x: px[0], y: px[1] };
      }
    } catch { /* ignore */ }
  }
  return null;
}

export function HierarchyOrgChart({
  nodes,
  selectedJer,
  onSelect,
  canMutate = false,
  canCreateRoles = false,
  busy = false,
  onEditClick,
  onDeleteClick,
  onAddChildClick,
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
  const [hover, setHover] = useState(null); // { jerarquia, iusuario, x, y }
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
    if ((!canMutateRef.current && !canCreateRef.current) || !data?.jerarquia) {
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
      y: pt.y,
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

  const hoverNode = hover
    ? (nodes ?? []).find((n) => n.jerarquia === hover.jerarquia)
    : null;

  return (
    <Box className="role-hierarchy-orgchart" sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ px: 1, py: 0.4, borderBottom: 1, borderColor: "divider", flexShrink: 0, minHeight: 36 }}>
        <Chip size="small" label={countLabel} sx={{ height: 22, "& .MuiChip-label": { px: 0.75, fontSize: "0.72rem" } }} />
        <Box sx={{ flex: 1, minWidth: 8 }} />
        <Tooltip title="Acercar">
          <IconButton size="small" onClick={() => zoomBy(1.2)} aria-label="Zoom in">
            <iconify-icon icon="mdi:magnify-plus-outline" width="18" height="18" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Alejar">
          <IconButton size="small" onClick={() => zoomBy(1 / 1.2)} aria-label="Zoom out">
            <iconify-icon icon="mdi:magnify-minus-outline" width="18" height="18" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Restablecer vista">
          <IconButton size="small" onClick={resetView} aria-label="Reset view">
            <iconify-icon icon="mdi:fit-to-screen-outline" width="18" height="18" />
          </IconButton>
        </Tooltip>
        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", md: "block" }, mr: 0.5 }}>
          Doble clic edita · hover ±
        </Typography>
        {busy ? <CircularProgress size={14} /> : null}
      </Stack>
      <Box
        ref={wrapRef}
        sx={{
          flex: 1,
          minHeight: 0,
          width: "100%",
          overflow: "auto",
          position: "relative",
        }}
      >
        <Box
          ref={hostRef}
          sx={{
            width: "100%",
            minWidth: layoutSize.w,
            minHeight: layoutSize.h,
            height: "100%",
          }}
        />
        {showNodeActions && hover && hoverNode ? (
          <Stack
            direction="row"
            spacing={0.25}
            className="role-hierarchy-node-actions"
            onMouseEnter={keepHover}
            onMouseLeave={clearHoverSoon}
            sx={{
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
              p: 0.15,
            }}
          >
            {canCreateRoles ? (
              <Tooltip title="Agregar hijo">
                <IconButton
                  size="small"
                  color="primary"
                  disabled={busy}
                  aria-label="Agregar hijo"
                  onClick={() => onAddChildClick?.(hoverNode)}
                  sx={{ p: 0.35 }}
                >
                  <iconify-icon icon="mdi:plus" width="16" height="16" />
                </IconButton>
              </Tooltip>
            ) : null}
            {canMutate ? (
              <Tooltip title="Eliminar rol">
                <IconButton
                  size="small"
                  color="error"
                  disabled={busy}
                  aria-label="Eliminar"
                  onClick={() => {
                    if (confirm(`¿Eliminar rol "${hoverNode.iusuario}"?`)) onDeleteClick?.(hoverNode);
                  }}
                  sx={{ p: 0.35 }}
                >
                  <iconify-icon icon="mdi:delete-outline" width="16" height="16" />
                </IconButton>
              </Tooltip>
            ) : null}
          </Stack>
        ) : null}
      </Box>
    </Box>
  );
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
      },
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
          return `${d.name}\n${formatJerarquiaLabel(d.jerarquia)}`;
        },
      },
      leaves: { label: { position: "inside", align: "center" } },
      lineStyle: {
        color: dark ? "rgba(56,189,248,0.45)" : "rgba(30,144,255,0.4)",
        width: 1.5,
        curveness: 0,
      },
      emphasis: { focus: "descendant" },
    }],
  };
}
