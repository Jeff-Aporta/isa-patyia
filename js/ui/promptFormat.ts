/** Formateo legible de secciones de prompt (historial JSON, líneas [role], consulta actual). */

import { mdToHtml } from "./markdown.ts";

function escapeHtml(src: string): string {
  return String(src ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function bodyMdToHtml(src: string): string {
  return mdToHtml(src);
}

export function displayRoleLabel(role: string, userName?: string): string {
  const r = String(role || "").toLowerCase();
  if (r === "usuario" || r === "user") return userName?.trim() || "Usuario";
  if (r === "asistente" || r === "assistant") return "PatyIA";
  if (r === "system") return "Sistema";
  if (r === "developer") return "Developer";
  if (r === "operativa") return "Operativa";
  return String(role || "Mensaje");
}

export function formatSectionLabel(label: string, userName?: string): string {
  const l = String(label || "").trim();
  const low = l.toLowerCase();
  if (low === "user" || low === "usuario") return userName?.trim() || "Usuario";
  if (low === "assistant" || low === "asistente") return "PatyIA";
  if (low === "system") return "Sistema";
  if (low === "input") return "Input";
  if (low === "instructions") return "Instrucciones";
  if (low === "content") return "Contenido";
  return l;
}

function roleCssClass(role: string): string {
  const r = String(role || "").toLowerCase();
  if (r === "usuario" || r === "user") return "user";
  if (r === "asistente" || r === "assistant") return "assistant";
  if (r === "system") return "system";
  return "other";
}

type ChatMsg = { role: string; text: string };

function normalizeBlockText(text: unknown): string {
  if (text == null) return "";
  if (Array.isArray(text)) return text.map((p) => String(p ?? "")).join("\n").replace(/\r\n/g, "\n");
  return String(text).replace(/\r\n/g, "\n");
}

function extractChatMessage(o: Record<string, unknown>): ChatMsg | null {
  if (!o || typeof o !== "object") return null;
  const role = String(o.rol ?? o.role ?? "").trim();
  const text = normalizeBlockText(o.mensaje ?? o.message ?? o.content ?? "");
  if (!role && !text) return null;
  return { role: role || "mensaje", text };
}

function isChatMessageArray(arr: unknown): arr is Record<string, unknown>[] {
  return Array.isArray(arr)
    && arr.length > 0
    && arr.every((item) => item && typeof item === "object" && extractChatMessage(item as Record<string, unknown>));
}

function tryExtractJsonArray(s: string): { value: Record<string, unknown>[]; rest: string } | null {
  const start = s.indexOf("[");
  if (start === -1) return null;
  const slice = s.slice(start);
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = 0; i < slice.length; i += 1) {
    const ch = slice[i];
    if (inString) {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === "[") depth += 1;
    else if (ch === "]") {
      depth -= 1;
      if (depth === 0) {
        const candidate = slice.slice(0, i + 1);
        try {
          const parsed = JSON.parse(candidate);
          if (isChatMessageArray(parsed)) {
            return { value: parsed, rest: s.slice(start + i + 1) };
          }
        } catch { /* not valid chat JSON */ }
        return null;
      }
    }
  }
  return null;
}

const ROLE_LINE_RE = /^\[(user|assistant|system|usuario|asistente|developer)\]\s*/i;

function findNextSpecialIndex(s: string): number {
  const patterns = [
    /\n\n\[\{/,
    /\n\[\{/,
    /\n\n\[(user|assistant|system|usuario|asistente|developer)\]\s*/i,
    /\n\[(user|assistant|system|usuario|asistente|developer)\]\s*/i,
  ];
  let best = -1;
  for (const re of patterns) {
    const m = re.exec(s);
    if (m && m.index >= 0 && (best === -1 || m.index < best)) best = m.index;
  }
  return best;
}

type PromptChunk =
  | { type: "jsonChat"; messages: Record<string, unknown>[] }
  | { type: "roleLine"; role: string; content: string }
  | { type: "plain"; text: string; asQuery?: boolean };

function splitPromptChunks(raw: string): PromptChunk[] {
  const chunks: PromptChunk[] = [];
  let rest = raw.trim();
  let hadJsonChat = false;

  while (rest.length) {
    rest = rest.trimStart();
    if (!rest) break;

    const json = tryExtractJsonArray(rest);
    if (json) {
      chunks.push({ type: "jsonChat", messages: json.value });
      hadJsonChat = true;
      rest = json.rest;
      continue;
    }

    const roleMatch = rest.match(ROLE_LINE_RE);
    if (roleMatch) {
      const role = roleMatch[1];
      const afterRole = rest.slice(roleMatch[0].length);
      const endIdx = findNextSpecialIndex(afterRole);
      const content = (endIdx === -1 ? afterRole : afterRole.slice(0, endIdx)).trim();
      chunks.push({ type: "roleLine", role, content });
      rest = endIdx === -1 ? "" : afterRole.slice(endIdx).trimStart();
      continue;
    }

    const nextSpecial = findNextSpecialIndex(rest);
    if (nextSpecial === -1) {
      const text = rest.trim();
      if (text) chunks.push({ type: "plain", text, asQuery: hadJsonChat });
      break;
    }
    if (nextSpecial > 0) {
      const text = rest.slice(0, nextSpecial).trim();
      if (text) chunks.push({ type: "plain", text, asQuery: hadJsonChat });
    }
    rest = rest.slice(nextSpecial).trimStart();
  }

  return chunks;
}

function formatSingleChatLineHtml(role: string, content: string, userName?: string): string {
  const label = escapeHtml(displayRoleLabel(role, userName));
  const cls = roleCssClass(role);
  const bodyHtml = bodyMdToHtml(content);
  return (
    `<div class="prompt-chat-line prompt-chat-line--${cls}">`
    + `<div class="prompt-chat-line__head"><span class="prompt-chat-prompt">${label}&gt;</span></div>`
    + `<div class="prompt-chat-body">${bodyHtml}</div>`
    + `</div>`
  );
}

function formatChatTranscriptHtml(messages: Record<string, unknown>[], userName?: string): string {
  const lines = messages
    .map((m) => extractChatMessage(m))
    .filter(Boolean)
    .map((m) => formatSingleChatLineHtml(m!.role, m!.text, userName))
    .join("");
  return `<div class="prompt-chat-transcript">${lines}</div>`;
}

export function isLegacyChatPayload(text: string): boolean {
  const raw = String(text ?? "").trim();
  if (!raw) return false;
  if (/^\[(user|assistant|system|usuario|asistente|developer)\]\s/i.test(raw)) return true;
  if (!raw.startsWith("[")) return false;
  const json = tryExtractJsonArray(raw);
  return json != null;
}

export function formatPromptSectionHtml(
  text: string,
  { userName }: { userName?: string } = {},
): string {
  const raw = String(text ?? "").trim();
  if (!raw) return "";

  const chunks = splitPromptChunks(raw);
  if (!chunks.length) return bodyMdToHtml(raw);

  const htmlParts: string[] = [];
  for (const chunk of chunks) {
    if (chunk.type === "jsonChat") {
      htmlParts.push(formatChatTranscriptHtml(chunk.messages, userName));
    } else if (chunk.type === "roleLine") {
      htmlParts.push(
        `<div class="prompt-chat-transcript">${formatSingleChatLineHtml(chunk.role, chunk.content, userName)}</div>`,
      );
    } else if (chunk.type === "plain") {
      if (chunk.asQuery && chunk.text) {
        htmlParts.push(
          `<div class="prompt-chat-transcript prompt-chat-transcript--query">`
          + formatSingleChatLineHtml("user", chunk.text, userName)
          + `</div>`,
        );
      } else {
        htmlParts.push(`<div class="prompt-plain-block">${bodyMdToHtml(chunk.text)}</div>`);
      }
    }
  }

  return htmlParts.join("") || bodyMdToHtml(raw);
}
