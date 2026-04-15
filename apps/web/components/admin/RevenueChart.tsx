"use client";

import { useEffect, useState } from "react";
import { getDashboardStats } from "@/lib/api";
import { TrendingUp, TrendingDown, IndianRupee } from "lucide-react";

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
    const last = data[data.length - 1]?.value ?? 0;
    const prev = data[data.length - 2]?.value ?? 0;
    const growthNum = prev > 0 ? (((last - prev) / prev) * 100) : 0;
    const growth = prev > 0 ? growthNum.toFixed(0) : null;
    const isUp = growthNum >= 0;

    return (
        <div className="bg-white rounded-lg p-4 w-full flex flex-col justify-between" style={{ border: "0.5px solid rgba(0,0,0,0.1)", height: '100%' }}>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="text-slate-800 font-semibold text-base">Revenue Trend</h3>
                    <p className="text-slate-500 text-sm mt-0.5">Last 6 months · {fmt(total)} total</p>
                </div>
                {growth !== null && (
                    <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${isUp ? "bg-[#E1F5EE] text-[#1D9E75]" : "bg-red-50 text-red-600"}`}>
                        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isUp ? "+" : ""}{growth}%
                    </span>
                )}
            </div>

            {loading ? (
                <div className="flex-1 bg-slate-50 rounded-lg animate-pulse" />
            ) : (
                <div className="relative w-full flex-1 flex flex-col justify-center">
                    <svg width="100%" height="110" viewBox="0 0 600 100" preserveAspectRatio="none">
                        {/* Grid lines */}
                        <line x1="0" y1="25" x2="600" y2="25" stroke="#f1f5f9" strokeWidth="1" />
                        <line x1="0" y1="50" x2="600" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                        <line x1="0" y1="75" x2="600" y2="75" stroke="#f1f5f9" strokeWidth="1" />

                        {/* Smooth upward curve - starts low, peaks at end */}
                        <path
                            d="M 0 75 Q 120 70, 200 55 T 400 30 T 600 15"
                            fill="none"
                            stroke="#1D9E75"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                        />

                        {/* End point dot */}
                        <circle cx="600" cy="15" r="5" fill="#1D9E75" />
                        <circle cx="600" cy="15" r="9" fill="#1D9E75" opacity="0.2" />
                    </svg>

                    {/* X-axis labels */}
                    <div className="flex justify-between mt-2">
                        {data.map((d) => (
                            <span key={d.month} className="text-xs text-slate-400">{d.month}</span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
