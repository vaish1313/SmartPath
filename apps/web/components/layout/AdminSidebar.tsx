"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FlaskConical, LayoutDashboard, Users, CalendarCheck, FlaskRound, FileText, CreditCard, LogOut, Microscope, UserCog, Package } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const nav = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/patients", icon: Users, label: "Patients" },
    { href: "/admin/bookings", icon: CalendarCheck, label: "Bookings" },
    { href: "/admin/tests", icon: FlaskRound, label: "Tests" },
    { href: "/admin/packages", icon: Package, label: "Packages" },
    { href: "/admin/lab", icon: Microscope, label: "Lab" },
    { href: "/admin/reports", icon: FileText, label: "Reports" },
    { href: "/admin/billing", icon: CreditCard, label: "Billing" },
];

// Only shown to admin role
const adminOnlyNav = [
    { href: "/dashboard/admin/staff", icon: UserCog, label: "Staff Management" },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const logout = useAuthStore((s) => s.logout);
    const user = useAuthStore((s) => s.user);

    return (
        <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-slate-100 shadow-sm">
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-6 h-16 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-md">
                    <FlaskConical className="w-4 h-4 text-white" strokeWidth={1.8} />
                </div>
                <div>
                    <p className="text-slate-800 font-bold text-sm leading-tight">SmartPath</p>
                    <p className="text-teal-600 text-[10px] font-semibold uppercase tracking-wider">Admin Panel</p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-5 space-y-1">
                {nav.map(({ href, icon: Icon, label }) => {
                    const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? "bg-teal-50 text-teal-700 shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                                }`}
                        >
                            <Icon className={`w-4 h-4 ${active ? "text-teal-600" : "text-slate-400"}`} strokeWidth={1.8} />
                            {label}
                        </Link>
                    );
                })}

                {/* Admin-only section */}
                {user?.role === "admin" && (
                    <>
                        <div className="pt-3 pb-1 px-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin Only</p>
                        </div>
                        {adminOnlyNav.map(({ href, icon: Icon, label }) => {
                            const active = pathname.startsWith(href);
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? "bg-teal-50 text-teal-700 shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}
                                >
                                    <Icon className={`w-4 h-4 ${active ? "text-teal-600" : "text-slate-400"}`} strokeWidth={1.8} />
                                    {label}
                                </Link>
                            );
                        })}
                    </>
                )}
            </nav>

            {/* Logout */}
            <div className="px-3 pb-5">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
                >
                    <LogOut className="w-4 h-4" strokeWidth={1.8} />
                    Sign out
                </button>
            </div>
        </aside>
    );
}
