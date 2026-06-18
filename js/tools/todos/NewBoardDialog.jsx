import { getReact, getMaterialUI, UI } from "../../core/platform.ts";

const { useState } = getReact();
const { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack } = getMaterialUI();
const { Icon } = UI;

export function NewBoardDialog({ open, onClose, onCreate, busy }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  function reset() {
    setTitle("");
    setDescription("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Icon icon="mdi:view-column" size={22} />
        Nuevo tablero SCRUM
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            autoFocus
            label="Título"
            fullWidth
            size="small"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            label="Descripción"
            fullWidth
            size="small"
            multiline
            minRows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button
          variant="contained"
          disabled={busy || !title.trim()}
          onClick={async () => {
            await onCreate(title.trim(), description.trim());
            reset();
          }}
        >
          Crear
        </Button>
      </DialogActions>
    </Dialog>
  );
}
