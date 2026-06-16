/** Variables {{nombre}} en plantillas de instrucciones PatyIA. */

export const PROMPT_VAR_PATTERN = /\{\{\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}\}/g;

export type PromptTextSegment = { type: "text"; value: string } | { type: "var"; name: string };

export function isValidVarName(name: string): boolean {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(String(name || "").trim());
}

export function splitBodyWithVars(text: string): PromptTextSegment[] {
  const src = String(text ?? "");
  if (!src) return [];
  const out: PromptTextSegment[] = [];
  const re = new RegExp(PROMPT_VAR_PATTERN.source, "g");
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    if (m.index > last) out.push({ type: "text", value: src.slice(last, m.index) });
    out.push({ type: "var", name: m[1] });
    last = m.index + m[0].length;
  }
  if (last < src.length) out.push({ type: "text", value: src.slice(last) });
  return out;
}

/** Lista única de variables presentes en el texto (orden alfabético). */
export function extractPromptVariables(text: string): string[] {
  const set = new Set<string>();
  for (const seg of splitBodyWithVars(text)) {
    if (seg.type === "var") set.add(seg.name);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

function varReplaceRe(name: string): RegExp {
  return new RegExp(`\\{\\{\\s*${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\}\\}`, "gi");
}

export function renamePromptVariable(text: string, oldName: string, newName: string): string {
  const next = String(newName || "").trim();
  if (!isValidVarName(next)) return text;
  return String(text ?? "").replace(varReplaceRe(oldName), `{{${next}}}`);
}

/** Elimina todas las ocurrencias de {{name}} en el documento. */
export function deletePromptVariable(text: string, name: string): string {
  return String(text ?? "").replace(varReplaceRe(name), "");
}

export function insertPromptVariable(text: string, offset: number, name: string): string {
  const token = `{{${name}}}`;
  const pos = Math.max(0, Math.min(offset, text.length));
  return text.slice(0, pos) + token + text.slice(pos);
}
