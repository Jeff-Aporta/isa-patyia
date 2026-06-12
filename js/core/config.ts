/**
 * API base vía main-orchestrator (front-shared/constants.js).
 * Compat: migra claves legacy patyia-apptools:* → jeff:gateway-local.
 */
import { Config } from "./platform.ts";

const LS_LEGACY = "patyia-apptools:gateway-local";
const LS_LEGACY2 = "patyia-apptools:lab-local";

/** @deprecated usar Config.base() */
export const ORCH_LOCAL = "http://localhost:8780";
/** @deprecated usar Config.base() */
export const ORCH_ONLINE = "https://main-orchestrator.jeffaporta.workers.dev";
/** @deprecated ya no se usa Azure directo */
export const LAB_LEGACY_ONLINE = ORCH_ONLINE;

try {
  const host = location.hostname;
  const isDev = host === "localhost" || host === "127.0.0.1" || host === "[::1]";
  const hasJeff = localStorage.getItem("jeff:gateway-local") != null;
  const legacy = localStorage.getItem(LS_LEGACY) ?? localStorage.getItem(LS_LEGACY2);
  if (!hasJeff && legacy != null) {
    localStorage.setItem("jeff:gateway-local", legacy === "1" ? "1" : "0");
    localStorage.removeItem(LS_LEGACY);
    localStorage.removeItem(LS_LEGACY2);
  } else if (isDev && !hasJeff && legacy == null) {
    localStorage.setItem("jeff:gateway-local", "1");
  }
} catch { /* ignore */ }

export function isLocalMode() {
  try {
    return Config.isLocal();
  } catch {
    return false;
  }
}

export function setLocalMode(enabled: boolean) {
  Config.setLocal(enabled);
  window.dispatchEvent(new Event("patyia-apptools:lab-target"));
  return enabled;
}

export function usesOrchestrator() {
  return true;
}

export function getApiBase() {
  return Config.base();
}

export function getLabTargetLabel() {
  return isLocalMode() ? "orquestador :8780" : "main-orchestrator";
}

/** @deprecated */
export function getLabBase() {
  return getApiBase();
}

export const LAB_LOCAL = ORCH_LOCAL;
export const LAB_ONLINE = ORCH_ONLINE;
