function Badge({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-[#14D7B4] text-xs font-semibold tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#14D7B4] animate-pulse" />
            {children}
        </span>
    );
}

export default function HowItWorks() {
    return (
        <section className="py-24 px-6 lg:px-16 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-[#0EA5E9] opacity-[0.04] blur-[100px]" />
            </div>
            <div className="max-w-5xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <Badge>How it works</Badge>
                    <h2
                        className="text-[clamp(2rem,4vw,3rem)] font-semibold mt-5 tracking-tight"
                        style={{ fontFamily: "'Instrument Serif', serif" }}
                    >
                        From booking to report
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#14D7B4] to-[#0EA5E9]">
                            in 4 simple steps.
                        </span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                    {/* Connector line */}
                    <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-[#14D7B4]/20 via-[#0EA5E9]/40 to-[#14D7B4]/20" />

                    {[
                        { step: "01", title: "Create account", desc: "Register with email or Google in under 2 minutes." },
                        { step: "02", title: "Book your test", desc: "Choose from 200+ tests and pick a convenient slot." },
                        { step: "03", title: "Give sample", desc: "Visit the lab or opt for home collection." },
                        { step: "04", title: "Get report", desc: "Download your certified PDF report digitally." },
                    ].map(({ step, title, desc }) => (
                        <div key={step} className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#14D7B4]/20 to-[#0EA5E9]/10 border border-[#14D7B4]/20 flex items-center justify-center mb-4 relative z-10">
                                <span
                                    className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-br from-[#14D7B4] to-[#0EA5E9]"
                                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                                >
                                    {step}
                                </span>
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
