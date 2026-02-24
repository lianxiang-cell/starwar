/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Heart, 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Shield, 
  Info, 
  Keyboard,
  MousePointer2,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useGame } from './hooks/useGame';
import { GameState, Difficulty } from './types';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_MAX_HEALTH, DIFFICULTY_CONFIG } from './constants';

export default function App() {
  const {
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
    tripleShotTimer,
    shieldActive,
    isMusicMuted,
    toggleMusic,
    difficulty,
  } = useGame();

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30 overflow-hidden flex flex-col md:flex-row items-center justify-center p-4 gap-8">
      
      {/* Sidebar - Desktop only */}
      <aside className="hidden lg:flex flex-col gap-6 w-64 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-blue-400">
            <Keyboard size={20} /> 操作指南
          </h2>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex justify-between"><span>移动</span> <span className="text-white">方向键 / WASD</span></li>
            <li className="flex justify-between"><span>射击</span> <span className="text-white">空格键</span></li>
            <li className="flex justify-between"><span>暂停</span> <span className="text-white">P 键</span></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-emerald-400">
            <Zap size={20} /> 道具说明
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">3</div>
              <div className="text-xs">
                <p className="font-semibold">三向子弹</p>
                <p className="text-gray-500">增强火力，持续10秒</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold">S</div>
              <div className="text-xs">
                <p className="font-semibold">能量护盾</p>
                <p className="text-gray-500">抵挡一次致命伤害</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-yellow-400">
            <Volume2 size={20} /> 音乐设置
          </h2>
          <button 
            onClick={toggleMusic}
            className="w-full py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-sm"
          >
            {isMusicMuted ? <><VolumeX size={16} /> 开启音乐</> : <><Volume2 size={16} /> 关闭音乐</>}
          </button>
        </div>

        <div className="mt-auto pt-6 border-t border-white/10">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest text-center">XHY Interstellar Vanguard v1.0</p>
        </div>
      </aside>

      {/* Main Game Area */}
      <main className="relative group">
        <div 
          className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/20 border border-white/10 bg-black"
          style={{ width: 'min(90vw, 450px)', aspectRatio: `${GAME_WIDTH}/${GAME_HEIGHT}` }}
        >
          <canvas
            ref={canvasRef}
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
            className="w-full h-full cursor-crosshair"
            onMouseMove={handleTouch}
            onMouseDown={handleTouch}
            onMouseUp={endTouch}
            onTouchMove={handleTouch}
            onTouchStart={handleTouch}
            onTouchEnd={endTouch}
          />

          {/* HUD */}
          <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start pointer-events-none">
            <div className="space-y-1">
              <div className="flex gap-1">
                {Array.from({ length: PLAYER_MAX_HEALTH }).map((_, i) => (
                  <Heart 
                    key={i} 
                    size={18} 
                    className={i < health ? "text-red-500 fill-red-500" : "text-gray-700"} 
                  />
                ))}
              </div>
              <div className="text-2xl font-black tracking-tighter text-white drop-shadow-lg">
                {score.toLocaleString()}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-widest text-blue-400 font-bold">Level</div>
              <div className="text-2xl font-black text-white">{level}</div>
            </div>
          </div>

          {/* Active Powerups HUD */}
          <div className="absolute bottom-4 left-4 flex gap-2 pointer-events-none">
            {shieldActive && (
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/50 backdrop-blur-md flex items-center justify-center text-violet-400"
              >
                <Shield size={20} />
              </motion.div>
            )}
            {tripleShotTimer > 0 && (
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/50 backdrop-blur-md flex items-center justify-center text-emerald-400"
              >
                <Zap size={20} />
              </motion.div>
            )}
          </div>

          {/* Overlays */}
          <AnimatePresence>
            {gameState === GameState.START && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center"
              >
                <motion.h1 
                  initial={{ y: -20 }} animate={{ y: 0 }}
                  className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-b from-white to-blue-500 bg-clip-text text-transparent italic"
                >
                  XHY星际先锋
                </motion.h1>
                <p className="text-gray-400 text-sm mb-8 max-w-xs">
                  在这场史诗般的太空战役中，驾驶你的战机，击败无尽的敌军。
                </p>
                <button 
                  onClick={() => setGameState(GameState.DIFFICULTY_SELECT)}
                  className="group relative px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-500 transition-all active:scale-95 font-bold flex items-center gap-2 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <Play size={20} /> 开始游戏
                </button>
                
                <div className="mt-12 grid grid-cols-2 gap-4 lg:hidden">
                   <div className="flex items-center gap-2 text-[10px] text-gray-500">
                     <MousePointer2 size={12} /> 触摸/鼠标移动
                   </div>
                   <div className="flex items-center gap-2 text-[10px] text-gray-500">
                     <Zap size={12} /> 自动射击
                   </div>
                </div>
              </motion.div>
            )}

            {gameState === GameState.DIFFICULTY_SELECT && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
              >
                <h2 className="text-3xl font-black mb-6 text-white italic">选择难度</h2>
                <div className="flex flex-col gap-4 w-full max-w-[280px]">
                  {Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => (
                    <button 
                      key={key}
                      onClick={() => resetGame(key as Difficulty)}
                      className="group p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/50 transition-all text-left"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-lg group-hover:text-blue-400 transition-colors">{config.label}</span>
                        <div className="flex gap-1">
                          {key === Difficulty.EASY && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                          {key === Difficulty.NORMAL && <><div className="w-2 h-2 rounded-full bg-yellow-500" /><div className="w-2 h-2 rounded-full bg-yellow-500" /></>}
                          {key === Difficulty.HARD && <><div className="w-2 h-2 rounded-full bg-red-500" /><div className="w-2 h-2 rounded-full bg-red-500" /><div className="w-2 h-2 rounded-full bg-red-500" /></>}
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-tight">{config.description}</p>
                    </button>
                  ))}
                  <button 
                    onClick={() => setGameState(GameState.START)}
                    className="mt-2 text-xs text-gray-500 hover:text-white transition-colors"
                  >
                    返回主菜单
                  </button>
                </div>
              </motion.div>
            )}

            {gameState === GameState.PAUSED && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-8"
              >
                <h2 className="text-4xl font-black mb-8 text-white italic">游戏暂停</h2>
                <div className="flex flex-col gap-4 w-full max-w-[200px]">
                  <button 
                    onClick={() => setGameState(GameState.PLAYING)}
                    className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all font-bold flex items-center justify-center gap-2"
                  >
                    <Play size={20} /> 继续
                  </button>
                  <button 
                    onClick={() => setGameState(GameState.START)}
                    className="w-full py-3 rounded-2xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 transition-all font-bold flex items-center justify-center gap-2"
                  >
                    退出
                  </button>
                </div>
              </motion.div>
            )}

            {gameState === GameState.GAME_OVER && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-500 mb-6">
                  <Zap size={40} />
                </div>
                <h2 className="text-4xl font-black mb-2 text-white italic">任务失败</h2>
                <p className="text-gray-500 mb-8">你在第 {level} 关英勇牺牲</p>
                
                <div className="w-full max-w-[240px] bg-white/5 rounded-3xl p-6 border border-white/10 mb-8">
                  <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">最终得分</div>
                  <div className="text-3xl font-black text-blue-400">{score.toLocaleString()}</div>
                </div>

                <button 
                  onClick={() => resetGame(difficulty)}
                  className="px-8 py-3 rounded-full bg-white text-black hover:bg-gray-200 transition-all active:scale-95 font-bold flex items-center gap-2"
                >
                  <RotateCcw size={20} /> 重新开始
                </button>
              </motion.div>
            )}

            {showLevelUp && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className="px-8 py-4 rounded-3xl bg-blue-600/20 border border-blue-500/50 backdrop-blur-xl text-center">
                  <p className="text-blue-400 text-xs font-bold uppercase tracking-[0.3em] mb-1">Level Up</p>
                  <h3 className="text-4xl font-black italic">关卡 {level}</h3>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Achievement Notification */}
          <AnimatePresence>
            {lastAchievement && (
              <motion.div 
                initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }}
                className="absolute top-20 right-4 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 backdrop-blur-xl flex items-center gap-4 max-w-[240px] shadow-lg shadow-emerald-500/20"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white flex-shrink-0">
                  <Trophy size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">成就解锁</p>
                  <p className="text-sm font-bold text-white leading-tight">{lastAchievement.title}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Achievements Sidebar - Desktop only */}
      <aside className="hidden xl:flex flex-col gap-6 w-64 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
        <h2 className="text-xl font-bold flex items-center gap-2 text-yellow-400">
          <Trophy size={20} /> 成就系统
        </h2>
        <div className="space-y-4">
          {achievements.map(achievement => (
            <div 
              key={achievement.id} 
              className={`p-3 rounded-2xl border transition-all ${
                achievement.unlocked 
                  ? 'bg-emerald-500/10 border-emerald-500/30' 
                  : 'bg-white/5 border-white/10 opacity-40'
              }`}
            >
              <p className={`text-sm font-bold ${achievement.unlocked ? 'text-emerald-400' : 'text-gray-400'}`}>
                {achievement.title}
              </p>
              <p className="text-[10px] text-gray-500">{achievement.description}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* Mobile Info Button */}
      <div className="lg:hidden fixed bottom-6 right-6">
        <button className="w-12 h-12 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl flex items-center justify-center text-white">
          <Info size={24} />
        </button>
      </div>
    </div>
  );
}
