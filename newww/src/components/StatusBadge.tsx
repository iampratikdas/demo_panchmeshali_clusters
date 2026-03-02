import type { ContentStatus } from '../types/content';
import { Badge } from '../ui/badge';

interface StatusBadgeProps {
    status: ContentStatus;
}

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
        <Badge variant={getVariant()} className="transition-all">
            {status}
        </Badge>
    );
}
