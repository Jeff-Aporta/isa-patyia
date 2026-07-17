/**
 * Ver como rol — simulación SOLO front para roles de la rama `dev` (jerarquía 0.0.x).
 * No altera JWT, no envía headers al ISS, no cambia loadEffectivePermisos del servidor.
 * Solo capabilities locales de UI (localMeCaps). Nunca eleva: preset ∩ caps reales del login.
 */
import { canonicalRoleMeta } from "../tools/roleCanonicalMeta.js";
import { getRoleJerarquia } from "../tools/roleHierarchy.js";

export const VIEW_AS_ROLE_LS_KEY = "isa-patyia:view-as-role";
export const VIEW_AS_ROLE_EVENT = "patyia-apptools:view-as-role";

/** Roles que se pueden simular desde el menú. */
export const VIEW_AS_ROLE_OPTIONS = [
  { id: "visitante", label: "Visitante" },
  { id: "dev", label: "Desarrollador" },
  { id: "dev_iss", label: "Dev ISS" },
  { id: "auditador", label: "Auditor" },
  { id: "admn", label: "Admn básico" },
  { id: "admn_isapatyia", label: "Admn ISA-Paty" },
];

const NONE = Object.freeze({
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
  canSendChat: true,
});

/** Presets aproximados al outcome típico de GET /api/permissions/me por rol. */
export const ROLE_CAPS_PRESETS = Object.freeze({
  visitante: { ...NONE },
  dev: {
    ...NONE,
    canViewPrompts: true,
    canViewConfig: true,
    canViewKanban: true,
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
    canAccessOthers: true,
  },
  auditador: {
    ...NONE,
    canViewPrompts: true,
    canViewConfig: true,
    canAccessOthers: true,
    canViewKanban: true,
  },
  admn: {
    ...NONE,
    canViewPrompts: true,
    canViewConfig: true,
    canViewKanban: true,
    canEditKanbanCards: true,
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
    canEditKanbanCards: true,
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
    canSendChat: true,
  },
});

function roleKey(name) {
  return String(name ?? "").trim().toLowerCase();
}

/** Rama desarrolladores: `dev` / `dev_*` o jerarquía 0.0 / 0.0.x (no visitante=0, no admn=0.1). */
export function isDevBranchRole(roleName) {
  const key = roleKey(roleName);
  if (!key) return false;
  if (key === "dev" || key.startsWith("dev_")) return true;
  const j = getRoleJerarquia(key);
  return j === "0.0" || j.startsWith("0.0.");
}

export function formatViewAsRoleLabel(roleName) {
  const key = roleKey(roleName);
  if (!key) return "";
  const opt = VIEW_AS_ROLE_OPTIONS.find((o) => o.id === key);
  if (opt) return opt.label;
  const canon = canonicalRoleMeta(key);
  if (canon?.namedisplay) return canon.namedisplay;
  return key.split("_").map((p) => (p === "iss" ? "ISS" : p.charAt(0).toUpperCase() + p.slice(1))).join(" ");
}

export function readViewAsRole() {
  try {
    const v = roleKey(localStorage.getItem(VIEW_AS_ROLE_LS_KEY));
    if (!v || v === "dev_lead") return "";
    if (!ROLE_CAPS_PRESETS[v]) return "";
    return v;
  } catch {
    return "";
  }
}

export function writeViewAsRole(roleName) {
  const key = roleKey(roleName);
  try {
    if (!key || key === "dev_lead" || !ROLE_CAPS_PRESETS[key]) {
      localStorage.removeItem(VIEW_AS_ROLE_LS_KEY);
    } else {
      localStorage.setItem(VIEW_AS_ROLE_LS_KEY, key);
    }
  } catch { /* ignore */ }
  try {
    window.dispatchEvent(new CustomEvent(VIEW_AS_ROLE_EVENT, { detail: { role: readViewAsRole() } }));
    window.dispatchEvent(new Event("patyia-apptools:caps-changed"));
  } catch { /* ignore */ }
}

export function clearViewAsRole() {
  writeViewAsRole("");
}

export function capsForViewAsRole(roleName) {
  const key = roleKey(roleName);
  return ROLE_CAPS_PRESETS[key] ? { ...ROLE_CAPS_PRESETS[key] } : null;
}

/**
 * Solo roles de la rama `dev` (0.0.x) pueden abrir el simulador.
 * Auditador / admn / visitante: no.
 */
export function realRolesAllowViewAs(roles) {
  return (roles ?? []).some((r) => isDevBranchRole(r));
}

/**
 * Nunca elevar: cada cap del preset solo queda true si el login real también la tiene.
 * Si el rol base no tiene una función, «ver como» no la enciende.
 */
export function clampViewAsCapsToReal(preset, realCaps) {
  const out = {};
  const real = realCaps && typeof realCaps === "object" ? realCaps : {};
  for (const [k, v] of Object.entries(preset ?? {})) {
    if (typeof v !== "boolean") continue;
    out[k] = v === true && real[k] === true;
  }
  return out;
}
