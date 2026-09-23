import { LibraryHero } from "@/components/library/LibraryHero";
import { LibraryView } from "@/components/library/LibraryView";

export default function Home() {
  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-30 pt-14">
      <LibraryHero />
      <LibraryView />
    </div>
  );
}
