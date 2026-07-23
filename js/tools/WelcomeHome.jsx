import { getReact, getMaterialUI, UI, getGlass } from "../core/platform.ts";
import { fetchOpenAiStatus, openAiStatusIsDegraded, openAiStatusLooksOperational, type OpenAiStatusSnapshot } from "../api/openaiStatusApi.ts";

const POLL_MS = 45_000;

const TOOLS = [
  {
    id: "chat",
    title: "Chat",
    blurb: "Conversaciones con Paty, logs de turnos y trazas de consulta.",
    icon: "solar:chat-round-line-bold-duotone",
    accentKey: "cyan",
    pane: null,
  },
  {
    id: "config",
    title: "Prompts",
    blurb: "Instrucciones MSSQL, borradores y publicación hacia el ISS.",
    icon: "solar:database-bold-duotone",
    accentKey: "blue",
    pane: "prompts",
  },
  {
    id: "config",
    title: "Sistema",
    blurb: "Modelos, parámetros operativos y ajustes del asistente.",
    icon: "solar:settings-bold-duotone",
    accentKey: "purple",
    pane: "sistema",
  },
  {
    id: "config",
    title: "Permisos",
    blurb: "Roles SEG, jerarquía y capacidades por usuario.",
    icon: "solar:shield-keyhole-bold-duotone",
    accentKey: "magenta",
    pane: "permisos",
  },
];

const HERO_PILLS = [
  { label: "Chat", icon: "solar:chat-round-line-bold-duotone" },
  { label: "Prompts", icon: "solar:document-text-bold-duotone" },
  { label: "Permisos", icon: "solar:lock-keyhole-bold-duotone" },
  { label: "Trazas", icon: "solar:graph-up-bold-duotone" },
];

const ILLUSTRATION_ORBITS = [
  { icon: "solar:chat-round-dots-bold-duotone", cls: "paty-welcome__orbit--a", size: 36 },
  { icon: "solar:cpu-bolt-bold-duotone", cls: "paty-welcome__orbit--b", size: 32 },
  { icon: "solar:database-bold-duotone", cls: "paty-welcome__orbit--c", size: 30 },
  { icon: "solar:shield-check-bold-duotone", cls: "paty-welcome__orbit--d", size: 28 },
];

function statusToneKey(status, degraded) {
  if (!status) return "loading";
  if (status.error) return "warn";
  if (openAiStatusLooksOperational(status)) return "ok";
  if (status.indicator === "critical" || status.indicator === "major") return "err";
  if (degraded) return "warn";
  return "ok";
}

function glassToneForStatus(tone) {
  if (tone === "ok") return "success";
  if (tone === "err") return "err";
  if (tone === "warn") return "warn";
  return "blue";
}

function statusAccent(NEON_COLORS, tone) {
  if (tone === "ok") return NEON_COLORS.green;
  if (tone === "err") return NEON_COLORS.red;
  if (tone === "warn") return NEON_COLORS.amber;
  return NEON_COLORS.cyan;
}

function statusIcon(tone) {
  if (tone === "ok") return "solar:check-circle-bold-duotone";
  if (tone === "loading") return "svg-spinners:ring-resize";
  if (tone === "err") return "solar:danger-triangle-bold-duotone";
  return "solar:danger-circle-bold-duotone";
}

/**
 * Home al pulsar marca PatyIA (URL limpia sin ?s=).
 * Neon-glass + Iconify: hero, estado OpenAI y mapa de herramientas.
 */
