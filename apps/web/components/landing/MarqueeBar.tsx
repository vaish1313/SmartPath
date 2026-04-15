"use client";

import { useEffect, useState } from "react";
import { Sparkles, Percent, Gift, Clock, Star, Tag, Zap, Heart, Award, TrendingUp } from "lucide-react";
import { getActiveOffers } from "@/lib/api";

interface Offer {
    _id: string;
    text: string;
    icon: string;
    color: string;
    priority: number;
}

const ICON_MAP: Record<string, any> = {
    Percent,
    Gift,
    Sparkles,
    Clock,
    Star,
    Tag,
    Zap,
    Heart,
    Award,
    TrendingUp,
};

const FALLBACK_OFFERS: Offer[] = [
    { _id: '1', text: "10% OFF on All Blood Tests", icon: "Percent", color: "text-teal-400", priority: 10 },
    { _id: '2', text: "Free Home Collection on Orders Above ₹500", icon: "Gift", color: "text-cyan-400", priority: 9 },
    { _id: '3', text: "Complete Health Checkup Package - ₹999 Only", icon: "Sparkles", color: "text-amber-400", priority: 8 },
    { _id: '4', text: "Same Day Reports Available", icon: "Clock", color: "text-violet-400", priority: 7 },
    { _id: '5', text: "15% OFF on Diabetes Panel", icon: "Star", color: "text-pink-400", priority: 6 },
    { _id: '6', text: "Flat 20% OFF on Cardiac Risk Panel", icon: "Percent", color: "text-emerald-400", priority: 5 },
    { _id: '7', text: "Buy 2 Tests, Get 1 Free on Select Tests", icon: "Gift", color: "text-orange-400", priority: 4 },
    { _id: '8', text: "Women's Health Package - Special Price ₹1499", icon: "Sparkles", color: "text-rose-400", priority: 3 },
    { _id: '9', text: "24/7 Online Booking Available", icon: "Clock", color: "text-blue-400", priority: 2 },
    { _id: '10', text: "Senior Citizen Discount - 25% OFF", icon: "Star", color: "text-indigo-400", priority: 1 },
];

export default function MarqueeBar() {
    const [offers, setOffers] = useState<Offer[]>(FALLBACK_OFFERS);

    useEffect(() => {
        getActiveOffers()
            .then((res) => {
                const fetchedOffers = res.data.offers || [];
                if (fetchedOffers.length > 0) {
                    setOffers(fetchedOffers);
                }
            })
            .catch(() => {
                // Use fallback offers on error
            });
    }, []);

    return (
        <div className="relative py-4 overflow-hidden shadow-lg" style={{ background: "linear-gradient(135deg, #0f172a 0%, #0d2a27 60%, #0f2a2a 100%)" }}>
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none" style={{ background: "linear-gradient(to right, #0f172a, transparent)" }} />
            <div className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none" style={{ background: "linear-gradient(to left, #0f2a2a, transparent)" }} />

            {/* Animated background glow */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
            </div>

            <div className="flex animate-marquee whitespace-nowrap gap-0 relative z-10">
                {[...Array(3)].map((_, ri) =>
                    offers.map((offer) => {
                        const Icon = ICON_MAP[offer.icon] || Percent;
                        return (
                            <span
                                key={`${ri}-${offer._id}`}
                                className="inline-flex items-center gap-3 px-8 text-sm font-bold text-white tracking-wide"
                            >
                                <Icon className={`w-4 h-4 ${offer.color} flex-shrink-0`} strokeWidth={2.5} />
                                <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                                    {offer.text}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-white/40 flex-shrink-0" />
                            </span>
                        );
                    })
                )}
            </div>
        </div>
    );
}
