/** Sesión ISA PatyIA — permisos via /api/permissions/me.
 *
 * Single source of truth: el endpoint del ISS. No se consulta ISAFront.Session.can() para
 * visibilidad/habilitación de tools. Solo el chat mantiene checks legacy (infra.target.switch,
 * patyia.chat.*) hasta que ISS los exponga como caps.
 *
 * «Ver como» (rol) y suplantoación (usuario) son SOLO front / system-login:
 * nunca deben cambiar la autorización del ISS. Ver installViewAsFrontOnlyGuard().
 */
import { Session } from "../core/platform.ts";
import { toastError, toastWarning } from "../core/platform.ts";
import { fetchPermissionsMe } from "./systemConfigApi.ts";
import { compareHierarchy, getRoleJerarquia } from "../tools/roleHierarchy.js";
import { canonicalRoleMeta } from "../tools/roleCanonicalMeta.js";
import {
  readViewAsRole,
  writeViewAsRole,
  clearViewAsRole,
  capsForViewAsRole,
  formatViewAsRoleLabel,
  realRolesAllowViewAs,
  clampViewAsCapsToReal,
  isDevBranchRole,
  VIEW_AS_ROLE_OPTIONS,
  VIEW_AS_ROLE_EVENT,
} from "../core/viewAsRole.ts";

/** Quita X-View-As-* para que ISS/capFetch vean siempre al Bearer real. */
export function stripViewAsHeaders(headers: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = { ...headers };
  for (const k of Object.keys(out)) {
    if (/^x-view-as-/i.test(k)) delete out[k];
  }
  return out;
}

/**
 * authHeader del Session (CDN) metía X-View-As-User en TODAS las APIs.
 * Lo limitamos: default sin view-as; refreshProfile de system-login sí lo conserva.
 */
function installViewAsFrontOnlyGuard(): void {
  const bag = Session as unknown as {
    authHeader?: () => Record<string, string>;
    refreshProfile?: () => Promise<unknown>;
    __viewAsFrontOnly?: boolean;
  };
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

installViewAsFrontOnlyGuard();
try {
  window.addEventListener("isa-patyia:auth", () => installViewAsFrontOnlyGuard());
  window.addEventListener("system-login:auth", () => installViewAsFrontOnlyGuard());
} catch { /* ignore */ }

function formatRoleTitle(roleName) {
  return String(roleName ?? "")
    .split("_")
    .map((part) => {
      const p = part.toLowerCase();
      if (p === "iss" || p === "isw") return p.toUpperCase();
      if (!p) return "";
      return p.charAt(0).toUpperCase() + p.slice(1);
    })
    .filter(Boolean)
    .join(" ");
}

function roleLabel(roleName) {
  const key = String(roleName ?? "").trim().toLowerCase();
  if (!key) return "";
  const canon = canonicalRoleMeta(key);
  if (canon?.namedisplay) return canon.namedisplay;
  return formatRoleTitle(key);
}

function pickPrimaryIssRole(roles) {
  const list = (roles ?? []).map((r) => String(r ?? "").trim().toLowerCase()).filter(Boolean);
  if (!list.length) return "";
  list.sort((a, b) => compareHierarchy(getRoleJerarquia(a), getRoleJerarquia(b)));
  const elevated = list.filter((r) => r !== "visitante");
  return elevated[0] ?? list[0];
}

/** Id canónico del rol ISS primario (para UI «Ver como»). */
export function resolvePrimaryIssRoleId(): string {
  if (!Session.isLoggedIn()) return "";
  const key = sessionCacheKey();
  if (key === ME_CAPS_KEY && ME_ISS_ROLES.length) return pickPrimaryIssRole(ME_ISS_ROLES);
  if (key === ME_CAPS_KEY && ME_LOGIN_ROLE) return String(ME_LOGIN_ROLE).trim().toLowerCase();
  const sl = Session.current()?.role;
  return sl ? String(sl).trim().toLowerCase() : "";
}

/** Cap legacy que se conserva solo para chat (auditoría + admin JWT). */
export const INSTRUCCIONES_WRITE_CAP = "patyia.instrucciones.publish";
export const TARGET_SWITCH_CAP = "infra.target.switch";

/** Cache local de capabilities devueltas por GET /api/permissions/me.
 *  La fuente canónica es el endpoint; este cache es solo espejo en memoria. */
type MeCapabilities = {
  canEditInstrucciones?: boolean;
  canEditOpenAiConfig?: boolean;
  canEditPromptsOperativos?: boolean;
  canEditConversacionConfig?: boolean;
  canEditSwagger?: boolean;
  canOverrideSampling?: boolean;
  canManagePermissions?: boolean;
  canImpersonate?: boolean;
  canAssignUserRoles?: boolean;
  canAccessOthers?: boolean;
  canViewKanban?: boolean;
  canEditKanbanCards?: boolean;
  canViewLogs?: boolean;
  canViewPrompts?: boolean;
  canViewChat?: boolean;
  canViewConfig?: boolean;
  canSendChat?: boolean;
};
let ME_CAPS: MeCapabilities = {};
let ME_CAPS_KEY = "";
let ME_ISS_ROLES: string[] = [];
let ME_LOGIN_ROLE = "";
let ME_CAPS_BOOTSTRAP_TS = 0;
let ME_CAPS_INFLIGHT: Promise<void> | null = null;
let ME_CAPS_RETRY_TIMER: ReturnType<typeof setTimeout> | null = null;
/** Hint del ISS en GET /system/instrucciones (canEdit) cuando /permissions/me aún no hidrató. */
let ME_SERVER_INSTRUCCIONES_EDIT: boolean | null = null;

function sessionCacheKey(): string {
  if (!Session.isLoggedIn()) return "";
  const tok = Session?.current?.()?.token;
  const user = Session.username?.() || Session?.current?.()?.username;
  return String(tok || user || "").trim();
}

function localMeCaps(): MeCapabilities {
  if (!Session.isLoggedIn()) return {};
  const key = sessionCacheKey();
  const real = key === ME_CAPS_KEY ? ME_CAPS : {};
  const viewAs = readViewAsRole();
  // Solo UI: preset ∩ caps reales. El ISS sigue usando JWT/roles reales (ME_CAPS crudo).
  if (viewAs && canViewAsRole()) {
    const preset = capsForViewAsRole(viewAs);
    if (preset) {
      if (Object.keys(real).length) return clampViewAsCapsToReal(preset, real) as MeCapabilities;
      return clampViewAsCapsToReal(preset, {}) as MeCapabilities;
    }
  }
  return real;
}

const ME_CAPS_FETCH_GUARD_MS = 5_000;
const ME_CAPS_REENTRY_GUARD_MS = 1_500;

async function primeMeCaps(force = false): Promise<void> {
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
          canSendChat: !!me.capabilities.canSendChat,
        };
        ME_CAPS_BOOTSTRAP_TS = Date.now();
        ok = true;
        // Si el login no es rama dev, limpia simulación colgada en localStorage.
        if (readViewAsRole() && !realRolesAllowViewAs(ME_ISS_ROLES)) clearViewAsRole();
        window.dispatchEvent(new Event("patyia-apptools:caps-changed"));
      }
    } catch { /* fetch falló: ME_CAPS_BOOTSTRAP_TS queda en 0 → reintento próximo */ }
    if (!ok && !ME_CAPS_RETRY_TIMER && Session.isLoggedIn()) {
      ME_CAPS_RETRY_TIMER = setTimeout(() => {
        ME_CAPS_RETRY_TIMER = null;
        void primeMeCaps(true);
      }, 4_000);
    }
  })().finally(() => { ME_CAPS_INFLIGHT = null; });
  return ME_CAPS_INFLIGHT;
}

