"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CheckCircle, Award, Users, Clock, Target, Heart, Shield, Microscope, TrendingUp, Star } from "lucide-react";
import Image from "next/image";

// Animated counter hook
function useCountUp(end: number, duration = 2000, shouldStart = false) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!shouldStart) return;
        let start = 0;
        const increment = end / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [end, duration, shouldStart]);
    return count;
}

function AnimatedStat({ icon: Icon, value, suffix = "", label, delay = 0 }: {
    icon: React.ElementType;
    value: number;
    suffix?: string;
    label: string;
    delay?: number;
}) {
    const [visible, setVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const count = useCountUp(value, 2000, visible);

    useEffect(() => {
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setTimeout(() => setVisible(true), delay); obs.disconnect(); } },
            { threshold: 0.3 }
        );
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [delay]);

    return (
        <div
            ref={ref}
            className="bg-white/60 backdrop-blur-xl rounded-2xl border-2 border-teal-100/60 shadow-xl p-6 text-center relative overflow-hidden group hover:border-teal-300/60 hover:shadow-2xl transition-all"
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
            }}
        >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-200">
                    <Icon className="w-7 h-7 text-white" strokeWidth={1.8} />
                </div>
                <p className="text-4xl font-bold text-teal-600 mb-1">
                    {visible ? count.toLocaleString() : 0}{suffix}
                </p>
                <p className="text-slate-500 text-sm font-medium">{label}</p>
            </div>
        </div>
    );
}

