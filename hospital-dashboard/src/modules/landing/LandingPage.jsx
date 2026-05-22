import { useEffect } from 'react';
import Lenis from 'lenis';
import FloatingParticles from '../../components/common/FloatingParticles';
import NavbarSection from './sections/NavbarSection';
import HeroSection from './sections/HeroSection';
import PartnersSection from './sections/PartnersSection';
import FeaturesSection from './sections/FeaturesSection';
import DashboardPreviewSection from './sections/DashboardPreviewSection';
import AIInsightsSection from './sections/AIInsightsSection';
import TestimonialsSection from './sections/TestimonialsSection';
import SecuritySection from './sections/SecuritySection';
import PricingSection from './sections/PricingSection';
import FAQSection from './sections/FAQSection';
import CTASection from './sections/CTASection';
import FooterSection from './sections/FooterSection';

export default function LandingPage() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  return (
    <div className="bg-[#020817] text-[#F8FAFC] overflow-x-hidden min-h-screen">
      <FloatingParticles count={40} />
      <NavbarSection />
      <HeroSection />
      <PartnersSection />
      <FeaturesSection />
      <DashboardPreviewSection />
      <AIInsightsSection />
      <TestimonialsSection />
      <SecuritySection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <FooterSection />
    </div>
  );
}
