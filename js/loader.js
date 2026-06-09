/**
 * Carga JSX en orden (Babel standalone no garantiza orden con varios src).
 */
(function () {
  "use strict";

  const JSX_FILES = [
    "js/iconify.jsx",
    "js/shared.jsx",
    "js/notifications.jsx",
    "js/signalrLab.jsx",
    "js/sqlExec.jsx",
    "js/LabAuth.jsx",
    "js/jsonEditor.jsx",
    "js/LogViewer.jsx",
    "js/PromptsSqlTool.jsx",
    "js/App.jsx",
  ];

  async function loadOne(path) {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error(`No se pudo cargar ${path} (${res.status})`);
    const src = await res.text();
    const out = Babel.transform(src, { presets: ["react"] }).code;
    // eslint-disable-next-line no-eval
    eval(out);
  }

  async function boot() {
    try {
      for (const f of JSX_FILES) await loadOne(f);
    } catch (err) {
      const root = document.getElementById("root");
      if (root) {
        root.innerHTML = `<pre style="color:#f87171;padding:1rem;">Error cargando AppTools: ${err instanceof Error ? err.message : String(err)}</pre>`;
      }
      console.error(err);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
