import { CodeMirrorPanel } from "../core/platform.ts";

/** Editor JSON editable (CodeMirror compartido + copiar + pantalla completa). */
export function JsonCodeEditor({ value = "", onChange, placeholder = "", toolbarExtra = null }) {
  return (
    <CodeMirrorPanel
      value={value}
      onChange={onChange}
      json
      readOnly={false}
      fill
      enableFullPage
      fullPageTitle="Log JSON"
      placeholder={placeholder}
      lineWrapping={false}
      toolbarExtra={toolbarExtra}
    />
  );
}
