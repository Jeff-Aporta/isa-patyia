import { getReact, getMaterialUI } from "../core/runtime.ts";
import { getSnapshot, mergePartial } from "../core/urlState.ts";
import * as PromptsSql from "../api/promptsSql.ts";
import * as LabApi from "../api/labApi.ts";
import * as LabSession from "../api/sessionApi.ts";
import { ButtonIconify } from "../ui/iconify.jsx";
import { CodeMirrorPanel } from "../core/codeMirror.ts";
import { estimatePromptTokensFromCdn } from "../core/promptTokens.ts";
import { mdToHtml } from "../ui/shared.jsx";
import { toastWarning, toastSuccess, toastError, toastInfo, requestConfirm } from "../ui/notifications.jsx";

const { useState, useEffect, useCallback, useMemo, useRef } = getReact();
const {
  Paper, Typography, TextField, Stack, Alert, Chip, Box,
  Tabs, Tab, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, CircularProgress,
  Select, MenuItem, FormControl,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
} = getMaterialUI();

const ICON_BY_TIPO = {

  SALUDO_OTRO: "mdi:hand-wave",

  FUERA_DE_ALCANCE_TECNICO: "mdi:alert-circle-outline",

  SOLICITUD_NO_PERMITIDA: "mdi:cancel",

  REQUIERE_CONTEXTO: "mdi:help-circle-outline",

  PASO_A_PASO: "mdi:format-list-numbered",

  INTERPRETACION_RESULTADO: "mdi:chart-box-outline",

  CONSULTA_NORMATIVA_NEGOCIO: "mdi:gavel",

  ASESORIA_PERSONALIZADA: "mdi:account-tie",

  ERROR_TECNICO: "mdi:bug-outline",

  ERROR_CONFIGURACION: "mdi:cog-outline",

  ERROR_ACCESO: "mdi:lock-alert-outline",

  ERROR_DIAN: "mdi:file-document-alert-outline",

  COMERCIAL: "mdi:cash-multiple",

  GENERAL: "mdi:robot-outline",

  TDCONSULTA: "mdi:tag-multiple-outline",

  EXTRACTOR_CONSULTAS: "mdi:filter-outline",

  CLASIFICADOR_MODULO: "mdi:view-module-outline",

};



function isDraftPrompt(p) {
  if (!p) return false;
  return p.dirty || p.source === "url" || p.source === "editor" || p.source === "archivo";
}

function jconfigEqual(a, b) {
  if (!a || !b) return false;
  return a.model === b.model
    && Number(a.temperature) === Number(b.temperature)
    && Number(a.top_p) === Number(b.top_p);
}

function isConfigDirty(p) {
  if (!p?.configDirty) return false;
  if (!p.jconfigBaseline) return true;
  return !jconfigEqual(p.jconfig, p.jconfigBaseline);
}

function hasPendingChanges(p) {
  return isDraftPrompt(p) || isConfigDirty(p);
}

function MapeoRowDot({ tipo, prompts, row }) {
  const p = prompts[tipo];
  if (hasPendingChanges(p)) {
    return <span className="status-dot status-dot--inline status-dot--orange" title="Cambios pendientes de guardar" />;
  }
  const hasBody = Boolean(p?.body?.trim());
  if (!hasBody) {
    return <span className="status-dot status-dot--inline status-dot--gray" title="Sin contenido" />;
  }
  if (row.status === "tipo_desconocido") {
    return <span className="status-dot status-dot--inline status-dot--orange" title="Tipo no catalogado" />;
  }
  return <span className="status-dot status-dot--inline status-dot--green" title="Sincronizado" />;
}

function readFilesAsText(fileList) {
  return Promise.all(
    [...fileList].map(async (f) => ({
      name: f.name,
      content: await f.text(),
    })),
  );
}

function draftBodiesFromPrompts(prompts) {
  const bodies = {};
  for (const [tipo, p] of Object.entries(prompts)) {
    if (isDraftPrompt(p) && p?.body?.trim()) bodies[tipo] = p.body;
  }
  return bodies;
}

function draftTiposFromPrompts(prompts) {
  return Object.keys(draftBodiesFromPrompts(prompts));
}

function formatCharsTokens(body) {
  const text = String(body ?? "");
  if (!text.trim()) return "—";
  const chars = text.length;
  const tokens = estimatePromptTokensFromCdn(text);
  return (
    <>
      {chars}
      <span className="prompt-mapeo-metric-sep"> | </span>
      {tokens}
    </>
  );
}

function formatFmod(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "medium" });
  } catch {
    return String(iso);
  }
}

function jconfigView(jc, body) {
  const live = PromptsSql.syncJconfigMetrics(jc || PromptsSql.parseJconfig(null), body);
  return {
    provider: live.provider,
    model: live.model,
    temperature: live.temperature,
    top_p: live.top_p,
    chars: live.chars,
    tokens: live.tokens,
    author: live.author || null,
    fmod: live.fmod || null,
  };
}

