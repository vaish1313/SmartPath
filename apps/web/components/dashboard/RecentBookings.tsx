import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

const bookings = [
    { id: "1", test: "Complete Blood Count", date: "28 Mar 2026", status: "completed", price: "₹299" },
    { id: "2", test: "Lipid Profile", date: "25 Mar 2026", status: "processing", price: "₹499" },
    { id: "3", test: "Thyroid Panel", date: "20 Mar 2026", status: "completed", price: "₹599" },
];

const statusStyle: Record<string, string> = {
    completed: "bg-teal-50 text-teal-700 border-teal-200",
    processing: "bg-amber-50 text-amber-700 border-amber-200",
    pending: "bg-slate-100 text-slate-600 border-slate-200",
    cancelled: "bg-red-50 text-red-600 border-red-200",
};

export default function RecentBookings() {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-slate-800 font-bold text-base">Recent Bookings</h3>
                <Link href="/bookings" className="text-teal-600 text-xs font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                    View all <ArrowRight className="w-3 h-3" />
                </Link>
            </div>
            <div className="space-y-3">
                {bookings.map((b) => (
                    <div key={b.id} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
                                <Clock className="w-4 h-4 text-teal-500" strokeWidth={1.8} />
                            </div>
                            <div>
                                <p className="text-slate-700 text-sm font-semibold">{b.test}</p>
                                <p className="text-slate-400 text-xs">{b.date}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border capitalize ${statusStyle[b.status]}`}>{b.status}</span>
                            <span className="text-teal-600 font-bold text-sm">{b.price}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
