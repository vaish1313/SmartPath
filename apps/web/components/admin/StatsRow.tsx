import { Users, CalendarCheck, FileText, IndianRupee } from "lucide-react";

const stats = [
    { label: "Total Patients", value: "1,284", icon: Users, color: "teal", change: "+24 this week" },
    { label: "Bookings Today", value: "38", icon: CalendarCheck, color: "cyan", change: "+5 from yesterday" },
    { label: "Reports Pending", value: "12", icon: FileText, color: "amber", change: "Needs attention" },
    { label: "Revenue (Month)", value: "₹1.2L", icon: IndianRupee, color: "violet", change: "+18% vs last month" },
];

const colorMap: Record<string, string> = {
    teal: "bg-teal-50 text-teal-600",
    cyan: "bg-cyan-50 text-cyan-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
};

export default function AdminStatsRow() {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(({ label, value, icon: Icon, color, change }) => (
                <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide">{label}</span>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
                            <Icon className="w-4 h-4" strokeWidth={1.8} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{value}</p>
                    <p className="text-slate-400 text-xs mt-1">{change}</p>
                </div>
            ))}
        </div>
    );
}
