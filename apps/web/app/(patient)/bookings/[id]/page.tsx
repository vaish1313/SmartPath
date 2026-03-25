"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft, FlaskConical, Calendar, Clock,
    MapPin, Download, Share2, CheckCircle2,
    Circle, AlertCircle, Home, Building2, Phone
} from "lucide-react";

const MOCK_BOOKING = {
    id: "1",
    bookingNumber: "SP-2025-0041",
    tests: [
        { name: "Complete Blood Count (CBC)", price: 299, category: "Haematology" },
        { name: "Lipid Profile", price: 499, category: "Biochemistry" },
    ],
    date: "2025-03-22",
    time: "9:00 AM",
    collectionType: "lab",
    status: "completed" as const,
    total: 798,
    reportReady: true,
    patientName: "Jessi Kumar",
    patientPhone: "+91 98765 43210",
    patientAge: 22,
    address: null,
    createdAt: "2025-03-20T10:30:00Z",
    timeline: [
        { label: "Booking Confirmed", time: "20 Mar, 10:30 AM", done: true },
        { label: "Sample Collected", time: "22 Mar, 9:10 AM", done: true },
        { label: "Sample Processing", time: "22 Mar, 11:00 AM", done: true },
        { label: "Report Generated", time: "22 Mar, 5:30 PM", done: true },
    ],
};

const STATUS_CONFIG = {
    booked: { label: "Booked", color: "#0EA5E9" },
    sample_collected: { label: "Sample Collected", color: "#F59E0B" },
    processing: { label: "Processing", color: "#F59E0B" },
    completed: { label: "Completed", color: "#14D7B4" },
    cancelled: { label: "Cancelled", color: "#EF4444" },
};

