/**
 * Manifest JSON + customs (callbacks) para jerarquía de roles sobre TreeView genérico.
 */

import { ancestorsFromPath, compareHierarchy, formatJerarquiaLabel } from "../roleHierarchy.js";
import { canDrop, computeDropJerarquia } from "./treeLogic.js";
import type { HierarchyNode } from "./types.js";
import type { DragOverZone, TreeINode, TreeRuntime, TreeViewCustoms, TreeViewManifest } from "../../ui/treeView/contracts.js";
import { toastError, toastInfo } from "../../core/platform.ts";

/** Manifest serializable — sin lógica de dominio. */
export const ROLE_HIERARCHY_MANIFEST: TreeViewManifest = {
  ariaLabel: "Árbol de roles",
  entrie: "rol",
  entries: "roles",
  emptyMessage: "Sin roles.",
  countLabel: undefined,
  icons: {
    grouperOpen: "mdi:folder-account",
    grouperClosed: "mdi:folder-account-outline",
    grouperColor: "#1976d2",
    leaf: "mdi:account",
    chevron: "mdi:chevron-down",
    dragHandle: "mdi:dots-grid",
  },
  features: {
    drag: true,
    collapse: true,
    toolbarExpandCollapse: true,
    rowActions: true,
    showPathLabel: true,
    showHelper: true,
  },
};

export interface RoleHierarchyHandlers {
  items: HierarchyNode[];
  canMutate: boolean;
  onSave: (name: string, jerarquia: string) => Promise<void>;
  onDelete: (name: string) => Promise<void>;
  onEdit: (node: HierarchyNode) => void;
  onCreateClick: () => void;
}

function immediateParentJer(jer: string): string | null {
  const ancestors = ancestorsFromPath(jer);
  return ancestors.length > 1 ? ancestors[1] : null;
}

export function createRoleHierarchyCustoms(handlers: RoleHierarchyHandlers): TreeViewCustoms<HierarchyNode & Record<string, unknown>> {
  const { items, canMutate, onSave, onDelete, onEdit, onCreateClick } = handlers;

  return {
    build: {
      getFlatPath: (item) => String(item.jerarquia ?? "").trim(),
      getParentPath: (flatPath) => immediateParentJer(flatPath),
      dedupeKey: (item) => String(item.jerarquia ?? "").trim(),
      sortSiblings: (a, b) => compareHierarchy(a.flatPath, b.flatPath),
    },

    getLabel: (node) => node.data.namedisplay?.trim() || node.data.iusuario,
    getHelper: (node) => node.data.descripcion?.trim() || null,
    getPathLabel: (node) => formatJerarquiaLabel(node.flatPath),

    canDrop: (sourcePath, targetPath, zone) => canDrop(sourcePath, targetPath, zone, items),

    onDrop: async (sourcePath, targetPath, zone) => {
      const source = items.find((n) => n.jerarquia === sourcePath);
      if (!source) return;
      const newJer = computeDropJerarquia(sourcePath, targetPath, zone, items);
      if (!newJer) {
        toastInfo?.("No se puede mover: operación no permitida");
        return;
      }
      try {
        await onSave(source.iusuario, newJer);
      } catch (err) {
        toastError?.(`Error al reparentar: ${(err as Error)?.message ?? err}`);
      }
    },

    rowActions: (node) => {
      if (!canMutate) return [];
      const data = node.data;
      return [
        {
          id: "edit",
          icon: "mdi:pencil",
          title: "Editar jerarquía",
          onClick: () => onEdit(data),
        },
        {
          id: "delete",
          icon: "mdi:delete",
          title: "Eliminar rol",
          onClick: () => {
            if (confirm(`¿Eliminar rol "${data.iusuario}"?`)) {
              onDelete(data.iusuario).catch((e) => toastError?.(String(e)));
            }
          },
        },
      ];
    },

    toolbarActions: (runtime: TreeRuntime<HierarchyNode & Record<string, unknown>>) => {
      if (!canMutate) return [];
      return [
        {
          id: "new-role",
          icon: "mdi:plus",
          title: "Nuevo rol",
          label: "Nuevo rol",
          variant: "button" as const,
          onClick: onCreateClick,
        },
      ];
    },
  };
}

export type { TreeINode, DragOverZone };
