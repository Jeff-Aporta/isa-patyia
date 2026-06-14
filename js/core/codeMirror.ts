/** Puente a ISAFront.CodeMirrorPanel (front-shared). */
export function CodeMirrorPanel(props) {
  const Panel = window.ISAFront?.CodeMirrorPanel;
  if (!Panel) throw new Error("CodeMirrorPanel no cargado — recargue sin caché (Ctrl+Shift+R).");
  return Panel(props);
}
