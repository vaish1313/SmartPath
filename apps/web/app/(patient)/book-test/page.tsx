"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAllTests, getAvailableSlots, createBooking } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Search, Check, FlaskConical, Clock, Calendar, Home, Building2, ArrowLeft, ArrowRight, Loader2, X, MapPin, Upload } from "lucide-react";
import axios from "axios";
import PageLoader from "@/components/shared/PageLoader";

interface Test { _id: string; testName: string; testCode: string; category: string; price: number; turnaroundTime: number; sampleType: string; }
interface Slot { slot: string; available: boolean; }

const STEPS = ["Select Tests", "Schedule", "Confirm"];

export default function BookTestPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const user = useAuthStore((s) => s.user);
    const [step, setStep] = useState(0);

    // Prescription upload state
    const prescriptionRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [rxFile, setRxFile] = useState<File | null>(null);
    const [rxPreview, setRxPreview] = useState<string | null>(null);
    const [rxScanning, setRxScanning] = useState(false);
    const [rxMatched, setRxMatched] = useState<string | null>(null);
    const [rxUnmatched, setRxUnmatched] = useState<string[]>([]);
    const [rxStructuredData, setRxStructuredData] = useState<any>(null);

    const [tests, setTests] = useState<Test[]>([]);
    const [testsLoading, setTestsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [selected, setSelected] = useState<Test[]>([]);

    const [collectionType, setCollectionType] = useState<"walk-in" | "home-collection">("walk-in");
    const [selectedDate, setSelectedDate] = useState("");
    const [slots, setSlots] = useState<Slot[]>([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState("");
    const [address, setAddress] = useState({ street: "", city: "Nashik", state: "Maharashtra", pincode: "" });

    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [bookingId, setBookingId] = useState("");
    const [error, setError] = useState("");
    const [pageLoading, setPageLoading] = useState(true);

    useEffect(() => {
        getAllTests()
            .then((res) => setTests(res.data.tests || []))
            .catch(console.error)
            .finally(() => {
                setTestsLoading(false);
                setPageLoading(false);
            });
    }, []);

    // Auto-scroll to prescription section if ?prescription=true
    useEffect(() => {
        if (searchParams?.get("prescription") === "true" && prescriptionRef.current) {
            setTimeout(() => prescriptionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 400);
        }
    }, [searchParams]);

    useEffect(() => {
        if (!selectedDate) return;
        setSlotsLoading(true);
        getAvailableSlots(selectedDate)
            .then((res) => setSlots(res.data.slots || []))
            .catch(console.error)
            .finally(() => setSlotsLoading(false));
    }, [selectedDate]);

    const categories = ["All", "Thyroid", "Diabetes", "Liver", "Kidney", ...Array.from(new Set(tests.map((t) => t.category))).filter(c => !["Thyroid", "Diabetes", "Liver", "Kidney"].includes(c))];
    const filteredTests = tests.filter((t) => {
        const matchSearch = t.testName.toLowerCase().includes(search.toLowerCase());
        const matchCat = category === "All" || t.category === category;
        return matchSearch && matchCat;
    });

    const handleRxFile = (file: File) => {
        setRxFile(file);
        setRxMatched(null);
        setRxUnmatched([]);
        setRxStructuredData(null);
        const reader = new FileReader();
        reader.onload = (e) => setRxPreview(e.target?.result as string);
        reader.readAsDataURL(file);
    };

    const scanPrescription = async () => {
        if (!rxFile || tests.length === 0) return;
        setRxScanning(true);
        setRxMatched(null);
        setRxUnmatched([]);
        setRxStructuredData(null);
        try {
            const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const result = e.target?.result as string;
                    resolve(result.split(",")[1]);
                };
                reader.readAsDataURL(rxFile);
            });
            const mediaType = rxFile.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
            const res = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || "",
                    "anthropic-version": "2023-06-01",
                },
                body: JSON.stringify({
                    model: "claude-sonnet-4-20250514",
                    max_tokens: 2000,
                    messages: [{
                        role: "user",
                        content: [
                            { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
                            {
                                type: "text",
                                text: `You are an expert medical prescription OCR system. Extract ALL information from this prescription image into a structured JSON format.

IMPORTANT INSTRUCTIONS:
- Read handwritten text carefully, use context clues for unclear words
- Extract doctor name, hospital/clinic name if visible
- Extract patient name if present (may not always be there)
- Extract prescription date if visible
- Extract ALL lab tests mentioned (blood tests, scans, pathology tests, etc.)
- Extract ALL medications with dosage, frequency, and duration
- Extract diagnosis or symptoms if mentioned
- Extract any additional notes or instructions

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):

{
  "doctorName": "string or null",
  "hospitalOrClinic": "string or null",
  "patientName": "string or null",
  "date": "string (YYYY-MM-DD format) or null",
  "suggestedTests": [
    {
      "testName": "string",
      "notes": "string or null"
    }
  ],
  "medications": [
    {
      "name": "string",
      "dosage": "string or null",
      "frequency": "string or null",
      "duration": "string or null"
    }
  ],
  "diagnosis": "string or null",
  "additionalNotes": "string or null"
}

If a field is not found or unclear, use null. For arrays, return empty array [] if nothing found.`
                            },
                        ],
                    }],
                }),
            });
            const data = await res.json();
            const text = data?.content?.[0]?.text || "{}";

            // Extract JSON from response (handle potential markdown wrapping)
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const extractedData = JSON.parse(jsonMatch?.[0] || "{}");

            setRxStructuredData(extractedData);

            // Match tests from extracted data
            const suggestedTests = extractedData.suggestedTests || [];
            const matched: Test[] = [];
            const unmatched: string[] = [];

            suggestedTests.forEach((item: any) => {
                const testName = item.testName || "";
                const found = tests.find((t) =>
                    t.testName.toLowerCase().includes(testName.toLowerCase()) ||
                    testName.toLowerCase().includes(t.testName.toLowerCase())
                );
                if (found) {
                    matched.push(found);
                } else if (testName) {
                    unmatched.push(testName);
                }
            });

            setSelected((prev) => {
                const existing = prev.map((t) => t._id);
                return [...prev, ...matched.filter((t) => !existing.includes(t._id))];
            });

            const totalExtracted = suggestedTests.length;
            setRxMatched(`Found ${matched.length} of ${totalExtracted} test${totalExtracted !== 1 ? "s" : ""} from prescription`);
            setRxUnmatched(unmatched);
        } catch (err) {
            console.error("Prescription scan error:", err);
            setRxMatched(null);
            setRxUnmatched(["Could not read prescription. Please select tests manually."]);
        } finally {
            setRxScanning(false);
        }
    };

    const toggleTest = (t: Test) =>
        setSelected((prev) => prev.some((s) => s._id === t._id) ? prev.filter((s) => s._id !== t._id) : [...prev, t]);

    const dates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i + 1);
        return d;
    });

    const canProceed = () => {
        if (step === 0) return selected.length > 0;
        if (step === 1) return !!(selectedDate && selectedSlot && (collectionType === "walk-in" || address.street.trim().length > 3));
        return true;
    };

    const handleSubmit = async () => {
        if (!user) return;
        setSubmitting(true);
        setError("");
        try {
            const res = await createBooking({
                patientId: user.id,
                patientName: user.fullName,
                patientPhone: user.phone || "0000000000",
                tests: selected.map((t) => ({
                    testId: t._id,
                    testName: t.testName,
                    testCode: t.testCode,
                    price: t.price,
                })),
                collectionType,
                scheduledDate: selectedDate,
                scheduledTime: selectedSlot,
                collectionAddress: collectionType === "home-collection" ? address : undefined,
                paymentMethod: "cash",
            });
            setBookingId(res.data.booking?.bookingId || "");
            setSuccess(true);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const data = err.response?.data;
                // Show the detailed validation message if available
                const msg = data?.message || data?.errors?.[0]?.message || "Booking failed. Please try again.";
                setError(msg);
                console.error("[BookTest] API error:", data);
            } else {
                setError("Something went wrong.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const subtotal = selected.reduce((s, t) => s + t.price, 0);
    const homeCharge = collectionType === "home-collection" ? 100 : 0;
    const total = subtotal + homeCharge;

    // Page loading state
    if (pageLoading) return <PageLoader message="Loading tests..." />;

    if (success) return (
        <div className="flex-1 flex items-center justify-center px-6 py-20">
            <div className="text-center max-w-md">
                <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10 text-teal-600" strokeWidth={2} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Booking Confirmed!</h2>
                {bookingId && <p className="text-teal-600 font-mono font-bold text-lg mb-2">#{bookingId}</p>}
                <p className="text-slate-500 mb-8">You will receive a confirmation on your registered mobile number.</p>
                <div className="flex gap-3 justify-center">
                    <button onClick={() => router.push("/bookings")} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-lg shadow-teal-200">
                        View my bookings
                    </button>
                    <button onClick={() => { setSuccess(false); setStep(0); setSelected([]); setSelectedDate(""); setSelectedSlot(""); }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm px-6 py-3 rounded-xl transition-all">
                        Book another
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <main className="flex-1 p-8 bg-[#F5F5F3]">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => step > 0 ? setStep(step - 1) : router.back()}
                    className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 shadow-sm transition-all">
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                    <h1 className="text-slate-800 font-bold text-lg">Book a Test</h1>
                    <p className="text-slate-400 text-xs">Prathamesh Advanced Diagnostic Center</p>
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

            {/* Cart strip */}
            {step === 0 && selected.length > 0 && (
                <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FlaskConical className="w-4 h-4 text-teal-600" strokeWidth={1.8} />
                        <span className="text-slate-700 text-sm font-semibold">{selected.length} test{selected.length > 1 ? "s" : ""} · <span className="text-teal-600">₹{subtotal}</span></span>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                        {selected.slice(0, 2).map((t) => (
                            <button key={t._id} onClick={() => toggleTest(t)} className="flex items-center gap-1 bg-white border border-slate-200 rounded-full px-2 py-0.5 text-[10px] text-slate-500 hover:text-red-500 transition-colors">
                                {t.testName.split(" ")[0]} <X className="w-2.5 h-2.5" />
                            </button>
                        ))}
                        {selected.length > 2 && <span className="text-slate-400 text-xs self-center">+{selected.length - 2}</span>}
                    </div>
                </div>
            )}

            {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

            {/* Step content */}
            {step === 0 ? (
                <div className="flex gap-6 items-start">
                    {/* Left column */}
                    <div className="flex-1" style={{ maxWidth: '640px' }}>
                        <h2 className="text-lg font-bold text-slate-800 mb-1">Select your tests</h2>
                        <p className="text-slate-500 text-sm mb-4">Choose one or more tests.</p>

                        {/* Prescription upload */}
                        <div
                            ref={prescriptionRef}
                            className={`mb-5 rounded-xl border-2 border-dashed transition-all ${rxFile ? "border-teal-300 bg-[#F8FEFB]" : "border-teal-300 bg-[#F8FEFB] hover:border-teal-400 hover:bg-[#E1F5EE]"}`}
                        >
                            {!rxFile ? (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full flex flex-col items-center gap-2 py-6 px-4"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-[#E1F5EE] flex items-center justify-center">
                                        <Upload className="w-6 h-6 text-[#1D9E75]" strokeWidth={2} />
                                    </div>
                                    <p className="text-slate-700 text-sm font-semibold">Upload Prescription</p>
                                    <p className="text-slate-500 text-xs">Drag and drop or click to browse</p>
                                    <p className="text-slate-400 text-xs">JPG, PNG or PDF · Max 10MB</p>
                                </button>
                            ) : (
                                <div className="p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        {rxPreview && rxFile.type.startsWith("image/") && (
                                            <img src={rxPreview} alt="Prescription" className="w-14 h-14 rounded-lg object-cover border border-slate-200" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-slate-700 text-sm font-semibold truncate">{rxFile.name}</p>
                                            <p className="text-slate-400 text-xs">{(rxFile.size / 1024).toFixed(0)} KB</p>
                                        </div>
                                        <button onClick={() => { setRxFile(null); setRxPreview(null); setRxMatched(null); setRxUnmatched([]); setRxStructuredData(null); }} className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {!rxMatched && !rxScanning && (
                                        <button onClick={scanPrescription}
                                            className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm py-2 rounded-lg transition-all">
                                            <Upload className="w-3.5 h-3.5" /> Scan Prescription
                                        </button>
                                    )}
                                    {rxScanning && (
                                        <div className="flex items-center justify-center gap-2 py-2 text-teal-600 text-sm font-medium">
                                            <Loader2 className="w-4 h-4 animate-spin" /> Scanning prescription...
                                        </div>
                                    )}
                                    {rxMatched && (
                                        <p className="text-teal-600 text-xs font-semibold mt-1">{rxMatched}</p>
                                    )}
                                    {rxUnmatched.length > 0 && (
                                        <p className="text-amber-600 text-xs mt-1">Could not match: {rxUnmatched.join(", ")}</p>
                                    )}
                                    {rxStructuredData && (
                                        <div className="mt-3 pt-3 border-t border-slate-200 space-y-2 text-xs">
                                            {rxStructuredData.doctorName && (
                                                <div className="flex gap-2">
                                                    <span className="text-slate-400 font-medium">Doctor:</span>
                                                    <span className="text-slate-700">{rxStructuredData.doctorName}</span>
                                                </div>
                                            )}
                                            {rxStructuredData.hospitalOrClinic && (
                                                <div className="flex gap-2">
                                                    <span className="text-slate-400 font-medium">Hospital:</span>
                                                    <span className="text-slate-700">{rxStructuredData.hospitalOrClinic}</span>
                                                </div>
                                            )}
                                            {rxStructuredData.date && (
                                                <div className="flex gap-2">
                                                    <span className="text-slate-400 font-medium">Date:</span>
                                                    <span className="text-slate-700">{new Date(rxStructuredData.date).toLocaleDateString("en-IN")}</span>
                                                </div>
                                            )}
                                            {rxStructuredData.diagnosis && (
                                                <div className="flex gap-2">
                                                    <span className="text-slate-400 font-medium">Diagnosis:</span>
                                                    <span className="text-slate-700">{rxStructuredData.diagnosis}</span>
                                                </div>
                                            )}
                                            {rxStructuredData.medications && rxStructuredData.medications.length > 0 && (
                                                <div>
                                                    <span className="text-slate-400 font-medium block mb-1">Medications:</span>
                                                    <div className="space-y-1 pl-2">
                                                        {rxStructuredData.medications.slice(0, 3).map((med: any, i: number) => (
                                                            <div key={i} className="text-slate-600">
                                                                • {med.name}
                                                                {med.dosage && ` - ${med.dosage}`}
                                                                {med.frequency && ` (${med.frequency})`}
                                                            </div>
                                                        ))}
                                                        {rxStructuredData.medications.length > 3 && (
                                                            <div className="text-slate-400">+{rxStructuredData.medications.length - 3} more</div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            {rxStructuredData.additionalNotes && (
                                                <div className="flex gap-2">
                                                    <span className="text-slate-400 font-medium">Notes:</span>
                                                    <span className="text-slate-700">{rxStructuredData.additionalNotes}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,application/pdf"
                                className="hidden"
                                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleRxFile(f); e.target.value = ""; }}
                            />
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-1 h-px bg-slate-200" />
                            <span className="text-slate-400 text-xs font-medium">or search manually</span>
                            <div className="flex-1 h-px bg-slate-200" />
                        </div>

                        <div className="relative mb-3">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tests..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-700 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all" />
                        </div>
                        <div className="flex gap-2 flex-wrap mb-4">
                            {categories.map((c) => (
                                <button key={c} onClick={() => setCategory(c)}
                                    className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${category === c ? "bg-[#1D9E75] text-white border-[#1D9E75]" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}>
                                    {c}
                                </button>
                            ))}
                        </div>
                        {testsLoading ? (
                            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-teal-500 animate-spin" /></div>
                        ) : (
                            <div className="space-y-2">
                                {filteredTests.map((t) => {
                                    const isSel = selected.some((s) => s._id === t._id);
                                    const isPopular = ["Complete Blood Count", "Lipid Profile", "Thyroid Profile"].includes(t.testName);
                                    return (
                                        <button key={t._id} onClick={() => toggleTest(t)}
                                            className={`w-full flex items-center justify-between p-4 rounded-lg border text-left transition-all ${isSel ? "bg-[#E1F5EE] border-[#1D9E75]" : "bg-white border-slate-100 hover:bg-[#F8FEFB] hover:border-slate-200"}`}
                                            style={{ border: isSel ? "0.5px solid #1D9E75" : "0.5px solid rgba(0,0,0,0.1)" }}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSel ? "bg-[#1D9E75] border-[#1D9E75]" : "border-slate-300"}`}>
                                                    {isSel && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <p className="text-slate-700 text-sm font-semibold">{t.testName}</p>
                                                        {isPopular && (
                                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E1F5EE] text-[#1D9E75]">
                                                                Popular
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-0.5">
                                                        <span className="text-slate-400 text-xs">{t.category}</span>
                                                        <span className="text-slate-400 text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> {t.turnaroundTime}h</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-[#1D9E75] font-bold text-sm ml-4">₹{t.price}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Right column - Summary panel */}
                    <div className="w-[280px] flex-shrink-0 sticky top-6">
                        <div className="bg-white rounded-lg p-5 flex flex-col" style={{ border: "0.5px solid rgba(0,0,0,0.1)", minHeight: '400px' }}>
                            <h3 className="text-slate-800 font-semibold text-base mb-4">Your selection</h3>

                            {selected.length === 0 ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <p className="text-slate-400 text-sm text-center">No tests added yet</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex-1 space-y-3 mb-4">
                                        {selected.map((t) => (
                                            <div key={t._id} className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-slate-700 text-sm font-medium leading-tight">{t.testName}</p>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <span className="text-[#1D9E75] text-sm font-semibold">₹{t.price}</span>
                                                    <button
                                                        onClick={() => toggleTest(t)}
                                                        className="text-slate-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-4 mt-auto" style={{ borderTop: "0.5px solid rgba(0,0,0,0.1)" }}>
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-slate-600 text-sm font-medium">Total</span>
                                            <span className="text-slate-800 text-lg font-bold">₹{subtotal}</span>
                                        </div>
                                        <button
                                            onClick={() => setStep(1)}
                                            disabled={!canProceed()}
                                            className="w-full flex items-center justify-center gap-2 bg-[#1D9E75] hover:bg-[#0F6E56] disabled:opacity-50 text-white font-semibold text-sm px-6 py-3 rounded-lg transition-all"
                                        >
                                            Continue <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="max-w-2xl">
                    {step === 1 && (
                        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-800 mb-1">Schedule your visit</h2>
                            <p className="text-slate-500 text-sm mb-5">Choose collection type, date and time.</p>

                            <div className="grid grid-cols-2 gap-3 mb-5">
                                {(["walk-in", "home-collection"] as const).map((type) => {
                                    const Icon = type === "walk-in" ? Building2 : Home;
                                    const label = type === "walk-in" ? "Lab Visit" : "Home Collection";
                                    const sub = type === "walk-in" ? "Visit our Nashik centre" : "Extra ₹100 charge";
                                    return (
                                        <button key={type} onClick={() => setCollectionType(type)}
                                            className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${collectionType === type ? "bg-teal-50 border-teal-300" : "bg-white border-slate-100 hover:border-slate-200"}`}>
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${collectionType === type ? "bg-teal-100" : "bg-slate-50"}`}>
                                                <Icon className={`w-4 h-4 ${collectionType === type ? "text-teal-600" : "text-slate-400"}`} strokeWidth={1.8} />
                                            </div>
                                            <div>
                                                <p className={`text-sm font-semibold ${collectionType === type ? "text-teal-700" : "text-slate-600"}`}>{label}</p>
                                                <p className="text-slate-400 text-xs">{sub}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Select date</p>
                            <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
                                {dates.map((d) => {
                                    const val = d.toISOString().split("T")[0];
                                    const isSel = selectedDate === val;
                                    return (
                                        <button key={val} onClick={() => { setSelectedDate(val); setSelectedSlot(""); }}
                                            className={`flex flex-col items-center min-w-[56px] py-3 px-2 rounded-xl border transition-all ${isSel ? "bg-teal-600 border-teal-600" : "bg-white border-slate-100 hover:border-slate-200"}`}>
                                            <span className={`text-[10px] font-medium uppercase ${isSel ? "text-teal-100" : "text-slate-400"}`}>{d.toLocaleDateString("en", { weekday: "short" })}</span>
                                            <span className={`text-xl font-bold my-0.5 ${isSel ? "text-white" : "text-slate-700"}`}>{d.getDate()}</span>
                                            <span className={`text-[10px] ${isSel ? "text-teal-100" : "text-slate-400"}`}>{d.toLocaleDateString("en", { month: "short" })}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {selectedDate && (
                                <>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Select time slot</p>
                                    {slotsLoading ? (
                                        <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 text-teal-500 animate-spin" /></div>
                                    ) : (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-5">
                                            {slots.map((s) => (
                                                <button key={s.slot} disabled={!s.available} onClick={() => setSelectedSlot(s.slot)}
                                                    className={`py-2 px-1 rounded-lg text-xs font-medium text-center transition-all ${!s.available ? "bg-slate-50 border border-slate-100 text-slate-300 cursor-not-allowed" : selectedSlot === s.slot ? "bg-teal-600 text-white border-transparent" : "bg-white border border-slate-200 text-slate-600 hover:border-teal-300"}`}>
                                                    {s.slot.split(" - ")[0]}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}

                            {collectionType === "home-collection" && (
                                <div className="space-y-3">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Collection address</p>
                                    <input value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} placeholder="House / Flat no., Street, Area"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all" />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} placeholder="City"
                                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all" />
                                        <input value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} placeholder="Pincode"
                                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all" />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-800 mb-1">Confirm booking</h2>
                            <p className="text-slate-500 text-sm mb-5">Review your details before confirming.</p>

                            <div className="bg-slate-50 rounded-xl p-4 mb-4 space-y-2">
                                {selected.map((t) => (
                                    <div key={t._id} className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <FlaskConical className="w-3.5 h-3.5 text-teal-500" strokeWidth={1.8} />
                                            <span className="text-slate-700 text-sm">{t.testName}</span>
                                        </div>
                                        <span className="text-teal-600 text-sm font-semibold">₹{t.price}</span>
                                    </div>
                                ))}
                                {collectionType === "home-collection" && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 text-sm">Home collection charge</span>
                                        <span className="text-slate-600 text-sm">₹100</span>
                                    </div>
                                )}
                                <div className="border-t border-slate-200 pt-2 flex justify-between">
                                    <span className="text-slate-700 font-bold text-sm">Total</span>
                                    <span className="text-teal-600 font-bold text-base">₹{total}</span>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                {[
                                    { icon: Calendar, label: "Date", value: selectedDate ? new Date(selectedDate).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }) : "—" },
                                    { icon: Clock, label: "Time", value: selectedSlot || "—" },
                                    { icon: collectionType === "home-collection" ? Home : Building2, label: "Collection", value: collectionType === "home-collection" ? "Home Collection" : "Lab Visit" },
                                ].map(({ icon: Icon, label, value }) => (
                                    <div key={label} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                                        <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                                            <Icon className="w-4 h-4 text-teal-500" strokeWidth={1.8} />
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-xs">{label}</p>
                                            <p className="text-slate-700 font-semibold">{value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Navigation - only for steps 1 and 2 */}
            {step > 0 && (
                step > 0 && (
                    <div className="flex gap-3 mt-6">
                        {step > 0 && (
                            <button onClick={() => setStep(step - 1)} className="flex-1 bg-white border border-slate-200 rounded-xl py-3.5 text-slate-500 hover:text-slate-700 text-sm transition-all flex items-center justify-center gap-2 shadow-sm">
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>
                        )}
                        <button
                            onClick={step < 2 ? () => setStep(step + 1) : handleSubmit}
                            disabled={!canProceed() || submitting}
                            className="flex-1 flex items-center justify-center gap-2 bg-[#1D9E75] hover:bg-[#0F6E56] disabled:opacity-50 text-white font-bold text-sm rounded-xl py-3.5 transition-all shadow-lg shadow-teal-200"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : step < 2 ? <><span>Continue</span><ArrowRight className="w-4 h-4" /></> : "Confirm Booking"}
                        </button>
                    </div>
                )
            )}
        </main>
    );
}
