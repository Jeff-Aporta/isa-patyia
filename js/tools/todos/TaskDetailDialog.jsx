import { getReact, getMaterialUI, UI } from "../../core/platform.ts";
import { mdToHtml } from "../../ui/shared.jsx";

const { useState, useEffect, useRef } = getReact();
const {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, Typography,
  Tabs, Tab, Box, Accordion, AccordionSummary, AccordionDetails, Checkbox, FormControlLabel,
  CircularProgress, Chip, Divider,
} = getMaterialUI();
const { Icon } = UI;

function formatDt(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return String(iso);
  }
}

export function TaskDetailDialog({
  open,
  task,
  loading,
  onClose,
  onSave,
  onAddSubtask,
  onAddMilestone,
  onToggleMilestone,
  onComment,
}) {
  const [tab, setTab] = useState(0);
  const [title, setTitle] = useState("");
  const [doc, setDoc] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [msTitle, setMsTitle] = useState("");
  const [msDate, setMsDate] = useState("");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  const prevId = useRef(null);
  useEffect(() => {
    if (!task || task.id === prevId.current) return;
    prevId.current = task.id;
    setTitle(task.title);
    setDoc(task.descriptionDoc || "");
    setAssignedTo(task.assignedTo || "");
    setTab(0);
  }, [task]);

  async function run(fn) {
    setBusy(true);
    try { await fn(); } finally { setBusy(false); }
  }

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth className="paty-todos-task-dialog">
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Icon icon="mdi:card-text-outline" size={22} />
        <span style={{ flex: 1 }}>{loading ? "Cargando…" : (task?.title || "Tarea")}</span>
        {loading ? <CircularProgress size={20} /> : null}
      </DialogTitle>
      <DialogContent dividers>
        {task ? (
          <>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
              <Tab label="Detalle" />
              <Tab label={`Subtareas (${task.subtasks?.length ?? 0})`} />
              <Tab label={`Hitos (${task.milestones?.length ?? 0})`} />
              <Tab label="Trazabilidad" />
            </Tabs>

            {tab === 0 ? (
              <Stack spacing={2}>
                <TextField label="Título" fullWidth size="small" value={title} onChange={(e) => setTitle(e.target.value)} />
                <TextField
                  label="Asignado a (usuario)"
                  fullWidth
                  size="small"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="USUARIO_BD_AUTH"
                />
                <TextField
                  label="Documentación (Markdown)"
                  fullWidth
                  multiline
                  minRows={6}
                  value={doc}
                  onChange={(e) => setDoc(e.target.value)}
                />
                {doc.trim() ? (
                  <Box sx={{ p: 1.5, borderRadius: 1, border: 1, borderColor: "divider", typography: "body2" }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>Vista previa</Typography>
                    <div dangerouslySetInnerHTML={{ __html: mdToHtml(doc) }} />
                  </Box>
                ) : null}
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip size="small" label={`Creada por ${task.createdBy}`} />
                  {task.completedAt ? <Chip size="small" color="success" label="Finalizada" /> : null}
                </Stack>
              </Stack>
            ) : null}

            {tab === 1 ? (
              <Stack spacing={1}>
                {(task.subtasks ?? []).map((st) => (
                  <Accordion key={st.id} className="paty-todos-subtask-acc" disableGutters>
                    <AccordionSummary expandIcon={<Icon icon="mdi:chevron-down" size={18} />}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{st.title}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                        {st.descriptionDoc?.trim() ? null : "Sin documentación"}
                      </Typography>
                      {st.descriptionDoc?.trim() ? (
                        <div dangerouslySetInnerHTML={{ __html: mdToHtml(st.descriptionDoc) }} />
                      ) : null}
                    </AccordionDetails>
                  </Accordion>
                ))}
                <Divider sx={{ my: 1 }} />
                <Stack direction="row" spacing={1}>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Nueva subtarea…"
                    value={subtaskTitle}
                    onChange={(e) => setSubtaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && subtaskTitle.trim()) {
                        run(async () => {
                          await onAddSubtask(subtaskTitle);
                          setSubtaskTitle("");
                        });
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    disabled={busy || !subtaskTitle.trim()}
                    onClick={() => run(async () => {
                      await onAddSubtask(subtaskTitle);
                      setSubtaskTitle("");
                    })}
                  >
                    Añadir
                  </Button>
                </Stack>
              </Stack>
            ) : null}

            {tab === 2 ? (
              <Stack spacing={1.5}>
                {(task.milestones ?? []).map((ms) => (
                  <Stack key={ms.id} direction="row" alignItems="center" spacing={1}>
                    <FormControlLabel
                      control={(
                        <Checkbox
                          checked={!!ms.completedAt}
                          onChange={(e) => onToggleMilestone(ms.id, e.target.checked)}
                        />
                      )}
                      label=""
                      sx={{ mr: 0 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, textDecoration: ms.completedAt ? "line-through" : "none" }}>
                        {ms.title}
                      </Typography>
                      {ms.dueDate ? (
                        <Typography variant="caption" color="text.secondary">Vence: {ms.dueDate}</Typography>
                      ) : null}
                    </Box>
                  </Stack>
                ))}
                <Divider sx={{ my: 1 }} />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <TextField size="small" fullWidth label="Hito" value={msTitle} onChange={(e) => setMsTitle(e.target.value)} />
                  <TextField
                    size="small"
                    type="date"
                    label="Fecha"
                    InputLabelProps={{ shrink: true }}
                    value={msDate}
                    onChange={(e) => setMsDate(e.target.value)}
                    sx={{ minWidth: 160 }}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    disabled={busy || !msTitle.trim()}
                    onClick={() => run(async () => {
                      await onAddMilestone(msTitle, msDate || null);
                      setMsTitle("");
                      setMsDate("");
                    })}
                  >
                    Añadir
                  </Button>
                </Stack>
              </Stack>
            ) : null}

            {tab === 3 ? (
              <Stack spacing={0}>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <TextField
                    size="small"
                    fullWidth
                    multiline
                    minRows={2}
                    placeholder="Comentario / nota de trazabilidad…"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={busy || !comment.trim()}
                    sx={{ alignSelf: "flex-end" }}
                    onClick={() => run(async () => {
                      await onComment(comment);
                      setComment("");
                    })}
                  >
                    Registrar
                  </Button>
                </Stack>
                {(task.events ?? []).map((ev) => (
                  <Box key={ev.id} className="paty-todos-event">
                    <div className="paty-todos-event__meta">
                      <strong>{ev.author}</strong> · {ev.eventType} · {formatDt(ev.createdAt)}
                    </div>
                    <div>{ev.body || "—"}</div>
                  </Box>
                ))}
                {!(task.events ?? []).length ? (
                  <Typography variant="body2" color="text.secondary">Sin eventos aún.</Typography>
                ) : null}
              </Stack>
            ) : null}
          </>
        ) : (
          <Typography color="text.secondary">Selecciona una tarea.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
        {tab === 0 && task ? (
          <Button
            variant="contained"
            disabled={busy || !title.trim()}
            onClick={() => run(async () => {
              await onSave({
                title: title.trim(),
                descriptionDoc: doc,
                assignedTo: assignedTo.trim() || null,
              });
            })}
          >
            Guardar
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
}
