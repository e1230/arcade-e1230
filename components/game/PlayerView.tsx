"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CrtScreen } from "@/components/game/CrtScreen";
import { GameCanvas } from "@/components/game/GameCanvas";
import { GameOverModal } from "@/components/game/GameOverModal";
import { PlayerHud } from "@/components/game/PlayerHud";
import { StartScreen } from "@/components/game/StartScreen";
import { NeonButton } from "@/components/ui/NeonButton";
import type { GameCallbacks } from "@/lib/arcade/engine";
import { getGameDefinition } from "@/lib/arcade/registry";
import { ACCENTS, type Game } from "@/lib/games";
import { insertScore } from "@/lib/leaderboard-client";
import { getPlayerName, useSession } from "@/lib/session";

type PlayerStatus = "loading" | "ready" | "simulating" | "playing" | "over";
type SaveStatus = "idle" | "saving" | "saved" | "error";

interface PlayerState {
  status: PlayerStatus;
  paused: boolean;
  score: number;
  lives: number;
  level: number;
  saveStatus: SaveStatus;
  typedMessage: string;
}

const INITIAL_STATE: PlayerState = {
  status: "loading",
  paused: false,
  score: 0,
  lives: 3,
  level: 1,
  saveStatus: "idle",
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
        lives:
          t % TICKS_TO_LOSE_LIFE === 0 ? Math.max(0, s.lives - 1) : s.lives,
      }));
      if (t >= TICKS_TO_END) endGame();
    }, TICK_MS);
  }, [endGame]);

  const togglePause = useCallback(() => {
    const status = stateRef.current.status;
    if (status !== "simulating" && status !== "playing") return;
    setState((s) => ({ ...s, paused: !s.paused }));
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key.toLowerCase() === "p") togglePause();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [togglePause]);

  const definition = useMemo(() => getGameDefinition(game.id), [game.id]);

  const handleStart = useCallback(() => {
    if (stateRef.current.status !== "ready") return;
    setState((s) => ({ ...s, status: "playing" }));
  }, []);

  useEffect(() => {
    if (!definition) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.code === "Space" && stateRef.current.status === "ready") {
        e.preventDefault();
        handleStart();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [definition, handleStart]);

  // Pausa automática: nunca se reanuda sola, solo con P o SEGUIR.
  useEffect(() => {
    function pauseIfPlaying() {
      if (stateRef.current.status === "playing" && !stateRef.current.paused) {
        setState((s) => ({ ...s, paused: true }));
      }
    }
    function onVisibilityChange() {
      if (document.visibilityState === "hidden") pauseIfPlaying();
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", pauseIfPlaying);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", pauseIfPlaying);
    };
  }, []);

  const callbacks = useMemo<GameCallbacks>(
    () => ({
      onScore: (score) => setState((s) => ({ ...s, score })),
      onLives: (lives) => setState((s) => ({ ...s, lives })),
      onLevel: (level) => setState((s) => ({ ...s, level })),
      onGameOver: (finalScore) =>
        setState((s) => ({
          ...s,
          status: "over",
          paused: false,
          score: finalScore,
        })),
    }),
    [],
  );

  async function handleSave() {
    setState((s) => ({ ...s, saveStatus: "saving" }));
    const { ok } = await insertScore({
      gameId: game.id,
      name: getPlayerName(user),
      score: state.score,
    });

    if (!ok) {
      setState((s) => ({ ...s, saveStatus: "error" }));
      return;
    }

    setState((s) => ({ ...s, saveStatus: "saved", typedMessage: "" }));
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
    <div className="mx-auto flex w-full max-w-[860px] flex-col gap-4.5 px-4 pt-7 pb-20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span
          style={{ textShadow: `0 0 8px ${accentHex}` }}
          className="font-pixel text-sm text-white"
        >
          {game.title}
        </span>
        <div className="flex gap-2.5">
          <NeonButton
            variant="outline"
            accent="yellow"
            size="sm"
            onClick={togglePause}
          >
            {pauseLabel}
          </NeonButton>
          <NeonButton
            href={`/games/${game.id}`}
            variant="outline"
            accent="pink"
            size="sm"
          >
            SALIR
          </NeonButton>
        </div>
      </div>

      <PlayerHud
        score={state.score}
        lives={state.lives}
        level={state.level}
        playerName={playerName}
      />

      <CrtScreen loading={state.status === "loading"} paused={state.paused}>
        {state.status === "ready" &&
          (definition ? (
            <StartScreen
              title={game.title}
              controls={definition.controls}
              onStart={handleStart}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4.5 [background-image:repeating-linear-gradient(135deg,rgba(0,245,255,.05)_0_10px,transparent_10px_20px)] bg-repeat p-6 text-center">
              <span className="font-pixel text-xs text-cyan">
                IFRAME SANDBOX
              </span>
              <code className="border border-border bg-surface px-3 py-2 text-[15px] text-foreground">
                juegos/{game.id}.html
              </code>
              <p className="m-0 max-w-[44ch] text-sm leading-relaxed text-muted">
                Coloca aquí el archivo HTML del juego. Envía la puntuación con
                postMessage({"{ tipo: 'puntuacion', valor }"}) y el final con{" "}
                {"{ tipo: 'fin' }"}.
              </p>
              <NeonButton
                variant="outline"
                accent="yellow"
                size="sm"
                onClick={simulate}
              >
                SIMULAR PARTIDA
              </NeonButton>
            </div>
          ))}

        {definition &&
          (state.status === "playing" || state.status === "over") && (
            <GameCanvas
              definition={definition}
              paused={state.paused}
              callbacks={callbacks}
            />
          )}
      </CrtScreen>

      {state.status === "over" && (
        <GameOverModal
          score={state.score}
          saveStatus={state.saveStatus}
          typedMessage={state.typedMessage}
          isGuest={isGuest}
          onSave={handleSave}
          onPlayAgain={startLoading}
        />
      )}
    </div>
  );
}
