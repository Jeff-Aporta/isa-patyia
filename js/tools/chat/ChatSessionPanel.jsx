import { getReact, getMaterialUI, UI } from "../../core/platform.ts";
import { buildUserAvatarUrl } from "../../core/patyia.ts";

const { useState, useEffect, useMemo } = getReact();
const { Box, Typography, CircularProgress, Chip } = getMaterialUI();
const { Icon } = UI;

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
          {canSend ? (
            <Chip
              size="small"
              label="Interactivo"
              icon={<span className="status-dot status-dot--inline status-dot--green" aria-hidden />}
              className="paty-chat-session__badge paty-chat-session__badge--live"
            />
          ) : jwtLoading ? (
            <Chip
              size="small"
              label="Token…"
              icon={<CircularProgress size={10} color="inherit" />}
              className="paty-chat-session__badge paty-chat-session__badge--loading"
            />
          ) : (
            <Chip
              size="small"
              label="Solo lectura"
              icon={<span className="status-dot status-dot--inline status-dot--orange" aria-hidden />}
              className="paty-chat-session__badge paty-chat-session__badge--readonly"
            />
          )}
        </Box>
      </Box>
      <Box className="paty-chat-session__action" aria-hidden>
        <Icon icon="mdi:account-filter-outline" size={17} />
      </Box>
    </Box>
  );
}
