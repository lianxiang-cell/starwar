
export enum GameState {
  START = 'START',
  DIFFICULTY_SELECT = 'DIFFICULTY_SELECT',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
}

export enum Difficulty {
  EASY = 'EASY',
  NORMAL = 'NORMAL',
  HARD = 'HARD',
}

export enum EnemyType {
  BASIC = 'BASIC',
  FAST = 'FAST',
  HEAVY = 'HEAVY',
}

export enum PowerUpType {
  TRIPLE_SHOT = 'TRIPLE_SHOT',
  SHIELD = 'SHIELD',
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

export interface Point {
  x: number;
  y: number;
}

export interface Entity extends Point {
  width: number;
  height: number;
  speed: number;
}

export interface Player extends Entity {
  health: number;
  maxHealth: number;
  invincible: boolean;
  invincibleTimer: number;
  shieldActive: boolean;
  tripleShotTimer: number;
  score: number;
  level: number;
}

export interface Bullet extends Entity {
  damage: number;
  isPlayerBullet: boolean;
  angle?: number;
}

export interface Enemy extends Entity {
  type: EnemyType;
  health: number;
  maxHealth: number;
  points: number;
}

export interface PowerUp extends Entity {
  type: PowerUpType;
}

export interface Particle extends Point {
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  friction?: number;
  alpha?: number;
}
