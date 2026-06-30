/** Plantillas estándar: dueño de conversación = sesión JWT. */
export const SESSION_OWNER_FIX_FILTER = {
  itercero: "{{itercero}}",
  icontacto: "{{icontacto}}",
};

export const FIX_FILTER_VAR_HINT = "itercero, icontacto, iusuario, nombres";

export function formatFixFilter(fixFilter) {
  if (!fixFilter || typeof fixFilter !== "object" || Array.isArray(fixFilter)) return "";
  return Object.entries(fixFilter)
    .map(([k, v]) => `${k}: ${String(v)}`)
    .join(" · ");
}

export function fixFilterFromRestriction(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const ff = value.fixFilter;
  if (!ff || typeof ff !== "object" || Array.isArray(ff)) return undefined;
  return { ...ff };
}

/** Añade fixFilter de sesión a cualquier restricción de rol. */
export function withSessionOwnerFixFilter(restriction) {
  if (restriction === true) return { fixFilter: { ...SESSION_OWNER_FIX_FILTER } };
  if (!restriction || typeof restriction !== "object") return restriction;
  return { ...restriction, fixFilter: { ...SESSION_OWNER_FIX_FILTER } };
}