"use client";

import { useEffect, useState } from "react";
import { Users, CalendarCheck, FileText, IndianRupee, Loader2, TrendingUp } from "lucide-react";
import { getDashboardStats } from "@/lib/api";

interface Stats {
    totalBookings: number;
    todayBookings: number;
    pendingResults: number;
    monthRevenue: number;
    monthPatients: number;
}

function fmt(v: number) {
    if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
    if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`;
    return `₹${v}`;
}

interface CardProps {
    label: string;
    value: string | number | null;
    icon: React.ElementType;
    iconClass: string;
    bgGlow: string;
    sub: string;
    badge?: string;
}

function StatCard({ label, value, icon: Icon, iconClass, bgGlow, sub, badge }: CardProps) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-[0.08] pointer-events-none ${bgGlow}`} />
            <div className="flex items-center justify-between mb-3">
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide">{label}</span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconClass}`}>
                    <Icon className="w-4 h-4" strokeWidth={1.8} />
                </div>
            </div>
            {value === null ? (
                <Loader2 className="w-5 h-5 text-slate-300 animate-spin" />
            ) : (
                <p className="text-2xl font-bold text-slate-800">{value}</p>
            )}
            <div className="flex items-center justify-between mt-1">
                <p className="text-slate-400 text-xs">{sub}</p>
                {badge && (
                    <span className="flex items-center gap-0.5 text-[10px] font-semibold text-teal-600 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full">
                        <TrendingUp className="w-2.5 h-2.5" />{badge}
                    </span>
                )}
            </div>
        </div>
    );
}

export default function AdminStatsRow() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDashboardStats()
            .then((res) => setStats(res.data.stats))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const cards: CardProps[] = [
        {
            label: "Patients This Month",
            value: loading ? null : stats?.monthPatients ?? 0,
            icon: Users,
            iconClass: "bg-teal-50 text-teal-600",
            bgGlow: "bg-teal-400",
            sub: "unique patients",
        },
        {
            label: "Bookings Today",
            value: loading ? null : stats?.todayBookings ?? 0,
            icon: CalendarCheck,
            iconClass: "bg-cyan-50 text-cyan-600",
            bgGlow: "bg-cyan-400",
            sub: `${stats?.totalBookings ?? 0} total`,
        },
        {
            label: "Reports Pending",
            value: loading ? null : stats?.pendingResults ?? 0,
            icon: FileText,
            iconClass: "bg-amber-50 text-amber-600",
            bgGlow: "bg-amber-400",
            sub: "awaiting approval",
        },
        {
            label: "Revenue (Month)",
            value: loading ? null : fmt(stats?.monthRevenue ?? 0),
            icon: IndianRupee,
            iconClass: "bg-violet-50 text-violet-600",
            bgGlow: "bg-violet-400",
            sub: "paid invoices",
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => <StatCard key={card.label} {...card} />)}
        </div>
    );
}
