import { getSnapshot } from "../../core/urlState.ts";

export const CHAT_SIDEBAR_W = 320;
export const MAX_CHAT_IMAGES = 10;
export const TERCEROS_AUDIT_PAGE_SIZE = 15;
export const CONV_LIST_PAGE_SIZE = 100;

export type ChatMessageSource = "prod" | "logs";

export function parseChatMessageSource(raw: unknown): ChatMessageSource {
  return raw === "prod" || raw === "logs" ? raw : "logs";
}

/** Prefer URL ?s=.chat.messageSource; default logs si no está seteado. */
export function readChatMessageSource(bootChat?: { messageSource?: unknown }): ChatMessageSource {
  if (bootChat?.messageSource === "prod" || bootChat?.messageSource === "logs") return bootChat.messageSource;
  const chat = getSnapshot().chat as Record<string, unknown> | undefined;
  if (chat?.messageSource === "prod" || chat?.messageSource === "logs") return chat.messageSource;
  return "logs";
}

/** null si la URL no define messageSource (no resetear el default en memoria). */
export function messageSourceFromUrl(chat: Record<string, unknown> | undefined): ChatMessageSource | null {
  if (chat?.messageSource === "prod" || chat?.messageSource === "logs") return chat.messageSource;
  return null;
}
