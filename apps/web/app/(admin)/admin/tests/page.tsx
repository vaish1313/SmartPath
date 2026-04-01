"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import PageHeader from "@/components/shared/PageHeader";
import { getAllTests, createTest } from "@/lib/api";
import { Plus, FlaskRound, X, Loader2 } from "lucide-react";
import axios from "axios";

const CATEGORIES = ["hematology", "biochemistry", "microbiology", "immunology", "urology", "radiology", "other"];
const SAMPLE_TYPES = ["blood", "urine", "stool", "swab", "other"];

const schema = z.object({
    name: z.string().min(2, "Test name is required"),
    code: z.string().min(1, "Test code is required"),
    category: z.enum(["hematology", "biochemistry", "microbiology", "immunology", "urology", "radiology", "other"], { required_error: "Select a category" }),
    sampleType: z.enum(["blood", "urine", "stool", "swab", "other"], { required_error: "Select sample type" }),
    price: z.coerce.number().min(1, "Price is required"),
    discountedPrice: z.coerce.number().optional(),
    turnaroundTime: z.string().min(1, "Turnaround time is required"),
    description: z.string().optional(),
    preparationInstructions: z.string().optional(),
    isHomeCollectionAvailable: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

interface Test {
    _id: string;
    code: string;
    name: string;
    category: string;
    price: number;
    discountedPrice?: number;
    turnaroundTime: string;
    isActive: boolean;
}

export default function AdminTestsPage() {
    const [showModal, setShowModal] = useState(false);
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState("");

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
        useForm<FormData>({ resolver: zodResolver(schema) });

    useEffect(() => {
        getAllTests()
            .then((res) => setTests(res.data.tests || []))
            .catch((err) => {
                if (!axios.isAxiosError(err) || err.response?.status !== 401)
                    setApiError("Failed to load tests");
            })
            .finally(() => setLoading(false));
    }, []);

    const onSubmit = async (data: FormData) => {
        setApiError("");
        try {
            const res = await createTest({
                name: data.name,
                code: data.code.toUpperCase(),
                category: data.category,
                sampleType: data.sampleType,
                price: data.price,
                discountedPrice: data.discountedPrice,
                turnaroundTime: data.turnaroundTime,
                description: data.description,
                preparationInstructions: data.preparationInstructions,
                isHomeCollectionAvailable: data.isHomeCollectionAvailable,
            });
            setTests((prev) => [...prev, res.data.test]);
            reset();
            setShowModal(false);
        } catch (err) {
            if (axios.isAxiosError(err))
                setApiError(err.response?.data?.message || "Failed to create test");
            else setApiError("Something went wrong.");
        }
    };

    const inputCls = "w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm placeholder:text-slate-300 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all";
    const labelCls = "text-xs font-semibold text-slate-500 tracking-wide uppercase";

    return (
        <>
            <main className="p-6">
                <PageHeader
                    title="Tests Catalog"
                    subtitle={`${tests.length} tests available`}
                    action={
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-md shadow-teal-200"
                        >
                            <Plus className="w-4 h-4" /> Add Test
                        </button>
                    }
                />

                {apiError && !showModal && (
                    <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{apiError}</div>
                )}

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        {["Code", "Test Name", "Category", "Price", "Turnaround", "Status"].map((h) => (
                                            <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {tests.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-5 py-16 text-center text-slate-400 text-sm">No tests found. Add your first test.</td>
                                        </tr>
                                    ) : tests.map((t) => (
                                        <tr key={t._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center">
                                                        <FlaskRound className="w-3.5 h-3.5 text-teal-500" strokeWidth={1.8} />
                                                    </div>
                                                    <span className="text-teal-600 font-bold">{t.code}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-700 font-semibold">{t.name}</td>
                                            <td className="px-5 py-3.5 text-slate-500 capitalize">{t.category}</td>
                                            <td className="px-5 py-3.5 text-teal-600 font-bold">
                                                {t.discountedPrice ? (
                                                    <span>₹{t.discountedPrice} <span className="text-slate-400 line-through text-xs">₹{t.price}</span></span>
                                                ) : `₹${t.price}`}
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-500">{t.turnaroundTime}</td>
                                            <td className="px-5 py-3.5">
                                                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${t.isActive ? "bg-teal-50 text-teal-700 border-teal-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                                                    {t.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Add Test Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
                                    <FlaskRound className="w-4 h-4 text-teal-600" strokeWidth={1.8} />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-slate-800">Add New Test</h2>
                                    <p className="text-slate-400 text-xs">Fill in the test details below</p>
                                </div>
                            </div>
                            <button onClick={() => { setShowModal(false); reset(); setApiError(""); }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
                            {apiError && (
                                <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{apiError}</div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Test Name *</label>
                                    <input type="text" placeholder="e.g. Complete Blood Count" {...register("name")} className={inputCls} />
                                    {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Test Code *</label>
                                    <input type="text" placeholder="e.g. CBC" {...register("code")} className={`${inputCls} uppercase`} />
                                    {errors.code && <p className="text-red-500 text-xs">{errors.code.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Category *</label>
                                    <select {...register("category")} className={inputCls} style={{ backgroundColor: "white" }}>
                                        <option value="">Select category</option>
                                        {CATEGORIES.map((c) => (
                                            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                                        ))}
                                    </select>
                                    {errors.category && <p className="text-red-500 text-xs">{errors.category.message}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Sample Type *</label>
                                    <select {...register("sampleType")} className={inputCls} style={{ backgroundColor: "white" }}>
                                        <option value="">Select sample type</option>
                                        {SAMPLE_TYPES.map((s) => (
                                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                        ))}
                                    </select>
                                    {errors.sampleType && <p className="text-red-500 text-xs">{errors.sampleType.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Price (₹) *</label>
                                    <input type="number" placeholder="299" {...register("price")} className={inputCls} />
                                    {errors.price && <p className="text-red-500 text-xs">{errors.price.message}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Discounted Price (₹)</label>
                                    <input type="number" placeholder="Optional" {...register("discountedPrice")} className={inputCls} />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className={labelCls}>Turnaround Time *</label>
                                <input type="text" placeholder="e.g. 24 hrs" {...register("turnaroundTime")} className={inputCls} />
                                {errors.turnaroundTime && <p className="text-red-500 text-xs">{errors.turnaroundTime.message}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className={labelCls}>Description</label>
                                <textarea rows={2} placeholder="Brief description of the test..." {...register("description")} className={`${inputCls} resize-none`} />
                            </div>

                            <div className="space-y-1.5">
                                <label className={labelCls}>Preparation Instructions</label>
                                <textarea rows={2} placeholder="e.g. 8-10 hrs fasting required..." {...register("preparationInstructions")} className={`${inputCls} resize-none`} />
                            </div>

                            <div className="flex items-center gap-3">
                                <input type="checkbox" id="homeCollection" {...register("isHomeCollectionAvailable")} className="w-4 h-4 accent-teal-600 rounded" />
                                <label htmlFor="homeCollection" className="text-sm text-slate-600 font-medium">Home collection available</label>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => { setShowModal(false); reset(); setApiError(""); }}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm rounded-xl py-2.5 transition-all">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting}
                                    className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl py-2.5 transition-all shadow-lg shadow-teal-200">
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Test"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
