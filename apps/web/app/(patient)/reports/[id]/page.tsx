"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getResultById } from "@/lib/api";
import { ArrowLeft, Loader2, Download, CheckCircle } from "lucide-react";
import axios from "axios";

interface TestResult { testName?: string; value?: string; unit?: string; normalRange?: { male?: string; female?: string }; status?: string; }
interface Result {
    _id: string; resultId: string; patientName?: string;
    tests?: TestResult[]; approvalStatus?: string; reportUrl?: string; createdAt?: string;
}

const STATUS_COLOR: Record<string, string> = {
    normal: "text-teal-600",
    abnormal: "text-amber-600",
    critical: "text-red-600",
};

export default function PatientReportDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const [result, setResult] = useState<Result | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;
        getResultById(id)
            .then((res) => setResult(res.data?.result ?? res.data))
            .catch((err) => { if (!axios.isAxiosError(err) || err.response?.status !== 401) setError("Report not found"); })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="flex-1 flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-teal-500 animate-spin" /></div>;
    if (error || !result) return (
        <div className="flex-1 flex items-center justify-center flex-col gap-3 py-20">
            <p className="text-slate-500">{error || "Report not found"}</p>
            <Link href="/reports" className="text-teal-600 text-sm font-semibold">Back to Reports</Link>
        </div>
    );

    return (
        <main className="flex-1 p-6 max-w-3xl mx-auto w-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 shadow-sm transition-all">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Test Report</h1>
                        <p className="text-violet-600 text-xs font-mono font-semibold">{result.resultId}</p>
                    </div>
                </div>
                {result.approvalStatus === "approved" && result.reportUrl && (
                    <a href={`https://smartpath-5wup.onrender.com${result.reportUrl}`} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-all shadow-md shadow-teal-200">
                        <Download className="w-4 h-4" /> Download PDF
                    </a>
                )}
            </div>

            {/* Status */}
            {result.approvalStatus === "approved" && (
                <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 mb-5 text-teal-700 text-sm font-medium">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" /> Report approved by pathologist
                </div>
            )}
            {result.approvalStatus === "pending" && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 text-amber-700 text-sm">
                    Report is pending pathologist review
                </div>
            )}

            {/* Results table */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden mb-4">
                <div className="px-5 py-4 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-700">Test Results</p>
                    {result.createdAt && <p className="text-slate-400 text-xs mt-0.5">{new Date(result.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                {["Test", "Your Value", "Unit", "Normal Range", "Status"].map((h) => (
                                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {(result.tests ?? []).length === 0 ? (
                                <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400 text-sm">No results available</td></tr>
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
        </main>
    );
}
