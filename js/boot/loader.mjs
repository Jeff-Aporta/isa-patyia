import { asset, ensureLightboxZoom } from "./cdn.mjs";

const bootHold = new URLSearchParams(location.search).has("isa_boot_hold");
const isDist = typeof globalThis !== "undefined" && globalThis.__ISA_DIST__;

/** boot-helper puede cargar index.js de un pin sin lazy-assets — usar el pin de la app. */
async function loadIsaFrontPinned(h) {
  if (isDist) {
    await import(asset("isa/js/index.js"));
  } else {
    await h.loadIsaFront();
    if (!window.ISAFront?.ensureCodeMirrorLoaded) {
      await import(asset("isa/js/index.js"));
    }
  }
  if (!window.ISAFront?.ensureCodeMirrorLoaded) {
    throw new Error("ISAFront incompleto — lazy-assets no disponibles en el pin CDN");
  }
}

import(asset("boot-loader.mjs")).then(({ mountBoot, getBabel, importBootHelper }) => {
  mountBoot(async () => {
    if (bootHold) return;
    const h = await importBootHelper();
    const Babel = getBabel();
    await (await h.importShared("stack.mjs")).stackReady;
    h.assertStack();
    await loadIsaFrontPinned(h);
    await h.loadSharedUi(Babel);
    if (isDist) {
      await import("../core/isa-setup.js");
    } else {
      await h.importAppModules(["js/core/isa-setup.ts"], Babel);
    }
    await ensureLightboxZoom();
    if (isDist) {
      await import("../main.js");
    } else {
      await h.importAppModules(["js/main.jsx"], Babel);
    }
  });
}).catch((err) => {
  const root = document.getElementById("root");
  const msg = err instanceof Error ? err.stack || err.message : String(err);
  if (root) root.innerHTML = `<pre style="color:#ff8a80;padding:24px;font-family:monospace">Error de arranque:\n${msg}</pre>`;
  console.error(err);
});
