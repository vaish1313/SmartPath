"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { getStaffByRole } from "@/lib/api";
import { Plus, UserCog, Pencil, Trash2, Loader2, X, Mail, Phone, Shield } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";

const schema = z.object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Valid email is required"),
    phone: z.string().min(10, "Valid phone number is required"),
    role: z.enum(["technician", "pathologist", "receptionist", "admin"], {
        errorMap: () => ({ message: "Select a valid role" }),
    }),
    password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

type FormData = z.infer<typeof schema>;

interface Staff {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    isActive: boolean;
    createdAt: string;
}

const ROLE_COLORS: Record<string, string> = {
    admin: "bg-purple-50 text-purple-700 border-purple-200",
    pathologist: "bg-blue-50 text-blue-700 border-blue-200",
    technician: "bg-teal-50 text-teal-700 border-teal-200",
    receptionist: "bg-amber-50 text-amber-700 border-amber-200",
};

const ROLE_ICONS: Record<string, string> = {
    admin: "👑",
    pathologist: "🔬",
    technician: "🧪",
    receptionist: "📋",
};

export default function StaffManagementPage() {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    // Modal state
    const [modal, setModal] = useState<"add" | "edit" | null>(null);
    const [editId, setEditId] = useState<string | null>(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [apiError, setApiError] = useState("");

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
        useForm<FormData>({ resolver: zodResolver(schema) });

    useEffect(() => {
        loadStaff();
    }, []);

    const loadStaff = () => {
        setLoading(true);
        // Fetch all staff members (you might need to adjust this based on your API)
        Promise.all([
            getStaffByRole("admin"),
            getStaffByRole("pathologist"),
            getStaffByRole("technician"),
            getStaffByRole("receptionist"),
        ])
            .then((responses) => {
                const allStaff = responses.flatMap((res) => res.data.users || res.data.staff || []);
                setStaff(allStaff);
            })
            .catch((err) => {
                if (!axios.isAxiosError(err) || err.response?.status !== 401) {
                    setError("Failed to load staff members");
                }
            })
            .finally(() => setLoading(false));
    };

    const openAdd = () => {
        reset({ password: "" });
        setApiError("");
        setModal("add");
    };

    const openEdit = (staffMember: Staff) => {
        setEditId(staffMember._id);
        reset({
            fullName: staffMember.fullName,
            email: staffMember.email,
            phone: staffMember.phone,
            role: staffMember.role as any,
        });
        setApiError("");
        setModal("edit");
    };

    const closeModal = () => {
        setModal(null);
        setEditId(null);
        reset({});
        setApiError("");
    };

    const onSubmit = async (data: FormData) => {
        setApiError("");
        try {
            if (modal === "add") {
                // TODO: Implement createStaff API call
                setApiError("Create staff API not implemented yet");
                // const res = await createStaff(data);
                // setStaff((prev) => [res.data.staff, ...prev]);
                // closeModal();
            } else if (modal === "edit" && editId) {
                // TODO: Implement updateStaff API call
                setApiError("Update staff API not implemented yet");
                // const res = await updateStaff(editId, data);
                // setStaff((prev) => prev.map((s) => s._id === editId ? res.data.staff : s));
                // closeModal();
            }
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setApiError(err.response?.data?.message || "Operation failed");
            } else {
                setApiError("Something went wrong.");
            }
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            // TODO: Implement deleteStaff API call
            // await deleteStaff(deleteId);
            setStaff((prev) => prev.filter((s) => s._id !== deleteId));
            setError("Delete staff API not implemented yet");
        } catch {
            setError("Failed to delete staff member");
        } finally {
            setDeleting(false);
            setDeleteId(null);
        }
    };

    const inputCls = "w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm placeholder:text-slate-300 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all";
    const labelCls = "text-xs font-semibold text-slate-500 tracking-wide uppercase";

    const groupedStaff = {
        admin: staff.filter((s) => s.role === "admin"),
        pathologist: staff.filter((s) => s.role === "pathologist"),
        technician: staff.filter((s) => s.role === "technician"),
        receptionist: staff.filter((s) => s.role === "receptionist"),
    };

    return (
        <>
            <main className="p-5">
                <PageHeader
                    title="Staff Management"
                    subtitle={`${staff.length} staff members`}
                    action={
                        <button
                            onClick={openAdd}
                            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-md shadow-teal-200"
                        >
                            <Plus className="w-4 h-4" /> Add Staff Member
                        </button>
                    }
                />

                {error && (
                    <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-5">
                        {Object.entries(groupedStaff).map(([role, members]) => (
                            <div key={role} className="bg-white rounded-lg overflow-hidden" style={{ border: "0.5px solid rgba(0,0,0,0.1)" }}>
                                <div className="px-5 py-3.5 flex items-center gap-2" style={{ borderBottom: "0.5px solid rgba(0,0,0,0.1)", backgroundColor: "#F5F5F3" }}>
                                    <span className="text-xl">{ROLE_ICONS[role]}</span>
                                    <h3 className="text-slate-800 font-semibold text-base capitalize">{role}s</h3>
                                    <span className="ml-auto text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                                        {members.length}
                                    </span>
                                </div>

                                {members.length === 0 ? (
                                    <div className="text-center py-10 text-slate-400 text-sm">
                                        No {role}s added yet
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {members.map((s) => (
                                            <div
                                                key={s._id}
                                                className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-[#E1F5EE] flex items-center justify-center">
                                                        <span className="text-[#1D9E75] font-semibold text-sm">
                                                            {s.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-800 text-sm font-semibold">{s.fullName}</p>
                                                        <div className="flex items-center gap-3 mt-0.5">
                                                            <span className="text-slate-500 text-xs flex items-center gap-1">
                                                                <Mail className="w-3 h-3" /> {s.email}
                                                            </span>
                                                            <span className="text-slate-500 text-xs flex items-center gap-1">
                                                                <Phone className="w-3 h-3" /> {s.phone}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <span
                                                        className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border capitalize ${ROLE_COLORS[s.role] || "bg-slate-100 text-slate-600"
                                                            }`}
                                                    >
                                                        {s.role}
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => openEdit(s)}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                                            title="Edit"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteId(s._id)}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Add / Edit Modal */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                                    <UserCog className="w-4 h-4 text-purple-600" strokeWidth={1.8} />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-slate-800">
                                        {modal === "add" ? "Add Staff Member" : "Edit Staff Member"}
                                    </h2>
                                    <p className="text-slate-400 text-xs">
                                        {modal === "add" ? "Create a new staff account" : "Update staff details"}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={closeModal}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Body */}
                        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
                            {apiError && (
                                <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                                    {apiError}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className={labelCls}>Full Name *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Dr. John Doe"
                                    {...register("fullName")}
                                    className={inputCls}
                                />
                                {errors.fullName && (
                                    <p className="text-red-500 text-xs">{errors.fullName.message}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className={labelCls}>Email *</label>
                                <input
                                    type="email"
                                    placeholder="email@example.com"
                                    {...register("email")}
                                    className={inputCls}
                                />
                                {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className={labelCls}>Phone *</label>
                                <input
                                    type="tel"
                                    placeholder="1234567890"
                                    {...register("phone")}
                                    className={inputCls}
                                />
                                {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className={labelCls}>Role *</label>
                                <select {...register("role")} className={inputCls} style={{ backgroundColor: "white" }}>
                                    <option value="">Select role</option>
                                    <option value="technician">🧪 Technician</option>
                                    <option value="pathologist">🔬 Pathologist</option>
                                    <option value="receptionist">📋 Receptionist</option>
                                    <option value="admin">👑 Admin</option>
                                </select>
                                {errors.role && <p className="text-red-500 text-xs">{errors.role.message}</p>}
                            </div>

                            {modal === "add" && (
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Password *</label>
                                    <input
                                        type="password"
                                        placeholder="Minimum 6 characters"
                                        {...register("password")}
                                        className={inputCls}
                                    />
                                    {errors.password && (
                                        <p className="text-red-500 text-xs">{errors.password.message}</p>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm rounded-xl py-2.5 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl py-2.5 transition-all shadow-lg shadow-teal-200"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : modal === "add" ? (
                                        "Add Staff Member"
                                    ) : (
                                        "Save Changes"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={!!deleteId}
                title="Delete Staff Member"
                description="This will remove the staff member from the system. They will no longer be able to access the admin portal."
                confirmLabel="Delete"
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
            />
        </>
    );
}
