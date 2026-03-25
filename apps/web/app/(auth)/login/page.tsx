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

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({ resolver: zodResolver(schema) });

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        // TODO: implement Google OAuth
        setGoogleLoading(false);
    };

    const onSubmit = async (data: FormData) => {
        setApiError("");
        try {
            const res = await loginUser(data.email, data.password);
            const { token, patient } = res.data;
            login(patient, token);
            const role = patient.role;
            if (role === "admin" || role === "technician" || role === "pathologist") {
                router.push("/admin");
            } else {
                router.push("/dashboard");
            }
        } catch (err) {
            if (axios.isAxiosError(err)) {
                if (!err.response) {
                    setApiError("Unable to connect. Please try again.");
                } else {
                    setApiError(err.response.data?.message || "Invalid email or password");
                }
            } else {
                setApiError("Something went wrong. Please try again.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#060B14] flex">
            {/* ── Left branding panel ── */}
            <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(20,215,180,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(20,215,180,0.04) 1px,transparent 1px)",
                        backgroundSize: "48px 48px",
                    }}
                />
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#14D7B4] opacity-[0.06] blur-[120px] pointer-events-none" />

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#14D7B4] to-[#0EA5E9] flex items-center justify-center shadow-lg shadow-[#14D7B4]/20">
                        <FlaskConical className="w-5 h-5 text-white" strokeWidth={1.8} />
                    </div>
                    <span className="text-white font-semibold text-lg tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        SmartPath
                    </span>
                </div>

                {/* Hero */}
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
                        <span className="w-2 h-2 rounded-full bg-[#14D7B4] animate-pulse" />
                        <span className="text-[#14D7B4] text-xs font-medium tracking-wider uppercase">Prathamesh Advanced Diagnostic Center</span>
                    </div>
                    <h1
                        className="text-[clamp(2.2rem,3.5vw,3rem)] font-semibold leading-[1.15] text-white mb-5"
                        style={{ fontFamily: "'Instrument Serif', serif", letterSpacing: "-0.02em" }}
                    >
                        Precision diagnostics,<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#14D7B4] to-[#0EA5E9]">intelligently managed.</span>
                    </h1>
                    <p className="text-[#8899AA] text-base leading-relaxed max-w-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        Book tests, track samples, access reports — a complete lab management experience for patients and staff.
                    </p>
                    <div className="flex gap-8 mt-10">
                        {[
                            { value: "200+", label: "Tests Available" },
                            { value: "24hr", label: "Report Delivery" },
                            { value: "NABL", label: "Accredited" },
                        ].map((s) => (
                            <div key={s.label}>
                                <p className="text-white text-xl font-semibold" style={{ fontFamily: "'DM Sans', sans-serif" }}>{s.value}</p>
                                <p className="text-[#556677] text-xs mt-0.5">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quote */}
                <div className="relative z-10">
                    <div className="border-l-2 border-[#14D7B4]/40 pl-4">
                        <p className="text-[#778899] text-sm italic leading-relaxed">"Accuracy in diagnosis is the first step towards effective treatment."</p>
                        <p className="text-[#556677] text-xs mt-1">— Dr. Kishor Khodke, MD</p>
                    </div>
                </div>
            </div>

            {/* ── Right form panel ── */}
            <div className="flex-1 flex items-center justify-center p-6 relative">
                <div className="hidden lg:block absolute left-0 top-8 bottom-8 w-px bg-gradient-to-b from-transparent via-white/8 to-transparent" />
                <div className="w-full max-w-[400px]">
                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center gap-2.5 mb-10">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#14D7B4] to-[#0EA5E9] flex items-center justify-center">
                            <FlaskConical className="w-4 h-4 text-white" strokeWidth={1.8} />
                        </div>
                        <span className="text-white font-semibold" style={{ fontFamily: "'DM Sans', sans-serif" }}>SmartPath</span>
                    </div>

                    {/* Heading */}
                    <div className="mb-8">
                        <h2
                            className="text-2xl font-semibold text-white mb-1.5"
                            style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.02em" }}
                        >
                            Welcome back
                        </h2>
                        <p className="text-[#667788] text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                            Sign in to your SmartPath account
                        </p>
                    </div>

                    {/* Google OAuth */}
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={googleLoading}
                        className="w-full flex items-center justify-center gap-3 bg-black disabled:opacity-70 text-[#ffffff] font-medium text-sm rounded-xl py-3.5 transition-all duration-200 shadow-sm"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                        {googleLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#4285F4]" />
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                        <div className="flex-1 h-px bg-white/8" />
                        <span className="text-[#445566] text-xs" style={{ fontFamily: "'DM Sans', sans-serif" }}>or sign in with email</span>
                        <div className="flex-1 h-px bg-white/8" />
                    </div>

                    {/* API error */}
                    {apiError && (
                        <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                            {apiError}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-[#8899AA] tracking-wide uppercase" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                                Email address
                            </label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                {...register("email")}
                                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#445566] outline-none transition-all focus:border-[#14D7B4]/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-[#14D7B4]/10"
                                style={{ fontFamily: "'DM Sans', sans-serif" }}
                            />
                            {errors.email && (
                                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-medium text-[#8899AA] tracking-wide uppercase" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                                    Password
                                </label>
                                <Link href="/forgot-password" className="text-xs text-[#14D7B4] hover:text-[#14D7B4]/80 transition-colors" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    {...register("password")}
                                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 pr-12 text-white text-sm placeholder:text-[#445566] outline-none transition-all focus:border-[#14D7B4]/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-[#14D7B4]/10"
                                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#445566] hover:text-[#8899AA] transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#14D7B4] to-[#0EA5E9] hover:opacity-90 disabled:opacity-60 text-[#060B14] font-semibold text-sm rounded-xl py-3.5 transition-all duration-200 shadow-lg shadow-[#14D7B4]/20 group"
                            style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    Sign in
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Bottom */}
                    <p
                        className="text-center text-[#556677] text-sm mt-8 pt-6 border-t border-white/[0.06]"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                        New patient?{" "}
                        <Link href="/register" className="text-[#14D7B4] hover:text-[#14D7B4]/80 font-medium transition-colors">
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
