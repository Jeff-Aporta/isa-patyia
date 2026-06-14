/**
 * Gateway local/prod — delega en ISAFront.Config + migración legacy isa-patyia.
 */
import { Config } from "./platform.ts";

window.ISAFront.migrateLegacyGatewayKeys?.({
  "jeff:gateway-local": "",
  "patyia-apptools:gateway-local": "",
  "patyia-apptools:lab-local": "",
});

/** @deprecated usar Config.base() */
export const ORCH_LOCAL = "http://localhost:8780";
/** @deprecated usar Config.base() */
export const ORCH_ONLINE = "https://main-orchestrator.jeffaporta.workers.dev";
/** @deprecated alias histórico — mismo orquestador CF */
export const LAB_LEGACY_ONLINE = ORCH_ONLINE;
export const LAB_LOCAL = ORCH_LOCAL;
export const LAB_ONLINE = ORCH_ONLINE;

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
  try {
    return Config.label?.() ?? (isLocalMode() ? "Local" : "Producción");
  } catch {
    return isLocalMode() ? "Local" : "Producción";
  }
}

/** @deprecated */
export function getLabBase() {
  return getApiBase();
}
