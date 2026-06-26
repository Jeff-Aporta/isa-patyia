import { getMaterialUI, getReact, UI } from "../core/platform.ts";
import { ButtonIconify } from "../ui/shared.jsx";
import { PromptBodyEditor } from "../ui/PromptBodyEditor.jsx";
import { JsonCodeEditor } from "../editors/jsonEditor.jsx";
import { GlassDialog, GlassDialogHeader, glassDialogContentSx, glassDialogActionsSx } from "../ui/GlassDialog.jsx";
import { fetchPromptsOperativosConfig, putPromptsOperativosConfig } from "../api/systemConfigApi.ts";
import { loadPatyJwt } from "../core/patyia-jwt.ts";
import { toastError, toastSuccess } from "../core/platform.ts";
import { unitIntervalFieldProps } from "./promptsSql/helpers.ts";
import { DEFAULT_MODELO_OPERATIVO } from "./configOpenAi.ts";
import {
  REASONING_EFFORT_OPTIONS, contentLinesToText, textToContentLines,
  listPromptKeys, modelAllowsSampling,
  parseAndValidateJsonText, prettyJson, readPromptAccordionExpandState, validatePromptsOperativosConfig, configsEqual, stripLegacyMetaKeys, writePromptAccordionExpandState,
} from "./configPromptsOperativos.ts";

const { useState, useEffect, useCallback } = getReact();
const {
  Typography, TextField, Stack, Alert, CircularProgress, Box,
  FormControl, InputLabel, Select, MenuItem, Accordion, AccordionSummary, AccordionDetails,
  DialogContent, DialogActions, Button, Tooltip,
} = getMaterialUI();
const { Icon } = UI;

const PROMPT_LABELS = {
  generarTitulo: "Generar título",
  generarResumenTicket: "Resumen ticket",
};
const PROMPT_DEF_FIELD_SX = { width: 200, minWidth: 200, flex: "0 0 auto" };

function promptLabel(key) {
  return PROMPT_LABELS[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

function ConfigSectionLoading({ show }) {
  if (!show) return null;
  return <Box className="config-form-section__loading"><CircularProgress size={26} /></Box>;
}

function OperativosJsonModal({ open, initial, readOnly, operativeModel, onClose, onApply }) {
  const [json, setJson] = useState(initial);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (open) { setJson(initial); setErrors([]); }
  }, [open, initial]);

  function validateNow(text) {
    const r = parseAndValidateJsonText(text, { operativeModel });
    setErrors(r.errors);
    return r;
  }

  function apply() {
    const r = validateNow(json);
    if (!r.ok) return;
    onApply?.(r.normalized);
    onClose();
  }

  const canApply = parseAndValidateJsonText(json, { operativeModel }).ok;

  return (
    <GlassDialog open={open} onClose={onClose} maxWidth="md" fullWidth paperMaxWidth={960}
      header={<GlassDialogHeader icon="mdi:code-json" title="JSON" accent="#6366f1" onClose={onClose} />}>
      <DialogContent dividers sx={glassDialogContentSx({ p: 0, minHeight: 380 })}>
        {errors.length ? (
          <Alert severity="warning" sx={{ m: 1.5, mb: 0 }}>
            <Stack component="ul" spacing={0.25} sx={{ m: 0, pl: 2 }}>
              {errors.map((e) => <li key={e}><Typography variant="body2">{e}</Typography></li>)}
            </Stack>
          </Alert>
        ) : null}
        <Box className="permisos-json-modal-editor config-prompts-json-modal" sx={{ minHeight: 340, p: 1 }}>
          <JsonCodeEditor value={json} onChange={readOnly ? undefined : (v) => { setJson(v); validateNow(v); }} readOnly={readOnly} placeholder="{}" fullPageTitle="prompts_operativos" />
        </Box>
      </DialogContent>
      <DialogActions sx={glassDialogActionsSx()}>
        <Button onClick={onClose} sx={{ textTransform: "none", fontWeight: 600 }}>{readOnly ? "Cerrar" : "Cancelar"}</Button>
        {!readOnly && onApply ? (
          <Button variant="contained" onClick={apply} disabled={!canApply} sx={{ textTransform: "none", fontWeight: 600 }}>Aplicar JSON</Button>
        ) : null}
      </DialogActions>
    </GlassDialog>
  );
}

