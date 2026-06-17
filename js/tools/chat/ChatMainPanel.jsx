import { getMaterialUI, UI } from "../../core/platform.ts";
import { ConvLogWebView } from "../../ui/ConvLogWebView.jsx";
import { convLogSurfaceSx } from "../../core/convLog.ts";
import { ButtonIconify } from "../../ui/shared.jsx";
import { ChatComposer } from "./ChatComposer.jsx";

const {
  Box, Typography, Button, IconButton, CircularProgress, Tooltip, Alert, Stack,
} = getMaterialUI();
const { Icon } = UI;

export function ChatMainPanel({
  jwt,
  needsJwt,
  viewingAuditOther,
  selectedId,
  detail,
  canSend,
  loadingThread,
  sending,
  showThread,
  logError,
  displayMensajes,
  chatUserName,
  ratingMsgId,
  threadScrollRef,
  onThreadScroll,
  onOpenJwt,
  onClearAuditFilter,
  onRefreshConv,
  draft,
  images,
  payloadPreviewOpen,
  postBodyPreview,
  inputRef,
  fileInputRef,
  onDraftChange,
  onPaste,
  onSend,
  onTogglePayloadPreview,
  onAttachImagesClick,
  onAttachImagesChange,
  onRemoveImage,
  onMeta,
  onRateMessage,
}) {
  return (
    <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column" }}>
      {needsJwt && (
        <Alert
          severity="info"
          sx={{ mx: 2, mt: 1, flexShrink: 0 }}
          action={(
            <Button color="inherit" size="small" onClick={onOpenJwt}>
              Configurar JWT
            </Button>
          )}
        >
          Modo lectura — puedes explorar conversaciones. Configura el JWT de{" "}
          <Typography component="a" href="https://www.contapyme.com/soporte-staging/" target="_blank" rel="noreferrer" variant="inherit">
            soporte-staging
          </Typography>
          {" "}para enviar mensajes.
        </Alert>
      )}
      {viewingAuditOther && (
        <Alert severity="info" sx={{ mx: 2, mt: 1, flexShrink: 0 }} action={(
          <IconButton
            color="inherit"
            size="small"
            aria-label={jwt?.claims?.itercero ? "Volver a mi JWT" : "Ver recientes"}
            onClick={onClearAuditFilter}
          >
            <Icon icon="mdi:close" size={18} />
          </IconButton>
        )}>
          Viendo conversaciones de otro usuario — lectura.
        </Alert>
      )}
      {(selectedId || detail) && (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ px: 2, py: 0.75, borderBottom: 1, borderColor: "divider", flexShrink: 0, bgcolor: "background.paper" }}
        >
          <Box sx={{ flex: 1 }} />
          <Tooltip title="Actualizar conversación" arrow>
            <span>
              <ButtonIconify
                icon="mdi:refresh"
                title="Actualizar"
                onClick={onRefreshConv}
                disabled={loadingThread}
                busy={loadingThread}
              />
            </span>
          </Tooltip>
        </Stack>
      )}

      {!showThread ? (
        <Box sx={convLogSurfaceSx({ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0 })}>
          <Box sx={{ textAlign: "center", maxWidth: 420, p: 2, borderRadius: 2, border: 1, borderColor: "divider", borderStyle: "dashed" }}>
            <Typography variant="body1">
              {canSend
                ? "Escribe un mensaje abajo para iniciar una conversación."
                : needsJwt
                  ? "Selecciona una conversación del listado o configura JWT para chatear."
                  : "Selecciona una conversación o crea una nueva."}
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box
          ref={threadScrollRef}
          onScroll={onThreadScroll}
          sx={{ ...convLogSurfaceSx(), flex: 1, minHeight: 0 }}
        >
          {loadingThread && !sending && !displayMensajes.length && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          )}
          {logError && (
            <Alert severity="warning" sx={{ mb: 2 }}>{logError}</Alert>
          )}
          {displayMensajes.length > 0 && (
            <ConvLogWebView
              mensajes={displayMensajes}
              onMeta={onMeta}
              compactMeta
              chatUserName={chatUserName}
              streamingMsgId={sending ? "stream-live" : null}
              emptyHint="Sin mensajes en esta conversación."
              canRate={canSend && Boolean(jwt?.token)}
              onRateMessage={onRateMessage}
              ratingMsgId={ratingMsgId}
              threadKey={selectedId ?? "draft"}
            />
          )}
        </Box>
      )}

      <ChatComposer
        canSend={canSend}
        sending={sending}
        draft={draft}
        images={images}
        payloadPreviewOpen={payloadPreviewOpen}
        postBodyPreview={postBodyPreview}
        inputRef={inputRef}
        fileInputRef={fileInputRef}
        onDraftChange={onDraftChange}
        onPaste={onPaste}
        onSend={onSend}
        onTogglePayloadPreview={onTogglePayloadPreview}
        onAttachImagesClick={onAttachImagesClick}
        onAttachImagesChange={onAttachImagesChange}
        onRemoveImage={onRemoveImage}
      />

      {!canSend && (selectedId || detail) && (
        <Box className="paty-chat-compose-readonly">
          Modo lectura.
        </Box>
      )}
    </Box>
  );
}
