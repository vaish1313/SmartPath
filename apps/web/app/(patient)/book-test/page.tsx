"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Search, ChevronRight, Check, FlaskConical,
    Clock, Calendar, MapPin, Home, Building2,
    ArrowLeft, ArrowRight, Loader2, X
} from "lucide-react";

/* ── Types ── */
interface Test {
    id: string;
    name: string;
    category: string;
    price: number;
    duration: string;
    preparation: string;
}

interface Slot {
    id: string;
    time: string;
    available: boolean;
}

/* ── Mock data (replace with API calls) ── */
const MOCK_TESTS: Test[] = [
    { id: "1", name: "Complete Blood Count (CBC)", category: "Haematology", price: 299, duration: "24 hrs", preparation: "No fasting required" },
    { id: "2", name: "Lipid Profile", category: "Biochemistry", price: 499, duration: "24 hrs", preparation: "12 hrs fasting required" },
    { id: "3", name: "HbA1c", category: "Diabetes", price: 349, duration: "24 hrs", preparation: "No fasting required" },
    { id: "4", name: "Thyroid Panel (T3, T4, TSH)", category: "Endocrinology", price: 599, duration: "24 hrs", preparation: "Early morning sample preferred" },
    { id: "5", name: "Vitamin D Total", category: "Vitamins", price: 799, duration: "48 hrs", preparation: "No fasting required" },
    { id: "6", name: "Liver Function Test (LFT)", category: "Biochemistry", price: 449, duration: "24 hrs", preparation: "No fasting required" },
    { id: "7", name: "Kidney Function Test (KFT)", category: "Biochemistry", price: 399, duration: "24 hrs", preparation: "No fasting required" },
    { id: "8", name: "Urine Routine & Microscopy", category: "Urology", price: 199, duration: "6 hrs", preparation: "First morning urine sample" },
    { id: "9", name: "Blood Sugar Fasting", category: "Diabetes", price: 149, duration: "6 hrs", preparation: "8-10 hrs fasting required" },
    { id: "10", name: "Vitamin B12", category: "Vitamins", price: 699, duration: "48 hrs", preparation: "No fasting required" },
];

const SLOTS: Slot[] = [
    { id: "1", time: "7:00 AM", available: true },
    { id: "2", time: "7:30 AM", available: true },
    { id: "3", time: "8:00 AM", available: false },
    { id: "4", time: "8:30 AM", available: true },
    { id: "5", time: "9:00 AM", available: true },
    { id: "6", time: "9:30 AM", available: true },
    { id: "7", time: "10:00 AM", available: false },
    { id: "8", time: "10:30 AM", available: true },
    { id: "9", time: "11:00 AM", available: true },
    { id: "10", time: "11:30 AM", available: false },
    { id: "11", time: "2:00 PM", available: true },
    { id: "12", time: "2:30 PM", available: true },
    { id: "13", time: "3:00 PM", available: true },
    { id: "14", time: "3:30 PM", available: false },
    { id: "15", time: "4:00 PM", available: true },
    { id: "16", time: "4:30 PM", available: true },
];

const STEPS = ["Select Tests", "Schedule", "Confirm"];

