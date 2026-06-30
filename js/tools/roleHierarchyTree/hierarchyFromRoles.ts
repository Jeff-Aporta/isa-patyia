/** Construye nodos de jerarquía desde entradas de permisos (fallback si GET hierarchy falla o viene vacío). */

import { getRoleJerarquia } from "../roleHierarchy.js";
import { roleNameFromEntry } from "../permisosKanbanShared.js";
import { roleDescripcion, roleNamedisplay } from "../permisosForm.js";
import type { HierarchyNode } from "./types.js";

export function hierarchyNodesFromRoleEntries(
  roleEntries: Array<{ iusuario?: string; permisos?: Record<string, unknown>; bactivo?: boolean }> | undefined,
): HierarchyNode[] {
  const out: HierarchyNode[] = [];
  for (const e of roleEntries ?? []) {
    const iusuario = roleNameFromEntry(e);
    if (!iusuario) continue;
    const permisos = e.permisos && typeof e.permisos === "object" ? e.permisos : {};
    const jerarquia = getRoleJerarquia(iusuario, permisos);
    if (!jerarquia) continue;
    out.push({
      iusuario,
      jerarquia,
      namedisplay: roleNamedisplay(permisos) || null,
      descripcion: roleDescripcion(permisos) || null,
      bactivo: e.bactivo !== false,
    });
  }
  return out;
}
