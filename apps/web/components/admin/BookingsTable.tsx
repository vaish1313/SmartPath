"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllBookings } from "@/lib/api";
import { ArrowRight } from "lucide-react";

interface Booking {
    _id: string;
    bookingId: string;
    patientName: string;
    tests: { testName: string }[];
    scheduledDate: string;
    status: string;
    finalAmount: number;
}

const statusStyle: Record<string, string> = {
    completed: "bg-blue-50 text-blue-700",
    processing: "bg-amber-50 text-amber-700",
    pending: "bg-slate-100 text-slate-600",
    confirmed: "bg-blue-50 text-blue-700",
    cancelled: "bg-red-50 text-red-600",
    "sample-collected": "bg-purple-50 text-purple-700",
};

export default function BookingsTable() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAllBookings({ limit: 8 })
            .then((res) => setBookings(res.data.bookings || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="bg-white rounded-lg overflow-hidden" style={{ border: "0.5px solid rgba(0,0,0,0.1)" }}>
            <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: "0.5px solid rgba(0,0,0,0.1)" }}>
                <h3 className="text-slate-800 font-semibold text-base">Recent Bookings</h3>
                <Link href="/admin/bookings" className="text-[#1D9E75] text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                    View all <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            {loading ? (
                <div className="space-y-2.5 p-5">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />
                    ))}
                </div>
            ) : bookings.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">No bookings yet</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-[#F5F5F3]" style={{ borderBottom: "0.5px solid rgba(0,0,0,0.1)" }}>
                                {["ID", "Patient", "Test", "Date", "Status", "Amount"].map((h) => (
                                    <th key={h} className="text-left px-5 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((b, idx) => (
                                <tr key={b._id} className={`hover:bg-slate-50 transition-colors ${idx !== bookings.length - 1 ? 'border-b' : ''}`} style={{ borderColor: "rgba(0,0,0,0.05)" }}>
                                    <td className="px-5 py-3">
                                        <Link href={`/admin/bookings/${b._id}`} className="text-[#1D9E75] font-semibold hover:underline">
                                            #{b.bookingId}
                                        </Link>
                                    </td>
                                    <td className="px-5 py-3 text-slate-700 font-medium">{b.patientName}</td>
                                    <td className="px-5 py-3 text-slate-500 max-w-[160px] truncate">
                                        {b.tests.map((t) => t.testName).join(", ")}
                                    </td>
                                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                                        {new Date(b.scheduledDate).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusStyle[b.status] || statusStyle.pending}`}>
                                            {b.status.replace("-", " ")}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-slate-800 font-semibold">₹{b.finalAmount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
