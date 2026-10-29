import { BiomeConfig, BiomeId, HeroClassDef, HeroClassId, Team, WeaponDef, WeaponId } from './types';

export const CANVAS_WIDTH = 1440;
export const CANVAS_HEIGHT = 810;

export const WEAPONS: Record<WeaponId, WeaponDef> = {
  fireball: {
    id: 'fireball',
    name: 'Огненный шар',
    category: 'Основное',
    desc: 'Классическое разрушительное заклинание с высокой силой взрыва и выжиганием земли.',
    icon: '🔥',
    damage: 55,
    radius: 46,
    gravity: 0.28,
    speedMultiplier: 1.05,
    maxAmmo: -1,
    color: '#ff6b22',
    trailColor: 'rgba(255, 107, 34, 0.7)'
  },
  sniper_arrow: {
    id: 'sniper_arrow',
    name: 'Эльфийская стрела',
    category: 'Основное',
    desc: 'Высокая начальная скорость, минимальное влияние гравитации. Идеально для прицельных попаданий.',
    icon: '🏹',
    damage: 42,
    radius: 20,
    gravity: 0.14,
    speedMultiplier: 1.45,
    maxAmmo: -1,
    color: '#6ee7b7',
    trailColor: 'rgba(110, 231, 183, 0.7)'
  },
  war_axe: {
    id: 'war_axe',
    name: 'Боевой секиролом',
    category: 'Тяжелое',
    desc: 'Тяжелое метательное оружие варваров. Пробивает глубокую воронку и отбрасывает цель.',
    icon: '🪓',
    damage: 65,
    radius: 54,
    gravity: 0.38,
    speedMultiplier: 0.92,
    maxAmmo: -1,
    color: '#f87171',
    trailColor: 'rgba(248, 113, 113, 0.6)'
  },
  cluster_volley: {
    id: 'cluster_volley',
    name: 'Кассетный снаряд',
    category: 'Особое',
    desc: 'В полете разделяется на 3 разрывных боеприпаса, накрывая широкую площадь.',
    icon: '✨',
    damage: 32, // each
    radius: 32,
    gravity: 0.27,
    speedMultiplier: 1.08,
    maxAmmo: 3,
    color: '#fbbf24',
    trailColor: 'rgba(251, 191, 36, 0.7)',
    clusterCount: 3
  },
  acid_flask: {
    id: 'acid_flask',
    name: 'Кислотный алхимик',
    category: 'Особое',
    desc: 'Едкая алхимическая смесь, которая плавит рельеф глубоко вниз и сбрасывает врагов в яму.',
    icon: '🧪',
    damage: 48,
    radius: 38,
    gravity: 0.32,
    speedMultiplier: 1.0,
    maxAmmo: 3,
    color: '#a3e635',
    trailColor: 'rgba(163, 230, 53, 0.7)'
  },
  holy_grenade: {
    id: 'holy_grenade',
    name: 'Священный осколок',
    category: 'Тяжелое',
    desc: 'Освященная бомба, которая отскакивает от препятствий и детонирует мощной ударной волной.',
    icon: '💎',
    damage: 75,
    radius: 62,
    gravity: 0.30,
    speedMultiplier: 0.98,
    maxAmmo: 2,
    color: '#60a5fa',
    trailColor: 'rgba(96, 165, 250, 0.8)',
    bounceCount: 2
  },
  cataclysm_meteor: {
    id: 'cataclysm_meteor',
    name: 'Катаклизм (Метеор)',
    category: 'Особое',
    desc: 'Супероружие: колоссальный метеорит, оставляющий гигантский кратер. Редкий боезапас.',
    icon: '☄️',
    damage: 90,
    radius: 80,
    gravity: 0.42,
    speedMultiplier: 0.88,
    maxAmmo: 1,
    color: '#c084fc',
    trailColor: 'rgba(192, 132, 252, 0.9)'
  },
  blink_portal: {
    id: 'blink_portal',
    name: 'Скачок сквозь бездну',
    category: 'Тактика',
    desc: 'Тактический телепорт. Перемещает стреляющего героя в точку падения без урона.',
    icon: '🌀',
    damage: 0,
    radius: 22,
    gravity: 0.22,
    speedMultiplier: 1.25,
    maxAmmo: 2,
    color: '#38bdf8',
    trailColor: 'rgba(56, 189, 248, 0.8)',
    isUtility: true
  }
};

