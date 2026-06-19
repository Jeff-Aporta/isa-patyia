import { getReact, getMaterialUI, UI, requestConfirm } from "../../core/platform.ts";
import { BoardPreviewKanban } from "./BoardPreviewKanban.jsx";
import { boardRoleChips, canDeleteBoard, readBoardExpandState, sortBoardsByRecent, writeBoardExpandState } from "./boardsHomeState.js";

const { useState, useEffect, useMemo } = getReact();
const { Box, Typography, Button, Stack, Chip, CircularProgress, Skeleton, Accordion, AccordionSummary, AccordionDetails, IconButton, Tooltip } = getMaterialUI();
const { Icon } = UI;

function formatBoardDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("es-CO", { dateStyle: "short" });
  } catch {
    return String(iso);
  }
}

function BoardPreviewSkeleton() {
  return (
    <Box className="paty-todos-kanban paty-todos-kanban--preview paty-todos-kanban--preview-loading">
      {[0, 1].map((i) => (
        <Box key={i} className="paty-todos-column paty-todos-column--pending">
          <Skeleton variant="rounded" height={28} sx={{ m: 1.5 }} />
          <Stack spacing={1} sx={{ px: 1, pb: 1 }}>
            <Skeleton variant="rounded" height={96} />
            <Skeleton variant="rounded" height={96} />
          </Stack>
        </Box>
      ))}
    </Box>
  );
}

function BoardAccordionRow({ board, preview, previewReady, loadingPreviews, expanded, onToggleExpand, onOpenBoard, onOpenTask, onDeleteBoard, deleting }) {
  const deletable = canDeleteBoard(board);
  const roleChips = boardRoleChips(board);

  function stopBubble(e) { e.stopPropagation(); }

  async function handleDelete(e) {
    stopBubble(e);
    const ok = await requestConfirm({
      title: "Eliminar tablero",
      message: `¿Eliminar el tablero "${board.title}"? Esta acción no se puede deshacer.`,
      confirmLabel: "Eliminar",
      cancelLabel: "Cancelar",
    });
    if (!ok) return;
    await onDeleteBoard(board.id);
  }

  return (
    <Accordion expanded={expanded} onChange={(_, next) => onToggleExpand(board.id, next)} className="paty-todos-board-acc" disableGutters elevation={0}>
      <AccordionSummary expandIcon={<Icon icon="mdi:chevron-down" size={20} />} className="paty-todos-board-acc__summary">
        <Box className="paty-todos-board-row__header">
          <Box className="paty-todos-board-row__headline">
            <Box className="paty-todos-board-row__title-wrap">
              <Icon icon="mdi:view-column" size={20} />
              <Typography
                className="paty-todos-board-row__title paty-todos-board-row__title--link"
                variant="subtitle1"
                component="button"
                type="button"
                title={`Abrir ${board.title}`}
                onClick={(e) => { stopBubble(e); onOpenBoard(board.id); }}
              >
                {board.title}
              </Typography>
            </Box>
            {board.description && !expanded ? (
              <Typography className="paty-todos-board-row__desc" variant="body2" color="text.secondary">
                {board.description}
              </Typography>
            ) : null}
          </Box>
          <Box className="paty-todos-board-row__actions" onClick={stopBubble}>
            <Box className="paty-todos-board-row__aside">
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap className="paty-todos-board-row__chips">
                {board.visibility === "public" ? (
                  <Chip
                    size="small"
                    className="paty-todos-board-card__chip paty-todos-board-card__chip--visibility paty-todos-board-card__chip--public"
                    label="Público"
                    icon={<Icon icon="mdi:earth" size={12} />}
                  />
                ) : (
                  <Chip
                    size="small"
                    className="paty-todos-board-card__chip paty-todos-board-card__chip--visibility"
                    label="Privado"
                    icon={<Icon icon="mdi:lock-outline" size={12} />}
                  />
                )}
              {roleChips.map((chip) => (
                <Chip
                  key={chip.id}
                  size="small"
                  className={`paty-todos-board-card__chip paty-todos-board-card__chip--${chip.variant}`}
                  label={chip.label}
                  variant={chip.variant === "role" ? "outlined" : "filled"}
                  icon={<Icon icon={chip.icon} size={12} />}
                />
              ))}
              </Stack>
              <Typography className="paty-todos-board-row__meta" component="span" variant="caption">
                {formatBoardDate(board.updatedAt)}
              </Typography>
            </Box>
            {deletable ? (
              <Tooltip title="Eliminar tablero (solo admin global)">
                <span>
                  <IconButton size="small" className="paty-todos-board-row__delete" aria-label="Eliminar tablero" disabled={deleting} onClick={handleDelete}>
                    <Icon icon="mdi:delete-outline" size={18} />
                  </IconButton>
                </span>
              </Tooltip>
            ) : null}
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails className="paty-todos-board-acc__details">
        <Box className="paty-todos-board-row__preview">
          {!previewReady && loadingPreviews ? (
            <BoardPreviewSkeleton />
          ) : preview ? (
            <BoardPreviewKanban
              boardData={preview}
              onOpenTask={(taskId) => onOpenTask(board.id, taskId)}
            />
          ) : previewReady ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, px: 1 }}>
              No se pudo cargar la vista previa del tablero.
            </Typography>
          ) : (
            <BoardPreviewSkeleton />
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}

