import AdminStatsRow from "@/components/admin/StatsRow";
import RevenueChart from "@/components/admin/RevenueChart";
import BookingsTable from "@/components/admin/BookingsTable";
import PatientsList from "@/components/admin/PatientsList";

export default function AdminDashboardPage() {
    return (
        <main className="p-6 relative">
            {/* Background glow orbs — matches landing page */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full bg-teal-400 opacity-[0.04] blur-[120px] pointer-events-none -z-0" />
            <div className="fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-cyan-400 opacity-[0.04] blur-[100px] pointer-events-none -z-0" />

            <div className="relative z-10 space-y-6">
                {/* Header */}
                <div className="mb-2">
                    <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-4 py-1.5 mb-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                        <span className="text-teal-700 text-xs font-semibold tracking-widest uppercase">
                            Prathamesh Advanced Diagnostic Center
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Instrument Serif', serif" }}>
                        Admin Dashboard
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    </p>
                </div>

                <AdminStatsRow />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <RevenueChart />
                    </div>
                    <PatientsList />
                </div>

                <BookingsTable />
            </div>
        </main>
    );
}
