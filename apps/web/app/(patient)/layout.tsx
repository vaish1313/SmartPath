"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;
        if (!isAuthenticated) {
            router.replace("/login");
            return;
        }
        if (user?.role !== "patient") {
            router.replace("/admin");
        }
    }, [isAuthenticated, isLoading, user, router]);

    if (isLoading) return <LoadingSpinner fullScreen />;
    if (!isAuthenticated || user?.role !== "patient") return null;

    return <>{children}</>;
}
