
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  GameState, 
  Player, 
  Bullet, 
  Enemy, 
  PowerUp, 
  Particle, 
  EnemyType, 
  PowerUpType,
  Achievement,
  Difficulty
} from '../types';
import { 
  GAME_WIDTH, 
  GAME_HEIGHT, 
  PLAYER_SPEED, 
  PLAYER_WIDTH, 
  PLAYER_HEIGHT, 
  PLAYER_MAX_HEALTH,
  BULLET_SPEED,
  BULLET_WIDTH,
  BULLET_HEIGHT,
  ENEMY_CONFIG,
  POWERUP_CONFIG,
  ACHIEVEMENTS_LIST,
  ASSETS,
  DIFFICULTY_CONFIG
} from '../constants';

export const useGame = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.NORMAL);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [health, setHealth] = useState(PLAYER_MAX_HEALTH);
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS_LIST);
  const [lastAchievement, setLastAchievement] = useState<Achievement | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [screenShake, setScreenShake] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);
  const imagesRef = useRef<Record<string, HTMLImageElement>>({});
  
  // Game Entities
  const playerRef = useRef<Player>({
    x: GAME_WIDTH / 2 - PLAYER_WIDTH / 2,
    y: GAME_HEIGHT - 100,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    speed: PLAYER_SPEED,
    health: PLAYER_MAX_HEALTH,
    maxHealth: PLAYER_MAX_HEALTH,
    invincible: false,
    invincibleTimer: 0,
    shieldActive: false,
    tripleShotTimer: 0,
    score: 0,
    level: 1,
  });

  const bulletsRef = useRef<Bullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<{x: number, y: number, size: number, speed: number, layer: number}[]>([]);
  const nebulaeRef = useRef<{x: number, y: number, size: number, color: string, vx: number, vy: number}[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sfxRef = useRef<Record<string, HTMLAudioElement>>({});
  const [isMusicMuted, setIsMusicMuted] = useState(false);

  const playSound = useCallback((key: string) => {
    if (isMusicMuted) return;
    const sound = sfxRef.current[key];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(() => {});
    }
  }, [isMusicMuted]);

  // Input handling
  const keysRef = useRef<Set<string>>(new Set());
  const touchRef = useRef<{x: number, y: number} | null>(null);

  // Initialize assets (Images and Audio)
  useEffect(() => {
    // Load Images
    const loadImages = () => {
      const assetMap: Record<string, string> = {
        player: ASSETS.PLAYER,
        [EnemyType.BASIC]: ASSETS.ENEMY_BASIC,
        [EnemyType.FAST]: ASSETS.ENEMY_FAST,
        [EnemyType.HEAVY]: ASSETS.ENEMY_HEAVY,
        [PowerUpType.TRIPLE_SHOT]: ASSETS.POWERUP_TRIPLE,
        [PowerUpType.SHIELD]: ASSETS.POWERUP_SHIELD,
      };

      Object.entries(assetMap).forEach(([key, src]) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          imagesRef.current[key] = img;
        };
        img.onerror = () => {
          console.warn(`Failed to load image: ${src}. Falling back to vector shapes.`);
        };
      });
    };

    loadImages();

    // Load SFX
    const loadSFX = () => {
      const sfxMap: Record<string, string> = {
        shoot: ASSETS.SFX_SHOOT,
        explosion: ASSETS.SFX_EXPLOSION,
        powerup: ASSETS.SFX_POWERUP,
        hit: ASSETS.SFX_HIT,
      };

      Object.entries(sfxMap).forEach(([key, src]) => {
        const audio = new Audio(src);
        sfxRef.current[key] = audio;
      });
    };

    loadSFX();

    // Initialize stars and nebulae
    const stars = [];
    for (let i = 0; i < 150; i++) {
      const layer = Math.floor(Math.random() * 3); // 0: distant, 1: mid, 2: close
      stars.push({
        x: Math.random() * GAME_WIDTH,
        y: Math.random() * GAME_HEIGHT,
        size: layer === 0 ? 1 : (layer === 1 ? 2 : 3),
        speed: layer === 0 ? 0.5 : (layer === 1 ? 1.2 : 2.5),
        layer,
      });
    }
    starsRef.current = stars;

    const nebulae = [];
    const colors = ['rgba(59, 130, 246, 0.05)', 'rgba(139, 92, 246, 0.05)', 'rgba(236, 72, 153, 0.05)'];
    for (let i = 0; i < 5; i++) {
      nebulae.push({
        x: Math.random() * GAME_WIDTH,
        y: Math.random() * GAME_HEIGHT,
        size: Math.random() * 300 + 200,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.2,
        vy: Math.random() * 0.2 + 0.1,
      });
    }
    nebulaeRef.current = nebulae;

    // Initialize Audio
    const audio = new Audio(ASSETS.BGM);
    audio.loop = true;
    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMusicMuted;
      if (gameState === GameState.PLAYING && !isMusicMuted) {
        audioRef.current.play().catch((e) => {
          console.log('Autoplay blocked, waiting for interaction', e);
        });
      } else if (gameState === GameState.GAME_OVER || gameState === GameState.START) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      audioRef.current.volume = gameState === GameState.PLAYING ? 0.4 : 0.2;
    }
  }, [gameState, isMusicMuted]);

  const toggleMusic = () => setIsMusicMuted(prev => !prev);

  const unlockAchievement = useCallback((id: string) => {
    setAchievements(prev => {
      const achievement = prev.find(a => a.id === id);
      if (achievement && !achievement.unlocked) {
        const updated = prev.map(a => a.id === id ? { ...a, unlocked: true } : a);
        setLastAchievement({ ...achievement, unlocked: true });
        setTimeout(() => setLastAchievement(null), 3000);
        return updated;
      }
      return prev;
    });
  }, []);

  const resetGame = useCallback((selectedDifficulty: Difficulty = difficulty) => {
    const diffSettings = DIFFICULTY_CONFIG[selectedDifficulty];
    setDifficulty(selectedDifficulty);
    playerRef.current = {
      x: GAME_WIDTH / 2 - PLAYER_WIDTH / 2,
      y: GAME_HEIGHT - 100,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      speed: PLAYER_SPEED,
      health: diffSettings.playerHealth,
      maxHealth: diffSettings.playerHealth,
      invincible: false,
      invincibleTimer: 0,
      shieldActive: false,
      tripleShotTimer: 0,
      score: 0,
      level: 1,
    };
    bulletsRef.current = [];
    enemiesRef.current = [];
    powerUpsRef.current = [];
    particlesRef.current = [];
    setScore(0);
    setLevel(1);
    setHealth(diffSettings.playerHealth);
    setGameState(GameState.PLAYING);
  }, [difficulty]);

  const spawnEnemy = useCallback(() => {
    const types = [EnemyType.BASIC];
    if (level >= 2) types.push(EnemyType.FAST);
    if (level >= 3) types.push(EnemyType.HEAVY);
    
    const type = types[Math.floor(Math.random() * types.length)];
    const config = ENEMY_CONFIG[type];
    const diffSettings = DIFFICULTY_CONFIG[difficulty];
    
    enemiesRef.current.push({
      x: Math.random() * (GAME_WIDTH - config.width),
      y: -config.height,
      width: config.width,
      height: config.height,
      speed: (config.speed + (level * 0.2)) * diffSettings.enemySpeedMult,
      type,
      health: config.health,
      maxHealth: config.health,
      points: config.points,
    });
  }, [level, difficulty]);

  const spawnPowerUp = useCallback((x: number, y: number) => {
    const types = [PowerUpType.TRIPLE_SHOT, PowerUpType.SHIELD];
    const type = types[Math.floor(Math.random() * types.length)];
    
    powerUpsRef.current.push({
      x,
      y,
      width: 30,
      height: 30,
      speed: 2,
      type,
    });
  }, []);

  const createExplosion = (x: number, y: number, color: string, count = 20) => {
    // Screen shake
    setScreenShake(10);

    // 1. Core Flash / Shockwave
    for (let i = 0; i < 5; i++) {
      particlesRef.current.push({
        x, y,
        vx: 0, vy: 0,
        life: 1, maxLife: 0.3,
        color: '#ffffff',
        size: (i + 1) * 15,
        alpha: 0.8,
        friction: 1
      });
    }

    // 2. Main Debris / Sparks
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 4;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: Math.random() * 0.8 + 0.4,
        color: i % 2 === 0 ? color : '#ffffff',
        size: Math.random() * 5 + 2,
        friction: 0.95,
      });
    }

    // 3. Smoke / Lingering particles
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 1;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: Math.random() * 1.5 + 1,
        color: '#4b5563', // gray-600
        size: Math.random() * 10 + 5,
        friction: 0.98,
      });
    }
  };

  const update = useCallback((delta: number) => {
    if (gameState !== GameState.PLAYING) return;

    // Screen shake decay
    if (screenShake > 0) {
      setScreenShake(s => Math.max(0, s - 0.5));
    }

    const player = playerRef.current;

    // Handle Movement
    if (touchRef.current) {
      const targetX = touchRef.current.x - player.width / 2;
      const targetY = touchRef.current.y - player.height / 2;
      player.x += (targetX - player.x) * 0.2;
      player.y += (targetY - player.y) * 0.2;
    } else {
      if (keysRef.current.has('ArrowLeft') || keysRef.current.has('a')) player.x -= player.speed;
      if (keysRef.current.has('ArrowRight') || keysRef.current.has('d')) player.x += player.speed;
      if (keysRef.current.has('ArrowUp') || keysRef.current.has('w')) player.y -= player.speed;
      if (keysRef.current.has('ArrowDown') || keysRef.current.has('s')) player.y += player.speed;
    }

    // Constrain player
    player.x = Math.max(0, Math.min(GAME_WIDTH - player.width, player.x));
    player.y = Math.max(0, Math.min(GAME_HEIGHT - player.height, player.y));

    // Update timers
    if (player.invincibleTimer > 0) {
      player.invincibleTimer -= delta;
      if (player.invincibleTimer <= 0) player.invincible = false;
    }
    if (player.tripleShotTimer > 0) {
      player.tripleShotTimer -= delta;
    }

    // Stars
    starsRef.current.forEach(star => {
      star.y += star.speed;
      if (star.y > GAME_HEIGHT) {
        star.y = 0;
        star.x = Math.random() * GAME_WIDTH;
      }
    });

    // Nebulae
    nebulaeRef.current.forEach(nebula => {
      nebula.x += nebula.vx;
      nebula.y += nebula.vy;
      if (nebula.y > GAME_HEIGHT + nebula.size) {
        nebula.y = -nebula.size;
        nebula.x = Math.random() * GAME_WIDTH;
      }
    });

    // Bullets
    bulletsRef.current.forEach((bullet, index) => {
      if (bullet.angle !== undefined) {
        bullet.x += Math.cos(bullet.angle) * bullet.speed;
        bullet.y += Math.sin(bullet.angle) * bullet.speed;
      } else {
        bullet.y -= bullet.speed;
      }
      if (bullet.y < -50 || bullet.y > GAME_HEIGHT + 50 || bullet.x < -50 || bullet.x > GAME_WIDTH + 50) {
        bulletsRef.current.splice(index, 1);
      }
    });

    // Enemies
    enemiesRef.current.forEach((enemy, eIndex) => {
      enemy.y += enemy.speed;
      
      // Check collision with player
      if (!player.invincible && 
          player.x < enemy.x + enemy.width &&
          player.x + player.width > enemy.x &&
          player.y < enemy.y + enemy.height &&
          player.y + player.height > enemy.y) {
        
        if (player.shieldActive) {
          player.shieldActive = false;
          playSound('hit');
          createExplosion(player.x + player.width/2, player.y + player.height/2, '#8b5cf6', 20);
        } else {
          playSound('hit');
          setHealth(h => {
            const newHealth = h - 1;
            if (newHealth <= 0) setGameState(GameState.GAME_OVER);
            return newHealth;
          });
          player.invincible = true;
          player.invincibleTimer = 2000;
          createExplosion(player.x + player.width/2, player.y + player.height/2, '#ffffff', 20);
        }
        enemiesRef.current.splice(eIndex, 1);
      }

      // Check escape
      if (enemy.y > GAME_HEIGHT) {
        enemiesRef.current.splice(eIndex, 1);
        setScore(s => Math.max(0, s - 50));
      }

      // Check collision with bullets
      bulletsRef.current.forEach((bullet, bIndex) => {
        if (bullet.isPlayerBullet &&
            bullet.x < enemy.x + enemy.width &&
            bullet.x + bullet.width > enemy.x &&
            bullet.y < enemy.y + enemy.height &&
            bullet.y + bullet.height > enemy.y) {
          
          enemy.health -= bullet.damage;
          bulletsRef.current.splice(bIndex, 1);
          playSound('hit');
          
          if (enemy.health <= 0) {
            playSound('explosion');
            createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2, ENEMY_CONFIG[enemy.type].color);
            setScore(s => {
              const newScore = s + enemy.points;
              if (newScore >= 10000) unlockAchievement('ace_pilot');
              return newScore;
            });
            unlockAchievement('first_blood');
            
            // Chance to drop powerup
            if (Math.random() < 0.1) {
              spawnPowerUp(enemy.x, enemy.y);
            }
            
            enemiesRef.current.splice(eIndex, 1);
          }
        }
      });
    });

    // PowerUps
    powerUpsRef.current.forEach((pu, index) => {
      pu.y += pu.speed;
      if (pu.x < player.x + player.width &&
          pu.x + pu.width > player.x &&
          pu.y < player.y + player.height &&
          pu.y + pu.height > player.y) {
        
        if (pu.type === PowerUpType.TRIPLE_SHOT) {
          player.tripleShotTimer = POWERUP_CONFIG[PowerUpType.TRIPLE_SHOT].duration;
        } else if (pu.type === PowerUpType.SHIELD) {
          player.shieldActive = true;
        }
        
        if (player.shieldActive && player.tripleShotTimer > 0) {
          unlockAchievement('power_hungry');
        }
        
        playSound('powerup');
        powerUpsRef.current.splice(index, 1);
      }
      if (pu.y > GAME_HEIGHT) powerUpsRef.current.splice(index, 1);
    });

    // Particles
    particlesRef.current.forEach((p, index) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.friction) {
        p.vx *= p.friction;
        p.vy *= p.friction;
      }
      p.life -= delta / 1000;
      if (p.life <= 0) particlesRef.current.splice(index, 1);
    });

    // Level progression
    const nextLevelThreshold = level * 2000;
    if (score >= nextLevelThreshold) {
      setLevel(l => {
        const next = l + 1;
        if (next === 5) unlockAchievement('survivor');
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 2000);
        enemiesRef.current = []; // Clear screen on level up
        return next;
      });
    }

    // Spawning
    const diffSettings = DIFFICULTY_CONFIG[difficulty];
    if (Math.random() < diffSettings.spawnRate + (level * 0.005)) {
      spawnEnemy();
    }

  }, [gameState, level, score, spawnEnemy, spawnPowerUp, unlockAchievement, difficulty]);

  const shoot = useCallback(() => {
    if (gameState !== GameState.PLAYING) return;
    const player = playerRef.current;
    
    if (player.tripleShotTimer > 0) {
      // Center
      bulletsRef.current.push({
        x: player.x + player.width / 2 - BULLET_WIDTH / 2,
        y: player.y,
        width: BULLET_WIDTH,
        height: BULLET_HEIGHT,
        speed: BULLET_SPEED,
        damage: 1,
        isPlayerBullet: true,
      });
      // Left
      bulletsRef.current.push({
        x: player.x,
        y: player.y,
        width: BULLET_WIDTH,
        height: BULLET_HEIGHT,
        speed: BULLET_SPEED,
        damage: 1,
        isPlayerBullet: true,
        angle: -Math.PI / 2 - 0.2,
      });
      // Right
      bulletsRef.current.push({
        x: player.x + player.width,
        y: player.y,
        width: BULLET_WIDTH,
        height: BULLET_HEIGHT,
        speed: BULLET_SPEED,
        damage: 1,
        isPlayerBullet: true,
        angle: -Math.PI / 2 + 0.2,
      });
    } else {
      bulletsRef.current.push({
        x: player.x + player.width / 2 - BULLET_WIDTH / 2,
        y: player.y,
        width: BULLET_WIDTH,
        height: BULLET_HEIGHT,
        speed: BULLET_SPEED,
        damage: 1,
        isPlayerBullet: true,
      });
    }
    playSound('shoot');
  }, [gameState, playSound]);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.save();
    if (screenShake > 0) {
      const dx = (Math.random() - 0.5) * screenShake;
      const dy = (Math.random() - 0.5) * screenShake;
      ctx.translate(dx, dy);
    }

    // Draw Nebulae
    nebulaeRef.current.forEach(nebula => {
      const gradient = ctx.createRadialGradient(nebula.x, nebula.y, 0, nebula.x, nebula.y, nebula.size);
      gradient.addColorStop(0, nebula.color);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(nebula.x, nebula.y, nebula.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Stars
    starsRef.current.forEach(star => {
      ctx.fillStyle = star.layer === 2 ? '#ffffff' : (star.layer === 1 ? '#cbd5e1' : '#64748b');
      ctx.globalAlpha = star.layer === 0 ? 0.3 : (star.layer === 1 ? 0.6 : 1);
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Draw Particles
    particlesRef.current.forEach(p => {
      ctx.globalAlpha = (p.alpha !== undefined ? p.alpha : 1) * (p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Draw Player
    const player = playerRef.current;
    if (!player.invincible || Math.floor(Date.now() / 100) % 2 === 0) {
      // Glow
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#3b82f6';
      
      const playerImg = imagesRef.current['player'];
      if (playerImg) {
        ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
      } else {
        // Fallback: Ship Body
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(player.x + player.width / 2, player.y);
        ctx.lineTo(player.x + player.width, player.y + player.height);
        ctx.lineTo(player.x + player.width / 2, player.y + player.height * 0.8);
        ctx.lineTo(player.x, player.y + player.height);
        ctx.closePath();
        ctx.fill();

        // Cockpit
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y + player.height * 0.4, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Shield
      if (player.shieldActive) {
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width * 0.8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#8b5cf6';
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      
      ctx.shadowBlur = 0;
    }

    // Draw Bullets
    ctx.fillStyle = '#facc15';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#facc15';
    bulletsRef.current.forEach(bullet => {
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
    ctx.shadowBlur = 0;

    // Draw Enemies
    enemiesRef.current.forEach(enemy => {
      const color = ENEMY_CONFIG[enemy.type].color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
      
      const enemyImg = imagesRef.current[enemy.type];
      if (enemyImg) {
        ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.width, enemy.height);
      } else {
        // Fallback
        ctx.fillStyle = color;
        if (enemy.type === EnemyType.BASIC) {
          ctx.beginPath();
          ctx.moveTo(enemy.x, enemy.y);
          ctx.lineTo(enemy.x + enemy.width, enemy.y);
          ctx.lineTo(enemy.x + enemy.width / 2, enemy.y + enemy.height);
          ctx.closePath();
          ctx.fill();
        } else if (enemy.type === EnemyType.FAST) {
          ctx.beginPath();
          ctx.moveTo(enemy.x + enemy.width / 2, enemy.y);
          ctx.lineTo(enemy.x + enemy.width, enemy.y + enemy.height);
          ctx.lineTo(enemy.x, enemy.y + enemy.height);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(enemy.x + 5, enemy.y + 5, enemy.width - 10, 5);
        }
      }
      ctx.shadowBlur = 0;
    });

    // Draw PowerUps
    powerUpsRef.current.forEach(pu => {
      const color = POWERUP_CONFIG[pu.type].color;
      ctx.shadowBlur = 15;
      ctx.shadowColor = color;
      
      const puImg = imagesRef.current[pu.type];
      if (puImg) {
        ctx.drawImage(puImg, pu.x, pu.y, pu.width, pu.height);
      } else {
        // Fallback
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(pu.x + pu.width / 2, pu.y + pu.height / 2, pu.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(pu.type === PowerUpType.TRIPLE_SHOT ? '3' : 'S', pu.x + pu.width / 2, pu.y + pu.height / 2 + 4);
      }
      ctx.shadowBlur = 0;
    });

    ctx.restore();
  }, [screenShake]);

  const loop = useCallback((time: number) => {
    const delta = 16.67; // Approx 60fps
    update(delta);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) draw(ctx);
    }
    requestRef.current = requestAnimationFrame(loop);
  }, [update, draw]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [loop]);

  // Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      if (e.key === ' ') shoot();
      if (e.key === 'p' || e.key === 'P') {
        setGameState(prev => prev === GameState.PLAYING ? GameState.PAUSED : (prev === GameState.PAUSED ? GameState.PLAYING : prev));
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [shoot]);

  const handleTouch = (e: React.TouchEvent | React.MouseEvent) => {
    if (gameState !== GameState.PLAYING) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const x = (clientX - rect.left) * (GAME_WIDTH / rect.width);
    const y = (clientY - rect.top) * (GAME_HEIGHT / rect.height);
    
    touchRef.current = { x, y };
    if ('touches' in e) shoot();
  };

  const endTouch = () => {
    touchRef.current = null;
  };

  return {
    canvasRef,
    gameState,
    setGameState,
    score,
    level,
    health,
    achievements,
    lastAchievement,
    showLevelUp,
    resetGame,
    handleTouch,
    endTouch,
    tripleShotTimer: playerRef.current.tripleShotTimer,
    shieldActive: playerRef.current.shieldActive,
    isMusicMuted,
    toggleMusic,
    difficulty,
  };
};
