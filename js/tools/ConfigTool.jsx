import { getMaterialUI, getReact, UI, getGlass } from "../core/platform.ts";
import { ButtonIconify } from "../ui/shared.jsx";
import { fetchOpenAiSystemConfig, putOpenAiSystemConfig, fetchPromptsOperativosConfig, putPromptsOperativosConfig } from "../api/systemConfigApi.ts";
import { loadPatyJwt } from "../core/patyia-jwt.ts";
import { toastError, toastSuccess } from "../core/platform.ts";
import { JsonCodeEditor } from "../editors/jsonEditor.jsx";
import { PermisosPanel } from "./PermisosPanel.jsx";

const { useState, useEffect, useCallback } = getReact();
const { Paper, Typography, TextField, Stack, Alert, CircularProgress, Tabs, Tab, Box, Chip, Slider } = getMaterialUI();
const { Icon } = UI;

const MIN = 1;
const MAX = 50;

function prettyJson(obj) {
  try { return JSON.stringify(obj ?? {}, null, 2); } catch { return "{}"; }
}

export function ConfigTool({ onNeedLogin }) {
  const [tab, setTab] = useState("sistema");
  return (
    <div className="tool-grid tool-grid-config isa-tool-surface">
      <Paper className="tool-panel scroll-panel config-tool-panel" elevation={0}>
        <div className="panel-head config-tool-head" style={{ paddingBottom: 0 }}>
          <Tabs value={tab} onChange={(_e, v) => setTab(v)} variant="scrollable" scrollButtons="auto" className="config-tool-tabs">
            <Tab value="sistema" label="Sistema" icon={<Icon icon="mdi:tune-vertical" size={16} />} iconPosition="start" />
            <Tab value="permisos" label="Permisos" icon={<Icon icon="mdi:shield-key-outline" size={16} />} iconPosition="start" />
          </Tabs>
        </div>
        {tab === "permisos" ? <PermisosPanel /> : <SistemaConfigBody onNeedLogin={onNeedLogin} />}
      </Paper>
    </div>
  );
}

function SistemaConfigBody({ onNeedLogin }) {
  return (
    <div className="panel-body config-panel-body custom-scrollbar">
      <Box className="config-panel-inner config-panel-inner--wide">
        <OpenAiSection onNeedLogin={onNeedLogin} />
        <PromptsOperativosSection onNeedLogin={onNeedLogin} />
      </Box>
    </div>
  );
}

function OpenAiSection({ onNeedLogin }) {
  const { GlassSection, GlassPanel, GlassInner, NEON_COLORS } = getGlass();
  const accent = NEON_COLORS.cyan;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [err, setErr] = useState("");
  const [value, setValue] = useState("8");
  const [saved, setSaved] = useState(8);

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const cfg = await fetchOpenAiSystemConfig(loadPatyJwt());
      setValue(String(cfg.max_num_results));
      setSaved(cfg.max_num_results);
      setCanEdit(!!cfg.canEdit);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const onJwt = () => { load(); };
    window.addEventListener("isa-patyia:paty-jwt", onJwt);
    return () => window.removeEventListener("isa-patyia:paty-jwt", onJwt);
  }, [load]);

  async function save() {
    const jwt = loadPatyJwt();
    if (!jwt?.token) { onNeedLogin?.(); return; }
    if (!canEdit) return;
    const n = Math.round(Number(value));
    if (!Number.isFinite(n) || n < MIN || n > MAX) {
      setErr(`max_num_results debe estar entre ${MIN} y ${MAX}`);
      return;
    }
    setSaving(true);
    setErr("");
    try {
      const cfg = await putOpenAiSystemConfig({ max_num_results: n }, jwt);
      setSaved(cfg.max_num_results);
      setValue(String(cfg.max_num_results));
      toastSuccess("Guardado en SYSTEM.openai");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      toastError(msg);
    } finally {
      setSaving(false);
    }
  }

  const dirty = canEdit && Math.round(Number(value)) !== saved;
  const num = Math.round(Number(value)) || MIN;

  return (
    <>
      {err ? <Alert severity="warning" className="config-panel-alert" sx={{ mb: 2 }}>{err}</Alert> : null}
      <GlassSection title="File Search" accent={accent} className="config-openai-section isa-neon-accent-stripe" sx={{ "--stripe-accent": accent }} icon={<Icon icon="mdi:file-search-outline" size={18} />}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.65 }}>
          Parámetro <code>max_num_results</code> en <code>dbo.SYSTEM</code> (clave <code>openai</code>).
          Limita cuántos fragmentos devuelve <code>file_search</code> por turno de chat.
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
          <Chip size="small" className="isa-neon-glass-chip" icon={<Icon icon={canEdit ? "mdi:pencil-outline" : "mdi:eye-outline"} size={14} />} label={canEdit ? "Edición habilitada" : "Solo lectura"} />
          <Chip size="small" className="isa-neon-glass-chip" icon={<Icon icon="mdi:content-save-check-outline" size={14} />} label={`Activo: ${saved}`} variant={dirty ? "outlined" : "filled"} />
          {!canEdit ? <Chip size="small" className="config-openai-role-chip" label="admn_prompts · dev_lead" /> : null}
        </Stack>
        <GlassPanel tone="blue" className="config-openai-control" sx={{ position: "relative", overflow: "hidden" }}>
          {loading ? <Box className="config-openai-control__loading"><CircularProgress size={28} /></Box> : null}
          <Box className="config-openai-control__head">
            <Box>
              <Typography component="span" className="isa-neon-section-label config-openai-control__label">
                <Icon icon="mdi:tune-variant" size={14} /> Fragmentos por turno
              </Typography>
              <Typography component="div" className="config-openai-value" aria-live="polite">{num}</Typography>
            </Box>
            <TextField className="config-openai-input" label="max_num_results" type="number" size="small" value={value} disabled={loading || saving || !canEdit} onChange={(e) => setValue(e.target.value)} slotProps={{ htmlInput: { min: MIN, max: MAX, step: 1 } }} />
          </Box>
          <Slider className="config-openai-slider" value={num} min={MIN} max={MAX} step={1} disabled={loading || saving || !canEdit} onChange={(_e, v) => setValue(String(v))}
            marks={[{ value: MIN, label: String(MIN) }, { value: 8, label: "8" }, { value: 16, label: "16" }, { value: 32, label: "32" }, { value: MAX, label: String(MAX) }]} valueLabelDisplay="auto" />
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end" className="config-openai-actions">
            <ButtonIconify icon="mdi:refresh" title="Recargar" onClick={load} disabled={loading || saving} />
            <ButtonIconify variant="primary" icon="mdi:content-save-outline" title="Guardar en SYSTEM" label="Guardar" onClick={save} disabled={loading || saving || !dirty} busy={saving} />
          </Stack>
        </GlassPanel>
        {!canEdit ? (
          <GlassInner tone="warn" className="config-openai-hint" sx={{ mt: 2 }}>
            <Stack direction="row" spacing={1.25} alignItems="flex-start">
              <Icon icon="mdi:lock-outline" size={18} />
              <Typography variant="body2" color="text.secondary">
                Edición con rol <code>admn_prompts</code> o <code>dev_lead</code>.
              </Typography>
            </Stack>
          </GlassInner>
        ) : null}
      </GlassSection>
    </>
  );
}

