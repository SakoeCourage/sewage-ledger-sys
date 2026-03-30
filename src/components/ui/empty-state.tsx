import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
    caption?: string;
    className?: string;
    icon?: React.ReactNode;
}

export default function EmptyState({
    caption = 'No data recorded',
    className,
    icon,
}: EmptyStateProps) {
    return (
        <div className={cn('flex flex-col items-center justify-center p-12 text-center text-zinc-400 bg-white rounded-xl border border-zinc-50 shadow-sm', className)}>
            <div className="mb-4 p-4 bg-zinc-50 rounded-full">
                {icon || <Package className="w-12 h-12 opacity-20" />}
            </div>
            <p className="text-sm font-medium tracking-wide uppercase">{caption}</p>
        </div>
    );
}
