"use client";

import { useState } from "react";
import { updateProfile } from "@/lib/api";
import { X, Loader2, User, Phone, Calendar, MapPin, Droplet } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";

const schema = z.object({
    phone: z.string().regex(/^\d{10}$/, "Enter valid 10-digit phone number"),
    dateOfBirth: z.string().optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
    bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).optional(),
    street: z.string().min(3, "Enter your street/area").optional(),
    city: z.string().min(2, "Enter your city").optional(),
    pincode: z.string().regex(/^\d{6}$/, "Enter valid 6-digit pincode").optional(),
});

type FormData = z.infer<typeof schema>;

interface ProfileCompletionModalProps {
    isOpen: boolean;
    onComplete: () => void;
    currentPhone?: string;
}

export default function ProfileCompletionModal({ isOpen, onComplete, currentPhone }: ProfileCompletionModalProps) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            phone: currentPhone?.startsWith("GOOGLE-") ? "" : currentPhone || "",
        }
    });

    const onSubmit = async (data: FormData) => {
        setSaving(true);
        setError("");
        try {
            await updateProfile({
                phone: data.phone,
                dateOfBirth: data.dateOfBirth,
                gender: data.gender,
                bloodGroup: data.bloodGroup,
                address: {
                    street: data.street,
                    city: data.city,
                    pincode: data.pincode,
                }
            });
            onComplete();
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || "Failed to update profile");
            } else {
                setError("Something went wrong");
            }
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all";
    const labelCls = "text-xs font-semibold text-slate-500 tracking-wide uppercase flex items-center gap-1.5";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                            <User className="w-5 h-5 text-teal-600" strokeWidth={2} />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-bold text-slate-800">Complete Your Profile</h2>
                            <p className="text-slate-500 text-xs">Please provide your details to continue</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
                    {error && (
                        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className={labelCls}>
                            <Phone className="w-3.5 h-3.5" />
                            Phone Number *
                        </label>
                        <input
                            type="tel"
                            placeholder="Enter 10-digit phone number"
                            {...register("phone")}
                            className={inputCls}
                            maxLength={10}
                        />
                        {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className={labelCls}>
                                <Calendar className="w-3.5 h-3.5" />
                                Date of Birth
                            </label>
                            <input
                                type="date"
                                {...register("dateOfBirth")}
                                className={inputCls}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className={labelCls}>
                                <User className="w-3.5 h-3.5" />
                                Gender
                            </label>
                            <select {...register("gender")} className={inputCls}>
                                <option value="">Select</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className={labelCls}>
                            <Droplet className="w-3.5 h-3.5" />
                            Blood Group
                        </label>
                        <select {...register("bloodGroup")} className={inputCls}>
                            <option value="">Select</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                        </select>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                        <label className={labelCls}>
                            <MapPin className="w-3.5 h-3.5" />
                            Address (Optional)
                        </label>
                    </div>

                    <div className="space-y-1.5">
                        <input
                            type="text"
                            placeholder="Street / Area"
                            {...register("street")}
                            className={inputCls}
                        />
                        {errors.street && <p className="text-red-500 text-xs">{errors.street.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <input
                                type="text"
                                placeholder="City"
                                {...register("city")}
                                className={inputCls}
                            />
                            {errors.city && <p className="text-red-500 text-xs">{errors.city.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <input
                                type="text"
                                placeholder="Pincode"
                                {...register("pincode")}
                                maxLength={6}
                                className={inputCls}
                            />
                            {errors.pincode && <p className="text-red-500 text-xs">{errors.pincode.message}</p>}
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl py-3.5 transition-all shadow-lg shadow-teal-200"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Complete Profile"
                            )}
                        </button>
                    </div>

                    <p className="text-center text-slate-400 text-xs">
                        * Required fields must be filled to continue
                    </p>
                </form>
            </div>
        </div>
    );
}
