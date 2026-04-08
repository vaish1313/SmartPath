"use client";

import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Search, ArrowRight, Clock, Loader2, FlaskConical } from "lucide-react";
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

function useDebounce<T>(value: T, delay = 350): T {
    const [d, setD] = useState(value);
    useEffect(() => { const t = setTimeout(() => setD(value), delay); return () => clearTimeout(t); }, [value, delay]);
    return d;
}

export default function TestsPage() {
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const debouncedSearch = useDebounce(search);

    const fetchTests = useCallback(() => {
        setLoading(true);
        getAllTests({ page, limit: 12, search: debouncedSearch || undefined, category: category === "All" ? undefined : category })
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

    const CATEGORIES = ["All", "hematology", "biochemistry", "microbiology", "immunology", "urology", "radiology", "other"];

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <div className="pt-16">
                {/* Hero */}
                <div className="py-16 px-6 lg:px-16 text-center relative overflow-hidden"
                    style={{ background: "linear-gradient(135deg, #0f172a 0%, #0d2a27 60%, #0f2a2a 100%)" }}>
                    <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />
                    <div className="relative z-10">
                        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3" style={{ fontFamily: "'Instrument Serif', serif" }}>
                            Test Catalog
                        </h1>
                        <p className="text-teal-200/80 mb-8 max-w-md mx-auto">
                            {total > 0 ? `${total} NABL-certified tests available.` : "NABL-certified tests available."} Book online, get results digitally.
                        </p>
                        <div className="relative max-w-lg mx-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input value={search} onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search tests by name or category..."
                                className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-slate-700 text-sm outline-none shadow-lg focus:ring-2 focus:ring-teal-400" />
                        </div>
                    </div>
                </div>

                {/* Category filters */}
                <div className="px-6 lg:px-16 py-4 border-b border-slate-100 bg-white sticky top-16 z-10">
                    <div className="flex gap-2 overflow-x-auto pb-1 max-w-6xl mx-auto">
                        {CATEGORIES.map((c) => (
                            <button key={c} onClick={() => setCategory(c)}
                                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all capitalize ${c === category ? "bg-[#0f172a] text-white shadow-md shadow-slate-300" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                                {c === "All" ? "All" : CATEGORY_LABELS[c] ?? c}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div className="px-6 lg:px-16 py-10 max-w-6xl mx-auto">
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                                {tests.map((t) => (
                                    <div key={t._id}
                                        className="group bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-teal-200 transition-all flex flex-col">
                                        <div className="flex items-start justify-between mb-3">
                                            <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full capitalize">
                                                {CATEGORY_LABELS[t.category] ?? t.category}
                                            </span>
                                            <div className="text-right">
                                                <p className="text-teal-600 font-bold text-lg leading-none">
                                                    ₹{t.discountedPrice ?? t.price}
                                                </p>
                                                {t.discountedPrice && t.discountedPrice < t.price && (
                                                    <p className="text-slate-400 text-xs line-through">₹{t.price}</p>
                                                )}
                                            </div>
                                        </div>
                                        <h3 className="text-slate-800 font-bold text-sm mb-1 flex-1">{t.testName}</h3>
                                        {t.description && (
                                            <p className="text-slate-400 text-xs mb-3 leading-relaxed line-clamp-2">{t.description}</p>
                                        )}
                                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50">
                                            <div className="flex items-center gap-3 text-slate-400 text-xs">
                                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {t.turnaroundTime}h</span>
                                                <span className="capitalize">{t.sampleType}</span>
                                            </div>
                                            <Link href={`/tests/${t._id}`}
                                                className="flex items-center gap-1 text-teal-600 text-xs font-semibold hover:gap-2 transition-all">
                                                Details <ArrowRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-3">
                                    <button disabled={page === 1} onClick={() => setPage(page - 1)}
                                        className="px-4 py-2 text-sm bg-white border border-slate-200 rounded-xl disabled:opacity-40 hover:border-teal-300 transition-all">
                                        Prev
                                    </button>
                                    <span className="text-slate-500 text-sm">{page} / {totalPages}</span>
                                    <button disabled={page === totalPages} onClick={() => setPage(page + 1)}
                                        className="px-4 py-2 text-sm bg-white border border-slate-200 rounded-xl disabled:opacity-40 hover:border-teal-300 transition-all">
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}
