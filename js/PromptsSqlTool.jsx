const { useState, useEffect, useCallback, useMemo, useRef } = React;

const {

  Paper, Typography, TextField, Stack, Alert, Chip,

  Tabs, Tab, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, CircularProgress,

} = MaterialUI;

const { SqlExecCard } = PatySqlExec;

const { ButtonIconify } = PatyIconify;



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



function statusChip(status) {

  if (status === "ok") return <Chip size="small" color="success" label="mapeado" />;

  if (status === "tipo_desconocido") return <Chip size="small" color="warning" label="tipo nuevo" />;

  return <Chip size="small" color="default" label="vacío" />;

}



function readFilesAsText(fileList) {

  return Promise.all(

    [...fileList].map(async (f) => ({

      name: f.name,

      content: await f.text(),

    })),

  );

}



function isDraftPrompt(p) {
  if (!p) return false;
  return p.dirty || p.source === "url" || p.source === "editor" || p.source === "archivo";
}

function draftBodiesFromPrompts(prompts) {
  const bodies = {};
  for (const [tipo, p] of Object.entries(prompts)) {
    if (isDraftPrompt(p) && p?.body?.trim()) bodies[tipo] = p.body;
  }
  return bodies;
}



function ensureCap(cap, onNeedLogin) {
  if (PatyLabSession.can(cap)) return true;
  PatyNotify.toastWarning(PatyLabSession.blockReason(cap));
  if (!PatyLabSession.isLoggedIn()) onNeedLogin?.();
  return false;
}

function ensureMssqlExecCap(onNeedLogin) {
  const cap = PatyLabSession.mssqlExecCap();
  if (cap) return true;
  const reason = PatyLabSession.blockReason("ejecutar_mssql_instrucciones")
    || PatyLabSession.blockReason("ejecutar_mssql");
  PatyNotify.toastWarning(reason);
  if (!PatyLabSession.isLoggedIn()) onNeedLogin?.();
  return false;
}

