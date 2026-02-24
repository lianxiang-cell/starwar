
import { EnemyType, PowerUpType, Difficulty } from './types';

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 1000;

export const DIFFICULTY_CONFIG = {
  [Difficulty.EASY]: {
    spawnRate: 0.015,
    enemySpeedMult: 0.8,
    playerHealth: 5,
    label: '简单',
    description: '适合新手，更多生命值，敌人较慢',
  },
  [Difficulty.NORMAL]: {
    spawnRate: 0.02,
    enemySpeedMult: 1.0,
    playerHealth: 3,
    label: '普通',
    description: '标准挑战，平衡的游戏体验',
  },
  [Difficulty.HARD]: {
    spawnRate: 0.03,
    enemySpeedMult: 1.3,
    playerHealth: 2,
    label: '困难',
    description: '极高难度，敌人疯狂涌入',
  },
};

export const PLAYER_SPEED = 7;
export const PLAYER_WIDTH = 50;
export const PLAYER_HEIGHT = 50;
export const PLAYER_MAX_HEALTH = 3;

// Asset Paths (Users can replace these with local paths in VSCode)
export const ASSETS = {
  PLAYER: '/assets/player.png',
  ENEMY_BASIC: '/assets/enemy_basic.png',
  ENEMY_FAST: '/assets/enemy_fast.png',
  ENEMY_HEAVY: '/assets/enemy_heavy.png',
  POWERUP_TRIPLE: '/assets/powerup_triple.png',
  POWERUP_SHIELD: '/assets/powerup_shield.png',
  BGM: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3', // Fast space synth
  // 优先使用本地文件，如果没有则使用远程备份
  SFX_SHOOT: 'https://cdn.pixabay.com/audio/2021/08/04/audio_12b0c7443c.mp3', // Laser shoot
  SFX_EXPLOSION: 'https://cdn.pixabay.com/audio/2021/08/09/audio_c8c8a73456.mp3', // Deep explosion
  SFX_POWERUP: 'https://cdn.pixabay.com/audio/2021/08/04/audio_0625c1539c.mp3', // Powerup chime
  SFX_HIT: 'https://cdn.pixabay.com/audio/2022/03/15/audio_78391032a3.mp3', // Impact hit
};

export const BULLET_SPEED = 10;
export const BULLET_WIDTH = 4;
export const BULLET_HEIGHT = 15;

export const ENEMY_CONFIG = {
  [EnemyType.BASIC]: {
    width: 40,
    height: 40,
    speed: 3,
    health: 1,
    points: 100,
    color: '#3b82f6', // blue-500
  },
  [EnemyType.FAST]: {
    width: 30,
    height: 30,
    speed: 6,
    health: 1,
    points: 150,
    color: '#f59e0b', // amber-500
  },
  [EnemyType.HEAVY]: {
    width: 60,
    height: 60,
    speed: 1.5,
    health: 3,
    points: 300,
    color: '#ef4444', // red-500
  },
};

export const POWERUP_CONFIG = {
  [PowerUpType.TRIPLE_SHOT]: {
    color: '#10b981', // emerald-500
    duration: 10000, // 10 seconds
  },
  [PowerUpType.SHIELD]: {
    color: '#8b5cf6', // violet-500
  },
};

export const ACHIEVEMENTS_LIST = [
  { id: 'first_blood', title: '第一滴血', description: '击毁第一架敌机', unlocked: false },
  { id: 'survivor', title: '生存者', description: '达到第5关', unlocked: false },
  { id: 'ace_pilot', title: '王牌飞行员', description: '得分超过10,000', unlocked: false },
  { id: 'power_hungry', title: '能量狂人', description: '同时拥有护盾和三向子弹', unlocked: false },
  { id: 'unstoppable', title: '势不可挡', description: '在不损失生命的情况下击毁50架敌机', unlocked: false },
];
