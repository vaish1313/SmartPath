"use client";

import { useEffect, useState } from "react";
import { Users, CalendarCheck, FileText, IndianRupee, Loader2 } from "lucide-react";
import { getDashboardStats } from "@/lib/api";

interface Stats {
    totalBookings: number;
    todayBookings: number;
    pendingResults: number;
    monthRevenue: number;
    monthPatients: number;
}

const colorMap: Record<string, string> = {
    teal: "bg-teal-50 text-teal-600",
    cyan: "bg-cyan-50 text-cyan-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
};

function fmt(v: number) {
    if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
    if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`;
    return `₹${v}`;
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

    const cards = [
        { label: "Patients This Month", value: loading ? null : stats?.monthPatients ?? 0, icon: Users, color: "teal", sub: "unique patients" },
        { label: "Bookings Today", value: loading ? null : stats?.todayBookings ?? 0, icon: CalendarCheck, color: "cyan", sub: `${stats?.totalBookings ?? 0} total` },
        { label: "Reports Pending", value: loading ? null : stats?.pendingResults ?? 0, icon: FileText, color: "amber", sub: "awaiting approval" },
        { label: "Revenue (Month)", value: loading ? null : fmt(stats?.monthRevenue ?? 0), icon: IndianRupee, color: "violet", sub: "paid invoices" },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map(({ label, value, icon: Icon, color, sub }) => (
                <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide">{label}</span>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
                            <Icon className="w-4 h-4" strokeWidth={1.8} />
                        </div>
                    </div>
                    {value === null ? (
                        <Loader2 className="w-5 h-5 text-slate-300 animate-spin" />
                    ) : (
                        <p className="text-2xl font-bold text-slate-800">{value}</p>
                    )}
                    <p className="text-slate-400 text-xs mt-1">{sub}</p>
                </div>
            ))}
        </div>
    );
}
