"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getPatientById } from "@/lib/api";
import { ArrowLeft, Pencil, User, Phone, Mail, Calendar, MapPin, Droplets, Clock, Loader2 } from "lucide-react";
import axios from "axios";

interface Patient {
    _id: string;
    patientId?: string;
    fullName: string;
    email: string;
    phone: string;
    gender?: string;
    dateOfBirth?: string;
    bloodGroup?: string;
    address?: { street?: string; city?: string; state?: string; pincode?: string };
    medicalHistory?: { _id: string; condition: string; diagnosedDate?: string; notes?: string }[];
    isActive: boolean;
    createdAt: string;
}

export default function PatientDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;
        getPatientById(id)
            .then((res) => setPatient(res.data.patient))
            .catch((err) => {
                if (!axios.isAxiosError(err) || err.response?.status !== 401)
                    setError("Patient not found");
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div className="flex-1 flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
        </div>
    );

    if (error || !patient) return (
        <div className="flex-1 flex items-center justify-center flex-col gap-3 py-20">
            <p className="text-slate-500">{error || "Patient not found"}</p>
            <Link href="/admin/patients" className="text-teal-600 text-sm font-semibold">Back to patients</Link>
        </div>
    );

    const infoItems = [
        { icon: User, label: "Gender", value: patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : "—" },
        { icon: Calendar, label: "Date of Birth", value: patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—" },
        { icon: Droplets, label: "Blood Group", value: patient.bloodGroup || "—" },
        { icon: Phone, label: "Phone", value: patient.phone },
        { icon: Mail, label: "Email", value: patient.email },
        { icon: MapPin, label: "Address", value: patient.address?.street ? [patient.address.street, patient.address.city, patient.address.pincode].filter(Boolean).join(", ") : "—" },
    ];

    return (
        <main className="p-6 max-w-3xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 shadow-sm transition-all">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">{patient.fullName}</h1>
                        {patient.patientId && <p className="text-teal-600 text-xs font-mono font-semibold">{patient.patientId}</p>}
                    </div>
                </div>
                <Link href={`/admin/patients/${id}/edit`}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-md shadow-teal-200">
                    <Pencil className="w-4 h-4" /> Edit
                </Link>
            </div>

            {/* Info card */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 mb-5">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-2xl">
                        {patient.fullName[0]}
                    </div>
                    <div>
                        <p className="text-slate-800 text-lg font-bold">{patient.fullName}</p>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${patient.isActive ? "bg-teal-50 text-teal-700 border-teal-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                            {patient.isActive ? "Active" : "Inactive"}
                        </span>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {infoItems.map(({ icon: Icon, label, value }) => (
                        <div key={label} className="flex items-start gap-3 bg-slate-50 rounded-xl p-3">
                            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                                <Icon className="w-4 h-4 text-teal-500" strokeWidth={1.8} />
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs">{label}</p>
                                <p className="text-slate-700 text-sm font-semibold">{value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Medical history */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-sm font-bold text-slate-700">Medical History</h2>
                </div>
                {!patient.medicalHistory || patient.medicalHistory.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-6">No medical history recorded</p>
                ) : (
                    <div className="space-y-3">
                        {patient.medicalHistory.map((entry) => (
                            <div key={entry._id} className="flex items-start gap-3 border-l-2 border-teal-200 pl-4 py-1">
                                <div className="flex-1">
                                    <p className="text-slate-700 text-sm font-semibold">{entry.condition}</p>
                                    {entry.diagnosedDate && (
                                        <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                                            <Clock className="w-3 h-3" />
                                            {new Date(entry.diagnosedDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                        </p>
                                    )}
                                    {entry.notes && <p className="text-slate-500 text-xs mt-1">{entry.notes}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
