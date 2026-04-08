import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

export default function ContactPage() {
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
                        <h1 className="text-4xl font-bold text-white mb-3" style={{ fontFamily: "'Instrument Serif', serif" }}>Contact Us</h1>
                        <p className="text-teal-200/70 max-w-md mx-auto">We're here to help. Reach out for appointments, queries, or support.</p>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-6 lg:px-8 py-14 grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Info */}
                    <div className="space-y-5">
                        <h2 className="text-xl font-bold text-slate-800">Get in touch</h2>
                        {[
                            { icon: Phone, label: "Phone", value: "+91 98765 43210", sub: "Mon–Sat, 7am–8pm" },
                            { icon: Mail, label: "Email", value: "info@prathameshdiagnostic.in", sub: "We reply within 24 hours" },
                            { icon: MapPin, label: "Address", value: "Prathamesh Diagnostic Center", sub: "Nashik, Maharashtra 422001" },
                            { icon: Clock, label: "Hours", value: "Mon–Sat: 7:00 AM – 8:00 PM", sub: "Sunday: 8:00 AM – 2:00 PM" },
                        ].map(({ icon: Icon, label, value, sub }) => (
                            <div key={label} className="flex items-start gap-4 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                                    <Icon className="w-5 h-5 text-teal-600" strokeWidth={1.8} />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">{label}</p>
                                    <p className="text-slate-800 font-semibold text-sm mt-0.5">{value}</p>
                                    <p className="text-slate-400 text-xs">{sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Form */}
                    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-5">Send a message</h2>
                        <form className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">First Name</label>
                                    <input type="text" placeholder="Priya" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Last Name</label>
                                    <input type="text" placeholder="Sharma" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</label>
                                <input type="email" placeholder="you@example.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone</label>
                                <input type="tel" placeholder="+91 98765 43210" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Message</label>
                                <textarea rows={4} placeholder="How can we help you?" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all resize-none" />
                            </div>
                            <button type="submit" className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-slate-300">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
