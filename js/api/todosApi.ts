/** Tableros SCRUM / tareas — gateway main-orchestrator → isa-todos. */
import { Session, Config } from "../core/platform.ts";
import { ORCH_ONLINE, isLocalMode } from "../core/patyia.ts";
import * as SessionApi from "./sessionApi.ts";

const todosHttp = window.ISAFront.createCapFetch({
  Session,
  Config,
  getApiBase: () => ORCH_ONLINE.replace(/\/$/, ""),
  localDirect: [
    {
      test: (p: string) => {
        const n = p.startsWith("/") ? p : `/${p}`;
        return n.startsWith("/todos") || n.startsWith("/api/todos");
      },
      base: "http://localhost:8780",
    },
  ],
  orchOnlineInLocal: false,
  isLocal: isLocalMode,
  handleApiError: SessionApi.handleApiError,
  clearSession: SessionApi.clearSession,
});

export const TODOS_APP_ID = "isa-patyia";

export type TodoBoard = {
  id: string;
  appId: string;
  boardType: string;
  title: string;
  description: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  active: boolean;
};

export type TodoColumn = {
  id: string;
  boardId: string;
  columnKey: string;
  title: string;
  sortOrder: number;
};

export type TodoMilestone = {
  id: string;
  taskId: string;
  title: string;
  dueDate: string | null;
  completedAt: string | null;
  sortOrder: number;
  createdAt: string;
};

export type TodoEvent = {
  id: string;
  taskId: string;
  eventType: string;
  body: string;
  author: string;
  createdAt: string;
};

export type TodoTask = {
  id: string;
  boardId: string;
  columnId: string;
  parentTaskId: string | null;
  title: string;
  descriptionDoc: string;
  sortOrder: number;
  assignedTo: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  subtasks?: TodoTask[];
  milestones?: TodoMilestone[];
  events?: TodoEvent[];
};

export type TodoBoardFull = {
  board: TodoBoard;
  columns: TodoColumn[];
  tasks: TodoTask[];
};

function qs(extra?: Record<string, string>) {
  const params = new URLSearchParams({ app: TODOS_APP_ID, ...extra });
  return `?${params.toString()}`;
}

export async function fetchTodoBoards(boardType = "scrum") {
  const data = await todosHttp.capFetch(`/todos/boards${qs({ boardType })}`, { method: "GET" });
  return (data.boards ?? []) as TodoBoard[];
}

export async function createTodoBoard(payload: { title: string; description?: string; boardType?: string }) {
  const data = await todosHttp.capFetch(`/todos/boards${qs()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ boardType: "scrum", ...payload }),
  });
  return data as TodoBoardFull & { ok: boolean };
}

export async function fetchTodoBoard(boardId: string) {
  const data = await todosHttp.capFetch(`/todos/boards/${boardId}${qs()}`, { method: "GET" });
  return data as TodoBoardFull & { ok: boolean };
}

export async function createTodoTask(
  boardId: string,
  payload: {
    columnId: string;
    title: string;
    descriptionDoc?: string;
    parentTaskId?: string | null;
    assignedTo?: string | null;
  },
) {
  const data = await todosHttp.capFetch(`/todos/boards/${boardId}/tasks${qs()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return data.task as TodoTask;
}

export async function fetchTodoTask(taskId: string) {
  const data = await todosHttp.capFetch(`/todos/tasks/${taskId}${qs()}`, { method: "GET" });
  return data.task as TodoTask;
}

export async function updateTodoTask(
  taskId: string,
  patch: {
    title?: string;
    descriptionDoc?: string;
    columnId?: string;
    assignedTo?: string | null;
    sortOrder?: number;
  },
) {
  const data = await todosHttp.capFetch(`/todos/tasks/${taskId}${qs()}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return data.task as TodoTask;
}

export async function createTodoMilestone(
  taskId: string,
  payload: { title: string; dueDate?: string | null },
) {
  const data = await todosHttp.capFetch(`/todos/tasks/${taskId}/milestones${qs()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return data.milestone as TodoMilestone;
}

export async function updateTodoMilestone(
  milestoneId: string,
  patch: { title?: string; dueDate?: string | null; completed?: boolean },
) {
  const data = await todosHttp.capFetch(`/todos/milestones/${milestoneId}${qs()}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return data.milestone as TodoMilestone;
}

export async function addTodoComment(taskId: string, body: string) {
  const data = await todosHttp.capFetch(`/todos/tasks/${taskId}/comments${qs()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });
  return data.event as TodoEvent;
}
