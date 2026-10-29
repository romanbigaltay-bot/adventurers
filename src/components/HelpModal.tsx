import React from 'react';
import { X, HelpCircle, Keyboard, Target, Sparkles, Wind, Shield } from 'lucide-react';
import { HERO_CLASSES, WEAPONS } from '../game/constants';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col gap-6 my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold font-fantasy text-amber-200">
              Руководство по игре и управление
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Hotkeys Table */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-2.5">
            <Keyboard className="w-4 h-4 text-cyan-400" />
            Управление на клавиатуре и мыши
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">Прицеливание</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono font-semibold">
                Движение Мыши / ↑ ↓
              </kbd>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">Набор силы и выстрел</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono font-semibold">
                Зажать ЛКМ / Пробел
              </kbd>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">Точная регулировка силы</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono font-semibold">
                ← → (Shift — мелкий шаг)
              </kbd>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">Быстрый выбор оружия</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono font-semibold">
                Клавиши 1, 2, 3, 4, 5, 6
              </kbd>
            </div>
          </div>
        </div>

        {/* 2. Tactical Mechanics */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-2.5">
            <Wind className="w-4 h-4 text-amber-400" />
            Тактические правила
          </h3>
          <ul className="space-y-2 text-xs text-slate-400 leading-relaxed list-disc list-inside">
            <li>
              <b className="text-slate-200">Ветер:</b> Направление и сила ветра меняются каждый ход. Учитывайте снос траектории в полете.
            </li>
            <li>
              <b className="text-slate-200">Разрушаемость:</b> Взрывы образуют воронки в земле. Выбивайте грунт из-под врагов — падение с высоты наносит сокрушительный урон!
            </li>
            <li>
              <b className="text-slate-200">Бездна:</b> Если воин падает в самую нижнюю бездну карты, он мгновенно погибает.
            </li>
            <li>
              <b className="text-slate-200">Особое оружие:</b> Священный осколок отскакивает от земли перед детонацией; Кассетный снаряд распадается на 3 в высшей точке полета; Скачок (Блинк) перемещает воина в точку падения.
            </li>
          </ul>
        </div>

        {/* 3. Hero Classes Quick Guide */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-2.5">
            <Shield className="w-4 h-4 text-emerald-400" />
            Классы героев
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {Object.values(HERO_CLASSES).map((c) => (
              <div
                key={c.id}
                className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/80 text-left"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 mb-1">
                  <span>{c.icon}</span>
                  <span>{c.name}</span>
                </div>
                <div className="text-[10px] text-slate-400 leading-normal">
                  {c.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};