function MessageCard({ role, body, canEdit, promptKey, onChange }) {
  const icon = role === "system" ? "mdi:cog-outline" : role === "user" ? "mdi:account-outline" : "mdi:robot-outline";
  const title = role === "system" ? "Sistema" : role === "user" ? "Usuario" : "Asistente";
  return (
    <Box className={`config-prompt-msg config-prompt-msg--${role}`}>
      <Stack direction="row" spacing={1} alignItems="center" className="config-prompt-msg__head">
        <Icon icon={icon} size={16} />
        <Typography variant="subtitle2" fontWeight={700}>{title}</Typography>
      </Stack>
      <Box className="config-prompt-msg__editor">
        <PromptBodyEditor body={body} canEdit={canEdit} onChange={onChange} tipo={`${promptKey}_${role}`}
          title={`${promptLabel(promptKey)} · ${title}`} placeholder="Escriba el prompt…" />
      </Box>
    </Box>
  );
}

function PromptDefEditor({ promptKey, def, canEdit, operativeModel, onChange }) {
  const msgs = Array.isArray(def?.messages) ? def.messages : [];
  const systemIdx = msgs.findIndex((m) => m.role === "system");
  const userIdx = msgs.findIndex((m) => m.role === "user");
  const systemMsg = systemIdx >= 0 ? msgs[systemIdx] : { role: "system", content: [] };
  const userMsg = userIdx >= 0 ? msgs[userIdx] : { role: "user", content: [] };
  const tempAllowed = modelAllowsSampling(operativeModel);

  function patchDef(patch) {
    onChange({ ...def, ...patch });
  }

  function patchMessage(role, idx, text) {
    const next = msgs.map((m, i) => (i === idx ? { ...m, content: textToContentLines(text) } : m));
    if (idx < 0) next.push({ role, content: textToContentLines(text) });
    onChange({ ...def, messages: next });
  }

  return (
    <Stack spacing={2} className="config-prompt-def">
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} useFlexGap flexWrap="wrap" alignItems="flex-end" className="config-prompt-def-fields">
        <FormControl size="small" sx={PROMPT_DEF_FIELD_SX} disabled={!canEdit}>
          <InputLabel>Razonamiento</InputLabel>
          <Select label="Razonamiento" value={def?.reasoning_effort || "low"} onChange={(e) => patchDef({ reasoning_effort: e.target.value })}>
            {REASONING_EFFORT_OPTIONS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField size="small" label="Máx. tokens" type="number" disabled={!canEdit} fullWidth
          value={def?.max_completion_tokens ?? ""} sx={PROMPT_DEF_FIELD_SX}
          onChange={(e) => patchDef({ max_completion_tokens: e.target.value === "" ? undefined : Number(e.target.value) })}
          slotProps={{ htmlInput: { min: 1, max: 128000, step: 1 } }} />
        <Tooltip title={tempAllowed ? undefined : "No aplica a este modelo"} placement="top">
          <Box component="span" sx={PROMPT_DEF_FIELD_SX}>
            <TextField size="small" fullWidth label="Temperatura" disabled={!canEdit || !tempAllowed}
              {...unitIntervalFieldProps(def?.temperatura, 0.4, (v) => patchDef({ temperatura: v }))} />
          </Box>
        </Tooltip>
      </Stack>
      <MessageCard role="system" promptKey={promptKey} canEdit={canEdit} body={contentLinesToText(systemMsg.content)}
        onChange={(text) => patchMessage("system", systemIdx, text)} />
      <MessageCard role="user" promptKey={promptKey} canEdit={canEdit} body={contentLinesToText(userMsg.content)}
        onChange={(text) => patchMessage("user", userIdx, text)} />
    </Stack>
  );
}

