"use client";

import { useRef, useEffect, useState } from "react";
import { Star } from "lucide-react";
import { getReviews } from "@/lib/api";

interface Review {
    patientName: string;
    rating: number;
    review: string;
    createdAt: string;
}

const FALLBACK_REVIEWS: Review[] = [
    { patientName: "Priya Sharma", rating: 5, review: "Booked a CBC test at 11pm and got my report by noon next day. The portal is incredibly smooth.", createdAt: "" },
    { patientName: "Rahul Deshmukh", rating: 5, review: "I track my HbA1c every 3 months. SmartPath makes it so easy — one click and the report is on my phone.", createdAt: "" },
    { patientName: "Sunita Joshi", rating: 5, review: "Even at my age I could use it easily. The WhatsApp report notification is very convenient.", createdAt: "" },
    { patientName: "Amit Patil", rating: 5, review: "Excellent service. Reports were accurate and delivered on time. Highly recommend SmartPath.", createdAt: "" },
    { patientName: "Meera Kulkarni", rating: 5, review: "The home collection feature is a lifesaver. No more waiting at the lab. Brilliant experience.", createdAt: "" },
];

function Badge({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-4 py-1.5 text-teal-700 text-xs font-semibold tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            {children}
        </span>
    );
}

export default function Testimonials() {
    const trackRef = useRef<HTMLDivElement>(null);
    const [reviews, setReviews] = useState<Review[]>(FALLBACK_REVIEWS);

    useEffect(() => {
        getReviews(30)
            .then((res) => {
                const fetched: Review[] = res.data.reviews || [];
                if (fetched.length > 0) setReviews(fetched);
            })
            .catch(() => { /* keep fallback */ });
    }, []);

    // Duplicate for seamless loop
    const allReviews = reviews.length < 5
        ? [...reviews, ...reviews, ...reviews]
        : [...reviews, ...reviews];

    return (
        <section className="py-24 px-6 lg:px-16 bg-slate-50 overflow-hidden">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-14">
                    <Badge>Patient reviews</Badge>
                    <h2
                        className="text-3xl font-bold mt-5 tracking-tight text-slate-800"
                        style={{ fontFamily: "'Instrument Serif', serif" }}
                    >
                        Trusted by patients across Nashik
                    </h2>
                </div>

                <div
                    className="overflow-hidden"
                    onMouseEnter={() => { if (trackRef.current) trackRef.current.style.animationPlayState = "paused"; }}
                    onMouseLeave={() => { if (trackRef.current) trackRef.current.style.animationPlayState = "running"; }}
                >
                    <div
                        ref={trackRef}
                        className="flex gap-5"
                        style={{ animation: "testimonialScroll 28s linear infinite", width: "max-content" }}
                    >
                        {allReviews.map(({ patientName, rating, review }, i) => (
                            <div
                                key={`${patientName}-${i}`}
                                className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex-shrink-0"
                                style={{ width: "320px" }}
                            >
                                <div className="flex gap-1 mb-4">
                                    {Array(rating).fill(0).map((_, j) => (
                                        <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed mb-5">"{review}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-teal-100 ring-2 ring-teal-400 flex items-center justify-center text-teal-700 font-bold text-sm">
                                        {patientName[0]}
                                    </div>
                                    <div>
                                        <p className="text-slate-800 text-sm font-semibold">{patientName}</p>
                                        <p className="text-slate-400 text-xs">Patient</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes testimonialScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
        </section>
    );
}
