# Despliegue ISA PatyIA (frontend)

Dos ramas, dos entornos estáticos independientes.

| Rama | Entorno | URL | CI |
|------|---------|-----|-----|
| **`dev`** | Cloudflare Pages (pruebas) | [isa-patyia-dev.pages.dev](https://isa-patyia-dev.pages.dev/) | job `cloudflare-dev` en [deploy-front.yml](.github/workflows/deploy-front.yml) |
| **`main`** | GitHub Pages (producción) | [jeff-aporta.github.io/isa-patyia](https://jeff-aporta.github.io/isa-patyia/) | job `github-pages` en [deploy-front.yml](.github/workflows/deploy-front.yml) |

## Flujo de trabajo

1. Desarrollar y hacer push en **`dev`** → se publica automáticamente en Cloudflare Pages.
2. Probar en la URL dev.
3. Cuando esté aprobado: **merge `dev` → `main`** → GitHub Pages actualiza producción.
4. **Siempre** registrar el merge en la tabla **Historial de merges a producción** (abajo). No cerrar el merge sin esta fila.

```bash
git checkout dev
# ... cambios + gen-front-dist ...
git push origin dev

# Tras QA:
git checkout main
git merge dev
git push origin main
```

## Setup inicial (una vez)

### 1. Proyecto Cloudflare Pages

```powershell
cd frontend
.\scripts\setup-cloudflare-pages.ps1
```

Crea el proyecto `isa-patyia-dev` con rama de producción `dev`.

### 2. Secretos en GitHub (`Jeff-Aporta/isa-patyia`)

```powershell
.\scripts\setup-github-secrets.ps1
```

Configura `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID` (mismos que Workers/R2 del workspace).

### 3. GitHub Pages (rama `main`)

En el repo [isa-patyia](https://github.com/Jeff-Aporta/isa-patyia): **Settings → Pages → Build and deployment → GitHub Actions**.

El workflow sube el directorio raíz del front (`index.html` + `_dist/`).

## Build local antes de push

```bash
cd Personal/apps/src/scripts
node gen-front-dist.mjs --slug isa-patyia
node gen-front-index.mjs --slug isa-patyia
```

## Disparo manual

**Actions → Deploy ISA PatyIA front → Run workflow**  
Opción `target`: `auto` (según rama), `github-pages` o `cloudflare-dev`.

## Historial de merges a producción

Cada fila es el **último preview de Cloudflare validado en `dev`** antes de integrar a `main`. La URL con hash queda congelada en ese deploy; [isa-patyia-dev.pages.dev](https://isa-patyia-dev.pages.dev/) siempre apunta al último push en `dev`.

Al hacer merge a `main`, **siempre** añadir una fila (obligatorio, antes de cerrar el merge): fecha, enlace `https://xxxx.isa-patyia-dev.pages.dev` (GitHub → **Deployments** → `isa-patyia-dev (Production)` → **View deployment**), commit corto de `dev` y nota breve. La fila nueva va **arriba** (más reciente primero).

| Fecha merge | Preview Cloudflare (`dev`) | Commit `dev` | Notas |
|-------------|----------------------------|--------------|-------|
| 2026-06-22 | [d66a1774.isa-patyia-dev.pages.dev](https://d66a1774.isa-patyia-dev.pages.dev/) | `b8d77f4` | Chat: consulta unificada mensajes/registro; Prompts dots y editor doble clic; login UX; TodosPublicHome; pins CDN lightbox/_dist; ConvLog y layout |
| 2026-06-19 | [93de6468.isa-patyia-dev.pages.dev](https://93de6468.isa-patyia-dev.pages.dev/) | `568a1a0` | Chat: sidebar, badges meta, selección conv; SCRUM home light y drag; fix guardar instrucciones; cursor en clickables |
| 2026-06-19 | [37d05d3e.isa-patyia-dev.pages.dev](https://37d05d3e.isa-patyia-dev.pages.dev/) | `44930d4` | Primera integración dev→main: flujo dual CF/GH Pages, badges meta compactos, emoji 🧪 prueba workflow |
