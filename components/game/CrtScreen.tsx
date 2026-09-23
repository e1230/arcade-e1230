import type { ReactNode } from "react";
import { PixelLoader } from "@/components/game/PixelLoader";

interface CrtScreenProps {
  loading: boolean;
  paused: boolean;
  children: ReactNode;
}

export function CrtScreen({ loading, paused, children }: CrtScreenProps) {
  return (
    <div className="rounded-[30px] bg-linear-to-br from-[#1c1c26] to-[#0e0e14] p-3.5 shadow-cabinet md:p-7.5">
      <div className="relative aspect-4/3 overflow-hidden rounded-[26px/36px] bg-deep shadow-[inset_0_0_50px_rgba(0,0,0,.9),0_0_0_3px_#050507]">
        {!loading && children}

        {loading && <PixelLoader />}

        {paused && !loading && (
          <div className="absolute inset-0 z-[3] flex items-center justify-center bg-deep/75">
            <span className="motion-safe:animate-blink font-pixel text-2xl text-yellow [text-shadow:var(--text-shadow-glow-yellow)]">
              PAUSA
            </span>
          </div>
        )}

        <div className="bg-crt pointer-events-none absolute inset-0 z-[4]" />
      </div>
      <div className="mt-3.5 flex items-center justify-between px-1.5">
        <span className="font-pixel text-[9px] text-[#3c3c4c]">E1230-CRT</span>
        <span className="h-2.5 w-2.5 rounded-full bg-cyan shadow-[0_0_10px_#00f5ff]" />
      </div>
    </div>
  );
}
