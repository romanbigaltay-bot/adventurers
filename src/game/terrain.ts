import { BIOMES, CANVAS_HEIGHT, CANVAS_WIDTH } from './constants';
import { BiomeId } from './types';

export class TerrainEngine {
  public width: number;
  public height: number;
  public heightMap: Float32Array;
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public dirty: boolean = true;
  public biomeId: BiomeId = 'emerald';

  constructor(width: number = CANVAS_WIDTH, height: number = CANVAS_HEIGHT) {
    this.width = width;
    this.height = height;
    this.heightMap = new Float32Array(width);
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot get 2d context for terrain canvas');
    this.ctx = ctx;
  }

  public setBiome(biomeId: BiomeId) {
    this.biomeId = biomeId;
    this.dirty = true;
  }

  public generate(biomeId: BiomeId = 'emerald') {
    this.biomeId = biomeId;
    const w = this.width;
    const h = this.height;

    const p1 = Math.random() * Math.PI * 2;
    const p2 = Math.random() * Math.PI * 2;
    const p3 = Math.random() * Math.PI * 2;
    const p4 = Math.random() * Math.PI * 2;

    const a1 = 70 + Math.random() * 50;
    const a2 = 25 + Math.random() * 30;
    const a3 = 10 + Math.random() * 15;

    // Generate natural rolling contours
    for (let x = 0; x < w; x++) {
      const t = x / w;
      let y =
        h * 0.54 +
        Math.sin(t * Math.PI * 2 * 1.2 + p1) * a1 +
        Math.sin(t * Math.PI * 2 * 2.8 + p2) * a2 +
        Math.sin(t * Math.PI * 2 * 6.5 + p3) * a3 +
        Math.sin(t * Math.PI * 2 * 13.0 + p4) * 6;

      // Ensure boundary and playable bounds
      this.heightMap[x] = Math.max(200, Math.min(h - 75, y));
    }

    // 2-pass box blur smoothing for natural slopes
    for (let pass = 0; pass < 2; pass++) {
      const copy = Float32Array.from(this.heightMap);
      for (let x = 1; x < w - 1; x++) {
        this.heightMap[x] = (copy[x - 1] + copy[x] * 2 + copy[x + 1]) / 4;
      }
    }

    this.dirty = true;
  }

  public getHeightAt(x: number): number {
    const clampedX = Math.max(0, Math.min(this.width - 1, Math.round(x)));
    return this.heightMap[clampedX];
  }

  public carveCircle(cx: number, cy: number, radius: number) {
    const r2 = radius * radius;
    const x0 = Math.max(0, Math.floor(cx - radius));
    const x1 = Math.min(this.width - 1, Math.ceil(cx + radius));

    for (let x = x0; x <= x1; x++) {
      const dx = x - cx;
      const d2 = r2 - dx * dx;
      if (d2 <= 0) continue;
      const bottom = cy + Math.sqrt(d2);
      if (this.heightMap[x] < bottom) {
        this.heightMap[x] = Math.min(this.height - 10, bottom);
      }
    }
    this.dirty = true;
  }

  public meltShaft(cx: number, cy: number, width: number, depth: number) {
    const half = width / 2;
    const x0 = Math.max(0, Math.floor(cx - half));
    const x1 = Math.min(this.width - 1, Math.ceil(cx + half));

    for (let x = x0; x <= x1; x++) {
      const distFromCenter = Math.abs(x - cx) / half;
      const carveDown = depth * (1 - distFromCenter * 0.4);
      const newY = Math.min(this.height - 10, Math.max(this.heightMap[x], cy + carveDown));
      if (newY > this.heightMap[x]) {
        this.heightMap[x] = newY;
      }
    }
    this.dirty = true;
  }

  public rebuildCanvas() {
    const w = this.width;
    const h = this.height;
    const biome = BIOMES[this.biomeId] || BIOMES.emerald;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, w, h);

    // Underground soil polygon
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x < w; x++) {
      ctx.lineTo(x, this.heightMap[x]);
    }
    ctx.lineTo(w, h);
    ctx.closePath();

    const g = ctx.createLinearGradient(0, 160, 0, h);
    g.addColorStop(0, biome.groundGradient[0]);
    g.addColorStop(0.2, biome.groundGradient[1]);
    g.addColorStop(0.6, biome.groundGradient[2]);
    g.addColorStop(1, biome.groundGradient[3]);
    ctx.fillStyle = g;
    ctx.fill();

    // Underground geological specks & strata
    ctx.save();
    ctx.clip();

    // Strata bands
    for (let y = 260; y < h; y += 42) {
      ctx.fillStyle = biome.rockColor;
      ctx.globalAlpha = 0.18;
      ctx.fillRect(0, y, w, 14);
    }

    // Dirt noise flecks
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#000000';
    for (let i = 0; i < 900; i++) {
      const rx = (i * 12345.67) % w;
      const ry = 180 + ((i * 7654.32) % (h - 180));
      ctx.fillRect(rx, ry, (i % 5) + 2, (i % 5) + 2);
    }

    // Ore / Mineral flecks
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = biome.grassBorder;
    for (let i = 0; i < 350; i++) {
      const rx = (i * 9876.54) % w;
      const ry = 220 + ((i * 4321.09) % (h - 220));
      ctx.fillRect(rx, ry, (i % 4) + 2, (i % 4) + 2);
    }
    ctx.restore();

    // Upper grass / surface contour outline
    ctx.beginPath();
    ctx.moveTo(0, this.heightMap[0]);
    for (let x = 1; x < w; x++) {
      ctx.lineTo(x, this.heightMap[x]);
    }
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // Sub-layer outline
    ctx.lineWidth = 11;
    ctx.strokeStyle = biome.grassBorder;
    ctx.stroke();

    // Bright top grass / snow / rim highlight
    ctx.lineWidth = 4.5;
    ctx.strokeStyle = biome.grassTop;
    ctx.stroke();

    this.dirty = false;
  }
}