export default function BookingDetailPage() {
    const router = useRouter();
    const params = useParams();
    // TODO: fetch booking by params.id from booking-service
    const booking = MOCK_BOOKING;
    const status = STATUS_CONFIG[booking.status];

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("en-IN", {
            weekday: "long", day: "numeric", month: "long", year: "numeric"
        });

    return (
        <div className="min-h-screen bg-[#060B14]">
            <div
                className="fixed inset-0 pointer-events-none opacity-40"
                style={{
                    backgroundImage: "linear-gradient(rgba(20,215,180,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(20,215,180,0.03) 1px,transparent 1px)",
                    backgroundSize: "48px 48px",
                }}
            />

            <div className="relative z-10 max-w-2xl mx-auto px-6 py-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-[#8899AA] hover:text-white hover:border-white/20 transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div>
                            <h1 className="text-white font-semibold">Booking Details</h1>
                            <p className="text-[#445566] text-xs font-mono">#{booking.bookingNumber}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-[#8899AA] hover:text-white transition-all">
                            <Share2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Status banner */}
                <div
                    className="rounded-2xl p-4 mb-5 flex items-center justify-between"
                    style={{ background: `${status.color}08`, border: `1px solid ${status.color}25` }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${status.color}15` }}>
                            <FlaskConical className="w-5 h-5" style={{ color: status.color }} strokeWidth={1.8} />
                        </div>
                        <div>
                            <p className="text-white font-semibold text-sm">{status.label}</p>
                            <p className="text-[#556677] text-xs">
                                {booking.tests.length} test{booking.tests.length > 1 ? "s" : ""} · ₹{booking.total}
                            </p>
                        </div>
                    </div>
                    {booking.reportReady && (
                        <button className="flex items-center gap-2 bg-gradient-to-r from-[#14D7B4] to-[#0EA5E9] text-[#060B14] font-bold text-xs px-4 py-2.5 rounded-xl hover:opacity-90 transition-all">
                            <Download className="w-3.5 h-3.5" />
                            Download Report
                        </button>
                    )}
                </div>

                {/* Tests */}
                <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5 mb-4">
                    <p className="text-xs font-semibold text-[#8899AA] uppercase tracking-wider mb-4">Tests</p>
                    <div className="space-y-3">
                        {booking.tests.map(t => (
                            <div key={t.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[#14D7B4]/10 flex items-center justify-center">
                                        <FlaskConical className="w-3.5 h-3.5 text-[#14D7B4]" strokeWidth={1.8} />
                                    </div>
                                    <div>
                                        <p className="text-white text-sm font-medium">{t.name}</p>
                                        <p className="text-[#445566] text-xs">{t.category}</p>
                                    </div>
                                </div>
                                <span className="text-[#14D7B4] font-bold text-sm">₹{t.price}</span>
                            </div>
                        ))}
                        <div className="border-t border-white/6 pt-3 flex justify-between">
                            <span className="text-[#667788] text-sm">Total paid</span>
                            <span className="text-white font-bold">₹{booking.total}</span>
                        </div>
                    </div>
                </div>

                {/* Schedule */}
                <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5 mb-4">
                    <p className="text-xs font-semibold text-[#8899AA] uppercase tracking-wider mb-4">Schedule</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <Calendar className="w-4 h-4 text-[#14D7B4] mt-0.5 flex-shrink-0" strokeWidth={1.8} />
                            <div>
                                <p className="text-[#556677] text-xs mb-0.5">Date</p>
                                <p className="text-white text-sm font-medium">{formatDate(booking.date)}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Clock className="w-4 h-4 text-[#0EA5E9] mt-0.5 flex-shrink-0" strokeWidth={1.8} />
                            <div>
                                <p className="text-[#556677] text-xs mb-0.5">Time slot</p>
                                <p className="text-white text-sm font-medium">{booking.time}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            {(booking.collectionType === "home"
                                ? <Home className="w-4 h-4 text-[#8B5CF6] mt-0.5 flex-shrink-0" strokeWidth={1.8} />
                                : <Building2 className="w-4 h-4 text-[#8B5CF6] mt-0.5 flex-shrink-0" strokeWidth={1.8} />
                            )}
                            <div>
                                <p className="text-[#556677] text-xs mb-0.5">Collection</p>
                                <p className="text-white text-sm font-medium">
                                    {(booking.collectionType === "home" ? "Home Collection" : "Lab Visit")}
                                </p>
                            </div>
                        </div>
                        {booking.address && (
                            <div className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-[#F59E0B] mt-0.5 flex-shrink-0" strokeWidth={1.8} />
                                <div>
                                    <p className="text-[#556677] text-xs mb-0.5">Address</p>
                                    <p className="text-white text-sm">{booking.address}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Timeline */}
                <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5 mb-4">
                    <p className="text-xs font-semibold text-[#8899AA] uppercase tracking-wider mb-5">Timeline</p>
                    <div className="space-y-0">
                        {booking.timeline.map((item, i) => (
                            <div key={item.label} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? "bg-[#14D7B4]/15" : "bg-white/5"
                                        }`}>
                                        {item.done
                                            ? <CheckCircle2 className="w-4 h-4 text-[#14D7B4]" strokeWidth={2} />
                                            : <Circle className="w-4 h-4 text-[#334455]" strokeWidth={2} />
                                        }
                                    </div>
                                    {i < booking.timeline.length - 1 && (
                                        <div className={`w-px flex-1 my-1 ${item.done ? "bg-[#14D7B4]/30" : "bg-white/8"}`} style={{ minHeight: "20px" }} />
                                    )}
                                </div>
                                <div className="pb-4">
                                    <p className={`text-sm font-medium ${item.done ? "text-white" : "text-[#445566]"}`}>
                                        {item.label}
                                    </p>
                                    <p className="text-[#445566] text-xs mt-0.5">{item.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Patient info */}
                <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5 mb-6">
                    <p className="text-xs font-semibold text-[#8899AA] uppercase tracking-wider mb-4">Patient</p>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#14D7B4]/30 to-[#0EA5E9]/20 flex items-center justify-center text-[#14D7B4] font-bold text-sm flex-shrink-0">
                            {booking.patientName[0]}
                        </div>
                        <div className="flex-1">
                            <p className="text-white font-medium text-sm">{booking.patientName}</p>
                            <p className="text-[#445566] text-xs">{booking.patientAge} years</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-[#445566] text-xs">
                            <Phone className="w-3 h-3" />
                            {booking.patientPhone}
                        </div>
                    </div>
                </div>

                {/* Lab contact */}
                <div className="bg-[#0D1F1A] border border-[#14D7B4]/15 rounded-2xl p-4 text-center">
                    <p className="text-[#556677] text-xs mb-1">Need help with this booking?</p>
                    <p className="text-white text-sm font-medium">Call us: <span className="text-[#14D7B4]">+91 98765 43210</span></p>
                    <p className="text-[#445566] text-xs mt-0.5">Mon–Sat · 7:00 AM – 7:00 PM</p>
                </div>
            </div>
        </div>
    );
}