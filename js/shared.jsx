const {
  Dialog, DialogTitle, DialogContent,
} = MaterialUI;

const theme = MaterialUI.createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#3b82f6" },
    secondary: { main: "#14b8a6" },
    background: { default: "#0f172a", paper: "#1e293b" },
  },
  typography: { fontFamily: '"IBM Plex Sans", system-ui, sans-serif' },
});

function shortId(s, head = 10, tail = 4) {
  if (!s) return "";
  return s.length <= head + tail + 1 ? s : `${s.slice(0, head)}…${s.slice(-tail)}`;
}

function mdToHtml(src) {
  if (!src) return "";
  try {
    if (typeof marked !== "undefined") {
      marked.setOptions({ gfm: true, breaks: true });
      return marked.parse(src, { async: false });
    }
  } catch (_) { /* ignore */ }
  return String(src)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br />");
}

function MetaBadges({ meta, onInfo }) {
  if (!meta) return null;
  const tk = meta.tokens?.total ? meta.tokens : PatyConvLog.tokensFromUsage(meta.usage);
  return (
    <span className="msg-badges">
      {meta.extra?.operativa_key && (
        <span className="badge badge-operativa" title="consulta operativa">{meta.extra.operativa_key}</span>
      )}
      {meta.nombre_usuario && (
        <span className="badge badge-nombre" title="nombre_usuario">@{meta.nombre_usuario}</span>
      )}
      {meta.nombre_usuario && meta.nombre_usado_en_respuesta === false && (
        <span className="badge badge-warn" title="Nombre enviado pero no usado">sin nombre</span>
      )}
      {meta.nombre_usado_en_respuesta === true && (
        <span className="badge badge-ok" title="Nombre usado">✓ nombre</span>
      )}
      {meta.itdconsulta && (
        <span className="badge badge-itd" title="itdconsulta">{meta.itdconsulta}</span>
      )}
      {meta.prompt_id && (
        <span className="badge badge-pmpt" title={`prompt_id: ${meta.prompt_id}`}>
          pmpt:{shortId(meta.prompt_id, 6, 4)}
        </span>
      )}
      {meta.model && (
        <span className="badge badge-model" title={`model: ${meta.model}`}>{meta.model}</span>
      )}
      {meta.latency_ms != null && meta.latency_ms > 0 && (
        <span className="badge badge-latency" title="latency_ms">{meta.latency_ms}ms</span>
      )}
      {tk?.total > 0 && (
        <span className="badge badge-tokens" title={`tokens total ${tk.total}`}>{tk.total}t</span>
      )}
      {meta.premisas?.map((p) => (
        <span key={p} className="badge badge-premisa" title={`premisa: ${p}`}>{p}</span>
      ))}
      {meta.stream_ok === false && (
        <span className="badge badge-warn" title={meta.stream_error || "stream_ok: false"}>error stream</span>
      )}
      <PatyIconify.ButtonIconify icon="mdi:information-outline" title="Ver trazabilidad" onClick={onInfo} className="btn-iconify--sm" />
    </span>
  );
}

function MetaDialog({ open, onClose, meta, title }) {
  if (!meta) return null;
  const tk = meta.tokens?.total ? meta.tokens : PatyConvLog.tokensFromUsage(meta.usage);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <div className="meta-grid">
          {meta.ts && <div className="meta-row"><span className="meta-k">ts</span><span className="meta-v">{meta.ts}</span></div>}
          {meta.nombre_usuario && (
            <div className="meta-row"><span className="meta-k">nombre</span><span className="meta-v"><strong>{meta.nombre_usuario}</strong></span></div>
          )}
          {meta.itdconsulta && (
            <div className="meta-row"><span className="meta-k">itdconsulta</span><span className="meta-v"><span className="badge badge-itd">{meta.itdconsulta}</span></span></div>
          )}
          {meta.prompt_id && (
            <div className="meta-row"><span className="meta-k">prompt_id</span><span className="meta-v"><code>{meta.prompt_id}</code></span></div>
          )}
          {meta.model && (
            <div className="meta-row"><span className="meta-k">model</span><span className="meta-v"><code>{meta.model}</code></span></div>
          )}
          {meta.latency_ms != null && (
            <div className="meta-row"><span className="meta-k">latency</span><span className="meta-v">{meta.latency_ms} ms</span></div>
          )}
          {tk && (
            <div className="meta-row">
              <span className="meta-k">tokens</span>
              <span className="meta-v">
                <div className="tokens-grid">
                  <div className="tok"><span className="tok-k">in</span><span className="tok-v">{tk.input ?? 0}</span></div>
                  <div className="tok"><span className="tok-k">cached</span><span className="tok-v">{tk.cached ?? 0}</span></div>
                  <div className="tok"><span className="tok-k">out</span><span className="tok-v">{tk.output ?? 0}</span></div>
                  <div className="tok"><span className="tok-k">reason</span><span className="tok-v">{tk.reasoning ?? 0}</span></div>
                  <div className="tok"><span className="tok-k">total</span><span className="tok-v">{tk.total ?? 0}</span></div>
                </div>
              </span>
            </div>
          )}
          {meta.usage && (
            <div className="meta-row"><span className="meta-k">usage</span><span className="meta-v"><pre>{JSON.stringify(meta.usage, null, 2)}</pre></span></div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

window.PatyShared = { theme, shortId, mdToHtml, MetaBadges, MetaDialog };
