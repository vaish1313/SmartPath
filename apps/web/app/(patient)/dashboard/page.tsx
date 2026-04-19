"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getMyBookings, getProfile, getPatientResults } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    CalendarCheck, FileText, ArrowRight,
    FlaskConical, Upload, User, MapPin, Droplet, AlertCircle, TrendingUp, Clock
} from "lucide-react";
import axios from "axios";
import PageLoader from "@/components/shared/PageLoader";

interface Booking {
    _id: string;
    bookingId: string;
    tests: { testName: string; price: number }[];
    status: string;
    scheduledDate: string;
    scheduledTime: string;
    finalAmount: number;
    paymentStatus?: string;
}

interface Profile {
    fullName: string;
    email: string;
    phone: string;
    patientId: string;
    dateOfBirth?: string;
    gender?: string;
    bloodGroup?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        pincode?: string;
    };
    medicalHistory?: {
        condition: string;
        diagnosedDate?: string;
        notes?: string;
    }[];
    createdAt: string;
}

interface TestResult {
    _id: string;
    tests: {
        testName: string;
        value: string;
        unit: string;
        status?: string;
    }[];
    createdAt: string;
}

const statusStyle: Record<string, string> = {
    completed: "bg-blue-50 text-blue-700",
    processing: "bg-amber-50 text-amber-700",
    pending: "bg-slate-100 text-slate-600",
    confirmed: "bg-blue-50 text-blue-700",
    cancelled: "bg-red-50 text-red-600",
    "sample-collected": "bg-purple-50 text-purple-700",
};

function buildHealthTrend(bookings: Booking[]) {
    const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
    const now = new Date();
    return months.map((month, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
        const count = bookings.filter((b) => {
            const bd = new Date(b.scheduledDate);
            return bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear();
        }).length;
        return { month, tests: count };
    });
}

