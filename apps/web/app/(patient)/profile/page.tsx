"use client";

import { useState } from "react";
import {
    User, Phone, Mail, Calendar, MapPin,
    Edit3, Save, X, Shield, Bell,
    LogOut, ChevronRight, Loader2, Check
} from "lucide-react";

interface ProfileForm {
    name: string;
    email: string;
    phone: string;
    dob: string;
    gender: string;
    bloodGroup: string;
    address: string;
    emergencyContact: string;
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function ProfilePage() {
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [form, setForm] = useState<ProfileForm>({
        name: "Jessi Kumar",
        email: "jessi@example.com",
        phone: "98765 43210",
        dob: "2003-05-14",
        gender: "male",
        bloodGroup: "B+",
        address: "Flat 4B, Sai Nagar, Nashik – 422005",
        emergencyContact: "91234 56789",
    });

    const [draft, setDraft] = useState<ProfileForm>({ ...form });

    const handleSave = async () => {
        setSaving(true);
        // TODO: PATCH /api/patients/:id with draft
        await new Promise(r => setTimeout(r, 1200));
        setForm({ ...draft });
        setSaving(false);
        setSaved(true);
        setEditing(false);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleCancel = () => {
        setDraft({ ...form });
        setEditing(false);
    };

    const Field = ({
        label, value, field, type = "text", icon: Icon
    }: {
        label: string;
        value: string;
        field: keyof ProfileForm;
        type?: string;
        icon: React.ElementType;
    }) => (
        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#8899AA] uppercase tracking-wider flex items-center gap-1.5">
                <Icon className="w-3 h-3" />
                {label}
            </label>
            {editing ? (
                <input
                    type={type}
                    value={draft[field]}
                    onChange={e => setDraft({ ...draft, [field]: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#445566] outline-none focus:border-[#14D7B4]/50 focus:ring-2 focus:ring-[#14D7B4]/10 transition-all"
                />
            ) : (
                <p className="text-white text-sm py-3 px-4 bg-white/[0.02] border border-white/6 rounded-xl">
                    {value || <span className="text-[#334455]">Not provided</span>}
                </p>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-[#060B14]">
            <div
                className="fixed inset-0 pointer-events-none opacity-40"
                style={{
                    backgroundImage: "linear-gradient(rgba(20,215,180,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(20,215,180,0.03) 1px,transparent 1px)",
                    backgroundSize: "48px 48px",
                }}
            />

            <div className="relative z-10 max-w-2xl mx-auto px-6 py-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>
                            My Profile
                        </h1>
                        <p className="text-[#556677] text-sm mt-0.5">Manage your personal information</p>
                    </div>
                    {!editing ? (
                        <button
                            onClick={() => setEditing(true)}
                            className="flex items-center gap-2 bg-white/[0.06] border border-white/10 text-white text-sm px-4 py-2.5 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all"
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                            Edit profile
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={handleCancel}
                                className="flex items-center gap-1.5 bg-white/[0.04] border border-white/10 text-[#8899AA] text-sm px-4 py-2.5 rounded-xl hover:text-white transition-all"
                            >
                                <X className="w-3.5 h-3.5" /> Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-1.5 bg-gradient-to-r from-[#14D7B4] to-[#0EA5E9] text-[#060B14] font-bold text-sm px-4 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-60 transition-all"
                            >
                                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                {saving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    )}
                </div>

                {/* Saved toast */}
                {saved && (
                    <div className="flex items-center gap-2 bg-[#14D7B4]/10 border border-[#14D7B4]/25 rounded-xl px-4 py-3 mb-5">
                        <Check className="w-4 h-4 text-[#14D7B4]" strokeWidth={2.5} />
                        <span className="text-[#14D7B4] text-sm font-medium">Profile updated successfully</span>
                    </div>
                )}

                {/* Avatar + name */}
                <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-6 mb-5">
                    <div className="flex items-center gap-5">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#14D7B4]/30 to-[#0EA5E9]/20 border border-[#14D7B4]/20 flex items-center justify-center text-[#14D7B4] font-bold text-3xl">
                                {form.name[0]}
                            </div>
                            {editing && (
                                <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#14D7B4] rounded-lg flex items-center justify-center">
                                    <Edit3 className="w-3 h-3 text-[#060B14]" strokeWidth={2.5} />
                                </button>
                            )}
                        </div>
                        <div>
                            <p className="text-white text-xl font-semibold">{form.name}</p>
                            <p className="text-[#556677] text-sm mt-0.5">{form.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs bg-[#14D7B4]/10 border border-[#14D7B4]/20 text-[#14D7B4] px-2.5 py-0.5 rounded-full font-medium">
                                    Patient
                                </span>
                                <span className="text-xs bg-white/5 border border-white/10 text-[#667788] px-2.5 py-0.5 rounded-full">
                                    Blood: {form.bloodGroup}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Personal info */}
                <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-6 mb-5">
                    <p className="text-xs font-semibold text-[#8899AA] uppercase tracking-wider mb-5">Personal Information</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Full name" value={form.name} field="name" icon={User} />
                        <Field label="Phone number" value={`+91 ${form.phone}`} field="phone" icon={Phone} type="tel" />
                        <Field label="Email address" value={form.email} field="email" icon={Mail} type="email" />
                        <Field label="Date of birth" value={form.dob} field="dob" icon={Calendar} type="date" />

                        {/* Gender */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#8899AA] uppercase tracking-wider flex items-center gap-1.5">
                                <User className="w-3 h-3" /> Gender
                            </label>
                            {editing ? (
                                <select
                                    value={draft.gender}
                                    onChange={e => setDraft({ ...draft, gender: e.target.value })}
                                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#14D7B4]/50 transition-all [color-scheme:dark]"
                                    style={{ backgroundColor: "#0D1520" }}
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            ) : (
                                <p className="text-white text-sm py-3 px-4 bg-white/[0.02] border border-white/6 rounded-xl capitalize">
                                    {form.gender}
                                </p>
                            )}
                        </div>

                        {/* Blood group */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#8899AA] uppercase tracking-wider flex items-center gap-1.5">
                                <Shield className="w-3 h-3" /> Blood group
                            </label>
                            {editing ? (
                                <div className="flex flex-wrap gap-2">
                                    {BLOOD_GROUPS.map(bg => (
                                        <button
                                            key={bg}
                                            onClick={() => setDraft({ ...draft, bloodGroup: bg })}
                                            className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${draft.bloodGroup === bg
                                                    ? "bg-[#14D7B4]/15 border-[#14D7B4]/40 text-[#14D7B4]"
                                                    : "bg-white/[0.03] border-white/10 text-[#667788] hover:border-white/20"
                                                }`}
                                        >
                                            {bg}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-white text-sm py-3 px-4 bg-white/[0.02] border border-white/6 rounded-xl">
                                    {form.bloodGroup}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Address — full width */}
                    <div className="mt-4 space-y-1.5">
                        <label className="text-xs font-semibold text-[#8899AA] uppercase tracking-wider flex items-center gap-1.5">
                            <MapPin className="w-3 h-3" /> Address
                        </label>
                        {editing ? (
                            <textarea
                                rows={2}
                                value={draft.address}
                                onChange={e => setDraft({ ...draft, address: e.target.value })}
                                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#445566] outline-none focus:border-[#14D7B4]/50 focus:ring-2 focus:ring-[#14D7B4]/10 transition-all resize-none"
                            />
                        ) : (
                            <p className="text-white text-sm py-3 px-4 bg-white/[0.02] border border-white/6 rounded-xl">
                                {form.address}
                            </p>
                        )}
                    </div>

                    {/* Emergency contact */}
                    <div className="mt-4 space-y-1.5">
                        <label className="text-xs font-semibold text-[#8899AA] uppercase tracking-wider flex items-center gap-1.5">
                            <Phone className="w-3 h-3" /> Emergency contact
                        </label>
                        {editing ? (
                            <input
                                type="tel"
                                value={draft.emergencyContact}
                                onChange={e => setDraft({ ...draft, emergencyContact: e.target.value })}
                                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#14D7B4]/50 focus:ring-2 focus:ring-[#14D7B4]/10 transition-all"
                            />
                        ) : (
                            <p className="text-white text-sm py-3 px-4 bg-white/[0.02] border border-white/6 rounded-xl">
                                +91 {form.emergencyContact}
                            </p>
                        )}
                    </div>
                </div>

                {/* Preferences */}
                <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-6 mb-5">
                    <p className="text-xs font-semibold text-[#8899AA] uppercase tracking-wider mb-4">Preferences</p>
                    <div className="space-y-3">
                        {[
                            { icon: Bell, label: "Report ready notifications", sub: "SMS + Email when report is available" },
                            { icon: Bell, label: "Booking reminders", sub: "Reminder 1 hour before your slot" },
                            { icon: Shield, label: "Health tips & updates", sub: "Occasional health-related tips from the lab" },
                        ].map(({ icon: Icon, label, sub }) => (
                            <div key={label} className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                        <Icon className="w-3.5 h-3.5 text-[#667788]" strokeWidth={1.8} />
                                    </div>
                                    <div>
                                        <p className="text-white text-sm font-medium">{label}</p>
                                        <p className="text-[#445566] text-xs">{sub}</p>
                                    </div>
                                </div>
                                {/* Toggle */}
                                <button className="w-11 h-6 bg-[#14D7B4]/20 border border-[#14D7B4]/30 rounded-full relative transition-all">
                                    <div className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-[#14D7B4] shadow-sm" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Account actions */}
                <div className="bg-white/[0.02] border border-white/8 rounded-2xl overflow-hidden mb-6">
                    <p className="text-xs font-semibold text-[#8899AA] uppercase tracking-wider px-6 pt-5 pb-3">Account</p>
                    {[
                        { label: "Change password", sub: "Update your login password" },
                        { label: "Download my data", sub: "Get a copy of all your health records" },
                    ].map(({ label, sub }) => (
                        <button
                            key={label}
                            className="w-full flex items-center justify-between px-6 py-4 border-t border-white/6 hover:bg-white/[0.03] transition-all text-left"
                        >
                            <div>
                                <p className="text-white text-sm font-medium">{label}</p>
                                <p className="text-[#445566] text-xs">{sub}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[#334455]" />
                        </button>
                    ))}
                    <button className="w-full flex items-center justify-between px-6 py-4 border-t border-white/6 hover:bg-[#EF4444]/5 transition-all text-left group">
                        <div>
                            <p className="text-[#EF4444] text-sm font-medium flex items-center gap-2">
                                <LogOut className="w-3.5 h-3.5" /> Sign out
                            </p>
                            <p className="text-[#445566] text-xs">Sign out of this device</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}