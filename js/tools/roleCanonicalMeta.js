/** Etiquetas oficiales — espejo de ISS role-canonical-meta.ts */
export const CANONICAL_ROLE_META = {
  dev: {
    namedisplay: "Desarrollador básico",
    descripcion: "Desarrollador básico — rama desarrollo (hereda visitante)",
  },
  admn: {
    namedisplay: "Admn básico",
    descripcion: "Admn básico — permisos administrativos globales (hereda visitante)",
  },
  admn_isapatyia: {
    namedisplay: "Admn ISA-Paty",
    descripcion: "Admn ISA-Paty — permisos administrativos sobre PatyIA (hereda auditador, admn y visitante)",
  },
};

export function canonicalRoleMeta(roleName) {
  const key = String(roleName ?? "").trim().toLowerCase();
  return CANONICAL_ROLE_META[key] ?? null;
}
