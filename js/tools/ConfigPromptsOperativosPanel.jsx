import { getMaterialUI, getReact, UI } from "../core/platform.ts";
import { ButtonIconify } from "../ui/shared.jsx";
import { PromptBodyEditor } from "../ui/PromptBodyEditor.jsx";
import { JsonCodeEditor } from "../editors/jsonEditor.jsx";
import { GlassDialog, GlassDialogHeader, glassDialogContentSx, glassDialogActionsSx } from "../ui/GlassDialog.jsx";
import { fetchPromptsOperativosConfig, putPromptsOperativosConfig, requireAppSession } from "../api/systemConfigApi.ts";
import { Session, toastError, toastSuccess } from "../core/platform.ts";
import { unitIntervalFieldProps } from "./promptsSql/helpers.ts";
import { DEFAULT_MODELO_OPERATIVO } from "./configOpenAi.ts";
import {
  REASONING_EFFORT_OPTIONS, contentLinesToText, textToContentLines,
  listPromptKeys, modelAllowsSampling,
  parseAndValidateJsonText, prettyJson, readPromptAccordionExpandState, validatePromptsOperativosConfig, stripLegacyMetaKeys, writePromptAccordionExpandState,
  readPromptSkeletonCount, writePromptSkeletonCount,
} from "./configPromptsOperativos.ts";
import { useConfigFieldPersist } from "./configFieldPersist.ts";

