import React from 'react';
import { Volume2, VolumeX, RotateCcw, HelpCircle, Settings, Swords } from 'lucide-react';
import { sound } from '../game/audio';

interface TopBarProps {
  onOpenSetup: () => void;
  onOpenHelp: () => void;
  onRestartMatch: () => void;
  roundNumber: number;
  isMuted: boolean;
  onToggleMute: () => void;
  gameState: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenSetup,
  onOpenHelp,
  onRestartMatch,
  roundNumber,
  isMuted,
  onToggleMute,
  gameState
}) => {
  return (
    <header className="h-14 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-6 flex items-center justify-between gap-8 shrink-0 select-none z-20">
      {/* Zone 1: Single element brand wordmark */}
      <div className="flex items-center gap-3">
        <Swords className="w-5 h-5 text-amber-400" />
        <span className="font-fantasy font-bold text-lg tracking-wider text-amber-200 whitespace-nowrap">
          ГЕРОИ И ОРКИ
        </span>
        {gameState !== 'menu' && (
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
            · Раунд {roundNumber}
          </span>
        )}
      </div>

      {/* Zone 2: Navigation / Controls */}
      <nav className="flex items-center gap-5 text-xs font-medium text-slate-300">
        <button
          onClick={onOpenHelp}
          className="flex items-center gap-1.5 hover:text-amber-300 transition-colors whitespace-nowrap cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Справка и управление</span>
        </button>

        <button
          onClick={onOpenSetup}
          className="flex items-center gap-1.5 hover:text-amber-300 transition-colors whitespace-nowrap cursor-pointer"
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Настройки битвы</span>
        </button>

        {gameState !== 'menu' && (
          <button
            onClick={onRestartMatch}
            className="flex items-center gap-1.5 hover:text-amber-300 transition-colors whitespace-nowrap cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>Перезапуск карты</span>
          </button>
        )}
      </nav>

      {/* Zone 3: Audio & Primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Включить звук' : 'Выключить звук'}
          className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-slate-300" />}
        </button>

        {gameState === 'menu' ? (
          <button
            onClick={onOpenSetup}
            className="px-4 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-amber-400/20 cursor-pointer"
          >
            Начать битву
          </button>
        ) : (
          <button
            onClick={onOpenSetup}
            className="px-3.5 py-1.5 text-xs font-semibold text-amber-200 border border-amber-500/30 hover:border-amber-400/60 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            Сменить режим
          </button>
        )}
      </div>
    </header>
  );
};
