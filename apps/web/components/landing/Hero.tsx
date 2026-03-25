"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, ChevronRight } from "lucide-react";

/* ── Typing animation ── */
const PHRASES = [
    "delivered digitally.",
    "ready in 24 hours.",
    "always accessible.",
    "certified & secure.",
];

function TypingText() {
    const [phraseIdx, setPhraseIdx] = useState(0);
    const [displayed, setDisplayed] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [idle, setIdle] = useState(false);
    const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const current = PHRASES[phraseIdx];
        if (!deleting && displayed.length < current.length) {
            timeout.current = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 58);
        } else if (!deleting && displayed.length === current.length) {
            setIdle(true);
            timeout.current = setTimeout(() => { setIdle(false); setDeleting(true); }, 2400);
        } else if (deleting && displayed.length > 0) {
            timeout.current = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 28);
        } else if (deleting && displayed.length === 0) {
            setDeleting(false);
            setPhraseIdx((i) => (i + 1) % PHRASES.length);
        }
        return () => { if (timeout.current) clearTimeout(timeout.current); };
    }, [displayed, deleting, phraseIdx]);

    return (
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#14D7B4] via-[#0EA5E9] to-[#14D7B4]">
            {displayed}
            <span
                className="inline-block w-[3px] h-[0.82em] ml-1 rounded-sm align-middle"
                style={{
                    background: "linear-gradient(#14D7B4, #0EA5E9)",
                    animation: idle ? "blink 0.8s step-end infinite" : "none",
                    opacity: 1,
                }}
            />
        </span>
    );
}

