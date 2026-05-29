// ============================================================
// 山西古建保卫战 — 全局常量配置
// ============================================================

// ---- 地图 ----
export const MAP_WIDTH = 1920;
export const MAP_HEIGHT = 1080;
export const GAME_WIDTH = 1024;
export const GAME_HEIGHT = 768;
export const GAME_DURATION = 300; // 秒 (5 分钟)

// ---- 速度转换系数 ----
// spec 数值基于 60fps 每帧移动量，代码中转为 px/s
export const SPEED_FACTOR = 60;

// ---- 玩家 ----
export const PLAYER_CONFIG = {
  maxHp: 100,
  moveSpeed: 4,          // spec 值，代码中 * 60 = 240 px/s
  radius: 16,
  color: 0x4488ff,
  startOffsetY: 120,     // 出生在古建下方
};

// ---- 古建基地（木构古寺） ----
export const BUILDING_CONFIG = {
  x: MAP_WIDTH / 2,      // 960
  y: MAP_HEIGHT / 2,     // 540
  attackRange: 80,       // 怪物在此距离内开始攻击
  structures: {
    wood:     { maxHp: 120, color: 0xC4884D, label: '木质结构' },
    stone:    { maxHp:  70, color: 0x999999, label: '石质结构' },
    tile:     { maxHp:  90, color: 0xA0522D, label: '砖瓦结构' },
    painting: { maxHp:  80, color: 0x9966CC, label: '彩绘壁画' },
  },
} as const;

export type StructureType = keyof typeof BUILDING_CONFIG.structures;

// ---- 怪物模板 ----
export type MonsterType = 'termite' | 'wind' | 'acid_rain' | 'fire' | 'freeze_thaw';

export interface MonsterTemplate {
  type: MonsterType;
  name: string;
  hp: number;
  speed: number;
  damage: number;
  attackInterval: number; // ms
  attackStructures: StructureType[];
  color: number;
  radius: number;
  expDrop: number;
}

export const MONSTER_TEMPLATES: Record<MonsterType, MonsterTemplate> = {
  termite: {
    type: 'termite', name: '白蚁怪',
    hp: 20, speed: 2.8, damage: 3,
    attackInterval: 1000,
    attackStructures: ['wood'],
    color: 0xDDDDDD, radius: 8, expDrop: 1,
  },
  wind: {
    type: 'wind', name: '风蚀怪',
    hp: 35, speed: 3.2, damage: 5,
    attackInterval: 1200,
    attackStructures: ['stone', 'painting'],
    color: 0xDDCC88, radius: 10, expDrop: 2,
  },
  acid_rain: {
    type: 'acid_rain', name: '酸雨怪',
    hp: 45, speed: 1.8, damage: 6,
    attackInterval: 2000,
    attackStructures: ['stone', 'tile'],
    color: 0x44CC44, radius: 11, expDrop: 3,
  },
  fire: {
    type: 'fire', name: '火焰怪',
    hp: 50, speed: 2.4, damage: 8,
    attackInterval: 1500,
    attackStructures: ['wood', 'painting'],
    color: 0xFF6633, radius: 12, expDrop: 4,
  },
  freeze_thaw: {
    type: 'freeze_thaw', name: '冻融怪',
    hp: 80, speed: 1.4, damage: 10,
    attackInterval: 2000,
    attackStructures: ['stone', 'tile'],
    color: 0x6699FF, radius: 14, expDrop: 5,
  },
};

// ---- 怪物生成 ----
export const SPAWN_DISTANCE = 700; // 从地图中心算起的生成距离
export const INITIAL_SPAWN_INTERVAL = 2000; // ms

// ---- 经验 ----
export const BASE_EXP_TO_LEVEL = 10;
export const EXP_PER_LEVEL = 5; // ExpToNext = BASE + Level * EXP_PER_LEVEL
export const PICKUP_RANGE = 90; // 经验球自动吸附范围 (spec 1.5 * 60)
