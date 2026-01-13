import { Navbar } from "@/components/landing/navbar"
import { HeroSection } from "@/components/landing/hero-section"
import { LogoCloud } from "@/components/landing/logo-cloud"
import { ProblemSection } from "@/components/landing/problem-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { BentoSection } from "@/components/landing/bento-section"
import { StatsSection } from "@/components/landing/stats-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { CTASection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"

export default function Home() {
    return (
        <main className="min-h-screen bg-background overflow-hidden">
            <Navbar />
            <HeroSection />
            <LogoCloud />
            <ProblemSection />
            <FeaturesSection />
            <BentoSection />
            {/* <StatsSection /> */}
            {/* <TestimonialsSection /> */}
            <CTASection />
            <Footer />
        </main>
    )
}
