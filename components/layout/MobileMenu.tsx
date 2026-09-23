"use client";

import Link from "next/link";
import { useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { NeonButton } from "@/components/ui/NeonButton";
import { getPlayerName, useSession } from "@/lib/session";

interface NavLink {
  href: string;
  label: string;
}

const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Biblioteca" },
  { href: "/hall-of-fame", label: "Salón de la Fama" },
];

function getActiveHref(pathname: string): string | null {
  if (pathname === "/login") return null;
  if (pathname === "/hall-of-fame") return "/hall-of-fame";
  return "/";
}

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const activeHref = getActiveHref(pathname);
  const { user, signOut } = useSession();

  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        aria-label="Menú"
        className="flex h-11 w-11 cursor-pointer flex-col items-center justify-center gap-1.5 border-2 border-cyan bg-transparent shadow-[0_0_8px_rgba(0,245,255,.4)]"
      >
        <span className="h-0.5 w-5 bg-cyan" />
        <span className="h-0.5 w-5 bg-cyan" />
        <span className="h-0.5 w-5 bg-cyan" />
      </button>

      {open &&
        createPortal(
          <>
            <div onClick={close} className="fixed inset-0 z-50 bg-black/60" />
          <div className="motion-safe:animate-slide fixed inset-y-0 right-0 z-[51] flex w-[78%] max-w-[320px] flex-col gap-6 border-l-2 border-pink bg-surface p-7 shadow-[-10px_0_40px_rgba(255,0,110,.3)]">
            <div className="flex items-center justify-between">
              <span className="font-pixel text-[10px] text-pink">MENÚ</span>
              <button
                onClick={close}
                className="flex h-11 w-11 cursor-pointer items-center justify-center border-2 border-pink bg-transparent font-pixel text-xs text-pink"
              >
                X
              </button>
            </div>

            {NAV_LINKS.map((link) => {
              const active = activeHref === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  className={
                    active
                      ? "border-l-[3px] border-cyan px-3.5 py-2.5 text-left text-xl font-bold text-cyan"
                      : "border-l-[3px] border-transparent px-3.5 py-2.5 text-left text-xl font-bold text-soft"
                  }
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="h-px bg-border-neon" />

            {user ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center bg-pink font-pixel text-sm text-background">
                    {user.name[0]}
                  </div>
                  <span className="text-base font-bold text-foreground">
                    {getPlayerName(user)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    signOut();
                    close();
                  }}
                  className="cursor-pointer border border-border bg-transparent p-3 text-left text-[15px] text-muted"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <NeonButton href="/login" accent="yellow" size="md" onClick={close}>
                INICIAR SESIÓN
              </NeonButton>
            )}
          </div>
          </>,
          document.body,
        )}
    </div>
  );
}
