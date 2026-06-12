/**
 * API base — local vía main-orchestrator; en línea sigue lab Azure (legacy, isa-patyia sin migrar).
 */

const LS_LOCAL = "patyia-apptools:gateway-local";
const LS_LOCAL_LEGACY = "patyia-apptools:lab-local";

/** Orquestador Jeff-Aporta (mismo criterio que front-shared/constants.js). */
export const ORCH_LOCAL = "http://localhost:8780";
export const ORCH_ONLINE = "https://main-orchestrator.jeffaporta.workers.dev";

/** Legacy directo a lab-langgraph Azure — solo modo «en línea» hasta pruebas isa-patyia. */
export const LAB_LEGACY_ONLINE = "https://rag-lab-bsczhqfgchgegabr.canadacentral-01.azurewebsites.net";

const host = location.hostname;
const isDevHost = host === "localhost" || host === "127.0.0.1" || host === "[::1]";

if (isDevHost) {
  try {
    const hasKey =
      localStorage.getItem(LS_LOCAL) != null || localStorage.getItem(LS_LOCAL_LEGACY) != null;
    if (!hasKey) localStorage.setItem(LS_LOCAL, "1");
  } catch {
    /* ignore */
  }
}

export function isLocalMode() {
  try {
    const v = localStorage.getItem(LS_LOCAL);
    if (v != null) return v === "1";
    return localStorage.getItem(LS_LOCAL_LEGACY) === "1";
  } catch (_) {
    return false;
  }
}

export function setLocalMode(enabled: boolean) {
  try {
    localStorage.setItem(LS_LOCAL, enabled ? "1" : "0");
    localStorage.removeItem(LS_LOCAL_LEGACY);
  } catch (_) {
    /* ignore */
  }
  window.dispatchEvent(new Event("patyia-apptools:lab-target"));
  return enabled;
}

/** true cuando las peticiones van al orquestador (modo local). */
export function usesOrchestrator() {
  return isLocalMode();
}

export function getApiBase() {
  return isLocalMode() ? ORCH_LOCAL : LAB_LEGACY_ONLINE;
}

export function getLabTargetLabel() {
  return isLocalMode() ? "orquestador :8780" : "lab Azure (legacy)";
}

/** @deprecated alias */
export function getLabBase() {
  return getApiBase();
}

/** @deprecated */
export const LAB_LOCAL = ORCH_LOCAL;
/** @deprecated */
export const LAB_ONLINE = LAB_LEGACY_ONLINE;