function JconfigDetailDialog({ open, onClose, tipo, jc, body }) {
  const view = useMemo(() => jconfigView(jc, body), [jc, body]);
  const json = useMemo(() => JSON.stringify(view, null, 2), [view]);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, py: 1.5 }}>
        <iconify-icon icon="mdi:code-json" width="1.25em" height="1.25em" />
        <Box component="span" sx={{ fontWeight: 600 }}>JCONFIG · {tipo}</Box>
        <Box sx={{ flex: 1 }} />
        <ButtonIconify icon="mdi:close" title="Cerrar" onClick={onClose} />
      </DialogTitle>
      <DialogContent dividers className="custom-scrollbar">
        <div className="meta-grid">
          <div className="meta-row"><span className="meta-k">Author</span><span className="meta-v">{view.author || "—"}</span></div>
          <div className="meta-row"><span className="meta-k">Fmod</span><span className="meta-v">{formatFmod(view.fmod)}</span></div>
          <div className="meta-row"><span className="meta-k">Chars</span><span className="meta-v">{view.chars ?? "—"}</span></div>
          <div className="meta-row"><span className="meta-k">Tokens</span><span className="meta-v">{view.tokens ?? "—"}</span></div>
          <div className="meta-row"><span className="meta-k">Modelo</span><span className="meta-v"><code>{view.model}</code></span></div>
          <div className="meta-row"><span className="meta-k">Temp</span><span className="meta-v">{view.temperature}</span></div>
          <div className="meta-row"><span className="meta-k">Top_p</span><span className="meta-v">{view.top_p}</span></div>
          <div className="meta-row"><span className="meta-k">Provider</span><span className="meta-v"><code>{view.provider}</code></span></div>
        </div>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2, mb: 0.5 }}>
          JSON persistido en BD
        </Typography>
        <CodeMirrorPanel
          key={open ? `jconfig-${tipo}` : "jconfig-closed"}
          value={json}
          readOnly
          json
          minHeight="10rem"
          maxHeight="16rem"
          copyTitle="Copiar JCONFIG"
        />
      </DialogContent>
    </Dialog>
  );
}

function urlDraftTipoSet(bootPrompts) {
  const bodies = bootPrompts?.bodies || {};
  const listed = Array.isArray(bootPrompts?.draftTipos)
    ? bootPrompts.draftTipos.map((t) => String(t).toUpperCase()).filter(Boolean)
    : Object.keys(bodies).map((t) => String(t).toUpperCase());
  return new Set(listed);
}