function PromptsSqlTool({ bootPrompts = {}, onNeedLogin }) {
  const [authTick, setAuthTick] = useState(0);
  useEffect(() => {
    const onAuth = () => setAuthTick((n) => n + 1);
    window.addEventListener("isa-patyia:auth", onAuth);
    return () => window.removeEventListener("isa-patyia:auth", onAuth);
  }, []);

  const canExecMssql = useMemo(() => Boolean(PatyLabSession.mssqlExecCap()), [authTick]);
  const canGuardar = useMemo(() => PatyLabSession.can("guardar_langlab"), [authTick]);
  const guardarTitle = useMemo(() => {
    if (canGuardar) return "Guardar cambios pendientes en langlab";
    return PatyLabSession.blockReason("guardar_langlab") || "Sin permiso para guardar";
  }, [authTick, canGuardar]);

  const tipos = PatyPromptsSql.PATY_PROMPT_TIPOS;

  const urlBodies = bootPrompts.bodies || {};

  const [prompts, setPrompts] = useState(() => {

    const base = PatyPromptsSql.emptyPromptState();

    for (const [tipo, body] of Object.entries(urlBodies)) {

      if (!base[tipo] || !String(body).trim()) continue;

      base[tipo] = { ...base[tipo], body: String(body), dirty: true, source: "url" };

    }

    return base;

  });

  const [activeTab, setActiveTab] = useState(

    Number.isInteger(bootPrompts.activeTab) ? bootPrompts.activeTab : 0,

  );

  const [dragOver, setDragOver] = useState(false);

  const [sqlMssql, setSqlMssql] = useState("");

  const [mapped, setMapped] = useState([]);

  const [loadBusy, setLoadBusy] = useState(true);

  const [loadErr, setLoadErr] = useState("");

  const [actionBusy, setActionBusy] = useState(false);

  const [labTarget, setLabTarget] = useState(PatyAppConfig.getLabTargetLabel());

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
        const tipo = String(PatyLabApi.rowVal(row, "IINSTRUCCION") ?? "").trim().toUpperCase();
        const body = String(PatyLabApi.rowVal(row, "INSTRUCCION") ?? "").trim();
        if (!next[tipo]) continue;
        if (scope && !scope.has(tipo)) continue;
        touched.add(tipo);
        const urlBody = ignoreUrl ? "" : urlBodies[tipo]?.trim();
        if (!ignoreUrl && urlBody) {
          if (body && urlBody === body) {
            next[tipo] = { ...next[tipo], body, dirty: false, source: "bd" };
          } else {
            next[tipo] = { ...next[tipo], body: urlBody, dirty: true, source: "url" };
          }
        } else if (body || ignoreUrl) {
          next[tipo] = { ...next[tipo], body, dirty: false, source: "bd" };
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
  }, [urlBodies]);

  const clearUrlBodies = useCallback((tiposToClear) => {
    const snap = PatyUrlState.getSnapshot();
    const bodies = { ...(snap.prompts?.bodies || {}) };
    for (const t of tiposToClear) delete bodies[t];
    PatyUrlState.mergePartial({ prompts: { activeTab, bodies } });
  }, [activeTab]);



  useEffect(() => {

    const onTarget = () => setLabTarget(PatyAppConfig.getLabTargetLabel());

    window.addEventListener("isa-patyia:lab-target", onTarget);

    return () => window.removeEventListener("isa-patyia:lab-target", onTarget);

  }, []);



  const activeTipo = tipos[activeTab] || tipos[0];

  const activePrompt = prompts[activeTipo];



  const recompute = useCallback((state) => {

    const entries = Object.values(state).filter((p) => p.body?.trim());

    const { mapped: m, sqlMssql: sm, error } = PatyPromptsSql.analyzeFromEntries(entries);

    setMapped(m);

    setSqlMssql(sm || "");

    return error;

  }, []);



  useEffect(() => {

    recompute(prompts);

  }, [prompts, recompute]);



  useEffect(() => {

    let cancelled = false;

    (async () => {

      setLoadBusy(true);

      setLoadErr("");

      try {

        const rows = await PatyLabApi.fetchInstruccionesPaty();

        if (cancelled) return;

        applyCloudRows(rows);

      } catch (e) {

        if (!cancelled) {
          const msg = e instanceof Error ? e.message : String(e);
          setLoadErr(msg);
          PatyNotify.toastWarning(`Carga desde lab: ${msg}`);
        }

      } finally {

        if (!cancelled) setLoadBusy(false);

      }

    })();

    return () => { cancelled = true; };

  }, [labTarget, applyCloudRows]);



  const draftTipos = useMemo(
    () => tipos.filter((t) => isDraftPrompt(prompts[t]) && prompts[t]?.body?.trim()),
    [prompts, tipos],
  );

  const hasLocalChanges = useMemo(
    () => tipos.some((t) => isDraftPrompt(prompts[t])),
    [prompts, tipos],
  );

  const discardAll = useCallback(async () => {
    const toReset = tipos.filter((t) => isDraftPrompt(prompts[t]));
    if (!toReset.length) {
      PatyNotify.toastInfo("No hay cambios locales que descartar");
      return;
    }
    setActionBusy(true);
    setLoadErr("");
    try {
      const rows = await PatyLabApi.fetchInstruccionesPaty();
      applyCloudRows(rows, { onlyTipos: toReset, ignoreUrl: true });
      clearUrlBodies(toReset);
      PatyNotify.toastInfo(`${toReset.length} instrucción(es) restaurada(s) desde BD`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setLoadErr(msg);
      PatyNotify.toastError(msg);
    } finally {
      setActionBusy(false);
    }
  }, [applyCloudRows, clearUrlBodies, prompts, tipos]);

  const saveAll = useCallback(async () => {
    if (!draftTipos.length) {
      PatyNotify.toastWarning("No hay cambios pendientes para guardar");
      return;
    }
    if (!ensureCap("guardar_langlab", onNeedLogin)) return;
    const entries = draftTipos.map((t) => ({
      archivo: prompts[t].archivo,
      body: prompts[t].body,
      source: prompts[t].source,
    }));
    const { sqlLanglab, error } = PatyPromptsSql.analyzeFromEntries(entries);
    if (error || !sqlLanglab?.trim()) {
      PatyNotify.toastError(error || "No se pudo generar SQL");
      return;
    }
    setActionBusy(true);
    setLoadErr("");
    try {
      await PatyLabApi.savePromptsToLanglab(sqlLanglab);
      setPrompts((prev) => {
        const next = { ...prev };
        for (const t of draftTipos) {
          if (next[t]) next[t] = { ...next[t], dirty: false, source: "bd" };
        }
        return next;
      });
      clearUrlBodies(draftTipos);
      PatyNotify.toastSuccess(`${draftTipos.length} instrucción(es) guardada(s) en langlab`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setLoadErr(msg);
      if (e?.code === "FORBIDDEN" || e?.code === "NO_SESSION") {
        PatyLabSession.handleApiError(e, "guardar_langlab");
      } else {
        PatyNotify.toastError(msg);
      }
    } finally {
      setActionBusy(false);
    }
  }, [clearUrlBodies, draftTipos, onNeedLogin, prompts]);



  useEffect(() => {

    PatyUrlState.mergePartial({ prompts: { activeTab } });

  }, [activeTab]);



  useEffect(() => {

    if (urlSyncRef.current) clearTimeout(urlSyncRef.current);

    urlSyncRef.current = setTimeout(() => {

      PatyUrlState.mergePartial({ prompts: { activeTab, bodies: draftBodiesFromPrompts(prompts) } });

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

    const updates = PatyPromptsSql.ingestMdFiles(files);

    if (!Object.keys(updates).length) {
      PatyNotify.toastWarning("Ningún PROMPT_*.md reconocido en los archivos");
      return;
    }
    PatyNotify.toastSuccess(`${Object.keys(updates).length} instrucción(es) importada(s)`);

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



  async function execMssql(sql) {

    if (!ensureMssqlExecCap(onNeedLogin)) {
      throw new Error(
        PatyLabSession.blockReason("ejecutar_mssql_instrucciones")
          || PatyLabSession.blockReason("ejecutar_mssql"),
      );
    }

    return PatyLabApi.mssqlExec(sql);

  }



  return (

    <div className={`tool-grid tool-grid-prompts${canExecMssql ? "" : " tool-grid-prompts--solo"}`}>

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
              title={guardarTitle}
              onClick={saveAll}
              disabled={actionBusy || loadBusy || !draftTipos.length || !canGuardar}
              busy={actionBusy}
            />
            <ButtonIconify
              icon="mdi:delete-outline"
              label="Descartar"
              title="Descartar todos los borradores y restaurar desde BD"
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

              Carga desde BD (lab).

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

              const dirty = isDraftPrompt(p);

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

            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>

              <code>{activePrompt?.archivo}</code> → <code>INSTRUCCION.{activeTipo}</code>

              {activePrompt?.source === "bd" && " · BD"}

              {isDraftPrompt(activePrompt) && " · borrador"}

            </Typography>

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

                    <TableCell>chars</TableCell>

                    <TableCell>estado</TableCell>

                  </TableRow>

                </TableHead>

                <TableBody>

                  {tipos.map((tipo) => {

                    const row = mapped.find((r) => r.tipo === tipo) || {

                      tipo,

                      archivo: `PROMPT_${tipo}.md`,

                      chars: (prompts[tipo]?.body || "").length,

                      status: prompts[tipo]?.body?.trim() ? "ok" : "sin_mapeo",

                    };

                    return (

                      <TableRow

                        key={tipo}

                        hover

                        selected={tipo === activeTipo}

                        onClick={() => setActiveTab(tipos.indexOf(tipo))}

                        sx={{ cursor: "pointer" }}

                      >

                        <TableCell><code>{tipo}</code></TableCell>

                        <TableCell>{row.chars || 0}</TableCell>

                        <TableCell>{statusChip(row.status)}</TableCell>

                      </TableRow>

                    );

                  })}

                </TableBody>

              </Table>

            </TableContainer>

          </div>



        </div>

      </Paper>



      {canExecMssql && (
        <Paper className="tool-panel scroll-panel" elevation={0}>

          <div className="panel-head">

            <Typography variant="subtitle1" fontWeight={600}>SQL</Typography>

          </div>

          <div className="panel-body panel-body-sql-stack">

            <SqlExecCard

              title="Fusión PatyIA staging (MSSQL)"

              sql={sqlMssql}

              desc="AYUDASCP_IA_STAGING · INSTRUCCION + TDCONSULTAXINSTRUCCION"

              height="180px"

              confirmMessage="Ejecutar fusión en PatyIA staging. ¿Continuar?"

              executeSql={execMssql}

              allowRun

              disabled={!sqlMssql.trim()}

            />

          </div>

        </Paper>
      )}

    </div>

  );

}



window.PatyPromptsSqlTool = { PromptsSqlTool };


