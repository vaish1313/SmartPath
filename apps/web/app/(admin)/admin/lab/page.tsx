"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/shared/PageHeader";
import { getAllSamples, getAllResults, updateSampleStatus, approveResult, rejectResult } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Microscope, FlaskConical, Plus, Loader2, CheckCircle, Clock, AlertCircle, Eye } from "lucide-react";
import axios from "axios";

interface Sample { _id: string; sampleId: string; barcode: string; patientName: string; collectedAt?: string; status: string; }
interface Result { _id: string; resultId: string; patientName: string; tests: { testName: string }[]; approvalStatus: string; createdAt: string; }

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

    useEffect(() => {
        setLoading(true);
        if (tab === "samples") {
            getAllSamples({ limit: 50 })
                .then((res) => setSamples(res.data.samples || []))
                .catch((err) => { if (!axios.isAxiosError(err) || err.response?.status !== 401) setError("Failed to load samples"); })
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

    return (
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

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-teal-500 animate-spin" /></div>
                ) : tab === "samples" ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    {["Sample ID", "Barcode", "Patient", "Collected At", "Status", "Actions"].map((h) => (
                                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {samples.length === 0 ? (
                                    <tr><td colSpan={6} className="px-5 py-16 text-center text-slate-400 text-sm">No samples found. <Link href="/admin/lab/samples/new" className="text-teal-600 font-semibold">Create one</Link></td></tr>
                                ) : samples.map((s) => (
                                    <tr key={s._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-3.5 text-teal-600 font-semibold font-mono text-xs">{s.sampleId}</td>
                                        <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">{s.barcode}</td>
                                        <td className="px-5 py-3.5 text-slate-700 font-medium">{s.patientName}</td>
                                        <td className="px-5 py-3.5 text-slate-500 text-xs">{s.collectedAt ? new Date(s.collectedAt).toLocaleString("en-IN") : "—"}</td>
                                        <td className="px-5 py-3.5">
                                            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border capitalize ${SAMPLE_STATUS_STYLE[s.status] || SAMPLE_STATUS_STYLE.pending}`}>
                                                {s.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2">
                                                {s.status === "collected" && (
                                                    <button disabled={updatingId === s._id} onClick={() => handleSampleStatus(s._id, "processing")}
                                                        className="text-xs font-semibold text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 px-2.5 py-1 rounded-lg transition-all disabled:opacity-50">
                                                        {updatingId === s._id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Mark Processing"}
                                                    </button>
                                                )}
                                                {s.status === "processing" && (
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
    );
}
