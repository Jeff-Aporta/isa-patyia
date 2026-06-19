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
