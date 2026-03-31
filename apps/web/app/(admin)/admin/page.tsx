import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminStatsRow from "@/components/admin/StatsRow";
import RevenueChart from "@/components/admin/RevenueChart";
import BookingsTable from "@/components/admin/BookingsTable";
import PatientsList from "@/components/admin/PatientsList";

export default function AdminDashboardPage() {
    return (
        <div className="flex min-h-screen bg-slate-50">
            <AdminSidebar />
            <main className="flex-1 p-6 max-w-6xl">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
                    <p className="text-slate-500 text-sm mt-1">Prathamesh Advanced Diagnostic Center</p>
                </div>
                <div className="space-y-6">
                    <AdminStatsRow />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2"><RevenueChart /></div>
                        <PatientsList />
                    </div>
                    <BookingsTable />
                </div>
            </main>
        </div>
    );
}
