import { FloatingText, Particle, RingWave, WeatherParticle } from './types';

export class ParticleEngine {
  public particles: Particle[] = [];
  public rings: RingWave[] = [];
  public floats: FloatingText[] = [];
  public weather: WeatherParticle[] = [];

  public initWeather(type: 'spores' | 'embers' | 'snow' | 'sand', width: number, height: number) {
    this.weather = [];
    const count = type === 'snow' ? 120 : type === 'embers' ? 65 : 45;
    for (let i = 0; i < count; i++) {
      this.weather.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: type === 'embers' ? -Math.random() * 1.2 - 0.3 : Math.random() * 0.9 + 0.4,
        size: Math.random() * (type === 'snow' ? 2.5 : 3.5) + 1,
        alpha: Math.random() * 0.6 + 0.2
      });
    }
  }

  public updateWeather(width: number, height: number, wind: number, type: 'spores' | 'embers' | 'snow' | 'sand') {
    for (const w of this.weather) {
      w.x += w.vx + wind * 0.9;
      w.y += w.vy;

      if (w.x < -20) w.x = width + 20;
      if (w.x > width + 20) w.x = -20;

      if (type === 'embers') {
        if (w.y < -20) {
          w.y = height + 10;
          w.x = Math.random() * width;
        }
      } else {
        if (w.y > height + 20) {
          w.y = -20;
          w.x = Math.random() * width;
        }
      }
    }
  }

  public createExplosion(x: number, y: number, radius: number, primaryColor: string) {
    // Shockwave ring
    this.rings.push({
      x,
      y,
      r: radius * 0.25,
      maxR: radius * 2.2,
      life: 1.0,
      color: primaryColor,
      lineWidth: 4.5
    });

    // Secondary inner white flash ring
    this.rings.push({
      x,
      y,
      r: 5,
      maxR: radius * 1.2,
      life: 1.0,
      color: '#ffffff',
      lineWidth: 6
    });

    // Fire & light spark particles
    const sparkCount = Math.floor(25 + radius * 0.8);
    for (let i = 0; i < sparkCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 8.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5,
        life: 1.0,
        maxLife: 1.0,
        size: 2 + Math.random() * 5.5,
        color: i % 2 === 0 ? primaryColor : '#ffd54f',
        alpha: 1.0,
        gravity: 0.18,
        drag: 0.97,
        shape: Math.random() > 0.4 ? 'spark' : 'circle'
      });
    }

    // Dirt debris chunks
    const chunkCount = Math.floor(10 + radius * 0.3);
    for (let i = 0; i < chunkCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 6;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3.5,
        life: 1.0,
        maxLife: 1.0,
        size: 4 + Math.random() * 8,
        color: '#422c18',
        alpha: 1.0,
        gravity: 0.32,
        drag: 0.98,
        shape: 'debris'
      });
    }

    // Smoke puffs
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 2;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 16,
        vx: Math.cos(angle) * speed,
        vy: -Math.random() * 2 - 0.5,
        life: 1.0,
        maxLife: 1.0,
        size: 14 + Math.random() * 18,
        color: 'rgba(50, 50, 50, 0.4)',
        alpha: 0.6,
        gravity: -0.04,
        drag: 0.96,
        shape: 'smoke'
      });
    }
  }

  public addDamageText(x: number, y: number, amount: number, isCrit: boolean = false) {
    this.floats.push({
      id: Math.random().toString(36).substring(2, 9),
      x: x + (Math.random() - 0.5) * 16,
      y: y - 20,
      text: amount > 0 ? `-${amount}` : 'МИМО',
      color: isCrit ? '#f87171' : amount > 50 ? '#fb923c' : '#fde047',
      life: 1.0,
      isCrit
    });
  }

  public addNoticeText(x: number, y: number, text: string, color: string = '#38bdf8') {
    this.floats.push({
      id: Math.random().toString(36).substring(2, 9),
      x,
      y: y - 24,
      text,
      color,
      life: 1.0,
      isCrit: false
    });
  }

  public update() {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.vy += p.gravity;
      p.vx *= p.drag;
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.shape === 'smoke' ? 0.018 : 0.026;
      p.alpha = Math.max(0, p.life);

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update shockwave rings
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.r += (r.maxR - r.r) * 0.18;
      r.life -= 0.045;
      if (r.life <= 0) {
        this.rings.splice(i, 1);
      }
    }

    // Update floating combat texts
    for (let i = this.floats.length - 1; i >= 0; i--) {
      const f = this.floats[i];
      f.y -= f.isCrit ? 1.1 : 0.8;
      f.life -= 0.016;
      if (f.life <= 0) {
        this.floats.splice(i, 1);
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    // Shockwave rings
    for (const r of this.rings) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.strokeStyle = r.color;
      ctx.globalAlpha = Math.max(0, r.life * 0.7);
      ctx.lineWidth = r.lineWidth * r.life;
      ctx.stroke();
      ctx.restore();
    }

    // Debris & smoke
    for (const p of this.particles) {
      if (p.shape === 'smoke') {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1.5 - p.life * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha * 0.35);
        ctx.fill();
        ctx.restore();
      } else if (p.shape === 'debris') {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        ctx.restore();
      }
    }

    // Additive glow particles (sparks, flames)
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const p of this.particles) {
      if (p.shape === 'circle' || p.shape === 'spark') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fill();
      }
    }
    ctx.restore();

    // Floating damage numbers
    for (const f of this.floats) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, f.life * 1.5);
      ctx.font = f.isCrit ? 'bold 24px "Plus Jakarta Sans", sans-serif' : 'bold 18px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Outline
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.strokeText(f.text, f.x, f.y);

      // Text fill
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
      ctx.restore();
    }
  }

  public drawWeather(ctx: CanvasRenderingContext2D, color: string) {
    ctx.save();
    for (const w of this.weather) {
      ctx.globalAlpha = w.alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(w.x, w.y, w.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  public clear() {
    this.particles = [];
    this.rings = [];
    this.floats = [];
  }
}
