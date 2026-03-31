"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import AdminSidebar from "@/components/layout/AdminSidebar";
import BookingsTable from "@/components/admin/BookingsTable";

export default function LabDashboardPage() {
    const { isAuthenticated, isLoading, role, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;
        if (!isAuthenticated) { router.replace("/login"); return; }
        if (role !== "technician" && role !== "pathologist" && role !== "admin") router.replace("/unauthorized");
    }, [isAuthenticated, isLoading, role, router]);

    if (isLoading) return <LoadingSpinner fullScreen />;
    if (!isAuthenticated) return null;

    return (
        <div className="flex min-h-screen bg-slate-50">
            <AdminSidebar />
            <main className="flex-1 p-6">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-800">Lab Dashboard</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Welcome, {user?.fullName} · <span className="capitalize">{role}</span>
                    </p>
                </div>
                <div className="space-y-6">
                    <BookingsTable />
                </div>
            </main>
        </div>
    );
}
