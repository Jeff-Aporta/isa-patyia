# patyia-tools — Utilidades PatyIA (GH Pages)

App estática con layout tipo ISA-DOC (header + herramientas; **el body no hace scroll**, solo cada panel).

Copia de despliegue en el monorepo: `ISS-AyudasCPIA/apptools/patyia-apptools`.

## Herramientas

### Visor de log
- Recuperar por `iconversacion` (query `CONVERSACION_LOG` vía **lab** Azure).
- Pegar JSON de `conv-*.json` o respuesta `/api/patyia/conversacion/{id}/log`.
- Hilo como en ISA-DOC: user → operativas → assistant.

### Prompts → SQL
- **13 tabs** (una por instrucción `PROMPT_<TIPO>.md`).
- **Drag & drop** o selector de archivos `.md` → actualiza tabs al instante (solo en memoria).
- Mapeo automático a `INSTRUCCION` + `TDCONSULTAXINSTRUCCION`.
- SQL MSSQL (Paty staging) y SQL PostgreSQL (BD_LANGLAB / langlab) generados en vivo.
- **Guardar** → langlab vía sesión + token INTEGRACIONES.
- **Fusión PatyIA staging (MSSQL)** con candado + play → `/api/mssql/paty/exec`.
- Botones compactos con **Iconify** (`ButtonIconify`).

## Backend lab (Azure)

**URL online:** `https://rag-lab-bsczhqfgchgegabr.canadacentral-01.azurewebsites.net` (Function App `rag-lab`).

1. Switch **local / online** en el header: `local` → `http://localhost:5500`; `online` → Azure.
2. Estado en URL: query **`?s=`** (JSON en base64url) — herramienta activa, local/online, log, prompts.
3. **Prompts → SQL** carga al abrir las instrucciones desde `INSTRUCCION` vía `/api/mssql/paty/query` (sin auth).
4. **Iniciar sesión** → sesión por rol; mutaciones usan servicio INTEGRACIONES.

## Uso local

```bash
npx --yes serve .
```

## Despliegue GitHub Pages (Dev-InSoft)

- **Repo:** `Dev-InSoft/patyia-tools`
- **URL:** https://dev-insoft.github.io/patyia-tools/

### Publicar

```bash
cd apptools/patyia-apptools
git init
git add .
git commit -m "PatyIA AppTools estático para GH Pages"
git branch -M main
git remote add origin https://github.com/Dev-InSoft/patyia-tools.git
git push -u origin main
```

En GitHub: **Settings → Pages → Deploy from a branch** → `main` / `/ (root)`.  
El archivo `.nojekyll` evita que Jekyll ignore rutas con `_`.

## Stack

- React 18 + ReactDOM (UMD)
- Babel Standalone (JSX en el navegador)
- Emotion + MUI 5 (UMD)
- Iconify (`iconify-icon` CDN)
- marked (markdown en mensajes)

Sin build ni dependencias npm.

## Privacidad

El parseo de logs ocurre en el cliente. Las consultas/exec van al backend **lab** en Azure cuando el usuario autentica.
