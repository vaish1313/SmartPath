"use client";

import { Search, Plus, Check } from "lucide-react";
import { useState } from "react";

const tests = [
    { id: "1", name: "Complete Blood Count (CBC)", price: 299, time: "24 hrs", category: "Hematology" },
    { id: "2", name: "Lipid Profile", price: 499, time: "24 hrs", category: "Biochemistry" },
    { id: "3", name: "HbA1c", price: 349, time: "24 hrs", category: "Biochemistry" },
    { id: "4", name: "Thyroid Panel", price: 599, time: "24 hrs", category: "Immunology" },
    { id: "5", name: "Vitamin D Total", price: 799, time: "48 hrs", category: "Biochemistry" },
    { id: "6", name: "Liver Function Test", price: 449, time: "24 hrs", category: "Biochemistry" },
];

interface Props {
    selected: string[];
    onToggle: (id: string) => void;
}

export default function TestSelector({ selected, onToggle }: Props) {
    const [search, setSearch] = useState("");
    const filtered = tests.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div>
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tests..." className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all" />
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {filtered.map((t) => {
                    const sel = selected.includes(t.id);
                    return (
                        <button key={t.id} onClick={() => onToggle(t.id)} className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${sel ? "border-teal-300 bg-teal-50" : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"}`}>
                            <div>
                                <p className={`text-sm font-semibold ${sel ? "text-teal-700" : "text-slate-700"}`}>{t.name}</p>
                                <p className="text-slate-400 text-xs mt-0.5">{t.category} · {t.time}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`font-bold text-sm ${sel ? "text-teal-600" : "text-slate-700"}`}>₹{t.price}</span>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${sel ? "bg-teal-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                                    {sel ? <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> : <Plus className="w-3.5 h-3.5" />}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
