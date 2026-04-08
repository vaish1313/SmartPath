"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle, ArrowRight, Loader2, FlaskConical, User } from "lucide-react";
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
    hematology: "Hematology", biochemistry: "Biochemistry", microbiology: "Microbiology",
    immunology: "Immunology", urology: "Urology", radiology: "Radiology", other: "Other",
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
            <Link href="/tests" className="text-teal-600 text-sm font-semibold">Back to tests</Link>
        </div>
    );

    const displayPrice = test.discountedPrice ?? test.price;
    const hasDiscount = test.discountedPrice && test.discountedPrice < test.price;

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <div className="pt-16 max-w-4xl mx-auto px-6 lg:px-8 py-10">
                <Link href="/tests" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Tests
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main info */}
                    <div className="lg:col-span-2 space-y-5">
                        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full capitalize">
                                    {CATEGORY_LABELS[test.category] ?? test.category}
                                </span>
                                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-mono">
                                    {test.testCode}
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold text-slate-800 mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>
                                {test.testName}
                            </h1>
                            {test.description && (
                                <p className="text-slate-500 text-sm leading-relaxed">{test.description}</p>
                            )}
                            <div className="grid grid-cols-3 gap-4 mt-6">
                                {[
                                    { label: "Price", value: `₹${displayPrice}` },
                                    { label: "Turnaround", value: `${test.turnaroundTime}h` },
                                    { label: "Sample", value: test.sampleType },
                                ].map(({ label, value }) => (
                                    <div key={label} className="bg-slate-50 rounded-xl p-3 text-center">
                                        <p className="text-slate-400 text-xs font-medium">{label}</p>
                                        <p className="text-slate-800 font-bold text-sm mt-0.5 capitalize">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Normal ranges */}
                        {test.normalRange && (test.normalRange.male || test.normalRange.female) && (
                            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
                                <h3 className="text-slate-800 font-bold mb-4 flex items-center gap-2">
                                    <FlaskConical className="w-4 h-4 text-teal-500" strokeWidth={1.8} />
                                    Normal Ranges
                                </h3>
                                <div className="space-y-3">
                                    {test.normalRange.male && (
                                        <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-3">
                                            <User className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" strokeWidth={1.8} />
                                            <div>
                                                <p className="text-blue-700 text-xs font-semibold mb-0.5">Male</p>
                                                <p className="text-slate-700 text-sm">{test.normalRange.male}
                                                    {test.normalRange.unit && <span className="text-slate-400 ml-1">{test.normalRange.unit}</span>}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {test.normalRange.female && (
                                        <div className="flex items-start gap-3 bg-rose-50 rounded-xl p-3">
                                            <User className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" strokeWidth={1.8} />
                                            <div>
                                                <p className="text-rose-700 text-xs font-semibold mb-0.5">Female</p>
                                                <p className="text-slate-700 text-sm">{test.normalRange.female}
                                                    {test.normalRange.unit && <span className="text-slate-400 ml-1">{test.normalRange.unit}</span>}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Booking card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border border-teal-200 rounded-2xl shadow-md p-6 sticky top-24">
                            <div className="text-center mb-5">
                                <p className="text-3xl font-bold text-teal-600">₹{displayPrice}</p>
                                {hasDiscount && (
                                    <p className="text-slate-400 text-xs line-through mt-0.5">₹{test.price}</p>
                                )}
                                <p className="text-slate-400 text-xs mt-1">NABL certified</p>
                            </div>
                            <div className="space-y-2 mb-5">
                                {[
                                    { icon: Clock, text: `Report in ${test.turnaroundTime} hours` },
                                    { icon: CheckCircle, text: "NABL accredited lab" },
                                    { icon: CheckCircle, text: "Digital PDF report" },
                                    { icon: CheckCircle, text: "Home collection available" },
                                ].map(({ icon: Icon, text }) => (
                                    <div key={text} className="flex items-center gap-2 text-sm text-slate-600">
                                        <Icon className="w-4 h-4 text-teal-500 flex-shrink-0" strokeWidth={1.8} />
                                        {text}
                                    </div>
                                ))}
                            </div>
                            <Link href="/register"
                                className="w-full flex items-center justify-center gap-2 bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-slate-300 group">
                                Book this test <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                            <p className="text-center text-slate-400 text-xs mt-3">Free cancellation up to 2 hrs before</p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
