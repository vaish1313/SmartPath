"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Upload, X, CalendarCheck, ScanLine, FileText, Bell, ShieldCheck, Clock } from "lucide-react";
import Link from "next/link";
import type { FeatureCard } from "@/components/ui/card-carousel";

const CardCarousel = dynamic(
    () => import("@/components/ui/card-carousel").then((m) => m.CardCarousel),
    { ssr: false }
);

function Badge({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-4 py-1.5 text-teal-700 text-xs font-semibold tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            {children}
        </span>
    );
}

const featureCards: FeatureCard[] = [
    {
        icon: Upload,
        title: "Upload Prescription & Book Instantly",
        desc: "AI reads your prescription and auto-selects the right tests. No manual searching — just upload and confirm.",
        accent: "teal",
        stat: "< 5s",
        statLabel: "avg. scan time",
        highlight: true,
    },
    {
        icon: CalendarCheck,
        title: "Online Test Booking",
        desc: "Select from 200+ tests, pick a time slot, and book from home. No queues, no calls.",
        accent: "teal",
        stat: "200+",
        statLabel: "tests available",
    },
    {
        icon: ScanLine,
        title: "Live Sample Tracking",
        desc: "Track your sample from collection to processing in real time with QR-based status updates.",
        accent: "cyan",
        stat: "100%",
        statLabel: "real-time visibility",
    },
    {
        icon: FileText,
        title: "Digital Reports",
        desc: "Download NABL-certified PDF reports instantly. Share with your doctor in one click.",
        accent: "violet",
        stat: "24hr",
        statLabel: "report delivery",
    },
    {
        icon: Bell,
        title: "Smart Alerts",
        desc: "Get SMS and email notifications when your report is ready or your sample is processed.",
        accent: "amber",
        stat: "2-step",
        statLabel: "instant notify",
    },
    {
        icon: ShieldCheck,
        title: "Secure & Private",
        desc: "Your health data is encrypted and stored securely. Only you can access your records.",
        accent: "blue",
        stat: "256-bit",
        statLabel: "encryption",
    },
    {
        icon: Clock,
        title: "24hr Turnaround",
        desc: "Most tests are processed and reported within 24 hours of sample collection.",
        accent: "rose",
        stat: "24hr",
        statLabel: "avg. turnaround",
    },
];

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
                        className="flex-1 flex items-center justify-center bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-sm rounded-xl py-2.5 transition-all shadow-md shadow-slate-300">
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
    const [showModal, setShowModal] = useState(false);

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

                <CardCarousel
                    cards={featureCards}
                    autoplayDelay={2000}
                    showPagination={true}
                    showNavigation={true}
                    onHighlightClick={() => setShowModal(true)}
                />
            </div>
        </section>
    );
}
