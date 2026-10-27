import { HomeHero } from "@/components/organisms/HomeHero";
import { PracticeCategories } from "@/components/organisms/PracticeCategories";
import { PublicFooter } from "@/components/organisms/PublicFooter";
import { PublicHeader } from "@/components/organisms/PublicHeader";

export const PublicHome = () => {
  return (
    <div className="flex flex-col bg-white min-h-screen">
      <PublicHeader />
      <main className="flex flex-1 flex-col">
        <HomeHero />
        <PracticeCategories />
      </main>
      <PublicFooter />
    </div>
  );
};
