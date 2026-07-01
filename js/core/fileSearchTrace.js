/** TK-1441245 — helpers File Search en meta de conv-log (front). */

export function archivosCitadosFromTrace(trace) {
  const seen = new Set();
  const out = [];
  for (const call of trace ?? []) {
    for (const fr of call?.results ?? []) {
      const name = String(fr?.filename ?? "").trim();
      if (!name || seen.has(name)) continue;
      seen.add(name);
      out.push(name);
    }
  }
  return out;
}

export function archivosCitadosFromMeta(meta) {
  const direct = meta?.archivos_citados;
  if (Array.isArray(direct) && direct.length) {
    return direct.map((x) => String(x).trim()).filter(Boolean);
  }
  return archivosCitadosFromTrace(meta?.file_search);
}

export function fileSearchFromMeta(meta) {
  const fs = meta?.file_search ?? meta?.others?.file_search;
  return Array.isArray(fs) && fs.length ? fs : null;
}

export function metaHasFileSearch(meta) {
  return archivosCitadosFromMeta(meta).length > 0 || Boolean(fileSearchFromMeta(meta));
}

export function formatArchivosCitadosLabel(archivos, max = 3) {
  const list = archivos ?? [];
  if (!list.length) return "";
  if (list.length <= max) return list.join(", ");
  return `${list.slice(0, max).join(", ")} +${list.length - max}`;
}

/** Lista plana de fragmentos (chunks) desde el trace de file_search.
 *  Cada item: { callIndex, callId, filename, fileId, score, text, queries }
 *  Conserva el orden original (call → resultados). */
export function chunksFromMeta(meta) {
  const trace = fileSearchFromMeta(meta);
  if (!trace?.length) return [];
  const out = [];
  for (let ci = 0; ci < trace.length; ci += 1) {
    const call = trace[ci] || {};
    const results = Array.isArray(call?.results) ? call.results : [];
    const queries = Array.isArray(call?.queries) ? call.queries : [];
    const callId = String(call?.id ?? "").trim();
    for (let ri = 0; ri < results.length; ri += 1) {
      const fr = results[ri] || {};
      const text = String(fr?.text ?? "").trim();
      if (!text) continue;
      const filename = String(fr?.filename ?? "").trim();
      const fileId = String(fr?.file_id ?? "").trim();
      const score = typeof fr?.score === "number" ? fr.score : null;
      out.push({
        key: `${callId || ci}-${fileId || filename || ri}`,
        callIndex: ci,
        callId,
        filename,
        fileId,
        score,
        text,
        queries,
      });
    }
  }
  return out;
}

/** ¿El meta tiene chunks con texto renderizable? */
export function metaHasChunks(meta) {
  return chunksFromMeta(meta).length > 0;
}

/** Recorta un chunk para preview sin romper palabras (caracteres). */
export function chunkPreview(text, max = 360) {
  const t = String(text ?? "").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trimEnd()}…`;
}
