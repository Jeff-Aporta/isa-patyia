// ../Personal/apps/isa-patyia/frontend/js/tools/roleHierarchy.js
var DEFAULT_ROLE_JERARQUIA = {
  dev_lead: "0",
  dev_iss: "0.1",
  admn_isapatyia: "1",
  auditador: "2",
  visitante: "999"
};
var DEFAULT_FOR_UNKNOWN = "999";
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
function canManageRole(actorJerarquia, targetJerarquia) {
  return compareHierarchy(actorJerarquia, targetJerarquia) < 0;
}
function canAssignRole(actorJerarquia, targetRole, targetPermisos) {
  return canManageRole(actorJerarquia, getRoleJerarquia(targetRole, targetPermisos));
}
function actorJerarquiaFromRoles(roles, rolePermisosByName = {}) {
  const keys = (roles ?? []).map((r) => String(r ?? "").trim().toLowerCase()).filter(Boolean);
  if (!keys.length) return "999";
  const jerarquias = keys.map((r) => getRoleJerarquia(r, rolePermisosByName[r]));
  jerarquias.sort(compareHierarchy);
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
export {
  DEFAULT_ROLE_JERARQUIA,
  actorJerarquiaFromRoles,
  ancestorsFromPath,
  canAssignRole,
  canManageRole,
  compareHierarchy,
  formatJerarquiaLabel,
  getRoleJerarquia,
  isBranchZero
};
