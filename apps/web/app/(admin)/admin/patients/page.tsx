import AdminSidebar from "@/components/layout/AdminSidebar";
import PageHeader from "@/components/shared/PageHeader";
import { Search, UserPlus } from "lucide-react";

const patients = [
    { id: "P001", name: "Priya Sharma", phone: "+91 98765 43210", email: "priya@example.com", dob: "15 Jun 1996", gender: "Female", tests: 5 },
    { id: "P002", name: "Rahul Deshmukh", phone: "+91 87654 32109", email: "rahul@example.com", dob: "22 Mar 1988", gender: "Male", tests: 3 },
    { id: "P003", name: "Sunita Joshi", phone: "+91 76543 21098", email: "sunita@example.com", dob: "10 Jan 1960", gender: "Female", tests: 8 },
    { id: "P004", name: "Amit Patil", phone: "+91 65432 10987", email: "amit@example.com", dob: "5 Sep 1992", gender: "Male", tests: 2 },
    { id: "P005", name: "Meera Kulkarni", phone: "+91 54321 09876", email: "meera@example.com", dob: "18 Dec 1985", gender: "Female", tests: 6 },
];

export default function AdminPatientsPage() {
    return (
        <div className="flex min-h-screen bg-slate-50">
            <AdminSidebar />
            <main className="flex-1 p-6">
                <PageHeader
                    title="Patients"
                    subtitle={`${patients.length} registered patients`}
                    action={
                        <button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-md shadow-teal-200">
                            <UserPlus className="w-4 h-4" /> Add Patient
                        </button>
                    }
                />
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100">
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input placeholder="Search patients..." className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all" />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    {["ID", "Name", "Phone", "Email", "DOB", "Gender", "Tests"].map((h) => (
                                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {patients.map((p) => (
                                    <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer">
                                        <td className="px-5 py-3.5 text-teal-600 font-semibold">{p.id}</td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">{p.name[0]}</div>
                                                <span className="text-slate-700 font-semibold">{p.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-600">{p.phone}</td>
                                        <td className="px-5 py-3.5 text-slate-500">{p.email}</td>
                                        <td className="px-5 py-3.5 text-slate-500">{p.dob}</td>
                                        <td className="px-5 py-3.5 text-slate-600">{p.gender}</td>
                                        <td className="px-5 py-3.5"><span className="font-semibold text-teal-600">{p.tests}</span></td>
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
