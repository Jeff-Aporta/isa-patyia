import { getMaterialUI, getReact, UI } from "../core/platform.ts";
import { ButtonIconify } from "../ui/shared.jsx";
import { JsonCodeEditor } from "../editors/jsonEditor.jsx";
import { GlassDialog, GlassDialogHeader, glassDialogContentSx, glassDialogActionsSx } from "../ui/GlassDialog.jsx";
import { fetchOpenAiSystemConfig, putOpenAiSystemConfig } from "../api/systemConfigApi.ts";
import { loadPatyJwt } from "../core/patyia-jwt.ts";
import { toastError, toastSuccess } from "../core/platform.ts";
import { PermisosPanel } from "./PermisosPanel.jsx";
import { ConfigPromptsOperativosPanel } from "./ConfigPromptsOperativosPanel.jsx";
import {
  buildDefaults, configsEqual, modelSelectOptions, parseAndValidateJsonText, prettyJson, toOpenAiJsonPayload, validateOpenAiConfig,
} from "./configOpenAi.ts";
import { readConfigToolTab, writeConfigToolTab } from "./configToolState.ts";

const { useState, useEffect, useCallback, useMemo } = getReact();
const { Paper, Typography, TextField, Stack, Alert, CircularProgress, Tabs, Tab, Box, FormControl, InputLabel, Select, MenuItem, Tooltip, DialogContent, DialogActions, Button, Divider } = getMaterialUI();
const { Icon } = UI;

/** Sección de formulario (no modal): título, ayuda, cuerpo y pie opcional. */
function ConfigFormSection({ icon, title, description, chips, actions, footer, children, className }) {
  return (
    <Box component="section" className={`config-form-section${className ? ` ${className}` : ""}`}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} className="config-form-section__head">
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1.25} alignItems="center" className="config-form-section__title-row">
            {icon ? <Box className="config-form-section__icon" aria-hidden>{icon}</Box> : null}
            <Box className="config-form-section__titles" sx={{ minWidth: 0 }}>
              <Typography component="h3" variant="subtitle1" fontWeight={700} className="config-form-section__title">{title}</Typography>
              {description ? <Typography variant="body2" color="text.secondary" className="config-form-section__desc" gutterBottom>{description}</Typography> : null}
            </Box>
          </Stack>
        </Box>
        {actions ? <Stack direction="row" spacing={0.5} alignItems="center" flexShrink={0} className="config-form-section__actions">{actions}</Stack> : null}
      </Stack>
      {chips?.length ? (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap className="config-form-section__chips">{chips}</Stack>
      ) : null}
      <Box className="config-form-section__body">{children}</Box>
      {footer}
    </Box>
  );
}

function ConfigSectionLoading({ show }) {
  if (!show) return null;
  return <Box className="config-form-section__loading"><CircularProgress size={26} /></Box>;
}

