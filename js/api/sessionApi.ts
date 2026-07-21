/** Sesión ISA PatyIA — permisos via /api/permissions/me.
 *
 * Single source of truth: el endpoint del ISS. No se consulta ISAFront.Session.can() para
 * visibilidad/habilitación de tools. Solo el chat mantiene checks legacy (infra.target.switch,
 * patyia.chat.*) hasta que ISS los exponga como caps.
 *
 * «Ver como rol» es SOLO front (simulación UI): nunca cambia la autorización del ISS.
 * Suplantación de usuario erradicada (21-jul-2026) de todos los workers y fronts.
 */
import { Session } from "../core/platform.ts";
import { toastError, toastWarning } from "../core/platform.ts";
import { fetchPermissionsMe } from "./systemConfigApi.ts";
import { capsFromPermisosEfectivos } from "../tools/permAccessFromMap.js";
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

/* Suplantación (view-as de usuario) erradicada (21-jul-2026): el authHeader del Session
 * ya no envía X-View-As-User en ningún caso. */

function formatRoleTitle(roleName) {
  const key = String(roleName ?? "").trim().toUpperCase();
  if (!key) return "";
  if (key === "USR") return "Usuario";
  if (key === "ADMN") return "Admn";
  if (key === "DEVISS") return "Dev ISS";
  if (key === "AUDITOR") return "Auditor";
  return key;
}

function roleLabel(roleName) {
  const key = String(roleName ?? "").trim().toUpperCase();
  if (!key) return "";
  const canon = canonicalRoleMeta(key);
  if (canon?.namedisplay) return canon.namedisplay;
  return formatRoleTitle(key);
}

const ROLE_PRIORITY = ["DEVISS", "ADMN", "AUDITOR", "USR"];

function pickPrimaryIssRole(roles) {
  const list = (roles ?? []).map((r) => String(r ?? "").trim().toUpperCase()).filter(Boolean);
  if (!list.length) return "";
  const elevated = list.filter((r) => r !== "USR");
  const pool = elevated.length ? elevated : list;
  pool.sort((a, b) => {
    const ia = ROLE_PRIORITY.indexOf(a);
    const ib = ROLE_PRIORITY.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  return pool[0];
}

/** Id canónico del rol ISS primario (para UI «Ver como»). */
export function resolvePrimaryIssRoleId(): string {
  if (!Session.isLoggedIn()) return "";
  const key = sessionCacheKey();
  if (key === ME_CAPS_KEY && ME_ISS_ROLES.length) return pickPrimaryIssRole(ME_ISS_ROLES);
  if (key === ME_CAPS_KEY && ME_LOGIN_ROLE) return String(ME_LOGIN_ROLE).trim().toUpperCase();
  const sl = Session.current()?.role;
  return sl ? String(sl).trim().toUpperCase() : "";
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
      if (me?.permisosEfectivos) {
        ME_CAPS_KEY = sessionCacheKey();
        ME_ISS_ROLES = Array.isArray(me.roles) ? me.roles.map((r) => String(r ?? "").trim()).filter(Boolean) : [];
        ME_LOGIN_ROLE = String(me.loginRole ?? "").trim();
        const caps = capsFromPermisosEfectivos(me.permisosEfectivos);
        ME_CAPS = {
          canEditInstrucciones: !!caps.canEditInstrucciones,
          canEditOpenAiConfig: !!caps.canEditOpenAiConfig,
          canEditPromptsOperativos: !!caps.canEditPromptsOperativos,
          canEditConversacionConfig: !!caps.canEditConversacionConfig,
          canEditSwagger: !!caps.canEditSwagger,
          canOverrideSampling: !!caps.canOverrideSampling,
          canManagePermissions: !!caps.canManagePermissions,
          canAssignUserRoles: !!caps.canAssignUserRoles,
          canAccessOthers: !!caps.canAccessOthers,
          canViewKanban: !!caps.canViewKanban,
          canEditKanbanCards: !!caps.canEditKanbanCards,
          canViewLogs: !!caps.canViewLogs,
          canViewPrompts: !!caps.canViewPrompts,
          canViewChat: !!caps.canViewChat,
          canViewConfig: !!caps.canViewConfig,
          canSendChat: !!caps.canSendChat,
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
export function canAssignUserRoles(): boolean { return !!localMeCaps().canAssignUserRoles; }
export function canAccessOthers(): boolean { return !!localMeCaps().canAccessOthers; }
export function canEditKanbanCards(): boolean { return !!localMeCaps().canEditKanbanCards; }
export function canSendChat(): boolean { return !!localMeCaps().canSendChat; }

// ─── Legacy: solo chat mantiene checks ISAFront hasta que ISS los exponga. ───
export function canSwitchTarget(): boolean { return Session.can(TARGET_SWITCH_CAP); }
export function canAdminPortalJwt(): boolean { return Session.can("patyia.jwt.admin"); }

export function instruccionesPublishCap(): string | null {
  return canEditInstrucciones() ? INSTRUCCIONES_WRITE_CAP : null;
}

export function patyChatInteractCap(): string | null {
  return canViewChat() && (Session.can("patyia.chat.interact") || Session.can("patyia.jwt.admin")) ? "patyia.chat.interact" : null;
}
export function patyChatAuditCap(): string | null {
  // Solo ME/view-as (canAccessOthers). No Session.can: Dev Lead “ver como USR” no debe auditar.
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
  const s = String(raw ?? "").trim().toUpperCase();
  if (!s) return false;
  if (isDevBranchRole(s)) return true;
  return s === "DEVISS" || /\bDEV\s*ISS\b/.test(s) || /\bDEV\s*LEAD\b/.test(s);
}

/** ¿Este login real puede usar «Ver como rol»? Solo DEVISS. */
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
    role: resolveDisplayRole(),
    expiresAt: s.expiresAt,
    sessionToken: s.token,
    app: Session.appId(),
    capabilities: Session.capabilities(),
  };
}

export function auditAuthor(): string {
  return String(Session.realUsername() || Session.username() || "").trim().toUpperCase();
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