function PromptsOperativosSection({ onNeedLogin }) {
  const { GlassSection, GlassPanel, GlassInner, NEON_COLORS } = getGlass();
  const accent = NEON_COLORS.purple;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [err, setErr] = useState("");
  const [json, setJson] = useState("{}");
  const [savedJson, setSavedJson] = useState("{}");

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const { config, canEdit: ce } = await fetchPromptsOperativosConfig(loadPatyJwt());
      const text = prettyJson(config);
      setJson(text);
      setSavedJson(text);
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
    window.addEventListener("isa-patyia:paty-jwt", onJwt);
    return () => window.removeEventListener("isa-patyia:paty-jwt", onJwt);
  }, [load]);

  async function save() {
    const jwt = loadPatyJwt();
    if (!jwt?.token) { onNeedLogin?.(); return; }
    if (!canEdit) return;
    let parsed;
    try { parsed = JSON.parse(json); } catch (e) {
      setErr("JSON inválido: " + (e?.message || e));
      return;
    }
    setSaving(true);
    setErr("");
    try {
      const cfg = await putPromptsOperativosConfig(parsed, jwt);
      const text = prettyJson(cfg);
      setJson(text);
      setSavedJson(text);
      toastSuccess("Guardado en SYSTEM.prompts_operativos");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      toastError(msg);
    } finally {
      setSaving(false);
    }
  }

  const dirty = canEdit && json !== savedJson;
  const keys = (() => { try { return Object.keys(JSON.parse(json)).filter((k) => !k.startsWith("modelo") && !k.startsWith("temperatura")); } catch { return []; } })();

  return (
    <GlassSection title="Prompts operativos" accent={accent} className="config-prompts-section isa-neon-accent-stripe" sx={{ "--stripe-accent": accent, mt: 3 }} icon={<Icon icon="mdi:robot-outline" size={18} />}>
      {err ? <Alert severity="warning" sx={{ mb: 2 }}>{err}</Alert> : null}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.65 }}>
        Definiciones en <code>dbo.SYSTEM</code> (clave <code>prompts_operativos</code>):
        prompts de título, resumen ticket, clasificación, etc. (<code>generarTitulo</code>, <code>generarResumenTicket</code>…).
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
        <Chip size="small" className="isa-neon-glass-chip" icon={<Icon icon={canEdit ? "mdi:pencil-outline" : "mdi:eye-outline"} size={14} />} label={canEdit ? "Edición habilitada" : "Solo lectura"} />
        {keys.length ? <Chip size="small" className="isa-neon-glass-chip" label={`${keys.length} prompt(s)`} /> : null}
        {!canEdit ? <Chip size="small" className="config-openai-role-chip" label="dev_iss · dev_lead" /> : null}
      </Stack>
      <GlassPanel tone="purple" className="config-prompts-editor-wrap" sx={{ position: "relative", minHeight: 320 }}>
        {loading ? <Box className="config-openai-control__loading"><CircularProgress size={28} /></Box> : null}
        <Box className="config-prompts-editor">
          <JsonCodeEditor value={json} onChange={canEdit ? setJson : undefined} readOnly={!canEdit} placeholder="{}" toolbarExtra={
            <Stack direction="row" spacing={0.5}>
              <ButtonIconify icon="mdi:refresh" title="Recargar" onClick={load} disabled={loading || saving} />
              <ButtonIconify variant="primary" icon="mdi:content-save-outline" title="Guardar" label="Guardar" onClick={save} disabled={loading || saving || !dirty} busy={saving} />
            </Stack>
          } />
        </Box>
      </GlassPanel>
      <GlassInner tone="chip" className="config-openai-hint" sx={{ mt: 2 }}>
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          <Icon icon="mdi:information-outline" size={18} />
          <Typography variant="body2" color="text.secondary">
            Los cambios aplican en la siguiente consulta operativa (título, resumen, etc.). Modelos globales (<code>modeloOperativo</code>) se heredan del fallback si no están en el JSON.
          </Typography>
        </Stack>
      </GlassInner>
    </GlassSection>
  );
}
