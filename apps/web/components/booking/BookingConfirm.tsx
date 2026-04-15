import { CheckCircle, Calendar, Clock, MapPin } from "lucide-react";

interface Test { id: string; name: string; price: number; }

interface Props {
    tests: Test[];
    date: string;
    slot: string;
    collectionType: "home" | "lab";
}

export default function BookingConfirm({ tests, date, slot, collectionType }: Props) {
    const total = tests.reduce((s, t) => s + t.price, 0);

    return (
        <div className="space-y-4">
            <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl hover:bg-white/70 transition-all">
                <div className="px-5 py-3.5 bg-slate-50/50 backdrop-blur-sm border-b border-slate-100/60">
                    <p className="text-slate-700 font-semibold text-sm">Booking Summary</p>
                </div>
                <div className="p-5 space-y-4">
                    <div>
                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-2">Tests</p>
                        {tests.map((t) => (
                            <div key={t.id} className="flex justify-between items-center py-1.5">
                                <span className="text-slate-700 text-sm">{t.name}</span>
                                <span className="text-teal-600 font-semibold text-sm">₹{t.price}</span>
                            </div>
                        ))}
                        <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-2">
                            <span className="text-slate-700 font-bold text-sm">Total</span>
                            <span className="text-teal-700 font-bold text-base">₹{total}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {[
                            { icon: Calendar, label: "Date", value: date || "Not selected" },
                            { icon: Clock, label: "Time", value: slot || "Not selected" },
                            { icon: MapPin, label: "Collection", value: collectionType === "home" ? "Home Collection" : "Visit Lab" },
                        ].map(({ icon: Icon, label, value }) => (
                            <div key={label} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                                    <Icon className="w-4 h-4 text-teal-500" strokeWidth={1.8} />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs">{label}</p>
                                    <p className="text-slate-700 text-sm font-semibold">{value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex items-start gap-3 bg-teal-50 border border-teal-200 rounded-xl p-4">
                <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                <p className="text-teal-700 text-xs leading-relaxed">
                    By confirming, you agree to our terms. Payment is collected at the lab or before home collection. Free cancellation up to 2 hours before the appointment.
                </p>
            </div>
        </div>
    );
}
