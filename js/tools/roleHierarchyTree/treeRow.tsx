/** Fila individual del árbol de jerarquía. */

import * as React from "react";
import type { PointerEvent as ReactPointerEvent, DragEvent as ReactDragEvent, ReactNode } from "react";
import { getMaterialUI, UI } from "../../core/platform.ts";

const { Icon } = UI;
const { Box, Stack, Typography, IconButton, Tooltip } = getMaterialUI();

import type { TreeRow } from "./types.js";

export interface TreeRowViewProps {
  row: TreeRow;
  isCollapsed: boolean;
  isDragOver: boolean;
  isDragSource: boolean;
  canMutate: boolean;
  isSelected: boolean;
  childCount: number;
  onToggleCollapse: () => void;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDragStart: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onDragOver: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onDrop: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onDragEnd: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onDrillDown?: () => void;
}

export function TreeRowView(props: TreeRowViewProps): React.ReactElement {
  const {
    row, isCollapsed, isDragOver, isDragSource, canMutate, isSelected, childCount,
    onToggleCollapse, onSelect, onEdit, onDelete,
    onDragStart, onDragOver, onDrop, onDragEnd, onDrillDown,
  } = props;

  const accent: string = row.jerarquia.startsWith("0.") || row.jerarquia === "0" ? "#10b981" : "#a855f7";
  const indent: number = row.depth * 18;

  const className: string = [
    "role-tree-row",
    isDragOver ? "role-tree-row--drag-over" : "",
    isDragSource ? "role-tree-row--drag-source" : "",
    isSelected ? "role-tree-row--selected" : "",
  ].filter(Boolean).join(" ");

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    onDragStart(e);
  };
  const handlePointerOver = (e: ReactPointerEvent<HTMLDivElement>) => {
    onDragOver(e);
  };
  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    onDrop(e);
  };
  const handlePointerLeave = (e: ReactPointerEvent<HTMLDivElement>) => {
    onDragEnd(e);
  };

  return (
    <Box
      role="treeitem"
      aria-level={row.depth + 1}
      aria-expanded={row.hasChildren ? !isCollapsed : undefined}
      data-jerarquia={row.jerarquia}
      draggable={canMutate}
      onPointerDown={handlePointerDown}
      onPointerOver={handlePointerOver}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      className={className}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        pl: `${indent + 8}px`,
        pr: 1,
        py: 0.5,
        borderLeft: `3px solid ${accent}`,
        backgroundColor: isDragOver ? "action.hover" : (isSelected ? "action.selected" : "transparent"),
        cursor: canMutate ? "grab" : "default",
        userSelect: "none",
      }}
      onClick={onSelect}
    >
      <Tooltip title={row.hasChildren ? (isCollapsed ? "Expandir" : "Colapsar") : ""}>
        <span>
          <IconButton
            size="small"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onToggleCollapse();
            }}
            disabled={!row.hasChildren}
            aria-label={isCollapsed ? "Expandir" : "Colapsar"}
          >
            <iconify-icon icon={row.hasChildren ? (isCollapsed ? "mdi:chevron-right" : "mdi:chevron-down") : "mdi:circle-small"} width="16" height="16" />
          </IconButton>
        </span>
      </Tooltip>

      <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1, minWidth: 0 }}>
        <iconify-icon icon="mdi:shield-account-outline" width="16" height="16" />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} noWrap title={row.namedisplay ?? row.iusuario}>
            {row.namedisplay ?? row.iusuario}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontFamily: "monospace" }} title={`Jerarquía ${row.jerarquia}`}>
            {row.jerarquia}
          </Typography>
        </Box>
      </Stack>

      {row.hasChildren ? (
        <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
          {childCount} hijo{childCount !== 1 ? "s" : ""}
        </Typography>
      ) : null}

      {canMutate ? (
        <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
          {onDrillDown ? (
            <Tooltip title="Editar permisos de este nodo">
              <IconButton size="small" aria-label="Editar permisos" onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDrillDown(); }}>
                <iconify-icon icon="mdi:pencil-box-outline" width="16" height="16" />
              </IconButton>
            </Tooltip>
          ) : null}
          <Tooltip title="Mover de jerarquía">
            <IconButton size="small" aria-label="Mover" onClick={(e: React.MouseEvent) => { e.stopPropagation(); onEdit(); }}>
              <iconify-icon icon="mdi:arrow-up-down-bold" width="16" height="16" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar rol">
            <IconButton size="small" aria-label="Eliminar" onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDelete(); }}>
              <iconify-icon icon="mdi:trash-can-outline" width="16" height="16" />
            </IconButton>
          </Tooltip>
        </Stack>
      ) : null}
    </Box>
  );
}