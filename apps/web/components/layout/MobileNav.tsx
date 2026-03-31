"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarCheck, ClipboardList, FileText, User } from "lucide-react";

const nav = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
    { href: "/book-test", icon: CalendarCheck, label: "Book" },
    { href: "/bookings", icon: ClipboardList, label: "Bookings" },
    { href: "/reports", icon: FileText, label: "Reports" },
    { href: "/profile", icon: User, label: "Profile" },
];

export default function MobileNav() {
    const pathname = usePathname();
    return (
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-100 shadow-lg flex">
            {nav.map(({ href, icon: Icon, label }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                    <Link key={href} href={href} className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-[10px] font-semibold transition-colors ${active ? "text-teal-600" : "text-slate-400"}`}>
                        <Icon className={`w-5 h-5 ${active ? "text-teal-600" : "text-slate-400"}`} strokeWidth={1.8} />
                        {label}
                    </Link>
                );
            })}
        </nav>
    );
}