function clearMeCaps(): void {
  ME_CAPS = {};
  ME_CAPS_KEY = "";
  ME_ISS_ROLES = [];
  ME_LOGIN_ROLE = "";
  ME_CAPS_BOOTSTRAP_TS = 0;
  ME_SERVER_INSTRUCCIONES_EDIT = null;
  if (ME_CAPS_RETRY_TIMER) { clearTimeout(ME_CAPS_RETRY_TIMER); ME_CAPS_RETRY_TIMER = null; }
}

/** ISS GET /system/instrucciones devuelve canEdit — refuerzo si /permissions/me no cargó aún. */
export function setServerInstruccionesCanEdit(v: boolean): void {
  ME_SERVER_INSTRUCCIONES_EDIT = v;
  window.dispatchEvent(new Event("patyia-apptools:caps-changed"));
}

function notifyAuth() {
  window.dispatchEvent(new Event(Session.EVENT));
  window.dispatchEvent(new Event("patyia-apptools:auth"));
  window.dispatchEvent(new Event("isa-patyia:auth"));
}

export const isLoggedIn = () => Session.isLoggedIn();
export const can = (cap: string) => Session.can(cap);
export const blockReason = (cap: string) => Session.blockReason(cap);

// ─── Capabilities de visibilidad de tools (ISS /api/permissions/me) ───
export function canViewLogs(): boolean { return !!localMeCaps().canViewLogs; }
export function canViewPrompts(): boolean { return !!localMeCaps().canViewPrompts; }
export function canViewChat(): boolean { return !!localMeCaps().canViewChat; }
export function canViewConfig(): boolean { return !!localMeCaps().canViewConfig; }
export function canViewKanban(): boolean { return !!localMeCaps().canViewKanban; }

// ─── Capabilities de edición (ISS /api/permissions/me + hints GET system/*) ───
export function canEditInstrucciones(): boolean {
  const caps = localMeCaps();
  if (isViewingAsRole()) return !!caps.canEditInstrucciones;
  return !!caps.canEditInstrucciones || ME_SERVER_INSTRUCCIONES_EDIT === true;
}
export function canEditOpenAiConfig(): boolean { return !!localMeCaps().canEditOpenAiConfig; }
export function canEditPromptsOperativos(): boolean { return !!localMeCaps().canEditPromptsOperativos; }
export function canEditConversacionConfig(): boolean { return !!localMeCaps().canEditConversacionConfig; }
export function canEditSwagger(): boolean { return !!localMeCaps().canEditSwagger; }
export function canOverrideSampling(): boolean { return !!localMeCaps().canOverrideSampling; }
export function canManagePermissions(): boolean { return !!localMeCaps().canManagePermissions; }
export function canImpersonate(): boolean { return !!localMeCaps().canImpersonate; }
export function canAssignUserRoles(): boolean { return !!localMeCaps().canAssignUserRoles; }
export function canAccessOthers(): boolean { return !!localMeCaps().canAccessOthers; }
export function canEditKanbanCards(): boolean { return !!localMeCaps().canEditKanbanCards; }
export function canSendChat(): boolean { return !!localMeCaps().canSendChat; }

