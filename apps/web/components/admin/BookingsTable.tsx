const bookings = [
    { id: "BK001", patient: "Priya Sharma", test: "CBC", date: "30 Mar", status: "completed", amount: "₹299" },
    { id: "BK002", patient: "Rahul Deshmukh", test: "Lipid Profile", date: "30 Mar", status: "processing", amount: "₹499" },
    { id: "BK003", patient: "Sunita Joshi", test: "Thyroid Panel", date: "29 Mar", status: "pending", amount: "₹599" },
    { id: "BK004", patient: "Amit Patil", test: "HbA1c", date: "29 Mar", status: "completed", amount: "₹349" },
    { id: "BK005", patient: "Meera Kulkarni", test: "Vitamin D", date: "28 Mar", status: "cancelled", amount: "₹799" },
];

const statusStyle: Record<string, string> = {
    completed: "bg-teal-50 text-teal-700 border-teal-200",
    processing: "bg-amber-50 text-amber-700 border-amber-200",
    pending: "bg-slate-100 text-slate-600 border-slate-200",
    cancelled: "bg-red-50 text-red-600 border-red-200",
};

export default function BookingsTable() {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-slate-800 font-bold text-base">Recent Bookings</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            {["ID", "Patient", "Test", "Date", "Status", "Amount"].map((h) => (
                                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((b) => (
                            <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                <td className="px-5 py-3.5 text-teal-600 font-semibold">{b.id}</td>
                                <td className="px-5 py-3.5 text-slate-700 font-medium">{b.patient}</td>
                                <td className="px-5 py-3.5 text-slate-600">{b.test}</td>
                                <td className="px-5 py-3.5 text-slate-500">{b.date}</td>
                                <td className="px-5 py-3.5">
                                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border capitalize ${statusStyle[b.status]}`}>{b.status}</span>
                                </td>
                                <td className="px-5 py-3.5 text-slate-700 font-semibold">{b.amount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
