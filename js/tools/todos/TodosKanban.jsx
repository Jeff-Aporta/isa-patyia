import { getReact, getMaterialUI, UI } from "../../core/platform.ts";

const { useState, useMemo, useRef, useEffect, memo } = getReact();
const { Box, Paper, Typography, TextField, Button, Stack, Chip } = getMaterialUI();
const { Icon } = UI;

const DRAG_THRESHOLD_PX = 6;

/** Tema visual por columna (extensible cuando haya más columnas). */
const COLUMN_THEME = {
  pending: {
    className: "paty-todos-column--pending",
    accent: "#38bdf8",
    icon: "mdi:clock-outline",
  },
  done: {
    className: "paty-todos-column--done",
    accent: "#34d399",
    icon: "mdi:check-circle-outline",
  },
};

function themeForColumn(columnKey) {
  return COLUMN_THEME[columnKey] ?? {
    className: "paty-todos-column--default",
    accent: "#94a3b8",
    icon: "mdi:view-column",
  };
}

function columnAtPoint(columnIds, listRefs, clientX, clientY) {
  for (const colId of columnIds) {
    const el = listRefs.current[colId];
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    if (
      clientX >= rect.left
      && clientX <= rect.right
      && clientY >= rect.top
      && clientY <= rect.bottom
    ) {
      return colId;
    }
  }
  return null;
}

const TaskCard = memo(function TaskCard({ task, columnId, readOnly, isOptimistic, onOpen, onPointerDragStart, suppressClickRef }) {
  const subCount = task.subtasks?.length ?? 0;
  const msCount = task.milestones?.length ?? 0;
  const openMs = (task.milestones ?? []).filter((m) => !m.completedAt).length;
  const canDrag = !readOnly && !isOptimistic;

  return (
    <Paper
      className={`paty-todos-card${isOptimistic ? " paty-todos-card--optimistic" : ""}${canDrag ? " paty-todos-card--draggable" : ""}`}
      elevation={0}
      onPointerDown={(e) => {
        if (!canDrag) return;
        if (e.button !== 0 && e.pointerType !== "touch") return;
        onPointerDragStart(task.id, columnId, e);
      }}
      onClick={() => {
        if (suppressClickRef.current) {
          suppressClickRef.current = false;
          return;
        }
        onOpen(task.id);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") onOpen(task.id); }}
    >
      <Typography className="paty-todos-card__title" component="div" variant="body2">
        {task.title}
      </Typography>
      <div className="paty-todos-card__meta">
        {task.assignedTo ? (
          <Chip
            size="small"
            className="paty-todos-card__chip"
            label={task.assignedTo}
            icon={<Icon icon="mdi:account-outline" size={12} />}
          />
        ) : null}
        {subCount ? (
          <Chip
            size="small"
            className="paty-todos-card__chip"
            label={String(subCount)}
            icon={<Icon icon="mdi:checkbox-multiple-marked-outline" size={12} />}
          />
        ) : null}
        {msCount ? (
          <Chip
            size="small"
            className="paty-todos-card__chip"
            label={`${openMs}/${msCount}`}
            icon={<Icon icon="mdi:flag-outline" size={12} />}
          />
        ) : null}
      </div>
    </Paper>
  );
});

function ColumnAddForm({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");

  if (!open) {
    return (
      <Button
        fullWidth
        size="small"
        className="paty-todos-add-card"
        startIcon={<Icon icon="mdi:plus" size={16} />}
        onClick={() => setOpen(true)}
        sx={{ justifyContent: "flex-start", color: "text.secondary" }}
      >
        Añadir tarjeta
      </Button>
    );
  }

  return (
    <Box className="paty-todos-add-card">
      <TextField
        autoFocus
        fullWidth
        size="small"
        multiline
        minRows={2}
        placeholder="Título de la tarea…"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && title.trim()) {
            e.preventDefault();
            onAdd(title.trim());
            setTitle("");
            setOpen(false);
          }
          if (e.key === "Escape") setOpen(false);
        }}
      />
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <Button
          variant="contained"
          size="small"
          disabled={!title.trim()}
          onClick={() => {
            onAdd(title.trim());
            setTitle("");
            setOpen(false);
          }}
        >
          Añadir
        </Button>
        <Button size="small" onClick={() => { setOpen(false); setTitle(""); }}>Cancelar</Button>
      </Stack>
    </Box>
  );
}

