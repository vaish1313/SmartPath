"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import PageHeader from "@/components/shared/PageHeader";
import { getAllInvoices } from "@/lib/api";
import { Plus, Search, Loader2, Receipt, Eye } from "lucide-react";
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

    return (
        <main className="p-6">
            <PageHeader
                title="Billing"
                subtitle="Invoice and payment management"
                action={
                    <Link href="/admin/billing/new"
                        className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-md shadow-teal-200">
                        <Plus className="w-4 h-4" /> New Invoice
                    </Link>
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
                    <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
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

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
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
