"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAllBookings, createInvoice } from "@/lib/api";
import { ArrowLeft, Search, Loader2, CheckCircle } from "lucide-react";
import axios from "axios";

interface Booking { _id: string; bookingId: string; patientName: string; patientPhone: string; patientId: string; tests?: { testName: string; price: number }[]; packages?: { packageName: string; price: number }[]; finalAmount: number; scheduledDate?: string; }

export default function NewInvoicePage() {
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [discountType, setDiscountType] = useState<"flat" | "percent">("flat");
    const [discountValue, setDiscountValue] = useState("");
    const [discountReason, setDiscountReason] = useState("");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        getAllBookings({ limit: 100 })
            .then((res) => setBookings(res.data.bookings || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = bookings.filter((b) =>
        b.bookingId?.toLowerCase().includes(search.toLowerCase()) ||
        b.patientName?.toLowerCase().includes(search.toLowerCase())
    );

    const items = selected ? [
        ...(selected.tests || []).map((t) => ({ description: t.testName, unitPrice: t.price, totalPrice: t.price })),
        ...(selected.packages || []).map((p) => ({ description: p.packageName, unitPrice: p.price, totalPrice: p.price })),
    ] : [];

    const subtotal = items.reduce((s, i) => s + i.totalPrice, 0) || selected?.finalAmount || 0;
    const gstAmount = parseFloat(((subtotal * 18) / 100).toFixed(2));
    const totalAmount = parseFloat((subtotal + gstAmount).toFixed(2));
    const discAmt = discountValue
        ? discountType === "percent" ? parseFloat(((totalAmount * parseFloat(discountValue)) / 100).toFixed(2)) : parseFloat(discountValue)
        : 0;
    const finalAmount = parseFloat((totalAmount - discAmt).toFixed(2));

    const handleSubmit = async () => {
        if (!selected) return;
        setSubmitting(true); setError("");
        try {
            const res = await createInvoice({
                bookingId: selected._id,
                discount: discountValue ? { type: discountType, value: parseFloat(discountValue), reason: discountReason } : undefined,
                notes,
            });
            router.push(`/admin/billing/${res.data.invoice._id}`);
        } catch (err) {
            if (axios.isAxiosError(err)) setError(err.response?.data?.message || "Failed to create invoice");
            else setError("Something went wrong.");
        } finally { setSubmitting(false); }
    };

    const inputCls = "w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm placeholder:text-slate-300 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all";
    const labelCls = "text-xs font-semibold text-slate-500 tracking-wide uppercase";

    return (
        <main className="p-6 max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
                <Link href="/admin/billing" className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 shadow-sm transition-all">
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Create Invoice</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Generate invoice from a booking</p>
                </div>
            </div>

            {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

            {/* Booking selection */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 mb-5">
                <h2 className="text-sm font-bold text-slate-700 mb-4">Select Booking</h2>
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by booking ID or patient..." className={`${inputCls} pl-9`} />
                </div>
                {loading ? <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 text-teal-500 animate-spin" /></div> : (
                    <div className="space-y-2 max-h-52 overflow-y-auto">
                        {filtered.slice(0, 20).map((b) => (
                            <button key={b._id} onClick={() => setSelected(b)}
                                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${selected?._id === b._id ? "bg-teal-50 border-teal-300" : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50"}`}>
                                <div>
                                    <p className="text-slate-700 text-sm font-semibold">{b.patientName}</p>
                                    <p className="text-slate-400 text-xs">{b.bookingId} · ₹{b.finalAmount}</p>
                                </div>
                                {selected?._id === b._id && <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" />}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Preview */}
            {selected && (
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 mb-5">
                    <h2 className="text-sm font-bold text-slate-700 mb-4">Invoice Preview</h2>
                    <div className="space-y-2 mb-4">
                        {items.length > 0 ? items.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm">
                                <span className="text-slate-600">{item.description}</span>
                                <span className="text-slate-700 font-semibold">₹{item.totalPrice}</span>
                            </div>
                        )) : (
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Diagnostic Services</span>
                                <span className="text-slate-700 font-semibold">₹{selected.finalAmount}</span>
                            </div>
                        )}
                    </div>
                    <div className="border-t border-slate-100 pt-3 space-y-1.5 text-sm">
                        <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="text-slate-700">₹{subtotal}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">GST (18%)</span><span className="text-slate-700">₹{gstAmount}</span></div>
                        {discAmt > 0 && <div className="flex justify-between"><span className="text-slate-500">Discount</span><span className="text-green-600">-₹{discAmt}</span></div>}
                        <div className="flex justify-between font-bold border-t border-slate-100 pt-2"><span className="text-slate-700">Final Amount</span><span className="text-teal-600 text-base">₹{finalAmount}</span></div>
                    </div>
                </div>
            )}

            {/* Discount & notes */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 mb-5 space-y-4">
                <h2 className="text-sm font-bold text-slate-700">Discount & Notes</h2>
                <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                        <label className={labelCls}>Discount Type</label>
                        <select value={discountType} onChange={(e) => setDiscountType(e.target.value as "flat" | "percent")} className={inputCls} style={{ backgroundColor: "white" }}>
                            <option value="flat">Flat (₹)</option>
                            <option value="percent">Percent (%)</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className={labelCls}>Value</label>
                        <input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} placeholder="0" className={inputCls} />
                    </div>
                    <div className="space-y-1.5">
                        <label className={labelCls}>Reason</label>
                        <input type="text" value={discountReason} onChange={(e) => setDiscountReason(e.target.value)} placeholder="Optional" className={inputCls} />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className={labelCls}>Notes</label>
                    <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional notes..." className={`${inputCls} resize-none`} />
                </div>
            </div>

            <div className="flex gap-3">
                <Link href="/admin/billing" className="flex-1 flex items-center justify-center bg-white border border-slate-200 rounded-xl py-3 text-slate-500 hover:text-slate-700 text-sm transition-all shadow-sm">Cancel</Link>
                <button onClick={handleSubmit} disabled={!selected || submitting}
                    className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl py-3 transition-all shadow-lg shadow-teal-200">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Invoice"}
                </button>
            </div>
        </main>
    );
}
