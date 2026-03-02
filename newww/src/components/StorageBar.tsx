import { useAtom } from 'jotai';
import { storageQuotaAtom } from '../store/atoms';
import { HardDrive } from 'lucide-react';
import { cn } from '../lib/utils';

export function StorageBar() {
    const [storage] = useAtom(storageQuotaAtom);

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const getColorClass = () => {
        if (storage.percentage >= 90) return 'bg-red-500';
        if (storage.percentage >= 70) return 'bg-yellow-500';
        return 'bg-green-500';
    };

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
                            {formatBytes(storage.used)} of {formatBytes(storage.total)} used
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold text-primary">{storage.percentage}%</p>
                </div>
            </div>

            <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={cn(
                        'h-full transition-all duration-500 ease-out rounded-full',
                        getColorClass()
                    )}
                    style={{ width: `${Math.min(storage.percentage, 100)}%` }}
                />
            </div>

            {storage.percentage >= 80 && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    ⚠️ {storage.percentage >= 90 ? 'Storage almost full!' : 'Storage running low'}
                </p>
            )}
        </div>
    );
}
