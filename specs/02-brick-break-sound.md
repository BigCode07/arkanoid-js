# SPEC 02 — Sonido al romper un ladrillo

> **Status:** approved
> **Depends on:** SPEC 01
> **Date:** 2026-10-04
> **Objective:** Reproducir un sonido sintetizado con Web Audio cada vez que la bola destruye un ladrillo, con un tono distinto por fila y silenciable con la tecla `M`.

## Scope

**In:**

- Un sonido corto por cada ladrillo destruido, generado con la Web Audio API (sin archivos de audio).
- Tono según la fila del ladrillo: la fila superior (50 pts) suena más aguda y la inferior (10 pts) más grave.
- Tecla `M` alterna silencio/sonido durante cualquier estado del juego. El estado de mute no se persiste.
- El audio se desbloquea con el primer gesto del usuario (Espacio o click), por la política de autoplay de los navegadores.
- Si Web Audio no está disponible o falla, el juego sigue funcionando sin sonido y sin errores.
- Documentar la tecla `M` en `README.md` y `CLAUDE.md`.

**Out of scope (para futuras specs):**

- Sonidos de paleta, paredes, perder vida, victoria o game over.
- Música de fondo.
- Archivos de audio (`.wav`, `.mp3`) y carpeta `assets/`.
- Persistir el mute en `localStorage`.
- Indicador visual de mute en el HUD.
- Control de volumen.

## Data model

Datos nuevos en `src/constants.js`:

```js
export const AUDIO = {
  rowFrequencies: [988, 880, 784, 698, 622], // Hz, una por fila (arriba a abajo)
  duration: 0.08,                            // segundos
  volume: 0.15,                              // ganancia 0..1
  wave: "triangle",
};
```

Cambios sobre estructuras existentes:

```js
// src/bricks.js — cada ladrillo guarda su fila
{ x, y, width, height, points, color, alive, row }

// src/physics.js — bounceBricks devuelve el ladrillo destruido, o null si no hubo golpe
// (antes devolvía los puntos). game.js suma brick.points al puntaje.
```

Estado del módulo de audio, nuevo `src/audio.js` (vive fuera de `state`, no se reinicia al reiniciar partida):

```js
// createAudio() → { unlock(), playBrick(row), toggleMute() }
// Interno: context (AudioContext | null, creado en unlock), muted (boolean, inicia en false).
```

Convenciones:

- `row` es el índice 0..4 de arriba hacia abajo y coincide con los índices de `BRICKS.rowPoints` y `AUDIO.rowFrequencies`.
- `input.mute` es una acción de un solo disparo, igual que `launch`, `confirm` y `pause`.

## Implementation plan

1. Agregar `row` a cada ladrillo en `src/bricks.js`. Cambiar `bounceBricks` en `src/physics.js` para devolver el ladrillo destruido (o `null`) y ajustar `src/game.js` para sumar `brick.points`. Verificar: el puntaje sigue subiendo 50/40/30/20/10 según fila y el juego no lanza errores.
2. Agregar `AUDIO` en `src/constants.js` y crear `src/audio.js` con `createAudio()` (`unlock`, `playBrick`, `toggleMute`). `playBrick(row)` genera un oscilador con envolvente de ganancia que decae en `AUDIO.duration` y se ignora si `muted` o no hay contexto. Verificar: importar el módulo no rompe la carga de la página.
3. Conectar en `src/game.js`: crear el audio en `startGame`, llamar `unlock()` cuando `launch` o `confirm` se consumen, y llamar `playBrick(brick.row)` al destruir un ladrillo. Verificar: lanzar la bola y romper ladrillos de distintas filas produce un sonido por ladrillo, con tonos distintos.
4. Agregar la acción `mute` en `src/input.js` (tecla `KeyM`, un solo disparo sin repetición) y en `src/game.js` llamar `toggleMute()` al consumirla, en cualquier estado. Verificar: con `M` el sonido se silencia y vuelve; el estado de la partida no cambia.
5. Documentar la tecla `M` y el sonido en `README.md` y `CLAUDE.md`, y referenciar `specs/02-brick-break-sound.md`. Verificar: ambas tablas de controles incluyen `M`.

