"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slots = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];

interface Props {
    selectedDate: string;
    selectedSlot: string;
    onDateChange: (d: string) => void;
    onSlotChange: (s: string) => void;
}

export default function SlotPicker({ selectedDate, selectedSlot, onDateChange, onSlotChange }: Props) {
    const today = new Date();
    const [offset, setOffset] = useState(0);

    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() + i + offset);
        return d;
    });

    return (
        <div className="space-y-5">
            {/* Date picker */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <p className="text-slate-700 font-semibold text-sm">Select Date</p>
                    <div className="flex gap-1">
                        <button onClick={() => setOffset(Math.max(0, offset - 7))} disabled={offset === 0} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-all">
                            <ChevronLeft className="w-4 h-4 text-slate-500" />
                        </button>
                        <button onClick={() => setOffset(offset + 7)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-all">
                            <ChevronRight className="w-4 h-4 text-slate-500" />
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {days.map((d) => {
                        const key = d.toISOString().split("T")[0];
                        const sel = selectedDate === key;
                        return (
                            <button key={key} onClick={() => onDateChange(key)} className={`flex flex-col items-center py-2.5 rounded-xl text-xs font-semibold transition-all ${sel ? "bg-teal-600 text-white shadow-md shadow-teal-200" : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100"}`}>
                                <span className="text-[10px] opacity-70">{d.toLocaleDateString("en", { weekday: "short" })}</span>
                                <span className="text-sm font-bold">{d.getDate()}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Time slots */}
            <div>
                <p className="text-slate-700 font-semibold text-sm mb-3">Select Time</p>
                <div className="grid grid-cols-3 gap-2">
                    {slots.map((s) => (
                        <button key={s} onClick={() => onSlotChange(s)} className={`py-2.5 rounded-xl text-xs font-semibold transition-all ${selectedSlot === s ? "bg-teal-600 text-white shadow-md shadow-teal-200" : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100"}`}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
