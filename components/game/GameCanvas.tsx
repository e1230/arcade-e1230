"use client";

import { useEffect, useRef } from "react";
import type { GameCallbacks, GameDefinition } from "@/lib/arcade/engine";

interface GameCanvasProps {
  definition: GameDefinition;
  paused: boolean;
  callbacks: GameCallbacks;
}

export function GameCanvas({ definition, paused, callbacks }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef(callbacks);
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  const engineRef = useRef<ReturnType<GameDefinition["create"]> | null>(null);
  // Recuerda el último `paused` aplicado al motor, para no llamar `resume()`
  // justo después de `start()` cuando este efecto corre en el montaje inicial.
  const appliedPausedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = definition.create(canvas, {
      onScore: (score) => callbacksRef.current.onScore(score),
      onLives: (lives) => callbacksRef.current.onLives(lives),
      onLevel: (level) => callbacksRef.current.onLevel(level),
      onGameOver: (finalScore) => callbacksRef.current.onGameOver(finalScore),
    });
    engineRef.current = engine;
    appliedPausedRef.current = false;
    engine.start();

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
     
  }, [definition]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || appliedPausedRef.current === paused) return;
    appliedPausedRef.current = paused;
    if (paused) engine.pause();
    else engine.resume();
  }, [paused]);

  return (
    <canvas
      ref={canvasRef}
      width={definition.width}
      height={definition.height}
      className="absolute inset-0 h-full w-full"
    />
  );
}