export function ConfigPromptsOperativosPanel({ onNeedLogin, ConfigFormSection, operativeModel, conversationModel: _conversationModel }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [err, setErr] = useState("");
  const [config, setConfig] = useState({});
  const [saved, setSaved] = useState({});
  const [jsonOpen, setJsonOpen] = useState(false);
  const [expandState, setExpandState] = useState(() => readPromptAccordionExpandState());

  const opModel = String(operativeModel ?? DEFAULT_MODELO_OPERATIVO).trim() || DEFAULT_MODELO_OPERATIVO;
  const promptKeys = listPromptKeys(config);

  useEffect(() => { writePromptAccordionExpandState(expandState); }, [expandState]);

  function isExpanded(key) {
    if (Object.prototype.hasOwnProperty.call(expandState, key)) return !!expandState[key];
    return false;
  }

  function handleToggleExpand(key, on) {
    setExpandState((prev) => ({ ...prev, [key]: on }));
  }

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const { config: cfg, canEdit: ce } = await fetchPromptsOperativosConfig(loadPatyJwt());
      const data = stripLegacyMetaKeys(cfg ?? {});
      setConfig(data);
      setSaved(data);
      setCanEdit(!!ce);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const onJwt = () => { load(); };
    const onOpenAi = () => { load(); };
    window.addEventListener("isa-patyia:paty-jwt", onJwt);
    window.addEventListener("isa-patyia:openai-config", onOpenAi);
    return () => {
      window.removeEventListener("isa-patyia:paty-jwt", onJwt);
      window.removeEventListener("isa-patyia:openai-config", onOpenAi);
    };
  }, [load]);

  function updatePrompt(key, def) {
    setConfig((prev) => ({ ...prev, [key]: def }));
  }

  async function save() {
    const jwt = loadPatyJwt();
    if (!jwt?.token) { onNeedLogin?.(); return; }
    if (!canEdit) return;
    const v = validatePromptsOperativosConfig(config, { operativeModel: opModel, strict: false });
    if (!v.ok) { setErr(v.errors.join(" · ")); return; }
    setSaving(true);
    setErr("");
    try {
      const cfg = await putPromptsOperativosConfig(v.normalized, jwt);
      const next = validatePromptsOperativosConfig(stripLegacyMetaKeys(cfg), { operativeModel: opModel, strict: false }).normalized;
      setConfig(next);
      setSaved(next);
      toastSuccess("Guardado");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      toastError(msg);
    } finally {
      setSaving(false);
    }
  }

  const dirty = canEdit && !configsEqual(config, saved);
  const validation = validatePromptsOperativosConfig(config, { operativeModel: opModel, strict: false });

  return (
    <ConfigFormSection
      className="config-form-section--prompts"
      icon={<Icon icon="mdi:robot-outline" size={20} />}
      title="Prompts operativos"
      description="Tareas automáticas: título, resumen de ticket y similares."
      actions={(
        <>
          <ButtonIconify icon="mdi:code-json" title="JSON" onClick={() => setJsonOpen(true)} />
          <ButtonIconify icon="mdi:refresh" title="Recargar" onClick={load} disabled={loading || saving} />
          {canEdit ? (
            <ButtonIconify variant="primary" icon="mdi:content-save-outline" title="Guardar" label="Guardar"
              onClick={save} disabled={loading || saving || !dirty || !validation.ok} busy={saving} />
          ) : null}
        </>
      )}
    >
      {err ? <Alert severity="warning" className="config-form-alert">{err}</Alert> : null}
      {!validation.ok && dirty ? (
        <Alert severity="error" variant="outlined" className="config-form-alert">
          <Stack component="ul" spacing={0.25} sx={{ m: 0, pl: 2 }}>
            {validation.errors.map((e) => <li key={e}><Typography variant="body2">{e}</Typography></li>)}
          </Stack>
        </Alert>
      ) : null}
      <Box sx={{ position: "relative" }}>
        <ConfigSectionLoading show={loading} />
        <Stack spacing={1} className="config-prompt-accordions">
          {promptKeys.map((key) => (
            <Accordion key={key} expanded={isExpanded(key)} onChange={(_e, on) => handleToggleExpand(key, on)}
              className="config-prompt-accordion" disableGutters elevation={0}>
              <AccordionSummary expandIcon={<Icon icon="mdi:chevron-down" size={20} />}>
                <Typography fontWeight={600}>{promptLabel(key)}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <PromptDefEditor promptKey={key} def={config[key]} canEdit={canEdit && !loading && !saving}
                  operativeModel={opModel} onChange={(def) => updatePrompt(key, def)} />
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      </Box>
      <OperativosJsonModal open={jsonOpen} initial={prettyJson(config)} readOnly={!canEdit} operativeModel={opModel}
        onClose={() => setJsonOpen(false)} onApply={(parsed) => { setConfig(parsed); setJsonOpen(false); }} />
    </ConfigFormSection>
  );
}
