// js/api/openaiStatusApi.ts
var SUMMARY_URL = "https://status.openai.com/api/v2/summary.json";
var STATUS_PAGE = "https://status.openai.com/";
function asIndicator(raw) {
  const s = String(raw ?? "").toLowerCase();
  if (s === "none" || s === "minor" || s === "major" || s === "critical") return s;
  return "unknown";
}
async function fetchOpenAiStatus(signal) {
  const fetchedAt = Date.now();
  try {
    const res = await fetch(SUMMARY_URL, { cache: "no-store", signal });
    if (!res.ok) {
      return {
        ok: false,
        indicator: "unknown",
        description: `HTTP ${res.status}`,
        incidents: [],
        fetchedAt,
        error: `No se pudo leer status.openai.com (${res.status})`,
        sourceUrl: STATUS_PAGE
      };
    }
    const j = await res.json();
    const incidents = (Array.isArray(j.incidents) ? j.incidents : []).filter((i) => i && String(i.status || "").toLowerCase() !== "resolved").map((i) => ({
      name: String(i.name || "Incidente"),
      status: String(i.status || ""),
      impact: String(i.impact || ""),
      shortlink: i.shortlink ? String(i.shortlink) : void 0
    }));
    const indicator = asIndicator(j.status?.indicator);
    return {
      ok: true,
      indicator,
      description: String(j.status?.description || (indicator === "none" ? "All Systems Operational" : "Degraded")),
      incidents,
      fetchedAt,
      sourceUrl: STATUS_PAGE
    };
  } catch (e) {
    if (e?.name === "AbortError") throw e;
    return {
      ok: false,
      indicator: "unknown",
      description: "Sin datos",
      incidents: [],
      fetchedAt,
      error: e instanceof Error ? e.message : String(e),
      sourceUrl: STATUS_PAGE
    };
  }
}
function openAiStatusIsDegraded(snap) {
  if (!snap) return false;
  if (snap.indicator === "none") return false;
  if (snap.indicator === "minor" || snap.indicator === "major" || snap.indicator === "critical") return true;
  return (snap.incidents?.length ?? 0) > 0;
}
function openAiStatusLooksOperational(snap) {
  if (!snap || snap.error) return false;
  if (snap.indicator === "none") return true;
  const d = String(snap.description || "").trim().toLowerCase();
  return /all systems operational|operacional|operational/.test(d) && snap.indicator !== "minor" && snap.indicator !== "major" && snap.indicator !== "critical";
}
export {
  fetchOpenAiStatus,
  openAiStatusIsDegraded,
  openAiStatusLooksOperational
};
