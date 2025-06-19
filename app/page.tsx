import { MainLayout } from "@/components/layout/MainLayout";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { WellnessStory } from "@/components/home/WellnessStory";
import { Testimonials } from "@/components/home/Testimonials";
import { NewsletterCTA } from "@/components/home/NewsletterCTA";
import { StatsSection } from "@/components/home/StatsSection";
import { BenefitsSection } from "@/components/home/BenefitsSection";
import { ColorfulCategories } from "@/components/home/ColorfulCategories";
import { VibrantFeatures } from "@/components/home/VibrantFeatures";

export default function HomePage() {
  return (
    <MainLayout>
      <HeroSection />
      <FeaturedProducts />
      {/* <ColorfulCategories /> */}
      {/* <VibrantFeatures /> */}
      <WellnessStory />
      {/* <StatsSection /> */}

      <CategoryShowcase />
      <BenefitsSection />

      <Testimonials />
      {/* <NewsletterCTA /> */}
    </MainLayout>
  );
}
