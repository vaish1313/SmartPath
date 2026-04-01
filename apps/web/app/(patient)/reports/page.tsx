"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPatientResults } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { FileText, Download, Eye, Loader2, FlaskConical } from "lucide-react";
import axios from "axios";

interface Result {
    _id: string;
    resultId: string;
    tests?: { testName?: string }[];
    approvalStatus?: string;
    reportUrl?: string;
    createdAt: string;
}

const APPROVAL_STYLE: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    approved: "bg-teal-50 text-teal-700 border-teal-200",
    rejected: "bg-red-50 text-red-600 border-red-200",
};

export default function ReportsPage() {
    const user = useAuthStore((s) => s.user);
    const [results, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;
        getPatientResults(user.id)
            .then((res) => setResults(res.data.results || []))
            .catch((err) => { if (!axios.isAxiosError(err) || err.response?.status !== 401) console.error(err); })
            .finally(() => setLoading(false));
    }, [user?.id]);

    return (
        <main className="flex-1 p-6 max-w-3xl mx-auto w-full">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">My Reports</h1>
                <p className="text-slate-500 text-sm mt-0.5">View and download your test reports</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-teal-500 animate-spin" /></div>
            ) : results.length === 0 ? (
                <div className="text-center py-20">
                    <FlaskConical className="w-12 h-12 text-slate-200 mx-auto mb-4" strokeWidth={1.5} />
                    <p className="text-slate-400 text-sm">No reports yet. Book a test to get started.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {results.map((r) => (
                        <div key={r._id} className="bg-white border border-slate-100 rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${r.approvalStatus === "approved" ? "bg-teal-50" : "bg-amber-50"}`}>
                                    <FileText className={`w-5 h-5 ${r.approvalStatus === "approved" ? "text-teal-500" : "text-amber-500"}`} strokeWidth={1.8} />
                                </div>
                                <div>
                                    <p className="text-slate-700 font-semibold text-sm">{r.tests?.map((t) => t.testName).filter(Boolean).join(", ").slice(0, 50) || r.resultId}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <p className="text-slate-400 text-xs">{new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${APPROVAL_STYLE[r.approvalStatus ?? "pending"]}`}>
                                            {r.approvalStatus ?? "pending"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link href={`/reports/${r._id}`} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-all">
                                    <Eye className="w-3.5 h-3.5" /> View
                                </Link>
                                {r.approvalStatus === "approved" && r.reportUrl && (
                                    <a href={`http://localhost:3002${r.reportUrl}`} target="_blank" rel="noreferrer"
                                        className="flex items-center gap-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 px-3 py-2 rounded-xl transition-all shadow-sm">
                                        <Download className="w-3.5 h-3.5" /> Download
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
