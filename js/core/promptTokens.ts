/** Estimación de tokens de prompt (CDN ISAFront o fallback chars/4). */
export function estimatePromptTokensFromCdn(text: unknown): number {
  const fn = window.ISAFront?.estimatePromptTokens;
  if (typeof fn === "function") return fn(text);
  const s = String(text ?? "");
  return s.trim() ? Math.ceil(s.length / 4) : 0;
}
