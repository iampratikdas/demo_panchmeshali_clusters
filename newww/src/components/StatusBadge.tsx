import type { ContentStatus } from '../types/content';
import { Badge } from '../ui/badge';
import { motion } from 'framer-motion';

interface StatusBadgeProps {
    status: ContentStatus;
}

const STATUS_STYLES: Record<ContentStatus, string> = {
    Approved: 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-emerald-200/50',
    Rejected: 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-red-200/50',
    'Under Review': 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-amber-200/50',
    Submitted: 'bg-gradient-to-r from-slate-400 to-slate-500 text-white shadow-slate-200/50',
};

export function StatusBadge({ status }: StatusBadgeProps) {
    const getVariant = () => {
        switch (status) {
            case 'Approved':
                return 'success' as const;
            case 'Rejected':
                return 'destructive' as const;
            case 'Under Review':
                return 'warning' as const;
            default:
                return 'secondary' as const;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        >
            <Badge
                variant={getVariant()}
                className={`px-3 py-1 text-xs font-bold shadow-md border-0 ${STATUS_STYLES[status]}`}
            >
                {status}
            </Badge>
        </motion.div>
    );
}
