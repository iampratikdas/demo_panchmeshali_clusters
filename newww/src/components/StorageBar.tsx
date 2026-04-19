import { HardDrive, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStorageInfo } from '../hooks/useWorkspaceFiles';

export function StorageBar() {
    const { data: storage, isLoading, refetch } = useStorageInfo();

    const formatMB = (mb: number): string => {
        if (mb < 1) return `${Math.round(mb * 1024)} KB`;
        return `${mb.toFixed(2)} MB`;
    };

    const getBarColor = (pct: number) => {
        if (pct >= 100) return 'bg-red-600';
        if (pct >= 80) return 'bg-red-500';
        if (pct >= 60) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getLabelColor = (pct: number) => {
        if (pct >= 80) return 'text-red-600';
        if (pct >= 60) return 'text-amber-600';
        return 'text-primary';
    };

    if (isLoading) {
        return (
            <div className="glass-card p-4 rounded-xl animate-pulse">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                    <div className="flex-1">
                        <div className="h-3 bg-gray-200 rounded w-16 mb-1" />
                        <div className="h-2 bg-gray-100 rounded w-24" />
                    </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full" />
            </div>
        );
    }

    if (!storage) {
        return (
            <div
                className="glass-card p-4 rounded-xl flex items-center gap-2 cursor-pointer text-sm text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => refetch()}
            >
                <RefreshCw className="h-4 w-4" />
                Reload storage
            </div>
        );
    }

    const pct = Math.min(storage.percentage, 100);

    return (
        <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <HardDrive className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold">Storage</h3>
                        <p className="text-xs text-muted-foreground">
                            {formatMB(storage.used_mb)} of {formatMB(storage.total_mb)} used
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className={cn('text-lg font-bold', getLabelColor(pct))}>
                        {pct}%
                    </p>
                </div>
            </div>

            {/* Progress bar */}
            <div className="relative w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={cn(
                        'h-full transition-all duration-500 ease-out rounded-full',
                        getBarColor(pct)
                    )}
                    style={{ width: `${pct}%` }}
                />
            </div>

            {/* Threshold labels */}
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>0 MB</span>
                <span className="font-semibold text-gray-500">{formatMB(storage.total_mb)} limit</span>
            </div>

            {/* Warning messages */}
            {pct >= 100 && (
                <div className="mt-2 flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs font-semibold text-red-700">
                    🚫 Storage limit reached! Upgrade to continue uploading.
                </div>
            )}
            {pct >= 80 && pct < 100 && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    ⚠️ {pct >= 90 ? 'Storage almost full!' : 'Storage running low'}
                </p>
            )}
        </div>
    );
}
