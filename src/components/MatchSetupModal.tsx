import React, { useState } from 'react';
import { Swords, Bot, Users, Mountain, Shield, Zap, Wind, Clock, Heart, Check, Play } from 'lucide-react';
import { BIOMES, HERO_CLASSES, TEAMS_DATA } from '../game/constants';
import { BiomeId, HeroClassId, MatchSettings } from '../game/types';

interface MatchSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartMatch: (settings: MatchSettings) => void;
  initialSettings: MatchSettings;
}

export const MatchSetupModal: React.FC<MatchSetupModalProps> = ({
  isOpen,
  onClose,
  onStartMatch,
  initialSettings
}) => {
  const [playerCount, setPlayerCount] = useState<number>(initialSettings.playerCount);
  const [vsAI, setVsAI] = useState<boolean>(initialSettings.vsAI);
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'normal' | 'hard'>(initialSettings.aiDifficulty);
  const [unitsPerTeam, setUnitsPerTeam] = useState<number>(initialSettings.unitsPerTeam);
  const [turnTimeLimit, setTurnTimeLimit] = useState<number>(initialSettings.turnTimeLimit);
  const [biomeId, setBiomeId] = useState<BiomeId>(initialSettings.biomeId);
  const [windIntensity, setWindIntensity] = useState<'none' | 'low' | 'normal' | 'high'>(initialSettings.windIntensity);
  const [startHp, setStartHp] = useState<number>(initialSettings.startHp);

  // Team classes customizer
  const [teamClasses, setTeamClasses] = useState<Record<number, HeroClassId[]>>({
    0: ['mage', 'ranger', 'warrior', 'paladin'],
    1: ['warrior', 'ranger', 'mage', 'alchemist'],
    2: ['paladin', 'alchemist', 'mage', 'warrior'],
    3: ['alchemist', 'warrior', 'paladin', 'ranger']
  });

  if (!isOpen) return null;

  const handleStart = () => {
    onStartMatch({
      playerCount,
      vsAI,
      aiDifficulty,
      unitsPerTeam,
      turnTimeLimit,
      biomeId,
      windIntensity,
      startHp,
      teamClasses
    });
    onClose();
  };

  const setClassForSlot = (teamIndex: number, slotIndex: number, classId: HeroClassId) => {
    setTeamClasses((prev) => {
      const copy = { ...prev };
      const current = [...(copy[teamIndex] || ['mage', 'ranger', 'warrior', 'paladin'])];
      current[slotIndex] = classId;
      copy[teamIndex] = current;
      return copy;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl flex flex-col gap-6 my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Swords className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold font-fantasy text-amber-200">
              Настройка локальной битвы
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Играйте на одном компьютере (Hotseat) вдвоем, втроем, вчетвером или тренируйтесь против ИИ
          </p>
        </div>

        {/* 1. Game Mode Selector */}
        <div>
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2.5">
            Режим сражения
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={() => {
                setPlayerCount(2);
                setVsAI(false);
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                !vsAI && playerCount === 2
                  ? 'border-amber-400/80 bg-amber-400/15 text-white ring-1 ring-amber-400/30'
                  : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
              }`}
            >
              <Users className="w-5 h-5 text-blue-400 mb-2" />
              <div className="font-semibold text-xs text-slate-200">1 на 1 (Дуэль)</div>
              <div className="text-[10px] text-slate-400 mt-0.5">2 игрока за 1 ПК</div>
            </button>

            <button
              onClick={() => {
                setPlayerCount(2);
                setVsAI(true);
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                vsAI && playerCount === 2
                  ? 'border-amber-400/80 bg-amber-400/15 text-white ring-1 ring-amber-400/30'
                  : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
              }`}
            >
              <Bot className="w-5 h-5 text-emerald-400 mb-2" />
              <div className="font-semibold text-xs text-slate-200">Против ИИ</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Тренировка с ботом</div>
            </button>

            <button
              onClick={() => {
                setPlayerCount(3);
                setVsAI(false);
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                !vsAI && playerCount === 3
                  ? 'border-amber-400/80 bg-amber-400/15 text-white ring-1 ring-amber-400/30'
                  : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
              }`}
            >
              <Swords className="w-5 h-5 text-amber-400 mb-2" />
              <div className="font-semibold text-xs text-slate-200">3 Королевства</div>
              <div className="text-[10px] text-slate-400 mt-0.5">FFA каждый сам за себя</div>
            </button>

            <button
              onClick={() => {
                setPlayerCount(4);
                setVsAI(false);
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                !vsAI && playerCount === 4
                  ? 'border-amber-400/80 bg-amber-400/15 text-white ring-1 ring-amber-400/30'
                  : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
              }`}
            >
              <Shield className="w-5 h-5 text-rose-400 mb-2" />
              <div className="font-semibold text-xs text-slate-200">4 Фракции</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Королевская битва</div>
            </button>
          </div>
        </div>

        {/* 2. Biome Selector */}
        <div>
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2.5">
            Арена и Биом
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {Object.values(BIOMES).map((b) => {
              const isSelected = biomeId === b.id;
              return (
                <div
                  key={b.id}
                  onClick={() => setBiomeId(b.id)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-amber-400/80 bg-amber-400/15 ring-1 ring-amber-400/30'
                      : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <span
                      className="w-3 h-3 rounded-full border border-black/40"
                      style={{ backgroundColor: b.grassTop }}
                    />
                    <div className="font-semibold text-xs text-slate-200">{b.name}</div>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                    {b.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Match Parameters (Squad size, Timer, Wind, HP) */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
          {/* Units per team */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              Воинов в отряде
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => setUnitsPerTeam(cnt)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                    unitsPerTeam === cnt
                      ? 'bg-amber-400 text-slate-900'
                      : 'bg-slate-800/60 text-slate-400 hover:text-white'
                  }`}
                >
                  {cnt}
                </button>
              ))}
            </div>
          </div>

          {/* Turn timer */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Таймер хода
            </label>
            <select
              value={turnTimeLimit}
              onChange={(e) => setTurnTimeLimit(Number(e.target.value))}
              className="w-full bg-slate-800/80 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium cursor-pointer"
            >
              <option value={15}>15 секунд (Блиц)</option>
              <option value={30}>30 секунд (Стандарт)</option>
              <option value={45}>45 секунд (Спокойно)</option>
              <option value={60}>60 секунд (Тактика)</option>
              <option value={0}>Без таймера</option>
            </select>
          </div>

          {/* Wind intensity */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              Ветер
            </label>
            <select
              value={windIntensity}
              onChange={(e) => setWindIntensity(e.target.value as 'none' | 'low' | 'normal' | 'high')}
              className="w-full bg-slate-800/80 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium cursor-pointer"
            >
              <option value="none">Без ветра</option>
              <option value="low">Слабый бриз</option>
              <option value="normal">Нормальный</option>
              <option value="high">Сильные порывы</option>
            </select>
          </div>

          {/* Start HP */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              Здоровье
            </label>
            <div className="flex items-center gap-1">
              {[80, 100, 130].map((hp) => (
                <button
                  key={hp}
                  onClick={() => setStartHp(hp)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                    startHp === hp
                      ? 'bg-amber-400 text-slate-900'
                      : 'bg-slate-800/60 text-slate-400 hover:text-white'
                  }`}
                >
                  {hp}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. AI difficulty if Bot mode */}
        {vsAI && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Bot className="w-4 h-4 text-emerald-400" />
              Сложность ИИ противника:
            </span>
            <div className="flex items-center gap-1.5">
              {(['easy', 'normal', 'hard'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setAiDifficulty(lvl)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    aiDifficulty === lvl
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lvl === 'easy' ? 'Новичок' : lvl === 'normal' ? 'Ветеран' : 'Снайпер'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 5. Squad Customizer */}
        <div>
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2.5">
            Составы отрядов воинов
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TEAMS_DATA.slice(0, playerCount).map((team) => (
              <div
                key={team.id}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col gap-2"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: team.color }}
                  />
                  <span>{team.name}</span>
                  {vsAI && team.id === 1 && (
                    <span className="text-[10px] text-slate-400">[Управляет ИИ]</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {Array.from({ length: unitsPerTeam }).map((_, slotIdx) => {
                    const currentClass = teamClasses[team.id]?.[slotIdx] || 'warrior';
                    return (
                      <select
                        key={slotIdx}
                        value={currentClass}
                        onChange={(e) =>
                          setClassForSlot(team.id, slotIdx, e.target.value as HeroClassId)
                        }
                        className="flex-1 bg-slate-800/90 border border-slate-700/80 text-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium cursor-pointer"
                      >
                        {Object.values(HERO_CLASSES).map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.icon} {c.name}
                          </option>
                        ))}
                      </select>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-slate-800 pt-4 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Отмена
          </button>

          <button
            onClick={handleStart}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-lg shadow-amber-400/20 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>В бой! Начать сражение</span>
          </button>
        </div>
      </div>
    </div>
  );
};
