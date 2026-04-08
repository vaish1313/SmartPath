"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { User, QrCode, Barcode, FlaskConical, FileText, BadgeCheck, Phone } from "lucide-react";

function Badge({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-4 py-1.5 text-teal-700 text-xs font-semibold tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            {children}
        </span>
    );
}

const LEFT_LABELS = [
    { icon: User, title: "Patient Details", desc: "Name, age, gender & referring doctor info", topPct: 20 },
    { icon: FlaskConical, title: "Test Results", desc: "Biochemistry values with reference ranges", topPct: 44 },
    { icon: FileText, title: "Interpretation", desc: "Desirable vs borderline vs high levels table", topPct: 65 },
    { icon: BadgeCheck, title: "Doctor Signatures", desc: "Signed by pathologist & lab technician", topPct: 83 },
];

const RIGHT_LABELS = [
    { icon: BadgeCheck, title: "NABL Certified", desc: "ISO & IAF accredited diagnostic center", topPct: 7 },
    { icon: QrCode, title: "Dynamic QR Code", desc: "Instant soft copy download & tamper-proof", topPct: 26 },
    { icon: Barcode, title: "Bar Code", desc: "Unique barcode for instant sample tracking", topPct: 44 },
    { icon: Phone, title: "Contact Info", desc: "24/7 emergency service & online booking", topPct: 91 },
];