function FileImportMapDialog({ open, onClose, rows, instructionKeys, onChangeRow, onConfirm }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, py: 1.5 }}>
        <iconify-icon icon="mdi:file-link-outline" width="1.25em" height="1.25em" />
        Confirmar importación
      </DialogTitle>
      <DialogContent dividers className="custom-scrollbar">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Relaciona cada archivo con la instrucción destino. La coincidencia automática usa el nombre
          {" "}(<code>PROMPT_*.md</code> / <code>.txt</code>) o una línea exacta{" "}
          <code>iinstruccion: CLAVE</code> en el contenido.
        </Typography>
        {rows.map((row, idx) => {
          const ambiguous = row.nameMatches.length > 1
            || row.contentMatches.length > 1
            || (row.nameMatches.length === 1 && row.contentMatches.length === 1 && row.nameMatches[0] !== row.contentMatches[0]);
          return (
            <Stack
              key={row.fileName}
              spacing={1}
              sx={{ mb: 2, pb: 2, borderBottom: "1px solid", borderColor: "divider" }}
            >
              <Typography variant="subtitle2" component="div">
                <code>{row.fileName}</code>
              </Typography>
              {row.suggested && !ambiguous && (
                <Chip
                  size="small"
                  variant="outlined"
                  color="primary"
                  label={`Sugerido: ${row.suggested}${row.matchSource ? ` (${row.matchSource})` : ""}`}
                />
              )}
              {ambiguous && (
                <Alert severity="warning" sx={{ py: 0.5 }}>
                  Coincidencias múltiples o contradictorias — elige la instrucción manualmente.
                </Alert>
              )}
              {!row.suggested && !ambiguous && (
                <Alert severity="info" sx={{ py: 0.5 }}>
                  Sin coincidencia exacta — selecciona la instrucción destino.
                </Alert>
              )}
              <FormControl size="small" fullWidth>
                <Select
                  value={row.selected || ""}
                  displayEmpty
                  onChange={(e) => onChangeRow(idx, e.target.value)}
                  MenuProps={{ disableScrollLock: true }}
                >
                  <MenuItem value="">
                    <em>No importar este archivo</em>
                  </MenuItem>
                  {instructionKeys.map((k) => {
                    const meta = PromptsSql.getInstructionMeta(k);
                    return (
                      <MenuItem key={k} value={k}>
                        {k} · {meta.ninstruccion}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Stack>
          );
        })}
      </DialogContent>
      <DialogActions sx={{ px: 2, py: 1.5 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={onConfirm}>Importar selección</Button>
      </DialogActions>
    </Dialog>
  );
}

function ensurePublishCap(onNeedLogin) {
  const cap = LabSession.instruccionesPublishCap();
  if (cap) return true;
  const reason = LabSession.blockReason("patyia.instrucciones.publish")
    || "Sin permiso para publicar instrucciones";
  toastWarning(reason);
  if (!LabSession.isLoggedIn()) onNeedLogin?.();
  return false;
}

const EMPTY_BODIES = Object.freeze({});

export function PromptsSqlTool({ bootPrompts = {}, onNeedLogin }) {
  const [authTick, setAuthTick] = useState(0);
  useEffect(() => {
    const onAuth = () => setAuthTick((n) => n + 1);
    window.addEventListener("isa-patyia:auth", onAuth);
    return () => window.removeEventListener("isa-patyia:auth", onAuth);
  }, []);

  const canPublish = useMemo(() => Boolean(LabSession.instruccionesPublishCap()), [authTick]);
  const loggedIn = useMemo(() => LabSession.isLoggedIn(), [authTick]);
  const canEdit = canPublish;
  const editBlockReason = useMemo(() => {
    if (canEdit) return "";
    if (!loggedIn) return "Inicia sesión para editar instrucciones";
    return LabSession.blockReason("patyia.instrucciones.publish")
      || "Sin permiso para editar instrucciones";
  }, [authTick, canEdit, loggedIn]);
  const saveTitle = useMemo(() => {
    if (canPublish) return "Guardar instrucciones y configuración en Paty (MSSQL)";
    return LabSession.blockReason("patyia.instrucciones.publish")
      || "Sin permiso para guardar en Paty";
  }, [authTick, canPublish]);
  const [extraInstructionKeys, setExtraInstructionKeys] = useState([]);
  const instruccionKeys = useMemo(
    () => PromptsSql.allInstructionKeys(extraInstructionKeys),
    [extraInstructionKeys],
  );

  const [importDlg, setImportDlg] = useState({ open: false, rows: [] });

  const urlBodies = bootPrompts.bodies ?? EMPTY_BODIES;
  const urlDraftTipos = useMemo(() => urlDraftTipoSet(bootPrompts), [bootPrompts]);

  const [prompts, setPrompts] = useState(() => {

    const base = PromptsSql.emptyPromptState();

    for (const [tipo, body] of Object.entries(urlBodies)) {

      if (!urlDraftTipoSet(bootPrompts).has(String(tipo).toUpperCase())) continue;

      const key = String(tipo).toUpperCase();
      if (!base[key] && !String(body).trim()) continue;
      if (!base[key]) base[key] = PromptsSql.createPromptSlot(key);

      if (!String(body).trim()) continue;

      base[key] = { ...base[key], body: String(body), dirty: true, source: "url" };

    }

    return base;

  });

  const [activeTab, setActiveTab] = useState(

    Number.isInteger(bootPrompts.activeTab) ? bootPrompts.activeTab : 0,

  );

  const [previewOpen, setPreviewOpen] = useState(false);

  const [jconfigDlg, setJconfigDlg] = useState({ open: false, tipo: null });

  const [dragOver, setDragOver] = useState(false);

  const [mapped, setMapped] = useState([]);

  const [loadBusy, setLoadBusy] = useState(true);

  const [loadErr, setLoadErr] = useState("");

  const [actionBusy, setActionBusy] = useState(false);

  const [envRev, setEnvRev] = useState(0);

  const urlSyncRef = useRef(null);

  const applyCloudRows = useCallback((rows, { onlyTipo = null, onlyTipos = null, ignoreUrl = false } = {}) => {
    const scope = onlyTipos?.length
      ? new Set(onlyTipos.map((t) => String(t).toUpperCase()))
      : onlyTipo
        ? new Set([String(onlyTipo).toUpperCase()])
        : null;
    const unknownKeys = [];
    setPrompts((prev) => {
      const next = { ...prev };
      const touched = new Set();
      for (const row of rows) {
        const tipo = String(LabApi.rowVal(row, "IINSTRUCCION") ?? "").trim().toUpperCase();
        if (!tipo) continue;
        if (!next[tipo]) {
          unknownKeys.push(tipo);
          next[tipo] = PromptsSql.createPromptSlot(tipo);
        }
        const body = String(LabApi.rowVal(row, "INSTRUCCION") ?? LabApi.rowVal(row, "instruccion") ?? "").trim();
        const rawJconfig = LabApi.rowVal(row, "JCONFIG") ?? LabApi.rowVal(row, "jconfig");
        const jconfig = PromptsSql.syncJconfigMetrics(
          rawJconfig && typeof rawJconfig === "object" && !Array.isArray(rawJconfig)
            ? rawJconfig
            : PromptsSql.parseJconfig(rawJconfig),
          body,
        );
        if (scope && !scope.has(tipo)) continue;
        touched.add(tipo);
        const urlBody = ignoreUrl ? "" : urlBodies[tipo]?.trim();
        const urlIsDraft = !ignoreUrl && urlDraftTipos.has(tipo) && Boolean(urlBody);
        const basePatch = { jconfig, jconfigBaseline: { ...jconfig }, configDirty: false };
        if (urlIsDraft) {
          if (body && urlBody === body) {
            next[tipo] = { ...next[tipo], ...basePatch, body, dirty: false, source: "bd" };
          } else {
            next[tipo] = { ...next[tipo], ...basePatch, body: urlBody, dirty: true, source: "url" };
          }
        } else {
          next[tipo] = {
            ...next[tipo],
            ...basePatch,
            ...(body ? { body, dirty: false, source: "bd" } : {}),
          };
        }
      }
      if (ignoreUrl && scope) {
        for (const tipo of scope) {
          if (!next[tipo] || touched.has(tipo)) continue;
          next[tipo] = { ...next[tipo], body: "", dirty: false, source: "bd" };
        }
      }
      return next;
    });
    if (unknownKeys.length) {
      setExtraInstructionKeys((prev) => {
        const merged = new Set([...prev, ...unknownKeys]);
        return [...merged].sort((a, b) => a.localeCompare(b));
      });
    }
  }, [urlBodies, urlDraftTipos]);

  const clearUrlBodies = useCallback((instruccionKeysToClear) => {
    const snap = getSnapshot();
    const bodies = { ...(snap.prompts?.bodies || {}) };
    const draftTipos = (snap.prompts?.draftTipos || [])
      .map((t) => String(t).toUpperCase())
      .filter((t) => !instruccionKeysToClear.map((x) => String(x).toUpperCase()).includes(t));
    for (const t of instruccionKeysToClear) delete bodies[t];
    mergePartial({ prompts: { activeTab, bodies, draftTipos } });
  }, [activeTab]);



  useEffect(() => {

    const onTarget = () => setEnvRev((n) => n + 1);

    window.addEventListener("jeff:gateway-target", onTarget);
    window.addEventListener("patyia-apptools:lab-target", onTarget);
    return () => {
      window.removeEventListener("jeff:gateway-target", onTarget);
      window.removeEventListener("patyia-apptools:lab-target", onTarget);
    };

  }, []);



  const activeTipo = instruccionKeys[activeTab] || instruccionKeys[0];

  const activePrompt = prompts[activeTipo];
  const previewHtml = useMemo(
    () => mdToHtml(activePrompt?.body || ""),
    [activePrompt?.body],
  );



  const recompute = useCallback((state) => {

    const entries = Object.values(state).filter((p) => p.body?.trim() || isConfigDirty(p));

    const { mapped: m, error } = PromptsSql.analyzeFromEntries(entries);

    setMapped(m);

    return error;

  }, []);



  useEffect(() => {

    recompute(prompts);

  }, [prompts, recompute]);



  const applyCloudRowsRef = useRef(applyCloudRows);
  applyCloudRowsRef.current = applyCloudRows;

  useEffect(() => {

    let cancelled = false;

    (async () => {

      setLoadBusy(true);

      setLoadErr("");

      try {

        const rows = await LabApi.fetchInstruccionesPaty();

        if (cancelled) return;

        applyCloudRowsRef.current(rows);

      } catch (e) {

        if (!cancelled) {
          const msg = e instanceof Error ? e.message : String(e);
          setLoadErr(msg);
          toastWarning(`Carga de instrucciones: ${msg}`);
        }

      } finally {

        if (!cancelled) setLoadBusy(false);

      }

    })();

    return () => { cancelled = true; };

  }, [envRev]);



  const pendingTipos = useMemo(
    () => instruccionKeys.filter((t) => {
      const p = prompts[t];
      if (!p?.body?.trim()) return false;
      return isDraftPrompt(p) || isConfigDirty(p);
    }),
    [prompts, instruccionKeys],
  );

  const hasLocalChanges = useMemo(
    () => instruccionKeys.some((t) => hasPendingChanges(prompts[t])),
    [prompts, instruccionKeys],
  );

  const modelSelectOptions = useMemo(
    () => PromptsSql.mergeModelOptions(
      ...instruccionKeys.map((t) => prompts[t]?.jconfig?.model),
      ...instruccionKeys.map((t) => prompts[t]?.jconfigBaseline?.model),
    ),
    [prompts, instruccionKeys],
  );

  const discardAll = useCallback(async () => {
    const toReset = instruccionKeys.filter((t) => hasPendingChanges(prompts[t]));
    if (!toReset.length) {
      toastInfo("No hay cambios locales que descartar");
      return;
    }
    setActionBusy(true);
    setLoadErr("");
    try {
      const rows = await LabApi.fetchInstruccionesPaty();
      applyCloudRows(rows, { onlyTipos: toReset, ignoreUrl: true });
      clearUrlBodies(toReset);
      toastInfo(`${toReset.length} instrucción(es) restaurada(s) desde la base`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setLoadErr(msg);
      toastError(msg);
    } finally {
      setActionBusy(false);
    }
  }, [applyCloudRows, clearUrlBodies, prompts, instruccionKeys]);

  const saveAll = useCallback(async () => {
    if (!pendingTipos.length) {
      toastWarning("No hay cambios pendientes para guardar");
      return;
    }
    if (!ensurePublishCap(onNeedLogin)) return;
    const session = LabSession.getSession();
    const author = session?.username || "";
    const entries = pendingTipos.map((t) => ({
      archivo: prompts[t].archivo,
      iinstruccion: t,
      tipo: t,
      body: prompts[t].body || "",
      source: prompts[t].source,
      jconfig: PromptsSql.enrichJconfigForSave(prompts[t].jconfig, {
        body: prompts[t].body,
        author,
      }),
    }));
    const { sqlMssql, error } = PromptsSql.analyzeFromEntries(entries);
    if (error || !sqlMssql?.trim()) {
      toastError(error || "No se pudo generar SQL");
      return;
    }
    setActionBusy(true);
    setLoadErr("");
    try {
      await LabApi.publishInstruccionesPaty(sqlMssql);
      const savedTipos = [...pendingTipos];
      clearUrlBodies(savedTipos);
      const rows = await LabApi.fetchInstruccionesPaty();
      applyCloudRows(rows, { onlyTipos: savedTipos, ignoreUrl: true });
      toastSuccess(`${savedTipos.length} instrucción(es) guardada(s) en Paty`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setLoadErr(msg);
      if (e?.code === "FORBIDDEN" || e?.code === "NO_SESSION") {
        LabSession.handleApiError(e, LabSession.instruccionesPublishCap() || "patyia.instrucciones.publish");
      } else if (/permiso|autoriz|403|503|verify-access/i.test(msg)) {
        toastWarning(LabSession.humanPermissionError(e, LabSession.instruccionesPublishCap() || "patyia.instrucciones.publish"));
      } else {
        toastError(msg);
      }
    } finally {
      setActionBusy(false);
    }
  }, [applyCloudRows, clearUrlBodies, pendingTipos, onNeedLogin, prompts]);



  useEffect(() => {

    mergePartial({ prompts: { activeTab } });

  }, [activeTab]);



  useEffect(() => {

    if (urlSyncRef.current) clearTimeout(urlSyncRef.current);

    urlSyncRef.current = setTimeout(() => {

      const bodies = draftBodiesFromPrompts(prompts);
      mergePartial({
        prompts: { activeTab, bodies, draftTipos: Object.keys(bodies) },
      });

    }, 500);

    return () => {

      if (urlSyncRef.current) clearTimeout(urlSyncRef.current);

    };

  }, [prompts, activeTab]);



  const filledCount = useMemo(
    () => instruccionKeys.filter((k) => prompts[k]?.body?.trim()).length,
    [prompts, instruccionKeys],
  );

  const onImportRowChange = useCallback((idx, selected) => {
    setImportDlg((d) => {
      const rows = d.rows.map((row, i) => (i === idx ? { ...row, selected } : row));
      return { ...d, rows };
    });
  }, []);

  const confirmFileImport = useCallback(() => {
    const updates = PromptsSql.applyFileImportSelections(importDlg.rows);
    const keys = Object.keys(updates);
    if (!keys.length) {
      toastWarning("Selecciona al menos una instrucción destino");
      return;
    }
    setPrompts((prev) => {
      const next = { ...prev };
      for (const [key, data] of Object.entries(updates)) {
        if (!next[key]) next[key] = PromptsSql.createPromptSlot(key);
        next[key] = {
          ...next[key],
          ...data,
          jconfig: PromptsSql.syncJconfigMetrics(next[key].jconfig, data.body),
        };
      }
      return next;
    });
    const first = keys[0];
    const idx = instruccionKeys.indexOf(first);
    if (idx >= 0) setActiveTab(idx);
    setImportDlg({ open: false, rows: [] });
    toastSuccess(`${keys.length} instrucción(es) importada(s)`);
  }, [importDlg.rows, instruccionKeys]);

  const applyFiles = useCallback(async (fileList) => {
    const files = await readFilesAsText(fileList);
    if (!files.length) return;
    const rows = PromptsSql.prepareFileImportRows(files).filter((r) => /^PROMPT_/i.test(r.fileName));
    if (!rows.length) {
      toastWarning("Ningún PROMPT_*.md / PROMPT_*.txt reconocido en los archivos");
      return;
    }
    setImportDlg({ open: true, rows });
  }, []);



  const onDrop = useCallback(async (e) => {

    e.preventDefault();

    setDragOver(false);

    const dt = e.dataTransfer;

    if (!dt?.files?.length) return;

    await applyFiles(dt.files);

  }, [applyFiles]);



  const onFileInput = useCallback(async (e) => {

    if (e.target.files?.length) await applyFiles(e.target.files);

    e.target.value = "";

  }, [applyFiles]);



  const updateBody = useCallback((tipo, body) => {
    setPrompts((prev) => ({
      ...prev,
      [tipo]: {
        ...prev[tipo],
        body,
        dirty: true,
        source: "editor",
        jconfig: PromptsSql.syncJconfigMetrics(prev[tipo].jconfig, body),
      },
    }));
  }, []);

  const updateConfig = useCallback((tipo, patch) => {
    setPrompts((prev) => ({
      ...prev,
      [tipo]: {
        ...prev[tipo],
        jconfig: { ...prev[tipo].jconfig, ...patch },
        configDirty: true,
      },
    }));
  }, []);

  const resetConfigToDefaults = useCallback((tipo) => {
    const defaults = { ...PromptsSql.DEFAULT_JCONFIG };
    setPrompts((prev) => {
      const current = prev[tipo];
      if (!current) return prev;
      const nextJconfig = PromptsSql.syncJconfigMetrics(
        { ...defaults, author: current.jconfig?.author, fmod: current.jconfig?.fmod },
        current.body,
      );
      if (jconfigEqual(current.jconfig, nextJconfig)) return prev;
      const baseline = current.jconfigBaseline;
      return {
        ...prev,
        [tipo]: {
          ...current,
          jconfig: nextJconfig,
          configDirty: baseline ? !jconfigEqual(nextJconfig, baseline) : false,
        },
      };
    });
  }, []);

  const confirmResetConfig = useCallback(async (tipo) => {
    const jc = prompts[tipo]?.jconfig || PromptsSql.parseJconfig(null);
    const d = PromptsSql.DEFAULT_JCONFIG;
    const ok = await requestConfirm({
      title: "Restablecer configuración",
      message: [
        `¿Restablecer modelo, temperatura y top_p de ${tipo.replace(/_/g, " ")}?`,
        "",
        `Modelo: ${jc.model ?? d.model} → ${d.model}`,
        `Temp: ${jc.temperature ?? d.temperature} → ${d.temperature}`,
        `Top_p: ${jc.top_p ?? d.top_p} → ${d.top_p}`,
      ].join("\n"),
      confirmLabel: "Restablecer",
      cancelLabel: "Cancelar",
    });
    if (ok) resetConfigToDefaults(tipo);
  }, [prompts, resetConfigToDefaults]);

  const clampUnitInterval = (raw, fallback) => {
    if (raw === "" || raw == null) return fallback;
    const n = Number(raw);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(1, Math.max(0, n));
  };

  const UNIT_STEP = 0.1;

  const bumpUnitInterval = (current, delta, fallback) => {
    const base = clampUnitInterval(current, fallback);
    const next = Math.round((base + delta) * 10) / 10;
    return clampUnitInterval(next, fallback);
  };

  const unitIntervalFieldProps = (value, fallback, onValue) => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        onValue(bumpUnitInterval(value, UNIT_STEP, fallback));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        onValue(bumpUnitInterval(value, -UNIT_STEP, fallback));
      }
    };
    const handleWheel = (e) => {
      e.preventDefault();
      onValue(bumpUnitInterval(value, e.deltaY < 0 ? UNIT_STEP : -UNIT_STEP, fallback));
    };
    const handleChange = (e) => {
      const prev = clampUnitInterval(value, fallback);
      const next = clampUnitInterval(e.target.value, fallback);
      const diff = Math.round((next - prev) * 10) / 10;
      const inputType = e.nativeEvent?.inputType;
      if (!inputType && Math.abs(Math.abs(diff) - 1) < 0.001) {
        onValue(bumpUnitInterval(value, diff > 0 ? UNIT_STEP : -UNIT_STEP, fallback));
        return;
      }
      onValue(next);
    };
    return {
      size: "small",
      variant: "outlined",
      type: "number",
      value: value ?? fallback,
      slotProps: {
        htmlInput: {
          step: "0.1",
          min: "0",
          max: "1",
          style: { fontSize: "0.72rem", width: "4.5rem" },
          onKeyDown: handleKeyDown,
          onWheel: handleWheel,
        },
      },
      onChange: handleChange,
    };
  };



  return (

    <div className="tool-grid tool-grid-prompts tool-grid-prompts--solo">

      <Paper className="tool-panel scroll-panel" elevation={0}>

        <div className="panel-head">

          <Typography variant="subtitle1" fontWeight={600}>Instrucciones · mapeo</Typography>

          <Stack direction="row" spacing={0.5} alignItems="center">

            {loadBusy && <CircularProgress size={14} />}

            <Chip size="small" label={`${filledCount}/${instruccionKeys.length}`} color={filledCount ? "primary" : "default"} variant="outlined" />

            <ButtonIconify
              variant="primary"
              icon="mdi:content-save"
              label={actionBusy ? "Guardando…" : "Guardar"}
              title={saveTitle}
              onClick={saveAll}
              disabled={actionBusy || loadBusy || !pendingTipos.length || !canPublish}
              busy={actionBusy}
            />
            <ButtonIconify
              icon="mdi:delete-outline"
              label="Descartar"
              title="Descartar todos los borradores y restaurar desde la base"
              onClick={discardAll}
              disabled={actionBusy || loadBusy || !hasLocalChanges}
            />

          </Stack>

        </div>

        <div className="panel-body panel-body-tabs custom-scrollbar">

          {loadErr && <Alert severity="warning" sx={{ mb: 1 }}>{loadErr}</Alert>}

          <div className="prompt-instrucciones-zone">

          <div

            className={`drop-zone${dragOver ? " drop-zone--active" : ""}`}

            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}

            onDragLeave={() => setDragOver(false)}

            onDrop={onDrop}

          >

            <iconify-icon icon="mdi:file-upload-outline" width="1.6em" height="1.6em" />

            <span>Arrastra <code>PROMPT_*.md</code> o <code>PROMPT_*.txt</code> aquí</span>

            <label className="drop-zone-file-btn" title="Seleccionar archivos PROMPT_*.md / .txt">

              <ButtonIconify icon="mdi:folder-open-outline" title="Seleccionar archivos" />

              <input type="file" accept=".md,.txt,text/markdown,text/plain" multiple hidden onChange={onFileInput} />

            </label>

            <Typography variant="caption" color="text.secondary">

              Carga desde la base de instrucciones.

            </Typography>

          </div>



          <div className="prompt-tabs-layout">

          <Tabs

            value={activeTab}

            onChange={(_, v) => setActiveTab(v)}

            orientation="vertical"

            variant="scrollable"

            scrollButtons="auto"

            className="prompt-tabs prompt-tabs--vertical"

          >

            {instruccionKeys.map((tipo) => {

              const p = prompts[tipo];

              const has = Boolean(p?.body?.trim());

              const dirty = hasPendingChanges(p);

              return (

                <Tab

                  key={tipo}

                  label={(

                    <span className="tab-label">

                      <iconify-icon icon={ICON_BY_TIPO[tipo] || "mdi:file-document-outline"} width="0.9em" height="0.9em" />

                      <span>{tipo.replace(/_/g, " ")}</span>

                      {has && <span className={`tab-dot${dirty ? " tab-dot--dirty" : ""}`} />}

                    </span>

                  )}

                />

              );

            })}

          </Tabs>



          <div className="tab-editor">

            <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end" className="tab-editor-head" sx={{ mb: 0.5 }}>

              <ButtonIconify
                icon="mdi:markdown-outline"
                label="Vista previa"
                title="Abrir markdown formateado a pantalla completa"
                onClick={() => setPreviewOpen(true)}
                disabled={!activePrompt?.body?.trim()}
              />

            </Stack>

            <TextField

              multiline

              fullWidth

              minRows={10}

              disabled={!canEdit}

              title={!canEdit ? editBlockReason : undefined}

              placeholder={`Contenido de ${activePrompt?.archivo || `PROMPT_${activeTipo}.md`}…`}

              value={activePrompt?.body || ""}

              onChange={(e) => updateBody(activeTipo, e.target.value)}

              inputProps={{

                spellCheck: false,

                style: { fontFamily: "ui-monospace, Consolas, monospace", fontSize: "0.78rem", lineHeight: 1.45 },

              }}

            />

          </div>

          </div>

          </div>

          <div className="prompt-mapeo-block">

            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: "block", mb: 0.5 }}>

              Mapeo

            </Typography>

            <TableContainer className="prompt-mapeo-scroll custom-scrollbar">

              <Table size="small" stickyHeader>

                <TableHead>

                  <TableRow>

                    <TableCell>Instrucción</TableCell>

                    <TableCell>Chars | Tokens</TableCell>

                    <TableCell>Modelo</TableCell>

                    <TableCell>Temp</TableCell>

                    <TableCell>Top_p</TableCell>

                    <TableCell align="center">Actions</TableCell>

                  </TableRow>

                </TableHead>

                <TableBody>

                  {instruccionKeys.map((tipo) => {

                    const p = prompts[tipo];
                    const jc = p?.jconfig || PromptsSql.parseJconfig(null);
                    const modelValue = String(jc.model ?? "").trim() || PromptsSql.DEFAULT_JCONFIG.model;
                    const row = mapped.find((r) => r.tipo === tipo) || {

                      tipo,

                      archivo: `PROMPT_${tipo}.md`,

                      chars: (p?.body || "").length,

                      status: p?.body?.trim() ? "ok" : "sin_mapeo",

                    };

                    const stopRowClick = (e) => e.stopPropagation();
                    const atDefaultConfig = jconfigEqual(jc, PromptsSql.DEFAULT_JCONFIG);

                    return (

                      <TableRow

                        key={tipo}

                        hover

                        selected={tipo === activeTipo}

                        onClick={() => setActiveTab(instruccionKeys.indexOf(tipo))}

                        sx={{ cursor: "pointer" }}

                      >

                        <TableCell>
                          <span className="prompt-mapeo-tipo">
                            <MapeoRowDot tipo={tipo} prompts={prompts} row={row} />
                            <code>{tipo}</code>
                          </span>
                        </TableCell>

                        <TableCell className="prompt-mapeo-metric">
                          {formatCharsTokens(p?.body)}
                        </TableCell>

                        <TableCell onClick={stopRowClick}>
                          <FormControl size="small" sx={{ minWidth: 148 }} onClick={stopRowClick} disabled={!canEdit}>
                            <Select
                              value={modelValue}
                              onChange={(e) => updateConfig(tipo, { model: e.target.value })}
                              disabled={!canEdit}
                              MenuProps={{ disableScrollLock: true }}
                              sx={{ fontSize: "0.72rem", "& .MuiSelect-select": { py: 0.35, px: 0.6 } }}
                            >
                              {modelSelectOptions.map((id) => (
                                <MenuItem key={id} value={id} sx={{ fontSize: "0.72rem" }}>{id}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>

                        <TableCell onClick={stopRowClick}>
                          <TextField
                            {...unitIntervalFieldProps(
                              jc.temperature,
                              PromptsSql.DEFAULT_JCONFIG.temperature,
                              (v) => updateConfig(tipo, { temperature: v }),
                            )}
                            disabled={!canEdit}
                          />
                        </TableCell>

                        <TableCell onClick={stopRowClick}>
                          <TextField
                            {...unitIntervalFieldProps(
                              jc.top_p,
                              PromptsSql.DEFAULT_JCONFIG.top_p,
                              (v) => updateConfig(tipo, { top_p: v }),
                            )}
                            disabled={!canEdit}
                          />
                        </TableCell>

                        <TableCell align="center" className="prompt-mapeo-actions" onClick={stopRowClick}>
                          <Stack direction="row" spacing={0.25} justifyContent="center" useFlexGap>
                            <ButtonIconify
                              icon="mdi:code-json"
                              title="Ver JCONFIG (author, fmod, chars, tokens…)"
                              onClick={() => setJconfigDlg({ open: true, tipo })}
                            />
                            {loggedIn && (
                              <ButtonIconify
                                icon="mdi:backup-restore"
                                title={`Restablecer modelo (${PromptsSql.DEFAULT_JCONFIG.model}), temp (${PromptsSql.DEFAULT_JCONFIG.temperature}) y top_p (${PromptsSql.DEFAULT_JCONFIG.top_p})`}
                                onClick={() => confirmResetConfig(tipo)}
                                disabled={!canEdit || atDefaultConfig}
                              />
                            )}
                          </Stack>
                        </TableCell>

                      </TableRow>

                    );

                  })}

                </TableBody>

              </Table>

            </TableContainer>

          </div>



        </div>

      </Paper>

      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        fullScreen
        scroll="paper"
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, py: 1.5 }}>
          <iconify-icon icon="mdi:markdown-outline" width="1.25em" height="1.25em" />
          <Box component="span" sx={{ fontWeight: 600 }}>{activeTipo.replace(/_/g, " ")}</Box>
          <Box sx={{ flex: 1 }} />
          <ButtonIconify icon="mdi:close" title="Cerrar vista previa" onClick={() => setPreviewOpen(false)} />
        </DialogTitle>
        <DialogContent dividers className="prompt-md-dialog custom-scrollbar">
          {activePrompt?.body?.trim() ? (
            <div
              className="prompt-md-preview msg-body"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          ) : (
            <Alert severity="info">Sin contenido para previsualizar.</Alert>
          )}
        </DialogContent>
      </Dialog>

      <FileImportMapDialog
        open={importDlg.open}
        onClose={() => setImportDlg({ open: false, rows: [] })}
        rows={importDlg.rows}
        instructionKeys={instruccionKeys}
        onChangeRow={onImportRowChange}
        onConfirm={confirmFileImport}
      />

      <JconfigDetailDialog
        open={jconfigDlg.open}
        onClose={() => setJconfigDlg({ open: false, tipo: null })}
        tipo={jconfigDlg.tipo}
        jc={jconfigDlg.tipo ? prompts[jconfigDlg.tipo]?.jconfig : null}
        body={jconfigDlg.tipo ? prompts[jconfigDlg.tipo]?.body : ""}
      />

    </div>

  );

}

