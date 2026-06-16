import { getReact, getMaterialUI } from "../core/runtime.ts";
import { mdToHtml } from "./markdown.ts";
import { bodyPreviewHtml, bodyToEditorHtml, editorHtmlToBody, varChipHtml } from "./promptMdEditorHtml.ts";
import {
  deletePromptVariable,
  extractPromptVariables,
  isValidVarName,
  renamePromptVariable,
} from "../core/promptVariables.ts";
import { ButtonIconify } from "./iconify.jsx";
import { requestConfirm } from "./notifications.jsx";

const { useState, useEffect, useRef, useCallback, useMemo } = getReact();
const {
  Box, Stack, Typography, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Menu, MenuItem, TextField, Alert, Divider, Chip,
} = getMaterialUI();

const MAX_UNDO = 80;

function useEditorUndo(initial) {
  const [value, setValue] = useState(initial);
  const [hist, setHist] = useState({ past: 0, future: 0 });
  const pastRef = useRef([]);
  const futureRef = useRef([]);
  const skipSync = useRef(false);

  const syncHist = useCallback(() => {
    setHist({ past: pastRef.current.length, future: futureRef.current.length });
  }, []);

  useEffect(() => {
    if (skipSync.current) {
      skipSync.current = false;
      return;
    }
    setValue(initial);
    pastRef.current = [];
    futureRef.current = [];
    setHist({ past: 0, future: 0 });
  }, [initial]);

  const commit = useCallback((next) => {
    const v = String(next ?? "");
    setValue((prev) => {
      if (v === prev) return prev;
      pastRef.current = [...pastRef.current.slice(-MAX_UNDO + 1), prev];
      futureRef.current = [];
      return v;
    });
    syncHist();
  }, [syncHist]);

  const undo = useCallback(() => {
    setValue((prev) => {
      const stack = pastRef.current;
      if (!stack.length) return prev;
      const prior = stack[stack.length - 1];
      pastRef.current = stack.slice(0, -1);
      futureRef.current = [prev, ...futureRef.current];
      skipSync.current = true;
      return prior;
    });
    syncHist();
  }, [syncHist]);

  const redo = useCallback(() => {
    setValue((prev) => {
      const stack = futureRef.current;
      if (!stack.length) return prev;
      const next = stack[0];
      futureRef.current = stack.slice(1);
      pastRef.current = [...pastRef.current, prev];
      skipSync.current = true;
      return next;
    });
    syncHist();
  }, [syncHist]);

  const reset = useCallback((next) => {
    skipSync.current = true;
    pastRef.current = [];
    futureRef.current = [];
    setValue(String(next ?? ""));
    setHist({ past: 0, future: 0 });
  }, []);

  return {
    value,
    commit,
    undo,
    redo,
    canUndo: hist.past > 0,
    canRedo: hist.future > 0,
    reset,
  };
}

function createVarChipNode(name) {
  const wrap = document.createElement("div");
  wrap.innerHTML = varChipHtml(name);
  return wrap.firstElementChild;
}

function insertNodeAtSelection(node) {
  const sel = window.getSelection();
  if (!sel?.rangeCount) return false;
  const range = sel.getRangeAt(0);
  range.deleteContents();
  range.insertNode(node);
  range.setStartAfter(node);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
  return true;
}

function RenameVarDialog({ open, name, existing, onClose, onConfirm }) {
  const [draft, setDraft] = useState(name || "");
  const [err, setErr] = useState("");
  useEffect(() => {
    if (open) {
      setDraft(name || "");
      setErr("");
    }
  }, [open, name]);
  function submit() {
    const next = draft.trim();
    if (!isValidVarName(next)) {
      setErr("Nombre inválido (use letras, números y _)");
      return;
    }
    if (next !== name && existing.includes(next)) {
      setErr("Ya existe otra variable con ese nombre");
      return;
    }
    onConfirm(next);
  }
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Renombrar variable</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Se actualizarán todas las ocurrencias de <code>{`{{${name}}}`}</code> en el documento.
        </Typography>
        {err ? <Alert severity="error" sx={{ mb: 1 }}>{err}</Alert> : null}
        <TextField
          autoFocus
          fullWidth
          size="small"
          label="Nombre"
          value={draft}
          onChange={(e) => setDraft(e.target.value.replace(/[^\w]/g, ""))}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={submit}>Renombrar</Button>
      </DialogActions>
    </Dialog>
  );
}

