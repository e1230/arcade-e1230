import { FeatureGrid } from "@/components/home/FeatureGrid";
import { FinalCta } from "@/components/home/FinalCta";
import { GamesRail } from "@/components/home/GamesRail";
import { HomeHero } from "@/components/home/HomeHero";
import { LiveActivity } from "@/components/home/LiveActivity";
import { PricingSection } from "@/components/home/PricingSection";
import { StatsBand } from "@/components/home/StatsBand";

export default function Home() {
  return (
    <div>
      <HomeHero />
      <FeatureGrid />
      <GamesRail />
      <StatsBand />
      <LiveActivity />
      <PricingSection />
      <FinalCta />
    </div>
  );
}
