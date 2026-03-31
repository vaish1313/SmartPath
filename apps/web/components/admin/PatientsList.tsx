const patients = [
    { name: "Priya Sharma", phone: "+91 98765 43210", tests: 5, lastVisit: "30 Mar 2026" },
    { name: "Rahul Deshmukh", phone: "+91 87654 32109", tests: 3, lastVisit: "28 Mar 2026" },
    { name: "Sunita Joshi", phone: "+91 76543 21098", tests: 8, lastVisit: "25 Mar 2026" },
    { name: "Amit Patil", phone: "+91 65432 10987", tests: 2, lastVisit: "20 Mar 2026" },
];

export default function PatientsList() {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-slate-800 font-bold text-base">Recent Patients</h3>
            </div>
            <div className="divide-y divide-slate-50">
                {patients.map((p) => (
                    <div key={p.name} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm">
                                {p.name[0]}
                            </div>
                            <div>
                                <p className="text-slate-700 text-sm font-semibold">{p.name}</p>
                                <p className="text-slate-400 text-xs">{p.phone}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-slate-600 text-sm font-medium">{p.tests} tests</p>
                            <p className="text-slate-400 text-xs">{p.lastVisit}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
