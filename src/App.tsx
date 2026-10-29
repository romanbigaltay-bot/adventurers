/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { sound } from './game/audio';
import { MatchEngine } from './game/engine';
import { GameState, MatchSettings, MatchStats, Team, Unit, WeaponId } from './game/types';
import { TopBar } from './components/TopBar';
import { GameCanvas } from './components/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { TitleMenu } from './components/TitleMenu';
import { MatchSetupModal } from './components/MatchSetupModal';
import { WeaponSelector } from './components/WeaponSelector';
import { TurnTransitionBanner } from './components/TurnTransitionBanner';
import { MatchOverModal } from './components/MatchOverModal';
import { HelpModal } from './components/HelpModal';

export default function App() {
  const engineRef = useRef<MatchEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new MatchEngine();
  }
  const engine = engineRef.current;

  // React mirrors for UI state
  const [gameState, setGameState] = useState<GameState>(engine.state);
  const [currentUnit, setCurrentUnit] = useState<Unit | undefined>(engine.getCurrentUnit());
  const [currentTeam, setCurrentTeam] = useState<Team | undefined>(engine.getCurrentTeam());
  const [units, setUnits] = useState<Unit[]>(engine.units);
  const [wind, setWind] = useState<number>(engine.wind);
  const [timeLeft, setTimeLeft] = useState<number>(engine.turnTimeLeft);
  const [roundNumber, setRoundNumber] = useState<number>(engine.roundNumber);
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());
  const [matchStats, setMatchStats] = useState<MatchStats | null>(null);

  // Modals visibility
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isArsenalOpen, setIsArsenalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    engine.onStateChange = (st) => {
      setGameState(st);
      setCurrentUnit(engine.getCurrentUnit());
      setCurrentTeam(engine.getCurrentTeam());
      setRoundNumber(engine.roundNumber);
    };

    engine.onTurnChange = (unit, team) => {
      setCurrentUnit({ ...unit });
      setCurrentTeam({ ...team });
      setRoundNumber(engine.roundNumber);
    };

    engine.onUnitsUpdate = (allUnits) => {
      setUnits([...allUnits]);
      setCurrentUnit(engine.getCurrentUnit());
      setCurrentTeam(engine.getCurrentTeam());
    };

    engine.onWindUpdate = (w) => {
      setWind(w);
    };

    engine.onTimeTick = (t) => {
      setTimeLeft(t);
    };

    engine.onMatchEnd = (stats) => {
      setMatchStats(stats);
    };

    return () => {
      engine.stop();
    };
  }, [engine]);

  const handleStartMatch = (settings: MatchSettings) => {
    engine.startMatch(settings);
    setGameState(engine.state);
    setUnits([...engine.units]);
    setCurrentUnit(engine.getCurrentUnit());
    setCurrentTeam(engine.getCurrentTeam());
    setRoundNumber(engine.roundNumber);
    setMatchStats(null);
  };

  const handleQuickDuel = () => {
    handleStartMatch({
      playerCount: 2,
      vsAI: false,
      aiDifficulty: 'normal',
      unitsPerTeam: 3,
      turnTimeLimit: 30,
      biomeId: 'emerald',
      windIntensity: 'normal',
      startHp: 100,
      teamClasses: {
        0: ['mage', 'ranger', 'warrior'],
        1: ['warrior', 'ranger', 'mage']
      }
    });
  };

  const handleQuickBot = () => {
    handleStartMatch({
      playerCount: 2,
      vsAI: true,
      aiDifficulty: 'normal',
      unitsPerTeam: 3,
      turnTimeLimit: 30,
      biomeId: 'emerald',
      windIntensity: 'normal',
      startHp: 100,
      teamClasses: {
        0: ['mage', 'ranger', 'warrior'],
        1: ['warrior', 'ranger', 'mage']
      }
    });
  };

  const handleRestartMatch = () => {
    handleStartMatch(engine.settings);
  };

  const handleToggleMute = () => {
    const next = !sound.getMuted();
    sound.setMuted(next);
    setIsMuted(next);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col bg-slate-950 text-slate-100 font-sans">
      {/* Top Navigation & Status Bar */}
      <TopBar
        onOpenSetup={() => setIsSetupOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onRestartMatch={handleRestartMatch}
        roundNumber={roundNumber}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        gameState={gameState}
      />

      {/* Main Game Screen */}
      <main className="relative flex-1 w-full h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* WebGL / 2D Canvas */}
        <GameCanvas
          engine={engine}
          onOpenArsenal={() => setIsArsenalOpen(true)}
          onToggleMute={handleToggleMute}
          onOpenSetup={() => setIsSetupOpen(true)}
        />

        {/* Heads-up Display */}
        <GameHUD
          units={units}
          currentUnit={currentUnit}
          currentTeam={currentTeam}
          teams={engine.teams}
          wind={wind}
          timeLeft={timeLeft}
          aimPower={engine.aimPower}
          aimAngle={engine.aimAngle}
          gameState={gameState}
          onSelectWeapon={(wid: WeaponId) => engine.selectWeapon(wid)}
          onOpenArsenal={() => setIsArsenalOpen(true)}
          onFire={() => engine.fire()}
        />

        {/* Turn transition banner for hotseat player handover */}
        <TurnTransitionBanner currentUnit={currentUnit} currentTeam={currentTeam} />

        {/* Title / Main Menu if game hasn't started */}
        {gameState === 'menu' && (
          <TitleMenu
            onQuickDuel={handleQuickDuel}
            onQuickBot={handleQuickBot}
            onCustomSetup={() => setIsSetupOpen(true)}
            onOpenHelp={() => setIsHelpOpen(true)}
          />
        )}

        {/* Match Setup Dialog */}
        <MatchSetupModal
          isOpen={isSetupOpen}
          onClose={() => setIsSetupOpen(false)}
          onStartMatch={handleStartMatch}
          initialSettings={engine.settings}
        />

        {/* Weapon Arsenal Wheel / Selector */}
        <WeaponSelector
          unit={currentUnit}
          isOpen={isArsenalOpen}
          onClose={() => setIsArsenalOpen(false)}
          onSelect={(wid) => engine.selectWeapon(wid)}
        />

        {/* Match Over Summary */}
        {gameState === 'over' && (
          <MatchOverModal
            stats={matchStats}
            onRematch={handleRestartMatch}
            onNewSetup={() => {
              setMatchStats(null);
              setIsSetupOpen(true);
            }}
          />
        )}

        {/* Help & Guide Dialog */}
        <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      </main>
    </div>
  );
}
