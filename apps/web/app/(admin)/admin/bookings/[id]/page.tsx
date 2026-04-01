"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getBookingById, updateBookingStatus, assignTechnician, getAllPatients } from "@/lib/api";
import { ArrowLeft, Loader2, Calendar, Clock, MapPin, Home, Building2, User, CheckCircle2, Circle } from "lucide-react";
import axios from "axios";

interface Booking {
    _id: string;
    bookingId?: string;
    patientName?: string;
    patientPhone?: string;
    patientId?: string;
    tests?: { testName?: string; testCode?: string; price?: number }[];
    packages?: { packageName?: string; price?: number }[];
    totalAmount?: number;
    finalAmount?: number;
    // new schema fields
    collectionType?: string;
    collectionAddress?: { street?: string; city?: string; pincode?: string };
    scheduledDate?: string;
    scheduledTime?: string;
    // legacy schema fields (old bookings)
    bookingType?: string;
    address?: { street?: string; city?: string; pincode?: string };
    appointmentDate?: string;
    appointmentSlot?: string;
    status?: string;
    paymentStatus?: string;
    assignedTechnician?: string;
    notes?: string;
    createdAt?: string;
}

const TIMELINE = ["pending", "confirmed", "sample-collected", "processing", "completed"];

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

export default function BookingDetailPage() {
    const params = useParams();
    const id = params?.id as string | undefined;
    const router = useRouter();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [technicians, setTechnicians] = useState<{ _id: string; fullName: string; role: string }[]>([]);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (!id) { setError("Invalid booking ID"); setLoading(false); return; }

        getBookingById(id)
            .then((res) => {
                const b = res.data?.booking ?? res.data;
                setBooking(b ?? null);
                if (!b) setError("Booking not found");
            })
            .catch((err) => {
                if (!axios.isAxiosError(err) || err.response?.status !== 401)
                    setError(axios.isAxiosError(err) ? (err.response?.data?.message || "Booking not found") : "Booking not found");
            })
            .finally(() => setLoading(false));

        getAllPatients({ limit: 100 })
            .then((res) => {
                const all: { _id: string; fullName: string; role: string }[] = res.data?.patients || [];
                setTechnicians(all.filter((p) => ["technician", "pathologist"].includes(p.role)));
            })
            .catch(() => { /* non-critical */ });
    }, [id]);

    const handleStatusChange = async (status: string) => {
        if (!booking?._id) return;
        setUpdating(true);
        try {
            const res = await updateBookingStatus(booking._id, status);
            setBooking(res.data?.booking ?? null);
        } catch { setError("Failed to update status"); }
        finally { setUpdating(false); }
    };

    const handleAssign = async (techId: string) => {
        if (!booking?._id) return;
        setUpdating(true);
        try {
            const res = await assignTechnician(booking._id, techId);
            setBooking(res.data?.booking ?? null);
        } catch { setError("Failed to assign technician"); }
        finally { setUpdating(false); }
    };

    if (loading) return (
        <div className="flex-1 flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
        </div>
    );

    if (error || !booking) return (
        <div className="flex-1 flex items-center justify-center flex-col gap-3 py-20">
            <p className="text-slate-500">{error || "Booking not found"}</p>
            <Link href="/admin/bookings" className="text-teal-600 text-sm font-semibold">Back to bookings</Link>
        </div>
    );

    // Normalise fields — support both old and new schema
    const status = booking.status ?? "pending";
    const collectionType = booking.collectionType ?? booking.bookingType ?? "walk-in";
    const scheduledDate = booking.scheduledDate ?? booking.appointmentDate;
    const scheduledTime = booking.scheduledTime ?? booking.appointmentSlot ?? "—";
    const collectionAddress = booking.collectionAddress ?? booking.address;
    const currentStep = TIMELINE.indexOf(status);

    return (
        <main className="p-6 max-w-3xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 shadow-sm transition-all">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Booking Details</h1>
                        <p className="text-teal-600 text-xs font-mono font-semibold">{booking.bookingId ?? "—"}</p>
                    </div>
                </div>
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border capitalize ${STATUS_STYLE[status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                    {status.replace(/-/g, " ")}
                </span>
            </div>

            {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

            {/* Timeline */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 mb-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Progress</p>
                <div className="flex items-center">
                    {TIMELINE.map((s, i, arr) => {
                        const done = currentStep >= i && status !== "cancelled";
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
                    {TIMELINE.map((s) => (
                        <div key={s} className="flex-1 text-center">
                            <p className="text-[9px] text-slate-400 capitalize">{s.replace(/-/g, " ")}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                {/* Patient */}
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Patient</p>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                            {booking.patientName?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div>
                            <p className="text-slate-700 font-semibold">{booking.patientName ?? "—"}</p>
                            <p className="text-slate-400 text-xs">{booking.patientPhone ?? "—"}</p>
                        </div>
                    </div>
                </div>

                {/* Schedule */}
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Schedule</p>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-teal-500" strokeWidth={1.8} />
                            <span className="text-slate-700">
                                {scheduledDate
                                    ? new Date(scheduledDate).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" })
                                    : "—"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-cyan-500" strokeWidth={1.8} />
                            <span className="text-slate-700">{scheduledTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            {collectionType === "home-collection"
                                ? <Home className="w-4 h-4 text-violet-500" strokeWidth={1.8} />
                                : <Building2 className="w-4 h-4 text-violet-500" strokeWidth={1.8} />}
                            <span className="text-slate-700 capitalize">{collectionType.replace(/-/g, " ")}</span>
                        </div>
                        {collectionAddress?.street && (
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-amber-500" strokeWidth={1.8} />
                                <span className="text-slate-600 text-xs">
                                    {[collectionAddress.street, collectionAddress.city, collectionAddress.pincode].filter(Boolean).join(", ")}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tests */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 mb-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Tests & Packages</p>
                <div className="space-y-2">
                    {(booking.tests ?? []).map((t, i) => (
                        <div key={i} className="flex justify-between text-sm">
                            <span className="text-slate-600">
                                {t.testName ?? "—"} {t.testCode && <span className="text-slate-400 text-xs">({t.testCode})</span>}
                            </span>
                            <span className="text-teal-600 font-bold">₹{t.price ?? 0}</span>
                        </div>
                    ))}
                    {(booking.packages ?? []).map((p, i) => (
                        <div key={i} className="flex justify-between text-sm">
                            <span className="text-slate-600">{p.packageName ?? "—"}</span>
                            <span className="text-violet-600 font-bold">₹{p.price ?? 0}</span>
                        </div>
                    ))}
                    {!(booking.tests?.length) && !(booking.packages?.length) && (
                        <p className="text-slate-400 text-sm">No tests recorded</p>
                    )}
                    <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-sm">
                        <span className="text-slate-700">Total</span>
                        <span className="text-teal-600">₹{booking.finalAmount ?? booking.totalAmount ?? 0}</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Actions</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Update Status</label>
                        <select
                            value={status}
                            disabled={updating || (NEXT_STATUS[status]?.length ?? 0) === 0}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all"
                        >
                            <option value={status}>{status.replace(/-/g, " ")}</option>
                            {(NEXT_STATUS[status] ?? []).map((s) => (
                                <option key={s} value={s}>{s.replace(/-/g, " ")}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                            <User className="w-3 h-3" /> Assign Technician
                        </label>
                        <select
                            value={booking.assignedTechnician ?? ""}
                            disabled={updating}
                            onChange={(e) => handleAssign(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all"
                        >
                            <option value="">Unassigned</option>
                            {technicians.map((t) => (
                                <option key={t._id} value={t._id}>{t.fullName} ({t.role})</option>
                            ))}
                        </select>
                    </div>
                </div>
                {updating && (
                    <div className="flex items-center gap-2 mt-3 text-teal-600 text-xs">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating...
                    </div>
                )}
            </div>
        </main>
    );
}
