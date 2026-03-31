"use client";

const data = [
    { month: "Oct", value: 85000 },
    { month: "Nov", value: 92000 },
    { month: "Dec", value: 78000 },
    { month: "Jan", value: 105000 },
    { month: "Feb", value: 98000 },
    { month: "Mar", value: 120000 },
];

const max = Math.max(...data.map((d) => d.value));

function fmt(v: number) {
    return v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${(v / 1000).toFixed(0)}K`;
}

export default function RevenueChart() {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-slate-800 font-bold text-base">Revenue Overview</h3>
                    <p className="text-slate-400 text-xs mt-0.5">Last 6 months</p>
                </div>
                <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">+18% growth</span>
            </div>
            <div className="flex items-end gap-3 h-36">
                {data.map(({ month, value }) => (
                    <div key={month} className="flex-1 flex flex-col items-center gap-1.5">
                        <span className="text-[9px] text-slate-400 font-medium">{fmt(value)}</span>
                        <div
                            className="w-full rounded-t-lg bg-gradient-to-t from-teal-500 to-cyan-400"
                            style={{ height: `${(value / max) * 100}%` }}
                        />
                        <span className="text-slate-400 text-[10px] font-medium">{month}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
