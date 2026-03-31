import { X } from "lucide-react";

interface Test { id: string; name: string; price: number; }

interface Props {
    items: Test[];
    onRemove: (id: string) => void;
}

export default function BookingCart({ items, onRemove }: Props) {
    const total = items.reduce((s, t) => s + t.price, 0);

    if (items.length === 0) return (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
            <p className="text-slate-400 text-sm">No tests selected yet</p>
        </div>
    );

    return (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
                <p className="text-slate-700 font-semibold text-sm">{items.length} test{items.length > 1 ? "s" : ""} selected</p>
            </div>
            <div className="divide-y divide-slate-50">
                {items.map((t) => (
                    <div key={t.id} className="flex items-center justify-between px-5 py-3">
                        <p className="text-slate-700 text-sm font-medium">{t.name}</p>
                        <div className="flex items-center gap-3">
                            <span className="text-teal-600 font-bold text-sm">₹{t.price}</span>
                            <button onClick={() => onRemove(t.id)} className="text-slate-300 hover:text-red-400 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="px-5 py-3.5 border-t border-slate-100 bg-teal-50 flex items-center justify-between">
                <span className="text-slate-600 font-semibold text-sm">Total</span>
                <span className="text-teal-700 font-bold text-base">₹{total}</span>
            </div>
        </div>
    );
}
