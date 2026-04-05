"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

// /portal is the patient home.
// Valid auth = smartpath_token (email/password login) OR NextAuth session (Google OAuth).
export default function PortalPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();
    const { data: nextAuthSession, status: nextAuthStatus } = useSession();

    const bothLoading = isLoading || nextAuthStatus === "loading";
    const isAuthed = isAuthenticated || !!nextAuthSession;

    useEffect(() => {
        if (bothLoading) return;
        if (!isAuthed) { router.replace("/login"); return; }
        router.replace("/dashboard");
    }, [bothLoading, isAuthed, router]);

    return <LoadingSpinner fullScreen />;
}
