"use client";

import { useEffect, useState } from "react";
import { Users, CalendarCheck, FileText, IndianRupee } from "lucide-react";
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
    dotColor: string;
    sub: string;
}

function StatCard({ label, value, icon: Icon, dotColor, sub }: CardProps) {
    return (
        <div className="bg-white rounded-lg p-4" style={{ border: "0.5px solid rgba(0,0,0,0.1)" }}>
            <div className="flex items-center gap-2 mb-2.5">
                <div className={`w-2 h-2 rounded-full ${dotColor}`} />
                <span className="text-slate-600 text-sm font-medium">{label}</span>
            </div>
            {value === null ? (
                <div className="h-8 w-16 bg-slate-100 rounded animate-pulse" />
            ) : (
                <p className="text-2xl font-bold text-slate-800 mb-0.5">{value}</p>
            )}
            <p className="text-slate-500 text-xs">{sub}</p>
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
            dotColor: "bg-[#1D9E75]",
            sub: "unique patients",
        },
        {
            label: "Bookings Today",
            value: loading ? null : stats?.todayBookings ?? 0,
            icon: CalendarCheck,
            dotColor: "bg-[#378ADD]",
            sub: `${stats?.totalBookings ?? 0} total`,
        },
        {
            label: "Reports Pending",
            value: loading ? null : stats?.pendingResults ?? 0,
            icon: FileText,
            dotColor: "bg-[#EF9F27]",
            sub: "awaiting approval",
        },
        {
            label: "Revenue (Month)",
            value: loading ? null : fmt(stats?.monthRevenue ?? 0),
            icon: IndianRupee,
            dotColor: "bg-[#534AB7]",
            sub: "paid invoices",
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {cards.map((card) => <StatCard key={card.label} {...card} />)}
        </div>
    );
}