export default function ReportShowcase() {
    const [visible, setVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { threshold: 0.1 }
        );
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);

    return (
        <section className="relative py-20 bg-gradient-to-b from-slate-50 via-white to-teal-50/20 overflow-hidden">
            {/* Glow orbs */}
            <div className="absolute top-1/4 left-0 w-[500px] h-[500px] rounded-full bg-teal-400 opacity-[0.05] blur-[130px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-cyan-400 opacity-[0.04] blur-[110px] pointer-events-none" />

            {/* Heading */}
            <div className="text-center mb-14 px-6 relative z-10">
                <Badge>Lab Reports</Badge>
                <h2
                    className="text-[clamp(2rem,4vw,3rem)] font-bold mt-5 tracking-tight text-[#1a2332]"
                    style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                    Professional, certified reports
                    <br />
                    <span className="text-teal-600">delivered digitally.</span>
                </h2>
                <p className="text-slate-500 max-w-xl mx-auto text-base mt-4">
                    Every report from Prathamesh Advanced Diagnostic Center is NABL-certified,
                    digitally signed, and available for instant download.
                </p>
            </div>

            {/* ── Desktop layout: full-width 3-column ── */}
            <div
                ref={ref}
                className="hidden lg:flex items-stretch justify-center w-full px-6 xl:px-10 relative z-10"
                style={{ minHeight: "90vh" }}
            >
                {/* Left labels column */}
                <div className="flex-1 relative">
                    {LEFT_LABELS.map((l, i) => (
                        <div
                            key={l.title}
                            className="absolute right-0 flex items-center"
                            style={{ top: `${l.topPct}%`, transform: "translateY(-50%)" }}
                        >
                            <div
                                className="bg-white border border-slate-100 rounded-2xl shadow-md px-5 py-4 w-64 xl:w-72 text-right"
                                style={{
                                    opacity: visible ? 1 : 0,
                                    transform: visible ? "translateX(0)" : "translateX(20px)",
                                    transition: `opacity 0.5s ease ${i * 130}ms, transform 0.5s ease ${i * 130}ms`,
                                }}
                            >
                                <div className="flex items-center gap-2 mb-1 justify-end">
                                    <l.icon className="w-4 h-4 text-teal-500 shrink-0" strokeWidth={1.8} />
                                    <span className="text-slate-800 text-sm font-bold">{l.title}</span>
                                </div>
                                <p className="text-slate-400 text-xs leading-snug">{l.desc}</p>
                            </div>
                            {/* Connector */}
                            <div className="flex items-center ml-2 shrink-0">
                                <div className="h-px w-8 bg-slate-300" />
                                <div className="w-2.5 h-2.5 rounded-full bg-teal-500 border-2 border-white shadow-sm shrink-0" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Report image — takes 44% of viewport width */}
                <div
                    className="shrink-0 relative"
                    style={{
                        width: "44vw",
                        maxWidth: "680px",
                        opacity: visible ? 1 : 0,
                        transform: visible ? "translateY(0) scale(1)" : "translateY(28px) scale(0.97)",
                        transition: "opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s",
                    }}
                >
                    {/* Glow behind */}
                    <div className="absolute inset-0 rounded-3xl bg-teal-400 opacity-[0.07] blur-3xl scale-105 pointer-events-none" />
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/60 h-full">
                        <Image
                            src="/images/lab_report.png"
                            alt="Prathamesh Advanced Diagnostic Center Lab Report"
                            width={680}
                            height={1020}
                            className="w-full h-full object-cover object-top block"
                            priority
                        />
                    </div>
                </div>

                {/* Right labels column */}
                <div className="flex-1 relative">
                    {RIGHT_LABELS.map((l, i) => (
                        <div
                            key={l.title}
                            className="absolute left-0 flex items-center"
                            style={{ top: `${l.topPct}%`, transform: "translateY(-50%)" }}
                        >
                            {/* Connector */}
                            <div className="flex items-center mr-2 shrink-0">
                                <div className="w-2.5 h-2.5 rounded-full bg-teal-500 border-2 border-white shadow-sm shrink-0" />
                                <div className="h-px w-8 bg-slate-300" />
                            </div>
                            <div
                                className="bg-white border border-slate-100 rounded-2xl shadow-md px-5 py-4 w-64 xl:w-72 text-left"
                                style={{
                                    opacity: visible ? 1 : 0,
                                    transform: visible ? "translateX(0)" : "translateX(-20px)",
                                    transition: `opacity 0.5s ease ${i * 130 + 200}ms, transform 0.5s ease ${i * 130 + 200}ms`,
                                }}
                            >
                                <div className="flex items-center gap-2 mb-1 justify-start">
                                    <l.icon className="w-4 h-4 text-teal-500 shrink-0" strokeWidth={1.8} />
                                    <span className="text-slate-800 text-sm font-bold">{l.title}</span>
                                </div>
                                <p className="text-slate-400 text-xs leading-snug">{l.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Mobile layout ── */}
            <div className="lg:hidden px-4 relative z-10">
                {/* Image — 90% width */}
                <div
                    className="mx-auto relative"
                    style={{
                        width: "90%",
                        opacity: visible ? 1 : 0,
                        transform: visible ? "translateY(0)" : "translateY(20px)",
                        transition: "opacity 0.6s ease, transform 0.6s ease",
                    }}
                >
                    <div className="absolute inset-0 rounded-2xl bg-teal-400 opacity-[0.07] blur-2xl scale-105 pointer-events-none" />
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200/60">
                        <Image
                            src="/images/lab_report.png"
                            alt="Prathamesh Advanced Diagnostic Center Lab Report"
                            width={600}
                            height={900}
                            className="w-full h-auto block"
                            priority
                        />
                    </div>
                </div>

                {/* Labels grid below */}
                <div className="mt-8 grid grid-cols-2 gap-3">
                    {[...LEFT_LABELS, ...RIGHT_LABELS].map((l, i) => (
                        <div
                            key={l.title}
                            className="bg-white border border-slate-100 rounded-xl shadow-sm px-3 py-3"
                            style={{
                                opacity: visible ? 1 : 0,
                                transform: visible ? "translateY(0)" : "translateY(12px)",
                                transition: `opacity 0.4s ease ${i * 70}ms, transform 0.4s ease ${i * 70}ms`,
                            }}
                        >
                            <div className="flex items-center gap-1.5 mb-1">
                                <l.icon className="w-3.5 h-3.5 text-teal-500 shrink-0" strokeWidth={1.8} />
                                <span className="text-slate-800 text-xs font-bold">{l.title}</span>
                            </div>
                            <p className="text-slate-400 text-[10px] leading-snug">{l.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
