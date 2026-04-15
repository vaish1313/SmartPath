"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllPatients } from "@/lib/api";
import { ArrowRight } from "lucide-react";

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
        <div className="bg-white rounded-lg overflow-hidden" style={{ border: "0.5px solid rgba(0,0,0,0.1)" }}>
            <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: "0.5px solid rgba(0,0,0,0.1)" }}>
                <h3 className="text-slate-800 font-semibold text-base">Recent Patients</h3>
                <Link href="/admin/patients" className="text-[#1D9E75] text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                    View all <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            {loading ? (
                <div className="space-y-2.5 p-5">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
                    ))}
                </div>
            ) : patients.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">No patients yet</div>
            ) : (
                <div>
                    {patients.map((p, idx) => (
                        <Link key={p._id} href={`/admin/patients/${p._id}`}
                            className={`flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors ${idx !== patients.length - 1 ? 'border-b' : ''}`}
                            style={{ borderColor: "rgba(0,0,0,0.05)" }}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#E1F5EE] flex items-center justify-center text-[#1D9E75] font-semibold text-sm">
                                    {p.fullName[0]}
                                </div>
                                <div>
                                    <p className="text-slate-800 text-sm font-medium">{p.fullName}</p>
                                    <p className="text-slate-500 text-xs">{p.phone}</p>
                                </div>
                            </div>
                            <p className="text-slate-400 text-xs">
                                {new Date(p.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                            </p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
