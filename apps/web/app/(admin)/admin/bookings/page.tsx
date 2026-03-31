import AdminSidebar from "@/components/layout/AdminSidebar";
import PageHeader from "@/components/shared/PageHeader";
import BookingsTable from "@/components/admin/BookingsTable";

export default function AdminBookingsPage() {
    return (
        <div className="flex min-h-screen bg-slate-50">
            <AdminSidebar />
            <main className="flex-1 p-6">
                <PageHeader title="Bookings" subtitle="Manage all test bookings" />
                <BookingsTable />
            </main>
        </div>
    );
}
