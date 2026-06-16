import { mdToHtml } from "./markdown.ts";
import { splitBodyWithVars } from "../core/promptVariables.ts";

function escAttr(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

export function varChipHtml(name: string, opts: { editable?: boolean } = {}): string {
  const editable = opts.editable !== false;
  const del = editable
    ? `<button type="button" class="prompt-var-chip__del" data-var-del="${escAttr(name)}" aria-label="Eliminar variable ${escAttr(name)}" tabindex="-1">×</button>`
    : "";
  return (
    `<span class="prompt-var-chip" contenteditable="false" data-var="${escAttr(name)}" title="${escAttr(name)}">`
    + `<span class="prompt-var-chip__label">{{${escAttr(name)}}}</span>${del}</span>`
  );
}

/** Vista previa: markdown + badges de variables. */
export function bodyPreviewHtml(body: string): string {
  const parts = splitBodyWithVars(body);
  if (!parts.length) return "";
  return parts
    .map((p) => (p.type === "var" ? varChipHtml(p.name, { editable: false }) : mdToHtml(p.value)))
    .join("");
}

/** HTML editable para contenteditable (markdown renderizado + chips). */
export function bodyToEditorHtml(body: string): string {
  const parts = splitBodyWithVars(body);
  if (!parts.length) return "<p><br></p>";
  return parts
    .map((p) => (p.type === "var" ? varChipHtml(p.name) : mdToHtml(p.value || "")))
    .join("");
}

function inlineMd(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent || "";
  if (node.nodeType !== Node.ELEMENT_NODE) return "";
  const el = node as HTMLElement;
  if (el.classList?.contains("prompt-var-chip") && el.dataset.var) {
    return `{{${el.dataset.var}}}`;
  }
  const tag = el.tagName.toLowerCase();
  const inner = () => [...el.childNodes].map(inlineMd).join("");
  switch (tag) {
    case "strong":
    case "b":
      return `**${inner()}**`;
    case "em":
    case "i":
      return `*${inner()}*`;
    case "code":
      return `\`${inner()}\``;
    case "a":
      return inner();
    case "br":
      return "\n";
    default:
      return inner();
  }
}

function blockMd(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const inner = () => [...el.childNodes].map((n) => (n.nodeType === Node.ELEMENT_NODE ? inlineMd(n) : inlineMd(n))).join("");
  if (el.classList?.contains("prompt-var-chip") && (el as HTMLElement).dataset.var) {
    return `{{${(el as HTMLElement).dataset.var}}}`;
  }
  switch (tag) {
    case "h1":
      return `# ${inner().trim()}\n\n`;
    case "h2":
      return `## ${inner().trim()}\n\n`;
    case "h3":
      return `### ${inner().trim()}\n\n`;
    case "h4":
      return `#### ${inner().trim()}\n\n`;
    case "h5":
      return `##### ${inner().trim()}\n\n`;
    case "h6":
      return `###### ${inner().trim()}\n\n`;
    case "p":
      return `${inner()}\n\n`;
    case "li": {
      const parent = el.parentElement?.tagName.toLowerCase();
      const bullet = parent === "ol" ? "1." : "-";
      return `${bullet} ${inner().trim()}\n`;
    }
    case "ul":
    case "ol":
      return [...el.children].map((c) => blockMd(c)).join("") + "\n";
    case "pre": {
      const code = el.querySelector("code");
      const text = code?.textContent ?? el.textContent ?? "";
      return `\`\`\`\n${text}\n\`\`\`\n\n`;
    }
    case "blockquote":
      return inner()
        .split("\n")
        .filter(Boolean)
        .map((l) => `> ${l}`)
        .join("\n") + "\n\n";
    case "hr":
      return "---\n\n";
    case "div": {
      if (el.classList.contains("md-table-wrap")) return el.innerHTML ? `${el.textContent?.trim() || ""}\n\n` : "";
      return [...el.childNodes].map((n) => {
        if (n.nodeType === Node.ELEMENT_NODE) return blockMd(n as Element);
        return inlineMd(n);
      }).join("");
    }
    default:
      return inner();
  }
}

/** Serializa contenteditable → markdown con {{variables}}. */
export function editorHtmlToBody(root: HTMLElement): string {
  let out = "";
  for (const node of root.childNodes) {
    if (node.nodeType === Node.ELEMENT_NODE) out += blockMd(node as Element);
    else if (node.nodeType === Node.TEXT_NODE) out += node.textContent || "";
  }
  return out.replace(/\n{3,}/g, "\n\n").trimEnd();
}
