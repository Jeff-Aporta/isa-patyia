import { roleDescripcion, roleNamedisplay, userRoles } from "./permisosForm.js";

export const VISITANTE = "visitante";

const ROLE_ACCENTS = ["#1e90ff", "#10b981", "#a855f7", "#f59e0b", "#ec4899", "#06b6d4", "#8b5cf6"];
const ROLE_ICONS = ["mdi:shield-account", "mdi:file-document-edit-outline", "mdi:code-braces", "mdi:robot-outline", "mdi:eye-outline", "mdi:account-group-outline"];

export function roleNameFromEntry(entry) {
  return String(entry?.iusuario ?? "").trim().toLowerCase().replace(/^role:/i, "");
}

function formatRoleTitle(roleName) {
  return String(roleName ?? "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function roleTitleFromEntry(entry) {
  const namedisplay = roleNamedisplay(entry?.permisos);
  if (namedisplay) return namedisplay;
  return formatRoleTitle(roleNameFromEntry(entry));
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

function resolveDisplayName(username, userEntry, userDirectory) {
  const key = String(username ?? "").trim().toUpperCase();
  const fromDir = userDirectory?.[key];
  if (fromDir != null && String(fromDir).trim()) return String(fromDir).trim();
  const fromMeta = userEntry?.permisos?.nombre ?? userEntry?.permisos?.namedisplay;
  if (fromMeta != null && String(fromMeta).trim()) return String(fromMeta).trim();
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

  const columns = roles.map((entry, index) => {
    const roleName = roleNameFromEntry(entry);
    const theme = themeForRole(roleName, index, entry.permisos);
    return {
      id: roleName,
      roleName,
      title: roleTitleFromEntry(entry),
      descripcion: roleDescripcion(entry.permisos),
      entry,
      accent: theme.accent,
      icon: theme.icon,
      sortIndex: index,
      users: [],
      roleFilteredOut: !!(roleFilterSet && !roleFilterSet.has(roleName)),
    };
  }).filter((c) => c.id && c.id !== VISITANTE);

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
  const noUsersVisible = filterActive && sorted.every((c) => !c.users.length);

  return { columns: sorted, filterActive, noUsersVisible };
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

export function pointInRef(ref, clientX, clientY) {
  const el = ref?.current;
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
}
