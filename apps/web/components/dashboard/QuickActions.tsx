import Link from "next/link";
import { CalendarCheck, FileText, User, Phone } from "lucide-react";

const actions = [
    { href: "/book-test", icon: CalendarCheck, label: "Book a Test", desc: "Schedule new test", color: "teal" },
    { href: "/reports", icon: FileText, label: "My Reports", desc: "Download reports", color: "cyan" },
    { href: "/profile", icon: User, label: "Profile", desc: "Update details", color: "violet" },
    { href: "/contact", icon: Phone, label: "Support", desc: "Get help", color: "amber" },
];

const colorMap: Record<string, string> = {
    teal: "bg-teal-50 text-teal-600 group-hover:bg-teal-100",
    cyan: "bg-cyan-50 text-cyan-600 group-hover:bg-cyan-100",
    violet: "bg-violet-50 text-violet-600 group-hover:bg-violet-100",
    amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-100",
};

export default function QuickActions() {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-slate-800 font-bold text-base mb-5">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
                {actions.map(({ href, icon: Icon, label, desc, color }) => (
                    <Link key={href} href={href} className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all text-center">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${colorMap[color]}`}>
                            <Icon className="w-5 h-5" strokeWidth={1.8} />
                        </div>
                        <div>
                            <p className="text-slate-700 text-xs font-semibold">{label}</p>
                            <p className="text-slate-400 text-[10px]">{desc}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