export default function AboutPage() {
    const [heroVisible, setHeroVisible] = useState(false);

    useEffect(() => { setTimeout(() => setHeroVisible(true), 100); }, []);

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <div className="pt-16">
                {/* Hero with image */}
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
                    {/* Subtle grid */}
                    <div
                        className="absolute inset-0 pointer-events-none opacity-[0.03]"
                        style={{
                            backgroundImage: "linear-gradient(rgba(20,184,166,1) 1px,transparent 1px),linear-gradient(90deg,rgba(20,184,166,1) 1px,transparent 1px)",
                            backgroundSize: "48px 48px",
                        }}
                    />
                    {/* Glow orbs */}
                    <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-teal-400 opacity-[0.06] blur-[130px] pointer-events-none" />
                    <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-cyan-400 opacity-[0.05] blur-[110px] pointer-events-none" />

                    <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-20">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            {/* Left — text */}
                            <div
                                style={{
                                    opacity: heroVisible ? 1 : 0,
                                    transform: heroVisible ? "translateX(0)" : "translateX(-30px)",
                                    transition: "opacity 0.8s ease, transform 0.8s ease",
                                }}
                            >
                                <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-4 py-1.5 mb-5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                                    <span className="text-teal-700 text-xs font-semibold tracking-widest uppercase">About Us</span>
                                </div>
                                <h1 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-5 leading-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
                                    Prathamesh Advanced Diagnostic Center
                                </h1>
                                <p className="text-slate-600 text-base leading-relaxed mb-6">
                                    NABL accredited pathology lab in Nashik, delivering accurate diagnostics with compassion since 2005. We combine cutting-edge technology with experienced professionals to provide reliable results you can trust.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    {["NABL Accredited", "ISO 15189 Certified", "5000+ Patients", "24hr Reports"].map((t) => (
                                        <span key={t} className="flex items-center gap-1.5 text-slate-600 text-xs font-medium bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-sm">
                                            <CheckCircle className="w-3.5 h-3.5 text-teal-500" strokeWidth={2.5} />
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Right — image */}
                            <div
                                className="relative"
                                style={{
                                    opacity: heroVisible ? 1 : 0,
                                    transform: heroVisible ? "translateX(0)" : "translateX(30px)",
                                    transition: "opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s",
                                }}
                            >
                                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                                    <Image
                                        src="/images/doctor_image.jpg"
                                        alt="Prathamesh Diagnostic Lab"
                                        width={600}
                                        height={400}
                                        className="w-full h-auto object-cover"
                                        priority
                                    />
                                    {/* Overlay badge */}
                                    <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-2xl px-5 py-3 shadow-xl border border-teal-100">
                                        <p className="text-teal-600 text-2xl font-bold leading-none">18+</p>
                                        <p className="text-slate-600 text-xs mt-1">Years of Excellence</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Animated Stats — with border */}
                <div className="relative py-16 bg-white border-y-4 border-teal-100">
                    <div className="max-w-7xl mx-auto px-6 lg:px-12">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            <AnimatedStat icon={Users} value={5000} suffix="+" label="Patients Served" delay={0} />
                            <AnimatedStat icon={Microscope} value={200} suffix="+" label="Tests Available" delay={100} />
                            <AnimatedStat icon={Clock} value={24} suffix="hr" label="Report Delivery" delay={200} />
                            <AnimatedStat icon={Star} value={4.9} suffix="★" label="Average Rating" delay={300} />
                        </div>
                    </div>
                </div>

                {/* Mission & Vision — with border */}
                <div className="relative py-16 bg-gradient-to-b from-slate-50 to-white border-b-4 border-teal-100">
                    <div className="max-w-7xl mx-auto px-6 lg:px-12">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-3" style={{ fontFamily: "'Instrument Serif', serif" }}>
                                Our Mission & Vision
                            </h2>
                            <p className="text-slate-500 max-w-2xl mx-auto">
                                Committed to delivering excellence in diagnostic services with accuracy, speed, and compassion.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {[
                                {
                                    icon: Target,
                                    title: "Our Mission",
                                    desc: "To provide accurate, timely, and affordable diagnostic services to every patient, ensuring the highest standards of quality and care in every test we perform.",
                                    color: "from-teal-500 to-cyan-400",
                                    items: ["Accurate diagnostics", "Timely results", "Affordable pricing", "Patient-first approach"],
                                },
                                {
                                    icon: Heart,
                                    title: "Our Vision",
                                    desc: "To be the most trusted diagnostic center in Nashik, known for our commitment to quality, innovation, and compassionate patient care.",
                                    color: "from-violet-500 to-purple-400",
                                    items: ["Trusted by thousands", "Innovation-driven", "Quality assured", "Compassionate care"],
                                },
                            ].map(({ icon: Icon, title, desc, color, items }) => (
                                <div key={title} className="bg-white/60 backdrop-blur-xl rounded-2xl border-2 border-slate-100/60 shadow-xl p-8 hover:border-teal-200/60 hover:shadow-2xl transition-all group">
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                                        <Icon className="w-8 h-8 text-white" strokeWidth={1.8} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-3">{title}</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed mb-5">{desc}</p>
                                    <div className="space-y-2">
                                        {items.map((item) => (
                                            <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
                                                <CheckCircle className="w-4 h-4 text-teal-500 shrink-0" strokeWidth={2} />
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Why Choose Us — with border */}
                <div className="relative py-16 bg-white border-b-4 border-teal-100">
                    <div className="max-w-7xl mx-auto px-6 lg:px-12">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-3" style={{ fontFamily: "'Instrument Serif', serif" }}>
                                Why Choose Us
                            </h2>
                            <p className="text-slate-500 max-w-2xl mx-auto">
                                Experience the difference of world-class diagnostic services backed by cutting-edge technology and expert care.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { icon: Award, title: "NABL Accredited", desc: "Our lab is NABL accredited and ISO 15189 certified, ensuring the highest quality standards." },
                                { icon: Microscope, title: "Advanced Technology", desc: "State-of-the-art equipment and automated systems for accurate and reliable results." },
                                { icon: Users, title: "Expert Team", desc: "Experienced pathologists and lab technicians with decades of combined expertise." },
                                { icon: Clock, title: "Fast Turnaround", desc: "Most reports delivered within 24 hours, with urgent tests available on request." },
                                { icon: Shield, title: "Data Security", desc: "Your health data is encrypted and stored securely with strict privacy protocols." },
                                { icon: TrendingUp, title: "Continuous Improvement", desc: "Regular quality audits and staff training to maintain excellence in service." },
                            ].map(({ icon: Icon, title, desc }, i) => (
                                <div
                                    key={title}
                                    className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border-2 border-slate-100 shadow-md p-6 hover:border-teal-200 hover:shadow-lg transition-all group"
                                    style={{
                                        animationDelay: `${i * 100}ms`,
                                    }}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-4 group-hover:bg-teal-100 transition-colors">
                                        <Icon className="w-6 h-6 text-teal-600" strokeWidth={1.8} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
