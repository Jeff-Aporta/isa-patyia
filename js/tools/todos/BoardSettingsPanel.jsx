import { getReact, getMaterialUI, UI } from "../../core/platform.ts";

const { useState, useEffect } = getReact();
const {
  Box, Stack, TextField, FormControl, InputLabel, Select, MenuItem,
  Accordion, AccordionSummary, AccordionDetails, Typography,
} = getMaterialUI();
const { Icon } = UI;

export function BoardSettingsPanel({ board, readOnly, saving, onSave }) {
  const [title, setTitle] = useState(board?.title ?? "");
  const [description, setDescription] = useState(board?.description ?? "");
  const [visibility, setVisibility] = useState(board?.visibility ?? "private");

  useEffect(() => {
    setTitle(board?.title ?? "");
    setDescription(board?.description ?? "");
    setVisibility(board?.visibility ?? "private");
  }, [board?.title, board?.description, board?.visibility]);

  if (!board) return null;

  async function saveField(patch) {
    if (readOnly) return;
    await onSave(patch);
  }

  return (
    <Box className="paty-todos-board-settings">
      <Accordion className="paty-todos-board-settings__acc" disableGutters elevation={0} defaultExpanded={false}>
        <AccordionSummary expandIcon={<Icon icon="mdi:chevron-down" size={18} />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Icon icon="mdi:cog-outline" size={18} />
            <Typography variant="body2" fontWeight={600}>Detalles del tablero</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          {readOnly ? (
            <Stack spacing={1}>
              {board.description ? (
                <Typography variant="body2" color="text.secondary">{board.description}</Typography>
              ) : (
                <Typography variant="body2" color="text.secondary" fontStyle="italic">
                  Sin descripción
                </Typography>
              )}
            </Stack>
          ) : (
            <Stack spacing={1.5} className="paty-todos-board-row__edit">
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
                <InputLabel id="paty-board-open-vis">Visibilidad</InputLabel>
                <Select
                  labelId="paty-board-open-vis"
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
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
