"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import PageHeader from "@/components/shared/PageHeader";
import { getAllBookings, updateBookingStatus } from "@/lib/api";
import { Plus, Search, Loader2, CalendarCheck, Eye } from "lucide-react";
import axios from "axios";

interface Booking {
    _id: string;
    bookingId: string;
    patientName: string;
    patientPhone: string;
    tests: { testName: string }[];
    packages: { packageName: string }[];
    scheduledDate: string;
    scheduledTime: string;
    collectionType: string;
    status: string;
    paymentStatus: string;
    finalAmount: number;
}

const STATUS_TABS = ["all", "pending", "confirmed", "sample-collected", "processing", "completed", "cancelled"];

const STATUS_STYLE: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    confirmed: "bg-blue-50 text-blue-700 border-blue-200",
    "sample-collected": "bg-purple-50 text-purple-700 border-purple-200",
    processing: "bg-violet-50 text-violet-700 border-violet-200",
    completed: "bg-teal-50 text-teal-700 border-teal-200",
    cancelled: "bg-red-50 text-red-600 border-red-200",
};

const NEXT_STATUS: Record<string, string[]> = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["sample-collected", "cancelled"],
    "sample-collected": ["processing"],
    processing: ["completed"],
    completed: [],
    cancelled: [],
};

function useDebounce<T>(value: T, delay = 400): T {
    const [d, setD] = useState(value);
    useEffect(() => { const t = setTimeout(() => setD(value), delay); return () => clearTimeout(t); }, [value, delay]);
    return d;
}

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const debouncedSearch = useDebounce(search);

    const fetchBookings = useCallback(() => {
        setLoading(true);
        getAllBookings({ page, limit: 15, status: activeTab === "all" ? undefined : activeTab, search: debouncedSearch })
            .then((res) => {
                setBookings(res.data.bookings || []);
                setTotal(res.data.total || 0);
                setTotalPages(res.data.totalPages || 1);
            })
            .catch((err) => { if (!axios.isAxiosError(err) || err.response?.status !== 401) setError("Failed to load bookings"); })
            .finally(() => setLoading(false));
    }, [page, activeTab, debouncedSearch]);

    useEffect(() => { fetchBookings(); }, [fetchBookings]);
    useEffect(() => { setPage(1); }, [activeTab, debouncedSearch]);

    const handleStatusChange = async (id: string, status: string) => {
        setUpdatingId(id);
        try {
            const res = await updateBookingStatus(id, status);
            setBookings((prev) => prev.map((b) => b._id === id ? { ...b, status: res.data.booking.status } : b));
        } catch { setError("Failed to update status"); }
        finally { setUpdatingId(null); }
    };

    const items = (b: Booking) => [...b.tests.map((t) => t.testName), ...b.packages.map((p) => p.packageName)].join(", ").slice(0, 40);

    return (
        <main className="p-6">
            <PageHeader
                title="Bookings"
                subtitle={`${total} total bookings`}
                action={
                    <Link href="/admin/bookings/new"
                        className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-md shadow-teal-200">
                        <Plus className="w-4 h-4" /> New Booking
                    </Link>
                }
            />

            {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

            {/* Filter tabs */}
            <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
                {STATUS_TABS.map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize ${activeTab === tab ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}>
                        {tab === "all" ? "All" : tab.replace("-", " ")}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by patient, phone, or booking ID..."
                            className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all" />
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-teal-500 animate-spin" /></div>
                ) : bookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mb-3">
                            <CalendarCheck className="w-6 h-6 text-teal-400" strokeWidth={1.5} />
                        </div>
                        <p className="text-slate-500 text-sm">No bookings found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    {["Booking ID", "Patient", "Tests/Packages", "Date & Time", "Type", "Status", "Payment", "Actions"].map((h) => (
                                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((b) => (
                                    <tr key={b._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-3.5 text-teal-600 font-semibold font-mono text-xs">{b.bookingId}</td>
                                        <td className="px-5 py-3.5">
                                            <p className="text-slate-700 font-semibold">{b.patientName}</p>
                                            <p className="text-slate-400 text-xs">{b.patientPhone}</p>
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-600 max-w-[180px] truncate">{items(b) || "—"}</td>
                                        <td className="px-5 py-3.5">
                                            <p className="text-slate-700 text-xs font-medium">{new Date(b.scheduledDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                                            <p className="text-slate-400 text-xs">{b.scheduledTime}</p>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${b.collectionType === "home-collection" ? "bg-violet-50 text-violet-700 border-violet-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}>
                                                {b.collectionType === "home-collection" ? "Home" : "Walk-in"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <select
                                                value={b.status}
                                                disabled={updatingId === b._id || NEXT_STATUS[b.status]?.length === 0}
                                                onChange={(e) => handleStatusChange(b._id, e.target.value)}
                                                className={`text-[10px] font-semibold px-2 py-1 rounded-full border cursor-pointer outline-none ${STATUS_STYLE[b.status] || "bg-slate-100 text-slate-600 border-slate-200"}`}
                                                style={{ backgroundColor: "transparent" }}
                                            >
                                                <option value={b.status}>{b.status.replace("-", " ")}</option>
                                                {NEXT_STATUS[b.status]?.map((s) => (
                                                    <option key={s} value={s}>{s.replace("-", " ")}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${b.paymentStatus === "paid" ? "bg-teal-50 text-teal-700 border-teal-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                                                {b.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <Link href={`/admin/bookings/${b._id}`} className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-all" title="View">
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
                        <p className="text-slate-400 text-xs">{total} total bookings</p>
                        <div className="flex gap-2">
                            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:border-teal-300 transition-all">Prev</button>
                            <span className="px-3 py-1.5 text-xs text-slate-500">{page} / {totalPages}</span>
                            <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:border-teal-300 transition-all">Next</button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
