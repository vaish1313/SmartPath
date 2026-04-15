import { Loader2 } from "lucide-react";

interface PageLoaderProps {
    message?: string;
}

export default function PageLoader({ message = "Loading..." }: PageLoaderProps) {
    return (
        <div className="flex-1 flex items-center justify-center min-h-screen bg-[#F5F5F3]">
            <div className="text-center">
                <Loader2 className="w-10 h-10 text-[#1D9E75] animate-spin mx-auto mb-4" />
                <p className="text-slate-600 text-sm font-medium">{message}</p>
            </div>
        </div>
    );
}
