import React from 'react';
import { Swords, Bot, Users, Settings, HelpCircle, Sparkles, Play } from 'lucide-react';

interface TitleMenuProps {
  onQuickDuel: () => void;
  onQuickBot: () => void;
  onCustomSetup: () => void;
  onOpenHelp: () => void;
}

export const TitleMenu: React.FC<TitleMenuProps> = ({
  onQuickDuel,
  onQuickBot,
  onCustomSetup,
  onOpenHelp
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md select-none">
      <div className="max-w-xl w-full p-8 rounded-3xl bg-slate-900/90 border border-slate-800/80 shadow-2xl flex flex-col items-center text-center gap-6">
        {/* Title Lockup */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10 mb-3">
            <Swords className="w-8 h-8" />
          </div>

          <h1 className="font-fantasy font-black text-3xl sm:text-4xl tracking-wider text-amber-200">
            ГЕРОИ И ОРКИ
          </h1>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/80 mt-1">
            Пошаговая тактическая артиллерия
          </p>

          <p className="text-xs text-slate-400 max-w-md mt-3 leading-relaxed">
            Сразитесь с друзьями на одном компьютере или испытайте тактическое мастерство против умного ИИ.
            Управляйте баллистикой заклинаний, разрушайте скалы и сбрасывайте врагов в пропасть!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full max-w-sm">
          <button
            onClick={onQuickDuel}
            className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all shadow-lg shadow-amber-400/25 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Users className="w-4 h-4" />
            <span>Дуэль 1 на 1 (2 игрока на 1 ПК)</span>
          </button>

          <button
            onClick={onQuickBot}
            className="flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-xs text-slate-200 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
          >
            <Bot className="w-4 h-4 text-emerald-400" />
            <span>Одиночная игра против ИИ</span>
          </button>

          <button
            onClick={onCustomSetup}
            className="flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-xs text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-400/60 transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4 text-amber-400" />
            <span>Настроить матч (3-4 игрока, арены, отряды)</span>
          </button>
        </div>

        {/* Secondary link */}
        <div className="pt-2 border-t border-slate-800/80 w-full flex items-center justify-center">
          <button
            onClick={onOpenHelp}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Управление и правила игры</span>
          </button>
        </div>
      </div>
    </div>
  );
};
