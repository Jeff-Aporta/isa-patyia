var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};

// js/core/patyia.ts
function avatarBgFromName(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = h * 31 + name.charCodeAt(i) >>> 0;
  return AVATAR_BG_PALETTE[h % AVATAR_BG_PALETTE.length];
}
function buildUserAvatarUrl(name, size = 72) {
  const label = String(name ?? "").trim() || "Usuario";
  const params = new URLSearchParams({
    name: label,
    size: String(size),
    background: avatarBgFromName(label.toLowerCase()),
    color: "ffffff",
    bold: "true",
    rounded: "true",
    format: "svg"
  });
  return `https://ui-avatars.com/api/?${params.toString()}`;
}
var ORCH_ONLINE, PATYIA_ISS_URL, PATYIA_ISS_PROD_URL, PATYIA_ISS_LOCAL, PATYIA_ISS_LOCAL_API, PATYIA_ISS_PROD_API, PATYIA_ISS_STAGING_API, AVATAR_BG_PALETTE;
var init_patyia = __esm({
  "js/core/patyia.ts"() {
    window.ISAFront.migrateLegacyGatewayKeys?.({ "jeff:gateway-local": "", "patyia-apptools:gateway-local": "", "patyia-apptools:lab-local": "" });
    ORCH_ONLINE = "https://main-orchestrator.jeffaporta.workers.dev";
    PATYIA_ISS_URL = "https://ayudascp-ia-staging.azurewebsites.net";
    PATYIA_ISS_PROD_URL = "https://ayudascp-ia.azurewebsites.net";
    PATYIA_ISS_LOCAL = "http://127.0.0.1:8802";
    PATYIA_ISS_LOCAL_API = `${PATYIA_ISS_LOCAL}/api`;
    PATYIA_ISS_PROD_API = `${PATYIA_ISS_PROD_URL}/api`;
    PATYIA_ISS_STAGING_API = `${PATYIA_ISS_URL}/api`;
    AVATAR_BG_PALETTE = [
      "1e90ff",
      "0ea5e9",
      "14b8a6",
      "22c55e",
      "84cc16",
      "eab308",
      "f97316",
      "ef4444",
      "ec4899",
      "a855f7",
      "6366f1",
      "64748b"
    ];
    try {
      window.ISAFront.buildUserAvatarUrl = buildUserAvatarUrl;
    } catch {
    }
  }
});

// js/core/platform.ts
var bridge, Session;
var init_platform = __esm({
  "js/core/platform.ts"() {
    init_patyia();
    bridge = () => window.ISAFront.createPlatformBridge("ISA");
    Session = {
      current: () => bridge().Session.current(),
      isLoggedIn: () => bridge().Session.isLoggedIn(),
      username: () => bridge().Session.username(),
      realUsername: () => bridge().Session.realUsername?.() ?? bridge().Session.username(),
      viewAsUsername: () => bridge().Session.viewAsUsername?.() ?? null,
      isViewingAs: () => bridge().Session.isViewingAs?.() ?? false,
      auditAuthor: () => bridge().Session.auditAuthor?.() ?? String(bridge().Session.username() || "").trim().toUpperCase(),
      authHeader: () => bridge().Session.authHeader(),
      appHeader: () => bridge().Session.appHeader(),
      appId: () => bridge().Session.appId(),
      login: (u, p, opts) => bridge().Session.login(u, p, opts),
      logout: () => bridge().Session.logout(),
      refreshProfile: () => bridge().Session.refreshProfile(),
      fetchViewAsCatalog: () => bridge().Session.fetchViewAsCatalog?.(),
      searchSuplantacionUsers: (q, limit) => bridge().Session.searchSuplantacionUsers?.(q, limit),
      setViewAs: (u) => bridge().Session.setViewAs?.(u),
      clearViewAs: () => bridge().Session.clearViewAs?.(),
      capabilities: () => bridge().Session.capabilities(),
      adminCapabilities: () => bridge().Session.adminCapabilities?.() ?? bridge().Session.capabilities(),
      capabilityCatalog: () => bridge().Session.capabilityCatalog?.() ?? [],
      can: (cap) => bridge().Session.can(cap),
      blockReason: (cap) => bridge().Session.blockReason(cap),
      get EVENT() {
        return bridge().Session.EVENT;
      }
    };
  }
});

// js/api/portalJwtApi.ts
function orchBase() {
  return ORCH_ONLINE.replace(/\/$/, "");
}
function authHeaders() {
  const h = { Accept: "application/json" };
  if (Session.isLoggedIn()) {
    Object.assign(h, Session.authHeader(), Session.appHeader());
  }
  return h;
}
function portalUrl(portal, query = "") {
  const q = `portal=${encodeURIComponent(portal)}${query ? `&${query}` : ""}`;
  return `${orchBase()}/api/auth/portal-jwt?${q}`;
}
async function fetchPortalJwt(portal = PATYIA_PORTAL_ID) {
  const res = await fetch(portalUrl(portal), { headers: authHeaders() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    throw new Error(data.error || "No se pudo cargar el JWT del portal");
  }
  return data;
}
async function fetchPortalJwtForUser(username, portal = PATYIA_PORTAL_ID) {
  const q = `username=${encodeURIComponent(String(username).trim().toUpperCase())}`;
  const res = await fetch(portalUrl(portal, q), { headers: authHeaders() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    throw new Error(data.error || "No se pudo cargar el JWT del usuario");
  }
  return data;
}
async function fetchPortalJwtCatalog(portal = PATYIA_PORTAL_ID) {
  const res = await fetch(
    `${orchBase()}/api/auth/portal-jwt/catalog?portal=${encodeURIComponent(portal)}`,
    { headers: authHeaders() }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    throw new Error(data.error || "No se pudo listar JWT de portal");
  }
  return data;
}
async function savePortalJwt(token, portal = PATYIA_PORTAL_ID) {
  const res = await fetch(portalUrl(portal), {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ portal, token })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    throw new Error(data.error || "No se pudo guardar el JWT del portal");
  }
  return data;
}
async function removePortalJwt(portal = PATYIA_PORTAL_ID) {
  const res = await fetch(portalUrl(portal), { method: "DELETE", headers: authHeaders() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    throw new Error(data.error || "No se pudo eliminar el JWT del portal");
  }
}
var PATYIA_PORTAL_ID;
var init_portalJwtApi = __esm({
  "js/api/portalJwtApi.ts"() {
    init_platform();
    init_patyia();
    PATYIA_PORTAL_ID = "soporte-staging";
  }
});
init_portalJwtApi();
export {
  PATYIA_PORTAL_ID,
  fetchPortalJwt,
  fetchPortalJwtCatalog,
  fetchPortalJwtForUser,
  removePortalJwt,
  savePortalJwt
};
