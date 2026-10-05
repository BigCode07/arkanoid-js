# Juego de Arkanoid

Arkanoid hecho con HTML, CSS y JS vanilla (canvas 2D), cero dependencias.

## Cómo correrlo

Los módulos ES no cargan desde `file://`, así que hay que servir la carpeta por HTTP. Desde la raíz del repo:

```bash
python3 -m http.server 8000
```

Después abrir `http://localhost:8000`.

## Controles

| Acción | Tecla |
| --- | --- |
| Mover la paleta | `←` `→`, `A` `D` o el mouse dentro del canvas |
| Empezar, lanzar la bola, reiniciar | `Espacio` (lanzar también con click) |
| Pausar / reanudar | `P` o `Esc` |
| Silenciar / activar sonido | `M` |

## Reglas

- 3 vidas. Si la bola cae por abajo pierdes una; con 0 vidas es Game Over.
- 50 ladrillos en 5 filas. De arriba hacia abajo valen 50, 40, 30, 20 y 10 puntos.
- Destruir todos los ladrillos gana la partida.
- El récord se guarda en `localStorage` (clave `arkanoid:v1:highScore`).

- Cada ladrillo destruido suena (sintetizado con Web Audio): más agudo cuanto más arriba está la fila. El sonido se activa con el primer `Espacio` o click.

El diseño está en `specs/01-mvp-arkanoid.md` y `specs/02-brick-break-sound.md`.
