import { AIEngine, AIPlan } from './ai';
import { sound } from './audio';
import { CANVAS_HEIGHT, CANVAS_WIDTH, HERO_CLASSES, TEAMS_DATA, WEAPONS } from './constants';
import { ParticleEngine } from './particles';
import { PhysicsEngine } from './physics';
import { GameRenderer } from './renderer';
import { TerrainEngine } from './terrain';
import { GameState, HeroClassId, MatchSettings, MatchStats, Projectile, Team, Unit, WeaponDef, WeaponId } from './types';

export class MatchEngine {
  public state: GameState = 'menu';
  public settings: MatchSettings;
  public teams: Team[] = [];
  public units: Unit[] = [];
  public turnIndex: number = 0;
  public roundNumber: number = 1;

  public terrain: TerrainEngine;
  public particles: ParticleEngine;
  public physics: PhysicsEngine;
  public renderer: GameRenderer | null = null;
  public ai: AIEngine;

  // Aim & Turn state
  public aimAngle: number = -0.7;
  public aimPower: number = 50;
  public isCharging: boolean = false;
  public wind: number = 0; // -1 to 1
  public windForce: number = 0;
  public turnTimeLeft: number = 30;
  public turnTimerInterval: number | null = null;

  // Projectile state
  public projectiles: Projectile[] = [];
  public resolveTimer: number = 0;

  // AI state
  public aiPlan: AIPlan | null = null;
  public aiTimer: number = 0;

  // Stats
  public matchStats: MatchStats | null = null;
  public matchStartTime: number = 0;

  // Callbacks for React UI
  public onStateChange?: (state: GameState) => void;
  public onTurnChange?: (currentUnit: Unit, currentTeam: Team) => void;
  public onTimeTick?: (timeLeft: number) => void;
  public onUnitsUpdate?: (units: Unit[]) => void;
  public onWindUpdate?: (wind: number) => void;
  public onMatchEnd?: (stats: MatchStats) => void;

  constructor() {
    this.terrain = new TerrainEngine(CANVAS_WIDTH, CANVAS_HEIGHT);
    this.particles = new ParticleEngine();
    this.physics = new PhysicsEngine(this.terrain, this.particles);
    this.ai = new AIEngine(this.terrain);

    // Default match settings
    this.settings = {
      playerCount: 2,
      vsAI: false,
      aiDifficulty: 'normal',
      unitsPerTeam: 3,
      turnTimeLimit: 30,
      biomeId: 'emerald',
      windIntensity: 'normal',
      startHp: 100,
      teamClasses: {
        0: ['mage', 'ranger', 'warrior'],
        1: ['warrior', 'ranger', 'mage'],
        2: ['paladin', 'alchemist', 'mage'],
        3: ['alchemist', 'warrior', 'paladin']
      }
    };
  }

