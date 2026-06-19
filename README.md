<p align="center">
  <img src="https://api.iconify.design/mdi/robot-happy-outline.svg?color=%231e90ff&width=160&height=160" alt="ISA PatyIA" width="160" />
</p>

<h1 align="center">ISA PatyIA</h1>

<p align="center">
  <a href="https://isa-patyia-dev.pages.dev/"><img src="https://img.shields.io/badge/Cloudflare%20Pages-dev-f38020?logo=cloudflare&logoColor=white" alt="Cloudflare Pages dev" /></a>
  <a href="https://jeff-aporta.github.io/isa-patyia/"><img src="https://img.shields.io/badge/GitHub%20Pages-producción-2ea44f?logo=github&logoColor=white" alt="GitHub Pages" /></a>
  <a href="https://github.com/Jeff-Aporta/isa-patyia"><img src="https://img.shields.io/badge/repo-isa--patyia-181717?logo=github&logoColor=white" alt="Repositorio" /></a>
  <img src="https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white" alt="React 18" />
  <img src="https://img.shields.io/badge/MUI-9-007FFF?logo=mui&logoColor=white" alt="MUI 9" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
</p>

<p align="center">
  <strong>Dev (rama <code>dev</code>):</strong> <a href="https://isa-patyia-dev.pages.dev/">https://isa-patyia-dev.pages.dev/</a><br />
  <strong>Producción (rama <code>main</code>):</strong> <a href="https://jeff-aporta.github.io/isa-patyia/">https://jeff-aporta.github.io/isa-patyia/</a>
</p>

## Descripción

Aplicación web para apoyo operativo de **PatyIA**: visor de logs, instrucciones Prompts→SQL, chat y DevFlow.

| Herramienta | Para qué sirve |
|-------------|----------------|
| **Visor de log** | Trazas y mensajes de conversaciones PatyIA. |
| **Prompts → SQL** | Edición e importación de instrucciones staging. |
| **Chat** | Conversaciones con PatyIA. |
| **DevFlow** | Tablero kanban SCRUM. |

## Ramas y despliegue

- Trabajo diario en **`dev`** → [Cloudflare Pages](https://isa-patyia-dev.pages.dev/).
- Cuando QA aprueba → merge a **`main`** → [GitHub Pages](https://jeff-aporta.github.io/isa-patyia/).

Detalle del CI y setup: [DEPLOY.md](DEPLOY.md).

### Historial de merges a producción

Cada fila es el **último preview de Cloudflare validado en `dev`** antes de integrar a `main`. La URL con hash queda congelada en ese deploy; [isa-patyia-dev.pages.dev](https://isa-patyia-dev.pages.dev/) siempre apunta al último push en `dev`.

Al hacer merge a `main`, añadir una fila: fecha, enlace `https://xxxx.isa-patyia-dev.pages.dev` (GitHub → **Deployments** → `isa-patyia-dev (Production)` → **View deployment**), commit corto de `dev` y nota breve.

| Fecha merge | Preview Cloudflare (`dev`) | Commit `dev` | Notas |
|-------------|----------------------------|--------------|-------|
| 2026-06-19 | [37d05d3e.isa-patyia-dev.pages.dev](https://37d05d3e.isa-patyia-dev.pages.dev/) | `44930d4` | Primera integración dev→main: flujo dual CF/GH Pages, badges meta compactos, emoji 🧪 prueba workflow |

<p align="center">
  <sub>Jeff-Aporta · PatyIA · <a href="https://github.com/Jeff-Aporta/isa-patyia">isa-patyia</a></sub>
</p>
