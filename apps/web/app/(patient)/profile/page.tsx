"use client";

import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { User, Phone, Mail, Calendar, MapPin, Edit3, Save, X, LogOut, Loader2, Check } from "lucide-react";
import axios from "axios";

interface Profile {
    fullName: string;
    email: string;
    phone: string;
    dateOfBirth?: string;
    gender?: string;
    address?: { street?: string; city?: string; state?: string; pincode?: string };
    role: string;
}

export default function ProfilePage() {
    const logout = useAuthStore((s) => s.logout);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");
    const [draft, setDraft] = useState<Partial<Profile>>({});

    useEffect(() => {
        getProfile()
            .then((res) => { setProfile(res.data.patient); setDraft(res.data.patient); })
            .catch((err) => { if (!axios.isAxiosError(err) || err.response?.status !== 401) setError("Failed to load profile"); })
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setError("");
        try {
            const res = await updateProfile({ fullName: draft.fullName, phone: draft.phone, dateOfBirth: draft.dateOfBirth, gender: draft.gender as string, address: draft.address });
            setProfile(res.data.patient);
            setDraft(res.data.patient);
            setSaved(true);
            setEditing(false);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            if (axios.isAxiosError(err)) setError(err.response?.data?.message || "Update failed");
        } finally {
            setSaving(false);
        }
    };

    const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all";
    const readCls = "text-slate-700 text-sm py-3 px-4 bg-slate-50 border border-slate-100 rounded-xl";

    if (loading) return (
        <div className="flex-1 flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
        </div>
    );

    return (
        <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Manage your personal information</p>
                </div>
                {!editing ? (
                    <button onClick={() => setEditing(true)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 text-sm px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button onClick={() => { setDraft(profile || {}); setEditing(false); }} className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-500 text-sm px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                            <X className="w-3.5 h-3.5" /> Cancel
                        </button>
                        <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl disabled:opacity-60 transition-all shadow-md shadow-teal-200">
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                            {saving ? "Saving..." : "Save"}
                        </button>
                    </div>
                )}
            </div>

            {saved && (
                <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 mb-5">
                    <Check className="w-4 h-4 text-teal-600" strokeWidth={2.5} />
                    <span className="text-teal-700 text-sm font-medium">Profile updated successfully</span>
                </div>
            )}
            {error && <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

            {/* Avatar */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 mb-5 shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-3xl">
                        {profile?.fullName?.[0] || "?"}
                    </div>
                    <div>
                        <p className="text-slate-800 text-xl font-bold">{profile?.fullName}</p>
                        <p className="text-slate-500 text-sm mt-0.5">{profile?.email}</p>
                        <span className="inline-block mt-2 text-xs bg-teal-50 border border-teal-200 text-teal-700 px-2.5 py-0.5 rounded-full font-semibold capitalize">{profile?.role}</span>
                    </div>
                </div>
            </div>

            {/* Personal info */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 mb-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5">Personal Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1.5"><User className="w-3 h-3" /> Full name</label>
                        {editing ? <input value={draft.fullName || ""} onChange={(e) => setDraft({ ...draft, fullName: e.target.value })} className={inputCls} /> : <p className={readCls}>{profile?.fullName}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1.5"><Phone className="w-3 h-3" /> Phone</label>
                        {editing ? <input value={draft.phone || ""} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} className={inputCls} /> : <p className={readCls}>{profile?.phone}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1.5"><Mail className="w-3 h-3" /> Email</label>
                        <p className={readCls}>{profile?.email}</p>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Date of birth</label>
                        {editing ? (
                            <input type="date" value={draft.dateOfBirth ? draft.dateOfBirth.split("T")[0] : ""} onChange={(e) => setDraft({ ...draft, dateOfBirth: e.target.value })} className={inputCls} />
                        ) : (
                            <p className={readCls}>{profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "Not provided"}</p>
                        )}
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1.5"><User className="w-3 h-3" /> Gender</label>
                        {editing ? (
                            <select value={draft.gender || ""} onChange={(e) => setDraft({ ...draft, gender: e.target.value })} className={inputCls}>
                                <option value="">Select</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        ) : (
                            <p className={`${readCls} capitalize`}>{profile?.gender || "Not provided"}</p>
                        )}
                    </div>
                </div>

                <div className="mt-4 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Address</label>
                    {editing ? (
                        <div className="space-y-2">
                            <input value={draft.address?.street || ""} onChange={(e) => setDraft({ ...draft, address: { ...draft.address, street: e.target.value } })} placeholder="Street / Area" className={inputCls} />
                            <div className="grid grid-cols-3 gap-2">
                                <input value={draft.address?.city || ""} onChange={(e) => setDraft({ ...draft, address: { ...draft.address, city: e.target.value } })} placeholder="City" className={inputCls} />
                                <input value={draft.address?.state || ""} onChange={(e) => setDraft({ ...draft, address: { ...draft.address, state: e.target.value } })} placeholder="State" className={inputCls} />
                                <input value={draft.address?.pincode || ""} onChange={(e) => setDraft({ ...draft, address: { ...draft.address, pincode: e.target.value } })} placeholder="Pincode" className={inputCls} />
                            </div>
                        </div>
                    ) : (
                        <p className={readCls}>
                            {profile?.address?.street ? [profile.address.street, profile.address.city, profile.address.state, profile.address.pincode].filter(Boolean).join(", ") : "Not provided"}
                        </p>
                    )}
                </div>
            </div>

            {/* Sign out */}
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                <button onClick={logout} className="w-full flex items-center gap-3 px-6 py-4 hover:bg-red-50 transition-all text-left">
                    <LogOut className="w-4 h-4 text-red-400" strokeWidth={1.8} />
                    <div>
                        <p className="text-red-500 text-sm font-semibold">Sign out</p>
                        <p className="text-slate-400 text-xs">Sign out of this device</p>
                    </div>
                </button>
            </div>
        </main>
    );
}
