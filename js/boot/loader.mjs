import { PIN, CDN, ensureLightboxZoom } from "./cdn.mjs";

const bootHold = new URLSearchParams(location.search).has("isa_boot_hold");
const isDist = typeof globalThis !== "undefined" && globalThis.__ISA_DIST__;
const appBuild = new URL(import.meta.url).searchParams.get("v") || "dev";

/** URLs canónicas front-shared — no usar rutas locales relativas al <base>. */
const BOOT_LOADER_URL = `${CDN}/boot-loader.mjs?v=${PIN}`;
const JSDELIVR_BOOT_LOADER = `https://cdn.jsdelivr.net/gh/Jeff-Aporta/front-shared@${PIN}/cdn/boot-loader.mjs?v=${PIN}`;
const ISA_FRONT_BUNDLE_URL = `${CDN}/_dist/isa/js/index.min.js?v=${PIN}`;

async function importBootLoader() {
  try {
    return await import(BOOT_LOADER_URL);
  } catch (cdnErr) {
    if (!/localhost|127\.0\.0\.1|\[::1\]/.test(location.hostname)) throw cdnErr;
    try {
      const local = new URL("../../../../../components/front-shared/cdn/boot-loader.mjs", import.meta.url).href;
      return await import(local);
    } catch {
      try {
        return await import(JSDELIVR_BOOT_LOADER);
      } catch {
        throw cdnErr;
      }
    }
  }
}

/** Producción jsDelivr: bundle _dist (esbuild). Fuente isa/js/index.js importa .jsx y falla en el navegador. */
async function loadIsaFrontPinned(h) {
  if (isDist) {
    await import(ISA_FRONT_BUNDLE_URL);
  } else {
    await h.loadIsaFront();
    if (!window.ISAFront?.ensureCodeMirrorLoaded) {
      await import(ISA_FRONT_BUNDLE_URL);
    }
  }
  if (!window.ISAFront?.ensureCodeMirrorLoaded) {
    throw new Error("ISAFront incompleto — lazy-assets no disponibles en el pin CDN");
  }
}

importBootLoader().then(({ mountBoot, getBabel, importBootHelper }) => {
  mountBoot(async () => {
    if (bootHold) return;
    const h = await importBootHelper();
    const Babel = getBabel();
    await (await h.importShared("stack.mjs")).stackReady;
    h.assertStack();
    await loadIsaFrontPinned(h);
    await h.loadSharedUi(Babel);
    if (isDist) {
      await import(`../core/isa-setup.js?v=${appBuild}`);
    } else {
      await h.importAppModules(["js/core/isa-setup.ts"], Babel);
    }
    await ensureLightboxZoom();
    if (isDist) {
      await import(`../main.js?v=${appBuild}`);
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
