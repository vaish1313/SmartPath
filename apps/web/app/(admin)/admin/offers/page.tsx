"use client";

import { useEffect, useState, useCallback } from "react";
import PageHeader from "@/components/shared/PageHeader";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { getAllOffers, createOffer, getOfferById, updateOffer, deleteOffer } from "@/lib/api";
import { Plus, Sparkles, Pencil, Trash2, Loader2, X, Tag } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";

const ICONS = [
    { value: "Percent", label: "Percent %" },
    { value: "Gift", label: "Gift 🎁" },
    { value: "Sparkles", label: "Sparkles ✨" },
    { value: "Clock", label: "Clock ⏰" },
    { value: "Star", label: "Star ⭐" },
    { value: "Tag", label: "Tag 🏷️" },
    { value: "Zap", label: "Zap ⚡" },
    { value: "Heart", label: "Heart ❤️" },
    { value: "Award", label: "Award 🏆" },
    { value: "TrendingUp", label: "Trending Up 📈" },
];

const COLORS = [
    { value: "text-teal-400", label: "Teal", preview: "bg-teal-400" },
    { value: "text-cyan-400", label: "Cyan", preview: "bg-cyan-400" },
    { value: "text-amber-400", label: "Amber", preview: "bg-amber-400" },
    { value: "text-violet-400", label: "Violet", preview: "bg-violet-400" },
    { value: "text-pink-400", label: "Pink", preview: "bg-pink-400" },
    { value: "text-emerald-400", label: "Emerald", preview: "bg-emerald-400" },
    { value: "text-orange-400", label: "Orange", preview: "bg-orange-400" },
    { value: "text-rose-400", label: "Rose", preview: "bg-rose-400" },
    { value: "text-blue-400", label: "Blue", preview: "bg-blue-400" },
    { value: "text-indigo-400", label: "Indigo", preview: "bg-indigo-400" },
    { value: "text-yellow-400", label: "Yellow", preview: "bg-yellow-400" },
    { value: "text-purple-400", label: "Purple", preview: "bg-purple-400" },
];

