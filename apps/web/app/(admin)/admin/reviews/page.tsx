"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { getReviews } from "@/lib/api";
import { Star, Loader2, User } from "lucide-react";
import axios from "axios";

interface Review {
    _id: string;
    bookingId: string;
    patientId: string;
    patientName: string;
    rating: number;
    review: string;
    createdAt: string;
}

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getReviews(100)
            .then((res) => setReviews(res.data?.reviews || []))
            .catch((err) => { if (!axios.isAxiosError(err) || err.response?.status !== 401) console.error(err); })
            .finally(() => setLoading(false));
    }, []);

    const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : "0.0";

    const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.rating === star).length,
        percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0
    }));

    return (
        <main className="p-5">
            <PageHeader title="Reviews & Ratings" subtitle="Patient feedback and testimonials" />

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                <div className="bg-white border border-slate-100 rounded-2xl p-5">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Total Reviews</p>
                    <p className="text-3xl font-bold text-slate-800">{reviews.length}</p>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-5">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Average Rating</p>
                    <div className="flex items-center gap-2">
                        <p className="text-3xl font-bold text-teal-600">{avgRating}</p>
                        <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                    </div>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-5">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">5-Star Reviews</p>
                    <p className="text-3xl font-bold text-amber-500">
                        {reviews.filter(r => r.rating === 5).length}
                    </p>
                </div>
            </div>

            {/* Rating Distribution */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 mb-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Rating Distribution</p>
                <div className="space-y-3">
                    {ratingCounts.map(({ star, count, percentage }) => (
                        <div key={star} className="flex items-center gap-3">
                            <div className="flex items-center gap-1 w-16">
                                <span className="text-sm font-semibold text-slate-700">{star}</span>
                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            </div>
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-teal-500 rounded-full transition-all"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <span className="text-sm text-slate-500 w-12 text-right">{count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reviews List */}
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">All Reviews</p>
                </div>
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="px-5 py-16 text-center text-slate-400 text-sm">No reviews yet</div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {reviews.map((review) => (
                            <div key={review._id} className="px-5 py-4 hover:bg-slate-50/50 transition-colors">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                                            {review.patientName?.[0]?.toUpperCase() ?? <User className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="text-slate-700 font-semibold">{review.patientName}</p>
                                            <p className="text-slate-400 text-xs">
                                                {new Date(review.createdAt).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric"
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${i < review.rating
                                                        ? "text-amber-400 fill-amber-400"
                                                        : "text-slate-200 fill-slate-200"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed">{review.review}</p>
                                <p className="text-slate-400 text-xs mt-2 font-mono">Booking: {review.bookingId}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
