"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAllBookings, createSample } from "@/lib/api";
import { ArrowLeft, Search, Loader2, CheckCircle } from "lucide-react";
import axios from "axios";

interface Booking { _id: string; bookingId: string; patientName: string; patientPhone: string; patientId: string; scheduledDate?: string; tests?: { testName: string }[]; }

export default function NewSamplePage() {
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [sampleId, setSampleId] = useState("");
    const [barcode, setBarcode] = useState("");

    useEffect(() => {
        // Get bookingId from URL if present
        const params = new URLSearchParams(window.location.search);
        const bookingIdParam = params.get('bookingId');

        getAllBookings({ status: "confirmed", limit: 50 })
            .then((res) => {
                const fetchedBookings = res.data.bookings || [];
                setBookings(fetchedBookings);

                // Auto-select booking if bookingId is in URL
                if (bookingIdParam) {
                    const preselected = fetchedBookings.find((b: Booking) => b._id === bookingIdParam);
                    if (preselected) {
                        setSelected(preselected);
                    }
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = bookings.filter((b) =>
        b.bookingId?.toLowerCase().includes(search.toLowerCase()) ||
        b.patientName?.toLowerCase().includes(search.toLowerCase())
    );

    const handleSubmit = async () => {
        if (!selected) return;
        setSubmitting(true); setError("");
        try {
            const res = await createSample({ bookingId: selected._id, patientId: selected.patientId, patientName: selected.patientName });
            setSampleId(res.data.sample.sampleId);
            setBarcode(res.data.sample.barcode);
            setSuccess(true);
        } catch (err) {
            if (axios.isAxiosError(err)) setError(err.response?.data?.message || "Failed to create sample");
            else setError("Something went wrong.");
        } finally { setSubmitting(false); }
    };

    const inputCls = "w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm placeholder:text-slate-300 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all";

    if (success) return (
        <main className="p-6 max-w-lg">
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-7 h-7 text-teal-600" strokeWidth={1.8} />
                </div>
                <h2 className="text-lg font-bold text-slate-800 mb-1">Sample Created</h2>
                <p className="text-teal-600 font-mono font-bold text-base mb-1">{sampleId}</p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 my-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Barcode</p>
                    <p className="font-mono text-slate-700 font-bold text-sm tracking-widest">{barcode}</p>
                </div>
                <div className="flex gap-3 justify-center mt-4">
                    <Link href="/admin/lab" className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-md shadow-teal-200">Back to Lab</Link>
                    <button onClick={() => { setSuccess(false); setSelected(null); }} className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm px-5 py-2.5 rounded-xl transition-all">New Sample</button>
                </div>
            </div>
        </main>
    );

    return (
        <main className="p-6 max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
                <Link href="/admin/lab" className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 shadow-sm transition-all">
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">New Sample</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Register a collected sample for a confirmed booking</p>
                </div>
            </div>

            {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 mb-5">
                <h2 className="text-sm font-bold text-slate-700 mb-4">Select Confirmed Booking</h2>
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by booking ID or patient name..." className={`${inputCls} pl-9`} />
                </div>
                {loading ? <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 text-teal-500 animate-spin" /></div> : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {filtered.length === 0 ? <p className="text-slate-400 text-sm text-center py-4">No confirmed bookings found</p> : filtered.map((b) => (
                            <button key={b._id} onClick={() => setSelected(b)}
                                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${selected?._id === b._id ? "bg-teal-50 border-teal-300" : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50"}`}>
                                <div>
                                    <p className="text-slate-700 text-sm font-semibold">{b.patientName}</p>
                                    <p className="text-slate-400 text-xs">{b.bookingId} · {b.scheduledDate ? new Date(b.scheduledDate).toLocaleDateString("en-IN") : ""}</p>
                                    {b.tests && <p className="text-slate-400 text-xs">{b.tests.map((t) => t.testName).join(", ").slice(0, 50)}</p>}
                                </div>
                                {selected?._id === b._id && <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" />}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {selected && (
                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 mb-5">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Selected Booking</p>
                    <p className="text-slate-700 font-bold">{selected.patientName}</p>
                    <p className="text-slate-500 text-sm">{selected.bookingId} · {selected.patientPhone}</p>
                </div>
            )}

            <div className="flex gap-3">
                <Link href="/admin/lab" className="flex-1 flex items-center justify-center bg-white border border-slate-200 rounded-xl py-3 text-slate-500 hover:text-slate-700 text-sm transition-all shadow-sm">Cancel</Link>
                <button onClick={handleSubmit} disabled={!selected || submitting}
                    className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl py-3 transition-all shadow-lg shadow-teal-200">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Sample"}
                </button>
            </div>
        </main>
    );
}
