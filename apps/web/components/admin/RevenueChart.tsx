"use client";

import { useEffect, useState } from "react";
import { getDashboardStats } from "@/lib/api";
import { TrendingUp, TrendingDown, IndianRupee, Loader2 } from "lucide-react";

interface MonthData { month: string; value: number; }

function fmt(v: number) {
    if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
    if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
    return `₹${v}`;
}

function Sparkline({ data, max }: { data: MonthData[]; max: number }) {
    const w = 400;
    const h = 80;
    const pad = 8;
    const pts = data.map((d, i) => {
        const x = pad + (i / (data.length - 1)) * (w - pad * 2);
        const y = h - pad - ((d.value / max) * (h - pad * 2));
        return `${x},${y}`;
    });
    const polyline = pts.join(" ");
    const area = `${pad},${h - pad} ${polyline} ${w - pad},${h - pad}`;

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-20" preserveAspectRatio="none">
            <defs>
                <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="sparkLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#14b8a6" />
                    <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
            </defs>
            <polygon points={area} fill="url(#sparkFill)" />
            <polyline points={polyline} fill="none" stroke="url(#sparkLine)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {data.map((d, i) => {
                const [x, y] = pts[i].split(",").map(Number);
                return (
                    <circle key={i} cx={x} cy={y} r={i === data.length - 1 ? 4 : 2.5}
                        fill={i === data.length - 1 ? "#14b8a6" : "#fff"}
                        stroke="#14b8a6" strokeWidth="2" />
                );
            })}
        </svg>
    );
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
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 relative overflow-hidden hover:shadow-md transition-shadow">
            {/* Background glow */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-teal-400 opacity-[0.06] blur-3xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-cyan-400 opacity-[0.05] blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-slate-800 font-bold text-base">Revenue Trend</h3>
                    <p className="text-slate-400 text-xs mt-0.5">Last 6 months</p>
                </div>
                {growth !== null && (
                    <span className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border ${isUp ? "text-teal-600 bg-teal-50 border-teal-100" : "text-red-500 bg-red-50 border-red-100"}`}>
                        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isUp ? "+" : ""}{growth}% vs last month
                    </span>
                )}
            </div>

            {/* Big total */}
            <div className="flex items-end gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                    <IndianRupee className="w-5 h-5 text-teal-600" strokeWidth={1.8} />
                </div>
                <div>
                    <p className="text-3xl font-bold text-slate-800 leading-none">{fmt(total)}</p>
                    <p className="text-slate-400 text-xs mt-1">Total collected</p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-36">
                    <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
                </div>
            ) : (
                <>
                    {/* Sparkline */}
                    <div className="mb-4">
                        <Sparkline data={data} max={max} />
                    </div>

                    {/* Bar chart */}
                    <div className="flex items-end gap-2 h-28">
                        {data.map(({ month, value }, i) => (
                            <div key={month} className="flex-1 flex flex-col items-center gap-1.5 group">
                                <span className="text-[9px] text-slate-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {fmt(value)}
                                </span>
                                <div className="relative w-full flex items-end" style={{ height: "88px" }}>
                                    <div
                                        className={`w-full rounded-t-lg transition-all duration-700 ${i === data.length - 1
                                            ? "bg-gradient-to-t from-teal-500 to-cyan-400 shadow-sm shadow-teal-200"
                                            : "bg-gradient-to-t from-teal-100 to-teal-50 group-hover:from-teal-400 group-hover:to-cyan-300"
                                            }`}
                                        style={{ height: `${Math.max((value / max) * 100, value > 0 ? 4 : 0)}%` }}
                                    />
                                </div>
                                <span className={`text-[10px] font-medium ${i === data.length - 1 ? "text-teal-600" : "text-slate-400"}`}>
                                    {month}
                                </span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
