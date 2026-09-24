import type { Metadata } from "next";
import { AboutHero } from "@/components/about/AboutHero";
import { PixelDivider } from "@/components/about/PixelDivider";
import { Reveal } from "@/components/home/Reveal";

export const metadata: Metadata = {
  title: "Acerca de",
};

export default function AboutPage() {
  return (
    <div className="motion-safe:animate-fade">
      <AboutHero />
      <Reveal>
        <PixelDivider />
      </Reveal>
    </div>
  );
}
