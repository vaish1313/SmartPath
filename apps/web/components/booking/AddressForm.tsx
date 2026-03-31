"use client";

interface Props {
    type: "home" | "lab";
    onTypeChange: (t: "home" | "lab") => void;
}

export default function AddressForm({ type, onTypeChange }: Props) {
    const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all";

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
                {(["lab", "home"] as const).map((t) => (
                    <button key={t} onClick={() => onTypeChange(t)} className={`py-3 rounded-xl text-sm font-semibold border transition-all ${type === t ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-200" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}>
                        {t === "lab" ? "🏥 Visit Lab" : "🏠 Home Collection"}
                    </button>
                ))}
            </div>

            {type === "home" && (
                <div className="space-y-3">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Address Line 1</label>
                        <input type="text" placeholder="House / Flat no., Street" className={inputCls} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Address Line 2</label>
                        <input type="text" placeholder="Area, Landmark" className={inputCls} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">City</label>
                            <input type="text" placeholder="Nashik" className={inputCls} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pincode</label>
                            <input type="text" placeholder="422001" className={inputCls} />
                        </div>
                    </div>
                </div>
            )}

            {type === "lab" && (
                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4">
                    <p className="text-teal-700 font-semibold text-sm">Prathamesh Advanced Diagnostic Center</p>
                    <p className="text-teal-600 text-xs mt-1">Nashik, Maharashtra 422001</p>
                    <p className="text-teal-500 text-xs mt-0.5">Mon–Sat: 7:00 AM – 8:00 PM</p>
                </div>
            )}
        </div>
    );
}
