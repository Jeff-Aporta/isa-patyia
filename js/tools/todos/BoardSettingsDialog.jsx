import { getReact, getMaterialUI, UI } from "../../core/platform.ts";

const { useState, useEffect } = getReact();
const {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField,
  FormControl, InputLabel, Select, MenuItem, Typography,
} = getMaterialUI();
const { Icon } = UI;

export function BoardSettingsDialog({ open, onClose, board, readOnly, saving, onSave }) {
  const [title, setTitle] = useState(board?.title ?? "");
  const [description, setDescription] = useState(board?.description ?? "");
  const [visibility, setVisibility] = useState(board?.visibility ?? "private");

  useEffect(() => {
    if (!open) return;
    setTitle(board?.title ?? "");
    setDescription(board?.description ?? "");
    setVisibility(board?.visibility ?? "private");
  }, [open, board?.title, board?.description, board?.visibility]);

  if (!board) return null;

  async function saveField(patch) {
    if (readOnly) return;
    await onSave(patch);
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth className="paty-todos-board-settings-dialog">
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Icon icon="mdi:cog-outline" size={22} />
        Detalles del tablero
      </DialogTitle>
      <DialogContent>
        {readOnly ? (
          <Stack spacing={1.5} sx={{ pt: 0.5 }}>
            <Typography variant="body2">
              <strong>Título:</strong> {board.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Descripción:</strong>{" "}
              {board.description?.trim() ? board.description : "Sin descripción"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Visibilidad:</strong>{" "}
              {board.visibility === "public" ? "Público" : "Privado"}
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={1.5} className="paty-todos-board-row__edit" sx={{ pt: 0.5 }}>
            <TextField
              label="Título"
              size="small"
              fullWidth
              value={title}
              disabled={saving}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => {
                const trimmed = title.trim();
                if (trimmed && trimmed !== board.title) void saveField({ title: trimmed });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
            />
            <TextField
              label="Descripción"
              size="small"
              fullWidth
              multiline
              minRows={2}
              value={description}
              disabled={saving}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => {
                const next = description.trim();
                const prev = (board.description ?? "").trim();
                if (next !== prev) void saveField({ description: next || null });
              }}
            />
            <FormControl size="small" fullWidth disabled={saving}>
              <InputLabel id="paty-board-settings-vis">Visibilidad</InputLabel>
              <Select
                labelId="paty-board-settings-vis"
                label="Visibilidad"
                value={visibility}
                onChange={(e) => {
                  const next = e.target.value;
                  setVisibility(next);
                  if (next !== board.visibility) void saveField({ visibility: next });
                }}
              >
                <MenuItem value="private">Privado</MenuItem>
                <MenuItem value="public">Público</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
