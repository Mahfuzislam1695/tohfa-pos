import { Loader } from "lucide-react";

export function LoadingCenter({
    message = "Loading...",
    size = "lg"
}: {
    message?: string;
    size?: "sm" | "md" | "lg";
}) {
    const sizeClasses = {
        sm: "h-6 w-6",
        md: "h-8 w-8",
        lg: "h-12 w-12"
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
            <div className="flex flex-col items-center justify-center gap-4">
                <Loader className={`${sizeClasses[size]} animate-spin text-primary`} />
                <p className="text-muted-foreground">{message}</p>
            </div>
        </div>
    );
}