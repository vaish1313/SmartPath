"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import PageHeader from "@/components/shared/PageHeader";
import { getAllBookings, updateBookingStatus, getBookingById } from "@/lib/api";
import { Plus, Search, Loader2, CalendarCheck, Eye, X, Calendar, Clock, MapPin, Home, Building2, User } from "lucide-react";
import axios from "axios";

interface Booking {
    _id: string;
    bookingId: string;
    patientName: string;
    patientPhone: string;
    tests: { testName: string; testCode?: string; price?: number }[];
    packages: { packageName: string; price?: number }[];
    scheduledDate: string;
    scheduledTime: string;
    collectionType: string;
    collectionAddress?: { street?: string; city?: string; pincode?: string };
    status: string;
    paymentStatus: string;
    finalAmount: number;
    totalAmount?: number;
    assignedTechnician?: string;
    notes?: string;
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
    const [modal, setModal] = useState<"new" | "view" | null>(null);
    const [viewBooking, setViewBooking] = useState<Booking | null>(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [apiError, setApiError] = useState("");

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

    const openView = (id: string) => {
        setApiError("");
        setModalLoading(true);
        setModal("view");
        getBookingById(id)
            .then((res) => setViewBooking(res.data.booking || res.data))
            .catch(() => setApiError("Failed to load booking"))
            .finally(() => setModalLoading(false));
    };

    const closeModal = () => {
        setModal(null);
        setViewBooking(null);
        setApiError("");
    };

    const items = (b: Booking) => [...b.tests.map((t) => t.testName), ...b.packages.map((p) => p.packageName)].join(", ").slice(0, 40);

    return (
        <>
            <main className="p-6">
                <PageHeader
                    title="Bookings"
                    subtitle={`${total} total bookings`}
                    action={
                        <button onClick={() => setModal("new")}
                            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-md shadow-teal-200">
                            <Plus className="w-4 h-4" /> New Booking
                        </button>
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

                <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/40 shadow-lg overflow-hidden hover:shadow-xl hover:bg-white/70 transition-all">
                    <div className="px-5 py-4 border-b border-slate-100/60">
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
                                                <button onClick={() => openView(b._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-all" title="View">
                                                    <Eye className="w-4 h-4" />
                                                </button>
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

            {/* New Booking Modal - Redirect to Full Form */}
            {modal === "new" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
                                    <CalendarCheck className="w-4 h-4 text-teal-600" strokeWidth={1.8} />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-slate-800">Create New Booking</h2>
                                    <p className="text-slate-400 text-xs">Multi-step booking process</p>
                                </div>
                            </div>
                            <button onClick={closeModal} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="px-6 py-5">
                            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-4">
                                <p className="text-sm text-teal-700 mb-2">The booking process includes:</p>
                                <ul className="text-xs text-teal-600 space-y-1 ml-4 list-disc">
                                    <li>Patient selection</li>
                                    <li>Test & package selection</li>
                                    <li>Schedule & collection type</li>
                                    <li>Confirmation & payment</li>
                                </ul>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={closeModal} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm rounded-xl py-2.5 transition-all">Cancel</button>
                                <Link href="/admin/bookings/new" onClick={closeModal}
                                    className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl py-2.5 transition-all shadow-lg shadow-teal-200">
                                    Continue
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Booking Modal */}
            {modal === "view" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
                                    <CalendarCheck className="w-4 h-4 text-teal-600" strokeWidth={1.8} />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-slate-800">Booking Details</h2>
                                    {viewBooking && <p className="text-teal-600 text-xs font-mono font-semibold">{viewBooking.bookingId}</p>}
                                </div>
                            </div>
                            <button onClick={closeModal} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {modalLoading ? (
                            <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-teal-500 animate-spin" /></div>
                        ) : viewBooking ? (
                            <div className="px-6 py-5">
                                {apiError && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{apiError}</div>}

                                {/* Status badge */}
                                <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border capitalize ${STATUS_STYLE[viewBooking.status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                                        {viewBooking.status.replace(/-/g, " ")}
                                    </span>
                                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border capitalize ${viewBooking.paymentStatus === "paid" ? "bg-teal-50 text-teal-700 border-teal-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                                        {viewBooking.paymentStatus}
                                    </span>
                                </div>

                                {/* Patient & Schedule */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Patient</p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                                                {viewBooking.patientName[0]}
                                            </div>
                                            <div>
                                                <p className="text-slate-700 font-semibold text-sm">{viewBooking.patientName}</p>
                                                <p className="text-slate-400 text-xs">{viewBooking.patientPhone}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Schedule</p>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="w-4 h-4 text-teal-500" strokeWidth={1.8} />
                                                <span className="text-slate-700 text-xs">
                                                    {new Date(viewBooking.scheduledDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="w-4 h-4 text-cyan-500" strokeWidth={1.8} />
                                                <span className="text-slate-700 text-xs">{viewBooking.scheduledTime}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                {viewBooking.collectionType === "home-collection"
                                                    ? <Home className="w-4 h-4 text-violet-500" strokeWidth={1.8} />
                                                    : <Building2 className="w-4 h-4 text-violet-500" strokeWidth={1.8} />}
                                                <span className="text-slate-700 text-xs capitalize">{viewBooking.collectionType.replace(/-/g, " ")}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Address if home collection */}
                                {viewBooking.collectionAddress?.street && (
                                    <div className="bg-slate-50 rounded-xl p-4 mb-5">
                                        <div className="flex items-start gap-2">
                                            <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" strokeWidth={1.8} />
                                            <div>
                                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Collection Address</p>
                                                <p className="text-slate-700 text-sm">
                                                    {[viewBooking.collectionAddress.street, viewBooking.collectionAddress.city, viewBooking.collectionAddress.pincode].filter(Boolean).join(", ")}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Tests & Packages */}
                                <div className="bg-slate-50 rounded-xl p-4 mb-5">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Tests & Packages</p>
                                    <div className="space-y-2">
                                        {viewBooking.tests.map((t, i) => (
                                            <div key={i} className="flex justify-between text-sm">
                                                <span className="text-slate-600">
                                                    {t.testName} {t.testCode && <span className="text-slate-400 text-xs">({t.testCode})</span>}
                                                </span>
                                                {t.price && <span className="text-teal-600 font-bold">₹{t.price}</span>}
                                            </div>
                                        ))}
                                        {viewBooking.packages.map((p, i) => (
                                            <div key={i} className="flex justify-between text-sm">
                                                <span className="text-slate-600">{p.packageName}</span>
                                                {p.price && <span className="text-violet-600 font-bold">₹{p.price}</span>}
                                            </div>
                                        ))}
                                        <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm">
                                            <span className="text-slate-700">Total</span>
                                            <span className="text-teal-600">₹{viewBooking.finalAmount || viewBooking.totalAmount || 0}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Notes */}
                                {viewBooking.notes && (
                                    <div className="bg-slate-50 rounded-xl p-4 mb-5">
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Notes</p>
                                        <p className="text-slate-600 text-sm">{viewBooking.notes}</p>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4 border-t border-slate-100">
                                    <button onClick={closeModal} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm rounded-xl py-2.5 transition-all">Close</button>
                                    <Link href={`/admin/bookings/${viewBooking._id}`} onClick={closeModal}
                                        className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl py-2.5 transition-all shadow-lg shadow-teal-200">
                                        View Full Details
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="px-6 py-16 text-center text-slate-400">Booking not found</div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
