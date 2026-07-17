/** Nodo plano de jerarquía de roles (dot-notation en `jerarquia`). */
export interface HierarchyNode {
  iusuario: string;
  jerarquia: string;
  namedisplay: string | null;
  descripcion: string | null;
  bactivo?: boolean;
}
