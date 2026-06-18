import { getMaterialUI, UI } from "../../core/platform.ts";
import { convBelongsToJwt } from "../../core/patyia-jwt.ts";
import { CHAT_SIDEBAR_W } from "./constants.ts";
import { formatTs } from "./mensajesModel.ts";
import { ChatSessionPanel } from "./ChatSessionPanel.jsx";

const {
  Box, Typography, Button, IconButton, List, ListItemButton, ListItemText,
  CircularProgress, Tooltip, Stack, Divider, Chip,
} = getMaterialUI();
const { Icon } = UI;

export function ChatThreadSidebar({
  jwt,
  displayScope,
  sessionUser,
  canInteract,
  viewOnly,
  jwtLoading,
  canSend,
  needsJwt,
  listScope,
  sessionScopeLoading,
  viewingAuditOther,
  auditScope,
  canAdminJwt,
  convListOwnerLabel,
  convListHeader,
  showJwtBadge,
  loadingList,
  rows,
  selectedId,
  convListMeta,
  convListPage,
  onOpenJwt,
  onOpenAudit,
  onNewChat,
  onOpenConv,
  onDelete,
  onConvListPageChange,
  drawerMode = false,
  onClose,
}) {
  const handleOpenConv = (id) => {
    onOpenConv(id);
    onClose?.();
  };

  const handleNewChat = () => {
    onNewChat();
    onClose?.();
  };

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
          jwtActingAs={jwt?.actingAsUsername ?? null}
          jwtActingAsDisplayName={jwt?.actingAsDisplayName ?? null}
          canAdminJwt={canAdminJwt}
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

      <Box className="conv-log-sidebar-block" sx={{ flex: 1, minHeight: 0, overflow: "auto", pb: 1.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block", fontWeight: 600 }}>
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
          {canAdminJwt && (
            <Typography component="span" variant="caption" sx={{ display: "block", color: "secondary.main", mt: 0.25, fontSize: "0.68rem" }}>
              Admin · puedes activar JWT de otros usuarios
            </Typography>
          )}
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
                selected={selectedId === r.iconversacion}
                onClick={() => handleOpenConv(r.iconversacion)}
                title={convTip}
                aria-label={convTip}
                sx={{ py: 0.5, pl: 1.5, pr: 1, minHeight: 36, "&.Mui-selected": { bgcolor: "action.selected" } }}
              >
                <ListItemText
                  primary={(
                    <Stack direction="row" spacing={0.5} alignItems="center" className="paty-chat-conv-item__title" sx={{ minWidth: 0, pointerEvents: "none" }}>
                      <span className="paty-chat-conv-id-badge">
                        {r.iconversacion}
                      </span>
                      <Typography component="span" variant="body2" noWrap sx={{ fontWeight: 600, minWidth: 0 }}>
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
                      sx={{ pointerEvents: "none", display: "block", lineHeight: 1.35 }}
                    >
                      {`${formatTs(r.fhultact)} · ${r.qmensajes ?? 0} msgs`}
                    </Typography>
                  )}
                  slotProps={{ primary: { sx: { pointerEvents: "none" } } }}
                />
                {canSend && convBelongsToJwt(r, jwt.claims) && (
                  <IconButton
                    size="small"
                    edge="end"
                    aria-label="Eliminar"
                    onClick={(e) => { e.stopPropagation(); onDelete(r.iconversacion); }}
                  >
                    <Icon icon="mdi:delete-outline" size={16} />
                  </IconButton>
                )}
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
