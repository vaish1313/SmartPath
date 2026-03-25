import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/landing/Hero";
import MarqueeBar from "@/components/landing/MarqueeBar";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import PopularTests from "@/components/landing/PopularTests";
import Testimonials from "@/components/landing/Testimonials";
import Footer from "@/components/layout/Footer";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#060B14] text-white font-sans overflow-x-hidden">
            <Navbar />
            <HeroSection />
            <MarqueeBar />
            <Features />
            <HowItWorks />
            <PopularTests />
            <Testimonials />
            <Footer />
        </div>
    );
}