export function BoardsHomeToolbar({ loading, onNewBoard, onRefresh }) {
  return (
    <Box className="paty-todos-toolbar">
      <Icon icon="mdi:view-dashboard-outline" size={22} />
      <span className="paty-todos-board-title">Mis tableros SCRUM</span>
      <Box sx={{ flex: 1 }} />
      <Button size="small" variant="outlined" startIcon={<Icon icon="mdi:plus" size={16} />} onClick={onNewBoard}>
        Nuevo
      </Button>
      <Button size="small" variant="text" onClick={onRefresh} disabled={loading} startIcon={loading ? <CircularProgress size={14} /> : <Icon icon="mdi:refresh" size={16} />}>
        Actualizar
      </Button>
    </Box>
  );
}

export function BoardsHome({ boards, boardPreviews = {}, loadingPreviews = false, loading, onOpenBoard, onOpenTask, onNewBoard, onDeleteBoard }) {
  const sortedBoards = useMemo(() => sortBoardsByRecent(boards), [boards]);
  const [expandState, setExpandState] = useState(() => readBoardExpandState());
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    writeBoardExpandState(expandState);
  }, [expandState]);

  function isExpanded(boardId) {
    if (Object.prototype.hasOwnProperty.call(expandState, boardId)) {
      return !!expandState[boardId];
    }
    return true;
  }

  function handleToggleExpand(boardId, next) { setExpandState((prev) => ({ ...prev, [boardId]: next })); }

  async function handleDeleteBoard(boardId) {
    setDeletingId(boardId);
    try {
      await onDeleteBoard(boardId);
      setExpandState((prev) => {
        const next = { ...prev };
        delete next[boardId];
        return next;
      });
    } finally {
      setDeletingId("");
    }
  }

  if (loading && !boards.length) {
    return (
      <Box className="paty-todos-boards-home paty-todos-boards-home--loading">
        <CircularProgress />
      </Box>
    );
  }

  if (!boards.length) {
    return (
      <Box className="paty-todos-gate">
        <Stack spacing={2} alignItems="center" sx={{ maxWidth: 420, p: 2 }}>
          <Icon icon="mdi:view-column" width="2.5em" height="2.5em" style={{ opacity: 0.7 }} />
          <Typography variant="body1" color="text.secondary" textAlign="center">
            No hay tableros SCRUM. Crea el primero para empezar.
          </Typography>
          <Button variant="contained" startIcon={<Icon icon="mdi:plus" size={18} />} onClick={onNewBoard}>
            Crear tablero
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box className="paty-todos-boards-home">
      <Box className="paty-todos-boards-list">
        {sortedBoards.map((board) => (
          <BoardAccordionRow key={board.id} board={board} preview={boardPreviews[board.id]} previewReady={Object.prototype.hasOwnProperty.call(boardPreviews, board.id)} loadingPreviews={loadingPreviews} expanded={isExpanded(board.id)} onToggleExpand={handleToggleExpand} onOpenBoard={onOpenBoard} onOpenTask={onOpenTask} onDeleteBoard={handleDeleteBoard} deleting={deletingId === board.id} />
        ))}
      </Box>
    </Box>
  );
}
