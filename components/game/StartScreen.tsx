"use client";

import { useSyncExternalStore } from "react";
import { NeonButton } from "@/components/ui/NeonButton";
import type { GameControl, SkinId } from "@/lib/arcade/engine";
import { SKIN_LABELS } from "@/lib/arcade/shared/skins";

interface StartScreenProps {
  title: string;
  controls: GameControl[];
  skins?: readonly SkinId[];
  skin: SkinId;
  onSkinChange: (skin: SkinId) => void;
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

export function StartScreen({
  title,
  controls,
  skins,
  skin,
  onSkinChange,
  onStart,
}: StartScreenProps) {
  const isCoarsePointer = useIsCoarsePointer();

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-deep p-3 text-center sm:gap-4.5 sm:p-6">
      <span className="font-pixel text-xs text-cyan">{title}</span>

      <table className="text-sm text-muted">
        <tbody>
          {controls.map((control) => (
            <tr key={control.action}>
              <td className="px-3 py-0 text-right font-mono text-xs text-foreground sm:py-1 sm:text-sm">
                {control.keys}
              </td>
              <td className="px-3 py-0 text-left text-xs sm:py-1 sm:text-sm">
                {control.action}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {skins && skins.length > 0 && (
        <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:gap-3">
          <span className="font-pixel text-[10px] text-muted">SKIN</span>
          <div
            role="radiogroup"
            aria-label="SKIN"
            className="flex flex-nowrap gap-1.5 sm:gap-2"
          >
            {skins.map((id) => (
              <NeonButton
                key={id}
                role="radio"
                aria-checked={skin === id}
                accent="cyan"
                variant={skin === id ? "solid" : "outline"}
                size="sm"
                className="px-2! sm:px-3.5!"
                onClick={() => onSkinChange(id)}
              >
                {SKIN_LABELS[id]}
              </NeonButton>
            ))}
          </div>
        </div>
      )}

      {isCoarsePointer ? (
        <span className="font-pixel text-xs text-pink [text-shadow:var(--text-shadow-glow-pink)]">
          ESTE JUEGO NECESITA TECLADO
        </span>
      ) : (
        <>
          <span className="hidden font-pixel text-xs text-yellow motion-safe:animate-blink sm:block">
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
