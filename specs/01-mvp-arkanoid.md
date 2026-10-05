# SPEC 01 — MVP jugable de Arkanoid

> **Status:** Approved
> **Depends on:** —
> **Date:** 2026-10-04
> **Objective:** Construir un Arkanoid jugable en el navegador con HTML, CSS y JS vanilla (canvas 2D, un nivel fijo, vidas, puntaje, estados de juego y high score persistido).

## Scope

**In:**

- Un único nivel fijo: 5 filas x 10 columnas de ladrillos, 1 golpe destruye cada uno.
- Paleta controlada con teclado (flechas o A/D) y mouse (sigue el cursor dentro del canvas).
- Bola con rebote en paredes, techo, paleta y ladrillos; ángulo de rebote en paleta según punto de impacto.
- 3 vidas. La bola cae por abajo: pierde una vida y vuelve a quedar pegada a la paleta.
- Puntaje en pantalla. Ladrillos por fila: 50, 40, 30, 20, 10 puntos (fila superior vale más).
- Estados: `start`, `ready` (bola pegada), `playing`, `paused`, `gameover`, `won`.
- High score persistido en `localStorage`.
- Render en canvas 2D con loop `requestAnimationFrame` y delta time.
- Estructura de módulos ES, ejecutada con servidor estático (`python3 -m http.server`).
- Documentar cómo correr el juego en `README.md` y `CLAUDE.md`.

**Out of scope (para futuras specs):**

- Múltiples niveles o progresión de dificultad.
- Power-ups, ladrillos de varios golpes o indestructibles.
- Sonido y música.
- Soporte táctil / móvil.
- Tabla de high scores con varios registros o nombres de jugador.
- Menú de opciones, selector de dificultad, tests automatizados.
- Efectos de partículas y animaciones elaboradas.

## Data model

```js
// src/constants.js
export const CANVAS = { width: 800, height: 600 };
export const PADDLE = { width: 100, height: 14, y: 560, speed: 520 }; // px/s
export const BALL = { radius: 8, speed: 360, maxAngle: Math.PI / 3 }; // 60° desde la vertical
export const BRICKS = {
  rows: 5, cols: 10, width: 70, height: 22, gap: 6,
  offsetTop: 70, rowPoints: [50, 40, 30, 20, 10],
  rowColors: ["#e63946", "#f4a261", "#e9c46a", "#2a9d8f", "#4361ee"],
};
export const LIVES = 3;
export const STORAGE_KEY = "arkanoid:v1:highScore";

// src/game.js — estado del juego
const state = {
  status: "start", // start | ready | playing | paused | gameover | won
  score: 0,
  highScore: 0,    // leído de localStorage al iniciar
  lives: 3,
  paddle: { x: 0, y: 0, width: 0, height: 0 },
  ball: { x: 0, y: 0, vx: 0, vy: 0, radius: 0 },
  bricks: [/* { x, y, width, height, points, color, alive } */],
};
```

Convenciones:

- Origen de coordenadas arriba a la izquierda; `y` crece hacia abajo.
- Velocidades en px/s; el movimiento se multiplica por `dt` en segundos.
- Se limita `dt` a un máximo (p. ej. 1/30 s) para evitar saltos al volver de otra pestaña.
- Canvas con tamaño lógico fijo 800x600; CSS lo escala manteniendo proporción.
- Archivos previstos:
  - `index.html`
  - `style.css`
  - `src/constants.js`
  - `src/input.js`
  - `src/storage.js`
  - `src/bricks.js`
  - `src/physics.js`
  - `src/render.js`
  - `src/game.js`
  - `src/main.js`

## Implementation plan

1. Crear `index.html`, `style.css` y `src/main.js` con un `<canvas>` 800x600 centrado y fondo pintado. Agregar `src/constants.js`. Verificar: `python3 -m http.server`, abrir la página, ver el canvas sin errores en consola.
2. Crear el loop en `src/game.js` (`requestAnimationFrame`, `dt` limitado) y `src/render.js` que dibuja la paleta estática. Verificar: la paleta aparece.
3. Crear `src/input.js` (teclado flechas/A/D y mouse) y mover la paleta limitada a los bordes del canvas. Verificar: se mueve con teclado y mouse sin salirse.
4. Agregar la bola pegada a la paleta (`status: "ready"`) y lanzarla con Espacio o click (`playing`). Rebote en paredes y techo. Verificar: la bola rebota en tres bordes.
5. Rebote bola-paleta en `src/physics.js` con ángulo según punto de impacto (centro vertical, bordes hasta 60°) y velocidad constante. Verificar: golpear por la izquierda de la paleta desvía a la izquierda, y viceversa.
6. Crear `src/bricks.js` (generar grilla 5x10) y renderizarla con color por fila. Verificar: 50 ladrillos visibles.
7. Colisión bola-ladrillo en `src/physics.js`: destruye el ladrillo, invierte `vx` o `vy` según el eje de menor penetración, suma puntos de la fila. Un ladrillo por frame. Verificar: ladrillos desaparecen y el puntaje sube 50/40/30/20/10 según fila.
8. Mostrar puntaje, high score y vidas en el canvas (HUD). Perder la bola resta una vida y vuelve a `ready`. Con 0 vidas, `gameover`. Verificar: tres caídas terminan la partida.
9. Condición de victoria: sin ladrillos vivos pasa a `won`. Verificar: destruir todos muestra victoria.
10. Pantallas de `start`, `gameover` y `won` con texto, y reinicio con Espacio que restaura puntaje, vidas, ladrillos, bola y paleta. Verificar: se puede jugar varias partidas seguidas.
11. Pausa con P o Esc (`playing` ⇄ `paused`) con texto "Pausa". Verificar: el juego se congela y reanuda sin perder velocidad ni posición.
12. Crear `src/storage.js`: leer/guardar high score en `STORAGE_KEY` con `try/catch` y fallback en memoria. Actualizarlo al terminar la partida si `score > highScore`. Verificar: recargar la página conserva el high score.
13. Documentar en `README.md` y `CLAUDE.md` cómo correr el juego (`python3 -m http.server 8000` y abrir `http://localhost:8000`) y los controles.

