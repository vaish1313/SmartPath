import AdminSidebar from "@/components/layout/AdminSidebar";
import PageHeader from "@/components/shared/PageHeader";
import { Plus, FlaskRound } from "lucide-react";

const tests = [
    { code: "CBC", name: "Complete Blood Count", category: "Hematology", price: "₹299", time: "24 hrs", active: true },
    { code: "LIP", name: "Lipid Profile", category: "Biochemistry", price: "₹499", time: "24 hrs", active: true },
    { code: "THY", name: "Thyroid Panel", category: "Immunology", price: "₹599", time: "24 hrs", active: true },
    { code: "HBA", name: "HbA1c", category: "Biochemistry", price: "₹349", time: "24 hrs", active: true },
    { code: "VTD", name: "Vitamin D Total", category: "Biochemistry", price: "₹799", time: "48 hrs", active: false },
    { code: "LFT", name: "Liver Function Test", category: "Biochemistry", price: "₹449", time: "24 hrs", active: true },
];

export default function AdminTestsPage() {
    return (
        <div className="flex min-h-screen bg-slate-50">
            <AdminSidebar />
            <main className="flex-1 p-6">
                <PageHeader
                    title="Tests Catalog"
                    subtitle={`${tests.length} tests available`}
                    action={
                        <button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-md shadow-teal-200">
                            <Plus className="w-4 h-4" /> Add Test
                        </button>
                    }
                />
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    {["Code", "Test Name", "Category", "Price", "Turnaround", "Status"].map((h) => (
                                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tests.map((t) => (
                                    <tr key={t.code} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center">
                                                    <FlaskRound className="w-3.5 h-3.5 text-teal-500" strokeWidth={1.8} />
                                                </div>
                                                <span className="text-teal-600 font-bold">{t.code}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-700 font-semibold">{t.name}</td>
                                        <td className="px-5 py-3.5 text-slate-500">{t.category}</td>
                                        <td className="px-5 py-3.5 text-teal-600 font-bold">{t.price}</td>
                                        <td className="px-5 py-3.5 text-slate-500">{t.time}</td>
                                        <td className="px-5 py-3.5">
                                            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${t.active ? "bg-teal-50 text-teal-700 border-teal-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                                                {t.active ? "Active" : "Inactive"}
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
