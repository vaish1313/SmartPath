"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { getAllBookings } from "@/lib/api";
import { Microscope, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import axios from "axios";

interface Booking {
    _id: string;
    bookingId: string;
    patientName: string;
    tests: { testName: string }[];
    appointmentSlot: string;
    status: string;
    collectionAgentId?: string;
}

const statusIcon: Record<string, React.ReactNode> = {
    completed: <CheckCircle className="w-4 h-4 text-teal-500" />,
    processing: <Clock className="w-4 h-4 text-amber-500" />,
    "sample-collected": <Clock className="w-4 h-4 text-amber-500" />,
    pending: <AlertCircle className="w-4 h-4 text-slate-400" />,
    confirmed: <AlertCircle className="w-4 h-4 text-blue-400" />,
};

const statusStyle: Record<string, string> = {
    completed: "bg-teal-50 text-teal-700 border-teal-200",
    processing: "bg-amber-50 text-amber-700 border-amber-200",
    "sample-collected": "bg-purple-50 text-purple-700 border-purple-200",
    pending: "bg-slate-100 text-slate-600 border-slate-200",
    confirmed: "bg-blue-50 text-blue-700 border-blue-200",
};

export default function AdminLabPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAllBookings({ limit: 50 })
            .then((res) => setBookings(res.data.bookings || []))
            .catch((err) => { if (!axios.isAxiosError(err) || err.response?.status !== 401) console.error(err); })
            .finally(() => setLoading(false));
    }, []);

    const completed = bookings.filter((b) => b.status === "completed").length;
    const processing = bookings.filter((b) => ["processing", "sample-collected"].includes(b.status)).length;
    const pending = bookings.filter((b) => ["pending", "confirmed"].includes(b.status)).length;

    return (
        <main className="p-6">
            <PageHeader title="Lab Management" subtitle="Track sample processing status" />
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: "Completed", value: completed, color: "teal" },
                    { label: "Processing", value: processing, color: "amber" },
                    { label: "Pending", value: pending, color: "slate" },
                ].map(({ label, value, color }) => (
                    <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${color}-50`}>
                            <Microscope className={`w-5 h-5 text-${color}-500`} strokeWidth={1.8} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{loading ? "—" : value}</p>
                            <p className="text-slate-500 text-xs font-medium">{label}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    {["Booking ID", "Patient", "Tests", "Slot", "Status"].map((h) => (
                                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.length === 0 ? (
                                    <tr><td colSpan={5} className="px-5 py-16 text-center text-slate-400 text-sm">No bookings found</td></tr>
                                ) : bookings.map((b) => (
                                    <tr key={b._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-3.5 text-teal-600 font-semibold font-mono text-xs">{b.bookingId}</td>
                                        <td className="px-5 py-3.5 text-slate-700 font-medium">{b.patientName}</td>
                                        <td className="px-5 py-3.5 text-slate-600">{b.tests.map((t) => t.testName).join(", ").slice(0, 40)}</td>
                                        <td className="px-5 py-3.5 text-slate-500">{b.appointmentSlot}</td>
                                        <td className="px-5 py-3.5">
                                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border capitalize ${statusStyle[b.status] || statusStyle.pending}`}>
                                                {statusIcon[b.status] || statusIcon.pending} {b.status.replace("-", " ")}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    );
}
