import { getMaterialUI, getReact, UI } from "../core/platform.ts";
import { ButtonIconify } from "../ui/shared.jsx";
import { columnAtPoint, userCardLabels } from "./permisosKanbanShared.js";
import { RoleConfigFullscreenDialog, RoleDragDialog } from "./permisosRoleConfig.jsx";

const { useState, useMemo, useRef, useEffect, memo } = getReact();
const { Box, Paper, Typography, Stack, Chip, IconButton, Tooltip } = getMaterialUI();
const { Icon } = UI;

const DRAG_THRESHOLD_PX = 6;

const UserCard = memo(function UserCard({ card, columnId, readOnly, isDragSource, onPointerDragStart, suppressClickRef }) {
  const canDrag = !readOnly;
  const labels = card.labels ?? userCardLabels(card.username, card.displayName);
  return (
    <Paper
      className={`paty-todos-card paty-permisos-user-card isa-glass-card${canDrag ? " paty-todos-card--draggable" : ""}${isDragSource ? " paty-todos-card--drag-source" : ""}`}
      elevation={0}
      onPointerDown={(e) => {
        if (!canDrag || (e.button !== 0 && e.pointerType !== "touch")) return;
        onPointerDragStart(card.id, columnId, card.username, e);
      }}
      onClick={() => { if (suppressClickRef.current) { suppressClickRef.current = false; return; } }}
    >
      <Typography className="paty-todos-card__title" component="div" variant="body2" fontWeight={700} noWrap title={labels.primary}>{labels.primary}</Typography>
      {labels.secondary ? <Typography className="paty-todos-card__caption" component="div" variant="caption" color="text.secondary" noWrap title={labels.secondary}>{labels.secondary}</Typography> : null}
    </Paper>
  );
});

function DragGhost({ card, x, y, width }) {
  if (!card) return null;
  const labels = card.labels ?? userCardLabels(card.username, card.displayName);
  return (
    <Paper className="paty-todos-card paty-permisos-user-card paty-todos-card--ghost isa-glass-card" elevation={8}
      style={{ position: "fixed", left: x, top: y, width, zIndex: 10000, pointerEvents: "none" }} aria-hidden>
      <Typography className="paty-todos-card__title" variant="body2" fontWeight={700} noWrap>{labels.primary}</Typography>
      {labels.secondary ? <Typography className="paty-todos-card__caption" variant="caption" color="text.secondary" noWrap>{labels.secondary}</Typography> : null}
    </Paper>
  );
}

