import { getMaterialUI, UI } from "../../core/platform.ts";
import { convBelongsToJwt } from "../../core/patyia-jwt.ts";
import { CHAT_SIDEBAR_W } from "./constants.ts";
import { formatTs } from "./mensajesModel.ts";
import { ChatSessionPanel } from "./ChatSessionPanel.jsx";
import { resolveOwnerNickname } from "./auditScope.ts";

const {
  Box, Typography, Button, IconButton, List, ListItemButton, ListItemText,
  CircularProgress, Tooltip, Stack, Divider, Chip,
} = getMaterialUI();
const { Icon } = UI;

function MessageSourceSwitch({ messageSource, onChange }) {
  const isProd = messageSource === "prod";
  const title = isProd ? "Modo producción (sin meta)" : "Modo logs (con meta)";
  const hint = isProd ? "Clic para ver logs" : "Clic para ver producción";
  const icon = isProd ? "mdi:earth" : "mdi:code-json";
  return (
    <Tooltip title={`${title} · ${hint}`}>
      <IconButton color="inherit" size="small" onClick={() => onChange?.(isProd ? "logs" : "prod")} aria-label={title} aria-pressed={!isProd}>
        <Icon icon={icon} size={18} />
      </IconButton>
    </Tooltip>
  );
}

export function ChatThreadSidebar({ jwt, displayScope, sessionUser, canInteract, viewOnly, jwtLoading, canSend, needsJwt, listScope, sessionScopeLoading, viewingAuditOther, auditScope, convListOwnerLabel, convListHeader, showJwtBadge, loadingList, rows, selectedId, convListMeta, convListPage, messageSource = "logs", onMessageSourceChange, onOpenJwt, onOpenAudit, onNewChat, onOpenConv, onDelete, onConvListPageChange, drawerMode = false, onClose }) {
  const handleOpenConv = (id) => { onOpenConv(id); onClose?.(); };
  const handleNewChat = () => { onNewChat(); onClose?.(); };

  return (
    <Box
      className="conv-log-sidebar paty-chat-sidebar"
      sx={{
        position: "relative",
        width: drawerMode ? "100%" : { xs: "100%", md: CHAT_SIDEBAR_W },
        flexShrink: 0,
        borderRight: drawerMode ? 0 : { md: 0 },
        borderBottom: drawerMode ? 0 : { xs: 1, md: 0 },
        borderColor: "divider",
        bgcolor: "background.paper",
        display: drawerMode ? "flex" : { xs: "none", md: "flex" },
        flexDirection: "column",
        minHeight: 0,
        height: drawerMode ? "100%" : "auto",
        maxHeight: drawerMode ? "100%" : { xs: "42vh", md: "none" },
        overflow: drawerMode ? "hidden" : "visible",
        boxSizing: "border-box",
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        className="conv-log-sidebar-block"
        sx={{ py: 1, borderBottom: 1, borderColor: "divider", flexShrink: 0 }}
      >
        <Icon icon="mdi:chat-outline" size={20} />
        <Typography variant="subtitle2" sx={{ fontWeight: 700, flex: 1 }}>
          Paty IA · staging
        </Typography>
        {onClose ? (
          <Tooltip title="Cerrar panel">
            <IconButton size="small" onClick={onClose} aria-label="Cerrar panel">
              <Icon icon="mdi:close" size={18} />
            </IconButton>
          </Tooltip>
        ) : null}
        {onMessageSourceChange ? <MessageSourceSwitch messageSource={messageSource} onChange={onMessageSourceChange} /> : null}
        <Tooltip title="Cambiar token JWT">
          <IconButton size="small" onClick={onOpenJwt} aria-label="JWT">
            <Icon icon="mdi:key-variant" size={18} />
          </IconButton>
        </Tooltip>
      </Stack>

      <Box className="conv-log-sidebar-block paty-chat-sidebar-meta" sx={{ pt: 0.75, pb: 0.75, flexShrink: 0 }}>
        <ChatSessionPanel
          claims={jwt?.claims ?? null}
          displayScope={displayScope}
          sessionUser={sessionUser}
          ownerNick={resolveOwnerNickname(jwt, sessionUser)}
          canSend={canSend}
          jwtLoading={jwtLoading}
          onOpenAudit={onOpenAudit}
        />
      </Box>

      <Box className="conv-log-sidebar-block" sx={{ pt: 1, flexShrink: 0 }}>
        <Button
          fullWidth
          variant="contained"
          size="small"
          disabled={!canSend}
          startIcon={<Icon icon="mdi:plus" size={16} />}
          onClick={handleNewChat}
        >
          Nueva conversación
        </Button>
      </Box>

      <Divider sx={{ my: 1 }} />

      <Box className="conv-log-sidebar-block paty-chat-sidebar-list-head" sx={{ flexShrink: 0, pb: 0.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontWeight: 600 }}>
          Conversaciones
          {(jwt?.token || listScope) && (convListHeader || convListOwnerLabel) ? (
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              useFlexGap
              flexWrap="wrap"
              sx={{ mt: 0.25 }}
            >
              <Typography variant="caption" sx={{ fontWeight: 500, color: "text.primary" }}>
                {convListHeader || convListOwnerLabel}
              </Typography>
              {showJwtBadge ? (
                <Chip
                  size="small"
                  label="JWT"
                  sx={{
                    height: 18,
                    fontSize: "0.62rem",
                    fontWeight: 700,
                    bgcolor: "rgba(124,58,237,0.14)",
                    color: "#6d28d9",
                    border: "1px solid rgba(124,58,237,0.35)",
                    "& .MuiChip-label": { px: 0.6, py: 0 },
                  }}
                />
              ) : null}
              {viewingAuditOther ? (
                <Typography component="span" variant="caption" sx={{ color: "warning.main", fontWeight: 600 }}>
                  · auditoría
                </Typography>
              ) : null}
            </Stack>
          ) : null}
          {needsJwt ? (
            <Typography component="span" variant="caption" sx={{ display: "block", color: "info.main", mt: 0.25 }}>
              {listScope?.nombre
                ? `${listScope.nombre} · modo lectura`
                : sessionScopeLoading
                  ? "Buscando tus conversaciones…"
                  : "Sin contacto identificado · filtra por usuario"}
            </Typography>
          ) : null}
        </Typography>
      </Box>

      <Box className="conv-log-sidebar-block paty-chat-sidebar-list-scroll" sx={{ flex: 1, minHeight: 0, overflow: "auto", pb: 1.5 }}>
        <List dense disablePadding>
          {loadingList && !rows.length && (
            <Box sx={{ py: 2, textAlign: "center" }}><CircularProgress size={22} /></Box>
          )}
          {rows.map((r) => {
            const convTitle = r.titulo || "Sin título";
            const convTip = `${r.iconversacion} · ${convTitle}`;
            return (
              <ListItemButton
                key={r.iconversacion}
                className="paty-chat-conv-item"
                selected={Number(selectedId) > 0 && Number(selectedId) === Number(r.iconversacion)}
                onClick={() => handleOpenConv(r.iconversacion)}
                title={convTip}
                aria-label={convTip}
                sx={{
                  py: 0.5,
                  px: 0,
                  minHeight: 36,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <ListItemText
                  sx={{ flex: 1, minWidth: 0, m: 0 }}
                  primary={(
                    <Stack direction="row" spacing={0.5} alignItems="center" className="paty-chat-conv-item__title" sx={{ minWidth: 0, pointerEvents: "none" }}>
                      <span className="paty-chat-conv-id-badge">
                        {r.iconversacion}
                      </span>
                      <Typography component="span" variant="body2" noWrap sx={{ fontWeight: 600, minWidth: 0, flex: 1 }}>
                        {convTitle}
                      </Typography>
                    </Stack>
                  )}
                  secondary={(
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.secondary"
                      noWrap
                      className="paty-chat-conv-item__meta"
                      sx={{ pointerEvents: "none", display: "block", lineHeight: 1.3, opacity: 0.5 }}
                    >
                      {`${formatTs(r.fhultact)} · ${r.qmensajes ?? 0} msgs`}
                    </Typography>
                  )}
                  slotProps={{
                    primary: { sx: { pointerEvents: "none", mb: 0.2 } },
                    secondary: { sx: { pointerEvents: "none", m: 0, opacity: 0.5 } },
                  }}
                />
                {canSend && convBelongsToJwt(r, jwt.claims) ? (
                  <IconButton size="small" color="error" aria-label="Eliminar" className="paty-chat-conv-item__delete" onClick={(e) => { e.stopPropagation(); onDelete(r.iconversacion); }} sx={{ flexShrink: 0, mr: 0 }}>
                    <Icon icon="mdi:delete-outline" size={16} />
                  </IconButton>
                ) : null}
              </ListItemButton>
            );
          })}
        </List>
        {convListMeta && convListMeta.pages > 1 ? (
          <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="space-between" sx={{ mt: 1, px: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {convListMeta.total.toLocaleString("es-CO")} · pág. {convListMeta.page}/{convListMeta.pages}
            </Typography>
            <Stack direction="row" spacing={0.25}>
              <IconButton
                size="small"
                aria-label="Página anterior"
                disabled={loadingList || convListPage <= 1}
                onClick={() => onConvListPageChange((p) => Math.max(1, p - 1))}
              >
                <Icon icon="mdi:chevron-left" size={18} />
              </IconButton>
              <IconButton
                size="small"
                aria-label="Página siguiente"
                disabled={loadingList || convListPage >= convListMeta.pages}
                onClick={() => onConvListPageChange((p) => p + 1)}
              >
                <Icon icon="mdi:chevron-right" size={18} />
              </IconButton>
            </Stack>
          </Stack>
        ) : null}
      </Box>
    </Box>
  );
}
