"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { getAllResults } from "@/lib/api";
import { FileText, Download, CheckCircle, Clock, Loader2, AlertCircle } from "lucide-react";
import axios from "axios";

interface Result {
    _id: string;
    resultId: string;
    patientName: string;
    bookingId: string;
    tests: { testName: string }[];
    approvalStatus: string;
    createdAt: string;
    pdfUrl?: string;
}

export default function AdminReportsPage() {
    const [results, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getAllResults({ limit: 100 })
            .then((res) => setResults(res.data.results || []))
            .catch((err) => {
                if (!axios.isAxiosError(err) || err.response?.status !== 401) {
                    console.error(err);
                    setError("Failed to load results");
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const handleDownloadReport = async (resultId: string) => {
        setGenerating(resultId);
        setError(null);
        try {
            // Get the result to find the booking ID
            const result = results.find(r => r._id === resultId);
            if (!result || !result.bookingId) {
                setError("Booking ID not found for this result");
                return;
            }

            // Call the custom report generation API (uses HTML template + Puppeteer)
            const res = await axios.post("/api/reports/generate", {
                bookingId: result.bookingId
            });

            if (res.data?.success && res.data?.reportId) {
                // Open the generated PDF
                window.open(`/generated/${res.data.reportId}.pdf`, "_blank");
                // Update the result with the PDF URL
                setResults(prev => prev.map(r =>
                    r._id === resultId ? { ...r, pdfUrl: `/generated/${res.data.reportId}.pdf` } : r
                ));
            } else {
                setError("Failed to generate report");
            }
        } catch (err) {
            console.error("Failed to generate report", err);
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || "Failed to generate report");
            } else {
                setError("Failed to generate report");
            }
        } finally {
            setGenerating(null);
        }
    };

    return (
        <main className="p-5">
            <PageHeader title="Reports" subtitle="Manage and dispatch patient reports" />

            {error && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    {["Result ID", "Patient", "Tests", "Date", "Approval", "Action"].map((h) => (
                                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {results.length === 0 ? (
                                    <tr><td colSpan={6} className="px-5 py-16 text-center text-slate-400 text-sm">No results available</td></tr>
                                ) : results.map((r) => {
                                    const approved = r.approvalStatus === "approved";
                                    return (
                                        <tr key={r._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-5 py-3.5 text-teal-600 font-semibold font-mono text-xs">{r.resultId}</td>
                                            <td className="px-5 py-3.5 text-slate-700 font-medium">{r.patientName}</td>
                                            <td className="px-5 py-3.5 text-slate-600">{r.tests?.map((t) => t.testName).join(", ").slice(0, 40) || "—"}</td>
                                            <td className="px-5 py-3.5 text-slate-500 text-xs">
                                                {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${approved
                                                    ? "bg-teal-50 text-teal-700 border-teal-200"
                                                    : r.approvalStatus === "rejected"
                                                        ? "bg-red-50 text-red-600 border-red-200"
                                                        : "bg-amber-50 text-amber-700 border-amber-200"
                                                    }`}>
                                                    {approved ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                    {r.approvalStatus === "approved" ? "Approved" : r.approvalStatus === "rejected" ? "Rejected" : "Pending"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                {approved && (
                                                    r.pdfUrl ? (
                                                        <a
                                                            href={`https://smartpath-5wup.onrender.com${r.pdfUrl}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                                                        >
                                                            <Download className="w-3.5 h-3.5" />
                                                            Download
                                                        </a>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleDownloadReport(r._id)}
                                                            disabled={generating === r._id}
                                                            className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 disabled:opacity-50 transition-colors"
                                                        >
                                                            {generating === r._id ? (
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                            ) : (
                                                                <Download className="w-3.5 h-3.5" />
                                                            )}
                                                            {generating === r._id ? "Generating..." : "Generate PDF"}
                                                        </button>
                                                    )
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    );
}
