/** OpenAI Statuspage (mismo host que status.openai.com). Poll en home. */
export type OpenAiIncident = {
  name: string;
  status: string;
  impact: string;
  shortlink?: string;
};

export type OpenAiStatusSnapshot = {
  ok: boolean;
  indicator: "none" | "minor" | "major" | "critical" | "unknown";
  description: string;
  incidents: OpenAiIncident[];
  fetchedAt: number;
  error?: string;
  sourceUrl: string;
};

const SUMMARY_URL = "https://status.openai.com/api/v2/summary.json";
const STATUS_PAGE = "https://status.openai.com/";

function asIndicator(raw: unknown): OpenAiStatusSnapshot["indicator"] {
  const s = String(raw ?? "").toLowerCase();
  if (s === "none" || s === "minor" || s === "major" || s === "critical") return s;
  return "unknown";
}

/** Fetch Statuspage summary (CORS abierto). Preferir esto al HTML de / . */
export async function fetchOpenAiStatus(signal?: AbortSignal): Promise<OpenAiStatusSnapshot> {
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
        sourceUrl: STATUS_PAGE,
      };
    }
    const j = await res.json() as {
      status?: { indicator?: string; description?: string };
      incidents?: Array<{ name?: string; status?: string; impact?: string; shortlink?: string }>;
    };
    const incidents = (Array.isArray(j.incidents) ? j.incidents : [])
      .filter((i) => i && String(i.status || "").toLowerCase() !== "resolved")
      .map((i) => ({
        name: String(i.name || "Incidente"),
        status: String(i.status || ""),
        impact: String(i.impact || ""),
        shortlink: i.shortlink ? String(i.shortlink) : undefined,
      }));
    const indicator = asIndicator(j.status?.indicator);
    return {
      ok: true,
      indicator,
      description: String(j.status?.description || (indicator === "none" ? "All Systems Operational" : "Degraded")),
      incidents,
      fetchedAt,
      sourceUrl: STATUS_PAGE,
    };
  } catch (e) {
    if ((e as { name?: string })?.name === "AbortError") throw e;
    return {
      ok: false,
      indicator: "unknown",
      description: "Sin datos",
      incidents: [],
      fetchedAt,
      error: e instanceof Error ? e.message : String(e),
      sourceUrl: STATUS_PAGE,
    };
  }
}

export function openAiStatusIsDegraded(snap: OpenAiStatusSnapshot | null | undefined): boolean {
  if (!snap) return false;
  // Statuspage: indicator "none" = operacional (lista de incidents puede ir rezagada).
  if (snap.indicator === "none") return false;
  if (snap.indicator === "minor" || snap.indicator === "major" || snap.indicator === "critical") return true;
  return (snap.incidents?.length ?? 0) > 0;
}

/** Descripción tipica de Statuspage cuando todo está bien. */
export function openAiStatusLooksOperational(snap: OpenAiStatusSnapshot | null | undefined): boolean {
  if (!snap || snap.error) return false;
  if (snap.indicator === "none") return true;
  const d = String(snap.description || "").trim().toLowerCase();
  return /all systems operational|operacional|operational/.test(d) && snap.indicator !== "minor" && snap.indicator !== "major" && snap.indicator !== "critical";
}
