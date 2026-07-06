// js/core/patyia.ts
window.ISAFront.migrateLegacyGatewayKeys?.({ "jeff:gateway-local": "", "patyia-apptools:gateway-local": "", "patyia-apptools:lab-local": "" });
var ORCH_ONLINE = "https://main-orchestrator.jeffaporta.workers.dev";
var PATYIA_BRIDGE_URL = "https://ayudascp-ia-staging.azurewebsites.net";
var PATYIA_ISS_LOCAL = "http://127.0.0.1:8802";
var ORCH_LOCAL = "http://localhost:8790";
var SCRUM_LOCAL = "http://localhost:8798";
var TREE_MSGS_LOCAL = "http://localhost:8799";
var PATYIA_BRIDGE_DEV = "http://127.0.0.1:8800";
var PATYIA_BRIDGE_LOCAL = `${PATYIA_ISS_LOCAL}/api`;
var PATYIA_ISS_LOCAL_LS_KEY = "patyia-apptools:iss-local";
var GATEWAY_LS_KEY = "jeff:gateway-local";
function isPatyiaApiPath(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return p.startsWith("/patyia") || p.startsWith("/api/patyia");
}
function patyiaBridgeBase() {
  return (isLocalMode() ? PATYIA_BRIDGE_LOCAL : PATYIA_BRIDGE_URL).replace(/\/$/, "");
}
function patyiaCapFetchBase() {
  return (isLocalMode() ? PATYIA_ISS_LOCAL : PATYIA_BRIDGE_URL).replace(/\/$/, "");
}
function isLocalMode() {
  try {
    return localStorage.getItem(PATYIA_ISS_LOCAL_LS_KEY) === "1";
  } catch {
    return false;
  }
}
function isDevHost() {
  try {
    return /^(localhost|127\.0\.0\.1|\[::1\])$/i.test(window.location.hostname);
  } catch {
    return false;
  }
}
function ensureIssLocalDefault() {
  try {
    if (localStorage.getItem(PATYIA_ISS_LOCAL_LS_KEY) != null) return;
    localStorage.setItem(PATYIA_ISS_LOCAL_LS_KEY, "0");
  } catch {
  }
}
function resolveIssApiBase() {
  const base = (isLocalMode() ? PATYIA_BRIDGE_LOCAL : PATYIA_BRIDGE_URL).replace(/\/$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
}
function setLocalMode(on) {
  const next = on ? "1" : "0";
  let prev = "";
  try {
    prev = localStorage.getItem(PATYIA_ISS_LOCAL_LS_KEY) ?? "";
  } catch {
  }
  if (prev === next) return on;
  try {
    localStorage.setItem(PATYIA_ISS_LOCAL_LS_KEY, next);
  } catch {
  }
  window.location.reload();
  return on;
}
function migrateIssLocalFromGatewayFlag() {
  try {
    if (localStorage.getItem(GATEWAY_LS_KEY) === "1") {
      if (localStorage.getItem(PATYIA_ISS_LOCAL_LS_KEY) == null) {
        localStorage.setItem(PATYIA_ISS_LOCAL_LS_KEY, "1");
      }
      localStorage.setItem(GATEWAY_LS_KEY, "0");
    }
  } catch {
  }
}
function buildUserAvatarUrl(name, size = 72) {
  const label = String(name ?? "").trim() || "Usuario";
  const params = new URLSearchParams({
    name: label,
    size: String(size),
    background: "1e90ff",
    color: "ffffff",
    bold: "true",
    format: "svg"
  });
  return `https://ui-avatars.com/api/?${params.toString()}`;
}
async function readPatyiaSseStream(response, onEvent) {
  if (!response.ok) {
    let msg = response.statusText;
    try {
      const j = await response.json();
      msg = String(j?.error || j?.message || msg);
    } catch {
    }
    throw new Error(msg || `HTTP ${response.status}`);
  }
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Stream no disponible");
  const dec = new TextDecoder();
  let buf = "";
  let lastPayload = {};
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
        const data = JSON.parse(dataLine);
        lastPayload = data;
        onEvent({ event, data });
      } catch {
      }
    }
  }
  return lastPayload;
}
export {
  GATEWAY_LS_KEY,
  ORCH_LOCAL,
  ORCH_ONLINE,
  PATYIA_BRIDGE_DEV,
  PATYIA_BRIDGE_LOCAL,
  PATYIA_BRIDGE_URL,
  PATYIA_ISS_LOCAL,
  PATYIA_ISS_LOCAL_LS_KEY,
  SCRUM_LOCAL,
  TREE_MSGS_LOCAL,
  buildUserAvatarUrl,
  ensureIssLocalDefault,
  isDevHost,
  isLocalMode,
  isPatyiaApiPath,
  migrateIssLocalFromGatewayFlag,
  patyiaBridgeBase,
  patyiaCapFetchBase,
  readPatyiaSseStream,
  resolveIssApiBase,
  setLocalMode
};
