import { FeatureGrid } from "@/components/home/FeatureGrid";
import { GamesRail } from "@/components/home/GamesRail";
import { HomeHero } from "@/components/home/HomeHero";
import { StatsBand } from "@/components/home/StatsBand";

export default function Home() {
  return (
    <div>
      <HomeHero />
      <FeatureGrid />
      <GamesRail />
      <StatsBand />
    </div>
  );
}