## Acceptance criteria

- [ ] Con `python3 -m http.server` en la raíz, `http://localhost:8000` carga el juego sin errores ni warnings en la consola.
- [ ] El repo no tiene `package.json`, `node_modules` ni scripts externos (cero dependencias).
- [ ] El canvas tiene tamaño lógico 800x600 y se ve completo en una ventana de 1280x720.
- [ ] Al cargar, se muestra la pantalla de inicio y Espacio la cierra y deja la bola pegada a la paleta.
- [ ] Las flechas izquierda/derecha y A/D mueven la paleta; el mouse dentro del canvas la sigue; la paleta nunca sale del canvas.
- [ ] Espacio o click lanza la bola desde el centro de la paleta hacia arriba.
- [ ] La bola rebota en paredes izquierda, derecha y techo.
- [ ] Golpear la bola con el borde izquierdo de la paleta la desvía a la izquierda y con el borde derecho a la derecha; el centro la envía casi vertical.
- [ ] La velocidad de la bola es la misma después de cada rebote (módulo constante en `BALL.speed`).
- [ ] Hay 50 ladrillos (5x10) con un color distinto por fila.
- [ ] Cada ladrillo destruido desaparece y suma exactamente 50, 40, 30, 20 o 10 puntos según su fila (de arriba hacia abajo).
- [ ] El HUD muestra puntaje, high score y vidas, y se actualizan en el mismo frame del cambio.
- [ ] Si la bola sale por abajo, las vidas bajan en 1 y la bola vuelve pegada a la paleta con `status: "ready"`.
- [ ] Al llegar a 0 vidas se muestra "Game Over" con el puntaje final y Espacio inicia una partida nueva con 3 vidas, 0 puntos y 50 ladrillos.
- [ ] Al destruir los 50 ladrillos se muestra "Victoria" con el puntaje final y Espacio reinicia.
- [ ] P o Esc pausa durante `playing`; la bola y la paleta no se mueven; volver a presionar reanuda desde el mismo punto.
- [ ] Si el puntaje final supera el high score, `localStorage["arkanoid:v1:highScore"]` se actualiza y el valor sobrevive a recargar la página.
- [ ] Con `localStorage` bloqueado (modo privado o excepción), el juego sigue funcionando y no lanza errores.
- [ ] Cambiar de pestaña 10 segundos y volver no hace que la bola atraviese ladrillos ni la paleta.
- [ ] `README.md` y `CLAUDE.md` documentan el comando para correr el juego y los controles.

## Decisions

- **Sí:** Canvas 2D. Estándar para este tipo de juego y colisiones simples con rectángulos y círculo.
- **No:** DOM + CSS por ladrillo. Más lento y más difícil de sincronizar con la física.
- **Sí:** Módulos ES en `src/*.js`. Separa responsabilidades y facilita specs futuras.
- **No:** Un único `game.js` o todo en `index.html`. Crece mal.
- **Sí:** Servidor estático con `python3 -m http.server`. Viene en macOS y no agrega dependencias. Los módulos ES no cargan desde `file://`.
- **Sí:** Teclado + mouse. Cubre desktop sin sumar eventos táctiles.
- **No:** Touch en esta spec. Más superficie de bugs; va en otra spec.
- **Sí:** Ángulo de rebote según punto de impacto, máximo 60° desde la vertical. Da control al jugador y evita ángulos casi horizontales.
- **No:** Reflexión simple. Poco control y partidas repetitivas.
- **Sí:** Velocidad de bola constante. Simplifica la física; la dificultad creciente queda para otra spec.
- **Sí:** Movimiento por `dt` limitado. Comportamiento independiente de la tasa de refresco del monitor.
- **Sí:** Un ladrillo por frame en colisión. Evita doble rebote que dejaría la bola atravesando la grilla.
- **Sí:** Clave `arkanoid:v1:highScore`. Permite migrar el formato después.
- **No:** Tabla de varios high scores ni nombres. Otra spec si hace falta.
- **Sí:** Espacio como tecla principal (iniciar, lanzar, reiniciar) y P/Esc para pausa. Pocas teclas, fácil de recordar.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Efecto túnel: la bola atraviesa ladrillos o paleta a `dt` grande | Limitar `dt` y, si hace falta, subdividir el paso de física en el mismo frame. |
| Doble rebote al tocar dos ladrillos a la vez | Resolver solo la colisión de menor penetración por frame. |
| Bola atrapada dentro de la paleta tras un rebote | Reposicionar la bola justo encima de la paleta al rebotar. |
| `localStorage` deshabilitado o con excepción | `try/catch` en `src/storage.js` con fallback en memoria; el juego sigue funcionando sin persistir. |
| Módulos ES no cargan abriendo `index.html` con doble click | Documentar el servidor estático en `README.md` y `CLAUDE.md`. |
| Bola con trayectoria casi horizontal que tarda en bajar | Limitar el ángulo máximo a 60° desde la vertical. |

## What is **not** in this spec

- Múltiples niveles ni dificultad progresiva.
- Power-ups, ladrillos de varios golpes o indestructibles.
- Sonido, música o efectos de partículas.
- Controles táctiles / versión móvil.
- Tabla de varios high scores o nombres de jugador.
- Build, bundlers, frameworks o tests automatizados.

Cada uno de esos puntos, si se hace, va en su propia spec.
