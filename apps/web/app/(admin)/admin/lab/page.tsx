"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/shared/PageHeader";
import { getAllSamples, getAllResults, updateSampleStatus, approveResult, rejectResult, getAllBookings, createSample, createResult, getStaffByRole } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Microscope, FlaskConical, Plus, Loader2, CheckCircle, Clock, AlertCircle, Eye, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";

interface Sample { _id: string; sampleId: string; barcode: string; patientName: string; collectedAt?: string; collectedBy?: string; status: string; bookingId?: string; isPendingBooking?: boolean; }
interface Result { _id: string; resultId: string; patientName: string; tests: { testName: string }[]; approvalStatus: string; createdAt: string; }
interface Booking { _id: string; bookingId: string; patientId: string; patientName: string; tests: { testId: string; testName: string }[] }
interface Technician { _id: string; fullName: string; email: string; role: string; }

const sampleSchema = z.object({
    bookingId: z.string().min(1, "Select a booking"),
    barcode: z.string().min(3, "Barcode required"),
    collectedBy: z.string().min(2, "Collector name required"),
    notes: z.string().optional(),
});

const resultSchema = z.object({
    sampleId: z.string().min(1, "Select a sample"),
    testResults: z.array(z.object({
        testId: z.string(),
        testName: z.string(),
        value: z.string().min(1, "Value required"),
        unit: z.string().optional(),
        referenceRange: z.string().optional(),
        flag: z.enum(["normal", "high", "low"]).optional(),
    })).min(1, "Add at least one test result"),
    remarks: z.string().optional(),
});

type SampleFormData = z.infer<typeof sampleSchema>;
type ResultFormData = z.infer<typeof resultSchema>;

const SAMPLE_STATUS_STYLE: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    collected: "bg-blue-50 text-blue-700 border-blue-200",
    processing: "bg-violet-50 text-violet-700 border-violet-200",
    completed: "bg-teal-50 text-teal-700 border-teal-200",
    rejected: "bg-red-50 text-red-600 border-red-200",
};

const APPROVAL_STYLE: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    approved: "bg-teal-50 text-teal-700 border-teal-200",
    rejected: "bg-red-50 text-red-600 border-red-200",
};

