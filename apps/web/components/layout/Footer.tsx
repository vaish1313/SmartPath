import Link from "next/link";
import { FlaskConical, ArrowRight, Check, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
    return (
        <>
            {/* CTA Banner */}
            <section className="py-16 px-6 lg:px-16">
                <div className="max-w-4xl mx-auto relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0D1F1A] to-[#0A1520] border border-[#14D7B4]/20 p-12 text-center">
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            backgroundImage: "linear-gradient(rgba(20,215,180,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(20,215,180,0.05) 1px,transparent 1px)",
                            backgroundSize: "32px 32px",
                        }}
                    />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] rounded-full bg-[#14D7B4] opacity-[0.07] blur-[80px]" />
                    <div className="relative z-10">
                        <h2
                            className="text-[clamp(1.8rem,4vw,2.8rem)] font-semibold tracking-tight mb-4"
                            style={{ fontFamily: "'Instrument Serif', serif" }}
                        >
                            Start your health journey today.
                        </h2>
                        <p className="text-[#8899AA] mb-8 max-w-md mx-auto">
                            Join thousands of patients who trust Prathamesh Advanced Diagnostic Center for accurate, fast results.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/register"
                                className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#14D7B4] to-[#0EA5E9] text-[#060B14] font-bold text-sm px-8 py-4 rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-[#14D7B4]/20 group"
                            >
                                Create free account
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                            <Link
                                href="/tests"
                                className="flex items-center justify-center gap-2 bg-white/[0.06] border border-white/10 text-white text-sm font-medium px-8 py-4 rounded-2xl hover:bg-white/10 transition-all"
                            >
                                Browse tests
                            </Link>
                        </div>
                        <div className="flex flex-wrap justify-center gap-6 mt-8 text-xs text-[#445566]">
                            {["Free account", "No hidden charges", "NABL certified reports", "24hr support"].map((t) => (
                                <span key={t} className="flex items-center gap-1.5">
                                    <Check className="w-3 h-3 text-[#14D7B4]" />
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/[0.06] py-12 px-6 lg:px-16">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
                        {/* Brand */}
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#14D7B4] to-[#0EA5E9] flex items-center justify-center">
                                    <FlaskConical className="w-4 h-4 text-white" strokeWidth={1.8} />
                                </div>
                                <span className="text-white font-semibold">SmartPath</span>
                            </div>
                            <p className="text-[#556677] text-sm leading-relaxed max-w-xs mb-5">
                                Prathamesh Advanced Diagnostic Center, Nashik. NABL accredited pathology lab with 24hr digital reports.
                            </p>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-[#445566] text-sm">
                                    <Phone className="w-3.5 h-3.5" />
                                    <span>+91 98765 43210</span>
                                </div>
                                <div className="flex items-center gap-2 text-[#445566] text-sm">
                                    <Mail className="w-3.5 h-3.5" />
                                    <span>info@prathameshdiagnostic.in</span>
                                </div>
                                <div className="flex items-center gap-2 text-[#445566] text-sm">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span>Nashik, Maharashtra</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick links */}
                        <div>
                            <p className="text-white text-xs font-semibold tracking-widest uppercase mb-4">Quick links</p>
                            <div className="space-y-2.5">
                                {["Home", "Tests", "Book a Test", "Reports", "About Us", "Contact"].map((l) => (
                                    <Link key={l} href="#" className="block text-[#556677] hover:text-white text-sm transition-colors">
                                        {l}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Patient */}
                        <div>
                            <p className="text-white text-xs font-semibold tracking-widest uppercase mb-4">Patient Portal</p>
                            <div className="space-y-2.5">
                                {["Sign in", "Register", "My Reports", "Book Test", "Track Sample", "Help"].map((l) => (
                                    <Link key={l} href="#" className="block text-[#556677] hover:text-white text-sm transition-colors">
                                        {l}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-[#334455] text-xs">
                            © 2025 Prathamesh Advanced Diagnostic Center. All rights reserved.
                        </p>
                        <div className="flex gap-6">
                            {["Privacy Policy", "Terms of Service"].map((l) => (
                                <Link key={l} href="#" className="text-[#334455] hover:text-[#667788] text-xs transition-colors">
                                    {l}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}
