"use client";

const data = [
    { month: "Oct", value: 65 },
    { month: "Nov", value: 72 },
    { month: "Dec", value: 68 },
    { month: "Jan", value: 80 },
    { month: "Feb", value: 75 },
    { month: "Mar", value: 88 },
];

const max = Math.max(...data.map((d) => d.value));

export default function HealthChart() {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-slate-800 font-bold text-base">Health Trend</h3>
                    <p className="text-slate-400 text-xs mt-0.5">Last 6 months activity</p>
                </div>
                <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">+12% better</span>
            </div>
            <div className="flex items-end gap-3 h-32">
                {data.map(({ month, value }) => (
                    <div key={month} className="flex-1 flex flex-col items-center gap-1.5">
                        <div
                            className="w-full rounded-t-lg bg-gradient-to-t from-teal-500 to-cyan-400 opacity-80 hover:opacity-100 transition-opacity"
                            style={{ height: `${(value / max) * 100}%` }}
                        />
                        <span className="text-slate-400 text-[10px] font-medium">{month}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
