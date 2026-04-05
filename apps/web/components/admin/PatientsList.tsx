"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllPatients } from "@/lib/api";
import { Loader2, ArrowRight } from "lucide-react";

interface Patient {
    _id: string;
    patientId: string;
    fullName: string;
    phone: string;
    createdAt: string;
}

export default function PatientsList() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAllPatients({ limit: 6 })
            .then((res) => setPatients(res.data.patients || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-slate-800 font-bold text-base">Recent Patients</h3>
                <Link href="/admin/patients" className="text-teal-600 text-xs font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                    View all <ArrowRight className="w-3 h-3" />
                </Link>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-5 h-5 text-slate-300 animate-spin" />
                </div>
            ) : patients.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">No patients yet</div>
            ) : (
                <div className="divide-y divide-slate-50">
                    {patients.map((p) => (
                        <Link key={p._id} href={`/admin/patients/${p._id}`}
                            className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/60 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm">
                                    {p.fullName[0]}
                                </div>
                                <div>
                                    <p className="text-slate-700 text-sm font-semibold">{p.fullName}</p>
                                    <p className="text-slate-400 text-xs">{p.phone}</p>
                                </div>
                            </div>
                            <p className="text-slate-400 text-xs">
                                {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
