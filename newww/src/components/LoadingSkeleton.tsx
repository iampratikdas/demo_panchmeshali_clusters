export function LoadingSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
                <div className="h-4 bg-muted rounded w-4/6"></div>
            </div>
        </div>
    );
}

export function CardSkeleton() {
    return (
        <div className="rounded-lg border bg-card p-6 animate-pulse">
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="h-6 bg-muted rounded w-1/3"></div>
                    <div className="h-5 bg-muted rounded w-20"></div>
                </div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
                <div className="flex gap-2 mt-4">
                    <div className="h-4 bg-muted rounded w-16"></div>
                    <div className="h-4 bg-muted rounded w-24"></div>
                </div>
            </div>
        </div>
    );
}
