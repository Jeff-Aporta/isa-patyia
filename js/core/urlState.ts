/**
 * Estado de la app en ?s= — esquema isa-patyia sobre url-state compartido.
 */
import { isLocalMode, setLocalMode } from "./config.ts";

const STATE_VERSION = 1;

function normalizeLog(raw: unknown) {
  if (!raw || typeof raw !== "object") return {};
  const o = { ...(raw as Record<string, unknown>) };
  const w = Number(o.sidebarW);
  if (Number.isFinite(w)) o.sidebarW = Math.min(560, Math.max(220, Math.round(w)));
  else delete o.sidebarW;
  return o;
}

function initial() {
  return { v: STATE_VERSION, tool: "log", local: false, log: {}, prompts: {} };
}

function normalize(raw: Record<string, unknown> | null, _prev: unknown) {
  if (!raw || typeof raw !== "object") return initial();
  return {
    v: raw.v ?? STATE_VERSION,
    tool: raw.tool === "prompts" ? "prompts" : "log",
    local: !!raw.local,
    log: normalizeLog(raw.log),
    prompts: raw.prompts && typeof raw.prompts === "object" ? raw.prompts : {},
  };
}

function slimForUrl(src: Record<string, unknown>) {
  const slim = { ...src };
  const log = slim.log as Record<string, unknown> | undefined;
  if (log?.jsonInput && String(log.jsonInput).length > 4000) {
    slim.log = { convId: log.convId || "" };
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
  };
}

const urlState = window.ISAFront.createUrlState({
  param: "s",
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
});

export const bootState = urlState.boot;
export const getSnapshot = urlState.getSnapshot;
export const mergePartial = urlState.mergePartial;
export const PARAM = urlState.PARAM;

/** Solo metadatos ligeros del visor de log (iconversacion), no el JSON completo. */
export function persistLogMeta(convId: string) {
  const snap = getSnapshot();
  const id = convId || "";
  if (String((snap.log as Record<string, unknown>)?.convId ?? "") === id) return snap;
  return mergePartial({ log: { convId: id } });
}
