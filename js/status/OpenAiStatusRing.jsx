import { getReact, getMaterialUI } from "../core/platform.ts";
import {
  getOpenAiStatusView,
  openAiStatusIsDegraded,
  openAiStatusLooksOperational,
  openAiStatusTone,
  startOpenAiStatusPolling,
  subscribeOpenAiStatus,
} from "../api/openaiStatusApi.ts";

const TONE_COLOR = {
  ok: "var(--pw-green, #34d399)",
  warn: "var(--pw-amber, #fbbf24)",
  err: "var(--pw-red, #f87171)",
  loading: "var(--pw-cyan, #22d3ee)",
};

/** Suscripción al store app-wide + arranque del poll. */
export function useOpenAiStatus() {
  const { useSyncExternalStore, useEffect } = getReact();
  useEffect(() => {
    startOpenAiStatusPolling();
  }, []);
  return useSyncExternalStore(subscribeOpenAiStatus, getOpenAiStatusView, getOpenAiStatusView);
}

export function openAiStatusHeadline(status) {
  if (!status) return "Consultando OpenAI Status…";
  if (status.error) return "No se pudo leer OpenAI Status";
  const degraded = openAiStatusIsDegraded(status);
  const operational = openAiStatusLooksOperational(status);
  if (operational || !degraded) return status.description || "OpenAI operacional";
  return status.description || "OpenAI Status";
}

/**
 * Anillo de progreso = indicador de OpenAI Status.
 * Con `link`: clic abre status.openai.com; hover muestra el título de estado.
 */
export function OpenAiStatusRing({
  size = 14,
  className = "",
  children = null,
  title: titleProp,
  link = false,
}) {
  const { Tooltip } = getMaterialUI();
  const { status, progress, pollMs } = useOpenAiStatus();
  const tone = openAiStatusTone(status);
  const accent = TONE_COLOR[tone] || TONE_COLOR.loading;
  const secsLeft = Math.max(0, Math.ceil((1 - progress) * (pollMs / 1000)));
  const vb = 36;
  const r = 15.5;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - progress);
  const headline = openAiStatusHeadline(status);
  const href = status?.sourceUrl || "https://status.openai.com/";
  const tooltip = titleProp || headline;
  const aria = link
    ? `${headline}. Abrir status.openai.com`
    : `${headline}${status && !status.error ? ` · próxima actualización en ${secsLeft}s` : ""}`;

  const ring = (
    <span
      className={`paty-openai-status-ring paty-openai-status-ring--${tone}${link ? " paty-openai-status-ring--link" : ""}${className ? ` ${className}` : ""}`}
      style={{ "--oa-ring-accent": accent, width: size, height: size }}
      role={link ? undefined : "img"}
      aria-label={link ? undefined : aria}
      aria-hidden={link ? true : undefined}
    >
      <svg className="paty-openai-status-ring__svg" viewBox={`0 0 ${vb} ${vb}`} aria-hidden="true">
        <circle className="paty-openai-status-ring__track" cx="18" cy="18" r={r} />
        <circle
          className="paty-openai-status-ring__prog"
          cx="18"
          cy="18"
          r={r}
          style={{
            strokeDasharray: `${c} ${c}`,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      {children ? <span className="paty-openai-status-ring__inner">{children}</span> : null}
    </span>
  );

  if (!link) return ring;

  return (
    <Tooltip title={tooltip} enterDelay={200} describeChild>
      <a
        className="paty-openai-status-ring__anchor"
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label={aria}
        onClick={(e) => {
          e.stopPropagation();
        }}
        onKeyDown={(e) => {
          e.stopPropagation();
        }}
      >
        {ring}
      </a>
    </Tooltip>
  );
}
