# @isa-components



Paquetes reutilizables del ecosistema InSoft — **cada uno con repo propio, demo GH Pages y CDN jsDelivr**.



| Componente | Repo | Demo GH Pages |

|------------|------|---------------|

| **front-shared** | [Jeff-Aporta/front-shared](https://github.com/Jeff-Aporta/front-shared) | [jeff-aporta.github.io/front-shared](https://jeff-aporta.github.io/front-shared/) · catálogo [neon-glass](https://jeff-aporta.github.io/front-shared/neon-glass/) |

| **lightbox** | [Jeff-Aporta/lightbox-zoom](https://github.com/Jeff-Aporta/lightbox-zoom) | [jeff-aporta.github.io/lightbox-zoom](https://jeff-aporta.github.io/lightbox-zoom/) |

| **swagger** | [Jeff-Aporta/swagger-viewer](https://github.com/Jeff-Aporta/swagger-viewer) | [jeff-aporta.github.io/swagger-viewer](https://jeff-aporta.github.io/swagger-viewer/) |
| **jagudeloe-react-ui** | [Jeff-Aporta/jagudeloe-react-ui](https://github.com/Jeff-Aporta/jagudeloe-react-ui) | [jeff-aporta.github.io/jagudeloe-react-ui](https://jeff-aporta.github.io/jagudeloe-react-ui/) |



Panel central: pestaña **Componentes** en [main-orchestrator-front](https://jeff-aporta.github.io/main-orchestrator-front/).



## Rutas en el monorepo



```

Personal/apps/components/

├── front-shared/           ← submodule Jeff-Aporta/front-shared (+ demo/neon-glass)

├── lightbox/
├── swagger/
└── jagudeloe-react-ui/

```



## Scripts



```bash

cd apps/src/scripts

npm run gen:component-demo         # build demos + index.html

npm run sync:component-refs        # pins jsDelivr en consumidores

node front/gen-viz-catalog.mjs     # panel Visualización MO

```



## Publicar demo (por componente)



1. `npm run build` en el componente (o `node scripts/build-*-demo.mjs` en front-shared)

2. `npm run gen:component-demo -- --component <id>`

3. Commit + push `main` → GitHub Actions publica `demo/` en Pages



**neon-glass:** kit visual en `front-shared/cdn/isa/js/ui/kits/neon-glass/`; demo en `front-shared/demo/neon-glass/`. Consumir vía `ISAFront.Glass` — no hay repo ni paquete npm aparte.

