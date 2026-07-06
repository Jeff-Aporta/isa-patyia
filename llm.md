# isa-patyia/frontend — notas para LLM

Front React + MUI de PatyIA AppTools. Sirve en Cloudflare Pages (dev) y GH Pages (main). Backend lógica real está en `C:\ContaPyme\PatyIA\ISS-AyudasCPIA\` — este front NO tiene backend productivo (el bridge en `../backend/` está DEPRECATED).

## Stack y arranque

- React 18 + MUI 9, TypeScript 5
- Sin bundler propio en runtime — bundles precompilados en `_dist/` (esbuild via `paty_build.mjs`)
- ISAFront (`vendor/front-shared/`) provee AppShell, IsaSplitView, CodeMirrorPanel, Glass, LightboxZoom, Feedback (toasts), urlState — todo se carga vía `window.ISAFront.*`
- **Orden de carga** (`index.html`):
  1. `vendor/front-shared/base-href.js` — `<base href>` para rutas relativas
  2. `js/boot/theme-init.mjs` — tema oscuro/claro
  3. `js/boot/loader.mjs` — carga ISAFront + React/MUI desde CDN + `boot-eval-loader.mjs`
  4. `js/boot/isa-setup.ts` (compilado) — `bootstrapIsaPatyia()` registra app en ISAFront
  5. `js/main.jsx` — `mountApp()` → `<App />`

## Estructura

```
frontend/
├── index.html              # entry HTML; carga vendor/boot/main en orden
├── index.json              # meta (título, theme, badges, mergeHistory, libs)
├── _dist/                  # bundles esbuild generados (no commitear source)
├── vendor/
│   ├── front-shared/       # ISAFront + loader.mjs + base-href.js (vendored)
│   └── cdn/                # shims de CDN (iconify, etc.)
├── css/                    # theme + app + boot-loading + neon-glass-bridge + chat-staging + todos-staging + tree-accordion
├── js/
│   ├── main.jsx            # entry → mountApp()
│   ├── boot/               # loader + theme-init + cdn (no tocar salvo cambios loader)
│   ├── global.d.ts         # tipos window.ISA / ISAFront / ISAComponents
│   ├── app/App.jsx         # router 5 tools; URL state via urlState; auth events
│   ├── core/
│   │   ├── platform.ts     # PUENTE a window.ISAFront: UI, Session, Config, Toast, Assets, mdToHtml, getReact/getMaterialUI, CodeMirrorPanel, LightboxZoom
│   │   ├── patyia.ts       # URL bases (PATYIA_BRIDGE_URL, PATYIA_ISS_LOCAL); isLocalMode(); readPatyiaSseStream()
│   │   ├── patyia-jwt.ts   # AppSession JWT (LS, expiry check)
│   │   ├── urlState.ts     # estado de app en ?s= (b64url JSON); migrateLegacyFlatQuery; persistX helpers
│   │   ├── theme.ts        # helpers tema
│   │   ├── promptVariables.ts, msgDateFormat.ts, fileSearchTrace.js, convLog.ts, lightboxBoot.ts
│   │   └── isa-setup.ts    # invocado por boot; llama bootstrapIsaPatyia()
│   ├── api/                # 1 archivo por dominio: apiClient (capFetch), patyiaChatApi, systemConfigApi, promptsSql, labApi, patyiaTokens, portalJwtApi, treeMsgsApi, sessionApi, todosApi, issListFilter
│   ├── tools/              # 5 tools (ver tabla) + helpers compartidos
│   ├── ui/                 # componentes MUI reusables: shared.jsx (MetaDialog, ButtonIconify), ConvLogThread, ConvLogWebView, ImageLightboxDialog, GlassDialog, PromptBodyEditor, bootShimmer, treeView/*
│   └── editors/jsonEditor.jsx
├── scripts/                # setup-cloudflare-pages.ps1, setup-github-secrets.ps1, qa-instrucciones.mjs, dev-local.ps1
├── paty_build.mjs          # regenera _dist/ con esbuild (lista hardcoded)
└── tsconfig.json           # target browser ES2020, strict
```

## 5 tools (`js/app/App.jsx:14`)

| id | archivo | subdir | hook state | propósito |
|---|---|---|---|---|
| `log` | `tools/LogViewer.jsx` | — | local | Visor de log conv PatyIA |
| `prompts` | `tools/PromptsSqlTool.jsx` | `tools/promptsSql/` | `usePromptsSqlTool` | Editor Prompts→SQL (INSTRUCCION + jconfig) |
| `chat` | `tools/ChatTool.jsx` | `tools/chat/` | `useChatTool` | Chat con PatyIA (SSE streaming) |
| `todos` | `tools/TodosTool.jsx` | `tools/todos/` | `useTodosTool` | Kanban DevFlow + PublicScrumBoard |
| `config` | `tools/ConfigTool.jsx` | — | local | OpenAI cfg + panel permisos |

Cada tool se monta en `App.jsx:122-136` con `key={homeTick}` (re-mount al volver al home brand).

## Routing y estado

`?s=` (b64url JSON, base64url) codifica el estado completo de la app:
```json
{ "v": 1, "tool": "log", "log": {"convId": "...", "sidebarW": 400}, "prompts": {...}, "chat": {"convId": 1234, "mode": "patyia"}, "todos": {...}, "config": {...} }
```
- Límite ~12000 chars b64url → `slimForUrl` trunca `prompts.bodies` (>6000 chars) y `log.jsonInput` (>4000 chars).
- Migración automática desde URL plana `?tool=log&log.convId=…` → `?s=` en `migrateLegacyFlatQuery()` (`urlState.ts:126`).
- Helpers: `persistChatConvId`, `persistChatMode`, `persistLogMeta`, `persistLogSidebarWidth`, `persistPermisosHideEmpty`.
- Subscribe via `subscribe(callback)` en `App.jsx:42` para reaccionar a cambios.

## API cliente

`capFetch(path, opts)` en `js/api/apiClient.ts:35` — UN solo punto de entrada HTTP:
- local mode + path `isPatyiaApiPath` (`/patyia`, `/api/patyia`) → directo a `PATYIA_ISS_LOCAL` (sin orquestador)
- resto → `PATYIA_BRIDGE_URL` (producción) o `ORCH_ONLINE` (orquestador)

Domain wrappers en `js/api/`:
- `patyiaChatApi.ts` — `getConversacionLogs`, `listConversaciones`, `convLogFromDetalle`
- `systemConfigApi.ts` — `fetchInstruccionesSystemConfig`, `putInstruccionUpsert`, `putInstruccionesPublish`
- `sessionApi.ts` — capabilities (instruccionesPublishCap, INSTRUCCIONES_WRITE_CAP)
- `apiClient.ts` — `capFetch`, `apiUrl`, `rowVal`
- `labApi.ts`, `patyiaTokens.ts`, `portalJwtApi.ts`, `treeMsgsApi.ts`, `todosApi.ts`, `promptsSql.ts`, `issListFilter.ts`

**Auth**: `Session.authHeader()` (JWT InSoft) + `appHeader()` (AppSession) + `X-Gateway-Service: iss-patyia-bridge` para mutaciones.

## SSE chat

`readPatyiaSseStream(response, onEvent)` en `js/core/patyia.ts:160` parsea el stream SSE de `POST /api/conversacion`. Eventos: `begin`, `message`, `end`, `error`. El `end` payload contiene `meta.file_search` (chunks RAG), `meta.itdconsulta`, `meta.model`.

## Auth y capabilities

- Login vía `LoginButton` (ISAFront) → `window.ISA.Session.login()`
- `patchIsaPatyiaAuthEvents` (`platform.ts:181`) wrappea Session.login/logout para disparar evento custom `isa-patyia:auth`
- `Session.can(cap)`, `Session.capabilities()`, `Session.blockReason(cap)` para gates UI (ej. `instruccionesPublishCap`)
- View-as: `Session.viewAsUsername()`, `Session.setViewAs()`, `Session.clearViewAs()` — suplantación para QA

## PatyIA RAG (resumen)

5 vector stores OpenAI, 13 tipos consulta, 17 instrucciones activas. Front usa:
- `GET /api/system/openai` — config (max_num_results, modelos)
- Chat → `POST /api/conversacion` (SSE) — ver `C:\ContaPyme\PatyIA\ISS-AyudasCPIA\llm.md` para flujo RAG completo.

## Build local

```bash
# Regenerar bundles _dist/ para archivos modificados
cd "C:\ContaPyme\Personal\apps\isa-patyia\frontend"
node paty_build.mjs

