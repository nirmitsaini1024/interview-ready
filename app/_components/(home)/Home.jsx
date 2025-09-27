
import FeatureCards from "./FeatureCards";
import Hero from "./Hero";
import HeroSection from "./HeroSection";
import PricingPlans from "./PricingPlans";
import ProductShowcase from "./ProductShowcase";
import SiteFooter from "./SiteFooter";
import WhySection from "./WhySection";

export default function Home() {
  return (
    <div>
      <HeroSection />
      {}
      <WhySection />
      <FeatureCards />
      <PricingPlans />
      <SiteFooter />
    </div>
  );
}