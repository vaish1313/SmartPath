"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

const ALLOWED_ROLES = ["admin", "technician", "pathologist"];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;
        if (!isAuthenticated) {
            router.replace("/login");
            return;
        }
        if (!ALLOWED_ROLES.includes(user?.role ?? "")) {
            router.replace("/dashboard");
        }
    }, [isAuthenticated, isLoading, user, router]);

    if (isLoading) return <LoadingSpinner fullScreen />;
    if (!isAuthenticated || !ALLOWED_ROLES.includes(user?.role ?? "")) return null;

    return <>{children}</>;
}
