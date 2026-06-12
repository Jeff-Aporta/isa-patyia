/**
 * Mapeo PROMPT_<TIPO>.md → INSTRUCCION + TDCONSULTAXINSTRUCCION (staging).
 * Portado de scripts/patyia/prompts/build-paty-prompts-sql.mjs
 */
const PATY_PROMPT_TIPOS = [
    "SALUDO_OTRO",
    "FUERA_DE_ALCANCE_TECNICO",
    "SOLICITUD_NO_PERMITIDA",
    "REQUIERE_CONTEXTO",
    "PASO_A_PASO",
    "INTERPRETACION_RESULTADO",
    "CONSULTA_NORMATIVA_NEGOCIO",
    "ASESORIA_PERSONALIZADA",
    "ERROR_TECNICO",
    "ERROR_CONFIGURACION",
    "ERROR_ACCESO",
    "ERROR_DIAN",
    "COMERCIAL",
  ];

  const PROMPT_FILE_RE = /^PROMPT_([A-Z0-9_]+)\.md$/i;

  function fileToTipo(name) {
    const m = String(name).trim().match(PROMPT_FILE_RE);
    return m ? m[1].toUpperCase() : null;
  }

  function sqlEscapeLiteral(text) {
    return `N'${String(text).replace(/'/g, "''")}'`;
  }

  function parseMdBundle(text) {
    const out = new Map();
    const src = String(text ?? "").trim();
    if (!src) return out;

    const parts = src.split(/^===\s*(PROMPT_[A-Z0-9_]+\.md)\s*===\s*$/gim);
    if (parts.length > 1) {
      for (let i = 1; i < parts.length; i += 2) {
        const archivo = parts[i].trim();
        const body = (parts[i + 1] ?? "").trim();
        if (archivo && body) out.set(archivo.toUpperCase().replace(/\.MD$/, ".md"), { archivo, body });
      }
      return out;
    }

    const single = src.match(/^#\s*file:\s*(PROMPT_[A-Z0-9_]+\.md)\s*\n/im);
    if (single) {
      out.set(single[1], { archivo: single[1], body: src.replace(/^#\s*file:.*\n/im, "").trim() });
    }
    return out;
  }

  function mergePromptEntries(fileMap, textareaBundle) {
    const merged = new Map();
    for (const [archivo, body] of fileMap.entries()) {
      merged.set(archivo, { archivo, body: String(body).trim(), source: "archivo" });
    }
    for (const { archivo, body } of parseMdBundle(textareaBundle).values()) {
      merged.set(archivo, { archivo, body, source: "texto" });
    }
    return [...merged.values()];
  }

  const DEFAULT_JCONFIG = {
    provider: "openai",
    model: "gpt-5-nano",
    temperature: 0,
    top_p: 0.85,
  };

  /** Modelos sin sufijo de fecha (la fecha se infiere en runtime OpenAI). */
  const PATY_MODEL_OPTIONS = [
    "gpt-5-nano",
    "gpt-5-mini",
    "gpt-5-codex",
    "gpt-5-chat-latest",
    "gpt-5",
    "gpt-4.1",
    "gpt-4.1-mini",
    "gpt-4.1-nano",
  ];

  function normalizeModelOption(model) {
    const m = String(model ?? "").trim();
    if (!m) return DEFAULT_JCONFIG.model;
    if (PATY_MODEL_OPTIONS.includes(m)) return m;
    const byLen = [...PATY_MODEL_OPTIONS].sort((a, b) => b.length - a.length);
    for (const opt of byLen) {
      if (m === opt || m.startsWith(`${opt}-`)) return opt;
    }
    return DEFAULT_JCONFIG.model;
  }

  function parseJconfig(raw, fallbackModel) {
    const fb = normalizeModelOption(fallbackModel || DEFAULT_JCONFIG.model);
    if (raw == null || !String(raw).trim()) {
      return { ...DEFAULT_JCONFIG, model: fb };
    }
    try {
      const o = typeof raw === "string" ? JSON.parse(raw) : raw;
      return {
        provider: String(o.provider || DEFAULT_JCONFIG.provider),
        model: normalizeModelOption(o.model || fb),
        temperature: Number(o.temperature ?? DEFAULT_JCONFIG.temperature),
        top_p: Number(o.top_p ?? DEFAULT_JCONFIG.top_p),
      };
    } catch {
      return { ...DEFAULT_JCONFIG, model: fb };
    }
  }

  function serializeJconfig(jc) {
    const out = {
      provider: jc?.provider || DEFAULT_JCONFIG.provider,
      model: normalizeModelOption(jc?.model || DEFAULT_JCONFIG.model),
      temperature: Number(jc?.temperature ?? DEFAULT_JCONFIG.temperature),
      top_p: Number(jc?.top_p ?? DEFAULT_JCONFIG.top_p),
    };
    return JSON.stringify(out);
  }

  function mapEntryToInstruccion(entry) {
    const tipo = fileToTipo(entry.archivo);
    const known = tipo ? PATY_PROMPT_TIPOS.includes(tipo) : false;
    const fallbackModel = entry.modelo || DEFAULT_JCONFIG.model;
    const jconfig = entry.jconfig || parseJconfig(entry.jconfigRaw, fallbackModel);
    return {
      archivo: entry.archivo,
      tipo,
      iinstruccion: tipo,
      nitdconsulta: tipo,
      ninstruccion: tipo ? `PROMPT_${tipo}` : null,
      chars: entry.body.length,
      known,
      source: entry.source,
      body: entry.body,
      jconfig,
      modelo: jconfig.model,
      status: !tipo ? "sin_mapeo" : known ? "ok" : "tipo_desconocido",
    };
  }

  function buildMergeSql(rows) {
    const valid = rows.filter((r) => r.tipo && r.body);
    if (!valid.length) return { sql: "", rows: valid, error: "No hay prompts PROMPT_*.md válidos." };

    const head = `-- =====================================================================
-- Carga de prompts especificos por tipo de consulta (generado por isa-patyia)
-- Fuente: PROMPT_<TIPO>.md
-- =====================================================================
SET NOCOUNT ON;
SET XACT_ABORT ON;
BEGIN TRAN;
`;

    const stmts = valid.map((r) => {
      const jc = r.jconfig || parseJconfig(null, r.modelo);
      const jconfigJson = sqlEscapeLiteral(serializeJconfig(jc));
      const modelo = sqlEscapeLiteral(jc.model);
      return `
-- ----- ${r.tipo} (${r.archivo}) -----
MERGE INSTRUCCION AS t
USING (VALUES (
\tN'${r.tipo}',
\tN'PROMPT_${r.tipo}',
\t${sqlEscapeLiteral(r.body)},
\tN'Prompt especifico para tipo de consulta ${r.tipo}',
\tN'1.0',
\t1,
\t${modelo},
\t${jconfigJson}
)) AS s (iinstruccion, ninstruccion, instruccion, descripcion, version, bactivo, modelo, jconfig)
ON t.iinstruccion = s.iinstruccion
WHEN MATCHED THEN UPDATE SET
\tt.ninstruccion = s.ninstruccion,
\tt.instruccion  = s.instruccion,
\tt.descripcion  = s.descripcion,
\tt.version      = s.version,
\tt.bactivo      = s.bactivo,
\tt.modelo       = s.modelo,
\tt.jconfig      = s.jconfig
WHEN NOT MATCHED THEN INSERT (iinstruccion, ninstruccion, instruccion, descripcion, version, bactivo, modelo, jconfig, fhini)
\tVALUES (s.iinstruccion, s.ninstruccion, s.instruccion, s.descripcion, s.version, s.bactivo, s.modelo, s.jconfig, SYSUTCDATETIME());

MERGE TDCONSULTAXINSTRUCCION AS t
USING (
\tSELECT c.itdconsulta, N'${r.tipo}' AS iinstruccion, 1 AS orden
\tFROM TDCONSULTA c
\tWHERE c.itdconsulta = N'${r.tipo}'
) AS s
ON t.itdconsulta = s.itdconsulta AND t.iinstruccion = s.iinstruccion
WHEN MATCHED THEN UPDATE SET t.orden = s.orden
WHEN NOT MATCHED THEN INSERT (itdconsulta, iinstruccion, orden)
\tVALUES (s.itdconsulta, s.iinstruccion, s.orden);
`;
    }).join("\n");

    const tail = `
COMMIT;

SELECT i.iinstruccion, i.ninstruccion, i.version, i.modelo, i.jconfig, LEN(i.instruccion) AS len_instruccion
FROM INSTRUCCION i
WHERE i.iinstruccion IN (${valid.map((r) => `N'${r.tipo}'`).join(", ")})
ORDER BY i.iinstruccion;
`;

    return { sql: head + stmts + tail, rows: valid, error: null };
  }

  function pgEscapeLiteral(text) {
    return `'${String(text).replace(/'/g, "''")}'`;
  }

  /** BD_LANGLAB (langlab / Render) — no PatyIA MSSQL. */
  function buildLanglabPgSql(rows) {
    const valid = rows.filter((r) => r.tipo && r.body);
    if (!valid.length) return { sql: "", rows: valid, error: "No hay prompts válidos para guardar." };

    const head = `-- =====================================================================
-- Upsert de instrucciones (generado por isa-patyia)
-- =====================================================================
BEGIN;
`;

    const stmts = valid.map((r) => `
-- ${r.archivo} → ${r.tipo}
INSERT INTO "BD_LANGLAB"."INSTRUCCION" ("IINSTRUCCION", "NINSTRUCCION", "MODELO", "INSTRUCCION", "DESCRIPCION", "VERSION", "FHULTACT")
VALUES (${pgEscapeLiteral(r.tipo)}, ${pgEscapeLiteral(`PROMPT_${r.tipo}`)}, '', ${pgEscapeLiteral(r.body)}, ${pgEscapeLiteral(`Prompt · ${r.tipo}`)}, '1.0', NOW())
ON CONFLICT ("IINSTRUCCION") DO UPDATE SET
  "NINSTRUCCION" = EXCLUDED."NINSTRUCCION",
  "INSTRUCCION" = EXCLUDED."INSTRUCCION",
  "DESCRIPCION" = EXCLUDED."DESCRIPCION",
  "VERSION" = EXCLUDED."VERSION",
  "FHULTACT" = NOW();

INSERT INTO "BD_LANGLAB"."CONVERSACION_TIPOCONSULTA" ("ITIPOCONSULTA", "NCONSULTA", "DESCRIPCION", "INSTRUCCIONES")
VALUES (${pgEscapeLiteral(r.tipo)}, ${pgEscapeLiteral(`PROMPT_${r.tipo}`)}, ${pgEscapeLiteral(`PROMPT_${r.tipo}`)}, jsonb_build_array(jsonb_build_object('IINSTRUCCION', ${pgEscapeLiteral(r.tipo)}, 'IORDEN', 1)))
ON CONFLICT ("ITIPOCONSULTA") DO UPDATE SET
  "NCONSULTA" = EXCLUDED."NCONSULTA",
  "INSTRUCCIONES" = EXCLUDED."INSTRUCCIONES";
`).join("\n");

    const tail = `
COMMIT;

SELECT "IINSTRUCCION", "NINSTRUCCION", "VERSION", LENGTH("INSTRUCCION") AS len_instruccion
FROM "BD_LANGLAB"."INSTRUCCION"
WHERE "IINSTRUCCION" IN (${valid.map((r) => pgEscapeLiteral(r.tipo)).join(", ")})
ORDER BY "IINSTRUCCION";
`;

    return { sql: head + stmts + tail, rows: valid, error: null };
  }

  function analyzeFromEntries(entries) {
    const mapped = (entries || []).map((e) => mapEntryToInstruccion({
      archivo: e.archivo,
      body: e.body,
      source: e.source || "editor",
      jconfig: e.jconfig,
      jconfigRaw: e.jconfigRaw,
      modelo: e.modelo,
    }));
    const mssql = buildMergeSql(mapped);
    const pg = buildLanglabPgSql(mapped);
    return {
      mapped,
      sqlMssql: mssql.sql,
      sqlLanglab: pg.sql,
      validRows: mssql.rows,
      error: mssql.error || pg.error,
    };
  }

  function analyzePrompts(fileMap, textareaBundle) {
    const entries = mergePromptEntries(fileMap, textareaBundle);
    return analyzeFromEntries(entries);
  }

  function emptyPromptState() {
    const out = {};
    for (const tipo of PATY_PROMPT_TIPOS) {
      const archivo = `PROMPT_${tipo}.md`;
      out[tipo] = {
        archivo,
        tipo,
        body: "",
        source: "plantilla",
        dirty: false,
        configDirty: false,
        jconfig: { ...DEFAULT_JCONFIG },
        jconfigBaseline: null,
      };
    }
    return out;
  }

  function ingestMdFiles(files) {
    const updates = {};
    for (const f of files) {
      if (!/^PROMPT_[A-Z0-9_]+\.md$/i.test(f.name)) continue;
      const tipo = fileToTipo(f.name);
      if (!tipo) continue;
      updates[tipo] = {
        archivo: f.name,
        tipo,
        body: String(f.content ?? "").trim(),
        source: "archivo",
        dirty: true,
      };
    }
    return updates;
  }

export {
  PATY_PROMPT_TIPOS,
  PATY_MODEL_OPTIONS,
  DEFAULT_JCONFIG,
  fileToTipo,
  parseMdBundle,
  mergePromptEntries,
  mapEntryToInstruccion,
  parseJconfig,
  normalizeModelOption,
  serializeJconfig,
  buildMergeSql,
  buildLanglabPgSql,
  analyzeFromEntries,
  analyzePrompts,
  emptyPromptState,
  ingestMdFiles,
};
