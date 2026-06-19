import { getReact, getMaterialUI, UI } from "../../core/platform.ts";
import {
  MAX_COLUMN_TASKS,
  formatTaskDate,
  groupTasksByColumn,
  taskModDate,
} from "./todosKanbanShared.js";
import { TaskAssigneeLabel } from "./TaskAssigneeLabel.jsx";

const { useMemo, useState } = getReact();
const { Box, Paper, Typography, Button } = getMaterialUI();
const { Icon } = UI;

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

function PreviewTaskCard({ task, onOpen }) {
  const modDate = formatTaskDate(taskModDate(task));

  return (
    <Paper
      className="paty-todos-card paty-todos-card--preview-clickable"
      elevation={0}
      onClick={() => onOpen(task.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") onOpen(task.id); }}
    >
      <Typography className="paty-todos-card__title" component="div" variant="body2">
        {task.title}
      </Typography>
      <TaskAssigneeLabel assignedTo={task.assignedTo} />
      <Typography className="paty-todos-card__date paty-todos-card__date--bottom" component="div" variant="caption" color="text.secondary">
        {modDate}
      </Typography>
    </Paper>
  );
}

export function BoardPreviewKanban({ boardData, onOpenTask }) {
  const [expandedCols, setExpandedCols] = useState(() => new Set());
  const tasksByColumn = useMemo(() => groupTasksByColumn(boardData), [boardData]);

  if (!boardData) return null;

  const { columns } = boardData;

  return (
    <Box className="paty-todos-kanban paty-todos-kanban--preview">
      {columns.map((col) => {
        const colTasks = tasksByColumn.get(col.id) ?? [];
        const isExpanded = expandedCols.has(col.id);
        const hasMore = colTasks.length > MAX_COLUMN_TASKS;
        const visibleTasks = isExpanded || !hasMore
          ? colTasks
          : colTasks.slice(0, MAX_COLUMN_TASKS);
        const hiddenCount = hasMore && !isExpanded ? colTasks.length - MAX_COLUMN_TASKS : 0;
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
            <Box className="paty-todos-column__list" data-column-id={col.id}>
              {visibleTasks.map((task) => (
                <PreviewTaskCard
                  key={task.id}
                  task={task}
                  onOpen={onOpenTask}
                />
              ))}
              {hiddenCount > 0 ? (
                <Button
                  fullWidth
                  size="small"
                  className="paty-todos-column__show-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedCols((prev) => new Set(prev).add(col.id));
                  }}
                >
                  Ver todo ({colTasks.length})
                </Button>
              ) : null}
              {isExpanded && hasMore ? (
                <Button
                  fullWidth
                  size="small"
                  className="paty-todos-column__show-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedCols((prev) => {
                      const next = new Set(prev);
                      next.delete(col.id);
                      return next;
                    });
                  }}
                >
                  Ver menos
                </Button>
              ) : null}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
