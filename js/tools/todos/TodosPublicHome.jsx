import { getReact, getMaterialUI, UI } from "../../core/platform.ts";
import { fetchPublicTodoBoards } from "../../api/todosApi.ts";
import { PublicScrumBoard } from "./PublicScrumBoard.jsx";

const { useState, useEffect } = getReact();
const { Box, Typography, Button, Stack, Alert, CircularProgress, List, ListItemButton, ListItemText, Chip } = getMaterialUI();
const { Icon } = UI;

export function TodosPublicHome({ onNeedLogin }) {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSlug, setSelectedSlug] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const list = await fetchPublicTodoBoards("scrum");
        if (!cancelled) setBoards(list);
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : String(e);
          if (!/authorization bearer requerido/i.test(msg)) setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (selectedSlug) {
    return (
      <Box className="paty-todos-shell">
        <Box className="paty-todos-toolbar">
          <Button
            size="small"
            variant="text"
            startIcon={<Icon icon="mdi:arrow-left" size={16} />}
            onClick={() => setSelectedSlug("")}
          >
            Tableros públicos
          </Button>
        </Box>
        <PublicScrumBoard publicSlug={selectedSlug} />
      </Box>
    );
  }

  return (
    <Box className="paty-todos-shell">
      <Box className="paty-todos-toolbar">
        <Icon icon="mdi:view-column" size={22} />
        <span className="paty-todos-board-title">DevFlow — tableros públicos</span>
        <Chip size="small" label="Solo lectura" icon={<Icon icon="mdi:eye-outline" size={14} />} sx={{ ml: 1 }} />
        <Box sx={{ flex: 1 }} />
        <Button size="small" variant="outlined" onClick={() => onNeedLogin?.()}>
          Iniciar sesión para editar
        </Button>
      </Box>

      <Alert severity="info" sx={{ m: 2 }}>
        Vista pública de solo lectura. Para crear tableros o editar tareas, inicia sesión.
      </Alert>

      {error ? <Alert severity="error" sx={{ mx: 2, mb: 2 }}>{error}</Alert> : null}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : boards.length ? (
        <List className="paty-todos-public-list" sx={{ px: 2 }}>
          {boards.map((board) => (
            <ListItemButton
              key={board.id}
              onClick={() => setSelectedSlug(board.publicSlug)}
              className="paty-todos-public-list__item"
            >
              <ListItemText
                primary={board.title}
                secondary={board.description || "Tablero SCRUM público"}
              />
              <Icon icon="mdi:chevron-right" size={20} />
            </ListItemButton>
          ))}
        </List>
      ) : (
        <Stack spacing={1} alignItems="center" sx={{ p: 4, opacity: 0.85 }}>
          <Icon icon="mdi:view-column-outline" width="2.5em" height="2.5em" />
          <Typography variant="body2" color="text.secondary" align="center">
            No hay tableros públicos publicados todavía.
          </Typography>
        </Stack>
      )}
    </Box>
  );
}
