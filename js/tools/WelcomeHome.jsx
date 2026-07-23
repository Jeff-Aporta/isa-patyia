import { getReact, getMaterialUI, UI } from "../core/platform.ts";
import { fetchOpenAiStatus, openAiStatusIsDegraded, type OpenAiStatusSnapshot } from "../api/openaiStatusApi.ts";

const POLL_MS = 10_000;

const TOOLS = [
  {
    id: "chat",
    title: "Chat",
    blurb: "Conversaciones con Paty, logs de turnos y trazas file_search.",
    icon: "mdi:chat-outline",
    pane: null,
  },
  {
    id: "config",
    title: "Prompts",
    blurb: "Instrucciones MSSQL, borradores y publicación hacia el ISS.",
    icon: "mdi:database-export",
    pane: "prompts",
  },
  {
    id: "config",
    title: "Sistema",
    blurb: "Modelos OpenAI, max_num_results y prompts operativos.",
    icon: "mdi:tune-vertical",
    pane: "sistema",
  },
  {
    id: "config",
    title: "Permisos",
    blurb: "Roles SEG, jerarquía y capacidades por usuario.",
    icon: "mdi:shield-key-outline",
    pane: "permisos",
  },
];

/**
 * Home al pulsar marca PatyIA (URL limpia sin ?s=).
 * Hero + mapa de herramientas + monitor OpenAI Status cada 10s.
 */
export function WelcomeHome({ onOpenTool }) {
  const { useState, useEffect, useRef } = getReact();
  const { Box, Typography, Button, Stack, Link } = getMaterialUI();
  const { Icon } = UI;
  const [status, setStatus] = useState(/** @type {OpenAiStatusSnapshot | null} */ (null));
  const [tick, setTick] = useState(0);
  const abortRef = useRef(/** @type {AbortController | null} */ (null));

  useEffect(() => {
    let alive = true;
    async function pull() {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      try {
        const snap = await fetchOpenAiStatus(ac.signal);
        if (alive) {
          setStatus(snap);
          setTick((n) => n + 1);
        }
      } catch (e) {
        if ((e as { name?: string })?.name === "AbortError") return;
        if (alive) {
          setStatus({
            ok: false,
            indicator: "unknown",
            description: "Sin datos",
            incidents: [],
            fetchedAt: Date.now(),
            error: e instanceof Error ? e.message : String(e),
            sourceUrl: "https://status.openai.com/",
          });
        }
      }
    }
    void pull();
    const id = window.setInterval(() => { void pull(); }, POLL_MS);
    return () => {
      alive = false;
      window.clearInterval(id);
      abortRef.current?.abort();
    };
  }, []);

  const degraded = openAiStatusIsDegraded(status);
  const lastAgo = status?.fetchedAt
    ? Math.max(0, Math.round((Date.now() - status.fetchedAt) / 1000))
    : null;
  const statusTone = !status
    ? "loading"
    : status.error
      ? "warn"
      : status.indicator === "critical" || status.indicator === "major"
        ? "err"
        : degraded
          ? "warn"
          : "ok";
  const statusTitle = !status
    ? "Consultando OpenAI Status…"
    : status.error
      ? "No se pudo leer OpenAI Status"
      : degraded
        ? status.description
        : "OpenAI operacional";
  const statusDetail = !status
    ? "Poll cada 10 s en esta vista."
    : status.error
      ? status.error
      : [
          status.incidents[0]?.name,
          status.indicator !== "none" ? `indicator: ${status.indicator}` : null,
          lastAgo != null ? `actualizado hace ${lastAgo}s` : null,
          `poll #${tick}`,
        ].filter(Boolean).join(" · ");

  return (
    <Box className="paty-welcome" component="main">
      <section className="paty-welcome__status-wrap" aria-live="polite">
        <article className={`paty-welcome__status-card paty-welcome__status-card--${statusTone}`}>
          <div className="paty-welcome__status-icon" aria-hidden="true">
            <Icon
              icon={
                statusTone === "ok"
                  ? "mdi:check-circle-outline"
                  : statusTone === "loading"
                    ? "mdi:loading"
                    : "mdi:alert-outline"
              }
              size={28}
            />
          </div>
          <div className="paty-welcome__status-body">
            <p className="paty-welcome__status-kicker">OpenAI Status</p>
            <h2 className="paty-welcome__status-title">{statusTitle}</h2>
            <p className="paty-welcome__status-detail">{statusDetail}</p>
          </div>
          <a
            className="paty-welcome__status-link"
            href={status?.sourceUrl || "https://status.openai.com/"}
            target="_blank"
            rel="noreferrer"
          >
            status.openai.com
          </a>
        </article>
      </section>

      <section className="paty-welcome__hero">
        <div className="paty-welcome__hero-glow" aria-hidden="true" />
        <div className="paty-welcome__hero-inner">
          <p className="paty-welcome__eyebrow">InSoft · ContaPyme</p>
          <Typography component="h1" className="paty-welcome__brand">
            PatyIA
          </Typography>
          <Typography className="paty-welcome__tagline">
            Consola de soporte con IA: chat RAG, prompts, permisos y trazas — contra staging o producción.
          </Typography>
          <Stack direction="row" spacing={1.5} className="paty-welcome__cta" flexWrap="wrap" useFlexGap>
            <Button variant="contained" size="large" onClick={() => onOpenTool("chat")}>
              Abrir Chat
            </Button>
            <Button variant="outlined" size="large" onClick={() => onOpenTool("config", "prompts")}>
              Ir a Config
            </Button>
          </Stack>
        </div>
      </section>

      <section className="paty-welcome__tools" aria-labelledby="paty-welcome-tools-title">
        <Typography id="paty-welcome-tools-title" component="h2" className="paty-welcome__section-title">
          Herramientas
        </Typography>
        <Typography className="paty-welcome__section-lead">
          Un solo shell. Elige el panel; el chip de entorno decide el ISS (local, staging o producción).
        </Typography>
        <div className="paty-welcome__tool-grid">
          {TOOLS.map((t) => (
            <button
              key={`${t.id}-${t.title}`}
              type="button"
              className="paty-welcome__tool"
              onClick={() => onOpenTool(t.id, t.pane)}
            >
              <span className="paty-welcome__tool-icon" aria-hidden="true">
                <Icon icon={t.icon} size={28} />
              </span>
              <span className="paty-welcome__tool-title">{t.title}</span>
              <span className="paty-welcome__tool-blurb">{t.blurb}</span>
            </button>
          ))}
        </div>
      </section>

      <footer className="paty-welcome__foot">
        <Typography variant="body2">
          Estado de proveedores:{" "}
          <Link href="https://status.openai.com/" target="_blank" rel="noreferrer">
            status.openai.com
          </Link>
          {" · "}
          La marca PatyIA vuelve aquí y limpia <code>?s=</code>.
        </Typography>
      </footer>
    </Box>
  );
}
