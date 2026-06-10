const LAB = "https://rag-lab-bsczhqfgchgegabr.canadacentral-01.azurewebsites.net";

async function fetchSaludo(source) {
  if (source === "pg") {
    const r = await fetch(`${LAB}/api/patyia/instrucciones`);
    const j = await r.json();
    const row = (j.rows || []).find((x) => x.IINSTRUCCION === "SALUDO_OTRO");
    return { ok: j.ok, status: r.status, body: row?.INSTRUCCION || "", storage: j.storage };
  }
  const sql =
    "SELECT [IINSTRUCCION],[INSTRUCCION] FROM [dbo].[INSTRUCCION] WHERE [IINSTRUCCION]='SALUDO_OTRO'";
  const r = await fetch(`${LAB}/api/mssql/paty/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sql }),
  });
  const j = await r.json();
  const row = (j.rows || [])[0];
  const body = row?.INSTRUCCION ?? row?.instruccion ?? "";
  return { ok: j.ok, status: r.status, body, storage: "mssql:staging" };
}

function snippet(body) {
  const i = body.indexOf("permite");
  return i >= 0 ? body.slice(i, i + 28) : "(no 'permite')";
}

for (const src of ["pg", "mssql"]) {
  const r = await fetchSaludo(src);
  console.log(`\n=== ${src.toUpperCase()} ===`);
  console.log("status:", r.status, "ok:", r.ok, "storage:", r.storage);
  console.log("len:", r.body.length);
  console.log("snippet:", snippet(r.body));
  console.log("has permite..:", r.body.includes("permite.."));
  console.log("has permite.;", r.body.includes("permite."));
}
