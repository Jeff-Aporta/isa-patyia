/**
 * Presentación web del hilo CONVERSACION_LOG — estilo driver JSX de tickets (SectionCard, gradientes MUI).
 */
import { getMaterialUI } from "../core/runtime.ts";
import { UI } from "../core/platform.ts";
import { mdToHtml, shortId } from "./shared.jsx";
import { tokensFromUsage } from "../core/convLog.ts";

const ROLE_META = {
  user: { icon: "mdi:account-outline", title: "Usuario", accent: "#1e90ff" },
  assistant: { icon: "mdi:robot-outline", title: "PatyIA", accent: "#10b981" },
  operativa: { icon: "mdi:cog-outline", title: "Operativa", accent: "#f59e0b" },
};

function roleKey(msg) {
  if (msg.esOperativa) return "operativa";
  if (msg.esUsuario) return "user";
  return "assistant";
}

function roleTitle(msg) {
  if (msg.esOperativa) return msg.rol || "Operativa";
  if (msg.esUsuario) return "Usuario";
  return "PatyIA";
}

function SectionCard({ icon, title, accent, children, id, onMeta, metaChips }) {
  const { Paper, Stack, Typography, Box, IconButton, Tooltip } = getMaterialUI();
  const { Icon } = UI;
  const color = accent || "#1e90ff";

  return (
    <Paper
      id={id}
      elevation={0}
      sx={{
        mb: 2.5,
        borderRadius: 2.5,
        overflow: "hidden",
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: (t) =>
          t.palette.mode === "dark"
            ? "0 4px 24px rgba(0,0,0,0.25)"
            : "0 8px 32px rgba(15,23,42,0.07)",
        scrollMarginTop: 12,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: { sm: "translateY(-2px)" },
          boxShadow: (t) =>
            t.palette.mode === "dark"
              ? "0 8px 32px rgba(0,0,0,0.35)"
              : "0 16px 48px rgba(15,23,42,0.1)",
        },
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 1.5,
          borderBottom: 1,
          borderColor: "divider",
          background: (t) =>
            t.palette.mode === "dark"
              ? `linear-gradient(90deg, ${color}22, transparent 70%)`
              : `linear-gradient(90deg, ${color}14, transparent 70%)`,
          borderLeft: 4,
          borderLeftColor: color,
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap" useFlexGap>
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `linear-gradient(135deg, ${color}, ${color}99)`,
                color: "#fff",
                boxShadow: `0 4px 12px ${color}44`,
                flexShrink: 0,
              }}
            >
              <Icon icon={icon} size={18} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: -0.2, lineHeight: 1.2 }}>
                {title}
              </Typography>
              {metaChips}
            </Box>
          </Stack>
          {onMeta && (
            <Tooltip title="Trazabilidad del mensaje" arrow>
              <IconButton size="small" onClick={onMeta} aria-label="Ver trazabilidad">
                <Icon icon="mdi:information-outline" size={20} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Box>
      <Box sx={{ p: { xs: 2, sm: 2.5 } }}>{children}</Box>
    </Paper>
  );
}