function HealthActivityChart({ data }: { data: { month: string; tests: number }[] }) {
    const total = data.reduce((s, d) => s + d.tests, 0);

    return (
        <div className="glass-premium-hover rounded-2xl p-4 w-full flex flex-col justify-between" style={{ height: '100%' }}>
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="text-slate-800 font-semibold text-base">Health activity</h3>
                    <p className="text-slate-500 text-sm mt-0.5">{total} tests over 6 months</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-teal-50 to-emerald-50 text-[#1D9E75] border border-teal-200/50 shadow-sm">
                    Active
                </span>
            </div>

            {/* SVG Line Chart */}
            <div className="relative w-full flex-1 flex flex-col justify-center">
                <svg width="100%" height="110" viewBox="0 0 600 100" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1="0" y1="25" x2="600" y2="25" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="50" x2="600" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="75" x2="600" y2="75" stroke="#f1f5f9" strokeWidth="1" />

                    {/* Smooth upward curve - starts low at Nov, peaks at Apr */}
                    <path
                        d="M 0 75 Q 120 70, 200 55 T 400 30 T 600 15"
                        fill="none"
                        stroke="#1D9E75"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                    />

                    {/* End point dot at Apr */}
                    <circle cx="600" cy="15" r="5" fill="#1D9E75" />
                    <circle cx="600" cy="15" r="9" fill="#1D9E75" opacity="0.2" />
                </svg>

                {/* X-axis labels */}
                <div className="flex justify-between mt-2">
                    {data.map((d) => (
                        <span key={d.month} className="text-xs text-slate-400">{d.month}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, sub, dotColor }: {
    label: string; value: number; sub: string; dotColor: string;
}) {
    return (
        <div className="glass-premium-hover rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2.5">
                <div className={`w-2 h-2 rounded-full ${dotColor} shadow-sm`} />
                <span className="text-slate-600 text-sm font-medium">{label}</span>
            </div>
            <p className="text-2xl font-bold text-slate-800 mb-0.5">{value}</p>
            <p className="text-slate-500 text-xs">{sub}</p>
        </div>
    );
}

function MetricCard({ label, value, note, bgColor, textColor }: {
    label: string; value: string; note: string; bgColor: string; textColor: string;
}) {
    return (
        <div className={`rounded-lg p-3 ${bgColor}`} style={{ flex: 1, minHeight: 0 }}>
            <div className={`text-xs font-semibold mb-1 ${textColor}`}>{label}</div>
            <div className={`text-lg font-bold mb-0.5 ${textColor}`}>{value}</div>
            <div className={`text-xs ${textColor} opacity-70`}>{note}</div>
        </div>
    );
}

export default function DashboardPage() {
    const user = useAuthStore((s) => s.user);
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [results, setResults] = useState<TestResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [pageLoading, setPageLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            getMyBookings(1, 20),
            getProfile(),
            getPatientResults(user?.id || "").catch(() => ({ data: { results: [] } }))
        ])
            .then(([bookingsRes, profileRes, resultsRes]) => {
                setBookings(bookingsRes.data.bookings || []);
                setProfile(profileRes.data.patient || profileRes.data);
                setResults(resultsRes.data.results || []);
            })
            .catch((err) => {
                if (!axios.isAxiosError(err) || err.response?.status !== 401) console.error(err);
            })
            .finally(() => {
                setLoading(false);
                setPageLoading(false);
            });
    }, [user?.id]);

    const total = bookings.length;
    const completed = bookings.filter((b) => b.status === "completed").length;
    const pending = bookings.filter((b) => ["pending", "confirmed", "sample-collected", "processing"].includes(b.status)).length;
    const cancelled = bookings.filter((b) => b.status === "cancelled").length;
    const upcoming = bookings.filter((b) => new Date(b.scheduledDate) > new Date() && b.status !== "cancelled");
    const recent = bookings.slice(0, 5);
    const trendData = buildHealthTrend(bookings);

    // Extract latest health metrics from test results
    const getLatestMetric = (testName: string) => {
        const result = results
            .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
            .flatMap(r => r.tests)
            .find(t => t.testName.toLowerCase().includes(testName.toLowerCase()));
        return result || null;
    };

    const bloodGlucose = getLatestMetric("glucose") || getLatestMetric("sugar");
    const haemoglobin = getLatestMetric("haemoglobin") || getLatestMetric("hb");
    const vitaminD = getLatestMetric("vitamin d");
    const cholesterol = getLatestMetric("cholesterol");

    // Calculate age from date of birth
    const calculateAge = (dob?: string) => {
        if (!dob) return null;
        const diff = Date.now() - new Date(dob).getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    };

    const age = calculateAge(profile?.dateOfBirth);

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    const today = new Date();
    const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
    const day = today.getDate();
    const month = today.toLocaleDateString("en-US", { month: "long" });

    if (pageLoading) {
        return <PageLoader message="Loading dashboard..." />;
    }

    return (
        <main className="flex-1 p-5 bg-[#F5F5F3] overflow-auto">
            {/* Topbar */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white" style={{ border: "0.5px solid rgba(0,0,0,0.1)" }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1D9E75]" />
                    <span className="text-slate-600 text-sm">{dayName}, {day} {month}</span>
                </div>
                <button
                    onClick={() => router.push("/profile")}
                    className="w-9 h-9 rounded-full bg-[#E1F5EE] flex items-center justify-center hover:bg-[#C8EDE1] transition-colors cursor-pointer"
                >
                    <span className="text-[#1D9E75] text-sm font-semibold">
                        {user?.fullName ? user.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "VK"}
                    </span>
                </button>
            </div>

            {/* Greeting */}
            <div className="mb-5">
                <h1 className="text-2xl font-semibold text-slate-800 mb-0.5">
                    {greeting}{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}
                </h1>
                <p className="text-slate-500 text-sm">Here&apos;s your health summary for today</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                <StatCard
                    label="Total Bookings"
                    value={total}
                    sub={total === 0 ? "No bookings yet" : `${total} booking${total > 1 ? 's' : ''}`}
                    dotColor="bg-[#1D9E75]"
                />
                <StatCard
                    label="Completed"
                    value={completed}
                    sub={completed === 0 ? "Book your first test" : `${completed} completed`}
                    dotColor="bg-[#378ADD]"
                />
                <StatCard
                    label="In Progress"
                    value={pending}
                    sub={pending === 0 ? "Nothing active" : `${pending} in progress`}
                    dotColor="bg-[#EF9F27]"
                />
                <StatCard
                    label="Cancelled"
                    value={cancelled}
                    sub="—"
                    dotColor="bg-[#E24B4A]"
                />
            </div>

            {/* Personal Info Card */}
            {profile && (
                <div className="glass-premium rounded-2xl p-5 mb-5 hover:shadow-premium-hover transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-800 font-semibold text-base">Personal Information</h3>
                        <Link href="/profile" className="text-[#1D9E75] text-sm font-medium hover:underline">
                            Edit Profile
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <User className="w-4 h-4 text-slate-400" />
                                <span className="text-xs text-slate-500 font-medium">Patient ID</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-800">{profile.patientId || "—"}</p>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Droplet className="w-4 h-4 text-slate-400" />
                                <span className="text-xs text-slate-500 font-medium">Blood Group</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-800">{profile.bloodGroup || "Not set"}</p>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <User className="w-4 h-4 text-slate-400" />
                                <span className="text-xs text-slate-500 font-medium">Age / Gender</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-800">
                                {age ? `${age} yrs` : "—"} / {profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : "—"}
                            </p>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                <span className="text-xs text-slate-500 font-medium">Location</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-800">
                                {profile.address?.city || "Not set"}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Medical History */}
            {profile?.medicalHistory && profile.medicalHistory.length > 0 && (
                <div className="glass-premium rounded-2xl p-5 mb-5 hover:shadow-premium-hover transition-all duration-300">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                        <h3 className="text-slate-800 font-semibold text-base">Medical History</h3>
                    </div>
                    <div className="space-y-3">
                        {profile.medicalHistory.map((item, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                                <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-slate-800">{item.condition}</p>
                                    {item.diagnosedDate && (
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Diagnosed: {new Date(item.diagnosedDate).toLocaleDateString("en-IN")}
                                        </p>
                                    )}
                                    {item.notes && (
                                        <p className="text-xs text-slate-600 mt-1">{item.notes}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upcoming Appointments */}
            {upcoming.length > 0 && (
                <div className="bg-gradient-to-r from-[#1D9E75] to-[#17856a] rounded-lg p-5 mb-5 text-white">
                    <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-5 h-5" />
                        <h3 className="font-semibold text-base">Upcoming Appointments</h3>
                    </div>
                    <div className="space-y-2">
                        {upcoming.slice(0, 2).map((b) => (
                            <Link key={b._id} href={`/bookings/${b._id}`}
                                className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                                <div>
                                    <p className="text-sm font-medium">
                                        {b.tests.map((t) => t.testName).join(", ").slice(0, 40)}
                                    </p>
                                    <p className="text-xs opacity-90 mt-0.5">
                                        {new Date(b.scheduledDate).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" })} at {b.scheduledTime}
                                    </p>
                                </div>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Mid Row - Activity Chart + Metrics */}
            <div className="grid gap-3 mb-5" style={{ gridTemplateColumns: '1fr 280px', alignItems: 'stretch' }}>
                <div className="w-full">
                    {loading ? (
                        <div className="bg-white rounded-lg w-full h-full animate-pulse" style={{ border: "0.5px solid rgba(0,0,0,0.1)" }} />
                    ) : (
                        <HealthActivityChart data={trendData} />
                    )}
                </div>
                <div className="flex flex-col gap-2.5" style={{ width: '280px' }}>
                    <MetricCard
                        label="Blood Glucose"
                        value={bloodGlucose ? `${bloodGlucose.value} ${bloodGlucose.unit || 'mg/dL'}` : "No data"}
                        note={bloodGlucose ? (bloodGlucose.status === 'normal' ? "Normal range" : "Check results") : "Book a test"}
                        bgColor="bg-[#E1F5EE]"
                        textColor="text-[#0F6E56]"
                    />
                    <MetricCard
                        label="Haemoglobin"
                        value={haemoglobin ? `${haemoglobin.value} ${haemoglobin.unit || 'g/dL'}` : "No data"}
                        note={haemoglobin ? (haemoglobin.status === 'normal' ? "Normal range" : "Check results") : "Book a test"}
                        bgColor="bg-[#E6F1FB]"
                        textColor="text-[#2563EB]"
                    />
                    <MetricCard
                        label="Vitamin D"
                        value={vitaminD ? `${vitaminD.value} ${vitaminD.unit || 'ng/mL'}` : "No data"}
                        note={vitaminD ? (vitaminD.status === 'normal' ? "Sufficient" : "Check results") : "Book a test"}
                        bgColor="bg-[#FAEEDA]"
                        textColor="text-[#B45309]"
                    />
                    <MetricCard
                        label="Cholesterol"
                        value={cholesterol ? `${cholesterol.value} ${cholesterol.unit || 'mg/dL'}` : "No data"}
                        note={cholesterol ? (cholesterol.status === 'normal' ? "Desirable" : "Check results") : "Book a test"}
                        bgColor="bg-[#EEEDFE]"
                        textColor="text-[#534AB7]"
                    />
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                <button
                    onClick={() => router.push("/book-test?prescription=true")}
                    className="bg-[#0F6E56] hover:bg-[#0d5f49] rounded-lg p-5 flex flex-col items-center gap-2.5 transition-colors"
                >
                    <div className="w-11 h-11 rounded-lg bg-white/10 flex items-center justify-center">
                        <Upload className="w-5 h-5 text-white" strokeWidth={2} />
                    </div>
                    <div className="text-center">
                        <div className="text-white text-sm font-semibold mb-0.5">Upload Prescription</div>
                        <div className="text-white/70 text-xs">Snap or upload</div>
                    </div>
                </button>

                <Link href="/book-test" className="glass-premium-hover rounded-2xl p-5 flex flex-col items-center gap-2.5">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center shadow-sm border border-teal-100">
                        <FlaskConical className="w-5 h-5 text-[#1D9E75]" strokeWidth={2} />
                    </div>
                    <div className="text-center">
                        <div className="text-slate-800 text-sm font-semibold mb-0.5">Book a Test</div>
                        <div className="text-slate-500 text-xs">42 tests available</div>
                    </div>
                </Link>

                <Link href="/bookings" className="glass-premium-hover rounded-2xl p-5 flex flex-col items-center gap-2.5">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center shadow-sm border border-blue-100">
                        <CalendarCheck className="w-5 h-5 text-[#378ADD]" strokeWidth={2} />
                    </div>
                    <div className="text-center">
                        <div className="text-slate-800 text-sm font-semibold mb-0.5">My Bookings</div>
                        <div className="text-slate-500 text-xs">View & manage</div>
                    </div>
                </Link>

                <Link href="/reports" className="glass-premium-hover rounded-2xl p-5 flex flex-col items-center gap-2.5">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center shadow-sm border border-purple-100">
                        <FileText className="w-5 h-5 text-[#534AB7]" strokeWidth={2} />
                    </div>
                    <div className="text-center">
                        <div className="text-slate-800 text-sm font-semibold mb-0.5">My Reports</div>
                        <div className="text-slate-500 text-xs">Download & share</div>
                    </div>
                </Link>
            </div>

            {/* Recent Bookings */}
            <div className="glass-premium rounded-2xl p-5 hover:shadow-premium-hover transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-800 font-semibold text-base">Recent bookings</h3>
                    <Link href="/bookings" className="text-[#1D9E75] text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                        View all <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {loading ? (
                    <div className="space-y-2.5">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : recent.length === 0 ? (
                    <div className="text-center py-10">
                        <FlaskConical className="w-11 h-11 text-slate-300 mx-auto mb-2.5" strokeWidth={1.5} />
                        <p className="text-slate-600 text-sm font-medium mb-0.5">No bookings yet</p>
                        <p className="text-slate-400 text-sm mb-3.5">Book your first test to get started</p>
                        <Link href="/book-test" className="inline-flex items-center gap-2 text-[#1D9E75] text-sm font-semibold hover:gap-3 transition-all">
                            Book a test <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        {recent.map((b) => (
                            <Link key={b._id} href={`/bookings/${b._id}`}
                                className="flex items-center justify-between py-2.5 px-3 hover:bg-slate-50 rounded-lg transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-[#E1F5EE] flex items-center justify-center shrink-0">
                                        <FlaskConical className="w-4 h-4 text-[#1D9E75]" strokeWidth={2} />
                                    </div>
                                    <div>
                                        <p className="text-slate-800 text-sm font-medium leading-tight">
                                            {b.tests.map((t) => t.testName).join(", ").slice(0, 40)}{b.tests.length > 1 ? "…" : ""}
                                        </p>
                                        <p className="text-slate-500 text-xs mt-0.5">
                                            {new Date(b.scheduledDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })} · {b.scheduledTime}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusStyle[b.status] || statusStyle.pending}`}>
                                        {b.status.replace("-", " ")}
                                    </span>
                                    <span className="text-slate-800 font-semibold text-sm">₹{b.finalAmount}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
