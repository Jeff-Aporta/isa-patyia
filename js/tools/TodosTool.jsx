import { getMaterialUI, toastError } from "../core/platform.ts";
import { useTodosTool } from "./todos/useTodosTool.ts";
import { TodosKanban } from "./todos/TodosKanban.jsx";
import { TaskDetailDialog } from "./todos/TaskDetailDialog.jsx";
import { NewBoardDialog } from "./todos/NewBoardDialog.jsx";
import { TodosLoggedOutShell, TodosToolbar } from "./todos/TodosShellParts.jsx";

const { Box, Alert, Typography, Button } = getMaterialUI();

export function TodosTool({ bootTodos, onNeedLogin }) {
  const todos = useTodosTool({ bootTodos });

  if (!todos.loggedIn) {
    return <TodosLoggedOutShell onNeedLogin={onNeedLogin} />;
  }

  const boardTitle = todos.boardData?.board?.title ?? "";

  return (
    <Box className="paty-todos-shell">
      <TodosToolbar
        boards={todos.boards}
        boardId={todos.boardId}
        boardTitle={boardTitle}
        loadingBoards={todos.loadingBoards}
        loadingBoard={todos.loadingBoard}
        onSelectBoard={todos.selectBoard}
        onNewBoard={() => todos.setNewBoardOpen(true)}
        onRefresh={() => todos.reload()}
      />

      {todos.error ? (
        <Alert severity="error" sx={{ m: 2 }} onClose={() => {}}>{todos.error}</Alert>
      ) : null}

      {!todos.loadingBoards && !todos.boards.length ? (
        <Box className="paty-todos-gate">
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            No hay tableros SCRUM. Crea el primero para empezar.
          </Typography>
          <Button variant="contained" onClick={() => todos.setNewBoardOpen(true)}>Crear tablero</Button>
        </Box>
      ) : (
        <TodosKanban
          boardData={todos.boardData}
          onOpenTask={todos.openTask}
          onQuickAdd={async (colId, title) => {
            try { await todos.onQuickAddTask(colId, title); }
            catch (e) { toastError(e instanceof Error ? e.message : String(e)); }
          }}
          onDragStart={todos.onDragStart}
          onDropColumn={async (colId) => {
            try { await todos.onDropColumn(colId); }
            catch (e) { toastError(e instanceof Error ? e.message : String(e)); }
          }}
        />
      )}

      <NewBoardDialog
        open={todos.newBoardOpen}
        onClose={() => todos.setNewBoardOpen(false)}
        busy={false}
        onCreate={async (title, description) => {
          try { await todos.onCreateBoard(title, description); }
          catch (e) { toastError(e instanceof Error ? e.message : String(e)); }
        }}
      />

      <TaskDetailDialog
        open={!!todos.selectedTask || todos.taskLoading}
        task={todos.selectedTask}
        loading={todos.taskLoading}
        onClose={todos.closeTask}
        onSave={async (patch) => {
          try { await todos.saveTask(patch); }
          catch (e) { toastError(e instanceof Error ? e.message : String(e)); }
        }}
        onAddSubtask={async (title) => {
          try { await todos.addSubtask(title); }
          catch (e) { toastError(e instanceof Error ? e.message : String(e)); }
        }}
        onAddMilestone={async (title, dueDate) => {
          try { await todos.addMilestone(title, dueDate); }
          catch (e) { toastError(e instanceof Error ? e.message : String(e)); }
        }}
        onToggleMilestone={async (id, completed) => {
          try { await todos.toggleMilestone(id, completed); }
          catch (e) { toastError(e instanceof Error ? e.message : String(e)); }
        }}
        onComment={async (body) => {
          try { await todos.postComment(body); }
          catch (e) { toastError(e instanceof Error ? e.message : String(e)); }
        }}
      />
    </Box>
  );
}
