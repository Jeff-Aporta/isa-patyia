import { roleDescripcion, roleNamedisplay, userRoles } from "./permisosForm.js";
import { getRoleJerarquia, compareHierarchy, canManageRole, formatJerarquiaLabel } from "./roleHierarchy.js";

export const VISITANTE = "visitante";

const ROLE_ACCENTS = ["#1e90ff", "#10b981", "#a855f7", "#f59e0b", "#ec4899", "#06b6d4", "#8b5cf6"];
const ROLE_ICONS = ["mdi:shield-account", "mdi:file-document-edit-outline", "mdi:code-braces", "mdi:robot-outline", "mdi:eye-outline", "mdi:account-group-outline"];

export function roleNameFromEntry(entry) {
  return String(entry?.iusuario ?? "").trim().toLowerCase().replace(/^role:/i, "");
}

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

export function roleTitleFromEntry(entry) {
  const roleName = roleNameFromEntry(entry);
  const namedisplay = roleNamedisplay(entry?.permisos);
  const formatted = formatRoleTitle(roleName);
  if (!namedisplay) return formatted;
  if (formatted.length > namedisplay.length) return formatted;
  return namedisplay;
}

export function themeForRole(roleName, index = 0, permisos = null) {
  const accent = permisos?.accent ?? permisos?.color;
  const icon = permisos?.icon;
  if (accent && icon) return { accent: String(accent), icon: String(icon) };
  const i = index % ROLE_ACCENTS.length;
  return { accent: ROLE_ACCENTS[i], icon: ROLE_ICONS[i % ROLE_ICONS.length] };
}

export function userCardLabels(username, displayName) {
  const user = String(username ?? "").trim().toUpperCase();
  const name = String(displayName ?? "").trim();
  if (name) return { primary: name, secondary: user };
  return { primary: user, secondary: null };
}

export function matchesUserFilter(username, displayName, query) {
  const q = String(query ?? "").trim().toUpperCase();
  if (!q) return true;
  const u = String(username ?? "").trim().toUpperCase();
  const n = String(displayName ?? "").trim().toUpperCase();
  return u.includes(q) || (n && n.includes(q));
}

export function displayNameFromUserEntry(entry) {
  const fromMeta = entry?.permisos?.nombre ?? entry?.permisos?.namedisplay;
  return fromMeta != null && String(fromMeta).trim() ? String(fromMeta).trim() : null;
}

export function normalizePermisosUsername(raw) {
  const s = String(raw ?? "").trim().toUpperCase();
  return s || null;
}

export function buildUserDirectoryFromPermisos(users) {
  const map = {};
  for (const e of users ?? []) {
    const key = normalizePermisosUsername(e?.iusuario);
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

/** Stacks izquierda→derecha: más integrantes primero; empate por orden del servidor. */
export function sortPermisosColumnsByMembers(columns) {
  return [...columns].sort((a, b) => {
    const byCount = b.users.length - a.users.length;
    if (byCount !== 0) return byCount;
    return a.sortIndex - b.sortIndex;
  });
}

/** Columnas = roles activos del servidor; tarjetas = usuarios por permisos.roles */
export function buildPermisosBoard(data, filters = {}) {
  const roles = data?.roles ?? [];
  const users = data?.users ?? [];
  const userQuery = filters.userSearch ?? "";
  const roleFiltersRaw = filters.roleFilters ?? filters.roleFilter ?? [];
  const roleFilters = (Array.isArray(roleFiltersRaw) ? roleFiltersRaw : [roleFiltersRaw])
    .map((r) => String(r ?? "").trim().toLowerCase())
    .filter(Boolean);
  const roleFilterSet = roleFilters.length ? new Set(roleFilters) : null;
  const userDirectory = filters.userDirectory ?? null;
  const filterActive = Boolean(String(userQuery ?? "").trim()) || Boolean(roleFilterSet?.size);

  const activeRoles = roles.filter((entry) => entry?.itipo !== "user" && entry?.bactivo !== false && roleNameFromEntry(entry));
  const columns = activeRoles.map((entry, index) => {
    const roleName = roleNameFromEntry(entry);
    const theme = themeForRole(roleName, index, entry.permisos);
    const jerarquia = getRoleJerarquia(roleName, entry.permisos);
    return {
      id: roleName,
      roleName,
      title: roleTitleFromEntry(entry),
      jerarquia,
      jerarquiaLabel: formatJerarquiaLabel(jerarquia),
      descripcion: roleDescripcion(entry.permisos),
      entry,
      accent: theme.accent,
      icon: theme.icon,
      sortIndex: index,
      users: [],
      roleFilteredOut: !!(roleFilterSet && !roleFilterSet.has(roleName)),
    };
  }).filter((c) => {
    if (!c.id || c.id === VISITANTE) return false;
    return true;
  });

  const colById = new Map(columns.map((c) => [c.id, c]));
  for (const userEntry of users) {
    const username = String(userEntry.iusuario ?? "").trim().toUpperCase();
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
  const visible = hideEmpty
    ? sorted.filter((c) => c.users.length > 0 || (roleFilterSet?.has(c.id)))
    : sorted;
  const noUsersVisible = filterActive && !columns.some((c) => c.users.length > 0);

  return { columns: visible, filterActive, noUsersVisible, hideEmptyColumns: hideEmpty };
}

export function columnAtPoint(columnIds, listRefs, clientX, clientY) {
  for (const colId of columnIds) {
    const el = listRefs.current[colId];
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) return colId;
  }
  return null;
}

/** Devuelve un mapa roleName → perms del rol para uso del cliente. */
export function buildRolePermisosIndex(roles) {
  const out = {};
  for (const r of roles ?? []) {
    const key = roleNameFromEntry(r);
    if (key) out[key] = r.permisos ?? {};
  }
  return out;
}

/** Resuelve la jerarquía efectiva del actor desde sus roles. */
export function actorJerarquiaFromRoles(roles, rolePermisosByName = {}) {
  const keys = (roles ?? []).map((r) => String(r ?? "").trim().toLowerCase()).filter(Boolean);
  if (!keys.length) return "999";
  const jerarquias = keys.map((r) => getRoleJerarquia(r, rolePermisosByName[r]));
  jerarquias.sort(compareHierarchy);
  return jerarquias[0];
}

/** ¿El actor (con su jerarquía efectiva) puede mover usuarios al rol `targetRole`? */
export function canActorManageColumn(actorJerarquia, targetColumn) {
  if (!targetColumn) return false;
  return canManageRole(actorJerarquia, targetColumn.jerarquia ?? "999");
}

export function pointInRef(ref, clientX, clientY) {
  const el = ref?.current;
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
}