const schema = z.object({
    text: z.string().min(5, "Offer text must be at least 5 characters"),
    icon: z.string().min(1, "Select an icon"),
    color: z.string().min(1, "Select a color"),
    priority: z.number().min(0).max(100),
    isActive: z.boolean(),
    validFrom: z.string().optional(),
    validUntil: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Offer {
    _id: string;
    text: string;
    icon: string;
    color: string;
    priority: number;
    isActive: boolean;
    validFrom?: string;
    validUntil?: string;
    createdAt: string;
}

export default function AdminOffersPage() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [modal, setModal] = useState<"add" | "edit" | null>(null);
    const [editId, setEditId] = useState<string | null>(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [apiError, setApiError] = useState("");

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
        useForm<FormData>({
            resolver: zodResolver(schema),
            defaultValues: {
                priority: 50,
                isActive: true,
            }
        });

    const fetchOffers = useCallback(() => {
        setLoading(true);
        getAllOffers({ limit: 100 })
            .then((res) => setOffers(res.data.offers || []))
            .catch((err) => { if (!axios.isAxiosError(err) || err.response?.status !== 401) setError("Failed to load offers"); })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchOffers(); }, [fetchOffers]);

    const openAdd = () => {
        reset({
            text: "",
            icon: "Percent",
            color: "text-teal-400",
            priority: 50,
            isActive: true,
            validFrom: "",
            validUntil: "",
        });
        setApiError("");
        setModal("add");
    };

    const openEdit = (id: string) => {
        setEditId(id); setApiError(""); setModalLoading(true); setModal("edit");
        getOfferById(id)
            .then((res) => {
                const o = res.data.offer;
                reset({
                    text: o.text,
                    icon: o.icon,
                    color: o.color,
                    priority: o.priority,
                    isActive: o.isActive,
                    validFrom: o.validFrom ? new Date(o.validFrom).toISOString().split("T")[0] : "",
                    validUntil: o.validUntil ? new Date(o.validUntil).toISOString().split("T")[0] : "",
                });
            })
            .catch(() => setApiError("Failed to load offer"))
            .finally(() => setModalLoading(false));
    };

    const closeModal = () => { setModal(null); setEditId(null); reset({}); setApiError(""); };

    const onSubmit = async (data: FormData) => {
        setApiError("");
        try {
            if (modal === "add") {
                const res = await createOffer(data);
                setOffers((prev) => [res.data.offer, ...prev]);
            } else if (modal === "edit" && editId) {
                const res = await updateOffer(editId, data);
                setOffers((prev) => prev.map((o) => o._id === editId ? res.data.offer : o));
            }
            closeModal();
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setApiError(err.response?.data?.message || "Operation failed");
            } else setApiError("Something went wrong.");
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await deleteOffer(deleteId);
            setOffers((prev) => prev.filter((o) => o._id !== deleteId));
        } catch { setError("Failed to delete offer"); }
        finally { setDeleting(false); setDeleteId(null); }
    };

    const inputCls = "w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm placeholder:text-slate-300 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all";
    const labelCls = "text-xs font-semibold text-slate-500 tracking-wide uppercase";

    return (
        <>
            <main className="p-6">
                <PageHeader
                    title="Promotional Offers"
                    subtitle={`${offers.length} offers configured`}
                    action={
                        <button onClick={openAdd}
                            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-md shadow-teal-200">
                            <Plus className="w-4 h-4" /> Add Offer
                        </button>
                    }
                />

                {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

                <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/40 shadow-lg overflow-hidden hover:shadow-xl hover:bg-white/70 transition-all">
                    {loading ? (
                        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-teal-500 animate-spin" /></div>
                    ) : offers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mb-3">
                                <Tag className="w-6 h-6 text-teal-400" strokeWidth={1.5} />
                            </div>
                            <p className="text-slate-500 text-sm">No offers found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        {["Offer Text", "Icon", "Color", "Priority", "Status", "Valid Until", "Actions"].map((h) => (
                                            <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {offers.map((o) => (
                                        <tr key={o._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-5 py-3.5 text-slate-700 font-medium max-w-md">{o.text}</td>
                                            <td className="px-5 py-3.5">
                                                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">{o.icon}</span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-4 h-4 rounded ${o.color.replace('text-', 'bg-')}`} />
                                                    <span className="text-xs text-slate-500">{o.color.replace('text-', '').replace('-400', '')}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="text-xs font-bold text-teal-600">{o.priority}</span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${o.isActive ? "bg-teal-50 text-teal-700 border-teal-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                                                    {o.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-500 text-xs">
                                                {o.validUntil ? new Date(o.validUntil).toLocaleDateString("en-IN") : "No expiry"}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => openEdit(o._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all" title="Edit"><Pencil className="w-4 h-4" /></button>
                                                    <button onClick={() => setDeleteId(o._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Delete"><Trash2 className="w-4 h-4" /></button>
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
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-teal-600" strokeWidth={1.8} />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-slate-800">{modal === "add" ? "Add New Offer" : "Edit Offer"}</h2>
                                    <p className="text-slate-400 text-xs">{modal === "add" ? "Create a promotional offer" : "Update offer details"}</p>
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
                                    <label className={labelCls}>Offer Text *</label>
                                    <input type="text" placeholder="10% OFF on All Blood Tests" {...register("text")} className={inputCls} />
                                    {errors.text && <p className="text-red-500 text-xs">{errors.text.message}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className={labelCls}>Icon *</label>
                                        <select {...register("icon")} className={inputCls} style={{ backgroundColor: "white" }}>
                                            {ICONS.map((icon) => (
                                                <option key={icon.value} value={icon.value}>{icon.label}</option>
                                            ))}
                                        </select>
                                        {errors.icon && <p className="text-red-500 text-xs">{errors.icon.message}</p>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className={labelCls}>Color *</label>
                                        <select {...register("color")} className={inputCls} style={{ backgroundColor: "white" }}>
                                            {COLORS.map((color) => (
                                                <option key={color.value} value={color.value}>{color.label}</option>
                                            ))}
                                        </select>
                                        {errors.color && <p className="text-red-500 text-xs">{errors.color.message}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className={labelCls}>Priority (0-100) *</label>
                                        <input type="number" min="0" max="100" {...register("priority", { valueAsNumber: true })} className={inputCls} />
                                        {errors.priority && <p className="text-red-500 text-xs">{errors.priority.message}</p>}
                                        <p className="text-xs text-slate-400">Higher priority shows first</p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className={labelCls}>Status</label>
                                        <div className="flex items-center gap-3 pt-2">
                                            <input type="checkbox" {...register("isActive")} className="w-4 h-4 text-teal-600 rounded" />
                                            <span className="text-sm text-slate-600">Active</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className={labelCls}>Valid From</label>
                                        <input type="date" {...register("validFrom")} className={inputCls} />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className={labelCls}>Valid Until</label>
                                        <input type="date" {...register("validUntil")} className={inputCls} />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-1">
                                    <button type="button" onClick={closeModal} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm rounded-xl py-2.5 transition-all">Cancel</button>
                                    <button type="submit" disabled={isSubmitting}
                                        className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl py-2.5 transition-all shadow-lg shadow-teal-200">
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : modal === "add" ? "Add Offer" : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={!!deleteId}
                title="Delete Offer"
                description="This will remove the offer from the marquee. This action cannot be undone."
                confirmLabel="Delete"
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
            />
        </>
    );
}
