import { getReact } from "../../core/platform.ts";
import { Session, toastError, toastSuccess } from "../../core/platform.ts";
import { mergePartial } from "../../core/urlState.ts";
import {
  addTodoComment,
  createTodoBoard,
  createTodoMilestone,
  createTodoTask,
  fetchTodoBoard,
  fetchTodoBoards,
  fetchTodoTask,
  updateTodoMilestone,
  updateTodoTask,
  type TodoBoard,
  type TodoBoardFull,
  type TodoTask,
} from "../../api/todosApi.ts";

const { useState, useEffect, useCallback, useRef } = getReact();

type BootTodos = {
  boardId?: string;
};

export function useTodosTool({ bootTodos }: { bootTodos?: BootTodos }) {
  const [loggedIn, setLoggedIn] = useState(Session.isLoggedIn());
  const [boards, setBoards] = useState<TodoBoard[]>([]);
  const [boardId, setBoardId] = useState(String(bootTodos?.boardId ?? ""));
  const [boardData, setBoardData] = useState<TodoBoardFull | null>(null);
  const [loadingBoards, setLoadingBoards] = useState(false);
  const [loadingBoard, setLoadingBoard] = useState(false);
  const [error, setError] = useState("");
  const [selectedTask, setSelectedTask] = useState<TodoTask | null>(null);
  const [taskLoading, setTaskLoading] = useState(false);
  const [newBoardOpen, setNewBoardOpen] = useState(false);
  const dragTaskId = useRef<string | null>(null);

  useEffect(() => {
    function onAuth() { setLoggedIn(Session.isLoggedIn()); }
    window.addEventListener(Session.EVENT, onAuth);
    return () => window.removeEventListener(Session.EVENT, onAuth);
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    if (bootTodos?.boardId && !boardId) setBoardId(String(bootTodos.boardId));
  }, [loggedIn, bootTodos?.boardId, boardId]);

  const loadBoards = useCallback(async () => {
    if (!Session.isLoggedIn()) return;
    setLoadingBoards(true);
    setError("");
    try {
      const list = await fetchTodoBoards("scrum");
      setBoards(list);
      if (!boardId && list.length) {
        setBoardId(list[0].id);
        mergePartial({ todos: { boardId: list[0].id } });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingBoards(false);
    }
  }, [boardId]);

  const loadBoard = useCallback(async (id: string) => {
    if (!id || !Session.isLoggedIn()) return;
    setLoadingBoard(true);
    setError("");
    try {
      const data = await fetchTodoBoard(id);
      setBoardData({ board: data.board, columns: data.columns, tasks: data.tasks });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBoardData(null);
    } finally {
      setLoadingBoard(false);
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

  async function onCreateBoard(title: string, description: string) {
    const data = await createTodoBoard({ title, description: description || undefined });
    await loadBoards();
    if (data.board?.id) selectBoard(data.board.id);
    toastSuccess("Tablero creado");
    setNewBoardOpen(false);
  }

  async function onQuickAddTask(columnId: string, title: string) {
    if (!boardId || !title.trim()) return;
    await createTodoTask(boardId, { columnId, title: title.trim() });
    await loadBoard(boardId);
    toastSuccess("Tarea creada");
  }

  async function openTask(taskId: string) {
    setTaskLoading(true);
    try {
      const task = await fetchTodoTask(taskId);
      setSelectedTask(task);
    } catch (e) {
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
    const updated = await updateTodoTask(selectedTask.id, patch);
    setSelectedTask(updated);
    if (boardId) await loadBoard(boardId);
    toastSuccess("Tarea actualizada");
  }

  async function addSubtask(title: string) {
    if (!selectedTask || !boardId || !title.trim()) return;
    await createTodoTask(boardId, {
      columnId: selectedTask.columnId,
      title: title.trim(),
      parentTaskId: selectedTask.id,
    });
    const refreshed = await fetchTodoTask(selectedTask.id);
    setSelectedTask(refreshed);
    await loadBoard(boardId);
    toastSuccess("Subtarea creada");
  }

  async function addMilestone(title: string, dueDate: string | null) {
    if (!selectedTask || !title.trim()) return;
    await createTodoMilestone(selectedTask.id, { title: title.trim(), dueDate });
    const refreshed = await fetchTodoTask(selectedTask.id);
    setSelectedTask(refreshed);
    toastSuccess("Hito añadido");
  }

  async function toggleMilestone(milestoneId: string, completed: boolean) {
    await updateTodoMilestone(milestoneId, { completed });
    if (selectedTask) {
      const refreshed = await fetchTodoTask(selectedTask.id);
      setSelectedTask(refreshed);
    }
  }

  async function postComment(body: string) {
    if (!selectedTask || !body.trim()) return;
    await addTodoComment(selectedTask.id, body.trim());
    const refreshed = await fetchTodoTask(selectedTask.id);
    setSelectedTask(refreshed);
    toastSuccess("Comentario registrado");
  }

  async function moveTask(taskId: string, columnId: string) {
    if (!boardId) return;
    await updateTodoTask(taskId, { columnId });
    await loadBoard(boardId);
  }

  function onDragStart(taskId: string) {
    dragTaskId.current = taskId;
  }

  async function onDropColumn(columnId: string) {
    const taskId = dragTaskId.current;
    dragTaskId.current = null;
    if (!taskId) return;
    const task = boardData?.tasks.find((t) => t.id === taskId);
    if (!task || task.columnId === columnId) return;
    await moveTask(taskId, columnId);
  }

  return {
    loggedIn,
    boards,
    boardId,
    boardData,
    loadingBoards,
    loadingBoard,
    error,
    selectedTask,
    taskLoading,
    newBoardOpen,
    setNewBoardOpen,
    selectBoard,
    onCreateBoard,
    onQuickAddTask,
    openTask,
    closeTask: () => setSelectedTask(null),
    saveTask,
    addSubtask,
    addMilestone,
    toggleMilestone,
    postComment,
    onDragStart,
    onDropColumn,
    reload: () => boardId && loadBoard(boardId),
  };
}
