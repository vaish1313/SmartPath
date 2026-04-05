"use client";

import { useEffect, useState } from "react";
import { getDashboardStats } from "@/lib/api";
import { TrendingUp, Loader2 } from "lucide-react";

interface MonthData { month: string; value: number; }

function fmt(v: number) {
    if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
    if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
    return `₹${v}`;
}

export default function RevenueChart() {
    const [data, setData] = useState<MonthData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDashboardStats()
            .then((res) => setData(res.data.revenueChart || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const max = Math.max(...data.map((d) => d.value), 1);
    const total = data.reduce((s, d) => s + d.value, 0);

    // Calculate growth vs previous month
    const growth = data.length >= 2
        ? data[data.length - 2].value > 0
            ? (((data[data.length - 1].value - data[data.length - 2].value) / data[data.length - 2].value) * 100).toFixed(0)
            : null
        : null;

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-slate-800 font-bold text-base">Revenue Overview</h3>
                    <p className="text-slate-400 text-xs mt-0.5">Last 6 months · {fmt(total)} total</p>
                </div>
                {growth !== null && (
                    <span className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border ${Number(growth) >= 0 ? "text-teal-600 bg-teal-50 border-teal-100" : "text-red-500 bg-red-50 border-red-100"}`}>
                        <TrendingUp className="w-3 h-3" />
                        {Number(growth) >= 0 ? "+" : ""}{growth}% vs last month
                    </span>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-36">
                    <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
                </div>
            ) : (
                <div className="flex items-end gap-3 h-36">
                    {data.map(({ month, value }) => (
                        <div key={month} className="flex-1 flex flex-col items-center gap-1.5 group">
                            <span className="text-[9px] text-slate-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">{fmt(value)}</span>
                            <div className="relative w-full flex items-end" style={{ height: "100px" }}>
                                <div
                                    className="w-full rounded-t-lg bg-gradient-to-t from-teal-500 to-cyan-400 transition-all duration-500 group-hover:from-teal-400 group-hover:to-cyan-300"
                                    style={{ height: `${Math.max((value / max) * 100, value > 0 ? 4 : 0)}%` }}
                                />
                            </div>
                            <span className="text-slate-400 text-[10px] font-medium">{month}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
