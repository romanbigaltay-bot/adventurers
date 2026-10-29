export type GameState =
  | 'menu'
  | 'setup'
  | 'aim'
  | 'charging'
  | 'flying'
  | 'resolve'
  | 'transition'
  | 'over'
  | 'paused';

export type BiomeId = 'emerald' | 'volcanic' | 'frozen' | 'desert';

export type WeaponId =
  | 'fireball'
  | 'sniper_arrow'
  | 'war_axe'
  | 'cluster_volley'
  | 'acid_flask'
  | 'holy_grenade'
  | 'cataclysm_meteor'
  | 'blink_portal';

export type HeroClassId = 'mage' | 'ranger' | 'warrior' | 'alchemist' | 'paladin';

export interface WeaponDef {
  id: WeaponId;
  name: string;
  category: 'Основное' | 'Тяжелое' | 'Особое' | 'Тактика';
  desc: string;
  icon: string;
  damage: number;
  radius: number;
  gravity: number;
  speedMultiplier: number;
  maxAmmo: number; // -1 for unlimited
  color: string;
  trailColor: string;
  bounceCount?: number;
  clusterCount?: number;
  isUtility?: boolean;
}

export interface HeroClassDef {
  id: HeroClassId;
  name: string;
  title: string;
  icon: string;
  hp: number;
  defense: number; // 0 to 0.3
  signatureWeapon: WeaponId;
  description: string;
  accentColor: string;
}

export interface Unit {
  id: string;
  team: number;
  classId: HeroClassId;
  name: string;
  icon: string;
  hp: number;
  maxHp: number;
  alive: boolean;
  x: number;
  y: number;
  vy: number;
  ammo: Record<WeaponId, number>;
  selectedWeapon: WeaponId;
  damageDealt: number;
  kills: number;
  defense: number;
}

export interface Team {
  id: number;
  name: string;
  color: string;
  lightColor: string;
  isAI: boolean;
  score: number;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  weaponId: WeaponId;
  ownerId: string;
  ownerTeam: number;
  trail: Array<{ x: number; y: number; alpha: number }>;
  bouncesLeft: number;
  age: number;
  isClusterSub?: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
  gravity: number;
  drag: number;
  shape?: 'circle' | 'spark' | 'smoke' | 'debris';
}

export interface RingWave {
  x: number;
  y: number;
  r: number;
  maxR: number;
  life: number;
  color: string;
  lineWidth: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  isCrit?: boolean;
}

export interface WeatherParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}

export interface BiomeConfig {
  id: BiomeId;
  name: string;
  description: string;
  skyGradient: [string, string, string, string];
  mountains: [string, string];
  groundGradient: [string, string, string, string];
  grassBorder: string;
  grassTop: string;
  dirtColor: string;
  rockColor: string;
  ambientType: 'spores' | 'embers' | 'snow' | 'sand';
  particleColor: string;
  gravityMul: number;
  windMul: number;
}

export interface MatchSettings {
  playerCount: number; // 2, 3, 4
  vsAI: boolean;
  aiDifficulty: 'easy' | 'normal' | 'hard';
  unitsPerTeam: number; // 1, 2, 3, 4
  turnTimeLimit: number; // in seconds (0 = infinite)
  biomeId: BiomeId;
  windIntensity: 'none' | 'low' | 'normal' | 'high';
  startHp: number; // 80, 100, 130
  teamClasses: Record<number, HeroClassId[]>;
}

export interface MatchStats {
  winnerTeam: number | null;
  roundsPlayed: number;
  totalDamage: number;
  matchDurationSeconds: number;
  mvpUnitName: string;
  mvpDamage: number;
  mvpKills: number;
  teamStats: Array<{
    teamId: number;
    teamName: string;
    aliveUnits: number;
    damageDealt: number;
    shotsFired: number;
    directHits: number;
  }>;
}
