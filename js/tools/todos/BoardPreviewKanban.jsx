import { getReact, getMaterialUI, UI } from "../../core/platform.ts";

const { useMemo } = getReact();
const { Box, Paper, Typography, Chip } = getMaterialUI();
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

function PreviewTaskCard({ task }) {
  const subCount = task.subtasks?.length ?? 0;
  const msCount = task.milestones?.length ?? 0;
  const openMs = (task.milestones ?? []).filter((m) => !m.completedAt).length;

  return (
    <Paper className="paty-todos-card" elevation={0}>
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
}

export function BoardPreviewKanban({ boardData }) {
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

  if (!boardData) return null;

  const { columns } = boardData;

  return (
    <Box className="paty-todos-kanban paty-todos-kanban--preview">
      {columns.map((col) => {
        const colTasks = tasksByColumn.get(col.id) ?? [];
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
            <Box className="paty-todos-column__list">
              {colTasks.map((task) => (
                <PreviewTaskCard key={task.id} task={task} />
              ))}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
