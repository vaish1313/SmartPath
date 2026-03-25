export default function MarqueeBar() {
    return (
        <div className="border-y border-white/[0.06] py-4 overflow-hidden bg-white/[0.02]">
            <div className="flex gap-12 animate-marquee whitespace-nowrap">
                {[...Array(3)].map((_, i) =>
                    ["CBC · Complete Blood Count", "Lipid Profile", "Thyroid Panel", "HbA1c", "Liver Function Test", "Kidney Function Test", "Vitamin D & B12", "COVID Antibody Test", "Urine Routine", "Blood Sugar Fasting"].map((t) => (
                        <span key={`${i}-${t}`} className="text-[#445566] text-sm flex items-center gap-3">
                            <span className="text-[#14D7B4]">✦</span> {t}
                        </span>
                    ))
                )}
            </div>
        </div>
    );
}
