import { CANVAS_HEIGHT, CANVAS_WIDTH, WEAPONS } from './constants';
import { TerrainEngine } from './terrain';
import { Unit, WeaponId } from './types';

export interface AIPlan {
  weaponId: WeaponId;
  angle: number;
  power: number;
  targetUnitId: string;
}

export class AIEngine {
  private terrain: TerrainEngine;

  constructor(terrain: TerrainEngine) {
    this.terrain = terrain;
  }

  public computePlan(
    unit: Unit,
    allUnits: Unit[],
    windForce: number,
    difficulty: 'easy' | 'normal' | 'hard'
  ): AIPlan {
    const enemies = allUnits.filter((u) => u.alive && u.team !== unit.team);
    const teammates = allUnits.filter((u) => u.alive && u.team === unit.team && u.id !== unit.id);

    if (enemies.length === 0) {
      return {
        weaponId: unit.selectedWeapon || 'fireball',
        angle: unit.team === 0 ? -0.7 : Math.PI + 0.7,
        power: 50,
        targetUnitId: ''
      };
    }

    // Available weapons with ammo
    const usableWeapons: WeaponId[] = (Object.keys(WEAPONS) as WeaponId[]).filter((wid) => {
      const def = WEAPONS[wid];
      if (def.isUtility) return false;
      const ammo = unit.ammo[wid];
      return ammo === -1 || ammo > 0;
    });

    let bestScore = -Infinity;
    let bestPlan: AIPlan = {
      weaponId: usableWeapons[0] || 'fireball',
      angle: unit.team === 0 ? -0.8 : Math.PI - 0.8,
      power: 60,
      targetUnitId: enemies[0].id
    };

    const isFacingRight = unit.team === 0;
    const sampleCount = difficulty === 'hard' ? 360 : difficulty === 'normal' ? 180 : 80;

    for (let i = 0; i < sampleCount; i++) {
      // Pick random usable weapon weighted by signature
      const chosenWeaponId =
        Math.random() < 0.65 && usableWeapons.includes(unit.selectedWeapon)
          ? unit.selectedWeapon
          : usableWeapons[Math.floor(Math.random() * usableWeapons.length)];

      const wDef = WEAPONS[chosenWeaponId];

      // Aim angle range
      const baseAng = -1.45 + Math.random() * 1.7; // From almost straight up to low angle
      const ang = isFacingRight ? baseAng : Math.PI - baseAng;
      const pw = 20 + Math.random() * 80;

      const simImpact = this.simulateShot(unit.x, unit.y - 20, ang, pw, wDef.gravity, wDef.speedMultiplier, windForce);
      if (!simImpact) continue;

      // Score this shot:
      // High score for being close to enemy
      let minEnemyDist = Infinity;
      let targetEnemy = enemies[0];

      for (const e of enemies) {
        const d = Math.hypot(simImpact.x - e.x, simImpact.y - (e.y - 20));
        if (d < minEnemyDist) {
          minEnemyDist = d;
          targetEnemy = e;
        }
      }

      // Check friendly fire penalty
      let friendlyPenalty = 0;
      for (const tm of teammates) {
        const d = Math.hypot(simImpact.x - tm.x, simImpact.y - (tm.y - 20));
        if (d < wDef.radius * 1.5) {
          friendlyPenalty += (wDef.radius * 1.5 - d) * 12;
        }
      }

      // Self damage penalty
      const selfDist = Math.hypot(simImpact.x - unit.x, simImpact.y - (unit.y - 20));
      if (selfDist < wDef.radius * 1.4) {
        friendlyPenalty += 2000;
      }

      // Base score is inverse of distance to closest enemy minus friendly penalty
      let score = (1000 / (minEnemyDist + 1)) * (wDef.damage / 50) - friendlyPenalty;

      // Bonus if directly within lethal blast
      if (minEnemyDist < wDef.radius) {
        score += 500;
        if (targetEnemy.hp <= wDef.damage) {
          score += 400; // Kill shot bonus!
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestPlan = {
          weaponId: chosenWeaponId,
          angle: ang,
          power: pw,
          targetUnitId: targetEnemy.id
        };
      }
    }

    // Apply difficulty inaccuracies
    let finalAngle = bestPlan.angle;
    let finalPower = bestPlan.power;

    if (difficulty === 'easy') {
      finalAngle += (Math.random() - 0.5) * 0.18;
      finalPower = Math.max(15, Math.min(100, finalPower * (0.85 + Math.random() * 0.3)));
    } else if (difficulty === 'normal') {
      finalAngle += (Math.random() - 0.5) * 0.04;
      finalPower = Math.max(15, Math.min(100, finalPower * (0.95 + Math.random() * 0.1)));
    } else {
      // Hard: slight human error only
      finalAngle += (Math.random() - 0.5) * 0.012;
      finalPower = Math.max(15, Math.min(100, finalPower * (0.98 + Math.random() * 0.04)));
    }

    return {
      weaponId: bestPlan.weaponId,
      angle: finalAngle,
      power: finalPower,
      targetUnitId: bestPlan.targetUnitId
    };
  }

  private simulateShot(
    ox: number,
    oy: number,
    ang: number,
    power: number,
    gravity: number,
    speedMul: number,
    windForce: number
  ): { x: number; y: number } | null {
    const sp = (4.5 + power * 0.2) * speedMul;
    let x = ox;
    let y = oy;
    let vx = Math.cos(ang) * sp;
    let vy = Math.sin(ang) * sp;

    for (let step = 0; step < 1100; step++) {
      vy += gravity;
      vx += windForce;
      x += vx;
      y += vy;

      if (x < -200 || x > CANVAS_WIDTH + 200 || y > CANVAS_HEIGHT + 200) {
        return null;
      }

      if (x >= 0 && x < CANVAS_WIDTH) {
        const groundY = this.terrain.getHeightAt(x);
        if (y >= groundY) {
          return { x, y: groundY };
        }
      }
    }

    return null;
  }
}
