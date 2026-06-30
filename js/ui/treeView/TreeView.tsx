/**
 * TreeView React genérico — espejo TreeRowView.svelte (ContaPyme).
 * Datos: items[] planos. Comportamiento: manifest JSON + customs (callbacks).
 */

import * as React from "react";
import { getMaterialUI, getReact } from "../../core/platform.ts";
import { TreeRowItem } from "./TreeRowItem.js";
import { buildTreeFromFlatList, collectPathsWithChildren, findTreeNodeByPath } from "./treeData.js";
import type { DragOverZone, TreeRowDragState, TreeRuntime, TreeViewProps } from "./contracts.js";

const { useState, useMemo, useCallback } = getReact();
const { Box, Stack, Typography, Chip, IconButton, Tooltip, Button, CircularProgress } = getMaterialUI();

const EMPTY_DRAG: TreeRowDragState = { sourcePath: null, overPath: null, overZone: null, forbidden: false };

export function TreeView<T extends Record<string, unknown>>(props: TreeViewProps<T>): React.ReactElement {
  const {
    items, manifest, customs, readonly = false, busy = false,
    selectedPath: selectedPathProp, onSelectedPathChange,
    className = "", toolbarTitle, toolbarExtra, showToolbar = true,
  } = props;

  const features = manifest.features ?? {};
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [selectedPathInternal, setSelectedPathInternal] = useState<string | null>(null);
  const [drag, setDrag] = useState<TreeRowDragState>(EMPTY_DRAG);

  const selectedPath = selectedPathProp !== undefined ? selectedPathProp : selectedPathInternal;
  const setSelectedPath = useCallback((path: string | null) => {
    if (onSelectedPathChange) onSelectedPathChange(path);
    else setSelectedPathInternal(path);
  }, [onSelectedPathChange]);

  const rootNodes = useMemo(() => buildTreeFromFlatList(items, customs.build), [items, customs.build]);
  const canMutate = !readonly && !busy;

  const runtime: TreeRuntime<T> = useMemo(() => ({
    rootNodes,
    items,
    selectedPath,
    collapsed,
    readonly,
    busy,
    collapseAll: () => setCollapsed(new Set(collectPathsWithChildren(rootNodes))),
    expandAll: () => setCollapsed(new Set()),
    select: setSelectedPath,
    findByPath: (path) => findTreeNodeByPath(rootNodes, path),
  }), [rootNodes, items, selectedPath, collapsed, readonly, busy, setSelectedPath]);

  const setCollapsedFor = useCallback((path: string, open: boolean) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (open) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const handleDragStart = useCallback((path: string) => {
    setDrag({ sourcePath: path, overPath: null, overZone: null, forbidden: false });
  }, []);

  const handleDragOver = useCallback((path: string, zone: DragOverZone, forbidden: boolean) => {
    setDrag((prev) => {
      if (prev.overPath === path && prev.overZone === zone && prev.forbidden === forbidden) return prev;
      return { ...prev, overPath: path, overZone: zone, forbidden };
    });
  }, []);

  const handleDragLeave = useCallback((path: string) => {
    setDrag((prev) => (prev.overPath === path ? { ...prev, overPath: null, overZone: null, forbidden: false } : prev));
  }, []);

  const handleDragEnd = useCallback(() => setDrag(EMPTY_DRAG), []);

  const handleDrop = useCallback(async (sourcePath: string, targetPath: string, zone: DragOverZone) => {
    setDrag(EMPTY_DRAG);
    await customs.onDrop?.(sourcePath, targetPath, zone, items);
  }, [customs, items]);

  const toolbarActions = useMemo(
    () => (customs.toolbarActions?.(runtime) ?? []).filter((a) => !a.hidden),
    [customs, runtime],
  );

  const countLabel = manifest.countLabel ?? `${items.length} ${manifest.entrie ?? "elemento"}${items.length !== 1 ? "s" : ""}`;
  const ariaLabel = manifest.ariaLabel ?? manifest.entries ?? `Árbol de ${manifest.entrie ?? "elementos"}`;

  return (
    <Box className={`isp-tree-host isp-tree ${className}`.trim()} sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {showToolbar ? (
        <Stack direction="row" alignItems="center" spacing={1} className="isp-tree-toolbar" sx={{ p: 1, borderBottom: 1, borderColor: "divider", flexShrink: 0 }}>
          {toolbarTitle ? <Typography variant="subtitle1" sx={{ flex: 1 }}>{toolbarTitle}</Typography> : <Box sx={{ flex: 1 }} />}
          <Chip size="small" label={countLabel} />
          {features.toolbarExpandCollapse !== false ? (
            <>
              <Tooltip title="Expandir todo">
                <IconButton size="small" onClick={runtime.expandAll} disabled={busy}>
                  <iconify-icon icon="mdi:unfold-more-horizontal" width="18" height="18" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Colapsar todo">
                <IconButton size="small" onClick={runtime.collapseAll} disabled={busy}>
                  <iconify-icon icon="mdi:unfold-less-horizontal" width="18" height="18" />
                </IconButton>
              </Tooltip>
            </>
          ) : null}
          {toolbarActions.map((act) => (
            act.variant === "button" ? (
              <Button key={act.id} size="small" variant="contained" disabled={act.disabled || busy}
                startIcon={<iconify-icon icon={act.icon} width="16" height="16" />}
                onClick={act.onClick}>
                {act.label ?? act.title}
              </Button>
            ) : (
              <Tooltip key={act.id} title={act.title}>
                <span>
                  <IconButton size="small" disabled={act.disabled || busy} onClick={act.onClick} aria-label={act.title}>
                    <iconify-icon icon={act.icon} width="18" height="18" />
                  </IconButton>
                </span>
              </Tooltip>
            )
          ))}
          {toolbarExtra}
        </Stack>
      ) : null}

      {busy ? (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2, flex: 1, minHeight: 0 }}>
          <CircularProgress size={20} />
        </Box>
      ) : (
      <Box className="isp-tree isp-tree-body custom-scrollbar" role="tree" aria-label={ariaLabel} sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        {rootNodes.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            {manifest.emptyMessage ?? "Sin elementos."}
          </Typography>
        ) : (
          <TreeRowItem
            nodes={rootNodes}
            items={items}
            manifest={manifest}
            customs={customs}
            collapsed={collapsed}
            selectedPath={selectedPath}
            highlightedPath={selectedPath}
            canMutate={canMutate}
            drag={drag}
            onToggleCollapse={setCollapsedFor}
            onSelect={setSelectedPath}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
          />
        )}
      </Box>
      )}
    </Box>
  );
}

export type { TreeRuntime };
