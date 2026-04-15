"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import PageHeader from "@/components/shared/PageHeader";
import { getAllInvoices, getAllBookings, createInvoice } from "@/lib/api";
import { Plus, Search, Loader2, Receipt, Eye, X, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";

interface Invoice {
    _id: string;
    invoiceId: string;
    patientName: string;
    patientPhone: string;
    finalAmount: number;
    paidAmount: number;
    balanceAmount: number;
    paymentStatus: string;
    createdAt: string;
}

interface Booking {
    _id: string;
    bookingId: string;
    patientName: string;
    patientPhone: string;
    patientId: string;
    tests?: { testName: string; price: number }[];
    packages?: { packageName: string; price: number }[];
    finalAmount: number;
}

const invoiceSchema = z.object({
    bookingId: z.string().min(1, "Select a booking"),
    discountType: z.enum(["flat", "percent"]).optional(),
    discountValue: z.string().optional(),
    discountReason: z.string().optional(),
    notes: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

const PAYMENT_STYLE: Record<string, string> = {
    unpaid: "bg-red-50 text-red-600 border-red-200",
    partial: "bg-amber-50 text-amber-700 border-amber-200",
    paid: "bg-teal-50 text-teal-700 border-teal-200",
};

const TABS = ["all", "unpaid", "partial", "paid"];

function useDebounce<T>(value: T, delay = 400): T {
    const [d, setD] = useState(value);
    useEffect(() => { const t = setTimeout(() => setD(value), delay); return () => clearTimeout(t); }, [value, delay]);
    return d;
}

export default function AdminBillingPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("all");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState("");

    const [modal, setModal] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [apiError, setApiError] = useState("");
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [bookingSearch, setBookingSearch] = useState("");
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } =
        useForm<InvoiceFormData>({ resolver: zodResolver(invoiceSchema) });

    const discountType = watch("discountType", "flat");
    const discountValue = watch("discountValue", "");

    const debouncedSearch = useDebounce(search);

    const fetchInvoices = useCallback(() => {
        setLoading(true);
        getAllInvoices({ page, limit: 15, paymentStatus: tab === "all" ? undefined : tab, search: debouncedSearch })
            .then((res) => {
                setInvoices(res.data.invoices || []);
                setTotal(res.data.total || 0);
                setTotalPages(res.data.totalPages || 1);
            })
            .catch((err) => { if (!axios.isAxiosError(err) || err.response?.status !== 401) setError("Failed to load invoices"); })
            .finally(() => setLoading(false));
    }, [page, tab, debouncedSearch]);

    useEffect(() => { fetchInvoices(); }, [fetchInvoices]);
    useEffect(() => { setPage(1); }, [tab, debouncedSearch]);

    // Stats from current page
    const totalRevenue = invoices.filter((i) => i.paymentStatus === "paid").reduce((s, i) => s + i.finalAmount, 0);
    const outstanding = invoices.filter((i) => i.paymentStatus !== "paid").reduce((s, i) => s + i.balanceAmount, 0);

    const openModal = () => {
        reset({});
        setApiError("");
        setModalLoading(true);
        setModal(true);
        setSelectedBooking(null);
        getAllBookings({ limit: 100 })
            .then((res) => setBookings(res.data.bookings || []))
            .catch(() => setApiError("Failed to load bookings"))
            .finally(() => setModalLoading(false));
    };

    const closeModal = () => {
        setModal(false);
        reset({});
        setApiError("");
        setSelectedBooking(null);
        setBookingSearch("");
    };

    const onSubmit = async (data: InvoiceFormData) => {
        setApiError("");
        try {
            const res = await createInvoice({
                bookingId: data.bookingId,
                discount: data.discountValue ? {
                    type: data.discountType || "flat",
                    value: parseFloat(data.discountValue),
                    reason: data.discountReason,
                } : undefined,
                notes: data.notes,
            });
            setInvoices((prev) => [res.data.invoice, ...prev]);
            setTotal((n) => n + 1);
            closeModal();
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setApiError(err.response?.data?.message || "Failed to create invoice");
            } else setApiError("Something went wrong.");
        }
    };

    const handleBookingSelect = (bookingId: string) => {
        const booking = bookings.find((b) => b._id === bookingId);
        setSelectedBooking(booking || null);
    };

    const filteredBookings = bookings.filter((b) =>
        b.bookingId?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        b.patientName?.toLowerCase().includes(bookingSearch.toLowerCase())
    );

    const calculateInvoicePreview = () => {
        if (!selectedBooking) return { subtotal: 0, gst: 0, discount: 0, final: 0 };
        const items = [
            ...(selectedBooking.tests || []).map((t) => t.price),
            ...(selectedBooking.packages || []).map((p) => p.price),
        ];
        const subtotal = items.reduce((s, p) => s + p, 0) || selectedBooking.finalAmount || 0;
        const gst = parseFloat(((subtotal * 18) / 100).toFixed(2));
        const total = parseFloat((subtotal + gst).toFixed(2));
        const discAmt = discountValue
            ? discountType === "percent" ? parseFloat(((total * parseFloat(discountValue)) / 100).toFixed(2)) : parseFloat(discountValue)
            : 0;
        const final = parseFloat((total - discAmt).toFixed(2));
        return { subtotal, gst, discount: discAmt, final };
    };

    const preview = calculateInvoicePreview();

    const inputCls = "w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm placeholder:text-slate-300 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all";
    const labelCls = "text-xs font-semibold text-slate-500 tracking-wide uppercase";

    return (
        <>
            <main className="p-6">
                <PageHeader
                    title="Billing"
                    subtitle="Invoice and payment management"
                    action={
                        <button onClick={openModal}
                            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-md shadow-teal-200">
                            <Plus className="w-4 h-4" /> New Invoice
                        </button>
                    }
                />

                {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

                {/* Quick stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: "Total Invoices", value: total, color: "teal" },
                        { label: "Paid (page)", value: invoices.filter((i) => i.paymentStatus === "paid").length, color: "teal" },
                        { label: "Pending (page)", value: invoices.filter((i) => i.paymentStatus !== "paid").length, color: "amber" },
                        { label: "Outstanding (page)", value: `₹${outstanding.toLocaleString("en-IN")}`, color: "red" },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/40 shadow-lg p-5 hover:shadow-xl hover:bg-white/70 transition-all">
                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-1">{label}</p>
                            <p className={`text-2xl font-bold text-${color}-600`}>{loading ? "—" : value}</p>
                        </div>
                    ))}
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
                    {TABS.map((t) => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize ${tab === t ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}>
                            {t === "all" ? "All" : t}
                        </button>
                    ))}
                </div>

                <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/40 shadow-lg overflow-hidden hover:shadow-xl hover:bg-white/70 transition-all">
                    <div className="px-5 py-4 border-b border-slate-100/60">
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input value={search} onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by invoice ID or patient..."
                                className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all" />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-teal-500 animate-spin" /></div>
                    ) : invoices.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mb-3">
                                <Receipt className="w-6 h-6 text-teal-400" strokeWidth={1.5} />
                            </div>
                            <p className="text-slate-500 text-sm">No invoices found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        {["Invoice ID", "Patient", "Amount", "Paid", "Balance", "Status", "Date", "Actions"].map((h) => (
                                            <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((inv) => (
                                        <tr key={inv._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-5 py-3.5 text-teal-600 font-semibold font-mono text-xs">{inv.invoiceId}</td>
                                            <td className="px-5 py-3.5">
                                                <p className="text-slate-700 font-semibold">{inv.patientName}</p>
                                                <p className="text-slate-400 text-xs">{inv.patientPhone}</p>
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-800 font-bold">₹{inv.finalAmount}</td>
                                            <td className="px-5 py-3.5 text-teal-600 font-semibold">₹{inv.paidAmount}</td>
                                            <td className={`px-5 py-3.5 font-semibold ${inv.balanceAmount > 0 ? "text-red-500" : "text-teal-600"}`}>
                                                ₹{inv.balanceAmount}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border capitalize ${PAYMENT_STYLE[inv.paymentStatus] || PAYMENT_STYLE.unpaid}`}>
                                                    {inv.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-400 text-xs">
                                                {new Date(inv.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <Link href={`/admin/billing/${inv._id}`} className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-all" title="View">
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
                            <p className="text-slate-400 text-xs">{total} total invoices</p>
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

            {/* New Invoice Modal */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
                                    <Receipt className="w-4 h-4 text-teal-600" strokeWidth={1.8} />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-slate-800">Create Invoice</h2>
                                    <p className="text-slate-400 text-xs">Generate invoice from a booking</p>
                                </div>
                            </div>
                            <button onClick={closeModal} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {modalLoading ? (
                            <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-teal-500 animate-spin" /></div>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
                                {apiError && <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{apiError}</div>}

                                {/* Booking Selection */}
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Select Booking *</label>
                                    <div className="relative mb-2">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input value={bookingSearch} onChange={(e) => setBookingSearch(e.target.value)}
                                            placeholder="Search by booking ID or patient..."
                                            className={`${inputCls} pl-9`} />
                                    </div>
                                    <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-2">
                                        {filteredBookings.slice(0, 20).map((b) => (
                                            <label key={b._id} className="flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all hover:bg-slate-50"
                                                style={{ borderColor: selectedBooking?._id === b._id ? "#14b8a6" : "#e2e8f0", backgroundColor: selectedBooking?._id === b._id ? "#f0fdfa" : "white" }}>
                                                <div className="flex items-center gap-3">
                                                    <input type="radio" {...register("bookingId")} value={b._id} onChange={() => handleBookingSelect(b._id)}
                                                        className="w-4 h-4 text-teal-600" />
                                                    <div>
                                                        <p className="text-slate-700 text-sm font-semibold">{b.patientName}</p>
                                                        <p className="text-slate-400 text-xs">{b.bookingId} · ₹{b.finalAmount}</p>
                                                    </div>
                                                </div>
                                                {selectedBooking?._id === b._id && <CheckCircle className="w-4 h-4 text-teal-500" />}
                                            </label>
                                        ))}
                                    </div>
                                    {errors.bookingId && <p className="text-red-500 text-xs">{errors.bookingId.message}</p>}
                                </div>

                                {/* Invoice Preview */}
                                {selectedBooking && (
                                    <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice Preview</p>
                                        {selectedBooking.tests && selectedBooking.tests.map((t, i) => (
                                            <div key={i} className="flex justify-between text-sm">
                                                <span className="text-slate-600">{t.testName}</span>
                                                <span className="text-slate-700 font-semibold">₹{t.price}</span>
                                            </div>
                                        ))}
                                        {selectedBooking.packages && selectedBooking.packages.map((p, i) => (
                                            <div key={i} className="flex justify-between text-sm">
                                                <span className="text-slate-600">{p.packageName}</span>
                                                <span className="text-slate-700 font-semibold">₹{p.price}</span>
                                            </div>
                                        ))}
                                        <div className="border-t border-slate-200 pt-2 space-y-1 text-sm">
                                            <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="text-slate-700">₹{preview.subtotal}</span></div>
                                            <div className="flex justify-between"><span className="text-slate-500">GST (18%)</span><span className="text-slate-700">₹{preview.gst}</span></div>
                                            {preview.discount > 0 && <div className="flex justify-between"><span className="text-slate-500">Discount</span><span className="text-green-600">-₹{preview.discount}</span></div>}
                                            <div className="flex justify-between font-bold border-t border-slate-200 pt-2"><span className="text-slate-700">Final Amount</span><span className="text-teal-600 text-base">₹{preview.final}</span></div>
                                        </div>
                                    </div>
                                )}

                                {/* Discount */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="space-y-1.5">
                                        <label className={labelCls}>Discount Type</label>
                                        <select {...register("discountType")} className={inputCls} style={{ backgroundColor: "white" }}>
                                            <option value="flat">Flat (₹)</option>
                                            <option value="percent">Percent (%)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className={labelCls}>Value</label>
                                        <input type="number" step="0.01" placeholder="0" {...register("discountValue")} className={inputCls} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className={labelCls}>Reason</label>
                                        <input type="text" placeholder="Optional" {...register("discountReason")} className={inputCls} />
                                    </div>
                                </div>

                                {/* Notes */}
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Notes</label>
                                    <textarea rows={2} placeholder="Any additional notes..." {...register("notes")} className={inputCls} />
                                </div>

                                <div className="flex gap-3 pt-1">
                                    <button type="button" onClick={closeModal} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm rounded-xl py-2.5 transition-all">Cancel</button>
                                    <button type="submit" disabled={isSubmitting}
                                        className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl py-2.5 transition-all shadow-lg shadow-teal-200">
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Invoice"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
