import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';

export interface EmptyStateProps {
    caption?: string;
    className?: string;
    icon?: React.ReactNode;
    actionName?: string;
    onAction?: () => void;
}

export default function EmptyState({
    caption = 'No data recorded',
    className,
    icon,
    actionName,
    onAction,
}: EmptyStateProps) {
    return (
        <div className={cn('flex flex-col items-center justify-center p-12 text-center text-zinc-400 bg-white rounded-xl border border-zinc-100 shadow-sm', className)}>
            <div className="mb-4">
                <div className="p-4 bg-zinc-50 rounded-full inline-block">
                  {icon || <Package className="w-12 h-12 opacity-20 text-[#4a907a]" />}
                </div>
            </div>
            <p className="text-sm font-semibold tracking-wide uppercase text-zinc-500 mb-6 max-w-[280px]">{caption}</p>
            {actionName && onAction && (
              <Button variant="primary" onClick={onAction} className="px-8 !h-10 bg-[#4a907a]/10 text-[#4a907a] hover:bg-[#4a907a] hover:text-white border-none text-[10px] uppercase font-black tracking-widest shadow-none">
                {actionName}
              </Button>
            )}
        </div>
    );
}
