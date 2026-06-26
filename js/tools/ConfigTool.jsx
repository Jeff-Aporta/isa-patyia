import { getMaterialUI, getReact, UI, getGlass } from "../core/platform.ts";
import { ButtonIconify } from "../ui/shared.jsx";
import { fetchOpenAiSystemConfig, putOpenAiSystemConfig } from "../api/systemConfigApi.ts";
import { loadPatyJwt } from "../core/patyia-jwt.ts";
import { toastError, toastSuccess } from "../core/platform.ts";
import { PermisosPanel } from "./PermisosPanel.jsx";

const { useState, useEffect, useCallback } = getReact();
const { Paper, Typography, TextField, Stack, Alert, CircularProgress, Tabs, Tab, Box, Chip, Slider } = getMaterialUI();
const { Icon } = UI;

const MIN = 1;
const MAX = 50;

export function ConfigTool({ onNeedLogin }) {
  const [tab, setTab] = useState("openai");
  return (
    <div className="tool-grid tool-grid-config isa-tool-surface">
      <Paper className="tool-panel scroll-panel config-tool-panel" elevation={0}>
        <div className="panel-head config-tool-head" style={{ paddingBottom: 0 }}>
          <Tabs value={tab} onChange={(_e, v) => setTab(v)} variant="scrollable" scrollButtons="auto" className="config-tool-tabs">
            <Tab value="openai" label="OpenAI" icon={<Icon icon="mdi:openai" size={16} />} iconPosition="start" />
            <Tab value="permisos" label="Permisos" icon={<Icon icon="mdi:shield-key-outline" size={16} />} iconPosition="start" />
          </Tabs>
        </div>
        {tab === "permisos" ? <PermisosPanel /> : <OpenAiConfigBody onNeedLogin={onNeedLogin} />}
      </Paper>
    </div>
  );
}

function OpenAiConfigBody({ onNeedLogin }) {
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
    <div className="panel-body config-panel-body custom-scrollbar">
      <Box className="config-panel-inner">
        {err ? <Alert severity="warning" className="config-panel-alert" sx={{ mb: 2 }}>{err}</Alert> : null}

        <GlassSection
          title="File Search"
          accent={accent}
          className="config-openai-section isa-neon-accent-stripe"
          sx={{ "--stripe-accent": accent, maxWidth: 640 }}
          icon={<Icon icon="mdi:file-search-outline" size={18} />}
        >
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.65 }}>
            Parámetro <code>max_num_results</code> en <code>dbo.SYSTEM</code> (clave <code>openai</code>).
            Limita cuántos fragmentos devuelve <code>file_search</code> por turno de chat.
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            <Chip
              size="small"
              className="isa-neon-glass-chip"
              icon={<Icon icon={canEdit ? "mdi:pencil-outline" : "mdi:eye-outline"} size={14} />}
              label={canEdit ? "Edición habilitada" : "Solo lectura"}
            />
            <Chip
              size="small"
              className="isa-neon-glass-chip"
              icon={<Icon icon="mdi:content-save-check-outline" size={14} />}
              label={`Activo: ${saved}`}
              variant={dirty ? "outlined" : "filled"}
            />
            {!canEdit ? (
              <Chip size="small" className="config-openai-role-chip" label="admn_prompts · dev_lead" />
            ) : null}
          </Stack>

          <GlassPanel tone="blue" className="config-openai-control" sx={{ position: "relative", overflow: "hidden" }}>
            {loading ? (
              <Box className="config-openai-control__loading">
                <CircularProgress size={28} />
              </Box>
            ) : null}

            <Box className="config-openai-control__head">
              <Box>
                <Typography component="span" className="isa-neon-section-label config-openai-control__label">
                  <Icon icon="mdi:tune-variant" size={14} />
                  Fragmentos por turno
                </Typography>
                <Typography component="div" className="config-openai-value" aria-live="polite">
                  {num}
                </Typography>
              </Box>
              <TextField
                className="config-openai-input"
                label="max_num_results"
                type="number"
                size="small"
                value={value}
                disabled={loading || saving || !canEdit}
                onChange={(e) => setValue(e.target.value)}
                slotProps={{ htmlInput: { min: MIN, max: MAX, step: 1 } }}
              />
            </Box>

            <Slider
              className="config-openai-slider"
              value={num}
              min={MIN}
              max={MAX}
              step={1}
              disabled={loading || saving || !canEdit}
              onChange={(_e, v) => setValue(String(v))}
              marks={[
                { value: MIN, label: String(MIN) },
                { value: 8, label: "8" },
                { value: 16, label: "16" },
                { value: 32, label: "32" },
                { value: MAX, label: String(MAX) },
              ]}
              valueLabelDisplay="auto"
            />

            <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end" className="config-openai-actions">
              <ButtonIconify icon="mdi:refresh" title="Recargar" onClick={load} disabled={loading || saving} />
              <ButtonIconify
                variant="primary"
                icon="mdi:content-save-outline"
                title="Guardar en SYSTEM"
                label="Guardar"
                onClick={save}
                disabled={loading || saving || !dirty}
                busy={saving}
              />
            </Stack>
          </GlassPanel>

          <Stack spacing={1.25} sx={{ mt: 2.5 }}>
            <GlassInner tone="chip" className="config-openai-hint">
              <Stack direction="row" spacing={1.25} alignItems="flex-start">
                <Icon icon="mdi:database-outline" size={18} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.35 }}>Persistencia</Typography>
                  <Typography variant="body2" color="text.secondary">
                    El valor se guarda en SQL Server y aplica en el siguiente turno de chat con file search activo.
                  </Typography>
                </Box>
              </Stack>
            </GlassInner>
            {!canEdit ? (
              <GlassInner tone="warn" className="config-openai-hint">
                <Stack direction="row" spacing={1.25} alignItems="flex-start">
                  <Icon icon="mdi:lock-outline" size={18} />
                  <Typography variant="body2" color="text.secondary">
                    Para modificar este valor necesitas rol <code>admn_prompts</code> o <code>dev_lead</code> en <code>USR_PERMISSIONS</code>.
                  </Typography>
                </Stack>
              </GlassInner>
            ) : null}
          </Stack>
        </GlassSection>
      </Box>
    </div>
  );
}
