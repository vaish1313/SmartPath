"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { getAllBookings } from "@/lib/api";
import { IndianRupee, TrendingUp, CreditCard, Receipt, Loader2 } from "lucide-react";
import axios from "axios";

interface Booking {
    _id: string;
    bookingId: string;
    patientName: string;
    tests: { testName: string }[];
    appointmentDate: string;
    finalAmount: number;
    paymentStatus: string;
    status: string;
}

export default function AdminBillingPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAllBookings({ limit: 50 })
            .then((res) => setBookings(res.data.bookings || []))
            .catch((err) => {
                if (!axios.isAxiosError(err) || err.response?.status !== 401) console.error(err);
            })
            .finally(() => setLoading(false));
    }, []);

    const totalRevenue = bookings
        .filter((b) => b.paymentStatus === "paid")
        .reduce((s, b) => s + b.finalAmount, 0);
    const paidCount = bookings.filter((b) => b.paymentStatus === "paid").length;
    const pendingCount = bookings.filter((b) => b.paymentStatus === "pending").length;

    return (
        <main className="p-6">
            <PageHeader title="Billing" subtitle="Revenue and invoice management" />

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                    { label: "Total Revenue", value: loading ? "—" : `₹${totalRevenue.toLocaleString("en-IN")}`, icon: IndianRupee, color: "teal" },
                    { label: "Total Bookings", value: loading ? "—" : String(bookings.length), icon: TrendingUp, color: "cyan" },
                    { label: "Paid", value: loading ? "—" : String(paidCount), icon: CreditCard, color: "violet" },
                    { label: "Pending Payment", value: loading ? "—" : String(pendingCount), icon: Receipt, color: "amber" },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide">{label}</span>
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-${color}-50`}>
                                <Icon className={`w-4 h-4 text-${color}-600`} strokeWidth={1.8} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-800">{value}</p>
                    </div>
                ))}
            </div>

            {/* Table */}
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
                                    {["Booking ID", "Patient", "Tests", "Date", "Amount", "Payment"].map((h) => (
                                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-16 text-center text-slate-400 text-sm">No bookings found</td>
                                    </tr>
                                ) : bookings.map((b) => (
                                    <tr key={b._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-3.5 text-teal-600 font-semibold font-mono text-xs">{b.bookingId}</td>
                                        <td className="px-5 py-3.5 text-slate-700 font-medium">{b.patientName}</td>
                                        <td className="px-5 py-3.5 text-slate-600">{b.tests.map((t) => t.testName).join(", ").slice(0, 35)}</td>
                                        <td className="px-5 py-3.5 text-slate-500">
                                            {new Date(b.appointmentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-800 font-bold">₹{b.finalAmount}</td>
                                        <td className="px-5 py-3.5">
                                            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border capitalize ${b.paymentStatus === "paid" ? "bg-teal-50 text-teal-700 border-teal-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                                                {b.paymentStatus}
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
