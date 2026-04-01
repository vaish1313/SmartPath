"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import PageHeader from "@/components/shared/PageHeader";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { getAllPatients, deletePatient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Search, UserPlus, Eye, Pencil, Trash2, Loader2, Users } from "lucide-react";
import axios from "axios";

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
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
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

    const debouncedSearch = useDebounce(search);

    const fetchPatients = useCallback(() => {
        setLoading(true);
        getAllPatients({ page, limit: 10, search: debouncedSearch })
            .then((res) => {
                setPatients(res.data.patients || []);
                setTotal(res.data.total || 0);
                setTotalPages(res.data.totalPages || 1);
            })
            .catch((err) => {
                if (!axios.isAxiosError(err) || err.response?.status !== 401)
                    setError("Failed to load patients");
            })
            .finally(() => setLoading(false));
    }, [page, debouncedSearch]);

    useEffect(() => { fetchPatients(); }, [fetchPatients]);
    // Reset to page 1 on new search
    useEffect(() => { setPage(1); }, [debouncedSearch]);

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await deletePatient(deleteId);
            setPatients((prev) => prev.filter((p) => p._id !== deleteId));
            setTotal((t) => t - 1);
        } catch {
            setError("Failed to delete patient");
        } finally {
            setDeleting(false);
            setDeleteId(null);
        }
    };

    return (
        <>
            <main className="p-6">
                <PageHeader
                    title="Patients"
                    subtitle={`${total} registered patients`}
                    action={
                        <Link
                            href="/admin/patients/new"
                            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-md shadow-teal-200"
                        >
                            <UserPlus className="w-4 h-4" /> Add Patient
                        </Link>
                    }
                />

                {error && (
                    <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
                )}

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100">
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name, phone, or ID..."
                                className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
                        </div>
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
                                            <td className="px-5 py-3.5 text-teal-600 font-semibold font-mono text-xs">
                                                {p.patientId || "—"}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs flex-shrink-0">
                                                        {p.fullName[0]}
                                                    </div>
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
                                                    <span className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                                                        {p.bloodGroup}
                                                    </span>
                                                ) : "—"}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={`/admin/patients/${p._id}`}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-all"
                                                        title="View"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/admin/patients/${p._id}/edit`}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                                        title="Edit"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Link>
                                                    {user?.role === "admin" && (
                                                        <button
                                                            onClick={() => setDeleteId(p._id)}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
                            <p className="text-slate-400 text-xs">{total} total patients</p>
                            <div className="flex gap-2">
                                <button disabled={page === 1} onClick={() => setPage(page - 1)}
                                    className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:border-teal-300 transition-all">
                                    Prev
                                </button>
                                <span className="px-3 py-1.5 text-xs text-slate-500">{page} / {totalPages}</span>
                                <button disabled={page === totalPages} onClick={() => setPage(page + 1)}
                                    className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:border-teal-300 transition-all">
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

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