export const HERO_CLASSES: Record<HeroClassId, HeroClassDef> = {
  mage: {
    id: 'mage',
    name: 'Архимаг',
    title: 'Повелитель стихий',
    icon: '🧙‍♂️',
    hp: 100,
    defense: 0.05,
    signatureWeapon: 'fireball',
    description: 'Мастер взрывной магии и разрушения местности. Использует силу огня и небесный катаклизм.',
    accentColor: '#38bdf8'
  },
  ranger: {
    id: 'ranger',
    name: 'Следопыт',
    title: 'Эльфийский снайпер',
    icon: '🏹',
    hp: 95,
    defense: 0.0,
    signatureWeapon: 'sniper_arrow',
    description: 'Высокая точность и дальнобойность. Превосходно поражает цели на противоположном краю карты.',
    accentColor: '#34d399'
  },
  warrior: {
    id: 'warrior',
    name: 'Берсерк',
    title: 'Сокрушитель скал',
    icon: '🪓',
    hp: 130,
    defense: 0.15,
    signatureWeapon: 'war_axe',
    description: 'Высокий запас здоровья и брони. Наносит сокрушительный урон тяжелым топором.',
    accentColor: '#f87171'
  },
  alchemist: {
    id: 'alchemist',
    name: 'Алхимик',
    title: 'Подрывник-изобретатель',
    icon: '🧪',
    hp: 90,
    defense: 0.05,
    signatureWeapon: 'acid_flask',
    description: 'Использует едкие смеси, разъедающие почву, и непредсказуемые кассетные снаряды.',
    accentColor: '#a3e635'
  },
  paladin: {
    id: 'paladin',
    name: 'Паладин',
    title: 'Рыцарь рассвета',
    icon: '🛡️',
    hp: 120,
    defense: 0.20,
    signatureWeapon: 'holy_grenade',
    description: 'Стойкий защитник, вооруженный священными гранатами с колоссальной ударной волной.',
    accentColor: '#fbbf24'
  }
};

export const TEAMS_DATA: Team[] = [
  {
    id: 0,
    name: 'Орден Света',
    color: '#3b82f6',
    lightColor: '#93c5fd',
    isAI: false,
    score: 0
  },
  {
    id: 1,
    name: 'Орда Разрушения',
    color: '#ef4444',
    lightColor: '#fca5a5',
    isAI: false,
    score: 0
  },
  {
    id: 2,
    name: 'Изумрудный Ковен',
    color: '#10b981',
    lightColor: '#6ee7b7',
    isAI: false,
    score: 0
  },
  {
    id: 3,
    name: 'Золотой Альянс',
    color: '#f59e0b',
    lightColor: '#fcd34d',
    isAI: false,
    score: 0
  }
];

export const BIOMES: Record<BiomeId, BiomeConfig> = {
  emerald: {
    id: 'emerald',
    name: 'Изумрудные Холмы',
    description: 'Древние цветущие долины с мягкими склонами и умеренным ветром.',
    skyGradient: ['#070d1e', '#162347', '#2a3b63', '#4b557a'],
    mountains: ['#121b33', '#1e2c50'],
    groundGradient: ['#4d3725', '#38271a', '#24180f', '#130d07'],
    grassBorder: '#2e5618',
    grassTop: '#65a30d',
    dirtColor: '#523a23',
    rockColor: '#2d2217',
    ambientType: 'spores',
    particleColor: 'rgba(217, 249, 157, 0.5)',
    gravityMul: 1.0,
    windMul: 1.0
  },
  volcanic: {
    id: 'volcanic',
    name: 'Вулканический Пик',
    description: 'Раскаленные базальтовые утесы, огненный пепел и сильные порывы ветра.',
    skyGradient: ['#180808', '#2b0c0c', '#4a1515', '#6b201a'],
    mountains: ['#220b0b', '#381212'],
    groundGradient: ['#261616', '#1a0d0d', '#120808', '#080303'],
    grassBorder: '#7f1d1d',
    grassTop: '#ef4444',
    dirtColor: '#2b1a1a',
    rockColor: '#170c0c',
    ambientType: 'embers',
    particleColor: 'rgba(251, 146, 60, 0.7)',
    gravityMul: 1.05,
    windMul: 1.25
  },
  frozen: {
    id: 'frozen',
    name: 'Ледяной Перевал',
    description: 'Замерзшие скалы под северным сиянием, снежная буря и низкая гравитация.',
    skyGradient: ['#030b14', '#081d33', '#10375c', '#1b4d79'],
    mountains: ['#0a2238', '#113554'],
    groundGradient: ['#253b4d', '#192b3a', '#101d29', '#080e14'],
    grassBorder: '#38bdf8',
    grassTop: '#e0f2fe',
    dirtColor: '#22384a',
    rockColor: '#142533',
    ambientType: 'snow',
    particleColor: 'rgba(224, 242, 254, 0.7)',
    gravityMul: 0.95,
    windMul: 1.15
  },
  desert: {
    id: 'desert',
    name: 'Пески Времени',
    description: 'Бескрайние дюны, палящее закатное солнце и мягкий сыпучий песчаник.',
    skyGradient: ['#1a0f1e', '#33192f', '#57253b', '#833946'],
    mountains: ['#3b1b2a', '#4e2536'],
    groundGradient: ['#543a22', '#3f2b18', '#2a1c0f', '#170e07'],
    grassBorder: '#d97706',
    grassTop: '#fbbf24',
    dirtColor: '#593d22',
    rockColor: '#362313',
    ambientType: 'sand',
    particleColor: 'rgba(253, 230, 138, 0.6)',
    gravityMul: 1.0,
    windMul: 0.85
  }
};