function NewVarDialog({ open, onClose, onConfirm, existing }) {
  const [draft, setDraft] = useState("");
  const [err, setErr] = useState("");
  useEffect(() => {
    if (open) {
      setDraft("");
      setErr("");
    }
  }, [open]);
  function submit() {
    const next = draft.trim();
    if (!isValidVarName(next)) {
      setErr("Nombre inválido (use letras, números y _)");
      return;
    }
    if (existing.includes(next)) {
      setErr("La variable ya existe en el documento");
      return;
    }
    onConfirm(next);
  }
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Nueva variable</DialogTitle>
      <DialogContent>
        {err ? <Alert severity="error" sx={{ mb: 1 }}>{err}</Alert> : null}
        <TextField
          autoFocus
          fullWidth
          size="small"
          label="Nombre"
          placeholder="instruccion_tipo"
          value={draft}
          onChange={(e) => setDraft(e.target.value.replace(/[^\w]/g, ""))}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={submit}>Insertar</Button>
      </DialogActions>
    </Dialog>
  );
}

function PromptEditorDialog({
  open, onClose, title, body, canEdit, onSave, tipo,
}) {
  const surfaceRef = useRef(null);
  const syncLock = useRef(false);
  const { value, commit, undo, redo, canUndo, canRedo, reset } = useEditorUndo(body);
  const [ctxMenu, setCtxMenu] = useState(null);
  const [renameDlg, setRenameDlg] = useState({ open: false, name: "" });
  const [newVarDlg, setNewVarDlg] = useState(false);
  const wasOpen = useRef(false);

  const variables = useMemo(() => extractPromptVariables(value), [value]);

  useEffect(() => {
    if (open && !wasOpen.current) reset(body);
    wasOpen.current = open;
  }, [open, body, reset]);

  const syncSurfaceFromValue = useCallback((text) => {
    const el = surfaceRef.current;
    if (!el) return;
    syncLock.current = true;
    el.innerHTML = bodyToEditorHtml(text);
    syncLock.current = false;
  }, []);

  useEffect(() => {
    if (!open) return;
    syncSurfaceFromValue(value);
  }, [open, value, syncSurfaceFromValue]);

  const readSurface = useCallback(() => {
    const el = surfaceRef.current;
    if (!el) return value;
    return editorHtmlToBody(el);
  }, [value]);

  const pushChange = useCallback(() => {
    if (syncLock.current) return;
    const next = readSurface();
    commit(next);
    if (/\{\{\s*[A-Za-z_]\w*\s*\}\}/.test(next)) {
      requestAnimationFrame(() => syncSurfaceFromValue(next));
    }
  }, [readSurface, commit, syncSurfaceFromValue]);

  function handleClose() {
    onClose();
  }

  function handleSave() {
    const next = readSurface();
    onSave(next);
    onClose();
  }

  function insertVariable(name) {
    const chip = createVarChipNode(name);
    if (!chip) return;
    insertNodeAtSelection(chip);
    pushChange();
    setCtxMenu(null);
  }

  async function onChipDelete(name) {
    setCtxMenu(null);
    const ok = await requestConfirm({
      title: "Eliminar variable",
      message: `¿Eliminar todas las ocurrencias de {{${name}}} en este documento?`,
      confirmLabel: "Eliminar",
      destructive: true,
    });
    if (!ok) return;
    const next = deletePromptVariable(value, name);
    commit(next);
  }

  function onChipRename(oldName, newName) {
    const next = renamePromptVariable(value, oldName, newName);
    commit(next);
    setRenameDlg({ open: false, name: "" });
  }

  function onEditorContextMenu(e) {
    if (!canEdit) return;
    e.preventDefault();
    setCtxMenu({ mouseX: e.clientX + 2, mouseY: e.clientY - 6 });
  }

  function onEditorClick(e) {
    const delBtn = e.target.closest?.("[data-var-del]");
    if (delBtn) {
      e.preventDefault();
      e.stopPropagation();
      onChipDelete(delBtn.getAttribute("data-var-del"));
      return;
    }
    const chip = e.target.closest?.(".prompt-var-chip");
    if (chip && e.detail >= 2 && canEdit) {
      e.preventDefault();
      setRenameDlg({ open: true, name: chip.dataset.var || "" });
    }
  }

  function onKeyDown(e) {
    if (!canEdit) return;
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key === "z" && !e.shiftKey) {
      e.preventDefault();
      undo();
    } else if (mod && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
      e.preventDefault();
      redo();
    }
  }

  function execFmt(cmd, arg) {
    surfaceRef.current?.focus();
    document.execCommand(cmd, false, arg ?? null);
    pushChange();
  }

  return (
    <Dialog open={open} onClose={handleClose} fullScreen scroll="paper">
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, py: 1.5, flexWrap: "wrap" }}>
        <iconify-icon icon="mdi:pencil-outline" width="1.25em" height="1.25em" />
        <Box component="span" sx={{ fontWeight: 600 }}>{title}</Box>
        <Box sx={{ flex: 1 }} />
        <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
          <ButtonIconify icon="mdi:undo" title="Deshacer (Ctrl+Z)" onClick={undo} disabled={!canUndo} />
          <ButtonIconify icon="mdi:redo" title="Rehacer (Ctrl+Y)" onClick={redo} disabled={!canRedo} />
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          <ButtonIconify icon="mdi:format-bold" title="Negrita" onClick={() => execFmt("bold")} disabled={!canEdit} />
          <ButtonIconify icon="mdi:format-italic" title="Cursiva" onClick={() => execFmt("italic")} disabled={!canEdit} />
          <ButtonIconify icon="mdi:format-header-1" title="Título 1" onClick={() => execFmt("formatBlock", "h1")} disabled={!canEdit} />
          <ButtonIconify icon="mdi:format-header-2" title="Título 2" onClick={() => execFmt("formatBlock", "h2")} disabled={!canEdit} />
          <ButtonIconify icon="mdi:format-list-bulleted" title="Lista" onClick={() => execFmt("insertUnorderedList")} disabled={!canEdit} />
          <ButtonIconify
            icon="mdi:variable"
            label="Variable"
            title="Insertar variable"
            onClick={() => setNewVarDlg(true)}
            disabled={!canEdit}
          />
          <ButtonIconify icon="mdi:close" title="Cerrar sin guardar" onClick={handleClose} />
        </Stack>
      </DialogTitle>
      <DialogContent dividers className="prompt-md-dialog custom-scrollbar">
        {tipo === "GENERAL" && (
          <Alert severity="info" sx={{ mb: 1.5, maxWidth: "52rem", mx: "auto" }}>
            Coloque <code>{`{{instruccion_tipo}}`}</code> exactamente donde debe insertarse la instrucción del tipo clasificado
            (ya no se concatena al final). Use <code>{`{{nombre_usuario}}`}</code> para personalizar el saludo.
          </Alert>
        )}
        {variables.length > 0 && (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 1.5, maxWidth: "52rem", mx: "auto" }}>
            <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "center", mr: 0.5 }}>
              Variables:
            </Typography>
            {variables.map((v) => (
              <Chip
                key={v}
                size="small"
                variant="outlined"
                className="prompt-var-chip prompt-var-chip--static"
                label={`{{${v}}}`}
                onDoubleClick={canEdit ? () => setRenameDlg({ open: true, name: v }) : undefined}
              />
            ))}
          </Stack>
        )}
        <div
          ref={surfaceRef}
          className={`prompt-md-editor-surface prompt-md-preview${canEdit ? "" : " prompt-md-editor-surface--readonly"}`}
          contentEditable={canEdit}
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="Editor de instrucción"
          onInput={pushChange}
          onBlur={pushChange}
          onContextMenu={onEditorContextMenu}
          onClick={onEditorClick}
          onKeyDown={onKeyDown}
        />
      </DialogContent>
      <DialogActions sx={{ px: 2, py: 1 }}>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave} disabled={!canEdit}>Guardar cambios</Button>
      </DialogActions>

      <Menu
        open={ctxMenu != null}
        onClose={() => setCtxMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={ctxMenu ? { top: ctxMenu.mouseY, left: ctxMenu.mouseX } : undefined}
      >
        <MenuItem disabled sx={{ opacity: 1, fontSize: "0.72rem", fontWeight: 600 }}>
          Insertar variable
        </MenuItem>
        {variables.map((v) => (
          <MenuItem key={v} onClick={() => insertVariable(v)}>{`{{${v}}}`}</MenuItem>
        ))}
        <Divider />
        <MenuItem onClick={() => { setCtxMenu(null); setNewVarDlg(true); }}>
          <iconify-icon icon="mdi:plus" width="1em" height="1em" style={{ marginRight: 8 }} />
          Nueva variable…
        </MenuItem>
      </Menu>

      <RenameVarDialog
        open={renameDlg.open}
        name={renameDlg.name}
        existing={variables}
        onClose={() => setRenameDlg({ open: false, name: "" })}
        onConfirm={(newName) => onChipRename(renameDlg.name, newName)}
      />
      <NewVarDialog
        open={newVarDlg}
        onClose={() => setNewVarDlg(false)}
        existing={variables}
        onConfirm={(name) => {
          insertVariable(name);
          setNewVarDlg(false);
        }}
      />
    </Dialog>
  );
}

