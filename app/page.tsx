import { getCurrentStaff } from "@/lib/auth/context";
import NavBar from "@/components/landing/NavBar";
import HeroSection from "@/components/landing/HeroSection";
import TrustSection from "@/components/landing/TrustSection";
import AboutSection from "@/components/landing/AboutSection";
import WhoUsesSection from "@/components/landing/WhoUsesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import WhyVayasSection from "@/components/landing/WhyVayasSection";
import SupportSection from "@/components/landing/SupportSection";
import ContactSection from "@/components/landing/ContactSection";
import FooterSection from "@/components/landing/FooterSection";

// Force dynamic — auth lookup is server-side
export const dynamic = "force-dynamic";

export default async function RootPage() {
  const staff = await getCurrentStaff();

  return (
    <div className="min-h-screen bg-ms-bg">
      <NavBar staff={staff ? { name: staff.name, role: staff.role } : null} />
      
      <main>
        <HeroSection />
        <TrustSection />
        <div id="about">
          <AboutSection />
        </div>
        <WhoUsesSection />
        <HowItWorksSection />
        <FeaturesSection />
        <WhyVayasSection />
        <SupportSection />
        <ContactSection />
      </main>

      <FooterSection />
    </div>
  );
}
