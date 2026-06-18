/**
 * Estado de la app en ?s= — esquema isa-patyia sobre url-state compartido.
 */
import { isLocalMode, setLocalMode } from "./patyia.ts";

const STATE_VERSION = 1;

function normalizeLog(raw: unknown) {
  if (!raw || typeof raw !== "object") return {};
  const o = { ...(raw as Record<string, unknown>) };
  delete o.sidebarW;
  return o;
}

function initial() {
  return { v: STATE_VERSION, tool: "log", local: false, log: {}, prompts: {}, chat: {}, todos: {} };
}

function normalizeTool(raw: unknown) {
  if (raw === "prompts") return "prompts";
  if (raw === "chat") return "chat";
  if (raw === "todos") return "todos";
  return "log";
}

function normalize(raw: Record<string, unknown> | null, _prev: unknown) {
  if (!raw || typeof raw !== "object") return initial();
  const tool = normalizeTool(raw.tool);
  const chat = raw.chat && typeof raw.chat === "object" ? raw.chat : {};
  const todos = raw.todos && typeof raw.todos === "object" ? raw.todos : {};
  return {
    v: raw.v ?? STATE_VERSION,
    tool,
    local: !!raw.local,
    log: normalizeLog(raw.log),
    prompts: raw.prompts && typeof raw.prompts === "object" ? raw.prompts : {},
    chat,
    todos,
  };
}

function slimForUrl(src: Record<string, unknown>) {
  const slim = { ...src };
  const log = slim.log as Record<string, unknown> | undefined;
  if (log) {
    const nextLog = { ...log };
    delete nextLog.sidebarW;
    if (nextLog.jsonInput && String(nextLog.jsonInput).length > 4000) {
      slim.log = { convId: nextLog.convId || "" };
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
  delete (nextLog as Record<string, unknown>).sidebarW;
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
export const PARAM = urlState.PARAM;

/** Reinicia estado de la app y elimina por completo ?s= de la URL. */
export function resetUrlState() {
  const snap = urlState.reset();
  stripUrlStateParam();
  return snap;
}

/** Solo metadatos ligeros del visor de log (iconversacion), no el JSON completo. */
export function persistLogMeta(convId: string) {
  const snap = getSnapshot();
  const id = convId || "";
  if (String((snap.log as Record<string, unknown>)?.convId ?? "") === id) return snap;
  return mergePartial({ log: { convId: id } });
}