# Server estático local (front solo, sin backend)
npx serve .      # o: http-server -p 8766 .

# Backend canónico (otro repo)
cd "C:\ContaPyme\PatyIA\ISS-AyudasCPIA"
npm run start    # :8802
```

`paty_build.mjs` lista hardcoded `jobs[]` (línea 56). Si añadís `.jsx`/`.ts`/`.tsx` en `js/`, agregalo a `jobs[]` o no se compila para deploy.

## Deploy

- `index.json` `mergeHistory` — agregar fila `{date, url:"https://HASH.isa-patyia-dev.pages.dev"}` antes de merge a `main`. Una fila por fecha (la más reciente).
- `dev` → Cloudflare Pages (`isa-patyia-dev.pages.dev`)
- `main` → GH Pages (`jeff-aporta.github.io/isa-patyia/`)
- Workflow: `Jeff-Aporta/isa-patyia/.github/workflows/deploy-front.yml`

## Caveats

- **NO tocar `vendor/`** salvo actualización vendorada de ISAFront. Cambios van upstream.
- **SÍ commitear** fuentes en `js/` **y** bundles en `_dist/` tras `node paty_build.mjs`. El CI no recompila solo desde sources en todos los flujos — el deploy usa `_dist/`.
- **NO commitear** `components/` bajo `frontend/` (copias locales de swagger/lightbox para dev). **NO** subir credenciales ni `.env`.
- `paty_build.mjs` requiere rutas absolutas Windows (`C:\\ContaPyme\\Personal\\apps\\isa-patyia\\frontend`). No portable a WSL sin editar.
- `index.json` es la fuente de verdad del README + badges + theme. NO editar `README.md` directo — regenera via `gen-front-readme.mjs`.
- `?s=` tiene `maxB64Len: 12000` — si excedes, `slimForUrl` trunca silenciosamente. Para Prompts con bodies grandes, perderás contenido al recargar.
- `isLocalMode()` lee LS `patyia-apptools:iss-local`. Default "0" (producción). Toggle desde UI llama `setLocalMode()` que recarga página.
- `chat-staging.css` y `todos-staging.css` se cargan lazy solo cuando la tool está activa (`App.jsx:48-51`). Si añades CSS scoped a una tool, sigue este patrón.
- `paty-public-scrum` es clase en `<html>` que activa modo público kanban (`TodosTool` con `boot.todos.publicSlug`). Una vez activada, fuerza `tool="todos"` y oculta nav.
- PatyIA chat: `mode: "patyia"` (default, RAG activo) vs `mode: "libre"` (sin RAG, jailbreak mode). Migración automática `jailbreak: true` → `mode: "libre"` en `urlState.ts:27`.
- ConvLog logs son fuente primaria de verdad para el chat — `patyiaChatApi.convLogFromDetalle` los parsea desde `GET /api/conversacion/{id}` con `meta.file_search` populated.
- Tests: NO hay suite. Validar manualmente en Cloudflare preview antes de merge a main.

## Próximas considerations

- Si reaparece backend productivo: NO va aquí — va en `PatyIA/ISS-AyudasCPIA/`. Mantener `backend/` deprecado o eliminar.
- Si refactorizas una tool a hooks más limpios: sigue el patrón `useXxxTool.ts` (ver `tools/promptsSql/usePromptsSqlTool.ts`, `tools/chat/useChatTool.ts`).
- Si añades nueva tool: (1) entry en `ALL_TOOLS` `App.jsx:14`, (2) `tools/<Name>Tool.jsx`, (3) branch en `App.jsx:122-136`, (4) si requiere CSS scoped, sigue patrón `chat-staging.css` + `Assets.ensureXxxCss`.
- Si cambias permisos UI: revisa `js/tools/permisosForm.js`, `permisosKanbanShared.js`, `roleHierarchyTree/`. El modelo backend está en `PatyIA/ISS-AyudasCPIA/src/auth/`.
- Si necesitas JWT de staging para QA: `dev-token.json` en `PatyIA/ISS-AyudasCPIA/dev-token.json`.

---

## Sesión jul 2026 — Capabilities de ISS integradas en gates UI legacy

### Problema
La UI verificaba capacidades abstractas con `Session.can("patyia.instrucciones.publish")` (y similares), pero el catálogo legacy de ISAFront no incluye todas las capabilities del nuevo sistema `GET /api/permissions/me` de ISS. Resultado: acciones que el backend autorizaba aparecían deshabilitadas en la UI para roles como `dev_lead`.

### Solución aplicada (`js/api/sessionApi.ts`)
Se añadió un cache local (`ME_CAPS`) con funciones síncronas que consultan las capabilities de `/permissions/me` cuando la capability legacy no se reconoce:

- **`canEditInstrucciones()`**: `Session.can(INSTRUCCIONES_WRITE_CAP)` OR `ME_CAPS.canEditInstrucciones`
- **`canEditOpenAiConfig()`**, **`canEditPromptsOperativos()`**, **`canEditConversacionConfig()`**, **`canEditSwagger()`**, **`canOverrideSampling()`**: patrón análogo con capacidades equivalentes del nuevo catálogo.
- **`canSwitchTarget()`**: sin cambio (la capability `infra.target.switch` sí está en legacy y corresponde).

**Nuevas funciones exportadas**:
- `bootMeCaps()` — hidrata el cache con `fetchPermissionsMe({force: true})` desde ISS. Idempotente (no-op si ya está hidratado o si no hay sesión).
- `login()` ahora invoca `bootMeCaps(true)` tras autenticar.
- `logout()` invoca `clearMeCaps()` para limpiar el cache.

### Wiring en `js/app/App.jsx`
- Se importa `* as SessionApi` desde `../api/sessionApi.ts`.
- El `useEffect` que escucha `Session.EVENT` e `isa-patyia:auth` ahora también invoca `void SessionApi.bootMeCaps()` en cada cambio y una vez al montar si ya hay sesión.

### Beneficio arquitectónico
La UI ya no depende de la actualización manual del catálogo legacy cuando el backend agrega nuevas capabilities. Cualquier capacidad nueva se descubre via `/permissions/me` y se cachea por TTL del servidor. El cambio se replicará al resto de fronts (jagudeloe, flsjeff, main-orchestrator) si también usan estas funciones de `sessionApi.ts`.

### NO confundir con catálogo legacy
- El catálogo ISAFront legacy sigue siendo la **primera** opción (más rápido, sin red).
- Solo si retorna `false`, se hace fallback a `/permissions/me`.
- Este patrón preserva la retrocompatibilidad: roles con capabilities legacy siguen funcionando idéntico.

### Pendiente
- Misma lógica podría aplicarse a `langlab.guardar` y `patyia.scrum` si aparecen gaps similares. Por ahora no se hizo porque no se reportaron síntomas.
- El sub-agente QA de la sesión pasada ejecutó un PUT accidental con body parcial que destruyó el JPERMISOS de `dev_lead`. Esa root cause está mitigada en backend (`applyPermisosFieldPatch` ahora mergea profundo en modo "all"). En front, este cambio de `sessionApi.ts` es independiente a ese incidente.

### Archivos modificados
- `js/api/sessionApi.ts` — añadidos `ME_CAPS`, `primeMeCaps`, `clearMeCaps`, `bootMeCaps`, `canEditOpenAiConfig`, `canEditPromptsOperativos`, `canEditConversacionConfig`, `canEditSwagger`, `canOverrideSampling`. Modificados `login`, `logout`, `canEditInstrucciones`.
- `js/app/App.jsx` — añadido import + invocación de `bootMeCaps` en el listener de auth.

### Relación con `c:\ContaPyme\PatyIA\ISS-AyudasCPIA\llm.md`
La sección "Sesión jul 2026 — Modelo simple de permisos para `dev_lead`" del `llm.md` del backend explica el contexto completo (por qué se quitó `*`, `manage_*`, `impersonate` y se optó por permisos HTTP-first). El presente cambio en front es el complemento necesario para que la UI no muestre controles deshabilitados cuando el JSON del rol ya autoriza.

---

## Sesión jul 2026 — Permisos, jerarquía de roles, envelope ISS y merge a main

> **Commits ref. (rama `dev`, merge `main` `e1cd9a0`):** `b92ffc6` permisos kanban/terceros · `1cc3a13` fix modal jerarquía · `e1cd9a0` mergeHistory Cloudflare `8ce645b1`.

### Índice rápido

| Síntoma | Causa | Fix principal |
|---------|-------|---------------|
| Diálogo terceros «Sin resultados» con datos en ISS | Cliente leía `body`, ISS devuelve `respuesta` | `unwrapIssEnvelope()` en `apiClient.ts` |
| Kanban «No hay roles configurados» | BD usa `ientity`, front solo `iusuario` | `normalizePermEntry()` en `systemConfigApi.ts` |
| Modal jerarquía: árbol vacío «Sin roles» | `GET /system/permisos/hierarchy` → `roles: []` en local | Seed inmediato desde `data.roles` + fallback |
| Modal jerarquía: página congelada / loop | `useEffect` + objeto `currentRoleEntry` nuevo cada render; `<details>` nativo en readonly | Firmas JSON, `key` en editor, control toggle TreeView |
| ISS tests antes de commit | Gate obligatorio en `src/health/` | `npm run build` + `runAllHealthTests` (ver ISS `llm.md`) |

### 1. Envelope HTTP del ISS (obligatorio en todos los clientes)

El ISS responde con forma canónica:

```json
{ "encabezado": { "resultado": true, ... }, "respuesta": { ... } }
```

Algunos endpoints legacy anidan también `body` dentro de `respuesta`.

**Sí hacer:**
- En `systemConfigApi.ts`: `unwrapBody()` / `jsonFetch` que priorice `respuesta`, luego `body`.
- En `apiClient.ts`: helper `unwrapIssEnvelope()` para `capFetch` cuando el consumidor espera el payload interior (ej. auditoría terceros: `respuesta.rows`).

**No hacer:**
- Asumir `raw.body` como única fuente — en staging/local el dato útil está en `respuesta`.
- Parsear una sola vez en un sitio y olvidar replicar el patrón en wrappers nuevos (`fetchHierarchy`, `fetchPermisos`, chat, etc.).

**Archivos:** `js/api/apiClient.ts`, `js/api/systemConfigApi.ts`.

### 2. Permisos kanban — campo `ientity` vs `iusuario`

En `SYS_USR_PERMISSIONS` el identificador canónico del rol/usuario en filas de tipo `role` es **`ientity`** (no siempre viene `iusuario`).

**Sí hacer:**
- `permEntityKey(entry)` → `entry.ientity ?? entry.iusuario`.
- `normalizePermEntry()` al recibir `GET /api/system/permisos`.
- `roleNameFromEntry()` / `permEntryKey()` en `permisosKanbanShared.js` ya delegan en esa clave.
- `permEntryKey()` en kanban para columnas: `iusuario ?? ientity` donde aplique.

**No hacer:**
- Leer solo `r.iusuario` al armar columnas del kanban — columnas quedan vacías aunque ISS devuelva 7 roles.
- Mostrar solo «Ocultar vacíos» como culpable sin verificar que `buildPermisosBoard` recibió roles normalizados.

**Archivos:** `js/api/systemConfigApi.ts`, `js/tools/permisosKanbanShared.js`, `js/tools/PermisosKanban.jsx`.

### 3. Diálogo «Filtrar por usuario» (terceros audit)

**Síntoma:** `GET /api/auditoria/terceros` OK (ej. 75 filas) pero UI «Sin resultados».

**Causa:** `fetchTercerosAudit` en `apiClient.ts` hacía `raw.body` en lugar de desenvolver `respuesta`.

**Sí hacer:** Tras fix envelope, validar con ISS local `:8802` y switch Local en UI.

**Archivo:** `js/tools/chat/TercerosAuditDialog.jsx` consume API ya corregida.

### 4. Modal «Jerarquía y rol visitante» — árbol vacío

**Síntoma:** Al abrir el modal, texto «Sin roles» aunque el tablero kanban muestra columnas.

**Causa:** `fetchHierarchy()` → `GET /api/system/permisos/hierarchy` devuelve `{ roles: [], count: 0 }` en local (endpoint existe pero sin filas materializadas). El front solo pintaba el resultado async y **no** hacía fallback a tiempo.

**Sí hacer (flujo en `PermisosPanel.jsx`):**
1. Al abrir (`openHierarchyDialog` / `openHierarchyForRole`): **inmediatamente** `setHierarchyNodes(hierarchyNodesFromRoleEntries(rolesRef.current))`.
2. Luego `loadHierarchy(roles)` en `useEffect` cuando `hierarchyOpen && data.roles.length`.
3. En `loadHierarchy`: si el GET viene vacío, fallback `hierarchyNodesFromRoleEntries(fallbackRoles)`; **solo** `setHierarchyNodes` si hay nodos (no pisar seed con `[]`).
4. Reset `hierarchyLoadRef` al abrir para no quedar colgado en promesa anterior.

**No hacer:**
- Confiar solo en `GET .../hierarchy` sin fallback desde `GET .../permisos` (roles con `permisos.jerarquia` o defaults en `roleHierarchy.js`).
- Llamar `setHierarchyNodes([])` cuando el GET remoto falla pero ya hay nodos del seed.
- Abrir el modal antes de que `fetchPermisos` haya cargado sin re-ejecutar load al llegar `data.roles` (dependencia `data.roles` en el `useEffect`).

**Archivos:** `js/tools/PermisosPanel.jsx`, `js/tools/roleHierarchyTree/hierarchyFromRoles.ts`, `js/tools/roleHierarchy.js`.

### 5. Modal jerarquía — congelamiento / loop de React

**Síntomas:** Al abrir el modal o al seleccionar un rol (visitante u otro), la pestaña deja de responder.

**Causas (combinadas):**

1. **`RoleHierarchyView.tsx` — dependencia inestable:** `currentRoleEntry` en `useMemo` devolvía `{ iusuario, permisos: EMPTY_PERMISOS, bactivo: true }` **nuevo objeto** cada render si no había match → `useEffect` de `roleDraft` disparaba `setRoleDraft` en bucle.

2. **`RoleConfigEditor`:** `entry` cambiaba identidad cada render aunque los permisos fueran iguales → resets internos de rutas/flags.

3. **`TreeRowItem.tsx` — `<details>` nativo:** En `readonly` (`canMutate=false`), el toggle nativo del `<details>` competía con estado React (`collapsed` / `onToggleCollapse`) → reflow infinito o UI bloqueada al expandir carpetas.

**Sí hacer:**
- Derivar firmas estables: `visitantePermisosSig` / `rolePermisosSig` = `JSON.stringify(permisos)`; deps del `useEffect` de drafts **solo** firmas + `selectedJer`, no el objeto `currentRoleEntry`.
- Al setear draft: `setRoleDraft(prev => JSON igual ? prev : next)`.
- `key={\`visitante-${visitantePermisosSig}\`}` y `key={\`${role}-${rolePermisosSig}\`}` en `RoleConfigEditor` para remount limpio al cambiar rol.
- En `TreeRowItem.handleSummaryClick`: si `!canMutate || collapse disabled` → `preventDefault` y fijar `detailsRef.current.open = isOpen` (no dejar al navegador togglear).
- Un solo `useEffect` unificado para visitante vs rol normal según `selectedJer`.

**No hacer:**
- Poner `currentRoleEntry` (objeto) en array de dependencias de `useEffect` que hace `setState`.
- Pasar `visitanteEntry` crudo al editor sin draft cuando hay `onChange` que re-alimenta el padre.
- Asumir que «solo visitante» congela — cualquier rol dispara el mismo ciclo si el entry es inestable.
- Ignorar el árbol en readonly: usuarios sin branch `0` igual abren el modal para **ver** jerarquía.

**Archivos:** `js/tools/roleHierarchyTree/RoleHierarchyView.tsx`, `js/ui/treeView/TreeRowItem.tsx`, `js/tools/permisosRoleConfig.jsx`.

### 6. Build y verificación local

```bash
cd "C:\ContaPyme\Personal\apps\isa-patyia\frontend"
node paty_build.mjs

# ISS local (otro repo)
cd "C:\ContaPyme\PatyIA\ISS-AyudasCPIA"
npm run build
# Gate tests (obligatorio antes de commit ISS):
node --input-type=module -e "import('./dist/src/health/_register.js'); ..."
```

**URL de prueba permisos:** `?s=` con `tool:"config"` y tab Permisos — ejemplo base en `urlState.ts`.

**Checks manuales:**
1. Config → Permisos → kanban con columnas visibles.
2. Botón árbol → modal con N roles (no «Sin roles»).
3. Clic en «Visitante» → editor carga sin congelar.
4. Chat → filtro terceros → lista contactos.

### 7. Merge `dev` → `main` (skill `isa-patyia-merge-readme`)

**Sí hacer (orden):**
1. Deploy `dev` validado en Cloudflare.
2. Obtener URL hash: `gh api repos/Jeff-Aporta/isa-patyia/deployments?sha=$(git rev-parse dev)` → `environment_url` de `isa-patyia-dev (Production)`.
3. Añadir `{ date, url }` **al inicio** de `readme.mergeHistory` en `index.json`.
4. `node Personal/apps/src/scripts/front/gen-front-readme.mjs --slug isa-patyia`.
5. Commit en `dev` (fix + fila mergeHistory).
6. `git push origin dev` → `git checkout main` → `git merge dev` → `git push origin main`.
7. **`git checkout dev`** — dejar la rama de trabajo en `dev` (no quedarse en `main`).

**No hacer:**
- Merge a `main` sin fila en `mergeHistory`.
- Usar solo alias `isa-patyia-dev.pages.dev` sin hash en la tabla.
- Editar `README.md` a mano sin regenerar desde `index.json`.
- Olvidar actualizar puntero del submódulo en `Personal/apps` si el monorepo debe reflejar el SHA nuevo.

**Último merge (jul 2026):** preview `https://8ce645b1.isa-patyia-dev.pages.dev` → producción GH Pages tras push `main`.

### 8. Relación con ISS-AyudasCPIA

| Tema ISS | Doc backend | Consumo front |
|----------|-------------|---------------|
| Permisos / `ientity` | `llm.md` § Permisos y jerarquía | `systemConfigApi`, kanban |
| `GET /system/permisos/hierarchy` vacío | Endpoint existe; datos pueden derivarse de permisos | fallback `hierarchyFromRoles.ts` |
| Test concat `{{instruccion_tipo}}` | `instruccion-tipo-concat-bd.test.ts` | N/A (backend) |
| Gate `runAllHealthTests` | Obligatorio antes de commit ISS | No aplica al front |

### 9. Anti-patrones resumidos (NO repetir)

| # | No hacer | Por qué |
|---|----------|---------|
| 1 | Confiar solo en `GET .../hierarchy` | Suele venir `[]` en local; kanban sí tiene roles |
| 2 | `useEffect(..., [currentRoleEntry])` con objeto recreado | Loop infinito → congelamiento |
| 3 | `<details>` sin control en readonly | Toggle nativo vs React |
| 4 | Parsear solo `body` del ISS | Datos en `respuesta` |
| 5 | Ignorar `ientity` en permisos | Columnas kanban vacías |
| 6 | Commit ISS con `failed > 0` en health tests | Gate bloquea (ver ISS `llm.md`) |
| 7 | Merge `main` sin `mergeHistory` | Rompe trazabilidad deploy |
| 8 | `git add -A` en frontend sin revisar | Arrastra `components/`, backups locales |
| 9 | SQL embebido en `node -e` desde PowerShell | Escaping rompe queries (`LEN`, comillas) — usar `.mjs` |
| 10 | Probar modal sin `paty_build` tras editar `.tsx` | Live server sirve `_dist/` viejo |
| 11 | Usar `PATYIA_BRIDGE_LOCAL` sin importarlo en `apiClient.ts` | Modo local: auditoría terceros crash `PATYIA_BRIDGE_LOCAL is not defined` |
| 12 | Confiar solo en `Session.can("patyia.chat.audit")` para auditoría | ISS expone `canAccessOthers` en `/permissions/me` — usar `sessionApi.canAccessOthers()` |
| 13 | Mostrar rol desde `Session.current().role` (system-login) | Fuente canónica: `resolveDisplayRole()` ← `ME_ISS_ROLES` de `/api/permissions/me` |
| 14 | `canPublish` solo con `canEditInstrucciones` si el rol tiene `prompts-operativos` | Or: `canEditInstrucciones \|\| canEditPromptsOperativos` |
| 15 | Parchear permisos solo al usuario Viviana | Siempre rol ITIPO=R `admn_isapatyia` (ver ISS `llm.md` migración 016) |

### 10. Checklist «lo que sí hay que hacer»

- [ ] Tras cambiar `js/`: `node paty_build.mjs` y commitear `_dist/` correspondiente.
- [ ] Clientes ISS: desenvolver `respuesta` (y `body` legacy).
- [ ] Normalizar permisos con `ientity`/`iusuario`.
- [ ] Jerarquía: seed local + fetch remoto con fallback.
- [ ] Drafts del editor de rol: firmas JSON + `key` en `RoleConfigEditor`.
- [ ] TreeView readonly: bloquear toggle nativo de `<details>`.
- [ ] Antes de merge main: `mergeHistory` + `gen-front-readme.mjs`.
- [ ] Terminar en rama `dev` si el flujo de trabajo es AppTools staging.
- [ ] ISS: build + health tests verdes antes de commit (repo separado).
- [ ] Rol Admn ISA-Paty: verificar `admn-isapatyia-role-contract` en ISS tests; migración 016 aplicada en BD.

---

## Sesión jul 2026 — Rol Admn ISA-Paty (`admn_isapatyia`) · Viviana / VRESTREPO

> **Backend:** `ISS-AyudasCPIA/llm.md` (sección homónima al final) · migración `016-admn-isapatyia-instrucciones.sql`  
> **Test regresión ISS:** `admn-isapatyia-role-contract` (incluye check de import `PATYIA_BRIDGE_LOCAL` en este repo)

### Síntomas reportados

| UI | Lo que se veía | Causa |
|----|----------------|-------|
| Menú usuario | «Rol: **Visitante**» con Viviana Restrepo | `/api/permissions/me` no hidrató `ME_ISS_ROLES` → fallback `Session.current().role` |
| Tool Prompts | Solo lectura, no guarda | Rol sin `PUT:/api/system/instrucciones` → `canEditInstrucciones: false` |
| Chat → Filtrar por usuario | Alerta `PATYIA_BRIDGE_LOCAL is not defined` + Sin resultados | Bug import en `apiClient.ts`; fallback local nunca ejecutó |

### Modelo correcto (no reinventar)

- Usuario `VRESTREPO` → `roles: ["admn_isapatyia"]` en BD (ITIPO=U).
- Rol `admn_isapatyia` jerarquía **`0.1.0.0`** — **hereda auditador** (`0.1.0`) → auditoría global de terceros.
- Edición prompts: permisos en el **rol**, no en el usuario.

### Qué SÍ hacer en front

| Área | Regla |
|------|-------|
| Rol en header | `resolveDisplayRole()` — esperar `bootMeCaps()` / evento `patyia-apptools:caps-changed` |
| Editar prompts | `canEditInstrucciones()` **o** `canEditPromptsOperativos()` (`usePromptsSqlTool`) |
| Auditoría chat | `canAccessOthers()` desde `sessionApi` (OR legacy `patyia.chat.audit`) |
| Cache permissions/me | `Session.current()?.token` como session key (`systemConfigApi.ts`) |
| Modo local auditoría | Importar `PATYIA_BRIDGE_LOCAL` desde `core/patyia.ts` en `apiClient.ts` |
| Tras editar `js/` | `node paty_build.mjs` |

### Qué NO hacer

- **NO** asumir que «Visitante» en header implica rol mal en BD — puede ser caps sin cargar.
- **NO** usar solo `Session.can(INSTRUCCIONES_WRITE_CAP)` — el catálogo legacy no tiene todas las caps ISS.
- **NO** parchear Viviana en código — el fix es migración 016 + contrato de rol.
- **NO** usar `Session.currentSession()` — no existe en `platform.ts`; rompe cache de permissions/me.

### Archivos tocados (referencia jul 2026)

- `js/api/apiClient.ts` — import `PATYIA_BRIDGE_LOCAL`
- `js/api/sessionApi.ts` — `patyChatAuditCap()` usa `canAccessOthers()`
- `js/api/systemConfigApi.ts` — cache key `Session.current()?.token`
- `js/tools/chat/useChatTool.ts` — `canAuditChat` desde `canAccessOthers`
- `js/tools/promptsSql/usePromptsSqlTool.ts` — `canPublish` OR instrucciones + prompts-operativos

### Verificación manual

1. Login como usuario con `admn_isapatyia` (ej. VRESTREPO).
2. Header → **Admn ISA-Paty**.
3. Prompts → guardar habilitado.
4. Chat → «Filtrar por usuario» → lista de terceros sin error de bridge.
5. ISS: `GET /api/permissions/me` → `roles: ["admn_isapatyia"]`, `canAccessOthers: true`, `canEditInstrucciones: true`.

### Fix jul 2026 — prompts solo lectura pese a rol correcto en BD

**Síntoma:** tooltip «No tienes permiso para publicar instrucciones PatyIA» (cap legacy `denyForbidden`).

**Causa:** `canPublish` solo leía `ME_CAPS` de `/api/permissions/me`. Si ese fetch no hidrataba (token vacío al primer intento, cache key desalineado, o ISS sin respuesta), `canEdit` quedaba `false` aunque `GET /system/instrucciones` devolvía `canEdit: true`.

**Fix (patrón ConfigTool):**
- `fetchInstruccionesPaty()` propaga `canEdit` del ISS → `setServerInstruccionesCanEdit()`.
- `canEditInstrucciones()` = `ME_CAPS` **OR** hint del GET instrucciones.
- `usePromptsSqlTool`: estado `instruccionesCanEdit` al cargar filas + `bootMeCaps(true)` en auth.
- Cache key de sesión: `token || username` (no solo token).

**NO hacer:** confiar solo en `Session.can("patyia.instrucciones.publish")` ni en `blockReason` de esa cap para habilitar edición.

