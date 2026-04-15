"use client";

import { useState } from "react";
import { Star, X, Loader2 } from "lucide-react";
import { createReview } from "@/lib/api";

interface Props {
    bookingId: string;
    bookingRef: string;
    onClose: () => void;
    onSubmitted: () => void;
}

export default function ReviewModal({ bookingId, bookingRef, onClose, onSubmitted }: Props) {
    const [rating, setRating] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [review, setReview] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (rating === 0) return setError("Please select a rating.");
        if (review.trim().length < 10) return setError("Review must be at least 10 characters.");
        setError("");
        setSubmitting(true);
        try {
            await createReview({ bookingId, rating, review: review.trim() });
            onSubmitted();
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setError(msg || "Failed to submit review. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/60 w-full max-w-md p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-lg font-bold text-slate-800 mb-1">Leave a Review</h2>
                <p className="text-slate-400 text-xs mb-5">Booking #{bookingRef}</p>

                {/* Star rating */}
                <div className="flex gap-1.5 mb-5">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <button
                            key={s}
                            onMouseEnter={() => setHovered(s)}
                            onMouseLeave={() => setHovered(0)}
                            onClick={() => setRating(s)}
                            className="transition-transform hover:scale-110"
                        >
                            <Star
                                className={`w-8 h-8 transition-colors ${s <= (hovered || rating) ? "fill-amber-400 text-amber-400" : "text-slate-200"
                                    }`}
                            />
                        </button>
                    ))}
                </div>

                <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Share your experience with SmartPath..."
                    maxLength={500}
                    rows={4}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 resize-none transition-all"
                />
                <p className="text-right text-xs text-slate-400 mt-1">{review.length}/500</p>

                {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="mt-4 w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {submitting ? "Submitting..." : "Submit Review"}
                </button>
            </div>
        </div>
    );
}
