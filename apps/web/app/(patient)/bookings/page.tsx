"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getMyBookings, cancelBooking, getPatientInvoices, getReviewByBooking } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { FlaskConical, Clock, Calendar, ChevronRight, Search, Plus, Loader2, X, Star } from "lucide-react";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import PayNowButton from "@/components/PayNowButton";
import ReviewModal from "@/components/patient/ReviewModal";
import axios from "axios";

interface Booking {
  _id: string;
  bookingId: string;
  tests: { testName: string; price: number }[];
  scheduledDate: string;
  scheduledTime: string;
  bookingType: string;
  status: string;
  finalAmount: number;
}

interface Invoice {
  _id: string;
  bookingId: string;
  paymentStatus: string;
  balanceAmount: number;
  finalAmount: number;
}

const STATUS_STYLE: Record<string, string> = {
  completed: "bg-teal-50 text-teal-700 border-teal-200",
  processing: "bg-amber-50 text-amber-700 border-amber-200",
  pending: "bg-slate-100 text-slate-600 border-slate-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
  "sample-collected": "bg-purple-50 text-purple-700 border-purple-200",
};

const FILTERS = ["All", "Pending", "Processing", "Completed", "Cancelled"];

export default function BookingsPage() {
  const searchParams = useSearchParams();
  const paymentSuccess = searchParams?.get("payment") === "success";
  const user = useAuthStore((s) => s.user);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [invoiceMap, setInvoiceMap] = useState<Record<string, Invoice>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [reviewBooking, setReviewBooking] = useState<{ id: string; ref: string } | null>(null);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());

  const fetchBookings = useCallback(() => {
    setLoading(true);
    getMyBookings(page, 20)
      .then((res) => {
        const fetched: Booking[] = res.data.bookings || [];
        setBookings(fetched);
        setTotalPages(res.data.totalPages || 1);
        // Check which completed bookings already have a review
        const completed = fetched.filter((b) => b.status === "completed");
        Promise.all(completed.map((b) => getReviewByBooking(b._id).then((r) => r.data.review ? b._id : null).catch(() => null)))
          .then((results) => {
            setReviewedIds(new Set(results.filter(Boolean) as string[]));
          });
      })
      .catch((err) => {
        if (!axios.isAxiosError(err) || err.response?.status !== 401) console.error(err);
      })
      .finally(() => setLoading(false));
  }, [page]);

  // Fetch all patient invoices once and build a bookingId → invoice map
  useEffect(() => {
    if (!user?.id) return;
    getPatientInvoices(user.id)
      .then((res) => {
        const map: Record<string, Invoice> = {};
        (res.data.invoices || []).forEach((inv: Invoice) => {
          map[String(inv.bookingId)] = inv;
        });
        setInvoiceMap(map);
      })
      .catch(() => { /* non-critical */ });
  }, [user?.id]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleCancel = async () => {
    if (!cancelId) return;
    setCancelling(true);
    try {
      await cancelBooking(cancelId);
      setBookings((prev) => prev.map((b) => b._id === cancelId ? { ...b, status: "cancelled" } : b));
    } catch (err) {
      console.error(err);
    } finally {
      setCancelling(false);
      setCancelId(null);
    }
  };

  const filtered = bookings.filter((b) => {
    const matchSearch =
      b.bookingId?.toLowerCase().includes(search.toLowerCase()) ||
      b.tests.some((t) => t.testName.toLowerCase().includes(search.toLowerCase()));
    const matchFilter =
      activeFilter === "All" ||
      (activeFilter === "Pending" && ["pending", "confirmed"].includes(b.status)) ||
      (activeFilter === "Processing" && ["processing", "sample-collected"].includes(b.status)) ||
      (activeFilter === "Completed" && b.status === "completed") ||
      (activeFilter === "Cancelled" && b.status === "cancelled");
    return matchSearch && matchFilter;
  });

  return (
    <>
      <main className="flex-1 p-6 max-w-3xl mx-auto w-full">
        {paymentSuccess && (
          <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 mb-5 text-teal-700 text-sm font-medium">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            Payment successful! Your invoice has been marked as paid.
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">My Bookings</h1>
            <p className="text-slate-500 text-sm mt-0.5">{bookings.length} total bookings</p>
          </div>
          <Link href="/book-test" className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-md shadow-teal-200">
            <Plus className="w-4 h-4" /> Book test
          </Link>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            placeholder="Search by test or booking ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-700 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all shadow-sm"
          />
        </div>

        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={`text-xs px-3.5 py-1.5 rounded-full border whitespace-nowrap transition-all font-medium ${activeFilter === f ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}>
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <FlaskConical className="w-12 h-12 text-slate-200 mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-slate-400 text-sm">No bookings found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((b) => {
              const invoice = invoiceMap[b._id];
              const hasUnpaidInvoice = invoice && invoice.paymentStatus !== "paid";

              return (
                <div key={b._id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-teal-600 text-xs font-mono font-semibold">#{b.bookingId}</span>
                        <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border capitalize ${STATUS_STYLE[b.status] || STATUS_STYLE.pending}`}>
                          {b.status.replace("-", " ")}
                        </span>
                        {invoice && (
                          <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border capitalize ${invoice.paymentStatus === "paid" ? "bg-teal-50 text-teal-700 border-teal-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                            {invoice.paymentStatus === "paid" ? "Paid" : `Due ₹${invoice.balanceAmount}`}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-700 text-sm font-semibold">
                        {b.tests.map((t) => t.testName).join(", ").slice(0, 60)}
                        {b.tests.map((t) => t.testName).join(", ").length > 60 ? "..." : ""}
                      </p>
                    </div>
                    <Link href={`/bookings/${b._id}`} className="text-slate-300 hover:text-slate-500 transition-colors ml-2">
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 text-slate-400 text-xs">
                        <Calendar className="w-3 h-3" />
                        {new Date(b.scheduledDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-400 text-xs">
                        <Clock className="w-3 h-3" /> {b.scheduledTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-teal-600 font-bold text-sm">₹{b.finalAmount}</span>
                      {hasUnpaidInvoice && (
                        <PayNowButton
                          invoiceId={invoice._id}
                          amount={invoice.balanceAmount}
                          patientName={user?.fullName || ""}
                          patientPhone={user?.phone || ""}
                        />
                      )}
                      {["pending", "confirmed"].includes(b.status) && !hasUnpaidInvoice && (
                        <button onClick={() => setCancelId(b._id)} className="text-red-400 hover:text-red-600 transition-colors" title="Cancel">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      {b.status === "completed" && !reviewedIds.has(b._id) && (
                        <button
                          onClick={() => setReviewBooking({ id: b._id, ref: b.bookingId })}
                          className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 border border-amber-200 hover:border-amber-300 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg transition-all"
                        >
                          <Star className="w-3 h-3" /> Review
                        </button>
                      )}
                      {b.status === "completed" && reviewedIds.has(b._id) && (
                        <span className="flex items-center gap-1 text-xs text-teal-600 font-medium">
                          <Star className="w-3 h-3 fill-teal-500 text-teal-500" /> Reviewed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-4 py-2 text-sm bg-white border border-slate-200 rounded-xl disabled:opacity-40 hover:border-teal-300 transition-all">Prev</button>
            <span className="px-4 py-2 text-sm text-slate-500">{page} / {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-4 py-2 text-sm bg-white border border-slate-200 rounded-xl disabled:opacity-40 hover:border-teal-300 transition-all">Next</button>
          </div>
        )}
      </main>

      <ConfirmDialog
        open={!!cancelId}
        title="Cancel Booking"
        description="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmLabel="Cancel Booking"
        loading={cancelling}
        onConfirm={handleCancel}
        onCancel={() => setCancelId(null)}
      />

      {reviewBooking && (
        <ReviewModal
          bookingId={reviewBooking.id}
          bookingRef={reviewBooking.ref}
          onClose={() => setReviewBooking(null)}
          onSubmitted={() => {
            setReviewedIds((prev) => new Set([...prev, reviewBooking.id]));
            setReviewBooking(null);
          }}
        />
      )}
    </>
  );
}
