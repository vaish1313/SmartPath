"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createPatient } from "@/lib/api";
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import axios from "axios";

const schema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email"),
    phone: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit phone number"),
    gender: z.enum(["male", "female", "other"]).optional(),
    dateOfBirth: z.string().optional(),
    bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    pincode: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function NewPatientPage() {
    const router = useRouter();
    const [toast, setToast] = useState("");
    const [apiError, setApiError] = useState("");

    const { register, handleSubmit, formState: { errors, isSubmitting } } =
        useForm<FormData>({ resolver: zodResolver(schema) });

    const onSubmit = async (data: FormData) => {
        setApiError("");
        try {
            await createPatient({
                fullName: data.fullName,
                email: data.email,
                phone: data.phone,
                gender: data.gender,
                dateOfBirth: data.dateOfBirth,
                bloodGroup: data.bloodGroup,
                address: { street: data.street, city: data.city, pincode: data.pincode },
            });
            setToast(`Patient ${data.fullName} created successfully`);
            setTimeout(() => router.push("/admin/patients"), 1500);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 409) setApiError("Email or phone already registered");
                else setApiError(err.response?.data?.message || "Failed to create patient");
            } else {
                setApiError("Something went wrong. Please try again.");
            }
        }
    };

    const inputCls = "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm placeholder:text-slate-300 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all shadow-sm";
    const labelCls = "text-xs font-semibold text-slate-500 tracking-wide uppercase";

    return (
        <main className="p-6 max-w-2xl">
            <div className="flex items-center gap-3 mb-8">
                <Link href="/admin/patients" className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 shadow-sm transition-all">
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">New Patient</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Register a new patient record</p>
                </div>
            </div>

            {toast && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 text-sm font-medium mb-6">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" /> {toast}
                </div>
            )}
            {apiError && (
                <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{apiError}</div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Personal info */}
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
                    <h2 className="text-sm font-bold text-slate-700">Personal Information</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className={labelCls}>Full Name *</label>
                            <input type="text" placeholder="Priya Sharma" {...register("fullName")} className={inputCls} />
                            {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelCls}>Email *</label>
                            <input type="email" placeholder="patient@example.com" {...register("email")} className={inputCls} />
                            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelCls}>Phone *</label>
                            <input type="tel" placeholder="9876543210" {...register("phone")} className={inputCls} />
                            {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelCls}>Date of Birth</label>
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
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelCls}>Blood Group</label>
                            <select {...register("bloodGroup")} className={inputCls} style={{ backgroundColor: "white" }}>
                                <option value="">Select</option>
                                {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Address */}
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
                    <h2 className="text-sm font-bold text-slate-700">Address</h2>
                    <div className="space-y-1.5">
                        <label className={labelCls}>Street / Area</label>
                        <input type="text" placeholder="Flat 4B, Sai Nagar" {...register("street")} className={inputCls} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className={labelCls}>City</label>
                            <input type="text" placeholder="Nashik" {...register("city")} className={inputCls} />
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelCls}>Pincode</label>
                            <input type="text" placeholder="422001" {...register("pincode")} className={inputCls} />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Link href="/admin/patients" className="flex-1 flex items-center justify-center bg-white border border-slate-200 rounded-xl py-3.5 text-slate-500 hover:text-slate-700 text-sm transition-all shadow-sm">
                        Cancel
                    </Link>
                    <button type="submit" disabled={isSubmitting}
                        className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl py-3.5 transition-all shadow-lg shadow-teal-200">
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Patient"}
                    </button>
                </div>
            </form>
        </main>
    );
}
