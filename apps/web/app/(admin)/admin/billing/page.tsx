import AdminSidebar from "@/components/layout/AdminSidebar";
import PageHeader from "@/components/shared/PageHeader";
import { IndianRupee, TrendingUp, CreditCard, Receipt } from "lucide-react";

const invoices = [
    { id: "INV001", patient: "Priya Sharma", test: "CBC", date: "28 Mar 2026", amount: "₹299", paid: true },
    { id: "INV002", patient: "Rahul Deshmukh", test: "Lipid Profile", date: "28 Mar 2026", amount: "₹499", paid: true },
    { id: "INV003", patient: "Sunita Joshi", test: "Thyroid Panel", date: "27 Mar 2026", amount: "₹599", paid: false },
    { id: "INV004", patient: "Amit Patil", test: "HbA1c", date: "27 Mar 2026", amount: "₹349", paid: true },
    { id: "INV005", patient: "Meera Kulkarni", test: "Vitamin D", date: "26 Mar 2026", amount: "₹799", paid: false },
];

export default function AdminBillingPage() {
    return (
        <div className="flex min-h-screen bg-slate-50">
            <AdminSidebar />
            <main className="flex-1 p-6">
                <PageHeader title="Billing" subtitle="Revenue and invoice management" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: "Today's Revenue", value: "₹8,450", icon: IndianRupee, color: "teal" },
                        { label: "Monthly Revenue", value: "₹1.2L", icon: TrendingUp, color: "cyan" },
                        { label: "Paid Invoices", value: "38", icon: CreditCard, color: "violet" },
                        { label: "Pending", value: "4", icon: Receipt, color: "amber" },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide">{label}</span>
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-${color}-50`}>
                                    <Icon className={`w-4 h-4 text-${color}-600`} strokeWidth={1.8} />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-slate-800">{value}</p>
                        </div>
                    ))}
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    {["Invoice", "Patient", "Test", "Date", "Amount", "Status"].map((h) => (
                                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((inv) => (
                                    <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-3.5 text-teal-600 font-semibold">{inv.id}</td>
                                        <td className="px-5 py-3.5 text-slate-700 font-medium">{inv.patient}</td>
                                        <td className="px-5 py-3.5 text-slate-600">{inv.test}</td>
                                        <td className="px-5 py-3.5 text-slate-500">{inv.date}</td>
                                        <td className="px-5 py-3.5 text-slate-800 font-bold">{inv.amount}</td>
                                        <td className="px-5 py-3.5">
                                            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${inv.paid ? "bg-teal-50 text-teal-700 border-teal-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                                                {inv.paid ? "Paid" : "Pending"}
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
