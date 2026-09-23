"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CrtScreen } from "@/components/game/CrtScreen";
import { GameOverModal } from "@/components/game/GameOverModal";
import { PlayerHud } from "@/components/game/PlayerHud";
import { NeonButton } from "@/components/ui/NeonButton";
import { formatToday } from "@/lib/format";
import { ACCENTS, type Game } from "@/lib/games";
import { useLocalScores } from "@/lib/local-scores";
import { getPlayerName, useSession } from "@/lib/session";

type PlayerStatus = "loading" | "ready" | "simulating" | "over";

interface PlayerState {
  status: PlayerStatus;
  paused: boolean;
  score: number;
  lives: number;
  level: number;
  saved: boolean;
  typedMessage: string;
}

const INITIAL_STATE: PlayerState = {
  status: "loading",
  paused: false,
  score: 0,
  lives: 3,
  level: 1,
  saved: false,
  typedMessage: "",
};

const LOADING_MS = 1100;
const TICK_MS = 100;
const TICKS_TO_LOSE_LIFE = 12;
const TICKS_TO_END = 36;
const TYPE_MS = 60;
const SAVE_MESSAGE = "PUNTUACIÓN GUARDADA";

interface PlayerViewProps {
  game: Game;
}

export function PlayerView({ game }: PlayerViewProps) {
  const [state, setState] = useState<PlayerState>(INITIAL_STATE);
  const { user } = useSession();
  const { saveScore } = useLocalScores();

  const loadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const simInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const typeInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const clearTimers = useCallback(() => {
    if (loadTimer.current) clearTimeout(loadTimer.current);
    if (simInterval.current) clearInterval(simInterval.current);
    if (typeInterval.current) clearInterval(typeInterval.current);
    loadTimer.current = null;
    simInterval.current = null;
    typeInterval.current = null;
  }, []);

  const scheduleReady = useCallback(() => {
    loadTimer.current = setTimeout(() => {
      setState((s) => ({ ...s, status: "ready" }));
    }, LOADING_MS);
  }, []);

  // Reinicia el estado y arranca de nuevo el temporizador de carga: la usa JUGAR DE NUEVO
  const startLoading = useCallback(() => {
    clearTimers();
    setState({ ...INITIAL_STATE, status: "loading" });
    scheduleReady();
  }, [clearTimers, scheduleReady]);

  useEffect(() => {
    scheduleReady();
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const endGame = useCallback(() => {
    if (simInterval.current) clearInterval(simInterval.current);
    simInterval.current = null;
    setState((s) => ({ ...s, status: "over", paused: false }));
  }, []);

  const simulate = useCallback(() => {
    if (simInterval.current) return;
    setState((s) => ({ ...s, status: "simulating" }));
    let t = 0;
    simInterval.current = setInterval(() => {
      if (stateRef.current.paused) return;
      t++;
      setState((s) => ({
        ...s,
        score: s.score + Math.floor(Math.random() * 90 + 10) * 10,
        level: 1 + Math.floor(t / 12),
        lives: t % TICKS_TO_LOSE_LIFE === 0 ? Math.max(0, s.lives - 1) : s.lives,
      }));
      if (t >= TICKS_TO_END) endGame();
    }, TICK_MS);
  }, [endGame]);

  const togglePause = useCallback(() => {
    if (stateRef.current.status === "loading" || stateRef.current.status === "over") return;
    setState((s) => ({ ...s, paused: !s.paused }));
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key.toLowerCase() === "p") togglePause();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [togglePause]);

  function handleSave() {
    const entry = { name: getPlayerName(user), score: state.score, date: formatToday() };
    saveScore(game.id, entry);
    setState((s) => ({ ...s, saved: true, typedMessage: "" }));
    let i = 0;
    if (typeInterval.current) clearInterval(typeInterval.current);
    typeInterval.current = setInterval(() => {
      i++;
      setState((s) => ({ ...s, typedMessage: SAVE_MESSAGE.slice(0, i) }));
      if (i >= SAVE_MESSAGE.length && typeInterval.current) {
        clearInterval(typeInterval.current);
        typeInterval.current = null;
      }
    }, TYPE_MS);
  }

  const isGuest = !user || user.guest;
  const playerName = getPlayerName(user);
  const pauseLabel = state.paused ? "SEGUIR" : "PAUSA";
  const accentHex = ACCENTS[game.accent].hex;

  return (
    <div className="mx-auto flex w-full max-w-[860px] flex-col gap-4.5 px-4 pb-20 pt-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span style={{ textShadow: `0 0 8px ${accentHex}` }} className="font-pixel text-sm text-white">
          {game.title}
        </span>
        <div className="flex gap-2.5">
          <NeonButton variant="outline" accent="yellow" size="sm" onClick={togglePause}>
            {pauseLabel}
          </NeonButton>
          <NeonButton href={`/games/${game.id}`} variant="outline" accent="pink" size="sm">
            SALIR
          </NeonButton>
        </div>
      </div>

      <PlayerHud score={state.score} lives={state.lives} level={state.level} playerName={playerName} />

      <CrtScreen loading={state.status === "loading"} paused={state.paused}>
        {state.status === "ready" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4.5 bg-repeat p-6 text-center [background-image:repeating-linear-gradient(135deg,rgba(0,245,255,.05)_0_10px,transparent_10px_20px)]">
            <span className="font-pixel text-xs text-cyan">IFRAME SANDBOX</span>
            <code className="border border-border bg-surface px-3 py-2 text-[15px] text-foreground">
              juegos/{game.id}.html
            </code>
            <p className="m-0 max-w-[44ch] text-sm leading-relaxed text-muted">
              Coloca aquí el archivo HTML del juego. Envía la puntuación con
              postMessage({"{ tipo: 'puntuacion', valor }"}) y el final con {"{ tipo: 'fin' }"}.
            </p>
            <NeonButton variant="outline" accent="yellow" size="sm" onClick={simulate}>
              SIMULAR PARTIDA
            </NeonButton>
          </div>
        )}
      </CrtScreen>

      {state.status === "over" && (
        <GameOverModal
          score={state.score}
          saved={state.saved}
          typedMessage={state.typedMessage}
          isGuest={isGuest}
          onSave={handleSave}
          onPlayAgain={startLoading}
        />
      )}
    </div>
  );
}
