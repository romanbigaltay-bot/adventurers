import React, { useEffect, useState } from 'react';
import { Team, Unit } from '../game/types';

interface TurnTransitionBannerProps {
  currentUnit: Unit | undefined;
  currentTeam: Team | undefined;
}

export const TurnTransitionBanner: React.FC<TurnTransitionBannerProps> = ({
  currentUnit,
  currentTeam
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!currentUnit || !currentTeam) return;

    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, [currentUnit?.id]);

  if (!visible || !currentUnit || !currentTeam) return null;

  return (
    <div className="fixed inset-x-0 top-20 z-40 flex justify-center pointer-events-none select-none animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-950/90 border border-slate-700/80 backdrop-blur-xl shadow-2xl shadow-black/80">
        <span className="text-2xl">{currentUnit.icon}</span>
        <div>
          <div className="text-[11px] font-bold tracking-widest uppercase text-amber-400">
            {currentTeam.isAI ? 'Ход Противника' : `Ход Игрока ${currentTeam.id + 1}`}
          </div>
          <div className="text-base font-bold text-white flex items-center gap-2">
            <span>{currentUnit.name}</span>
            <span className="text-slate-500">·</span>
            <span style={{ color: currentTeam.color }}>{currentTeam.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
