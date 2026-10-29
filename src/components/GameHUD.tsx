import React from 'react';
import { ArrowLeft, ArrowRight, Shield, Crosshair, Sparkles, Flame, Clock } from 'lucide-react';
import { TEAMS_DATA, WEAPONS } from '../game/constants';
import { GameState, Team, Unit, WeaponId } from '../game/types';

interface GameHUDProps {
  units: Unit[];
  currentUnit: Unit | undefined;
  currentTeam: Team | undefined;
  teams: Team[];
  wind: number;
  timeLeft: number;
  aimPower: number;
  aimAngle: number;
  gameState: GameState;
  onSelectWeapon: (id: WeaponId) => void;
  onOpenArsenal: () => void;
  onFire: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  units,
  currentUnit,
  currentTeam,
  teams,
  wind,
  timeLeft,
  aimPower,
  aimAngle,
  gameState,
  onSelectWeapon,
  onOpenArsenal,
  onFire
}) => {
  if (gameState === 'menu' || gameState === 'setup') return null;

  const isCurrentAI = currentTeam?.isAI || false;
  const isAimingOrCharging = gameState === 'aim' || gameState === 'charging';

  // Group units by team
  const teamsMap = teams.map((team) => {
    const teamUnits = units.filter((u) => u.team === team.id);
    const aliveUnits = teamUnits.filter((u) => u.alive);
    const totalHp = teamUnits.reduce((acc, u) => acc + (u.alive ? u.hp : 0), 0);
    const maxHp = teamUnits.reduce((acc, u) => acc + u.maxHp, 0);
    return {
      team,
      units: teamUnits,
      aliveCount: aliveUnits.length,
      totalHp,
      maxHp,
      ratio: maxHp > 0 ? totalHp / maxHp : 0
    };
  });

  const windAbs = Math.abs(wind);
  const windDir = wind < -0.02 ? 'left' : wind > 0.02 ? 'right' : 'calm';
  const windPercent = Math.round(windAbs * 100);

  // Quick weapon list (popular core weapons)
  const quickWeapons: WeaponId[] = [
    'fireball',
    'sniper_arrow',
    'war_axe',
    'cluster_volley',
    'holy_grenade',
    'blink_portal'
  ];

  const currentWeaponDef = currentUnit ? WEAPONS[currentUnit.selectedWeapon] : null;

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-4 z-10">
      {/* Top Section: Team cards & Wind & Timer */}
      <div className="flex items-start justify-between gap-4">
        {/* Left Teams (Teams 0 & 2) */}
        <div className="flex flex-col gap-2 min-w-[220px]">
          {teamsMap.slice(0, Math.ceil(teamsMap.length / 2)).map(({ team, units: tUnits, totalHp, maxHp, ratio }) => (
            <div
              key={team.id}
              className={`p-2.5 rounded-xl border backdrop-blur-md transition-all ${
                currentTeam?.id === team.id
                  ? 'bg-slate-900/85 border-amber-400/50 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-950/60 border-slate-800/80'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: team.color }}
                  />
                  {team.name}
                  {team.isAI && <span className="text-[10px] text-slate-400 font-normal">[ИИ]</span>}
                </span>
                <span className="font-mono text-slate-300 font-medium tabular-nums">
                  {totalHp}/{maxHp} HP
                </span>
              </div>

              {/* Team total HP bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.round(ratio * 100)}%`,
                    backgroundColor: team.color
                  }}
                />
              </div>

              {/* Units mini icons */}
              <div className="flex items-center gap-1.5">
                {tUnits.map((u) => {
                  const isCurrent = u.id === currentUnit?.id;
                  return (
                    <div
                      key={u.id}
                      title={`${u.name} (${u.hp}/${u.maxHp} HP)`}
                      className={`relative flex items-center justify-center w-7 h-7 rounded-lg border text-sm transition-transform ${
                        !u.alive
                          ? 'opacity-30 border-slate-800 bg-slate-900/50 grayscale'
                          : isCurrent
                          ? 'border-amber-400 bg-amber-400/15 scale-110 shadow-sm'
                          : 'border-slate-700/60 bg-slate-800/40'
                      }`}
                    >
                      <span>{u.icon}</span>
                      {u.alive && (
                        <div
                          className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-lg"
                          style={{
                            width: `${Math.round((u.hp / u.maxHp) * 100)}%`,
                            backgroundColor: u.hp > u.maxHp * 0.5 ? '#22c55e' : '#ef4444'
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Center: Wind & Timer Gauge */}
        <div className="flex flex-col items-center gap-2">
          {/* Wind Gauge */}
          <div className="px-4 py-2 rounded-xl bg-slate-950/75 border border-slate-800/80 backdrop-blur-md flex items-center gap-3">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Ветер
            </span>
            <div className="flex items-center gap-1.5">
              {windDir === 'left' && <ArrowLeft className="w-4 h-4 text-cyan-400 animate-pulse" />}
              {windDir === 'right' && <ArrowRight className="w-4 h-4 text-cyan-400 animate-pulse" />}
              <span className="font-mono text-sm font-bold text-cyan-300 tabular-nums">
                {windDir === 'calm' ? 'Штиль' : `${windPercent} м/с`}
              </span>
            </div>
          </div>

          {/* Turn Timer */}
          {timeLeft > 0 && (
            <div
              className={`px-3 py-1 rounded-lg border backdrop-blur-md flex items-center gap-1.5 text-xs font-mono font-bold tabular-nums transition-colors ${
                timeLeft <= 5
                  ? 'bg-red-950/80 border-red-500/70 text-red-200 animate-pulse'
                  : 'bg-slate-950/70 border-slate-800 text-amber-300'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{timeLeft} сек</span>
            </div>
          )}
        </div>

        {/* Right Teams (Teams 1 & 3) */}
        <div className="flex flex-col gap-2 min-w-[220px] items-end">
          {teamsMap.slice(Math.ceil(teamsMap.length / 2)).map(({ team, units: tUnits, totalHp, maxHp, ratio }) => (
            <div
              key={team.id}
              className={`p-2.5 rounded-xl border backdrop-blur-md transition-all w-full ${
                currentTeam?.id === team.id
                  ? 'bg-slate-900/85 border-amber-400/50 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-950/60 border-slate-800/80'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-mono text-slate-300 font-medium tabular-nums">
                  {totalHp}/{maxHp} HP
                </span>
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  {team.name}
                  {team.isAI && <span className="text-[10px] text-slate-400 font-normal">[ИИ]</span>}
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: team.color }}
                  />
                </span>
              </div>

              {/* Team total HP bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full rounded-full transition-all duration-300 ml-auto"
                  style={{
                    width: `${Math.round(ratio * 100)}%`,
                    backgroundColor: team.color
                  }}
                />
              </div>

              {/* Units mini icons */}
              <div className="flex items-center gap-1.5 justify-end">
                {tUnits.map((u) => {
                  const isCurrent = u.id === currentUnit?.id;
                  return (
                    <div
                      key={u.id}
                      title={`${u.name} (${u.hp}/${u.maxHp} HP)`}
                      className={`relative flex items-center justify-center w-7 h-7 rounded-lg border text-sm transition-transform ${
                        !u.alive
                          ? 'opacity-30 border-slate-800 bg-slate-900/50 grayscale'
                          : isCurrent
                          ? 'border-amber-400 bg-amber-400/15 scale-110 shadow-sm'
                          : 'border-slate-700/60 bg-slate-800/40'
                      }`}
                    >
                      <span>{u.icon}</span>
                      {u.alive && (
                        <div
                          className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-lg"
                          style={{
                            width: `${Math.round((u.hp / u.maxHp) * 100)}%`,
                            backgroundColor: u.hp > u.maxHp * 0.5 ? '#22c55e' : '#ef4444'
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Center: Tactical Action Console */}
      <div className="flex flex-col items-center gap-3 w-full max-w-3xl mx-auto pointer-events-auto">
        {/* Active Hero Status Kicker */}
        {currentUnit && (
          <div className="flex items-center gap-4 px-5 py-2 rounded-xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-md shadow-xl">
            <div className="flex items-center gap-2">
              <span className="text-xl">{currentUnit.icon}</span>
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-100">
                  <span>{currentUnit.name}</span>
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: currentTeam?.color }}
                  />
                  <span className="text-slate-400 font-normal">({currentTeam?.name})</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span>{currentUnit.hp}/{currentUnit.maxHp} HP</span>
                  {currentUnit.defense > 0 && (
                    <span className="text-amber-400/80">· Защита +{Math.round(currentUnit.defense * 100)}%</span>
                  )}
                </div>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-800" />

            {/* Current weapon summary */}
            {currentWeaponDef && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-lg">{currentWeaponDef.icon}</span>
                <div>
                  <div className="font-semibold text-amber-200">
                    {currentWeaponDef.name}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Урон: {currentWeaponDef.damage} · Радиус: {currentWeaponDef.radius}m
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={onOpenArsenal}
              className="px-3 py-1.5 text-xs font-medium text-amber-300 hover:text-amber-200 border border-amber-500/30 hover:border-amber-400/60 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-colors cursor-pointer"
            >
              Все оружие
            </button>
          </div>
        )}

        {/* Quick Weapon Hotbar (Keys 1-6) */}
        {currentUnit && isAimingOrCharging && !isCurrentAI && (
          <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-950/85 border border-slate-800/80 backdrop-blur-md shadow-2xl">
            {quickWeapons.map((wid, idx) => {
              const def = WEAPONS[wid];
              const isSelected = currentUnit.selectedWeapon === wid;
              const ammo = currentUnit.ammo[wid];
              const isAvailable = ammo === -1 || ammo > 0;

              return (
                <button
                  key={wid}
                  disabled={!isAvailable}
                  onClick={() => onSelectWeapon(wid)}
                  title={`${def.name}: ${def.desc}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'border-amber-400/80 bg-amber-400/20 text-amber-200 shadow-sm'
                      : !isAvailable
                      ? 'opacity-40 border-slate-800/50 bg-slate-900/30 text-slate-500 cursor-not-allowed'
                      : 'border-slate-800/80 bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <span className="text-xs text-slate-500 font-mono font-bold mr-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-base">{def.icon}</span>
                  <span className="hidden sm:inline">{def.name}</span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {ammo === -1 ? '∞' : `x${ammo}`}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Power Charge Bar */}
        <div className="w-full max-w-md flex flex-col items-center gap-1">
          <div className="w-full flex items-center justify-between text-xs text-slate-300 px-1 font-medium">
            <span>
              {isCurrentAI
                ? '🤖 ИИ рассчитывает баллистику…'
                : 'Сила выстрела (зажмите ЛКМ или Пробел)'}
            </span>
            <span className="font-mono font-bold tabular-nums text-amber-300">
              {Math.round(aimPower)}%
            </span>
          </div>

          <div className="w-full h-3.5 bg-slate-950/90 rounded-full border border-slate-800 overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-75 bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500"
              style={{ width: `${Math.round(aimPower)}%` }}
            />
          </div>
        </div>

        {/* Status Prompt / Hint */}
        <div className="text-[11px] text-slate-400 text-center">
          {isCurrentAI ? (
            <span className="text-amber-300 font-medium">Ход ИИ · Ожидайте выстрела</span>
          ) : (
            <span>
              <b>Мышь</b> — прицеливание · <b>Зажать ЛКМ</b> — набор силы · <b>Стрелки</b> — точный угол · <b>1-6</b> — выбор оружия
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
