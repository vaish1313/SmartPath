import Link from "next/link";
import { FlaskConical, ArrowRight, Check, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
    return (
        <>
            {/* CTA Banner */}
            <section className="py-16 px-6 lg:px-16 bg-white">
                <div className="max-w-5xl mx-auto relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 to-cyan-600 shadow-xl shadow-teal-200">
                    {/* Mesh */}
                    <div className="absolute inset-0 pointer-events-none opacity-10"
                        style={{
                            backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.15) 1px,transparent 1px)",
                            backgroundSize: "32px 32px",
                        }}
                    />
                    {/* Pulsing glow orb */}
                    <div
                        className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] rounded-full bg-white/20 blur-[60px] pointer-events-none"
                        style={{ animation: "ctaGlow 3s ease-in-out infinite" }}
                    />
                    {/* Moving radial highlight */}
                    <div
                        className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-cyan-400/20 blur-[80px] pointer-events-none"
                        style={{ animation: "ctaFloat 6s ease-in-out infinite" }}
                    />

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-0">
                        {/* LEFT — text content */}
                        <div className="p-10 lg:p-12 flex flex-col justify-center">
                            <h2
                                className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold tracking-tight text-white mb-4 text-left"
                                style={{ fontFamily: "'Instrument Serif', serif" }}
                            >
                                Start your health journey today.
                            </h2>
                            <p className="text-teal-100 mb-8 text-base text-left">
                                Join thousands of patients who trust Prathamesh Advanced Diagnostic Center for accurate, fast results.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    href="/register"
                                    className="flex items-center justify-center gap-2 bg-white text-teal-700 font-bold text-sm px-8 py-4 rounded-2xl hover:bg-teal-50 transition-all shadow-lg group"
                                >
                                    Create free account
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                                </Link>
                                <Link
                                    href="/tests"
                                    className="flex items-center justify-center gap-2 bg-white/20 border border-white/30 text-white text-sm font-semibold px-8 py-4 rounded-2xl hover:bg-white/30 transition-all"
                                >
                                    Browse tests
                                </Link>
                            </div>
                            <div className="flex flex-wrap gap-5 mt-7 text-xs text-teal-100">
                                {["Free account", "No hidden charges", "NABL certified reports", "24hr support"].map((t) => (
                                    <span key={t} className="flex items-center gap-1.5">
                                        <Check className="w-3 h-3 text-white" />
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT — floating report card mockup */}
                        <div className="hidden lg:flex items-center justify-center p-10 bg-white rounded-r-3xl">
                            <div
                                style={{
                                    animation: "cardFloat 4s ease-in-out infinite",
                                    transform: "rotate(-2deg)",
                                    boxShadow: "0 20px 60px rgba(20,184,166,0.25)",
                                    borderRadius: "16px",
                                    width: "300px",
                                }}
                            >
                                <div className="bg-white rounded-2xl overflow-hidden">
                                    {/* Card header */}
                                    <div className="px-5 pt-5 pb-4 border-b border-slate-100">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Test Report</span>
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                Ready ✓
                                            </span>
                                        </div>
                                        <p className="text-slate-800 font-bold text-base leading-tight">Rahul Deshmukh</p>
                                        <p className="text-slate-500 text-sm mt-0.5">Complete Blood Count (CBC)</p>
                                        <p className="text-slate-400 text-xs mt-1">30 Mar 2026</p>
                                    </div>
                                    {/* Card footer */}
                                    <div className="px-5 py-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-teal-600">
                                            <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center">
                                                <ArrowRight className="w-3.5 h-3.5 rotate-90" />
                                            </div>
                                            <span className="text-xs font-semibold">Download PDF</span>
                                        </div>
                                        <button className="text-xs font-bold text-teal-600 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                                            View Report <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-100 bg-slate-50 py-12 px-6 lg:px-16">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
                        {/* Brand */}
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-md">
                                    <FlaskConical className="w-4 h-4 text-white" strokeWidth={1.8} />
                                </div>
                                <span className="text-slate-800 font-bold text-base">SmartPath</span>
                            </div>
                            <p className="text-slate-500 text-sm leading-relaxed max-w-xs mb-5">
                                Prathamesh Advanced Diagnostic Center, Nashik. NABL accredited pathology lab with 24hr digital reports.
                            </p>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-slate-500 text-sm">
                                    <Phone className="w-3.5 h-3.5 text-teal-500" />
                                    <span>+91 98765 43210</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 text-sm">
                                    <Mail className="w-3.5 h-3.5 text-teal-500" />
                                    <span>info@prathameshdiagnostic.in</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 text-sm">
                                    <MapPin className="w-3.5 h-3.5 text-teal-500" />
                                    <span>Nashik, Maharashtra</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick links */}
                        <div>
                            <p className="text-slate-800 text-xs font-bold tracking-widest uppercase mb-4">Quick links</p>
                            <div className="space-y-2.5">
                                {["Home", "Tests", "Book a Test", "Reports", "About Us", "Contact"].map((l) => (
                                    <Link key={l} href="#" className="block text-slate-500 hover:text-teal-600 text-sm transition-colors">
                                        {l}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Patient */}
                        <div>
                            <p className="text-slate-800 text-xs font-bold tracking-widest uppercase mb-4">Patient Portal</p>
                            <div className="space-y-2.5">
                                {["Sign in", "Register", "My Reports", "Book Test", "Track Sample", "Help"].map((l) => (
                                    <Link key={l} href="#" className="block text-slate-500 hover:text-teal-600 text-sm transition-colors">
                                        {l}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-slate-400 text-xs">
                            © 2026 Prathamesh Advanced Diagnostic Center. All rights reserved.
                        </p>
                        <div className="flex gap-6">
                            {["Privacy Policy", "Terms of Service"].map((l) => (
                                <Link key={l} href="#" className="text-slate-400 hover:text-slate-600 text-xs transition-colors">
                                    {l}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>

            <style>{`
              @keyframes ctaGlow {
                0%, 100% { opacity: 0.15; transform: translate(-50%, -50%) scale(1); }
                50%       { opacity: 0.30; transform: translate(-50%, -50%) scale(1.15); }
              }
              @keyframes ctaFloat {
                0%, 100% { transform: translate(0, 0); }
                50%       { transform: translate(-20px, 20px); }
              }
              @keyframes cardFloat {
                0%, 100% { transform: rotate(-2deg) translateY(0px); }
                50%       { transform: rotate(-2deg) translateY(-8px); }
              }
            `}</style>
        </>
    );
}
