/**
 * Jerarquía de roles — espejo del módulo backend role-hierarchy.ts.
 * Dot-notation: 0 = más alta, 999 = más baja.
 */

export const DEFAULT_ROLE_JERARQUIA = {
  dev_lead: "0",
  dev_iss: "0.1",
  admn_isapatyia: "1",
  auditador: "2",
  visitante: "999",
};

const DEFAULT_FOR_UNKNOWN = "999";

/** Compara dos jerarquías dot-notation. Negativo si a < b (a más privilegiado). */
export function compareHierarchy(a, b) {
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

export function getRoleJerarquia(roleName, permisos) {
  if (permisos && typeof permisos === "object") {
    const j = permisos.jerarquia;
    if (typeof j === "string" && j.trim()) return j.trim();
  }
  const key = String(roleName ?? "").trim().toLowerCase();
  return DEFAULT_ROLE_JERARQUIA[key] ?? DEFAULT_FOR_UNKNOWN;
}

/** Ancestros derivados del path jerárquico. "0.1.1.1" → ["0.1.1.1","0.1.1","0.1","0"]. */
export function ancestorsFromPath(jerarquia) {
  const parts = String(jerarquia ?? "").split(".").filter(Boolean);
  const out = [];
  for (let i = parts.length - 1; i >= 0; i--) {
    out.push(parts.slice(0, i + 1).join("."));
  }
  return out;
}

/** Actor más privilegiado (jerarquía menor) puede gestionar roles menos privilegiados. */
export function canManageRole(actorJerarquia, targetJerarquia) {
  return compareHierarchy(actorJerarquia, targetJerarquia) < 0;
}

export function canAssignRole(actorJerarquia, targetRole, targetPermisos) {
  return canManageRole(actorJerarquia, getRoleJerarquia(targetRole, targetPermisos));
}

/** Resuelve la jerarquía MENOR (más privilegiada) de un conjunto de roles del actor. */
export function actorJerarquiaFromRoles(roles, rolePermisosByName = {}) {
  const keys = (roles ?? []).map((r) => String(r ?? "").trim().toLowerCase()).filter(Boolean);
  if (!keys.length) return "999";
  const jerarquias = keys.map((r) => getRoleJerarquia(r, rolePermisosByName[r]));
  jerarquias.sort(compareHierarchy);
  return jerarquias[0];
}

/** Etiqueta formateada para UI: "Dev Lead (0)". */
export function formatJerarquiaLabel(jerarquia) {
  if (jerarquia == null || jerarquia === "") return "";
  return `(${jerarquia})`;
}

/** ¿El rol pertenece a branch 0 (jerarquía raíz o descendiente de "0")? */
export function isBranchZero(jerarquia) {
  const j = String(jerarquia ?? "").trim();
  return j === "0" || j.startsWith("0.");
}