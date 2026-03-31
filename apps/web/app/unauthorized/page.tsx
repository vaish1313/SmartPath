import Link from "next/link";
import { ShieldX } from "lucide-react";

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
            <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
                    <ShieldX className="w-8 h-8 text-red-400" strokeWidth={1.5} />
                </div>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h1>
                <p className="text-slate-500 text-sm mb-8">
                    You don&apos;t have permission to view this page. Please contact your administrator if you believe this is a mistake.
                </p>
                <div className="flex gap-3 justify-center">
                    <Link href="/dashboard" className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow-md shadow-teal-200">
                        Go to Dashboard
                    </Link>
                    <Link href="/login" className="bg-white border border-slate-200 text-slate-600 font-semibold text-sm px-6 py-3 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
