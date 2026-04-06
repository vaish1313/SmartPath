"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarCheck, ScanLine, FileText, Bell, ShieldCheck, Clock, Upload, X } from "lucide-react";
import Link from "next/link";

function Badge({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-4 py-1.5 text-teal-700 text-xs font-semibold tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            {children}
        </span>
    );
}

const features = [
    { icon: CalendarCheck, title: "Online Test Booking", desc: "Select from 200+ tests, pick a time slot, and book from home. No queues, no calls.", accent: "teal" },
    { icon: ScanLine, title: "Live Sample Tracking", desc: "Track your sample from collection to processing in real time with QR-based status.", accent: "cyan" },
    { icon: FileText, title: "Digital Reports", desc: "Download NABL-certified PDF reports instantly. Share with your doctor in one click.", accent: "violet" },
    { icon: Bell, title: "Smart Alerts", desc: "Get SMS and email notifications when your report is ready or sample is processed.", accent: "amber" },
    { icon: ShieldCheck, title: "Secure & Private", desc: "Your health data is encrypted and stored securely. Only you can access your records.", accent: "teal" },
    { icon: Clock, title: "24hr Turnaround", desc: "Most tests are processed and reported within 24 hours of sample collection.", accent: "cyan" },
];

const accentMap: Record<string, { icon: string; bg: string; bigBg: string }> = {
    teal: { icon: "text-teal-600", bg: "bg-teal-50", bigBg: "bg-teal-50" },
    cyan: { icon: "text-cyan-600", bg: "bg-cyan-50", bigBg: "bg-cyan-50" },
    violet: { icon: "text-violet-600", bg: "bg-violet-50", bigBg: "bg-violet-50" },
    amber: { icon: "text-amber-600", bg: "bg-amber-50", bigBg: "bg-amber-50" },
};

function PrescriptionModal({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-5 h-5" />
                </button>
                <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
                    <Upload className="w-6 h-6 text-teal-600" strokeWidth={1.8} />
                </div>
                <h2 className="text-lg font-bold text-slate-800 mb-2">Upload Your Prescription</h2>
                <p className="text-slate-500 text-sm mb-6">To use this feature, you need a SmartPath account.</p>
                <div className="flex gap-3">
                    <Link href="/register"
                        className="flex-1 flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl py-2.5 transition-all shadow-md shadow-teal-200">
                        Create Account
                    </Link>
                    <Link href="/login"
                        className="flex-1 flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl py-2.5 transition-all">
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function Features() {
    const [visible, setVisible] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);

    return (
        <section className="py-24 px-6 lg:px-16 bg-white">
            {showModal && <PrescriptionModal onClose={() => setShowModal(false)} />}
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <Badge>Why SmartPath</Badge>
                    <h2
                        className="text-[clamp(2rem,4vw,3rem)] font-bold mt-5 mb-4 tracking-tight text-[#1a2332]"
                        style={{ fontFamily: "'Instrument Serif', serif" }}
                    >
                        Everything your lab visit needs,
                        <br />
                        <span className="text-teal-600">without the wait.</span>
                    </h2>
                    <p className="text-slate-500 max-w-xl mx-auto text-base">
                        A modern patient portal built for Prathamesh Diagnostic — from booking to report, fully digital.
                    </p>
                </div>

                <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Prescription upload — highlighted card */}
                    <button
                        onClick={() => setShowModal(true)}
                        className="group rounded-2xl overflow-hidden border-2 border-teal-400 shadow-md flex flex-col bg-gradient-to-br from-teal-600 to-cyan-600 text-left cursor-pointer"
                        style={{
                            transition: "transform 0.3s ease, box-shadow 0.3s ease, opacity 0.5s ease, translate 0.5s ease",
                            opacity: visible ? 1 : 0,
                            translate: visible ? "0 0" : "0 28px",
                            transitionDelay: "0ms",
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-4px)";
                            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 16px 40px rgba(20,184,166,0.35)";
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                            (e.currentTarget as HTMLButtonElement).style.boxShadow = "";
                        }}
                    >
                        <div className="relative h-44 w-full flex items-center justify-center bg-white/10">
                            <div className="w-20 h-20 rounded-3xl flex items-center justify-center bg-white/20 group-hover:scale-110 transition-transform duration-300">
                                <Upload className="w-10 h-10 text-white" strokeWidth={1.5} />
                            </div>
                            <div className="absolute top-3 right-3 bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider uppercase">
                                AI Powered
                            </div>
                        </div>
                        <div className="p-5 flex flex-col gap-2 flex-1">
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/20">
                                    <Upload className="w-3.5 h-3.5 text-white" strokeWidth={1.8} />
                                </div>
                                <h3 className="text-white font-semibold text-sm">Upload Prescription & Book Instantly</h3>
                            </div>
                            <p className="text-teal-100 text-sm leading-relaxed">AI reads your prescription and auto-selects tests</p>
                        </div>
                    </button>

                    {features.map(({ icon: Icon, title, desc, accent }, i) => {
                        const a = accentMap[accent];
                        return (
                            <div
                                key={title}
                                className="group rounded-2xl overflow-hidden border border-slate-100 shadow-sm flex flex-col bg-white"
                                style={{
                                    transition: "transform 0.3s ease, box-shadow 0.3s ease, opacity 0.5s ease, translate 0.5s ease",
                                    opacity: visible ? 1 : 0,
                                    translate: visible ? "0 0" : "0 28px",
                                    transitionDelay: `${(i + 1) * 150}ms`,
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 32px rgba(0,0,0,0.10)";
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                                    (e.currentTarget as HTMLDivElement).style.boxShadow = "";
                                }}
                            >
                                <div className={`relative h-44 w-full flex items-center justify-center ${a.bigBg}`}>
                                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${a.bg} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon className={`w-10 h-10 ${a.icon}`} strokeWidth={1.5} />
                                    </div>
                                    <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white/60 to-transparent" />
                                </div>
                                <div className="p-5 flex flex-col gap-2 flex-1">
                                    <div className="flex items-center gap-2.5">
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${a.bg}`}>
                                            <Icon className={`w-3.5 h-3.5 ${a.icon}`} strokeWidth={1.8} />
                                        </div>
                                        <h3 className="text-[#1a2332] font-semibold text-sm">{title}</h3>
                                    </div>
                                    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