function OpenAiJsonModal({ open, initial, readOnly, modelOptions, onClose, onApply }) {
  const [json, setJson] = useState(initial);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (open) { setJson(initial); setErrors([]); }
  }, [open, initial]);

  function validateNow(text) {
    const r = parseAndValidateJsonText(text, { modelOptions });
    setErrors(r.errors);
    return r;
  }

  function apply() {
    const r = validateNow(json);
    if (!r.ok) return;
    onApply?.(r.normalized);
    onClose();
  }

  const canApply = parseAndValidateJsonText(json, { modelOptions }).ok;

  return (
    <GlassDialog open={open} onClose={onClose} maxWidth="md" fullWidth paperMaxWidth={720}
      header={<GlassDialogHeader icon="mdi:code-json" title="OpenAI — JSON" accent="#6366f1" onClose={onClose} />}>
      <DialogContent dividers sx={glassDialogContentSx({ p: 0, minHeight: 320 })}>
        {errors.length ? (
          <Alert severity="warning" sx={{ m: 1.5, mb: 0 }}>
            <Stack component="ul" spacing={0.25} sx={{ m: 0, pl: 2 }}>
              {errors.map((e) => <li key={e}><Typography variant="body2">{e}</Typography></li>)}
            </Stack>
          </Alert>
        ) : null}
        <Box className="permisos-json-modal-editor config-openai-json-modal" sx={{ minHeight: 280, p: 1 }}>
          <JsonCodeEditor value={json} onChange={readOnly ? undefined : (v) => { setJson(v); validateNow(v); }} readOnly={readOnly} placeholder="{}" fullPageTitle="openai" />
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

export function ConfigTool({ onNeedLogin }) {
  const [tab, setTab] = useState(() => readConfigToolTab());

  useEffect(() => { writeConfigToolTab(tab); }, [tab]);

  return (
    <div className="tool-grid tool-grid-config isa-tool-surface">
      <Paper className="tool-panel scroll-panel config-tool-panel" elevation={0}>
        <div className="panel-head config-tool-head">
          <Tabs value={tab} onChange={(_e, v) => setTab(v)} variant="scrollable" scrollButtons="auto" className="config-tool-tabs">
            <Tab value="sistema" label="Sistema" icon={<Icon icon="mdi:tune-vertical" size={14} />} iconPosition="start" />
            <Tab value="permisos" label="Permisos" icon={<Icon icon="mdi:shield-key-outline" size={14} />} iconPosition="start" />
          </Tabs>
        </div>
        {tab === "permisos" ? <PermisosPanel /> : <SistemaConfigBody onNeedLogin={onNeedLogin} />}
      </Paper>
    </div>
  );
}

function SistemaConfigBody({ onNeedLogin }) {
  const [openAiModels, setOpenAiModels] = useState(() => ({ modeloOperativo: buildDefaults().modeloOperativo, modeloConversacion: buildDefaults().modeloConversacion }));

  return (
    <div className="panel-body config-panel-body custom-scrollbar">
      <Box className="config-panel-inner config-panel-inner--form config-sections-stack">
        <OpenAiSection onNeedLogin={onNeedLogin} onModelsChange={setOpenAiModels} />
        <Divider className="config-form-divider" role="separator" aria-hidden="true" />
        <ConfigPromptsOperativosPanel onNeedLogin={onNeedLogin} ConfigFormSection={ConfigFormSection}
          operativeModel={openAiModels.modeloOperativo} conversationModel={openAiModels.modeloConversacion} />
      </Box>
    </div>
  );
}

function OpenAiSection({ onNeedLogin, onModelsChange }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [jsonOpen, setJsonOpen] = useState(false);
  const [err, setErr] = useState("");
  const [config, setConfig] = useState(buildDefaults);
  const [saved, setSaved] = useState(buildDefaults);

  const modelOptions = useMemo(() => modelSelectOptions(config.modeloOperativo, config.modeloConversacion), [config]);
  const validation = useMemo(() => validateOpenAiConfig(config, { modelOptions }), [config, modelOptions]);

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const cfg = await fetchOpenAiSystemConfig(loadPatyJwt());
      const next = { ...buildDefaults(), ...cfg };
      setConfig(next);
      setSaved(next);
      setCanEdit(!!cfg.canEdit);
      onModelsChange?.({ modeloOperativo: next.modeloOperativo, modeloConversacion: next.modeloConversacion });
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [onModelsChange]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const onJwt = () => { load(); };
    window.addEventListener("isa-patyia:paty-jwt", onJwt);
    return () => window.removeEventListener("isa-patyia:paty-jwt", onJwt);
  }, [load]);

  function patch(patch) {
    setConfig((prev) => {
      const next = { ...prev, ...patch };
      onModelsChange?.({ modeloOperativo: next.modeloOperativo, modeloConversacion: next.modeloConversacion });
      return next;
    });
  }

  async function save() {
    const jwt = loadPatyJwt();
    if (!jwt?.token) { onNeedLogin?.(); return; }
    if (!canEdit) return;
    const v = validateOpenAiConfig(config, { modelOptions });
    if (!v.ok) { setErr(v.errors.join(" · ")); return; }
    setSaving(true);
    setErr("");
    try {
      const cfg = await putOpenAiSystemConfig(v.normalized, jwt);
      const next = { ...v.normalized, canEdit };
      setSaved(next);
      setConfig(next);
      onModelsChange?.({ modeloOperativo: next.modeloOperativo, modeloConversacion: next.modeloConversacion });
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

  return (
    <ConfigFormSection
      className="config-form-section--openai"
      icon={<Icon icon="mdi:brain" size={20} />}
      title="OpenAI"
      description="Modelos por defecto y fragmentos de búsqueda en archivos."
      actions={(
        <>
          <ButtonIconify icon="mdi:code-json" title="JSON" onClick={() => setJsonOpen(true)} />
          <ButtonIconify icon="mdi:refresh" title="Recargar" onClick={load} disabled={loading || saving} />
          {canEdit ? (
            <ButtonIconify variant="primary" icon="mdi:content-save-outline" title="Guardar" label="Guardar" onClick={save} disabled={loading || saving || !dirty || !validation.ok} busy={saving} />
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
        <Box className="config-openai-fields-row" sx={{ display: "grid", gridTemplateColumns: "minmax(160px, 1.2fr) minmax(160px, 1.2fr) 108px", gap: "1rem 1.25rem", alignItems: "start", width: "100%", maxWidth: 640, mt: 0.5 }}>
          <FormControl size="small" className="config-openai-fields-row__cell" disabled={!canEdit || loading || saving}>
            <InputLabel>Operativo</InputLabel>
            <Select label="Operativo" value={config.modeloOperativo} onChange={(e) => patch({ modeloOperativo: e.target.value })}>
              {modelOptions.map((id) => <MenuItem key={id} value={id}>{id}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" className="config-openai-fields-row__cell" disabled={!canEdit || loading || saving}>
            <InputLabel>Conversación</InputLabel>
            <Select label="Conversación" value={config.modeloConversacion} onChange={(e) => patch({ modeloConversacion: e.target.value })}>
              {modelOptions.map((id) => <MenuItem key={id} value={id}>{id}</MenuItem>)}
            </Select>
          </FormControl>
          <Box className="config-openai-fields-row__cell config-openai-fields-row__fragments">
            <Tooltip title="Fragmentos de documentación usados por consulta (3–50)" placement="top">
              <TextField label="Fragmentos" type="number" size="small" fullWidth
                value={config.max_num_results} disabled={loading || saving || !canEdit}
                onChange={(e) => patch({ max_num_results: Math.round(Number(e.target.value)) || buildDefaults().max_num_results })}
                slotProps={{ htmlInput: { min: 3, max: 50, step: 1 } }} />
            </Tooltip>
          </Box>
        </Box>
      </Box>
      <OpenAiJsonModal open={jsonOpen} initial={prettyJson(toOpenAiJsonPayload(config))} readOnly={!canEdit} modelOptions={modelOptions}
        onClose={() => setJsonOpen(false)} onApply={(parsed) => { patch(parsed); setJsonOpen(false); }} />
    </ConfigFormSection>
  );
}
