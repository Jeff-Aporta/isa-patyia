/** Estado de la app en ?s= — esquema isa-patyia sobre url-state compartido. */
import { isLocalMode, isDevHost, setLocalMode } from "./patyia.ts";

const STATE_VERSION = 1;

function normalizeLog(raw: unknown) {
  if (!raw || typeof raw !== "object") return {};
  const o = { ...(raw as Record<string, unknown>) };
  const w = Number(o.sidebarW);
  if (Number.isFinite(w) && w > 0) o.sidebarW = Math.round(w);
  else delete o.sidebarW;
  return o;
}

function initial() { return { v: STATE_VERSION, tool: "log", local: false, log: {}, prompts: {}, chat: {}, todos: {} }; }

function normalizeTool(raw: unknown) {
  if (raw === "prompts") return "prompts";
  if (raw === "chat") return "chat";
  if (raw === "todos") return "todos";
  if (raw === "config") return "config";
  return "log";
}

function normalizeChatBag(chat: unknown) {
  const bag = chat && typeof chat === "object" ? { ...(chat as Record<string, unknown>) } : {};
  if ((bag.mode == null || String(bag.mode).trim() === "") && bag.jailbreak != null) {
    bag.mode = bag.jailbreak === true ? "libre" : "patyia";
    delete bag.jailbreak;
  } else if (bag.jailbreak != null) {
    delete bag.jailbreak;
  }
  return bag;
}

function normalize(raw: Record<string, unknown> | null, _prev: unknown) {
  if (!raw || typeof raw !== "object") return initial();
  const tool = normalizeTool(raw.tool);
  const chat = normalizeChatBag(raw.chat);
  const todos = raw.todos && typeof raw.todos === "object" ? raw.todos : {};
  return {
    v: raw.v ?? STATE_VERSION, tool, local: !!raw.local,
    log: normalizeLog(raw.log),
    prompts: raw.prompts && typeof raw.prompts === "object" ? raw.prompts : {},
    chat, todos,
  };
}

function slimForUrl(src: Record<string, unknown>) {
  const slim = { ...src };
  const log = slim.log as Record<string, unknown> | undefined;
  if (log) {
    const nextLog = { ...log };
    if (nextLog.jsonInput && String(nextLog.jsonInput).length > 4000) {
      slim.log = {
        convId: nextLog.convId || "",
        ...(nextLog.sidebarW != null ? { sidebarW: nextLog.sidebarW } : {}),
      };
    } else {
      slim.log = nextLog;
    }
  }
  const prompts = slim.prompts as Record<string, unknown> | undefined;
  if (prompts?.bodies) {
    const bodies: Record<string, string> = {};
    let total = 0;
    for (const [k, v] of Object.entries(prompts.bodies as Record<string, unknown>)) {
      const t = String(v ?? "");
      if (total + t.length > 6000) break;
      bodies[k] = t;
      total += t.length;
    }
    slim.prompts = { ...prompts, bodies };
  }
  return slim;
}

function merge(state: Record<string, unknown>, partial: Record<string, unknown>) {
  const nextLog = { ...(state.log as object), ...((partial.log as object) || {}) };
  if ("jsonInput" in nextLog) delete (nextLog as Record<string, unknown>).jsonInput;
  return {
    ...state,
    ...partial,
    log: nextLog,
    prompts: {
      ...(state.prompts as Record<string, unknown>),
      ...((partial.prompts as Record<string, unknown>) || {}),
    },
    chat: {
      ...(state.chat as Record<string, unknown>),
      ...((partial.chat as Record<string, unknown>) || {}),
    },
    todos: {
      ...(state.todos as Record<string, unknown>),
      ...((partial.todos as Record<string, unknown>) || {}),
    },
  };
}

const URL_STATE_PARAM = "s";

function stripUrlStateParam() {
  try {
    const url = new URL(location.href);
    if (!url.searchParams.has(URL_STATE_PARAM)) return;
    url.searchParams.delete(URL_STATE_PARAM);
    history.replaceState(null, "", url);
  } catch { /* ignore */ }
}

