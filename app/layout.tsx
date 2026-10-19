import type { Metadata } from "next";
import { Courier_Prime, Press_Start_2P } from "next/font/google";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { BackgroundEffects } from "@/components/layout/BackgroundEffects";
import { Navbar } from "@/components/layout/Navbar";
import { fetchSessionUser } from "@/lib/session-server";
import "./globals.css";

// Fuente del cuerpo, igual que en references/Arcade E1230.dc.html
const courierPrime = Courier_Prime({
  variable: "--font-courier-prime",
  subsets: ["latin"],
  weight: ["400", "700"],
});

// Fuente pixelada para logo, títulos y botones
const pressStart = Press_Start_2P({
  variable: "--font-press-start",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "Arcade E1230",
    template: "%s · Arcade E1230",
  },
  description:
    "Plataforma online para jugar y competir por la mayor cantidad de puntos.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Leer cookies aquí hace que todas las páginas se rendericen por petición (SPEC 18)
  const user = await fetchSessionUser();

  return (
    <html
      lang="es"
      className={`${courierPrime.variable} ${pressStart.variable} h-full antialiased`}
    >
      <body className="relative flex min-h-full flex-col overflow-x-hidden bg-background">
        <BackgroundEffects />
        <SessionProvider initialUser={user}>
          <Navbar />
          <main className="relative z-[1] flex flex-1 flex-col">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}
