"use client";

import { useEffect, useState } from "react";
import { getMyBookings } from "@/lib/api";
import { FileText, Download, Eye, Loader2, FlaskConical } from "lucide-react";
import axios from "axios";

interface Booking {
    _id: string;
    bookingId: string;
    tests: { testName: string }[];
    appointmentDate: string;
    status: string;
    finalAmount: number;
}

export default function ReportsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMyBookings(1, 50)
            .then((res) => setBookings(res.data.bookings || []))
            .catch((err) => { if (!axios.isAxiosError(err) || err.response?.status !== 401) console.error(err); })
            .finally(() => setLoading(false));
    }, []);

    const completed = bookings.filter((b) => b.status === "completed");
    const processing = bookings.filter((b) => ["processing", "sample-collected", "confirmed", "pending"].includes(b.status));

    return (
        <main className="flex-1 p-6 max-w-3xl mx-auto w-full">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">My Reports</h1>
                <p className="text-slate-500 text-sm mt-0.5">Download and view your test reports</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-teal-500 animate-spin" /></div>
            ) : bookings.length === 0 ? (
                <div className="text-center py-20">
                    <FlaskConical className="w-12 h-12 text-slate-200 mx-auto mb-4" strokeWidth={1.5} />
                    <p className="text-slate-400 text-sm">No reports yet. Book a test to get started.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {completed.length > 0 && (
                        <div>
                            <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">Ready to Download</h2>
                            <div className="space-y-3">
                                {completed.map((b) => (
                                    <div key={b._id} className="bg-white border border-slate-100 rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                                                <FileText className="w-5 h-5 text-teal-500" strokeWidth={1.8} />
                                            </div>
                                            <div>
                                                <p className="text-slate-700 font-semibold text-sm">{b.tests.map((t) => t.testName).join(", ").slice(0, 50)}</p>
                                                <p className="text-slate-400 text-xs mt-0.5">
                                                    {new Date(b.appointmentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · #{b.bookingId}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-all">
                                                <Eye className="w-3.5 h-3.5" /> View
                                            </button>
                                            <button className="flex items-center gap-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 px-3 py-2 rounded-xl transition-all shadow-sm">
                                                <Download className="w-3.5 h-3.5" /> Download
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {processing.length > 0 && (
                        <div>
                            <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">In Progress</h2>
                            <div className="space-y-3">
                                {processing.map((b) => (
                                    <div key={b._id} className="bg-white border border-slate-100 rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm opacity-75">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                                                <FileText className="w-5 h-5 text-amber-500" strokeWidth={1.8} />
                                            </div>
                                            <div>
                                                <p className="text-slate-700 font-semibold text-sm">{b.tests.map((t) => t.testName).join(", ").slice(0, 50)}</p>
                                                <p className="text-slate-400 text-xs mt-0.5">
                                                    {new Date(b.appointmentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · #{b.bookingId}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full capitalize">
                                            {b.status.replace("-", " ")}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}
