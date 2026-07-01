/**
 * Jerarquía de roles — espejo del módulo backend role-hierarchy.ts.
 * Dot-notation: 0 = más alta, 999 = más baja.
 */

export const DEFAULT_ROLE_JERARQUIA = {
  visitante: "0",
  dev: "0.0",
  dev_lead: "0.0.0",
  dev_iss: "0.0.1",
  admn: "0.1",
  auditador: "0.1.0",
  admn_isapatyia: "0.1.0.0",
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

/** Misma rama si una jerarquía es prefijo dot-notation de la otra (incl. iguales). */
export function isSameInheritanceLine(a, b) {
  const x = String(a ?? "").trim();
  const y = String(b ?? "").trim();
  if (!x || !y) return false;
  if (x === y) return true;
  return x.startsWith(`${y}.`) || y.startsWith(`${x}.`);
}

/** Actor gestiona roles en su rama (ancestros, descendientes o igual). */
export function canManageRole(actorJerarquia, targetJerarquia) {
  const target = String(targetJerarquia ?? "").trim();
  if (!target || target === DEFAULT_FOR_UNKNOWN) return false;
  return isSameInheritanceLine(actorJerarquia, target);
}

export function actorCanManageTarget(actorJerarquias, targetJerarquia) {
  for (const j of actorJerarquias ?? []) {
    if (canManageRole(j, targetJerarquia)) return true;
  }
  return false;
}

export function actorJerarquiasFromRoles(roles, rolePermisosByName = {}) {
  return (roles ?? [])
    .map((r) => String(r ?? "").trim().toLowerCase())
    .filter((r) => r && r !== "visitante")
    .map((r) => getRoleJerarquia(r, rolePermisosByName[r]));
}

export function canAssignRole(actorJerarquia, targetRole, targetPermisos) {
  return canManageRole(actorJerarquia, getRoleJerarquia(targetRole, targetPermisos));
}

/** Resuelve la jerarquía de mayor grado (path más profundo) del actor — display. */
export function actorJerarquiaFromRoles(roles, rolePermisosByName = {}) {
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