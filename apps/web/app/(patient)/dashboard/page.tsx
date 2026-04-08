"use client";

import { useEffect, useState, Suspense } from "react";
import { useAuthStore } from "@/store/authStore";
import { getMyBookings } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    CalendarCheck, FileText, Clock, Activity, ArrowRight,
    FlaskConical, Upload, TrendingUp, TrendingDown, Heart,
    Droplets, Zap, Shield
} from "lucide-react";
import axios from "axios";

interface Booking {
    _id: string;
    bookingId: string;
    tests: { testName: string; price: number }[];
    status: string;
    scheduledDate: string;
    scheduledTime: string;
    finalAmount: number;
}

const statusStyle: Record<string, string> = {
    completed: "bg-teal-50 text-teal-700 border-teal-200",
    processing: "bg-amber-50 text-amber-700 border-amber-200",
    pending: "bg-slate-100 text-slate-600 border-slate-200",
    confirmed: "bg-blue-50 text-blue-700 border-blue-200",
    cancelled: "bg-red-50 text-red-600 border-red-200",
    "sample-collected": "bg-purple-50 text-purple-700 border-purple-200",
};

// Derive mock health trend data from bookings
function buildHealthTrend(bookings: Booking[]) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
        const count = bookings.filter((b) => {
            const bd = new Date(b.scheduledDate);
            return bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear();
        }).length;
        return { month: months[d.getMonth()], tests: count };
    });
}

function HealthTrendChart({ data }: { data: { month: string; tests: number }[] }) {
    const max = Math.max(...data.map((d) => d.tests), 1);
    const total = data.reduce((s, d) => s + d.tests, 0);
    const last = data[data.length - 1]?.tests ?? 0;
    const prev = data[data.length - 2]?.tests ?? 0;
    const trend = last >= prev ? "up" : "down";

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 relative overflow-hidden">
            {/* Glow orb */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-teal-400 opacity-[0.06] blur-3xl pointer-events-none" />
            <div className="flex items-start justify-between mb-5">
                <div>
                    <h3 className="text-slate-800 font-bold text-base">Health Activity</h3>
                    <p className="text-slate-400 text-xs mt-0.5">{total} tests over 6 months</p>
                </div>
                <span className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border ${trend === "up" ? "text-teal-600 bg-teal-50 border-teal-100" : "text-slate-500 bg-slate-50 border-slate-200"}`}>
                    {trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {trend === "up" ? "Active" : "Low activity"}
                </span>
            </div>
            <div className="flex items-end gap-2 h-24">
                {data.map(({ month, tests }, i) => (
                    <div key={month} className="flex-1 flex flex-col items-center gap-1 group">
                        <div className="relative w-full flex items-end" style={{ height: "72px" }}>
                            <div
                                className={`w-full rounded-t-lg transition-all duration-700 ${i === data.length - 1
                                    ? "bg-gradient-to-t from-teal-500 to-cyan-400"
                                    : "bg-gradient-to-t from-teal-200 to-teal-100 group-hover:from-teal-400 group-hover:to-cyan-300"
                                    }`}
                                style={{ height: `${Math.max((tests / max) * 100, tests > 0 ? 8 : 3)}%` }}
                            />
                        </div>
                        <span className="text-slate-400 text-[10px] font-medium">{month}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function HealthMetricCard({ icon: Icon, label, value, unit, color, sub }: {
    icon: React.ElementType; label: string; value: string; unit: string; color: string; sub: string;
}) {
    return (
        <div className={`rounded-2xl border p-4 relative overflow-hidden ${color}`}>
            <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 opacity-70" strokeWidth={1.8} />
                <span className="text-xs font-semibold opacity-70 uppercase tracking-wide">{label}</span>
            </div>
            <p className="text-2xl font-bold">{value}<span className="text-sm font-medium ml-1 opacity-60">{unit}</span></p>
            <p className="text-xs opacity-60 mt-0.5">{sub}</p>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, colorClass, loading }: {
    label: string; value: number; icon: React.ElementType; colorClass: string; loading: boolean;
}) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full opacity-[0.06] bg-teal-400 blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide">{label}</span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${colorClass}`}>
                    <Icon className="w-4 h-4" strokeWidth={1.8} />
                </div>
            </div>
            <p className="text-2xl font-bold text-slate-800">{loading ? "—" : value}</p>
        </div>
    );
}

