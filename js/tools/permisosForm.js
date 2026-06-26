/** Metadatos dentro de PERMISOS — no son restricciones METHOD:/path. */
export const PERM_META = new Set(["descripcion", "namedisplay", "roles"]);

export const FLAG_DEFS = [
  { key: "*", label: "Acceso total", hint: "Wildcard — anula el resto de restricciones de ruta." },
  { key: "impersonate", label: "Suplantar chat", hint: "Actuar como otro usuario en conversaciones." },
  { key: "manage_permissions", label: "Gestionar permisos", hint: "CRUD de dbo.SYS_USR_PERMISSIONS (dev_lead)." },
];

export const ACCESS_MODES = [
  { value: "off", label: "Sin acceso" },
  { value: "allow", label: "Permitido" },
  { value: "own", label: "Alcance: propio" },
  { value: "all", label: "Alcance: todos" },
];

const FLAG_KEYS = new Set(FLAG_DEFS.map((f) => f.key));

export function prettyJson(obj) {
  try { return JSON.stringify(obj ?? {}, null, 2); } catch { return "{}"; }
}

export function roleDescripcion(permisos) {
  const d = permisos?.descripcion;
  return d != null && String(d).trim() ? String(d).trim() : "";
}

export function roleNamedisplay(permisos) {
  const d = permisos?.namedisplay;
  return d != null && String(d).trim() ? String(d).trim() : "";
}

export function userRoles(permisos) {
  const r = permisos?.roles;
  return Array.isArray(r) ? r.map((x) => String(x).trim().toLowerCase()).filter(Boolean) : [];
}

export function userOverrides(permisos) {
  const out = {};
  for (const [k, v] of Object.entries(permisos ?? {})) {
    if (!PERM_META.has(k)) out[k] = v;
  }
  return out;
}

export function restrictionToMode(value) {
  if (value === true) return "allow";
  if (value && typeof value === "object" && value.scope === "all") return "all";
  if (value && typeof value === "object" && value.scope === "own") return "own";
  return "off";
}

import { fixFilterFromRestriction } from "./permFixFilter.js";

export function modeToRestriction(mode, fixFilter) {
  if (mode === "allow") return true;
  if (mode === "own") {
    const ff = fixFilterFromRestriction({ fixFilter });
    return ff ? { scope: "own", fixFilter: ff } : { scope: "own" };
  }
  if (mode === "all") return { scope: "all" };
  return null;
}

/** { flags, routes: [{ key, mode }] } desde mapa de rol. */
export function splitRolePermisos(permisos) {
  const flags = Object.fromEntries(FLAG_DEFS.map((f) => [f.key, false]));
  const routes = [];
  for (const [key, value] of Object.entries(permisos ?? {})) {
    if (PERM_META.has(key)) continue;
    if (FLAG_KEYS.has(key)) {
      flags[key] = value === true;
      continue;
    }
    const mode = restrictionToMode(value);
    if (mode !== "off") {
      const fixFilter = fixFilterFromRestriction(value);
      routes.push(fixFilter ? { key, mode, fixFilter } : { key, mode });
    }
  }
  routes.sort((a, b) => a.key.localeCompare(b.key));
  return { flags, routes };
}

export function buildRolePermisos(desc, namedisplay, flags, routes) {
  const out = {};
  if (String(desc ?? "").trim()) out.descripcion = String(desc).trim();
  if (String(namedisplay ?? "").trim()) out.namedisplay = String(namedisplay).trim();
  for (const def of FLAG_DEFS) {
    if (flags[def.key]) out[def.key] = true;
  }
  for (const row of routes) {
    if (!row.key || row.mode === "off") continue;
    const restr = modeToRestriction(row.mode, row.fixFilter);
    if (restr != null) out[row.key] = restr;
  }
  return out;
}

export function buildUserPermisos(selectedRoles, overrides = {}) {
  const roles = [...new Set(selectedRoles.map((r) => String(r).trim().toLowerCase()).filter(Boolean))];
  return { roles, ...overrides };
}

export function countActiveRoutes(routes) {
  return (routes || []).filter((r) => r.mode && r.mode !== "off").length;
}

export function activeFlags(permisos) {
  const { flags } = splitRolePermisos(permisos);
  return FLAG_DEFS.filter((f) => flags[f.key]);
}

export function summarizePermisos(permisos) {
  const { flags, routes } = splitRolePermisos(permisos);
  const flagCount = FLAG_DEFS.filter((f) => flags[f.key]).length;
  const routeCount = countActiveRoutes(routes);
  return { flagCount, routeCount };
}
