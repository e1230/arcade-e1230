import type { Metadata } from "next";
import { LibraryHero } from "@/components/library/LibraryHero";
import { LibraryView } from "@/components/library/LibraryView";

export const metadata: Metadata = {
  title: "Biblioteca",
};

export default function LibraryPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-30 pt-14">
      <LibraryHero />
      <LibraryView />
    </div>
  );
}
