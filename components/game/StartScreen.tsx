"use client";

import { useSyncExternalStore } from "react";
import { NeonButton } from "@/components/ui/NeonButton";
import type { GameControl } from "@/lib/arcade/engine";

interface StartScreenProps {
  title: string;
  controls: GameControl[];
  onStart: () => void;
}

function subscribeCoarsePointer(callback: () => void) {
  const query = window.matchMedia("(pointer: coarse)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getCoarsePointerSnapshot() {
  return window.matchMedia("(pointer: coarse)").matches;
}

function getCoarsePointerServerSnapshot() {
  return false;
}

function useIsCoarsePointer() {
  return useSyncExternalStore(
    subscribeCoarsePointer,
    getCoarsePointerSnapshot,
    getCoarsePointerServerSnapshot,
  );
}

export function StartScreen({ title, controls, onStart }: StartScreenProps) {
  const isCoarsePointer = useIsCoarsePointer();

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4.5 bg-deep p-6 text-center">
      <span className="font-pixel text-xs text-cyan">{title}</span>

      <table className="text-sm text-muted">
        <tbody>
          {controls.map((control) => (
            <tr key={control.action}>
              <td className="px-3 py-1 text-right font-mono text-foreground">
                {control.keys}
              </td>
              <td className="px-3 py-1 text-left">{control.action}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {isCoarsePointer ? (
        <span className="font-pixel text-xs text-pink [text-shadow:var(--text-shadow-glow-pink)]">
          ESTE JUEGO NECESITA TECLADO
        </span>
      ) : (
        <>
          <span className="font-pixel text-xs text-yellow motion-safe:animate-blink">
            PRESIONA ESPACIO
          </span>
          <NeonButton
            variant="outline"
            accent="yellow"
            size="sm"
            onClick={onStart}
          >
            INICIAR
          </NeonButton>
        </>
      )}
    </div>
  );
}
