import type { Metadata } from "next";
import { Courier_Prime, Press_Start_2P } from "next/font/google";
import { BackgroundEffects } from "@/components/layout/BackgroundEffects";
import { Navbar } from "@/components/layout/Navbar";
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
  description: "Plataforma online para jugar y competir por la mayor cantidad de puntos.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${courierPrime.variable} ${pressStart.variable} h-full antialiased`}
    >
      <body className="relative min-h-full flex flex-col overflow-x-hidden bg-background">
        <BackgroundEffects />
        <Navbar />
        <main className="relative z-[1] flex flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
