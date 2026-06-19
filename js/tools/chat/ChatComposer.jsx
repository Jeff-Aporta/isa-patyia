import { getReact, getMaterialUI, UI } from "../../core/platform.ts";
import { PATYIA_API_BASE } from "../../core/patyia-jwt.ts";
import { MAX_CHAT_IMAGES } from "./constants.ts";
import { ChatPayloadPreview } from "./ChatPayloadPreview.jsx";
import { ImageLightboxDialog } from "../../ui/ImageLightboxDialog.jsx";

const { useState } = getReact();
const {
  Box, Button, IconButton, TextField, CircularProgress, Tooltip,
} = getMaterialUI();
const { Icon } = UI;

export function ChatComposer({ canSend, sending, draft, images, payloadPreviewOpen, postBodyPreview, inputRef, fileInputRef, onDraftChange, onPaste, onSend, onTogglePayloadPreview, onAttachImagesClick, onAttachImagesChange, onRemoveImage }) {
  const [lightboxSrc, setLightboxSrc] = useState(null);

  if (!canSend) return null;

  return (
    <Box className="paty-chat-compose">
      <ChatPayloadPreview
        open={payloadPreviewOpen}
        body={postBodyPreview}
        endpoint={`${PATYIA_API_BASE}/conversacion`}
        onClose={onTogglePayloadPreview}
      />
      {images.length > 0 && (
        <Box className="paty-chat-image-previews">
          {images.map((img, idx) => (
            <figure key={idx}>
              <button
                type="button"
                className="paty-chat-image-previews__thumb-btn"
                aria-label={`Ver ${img.name || "adjunto"} en tamaño completo`}
                onClick={() => setLightboxSrc(img.dataUrl)}
              >
                <img
                  src={img.dataUrl}
                  alt={img.name || "adjunto"}
                  onError={(e) => {
                    e.currentTarget.classList.add("paty-chat-image-previews__img--broken");
                    e.currentTarget.removeAttribute("src");
                  }}
                />
              </button>
              <button type="button" className="paty-chat-image-previews__remove" aria-label="Quitar" onClick={() => onRemoveImage(idx)}>×</button>
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
            <IconButton color="inherit" className={`paty-chat-payload-btn${payloadPreviewOpen ? " paty-chat-payload-btn--active" : ""}`} aria-label={payloadPreviewOpen ? "Ocultar vista previa JSON" : "Ver vista previa JSON del POST"} aria-pressed={payloadPreviewOpen} disabled={sending} onClick={onTogglePayloadPreview} size="small">
              <Icon icon="mdi:code-json" size={22} />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Adjuntar imagen (se envía en base64)">
          <span>
            <IconButton color="inherit" className="paty-chat-attach-btn" aria-label="Adjuntar imagen" disabled={sending || images.length >= MAX_CHAT_IMAGES} onClick={onAttachImagesClick} size="small">
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
      <ImageLightboxDialog open={Boolean(lightboxSrc)} src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </Box>
  );
}