/* ── Step indicator ── */
function StepIndicator({ current }: { current: number }) {
    return (
        <div className="flex items-center mb-10">
            {STEPS.map((s, i) => (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                    <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${i < current ? "bg-[#14D7B4] text-[#060B14]"
                                : i === current ? "bg-gradient-to-br from-[#14D7B4] to-[#0EA5E9] text-[#060B14]"
                                    : "bg-white/8 text-[#445566]"
                            }`}>
                            {i < current ? <Check className="w-4 h-4" strokeWidth={2.5} /> : i + 1}
                        </div>
                        <span className={`text-sm font-medium hidden sm:block transition-colors ${i === current ? "text-white" : i < current ? "text-[#14D7B4]" : "text-[#445566]"
                            }`}>{s}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                        <div className="flex-1 mx-4 h-px bg-white/8 relative overflow-hidden">
                            <div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#14D7B4] to-[#0EA5E9] transition-all duration-500"
                                style={{ width: i < current ? "100%" : "0%" }}
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

/* ── Step 1: Test selector ── */
function TestSelector({
    selected, onToggle
}: {
    selected: Test[];
    onToggle: (t: Test) => void;
}) {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");

    const categories = ["All", ...Array.from(new Set(MOCK_TESTS.map(t => t.category)))];
    const filtered = MOCK_TESTS.filter(t => {
        const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
        const matchCat = activeCategory === "All" || t.category === activeCategory;
        return matchSearch && matchCat;
    });

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-1">Select your tests</h2>
                <p className="text-[#667788] text-sm">Choose one or more tests. You can add multiple.</p>
            </div>

            {/* Search */}
            <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#445566]" />
                <input
                    type="text"
                    placeholder="Search tests..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder:text-[#445566] outline-none focus:border-[#14D7B4]/50 focus:ring-2 focus:ring-[#14D7B4]/10 transition-all"
                />
            </div>

            {/* Category pills */}
            <div className="flex gap-2 flex-wrap mb-5">
                {categories.map(c => (
                    <button
                        key={c}
                        onClick={() => setActiveCategory(c)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${activeCategory === c
                                ? "bg-[#14D7B4]/15 border-[#14D7B4]/40 text-[#14D7B4]"
                                : "bg-white/[0.03] border-white/10 text-[#667788] hover:border-white/20"
                            }`}
                    >
                        {c}
                    </button>
                ))}
            </div>

            {/* Test list */}
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
                {filtered.map(test => {
                    const isSelected = selected.some(s => s.id === test.id);
                    return (
                        <button
                            key={test.id}
                            onClick={() => onToggle(test)}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-200 ${isSelected
                                    ? "bg-[#14D7B4]/8 border-[#14D7B4]/30"
                                    : "bg-white/[0.02] border-white/8 hover:border-white/16 hover:bg-white/[0.04]"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? "bg-[#14D7B4] border-[#14D7B4]" : "border-white/20"
                                    }`}>
                                    {isSelected && <Check className="w-3 h-3 text-[#060B14]" strokeWidth={3} />}
                                </div>
                                <div>
                                    <p className="text-white text-sm font-medium">{test.name}</p>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        <span className="text-[#445566] text-xs">{test.category}</span>
                                        <span className="text-[#334455] text-xs">·</span>
                                        <span className="text-[#445566] text-xs flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {test.duration}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0 ml-4">
                                <p className="text-[#14D7B4] font-bold text-sm">₹{test.price}</p>
                                <p className="text-[#445566] text-[10px] mt-0.5">{test.preparation}</p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

/* ── Step 2: Schedule ── */
function ScheduleStep({
    collectionType, setCollectionType,
    selectedDate, setSelectedDate,
    selectedSlot, setSelectedSlot,
    address, setAddress,
}: {
    collectionType: "lab" | "home";
    setCollectionType: (v: "lab" | "home") => void;
    selectedDate: string;
    setSelectedDate: (v: string) => void;
    selectedSlot: string;
    setSelectedSlot: (v: string) => void;
    address: string;
    setAddress: (v: string) => void;
}) {
    // Next 7 days
    const dates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i + 1);
        return d;
    });

    const formatDate = (d: Date) => d.toISOString().split("T")[0];
    const dayLabel = (d: Date) => d.toLocaleDateString("en-IN", { weekday: "short" });
    const dateLabel = (d: Date) => d.getDate();
    const monthLabel = (d: Date) => d.toLocaleDateString("en-IN", { month: "short" });

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-1">Schedule your visit</h2>
                <p className="text-[#667788] text-sm">Choose collection type, date and time slot.</p>
            </div>

            {/* Collection type */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                {([
                    { type: "lab", icon: Building2, label: "Lab Visit", sub: "Visit our Nashik centre" },
                    { type: "home", icon: Home, label: "Home Collection", sub: "Extra ₹100 charge" },
                ] as const).map(({ type, icon: Icon, label, sub }) => (
                    <button
                        key={type}
                        onClick={() => setCollectionType(type)}
                        className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${collectionType === type
                                ? "bg-[#14D7B4]/8 border-[#14D7B4]/30"
                                : "bg-white/[0.02] border-white/8 hover:border-white/16"
                            }`}
                    >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${collectionType === type ? "bg-[#14D7B4]/15" : "bg-white/5"
                            }`}>
                            <Icon className={`w-4 h-4 ${collectionType === type ? "text-[#14D7B4]" : "text-[#667788]"}`} strokeWidth={1.8} />
                        </div>
                        <div>
                            <p className={`text-sm font-medium ${collectionType === type ? "text-white" : "text-[#8899AA]"}`}>{label}</p>
                            <p className="text-[#445566] text-xs mt-0.5">{sub}</p>
                        </div>
                    </button>
                ))}
            </div>

            {/* Date picker */}
            <div className="mb-6">
                <p className="text-xs font-semibold text-[#8899AA] uppercase tracking-wider mb-3">Select date</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {dates.map(d => {
                        const val = formatDate(d);
                        const isSelected = selectedDate === val;
                        return (
                            <button
                                key={val}
                                onClick={() => setSelectedDate(val)}
                                className={`flex flex-col items-center min-w-[58px] py-3 px-2 rounded-xl border transition-all ${isSelected
                                        ? "bg-gradient-to-b from-[#14D7B4] to-[#0EA5E9] border-transparent"
                                        : "bg-white/[0.02] border-white/8 hover:border-white/16"
                                    }`}
                            >
                                <span className={`text-[10px] font-medium uppercase ${isSelected ? "text-[#060B14]" : "text-[#556677]"}`}>
                                    {dayLabel(d)}
                                </span>
                                <span className={`text-xl font-bold my-0.5 ${isSelected ? "text-[#060B14]" : "text-white"}`}>
                                    {dateLabel(d)}
                                </span>
                                <span className={`text-[10px] ${isSelected ? "text-[#060B14]/70" : "text-[#445566]"}`}>
                                    {monthLabel(d)}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Time slots */}
            {selectedDate && (
                <div className="mb-6">
                    <p className="text-xs font-semibold text-[#8899AA] uppercase tracking-wider mb-3">Select time slot</p>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {SLOTS.map(slot => (
                            <button
                                key={slot.id}
                                disabled={!slot.available}
                                onClick={() => setSelectedSlot(slot.id)}
                                className={`py-2 px-1 rounded-lg text-xs font-medium text-center transition-all ${!slot.available
                                        ? "bg-white/[0.02] border border-white/5 text-[#334455] cursor-not-allowed"
                                        : selectedSlot === slot.id
                                            ? "bg-gradient-to-r from-[#14D7B4] to-[#0EA5E9] text-[#060B14] border-transparent"
                                            : "bg-white/[0.04] border border-white/10 text-[#8899AA] hover:border-[#14D7B4]/30 hover:text-white"
                                    }`}
                            >
                                {slot.time}
                            </button>
                        ))}
                    </div>
                    <p className="text-[#334455] text-xs mt-2">Greyed slots are unavailable</p>
                </div>
            )}

            {/* Address (home only) */}
            {collectionType === "home" && (
                <div>
                    <p className="text-xs font-semibold text-[#8899AA] uppercase tracking-wider mb-3">
                        <MapPin className="w-3 h-3 inline mr-1" />Collection address
                    </p>
                    <textarea
                        rows={3}
                        placeholder="Flat / House No., Street, Area, Nashik – 422001"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#445566] outline-none focus:border-[#14D7B4]/50 focus:ring-2 focus:ring-[#14D7B4]/10 transition-all resize-none"
                    />
                </div>
            )}
        </div>
    );
}

/* ── Step 3: Confirm ── */
function ConfirmStep({
    selectedTests, collectionType, selectedDate, selectedSlot, address
}: {
    selectedTests: Test[];
    collectionType: "lab" | "home";
    selectedDate: string;
    selectedSlot: string;
    address: string;
}) {
    const slot = SLOTS.find(s => s.id === selectedSlot);
    const subtotal = selectedTests.reduce((sum, t) => sum + t.price, 0);
    const homeCharge = collectionType === "home" ? 100 : 0;
    const total = subtotal + homeCharge;

    const formatDisplayDate = (d: string) => {
        if (!d) return "—";
        return new Date(d).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-1">Confirm booking</h2>
                <p className="text-[#667788] text-sm">Review your details before confirming.</p>
            </div>

            {/* Tests summary */}
            <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 mb-4">
                <p className="text-xs font-semibold text-[#8899AA] uppercase tracking-wider mb-3">Tests selected</p>
                <div className="space-y-2">
                    {selectedTests.map(t => (
                        <div key={t.id} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <FlaskConical className="w-3.5 h-3.5 text-[#14D7B4]" strokeWidth={1.8} />
                                <span className="text-white text-sm">{t.name}</span>
                            </div>
                            <span className="text-[#14D7B4] text-sm font-semibold">₹{t.price}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Schedule summary */}
            <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 mb-4">
                <p className="text-xs font-semibold text-[#8899AA] uppercase tracking-wider mb-3">Schedule</p>
                <div className="space-y-2.5">
                    <div className="flex justify-between">
                        <span className="text-[#667788] text-sm">Date</span>
                        <span className="text-white text-sm">{formatDisplayDate(selectedDate)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-[#667788] text-sm">Time</span>
                        <span className="text-white text-sm">{slot?.time || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-[#667788] text-sm">Collection</span>
                        <span className="text-white text-sm capitalize">{collectionType === "lab" ? "Lab Visit" : "Home Collection"}</span>
                    </div>
                    {collectionType === "home" && address && (
                        <div className="flex justify-between gap-4">
                            <span className="text-[#667788] text-sm">Address</span>
                            <span className="text-white text-sm text-right max-w-[240px]">{address}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Price breakdown */}
            <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
                <p className="text-xs font-semibold text-[#8899AA] uppercase tracking-wider mb-3">Price breakdown</p>
                <div className="space-y-2">
                    {selectedTests.map(t => (
                        <div key={t.id} className="flex justify-between">
                            <span className="text-[#667788] text-sm">{t.name}</span>
                            <span className="text-[#AABBCC] text-sm">₹{t.price}</span>
                        </div>
                    ))}
                    {collectionType === "home" && (
                        <div className="flex justify-between">
                            <span className="text-[#667788] text-sm">Home collection charge</span>
                            <span className="text-[#AABBCC] text-sm">₹100</span>
                        </div>
                    )}
                    <div className="border-t border-white/8 pt-2 mt-2 flex justify-between">
                        <span className="text-white font-semibold">Total</span>
                        <span className="text-[#14D7B4] font-bold text-lg">₹{total}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Main Page ── */
export default function BookTestPage() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [selectedTests, setSelectedTests] = useState<Test[]>([]);
    const [collectionType, setCollectionType] = useState<"lab" | "home">("lab");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedSlot, setSelectedSlot] = useState("");
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const toggleTest = (test: Test) => {
        setSelectedTests(prev =>
            prev.some(t => t.id === test.id)
                ? prev.filter(t => t.id !== test.id)
                : [...prev, test]
        );
    };

    const canProceed = () => {
        if (step === 0) return selectedTests.length > 0;
        if (step === 1) return selectedDate && selectedSlot && (collectionType === "lab" || address.trim().length > 5);
        return true;
    };

    const handleNext = () => {
        if (step < 2) setStep(step + 1);
        else handleConfirm();
    };

    const handleConfirm = async () => {
        setLoading(true);
        // TODO: POST /api/bookings/create with { testIds, date, slotId, collectionType, address }
        await new Promise(r => setTimeout(r, 1500));
        setLoading(false);
        setSuccess(true);
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#060B14] flex items-center justify-center px-6">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 rounded-full bg-[#14D7B4]/15 border border-[#14D7B4]/30 flex items-center justify-center mx-auto mb-6">
                        <Check className="w-10 h-10 text-[#14D7B4]" strokeWidth={2} />
                    </div>
                    <h2 className="text-2xl font-semibold text-white mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>
                        Booking confirmed!
                    </h2>
                    <p className="text-[#667788] mb-8">
                        Your booking has been placed. You'll receive a confirmation on your registered mobile number.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => router.push("/bookings")}
                            className="flex items-center gap-2 bg-gradient-to-r from-[#14D7B4] to-[#0EA5E9] text-[#060B14] font-bold text-sm px-6 py-3 rounded-xl hover:opacity-90 transition-all"
                        >
                            View my bookings
                        </button>
                        <button
                            onClick={() => { setSuccess(false); setStep(0); setSelectedTests([]); setSelectedDate(""); setSelectedSlot(""); }}
                            className="bg-white/[0.06] border border-white/10 text-white text-sm px-6 py-3 rounded-xl hover:bg-white/10 transition-all"
                        >
                            Book another
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#060B14]">
            {/* Grid bg */}
            <div
                className="fixed inset-0 pointer-events-none opacity-40"
                style={{
                    backgroundImage: "linear-gradient(rgba(20,215,180,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(20,215,180,0.03) 1px,transparent 1px)",
                    backgroundSize: "48px 48px",
                }}
            />

            <div className="relative z-10 max-w-2xl mx-auto px-6 py-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <button
                        onClick={() => step > 0 ? setStep(step - 1) : router.back()}
                        className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-[#8899AA] hover:text-white hover:border-white/20 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-white font-semibold text-lg">Book a Test</h1>
                        <p className="text-[#556677] text-xs">Prathamesh Advanced Diagnostic Center</p>
                    </div>
                </div>

                {/* Step indicator */}
                <StepIndicator current={step} />

                {/* Cart strip (step 0 only) */}
                {step === 0 && selectedTests.length > 0 && (
                    <div className="bg-[#0D1F1A] border border-[#14D7B4]/20 rounded-xl px-4 py-3 mb-5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FlaskConical className="w-4 h-4 text-[#14D7B4]" strokeWidth={1.8} />
                            <span className="text-white text-sm font-medium">{selectedTests.length} test{selectedTests.length > 1 ? "s" : ""} selected</span>
                            <span className="text-[#445566] text-xs">·</span>
                            <span className="text-[#14D7B4] text-sm font-bold">
                                ₹{selectedTests.reduce((s, t) => s + t.price, 0)}
                            </span>
                        </div>
                        <div className="flex gap-1">
                            {selectedTests.slice(0, 3).map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => toggleTest(t)}
                                    className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-[10px] text-[#8899AA] hover:text-white"
                                >
                                    {t.name.split(" ")[0]} <X className="w-2.5 h-2.5" />
                                </button>
                            ))}
                            {selectedTests.length > 3 && (
                                <span className="text-[#445566] text-xs self-center">+{selectedTests.length - 3}</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Step content */}
                <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-6 mb-6">
                    {step === 0 && <TestSelector selected={selectedTests} onToggle={toggleTest} />}
                    {step === 1 && (
                        <ScheduleStep
                            collectionType={collectionType} setCollectionType={setCollectionType}
                            selectedDate={selectedDate} setSelectedDate={setSelectedDate}
                            selectedSlot={selectedSlot} setSelectedSlot={setSelectedSlot}
                            address={address} setAddress={setAddress}
                        />
                    )}
                    {step === 2 && (
                        <ConfirmStep
                            selectedTests={selectedTests}
                            collectionType={collectionType}
                            selectedDate={selectedDate}
                            selectedSlot={selectedSlot}
                            address={address}
                        />
                    )}
                </div>

                {/* Navigation */}
                <div className="flex gap-3">
                    {step > 0 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl py-3.5 text-[#8899AA] hover:text-white hover:border-white/20 text-sm transition-all flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                    )}
                    <button
                        onClick={handleNext}
                        disabled={!canProceed() || loading}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#14D7B4] to-[#0EA5E9] disabled:opacity-40 disabled:cursor-not-allowed text-[#060B14] font-bold text-sm rounded-xl py-3.5 hover:opacity-90 transition-all shadow-lg shadow-[#14D7B4]/20 group"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : step === 2 ? (
                            "Confirm Booking"
                        ) : (
                            <>Continue <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}