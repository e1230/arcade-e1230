"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { NeonButton } from "@/components/ui/NeonButton";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { NAV_LINKS, getActiveHref } from "@/components/layout/nav-links";
import { getPlayerName, useSession } from "@/lib/session";

export function Navbar() {
  const pathname = usePathname();
  const activeHref = getActiveHref(pathname);
  const { user, signOut } = useSession();

  return (
    <nav className="sticky top-0 z-40 border-b border-border-neon bg-overlay backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1280px] items-center gap-6 px-5 py-3.5">
        <Link href="/" className="shrink-0">
          <Logo size="nav" />
        </Link>

        <div className="hidden lg:flex lg:gap-7 lg:ml-3">
          {NAV_LINKS.map((link) => {
            const active = activeHref === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  active
                    ? "border-b-2 border-cyan py-1.5 font-bold whitespace-nowrap text-cyan shadow-[0_6px_12px_-6px_#00f5ff]"
                    : "border-b-2 border-transparent py-1.5 font-bold whitespace-nowrap text-soft hover:text-cyan"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex-1" />

        <div className="hidden lg:block">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center bg-pink font-pixel text-sm text-background shadow-[0_0_12px_#ff006e]">
                {user.name[0]}
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-bold text-foreground">{getPlayerName(user)}</span>
                <button
                  onClick={() => signOut()}
                  className="cursor-pointer border-0 bg-transparent p-0 text-left text-xs text-muted hover:text-pink"
                >
                  cerrar sesión
                </button>
              </div>
            </div>
          ) : (
            <NeonButton href="/login" accent="yellow" size="sm">
              INICIAR SESIÓN
            </NeonButton>
          )}
        </div>

        <MobileMenu />
      </div>
    </nav>
  );
}
