// Entidades de la partida, portadas de `references/started-games/02-asteroids/game.js`.
// Cada entidad recibe el contexto de dibujo y la skin en `draw(ctx, skin)` y no guarda estado global de módulo.

import type { Keyboard } from "@/lib/arcade/shared/keyboard";
import { rand, randInt, wrap } from "@/lib/arcade/shared/math";
import {
  BULLET_COOLDOWN,
  BULLET_SPEED,
  BULLET_TTL,
  HEIGHT,
  POWERUP_LABEL_FONT,
  POWERUP_TTL,
  RADII,
  SHIP_DRAG,
  SHIP_INVINCIBILITY_DURATION,
  SHIP_RADIUS,
  SHIP_ROTATION_SPEED,
  SHIP_THRUST,
  SPEEDS,
  TRIPLE_SPREAD,
  WIDTH,
} from "@/lib/arcade/asteroids/constants";
import {
  applyGlow,
  clearGlow,
  fillPixels,
  hexToRgba,
  strokeShape,
} from "@/lib/arcade/asteroids/render";
import type { AsteroidsSkin } from "@/lib/arcade/asteroids/skins";

export class Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ttl = BULLET_TTL;
  radius = 2;
  dead = false;

  constructor(x: number, y: number, angle: number) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * BULLET_SPEED;
    this.vy = Math.sin(angle) * BULLET_SPEED;
  }

  update(dt: number): void {
    this.x = wrap(this.x + this.vx * dt, WIDTH);
    this.y = wrap(this.y + this.vy * dt, HEIGHT);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw(ctx: CanvasRenderingContext2D, skin: AsteroidsSkin): void {
    if (skin.pixelScale > 1) {
      // Cuadrado de 2×2 píxeles lógicos centrado en la bala
      fillPixels(
        ctx,
        Math.floor(this.x / skin.pixelScale) - 1,
        Math.floor(this.y / skin.pixelScale) - 1,
        2,
        skin.bullet,
      );
      return;
    }
    applyGlow(ctx, skin, skin.bullet);
    ctx.fillStyle = skin.bullet;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    clearGlow(ctx);
  }
}

export class Asteroid {
  x: number;
  y: number;
  size: number;
  radius: number;
  vx: number;
  vy: number;
  rotSpeed: number;
  rot: number;
  verts: [number, number][] = [];
  dead = false;

  constructor(x: number, y: number, size = 3) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.radius = RADII[size];

    const angle = rand(0, Math.PI * 2);
    const speed = SPEEDS[size] + rand(-15, 15);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.rotSpeed = rand(-1.2, 1.2);
    this.rot = rand(0, Math.PI * 2);

    const n = randInt(8, 13);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = this.radius * rand(0.6, 1.0);
      this.verts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
  }

  update(dt: number): void {
    this.x = wrap(this.x + this.vx * dt, WIDTH);
    this.y = wrap(this.y + this.vy * dt, HEIGHT);
    this.rot += this.rotSpeed * dt;
  }

  split(): Asteroid[] {
    if (this.size <= 1) return [];
    return [
      new Asteroid(this.x, this.y, this.size - 1),
      new Asteroid(this.x, this.y, this.size - 1),
    ];
  }

  draw(ctx: CanvasRenderingContext2D, skin: AsteroidsSkin): void {
    applyGlow(ctx, skin, skin.asteroid);
    strokeShape(
      ctx,
      skin,
      { x: this.x, y: this.y, rotation: this.rot },
      this.verts,
      skin.asteroid,
      true,
    );
    clearGlow(ctx);
  }
}

export class PowerUp {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius = 12;
  ttl = POWERUP_TTL;
  dead = false;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    const angle = rand(0, Math.PI * 2);
    const speed = rand(20, 40);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
  }

  update(dt: number): void {
    this.x = wrap(this.x + this.vx * dt, WIDTH);
    this.y = wrap(this.y + this.vy * dt, HEIGHT);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  // Parpadeo final: durante los últimos 2 s el power-up y su texto se apagan por tramos
  private blinkedOut(): boolean {
    return this.ttl < 2 && Math.floor(this.ttl * 8) % 2 === 0;
  }

  draw(ctx: CanvasRenderingContext2D, skin: AsteroidsSkin): void {
    if (this.blinkedOut()) return;
    const pulse = 0.85 + Math.sin(performance.now() / 150) * 0.15;
    const r = this.radius * pulse;
    if (skin.pixelScale > 1) {
      // Rombo: el cuadrado de lado 2r girado 45°
      strokeShape(
        ctx,
        skin,
        { x: this.x, y: this.y, rotation: Math.PI / 4 },
        [
          [-r, -r],
          [r, -r],
          [r, r],
          [-r, r],
        ],
        skin.powerUp,
        true,
      );
      return;
    }
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(Math.PI / 4);
    applyGlow(ctx, skin, skin.powerUp);
    ctx.strokeStyle = skin.powerUp;
    ctx.lineWidth = skin.lineWidth;
    ctx.strokeRect(-r, -r, r * 2, r * 2);
    clearGlow(ctx);
    ctx.restore();
  }

  // El texto «3x» se dibuja sobre el canvas principal (nunca en el búfer de Retro) para leerse a tamaño completo
  drawLabel(ctx: CanvasRenderingContext2D, skin: AsteroidsSkin): void {
    if (this.blinkedOut()) return;
    ctx.fillStyle = skin.powerUp;
    ctx.font = POWERUP_LABEL_FONT;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("3x", this.x, this.y);
  }
}

