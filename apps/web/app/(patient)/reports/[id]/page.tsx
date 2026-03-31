import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import { Download, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ReportDetailPage() {
    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <main className="flex-1 p-6 pb-24 lg:pb-6 max-w-3xl">
                <Link href="/reports" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Reports
                </Link>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-4">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">Complete Blood Count (CBC)</h1>
                            <p className="text-slate-400 text-sm mt-1">Booking ID: BK001 · 28 Mar 2026</p>
                        </div>
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-full">
                            <CheckCircle className="w-3.5 h-3.5" /> Ready
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {[
                            { label: "Patient", value: "Priya Sharma" },
                            { label: "Age / Gender", value: "28 yrs / Female" },
                            { label: "Sample Type", value: "Blood" },
                            { label: "Collected On", value: "28 Mar 2026, 9:00 AM" },
                            { label: "Reported On", value: "28 Mar 2026, 5:00 PM" },
                            { label: "Lab", value: "Prathamesh Diagnostic" },
                        ].map(({ label, value }) => (
                            <div key={label} className="bg-slate-50 rounded-xl p-3">
                                <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">{label}</p>
                                <p className="text-slate-700 text-sm font-semibold mt-0.5">{value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="border border-slate-100 rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    {["Parameter", "Result", "Unit", "Reference Range", "Status"].map((h) => (
                                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { param: "Haemoglobin", result: "13.5", unit: "g/dL", range: "12.0 – 16.0", status: "normal" },
                                    { param: "WBC Count", result: "7200", unit: "cells/μL", range: "4000 – 11000", status: "normal" },
                                    { param: "Platelet Count", result: "2.8L", unit: "cells/μL", range: "1.5L – 4.5L", status: "normal" },
                                    { param: "RBC Count", result: "4.6", unit: "million/μL", range: "3.8 – 5.2", status: "normal" },
                                ].map((row) => (
                                    <tr key={row.param} className="border-b border-slate-50 hover:bg-slate-50/50">
                                        <td className="px-4 py-3 text-slate-700 font-medium">{row.param}</td>
                                        <td className="px-4 py-3 text-slate-800 font-bold">{row.result}</td>
                                        <td className="px-4 py-3 text-slate-500">{row.unit}</td>
                                        <td className="px-4 py-3 text-slate-500">{row.range}</td>
                                        <td className="px-4 py-3">
                                            <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">Normal</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-lg shadow-teal-200">
                    <Download className="w-4 h-4" /> Download PDF Report
                </button>
            </main>
            <MobileNav />
        </div>
    );
}
