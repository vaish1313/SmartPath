"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getTestById, updateTest } from "@/lib/api";
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import axios from "axios";

const CATEGORIES = ["hematology", "biochemistry", "microbiology", "immunology", "urology", "radiology", "other"];
const SAMPLE_TYPES = ["blood", "urine", "stool", "swab", "other"];

const schema = z.object({
    testName: z.string().min(2, "Test name is required"),
    category: z.enum(["hematology", "biochemistry", "microbiology", "immunology", "urology", "radiology", "other"]),
    sampleType: z.enum(["blood", "urine", "stool", "swab", "other"]),
    price: z.coerce.number().min(1, "Price is required"),
    discountedPrice: z.coerce.number().optional(),
    turnaroundTime: z.coerce.number().min(1, "Turnaround time is required"),
    description: z.string().optional(),
    normalRangeMale: z.string().optional(),
    normalRangeFemale: z.string().optional(),
    normalRangeUnit: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function EditTestPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState("");
    const [apiError, setApiError] = useState("");

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
        useForm<FormData>({ resolver: zodResolver(schema) });

    useEffect(() => {
        if (!id) return;
        getTestById(id)
            .then((res) => {
                const t = res.data.test;
                reset({
                    testName: t.testName,
                    category: t.category,
                    sampleType: t.sampleType,
                    price: t.price,
                    discountedPrice: t.discountedPrice,
                    turnaroundTime: t.turnaroundTime,
                    description: t.description || "",
                    normalRangeMale: t.normalRange?.male || "",
                    normalRangeFemale: t.normalRange?.female || "",
                    normalRangeUnit: t.normalRange?.unit || "",
                });
            })
            .catch(() => setApiError("Failed to load test"))
            .finally(() => setLoading(false));
    }, [id, reset]);

    const onSubmit = async (data: FormData) => {
        setApiError("");
        try {
            await updateTest(id, {
                testName: data.testName,
                category: data.category,
                sampleType: data.sampleType,
                price: data.price,
                discountedPrice: data.discountedPrice,
                turnaroundTime: data.turnaroundTime,
                description: data.description,
                normalRange: { male: data.normalRangeMale, female: data.normalRangeFemale, unit: data.normalRangeUnit },
            });
            setToast("Test updated successfully!");
            setTimeout(() => router.push("/admin/tests"), 1200);
        } catch (err) {
            if (axios.isAxiosError(err)) setApiError(err.response?.data?.message || "Update failed");
            else setApiError("Something went wrong.");
        }
    };

    const inputCls = "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm placeholder:text-slate-300 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all shadow-sm";
    const labelCls = "text-xs font-semibold text-slate-500 tracking-wide uppercase";

    if (loading) return <div className="flex-1 flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-teal-500 animate-spin" /></div>;

    return (
        <main className="p-6 max-w-2xl">
            <div className="flex items-center gap-3 mb-8">
                <Link href="/admin/tests" className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 shadow-sm transition-all">
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Edit Test</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Update test details</p>
                </div>
            </div>

            {toast && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 text-sm font-medium mb-6">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" /> {toast}
                </div>
            )}
            {apiError && <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{apiError}</div>}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
                    <h2 className="text-sm font-bold text-slate-700">Test Information</h2>
                    <div className="space-y-1.5">
                        <label className={labelCls}>Test Name *</label>
                        <input type="text" {...register("testName")} className={inputCls} />
                        {errors.testName && <p className="text-red-500 text-xs">{errors.testName.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className={labelCls}>Category *</label>
                            <select {...register("category")} className={inputCls} style={{ backgroundColor: "white" }}>
                                {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelCls}>Sample Type *</label>
                            <select {...register("sampleType")} className={inputCls} style={{ backgroundColor: "white" }}>
                                {SAMPLE_TYPES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className={labelCls}>Description</label>
                        <textarea rows={2} {...register("description")} className={`${inputCls} resize-none`} />
                    </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
                    <h2 className="text-sm font-bold text-slate-700">Pricing & Turnaround</h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className={labelCls}>Price (₹) *</label>
                            <input type="number" {...register("price")} className={inputCls} />
                            {errors.price && <p className="text-red-500 text-xs">{errors.price.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelCls}>Discounted Price (₹)</label>
                            <input type="number" {...register("discountedPrice")} className={inputCls} />
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelCls}>Turnaround (hrs) *</label>
                            <input type="number" {...register("turnaroundTime")} className={inputCls} />
                            {errors.turnaroundTime && <p className="text-red-500 text-xs">{errors.turnaroundTime.message}</p>}
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
                    <h2 className="text-sm font-bold text-slate-700">Normal Ranges</h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className={labelCls}>Male Range</label>
                            <input type="text" {...register("normalRangeMale")} className={inputCls} />
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelCls}>Female Range</label>
                            <input type="text" {...register("normalRangeFemale")} className={inputCls} />
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelCls}>Unit</label>
                            <input type="text" {...register("normalRangeUnit")} className={inputCls} />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Link href="/admin/tests" className="flex-1 flex items-center justify-center bg-white border border-slate-200 rounded-xl py-3.5 text-slate-500 hover:text-slate-700 text-sm transition-all shadow-sm">Cancel</Link>
                    <button type="submit" disabled={isSubmitting}
                        className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl py-3.5 transition-all shadow-lg shadow-teal-200">
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                    </button>
                </div>
            </form>
        </main>
    );
}
