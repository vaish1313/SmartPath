"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import AdminSidebar from "@/components/layout/AdminSidebar";

const STAFF_ROLES = ["admin", "lab_technician", "pathologist", "receptionist"];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, role } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;
        if (!isAuthenticated) { router.replace("/login"); return; }
        if (role === "patient") router.replace("/unauthorized");
    }, [isAuthenticated, isLoading, role, router]);

    if (isLoading) return <LoadingSpinner fullScreen />;
    if (!isAuthenticated || role === "patient") return null;

    return (
        <div className="flex min-h-screen bg-[#F5F5F3]">
            <AdminSidebar />
            <div className="flex-1">{children}</div>
        </div>
    );
}
