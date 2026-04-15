"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, CalendarCheck, FileText, User, ClipboardList, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const nav = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/book-test", icon: CalendarCheck, label: "Book a Test" },
    { href: "/bookings", icon: ClipboardList, label: "My Bookings" },
    { href: "/reports", icon: FileText, label: "Reports" },
    { href: "/profile", icon: User, label: "Profile" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const logout = useAuthStore((s) => s.logout);

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <aside className="hidden lg:flex flex-col w-[220px] min-h-screen bg-white" style={{ borderRight: "0.5px solid rgba(0,0,0,0.1)" }}>
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-5 h-16">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#1D9E75" />
                    <path d="M2 17L12 22L22 17V12L12 17L2 12V17Z" fill="#1D9E75" opacity="0.6" />
                </svg>
                <span className="text-slate-800 font-semibold text-base">SmartPath</span>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-5 space-y-0.5">
                {nav.map(({ href, icon: Icon, label }) => {
                    const active = pathname === href || pathname.startsWith(href + "/");
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? "bg-[#E1F5EE] text-[#1D9E75]" : "text-slate-600 hover:bg-slate-50"
                                }`}
                        >
                            <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout Button */}
            <div className="px-3 pb-5 pt-3" style={{ borderTop: "0.5px solid rgba(0,0,0,0.1)" }}>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                    <LogOut className="w-[18px] h-[18px]" strokeWidth={2} />
                    Logout
                </button>
            </div>
        </aside>
    );
}
