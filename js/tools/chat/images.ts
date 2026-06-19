import type { ChatImageEntry } from "./types.ts";

const IMAGE_EXT_RE = /\.(png|jpe?g|webp|gif|bmp|heic|heif)$/i;

function mimeFromFileName(name: string): string | undefined {
  const lower = name.trim().toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (/\.jpe?g$/i.test(lower)) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (/\.heic$/i.test(lower)) return "image/heic";
  if (/\.heif$/i.test(lower)) return "image/heif";
  if (lower.endsWith(".bmp")) return "image/bmp";
  return undefined;
}

export function isChatImageFile(file: File | null | undefined): boolean {
  if (!file) return false;
  if (file.type?.startsWith("image/")) return true;
  return IMAGE_EXT_RE.test(file.name || "");
}

function normalizeImageDataUrl(dataUrl: string, file: File): string {
  const raw = String(dataUrl || "").trim();
  if (!raw.startsWith("data:")) return raw;
  const mimeMatch = raw.match(/^data:([^;]+);base64,/i);
  const mime = (mimeMatch?.[1] || "").toLowerCase();
  if (mime.startsWith("image/") && mime !== "image/heic" && mime !== "image/heif") return raw;
  const fallbackMime = mimeFromFileName(file.name || "") || (file.type?.startsWith("image/") ? file.type : "image/jpeg");
  const i = raw.indexOf("base64,");
  if (i < 0) return raw;
  return `data:${fallbackMime};base64,${raw.slice(i + 7)}`;
}

export function readImagesFromClipboard(items: DataTransferItemList | null | undefined): File[] {
  const out: File[] = [];
  for (const item of items || []) {
    if (item.type.startsWith("image/")) {
      const f = item.getAsFile();
      if (f) out.push(f);
    }
  }
  return out;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ""));
    r.onerror = () => reject(new Error("No se pudo leer la imagen"));
    r.readAsDataURL(file);
  });
}

export async function filesToImageEntries(files: Iterable<File> | null | undefined): Promise<ChatImageEntry[]> {
  const added: ChatImageEntry[] = [];
  for (const file of files || []) {
    if (!isChatImageFile(file)) continue;
    const dataUrl = normalizeImageDataUrl(await fileToDataUrl(file), file);
    if (!String(dataUrl).startsWith("data:image/")) continue;
    added.push({ name: file.name || "imagen", dataUrl });
  }
  return added;
}
