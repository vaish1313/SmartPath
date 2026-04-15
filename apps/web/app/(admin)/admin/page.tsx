"use client";

import { useState, useEffect } from "react";
import AdminStatsRow from "@/components/admin/StatsRow";
import RevenueChart from "@/components/admin/RevenueChart";
import BookingsTable from "@/components/admin/BookingsTable";
import PatientsList from "@/components/admin/PatientsList";
import { useAuthStore } from "@/store/authStore";
import PageLoader from "@/components/shared/PageLoader";

export default function AdminDashboardPage() {
    const user = useAuthStore((s) => s.user);
    const [pageLoading, setPageLoading] = useState(true);
    const today = new Date();
    const hour = today.getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
    const day = today.getDate();
    const month = today.toLocaleDateString("en-US", { month: "long" });

    useEffect(() => {
        // Simulate initial data load
        const timer = setTimeout(() => setPageLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    if (pageLoading) {
        return <PageLoader message="Loading dashboard..." />;
    }

    return (
        <main className="p-5 bg-[#F5F5F3] overflow-auto">
            {/* Topbar */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white" style={{ border: "0.5px solid rgba(0,0,0,0.1)" }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1D9E75]" />
                    <span className="text-slate-600 text-sm">{dayName}, {day} {month}</span>
                </div>
            </div>

            {/* Header */}
            <div className="mb-5">
                <h1 className="text-2xl font-semibold text-slate-800 mb-0.5">
                    {greeting}, Dr. Prathamesh Khodke
                </h1>
                <p className="text-slate-500 text-sm">Prathamesh Advanced Diagnostic Center</p>
            </div>

            {/* Stats */}
            <div className="mb-5">
                <AdminStatsRow />
            </div>

            {/* Revenue + Patients */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
                <div className="lg:col-span-2">
                    <RevenueChart />
                </div>
                <PatientsList />
            </div>

            {/* Bookings Table */}
            <BookingsTable />
        </main>
    );
}