  public initRenderer(ctx: CanvasRenderingContext2D) {
    this.renderer = new GameRenderer(ctx, this.terrain, this.particles);
    this.particles.initWeather(this.terrain.biomeId === 'frozen' ? 'snow' : this.terrain.biomeId === 'volcanic' ? 'embers' : 'spores', CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  public startMatch(settings: MatchSettings) {
    this.settings = settings;
    this.state = 'menu';
    this.matchStartTime = Date.now();
    this.roundNumber = 1;
    this.isCharging = false;
    this.aiPlan = null;
    this.aiTimer = 0;
    this.resolveTimer = 0;
    this.projectiles = [];
    this.particles.clear();

    // 1. Setup Biome & Terrain
    this.terrain.generate(settings.biomeId);
    if (this.renderer) {
      this.renderer.initBackground();
      const ambientType = settings.biomeId === 'frozen' ? 'snow' : settings.biomeId === 'volcanic' ? 'embers' : 'spores';
      this.particles.initWeather(ambientType, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // 2. Setup Teams
    this.teams = [];
    for (let t = 0; t < settings.playerCount; t++) {
      const base = TEAMS_DATA[t] || TEAMS_DATA[0];
      this.teams.push({
        ...base,
        isAI: settings.vsAI && t > 0
      });
    }

    // 3. Setup Units
    this.units = [];
    const count = settings.unitsPerTeam;

    for (let t = 0; t < settings.playerCount; t++) {
      const classesForTeam = settings.teamClasses[t] || ['mage', 'ranger', 'warrior', 'paladin'];

      for (let i = 0; i < count; i++) {
        const classId: HeroClassId = classesForTeam[i % classesForTeam.length] || 'warrior';
        const classDef = HERO_CLASSES[classId] || HERO_CLASSES.warrior;

        // Position spread across map
        const teamZoneW = CANVAS_WIDTH / settings.playerCount;
        const pad = 90;
        const xMin = t * teamZoneW + pad;
        const xMax = (t + 1) * teamZoneW - pad;
        const step = count > 1 ? (xMax - xMin) / (count - 1) : 0;
        const x = count === 1 ? (xMin + xMax) / 2 : xMin + i * step + (Math.random() - 0.5) * 20;

        const clampedX = Math.max(50, Math.min(CANVAS_WIDTH - 50, x));
        const groundY = this.terrain.getHeightAt(clampedX);

        // Initial ammo
        const initialAmmo: Record<WeaponId, number> = {
          fireball: -1,
          sniper_arrow: -1,
          war_axe: -1,
          cluster_volley: 3,
          acid_flask: 3,
          holy_grenade: 2,
          cataclysm_meteor: 1,
          blink_portal: 2
        };

        const unitHp = Math.round((classDef.hp / 100) * settings.startHp);

        this.units.push({
          id: `u_${t}_${i}_${Math.random().toString(36).substring(2, 6)}`,
          team: t,
          classId: classId,
          name: `${classDef.name} #${i + 1}`,
          icon: classDef.icon,
          hp: unitHp,
          maxHp: unitHp,
          alive: true,
          x: clampedX,
          y: groundY,
          vy: 0,
          ammo: initialAmmo,
          selectedWeapon: classDef.signatureWeapon,
          damageDealt: 0,
          kills: 0,
          defense: classDef.defense || 0
        });
      }
    }

    // Shuffle turn order evenly across teams (T0_U0, T1_U0, T0_U1, T1_U1, ...)
    const interleaved: Unit[] = [];
    for (let i = 0; i < count; i++) {
      for (let t = 0; t < settings.playerCount; t++) {
        const unit = this.units.find((u) => u.team === t && this.units.filter((x) => x.team === t).indexOf(u) === i);
        if (unit) interleaved.push(unit);
      }
    }
    this.units = interleaved;

    this.turnIndex = 0;
    this.newTurn(true);
  }

  public getCurrentUnit(): Unit | undefined {
    return this.units[this.turnIndex];
  }

  public getCurrentTeam(): Team | undefined {
    const cur = this.getCurrentUnit();
    if (!cur) return undefined;
    return this.teams.find((t) => t.id === cur.team);
  }

  public selectWeapon(weaponId: WeaponId) {
    const cur = this.getCurrentUnit();
    if (!cur || !cur.alive) return;
    const ammo = cur.ammo[weaponId];
    if (ammo === 0) return; // out of ammo
    cur.selectedWeapon = weaponId;
    sound.playSelectWeapon();
    this.notifyUnits();
  }

  public setAimAngle(angle: number) {
    if (this.state !== 'aim' && this.state !== 'charging') return;
    const team = this.getCurrentTeam();
    if (team?.isAI) return;
    this.aimAngle = angle;
  }

  public startCharging() {
    if (this.state !== 'aim') return;
    const team = this.getCurrentTeam();
    if (team?.isAI) return;

    this.isCharging = true;
    this.aimPower = 5;
    this.state = 'charging';
    sound.startCharge(0.05);
  }

  public stopChargingAndFire() {
    if (this.state !== 'charging' && this.state !== 'aim') return;
    const team = this.getCurrentTeam();
    if (team?.isAI) return;

    sound.stopCharge();
    this.isCharging = false;
    if (this.aimPower >= 5) {
      this.fire();
    } else {
      this.state = 'aim';
    }
  }

  public fire() {
    const u = this.getCurrentUnit();
    if (!u || !u.alive) return;

    const wDef = WEAPONS[u.selectedWeapon] || WEAPONS.fireball;

    // Check & deduct ammo
    if (u.ammo[u.selectedWeapon] > 0) {
      u.ammo[u.selectedWeapon] -= 1;
    }

    const sp = (4.5 + this.aimPower * 0.2) * wDef.speedMultiplier;

    this.projectiles.push({
      id: Math.random().toString(36).substring(2, 9),
      x: u.x,
      y: u.y - 22,
      vx: Math.cos(this.aimAngle) * sp,
      vy: Math.sin(this.aimAngle) * sp,
      weaponId: u.selectedWeapon,
      ownerId: u.id,
      ownerTeam: u.team,
      trail: [],
      bouncesLeft: wDef.bounceCount || 0,
      age: 0
    });

    sound.playShoot(u.selectedWeapon);

    this.state = 'flying';
    this.isCharging = false;
    this.notifyState();
  }

  public update(tick: number) {
    if (this.state === 'paused' || this.state === 'over' || this.state === 'menu') {
      return;
    }

    // 1. Weather particles
    const biome = this.settings.biomeId;
    const ambient = biome === 'frozen' ? 'snow' : biome === 'volcanic' ? 'embers' : 'spores';
    this.particles.updateWeather(CANVAS_WIDTH, CANVAS_HEIGHT, this.windForce, ambient);

    // 2. Particle FX
    this.particles.update();

    // 3. Aim Power Charging
    if (this.isCharging && this.state === 'charging') {
      this.aimPower = Math.min(100, this.aimPower + 1.8);
      sound.startCharge(this.aimPower / 100);
    }

    // 4. Units gravity settling
    const anyFalling = this.physics.updateUnitsGravity(this.units);

    // 5. Flying Projectiles
    if (this.projectiles.length > 0) {
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const p = this.projectiles[i];
        const res = this.physics.stepProjectile(
          p,
          this.units,
          this.windForce,
          (x, y, weapon, owner) => {
            this.handleExplosion(x, y, weapon, owner);
          }
        );

        if (res) {
          if (res.screenShake > 0 && this.renderer) {
            this.renderer.triggerShake(res.screenShake);
          }
          if (res.spawnClusters) {
            this.projectiles.push(...res.spawnClusters);
          }
          this.projectiles.splice(i, 1);
        }
      }

      // If all projectiles detonated, transition to resolve phase
      if (this.projectiles.length === 0) {
        this.state = 'resolve';
        this.resolveTimer = 65;
        this.notifyState();
      }
    }

    // 6. AI Turn Handling
    const curTeam = this.getCurrentTeam();
    if (curTeam?.isAI && this.state === 'aim' && this.aiPlan) {
      this.aiTimer--;
      // Aim interpolation
      this.aimAngle += (this.aiPlan.angle - this.aimAngle) * 0.12;
      this.aimPower += (this.aiPlan.power - this.aimPower) * 0.12;

      if (this.aiTimer <= 0) {
        this.aimAngle = this.aiPlan.angle;
        this.aimPower = this.aiPlan.power;
        this.selectWeapon(this.aiPlan.weaponId);
        this.aiPlan = null;
        this.fire();
      }
    }

    // 7. Resolve settling phase
    if (this.state === 'resolve') {
      this.resolveTimer--;
      if (this.resolveTimer <= 0 && !anyFalling) {
        this.checkMatchEndOrNextTurn();
      }
    }

    // 8. Renderer camera
    if (this.renderer) {
      const curUnit = this.getCurrentUnit();
      this.renderer.updateCamera(curUnit, this.projectiles, this.state === 'flying');
      this.renderer.render(
        tick,
        this.settings.biomeId,
        this.units,
        curUnit,
        this.projectiles,
        this.aimAngle,
        this.aimPower,
        this.state === 'aim' || this.state === 'charging',
        this.windForce
      );
    }
  }

  private handleExplosion(x: number, y: number, weapon: WeaponDef, owner: Unit | undefined) {
    this.physics.applyExplosionDamage(x, y, weapon, owner, this.units);
    this.particles.createExplosion(x, y, weapon.radius, weapon.color);
    sound.playExplosion(weapon.radius);
    this.notifyUnits();
  }

  private checkMatchEndOrNextTurn() {
    // Check alive teams
    const aliveTeams = new Set<number>();
    for (const u of this.units) {
      if (u.alive) {
        aliveTeams.add(u.team);
      }
    }

    if (aliveTeams.size <= 1) {
      // Game Over!
      this.state = 'over';
      const winnerId = aliveTeams.size === 1 ? Array.from(aliveTeams)[0] : null;

      // Calculate stats
      let totalDmg = 0;
      let mvp = this.units[0];
      for (const u of this.units) {
        totalDmg += u.damageDealt;
        if (!mvp || u.damageDealt > mvp.damageDealt) {
          mvp = u;
        }
      }

      this.matchStats = {
        winnerTeam: winnerId,
        roundsPlayed: this.roundNumber,
        totalDamage: totalDmg,
        matchDurationSeconds: Math.round((Date.now() - this.matchStartTime) / 1000),
        mvpUnitName: mvp ? `${mvp.name} (${TEAMS_DATA[mvp.team].name})` : 'Никто',
        mvpDamage: mvp ? mvp.damageDealt : 0,
        mvpKills: mvp ? mvp.kills : 0,
        teamStats: this.teams.map((t) => {
          const teamUnits = this.units.filter((u) => u.team === t.id);
          const alive = teamUnits.filter((u) => u.alive).length;
          const dmg = teamUnits.reduce((acc, cur) => acc + cur.damageDealt, 0);
          return {
            teamId: t.id,
            teamName: t.name,
            aliveUnits: alive,
            damageDealt: dmg,
            shotsFired: 0,
            directHits: 0
          };
        })
      };

      sound.playVictory();
      this.notifyState();
      if (this.onMatchEnd && this.matchStats) {
        this.onMatchEnd(this.matchStats);
      }
      return;
    }

    // Proceed to next turn
    this.newTurn(false);
  }

  private newTurn(isFirstTurn: boolean) {
    if (this.state === 'over') return;

    // Advance turnIndex to next alive unit
    let guard = 0;
    do {
      this.turnIndex = (this.turnIndex + 1) % this.units.length;
      if (this.turnIndex === 0 && !isFirstTurn) {
        this.roundNumber++;
      }
      guard++;
    } while (!this.units[this.turnIndex].alive && guard < 100);

    const cur = this.getCurrentUnit();
    if (!cur) return;

    // Generate Wind
    const windMul = this.settings.windIntensity === 'none' ? 0 : this.settings.windIntensity === 'low' ? 0.4 : this.settings.windIntensity === 'high' ? 1.6 : 1.0;
    this.wind = (Math.random() * 2 - 1) * windMul;
    this.windForce = this.wind * 0.12;

    // Initial aim direction points towards center of map
    const pointsRight = cur.x < CANVAS_WIDTH / 2;
    this.aimAngle = pointsRight ? -0.75 : Math.PI + 0.75;
    this.aimPower = 50;
    this.isCharging = false;

    // Timer reset
    this.turnTimeLeft = this.settings.turnTimeLimit;
    this.startTurnTimer();

    this.state = 'aim';
    sound.playTurnStart();

    // Notify React
    this.notifyState();
    this.notifyWind();
    this.notifyUnits();
    if (this.onTurnChange) {
      const curTeam = this.getCurrentTeam();
      if (curTeam) this.onTurnChange(cur, curTeam);
    }

    // If bot, prepare plan
    const curTeam = this.getCurrentTeam();
    if (curTeam?.isAI) {
      this.startAITurn(cur);
    }
  }

  private startAITurn(unit: Unit) {
    this.aiPlan = this.ai.computePlan(unit, this.units, this.windForce, this.settings.aiDifficulty);
    this.aiTimer = 55; // Delay in ticks before firing
  }

  private startTurnTimer() {
    if (this.turnTimerInterval) {
      clearInterval(this.turnTimerInterval);
      this.turnTimerInterval = null;
    }

    if (this.settings.turnTimeLimit <= 0) {
      if (this.onTimeTick) this.onTimeTick(0);
      return;
    }

    this.turnTimerInterval = window.setInterval(() => {
      if (this.state !== 'aim' && this.state !== 'charging') return;
      this.turnTimeLeft--;

      if (this.turnTimeLeft <= 5 && this.turnTimeLeft > 0) {
        sound.playTimerTick();
      }

      if (this.onTimeTick) {
        this.onTimeTick(this.turnTimeLeft);
      }

      if (this.turnTimeLeft <= 0) {
        // Time expired! Fire or force next turn
        if (this.turnTimerInterval) {
          clearInterval(this.turnTimerInterval);
          this.turnTimerInterval = null;
        }
        if (this.isCharging) {
          this.stopChargingAndFire();
        } else {
          this.fire();
        }
      }
    }, 1000);
  }

  public stop() {
    if (this.turnTimerInterval) {
      clearInterval(this.turnTimerInterval);
      this.turnTimerInterval = null;
    }
    sound.stopCharge();
  }

  private notifyState() {
    if (this.onStateChange) this.onStateChange(this.state);
  }

  private notifyUnits() {
    if (this.onUnitsUpdate) this.onUnitsUpdate([...this.units]);
  }

  private notifyWind() {
    if (this.onWindUpdate) this.onWindUpdate(this.wind);
  }
}
