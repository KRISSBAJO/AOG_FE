import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import VisionSection from "@/components/landing/VisionSection";
import FeatureShowcase from "@/components/landing/FeatureShowcase";
import ServiceLinesSection from "@/components/landing/ServiceLinesSection";
import RolesSection from "@/components/landing/RolesSection";
import WorkflowAISection from "@/components/landing/WorkflowAISection";
import IntegrationsSection from "@/components/landing/IntegrationsSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <VisionSection />
        <FeatureShowcase />
        <ServiceLinesSection />
        <RolesSection />
        <WorkflowAISection />
        <IntegrationsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
