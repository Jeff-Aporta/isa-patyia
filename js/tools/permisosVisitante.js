import { roleDescripcion } from "./permisosForm.js";
import { roleNameFromEntry, roleTitleFromEntry } from "./permisosKanbanShared.js";
import { SESSION_OWNER_FIX_FILTER, withSessionOwnerFixFilter } from "./permFixFilter.js";

export const VISITANTE_ROLE = "visitante";

export const VISITANTE_DEFAULT_PERMISOS = {
  namedisplay: "Visitante",
  descripcion: "Visitante — solo sus propias conversaciones; logs abiertos; resto lectura",
  "GET:/api/conversaciones": { scope: "own", fixFilter: { ...SESSION_OWNER_FIX_FILTER } },
  "GET:/api/conversacion/*": { scope: "own", fixFilter: { ...SESSION_OWNER_FIX_FILTER } },
  "GET:/api/conversacion/logs/*": true,
  "POST:/api/conversacion": { scope: "own", fixFilter: { ...SESSION_OWNER_FIX_FILTER } },
  "POST:/api/mensaje": { scope: "own", fixFilter: { ...SESSION_OWNER_FIX_FILTER } },
  "DELETE:/api/conversacion/*": { scope: "own", fixFilter: { ...SESSION_OWNER_FIX_FILTER } },
};

/** Rutas de conversación con alcance fijo «propio» (no editable). */
export const VISITANTE_LOCKED_OWN_KEYS = new Set([
  "GET:/api/conversaciones",
  "GET:/api/conversacion/*",
  "POST:/api/conversacion",
  "POST:/api/mensaje",
  "DELETE:/api/conversacion/*",
]);

export const VISITANTE_REQUIRED_OWN_KEYS = new Set([
  "GET:/api/conversaciones",
  "GET:/api/conversacion/*",
]);

export function isVisitanteRole(roleName) {
  return String(roleName ?? "").trim().toLowerCase() === VISITANTE_ROLE;
}

export function enforceVisitantePermisos(permisos) {
  const out = { ...(permisos ?? {}) };
  delete out["*"];
  delete out.impersonate;
  delete out.manage_permissions;
  for (const key of VISITANTE_REQUIRED_OWN_KEYS) {
    out[key] = withSessionOwnerFixFilter({ scope: "own" });
  }
  for (const key of VISITANTE_LOCKED_OWN_KEYS) {
    const v = out[key];
    if (v == null || v === false) continue;
    if (v === true) out[key] = withSessionOwnerFixFilter({ scope: "own" });
    else if (typeof v === "object" && v?.scope) out[key] = withSessionOwnerFixFilter({ ...v, scope: "own" });
  }
  return out;
}

export function visitanteRouteLocked(key) {
  return VISITANTE_LOCKED_OWN_KEYS.has(key);
}

export function getVisitanteRoleEntry(data) {
  const hit = (data?.roles ?? []).find((r) => roleNameFromEntry(r) === VISITANTE_ROLE);
  if (hit) return hit;
  return {
    iusuario: VISITANTE_ROLE,
    itipo: "role",
    permisos: { ...VISITANTE_DEFAULT_PERMISOS },
    bactivo: true,
  };
}

export function buildVisitanteConfigColumn(data) {
  const entry = getVisitanteRoleEntry(data);
  return {
    id: VISITANTE_ROLE,
    roleName: VISITANTE_ROLE,
    title: roleTitleFromEntry(entry),
    descripcion: roleDescripcion(entry.permisos),
    entry,
    accent: "#64748b",
    icon: "mdi:account-outline",
    users: [],
  };
}
