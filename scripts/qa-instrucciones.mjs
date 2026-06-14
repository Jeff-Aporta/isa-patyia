const ORCH = process.env.ORCH_URL || "https://main-orchestrator.jeffaporta.workers.dev";

async function fetchSaludo() {
  const r = await fetch(`${ORCH.replace(/\/$/, "")}/api/patyia/instrucciones`);
  const j = await r.json();
  const row = (j.rows || []).find((x) => x.IINSTRUCCION === "SALUDO_OTRO");
  return { ok: j.ok, status: r.status, body: row?.INSTRUCCION || "", storage: j.storage, error: j.error };
}

function snippet(body) {
  const i = body.indexOf("permite");
  return i >= 0 ? body.slice(i, i + 28) : "(no 'permite')";
}

const r = await fetchSaludo();
console.log("\n=== PATYIA INSTRUCCIONES (orquestador CF) ===");
console.log("url:", ORCH);
console.log("status:", r.status, "ok:", r.ok, "storage:", r.storage);
if (r.error) console.log("error:", r.error);
console.log("len:", r.body.length);
console.log("snippet:", snippet(r.body));
console.log("has permite..:", r.body.includes("permite.."));
console.log("has permite.;", r.body.includes("permite."));
