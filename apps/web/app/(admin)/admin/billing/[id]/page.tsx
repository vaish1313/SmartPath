"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getInvoiceById, recordPayment, generateInvoicePdf } from "@/lib/api";
import { ArrowLeft, Loader2, Download, Plus, CheckCircle, FileText } from "lucide-react";
import axios from "axios";

interface Payment { amount: number; method: string; transactionId?: string; paidAt: string; }
interface Invoice {
    _id: string; invoiceId: string; patientName: string; patientPhone: string; patientId: string;
    items: { description: string; quantity: number; unitPrice: number; totalPrice: number }[];
    subtotal: number; gstRate: number; gstAmount: number; totalAmount: number;
    discount?: { type?: string; value?: number; reason?: string };
    finalAmount: number; paidAmount: number; balanceAmount: number;
    paymentStatus: string; payments: Payment[];
    notes?: string; pdfUrl?: string; createdAt: string;
}

const PAYMENT_STYLE: Record<string, string> = {
    unpaid: "bg-red-50 text-red-600 border-red-200",
    partial: "bg-amber-50 text-amber-700 border-amber-200",
    paid: "bg-teal-50 text-teal-700 border-teal-200",
};

export default function InvoiceDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showPayment, setShowPayment] = useState(false);
    const [payAmount, setPayAmount] = useState("");
    const [payMethod, setPayMethod] = useState("cash");
    const [payTxn, setPayTxn] = useState("");
    const [paying, setPaying] = useState(false);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        if (!id) return;
        getInvoiceById(id)
            .then((res) => setInvoice(res.data?.invoice ?? res.data))
            .catch((err) => { if (!axios.isAxiosError(err) || err.response?.status !== 401) setError("Invoice not found"); })
            .finally(() => setLoading(false));
    }, [id]);

    const handlePayment = async () => {
        if (!invoice || !payAmount) return;
        setPaying(true);
        try {
            const res = await recordPayment(invoice._id, { amount: parseFloat(payAmount), method: payMethod, transactionId: payTxn || undefined });
            setInvoice(res.data.invoice);
            setShowPayment(false);
            setPayAmount(""); setPayTxn("");
        } catch (err) {
            if (axios.isAxiosError(err)) setError(err.response?.data?.message || "Payment failed");
        } finally { setPaying(false); }
    };

    const handleGeneratePdf = async () => {
        if (!invoice) return;
        setGenerating(true);
        try {
            const res = await generateInvoicePdf(invoice._id);
            setInvoice((prev) => prev ? { ...prev, pdfUrl: res.data.pdfUrl } : prev);
        } catch { setError("Failed to generate PDF"); }
        finally { setGenerating(false); }
    };

    const inputCls = "w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm placeholder:text-slate-300 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all";

    if (loading) return <div className="flex-1 flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-teal-500 animate-spin" /></div>;
    if (error || !invoice) return (
        <div className="flex-1 flex items-center justify-center flex-col gap-3 py-20">
            <p className="text-slate-500">{error || "Invoice not found"}</p>
            <Link href="/admin/billing" className="text-teal-600 text-sm font-semibold">Back to Billing</Link>
        </div>
    );

    const discountAmt = invoice.totalAmount - invoice.finalAmount;

    return (
        <main className="p-6 max-w-3xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 shadow-sm transition-all">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Invoice</h1>
                        <p className="text-teal-600 text-xs font-mono font-semibold">{invoice.invoiceId}</p>
                    </div>
                </div>
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border capitalize ${PAYMENT_STYLE[invoice.paymentStatus] || PAYMENT_STYLE.unpaid}`}>
                    {invoice.paymentStatus}
                </span>
            </div>

            {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

            {/* Patient */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 mb-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Patient</p>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                        {invoice.patientName?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div>
                        <p className="text-slate-700 font-semibold">{invoice.patientName}</p>
                        <p className="text-slate-400 text-xs">{invoice.patientPhone} · {invoice.patientId}</p>
                    </div>
                    <p className="ml-auto text-slate-400 text-xs">{new Date(invoice.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
            </div>

            {/* Items */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden mb-4">
                <div className="px-5 py-4 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Items</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                {["Description", "Qty", "Unit Price", "Total"].map((h) => (
                                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items.map((item, i) => (
                                <tr key={i} className="border-b border-slate-50">
                                    <td className="px-5 py-3 text-slate-700">{item.description}</td>
                                    <td className="px-5 py-3 text-slate-500">{item.quantity}</td>
                                    <td className="px-5 py-3 text-slate-600">₹{item.unitPrice}</td>
                                    <td className="px-5 py-3 text-slate-700 font-semibold">₹{item.totalPrice}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-5 py-4 border-t border-slate-100 space-y-1.5 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="text-slate-700">₹{invoice.subtotal}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">GST ({invoice.gstRate}%)</span><span className="text-slate-700">₹{invoice.gstAmount}</span></div>
                    {discountAmt > 0 && <div className="flex justify-between"><span className="text-slate-500">Discount {invoice.discount?.reason ? `(${invoice.discount.reason})` : ""}</span><span className="text-green-600">-₹{discountAmt.toFixed(2)}</span></div>}
                    <div className="flex justify-between font-bold border-t border-slate-100 pt-2"><span className="text-slate-700">Total</span><span className="text-teal-600 text-base">₹{invoice.finalAmount}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Paid</span><span className="text-teal-600 font-semibold">₹{invoice.paidAmount}</span></div>
                    <div className={`flex justify-between font-bold ${invoice.balanceAmount > 0 ? "text-red-500" : "text-teal-600"}`}>
                        <span>{invoice.balanceAmount > 0 ? "Balance Due" : "Fully Paid"}</span>
                        <span>₹{invoice.balanceAmount}</span>
                    </div>
                </div>
            </div>

            {/* Payment history */}
            {invoice.payments.length > 0 && (
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 mb-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Payment History</p>
                    <div className="space-y-2">
                        {invoice.payments.map((p, i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-teal-500" strokeWidth={1.8} />
                                    <div>
                                        <p className="text-slate-700 text-sm font-semibold">₹{p.amount} via {p.method}</p>
                                        {p.transactionId && <p className="text-slate-400 text-xs">Txn: {p.transactionId}</p>}
                                    </div>
                                </div>
                                <p className="text-slate-400 text-xs">{new Date(p.paidAt).toLocaleDateString("en-IN")}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Record payment modal */}
            {showPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                        <h2 className="text-base font-bold text-slate-800 mb-4">Record Payment</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount (₹)</label>
                                <input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder={`Max ₹${invoice.balanceAmount}`} className={`${inputCls} mt-1`} />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Method</label>
                                <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)} className={`${inputCls} mt-1`} style={{ backgroundColor: "white" }}>
                                    <option value="cash">Cash</option>
                                    <option value="upi">UPI</option>
                                    <option value="card">Card</option>
                                    <option value="online">Online</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Transaction ID (optional)</label>
                                <input type="text" value={payTxn} onChange={(e) => setPayTxn(e.target.value)} placeholder="UPI/Card ref" className={`${inputCls} mt-1`} />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-5">
                            <button onClick={() => setShowPayment(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm rounded-xl py-2.5 transition-all">Cancel</button>
                            <button onClick={handlePayment} disabled={!payAmount || paying}
                                className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl py-2.5 transition-all shadow-lg shadow-teal-200">
                                {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Record"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
                {invoice.paymentStatus !== "paid" && (
                    <button onClick={() => setShowPayment(true)}
                        className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-md shadow-teal-200">
                        <Plus className="w-4 h-4" /> Record Payment
                    </button>
                )}
                {!invoice.pdfUrl && (
                    <button onClick={handleGeneratePdf} disabled={generating}
                        className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-md shadow-violet-200">
                        {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} Generate PDF
                    </button>
                )}
                {invoice.pdfUrl && (
                    <a href={`http://localhost:3002${invoice.pdfUrl}`} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all">
                        <Download className="w-4 h-4" /> Download PDF
                    </a>
                )}
            </div>
        </main>
    );
}
