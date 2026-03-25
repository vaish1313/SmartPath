"use client";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    fullScreen?: boolean;
}

const sizeMap = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-16 h-16",
};

export default function LoadingSpinner({ size = "md", fullScreen = false }: LoadingSpinnerProps) {
    const spinner = (
        <div
            className={`${sizeMap[size]} rounded-full border-2 border-transparent border-t-cyan-500 border-r-cyan-500 animate-spin`}
        />
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#060B14]/80 backdrop-blur-sm">
                {spinner}
            </div>
        );
    }

    return spinner;
}
