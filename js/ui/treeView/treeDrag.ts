/**
 * Drag & drop del TreeView — espejo TRADrag (Svelte).
 */

import type { DragOverZone } from "./contracts.js";

export function resolveDragZone(
  clientY: number,
  rectTop: number,
  rectHeight: number,
  isGrouper: boolean,
): DragOverZone {
  if (isGrouper) {
    const y = clientY - rectTop;
    const topBand = rectHeight * 0.25;
    const bottomBand = rectHeight * 0.75;
    if (y < topBand) return "before";
    if (y > bottomBand) return "after";
    return "into";
  }
  const midY = rectTop + rectHeight / 2;
  return clientY < midY ? "before" : "after";
}

export function summaryDragClass(dragOver: DragOverZone | null, forbidden: boolean): string {
  if (!dragOver) return "";
  if (forbidden) {
    if (dragOver === "before") return "trvwr-itm-sum--drg-forbidden-bf";
    if (dragOver === "after") return "trvwr-itm-sum--drg-forbidden-aftr";
    return "trvwr-itm-sum--drg-forbidden-into";
  }
  if (dragOver === "before") return "trvwr-itm-sum--drg-bf";
  if (dragOver === "after") return "trvwr-itm-sum--drg-aftr";
  return "trvwr-itm-sum--drg-into";
}

export function defaultCanDrop(
  sourcePath: string,
  targetPath: string,
  zone: DragOverZone | null,
  isDescendant: (target: string, ancestor: string) => boolean,
): boolean {
  if (!zone || !sourcePath || !targetPath || sourcePath === targetPath) return false;
  return !isDescendant(targetPath, sourcePath);
}
