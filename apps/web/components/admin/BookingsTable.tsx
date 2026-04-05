"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllBookings } from "@/lib/api";
import { Loader2, ArrowRight } from "lucide-react";

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
    completed: "bg-teal-50 text-teal-700 border-teal-200",
    processing: "bg-amber-50 text-amber-700 border-amber-200",
    pending: "bg-slate-100 text-slate-600 border-slate-200",
    confirmed: "bg-blue-50 text-blue-700 border-blue-200",
    cancelled: "bg-red-50 text-red-600 border-red-200",
    "sample-collected": "bg-purple-50 text-purple-700 border-purple-200",
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
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-slate-800 font-bold text-base">Recent Bookings</h3>
                <Link href="/admin/bookings" className="text-teal-600 text-xs font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                    View all <ArrowRight className="w-3 h-3" />
                </Link>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
                </div>
            ) : bookings.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-sm">No bookings yet</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                {["ID", "Patient", "Test", "Date", "Status", "Amount"].map((h) => (
                                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((b) => (
                                <tr key={b._id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <Link href={`/admin/bookings/${b._id}`} className="text-teal-600 font-semibold hover:underline">
                                            #{b.bookingId}
                                        </Link>
                                    </td>
                                    <td className="px-5 py-3.5 text-slate-700 font-medium">{b.patientName}</td>
                                    <td className="px-5 py-3.5 text-slate-500 max-w-[160px] truncate">
                                        {b.tests.map((t) => t.testName).join(", ")}
                                    </td>
                                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                                        {new Date(b.scheduledDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border capitalize ${statusStyle[b.status] || statusStyle.pending}`}>
                                            {b.status.replace("-", " ")}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-slate-700 font-semibold">₹{b.finalAmount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
