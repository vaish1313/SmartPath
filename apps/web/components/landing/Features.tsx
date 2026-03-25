import { CalendarCheck, ScanLine, FileText, Bell, ShieldCheck, Clock } from "lucide-react";

function Badge({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-[#14D7B4] text-xs font-semibold tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#14D7B4] animate-pulse" />
            {children}
        </span>
    );
}

export default function Features() {
    return (
        <section className="py-24 px-6 lg:px-16">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <Badge>Why SmartPath</Badge>
                    <h2
                        className="text-[clamp(2rem,4vw,3rem)] font-semibold mt-5 mb-4 tracking-tight"
                        style={{ fontFamily: "'Instrument Serif', serif" }}
                    >
                        Everything your lab visit needs,
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#14D7B4] to-[#0EA5E9]">
                            without the wait.
                        </span>
                    </h2>
                    <p className="text-[#778899] max-w-xl mx-auto">
                        A modern patient portal built for Prathamesh Diagnostic — from booking to report, fully digital.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        { icon: CalendarCheck, title: "Online Test Booking", desc: "Select from 200+ tests, pick a time slot, and book from home. No queues, no calls.", accent: "#14D7B4" },
                        { icon: ScanLine, title: "Live Sample Tracking", desc: "Track your sample from collection to processing in real time with QR-based status.", accent: "#0EA5E9" },
                        { icon: FileText, title: "Digital Reports", desc: "Download NABL-certified PDF reports instantly. Share with your doctor in one click.", accent: "#8B5CF6" },
                        { icon: Bell, title: "Smart Alerts", desc: "Get SMS and email notifications when your report is ready or sample is processed.", accent: "#F59E0B" },
                        { icon: ShieldCheck, title: "Secure & Private", desc: "Your health data is encrypted and stored securely. Only you can access your records.", accent: "#14D7B4" },
                        { icon: Clock, title: "24hr Turnaround", desc: "Most tests are processed and reported within 24 hours of sample collection.", accent: "#0EA5E9" },
                    ].map(({ icon: Icon, title, desc, accent }) => (
                        <div
                            key={title}
                            className="group bg-white/[0.03] border border-white/8 rounded-2xl p-6 hover:border-white/16 hover:bg-white/[0.05] transition-all duration-300"
                        >
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                                style={{ background: `${accent}15` }}
                            >
                                <Icon className="w-5 h-5" style={{ color: accent }} strokeWidth={1.8} />
                            </div>
                            <h3 className="text-white font-semibold text-base mb-2">{title}</h3>
                            <p className="text-[#667788] text-sm leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
