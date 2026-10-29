import React from 'react';
import { X, Sparkles, Target, Zap, ShieldAlert } from 'lucide-react';
import { WEAPONS } from '../game/constants';
import { Unit, WeaponId } from '../game/types';

interface WeaponSelectorProps {
  unit: Unit | undefined;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (weaponId: WeaponId) => void;
}

export const WeaponSelector: React.FC<WeaponSelectorProps> = ({
  unit,
  isOpen,
  onClose,
  onSelect
}) => {
  if (!isOpen || !unit) return null;

  const weaponList = Object.values(WEAPONS);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold font-fantasy text-amber-200 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Арсенал и Магия
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Выберите оружие для текущего хода воина {unit.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Weapon Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {weaponList.map((w) => {
            const isSelected = unit.selectedWeapon === w.id;
            const ammo = unit.ammo[w.id];
            const hasAmmo = ammo === -1 || ammo > 0;

            return (
              <div
                key={w.id}
                onClick={() => {
                  if (hasAmmo) {
                    onSelect(w.id);
                    onClose();
                  }
                }}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-400/80 bg-amber-400/10 shadow-md ring-1 ring-amber-400/30'
                    : !hasAmmo
                    ? 'opacity-40 border-slate-800 bg-slate-950/40 cursor-not-allowed'
                    : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800/80 hover:border-slate-700 cursor-pointer'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{w.icon}</span>
                      <div>
                        <div className="font-semibold text-sm text-slate-100">{w.name}</div>
                        <div className="text-[10px] text-slate-400">{w.category}</div>
                      </div>
                    </div>

                    <div className="font-mono text-xs font-bold text-amber-300 tabular-nums">
                      {ammo === -1 ? 'Бесконечно' : `Заряд: ${ammo}`}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {w.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-300">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-rose-400" />
                      {w.damage > 0 ? `${w.damage} ур.` : 'Утилити'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-amber-400" />
                      {w.radius}м
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      isSelected
                        ? 'bg-amber-400 text-slate-900 font-semibold'
                        : hasAmmo
                        ? 'text-slate-300'
                        : 'text-slate-500'
                    }`}
                  >
                    {isSelected ? 'Выбрано' : hasAmmo ? 'Выбрать' : 'Пусто'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-3 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
