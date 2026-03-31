import Link from "next/link";
import { CheckCircle, ArrowRight, FileText } from "lucide-react";

interface Props { bookingId?: string; }

export default function BookingSuccess({ bookingId = "BK001" }: Props) {
    return (
        <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-teal-600" strokeWidth={1.8} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Booking Confirmed!</h2>
            <p className="text-slate-500 text-sm mb-1">Your booking ID is</p>
            <p className="text-teal-600 font-bold text-lg mb-6">{bookingId}</p>
            <p className="text-slate-400 text-sm max-w-xs mx-auto mb-8">
                You'll receive a confirmation SMS and email. Our team will contact you before the appointment.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/bookings" className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-lg shadow-teal-200">
                    <FileText className="w-4 h-4" /> View Bookings
                </Link>
                <Link href="/dashboard" className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm px-6 py-3 rounded-xl transition-all">
                    Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}
