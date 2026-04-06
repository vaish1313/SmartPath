"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAuth } from "@/hooks/useAuth";
import { checkPatientEmail, registerGooglePatient, patientApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Loader2, FlaskConical } from "lucide-react";

export default function PortalPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();
    const { data: session, status: nextAuthStatus } = useSession();
    const login = useAuthStore((s) => s.login);

    const [checking, setChecking] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const ran = useRef(false);

    // Form state
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [dob, setDob] = useState("");
    const [gender, setGender] = useState("");
    const [bloodGroup, setBloodGroup] = useState("");
    const [street, setStreet] = useState("");
    const [city, setCity] = useState("");
    const [stateName, setStateName] = useState("");
    const [pincode, setPincode] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    const bothLoading = isLoading || nextAuthStatus === "loading";

    // Helper: get a smartpath JWT for a Google user and call login()
    const loginGoogleUser = async (email: string, name: string) => {
        const res = await patientApi.post("/api/auth/google-oauth", { email, fullName: name });
        const { token, patient } = res.data;
        login(patient, token);
    };

    useEffect(() => {
        if (bothLoading) return;
        if (ran.current) return;

        const authed = isAuthenticated || !!session;
        if (!authed) { router.replace("/login"); return; }

        // Email/password users already have a token — go straight to dashboard
        if (isAuthenticated) { router.replace("/dashboard"); return; }

        // Google OAuth user — needs a smartpath JWT
        const email = session?.user?.email;
        const name = session?.user?.name || "";
        if (!email) { router.replace("/login"); return; }

        ran.current = true;
        setChecking(true);
        setFullName(name);

        checkPatientEmail(email)
            .then(async (res) => {
                if (res.data.exists) {
                    // Patient record exists — get JWT and go to dashboard
                    await loginGoogleUser(email, name);
                    router.replace("/dashboard");
                } else {
                    // New Google user — show onboarding modal
                    setShowModal(true);
                    setChecking(false);
                }
            })
            .catch(() => {
                setShowModal(true);
                setChecking(false);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bothLoading, isAuthenticated, session?.user?.email]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");
        if (!phone || phone.length !== 10) { setFormError("Enter a valid 10-digit phone number."); return; }
        if (!gender) { setFormError("Please select a gender."); return; }

        const email = session?.user?.email!;
        setSubmitting(true);
        try {
            await registerGooglePatient({
                fullName,
                email,
                phone,
                dateOfBirth: dob || undefined,
                gender,
                bloodGroup: bloodGroup || undefined,
                address: { street, city, state: stateName, pincode },
            });
            // Get JWT after registration
            await loginGoogleUser(email, fullName);
            router.replace("/dashboard");
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setFormError(msg || "Something went wrong. Please try again.");
            setSubmitting(false);
        }
    };

    if (bothLoading || checking) return <LoadingSpinner fullScreen />;
    if (!showModal) return <LoadingSpinner fullScreen />;

    const inputCls = "w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm placeholder:text-slate-300 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all";
    const labelCls = "text-xs font-semibold text-slate-500 tracking-wide uppercase";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
                            <FlaskConical className="w-5 h-5 text-teal-600" strokeWidth={1.8} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-800">Complete your profile</h2>
                            <p className="text-slate-400 text-xs">A few details to set up your patient account</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    <div className="space-y-1.5">
                        <label className={labelCls}>Full Name</label>
                        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className={inputCls} placeholder="As per Aadhaar / ID" />
                    </div>

                    <div className="space-y-1.5">
                        <label className={labelCls}>Phone Number</label>
                        <div className="flex gap-2">
                            <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 text-slate-500 text-sm">+91</div>
                            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} required className={inputCls} placeholder="98765 43210" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className={labelCls}>Date of Birth</label>
                            <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={inputCls} />
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelCls}>Gender</label>
                            <select value={gender} onChange={(e) => setGender(e.target.value)} required className={inputCls} style={{ backgroundColor: "white" }}>
                                <option value="">Select</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className={labelCls}>Blood Group <span className="text-slate-300 normal-case font-normal">(optional)</span></label>
                        <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className={inputCls} style={{ backgroundColor: "white" }}>
                            <option value="">Select</option>
                            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-3">
                        <label className={labelCls}>Address <span className="text-slate-300 normal-case font-normal">(optional)</span></label>
                        <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Street / Flat / Area" className={inputCls} />
                        <div className="grid grid-cols-2 gap-3">
                            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className={inputCls} />
                            <input type="text" value={stateName} onChange={(e) => setStateName(e.target.value)} placeholder="State" className={inputCls} />
                        </div>
                        <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Pincode" className={inputCls} />
                    </div>

                    {formError && <p className="text-red-500 text-xs">{formError}</p>}

                    <button type="submit" disabled={submitting}
                        className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl py-3 transition-all shadow-lg shadow-teal-200">
                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {submitting ? "Saving..." : "Save & Continue"}
                    </button>
                </form>
            </div>
        </div>
    );
}
