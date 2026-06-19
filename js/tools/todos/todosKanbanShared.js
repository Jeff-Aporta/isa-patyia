/** Utilidades compartidas del tablero Kanban (lista + preview). */

export const MAX_COLUMN_TASKS = 4;

export function sortTasksByRecent(tasks) {
  return [...tasks].sort((a, b) => {
    const ta = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
    const tb = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
    return tb - ta;
  });
}

export function formatTaskDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("es-CO", { dateStyle: "short" });
  } catch {
    return String(iso);
  }
}

export function groupTasksByColumn(boardData) {
  if (!boardData) return new Map();
  const map = new Map();
  for (const col of boardData.columns) map.set(col.id, []);
  for (const task of boardData.tasks) {
    const list = map.get(task.columnId);
    if (list) list.push(task);
  }
  for (const [colId, list] of map) {
    map.set(colId, sortTasksByRecent(list));
  }
  return map;
}

export function taskModDate(task) {
  return task.updatedAt ?? task.createdAt ?? null;
}
