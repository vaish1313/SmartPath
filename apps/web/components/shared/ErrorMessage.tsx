import { AlertCircle } from "lucide-react";

interface Props { message: string; }

export default function ErrorMessage({ message }: Props) {
    return (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {message}
        </div>
    );
}
