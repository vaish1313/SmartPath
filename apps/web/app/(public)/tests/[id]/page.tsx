"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle, ArrowRight, Loader2, Home } from "lucide-react";
import { getTestById } from "@/lib/api";

interface Test {
    _id: string;
    testCode: string;
    testName: string;
    category: string;
    price: number;
    discountedPrice?: number;
    turnaroundTime: number;
    description?: string;
    sampleType: string;
    normalRange?: { male?: string; female?: string; unit?: string };
    isActive: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
    hematology: "Hematology",
    biochemistry: "Biochemistry",
    microbiology: "Microbiology",
    immunology: "Immunology",
    urology: "Urology",
    radiology: "Radiology",
    other: "Other",
};

const CATEGORY_COLORS: Record<string, string> = {
    hematology: "bg-red-50 text-red-700 border-red-200",
    biochemistry: "bg-blue-50 text-blue-700 border-blue-200",
    microbiology: "bg-amber-50 text-amber-700 border-amber-200",
    immunology: "bg-purple-50 text-purple-700 border-purple-200",
    urology: "bg-teal-50 text-teal-700 border-teal-200",
    radiology: "bg-cyan-50 text-cyan-700 border-cyan-200",
    other: "bg-slate-50 text-slate-700 border-slate-200",
};

export default function TestDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [test, setTest] = useState<Test | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        getTestById(id)
            .then((res) => setTest(res.data.test))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
        </div>
    );

    if (!test) return (
        <div className="min-h-screen bg-white flex items-center justify-center flex-col gap-3">
            <p className="text-slate-500">Test not found</p>
            <Link href="/tests" className="text-teal-600 text-sm font-semibold hover:text-teal-700">Back to tests</Link>
        </div>
    );

    const displayPrice = test.discountedPrice ?? test.price;
    const catKey = test.category.toLowerCase();
    const catColor = CATEGORY_COLORS[catKey] || CATEGORY_COLORS.other;

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <div className="pt-16">
                {/* Header — light theme */}
                <div className="px-6 lg:px-12 py-6 bg-slate-50 border-b border-slate-100">
                    <div className="max-w-7xl mx-auto" style={{ width: "90%" }}>
                        <Link
                            href="/tests"
                            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Test Catalog
                        </Link>
                        <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${catColor}`}>
                                {CATEGORY_LABELS[catKey] || test.category}
                            </span>
                            <span className="text-slate-400 text-xs font-mono">{test.testCode}</span>
                        </div>
                    </div>
                </div>

                {/* Main content — light theme, 90% width, 2-column */}
                <div className="px-6 lg:px-12 py-8 bg-gradient-to-b from-white to-slate-50">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ width: "90%" }}>
                        {/* Left column — test details */}
                        <div className="lg:col-span-2 space-y-5">
                            {/* Test name + meta */}
                            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                                <h1 className="text-slate-800 text-3xl lg:text-4xl font-bold mb-4" style={{ fontFamily: "'Instrument Serif', serif" }}>
                                    {test.testName}
                                </h1>
                                <div className="grid grid-cols-3 gap-4 mb-5">
                                    <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
                                        <p className="text-teal-600 text-xs font-semibold uppercase tracking-wide mb-1">Price</p>
                                        <p className="text-teal-600 text-2xl font-bold">₹{displayPrice}</p>
                                        <p className="text-teal-500/60 text-xs mt-0.5">NABL certified</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-1">Turnaround</p>
                                        <p className="text-slate-800 text-2xl font-bold">{test.turnaroundTime} hours</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-1">Sample</p>
                                        <p className="text-slate-800 text-2xl font-bold capitalize">{test.sampleType}</p>
                                    </div>
                                </div>
                            </div>

                            {/* About this test */}
                            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                                <h3 className="text-slate-800 font-bold text-lg mb-3">About this test</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    {test.description || `The ${test.testName} is a diagnostic test used to measure specific biomarkers in ${test.sampleType} samples. This test provides accurate results within ${test.turnaroundTime} hours and is performed in our NABL-accredited laboratory.`}
                                </p>
                            </div>

                            {/* Preparation */}
                            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                                <h3 className="text-slate-800 font-bold text-lg mb-4">Preparation</h3>
                                <div className="space-y-3">
                                    {[
                                        "No fasting required before this test",
                                        test.sampleType === "urine" ? "First morning urine preferred for best accuracy" : "Sample can be collected at any time",
                                        "Home collection available on request",
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0 mt-0.5">
                                                <span className="text-teal-600 text-xs font-bold">{i + 1}</span>
                                            </div>
                                            <p className="text-slate-600 text-sm">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Related tests */}
                            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                                <h3 className="text-slate-800 font-bold text-lg mb-4">Related tests</h3>
                                <div className="flex flex-wrap gap-2">
                                    {["Beta hCG (Quantitative)", "Urine Routine", "FSH / LH"].map((t) => (
                                        <button
                                            key={t}
                                            className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl hover:bg-slate-100 hover:border-slate-300 transition-all"
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right column — booking card (sticky) */}
                        <div className="lg:col-span-1">
                            <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-6 sticky top-24 border border-teal-500/40 shadow-xl">
                                {/* Price */}
                                <div className="text-center mb-6 pb-6 border-b border-teal-500/40">
                                    <p className="text-white text-5xl font-bold">₹{displayPrice}</p>
                                    {test.discountedPrice && test.discountedPrice < test.price && (
                                        <p className="text-teal-100/50 text-sm line-through mt-1">₹{test.price}</p>
                                    )}
                                    <p className="text-teal-100/70 text-xs mt-2">NABL certified</p>
                                </div>

                                {/* Features */}
                                <div className="space-y-3 mb-6">
                                    {[
                                        { icon: CheckCircle, text: `Report in ${test.turnaroundTime} hours` },
                                        { icon: CheckCircle, text: "NABL accredited lab" },
                                        { icon: CheckCircle, text: "Digital PDF report" },
                                        { icon: Home, text: "Home collection available" },
                                    ].map(({ icon: Icon, text }) => (
                                        <div key={text} className="flex items-center gap-2.5 text-white text-sm">
                                            <Icon className="w-4 h-4 shrink-0" strokeWidth={2} />
                                            {text}
                                        </div>
                                    ))}
                                </div>

                                {/* Book button */}
                                <Link
                                    href="/register"
                                    className="w-full flex items-center justify-center gap-2 bg-white hover:bg-teal-50 text-teal-700 font-bold text-sm py-4 rounded-xl transition-all shadow-lg group"
                                >
                                    Book this test <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                                <p className="text-center text-teal-100/60 text-xs mt-3">Free cancellation up to 2 hrs before</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
