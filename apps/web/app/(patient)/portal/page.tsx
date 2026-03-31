"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// /portal is the patient home — redirect to their dashboard
export default function PortalPage() {
    const router = useRouter();
    useEffect(() => { router.replace("/dashboard"); }, [router]);
    return null;
}
