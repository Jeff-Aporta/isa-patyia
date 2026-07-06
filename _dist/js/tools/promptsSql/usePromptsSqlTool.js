// js/core/patyia.ts
window.ISAFront.migrateLegacyGatewayKeys?.({ "jeff:gateway-local": "", "patyia-apptools:gateway-local": "", "patyia-apptools:lab-local": "" });
var PATYIA_BRIDGE_URL = "https://ayudascp-ia-staging.azurewebsites.net";
var PATYIA_ISS_LOCAL = "http://127.0.0.1:8802";
var PATYIA_BRIDGE_LOCAL = `${PATYIA_ISS_LOCAL}/api`;
var PATYIA_ISS_LOCAL_LS_KEY = "patyia-apptools:iss-local";
function isPatyiaApiPath(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return p.startsWith("/patyia") || p.startsWith("/api/patyia");
}
function patyiaCapFetchBase() {
  return (isLocalMode() ? PATYIA_ISS_LOCAL : PATYIA_BRIDGE_URL).replace(/\/$/, "");
}
function isLocalMode() {
  try {
    return localStorage.getItem(PATYIA_ISS_LOCAL_LS_KEY) === "1";
  } catch {
    return false;
  }
}
function ensureIssLocalDefault() {
  try {
    if (localStorage.getItem(PATYIA_ISS_LOCAL_LS_KEY) != null) return;
    localStorage.setItem(PATYIA_ISS_LOCAL_LS_KEY, "0");
  } catch {
  }
}
function resolveIssApiBase() {
  const base = (isLocalMode() ? PATYIA_BRIDGE_LOCAL : PATYIA_BRIDGE_URL).replace(/\/$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
}

// js/core/platform.ts
var bridge = () => window.ISAFront.createPlatformBridge("ISA");
var Session = {
  current: () => bridge().Session.current(),
  isLoggedIn: () => bridge().Session.isLoggedIn(),
  username: () => bridge().Session.username(),
  realUsername: () => bridge().Session.realUsername?.() ?? bridge().Session.username(),
  viewAsUsername: () => bridge().Session.viewAsUsername?.() ?? null,
  isViewingAs: () => bridge().Session.isViewingAs?.() ?? false,
  auditAuthor: () => bridge().Session.auditAuthor?.() ?? String(bridge().Session.username() || "").trim().toUpperCase(),
  authHeader: () => bridge().Session.authHeader(),
  appHeader: () => bridge().Session.appHeader(),
  appId: () => bridge().Session.appId(),
  login: (u, p, opts) => bridge().Session.login(u, p, opts),
  logout: () => bridge().Session.logout(),
  refreshProfile: () => bridge().Session.refreshProfile(),
  fetchViewAsCatalog: () => bridge().Session.fetchViewAsCatalog?.(),
  searchSuplantacionUsers: (q, limit) => bridge().Session.searchSuplantacionUsers?.(q, limit),
  setViewAs: (u) => bridge().Session.setViewAs?.(u),
  clearViewAs: () => bridge().Session.clearViewAs?.(),
  capabilities: () => bridge().Session.capabilities(),
  adminCapabilities: () => bridge().Session.adminCapabilities?.() ?? bridge().Session.capabilities(),
  capabilityCatalog: () => bridge().Session.capabilityCatalog?.() ?? [],
  can: (cap) => bridge().Session.can(cap),
  blockReason: (cap) => bridge().Session.blockReason(cap),
  get EVENT() {
    return bridge().Session.EVENT;
  }
};
var Config = {
  base: () => bridge().Config.base(),
  apiUrl: (path) => bridge().Config.apiUrl(path),
  isLocal: () => bridge().Config.isLocal(),
  setLocal: (on) => bridge().Config.setLocal(on),
  get EVENT() {
    return bridge().Config.EVENT;
  }
};
var getReact = () => window.ISAFront.getReact();
var fb = () => globalThis.ISAFront?.Feedback;
function toastError(text, timeout) {
  fb()?.toast?.error?.(text, timeout);
}
function toastSuccess(text, timeout) {
  fb()?.toast?.success?.(text, timeout);
}
function toastInfo(text, timeout) {
  fb()?.toast?.info?.(text, timeout);
}
function toastWarning(text, timeout) {
  fb()?.toast?.warning?.(text, timeout);
}
function requestConfirm(opts) {
  return fb()?.confirm?.(opts) ?? Promise.resolve(false);
}

// js/core/urlState.ts
var STATE_VERSION = 1;
function normalizeLog(raw) {
  if (!raw || typeof raw !== "object") return {};
  const o = { ...raw };
  const w = Number(o.sidebarW);
  if (Number.isFinite(w) && w > 0) o.sidebarW = Math.round(w);
  else delete o.sidebarW;
  return o;
}
function initial() {
  return { v: STATE_VERSION, tool: "log", log: {}, prompts: {}, chat: {}, todos: {}, config: {} };
}
function normalizeTool(raw) {
  if (raw === "prompts") return "prompts";
  if (raw === "chat") return "chat";
  if (raw === "todos") return "todos";
  if (raw === "config") return "config";
  return "log";
}
function normalizeChatBag(chat) {
  const bag = chat && typeof chat === "object" ? { ...chat } : {};
  if ((bag.mode == null || String(bag.mode).trim() === "") && bag.jailbreak != null) {
    bag.mode = bag.jailbreak === true ? "libre" : "patyia";
    delete bag.jailbreak;
  } else if (bag.jailbreak != null) {
    delete bag.jailbreak;
  }
  return bag;
}
function normalize(raw, _prev) {
  if (!raw || typeof raw !== "object") return initial();
  const tool = normalizeTool(raw.tool);
  const chat = normalizeChatBag(raw.chat);
  const todos = raw.todos && typeof raw.todos === "object" ? raw.todos : {};
  const config = raw.config && typeof raw.config === "object" ? raw.config : {};
  return {
    v: raw.v ?? STATE_VERSION,
    tool,
    log: normalizeLog(raw.log),
    prompts: raw.prompts && typeof raw.prompts === "object" ? raw.prompts : {},
    chat,
    todos,
    config
  };
}
function slimForUrl(src) {
  const slim = { ...src };
  const log = slim.log;
  if (log) {
    const nextLog = { ...log };
    if (nextLog.jsonInput && String(nextLog.jsonInput).length > 4e3) {
      slim.log = {
        convId: nextLog.convId || "",
        ...nextLog.sidebarW != null ? { sidebarW: nextLog.sidebarW } : {}
      };
    } else {
      slim.log = nextLog;
    }
  }
  const prompts = slim.prompts;
  if (prompts?.bodies) {
    const bodies = {};
    let total = 0;
    for (const [k, v] of Object.entries(prompts.bodies)) {
      const t = String(v ?? "");
      if (total + t.length > 6e3) break;
      bodies[k] = t;
      total += t.length;
    }
    slim.prompts = { ...prompts, bodies };
  }
  return slim;
}
function mergeConfig(state, partial) {
  const prev = state.config && typeof state.config === "object" ? { ...state.config } : {};
  const next = partial && typeof partial === "object" ? partial : {};
  const prevPermisos = prev.permisos && typeof prev.permisos === "object" ? { ...prev.permisos } : {};
  const nextPermisos = next.permisos && typeof next.permisos === "object" ? next.permisos : null;
  return {
    ...prev,
    ...next,
    ...nextPermisos ? { permisos: { ...prevPermisos, ...nextPermisos } } : {}
  };
}
function merge(state, partial) {
  const nextLog = { ...state.log, ...partial.log || {} };
  if ("jsonInput" in nextLog) delete nextLog.jsonInput;
  return {
    ...state,
    ...partial,
    log: nextLog,
    prompts: {
      ...state.prompts,
      ...partial.prompts || {}
    },
    chat: {
      ...state.chat,
      ...partial.chat || {}
    },
    todos: {
      ...state.todos,
      ...partial.todos || {}
    },
    config: mergeConfig(state, partial.config)
  };
}
var URL_STATE_PARAM = "s";
function stripUrlStateParam() {
  try {
    const url = new URL(location.href);
    if (!url.searchParams.has(URL_STATE_PARAM)) return;
    url.searchParams.delete(URL_STATE_PARAM);
    history.replaceState(null, "", url);
  } catch {
  }
}
function migrateLegacyFlatQuery() {
  if (typeof window === "undefined" || !window.ISAFront?.b64urlEncode) return;
  try {
    const url = new URL(location.href);
    if (url.searchParams.has(URL_STATE_PARAM)) return;
    const tool = url.searchParams.get("tool");
    const legacyKeys = [...url.searchParams.keys()].filter(
      (k) => k === "tool" || k === "local" || k.includes(".")
    );
    if (!legacyKeys.length) return;
    const next = {
      v: STATE_VERSION,
      tool: normalizeTool(tool),
      log: {},
      prompts: {},
      chat: {},
      todos: {},
      config: {}
    };
    for (const [key, raw] of url.searchParams.entries()) {
      if (key === "tool" || key === "local") continue;
      const dot = key.indexOf(".");
      if (dot < 0) continue;
      const section = key.slice(0, dot);
      const field = key.slice(dot + 1);
      if (section !== "log" && section !== "prompts" && section !== "chat" && section !== "todos") continue;
      const bag = next[section] || {};
      if (field === "convId" && (section === "chat" || section === "log")) {
        const n = Number(raw);
        bag.convId = Number.isFinite(n) && n > 0 ? n : String(raw ?? "").trim();
      } else if (field === "mode") {
        bag.mode = String(raw ?? "").trim().toLowerCase() || "patyia";
      } else if (field === "jailbreak") {
        bag.mode = raw === "1" || raw === "true" ? "libre" : "patyia";
      } else if (field === "boardId" || field === "milestoneId" || field === "taskId") {
        const n = Number(raw);
        if (Number.isFinite(n) && n > 0) bag[field] = n;
      } else {
        bag[field] = raw;
      }
      next[section] = bag;
    }
    legacyKeys.forEach((k) => url.searchParams.delete(k));
    const slim = slimForUrl(next);
    const json = JSON.stringify(slim);
    if (json !== "{}") url.searchParams.set(URL_STATE_PARAM, window.ISAFront.b64urlEncode(json));
    history.replaceState(null, "", url);
  } catch {
  }
}
migrateLegacyFlatQuery();
var urlState = window.ISAFront.createUrlState({
  param: URL_STATE_PARAM,
  debounceMs: 350,
  maxB64Len: 12e3,
  historyKey: "patyAppState",
  initial,
  normalize,
  slimForUrl,
  merge,
  onInit() {
    ensureIssLocalDefault();
  },
  brandHomeReset(api) {
    const snap = api.reset();
    stripUrlStateParam();
    return snap;
  }
});
var bootState = urlState.boot;
var getSnapshot = urlState.getSnapshot;
var mergePartial = urlState.mergePartial;
var hrefFor = urlState.hrefFor;
var subscribe = urlState.subscribe;
var PARAM = urlState.PARAM;

// js/api/promptsSql.ts
var PATY_PROMPT_TIPOS = [
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
  "COMERCIAL"
];
var PATY_SYSTEM_INSTRUCTIONS = [
  {
    iinstruccion: "GENERAL",
    ninstruccion: "PROMPT_GENERAL",
    archivo: "PROMPT_GENERAL.txt",
    descripcion: "Prompt general de conversaci\xF3n Paty (PR_GENERAL)",
    defaultModel: "gpt-5-nano",
    kind: "system"
  },
  {
    iinstruccion: "TDCONSULTA",
    ninstruccion: "PROMPT_TDCONSULTA",
    archivo: "PROMPT_TDCONSULTA.txt",
    descripcion: "Clasificador tipo de consulta (PR_TIPO_CONSULTAS)",
    defaultModel: "gpt-4.1-nano",
    kind: "system"
  },
  {
    iinstruccion: "EXTRACTOR_CONSULTAS",
    ninstruccion: "PROMPT_EXTRACTOR_CONSULTAS",
    archivo: "PROMPT_EXTRACTOR_CONSULTAS.txt",
    descripcion: "Extractor de consultas \xFAtiles del usuario (PR_EXTRACTOR_CONSULTAS)",
    defaultModel: "gpt-4.1-nano",
    kind: "system"
  },
  {
    iinstruccion: "CLASIFICADOR_MODULO",
    ninstruccion: "PROMPT_CLASIFICADOR_MODULO",
    archivo: "PROMPT_CLASIFICADOR_MODULO.txt",
    descripcion: "Clasificador de m\xF3dulo ContaPyme (PR_CLASIFICADOR_MODULO)",
    defaultModel: "gpt-4.1-nano",
    kind: "system"
  }
];
var DEFAULT_JCONFIG = {
  provider: "openai",
  model: "gpt-5-nano",
  temperature: 0,
  top_p: 0.85
};
var INSTRUCTION_META_BY_KEY = (() => {
  const map = /* @__PURE__ */ new Map();
  for (const meta of PATY_SYSTEM_INSTRUCTIONS) {
    map.set(meta.iinstruccion, { ...meta, kind: "system" });
  }
  for (const tipo of PATY_PROMPT_TIPOS) {
    map.set(tipo, {
      iinstruccion: tipo,
      ninstruccion: `PROMPT_${tipo}`,
      archivo: `PROMPT_${tipo}.md`,
      descripcion: `Prompt espec\xEDfico para tipo de consulta ${tipo}`,
      defaultModel: DEFAULT_JCONFIG.model,
      kind: "tdconsulta"
    });
  }
  return map;
})();
function getInstructionCatalog() {
  return [...INSTRUCTION_META_BY_KEY.values()];
}
function allInstructionKeys(extraKeys = []) {
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  const push = (k) => {
    const key = String(k ?? "").trim().toUpperCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    out.push(key);
  };
  for (const meta of PATY_SYSTEM_INSTRUCTIONS) push(meta.iinstruccion);
  for (const tipo of PATY_PROMPT_TIPOS) push(tipo);
  const extras = [];
  for (const k of extraKeys) {
    const key = String(k ?? "").trim().toUpperCase();
    if (key && !seen.has(key)) extras.push(key);
  }
  extras.sort((a, b) => a.localeCompare(b));
  return [...out, ...extras];
}
function getInstructionMeta(iinstruccion) {
  const key = String(iinstruccion ?? "").trim().toUpperCase();
  if (!key) return null;
  const known = INSTRUCTION_META_BY_KEY.get(key);
  if (known) return known;
  return {
    iinstruccion: key,
    ninstruccion: `PROMPT_${key}`,
    archivo: `PROMPT_${key}.md`,
    descripcion: `Instrucci\xF3n ${key}`,
    defaultModel: DEFAULT_JCONFIG.model,
    kind: PATY_PROMPT_TIPOS.includes(key) ? "tdconsulta" : "unknown"
  };
}
function isTdConsultaInstruction(iinstruccion) {
  return getInstructionMeta(iinstruccion)?.kind === "tdconsulta";
}
function createPromptSlot(iinstruccion, patch = {}) {
  const meta = getInstructionMeta(iinstruccion);
  const model = patch.jconfig?.model || meta.defaultModel || DEFAULT_JCONFIG.model;
  return {
    archivo: patch.archivo || meta.archivo,
    tipo: meta.iinstruccion,
    iinstruccion: meta.iinstruccion,
    ninstruccion: meta.ninstruccion,
    kind: meta.kind,
    body: patch.body ?? "",
    source: patch.source ?? "plantilla",
    dirty: Boolean(patch.dirty),
    configDirty: Boolean(patch.configDirty),
    jconfig: patch.jconfig || { ...DEFAULT_JCONFIG, model },
    jconfigBaseline: patch.jconfigBaseline ?? null
  };
}
var PROMPT_FILE_RE = /^PROMPT_([A-Z0-9_]+)\.(md|txt)$/i;
function fileToTipo(name) {
  const m = String(name).trim().match(PROMPT_FILE_RE);
  if (!m) return null;
  const stem = m[1].toUpperCase();
  if (PATY_PROMPT_TIPOS.includes(stem)) return stem;
  if (INSTRUCTION_META_BY_KEY.has(stem)) return stem;
  return null;
}
function matchFilenameToIinstruccion(fileName) {
  const name = String(fileName ?? "").trim();
  const m = name.match(PROMPT_FILE_RE);
  if (!m) return [];
  const stem = m[1].toUpperCase();
  const matches = [];
  for (const meta of getInstructionCatalog()) {
    if (stem === meta.iinstruccion) matches.push(meta.iinstruccion);
    else if (stem === meta.ninstruccion) matches.push(meta.iinstruccion);
    else if (name.toUpperCase() === String(meta.archivo).toUpperCase()) matches.push(meta.iinstruccion);
  }
  return [...new Set(matches)];
}
function matchContentToIinstrucciones(content) {
  const text = String(content ?? "");
  if (!text.trim()) return [];
  const matches = [];
  for (const meta of getInstructionCatalog()) {
    const key = meta.iinstruccion;
    const ninst = meta.ninstruccion;
    const headerRe = new RegExp(`^#?\\s*iinstruccion\\s*:\\s*${key}\\s*$`, "im");
    const eqRe = new RegExp(`(?:^|\\n)\\s*iinstruccion\\s*=\\s*${key}\\s*(?:\\n|$)`, "i");
    const ninstRe = new RegExp(`^#?\\s*ninstruccion\\s*:\\s*${ninst}\\s*$`, "im");
    if (headerRe.test(text) || eqRe.test(text) || ninstRe.test(text)) matches.push(key);
  }
  return [...new Set(matches)];
}
function prepareFileImportRows(files) {
  return (files || []).map((f) => {
    const nameMatches = matchFilenameToIinstruccion(f.name);
    const contentMatches = matchContentToIinstrucciones(f.content);
    let suggested = "";
    let matchSource = "";
    if (nameMatches.length === 1 && (contentMatches.length === 0 || contentMatches.includes(nameMatches[0]))) {
      suggested = nameMatches[0];
      matchSource = contentMatches.length ? "filename+content" : "filename";
    } else if (nameMatches.length === 0 && contentMatches.length === 1) {
      suggested = contentMatches[0];
      matchSource = "content";
    } else if (nameMatches.length === 1 && contentMatches.length === 1 && nameMatches[0] === contentMatches[0]) {
      suggested = nameMatches[0];
      matchSource = "filename+content";
    }
    return {
      fileName: f.name,
      content: String(f.content ?? ""),
      suggested,
      matchSource,
      nameMatches,
      contentMatches,
      selected: suggested
    };
  });
}
function applyFileImportSelections(rows) {
  const updates = {};
  for (const row of rows || []) {
    const key = String(row.selected ?? "").trim().toUpperCase();
    if (!key) continue;
    updates[key] = {
      archivo: row.fileName,
      tipo: key,
      iinstruccion: key,
      body: String(row.content ?? "").trim(),
      source: "archivo",
      dirty: true
    };
  }
  return updates;
}
function sqlEscapeLiteral(text) {
  return `N'${String(text).replace(/'/g, "''")}'`;
}
function estimatePromptTokens(text) {
  const s = String(text ?? "");
  return s.trim() ? Math.ceil(s.length / 4) : 0;
}
function bodyMetrics(body) {
  const text = String(body ?? "");
  return { chars: text.length, tokens: estimatePromptTokens(text) };
}
function pickJconfigMeta(o) {
  const src = o && typeof o === "object" ? o : {};
  const meta = {};
  if (src.author != null && String(src.author).trim()) meta.author = String(src.author).trim();
  if (src.fmod != null && String(src.fmod).trim()) meta.fmod = String(src.fmod).trim();
  if (src.chars != null && Number.isFinite(Number(src.chars))) meta.chars = Number(src.chars);
  if (src.tokens != null && Number.isFinite(Number(src.tokens))) meta.tokens = Number(src.tokens);
  return meta;
}
var PATY_MODEL_OPTIONS = [
  "gpt-5-nano",
  "gpt-5-mini",
  "gpt-5-codex",
  "gpt-5-chat-latest",
  "gpt-5",
  "gpt-4.1",
  "gpt-4.1-mini",
  "gpt-4.1-nano",
  "gpt-4o",
  "gpt-4o-mini"
];
function mergeModelOptions(...models) {
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  const add = (id) => {
    const m = String(id ?? "").trim();
    if (!m || seen.has(m)) return;
    seen.add(m);
    out.push(m);
  };
  for (const id of PATY_MODEL_OPTIONS) add(id);
  for (const id of models) add(id);
  return out.sort((a, b) => a.localeCompare(b));
}
function parseJconfig(raw, fallbackModel) {
  const fb2 = String(fallbackModel || DEFAULT_JCONFIG.model).trim() || DEFAULT_JCONFIG.model;
  if (raw == null || !String(raw).trim()) {
    return { ...DEFAULT_JCONFIG, model: fb2 };
  }
  try {
    const o = typeof raw === "string" ? JSON.parse(raw) : raw;
    const modelRaw = String(o.model ?? "").trim();
    return {
      provider: String(o.provider || DEFAULT_JCONFIG.provider),
      model: modelRaw || fb2,
      temperature: Number(o.temperature ?? DEFAULT_JCONFIG.temperature),
      top_p: Number(o.top_p ?? DEFAULT_JCONFIG.top_p),
      ...pickJconfigMeta(o)
    };
  } catch {
    return { ...DEFAULT_JCONFIG, model: fb2 };
  }
}
function serializeJconfig(jc) {
  const model = String(jc?.model ?? DEFAULT_JCONFIG.model).trim() || DEFAULT_JCONFIG.model;
  const out = {
    provider: jc?.provider || DEFAULT_JCONFIG.provider,
    model,
    temperature: Number(jc?.temperature ?? DEFAULT_JCONFIG.temperature),
    top_p: Number(jc?.top_p ?? DEFAULT_JCONFIG.top_p),
    ...pickJconfigMeta(jc)
  };
  return JSON.stringify(out);
}
function syncJconfigMetrics(jc, body) {
  const { chars, tokens } = bodyMetrics(body);
  return { ...jc, chars, tokens };
}
function enrichJconfigForSave(jc, { body, author } = {}) {
  const { chars, tokens } = bodyMetrics(body);
  const next = {
    ...jc,
    chars,
    tokens,
    fmod: (/* @__PURE__ */ new Date()).toISOString()
  };
  const who = String(author ?? jc?.author ?? "").trim();
  if (who) next.author = who;
  return next;
}
function mapEntryToInstruccion(entry) {
  const explicit = String(entry.iinstruccion ?? entry.tipo ?? "").trim().toUpperCase();
  const fromName = matchFilenameToIinstruccion(entry.archivo);
  const iinstruccion = explicit || (fromName.length === 1 ? fromName[0] : null) || fileToTipo(entry.archivo);
  const meta = iinstruccion ? getInstructionMeta(iinstruccion) : null;
  const jconfig = entry.jconfig || parseJconfig(entry.jconfigRaw, meta?.defaultModel);
  const known = Boolean(meta && meta.kind !== "unknown");
  return {
    archivo: entry.archivo,
    tipo: iinstruccion,
    iinstruccion,
    ninstruccion: meta?.ninstruccion ?? (iinstruccion ? `PROMPT_${iinstruccion}` : null),
    nitdconsulta: isTdConsultaInstruction(iinstruccion) ? iinstruccion : null,
    chars: (entry.body || "").length,
    known,
    kind: meta?.kind ?? "unknown",
    source: entry.source,
    body: entry.body,
    jconfig,
    status: !iinstruccion ? "sin_mapeo" : known ? "ok" : "tipo_desconocido"
  };
}
function buildTdConsultaLinkSql(iinstruccion) {
  return `
MERGE TDCONSULTAXINSTRUCCION AS t
USING (
	SELECT c.itdconsulta, N'${iinstruccion}' AS iinstruccion, 1 AS orden
	FROM TDCONSULTA c
	WHERE c.itdconsulta = N'${iinstruccion}'
) AS s
ON t.itdconsulta = s.itdconsulta AND t.iinstruccion = s.iinstruccion
WHEN MATCHED THEN UPDATE SET t.orden = s.orden
WHEN NOT MATCHED THEN INSERT (itdconsulta, iinstruccion, orden)
	VALUES (s.itdconsulta, s.iinstruccion, s.orden);`;
}
function buildMergeSql(rows) {
  const valid = rows.filter((r) => r.iinstruccion && r.body);
  if (!valid.length) return { sql: "", rows: valid, error: "No hay instrucciones v\xE1lidas para guardar." };
  const head = `-- =====================================================================
-- Carga de instrucciones PatyIA (generado por isa-patyia)
-- Fuente: PROMPT_* (.md / .txt)
-- =====================================================================
SET NOCOUNT ON;
SET XACT_ABORT ON;
BEGIN TRAN;
`;
  const stmts = valid.map((r) => {
    const key = r.iinstruccion;
    const meta = getInstructionMeta(key);
    const ninst = r.ninstruccion || meta.ninstruccion;
    const desc = meta.descripcion || `Instrucci\xF3n ${key}`;
    const jc = r.jconfig || parseJconfig(null, meta.defaultModel);
    const jconfigJson = sqlEscapeLiteral(serializeJconfig(jc));
    const tdLink = isTdConsultaInstruction(key) ? buildTdConsultaLinkSql(key) : "";
    return `
-- ----- ${key} (${r.archivo}) -----
MERGE INSTRUCCION AS t
USING (VALUES (
	N'${key}',
	N'${ninst}',
	${sqlEscapeLiteral(r.body)},
	N'${desc.replace(/'/g, "''")}',
	N'1.0',
	1,
	${jconfigJson}
)) AS s (iinstruccion, ninstruccion, instruccion, descripcion, version, bactivo, jconfig)
ON t.iinstruccion = s.iinstruccion
WHEN MATCHED THEN UPDATE SET
	t.ninstruccion = s.ninstruccion,
	t.instruccion  = s.instruccion,
	t.descripcion  = s.descripcion,
	t.version      = s.version,
	t.bactivo      = s.bactivo,
	t.jconfig      = s.jconfig
WHEN NOT MATCHED THEN INSERT (iinstruccion, ninstruccion, instruccion, descripcion, version, bactivo, jconfig, fhini)
	VALUES (s.iinstruccion, s.ninstruccion, s.instruccion, s.descripcion, s.version, s.bactivo, s.jconfig, SYSUTCDATETIME());
${tdLink}
`;
  }).join("\n");
  const tail = `
COMMIT;

SELECT i.iinstruccion, i.ninstruccion, i.version, i.jconfig, LEN(i.instruccion) AS len_instruccion
FROM INSTRUCCION i
WHERE i.iinstruccion IN (${valid.map((r) => `N'${r.iinstruccion}'`).join(", ")})
ORDER BY i.iinstruccion;
`;
  return { sql: head + stmts + tail, rows: valid, error: null };
}
function analyzeFromEntries(entries) {
  const mapped = (entries || []).map((e) => mapEntryToInstruccion({
    archivo: e.archivo,
    body: e.body,
    source: e.source || "editor",
    iinstruccion: e.iinstruccion || e.tipo,
    jconfig: e.jconfig,
    jconfigRaw: e.jconfigRaw
  }));
  const mssql = buildMergeSql(mapped);
  return {
    mapped,
    sqlMssql: mssql.sql,
    validRows: mssql.rows,
    error: mssql.error
  };
}
function emptyPromptState() {
  const out = {};
  for (const key of allInstructionKeys()) {
    out[key] = createPromptSlot(key);
  }
  return out;
}

// js/api/systemConfigApi.ts
function systemApiBase() {
  return resolveIssApiBase();
}
function systemApiHeaders(extra = {}) {
  const h = {
    Accept: "application/json",
    "X-Patyia-Auth-Mode": "w",
    ...extra
  };
  if (Session.isLoggedIn()) Object.assign(h, Session.authHeader(), Session.appHeader());
  return h;
}
function unwrapBody(data) {
  const d = data;
  const enc = d?.encabezado;
  if (enc && typeof enc === "object" && !Array.isArray(enc) && enc.resultado === false) {
    const e = enc;
    const msg = String(e.mensaje ?? e.imensaje ?? "").trim();
    throw new Error(msg || "Error en la respuesta del servidor");
  }
  let inner = d;
  if (d?.respuesta && typeof d.respuesta === "object" && !Array.isArray(d.respuesta)) {
    inner = d.respuesta;
  } else if (d?.body && typeof d.body === "object" && !Array.isArray(d.body)) {
    inner = d.body;
  }
  const nested = inner;
  if (nested?.respuesta && typeof nested.respuesta === "object" && !Array.isArray(nested.respuesta)) {
    inner = nested.respuesta;
  }
  return inner;
}
async function jsonFetch(path, init) {
  const res = await fetch(`${systemApiBase()}${path}`, init);
  const ct = res.headers.get("content-type") || "";
  if (!res.ok) {
    let msg = res.statusText;
    if (ct.includes("json")) {
      try {
        const j = await res.json();
        const enc = j.encabezado;
        if (enc?.resultado === false && enc.mensaje) msg = String(enc.mensaje);
        else {
          const inner = j.respuesta || j.body || j;
          msg = String(inner?.message || inner?.error || j.message || j.error || msg);
        }
      } catch {
      }
    }
    throw new Error(msg || `HTTP ${res.status}`);
  }
  if (!ct.includes("json")) {
    throw new Error(`Respuesta no JSON (${res.status}) desde ${systemApiBase()}${path}`);
  }
  const raw = await res.json();
  return unwrapBody(raw);
}
async function fetchInstruccionesSystemConfig() {
  const body = await jsonFetch("/system/instrucciones", { method: "GET", headers: systemApiHeaders() });
  const rows = Array.isArray(body.rows) ? body.rows : [];
  return {
    rows,
    canEdit: !!body.canEdit,
    storage: body.storage,
    schema: body.schema,
    rowCount: Number(body.rowCount ?? rows.length) || rows.length
  };
}
async function putInstruccionUpsert(payload) {
  return jsonFetch("/system/instrucciones", {
    method: "PUT",
    headers: { ...systemApiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}
async function putInstruccionesPublish(sql) {
  return jsonFetch("/system/instrucciones", {
    method: "PUT",
    headers: { ...systemApiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ sql })
  });
}
var PERMISSIONS_ME_CACHE = { value: null, iat: 0, ttlMs: 0, key: "" };
function permissionsMeSessionKey() {
  if (!Session.isLoggedIn()) return "anon";
  const tok = Session?.current?.()?.token;
  const user = Session.username?.() || Session?.current?.()?.username;
  return String(tok || user || "anon").trim();
}
async function fetchPermissionsMe(opts) {
  if (!Session.isLoggedIn()) return null;
  const sessionKey = permissionsMeSessionKey();
  if (!opts?.force && PERMISSIONS_ME_CACHE.value && PERMISSIONS_ME_CACHE.key === sessionKey && Date.now() - PERMISSIONS_ME_CACHE.iat < PERMISSIONS_ME_CACHE.ttlMs) {
    return PERMISSIONS_ME_CACHE.value;
  }
  const f = opts?.fetchImpl ?? fetch;
  const res = await f(`${systemApiBase()}/permissions/me`, {
    method: "GET",
    headers: { ...systemApiHeaders(), Accept: "application/json" },
    credentials: "omit"
  });
  if (res.status === 401) {
    PERMISSIONS_ME_CACHE.value = null;
    return null;
  }
  if (!res.ok) return PERMISSIONS_ME_CACHE.value;
  const data = unwrapBody(await res.json());
  if (!data || data.kind !== "insoft.permissions-me") return PERMISSIONS_ME_CACHE.value;
  PERMISSIONS_ME_CACHE.value = data;
  PERMISSIONS_ME_CACHE.iat = data.iat || Date.now();
  PERMISSIONS_ME_CACHE.ttlMs = data.ttlMs || 6e4;
  PERMISSIONS_ME_CACHE.key = sessionKey;
  return data;
}

// js/tools/roleHierarchy.js
var DEFAULT_ROLE_JERARQUIA = {
  visitante: "0",
  dev: "0.0",
  dev_lead: "0.0.0",
  dev_iss: "0.0.1",
  admn: "0.1",
  auditador: "0.1.0",
  admn_isapatyia: "0.1.0.0"
};
var DEFAULT_FOR_UNKNOWN = "999";
function compareHierarchy(a, b) {
  const aParts = String(a ?? "").split(".").map((n) => Number(n) || 0);
  const bParts = String(b ?? "").split(".").map((n) => Number(n) || 0);
  const len = Math.max(aParts.length, bParts.length);
  for (let i = 0; i < len; i++) {
    const av = aParts[i] ?? 0;
    const bv = bParts[i] ?? 0;
    if (av !== bv) return av - bv;
  }
  return 0;
}
function getRoleJerarquia(roleName, permisos) {
  if (permisos && typeof permisos === "object") {
    const j = permisos.jerarquia;
    if (typeof j === "string" && j.trim()) return j.trim();
  }
  const key = String(roleName ?? "").trim().toLowerCase();
  return DEFAULT_ROLE_JERARQUIA[key] ?? DEFAULT_FOR_UNKNOWN;
}

// js/tools/roleCanonicalMeta.js
var CANONICAL_ROLE_META = {
  dev: {
    namedisplay: "Desarrollador b\xE1sico",
    descripcion: "Desarrollador b\xE1sico \u2014 rama desarrollo (hereda visitante)"
  },
  admn: {
    namedisplay: "Admn b\xE1sico",
    descripcion: "Admn b\xE1sico \u2014 permisos administrativos globales (hereda visitante)"
  },
  admn_isapatyia: {
    namedisplay: "Admn ISA-Paty",
    descripcion: "Admn ISA-Paty \u2014 permisos administrativos sobre PatyIA (hereda auditador, admn y visitante)"
  }
};
function canonicalRoleMeta(roleName) {
  const key = String(roleName ?? "").trim().toLowerCase();
  return CANONICAL_ROLE_META[key] ?? null;
}

// js/api/sessionApi.ts
function formatRoleTitle(roleName) {
  return String(roleName ?? "").split("_").map((part) => {
    const p = part.toLowerCase();
    if (p === "iss" || p === "isw") return p.toUpperCase();
    if (!p) return "";
    return p.charAt(0).toUpperCase() + p.slice(1);
  }).filter(Boolean).join(" ");
}
function roleLabel(roleName) {
  const key = String(roleName ?? "").trim().toLowerCase();
  if (!key) return "";
  const canon = canonicalRoleMeta(key);
  if (canon?.namedisplay) return canon.namedisplay;
  return formatRoleTitle(key);
}
function pickPrimaryIssRole(roles) {
  const list = (roles ?? []).map((r) => String(r ?? "").trim().toLowerCase()).filter(Boolean);
  if (!list.length) return "";
  list.sort((a, b) => compareHierarchy(getRoleJerarquia(a), getRoleJerarquia(b)));
  const elevated = list.filter((r) => r !== "visitante");
  return elevated[0] ?? list[0];
}
var INSTRUCCIONES_WRITE_CAP = "patyia.instrucciones.publish";
var ME_CAPS = {};
var ME_CAPS_KEY = "";
var ME_ISS_ROLES = [];
var ME_LOGIN_ROLE = "";
var ME_CAPS_BOOTSTRAP_TS = 0;
var ME_CAPS_INFLIGHT = null;
var ME_CAPS_RETRY_TIMER = null;
var ME_SERVER_INSTRUCCIONES_EDIT = null;
function sessionCacheKey() {
  if (!Session.isLoggedIn()) return "";
  const tok = Session?.current?.()?.token;
  const user = Session.username?.() || Session?.current?.()?.username;
  return String(tok || user || "").trim();
}
function localMeCaps() {
  if (!Session.isLoggedIn()) return {};
  const key = sessionCacheKey();
  if (key !== ME_CAPS_KEY) return {};
  return ME_CAPS;
}
var ME_CAPS_FETCH_GUARD_MS = 5e3;
var ME_CAPS_REENTRY_GUARD_MS = 1500;
async function primeMeCaps(force = false) {
  if (!Session.isLoggedIn()) return;
  if (ME_CAPS_INFLIGHT) return ME_CAPS_INFLIGHT;
  const now = Date.now();
  if (now - ME_CAPS_BOOTSTRAP_TS < ME_CAPS_REENTRY_GUARD_MS) return;
  if (!force && now - ME_CAPS_BOOTSTRAP_TS < ME_CAPS_FETCH_GUARD_MS) return;
  ME_CAPS_INFLIGHT = (async () => {
    let ok = false;
    try {
      const me = await fetchPermissionsMe({ force });
      if (me?.capabilities) {
        ME_CAPS_KEY = sessionCacheKey();
        ME_ISS_ROLES = Array.isArray(me.roles) ? me.roles.map((r) => String(r ?? "").trim()).filter(Boolean) : [];
        ME_LOGIN_ROLE = String(me.loginRole ?? "").trim();
        ME_CAPS = {
          canEditInstrucciones: !!me.capabilities.canEditInstrucciones,
          canEditOpenAiConfig: !!me.capabilities.canEditOpenAiConfig,
          canEditPromptsOperativos: !!me.capabilities.canEditPromptsOperativos,
          canEditConversacionConfig: !!me.capabilities.canEditConversacionConfig,
          canEditSwagger: !!me.capabilities.canEditSwagger,
          canOverrideSampling: !!me.capabilities.canOverrideSampling,
          canManagePermissions: !!me.capabilities.canManagePermissions,
          canImpersonate: !!me.capabilities.canImpersonate,
          canAssignUserRoles: !!me.capabilities.canAssignUserRoles,
          canAccessOthers: !!me.capabilities.canAccessOthers,
          canViewKanban: !!me.capabilities.canViewKanban,
          canEditKanbanCards: !!me.capabilities.canEditKanbanCards,
          canViewLogs: !!me.capabilities.canViewLogs,
          canViewPrompts: !!me.capabilities.canViewPrompts,
          canViewChat: !!me.capabilities.canViewChat,
          canViewConfig: !!me.capabilities.canViewConfig,
          canSendChat: !!me.capabilities.canSendChat
        };
        ME_CAPS_BOOTSTRAP_TS = Date.now();
        ok = true;
        window.dispatchEvent(new Event("patyia-apptools:caps-changed"));
      }
    } catch {
    }
    if (!ok && !ME_CAPS_RETRY_TIMER && Session.isLoggedIn()) {
      ME_CAPS_RETRY_TIMER = setTimeout(() => {
        ME_CAPS_RETRY_TIMER = null;
        void primeMeCaps(true);
      }, 4e3);
    }
  })().finally(() => {
    ME_CAPS_INFLIGHT = null;
  });
  return ME_CAPS_INFLIGHT;
}
function clearMeCaps() {
  ME_CAPS = {};
  ME_CAPS_KEY = "";
  ME_ISS_ROLES = [];
  ME_LOGIN_ROLE = "";
  ME_CAPS_BOOTSTRAP_TS = 0;
  ME_SERVER_INSTRUCCIONES_EDIT = null;
  if (ME_CAPS_RETRY_TIMER) {
    clearTimeout(ME_CAPS_RETRY_TIMER);
    ME_CAPS_RETRY_TIMER = null;
  }
}
function setServerInstruccionesCanEdit(v) {
  ME_SERVER_INSTRUCCIONES_EDIT = v;
  window.dispatchEvent(new Event("patyia-apptools:caps-changed"));
}
function notifyAuth() {
  window.dispatchEvent(new Event(Session.EVENT));
  window.dispatchEvent(new Event("patyia-apptools:auth"));
  window.dispatchEvent(new Event("isa-patyia:auth"));
}
var isLoggedIn = () => Session.isLoggedIn();
var can = (cap) => Session.can(cap);
var blockReason = (cap) => Session.blockReason(cap);
function canEditInstrucciones() {
  return !!localMeCaps().canEditInstrucciones || ME_SERVER_INSTRUCCIONES_EDIT === true;
}
function canEditPromptsOperativos() {
  return !!localMeCaps().canEditPromptsOperativos;
}
function instruccionesPublishCap() {
  return canEditInstrucciones() ? INSTRUCCIONES_WRITE_CAP : null;
}
async function login(user, pass, opts) {
  const session = await Session.login(user, pass, opts);
  notifyAuth();
  void primeMeCaps(true);
  return session;
}
function logout() {
  Session.logout();
  clearMeCaps();
  notifyAuth();
}
async function bootMeCaps() {
  return primeMeCaps(true);
}
function resolveDisplayRole() {
  if (!Session.isLoggedIn()) return "";
  const key = sessionCacheKey();
  if (key === ME_CAPS_KEY && ME_ISS_ROLES.length) {
    return roleLabel(pickPrimaryIssRole(ME_ISS_ROLES));
  }
  if (key === ME_CAPS_KEY && ME_LOGIN_ROLE) return roleLabel(ME_LOGIN_ROLE);
  const sl = Session.current()?.role;
  return sl ? roleLabel(sl) : "";
}
var clearSession = logout;
function getSession() {
  const s = Session.current();
  if (!s) return null;
  return {
    username: Session.username(),
    realUsername: Session.realUsername(),
    viewAsUsername: Session.viewAsUsername(),
    role: resolveDisplayRole(),
    expiresAt: s.expiresAt,
    sessionToken: s.token,
    app: Session.appId(),
    capabilities: Session.capabilities()
  };
}
function auditAuthor() {
  const real = String(Session.realUsername() || Session.username() || "").trim().toUpperCase();
  const viewAs = String(Session.viewAsUsername() || "").trim().toUpperCase();
  if (viewAs && real && viewAs !== real) return `${real} -> ${viewAs}`;
  return real || viewAs || "";
}
function humanPermissionError(err, cap) {
  return window.ISAFront.humanPermissionError(err, cap, blockReason);
}
function handleApiError(err, cap) {
  window.ISAFront.handleApiError(err, cap, { blockReason, clearSession, toastWarning, toastError });
}
(window.ISA = window.ISA || {}).AppSession = {
  current: () => Session.current(),
  isLoggedIn,
  username: () => Session.username(),
  capabilities: () => Session.capabilities(),
  can,
  blockReason,
  login,
  logout,
  refreshProfile: () => Session.refreshProfile(),
  clearSession,
  getSession,
  resolveDisplayRole
};

// js/api/apiClient.ts
var bridgeHttp = window.ISAFront.createCapFetch({
  Session,
  Config,
  getApiBase: patyiaCapFetchBase,
  localDirect: [
    { test: (p) => isPatyiaApiPath(p) || String(p).startsWith("/patyia"), base: PATYIA_ISS_LOCAL.replace(/\/$/, "") }
  ],
  orchOnline: PATYIA_BRIDGE_URL,
  orchOnlineInLocal: true,
  isLocal: isLocalMode
});
var capFetch = bridgeHttp.capFetch;
var apiUrl = bridgeHttp.apiUrl;
var rowVal = bridgeHttp.rowVal;
async function fetchInstruccionesPaty() {
  const data = await fetchInstruccionesSystemConfig();
  setServerInstruccionesCanEdit(!!data.canEdit);
  return { rows: data.rows, canEdit: !!data.canEdit };
}
function publishInstruccionesPaty(sql) {
  if (!canEditInstrucciones()) {
    throw new Error(
      blockReason(INSTRUCCIONES_WRITE_CAP) || "Sin permiso para publicar instrucciones"
    );
  }
  return putInstruccionesPublish(sql);
}
async function upsertInstruccionPaty(payload) {
  if (!canEditInstrucciones()) {
    throw new Error(
      blockReason(INSTRUCCIONES_WRITE_CAP) || "Sin permiso para publicar instrucciones"
    );
  }
  return putInstruccionUpsert(payload);
}

// js/tools/promptsSql/helpers.ts
var { createElement, Fragment } = getReact();
function isDraftPrompt(p) {
  if (!p) return false;
  return p.dirty || p.source === "url" || p.source === "editor" || p.source === "archivo";
}
function jconfigEqual(a, b) {
  if (!a || !b) return false;
  return a.model === b.model && Number(a.temperature) === Number(b.temperature) && Number(a.top_p) === Number(b.top_p);
}
function isConfigDirty(p) {
  if (!p?.configDirty) return false;
  if (!p.jconfigBaseline) return true;
  return !jconfigEqual(p.jconfig, p.jconfigBaseline);
}
function hasPendingChanges(p) {
  return isDraftPrompt(p) || isConfigDirty(p);
}
function readFilesAsText(fileList) {
  return Promise.all(
    [...fileList].map(async (f) => ({
      name: f.name,
      content: await f.text()
    }))
  );
}
function draftBodiesFromPrompts(prompts) {
  const bodies = {};
  for (const [tipo, p] of Object.entries(prompts)) {
    if (isDraftPrompt(p) && p?.body?.trim()) bodies[tipo] = p.body;
  }
  return bodies;
}
function urlDraftTipoSet(bootPrompts) {
  const bodies = bootPrompts?.bodies || {};
  const listed = Array.isArray(bootPrompts?.draftTipos) ? bootPrompts.draftTipos.map((t) => String(t).toUpperCase()).filter(Boolean) : Object.keys(bodies).map((t) => String(t).toUpperCase());
  return new Set(listed);
}
function ensurePublishCap(onNeedLogin) {
  const cap = instruccionesPublishCap();
  if (cap) return true;
  const reason = blockReason(INSTRUCCIONES_WRITE_CAP) || "Sin permiso para publicar instrucciones";
  toastWarning(reason);
  if (!isLoggedIn()) onNeedLogin?.();
  return false;
}

// js/core/promptVariables.ts
var MALFORMED_PROMPT_VAR_PATTERN = /\{\{\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}(?!\})/g;
var INSTRUCCION_TIPO_SLOT_RES = [/\{\{\s*instruccion_tipo\s*\}\}/i, /\{\{\s*instrucion_tipo\s*\}\}/i];
function repairPromptVarBraces(text) {
  return String(text ?? "").replace(MALFORMED_PROMPT_VAR_PATTERN, (_m, name) => `{{${name}}}`);
}
function hasInstruccionTipoSlot(text) {
  return INSTRUCCION_TIPO_SLOT_RES.some((re) => re.test(String(text ?? "")));
}
function preparePromptBodyForSave(text) {
  return repairPromptVarBraces(String(text ?? "").trim());
}

// js/tools/promptsSql/cloudRows.ts
function buildInitialPromptState(bootPrompts, urlBodies) {
  const base = emptyPromptState();
  for (const [tipo, body] of Object.entries(urlBodies)) {
    if (!urlDraftTipoSet(bootPrompts).has(String(tipo).toUpperCase())) continue;
    const key = String(tipo).toUpperCase();
    if (!base[key] && !String(body).trim()) continue;
    if (!base[key]) base[key] = createPromptSlot(key);
    if (!String(body).trim()) continue;
    base[key] = { ...base[key], body: String(body), dirty: true, source: "url" };
  }
  return base;
}
function mergeCloudRows(prev, rows, { onlyTipo = null, onlyTipos = null, ignoreUrl = false } = {}, { urlBodies, urlDraftTipos }) {
  const scope = onlyTipos?.length ? new Set(onlyTipos.map((t) => String(t).toUpperCase())) : onlyTipo ? /* @__PURE__ */ new Set([String(onlyTipo).toUpperCase()]) : null;
  const unknownKeys = [];
  const next = { ...prev };
  const touched = /* @__PURE__ */ new Set();
  for (const row of rows) {
    const tipo = String(rowVal(row, "IINSTRUCCION") ?? "").trim().toUpperCase();
    if (!tipo) continue;
    if (!next[tipo]) {
      unknownKeys.push(tipo);
      next[tipo] = createPromptSlot(tipo);
    }
    const rawBody = String(rowVal(row, "INSTRUCCION") ?? rowVal(row, "instruccion") ?? "").trim();
    const body = preparePromptBodyForSave(rawBody);
    const bodyRepaired = Boolean(rawBody && body !== rawBody);
    const rawJconfig = rowVal(row, "JCONFIG") ?? rowVal(row, "jconfig");
    const jconfig = syncJconfigMetrics(
      rawJconfig && typeof rawJconfig === "object" && !Array.isArray(rawJconfig) ? rawJconfig : parseJconfig(rawJconfig),
      body
    );
    if (scope && !scope.has(tipo)) continue;
    touched.add(tipo);
    const urlBody = ignoreUrl ? "" : urlBodies[tipo]?.trim();
    const urlIsDraft = !ignoreUrl && urlDraftTipos.has(tipo) && Boolean(urlBody);
    const basePatch = { jconfig, jconfigBaseline: { ...jconfig }, configDirty: false };
    if (urlIsDraft) {
      if (body && urlBody === body) {
        next[tipo] = { ...next[tipo], ...basePatch, body, dirty: bodyRepaired, source: "bd" };
      } else {
        next[tipo] = { ...next[tipo], ...basePatch, body: urlBody, dirty: true, source: "url" };
      }
    } else {
      next[tipo] = {
        ...next[tipo],
        ...basePatch,
        ...body ? { body, dirty: bodyRepaired, source: "bd" } : {}
      };
    }
  }
  if (ignoreUrl && scope) {
    for (const tipo of scope) {
      if (!next[tipo] || touched.has(tipo)) continue;
      next[tipo] = { ...next[tipo], body: "", dirty: false, source: "bd" };
    }
  }
  return { next, unknownKeys };
}

// js/tools/promptsSql/promptActions.ts
async function discardAllPrompts({
  instruccionKeys,
  prompts,
  applyCloudRows,
  clearUrlBodies,
  setActionBusy,
  setLoadErr
}) {
  const toReset = instruccionKeys.filter((t) => hasPendingChanges(prompts[t]));
  if (!toReset.length) {
    toastInfo("No hay cambios locales que descartar");
    return;
  }
  setActionBusy(true);
  setLoadErr("");
  try {
    const { rows } = await fetchInstruccionesPaty();
    applyCloudRows(rows, { onlyTipos: toReset, ignoreUrl: true });
    clearUrlBodies(toReset);
    toastInfo(`${toReset.length} instrucci\xF3n(es) restaurada(s) desde la base`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    setLoadErr(msg);
    toastError(msg);
  } finally {
    setActionBusy(false);
  }
}
async function saveAllPrompts({
  pendingTipos,
  prompts,
  onNeedLogin,
  applyCloudRows,
  clearUrlBodies,
  setActionBusy,
  setLoadErr
}) {
  if (!pendingTipos.length) {
    toastWarning("No hay cambios pendientes para guardar");
    return;
  }
  if (!ensurePublishCap(onNeedLogin)) return;
  const author = auditAuthor();
  const entries = pendingTipos.map((t) => ({
    archivo: prompts[t].archivo,
    iinstruccion: t,
    tipo: t,
    body: prompts[t].body || "",
    source: prompts[t].source,
    jconfig: enrichJconfigForSave(prompts[t].jconfig, {
      body: prompts[t].body,
      author
    })
  }));
  const { sqlMssql, error } = analyzeFromEntries(entries);
  if (error || !sqlMssql?.trim()) {
    toastError(error || "No se pudo generar SQL");
    return;
  }
  setActionBusy(true);
  setLoadErr("");
  try {
    await publishInstruccionesPaty(sqlMssql);
    const savedTipos = [...pendingTipos];
    clearUrlBodies(savedTipos);
    const { rows } = await fetchInstruccionesPaty();
    applyCloudRows(rows, { onlyTipos: savedTipos, ignoreUrl: true });
    toastSuccess(`${savedTipos.length} instrucci\xF3n(es) guardada(s) en Paty`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    setLoadErr(msg);
    if (e?.code === "FORBIDDEN" || e?.code === "NO_SESSION") {
      handleApiError(e, INSTRUCCIONES_WRITE_CAP);
    } else if (/permiso|autoriz|403|503|verify-access/i.test(msg)) {
      toastWarning(humanPermissionError(e, INSTRUCCIONES_WRITE_CAP));
    } else {
      toastError(msg);
    }
  } finally {
    setActionBusy(false);
  }
}
async function saveOnePrompt({
  tipo,
  body,
  prompts,
  editBlockReason,
  onNeedLogin,
  applyCloudRows,
  clearUrlBodies,
  setActionBusy,
  setLoadErr
}) {
  const key = String(tipo ?? "").trim().toUpperCase();
  const text = preparePromptBodyForSave(body);
  if (!key) throw new Error("Instrucci\xF3n no v\xE1lida");
  if (!text) throw new Error("El contenido no puede estar vac\xEDo");
  if (key === "GENERAL" && !hasInstruccionTipoSlot(text)) {
    throw new Error("El prompt GENERAL debe incluir {{instruccion_tipo}} con ambas llaves de cierre.");
  }
  if (!ensurePublishCap(onNeedLogin)) {
    throw new Error(editBlockReason || "Sin permiso para guardar en Paty");
  }
  const author = auditAuthor();
  const slot = prompts[key];
  const jconfig = enrichJconfigForSave(slot?.jconfig, { body: text, author });
  setActionBusy(true);
  setLoadErr("");
  try {
    await upsertInstruccionPaty({
      iinstruccion: key,
      instruccion: text,
      jconfig,
      author
    });
    clearUrlBodies([key]);
    const { rows } = await fetchInstruccionesPaty();
    applyCloudRows(rows, { onlyTipos: [key], ignoreUrl: true });
    toastSuccess(`${key.replace(/_/g, " ")} guardada en Paty`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    setLoadErr(msg);
    if (e?.code === "FORBIDDEN" || e?.code === "NO_SESSION") {
      handleApiError(e, INSTRUCCIONES_WRITE_CAP);
    } else if (/permiso|autoriz|403|503|verify-access/i.test(msg)) {
      toastWarning(humanPermissionError(e, INSTRUCCIONES_WRITE_CAP));
    } else {
      toastError(msg);
    }
    throw e;
  } finally {
    setActionBusy(false);
  }
}
async function applyPromptFiles(fileList, setImportDlg) {
  const files = await readFilesAsText(fileList);
  if (!files.length) return;
  const rows = prepareFileImportRows(files).filter((r) => /^PROMPT_/i.test(r.fileName));
  if (!rows.length) {
    toastWarning("Ning\xFAn PROMPT_*.md / PROMPT_*.txt reconocido en los archivos");
    return;
  }
  setImportDlg({ open: true, rows });
}
function confirmPromptFileImport(importRows, instruccionKeys, setPrompts, setActiveTab, setImportDlg) {
  const updates = applyFileImportSelections(importRows);
  const keys = Object.keys(updates);
  if (!keys.length) {
    toastWarning("Selecciona al menos una instrucci\xF3n destino");
    return;
  }
  setPrompts((prev) => {
    const next = { ...prev };
    for (const [key, data] of Object.entries(updates)) {
      if (!next[key]) next[key] = createPromptSlot(key);
      next[key] = {
        ...next[key],
        ...data,
        jconfig: syncJconfigMetrics(next[key].jconfig, data.body)
      };
    }
    return next;
  });
  const first = keys[0];
  const idx = instruccionKeys.indexOf(first);
  if (idx >= 0) setActiveTab(idx);
  setImportDlg({ open: false, rows: [] });
  toastSuccess(`${keys.length} instrucci\xF3n(es) importada(s)`);
}
async function confirmResetPromptConfig(tipo, prompts, resetConfigToDefaults) {
  const jc = prompts[tipo]?.jconfig || parseJconfig(null);
  const d = DEFAULT_JCONFIG;
  const ok = await requestConfirm({
    title: "Restablecer configuraci\xF3n",
    message: [
      `\xBFRestablecer modelo, temperatura y top_p de ${tipo.replace(/_/g, " ")}?`,
      "",
      `Modelo: ${jc.model ?? d.model} \u2192 ${d.model}`,
      `Temp: ${jc.temperature ?? d.temperature} \u2192 ${d.temperature}`,
      `Top_p: ${jc.top_p ?? d.top_p} \u2192 ${d.top_p}`
    ].join("\n"),
    confirmLabel: "Restablecer",
    cancelLabel: "Cancelar"
  });
  if (ok) resetConfigToDefaults(tipo);
}
function resetPromptConfigToDefaults(tipo, setPrompts) {
  const defaults = { ...DEFAULT_JCONFIG };
  setPrompts((prev) => {
    const current = prev[tipo];
    if (!current) return prev;
    const nextJconfig = syncJconfigMetrics(
      { ...defaults, author: current.jconfig?.author, fmod: current.jconfig?.fmod },
      current.body
    );
    if (jconfigEqual(current.jconfig, nextJconfig)) return prev;
    const baseline = current.jconfigBaseline;
    return {
      ...prev,
      [tipo]: {
        ...current,
        jconfig: nextJconfig,
        configDirty: baseline ? !jconfigEqual(nextJconfig, baseline) : false
      }
    };
  });
}

// js/tools/promptsSql/usePromptsSqlTool.ts
var { useState, useEffect, useCallback, useMemo, useRef } = getReact();
var EMPTY_BODIES = Object.freeze({});
function usePromptsSqlTool({ bootPrompts = {}, onNeedLogin }) {
  const [authTick, setAuthTick] = useState(0);
  const [instruccionesCanEdit, setInstruccionesCanEdit] = useState(false);
  useEffect(() => {
    const onAuth = () => setAuthTick((n) => n + 1);
    window.addEventListener("isa-patyia:auth", onAuth);
    window.addEventListener(Session.EVENT, onAuth);
    window.addEventListener("patyia-apptools:caps-changed", onAuth);
    if (Session.isLoggedIn()) {
      void bootMeCaps(true);
      Session.refreshProfile().finally(onAuth);
    }
    return () => {
      window.removeEventListener("isa-patyia:auth", onAuth);
      window.removeEventListener(Session.EVENT, onAuth);
      window.removeEventListener("patyia-apptools:caps-changed", onAuth);
    };
  }, []);
  const canPublish = useMemo(
    () => instruccionesCanEdit || canEditInstrucciones() || canEditPromptsOperativos(),
    [authTick, instruccionesCanEdit]
  );
  const loggedIn = useMemo(() => isLoggedIn(), [authTick]);
  const canEdit = canPublish;
  const editBlockReason = useMemo(() => {
    if (canEdit) return "";
    if (!loggedIn) return "Inicia sesi\xF3n para editar instrucciones";
    return blockReason(INSTRUCCIONES_WRITE_CAP) || "Sin permiso para editar instrucciones";
  }, [authTick, canEdit, loggedIn]);
  const saveTitle = useMemo(() => {
    if (canPublish) return "Guardar instrucciones y configuraci\xF3n en Paty (MSSQL)";
    return blockReason(INSTRUCCIONES_WRITE_CAP) || "Sin permiso para guardar en Paty";
  }, [authTick, canPublish]);
  const importTitle = useMemo(() => {
    if (canPublish) return "Importar archivos PROMPT_*.md / .txt";
    if (!loggedIn) return "Inicia sesi\xF3n para importar instrucciones";
    return blockReason(INSTRUCCIONES_WRITE_CAP) || "Sin permiso para importar instrucciones";
  }, [authTick, canPublish, loggedIn]);
  const [extraInstructionKeys, setExtraInstructionKeys] = useState([]);
  const instruccionKeys = useMemo(
    () => allInstructionKeys(extraInstructionKeys),
    [extraInstructionKeys]
  );
  const [importDlg, setImportDlg] = useState({ open: false, rows: [] });
  const urlBodies = bootPrompts.bodies ?? EMPTY_BODIES;
  const urlDraftTipos = useMemo(() => urlDraftTipoSet(bootPrompts), [bootPrompts]);
  const [prompts, setPrompts] = useState(() => buildInitialPromptState(bootPrompts, urlBodies));
  const [activeTab, setActiveTab] = useState(
    Number.isInteger(bootPrompts.activeTab) ? bootPrompts.activeTab : 0
  );
  const [jconfigDlg, setJconfigDlg] = useState({ open: false, tipo: null });
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const [mapped, setMapped] = useState([]);
  const [loadBusy, setLoadBusy] = useState(true);
  const [loadErr, setLoadErr] = useState("");
  const [actionBusy, setActionBusy] = useState(false);
  const [envRev, setEnvRev] = useState(0);
  const urlSyncRef = useRef(null);
  const applyCloudRows = useCallback((rows, options = {}) => {
    const unknownKeys = [];
    setPrompts((prev) => {
      const merged = mergeCloudRows(prev, rows, options, { urlBodies, urlDraftTipos });
      unknownKeys.push(...merged.unknownKeys);
      return merged.next;
    });
    if (unknownKeys.length) {
      setExtraInstructionKeys((prev) => {
        const merged = /* @__PURE__ */ new Set([...prev, ...unknownKeys]);
        return [...merged].sort((a, b) => a.localeCompare(b));
      });
    }
  }, [urlBodies, urlDraftTipos]);
  const clearUrlBodies = useCallback((instruccionKeysToClear) => {
    const snap = getSnapshot();
    const bodies = { ...snap.prompts?.bodies || {} };
    const draftTipos = (snap.prompts?.draftTipos || []).map((t) => String(t).toUpperCase()).filter((t) => !instruccionKeysToClear.map((x) => String(x).toUpperCase()).includes(t));
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
  const recompute = useCallback((state) => {
    const entries = Object.values(state).filter((p) => p.body?.trim() || isConfigDirty(p));
    const { mapped: m } = analyzeFromEntries(entries);
    setMapped(m);
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
        const { rows, canEdit: canEdit2 } = await fetchInstruccionesPaty();
        if (cancelled) return;
        setInstruccionesCanEdit(!!canEdit2);
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
    return () => {
      cancelled = true;
    };
  }, [envRev]);
  const pendingTipos = useMemo(
    () => instruccionKeys.filter((t) => {
      const p = prompts[t];
      if (!p?.body?.trim()) return false;
      return isDraftPrompt(p) || isConfigDirty(p);
    }),
    [prompts, instruccionKeys]
  );
  const hasLocalChanges = useMemo(
    () => instruccionKeys.some((t) => hasPendingChanges(prompts[t])),
    [prompts, instruccionKeys]
  );
  const modelSelectOptions = useMemo(
    () => mergeModelOptions(
      ...instruccionKeys.map((t) => prompts[t]?.jconfig?.model),
      ...instruccionKeys.map((t) => prompts[t]?.jconfigBaseline?.model)
    ),
    [prompts, instruccionKeys]
  );
  const filledCount = useMemo(
    () => instruccionKeys.filter((k) => prompts[k]?.body?.trim()).length,
    [prompts, instruccionKeys]
  );
  useEffect(() => {
    mergePartial({ prompts: { activeTab } });
  }, [activeTab]);
  useEffect(() => {
    if (urlSyncRef.current) clearTimeout(urlSyncRef.current);
    urlSyncRef.current = setTimeout(() => {
      const bodies = draftBodiesFromPrompts(prompts);
      mergePartial({
        prompts: { activeTab, bodies, draftTipos: Object.keys(bodies) }
      });
    }, 500);
    return () => {
      if (urlSyncRef.current) clearTimeout(urlSyncRef.current);
    };
  }, [prompts, activeTab]);
  const discardAll = useCallback(
    () => discardAllPrompts({
      instruccionKeys,
      prompts,
      applyCloudRows,
      clearUrlBodies,
      setActionBusy,
      setLoadErr
    }),
    [applyCloudRows, clearUrlBodies, prompts, instruccionKeys]
  );
  const saveAll = useCallback(
    () => saveAllPrompts({
      pendingTipos,
      prompts,
      onNeedLogin,
      applyCloudRows,
      clearUrlBodies,
      setActionBusy,
      setLoadErr
    }),
    [applyCloudRows, clearUrlBodies, pendingTipos, onNeedLogin, prompts]
  );
  const saveOneInstruction = useCallback(
    (tipo, body) => saveOnePrompt({
      tipo,
      body,
      prompts,
      editBlockReason,
      onNeedLogin,
      applyCloudRows,
      clearUrlBodies,
      setActionBusy,
      setLoadErr
    }),
    [applyCloudRows, clearUrlBodies, editBlockReason, onNeedLogin, prompts]
  );
  const onImportRowChange = useCallback((idx, selected) => {
    setImportDlg((d) => {
      const rows = d.rows.map((row, i) => i === idx ? { ...row, selected } : row);
      return { ...d, rows };
    });
  }, []);
  const confirmFileImport = useCallback(
    () => confirmPromptFileImport(importDlg.rows, instruccionKeys, setPrompts, setActiveTab, setImportDlg),
    [importDlg.rows, instruccionKeys]
  );
  const applyFiles = useCallback(
    (fileList) => {
      if (!ensurePublishCap(onNeedLogin)) return Promise.resolve();
      return applyPromptFiles(fileList, setImportDlg);
    },
    [onNeedLogin]
  );
  const onDrop = useCallback(async (e) => {
    e.preventDefault();
    setDragOver(false);
    const dt = e.dataTransfer;
    if (!dt?.files?.length) return;
    await applyFiles(dt.files);
  }, [applyFiles]);
  const onDragEnter = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);
  const onDragLeave = useCallback((e) => {
    const zone = e.currentTarget;
    const next = e.relatedTarget;
    if (!next || !zone.contains(next)) setDragOver(false);
  }, []);
  const onDragOverZone = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);
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
        jconfig: syncJconfigMetrics(prev[tipo].jconfig, body)
      }
    }));
  }, []);
  const updateConfig = useCallback((tipo, patch) => {
    setPrompts((prev) => ({
      ...prev,
      [tipo]: {
        ...prev[tipo],
        jconfig: { ...prev[tipo].jconfig, ...patch },
        configDirty: true
      }
    }));
  }, []);
  const resetConfigToDefaults = useCallback(
    (tipo) => resetPromptConfigToDefaults(tipo, setPrompts),
    []
  );
  const confirmResetConfig = useCallback(
    (tipo) => confirmResetPromptConfig(tipo, prompts, resetConfigToDefaults),
    [prompts, resetConfigToDefaults]
  );
  return {
    canPublish,
    loggedIn,
    canEdit,
    editBlockReason,
    saveTitle,
    importTitle,
    instruccionKeys,
    importDlg,
    setImportDlg,
    onImportRowChange,
    confirmFileImport,
    prompts,
    activeTab,
    setActiveTab,
    jconfigDlg,
    setJconfigDlg,
    dragOver,
    fileInputRef,
    onDragEnter,
    onDragLeave,
    onDragOverZone,
    onDrop,
    onFileInput,
    mapped,
    loadBusy,
    loadErr,
    actionBusy,
    activeTipo,
    activePrompt,
    pendingTipos,
    hasLocalChanges,
    modelSelectOptions,
    filledCount,
    discardAll,
    saveAll,
    saveOneInstruction,
    updateBody,
    updateConfig,
    confirmResetConfig
  };
}
export {
  usePromptsSqlTool
};
