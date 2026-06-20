import { getMaterialUI, UI } from "../../core/platform.ts";
import { convLogSurfaceSx } from "../../core/convLog.ts";
import { ConvLogThread } from "../../ui/ConvLogThread.jsx";
import { ButtonIconify } from "../../ui/shared.jsx";
import { ChatComposer } from "./ChatComposer.jsx";

const {
  Box, Typography, Button, IconButton, Tooltip, Alert, Stack,
} = getMaterialUI();
const { Icon } = UI;

export function ChatMainPanel({ jwt, needsJwt, viewingAuditOther, selectedId, detail, canSend, loadingThread, sending, showThread, logError, displayMensajes, chatUserName, ratingMsgId, threadScrollRef, onThreadScroll, onOpenJwt, onClearAuditFilter, onRefreshConv, draft, images, audios, isRecording, payloadPreviewOpen, postBodyPreview, inputRef, attachInputRef, onDraftChange, onPaste, onSend, onTogglePayloadPreview, onAttachClick, onAttachChange, onToggleVoiceRecord, onRemoveImage, onRemoveAudio, onMeta, onRateMessage, onOpenSidebar, messageSource = "logs" }) {
  const isProdView = messageSource === "prod";
  return (
    <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column" }}>
      {onOpenSidebar ? (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          className="paty-chat-main-toolbar"
          sx={{
            px: 1,
            py: 0.5,
            minHeight: 40,
            borderBottom: 1,
            borderColor: "divider",
            flexShrink: 0,
            bgcolor: "background.paper",
          }}
        >
          <Tooltip title="Conversaciones" arrow>
            <IconButton size="small" onClick={onOpenSidebar} aria-label="Abrir conversaciones">
              <Icon icon="mdi:menu-open" size={20} />
            </IconButton>
          </Tooltip>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, flex: 1, minWidth: 0 }} noWrap>
            Conversaciones
          </Typography>
          {(selectedId || detail) ? (
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
          ) : null}
        </Stack>
      ) : (selectedId || detail) ? (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          className="paty-chat-main-toolbar paty-chat-main-toolbar--desktop"
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
      ) : null}
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

      {!showThread ? (
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0, ...convLogSurfaceSx({ flex: 1 }) }}>
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
        <ConvLogThread
          scrollRef={threadScrollRef}
          onScroll={onThreadScroll}
          mensajes={displayMensajes}
          onMeta={isProdView ? undefined : onMeta}
          compactMeta={false}
          showUsageStats={!isProdView}
          chatUserName={chatUserName}
          surfaceClassName="paty-chat-thread-surface"
          streamingMsgId={sending ? "stream-live" : null}
          emptyHint="Sin mensajes en esta conversación."
          canRate={canSend && Boolean(jwt?.token)}
          onRateMessage={onRateMessage}
          ratingMsgId={ratingMsgId}
          threadKey={selectedId ?? "draft"}
          loading={loadingThread}
          loadingOnlyWhenEmpty={!sending}
          error={logError}
        />
      )}

      <ChatComposer
        canSend={canSend}
        sending={sending}
        draft={draft}
        images={images}
        audios={audios}
        isRecording={isRecording}
        payloadPreviewOpen={payloadPreviewOpen}
        postBodyPreview={postBodyPreview}
        inputRef={inputRef}
        attachInputRef={attachInputRef}
        onDraftChange={onDraftChange}
        onPaste={onPaste}
        onSend={onSend}
        onTogglePayloadPreview={onTogglePayloadPreview}
        onAttachClick={onAttachClick}
        onAttachChange={onAttachChange}
        onToggleVoiceRecord={onToggleVoiceRecord}
        onRemoveImage={onRemoveImage}
        onRemoveAudio={onRemoveAudio}
      />

      {!canSend && (selectedId || detail) && (
        <Box className="paty-chat-compose-readonly">
          Modo lectura.
        </Box>
      )}
    </Box>
  );
}
