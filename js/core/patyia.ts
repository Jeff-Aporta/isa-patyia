/** Configuración, avatares y streaming SSE — dominio PatyIA (isa-patyia). */
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

/** Avatar generado por nombre vía UI Avatars (https://ui-avatars.com). */
export function buildUserAvatarUrl(name: string | null | undefined, size = 72): string {
  const label = String(name ?? "").trim() || "Usuario";
  const params = new URLSearchParams({
    name: label,
    size: String(size),
    background: "1e90ff",
    color: "ffffff",
    bold: "true",
    format: "svg",
  });
  return `https://ui-avatars.com/api/?${params.toString()}`;
}

/** Parser SSE del stream POST /api/conversacion (PatyIA). */
export type PatySseEvent = {
  event: string;
  data: Record<string, unknown>;
};

export async function readPatyiaSseStream(
  response: Response,
  onEvent: (ev: PatySseEvent) => void,
): Promise<Record<string, unknown>> {
  if (!response.ok) {
    let msg = response.statusText;
    try {
      const j = await response.json();
      msg = String(j?.error || j?.message || msg);
    } catch { /* ignore */ }
    throw new Error(msg || `HTTP ${response.status}`);
  }
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Stream no disponible");

  const dec = new TextDecoder();
  let buf = "";
  let lastPayload: Record<string, unknown> = {};

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const blocks = buf.split("\n\n");
    buf = blocks.pop() || "";
    for (const block of blocks) {
      const lines = block.split("\n");
      let event = "message";
      let dataLine = "";
      for (const line of lines) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) dataLine += line.slice(5).trim();
      }
      if (!dataLine) continue;
      try {
        const data = JSON.parse(dataLine) as Record<string, unknown>;
        lastPayload = data;
        onEvent({ event, data });
      } catch { /* ignore malformed */ }
    }
  }
  return lastPayload;
}
