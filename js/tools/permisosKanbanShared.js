import { roleDescripcion, roleNamedisplay, userRoles } from "./permisosForm.js";

export const VISITANTE = "visitante";

const ROLE_ACCENTS = ["#1e90ff", "#10b981", "#a855f7", "#f59e0b", "#ec4899", "#06b6d4", "#8b5cf6"];
const ROLE_ICONS = ["mdi:shield-account", "mdi:file-document-edit-outline", "mdi:code-braces", "mdi:robot-outline", "mdi:eye-outline", "mdi:account-group-outline"];

const ROLE_NAMEDISPLAY_FALLBACK = {
  dev_lead: "Líder de desarrollo",
  documentador: "Documentador",
  admn_prompts: "Admin prompts",
  auditador: "Auditor",
  visitante: "Visitante",
};

export function roleNameFromEntry(entry) {
  return String(entry?.iusuario ?? "").trim().toLowerCase().replace(/^role:/i, "");
}

export function roleTitleFromEntry(entry) {
  const roleName = roleNameFromEntry(entry);
  const namedisplay = roleNamedisplay(entry?.permisos);
  if (namedisplay) return namedisplay;
  const fb = ROLE_NAMEDISPLAY_FALLBACK[roleName];
  if (fb) return fb;
  return String(roleName ?? "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function themeForRole(roleName, index = 0) {
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

function entryIsActive(entry) {
  return entry?.bactivo !== false;
}

function resolveDisplayName(username, userEntry, userDirectory) {
  const key = String(username ?? "").trim().toUpperCase();
  const fromDir = userDirectory?.[key];
  if (fromDir != null && String(fromDir).trim()) return String(fromDir).trim();
  const fromMeta = userEntry?.permisos?.nombre ?? userEntry?.permisos?.namedisplay;
  if (fromMeta != null && String(fromMeta).trim()) return String(fromMeta).trim();
  return null;
}

/** Columnas = roles; tarjetas = usuarios con ese rol en PERMISOS.roles */
export function buildPermisosBoard(data, filters = {}) {
  const roles = data?.roles ?? [];
  const users = data?.users ?? [];
  const userQuery = filters.userSearch ?? "";
  const roleFilter = String(filters.roleFilter ?? "").trim().toLowerCase();
  const userDirectory = filters.userDirectory ?? null;

  let columns = roles.map((entry, index) => {
    const roleName = roleNameFromEntry(entry);
    const theme = themeForRole(roleName, index);
    return {
      id: roleName,
      roleName,
      title: roleTitleFromEntry(entry),
      descripcion: roleDescripcion(entry.permisos),
      entry,
      accent: theme.accent,
      icon: theme.icon,
      users: [],
    };
  }).filter((c) => c.id !== VISITANTE && entryIsActive(c.entry));

  if (roleFilter) columns = columns.filter((c) => c.id === roleFilter);

  const colById = new Map(columns.map((c) => [c.id, c]));
  for (const userEntry of users) {
    const username = String(userEntry.iusuario ?? "").trim().toUpperCase();
    const displayName = resolveDisplayName(username, userEntry, userDirectory);
    if (!matchesUserFilter(username, displayName, userQuery)) continue;
    for (const role of userRoles(userEntry.permisos)) {
      const col = colById.get(role);
      if (!col) continue;
      if (col.users.some((u) => u.username === username)) continue;
      const labels = userCardLabels(username, displayName);
      col.users.push({ id: `${username}@${role}`, username, displayName, labels, userEntry });
    }
  }

  for (const col of columns) {
    col.users.sort((a, b) => a.labels.primary.localeCompare(b.labels.primary, "es"));
  }

  return { columns };
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
