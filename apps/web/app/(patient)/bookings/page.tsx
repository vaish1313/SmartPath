"use client";

import { useState } from "react";
import Link from "next/link";
import {
    FlaskConical, Clock, Calendar, ChevronRight,
    Search, SlidersHorizontal, Plus
} from "lucide-react";

/* ── Types ── */
interface Booking {
    id: string;
    bookingNumber: string;
    tests: string[];
    date: string;
    time: string;
    collectionType: "lab" | "home";
    status: "booked" | "sample_collected" | "processing" | "completed" | "cancelled";
    total: number;
    reportReady: boolean;
}

/* ── Mock data ── */
const MOCK_BOOKINGS: Booking[] = [
    {
        id: "1", bookingNumber: "SP-2025-0041",
        tests: ["Complete Blood Count (CBC)", "Lipid Profile"],
        date: "2025-03-22", time: "9:00 AM",
        collectionType: "lab", status: "completed", total: 798, reportReady: true,
    },
    {
        id: "2", bookingNumber: "SP-2025-0038",
        tests: ["Thyroid Panel (T3, T4, TSH)"],
        date: "2025-03-20", time: "8:00 AM",
        collectionType: "home", status: "processing", total: 699, reportReady: false,
    },
    {
        id: "3", bookingNumber: "SP-2025-0035",
        tests: ["HbA1c", "Blood Sugar Fasting"],
        date: "2025-03-18", time: "7:30 AM",
        collectionType: "lab", status: "completed", total: 498, reportReady: true,
    },
    {
        id: "4", bookingNumber: "SP-2025-0031",
        tests: ["Vitamin D Total", "Vitamin B12"],
        date: "2025-03-15", time: "10:00 AM",
        collectionType: "lab", status: "completed", total: 1498, reportReady: true,
    },
    {
        id: "5", bookingNumber: "SP-2025-0028",
        tests: ["Urine Routine & Microscopy"],
        date: "2025-03-10", time: "7:00 AM",
        collectionType: "lab", status: "cancelled", total: 199, reportReady: false,
    },
    {
        id: "6", bookingNumber: "SP-2025-0025",
        tests: ["Liver Function Test (LFT)", "Kidney Function Test (KFT)"],
        date: "2025-03-05", time: "8:30 AM",
        collectionType: "home", status: "completed", total: 948, reportReady: true,
    },
];

const STATUS_CONFIG = {
    booked: { label: "Booked", color: "#0EA5E9", bg: "#0EA5E910" },
    sample_collected: { label: "Sample Collected", color: "#F59E0B", bg: "#F59E0B10" },
    processing: { label: "Processing", color: "#F59E0B", bg: "#F59E0B10" },
    completed: { label: "Completed", color: "#14D7B4", bg: "#14D7B410" },
    cancelled: { label: "Cancelled", color: "#EF4444", bg: "#EF444410" },
};

const FILTERS = ["All", "Booked", "Processing", "Completed", "Cancelled"];

export default function BookingsPage() {
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");

    const filtered = MOCK_BOOKINGS.filter(b => {
        const matchSearch =
            b.bookingNumber.toLowerCase().includes(search.toLowerCase()) ||
            b.tests.some(t => t.toLowerCase().includes(search.toLowerCase()));
        const matchFilter =
            activeFilter === "All" ||
            (activeFilter === "Booked" && b.status === "booked") ||
            (activeFilter === "Processing" && (b.status === "processing" || b.status === "sample_collected")) ||
            (activeFilter === "Completed" && b.status === "completed") ||
            (activeFilter === "Cancelled" && b.status === "cancelled");
        return matchSearch && matchFilter;
    });

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

    return (
        <div className="min-h-screen bg-[#060B14]">
            <div
                className="fixed inset-0 pointer-events-none opacity-40"
                style={{
                    backgroundImage: "linear-gradient(rgba(20,215,180,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(20,215,180,0.03) 1px,transparent 1px)",
                    backgroundSize: "48px 48px",
                }}
            />

            <div className="relative z-10 max-w-3xl mx-auto px-6 py-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>
                            My Bookings
                        </h1>
                        <p className="text-[#556677] text-sm mt-0.5">{MOCK_BOOKINGS.length} total bookings</p>
                    </div>
                    <Link
                        href="/book-test"
                        className="flex items-center gap-2 bg-gradient-to-r from-[#14D7B4] to-[#0EA5E9] text-[#060B14] font-bold text-sm px-4 py-2.5 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-[#14D7B4]/20"
                    >
                        <Plus className="w-4 h-4" />
                        Book test
                    </Link>
                </div>

                {/* Search + filter */}
                <div className="flex gap-3 mb-5">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#445566]" />
                        <input
                            type="text"
                            placeholder="Search by test or booking ID..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-white text-sm placeholder:text-[#445566] outline-none focus:border-[#14D7B4]/50 focus:ring-2 focus:ring-[#14D7B4]/10 transition-all"
                        />
                    </div>
                    <button className="w-11 h-11 bg-white/[0.04] border border-white/10 rounded-xl flex items-center justify-center text-[#667788] hover:text-white hover:border-white/20 transition-all">
                        <SlidersHorizontal className="w-4 h-4" />
                    </button>
                </div>

                {/* Filter pills */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                    {FILTERS.map(f => (
                        <button
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            className={`text-xs px-3.5 py-1.5 rounded-full border whitespace-nowrap transition-all ${activeFilter === f
                                    ? "bg-[#14D7B4]/15 border-[#14D7B4]/40 text-[#14D7B4]"
                                    : "bg-white/[0.03] border-white/10 text-[#667788] hover:border-white/20"
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Bookings list */}
                {filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <FlaskConical className="w-12 h-12 text-[#223344] mx-auto mb-4" strokeWidth={1.5} />
                        <p className="text-[#445566] text-sm">No bookings found</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map(booking => {
                            const status = STATUS_CONFIG[booking.status];
                            return (
                                <Link
                                    key={booking.id}
                                    href={`/bookings/${booking.id}`}
                                    className="block bg-white/[0.02] border border-white/8 rounded-2xl p-5 hover:border-white/16 hover:bg-white/[0.04] transition-all duration-200 group"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[#14D7B4] text-xs font-mono font-semibold">
                                                    #{booking.bookingNumber}
                                                </span>
                                                <span
                                                    className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full"
                                                    style={{ color: status.color, background: status.bg, border: `1px solid ${status.color}25` }}
                                                >
                                                    {status.label}
                                                </span>
                                                {booking.reportReady && (
                                                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full text-[#14D7B4] bg-[#14D7B4]/10 border border-[#14D7B4]/20">
                                                        Report Ready
                                                    </span>
                                                )}
                                            </div>
                                            <div className="space-y-0.5">
                                                {booking.tests.map(t => (
                                                    <p key={t} className="text-white text-sm font-medium">{t}</p>
                                                ))}
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-[#334455] group-hover:text-[#667788] transition-colors mt-1 flex-shrink-0" />
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-white/6">
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1.5 text-[#556677] text-xs">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(booking.date)}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-[#556677] text-xs">
                                                <Clock className="w-3 h-3" />
                                                {booking.time}
                                            </span>
                                            <span className="text-[#445566] text-xs capitalize">
                                                {booking.collectionType === "home" ? "🏠 Home" : "🏥 Lab"}
                                            </span>
                                        </div>
                                        <span className="text-[#14D7B4] font-bold text-sm">₹{booking.total}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}