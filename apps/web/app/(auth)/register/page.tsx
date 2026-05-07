"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, FlaskConical, ArrowRight, Loader2, Check, ArrowLeft } from "lucide-react";
import { registerUser } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { signIn } from "next-auth/react";
import axios from "axios";

const schema = z.object({
    email: z.string().email("Enter a valid email"),
    password: z
        .string()
        .min(8, "Password must be 8+ chars with uppercase and number")
        .regex(/[A-Z]/, "Password must be 8+ chars with uppercase and number")
        .regex(/[0-9]/, "Password must be 8+ chars with uppercase and number"),
    fullName: z.string().min(2, "Name too short"),
    phone: z.string().regex(/^\d{10}$/, "Enter valid 10-digit phone"),
    gender: z.enum(["male", "female", "other"], { required_error: "Select a gender" }),
    dateOfBirth: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const steps = ["Account", "Personal", "Confirm"];

export default function RegisterPage() {
    const [step, setStep] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [apiError, setApiError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const router = useRouter();
    const login = useAuthStore((s) => s.login);

    const { register, handleSubmit, trigger, watch, formState: { errors, isSubmitting } } =
        useForm<FormData>({ resolver: zodResolver(schema), mode: "onTouched" });

    const formValues = watch();

    const handleGoogleSignUp = async () => {
        setGoogleLoading(true);
        await signIn("google", { callbackUrl: "/portal" });
        setGoogleLoading(false);
    };

    const nextStep = async (e: React.FormEvent) => {
        e.preventDefault();
        if (step === 0) { const v = await trigger(["email", "password"]); if (v) setStep(1); }
        else if (step === 1) { const v = await trigger(["fullName", "phone", "gender"]); if (v) setStep(2); }
    };

    const onSubmit = async (data: FormData) => {
        setApiError("");
        try {
            const res = await registerUser({ fullName: data.fullName, email: data.email, phone: data.phone, password: data.password, gender: data.gender, dateOfBirth: data.dateOfBirth, role: "patient" });
            const { token, patient } = res.data;
            login(patient, token);
            setSuccessMsg("Account created! Taking you to your dashboard...");
            setTimeout(() => router.push("/dashboard"), 800);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                if (!err.response) setApiError("Unable to connect. Please try again.");
                else if (err.response.status === 409) setApiError("Email or phone already registered");
                else setApiError(err.response.data?.message || "Registration failed. Please try again.");
            } else {
                setApiError("Something went wrong. Please try again.");
            }
        }
    };

    const passwordStrength = (() => {
        const p = formValues.password || "";
        if (!p) return 0;
        let s = 0;
        if (p.length >= 8) s++;
        if (/[A-Z]/.test(p)) s++;
        if (/[0-9]/.test(p)) s++;
        if (/[^A-Za-z0-9]/.test(p)) s++;
        return s;
    })();

    const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][passwordStrength];
    const strengthColors = ["", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-teal-500"];
    const strengthTextColors = ["", "text-red-500", "text-amber-500", "text-blue-500", "text-teal-600"];

    const inputCls = "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm placeholder:text-slate-300 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all shadow-sm";
    const labelCls = "text-xs font-semibold text-slate-500 tracking-wide uppercase";

    return (
        <div className="min-h-screen bg-white flex">

            {/* ── Left branding panel ── */}
            <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden"
                style={{ background: "linear-gradient(135deg, #0f172a 0%, #0d2a27 60%, #0f2a2a 100%)" }}>
                <div className="absolute inset-0 pointer-events-none opacity-10"
                    style={{
                        backgroundImage: "linear-gradient(rgba(255,255,255,0.2) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.2) 1px,transparent 1px)",
                        backgroundSize: "48px 48px",
                    }}
                />

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                        <FlaskConical className="w-5 h-5 text-white" strokeWidth={1.8} />
                    </div>
                    <span className="text-white font-bold text-lg tracking-tight">SmartPath</span>
                </div>

                {/* Hero */}
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 mb-8">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <span className="text-white text-xs font-semibold tracking-wider uppercase">Free patient account</span>
                    </div>
                    <h1
                        className="text-[clamp(2.2rem,3.5vw,3rem)] font-bold leading-snug text-white mb-5"
                        style={{ fontFamily: "'Instrument Serif', serif", letterSpacing: "-0.02em" }}
                    >
                        Your health journey
                        <span className="block text-teal-100">starts here.</span>
                    </h1>
                    <p className="text-teal-100 text-base leading-relaxed max-w-sm">
                        Create your account in 2 minutes. Get instant access to test booking, live sample tracking, and digital reports.
                    </p>
                    <div className="mt-10 space-y-3.5">
                        {[
                            "Book any test online — no walk-in required",
                            "Download PDF reports from your portal",
                            "Track your sample status in real time",
                            "Your health history in one secure place",
                        ].map((feat) => (
                            <div key={feat} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                    <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
                                </div>
                                <span className="text-teal-100 text-sm">{feat}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10">
                    <p className="text-teal-200 text-xs">Protected by 256-bit encryption · HIPAA-compliant storage</p>
                </div>
            </div>

            {/* ── Right form panel ── */}
            <div className="flex-1 flex items-center justify-center p-6 relative bg-slate-50">
                <div className="hidden lg:block absolute left-0 top-8 bottom-8 w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent" />
                {/* Back to home */}
                <Link href="/" className="absolute top-5 right-5 flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-xs font-medium transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" /> Home
                </Link>
                <div className="w-full max-w-[420px]">

                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center gap-2.5 mb-10">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-md">
                            <FlaskConical className="w-4 h-4 text-white" strokeWidth={1.8} />
                        </div>
                        <span className="text-slate-800 font-bold">SmartPath</span>
                    </div>

                    {/* Heading */}
                    <div className="mb-7">
                        <h2 className="text-2xl font-bold text-slate-800 mb-1.5" style={{ letterSpacing: "-0.02em" }}>Create account</h2>
                        <p className="text-slate-500 text-sm">Join Prathamesh Advanced Diagnostic Center</p>
                    </div>

                    {/* Google OAuth (step 0 only) */}
                    {step === 0 && (
                        <>
                            <button
                                type="button"
                                onClick={handleGoogleSignUp}
                                disabled={googleLoading}
                                className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-70 text-slate-700 font-medium text-sm rounded-xl py-3.5 transition-all shadow-sm"
                            >
                                {googleLoading ? <Loader2 className="w-4 h-4 animate-spin text-[#4285F4]" /> : (
                                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                        <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
                                        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
                                        <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05" />
                                        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335" />
                                    </svg>
                                )}
                                Continue with Google
                            </button>
                            <div className="flex items-center gap-3 my-5">
                                <div className="flex-1 h-px bg-slate-200" />
                                <span className="text-slate-400 text-xs">or register with email</span>
                                <div className="flex-1 h-px bg-slate-200" />
                            </div>
                        </>
                    )}

                    {/* Step indicator */}
                    <div className="flex items-center mb-6">
                        {steps.map((s, i) => (
                            <div key={s} className="flex items-center flex-1 last:flex-none">
                                <div className="flex items-center gap-2">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${i < step ? "bg-teal-500 text-white" : i === step ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-400"
                                        }`}>
                                        {i < step ? <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> : i + 1}
                                    </div>
                                    <span className={`text-xs hidden sm:block font-medium transition-colors ${i === step ? "text-slate-800" : i < step ? "text-teal-600" : "text-slate-400"}`}>
                                        {s}
                                    </span>
                                </div>
                                {i < steps.length - 1 && (
                                    <div className="flex-1 mx-3 h-px bg-slate-200 relative overflow-hidden">
                                        <div className="absolute inset-y-0 left-0 bg-teal-500 transition-all duration-500" style={{ width: i < step ? "100%" : "0%" }} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Messages */}
                    {apiError && (
                        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{apiError}</div>
                    )}
                    {successMsg && (
                        <div className="mb-4 px-4 py-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 text-sm">{successMsg}</div>
                    )}

                    {/* ── Step 0: Account ── */}
                    {step === 0 && (
                        <form onSubmit={nextStep} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className={labelCls}>Email address</label>
                                <input type="email" placeholder="you@example.com" {...register("email")} className={inputCls} />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelCls}>Password</label>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" {...register("password")} className={inputCls + " pr-12"} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                                {formValues.password && (
                                    <div className="space-y-1.5 pt-1">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${i <= passwordStrength ? strengthColors[passwordStrength] : "bg-slate-200"}`} />
                                            ))}
                                        </div>
                                        <p className={`text-xs font-medium ${strengthTextColors[passwordStrength]}`}>{strengthLabel} password</p>
                                    </div>
                                )}
                            </div>
                            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-sm rounded-xl py-3.5 transition-all shadow-lg shadow-slate-300 group">
                                Continue <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                            </button>
                        </form>
                    )}

                    {/* ── Step 1: Personal ── */}
                    {step === 1 && (
                        <form onSubmit={nextStep} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className={labelCls}>Full name</label>
                                <input type="text" placeholder="As per Aadhaar / ID" {...register("fullName")} className={inputCls} />
                                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelCls}>Phone number</label>
                                <div className="flex gap-2">
                                    <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 text-slate-500 text-sm shadow-sm">+91</div>
                                    <input type="tel" placeholder="98765 43210" {...register("phone")} className={inputCls} />
                                </div>
                                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Date of birth</label>
                                    <input type="date" {...register("dateOfBirth")} className={inputCls} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Gender</label>
                                    <select {...register("gender")} className={inputCls} style={{ backgroundColor: "white" }}>
                                        <option value="">Select</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                    {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-1">
                                <button type="button" onClick={() => setStep(0)} className="flex-1 bg-white border border-slate-200 rounded-xl py-3 text-slate-500 hover:text-slate-700 hover:border-slate-300 text-sm transition-all shadow-sm">Back</button>
                                <button type="submit" className="flex-1 flex items-center justify-center gap-2 bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-sm rounded-xl py-3 transition-all shadow-lg shadow-slate-300 group">
                                    Continue <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ── Step 2: Confirm ── */}
                    {step === 2 && (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
                                {[
                                    { label: "Email", value: formValues.email },
                                    { label: "Name", value: formValues.fullName },
                                    { label: "Phone", value: formValues.phone ? `+91 ${formValues.phone}` : "—" },
                                    { label: "Date of Birth", value: formValues.dateOfBirth || "—" },
                                    { label: "Gender", value: formValues.gender ? formValues.gender.charAt(0).toUpperCase() + formValues.gender.slice(1) : "—" },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex justify-between items-center">
                                        <span className="text-slate-400 text-xs uppercase tracking-wider font-medium">{label}</span>
                                        <span className="text-slate-700 text-sm font-medium">{value}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-3">
                                <input type="checkbox" id="terms" required className="mt-0.5 w-4 h-4 accent-teal-600 rounded" />
                                <label htmlFor="terms" className="text-slate-500 text-xs leading-relaxed">
                                    I agree to the{" "}
                                    <Link href="/terms" className="text-teal-600 hover:underline font-medium">Terms of Service</Link>
                                    {" "}and{" "}
                                    <Link href="/privacy" className="text-teal-600 hover:underline font-medium">Privacy Policy</Link>
                                </label>
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setStep(1)} className="flex-1 bg-white border border-slate-200 rounded-xl py-3 text-slate-500 hover:text-slate-700 hover:border-slate-300 text-sm transition-all shadow-sm">Back</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 flex items-center justify-center gap-2 bg-[#0f172a] hover:bg-[#1e293b] disabled:opacity-60 text-white font-bold text-sm rounded-xl py-3 transition-all shadow-lg shadow-slate-300">
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create account"}
                                </button>
                            </div>
                        </form>
                    )}

                    <p className="text-center text-slate-400 text-sm mt-8 pt-6 border-t border-slate-200">
                        Already have an account?{" "}
                        <Link href="/login" className="text-teal-600 hover:text-teal-700 font-semibold transition-colors">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
