"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { registerUser } from "@/lib/api";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { UserCog, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import axios from "axios";

const schema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email"),
    phone: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit phone number"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["technician", "receptionist", "pathologist"], {
        required_error: "Select a role",
    }),
});

type FormData = z.infer<typeof schema>;

export default function StaffManagementPage() {
    const { isAuthenticated, isLoading, role } = useAuth();
    const router = useRouter();
    const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

    useEffect(() => {
        if (isLoading) return;
        if (!isAuthenticated) { router.replace("/login"); return; }
        if (role !== "admin") router.replace("/unauthorized");
    }, [isAuthenticated, isLoading, role, router]);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({ resolver: zodResolver(schema) });

    const showToast = (type: "success" | "error", message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    const onSubmit = async (data: FormData) => {
        try {
            await registerUser({
                fullName: data.fullName,
                email: data.email,
                phone: data.phone,
                password: data.password,
                role: data.role,
            });
            showToast("success", `Staff account created for ${data.fullName} (${data.role})`);
            reset();
        } catch (err) {
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 409) {
                    showToast("error", "Email or phone already registered");
                } else {
                    showToast("error", err.response?.data?.message || "Failed to create account");
                }
            } else {
                showToast("error", "Something went wrong. Please try again.");
            }
        }
    };

    if (isLoading) return <LoadingSpinner fullScreen />;
    if (!isAuthenticated || role !== "admin") return null;

    const inputCls = "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm placeholder:text-slate-300 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all shadow-sm";
    const labelCls = "text-xs font-semibold text-slate-500 tracking-wide uppercase";

    return (
        <main className="p-6 max-w-2xl">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                    <UserCog className="w-5 h-5 text-teal-600" strokeWidth={1.8} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Staff Management</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Create accounts for lab staff members</p>
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border mb-6 text-sm font-medium ${toast.type === "success"
                    ? "bg-teal-50 border-teal-200 text-teal-700"
                    : "bg-red-50 border-red-200 text-red-600"
                    }`}>
                    {toast.type === "success"
                        ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                    {toast.message}
                </div>
            )}

            {/* Form */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
                <h2 className="text-base font-bold text-slate-700 mb-5">Create Staff Account</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className={labelCls}>Full Name</label>
                            <input type="text" placeholder="Dr. Ravi Sharma" {...register("fullName")} className={inputCls} />
                            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelCls}>Email</label>
                            <input type="email" placeholder="staff@lab.com" {...register("email")} className={inputCls} />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelCls}>Phone</label>
                            <input type="tel" placeholder="9876543210" {...register("phone")} className={inputCls} />
                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelCls}>Password</label>
                            <input type="password" placeholder="Min. 8 characters" {...register("password")} className={inputCls} />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className={labelCls}>Role</label>
                        <select {...register("role")} className={inputCls} style={{ backgroundColor: "white" }}>
                            <option value="">Select a role</option>
                            <option value="technician">Lab Technician</option>
                            <option value="pathologist">Pathologist</option>
                            <option value="receptionist">Receptionist</option>
                        </select>
                        {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl py-3.5 transition-all shadow-lg shadow-teal-200 mt-2"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Staff Account"}
                    </button>
                </form>
            </div>
        </main>
    );
}
