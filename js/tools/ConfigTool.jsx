import { getMaterialUI, getReact } from "../core/platform.ts";
import { ButtonIconify } from "../ui/shared.jsx";
import { fetchOpenAiSystemConfig, putOpenAiSystemConfig } from "../api/systemConfigApi.ts";
import { loadPatyJwt } from "../core/patyia-jwt.ts";
import { toastError, toastSuccess } from "../core/platform.ts";
import { PermisosPanel } from "./PermisosPanel.jsx";

const { useState, useEffect, useCallback } = getReact();
const { Paper, Typography, TextField, Stack, Alert, CircularProgress, Tabs, Tab } = getMaterialUI();

const MIN = 1;
const MAX = 50;

export function ConfigTool({ onNeedLogin }) {
  const [tab, setTab] = useState("openai");
  return (
    <div className="tool-grid tool-grid-config isa-tool-surface">
      <Paper className="tool-panel scroll-panel" elevation={0}>
        <div className="panel-head" style={{ paddingBottom: 0 }}>
          <Tabs value={tab} onChange={(_e, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
            <Tab value="openai" label="OpenAI" />
            <Tab value="permisos" label="Permisos" />
          </Tabs>
        </div>
        {tab === "permisos" ? <PermisosPanel /> : <OpenAiConfigBody onNeedLogin={onNeedLogin} />}
      </Paper>
    </div>
  );
}

function OpenAiConfigBody({ onNeedLogin }) {
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

  return (
    <div className="panel-body custom-scrollbar" style={{ padding: "1rem" }}>
      {err ? <Alert severity="warning" sx={{ mb: 1 }}>{err}</Alert> : null}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Parámetros en <code>dbo.SYSTEM</code> (clave <code>openai</code>).{" "}
        <code>max_num_results</code> limita fragmentos de <code>file_search</code> por turno de chat.
        {!canEdit ? <> Solo <code>admn_prompts</code> y <code>dev_lead</code> pueden editar.</> : null}
      </Typography>
      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
        <TextField label="max_num_results" type="number" size="small" value={value} disabled={loading || saving || !canEdit} onChange={(e) => setValue(e.target.value)} inputProps={{ min: MIN, max: MAX, step: 1 }} sx={{ width: 168 }} />
        {loading ? <CircularProgress size={20} /> : null}
        <ButtonIconify icon="mdi:content-save-outline" title="Guardar en SYSTEM" label="Guardar" onClick={save} disabled={loading || saving || !dirty} busy={saving} />
        <ButtonIconify icon="mdi:refresh" title="Recargar" onClick={load} disabled={loading || saving} />
      </Stack>
    </div>
  );
}
