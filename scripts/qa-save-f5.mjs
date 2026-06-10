/**
 * QA: Guardar en langlab + lectura post-guardado (simula F5).
 * Uso: node scripts/qa-save-f5.mjs
 */
const LAB = "https://rag-lab-bsczhqfgchgegabr.canadacentral-01.azurewebsites.net";
const USER = process.env.QA_USER || "VRESTREPO";
const PASS = process.env.QA_PASS || "mesa-editar";
const TIPO = "SALUDO_OTRO";
const MARKER = `__QA_${Date.now()}__`;

async function jfetch(path, init = {}) {
  const r = await fetch(`${LAB}/api${path}`, init);
  const text = await r.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  return { r, data };
}

function saludoRow(rows) {
  return (rows || []).find((x) => x.IINSTRUCCION === TIPO);
}

async function readPg() {
  const { r, data } = await jfetch("/patyia/instrucciones");
  const row = saludoRow(data.rows);
  return { status: r.status, ok: data.ok, body: row?.INSTRUCCION || "" };
}

async function login() {
  const { r, data } = await jfetch("/auth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: USER, password: PASS }),
  });
  if (!r.ok || !data.token) throw new Error(data.error || "login failed");
  return data.token;
}

async function serviceToken(sessionToken) {
  const { r, data } = await jfetch("/auth/service-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionToken}`,
    },
    body: JSON.stringify({ method: "POST", path: "/patyia/prompts/upsert-sql" }),
  });
  if (!r.ok || !data.token) throw new Error(data.error || "service-token failed");
  return data.token;
}

function buildUpsertSql(body) {
  const esc = (s) => `'${String(s).replace(/'/g, "''")}'`;
  return `BEGIN;
INSERT INTO "BD_LANGLAB"."INSTRUCCION" ("IINSTRUCCION","NINSTRUCCION","MODELO","INSTRUCCION","DESCRIPCION","VERSION","FHULTACT")
VALUES (${esc(TIPO)}, ${esc(`PROMPT_${TIPO}`)}, '', ${esc(body)}, ${esc(`Prompt · ${TIPO}`)}, '1.0', NOW())
ON CONFLICT ("IINSTRUCCION") DO UPDATE SET "INSTRUCCION"=EXCLUDED."INSTRUCCION","FHULTACT"=NOW();
COMMIT;
SELECT "IINSTRUCCION", LENGTH("INSTRUCCION") AS len FROM "BD_LANGLAB"."INSTRUCCION" WHERE "IINSTRUCCION"=${esc(TIPO)};`;
}

async function save(body, token) {
  const { r, data } = await jfetch("/patyia/prompts/upsert-sql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ sql: buildUpsertSql(body), target: "langlab" }),
  });
  if (!r.ok || data.ok === false) throw new Error(data.error || `save HTTP ${r.status}`);
  return data;
}

function report(step, ok, detail) {
  console.log(`${ok ? "PASS" : "FAIL"} | ${step} | ${detail}`);
}

(async () => {
  console.log("=== QA save + F5 read (API) ===\n");

  const before = await readPg();
  report("1. GET /patyia/instrucciones", before.ok, `status=${before.status} len=${before.body.length}`);

  const session = await login();
  report("2. Login", true, USER);

  const svc = await serviceToken(session);
  report("3. service-token guardar_langlab", Boolean(svc), "ok");

  const patched = `${before.body}\n\n${MARKER}`;
  await save(patched, svc);
  report("4. POST upsert-sql", true, `marker=${MARKER}`);

  const after = await readPg();
  const hasMarker = after.body.includes(MARKER);
  report("5. Re-lectura (simula F5)", hasMarker, `hasMarker=${hasMarker} len=${after.body.length}`);

  await save(before.body, svc);
  report("6. Rollback contenido original", true, `len=${before.body.length}`);

  const restored = await readPg();
  const restoredOk = !restored.body.includes(MARKER) && restored.body.length === before.body.length;
  report("7. Verificar rollback", restoredOk, `len=${restored.body.length}`);

  process.exit(hasMarker && restoredOk ? 0 : 1);
})().catch((e) => {
  console.error("FAIL | excepción |", e.message);
  process.exit(1);
});
