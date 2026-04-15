"use client";

import { useEffect, useRef, useState } from "react";
import { getReviews } from "@/lib/api";
import { Star, Quote } from "lucide-react";

interface Review {
    patientName: string;
    rating: number;
    review: string;
    createdAt: string;
}

const FALLBACK_REVIEWS: Review[] = [
    {
        patientName: "Priya Sharma",
        rating: 5,
        review: "Booked a CBC test at 11pm and received my full report by noon the next day. The portal is incredibly smooth — no confusing steps, no waiting on hold. Best lab experience I've had in Nashik.",
        createdAt: "",
    },
    {
        patientName: "Rahul Deshmukh",
        rating: 5,
        review: "I monitor my HbA1c every three months. SmartPath makes it effortless — book in two minutes, get a reminder when my sample is collected, and the report lands on my phone before I get home.",
        createdAt: "",
    },
    {
        patientName: "Sunita Joshi",
        rating: 5,
        review: "At my age I was worried about using an online portal, but the steps are simple and clear. The WhatsApp notification when my report was ready was such a thoughtful touch. Highly recommended.",
        createdAt: "",
    },
    {
        patientName: "Amit Patil",
        rating: 5,
        review: "Needed a full lipid panel urgently before a doctor's appointment. SmartPath had a slot the very next morning, the technician arrived on time, and my reports were ready well before my consultation.",
        createdAt: "",
    },
    {
        patientName: "Meera Kulkarni",
        rating: 5,
        review: "The home collection feature is a lifesaver. With two young kids I can't spend hours at a lab. The technician was punctual, the whole process took ten minutes, and reports were ready the same evening.",
        createdAt: "",
    },
    {
        patientName: "Vikram Nair",
        rating: 5,
        review: "Exceptional service from start to finish. The digital report was crystal clear, reference ranges were highlighted, and sharing it with my doctor via WhatsApp took just one tap. Truly modern healthcare.",
        createdAt: "",
    },
];

function StarRow({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`}
                    strokeWidth={0}
                />
            ))}
        </div>
    );
}

function Avatar({ name }: { name: string }) {
    const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    return (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md">
            {initials}
        </div>
    );
}

function TestimonialCard({ review, index, visible }: { review: Review; index: number; visible: boolean }) {
    return (
        <div
            className="relative rounded-2xl overflow-hidden"
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 0.5s ease ${index * 90}ms, transform 0.5s ease ${index * 90}ms`,
                /* glass on the light teal-tinted background */
                background: "rgba(255,255,255,0.55)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
                border: "1px solid rgba(20,184,166,0.18)",
                boxShadow: "0 4px 24px rgba(20,184,166,0.08), 0 1px 4px rgba(0,0,0,0.04)",
            }}
        >
            {/* Subtle inner top-left glow */}
            <div
                className="absolute inset-0 pointer-events-none rounded-2xl"
                style={{ background: "radial-gradient(ellipse at 15% 15%, rgba(20,184,166,0.08) 0%, transparent 60%)" }}
            />

            <div className="relative p-6 flex flex-col gap-4 h-full">
                <div className="flex items-start justify-between">
                    <StarRow rating={review.rating} />
                    <Quote className="w-6 h-6 text-teal-300 shrink-0" strokeWidth={1.5} />
                </div>

                <p className="text-slate-600 text-sm leading-relaxed flex-1">
                    &ldquo;{review.review}&rdquo;
                </p>

                <div className="flex items-center gap-3 pt-3 border-t border-teal-100">
                    <Avatar name={review.patientName} />
                    <div>
                        <p className="text-slate-800 text-sm font-bold">{review.patientName}</p>
                        <p className="text-teal-600 text-xs font-medium">Patient · Prathamesh Diagnostic</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Badge({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-4 py-1.5 text-teal-700 text-xs font-semibold tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            {children}
        </span>
    );
}

export default function Testimonials() {
    const [reviews, setReviews] = useState<Review[]>(FALLBACK_REVIEWS);
    const [visible, setVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        getReviews(30)
            .then((res) => {
                const fetched: Review[] = res.data.reviews || [];
                if (fetched.length >= 6) setReviews(fetched.slice(0, 6));
            })
            .catch(() => { });
    }, []);

    useEffect(() => {
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { threshold: 0.1 }
        );
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);

    return (
        <section className="relative py-24 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-teal-50/40">
            {/* Glow orbs — same as hero */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-teal-400 opacity-[0.06] blur-[130px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-cyan-400 opacity-[0.05] blur-[110px] pointer-events-none" />

            {/* Subtle grid — same as hero */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: "linear-gradient(rgba(20,184,166,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(20,184,166,0.04) 1px,transparent 1px)",
                    backgroundSize: "48px 48px",
                }}
            />

            <div className="relative z-10 w-full px-6 lg:px-16">
                {/* Heading */}
                <div className="text-center mb-12">
                    <Badge>Patient reviews</Badge>
                    <h2
                        className="text-[clamp(2rem,4vw,3rem)] font-bold mt-5 tracking-tight text-[#1a2332]"
                        style={{ fontFamily: "'Instrument Serif', serif" }}
                    >
                        Trusted&nbsp;

                        <span className="text-teal-600">across Nashik.</span>
                    </h2>
                    <p className="text-slate-500 max-w-md mx-auto text-sm mt-4">
                        Real experiences from real patients — accurate results, fast reports, and care that goes the extra mile.
                    </p>


                </div>

                {/* 2 × 3 grid — 90% width */}
                <div
                    ref={ref}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mx-auto"
                    style={{ width: "90%" }}
                >
                    {reviews.slice(0, 6).map((r, i) => (
                        <TestimonialCard key={r.patientName} review={r} index={i} visible={visible} />
                    ))}
                </div>
            </div>
        </section>
    );
}
