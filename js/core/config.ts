import { Config } from "./platform.ts";

window.ISAFront.migrateLegacyGatewayKeys?.({
  "jeff:gateway-local": "",
  "patyia-apptools:gateway-local": "",
  "patyia-apptools:lab-local": "",
});

export const ORCH_ONLINE = "https://main-orchestrator.jeffaporta.workers.dev";

export function isLocalMode() {
  try { return Config.isLocal(); } catch { return false; }
}

export function setLocalMode(on: boolean) {
  Config.setLocal(on);
  window.dispatchEvent(new Event("patyia-apptools:lab-target"));
  return on;
}
