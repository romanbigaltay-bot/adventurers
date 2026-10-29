import { sound } from './audio';
import { CANVAS_HEIGHT, CANVAS_WIDTH, WEAPONS } from './constants';
import { ParticleEngine } from './particles';
import { TerrainEngine } from './terrain';
import { Projectile, Unit, WeaponDef, WeaponId } from './types';

export interface ShotResult {
  hitTerrain: boolean;
  hitUnitId: string | null;
  directHit: boolean;
  spawnClusters?: Projectile[];
  screenShake: number;
}

export class PhysicsEngine {
  public terrain: TerrainEngine;
  public particles: ParticleEngine;

  constructor(terrain: TerrainEngine, particles: ParticleEngine) {
    this.terrain = terrain;
    this.particles = particles;
  }

  public stepProjectile(
    proj: Projectile,
    units: Unit[],
    windForce: number,
    onExplosion: (x: number, y: number, weapon: WeaponDef, owner: Unit | undefined) => void
  ): ShotResult | null {
    const w = WEAPONS[proj.weaponId];
    const SUB_STEPS = 5;
    proj.age++;

    // Add trail sample
    proj.trail.push({ x: proj.x, y: proj.y, alpha: 1.0 });
    if (proj.trail.length > 20) {
      proj.trail.shift();
    }
    for (const t of proj.trail) {
      t.alpha *= 0.94;
    }

    // Cluster projectile apex split check
    if (proj.weaponId === 'cluster_volley' && !proj.isClusterSub && proj.vy > -0.5 && proj.age > 18) {
      // Split into 3 sub-munitions!
      const sub1: Projectile = {
        id: Math.random().toString(36).substring(2, 9),
        x: proj.x - 6,
        y: proj.y,
        vx: proj.vx * 0.9 - 1.6,
        vy: proj.vy - 1.2,
        weaponId: 'cluster_volley',
        ownerId: proj.ownerId,
        ownerTeam: proj.ownerTeam,
        trail: [],
        bouncesLeft: 0,
        age: 0,
        isClusterSub: true
      };
      const sub2: Projectile = {
        id: Math.random().toString(36).substring(2, 9),
        x: proj.x,
        y: proj.y,
        vx: proj.vx * 1.0,
        vy: proj.vy - 2.0,
        weaponId: 'cluster_volley',
        ownerId: proj.ownerId,
        ownerTeam: proj.ownerTeam,
        trail: [],
        bouncesLeft: 0,
        age: 0,
        isClusterSub: true
      };
      const sub3: Projectile = {
        id: Math.random().toString(36).substring(2, 9),
        x: proj.x + 6,
        y: proj.y,
        vx: proj.vx * 0.9 + 1.6,
        vy: proj.vy - 1.2,
        weaponId: 'cluster_volley',
        ownerId: proj.ownerId,
        ownerTeam: proj.ownerTeam,
        trail: [],
        bouncesLeft: 0,
        age: 0,
        isClusterSub: true
      };

      this.particles.createExplosion(proj.x, proj.y, 22, '#fbbf24');
      sound.playExplosion(22);

      return {
        hitTerrain: false,
        hitUnitId: null,
        directHit: false,
        spawnClusters: [sub1, sub2, sub3],
        screenShake: 4
      };
    }

    for (let s = 0; s < SUB_STEPS; s++) {
      proj.vy += w.gravity / SUB_STEPS;
      proj.vx += windForce / SUB_STEPS;
      proj.x += proj.vx / SUB_STEPS;
      proj.y += proj.vy / SUB_STEPS;

      // Out of bounds check
      if (proj.x < -300 || proj.x > CANVAS_WIDTH + 300 || proj.y > CANVAS_HEIGHT + 350) {
        return {
          hitTerrain: false,
          hitUnitId: null,
          directHit: false,
          screenShake: 0
        };
      }

      // Check unit direct hits
      for (const u of units) {
        if (!u.alive) continue;
        // Don't collide with owner during first 8 ticks of launch
        if (u.id === proj.ownerId && proj.age < 10) continue;

        const dx = proj.x - u.x;
        const dy = proj.y - (u.y - 20);
        const hitDist = Math.hypot(dx, dy);

        if (hitDist < 18) {
          const owner = units.find((x) => x.id === proj.ownerId);
          onExplosion(proj.x, proj.y, w, owner);
          return {
            hitTerrain: false,
            hitUnitId: u.id,
            directHit: true,
            screenShake: Math.min(22, w.radius * 0.4)
          };
        }
      }

      // Check terrain collision
      if (proj.x >= 0 && proj.x < CANVAS_WIDTH) {
        const groundY = this.terrain.getHeightAt(proj.x);
        if (proj.y >= groundY) {
          // Bouncing weapon check
          if (proj.bouncesLeft > 0) {
            proj.bouncesLeft--;
            proj.y = groundY - 2;
            proj.vy = -proj.vy * 0.55;
            proj.vx = proj.vx * 0.75;
            this.particles.createExplosion(proj.x, groundY, 14, '#94a3b8');
            sound.playHit();
            break;
          }

          const owner = units.find((x) => x.id === proj.ownerId);
          onExplosion(proj.x, groundY, w, owner);

          return {
            hitTerrain: true,
            hitUnitId: null,
            directHit: false,
            screenShake: Math.min(25, w.radius * 0.45)
          };
        }
      }
    }

    return null;
  }

