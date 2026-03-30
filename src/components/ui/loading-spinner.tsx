import { cn } from "@/lib/utils";

export default function Loadingspinner({ className }: { className?: string }) {
    return (
        <div className={cn("animate-spin rounded-full h-5 w-5 border-2 border-zinc-200 border-t-zinc-600", className)} />
    );
}
