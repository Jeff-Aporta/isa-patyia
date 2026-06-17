import { asset } from "./cdn.mjs";

const bootHold = new URLSearchParams(location.search).has("isa_boot_hold");

import(asset("boot-loader.mjs")).then(({ mountBoot, getBabel, importBootHelper }) => {
  mountBoot(async () => {
    if (bootHold) return;
    const h = await importBootHelper();
    const Babel = getBabel();
    await (await h.importShared("stack.mjs")).stackReady;
    h.assertStack();
    await h.loadIsaFront();
    await h.loadSharedUi(Babel);
    await h.importAppEntry("js/core/isa-setup.ts", Babel);
    await h.importAppEntry("js/main.jsx", Babel);
  });
}).catch((err) => {
  const root = document.getElementById("root");
  const msg = err instanceof Error ? err.stack || err.message : String(err);
  if (root) root.innerHTML = `<pre style="color:#ff8a80;padding:24px;font-family:monospace">Error de arranque:\n${msg}</pre>`;
  console.error(err);
});