export default function AdminLabPage() {
    const user = useAuthStore((s) => s.user);
    const [tab, setTab] = useState<"samples" | "results">("samples");
    const [samples, setSamples] = useState<Sample[]>([]);
    const [results, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const [modal, setModal] = useState<"sample" | "result" | null>(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [apiError, setApiError] = useState("");
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [samplesForResult, setSamplesForResult] = useState<Sample[]>([]);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [lastAssignedIndex, setLastAssignedIndex] = useState<number>(-1);

    const sampleForm = useForm<SampleFormData>({ resolver: zodResolver(sampleSchema) });
    const resultForm = useForm<ResultFormData>({ resolver: zodResolver(resultSchema) });

    useEffect(() => {
        setLoading(true);
        if (tab === "samples") {
            // Fetch both samples and confirmed bookings without samples
            Promise.all([
                getAllSamples({ limit: 50 }),
                getAllBookings({ limit: 100, status: "confirmed" })
            ])
                .then(([samplesRes, bookingsRes]) => {
                    const fetchedSamples = samplesRes.data.samples || [];
                    const confirmedBookings = bookingsRes.data.bookings || [];

                    // Filter out bookings that already have samples
                    const sampleBookingIds = new Set(fetchedSamples.map((s: Sample) => s.bookingId));
                    const bookingsWithoutSamples = confirmedBookings.filter(
                        (b: Booking) => !sampleBookingIds.has(b._id)
                    );

                    // Convert bookings to sample-like objects for display
                    const pendingSamples = bookingsWithoutSamples.map((b: Booking) => ({
                        _id: b._id,
                        sampleId: `Pending`,
                        barcode: '—',
                        patientName: b.patientName,
                        collectedBy: null,
                        collectedAt: null,
                        status: 'pending',
                        bookingId: b._id,
                        isPendingBooking: true,
                    }));

                    setSamples([...pendingSamples, ...fetchedSamples]);
                })
                .catch((err) => {
                    if (!axios.isAxiosError(err) || err.response?.status !== 401)
                        setError("Failed to load samples");
                })
                .finally(() => setLoading(false));
        } else {
            getAllResults({ limit: 50 })
                .then((res) => setResults(res.data.results || []))
                .catch((err) => { if (!axios.isAxiosError(err) || err.response?.status !== 401) setError("Failed to load results"); })
                .finally(() => setLoading(false));
        }
    }, [tab]);

    const handleSampleStatus = async (id: string, status: string) => {
        setUpdatingId(id);
        try {
            const res = await updateSampleStatus(id, status);
            setSamples((prev) => prev.map((s) => s._id === id ? { ...s, status: res.data.sample.status } : s));
        } catch { setError("Failed to update sample status"); }
        finally { setUpdatingId(null); }
    };

    const handleApprove = async (id: string) => {
        setUpdatingId(id);
        try {
            const res = await approveResult(id);
            setResults((prev) => prev.map((r) => r._id === id ? { ...r, approvalStatus: res.data.result.approvalStatus } : r));
        } catch { setError("Failed to approve result"); }
        finally { setUpdatingId(null); }
    };

    const handleReject = async (id: string) => {
        const note = prompt("Rejection reason:");
        if (!note) return;
        setUpdatingId(id);
        try {
            const res = await rejectResult(id, note);
            setResults((prev) => prev.map((r) => r._id === id ? { ...r, approvalStatus: res.data.result.approvalStatus } : r));
        } catch { setError("Failed to reject result"); }
        finally { setUpdatingId(null); }
    };

    const isPathologist = user?.role === "pathologist" || user?.role === "admin";

    const openSampleModal = () => {
        setApiError("");
        setModalLoading(true);
        setModal("sample");

        // Fetch bookings and technicians
        Promise.all([
            getAllBookings({ limit: 100, status: "confirmed" }),
            getStaffByRole("technician")
        ])
            .then(([bookingsRes, techRes]) => {
                setBookings(bookingsRes.data.bookings || []);
                const techs = techRes.data.users || techRes.data.staff || [];
                setTechnicians(techs);

                // Auto-assign next technician in round-robin
                if (techs.length > 0) {
                    const nextIndex = (lastAssignedIndex + 1) % techs.length;
                    setLastAssignedIndex(nextIndex);
                    const assignedTech = techs[nextIndex];
                    sampleForm.reset({
                        collectedBy: assignedTech.fullName,
                    });
                } else {
                    sampleForm.reset({});
                }
            })
            .catch(() => {
                setApiError("Failed to load data");
                sampleForm.reset({});
            })
            .finally(() => setModalLoading(false));
    };

    const openResultModal = () => {
        resultForm.reset({ testResults: [] });
        setApiError("");
        setModalLoading(true);
        setModal("result");
        getAllSamples({ limit: 100, status: "completed" })
            .then((res) => setSamplesForResult(res.data.samples || []))
            .catch(() => setApiError("Failed to load samples"))
            .finally(() => setModalLoading(false));
    };

    const closeModal = () => {
        setModal(null);
        sampleForm.reset({});
        resultForm.reset({});
        setApiError("");
        setSelectedBooking(null);
    };

    const onSampleSubmit = async (data: SampleFormData) => {
        setApiError("");
        try {
            const booking = bookings.find((b) => b._id === data.bookingId);
            if (!booking) {
                setApiError("Booking not found");
                return;
            }
            const res = await createSample({
                bookingId: data.bookingId,
                patientId: booking._id, // Using booking ID as placeholder
                patientName: booking.patientName,
            });
            setSamples((prev) => [res.data.sample, ...prev]);
            closeModal();
            if (tab === "samples") {
                // Refresh samples list
                getAllSamples({ limit: 50 })
                    .then((res) => setSamples(res.data.samples || []))
                    .catch(() => { });
            }
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setApiError(err.response?.data?.message || "Failed to create sample");
            } else setApiError("Something went wrong.");
        }
    };

    const onResultSubmit = async (data: ResultFormData) => {
        setApiError("");
        try {
            const sample = samplesForResult.find((s) => s._id === data.sampleId);
            if (!sample) {
                setApiError("Sample not found");
                return;
            }
            const res = await createResult({
                bookingId: sample._id, // Using sample ID as placeholder
                sampleId: data.sampleId,
                patientId: sample._id, // Using sample ID as placeholder
                patientName: sample.patientName,
                tests: data.testResults.map((t) => ({
                    testId: t.testId,
                    testName: t.testName,
                    value: t.value,
                    unit: t.unit,
                    status: t.flag,
                })),
            });
            setResults((prev) => [res.data.result, ...prev]);
            closeModal();
            if (tab === "results") {
                // Refresh results list
                getAllResults({ limit: 50 })
                    .then((res) => setResults(res.data.results || []))
                    .catch(() => { });
            }
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setApiError(err.response?.data?.message || "Failed to create result");
            } else setApiError("Something went wrong.");
        }
    };

    const handleBookingChange = (bookingId: string) => {
        const booking = bookings.find((b) => b._id === bookingId);
        setSelectedBooking(booking || null);
    };

    const inputCls = "w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm placeholder:text-slate-300 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all";
    const labelCls = "text-xs font-semibold text-slate-500 tracking-wide uppercase";

    return (
        <>
            <main className="p-6">
                <PageHeader
                    title="Lab Management"
                    subtitle="Samples and test results"
                    action={
                        <div className="flex gap-2">
                            <Link href="/admin/lab/samples/new"
                                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-md shadow-teal-200">
                                <Plus className="w-4 h-4" /> New Sample
                            </Link>
                            <Link href="/admin/lab/results/new"
                                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-md shadow-violet-200">
                                <Plus className="w-4 h-4" /> Enter Results
                            </Link>
                        </div>
                    }
                />

                {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

                {/* Tabs */}
                <div className="flex gap-2 mb-5">
                    {(["samples", "results"] as const).map((t) => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t ? "bg-teal-600 text-white shadow-md shadow-teal-200" : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"}`}>
                            {t === "samples" ? <FlaskConical className="w-4 h-4" /> : <Microscope className="w-4 h-4" />}
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/40 shadow-lg overflow-hidden hover:shadow-xl hover:bg-white/70 transition-all">
                    {loading ? (
                        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-teal-500 animate-spin" /></div>
                    ) : tab === "samples" ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        {["Sample ID", "Barcode", "Patient", "Collected By", "Collected At", "Status", "Actions"].map((h) => (
                                            <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {samples.length === 0 ? (
                                        <tr><td colSpan={7} className="px-5 py-16 text-center text-slate-400 text-sm">No samples found. <Link href="/admin/lab/samples/new" className="text-teal-600 font-semibold">Create one</Link></td></tr>
                                    ) : samples.map((s) => (
                                        <tr key={s._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-5 py-3.5 text-teal-600 font-semibold font-mono text-xs">
                                                {s.isPendingBooking ? (
                                                    <span className="text-amber-600">Awaiting Collection</span>
                                                ) : (
                                                    s.sampleId
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">{s.barcode}</td>
                                            <td className="px-5 py-3.5 text-slate-700 font-medium">{s.patientName}</td>
                                            <td className="px-5 py-3.5">
                                                {s.collectedBy ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center">
                                                            <span className="text-teal-700 text-[10px] font-semibold">{s.collectedBy.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}</span>
                                                        </div>
                                                        <span className="text-slate-700 text-xs font-medium">{s.collectedBy}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 text-xs">—</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-500 text-xs">{s.collectedAt ? new Date(s.collectedAt).toLocaleString("en-IN") : "—"}</td>
                                            <td className="px-5 py-3.5">
                                                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border capitalize ${SAMPLE_STATUS_STYLE[s.status] || SAMPLE_STATUS_STYLE.pending}`}>
                                                    {s.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    {s.isPendingBooking && (
                                                        <Link href={`/admin/lab/samples/new?bookingId=${s.bookingId}`}
                                                            className="text-xs font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-lg transition-all">
                                                            Collect Sample
                                                        </Link>
                                                    )}
                                                    {s.status === "collected" && !s.isPendingBooking && (
                                                        <button disabled={updatingId === s._id} onClick={() => handleSampleStatus(s._id, "processing")}
                                                            className="text-xs font-semibold text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 px-2.5 py-1 rounded-lg transition-all disabled:opacity-50">
                                                            {updatingId === s._id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Mark Processing"}
                                                        </button>
                                                    )}
                                                    {s.status === "processing" && !s.isPendingBooking && (
                                                        <button disabled={updatingId === s._id} onClick={() => handleSampleStatus(s._id, "completed")}
                                                            className="text-xs font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-lg transition-all disabled:opacity-50">
                                                            {updatingId === s._id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Mark Complete"}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        {["Result ID", "Patient", "Tests", "Entered", "Approval", "Actions"].map((h) => (
                                            <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.length === 0 ? (
                                        <tr><td colSpan={6} className="px-5 py-16 text-center text-slate-400 text-sm">No results found. <Link href="/admin/lab/results/new" className="text-teal-600 font-semibold">Enter results</Link></td></tr>
                                    ) : results.map((r) => (
                                        <tr key={r._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-5 py-3.5 text-violet-600 font-semibold font-mono text-xs">{r.resultId}</td>
                                            <td className="px-5 py-3.5 text-slate-700 font-medium">{r.patientName}</td>
                                            <td className="px-5 py-3.5 text-slate-500 text-xs">{r.tests?.length ?? 0} tests</td>
                                            <td className="px-5 py-3.5 text-slate-400 text-xs">{new Date(r.createdAt).toLocaleDateString("en-IN")}</td>
                                            <td className="px-5 py-3.5">
                                                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border capitalize ${APPROVAL_STYLE[r.approvalStatus] || APPROVAL_STYLE.pending}`}>
                                                    {r.approvalStatus}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <Link href={`/admin/lab/results/${r._id}`} className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-all" title="View">
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    {isPathologist && r.approvalStatus === "pending" && (
                                                        <>
                                                            <button disabled={updatingId === r._id} onClick={() => handleApprove(r._id)}
                                                                className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-all" title="Approve">
                                                                <CheckCircle className="w-4 h-4" />
                                                            </button>
                                                            <button disabled={updatingId === r._id} onClick={() => handleReject(r._id)}
                                                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Reject">
                                                                <AlertCircle className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* New Sample Modal */}
            {
                modal === "sample" && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
                                        <FlaskConical className="w-4 h-4 text-teal-600" strokeWidth={1.8} />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-slate-800">New Sample</h2>
                                        <p className="text-slate-400 text-xs">Register a new lab sample</p>
                                    </div>
                                </div>
                                <button onClick={closeModal} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {modalLoading ? (
                                <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-teal-500 animate-spin" /></div>
                            ) : (
                                <form onSubmit={sampleForm.handleSubmit(onSampleSubmit)} className="px-6 py-5 space-y-4">
                                    {apiError && <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{apiError}</div>}

                                    <div className="space-y-1.5">
                                        <label className={labelCls}>Booking *</label>
                                        <select {...sampleForm.register("bookingId")} onChange={(e) => handleBookingChange(e.target.value)} className={inputCls} style={{ backgroundColor: "white" }}>
                                            <option value="">Select booking</option>
                                            {bookings.map((b) => (
                                                <option key={b._id} value={b._id}>{b.bookingId} - {b.patientName}</option>
                                            ))}
                                        </select>
                                        {sampleForm.formState.errors.bookingId && <p className="text-red-500 text-xs">{sampleForm.formState.errors.bookingId.message}</p>}
                                    </div>

                                    {selectedBooking && (
                                        <div className="px-4 py-3 rounded-xl bg-teal-50 border border-teal-200">
                                            <p className="text-xs font-semibold text-teal-700 mb-1">Tests in booking:</p>
                                            <p className="text-xs text-teal-600">{selectedBooking.tests.map((t) => t.testName).join(", ")}</p>
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <label className={labelCls}>Barcode *</label>
                                        <input type="text" placeholder="BC123456" {...sampleForm.register("barcode")} className={inputCls} />
                                        {sampleForm.formState.errors.barcode && <p className="text-red-500 text-xs">{sampleForm.formState.errors.barcode.message}</p>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className={labelCls}>Collected By (Auto-assigned)</label>
                                        <input
                                            type="text"
                                            placeholder="Technician name"
                                            {...sampleForm.register("collectedBy")}
                                            className={`${inputCls} bg-slate-50`}
                                            readOnly
                                        />
                                        {technicians.length > 0 ? (
                                            <p className="text-xs text-teal-600">✓ Auto-assigned to next available technician</p>
                                        ) : (
                                            <p className="text-xs text-amber-600">⚠ No technicians available. Please add technicians first.</p>
                                        )}
                                        {sampleForm.formState.errors.collectedBy && <p className="text-red-500 text-xs">{sampleForm.formState.errors.collectedBy.message}</p>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className={labelCls}>Notes</label>
                                        <textarea placeholder="Additional notes..." {...sampleForm.register("notes")} rows={3} className={inputCls} />
                                    </div>

                                    <div className="flex gap-3 pt-1">
                                        <button type="button" onClick={closeModal} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm rounded-xl py-2.5 transition-all">Cancel</button>
                                        <button type="submit" disabled={sampleForm.formState.isSubmitting}
                                            className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl py-2.5 transition-all shadow-lg shadow-teal-200">
                                            {sampleForm.formState.isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Sample"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )
            }

            {/* Enter Results Modal */}
            {
                modal === "result" && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
                                        <Microscope className="w-4 h-4 text-violet-600" strokeWidth={1.8} />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-slate-800">Enter Test Results</h2>
                                        <p className="text-slate-400 text-xs">Record lab test results</p>
                                    </div>
                                </div>
                                <button onClick={closeModal} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {modalLoading ? (
                                <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-violet-500 animate-spin" /></div>
                            ) : (
                                <form onSubmit={resultForm.handleSubmit(onResultSubmit)} className="px-6 py-5 space-y-4">
                                    {apiError && <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{apiError}</div>}

                                    <div className="space-y-1.5">
                                        <label className={labelCls}>Sample *</label>
                                        <select {...resultForm.register("sampleId")} className={inputCls} style={{ backgroundColor: "white" }}>
                                            <option value="">Select completed sample</option>
                                            {samplesForResult.map((s) => (
                                                <option key={s._id} value={s._id}>{s.sampleId} - {s.patientName}</option>
                                            ))}
                                        </select>
                                        {resultForm.formState.errors.sampleId && <p className="text-red-500 text-xs">{resultForm.formState.errors.sampleId.message}</p>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className={labelCls}>Remarks</label>
                                        <textarea placeholder="Overall remarks..." {...resultForm.register("remarks")} rows={2} className={inputCls} />
                                    </div>

                                    <div className="px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
                                        <p className="text-xs text-amber-700">Note: Test results will be entered through the detailed result entry page after sample selection.</p>
                                    </div>

                                    <div className="flex gap-3 pt-1">
                                        <button type="button" onClick={closeModal} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm rounded-xl py-2.5 transition-all">Cancel</button>
                                        <button type="submit" disabled={resultForm.formState.isSubmitting}
                                            className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl py-2.5 transition-all shadow-lg shadow-violet-200">
                                            {resultForm.formState.isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Result"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )
            }
        </>
    );
}
