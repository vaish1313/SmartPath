"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getBookingById } from "@/lib/api";
import { ArrowLeft, FlaskConical, Calendar, Clock, MapPin, Download, Share2, CheckCircle2, Circle, Home, Building2, Phone, Loader2 } from "lucide-react";
import axios from "axios";

interface Booking {
    _id: string;
    bookingId: string;
    patientName: string;
    patientPhone: string;
    tests: { testName: string; testCode: string; price: number }[];
    totalAmount: number;
    discountAmount: number;
    finalAmount: number;
    bookingType: string;
    status: string;
    appointmentDate: string;
    appointmentSlot: string;
    address?: { street?: string; city?: string; state?: string; pincode?: string };
    paymentStatus: string;
    createdAt: string;
}

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: "Pending", color: "#64748b", bg: "#f1f5f9" },
    confirmed: { label: "Confirmed", color: "#3b82f6", bg: "#eff6ff" },
    "sample-collected": { label: "Sample Collected", color: "#8b5cf6", bg: "#f5f3ff" },
    processing: { label: "Processing", color: "#f59e0b", bg: "#fffbeb" },
    completed: { label: "Completed", color: "#0d9488", bg: "#f0fdfa" },
    cancelled: { label: "Cancelled", color: "#ef4444", bg: "#fef2f2" },
};

const TIMELINE_STEPS = ["pending", "confirmed", "sample-collected", "processing", "completed"];

export default function BookingDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;
        getBookingById(id)
            .then((res) => setBooking(res.data.booking))
            .catch((err) => {
                if (axios.isAxiosError(err) && err.response?.status !== 401)
                    setError(err.response?.data?.message || "Booking not found");
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div className="flex-1 flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
        </div>
    );

    if (error || !booking) return (
        <div className="flex-1 flex items-center justify-center flex-col gap-3 py-20">
            <p className="text-slate-500">{error || "Booking not found"}</p>
            <Link href="/bookings" className="text-teal-600 text-sm font-semibold">Back to bookings</Link>
        </div>
    );

    const statusInfo = STATUS_STYLE[booking.status] || STATUS_STYLE.pending;
    const currentStep = TIMELINE_STEPS.indexOf(booking.status);

    return (
        <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 shadow-sm transition-all">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-slate-800 font-bold text-lg">Booking Details</h1>
                        <p className="text-slate-400 text-xs font-mono">#{booking.bookingId}</p>
                    </div>
                </div>
                <button className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 shadow-sm transition-all">
                    <Share2 className="w-4 h-4" />
                </button>
            </div>

            {/* Status banner */}
            <div className="rounded-2xl p-4 mb-4 flex items-center justify-between border shadow-sm" style={{ background: statusInfo.bg, borderColor: `${statusInfo.color}30` }}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${statusInfo.color}15` }}>
                        <FlaskConical className="w-5 h-5" style={{ color: statusInfo.color }} strokeWidth={1.8} />
                    </div>
                    <div>
                        <p className="font-semibold text-sm" style={{ color: statusInfo.color }}>{statusInfo.label}</p>
                        <p className="text-slate-500 text-xs">{booking.tests.length} test{booking.tests.length > 1 ? "s" : ""} · ₹{booking.finalAmount}</p>
                    </div>
                </div>
                {booking.status === "completed" && (
                    <button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md">
                        <Download className="w-3.5 h-3.5" /> Download Report
                    </button>
                )}
            </div>

            {/* Timeline */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 mb-4 shadow-sm">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Progress</p>
                <div className="flex items-center">
                    {TIMELINE_STEPS.filter((s) => s !== "cancelled").map((s, i, arr) => {
                        const done = currentStep >= i && booking.status !== "cancelled";
                        return (
                            <div key={s} className="flex items-center flex-1 last:flex-none">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${done ? "bg-teal-500" : "bg-slate-100"}`}>
                                    {done ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Circle className="w-4 h-4 text-slate-300" />}
                                </div>
                                {i < arr.length - 1 && (
                                    <div className="flex-1 h-px mx-1 bg-slate-100 overflow-hidden">
                                        <div className="h-full bg-teal-400 transition-all duration-500" style={{ width: currentStep > i ? "100%" : "0%" }} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="flex mt-2">
                    {TIMELINE_STEPS.filter((s) => s !== "cancelled").map((s) => (
                        <div key={s} className="flex-1 text-center">
                            <p className="text-[9px] text-slate-400 capitalize leading-tight">{s.replace("-", " ")}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tests */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 mb-4 shadow-sm">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Tests</p>
                <div className="space-y-3">
                    {booking.tests.map((t) => (
                        <div key={t.testCode} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                                    <FlaskConical className="w-3.5 h-3.5 text-teal-500" strokeWidth={1.8} />
                                </div>
                                <div>
                                    <p className="text-slate-700 text-sm font-semibold">{t.testName}</p>
                                    <p className="text-slate-400 text-xs">{t.testCode}</p>
                                </div>
                            </div>
                            <span className="text-teal-600 font-bold text-sm">₹{t.price}</span>
                        </div>
                    ))}
                    {booking.discountAmount > 0 && (
                        <div className="flex justify-between text-sm pt-2 border-t border-slate-50">
                            <span className="text-slate-500">Discount</span>
                            <span className="text-green-600 font-semibold">-₹{booking.discountAmount}</span>
                        </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-slate-100">
                        <span className="text-slate-700 font-bold text-sm">Total</span>
                        <span className="text-teal-600 font-bold">₹{booking.finalAmount}</span>
                    </div>
                </div>
            </div>

            {/* Schedule */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 mb-4 shadow-sm">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Schedule</p>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                        <Calendar className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" strokeWidth={1.8} />
                        <div>
                            <p className="text-slate-400 text-xs">Date</p>
                            <p className="text-slate-700 text-sm font-semibold">
                                {new Date(booking.appointmentDate).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Clock className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" strokeWidth={1.8} />
                        <div>
                            <p className="text-slate-400 text-xs">Time slot</p>
                            <p className="text-slate-700 text-sm font-semibold">{booking.appointmentSlot}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        {booking.bookingType === "home-collection"
                            ? <Home className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" strokeWidth={1.8} />
                            : <Building2 className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" strokeWidth={1.8} />}
                        <div>
                            <p className="text-slate-400 text-xs">Collection</p>
                            <p className="text-slate-700 text-sm font-semibold">{booking.bookingType === "home-collection" ? "Home Collection" : "Lab Visit"}</p>
                        </div>
                    </div>
                    {booking.address?.street && (
                        <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" strokeWidth={1.8} />
                            <div>
                                <p className="text-slate-400 text-xs">Address</p>
                                <p className="text-slate-700 text-sm">{[booking.address.street, booking.address.city].filter(Boolean).join(", ")}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Patient */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 mb-4 shadow-sm">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Patient</p>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm">{booking.patientName[0]}</div>
                    <div className="flex-1">
                        <p className="text-slate-700 font-semibold text-sm">{booking.patientName}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                        <Phone className="w-3 h-3" /> {booking.patientPhone}
                    </div>
                </div>
            </div>

            {/* Help */}
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 text-center">
                <p className="text-slate-500 text-xs mb-1">Need help with this booking?</p>
                <p className="text-slate-700 text-sm font-semibold">Call us: <span className="text-teal-600">+91 98765 43210</span></p>
                <p className="text-slate-400 text-xs mt-0.5">Mon–Sat · 7:00 AM – 7:00 PM</p>
            </div>
        </main>
    );
}
