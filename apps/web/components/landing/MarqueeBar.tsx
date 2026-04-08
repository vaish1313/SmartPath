"use client";

const tests = [
    "Complete Blood Count",
    "Lipid Profile",
    "Thyroid Profile (T3/T4/TSH)",
    "HbA1c",
    "Liver Function Test",
    "Kidney Function Test",
    "Vitamin D",
    "Vitamin B12",
    "Urine Routine",
    "Blood Sugar Fasting",
    "Serum Creatinine",
    "Iron Studies",
    "Blood Sugar (PP)",
    "Dengue NS1 Antigen",
    "HBsAg (Hepatitis B)",
    "HIV Test",
    "Beta hCG (Pregnancy)",
    "FSH",
    "LH",
    "Prolactin",
    "AMH",
    "Pap Smear",
    "Semen Analysis",
    "Complete Health Checkup",
    "Diabetes Panel",
    "Cardiac Risk Panel",
    "Electrolytes Panel",
    "ESR",
    "CRP (C-Reactive Protein)",
    "PSA (Prostate Specific Antigen)",
];

export default function MarqueeBar() {
    return (
        <div className="relative py-5 overflow-hidden shadow-lg" style={{ background: "linear-gradient(135deg, #0f172a 0%, #0d2a27 60%, #0f2a2a 100%)" }}>
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{ background: "linear-gradient(to right, #0f172a, transparent)" }} />
            <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{ background: "linear-gradient(to left, #0f2a2a, transparent)" }} />

            <div className="flex animate-marquee whitespace-nowrap gap-0">
                {[...Array(2)].map((_, ri) =>
                    tests.map((t, i) => (
                        <span
                            key={`${ri}-${i}`}
                            className="inline-flex items-center gap-3 px-6 text-sm font-semibold text-white/90 tracking-wide"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-white/60 flex-shrink-0" />
                            {t}
                        </span>
                    ))
                )}
            </div>
        </div>
    );
}
