"use client";

import { Loader2 } from "lucide-react";

interface Props {
    open: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({ open, title, description, confirmLabel = "Confirm", loading, onConfirm, onCancel }: Props) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
                <h3 className="text-slate-800 font-bold text-lg mb-2">{title}</h3>
                <p className="text-slate-500 text-sm mb-6">{description}</p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm rounded-xl py-2.5 transition-all">Cancel</button>
                    <button onClick={onConfirm} disabled={loading} className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-semibold text-sm rounded-xl py-2.5 transition-all">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
