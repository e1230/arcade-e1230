// Teclado del motor: teclas sostenidas y pulsaciones de un solo frame.
// No toca `window` a nivel de módulo; solo dentro de `attach()`/`detach()`.

const PREVENTED_CODES = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Space",
]);

export interface Keyboard {
  attach(): void;
  detach(): void;
  isDown(code: string): boolean;
  consume(code: string): boolean;
}

export function createKeyboard(): Keyboard {
  const held: Record<string, boolean> = {};
  const justPressed: Record<string, boolean> = {};

  function handleKeyDown(event: KeyboardEvent): void {
    if (PREVENTED_CODES.has(event.code)) event.preventDefault();
    if (!event.repeat && !held[event.code]) justPressed[event.code] = true;
    held[event.code] = true;
  }

  function handleKeyUp(event: KeyboardEvent): void {
    if (PREVENTED_CODES.has(event.code)) event.preventDefault();
    held[event.code] = false;
  }

  return {
    attach() {
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
    },
    detach() {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      for (const code of Object.keys(held)) held[code] = false;
      for (const code of Object.keys(justPressed)) justPressed[code] = false;
    },
    isDown(code: string): boolean {
      return !!held[code];
    },
    consume(code: string): boolean {
      const value = !!justPressed[code];
      justPressed[code] = false;
      return value;
    },
  };
}