export class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  ttl: number;
  dead = false;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    const angle = rand(0, Math.PI * 2);
    const speed = rand(30, 130);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = rand(0.4, 1.1);
    this.ttl = this.life;
  }

  update(dt: number): void {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw(ctx: CanvasRenderingContext2D, skin: AsteroidsSkin): void {
    const alpha = this.ttl / this.life;
    if (skin.pixelScale > 1) {
      // Un píxel lógico sin transparencia que se apaga por pasos
      if (alpha > 0.25)
        fillPixels(
          ctx,
          Math.floor(this.x / skin.pixelScale),
          Math.floor(this.y / skin.pixelScale),
          1,
          skin.particle,
        );
      return;
    }
    ctx.strokeStyle = hexToRgba(skin.particle, alpha);
    ctx.lineWidth = skin.particleWidth;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.vx * 0.05, this.y - this.vy * 0.05);
    ctx.stroke();
  }
}

export class Ship {
  x = WIDTH / 2;
  y = HEIGHT / 2;
  angle = -Math.PI / 2;
  vx = 0;
  vy = 0;
  radius = SHIP_RADIUS;
  thrusting = false;
  invincible = SHIP_INVINCIBILITY_DURATION;
  shootCooldown = 0;
  tripleShot = 0;
  dead = false;

  reset(): void {
    this.x = WIDTH / 2;
    this.y = HEIGHT / 2;
    this.angle = -Math.PI / 2;
    this.vx = 0;
    this.vy = 0;
    this.thrusting = false;
    this.invincible = SHIP_INVINCIBILITY_DURATION;
    this.shootCooldown = 0;
    this.dead = false;
  }

  update(dt: number, keyboard: Keyboard): void {
    if (this.dead) return;
    if (this.invincible > 0) this.invincible -= dt;
    if (this.shootCooldown > 0) this.shootCooldown -= dt;
    if (this.tripleShot > 0) this.tripleShot -= dt;

    if (keyboard.isDown("ArrowLeft")) this.angle -= SHIP_ROTATION_SPEED * dt;
    if (keyboard.isDown("ArrowRight")) this.angle += SHIP_ROTATION_SPEED * dt;

    this.thrusting = keyboard.isDown("ArrowUp");
    if (this.thrusting) {
      this.vx += Math.cos(this.angle) * SHIP_THRUST * dt;
      this.vy += Math.sin(this.angle) * SHIP_THRUST * dt;
    }

    this.vx *= SHIP_DRAG;
    this.vy *= SHIP_DRAG;
    this.x = wrap(this.x + this.vx * dt, WIDTH);
    this.y = wrap(this.y + this.vy * dt, HEIGHT);
  }

  tryShoot(): Bullet[] {
    if (this.shootCooldown > 0 || this.dead) return [];
    this.shootCooldown = BULLET_COOLDOWN;
    const NOSE = 21;
    const ox = this.x + Math.cos(this.angle) * NOSE;
    const oy = this.y + Math.sin(this.angle) * NOSE;
    if (this.tripleShot > 0) {
      return [
        new Bullet(ox, oy, this.angle - TRIPLE_SPREAD),
        new Bullet(ox, oy, this.angle),
        new Bullet(ox, oy, this.angle + TRIPLE_SPREAD),
      ];
    }
    return [new Bullet(ox, oy, this.angle)];
  }

  draw(ctx: CanvasRenderingContext2D, skin: AsteroidsSkin): void {
    if (this.dead) return;
    if (this.invincible > 0 && Math.floor(this.invincible * 8) % 2 === 0)
      return;

    const origin = { x: this.x, y: this.y, rotation: this.angle };
    // El glow (solo Neón) envuelve casco y llama con el color de la nave
    applyGlow(ctx, skin, skin.ship);
    strokeShape(
      ctx,
      skin,
      origin,
      [
        [20, 0],
        [-12, -9],
        [-7, 0],
        [-12, 9],
      ],
      skin.ship,
      true,
    );

    if (this.thrusting && Math.random() > 0.35) {
      ctx.globalAlpha = skin.flameAlpha;
      strokeShape(
        ctx,
        skin,
        origin,
        [
          [-8, -4],
          [-8 - rand(6, 14), 0],
          [-8, 4],
        ],
        skin.flame,
        false,
      );
      ctx.globalAlpha = 1;
    }

    clearGlow(ctx);
  }
}
