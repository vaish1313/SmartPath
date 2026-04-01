import PageHeader from "@/components/shared/PageHeader";
import BookingsTable from "@/components/admin/BookingsTable";

export default function AdminBookingsPage() {
    return (
        <main className="p-6">
            <PageHeader title="Bookings" subtitle="Manage all test bookings" />
            <BookingsTable />
        </main>
    );
}
