/** Textos de impacto al mover (no copiar) roles en el kanban de permisos. */

import { isSameInheritanceLine } from "./roleHierarchy.js";

export function isTopDevLeadRole(roleName, jerarquia) {
  const key = String(roleName ?? "").trim().toLowerCase();
  if (key === "dev_lead") return true;
  return String(jerarquia ?? "").trim() === "0.0.0";
}

export function isSamePermisosUser(a, b) {
  const x = String(a ?? "").trim().toUpperCase();
  const y = String(b ?? "").trim().toUpperCase();
  return !!x && x === y;
}

/** Viñetas para modal de confirmación de move (quitar rol origen). */
export function moveRoleImpactBullets({ username, fromRoleTitle, toRoleTitle, isSelf, leavesDevLead }) {
  const user = String(username ?? "").trim().toUpperCase();
  const from = fromRoleTitle || "origen";
  const to = toRoleTitle || "destino";
  const bullets = [
    `${isSelf ? "Dejarás" : `${user} dejará`} de tener el rol **${from}** (solo quedará en **${to}**).`,
    `${isSelf ? "Perderás" : "Perderá"} permisos, rutas y privilegios asociados solo a **${from}**.`,
    `${isSelf ? "Desaparecerás" : "Desaparecerá"} de la columna **${from}** en este tablero.`,
    "Los demás roles que ya tenga el usuario no se modifican.",
  ];
  if (leavesDevLead) {
    bullets.push(
      isSelf
        ? "Al salir de **dev_lead** (máximo privilegio) perderás gestión de permisos hasta que otro dev_lead te reasigne o un administrador ajuste la BD."
        : `Al salir de **dev_lead**, ${user} necesitará que otro dev_lead lo reasigne o un ajuste manual en BD para recuperar el rol.`,
    );
  }
  return bullets;
}

/** Viñetas extra al quitar del rol (botón ×). */
export function removeRoleImpactBullets({ username, roleTitle, isSelf, isDevLead }) {
  const user = String(username ?? "").trim().toUpperCase();
  const role = roleTitle || "rol";
  const bullets = [
    `${isSelf ? "Perderás" : "Perderá"} permisos, rutas y privilegios de **${role}**.`,
    `${isSelf ? "Dejarás" : "Dejará"} de aparecer en la columna **${role}** del tablero.`,
    "Los otros roles asignados no cambian.",
  ];
  if (isDevLead) {
    bullets.push(
      isSelf
        ? "Si te quitas **dev_lead**, otro dev_lead deberá reasignarte o habrá que corregirlo en BD."
        : `Para restaurar **dev_lead** en ${user}, otro dev_lead deberá volver a asignar el rol.`,
    );
  } else {
    bullets.push("Para restaurar el acceso, un dev_lead puede volver a asignar el rol.");
  }
  return bullets;
}

/** Jerarquías de todos los roles donde aparece el usuario en el tablero. */
export function userJerarquiasFromBoard(username, columns) {
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

/** ¿Se permite copiar (mantener origen) hacia el rol destino? */
export function canCopyUserRole({ fromJerarquia, toJerarquia, userJerarquiasOnBoard = [] }) {
  if (isSameInheritanceLine(fromJerarquia, toJerarquia)) {
    return {
      ok: false,
      reason: "No se puede copiar dentro de la misma rama jerárquica. Use mover para cambiar de rol en esa línea.",
    };
  }
  for (const jer of userJerarquiasOnBoard) {
    if (isSameInheritanceLine(jer, toJerarquia)) {
      return {
        ok: false,
        reason: "El usuario ya tiene un rol en la misma rama que el destino. Copiar está prohibido; use mover o quite el rol existente.",
      };
    }
  }
  return { ok: true };
}

/** ¿Se permite agregar usuario al rol destino (botón +)? */
export function canAddUserToRole({ toJerarquia, userJerarquiasOnBoard = [] }) {
  for (const jer of userJerarquiasOnBoard) {
    if (isSameInheritanceLine(jer, toJerarquia)) {
      return {
        ok: false,
        reason: "El usuario ya tiene un rol en la misma rama jerárquica. No puede duplicarse; use mover entre columnas.",
      };
    }
  }
  return { ok: true };
}
