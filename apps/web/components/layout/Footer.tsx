import Link from "next/link";
import { FlaskConical, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
    return (
        <>
            {/* Footer */}
            <footer className="py-14 px-6 lg:px-16 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #0f172a 0%, #0d2a27 60%, #0f2a2a 100%)" }}>
                {/* Noise */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />
                {/* Subtle glow */}
                <div className="absolute bottom-0 left-1/3 w-[500px] h-[200px] rounded-full bg-teal-500/10 blur-[100px] pointer-events-none" />

                <div className="relative z-10 max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
                        {/* Brand */}
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
                                    <FlaskConical className="w-4 h-4 text-teal-300" strokeWidth={1.8} />
                                </div>
                                <span className="text-white font-bold text-base">SmartPath</span>
                            </div>
                            <p className="text-teal-200/60 text-sm leading-relaxed max-w-xs mb-5">
                                Prathamesh Advanced Diagnostic Center, Nashik. NABL accredited pathology lab with 24hr digital reports.
                            </p>
                            <div className="space-y-2.5">
                                {[
                                    { icon: Phone, text: "+91 98765 43210" },
                                    { icon: Mail, text: "info@prathameshdiagnostic.in" },
                                    { icon: MapPin, text: "Nashik, Maharashtra" },
                                ].map(({ icon: Icon, text }) => (
                                    <div key={text} className="flex items-center gap-2 text-teal-200/70 text-sm">
                                        <Icon className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                                        <span>{text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick links */}
                        <div>
                            <p className="text-teal-400 text-xs font-bold tracking-widest uppercase mb-4">Quick links</p>
                            <div className="space-y-2.5">
                                {[
                                    { label: "Home", href: "/" },
                                    { label: "Tests", href: "/tests" },
                                    { label: "Book a Test", href: "/register" },
                                    { label: "About Us", href: "/about" },
                                    { label: "Contact", href: "/contact" },
                                ].map(({ label, href }) => (
                                    <Link key={label} href={href}
                                        className="block text-teal-200/60 hover:text-teal-300 text-sm transition-colors">
                                        {label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Patient portal */}
                        <div>
                            <p className="text-teal-400 text-xs font-bold tracking-widest uppercase mb-4">Patient Portal</p>
                            <div className="space-y-2.5">
                                {[
                                    { label: "Sign in", href: "/login" },
                                    { label: "Register", href: "/register" },
                                    { label: "My Reports", href: "/reports" },
                                    { label: "Book Test", href: "/book-test" },
                                    { label: "Track Sample", href: "/bookings" },
                                ].map(({ label, href }) => (
                                    <Link key={label} href={href}
                                        className="block text-teal-200/60 hover:text-teal-300 text-sm transition-colors">
                                        {label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-teal-200/40 text-xs">
                            © 2026 Prathamesh Advanced Diagnostic Center. All rights reserved.
                        </p>
                        <div className="flex gap-6">
                            {["Privacy Policy", "Terms of Service"].map((l) => (
                                <Link key={l} href="#"
                                    className="text-teal-200/40 hover:text-teal-300 text-xs transition-colors">
                                    {l}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>

            <style>{`
              @keyframes cardFloat {
                0%, 100% { transform: rotate(-2deg) translateY(0px); }
                50%       { transform: rotate(-2deg) translateY(-8px); }
              }
            `}</style>
        </>
    );
}
