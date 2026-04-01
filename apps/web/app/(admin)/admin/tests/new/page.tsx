"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createTest } from "@/lib/api";
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import axios from "axios";

const CATEGORIES = ["hematology", "biochemistry", "microbiology", "immunology", "urology", "radiology", "other"];
const SAMPLE_TYPES = ["blood", "urine", "stool", "swab", "other"];

const schema = z.object({
    testName: z.string().min(2, "Test name is required"),
    category: z.enum(["hematology", "biochemistry", "microbiology", "immunology", "urology", "radiology", "other"], { required_error: "Select a category" }),
    sampleType: z.enum(["blood", "urine", "stool", "swab", "other"], { required_error: "Select sample type" }),
    price: z.coerce.number().min(1, "Price is required"),
    discountedPrice: z.coerce.number().optional(),
    turnaroundTime: z.coerce.number().min(1, "Turnaround time is required"),
    description: z.string().optional(),
    normalRangeMale: z.string().optional(),
    normalRangeFemale: z.string().optional(),
    normalRangeUnit: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewTestPage() {
    const router = useRouter();
    const [toast, setToast] = useState("");
    const [apiError, setApiError] = useState("");

    const { register, handleSubmit, formState: { errors, isSubmitting } } =
        useForm<FormData>({ resolver: zodResolver(schema) });

    const onSubmit = async (data: FormData) => {
        setApiError("");
        try {
            await createTest({
                testName: data.testName,
                category: data.category,
                sampleType: data.sampleType,
                price: data.price,
                discountedPrice: data.discountedPrice,
                turnaroundTime: data.turnaroundTime,
                description: data.description,
                normalRange: {
                    male: data.normalRangeMale,
                    female: data.normalRangeFemale,
                    unit: data.normalRangeUnit,
                },
            });
            setToast("Test created successfully!");
            setTimeout(() => router.push("/admin/tests"), 1200);
        } catch (err) {
            if (axios.isAxiosError(err)) setApiError(err.response?.data?.message || "Failed to create test");
            else setApiError("Something went wrong.");
        }
    };

    const inputCls = "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm placeholder:text-slate-300 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all shadow-sm";
    const labelCls = "text-xs font-semibold text-slate-500 tracking-wide uppercase";

    return (
        <main className="p-6 max-w-2xl">
            <div className="flex items-center gap-3 mb-8">
                <Link href="/admin/tests" className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 shadow-sm transition-all">
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">New Test</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Add a new diagnostic test to the catalog</p>
                </div>
            </div>

            {toast && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 text-sm font-medium mb-6">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" /> {toast}
                </div>
            )}
            {apiError && <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{apiError}</div>}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Basic info */}
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
                    <h2 className="text-sm font-bold text-slate-700">Test Information</h2>
                    <div className="space-y-1.5">
                        <label className={labelCls}>Test Name *</label>
                        <input type="text" placeholder="e.g. Complete Blood Count" {...register("testName")} className={inputCls} />
                        {errors.testName && <p className="text-red-500 text-xs">{errors.testName.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className={labelCls}>Category *</label>
                            <select {...register("category")} className={inputCls} style={{ backgroundColor: "white" }}>
                                <option value="">Select category</option>
                                {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                            </select>
                            {errors.category && <p className="text-red-500 text-xs">{errors.category.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelCls}>Sample Type *</label>
                            <select {...register("sampleType")} className={inputCls} style={{ backgroundColor: "white" }}>
                                <option value="">Select sample type</option>
                                {SAMPLE_TYPES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                            </select>
                            {errors.sampleType && <p className="text-red-500 text-xs">{errors.sampleType.message}</p>}
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className={labelCls}>Description</label>
                        <textarea rows={2} placeholder="Brief description..." {...register("description")} className={`${inputCls} resize-none`} />
                    </div>
                </div>

                {/* Pricing & TAT */}
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
                    <h2 className="text-sm font-bold text-slate-700">Pricing & Turnaround</h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className={labelCls}>Price (₹) *</label>
                            <input type="number" placeholder="299" {...register("price")} className={inputCls} />
                            {errors.price && <p className="text-red-500 text-xs">{errors.price.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelCls}>Discounted Price (₹)</label>
                            <input type="number" placeholder="Optional" {...register("discountedPrice")} className={inputCls} />
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelCls}>Turnaround (hrs) *</label>
                            <input type="number" placeholder="24" {...register("turnaroundTime")} className={inputCls} />
                            {errors.turnaroundTime && <p className="text-red-500 text-xs">{errors.turnaroundTime.message}</p>}
                        </div>
                    </div>
                </div>

                {/* Normal ranges */}
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
                    <h2 className="text-sm font-bold text-slate-700">Normal Ranges</h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className={labelCls}>Male Range</label>
                            <input type="text" placeholder="e.g. 13.5–17.5" {...register("normalRangeMale")} className={inputCls} />
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelCls}>Female Range</label>
                            <input type="text" placeholder="e.g. 12.0–15.5" {...register("normalRangeFemale")} className={inputCls} />
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelCls}>Unit</label>
                            <input type="text" placeholder="e.g. g/dL" {...register("normalRangeUnit")} className={inputCls} />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Link href="/admin/tests" className="flex-1 flex items-center justify-center bg-white border border-slate-200 rounded-xl py-3.5 text-slate-500 hover:text-slate-700 text-sm transition-all shadow-sm">Cancel</Link>
                    <button type="submit" disabled={isSubmitting}
                        className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl py-3.5 transition-all shadow-lg shadow-teal-200">
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Test"}
                    </button>
                </div>
            </form>
        </main>
    );
}
