import { BIOMES, CANVAS_HEIGHT, CANVAS_WIDTH, TEAMS_DATA, WEAPONS } from './constants';
import { ParticleEngine } from './particles';
import { TerrainEngine } from './terrain';
import { BiomeId, Projectile, Unit } from './types';

export class GameRenderer {
  public ctx: CanvasRenderingContext2D;
  public terrain: TerrainEngine;
  public particles: ParticleEngine;

  public stars: Array<{ x: number; y: number; r: number; a: number }> = [];
  public mountains: Array<Array<[number, number]>> = [];

  // Dynamic Camera
  public cameraX: number = CANVAS_WIDTH / 2;
  public cameraY: number = CANVAS_HEIGHT / 2;
  public targetCameraX: number = CANVAS_WIDTH / 2;
  public targetCameraY: number = CANVAS_HEIGHT / 2;
  public zoom: number = 1.0;
  public targetZoom: number = 1.0;

  // Screen shake
  public shake: number = 0;

  constructor(ctx: CanvasRenderingContext2D, terrain: TerrainEngine, particles: ParticleEngine) {
    this.ctx = ctx;
    this.terrain = terrain;
    this.particles = particles;
    this.initBackground();
  }

  public initBackground() {
    this.stars = [];
    for (let i = 0; i < 180; i++) {
      this.stars.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * (CANVAS_HEIGHT * 0.65),
        r: 0.8 + Math.random() * 1.8,
        a: 0.2 + Math.random() * 0.8
      });
    }

    this.mountains = [];
    for (let layer = 0; layer < 2; layer++) {
      const pts: Array<[number, number]> = [];
      let y = CANVAS_HEIGHT * (0.45 + layer * 0.1);
      for (let x = -60; x <= CANVAS_WIDTH + 60; x += 55) {
        y += (Math.random() - 0.5) * 65;
        y = Math.max(CANVAS_HEIGHT * (0.25 + layer * 0.1), Math.min(CANVAS_HEIGHT * (0.65 + layer * 0.05), y));
        pts.push([x, y]);
      }
      this.mountains.push(pts);
    }
  }

  public triggerShake(intensity: number) {
    this.shake = Math.min(26, this.shake + intensity);
  }

  public updateCamera(
    activeUnit: Unit | undefined,
    projectiles: Projectile[],
    isFlying: boolean
  ) {
    if (this.shake > 0.3) {
      this.shake *= 0.88;
    } else {
      this.shake = 0;
    }

    if (isFlying && projectiles.length > 0) {
      // Follow average of active projectiles
      let avgX = 0;
      let avgY = 0;
      for (const p of projectiles) {
        avgX += p.x;
        avgY += p.y;
      }
      avgX /= projectiles.length;
      avgY /= projectiles.length;

      this.targetCameraX = Math.max(CANVAS_WIDTH * 0.3, Math.min(CANVAS_WIDTH * 0.7, avgX));
      this.targetCameraY = Math.max(CANVAS_HEIGHT * 0.3, Math.min(CANVAS_HEIGHT * 0.7, avgY));

      // Zoom out slightly if high
      if (avgY < 120) {
        this.targetZoom = 0.88;
      } else {
        this.targetZoom = 0.96;
      }
    } else if (activeUnit && activeUnit.alive) {
      // Focus on active player
      this.targetCameraX = Math.max(CANVAS_WIDTH * 0.35, Math.min(CANVAS_WIDTH * 0.65, activeUnit.x));
      this.targetCameraY = Math.max(CANVAS_HEIGHT * 0.35, Math.min(CANVAS_HEIGHT * 0.65, activeUnit.y - 40));
      this.targetZoom = 1.0;
    } else {
      this.targetCameraX = CANVAS_WIDTH / 2;
      this.targetCameraY = CANVAS_HEIGHT / 2;
      this.targetZoom = 1.0;
    }

    // Smooth lerp
    this.cameraX += (this.targetCameraX - this.cameraX) * 0.08;
    this.cameraY += (this.targetCameraY - this.cameraY) * 0.08;
    this.zoom += (this.targetZoom - this.zoom) * 0.06;
  }

  public render(
    tick: number,
    biomeId: BiomeId,
    units: Unit[],
    currentUnit: Unit | undefined,
    projectiles: Projectile[],
    aimAngle: number,
    aimPower: number,
    isAiming: boolean,
    windForce: number
  ) {
    const ctx = this.ctx;
    const biome = BIOMES[biomeId] || BIOMES.emerald;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Apply Screen Shake
    let shakeX = 0;
    let shakeY = 0;
    if (this.shake > 0.4) {
      shakeX = (Math.random() - 0.5) * this.shake;
      shakeY = (Math.random() - 0.5) * this.shake;
    }

    // Apply Camera Transform
    ctx.translate(CANVAS_WIDTH / 2 + shakeX, CANVAS_HEIGHT / 2 + shakeY);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.cameraX, -this.cameraY);

    // 1. Sky & Celestial
    this.drawSky(ctx, biome, tick);

    // 2. Parallax Mountain Silhouettes
    this.drawMountains(ctx, biome);

    // 3. Terrain Canvas
    if (this.terrain.dirty) {
      this.terrain.rebuildCanvas();
    }
    ctx.drawImage(this.terrain.canvas, 0, 0);

    // 4. Units & Aim Reticle
    this.drawUnits(ctx, units, currentUnit, tick, isAiming);

    // 5. Aim trajectory & reticle
    if (isAiming && currentUnit && currentUnit.alive) {
      this.drawAimGuide(ctx, currentUnit, aimAngle, aimPower, windForce);
    }

    // 6. Projectiles
    this.drawProjectiles(ctx, projectiles);

    // 7. Particles, rings, combat texts
    this.particles.draw(ctx);

    // 8. Ambient weather particles
    this.particles.drawWeather(ctx, biome.particleColor);

    ctx.restore();

    // 9. Subtle Vignette around screen edges
    this.drawVignette(ctx);
  }

  private drawSky(ctx: CanvasRenderingContext2D, biome: typeof BIOMES['emerald'], tick: number) {
    // Sky gradient
    const skyGrd = ctx.createLinearGradient(0, -200, 0, CANVAS_HEIGHT);
    skyGrd.addColorStop(0, biome.skyGradient[0]);
    skyGrd.addColorStop(0.35, biome.skyGradient[1]);
    skyGrd.addColorStop(0.7, biome.skyGradient[2]);
    skyGrd.addColorStop(1, biome.skyGradient[3]);

    ctx.fillStyle = skyGrd;
    ctx.fillRect(-200, -200, CANVAS_WIDTH + 400, CANVAS_HEIGHT + 400);

    // Celestial orb (Moon / Sun)
    ctx.save();
    if (biome.id === 'volcanic') {
      // Crimson eclipse
      ctx.shadowColor = 'rgba(239, 68, 68, 0.7)';
      ctx.shadowBlur = 80;
      ctx.beginPath();
      ctx.arc(CANVAS_WIDTH * 0.78, 110, 48, 0, Math.PI * 2);
      ctx.fillStyle = '#fca5a5';
      ctx.fill();
    } else if (biome.id === 'frozen') {
      // Mystical Aurora borealis ribbons
      ctx.globalAlpha = 0.28;
      for (let i = 0; i < 3; i++) {
        const ag = ctx.createLinearGradient(0, 40 + i * 40, CANVAS_WIDTH, 140 + i * 30);
        ag.addColorStop(0, '#10b981');
        ag.addColorStop(0.5, '#38bdf8');
        ag.addColorStop(1, '#a855f7');
        ctx.fillStyle = ag;
        ctx.beginPath();
        ctx.moveTo(0, 80 + i * 35 + Math.sin(tick * 0.02 + i) * 15);
        ctx.bezierCurveTo(
          CANVAS_WIDTH * 0.35,
          40 + i * 30 + Math.cos(tick * 0.02 + i) * 20,
          CANVAS_WIDTH * 0.65,
          120 + i * 30 + Math.sin(tick * 0.02) * 20,
          CANVAS_WIDTH,
          90 + i * 30
        );
        ctx.lineTo(CANVAS_WIDTH, 260);
        ctx.lineTo(0, 260);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
    } else {
      // Silver fantasy moon
      ctx.shadowColor = 'rgba(255, 240, 200, 0.6)';
      ctx.shadowBlur = 60;
      ctx.beginPath();
      ctx.arc(CANVAS_WIDTH * 0.82, 95, 42, 0, Math.PI * 2);
      ctx.fillStyle = '#fffbeb';
      ctx.fill();
    }
    ctx.restore();

    // Twinkling stars
    ctx.save();
    for (const s of this.stars) {
      ctx.globalAlpha = Math.max(0.1, Math.min(0.9, s.a + Math.sin(tick * 0.05 + s.x) * 0.2));
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(s.x, s.y, s.r, s.r);
    }
    ctx.restore();
  }

  private drawMountains(ctx: CanvasRenderingContext2D, biome: typeof BIOMES['emerald']) {
    for (let l = 0; l < this.mountains.length; l++) {
      const pts = this.mountains[l];
      ctx.beginPath();
      ctx.moveTo(pts[0][0], CANVAS_HEIGHT);
      for (const p of pts) {
        ctx.lineTo(p[0], p[1]);
      }
      ctx.lineTo(pts[pts.length - 1][0], CANVAS_HEIGHT);
      ctx.closePath();
      ctx.fillStyle = biome.mountains[l] || biome.mountains[0];
      ctx.fill();
    }
  }

  private drawUnits(
    ctx: CanvasRenderingContext2D,
    units: Unit[],
    currentUnit: Unit | undefined,
    tick: number,
    isAiming: boolean
  ) {
    for (const u of units) {
      if (!u.alive) continue;

      const teamData = TEAMS_DATA[u.team] || TEAMS_DATA[0];
      const isCur = u === currentUnit;

      // 1. Ground shadow
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.ellipse(u.x, u.y + 1, 18, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 2. Active hero glow ring
      if (isCur) {
        const pulse = 0.5 + Math.sin(tick * 0.12) * 0.5;
        ctx.save();
        ctx.beginPath();
        ctx.arc(u.x, u.y - 22, 26 + pulse * 5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(251, 191, 36, ${0.4 + pulse * 0.5})`;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Bouncing arrow above head
        const bob = Math.sin(tick * 0.14) * 5;
        ctx.beginPath();
        ctx.moveTo(u.x - 9, u.y - 68 + bob);
        ctx.lineTo(u.x + 9, u.y - 68 + bob);
        ctx.lineTo(u.x, u.y - 54 + bob);
        ctx.closePath();
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = 'rgba(251, 191, 36, 0.8)';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
      }

      // 3. Character Body & Team Aura
      ctx.save();
      ctx.beginPath();
      ctx.arc(u.x, u.y - 22, 18, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();

      ctx.lineWidth = 3.5;
      ctx.strokeStyle = teamData.color;
      ctx.stroke();

      // Character Icon
      ctx.font = '20px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(u.icon, u.x, u.y - 21);
      ctx.restore();

      // 4. Health Bar & Name Plate
      const barW = 46;
      const barH = 5.5;
      const barX = u.x - barW / 2;
      const barY = u.y - 48;

      ctx.save();
      // Plate background
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.roundRect(barX - 2, barY - 2, barW + 4, barH + 4, 3);
      ctx.fill();

      // HP Fill
      const hpRatio = Math.max(0, u.hp / u.maxHp);
      const hpColor = hpRatio > 0.5 ? '#22c55e' : hpRatio > 0.25 ? '#eab308' : '#ef4444';
      ctx.fillStyle = hpColor;
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW * hpRatio, barH, 2);
      ctx.fill();

      // Unit name & HP count
      ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#f8fafc';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 3;
      ctx.fillText(`${u.hp}`, u.x, barY - 6);
      ctx.restore();
    }
  }

  private drawAimGuide(
    ctx: CanvasRenderingContext2D,
    unit: Unit,
    aimAngle: number,
    aimPower: number,
    windForce: number
  ) {
    const ox = unit.x;
    const oy = unit.y - 22;
    const lineLen = 38 + aimPower * 1.1;
    const ex = ox + Math.cos(aimAngle) * lineLen;
    const ey = oy + Math.sin(aimAngle) * lineLen;

    ctx.save();

    // Laser pointer / trajectory line
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(251, 191, 36, 0.9)';
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.moveTo(ox + Math.cos(aimAngle) * 20, oy + Math.sin(aimAngle) * 20);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    // Arrowhead pointer
    const arrowHead = 11;
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex - Math.cos(aimAngle - 0.45) * arrowHead, ey - Math.sin(aimAngle - 0.45) * arrowHead);
    ctx.lineTo(ex - Math.cos(aimAngle + 0.45) * arrowHead, ey - Math.sin(aimAngle + 0.45) * arrowHead);
    ctx.closePath();
    ctx.fillStyle = '#fbbf24';
    ctx.fill();

    // Short ballistic trajectory hint dots
    const weaponDef = WEAPONS[unit.selectedWeapon] || WEAPONS.fireball;
    const sp = (4.5 + aimPower * 0.2) * weaponDef.speedMultiplier;
    let simX = ox;
    let simY = oy;
    let simVx = Math.cos(aimAngle) * sp;
    let simVy = Math.sin(aimAngle) * sp;

    for (let i = 0; i < 24; i++) {
      simVy += weaponDef.gravity;
      simVx += windForce;
      simX += simVx;
      simY += simVy;

      if (simX < 0 || simX >= CANVAS_WIDTH || simY >= CANVAS_HEIGHT) break;
      if (simY >= this.terrain.getHeightAt(simX)) break;

      if (i % 2 === 0) {
        const dotAlpha = 0.65 * (1 - i / 24);
        ctx.beginPath();
        ctx.arc(simX, simY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(254, 240, 138, ${dotAlpha})`;
        ctx.fill();
      }
    }

    ctx.restore();
  }

  private drawProjectiles(ctx: CanvasRenderingContext2D, projectiles: Projectile[]) {
    for (const p of projectiles) {
      const w = WEAPONS[p.weaponId] || WEAPONS.fireball;

      // Draw luminous trail
      for (let i = 0; i < p.trail.length; i++) {
        const pt = p.trail[i];
        const ratio = (i + 1) / p.trail.length;
        ctx.save();
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2 + ratio * 3, 0, Math.PI * 2);
        ctx.fillStyle = w.trailColor;
        ctx.globalAlpha = ratio * pt.alpha * 0.75;
        ctx.fill();
        ctx.restore();
      }

      // Projectile core with glowing aura
      ctx.save();
      ctx.shadowColor = w.color;
      ctx.shadowBlur = 18;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.weaponId === 'sniper_arrow' ? 5 : 8, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Outer color halo
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.weaponId === 'sniper_arrow' ? 8 : 12, 0, Math.PI * 2);
      ctx.fillStyle = w.color;
      ctx.globalAlpha = 0.55;
      ctx.fill();

      ctx.restore();
    }
  }

  private drawVignette(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const vg = ctx.createRadialGradient(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      CANVAS_HEIGHT * 0.42,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      CANVAS_HEIGHT * 0.95
    );
    vg.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vg.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();
  }
}
