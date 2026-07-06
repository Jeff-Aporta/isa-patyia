// js/ui/treeView/treeDrag.ts
function resolveDragZone(clientY, rectTop, rectHeight, isGrouper) {
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
function summaryDragClass(dragOver, forbidden) {
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
function defaultCanDrop(sourcePath, targetPath, zone, isDescendant) {
  if (!zone || !sourcePath || !targetPath || sourcePath === targetPath) return false;
  return !isDescendant(targetPath, sourcePath);
}
export {
  defaultCanDrop,
  resolveDragZone,
  summaryDragClass
};
