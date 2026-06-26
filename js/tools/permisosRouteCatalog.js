/** Catálogo de rutas JWT protegidas — orden y etiquetas para el editor de roles. */
import { fixFilterFromRestriction } from "./permFixFilter.js";
export const ROUTE_GROUPS = [
  {
    id: "conversaciones",
    title: "Conversaciones",
    routes: [
      { key: "GET:/api/conversaciones", label: "Listar conversaciones", scoped: true },
      { key: "GET:/api/conversacion/*", label: "Ver conversación", scoped: true },
      { key: "GET:/api/conversacion/logs/*", label: "Logs de conversación" },
      { key: "POST:/api/conversacion", label: "Crear conversación", scoped: true },
      { key: "POST:/api/mensaje", label: "Enviar mensaje", scoped: true },
      { key: "DELETE:/api/conversacion/*", label: "Eliminar conversación", scoped: true },
    ],
  },
  {
    id: "sistema",
    title: "Sistema",
    routes: [
      { key: "GET:/api/system/openai", label: "Leer config OpenAI" },
      { key: "PUT:/api/system/openai", label: "Guardar config OpenAI" },
      { key: "GET:/api/system/prompts-operativos", label: "Leer prompts operativos" },
      { key: "PUT:/api/system/prompts-operativos", label: "Guardar prompts operativos" },
      { key: "GET:/api/system/permisos", label: "Leer permisos" },
      { key: "PUT:/api/system/permisos", label: "Actualizar permisos" },
      { key: "PUT:/api/system/permisos/roles/*", label: "Editar rol" },
      { key: "PUT:/api/system/permisos/usuarios/*", label: "Editar usuario" },
      { key: "PATCH:/api/system/permisos/usuarios/*/roles", label: "Asignar roles a usuario" },
      { key: "POST:/api/system/*", label: "POST sistema (wildcard)" },
      { key: "PUT:/api/system/*", label: "PUT sistema (wildcard)" },
    ],
  },
  {
    id: "patyia",
    title: "PatyIA / instrucciones",
    routes: [
      { key: "POST:/api/patyia/instrucciones/publish", label: "Publicar instrucciones" },
      { key: "POST:/api/patyia/instrucciones/upsert", label: "Upsert instrucciones" },
      { key: "POST:/api/patyia/prompts/upsert-sql", label: "Upsert SQL prompts" },
      { key: "POST:/api/instrucciones/*", label: "POST instrucciones (wildcard)" },
    ],
  },
  {
    id: "documentacion",
    title: "Documentación",
    routes: [
      { key: "PUT:/api/swagger.json", label: "Swagger declarativo" },
    ],
  },
];

const CATALOG_KEYS = new Set(ROUTE_GROUPS.flatMap((g) => g.routes.map((r) => r.key)));

export function isWildcardRole(permisos) {
  return permisos?.["*"] === true;
}

/** Filas { key, mode, label?, scoped? } para editor / vista. */
export function routesForRoleEditor(permisos, { includeInactive = false } = {}) {
  const wildcard = isWildcardRole(permisos);
  const modeByKey = new Map();
  const fixByKey = new Map();
  for (const [key, value] of Object.entries(permisos ?? {})) {
    if (key === "*" || key === "descripcion" || key === "namedisplay" || key === "roles"
      || key === "impersonate" || key === "manage_permissions") continue;
    const mode = value === true ? "allow" : value?.scope === "all" ? "all" : value?.scope === "own" ? "own" : "off";
    if (mode !== "off") modeByKey.set(key, mode);
    const ff = fixFilterFromRestriction(value);
    if (ff) fixByKey.set(key, ff);
  }

  const groups = ROUTE_GROUPS.map((g) => ({
    id: g.id,
    title: g.title,
    routes: g.routes.map((def) => {
      let mode = "off";
      if (wildcard) mode = def.scoped ? "all" : "allow";
      else if (modeByKey.has(def.key)) mode = modeByKey.get(def.key);
      return { ...def, mode, fixFilter: fixByKey.get(def.key), active: mode !== "off" };
    }).filter((r) => includeInactive || r.active),
  })).filter((g) => g.routes.length > 0);

  const extras = [...modeByKey.entries()]
    .filter(([key]) => !CATALOG_KEYS.has(key))
    .map(([key, mode]) => ({
      key, label: key, mode, fixFilter: fixByKey.get(key), active: true, scoped: mode === "own" || mode === "all",
    }))
    .sort((a, b) => a.key.localeCompare(b.key));

  return { groups, extras, wildcard, activeCount: [...modeByKey.keys()].length + (wildcard ? 1 : 0) };
}

export function routesArrayFromPermisos(permisos, includeInactive) {
  const { groups, extras } = routesForRoleEditor(permisos, { includeInactive });
  const rows = [];
  for (const g of groups) {
    for (const r of g.routes) rows.push({ key: r.key, mode: r.mode, ...(r.fixFilter ? { fixFilter: r.fixFilter } : {}) });
  }
  for (const r of extras) rows.push({ key: r.key, mode: r.mode, ...(r.fixFilter ? { fixFilter: r.fixFilter } : {}) });
  return rows;
}

export function groupsFromRouteRows(routes, flags, { includeInactive = false } = {}) {
  const permisos = {};
  if (flags?.["*"]) permisos["*"] = true;
  for (const r of routes ?? []) {
    if (!r?.key || r.mode === "off") continue;
    if (r.mode === "allow") permisos[r.key] = true;
    else if (r.mode === "own") permisos[r.key] = r.fixFilter ? { scope: "own", fixFilter: r.fixFilter } : { scope: "own" };
    else if (r.mode === "all") permisos[r.key] = { scope: "all" };
  }
  return routesForRoleEditor(permisos, { includeInactive });
}