export function WelcomeHome({ onOpenTool }) {
  const { useState, useEffect, useRef } = getReact();
  const { Box, Typography, Button, Stack, Link, Chip } = getMaterialUI();
  const { Icon } = UI;
  const { GlassPageSurface, GlassHero, GlassCard, GlassSection, NEON_COLORS } = getGlass();
  const [status, setStatus] = useState(/** @type {OpenAiStatusSnapshot | null} */ (null));
  const [pollProgress, setPollProgress] = useState(0);
  const abortRef = useRef(/** @type {AbortController | null} */ (null));
  const cycleStartRef = useRef(Date.now());

  // Poll + anillo solo mientras Home está montada (al salir se cancela todo).
  useEffect(() => {
    let alive = true;
    let nextPullId = 0;
    let tickId = 0;

    const clearTimers = () => {
      window.clearTimeout(nextPullId);
      window.clearTimeout(tickId);
      nextPullId = 0;
      tickId = 0;
    };

    const scheduleTick = () => {
      window.clearTimeout(tickId);
      if (!alive) return;
      tickId = window.setTimeout(() => {
        if (!alive) return;
        const elapsed = Date.now() - cycleStartRef.current;
        setPollProgress(Math.min(1, Math.max(0, elapsed / POLL_MS)));
        scheduleTick();
      }, 120);
    };

    async function pull() {
      if (!alive) return;
      window.clearTimeout(nextPullId);
      cycleStartRef.current = Date.now();
      setPollProgress(0);
      const ac = new AbortController();
      abortRef.current = ac;
      try {
        const snap = await fetchOpenAiStatus(ac.signal);
        if (alive) setStatus(snap);
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
      } finally {
        if (!alive) return;
        // Próximo fetch solo si seguimos en home.
        nextPullId = window.setTimeout(() => { void pull(); }, POLL_MS);
      }
    }

    cycleStartRef.current = Date.now();
    setPollProgress(0);
    scheduleTick();
    void pull();

    return () => {
      alive = false;
      clearTimers();
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, []);

  const degraded = openAiStatusIsDegraded(status);
  const operational = openAiStatusLooksOperational(status);
  const statusTone = statusToneKey(status, degraded);
  const statusTitle = !status
    ? "Consultando OpenAI Status…"
    : status.error
      ? "No se pudo leer OpenAI Status"
      : operational || !degraded
        ? (status.description || "OpenAI operacional")
        : status.description;
  const statusDetail = !status
    ? "Actualización automática cada 45 s."
    : status.error
      ? status.error
      : operational || !degraded
        ? "Sin incidentes activos."
        : status.incidents[0]?.name || "Revisa status.openai.com para más detalle.";
  const accent = statusAccent(NEON_COLORS, statusTone);
  const secsLeft = Math.max(0, Math.ceil((1 - pollProgress) * (POLL_MS / 1000)));
  const ringR = 15.5;
  const ringC = 2 * Math.PI * ringR;
  const ringOffset = ringC * (1 - pollProgress);

  return (
    <GlassPageSurface
      className="paty-welcome"
      component="main"
      orbs
      sx={{ px: 0, pt: 0, pb: { xs: 1.5, sm: 2, md: 3 }, height: "100%", minHeight: 0 }}
    >
      <GlassHero className="paty-welcome__hero" sx={{ mb: 2.5, borderRadius: 0, width: "100%", maxWidth: "100%", overflow: "hidden" }}>
        <Box className="paty-welcome__hero-grid">
          <Box className="paty-welcome__hero-copy">
            <Typography className="paty-welcome__eyebrow" component="p">
              <Icon icon="solar:buildings-2-bold-duotone" size={16} />
              InSoft · ContaPyme
            </Typography>
            <Typography component="h1" className="paty-welcome__brand">
              PatyIA
            </Typography>
            <Typography className="paty-welcome__tagline">
              Consola de QA con IA para ContaPyme: conversaciones, configuración, permisos y trazas en un solo lugar.
            </Typography>
            <Stack direction="row" spacing={1} className="paty-welcome__pills" flexWrap="wrap" useFlexGap>
              {HERO_PILLS.map((p) => (
                <Chip
                  key={p.label}
                  size="small"
                  className="paty-welcome__pill"
                  icon={<Icon icon={p.icon} size={15} />}
                  label={p.label}
                />
              ))}
            </Stack>
            <Stack direction="row" spacing={1.5} className="paty-welcome__cta" flexWrap="wrap" useFlexGap>
              <Button
                variant="contained"
                size="large"
                className="paty-welcome__cta-primary"
                startIcon={<Icon icon="solar:chat-round-line-bold-duotone" size={20} />}
                onClick={() => onOpenTool("chat")}
              >
                Abrir Chat
              </Button>
              <Button
                variant="outlined"
                size="large"
                className="paty-welcome__cta-ghost"
                startIcon={<Icon icon="solar:settings-bold-duotone" size={20} />}
                onClick={() => onOpenTool("config", "prompts")}
              >
                Ir a Config
              </Button>
            </Stack>
          </Box>

          <Box className="paty-welcome__hero-art" aria-hidden="true">
            <Box className="paty-welcome__art-ring paty-welcome__art-ring--outer" />
            <Box className="paty-welcome__art-ring paty-welcome__art-ring--mid" />
            <Box className="paty-welcome__art-core">
              <Icon icon="ph:robot-duotone" size={88} />
            </Box>
            {ILLUSTRATION_ORBITS.map((o) => (
              <Box key={o.cls} className={`paty-welcome__orbit ${o.cls}`}>
                <Icon icon={o.icon} size={o.size} />
              </Box>
            ))}
          </Box>
        </Box>
      </GlassHero>

      <GlassCard
        className="paty-welcome__status-card"
        tone={glassToneForStatus(statusTone)}
        accent={accent}
        hover={false}
        sx={{ mb: 2.5, p: 0, overflow: "hidden" }}
        aria-live="polite"
      >
        <Box className="paty-welcome__status-row">
          <Box
            className="paty-welcome__status-icon"
            sx={{ "--pw-status-accent": accent }}
            title={`Próxima actualización en ${secsLeft}s`}
            aria-label={`Próxima actualización de OpenAI Status en ${secsLeft} segundos`}
          >
            <svg className="paty-welcome__status-ring" viewBox="0 0 36 36" aria-hidden="true">
              <circle className="paty-welcome__status-ring-track" cx="18" cy="18" r={ringR} />
              <circle
                className="paty-welcome__status-ring-prog"
                cx="18"
                cy="18"
                r={ringR}
                style={{
                  strokeDasharray: `${ringC} ${ringC}`,
                  strokeDashoffset: ringOffset,
                }}
              />
            </svg>
            <span className="paty-welcome__status-icon-glyph">
              <Icon icon={statusIcon(statusTone)} size={22} />
            </span>
          </Box>
          <Box className="paty-welcome__status-body" sx={{ flex: 1, minWidth: 0 }}>
            <Typography className="paty-welcome__status-kicker" component="p">
              OpenAI Status
            </Typography>
            <Typography className="paty-welcome__status-title" component="h2">
              {statusTitle}
            </Typography>
            <Typography className="paty-welcome__status-detail" component="p">
              {statusDetail}
            </Typography>
          </Box>
          <Link
            className="paty-welcome__status-link"
            href={status?.sourceUrl || "https://status.openai.com/"}
            target="_blank"
            rel="noreferrer"
            underline="hover"
          >
            <Icon icon="solar:link-round-bold-duotone" size={16} />
            status.openai.com
          </Link>
        </Box>
      </GlassCard>

      <GlassSection
        className="paty-welcome__tools"
        title="Herramientas"
        accent={NEON_COLORS.cyan}
        icon={<Icon icon="solar:widget-4-bold-duotone" size={18} />}
        bodySx={{ pt: 2 }}
        sx={{ mt: 0, pt: 0, borderColor: "color-mix(in srgb, currentColor 60%, transparent)", boxShadow: "none" }}
      >
        <Typography className="paty-welcome__section-lead" component="p">
          Un solo espacio de trabajo. Elige el panel; el entorno del chip define contra qué instancia pruebas.
        </Typography>
        <Box className="paty-welcome__tool-grid">
          {TOOLS.map((t) => {
            const toolAccent = NEON_COLORS[t.accentKey] || NEON_COLORS.blue;
            return (
              <GlassCard
                key={`${t.id}-${t.title}`}
                className="paty-welcome__tool isa-neon-accent-stripe"
                accent={toolAccent}
                hover
                component="button"
                type="button"
                onClick={() => onOpenTool(t.id, t.pane)}
                sx={{
                  "--stripe-accent": toolAccent,
                  "--card-accent": toolAccent,
                  p: 2,
                  textAlign: "left",
                  cursor: "pointer",
                  width: "100%",
                  border: "none",
                  font: "inherit",
                  color: "inherit",
                }}
              >
                <Box className="paty-welcome__tool-icon" sx={{ "--pw-tool-accent": toolAccent }} aria-hidden>
                  <Icon icon={t.icon} size={32} />
                </Box>
                <Typography className="paty-welcome__tool-title" component="span">
                  {t.title}
                </Typography>
                <Typography className="paty-welcome__tool-blurb" component="span">
                  {t.blurb}
                </Typography>
                <Box className="paty-welcome__tool-go" aria-hidden>
                  <Icon icon="solar:arrow-right-bold-duotone" size={18} />
                </Box>
              </GlassCard>
            );
          })}
        </Box>
      </GlassSection>
    </GlassPageSurface>
  );
}
