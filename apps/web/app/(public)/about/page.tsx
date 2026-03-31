import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CheckCircle, Award, Users, Clock } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <div className="pt-16">
                {/* Hero */}
                <div className="bg-gradient-to-br from-teal-600 to-cyan-600 py-20 px-6 lg:px-16 text-center">
                    <h1 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Instrument Serif', serif" }}>
                        About Prathamesh Diagnostic
                    </h1>
                    <p className="text-teal-100 max-w-xl mx-auto text-base leading-relaxed">
                        NABL accredited pathology lab in Nashik, delivering accurate diagnostics with compassion since 2005.
                    </p>
                </div>

                {/* Stats */}
                <div className="max-w-5xl mx-auto px-6 lg:px-8 -mt-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { icon: Users, value: "5000+", label: "Patients Served" },
                            { icon: Award, value: "NABL", label: "Accredited" },
                            { icon: CheckCircle, value: "200+", label: "Tests Available" },
                            { icon: Clock, value: "24hr", label: "Report Delivery" },
                        ].map(({ icon: Icon, value, label }) => (
                            <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-md p-5 text-center">
                                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mx-auto mb-3">
                                    <Icon className="w-5 h-5 text-teal-600" strokeWidth={1.8} />
                                </div>
                                <p className="text-2xl font-bold text-slate-800">{value}</p>
                                <p className="text-slate-500 text-xs mt-0.5">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-4xl mx-auto px-6 lg:px-8 py-16 space-y-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                        <div>
                            <span className="text-xs font-semibold text-teal-600 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full uppercase tracking-wider">Our Mission</span>
                            <h2 className="text-2xl font-bold text-slate-800 mt-4 mb-4" style={{ fontFamily: "'Instrument Serif', serif" }}>
                                Precision diagnostics for every patient
                            </h2>
                            <p className="text-slate-500 text-sm leading-relaxed mb-4">
                                At Prathamesh Advanced Diagnostic Center, we believe accurate diagnosis is the foundation of good healthcare. Our state-of-the-art laboratory is equipped with the latest technology to deliver precise results.
                            </p>
                            <div className="space-y-2">
                                {["ISO 15189 certified laboratory", "Experienced team of pathologists", "Quality-assured testing processes", "Digital reports with secure access"].map((item) => (
                                    <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
                                        <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-8 border border-teal-100">
                            <blockquote className="text-slate-700 text-base italic leading-relaxed mb-4">
                                "Accuracy in diagnosis is the first step towards effective treatment. We are committed to providing the highest quality diagnostic services to the people of Nashik."
                            </blockquote>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold">K</div>
                                <div>
                                    <p className="text-slate-800 font-semibold text-sm">Dr. Kishor Khodke</p>
                                    <p className="text-slate-400 text-xs">MD, Pathology · Founder</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
