"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getAllTests, createPackage } from "@/lib/api";
import { ArrowLeft, Loader2, CheckCircle, Search, X, Plus } from "lucide-react";
import axios from "axios";

const schema = z.object({
    packageName: z.string().min(2, "Package name is required"),
    description: z.string().optional(),
    discountedPrice: z.coerce.number().min(1, "Discounted price is required"),
});

type FormData = z.infer<typeof schema>;

interface Test { _id: string; testName: string; testCode: string; price: number; category: string; }

export default function NewPackagePage() {
    const router = useRouter();
    const [allTests, setAllTests] = useState<Test[]>([]);
    const [selectedTests, setSelectedTests] = useState<Test[]>([]);
    const [testSearch, setTestSearch] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [toast, setToast] = useState("");
    const [apiError, setApiError] = useState("");

    const { register, handleSubmit, formState: { errors, isSubmitting } } =
        useForm<FormData>({ resolver: zodResolver(schema) });

    useEffect(() => {
        getAllTests({ limit: 200 })
            .then((res) => setAllTests(res.data.tests || res.data.data || []))
            .catch(console.error);
    }, []);

    const originalPrice = selectedTests.reduce((s, t) => s + t.price, 0);

    const filteredTests = allTests.filter((t) =>
        t &&
        !selectedTests.some((s) => s._id === t._id) &&
        (t?.testName?.toLowerCase().includes(testSearch.toLowerCase()) || t?.testCode?.toLowerCase().includes(testSearch.toLowerCase()))
    );

    const addTest = (t: Test) => { setSelectedTests((prev) => [...prev, t]); setTestSearch(""); setShowDropdown(false); };
    const removeTest = (id: string) => setSelectedTests((prev) => prev.filter((t) => t._id !== id));

    const onSubmit = async (data: FormData) => {
        if (selectedTests.length === 0) { setApiError("Select at least one test"); return; }
        setApiError("");
        try {
            await createPackage({
                packageName: data.packageName,
                description: data.description,
                tests: selectedTests.map((t) => t._id),
                discountedPrice: data.discountedPrice,
            });
            setToast("Package created successfully!");
            setTimeout(() => router.push("/admin/packages"), 1200);
        } catch (err) {
            if (axios.isAxiosError(err)) setApiError(err.response?.data?.message || "Failed to create package");
            else setApiError("Something went wrong.");
        }
    };

    const inputCls = "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm placeholder:text-slate-300 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all shadow-sm";
    const labelCls = "text-xs font-semibold text-slate-500 tracking-wide uppercase";

    return (
        <main className="p-6 max-w-2xl">
            <div className="flex items-center gap-3 mb-8">
                <Link href="/admin/packages" className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 shadow-sm transition-all">
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">New Package</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Bundle tests into a discounted package</p>
                </div>
            </div>

            {toast && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 text-sm font-medium mb-6">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" /> {toast}
                </div>
            )}
            {apiError && <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{apiError}</div>}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Package info */}
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
                    <h2 className="text-sm font-bold text-slate-700">Package Details</h2>
                    <div className="space-y-1.5">
                        <label className={labelCls}>Package Name *</label>
                        <input type="text" placeholder="e.g. Full Body Checkup" {...register("packageName")} className={inputCls} />
                        {errors.packageName && <p className="text-red-500 text-xs">{errors.packageName.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <label className={labelCls}>Description</label>
                        <textarea rows={2} placeholder="Brief description of the package..." {...register("description")} className={`${inputCls} resize-none`} />
                    </div>
                </div>

                {/* Test selection */}
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
                    <h2 className="text-sm font-bold text-slate-700">Select Tests *</h2>

                    {/* Search dropdown */}
                    <div className="relative">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                value={testSearch}
                                onChange={(e) => { setTestSearch(e.target.value); setShowDropdown(true); }}
                                onFocus={() => setShowDropdown(true)}
                                placeholder="Search and add tests..."
                                className={`${inputCls} pl-9`}
                            />
                        </div>
                        {showDropdown && testSearch && filteredTests.length > 0 && (
                            <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                                {filteredTests.slice(0, 10).map((t) => (
                                    <button key={t._id} type="button" onClick={() => addTest(t)}
                                        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-teal-50 transition-colors text-left">
                                        <div>
                                            <p className="text-slate-700 text-sm font-medium">{t.testName}</p>
                                            <p className="text-slate-400 text-xs">{t.testCode} · {t.category}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-teal-600 font-bold text-sm">₹{t.price}</span>
                                            <Plus className="w-4 h-4 text-teal-500" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Selected tests */}
                    {selectedTests.length > 0 ? (
                        <div className="space-y-2">
                            {selectedTests.map((t) => (
                                <div key={t._id} className="flex items-center justify-between bg-teal-50 border border-teal-200 rounded-xl px-4 py-2.5">
                                    <div>
                                        <p className="text-slate-700 text-sm font-semibold">{t.testName}</p>
                                        <p className="text-slate-400 text-xs">{t.testCode}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-teal-600 font-bold text-sm">₹{t.price}</span>
                                        <button type="button" onClick={() => removeTest(t._id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-400 text-sm text-center py-4 bg-slate-50 rounded-xl">No tests selected yet</p>
                    )}
                </div>

                {/* Pricing */}
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
                    <h2 className="text-sm font-bold text-slate-700">Pricing</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className={labelCls}>Original Price (auto)</label>
                            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-500 text-sm">
                                ₹{originalPrice} <span className="text-xs text-slate-400">(sum of selected tests)</span>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelCls}>Package Price (₹) *</label>
                            <input type="number" placeholder="e.g. 999" {...register("discountedPrice")} className={inputCls} />
                            {errors.discountedPrice && <p className="text-red-500 text-xs">{errors.discountedPrice.message}</p>}
                        </div>
                    </div>
                    {originalPrice > 0 && (
                        <p className="text-xs text-slate-400">
                            Savings: ₹{originalPrice - (Number((document.querySelector('[name="discountedPrice"]') as HTMLInputElement)?.value) || 0)} off original price
                        </p>
                    )}
                </div>

                <div className="flex gap-3">
                    <Link href="/admin/packages" className="flex-1 flex items-center justify-center bg-white border border-slate-200 rounded-xl py-3.5 text-slate-500 hover:text-slate-700 text-sm transition-all shadow-sm">Cancel</Link>
                    <button type="submit" disabled={isSubmitting}
                        className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl py-3.5 transition-all shadow-lg shadow-teal-200">
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Package"}
                    </button>
                </div>
            </form>
        </main>
    );
}
