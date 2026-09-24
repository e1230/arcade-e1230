import type { Metadata } from "next";
import { AboutHero } from "@/components/about/AboutHero";

export const metadata: Metadata = {
  title: "Acerca de",
};

export default function AboutPage() {
  return (
    <div className="motion-safe:animate-fade">
      <AboutHero />
    </div>
  );
}