const { useState, useEffect, useCallback, useRef } = getReact();
const {
  Typography, TextField, Stack, Alert, Box, Skeleton,
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

const SKELETON_TITLE_WIDTHS = ["42%", "52%", "38%", "48%"];

function ConfigPromptsSkeleton({ count, expandState }) {
  const expandedKey = Object.keys(expandState ?? {}).find((k) => expandState[k]);
  return (
    <Stack spacing={1} className="config-prompt-accordions config-prompt-accordions--skeleton" aria-busy="true" aria-label="Cargando prompts operativos">
      {Array.from({ length: count }, (_, i) => {
        const expanded = expandedKey ? i === 0 : false;
        return (
          <Accordion key={i} expanded={expanded} className="config-prompt-accordion" disableGutters elevation={0}>
            <AccordionSummary expandIcon={<Icon icon="mdi:chevron-down" size={20} />}>
              <Skeleton variant="text" width={SKELETON_TITLE_WIDTHS[i % SKELETON_TITLE_WIDTHS.length]} height={22} />
            </AccordionSummary>
            {expanded ? (
              <AccordionDetails>
                <Stack spacing={2} className="config-prompt-def">
                  <Stack direction="row" spacing={2} className="config-prompt-def-fields">
                    <Skeleton variant="rounded" height={40} sx={{ width: 200, flex: "0 0 auto" }} />
                    <Skeleton variant="rounded" height={40} sx={{ width: 200, flex: "0 0 auto" }} />
                    <Skeleton variant="rounded" height={40} sx={{ width: 200, flex: "0 0 auto" }} />
                  </Stack>
                  <Skeleton variant="rounded" height={140} />
                  <Skeleton variant="rounded" height={140} />
                </Stack>
              </AccordionDetails>
            ) : null}
          </Accordion>
        );
      })}
    </Stack>
  );
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

function MessageCard({ role, body, bodyLines, canEdit, promptKey, onChange }) {
  const icon = role === "system" ? "mdi:cog-outline" : role === "user" ? "mdi:account-outline" : "mdi:robot-outline";
  const title = role === "system" ? "Sistema" : role === "user" ? "Usuario" : "Asistente";
  return (
    <Box className={`config-prompt-msg config-prompt-msg--${role} isa-neon-accent-stripe`}>
      <Stack direction="row" spacing={1} alignItems="center" className="config-prompt-msg__head">
        <Icon icon={icon} size={16} />
        <Typography variant="subtitle2" fontWeight={700}>{title}</Typography>
      </Stack>
      <Box className="config-prompt-msg__editor">
        <PromptBodyEditor body={body} bodyLines={bodyLines} canEdit={canEdit} onChange={onChange} tipo={`${promptKey}_${role}`}
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
          <InputLabel id={`prompt-reasoning-${promptKey}-label`} shrink>Razonamiento</InputLabel>
          <Select labelId={`prompt-reasoning-${promptKey}-label`} label="Razonamiento" value={def?.reasoning_effort || "low"} onChange={(e) => patchDef({ reasoning_effort: e.target.value })}>
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
      <MessageCard role="system" promptKey={promptKey} canEdit={canEdit}
        body={contentLinesToText(systemMsg.content)} bodyLines={systemMsg.content}
        onChange={(text) => patchMessage("system", systemIdx, text)} />
      <MessageCard role="user" promptKey={promptKey} canEdit={canEdit}
        body={contentLinesToText(userMsg.content)} bodyLines={userMsg.content}
        onChange={(text) => patchMessage("user", userIdx, text)} />
    </Stack>
  );
}

export function ConfigPromptsOperativosPanel({ onNeedLogin, ConfigFormSection, operativeModel, conversationModel: _conversationModel }) {
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [config, setConfig] = useState({});
  const [saved, setSaved] = useState({});
  const savedRef = useRef(saved);
  savedRef.current = saved;
  const { saveGenRef, beginSave, endSave, fieldDisabled } = useConfigFieldPersist();
  const [jsonOpen, setJsonOpen] = useState(false);
  const [expandState, setExpandState] = useState(() => readPromptAccordionExpandState());
  const [skeletonCount, setSkeletonCount] = useState(() => readPromptSkeletonCount());

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
    try {
      const { config: cfg, canEdit: ce } = await fetchPromptsOperativosConfig();
      const data = stripLegacyMetaKeys(cfg ?? {});
      const keys = listPromptKeys(data);
      writePromptSkeletonCount(keys.length);
      setSkeletonCount(keys.length);
      setConfig(data);
      setSaved(data);
      setCanEdit(!!ce);
    } catch (e) {
      toastError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const onAuth = () => { load(); };
    const onOpenAi = () => { load(); };
    window.addEventListener(Session.EVENT, onAuth);
    window.addEventListener("isa-patyia:openai-config", onOpenAi);
    return () => {
      window.removeEventListener(Session.EVENT, onAuth);
      window.removeEventListener("isa-patyia:openai-config", onOpenAi);
    };
  }, [load]);

  async function persist(snapshot, gen, fields) {
    if (!requireAppSession(onNeedLogin)) { endSave(gen); return; }
    if (!canEdit) { endSave(gen); return; }
    const cfg = snapshot ?? config;
    const v = validatePromptsOperativosConfig(cfg, { operativeModel: opModel, strict: false });
    if (!v.ok) { toastError(v.errors.join(" · ")); endSave(gen); return; }
    try {
      const res = await putPromptsOperativosConfig(v.normalized);
      if (gen !== saveGenRef.current) return;
      const next = validatePromptsOperativosConfig(stripLegacyMetaKeys(res), { operativeModel: opModel, strict: false }).normalized;
      savedRef.current = next;
      setSaved(next);
      setConfig(next);
      toastSuccess("Guardado");
      const keys = listPromptKeys(next);
      writePromptSkeletonCount(keys.length);
      setSkeletonCount(keys.length);
    } catch (e) {
      if (gen !== saveGenRef.current) return;
      setConfig(savedRef.current);
      toastError(e instanceof Error ? e.message : String(e));
    } finally {
      endSave(gen);
    }
  }

  function updatePrompt(key, def) {
    const next = { ...config, [key]: def };
    setConfig(next);
    void persist(next, beginSave([key]), [key]);
  }

  return (
    <ConfigFormSection
      className="config-form-section--prompts"
      icon={<Icon icon="mdi:robot-outline" size={20} />}
      title="Prompts operativos"
      description="Tareas automáticas: título, resumen de ticket y similares."
      actions={(
        <>
          <ButtonIconify icon="mdi:code-json" title="JSON" onClick={() => setJsonOpen(true)} />
          <ButtonIconify icon="mdi:refresh" title="Recargar" onClick={load} busy={loading} />
        </>
      )}
    >
      {loading ? (
        <ConfigPromptsSkeleton count={skeletonCount} expandState={expandState} />
      ) : (
        <Stack spacing={1} className="config-prompt-accordions">
          {promptKeys.map((key) => (
            <Accordion key={key} expanded={isExpanded(key)} onChange={(_e, on) => handleToggleExpand(key, on)}
              className="config-prompt-accordion" disableGutters elevation={0}>
              <AccordionSummary expandIcon={<Icon icon="mdi:chevron-down" size={20} />}>
                <Typography fontWeight={600}>{promptLabel(key)}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <PromptDefEditor promptKey={key} def={config[key]} canEdit={!fieldDisabled(canEdit, key)}
                  operativeModel={opModel} onChange={(def) => updatePrompt(key, def)} />
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      )}
      <OperativosJsonModal open={jsonOpen} initial={prettyJson(config)} readOnly={!canEdit} operativeModel={opModel}
        onClose={() => setJsonOpen(false)} onApply={(parsed) => {
          const fields = Object.keys(parsed);
          setConfig(parsed);
          setJsonOpen(false);
          void persist(parsed, beginSave(fields), fields);
        }} />
    </ConfigFormSection>
  );
}
