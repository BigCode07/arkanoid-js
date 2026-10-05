# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Estado del proyecto

Juego de Arkanoid en HTML, CSS y JS **vanilla, cero dependencias** (ver `README.md`). Canvas 2D con módulos ES: `index.html`, `style.css` y `src/*.js`.

Módulos en `src/`:

| Módulo | Responsabilidad |
| --- | --- |
| `main.js` | Punto de entrada |
| `game.js` | Estado y bucle del juego |
| `render.js` | Dibujo en canvas |
| `input.js` | Teclado y mouse |
| `physics.js` | Movimiento y colisiones |
| `bricks.js` | Generación de ladrillos |
| `storage.js` | Récord en `localStorage` |
| `constants.js` | Constantes (incluye `EXPLOSION`) |
| `audio.js` | Sonido sintetizado con Web Audio (SPEC 02) |
| `effects.js` | Explosiones y sacudida de pantalla (SPEC 03) |

Para correrlo hay que servir la raíz por HTTP (los módulos ES no cargan desde `file://`):

```bash
python3 -m http.server 8000   # abrir http://localhost:8000
```

Controles: `←` `→` / `A` `D` / mouse mueven la paleta; `Espacio` empieza, lanza y reinicia (lanzar también con click); `P` o `Esc` pausan; `M` silencia/activa el sonido (ver `specs/02-brick-break-sound.md`). Cada ladrillo destruido dispara una explosión animada (ver `specs/03-brick-explosion.md`).

No existen comandos de build, lint ni test; no asumirlos. Si se agrega alguno, documentarlo aquí (incluido cómo correr un solo test). La verificación es manual: correr el juego y recorrer los criterios de aceptación de la spec.

Restricción de diseño: no agregar dependencias, bundlers ni frameworks sin discutirlo antes.

## Flujo spec-driven

El desarrollo se guía por specs, no por código improvisado. Toda feature nueva pasa por una spec antes de tocar `src/`.

### Skills

Viven en `.agents/skills/` (origen: `Klerith/fernando-skills`, fijado en `skills-lock.json`) y se exponen a Claude Code con symlinks en `.claude/skills/` (`spec` y `spec-impl`). Ambas son de invocación manual (`disable-model-invocation`).

- `/spec <descripción>` — diseña la spec en 4 fases: contexto, preguntas, redacción, guardado. Hace preguntas previas en bloques de 3 a 5 y no escribe código. Guarda en `specs/NN-slug.md` (numeración secuencial de dos dígitos, estado `Draft`). Si la feature no cabe en una frase, propone dividirla. Crea `specs/.spec-config.yml` si no existe. Termina al guardar: no propone implementar.
- `/spec-impl <NN-slug>` — implementa una spec **solo si su estado es "Aprobado"** (el humano cambia `Draft` → `approved`; el skill acepta el término en cualquier idioma). Exige working tree limpio, crea y cambia a la rama `spec-NN-slug` (controlado por `AutoCreateBranch` en `specs/.spec-config.yml`; si la rama ya existe, retoma desde el último paso hecho), muestra objetivo, alcance, plan y criterios, y pide confirmación antes de empezar. Implementa un paso del plan por vez, con pausa para revisar el diff tras cada uno. Nunca commitea solo.

Ciclo completo de una feature:

1. `/spec` → `specs/NN-slug.md` en `Draft`.
2. El humano revisa y cambia el estado a `approved`.
3. `/spec-impl NN-slug` → rama `spec-NN-slug`, implementación paso a paso.
4. Verificar los criterios de aceptación uno por uno, pasar la spec a `Implemented` y commitear (el humano decide cuándo).
5. PR a `main` desde `spec-NN-slug` y merge. Historial actual: SPEC 02 → PR #1, SPEC 03 → PR #2.

### Estructura de una spec

Plantilla en `.agents/skills/spec/template.md`. Encabezado en blockquote, seguido de las secciones en este orden:

```
# SPEC NN — Título
> **Status:** Draft | In review | approved | Implemented | Obsolete
> **Depends on:** SPEC 01, SPEC 02
> **Date:** YYYY-MM-DD
> **Objective:** una sola frase
```

`## Scope` (con **In** y **Out of scope**, ambos obligatorios) → `## Data model` (código real; constantes nuevas en `src/constants.js`) → `## Implementation plan` (pasos numerados; cada uno deja el juego ejecutable y es commiteable solo) → `## Acceptance criteria` (checklist booleano verificable) → `## Decisions` (Yes/No con motivo) → `## Risks` (opcional) → `## What is **not** in this spec`.

### Convenciones

- Specs existentes: `01-mvp-arkanoid`, `02-brick-break-sound`, `03-brick-explosion`. La siguiente es `04-`.
- Las specs se escriben en español, con encabezados de sección y etiquetas del encabezado en inglés (como las existentes). Una spec nueva debe coincidir con ellas.
- Estados usados hoy: `Approved` (spec 01) y `approved` (specs 02 y 03). Mantener `approved` en minúscula para specs nuevas; `Draft` hasta que el humano apruebe.
- Cada spec declara de qué specs depende y debe referenciar solo specs existentes.
- Cada spec que cambia comportamiento visible o controles incluye un paso para actualizar `README.md` y este `CLAUDE.md` (como hicieron SPEC 02 y 03).
- Cambios al alcance van en la spec, no en el código "por sorpresa". Si algo queda fuera del alcance durante la implementación, anotarlo para la próxima spec y no implementarlo en la rama.
- Ante una ambigüedad que la spec no resuelve: parar, describirla, ofrecer 2-3 opciones y esperar decisión.

## Particularidades del repo

- Repositorio git con remoto `origin` (GitHub, `BigCode07`). Rama principal `main`; ramas de trabajo `spec-NN-slug`, integradas por Pull Request.
- `.gitignore` excluye `.agents/`, `.claude/` y `skills-lock.json`: las skills y sus symlinks son locales y no se suben. En un clon nuevo hay que recrearlas: copiar o instalar las skills en `.agents/skills/` y enlazarlas en `.claude/skills/` (`ln -s ../../.agents/skills/spec .claude/skills/spec`, idem `spec-impl`).
- Claude Code **no** lee `.agents/skills/`; solo `.claude/skills/`. Por eso los symlinks son necesarios para que `/spec` y `/spec-impl` aparezcan.
- `/spec-impl` falla si el working tree tiene cambios sin commitear: commitear o stashear antes (ver reglas de Git del `CLAUDE.md` global).
