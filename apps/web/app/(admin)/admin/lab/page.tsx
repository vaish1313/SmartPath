import AdminSidebar from "@/components/layout/AdminSidebar";
import PageHeader from "@/components/shared/PageHeader";
import { Microscope, CheckCircle, Clock, AlertCircle } from "lucide-react";

const samples = [
    { id: "S001", patient: "Priya Sharma", test: "CBC", collected: "9:00 AM", status: "completed", technician: "Dr. Ravi" },
    { id: "S002", patient: "Rahul Deshmukh", test: "Lipid Profile", collected: "9:30 AM", status: "processing", technician: "Dr. Meena" },
    { id: "S003", patient: "Sunita Joshi", test: "Thyroid Panel", collected: "10:00 AM", status: "pending", technician: "—" },
    { id: "S004", patient: "Amit Patil", test: "HbA1c", collected: "10:30 AM", status: "processing", technician: "Dr. Ravi" },
];

const statusIcon: Record<string, React.ReactNode> = {
    completed: <CheckCircle className="w-4 h-4 text-teal-500" />,
    processing: <Clock className="w-4 h-4 text-amber-500" />,
    pending: <AlertCircle className="w-4 h-4 text-slate-400" />,
};

const statusStyle: Record<string, string> = {
    completed: "bg-teal-50 text-teal-700 border-teal-200",
    processing: "bg-amber-50 text-amber-700 border-amber-200",
    pending: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function AdminLabPage() {
    return (
        <div className="flex min-h-screen bg-slate-50">
            <AdminSidebar />
            <main className="flex-1 p-6">
                <PageHeader title="Lab Management" subtitle="Track sample processing status" />
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                        { label: "Completed", value: "18", color: "teal" },
                        { label: "Processing", value: "6", color: "amber" },
                        { label: "Pending", value: "4", color: "slate" },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${color}-50`}>
                                <Microscope className={`w-5 h-5 text-${color}-500`} strokeWidth={1.8} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">{value}</p>
                                <p className="text-slate-500 text-xs font-medium">{label}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    {["Sample ID", "Patient", "Test", "Collected", "Technician", "Status"].map((h) => (
                                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {samples.map((s) => (
                                    <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-3.5 text-teal-600 font-semibold">{s.id}</td>
                                        <td className="px-5 py-3.5 text-slate-700 font-medium">{s.patient}</td>
                                        <td className="px-5 py-3.5 text-slate-600">{s.test}</td>
                                        <td className="px-5 py-3.5 text-slate-500">{s.collected}</td>
                                        <td className="px-5 py-3.5 text-slate-600">{s.technician}</td>
                                        <td className="px-5 py-3.5">
                                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border capitalize ${statusStyle[s.status]}`}>
                                                {statusIcon[s.status]} {s.status}
                                            </span>
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
