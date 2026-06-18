import { getReact, getMaterialUI, UI } from "../../core/platform.ts";

const { useState } = getReact();
const { Box, Typography, TextField, Button, Stack } = getMaterialUI();
const { Icon } = UI;

function TaskCard({ task, onOpen, onDragStart }) {
  const subCount = task.subtasks?.length ?? 0;
  const msCount = task.milestones?.length ?? 0;
  const openMs = (task.milestones ?? []).filter((m) => !m.completedAt).length;

  return (
    <Box
      className="paty-todos-card"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", task.id);
        onDragStart(task.id);
      }}
      onClick={() => onOpen(task.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") onOpen(task.id); }}
    >
      <div className="paty-todos-card__title">{task.title}</div>
      <div className="paty-todos-card__meta">
        {task.assignedTo ? (
          <span className="paty-todos-card__badge">
            <Icon icon="mdi:account-outline" size={12} />
            {task.assignedTo}
          </span>
        ) : null}
        {subCount ? (
          <span className="paty-todos-card__badge">
            <Icon icon="mdi:checkbox-multiple-marked-outline" size={12} />
            {subCount}
          </span>
        ) : null}
        {msCount ? (
          <span className="paty-todos-card__badge">
            <Icon icon="mdi:flag-outline" size={12} />
            {openMs}/{msCount}
          </span>
        ) : null}
      </div>
    </Box>
  );
}

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

export function TodosKanban({ boardData, onOpenTask, onQuickAdd, onDragStart, onDropColumn }) {
  const [dragOverCol, setDragOverCol] = useState(null);

  if (!boardData) return null;

  const { columns, tasks } = boardData;

  return (
    <Box className="paty-todos-kanban">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.columnId === col.id);
        const isOver = dragOverCol === col.id;
        return (
          <Box key={col.id} className="paty-todos-column">
            <Box className="paty-todos-column__head">
              <span>{col.title}</span>
              <span className="paty-todos-column__count">{colTasks.length}</span>
            </Box>
            <Box
              className={`paty-todos-column__list${isOver ? " paty-todos-column__list--drag-over" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.id); }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverCol(null);
                onDropColumn(col.id);
              }}
            >
              {colTasks.map((task) => (
                <TaskCard key={task.id} task={task} onOpen={onOpenTask} onDragStart={onDragStart} />
              ))}
            </Box>
            {col.columnKey === "pending" ? (
              <ColumnAddForm onAdd={(title) => onQuickAdd(col.id, title)} />
            ) : null}
          </Box>
        );
      })}
    </Box>
  );
}
