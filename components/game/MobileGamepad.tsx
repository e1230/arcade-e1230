"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GameTouchControls, TouchButton } from "@/lib/arcade/engine";

interface MobileGamepadProps {
  controls: GameTouchControls;
  disabled?: boolean; // true mientras el juego está en pausa
}

// Calcula `KeyboardEvent.key` a partir de `code` ("Space" → " ", "KeyX" → "x").
function keyFromCode(code: string): string {
  if (code === "Space") return " ";
  if (code.startsWith("Key")) return code.slice(3).toLowerCase();
  if (code.startsWith("Digit")) return code.slice(5);
  return code;
}

function dispatchKey(type: "keydown" | "keyup", code: string): void {
  window.dispatchEvent(
    new KeyboardEvent(type, {
      code,
      key: keyFromCode(code),
      bubbles: true,
      cancelable: true,
    }),
  );
}

const LABELS: Record<TouchButton, string> = {
  up: "ARRIBA",
  down: "ABAJO",
  left: "IZQUIERDA",
  right: "DERECHA",
  a: "A",
  b: "B",
};

const NOT_PRESSED: Record<TouchButton, boolean> = {
  up: false,
  down: false,
  left: false,
  right: false,
  a: false,
  b: false,
};

// Triángulos del D-pad, tal como en gamepad.html.
const ARROW_PATHS: Record<"up" | "down" | "left" | "right", string> = {
  up: "M12 4 L20 16 L4 16 Z",
  right: "M8 4 L20 12 L8 20 Z",
  down: "M4 8 L20 8 L12 20 Z",
  left: "M16 4 L16 20 L4 12 Z",
};

// Posición de cada flecha: base mobile (hub de 46 px) y de escritorio desde `sm:` (hub de 50 px).
const DPAD_POSITIONS: Record<"up" | "down" | "left" | "right", string> = {
  up: "top-0 left-[49px] sm:left-[53px]",
  down: "bottom-0 left-[49px] sm:left-[53px]",
  left: "left-0 top-[49px] sm:top-[53px]",
  right: "right-0 top-[49px] sm:top-[53px]",
};

const DPAD_BASE =
  "absolute flex size-[46px] cursor-pointer items-center justify-center rounded-lg border p-0 transition-[transform,box-shadow,color,border-color,background] duration-150 sm:size-[50px] sm:rounded-[10px] disabled:cursor-default disabled:opacity-35";
const DPAD_IDLE =
  "border-white/5 bg-[linear-gradient(180deg,#1a1a25,#0a0a12)] text-muted shadow-[0_4px_0_#050507,inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-2px_4px_rgba(0,0,0,0.6)]";
const DPAD_ON =
  "translate-y-[3px] border-cyan bg-[linear-gradient(180deg,#08161e,#030a0e)] text-cyan shadow-[0_1px_0_#050507,inset_0_0_16px_rgba(0,245,255,0.45),0_0_16px_rgba(0,245,255,0.5)]";

const ACTION_BASE =
  "relative flex size-16 cursor-pointer items-center justify-center rounded-full border-2 p-0 transition-[transform,box-shadow] duration-150 sm:size-[74px] disabled:cursor-default disabled:opacity-35";
const ACTION_STYLES: Record<
  "a" | "b",
  { idle: string; on: string; text: string }
> = {
  a: {
    idle: "border-pink text-pink bg-[radial-gradient(circle_at_32%_26%,rgba(255,255,255,0.25),transparent_50%),radial-gradient(circle_at_50%_55%,rgba(255,0,110,0.7),rgba(110,0,40,0.95)_75%)] shadow-[0_6px_0_#050507,0_0_22px_rgba(255,0,110,0.4),inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-4px_8px_rgba(0,0,0,0.4)]",
    on: "translate-y-1 scale-[0.97] border-pink text-pink bg-[radial-gradient(circle_at_32%_26%,rgba(255,255,255,0.25),transparent_50%),radial-gradient(circle_at_50%_55%,rgba(255,0,110,0.7),rgba(110,0,40,0.95)_75%)] shadow-[0_1px_0_#050507,0_0_36px_rgba(255,0,110,0.4),inset_0_0_18px_rgba(0,0,0,0.5)]",
    text: "[text-shadow:0_0_8px_#ff006e,0_0_18px_#ff006e,0_1px_0_rgba(0,0,0,0.6)]",
  },
  b: {
    idle: "border-cyan text-cyan bg-[radial-gradient(circle_at_32%_26%,rgba(255,255,255,0.25),transparent_50%),radial-gradient(circle_at_50%_55%,rgba(0,200,230,0.7),rgba(0,50,70,0.95)_75%)] shadow-[0_6px_0_#050507,0_0_22px_rgba(0,245,255,0.4),inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-4px_8px_rgba(0,0,0,0.4)]",
    on: "translate-y-1 scale-[0.97] border-cyan text-cyan bg-[radial-gradient(circle_at_32%_26%,rgba(255,255,255,0.25),transparent_50%),radial-gradient(circle_at_50%_55%,rgba(0,200,230,0.7),rgba(0,50,70,0.95)_75%)] shadow-[0_1px_0_#050507,0_0_36px_rgba(0,245,255,0.4),inset_0_0_18px_rgba(0,0,0,0.5)]",
    text: "[text-shadow:0_0_8px_#00f5ff,0_0_18px_#00f5ff,0_1px_0_rgba(0,0,0,0.6)]",
  },
};

