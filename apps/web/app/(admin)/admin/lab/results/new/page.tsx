"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAllSamples, getBookingById, createResult } from "@/lib/api";
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import axios from "axios";

interface Sample { _id: string; sampleId: string; patientName: string; patientId: string; bookingId: string; }
interface TestEntry { testName: string; value: string; unit: string; normalRangeMale: string; normalRangeFemale: string; status: "normal" | "abnormal" | "critical"; }

export default function NewResultPage() {
    const router = useRouter();
    const [samples, setSamples] = useState<Sample[]>([]);
    const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
    const [testEntries, setTestEntries] = useState<TestEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        getAllSamples({ status: "collected", limit: 50 })
            .then((res) => setSamples(res.data.samples || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleSelectSample = async (sample: Sample) => {
        setSelectedSample(sample);
        try {
            const res = await getBookingById(sample.bookingId.toString());
            const booking = res.data?.booking ?? res.data;
            const tests: TestEntry[] = (booking?.tests ?? []).map((t: { testName?: string }) => ({
                testName: t.testName || "",
                value: "", unit: "", normalRangeMale: "", normalRangeFemale: "", status: "normal" as const,
            }));
            setTestEntries(tests.length > 0 ? tests : [{ testName: "", value: "", unit: "", normalRangeMale: "", normalRangeFemale: "", status: "normal" }]);
        } catch {
            setTestEntries([{ testName: "", value: "", unit: "", normalRangeMale: "", normalRangeFemale: "", status: "normal" }]);
        }
    };

    const updateEntry = (i: number, field: keyof TestEntry, val: string) => {
        setTestEntries((prev) => prev.map((e, idx) => idx === i ? { ...e, [field]: val } : e));
    };

    const handleSubmit = async () => {
        if (!selectedSample) return;
        setSubmitting(true); setError("");
        try {
            await createResult({
                bookingId: selectedSample.bookingId.toString(),
                sampleId: selectedSample._id,
                patientId: selectedSample.patientId,
                patientName: selectedSample.patientName,
                tests: testEntries.map((e) => ({
                    testName: e.testName, value: e.value, unit: e.unit,
                    normalRange: { male: e.normalRangeMale, female: e.normalRangeFemale },
                    status: e.status,
                })),
            });
            setSuccess(true);
        } catch (err) {
            if (axios.isAxiosError(err)) setError(err.response?.data?.message || "Failed to save results");
            else setError("Something went wrong.");
        } finally { setSubmitting(false); }
    };

    const inputCls = "w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-sm placeholder:text-slate-300 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all";
    const labelCls = "text-xs font-semibold text-slate-500 tracking-wide uppercase";

    if (success) return (
        <main className="p-6 max-w-lg flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-7 h-7 text-teal-600" strokeWidth={1.8} />
                </div>
                <h2 className="text-lg font-bold text-slate-800 mb-4">Results Saved</h2>
                <div className="flex gap-3 justify-center">
                    <Link href="/admin/lab" className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-md shadow-teal-200">Back to Lab</Link>
                </div>
            </div>
        </main>
    );

    return (
        <main className="p-6 max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
                <Link href="/admin/lab" className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 shadow-sm transition-all">
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Enter Test Results</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Record results for a collected sample</p>
                </div>
            </div>

            {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

            {/* Sample selection */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 mb-5">
                <h2 className="text-sm font-bold text-slate-700 mb-4">Select Sample</h2>
                {loading ? <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 text-teal-500 animate-spin" /></div> : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {samples.length === 0 ? <p className="text-slate-400 text-sm text-center py-4">No collected samples found</p> : samples.map((s) => (
                            <button key={s._id} onClick={() => handleSelectSample(s)}
                                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${selectedSample?._id === s._id ? "bg-teal-50 border-teal-300" : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50"}`}>
                                <div>
                                    <p className="text-slate-700 text-sm font-semibold">{s.patientName}</p>
                                    <p className="text-slate-400 text-xs font-mono">{s.sampleId}</p>
                                </div>
                                {selectedSample?._id === s._id && <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" />}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Test entries */}
            {selectedSample && (
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 mb-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-slate-700">Test Values</h2>
                        <button onClick={() => setTestEntries((prev) => [...prev, { testName: "", value: "", unit: "", normalRangeMale: "", normalRangeFemale: "", status: "normal" }])}
                            className="text-xs font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-all">
                            + Add Test
                        </button>
                    </div>
                    <div className="space-y-4">
                        {testEntries.map((entry, i) => (
                            <div key={i} className="bg-slate-50 rounded-xl p-4 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className={labelCls}>Test Name</label>
                                        <input value={entry.testName} onChange={(e) => updateEntry(i, "testName", e.target.value)} placeholder="e.g. Haemoglobin" className={inputCls} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelCls}>Value</label>
                                        <input value={entry.value} onChange={(e) => updateEntry(i, "value", e.target.value)} placeholder="e.g. 13.5" className={inputCls} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelCls}>Unit</label>
                                        <input value={entry.unit} onChange={(e) => updateEntry(i, "unit", e.target.value)} placeholder="e.g. g/dL" className={inputCls} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelCls}>Status</label>
                                        <select value={entry.status} onChange={(e) => updateEntry(i, "status", e.target.value)} className={inputCls} style={{ backgroundColor: "white" }}>
                                            <option value="normal">Normal</option>
                                            <option value="abnormal">Abnormal</option>
                                            <option value="critical">Critical</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelCls}>Normal Range (Male)</label>
                                        <input value={entry.normalRangeMale} onChange={(e) => updateEntry(i, "normalRangeMale", e.target.value)} placeholder="e.g. 13.5–17.5" className={inputCls} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelCls}>Normal Range (Female)</label>
                                        <input value={entry.normalRangeFemale} onChange={(e) => updateEntry(i, "normalRangeFemale", e.target.value)} placeholder="e.g. 12.0–15.5" className={inputCls} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex gap-3">
                <Link href="/admin/lab" className="flex-1 flex items-center justify-center bg-white border border-slate-200 rounded-xl py-3 text-slate-500 hover:text-slate-700 text-sm transition-all shadow-sm">Cancel</Link>
                <button onClick={handleSubmit} disabled={!selectedSample || submitting}
                    className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl py-3 transition-all shadow-lg shadow-violet-200">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Results"}
                </button>
            </div>
        </main>
    );
}
