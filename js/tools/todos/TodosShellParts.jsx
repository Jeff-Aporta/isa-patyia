import { getMaterialUI, UI } from "../../core/platform.ts";

const { Box, Typography, Button, Alert, Stack, Select, MenuItem, FormControl, InputLabel, CircularProgress } = getMaterialUI();
const { Icon } = UI;

export function TodosLoggedOutShell({ onNeedLogin }) {
  return (
    <Box className="paty-todos-shell">
      <Box className="paty-todos-gate">
        <Stack spacing={2} alignItems="center" sx={{ maxWidth: 420, p: 2 }}>
          <Icon icon="mdi:view-column" width="2.5em" height="2.5em" style={{ opacity: 0.7 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Scrum</Typography>
          <Alert severity="info" sx={{ width: "100%" }}>
            Inicia sesión para acceder al tablero Scrum.
          </Alert>
          <Button variant="contained" onClick={() => onNeedLogin?.()}>Iniciar sesión</Button>
        </Stack>
      </Box>
    </Box>
  );
}

export function TodosToolbar({
  boards,
  boardId,
  boardTitle,
  loadingBoards,
  onSelectBoard,
  onNewBoard,
  onRefresh,
  loadingBoard,
}) {
  return (
    <Box className="paty-todos-toolbar">
      <Icon icon="mdi:view-column" size={22} />
      <span className="paty-todos-board-title">{boardTitle || "Tablero SCRUM"}</span>
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel id="paty-todos-board-label">Tablero</InputLabel>
        <Select
          labelId="paty-todos-board-label"
          label="Tablero"
          value={boardId || ""}
          onChange={(e) => onSelectBoard(e.target.value)}
          disabled={loadingBoards || !boards.length}
        >
          {boards.map((b) => (
            <MenuItem key={b.id} value={b.id}>{b.title}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button size="small" variant="outlined" startIcon={<Icon icon="mdi:plus" size={16} />} onClick={onNewBoard}>
        Nuevo
      </Button>
      <Button
        size="small"
        variant="text"
        onClick={onRefresh}
        disabled={loadingBoard || !boardId}
        startIcon={loadingBoard ? <CircularProgress size={14} /> : <Icon icon="mdi:refresh" size={16} />}
      >
        Actualizar
      </Button>
    </Box>
  );
}
