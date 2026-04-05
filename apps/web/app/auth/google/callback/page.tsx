"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { patientApi } from "@/lib/api";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function GoogleCallbackPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const login = useAuthStore((s) => s.login);
    const ran = useRef(false);

    useEffect(() => {
        // Wait until NextAuth has resolved the session
        if (status === "loading") return;
        // Only run once
        if (ran.current) return;
        ran.current = true;

        if (status === "unauthenticated") {
            router.replace("/login");
            return;
        }

        const s = session as Record<string, unknown> | null;

        // Happy path — jwt callback already called patient-service and stored the token
        if (s?.smartpathToken && s?.smartpathUser) {
            login(s.smartpathUser as Parameters<typeof login>[0], s.smartpathToken as string);
            router.replace("/dashboard");
            return;
        }

        // Fallback — jwt callback couldn't reach patient-service, call it directly from client
        const email = session?.user?.email;
        const fullName = session?.user?.name;
        if (!email) {
            router.replace("/login?error=google");
            return;
        }

        patientApi
            .post("/api/auth/google-oauth", { email, fullName })
            .then((res) => {
                const { token, patient } = res.data;
                login(patient, token);
                router.replace("/dashboard");
            })
            .catch(() => {
                router.replace("/login?error=google");
            });
    }, [status, session, login, router]);

    return <LoadingSpinner fullScreen />;
}
