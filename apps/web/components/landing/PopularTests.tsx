"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

function Badge({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-4 py-1.5 text-teal-700 text-xs font-semibold tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            {children}
        </span>
    );
}

const tests = [
    { name: "Complete Blood Count (CBC)", price: "₹299", time: "24 hrs", tag: "Most Popular" },
    { name: "Lipid Profile", price: "₹499", time: "24 hrs", tag: "Heart Health" },
    { name: "HbA1c (Diabetes)", price: "₹349", time: "24 hrs", tag: "Diabetes" },
    { name: "Thyroid Panel (T3, T4, TSH)", price: "₹599", time: "24 hrs", tag: "Thyroid" },
    { name: "Vitamin D Total", price: "₹799", time: "48 hrs", tag: "Vitamins" },
    { name: "Liver Function Test (LFT)", price: "₹449", time: "24 hrs", tag: "Liver" },
];

export default function PopularTests() {
    const [visible, setVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);

    return (
        <section className="py-24 px-6 lg:px-16 bg-white">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
                    <div>
                        <Badge>Popular tests</Badge>
                        <h2
                            className="text-3xl font-bold mt-4 tracking-tight text-slate-800"
                            style={{ fontFamily: "'Instrument Serif', serif" }}
                        >
                            Most booked at our lab
                        </h2>
                    </div>
                    <Link
                        href="/tests"
                        className="flex items-center gap-1.5 text-teal-600 hover:text-teal-700 text-sm font-semibold transition-all hover:gap-2.5"
                    >
                        View all tests <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div
                    ref={ref}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? "translateY(0)" : "translateY(24px)",
                        transition: "opacity 0.6s ease, transform 0.6s ease",
                    }}
                >
                    {tests.map(({ name, price, time, tag }) => (
                        <div
                            key={name}
                            className="group flex items-center justify-between bg-white border border-slate-100 rounded-2xl px-5 py-4 cursor-pointer shadow-sm"
                            style={{ transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease" }}
                            onMouseEnter={(e) => {
                                const el = e.currentTarget as HTMLDivElement;
                                el.style.transform = "translateY(-3px)";
                                el.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
                                el.style.borderLeft = "3px solid #0d9488";
                            }}
                            onMouseLeave={(e) => {
                                const el = e.currentTarget as HTMLDivElement;
                                el.style.transform = "translateY(0)";
                                el.style.boxShadow = "";
                                el.style.borderLeft = "";
                            }}
                        >
                            <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-[10px] text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full font-semibold">
                                        {tag}
                                    </span>
                                </div>
                                <p className="text-slate-800 text-sm font-semibold">{name}</p>
                                <p className="text-slate-400 text-xs mt-0.5">Report in {time}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-teal-600 font-bold text-base">{price}</p>
                                <p className="text-slate-400 text-xs mt-1 group-hover:text-teal-600 transition-colors flex items-center gap-1 justify-end">
                                    Book{" "}
                                    <ArrowRight
                                        className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-1"
                                    />
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
