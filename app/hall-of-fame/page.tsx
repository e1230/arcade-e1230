import type { Metadata } from "next";
import { HallOfFameView } from "@/components/hall-of-fame/HallOfFameView";

export const metadata: Metadata = {
  title: "Salón de la Fama",
};

export default function HallOfFamePage() {
  return <HallOfFameView />;
}
