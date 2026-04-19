"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getResultById, approveResult, rejectResult, generateReport } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { ArrowLeft, Loader2, CheckCircle, XCircle, Download, FileText } from "lucide-react";
import axios from "axios";

interface TestResult { testName?: string; value?: string; unit?: string; normalRange?: { male?: string; female?: string }; status?: string; }
interface Result {
    _id: string; resultId: string; patientName?: string; patientId?: string;
    tests?: TestResult[]; approvalStatus?: string; rejectionNote?: string;
    reportUrl?: string; createdAt?: string; enteredBy?: string;
}

const STATUS_COLOR: Record<string, string> = {
    normal: "text-teal-600",
    abnormal: "text-amber-600",
    critical: "text-red-600",
};

export default function ResultDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const user = useAuthStore((s) => s.user);
    const [result, setResult] = useState<Result | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [acting, setActing] = useState(false);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        if (!id) return;
        getResultById(id)
            .then((res) => setResult(res.data?.result ?? res.data))
            .catch((err) => { if (!axios.isAxiosError(err) || err.response?.status !== 401) setError("Result not found"); })
            .finally(() => setLoading(false));
    }, [id]);

    const handleApprove = async () => {
        if (!result) return;
        setActing(true);
        try {
            const res = await approveResult(result._id);
            setResult(res.data.result);
        } catch { setError("Failed to approve"); }
        finally { setActing(false); }
    };

    const handleReject = async () => {
        if (!result) return;
        const note = prompt("Rejection reason:");
        if (!note) return;
        setActing(true);
        try {
            const res = await rejectResult(result._id, note);
            setResult(res.data.result);
        } catch { setError("Failed to reject"); }
        finally { setActing(false); }
    };

    const handleGenerateReport = async () => {
        if (!result) return;
        setGenerating(true);
        try {
            const res = await generateReport(result._id);
            setResult((prev) => prev ? { ...prev, reportUrl: res.data.reportUrl } : prev);
        } catch { setError("Failed to generate report"); }
        finally { setGenerating(false); }
    };

    const isPathologist = user?.role === "pathologist" || user?.role === "admin";

    if (loading) return <div className="flex-1 flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-teal-500 animate-spin" /></div>;
    if (error || !result) return (
        <div className="flex-1 flex items-center justify-center flex-col gap-3 py-20">
            <p className="text-slate-500">{error || "Result not found"}</p>
            <Link href="/admin/lab" className="text-teal-600 text-sm font-semibold">Back to Lab</Link>
        </div>
    );

    const approvalStyle: Record<string, string> = {
        pending: "bg-amber-50 text-amber-700 border-amber-200",
        approved: "bg-teal-50 text-teal-700 border-teal-200",
        rejected: "bg-red-50 text-red-600 border-red-200",
    };

    return (
        <main className="p-6 max-w-3xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 shadow-sm transition-all">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Result Details</h1>
                        <p className="text-violet-600 text-xs font-mono font-semibold">{result.resultId}</p>
                    </div>
                </div>
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border capitalize ${approvalStyle[result.approvalStatus ?? "pending"]}`}>
                    {result.approvalStatus ?? "pending"}
                </span>
            </div>

            {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

            {/* Patient info */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 mb-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Patient</p>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                        {result.patientName?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div>
                        <p className="text-slate-700 font-semibold">{result.patientName ?? "—"}</p>
                        <p className="text-slate-400 text-xs">{result.patientId ?? "—"}</p>
                    </div>
                </div>
            </div>

            {/* Test results table */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden mb-4">
                <div className="px-5 py-4 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Test Results</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                {["Test Name", "Value", "Unit", "Normal Range (M/F)", "Status"].map((h) => (
                                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {(result.tests ?? []).length === 0 ? (
                                <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400 text-sm">No test values recorded</td></tr>
                            ) : (result.tests ?? []).map((t, i) => (
                                <tr key={i} className="border-b border-slate-50">
                                    <td className="px-5 py-3.5 text-slate-700 font-medium">{t.testName ?? "—"}</td>
                                    <td className={`px-5 py-3.5 font-bold ${STATUS_COLOR[t.status ?? "normal"] ?? "text-slate-700"}`}>{t.value ?? "—"}</td>
                                    <td className="px-5 py-3.5 text-slate-500">{t.unit ?? "—"}</td>
                                    <td className="px-5 py-3.5 text-slate-500 text-xs">
                                        {t.normalRange?.male || t.normalRange?.female
                                            ? `${t.normalRange?.male ?? "—"} / ${t.normalRange?.female ?? "—"}`
                                            : "—"}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border capitalize ${t.status === "normal" ? "bg-teal-50 text-teal-700 border-teal-200" : t.status === "critical" ? "bg-red-50 text-red-600 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                                            {t.status ?? "normal"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Actions */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Actions</p>
                <div className="flex flex-wrap gap-3">
                    {isPathologist && result.approvalStatus === "pending" && (
                        <>
                            <button onClick={handleApprove} disabled={acting}
                                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-md shadow-teal-200">
                                {acting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Approve
                            </button>
                            <button onClick={handleReject} disabled={acting}
                                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all">
                                {acting ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />} Reject
                            </button>
                        </>
                    )}
                    {result.approvalStatus === "approved" && !result.reportUrl && (
                        <button onClick={handleGenerateReport} disabled={generating}
                            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-md shadow-violet-200">
                            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} Generate Report
                        </button>
                    )}
                    {result.reportUrl && (
                        <a href={`https://smartpath-5wup.onrender.com${result.reportUrl}`} target="_blank" rel="noreferrer"
                            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all">
                            <Download className="w-4 h-4" /> Download PDF
                        </a>
                    )}
                </div>
                {result.rejectionNote && (
                    <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                        <span className="font-semibold">Rejection note:</span> {result.rejectionNote}
                    </div>
                )}
            </div>
        </main>
    );
}