export function TodosKanban({ boardData, readOnly = false, onOpenTask, onQuickAdd, onDragStart, onDropColumn }) {
  const [dragOverCol, setDragOverCol] = useState(null);
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const listRefs = useRef({});
  const dragRef = useRef(null);
  const cardElRef = useRef(null);
  const suppressClickRef = useRef(false);

  const tasksByColumn = useMemo(() => {
    if (!boardData) return new Map();
    const map = new Map();
    for (const col of boardData.columns) map.set(col.id, []);
    for (const task of boardData.tasks) {
      const list = map.get(task.columnId);
      if (list) list.push(task);
    }
    return map;
  }, [boardData]);

  const columnIds = useMemo(
    () => (boardData?.columns ?? []).map((c) => c.id),
    [boardData?.columns],
  );

  function finishDrag(clientX, clientY) {
    const state = dragRef.current;
    dragRef.current = null;
    setDraggingTaskId(null);
    setDragOverCol(null);
    cardElRef.current?.classList.remove("paty-todos-card--dragging");
    cardElRef.current = null;

    if (!state?.moved) return;
    suppressClickRef.current = true;
    const targetCol = columnAtPoint(columnIds, listRefs, clientX, clientY);
    if (targetCol && targetCol !== state.sourceColumnId) {
      onDropColumn(targetCol);
    }
  }

  function handlePointerDragStart(taskId, sourceColumnId, e) {
    if (readOnly) return;
    onDragStart(taskId);
    dragRef.current = {
      taskId,
      sourceColumnId,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
      pointerId: e.pointerId,
    };
    cardElRef.current = e.currentTarget;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
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
        setDraggingTaskId(state.taskId);
        cardElRef.current?.classList.add("paty-todos-card--dragging");
      }
      e.preventDefault();
      const colId = columnAtPoint(columnIds, listRefs, e.clientX, e.clientY);
      setDragOverCol(colId);
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
  }, [readOnly, columnIds, onDropColumn]);

  if (!boardData) return null;

  const { columns } = boardData;

  return (
    <Box className={`paty-todos-kanban${draggingTaskId ? " paty-todos-kanban--dragging" : ""}`}>
      {columns.map((col) => {
        const colTasks = tasksByColumn.get(col.id) ?? [];
        const isOver = dragOverCol === col.id;
        const theme = themeForColumn(col.columnKey);
        return (
          <Box
            key={col.id}
            className={`paty-todos-column ${theme.className}`}
            style={{ "--col-accent": theme.accent }}
          >
            <Box className="paty-todos-column__head">
              <span className="paty-todos-column__title">
                <Icon icon={theme.icon} size={16} />
                {col.title}
              </span>
              <span className="paty-todos-column__count">{colTasks.length}</span>
            </Box>
            <Box
              ref={(el) => { listRefs.current[col.id] = el; }}
              data-column-id={col.id}
              className={`paty-todos-column__list${isOver ? " paty-todos-column__list--drag-over" : ""}`}
            >
              {colTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  columnId={col.id}
                  readOnly={readOnly}
                  isOptimistic={String(task.id).startsWith("optimistic-")}
                  onOpen={onOpenTask}
                  onPointerDragStart={handlePointerDragStart}
                  suppressClickRef={suppressClickRef}
                />
              ))}
            </Box>
            {!readOnly && col.columnKey === "pending" ? (
              <ColumnAddForm onAdd={(title) => onQuickAdd(col.id, title)} />
            ) : null}
          </Box>
        );
      })}
    </Box>
  );
}
