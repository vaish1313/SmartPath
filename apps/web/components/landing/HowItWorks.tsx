"use client";

import { useEffect, useRef, useState } from "react";
import { UserPlus, CalendarCheck, FlaskConical, FileDown, LucideIcon } from "lucide-react";

function Badge({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-4 py-1.5 text-teal-700 text-xs font-semibold tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            {children}
        </span>
    );
}

const steps: { step: string; icon: LucideIcon; title: string; desc: string }[] = [
    { step: "01", icon: UserPlus, title: "Create account", desc: "Register with email or Google in under 2 minutes." },
    { step: "02", icon: CalendarCheck, title: "Book your test", desc: "Choose from 200+ tests and pick a convenient slot." },
    { step: "03", icon: FlaskConical, title: "Give sample", desc: "Visit the lab or opt for home collection." },
    { step: "04", icon: FileDown, title: "Get report", desc: "Download your certified PDF report digitally." },
];

export default function HowItWorks() {
    const [triggered, setTriggered] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setTriggered(true); obs.disconnect(); } },
            { threshold: 0.1 }
        );
        if (sectionRef.current) obs.observe(sectionRef.current);
        return () => obs.disconnect();
    }, []);

    return (
        <section className="py-16 px-6 lg:px-16 bg-slate-50 overflow-hidden">
            <div className="max-w-5xl mx-auto">

                {/* Heading */}
                <div className="text-center mb-12">
                    <Badge>How it works</Badge>
                    <h2
                        className="text-[clamp(2rem,4vw,3rem)] font-bold mt-5 tracking-tight text-[#1a2332]"
                        style={{ fontFamily: "'Instrument Serif', serif" }}
                    >
                        From booking to report
                        <br />
                        <span className="text-teal-600">in 4 simple steps.</span>
                    </h2>
                </div>

                {/* Timeline */}
                <div ref={sectionRef} className="relative">

                    {/* Vertical center line — bounded between first and last node */}
                    <div className="hidden md:block absolute left-1/2 -translate-x-1/2 w-0.5 bg-slate-200" style={{ top: "24px", bottom: "24px" }}>
                        <div
                            style={{
                                position: "absolute",
                                top: 0, left: 0, right: 0, bottom: 0,
                                background: "linear-gradient(to bottom, #14b8a6, #67e8f9)",
                                transformOrigin: "top",
                                transform: triggered ? "scaleY(1)" : "scaleY(0)",
                                transition: "transform 1.4s ease-in-out 0.2s",
                            }}
                        />
                    </div>

                    {/* Mobile left line */}
                    <div className="md:hidden absolute w-0.5 bg-slate-200" style={{ left: "24px", top: "18px", bottom: "18px" }}>
                        <div
                            style={{
                                position: "absolute",
                                top: 0, left: 0, right: 0, bottom: 0,
                                background: "linear-gradient(to bottom, #14b8a6, #67e8f9)",
                                transformOrigin: "top",
                                transform: triggered ? "scaleY(1)" : "scaleY(0)",
                                transition: "transform 1.4s ease-in-out 0.2s",
                            }}
                        />
                    </div>

                    <div className="space-y-8 md:space-y-10">
                        {steps.map(({ step, icon: Icon, title, desc }, i) => {
                            const isLeft = i % 2 === 0;
                            const delay = i * 250;

                            return (
                                <div key={step} className="relative flex items-center">

                                    {/* ── DESKTOP LAYOUT ── */}
                                    <div className="hidden md:flex w-full items-center">

                                        {/* Left side */}
                                        <div className="flex-1 flex justify-end pr-10">
                                            {isLeft ? (
                                                <StepCard
                                                    step={step} icon={Icon} title={title} desc={desc}
                                                    side="left" triggered={triggered} delay={delay} floatDelay={i * 0.75}
                                                />
                                            ) : <div className="w-[380px]" />}
                                        </div>

                                        {/* Center node */}
                                        <StepNode step={step} triggered={triggered} delay={delay} />

                                        {/* Right side */}
                                        <div className="flex-1 flex justify-start pl-10">
                                            {!isLeft ? (
                                                <StepCard
                                                    step={step} icon={Icon} title={title} desc={desc}
                                                    side="right" triggered={triggered} delay={delay} floatDelay={i * 0.75}
                                                />
                                            ) : <div className="w-[380px]" />}
                                        </div>
                                    </div>

                                    {/* ── MOBILE LAYOUT ── */}
                                    <div className="md:hidden flex w-full items-start pl-16">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                            <StepNode step={step} triggered={triggered} delay={delay} small />
                                        </div>
                                        <StepCard
                                            step={step} icon={Icon} title={title} desc={desc}
                                            side="right" triggered={triggered} delay={delay} floatDelay={i * 0.75}
                                            fullWidth
                                        />
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes iconFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes nodePop {
          0%   { transform: scale(0); }
          65%  { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>
        </section>
    );
}

/* ── Step Node ── */
function StepNode({ step, triggered, delay, small }: { step: string; triggered: boolean; delay: number; small?: boolean }) {
    const size = small ? "w-9 h-9" : "w-12 h-12";
    const text = small ? "text-xs" : "text-sm";
    return (
        <div
            className={`${size} rounded-full bg-teal-500 border-4 border-white shadow-lg shadow-teal-200 flex items-center justify-center z-10 relative flex-shrink-0`}
            style={{
                animation: triggered ? `nodePop 0.4s ease-out forwards` : "none",
                animationDelay: `${delay}ms`,
                opacity: triggered ? 1 : 0,
                transition: `opacity 0.01s ${delay}ms`,
            }}
        >
            <span className={`${text} font-bold text-white`}>{step}</span>
        </div>
    );
}

/* ── Step Card ── */
function StepCard({
    step, icon: Icon, title, desc, side, triggered, delay, floatDelay, fullWidth,
}: {
    step: string;
    icon: LucideIcon;
    title: string;
    desc: string;
    side: "left" | "right";
    triggered: boolean;
    delay: number;
    floatDelay: number;
    fullWidth?: boolean;
}) {
    const fromX = side === "left" ? "-40px" : "40px";

    return (
        <div
            className={`relative bg-white rounded-2xl border border-slate-100 shadow-sm p-5 overflow-hidden ${fullWidth ? "w-full" : "w-[380px]"}`}
            style={{
                opacity: triggered ? 1 : 0,
                transform: triggered ? "translateX(0)" : `translateX(${fromX})`,
                transition: `opacity 0.5s ease-out ${delay}ms, transform 0.5s ease-out ${delay}ms`,
            }}
        >
            {/* Watermark number */}
            <span
                className="absolute font-black text-teal-500 select-none pointer-events-none leading-none"
                style={{
                    fontSize: "120px",
                    opacity: 0.04,
                    bottom: "-20px",
                    right: side === "left" ? "-10px" : "auto",
                    left: side === "right" ? "-10px" : "auto",
                    lineHeight: 1,
                }}
            >
                {step}
            </span>

            {/* Triangle pointer */}
            {!fullWidth && (
                <div
                    className="hidden md:block absolute top-1/2 -translate-y-1/2 w-0 h-0"
                    style={
                        side === "left"
                            ? { right: "-10px", borderTop: "10px solid transparent", borderBottom: "10px solid transparent", borderLeft: "10px solid white" }
                            : { left: "-10px", borderTop: "10px solid transparent", borderBottom: "10px solid transparent", borderRight: "10px solid white" }
                    }
                />
            )}

            {/* Icon */}
            <div
                className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-3"
                style={{
                    animation: triggered ? `iconFloat 3s ease-in-out infinite` : "none",
                    animationDelay: `${floatDelay}s`,
                }}
            >
                <Icon className="w-6 h-6 text-teal-500" strokeWidth={1.6} />
            </div>

            <h3 className="text-[#1a2332] font-bold text-sm mb-1 relative z-10">{title}</h3>
            <p className="text-slate-500 text-xs leading-relaxed relative z-10">{desc}</p>
        </div>
    );
}