export function PermisosKanban({ boardData, readOnly, canManage, canEditRoleDescriptions, busy, onRoleSave, onRoleDrag }) {
  const [dragOverCol, setDragOverCol] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [dragGhost, setDragGhost] = useState(null);
  const [configCol, setConfigCol] = useState(null);
  const [dragPending, setDragPending] = useState(null);
  const listRefs = useRef({});
  const dragRef = useRef(null);
  const cardElRef = useRef(null);
  const suppressClickRef = useRef(false);

  const columns = boardData?.columns ?? [];
  const columnIds = useMemo(() => columns.map((c) => c.id), [columns]);
  const ghostCard = useMemo(() => {
    if (!dragGhost?.cardId) return null;
    for (const col of columns) {
      const hit = col.users.find((u) => u.id === dragGhost.cardId);
      if (hit) return hit;
    }
    return null;
  }, [dragGhost, columns]);

  function finishDrag(clientX, clientY) {
    const state = dragRef.current;
    dragRef.current = null;
    setDraggingId(null);
    setDragOverCol(null);
    setDragGhost(null);
    cardElRef.current = null;
    if (!state?.moved) return;
    suppressClickRef.current = true;
    const targetCol = columnAtPoint(columnIds, listRefs, clientX, clientY);
    if (!targetCol || targetCol === state.sourceColumnId) return;
    const username = state.username;
    const fromRole = state.sourceColumnId;
    const toRole = targetCol;
    const targetColData = columns.find((c) => c.id === toRole);
    if (targetColData?.users?.some((u) => u.username === username)) return;
    setDragPending({ username, fromRole, toRole });
  }

  function handlePointerDragStart(cardId, sourceColumnId, username, e) {
    dragRef.current = { cardId, sourceColumnId, username, startX: e.clientX, startY: e.clientY, moved: false, pointerId: e.pointerId };
    cardElRef.current = e.currentTarget;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ }
  }

  useEffect(() => {
    if (readOnly) return undefined;
    function onPointerMove(e) {
      const state = dragRef.current;
      if (!state || e.pointerId !== state.pointerId) return;
      const dx = Math.abs(e.clientX - state.startX);
      const dy = Math.abs(e.clientY - state.startY);
      if (!state.moved && dx + dy < DRAG_THRESHOLD_PX) return;
      if (!state.moved) {
        state.moved = true;
        setDraggingId(state.cardId);
        const rect = cardElRef.current?.getBoundingClientRect();
        if (rect) {
          state.offsetX = e.clientX - rect.left;
          state.offsetY = e.clientY - rect.top;
          state.ghostWidth = rect.width;
          setDragGhost({ cardId: state.cardId, x: rect.left, y: rect.top, width: rect.width });
        }
      }
      e.preventDefault();
      if (state.ghostWidth != null) {
        setDragGhost({ cardId: state.cardId, x: e.clientX - state.offsetX, y: e.clientY - state.offsetY, width: state.ghostWidth });
      }
      setDragOverCol(columnAtPoint(columnIds, listRefs, e.clientX, e.clientY));
    }
    function onPointerUp(e) {
      const state = dragRef.current;
      if (!state || e.pointerId !== state.pointerId) return;
      finishDrag(e.clientX, e.clientY);
    }
    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [readOnly, columnIds, columns]);

  if (!boardData) return null;

  return (
    <Box className={`paty-todos-kanban-wrap paty-permisos-kanban-wrap${readOnly ? " paty-todos-kanban-wrap--readonly" : ""}`}>
      <Box className={`paty-todos-kanban paty-permisos-kanban${draggingId ? " paty-todos-kanban--dragging" : ""}`}>
        {dragGhost ? <DragGhost card={ghostCard} x={dragGhost.x} y={dragGhost.y} width={dragGhost.width} /> : null}
        {columns.map((col) => {
          const isOver = dragOverCol === col.id;
          return (
            <Box key={col.id} className="paty-todos-column paty-permisos-column" style={{ "--col-accent": col.accent }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} className="paty-todos-column__head" sx={{ flexShrink: 0, px: 1.75, py: 1.25, pb: 1 }}>
                <Stack direction="row" alignItems="center" spacing={0.75} className="paty-todos-column__title" sx={{ minWidth: 0, flex: 1 }}>
                  <Icon icon={col.icon} size={16} />
                  <Box sx={{ minWidth: 0 }}>
                    <Box component="span" sx={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 700 }} title={col.title}>{col.title}</Box>
                    {col.descripcion ? <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.3, mt: 0.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={col.descripcion}>{col.descripcion}</Typography> : null}
                  </Box>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
                  <Box component="span" className="paty-todos-column__count">{col.users.length}</Box>
                  <Tooltip title="Configurar">
                    <IconButton size="small" onClick={() => setConfigCol(col)} aria-label="Configurar rol"><Icon icon="mdi:cog-outline" size={18} /></IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
              <Stack ref={(el) => { listRefs.current[col.id] = el; }} data-column-id={col.id} spacing={0.75}
                className={`paty-todos-column__list${isOver ? " paty-todos-column__list--drag-over" : ""}`}
                sx={{ flex: 1, minHeight: 0, overflowY: "auto", p: 1.25, px: 1.5, boxSizing: "border-box" }}>
                {col.users.map((card) => (
                  <UserCard key={card.id} card={card} columnId={col.id} readOnly={readOnly}
                    isDragSource={draggingId === card.id} onPointerDragStart={handlePointerDragStart} suppressClickRef={suppressClickRef} />
                ))}
                {!col.users.length ? <Typography variant="caption" color="text.secondary" sx={{ px: 0.5, py: 1 }}>Sin usuarios</Typography> : null}
              </Stack>
            </Box>
          );
        })}
      </Box>

      <RoleConfigFullscreenDialog open={!!configCol} column={configCol} canManage={canManage} canEditRoleDescriptions={canEditRoleDescriptions}
        busy={busy} onClose={() => setConfigCol(null)} onSave={(p) => { onRoleSave?.(p); setConfigCol(null); }} />

      <RoleDragDialog open={!!dragPending} pending={dragPending} onClose={() => setDragPending(null)}
        onConfirm={(mode) => {
          if (dragPending) onRoleDrag?.({ ...dragPending, mode });
          setDragPending(null);
        }} />
    </Box>
  );
}