// ─── Legacy: solo chat mantiene checks ISAFront hasta que ISS los exponga. ───
export function canSwitchTarget(): boolean { return Session.can(TARGET_SWITCH_CAP); }
export function canAdminPortalJwt(): boolean { return Session.can("patyia.jwt.admin"); }
export function canViewAsUser(): boolean { return Session.can("session.view_as"); }

export function instruccionesPublishCap(): string | null {
  return canEditInstrucciones() ? INSTRUCCIONES_WRITE_CAP : null;
}

export function patyChatInteractCap(): string | null {
  return canViewChat() && (Session.can("patyia.chat.interact") || Session.can("patyia.jwt.admin")) ? "patyia.chat.interact" : null;
}
export function patyChatAuditCap(): string | null {
  // Solo ME/view-as (canAccessOthers). No Session.can: Dev Lead “ver como Visitante” no debe auditar.
  return canAccessOthers() ? "patyia.chat.audit" : null;
}
export function patyJwtAdminCap(): string | null {
  return Session.can("patyia.jwt.admin") ? "patyia.jwt.admin" : null;
}

export async function login(user: string, pass: string, opts?: Record<string, unknown>) {
  const session = await Session.login(user, pass, opts);
  notifyAuth();
  void primeMeCaps(true);
  return session;
}

export function logout() {
  Session.logout();
  clearMeCaps();
  clearViewAsRole();
  notifyAuth();
}

/** Hidrata el cache de capabilities en arranque. Idempotente; llamada desde App.jsx. */
export async function bootMeCaps(): Promise<void> {
  return primeMeCaps(true);
}

function roleLooksLikeDevBranch(raw: unknown): boolean {
  const s = String(raw ?? "").trim().toLowerCase();
  if (!s) return false;
  if (isDevBranchRole(s)) return true;
  // Chip «Desarrollador» / «Dev ISS» / «Dev Lead»
  return /\bdev(\s+lead|\s+iss)?\b/.test(s) || /^desarrollador/.test(s);
}

/** ¿Este login real puede usar «Ver como rol»? Solo rama `dev` (0.0.x). */
export function canViewAsRole(): boolean {
  if (!Session.isLoggedIn()) return false;
  const key = sessionCacheKey();
  if (key === ME_CAPS_KEY && realRolesAllowViewAs(ME_ISS_ROLES)) return true;
  if (ME_ISS_ROLES.length && realRolesAllowViewAs(ME_ISS_ROLES)) return true;
  if (roleLooksLikeDevBranch(Session.current?.()?.role)) return true;
  try {
    if (roleLooksLikeDevBranch(window.ISA?.AppSession?.resolveDisplayRole?.())) return true;
  } catch { /* ignore */ }
  return false;
}

export function getViewAsRole(): string {
  if (!canViewAsRole() && !readViewAsRole()) return "";
  return readViewAsRole();
}

/** ¿Hay simulación de rol activa (preset UI aplicado)? */
export function isViewingAsRole(): boolean {
  return !!(readViewAsRole() && canViewAsRole());
}

export function setViewAsRole(roleName: string): void {
  if (!roleName) {
    clearViewAsRole();
    return;
  }
  if (!canViewAsRole()) return;
  writeViewAsRole(roleName);
}

export function stopViewAsRole(): void {
  clearViewAsRole();
}

export { VIEW_AS_ROLE_OPTIONS, VIEW_AS_ROLE_EVENT, formatViewAsRoleLabel };

/** Rol visible en header — ISS /api/permissions/me (no system-login). Sin sufijo «→ ver como». */
export function resolveDisplayRole(): string {
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

export const clearSession = logout;

export function getSession() {
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
    capabilities: Session.capabilities(),
  };
}

export function auditAuthor(): string {
  const real = String(Session.realUsername() || Session.username() || "").trim().toUpperCase();
  const viewAs = String(Session.viewAsUsername() || "").trim().toUpperCase();
  if (viewAs && real && viewAs !== real) return `${real} -> ${viewAs}`;
  return real || viewAs || "";
}

export function humanPermissionError(err: unknown, cap: string) {
  return window.ISAFront.humanPermissionError(err, cap, blockReason);
}

export function handleApiError(err: Error & { code?: string }, cap: string) {
  window.ISAFront.handleApiError(err, cap, { blockReason, clearSession, toastWarning, toastError });
}

(window.ISA = window.ISA || ({} as IsaNs)).AppSession = {
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
  resolvePrimaryIssRoleId,
};
