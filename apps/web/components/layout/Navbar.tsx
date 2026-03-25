import Link from "next/link";
import { FlaskConical, ArrowRight } from "lucide-react";

export default function Navbar() {
    return (
        <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 lg:px-16 h-16 border-b border-white/[0.06] bg-[#060B14]/80 backdrop-blur-xl">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#14D7B4] to-[#0EA5E9] flex items-center justify-center shadow-lg shadow-[#14D7B4]/20">
                    <FlaskConical className="w-4 h-4 text-white" strokeWidth={1.8} />
                </div>
                <span className="text-white font-semibold text-base tracking-tight">SmartPath</span>
            </Link>

            {/* Nav links */}
            <div className="hidden md:flex items-center gap-8">
                {["Tests", "How it Works", "About", "Contact"].map((l) => (
                    <Link
                        key={l}
                        href={`/${l.toLowerCase().replace(/ /g, "-")}`}
                        className="text-[#778899] hover:text-white text-sm transition-colors"
                    >
                        {l}
                    </Link>
                ))}
            </div>

            {/* CTA */}
            <div className="flex items-center gap-3">
                <Link href="/login" className="text-[#8899AA] hover:text-white text-sm transition-colors hidden sm:block">
                    Sign in
                </Link>
                <Link
                    href="/register"
                    className="flex items-center gap-1.5 bg-gradient-to-r from-[#14D7B4] to-[#0EA5E9] text-[#060B14] font-semibold text-sm px-4 py-2 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-[#14D7B4]/20"
                >
                    Get started
                    <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>
        </nav>
    );
}