// Gamepad en pantalla: simula teclado despachando keydown/keyup en `window`.
// Port de references/gamepad-assets/gamepad.html a React y Tailwind.
export function MobileGamepad({ controls, disabled = false }: MobileGamepadProps) {
  const [pressed, setPressed] = useState(NOT_PRESSED);
  // Código despachado por cada botón sostenido, para soltarlo aunque `controls` cambie.
  const held = useRef(new Map<TouchButton, string>());

  const press = useCallback(
    (button: TouchButton, code: string | undefined) => {
      if (disabled || !code || held.current.has(button)) return;
      held.current.set(button, code);
      setPressed((prev) => ({ ...prev, [button]: true }));
      dispatchKey("keydown", code);
    },
    [disabled],
  );

  const release = useCallback((button: TouchButton) => {
    const code = held.current.get(button);
    if (code === undefined) return;
    held.current.delete(button);
    setPressed((prev) => ({ ...prev, [button]: false }));
    dispatchKey("keyup", code);
  }, []);

  // Al pausar se desmarcan los botones (ajuste de estado durante el render, sin efecto).
  const [prevDisabled, setPrevDisabled] = useState(disabled);
  if (disabled !== prevDisabled) {
    setPrevDisabled(disabled);
    if (disabled) setPressed(NOT_PRESSED);
  }

  // Al pausar también se suelta en el motor todo lo que siga presionado.
  useEffect(() => {
    if (!disabled) return;
    for (const code of held.current.values()) dispatchKey("keyup", code);
    held.current.clear();
  }, [disabled]);

  // Al desmontar no deja teclas pegadas en el motor.
  useEffect(() => {
    const heldButtons = held.current;
    return () => {
      for (const code of heldButtons.values()) dispatchKey("keyup", code);
      heldButtons.clear();
    };
  }, []);

  // Props de puntero compartidas por los seis botones.
  function pointerProps(button: TouchButton) {
    const code = controls[button];
    return {
      disabled: !code,
      "aria-label": LABELS[button],
      "aria-pressed": pressed[button],
      onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => {
        event.preventDefault();
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // Sin captura, pointerup igual llega mientras el dedo siga sobre el botón.
        }
        press(button, code);
      },
      onPointerUp: () => release(button),
      onPointerCancel: () => release(button),
      onLostPointerCapture: () => release(button),
      onContextMenu: (event: React.MouseEvent) => event.preventDefault(),
    };
  }

  function renderDpad(direction: "up" | "down" | "left" | "right") {
    return (
      <button
        type="button"
        {...pointerProps(direction)}
        className={`${DPAD_BASE} ${DPAD_POSITIONS[direction]} ${
          pressed[direction] ? DPAD_ON : DPAD_IDLE
        } touch-none select-none [-webkit-touch-callout:none] enabled:hover:border-cyan/35 enabled:hover:text-cyan`}
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className={`size-[22px] transition-[filter] duration-150 ${
            pressed[direction]
              ? "[filter:drop-shadow(0_0_6px_#00f5ff)_drop-shadow(0_0_12px_#00f5ff)]"
              : ""
          }`}
        >
          <path d={ARROW_PATHS[direction]} fill="currentColor" />
        </svg>
      </button>
    );
  }

  function renderAction(button: "a" | "b") {
    const style = ACTION_STYLES[button];
    return (
      <button
        type="button"
        {...pointerProps(button)}
        className={`${ACTION_BASE} ${
          pressed[button] ? style.on : style.idle
        } group touch-none select-none [-webkit-touch-callout:none]`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute -inset-2 rounded-full border border-dashed border-current transition-[opacity,transform] duration-200 ${
            pressed[button]
              ? "scale-[1.08] opacity-100"
              : "opacity-0 group-enabled:group-hover:opacity-45"
          }`}
        />
        <span
          aria-hidden="true"
          className={`relative z-2 font-pixel text-[22px] tracking-[0.02em] text-white ${style.text}`}
        >
          {button.toUpperCase()}
        </span>
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label="Gamepad"
      onContextMenu={(event) => event.preventDefault()}
      className={`relative mx-auto w-full max-w-[760px] touch-none rounded-2xl border border-cyan/18 bg-[linear-gradient(180deg,#1c1c28_0%,#0c0c14_100%)] px-3.5 pt-3 pb-2.5 shadow-[0_30px_80px_-30px_rgba(0,245,255,0.4),0_0_0_1px_rgba(255,255,255,0.02),inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-2px_0_rgba(0,0,0,0.6)] select-none [-webkit-touch-callout:none] sm:rounded-[22px] sm:px-[22px] sm:pt-4 sm:pb-3.5 ${disabled ? "opacity-60" : ""}`}
    >
      {/* Marco interior y trama de puntos de la carcasa */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-1 rounded-[12px] border border-cyan/14 sm:rounded-[18px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:8px_8px] opacity-60"
      />

      <div className="relative z-1 grid grid-cols-2 items-center gap-3.5 px-1.5 py-[18px] sm:gap-[18px] sm:px-3 sm:py-6">
        <div className="flex flex-col items-center justify-self-start">
          <div className="relative size-36 sm:size-[156px]">
            {renderDpad("up")}
            {renderDpad("right")}
            {renderDpad("down")}
            {renderDpad("left")}
            <div
              aria-hidden="true"
              className="absolute top-[49px] left-[49px] flex size-[46px] items-center justify-center rounded-md border border-cyan/15 bg-[radial-gradient(circle_at_50%_50%,#181822_0%,#08080d_80%)] shadow-[inset_0_0_12px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.04)] sm:top-[53px] sm:left-[53px] sm:size-[50px]"
            >
              <span className="size-3 bg-cyan [clip-path:polygon(50%_0,100%_50%,50%_100%,0_50%)] [box-shadow:0_0_10px_#00f5ff] motion-safe:animate-pulse-led" />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-self-end">
          <div className="relative grid grid-cols-[auto_auto] items-center justify-items-center gap-4 sm:gap-[22px]">
            {renderAction("b")}
            {renderAction("a")}
          </div>
        </div>
      </div>
    </div>
  );
}
