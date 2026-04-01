"use client";

import { useEffect, useState, useCallback } from "react";
import PageHeader from "@/components/shared/PageHeader";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { getAllTests, createTest, getTestById, updateTest, deleteTest } from "@/lib/api";
import { Plus, FlaskRound, Search, Pencil, Trash2, Loader2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

interface Test {
    _id: string;
    testCode: string;
    testName: string;
    category: string;
    sampleType: string;
    price: number;
    discountedPrice?: number;
    turnaroundTime: number;
    isActive: boolean;
}

function useDebounce<T>(value: T, delay = 400): T {
    const [d, setD] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setD(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return d;
}

export default function AdminTestsPage() {
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    const [modal, setModal] = useState<"add" | "edit" | null>(null);
    const [editId, setEditId] = useState<string | null>(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [apiError, setApiError] = useState("");

    const debouncedSearch = useDebounce(search);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
        useForm<FormData>({ resolver: zodResolver(schema) });

    const fetchTests = useCallback(() => {
        setLoading(true);
        getAllTests({ page, limit: 15, search: debouncedSearch })
            .then((res) => {
                setTests(res.data.tests || []);
                setTotal(res.data.total || 0);
                setTotalPages(res.data.totalPages || 1);
            })
            .catch((err) => { if (!axios.isAxiosError(err) || err.response?.status !== 401) setError("Failed to load tests"); })
            .finally(() => setLoading(false));
    }, [page, debouncedSearch]);

    useEffect(() => { fetchTests(); }, [fetchTests]);
    useEffect(() => { setPage(1); }, [debouncedSearch]);

    const openAdd = () => { reset({}); setApiError(""); setModal("add"); };

    const openEdit = (id: string) => {
        setEditId(id); setApiError(""); setModalLoading(true); setModal("edit");
        getTestById(id)
            .then((res) => {
                const t = res.data.test;
                reset({
                    testName: t.testName, category: t.category, sampleType: t.sampleType,
                    price: t.price, discountedPrice: t.discountedPrice, turnaroundTime: t.turnaroundTime,
                    description: t.description || "",
                    normalRangeMale: t.normalRange?.male || "",
                    normalRangeFemale: t.normalRange?.female || "",
                    normalRangeUnit: t.normalRange?.unit || "",
                });
            })
            .catch(() => setApiError("Failed to load test"))
            .finally(() => setModalLoading(false));
    };

    const closeModal = () => { setModal(null); setEditId(null); reset({}); setApiError(""); };

    const onSubmit = async (data: FormData) => {
        setApiError("");
        try {
            if (modal === "add") {
                const res = await createTest({
                    testName: data.testName, category: data.category, sampleType: data.sampleType,
                    price: data.price, discountedPrice: data.discountedPrice, turnaroundTime: data.turnaroundTime,
                    description: data.description,
                    normalRange: { male: data.normalRangeMale, female: data.normalRangeFemale, unit: data.normalRangeUnit },
                });
                setTests((prev) => [res.data.test, ...prev]);
                setTotal((n) => n + 1);
            } else if (modal === "edit" && editId) {
                const res = await updateTest(editId, {
                    testName: data.testName, category: data.category, sampleType: data.sampleType,
                    price: data.price, discountedPrice: data.discountedPrice, turnaroundTime: data.turnaroundTime,
                    description: data.description,
                    normalRange: { male: data.normalRangeMale, female: data.normalRangeFemale, unit: data.normalRangeUnit },
                });
                setTests((prev) => prev.map((t) => t._id === editId ? res.data.test : t));
            }
            closeModal();
        } catch (err) {
            if (axios.isAxiosError(err)) setApiError(err.response?.data?.message || "Operation failed");
            else setApiError("Something went wrong.");
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await deleteTest(deleteId);
            setTests((prev) => prev.filter((t) => t._id !== deleteId));
            setTotal((n) => n - 1);
        } catch { setError("Failed to delete test"); }
        finally { setDeleting(false); setDeleteId(null); }
    };

    const inputCls = "w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm placeholder:text-slate-300 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all";
    const labelCls = "text-xs font-semibold text-slate-500 tracking-wide uppercase";

    return (
        <>
            <main className="p-6">
                <PageHeader
                    title="Tests Catalog"
                    subtitle={`${total} tests available`}
                    action={
                        <button onClick={openAdd}
                            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-md shadow-teal-200">
                            <Plus className="w-4 h-4" /> Add Test
                        </button>
                    }
                />

                {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100">
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input value={search} onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name or code..."
                                className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all" />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-teal-500 animate-spin" /></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        {["Code", "Test Name", "Category", "Sample", "Price", "TAT", "Status", "Actions"].map((h) => (
                                            <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {tests.length === 0 ? (
                                        <tr><td colSpan={8} className="px-5 py-16 text-center text-slate-400 text-sm">No tests found. <button onClick={openAdd} className="text-teal-600 font-semibold">Add your first test</button></td></tr>
                                    ) : tests.map((t) => (
                                        <tr key={t._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center">
                                                        <FlaskRound className="w-3.5 h-3.5 text-teal-500" strokeWidth={1.8} />
                                                    </div>
                                                    <span className="text-teal-600 font-bold font-mono text-xs">{t.testCode}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-700 font-semibold">{t.testName}</td>
                                            <td className="px-5 py-3.5 text-slate-500 capitalize">{t.category}</td>
                                            <td className="px-5 py-3.5 text-slate-500 capitalize">{t.sampleType}</td>
                                            <td className="px-5 py-3.5">
                                                <span className="text-teal-600 font-bold">₹{t.discountedPrice ?? t.price}</span>
                                                {t.discountedPrice && <span className="text-slate-400 line-through text-xs ml-1">₹{t.price}</span>}
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-500">{t.turnaroundTime}h</td>
                                            <td className="px-5 py-3.5">
                                                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${t.isActive ? "bg-teal-50 text-teal-700 border-teal-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                                                    {t.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => openEdit(t._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all" title="Edit"><Pencil className="w-4 h-4" /></button>
                                                    <button onClick={() => setDeleteId(t._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
                            <p className="text-slate-400 text-xs">{total} total tests</p>
                            <div className="flex gap-2">
                                <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:border-teal-300 transition-all">Prev</button>
                                <span className="px-3 py-1.5 text-xs text-slate-500">{page} / {totalPages}</span>
                                <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:border-teal-300 transition-all">Next</button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Add / Edit Modal */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
                                    <FlaskRound className="w-4 h-4 text-teal-600" strokeWidth={1.8} />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-slate-800">{modal === "add" ? "Add New Test" : "Edit Test"}</h2>
                                    <p className="text-slate-400 text-xs">{modal === "add" ? "Fill in the test details below" : "Update the test details"}</p>
                                </div>
                            </div>
                            <button onClick={closeModal} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {modalLoading ? (
                            <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-teal-500 animate-spin" /></div>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
                                {apiError && <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{apiError}</div>}

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

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="space-y-1.5">
                                        <label className={labelCls}>Price (₹) *</label>
                                        <input type="number" placeholder="299" {...register("price")} className={inputCls} />
                                        {errors.price && <p className="text-red-500 text-xs">{errors.price.message}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className={labelCls}>Discounted (₹)</label>
                                        <input type="number" placeholder="Optional" {...register("discountedPrice")} className={inputCls} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className={labelCls}>TAT (hrs) *</label>
                                        <input type="number" placeholder="24" {...register("turnaroundTime")} className={inputCls} />
                                        {errors.turnaroundTime && <p className="text-red-500 text-xs">{errors.turnaroundTime.message}</p>}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className={labelCls}>Description</label>
                                    <textarea rows={2} placeholder="Brief description..." {...register("description")} className={`${inputCls} resize-none`} />
                                </div>

                                <div className="grid grid-cols-3 gap-3">
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

                                <div className="flex gap-3 pt-1">
                                    <button type="button" onClick={closeModal} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm rounded-xl py-2.5 transition-all">Cancel</button>
                                    <button type="submit" disabled={isSubmitting}
                                        className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl py-2.5 transition-all shadow-lg shadow-teal-200">
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : modal === "add" ? "Add Test" : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={!!deleteId}
                title="Delete Test"
                description="This will deactivate the test. It will no longer appear in the catalog."
                confirmLabel="Delete"
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
            />
        </>
    );
}
