"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { getAllBookings } from "@/lib/api";
import { FileText, Download, CheckCircle, Clock, Loader2 } from "lucide-react";
import axios from "axios";

interface Booking {
    _id: string;
    bookingId: string;
    patientName: string;
    tests: { testName: string }[];
    appointmentDate: string;
    status: string;
}

export default function AdminReportsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAllBookings({ limit: 50 })
            .then((res) => setBookings(res.data.bookings || []))
            .catch((err) => { if (!axios.isAxiosError(err) || err.response?.status !== 401) console.error(err); })
            .finally(() => setLoading(false));
    }, []);

    const reportable = bookings.filter((b) => ["completed", "processing", "sample-collected"].includes(b.status));

    return (
        <main className="p-6">
            <PageHeader title="Reports" subtitle="Manage and dispatch patient reports" />
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
                                    {["Booking ID", "Patient", "Tests", "Date", "Status", "Action"].map((h) => (
                                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {reportable.length === 0 ? (
                                    <tr><td colSpan={6} className="px-5 py-16 text-center text-slate-400 text-sm">No reports available</td></tr>
                                ) : reportable.map((b) => {
                                    const ready = b.status === "completed";
                                    return (
                                        <tr key={b._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-5 py-3.5 text-teal-600 font-semibold font-mono text-xs">{b.bookingId}</td>
                                            <td className="px-5 py-3.5 text-slate-700 font-medium">{b.patientName}</td>
                                            <td className="px-5 py-3.5 text-slate-600">{b.tests.map((t) => t.testName).join(", ").slice(0, 40)}</td>
                                            <td className="px-5 py-3.5 text-slate-500">
                                                {new Date(b.appointmentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${ready ? "bg-teal-50 text-teal-700 border-teal-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                                                    {ready ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                    {ready ? "Ready" : "Processing"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                {ready && (
                                                    <button className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors">
                                                        <Download className="w-3.5 h-3.5" /> Download
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    );
}
