# SPEC 03 — Explosión al destruir un ladrillo

> **Status:** approved
> **Depends on:** SPEC 01, SPEC 02
> **Date:** 2026-10-05
> **Objective:** Mostrar una explosión moderna de ~0,5 s (destello, fragmentos, onda expansiva con glow, texto de puntos y sacudida leve) en cada ladrillo que la bola destruye.

## Scope

**In:**

- Explosión en la posición del ladrillo destruido, con el color de su fila (`brick.color`).
- Destello: el rectángulo del ladrillo se ve blanco y se desvanece en ~0,12 s.
- Fragmentos: 14 partículas rectangulares en el color del ladrillo, con velocidad radial aleatoria, rotación, gravedad y desvanecimiento.
- Onda expansiva: anillo que crece desde el centro del ladrillo con brillo (`shadowBlur`) y se desvanece.
- Texto flotante con los puntos (`+50`) que sube y se desvanece.
- Sacudida de pantalla (screen shake) leve de ~120 ms al romper un ladrillo.
- Duración total de la explosión ≈ 0,5 s.
- Las animaciones se congelan en pausa, siguen en `ready`, `gameover` y `won`, y se limpian al reiniciar la partida.
- Respeta `prefers-reduced-motion: reduce`: solo destello breve, sin fragmentos, onda, texto ni sacudida.
- Documentar la explosión en `README.md` y `CLAUDE.md`, y referenciar `specs/03-brick-explosion.md`.

**Out of scope (para futuras specs):**

- Sonido distinto para la explosión (el sonido de SPEC 02 no cambia).
- Animaciones para paleta, paredes, pérdida de vida, victoria o game over.
- Estela (trail) de la bola.
- Opción en la UI para desactivar efectos.
- Persistir preferencias de efectos.
- Power-ups o ladrillos especiales con explosiones propias.
- Librerías de partículas, WebGL o dependencias nuevas.

## Data model

Constantes nuevas en `src/constants.js`:

```js
export const EXPLOSION = {
  duration: 0.5,         // segundos, vida máxima de fragmentos, onda y texto
  flashDuration: 0.12,   // segundos
  particles: 14,         // por ladrillo
  particleSpeed: [90, 260], // px/s, mínimo y máximo
  particleSize: [3, 7],  // px, lado mínimo y máximo
  gravity: 420,          // px/s²
  ringRadius: 48,        // px, radio final de la onda
  ringGlow: 14,          // px, shadowBlur
  textRise: 28,          // px que sube el texto
  shakeDuration: 0.12,   // segundos
  shakeMagnitude: 3,     // px máximos de desplazamiento
  maxParticles: 300,     // tope global de seguridad
};
```

Estado nuevo en `src/game.js` (dentro de `createState`, así se limpia al reiniciar):

```js
state.effects = {
  particles: [], // { x, y, vx, vy, size, angle, spin, life, color }
  rings: [],     // { x, y, life, color }
  flashes: [],   // { x, y, width, height, life }
  texts: [],     // { x, y, life, value }
  shake: 0,      // segundos restantes de sacudida
};
```

Convenciones:

- `life` va de `1` (recién creado) a `0` (terminado); se reduce con `dt / duración`.
- Los efectos terminados (`life <= 0`) se eliminan del arreglo.
- `reducedMotion` se lee una sola vez al iniciar con `window.matchMedia("(prefers-reduced-motion: reduce)").matches`.
- Nuevo módulo `src/effects.js` exporta `spawnExplosion(effects, brick, reducedMotion)` y `updateEffects(effects, dt)`. No toca `state` fuera de `effects` y no conoce el audio ni la física.

## Implementation plan

1. Agregar `EXPLOSION` en `src/constants.js`, crear `src/effects.js` con `spawnExplosion` y `updateEffects`, y agregar `effects` a `createState` en `src/game.js`. Verificar: la página carga sin errores en consola y el juego se comporta igual.
2. En `src/game.js`: llamar `spawnExplosion(state.effects, brick, reducedMotion)` al destruir un ladrillo, y `updateEffects(state.effects, dt)` en cada frame salvo en `start` y `paused`. Verificar: sin errores en consola al romper ladrillos; la pausa no rompe el juego.
3. En `src/render.js`: dibujar destello y fragmentos (rectángulos rotados con `globalAlpha` según `life`). Verificar: al romper un ladrillo aparece un destello blanco y 14 fragmentos del color de su fila que caen y se desvanecen.
4. En `src/render.js`: dibujar la onda expansiva con `shadowBlur` y el texto flotante `+puntos`. Verificar: aparece un anillo con brillo que crece y un `+50`/`+40`/… que sube y se desvanece.
5. Sacudida: `spawnExplosion` fija `effects.shake`, `updateEffects` lo reduce y `render` aplica `ctx.save()` + `translate` aleatorio proporcional al tiempo restante + `ctx.restore()`. Verificar: el canvas vibra levemente ~120 ms al romper y vuelve a quedar quieto.
6. Movimiento reducido: leer `prefers-reduced-motion` en `startGame` y pasarlo a `spawnExplosion`, que en ese caso solo crea el destello. Verificar: con la preferencia activada en el sistema o en DevTools (Rendering → Emulate CSS prefers-reduced-motion) solo se ve el destello.
7. Documentar la explosión en `README.md` y `CLAUDE.md` y referenciar `specs/03-brick-explosion.md`. Verificar: ambos archivos mencionan la explosión y la spec.

