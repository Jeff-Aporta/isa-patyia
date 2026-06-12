/**
 * Estado de la app en query ?s= (JSON → base64url).
 */
import { isLocalMode, setLocalMode } from "./config.ts";

const PARAM = "s";
const STATE_VERSION = 1;
const MAX_B64_LEN = 12000;
const WRITE_MS = 350;

let state = { v: STATE_VERSION, tool: "log", local: false, log: {}, prompts: {} };
let writeTimer: ReturnType<typeof setTimeout> | null = null;

function encodeState(obj: unknown) {
  const json = JSON.stringify(obj);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeState(b64url: string) {
  let b64 = String(b64url).replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  const json = decodeURIComponent(escape(atob(b64)));
  return JSON.parse(json);
}

function normalizeState(raw: Record<string, unknown> | null) {
  if (!raw || typeof raw !== "object") return state;
  return {
    v: raw.v ?? STATE_VERSION,
    tool: raw.tool === "prompts" ? "prompts" : "log",
    local: !!raw.local,
    log: raw.log && typeof raw.log === "object" ? raw.log : {},
    prompts: raw.prompts && typeof raw.prompts === "object" ? raw.prompts : {},
  };
}

export function getSnapshot() {
  return JSON.parse(JSON.stringify(state));
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

function updateUrl() {
  try {
    let enc = encodeState(state);
    if (enc.length > MAX_B64_LEN) {
      enc = encodeState(slimForUrl(state));
    }
    if (enc.length > MAX_B64_LEN) return;
    const url = new URL(location.href);
    url.searchParams.set(PARAM, enc);
    history.replaceState({ patyAppState: true }, "", url);
  } catch (e) {
    console.warn("urlState: no se pudo escribir ?s=", e);
  }
}

function scheduleWrite() {
  if (writeTimer) clearTimeout(writeTimer);
  writeTimer = setTimeout(updateUrl, WRITE_MS);
}

export function mergePartial(partial: Record<string, unknown>) {
  const nextLog = { ...state.log, ...((partial.log as object) || {}) };
  // Nunca persistir JSON grande del visor de log en ?s= (degrada el equipo).
  if ("jsonInput" in nextLog) delete nextLog.jsonInput;

  state = {
    ...state,
    ...partial,
    log: nextLog,
    prompts: { ...state.prompts, ...((partial.prompts as object) || {}) },
  };
  scheduleWrite();
  return getSnapshot();
}

/** Solo metadatos ligeros del visor de log (iconversacion), no el JSON completo. */
export function persistLogMeta(convId: string) {
  const id = convId || "";
  if (String(state.log?.convId ?? "") === id) return getSnapshot();
  return mergePartial({ log: { convId: id } });
}

function syncLocalFromGateway() {
  const local = isLocalMode();
  if (state.local === local) return;
  state = { ...state, local };
  scheduleWrite();
}

function init() {
  try {
    const raw = new URLSearchParams(location.search).get(PARAM);
    if (raw) state = normalizeState(decodeState(raw));
  } catch (e) {
    console.warn("urlState: ?s= inválido", e);
  }
  if (state.local !== isLocalMode()) {
    setLocalMode(state.local);
  }
  window.addEventListener("jeff:gateway-target", syncLocalFromGateway);
  window.addEventListener("patyia-apptools:lab-target", syncLocalFromGateway);
  return getSnapshot();
}

export const bootState = init();
export { PARAM };
