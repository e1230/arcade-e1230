// Efectos de sonido: rebote de la bola y rotura de bloque.
// No guarda estado de módulo: cada `createSounds()` crea sus propios `Audio`.

import {
  BOUNCE_SOUND_URL,
  BREAK_SOUND_URL,
} from "@/lib/arcade/arkanoid/constants";

export type SoundName = "bounce" | "break";

export interface Sounds {
  play(name: SoundName): void;
  pause(): void;
  dispose(): void;
}

// Crea los dos `Audio` base. Solo se llama desde `create()`.
export function createSounds(): Sounds {
  let base: Record<SoundName, HTMLAudioElement> | null = {
    bounce: new Audio(BOUNCE_SOUND_URL),
    break: new Audio(BREAK_SOUND_URL),
  };
  const active = new Set<HTMLAudioElement>();

  function stopAll(): void {
    for (const sound of active) sound.pause();
    active.clear();
  }

  return {
    play(name) {
      if (!base) return;
      // Se clona el base para poder solapar varios rebotes seguidos.
      const sound = base[name].cloneNode() as HTMLAudioElement;
      active.add(sound);
      sound.addEventListener("ended", () => active.delete(sound), {
        once: true,
      });
      // El navegador puede bloquear la reproducción: se ignora el rechazo.
      sound.play().catch(() => active.delete(sound));
    },
    // Los efectos duran menos de un segundo: se descartan en lugar de reanudarse.
    pause: stopAll,
    dispose() {
      stopAll();
      base = null;
    },
  };
}
