"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAllPatients, getAllTests, getAllPackages, getAvailableSlots, createBooking } from "@/lib/api";
import { ArrowLeft, Search, Check, Plus, X, Loader2, CheckCircle, Home, Building2 } from "lucide-react";
import axios from "axios";

interface Patient { _id: string; patientId?: string; fullName: string; phone: string; email: string; }
interface Test { _id: string; testCode: string; testName: string; price: number; discountedPrice?: number; }
interface Pkg { _id: string; packageCode: string; packageName: string; discountedPrice?: number; originalPrice: number; }
interface Slot { slot: string; available: boolean; }

const STEPS = ["Patient", "Tests", "Schedule", "Confirm"];

export default function NewBookingPage() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [bookingId, setBookingId] = useState("");

    // Step 1 — patient
    const [patientSearch, setPatientSearch] = useState("");
    const [patients, setPatients] = useState<Patient[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [patientLoading, setPatientLoading] = useState(false);

    // Step 2 — tests/packages
    const [tests, setTests] = useState<Test[]>([]);
    const [packages, setPackages] = useState<Pkg[]>([]);
    const [testSearch, setTestSearch] = useState("");
    const [selectedTests, setSelectedTests] = useState<Test[]>([]);
    const [selectedPackages, setSelectedPackages] = useState<Pkg[]>([]);

    // Step 3 — schedule
    const [collectionType, setCollectionType] = useState<"walk-in" | "home-collection">("walk-in");
    const [address, setAddress] = useState({ street: "", city: "Nashik", state: "Maharashtra", pincode: "" });
    const [selectedDate, setSelectedDate] = useState("");
    const [slots, setSlots] = useState<Slot[]>([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState("");

    // Search patients
    useEffect(() => {
        if (!patientSearch.trim()) { setPatients([]); return; }
        const t = setTimeout(() => {
            setPatientLoading(true);
            getAllPatients({ search: patientSearch, limit: 8 })
                .then((res) => setPatients(res.data.patients || []))
                .catch(console.error)
                .finally(() => setPatientLoading(false));
        }, 350);
        return () => clearTimeout(t);
    }, [patientSearch]);

    // Load tests & packages
    useEffect(() => {
        getAllTests({ limit: 200 }).then((res) => setTests(res.data.tests || [])).catch(console.error);
        getAllPackages().then((res) => setPackages(res.data.packages || [])).catch(console.error);
    }, []);

    // Load slots when date changes
    useEffect(() => {
        if (!selectedDate) return;
        setSlotsLoading(true);
        getAvailableSlots(selectedDate)
            .then((res) => setSlots(res.data.slots || []))
            .catch(console.error)
            .finally(() => setSlotsLoading(false));
    }, [selectedDate]);

    const filteredTests = tests.filter((t) =>
        !selectedTests.some((s) => s._id === t._id) &&
        (t?.testName?.toLowerCase().includes(testSearch.toLowerCase()) || t?.testCode?.toLowerCase().includes(testSearch.toLowerCase()))
    );

    const totalAmount = selectedTests.reduce((s, t) => s + (t.discountedPrice ?? t.price), 0) +
        selectedPackages.reduce((s, p) => s + (p.discountedPrice ?? p.originalPrice), 0);

    const dates = Array.from({ length: 14 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() + i + 1); return d;
    });

    const canProceed = () => {
        if (step === 0) return !!selectedPatient;
        if (step === 1) return selectedTests.length > 0 || selectedPackages.length > 0;
        if (step === 2) return !!(selectedDate && selectedSlot && (collectionType === "walk-in" || address.street.trim()));
        return true;
    };

    const handleSubmit = async () => {
        if (!selectedPatient) return;

        // Pre-submit validation
        if (selectedTests.length === 0 && selectedPackages.length === 0) {
            setError("Please select at least one test or package.");
            return;
        }
        if (!collectionType) {
            setError("Please select a collection type.");
            return;
        }
        if (!selectedDate) {
            setError("Please select a date.");
            return;
        }
        const parsedDate = new Date(selectedDate);
        if (isNaN(parsedDate.getTime())) {
            setError("Please select a valid date.");
            return;
        }
        if (!selectedSlot) {
            setError("Please select a time slot.");
            return;
        }

        setSubmitting(true); setError("");
        try {
            const res = await createBooking({
                patientId: selectedPatient._id,
                patientName: selectedPatient.fullName,
                patientPhone: selectedPatient.phone || "",
                tests: selectedTests.map((t) => ({
                    testId: t._id,
                    testName: t.testName,
                    testCode: t.testCode,
                    price: t.discountedPrice ?? t.price,
                })),
                packages: selectedPackages.map((p) => ({
                    packageId: p._id,
                    packageName: p.packageName,
                    price: p.discountedPrice ?? p.originalPrice,
                })),
                collectionType,
                collectionAddress: collectionType === "home-collection" ? address : undefined,
                scheduledDate: parsedDate.toISOString(),
                scheduledTime: selectedSlot,
                paymentMethod: "cash",
            });
            setBookingId(res.data.booking?.bookingId || "");
            setSuccess(true);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || "Booking failed. Please check all fields.";
                setError(msg);
            } else {
                setError("Something went wrong.");
            }
        } finally { setSubmitting(false); }
    };

    const inputCls = "w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm placeholder:text-slate-300 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all";

    if (success) return (
        <main className="p-6 flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-sm">
                <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle className="w-8 h-8 text-teal-600" strokeWidth={1.8} />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-1">Booking Confirmed!</h2>
                {bookingId && <p className="text-teal-600 font-mono font-bold mb-4">{bookingId}</p>}
                <div className="flex gap-3 justify-center">
                    <Link href="/admin/bookings" className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-md shadow-teal-200">View Bookings</Link>
                    <button onClick={() => { setSuccess(false); setStep(0); setSelectedPatient(null); setSelectedTests([]); setSelectedPackages([]); setSelectedDate(""); setSelectedSlot(""); }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm px-5 py-2.5 rounded-xl transition-all">New Booking</button>
                </div>
            </div>
        </main>
    );

    return (
        <main className="p-6 max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
                <Link href="/admin/bookings" className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 shadow-sm transition-all">
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">New Booking</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Create a new appointment</p>
                </div>
            </div>

            {/* Step indicator */}
            <div className="flex items-center mb-6">
                {STEPS.map((s, i) => (
                    <div key={s} className="flex items-center flex-1 last:flex-none">
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < step ? "bg-teal-500 text-white" : i === step ? "bg-teal-600 text-white ring-4 ring-teal-100" : "bg-slate-100 text-slate-400"}`}>
                                {i < step ? <Check className="w-4 h-4" strokeWidth={2.5} /> : i + 1}
                            </div>
                            <span className={`text-xs font-medium hidden sm:block ${i === step ? "text-slate-800" : i < step ? "text-teal-600" : "text-slate-400"}`}>{s}</span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className="flex-1 mx-3 h-px bg-slate-200 overflow-hidden">
                                <div className="h-full bg-teal-500 transition-all duration-500" style={{ width: i < step ? "100%" : "0%" }} />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 mb-5">

                {/* STEP 0 — Select Patient */}
                {step === 0 && (
                    <div>
                        <h2 className="text-base font-bold text-slate-800 mb-4">Search Patient</h2>
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input value={patientSearch} onChange={(e) => setPatientSearch(e.target.value)}
                                placeholder="Search by name, phone, or patient ID..."
                                className={`${inputCls} pl-9`} />
                        </div>
                        {patientLoading && <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 text-teal-500 animate-spin" /></div>}
                        {patients.length > 0 && (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {patients.map((p) => (
                                    <button key={p._id} onClick={() => { setSelectedPatient(p); setPatientSearch(""); setPatients([]); }}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${selectedPatient?._id === p._id ? "bg-teal-50 border-teal-300" : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50"}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">{p.fullName[0]}</div>
                                            <div>
                                                <p className="text-slate-700 text-sm font-semibold">{p.fullName}</p>
                                                <p className="text-slate-400 text-xs">{p.phone} {p.patientId ? `· ${p.patientId}` : ""}</p>
                                            </div>
                                        </div>
                                        {selectedPatient?._id === p._id && <Check className="w-4 h-4 text-teal-500" />}
                                    </button>
                                ))}
                            </div>
                        )}
                        {selectedPatient && (
                            <div className="mt-4 flex items-center justify-between bg-teal-50 border border-teal-200 rounded-xl px-4 py-3">
                                <div>
                                    <p className="text-slate-700 text-sm font-semibold">{selectedPatient.fullName}</p>
                                    <p className="text-slate-400 text-xs">{selectedPatient.phone}</p>
                                </div>
                                <button onClick={() => setSelectedPatient(null)} className="text-slate-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 1 — Select Tests/Packages */}
                {step === 1 && (
                    <div>
                        <h2 className="text-base font-bold text-slate-800 mb-4">Select Tests & Packages</h2>
                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input value={testSearch} onChange={(e) => setTestSearch(e.target.value)} placeholder="Search tests..."
                                className={`${inputCls} pl-9`} />
                        </div>
                        <div className="space-y-1.5 max-h-52 overflow-y-auto mb-4">
                            {filteredTests.slice(0, 12).map((t) => (
                                <button key={t._id} onClick={() => setSelectedTests((prev) => [...prev, t])}
                                    className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-teal-200 hover:bg-teal-50 text-left transition-all">
                                    <div>
                                        <p className="text-slate-700 text-sm font-medium">{t.testName}</p>
                                        <p className="text-slate-400 text-xs">{t.testCode}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-teal-600 font-bold text-sm">₹{t.discountedPrice ?? t.price}</span>
                                        <Plus className="w-4 h-4 text-teal-500" />
                                    </div>
                                </button>
                            ))}
                        </div>
                        {packages.length > 0 && (
                            <>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Packages</p>
                                <div className="space-y-1.5 max-h-36 overflow-y-auto mb-4">
                                    {packages.filter((p) => !selectedPackages.some((s) => s._id === p._id)).map((p) => (
                                        <button key={p._id} onClick={() => setSelectedPackages((prev) => [...prev, p])}
                                            className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50 text-left transition-all">
                                            <div>
                                                <p className="text-slate-700 text-sm font-medium">{p.packageName}</p>
                                                <p className="text-slate-400 text-xs">{p.packageCode}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-violet-600 font-bold text-sm">₹{p.discountedPrice ?? p.originalPrice}</span>
                                                <Plus className="w-4 h-4 text-violet-500" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                        {(selectedTests.length > 0 || selectedPackages.length > 0) && (
                            <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 space-y-1.5">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Selected</p>
                                {selectedTests.map((t) => (
                                    <div key={t._id} className="flex items-center justify-between">
                                        <span className="text-slate-700 text-sm">{t.testName}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-teal-600 font-bold text-sm">₹{t.discountedPrice ?? t.price}</span>
                                            <button onClick={() => setSelectedTests((prev) => prev.filter((s) => s._id !== t._id))} className="text-slate-400 hover:text-red-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
                                        </div>
                                    </div>
                                ))}
                                {selectedPackages.map((p) => (
                                    <div key={p._id} className="flex items-center justify-between">
                                        <span className="text-slate-700 text-sm">{p.packageName}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-violet-600 font-bold text-sm">₹{p.discountedPrice ?? p.originalPrice}</span>
                                            <button onClick={() => setSelectedPackages((prev) => prev.filter((s) => s._id !== p._id))} className="text-slate-400 hover:text-red-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
                                        </div>
                                    </div>
                                ))}
                                <div className="border-t border-teal-200 pt-2 flex justify-between">
                                    <span className="text-slate-700 font-bold text-sm">Total</span>
                                    <span className="text-teal-600 font-bold">₹{totalAmount}</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 2 — Schedule */}
                {step === 2 && (
                    <div>
                        <h2 className="text-base font-bold text-slate-800 mb-4">Schedule Appointment</h2>
                        <div className="grid grid-cols-2 gap-3 mb-5">
                            {(["walk-in", "home-collection"] as const).map((type) => {
                                const Icon = type === "walk-in" ? Building2 : Home;
                                return (
                                    <button key={type} onClick={() => setCollectionType(type)}
                                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${collectionType === type ? "bg-teal-50 border-teal-300" : "bg-white border-slate-100 hover:border-slate-200"}`}>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${collectionType === type ? "bg-teal-100" : "bg-slate-50"}`}>
                                            <Icon className={`w-4 h-4 ${collectionType === type ? "text-teal-600" : "text-slate-400"}`} strokeWidth={1.8} />
                                        </div>
                                        <p className={`text-sm font-semibold ${collectionType === type ? "text-teal-700" : "text-slate-600"}`}>{type === "walk-in" ? "Lab Visit" : "Home Collection"}</p>
                                    </button>
                                );
                            })}
                        </div>
                        {collectionType === "home-collection" && (
                            <div className="space-y-2 mb-5">
                                <input value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} placeholder="Street / Area" className={inputCls} />
                                <div className="grid grid-cols-2 gap-2">
                                    <input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} placeholder="City" className={inputCls} />
                                    <input value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} placeholder="Pincode" className={inputCls} />
                                </div>
                            </div>
                        )}
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Select Date</p>
                        <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
                            {dates.map((d) => {
                                const val = d.toISOString().split("T")[0];
                                const sel = selectedDate === val;
                                return (
                                    <button key={val} onClick={() => { setSelectedDate(val); setSelectedSlot(""); }}
                                        className={`flex flex-col items-center min-w-[52px] py-2.5 px-2 rounded-xl border transition-all ${sel ? "bg-teal-600 border-teal-600" : "bg-white border-slate-100 hover:border-slate-200"}`}>
                                        <span className={`text-[10px] font-medium uppercase ${sel ? "text-teal-100" : "text-slate-400"}`}>{d.toLocaleDateString("en", { weekday: "short" })}</span>
                                        <span className={`text-lg font-bold my-0.5 ${sel ? "text-white" : "text-slate-700"}`}>{d.getDate()}</span>
                                        <span className={`text-[10px] ${sel ? "text-teal-100" : "text-slate-400"}`}>{d.toLocaleDateString("en", { month: "short" })}</span>
                                    </button>
                                );
                            })}
                        </div>
                        {selectedDate && (
                            <>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Select Time Slot</p>
                                {slotsLoading ? <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 text-teal-500 animate-spin" /></div> : (
                                    <div className="grid grid-cols-4 gap-2">
                                        {slots.map((s) => (
                                            <button key={s.slot} disabled={!s.available} onClick={() => setSelectedSlot(s.slot)}
                                                className={`py-2 px-1 rounded-lg text-xs font-medium text-center transition-all ${!s.available ? "bg-slate-50 border border-slate-100 text-slate-300 cursor-not-allowed" : selectedSlot === s.slot ? "bg-teal-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-teal-300"}`}>
                                                {s.slot}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* STEP 3 — Confirm */}
                {step === 3 && selectedPatient && (
                    <div>
                        <h2 className="text-base font-bold text-slate-800 mb-4">Confirm Booking</h2>
                        <div className="space-y-3">
                            <div className="bg-slate-50 rounded-xl p-4">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Patient</p>
                                <p className="text-slate-700 font-semibold">{selectedPatient.fullName}</p>
                                <p className="text-slate-400 text-xs">{selectedPatient.phone}</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tests & Packages</p>
                                {selectedTests.map((t) => <div key={t._id} className="flex justify-between text-sm"><span className="text-slate-600">{t.testName}</span><span className="text-teal-600 font-bold">₹{t.discountedPrice ?? t.price}</span></div>)}
                                {selectedPackages.map((p) => <div key={p._id} className="flex justify-between text-sm"><span className="text-slate-600">{p.packageName}</span><span className="text-violet-600 font-bold">₹{p.discountedPrice ?? p.originalPrice}</span></div>)}
                                <div className="border-t border-slate-200 mt-2 pt-2 flex justify-between font-bold text-sm"><span className="text-slate-700">Total</span><span className="text-teal-600">₹{totalAmount}</span></div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
                                <div><p className="text-slate-400 text-xs">Date</p><p className="text-slate-700 font-semibold">{selectedDate}</p></div>
                                <div><p className="text-slate-400 text-xs">Time</p><p className="text-slate-700 font-semibold">{selectedSlot}</p></div>
                                <div><p className="text-slate-400 text-xs">Collection</p><p className="text-slate-700 font-semibold capitalize">{collectionType.replace("-", " ")}</p></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-3">
                {step > 0 && (
                    <button onClick={() => setStep(step - 1)} className="flex-1 bg-white border border-slate-200 rounded-xl py-3 text-slate-500 hover:text-slate-700 text-sm transition-all flex items-center justify-center gap-2 shadow-sm">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                )}
                <button
                    onClick={step < 3 ? () => setStep(step + 1) : handleSubmit}
                    disabled={!canProceed() || submitting}
                    className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl py-3 transition-all shadow-lg shadow-teal-200"
                >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : step < 3 ? "Continue" : "Confirm Booking"}
                </button>
            </div>
        </main>
    );
}
