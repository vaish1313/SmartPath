"use client";

interface Props { size?: "sm" | "md" | "lg"; fullScreen?: boolean; }
const sizeMap = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-16 h-16" };

export default function LoadingSpinner({ size = "md", fullScreen = false }: Props) {
    const spinner = <div className={`${sizeMap[size]} rounded-full border-2 border-transparent border-t-teal-500 border-r-teal-500 animate-spin`} />;
    if (fullScreen) return <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">{spinner}</div>;
    return spinner;
}
