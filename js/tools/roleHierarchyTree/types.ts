/**
 * Tipos del árbol de jerarquía de roles — espejo del Svelte original contracts.ts.
 */

export interface ITreeRowCtx {
  flatPath: string;
  hasChildren?: boolean;
  isCollapsed?: boolean;
  depth?: number;
  jerarquia?: string;
}

export type RowOf<T> = T & {
  flatPath: string;
  pathInit: string;
  hasChildren: boolean;
  isCollapsed: boolean;
  depth: number;
  jerarquia: string;
  isSelected: boolean;
};

/** TreeRow concreto: RowOf<HierarchyNode> — usado en los componentes del árbol. */
export type TreeRow = RowOf<HierarchyNode>;

/** Nodo jerárquico con hijos (espejo INode del Svelte TreeView). */
export interface TreeINode extends TreeRow {
  childrens: TreeINode[];
}

export type DragOverZone = "before" | "after" | "into";

export interface ITreeRuntimeRow<R extends ITreeRowCtx> {
  readonly record: R | null;
  readonly rootNodes: ReadonlyArray<R>;
  findByJerarquia(jer: string): R | undefined;
  move?(record: R, targetParentJer: string): Promise<void>;
  openEdit?(record: R): void;
  extinguish?(record: R): Promise<void>;
  addRoot?(): void;
  collapseAll?(): void;
  expandAll?(): void;
  readonly canCollapseAll?: boolean;
  readonly canExpandAll?: boolean;
  readonly isProtected?: boolean;
  readonly isReadOnly?: boolean;
  readonly canMutate?: boolean;
}

export interface ITreeAction<R> {
  name: string;
  icon?: string;
  color?: string;
  disabled?: boolean;
  action: (record: R) => void | Promise<void>;
}

export interface HierarchyNode {
  iusuario: string;
  jerarquia: string;
  namedisplay: string | null;
  descripcion: string | null;
}