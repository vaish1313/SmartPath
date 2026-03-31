"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getMyBookings } from "@/lib/api";
import Link from "next/link";
import { CalendarCheck, FileText, Clock, Activity, ArrowRight, FlaskConical } from "lucide-react";
import axios from "axios";

interface Booking {
    _id: string;
    bookingId: string;
    tests: { testName: string; price: number }[];
    status: string;
    appointmentDate: string;
    appointmentSlot: string;
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

export default function DashboardPage() {
    const user = useAuthStore((s) => s.user);
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

    const stats = [
        { label: "Total Bookings", value: total, icon: CalendarCheck, color: "teal" },
        { label: "Completed", value: completed, icon: FileText, color: "cyan" },
        { label: "In Progress", value: pending, icon: Clock, color: "amber" },
        { label: "Cancelled", value: cancelled, icon: Activity, color: "violet" },
    ];

    const colorMap: Record<string, string> = {
        teal: "bg-teal-50 text-teal-600",
        cyan: "bg-cyan-50 text-cyan-600",
        amber: "bg-amber-50 text-amber-600",
        violet: "bg-violet-50 text-violet-600",
    };

    return (
        <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800">
                    Good morning{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""} 👋
                </h1>
                <p className="text-slate-500 text-sm mt-1">Here's your health summary</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stats.map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide">{label}</span>
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
                                <Icon className="w-4 h-4" strokeWidth={1.8} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-800">{loading ? "—" : value}</p>
                    </div>
                ))}
            </div>

            {/* Recent bookings */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
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
                    <div className="space-y-3">
                        {recent.map((b) => (
                            <Link key={b._id} href={`/bookings/${b._id}`} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 -mx-2 px-2 rounded-xl transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
                                        <FlaskConical className="w-4 h-4 text-teal-500" strokeWidth={1.8} />
                                    </div>
                                    <div>
                                        <p className="text-slate-700 text-sm font-semibold">
                                            {b.tests.map((t) => t.testName).join(", ").slice(0, 40)}{b.tests.length > 1 ? "…" : ""}
                                        </p>
                                        <p className="text-slate-400 text-xs">
                                            {new Date(b.appointmentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {b.appointmentSlot}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
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
