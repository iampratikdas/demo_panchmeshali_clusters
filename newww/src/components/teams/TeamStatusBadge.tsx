interface TeamStatusBadgeProps {
    status: 'Pending' | 'Accepted' | 'Rejected' | 'Cancelled';
    size?: 'sm' | 'md';
}

const config: Record<string, { label: string; cls: string; dot: string }> = {
    Pending: { label: 'Pending', cls: 'bg-amber-500/10 text-amber-500 border-amber-500/30', dot: 'bg-amber-500' },
    Accepted: { label: 'Active', cls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30', dot: 'bg-emerald-500' },
    Rejected: { label: 'Rejected', cls: 'bg-red-500/10 text-red-500 border-red-500/30', dot: 'bg-red-500' },
    Cancelled: { label: 'Left', cls: 'bg-muted text-muted-foreground border-border', dot: 'bg-muted-foreground' },
};

export function TeamStatusBadge({ status, size = 'sm' }: TeamStatusBadgeProps) {
    const cfg = config[status] ?? config['Pending'];
    const padding = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';
    return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${cfg.cls} ${padding}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot} animate-pulse`} />
            {cfg.label}
        </span>
    );
}
