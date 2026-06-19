import type { ChatAudioEntry } from "./types.ts";

const AUDIO_EXT_RE = /\.(webm|mp3|m4a|wav|ogg|aac|mp4)$/i;
const BACKEND_AUDIO_MIMES = new Set([
  "audio/webm",
  "audio/mp4",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/x-m4a",
  "audio/aac",
]);

function mimeFromFileName(name: string): string | undefined {
  const lower = name.trim().toLowerCase();
  if (lower.endsWith(".webm")) return "audio/webm";
  if (lower.endsWith(".mp3")) return "audio/mpeg";
  if (lower.endsWith(".m4a") || lower.endsWith(".mp4")) return "audio/mp4";
  if (lower.endsWith(".wav")) return "audio/wav";
  if (lower.endsWith(".ogg")) return "audio/ogg";
  return undefined;
}

function isBackendSupportedAudioDataUrl(dataUrl: string): boolean {
  const m = String(dataUrl || "").match(/^data:([^;]+);base64,/i);
  const mime = (m?.[1] || "").toLowerCase();
  return BACKEND_AUDIO_MIMES.has(mime);
}

export function isChatAudioFile(file: File | null | undefined): boolean {
  if (!file) return false;
  if (file.type?.startsWith("audio/")) return true;
  return AUDIO_EXT_RE.test(file.name || "");
}

export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ""));
    r.onerror = () => reject(new Error("No se pudo leer el audio"));
    r.readAsDataURL(file);
  });
}

function normalizeAudioDataUrl(dataUrl: string, file: File): string {
  const raw = String(dataUrl || "").trim();
  if (!raw.startsWith("data:")) return raw;
  if (isBackendSupportedAudioDataUrl(raw)) return raw;
  const fallbackMime = mimeFromFileName(file.name || "") || (file.type?.startsWith("audio/") ? file.type : "audio/webm");
  const i = raw.indexOf("base64,");
  if (i < 0) return raw;
  return `data:${fallbackMime};base64,${raw.slice(i + 7)}`;
}

export async function filesToAudioEntries(files: Iterable<File> | null | undefined): Promise<ChatAudioEntry[]> {
  const added: ChatAudioEntry[] = [];
  for (const file of files || []) {
    if (!isChatAudioFile(file)) continue;
    const dataUrl = normalizeAudioDataUrl(await fileToDataUrl(file), file);
    if (!isBackendSupportedAudioDataUrl(dataUrl)) continue;
    added.push({ name: file.name || "audio", dataUrl });
  }
  return added;
}

export type VoiceRecorderHandle = {
  start(): Promise<void>;
  stop(): Promise<ChatAudioEntry | null>;
  cancel(): void;
  isActive(): boolean;
};

export function createVoiceRecorder(): VoiceRecorderHandle {
  let mediaRecorder: MediaRecorder | null = null;
  let chunks: BlobPart[] = [];
  let stream: MediaStream | null = null;

  const stopStream = () => {
    stream?.getTracks().forEach((t) => t.stop());
    stream = null;
  };

  return {
    async start() {
      if (mediaRecorder?.state === "recording") return;
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "";
      mediaRecorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      mediaRecorder.start();
    },
    stop() {
      return new Promise((resolve) => {
        if (!mediaRecorder || mediaRecorder.state === "inactive") {
          stopStream();
          resolve(null);
          return;
        }
        const recorder = mediaRecorder;
        recorder.onstop = async () => {
          const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
          stopStream();
          mediaRecorder = null;
          chunks = [];
          if (!blob.size) {
            resolve(null);
            return;
          }
          const dataUrl = await fileToDataUrl(blob);
          resolve({
            name: `nota-voz-${new Date().toISOString().replace(/[:.]/g, "-")}.webm`,
            dataUrl,
          });
        };
        recorder.stop();
      });
    },
    cancel() {
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.onstop = null;
        mediaRecorder.stop();
      }
      mediaRecorder = null;
      chunks = [];
      stopStream();
    },
    isActive() {
      return mediaRecorder?.state === "recording";
    },
  };
}

export function isVoiceRecordingSupported(): boolean {
  return typeof navigator !== "undefined"
    && Boolean(navigator.mediaDevices?.getUserMedia)
    && typeof MediaRecorder !== "undefined";
}
