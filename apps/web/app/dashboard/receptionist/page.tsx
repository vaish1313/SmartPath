"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import AdminSidebar from "@/components/layout/AdminSidebar";
import BookingsTable from "@/components/admin/BookingsTable";
import PatientsList from "@/components/admin/PatientsList";

export default function ReceptionistDashboardPage() {
    const { isAuthenticated, isLoading, role, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;
        if (!isAuthenticated) { router.replace("/login"); return; }
        if (role !== "receptionist" && role !== "admin") router.replace("/unauthorized");
    }, [isAuthenticated, isLoading, role, router]);

    if (isLoading) return <LoadingSpinner fullScreen />;
    if (!isAuthenticated) return null;

    return (
        <div className="flex min-h-screen bg-slate-50">
            <AdminSidebar />
            <main className="flex-1 p-6">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-800">Receptionist Dashboard</h1>
                    <p className="text-slate-500 text-sm mt-1">Welcome, {user?.fullName}</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <BookingsTable />
                    <PatientsList />
                </div>
            </main>
        </div>
    );
}
