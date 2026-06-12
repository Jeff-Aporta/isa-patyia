import { CodeMirrorPanel } from "../ui/codeMirrorPanel.jsx";

/** Editor JSON editable (CodeMirror compartido + copiar). */
export function JsonCodeEditor({ value = "", onChange, placeholder = "" }) {
  return (
    <CodeMirrorPanel
      value={value}
      onChange={onChange}
      json
      readOnly={false}
      fill
      placeholder={placeholder}
      lineWrapping={false}
    />
  );
}
