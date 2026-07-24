# IASOFTLAB

Sitio de presentación de un laboratorio de software con IA. Estático, sin build,
sin dependencias: HTML + CSS + JavaScript vanilla.

## Correrlo

```bash
node dev-server.mjs
```

Después abrí <http://localhost:4173>. También funciona con doble clic en
`index.html`, pero conviene el servidor para que las rutas relativas y las
fuentes se comporten igual que en producción.

Para publicarlo alcanza con subir la carpeta tal cual a cualquier hosting
estático (Netlify, Vercel, GitHub Pages, S3). `dev-server.mjs` y `.claude/` no
hacen falta en el deploy.

## Cómo está armado

```
index.html
assets/
  css/
    base.css        tokens, reset, tipografía, nav, cursor, footer
    sections.css    cada sección del sitio
  js/
    data.js         TODO el contenido: rubros, capacidades, respuestas del agente
    utils.js        helpers + bus de estado compartido
    hero-particles.js   campo de partículas que arma la marca
    industry-dial.js    disco orbital de rubros (tablist accesible)
    solution-compiler.js  chips → diagrama SVG + estimaciones
    pipeline.js     riel horizontal manejado por scroll vertical
    agent-demo.js   agente de demostración, 100% en el cliente
    site.js         boot, cursor, nav, revelados, contadores, formulario
    main.js         orden de arranque
```

### La idea

El sitio no es una secuencia de secciones independientes: **el rubro elegido en
el disco orbital se propaga a todo lo demás**. Al seleccionar "Legal", el
compilador precarga las capacidades recomendadas para ese rubro, el agente de
demo cambia de contexto y el formulario de contacto se autocompleta con lo que
el visitante configuró. Eso vive en un store mínimo (`utils.js`), y cada módulo
se suscribe a lo que le importa.

### Editar contenido

Casi todo se cambia en `assets/js/data.js`:

- `ISL.industries` — rubros: claim, dolor, módulos, métricas, stack y qué
  capacidades se recomiendan (`recommends`).
- `ISL.capabilities` — capacidades del compilador. `weeks`, `impact` y `load`
  alimentan las estimaciones; `inputs`/`outputs` dibujan el diagrama.
- `ISL.agentIntents` — respuestas del agente por intención (match por palabra
  clave, sin tildes).

Las fórmulas de estimación están en `Compiler.prototype.estimate`
(`solution-compiler.js`), comentadas y en un solo lugar.

## Decisiones

- **Sin framework ni build.** El sitio es contenido y movimiento; React no
  aportaba nada y agregaba toolchain. Si más adelante entra un CMS o rutas,
  migrar a Vite es directo.
- **Un solo acento.** Tinta casi negra, hueso y lima reactivo. La elegancia sale
  del contraste serif/mono y del aire, no de gradientes.
- **`prefers-reduced-motion` respetado en serio.** Partículas estáticas, riel
  horizontal desactivado, tipeo instantáneo, sin cursor custom.
- **Accesibilidad.** El disco es un `tablist` real con roving tabindex y flechas;
  el compilador anuncia sus resultados en una sola región `aria-live` (los
  contadores animados no se leen frame por frame); el formulario valida con
  errores asociados por `aria-describedby`.

## Pendiente para producción

- El formulario no envía: confirma en el cliente. Falta conectar backend,
  Formspree o similar en `ISL.initForm` (`site.js`).
- Las cifras de la banda de impacto y de cada rubro son ilustrativas: hay que
  reemplazarlas por datos reales antes de publicar.
- Faltan imagen de Open Graph propia y favicon en archivo (hoy es un SVG inline).