/** Vista previa del cuerpo + editor WYSIWYG al entrar o doble clic. */
export function PromptBodyEditor({
  body,
  canEdit,
  editBlockReason,
  onChange,
  placeholder,
  tipo,
  title,
}) {
  const [editorOpen, setEditorOpen] = useState(false);
  const previewHtml = useMemo(() => {
    const text = String(body || "").trim();
    if (!text) return "";
    return bodyPreviewHtml(body);
  }, [body]);

  function openEditor() {
    if (!canEdit) return;
    setEditorOpen(true);
  }

  return (
    <>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end" className="tab-editor-head" sx={{ mb: 0.5 }}>
        <ButtonIconify
          icon="mdi:login"
          label="Entrar"
          title={canEdit ? "Abrir editor de instrucción" : editBlockReason}
          onClick={openEditor}
          disabled={!canEdit}
        />
      </Stack>

      <Box
        className={`prompt-body-preview custom-scrollbar${canEdit ? " prompt-body-preview--editable" : ""}`}
        onDoubleClick={openEditor}
        title={canEdit ? "Doble clic para editar" : editBlockReason}
        role={canEdit ? "button" : undefined}
        tabIndex={canEdit ? 0 : undefined}
        onKeyDown={(e) => {
          if (canEdit && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            openEditor();
          }
        }}
      >
        {previewHtml ? (
          <div
            className="prompt-md-preview msg-body"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        ) : (
          <Typography variant="body2" color="text.secondary" className="prompt-body-preview__empty">
            {placeholder || "Sin contenido. Doble clic para editar…"}
          </Typography>
        )}
      </Box>

      <PromptEditorDialog
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={title || tipo || "Instrucción"}
        body={body || ""}
        canEdit={canEdit}
        tipo={tipo}
        onSave={(next) => onChange(next)}
      />
    </>
  );
}

export { bodyPreviewHtml };
