import { Check } from "lucide-react";

interface Props {
    steps: string[];
    current: number;
}

export default function StepIndicator({ steps, current }: Props) {
    return (
        <div className="flex items-center">
            {steps.map((s, i) => (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < current ? "bg-teal-500 text-white" : i === current ? "bg-teal-600 text-white ring-4 ring-teal-100" : "bg-slate-100 text-slate-400"
                            }`}>
                            {i < current ? <Check className="w-4 h-4" strokeWidth={2.5} /> : i + 1}
                        </div>
                        <span className={`text-xs font-semibold hidden sm:block ${i === current ? "text-slate-800" : i < current ? "text-teal-600" : "text-slate-400"}`}>{s}</span>
                    </div>
                    {i < steps.length - 1 && (
                        <div className="flex-1 mx-3 h-px bg-slate-200 relative overflow-hidden">
                            <div className="absolute inset-y-0 left-0 bg-teal-500 transition-all duration-500" style={{ width: i < current ? "100%" : "0%" }} />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
