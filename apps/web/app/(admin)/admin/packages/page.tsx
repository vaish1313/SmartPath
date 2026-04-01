"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { getAllPackages, getAllTests, createPackage, updatePackage, deletePackage, getPackageById } from "@/lib/api";
import { Plus, Package, Pencil, Trash2, Loader2, X, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";

const schema = z.object({
    packageName: z.string().min(2, "Package name is required"),
    description: z.string().optional(),
    discountedPrice: z.coerce.number().min(1, "Package price is required"),
});

type FormData = z.infer<typeof schema>;

interface Test { _id: string; testName: string; testCode: string; price: number; category: string; }

interface Pkg {
    _id: string;
    packageCode: string;
    packageName: string;
    description?: string;
    tests: { _id: string; testName: string; price: number }[];
    originalPrice: number;
    discountedPrice?: number;
    isActive: boolean;
}

export default function AdminPackagesPage() {
    const [packages, setPackages] = useState<Pkg[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    // Modal state
    const [modal, setModal] = useState<"add" | "edit" | null>(null);
    const [editId, setEditId] = useState<string | null>(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [apiError, setApiError] = useState("");

    // Test selection
    const [allTests, setAllTests] = useState<Test[]>([]);
    const [selectedTests, setSelectedTests] = useState<Test[]>([]);
    const [testSearch, setTestSearch] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
        useForm<FormData>({ resolver: zodResolver(schema) });

    useEffect(() => {
        getAllPackages()
            .then((res) => setPackages(res.data.packages || []))
            .catch((err) => { if (!axios.isAxiosError(err) || err.response?.status !== 401) setError("Failed to load packages"); })
            .finally(() => setLoading(false));

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

    const openAdd = () => { reset({}); setSelectedTests([]); setApiError(""); setModal("add"); };

    const openEdit = (id: string) => {
        setEditId(id);
        setApiError("");
        setModalLoading(true);
        setModal("edit");
        getPackageById(id)
            .then((res) => {
                const p = res.data.package;
                reset({ packageName: p.packageName, description: p.description || "", discountedPrice: p.discountedPrice });
                setSelectedTests(p.tests || []);
            })
            .catch(() => setApiError("Failed to load package"))
            .finally(() => setModalLoading(false));
    };

    const closeModal = () => { setModal(null); setEditId(null); reset({}); setSelectedTests([]); setApiError(""); setTestSearch(""); };

    const onSubmit = async (data: FormData) => {
        if (selectedTests.length === 0) { setApiError("Select at least one test"); return; }
        setApiError("");
        try {
            if (modal === "add") {
                const res = await createPackage({
                    packageName: data.packageName,
                    description: data.description,
                    tests: selectedTests.map((t) => t._id),
                    discountedPrice: data.discountedPrice,
                });
                setPackages((prev) => [res.data.package, ...prev]);
            } else if (modal === "edit" && editId) {
                const res = await updatePackage(editId, {
                    packageName: data.packageName,
                    description: data.description,
                    tests: selectedTests.map((t) => t._id),
                    discountedPrice: data.discountedPrice,
                });
                setPackages((prev) => prev.map((p) => p._id === editId ? res.data.package : p));
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
            await deletePackage(deleteId);
            setPackages((prev) => prev.filter((p) => p._id !== deleteId));
        } catch { setError("Failed to delete package"); }
        finally { setDeleting(false); setDeleteId(null); }
    };

    const savings = (pkg: Pkg) => pkg.discountedPrice ? Math.round(((pkg.originalPrice - pkg.discountedPrice) / pkg.originalPrice) * 100) : 0;

    const inputCls = "w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm placeholder:text-slate-300 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all";
    const labelCls = "text-xs font-semibold text-slate-500 tracking-wide uppercase";

    return (
        <>
            <main className="p-6">
                <PageHeader
                    title="Test Packages"
                    subtitle={`${packages.length} packages available`}
                    action={
                        <button onClick={openAdd}
                            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-md shadow-teal-200">
                            <Plus className="w-4 h-4" /> Add Package
                        </button>
                    }
                />

                {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-teal-500 animate-spin" /></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        {["Code", "Package Name", "Tests", "Original Price", "Discounted Price", "Savings", "Status", "Actions"].map((h) => (
                                            <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {packages.length === 0 ? (
                                        <tr><td colSpan={8} className="px-5 py-16 text-center text-slate-400 text-sm">No packages yet. <button onClick={openAdd} className="text-teal-600 font-semibold">Create your first package</button></td></tr>
                                    ) : packages.map((p) => (
                                        <tr key={p._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                                                        <Package className="w-3.5 h-3.5 text-violet-500" strokeWidth={1.8} />
                                                    </div>
                                                    <span className="text-violet-600 font-bold font-mono text-xs">{p.packageCode}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <p className="text-slate-700 font-semibold">{p.packageName}</p>
                                                {p.description && <p className="text-slate-400 text-xs mt-0.5">{p.description.slice(0, 40)}</p>}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">{p.tests.length} tests</span>
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-500 line-through">₹{p.originalPrice}</td>
                                            <td className="px-5 py-3.5 text-teal-600 font-bold">₹{p.discountedPrice ?? p.originalPrice}</td>
                                            <td className="px-5 py-3.5">
                                                {savings(p) > 0 && (
                                                    <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">{savings(p)}% off</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${p.isActive ? "bg-teal-50 text-teal-700 border-teal-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                                                    {p.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => openEdit(p._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all" title="Edit"><Pencil className="w-4 h-4" /></button>
                                                    <button onClick={() => setDeleteId(p._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Add / Edit Modal */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
                                    <Package className="w-4 h-4 text-violet-600" strokeWidth={1.8} />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-slate-800">{modal === "add" ? "Add New Package" : "Edit Package"}</h2>
                                    <p className="text-slate-400 text-xs">{modal === "add" ? "Bundle tests into a discounted package" : "Update package details"}</p>
                                </div>
                            </div>
                            <button onClick={closeModal} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Body */}
                        {modalLoading ? (
                            <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-teal-500 animate-spin" /></div>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
                                {apiError && <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{apiError}</div>}

                                <div className="space-y-1.5">
                                    <label className={labelCls}>Package Name *</label>
                                    <input type="text" placeholder="e.g. Full Body Checkup" {...register("packageName")} className={inputCls} />
                                    {errors.packageName && <p className="text-red-500 text-xs">{errors.packageName.message}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className={labelCls}>Description</label>
                                    <textarea rows={2} placeholder="Brief description..." {...register("description")} className={`${inputCls} resize-none`} />
                                </div>

                                {/* Test search */}
                                <div className="space-y-2">
                                    <label className={labelCls}>Select Tests *</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            value={testSearch}
                                            onChange={(e) => { setTestSearch(e.target.value); setShowDropdown(true); }}
                                            onFocus={() => setShowDropdown(true)}
                                            placeholder="Search and add tests..."
                                            className={`${inputCls} pl-9`}
                                        />
                                        {showDropdown && testSearch && filteredTests.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-44 overflow-y-auto">
                                                {filteredTests.slice(0, 8).map((t) => (
                                                    <button key={t._id} type="button" onClick={() => addTest(t)}
                                                        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-teal-50 transition-colors text-left">
                                                        <div>
                                                            <p className="text-slate-700 text-sm font-medium">{t.testName}</p>
                                                            <p className="text-slate-400 text-xs">{t.testCode} · {t.category}</p>
                                                        </div>
                                                        <span className="text-teal-600 font-bold text-sm">₹{t.price}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {selectedTests.length > 0 ? (
                                        <div className="space-y-1.5 max-h-36 overflow-y-auto">
                                            {selectedTests.map((t) => (
                                                <div key={t._id} className="flex items-center justify-between bg-teal-50 border border-teal-200 rounded-xl px-3 py-2">
                                                    <div>
                                                        <p className="text-slate-700 text-xs font-semibold">{t.testName}</p>
                                                        <p className="text-slate-400 text-[10px]">{t.testCode}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-teal-600 font-bold text-xs">₹{t.price}</span>
                                                        <button type="button" onClick={() => removeTest(t._id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-slate-400 text-xs text-center py-3 bg-slate-50 rounded-xl">No tests selected yet</p>
                                    )}
                                </div>

                                {/* Pricing */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className={labelCls}>Original Price (auto)</label>
                                        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-500 text-sm">₹{originalPrice}</div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className={labelCls}>Package Price (₹) *</label>
                                        <input type="number" placeholder="e.g. 999" {...register("discountedPrice")} className={inputCls} />
                                        {errors.discountedPrice && <p className="text-red-500 text-xs">{errors.discountedPrice.message}</p>}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-1">
                                    <button type="button" onClick={closeModal}
                                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm rounded-xl py-2.5 transition-all">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={isSubmitting}
                                        className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl py-2.5 transition-all shadow-lg shadow-teal-200">
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : modal === "add" ? "Add Package" : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={!!deleteId}
                title="Delete Package"
                description="This will deactivate the package. It will no longer be available for booking."
                confirmLabel="Delete"
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
            />
        </>
    );
}