function MetaChipRow({ meta }) {
  const { Stack, Chip } = getMaterialUI();
  if (!meta) return null;
  const tk = meta.tokens?.total ? meta.tokens : tokensFromUsage(meta.usage);
  const chips = [];

  if (meta.extra?.operativa_key) {
    chips.push({ key: "op", label: meta.extra.operativa_key, color: "warning", title: "consulta operativa" });
  }
  if (meta.nombre_usuario) {
    chips.push({ key: "user", label: `@${meta.nombre_usuario}`, variant: "outlined", title: "nombre_usuario" });
  }
  if (meta.nombre_usuario && meta.nombre_usado_en_respuesta === false) {
    chips.push({ key: "noname", label: "sin nombre", color: "warning", title: "Nombre enviado pero no usado" });
  }
  if (meta.nombre_usado_en_respuesta === true) {
    chips.push({ key: "named", label: "✓ nombre", color: "success", title: "Nombre usado" });
  }
  if (meta.itdconsulta) {
    chips.push({ key: "itd", label: meta.itdconsulta, variant: "outlined", title: "itdconsulta" });
  }
  if (meta.prompt_id) {
    chips.push({ key: "pmpt", label: `pmpt:${shortId(meta.prompt_id, 6, 4)}`, variant: "outlined", title: meta.prompt_id });
  }
  if (meta.model) {
    chips.push({ key: "model", label: meta.model, variant: "outlined", title: "model" });
  }
  if (meta.latency_ms != null && meta.latency_ms > 0) {
    chips.push({ key: "lat", label: `${meta.latency_ms}ms`, variant: "outlined", title: "latency_ms" });
  }
  if (tk?.total > 0) {
    chips.push({ key: "tok", label: `${tk.total}t`, color: "secondary", title: `tokens total ${tk.total}` });
  }
  if (meta.premisas?.length) {
    for (const p of meta.premisas) {
      chips.push({ key: `p-${p}`, label: p, variant: "outlined", title: `premisa: ${p}` });
    }
  }
  if (meta.stream_ok === false) {
    chips.push({ key: "stream", label: "stream ✗", color: "error", title: meta.stream_error || "stream falló" });
  }

  if (!chips.length) return null;

  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
      {chips.map((c) => (
        <Chip
          key={c.key}
          size="small"
          label={c.label}
          color={c.color}
          variant={c.variant || "filled"}
          title={c.title}
          sx={{ height: 22, "& .MuiChip-label": { px: 0.75, fontSize: "0.68rem" } }}
        />
      ))}
    </Stack>
  );
}

function MsgBody({ text }) {
  const { Typography, Box } = getMaterialUI();
  const html = mdToHtml(String(text || ""));
  return (
    <Typography
      component="div"
      variant="body1"
      sx={{
        lineHeight: 1.65,
        color: "text.primary",
        "& p": { m: 0, mb: 1.25 },
        "& p:last-child": { mb: 0 },
        "& a": { color: "primary.main", wordBreak: "break-word" },
        "& img": { maxWidth: "100%", borderRadius: 1.5, my: 1 },
        "& pre, & code": { fontFamily: '"IBM Plex Mono", monospace', fontSize: "0.85em" },
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function MensajeSection({ msg, onMeta }) {
  const { Alert } = getMaterialUI();
  const rk = roleKey(msg);
  const meta = ROLE_META[rk] || ROLE_META.assistant;
  const head = `${roleTitle(msg)}${msg.fecha ? ` · ${msg.fecha}` : ""}`;

  return (
    <SectionCard
      id={`conv-msg-${msg.idMsg}`}
      icon={meta.icon}
      title={head}
      accent={meta.accent}
      onMeta={msg.meta ? () => onMeta(msg) : undefined}
      metaChips={<MetaChipRow meta={msg.meta} />}
    >
      {msg.streamFailed && msg.streamError && (
        <Alert severity="warning" sx={{ mb: 1.5, py: 0.25, fontSize: "0.78rem" }}>
          {msg.streamError}
        </Alert>
      )}
      <MsgBody text={msg.contenido} />
    </SectionCard>
  );
}

export function ConvLogWebView({ mensajes, onMeta }) {
  const { Box, Typography } = getMaterialUI();

  if (!mensajes?.length) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 6 }}>
        Recupera por ID o pega un log para ver el hilo.
      </Typography>
    );
  }

  return (
    <Box sx={{ maxWidth: 920, mx: "auto" }}>
      {mensajes.map((m) => (
        <MensajeSection key={m.idMsg} msg={m} onMeta={onMeta} />
      ))}
    </Box>
  );
}

/** Ítems para navegador lateral (estilo lista de tickets). */
export function convLogNavItems(mensajes) {
  return (mensajes || []).map((m, i) => {
    const rk = roleKey(m);
    const meta = ROLE_META[rk] || ROLE_META.assistant;
    const preview = String(m.contenido || "").replace(/\s+/g, " ").trim().slice(0, 48);
    return {
      id: m.idMsg,
      label: `#${i + 1} · ${roleTitle(m)}`,
      secondary: preview || "(sin texto)",
      accent: meta.accent,
      icon: meta.icon,
    };
  });
}
