import { getReact, getMaterialUI } from "../core/runtime.ts";
import { getSnapshot, mergePartial } from "../core/urlState.ts";
import * as PromptsSql from "../api/promptsSql.ts";
import * as LabApi from "../api/labApi.ts";
import * as LabSession from "../api/labSession.ts";
import { ButtonIconify } from "../ui/iconify.jsx";
import { mdToHtml } from "../ui/shared.jsx";
import { toastWarning, toastSuccess, toastError, toastInfo } from "../ui/notifications.jsx";

const { useState, useEffect, useCallback, useMemo, useRef } = getReact();
const {
  Paper, Typography, TextField, Stack, Alert, Chip, Box,
  Tabs, Tab, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, CircularProgress,
  Select, MenuItem, FormControl,
  Dialog, DialogTitle, DialogContent,
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

function estimatePromptTokensFromCdn(text) {
  const fn = window.ISAFront?.estimatePromptTokens;
  if (typeof fn === "function") return fn(text);
  const s = String(text ?? "");
  return s.trim() ? Math.ceil(s.length / 4) : 0;
}

function formatCharsTokens(body) {
  const text = String(body ?? "");
  if (!text.trim()) return "—";
  return `${text.length} (${estimatePromptTokensFromCdn(text)})`;
}

function urlDraftTipoSet(bootPrompts) {
  const bodies = bootPrompts?.bodies || {};
  const listed = Array.isArray(bootPrompts?.draftTipos)
    ? bootPrompts.draftTipos.map((t) => String(t).toUpperCase()).filter(Boolean)
    : Object.keys(bodies).map((t) => String(t).toUpperCase());
  return new Set(listed);
}



function ensureMssqlExecCap(onNeedLogin) {
  const cap = LabSession.mssqlExecCap();
  if (cap) return true;
  const reason = LabSession.blockReason("sql.exec.mssql.paty.instrucciones")
    || LabSession.blockReason("sql.exec.mssql.paty");
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

  const canExecMssql = useMemo(() => Boolean(LabSession.mssqlExecCap()), [authTick]);
  const saveTitle = useMemo(() => {
    if (canExecMssql) return "Guardar instrucciones y configuración en Paty (MSSQL)";
    return LabSession.blockReason("sql.exec.mssql.paty.instrucciones")
      || LabSession.blockReason("sql.exec.mssql.paty")
      || "Sin permiso para guardar en Paty";
  }, [authTick, canExecMssql]);
  const tipos = PromptsSql.PATY_PROMPT_TIPOS;

  const urlBodies = bootPrompts.bodies ?? EMPTY_BODIES;
  const urlDraftTipos = useMemo(() => urlDraftTipoSet(bootPrompts), [bootPrompts]);

  const [prompts, setPrompts] = useState(() => {

    const base = PromptsSql.emptyPromptState();

    for (const [tipo, body] of Object.entries(urlBodies)) {

      if (!urlDraftTipoSet(bootPrompts).has(String(tipo).toUpperCase())) continue;

      if (!base[tipo] || !String(body).trim()) continue;

      base[tipo] = { ...base[tipo], body: String(body), dirty: true, source: "url" };

    }

    return base;

  });

  const [activeTab, setActiveTab] = useState(

    Number.isInteger(bootPrompts.activeTab) ? bootPrompts.activeTab : 0,

  );

  const [previewOpen, setPreviewOpen] = useState(false);

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
    setPrompts((prev) => {
      const next = { ...prev };
      const touched = new Set();
      for (const row of rows) {
        const tipo = String(LabApi.rowVal(row, "IINSTRUCCION") ?? "").trim().toUpperCase();
        const body = String(LabApi.rowVal(row, "INSTRUCCION") ?? "").trim();
        if (!next[tipo]) continue;
        const rawJconfig = LabApi.rowVal(row, "JCONFIG");
        const modelo = String(LabApi.rowVal(row, "MODELO") ?? "").trim();
        const jconfig = PromptsSql.parseJconfig(rawJconfig, modelo || undefined);
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
        } else if (body || ignoreUrl) {
          next[tipo] = { ...next[tipo], ...basePatch, body, dirty: false, source: "bd" };
        } else {
          next[tipo] = { ...next[tipo], ...basePatch };
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
  }, [urlBodies, urlDraftTipos]);

  const clearUrlBodies = useCallback((tiposToClear) => {
    const snap = getSnapshot();
    const bodies = { ...(snap.prompts?.bodies || {}) };
    const draftTipos = (snap.prompts?.draftTipos || [])
      .map((t) => String(t).toUpperCase())
      .filter((t) => !tiposToClear.map((x) => String(x).toUpperCase()).includes(t));
    for (const t of tiposToClear) delete bodies[t];
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



  const activeTipo = tipos[activeTab] || tipos[0];

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
    () => tipos.filter((t) => {
      const p = prompts[t];
      if (!p?.body?.trim()) return false;
      return isDraftPrompt(p) || isConfigDirty(p);
    }),
    [prompts, tipos],
  );

  const hasLocalChanges = useMemo(
    () => tipos.some((t) => hasPendingChanges(prompts[t])),
    [prompts, tipos],
  );

  const discardAll = useCallback(async () => {
    const toReset = tipos.filter((t) => hasPendingChanges(prompts[t]));
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
  }, [applyCloudRows, clearUrlBodies, prompts, tipos]);

  const saveAll = useCallback(async () => {
    if (!pendingTipos.length) {
      toastWarning("No hay cambios pendientes para guardar");
      return;
    }
    if (!ensureMssqlExecCap(onNeedLogin)) return;
    const entries = pendingTipos.map((t) => ({
      archivo: prompts[t].archivo,
      body: prompts[t].body || "",
      source: prompts[t].source,
      jconfig: prompts[t].jconfig,
    }));
    const { sqlMssql, error } = PromptsSql.analyzeFromEntries(entries);
    if (error || !sqlMssql?.trim()) {
      toastError(error || "No se pudo generar SQL");
      return;
    }
    setActionBusy(true);
    setLoadErr("");
    try {
      await LabApi.mssqlExec(sqlMssql);
      const savedTipos = [...pendingTipos];
      clearUrlBodies(savedTipos);
      const rows = await LabApi.fetchInstruccionesPaty();
      applyCloudRows(rows, { onlyTipos: savedTipos, ignoreUrl: true });
      toastSuccess(`${savedTipos.length} instrucción(es) guardada(s) en Paty`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setLoadErr(msg);
      if (e?.code === "FORBIDDEN" || e?.code === "NO_SESSION") {
        LabSession.handleApiError(e, LabSession.mssqlExecCap() || "sql.exec.mssql.paty");
      } else if (/permiso|autoriz|403|503|verify-access/i.test(msg)) {
        toastWarning(LabSession.humanPermissionError(e, LabSession.mssqlExecCap() || "sql.exec.mssql.paty.instrucciones"));
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

    () => Object.values(prompts).filter((p) => p.body?.trim()).length,

    [prompts],

  );



  const applyFiles = useCallback(async (fileList) => {

    const files = await readFilesAsText(fileList);

    const updates = PromptsSql.ingestMdFiles(files);

    if (!Object.keys(updates).length) {
      toastWarning("Ningún PROMPT_*.md reconocido en los archivos");
      return;
    }
    toastSuccess(`${Object.keys(updates).length} instrucción(es) importada(s)`);

    setPrompts((prev) => {

      const next = { ...prev };

      for (const [tipo, data] of Object.entries(updates)) {

        next[tipo] = { ...next[tipo], ...data };

      }

      return next;

    });

    const first = Object.keys(updates)[0];

    const idx = tipos.indexOf(first);

    if (idx >= 0) setActiveTab(idx);

  }, [tipos]);



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
      [tipo]: { ...prev[tipo], body, dirty: true, source: "editor" },
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
      if (jconfigEqual(current.jconfig, defaults)) return prev;
      const baseline = current.jconfigBaseline;
      return {
        ...prev,
        [tipo]: {
          ...current,
          jconfig: defaults,
          configDirty: baseline ? !jconfigEqual(defaults, baseline) : false,
        },
      };
    });
  }, []);

  const parseConfigNumber = (raw, fallback) => {
    if (raw === "" || raw == null) return fallback;
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
  };



  return (

    <div className="tool-grid tool-grid-prompts tool-grid-prompts--solo">

      <Paper className="tool-panel scroll-panel" elevation={0}>

        <div className="panel-head">

          <Typography variant="subtitle1" fontWeight={600}>Instrucciones · mapeo</Typography>

          <Stack direction="row" spacing={0.5} alignItems="center">

            {loadBusy && <CircularProgress size={14} />}

            <Chip size="small" label={`${filledCount}/${tipos.length}`} color={filledCount ? "primary" : "default"} variant="outlined" />

            <ButtonIconify
              variant="primary"
              icon="mdi:content-save"
              label={actionBusy ? "Guardando…" : "Guardar"}
              title={saveTitle}
              onClick={saveAll}
              disabled={actionBusy || loadBusy || !pendingTipos.length || !canExecMssql}
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

            <span>Arrastra <code>PROMPT_*.md</code> aquí</span>

            <label className="drop-zone-file-btn" title="Seleccionar archivos .md">

              <ButtonIconify icon="mdi:folder-open-outline" title="Seleccionar .md" />

              <input type="file" accept=".md,text/markdown" multiple hidden onChange={onFileInput} />

            </label>

            <Typography variant="caption" color="text.secondary">

              Carga desde la base de instrucciones.

            </Typography>

          </div>



          <Tabs

            value={activeTab}

            onChange={(_, v) => setActiveTab(v)}

            variant="scrollable"

            scrollButtons="auto"

            className="prompt-tabs"

          >

            {tipos.map((tipo) => {

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

              placeholder={`Contenido de PROMPT_${activeTipo}.md…`}

              value={activePrompt?.body || ""}

              onChange={(e) => updateBody(activeTipo, e.target.value)}

              inputProps={{

                spellCheck: false,

                style: { fontFamily: "ui-monospace, Consolas, monospace", fontSize: "0.78rem", lineHeight: 1.45 },

              }}

            />

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

                    <TableCell>Tipo</TableCell>

                    <TableCell>chars (tokens)</TableCell>

                    <TableCell>modelo</TableCell>

                    <TableCell>temp</TableCell>

                    <TableCell>top_p</TableCell>

                    <TableCell align="center">Actions</TableCell>

                  </TableRow>

                </TableHead>

                <TableBody>

                  {tipos.map((tipo) => {

                    const p = prompts[tipo];
                    const jc = p?.jconfig || PromptsSql.parseJconfig(null);
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

                        onClick={() => setActiveTab(tipos.indexOf(tipo))}

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
                          <FormControl size="small" sx={{ minWidth: 148 }} onClick={stopRowClick}>
                            <Select
                              value={PromptsSql.normalizeModelOption(jc.model)}
                              onChange={(e) => updateConfig(tipo, { model: e.target.value })}
                              MenuProps={{ disableScrollLock: true }}
                              sx={{ fontSize: "0.72rem", "& .MuiSelect-select": { py: 0.35, px: 0.6 } }}
                            >
                              {PromptsSql.PATY_MODEL_OPTIONS.map((id) => (
                                <MenuItem key={id} value={id} sx={{ fontSize: "0.72rem" }}>{id}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>

                        <TableCell onClick={stopRowClick}>
                          <TextField
                            size="small"
                            variant="outlined"
                            type="number"
                            value={jc.temperature ?? PromptsSql.DEFAULT_JCONFIG.temperature}
                            inputProps={{ step: 0.01, min: 0, max: 2, style: { fontSize: "0.72rem", width: "4.5rem" } }}
                            onChange={(e) => updateConfig(tipo, { temperature: parseConfigNumber(e.target.value, PromptsSql.DEFAULT_JCONFIG.temperature) })}
                          />
                        </TableCell>

                        <TableCell onClick={stopRowClick}>
                          <TextField
                            size="small"
                            variant="outlined"
                            type="number"
                            value={jc.top_p ?? PromptsSql.DEFAULT_JCONFIG.top_p}
                            inputProps={{ step: 0.01, min: 0, max: 1, style: { fontSize: "0.72rem", width: "4.5rem" } }}
                            onChange={(e) => updateConfig(tipo, { top_p: parseConfigNumber(e.target.value, PromptsSql.DEFAULT_JCONFIG.top_p) })}
                          />
                        </TableCell>

                        <TableCell align="center" className="prompt-mapeo-actions" onClick={stopRowClick}>
                          <ButtonIconify
                            icon="mdi:backup-restore"
                            title={`Restablecer modelo (${PromptsSql.DEFAULT_JCONFIG.model}), temp (${PromptsSql.DEFAULT_JCONFIG.temperature}) y top_p (${PromptsSql.DEFAULT_JCONFIG.top_p})`}
                            onClick={() => resetConfigToDefaults(tipo)}
                            disabled={atDefaultConfig}
                          />
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

    </div>

  );

}

