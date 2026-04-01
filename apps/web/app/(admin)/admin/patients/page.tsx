"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import PageHeader from "@/components/shared/PageHeader";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { getAllPatients, createPatient, getPatientById, updatePatient, deletePatient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, UserPlus, Eye, Pencil, Trash2, Loader2, Users, X, User } from "lucide-react";
import axios from "axios";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const schema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email").optional().or(z.literal("")),
    phone: z.string().regex(/^\d{10}$/, "Enter valid 10-digit phone"),
    gender: z.enum(["male", "female", "other"]).optional(),
    dateOfBirth: z.string().optional(),
    bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    pincode: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Patient {
    _id: string;
    patientId?: string;
    fullName: string;
    phone: string;
    email: string;
    gender?: string;
    bloodGroup?: string;
    isActive: boolean;
    createdAt: string;
}

function useDebounce<T>(value: T, delay = 400): T {
    const [d, setD] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setD(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return d;
}

export default function AdminPatientsPage() {
    const user = useAuthStore((s) => s.user);
    const [patients, setPatients] = useState<Patient[]>([]);
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

    const fetchPatients = useCallback(() => {
        setLoading(true);
        getAllPatients({ page, limit: 10, search: debouncedSearch })
            .then((res) => {
                setPatients(res.data.patients || []);
                setTotal(res.data.total || 0);
                setTotalPages(res.data.totalPages || 1);
            })
            .catch((err) => { if (!axios.isAxiosError(err) || err.response?.status !== 401) setError("Failed to load patients"); })
            .finally(() => setLoading(false));
    }, [page, debouncedSearch]);

    useEffect(() => { fetchPatients(); }, [fetchPatients]);
    useEffect(() => { setPage(1); }, [debouncedSearch]);

    const openAdd = () => { reset({}); setApiError(""); setModal("add"); };

    const openEdit = (id: string) => {
        setEditId(id); setApiError(""); setModalLoading(true); setModal("edit");
        getPatientById(id)
            .then((res) => {
                const p = res.data.patient;
                reset({
                    fullName: p.fullName, phone: p.phone, email: p.email,
                    gender: p.gender, bloodGroup: p.bloodGroup,
                    dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split("T")[0] : "",
                    street: p.address?.street || "", city: p.address?.city || "", pincode: p.address?.pincode || "",
                });
            })
            .catch(() => setApiError("Failed to load patient"))
            .finally(() => setModalLoading(false));
    };

    const closeModal = () => { setModal(null); setEditId(null); reset({}); setApiError(""); };

    const onSubmit = async (data: FormData) => {
        setApiError("");
        try {
            if (modal === "add") {
                const res = await createPatient({
                    fullName: data.fullName, email: data.email || "", phone: data.phone,
                    gender: data.gender, dateOfBirth: data.dateOfBirth, bloodGroup: data.bloodGroup,
                    address: { street: data.street, city: data.city, pincode: data.pincode },
                });
                setPatients((prev) => [res.data.patient, ...prev]);
                setTotal((n) => n + 1);
            } else if (modal === "edit" && editId) {
                const res = await updatePatient(editId, {
                    fullName: data.fullName, phone: data.phone, gender: data.gender,
                    dateOfBirth: data.dateOfBirth, bloodGroup: data.bloodGroup,
                    address: { street: data.street, city: data.city, pincode: data.pincode },
                });
                setPatients((prev) => prev.map((p) => p._id === editId ? { ...p, ...res.data.patient } : p));
            }
            closeModal();
        } catch (err) {
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 409) setApiError("Email or phone already registered");
                else setApiError(err.response?.data?.message || "Operation failed");
            } else setApiError("Something went wrong.");
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await deletePatient(deleteId);
            setPatients((prev) => prev.filter((p) => p._id !== deleteId));
            setTotal((n) => n - 1);
        } catch { setError("Failed to delete patient"); }
        finally { setDeleting(false); setDeleteId(null); }
    };

    const inputCls = "w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm placeholder:text-slate-300 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all";
    const labelCls = "text-xs font-semibold text-slate-500 tracking-wide uppercase";

    return (
        <>
            <main className="p-6">
                <PageHeader
                    title="Patients"
                    subtitle={`${total} registered patients`}
                    action={
                        <button onClick={openAdd}
                            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-md shadow-teal-200">
                            <UserPlus className="w-4 h-4" /> Add Patient
                        </button>
                    }
                />

                {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100">
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input value={search} onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name, phone, or ID..."
                                className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all" />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-teal-500 animate-spin" /></div>
                    ) : patients.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mb-3">
                                <Users className="w-6 h-6 text-teal-400" strokeWidth={1.5} />
                            </div>
                            <p className="text-slate-500 text-sm">No patients found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        {["Patient ID", "Name", "Phone", "Gender", "Blood Group", "Actions"].map((h) => (
                                            <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {patients.map((p) => (
                                        <tr key={p._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-5 py-3.5 text-teal-600 font-semibold font-mono text-xs">{p.patientId || "—"}</td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs flex-shrink-0">{p.fullName[0]}</div>
                                                    <div>
                                                        <p className="text-slate-700 font-semibold">{p.fullName}</p>
                                                        <p className="text-slate-400 text-xs">{p.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-600">{p.phone}</td>
                                            <td className="px-5 py-3.5 text-slate-600 capitalize">{p.gender || "—"}</td>
                                            <td className="px-5 py-3.5">
                                                {p.bloodGroup ? (
                                                    <span className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">{p.bloodGroup}</span>
                                                ) : "—"}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <Link href={`/admin/patients/${p._id}`} className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-all" title="View"><Eye className="w-4 h-4" /></Link>
                                                    <button onClick={() => openEdit(p._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all" title="Edit"><Pencil className="w-4 h-4" /></button>
                                                    {user?.role === "admin" && (
                                                        <button onClick={() => setDeleteId(p._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                                    )}
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
                            <p className="text-slate-400 text-xs">{total} total patients</p>
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
                                    <User className="w-4 h-4 text-teal-600" strokeWidth={1.8} />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-slate-800">{modal === "add" ? "Add New Patient" : "Edit Patient"}</h2>
                                    <p className="text-slate-400 text-xs">{modal === "add" ? "Register a new patient record" : "Update patient information"}</p>
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

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5 col-span-2">
                                        <label className={labelCls}>Full Name *</label>
                                        <input type="text" placeholder="Priya Sharma" {...register("fullName")} className={inputCls} />
                                        {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName.message}</p>}
                                    </div>
                                    {modal === "add" && (
                                        <div className="space-y-1.5 col-span-2">
                                            <label className={labelCls}>Email</label>
                                            <input type="email" placeholder="patient@example.com" {...register("email")} className={inputCls} />
                                            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                                        </div>
                                    )}
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
                                    <div className="space-y-1.5 col-span-2">
                                        <label className={labelCls}>Street / Area</label>
                                        <input type="text" placeholder="Flat 4B, Sai Nagar" {...register("street")} className={inputCls} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className={labelCls}>City</label>
                                        <input type="text" placeholder="Nashik" {...register("city")} className={inputCls} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className={labelCls}>Pincode</label>
                                        <input type="text" placeholder="422001" {...register("pincode")} className={inputCls} />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-1">
                                    <button type="button" onClick={closeModal} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm rounded-xl py-2.5 transition-all">Cancel</button>
                                    <button type="submit" disabled={isSubmitting}
                                        className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl py-2.5 transition-all shadow-lg shadow-teal-200">
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : modal === "add" ? "Add Patient" : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={!!deleteId}
                title="Delete Patient"
                description="This will deactivate the patient account. This action cannot be undone."
                confirmLabel="Delete"
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
            />
        </>
    );
}
