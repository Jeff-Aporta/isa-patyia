import { mdToHtml } from "./markdown.ts";
import { PROMPT_VAR_PATTERN, varToneStyleAttr } from "../core/promptVariables.ts";
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
    `<span class="prompt-var-chip" contenteditable="false" data-var="${escAttr(name)}" style="${varToneStyleAttr(name)}" title="${escAttr(name)}">`
    + `<span class="prompt-var-chip__label">{{${escAttr(name)}}}</span>${del}</span>`
  );
}

/** Sustituye {{vars}} por tokens, renderiza markdown una vez y reemplaza por chips inline. */
function renderBodyWithVarChips(body: string, opts: { editable?: boolean } = {}): string {
  const src = String(body ?? "");
  if (!src) return "";

  const placeholders: { token: string; name: string }[] = [];
  let idx = 0;
  const mdSrc = src.replace(PROMPT_VAR_PATTERN, (_m, name: string) => {
    const token = `\uE000PV${idx++}\uE001`;
    placeholders.push({ token, name });
    return token;
  });

  let html = mdToHtml(mdSrc);
  for (const { token, name } of placeholders) {
    html = html.split(token).join(varChipHtml(name, opts));
  }
  return html;
}

/** Vista previa: markdown + badges de variables inline (sin saltos extra). */
export function bodyPreviewHtml(body: string): string {
  return renderBodyWithVarChips(body, { editable: false });
}

/** HTML editable para contenteditable (markdown renderizado + chips). */
export function bodyToEditorHtml(body: string): string {
  const html = renderBodyWithVarChips(body, { editable: true });
  return html || "<p><br></p>";
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
      return `${bullet} ${inner().trimStart()}\n`;
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

const RAW_VAR_IN_TEXT = /\{\{\s*[A-Za-z_]\w*\s*\}\}/;

/** true si hay {{var}} en texto plano aún sin convertir a chip. */
export function surfaceHasRawVarTokens(root: HTMLElement | null): boolean {
  if (!root) return false;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node.parentElement?.closest(".prompt-var-chip")) continue;
    if (RAW_VAR_IN_TEXT.test(node.textContent ?? "")) return true;
  }
  return false;
}