## Acceptance criteria

- [ ] Con `python3 -m http.server` en la raíz, el juego carga sin errores ni warnings en la consola.
- [ ] Cada ladrillo destruido produce exactamente un sonido.
- [ ] El sonido de un ladrillo de la fila superior es más agudo que el de la fila inferior (frecuencias de `AUDIO.rowFrequencies`).
- [ ] Antes del primer Espacio o click no se reproduce sonido ni aparece el warning de autoplay de `AudioContext` en la consola.
- [ ] Presionar `M` silencia los sonidos siguientes; presionar `M` otra vez los restaura.
- [ ] `M` funciona en `ready`, `playing` y `paused`, y no cambia `state.status`.
- [ ] Mantener `M` presionada no alterna el mute repetidamente.
- [ ] Romper un ladrillo sigue sumando 50, 40, 30, 20 o 10 puntos según la fila.
- [ ] Reiniciar la partida con Espacio conserva el estado de mute elegido.
- [ ] Recargar la página deja el sonido activado (el mute no se persiste).
- [ ] Si `window.AudioContext` no existe, el juego funciona completo sin lanzar errores.
- [ ] Romper ladrillos seguidos en el mismo frame o en frames consecutivos no genera clics ni distorsión audibles.
- [ ] El repo no suma archivos de audio, `package.json` ni dependencias.
- [ ] `README.md` y `CLAUDE.md` documentan la tecla `M`.

## Decisions

- **Sí:** Web Audio API con oscilador. Cero archivos y cero dependencias, coherente con la restricción del repo.
- **No:** Archivos `.wav`/`.mp3`. Obligan a conseguir y versionar un asset, y a manejar licencia y carga.
- **Sí:** Tono por fila. Da feedback del valor del ladrillo y evita un sonido monótono.
- **No:** Un único tono fijo. Más simple, pero se pierde el feedback.
- **Sí:** Tecla `M` sin persistir. Cubre el caso de silenciar sin agregar una clave nueva en `localStorage`.
- **No:** Persistir el mute. Más superficie (clave versionada, `try/catch`) para un caso menor; va en otra spec si hace falta.
- **Sí:** Alcance solo ladrillo roto. Es lo pedido; los demás eventos suman mezcla y decisiones de diseño sonoro.
- **Sí:** Que `bounceBricks` devuelva el ladrillo y `game.js` sume los puntos. Evita deducir la fila a partir de los puntos y mantiene la física sin conocer el audio.
- **No:** Llamar al audio desde `physics.js`. Acopla la física con un efecto secundario.
- **Sí:** `AudioContext` creado en el primer gesto. Cumple la política de autoplay de los navegadores.
- **Sí:** Audio fuera de `state`. No es estado de juego y no debe reiniciarse con la partida.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Política de autoplay: el `AudioContext` queda suspendido y no suena nada | Crear/reanudar el contexto en `unlock()` al consumir `launch` o `confirm`, que siempre ocurren tras un gesto del usuario. |
| Clics audibles al cortar el oscilador de golpe | Envolvente de ganancia con decaimiento hasta cerca de 0 antes de `stop()`. |
| Navegador sin Web Audio o excepción al crear el contexto | `try/catch` en `unlock()` y `playBrick()`; sin contexto, el audio queda inactivo y el juego sigue. |
| Muchos osciladores simultáneos si caen varios ladrillos seguidos | Cada sonido dura 0,08 s y la física destruye como máximo un ladrillo por frame, así que el solapamiento es mínimo. |
| Cambiar el retorno de `bounceBricks` rompe `game.js` | Se hace en el paso 1, junto con el ajuste de `game.js` y su verificación de puntaje. |

## What is **not** in this spec

- Sonidos de paleta, paredes, vidas, victoria o game over.
- Música de fondo.
- Archivos de audio o carpeta `assets/`.
- Persistencia del mute.
- Indicador visual de mute en el HUD.
- Control de volumen.

Cada uno de esos puntos, si se hace, va en su propia spec.
