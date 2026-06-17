import { getMaterialUI, UI } from "../../core/platform.ts";
import { PATYIA_API_BASE } from "../../core/patyia-jwt.ts";
import { MAX_CHAT_IMAGES } from "./constants.ts";
import { ChatPayloadPreview } from "./ChatPayloadPreview.jsx";

const {
  Box, Button, IconButton, TextField, CircularProgress, Tooltip,
} = getMaterialUI();
const { Icon } = UI;

export function ChatComposer({
  canSend,
  sending,
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
}) {
  if (!canSend) return null;

  return (
    <Box className="paty-chat-compose">
      <ChatPayloadPreview
        open={payloadPreviewOpen}
        body={postBodyPreview}
        endpoint={`${PATYIA_API_BASE}/conversacion`}
      />
      {images.length > 0 && (
        <Box className="paty-chat-image-previews">
          {images.map((img, idx) => (
            <figure key={idx}>
              <img src={img.dataUrl} alt={img.name || "adjunto"} />
              <button type="button" aria-label="Quitar" onClick={() => onRemoveImage(idx)}>×</button>
            </figure>
          ))}
        </Box>
      )}
      <Box className="paty-chat-input-wrap">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
          multiple
          hidden
          aria-hidden
          tabIndex={-1}
          onChange={onAttachImagesChange}
        />
        <Tooltip title={payloadPreviewOpen ? "Ocultar body POST" : "Ver body POST (JSON en vivo)"}>
          <span>
            <IconButton
              className={`paty-chat-payload-btn${payloadPreviewOpen ? " paty-chat-payload-btn--active" : ""}`}
              aria-label={payloadPreviewOpen ? "Ocultar vista previa JSON" : "Ver vista previa JSON del POST"}
              aria-pressed={payloadPreviewOpen}
              disabled={sending}
              onClick={onTogglePayloadPreview}
              size="small"
            >
              <Icon icon="mdi:code-json" size={22} />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Adjuntar imagen (se envía en base64)">
          <span>
            <IconButton
              className="paty-chat-attach-btn"
              aria-label="Adjuntar imagen"
              disabled={sending || images.length >= MAX_CHAT_IMAGES}
              onClick={onAttachImagesClick}
              size="small"
            >
              <Icon icon="mdi:image-plus-outline" size={22} />
            </IconButton>
          </span>
        </Tooltip>
        <TextField
          inputRef={inputRef}
          fullWidth
          multiline
          maxRows={6}
          size="small"
          placeholder="Escribe tu consulta… (Ctrl+V o adjuntar imagen)"
          value={draft}
          onChange={onDraftChange}
          onPaste={onPaste}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); }
          }}
          disabled={sending}
        />
        <Button variant="contained" disabled={sending || (!draft.trim() && !images.length)} onClick={onSend}>
          {sending ? <CircularProgress size={20} color="inherit" /> : "Enviar"}
        </Button>
      </Box>
    </Box>
  );
}
