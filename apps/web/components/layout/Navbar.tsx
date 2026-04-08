import Link from "next/link";
import { FlaskConical, ArrowRight } from "lucide-react";

export default function Navbar() {
    return (
        <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 lg:px-16 h-16 border-b border-slate-200 bg-white/95 backdrop-blur-xl shadow-sm">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-md">
                    <FlaskConical className="w-4 h-4 text-white" strokeWidth={1.8} />
                </div>
                <span className="text-[#1a2332] font-bold text-base tracking-tight">SmartPath</span>
            </Link>

            {/* Nav links */}
            <div className="hidden md:flex items-center gap-8">
                {["Tests", "About", "Contact"].map((l) => (
                    <Link
                        key={l}
                        href={`/${l.toLowerCase().replace(/ /g, "-")}`}
                        className="text-slate-500 hover:text-teal-600 text-sm font-medium transition-colors"
                    >
                        {l}
                    </Link>
                ))}
            </div>

            {/* CTA */}
            <div className="flex items-center gap-3">
                <Link href="/login" className="text-slate-500 hover:text-teal-600 text-sm font-medium transition-colors hidden sm:block">
                    Sign in
                </Link>
                <Link
                    href="/register"
                    className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-all shadow-md shadow-teal-600/20"
                >
                    Get started
                    <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>
        </nav>
    );
}
