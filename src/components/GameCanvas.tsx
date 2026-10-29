import React, { useEffect, useRef } from 'react';
import { MatchEngine } from '../game/engine';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../game/constants';
import { WeaponId } from '../game/types';

interface GameCanvasProps {
  engine: MatchEngine;
  onOpenArsenal: () => void;
  onToggleMute: () => void;
  onOpenSetup: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  engine,
  onOpenArsenal,
  onToggleMute,
  onOpenSetup
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    engine.initRenderer(ctx);

    let animationFrameId: number;
    let tick = 0;
    let lastTime = performance.now();
    let accumulator = 0;
    const STEP = 1 / 60;

    const loop = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(loop);

      let dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      if (dt > 0.12) dt = 0.12;

      accumulator += dt;
      let guard = 0;
      while (accumulator >= STEP && guard < 5) {
        tick++;
        engine.update(tick);
        accumulator -= STEP;
        guard++;
      }
      if (accumulator > STEP) accumulator = 0;
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [engine]);

  // Mouse & Touch aiming calculation
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const cur = engine.getCurrentUnit();
    if (!cur || !cur.alive) return;
    if (engine.state !== 'aim' && engine.state !== 'charging') return;
    const team = engine.getCurrentTeam();
    if (team?.isAI) return;

    const coords = getCanvasCoords(e);
    // Angle from unit to mouse
    const ang = Math.atan2(coords.y - (cur.y - 22), coords.x - cur.x);
    engine.setAimAngle(ang);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    engine.startCharging();
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    engine.stopChargingAndFire();
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if inside an input or select
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'KeyM') {
        onToggleMute();
        return;
      }

      if (e.code === 'KeyQ' || e.code === 'Tab') {
        e.preventDefault();
        onOpenArsenal();
        return;
      }

      if (e.code === 'Escape') {
        onOpenSetup();
        return;
      }

      // Quick weapon hotkeys 1-6
      const weaponMap: Record<string, WeaponId> = {
        Digit1: 'fireball',
        Digit2: 'sniper_arrow',
        Digit3: 'war_axe',
        Digit4: 'cluster_volley',
        Digit5: 'holy_grenade',
        Digit6: 'blink_portal'
      };

      if (weaponMap[e.code]) {
        engine.selectWeapon(weaponMap[e.code]);
        return;
      }

      if (engine.state !== 'aim' && engine.state !== 'charging') return;
      const team = engine.getCurrentTeam();
      if (team?.isAI) return;

      const step = e.shiftKey ? 0.005 : 0.025;

      switch (e.code) {
        case 'ArrowUp':
          e.preventDefault();
          engine.setAimAngle(engine.aimAngle - step);
          break;
        case 'ArrowDown':
          e.preventDefault();
          engine.setAimAngle(engine.aimAngle + step);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          engine.aimPower = Math.max(5, engine.aimPower - (e.shiftKey ? 0.8 : 2.5));
          break;
        case 'ArrowRight':
          e.preventDefault();
          engine.aimPower = Math.min(100, engine.aimPower + (e.shiftKey ? 0.8 : 2.5));
          break;
        case 'Space':
          e.preventDefault();
          if (!e.repeat) {
            engine.startCharging();
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        engine.stopChargingAndFire();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [engine, onToggleMute, onOpenArsenal, onOpenSetup]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-950">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
        className="block max-w-full max-h-full aspect-video object-contain cursor-crosshair rounded-none shadow-2xl"
      />
    </div>
  );
};