/* ── Zig Zag Image Cluster ── */
function ZigZagCluster() {
    const cards = [
        {
            // TOP RIGHT — tilts right
            src: "/images/image1.jpg",
            alt: "Lab samples",
            defaultStyle: {
                width: "255px",
                height: "305px",
                top: "0px",
                left: "215px",
                transform: "rotate(5deg)",
                zIndex: 1,
                filter: "brightness(0.68)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.65)",
                borderRadius: "22px",
                border: "2.5px solid rgba(255,255,255,0.09)",
            },
        },
        {
            // MIDDLE — doctor card, tilts LEFT (-4deg)
            src: "/images/doctor_image.jpg",
            alt: "Doctor",
            pill: "✦ NABL Accredited Lab",
            defaultStyle: {
                width: "270px",
                height: "325px",
                top: "140px",
                left: "15px",
                transform: "rotate(-4deg)",
                zIndex: 3,
                filter: "brightness(0.9)",
                boxShadow: "0 28px 70px rgba(0,0,0,0.7), 0 0 0 1.5px rgba(0,212,170,0.2)",
                borderRadius: "22px",
                border: "2.5px solid rgba(255,255,255,0.12)",
            },
        },
        {
            // RIGHT — aligned horizontally with doctor card
            src: "/images/image2.jpg",
            alt: "Lab technician",
            defaultStyle: {
                width: "270px",
                height: "325px",
                top: "200px",
                left: "300px",
                transform: "rotate(11deg)",
                zIndex: 2,
                filter: "brightness(0.72)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
                borderRadius: "22px",
                border: "2.5px solid rgba(255,255,255,0.09)",
            },
        },
    ];

    return (
        <div
            className="relative"
            style={{ width: "500px", height: "630px" }}
        >
            {/* Ambient glow */}
            <div
                className="absolute pointer-events-none"
                style={{
                    width: "320px",
                    height: "320px",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(0,212,170,0.09) 0%, transparent 70%)",
                    zIndex: 0,
                }}
            />

            {/* Cards */}
            {cards.map((card, i) => (
                <div
                    key={i}
                    className="absolute overflow-hidden cursor-pointer"
                    style={{
                        ...card.defaultStyle,
                        transition: "transform 0.5s cubic-bezier(0.23,1,0.32,1), box-shadow 0.5s ease, filter 0.5s ease",
                        willChange: "transform",
                    }}
                    onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLDivElement;
                        el.style.transform = "rotate(0deg) scale(1.05)";
                        el.style.filter = "brightness(1)";
                        el.style.zIndex = "10";
                        el.style.boxShadow = "0 32px 90px rgba(0,0,0,0.75), 0 0 0 2px rgba(0,212,170,0.55)";
                    }}
                    onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLDivElement;
                        el.style.transform = card.defaultStyle.transform;
                        el.style.filter = card.defaultStyle.filter;
                        el.style.zIndex = String(card.defaultStyle.zIndex);
                        el.style.boxShadow = card.defaultStyle.boxShadow;
                    }}
                >
                    <img
                        src={card.src}
                        alt={card.alt}
                        className="w-full h-full object-cover block pointer-events-none"
                    />
                    {/* Vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#060B14]/35 via-transparent to-transparent pointer-events-none" />
                    {/* Pill on doctor card */}
                    {card.pill && (
                        <div
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-black font-extrabold whitespace-nowrap pointer-events-none"
                            style={{
                                background: "rgba(0,212,170,0.94)",
                                padding: "7px 16px",
                                borderRadius: "999px",
                                fontSize: "11px",
                                letterSpacing: "0.05em",
                                fontFamily: "-apple-system, sans-serif",
                            }}
                        >
                            {card.pill}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

/* ── Main Hero ── */
export default function HeroSection() {
    const [ready, setReady] = useState(false);

    useEffect(() => { setTimeout(() => setReady(true), 80); }, []);

    return (
        <section className="relative pt-24 pb-16 px-6 lg:px-20 overflow-hidden min-h-screen flex items-center">
            {/* Grid bg */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(20,215,180,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(20,215,180,0.04) 1px,transparent 1px)",
                    backgroundSize: "48px 48px",
                }}
            />
            {/* Glow orbs */}
            <div className="absolute top-1/3 -left-40 w-[600px] h-[600px] rounded-full bg-[#14D7B4] opacity-[0.05] blur-[130px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[#0EA5E9] opacity-[0.04] blur-[120px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* ── LEFT: Text ── */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: ready ? 1 : 0, x: ready ? 0 : -30 }}
                        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-7"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#14D7B4] animate-pulse" />
                            <span className="text-[#14D7B4] text-xs font-semibold tracking-widest uppercase">
                                Prathamesh Advanced Diagnostic Center
                            </span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="text-[clamp(2.4rem,4.5vw,3.8rem)] font-semibold leading-[1.1] tracking-tight text-white mb-5"
                            style={{ fontFamily: "'Instrument Serif', serif" }}
                        >
                            Your health reports,
                            <br />
                            <TypingText />
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                            className="text-[#8899AA] text-base leading-relaxed mb-8 max-w-lg"
                        >
                            Book pathology tests online, track your sample in real time, and
                            download NABL-certified reports — all from one secure portal.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.65, duration: 0.5 }}
                            className="flex flex-col sm:flex-row gap-3 mb-8"
                        >
                            <Link
                                href="/register"
                                className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#14D7B4] to-[#0EA5E9] text-[#060B14] font-bold text-sm px-7 py-4 rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-[#14D7B4]/20 group"
                            >
                                Book a test now
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <Link
                                href="/tests"
                                className="flex items-center justify-center gap-2 bg-white/[0.06] border border-white/10 text-white text-sm font-medium px-7 py-4 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all"
                            >
                                View test catalog
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1, duration: 0.6 }}
                            className="flex flex-wrap gap-5"
                        >
                            {["NABL Accredited", "ISO 15189 Certified", "5000+ Patients", "Reports in 24hrs"].map((t) => (
                                <span key={t} className="flex items-center gap-1.5 text-[#445566] text-xs">
                                    <Check className="w-3 h-3 text-[#14D7B4]" strokeWidth={2.5} />
                                    {t}
                                </span>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* ── RIGHT: Zig Zag Cluster ── */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: ready ? 1 : 0, x: ready ? 0 : 30 }}
                        transition={{ duration: 0.9, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="hidden lg:flex items-center justify-center relative"
                        style={{ height: "640px" }}
                    >
                        <ZigZagCluster />
                    </motion.div>

                </div>
            </div>

            <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
        </section>
    );
}