  public applyExplosionDamage(
    cx: number,
    cy: number,
    weapon: WeaponDef,
    attacker: Unit | undefined,
    units: Unit[]
  ) {
    // Utility: Blink teleportation
    if (weapon.isUtility && weapon.id === 'blink_portal') {
      if (attacker && attacker.alive) {
        const destY = this.terrain.getHeightAt(cx);
        attacker.x = Math.max(30, Math.min(CANVAS_WIDTH - 30, cx));
        attacker.y = destY;
        attacker.vy = 0;
        this.particles.createExplosion(attacker.x, attacker.y - 20, 30, '#38bdf8');
        this.particles.addNoticeText(attacker.x, attacker.y - 45, 'ТЕЛЕПОРТ!', '#38bdf8');
        sound.playShoot('blink_portal');
      }
      return;
    }

    // Terrain deformation
    if (weapon.id === 'acid_flask') {
      this.terrain.meltShaft(cx, cy, weapon.radius * 1.5, 95);
    } else {
      this.terrain.carveCircle(cx, cy, weapon.radius);
    }

    // Damage units in splash radius
    const splashRadius = weapon.radius * 1.45;

    for (const u of units) {
      if (!u.alive) continue;
      const d = Math.hypot(cx - u.x, cy - (u.y - 20));

      if (d < splashRadius) {
        // Falloff curve: 1.0 at center down to 0 at edge
        const ratio = 1 - d / splashRadius;
        const rawDmg = weapon.damage * Math.pow(ratio, 0.85);

        // Account for defense trait
        const netDmg = Math.max(5, Math.round(rawDmg * (1 - (u.defense || 0))));
        const isCrit = d < 12;

        u.hp -= netDmg;
        this.particles.addDamageText(u.x, u.y - 30, netDmg, isCrit);

        if (attacker) {
          attacker.damageDealt += netDmg;
        }

        // Apply knockback impulse
        const kx = (u.x - cx) / (d + 1);
        const ky = -Math.abs((u.y - 20 - cy) / (d + 1)) - 0.4;
        u.vy += ky * (weapon.damage * 0.12 * ratio);
        u.x += kx * (weapon.damage * 0.18 * ratio);

        if (u.hp <= 0) {
          u.hp = 0;
          u.alive = false;
          if (attacker && attacker.id !== u.id) {
            attacker.kills += 1;
          }
          this.particles.createExplosion(u.x, u.y - 20, 35, '#ef4444');
          this.particles.addNoticeText(u.x, u.y - 40, 'ПОГИБ!', '#ef4444');
        }
      }
    }
  }

  public updateUnitsGravity(units: Unit[]): boolean {
    let anyFalling = false;

    for (const u of units) {
      if (!u.alive) continue;

      // Screen boundary clamp
      u.x = Math.max(20, Math.min(CANVAS_WIDTH - 20, u.x));

      const groundY = this.terrain.getHeightAt(u.x);

      // Unit is above ground -> falling
      if (u.y < groundY - 1) {
        anyFalling = true;
        u.vy += 0.58; // Gravity
        u.y += u.vy;

        if (u.y >= groundY) {
          // Landing impact
          const fallSpeed = u.vy;
          u.y = groundY;
          u.vy = 0;

          // Fall damage if falling from high altitude
          if (fallSpeed > 14) {
            const fallDmg = Math.round((fallSpeed - 14) * 3.5);
            u.hp = Math.max(0, u.hp - fallDmg);
            this.particles.addDamageText(u.x, u.y - 25, fallDmg, false);
            sound.playHit();

            if (u.hp <= 0) {
              u.alive = false;
              this.particles.createExplosion(u.x, u.y - 15, 25, '#ef4444');
              this.particles.addNoticeText(u.x, u.y - 40, 'РАЗБИЛСЯ!', '#ef4444');
            }
          }
        }
      } else {
        // Grounded
        u.y = groundY;
        u.vy = 0;
      }

      // Check falling into bottom abyss
      if (u.y >= CANVAS_HEIGHT - 15) {
        u.hp = 0;
        u.alive = false;
        this.particles.createExplosion(u.x, CANVAS_HEIGHT - 25, 45, '#ef4444');
        this.particles.addNoticeText(u.x, CANVAS_HEIGHT - 50, 'УТОНУЛ В БЕЗДНЕ!', '#ef4444');
      }
    }

    return anyFalling;
  }
}
