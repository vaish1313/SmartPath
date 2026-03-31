"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Search, ArrowRight, Clock, Loader2 } from "lucide-react";
import { getAllTests } from "@/lib/api";

interface Test {
    _id: string;
    name: string;
    category: string;
    price: number;
    discountedPrice?: number;
    turnaroundTime: string;
    description?: string;
    sampleType: string;
}

export default function TestsPage() {
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");

    useEffect(() => {
        getAllTests()
            .then((res) => setTests(res.data.tests || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const categories = ["All", ...Array.from(new Set(tests.map((t) => t.category)))];
    const filtered = tests.filter((t) => {
        const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase());
        const matchCat = category === "All" || t.category === category;
        return matchSearch && matchCat;
    });

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <div className="pt-16">
                {/* Hero */}
                <div className="bg-gradient-to-br from-teal-600 to-cyan-600 py-16 px-6 lg:px-16 text-center">
                    <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3" style={{ fontFamily: "'Instrument Serif', serif" }}>Test Catalog</h1>
                    <p className="text-teal-100 mb-8 max-w-md mx-auto">NABL-certified tests available. Book online, get results digitally.</p>
                    <div className="relative max-w-lg mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tests..."
                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-slate-700 text-sm outline-none shadow-lg" />
                    </div>
                </div>

                {/* Filters */}
                <div className="px-6 lg:px-16 py-5 border-b border-slate-100 bg-white sticky top-16 z-10">
                    <div className="flex gap-2 overflow-x-auto pb-1 max-w-6xl mx-auto">
                        {categories.map((c) => (
                            <button key={c} onClick={() => setCategory(c)}
                                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${c === category ? "bg-teal-600 text-white shadow-md shadow-teal-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tests grid */}
                <div className="px-6 lg:px-16 py-10 max-w-6xl mx-auto">
                    {loading ? (
                        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-teal-500 animate-spin" /></div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20 text-slate-400">No tests found</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filtered.map((t) => (
                                <div key={t._id} className="group bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-teal-200 transition-all">
                                    <div className="flex items-start justify-between mb-3">
                                        <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full">{t.category}</span>
                                        <span className="text-teal-600 font-bold text-lg">₹{t.discountedPrice || t.price}</span>
                                    </div>
                                    <h3 className="text-slate-800 font-bold text-sm mb-1">{t.name}</h3>
                                    {t.description && <p className="text-slate-400 text-xs mb-4 leading-relaxed line-clamp-2">{t.description}</p>}
                                    <div className="flex items-center justify-between mt-3">
                                        <span className="flex items-center gap-1.5 text-slate-400 text-xs"><Clock className="w-3.5 h-3.5" /> {t.turnaroundTime}</span>
                                        <Link href={`/tests/${t._id}`} className="flex items-center gap-1 text-teal-600 text-xs font-semibold hover:gap-2 transition-all">
                                            Book now <ArrowRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}
