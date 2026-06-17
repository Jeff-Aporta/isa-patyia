import { getReact, getMaterialUI, CodeMirrorPanel } from "../../core/platform.ts";
import { formatConversacionPostBodyPreview } from "../../api/patyiaChatApi.ts";

const { useMemo } = getReact();

export function ChatPayloadPreview({ open, body, endpoint }) {
  const { Box, Typography, Paper } = getMaterialUI();
  const previewJson = useMemo(
    () => formatConversacionPostBodyPreview(body),
    [body],
  );
  const imageCount = Array.isArray(body.imagenes) ? body.imagenes.length : 0;

  if (!open) return null;

  return (
    <Paper
      className="paty-chat-payload-preview"
      elevation={8}
      role="region"
      aria-label="Vista previa del body POST"
    >
      <Box className="paty-chat-payload-preview__head">
        <Typography variant="caption" className="paty-chat-payload-preview__method">
          POST
        </Typography>
        <Typography variant="caption" component="code" className="paty-chat-payload-preview__path">
          {endpoint}
        </Typography>
        {imageCount > 0 ? (
          <Typography variant="caption" className="paty-chat-payload-preview__meta">
            {imageCount} imagen{imageCount !== 1 ? "es" : ""} · base64
          </Typography>
        ) : null}
      </Box>
      <Box className="paty-chat-payload-preview__body">
        <CodeMirrorPanel
          value={previewJson}
          json
          readOnly
          lineWrapping
          maxHeight="min(36vh, 280px)"
          minHeight="7rem"
          copyTitle="Copiar JSON del POST"
          enableFullPage
          fullPageTitle="Body POST · /conversacion"
          className="paty-chat-payload-preview__cm"
        />
      </Box>
      <Typography variant="caption" className="paty-chat-payload-preview__foot">
        Vista previa en vivo — el envío incluye base64 completo en <code>imagenes[]</code>.
        {" "}ISS acepta <code>data:image/(png|jpeg|webp|gif);base64,…</code> (máx. 10 imgs, ~5&nbsp;MB c/u).
      </Typography>
    </Paper>
  );
}
