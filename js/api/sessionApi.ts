/** Sesión ISA PatyIA — permisos via /api/permissions/me.
 *
 * Single source of truth: el endpoint del ISS. No se consulta ISAFront.Session.can() para
 * visibilidad/habilitación de tools. Solo el chat mantiene checks legacy (infra.target.switch,
 * patyia.chat.*) hasta que ISS los exponga como caps.
 */
import { Session } from "../core/platform.ts";
import { toastError, toastWarning } from "../core/platform.ts";
import { fetchPermissionsMe } from "./systemConfigApi.ts";

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
let ME_CAPS_BOOTSTRAP_TS = 0;
let ME_CAPS_INFLIGHT: Promise<void> | null = null;
let ME_CAPS_RETRY_TIMER: ReturnType<typeof setTimeout> | null = null;

function localMeCaps(): MeCapabilities {
  if (!Session.isLoggedIn()) return {};
  const key = (Session?.current?.()?.token) ?? "";
  if (key !== ME_CAPS_KEY) return {};
  return ME_CAPS;
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
        ME_CAPS_KEY = (Session?.current?.()?.token) ?? "";
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
  ME_CAPS_BOOTSTRAP_TS = 0;
  if (ME_CAPS_RETRY_TIMER) { clearTimeout(ME_CAPS_RETRY_TIMER); ME_CAPS_RETRY_TIMER = null; }
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

// ─── Capabilities de edición (ISS /api/permissions/me) ───
export function canEditInstrucciones(): boolean { return !!localMeCaps().canEditInstrucciones; }
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
  return Session.can("patyia.chat.audit") ? "patyia.chat.audit" : null;
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
  notifyAuth();
}

/** Hidrata el cache de capabilities en arranque. Idempotente; llamada desde App.jsx. */
export async function bootMeCaps(): Promise<void> {
  return primeMeCaps(true);
}

export const clearSession = logout;

export function getSession() {
  const s = Session.current();
  if (!s) return null;
  return {
    username: Session.username(),
    realUsername: Session.realUsername(),
    viewAsUsername: Session.viewAsUsername(),
    role: s.role,
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
};
