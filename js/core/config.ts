import { Config } from "./platform.ts";

window.ISAFront.migrateLegacyGatewayKeys?.({
  "jeff:gateway-local": "",
  "patyia-apptools:gateway-local": "",
  "patyia-apptools:lab-local": "",
});

export const ORCH_ONLINE = "https://main-orchestrator.jeffaporta.workers.dev";
export const PATYIA_BRIDGE_URL = "https://rag-lab-bsczhqfgchgegabr.canadacentral-01.azurewebsites.net";
export const PATYIA_BRIDGE_LOCAL = "http://127.0.0.1:4500";

export function isPatyiaApiPath(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return p.startsWith("/patyia") || p.startsWith("/api/patyia");
}

export function patyiaBridgeBase() {
  return (isLocalMode() ? PATYIA_BRIDGE_LOCAL : PATYIA_BRIDGE_URL).replace(/\/$/, "");
}

export function isLocalMode() {
  try { return Config.isLocal(); } catch { return false; }
}

export function setLocalMode(on: boolean) {
  Config.setLocal(on);
  window.dispatchEvent(new Event("patyia-apptools:lab-target"));
  return on;
}
