import Link from "next/link";
import { ArrowRight } from "lucide-react";

function Badge({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-[#14D7B4] text-xs font-semibold tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#14D7B4] animate-pulse" />
            {children}
        </span>
    );
}

export default function PopularTests() {
    return (
        <section className="py-24 px-6 lg:px-16">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
                    <div>
                        <Badge>Popular tests</Badge>
                        <h2
                            className="text-3xl font-semibold mt-4 tracking-tight"
                            style={{ fontFamily: "'Instrument Serif', serif" }}
                        >
                            Most booked at our lab
                        </h2>
                    </div>
                    <Link
                        href="/tests"
                        className="flex items-center gap-1.5 text-[#14D7B4] text-sm font-medium hover:gap-2.5 transition-all"
                    >
                        View all tests <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        { name: "Complete Blood Count (CBC)", price: "₹299", time: "24 hrs", tag: "Most Popular" },
                        { name: "Lipid Profile", price: "₹499", time: "24 hrs", tag: "Heart Health" },
                        { name: "HbA1c (Diabetes)", price: "₹349", time: "24 hrs", tag: "Diabetes" },
                        { name: "Thyroid Panel (T3, T4, TSH)", price: "₹599", time: "24 hrs", tag: "Thyroid" },
                        { name: "Vitamin D Total", price: "₹799", time: "48 hrs", tag: "Vitamins" },
                        { name: "Liver Function Test (LFT)", price: "₹449", time: "24 hrs", tag: "Liver" },
                    ].map(({ name, price, time, tag }) => (
                        <div
                            key={name}
                            className="group flex items-center justify-between bg-white/[0.03] border border-white/8 rounded-2xl px-5 py-4 hover:border-[#14D7B4]/30 hover:bg-white/[0.05] transition-all duration-300 cursor-pointer"
                        >
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] text-[#14D7B4] bg-[#14D7B4]/10 border border-[#14D7B4]/20 px-2 py-0.5 rounded-full font-medium">
                                        {tag}
                                    </span>
                                </div>
                                <p className="text-white text-sm font-medium">{name}</p>
                                <p className="text-[#556677] text-xs mt-0.5">Report in {time}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[#14D7B4] font-bold text-base">{price}</p>
                                <p className="text-[#445566] text-xs mt-1 group-hover:text-[#14D7B4] transition-colors flex items-center gap-1 justify-end">
                                    Book <ArrowRight className="w-3 h-3" />
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
