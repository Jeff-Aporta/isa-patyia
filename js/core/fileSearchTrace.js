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
