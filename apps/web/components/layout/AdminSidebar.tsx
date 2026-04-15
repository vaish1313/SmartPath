"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, CalendarCheck, FlaskRound, FileText, CreditCard, Microscope, UserCog, Package, LogOut, Tag, Star } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const nav = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/patients", icon: Users, label: "Patients" },
    { href: "/admin/bookings", icon: CalendarCheck, label: "Bookings" },
    { href: "/admin/tests", icon: FlaskRound, label: "Tests" },
    { href: "/admin/packages", icon: Package, label: "Packages" },
    { href: "/admin/offers", icon: Tag, label: "Offers" },
    { href: "/admin/lab", icon: Microscope, label: "Lab" },
    { href: "/admin/reports", icon: FileText, label: "Reports" },
    { href: "/admin/billing", icon: CreditCard, label: "Billing" },
    { href: "/admin/reviews", icon: Star, label: "Reviews" },
];

// Only shown to admin role
const adminOnlyNav = [
    { href: "/admin/staff", icon: UserCog, label: "Staff Management" },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const logout = useAuthStore((s) => s.logout);
    const user = useAuthStore((s) => s.user);

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
                <div>
                    <p className="text-slate-800 font-semibold text-sm leading-tight">SmartPath</p>
                    <p className="text-[#1D9E75] text-[10px] font-medium uppercase tracking-wider">Admin</p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-5 space-y-0.5">
                {nav.map(({ href, icon: Icon, label }) => {
                    const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
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

                {/* Admin-only section */}
                {user?.role === "admin" && (
                    <>
                        <div className="pt-3 pb-1 px-3">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Admin Only</p>
                        </div>
                        {adminOnlyNav.map(({ href, icon: Icon, label }) => {
                            const active = pathname.startsWith(href);
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? "bg-[#E1F5EE] text-[#1D9E75]" : "text-slate-600 hover:bg-slate-50"}`}
                                >
                                    <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
                                    {label}
                                </Link>
                            );
                        })}
                    </>
                )}
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
