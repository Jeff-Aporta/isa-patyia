const FRONT_SHARED_PIN = "0d8527f";
const CDN_BOOT = `https://cdn.jsdelivr.net/gh/Jeff-Aporta/front-shared@${FRONT_SHARED_PIN}/cdn/boot-loader.mjs?v=${FRONT_SHARED_PIN}`;
const LOCAL_CANDIDATES = [
  "../../../../front-shared/cdn",
  "../../../front-shared/cdn",
  "../../front-shared/cdn",
];

async function importBootLoader() {
  let lastErr;
  for (const base of LOCAL_CANDIDATES) {
    try {
      const mod = await import(`${base}/boot-loader.mjs`);
      return { mod, localFs: base };
    } catch (e) {
      lastErr = e;
    }
  }
  try {
    const mod = await import(CDN_BOOT);
    return { mod, localFs: LOCAL_CANDIDATES[0] };
  } catch (e) {
    throw lastErr || e;
  }
}

importBootLoader().then(({ mod, localFs }) => {
  const { mountBoot, getBabel } = mod;
  mountBoot(async () => {
    const helper = await mod.importBootHelper(localFs);
    const { importShared, assertStack, loadIsaFront, loadSharedUi } = helper;
    const { importAppEntry } = await import("./module-graph.mjs");
    const Babel = getBabel();
    const stackMod = await importShared("stack.mjs");
    await stackMod.stackReady;
    assertStack();
    await loadIsaFront();
    await loadSharedUi(Babel);
    await importAppEntry("js/core/isa-setup.ts", Babel);
    await importAppEntry("js/main.jsx", Babel);
  });
}).catch((err) => {
  const root = document.getElementById("root");
  const msg = err instanceof Error ? err.stack || err.message : String(err);
  if (root) root.innerHTML = '<pre style="color:#ff8a80;padding:24px;font-family:monospace">Error de arranque:\n' + msg + "</pre>";
  console.error(err);
});