## Acceptance criteria

- [ ] Con `python3 -m http.server` en la raíz, el juego carga sin errores ni warnings en la consola.
- [ ] Cada ladrillo destruido genera exactamente una explosión en su posición.
- [ ] Los fragmentos y la onda usan el color de la fila del ladrillo (`brick.color`).
- [ ] Cada explosión crea 14 fragmentos, un destello, una onda y un texto con los puntos del ladrillo (`+50`, `+40`, `+30`, `+20` o `+10`).
- [ ] La explosión desaparece por completo en ~0,5 s (sin fragmentos ni anillos residuales).
- [ ] El canvas se sacude ~120 ms al romper un ladrillo y vuelve a su posición original, sin desplazar permanentemente el dibujo.
- [ ] En pausa (`P` o `Esc`) la explosión queda congelada y continúa al reanudar.
- [ ] La última explosión se completa al ganar (`won`) y la de un ladrillo que cae junto a perder la última vida sigue en `gameover`.
- [ ] Reiniciar la partida con Espacio elimina cualquier efecto en curso.
- [ ] Con `prefers-reduced-motion: reduce` solo se ve el destello: sin fragmentos, onda, texto ni sacudida.
- [ ] Romper ladrillos seguidos no supera `EXPLOSION.maxParticles` partículas vivas.
- [ ] El puntaje, el sonido y la física (rebotes) se comportan igual que en SPEC 02.
- [ ] El repo no suma `package.json`, dependencias ni archivos de assets.
- [ ] `README.md` y `CLAUDE.md` documentan la explosión.

## Decisions

- **Sí:** Canvas 2D puro con partículas propias. Cero dependencias, coherente con la restricción del repo.
- **No:** Librería de partículas o WebGL. Sobredimensionado para un efecto de ~14 partículas.
- **Sí:** Destello + fragmentos + onda con glow + texto + sacudida. Combinación elegida para que el efecto se vea moderno y llame la atención.
- **No:** Partículas neón con composición aditiva (`lighter`). Más costo de render y estética distinta a la pedida.
- **Sí:** 14 partículas y ~0,5 s. Se nota sin tapar la bola ni molestar al seguir jugando.
- **Sí:** Sacudida leve (3 px, 120 ms). Da impacto sin marear con ladrillos seguidos.
- **Sí:** Efectos en `state.effects`. Se reinician solos con `createState` al reiniciar partida.
- **Sí:** Efectos activos en `ready`, `gameover` y `won`, congelados solo en `paused` y `start`. Evita que la explosión del último ladrillo quede cortada.
- **Sí:** `prefers-reduced-motion` con solo destello. Accesibilidad sin perder el feedback del golpe.
- **No:** Opción de UI para apagar efectos. Va en otra spec si hace falta.
- **Sí:** Módulo `src/effects.js` separado, sin llamarlo desde `physics.js`. La física no conoce los efectos, igual que con el audio en SPEC 02.
- **Sí:** `Math.random()` para dispersión. Los efectos son cosméticos y no necesitan ser deterministas.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| `shadowBlur` es costoso y puede bajar los FPS con muchas ondas | Una onda por ladrillo y vida de 0,5 s; el tope de la física es un ladrillo por frame. |
| Acumulación de partículas con ladrillos seguidos | Tope `EXPLOSION.maxParticles`; si se supera, no se crean fragmentos nuevos. |
| Estado del canvas contaminado (`globalAlpha`, `shadowBlur`, transformación) | Cada dibujo de efectos va entre `ctx.save()` y `ctx.restore()`. |
| `dt` grande tras cambiar de pestaña desordena la animación | `dt` ya está limitado por `MAX_DT` en `game.js`. |
| La sacudida desplaza el HUD y el overlay | Aplicar la traslación solo al dibujar el campo de juego; el HUD y el overlay se dibujan sin ella. |

## What is **not** in this spec

- Sonido nuevo para la explosión.
- Efectos para paleta, paredes, vidas, victoria o game over.
- Estela de la bola.
- Opción en la UI para apagar efectos.
- Librerías de partículas o WebGL.

Cada uno de esos puntos, si se hace, va en su propia spec.
