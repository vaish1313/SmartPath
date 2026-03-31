"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, role } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;
        if (!isAuthenticated) { router.replace("/login"); return; }
        if (role && role !== "patient") router.replace("/unauthorized");
    }, [isAuthenticated, isLoading, role, router]);

    if (isLoading) return <LoadingSpinner fullScreen />;
    if (!isAuthenticated || (role && role !== "patient")) return null;

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <div className="flex-1 pb-20 lg:pb-0">{children}</div>
            <MobileNav />
        </div>
    );
}
