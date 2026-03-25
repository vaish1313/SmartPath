import { Star } from "lucide-react";

function Badge({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-[#14D7B4] text-xs font-semibold tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#14D7B4] animate-pulse" />
            {children}
        </span>
    );
}

export default function Testimonials() {
    return (
        <section className="py-24 px-6 lg:px-16">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-14">
                    <Badge>Patient reviews</Badge>
                    <h2
                        className="text-3xl font-semibold mt-5 tracking-tight"
                        style={{ fontFamily: "'Instrument Serif', serif" }}
                    >
                        Trusted by patients across Nashik
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[
                        { name: "Priya Sharma", role: "Patient", review: "Booked a CBC test at 11pm and got my report by noon next day. The portal is incredibly smooth.", rating: 5 },
                        { name: "Rahul Deshmukh", role: "Diabetic patient", review: "I track my HbA1c every 3 months. SmartPath makes it so easy — one click and the report is on my phone.", rating: 5 },
                        { name: "Sunita Joshi", role: "Senior patient", review: "Even at my age I could use it easily. The WhatsApp report notification is very convenient.", rating: 5 },
                    ].map(({ name, role, review, rating }) => (
                        <div key={name} className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
                            <div className="flex gap-1 mb-4">
                                {Array(rating).fill(0).map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                                ))}
                            </div>
                            <p className="text-[#AABBCC] text-sm leading-relaxed mb-5">"{review}"</p>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#14D7B4]/30 to-[#0EA5E9]/20 flex items-center justify-center text-[#14D7B4] font-bold text-sm">
                                    {name[0]}
                                </div>
                                <div>
                                    <p className="text-white text-sm font-medium">{name}</p>
                                    <p className="text-[#556677] text-xs">{role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
