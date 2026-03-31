"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, FlaskConical, ArrowRight, Loader2 } from "lucide-react";
import { loginUser } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";

const schema = z.object({
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "Password too short"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [apiError, setApiError] = useState("");
    const router = useRouter();
    const login = useAuthStore((s) => s.login);

    const { register, handleSubmit, formState: { errors, isSubmitting } } =
        useForm<FormData>({ resolver: zodResolver(schema) });

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        setGoogleLoading(false);
    };

    const onSubmit = async (data: FormData) => {
        setApiError("");
        try {
            const res = await loginUser(data.email, data.password);
            const { token, patient } = res.data;
            login(patient, token);
            const role = patient.role;
            // Role-specific dashboard redirects
            if (role === "admin") router.push("/dashboard/admin");
            else if (role === "technician" || role === "pathologist") router.push("/dashboard/lab");
            else if (role === "receptionist") router.push("/dashboard/receptionist");
            else router.push("/portal");
        } catch (err) {
            if (axios.isAxiosError(err)) {
                if (!err.response) setApiError("Unable to connect. Please try again.");
                else setApiError(err.response.data?.message || "Invalid email or password");
            } else {
                setApiError("Something went wrong. Please try again.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-white flex">

            {/* ── Left branding panel ── */}
            <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-teal-600 to-cyan-600">
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
                        <span className="text-white text-xs font-semibold tracking-wider uppercase">Prathamesh Advanced Diagnostic Center</span>
                    </div>
                    <h1
                        className="text-[clamp(2.2rem,3.5vw,3rem)] font-bold leading-[1.15] text-white mb-5"
                        style={{ fontFamily: "'Instrument Serif', serif", letterSpacing: "-0.02em" }}
                    >
                        Precision diagnostics,<br />
                        <span className="text-teal-100">intelligently managed.</span>
                    </h1>
                    <p className="text-teal-100 text-base leading-relaxed max-w-sm">
                        Book tests, track samples, access reports — a complete lab management experience for patients and staff.
                    </p>
                    <div className="flex gap-8 mt-10">
                        {[{ value: "200+", label: "Tests Available" }, { value: "24hr", label: "Report Delivery" }, { value: "NABL", label: "Accredited" }].map((s) => (
                            <div key={s.label}>
                                <p className="text-white text-xl font-bold">{s.value}</p>
                                <p className="text-teal-200 text-xs mt-0.5">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quote */}
                <div className="relative z-10">
                    <div className="border-l-2 border-white/40 pl-4">
                        <p className="text-teal-100 text-sm italic leading-relaxed">"Accuracy in diagnosis is the first step towards effective treatment."</p>
                        <p className="text-teal-200 text-xs mt-1">— Dr. Kishor Khodke, MD</p>
                    </div>
                </div>
            </div>

            {/* ── Right form panel ── */}
            <div className="flex-1 flex items-center justify-center p-6 relative bg-slate-50">
                <div className="hidden lg:block absolute left-0 top-8 bottom-8 w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent" />
                <div className="w-full max-w-[400px]">

                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center gap-2.5 mb-10">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-md">
                            <FlaskConical className="w-4 h-4 text-white" strokeWidth={1.8} />
                        </div>
                        <span className="text-slate-800 font-bold">SmartPath</span>
                    </div>

                    {/* Heading */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-1.5" style={{ letterSpacing: "-0.02em" }}>
                            Welcome back
                        </h2>
                        <p className="text-slate-500 text-sm">Sign in to your SmartPath account</p>
                    </div>

                    {/* Google OAuth */}
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={googleLoading}
                        className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-70 text-slate-700 font-medium text-sm rounded-xl py-3.5 transition-all shadow-sm"
                    >
                        {googleLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#4285F4]" />
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
                                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
                                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05" />
                                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335" />
                            </svg>
                        )}
                        Continue with Google
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-slate-400 text-xs">or sign in with email</span>
                        <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    {/* API error */}
                    {apiError && (
                        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                            {apiError}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Email address</label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                {...register("email")}
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm placeholder:text-slate-300 outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-100 shadow-sm"
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Password</label>
                                <Link href="/forgot-password" className="text-xs text-teal-600 hover:text-teal-700 font-medium transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    {...register("password")}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 pr-12 text-slate-800 text-sm placeholder:text-slate-300 outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-100 shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl py-3.5 transition-all shadow-lg shadow-teal-200 group"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>Sign in <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" /></>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-slate-400 text-sm mt-8 pt-6 border-t border-slate-200">
                        New patient?{" "}
                        <Link href="/register" className="text-teal-600 hover:text-teal-700 font-semibold transition-colors">
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