export default function DashboardPage() {
    const user = useAuthStore((s) => s.user);
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMyBookings(1, 20)
            .then((res) => setBookings(res.data.bookings || []))
            .catch((err) => { if (!axios.isAxiosError(err) || err.response?.status !== 401) console.error(err); })
            .finally(() => setLoading(false));
    }, []);

    const total = bookings.length;
    const completed = bookings.filter((b) => b.status === "completed").length;
    const pending = bookings.filter((b) => ["pending", "confirmed", "sample-collected", "processing"].includes(b.status)).length;
    const cancelled = bookings.filter((b) => b.status === "cancelled").length;
    const recent = bookings.slice(0, 5);
    const trendData = buildHealthTrend(bookings);

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

    return (
        <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
            {/* Header — matches landing page style */}
            <div className="mb-8 relative">
                <div className="absolute -top-6 -left-6 w-48 h-48 rounded-full bg-teal-400 opacity-[0.05] blur-3xl pointer-events-none" />
                <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-4 py-1.5 mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                    <span className="text-teal-700 text-xs font-semibold tracking-widest uppercase">
                        {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Instrument Serif', serif" }}>
                    {greeting}{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""} 👋
                </h1>
                <p className="text-slate-500 text-sm mt-1">Here&apos;s your health summary</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard label="Total Bookings" value={total} icon={CalendarCheck} colorClass="bg-teal-50 text-teal-600" loading={loading} />
                <StatCard label="Completed" value={completed} icon={FileText} colorClass="bg-cyan-50 text-cyan-600" loading={loading} />
                <StatCard label="In Progress" value={pending} icon={Clock} colorClass="bg-amber-50 text-amber-600" loading={loading} />
                <StatCard label="Cancelled" value={cancelled} icon={Activity} colorClass="bg-violet-50 text-violet-600" loading={loading} />
            </div>

            {/* Health Trend + Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                <div className="lg:col-span-2">
                    {loading ? (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 h-48 animate-pulse" />
                    ) : (
                        <HealthTrendChart data={trendData} />
                    )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <HealthMetricCard icon={Heart} label="Heart" value="72" unit="bpm" color="bg-red-50 text-red-600 border-red-100" sub="Normal range" />
                    <HealthMetricCard icon={Droplets} label="Glucose" value="95" unit="mg/dL" color="bg-blue-50 text-blue-600 border-blue-100" sub="Fasting" />
                    <HealthMetricCard icon={Zap} label="Haemoglobin" value="13.5" unit="g/dL" color="bg-amber-50 text-amber-700 border-amber-100" sub="Normal" />
                    <HealthMetricCard icon={Shield} label="Immunity" value="Good" unit="" color="bg-teal-50 text-teal-700 border-teal-100" sub="Last check" />
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <button
                    onClick={() => router.push("/book-test?prescription=true")}
                    className="bg-[#0f172a] hover:bg-[#1e293b] rounded-2xl border border-[#0f172a] shadow-sm p-5 flex flex-col items-center gap-3 hover:shadow-lg transition-all group"
                >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 group-hover:bg-white/20 transition-colors">
                        <Upload className="w-5 h-5 text-white" strokeWidth={1.8} />
                    </div>
                    <span className="text-white text-sm font-semibold">Upload Prescription</span>
                </button>
                {[
                    { label: "Book a Test", href: "/book-test", icon: FlaskConical, color: "bg-teal-50 text-teal-600", border: "hover:border-teal-200" },
                    { label: "My Bookings", href: "/bookings", icon: CalendarCheck, color: "bg-blue-50 text-blue-600", border: "hover:border-blue-200" },
                    { label: "My Reports", href: "/reports", icon: FileText, color: "bg-violet-50 text-violet-600", border: "hover:border-violet-200" },
                ].map(({ label, href, icon: Icon, color, border }) => (
                    <Link key={label} href={href}
                        className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col items-center gap-3 hover:shadow-md transition-all ${border}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                            <Icon className="w-5 h-5" strokeWidth={1.8} />
                        </div>
                        <span className="text-slate-700 text-sm font-semibold">{label}</span>
                    </Link>
                ))}
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 relative overflow-hidden">
                <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-cyan-400 opacity-[0.05] blur-3xl pointer-events-none" />
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-slate-800 font-bold text-base">Recent Bookings</h3>
                    <Link href="/bookings" className="text-teal-600 text-xs font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                        View all <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : recent.length === 0 ? (
                    <div className="text-center py-10">
                        <FlaskConical className="w-10 h-10 text-slate-200 mx-auto mb-3" strokeWidth={1.5} />
                        <p className="text-slate-400 text-sm">No bookings yet</p>
                        <Link href="/book-test" className="inline-flex items-center gap-1.5 mt-3 text-teal-600 text-sm font-semibold hover:gap-2.5 transition-all">
                            Book your first test <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {recent.map((b) => (
                            <Link key={b._id} href={`/bookings/${b._id}`}
                                className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/60 -mx-2 px-2 rounded-xl transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                                        <FlaskConical className="w-4 h-4 text-teal-500" strokeWidth={1.8} />
                                    </div>
                                    <div>
                                        <p className="text-slate-700 text-sm font-semibold">
                                            {b.tests.map((t) => t.testName).join(", ").slice(0, 40)}{b.tests.length > 1 ? "…" : ""}
                                        </p>
                                        <p className="text-slate-400 text-xs">
                                            {new Date(b.scheduledDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {b.scheduledTime}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border capitalize ${statusStyle[b.status] || statusStyle.pending}`}>
                                        {b.status.replace("-", " ")}
                                    </span>
                                    <span className="text-teal-600 font-bold text-sm">₹{b.finalAmount}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
