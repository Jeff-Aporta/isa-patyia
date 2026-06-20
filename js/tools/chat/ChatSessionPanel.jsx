import { getReact, getMaterialUI, UI } from "../../core/platform.ts";
import { buildUserAvatarUrl } from "../../core/patyia.ts";

const { useState, useEffect, useMemo } = getReact();
const { Box, Typography, CircularProgress, Chip } = getMaterialUI();
const { Icon } = UI;

const SESSION_MODE_CHIP_SX = {
  live: {
    pl: 0.35,
    color: "#86efac",
    bgcolor: "rgba(34, 197, 94, 0.12)",
    border: "1px solid rgba(74, 222, 128, 0.35)",
    "& .MuiChip-icon": { color: "#4ade80 !important", ml: 0.55 },
    "& .MuiChip-label": { fontWeight: 700, letterSpacing: "0.03em", pl: 0.55 },
  },
  readonly: {
    pl: 0.35,
    color: "#fde68a",
    bgcolor: "rgba(251, 191, 36, 0.1)",
    border: "1px solid rgba(251, 191, 36, 0.35)",
    "& .MuiChip-icon": { color: "#facc15 !important", ml: 0.55 },
    "& .MuiChip-label": { fontWeight: 700, letterSpacing: "0.03em", pl: 0.55 },
  },
  loading: {
    pl: 0.35,
    color: "#94a3b8",
    bgcolor: "rgba(148, 163, 184, 0.1)",
    border: "1px solid rgba(148, 163, 184, 0.28)",
    "& .MuiChip-icon": { ml: 0.55 },
    "& .MuiChip-label": { pl: 0.55 },
  },
};

function SessionModeChip({ canSend, jwtLoading }) {
  if (canSend) {
    return (
      <Chip
        size="small"
        variant="outlined"
        label="Interactivo"
        icon={<Icon icon="mdi:chat-processing-outline" size={14} aria-hidden />}
        className="paty-chat-session__badge paty-chat-session__badge--live"
        sx={SESSION_MODE_CHIP_SX.live}
      />
    );
  }
  if (jwtLoading) {
    return (
      <Chip
        size="small"
        variant="outlined"
        label="Token…"
        icon={<CircularProgress size={10} color="inherit" />}
        className="paty-chat-session__badge paty-chat-session__badge--loading"
        sx={SESSION_MODE_CHIP_SX.loading}
      />
    );
  }
  return (
    <Chip
      size="small"
      variant="outlined"
      label="Solo lectura"
      icon={<Icon icon="mdi:eye-outline" size={14} aria-hidden />}
      className="paty-chat-session__badge paty-chat-session__badge--readonly"
      sx={SESSION_MODE_CHIP_SX.readonly}
    />
  );
}

export function ChatSessionPanel({ claims, displayScope, sessionUser: _sessionUser, ownerNick, canSend, jwtLoading, onOpenAudit }) {
  const nick = String(ownerNick ?? "").trim().toUpperCase();
  const tercero = claims?.itercero ?? displayScope?.itercero;
  const contacto = claims?.icontacto ?? displayScope?.icontacto;
  const codes = [tercero, contacto].filter(Boolean).join(" · ");
  const primaryLabel = nick || codes || "ISA PatyIA";
  const avatarUrl = useMemo(() => buildUserAvatarUrl(primaryLabel, 72), [primaryLabel]);
  const [avatarOk, setAvatarOk] = useState(true);
  useEffect(() => { setAvatarOk(true); }, [avatarUrl]);

  return (
    <Box
      className="paty-chat-session paty-chat-session--clickable"
      role="button"
      tabIndex={0}
      sx={{ cursor: "pointer" }}
      title="Filtrar conversaciones por usuario"
      aria-label="Filtrar conversaciones por usuario"
      onClick={() => onOpenAudit?.()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenAudit?.();
        }
      }}
    >
      <Box className="paty-chat-session__avatar" aria-hidden>
        {avatarOk ? (
          <img
            className="paty-chat-session__avatar-img"
            src={avatarUrl}
            alt=""
            width={36}
            height={36}
            loading="lazy"
            decoding="async"
            onError={() => setAvatarOk(false)}
          />
        ) : (
          <Icon icon="mdi:account-circle" size={28} />
        )}
      </Box>
      <Box className="paty-chat-session__body">
        <Typography className="paty-chat-session__name" title={primaryLabel}>
          {primaryLabel}
        </Typography>
        <Box className="paty-chat-session__flags" sx={{ flexWrap: "wrap", gap: 0.5 }}>
          <SessionModeChip canSend={canSend} jwtLoading={jwtLoading} />
        </Box>
      </Box>
      <Box className="paty-chat-session__action" aria-hidden>
        <Icon icon="mdi:account-filter-outline" size={17} />
      </Box>
    </Box>
  );
}
