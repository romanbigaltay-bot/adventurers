import React from 'react';
import { Trophy, RotateCcw, Settings, Skull, Zap, Swords } from 'lucide-react';
import { TEAMS_DATA } from '../game/constants';
import { MatchStats } from '../game/types';

interface MatchOverModalProps {
  stats: MatchStats | null;
  onRematch: () => void;
  onNewSetup: () => void;
}

export const MatchOverModal: React.FC<MatchOverModalProps> = ({
  stats,
  onRematch,
  onNewSetup
}) => {
  if (!stats) return null;

  const winner = stats.winnerTeam !== null ? TEAMS_DATA[stats.winnerTeam] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5 text-center">
        {/* Victory Icon / Banner */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10 mb-1">
            <Trophy className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold font-fantasy text-amber-200">
            {winner ? `Победа фракции ${winner.name}!` : 'Ничья на поле брани!'}
          </h2>
          <p className="text-xs text-slate-400">
            Все вражеские отряды были полностью сокрушены в жестокой битве
          </p>
        </div>

        {/* Quick Highlights Strip */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-left">
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Раундов</div>
            <div className="text-sm font-mono font-bold text-slate-200 mt-0.5">
              {stats.roundsPlayed}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Общий урон</div>
            <div className="text-sm font-mono font-bold text-rose-400 mt-0.5">
              {stats.totalDamage}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Время боя</div>
            <div className="text-sm font-mono font-bold text-cyan-300 mt-0.5">
              {Math.floor(stats.matchDurationSeconds / 60)}м {stats.matchDurationSeconds % 60}с
            </div>
          </div>
        </div>

        {/* MVP Card */}
        {stats.mvpDamage > 0 && (
          <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-between text-left">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">👑</span>
              <div>
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Герой матча (MVP)
                </div>
                <div className="text-xs font-semibold text-slate-100">
                  {stats.mvpUnitName}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono font-bold text-amber-300">
                {stats.mvpDamage} урона
              </div>
              <div className="text-[10px] text-slate-400">
                {stats.mvpKills} добиваний
              </div>
            </div>
          </div>
        )}

        {/* Teams Leaderboard */}
        <div className="flex flex-col gap-1.5 text-left">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
            Итоги фракций
          </div>
          {stats.teamStats.map((ts) => (
            <div
              key={ts.teamId}
              className="px-3 py-2 rounded-lg bg-slate-950/40 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: TEAMS_DATA[ts.teamId]?.color }}
                />
                <span className="font-semibold text-slate-200">{ts.teamName}</span>
              </div>
              <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
                <span>Выжило: <b className="text-slate-200">{ts.aliveUnits}</b></span>
                <span>Урон: <b className="text-rose-400">{ts.damageDealt}</b></span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onRematch}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-lg shadow-amber-400/20 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Сыграть снова</span>
          </button>

          <button
            onClick={onNewSetup}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Настройки</span>
          </button>
        </div>
      </div>
    </div>
  );
};
