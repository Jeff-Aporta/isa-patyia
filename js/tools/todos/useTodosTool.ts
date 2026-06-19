import { getReact } from "../../core/platform.ts";
import { Session, toastError, toastSuccess } from "../../core/platform.ts";
import { mergePartial } from "../../core/urlState.ts";
import {
  addTodoComment,
  createTodoBoard,
  createTodoMilestone,
  createTodoTask,
  deleteTodoBoard,
  fetchTodoBoard,
  fetchTodoBoards,
  fetchTodoTask,
  updateTodoBoard,
  updateTodoMilestone,
  updateTodoTask,
  deleteTodoTask,
  deleteTodoMilestone,
  type TodoBoard,
  type TodoBoardFull,
  type TodoTask,
} from "../../api/todosApi.ts";
import {
  appendTaskToBoard,
  buildOptimisticTask,
  patchTaskInBoard,
  replaceTaskInBoard,
} from "./todosBoardState.js";
import { sortBoardsByRecent } from "./boardsHomeState.js";

const { useState, useEffect, useCallback, useRef } = getReact();

type BootTodos = {
  boardId?: string;
  publicSlug?: string;
};

export function useTodosTool({ bootTodos }: { bootTodos?: BootTodos }) {
  const [loggedIn, setLoggedIn] = useState(Session.isLoggedIn());
  const [boards, setBoards] = useState<TodoBoard[]>([]);
  const [boardPreviews, setBoardPreviews] = useState<Record<string, TodoBoardFull | null>>({});
  const [loadingPreviews, setLoadingPreviews] = useState(false);
  const [boardId, setBoardId] = useState(String(bootTodos?.boardId ?? ""));
  const [boardData, setBoardData] = useState<TodoBoardFull | null>(null);
  const [loadingBoards, setLoadingBoards] = useState(false);
  const [loadingBoard, setLoadingBoard] = useState(false);
  const [error, setError] = useState("");
  const [selectedTask, setSelectedTask] = useState<TodoTask | null>(null);
  const [taskLoading, setTaskLoading] = useState(false);
  const [newBoardOpen, setNewBoardOpen] = useState(false);
  const dragTaskId = useRef<string | null>(null);
  const boardDataRef = useRef<TodoBoardFull | null>(null);

  useEffect(() => {
    boardDataRef.current = boardData;
  }, [boardData]);

  useEffect(() => {
    function onAuth() { setLoggedIn(Session.isLoggedIn()); }
    window.addEventListener(Session.EVENT, onAuth);
    return () => window.removeEventListener(Session.EVENT, onAuth);
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    if (bootTodos?.boardId && !boardId) setBoardId(String(bootTodos.boardId));
  }, [loggedIn, bootTodos?.boardId, boardId]);

  const loadBoardPreviews = useCallback(async (list: TodoBoard[]) => {
    if (!list.length) {
      setBoardPreviews({});
      return;
    }
    setLoadingPreviews(true);
    try {
      const entries = await Promise.all(
        list.map(async (board) => {
          try {
            const data = await fetchTodoBoard(board.id);
            return [
              board.id,
              { board: data.board, columns: data.columns, tasks: data.tasks },
            ] as const;
          } catch {
            return [board.id, null] as const;
          }
        }),
      );
      setBoardPreviews(Object.fromEntries(entries));
    } finally {
      setLoadingPreviews(false);
    }
  }, []);

  const loadBoards = useCallback(async () => {
    if (!Session.isLoggedIn()) return;
    setLoadingBoards(true);
    setError("");
    try {
      const list = sortBoardsByRecent(await fetchTodoBoards("scrum"));
      setBoards(list);
      void loadBoardPreviews(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingBoards(false);
    }
  }, [loadBoardPreviews]);

  const loadBoard = useCallback(async (id: string, opts?: { silent?: boolean }) => {
    if (!id || !Session.isLoggedIn()) return;
    if (!opts?.silent) setLoadingBoard(true);
    if (!opts?.silent) setError("");
    try {
      const data = await fetchTodoBoard(id);
      setBoardData({ board: data.board, columns: data.columns, tasks: data.tasks });
    } catch (e) {
      if (!opts?.silent) {
        setError(e instanceof Error ? e.message : String(e));
        setBoardData(null);
      }
    } finally {
      if (!opts?.silent) setLoadingBoard(false);
    }
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    loadBoards();
  }, [loggedIn, loadBoards]);

  useEffect(() => {
    if (!loggedIn || !boardId) return;
    loadBoard(boardId);
  }, [loggedIn, boardId, loadBoard]);

  function selectBoard(id: string) {
    setBoardId(id);
    mergePartial({ todos: { boardId: id } });
  }

  function goHome() {
    setBoardId("");
    setBoardData(null);
    setSelectedTask(null);
    mergePartial({ todos: { boardId: "" } });
  }

  async function onCreateBoard(payload: {
    title: string;
    description?: string;
    visibility?: "private" | "public";
    members?: Array<{ username: string; boardRole?: "editor" | "readonly" }>;
  }) {
    const data = await createTodoBoard({
      title: payload.title,
      description: payload.description || undefined,
      visibility: payload.visibility,
      members: payload.members,
    });
    await loadBoards();
    if (data.board?.id) selectBoard(data.board.id);
    toastSuccess("Tablero creado");
    setNewBoardOpen(false);
  }

  async function onUpdateBoard(
    boardIdToUpdate: string,
    patch: { title?: string; description?: string | null; visibility?: "private" | "public" },
  ) {
    const data = await updateTodoBoard(boardIdToUpdate, patch);
    setBoards((prev) => sortBoardsByRecent(
      prev.map((b) => (b.id === boardIdToUpdate ? { ...b, ...data.board } : b)),
    ));
    setBoardPreviews((prev) => {
      if (!prev[boardIdToUpdate]) return prev;
      return {
        ...prev,
        [boardIdToUpdate]: {
          board: data.board,
          columns: data.columns,
          tasks: data.tasks,
        },
      };
    });
    if (boardId === boardIdToUpdate) {
      setBoardData({ board: data.board, columns: data.columns, tasks: data.tasks });
    }
    toastSuccess("Tablero actualizado");
  }

  async function onDeleteBoard(boardIdToDelete: string) {
    await deleteTodoBoard(boardIdToDelete);
    setBoards((prev) => prev.filter((b) => b.id !== boardIdToDelete));
    setBoardPreviews((prev) => {
      const next = { ...prev };
      delete next[boardIdToDelete];
      return next;
    });
    if (boardId === boardIdToDelete) goHome();
    toastSuccess("Tablero eliminado");
  }

  async function onQuickAddTask(columnId: string, title: string) {
    if (!boardId || !title.trim()) return;
    const trimmed = title.trim();
    const snapshot = boardDataRef.current;
    const optimistic = buildOptimisticTask({
      boardId,
      columnId,
      title: trimmed,
      createdBy: Session.username() || "unknown",
    });
    setBoardData((prev) => appendTaskToBoard(prev, optimistic));
    try {
      const created = await createTodoTask(boardId, { columnId, title: trimmed });
      setBoardData((prev) => replaceTaskInBoard(prev, optimistic.id, created));
    } catch (e) {
      setBoardData(snapshot);
      toastError(e instanceof Error ? e.message : String(e));
      throw e;
    }
  }

  async function openTask(taskId: string) {
    const cached = boardDataRef.current?.tasks.find((t) => t.id === taskId);
    if (cached) setSelectedTask(cached);
    setTaskLoading(!cached);
    try {
      const task = await fetchTodoTask(taskId);
      setSelectedTask(task);
    } catch (e) {
      if (!cached) setSelectedTask(null);
      toastError(e instanceof Error ? e.message : String(e));
    } finally {
      setTaskLoading(false);
    }
  }

  async function saveTask(patch: {
    title?: string;
    descriptionDoc?: string;
    columnId?: string;
    assignedTo?: string | null;
  }) {
    if (!selectedTask) return;
    const taskId = selectedTask.id;
    const snapshot = boardDataRef.current;
    const prevTask = selectedTask;
    const nextTask = { ...selectedTask, ...patch };
    setSelectedTask(nextTask);
    setBoardData((prev) => patchTaskInBoard(prev, taskId, patch));
    try {
      const updated = await updateTodoTask(taskId, patch);
      setSelectedTask(updated);
      setBoardData((prev) => replaceTaskInBoard(prev, taskId, updated));
    } catch (e) {
      setSelectedTask(prevTask);
      setBoardData(snapshot);
      toastError(e instanceof Error ? e.message : String(e));
      throw e;
    }
    toastSuccess("Tarea actualizada");
  }

  async function saveSubtask(
    subtaskId: string,
    patch: { title?: string; descriptionDoc?: string },
  ) {
    if (!selectedTask) return;
    await updateTodoTask(subtaskId, patch);
    const refreshed = await fetchTodoTask(selectedTask.id);
    setSelectedTask(refreshed);
    toastSuccess("Subtarea actualizada");
  }

  async function deleteSubtask(subtaskId: string) {
    if (!selectedTask) return;
    await deleteTodoTask(subtaskId);
    const refreshed = await fetchTodoTask(selectedTask.id);
    setSelectedTask(refreshed);
    toastSuccess("Subtarea eliminada");
  }

  async function saveMilestone(
    milestoneId: string,
    patch: { title?: string; dueDate?: string | null; completed?: boolean },
  ) {
    if (!selectedTask) return;
    await updateTodoMilestone(milestoneId, patch);
    const refreshed = await fetchTodoTask(selectedTask.id);
    setSelectedTask(refreshed);
    toastSuccess("Hito actualizado");
  }

  async function deleteMilestone(milestoneId: string) {
    if (!selectedTask) return;
    await deleteTodoMilestone(milestoneId);
    const refreshed = await fetchTodoTask(selectedTask.id);
    setSelectedTask(refreshed);
    toastSuccess("Hito eliminado");
  }

  async function addSubtask(title: string) {
    if (!selectedTask || !boardId || !title.trim()) return;
    const trimmed = title.trim();
    try {
      await createTodoTask(boardId, {
        columnId: selectedTask.columnId,
        title: trimmed,
        parentTaskId: selectedTask.id,
      });
      const refreshed = await fetchTodoTask(selectedTask.id);
      setSelectedTask(refreshed);
    } catch (e) {
      toastError(e instanceof Error ? e.message : String(e));
      throw e;
    }
    toastSuccess("Subtarea creada");
  }

  async function addMilestone(title: string, dueDate: string | null) {
    if (!selectedTask || !title.trim()) return;
    try {
      await createTodoMilestone(selectedTask.id, { title: title.trim(), dueDate });
      const refreshed = await fetchTodoTask(selectedTask.id);
      setSelectedTask(refreshed);
      toastSuccess("Hito añadido");
    } catch (e) {
      toastError(e instanceof Error ? e.message : String(e));
      throw e;
    }
  }

  async function toggleMilestone(milestoneId: string, completed: boolean) {
    if (!selectedTask) return;
    const snapshot = selectedTask;
    const nextMilestones = (selectedTask.milestones ?? []).map((m) =>
      m.id === milestoneId
        ? { ...m, completedAt: completed ? new Date().toISOString() : null }
        : m,
    );
    setSelectedTask({ ...selectedTask, milestones: nextMilestones });
    try {
      await updateTodoMilestone(milestoneId, { completed });
      const refreshed = await fetchTodoTask(selectedTask.id);
      setSelectedTask(refreshed);
    } catch (e) {
      setSelectedTask(snapshot);
      toastError(e instanceof Error ? e.message : String(e));
    }
  }

  async function postComment(body: string) {
    if (!selectedTask || !body.trim()) return;
    try {
      await addTodoComment(selectedTask.id, body.trim());
      const refreshed = await fetchTodoTask(selectedTask.id);
      setSelectedTask(refreshed);
      toastSuccess("Comentario registrado");
    } catch (e) {
      toastError(e instanceof Error ? e.message : String(e));
      throw e;
    }
  }

  async function moveTask(taskId: string, columnId: string) {
    if (!boardId) return;
    const snapshot = boardDataRef.current;
    const task = snapshot?.tasks.find((t) => t.id === taskId);
    if (!task || task.columnId === columnId) return;

    const doneCol = snapshot?.columns.find((c) => c.columnKey === "done");
    const completedAt =
      doneCol && columnId === doneCol.id ? new Date().toISOString() : null;

    setBoardData((prev) => patchTaskInBoard(prev, taskId, { columnId, completedAt }));
    try {
      const updated = await updateTodoTask(taskId, { columnId });
      setBoardData((prev) => replaceTaskInBoard(prev, taskId, updated));
    } catch (e) {
      setBoardData(snapshot);
      toastError(e instanceof Error ? e.message : String(e));
    }
  }

  function onDragStart(taskId: string) {
    dragTaskId.current = taskId;
  }

  function onDropColumn(columnId: string) {
    const taskId = dragTaskId.current;
    dragTaskId.current = null;
    if (!taskId) return;
    void moveTask(taskId, columnId);
  }

  const canEdit =
    !!boardData?.board &&
    (boardData.board.canEdit ?? (boardData.board.isAdmin || boardData.board.myRole === "editor"));

  const inBoardView = !!boardId;

  return {
    loggedIn,
    boards,
    boardPreviews,
    loadingPreviews,
    boardId,
    inBoardView,
    boardData,
    canEdit,
    loadingBoards,
    loadingBoard,
    error,
    selectedTask,
    taskLoading,
    newBoardOpen,
    setNewBoardOpen,
    selectBoard,
    goHome,
    reloadBoards: loadBoards,
    onCreateBoard,
    onUpdateBoard,
    onDeleteBoard,
    onQuickAddTask,
    openTask,
    closeTask: () => setSelectedTask(null),
    saveTask,
    saveSubtask,
    deleteSubtask,
    saveMilestone,
    deleteMilestone,
    addSubtask,
    addMilestone,
    toggleMilestone,
    postComment,
    onDragStart,
    onDropColumn,
    reload: () => boardId && loadBoard(boardId),
  };
}
