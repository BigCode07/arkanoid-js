# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Estado del proyecto

Juego de Arkanoid en HTML, CSS y JS **vanilla, cero dependencias** (ver `README.md`). Canvas 2D con módulos ES: `index.html`, `style.css` y `src/*.js` (`main`, `game`, `render`, `input`, `physics`, `bricks`, `storage`, `constants`).

Para correrlo hay que servir la raíz por HTTP (los módulos ES no cargan desde `file://`):

```bash
python3 -m http.server 8000   # abrir http://localhost:8000
```

Controles: `←` `→` / `A` `D` / mouse mueven la paleta; `Espacio` empieza, lanza y reinicia (lanzar también con click); `P` o `Esc` pausan.

No existen comandos de build, lint ni test; no asumirlos. Si se agrega alguno, documentarlo aquí (incluido cómo correr un solo test).

Restricción de diseño: no agregar dependencias, bundlers ni frameworks sin discutirlo antes.

## Flujo spec-driven

El desarrollo se guía por specs, no por código improvisado. Skills en `.agents/skills/` (origen: `Klerith/fernando-skills`, fijado en `skills-lock.json`):

- `/spec <descripción>` — diseña la spec con preguntas previas y la guarda en `specs/NN-slug.md` (numeración secuencial de dos dígitos, estado `Draft`). No escribe código. Crea `specs/.spec-config.yml` si no existe.
- `/spec-impl <NN-slug>` — implementa una spec **solo si su estado es "Aprobado"** (el humano cambia `Draft` → `Aprobado`). Crea y cambia a la rama `spec-NN-slug` (controlado por `AutoCreateBranch` en `specs/.spec-config.yml`), e implementa paso a paso con pausa para revisar el diff tras cada paso. Nunca commitea solo.

Convenciones de las specs: el idioma y los nombres de estado deben coincidir con las specs existentes; la plantilla está en `.agents/skills/spec/template.md`. Cambios al alcance van en la spec, no en el código "por sorpresa".

## Particularidades del repo

- Claude Code **no** lee `.agents/skills/`; solo lee `.claude/skills/`. Para que `/spec` y `/spec-impl` aparezcan como skills hay que enlazarlas (symlink) en `.claude/skills/`. Hoy `.claude/` no tiene skills útiles.
- El directorio no es un repositorio git todavía (`/spec-impl` requiere git para crear ramas).
