import { getReact, getMaterialUI, UI } from "../../core/platform.ts";
import { jwtUserDisplayName, jwtUserShortName } from "../../core/patyia-jwt.ts";
import { buildUserAvatarUrl } from "../../core/patyia.ts";

const { useState, useEffect, useMemo } = getReact();
const { Box, Typography, CircularProgress } = getMaterialUI();
const { Icon } = UI;

export function ChatSessionPanel({
  claims,
  displayScope,
  sessionUser,
  jwtActingAs,
  jwtActingAsDisplayName,
  canAdminJwt,
  canSend,
  jwtLoading,
  onOpenAudit,
}) {
  const bdName = claims
    ? jwtUserDisplayName(claims)
    : String(displayScope?.nombre ?? "").trim();
  const actingName = String(jwtActingAsDisplayName ?? "").trim();
  const name = jwtActingAs && actingName
    ? actingName
    : claims
      ? (jwtUserShortName(claims) || "Usuario JWT")
      : (displayScope?.nombre || sessionUser || "ISA PatyIA");
  const fullName = (jwtActingAs && actingName) ? actingName : (bdName || name);
  const tercero = claims?.itercero ?? displayScope?.itercero;
  const contacto = claims?.icontacto ?? displayScope?.icontacto;
  const avatarLabel = fullName || name;
  const avatarUrl = useMemo(() => buildUserAvatarUrl(avatarLabel, 72), [avatarLabel]);
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
        <Typography className="paty-chat-session__name" title={fullName || name}>
          {fullName || name}
        </Typography>
        {(tercero || contacto) && (
          <Typography className="paty-chat-session__ids" variant="caption">
            {tercero || ""}
            {tercero && contacto ? " · " : ""}
            {contacto || ""}
          </Typography>
        )}
        <Box className="paty-chat-session__flags" sx={{ flexWrap: "wrap", gap: 0.5 }}>
          {canSend ? (
            <span className="paty-chat-session__flag paty-chat-session__flag--live">
              <span className="status-dot status-dot--inline status-dot--green" aria-hidden />
              Interactivo
            </span>
          ) : jwtLoading ? (
            <span className="paty-chat-session__flag">
              <CircularProgress size={10} sx={{ mr: 0.5 }} />
              Token…
            </span>
          ) : (
            <span className="paty-chat-session__flag paty-chat-session__flag--readonly">
              <span className="status-dot status-dot--inline status-dot--orange" aria-hidden />
              Solo lectura
            </span>
          )}
        </Box>
        {canAdminJwt && (
          <Typography variant="caption" sx={{ display: "block", mt: 0.35, color: "secondary.main", lineHeight: 1.35 }}>
            Admin · acceso a JWT de otros usuarios
          </Typography>
        )}
      </Box>
    </Box>
  );
}
