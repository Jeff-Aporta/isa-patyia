/** Configuración, avatares y streaming SSE — dominio PatyIA (isa-patyia). */

/// <reference path="../global.d.ts" />



window.ISAFront.migrateLegacyGatewayKeys?.({ "jeff:gateway-local": "", "patyia-apptools:gateway-local": "", "patyia-apptools:lab-local": "" });



export const ORCH_ONLINE = "https://main-orchestrator.jeffaporta.workers.dev";

export const PATYIA_BRIDGE_URL = "https://rag-lab-bsczhqfgchgegabr.canadacentral-01.azurewebsites.net";

/** ISS AyudasCPIA local (Azure Functions routePrefix api). */
export const PATYIA_ISS_LOCAL = "http://127.0.0.1:8802";

/** Workers locales — canónico: Personal/apps/src/protocolos/dev-ports.json (npm run sync:ports). */
export const ORCH_LOCAL = "http://localhost:8790";
export const SCRUM_LOCAL = "http://localhost:8798";
export const TREE_MSGS_LOCAL = "http://localhost:8799";

/** Puente MSSQL PatyIA local (instrucciones, logs staging) — dev-local-server.mjs. */
export const PATYIA_BRIDGE_DEV = "http://127.0.0.1:8800";

export const PATYIA_BRIDGE_LOCAL = `${PATYIA_ISS_LOCAL}/api`;

/** Solo ISS AyudasCPIA local — independiente del gateway (login/orquestador siempre web). */

export const PATYIA_ISS_LOCAL_LS_KEY = "patyia-apptools:iss-local";

export const GATEWAY_LS_KEY = "jeff:gateway-local";



export function isPatyiaApiPath(path: string) {

  const p = path.startsWith("/") ? path : `/${path}`;

  return p.startsWith("/patyia") || p.startsWith("/api/patyia");

}



export function patyiaBridgeBase() {

  return (isLocalMode() ? PATYIA_BRIDGE_LOCAL : PATYIA_BRIDGE_URL).replace(/\/$/, "");

}

/** Base para capFetch: sin /api (normalizeApiPath lo añade). Local → ISS :4500. */
export function patyiaCapFetchBase() {

  return (isLocalMode() ? PATYIA_ISS_LOCAL : PATYIA_BRIDGE_URL).replace(/\/$/, "");

}



export function isLocalMode() {

  try { return localStorage.getItem(PATYIA_ISS_LOCAL_LS_KEY) === "1"; } catch { return false; }

}

/** Front servido desde localhost (QA http-server :8766, etc.). */
export function isDevHost() {
  try { return /^(localhost|127\.0\.0\.1|\[::1\])$/i.test(window.location.hostname); } catch { return false; }
}

/** Primera visita → prod (0). Solo LS; no URL ni gateway. */
export function ensureIssLocalDefault() {
  try {
    if (localStorage.getItem(PATYIA_ISS_LOCAL_LS_KEY) != null) return;
    localStorage.setItem(PATYIA_ISS_LOCAL_LS_KEY, "0");
  } catch { /* ignore */ }
}

/** Base /api del ISS AyudasCPIA — solo según preferencia LS (patyia-apptools:iss-local). */
export function resolveIssApiBase() {
  const base = (isLocalMode() ? PATYIA_BRIDGE_LOCAL : PATYIA_BRIDGE_URL).replace(/\/$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
}



export function setLocalMode(on: boolean) {

  const next = on ? "1" : "0";
  let prev = "";
  try { prev = localStorage.getItem(PATYIA_ISS_LOCAL_LS_KEY) ?? ""; } catch { /* ignore */ }
  if (prev === next) return on;
  try { localStorage.setItem(PATYIA_ISS_LOCAL_LS_KEY, next); } catch { /* ignore */ }
  window.location.reload();
  return on;

}



/** Migra jeff:gateway-local → iss-local solo si iss-local nunca se guardó. Auth siempre prod. */

export function migrateIssLocalFromGatewayFlag() {

  try {

    if (localStorage.getItem(GATEWAY_LS_KEY) === "1") {

      if (localStorage.getItem(PATYIA_ISS_LOCAL_LS_KEY) == null) {

        localStorage.setItem(PATYIA_ISS_LOCAL_LS_KEY, "1");

      }

      localStorage.setItem(GATEWAY_LS_KEY, "0");

    }

  } catch { /* ignore */ }

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

export type PatySseEvent = { event: string; data: Record<string, unknown> };



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

