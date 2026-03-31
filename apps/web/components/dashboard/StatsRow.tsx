import { CalendarCheck, FileText, Clock, Activity } from "lucide-react";

const stats = [
    { label: "Total Bookings", value: "12", icon: CalendarCheck, color: "teal", change: "+2 this month" },
    { label: "Reports Ready", value: "8", icon: FileText, color: "cyan", change: "3 new" },
    { label: "Pending", value: "2", icon: Clock, color: "amber", change: "In progress" },
    { label: "Tests Done", value: "10", icon: Activity, color: "violet", change: "All time" },
];

const colorMap: Record<string, string> = {
    teal: "bg-teal-50 text-teal-600",
    cyan: "bg-cyan-50 text-cyan-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
};

export default function StatsRow() {
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
