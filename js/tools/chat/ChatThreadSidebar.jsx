import { getMaterialUI, UI } from "../../core/platform.ts";
import { convBelongsToJwt } from "../../core/patyia-jwt.ts";
import { CHAT_SIDEBAR_W } from "./constants.ts";
import { formatTs } from "./mensajesModel.ts";
import { ChatSessionPanel } from "./ChatSessionPanel.jsx";

const {
  Box, Typography, Button, IconButton, List, ListItemButton, ListItemText,
  CircularProgress, Tooltip, Stack, Divider,
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
}) {
  return (
    <Box
      className="conv-log-sidebar paty-chat-sidebar"
      sx={{
        position: "relative",
        width: { xs: "100%", md: CHAT_SIDEBAR_W },
        flexShrink: 0,
        borderRight: { md: 0 },
        borderBottom: { xs: 1, md: 0 },
        borderColor: "divider",
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        maxHeight: { xs: "42vh", md: "none" },
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
          canInteract={canInteract}
          viewOnly={viewOnly}
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
          onClick={onNewChat}
        >
          Nueva conversación
        </Button>
      </Box>

      <Divider sx={{ my: 1 }} />

      <Box className="conv-log-sidebar-block" sx={{ flex: 1, minHeight: 0, overflow: "auto", pb: 1.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
          Conversaciones
          {needsJwt ? (
            <Typography component="span" variant="caption" sx={{ display: "block", color: "info.main", mt: 0.25 }}>
              {listScope?.nombre
                ? `${listScope.nombre} · modo lectura`
                : sessionScopeLoading
                  ? "Buscando tus conversaciones…"
                  : "Sin contacto identificado · filtra por usuario"}
            </Typography>
          ) : null}
          {viewingAuditOther ? (
            <Typography component="span" variant="caption" sx={{ display: "block", color: "warning.main", mt: 0.25 }}>
              Auditoría · {auditScope.itercero} / {auditScope.icontacto}
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
                onClick={() => onOpenConv(r.iconversacion)}
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
                  secondary={`${formatTs(r.fhultact)} · ${r.qmensajes ?? 0} msgs`}
                  primaryTypographyProps={{ sx: { pointerEvents: "none" } }}
                  secondaryTypographyProps={{ variant: "caption", noWrap: true, sx: { pointerEvents: "none" } }}
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
