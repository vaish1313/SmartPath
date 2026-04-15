"use client";

import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Search, ArrowRight, Clock, Loader2, FlaskConical, CheckCircle } from "lucide-react";
import { getAllTests } from "@/lib/api";

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

function useDebounce<T>(value: T, delay = 350): T {
    const [d, setD] = useState(value);
    useEffect(() => { const t = setTimeout(() => setD(value), delay); return () => clearTimeout(t); }, [value, delay]);
    return d;
}

export default function TestsPage() {
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All tests");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const debouncedSearch = useDebounce(search);

    const fetchTests = useCallback(() => {
        setLoading(true);
        getAllTests({
            page,
            limit: 20,
            search: debouncedSearch || undefined,
            category: category === "All tests" ? undefined : category
        })
            .then((res) => {
                setTests(res.data.tests || []);
                setTotal(res.data.total || 0);
                setTotalPages(res.data.totalPages || 1);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [page, debouncedSearch, category]);

    useEffect(() => { fetchTests(); }, [fetchTests]);
    useEffect(() => { setPage(1); }, [debouncedSearch, category]);

    const CATEGORIES = ["All tests", "Hematology", "Biochemistry", "Microbiology", "Immunology", "Urology", "Radiology"];

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <div className="pt-16">
                {/* Hero — dark teal gradient (only colored section) */}
                <div className="py-12 px-6 lg:px-12 relative overflow-hidden"
                    style={{ background: "linear-gradient(135deg, #0d4d4d 0%, #0a3838 50%, #082e2e 100%)" }}>
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />

                    <div className="relative z-10 max-w-7xl mx-auto">
                        <h1 className="text-white text-4xl lg:text-5xl font-bold mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>
                            Test Catalog
                        </h1>
                        <p className="text-teal-200/70 text-sm mb-8">
                            {total} NABL-certified tests · Book online · Get results digitally
                        </p>




                        {/* Search bar */}
                        <div className="relative max-w-3xl bg-[#0a2828]/60 backdrop-blur-sm rounded-2xl p-2 border border-teal-700/30">
                            <div className="flex items-center gap-2">
                                <Search className="w-5 h-5 text-teal-300/60 ml-3" strokeWidth={1.8} />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search tests by name or category..."
                                    className="flex-1 bg-transparent text-white placeholder:text-teal-200/40 text-sm outline-none py-2"
                                />
                                <button className="bg-teal-500 hover:bg-teal-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all">
                                    Search
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Category pills — light theme */}
                <div className="bg-white border-b border-slate-100 px-6 lg:px-12 py-4 sticky top-16 z-20 shadow-sm">
                    <div className="max-w-7xl mx-auto flex gap-3 overflow-x-auto pb-1">
                        {CATEGORIES.map((c) => (
                            <button
                                key={c}
                                onClick={() => setCategory(c)}
                                className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${c === category
                                    ? "bg-teal-600 text-white shadow-md"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Test grid — light theme, 90% width */}
                <div className="px-6 lg:px-12 py-8 bg-gradient-to-b from-slate-50 to-white">
                    <div className="max-w-7xl mx-auto" style={{ width: "90%" }}>
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                            </div>
                        ) : tests.length === 0 ? (
                            <div className="text-center py-20">
                                <FlaskConical className="w-12 h-12 text-slate-200 mx-auto mb-3" strokeWidth={1.5} />
                                <p className="text-slate-400">No tests found</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
                                    {tests.map((t) => {
                                        const catKey = t.category.toLowerCase();
                                        const catColor = CATEGORY_COLORS[catKey] || CATEGORY_COLORS.other;
                                        const displayPrice = t.discountedPrice ?? t.price;

                                        return (
                                            <Link
                                                key={t._id}
                                                href={`/tests/${t._id}`}
                                                className="group bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-5 shadow-lg hover:shadow-xl hover:border-teal-200/60 hover:bg-white/70 transition-all"
                                            >
                                                {/* Category badge */}
                                                <div className="flex items-start justify-between mb-3">
                                                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${catColor}`}>
                                                        {CATEGORY_LABELS[catKey] || t.category}
                                                    </span>
                                                </div>

                                                {/* Test name */}
                                                <h3 className="text-slate-800 font-bold text-base mb-2 group-hover:text-teal-600 transition-colors">
                                                    {t.testName}
                                                </h3>

                                                {/* Meta row */}
                                                <div className="flex items-center gap-4 text-slate-400 text-xs mb-3">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" strokeWidth={1.8} />
                                                        {t.turnaroundTime}h
                                                    </span>
                                                    <span className="capitalize">{t.sampleType}</span>
                                                </div>

                                                {/* NABL badge */}
                                                <div className="flex items-center gap-1.5 text-teal-600 text-xs mb-4">
                                                    <CheckCircle className="w-3.5 h-3.5" strokeWidth={2} />
                                                    <span className="font-semibold">NABL certified</span>
                                                </div>

                                                {/* Price + Book button */}
                                                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                                    <div>
                                                        <p className="text-teal-600 text-2xl font-bold leading-none">₹{displayPrice}</p>
                                                        {t.discountedPrice && t.discountedPrice < t.price && (
                                                            <p className="text-slate-400 text-xs line-through mt-0.5">₹{t.price}</p>
                                                        )}
                                                    </div>
                                                    <button className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all group-hover:gap-2.5 shadow-sm">
                                                        Book <ArrowRight className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-4 pt-4">
                                        <button
                                            disabled={page === 1}
                                            onClick={() => setPage(page - 1)}
                                            className="px-5 py-2.5 text-sm bg-white border border-slate-200 text-slate-700 rounded-xl disabled:opacity-30 hover:border-teal-300 transition-all shadow-sm"
                                        >
                                            Previous
                                        </button>
                                        <span className="text-slate-500 text-sm font-medium">
                                            Showing {((page - 1) * 20) + 1}–{Math.min(page * 20, total)} of {total}
                                        </span>
                                        <button
                                            disabled={page === totalPages}
                                            onClick={() => setPage(page + 1)}
                                            className="px-5 py-2.5 text-sm bg-white border border-slate-200 text-slate-700 rounded-xl disabled:opacity-30 hover:border-teal-300 transition-all shadow-sm"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