/** Migra ?tool=log&log.convId=… → ?s= (b64url JSON) antes de leer el estado. */
function migrateLegacyFlatQuery() {
  if (typeof window === "undefined" || !window.ISAFront?.b64urlEncode) return;
  try {
    const url = new URL(location.href);
    if (url.searchParams.has(URL_STATE_PARAM)) return;
    const tool = url.searchParams.get("tool");
    const legacyKeys = [...url.searchParams.keys()].filter(
      (k) => k === "tool" || k === "local" || k.includes("."),
    );
    if (!legacyKeys.length) return;

    const next: Record<string, unknown> = {
      v: STATE_VERSION,
      tool: normalizeTool(tool),
      local: url.searchParams.get("local") === "1" || url.searchParams.get("local") === "true",
      log: {},
      prompts: {},
      chat: {},
      todos: {},
    };

    for (const [key, raw] of url.searchParams.entries()) {
      if (key === "tool" || key === "local") continue;
      const dot = key.indexOf(".");
      if (dot < 0) continue;
      const section = key.slice(0, dot);
      const field = key.slice(dot + 1);
      if (section !== "log" && section !== "prompts" && section !== "chat" && section !== "todos") continue;
      const bag = (next[section] as Record<string, unknown>) || {};
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
  } catch { /* ignore */ }
}

migrateLegacyFlatQuery();

const urlState = window.ISAFront.createUrlState({
  param: URL_STATE_PARAM,
  debounceMs: 350,
  maxB64Len: 12000,
  historyKey: "patyAppState",
  initial,
  normalize,
  slimForUrl,
  merge,
  onInit(state) {
    if (state.local !== isLocalMode()) setLocalMode(!!state.local);
    else if (!state.local && isDevHost()) setLocalMode(true);
  },
  gatewayEvents: ["gateway:target", "patyia-apptools:lab-target"],
  onGatewayChange(state, api) {
    const local = isLocalMode();
    if (state.local === local) return;
    api.merge({ local });
  },
  brandHomeReset(api) {
    const snap = api.reset();
    stripUrlStateParam();
    return snap;
  },
});

export const bootState = urlState.boot;
export const getSnapshot = urlState.getSnapshot;
export const mergePartial = urlState.mergePartial;
export const hrefFor = urlState.hrefFor;
export const subscribe = urlState.subscribe;
export const PARAM = urlState.PARAM;

/** Reinicia estado de la app y elimina por completo ?s= de la URL. */
export function resetUrlState() { const snap = urlState.reset(); stripUrlStateParam(); return snap; }

/** Ancho del panel Entrada (visor log) en ?s=.log.sidebarW */
export function persistLogSidebarWidth(width: number) {
  const n = Math.round(Number(width));
  if (!Number.isFinite(n) || n <= 0) return getSnapshot();
  const snap = getSnapshot();
  const prev = Number((snap.log as Record<string, unknown>)?.sidebarW);
  if (prev === n) return snap;
  return mergePartial({ log: { sidebarW: n } });
}

/** Solo metadatos ligeros del visor de log (iconversacion), no el JSON completo. */
export function persistLogMeta(convId: string) {
  const snap = getSnapshot();
  const id = convId || "";
  if (String((snap.log as Record<string, unknown>)?.convId ?? "") === id) return snap;
  return mergePartial({ log: { convId: id } });
}

/** Conversación activa del chat staging — iconversacion en ?s=.chat.convId */
export function persistChatConvId(convId: number | null | undefined) {
  const snap = getSnapshot();
  const id = convId != null && Number(convId) > 0 ? Number(convId) : null;
  const prev = Number((snap.chat as Record<string, unknown>)?.convId) || null;
  if (prev === id) return snap;
  return mergePartial({ tool: "chat", chat: { convId: id } });
}

/** Fuente de mensajes del chat — prod | logs en ?s=.chat.messageSource */
export function persistChatMessageSource(source: "prod" | "logs") {
  const snap = getSnapshot();
  const prev = (snap.chat as Record<string, unknown>)?.messageSource;
  if (prev === source) return snap;
  return mergePartial({ tool: "chat", chat: { messageSource: source } });
}

/** Modo de conversación — patyia | libre en ?s=.chat.mode */
export function persistChatMode(mode: string) {
  const normalized = String(mode || "patyia").trim().toLowerCase() || "patyia";
  const snap = getSnapshot();
  const prev = String((snap.chat as Record<string, unknown>)?.mode || "patyia");
  if (prev === normalized) return snap;
  return mergePartial({ tool: "chat", chat: { mode: normalized } });
}
