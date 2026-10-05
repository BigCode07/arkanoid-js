import { EXPLOSION } from "./constants.js";

export function createEffects() {
  return { particles: [], rings: [], flashes: [], texts: [], shake: 0 };
}

const rand = (min, max) => min + Math.random() * (max - min);

export function spawnExplosion(effects, brick, reducedMotion) {
  effects.flashes.push({ x: brick.x, y: brick.y, width: brick.width, height: brick.height, life: 1 });
  if (reducedMotion) return;

  const cx = brick.x + brick.width / 2;
  const cy = brick.y + brick.height / 2;
  const count = Math.min(EXPLOSION.particles, EXPLOSION.maxParticles - effects.particles.length);

  for (let i = 0; i < count; i++) {
    const direction = Math.random() * Math.PI * 2;
    const speed = rand(...EXPLOSION.particleSpeed);
    effects.particles.push({
      x: brick.x + Math.random() * brick.width,
      y: brick.y + Math.random() * brick.height,
      vx: Math.cos(direction) * speed,
      vy: Math.sin(direction) * speed,
      size: rand(...EXPLOSION.particleSize),
      angle: Math.random() * Math.PI * 2,
      spin: rand(-12, 12),
      life: 1,
      color: brick.color,
    });
  }

  effects.rings.push({ x: cx, y: cy, life: 1, color: brick.color });
  effects.texts.push({ x: cx, y: cy, life: 1, value: brick.points });
  effects.shake = EXPLOSION.shakeDuration;
}

export function updateEffects(effects, dt) {
  const step = dt / EXPLOSION.duration;

  for (const p of effects.particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += EXPLOSION.gravity * dt;
    p.angle += p.spin * dt;
    p.life -= step;
  }
  for (const item of effects.rings) item.life -= step;
  for (const item of effects.texts) item.life -= step;
  for (const f of effects.flashes) f.life -= dt / EXPLOSION.flashDuration;
  effects.shake = Math.max(0, effects.shake - dt);

  for (const key of ["particles", "rings", "texts", "flashes"]) {
    effects[key] = effects[key].filter((item) => item.life > 0);
  }
}
