import AdminSidebar from "@/components/layout/AdminSidebar";
import PageHeader from "@/components/shared/PageHeader";
import { FileText, Download, CheckCircle, Clock } from "lucide-react";

const reports = [
    { id: "R001", patient: "Priya Sharma", test: "CBC", date: "28 Mar 2026", status: "ready" },
    { id: "R002", patient: "Rahul Deshmukh", test: "Lipid Profile", date: "28 Mar 2026", status: "ready" },
    { id: "R003", patient: "Sunita Joshi", test: "Thyroid Panel", date: "27 Mar 2026", status: "processing" },
    { id: "R004", patient: "Amit Patil", test: "HbA1c", date: "27 Mar 2026", status: "ready" },
];

export default function AdminReportsPage() {
    return (
        <div className="flex min-h-screen bg-slate-50">
            <AdminSidebar />
            <main className="flex-1 p-6">
                <PageHeader title="Reports" subtitle="Manage and dispatch patient reports" />
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    {["Report ID", "Patient", "Test", "Date", "Status", "Action"].map((h) => (
                                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map((r) => (
                                    <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-3.5 text-teal-600 font-semibold">{r.id}</td>
                                        <td className="px-5 py-3.5 text-slate-700 font-medium">{r.patient}</td>
                                        <td className="px-5 py-3.5 text-slate-600">{r.test}</td>
                                        <td className="px-5 py-3.5 text-slate-500">{r.date}</td>
                                        <td className="px-5 py-3.5">
                                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${r.status === "ready" ? "bg-teal-50 text-teal-700 border-teal-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                                                {r.status === "ready" ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                {r.status === "ready" ? "Ready" : "Processing"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            {r.status === "ready" && (
                                                <button className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors">
                                                    <Download className="w-3.5 h-3.5" /> Download
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
