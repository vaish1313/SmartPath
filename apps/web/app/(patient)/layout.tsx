"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, role } = useAuth();
    const { data: nextAuthSession, status: nextAuthStatus } = useSession();

    const router = useRouter();

    const loading = isLoading || nextAuthStatus === "loading";
    // Valid if either auth system confirms the user
    const authed = isAuthenticated || !!nextAuthSession;
    // Role guard only applies when using smartpath auth (Google OAuth = always patient)
    const badRole = !nextAuthSession && role && role !== "patient";

    useEffect(() => {
        if (loading) return;
        if (!authed) { router.replace("/login"); return; }
        if (badRole) router.replace("/unauthorized");
    }, [loading, authed, badRole, router]);

    if (loading) return <LoadingSpinner fullScreen />;
    if (!authed || badRole) return null;

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <div className="flex-1 pb-20 lg:pb-0">{children}</div>
            <MobileNav />
        </div>
    );
}
