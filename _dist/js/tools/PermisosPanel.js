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
function patyiaIssBase() {
  const t = getIssTarget();
  if (t === "local") return PATYIA_ISS_LOCAL.replace(/\/$/, "");
  if (t === "production") return PATYIA_ISS_PROD_URL.replace(/\/$/, "");
  return PATYIA_ISS_URL.replace(/\/$/, "");
}
function resolveIssApiBase() {
  const base = patyiaIssBase();
  return base.endsWith("/api") ? base : `${base}/api`;
}
function getIssTarget() {
  try {
    const raw = localStorage.getItem(PATYIA_ISS_TARGET_LS_KEY);
    if (raw === "production" || raw === "staging" || raw === "local") return raw;
  } catch {
  }
  return isDevHost() ? "local" : "staging";
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
    if (localStorage.getItem(PATYIA_ISS_TARGET_LS_KEY) != null) return;
    const def = isDevHost() ? "local" : "staging";
    localStorage.setItem(PATYIA_ISS_TARGET_LS_KEY, def);
  } catch {
  }
}
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
var PATYIA_ISS_URL, PATYIA_ISS_PROD_URL, PATYIA_ISS_LOCAL, PATYIA_ISS_LOCAL_API, PATYIA_ISS_PROD_API, PATYIA_ISS_STAGING_API, PATYIA_ISS_TARGET_LS_KEY, AVATAR_BG_PALETTE;
var init_patyia = __esm({
  "js/core/patyia.ts"() {
    window.ISAFront.migrateLegacyGatewayKeys?.({ "jeff:gateway-local": "", "patyia-apptools:gateway-local": "", "patyia-apptools:lab-local": "" });
    PATYIA_ISS_URL = "https://ayudascp-ia-staging.azurewebsites.net";
    PATYIA_ISS_PROD_URL = "https://ayudascp-ia.azurewebsites.net";
    PATYIA_ISS_LOCAL = "http://127.0.0.1:8802";
    PATYIA_ISS_LOCAL_API = `${PATYIA_ISS_LOCAL}/api`;
    PATYIA_ISS_PROD_API = `${PATYIA_ISS_PROD_URL}/api`;
    PATYIA_ISS_STAGING_API = `${PATYIA_ISS_URL}/api`;
    PATYIA_ISS_TARGET_LS_KEY = "patyia-apptools:iss-target";
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
function frontSharedLazy() {
  const api = window.ISAFront;
  return api?.ensureCodeMirrorLoaded ? api : null;
}
function getGlass() {
  const g = window.ISAFront?.Glass;
  if (!g?.GlassCard) {
    throw new Error("ISAFront.Glass no cargado \u2014 recargue sin cach\xE9 (Ctrl+Shift+R).");
  }
  return g;
}
function toastError(text, timeout) {
  fb()?.toast?.error?.(text, timeout);
}
function toastSuccess(text, timeout) {
  fb()?.toast?.success?.(text, timeout);
}
function toastInfo(text, timeout) {
  fb()?.toast?.info?.(text, timeout);
}
var bridge, UI, Session, Assets, getReact, getReactDOM, getMaterialUI, fb;
var init_platform = __esm({
  "js/core/platform.ts"() {
    init_patyia();
    bridge = () => window.ISAFront.createPlatformBridge("ISA");
    UI = {
      get Icon() {
        return bridge().UI.Icon;
      },
      get TargetSwitch() {
        return bridge().UI.TargetSwitch;
      },
      get ThemeSwitch() {
        return bridge().UI.ThemeSwitch;
      },
      get useRealtimeStatus() {
        return bridge().UI.useRealtimeStatus;
      },
      get RealtimeStatusDot() {
        return bridge().UI.RealtimeStatusDot;
      },
      get Loading() {
        return bridge().UI.Loading;
      },
      get ErrorBox() {
        return bridge().UI.ErrorBox;
      },
      get LoginGate() {
        return bridge().UI.LoginGate;
      },
      get LoginButton() {
        return bridge().UI.LoginButton;
      }
    };
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
    Assets = {
      ensureCodeMirrorLoaded: (opts) => {
        const api = frontSharedLazy();
        return api ? api.ensureCodeMirrorLoaded(opts) : Promise.resolve();
      },
      ensureMarked: () => {
        const api = frontSharedLazy();
        return api ? api.ensureMarked() : Promise.resolve();
      },
      ensureStylesheet: (href) => {
        const api = frontSharedLazy();
        return api ? api.ensureLazyStylesheet(href) : Promise.resolve();
      },
      ensureChatStagingCss: () => {
        const api = frontSharedLazy();
        if (!api) return;
        const prefix = typeof window !== "undefined" && window.__ISA_DIST__ ? "_dist/" : "";
        api.ensureLazyStylesheet(`${prefix}css/chat-staging.css`).catch((err) => {
          console.warn("chat-staging.css:", err);
        });
      },
      ensureTodosCss: () => {
        const api = frontSharedLazy();
        if (!api) return;
        const prefix = typeof window !== "undefined" && window.__ISA_DIST__ ? "_dist/" : "";
        api.ensureLazyStylesheet(`${prefix}css/todos-staging.css`).catch((err) => {
          console.warn("todos-staging.css:", err);
        });
      }
    };
    getReact = () => window.ISAFront.getReact();
    getReactDOM = () => window.ISAFront.getReactDOM();
    getMaterialUI = () => window.ISAFront.getMaterialUI();
    fb = () => globalThis.ISAFront?.Feedback;
  }
});

// js/api/systemConfigApi.ts
function systemApiBase() {
  return resolveIssApiBase();
}
function systemApiHeaders(extra = {}) {
  const h = {
    Accept: "application/json",
    "X-Patyia-Auth-Mode": "w",
    ...extra
  };
  if (Session.isLoggedIn()) Object.assign(h, Session.authHeader(), Session.appHeader());
  for (const k of Object.keys(h)) {
    if (/^x-view-as-/i.test(k)) delete h[k];
  }
  return h;
}
function unwrapBody(data) {
  const d = data;
  const enc = d?.encabezado;
  if (enc && typeof enc === "object" && !Array.isArray(enc) && enc.resultado === false) {
    const e = enc;
    const msg = String(e.mensaje ?? e.imensaje ?? "").trim();
    throw new Error(msg || "Error en la respuesta del servidor");
  }
  let inner = d;
  if (d?.respuesta && typeof d.respuesta === "object" && !Array.isArray(d.respuesta)) {
    inner = d.respuesta;
  } else if (d?.body && typeof d.body === "object" && !Array.isArray(d.body)) {
    inner = d.body;
  }
  const nested = inner;
  if (nested?.respuesta && typeof nested.respuesta === "object" && !Array.isArray(nested.respuesta)) {
    inner = nested.respuesta;
  }
  return inner;
}
async function jsonFetch(path, init) {
  const res = await fetch(`${systemApiBase()}${path}`, init);
  const ct = res.headers.get("content-type") || "";
  if (!res.ok) {
    let msg = res.statusText;
    if (ct.includes("json")) {
      try {
        const j = await res.json();
        const enc = j.encabezado;
        if (enc?.resultado === false && enc.mensaje) msg = String(enc.mensaje);
        else {
          const inner = j.respuesta || j.body || j;
          msg = String(inner?.message || inner?.error || j.message || j.error || msg);
        }
      } catch {
      }
    }
    throw new Error(msg || `HTTP ${res.status}`);
  }
  if (!ct.includes("json")) {
    throw new Error(`Respuesta no JSON (${res.status}) desde ${systemApiBase()}${path}`);
  }
  const raw = await res.json();
  return unwrapBody(raw);
}
function permEntityKey(entry) {
  return String(entry?.ientity ?? entry?.iusuario ?? "").trim();
}
function normalizePermEntry(entry) {
  const key = permEntityKey(entry);
  return {
    iusuario: key,
    ientity: key || void 0,
    itipo: entry?.itipo === "user" ? "user" : "role",
    permisos: entry?.permisos && typeof entry.permisos === "object" ? entry.permisos : {},
    bactivo: entry?.bactivo !== false
  };
}
function normalizeHierarchyNode(node) {
  const iusuario = permEntityKey(node).toLowerCase();
  return {
    iusuario,
    jerarquia: String(node.jerarquia ?? iusuario ?? "").trim(),
    namedisplay: node.namedisplay != null ? String(node.namedisplay) : null,
    descripcion: node.descripcion != null ? String(node.descripcion) : null
  };
}
function normalizePermissionsPayload(raw) {
  const roles = (Array.isArray(raw?.roles) ? raw.roles : []).map((e) => normalizePermEntry(e));
  const users = (Array.isArray(raw?.users) ? raw.users : []).map((e) => normalizePermEntry(e));
  return { ...raw, roles, users };
}
function permissionsMeSessionKey() {
  if (!Session.isLoggedIn()) return "anon";
  const tok = Session?.current?.()?.token;
  const user = Session.username?.() || Session?.current?.()?.username;
  return String(tok || user || "anon").trim();
}
async function fetchPermissionsMe(opts) {
  if (!Session.isLoggedIn()) return null;
  const sessionKey = permissionsMeSessionKey();
  if (!opts?.force && PERMISSIONS_ME_CACHE.value && PERMISSIONS_ME_CACHE.key === sessionKey && Date.now() - PERMISSIONS_ME_CACHE.iat < PERMISSIONS_ME_CACHE.ttlMs) {
    return PERMISSIONS_ME_CACHE.value;
  }
  const f = opts?.fetchImpl ?? fetch;
  const res = await f(`${systemApiBase()}/permissions/me`, {
    method: "GET",
    headers: { ...systemApiHeaders(), Accept: "application/json" },
    credentials: "omit"
  });
  if (res.status === 401) {
    PERMISSIONS_ME_CACHE.value = null;
    return null;
  }
  if (!res.ok) return PERMISSIONS_ME_CACHE.value;
  const data = unwrapBody(await res.json());
  if (!data || data.kind !== "insoft.permissions-me") return PERMISSIONS_ME_CACHE.value;
  PERMISSIONS_ME_CACHE.value = data;
  PERMISSIONS_ME_CACHE.iat = data.iat || Date.now();
  PERMISSIONS_ME_CACHE.ttlMs = data.ttlMs || 6e4;
  PERMISSIONS_ME_CACHE.key = sessionKey;
  return data;
}
function applyPermissionsMeToKanban(data, me) {
  if (!me) return data;
  return {
    ...data,
    canManage: me.capabilities.canManagePermissions,
    canAssignUserRoles: me.capabilities.canAssignUserRoles,
    canEditRoleDescriptions: me.capabilities.canEditRoleDescriptions || me.capabilities.canManagePermissions,
    actorRoles: me.roles,
    _permissionsMe: me
  };
}
async function fetchHierarchy() {
  const raw = await jsonFetch(`/system/permisos/hierarchy`, {
    method: "GET",
    headers: systemApiHeaders()
  });
  const roles = (Array.isArray(raw?.roles) ? raw.roles : []).map((r) => normalizeHierarchyNode(r)).filter((r) => r.iusuario && r.jerarquia);
  return { roles, count: roles.length || Number(raw?.count ?? 0) || 0 };
}
async function createHierarchyRole(input) {
  return jsonFetch(`/system/permisos/hierarchy/roles`, {
    method: "POST",
    headers: { ...systemApiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
}
async function updateHierarchyRole(name, input) {
  return jsonFetch(`/system/permisos/hierarchy/roles/${encodeURIComponent(name)}`, {
    method: "PUT",
    headers: { ...systemApiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
}
async function deleteHierarchyRole(name) {
  await jsonFetch(`/system/permisos/hierarchy/roles/${encodeURIComponent(name)}`, {
    method: "DELETE",
    headers: systemApiHeaders()
  });
}
async function fetchPermisos(opts) {
  const qs = new URLSearchParams();
  const search = String(opts?.search ?? "").trim();
  const role = String(opts?.role ?? "").trim();
  const limit = opts?.limit != null && Number.isFinite(Number(opts.limit)) ? Math.min(500, Math.max(1, Math.floor(Number(opts.limit)))) : void 0;
  if (search) qs.set("search", search);
  if (role) qs.set("role", role);
  if (limit != null) qs.set("limit", String(limit));
  const q = qs.toString();
  const [raw, me] = await Promise.all([
    jsonFetch(`/system/permisos${q ? `?${q}` : ""}`, { method: "GET", headers: systemApiHeaders() }),
    fetchPermissionsMe().catch(() => null)
  ]);
  return applyPermissionsMeToKanban(normalizePermissionsPayload(raw), me);
}
async function searchPermisosUsers(query = "", opts) {
  const q = String(query ?? "").trim();
  const limit = opts?.limit != null && Number.isFinite(Number(opts.limit)) ? Math.min(500, Math.max(1, Math.floor(Number(opts.limit)))) : 10;
  const result = await fetchPermisos({
    ...q ? { search: q } : {},
    ...opts?.role ? { role: opts.role } : {},
    limit
  });
  return (result.users ?? []).map((e) => ({
    username: String(e.iusuario ?? "").trim().toUpperCase(),
    displayName: (() => {
      const p = e.permisos;
      const name = p?.nombre ?? p?.namedisplay;
      return name != null && String(name).trim() ? String(name).trim() : null;
    })()
  })).filter((u) => u.username).slice(0, limit);
}
async function putPermisoRolePath(name, permisos, bactivo) {
  const role = encodeURIComponent(String(name).trim().toLowerCase().replace(/^role:/, ""));
  const body = { permisos };
  if (bactivo !== void 0) body.bactivo = bactivo;
  return jsonFetch(`/system/permisos/roles/${role}`, {
    method: "PUT",
    headers: { ...systemApiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}
async function patchUsuarioRoles(username, body) {
  const u = encodeURIComponent(String(username).trim().toUpperCase());
  return jsonFetch(`/system/permisos/usuarios/${u}/roles`, {
    method: "PATCH",
    headers: { ...systemApiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}
async function addUsuarioRole(username, role) {
  const u = encodeURIComponent(String(username).trim().toUpperCase());
  return jsonFetch(`/system/permisos/usuarios/${u}/roles`, {
    method: "PATCH",
    headers: { ...systemApiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ toRole: String(role).trim().toLowerCase(), mode: "add" })
  });
}
async function removeUsuarioRole(username, role) {
  const u = encodeURIComponent(String(username).trim().toUpperCase());
  return jsonFetch(`/system/permisos/usuarios/${u}/roles`, {
    method: "PATCH",
    headers: { ...systemApiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ fromRole: String(role).trim().toLowerCase(), mode: "remove" })
  });
}
function requireAppSession(onNeedLogin) {
  if (Session.isLoggedIn()) return true;
  onNeedLogin?.();
  return false;
}
var PERMISSIONS_ME_CACHE;
var init_systemConfigApi = __esm({
  "js/api/systemConfigApi.ts"() {
    init_platform();
    init_patyia();
    PERMISSIONS_ME_CACHE = { value: null, iat: 0, ttlMs: 0, key: "" };
  }
});

// js/tools/roleHierarchy.js
function compareHierarchy(a, b) {
  const aParts = String(a ?? "").split(".").map((n) => Number(n) || 0);
  const bParts = String(b ?? "").split(".").map((n) => Number(n) || 0);
  const len = Math.max(aParts.length, bParts.length);
  for (let i = 0; i < len; i++) {
    const av = aParts[i] ?? 0;
    const bv = bParts[i] ?? 0;
    if (av !== bv) return av - bv;
  }
  return 0;
}
function getRoleJerarquia(roleName, permisos) {
  if (permisos && typeof permisos === "object") {
    const j = permisos.jerarquia;
    if (typeof j === "string" && j.trim()) return j.trim();
  }
  const key = String(roleName ?? "").trim().toLowerCase();
  return DEFAULT_ROLE_JERARQUIA[key] ?? DEFAULT_FOR_UNKNOWN;
}
function ancestorsFromPath(jerarquia) {
  const parts = String(jerarquia ?? "").split(".").filter(Boolean);
  const out = [];
  for (let i = parts.length - 1; i >= 0; i--) {
    out.push(parts.slice(0, i + 1).join("."));
  }
  return out;
}
function isSameInheritanceLine(a, b) {
  const x = String(a ?? "").trim();
  const y = String(b ?? "").trim();
  if (!x || !y) return false;
  if (x === y) return true;
  return x.startsWith(`${y}.`) || y.startsWith(`${x}.`);
}
function canManageRole(actorJerarquia, targetJerarquia) {
  const target = String(targetJerarquia ?? "").trim();
  if (!target || target === DEFAULT_FOR_UNKNOWN) return false;
  return isSameInheritanceLine(actorJerarquia, target);
}
function actorCanManageTarget(actorJerarquias, targetJerarquia) {
  for (const j of actorJerarquias ?? []) {
    if (canManageRole(j, targetJerarquia)) return true;
  }
  return false;
}
function actorJerarquiasFromRoles(roles, rolePermisosByName = {}) {
  return (roles ?? []).map((r) => String(r ?? "").trim().toLowerCase()).filter((r) => r && r !== "visitante").map((r) => getRoleJerarquia(r, rolePermisosByName[r]));
}
function actorJerarquiaFromRoles(roles, rolePermisosByName = {}) {
  const jerarquias = actorJerarquiasFromRoles(roles, rolePermisosByName);
  if (!jerarquias.length) return DEFAULT_FOR_UNKNOWN;
  jerarquias.sort((a, b) => {
    const depth = (s) => String(s).split(".").filter(Boolean).length;
    const d = depth(b) - depth(a);
    if (d !== 0) return d;
    return compareHierarchy(a, b);
  });
  return jerarquias[0];
}
function formatJerarquiaLabel(jerarquia) {
  if (jerarquia == null || jerarquia === "") return "";
  return `(${jerarquia})`;
}
function isBranchZero(jerarquia) {
  const j = String(jerarquia ?? "").trim();
  return j === "0" || j.startsWith("0.");
}
function actorIsDevLead(actorRoles) {
  return (actorRoles ?? []).some((r) => String(r ?? "").trim().toLowerCase() === "dev_lead");
}
var DEFAULT_ROLE_JERARQUIA, DEFAULT_FOR_UNKNOWN;
var init_roleHierarchy = __esm({
  "js/tools/roleHierarchy.js"() {
    DEFAULT_ROLE_JERARQUIA = {
      visitante: "0",
      dev: "0.0",
      dev_lead: "0.0.0",
      dev_iss: "0.0.1",
      admn: "0.1",
      auditador: "0.1.0",
      admn_isapatyia: "0.1.0.0"
    };
    DEFAULT_FOR_UNKNOWN = "999";
  }
});

// js/tools/roleCanonicalMeta.js
function canonicalRoleMeta(roleName) {
  const key = String(roleName ?? "").trim().toLowerCase();
  return CANONICAL_ROLE_META[key] ?? null;
}
var CANONICAL_ROLE_META;
var init_roleCanonicalMeta = __esm({
  "js/tools/roleCanonicalMeta.js"() {
    CANONICAL_ROLE_META = {
      dev: {
        namedisplay: "Desarrollador b\xE1sico",
        descripcion: "Desarrollador b\xE1sico \u2014 rama desarrollo (hereda visitante)"
      },
      admn: {
        namedisplay: "Admn b\xE1sico",
        descripcion: "Admn b\xE1sico \u2014 permisos administrativos globales (hereda visitante)"
      },
      admn_isapatyia: {
        namedisplay: "Admn ISA-Paty",
        descripcion: "Admn ISA-Paty \u2014 permisos administrativos sobre PatyIA (hereda auditador, admn y visitante)"
      }
    };
  }
});

// js/core/viewAsRole.ts
function roleKey(name) {
  return String(name ?? "").trim().toLowerCase();
}
function isDevBranchRole(roleName) {
  const key = roleKey(roleName);
  if (!key) return false;
  if (key === "dev" || key.startsWith("dev_")) return true;
  const j = getRoleJerarquia(key);
  return j === "0.0" || j.startsWith("0.0.");
}
function readViewAsRole() {
  try {
    const v = roleKey(localStorage.getItem(VIEW_AS_ROLE_LS_KEY));
    if (!v || v === "dev_lead") return "";
    if (!ROLE_CAPS_PRESETS[v]) return "";
    return v;
  } catch {
    return "";
  }
}
function writeViewAsRole(roleName) {
  const key = roleKey(roleName);
  try {
    if (!key || key === "dev_lead" || !ROLE_CAPS_PRESETS[key]) {
      localStorage.removeItem(VIEW_AS_ROLE_LS_KEY);
    } else {
      localStorage.setItem(VIEW_AS_ROLE_LS_KEY, key);
    }
  } catch {
  }
  try {
    window.dispatchEvent(new CustomEvent(VIEW_AS_ROLE_EVENT, { detail: { role: readViewAsRole() } }));
    window.dispatchEvent(new Event("patyia-apptools:caps-changed"));
  } catch {
  }
}
function clearViewAsRole() {
  writeViewAsRole("");
}
function realRolesAllowViewAs(roles) {
  return (roles ?? []).some((r) => isDevBranchRole(r));
}
var VIEW_AS_ROLE_LS_KEY, VIEW_AS_ROLE_EVENT, NONE, ROLE_CAPS_PRESETS;
var init_viewAsRole = __esm({
  "js/core/viewAsRole.ts"() {
    init_roleCanonicalMeta();
    init_roleHierarchy();
    VIEW_AS_ROLE_LS_KEY = "isa-patyia:view-as-role";
    VIEW_AS_ROLE_EVENT = "patyia-apptools:view-as-role";
    NONE = Object.freeze({
      canEditInstrucciones: false,
      canEditOpenAiConfig: false,
      canEditPromptsOperativos: false,
      canEditConversacionConfig: false,
      canEditSwagger: false,
      canOverrideSampling: false,
      canManagePermissions: false,
      canImpersonate: false,
      canAssignUserRoles: false,
      canAccessOthers: false,
      canViewKanban: false,
      canEditKanbanCards: false,
      canViewLogs: true,
      canViewPrompts: false,
      canViewChat: true,
      canViewConfig: false,
      canSendChat: true
    });
    ROLE_CAPS_PRESETS = Object.freeze({
      visitante: { ...NONE },
      dev: {
        ...NONE,
        canViewPrompts: true,
        canViewConfig: true,
        canViewKanban: true
      },
      dev_iss: {
        ...NONE,
        canViewPrompts: true,
        canViewConfig: true,
        canEditInstrucciones: true,
        canEditPromptsOperativos: true,
        canOverrideSampling: true,
        canViewKanban: true,
        canEditKanbanCards: true,
        canAccessOthers: true
      },
      auditador: {
        ...NONE,
        canViewPrompts: true,
        canViewConfig: true,
        canAccessOthers: true,
        canViewKanban: true
      },
      admn: {
        ...NONE,
        canViewPrompts: true,
        canViewConfig: true,
        canViewKanban: true,
        canEditKanbanCards: true
      },
      admn_isapatyia: {
        ...NONE,
        canViewPrompts: true,
        canViewConfig: true,
        canEditOpenAiConfig: true,
        canEditConversacionConfig: true,
        canEditInstrucciones: true,
        canAssignUserRoles: true,
        canViewKanban: true,
        canEditKanbanCards: true
      },
      /** Referencia: Dev Lead real (no se ofrece como simulación). */
      dev_lead: {
        canEditInstrucciones: true,
        canEditOpenAiConfig: true,
        canEditPromptsOperativos: true,
        canEditConversacionConfig: true,
        canEditSwagger: true,
        canOverrideSampling: true,
        canManagePermissions: true,
        canImpersonate: true,
        canAssignUserRoles: true,
        canAccessOthers: true,
        canViewKanban: true,
        canEditKanbanCards: true,
        canViewLogs: true,
        canViewPrompts: true,
        canViewChat: true,
        canViewConfig: true,
        canSendChat: true
      }
    });
  }
});

// js/api/sessionApi.ts
function stripViewAsHeaders(headers) {
  const out = { ...headers };
  for (const k of Object.keys(out)) {
    if (/^x-view-as-/i.test(k)) delete out[k];
  }
  return out;
}
function installViewAsFrontOnlyGuard() {
  const bag = Session;
  if (!bag || bag.__viewAsFrontOnly) return;
  const origAuth = typeof bag.authHeader === "function" ? bag.authHeader.bind(bag) : null;
  if (!origAuth) return;
  const withoutViewAs = () => stripViewAsHeaders({ ...origAuth() });
  bag.authHeader = withoutViewAs;
  const origRefresh = typeof bag.refreshProfile === "function" ? bag.refreshProfile.bind(bag) : null;
  if (origRefresh) {
    bag.refreshProfile = async () => {
      bag.authHeader = origAuth;
      try {
        return await origRefresh();
      } finally {
        bag.authHeader = withoutViewAs;
      }
    };
  }
  bag.__viewAsFrontOnly = true;
}
function formatRoleTitle2(roleName) {
  return String(roleName ?? "").split("_").map((part) => {
    const p = part.toLowerCase();
    if (p === "iss" || p === "isw") return p.toUpperCase();
    if (!p) return "";
    return p.charAt(0).toUpperCase() + p.slice(1);
  }).filter(Boolean).join(" ");
}
function roleLabel(roleName) {
  const key = String(roleName ?? "").trim().toLowerCase();
  if (!key) return "";
  const canon = canonicalRoleMeta(key);
  if (canon?.namedisplay) return canon.namedisplay;
  return formatRoleTitle2(key);
}
function pickPrimaryIssRole(roles) {
  const list = (roles ?? []).map((r) => String(r ?? "").trim().toLowerCase()).filter(Boolean);
  if (!list.length) return "";
  list.sort((a, b) => compareHierarchy(getRoleJerarquia(a), getRoleJerarquia(b)));
  const elevated = list.filter((r) => r !== "visitante");
  return elevated[0] ?? list[0];
}
function resolvePrimaryIssRoleId() {
  if (!Session.isLoggedIn()) return "";
  const key = sessionCacheKey();
  if (key === ME_CAPS_KEY && ME_ISS_ROLES.length) return pickPrimaryIssRole(ME_ISS_ROLES);
  if (key === ME_CAPS_KEY && ME_LOGIN_ROLE) return String(ME_LOGIN_ROLE).trim().toLowerCase();
  const sl = Session.current()?.role;
  return sl ? String(sl).trim().toLowerCase() : "";
}
function sessionCacheKey() {
  if (!Session.isLoggedIn()) return "";
  const tok = Session?.current?.()?.token;
  const user = Session.username?.() || Session?.current?.()?.username;
  return String(tok || user || "").trim();
}
async function primeMeCaps(force = false) {
  if (!Session.isLoggedIn()) return;
  if (ME_CAPS_INFLIGHT) return ME_CAPS_INFLIGHT;
  const now = Date.now();
  if (now - ME_CAPS_BOOTSTRAP_TS < ME_CAPS_REENTRY_GUARD_MS) return;
  if (!force && now - ME_CAPS_BOOTSTRAP_TS < ME_CAPS_FETCH_GUARD_MS) return;
  ME_CAPS_INFLIGHT = (async () => {
    let ok = false;
    try {
      const me = await fetchPermissionsMe({ force });
      if (me?.capabilities) {
        ME_CAPS_KEY = sessionCacheKey();
        ME_ISS_ROLES = Array.isArray(me.roles) ? me.roles.map((r) => String(r ?? "").trim()).filter(Boolean) : [];
        ME_LOGIN_ROLE = String(me.loginRole ?? "").trim();
        ME_CAPS = {
          canEditInstrucciones: !!me.capabilities.canEditInstrucciones,
          canEditOpenAiConfig: !!me.capabilities.canEditOpenAiConfig,
          canEditPromptsOperativos: !!me.capabilities.canEditPromptsOperativos,
          canEditConversacionConfig: !!me.capabilities.canEditConversacionConfig,
          canEditSwagger: !!me.capabilities.canEditSwagger,
          canOverrideSampling: !!me.capabilities.canOverrideSampling,
          canManagePermissions: !!me.capabilities.canManagePermissions,
          canImpersonate: !!me.capabilities.canImpersonate,
          canAssignUserRoles: !!me.capabilities.canAssignUserRoles,
          canAccessOthers: !!me.capabilities.canAccessOthers,
          canViewKanban: !!me.capabilities.canViewKanban,
          canEditKanbanCards: !!me.capabilities.canEditKanbanCards,
          canViewLogs: !!me.capabilities.canViewLogs,
          canViewPrompts: !!me.capabilities.canViewPrompts,
          canViewChat: !!me.capabilities.canViewChat,
          canViewConfig: !!me.capabilities.canViewConfig,
          canSendChat: !!me.capabilities.canSendChat
        };
        ME_CAPS_BOOTSTRAP_TS = Date.now();
        ok = true;
        if (readViewAsRole() && !realRolesAllowViewAs(ME_ISS_ROLES)) clearViewAsRole();
        window.dispatchEvent(new Event("patyia-apptools:caps-changed"));
      }
    } catch {
    }
    if (!ok && !ME_CAPS_RETRY_TIMER && Session.isLoggedIn()) {
      ME_CAPS_RETRY_TIMER = setTimeout(() => {
        ME_CAPS_RETRY_TIMER = null;
        void primeMeCaps(true);
      }, 4e3);
    }
  })().finally(() => {
    ME_CAPS_INFLIGHT = null;
  });
  return ME_CAPS_INFLIGHT;
}
function clearMeCaps() {
  ME_CAPS = {};
  ME_CAPS_KEY = "";
  ME_ISS_ROLES = [];
  ME_LOGIN_ROLE = "";
  ME_CAPS_BOOTSTRAP_TS = 0;
  ME_SERVER_INSTRUCCIONES_EDIT = null;
  if (ME_CAPS_RETRY_TIMER) {
    clearTimeout(ME_CAPS_RETRY_TIMER);
    ME_CAPS_RETRY_TIMER = null;
  }
}
function notifyAuth() {
  window.dispatchEvent(new Event(Session.EVENT));
  window.dispatchEvent(new Event("patyia-apptools:auth"));
  window.dispatchEvent(new Event("isa-patyia:auth"));
}
async function login(user, pass, opts) {
  const session = await Session.login(user, pass, opts);
  notifyAuth();
  void primeMeCaps(true);
  return session;
}
function logout() {
  Session.logout();
  clearMeCaps();
  clearViewAsRole();
  notifyAuth();
}
function roleLooksLikeDevBranch(raw) {
  const s = String(raw ?? "").trim().toLowerCase();
  if (!s) return false;
  if (isDevBranchRole(s)) return true;
  return /\bdev(\s+lead|\s+iss)?\b/.test(s) || /^desarrollador/.test(s);
}
function canViewAsRole() {
  if (!Session.isLoggedIn()) return false;
  const key = sessionCacheKey();
  if (key === ME_CAPS_KEY && realRolesAllowViewAs(ME_ISS_ROLES)) return true;
  if (ME_ISS_ROLES.length && realRolesAllowViewAs(ME_ISS_ROLES)) return true;
  if (roleLooksLikeDevBranch(Session.current?.()?.role)) return true;
  try {
    if (roleLooksLikeDevBranch(window.ISA?.AppSession?.resolveDisplayRole?.())) return true;
  } catch {
  }
  return false;
}
function getViewAsRole() {
  if (!canViewAsRole() && !readViewAsRole()) return "";
  return readViewAsRole();
}
function isViewingAsRole() {
  return !!(readViewAsRole() && canViewAsRole());
}
function setViewAsRole(roleName) {
  if (!roleName) {
    clearViewAsRole();
    return;
  }
  if (!canViewAsRole()) return;
  writeViewAsRole(roleName);
}
function stopViewAsRole() {
  clearViewAsRole();
}
function resolveDisplayRole() {
  if (!Session.isLoggedIn()) return "";
  const key = sessionCacheKey();
  if (key === ME_CAPS_KEY && ME_ISS_ROLES.length) {
    return roleLabel(pickPrimaryIssRole(ME_ISS_ROLES));
  }
  if (key === ME_CAPS_KEY && ME_LOGIN_ROLE) {
    return roleLabel(ME_LOGIN_ROLE);
  }
  const sl = Session.current()?.role;
  return sl ? roleLabel(sl) : "";
}
function getSession() {
  const s = Session.current();
  if (!s) return null;
  return {
    username: Session.username(),
    realUsername: Session.realUsername(),
    viewAsUsername: Session.viewAsUsername(),
    role: resolveDisplayRole(),
    expiresAt: s.expiresAt,
    sessionToken: s.token,
    app: Session.appId(),
    capabilities: Session.capabilities()
  };
}
var ME_CAPS, ME_CAPS_KEY, ME_ISS_ROLES, ME_LOGIN_ROLE, ME_CAPS_BOOTSTRAP_TS, ME_CAPS_INFLIGHT, ME_CAPS_RETRY_TIMER, ME_SERVER_INSTRUCCIONES_EDIT, ME_CAPS_FETCH_GUARD_MS, ME_CAPS_REENTRY_GUARD_MS, isLoggedIn, can, blockReason, clearSession;
var init_sessionApi = __esm({
  "js/api/sessionApi.ts"() {
    init_platform();
    init_platform();
    init_systemConfigApi();
    init_roleHierarchy();
    init_roleCanonicalMeta();
    init_viewAsRole();
    installViewAsFrontOnlyGuard();
    try {
      window.addEventListener("isa-patyia:auth", () => installViewAsFrontOnlyGuard());
      window.addEventListener("system-login:auth", () => installViewAsFrontOnlyGuard());
    } catch {
    }
    ME_CAPS = {};
    ME_CAPS_KEY = "";
    ME_ISS_ROLES = [];
    ME_LOGIN_ROLE = "";
    ME_CAPS_BOOTSTRAP_TS = 0;
    ME_CAPS_INFLIGHT = null;
    ME_CAPS_RETRY_TIMER = null;
    ME_SERVER_INSTRUCCIONES_EDIT = null;
    ME_CAPS_FETCH_GUARD_MS = 5e3;
    ME_CAPS_REENTRY_GUARD_MS = 1500;
    isLoggedIn = () => Session.isLoggedIn();
    can = (cap) => Session.can(cap);
    blockReason = (cap) => Session.blockReason(cap);
    clearSession = logout;
    (window.ISA = window.ISA || {}).AppSession = {
      current: () => Session.current(),
      isLoggedIn,
      username: () => Session.username(),
      capabilities: () => Session.capabilities(),
      can,
      blockReason,
      login,
      logout,
      refreshProfile: () => Session.refreshProfile(),
      clearSession,
      getSession,
      resolveDisplayRole,
      canViewAsRole,
      getViewAsRole,
      isViewingAsRole,
      setViewAsRole,
      stopViewAsRole,
      resolvePrimaryIssRoleId
    };
  }
});

// js/tools/PermisosPanel.jsx
init_platform();

// js/ui/shared.jsx
init_platform();
init_platform();

// js/ui/ImageLightboxDialog.jsx
init_platform();
init_platform();
import { jsx } from "react/jsx-runtime";
var { useEffect, useState } = getReact();

// js/ui/GlassDialog.jsx
init_platform();
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
function isaLoginSurface() {
  const fs = globalThis.ISAFront || {};
  return {
    loginDialogProps: fs.loginDialogProps,
    loginDialogBackdropSx: fs.loginDialogBackdropSx,
    loginCardSx: fs.loginCardSx,
    glassCardSx: fs.glassCardSx,
    loginHeaderBandSx: fs.loginHeaderBandSx,
    loginIconBoxSx: fs.loginIconBoxSx,
    loginHeaderTitleSx: fs.loginHeaderTitleSx,
    GLASS_CARD_CLASS: fs.GLASS_CARD_CLASS || "isa-glass-card"
  };
}
var PAPER_MAX = { xs: 440, sm: 560, md: 920, lg: 1080 };
function glassBackdropSx() {
  const fn = isaLoginSurface().loginDialogBackdropSx;
  return fn?.() ?? {
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    backgroundColor: "rgba(11,18,32,0.55)"
  };
}
function glassPaperProps(maxWidth, paperClassName = "") {
  const { loginCardSx, glassCardSx, GLASS_CARD_CLASS } = isaLoginSurface();
  const maxPx = PAPER_MAX[maxWidth] ?? PAPER_MAX.md;
  return {
    elevation: 0,
    className: `isa-login-card ${GLASS_CARD_CLASS} isa-glass-dialog__paper ${paperClassName}`.trim(),
    sx: loginCardSx?.({ maxWidth: maxPx, m: { xs: 1, sm: 1.5 } }) ?? glassCardSx?.({ maxWidth: maxPx, m: { xs: 1, sm: 1.5 } }) ?? { maxWidth: maxPx, m: { xs: 1, sm: 1.5 } }
  };
}
function resolveGlassDialogProps({
  open,
  onClose,
  maxWidth = "md",
  fullWidth = true,
  fullScreen = false,
  paperMaxWidth,
  paperClassName = "",
  slotProps,
  ...rest
} = {}) {
  const { loginDialogProps } = isaLoginSurface();
  const paper = glassPaperProps(maxWidth, paperClassName);
  if (paperMaxWidth) paper.sx = { ...paper.sx, maxWidth: paperMaxWidth };
  if (fullScreen) {
    paper.sx = {
      ...paper.sx,
      m: 0,
      margin: 0,
      maxWidth: "100%",
      width: "100%",
      height: "100%",
      maxHeight: "100dvh",
      borderRadius: 0,
      border: "none",
      boxShadow: "none"
    };
  }
  const shared = {
    open,
    onClose,
    maxWidth: fullScreen ? false : maxWidth,
    fullWidth,
    fullScreen,
    scroll: "paper",
    className: `isa-login-dialog isa-glass-dialog${fullScreen ? " isa-glass-dialog--fullscreen" : ""}`,
    slotProps: { backdrop: { sx: glassBackdropSx() }, ...slotProps || {} },
    PaperProps: paper,
    ...rest
  };
  if (!loginDialogProps) return shared;
  return loginDialogProps(shared);
}
function glassDialogContentSx(extra = {}) {
  return {
    p: 0,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    position: "relative",
    borderTop: 0,
    ...extra
  };
}
function glassDialogActionsSx(extra = {}) {
  return {
    px: { xs: 2, sm: 2.5 },
    py: 1.5,
    borderTop: 1,
    borderColor: (t) => t.palette.mode === "dark" ? "rgba(99,102,241,0.22)" : "divider",
    bgcolor: (t) => t.palette.mode === "dark" ? "rgba(15,23,42,0.32)" : "rgba(248,250,252,0.85)",
    justifyContent: "flex-end",
    ...extra
  };
}
function GlassDialogHeader({ icon = "mdi:information-outline", title, subtitle, accent = "#1e90ff", onClose }) {
  const { Box: Box9, Typography: Typography8, IconButton: IconButton3, Stack: Stack8 } = getMaterialUI();
  const { Icon: Icon3 } = UI;
  const { loginHeaderBandSx, loginIconBoxSx, loginHeaderTitleSx } = isaLoginSurface();
  const bandSx = loginHeaderBandSx?.(accent) ?? {
    px: { xs: 2, sm: 2.5 },
    py: 2,
    borderBottom: 1,
    borderColor: "rgba(99,102,241,0.25)",
    background: `linear-gradient(90deg, ${accent}44, rgba(99,102,241,0.12) 45%, transparent 75%)`,
    borderLeft: 4,
    borderLeftColor: accent
  };
  const iconSx = loginIconBoxSx?.(accent) ?? {
    width: 42,
    height: 42,
    borderRadius: 1.75,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: `linear-gradient(135deg, ${accent}, ${accent}99)`,
    color: "#fff"
  };
  const titleSx = loginHeaderTitleSx?.() ?? { fontWeight: 700, fontSize: "1.35rem", lineHeight: 1.15 };
  return /* @__PURE__ */ jsxs(Box9, { className: "isa-glass-dialog__header", sx: { position: "relative", flexShrink: 0 }, children: [
    /* @__PURE__ */ jsx2(Box9, { sx: bandSx, children: /* @__PURE__ */ jsxs(Stack8, { direction: "row", spacing: 1.25, alignItems: "center", sx: { pr: onClose ? 4 : 0 }, children: [
      /* @__PURE__ */ jsx2(Box9, { sx: iconSx, children: /* @__PURE__ */ jsx2(Icon3, { icon, size: 24 }) }),
      /* @__PURE__ */ jsxs(Box9, { sx: { flex: 1, minWidth: 0 }, children: [
        /* @__PURE__ */ jsx2(Typography8, { variant: "h5", component: "h2", sx: titleSx, children: title }),
        subtitle ? /* @__PURE__ */ jsx2(Typography8, { variant: "caption", color: "text.secondary", display: "block", sx: { mt: 0.35, lineHeight: 1.4 }, children: subtitle }) : null
      ] })
    ] }) }),
    onClose ? /* @__PURE__ */ jsx2(IconButton3, { size: "small", onClick: onClose, "aria-label": "Cerrar", className: "isa-glass-dialog__close", sx: { position: "absolute", top: 10, right: 10 }, children: /* @__PURE__ */ jsx2(Icon3, { icon: "mdi:close", size: 18 }) }) : null
  ] });
}
function GlassDialog({ children, header = null, maxWidth, fullWidth, fullScreen, paperMaxWidth, paperClassName, slotProps, ...dialogProps }) {
  const { Dialog: Dialog2 } = getMaterialUI();
  const props = resolveGlassDialogProps({ maxWidth, fullWidth, fullScreen, paperMaxWidth, paperClassName, slotProps, ...dialogProps });
  return /* @__PURE__ */ jsxs(Dialog2, { ...props, children: [
    header,
    children
  ] });
}

// js/ui/shared.jsx
import { Fragment, jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
function ButtonIconify({ icon, title = "", label = "", onClick, disabled = false, busy = false, color = "", variant = "", className = "", type = "button" }) {
  const shown = busy ? "mdi:loading" : icon;
  const variantCls = variant ? `btn-iconify--${variant}` : "";
  const colorCls = color ? `btn-iconify--${color}` : "";
  const labeledCls = label ? "btn-iconify--labeled" : "";
  const aria = label || title || void 0;
  return /* @__PURE__ */ jsxs2(
    "button",
    {
      type,
      className: `btn-iconify ${variantCls} ${colorCls} ${labeledCls} ${className}`.trim(),
      title: title || label || void 0,
      "aria-label": aria,
      onClick,
      disabled: disabled || busy,
      children: [
        /* @__PURE__ */ jsx3("iconify-icon", { icon: shown, width: "1.15em", height: "1.15em" }),
        label ? /* @__PURE__ */ jsx3("span", { className: "btn-iconify__lbl", children: label }) : null
      ]
    }
  );
}
var { useState: useState2, useEffect: useEffect2, useMemo } = getReact();
var { createTheme, Tabs, Tab, Box, Typography, DialogContent, Stack, Chip } = getMaterialUI();
var theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#3b82f6" },
    secondary: { main: "#14b8a6" },
    background: { default: "#0f172a", paper: "#1e293b" }
  },
  typography: { fontFamily: '"IBM Plex Sans", system-ui, sans-serif' },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: "none" } } },
    MuiTab: { styleOverrides: { root: { textTransform: "none" } } },
    MuiToggleButton: { styleOverrides: { root: { textTransform: "none" } } },
    MuiTooltip: {
      defaultProps: { disableInteractive: true },
      styleOverrides: {
        popper: { pointerEvents: "none" },
        tooltip: { pointerEvents: "none" }
      }
    }
  }
});

// js/tools/PermisosPanel.jsx
init_systemConfigApi();

// js/tools/permFixFilter.js
var SESSION_OWNER_FIX_FILTER = {
  itercero: "{{itercero}}",
  icontacto: "{{icontacto}}"
};

// js/tools/permisosForm.js
var FLAG_DEFS = [
  { key: "*", label: "Acceso total", hint: "Wildcard \u2014 anula el resto de restricciones de ruta." },
  { key: "impersonate", label: "Suplantar chat", hint: "Actuar como otro usuario en conversaciones." },
  { key: "manage_permissions", label: "Gestionar permisos", hint: "CRUD de dbo.SYS_USR_PERMISSIONS (dev_lead)." }
];
var ACCESS_MODES = [
  { value: "off", label: "Sin acceso" },
  { value: "allow", label: "Permitido" },
  { value: "filtered", label: "Filtrado (fixFilter)" }
];
var FLAG_KEYS = new Set(FLAG_DEFS.map((f) => f.key));
function roleDescripcion(permisos) {
  const d = permisos?.descripcion;
  return d != null && String(d).trim() ? String(d).trim() : "";
}
function roleNamedisplay(permisos) {
  const d = permisos?.namedisplay;
  return d != null && String(d).trim() ? String(d).trim() : "";
}
function userRoles(permisos) {
  const r = permisos?.roles;
  return Array.isArray(r) ? r.map((x) => String(x).trim().toLowerCase()).filter(Boolean) : [];
}

// js/tools/permisosKanbanShared.js
init_roleHierarchy();
init_roleCanonicalMeta();
var VISITANTE = "visitante";
var ROLE_ACCENTS = ["#1e90ff", "#10b981", "#a855f7", "#f59e0b", "#ec4899", "#06b6d4", "#8b5cf6"];
var ROLE_ICONS = ["mdi:shield-account", "mdi:file-document-edit-outline", "mdi:code-braces", "mdi:robot-outline", "mdi:eye-outline", "mdi:account-group-outline"];
function permEntryKey(entry) {
  return String(entry?.iusuario ?? entry?.ientity ?? "").trim();
}
function roleNameFromEntry(entry) {
  return permEntryKey(entry).toLowerCase().replace(/^role:/i, "");
}
function formatRoleTitle(roleName) {
  return String(roleName ?? "").split("_").map((part) => {
    const p = part.toLowerCase();
    if (p === "iss" || p === "isw") return p.toUpperCase();
    if (!p) return "";
    return p.charAt(0).toUpperCase() + p.slice(1);
  }).filter(Boolean).join(" ");
}
function roleTitleFromEntry(entry) {
  const roleName = roleNameFromEntry(entry);
  const canon = canonicalRoleMeta(roleName);
  if (canon?.namedisplay) return canon.namedisplay;
  const namedisplay = roleNamedisplay(entry?.permisos);
  const formatted = formatRoleTitle(roleName);
  if (!namedisplay) return formatted;
  if (formatted.length > namedisplay.length) return formatted;
  return namedisplay;
}
function roleDescripcionFromEntry(entry) {
  const roleName = roleNameFromEntry(entry);
  const canon = canonicalRoleMeta(roleName);
  if (canon?.descripcion) return canon.descripcion;
  return roleDescripcion(entry?.permisos);
}
function themeForRole(roleName, index = 0, permisos = null) {
  const accent = permisos?.accent ?? permisos?.color;
  const icon = permisos?.icon;
  if (accent && icon) return { accent: String(accent), icon: String(icon) };
  const i = index % ROLE_ACCENTS.length;
  return { accent: ROLE_ACCENTS[i], icon: ROLE_ICONS[i % ROLE_ICONS.length] };
}
function userCardLabels(username, displayName) {
  const user = String(username ?? "").trim().toUpperCase();
  const name = String(displayName ?? "").trim();
  if (name) return { primary: name, secondary: user };
  return { primary: user, secondary: null };
}
function matchesUserFilter(username, displayName, query) {
  const q = String(query ?? "").trim().toUpperCase();
  if (!q) return true;
  const u = String(username ?? "").trim().toUpperCase();
  const n = String(displayName ?? "").trim().toUpperCase();
  return u.includes(q) || n && n.includes(q);
}
function displayNameFromUserEntry(entry) {
  const fromMeta = entry?.permisos?.nombre ?? entry?.permisos?.namedisplay;
  return fromMeta != null && String(fromMeta).trim() ? String(fromMeta).trim() : null;
}
function normalizePermisosUsername(raw) {
  const s = String(raw ?? "").trim().toUpperCase();
  return s || null;
}
function buildUserDirectoryFromPermisos(users) {
  const map = {};
  for (const e of users ?? []) {
    const key = normalizePermisosUsername(permEntryKey(e));
    if (!key) continue;
    const name = displayNameFromUserEntry(e);
    if (name) map[key] = name;
  }
  return map;
}
function resolveDisplayName(username, userEntry, userDirectory) {
  const fromMeta = displayNameFromUserEntry(userEntry);
  if (fromMeta) return fromMeta;
  const key = normalizePermisosUsername(username);
  const fromDir = key ? userDirectory?.[key] : null;
  if (fromDir != null && String(fromDir).trim()) return String(fromDir).trim();
  return null;
}
function sortPermisosColumnsByMembers(columns) {
  return [...columns].sort((a, b) => {
    const byCount = b.users.length - a.users.length;
    if (byCount !== 0) return byCount;
    return a.sortIndex - b.sortIndex;
  });
}
function buildPermisosBoard(data, filters = {}) {
  const roles = data?.roles ?? [];
  const users = data?.users ?? [];
  const userQuery = filters.userSearch ?? "";
  const roleFiltersRaw = filters.roleFilters ?? filters.roleFilter ?? [];
  const roleFilters = (Array.isArray(roleFiltersRaw) ? roleFiltersRaw : [roleFiltersRaw]).map((r) => String(r ?? "").trim().toLowerCase()).filter(Boolean);
  const roleFilterSet = roleFilters.length ? new Set(roleFilters) : null;
  const userDirectory = filters.userDirectory ?? null;
  const filterActive = Boolean(String(userQuery ?? "").trim()) || Boolean(roleFilterSet?.size);
  const activeRoles2 = roles.filter((entry) => entry?.itipo !== "user" && entry?.bactivo !== false && roleNameFromEntry(entry));
  const columns = activeRoles2.map((entry, index) => {
    const roleName = roleNameFromEntry(entry);
    const theme2 = themeForRole(roleName, index, entry.permisos);
    const jerarquia = getRoleJerarquia(roleName, entry.permisos);
    return {
      id: roleName,
      roleName,
      title: roleTitleFromEntry(entry),
      jerarquia,
      jerarquiaLabel: formatJerarquiaLabel(jerarquia),
      descripcion: roleDescripcionFromEntry(entry),
      entry,
      accent: theme2.accent,
      icon: theme2.icon,
      sortIndex: index,
      users: [],
      roleFilteredOut: !!(roleFilterSet && !roleFilterSet.has(roleName))
    };
  }).filter((c) => {
    if (!c.id || c.id === VISITANTE) return false;
    return true;
  });
  const colById = new Map(columns.map((c) => [c.id, c]));
  for (const userEntry of users) {
    const username = permEntryKey(userEntry).toUpperCase();
    const displayName = resolveDisplayName(username, userEntry, userDirectory);
    if (!matchesUserFilter(username, displayName, userQuery)) continue;
    for (const role of userRoles(userEntry.permisos)) {
      const col = colById.get(role);
      if (!col) continue;
      if (roleFilterSet && !roleFilterSet.has(role)) continue;
      if (col.users.some((u) => u.username === username)) continue;
      const labels = userCardLabels(username, displayName);
      col.users.push({ id: `${username}@${role}`, username, displayName, labels, userEntry });
    }
  }
  for (const col of columns) {
    col.users.sort((a, b) => a.labels.primary.localeCompare(b.labels.primary, "es"));
  }
  const sorted = sortPermisosColumnsByMembers(columns);
  const hideEmpty = !!filters.hideEmptyColumns;
  const visible = hideEmpty ? sorted.filter((c) => c.users.length > 0 || roleFilterSet?.has(c.id)) : sorted;
  const noUsersVisible = filterActive && !columns.some((c) => c.users.length > 0);
  return { columns: visible, filterActive, noUsersVisible, hideEmptyColumns: hideEmpty };
}
function columnAtPoint(columnIds, listRefs, clientX, clientY) {
  for (const colId of columnIds) {
    const el = listRefs.current[colId];
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) return colId;
  }
  return null;
}
function buildRolePermisosIndex(roles) {
  const out = {};
  for (const r of roles ?? []) {
    const key = roleNameFromEntry(r);
    if (key) out[key] = r.permisos ?? {};
  }
  return out;
}
function canActorManageColumn(actorJerarquias, targetColumn) {
  if (!targetColumn) return false;
  const actors = Array.isArray(actorJerarquias) ? actorJerarquias : [actorJerarquias];
  const filtered = actors.map((j) => String(j ?? "").trim()).filter(Boolean);
  if (!filtered.length) return false;
  return actorCanManageTarget(filtered, targetColumn.jerarquia ?? "999");
}
function canActorTransferUser(actorJerarquias, fromColumn, toColumn) {
  return canActorManageColumn(actorJerarquias, fromColumn) && canActorManageColumn(actorJerarquias, toColumn);
}
function pointInRef(ref, clientX, clientY) {
  const el = ref?.current;
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
}

// js/tools/PermisosPanel.jsx
init_roleHierarchy();

// js/tools/PermisosKanban.jsx
init_platform();

// js/tools/permisosRoleConfig.jsx
init_platform();

// js/editors/jsonEditor.jsx
init_platform();
import { jsx as jsx4 } from "react/jsx-runtime";

// js/tools/permisosRouteCatalog.js
var ROUTE_GROUPS = [
  {
    id: "conversaciones",
    title: "Conversaciones",
    routes: [
      { key: "GET:/api/conversaciones", label: "Listar conversaciones", scoped: true },
      { key: "GET:/api/conversacion/*", label: "Ver conversaci\xF3n", scoped: true },
      { key: "GET:/api/conversacion/logs/*", label: "Logs de conversaci\xF3n" },
      { key: "POST:/api/conversacion", label: "Crear conversaci\xF3n", scoped: true },
      { key: "POST:/api/mensaje", label: "Enviar mensaje", scoped: true },
      { key: "DELETE:/api/conversacion/*", label: "Eliminar conversaci\xF3n", scoped: true }
    ]
  },
  {
    id: "sistema",
    title: "Sistema",
    routes: [
      { key: "GET:/api/system/openai", label: "Leer config OpenAI" },
      { key: "PUT:/api/system/openai", label: "Guardar config OpenAI" },
      { key: "GET:/api/system/prompts-operativos", label: "Leer prompts operativos" },
      { key: "PUT:/api/system/prompts-operativos", label: "Guardar prompts operativos" },
      { key: "GET:/api/system/instrucciones", label: "Leer instrucciones PatyIA" },
      { key: "PUT:/api/system/instrucciones", label: "Guardar instrucciones PatyIA" },
      { key: "GET:/api/system/permisos", label: "Leer permisos" },
      { key: "PUT:/api/system/permisos", label: "Actualizar permisos" },
      { key: "PUT:/api/system/permisos/roles/*", label: "Editar rol" },
      { key: "PUT:/api/system/permisos/usuarios/*", label: "Editar usuario" },
      { key: "PATCH:/api/system/permisos/usuarios/*/roles", label: "Asignar roles a usuario" },
      { key: "POST:/api/system/*", label: "POST sistema (wildcard)" },
      { key: "PUT:/api/system/*", label: "PUT sistema (wildcard)" }
    ]
  },
  {
    id: "patyia",
    title: "PatyIA / instrucciones",
    routes: [
      { key: "POST:/api/patyia/instrucciones/publish", label: "Publicar instrucciones" },
      { key: "POST:/api/patyia/instrucciones/upsert", label: "Upsert instrucciones" },
      { key: "POST:/api/patyia/prompts/upsert-sql", label: "Upsert SQL prompts" },
      { key: "POST:/api/instrucciones/*", label: "POST instrucciones (wildcard)" }
    ]
  },
  {
    id: "documentacion",
    title: "Documentaci\xF3n",
    routes: [
      { key: "PUT:/api/swagger.json", label: "Swagger declarativo" }
    ]
  }
];
var CATALOG_KEYS = new Set(ROUTE_GROUPS.flatMap((g) => g.routes.map((r) => r.key)));

// js/tools/permisosRoleTransfer.js
init_roleHierarchy();
function isTopDevLeadRole(roleName, jerarquia) {
  const key = String(roleName ?? "").trim().toLowerCase();
  if (key === "dev_lead") return true;
  return String(jerarquia ?? "").trim() === "0.0.0";
}
function isSamePermisosUser(a, b) {
  const x = String(a ?? "").trim().toUpperCase();
  const y = String(b ?? "").trim().toUpperCase();
  return !!x && x === y;
}
function moveRoleImpactBullets({ username, fromRoleTitle, toRoleTitle, isSelf, leavesDevLead }) {
  const user = String(username ?? "").trim().toUpperCase();
  const from = fromRoleTitle || "origen";
  const to = toRoleTitle || "destino";
  const bullets = [
    `${isSelf ? "Dejar\xE1s" : `${user} dejar\xE1`} de tener el rol **${from}** (solo quedar\xE1 en **${to}**).`,
    `${isSelf ? "Perder\xE1s" : "Perder\xE1"} permisos, rutas y privilegios asociados solo a **${from}**.`,
    `${isSelf ? "Desaparecer\xE1s" : "Desaparecer\xE1"} de la columna **${from}** en este tablero.`,
    "Los dem\xE1s roles que ya tenga el usuario no se modifican."
  ];
  if (leavesDevLead) {
    bullets.push(
      isSelf ? "Al salir de **dev_lead** (m\xE1ximo privilegio) perder\xE1s gesti\xF3n de permisos hasta que otro dev_lead te reasigne o un administrador ajuste la BD." : `Al salir de **dev_lead**, ${user} necesitar\xE1 que otro dev_lead lo reasigne o un ajuste manual en BD para recuperar el rol.`
    );
  }
  return bullets;
}
function removeRoleImpactBullets({ username, roleTitle, isSelf, isDevLead }) {
  const user = String(username ?? "").trim().toUpperCase();
  const role = roleTitle || "rol";
  const bullets = [
    `${isSelf ? "Perder\xE1s" : "Perder\xE1"} permisos, rutas y privilegios de **${role}**.`,
    `${isSelf ? "Dejar\xE1s" : "Dejar\xE1"} de aparecer en la columna **${role}** del tablero.`,
    "Los otros roles asignados no cambian."
  ];
  if (isDevLead) {
    bullets.push(
      isSelf ? "Si te quitas **dev_lead**, otro dev_lead deber\xE1 reasignarte o habr\xE1 que corregirlo en BD." : `Para restaurar **dev_lead** en ${user}, otro dev_lead deber\xE1 volver a asignar el rol.`
    );
  } else {
    bullets.push("Para restaurar el acceso, un dev_lead puede volver a asignar el rol.");
  }
  return bullets;
}
function userJerarquiasFromBoard(username, columns) {
  const u = String(username ?? "").trim().toUpperCase();
  if (!u) return [];
  const out = [];
  for (const col of columns ?? []) {
    if (col.users?.some((x) => String(x.username ?? "").trim().toUpperCase() === u)) {
      out.push(col.jerarquia);
    }
  }
  return out;
}
function canCopyUserRole({ fromJerarquia, toJerarquia, userJerarquiasOnBoard = [] }) {
  if (isSameInheritanceLine(fromJerarquia, toJerarquia)) {
    return {
      ok: false,
      reason: "No se puede copiar dentro de la misma rama jer\xE1rquica. Use mover para cambiar de rol en esa l\xEDnea."
    };
  }
  for (const jer of userJerarquiasOnBoard) {
    if (isSameInheritanceLine(jer, toJerarquia)) {
      return {
        ok: false,
        reason: "El usuario ya tiene un rol en la misma rama que el destino. Copiar est\xE1 prohibido; use mover o quite el rol existente."
      };
    }
  }
  return { ok: true };
}
function canAddUserToRole({ toJerarquia, userJerarquiasOnBoard = [] }) {
  for (const jer of userJerarquiasOnBoard) {
    if (isSameInheritanceLine(jer, toJerarquia)) {
      return {
        ok: false,
        reason: "El usuario ya tiene un rol en la misma rama jer\xE1rquica. No puede duplicarse; use mover entre columnas."
      };
    }
  }
  return { ok: true };
}

// js/tools/PermisosUserAutocomplete.jsx
init_platform();
init_systemConfigApi();
import { jsx as jsx5 } from "react/jsx-runtime";
import { createElement } from "react";
var { useState: useState3, useEffect: useEffect3, useRef, useCallback } = getReact();
var { Autocomplete, TextField, Typography: Typography2, Box: Box2 } = getMaterialUI();
var DEBOUNCE_MS = 300;
var DEFAULT_LIMIT = 10;
function optionLabel(row) {
  if (!row) return "";
  return row.displayName ? `${row.displayName} (${row.username})` : row.username;
}
function usernameFromInput(text) {
  const raw = String(text ?? "").trim();
  if (!raw) return null;
  const paren = raw.match(/\(([A-Z0-9_.$-]+)\)\s*$/i);
  if (paren) return normalizePermisosUsername(paren[1]);
  return normalizePermisosUsername(raw.split(/\s+/)[0]);
}
function PermisosUserAutocomplete({
  value,
  onChange,
  disabled = false,
  label = "Usuario",
  roleFilter = null,
  allowNew = true,
  limit = DEFAULT_LIMIT,
  variant = "dialog",
  placeholder,
  className,
  sx
}) {
  const toolbar = variant === "toolbar";
  const username = value ? normalizePermisosUsername(value) : null;
  const [inputValue, setInputValue] = useState3("");
  const [options, setOptions] = useState3([]);
  const [loading, setLoading] = useState3(false);
  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);
  const selected = username ? options.find((o) => o.username === username) ?? (username ? { username, displayName: null } : null) : null;
  const runSearch = useCallback(async (query) => {
    const id = ++requestIdRef.current;
    setLoading(true);
    try {
      const users = await searchPermisosUsers(query, {
        ...roleFilter ? { role: roleFilter } : {},
        limit
      });
      if (id !== requestIdRef.current) return users;
      setOptions(users);
      return users;
    } catch {
      if (id === requestIdRef.current) setOptions([]);
      return [];
    } finally {
      if (id === requestIdRef.current) setLoading(false);
    }
  }, [roleFilter, limit]);
  const scheduleSearch = useCallback((query) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runSearch(query);
    }, DEBOUNCE_MS);
  }, [runSearch]);
  useEffect3(() => {
    if (!username) {
      setInputValue("");
      return;
    }
    if (value && username !== normalizePermisosUsername(value)) {
      onChange(username);
      return;
    }
    const match = options.find((o) => o.username === username);
    setInputValue(match ? optionLabel(match) : username);
  }, [value, username, options, onChange]);
  useEffect3(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);
  useEffect3(() => {
    if (disabled) return;
    runSearch("");
  }, [disabled, runSearch]);
  if (disabled) {
    return /* @__PURE__ */ jsx5(
      TextField,
      {
        label,
        fullWidth: !toolbar,
        size: "small",
        value: username || "",
        disabled: true,
        placeholder: "Sin usuario",
        className,
        sx
      }
    );
  }
  const ph = placeholder ?? (toolbar ? "Buscar usuario\u2026" : "Buscar login ISS\u2026");
  return /* @__PURE__ */ jsx5(
    Autocomplete,
    {
      fullWidth: !toolbar,
      size: "small",
      openOnFocus: true,
      autoHighlight: true,
      clearOnBlur: false,
      selectOnFocus: true,
      handleHomeEndKeys: true,
      freeSolo: allowNew,
      loading,
      options,
      value: selected,
      inputValue,
      filterOptions: (x) => x,
      getOptionLabel: optionLabel,
      isOptionEqualToValue: (a, b) => String(a?.username) === String(b?.username),
      noOptionsText: loading ? "Buscando\u2026" : toolbar ? "Sin coincidencias" : "Sin coincidencias \u2014 escriba login",
      loadingText: "Buscando\u2026",
      className,
      sx,
      onOpen: () => {
        if (!options.length) runSearch(inputValue);
      },
      onInputChange: (_e, text, reason) => {
        if (reason === "reset") return;
        setInputValue(text);
        scheduleSearch(text);
        if (allowNew) {
          const u = usernameFromInput(text);
          onChange(u);
        }
      },
      onChange: (_e, row) => {
        if (typeof row === "string") {
          const u = usernameFromInput(row);
          onChange(u);
          setInputValue(u ?? "");
          return;
        }
        onChange(row?.username ?? null);
        setInputValue(row ? optionLabel(row) : "");
      },
      renderOption: (props, row) => /* @__PURE__ */ createElement(Box2, { component: "li", ...props, key: row.username, sx: { display: "flex", flexDirection: "column", py: 0.75 } }, /* @__PURE__ */ jsx5(Typography2, { variant: "body2", sx: { fontWeight: 600 }, children: row.displayName || row.username }), row.displayName ? /* @__PURE__ */ jsx5(Typography2, { variant: "caption", color: "text.secondary", children: row.username }) : null),
      renderInput: (params) => /* @__PURE__ */ jsx5(
        TextField,
        {
          ...params,
          label: toolbar ? "" : label,
          placeholder: ph,
          InputLabelProps: { ...params.InputLabelProps, shrink: toolbar ? false : true },
          helperText: toolbar ? void 0 : allowNew ? "Usuarios en permisos ISS o login nuevo" : "Usuarios registrados en permisos ISS",
          sx: toolbar ? {
            "& .MuiOutlinedInput-root": { height: 28, minHeight: 28, maxHeight: 28, py: 0 },
            "& .MuiOutlinedInput-input": { py: "4px", fontSize: "0.8125rem", fontWeight: 600 },
            "& .MuiInputLabel-root": { display: "none" },
            "& .MuiOutlinedInput-notchedOutline legend": { width: 0, padding: 0 }
          } : void 0
        }
      )
    }
  );
}

// js/tools/permisosVisitante.js
var VISITANTE_DEFAULT_PERMISOS = {
  namedisplay: "Visitante",
  descripcion: "Visitante \u2014 solo sus propias conversaciones; logs abiertos; resto lectura",
  "GET:/api/conversaciones": { fixFilter: { ...SESSION_OWNER_FIX_FILTER } },
  "GET:/api/conversacion/*": { fixFilter: { ...SESSION_OWNER_FIX_FILTER } },
  "GET:/api/conversacion/logs/*": true,
  "POST:/api/conversacion": { fixFilter: { ...SESSION_OWNER_FIX_FILTER } },
  "POST:/api/mensaje": { fixFilter: { ...SESSION_OWNER_FIX_FILTER } },
  "DELETE:/api/conversacion/*": { fixFilter: { ...SESSION_OWNER_FIX_FILTER } }
};

// js/tools/permisosRoleConfig.jsx
import { Fragment as Fragment2, jsx as jsx6, jsxs as jsxs3 } from "react/jsx-runtime";
var { useState: useState4, useEffect: useEffect4, useMemo: useMemo2 } = getReact();
var {
  Typography: Typography3,
  TextField: TextField2,
  Stack: Stack2,
  Alert,
  Chip: Chip2,
  Box: Box3,
  Checkbox,
  FormControlLabel,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  DialogContent: DialogContent2,
  DialogActions,
  Button,
  Tooltip,
  CircularProgress
} = getMaterialUI();
var { Icon } = UI;
function renderImpactLine(text) {
  const parts = String(text ?? "").split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) => i % 2 === 1 ? /* @__PURE__ */ jsx6("strong", { children: part }, i) : part);
}
var MODE_LABEL = Object.fromEntries(ACCESS_MODES.map((m) => [m.value, m.label]));
function RoleDragDialog({ open, pending, busy, sessionUsername, onClose, onConfirm }) {
  const [moveStep, setMoveStep] = useState4(false);
  useEffect4(() => {
    if (!open) setMoveStep(false);
  }, [open]);
  if (!pending) return null;
  const { username, fromRole, toRole, fromRoleTitle, toRoleTitle, fromJerarquia, toJerarquia, copyBlocked, copyBlockReason } = pending;
  const fromLabel = fromRoleTitle || fromRole;
  const toLabel = toRoleTitle || toRole;
  const isSelf = isSamePermisosUser(username, sessionUsername);
  const leavesDevLead = isTopDevLeadRole(fromRole, fromJerarquia);
  const copyDenied = !!copyBlocked;
  const copyDeniedReason = copyBlockReason || "En la misma rama jer\xE1rquica solo puede moverse el rol, no copiarse.";
  function confirm2(mode) {
    if (busy) return;
    if (mode === "copy" && copyDenied) return;
    onConfirm(mode);
  }
  function handleCopy() {
    if (copyDenied) return;
    confirm2("copy");
  }
  const moveBullets = moveRoleImpactBullets({ username, fromRoleTitle: fromLabel, toRoleTitle: toLabel, isSelf, leavesDevLead });
  return /* @__PURE__ */ jsx6(
    GlassDialog,
    {
      open,
      onClose: busy ? void 0 : onClose,
      maxWidth: "sm",
      fullWidth: true,
      disableEscapeKeyDown: busy,
      header: /* @__PURE__ */ jsx6(
        GlassDialogHeader,
        {
          icon: moveStep ? "mdi:alert-outline" : "mdi:account-switch",
          title: moveStep ? "Confirmar movimiento" : "Asignar rol",
          subtitle: `${username}: ${fromLabel} \u2192 ${toLabel}`,
          accent: moveStep ? "#f59e0b" : "#1e90ff",
          onClose: busy ? void 0 : onClose
        }
      ),
      children: !moveStep ? /* @__PURE__ */ jsxs3(Fragment2, { children: [
        /* @__PURE__ */ jsxs3(DialogContent2, { sx: glassDialogContentSx({ p: 2.5 }), children: [
          /* @__PURE__ */ jsxs3(Typography3, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: [
            "\xBFC\xF3mo asignar a ",
            /* @__PURE__ */ jsx6("strong", { children: username }),
            " el rol ",
            /* @__PURE__ */ jsx6("strong", { children: toLabel }),
            "?"
          ] }),
          copyDenied ? /* @__PURE__ */ jsx6(Alert, { severity: "info", sx: { mb: 2 }, children: copyDeniedReason || "En la misma rama jer\xE1rquica solo puede moverse el rol, no copiarse." }) : null,
          /* @__PURE__ */ jsxs3(Stack2, { spacing: 1.25, children: [
            /* @__PURE__ */ jsx6(
              Button,
              {
                variant: "outlined",
                fullWidth: true,
                disabled: busy || copyDenied,
                sx: { textTransform: "none", justifyContent: "flex-start", py: 1.25 },
                onClick: handleCopy,
                startIcon: busy ? /* @__PURE__ */ jsx6(CircularProgress, { size: 16, color: "inherit" }) : /* @__PURE__ */ jsx6(Icon, { icon: "mdi:content-copy", size: 18 }),
                children: busy ? "Procesando\u2026" : copyDenied ? "Copiar no disponible (misma rama)" : `Copiar (mantener tambi\xE9n en ${fromLabel})`
              }
            ),
            !copyDenied ? /* @__PURE__ */ jsx6(Typography3, { variant: "caption", color: "text.secondary", sx: { px: 0.5 }, children: "Copiar no quita el rol origen; no hay cambio de privilegios neto salvo sumar los del destino." }) : null,
            /* @__PURE__ */ jsx6(
              Button,
              {
                variant: "contained",
                fullWidth: true,
                disabled: busy,
                sx: { textTransform: "none", justifyContent: "flex-start", py: 1.25 },
                onClick: () => setMoveStep(true),
                startIcon: /* @__PURE__ */ jsx6(Icon, { icon: "mdi:arrow-right-bold", size: 18 }),
                children: copyDenied ? `Mover a ${toLabel} (quitar de ${fromLabel})\u2026` : `Mover (quitar de ${fromLabel})\u2026`
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx6(DialogActions, { sx: glassDialogActionsSx(), children: /* @__PURE__ */ jsx6(Button, { onClick: onClose, disabled: busy, sx: { textTransform: "none" }, children: "Cancelar" }) })
      ] }) : /* @__PURE__ */ jsxs3(Fragment2, { children: [
        /* @__PURE__ */ jsxs3(DialogContent2, { sx: glassDialogContentSx({ p: 2.5 }), children: [
          /* @__PURE__ */ jsxs3(Alert, { severity: "warning", sx: { mb: 2 }, children: [
            "Mover implica ",
            /* @__PURE__ */ jsx6("strong", { children: "quitar" }),
            " a ",
            isSelf ? "ti" : username,
            " de ",
            /* @__PURE__ */ jsx6("strong", { children: fromLabel }),
            ". Revisa el impacto antes de confirmar."
          ] }),
          /* @__PURE__ */ jsxs3(Typography3, { variant: "body2", color: "text.secondary", sx: { mb: 1.5 }, children: [
            username,
            " pasar\xE1 de ",
            /* @__PURE__ */ jsx6("strong", { children: fromLabel }),
            " a ",
            /* @__PURE__ */ jsx6("strong", { children: toLabel }),
            " (sin duplicar el origen)."
          ] }),
          /* @__PURE__ */ jsx6(Box3, { component: "ul", sx: { m: 0, pl: 2.25, color: "text.secondary", fontSize: "0.875rem", "& li": { mb: 0.75 } }, children: moveBullets.map((line) => /* @__PURE__ */ jsx6("li", { children: renderImpactLine(line) }, line)) })
        ] }),
        /* @__PURE__ */ jsxs3(DialogActions, { sx: glassDialogActionsSx(), children: [
          /* @__PURE__ */ jsx6(Button, { onClick: () => setMoveStep(false), disabled: busy, sx: { textTransform: "none" }, children: "Atr\xE1s" }),
          /* @__PURE__ */ jsx6(
            Button,
            {
              variant: "contained",
              color: "warning",
              disabled: busy,
              onClick: () => confirm2("move"),
              sx: { textTransform: "none", minWidth: 140 },
              startIcon: busy ? /* @__PURE__ */ jsx6(CircularProgress, { size: 16, color: "inherit" }) : /* @__PURE__ */ jsx6(Icon, { icon: "mdi:arrow-right-bold", size: 18 }),
              children: busy ? "Moviendo\u2026" : "Confirmar movimiento"
            }
          )
        ] })
      ] })
    }
  );
}
function RoleAddDialog({ open, pending, busy, onClose, onConfirm }) {
  const [username, setUsername] = useState4(null);
  useEffect4(() => {
    if (open) setUsername(null);
  }, [open]);
  if (!pending) return null;
  const { roleTitle, role, existingUsernames, toJerarquia, columns } = pending;
  const roleLabel2 = roleTitle || role;
  const alreadyInRole = username && existingUsernames?.has(String(username).trim().toUpperCase());
  const userJerarquias = username ? userJerarquiasFromBoard(username, columns) : [];
  const addCheck = username && !alreadyInRole ? canAddUserToRole({ toJerarquia, userJerarquiasOnBoard: userJerarquias }) : { ok: true };
  const inheritanceBlocked = username && !alreadyInRole && !addCheck.ok;
  return /* @__PURE__ */ jsxs3(
    GlassDialog,
    {
      open,
      onClose: busy ? void 0 : onClose,
      maxWidth: "sm",
      fullWidth: true,
      header: /* @__PURE__ */ jsx6(GlassDialogHeader, { icon: "mdi:account-plus-outline", title: "Agregar al rol", subtitle: roleLabel2, accent: "#10b981", onClose: busy ? void 0 : onClose }),
      children: [
        /* @__PURE__ */ jsxs3(DialogContent2, { sx: glassDialogContentSx({ p: 2.5 }), children: [
          /* @__PURE__ */ jsxs3(Typography3, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: [
            "Busque un usuario en permisos ISS o escriba un login nuevo para asignarlo al rol ",
            /* @__PURE__ */ jsx6("strong", { children: roleLabel2 }),
            "."
          ] }),
          /* @__PURE__ */ jsx6(PermisosUserAutocomplete, { value: username, onChange: setUsername, disabled: busy, label: "Usuario" }),
          alreadyInRole ? /* @__PURE__ */ jsx6(Alert, { severity: "warning", sx: { mt: 1.5 }, children: "Este usuario ya est\xE1 en el rol." }) : null,
          inheritanceBlocked ? /* @__PURE__ */ jsx6(Alert, { severity: "warning", sx: { mt: 1.5 }, children: addCheck.reason }) : null
        ] }),
        /* @__PURE__ */ jsxs3(DialogActions, { sx: glassDialogActionsSx(), children: [
          /* @__PURE__ */ jsx6(Button, { onClick: onClose, disabled: busy, sx: { textTransform: "none" }, children: "Cancelar" }),
          /* @__PURE__ */ jsx6(
            Button,
            {
              variant: "contained",
              disabled: busy || !username || alreadyInRole || inheritanceBlocked,
              onClick: () => onConfirm(username),
              sx: { textTransform: "none", minWidth: 120 },
              startIcon: busy ? /* @__PURE__ */ jsx6(CircularProgress, { size: 16, color: "inherit" }) : /* @__PURE__ */ jsx6(Icon, { icon: "mdi:account-plus-outline", size: 18 }),
              children: busy ? "Agregando\u2026" : "Agregar"
            }
          )
        ] })
      ]
    }
  );
}
function RoleRemoveDialog({ open, pending, busy, sessionUsername, onClose, onConfirm }) {
  if (!pending) return null;
  const { username, roleTitle, role, fromJerarquia } = pending;
  const roleLabel2 = roleTitle || role;
  const isSelf = isSamePermisosUser(username, sessionUsername);
  const isDevLead = isTopDevLeadRole(role, fromJerarquia);
  const bullets = removeRoleImpactBullets({ username, roleTitle: roleLabel2, isSelf, isDevLead });
  return /* @__PURE__ */ jsxs3(
    GlassDialog,
    {
      open,
      onClose: busy ? void 0 : onClose,
      maxWidth: "sm",
      fullWidth: true,
      disableEscapeKeyDown: busy,
      header: /* @__PURE__ */ jsx6(GlassDialogHeader, { icon: "mdi:account-remove-outline", title: "Quitar del rol", subtitle: `${username} \xB7 ${roleLabel2}`, accent: "#f59e0b", onClose: busy ? void 0 : onClose }),
      children: [
        /* @__PURE__ */ jsxs3(DialogContent2, { sx: glassDialogContentSx({ p: 2.5 }), children: [
          /* @__PURE__ */ jsx6(Alert, { severity: "warning", sx: { mb: 2 }, children: isSelf && isDevLead ? "Te quitar\xE1s dev_lead (m\xE1ximo privilegio). Otro dev_lead o un ajuste en BD ser\xE1 necesario para recuperarlo." : "Esta acci\xF3n revoca permisos de forma inmediata. Revise las consecuencias antes de confirmar." }),
          /* @__PURE__ */ jsxs3(Typography3, { variant: "body2", color: "text.secondary", sx: { mb: 1.5 }, children: [
            "\xBFQuitar a ",
            /* @__PURE__ */ jsx6("strong", { children: username }),
            " del rol ",
            /* @__PURE__ */ jsx6("strong", { children: roleLabel2 }),
            "?"
          ] }),
          /* @__PURE__ */ jsx6(Box3, { component: "ul", sx: { m: 0, pl: 2.25, color: "text.secondary", fontSize: "0.875rem", "& li": { mb: 0.75 } }, children: bullets.map((line) => /* @__PURE__ */ jsx6("li", { children: renderImpactLine(line) }, line)) })
        ] }),
        /* @__PURE__ */ jsxs3(DialogActions, { sx: glassDialogActionsSx(), children: [
          /* @__PURE__ */ jsx6(Button, { onClick: onClose, disabled: busy, sx: { textTransform: "none" }, children: "Cancelar" }),
          /* @__PURE__ */ jsx6(
            Button,
            {
              variant: "contained",
              color: "warning",
              disabled: busy,
              onClick: onConfirm,
              sx: { textTransform: "none", minWidth: 120 },
              startIcon: busy ? /* @__PURE__ */ jsx6(CircularProgress, { size: 16, color: "inherit" }) : /* @__PURE__ */ jsx6(Icon, { icon: "mdi:account-remove-outline", size: 18 }),
              children: busy ? "Quitando\u2026" : "Confirmar"
            }
          )
        ] })
      ]
    }
  );
}

// js/tools/PermisosKanban.jsx
import { Fragment as Fragment3, jsx as jsx7, jsxs as jsxs4 } from "react/jsx-runtime";
var { useState: useState5, useMemo: useMemo3, useRef: useRef2, useEffect: useEffect5, memo } = getReact();
var { createPortal } = getReactDOM();
var { Box: Box4, Paper, Typography: Typography4, Stack: Stack3, Chip: Chip3, IconButton, Tooltip: Tooltip2, CircularProgress: CircularProgress2 } = getMaterialUI();
var { Icon: Icon2 } = UI;
var DRAG_THRESHOLD_PX = 6;
var UserCard = memo(function UserCard2({ card, columnId, columnTitle, columnJerarquia, canDragUser, isDragSource, userBusy, isSelected, isDimmed, onPointerDragStart, onRoleRemoveRequest, onUserSelect, onUserSummary, suppressClickRef }) {
  const canDragRole = !!canDragUser && !userBusy;
  const labels = card.labels ?? userCardLabels(card.username, card.displayName);
  const cardClass = [
    "paty-todos-card",
    "paty-permisos-user-card",
    "isa-glass-card",
    canDragRole ? "paty-todos-card--draggable" : "",
    isDragSource ? "paty-todos-card--drag-source" : "",
    userBusy ? "paty-permisos-user-card--user-busy" : "",
    isSelected ? "paty-permisos-user-card--selected" : "",
    isDimmed ? "paty-permisos-user-card--dimmed" : ""
  ].filter(Boolean).join(" ");
  return /* @__PURE__ */ jsx7(
    Paper,
    {
      className: cardClass,
      elevation: 0,
      "aria-busy": userBusy || void 0,
      onPointerDown: canDragRole ? (e) => {
        if (e.button !== 0 && e.pointerType !== "touch") return;
        if (e.target.closest(".paty-permisos-user-card__remove, .paty-permisos-user-card__busy")) return;
        onPointerDragStart(card.id, columnId, card.username, e);
      } : void 0,
      onClick: (e) => {
        if (suppressClickRef.current) {
          suppressClickRef.current = false;
          return;
        }
        if (userBusy || e.target.closest(".paty-permisos-user-card__remove, .paty-permisos-user-card__busy")) return;
        e.stopPropagation();
        onUserSelect?.(card.username);
      },
      onDoubleClick: (e) => {
        if (userBusy || e.target.closest(".paty-permisos-user-card__remove, .paty-permisos-user-card__busy")) return;
        e.stopPropagation();
        onUserSummary?.(card.username);
      },
      children: /* @__PURE__ */ jsxs4(Stack3, { direction: "row", alignItems: "center", spacing: 0.25, className: "paty-permisos-user-card__row", sx: { minWidth: 0 }, children: [
        /* @__PURE__ */ jsxs4(Box4, { className: "paty-permisos-user-card__body", sx: { minWidth: 0, flex: 1 }, children: [
          /* @__PURE__ */ jsx7(Typography4, { className: "paty-todos-card__title", component: "div", variant: "body2", fontWeight: 700, noWrap: true, title: labels.primary, children: labels.primary }),
          labels.secondary ? /* @__PURE__ */ jsx7(Typography4, { className: "paty-todos-card__caption", component: "div", variant: "caption", color: "text.secondary", noWrap: true, title: labels.secondary, children: labels.secondary }) : null
        ] }),
        userBusy ? /* @__PURE__ */ jsx7(Tooltip2, { title: "Procesando\u2026", children: /* @__PURE__ */ jsx7("span", { className: "paty-permisos-user-card__busy", "aria-label": "Procesando", children: /* @__PURE__ */ jsx7(CircularProgress2, { size: 14, thickness: 5, color: "inherit" }) }) }) : canDragRole ? /* @__PURE__ */ jsx7(Tooltip2, { title: `Quitar de ${columnTitle || columnId}`, children: /* @__PURE__ */ jsx7("span", { className: "paty-permisos-user-card__remove-wrap", children: /* @__PURE__ */ jsx7(
          IconButton,
          {
            size: "small",
            type: "button",
            className: "paty-permisos-user-card__remove",
            "aria-label": `Quitar de ${columnTitle || columnId}`,
            onPointerDown: (e) => {
              e.stopPropagation();
            },
            onClick: (e) => {
              e.stopPropagation();
              e.preventDefault();
              onRoleRemoveRequest?.({ cardId: card.id, username: card.username, role: columnId, roleTitle: columnTitle, fromJerarquia: columnJerarquia });
            },
            children: /* @__PURE__ */ jsx7(Icon2, { icon: "mdi:close", size: 14 })
          }
        ) }) }) : null
      ] })
    }
  );
});
function DragGhost({ card, column, x, y, width }) {
  if (column) {
    const node2 = /* @__PURE__ */ jsx7(
      Paper,
      {
        className: "paty-todos-card paty-permisos-column-ghost paty-todos-card--ghost isa-glass-card",
        elevation: 8,
        style: { position: "fixed", left: x, top: y, width, zIndex: 1e4, pointerEvents: "none", margin: 0 },
        "aria-hidden": true,
        children: /* @__PURE__ */ jsxs4(Stack3, { direction: "row", alignItems: "center", spacing: 0.75, sx: { minWidth: 0 }, children: [
          /* @__PURE__ */ jsx7(Icon2, { icon: column.icon, size: 16 }),
          /* @__PURE__ */ jsx7(Typography4, { className: "paty-todos-card__title", variant: "body2", fontWeight: 700, noWrap: true, children: column.title })
        ] })
      }
    );
    return typeof document !== "undefined" ? createPortal(node2, document.body) : node2;
  }
  if (!card) return null;
  const labels = card.labels ?? userCardLabels(card.username, card.displayName);
  const node = /* @__PURE__ */ jsxs4(
    Paper,
    {
      className: "paty-todos-card paty-permisos-user-card paty-permisos-drag-ghost paty-todos-card--ghost isa-glass-card",
      elevation: 8,
      style: { position: "fixed", left: x, top: y, width, zIndex: 1e4, pointerEvents: "none", margin: 0 },
      "aria-hidden": true,
      children: [
        /* @__PURE__ */ jsx7(Typography4, { className: "paty-todos-card__title", variant: "body2", fontWeight: 700, noWrap: true, children: labels.primary }),
        labels.secondary ? /* @__PURE__ */ jsx7(Typography4, { className: "paty-todos-card__caption", variant: "caption", color: "text.secondary", noWrap: true, children: labels.secondary }) : null
      ]
    }
  );
  return typeof document !== "undefined" ? createPortal(node, document.body) : node;
}
function PermisosKanban({ boardData, loggedIn, canAssignRoles, readOnly, canManage, canEditRoleDescriptions, busy, actorJerarquia, actorJerarquias, sessionUsername, filterToolbarRef, onUserFilterDrop, onRoleFilterDrop, onDragOverFilterChange, onRoleSave, onRoleDrag, onRoleRemove, onRoleAdd, onJerarquiaToast, onOpenRoleHierarchy, onUserSummary }) {
  const [dragOverCol, setDragOverCol] = useState5(null);
  const [draggingId, setDraggingId] = useState5(null);
  const [dragGhost, setDragGhost] = useState5(null);
  const [configCol] = useState5(null);
  const [dragPending, setDragPending] = useState5(null);
  const [removePending, setRemovePending] = useState5(null);
  const [addPending, setAddPending] = useState5(null);
  const [addingRoleId, setAddingRoleId] = useState5(null);
  const [processingUsername, setProcessingUsername] = useState5(null);
  const [selectedUsername, setSelectedUsername] = useState5(null);
  const [dragSourceCol, setDragSourceCol] = useState5(null);
  const effectiveActorJerarquias = useMemo3(() => {
    if (Array.isArray(actorJerarquias) && actorJerarquias.length) return actorJerarquias;
    if (actorJerarquia != null && String(actorJerarquia).trim()) return [String(actorJerarquia).trim()];
    return [];
  }, [actorJerarquias, actorJerarquia]);
  const kanbanWrapRef = useRef2(null);
  const listRefs = useRef2({});
  const columnRefs = useRef2({});
  const dragRef = useRef2(null);
  const cardElRef = useRef2(null);
  const suppressClickRef = useRef2(false);
  const processingUserRef = useRef2(null);
  const dragPendingRef = useRef2(null);
  const columns = boardData?.columns ?? [];
  const filterActive = !!boardData?.filterActive;
  const assignEnabled = !!loggedIn && !!canAssignRoles;
  const filterDragEnabled = !!loggedIn && !canAssignRoles;
  const noUsersVisible = !!boardData?.noUsersVisible;
  const columnIds = useMemo3(() => columns.map((c) => c.id), [columns]);
  const ghostColumn = useMemo3(() => {
    if (!dragGhost?.columnId) return null;
    return columns.find((c) => c.id === dragGhost.columnId) ?? null;
  }, [dragGhost, columns]);
  const ghostCard = useMemo3(() => {
    if (!dragGhost?.cardId) return null;
    for (const col of columns) {
      const hit = col.users.find((u) => u.id === dragGhost.cardId);
      if (hit) return hit;
    }
    return null;
  }, [dragGhost, columns]);
  const selectedUserKey = selectedUsername ? String(selectedUsername).trim().toUpperCase() : null;
  const processingUserKey = processingUsername ? String(processingUsername).trim().toUpperCase() : null;
  useEffect5(() => {
    dragPendingRef.current = dragPending;
  }, [dragPending]);
  function userKey(username) {
    return String(username ?? "").trim().toUpperCase();
  }
  function beginUserProcessing(username) {
    const key = userKey(username);
    if (!key || processingUserRef.current) return null;
    processingUserRef.current = key;
    setProcessingUsername(key);
    return key;
  }
  function endUserProcessing() {
    processingUserRef.current = null;
    setProcessingUsername(null);
  }
  useEffect5(() => {
    function onDocPointerDown(e) {
      if (e.target.closest(".paty-permisos-user-card")) return;
      if (e.target.closest(".MuiDialog-root, .isa-glass-dialog")) return;
      setSelectedUsername(null);
    }
    document.addEventListener("pointerdown", onDocPointerDown, true);
    return () => document.removeEventListener("pointerdown", onDocPointerDown, true);
  }, []);
  function handleUserSelect(username) {
    const key = String(username ?? "").trim().toUpperCase();
    if (!key || processingUserKey === key) return;
    setSelectedUsername((prev) => prev && String(prev).trim().toUpperCase() === key ? null : key);
  }
  async function handleRemoveConfirm() {
    if (!removePending || !onRoleRemove || processingUserRef.current) return;
    if (!beginUserProcessing(removePending.username)) return;
    try {
      await onRoleRemove(removePending);
      setRemovePending(null);
    } catch {
    } finally {
      endUserProcessing();
    }
  }
  async function handleDragConfirm(mode) {
    const pending = dragPendingRef.current;
    if (!pending || !onRoleDrag || processingUserRef.current) return;
    if (!beginUserProcessing(pending.username)) return;
    if (mode === "copy" && pending.copyBlocked) return;
    setDragPending(null);
    try {
      await onRoleDrag({ ...pending, mode });
    } catch {
    } finally {
      endUserProcessing();
    }
  }
  async function handleAddConfirm(username) {
    if (!addPending || !onRoleAdd || addingRoleId || !username) return;
    setAddingRoleId(addPending.role);
    try {
      await onRoleAdd({ username, role: addPending.role, roleTitle: addPending.roleTitle });
      setAddPending(null);
    } catch {
    } finally {
      setAddingRoleId(null);
    }
  }
  function finishDrag(clientX, clientY) {
    const state = dragRef.current;
    dragRef.current = null;
    setDraggingId(null);
    setDragOverCol(null);
    setDragSourceCol(null);
    setDragGhost(null);
    cardElRef.current = null;
    if (!state?.moved) return;
    suppressClickRef.current = true;
    if (filterToolbarRef && pointInRef(filterToolbarRef, clientX, clientY)) {
      if (state.kind === "column") onRoleFilterDrop?.(state.columnId);
      else if (state.username && filterDragEnabled) onUserFilterDrop?.(state.username);
      return;
    }
    if (state.kind === "column") return;
    if (!assignEnabled) return;
    if (processingUserRef.current) return;
    const targetCol = columnAtPoint(columnIds, columnRefs, clientX, clientY);
    if (!targetCol || targetCol === state.sourceColumnId) return;
    const username = state.username;
    if (processingUserRef.current && userKey(username) === processingUserRef.current) return;
    const fromRole = state.sourceColumnId;
    const toRole = targetCol;
    const sourceColData = columns.find((c) => c.id === fromRole);
    const targetColData = columns.find((c) => c.id === toRole);
    if (targetColData?.users?.some((u) => u.username === username)) return;
    if (!canActorTransferUser(effectiveActorJerarquias, sourceColData, targetColData)) {
      onJerarquiaToast?.({
        type: "info",
        message: `Tu jerarqu\xEDa (${effectiveActorJerarquias.join(", ") || "?"}) no puede mover usuarios entre ${sourceColData?.title ?? fromRole} (${sourceColData?.jerarquia ?? "?"}) y ${targetColData?.title ?? toRole} (${targetColData?.jerarquia ?? "?"})`,
        actorJerarquia: effectiveActorJerarquias.join("|"),
        targetJerarquia: targetColData?.jerarquia,
        targetRole: toRole
      });
      return;
    }
    const userJerarquiasOnBoard = userJerarquiasFromBoard(username, columns);
    const copyCheck = canCopyUserRole({
      fromJerarquia: sourceColData?.jerarquia,
      toJerarquia: targetColData?.jerarquia,
      userJerarquiasOnBoard
    });
    setDragPending({
      username: userKey(username),
      fromRole,
      toRole,
      fromRoleTitle: sourceColData?.title ?? fromRole,
      toRoleTitle: targetColData?.title ?? toRole,
      fromJerarquia: sourceColData?.jerarquia,
      toJerarquia: targetColData?.jerarquia,
      userJerarquiasOnBoard,
      copyBlocked: !copyCheck.ok,
      copyBlockReason: copyCheck.reason
    });
  }
  function handleColumnHeadDragStart(col, e) {
    if (!filterDragEnabled) return;
    if (e.target.closest("button, .MuiIconButton-root")) return;
    if (processingUserRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    dragRef.current = {
      kind: "column",
      columnId: col.id,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      ghostWidth: rect.width,
      moved: false,
      pointerId: e.pointerId
    };
    cardElRef.current = e.currentTarget;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
    }
  }
  function handlePointerDragStart(cardId, sourceColumnId, username, e) {
    const key = userKey(username);
    if (processingUserRef.current && key === processingUserRef.current) return;
    if (!assignEnabled) return;
    const sourceColData = columns.find((c) => c.id === sourceColumnId);
    if (!canActorManageColumn(effectiveActorJerarquias, sourceColData)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    dragRef.current = {
      kind: "user",
      cardId,
      sourceColumnId,
      username,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      ghostWidth: rect.width,
      moved: false,
      pointerId: e.pointerId
    };
    cardElRef.current = e.currentTarget;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
    }
  }
  useEffect5(() => {
    function onPointerMove(e) {
      const state = dragRef.current;
      if (!state || e.pointerId !== state.pointerId) return;
      const dx = Math.abs(e.clientX - state.startX);
      const dy = Math.abs(e.clientY - state.startY);
      if (!state.moved && dx + dy < DRAG_THRESHOLD_PX) return;
      if (!state.moved) {
        state.moved = true;
        if (state.kind === "column") setDraggingId(`col:${state.columnId}`);
        else setDraggingId(state.cardId);
        setDragSourceCol(state.sourceColumnId ?? null);
        if (state.ghostWidth != null) {
          setDragGhost({
            cardId: state.cardId,
            columnId: state.columnId,
            x: e.clientX - state.offsetX,
            y: e.clientY - state.offsetY,
            width: state.ghostWidth
          });
        }
      }
      e.preventDefault();
      if (state.ghostWidth != null) {
        setDragGhost({ cardId: state.cardId, columnId: state.columnId, x: e.clientX - state.offsetX, y: e.clientY - state.offsetY, width: state.ghostWidth });
      }
      const overFilter = filterToolbarRef && pointInRef(filterToolbarRef, e.clientX, e.clientY);
      onDragOverFilterChange?.(!!overFilter);
      if (overFilter || state.kind === "column") setDragOverCol(null);
      else setDragOverCol(assignEnabled ? columnAtPoint(columnIds, columnRefs, e.clientX, e.clientY) : null);
    }
    function onPointerUp(e) {
      const state = dragRef.current;
      if (!state || e.pointerId !== state.pointerId) return;
      onDragOverFilterChange?.(false);
      finishDrag(e.clientX, e.clientY);
    }
    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [assignEnabled, columnIds, columns, processingUserKey, filterToolbarRef, onDragOverFilterChange, effectiveActorJerarquias, loggedIn, canAssignRoles]);
  if (!boardData) return null;
  const transferBusy = !!processingUserKey;
  const removeBusy = transferBusy && !!removePending;
  const addBusy = !!addingRoleId;
  return /* @__PURE__ */ jsxs4(Box4, { ref: kanbanWrapRef, className: "paty-todos-kanban-wrap paty-permisos-kanban-wrap", sx: { flex: 1, minHeight: 0, height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", p: 0 }, children: [
    /* @__PURE__ */ jsxs4(Box4, { className: `paty-todos-kanban paty-permisos-kanban${!assignEnabled ? " paty-permisos-kanban--no-assign" : ""}${draggingId ? " paty-todos-kanban--dragging" : ""}${selectedUserKey ? " paty-permisos-kanban--user-selected" : ""}${processingUserKey ? " paty-permisos-kanban--user-busy" : ""}`, sx: { flex: 1, minHeight: 0, maxHeight: "100%", display: "flex", alignItems: "stretch", alignSelf: "stretch", position: "relative" }, children: [
      dragGhost ? /* @__PURE__ */ jsx7(DragGhost, { card: ghostCard, column: ghostColumn, x: dragGhost.x, y: dragGhost.y, width: dragGhost.width }) : null,
      noUsersVisible ? /* @__PURE__ */ jsx7(Box4, { sx: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", p: 3, pointerEvents: "none", zIndex: 2 }, children: /* @__PURE__ */ jsx7(Typography4, { variant: "body2", color: "text.secondary", children: "Ning\xFAn usuario coincide con los filtros." }) }) : null,
      columns.length === 0 ? /* @__PURE__ */ jsx7(Box4, { sx: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", p: 3 }, children: /* @__PURE__ */ jsx7(Typography4, { variant: "body2", color: "text.secondary", children: boardData?.hideEmptyColumns ? "No hay columnas visibles (activa roles o desactiva \xABOcultar vac\xEDos\xBB)." : "No hay roles configurados." }) }) : null,
      columns.map((col) => {
        const canManageCol = assignEnabled && canActorManageColumn(effectiveActorJerarquias, col);
        const canDropOnCol = canManageCol;
        const isOver = draggingId && !String(draggingId).startsWith("col:") && dragOverCol === col.id;
        const isOverAllowed = isOver && canDropOnCol;
        const isOverBlocked = isOver && !canDropOnCol;
        const isSource = draggingId && !String(draggingId).startsWith("col:") && dragSourceCol === col.id;
        const colClass = [
          "paty-todos-column",
          "paty-permisos-column",
          col.roleFilteredOut ? "paty-permisos-column--role-filtered" : "",
          isOverAllowed ? "paty-permisos-column--drag-over" : "",
          isOverBlocked ? "paty-permisos-column--drop-blocked" : "",
          isSource && !isOver ? "paty-permisos-column--drag-source" : "",
          draggingId && !String(draggingId).startsWith("col:") && !isOver && assignEnabled && !canDropOnCol ? "paty-permisos-column--drop-forbidden" : "",
          draggingId && !String(draggingId).startsWith("col:") && !isOver ? "paty-permisos-column--drag-idle" : ""
        ].filter(Boolean).join(" ");
        return /* @__PURE__ */ jsxs4(
          Box4,
          {
            ref: (el) => {
              columnRefs.current[col.id] = el;
            },
            className: colClass,
            style: { "--col-accent": col.accent },
            sx: { display: "flex", flexDirection: "column", minHeight: 0, height: "100%", alignSelf: "stretch" },
            children: [
              /* @__PURE__ */ jsxs4(
                Stack3,
                {
                  direction: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  spacing: 1,
                  className: `paty-todos-column__head${filterDragEnabled ? " paty-permisos-column__head--filter-draggable" : ""}`,
                  sx: { flexShrink: 0, px: 1.75, py: 1.25, pb: 1, cursor: filterDragEnabled ? "grab" : "default" },
                  onPointerDown: (e) => handleColumnHeadDragStart(col, e),
                  children: [
                    /* @__PURE__ */ jsxs4(Stack3, { direction: "row", alignItems: "center", spacing: 0.75, className: "paty-todos-column__title", sx: { minWidth: 0, flex: 1 }, children: [
                      /* @__PURE__ */ jsx7(Icon2, { icon: col.icon, size: 16 }),
                      /* @__PURE__ */ jsxs4(Box4, { sx: { minWidth: 0 }, children: [
                        /* @__PURE__ */ jsx7(Stack3, { direction: "row", alignItems: "baseline", spacing: 0.75, sx: { minWidth: 0 }, children: /* @__PURE__ */ jsx7(Box4, { component: "span", sx: { display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 700 }, title: col.jerarquia ? `${col.title} \xB7 Jerarqu\xEDa ${col.jerarquia}${col.roleName && col.title !== col.roleName ? ` (${col.roleName})` : ""}` : col.roleName && col.title !== col.roleName ? `${col.title} (${col.roleName})` : col.title, children: col.title }) }),
                        col.descripcion ? /* @__PURE__ */ jsx7(Typography4, { variant: "caption", color: "text.secondary", sx: { display: "block", lineHeight: 1.3, mt: 0.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, title: col.descripcion, children: col.descripcion }) : null
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs4(Stack3, { direction: "row", alignItems: "center", spacing: 0.5, sx: { flexShrink: 0 }, children: [
                      onOpenRoleHierarchy ? /* @__PURE__ */ jsx7(Tooltip2, { title: `Ver/editar ${col.title || col.id} en jerarqu\xEDa`, children: /* @__PURE__ */ jsx7(
                        IconButton,
                        {
                          size: "small",
                          className: "paty-permisos-column__hierarchy",
                          "aria-label": `Jerarqu\xEDa ${col.title || col.id}`,
                          onPointerDown: (e) => e.stopPropagation(),
                          onClick: (e) => {
                            e.stopPropagation();
                            onOpenRoleHierarchy(col.roleName ?? col.id);
                          },
                          children: /* @__PURE__ */ jsx7(Icon2, { icon: "mdi:family-tree", size: 16 })
                        }
                      ) }) : null,
                      canManageCol ? /* @__PURE__ */ jsx7(Tooltip2, { title: addBusy && addingRoleId === col.id ? "Agregando\u2026" : "Agregar usuario", children: /* @__PURE__ */ jsx7("span", { className: "paty-permisos-column__add-wrap", children: /* @__PURE__ */ jsx7(
                        IconButton,
                        {
                          size: "small",
                          className: "paty-permisos-column__add",
                          disabled: addBusy,
                          "aria-label": `Agregar usuario a ${col.title || col.id}`,
                          onClick: () => {
                            if (addBusy) return;
                            setAddPending({
                              role: col.id,
                              roleTitle: col.title,
                              toJerarquia: col.jerarquia,
                              columns,
                              existingUsernames: new Set(col.users.map((u) => u.username))
                            });
                          },
                          children: addBusy && addingRoleId === col.id ? /* @__PURE__ */ jsx7(CircularProgress2, { size: 14, thickness: 5 }) : /* @__PURE__ */ jsx7(Icon2, { icon: "mdi:plus", size: 16 })
                        }
                      ) }) }) : null
                    ] })
                  ]
                }
              ),
              /* @__PURE__ */ jsxs4(
                Box4,
                {
                  ref: (el) => {
                    listRefs.current[col.id] = el;
                  },
                  "data-column-id": col.id,
                  className: `paty-todos-column__list paty-permisos-column__list${isOverAllowed ? " paty-todos-column__list--drag-over" : ""}${isOverBlocked ? " paty-todos-column__list--drop-blocked" : ""}`,
                  sx: { flex: 1, minHeight: 0, overflowY: "auto", p: 1.25, px: 1.5, boxSizing: "border-box" },
                  children: [
                    col.users.map((card) => {
                      const cardUserKey = userKey(card.username);
                      const userBusy = !!processingUserKey && processingUserKey === cardUserKey;
                      const isSelected = selectedUserKey === cardUserKey;
                      const isDimmed = !!selectedUserKey && !isSelected;
                      const canDragUser = canManageCol;
                      return /* @__PURE__ */ jsx7(
                        UserCard,
                        {
                          card,
                          columnId: col.id,
                          columnTitle: col.title,
                          columnJerarquia: col.jerarquia,
                          canDragUser,
                          isDragSource: draggingId === card.id,
                          userBusy,
                          isSelected,
                          isDimmed,
                          onPointerDragStart: handlePointerDragStart,
                          onRoleRemoveRequest: setRemovePending,
                          onUserSelect: handleUserSelect,
                          onUserSummary,
                          suppressClickRef
                        },
                        card.id
                      );
                    }),
                    !col.users.length ? /* @__PURE__ */ jsx7(Typography4, { variant: "caption", color: "text.secondary", sx: { px: 0.5, py: 1 }, children: "Sin usuarios" }) : null
                  ]
                }
              )
            ]
          },
          col.id
        );
      })
    ] }),
    typeof document !== "undefined" ? createPortal(/* @__PURE__ */ jsxs4(Fragment3, { children: [
      /* @__PURE__ */ jsx7(
        RoleDragDialog,
        {
          open: !!dragPending,
          pending: dragPending,
          busy: transferBusy,
          sessionUsername,
          onClose: () => {
            if (!transferBusy) setDragPending(null);
          },
          onConfirm: handleDragConfirm
        }
      ),
      /* @__PURE__ */ jsx7(
        RoleRemoveDialog,
        {
          open: !!removePending,
          pending: removePending,
          busy: removeBusy,
          sessionUsername,
          onClose: () => {
            if (!removeBusy) setRemovePending(null);
          },
          onConfirm: handleRemoveConfirm
        }
      ),
      /* @__PURE__ */ jsx7(
        RoleAddDialog,
        {
          open: !!addPending,
          pending: addPending,
          busy: addBusy,
          onClose: () => {
            if (!addBusy) setAddPending(null);
          },
          onConfirm: handleAddConfirm
        }
      )
    ] }), document.body) : null
  ] });
}

// js/tools/PermisosRoleFilterAutocomplete.jsx
init_platform();
import { jsx as jsx8 } from "react/jsx-runtime";
var { Autocomplete: Autocomplete2, TextField: TextField3, Chip: Chip4 } = getMaterialUI();
function PermisosRoleFilterAutocomplete({ options, value, onChange, disabled = false }) {
  const selected = options.filter((o) => value.includes(o.id));
  return /* @__PURE__ */ jsx8(
    Autocomplete2,
    {
      multiple: true,
      size: "small",
      disabled,
      className: "config-permisos-toolbar__field config-permisos-toolbar__field--role",
      options,
      value: selected,
      onChange: (_, next) => onChange(next.map((o) => o.id)),
      getOptionLabel: (o) => o.label,
      isOptionEqualToValue: (a, b) => a.id === b.id,
      disableCloseOnSelect: true,
      limitTags: 2,
      renderTags: (tagValue, getTagProps) => tagValue.map((option, index) => {
        const { key, ...chipProps } = getTagProps({ index });
        return /* @__PURE__ */ jsx8(Chip4, { ...chipProps, label: option.label, size: "small", className: "isa-neon-glass-chip" }, key);
      }),
      renderInput: (params) => /* @__PURE__ */ jsx8(
        TextField3,
        {
          ...params,
          size: "small",
          label: "",
          placeholder: selected.length ? "" : "Filtrar por roles\u2026",
          InputLabelProps: { ...params.InputLabelProps, shrink: false },
          sx: {
            "& .MuiOutlinedInput-root": { minHeight: 28, height: 28, maxHeight: 28, py: 0 },
            "& .MuiOutlinedInput-input": { py: "4px", fontSize: "0.8125rem", fontWeight: 600 },
            "& .MuiInputLabel-root": { display: "none" },
            "& .MuiOutlinedInput-notchedOutline legend": { width: 0, padding: 0 }
          }
        }
      )
    }
  );
}

// js/tools/roleHierarchyTree/RoleHierarchyView.tsx
init_platform();
import * as React from "react";

// js/tools/roleHierarchyTree/HierarchyOrgChart.jsx
init_platform();
init_roleHierarchy();
import { jsx as jsx9, jsxs as jsxs5 } from "react/jsx-runtime";
var { useEffect: useEffect6, useMemo: useMemo4, useRef: useRef3, useCallback: useCallback2, useState: useState6 } = getReact();
var { Box: Box5, Stack: Stack4, Typography: Typography5, Chip: Chip5, IconButton: IconButton2, Tooltip: Tooltip3, CircularProgress: CircularProgress3 } = getMaterialUI();
var ECHARTS_CDN = "https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.esm.min.js";
var NODE_W = 140;
var NODE_H = 40;
var NODE_GAP_Y = 18;
var LAYER_GAP_X = 56;
var echartsPromise = null;
function loadEcharts() {
  if (!echartsPromise) echartsPromise = import(
    /* @vite-ignore */
    ECHARTS_CDN
  );
  return echartsPromise;
}
function immediateParentJer(jer) {
  const parts = String(jer ?? "").split(".").filter(Boolean);
  if (parts.length <= 1) return null;
  return parts.slice(0, -1).join(".");
}
function nextChildJerarquia(parentJer, nodes) {
  const parent = String(parentJer ?? "").trim();
  if (!parent) return "0";
  const prefix = `${parent}.`;
  let max = -1;
  for (const n of nodes ?? []) {
    const j = String(n.jerarquia ?? "").trim();
    if (!j.startsWith(prefix)) continue;
    const rest = j.slice(prefix.length);
    if (!rest || rest.includes(".")) continue;
    const idx = Number(rest);
    if (Number.isFinite(idx) && idx > max) max = idx;
  }
  return `${parent}.${max + 1}`;
}
function isDarkScheme() {
  return document.documentElement.getAttribute("data-mui-color-scheme") !== "light";
}
function treeBreadth(node) {
  if (!node) return 0;
  const kids = node.children || [];
  if (!kids.length) return 1;
  return kids.reduce((sum, c) => sum + treeBreadth(c), 0);
}
function treeDepth(node, d = 1) {
  if (!node) return 0;
  const kids = node.children || [];
  if (!kids.length) return d;
  return Math.max(...kids.map((c) => treeDepth(c, d + 1)));
}
function applySelection(node, selectedJer, dark) {
  const sel = !!selectedJer && node.jerarquia === selectedJer;
  return {
    ...node,
    itemStyle: {
      color: sel ? dark ? "rgba(8,47,73,0.95)" : "rgba(224,242,254,0.98)" : dark ? "rgba(15,23,42,0.92)" : "rgba(255,255,255,0.95)",
      borderColor: sel ? "#22d3ee" : dark ? "rgba(56,189,248,0.55)" : "rgba(30,144,255,0.45)",
      borderWidth: sel ? 2.5 : 1.5,
      borderRadius: 0,
      shadowBlur: dark ? 8 : 2,
      shadowColor: dark ? "rgba(56,189,248,0.25)" : "rgba(15,23,42,0.08)"
    },
    children: (node.children || []).map((c) => applySelection(c, selectedJer, dark))
  };
}
function buildOrgTreeData(nodes) {
  const byJer = /* @__PURE__ */ new Map();
  for (const n of nodes ?? []) {
    const jer = String(n.jerarquia ?? "").trim();
    if (!jer) continue;
    byJer.set(jer, {
      name: n.namedisplay?.trim() || n.iusuario,
      value: jer,
      jerarquia: jer,
      iusuario: n.iusuario,
      namedisplay: n.namedisplay,
      descripcion: n.descripcion,
      children: []
    });
  }
  const roots = [];
  for (const [jer, node] of byJer) {
    const parent = immediateParentJer(jer);
    if (parent && byJer.has(parent)) byJer.get(parent).children.push(node);
    else roots.push(node);
  }
  const sortRec = (list) => {
    list.sort((a, b) => String(a.jerarquia).localeCompare(String(b.jerarquia), void 0, { numeric: true }));
    for (const n of list) sortRec(n.children);
  };
  sortRec(roots);
  if (roots.length === 1) return roots[0];
  if (!roots.length) return { name: "Sin roles", value: "", children: [] };
  return { name: "Roles", value: "", children: roots };
}
function nodePixelCenter(chart, data) {
  if (!chart || !data) return null;
  try {
    const px = chart.convertToPixel({ seriesIndex: 0 }, data);
    if (Array.isArray(px) && Number.isFinite(px[0]) && Number.isFinite(px[1])) {
      return { x: px[0], y: px[1] };
    }
  } catch {
  }
  if (Number.isFinite(data.x) && Number.isFinite(data.y)) {
    try {
      const px = chart.convertToPixel({ seriesIndex: 0 }, [data.x, data.y]);
      if (Array.isArray(px) && Number.isFinite(px[0]) && Number.isFinite(px[1])) {
        return { x: px[0], y: px[1] };
      }
    } catch {
    }
  }
  return null;
}
function HierarchyOrgChart({
  nodes,
  selectedJer,
  onSelect,
  canMutate = false,
  canCreateRoles = false,
  busy = false,
  onEditClick,
  onDeleteClick,
  onAddChildClick
}) {
  const treeData = useMemo4(() => buildOrgTreeData(nodes), [nodes]);
  const hostRef = useRef3(null);
  const wrapRef = useRef3(null);
  const chartRef = useRef3(null);
  const onSelectRef = useRef3(onSelect);
  onSelectRef.current = onSelect;
  const onEditRef = useRef3(onEditClick);
  onEditRef.current = onEditClick;
  const treeDataRef = useRef3(treeData);
  treeDataRef.current = treeData;
  const selectedJerRef = useRef3(selectedJer);
  selectedJerRef.current = selectedJer;
  const nodesRef = useRef3(nodes);
  nodesRef.current = nodes;
  const canMutateRef = useRef3(canMutate);
  canMutateRef.current = canMutate;
  const canCreateRef = useRef3(canCreateRoles);
  canCreateRef.current = canCreateRoles;
  const [hover, setHover] = useState6(null);
  const hoverHideTimer = useRef3(null);
  const countLabel = `${nodes?.length ?? 0} rol${(nodes?.length ?? 0) !== 1 ? "es" : ""}`;
  const showNodeActions = canMutate || canCreateRoles;
  const layoutSize = useMemo4(() => {
    const breadth = Math.max(1, treeBreadth(treeData));
    const depth = Math.max(1, treeDepth(treeData));
    const h = Math.max(420, breadth * (NODE_H + NODE_GAP_Y) + 80);
    const w = Math.max(640, depth * (NODE_W + LAYER_GAP_X) + 120);
    return { w, h, breadth, depth };
  }, [treeData]);
  const clearHoverSoon = useCallback2(() => {
    if (hoverHideTimer.current) clearTimeout(hoverHideTimer.current);
    hoverHideTimer.current = setTimeout(() => setHover(null), 180);
  }, []);
  const keepHover = useCallback2(() => {
    if (hoverHideTimer.current) clearTimeout(hoverHideTimer.current);
  }, []);
  const showHoverFor = useCallback2((chart, data) => {
    if (!canMutateRef.current && !canCreateRef.current || !data?.jerarquia) {
      setHover(null);
      return;
    }
    const pt = nodePixelCenter(chart, data);
    if (!pt) return;
    keepHover();
    setHover({
      jerarquia: data.jerarquia,
      iusuario: data.iusuario,
      x: pt.x,
      y: pt.y
    });
  }, [keepHover]);
  const applyChartOption = useCallback2((chart, data, sel) => {
    if (!chart) return;
    chart.setOption(buildOption(data, sel, isDarkScheme(), layoutSize), { notMerge: true });
    chart.resize();
  }, [layoutSize]);
  useEffect6(() => {
    let disposed = false;
    let chart;
    let onResize;
    let ro;
    (async () => {
      const echarts = await loadEcharts();
      if (disposed || !hostRef.current) return;
      chart = echarts.init(hostRef.current, null, { renderer: "canvas" });
      chartRef.current = chart;
      chart.on("click", (params) => {
        const jer = params?.data?.jerarquia;
        if (jer) onSelectRef.current?.(jer);
      });
      chart.on("dblclick", (params) => {
        const jer = params?.data?.jerarquia;
        if (!jer || !canMutateRef.current) return;
        const node = (nodesRef.current ?? []).find((n) => n.jerarquia === jer);
        if (node) onEditRef.current?.(node);
      });
      chart.on("mouseover", (params) => {
        if (params?.dataType && params.dataType !== "node") return;
        showHoverFor(chart, params?.data);
      });
      chart.on("mouseout", () => clearHoverSoon());
      chart.on("globalout", () => clearHoverSoon());
      onResize = () => {
        chart?.resize();
        setHover(null);
      };
      window.addEventListener("resize", onResize);
      if (typeof ResizeObserver !== "undefined" && hostRef.current) {
        ro = new ResizeObserver(() => {
          chart?.resize();
          setHover(null);
        });
        ro.observe(hostRef.current);
      }
      applyChartOption(chart, treeDataRef.current, selectedJerRef.current);
    })();
    return () => {
      disposed = true;
      if (hoverHideTimer.current) clearTimeout(hoverHideTimer.current);
      if (onResize) window.removeEventListener("resize", onResize);
      ro?.disconnect();
      chart?.dispose();
      chartRef.current = null;
    };
  }, [applyChartOption, clearHoverSoon, showHoverFor]);
  useEffect6(() => {
    const chart = chartRef.current;
    if (!chart) return;
    applyChartOption(chart, treeData, selectedJer);
    setHover(null);
  }, [treeData, selectedJer, applyChartOption]);
  const zoomBy = useCallback2((factor) => {
    const chart = chartRef.current;
    if (!chart) return;
    const opt = chart.getOption();
    const series = Array.isArray(opt?.series) ? opt.series[0] : null;
    const cur = Number(series?.zoom) || 1;
    const next = Math.max(0.35, Math.min(3.5, cur * factor));
    chart.setOption({ series: [{ zoom: next }] });
    setHover(null);
  }, []);
  const resetView = useCallback2(() => {
    const chart = chartRef.current;
    if (!chart) return;
    applyChartOption(chart, treeDataRef.current, selectedJerRef.current);
    setHover(null);
  }, [applyChartOption]);
  const hoverNode = hover ? (nodes ?? []).find((n) => n.jerarquia === hover.jerarquia) : null;
  return /* @__PURE__ */ jsxs5(Box5, { className: "role-hierarchy-orgchart", sx: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }, children: [
    /* @__PURE__ */ jsxs5(Stack4, { direction: "row", alignItems: "center", spacing: 0.5, sx: { px: 1, py: 0.4, borderBottom: 1, borderColor: "divider", flexShrink: 0, minHeight: 36 }, children: [
      /* @__PURE__ */ jsx9(Chip5, { size: "small", label: countLabel, sx: { height: 22, "& .MuiChip-label": { px: 0.75, fontSize: "0.72rem" } } }),
      /* @__PURE__ */ jsx9(Box5, { sx: { flex: 1, minWidth: 8 } }),
      /* @__PURE__ */ jsx9(Tooltip3, { title: "Acercar", children: /* @__PURE__ */ jsx9(IconButton2, { size: "small", onClick: () => zoomBy(1.2), "aria-label": "Zoom in", children: /* @__PURE__ */ jsx9("iconify-icon", { icon: "mdi:magnify-plus-outline", width: "18", height: "18" }) }) }),
      /* @__PURE__ */ jsx9(Tooltip3, { title: "Alejar", children: /* @__PURE__ */ jsx9(IconButton2, { size: "small", onClick: () => zoomBy(1 / 1.2), "aria-label": "Zoom out", children: /* @__PURE__ */ jsx9("iconify-icon", { icon: "mdi:magnify-minus-outline", width: "18", height: "18" }) }) }),
      /* @__PURE__ */ jsx9(Tooltip3, { title: "Restablecer vista", children: /* @__PURE__ */ jsx9(IconButton2, { size: "small", onClick: resetView, "aria-label": "Reset view", children: /* @__PURE__ */ jsx9("iconify-icon", { icon: "mdi:fit-to-screen-outline", width: "18", height: "18" }) }) }),
      /* @__PURE__ */ jsx9(Typography5, { variant: "caption", color: "text.secondary", sx: { display: { xs: "none", md: "block" }, mr: 0.5 }, children: "Doble clic edita \xB7 hover \xB1" }),
      busy ? /* @__PURE__ */ jsx9(CircularProgress3, { size: 14 }) : null
    ] }),
    /* @__PURE__ */ jsxs5(
      Box5,
      {
        ref: wrapRef,
        sx: {
          flex: 1,
          minHeight: 0,
          width: "100%",
          overflow: "auto",
          position: "relative"
        },
        children: [
          /* @__PURE__ */ jsx9(
            Box5,
            {
              ref: hostRef,
              sx: {
                width: "100%",
                minWidth: layoutSize.w,
                minHeight: layoutSize.h,
                height: "100%"
              }
            }
          ),
          showNodeActions && hover && hoverNode ? /* @__PURE__ */ jsxs5(
            Stack4,
            {
              direction: "row",
              spacing: 0.25,
              className: "role-hierarchy-node-actions",
              onMouseEnter: keepHover,
              onMouseLeave: clearHoverSoon,
              sx: {
                position: "absolute",
                left: hover.x,
                top: hover.y - NODE_H / 2 - 14,
                transform: "translateX(-50%)",
                zIndex: 5,
                bgcolor: "background.paper",
                border: 1,
                borderColor: "divider",
                borderRadius: 0.75,
                boxShadow: 2,
                p: 0.15
              },
              children: [
                canCreateRoles ? /* @__PURE__ */ jsx9(Tooltip3, { title: "Agregar hijo", children: /* @__PURE__ */ jsx9(
                  IconButton2,
                  {
                    size: "small",
                    color: "primary",
                    disabled: busy,
                    "aria-label": "Agregar hijo",
                    onClick: () => onAddChildClick?.(hoverNode),
                    sx: { p: 0.35 },
                    children: /* @__PURE__ */ jsx9("iconify-icon", { icon: "mdi:plus", width: "16", height: "16" })
                  }
                ) }) : null,
                canMutate ? /* @__PURE__ */ jsx9(Tooltip3, { title: "Eliminar rol", children: /* @__PURE__ */ jsx9(
                  IconButton2,
                  {
                    size: "small",
                    color: "error",
                    disabled: busy,
                    "aria-label": "Eliminar",
                    onClick: () => {
                      if (confirm(`\xBFEliminar rol "${hoverNode.iusuario}"?`)) onDeleteClick?.(hoverNode);
                    },
                    sx: { p: 0.35 },
                    children: /* @__PURE__ */ jsx9("iconify-icon", { icon: "mdi:delete-outline", width: "16", height: "16" })
                  }
                ) }) : null
              ]
            }
          ) : null
        ]
      }
    )
  ] });
}
function buildOption(treeData, selectedJer, dark, layoutSize) {
  const data = applySelection(JSON.parse(JSON.stringify(treeData)), selectedJer, dark);
  const breadth = layoutSize?.breadth ?? 1;
  const topPct = breadth > 8 ? "2%" : "4%";
  const bottomPct = breadth > 8 ? "2%" : "4%";
  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      formatter: (p) => {
        const d = p?.data;
        if (!d?.jerarquia) return d?.name ?? "";
        const desc = d.descripcion ? `<br/><span style="opacity:.75">${d.descripcion}</span>` : "";
        return `<b>${d.name}</b><br/>${d.iusuario} ${formatJerarquiaLabel(d.jerarquia)}${desc}`;
      }
    },
    series: [{
      type: "tree",
      data: [data],
      top: topPct,
      left: "3%",
      bottom: bottomPct,
      right: "8%",
      symbol: "rect",
      symbolSize: [NODE_W, NODE_H],
      orient: "LR",
      layout: "orthogonal",
      edgeShape: "polyline",
      edgeForkPosition: "63%",
      expandAndCollapse: false,
      initialTreeDepth: -1,
      roam: true,
      scaleLimit: { min: 0.35, max: 3.5 },
      animationDuration: 280,
      animationDurationUpdate: 200,
      label: {
        position: "inside",
        verticalAlign: "middle",
        align: "center",
        fontSize: 11,
        fontWeight: 600,
        lineHeight: 14,
        color: dark ? "#e2e8f0" : "#0f172a",
        formatter: (p) => {
          const d = p.data;
          if (!d?.jerarquia) return d?.name ?? "";
          return `${d.name}
${formatJerarquiaLabel(d.jerarquia)}`;
        }
      },
      leaves: { label: { position: "inside", align: "center" } },
      lineStyle: {
        color: dark ? "rgba(56,189,248,0.45)" : "rgba(30,144,255,0.4)",
        width: 1.5,
        curveness: 0
      },
      emphasis: { focus: "descendant" }
    }]
  };
}

// js/tools/roleHierarchyTree/RoleHierarchyView.tsx
import { jsx as jsx10, jsxs as jsxs6 } from "react/jsx-runtime";
var { useState: useState7, useCallback: useCallback3, useEffect: useEffect8 } = getReact();
var {
  Box: Box6,
  Button: Button2,
  Dialog,
  DialogTitle,
  DialogContent: DialogContent3,
  DialogActions: DialogActions2,
  TextField: TextField4,
  Alert: Alert2,
  CircularProgress: CircularProgress4,
  Stack: Stack5
} = getMaterialUI();
function RoleHierarchyView(props) {
  const {
    nodes,
    initialSelectedRole,
    canMutate,
    canCreateRoles = false,
    busy,
    onSave,
    onCreate,
    onDelete
  } = props;
  const [selectedJer, setSelectedJer] = useState7(null);
  const [editTarget, setEditTarget] = useState7(null);
  useEffect8(() => {
    if (!initialSelectedRole || !nodes.length) return;
    const key = String(initialSelectedRole).trim().toLowerCase();
    const node = nodes.find((n) => String(n.iusuario ?? "").trim().toLowerCase() === key);
    if (node?.jerarquia) setSelectedJer((prev) => prev === node.jerarquia ? prev : node.jerarquia);
  }, [initialSelectedRole, nodes]);
  const openAddChild = useCallback3((parent) => {
    const jer = nextChildJerarquia(parent.jerarquia, nodes);
    setSelectedJer(parent.jerarquia);
    setEditTarget({
      isNew: true,
      node: { iusuario: "", jerarquia: jer, namedisplay: null, descripcion: null }
    });
  }, [nodes]);
  return /* @__PURE__ */ jsxs6(Box6, { className: "role-hierarchy-tree", sx: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }, children: [
    /* @__PURE__ */ jsx10(
      HierarchyOrgChart,
      {
        nodes,
        selectedJer,
        onSelect: setSelectedJer,
        canMutate,
        canCreateRoles,
        busy,
        onAddChildClick: openAddChild,
        onEditClick: (node) => setEditTarget({ node, isNew: false }),
        onDeleteClick: (node) => {
          void onDelete(node.iusuario);
        }
      }
    ),
    /* @__PURE__ */ jsx10(
      HierarchyEditDialog,
      {
        target: editTarget,
        busy,
        onClose: () => setEditTarget(null),
        onSave: async (name, jer) => {
          if (editTarget?.isNew) await onCreate(name, jer);
          else if (editTarget) await onSave(editTarget.node.iusuario, jer);
          setEditTarget(null);
        }
      }
    )
  ] });
}
function HierarchyEditDialog({ target, busy, onClose, onSave }) {
  const isNew = target?.isNew ?? false;
  const [name, setName] = useState7(target?.node.iusuario ?? "");
  const [jerarquia, setJerarquia] = useState7(target?.node.jerarquia ?? "");
  const [err, setErr] = useState7("");
  React.useEffect(() => {
    setName(target?.node.iusuario ?? "");
    setJerarquia(target?.node.jerarquia ?? "");
    setErr("");
  }, [target]);
  if (!target) return null;
  const handleSubmit = async () => {
    setErr("");
    const trimmedName = String(name ?? "").trim();
    const trimmedJer = String(jerarquia ?? "").trim();
    if (!trimmedName) {
      setErr("nombre requerido");
      return;
    }
    if (!trimmedJer) {
      setErr("jerarqu\xEDa requerida");
      return;
    }
    if (!/^[0-9]+(\.[0-9]+)*$/.test(trimmedJer)) {
      setErr("jerarqu\xEDa inv\xE1lida (formato: 0, 0.0, 0.1.1)");
      return;
    }
    try {
      await onSave(trimmedName, trimmedJer);
    } catch (e) {
      setErr(e?.message ?? String(e));
    }
  };
  return /* @__PURE__ */ jsxs6(Dialog, { open: true, onClose, maxWidth: "sm", fullWidth: true, children: [
    /* @__PURE__ */ jsx10(DialogTitle, { children: isNew ? "Nuevo rol hijo" : `Editar ${target.node.iusuario}` }),
    /* @__PURE__ */ jsx10(DialogContent3, { dividers: true, children: /* @__PURE__ */ jsxs6(Stack5, { spacing: 2, children: [
      err ? /* @__PURE__ */ jsx10(Alert2, { severity: "error", children: err }) : null,
      /* @__PURE__ */ jsx10(TextField4, { label: "Nombre", value: name, onChange: (e) => setName(e.target.value), disabled: !isNew, helperText: "min\xFAsculas, sin espacios (ej. dev_lead)" }),
      /* @__PURE__ */ jsx10(TextField4, { label: "Jerarqu\xEDa", value: jerarquia, onChange: (e) => setJerarquia(e.target.value), helperText: "dot-notation: 0, 0.0, 0.1.1, ..." })
    ] }) }),
    /* @__PURE__ */ jsxs6(DialogActions2, { children: [
      /* @__PURE__ */ jsx10(Button2, { onClick: onClose, disabled: busy, children: "Cancelar" }),
      /* @__PURE__ */ jsx10(Button2, { variant: "contained", onClick: handleSubmit, disabled: busy, children: busy ? /* @__PURE__ */ jsx10(CircularProgress4, { size: 16 }) : "Guardar" })
    ] })
  ] });
}

// js/tools/roleHierarchyTree/hierarchyFromRoles.ts
init_roleHierarchy();
function hierarchyNodesFromRoleEntries(roleEntries) {
  const out = [];
  for (const e of roleEntries ?? []) {
    const iusuario = roleNameFromEntry(e);
    if (!iusuario) continue;
    const permisos = e.permisos && typeof e.permisos === "object" ? e.permisos : {};
    const jerarquia = getRoleJerarquia(iusuario, permisos);
    if (!jerarquia) continue;
    out.push({
      iusuario,
      jerarquia,
      namedisplay: roleTitleFromEntry(e) || null,
      descripcion: roleDescripcionFromEntry(e) || null,
      bactivo: e.bactivo !== false
    });
  }
  return out;
}

// js/tools/UserPermissionsSummaryDialog.jsx
init_platform();
init_roleHierarchy();
import { Fragment as Fragment4, jsx as jsx11, jsxs as jsxs7 } from "react/jsx-runtime";
var { Typography: Typography6, Stack: Stack6, Box: Box7, Chip: Chip6, Divider: Divider2, CircularProgress: CircularProgress5 } = getMaterialUI();
var { useMemo: useMemo5 } = getReact();
var ROLE_KEYS_OMIT = /* @__PURE__ */ new Set(["descripcion", "namedisplay", "roles", "jerarquia", "accent", "color", "icon"]);
function getRoleEntry(roles, roleName) {
  const key = String(roleName ?? "").trim().toLowerCase();
  return (roles ?? []).find((r) => String(r?.iusuario ?? "").trim().toLowerCase().replace(/^role:/i, "") === key) ?? null;
}
function activeRoles(roles) {
  return (roles ?? []).filter((r) => r?.itipo !== "user" && r?.bactivo !== false);
}
function chainForRole(roles, roleName) {
  const entry = getRoleEntry(roles, roleName);
  if (!entry) return { name: roleName, jerarquia: null, ancestors: [] };
  const jerarquia = getRoleJerarquia(roleName, entry.permisos);
  const ancestorPaths = ancestorsFromPath(jerarquia).slice(1);
  const ancestors = ancestorPaths.map((p) => ({ jerarquia: p, entry: getRoleEntry(roles, p) })).filter((a) => a.entry && a.entry.bactivo !== false);
  return { name: roleName, jerarquia, ancestors };
}
function permissionValue(v) {
  if (v === true) return "allow";
  if (v && typeof v === "object") {
    if (Array.isArray(v.fixFilter)) {
      return { kind: "fixFilter", value: v.fixFilter };
    }
    if (v.fixFilter && typeof v.fixFilter === "object") {
      return { kind: "fixFilter", value: v.fixFilter };
    }
    return { kind: "object", value: v };
  }
  return { kind: "other", value: v };
}
function summarizePerms(perms) {
  const allows = [];
  const fixFilters = [];
  const others = [];
  for (const [k, v] of Object.entries(perms ?? {})) {
    if (ROLE_KEYS_OMIT.has(k)) continue;
    if (k.startsWith("__") || k === "*") {
      if (k === "*" && v === true) allows.unshift("*");
      continue;
    }
    const pv = permissionValue(v);
    if (pv === "allow") allows.push(k);
    else if (pv.kind === "fixFilter") fixFilters.push({ key: k, filter: pv.value });
    else others.push({ key: k, value: pv.value });
  }
  return { allows, fixFilters, others };
}
function ChipChain({ chain, roles }) {
  return /* @__PURE__ */ jsxs7(Stack6, { direction: "row", spacing: 0.5, alignItems: "center", flexWrap: "wrap", useFlexGap: true, children: [
    chain.ancestors.map((anc) => /* @__PURE__ */ jsxs7(Box7, { sx: { display: "inline-flex", alignItems: "center" }, children: [
      /* @__PURE__ */ jsx11(Chip6, { size: "small", variant: "outlined", label: roleTitleFromEntry(anc.entry) || anc.entry.iusuario, sx: { fontFamily: "monospace", fontSize: 11 }, title: `Jerarqu\xEDa ${anc.jerarquia}` }),
      /* @__PURE__ */ jsx11(Box7, { component: "span", sx: { mx: 0.5, opacity: 0.6 }, children: "\u203A" })
    ] }, anc.jerarquia)),
    /* @__PURE__ */ jsx11(
      Chip6,
      {
        size: "small",
        color: "primary",
        label: roleTitleFromEntry(getRoleEntry(roles, chain.name)) || chain.name,
        sx: { fontFamily: "monospace", fontSize: 11, fontWeight: 700 },
        title: `Jerarqu\xEDa ${chain.jerarquia}`
      }
    )
  ] });
}
function RoleCard({ chain, roles }) {
  return /* @__PURE__ */ jsx11(Box7, { className: "isa-glass-card paty-permisos-summary__role", sx: { p: 1.25, borderRadius: 1.5 }, children: /* @__PURE__ */ jsxs7(Stack6, { spacing: 0.75, children: [
    /* @__PURE__ */ jsxs7(Stack6, { direction: "row", alignItems: "center", spacing: 0.75, children: [
      /* @__PURE__ */ jsx11(Typography6, { variant: "subtitle2", fontWeight: 700, title: `${chain.name} \xB7 jerarqu\xEDa ${chain.jerarquia}`, children: chain.name }),
      /* @__PURE__ */ jsx11(Typography6, { variant: "caption", color: "text.secondary", sx: { fontFamily: "monospace" }, children: chain.jerarquia })
    ] }),
    /* @__PURE__ */ jsx11(ChipChain, { chain, roles })
  ] }) });
}
function PermList({ title, items, kind }) {
  if (!items.length) return null;
  return /* @__PURE__ */ jsxs7(Box7, { sx: { mt: 1 }, children: [
    /* @__PURE__ */ jsxs7(Typography6, { variant: "overline", color: "text.secondary", sx: { letterSpacing: 1 }, children: [
      title,
      " (",
      items.length,
      ")"
    ] }),
    /* @__PURE__ */ jsxs7(Box7, { sx: { display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }, children: [
      items.slice(0, kind === "fixFilter" ? 50 : 100).map((it, i) => {
        if (kind === "fixFilter") {
          const ffSummary = Object.entries(it.filter ?? {}).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(", ");
          return /* @__PURE__ */ jsx11(
            Chip6,
            {
              size: "small",
              variant: "outlined",
              color: "warning",
              label: `${it.key} \xB7 ${ffSummary}`,
              title: `${it.key} \u2014 restringido a: ${ffSummary}`,
              sx: { fontFamily: "monospace", fontSize: 11 }
            },
            `${it.key}-${i}`
          );
        }
        if (kind === "allow") {
          return /* @__PURE__ */ jsx11(
            Chip6,
            {
              size: "small",
              color: "success",
              variant: "outlined",
              label: it,
              title: it,
              sx: { fontFamily: "monospace", fontSize: 11 }
            },
            it
          );
        }
        return /* @__PURE__ */ jsx11(
          Chip6,
          {
            size: "small",
            variant: "outlined",
            label: `${it.key} \u2192 ${JSON.stringify(it.value)}`,
            title: it.key,
            sx: { fontFamily: "monospace", fontSize: 11 }
          },
          `${it.key}-${i}`
        );
      }),
      items.length > (kind === "fixFilter" ? 50 : 100) ? /* @__PURE__ */ jsx11(Chip6, { size: "small", label: `+${items.length - (kind === "fixFilter" ? 50 : 100)} m\xE1s`, sx: { fontFamily: "monospace", fontSize: 11 } }) : null
    ] })
  ] });
}
function UserPermissionsSummaryDialog({ open, onClose, username, users, roles }) {
  const data = useMemo5(() => {
    if (!open || !username) return null;
    const targetUser = (users ?? []).find((u) => String(u?.iusuario ?? "").trim().toUpperCase() === username.toUpperCase());
    if (!targetUser) return null;
    const active = activeRoles(roles);
    const directRoles = userRoles(targetUser.permisos);
    const chains = directRoles.map((rn) => chainForRole(active, rn));
    const { allows, fixFilters, others } = summarizePerms(targetUser.permisos);
    return { targetUser, chains, activeRoles: active, allows, fixFilters, others };
  }, [open, username, users, roles]);
  return /* @__PURE__ */ jsxs7(
    GlassDialog,
    {
      open,
      onClose,
      maxWidth: "md",
      fullWidth: true,
      paperClassName: "permisos-user-summary-dialog",
      header: /* @__PURE__ */ jsx11(
        GlassDialogHeader,
        {
          icon: "mdi:shield-account-outline",
          title: `Resumen de permisos \u2014 ${username || ""}`,
          subtitle: "Solo lectura \xB7 composici\xF3n en cliente \xB7 incluye cadena de roles y permisos efectivos",
          accent: "#1e90ff",
          onClose
        }
      ),
      children: [
        /* @__PURE__ */ jsx11(Box7, { sx: { ...glassDialogContentSx(), minHeight: 360 }, children: !username ? /* @__PURE__ */ jsx11(Typography6, { color: "text.secondary", children: "Sin usuario seleccionado." }) : !data ? /* @__PURE__ */ jsxs7(Stack6, { direction: "row", spacing: 1.5, alignItems: "center", children: [
          /* @__PURE__ */ jsx11(CircularProgress5, { size: 20 }),
          /* @__PURE__ */ jsx11(Typography6, { color: "text.secondary", children: "Usuario no encontrado en los datos cargados." })
        ] }) : /* @__PURE__ */ jsxs7(Fragment4, { children: [
          /* @__PURE__ */ jsxs7(Box7, { children: [
            /* @__PURE__ */ jsx11(Typography6, { variant: "overline", color: "text.secondary", children: "Usuario" }),
            /* @__PURE__ */ jsx11(Typography6, { variant: "h6", fontWeight: 700, children: data.targetUser.iusuario }),
            data.targetUser.permisos?.nombre || data.targetUser.permisos?.namedisplay ? /* @__PURE__ */ jsx11(Typography6, { variant: "body2", color: "text.secondary", children: data.targetUser.permisos.nombre || data.targetUser.permisos.namedisplay }) : null
          ] }),
          /* @__PURE__ */ jsx11(Divider2, { sx: { my: 1.5 } }),
          /* @__PURE__ */ jsxs7(Typography6, { variant: "overline", color: "text.secondary", children: [
            "Cadena de roles ",
            data.chains.length ? `(${data.chains.length})` : ""
          ] }),
          data.chains.length === 0 ? /* @__PURE__ */ jsx11(Typography6, { variant: "body2", color: "text.secondary", sx: { mt: 0.5 }, children: "El usuario no tiene roles asignados. Permisos efectivos = visitante por defecto." }) : /* @__PURE__ */ jsx11(Stack6, { spacing: 1, sx: { mt: 1 }, children: data.chains.map((c) => /* @__PURE__ */ jsx11(RoleCard, { chain: c, roles: data.activeRoles }, c.name)) }),
          /* @__PURE__ */ jsx11(Divider2, { sx: { my: 1.5 } }),
          /* @__PURE__ */ jsx11(Typography6, { variant: "overline", color: "text.secondary", children: "Permisos efectivos del usuario" }),
          /* @__PURE__ */ jsx11(Typography6, { variant: "caption", color: "text.secondary", sx: { display: "block", mt: 0.25 }, children: "Calculados a partir de sus roles directos m\xE1s la herencia por path jer\xE1rquico, replicando el merge del backend." }),
          data.allows.length === 0 && data.fixFilters.length === 0 && data.others.length === 0 ? /* @__PURE__ */ jsx11(Typography6, { variant: "body2", color: "text.secondary", sx: { mt: 1 }, children: "Sin permisos materializados m\xE1s all\xE1 del visitante por defecto." }) : /* @__PURE__ */ jsxs7(Fragment4, { children: [
            /* @__PURE__ */ jsx11(PermList, { title: "Permitidos", items: data.allows, kind: "allow" }),
            /* @__PURE__ */ jsx11(PermList, { title: "Con filtro fijo", items: data.fixFilters, kind: "fixFilter" }),
            /* @__PURE__ */ jsx11(PermList, { title: "Otros", items: data.others, kind: "other" })
          ] }),
          /* @__PURE__ */ jsx11(Divider2, { sx: { my: 1.5 } }),
          /* @__PURE__ */ jsx11(Typography6, { variant: "caption", color: "text.secondary", children: "Los detalles completos por rol se obtienen al abrir cada columna en la jerarqu\xEDa. Este resumen es de solo lectura y se actualiza al recargar el panel." })
        ] }) }),
        /* @__PURE__ */ jsx11(Box7, { sx: glassDialogActionsSx(), children: /* @__PURE__ */ jsx11(
          "button",
          {
            type: "button",
            className: "MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-textPrimary MuiButton-sizeMedium MuiButton-colorPrimary",
            onClick: onClose,
            children: "Cerrar"
          }
        ) })
      ]
    }
  );
}

// js/core/urlState.ts
init_patyia();
var STATE_VERSION = 1;
function normalizeLog(raw) {
  if (!raw || typeof raw !== "object") return {};
  const o = { ...raw };
  const w = Number(o.sidebarW);
  if (Number.isFinite(w) && w > 0) o.sidebarW = Math.round(w);
  else delete o.sidebarW;
  return o;
}
function initial() {
  return { v: STATE_VERSION, tool: "chat", log: {}, prompts: {}, chat: { pane: "conv" }, todos: {}, config: { pane: "sistema" } };
}
function normalizeChatPane(raw) {
  return raw === "logs" ? "logs" : "conv";
}
function normalizeConfigPane(raw) {
  if (raw === "permisos") return "permisos";
  if (raw === "prompts") return "prompts";
  return "sistema";
}
function legacyConfigPaneFromLs() {
  try {
    const v = localStorage.getItem("isa-patyia:config-tab");
    if (v === "permisos" || v === "prompts") return v;
    return "sistema";
  } catch {
    return "sistema";
  }
}
function normalizeTool(raw) {
  if (raw === "log") return "chat";
  if (raw === "prompts") return "config";
  if (raw === "chat") return "chat";
  if (raw === "todos") return "todos";
  if (raw === "config") return "config";
  return "chat";
}
function normalizeChatBag(chat, legacyTool) {
  const bag = chat && typeof chat === "object" ? { ...chat } : {};
  if ((bag.mode == null || String(bag.mode).trim() === "") && bag.jailbreak != null) {
    bag.mode = bag.jailbreak === true ? "libre" : "patyia";
    delete bag.jailbreak;
  } else if (bag.jailbreak != null) {
    delete bag.jailbreak;
  }
  if (legacyTool === "log") {
    bag.pane = "logs";
  } else {
    bag.pane = normalizeChatPane(bag.pane);
  }
  return bag;
}
function normalizeConfigBag(config, legacyTool) {
  const bag = config && typeof config === "object" ? { ...config } : {};
  if (legacyTool === "prompts") {
    bag.pane = "prompts";
  } else if (bag.pane !== "sistema" && bag.pane !== "permisos" && bag.pane !== "prompts") {
    bag.pane = legacyConfigPaneFromLs();
  } else {
    bag.pane = normalizeConfigPane(bag.pane);
  }
  return bag;
}
function normalize(raw, _prev) {
  if (!raw || typeof raw !== "object") return initial();
  const legacyTool = raw.tool;
  const tool = normalizeTool(legacyTool);
  const chat = normalizeChatBag(raw.chat, legacyTool);
  const todos = raw.todos && typeof raw.todos === "object" ? raw.todos : {};
  const config = normalizeConfigBag(raw.config, legacyTool);
  return {
    v: raw.v ?? STATE_VERSION,
    tool,
    log: normalizeLog(raw.log),
    prompts: raw.prompts && typeof raw.prompts === "object" ? raw.prompts : {},
    chat,
    todos,
    config
  };
}
function slimForUrl(src) {
  const slim = { ...src };
  const log = slim.log;
  if (log) {
    const nextLog = { ...log };
    if (nextLog.jsonInput && String(nextLog.jsonInput).length > 4e3) {
      slim.log = {
        convId: nextLog.convId || "",
        ...nextLog.sidebarW != null ? { sidebarW: nextLog.sidebarW } : {}
      };
    } else {
      slim.log = nextLog;
    }
  }
  const prompts = slim.prompts;
  if (prompts?.bodies) {
    const bodies = {};
    let total = 0;
    for (const [k, v] of Object.entries(prompts.bodies)) {
      const t = String(v ?? "");
      if (total + t.length > 6e3) break;
      bodies[k] = t;
      total += t.length;
    }
    slim.prompts = { ...prompts, bodies };
  }
  return slim;
}
function mergeConfig(state, partial) {
  const prev = state.config && typeof state.config === "object" ? { ...state.config } : {};
  const next = partial && typeof partial === "object" ? partial : {};
  const prevPermisos = prev.permisos && typeof prev.permisos === "object" ? { ...prev.permisos } : {};
  const nextPermisos = next.permisos && typeof next.permisos === "object" ? next.permisos : null;
  return {
    ...prev,
    ...next,
    ...nextPermisos ? { permisos: { ...prevPermisos, ...nextPermisos } } : {}
  };
}
function merge(state, partial) {
  const nextLog = { ...state.log, ...partial.log || {} };
  if ("jsonInput" in nextLog) delete nextLog.jsonInput;
  return {
    ...state,
    ...partial,
    log: nextLog,
    prompts: {
      ...state.prompts,
      ...partial.prompts || {}
    },
    chat: {
      ...state.chat,
      ...partial.chat || {}
    },
    todos: {
      ...state.todos,
      ...partial.todos || {}
    },
    config: mergeConfig(state, partial.config)
  };
}
var URL_STATE_PARAM = "s";
function stripUrlStateParam() {
  try {
    const url = new URL(location.href);
    if (!url.searchParams.has(URL_STATE_PARAM)) return;
    url.searchParams.delete(URL_STATE_PARAM);
    history.replaceState(null, "", url);
  } catch {
  }
}
function migrateLegacyFlatQuery() {
  if (typeof window === "undefined" || !window.ISAFront?.b64urlEncode) return;
  try {
    const url = new URL(location.href);
    if (url.searchParams.has(URL_STATE_PARAM)) return;
    const tool = url.searchParams.get("tool");
    const legacyKeys = [...url.searchParams.keys()].filter(
      (k) => k === "tool" || k === "local" || k.includes(".")
    );
    if (!legacyKeys.length) return;
    const next = {
      v: STATE_VERSION,
      tool: normalizeTool(tool),
      log: {},
      prompts: {},
      chat: {},
      todos: {},
      config: {}
    };
    for (const [key, raw] of url.searchParams.entries()) {
      if (key === "tool" || key === "local") continue;
      const dot = key.indexOf(".");
      if (dot < 0) continue;
      const section = key.slice(0, dot);
      const field = key.slice(dot + 1);
      if (section !== "log" && section !== "prompts" && section !== "chat" && section !== "todos") continue;
      const bag = next[section] || {};
      if (field === "convId" && (section === "chat" || section === "log")) {
        const n = Number(raw);
        bag.convId = Number.isFinite(n) && n > 0 ? n : String(raw ?? "").trim();
      } else if (field === "mode") {
        bag.mode = String(raw ?? "").trim().toLowerCase() || "patyia";
      } else if (field === "jailbreak") {
        bag.mode = raw === "1" || raw === "true" ? "libre" : "patyia";
      } else if (field === "boardId" || field === "milestoneId" || field === "taskId") {
        const n = Number(raw);
        if (Number.isFinite(n) && n > 0) bag[field] = n;
      } else {
        bag[field] = raw;
      }
      next[section] = bag;
    }
    legacyKeys.forEach((k) => url.searchParams.delete(k));
    const slim = slimForUrl(next);
    const json = JSON.stringify(slim);
    if (json !== "{}") url.searchParams.set(URL_STATE_PARAM, window.ISAFront.b64urlEncode(json));
    history.replaceState(null, "", url);
  } catch {
  }
}
migrateLegacyFlatQuery();
var urlState = window.ISAFront.createUrlState({
  param: URL_STATE_PARAM,
  debounceMs: 350,
  maxB64Len: 12e3,
  historyKey: "patyAppState",
  initial,
  normalize,
  slimForUrl,
  merge,
  onInit() {
    ensureIssLocalDefault();
  },
  brandHomeReset(api) {
    const snap = api.reset();
    stripUrlStateParam();
    return snap;
  }
});
var bootState = urlState.boot;
var getSnapshot = urlState.getSnapshot;
var mergePartial = urlState.mergePartial;
var hrefFor = urlState.hrefFor;
var subscribe = urlState.subscribe;
var PARAM = urlState.PARAM;
function configPermisosBag(snap) {
  const cfg = (snap ?? getSnapshot()).config;
  const permisos = cfg?.permisos;
  return permisos && typeof permisos === "object" ? permisos : void 0;
}
function readPermisosHideEmptyFromUrl(snap) {
  return configPermisosBag(snap)?.hideEmpty !== false;
}
function persistPermisosHideEmpty(hide) {
  const prev = readPermisosHideEmptyFromUrl();
  if (prev === hide) return getSnapshot();
  return mergePartial({ tool: "config", config: { permisos: { hideEmpty: !!hide } } });
}

// js/tools/PermisosPanel.jsx
init_sessionApi();
import { jsx as jsx12, jsxs as jsxs8 } from "react/jsx-runtime";
var { useState: useState8, useEffect: useEffect9, useCallback: useCallback4, useMemo: useMemo6, useRef: useRef4 } = getReact();
var { Typography: Typography7, Stack: Stack7, Alert: Alert3, CircularProgress: CircularProgress6, Box: Box8, Chip: Chip7, DialogContent: DialogContent4, DialogActions: DialogActions3, Button: Button3, FormControlLabel: FormControlLabel2, Switch } = getMaterialUI();
function PermisosPanel({ onNeedLogin }) {
  const [loading, setLoading] = useState8(true);
  const [busy, setBusy] = useState8(false);
  const [canManage, setCanManage] = useState8(false);
  const [canAssignUserRoles, setCanAssignUserRoles] = useState8(false);
  const [canEditRoleDescriptions, setCanEditRoleDescriptions] = useState8(false);
  const [authTick, setAuthTick] = useState8(0);
  const loggedIn = useMemo6(() => !!Session?.isLoggedIn?.(), [authTick]);
  const sessionUsername = useMemo6(() => String(Session.username?.() ?? "").trim().toUpperCase(), [authTick]);
  const [err, setErr] = useState8("");
  const [data, setData] = useState8({ roles: [], users: [] });
  const [userSearch, setUserSearch] = useState8("");
  const [roleFilters, setRoleFilters] = useState8([]);
  const [hideEmptyStacks, setHideEmptyStacks] = useState8(readPermisosHideEmptyFromUrl);
  const [filterBusy, setFilterBusy] = useState8(false);
  const [dragOverFilter, setDragOverFilter] = useState8(false);
  const [actorJerarquia, setActorJerarquia] = useState8(null);
  const [actorJerarquias, setActorJerarquias] = useState8([]);
  const [actorRoles, setActorRoles] = useState8([]);
  const [hierarchyOpen, setHierarchyOpen] = useState8(false);
  const [hierarchyFocusRole, setHierarchyFocusRole] = useState8(null);
  const [hierarchyNodes, setHierarchyNodes] = useState8([]);
  const [hierarchyBusy, setHierarchyBusy] = useState8(false);
  const [summaryUsername, setSummaryUsername] = useState8(null);
  const filterToolbarRef = useRef4(null);
  const filterFetchSkipRef = useRef4(true);
  const filterDropFetchRef = useRef4(false);
  const rolesRef = useRef4(data.roles);
  const usersRef = useRef4(data.users);
  const hierarchyLoadRef = useRef4(null);
  rolesRef.current = data.roles;
  usersRef.current = data.users;
  const usersPaginated = !!data.usersTruncated;
  const applyFlags = useCallback4((result) => {
    setCanManage(!!result.canManage);
    setCanAssignUserRoles(!!result.canAssignUserRoles);
    setCanEditRoleDescriptions(!!result.canEditRoleDescriptions);
    const actorRoles2 = Array.isArray(result.actorRoles) ? result.actorRoles : Array.isArray(Session?.roles) ? Session.roles : [];
    const rolePermisosIdx = buildRolePermisosIndex(Array.isArray(result.roles) ? result.roles : []);
    setActorRoles(actorRoles2.map((r) => String(r ?? "").trim().toLowerCase()).filter(Boolean));
    setActorJerarquias(actorJerarquiasFromRoles(actorRoles2, rolePermisosIdx));
    setActorJerarquia(actorJerarquiaFromRoles(actorRoles2, rolePermisosIdx));
  }, []);
  const load = useCallback4(async () => {
    setLoading(true);
    setErr("");
    try {
      const result = await fetchPermisos();
      if (!Array.isArray(result.roles) || result.roles.length === 0) {
        throw new Error("ISS no devolvi\xF3 roles activos. Verifique modo Local (ISS :8802) o recargue tras iniciar func start.");
      }
      setData(result);
      applyFlags(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  }, [applyFlags]);
  const refreshPermisos = useCallback4(async () => {
    const result = await fetchPermisos();
    if (!Array.isArray(result.roles) || result.roles.length === 0) {
      throw new Error("ISS no devolvi\xF3 roles activos. Verifique modo Local (ISS :8802) o recargue tras iniciar func start.");
    }
    setData(result);
    applyFlags(result);
    return result;
  }, [applyFlags]);
  const loadHierarchy = useCallback4(async (fallbackRoles = rolesRef.current) => {
    if (hierarchyLoadRef.current) return hierarchyLoadRef.current;
    setHierarchyBusy(true);
    const task = (async () => {
      try {
        const r = await fetchHierarchy();
        let nodes = Array.isArray(r.roles) ? r.roles : [];
        if (!nodes.length) nodes = hierarchyNodesFromRoleEntries(fallbackRoles);
        if (nodes.length) setHierarchyNodes(nodes);
      } catch (e) {
        const nodes = hierarchyNodesFromRoleEntries(fallbackRoles);
        if (nodes.length) setHierarchyNodes(nodes);
        if (!nodes.length) {
          toastError?.((e instanceof Error ? e.message : String(e)) ?? "Error cargando jerarqu\xEDa");
        }
      } finally {
        setHierarchyBusy(false);
        hierarchyLoadRef.current = null;
      }
    })();
    hierarchyLoadRef.current = task;
    return task;
  }, []);
  const openHierarchyDialog = useCallback4(() => {
    hierarchyLoadRef.current = null;
    setHierarchyFocusRole(null);
    const roles = rolesRef.current;
    if (Array.isArray(roles) && roles.length) {
      setHierarchyNodes(hierarchyNodesFromRoleEntries(roles));
    }
    setHierarchyOpen(true);
  }, []);
  const openHierarchyForRole = useCallback4((roleName) => {
    const id = String(roleName ?? "").trim().toLowerCase();
    if (!id) return;
    hierarchyLoadRef.current = null;
    const roles = rolesRef.current;
    if (Array.isArray(roles) && roles.length) {
      setHierarchyNodes(hierarchyNodesFromRoleEntries(roles));
    }
    setHierarchyFocusRole(id);
    setHierarchyOpen(true);
  }, []);
  useEffect9(() => {
    if (!hierarchyOpen) return void 0;
    const roles = rolesRef.current;
    if (!Array.isArray(roles) || !roles.length) return void 0;
    void loadHierarchy(roles);
    return void 0;
  }, [hierarchyOpen, data.roles, loadHierarchy]);
  const handleHierarchySave = useCallback4(async (name, jerarquia) => {
    setHierarchyBusy(true);
    try {
      await updateHierarchyRole(name, { jerarquia });
      await loadHierarchy(rolesRef.current);
      await refreshPermisos();
      toastSuccess?.(`Rol ${name} actualizado`);
    } finally {
      setHierarchyBusy(false);
    }
  }, [loadHierarchy, refreshPermisos]);
  const handleHierarchyCreate = useCallback4(async (name, jerarquia) => {
    setHierarchyBusy(true);
    try {
      await createHierarchyRole({ name, jerarquia });
      await loadHierarchy(rolesRef.current);
      await refreshPermisos();
      toastSuccess?.(`Rol ${name} creado`);
    } finally {
      setHierarchyBusy(false);
    }
  }, [loadHierarchy, refreshPermisos]);
  const handleHierarchyPromote = useCallback4(async (key, value, fromJer, toJer) => {
    setHierarchyBusy(true);
    try {
      throw new Error(`Promover permisos entre roles a\xFAn no soportado en backend (${fromJer} \u2192 ${toJer})`);
    } finally {
      setHierarchyBusy(false);
    }
  }, []);
  const handleHierarchyLocalPerm = useCallback4(async (nodeJer, key, value) => {
    setHierarchyBusy(true);
    try {
      throw new Error(`Edici\xF3n de permisos individuales a\xFAn no soportada en backend (${nodeJer}: ${key})`);
    } finally {
      setHierarchyBusy(false);
    }
  }, []);
  const handleHierarchyDelete = useCallback4(async (name) => {
    setHierarchyBusy(true);
    try {
      await deleteHierarchyRole(name);
      await loadHierarchy(rolesRef.current);
      await refreshPermisos();
      toastSuccess?.(`Rol ${name} eliminado`);
    } finally {
      setHierarchyBusy(false);
    }
  }, [loadHierarchy, refreshPermisos]);
  const loadRef = useRef4(load);
  loadRef.current = load;
  useEffect9(() => {
    loadRef.current();
  }, []);
  useEffect9(() => subscribe((snap) => {
    const hide = readPermisosHideEmptyFromUrl(snap);
    setHideEmptyStacks((prev) => prev === hide ? prev : hide);
  }), []);
  const setHideEmptyStacksPersist = useCallback4((hide) => {
    setHideEmptyStacks(hide);
    persistPermisosHideEmpty(hide);
  }, []);
  const userDirectory = useMemo6(() => buildUserDirectoryFromPermisos(data.users), [data.users]);
  useEffect9(() => {
    Assets.ensureTodosCss();
    const onAuth = () => {
      setAuthTick((t) => t + 1);
      loadRef.current();
    };
    window.addEventListener(Session.EVENT, onAuth);
    window.addEventListener("isa-patyia:auth", onAuth);
    return () => {
      window.removeEventListener(Session.EVENT, onAuth);
      window.removeEventListener("isa-patyia:auth", onAuth);
    };
  }, []);
  async function run(fn, okMsg) {
    if (!requireAppSession(onNeedLogin)) return;
    setBusy(true);
    setErr("");
    try {
      const result = await fn();
      setData(result);
      applyFlags(result);
      if (okMsg) toastSuccess(okMsg);
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      toastError(msg);
      throw e;
    } finally {
      setBusy(false);
    }
  }
  const handleRoleRemove = useCallback4(async ({ username, role, roleTitle }) => {
    if (!requireAppSession(onNeedLogin)) throw new Error("Sesi\xF3n requerida");
    if (!canAssignUserRoles) throw new Error("Sin permiso para mover usuarios entre roles");
    setErr("");
    try {
      const result = await removeUsuarioRole(username, role);
      setData(result);
      applyFlags(result);
      toastSuccess(`${username} quit\xF3 ${roleTitle || role}`);
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      toastError(msg);
      throw e;
    }
  }, [onNeedLogin, applyFlags, canAssignUserRoles]);
  const handleRoleAdd = useCallback4(async ({ username, role, roleTitle }) => {
    if (!requireAppSession(onNeedLogin)) throw new Error("Sesi\xF3n requerida");
    if (!canAssignUserRoles) throw new Error("Sin permiso para mover usuarios entre roles");
    setErr("");
    try {
      const result = await addUsuarioRole(username, role);
      setData(result);
      applyFlags(result);
      toastSuccess(`${username} \u2192 ${roleTitle || role}`);
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      toastError(msg);
      throw e;
    }
  }, [onNeedLogin, applyFlags, canAssignUserRoles]);
  const handleRoleDrag = useCallback4(async ({ username, fromRole, toRole, mode }) => {
    if (!requireAppSession(onNeedLogin)) throw new Error("Sesi\xF3n requerida");
    if (!canAssignUserRoles) throw new Error("Sin permiso para mover usuarios entre roles");
    setErr("");
    try {
      const result = await patchUsuarioRoles(username, { fromRole, toRole, mode });
      setData(result);
      applyFlags(result);
      toastSuccess(`${username} \u2192 ${toRole}`);
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      toastError(msg);
      throw e;
    }
  }, [onNeedLogin, applyFlags, canAssignUserRoles]);
  const fetchPermisosWithSearch = useCallback4(async (search) => {
    const q = String(search ?? "").trim();
    return fetchPermisos(q ? { search: q } : void 0);
  }, []);
  const handleUserFilterDrop = useCallback4(async (username) => {
    const q = String(username ?? "").trim();
    if (!q) return;
    setUserSearch(q);
    if (!usersPaginated) return;
    filterDropFetchRef.current = true;
    setFilterBusy(true);
    setErr("");
    try {
      const result = await fetchPermisosWithSearch(q);
      setData(result);
      applyFlags(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      toastError(msg);
    } finally {
      setFilterBusy(false);
    }
  }, [usersPaginated, fetchPermisosWithSearch, applyFlags]);
  const handleRoleFilterDrop = useCallback4((roleId) => {
    const id = String(roleId ?? "").trim().toLowerCase();
    if (!id) return;
    setRoleFilters((prev) => prev.includes(id) ? prev : [...prev, id]);
  }, []);
  const clearFilters = useCallback4(async () => {
    setUserSearch("");
    setRoleFilters([]);
    if (!usersPaginated) return;
    setFilterBusy(true);
    setErr("");
    try {
      const result = await fetchPermisos();
      setData(result);
      applyFlags(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      toastError(msg);
    } finally {
      setFilterBusy(false);
    }
  }, [usersPaginated, applyFlags]);
  useEffect9(() => {
    if (!usersPaginated) return void 0;
    if (filterFetchSkipRef.current) {
      filterFetchSkipRef.current = false;
      return void 0;
    }
    if (filterDropFetchRef.current) {
      filterDropFetchRef.current = false;
      return void 0;
    }
    const t = window.setTimeout(async () => {
      setFilterBusy(true);
      setErr("");
      try {
        const result = await fetchPermisosWithSearch(userSearch);
        setData(result);
        applyFlags(result);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setErr(msg);
        toastError(msg);
      } finally {
        setFilterBusy(false);
      }
    }, 320);
    return () => window.clearTimeout(t);
  }, [userSearch, usersPaginated, fetchPermisosWithSearch]);
  const roleOptions = useMemo6(
    () => (data.roles || []).map((r) => ({ id: roleNameFromEntry(r), label: roleTitleFromEntry(r) })).filter((r) => r.id && r.id !== VISITANTE),
    [data.roles]
  );
  const boardData = useMemo6(
    () => buildPermisosBoard(data, { userSearch, roleFilters, userDirectory, hideEmptyColumns: hideEmptyStacks }),
    [data, userSearch, roleFilters, userDirectory, hideEmptyStacks]
  );
  const readOnly = !canAssignUserRoles;
  const managePermisos = canManage;
  const editRoleMeta = canEditRoleDescriptions || canManage;
  const filtersActive = !!(userSearch.trim() || roleFilters.length);
  const { GlassToolbar } = getGlass();
  const handleSaveRolePermisos = useCallback4(async (name, permisos, bactivo) => {
    if (!editRoleMeta || !requireAppSession(onNeedLogin)) return;
    setBusy(true);
    setErr("");
    try {
      const result = await putPermisoRolePath(name, permisos, managePermisos ? bactivo : void 0);
      await loadHierarchy(rolesRef.current);
      setData(result);
      applyFlags(result);
      toastSuccess(`Rol ${name} guardado`);
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      toastError(msg);
      throw e;
    } finally {
      setBusy(false);
    }
  }, [editRoleMeta, onNeedLogin, managePermisos, applyFlags, loadHierarchy]);
  if (loading && !hierarchyOpen) {
    return /* @__PURE__ */ jsx12(Box8, { className: "config-permisos-loading", children: /* @__PURE__ */ jsx12(CircularProgress6, { size: 26 }) });
  }
  return /* @__PURE__ */ jsxs8(Box8, { className: "paty-permisos-shell", sx: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }, children: [
    /* @__PURE__ */ jsx12(Box8, { ref: filterToolbarRef, className: "config-permisos-toolbar-wrap", sx: { flexShrink: 0 }, children: /* @__PURE__ */ jsxs8(GlassToolbar, { className: `config-permisos-toolbar${dragOverFilter ? " config-permisos-toolbar--filter-drop" : ""}`, sx: { borderRadius: 0, mb: 0, flexShrink: 0, gap: 0.75, px: { xs: 1.25, sm: 1.75 }, py: 0.5, alignItems: "center", minHeight: 40 }, children: [
      /* @__PURE__ */ jsx12(
        PermisosUserAutocomplete,
        {
          variant: "toolbar",
          label: "",
          placeholder: "Buscar usuario\u2026",
          value: userSearch || null,
          onChange: (u) => setUserSearch(u ?? ""),
          disabled: filterBusy,
          allowNew: true,
          limit: 10,
          roleFilter: roleFilters.length === 1 ? roleFilters[0] : null,
          className: "config-permisos-toolbar__field config-permisos-toolbar__field--search"
        }
      ),
      /* @__PURE__ */ jsx12(PermisosRoleFilterAutocomplete, { options: roleOptions, value: roleFilters, onChange: setRoleFilters, disabled: filterBusy }),
      filtersActive ? /* @__PURE__ */ jsx12(
        Chip7,
        {
          size: "small",
          variant: "outlined",
          className: "isa-neon-glass-chip",
          label: "Filtros",
          onDelete: clearFilters,
          disabled: filterBusy
        }
      ) : null,
      /* @__PURE__ */ jsx12(
        FormControlLabel2,
        {
          className: "config-permisos-toolbar__hide-empty",
          control: /* @__PURE__ */ jsx12(Switch, { size: "small", checked: hideEmptyStacks, onChange: (e) => setHideEmptyStacksPersist(e.target.checked), disabled: filterBusy }),
          label: "Ocultar vac\xEDos",
          sx: { mr: 0, ml: 0.25, flexShrink: 0, "& .MuiFormControlLabel-label": { fontSize: "0.75rem", whiteSpace: "nowrap" } }
        }
      ),
      /* @__PURE__ */ jsx12(Box8, { sx: { flex: 1, minWidth: 8 } }),
      /* @__PURE__ */ jsxs8(Stack7, { direction: "row", spacing: 0.5, alignItems: "center", className: "config-form-section__actions config-permisos-toolbar__actions", children: [
        /* @__PURE__ */ jsx12(ButtonIconify, { icon: "mdi:family-tree", title: "Jerarqu\xEDa y rol visitante", onClick: openHierarchyDialog, disabled: busy || filterBusy }),
        /* @__PURE__ */ jsx12(ButtonIconify, { icon: "mdi:refresh", title: "Recargar", onClick: load, disabled: busy || filterBusy })
      ] })
    ] }) }),
    err ? /* @__PURE__ */ jsx12(Alert3, { severity: "warning", className: "config-form-alert config-permisos-alert", children: err }) : null,
    /* @__PURE__ */ jsx12(
      PermisosKanban,
      {
        boardData,
        loggedIn,
        sessionUsername,
        canAssignRoles: canAssignUserRoles,
        readOnly,
        canManage: managePermisos,
        canEditRoleDescriptions: editRoleMeta,
        busy: busy || filterBusy,
        actorJerarquia,
        actorJerarquias,
        onJerarquiaToast: (t) => toastInfo?.(t.message) ?? alert(t.message),
        onOpenRoleHierarchy: openHierarchyForRole,
        onUserSummary: (username) => setSummaryUsername(username),
        filterToolbarRef,
        onUserFilterDrop: handleUserFilterDrop,
        onRoleFilterDrop: handleRoleFilterDrop,
        onDragOverFilterChange: setDragOverFilter,
        onRoleSave: ({ name, permisos, bactivo }) => run(() => putPermisoRolePath(name, permisos, bactivo), `Rol ${name} guardado`),
        onRoleDrag: handleRoleDrag,
        onRoleRemove: handleRoleRemove,
        onRoleAdd: handleRoleAdd
      }
    ),
    /* @__PURE__ */ jsxs8(
      GlassDialog,
      {
        open: hierarchyOpen,
        onClose: () => {
          setHierarchyOpen(false);
          setHierarchyFocusRole(null);
        },
        fullScreen: true,
        fullWidth: true,
        maxWidth: false,
        paperClassName: "isa-glass-dialog--fullscreen permisos-hierarchy-dialog",
        header: /* @__PURE__ */ jsx12(GlassDialogHeader, { icon: "mdi:family-tree", title: "Jerarqu\xEDa de roles", subtitle: "Zoom/pan \xB7 hover \xB1 \xB7 doble clic edita", accent: "#10b981", onClose: () => {
          setHierarchyOpen(false);
          setHierarchyFocusRole(null);
        } }),
        children: [
          /* @__PURE__ */ jsx12(DialogContent4, { dividers: true, sx: Object.assign({}, glassDialogContentSx({ p: 0, flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }), { height: "100%" }), children: /* @__PURE__ */ jsx12(
            RoleHierarchyView,
            {
              nodes: hierarchyNodes,
              roleEntries: data.roles,
              initialSelectedRole: hierarchyFocusRole,
              canManagePermisos: managePermisos,
              canEditRoleDescriptions: editRoleMeta,
              onSaveRolePermisos: editRoleMeta ? handleSaveRolePermisos : void 0,
              canMutate: isBranchZero(actorJerarquia ?? ""),
              canCreateRoles: isViewingAsRole() ? String(getViewAsRole() || "").toLowerCase() === "dev_lead" : actorIsDevLead(actorRoles),
              busy: hierarchyBusy,
              onSave: handleHierarchySave,
              onCreate: handleHierarchyCreate,
              onDelete: handleHierarchyDelete,
              onSaveLocalPerm: handleHierarchyLocalPerm,
              onPromote: handleHierarchyPromote
            }
          ) }),
          /* @__PURE__ */ jsx12(DialogActions3, { sx: glassDialogActionsSx(), children: /* @__PURE__ */ jsx12(Button3, { onClick: () => setHierarchyOpen(false), sx: { textTransform: "none", fontWeight: 600 }, children: "Cerrar" }) })
        ]
      }
    ),
    /* @__PURE__ */ jsx12(
      UserPermissionsSummaryDialog,
      {
        open: !!summaryUsername,
        onClose: () => setSummaryUsername(null),
        username: summaryUsername,
        users: data?.users ?? [],
        roles: data?.roles ?? []
      }
    )
  ] });
}
export {
  PermisosPanel
};
