"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { registerUser } from "@/lib/api";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { UserCog, Loader2, CheckCircle, AlertCircle, Plus, X } from "lucide-react";
import axios from "axios";

const schema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email"),
    phone: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit phone number"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["technician", "receptionist", "pathologist"], { required_error: "Select a role" }),
});

type FormData = z.infer<typeof schema>;

const ROLE_LABELS: Record<string, string> = {
    technician: "Lab Technician",
    pathologist: "Pathologist",
    receptionist: "Receptionist",
};

interface StaffEntry { fullName: string; email: string; role: string; createdAt: string; }

export default function StaffManagementPage() {
    const { isAuthenticated, isLoading, role } = useAuth();
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [staffList, setStaffList] = useState<StaffEntry[]>([]);
    const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

    useEffect(() => {
        if (isLoading) return;
        if (!isAuthenticated) { router.replace("/login"); return; }
        if (role !== "admin") router.replace("/unauthorized");
    }, [isAuthenticated, isLoading, role, router]);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
        useForm<FormData>({ resolver: zodResolver(schema) });

    const showToast = (type: "success" | "error", message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    const onSubmit = async (data: FormData) => {
        try {
            await registerUser({ fullName: data.fullName, email: data.email, phone: data.phone, password: data.password, role: data.role });
            setStaffList((prev) => [{ fullName: data.fullName, email: data.email, role: data.role, createdAt: new Date().toISOString() }, ...prev]);
            showToast("success", `Account created for ${data.fullName} (${ROLE_LABELS[data.role]})`);
            reset();
            setShowModal(false);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 409) showToast("error", "Email or phone already registered");
                else showToast("error", err.response?.data?.message || "Failed to create account");
            } else {
                showToast("error", "Something went wrong. Please try again.");
            }
        }
    };

    if (isLoading) return <LoadingSpinner fullScreen />;
    if (!isAuthenticated || role !== "admin") return null;

    const inputCls = "w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm placeholder:text-slate-300 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all";
    const labelCls = "text-xs font-semibold text-slate-500 tracking-wide uppercase";

    return (
        <>
            <main className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                            <UserCog className="w-5 h-5 text-teal-600" strokeWidth={1.8} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Staff Management</h1>
                            <p className="text-slate-500 text-sm mt-0.5">Manage lab staff accounts</p>
                        </div>
                    </div>
                    <button onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-md shadow-teal-200">
                        <Plus className="w-4 h-4" /> Add Staff
                    </button>
                </div>

                {/* Toast */}
                {toast && (
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border mb-6 text-sm font-medium ${toast.type === "success" ? "bg-teal-50 border-teal-200 text-teal-700" : "bg-red-50 border-red-200 text-red-600"}`}>
                        {toast.type === "success" ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                        {toast.message}
                    </div>
                )}

                {/* Staff list */}
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                    {staffList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mb-3">
                                <UserCog className="w-6 h-6 text-teal-400" strokeWidth={1.5} />
                            </div>
                            <p className="text-slate-500 text-sm mb-1">No staff accounts created yet</p>
                            <button onClick={() => setShowModal(true)} className="text-teal-600 text-sm font-semibold hover:underline">Create your first staff account</button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        {["Name", "Email", "Role", "Created"].map((h) => (
                                            <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {staffList.map((s, i) => (
                                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">{s.fullName[0]}</div>
                                                    <span className="text-slate-700 font-semibold">{s.fullName}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-500">{s.email}</td>
                                            <td className="px-5 py-3.5">
                                                <span className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">{ROLE_LABELS[s.role] || s.role}</span>
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-400 text-xs">{new Date(s.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Add Staff Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
                                    <UserCog className="w-4 h-4 text-teal-600" strokeWidth={1.8} />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-slate-800">Create Staff Account</h2>
                                    <p className="text-slate-400 text-xs">Add a new lab staff member</p>
                                </div>
                            </div>
                            <button onClick={() => { setShowModal(false); reset(); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Full Name</label>
                                    <input type="text" placeholder="Dr. Ravi Sharma" {...register("fullName")} className={inputCls} />
                                    {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName.message}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Email</label>
                                    <input type="email" placeholder="staff@lab.com" {...register("email")} className={inputCls} />
                                    {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Phone</label>
                                    <input type="tel" placeholder="9876543210" {...register("phone")} className={inputCls} />
                                    {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Password</label>
                                    <input type="password" placeholder="Min. 8 characters" {...register("password")} className={inputCls} />
                                    {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
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
                                {errors.role && <p className="text-red-500 text-xs">{errors.role.message}</p>}
                            </div>

                            <div className="flex gap-3 pt-1">
                                <button type="button" onClick={() => { setShowModal(false); reset(); }} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm rounded-xl py-2.5 transition-all">Cancel</button>
                                <button type="submit" disabled={isSubmitting}
                                    className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl py-2.5 transition-all shadow-lg shadow-teal-200">
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
